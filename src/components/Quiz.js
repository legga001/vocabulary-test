// src/components/Quiz.js
import React, { useState, useEffect } from 'react';
import { questions as staticQuestions, correctMessages } from '../questionsData';
import { getArticleQuestions } from '../articleQuestions';

// Key for localStorage
const QUIZ_STATE_KEY = 'mrFoxEnglishQuizState';

function Quiz({ onFinish, quizType }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(10).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(10).fill(false));
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });

  // Get questions based on quiz type
  const questions = quizType === 'article' ? getArticleQuestions() : staticQuestions;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / 10) * 100;

  // Load saved quiz state on component mount
  useEffect(() => {
    const savedQuizState = localStorage.getItem(QUIZ_STATE_KEY);
    if (savedQuizState) {
      try {
        const parsedState = JSON.parse(savedQuizState);
        
        // Only restore if it's the same quiz type and recent (within 30 minutes)
        const thirtyMinutes = 30 * 60 * 1000;
        const now = Date.now();
        
        if (parsedState.quizType === quizType && 
            parsedState.timestamp && 
            (now - parsedState.timestamp) < thirtyMinutes) {
          
          setCurrentQuestion(parsedState.currentQuestion || 0);
          setUserAnswers(parsedState.userAnswers || new Array(10).fill(''));
          setCheckedQuestions(parsedState.checkedQuestions || new Array(10).fill(false));
          console.log('Restored quiz progress from localStorage');
        } else {
          // Clear old or different quiz state
          localStorage.removeItem(QUIZ_STATE_KEY);
        }
      } catch (error) {
        console.error('Error loading saved quiz state:', error);
        localStorage.removeItem(QUIZ_STATE_KEY);
      }
    }
  }, [quizType]);

  // Save quiz state whenever it changes
  useEffect(() => {
    const stateToSave = {
      quizType,
      currentQuestion,
      userAnswers,
      checkedQuestions,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving quiz state:', error);
    }
  }, [currentQuestion, userAnswers, checkedQuestions, quizType]);

  // Handle both old format (h_t) and new format (h__t) gaps
  const processGap = (sentence, answer) => {
    // Check for new format first (multiple underscores between letters)
    const newFormatMatch = sentence.match(/([a-zA-Z])_+([a-zA-Z])/);
    if (newFormatMatch) {
      // Replace the gap with blanks: h__t becomes h___
      const gapLength = answer.length;
      const blanks = '_'.repeat(gapLength);
      return sentence.replace(/([a-zA-Z])_+([a-zA-Z])/, blanks);
    }
    
    // Fall back to old format (h_t)
    const oldFormatMatch = sentence.match(/([a-zA-Z])_([a-zA-Z])/);
    if (oldFormatMatch) {
      return sentence.replace(/([a-zA-Z])_([a-zA-Z])/, '___');
    }
    
    return sentence;
  };

  const getPlaceholder = (sentence, answer) => {
    // For new format, show first letter, underscores, last letter, and length
    const newFormatMatch = sentence.match(/([a-zA-Z])_+([a-zA-Z])/);
    if (newFormatMatch) {
      const firstLetter = newFormatMatch[1];
      const lastLetter = newFormatMatch[2];
      const middleLength = answer.length - 2;
      const middleUnderscores = '_'.repeat(middleLength);
      return `${firstLetter}${middleUnderscores}${lastLetter} (${answer.length})`;
    }
    
    // Fall back to old format
    const oldFormatMatch = sentence.match(/([a-zA-Z])_([a-zA-Z])/);
    if (oldFormatMatch) {
      return `${oldFormatMatch[1]}_${oldFormatMatch[2]} (${answer.length})`;
    }
    
    return `(${answer.length} letters)`;
  };

  const processedSentence = processGap(question.sentence, question.answer);
  const placeholder = getPlaceholder(question.sentence, question.answer);

  const checkAnswer = () => {
    const userAnswer = userAnswers[currentQuestion].toLowerCase().trim();
    const correctAnswer = question.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
      const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      setFeedback({ show: true, type: 'correct', message: randomMessage });
    } else {
      setFeedback({ show: true, type: 'incorrect', message: `💡 Hint: ${question.hint}` });
    }

    const newChecked = [...checkedQuestions];
    newChecked[currentQuestion] = true;
    setCheckedQuestions(newChecked);
  };

  const updateAnswer = (value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion === 9) {
      // Clear quiz state when finishing
      localStorage.removeItem(QUIZ_STATE_KEY);
      onFinish(userAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  return (
    <div className="quiz">
      <div className="quiz-header">
        <div className="quiz-type-badge">
          {quizType === 'article' ? '📰 Article-Based' : '📚 Standard'} Test
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{width: `${progress}%`}}></div>
        </div>
        <div className="progress-text">Question {currentQuestion + 1} of 10</div>
      </div>

      <div className="question-header">
        <div className="question-number">Question {currentQuestion + 1}</div>
        <div className="level-badge">{question.level}</div>
      </div>

      <div className="question-text">{processedSentence}</div>

      {/* Show context for article-based questions */}
      {quizType === 'article' && question.context && (
        <div className="question-context">
          <small>📖 {question.context}</small>
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          className={`answer-input ${feedback.show ? feedback.type : ''}`}
          value={userAnswers[currentQuestion]}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
        />
        {feedback.show && (
          <div className={`feedback ${feedback.type}`}>
            {feedback.message}
          </div>
        )}
      </div>

      <button className="btn" onClick={checkAnswer}>
        Check Answer
      </button>

      <div className="navigation">
        <button 
          className="nav-btn" 
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        <button className="nav-btn" onClick={nextQuestion}>
          {currentQuestion === 9 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default Quiz;