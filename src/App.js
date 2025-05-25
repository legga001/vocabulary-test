// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import SplashPage from './components/SplashPage';
import LandingPage from './components/LandingPage';
import ReadingExercise from './components/ReadingExercise';
import WritingExercise from './components/WritingExercise';
import SpeakingExercise from './components/SpeakingExercise';
import ListeningExercise from './components/ListeningExercise';
import ProgressPage from './components/ProgressPage';

// Key for localStorage
const APP_STATE_KEY = 'mrFoxEnglishAppState';
const SESSION_KEY = 'mrFoxEnglishSession';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load saved state on component mount
  useEffect(() => {
    // Check if this is the same browser session
    const sessionId = sessionStorage.getItem(SESSION_KEY);
    const currentSession = Date.now().toString();
    
    // If no session exists, this is a fresh visit - show splash
    if (!sessionId) {
      sessionStorage.setItem(SESSION_KEY, currentSession);
      setCurrentScreen('splash');
      return;
    }

    // If session exists (refresh or navigation within same session), restore state
    const savedState = localStorage.getItem(APP_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Only restore if the saved state is recent (within 1 hour)
        const oneHour = 60 * 60 * 1000;
        const now = Date.now();
        
        if (parsedState.timestamp && (now - parsedState.timestamp) < oneHour) {
          // Skip splash if we have recent state and this is same session
          setCurrentScreen(parsedState.currentScreen || 'landing');
          console.log('Restored app state from localStorage (same session)');
        } else {
          // Clear old state and show splash
          localStorage.removeItem(APP_STATE_KEY);
          setCurrentScreen('splash');
          console.log('Cleared old app state');
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        localStorage.removeItem(APP_STATE_KEY);
        setCurrentScreen('splash');
      }
    } else {
      // No saved state, but session exists (user was here but no saved navigation)
      setCurrentScreen('splash');
    }
  }, []);

  // Clear session when user closes tab/browser (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // This will trigger on tab close, browser close, or navigation away
      sessionStorage.removeItem(SESSION_KEY);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    // Don't save splash or transition states
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

  const goToLanding = () => {
    setIsTransitioning(true);
    
    // Start transition
    setTimeout(() => {
      setCurrentScreen('landing');
      setIsTransitioning(false);
    }, 400); // Half of animation duration
  };

  const goToProgress = () => {
    setCurrentScreen('progress');
  };

  const selectExercise = (exerciseType) => {
    setCurrentScreen(exerciseType);
  };

  const restartApp = () => {
    // Clear saved state when restarting
    localStorage.removeItem(APP_STATE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentScreen('splash');
  };

  const goBackToLanding = () => {
    setCurrentScreen('landing');
  };

  return (
    <div className={`App ${currentScreen === 'splash' ? 'splash-mode' : ''} ${isTransitioning ? 'transition-loading' : ''}`}>
      {currentScreen === 'splash' && (
        <SplashPage 
          onStartPracticing={goToLanding} 
          isTransitioning={isTransitioning}
        />
      )}
      {currentScreen === 'landing' && (
        <LandingPage 
          onProgress={goToProgress}
          onSelectExercise={selectExercise}
          isTransitioning={isTransitioning}
        />
      )}
      {currentScreen === 'progress' && (
        <ProgressPage 
          onBack={goBackToLanding}
        />
      )}
      {currentScreen === 'reading' && (
        <ReadingExercise onBack={goBackToLanding} />
      )}
      {currentScreen === 'writing' && (
        <WritingExercise onBack={goBackToLanding} />
      )}
      {currentScreen === 'speaking' && (
        <SpeakingExercise onBack={goBackToLanding} />
      )}
      {currentScreen === 'listening' && (
        <ListeningExercise onBack={goBackToLanding} />
      )}
    </div>
  );
}

export default App;