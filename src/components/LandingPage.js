// src/components/LandingPage.js
import React from 'react';
import { getArticleInfo } from '../articleQuestions';

function LandingPage({ onStart }) {
  const articleInfo = getArticleInfo();

  const startStaticQuiz = () => {
    onStart('static');
  };

  const startArticleQuiz = () => {
    onStart('article');
  };

  const openArticle = () => {
    window.open(articleInfo.url, '_blank');
  };

  return (
    <div className="landing">
      <h1>🎯 English Vocabulary Test</h1>
      <div className="welcome-text">
        <p>Test your English vocabulary skills with our interactive quiz!</p>
        <p>Choose from two different quiz types:</p>
      </div>

      <div className="quiz-options">
        {/* Static Quiz Option */}
        <div className="quiz-option">
          <h3>📚 Standard Vocabulary Test</h3>
          <p>Complete 10 fill-in-the-blank questions across different CEFR levels.</p>
          <p><strong>Duration:</strong> About 5-10 minutes</p>
          <button className="btn btn-primary" onClick={startStaticQuiz}>
            Start Standard Test
          </button>
        </div>

        {/* Article-based Quiz Option */}
        <div className="quiz-option">
          <h3>📰 Article-Based Test</h3>
          <p>Practice vocabulary from this week's featured BBC article:</p>
          <div className="article-info">
            <h4>"{articleInfo.title}"</h4>
            <p className="article-date">Published: {new Date(articleInfo.date).toLocaleDateString()}</p>
            <p className="article-summary">{articleInfo.summary}</p>
          </div>
          <p><strong>Duration:</strong> About 5-10 minutes</p>
          <div className="article-buttons">
            <button className="btn btn-secondary" onClick={openArticle}>
              📖 Read Article First
            </button>
            <button className="btn btn-primary" onClick={startArticleQuiz}>
              Start Article Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;