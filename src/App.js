// src/App.js - COMPLETE FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Import all components
import SplashPage from './components/SplashPage';
import LandingPage from './components/LandingPage';
import ProgressPage from './components/ProgressPage';
import StudyMenu from './components/StudyMenu';
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

const PRACTICE_ENTRY = 'mrFoxPracticeEntry';

function App() {
  // Core state management
  const [currentScreen, setCurrentScreen] = useState(() => {
    const directScreens = { '#exercises': 'landing', '#study': 'study' };
    return directScreens[window.location.hash] || 'splash';
  });
  const [returnScreen, setReturnScreen] = useState('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [answerChecks, setAnswerChecks] = useState(null);
  const [testQuestions, setTestQuestions] = useState(null);
  const [selectedArticleType, setSelectedArticleType] = useState(null);

  // Transition effect for smooth navigation
  useEffect(() => {
    if (currentScreen === 'splash') {
      setIsTransitioning(false);
      return;
    }
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [currentScreen]);

  const showStart = useCallback(() => {
    setCurrentScreen('splash');
    setSelectedArticleType(null);
    setQuizResults(null);
    setAnswerChecks(null);
    setTestQuestions(null);
  }, []);

  useEffect(() => {
    const onPopState = (event) => {
      if (event.state?.[PRACTICE_ENTRY]) {
        setCurrentScreen('study');
      } else {
        showStart();
      }
    };
    // A static grammar page can return to this app from the browser's page cache.
    const onPageShow = (event) => {
      if (event.persisted) showStart();
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [showStart]);

  function goToScreen(screen) {
    const { history, location } = window;
    if (!history.state?.[PRACTICE_ENTRY]) {
      const startUrl = location.pathname + location.search;
      if (location.hash === '#exercises' || location.hash === '#study') {
        history.replaceState(history.state, '', startUrl);
      }
      // Keep one Back entry for the start screen across this in-app session.
      history.pushState({ ...history.state, [PRACTICE_ENTRY]: true }, '', startUrl);
    }
    setCurrentScreen(screen);
  }

  // Navigation functions
  const goToStudy = () => goToScreen('study');
  const goToLanding = () => goToScreen('landing');

  const goToProgress = (source) => {
    setReturnScreen(source);
    goToScreen('progress');
  };

  const goBack = () => {
    goToScreen(returnScreen);
    setQuizResults(null);
    setTestQuestions(null);
    setSelectedArticleType(null);
  };

  const handleLogoClick = () => {
    if (window.history.state?.[PRACTICE_ENTRY]) {
      window.history.back();
      return;
    }
    if (['#exercises', '#study'].includes(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    showStart();
  };

  // Quiz completion handler
  const handleQuizFinish = (userAnswers, questions, checks) => {
    setAnswerChecks(checks);
    setQuizResults(userAnswers);
    setTestQuestions(questions);
    goToScreen('results');
  };

  // Results completion handler
  const handleResultsFinish = () => {
    goBack();
  };

  // Main exercise selection handler - DIRECT NAVIGATION
  const handleSelectExercise = (exerciseType, source = 'landing') => {
    setReturnScreen(source);
    switch(exerciseType) {
      // DIRECT quiz navigation - no intermediate steps
      case 'standard-vocabulary':
        goToScreen('standard-vocabulary-quiz');
        break;
      case 'article-vocabulary':
        goToScreen('article-selection');
        break;
      case 'real-fake-words':
        goToScreen('real-fake-words');
        break;
      case 'listen-and-type':
        goToScreen('listen-and-type');
        break;
      case 'speak-and-record':
        goToScreen('speak-and-record');
        break;
      // Writing exercise navigation
      case 'writing':
        goToScreen('writing');
        break;
      // Read and Complete exercise navigation
      case 'read-and-complete':
        goToScreen('read-and-complete');
        break;
      // NEW: Interactive Reading exercise navigation
      case 'interactive-reading':
        goToScreen('interactive-reading');
        break;
      // Traditional navigation (for non-active exercises)
      case 'speaking':
        goToScreen('speaking');
        break;
      case 'listening':
        goToScreen('listening');
        break;
      default:
        console.warn('Unknown exercise type:', exerciseType);
    }
  };

  // Article selection handler - DIRECT to article quiz with type tracking
  const handleArticleSelect = (articleType) => {
    setSelectedArticleType(articleType);
    goToScreen('article-vocabulary-quiz');
  };

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashPage onStartPracticing={goToStudy} isTransitioning={isTransitioning} />;

      case 'study':
        return (
          <StudyMenu
            onHome={handleLogoClick}
            onExercises={goToLanding}
            onTests={() => goToScreen('tests')}
            onProgress={() => goToProgress('study')}
          />
        );

      case 'tests':
        return (
          <StudyMenu
            tests
            onHome={handleLogoClick}
            onBack={goToStudy}
            onSelectTest={(type) => handleSelectExercise(type, 'tests')}
          />
        );

      case 'landing':
        return (
          <LandingPage
            onSelectExercise={handleSelectExercise}
            onProgress={() => goToProgress('landing')}
            onStudyMenu={goToStudy}
            onLogoClick={handleLogoClick}
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
            quizType={selectedArticleType ? 'article' : 'standard'}
            answerChecks={answerChecks}
            onLogoClick={handleLogoClick}
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

  const screenClass = { splash: 'splash-mode', landing: 'landing-mode' }[currentScreen] || '';

  return (
    <div className={`App ${screenClass}`}>
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
