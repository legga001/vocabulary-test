// src/components/ReadAndCompleteExercise.js - Fixed with Submit button and enhanced feedback
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import LetterInput from './LetterInput';
import { getRandomParagraphs } from '../data/readCompleteData';
import { recordTestResult } from '../utils/progressDataManager';

const TIMER_DURATION = 180; // 3 minutes per paragraph

function ReadAndCompleteExercise({ onBack, onLogoClick }) {
  const [exerciseParagraphs, setExerciseParagraphs] = useState([]);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [gameState, setGameState] = useState('instructions'); // 'instructions', 'playing', 'results'
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [currentUserInputs, setCurrentUserInputs] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [scores, setScores] = useState([]);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Initialize exercise paragraphs on mount
  useEffect(() => {
    const randomParagraphs = getRandomParagraphs();
    setExerciseParagraphs(randomParagraphs);
    console.log('🎯 Random paragraphs selected:', randomParagraphs.map(p => `${p.title} (${p.id})`));
  }, []);

  // Process gapped text to create input elements
  const processGappedText = useCallback((gappedText, answers) => {
    const parts = gappedText.split(/(\w*_+\w*)/);
    const processedElements = [];
    let answerIndex = 0;

    parts.forEach((part, index) => {
      if (part.includes('_')) {
        // This is a gap that needs an input
        const answer = answers[answerIndex];
        const getLettersToShow = (word) => {
          const length = word.length;
          if (length <= 3) return 1;
          if (length <= 5) return 2;
          if (length <= 7) return 3;
          if (length <= 9) return 4;
          if (length <= 11) return 5;
          return 6;
        };

        const lettersToShow = getLettersToShow(answer);
        const shownLetters = answer.substring(0, lettersToShow);

        processedElements.push({
          type: 'input',
          answer: answer,
          shownLetters: shownLetters,
          index: answerIndex
        });

        answerIndex++;
      } else if (part.trim() !== '') {
        // This is regular text
        processedElements.push({
          type: 'text',
          content: part
        });
      }
    });

    return processedElements;
  }, []);

  // Calculate score for current paragraph
  const calculateScore = useCallback(() => {
    if (exerciseParagraphs.length === 0) return { correct: 0, total: 0, percentage: 0 };
    
    const currentParagraphData = exerciseParagraphs[currentParagraph];
    const answers = currentParagraphData.answers;
    let correct = 0;

    answers.forEach((correctAnswer, index) => {
      const getLettersToShow = (word) => {
        const length = word.length;
        if (length <= 3) return 1;
        if (length <= 5) return 2;
        if (length <= 7) return 3;
        if (length <= 9) return 4;
        if (length <= 11) return 5;
        return 6;
      };

      const lettersToShow = getLettersToShow(correctAnswer);
      const expectedUserPart = correctAnswer.substring(lettersToShow);
      const userAnswer = currentUserInputs[index] || '';

      if (userAnswer === expectedUserPart) {
        correct++;
      }
    });

    const total = answers.length;
    const percentage = Math.round((correct / total) * 100);

    return { correct, total, percentage };
  }, [currentParagraph, currentUserInputs, exerciseParagraphs]);

  // Handle submission of current paragraph
  const handleSubmit = useCallback(() => {
    const score = calculateScore();
    const newScores = [...scores, score];
    setScores(newScores);
    setUserAnswers(prev => ({
      ...prev,
      [currentParagraph]: [...currentUserInputs]
    }));
    
    if (currentParagraph < exerciseParagraphs.length - 1) {
      setCurrentParagraph(prev => prev + 1);
      setGameState('instructions');
    } else {
      setGameState('results');
      
      // Record test result for progress tracking
      const totalCorrect = newScores.reduce((sum, score) => sum + score.correct, 0);
      const totalQuestions = newScores.reduce((sum, score) => sum + score.total, 0);
      const overallPercentage = Math.round((totalCorrect / totalQuestions) * 100);
      
      recordTestResult({
        quizType: 'read-complete',
        score: overallPercentage,
        totalQuestions: totalQuestions,
        completedAt: new Date()
      });
      
      // Note: incrementDailyTarget is temporarily disabled to fix build errors
      // incrementDailyTarget('read-and-complete');
    }
  }, [currentParagraph, currentUserInputs, scores, exerciseParagraphs, calculateScore]);

  // Timer effect - updated to use handleSubmit
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      handleSubmit(); // Changed from handleTimeUp to handleSubmit
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerActive, timeRemaining, handleSubmit]);

  const startParagraph = useCallback(() => {
    if (exerciseParagraphs.length === 0) return;
    
    const paragraph = exerciseParagraphs[currentParagraph];
    setCurrentUserInputs(new Array(paragraph.answers.length).fill(''));
    setTimeRemaining(TIMER_DURATION);
    setIsTimerActive(true);
    setGameState('playing');
  }, [currentParagraph, exerciseParagraphs]);

  const handleInputChange = useCallback((index, value) => {
    const newInputs = [...currentUserInputs];
    newInputs[index] = value;
    setCurrentUserInputs(newInputs);
  }, [currentUserInputs]);

  const restart = useCallback(() => {
    const newRandomParagraphs = getRandomParagraphs();
    setExerciseParagraphs(newRandomParagraphs);
    setCurrentParagraph(0);
    setGameState('instructions');
    setTimeRemaining(TIMER_DURATION);
    setUserAnswers({});
    setScores([]);
    setIsTimerActive(false);
    setCurrentUserInputs([]);
    console.log('🔄 New random paragraphs selected:', newRandomParagraphs.map(p => `${p.title} (${p.id})`));
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Enhanced function to get detailed feedback for each answer
  const getDetailedFeedback = useCallback((userAnswer, correctAnswer, answerIndex) => {
    const getLettersToShow = (word) => {
      const length = word.length;
      if (length <= 3) return 1;
      if (length <= 5) return 2;
      if (length <= 7) return 3;
      if (length <= 9) return 4;
      if (length <= 11) return 5;
      return 6;
    };
    
    const lettersToShow = getLettersToShow(correctAnswer);
    const expectedUserPart = correctAnswer.substring(lettersToShow);
    const isCorrect = userAnswer === expectedUserPart;
    const shownLetters = correctAnswer.substring(0, lettersToShow);
    
    // Build the complete word that the user created
    const userCompleteWord = userAnswer ? shownLetters + userAnswer : shownLetters + '(blank)';
    
    return {
      isCorrect,
      userCompleteWord,
      correctAnswer,
      shownLetters,
      feedback: isCorrect 
        ? '✅ Correct!' 
        : userAnswer 
          ? `❌ Incorrect` 
          : '❌ No answer provided'
    };
  }, []);

  if (exerciseParagraphs.length === 0) {
    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="loading-state">
            <h2>📖 Loading Read and Complete Exercise...</h2>
            <p>Selecting random paragraphs for you...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentParagraphData = exerciseParagraphs[currentParagraph];
  const levelLabels = ['A1-A2', 'B1-B2', 'C1'];

  if (gameState === 'instructions') {
    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📖 Read and Complete</h1>
          
          {currentParagraph === 0 ? (
            <div className="instructions-container">
              <h3>📋 How to Play</h3>
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="instruction-icon">📝</span>
                  <span>Complete the missing words in each paragraph</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⏱️</span>
                  <span>You have 3 minutes per paragraph</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">📊</span>
                  <span>3 paragraphs: A1-A2, B1-B2, and C1 levels</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">💡</span>
                  <span>Use context clues to help you complete the words</span>
                </div>
              </div>
              
              <div className="tips-section">
                <h4>💡 Tips:</h4>
                <ul>
                  <li>Read the whole paragraph first to understand the context</li>
                  <li>Some letters are already provided to help you</li>
                  <li>Type letters in the empty boxes</li>
                  <li>Look at the surrounding words for clues</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="paragraph-transition">
              <h3>Well done! 🎉</h3>
              <p>You completed paragraph {currentParagraph} ({levelLabels[currentParagraph - 1]} level)</p>
              {scores.length > 0 && (
                <p>Score: {scores[scores.length - 1]?.correct}/{scores[scores.length - 1]?.total} ({scores[scores.length - 1]?.percentage}%)</p>
              )}
            </div>
          )}
          
          <div className="paragraph-info">
            <h3>Next: Paragraph {currentParagraph + 1}</h3>
            <div className={`level-badge level-${levelLabels[currentParagraph].toLowerCase().replace('-', '')}`}>
              {levelLabels[currentParagraph]} Level
            </div>
            <h4>{currentParagraphData.title}</h4>
          </div>

          <button className="btn btn-primary" onClick={startParagraph}>
            {currentParagraph === 0 ? '🚀 Start Exercise' : '📖 Start Next Paragraph'}
          </button>
          
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const processedElements = processGappedText(currentParagraphData.gappedText, currentParagraphData.answers);

    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="timer-header">
            <h2>📖 Read and Complete - {levelLabels[currentParagraph]} Level</h2>
            <div className={`timer ${timeRemaining <= 30 ? 'timer-warning' : ''}`}>
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="paragraph-header">
            <h3>{currentParagraphData.title}</h3>
            <div className="progress-indicator">
              Paragraph {currentParagraph + 1} of {exerciseParagraphs.length}
            </div>
          </div>

          <div className="paragraph-container">
            <div className="paragraph-text">
              {processedElements.map((element, index) => {
                if (element.type === 'text') {
                  return <span key={index} className="text-segment">{element.content}</span>;
                } else {
                  return (
                    <span key={index} className="letter-input-wrapper">
                      <LetterInput
                        word={element.answer}
                        value={currentUserInputs[element.index] || ''}
                        onChange={(value) => handleInputChange(element.index, value)}
                        disabled={false}
                        className="read-complete-input"
                      />
                    </span>
                  );
                }
              })}
            </div>

            <div className="submit-section">
              <button 
                className="btn btn-primary submit-btn"
                onClick={handleSubmit}
              >
                ✅ Submit Answers
              </button>
              <p className="submit-hint">
                Click submit when you're ready, or the timer will auto-submit at 0:00
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const totalCorrect = scores.reduce((sum, score) => sum + score.correct, 0);
    const totalQuestions = scores.reduce((sum, score) => sum + score.total, 0);
    const overallPercentage = Math.round((totalCorrect / totalQuestions) * 100);

    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="results-header">
            <h1>📊 Exercise Complete!</h1>
            <div className="overall-score">
              <div className="score-circle">
                <span className="score-number">{overallPercentage}%</span>
                <span className="score-label">Overall Score</span>
              </div>
              <div className="score-breakdown">
                <span className="correct-answers">{totalCorrect} correct</span>
                <span className="total-questions">out of {totalQuestions} questions</span>
              </div>
            </div>
          </div>

          <div className="detailed-results">
            {scores.map((score, paragraphIndex) => (
              <div key={paragraphIndex} className="paragraph-result">
                <h3>Paragraph {paragraphIndex + 1} - {levelLabels[paragraphIndex]} Level</h3>
                <div className="paragraph-score">
                  Score: {score.correct}/{score.total} ({score.percentage}%)
                </div>
                
                <div className="answer-breakdown">
                  <h4>📝 Detailed Feedback:</h4>
                  <div className="answers-grid">
                    {exerciseParagraphs[paragraphIndex].answers.map((correctAnswer, answerIndex) => {
                      const userAnswer = userAnswers[paragraphIndex] ? userAnswers[paragraphIndex][answerIndex] : '';
                      const feedback = getDetailedFeedback(userAnswer, correctAnswer, answerIndex);
                      
                      return (
                        <div key={answerIndex} className={`answer-feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                          <div className="answer-header">
                            <span className="answer-number">Word {answerIndex + 1}:</span>
                            <span className="word-context">{feedback.shownLetters}___</span>
                          </div>
                          <div className="answer-details">
                            <div className="comparison">
                              <div className="user-word">
                                <strong>Your word:</strong> <span className={feedback.isCorrect ? 'correct-word' : 'incorrect-word'}>{feedback.userCompleteWord}</span>
                              </div>
                              <div className="correct-word">
                                <strong>Correct word:</strong> <span className="target-word">{feedback.correctAnswer}</span>
                              </div>
                            </div>
                            <div className={`feedback-message ${feedback.isCorrect ? 'success' : 'error'}`}>
                              {feedback.feedback}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="results-actions">
            <button className="btn btn-primary" onClick={restart}>
              🔄 Try Again (New Paragraphs)
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ReadAndCompleteExercise;
