// src/components/ArticleSelection.js
import React from 'react';
import ClickableLogo from './ClickableLogo';
import { getKillerWhaleArticleInfo } from '../killerWhaleVocabularyData';
import { getReadingArticleInfo } from '../readingVocabularyData';
import { getArticleInfo } from '../articleQuestions';
import { getAirIndiaArticleInfo } from '../airIndiaVocabularyData';
import { getWaterTreatmentArticleInfo } from '../waterTreatmentVocabularyData';

function ArticleSelection({ onBack, onLogoClick, onSelectArticle }) {
  const articles = [
    {
      ...getKillerWhaleArticleInfo(),
      type: 'killer-whale-quiz',
      icon: '🐋',
      badge: '✨ NEW'
    },
    {
      ...getReadingArticleInfo(),
      type: 'octopus-quiz',
      icon: '🐙'
    },
    {
      ...getArticleInfo(),
      type: 'smuggling-quiz',
      icon: '🚢'
    },
    {
      ...getAirIndiaArticleInfo(),
      type: 'air-india-quiz',
      icon: '✈️'
    },
    {
      ...getWaterTreatmentArticleInfo(),
      type: 'water-treatment-quiz',
      icon: '💧'
    }
  ];

  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      
      <div className="quiz-container">
        <h1>📰 Article-Based Vocabulary</h1>
        
        <div className="welcome-text">
          <p>Choose an article to practice vocabulary from current BBC news:</p>
        </div>

        <div className="article-selection-grid">
          {articles.map((article, index) => (
            <div
              key={article.type}
              className={`article-selection-card ${article.badge ? 'featured-article' : ''}`}
              onClick={() => onSelectArticle(article.type)}
              style={{ cursor: 'pointer' }}
            >
              {article.badge && <div className="new-badge">{article.badge}</div>}
              <div className="article-icon" style={{ fontSize: '2.5em', marginBottom: '15px' }}>{article.icon}</div>
              <h3 style={{ color: '#2d3748', marginBottom: '10px', fontSize: '1.2em' }}>{article.title}</h3>
              <div className="article-meta" style={{ marginBottom: '12px' }}>
                <span className="article-date" style={{ color: '#666', fontSize: '0.9em', marginRight: '15px' }}>{article.date}</span>
                <span className="article-source" style={{ color: '#4c51bf', fontSize: '0.9em', fontWeight: '600' }}>{article.source}</span>
              </div>
              <p className="article-summary" style={{ color: '#666', fontSize: '0.95em', lineHeight: '1.5', marginBottom: '15px' }}>{article.summary}</p>
              <div className="article-details" style={{ fontSize: '0.85em', color: '#777', marginBottom: '10px' }}>
                <div>• {article.readingTime}</div>
                <div>• 10 vocabulary questions</div>
                <div>• Multiple difficulty levels</div>
              </div>
              <div className="card-arrow" style={{ fontSize: '1.5em', color: '#4c51bf', fontWeight: 'bold' }}>→</div>
            </div>
          ))}
        </div>

        <div className="reading-info">
          <h3>💡 About Article-Based Vocabulary</h3>
          <p>Learn vocabulary in context from real BBC news articles. Each exercise includes:</p>
          <ul>
            <li>🎯 <strong>Context-Rich Learning:</strong> Words presented in authentic news contexts</li>
            <li>📰 <strong>Current Content:</strong> Fresh vocabulary from recent BBC articles</li>
            <li>📈 <strong>Mixed Difficulty:</strong> Questions range from A2 to C1 level</li>
            <li>🔗 <strong>Source Access:</strong> Read the original article alongside your practice</li>
            <li>💡 <strong>Helpful Hints:</strong> Each question includes contextual clues</li>
          </ul>
        </div>

        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Reading Options
        </button>
      </div>
    </div>
  );
}

export default ArticleSelection;
