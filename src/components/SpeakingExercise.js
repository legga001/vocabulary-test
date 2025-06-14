// src/components/SpeakingExercise.js - Complete rewrite as proper React component
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { recordTestResult } from '../utils/progressDataManager';

// Game states for better state management
const GAME_STATES = {
  CHECKING: 'checking',
  INSTRUCTIONS: 'instructions', 
  PLAYING: 'playing',
  RECORDING: 'recording',
  FEEDBACK: 'feedback',
  RESULTS: 'results',
  ERROR: 'error'
};

// Enhanced homophones map for British English
const HOMOPHONES = {
  'to': ['too', 'two'], 'too': ['to', 'two'], 'two': ['to', 'too'],
  'there': ['their', 'theyre'], 'their': ['there', 'theyre'], 'theyre': ['there', 'their'],
  'your': ['youre'], 'youre': ['your'],
  'its': ['it\'s'], 'it\'s': ['its'],
  'where': ['wear', 'ware'], 'wear': ['where', 'ware'],
  'here': ['hear'], 'hear': ['here'],
  'no': ['know'], 'know': ['no'],
  'right': ['write', 'rite'], 'write': ['right', 'rite'],
  'peace': ['piece'], 'piece': ['peace'],
  'break': ['brake'], 'brake': ['break'],
  'would': ['wood'], 'wood': ['would'],
  'weather': ['whether'], 'whether': ['weather'],
  'for': ['four', 'fore'], 'four': ['for', 'fore'], 'fore': ['for', 'four'],
  'been': ['bean'], 'bean': ['been'],
  'by': ['buy', 'bye'], 'buy': ['by', 'bye'], 'bye': ['by', 'buy'],
  'hour': ['our'], 'our': ['hour'],
  'week': ['weak'], 'weak': ['week'],
  'allowed': ['aloud'], 'aloud': ['allowed'],
  'threw': ['through'], 'through': ['threw'],
  'mail': ['male'], 'male': ['mail'],
  'principal': ['principle'], 'principle': ['principal']
};

function SpeakingExercise({ onBack, onLogoClick }) {
  // Core state
  const [gameState, setGameState] = useState(GAME_STATES.CHECKING);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentences, setSentences] = useState([]);
  const [results, setResults] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [testStartTime, setTestStartTime] = useState(null);
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  // Refs
  const recognitionRef = useRef(null);

  // Current sentence data
  const currentSentence = sentences[currentIndex];
  const progress = sentences.length > 0 ? ((currentIndex + 1) / sentences.length) * 100 : 0;

  // Check for speech recognition support and permissions
  const checkSpeechRecognition = useCallback(async () => {
    console.log('🎤 Checking speech recognition support...');
    
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('❌ Speech recognition not supported');
      setGameState(GAME_STATES.ERROR);
      setFeedback({
        type: 'error',
        title: 'Browser Not Supported',
        message: 'Your browser doesn\'t support speech recognition. Please use Chrome, Edge, or Safari.'
      });
      return;
    }

    // Check microphone permissions
    try {
      console.log('🎤 Checking microphone permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up
      
      console.log('✅ Microphone access granted');
      setGameState(GAME_STATES.INSTRUCTIONS);
      setFeedback({
        type: 'success',
        message: 'Microphone ready! You can start the exercise.'
      });
    } catch (error) {
      console.log('❌ Microphone access denied:', error);
      setGameState(GAME_STATES.ERROR);
      setFeedback({
        type: 'error',
        title: 'Microphone Access Required',
        message: 'Please allow microphone access to use this exercise. Refresh the page and try again.'
      });
    }
  }, []);

  // Initialise speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB'; // British English

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setCurrentTranscript('');
      setConfidence(0);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const resultConfidence = event.results[i][0].confidence || 0;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          setConfidence(resultConfidence);
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript + interimTranscript;
      setCurrentTranscript(fullTranscript);
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsRecording(false);
      
      let errorMessage = 'Speech recognition error. ';
      switch (event.error) {
        case 'no-speech':
          errorMessage += 'No speech detected. Please speak louder.';
          break;
        case 'audio-capture':
          errorMessage += 'Microphone error. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage += 'Microphone access denied. Please allow access and refresh.';
          break;
        default:
          errorMessage += `Error: ${event.error}`;
      }
      
      setFeedback({ type: 'error', message: errorMessage });
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      if (isRecording) {
        stopRecording();
      }
    };

    return recognition;
  }, [isRecording]);

  // Load test sentences
  const loadSentences = useCallback(() => {
    console.log('📚 Loading sentences for speaking test...');
    const testSentences = [];
    
    TEST_STRUCTURE.forEach(({ level, count }) => {
      const levelSentences = SENTENCE_POOLS[level];
      if (!levelSentences) {
        console.warn(`No sentences found for level ${level}`);
        return;
      }
      
      // Shuffle and select sentences
      const shuffled = [...levelSentences].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));
      
      selected.forEach(sentence => {
        testSentences.push({
          text: sentence.correctText,
          level: level,
          audioFile: sentence.audioFile,
          difficulty: sentence.difficulty
        });
      });
    });
    
    console.log(`✅ Loaded ${testSentences.length} sentences`);
    setSentences(testSentences);
    setTestStartTime(Date.now());
  }, []);

  // Start the exercise
  const startExercise = useCallback(() => {
    console.log('🚀 Starting speaking exercise');
    loadSentences();
    recognitionRef.current = initSpeechRecognition();
    setGameState(GAME_STATES.PLAYING);
    setCurrentIndex(0);
    setResults([]);
  }, [loadSentences, initSpeechRecognition]);

  // Play audio for results page
  const playAudioForSentence = useCallback((audioFile) => {
    if (!audioFile) {
      setFeedback({ type: 'error', message: 'Audio file not available' });
      return;
    }

    console.log('🔊 Playing audio:', audioFile);
    const audio = new Audio(`/${audioFile}`);
    
    audio.play()
      .then(() => {
        console.log('Audio played successfully');
      })
      .catch(error => {
        console.error('Error playing audio:', error);
        setFeedback({ type: 'error', message: 'Error playing audio file' });
      });
  }, []);

  // Restart current recording
  const restartRecording = useCallback(() => {
    console.log('🔄 Restarting recording for current sentence');
    
    // Stop current recording if active
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    
    // Reset transcript and state
    setCurrentTranscript('');
    setConfidence(0);
    setIsRecording(false);
    setFeedback({ type: 'info', message: 'Recording restarted - try again!' });
    setGameState(GAME_STATES.PLAYING);
  }, [isRecording]);
  const startRecording = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition();
    }

    if (!recognitionRef.current) {
      setFeedback({ type: 'error', message: 'Speech recognition not available' });
      return;
    }

    console.log('🎤 Starting recording...');
    setGameState(GAME_STATES.RECORDING);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setFeedback({ type: 'error', message: 'Failed to start recording' });
    }
  }, [initSpeechRecognition]);

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log('🛑 Stopping recording...');
    setIsRecording(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Process the recording
    const recordingDuration = recordingStartTime ? (Date.now() - recordingStartTime) / 1000 : 0;
    processRecording(currentTranscript.trim(), recordingDuration);
  }, [currentTranscript, recordingStartTime]);

  // Calculate detailed score with forgiving algorithm
  const calculateScore = useCallback((spoken, target) => {
    const normalise = (text) => {
      return text.toLowerCase()
        .replace(/[.,!?;:'"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const spokenWords = normalise(spoken).split(' ').filter(word => word.length > 0);
    const targetWords = normalise(target).split(' ').filter(word => word.length > 0);
    
    // If no speech detected, return 0
    if (spokenWords.length === 0) {
      return {
        percentage: 0,
        matchedWords: 0,
        totalWords: targetWords.length
      };
    }
    
    // Create a set of target words for easy lookup
    const targetWordSet = new Set(targetWords);
    const targetWordMap = new Map();
    
    // Count occurrences of each target word
    targetWords.forEach(word => {
      targetWordMap.set(word, (targetWordMap.get(word) || 0) + 1);
    });
    
    // Count how many target words are present in spoken words
    let correctWordsFound = 0;
    const spokenWordMap = new Map();
    
    // Count occurrences of each spoken word
    spokenWords.forEach(word => {
      spokenWordMap.set(word, (spokenWordMap.get(word) || 0) + 1);
    });
    
    // For each target word, check if it appears in spoken words
    targetWordMap.forEach((targetCount, word) => {
      const spokenCount = spokenWordMap.get(word) || 0;
      
      // Count the minimum of target and spoken occurrences
      const matchedCount = Math.min(targetCount, spokenCount);
      correctWordsFound += matchedCount;
      
      // Also check homophones
      if (matchedCount === 0 && HOMOPHONES[word]) {
        for (const homophone of HOMOPHONES[word]) {
          const homophoneCount = spokenWordMap.get(homophone) || 0;
          if (homophoneCount > 0) {
            correctWordsFound += Math.min(targetCount, homophoneCount);
            break; // Only count one homophone match per target word
          }
        }
      }
    });
    
    // Calculate percentage based on target words found
    // This is much more forgiving - focuses on content rather than exact order
    const basePercentage = (correctWordsFound / targetWords.length) * 100;
    
    // Apply slight penalty for excessive repetition or extra words
    const lengthRatio = spokenWords.length / targetWords.length;
    let lengthPenalty = 0;
    
    if (lengthRatio > 2) {
      // Significant penalty for very long responses (more than double length)
      lengthPenalty = 15;
    } else if (lengthRatio > 1.5) {
      // Moderate penalty for somewhat long responses
      lengthPenalty = 10;
    } else if (lengthRatio > 1.2) {
      // Small penalty for slightly long responses
      lengthPenalty = 5;
    }
    
    const finalPercentage = Math.max(0, Math.min(100, Math.round(basePercentage - lengthPenalty)));
    
    return {
      percentage: finalPercentage,
      matchedWords: correctWordsFound,
      totalWords: targetWords.length
    };
  }, []);

  // Process recording result
  const processRecording = useCallback((transcript, duration) => {
    if (!transcript) {
      setFeedback({ type: 'warning', message: 'No speech detected. Try again!' });
      setGameState(GAME_STATES.PLAYING);
      return;
    }

    const scoreData = calculateScore(transcript, currentSentence.text);
    
    // Store result
    const result = {
      target: currentSentence.text,
      spoken: transcript,
      score: scoreData.percentage,
      level: currentSentence.level,
      duration: duration,
      confidence: confidence,
      matchedWords: scoreData.matchedWords,
      totalWords: scoreData.totalWords
    };
    
    setResults(prev => [...prev, result]);
    
    // Show feedback
    let feedbackMessage = '';
    let feedbackType = 'info';
    
    if (scoreData.percentage >= 90) {
      feedbackMessage = `Excellent! ${scoreData.percentage}% accuracy 🌟`;
      feedbackType = 'success';
    } else if (scoreData.percentage >= 70) {
      feedbackMessage = `Good job! ${scoreData.percentage}% accuracy 👍`;
      feedbackType = 'success';
    } else if (scoreData.percentage >= 50) {
      feedbackMessage = `Not bad! ${scoreData.percentage}% accuracy 📈`;
      feedbackType = 'warning';
    } else {
      feedbackMessage = `Keep practising! ${scoreData.percentage}% accuracy 💪`;
      feedbackType = 'error';
    }
    
    setFeedback({ type: feedbackType, message: feedbackMessage });
    setGameState(GAME_STATES.FEEDBACK);
    
    // Auto-advance after delay
    setTimeout(() => {
      if (currentIndex + 1 < sentences.length) {
        setCurrentIndex(prev => prev + 1);
        setCurrentTranscript('');
        setConfidence(0);
        setFeedback(null); // Clear feedback for next question
        setGameState(GAME_STATES.PLAYING);
      } else {
        finishExercise();
      }
    }, 3000);
  }, [calculateScore, currentSentence, confidence, currentIndex, sentences.length]);

  // Skip current sentence
  const skipSentence = useCallback(() => {
    console.log('⏭️ Skipping sentence');
    
    const result = {
      target: currentSentence.text,
      spoken: '',
      score: 0,
      level: currentSentence.level,
      duration: 0,
      confidence: 0,
      matchedWords: 0,
      totalWords: currentSentence.text.split(' ').length
    };
    
    setResults(prev => [...prev, result]);
    setFeedback({ type: 'info', message: 'Sentence skipped' });
    
    if (currentIndex + 1 < sentences.length) {
      setCurrentIndex(prev => prev + 1);
      setCurrentTranscript('');
      setConfidence(0);
      setFeedback(null); // Clear feedback for next question
    } else {
      finishExercise();
    }
  }, [currentSentence, currentIndex, sentences.length]);

  // Finish exercise and show results
  const finishExercise = useCallback(() => {
    console.log('🏁 Finishing exercise');
    const testDuration = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : 0;
    
    // Save results to progress tracking
    const overallScore = results.length > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : 0;
    
    try {
      const userAnswers = results.map(result => ({
        answer: result.spoken || '',
        correct: result.score >= 70,
        score: result.score,
        level: result.level
      }));
      
      console.log('🎤 About to call recordTestResult with:', {
        quizType: 'speak-and-record',
        score: Math.round(overallScore / 10),
        totalQuestions: 10,
        overallPercentage: Math.round(overallScore)
      });
      
      recordTestResult({
        quizType: 'speak-and-record',
        score: Math.round(overallScore / 10), // Convert percentage to score out of 10
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: testDuration,
        userAnswers: userAnswers
      });
      
      console.log('✅ recordTestResult called successfully');
      
    } catch (error) {
      console.error('❌ Error saving test results:', error);
    }
    
    setGameState(GAME_STATES.RESULTS);
  }, [results, testStartTime]);

  // Restart exercise
  const restartExercise = useCallback(() => {
    console.log('🔄 Restarting exercise');
    setCurrentIndex(0);
    setResults([]);
    setCurrentTranscript('');
    setConfidence(0);
    setFeedback(null);
    startExercise();
  }, [startExercise]);

  // Check speech recognition on component mount
  useEffect(() => {
    checkSpeechRecognition();
    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [checkSpeechRecognition]);

  // Calculate final results
  const finalResults = useMemo(() => {
    if (results.length === 0) return null;
    
    const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const completedSentences = results.filter(r => r.spoken).length;
    const testDuration = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : 0;
    
    // Level breakdown
    const levelScores = {};
    results.forEach(result => {
      if (!levelScores[result.level]) {
        levelScores[result.level] = { total: 0, count: 0 };
      }
      levelScores[result.level].total += result.score;
      levelScores[result.level].count++;
    });
    
    const levelAverages = {};
    Object.entries(levelScores).forEach(([level, data]) => {
      levelAverages[level] = data.count > 0 ? Math.round(data.total / data.count) : 0;
    });
    
    return {
      totalScore: Math.round(totalScore),
      completedSentences,
      totalSentences: sentences.length,
      testDuration,
      levelAverages
    };
  }, [results, sentences.length, testStartTime]);

  // Format duration
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }, []);

  // Render error state
  if (gameState === GAME_STATES.ERROR) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise</h1>
          
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>{feedback?.title || 'Error'}</h2>
            <p>{feedback?.message}</p>
            
            <div className="browser-support">
              <h3>Supported Browsers:</h3>
              <ul>
                <li>✅ Google Chrome (recommended)</li>
                <li>✅ Microsoft Edge</li>
                <li>✅ Safari (Mac/iOS)</li>
                <li>❌ Firefox (limited support)</li>
              </ul>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={checkSpeechRecognition}>
                🔄 Try Again
              </button>
              <button className="btn btn-secondary" onClick={onBack} style={{ marginLeft: '10px' }}>
                ← Back to Exercises
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render instructions
  if (gameState === GAME_STATES.INSTRUCTIONS) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise</h1>
          
          <div className="instructions-container">
            <div className="instruction-content">
              <h3>📋 How it Works</h3>
              
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="instruction-icon">👀</span>
                  <span>Read the sentence displayed on screen</span>
                </div>
                
                <div className="instruction-item">
                  <span className="instruction-icon">🎤</span>
                  <span>Click "Start Recording" and speak the sentence clearly</span>
                </div>
                
                <div className="instruction-item">
                  <span className="instruction-icon">⏹️</span>
                  <span>Click "Stop Recording" when you've finished speaking</span>
                </div>
                
                <div className="instruction-item">
                  <span className="instruction-icon">📊</span>
                  <span>Get instant feedback on your pronunciation accuracy</span>
                </div>
                
                <div className="instruction-item">
                  <span className="instruction-icon">🎯</span>
                  <span>Complete {sentences.length || 10} sentences across difficulty levels</span>
                </div>
              </div>
              
              <div className="tips-section">
                <h4>💡 Speaking Tips:</h4>
                <ul>
                  <li>Speak clearly and at a normal pace</li>
                  <li>Find a quiet environment</li>
                  <li>Pronounce each word distinctly</li>
                  <li>British and American pronunciations are both accepted</li>
                </ul>
              </div>
              
              {feedback && (
                <div className={`feedback ${feedback.type}`}>
                  {feedback.message}
                </div>
              )}
            </div>
            
            <button className="btn btn-primary btn-large" onClick={startExercise}>
              🎤 Start Speaking Exercise
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Render results
  if (gameState === GAME_STATES.RESULTS) {
    return (
      <div className="exercise-page scrollable-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise Results</h1>
          
          <div className="results">
            <h2>🎉 Exercise Complete!</h2>
            <div className="score-display">{finalResults?.totalScore || 0}%</div>
            
            <div className="level-estimate">
              <h3>Speaking Practice Complete</h3>
              <p>You completed {finalResults?.completedSentences || 0} of {finalResults?.totalSentences || 0} sentences</p>
            </div>

            <div className="test-stats">
              <p>⏱️ Time taken: {formatDuration(finalResults?.testDuration || 0)}</p>
              <p>📊 Overall accuracy: {finalResults?.totalScore || 0}%</p>
            </div>

            {finalResults?.levelAverages && (
              <div className="level-breakdown">
                <h3>Performance by Level:</h3>
                <div className="level-scores">
                  {Object.entries(finalResults.levelAverages).map(([level, score]) => (
                    <div key={level} className="level-score-item">
                      <span className="level-name">{level}:</span>
                      <span className="level-score">{score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detailed-results">
              <h3>📝 Detailed Results:</h3>
              <div className="results-list">
                {results.map((result, index) => (
                  <div key={index} className={`result-item ${result.score >= 70 ? 'success' : result.score >= 50 ? 'warning' : 'error'}`}>
                    <div className="result-header">
                      <h4>Sentence {index + 1} ({result.level}): {result.score}%</h4>
                      <div className="result-actions">
                        {result.duration > 0 && (
                          <span className="duration">⏱️ {result.duration.toFixed(1)}s</span>
                        )}
                        {sentences[index]?.audioFile && (
                          <button 
                            className="btn btn-small btn-secondary audio-play-btn"
                            onClick={() => playAudioForSentence(sentences[index].audioFile)}
                            title="Play sample pronunciation"
                          >
                            🔊 Play
                          </button>
                        )}
                      </div>
                    </div>
                    <p><strong>Target:</strong> "{result.target}"</p>
                    <p><strong>You said:</strong> "{result.spoken || '(Skipped)'}"</p>
                    <p><strong>Word accuracy:</strong> {result.matchedWords}/{result.totalWords} words correct</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
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

  // Render main exercise interface (playing/recording/feedback states)
  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      
      <div className="quiz-container">
        <h1>🎤 Speaking Exercise</h1>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${progress}%`}}></div>
          </div>
          <div className="progress-text">
            Sentence {currentIndex + 1} of {sentences.length}
            {currentSentence && ` (${currentSentence.level})`}
          </div>
        </div>

        {currentSentence && (
          <>
            <div className="sentence-display">
              <h3>Read this sentence aloud:</h3>
              <div className="target-sentence">
                "{currentSentence.text}"
              </div>
            </div>

            {isRecording && (
              <div className="recording-indicator">
                <div className="recording-pulse"></div>
                <div className="recording-text">Recording... Click "Stop Recording" when finished!</div>
              </div>
            )}

            {currentTranscript && (
              <div className="transcript-display">
                <div className="transcript-label">You're saying:</div>
                <div className="transcript-text">"{currentTranscript}"</div>
              </div>
            )}

            <div className="recording-controls">
              {gameState === GAME_STATES.PLAYING && (
                <button 
                  className="btn btn-primary btn-large"
                  onClick={startRecording}
                >
                  🎤 Start Recording
                </button>
              )}
              
              {gameState === GAME_STATES.RECORDING && (
                <>
                  <button 
                    className="btn btn-danger btn-large recording"
                    onClick={stopRecording}
                  >
                    ⏹️ Stop Recording
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={restartRecording}
                  >
                    🔄 Restart Recording
                  </button>
                </>
              )}
              
              <button 
                className="btn btn-secondary"
                onClick={skipSentence}
                disabled={gameState === GAME_STATES.RECORDING}
              >
                ⏭️ Skip Sentence
              </button>
            </div>

            {feedback && gameState === GAME_STATES.FEEDBACK && (
              <div className={`feedback ${feedback.type} show`}>
                {feedback.message}
              </div>
            )}
          </>
        )}

        <div className="exercise-footer">
          <button className="btn btn-secondary btn-small" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpeakingExercise;
