// src/components/Results.js
import React from 'react';
import { questions as staticQuestions } from '../questionsData';
import { getArticleQuestions, getArticleInfo } from '../articleQuestions';
import AnswerReview from './AnswerReview';
import PronunciationButton from './PronunciationButton';
import { isSpeechSynthesisSupported } from '../utils/pronunciationUtils';

function Results({ onRestart, userAnswers, quizType }) {
  // Get the correct questions based on quiz type
  const questions = quizType === 'article' ? getArticleQuestions() : staticQuestions;
  const articleInfo = quizType === 'article' ? getArticleInfo() : null;
  const isSpeechSupported = isSpeechSynthesisSupported();

  // Calculate score
  const calculateScore = () => {
    let score = 0;
    for (let i = 0; i < 10; i++) {
      if (userAnswers && userAnswers[i] && 
          userAnswers[i].toLowerCase().trim() === questions[i].answer.toLowerCase()) {
        score++;
      }
    }
    return score;
  };

  const score = calculateScore();

  // Determine level and feedback
  const getLevelInfo = (score) => {
    if (score <= 2) {
      return {
        level: "A1-A2 (Elementary)",
        description: "You're building your foundation!",
        feedback: "Keep practicing basic vocabulary and common phrases. Focus on everyday words and simple sentence structures."
      };
    } else if (score <= 4) {
      return {
        level: "A2-B1 (Pre-Intermediate)",
        description: "You're making good progress!",
        feedback: "Continue expanding your vocabulary with more complex words. Practice reading simple texts and engaging in basic conversations."
      };
    } else if (score <= 6) {
      return {
        level: "B1-B2 (Intermediate)",
        description: "You have a solid vocabulary base!",
        feedback: "Focus on advanced vocabulary and expressions. Try reading news articles and academic texts to challenge yourself further."
      };
    } else if (score <= 8) {
      return {
        level: "B2-C1 (Upper-Intermediate)",
        description: "Excellent vocabulary knowledge!",
        feedback: "You demonstrate strong command of English vocabulary. Continue with advanced materials and specialized terminology in your areas of interest."
      };
    } else {
      return {
        level: "C1-C2 (Advanced)",
        description: "Outstanding vocabulary mastery!",
        feedback: "Your vocabulary knowledge is impressive! You can handle complex texts and nuanced language with confidence. Keep challenging yourself with literature and academic materials."
      };
    }
  };

  const levelInfo = getLevelInfo(score);

  return (
    <div className="results">
      <h2>🎉 Test Complete!</h2>
      
      {/* Show quiz type */}
      <div className="quiz-type-indicator">
        {quizType === 'article' ? (
          <div className="article-test-indicator">
            <h3>📰 Article-Based Test</h3>
            <p>Based on: "{articleInfo?.title}"</p>
          </div>
        ) : (
          <div className="standard-test-indicator">
            <h3>📚 Standard Vocabulary Test</h3>
          </div>
        )}
      </div>
      
      <div className="score-display">{score}/10</div>
      
      <div className="level-estimate">
        <h3>Your Level: {levelInfo.level}</h3>
        <p>{levelInfo.description}</p>
      </div>

      {/* Pronunciation Feature Highlight */}
      {isSpeechSupported && (
        <div className="pronunciation-feature-highlight">
          <div className="feature-icon">🔊</div>
          <h4>New: Pronunciation Practice!</h4>
          <p>Click the pronunciation buttons next to each word to hear how they're pronounced. Perfect your speaking skills!</p>
        </div>
      )}

      {/* Use the reusable AnswerReview component */}
      <AnswerReview 
        questions={questions}
        userAnswers={userAnswers}
        title="Your Answers"
      />
      
      <div className="feedback-message">
        {levelInfo.feedback}
        {quizType === 'article' && (
          <div className="article-feedback">
            <br />
            <strong>Great work!</strong> You've practiced vocabulary from a current BBC article. 
            This helps you learn words in context and stay up-to-date with contemporary English usage.
          </div>
        )}
      </div>
      
      <button className="btn" onClick={onRestart}>
        Take Test Again
      </button>
    </div>
  );
}

export default Results;