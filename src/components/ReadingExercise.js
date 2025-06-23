// src/components/ReadingExercise.js - Simplified to use the unified Quiz component
import React, { useState } from 'react';
import ClickableLogo from './ClickableLogo';
import Quiz from './Quiz';
import Results from './Results';

function ReadingExercise({ onBack }) {
  const [currentView, setCurrentView] = useState('selection');
  const [quizResults, setQuizResults] = useState(null);
  const [testQuestions, setTestQuestions] = useState(null);

  // Handle logo click to go back to main menu
  const onLogoClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // Navigation functions
  const goBack = () => {
    setCurrentView('selection');
    setQuizResults(null);
    setTestQuestions(null);
  };

  const goToArticleSelection = () => {
    setCurrentView('article-selection');
  };

  const startStandardQuiz = () => {
    setCurrentView('standard-quiz');
  };

  const startArticleQuiz = (articleType) => {
    setCurrentView('article-quiz');
  };

  // Handle quiz completion
  const handleQuizFinish = (userAnswers, questions) => {
    setQuizResults(userAnswers);
    setTestQuestions(questions);
    setCurrentView('results');
  };

  // Handle results completion
  const handleResultsFinish = () => {
    goBack();
  };

  // Main selection screen
  const renderSelection = () => (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      
      <h1>📚 Reading & Vocabulary</h1>
      
      <div className="exercise-options">
        <div className="exercise-option">
          <h2>📰 Article-Based Quiz</h2>
          <p>Test your vocabulary using real newspaper articles. Questions are based on context from actual news stories.</p>
          <button 
            className="btn btn-primary exercise-btn"
            onClick={goToArticleSelection}
          >
            Choose Article Quiz
          </button>
        </div>

        <div className="exercise-option">
          <h2>📚 Standard Vocabulary Quiz</h2>
          <p>Practice vocabulary with a random selection of words from different difficulty levels (A2-C1).</p>
          <button 
            className="btn btn-primary exercise-btn"
            onClick={startStandardQuiz}
          >
            Start Standard Quiz
          </button>
        </div>
      </div>

      <button className="btn btn-secondary back-btn" onClick={onBack}>
        ← Back to Exercise Selection
      </button>
    </div>
  );

  // Article selection screen
  const renderArticleSelection = () => (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      
      <h1>📰 Choose an Article Quiz</h1>
      
      <div className="article-options">
        <div className="article-option">
          <h3>🐋 Killer Whale Intelligence</h3>
          <p>Explore vocabulary from an article about the remarkable intelligence of killer whales and their complex social behaviours.</p>
          <button 
            className="btn btn-primary"
            onClick={() => startArticleQuiz('killer-whale')}
          >
            Start Quiz
          </button>
        </div>

        <div className="article-option">
          <h3>🐙 Octopus Intelligence</h3>
          <p>Discover vocabulary from an article about the surprising cognitive abilities of octopuses and their problem-solving skills.</p>
          <button 
            className="btn btn-primary"
            onClick={() => startArticleQuiz('octopus')}
          >
            Start Quiz
          </button>
        </div>

        <div className="article-option">
          <h3>🚢 Smuggling Investigation</h3>
          <p>Learn vocabulary from a news article about international smuggling operations and law enforcement responses.</p>
          <button 
            className="btn btn-primary"
            onClick={() => startArticleQuiz('smuggling')}
          >
            Start Quiz
          </button>
        </div>

        <div className="article-option">
          <h3>✈️ Air India Case Study</h3>
          <p>Practice vocabulary from an article about Air India's business challenges and strategic developments.</p>
          <button 
            className="btn btn-primary"
            onClick={() => startArticleQuiz('air-india')}
          >
            Start Quiz
          </button>
        </div>

        <div className="article-option">
          <h3>💧 Water Treatment Technology</h3>
          <p>Study vocabulary from an article about advances in water treatment and purification technologies.</p>
          <button 
            className="btn btn-primary"
            onClick={() => startArticleQuiz('water-treatment')}
          >
            Start Quiz
          </button>
        </div>
      </div>

      <button className="btn btn-secondary back-btn" onClick={goBack}>
        ← Back to Quiz Selection
      </button>
    </div>
  );

  // Render the appropriate screen based on current view
  switch (currentView) {
    case 'selection':
      return renderSelection();

    case 'article-selection':
      return renderArticleSelection();

    case 'standard-quiz':
      return (
        <div className="exercise-page">
          <ClickableLogo onLogoClick={onLogoClick} />
          <Quiz 
            quizType="standard" 
            onFinish={handleQuizFinish}
            onBack={goBack}
          />
        </div>
      );

    case 'article-quiz':
      return (
        <div className="exercise-page">
          <ClickableLogo onLogoClick={onLogoClick} />
          <Quiz 
            quizType="article" 
            onFinish={handleQuizFinish}
            onBack={goBack}
          />
        </div>
      );

    case 'results':
      return (
        <div className="exercise-page">
          <ClickableLogo onLogoClick={onLogoClick} />
          <Results 
            userAnswers={quizResults}
            quizType={currentView.includes('article') ? 'article' : 'standard'}
            testQuestions={testQuestions}
            onRestart={handleResultsFinish}
          />
        </div>
      );

    default:
      return renderSelection();
  }
}

export default ReadingExercise;
