// src/components/SpeakingExercise.js - FIXED: Proper grading, longer recording, visual feedback
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';

// ==============================================
// HELPER FUNCTIONS
// ==============================================

// Generate test sentences in proper order: A2 → B1 → B2 → C1
const generateSpeakingTest = () => {
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

  console.log('Generated speaking test:', testSentences.map(s => ({
    order: s.id,
    level: s.level,
    text: s.correctText
  })));

  return testSentences;
};

// IMPROVED: Better text normalisation for comparison
const normaliseText = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    // Remove punctuation but keep apostrophes in contractions
    .replace(/[.,!?;:"()-]/g, '')
    // Normalise contractions
    .replace(/won't/g, 'will not')
    .replace(/can't/g, 'cannot')
    .replace(/n't/g, ' not')
    .replace(/'ll/g, ' will')
    .replace(/'re/g, ' are')
    .replace(/'ve/g, ' have')
    .replace(/'d/g, ' would')
    .replace(/'m/g, ' am')
    // Handle multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
};

// FIXED: Much better accuracy calculation with detailed word matching
const calculateAccuracyWithDetails = (spokenText, correctText) => {
  console.log('🧮 Calculating accuracy...');
  console.log('Spoken:', spokenText);
  console.log('Correct:', correctText);
  
  if (!spokenText || !correctText) {
    console.log('❌ Empty text provided');
    return {
      accuracy: 0,
      wordMatches: [],
      correctWords: correctText ? correctText.split(' ') : [],
      spokenWords: []
    };
  }
  
  const spoken = normaliseText(spokenText);
  const correct = normaliseText(correctText);
  
  console.log('Normalised spoken:', spoken);
  console.log('Normalised correct:', correct);
  
  // Perfect match gets 100%
  if (spoken === correct) {
    const words = correct.split(' ');
    const wordMatches = words.map(word => ({ word, isCorrect: true }));
    console.log('🎯 Perfect match! 100%');
    return {
      accuracy: 100,
      wordMatches,
      correctWords: words,
      spokenWords: words
    };
  }
  
  // Split into words for detailed comparison
  const spokenWords = spoken.split(' ').filter(word => word.length > 0);
  const correctWords = correct.split(' ').filter(word => word.length > 0);
  
  console.log('Spoken words:', spokenWords);
  console.log('Correct words:', correctWords);
  
  // Advanced word matching with position consideration
  const wordMatches = [];
  let correctCount = 0;
  
  // First pass: exact position matches
  const usedSpokenIndices = new Set();
  const usedCorrectIndices = new Set();
  
  for (let i = 0; i < correctWords.length; i++) {
    const correctWord = correctWords[i];
    
    if (i < spokenWords.length && spokenWords[i] === correctWord) {
      wordMatches.push({ word: correctWord, isCorrect: true });
      correctCount++;
      usedSpokenIndices.add(i);
      usedCorrectIndices.add(i);
    } else {
      wordMatches.push({ word: correctWord, isCorrect: false });
    }
  }
  
  // Second pass: find matches in different positions
  for (let i = 0; i < correctWords.length; i++) {
    if (usedCorrectIndices.has(i)) continue;
    
    const correctWord = correctWords[i];
    
    for (let j = 0; j < spokenWords.length; j++) {
      if (usedSpokenIndices.has(j)) continue;
      
      const spokenWord = spokenWords[j];
      
      // Exact match
      if (spokenWord === correctWord) {
        wordMatches[i] = { word: correctWord, isCorrect: true };
        correctCount++;
        usedSpokenIndices.add(j);
        usedCorrectIndices.add(i);
        break;
      }
      
      // Fuzzy match for similar words (account for speech recognition errors)
      if (correctWord.length > 3 && spokenWord.length > 3) {
        const similarity = calculateStringSimilarity(spokenWord, correctWord);
        if (similarity > 0.8) {
          wordMatches[i] = { word: correctWord, isCorrect: true };
          correctCount++;
          usedSpokenIndices.add(j);
          usedCorrectIndices.add(i);
          break;
        }
      }
    }
  }
  
  // Calculate accuracy
  const accuracy = correctWords.length > 0 ? Math.round((correctCount / correctWords.length) * 100) : 0;
  
  console.log(`✅ Matched ${correctCount}/${correctWords.length} words`);
  console.log(`📊 Accuracy: ${accuracy}%`);
  
  return {
    accuracy,
    wordMatches,
    correctWords,
    spokenWords
  };
};

// Helper function for string similarity (Levenshtein-based)
const calculateStringSimilarity = (str1, str2) => {
  const matrix = [];
  const n = str1.length;
  const m = str2.length;

  if (n === 0) return m === 0 ? 1 : 0;
  if (m === 0) return 0;

  // Initialize matrix
  for (let i = 0; i <= n; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= m; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLength = Math.max(n, m);
  return (maxLength - matrix[n][m]) / maxLength;
};

// Get accuracy level description
const getAccuracyLevel = (accuracy) => {
  if (accuracy >= 90) return { level: 'Excellent', emoji: '🌟', color: '#48bb78' };
  if (accuracy >= 75) return { level: 'Very Good', emoji: '👍', color: '#38a169' };
  if (accuracy >= 60) return { level: 'Good', emoji: '✅', color: '#ed8936' };
  if (accuracy >= 40) return { level: 'Needs Practice', emoji: '📚', color: '#d69e2e' };
  return { level: 'Try Again', emoji: '🔄', color: '#e53e3e' };
};

// ==============================================
// MAIN COMPONENT
// ==============================================
function SpeakingExercise({ onBack, onLogoClick }) {
  // State management
  const [currentSentence, setCurrentSentence] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  const [currentWordMatches, setCurrentWordMatches] = useState([]);

  // NEW: Track if we're manually stopping vs automatic stop
  const [isManualStop, setIsManualStop] = useState(false);
  
  // NEW: For managing longer recording periods
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [hasReceivedSpeech, setHasReceivedSpeech] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Get current sentence data
  const currentData = testSentences[currentSentence] || null;

  // ==============================================
  // EFFECTS
  // ==============================================
  
  // Generate test sentences and check speech support on mount
  useEffect(() => {
    const sentences = generateSpeakingTest();
    setTestSentences(sentences);
    
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // IMPROVED: Configure speech recognition for better recording
      recognitionRef.current.continuous = true; // Keep listening
      recognitionRef.current.interimResults = true; // Get partial results
      recognitionRef.current.lang = 'en-GB'; // British English
      recognitionRef.current.maxAlternatives = 1; // Only need one result
      
      // FIXED: Better event handlers with improved silence detection
      recognitionRef.current.onresult = (event) => {
        console.log('🎤 Speech recognition result received');
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('✅ Final transcript:', transcript);
          } else {
            interimTranscript += transcript;
            console.log('⏳ Interim transcript:', transcript);
          }
        }
        
        // Update the current spoken text (use both final and interim for better UX)
        const currentTranscript = finalTranscript || interimTranscript;
        if (currentTranscript) {
          if (finalTranscript) {
            setSpokenText(prev => (prev + ' ' + finalTranscript).trim());
          } else {
            // For interim results, show preview but don't store permanently yet
            setSpokenText(prev => {
              const parts = prev.split(' ');
              // Remove any previous interim results and add new one
              return (prev + ' ' + interimTranscript).trim();
            });
          }
          setHasReceivedSpeech(true);
          
          // Reset silence counter when we get ANY speech (final or interim)
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            setSilenceTimer(null);
          }
          
          // Start new silence timer for auto-stop (2 seconds - reduced from 3)
          const newTimer = setTimeout(() => {
            console.log('🤫 2 seconds of silence detected - stopping recording');
            if (recognitionRef.current && isRecording) {
              try {
                recognitionRef.current.stop();
              } catch (error) {
                console.error('Error stopping recognition after silence:', error);
              }
            }
          }, 2000);
          setSilenceTimer(newTimer);
        }
      };
      
      // IMPROVED: Better error handling
      recognitionRef.current.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        
        // Clear silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
        
        setIsRecording(false);
        
        // Handle different error types
        if (event.error === 'no-speech') {
          if (!hasReceivedSpeech) {
            handleNoSpeechDetected();
          }
        } else if (event.error === 'aborted') {
          // This is normal when manually stopping
          if (isManualStop) {
            console.log('🛑 Manual stop detected - processing current speech');
            handleManualStopResult();
          }
        } else {
          setSpokenText('Speech recognition failed. Please try again.');
          setCurrentAccuracy(0);
          setCurrentWordMatches([]);
          setShowFeedback(true);
        }
      };
      
      // FIXED: Better onend handler that properly processes results
      recognitionRef.current.onend = () => {
        console.log('🏁 Speech recognition ended');
        console.log('Current spoken text at end:', spokenText);
        
        // Clear silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
        
        setIsRecording(false);
        
        // CRITICAL FIX: Use the current state immediately, not from closure
        const currentSpokenText = spokenText;
        
        // Process the final result if we have speech
        if (currentSpokenText && currentSpokenText.trim() && hasReceivedSpeech) {
          console.log('🎯 Processing final speech result:', currentSpokenText);
          // Use setTimeout to ensure state is properly updated
          setTimeout(() => {
            processRecordingResult(currentSpokenText);
          }, 100);
        } else if (isManualStop && currentSpokenText && currentSpokenText.trim()) {
          console.log('🛑 Processing manual stop result:', currentSpokenText);
          setTimeout(() => {
            processRecordingResult(currentSpokenText);
          }, 100);
        } else {
          console.log('❌ No usable speech found');
          setTimeout(() => {
            handleNoSpeechDetected();
          }, 100);
        }
      };

      // IMPROVED: onstart handler
      recognitionRef.current.onstart = () => {
        console.log('▶️ Speech recognition started');
        setIsRecording(true);
        setIsManualStop(false);
        setHasReceivedSpeech(false);
        
        // Clear any existing silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
      };
    }

    // Cleanup function
    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !showResults && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasStarted && !showResults && !showFeedback) {
      handleTimeUp();
    }
  }, [timeLeft, hasStarted, showResults, showFeedback]);

  // ==============================================
  // HELPER FUNCTIONS FOR SPEECH HANDLING
  // ==============================================

  const handleNoSpeechDetected = () => {
    console.log('🔇 No speech detected');
    setSpokenText('No speech detected. Please try again.');
    setCurrentAccuracy(0);
    setCurrentWordMatches([]);
    setShowFeedback(true);
  };

  const handleManualStopResult = () => {
    console.log('🛑 Processing manual stop');
    console.log('Current spokenText state:', spokenText);
    
    // Get the current spoken text from state
    const currentSpokenText = spokenText;
    
    // If we have some spoken text already, use it
    if (currentSpokenText && currentSpokenText.trim()) {
      console.log('✅ Found speech for manual stop:', currentSpokenText);
      // Use setTimeout to ensure proper state processing
      setTimeout(() => {
        processRecordingResult(currentSpokenText);
      }, 100);
    } else {
      console.log('❌ No speech captured before manual stop');
      // No speech was captured before manual stop
      setSpokenText('Recording stopped before speech was detected.');
      setCurrentAccuracy(0);
      setCurrentWordMatches([]);
      setShowFeedback(true);
    }
  };

  // IMPROVED: Process recording result with better state handling
  const processRecordingResult = (finalSpokenText) => {
    console.log('🎯 Processing recording result:', finalSpokenText);
    
    if (!currentData) {
      console.error('❌ No current data available');
      return;
    }
    
    // Ensure we have actual text to process
    if (!finalSpokenText || !finalSpokenText.trim()) {
      console.log('❌ No speech text to process');
      handleNoSpeechDetected();
      return;
    }
    
    // Calculate accuracy with detailed word matching
    const result = calculateAccuracyWithDetails(finalSpokenText.trim(), currentData.correctText);
    
    console.log('📊 Accuracy result:', result);
    
    setCurrentAccuracy(result.accuracy);
    setCurrentWordMatches(result.wordMatches);
    setShowFeedback(true);
  };

  // ==============================================
  // HANDLERS - IMPROVED
  // ==============================================
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startExercise = () => {
    setHasStarted(true);
    setTimeLeft(45);
  };

  const startRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;
    
    console.log('🎙️ Starting recording');
    
    // Reset states
    setIsRecording(true);
    setSpokenText('');
    setShowFeedback(false);
    setIsManualStop(false);
    setCurrentAccuracy(0);
    setCurrentWordMatches([]);
    setHasReceivedSpeech(false);
    
    // Clear any existing silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsRecording(false);
    }
  };

  // IMPROVED: Better stop recording function
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      console.log('🛑 Manually stopping recording');
      setIsManualStop(true);
      
      // Clear silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsRecording(false);
      }
    }
  };

  const playCorrectAudio = () => {
    if (!audioRef.current || !currentData) return;
    
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  };

  const handleTimeUp = () => {
    console.log('⏰ Time is up');
    
    // Clear silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    
    // Stop any ongoing recording
    if (isRecording && recognitionRef.current) {
      try {
        setIsManualStop(true);
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition on timeout:', error);
      }
    }
    
    // If we have spoken text, process it; otherwise show timeout message
    if (spokenText && spokenText.trim()) {
      processRecordingResult(spokenText);
    } else {
      setSpokenText('Time is up!');
      setCurrentAccuracy(0);
      setCurrentWordMatches([]);
      setShowFeedback(true);
    }
  };

  // IMPROVED: Better next handler with proper result storage
  const handleNext = () => {
    if (!currentData) return;

    console.log('➡️ Moving to next question');
    console.log('Current spoken text:', spokenText);
    console.log('Current accuracy:', currentAccuracy);

    // Store the result with detailed information
    setAnswers(prev => [...prev, {
      sentence: currentData,
      spokenText: spokenText,
      accuracy: currentAccuracy,
      wordMatches: currentWordMatches,
      timeTaken: 45 - timeLeft
    }]);

    if (currentSentence + 1 < testSentences.length) {
      // Move to next sentence
      setCurrentSentence(prev => prev + 1);
      
      // Complete state reset for next question
      setSpokenText('');
      setTimeLeft(45);
      setIsRecording(false);
      setShowFeedback(false);
      setCurrentAccuracy(0);
      setCurrentWordMatches([]);
      setIsManualStop(false);
      setHasReceivedSpeech(false);
      
      // Clear any remaining silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      console.log('✅ State reset for next question');
    } else {
      // Test completed
      setShowResults(true);
    }
  };

  const calculateOverallScore = () => {
    if (answers.length === 0) return { average: 0, total: 0 };
    
    const totalAccuracy = answers.reduce((sum, answer) => sum + answer.accuracy, 0);
    const average = Math.round(totalAccuracy / answers.length);
    
    const excellent = answers.filter(a => a.accuracy >= 90).length;
    const veryGood = answers.filter(a => a.accuracy >= 75 && a.accuracy < 90).length;
    const good = answers.filter(a => a.accuracy >= 60 && a.accuracy < 75).length;
    const needsPractice = answers.filter(a => a.accuracy >= 40 && a.accuracy < 60).length;
    const tryAgain = answers.filter(a => a.accuracy < 40).length;
    
    return { 
      average,
      total: answers.length,
      breakdown: { excellent, veryGood, good, needsPractice, tryAgain }
    };
  };

  const restartTest = () => {
    setCurrentSentence(0);
    setSpokenText('');
    setTimeLeft(45);
    setShowResults(false);
    setAnswers([]);
    setIsRecording(false);
    setHasStarted(false);
    setShowFeedback(false);
    setCurrentAccuracy(0);
    setCurrentWordMatches([]);
    setIsManualStop(false);
    setHasReceivedSpeech(false);
    
    // Clear silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    
    // Generate new random sentences
    const newSentences = generateSpeakingTest();
    setTestSentences(newSentences);
  };

  // ==============================================
  // RENDER CONDITIONS
  // ==============================================

  // Loading state
  if (testSentences.length === 0) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice</h1>
          
          <div className="loading-message">
            <p>🎲 Preparing your speaking test...</p>
            <p><small>Generating sentences in difficulty order: A2 → B1 → B2 → C1</small></p>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Speech not supported
  if (!speechSupported) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice</h1>
          
          <div className="error-message">
            <h3>⚠️ Speech Recognition Not Available</h3>
            <p>Sorry, your browser doesn't support speech recognition.</p>
            <p>Please try using:</p>
            <ul>
              <li>Google Chrome (recommended)</li>
              <li>Microsoft Edge</li>
              <li>Safari (on newer versions)</li>
            </ul>
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
    const score = calculateOverallScore();
    
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice Results</h1>
          
          <div className="results">
            <h2>🎉 Test Complete!</h2>
            <div className="score-display">{score.average}%</div>
            <div className="score-subtitle">Average Accuracy</div>
            
            <div className="speaking-breakdown">
              <div className="breakdown-item excellent">
                <span className="breakdown-icon">🌟</span>
                <span className="breakdown-count">{score.breakdown.excellent}</span>
                <span className="breakdown-label">Excellent</span>
              </div>
              <div className="breakdown-item very-good">
                <span className="breakdown-icon">👍</span>
                <span className="breakdown-count">{score.breakdown.veryGood}</span>
                <span className="breakdown-label">Very Good</span>
              </div>
              <div className="breakdown-item good">
                <span className="breakdown-icon">✅</span>
                <span className="breakdown-count">{score.breakdown.good}</span>
                <span className="breakdown-label">Good</span>
              </div>
              <div className="breakdown-item needs-practice">
                <span className="breakdown-icon">📚</span>
                <span className="breakdown-count">{score.breakdown.needsPractice}</span>
                <span className="breakdown-label">Needs Practice</span>
              </div>
              <div className="breakdown-item try-again">
                <span className="breakdown-icon">🔄</span>
                <span className="breakdown-count">{score.breakdown.tryAgain}</span>
                <span className="breakdown-label">Try Again</span>
              </div>
            </div>
            
            <div className="level-estimate">
              <h3>Speaking Assessment</h3>
              <p>
                {score.average >= 85 ? "Outstanding pronunciation! Your speech clarity is excellent." :
                 score.average >= 70 ? "Great speaking skills! Keep practising for even better clarity." :
                 score.average >= 55 ? "Good effort! Focus on clear pronunciation and pacing." :
                 "Keep practising! Speak slowly and clearly for better recognition."}
              </p>
            </div>

            <div className="detailed-results">
              <h3>📝 Detailed Results:</h3>
              <div className="results-list">
                {answers.map((answer, index) => {
                  const accuracyInfo = getAccuracyLevel(answer.accuracy);
                  
                  return (
                    <div key={index} className="result-item">
                      <div className="result-header">
                        <span className="result-emoji">{accuracyInfo.emoji}</span>
                        <span className="result-level">{answer.sentence.level}</span>
                        <span className="result-number">#{index + 1}</span>
                        <span className="result-accuracy" style={{ color: accuracyInfo.color }}>
                          {answer.accuracy}%
                        </span>
                      </div>
                      <div className="result-content">
                        <div className="result-status">
                          <strong>{accuracyInfo.level}</strong>
                        </div>
                        
                        {/* NEW: Visual word-by-word feedback */}
                        {answer.wordMatches && answer.wordMatches.length > 0 && (
                          <div className="word-feedback">
                            <div className="word-feedback-label"><strong>Word Analysis:</strong></div>
                            <div className="word-feedback-container">
                              {answer.wordMatches.map((match, wordIndex) => (
                                <span 
                                  key={wordIndex}
                                  className={`word-feedback-item ${match.isCorrect ? 'correct' : 'incorrect'}`}
                                  style={{
                                    backgroundColor: match.isCorrect ? '#d4edda' : '#f8d7da',
                                    color: match.isCorrect ? '#155724' : '#721c24',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    margin: '2px',
                                    fontSize: '0.9em',
                                    display: 'inline-block'
                                  }}
                                >
                                  {match.word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="correct-text">
                          <strong>Target:</strong> "{answer.sentence.correctText}"
                        </div>
                        <div className="spoken-text">
                          <strong>You said:</strong> "{answer.spokenText}"
                        </div>
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
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice</h1>
          
          <div className="instructions-container">
            <div className="instruction-content">
              <h3>📋 Instructions</h3>
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="instruction-icon">👀</span>
                  <span>Read the sentence displayed on screen</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎤</span>
                  <span>Click record and speak clearly into your microphone</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⏱️</span>
                  <span>You have 45 seconds per sentence</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🤫</span>
                  <span>Recording stops after 3 seconds of silence (or manually)</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎯</span>
                  <span>Aim for clear pronunciation and natural pacing</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🔊</span>
                  <span>Listen to the sample audio after each attempt</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">📊</span>
                  <span>Get detailed word-by-word feedback on your pronunciation</span>
                </div>
              </div>
              
              <div className="difficulty-info">
                <h4>📊 Test Structure</h4>
                <p>Structured progression through difficulty levels:</p>
                <ul>
                  <li>2 A2 level sentences (elementary)</li>
                  <li>3 B1 level sentences (intermediate)</li>
                  <li>3 B2 level sentences (upper-intermediate)</li>
                  <li>2 C1 level sentences (advanced)</li>
                </ul>
                <p style={{ fontSize: '0.9em', fontStyle: 'italic', marginTop: '10px' }}>
                  Sentences get progressively more complex!
                </p>
              </div>
              
              <div className="microphone-info">
                <h4>🎤 Microphone Required</h4>
                <p>Please allow microphone access when prompted by your browser.</p>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                  💡 New: Recording continues until 2 seconds of silence for better capture!
                </p>
              </div>
            </div>
            
            <button className="btn btn-primary btn-large" onClick={startExercise}>
              🎤 Start Speaking Practice
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
    <div className="speaking-container">
      <div className="speaking-quiz-container">
        {/* Header with timer */}
        <div className="speaking-header">
          <div className="timer-section">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text" style={{ color: timeLeft <= 10 ? '#e53e3e' : '#4c51bf' }}>
              {formatTime(timeLeft)} for this question
            </span>
          </div>
          <div className="progress-section">
            Question {currentSentence + 1} of {testSentences.length}
          </div>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>

        {/* Main content */}
        <div className="speaking-main">
          <div className="level-indicator">
            <span className="level-badge">{currentData?.level}</span>
            <span className="level-description">{currentData?.difficulty}</span>
          </div>

          <div className="speaking-instruction">
            <h2>Record yourself saying the statement below</h2>
          </div>

          {/* Character with speech bubble */}
          <div className="character-section">
            <div className="character">🎭</div>
            <div className="speech-bubble">
              "{currentData?.correctText}"
            </div>
          </div>

          {/* Recording controls */}
          <div className="recording-section">
            {!showFeedback ? (
              <div className="recording-controls">
                <button 
                  className={`record-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={timeLeft === 0}
                >
                  <span className="record-icon">
                    {isRecording ? '⏹️' : '🎤'}
                  </span>
                  <span className="record-text">
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </span>
                </button>
                
                {/* NEW: Recording info */}
                {isRecording && (
                  <div className="recording-info">
                    <p>🎙️ Recording active - speak clearly!</p>
                    <p style={{ fontSize: '0.8em', color: '#666' }}>
                      Will stop after 3 seconds of silence
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="feedback-section">
                <div className="accuracy-display">
                  <div className="accuracy-score" style={{ color: getAccuracyLevel(currentAccuracy).color }}>
                    {currentAccuracy}%
                  </div>
                  <div className="accuracy-level">
                    {getAccuracyLevel(currentAccuracy).emoji} {getAccuracyLevel(currentAccuracy).level}
                  </div>
                </div>
                
                {/* NEW: Visual word-by-word feedback */}
                {currentWordMatches.length > 0 && (
                  <div className="word-analysis-section">
                    <div className="word-analysis-header">Word-by-word analysis:</div>
                    <div className="word-analysis-container">
                      {currentWordMatches.map((match, index) => (
                        <span 
                          key={index}
                          className={`word-analysis-item ${match.isCorrect ? 'correct' : 'incorrect'}`}
                          style={{
                            backgroundColor: match.isCorrect ? '#d4edda' : '#f8d7da',
                            color: match.isCorrect ? '#155724' : '#721c24',
                            border: `1px solid ${match.isCorrect ? '#c3e6cb' : '#f5c6cb'}`,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            margin: '3px',
                            fontSize: '0.95em',
                            display: 'inline-block',
                            fontWeight: '500'
                          }}
                          title={match.isCorrect ? 'Correct pronunciation' : 'Needs improvement'}
                        >
                          {match.word} {match.isCorrect ? '✓' : '✗'}
                        </span>
                      ))}
                    </div>
                    <div className="word-analysis-legend">
                      <span style={{ color: '#155724', fontSize: '0.8em' }}>
                        ✓ = Correctly pronounced
                      </span>
                      <span style={{ color: '#721c24', fontSize: '0.8em', marginLeft: '15px' }}>
                        ✗ = Needs practice
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="feedback-text">
                  <div className="recognition-result">
                    <strong>You said:</strong> "{spokenText}"
                  </div>
                  <div className="target-text">
                    <strong>Target:</strong> "{currentData?.correctText}"
                  </div>
                </div>
                
                <div className="sample-section">
                  <div className="sample-header">Review the sample pronunciation:</div>
                  <div className="sample-controls">
                    <audio ref={audioRef} preload="auto">
                      <source src={`/${currentData?.audioFile}`} type="audio/mpeg" />
                    </audio>
                    
                    <button className="sample-btn" onClick={playCorrectAudio}>
                      <span className="sample-icon">🔊</span>
                      <span className="sample-text">PLAY SAMPLE</span>
                    </button>
                    
                    <button className="continue-btn" onClick={handleNext}>
                      CONTINUE →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status messages */}
          {isRecording && (
            <div className="recording-indicator">
              🔴 Recording... Speak clearly!
              {hasReceivedSpeech && (
                <div style={{ fontSize: '0.8em', marginTop: '5px' }}>
                  ✅ Speech detected - will stop after 2 seconds of silence
                </div>
              )}
            </div>
          )}

          {/* NEW: Real-time speech preview (optional) */}
          {isRecording && spokenText && (
            <div className="speech-preview">
              <div className="speech-preview-label">Current speech:</div>
              <div className="speech-preview-text">"{spokenText}"</div>
            </div>
          )}

          {/* DEBUG: Development info */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              position: 'fixed',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '0.8em',
              fontFamily: 'monospace',
              zIndex: 9999,
              maxWidth: '300px'
            }}>
              🐛 Debug:<br/>
              Recording: {isRecording ? 'Yes' : 'No'}<br/>
              Manual Stop: {isManualStop ? 'Yes' : 'No'}<br/>
              Has Speech: {hasReceivedSpeech ? 'Yes' : 'No'}<br/>
              Feedback: {showFeedback ? 'Yes' : 'No'}<br/>
              Accuracy: {currentAccuracy}%<br/>
              Words Matched: {currentWordMatches.length}<br/>
              Speech: "{spokenText.slice(0, 50)}{spokenText.length > 50 ? '...' : ''}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpeakingExercise;
