// src/components/Results.js - Updated with daily progress tracking
import React, { useEffect } from 'react';
import { questions as staticQuestions } from '../questionsData';
import { getArticleQuestions, getArticleInfo } from '../articleQuestions';
import AnswerReview from './AnswerReview';
import PronunciationButton from './PronunciationButton';
import { isSpeechSynthesisSupported } from '../utils/pronunciationUtils';
import { recordTestResult } from '../utils/progressDataManager';

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

  // Record the test result when component mounts - this increments daily targets
  useEffect(() => {
    try {
      // Prepare user answers for progress tracking
      const formattedUserAnswers = userAnswers ? userAnswers.slice(0, 10).map((answer, index) => ({
        answer: answer || '',
        correct: answer && answer.toLowerCase().trim() === questions[index].answer.toLowerCase(),
        score: answer && answer.toLowerCase().trim() === questions[index].answer.toLowerCase() ? 100 : 0,
        level: 'B1' // Default level for vocabulary exercises
      })) : [];

      // Record test result - this automatically increments daily targets
      recordTestResult({
        quizType: quizType === 'article' ? 'article-vocabulary' : 'standard-vocabulary',
        score: score,
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: null, // Could add timer tracking in the future
        userAnswers: formattedUserAnswers
      });
      
      console.log(`✅ ${quizType === 'article' ? 'Article' : 'Standard'} vocabulary test result recorded: ${score}/10`);
    } catch (error) {
      console.error('Error recording test result:', error);
    }
  }, [quizType, score, userAnswers, questions]);

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
        feedback: "Your vocabulary knowledge is impressive! Keep challenging yourself with complex texts and specialized vocabulary in different fields."
      };
    }
  };

  const levelInfo = getLevelInfo(score);
  const percentage = Math.round((score / 10) * 100);

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <h1>📊 Quiz Results</h1>
          {articleInfo && (
            <div className="article-info">
              <h2>📰 Article-Based Quiz</h2>
              <p>Based on: "{articleInfo.title}"</p>
            </div>
          )}
        </div>

        <div className="score-section">
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/10</span>
            </div>
            <div className="percentage">{percentage}%</div>
          </div>
          
          <div className="level-info">
            <h3>{levelInfo.level}</h3>
            <p className="level-description">{levelInfo.description}</p>
            <p className="level-feedback">{levelInfo.feedback}</p>
          </div>
        </div>

        <div className="detailed-results">
          <AnswerReview 
            questions={questions}
            userAnswers={userAnswers}
            title="Your Answers"
          />
        </div>

        {articleInfo && (
          <div className="article-context">
            <h3>📖 About the Article</h3>
            <p><strong>Source:</strong> {articleInfo.source}</p>
            <p><strong>Topic:</strong> {articleInfo.topic}</p>
            <p><strong>Level:</strong> {articleInfo.level}</p>
            <div className="article-summary">
              <p>{articleInfo.summary}</p>
            </div>
          </div>
        )}

        <div className="pronunciation-section">
          <h3>🔊 Practice Pronunciation</h3>
          <div className="pronunciation-grid">
            {questions.slice(0, 10).map((question, index) => (
              <div key={index} className="pronunciation-item">
                <span className="word">{question.answer}</span>
                {isSpeechSupported && (
                  <PronunciationButton 
                    word={question.answer} 
                    size="small"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="results-actions">
          <button 
            className="btn btn-primary"
            onClick={onRestart}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
