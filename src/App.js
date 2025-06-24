// src/App.js - Updated with fixed writing exercise navigation
import React, { useState, useEffect } from 'react';
import './App.css';

// Import all components
import SplashPage from './components/SplashPage';
import LandingPage from './components/LandingPage';
import ProgressPage from './components/ProgressPage';
import Quiz from './components/Quiz';
import Results from './components/Results';
import ArticleSelection from './components/ArticleSelection';
import RealFakeWordsExercise from './components/RealFakeWordsExercise';
import ListenAndTypeExercise from './components/ListenAndTypeExercise';
import SpeakingExercise from './components/SpeakingExercise';
import WritingExercise from './components/WritingExercise'; // Fixed writing exercise
import ListeningExercise from './components/ListeningExercise';

function App() {
  // Core state management
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [testQuestions, setTestQuestions] = useState(null);
  const [selectedArticleType, setSelectedArticleType] = useState(null);

  // Transition effect for smooth navigation
  useEffect(() => {
    if (currentScreen !== 'splash') {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Navigation functions
  const goToLanding = () => {
    setCurrentScreen('landing');
  };

  const goToProgress = () => {
    setCurrentScreen('progress');
  };

  const goBack = () => {
    setCurrentScreen('landing');
    setQuizResults(null);
    setTestQuestions(null);
    setSelectedArticleType(null);
  };

  const handleLogoClick = () => {
    setCurrentScreen('landing');
    setQuizResults(null);
    setTestQuestions(null);
  };

  // Quiz completion handler
  const handleQuizFinish = (userAnswers, questions) => {
    setQuizResults(userAnswers);
    setTestQuestions(questions);
    setCurrentScreen('results');
  };

  // Results completion handler
  const handleResultsFinish = () => {
    goBack();
  };

  // Main exercise selection handler - DIRECT NAVIGATION
  const handleSelectExercise = (exerciseType) => {
    switch(exerciseType) {
      // DIRECT quiz navigation - no intermediate steps
      case 'standard-vocabulary':
        setCurrentScreen('standard-vocabulary-quiz');
        break;
      case 'article-vocabulary':
        setCurrentScreen('article-selection');
        break;
      case 'real-fake-words':
        setCurrentScreen('real-fake-words');
        break;
      case 'listen-and-type':
        setCurrentScreen('listen-and-type');
        break;
      case 'speak-and-record':
        setCurrentScreen('speak-and-record');
        break;
      // FIXED: Writing exercise navigation with proper props
      case 'writing':
        setCurrentScreen('writing');
        break;
      // Traditional navigation (for non-active exercises)
      case 'speaking':
        setCurrentScreen('speaking');
        break;
      case 'listening':
        setCurrentScreen('listening');
        break;
      default:
        console.warn('Unknown exercise type:', exerciseType);
    }
  };

  // Article selection handler - DIRECT to article quiz with type tracking
  const handleArticleSelection = (articleType) => {
    setSelectedArticleType(articleType); // Store which article was selected
    setCurrentScreen('article-quiz');
  };

  // Main render function - COMPLETELY FIXED
  const renderCurrentScreen = () => {
    switch(currentScreen) {
      case 'splash':
        return (
          <SplashPage 
            onStartPracticing={goToLanding}
            isTransitioning={isTransitioning}
          />
        );
      
      case 'landing':
        return (
          <LandingPage
            onProgress={goToProgress}
            onSelectExercise={handleSelectExercise}
            isTransitioning={isTransitioning}
          />
        );
      
      case 'progress':
        return (
          <ProgressPage onBack={goBack} />
        );

      // DIRECT QUIZ NAVIGATION - FIXED
      case 'standard-vocabulary-quiz':
        return (
          <Quiz 
            quizType="standard" 
            onFinish={handleQuizFinish}
            onBack={goBack}
            onLogoClick={handleLogoClick}
          />
        );
      
      case 'article-selection':
        return (
          <ArticleSelection 
            onBack={goBack}
            onLogoClick={handleLogoClick}
            onSelectArticle={handleArticleSelection}
          />
        );
      
      case 'article-quiz':
        return (
          <Quiz 
            quizType="article" 
            articleType={selectedArticleType}
            onFinish={handleQuizFinish}
            onBack={() => setCurrentScreen('article-selection')}
            onLogoClick={handleLogoClick}
          />
        );

      case 'results':
        return (
          <Results 
            userAnswers={quizResults}
            quizType={currentScreen.includes('article') ? 'article' : 'standard'}
            testQuestions={testQuestions}
            onRestart={handleResultsFinish}
          />
        );
      
      // Other exercises
      case 'real-fake-words':
        return (
          <RealFakeWordsExercise 
            onBack={goBack} 
            onLogoClick={handleLogoClick}
          />
        );
      
      case 'listen-and-type':
        return (
          <ListenAndTypeExercise 
            onBack={goBack} 
            onLogoClick={handleLogoClick}
          />
        );
      
      case 'speak-and-record':
        return (
          <SpeakingExercise 
            onBack={goBack} 
            onLogoClick={handleLogoClick}
          />
        );
      
      // FIXED: Writing exercise with proper props
      case 'writing':
        return (
          <WritingExercise 
            onBack={goBack} 
            onLogoClick={handleLogoClick}
          />
        );
      
      case 'speaking':
        return (
          <SpeakingExercise 
            onBack={goBack} 
            onLogoClick={handleLogoClick}
          />
        );
      
      case 'listening':
        return (
          <ListeningExercise 
            onBack={goBack} 
            onLogoClick={handleLogoClick}
          />
        );
      
      default:
        return (
          <LandingPage
            onProgress={goToProgress}
            onSelectExercise={handleSelectExercise}
            isTransitioning={isTransitioning}
          />
        );
    }
  };

  return (
    <div className={`App ${currentScreen === 'splash' ? 'splash-mode' : ''}`}>
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
