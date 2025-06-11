// src/components/SpeakingExercise.js - Fixed version with proper data handling
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';

// ==============================================
// HELPER FUNCTIONS
// ==============================================

// Generate test sentences in proper order: A2 → B1 → B2 → C1
const generateSpeakingTest = () => {
  console.log('🎲 Starting sentence generation...');
  console.log('Available sentence pools:', Object.keys(SENTENCE_POOLS));
  console.log('Test structure:', TEST_STRUCTURE);

  const testSentences = [];
  let sentenceCounter = 1;

  // Process each level in the correct order
  TEST_STRUCTURE.forEach(({ level, count }) => {
    console.log(`📚 Processing level ${level}, need ${count} sentences`);
    
    const availableSentences = SENTENCE_POOLS[level];
    if (!availableSentences || availableSentences.length === 0) {
      console.error(`❌ No sentences available for level ${level}`);
      return;
    }
    
    console.log(`Found ${availableSentences.length} sentences for level ${level}`);
    
    // Create a copy and shuffle only within this level
    const shuffled = [...availableSentences];
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Take the required number of sentences from this level
    for (let i = 0; i < count && i < shuffled.length; i++) {
      const selectedSentence = shuffled[i];
      
      const processedSentence = {
        id: sentenceCounter,
        level: level,
        audioFile: selectedSentence.audioFile,
        correctText: selectedSentence.correctText,
        difficulty: selectedSentence.difficulty || `${level} level sentence`
      };
      
      console.log(`✅ Added sentence ${sentenceCounter}:`, processedSentence);
      testSentences.push(processedSentence);
      sentenceCounter++;
    }
  });

  console.log(`🎯 Generated ${testSentences.length} total sentences for speaking test`);
  return testSentences;
};

// Basic text normalisation for comparison
const normaliseText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Calculate similarity between spoken text and correct text
const calculateAccuracy = (spokenText, correctText) => {
  console.log('🎯 Calculating accuracy:', { spokenText, correctText });
  
  // Handle null/undefined values
  if (!spokenText || !correctText) {
    console.log('❌ Missing text for accuracy calculation');
    return 0;
  }
  
  // Ensure both are strings
  const spoken = normaliseText(String(spokenText));
  const correct = normaliseText(String(correctText));
  
  console.log('📝 Normalised texts:', { spoken, correct });
  
  // Perfect match
  if (spoken === correct) {
    console.log('✅ Perfect match!');
    return 100;
  }
  
  // Split into words for comparison
  const spokenWords = spoken.split(' ').filter(word => word.length > 0);
  const correctWords = correct.split(' ').filter(word => word.length > 0);
  
  console.log('📚 Word comparison:', { spokenWords, correctWords });
  
  // Calculate word accuracy
  const matchingWords = spokenWords.filter(word => correctWords.includes(word));
  const wordAccuracy = correctWords.length > 0 ? (matchingWords.length / correctWords.length) * 100 : 0;
  
  // Simple character similarity
  const maxLength = Math.max(spoken.length, correct.length);
  if (maxLength === 0) return 100; // Both empty
  
  let charMatches = 0;
  const minLength = Math.min(spoken.length, correct.length);
  
  for (let i = 0; i < minLength; i++) {
    if (spoken[i] === correct[i]) charMatches++;
  }
  
  const charAccuracy = ((charMatches / maxLength) * 100);
  
  // Return the better of the two methods
  const finalAccuracy = Math.round(Math.max(wordAccuracy, charAccuracy));
  
  console.log('📊 Accuracy calculation:', {
    wordAccuracy: Math.round(wordAccuracy),
    charAccuracy: Math.round(charAccuracy),
    finalAccuracy,
    matchingWords: matchingWords.length,
    totalWords: correctWords.length
  });
  
  return finalAccuracy;
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
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitialised, setIsInitialised] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Get current sentence data with better validation
  const currentData = testSentences && testSentences.length > 0 && currentSentence >= 0 && currentSentence < testSentences.length 
    ? testSentences[currentSentence] 
    : null;

  // Debug current data
  useEffect(() => {
    console.log('🔍 Current data check:', {
      currentSentence,
      totalSentences: testSentences.length,
      currentData: currentData,
      hasCurrentData: !!currentData
    });
  }, [currentSentence, testSentences, currentData]);

  // ==============================================
  // EFFECTS
  // ==============================================
  
  // Generate test sentences and check speech support on mount
  useEffect(() => {
    console.log('🚀 Initialising speaking exercise...');
    
    // Check if SENTENCE_POOLS and TEST_STRUCTURE are available
    if (!SENTENCE_POOLS || !TEST_STRUCTURE) {
      console.error('❌ Missing sentence data imports');
      setErrorMessage('Missing sentence data. Please check the imports.');
      return;
    }
    
    try {
      const sentences = generateSpeakingTest();
      
      if (!sentences || sentences.length === 0) {
        console.error('❌ No sentences generated');
        setErrorMessage('Failed to generate test sentences');
        return;
      }
      
      console.log('✅ Setting test sentences:', sentences);
      setTestSentences(sentences);
      setIsInitialised(true);
      
    } catch (error) {
      console.error('❌ Error generating test sentences:', error);
      setErrorMessage('Failed to generate test sentences: ' + error.message);
      return;
    }
    
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      console.log('✅ Speech recognition supported');
      setSpeechSupported(true);
      
      try {
        recognitionRef.current = new SpeechRecognition();
        
        // Configure speech recognition
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-GB'; // British English
        
        // Event handlers
        recognitionRef.current.onresult = (event) => {
          console.log('🎙️ Speech recognition result received');
          
          try {
            if (event.results && event.results.length > 0 && event.results[0].length > 0) {
              const transcript = event.results[0][0].transcript;
              console.log('📝 Transcript:', transcript);
              
              setSpokenText(transcript);
              setIsRecording(false);
              setErrorMessage(''); // Clear any previous errors
              
              // Get current data at the time of processing
              const currentTestData = testSentences[currentSentence];
              console.log('🎯 Processing with data:', currentTestData);
              
              if (currentTestData && currentTestData.correctText) {
                const accuracy = calculateAccuracy(transcript, currentTestData.correctText);
                setCurrentAccuracy(accuracy);
                setShowFeedback(true);
                console.log('✅ Accuracy calculated successfully:', accuracy);
              } else {
                console.error('❌ No current test data available for accuracy calculation');
                console.log('Debug info:', {
                  testSentences: testSentences.length,
                  currentSentence,
                  currentTestData
                });
                setErrorMessage('Error: No sentence data available for processing');
              }
            } else {
              console.error('❌ No speech recognition results');
              setSpokenText('No speech detected. Please try again.');
              setErrorMessage('No speech detected');
            }
          } catch (error) {
            console.error('❌ Error processing speech result:', error);
            setSpokenText('Error processing speech. Please try again.');
            setErrorMessage('Error processing speech result: ' + error.message);
          } finally {
            setIsRecording(false);
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('❌ Speech recognition error:', event.error);
          setIsRecording(false);
          setErrorMessage(`Speech recognition error: ${event.error}`);
          
          // Set appropriate message based on error type
          switch (event.error) {
            case 'no-speech':
              setSpokenText('No speech detected. Please try again.');
              break;
            case 'network':
              setSpokenText('Network error. Please check your connection.');
              break;
            case 'not-allowed':
              setSpokenText('Microphone access denied. Please allow microphone access.');
              break;
            case 'service-not-allowed':
              setSpokenText('Speech service not available. Please try again.');
              break;
            default:
              setSpokenText('Speech recognition failed. Please try again.');
          }
        };
        
        recognitionRef.current.onend = () => {
          console.log('🛑 Speech recognition ended');
          setIsRecording(false);
        };
        
        recognitionRef.current.onstart = () => {
          console.log('▶️ Speech recognition started');
          setErrorMessage(''); // Clear errors when starting
        };
        
        console.log('✅ Speech recognition configured successfully');
        
      } catch (error) {
        console.error('❌ Error setting up speech recognition:', error);
        setSpeechSupported(false);
        setErrorMessage('Failed to initialise speech recognition: ' + error.message);
      }
    } else {
      console.log('❌ Speech recognition not supported');
      setSpeechSupported(false);
    }
  }, []); // Empty dependency array - only run once

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
  // HANDLERS
  // ==============================================
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startExercise = () => {
    console.log('🚀 Starting exercise');
    console.log('Available sentences:', testSentences.length);
    console.log('First sentence:', testSentences[0]);
    
    if (testSentences.length === 0) {
      setErrorMessage('No sentences available to start the exercise');
      return;
    }
    
    setHasStarted(true);
    setTimeLeft(45);
    setErrorMessage('');
  };

  const startRecording = () => {
    console.log('🎙️ Starting recording...');
    console.log('Current sentence index:', currentSentence);
    console.log('Total sentences:', testSentences.length);
    console.log('Current data:', currentData);
    
    if (!speechSupported || !recognitionRef.current) {
      console.error('❌ Speech recognition not available');
      setErrorMessage('Speech recognition not available');
      return;
    }
    
    if (!currentData) {
      console.error('❌ No current sentence data');
      console.log('Debug info:', {
        testSentences: testSentences.length,
        currentSentence,
        isInitialised,
        hasStarted
      });
      setErrorMessage('No sentence data available - please restart the exercise');
      return;
    }
    
    console.log('✅ Starting recording for sentence:', currentData.correctText);
    
    setIsRecording(true);
    setSpokenText('');
    setShowFeedback(false);
    setErrorMessage('');
    
    try {
      // Stop any existing recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Small delay before starting new recognition
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          console.log('✅ Speech recognition started successfully');
        } catch (startError) {
          console.error('❌ Error starting recognition:', startError);
          setIsRecording(false);
          setErrorMessage('Failed to start speech recognition: ' + startError.message);
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Error in startRecording:', error);
      setIsRecording(false);
      setErrorMessage('Error starting recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    console.log('🛑 Stopping recording...');
    
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        console.log('✅ Speech recognition stopped');
      } catch (error) {
        console.error('❌ Error stopping recognition:', error);
        setErrorMessage('Error stopping recording: ' + error.message);
      }
    }
    
    setIsRecording(false);
  };

  const playCorrectAudio = () => {
    console.log('🔊 Playing correct audio...');
    
    if (!audioRef.current || !currentData) {
      console.error('❌ No audio ref or current data');
      return;
    }
    
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('❌ Error playing audio:', error);
      });
    } catch (error) {
      console.error('❌ Error in playCorrectAudio:', error);
    }
  };

  const handleTimeUp = () => {
    console.log('⏰ Time is up!');
    setSpokenText('Time is up!');
    setCurrentAccuracy(0);
    setShowFeedback(true);
  };

  const handleNext = () => {
    console.log('➡️ Moving to next question...');
    
    if (!currentData) {
      console.error('❌ No current data for handleNext');
      return;
    }

    try {
      // Store the result with error handling
      const answerData = {
        sentence: currentData,
        spokenText: spokenText || 'No speech detected',
        accuracy: currentAccuracy,
        timeTaken: 45 - timeLeft
      };
      
      console.log('💾 Storing answer:', answerData);
      
      setAnswers(prev => [...prev, answerData]);

      if (currentSentence + 1 < testSentences.length) {
        // Move to next sentence
        console.log(`📝 Moving to question ${currentSentence + 2}`);
        setCurrentSentence(prev => prev + 1);
        setSpokenText('');
        setTimeLeft(45);
        setIsRecording(false);
        setShowFeedback(false);
        setCurrentAccuracy(0);
        setErrorMessage('');
      } else {
        // Test completed
        console.log('🏁 Test completed!');
        setShowResults(true);
      }
    } catch (error) {
      console.error('❌ Error in handleNext:', error);
      setErrorMessage('Error moving to next question: ' + error.message);
    }
  };

  const calculateOverallScore = () => {
    if (answers.length === 0) return { average: 0, total: 0 };
    
    const totalAccuracy = answers.reduce((sum, answer) => sum + (answer.accuracy || 0), 0);
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
    console.log('🔄 Restarting test...');
    setCurrentSentence(0);
    setSpokenText('');
    setTimeLeft(45);
    setShowResults(false);
    setAnswers([]);
    setIsRecording(false);
    setHasStarted(false);
    setShowFeedback(false);
    setCurrentAccuracy(0);
    setErrorMessage('');
    
    // Generate new random sentences
    try {
      const newSentences = generateSpeakingTest();
      setTestSentences(newSentences);
      setIsInitialised(true);
    } catch (error) {
      console.error('❌ Error generating new sentences:', error);
      setErrorMessage('Error restarting test: ' + error.message);
    }
  };

  // ==============================================
  // RENDER CONDITIONS
  // ==============================================

  // Loading state
  if (!isInitialised || (testSentences.length === 0 && !errorMessage)) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice</h1>
          
          <div className="loading-message">
            <p>🎲 Preparing your speaking test...</p>
            <p><small>Generating sentences in difficulty order: A2 → B1 → B2 → C1</small></p>
            
            {/* Debug info for loading */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                background: '#f0f0f0',
                padding: '10px',
                margin: '10px 0',
                borderRadius: '5px',
                fontSize: '0.8em',
                textAlign: 'left'
              }}>
                <strong>Debug Info:</strong><br />
                Initialised: {isInitialised ? 'Yes' : 'No'}<br />
                Sentences: {testSentences.length}<br />
                SENTENCE_POOLS available: {SENTENCE_POOLS ? 'Yes' : 'No'}<br />
                TEST_STRUCTURE available: {TEST_STRUCTURE ? 'Yes' : 'No'}
              </div>
            )}
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (errorMessage && testSentences.length === 0) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice</h1>
          
          <div className="error-message">
            <h3>⚠️ Error</h3>
            <p>{errorMessage}</p>
            
            {/* Debug info for errors */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                background: '#f0f0f0',
                padding: '10px',
                margin: '10px 0',
                borderRadius: '5px',
                fontSize: '0.8em',
                textAlign: 'left'
              }}>
                <strong>Debug Info:</strong><br />
                SENTENCE_POOLS: {JSON.stringify(Object.keys(SENTENCE_POOLS || {}))}<br />
                TEST_STRUCTURE: {JSON.stringify(TEST_STRUCTURE || [])}<br />
                Current Sentences: {testSentences.length}
              </div>
            )}
            
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
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
                  <span className="instruction-icon">🎯</span>
                  <span>Aim for clear pronunciation and natural pacing</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🔊</span>
                  <span>Listen to the sample audio after each attempt</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">📊</span>
                  <span>Get instant feedback on your pronunciation accuracy</span>
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
              </div>
              
              {/* Debug info for instructions */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{
                  background: '#e6ffe6',
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '5px',
                  fontSize: '0.8em',
                  textAlign: 'left'
                }}>
                  <strong>✅ Ready to Start - Debug Info:</strong><br />
                  Total sentences available: {testSentences.length}<br />
                  First sentence: {testSentences[0]?.correctText}<br />
                  Speech recognition: {speechSupported ? 'Supported' : 'Not supported'}<br />
                  Current data available: {currentData ? 'Yes' : 'No'}
                </div>
              )}
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

        {/* Debug info for main interface */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: currentData ? '#e6ffe6' : '#ffe6e6',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            fontSize: '0.8em',
            textAlign: 'left'
          }}>
            <strong>🔍 Main Interface Debug:</strong><br />
            Current sentence index: {currentSentence}<br />
            Total sentences: {testSentences.length}<br />
            Current data: {currentData ? '✅ Available' : '❌ Missing'}<br />
            {currentData && (
              <>
                Current text: "{currentData.correctText}"<br />
                Current level: {currentData.level}
              </>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="speaking-main">
          <div className="level-indicator">
            <span className="level-badge">{currentData?.level || 'Unknown'}</span>
            <span className="level-description">{currentData?.difficulty || 'Loading...'}</span>
          </div>

          <div className="speaking-instruction">
            <h2>Record yourself saying the statement below</h2>
          </div>

          {/* Character with speech bubble */}
          <div className="character-section">
            <div className="character">🎭</div>
            <div className="speech-bubble">
              "{currentData?.correctText || 'Loading sentence...'}"
            </div>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="error-message" style={{ margin: '20px 0', padding: '15px' }}>
              <h4>⚠️ Error</h4>
              <p>{errorMessage}</p>
              <button className="btn btn-secondary btn-small" onClick={() => setErrorMessage('')}>
                Clear Error
              </button>
            </div>
          )}

          {/* Recording controls */}
          <div className="recording-section">
            {!showFeedback ? (
              <button 
                className={`record-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={timeLeft === 0 || !currentData}
              >
                <span className="record-icon">
                  {isRecording ? '⏹️' : '🎤'}
                </span>
                <span className="record-text">
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </span>
              </button>
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
                
                <div className="feedback-text">
                  <div className="recognition-result">
                    <strong>You said:</strong> "{spokenText}"
                  </div>
                </div>
                
                <div className="sample-section">
                  <div className="sample-header">Nice! Review the sample:</div>
                  <div className="sample-controls">
                    <audio ref={audioRef} preload="auto">
                      <source src={`/${currentData?.audioFile}`} type="audio/mpeg" />
                    </audio>
                    
                    <button className="sample-btn" onClick={playCorrectAudio}>
                      <span className="sample-icon">🔊</span>
                      <span className="sample-text">SAMPLE</span>
                    </button>
                    
                    <button className="continue-btn" onClick={handleNext}>
                      CONTINUE
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
        </div>
      </div>
    </div>
  );
}

export default SpeakingExercise;
