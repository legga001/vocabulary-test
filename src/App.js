// src/App.js - COMPLETE FIXED VERSION
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
import WritingExercise from './components/WritingExercise';
import ListeningExercise from './components/ListeningExercise';
import ReadAndCompleteExercise from './components/ReadAndCompleteExercise';
import InteractiveReadingExercise from './components/InteractiveReadingExercise';

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
      // Writing exercise navigation
      case 'writing':
        setCurrentScreen('writing');
        break;
      // Read and Complete exercise navigation
      case 'read-and-complete':
        setCurrentScreen('read-and-complete');
        break;
      // NEW: Interactive Reading exercise navigation
      case 'interactive-reading':
        setCurrentScreen('interactive-reading');
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
  const handleArticleSelect = (articleType) => {
    setSelectedArticleType(articleType);
    setCurrentScreen('article-vocabulary-quiz');
  };

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashPage onStartPracticing={goToLanding} isTransitioning={isTransitioning} />;

      case 'landing':
        return (
          <LandingPage
            onSelectExercise={handleSelectExercise}
            onProgress={goToProgress}
            isTransitioning={isTransitioning}
          />
        );

      case 'progress':
        return <ProgressPage onBack={goBack} onLogoClick={handleLogoClick} />;

      // Quiz screens - FIXED WITH PROPER PROPS
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
            onSelectArticle={handleArticleSelect}
            onBack={goBack}
            onLogoClick={handleLogoClick}
          />
        );

      case 'article-vocabulary-quiz':
        return (
          <Quiz
            quizType="article"
            articleType={selectedArticleType}
            onFinish={handleQuizFinish}
            onBack={goBack}
            onLogoClick={handleLogoClick}
          />
        );

      case 'results':
        return (
          <Results
            userAnswers={quizResults}
            questions={testQuestions}
            quizType={currentScreen.includes('article') ? 'article' : 'standard'}
            articleType={selectedArticleType}
            onRestart={handleResultsFinish}
          />
        );

      // Exercise screens
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

      case 'writing':
        return (
          <WritingExercise
            onBack={goBack}
            onLogoClick={handleLogoClick}
          />
        );

      case 'read-and-complete':
        return (
          <ReadAndCompleteExercise
            onBack={goBack}
            onLogoClick={handleLogoClick}
          />
        );

      // NEW: Interactive Reading exercise
      case 'interactive-reading':
        return (
          <InteractiveReadingExercise
            onBack={goBack}
            onLogoClick={handleLogoClick}
          />
        );

      // Placeholder screens
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
        return <LandingPage onSelectExercise={handleSelectExercise} />;
    }
  };

  return (
    <div className={`App ${currentScreen === 'splash' ? 'splash-mode' : ''}`}>
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
