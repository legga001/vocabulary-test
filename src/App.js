// src/App.js - Completely fixed with direct Quiz navigation
import React, { useState, useEffect } from 'react';
import './App.css';
import SplashPage from './components/SplashPage';
import LandingPage from './components/LandingPage';
import Quiz from './components/Quiz';
import Results from './components/Results';
import WritingExercise from './components/WritingExercise';
import SpeakingExercise from './components/SpeakingExercise';
import ListeningExercise from './components/ListeningExercise';
import ProgressPage from './components/ProgressPage';
import ArticleSelection from './components/ArticleSelection';
import RealFakeWordsExercise from './components/RealFakeWordsExercise';
import ListenAndTypeExercise from './components/ListenAndTypeExercise';

// Storage keys for state management
const APP_STATE_KEY = 'mrFoxEnglishAppState';
const SESSION_KEY = 'mrFoxEnglishSession';
const SPLASH_SHOWN_KEY = 'mrFoxEnglishSplashShown';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [testQuestions, setTestQuestions] = useState(null);
  const [selectedArticleType, setSelectedArticleType] = useState(null); // Track selected article

  // Load saved state on component mount
  useEffect(() => {
    // Check for recent saved state first (page refresh scenario)
    const savedState = localStorage.getItem(APP_STATE_KEY);
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Check if the saved state is very recent (within 30 seconds = page refresh)
        const thirtySeconds = 30 * 1000;
        const now = Date.now();
        
        if (parsedState.timestamp && 
            (now - parsedState.timestamp) < thirtySeconds) {
          
          // This is likely a page refresh - restore the previous screen
          setCurrentScreen(parsedState.currentScreen || 'landing');
          setSelectedArticleType(parsedState.selectedArticleType || null);
          console.log('Page refresh detected - restored to:', parsedState.currentScreen);
          
          // Maintain session continuity
          if (!sessionStorage.getItem(SESSION_KEY)) {
            sessionStorage.setItem(SESSION_KEY, Date.now().toString());
          }
          if (!sessionStorage.getItem(SPLASH_SHOWN_KEY)) {
            sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
          }
          return;
        } else {
          // Old state - clear it
          localStorage.removeItem(APP_STATE_KEY);
          console.log('Old state cleared');
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        localStorage.removeItem(APP_STATE_KEY);
      }
    }
    
    // If we get here, this is NOT a page refresh
    // Check if this is a new session (new tab, browser restart, etc.)
    const sessionTimestamp = sessionStorage.getItem(SESSION_KEY);
    const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);
    
    if (sessionTimestamp && splashShown) {
      // Session exists and splash was shown - go directly to landing
      setCurrentScreen('landing');
      console.log('Existing session detected - skipping splash');
    } else {
      // New session - show splash
      setCurrentScreen('splash');
      console.log('New session - showing splash');
    }
  }, []);

  // Save current screen to localStorage for page refresh scenarios
  useEffect(() => {
    const stateToSave = {
      currentScreen,
      selectedArticleType,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  }, [currentScreen, selectedArticleType]);

  // Navigation functions
  const goToLanding = () => {
    setIsTransitioning(true);
    
    // Mark that splash has been shown in this session
    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    
    // Start transition
    setTimeout(() => {
      setCurrentScreen('landing');
      setIsTransitioning(false);
    }, 400);
  };

  const goToProgress = () => {
    setCurrentScreen('progress');
  };

  const goBack = () => {
    setCurrentScreen('landing');
    setQuizResults(null);
    setTestQuestions(null);
  };

  // Logo click handler - always goes back to landing page
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
      // Traditional navigation (for non-active exercises)
      case 'writing':
        setCurrentScreen('writing');
        break;
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
          <RealFakeWordsExercise onBack={goBack} />
        );
      
      case 'listen-and-type':
        return (
          <ListenAndTypeExercise onBack={goBack} />
        );
      
      case 'speak-and-record':
        return (
          <SpeakingExercise onBack={goBack} />
        );
      
      case 'writing':
        return (
          <WritingExercise onBack={goBack} />
        );
      
      case 'speaking':
        return (
          <SpeakingExercise onBack={goBack} />
        );
      
      case 'listening':
        return (
          <ListeningExercise onBack={goBack} />
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
