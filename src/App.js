// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import SplashPage from './components/SplashPage';
import LandingPage from './components/LandingPage';
import ExerciseSelection from './components/ExerciseSelection';
import Quiz from './components/Quiz';
import Results from './components/Results';
import ReadingExercise from './components/ReadingExercise';
import WritingExercise from './components/WritingExercise';
import SpeakingExercise from './components/SpeakingExercise';
import ListeningExercise from './components/ListeningExercise';
import ProgressPage from './components/ProgressPage';

// Key for localStorage
const APP_STATE_KEY = 'mrFoxEnglishAppState';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [quizResults, setQuizResults] = useState(null);
  const [quizType, setQuizType] = useState('static');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load saved state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem(APP_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Only restore if the saved state is recent (within 1 hour)
        const oneHour = 60 * 60 * 1000;
        const now = Date.now();
        
        if (parsedState.timestamp && (now - parsedState.timestamp) < oneHour) {
          setCurrentScreen(parsedState.currentScreen || 'splash');
          setQuizType(parsedState.quizType || 'static');
          setQuizResults(parsedState.quizResults || null);
          console.log('Restored app state from localStorage');
        } else {
          // Clear old state
          localStorage.removeItem(APP_STATE_KEY);
          console.log('Cleared old app state');
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        localStorage.removeItem(APP_STATE_KEY);
      }
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    // Don't save splash or transition states
    if (currentScreen === 'splash' || isTransitioning) return;

    const stateToSave = {
      currentScreen,
      quizType,
      quizResults,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  }, [currentScreen, quizType, quizResults, isTransitioning]);

  const goToLanding = () => {
    setIsTransitioning(true);
    
    // Start transition
    setTimeout(() => {
      setCurrentScreen('landing');
      setIsTransitioning(false);
    }, 400); // Half of animation duration
  };

  const goToExerciseSelection = () => {
    setCurrentScreen('exercises');
  };

  const goToProgress = () => {
    setCurrentScreen('progress');
  };

  const startQuiz = (type) => {
    setQuizType(type);
    setCurrentScreen('quiz');
  };

  const selectExercise = (exerciseType) => {
    setCurrentScreen(exerciseType);
  };

  const showResults = (userAnswers) => {
    setQuizResults(userAnswers);
    setCurrentScreen('results');
  };

  const restartQuiz = () => {
    setQuizResults(null);
    // Clear saved state when restarting
    localStorage.removeItem(APP_STATE_KEY);
    setCurrentScreen('splash');
  };

  const goBackToLanding = () => {
    setCurrentScreen('landing');
  };

  const goBackToExercises = () => {
    setCurrentScreen('exercises');
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
          onStart={startQuiz}
          onExercises={goToExerciseSelection}
          onProgress={goToProgress}
          isTransitioning={isTransitioning}
        />
      )}
      {currentScreen === 'exercises' && (
        <ExerciseSelection 
          onSelectExercise={selectExercise}
          onBack={goBackToLanding}
        />
      )}
      {currentScreen === 'progress' && (
        <ProgressPage 
          onBack={goBackToLanding}
        />
      )}
      {currentScreen === 'quiz' && (
        <Quiz 
          onFinish={showResults} 
          quizType={quizType}
        />
      )}
      {currentScreen === 'results' && (
        <Results 
          onRestart={restartQuiz} 
          userAnswers={quizResults}
          quizType={quizType}
        />
      )}
      {currentScreen === 'reading' && (
        <ReadingExercise onBack={goBackToExercises} />
      )}
      {currentScreen === 'writing' && (
        <WritingExercise onBack={goBackToExercises} />
      )}
      {currentScreen === 'speaking' && (
        <SpeakingExercise onBack={goBackToExercises} />
      )}
      {currentScreen === 'listening' && (
        <ListeningExercise onBack={goBackToExercises} />
      )}
    </div>
  );
}

export default App;