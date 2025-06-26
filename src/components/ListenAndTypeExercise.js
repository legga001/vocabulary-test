// src/components/ListenAndTypeExercise.js - Refactored Version
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { checkAnswer } from '../utils/answerAnalysis';
import { generateTestSentences, calculateTestScore } from '../utils/sentenceGenerator';
import { 
  TrafficLight, 
  DetailedAnswerReview, 
  AudioControls 
} from './ListenTypeComponents';

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
  
  const inputRef = useRef(null);

  const currentData = useMemo(() => {
    return testSentences[currentQuestion] || null;
  }, [testSentences, currentQuestion]);

  // Use custom hooks for audio and auto-play logic
  const { audioRef, isPlaying, playCount, audioError, playAudio } = useAudioPlayer(currentData, currentQuestion);
  useAutoPlay(hasStarted, currentData, showResults, currentQuestion, playCount, playAudio);

  // Utility functions
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startExercise = useCallback(() => {
    console.log('🚀 Starting exercise');
    setHasStarted(true);
    setExerciseStartTime(Date.now());
  }, []);

  const moveToNextQuestion = useCallback(() => {
    if (!currentData) return;

    console.log('➡️ Moving to next question from', currentQuestion);

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
    const score = calculateTestScore(finalAnswers);
    const scoreOutOf10 = Math.round(score.percentage / 10);
    
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

  const restartTest = useCallback(() => {
    setCurrentQuestion(0);
    setUserInput('');
    setTimeLeft(60);
    setShowResults(false);
    setAnswers([]);
    setHasStarted(false);
    setExerciseStartTime(null);
    setTestSentences(generateTestSentences());
  }, []);

  // Effects
  useEffect(() => {
    setTestSentences(generateTestSentences());
  }, []);

  useEffect(() => {
    if (!hasStarted || showResults || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimeout(() => moveToNextQuestion(), 100);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, showResults, timeLeft, moveToNextQuestion]);

  useEffect(() => {
    if (hasStarted && inputRef.current && !showResults) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.select();
      }, 100);
      
      return () => clearTimeout(timer);
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

  // Render loading state
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

  // Render results
  if (showResults) {
    const score = calculateTestScore(answers);

    return (
      <div className="listen-type-container">
        <div className="listen-type-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎧 Listen and Type Results</h1>
          
          <div className="results">
            <h2>🎉 Test Complete!</h2>
            <div className="score-display">{score.totalScore}/{score.maxScore}</div>
            <div className="score-percentage">({score.percentage}%)</div>
            
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
            
            <DetailedAnswerReview answers={answers} />
            
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

  // Render instructions
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

  // Render main exercise interface
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

          <AudioControls
            audioRef={audioRef}
            currentData={currentData}
            isPlaying={isPlaying}
            playCount={playCount}
            audioError={audioError}
            playAudio={playAudio}
            currentQuestion={currentQuestion}
          />

          <div className="input-section-compact">
            <h3>Type what you hear:</h3>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the sentence here..."
              rows="4"
              autoFocus
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '15px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1.1em',
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                resize: 'vertical',
                transition: 'all 0.3s ease',
                backgroundColor: '#ffffff',
                lineHeight: '1.5'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4c51bf';
                e.target.style.boxShadow = '0 0 15px rgba(76, 81, 191, 0.2)';
                e.target.style.backgroundColor = '#f8f9ff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#ffffff';
              }}
            />
            
            <div style={{ 
              margin: '15px 0', 
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
              border: '1px solid #bee3f8'
            }}>
              <p style={{ 
                color: '#2b6cb0', 
                fontSize: '0.95em', 
                margin: '0',
                fontWeight: '500'
              }}>
                💡 <strong>Tip:</strong> Just type what you hear - spelling variations and missing punctuation are fine!
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              margin: '20px 0',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                style={{
                  padding: '14px 28px',
                  border: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  fontSize: '1em',
                  minWidth: '160px',
                  background: userInput.trim() 
                    ? 'linear-gradient(135deg, #4c51bf, #667eea)' 
                    : '#a0aec0',
                  color: 'white'
                }}
              >
                ✅ Submit Answer
              </button>
              
              <button 
                onClick={moveToNextQuestion}
                style={{
                  padding: '14px 28px',
                  border: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1em',
                  minWidth: '160px',
                  background: '#e2e8f0',
                  color: '#4a5568'
                }}
              >
                ⏭️ {currentQuestion + 1 === testSentences.length ? 'Finish Test' : 'Skip'}
              </button>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              marginTop: '15px' 
            }}>
              <small style={{ 
                color: '#718096', 
                fontSize: '0.85em' 
              }}>
                💻 Press <strong>Enter</strong> to submit your answer
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListenAndTypeExercise;// src/components/ListenAndTypeExercise.js - Refactored Version
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { checkAnswer } from '../utils/answerAnalysis';
import { generateTestSentences, calculateTestScore } from '../utils/sentenceGenerator';
import { 
  TrafficLight, 
  DetailedAnswerReview, 
  AudioControls 
} from './ListenTypeComponents';

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
  
  const inputRef = useRef(null);

  const currentData = useMemo(() => {
    return testSentences[currentQuestion] || null;
  }, [testSentences, currentQuestion]);

  // Use custom hooks for audio and auto-play logic
  const { audioRef, isPlaying, playCount, audioError, playAudio } = useAudioPlayer(currentData, currentQuestion);
  useAutoPlay(hasStarted, currentData, showResults, currentQuestion, playCount, playAudio);

  // Utility functions
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startExercise = useCallback(() => {
    console.log('🚀 Starting exercise');
    setHasStarted(true);
    setExerciseStartTime(Date.now());
  }, []);

  const moveToNextQuestion = useCallback(() => {
    if (!currentData) return;

    console.log('➡️ Moving to next question from', currentQuestion);

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
    const score = calculateTestScore(finalAnswers);
    const scoreOutOf10 = Math.round(score.percentage / 10);
    
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

  const restartTest = useCallback(() => {
    setCurrentQuestion(0);
    setUserInput('');
    setTimeLeft(60);
    setShowResults(false);
    setAnswers([]);
    setHasStarted(false);
    setExerciseStartTime(null);
    setTestSentences(generateTestSentences());
  }, []);

  // Effects
  useEffect(() => {
    setTestSentences(generateTestSentences());
  }, []);

  useEffect(() => {
    if (!hasStarted || showResults || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimeout(() => moveToNextQuestion(), 100);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, showResults, timeLeft, moveToNextQuestion]);

  useEffect(() => {
    if (hasStarted && inputRef.current && !showResults) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.select();
      }, 100);
      
      return () => clearTimeout(timer);
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

  // Render loading state
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

  // Render results
  if (showResults) {
    const score = calculateTestScore(answers);

    return (
      <div className="listen-type-container">
        <div className="listen-type-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎧 Listen and Type Results</h1>
          
          <div className="results">
            <h2>🎉 Test Complete!</h2>
            <div className="score-display">{score.totalScore}/{score.maxScore}</div>
            <div className="score-percentage">({score.percentage}%)</div>
            
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
            
            <DetailedAnswerReview answers={answers} />
            
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

  // Render instructions
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

  // Render main exercise interface
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

          <AudioControls
            audioRef={audioRef}
            currentData={currentData}
            isPlaying={isPlaying}
            playCount={playCount}
            audioError={audioError}
            playAudio={playAudio}
            currentQuestion={currentQuestion}
          />

          <div className="input-section-compact">
            <h3>Type what you hear:</h3>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the sentence here..."
              rows="4"
              autoFocus
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '15px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1.1em',
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                resize: 'vertical',
                transition: 'all 0.3s ease',
                backgroundColor: '#ffffff',
                lineHeight: '1.5'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4c51bf';
                e.target.style.boxShadow = '0 0 15px rgba(76, 81, 191, 0.2)';
                e.target.style.backgroundColor = '#f8f9ff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#ffffff';
              }}
            />
            
            <div style={{ 
              margin: '15px 0', 
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
              border: '1px solid #bee3f8'
            }}>
              <p style={{ 
                color: '#2b6cb0', 
                fontSize: '0.95em', 
                margin: '0',
                fontWeight: '500'
              }}>
                💡 <strong>Tip:</strong> Just type what you hear - spelling variations and missing punctuation are fine!
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              margin: '20px 0',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                style={{
                  padding: '14px 28px',
                  border: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  fontSize: '1em',
                  minWidth: '160px',
                  background: userInput.trim() 
                    ? 'linear-gradient(135deg, #4c51bf, #667eea)' 
                    : '#a0aec0',
                  color: 'white'
                }}
              >
                ✅ Submit Answer
              </button>
              
              <button 
                onClick={moveToNextQuestion}
                style={{
                  padding: '14px 28px',
                  border: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1em',
                  minWidth: '160px',
                  background: '#e2e8f0',
                  color: '#4a5568'
                }}
              >
                ⏭️ {currentQuestion + 1 === testSentences.length ? 'Finish Test' : 'Skip'}
              </button>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              marginTop: '15px' 
            }}>
              <small style={{ 
                color: '#718096', 
                fontSize: '0.85em' 
              }}>
                💻 Press <strong>Enter</strong> to submit your answer
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListenAndTypeExercise;
