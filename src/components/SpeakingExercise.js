// src/components/SpeakingExercise.js - FIXED: Proper speech recognition without word duplication
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

// Calculate string similarity for fuzzy matching
const calculateStringSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = calculateLevenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / parseFloat(longer.length);
};

// Calculate Levenshtein distance
const calculateLevenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
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
  
  return matrix[str2.length][str1.length];
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
  
  console.log(`📊 Final accuracy: ${correctCount}/${correctWords.length} = ${accuracy}%`);
  
  return {
    accuracy,
    wordMatches,
    correctWords,
    spokenWords
  };
};

// ==============================================
// MAIN COMPONENT
// ==============================================

const SpeakingExercise = ({ onBack, onLogoClick }) => {
  // State management
  const [currentSentence, setCurrentSentence] = useState(0);
  const [spokenText, setSpokenText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
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
  const accumulatedTranscriptRef = useRef('');

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
      
      // FIXED: Proper event handlers without word duplication
      recognitionRef.current.onresult = (event) => {
        console.log('🎤 Speech recognition result received');
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        // FIXED: Process all results properly to avoid duplication
        // Only process results from the latest resultIndex onwards
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('✅ Final transcript piece:', transcript);
          } else {
            interimTranscript += transcript;
            console.log('⏳ Interim transcript piece:', transcript);
          }
        }
        
        // FIXED: Handle transcript accumulation properly using ref
        if (finalTranscript) {
          // For final results, add to accumulated transcript ref
          accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + ' ' + finalTranscript).trim();
          console.log('📝 Updated accumulated transcript:', accumulatedTranscriptRef.current);
          
          // Update display with accumulated transcript
          setSpokenText(accumulatedTranscriptRef.current);
          setHasReceivedSpeech(true);
        } else if (interimTranscript) {
          // For interim results, show preview without permanently storing
          const previewText = (accumulatedTranscriptRef.current + ' ' + interimTranscript).trim();
          setSpokenText(previewText);
          console.log('👁️ Interim preview:', previewText);
          setHasReceivedSpeech(true);
        }
        
        // Reset silence counter when we get ANY speech (final or interim)
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
        
        // Start new silence timer for auto-stop (2 seconds)
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
        console.log('Final accumulated transcript:', accumulatedTranscriptRef.current);
        
        // Clear silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
        
        setIsRecording(false);
        
        // Process the final result using accumulated transcript
        const finalText = accumulatedTranscriptRef.current.trim();
        
        if (finalText && hasReceivedSpeech) {
          console.log('🎯 Processing final speech result:', finalText);
          setTimeout(() => {
            processRecordingResult(finalText);
          }, 100);
        } else if (isManualStop && finalText) {
          console.log('🛑 Processing manual stop result:', finalText);
          setTimeout(() => {
            processRecordingResult(finalText);
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
        accumulatedTranscriptRef.current = ''; // Reset accumulated transcript
        setSpokenText(''); // Reset display text
        
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
    console.log('Current accumulated transcript:', accumulatedTranscriptRef.current);
    
    // Use the accumulated transcript for manual stop
    const finalText = accumulatedTranscriptRef.current.trim();
    
    if (finalText) {
      console.log('✅ Found speech for manual stop:', finalText);
      setTimeout(() => {
        processRecordingResult(finalText);
      }, 100);
    } else {
      console.log('❌ No speech captured before manual stop');
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
    
    // Update the display with final text
    setSpokenText(finalSpokenText);
    
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
    setCurrentSentence(0);
    setTimeLeft(45);
    setResults([]);
    setShowResults(false);
    setShowFeedback(false);
  };

  const startRecording = () => {
    console.log('🎤 Starting recording...');
    
    if (!recognitionRef.current) {
      console.error('❌ Speech recognition not available');
      setSpokenText('Speech recognition not available. Please refresh and try again.');
      setShowFeedback(true);
      return;
    }

    try {
      // Clear previous results
      setSpokenText('');
      accumulatedTranscriptRef.current = '';
      setShowFeedback(false);
      
      // Start recording
      recognitionRef.current.start();
      console.log('✅ Speech recognition started successfully');
      
    } catch (error) {
      console.error('❌ Error starting speech recognition:', error);
      setSpokenText('Failed to start recording. Please try again.');
      setShowFeedback(true);
    }
  };

  const stopRecording = () => {
    console.log('🛑 Manually stopping recording...');
    setIsManualStop(true);
    
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        console.log('✅ Speech recognition stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping speech recognition:', error);
        setIsRecording(false);
        
        // Process current accumulated transcript if available
        const finalText = accumulatedTranscriptRef.current.trim();
        if (finalText) {
          processRecordingResult(finalText);
        } else {
          handleNoSpeechDetected();
        }
      }
    }
  };

  const handleNext = () => {
    // Store the result
    const result = {
      sentence: currentData.correctText,
      spokenText: spokenText,
      accuracy: currentAccuracy,
      level: currentData.level,
      wordMatches: currentWordMatches
    };
    
    setResults(prev => [...prev, result]);
    
    // Check if more sentences
    if (currentSentence < testSentences.length - 1) {
      setCurrentSentence(prev => prev + 1);
      setTimeLeft(45);
      setSpokenText('');
      accumulatedTranscriptRef.current = '';
      setShowFeedback(false);
      setCurrentAccuracy(0);
      setCurrentWordMatches([]);
    } else {
      setShowResults(true);
    }
  };

  const handleTimeUp = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // No recording started in time
      setSpokenText('Time ran out before recording started.');
      setCurrentAccuracy(0);
      setCurrentWordMatches([]);
      setShowFeedback(true);
    }
  };

  const playCorrectAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const calculateOverallScore = () => {
    if (results.length === 0) return { average: 0, breakdown: {} };
    
    const total = results.reduce((sum, result) => sum + result.accuracy, 0);
    const average = Math.round(total / results.length);
    
    // Breakdown by level
    const breakdown = {};
    results.forEach(result => {
      if (!breakdown[result.level]) {
        breakdown[result.level] = { total: 0, count: 0 };
      }
      breakdown[result.level].total += result.accuracy;
      breakdown[result.level].count++;
    });
    
    // Calculate averages for each level
    Object.keys(breakdown).forEach(level => {
      breakdown[level].average = Math.round(breakdown[level].total / breakdown[level].count);
    });
    
    return { average, breakdown };
  };

  const restartExercise = () => {
    setHasStarted(false);
    setCurrentSentence(0);
    setSpokenText('');
    accumulatedTranscriptRef.current = '';
    setIsRecording(false);
    setTimeLeft(45);
    setShowResults(false);
    setResults([]);
    setShowFeedback(false);
    setCurrentAccuracy(0);
    setCurrentWordMatches([]);
    
    // Generate new test sentences
    const sentences = generateSpeakingTest();
    setTestSentences(sentences);
  };

  // ==============================================
  // RENDER LOGIC
  // ==============================================

  // Loading state
  if (testSentences.length === 0) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          <h1>🎤 Loading Speaking Practice...</h1>
          <div className="loading-spinner">⏳</div>
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
              {Object.entries(score.breakdown).map(([level, data]) => (
                <div key={level} className="breakdown-item">
                  <div className="breakdown-count">{data.average}%</div>
                  <div className="breakdown-label">{level}</div>
                </div>
              ))}
            </div>
            
            <div className="results-list">
              <h3>📋 Detailed Results</h3>
              {results.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <span className="result-number">#{index + 1}</span>
                    <span className="result-level">{result.level}</span>
                    <span className="result-score">{result.accuracy}%</span>
                  </div>
                  <div className="result-sentence">"{result.sentence}"</div>
                  <div className="result-spoken">You said: "{result.spokenText}"</div>
                </div>
              ))}
            </div>
            
            <div className="results-actions">
              <button className="btn btn-primary" onClick={restartExercise}>
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
                  <span>Recording stops after 2 seconds of silence (or manually)</span>
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
                  💡 Fixed: Recording now properly captures speech without word duplication!
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
                    {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
                  </span>
                </button>
                
                {spokenText && (
                  <div className="interim-feedback">
                    <div className="current-speech">
                      <strong>Current speech:</strong> "{spokenText}"
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="feedback-container">
                <div className="accuracy-score" style={{ color: currentAccuracy >= 80 ? '#22c55e' : currentAccuracy >= 60 ? '#f59e0b' : '#ef4444' }}>
                  {currentAccuracy}%
                </div>
                
                {currentWordMatches.length > 0 && (
                  <div className="word-analysis">
                    <div className="word-analysis-title">Word-by-word Analysis:</div>
                    <div className="word-matches">
                      {currentWordMatches.map((match, index) => (
                        <span 
                          key={index}
                          style={{
                            backgroundColor: `${match.isCorrect ? '#c3e6cb' : '#f5c6cb'}`,
                            color: `${match.isCorrect ? '#155724' : '#721c24'}`,
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
            </div>
          )}
          
          {isRecording && (
            <div className="recording-instructions">
              <p>💡 Recording will stop automatically after 2 seconds of silence</p>
              {hasReceivedSpeech && (
                <div style={{ fontSize: '0.8em', marginTop: '5px' }}>
                  ✅ Speech detected - will stop after 2 seconds of silence
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakingExercise;
