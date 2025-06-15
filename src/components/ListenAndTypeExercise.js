import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { recordTestResult } from '../utils/progressDataManager';

// ==============================================
// HELPER FUNCTIONS - Moved outside component for efficiency
// ==============================================

// Generate test sentences in proper order: A2 → B1 → B2 → C1
const generateTestSentences = () => {
  const testSentences = [];
  let sentenceCounter = 1;

  // Process each level in the correct order
  TEST_STRUCTURE.forEach(({ level, count }) => {
    // Create a copy and shuffle only within this level
    const availableSentences = [...SENTENCE_POOLS[level]];
    
    // Fisher-Yates shuffle for randomness within the level
    for (let i = availableSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSentences[i], availableSentences[j]] = [availableSentences[j], availableSentences[i]];
    }
    
    // Take the required number of sentences from this level
    for (let i = 0; i < count && i < availableSentences.length; i++) {
      const selectedSentence = availableSentences[i];
      
      testSentences.push({
        id: sentenceCounter,
        level: level,
        audioFile: selectedSentence.audioFile,
        correctText: selectedSentence.correctText,
        difficulty: selectedSentence.difficulty
      });
      
      sentenceCounter++;
    }
  });

  console.log('Generated test sequence:', testSentences.map(s => ({
    order: s.id,
    level: s.level,
    preview: s.correctText.substring(0, 25) + '...'
  })));

  return testSentences;
};

// Basic text normalisation
const normaliseText = (text) => {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Levenshtein distance calculation
const getLevenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Check similarity between strings
const isCloseMatch = (userText, correctText, threshold = 0.85) => {
  const distance = getLevenshteinDistance(userText, correctText);
  const maxLength = Math.max(userText.length, correctText.length);
  if (maxLength === 0) return true;
  const similarity = 1 - (distance / maxLength);
  return similarity >= threshold;
};

// Advanced normalisation with contractions and spelling variants
const normaliseForComparison = (text) => {
  let normalised = normaliseText(text);
  
  // Handle number variations
  const numberMap = {
    'three': '3', 'seven': '7', 'one': '1', 'two': '2', 'four': '4',
    'five': '5', 'six': '6', 'eight': '8', 'nine': '9', 'ten': '10'
  };
  
  Object.entries(numberMap).forEach(([word, digit]) => {
    normalised = normalised.replace(new RegExp(`\\b(${word}|${digit})\\b`, 'g'), word);
  });
  
  // Handle British/American spelling differences
  const spellingMap = {
    'cancelled': 'canceled', 'criticised': 'criticized',
    'colour': 'color', 'centre': 'center', 'realise': 'realize',
    'organise': 'organize', 'analyse': 'analyze'
  };
  
  Object.entries(spellingMap).forEach(([british, american]) => {
    normalised = normalised.replace(new RegExp(`\\b${british}\\b`, 'g'), american);
  });
  
  // Handle contractions - expand them to full forms
  const contractionMap = {
    'shes|she s': 'she is',
    'cant|can t': 'can not',
    'dont|do nt': 'do not',
    'theres|there s': 'there is',
    'ive|i ve': 'i have',
    'doesnt|does nt': 'does not',
    'well|we ll': 'we will',
    'wasnt|was nt': 'was not',
    'id|i d': 'i would',
    'werent|were nt': 'were not',
    'couldnt|could nt': 'could not',
    'didnt|did nt': 'did not',
    'wouldve|would ve': 'would have',
    'shouldve|should ve': 'should have',
    'couldve|could ve': 'could have',
    'mightve|might ve': 'might have',
    'mustve|must ve': 'must have',
    'theyre|they re': 'they are',
    'youre|you re': 'you are',
    'were|we re': 'we are'
  };
  
  Object.entries(contractionMap).forEach(([contractions, expanded]) => {
    normalised = normalised.replace(new RegExp(`\\b(${contractions})\\b`, 'g'), expanded);
  });
  
  return normalised;
};

// Advanced word alignment using dynamic programming
const alignWords = (userWords, correctWords) => {
  const m = userWords.length;
  const n = correctWords.length;
  
  // Create DP table for alignment scores
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  const operations = Array(m + 1).fill(null).map(() => Array(n + 1).fill(''));
  
  // Initialise base cases
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
    operations[i][0] = 'delete';
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
    operations[0][j] = 'insert';
  }
  
  // Fill the DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const userWord = normaliseText(userWords[i - 1]);
      const correctWord = normaliseText(correctWords[j - 1]);
      
      let matchCost = 0;
      if (userWord !== correctWord) {
        // Check if it's a close match (spelling error)
        if (isCloseMatch(userWord, correctWord, 0.7)) {
          matchCost = 0.5; // Small penalty for close matches
        } else {
          matchCost = 1; // Full penalty for wrong words
        }
      }
      
      const substituteCost = dp[i - 1][j - 1] + matchCost;
      const deleteCost = dp[i - 1][j] + 1;
      const insertCost = dp[i][j - 1] + 1;
      
      if (substituteCost <= deleteCost && substituteCost <= insertCost) {
        dp[i][j] = substituteCost;
        operations[i][j] = matchCost === 0 ? 'match' : (matchCost === 0.5 ? 'close' : 'substitute');
      } else if (deleteCost <= insertCost) {
        dp[i][j] = deleteCost;
        operations[i][j] = 'delete';
      } else {
        dp[i][j] = insertCost;
        operations[i][j] = 'insert';
      }
    }
  }
  
  // Backtrack to find the alignment
  const alignment = [];
  let i = m, j = n;
  
  while (i > 0 || j > 0) {
    const operation = operations[i][j];
    
    if (operation === 'match') {
      alignment.unshift({
        type: 'correct',
        userWord: userWords[i - 1],
        correctWord: correctWords[j - 1],
        userIndex: i - 1,
        correctIndex: j - 1
      });
      i--; j--;
    } else if (operation === 'close') {
      alignment.unshift({
        type: 'close',
        userWord: userWords[i - 1],
        correctWord: correctWords[j - 1],
        userIndex: i - 1,
        correctIndex: j - 1
      });
      i--; j--;
    } else if (operation === 'substitute') {
      alignment.unshift({
        type: 'wrong',
        userWord: userWords[i - 1],
        correctWord: correctWords[j - 1],
        userIndex: i - 1,
        correctIndex: j - 1
      });
      i--; j--;
    } else if (operation === 'delete') {
      alignment.unshift({
        type: 'extra',
        userWord: userWords[i - 1],
        correctWord: null,
        userIndex: i - 1,
        correctIndex: null
      });
      i--;
    } else if (operation === 'insert') {
      alignment.unshift({
        type: 'missing',
        userWord: null,
        correctWord: correctWords[j - 1],
        userIndex: null,
        correctIndex: j - 1
      });
      j--;
    }
  }
  
  return alignment;
};

// Generate highlighting using proper sequence alignment
const generateHighlights = (originalUserInput, originalCorrectText) => {
  // First normalise both texts for contraction handling
  const userNormalised = normaliseForComparison(originalUserInput);
  const correctNormalised = normaliseForComparison(originalCorrectText);
  
  const userWords = userNormalised.trim().split(/\s+/).filter(w => w.length > 0);
  const correctWords = correctNormalised.trim().split(/\s+/).filter(w => w.length > 0);
  
  // Get the optimal alignment
  const alignment = alignWords(userWords, correctWords);
  
  // Convert alignment to highlight format
  const highlighted = alignment.map(item => {
    switch (item.type) {
      case 'correct':
        return {
          type: 'correct',
          text: item.userWord,
          userText: item.userWord,
          correctText: item.correctWord
        };
      case 'close':
        return {
          type: 'close',
          text: item.userWord,
          userText: item.userWord,
          correctText: item.correctWord
        };
      case 'wrong':
        return {
          type: 'wrong',
          text: item.userWord,
          userText: item.userWord,
          correctText: item.correctWord
        };
      case 'extra':
        return {
          type: 'extra',
          text: item.userWord,
          userText: item.userWord,
          correctText: ''
        };
      case 'missing':
        return {
          type: 'missing',
          text: `[${item.correctWord}]`,
          userText: '',
          correctText: item.correctWord
        };
      default:
        return {
          type: 'wrong',
          text: item.userWord || `[${item.correctWord}]`,
          userText: item.userWord || '',
          correctText: item.correctWord || ''
        };
    }
  });
  
  return highlighted;
};

// Main answer checking function
const checkAnswer = (userInput, correctText) => {
  const userNormalised = normaliseForComparison(userInput);
  const correctNormalised = normaliseForComparison(correctText);
  
  // Perfect match
  if (userNormalised === correctNormalised) {
    return { type: 'perfect', score: 1.0, highlights: null };
  }
  
  // Generate highlights for imperfect answers
  const highlights = generateHighlights(userInput, correctText);
  
  // Close match (minor spelling errors)
  if (isCloseMatch(userNormalised, correctNormalised, 0.85)) {
    return { type: 'close', score: 0.8, highlights: highlights };
  }
  
  // Partial match (some words correct)
  const userWords = userNormalised.split(' ');
  const correctWords = correctNormalised.split(' ');
  const matchingWords = userWords.filter(word => correctWords.includes(word));
  const partialScore = matchingWords.length / correctWords.length;
  
  if (partialScore >= 0.5) {
    return { type: 'partial', score: partialScore * 0.5, highlights: highlights };
  }
  
  // Incorrect
  return { type: 'incorrect', score: 0, highlights: highlights };
};

// Simple content filter (less strict than original)
const checkBasicContentFilter = (text) => {
  if (!text || typeof text !== 'string') return { isAllowed: true, error: null };
  
  // Only block extremely obvious inappropriate content
  const obviouslyInappropriate = ['fuck', 'shit', 'bitch', 'damn'].some(word => 
    text.toLowerCase().includes(word)
  );
  
  if (obviouslyInappropriate) {
    return {
      isAllowed: false,
      error: {
        title: 'Language Filter Active',
        message: 'Please use appropriate language for this educational exercise.',
        severity: 'medium'
      }
    };
  }
  
  return { isAllowed: true, error: null };
};

// ==============================================
// MAIN COMPONENT - COMPLETELY REWRITTEN
// ==============================================
function ListenAndTypeExercise({ onBack, onLogoClick }) {
  // Core state
  const [currentSentence, setCurrentSentence] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [contentFilterError, setContentFilterError] = useState(null);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  
  // NEW: Separated audio state management for better control
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    playCount: 0,
    hasError: false,
    isLoaded: false
  });
  
  // Refs
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // Current sentence data
  const currentData = useMemo(() => testSentences[currentSentence] || null, [testSentences, currentSentence]);

  // ==============================================
  // AUDIO MANAGEMENT - COMPLETELY REWRITTEN
  // ==============================================
  
  // NEW: Reset audio state completely
  const resetAudioState = useCallback(() => {
    console.log('🔄 Resetting audio state');
    setAudioState({
      isPlaying: false,
      playCount: 0,
      hasError: false,
      isLoaded: false
    });
  }, []);

  // NEW: Update only specific audio state properties
  const updateAudioState = useCallback((updates) => {
    setAudioState(prev => {
      const newState = { ...prev, ...updates };
      console.log('🎵 Audio state update:', updates, '→ New state:', newState);
      return newState;
    });
  }, []);

  // NEW: Play audio function with enhanced first question support
  const playAudio = useCallback(() => {
    console.log('🎯 Play audio requested');
    console.log('Current audio state:', audioState);
    
    if (!audioRef.current || !currentData) {
      console.log('❌ No audio ref or current data');
      return;
    }
    
    if (audioState.playCount >= 3) {
      console.log('❌ Play count limit reached');
      return;
    }
    
    if (audioState.hasError) {
      console.log('❌ Audio has error');
      return;
    }
    
    if (audioState.isPlaying) {
      console.log('❌ Audio already playing');
      return;
    }

    console.log('✅ Starting audio playback');
    
    // Set playing state immediately
    updateAudioState({ isPlaying: true });
    
    const audio = audioRef.current;
    audio.currentTime = 0;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('✅ Audio play promise resolved');
          updateAudioState({ playCount: audioState.playCount + 1 });
        })
        .catch(error => {
          console.error('❌ Audio play promise rejected:', error);
          updateAudioState({ 
            isPlaying: false, 
            hasError: true 
          });
        });
    } else {
      // Fallback for browsers that don't return a promise
      updateAudioState({ playCount: audioState.playCount + 1 });
      
      // Fallback timeout to reset playing state if needed
      setTimeout(() => {
        if (audio.paused || audio.ended) {
          console.log('⏰ Fallback: Resetting playing state');
          updateAudioState({ isPlaying: false });
        }
      }, 2000);
    }
  }, [audioState, currentData, updateAudioState]);

  // ==============================================
  // OTHER HANDLERS
  // ==============================================
  
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startExercise = useCallback(() => {
    console.log('🚀 Starting exercise');
    setHasStarted(true);
    setTimeLeft(60);
    setExerciseStartTime(Date.now());
    resetAudioState();
  }, [resetAudioState]);

  const handleInputChange = useCallback((value) => {
    setUserInput(value);
    
    // Simple content filter check
    if (value.trim().length > 0) {
      const filterResult = checkBasicContentFilter(value);
      setContentFilterError(filterResult.isAllowed ? null : filterResult.error);
    } else {
      setContentFilterError(null);
    }
  }, []);

  const moveToNextQuestion = useCallback(() => {
    console.log('➡️ Moving to next question');
    
    if (!currentData) return;

    const result = checkAnswer(userInput, currentData.correctText);
    
    setAnswers(prev => [...prev, {
      sentence: currentData,
      userInput: userInput.trim(),
      result: result,
      correct: result.type === 'perfect',
      close: result.type === 'close',
      partial: result.type === 'partial',
      timeTaken: 60 - timeLeft
    }]);

    if (currentSentence + 1 < testSentences.length) {
      // Move to next sentence
      setCurrentSentence(prev => prev + 1);
      setUserInput('');
      setTimeLeft(60);
      setContentFilterError(null);
      resetAudioState(); // Complete audio state reset
    } else {
      // Test completed - record progress
      finishExercise([...answers, {
        sentence: currentData,
        userInput: userInput.trim(),
        result: result,
        correct: result.type === 'perfect',
        close: result.type === 'close',
        partial: result.type === 'partial',
        timeTaken: 60 - timeLeft
      }]);
    }
  }, [currentData, userInput, timeLeft, currentSentence, testSentences.length, resetAudioState, answers]);

  const handleSubmit = useCallback(() => {
    console.log('📤 Submit button clicked');
    
    if (!currentData || !userInput.trim()) {
      console.log('❌ No current data or empty input');
      return;
    }

    if (contentFilterError) {
      console.log('❌ Content filter error present');
      return;
    }

    console.log('✅ Processing answer...');
    moveToNextQuestion();
  }, [currentData, userInput, contentFilterError, moveToNextQuestion]);

  // UPDATED: Enhanced finish exercise function with daily progress tracking
  const finishExercise = useCallback((finalAnswers) => {
    console.log('🏁 Finishing Listen and Type exercise');
    
    const testDuration = exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 1000) : 0;
    const totalScore = finalAnswers.reduce((sum, answer) => sum + answer.result.score, 0);
    const averageScore = finalAnswers.length > 0 ? totalScore / finalAnswers.length : 0;
    
    // Convert to 0-10 scale for consistency with other exercises
    const scoreOutOf10 = Math.round(averageScore * 10);
    
    try {
      // Prepare user answers for progress tracking
      const formattedAnswers = finalAnswers.map(answer => ({
        answer: answer.userInput || '',
        correct: answer.result.type === 'perfect',
        score: Math.round(answer.result.score * 100), // Convert to percentage
        level: answer.sentence.level || 'B1'
      }));

      // FIXED: Record test result with proper quiz type - this automatically increments daily targets
      recordTestResult({
        quizType: 'listen-and-type', // This matches the exercise type in LandingPage.js
        score: scoreOutOf10,
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: testDuration,
        userAnswers: formattedAnswers
      });
      
      console.log(`✅ Listen and Type test result recorded: ${scoreOutOf10}/10 (${Math.round(averageScore * 100)}%)`);
      console.log('📊 Daily target should now be incremented for listen-and-type');
    } catch (error) {
      console.error('❌ Error recording test result:', error);
    }

    setShowResults(true);
  }, [exerciseStartTime]);

  const calculateScore = useCallback(() => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.result.score, 0);
    const maxScore = answers.length;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    const perfect = answers.filter(a => a.result.type === 'perfect').length;
    const close = answers.filter(a => a.result.type === 'close').length;
    const partial = answers.filter(a => a.result.type === 'partial').length;
    const incorrect = answers.filter(a => a.result.type === 'incorrect').length;
    
    return { 
      totalScore: Math.round(totalScore * 10) / 10,
      maxScore, 
      percentage,
      perfect,
      close,
      partial,
      incorrect
    };
  }, [answers]);

  const restartTest = useCallback(() => {
    console.log('🔄 Restarting test');
    setCurrentSentence(0);
    setUserInput('');
    setTimeLeft(60);
    setShowResults(false);
    setAnswers([]);
    setHasStarted(false);
    setContentFilterError(null);
    setExerciseStartTime(null);
    resetAudioState();
    
    // Generate new random sentences
    const newSentences = generateTestSentences();
    setTestSentences(newSentences);
  }, [resetAudioState]);

  const getResultDisplay = useCallback((result) => {
    switch(result.type) {
      case 'perfect':
        return { emoji: '💯', label: 'Perfect!', className: 'perfect' };
      case 'close':
        return { emoji: '✨', label: 'Very Close!', className: 'close' };
      case 'partial':
        return { emoji: '👍', label: 'Partial Credit', className: 'partial' };
      default:
        return { emoji: '❌', label: 'Incorrect', className: 'incorrect' };
    }
  }, []);

  // ==============================================
  // EFFECTS - REWRITTEN WITH BETTER LOGIC
  // ==============================================
  
  // Generate test sentences on mount
  useEffect(() => {
    console.log('🎲 Component mounted, generating test sentences');
    const sentences = generateTestSentences();
    setTestSentences(sentences);
  }, []);

  // Timer countdown - FIXED: No dependencies that cause interference
  useEffect(() => {
    if (!hasStarted || showResults || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime === 0) {
          // Timer expired - move to next question
          setTimeout(() => moveToNextQuestion(), 100);
        }
        return newTime;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasStarted, showResults, timeLeft]); // Minimal dependencies

  // FIXED: Audio element management - Proper event listener setup for first question
  useEffect(() => {
    if (!audioRef.current || !currentData) return;

    console.log('🎵 Setting up audio for:', currentData.audioFile);
    const audio = audioRef.current;
    
    // CRITICAL: Reset state immediately when audio element changes
    resetAudioState();
    
    // Define all event handlers
    const handlers = {
      loadstart: () => {
        console.log('🔄 Audio loadstart');
        updateAudioState({ isLoaded: false, isPlaying: false, hasError: false });
      },
      
      loadeddata: () => {
        console.log('✅ Audio loadeddata');
        updateAudioState({ isLoaded: true, hasError: false });
      },
      
      canplay: () => {
        console.log('✅ Audio canplay');
        updateAudioState({ isLoaded: true, hasError: false });
      },
      
      play: () => {
        console.log('▶️ Audio play event');
        updateAudioState({ isPlaying: true });
      },
      
      pause: () => {
        console.log('⏸️ Audio pause event');
        updateAudioState({ isPlaying: false });
      },
      
      ended: () => {
        console.log('⏹️ Audio ended event');
        updateAudioState({ isPlaying: false });
      },
      
      error: (e) => {
        console.error('❌ Audio error event:', e);
        updateAudioState({ 
          isPlaying: false, 
          hasError: true,
          isLoaded: false 
        });
      }
    };

    // Add all event listeners IMMEDIATELY (no delay)
    Object.entries(handlers).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    console.log('🎧 Event listeners attached for:', currentData.audioFile);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up event listeners for:', currentData?.audioFile || 'unknown');
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, [currentData, resetAudioState, updateAudioState]);

  // Removed the backup auto-play effect since it's causing conflicts
  // The main auto-play effect should handle everything

  // FIXED: Simplified auto-play logic without complex timing issues
  useEffect(() => {
    // Only auto-play if:
    // - Exercise has started
    // - We have current data
    // - Haven't played this audio yet
    // - Not currently playing
    if (!hasStarted || 
        !currentData || 
        audioState.playCount > 0 || 
        audioState.isPlaying) {
      return;
    }

    console.log('⏰ Setting up auto-play timer for question', currentSentence + 1);
    console.log('Audio state for auto-play:', audioState);
    
    // Simple auto-play with consistent timing for all questions
    const autoPlayTimer = setTimeout(() => {
      console.log('🎯 Auto-play timer triggered for question', currentSentence + 1);
      
      if (audioState.hasError) {
        console.log('❌ Audio has error, skipping auto-play');
        return;
      }
      
      // Check if we still haven't played and aren't currently playing
      if (audioState.playCount === 0 && !audioState.isPlaying) {
        playAudio();
      }
    }, 1500); // Consistent 1.5 second delay for all questions

    return () => {
      console.log('❌ Clearing auto-play timer');
      clearTimeout(autoPlayTimer);
    };
  }, [hasStarted, currentData, audioState.playCount, audioState.isPlaying, audioState.hasError, currentSentence, playAudio]);

  // Focus input when appropriate
  useEffect(() => {
    if (hasStarted && inputRef.current && !showResults) {
      inputRef.current.focus();
    }
  }, [hasStarted, currentSentence, showResults]);

  // Enter key handler
  useEffect(() => {
    if (!hasStarted || showResults) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && userInput.trim() && !contentFilterError) {
        e.preventDefault();
        console.log('⌨️ Enter key pressed - submitting');
        handleSubmit();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [hasStarted, showResults, userInput, contentFilterError, handleSubmit]);

  // ==============================================
  // RENDER CONDITIONS
  // ==============================================

  // Loading state
  if (testSentences.length === 0) {
    return (
      <div className="listen-type-container">
        <div className="listen-type-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎧 Listen and Type</h1>
          
          <div className="loading-message">
            <p>🎲 Generating your test...</p>
            <p><small>Preparing sentences in difficulty order: A2 → B1 → B2 → C1</small></p>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Results state
  if (showResults) {
    const score = calculateScore();

    return (
      <div className="listen-type-container">
        <div className="listen-type-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎧 Listen and Type Results</h1>
          
          <div className="results">
            <h2>🎉 Test Complete!</h2>
            <div className="score-display">{score.totalScore}/{score.maxScore}</div>
            <div className="score-percentage">({score.percentage}%)</div>
            
            <div className="score-breakdown">
              <div className="breakdown-item perfect">
                <span className="breakdown-icon">💯</span>
                <span className="breakdown-count">{score.perfect}</span>
                <span className="breakdown-label">Perfect</span>
              </div>
              <div className="breakdown-item close">
                <span className="breakdown-icon">✨</span>
                <span className="breakdown-count">{score.close}</span>
                <span className="breakdown-label">Close</span>
              </div>
              <div className="breakdown-item partial">
                <span className="breakdown-icon">👍</span>
                <span className="breakdown-count">{score.partial}</span>
                <span className="breakdown-label">Partial</span>
              </div>
              <div className="breakdown-item incorrect">
                <span className="breakdown-icon">❌</span>
                <span className="breakdown-count">{score.incorrect}</span>
                <span className="breakdown-label">Incorrect</span>
              </div>
            </div>
            
            <div className="level-estimate">
              <h3>Listening and Typing Skills</h3>
              <p>
                {score.percentage >= 90 ? "Outstanding! You have excellent listening and typing accuracy." :
                 score.percentage >= 75 ? "Great work! Your listening comprehension is very strong." :
                 score.percentage >= 60 ? "Good effort! Keep practising to improve your listening skills." :
                 "Keep working on your listening and spelling. Practice will help!"}
              </p>
            </div>

            <div className="detailed-results">
              <h3>📝 Detailed Results:</h3>
              <div className="results-list">
                {answers.map((answer, index) => {
                  const display = getResultDisplay(answer.result);
                  
                  return (
                    <div key={index} className={`result-item ${display.className}`}>
                      <div className="result-header">
                        <span className="result-emoji">{display.emoji}</span>
                        <span className="result-level">{answer.sentence.level}</span>
                        <span className="result-number">#{index + 1}</span>
                      </div>
                      <div className="result-content">
                        <div className="result-status">
                          <strong>{display.label}</strong>
                          {answer.result.type === 'close' && (
                            <small> (Minor spelling errors - still great job!)</small>
                          )}
                          {answer.result.type === 'partial' && (
                            <small> (Got some words right - keep going!)</small>
                          )}
                        </div>
                        <div className="correct-text">
                          <strong>Correct:</strong> "{answer.sentence.correctText}"
                        </div>
                        {(answer.result.type !== 'perfect') && (
                          <div className="user-answer-analysis">
                            <strong>Your answer:</strong>
                            <div className="highlighted-answer">
                              {answer.result.highlights?.map((highlight, idx) => (
                                <span
                                  key={idx}
                                  className={`highlight-word ${highlight.type}`}
                                  title={
                                    highlight.type === 'missing' ? `Missing: "${highlight.correctText}"` :
                                    highlight.type === 'extra' ? `Extra word: "${highlight.userText}"` :
                                    highlight.type === 'wrong' ? `Should be: "${highlight.correctText}"` :
                                    highlight.type === 'close' ? `Close! Should be: "${highlight.correctText}"` :
                                    'Correct'
                                  }
                                >
                                  {highlight.text}
                                </span>
                              )) || (
                                <span className="highlight-word wrong">
                                  {answer.userInput || '(no answer)'}
                                </span>
                              )}
                            </div>
                            <div className="highlight-legend">
                              <small>
                                <span className="legend-item">
                                  <span className="legend-color correct"></span> Correct
                                </span>
                                <span className="legend-item">
                                  <span className="legend-color close"></span> Close
                                </span>
                                <span className="legend-item">
                                  <span className="legend-color wrong"></span> Wrong
                                </span>
                                <span className="legend-item">
                                  <span className="legend-color missing"></span> Missing
                                </span>
                                <span className="legend-item">
                                  <span className="legend-color extra"></span> Extra
                                </span>
                              </small>
                            </div>
                          </div>
                        )}
                        <div className="time-taken">
                          Time taken: {answer.timeTaken} seconds
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={restartTest}>
                🔄 Try Again
              </button>
              <button className="btn btn-secondary" onClick={onBack}>
                ← Back to Exercises
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Instructions state
  if (!hasStarted) {
    return (
      <div className="listen-type-container">
        <div className="listen-type-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎧 Listen and Type</h1>
          
          <div className="instructions-container">
            <div className="instruction-content">
              <h3>📋 Instructions</h3>
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="instruction-icon">🎵</span>
                  <span>Listen carefully to the audio sentence</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">✍️</span>
                  <span>Type exactly what you hear</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🔁</span>
                  <span>You can replay each audio up to 3 times</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⏱️</span>
                  <span>You have 1 minute per sentence</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">✅</span>
                  <span>Type what you hear - spelling variations accepted</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🔢</span>
                  <span>Numbers can be written as words (three) or digits (3)</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🌍</span>
                  <span>Both British and American spellings accepted</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">❌</span>
                  <span>Punctuation (including apostrophes) not required</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🛡️</span>
                  <span>Keep responses appropriate for educational purposes</span>
                </div>
              </div>
              
              <div className="difficulty-info">
                <h4>📊 Test Structure</h4>
                <p>Structured progression through difficulty levels:</p>
                <ul>
                  <li>2 A2 level sentences (elementary) - <strong>First</strong></li>
                  <li>3 B1 level sentences (intermediate) - <strong>Second</strong></li>
                  <li>3 B2 level sentences (upper-intermediate) - <strong>Third</strong></li>
                  <li>2 C1 level sentences (advanced) - <strong>Final</strong></li>
                </ul>
                <p style={{ fontSize: '0.9em', fontStyle: 'italic', marginTop: '10px' }}>
                  The test gets progressively harder as you go through!
                </p>
              </div>
            </div>
            
            <button className="btn btn-primary btn-large" onClick={startExercise}>
              🎧 Start Listening Exercise
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Main test interface
  return (
    <div className="listen-type-container">
      <div className="listen-type-quiz-container">
        <div className="listen-header">
          <div className="timer-section">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text" style={{ color: timeLeft <= 10 ? '#e53e3e' : '#4c51bf' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="progress-section">
            Question {currentSentence + 1} of {testSentences.length}
          </div>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>

        <div className="listen-main">
          <div className="level-indicator">
            <span className="level-badge">{currentData?.level}</span>
            <span className="level-description">{currentData?.difficulty}</span>
          </div>

          <div className="audio-section">
            <audio ref={audioRef} preload="auto" key={`${currentData?.audioFile}-${currentSentence}`}>
              <source src={`/${currentData?.audioFile}`} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            
            <div className="audio-controls">
              <button 
                className={`play-btn ${audioState.isPlaying ? 'playing' : ''}`}
                onClick={playAudio}
                disabled={audioState.playCount >= 3 || audioState.isPlaying || audioState.hasError}
              >
                <span className="play-icon">
                  {audioState.isPlaying ? '🔊' : '▶️'}
                </span>
                <span className="play-text">
                  {audioState.isPlaying ? 'Playing...' : 'Play Audio'}
                </span>
              </button>
              
              <div className="play-counter">
                Plays remaining: {3 - audioState.playCount}
              </div>
            </div>

            {audioState.hasError && (
              <div className="audio-error">
                ⚠️ Audio file not found: {currentData?.audioFile}
                <br />
                <small>Please ensure the file exists in the public/audio/listen-and-type/ folder</small>
              </div>
            )}

            {/* Debug info (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ 
                fontSize: '0.8em', 
                color: '#666', 
                marginTop: '10px',
                padding: '8px',
                background: '#f0f0f0',
                borderRadius: '4px'
              }}>
                🐛 Audio Debug: Playing: {audioState.isPlaying ? 'Yes' : 'No'} | 
                Loaded: {audioState.isLoaded ? 'Yes' : 'No'} | 
                Error: {audioState.hasError ? 'Yes' : 'No'} | 
                Plays: {audioState.playCount}/3
              </div>
            )}
          </div>

          <div className="input-section">
            <h3>Type what you hear:</h3>
            <textarea
              ref={inputRef}
              className={`typing-input ${contentFilterError ? 'error' : ''}`}
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type the sentence here..."
              rows={3}
            />

            {/* Content Filter Error Display */}
            {contentFilterError && (
              <div className={`content-filter-error ${contentFilterError.severity}`}>
                <div className="filter-error-icon">⚠️</div>
                <div className="filter-error-content">
                  <div className="filter-error-title">{contentFilterError.title}</div>
                  <div className="filter-error-message">{contentFilterError.message}</div>
                </div>
              </div>
            )}
            
            <div className="input-info">
              <p>💡 <strong>Remember:</strong> Just type what you hear - spelling variations, numbers as words/digits, and missing punctuation are all fine!</p>
            </div>

            <div className="submit-section">
              <button 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!userInput.trim() || contentFilterError}
              >
                Submit Answer
              </button>
              <p className="keyboard-hint">
                <small>💻 Press <strong>Enter</strong> to submit on desktop</small>
              </p>
            </div>
          </div>

          <div className="navigation-section">
            <button 
              className="btn btn-secondary"
              onClick={moveToNextQuestion}
            >
              {currentSentence + 1 === testSentences.length ? 'Finish Test' : 'Skip Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListenAndTypeExercise;
