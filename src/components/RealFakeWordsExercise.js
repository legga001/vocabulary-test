// src/components/RealFakeWordsExercise.js - Updated with daily progress tracking
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';
import { generateRandomWords, GAME_CONFIG } from '../data/realFakeWordsData';

// Game states enum
const GAME_STATES = {
  INSTRUCTIONS: 'instructions',
  EXAMPLE: 'example',
  PLAYING: 'playing',
  FEEDBACK: 'feedback',
  RESULTS: 'results',
  LOADING: 'loading'
};

// Answer types
const ANSWER_TYPES = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  TIMEOUT: 'timeout'
};

function RealFakeWordsExercise({ onBack, onLogoClick }) {
  // Core game state
  const [gameState, setGameState] = useState(GAME_STATES.INSTRUCTIONS);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [words, setWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.TIMER_DURATION);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(null);
  
  // Feedback state
  const [lastAnswer, setLastAnswer] = useState(null);
  
  // Example state
  const [exampleAnswered, setExampleAnswered] = useState(false);
  const [exampleFeedback, setExampleFeedback] = useState(null);

  // Derived state
  const currentWord = words[currentQuestion];
  const progress = words.length > 0 ? ((currentQuestion + 1) / GAME_CONFIG.TOTAL_QUESTIONS) * 100 : 0;
  const isGameActive = gameState === GAME_STATES.PLAYING;

  // Timer color based on time remaining
  const timerColor = useMemo(() => {
    if (timeLeft <= 1) return '#e53e3e';
    if (timeLeft <= 2) return '#dd6b20';
    return '#4c51bf';
  }, [timeLeft]);

  // Generate words for the game
  const initializeGame = useCallback(() => {
    setGameState(GAME_STATES.LOADING);
    
    setTimeout(() => {
      const newWords = generateRandomWords();
      setWords(newWords);
      setCurrentQuestion(0);
      setScore(0);
      setUserAnswers([]);
      setLastAnswer(null);
      setTimeLeft(GAME_CONFIG.TIMER_DURATION);
      setGameStartTime(Date.now());
      setGameState(GAME_STATES.PLAYING);
    }, 500);
  }, []);

  // Handle answer selection
  const handleAnswer = useCallback((userChoice) => {
    if (!isGameActive || !currentWord) return;

    const isCorrect = userChoice === currentWord.isReal;
    const newScore = isCorrect ? score + 1 : score;
    
    const answerRecord = {
      word: currentWord.word,
      isReal: currentWord.isReal,
      userAnswer: userChoice,
      correct: isCorrect,
      timeTaken: GAME_CONFIG.TIMER_DURATION - timeLeft
    };

    setScore(newScore);
    setUserAnswers(prev => [...prev, answerRecord]);
    setLastAnswer({
      word: currentWord.word,
      isReal: currentWord.isReal,
      userAnswer: userChoice,
      correct: isCorrect
    });

    if (currentQuestion + 1 >= GAME_CONFIG.TOTAL_QUESTIONS) {
      // Game finished
      finishGame(newScore, [...userAnswers, answerRecord]);
    } else {
      // Show feedback then move to next
      setGameState(GAME_STATES.FEEDBACK);
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(GAME_CONFIG.TIMER_DURATION);
        setGameState(GAME_STATES.PLAYING);
      }, 1500);
    }
  }, [isGameActive, currentWord, score, timeLeft, currentQuestion, userAnswers]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (!isGameActive || !currentWord) return;

    const answerRecord = {
      word: currentWord.word,
      isReal: currentWord.isReal,
      userAnswer: ANSWER_TYPES.TIMEOUT,
      correct: false,
      timeTaken: GAME_CONFIG.TIMER_DURATION
    };

    setUserAnswers(prev => [...prev, answerRecord]);
    setLastAnswer({
      word: currentWord.word,
      isReal: currentWord.isReal,
      userAnswer: ANSWER_TYPES.TIMEOUT,
      correct: false
    });

    if (currentQuestion + 1 >= GAME_CONFIG.TOTAL_QUESTIONS) {
      // Game finished
      finishGame(score, [...userAnswers, answerRecord]);
    } else {
      // Show feedback then move to next
      setGameState(GAME_STATES.FEEDBACK);
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(GAME_CONFIG.TIMER_DURATION);
        setGameState(GAME_STATES.PLAYING);
      }, 1500);
    }
  }, [isGameActive, currentWord, score, currentQuestion, userAnswers]);

  // Finish game and record progress
  const finishGame = useCallback((finalScore, finalAnswers) => {
    console.log('🏁 Finishing Real or Fake Words exercise');
    
    const gameDuration = gameStartTime ? Math.round((Date.now() - gameStartTime) / 1000) : 0;
    
    try {
      // Prepare user answers for progress tracking
      const formattedAnswers = finalAnswers.map(answer => ({
        answer: answer.userAnswer === ANSWER_TYPES.TIMEOUT ? '(timeout)' : (answer.userAnswer ? 'Real' : 'Fake'),
        correct: answer.correct,
        score: answer.correct ? 100 : 0,
        level: 'B1' // Real/Fake words is typically B1 level
      }));

      // Record test result - this automatically increments daily targets
      recordTestResult({
        quizType: 'real-fake-words',
        score: finalScore,
        totalQuestions: GAME_CONFIG.TOTAL_QUESTIONS,
        completedAt: new Date(),
        timeSpent: gameDuration,
        userAnswers: formattedAnswers
      });
      
      console.log(`✅ Real or Fake Words test result recorded: ${finalScore}/${GAME_CONFIG.TOTAL_QUESTIONS}`);
    } catch (error) {
      console.error('Error recording test result:', error);
    }

    setGameState(GAME_STATES.RESULTS);
  }, [gameStartTime]);

  // Timer effect
  useEffect(() => {
    if (!isGameActive || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      if (timeLeft === 1) {
        handleTimeout();
      } else {
        setTimeLeft(prev => prev - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isGameActive, timeLeft, handleTimeout]);

  // Example handlers
  const handleExampleAnswer = useCallback((choice) => {
    setExampleAnswered(true);
    const isCorrect = choice; // Example word "library" is real
    setExampleFeedback({
      correct: isCorrect,
      message: isCorrect ? 
        "Correct! 'Library' is a real English word." : 
        "Incorrect. 'Library' is actually a real English word meaning a place where books are kept."
    });
  }, []);

  const startGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  // Calculate game results
  const gameResults = useMemo(() => {
    const percentage = Math.round((score / GAME_CONFIG.TOTAL_QUESTIONS) * 100);
    let message = '';
    
    if (percentage >= 90) message = "Outstanding! You have excellent word recognition skills! 🌟";
    else if (percentage >= 80) message = "Great job! Your vocabulary knowledge is very strong! 🎉";
    else if (percentage >= 70) message = "Well done! You're developing good word recognition skills! 👍";
    else if (percentage >= 60) message = "Good effort! Keep practicing to improve your vocabulary! 📚";
    else message = "Keep learning! Regular practice will boost your word recognition! 💪";
    
    return { percentage, message };
  }, [score]);

  // Instructions render
  if (gameState === GAME_STATES.INSTRUCTIONS) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎯 Real or Fake Words</h1>
          <div className="instructions-container">
            <h3>📋 How to Play</h3>
            <div className="instruction-list">
              <div className="instruction-item">
                <span className="instruction-icon">👀</span>
                <span>Look at each word carefully</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🤔</span>
                <span>Decide if it's a real English word or made up</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⚡</span>
                <span>You have {GAME_CONFIG.TIMER_DURATION} seconds per word</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎯</span>
                <span>Answer {GAME_CONFIG.TOTAL_QUESTIONS} words total</span>
              </div>
            </div>
            
            <div className="tips-section">
              <h4>💡 Tips:</h4>
              <ul>
                <li>Trust your instincts - you know more words than you think!</li>
                <li>Look for familiar patterns and word parts</li>
                <li>Don't overthink - your first reaction is often correct</li>
              </ul>
            </div>
            
            <button className="btn btn-primary" onClick={() => setGameState(GAME_STATES.EXAMPLE)}>
              📖 See Example
            </button>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Example render
  if (gameState === GAME_STATES.EXAMPLE) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎯 Real or Fake Words - Example</h1>
          <div className="game-container">
            <div className="example-word-display">
              <h2>Example Word:</h2>
              <div className="word-display">library</div>
            </div>

            {!exampleAnswered ? (
              <div className="answer-buttons">
                <button 
                  className="btn btn-success btn-large"
                  onClick={() => handleExampleAnswer(true)}
                >
                  📚 Real Word
                </button>
                <button 
                  className="btn btn-danger btn-large"
                  onClick={() => handleExampleAnswer(false)}
                >
                  ❌ Fake Word
                </button>
              </div>
            ) : (
              <div className={`example-feedback ${exampleFeedback.correct ? 'correct' : 'incorrect'}`}>
                <div className="feedback-icon">
                  {exampleFeedback.correct ? '🎉' : '📚'}
                </div>
                <div className="feedback-message">
                  {exampleFeedback.message}
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={startGame}
                >
                  🚀 Start Game
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading render
  if (gameState === GAME_STATES.LOADING) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎯 Real or Fake Words</h1>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Preparing your words...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main game render
  if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.FEEDBACK) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎯 Real or Fake Words</h1>
          
          <div className="game-header">
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-text">
                Question {currentQuestion + 1} of {GAME_CONFIG.TOTAL_QUESTIONS}
              </div>
            </div>
            
            <div className="timer-container">
              <div 
                className="timer-circle"
                style={{ borderColor: timerColor }}
              >
                <span style={{ color: timerColor }}>{timeLeft}</span>
              </div>
            </div>
          </div>

          {currentWord && (
            <div className="word-container">
              <div className="word-display">
                {currentWord.word}
              </div>
              
              {gameState === GAME_STATES.PLAYING && (
                <div className="answer-buttons">
                  <button 
                    className="btn btn-success btn-large"
                    onClick={() => handleAnswer(true)}
                  >
                    📚 Real Word
                  </button>
                  <button 
                    className="btn btn-danger btn-large"
                    onClick={() => handleAnswer(false)}
                  >
                    ❌ Fake Word
                  </button>
                </div>
              )}
            </div>
          )}

          {gameState === GAME_STATES.FEEDBACK && lastAnswer && (
            <div className={`feedback-container ${lastAnswer.correct ? 'correct' : 'incorrect'}`}>
              <div className="feedback-icon">
                {lastAnswer.correct ? '🎉' : '❌'}
              </div>
              <div className="feedback-content">
                <div className="feedback-title">
                  {lastAnswer.correct ? 'Correct!' : 'Incorrect'}
                </div>
                <div className="feedback-details">
                  {lastAnswer.userAnswer === ANSWER_TYPES.TIMEOUT ? (
                    <>
                      <div>⏰ Time ran out!</div>
                      <div>The word "{lastAnswer.word}" is {lastAnswer.isReal ? 'real' : 'fake'}</div>
                    </>
                  ) : (
                    <div>
                      The word "{lastAnswer.word}" is {lastAnswer.isReal ? 'real' : 'fake'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="current-score">
            Score: {score}/{currentQuestion + (gameState === GAME_STATES.FEEDBACK ? 1 : 0)}
          </div>
        </div>
      </div>
    );
  }

  // Results render
  if (gameState === GAME_STATES.RESULTS) {
    return (
      <div className="exercise-page scrollable-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎯 Real or Fake Words Results</h1>
          <div className="results">
            <h2>🎉 Test Complete!</h2>
            <div className="score-display">{score}/{GAME_CONFIG.TOTAL_QUESTIONS}</div>
            <div className="score-percentage">({gameResults.percentage}%)</div>
            
            <div className="level-estimate">
              <h3>Word Recognition Challenge</h3>
              <p>{gameResults.message}</p>
            </div>

            <div className="answer-review">
              <h3>📝 Your Answers:</h3>
              <div className="word-results-grid">
                {userAnswers.map((answer, index) => (
                  <div key={index} className={`word-result-item ${answer.correct ? 'correct' : 'incorrect'}`}>
                    <div className="word-result-header">
                      <span className="word-text">{answer.word}</span>
                      <span className="result-emoji">{answer.correct ? '✅' : '❌'}</span>
                    </div>
                    <div className="word-result-details">
                      <span className="correct-answer">
                        Actually: {answer.isReal ? 'Real' : 'Fake'}
                      </span>
                      {!answer.correct && answer.userAnswer !== ANSWER_TYPES.TIMEOUT && (
                        <span className="user-answer">
                          You said: {answer.userAnswer ? 'Real' : 'Fake'}
                        </span>
                      )}
                      {answer.userAnswer === ANSWER_TYPES.TIMEOUT && (
                        <span className="timeout-indicator">⏰ Timed out</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={startGame}>
                🔄 Play Again
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

  // Fallback
  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <div className="quiz-container">
        <h1>🎯 Real or Fake Words</h1>
        <p>Loading...</p>
      </div>
    </div>
  );
}

export default RealFakeWordsExercise;
