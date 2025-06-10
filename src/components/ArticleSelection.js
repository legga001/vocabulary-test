// src/components/ArticleSelection.js - Rewritten with responsive grey box and streamlined flow
import React from 'react';
import ClickableLogo from './ClickableLogo';
import { getReadingArticleInfo } from '../readingVocabularyData';
import { getArticleInfo } from '../articleQuestions';

function ArticleSelection({ onBack, onLogoClick, onSelectArticle }) {
  // Get all articles and sort by date (most recent first)
  const octopusArticle = getReadingArticleInfo();
  const smugglingArticle = getArticleInfo();

  // Create articles array with all necessary info
  const articles = [
    {
      id: 'octopus-quiz',
      title: octopusArticle.title,
      date: octopusArticle.date,
      summary: octopusArticle.summary,
      url: octopusArticle.url,
      excerpt: octopusArticle.excerpt || null
    },
    {
      id: 'smuggling-quiz',
      title: smugglingArticle.title,
      date: smugglingArticle.date,
      summary: smugglingArticle.summary,
      url: smugglingArticle.url,
      excerpt: null
    }
  ];

  // Sort by date (most recent first)
  const sortedArticles = articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const articleDate = new Date(dateStr);
    const diffTime = Math.abs(now - articleDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      
      {/* ARTICLE SELECTION CONTAINER - RESPONSIVE GREY BOX */}
      <div className="quiz-container">
        <h1>📰 Article-Based Vocabulary Tests</h1>
        
        <div className="welcome-text">
          <p>Choose an article to practise vocabulary from real BBC news stories:</p>
        </div>

        <div className="article-selection-grid">
          {sortedArticles.map((article, index) => (
            <div key={article.id} className="article-selection-card">
              {index === 0 && (
                <div className="newest-badge">
                  ✨ Most Recent
                </div>
              )}
              
              <div className="article-header">
                <h3 className="article-title">"{article.title}"</h3>
                <div className="article-meta">
                  <span className="article-date">{formatDate(article.date)}</span>
                  <span className="article-time-ago">({getTimeAgo(article.date)})</span>
                </div>
              </div>

              <div className="article-summary">
                {article.summary}
              </div>

              {article.excerpt && (
                <div className="article-excerpt">
                  <strong>Sample:</strong> {article.excerpt.substring(0, 150)}...
                </div>
              )}

              <div className="article-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  📖 Read Full Article
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => onSelectArticle(article.id)}
                >
                  🎯 Start Vocabulary Test
                </button>
              </div>

              <div className="test-info">
                <span>📚 10 questions</span>
                <span>🎚️ A2-C1 levels</span>
                <span>⏱️ 5-10 minutes</span>
              </div>
            </div>
          ))}
        </div>

        <div className="article-selection-info">
          <h3>💡 Why Practise with Articles?</h3>
          <p>Learning vocabulary from real news articles helps you:</p>
          <ul>
            <li>🎯 <strong>Context Learning:</strong> See how words are used naturally</li>
            <li>📰 <strong>Current Topics:</strong> Stay updated with contemporary English</li>
            <li>🌍 <strong>Real Situations:</strong> Practise with authentic content</li>
            <li>📈 <strong>Level Progression:</strong> Build from basic to advanced vocabulary</li>
          </ul>
        </div>

        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Reading Options
        </button>
      </div>
      {/* END ARTICLE SELECTION CONTAINER */}
    </div>
  );
}

export default ArticleSelection;
