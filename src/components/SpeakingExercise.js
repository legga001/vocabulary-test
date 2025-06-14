// src/components/SpeakingExercise.js - COMPLETELY FIXED VERSION
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

  TEST_STRUCTURE.forEach(({ level, count }) => {
    const availableSentences = [...SENTENCE_POOLS[level]];
    
    // Fisher-Yates shuffle
    for (let i = availableSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSentences[i], availableSentences[j]] = [availableSentences[j], availableSentences[i]];
    }
    
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

  console.log('Generated speaking test:', testSentences.length, 'sentences');
  return testSentences;
};

// IMPROVED: Enhanced text normalisation
const normaliseText = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[.,!?;:"()-]/g, '') // Remove punctuation
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

// FIXED: Enhanced accuracy calculation with phonetic similarity
const calculateAccuracyWithDetails = (spokenText, correctText) => {
  console.log('🧮 Calculating accuracy...');
  console.log('Spoken:', `"${spokenText}"`);
  console.log('Correct:', `"${correctText}"`);
  
  if (!spokenText || !correctText) {
    console.log('❌ Empty text provided');
    return {
      accuracy: 0,
      wordMatches: [],
      correctWords: correctText ? correctText.split(' ') : [],
      spokenWords: []
    };
  }
  
  const normalisedSpoken = normaliseText(spokenText);
  const normalisedCorrect = normaliseText(correctText);
  
  console.log('Normalised spoken:', `"${normalisedSpoken}"`);
  console.log('Normalised correct:', `"${normalisedCorrect}"`);
  
  const spokenWords = normalisedSpoken.split(' ').filter(word => word.length > 0);
  const correctWords = normalisedCorrect.split(' ').filter(word => word.length > 0);
  
  console.log('Spoken words:', spokenWords);
  console.log('Correct words:', correctWords);
  
  if (correctWords.length === 0) {
    return {
      accuracy: 0,
      wordMatches: [],
      correctWords: [],
      spokenWords: spokenWords
    };
  }
  
  const wordMatches = [];
  let correctCount = 0;
  
  // Create a copy of spoken words to track usage
  const availableSpokenWords = [...spokenWords];
  
  // Match each correct word with the best available spoken word
  correctWords.forEach((correctWord, correctIndex) => {
    let bestMatch = null;
    let bestSimilarity = 0;
    let bestSpokenIndex = -1;
    
    // Find the best match among remaining spoken words
    availableSpokenWords.forEach((spokenWord, spokenIndex) => {
      if (spokenWord === null) return; // Already used
      
      let similarity = 0;
      
      // Exact match gets full points
      if (spokenWord === correctWord) {
        similarity = 1.0;
      } else {
        // Calculate string similarity for partial matches
        similarity = calculateStringSimilarity(spokenWord, correctWord);
        
        // Boost similarity for phonetically similar words
        if (similarity > 0.4) {
          similarity = Math.min(1.0, similarity + 0.1);
        }
      }
      
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = spokenWord;
        bestSpokenIndex = spokenIndex;
      }
    });
    
    // Determine if this word is considered correct
    const isCorrect = bestSimilarity >= 0.7; // Lowered threshold for speech recognition
    if (isCorrect) correctCount++;
    
    // Mark the spoken word as used
    if (bestSpokenIndex >= 0) {
      availableSpokenWords[bestSpokenIndex] = null;
    }
    
    wordMatches.push({
      correctWord: correctWord,
      spokenWord: bestMatch || '',
      similarity: bestSimilarity,
      isCorrect: isCorrect,
      index: correctIndex
    });
    
    console.log(`Word ${correctIndex + 1}: "${correctWord}" vs "${bestMatch}" = ${Math.round(bestSimilarity * 100)}% ${isCorrect ? '✅' : '❌'}`);
  });
  
  const accuracy = correctWords.length > 0 ? Math.round((correctCount / correctWords.length) * 100) : 0;
  
  console.log(`✅ Matched ${correctCount}/${correctWords.length} words`);
  console.log(`📊 Final Accuracy: ${accuracy}%`);
  
  return {
    accuracy,
    wordMatches,
    correctWords,
    spokenWords
  };
};

// Enhanced string similarity with better phonetic handling
const calculateStringSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // Levenshtein distance calculation
  const matrix = [];
  const n = s1.length;
  const m = s2.length;

  for (let i = 0; i <= n; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= m; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const maxLength = Math.max(n, m);
  const similarity = (maxLength - matrix[n][m]) / maxLength;
  
  // Boost for common phonetic similarities
  if (similarity > 0.3) {
    // Check for common speech recognition confusions
    const phoneticPairs = [
      ['s', 'z'], ['f', 'v'], ['b', 'p'], ['d', 't'], ['g', 'k'],
      ['th', 'f'], ['th', 's'], ['ing', 'in'], ['ed', 'd']
    ];
    
    let phoneticBoost = 0;
    phoneticPairs.forEach(([sound1, sound2]) => {
      if ((s1.includes(sound1) && s2.includes(sound2)) || 
          (s1.includes(sound2) && s2.includes(sound1))) {
        phoneticBoost += 0.05;
      }
    });
    
    return Math.min(1.0, similarity + phoneticBoost);
  }
  
  return similarity;
};

// Get accuracy level with appropriate feedback
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
  // Core state
  const [currentSentence, setCurrentSentence] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  const [currentWordMatches, setCurrentWordMatches] = useState([]);
  
  // Recording management state
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [hasReceivedAnySpeech, setHasReceivedAnySpeech] = useState(false);
  const [isProcessingResult, setIsProcessingResult] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  
  // Refs
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Get current sentence data
  const currentData = testSentences[currentSentence] || null;

  // ==============================================
  // EFFECTS
  // ==============================================
  
  // Generate test sentences and setup speech recognition
  useEffect(() => {
    const sentences = generateSpeakingTest();
    setTestSentences(sentences);
    
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      
      // Create and configure recognition instance
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.lang = 'en-GB'; // British English
      
      console.log('🎤 Speech recognition initialised');
    } else {
      console.error('❌ Speech recognition not supported');
    }

    return () => {
      // Cleanup
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Cleanup error:', error);
        }
      }
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (!hasStarted || timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, showResults]);

  // Setup speech recognition event handlers
  useEffect(() => {
    if (!recognitionRef.current || !speechSupported) return;

    const recognition = recognitionRef.current;

    // FIXED: Improved speech result handler
    recognition.onresult = (event) => {
      console.log('🎯 Speech result event:', event);
      
      let interimTranscript = '';
      let finalTranscript = '';
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          console.log('📝 Final transcript:', transcript);
        } else {
          interimTranscript += transcript;
          console.log('⏳ Interim transcript:', transcript);
        }
      }
      
      // Update state with any speech (interim or final)
      const currentTranscript = finalTranscript || interimTranscript;
      if (currentTranscript.trim()) {
        setSpokenText(currentTranscript);
        setHasReceivedAnySpeech(true);
        
        // Store final transcript separately
        if (finalTranscript) {
          setFinalTranscript(prev => prev + ' ' + finalTranscript);
        }
        
        // Reset silence timer on any speech
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
        
        // Start new silence timer (2 seconds)
        const newTimer = setTimeout(() => {
          console.log('🤫 2 seconds of silence - auto stopping');
          if (isRecording && recognition) {
            stopRecording();
          }
        }, 2000);
        setSilenceTimer(newTimer);
      }
    };

    // FIXED: Better error handling
    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      
      // Clear timers
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      setIsRecording(false);
      
      // Handle specific errors
      if (event.error === 'no-speech') {
        if (!hasReceivedAnySpeech) {
          setSpokenText('No speech detected. Please try speaking louder and closer to your microphone.');
          setCurrentAccuracy(0);
          setCurrentWordMatches([]);
          setShowFeedback(true);
        }
      } else if (event.error === 'aborted') {
        // Normal when manually stopping - process any captured speech
        console.log('🛑 Recognition stopped');
        if (hasReceivedAnySpeech) {
          processCurrentSpeech();
        }
      } else {
        setSpokenText(`Speech recognition error: ${event.error}. Please try again.`);
        setShowFeedback(true);
      }
    };

    // FIXED: Handle recognition end
    recognition.onend = () => {
      console.log('🏁 Recognition ended');
      setIsRecording(false);
      
      // Clear silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      // Process speech if we haven't already and we received some
      if (!isProcessingResult && hasReceivedAnySpeech) {
        processCurrentSpeech();
      }
    };

    recognition.onstart = () => {
      console.log('▶️ Recognition started');
      setIsRecording(true);
    };

    // Cleanup function
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onstart = null;
    };
  }, [isRecording, silenceTimer, hasReceivedAnySpeech, isProcessingResult]);

  // ==============================================
  // HANDLER FUNCTIONS
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
    if (!speechSupported || !recognitionRef.current) {
      console.error('❌ Speech recognition not available');
      return;
    }
    
    console.log('🎙️ Starting recording');
    
    // Reset all recording state
    setSpokenText('');
    setFinalTranscript('');
    setShowFeedback(false);
    setCurrentAccuracy(0);
    setCurrentWordMatches([]);
    setHasReceivedAnySpeech(false);
    setIsProcessingResult(false);
    
    // Clear any existing timers
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

  const stopRecording = () => {
    if (!recognitionRef.current || !isRecording) return;
    
    console.log('🛑 Manually stopping recording');
    
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
  };

  // FIXED: Process current speech function
  const processCurrentSpeech = () => {
    if (isProcessingResult) {
      console.log('⚠️ Already processing result, skipping');
      return;
    }
    
    setIsProcessingResult(true);
    console.log('🎯 Processing speech result');
    
    // Use final transcript if available, otherwise use current spoken text
    const textToProcess = finalTranscript.trim() || spokenText.trim();
    console.log('Text to process:', `"${textToProcess}"`);
    
    if (!textToProcess) {
      console.log('❌ No text to process');
      setSpokenText('No speech was detected. Please try again.');
      setCurrentAccuracy(0);
      setCurrentWordMatches([]);
      setShowFeedback(true);
      setIsProcessingResult(false);
      return;
    }
    
    if (!currentData) {
      console.error('❌ No current sentence data');
      setIsProcessingResult(false);
      return;
    }
    
    // Calculate accuracy
    const result = calculateAccuracyWithDetails(textToProcess, currentData.correctText);
    
    console.log('📊 Accuracy result:', result);
    
    // Update state with results
    setSpokenText(textToProcess);
    setCurrentAccuracy(result.accuracy);
    setCurrentWordMatches(result.wordMatches || []);
    setShowFeedback(true);
    setIsProcessingResult(false);
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
    
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    
    // Process any captured speech or show timeout
    setTimeout(() => {
      if (spokenText && spokenText.trim()) {
        processCurrentSpeech();
      } else {
        setSpokenText('Time is up! No speech was recorded.');
        setCurrentAccuracy(0);
        setCurrentWordMatches([]);
        setShowFeedback(true);
      }
    }, 500);
  };

  const handleNext = () => {
    if (!currentData) return;

    console.log('➡️ Moving to next question');

    // Store the result
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
      
      // Reset all state for next question
      setSpokenText('');
      setFinalTranscript('');
      setTimeLeft(45);
      setIsRecording(false);
      setShowFeedback(false);
      setCurrentAccuracy(0);
      setCurrentWordMatches([]);
      setHasReceivedAnySpeech(false);
      setIsProcessingResult(false);
      
      // Clear timers
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
    const good = answers.filter(a => a.accuracy >= 60 && a.accuracy < 90).length;
    const needsPractice = answers.filter(a => a.accuracy < 60).length;
    
    return { 
      average, 
      total: answers.length,
      excellent,
      good,
      needsPractice
    };
  };

  const restartTest = () => {
    setCurrentSentence(0);
    setTimeLeft(45);
    setIsRecording(false);
    setSpokenText('');
    setFinalTranscript('');
    setShowResults(false);
    setAnswers([]);
    setHasStarted(false);
    setShowFeedback(false);
    setCurrentAccuracy(0);
    setCurrentWordMatches([]);
    setHasReceivedAnySpeech(false);
    setIsProcessingResult(false);
    
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    
    // Generate new sentences
    const newSentences = generateSpeakingTest();
    setTestSentences(newSentences);
  };

  // ==============================================
  // RENDER
  // ==============================================

  // No speech support
  if (!speechSupported) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          <div className="no-support-message">
            <h2>🎤 Speech Recognition Not Supported</h2>
            <p>Your browser doesn't support speech recognition. Please try using:</p>
            <ul>
              <li>Google Chrome (recommended)</li>
              <li>Microsoft Edge</li>
              <li>Safari (on macOS/iOS)</li>
            </ul>
            <button onClick={onBack} className="back-btn">
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const score = calculateOverallScore();

    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Exercise Results</h1>
          
          <div className="results">
            <h2>🎉 Test Complete!</h2>
            <div className="score-display">{score.average}%</div>
            <div className="score-subtitle">Average Accuracy</div>
            
            <div className="score-breakdown">
              <div className="breakdown-item excellent">
                <span className="breakdown-icon">🌟</span>
                <span className="breakdown-count">{score.excellent}</span>
                <span className="breakdown-label">Excellent (90%+)</span>
              </div>
              <div className="breakdown-item good">
                <span className="breakdown-icon">✅</span>
                <span className="breakdown-count">{score.good}</span>
                <span className="breakdown-label">Good (60-89%)</span>
              </div>
              <div className="breakdown-item needs-practice">
                <span className="breakdown-icon">📚</span>
                <span className="breakdown-count">{score.needsPractice}</span>
                <span className="breakdown-label">Needs Practice (&lt;60%)</span>
              </div>
            </div>
            
            <div className="level-estimate">
              <h3>Speaking Assessment</h3>
              <p>
                {score.average >= 85 ? "Outstanding pronunciation! Your speaking is very clear and accurate." :
                 score.average >= 70 ? "Great speaking skills! You communicate very effectively." :
                 score.average >= 55 ? "Good progress! Continue practising to improve your pronunciation." :
                 "Keep working on your speaking. Regular practice will help improve your clarity."}
              </p>
            </div>

            <div className="detailed-results">
              <h3>📝 Detailed Results:</h3>
              <div className="results-list">
                {answers.map((answer, index) => {
                  const level = getAccuracyLevel(answer.accuracy);
                  
                  return (
                    <div key={index} className={`result-item accuracy-${Math.floor(answer.accuracy / 20) * 20}`}>
                      <div className="result-header">
                        <span className="result-emoji">{level.emoji}</span>
                        <span className="result-level">{answer.sentence.level}</span>
                        <span className="result-number">#{index + 1}</span>
                        <span className="result-accuracy">{answer.accuracy}%</span>
                      </div>
                      <div className="result-content">
                        <div className="result-status" style={{ color: level.color }}>
                          <strong>{level.level}</strong>
                        </div>
                        <div className="correct-text">
                          <strong>Target:</strong> "{answer.sentence.correctText}"
                        </div>
                        <div className="spoken-text">
                          <strong>You said:</strong> "{answer.spokenText}"
                        </div>
                        {answer.wordMatches && answer.wordMatches.length > 0 && (
                          <div className="word-analysis">
                            <strong>Word analysis:</strong>
                            <div className="word-matches">
                              {answer.wordMatches.map((match, idx) => (
                                <span
                                  key={idx}
                                  className={`word-match ${match.isCorrect ? 'correct' : 'incorrect'}`}
                                  title={`${match.correctWord}: ${Math.round(match.similarity * 100)}% match`}
                                >
                                  {match.correctWord} {match.isCorrect ? '✅' : '❌'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="result-actions">
              <button onClick={restartTest} className="retry-btn">
                🔄 Try Again
              </button>
              <button onClick={onBack} className="back-btn">
                ← Back to Exercises
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-start screen
  if (!hasStarted) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <div className="exercise-intro">
            <h1>🎤 Speaking Exercise</h1>
            <div className="intro-content">
              <div className="instructions">
                <h3>📋 Instructions:</h3>
                <ul>
                  <li>🎧 Listen to each sentence by clicking the audio button</li>
                  <li>🎤 Click "Start Recording" and repeat the sentence clearly</li>
                  <li>⏱️ Recording automatically stops after 2 seconds of silence</li>
                  <li>📊 You'll receive instant feedback on your pronunciation accuracy</li>
                  <li>⏰ You have 45 seconds per sentence</li>
                </ul>
              </div>
              
              <div className="test-info">
                <h3>📚 Test Information:</h3>
                <p><strong>{testSentences.length}</strong> sentences across levels A2 to C1</p>
                <p>Pronunciation accuracy will be assessed using advanced speech recognition</p>
                <p>Make sure you're in a quiet environment with a good microphone</p>
              </div>
              
              <div className="tips">
                <h3>💡 Tips for Best Results:</h3>
                <ul>
                  <li>🔇 Find a quiet environment</li>
                  <li>🎤 Speak clearly and at normal volume</li>
                  <li>🐌 Don't rush - take your time to pronounce each word</li>
                  <li>📱 Allow microphone access when prompted</li>
                </ul>
              </div>
            </div>
            
            <button onClick={startExercise} className="start-btn">
              🚀 Start Speaking Exercise
            </button>
            
            <button onClick={onBack} className="back-btn">
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main exercise screen
  return (
    <div className="speaking-container">
      <div className="speaking-quiz-container">
        <div className="speaking-header">
          <div className="timer-section">
            <span className="timer-icon">⏰</span>
            <span className={`timer-text ${timeLeft <= 10 ? 'urgent' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <div className="progress-section">
            Question {currentSentence + 1} of {testSentences.length}
          </div>
          
          <button onClick={onBack} className="close-btn" title="Close exercise">
            ✕
          </button>
        </div>

        <div className="speaking-main">
          {currentData && (
            <>
              <div className="level-indicator">
                <div className="level-badge">{currentData.level}</div>
                <div className="level-description">{currentData.difficulty}</div>
              </div>

              <div className="sentence-section">
                <h2>🎯 Repeat this sentence:</h2>
                <div className="target-sentence">
                  "{currentData.correctText}"
                </div>
                
                <div className="audio-section">
                  <button onClick={playCorrectAudio} className="audio-btn">
                    🔊 Listen to Pronunciation
                  </button>
                  <audio 
                    ref={audioRef} 
                    src={currentData.audioFile}
                    preload="auto"
                  />
                </div>
              </div>

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
                    
                    {isRecording && (
                      <div className="recording-info">
                        <div className="recording-indicator">
                          <span className="pulse-dot">🔴</span>
                          <span>Recording... speak clearly!</span>
                        </div>
                        <div className="recording-tips">
                          Auto-stops after 2 seconds of silence
                        </div>
                        {spokenText && (
                          <div className="live-transcript">
                            <strong>Hearing:</strong> "{spokenText}"
                          </div>
                        )}
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
                    
                    <div className="spoken-result">
                      <h4>What you said:</h4>
                      <div className="spoken-text">"{spokenText}"</div>
                    </div>
                    
                    {currentWordMatches.length > 0 && (
                      <div className="word-analysis-section">
                        <h4>Word-by-word analysis:</h4>
                        <div className="word-analysis-container">
                          {currentWordMatches.map((match, index) => (
                            <span 
                              key={index}
                              className={`word-analysis-item ${match.isCorrect ? 'correct' : 'incorrect'}`}
                              title={`"${match.correctWord}" - ${Math.round(match.similarity * 100)}% accuracy`}
                            >
                              {match.correctWord} {match.isCorrect ? '✅' : '❌'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="feedback-actions">
                      <button onClick={playCorrectAudio} className="listen-again-btn">
                        🔊 Listen Again
                      </button>
                      <button 
                        onClick={handleNext} 
                        className="next-btn"
                      >
                        {currentSentence + 1 < testSentences.length ? 'Next Question →' : 'Finish Test 🏁'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpeakingExercise;
