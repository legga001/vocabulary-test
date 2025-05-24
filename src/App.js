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

  const goToLanding = () => {
    setCurrentScreen('landing');
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
    setCurrentScreen('splash'); // Go back to splash instead of landing
  };

  return (
    <div className="App">
      {currentScreen === 'splash' && <SplashPage onStartPracticing={goToLanding} />}
      {currentScreen === 'landing' && <LandingPage onStart={startQuiz} />}
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