// src/App.js
import React, { useState } from 'react';
import './App.css';
import SplashPage from './components/SplashPage';
import LandingPage from './components/LandingPage';
import Quiz from './components/Quiz';
import Results from './components/Results';

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

  const startQuiz = (type) => {
    setQuizType(type);
    setCurrentScreen('quiz');
  };

  const showResults = (userAnswers) => {
    setQuizResults(userAnswers);
    setCurrentScreen('results');
  };

  const restartQuiz = () => {
    setQuizResults(null);
    setCurrentScreen('splash');
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
          isTransitioning={isTransitioning}
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
    </div>
  );
}

export default App;