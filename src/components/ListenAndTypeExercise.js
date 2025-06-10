import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { filterUserInput } from '../utils/contentFilter';

// ==============================================
// HELPER FUNCTIONS
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

  // Log the generated sequence for verification
  console.log('Generated test sequence:', testSentences.map(s => ({
    order: s.id,
    level: s.level,
    audio: s.audioFile,
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

// ==============================================
// MAIN COMPONENT
// ==============================================
function ListenAndTypeExercise({ onBack, onLogoClick }) {
  // State management
  const [currentSentence, setCurrentSentence] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [playCount, setPlayCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [contentFilterError, setContentFilterError] = useState(null);
  
  // Refs
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // Get current sentence data
  const currentData = testSentences[currentSentence] || null;

  // ==============================================
  // EFFECTS
  // ==============================================
  
  // Generate test sentences on mount
  useEffect(() => {
    const sentences = generateTestSentences();
    setTestSentences(sentences);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasStarted && !showResults) {
      handleNext();
    }
  }, [timeLeft, hasStarted, showResults]);

  // Audio event listeners
  useEffect(() => {
    if (!audioRef.current || !currentData) return;

    const audio = audioRef.current;
    
    const handleLoadError = () => {
      setAudioError(true);
      console.warn(`Audio file ${currentData.audioFile} not found`);
    };

    const handleCanPlay = () => setAudioError(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('error', handleLoadError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('error', handleLoadError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentData]);

  // Focus input when appropriate
  useEffect(() => {
    if (hasStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasStarted, currentSentence]);

  // Auto-play audio with delay
  useEffect(() => {
    if (hasStarted && currentData && !audioError && playCount === 0) {
      const autoPlayTimer = setTimeout(playAudio, 1000);
      return () => clearTimeout(autoPlayTimer);
    }
  }, [currentSentence, hasStarted, audioError, playCount]);

  // Handle Enter key press to submit answer
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && hasStarted && !showResults && userInput.trim() && !contentFilterError) {
        e.preventDefault();
        handleSubmit();
      }
    };

    if (hasStarted && !showResults) {
      document.addEventListener('keypress', handleKeyPress);
      return () => {
        document.removeEventListener('keypress', handleKeyPress);
      };
    }
  }, [hasStarted, showResults, userInput, contentFilterError]);

  // ==============================================
  // HANDLERS
  // ==============================================
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playAudio = () => {
    if (playCount >= 3 || !audioRef.current || audioError) return;
    
    setIsPlaying(true);
    audioRef.current.currentTime = 0;
    
    audioRef.current.play()
      .then(() => setPlayCount(prev => prev + 1))
      .catch(error => {
        console.error('Audio play error:', error);
        setAudioError(true);
        setIsPlaying(false);
      });
  };

  const startExercise = () => {
    setHasStarted(true);
    setTimeLeft(60);
  };

  // NEW: Content filter input handler
  const handleInputChange = (value) => {
    setUserInput(value);
    
    // Check content filter as user types
    if (value.trim().length > 0) {
      const filterResult = filterUserInput(value);
      if (!filterResult.isAllowed) {
        setContentFilterError(filterResult.error);
      } else {
        setContentFilterError(null);
      }
    } else {
      setContentFilterError(null);
    }
  };

  // UPDATED: Submit handler with content filter
  const handleSubmit = () => {
    if (!currentData || !userInput.trim()) return;

    // Check content filter before processing
    const filterResult = filterUserInput(userInput);
    
    if (!filterResult.isAllowed) {
      setContentFilterError(filterResult.error);
      return; // Stop here - don't process inappropriate content
    }

    // Clear any filter errors and continue normally
    setContentFilterError(null);
    handleNext();
  };

  const handleNext = () => {
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
      setPlayCount(0);
      setIsPlaying(false);
      setContentFilterError(null); // Clear content filter error
    } else {
      // Test completed
      setShowResults(true);
    }
  };

  const calculateScore = () => {
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
  };

  const restartTest = () => {
    setCurrentSentence(0);
    setUserInput('');
    setTimeLeft(60);
    setPlayCount(0);
    setShowResults(false);
    setAnswers([]);
    setIsPlaying(false);
    setHasStarted(false);
    setAudioError(false);
    setContentFilterError(null);
    
    // Generate new random sentences in proper order
    const newSentences = generateTestSentences();
    setTestSentences(newSentences);
  };

  // ==============================================
  // RENDER HELPER FUNCTIONS
  // ==============================================
  
  const getResultDisplay = (result) => {
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
  };

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
            <audio ref={audioRef} preload="auto" key={currentData?.audioFile}>
              <source src={`/${currentData?.audioFile}`} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            
            <div className="audio-controls">
              <button 
                className={`play-btn ${isPlaying ? 'playing' : ''}`}
                onClick={playAudio}
                disabled={playCount >= 3 || isPlaying}
              >
                <span className="play-icon">
                  {isPlaying ? '🔊' : '▶️'}
                </span>
                <span className="play-text">
                  {isPlaying ? 'Playing...' : 'Play Audio'}
                </span>
              </button>
              
              <div className="play-counter">
                Plays remaining: {3 - playCount}
              </div>
            </div>

            {audioError && (
              <div className="audio-error">
                ⚠️ Audio file not found: {currentData?.audioFile}
                <br />
                <small>Please ensure the file exists in the public/audio/listen-and-type/ folder</small>
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
              onClick={handleNext}
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
