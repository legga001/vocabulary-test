// src/components/AnswerReview.js
import React from 'react';

function AnswerReview({ questions, userAnswers, title = "Your Answers" }) {
  return (
    <div className="answer-review">
      <h3>📝 {title}:</h3>
      <div className="answers-list">
        {questions.map((q, index) => {
          const userAnswer = userAnswers[index]?.toLowerCase().trim() || '';
          const correctAnswer = q.answer.toLowerCase();
          const isCorrect = userAnswer === correctAnswer;
          
          return (
            <div key={index} className={`answer-item ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="answer-header">
                <span className="answer-emoji">
                  {isCorrect ? '✅' : '❌'}
                </span>
                <span className="question-number">Q{index + 1}</span>
                <span className="level-badge">{q.level}</span>
              </div>
              <div className="answer-details">
                <div className="correct-answer">
                  <strong>Correct answer:</strong> {q.answer}
                </div>
                {!isCorrect && userAnswer && (
                  <div className="user-answer">
                    <strong>Your answer:</strong> {userAnswers[index]}
                  </div>
                )}
                {!isCorrect && q.hint && (
                  <div className="answer-hint">
                    <em>💡 {q.hint}</em>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AnswerReview;