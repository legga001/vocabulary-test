// src/components/RealFakeWordsExercise.js - Rewritten with clean architecture
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';
import { generateRandomWords, GAME_CONFIG } from '../data/realFakeWordsData';

// Game states enum for better state management
const GAME_STATES = {
  INSTRUCTIONS: 'instructions',
  EXAMPLE: 'example',
  PLAYING: 'playing',
  FEEDBACK: 'feedback',
  RESULTS: 'results',
  LOADING: 'loading'
};

// Answer types for better type safety
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
  
  // Feedback state
  const [lastAnswer, setLastAnswer] = useState(null);
  
  // Example state
  const [exampleAnswered, setExampleAnswered] = useState(false);
  const [exampleFeedback, setExampleFeedback] = useState(null);

  // Derived state
  const currentWord = words[currentQuestion];
  const progress = ((currentQuestion + 1) / GAME_CONFIG.TOTAL_QUESTIONS) * 100;
  const isGameActive = gameState === GAME_STATES.PLAYING;

  // Memoized timer color for performance
  const timerColor = useMemo(() => {
    if (timeLeft <= 1) return '#e53e3e';
    if (timeLeft <= 2) return '#dd6b20';
    return '#4c51bf';
  }, [timeLeft]);

  // Generate words when starting the game
  const initializeGame = useCallback(() => {
    setGameState(GAME_STATES.LOADING);
    
    // Small delay to show loading state
    setTimeout(() => {
      const newWords = generateRandomWords();
      setWords(newWords);
      setCurrentQuestion(0);
      setScore(0);
      setUserAnswers([]);
      setLastAnswer(null);
      setTimeLeft(GAME_CONFIG.TIMER_DURATION);
      setGameState(GAME_STATES.PLAYING);
    }, 500);
  }, []);

  // Timer management
  useEffect(() => {
    if (!isGameActive || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isGameActive, timeLeft]);

  // Handle timeout
  useEffect(() => {
    if (isGameActive && timeLeft === 0) {
      handleAnswer(null, true);
    }
  }, [isGameActive, timeLeft]);

  // Reset timer when question changes
  useEffect(() => {
    if (isGameActive) {
      setTimeLeft(GAME_CONFIG.TIMER_DURATION);
    }
  }, [currentQuestion, isGameActive]);

  // Handle user answer
  const handleAnswer = useCallback((userAnswer, isTimeout = false) => {
    if (gameState !== GAME_STATES.PLAYING) return;

    const word = currentWord;
    const correct = !isTimeout && userAnswer === word.isReal;
    
    if (correct) {
      setScore(prev => prev + 1);
    }

    const answerData = {
      word: word.word,
      isReal: word.isReal,
      userAnswer: isTimeout ? ANSWER_TYPES.TIMEOUT : userAnswer,
      correct,
      timeUsed: GAME_CONFIG.TIMER_DURATION - timeLeft,
      type: correct ? ANSWER_TYPES.CORRECT : ANSWER_TYPES.INCORRECT
    };

    setUserAnswers(prev => [...prev, answerData]);
    setLastAnswer(answerData);
    setGameState(GAME_STATES.FEEDBACK);

    // Auto-advance after feedback
    setTimeout(() => {
      if (currentQuestion + 1 >= GAME_CONFIG.TOTAL_QUESTIONS) {
        finishGame();
      } else {
        setCurrentQuestion(prev => prev + 1);
        setGameState(GAME_STATES.PLAYING);
      }
    }, 2000);
  }, [gameState, currentWord, timeLeft, currentQuestion]);

  // Finish the game and record results
  const finishGame = useCallback(() => {
    setGameState(GAME_STATES.RESULTS);
    
    // Record test result
    recordTestResult({
      quizType: 'realFakeWords',
      score,
      totalQuestions: GAME_CONFIG.TOTAL_QUESTIONS,
      completedAt: new Date(),
      userAnswers
    });
  }, [score, userAnswers]);

  // Example handling
  const handleExampleAnswer = useCallback((userAnswer) => {
    if (exampleAnswered) return;
    
    setExampleAnswered(true);
    const correct = userAnswer === GAME_CONFIG.EXAMPLE_WORD.isReal;
    
    setExampleFeedback({
      correct,
      userAnswer,
      explanation: correct 
        ? `Correct! ${GAME_CONFIG.EXAMPLE_WORD.explanation}`
        : `Not quite! ${GAME_CONFIG.EXAMPLE_WORD.explanation} You selected ${userAnswer ? 'Real' : 'Fake'}.`
    });
  }, [exampleAnswered]);

  const resetExample = useCallback(() => {
    setExampleAnswered(false);
    setExampleFeedback(null);
  }, []);

  // Game controls
  const startInstructions = useCallback(() => {
    setGameState(GAME_STATES.INSTRUCTIONS);
    setExampleAnswered(false);
    setExampleFeedback(null);
  }, []);

  const restartGame = useCallback(() => {
    startInstructions();
  }, [startInstructions]);

  // Format time display
  const formatTime = useCallback((seconds) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate final results
  const gameResults = useMemo(() => {
    const percentage = Math.round((score / GAME_CONFIG.TOTAL_QUESTIONS) * 100);
    
    let message;
    if (percentage >= 90) message = "Outstanding! You have excellent word recognition skills!";
    else if (percentage >= 75) message = "Great work! You can spot most real and fake words accurately.";
    else if (percentage >= 60) message = "Good effort! Keep practising to improve your word recognition.";
    else message = "Keep practising! Word recognition improves with exposure to more vocabulary.";

    return { percentage, message };
  }, [score]);

  // Render different game states
  const renderInstructions = () => (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <h1>🎯 Real or Fake Words</h1>
      
      <div className="quiz-container">
        <div className="instructions-container">
          <div className="instructions-header">
            <h2>📖 How to Play</h2>
          </div>

          <div className="instructions-content">
            <div className="instruction-item">
              <div className="instruction-icon">👀</div>
              <div className="instruction-text">
                <strong>Look at the word</strong> displayed on screen
              </div>
            </div>

            <div className="instruction-item">
              <div className="instruction-icon">⚡</div>
              <div className="instruction-text">
                <strong>Decide quickly</strong> - you only have <span className="highlight">{GAME_CONFIG.TIMER_DURATION} seconds</span> per word!
              </div>
            </div>

            <div className="instruction-item">
              <div className="instruction-icon">✅</div>
              <div className="instruction-text">
                <strong>Click "Yes"</strong> if it's a real English word
              </div>
            </div>

            <div className="instruction-item">
              <div className="instruction-icon">❌</div>
              <div className="instruction-text">
                <strong>Click "No"</strong> if it's a fake/made-up word
              </div>
            </div>

            <div className="instruction-item">
              <div className="instruction-icon">🏆</div>
              <div className="instruction-text">
                <strong>Test yourself</strong> with {GAME_CONFIG.TOTAL_QUESTIONS} words of varying difficulty
              </div>
            </div>
          </div>

          <div className="example-section">
            <h3>🎯 Try This Practice Example</h3>
            <p className="example-description">
              This example is <strong>untimed</strong> so you can get familiar with the interface. 
              Remember: in the real test, you'll only have {GAME_CONFIG.TIMER_DURATION} seconds!
            </p>

            <div className="example-word-container">
              <div className="word-question-title">Is this a real English word?</div>
              
              <div className="word-display example-word">
                {GAME_CONFIG.EXAMPLE_WORD.word}
              </div>

              {!exampleAnswered && (
                <div className="word-answer-buttons">
                  <button 
                    className="word-answer-btn yes-btn"
                    onClick={() => handleExampleAnswer(true)}
                  >
                    <div className="btn-icon">✓</div>
                    <div className="btn-text">Yes</div>
                  </button>
                  
                  <button 
                    className="word-answer-btn no-btn"
                    onClick={() => handleExampleAnswer(false)}
                  >
                    <div className="btn-icon">✗</div>
                    <div className="btn-text">No</div>
                  </button>
                </div>
              )}

              {exampleFeedback && (
                <div className={`example-feedback ${exampleFeedback.correct ? 'correct' : 'incorrect'}`}>
                  <div className="feedback-icon">
                    {exampleFeedback.correct ? '🎉' : '💡'}
                  </div>
                  <div className="feedback-content">
                    <div className="feedback-title">
                      {exampleFeedback.correct ? 'Well Done!' : 'Learning Moment!'}
                    </div>
                    <div className="feedback-explanation">
                      {exampleFeedback.explanation}
                    </div>
                    <button className="btn btn-small" onClick={resetExample}>
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="instructions-footer">
            <div className="ready-section">
              <h3>🚀 Ready to Start?</h3>
              <p>Remember: Be quick! You'll have just <strong>{GAME_CONFIG.TIMER_DURATION} seconds</strong> per word in the actual test.</p>
              
              <div className="start-buttons">
                <button className="btn btn-primary btn-large" onClick={initializeGame}>
                  🎯 Start Real Test
                </button>
                <button className="btn btn-secondary" onClick={onBack}>
                  ← Back to Reading Exercises
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <h1>🎯 Real or Fake Words</h1>
      
      <div className="quiz-container">
        <div className="loading">
          <p>🎲 Generating your test...</p>
          <p><small>Selecting {GAME_CONFIG.TOTAL_QUESTIONS} random words...</small></p>
        </div>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <h1>🎯 Real or Fake Words</h1>

      <div className="quiz-container">
        <div className="timer-display" style={{ color: timerColor }}>
          ⏱️ {formatTime(timeLeft)} for this question
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${progress}%`}}></div>
          </div>
          <div className="progress-text">Question {currentQuestion + 1} of {GAME_CONFIG.TOTAL_QUESTIONS}</div>
        </div>

        <div className="word-question-container">
          <h2 className="word-question-title">Is this a real English word?</h2>
          
          <div className="word-display">
            {currentWord?.word}
          </div>

          {gameState === GAME_STATES.PLAYING && (
            <div className="word-answer-buttons">
              <button 
                className="word-answer-btn yes-btn"
                onClick={() => handleAnswer(true)}
              >
                <div className="btn-icon">✓</div>
                <div className="btn-text">Yes</div>
              </button>
              
              <button 
                className="word-answer-btn no-btn"
                onClick={() => handleAnswer(false)}
              >
                <div className="btn-icon">✗</div>
                <div className="btn-text">No</div>
              </button>
            </div>
          )}
        </div>

        {gameState === GAME_STATES.FEEDBACK && lastAnswer && (
          <div className={`feedback-card ${lastAnswer.correct ? 'correct' : 'incorrect'}`}>
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

        <div className="exercise-footer">
          <button className="btn btn-secondary btn-small" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="exercise-page scrollable-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <h1>🎯 Real or Fake Words Results</h1>
      
      <div className="quiz-container">
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
                      <span className="timeout-indicator">⏰ Time ran out</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button className="btn btn-primary" onClick={restartGame}>
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

  // Main render switch
  switch (gameState) {
    case GAME_STATES.INSTRUCTIONS:
      return renderInstructions();
    case GAME_STATES.LOADING:
      return renderLoading();
    case GAME_STATES.PLAYING:
    case GAME_STATES.FEEDBACK:
      return renderGame();
    case GAME_STATES.RESULTS:
      return renderResults();
    default:
      return renderInstructions();
  }
}

export default RealFakeWordsExercise;
