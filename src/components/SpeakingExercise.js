// src/components/SpeakingExercise.js - Complete rewrite from scratch for maximum efficiency and reliability
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';

// ==============================================
// HELPER FUNCTIONS - OPTIMIZED
// ==============================================

const generateSpeakingTest = () => {
  const testSentences = [];
  let sentenceCounter = 1;

  TEST_STRUCTURE.forEach(({ level, count }) => {
    const availableSentences = [...SENTENCE_POOLS[level]];
    
    // Fisher-Yates shuffle
    for (let i = availableSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSentences[i], availableSentences[j]] = [availableSentences[j], availableSentences[i]];
    }
    
    for (let i = 0; i < count && i < availableSentences.length; i++) {
      testSentences.push({
        id: sentenceCounter++,
        level: level,
        audioFile: availableSentences[i].audioFile,
        correctText: availableSentences[i].correctText,
        difficulty: availableSentences[i].difficulty
      });
    }
  });

  return testSentences;
};

const normaliseText = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[.,!?;:"()-]/g, '')
    .replace(/won't/g, 'will not')
    .replace(/can't/g, 'cannot')
    .replace(/n't/g, ' not')
    .replace(/'ll/g, ' will')
    .replace(/'re/g, ' are')
    .replace(/'ve/g, ' have')
    .replace(/'d/g, ' would')
    .replace(/'m/g, ' am')
    .replace(/\s+/g, ' ')
    .trim();
};

const calculateAccuracyScore = (spokenText, correctText) => {
  if (!spokenText || !correctText) {
    return { accuracy: 0, wordMatches: [] };
  }

  const spoken = normaliseText(spokenText);
  const correct = normaliseText(correctText);

  if (spoken === correct) {
    const words = correct.split(' ');
    return {
      accuracy: 100,
      wordMatches: words.map(word => ({ word, isCorrect: true }))
    };
  }

  const spokenWords = spoken.split(' ').filter(w => w.length > 0);
  const correctWords = correct.split(' ').filter(w => w.length > 0);
  
  let correctCount = 0;
  const wordMatches = [];
  const usedIndices = new Set();

  // First pass: exact matches in correct positions
  correctWords.forEach((correctWord, i) => {
    if (i < spokenWords.length && spokenWords[i] === correctWord) {
      wordMatches.push({ word: correctWord, isCorrect: true });
      correctCount++;
      usedIndices.add(i);
    } else {
      wordMatches.push({ word: correctWord, isCorrect: false });
    }
  });

  // Second pass: find misplaced words
  correctWords.forEach((correctWord, i) => {
    if (wordMatches[i].isCorrect) return;

    const foundIndex = spokenWords.findIndex((spokenWord, j) => 
      !usedIndices.has(j) && spokenWord === correctWord
    );

    if (foundIndex !== -1) {
      wordMatches[i] = { word: correctWord, isCorrect: true };
      correctCount++;
      usedIndices.add(foundIndex);
    }
  });

  const accuracy = correctWords.length > 0 ? Math.round((correctCount / correctWords.length) * 100) : 0;
  
  return { accuracy, wordMatches };
};

// ==============================================
// MAIN COMPONENT
// ==============================================

const SpeakingExercise = ({ onBack, onLogoClick }) => {
  // State
  const [currentSentence, setCurrentSentence] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [hasStarted, setHasStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [results, setResults] = useState([]);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  const [currentWordMatches, setCurrentWordMatches] = useState([]);
  
  // Refs for speech recognition
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const speechBufferRef = useRef('');
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef(null);

  // Get current sentence data
  const currentData = testSentences[currentSentence] || null;

  // ==============================================
  // SPEECH RECOGNITION SETUP
  // ==============================================

  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Recording started');
      setIsRecording(true);
      speechBufferRef.current = '';
      setSpokenText('');
      isProcessingRef.current = false;
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognition.onresult = (event) => {
      let latestTranscript = '';
      
      // Get the latest complete transcript
      for (let i = 0; i < event.results.length; i++) {
        latestTranscript += event.results[i][0].transcript;
      }
      
      if (latestTranscript.trim()) {
        speechBufferRef.current = latestTranscript.trim();
        setSpokenText(latestTranscript.trim());
        
        // Reset silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        
        // Set new silence timer (3 seconds)
        silenceTimerRef.current = setTimeout(() => {
          if (recognition && isRecording && !isProcessingRef.current) {
            console.log('🤫 Silence detected - stopping recording');
            recognition.stop();
          }
        }, 3000);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Recording ended');
      setIsRecording(false);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Process the captured speech
      const finalText = speechBufferRef.current.trim();
      if (finalText && !isProcessingRef.current) {
        console.log('✅ Processing speech:', finalText);
        processSpeechResult(finalText);
      } else {
        console.log('❌ No speech captured');
        handleNoSpeech();
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setSpokenText('Speech recognition failed. Please try again.');
        setShowFeedback(true);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  // ==============================================
  // SPEECH PROCESSING
  // ==============================================

  const processSpeechResult = useCallback((finalText) => {
    if (isProcessingRef.current || !currentData) return;
    
    isProcessingRef.current = true;
    
    console.log('🎯 Processing speech result:', finalText);
    console.log('🎯 Target text:', currentData.correctText);
    
    // Calculate accuracy
    const result = calculateAccuracyScore(finalText, currentData.correctText);
    
    console.log('📊 Accuracy calculated:', result.accuracy);
    
    // Update state
    setSpokenText(finalText);
    setCurrentAccuracy(result.accuracy);
    setCurrentWordMatches(result.wordMatches);
    setShowFeedback(true);
    
    // Store result for final scoring
    const questionResult = {
      questionNumber: currentSentence + 1,
      sentence: currentData.correctText,
      spokenText: finalText,
      accuracy: result.accuracy,
      level: currentData.level,
      wordMatches: result.wordMatches
    };
    
    setResults(prev => {
      const newResults = [...prev];
      newResults[currentSentence] = questionResult;
      console.log('💾 Stored result for question', currentSentence + 1, ':', questionResult);
      return newResults;
    });
    
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 100);
  }, [currentData, currentSentence]);

  const handleNoSpeech = useCallback(() => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    
    console.log('🔇 No speech detected');
    
    setSpokenText('No speech detected. Please try again.');
    setCurrentAccuracy(0);
    setCurrentWordMatches([]);
    setShowFeedback(true);
    
    // Store zero result
    const questionResult = {
      questionNumber: currentSentence + 1,
      sentence: currentData?.correctText || '',
      spokenText: 'No speech detected',
      accuracy: 0,
      level: currentData?.level || 'N/A',
      wordMatches: []
    };
    
    setResults(prev => {
      const newResults = [...prev];
      newResults[currentSentence] = questionResult;
      console.log('💾 Stored zero result for question', currentSentence + 1);
      return newResults;
    });
    
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 100);
  }, [currentData, currentSentence]);

  // ==============================================
  // HANDLERS
  // ==============================================

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || isRecording || isProcessingRef.current) return;
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      setSpokenText('Failed to start recording. Please try again.');
      setShowFeedback(true);
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current || !isRecording) return;
    
    try {
      isProcessingRef.current = true;
      recognitionRef.current.stop();
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleNext = useCallback(() => {
    if (currentSentence < testSentences.length - 1) {
      setCurrentSentence(prev => prev + 1);
      setTimeLeft(45);
      setSpokenText('');
      setShowFeedback(false);
      setCurrentAccuracy(0);
      setCurrentWordMatches([]);
      speechBufferRef.current = '';
    } else {
      setShowResults(true);
    }
  }, [currentSentence, testSentences.length]);

  const handleTimeUp = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      handleNoSpeech();
    }
  }, [isRecording, stopRecording, handleNoSpeech]);

  const playCorrectAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  const calculateOverallScore = useCallback(() => {
    if (results.length === 0) return { average: 0, breakdown: {} };
    
    const total = results.reduce((sum, result) => sum + (result?.accuracy || 0), 0);
    const average = Math.round(total / results.length);
    
    const breakdown = {};
    results.forEach(result => {
      if (!result) return;
      
      const level = result.level;
      if (!breakdown[level]) {
        breakdown[level] = { total: 0, count: 0 };
      }
      breakdown[level].total += result.accuracy;
      breakdown[level].count++;
    });
    
    Object.keys(breakdown).forEach(level => {
      breakdown[level].average = Math.round(breakdown[level].total / breakdown[level].count);
    });
    
    console.log('📊 Final results:', { average, breakdown, results });
    
    return { average, breakdown };
  }, [results]);

  const restartExercise = useCallback(() => {
    setHasStarted(false);
    setCurrentSentence(0);
    setTimeLeft(45);
    setSpokenText('');
    setIsRecording(false);
    setShowResults(false);
    setResults([]);
    setShowFeedback(false);
    setCurrentAccuracy(0);
    setCurrentWordMatches([]);
    speechBufferRef.current = '';
    isProcessingRef.current = false;
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    setTestSentences(generateSpeakingTest());
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ==============================================
  // EFFECTS
  // ==============================================

  useEffect(() => {
    setTestSentences(generateSpeakingTest());
    setupSpeechRecognition();
    
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [setupSpeechRecognition]);

  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !showResults && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasStarted && !showResults && !showFeedback) {
      handleTimeUp();
    }
  }, [timeLeft, hasStarted, showResults, showFeedback, handleTimeUp]);

  // ==============================================
  // RENDER
  // ==============================================

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
                    <span className="result-level">{result?.level || 'N/A'}</span>
                    <span className="result-score">{result?.accuracy || 0}%</span>
                  </div>
                  <div className="result-sentence">"{result?.sentence || 'No sentence'}"</div>
                  <div className="result-spoken">You said: "{result?.spokenText || 'No speech'}"</div>
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
                  💡 Completely rewritten for maximum reliability!
                </p>
              </div>
            </div>
            
            <button className="btn btn-primary btn-large" onClick={() => setHasStarted(true)}>
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

  return (
    <div className="speaking-container">
      <div className="speaking-quiz-container">
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

        <div className="speaking-main">
          <div className="level-indicator">
            <span className="level-badge">{currentData?.level}</span>
            <span className="level-description">{currentData?.difficulty}</span>
          </div>

          <div className="speaking-instruction">
            <h2>Record yourself saying the statement below</h2>
          </div>

          <div className="character-section">
            <div className="character">🎭</div>
            <div className="speech-bubble">
              "{currentData?.correctText}"
            </div>
          </div>

          <div className="recording-section">
            {!showFeedback ? (
              <div className="recording-controls">
                <button 
                  className={`record-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={timeLeft === 0 || isProcessingRef.current}
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
                <div className="accuracy-score" style={{ 
                  color: currentAccuracy >= 80 ? '#22c55e' : 
                         currentAccuracy >= 60 ? '#f59e0b' : '#ef4444' 
                }}>
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
                            backgroundColor: match.isCorrect ? '#c3e6cb' : '#f5c6cb',
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

          {isRecording && (
            <div className="recording-indicator">
              🔴 Recording... Speak clearly!
            </div>
          )}
          
          {isRecording && (
            <div className="recording-instructions">
              <p>💡 Recording will stop automatically after 3 seconds of silence</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakingExercise;
