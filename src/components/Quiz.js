import React, { useState, useEffect } from 'react';
import { questions, correctMessages } from '../questionsData';

function Quiz({ onFinish }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(10).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(10).fill(false));
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });

  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / 10) * 100;

  const processedSentence = question.sentence.replace(/([a-z])_([a-z])/, '___');
  const gapMatch = question.sentence.match(/([a-z])_([a-z])/);
  const placeholder = gapMatch ? `${gapMatch[1]}_${gapMatch[2]} (${question.answer.length})` : '';

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
      onFinish();
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  return (
    <div className="quiz">
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