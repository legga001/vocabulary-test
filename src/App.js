// src/App.js
import React, { useState } from 'react';
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

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [quizResults, setQuizResults] = useState(null);
  const [quizType, setQuizType] = useState('static');
  const [isTransitioning, setIsTransitioning] = useState(false);

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
          isTransitioning={isTransitioning}
        />
      )}
      {currentScreen === 'exercises' && (
        <ExerciseSelection 
          onSelectExercise={selectExercise}
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