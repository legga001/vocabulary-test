import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { recordTestResult } from '../utils/progressDataManager';

// ==============================================
// HELPER FUNCTIONS
// ==============================================

// Generate test sentences in order: A2 → B1 → B2 → C1
const generateTestSentences = () => {
  const testSentences = [];
  let sentenceCounter = 1;

  TEST_STRUCTURE.forEach(({ level, count }) => {
    const availableSentences = [...SENTENCE_POOLS[level]];
    
    // Shuffle within level
    for (let i = availableSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSentences[i], availableSentences[j]] = [availableSentences[j], availableSentences[i]];
    }
    
    // Take required number of sentences
    for (let i = 0; i < count && i < availableSentences.length; i++) {
      testSentences.push({
        id: sentenceCounter,
        level: level,
        audioFile: availableSentences[i].audioFile,
        correctText: availableSentences[i].correctText,
        difficulty: availableSentences[i].difficulty
      });
      sentenceCounter++;
    }
  });

  return testSentences;
};

// Text normalisation
const normaliseText = (text) => {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Levenshtein distance
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

// Check answer
const checkAnswer = (userInput, correctText) => {
  const userNormalised = normaliseText(userInput);
  const correctNormalised = normaliseText(correctText);
  
  if (userNormalised === correctNormalised) {
    return { type: 'perfect', score: 1.0 };
  }
  
  const distance = getLevenshteinDistance(userNormalised, correctNormalised);
  const maxLength = Math.max(userNormalised.length, correctNormalised.length);
  const similarity = maxLength > 0 ? 1 - (distance / maxLength) : 0;
  
  if (similarity >= 0.85) {
    return { type: 'close', score: 0.8 };
  } else if (similarity >= 0.5) {
    return { type: 'partial', score: similarity * 0.5 };
  } else {
    return { type: 'incorrect', score: 0 };
  }
};

// ==============================================
// MAIN COMPONENT
// ==============================================
function ListenAndTypeExercise({ onBack, onLogoClick }) {
  // Core state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [audioError, setAudioError] = useState(false);
  
  // Refs
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // Current sentence data
  const currentData = useMemo(() => {
    return testSentences[currentQuestion] || null;
  }, [testSentences, currentQuestion]);

  // ==============================================
  // AUDIO MANAGEMENT - FIXED VERSION
  // ==============================================
  
  // Play audio function
  const playAudio = useCallback(() => {
    if (!audioRef.current || !currentData || playCount >= 3 || isPlaying || audioError) {
      return;
    }

    console.log('▶️ Playing audio for question', currentQuestion + 1);
    
    const audio = audioRef.current;
    
    // Reset audio to start
    audio.currentTime = 0;
    
    // Set playing state immediately
    setIsPlaying(true);
    
    // Play audio
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          console.log('✅ Audio playing successfully');
          setPlayCount(prev => prev + 1);
        })
        .catch(error => {
          console.error('❌ Audio play error:', error);
          setAudioError(true);
          setIsPlaying(false);
        });
    }
  }, [currentData, playCount, isPlaying, audioError, currentQuestion]);

  // ==============================================
  // MAIN HANDLERS
  // ==============================================
  
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startExercise = useCallback(() => {
    setHasStarted(true);
    setExerciseStartTime(Date.now());
  }, []);

  const moveToNextQuestion = useCallback(() => {
    if (!currentData) return;

    const result = checkAnswer(userInput, currentData.correctText);
    
    setAnswers(prev => [...prev, {
      sentence: currentData,
      userInput: userInput.trim(),
      result: result,
      timeTaken: 60 - timeLeft
    }]);

    if (currentQuestion + 1 < testSentences.length) {
      // Move to next question
      setCurrentQuestion(prev => prev + 1);
      setUserInput('');
      setTimeLeft(60);
      // Reset audio state for new question
      setIsPlaying(false);
      setPlayCount(0);
      setAudioError(false);
    } else {
      // Finish exercise
      finishExercise([...answers, {
        sentence: currentData,
        userInput: userInput.trim(),
        result: result,
        timeTaken: 60 - timeLeft
      }]);
    }
  }, [currentData, userInput, timeLeft, currentQuestion, testSentences.length, answers]);

  const handleSubmit = useCallback(() => {
    if (!currentData || !userInput.trim()) return;
    moveToNextQuestion();
  }, [currentData, userInput, moveToNextQuestion]);

  const finishExercise = useCallback((finalAnswers) => {
    const testDuration = exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 1000) : 0;
    const totalScore = finalAnswers.reduce((sum, answer) => sum + answer.result.score, 0);
    const averageScore = finalAnswers.length > 0 ? totalScore / finalAnswers.length : 0;
    const scoreOutOf10 = Math.round(averageScore * 10);
    
    try {
      const formattedAnswers = finalAnswers.map(answer => ({
        answer: answer.userInput || '',
        correct: answer.result.type === 'perfect',
        score: Math.round(answer.result.score * 100),
        level: answer.sentence.level || 'B1'
      }));

      recordTestResult({
        quizType: 'listen-and-type',
        score: scoreOutOf10,
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: testDuration,
        userAnswers: formattedAnswers
      });
      
      console.log(`✅ Listen and Type test result recorded: ${scoreOutOf10}/10`);
    } catch (error) {
      console.error('Error recording test result:', error);
    }

    setShowResults(true);
  }, [exerciseStartTime]);

  const calculateScore = useCallback(() => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.result.score, 0);
    const maxScore = answers.length;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    return { 
      totalScore: Math.round(totalScore * 10) / 10,
      maxScore, 
      percentage,
      perfect: answers.filter(a => a.result.type === 'perfect').length,
      close: answers.filter(a => a.result.type === 'close').length,
      partial: answers.filter(a => a.result.type === 'partial').length,
      incorrect: answers.filter(a => a.result.type === 'incorrect').length
    };
  }, [answers]);

  const restartTest = useCallback(() => {
    setCurrentQuestion(0);
    setUserInput('');
    setTimeLeft(60);
    setShowResults(false);
    setAnswers([]);
    setHasStarted(false);
    setExerciseStartTime(null);
    setIsPlaying(false);
    setPlayCount(0);
    setAudioError(false);
    
    const newSentences = generateTestSentences();
    setTestSentences(newSentences);
  }, []);

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
    if (!hasStarted || showResults || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime === 0) {
          setTimeout(() => moveToNextQuestion(), 100);
        }
        return newTime;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasStarted, showResults, timeLeft, moveToNextQuestion]);

  // FIXED: Audio event management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log('🎵 Audio ended for question', currentQuestion + 1);
      setIsPlaying(false);
    };

    const handlePause = () => {
      console.log('🎵 Audio paused for question', currentQuestion + 1);
      setIsPlaying(false);
    };

    const handleError = (e) => {
      console.error('🎵 Audio error for question', currentQuestion + 1, e);
      setAudioError(true);
      setIsPlaying(false);
    };

    // Add event listeners
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    // Clean up function
    return () => {
      console.log('🧹 Cleaning up audio listeners for question', currentQuestion + 1);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [currentQuestion]); // Re-attach listeners when question changes

  // Auto-play first audio after a delay
  useEffect(() => {
    if (!hasStarted || !currentData || playCount > 0 || showResults) return;

    const autoPlayTimer = setTimeout(() => {
      console.log('🎯 Auto-playing audio for question', currentQuestion + 1);
      playAudio();
    }, 1500);

    return () => clearTimeout(autoPlayTimer);
  }, [hasStarted, currentData, playCount, showResults, currentQuestion, playAudio]);

  // Focus input
  useEffect(() => {
    if (hasStarted && inputRef.current && !showResults) {
      inputRef.current.focus();
    }
  }, [hasStarted, currentQuestion, showResults]);

  // Enter key handler
  useEffect(() => {
    if (!hasStarted || showResults) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && userInput.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [hasStarted, showResults, userInput, handleSubmit]);

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
                  <span>Spelling variations and missing punctuation are accepted</span>
                </div>
              </div>
              
              <div className="difficulty-info">
                <h4>📊 Test Structure</h4>
                <p>Progressive difficulty through levels:</p>
                <ul>
                  <li>2 A2 level sentences (elementary)</li>
                  <li>3 B1 level sentences (intermediate)</li>
                  <li>3 B2 level sentences (upper-intermediate)</li>
                  <li>2 C1 level sentences (advanced)</li>
                </ul>
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
        {/* Header */}
        <div className="listen-header">
          <div className="timer-section">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text" style={{ color: timeLeft <= 10 ? '#e53e3e' : '#4c51bf' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="progress-section">
            Question {currentQuestion + 1} of {testSentences.length}
          </div>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>

        {/* Main content */}
        <div className="listen-main-compact">
          {/* Level indicator */}
          <div className="level-indicator">
            <span className="level-badge">{currentData?.level}</span>
            <span className="level-description">{currentData?.difficulty}</span>
          </div>

          {/* Audio section */}
          <div className="audio-section-compact">
            <audio 
              ref={audioRef} 
              preload="auto"
              src={currentData ? `/${currentData.audioFile}` : ''}
            >
              Your browser does not support the audio element.
            </audio>
            
            <div className="audio-controls-compact">
              <button 
                className={`play-btn-compact ${isPlaying ? 'playing' : ''}`}
                onClick={playAudio}
                disabled={playCount >= 3 || isPlaying || audioError}
              >
                <span className="play-icon">
                  {isPlaying ? '🔊' : '▶️'}
                </span>
                <span className="play-text">
                  {isPlaying ? 'Playing...' : 'Play Audio'}
                </span>
              </button>
              
              <div className="play-counter-compact">
                Plays remaining: {3 - playCount}
              </div>
            </div>

            {audioError && (
              <div className="audio-error">
                ⚠️ Audio playback error. Please try again or skip this question.
              </div>
            )}
          </div>

          {/* Input section */}
          <div className="input-section-compact">
            <h3>Type what you hear:</h3>
            <textarea
              ref={inputRef}
              className="typing-input-compact"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the sentence here..."
              rows={3}
            />
            
            <div className="input-info-compact">
              <p>💡 <strong>Tip:</strong> Just type what you hear - spelling variations and missing punctuation are fine!</p>
            </div>

            <div className="action-buttons-compact">
              <button 
                className="btn btn-primary btn-submit"
                onClick={handleSubmit}
                disabled={!userInput.trim()}
              >
                Submit Answer
              </button>
              <button 
                className="btn btn-secondary btn-skip"
                onClick={moveToNextQuestion}
              >
                {currentQuestion + 1 === testSentences.length ? 'Finish Test' : 'Skip Question'}
              </button>
            </div>
            
            <p className="keyboard-hint-compact">
              <small>💻 Press <strong>Enter</strong> to submit</small>
            </p>
          </div>

          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="debug-info-compact">
              🐛 Q{currentQuestion + 1} | Playing: {isPlaying ? 'Yes' : 'No'} | 
              Plays: {playCount}/3 | Error: {audioError ? 'Yes' : 'No'} |
              Audio: {currentData?.audioFile || 'None'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListenAndTypeExercise;
