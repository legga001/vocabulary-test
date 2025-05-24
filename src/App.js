// src/App.js
import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import Quiz from './components/Quiz';
import Results from './components/Results';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [quizResults, setQuizResults] = useState(null);
  const [quizType, setQuizType] = useState('static'); // 'static' or 'article'

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
    setCurrentScreen('landing');
  };

  return (
    <div className="App">
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