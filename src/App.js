// src/App.js - Complete file with streamlined article flow
import React, { useState, useEffect } from 'react';
import './App.css';
import SplashPage from './components/SplashPage';
import LandingPage from './components/LandingPage';
import ReadingExercise from './components/ReadingExercise';
import WritingExercise from './components/WritingExercise';
import SpeakingExercise from './components/SpeakingExercise';
import ListeningExercise from './components/ListeningExercise';
import ProgressPage from './components/ProgressPage';
import ArticleSelection from './components/ArticleSelection';
import RealFakeWordsExercise from './components/RealFakeWordsExercise';
import ListenAndTypeExercise from './components/ListenAndTypeExercise';

// Key for localStorage - only for preserving state during page refresh
const APP_STATE_KEY = 'mrFoxEnglishAppState';
// Key for sessionStorage - to detect new sessions
const SESSION_KEY = 'mrFoxEnglishSession';
// Key to track if splash was shown in this session
const SPLASH_SHOWN_KEY = 'mrFoxEnglishSplashShown';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isTransitioning, setIsTransitioning] = useState(false);

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
        
        if (parsedState.timestamp && (now - parsedState.timestamp) < thirtySeconds) {
          // This is likely a page refresh - restore the previous screen
          setCurrentScreen(parsedState.currentScreen || 'landing');
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
    const existingSessionId = sessionStorage.getItem(SESSION_KEY);
    const splashShownThisSession = sessionStorage.getItem(SPLASH_SHOWN_KEY);
    
    // Always show splash for new sessions or if splash hasn't been shown
    const currentSessionId = Date.now().toString();
    sessionStorage.setItem(SESSION_KEY, currentSessionId);
    sessionStorage.removeItem(SPLASH_SHOWN_KEY);
    setCurrentScreen('splash');
    console.log('New session - showing splash');
  }, []);

  // Save state whenever it changes (but not for splash or transition states)
  useEffect(() => {
    if (currentScreen === 'splash' || isTransitioning) return;

    const stateToSave = {
      currentScreen,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  }, [currentScreen, isTransitioning]);

  // Clear session when user closes tab/browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear session markers when tab/browser closes
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SPLASH_SHOWN_KEY);
    };

    // Also handle when user navigates away
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User switched tabs or minimised - don't clear session
        // This allows them to return without seeing splash again
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const goToLanding = () => {
    setIsTransitioning(true);
    
    // Mark that splash has been shown in this session
    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    
    // Start transition
    setTimeout(() => {
      setCurrentScreen('landing');
      setIsTransitioning(false);
    }, 400); // Half of animation duration
  };

  const goToProgress = () => {
    setCurrentScreen('progress');
  };

  const goToExercises = () => {
    setCurrentScreen('exercises');
  };

  const goToReading = () => {
    setCurrentScreen('reading');
  };

  const goToWriting = () => {
    setCurrentScreen('writing');
  };

  const goToSpeaking = () => {
    setCurrentScreen('speaking');
  };

  const goToListening = () => {
    setCurrentScreen('listening');
  };

  const goToListenAndType = () => {
    setCurrentScreen('listen-and-type');
  };

  const goBack = () => {
    setCurrentScreen('landing');
  };

  const handleSelectExercise = (exerciseType) => {
    switch(exerciseType) {
      // Direct exercise navigation
      case 'standard-vocabulary':
        setCurrentScreen('standard-vocabulary');
        break;
      case 'article-vocabulary':
        setCurrentScreen('article-selection'); // Go directly to article selection
        break;
      case 'real-fake-words':
        setCurrentScreen('real-fake-words');
        break;
      case 'listen-and-type':
        goToListenAndType();
        break;
      // Traditional navigation (for non-active exercises)
      case 'reading':
        goToReading();
        break;
      case 'writing':
        goToWriting();
        break;
      case 'speaking':
        goToSpeaking();
        break;
      case 'listening':
        goToListening();
        break;
      default:
        console.warn('Unknown exercise type:', exerciseType);
    }
  };

  const handleArticleSelection = (articleType) => {
    // Set the current screen to the specific article quiz
    setCurrentScreen(articleType);
  };

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
            onExercises={goToExercises}
            onProgress={goToProgress}
            onSelectExercise={handleSelectExercise}
            isTransitioning={isTransitioning}
          />
        );
      
      case 'standard-vocabulary':
        return (
          <ReadingExercise 
            onBack={goBack} 
            onLogoClick={goToLanding}
            initialView="standard-quiz"
          />
        );
      
      case 'article-selection':
        return (
          <ArticleSelection 
            onBack={goBack}
            onLogoClick={goToLanding}
            onSelectArticle={handleArticleSelection}
          />
        );
      
      case 'octopus-quiz':
        return (
          <ReadingExercise 
            onBack={() => setCurrentScreen('article-selection')} 
            onLogoClick={goToLanding}
            initialView="octopus-quiz"
          />
        );
      
      case 'smuggling-quiz':
        return (
          <ReadingExercise 
            onBack={() => setCurrentScreen('article-selection')} 
            onLogoClick={goToLanding}
            initialView="smuggling-quiz"
          />
        );
      
      case 'real-fake-words':
        return (
          <RealFakeWordsExercise 
            onBack={goBack} 
            onLogoClick={goToLanding}
          />
        );
      
      case 'listen-and-type':
        return <ListenAndTypeExercise onBack={goBack} />;
      
      case 'reading':
        return (
          <ReadingExercise 
            onBack={goBack} 
            onLogoClick={goToLanding}
          />
        );
      
      case 'writing':
        return (
          <WritingExercise 
            onBack={goBack} 
            onLogoClick={goToLanding}
          />
        );
      
      case 'speaking':
        return (
          <SpeakingExercise 
            onBack={goBack} 
            onLogoClick={goToLanding}
          />
        );
      
      case 'listening':
        return (
          <ListeningExercise 
            onBack={goBack} 
            onLogoClick={goToLanding}
          />
        );
      
      case 'progress':
        return (
          <ProgressPage 
            onBack={goBack} 
            onLogoClick={goToLanding}
          />
        );
      
      default:
        return (
          <LandingPage
            onExercises={goToExercises}
            onProgress={goToProgress}
            onSelectExercise={handleSelectExercise}
            isTransitioning={false}
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
