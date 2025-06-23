// src/components/ArticleSelection.js
import React from 'react';
import ClickableLogo from './ClickableLogo';
import { getReadingArticleInfo } from '../readingVocabularyData';
import { getArticleInfo } from '../articleQuestions';
import { getAirIndiaArticleInfo } from '../airIndiaVocabularyData';
import { getWaterTreatmentArticleInfo } from '../waterTreatmentVocabularyData';

// Conditional import for killer whale data with fallback
let getKillerWhaleArticleInfo;
try {
  const killerWhaleModule = require('../killerWhaleVocabularyData');
  getKillerWhaleArticleInfo = killerWhaleModule.getKillerWhaleArticleInfo;
} catch (error) {
  console.warn('Killer whale vocabulary data not found, using fallback');
  // Fallback function
  getKillerWhaleArticleInfo = () => ({
    title: "Killer whales 'massage' each other using kelp",
    url: "https://www.bbc.co.uk/news/articles/cwyqll5n2qro",
    source: "BBC News",
    date: "23 June 2025",
    author: "Victoria Gill",
    summary: "Researchers have discovered that orcas in the North Pacific use kelp to 'massage' each other.",
    readingTime: "3-4 minutes"
  });
}

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
          {articles.map((article) => (
            <div
              key={article.type}
              className="article-selection-card"
              onClick={() => onSelectArticle(article.type)}
            >
              {article.badge && <div className="new-badge">{article.badge}</div>}
              
              <div className="article-header">
                <div className="card-icon">{article.icon}</div>
                <h3 className="article-title">{article.title}</h3>
                <div className="article-meta">
                  <span className="article-date">{article.date}</span>
                  <span className="article-source">{article.source}</span>
                </div>
              </div>
              
              <p className="article-summary">{article.summary}</p>
              
              <div className="test-info">
                <span>{article.readingTime}</span>
                <span>10 questions</span>
                <span>A2-C1 levels</span>
              </div>
              
              <div className="card-arrow">→</div>
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
