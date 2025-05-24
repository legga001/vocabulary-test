import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import Quiz from './components/Quiz';
import Results from './components/Results';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [quizResults, setQuizResults] = useState(null);

  const startQuiz = () => {
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
      {currentScreen === 'quiz' && <Quiz onFinish={showResults} />}
      {currentScreen === 'results' && <Results onRestart={restartQuiz} userAnswers={quizResults} />}
    </div>
  );
}

export default App;