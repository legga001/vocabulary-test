// src/components/LandingPage.js
import React from 'react';
import { getArticleInfo } from '../articleQuestions';

function LandingPage({ onStart, onExercises, onProgress, isTransitioning }) {
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
    <div className={`landing ${isTransitioning === false ? 'fade-in' : ''}`}>
      <div className="logo-container">
        <img 
          src="/purple_fox_transparent.png" 
          alt="Mr. Fox English" 
          className="app-logo"
        />
      </div>
      <h1>🎯 Mr. Fox English</h1>
        <div className="welcome-text">
          <p>Choose how you'd like to practice your English skills:</p>
        </div>

        {/* Main Navigation Buttons */}
        <div className="main-navigation">
          <button 
            className="btn" 
            onClick={onExercises}
            style={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)', 
              fontSize: '1.2em',
              padding: '18px 40px',
              marginBottom: '15px'
            }}
          >
            🏋️ Practice Exercises
          </button>
          
          <button 
            className="btn" 
            onClick={onProgress}
            style={{ 
              background: 'linear-gradient(135deg, #48bb78, #38a169)', 
              fontSize: '1.2em',
              padding: '18px 40px',
              marginBottom: '20px'
            }}
          >
            📊 View Progress
          </button>
          
          <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '30px' }}>
            <p>Track your learning journey, see daily stats, and monitor improvement!</p>
          </div>
        </div>

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />

        <h2 style={{ color: '#4c51bf', marginBottom: '20px', fontSize: '1.5em' }}>
          📝 Vocabulary Tests
        </h2>

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