// src/components/ListenAndTypeExercise.js - Fixed with Traffic Light System
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ClickableLogo from './ClickableLogo';
import { LISTEN_AND_TYPE_SENTENCES, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { recordTestResult } from '../utils/progressDataManager';

// Function to calculate similarity between strings
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

// Levenshtein distance algorithm
const levenshteinDistance = (str1, str2) => {
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

// Function to check user's answer against correct text
const checkAnswer = (userAnswer, correctText) => {
  if (!userAnswer || !correctText) {
    return { type: 'incorrect', score: 0 };
  }

  const normaliseText = (text) => {
    return text.toLowerCase()
      .replace(/[.,!?;:"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalisedUser = normaliseText(userAnswer);
  const normalisedCorrect = normaliseText(correctText);

  if (normalisedUser === normalisedCorrect) {
    return { type: 'perfect', score: 1 };
  }

  const similarity = calculateSimilarity(normalisedUser, normalisedCorrect);
  const maxLength = Math.max(normalisedUser.length, normalisedCorrect.length);
  const distance = levenshteinDistance(normalisedUser, normalisedCorrect);
  
  if (similarity >= 0.85) {
    return { type: 'close', score: 0.8 };
  } else if (similarity >= 0.5) {
    return { type: 'partial', score: similarity * 0.5 };
  } else {
    return { type: 'incorrect', score: 0 };
  }
};

// Traffic Light Score Colour Function
const getScoreColor = (percentage) => {
  if (percentage >= 80) return '#48bb78'; // Green
  if (percentage >= 60) return '#ed8936'; // Orange/Yellow
  return '#f56565'; // Red
};

// Traffic Light Component
const TrafficLight = ({ percentage }) => {
  const lightStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '15px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e2e8f0',
    margin: '20px auto',
    width: 'fit-content'
  };

  const lightCircleBase = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8em',
    fontWeight: 'bold'
  };

  const getActiveLight = () => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  };

  const activeLight = getActiveLight();

  return (
    <div style={lightStyle}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4c51bf', fontSize: '1em' }}>Performance Level</h4>
      
      {/* Green Light */}
      <div style={{
        ...lightCircleBase,
        backgroundColor: activeLight === 'green' ? '#48bb78' : '#f7fafc',
        color: activeLight === 'green' ? 'white' : '#a0aec0',
        borderColor: activeLight === 'green' ? '#48bb78' : '#e2e8f0',
        transform: activeLight === 'green' ? 'scale(1.1)' : 'scale(1)',
        boxShadow: activeLight === 'green' ? '0 0 15px rgba(72, 187, 120, 0.5)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        ✓
      </div>
      
      {/* Yellow Light */}
      <div style={{
        ...lightCircleBase,
        backgroundColor: activeLight === 'yellow' ? '#ed8936' : '#f7fafc',
        color: activeLight === 'yellow' ? 'white' : '#a0aec0',
        borderColor: activeLight === 'yellow' ? '#ed8936' : '#e2e8f0',
        transform: activeLight === 'yellow' ? 'scale(1.1)' : 'scale(1)',
        boxShadow: activeLight === 'yellow' ? '0 0 15px rgba(237, 137, 54, 0.5)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        ~
      </div>
      
      {/* Red Light */}
      <div style={{
        ...lightCircleBase,
        backgroundColor: activeLight === 'red' ? '#f56565' : '#f7fafc',
        color: activeLight === 'red' ? 'white' : '#a0aec0',
        borderColor: activeLight === 'red' ? '#f56565' : '#e2e8f0',
        transform: activeLight === 'red' ? 'scale(1.1)' : 'scale(1)',
        boxShadow: activeLight === 'red' ? '0 0 15px rgba(245, 101, 101, 0.5)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        ✗
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '0.85em', 
        fontWeight: '600',
        color: getScoreColor(percentage)
      }}>
        {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Keep Practising'}
      </div>
    </div>
  );
};

function ListenAndTypeExercise({ onBack, onLogoClick }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [audioError, setAudioError] = useState(false);
  
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  const currentData = useMemo(() => {
    return testSentences[currentQuestion] || null;
  }, [testSentences, currentQuestion]);

  const playAudio = useCallback(() => {
    if (!audioRef.current || !currentData || playCount >= 3 || isPlaying || audioError) {
      return;
    }

    const audio = audioRef.current;
    setIsPlaying(true);
    audio.currentTime = 0;
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setPlayCount(prev => prev + 1);
        })
        .catch(error => {
          console.error('Audio play error:', error);
          setAudioError(true);
          setIsPlaying(false);
        });
    }
  }, [currentData, playCount, isPlaying, audioError]);

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
      setCurrentQuestion(prev => prev + 1);
      setUserInput('');
      setTimeLeft(60);
      setIsPlaying(false);
      setPlayCount(0);
      setAudioError(false);
    } else {
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
    generateTestSentences();
  }, []);

  const generateTestSentences = useCallback(() => {
    const sentences = [];
    
    TEST_STRUCTURE.forEach(({ level, count }) => {
      const levelSentences = LISTEN_AND_TYPE_SENTENCES[level] || [];
      
      for (let i = 0; i < count; i++) {
        if (levelSentences.length > 0) {
          const randomIndex = Math.floor(Math.random() * levelSentences.length);
          const selectedSentence = { ...levelSentences[randomIndex], level };
          sentences.push(selectedSentence);
          
          levelSentences.splice(randomIndex, 1);
        }
      }
    });
    
    setTestSentences(sentences);
  }, []);

  useEffect(() => {
    generateTestSentences();
  }, [generateTestSentences]);

  useEffect(() => {
    if (!hasStarted || showResults || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          moveToNextQuestion();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, showResults, timeLeft, moveToNextQuestion]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setAudioError(true);
      setIsPlaying(false);
    };

    const handleLoadedData = () => {
      setAudioError(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [currentData]);

  useEffect(() => {
    if (!hasStarted || showResults || !currentData || playCount > 0) return;

    const autoPlayTimer = setTimeout(() => {
      playAudio();
    }, 1000);

    return () => clearTimeout(autoPlayTimer);
  }, [hasStarted, currentData, playCount, showResults, currentQuestion, playAudio]);

  useEffect(() => {
    if (hasStarted && inputRef.current && !showResults) {
      inputRef.current.focus();
    }
  }, [hasStarted, currentQuestion, showResults]);

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
            
            {/* TRAFFIC LIGHT SYSTEM - This was missing! */}
            <TrafficLight percentage={score.percentage} />
            
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
            Question {currentQuestion + 1} of {testSentences.length}
          </div>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>

        <div className="listen-main-compact">
          <div className="level-indicator">
            <span className="level-badge">{currentData?.level}</span>
            <span className="level-description">{currentData?.difficulty}</span>
          </div>

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
                disabled={playCount >= 3 || audioError}
              >
                {isPlaying ? '🔊' : '▶️'} 
                {audioError ? 'Audio Error' : `Play${playCount > 0 ? ` (${playCount}/3)` : ''}`}
              </button>
              
              {audioError && (
                <div className="audio-error">
                  ⚠️ Audio unavailable for this sentence
                </div>
              )}
            </div>
          </div>

          <div className="input-section-compact">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type what you hear..."
              className="listen-input-compact"
              rows="3"
            />
            
            <div className="action-buttons-compact">
              <button 
                className="btn-submit" 
                onClick={handleSubmit}
                disabled={!userInput.trim()}
              >
                ✅ Submit Answer
              </button>
              
              <button 
                className="btn-skip" 
                onClick={moveToNextQuestion}
              >
                ⏭️ Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListenAndTypeExercise;
