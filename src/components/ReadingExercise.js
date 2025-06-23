// src/components/ReadingExercise.js - Emergency Debug Version
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ClickableLogo from './ClickableLogo';

// Safe imports with error handling
let getReadingVocabularyQuestions, getReadingArticleInfo;
let getAirIndiaVocabularyQuestions, getAirIndiaArticleInfo;
let getWaterTreatmentVocabularyQuestions, getWaterTreatmentArticleInfo;
let getKillerWhaleVocabularyQuestions, getKillerWhaleArticleInfo;
let getArticleQuestions, getArticleInfo;
let getNewQuestions, correctMessages;
let recordTestResult;
let AnswerReview, ArticleSelection, RealFakeWordsExercise, LetterInput;
let processSentence, extractVisibleLetters;

// Import everything safely
try {
  console.log('🔄 Importing reading vocabulary data...');
  const readingModule = require('../readingVocabularyData');
  getReadingVocabularyQuestions = readingModule.getReadingVocabularyQuestions;
  getReadingArticleInfo = readingModule.getReadingArticleInfo;
  console.log('✅ Reading vocabulary data imported');
} catch (error) {
  console.error('❌ Failed to import reading vocabulary data:', error);
  getReadingVocabularyQuestions = () => [];
  getReadingArticleInfo = () => ({ title: 'Octopus Article', url: '#' });
}

try {
  console.log('🔄 Importing air india data...');
  const airIndiaModule = require('../airIndiaVocabularyData');
  getAirIndiaVocabularyQuestions = airIndiaModule.getAirIndiaVocabularyQuestions;
  getAirIndiaArticleInfo = airIndiaModule.getAirIndiaArticleInfo;
  console.log('✅ Air India data imported');
} catch (error) {
  console.error('❌ Failed to import air india data:', error);
  getAirIndiaVocabularyQuestions = () => [];
  getAirIndiaArticleInfo = () => ({ title: 'Air India Article', url: '#' });
}

try {
  console.log('🔄 Importing water treatment data...');
  const waterModule = require('../waterTreatmentVocabularyData');
  getWaterTreatmentVocabularyQuestions = waterModule.getWaterTreatmentVocabularyQuestions;
  getWaterTreatmentArticleInfo = waterModule.getWaterTreatmentArticleInfo;
  console.log('✅ Water treatment data imported');
} catch (error) {
  console.error('❌ Failed to import water treatment data:', error);
  getWaterTreatmentVocabularyQuestions = () => [];
  getWaterTreatmentArticleInfo = () => ({ title: 'Water Treatment Article', url: '#' });
}

try {
  console.log('🔄 Importing killer whale data...');
  const killerWhaleModule = require('../killerWhaleVocabularyData');
  getKillerWhaleVocabularyQuestions = killerWhaleModule.getKillerWhaleVocabularyQuestions;
  getKillerWhaleArticleInfo = killerWhaleModule.getKillerWhaleArticleInfo;
  console.log('✅ Killer whale data imported');
} catch (error) {
  console.error('❌ Failed to import killer whale data:', error);
  getKillerWhaleVocabularyQuestions = () => [];
  getKillerWhaleArticleInfo = () => ({ title: 'Killer Whale Article', url: '#' });
}

try {
  console.log('🔄 Importing article questions...');
  const articleModule = require('../articleQuestions');
  getArticleQuestions = articleModule.getArticleQuestions;
  getArticleInfo = articleModule.getArticleInfo;
  console.log('✅ Article questions imported');
} catch (error) {
  console.error('❌ Failed to import article questions:', error);
  getArticleQuestions = () => [];
  getArticleInfo = () => ({ title: 'Smuggling Article', url: '#' });
}

try {
  console.log('🔄 Importing questions data...');
  const questionsModule = require('../questionsData');
  getNewQuestions = questionsModule.getNewQuestions;
  correctMessages = questionsModule.correctMessages || ['Good job!', 'Correct!', 'Well done!'];
  console.log('✅ Questions data imported');
} catch (error) {
  console.error('❌ Failed to import questions data:', error);
  getNewQuestions = () => [];
  correctMessages = ['Good job!', 'Correct!', 'Well done!'];
}

try {
  console.log('🔄 Importing progress manager...');
  const progressModule = require('../utils/progressDataManager');
  recordTestResult = progressModule.recordTestResult || (() => {});
  console.log('✅ Progress manager imported');
} catch (error) {
  console.error('❌ Failed to import progress manager:', error);
  recordTestResult = () => {};
}

try {
  console.log('🔄 Importing components...');
  AnswerReview = require('./AnswerReview').default;
  ArticleSelection = require('./ArticleSelection').default;
  RealFakeWordsExercise = require('./RealFakeWordsExercise').default;
  LetterInput = require('./LetterInput').default;
  console.log('✅ Components imported');
} catch (error) {
  console.error('❌ Failed to import components:', error);
  AnswerReview = () => React.createElement('div', null, 'AnswerReview component failed to load');
  ArticleSelection = () => React.createElement('div', null, 'ArticleSelection component failed to load');
  RealFakeWordsExercise = () => React.createElement('div', null, 'RealFakeWordsExercise component failed to load');
  LetterInput = () => React.createElement('input', { type: 'text', placeholder: 'Answer...' });
}

try {
  console.log('🔄 Importing quiz helpers...');
  const helpersModule = require('../utils/quizHelpers');
  processSentence = helpersModule.processSentence || ((sentence, answer) => ({ beforeBlank: sentence, afterBlank: '' }));
  extractVisibleLetters = helpersModule.extractVisibleLetters || ((text) => text.length);
  console.log('✅ Quiz helpers imported');
} catch (error) {
  console.error('❌ Failed to import quiz helpers:', error);
  processSentence = (sentence, answer) => ({ beforeBlank: sentence, afterBlank: '' });
  extractVisibleLetters = (text) => text.length;
}

console.log('✅ All imports completed');

function ReadingExercise({ onBack, onLogoClick, initialView = 'selection' }) {
  console.log('🚀 ReadingExercise component initializing with view:', initialView);
  
  // Simple state - no complex logic yet
  const [currentView, setCurrentView] = useState(initialView);
  const [debugInfo, setDebugInfo] = useState('Component initialized');

  useEffect(() => {
    console.log('📱 ReadingExercise useEffect triggered, currentView:', currentView);
    setDebugInfo(`Current view: ${currentView}`);
  }, [currentView]);

  // Simple navigation
  const goBack = useCallback(() => {
    console.log('🔙 Going back...');
    if (onBack) {
      onBack();
    } else {
      setCurrentView('selection');
    }
  }, [onBack]);

  const goToArticleSelection = useCallback(() => {
    console.log('📰 Going to article selection...');
    setCurrentView('article-selection');
  }, []);

  const startStandardQuiz = useCallback(() => {
    console.log('📚 Starting standard quiz...');
    setCurrentView('standard-quiz');
  }, []);

  console.log('🎯 Rendering ReadingExercise, currentView:', currentView);

  // Emergency fallback render
  try {
    if (currentView === 'article-selection') {
      return (
        <div className="exercise-page">
          <ClickableLogo onLogoClick={onLogoClick} />
          <div className="quiz-container">
            <h1>📰 Article Selection</h1>
            <p>Article selection is loading...</p>
            <button className="btn btn-secondary" onClick={goBack}>
              ← Back
            </button>
          </div>
        </div>
      );
    }

    if (currentView === 'standard-quiz') {
      return (
        <div className="exercise-page">
          <ClickableLogo onLogoClick={onLogoClick} />
          <div className="quiz-container">
            <h1>📚 Standard Quiz</h1>
            <p>Standard quiz is loading...</p>
            <button className="btn btn-secondary" onClick={goBack}>
              ← Back
            </button>
          </div>
        </div>
      );
    }

    // Default selection view
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📖 Reading Exercises (Debug Mode)</h1>
          
          <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>🔧 Debug Information</h3>
            <p><strong>Current View:</strong> {currentView}</p>
            <p><strong>Status:</strong> {debugInfo}</p>
            <p><strong>Imports Status:</strong> All imports attempted</p>
            <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
          </div>
          
          <div className="welcome-text">
            <p>Choose your reading exercise type:</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
            <button 
              className="btn btn-primary" 
              onClick={startStandardQuiz}
              style={{ padding: '15px', fontSize: '1.1em' }}
            >
              📚 Standard Vocabulary Test
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={goToArticleSelection}
              style={{ padding: '15px', fontSize: '1.1em' }}
            >
              📰 Article-Based Vocabulary
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={goBack}
              style={{ padding: '15px', fontSize: '1.1em' }}
            >
              ← Back to Main Menu
            </button>
          </div>
        </div>
      </div>
    );

  } catch (renderError) {
    console.error('💥 RENDER ERROR in ReadingExercise:', renderError);
    
    return (
      <div className="exercise-page">
        <div className="quiz-container">
          <h1>💥 Component Error</h1>
          <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', color: '#c62828' }}>
            <h3>Error Details:</h3>
            <p><strong>Message:</strong> {renderError.message}</p>
            <p><strong>Stack:</strong> {renderError.stack}</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px' }}
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default ReadingExercise;
