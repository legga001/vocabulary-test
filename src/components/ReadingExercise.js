// src/components/ReadingExercise.js - Working Version with Quiz Interface
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ClickableLogo from './ClickableLogo';

// Import all the working modules (we know these work from debug testing)
import { getReadingVocabularyQuestions, getReadingArticleInfo } from '../readingVocabularyData';
import { getAirIndiaVocabularyQuestions, getAirIndiaArticleInfo } from '../airIndiaVocabularyData';
import { getWaterTreatmentVocabularyQuestions, getWaterTreatmentArticleInfo } from '../waterTreatmentVocabularyData';
import { getKillerWhaleVocabularyQuestions, getKillerWhaleArticleInfo } from '../killerWhaleVocabularyData';
import { getArticleQuestions, getArticleInfo } from '../articleQuestions';
import { getNewQuestions, correctMessages } from '../questionsData';
import { recordTestResult } from '../utils/progressDataManager';

// Import components with fallbacks
let AnswerReview, ArticleSelection, RealFakeWordsExercise, LetterInput;
try {
  AnswerReview = require('./AnswerReview').default;
  ArticleSelection = require('./ArticleSelection').default;
  RealFakeWordsExercise = require('./RealFakeWordsExercise').default;
  LetterInput = require('./LetterInput').default;
} catch (error) {
  console.warn('Some components failed to import, using fallbacks');
  AnswerReview = ({ questions, userAnswers }) => (
    <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
      <h3>Your Answers:</h3>
      {questions.slice(0, 10).map((q, i) => (
        <div key={i} style={{ marginBottom: '8px' }}>
          <strong>Q{i+1}:</strong> {userAnswers[i] || '(no answer)'} 
          {userAnswers[i] === q.answer ? ' ✅' : ` ❌ (correct: ${q.answer})`}
        </div>
      ))}
    </div>
  );
  ArticleSelection = ({ onBack, onSelectArticle }) => (
    <div className="exercise-page">
      <div className="quiz-container">
        <h1>📰 Article Selection</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '20px auto' }}>
          <button className="btn btn-primary" onClick={() => onSelectArticle('killer-whale-quiz')}>
            🐋 Killer Whale Article
          </button>
          <button className="btn btn-primary" onClick={() => onSelectArticle('octopus-quiz')}>
            🐙 Octopus Article
          </button>
          <button className="btn btn-primary" onClick={() => onSelectArticle('smuggling-quiz')}>
            🚢 Smuggling Article
          </button>
          <button className="btn btn-primary" onClick={() => onSelectArticle('air-india-quiz')}>
            ✈️ Air India Article
          </button>
          <button className="btn btn-primary" onClick={() => onSelectArticle('water-treatment-quiz')}>
            💧 Water Treatment Article
          </button>
          <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        </div>
      </div>
    </div>
  );
  RealFakeWordsExercise = ({ onBack }) => (
    <div className="exercise-page">
      <div className="quiz-container">
        <h1>🎯 Real or Fake Words</h1>
        <p>This exercise is loading...</p>
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
  LetterInput = ({ value, onChange, disabled, placeholder }) => (
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      style={{ 
        padding: '8px 12px', 
        border: '2px solid #ddd', 
        borderRadius: '6px',
        fontSize: '1.1em',
        minWidth: '200px'
      }}
    />
  );
}

// Quiz helpers with fallbacks
let processSentence, extractVisibleLetters;
try {
  const helpers = require('../utils/quizHelpers');
  processSentence = helpers.processSentence;
  extractVisibleLetters = helpers.extractVisibleLetters;
} catch (error) {
  processSentence = (sentence, answer) => {
    const parts = sentence.split('_______');
    return {
      beforeBlank: parts[0] || sentence,
      afterBlank: parts[1] || ''
    };
  };
  extractVisibleLetters = (text) => text.length;
}

const TOTAL_QUESTIONS = 10;
const QUIZ_TYPES = ['killer-whale-quiz', 'octopus-quiz', 'smuggling-quiz', 'air-india-quiz', 'water-treatment-quiz', 'standard-quiz'];

function ReadingExercise({ onBack, onLogoClick, initialView = 'selection' }) {
  console.log('🚀 ReadingExercise starting with view:', initialView);
  
  // Core state
  const [currentView, setCurrentView] = useState(initialView);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(TOTAL_QUESTIONS).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(TOTAL_QUESTIONS).fill(false));
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [showResults, setShowResults] = useState(false);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);

  // Load questions when view changes
  useEffect(() => {
    console.log('📚 Loading questions for view:', currentView);
    
    if (!QUIZ_TYPES.includes(currentView)) {
      console.log('❌ Not a quiz view, skipping question loading');
      return;
    }

    let newQuestions = [];
    try {
      switch (currentView) {
        case 'killer-whale-quiz':
          newQuestions = getKillerWhaleVocabularyQuestions();
          break;
        case 'octopus-quiz':
          newQuestions = getReadingVocabularyQuestions();
          break;
        case 'smuggling-quiz':
          newQuestions = getArticleQuestions();
          break;
        case 'air-india-quiz':
          newQuestions = getAirIndiaVocabularyQuestions();
          break;
        case 'water-treatment-quiz':
          newQuestions = getWaterTreatmentVocabularyQuestions();
          break;
        case 'standard-quiz':
          newQuestions = getNewQuestions();
          break;
      }
      console.log(`✅ Loaded ${newQuestions.length} questions for ${currentView}`);
    } catch (error) {
      console.error('❌ Error loading questions:', error);
      newQuestions = [];
    }

    setQuestions(newQuestions);
    setCurrentQuestion(0);
    setUserAnswers(new Array(TOTAL_QUESTIONS).fill(''));
    setCheckedQuestions(new Array(TOTAL_QUESTIONS).fill(false));
    setFeedback({ show: false, type: '', message: '' });
    setShowResults(false);
    setExerciseStartTime(Date.now());
  }, [currentView]);

  // Navigation functions
  const goBack = useCallback(() => {
    console.log('🔙 Going back...');
    if (onBack) {
      onBack();
    } else {
      setCurrentView('selection');
    }
  }, [onBack]);

  const goToArticleSelection = useCallback(() => {
    setCurrentView('article-selection');
  }, []);

  const startStandardQuiz = useCallback(() => {
    setCurrentView('standard-quiz');
  }, []);

  const startArticleQuiz = useCallback((articleType) => {
    console.log('🎮 Starting article quiz:', articleType);
    setCurrentView(articleType);
  }, []);

  // Quiz functions
  const checkAnswer = useCallback(() => {
    const userAnswer = userAnswers[currentQuestion];
    const correctAnswer = questions[currentQuestion]?.answer;
    
    if (!userAnswer || !correctAnswer) return;

    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase();
    
    const newChecked = [...checkedQuestions];
    newChecked[currentQuestion] = true;
    setCheckedQuestions(newChecked);

    if (isCorrect) {
      setFeedback({ show: true, type: 'correct', message: 'Correct! Well done!' });
    } else {
      setFeedback({ show: true, type: 'incorrect', message: `The correct answer is "${correctAnswer}".` });
    }
  }, [userAnswers, currentQuestion, questions, checkedQuestions]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback({ show: false, type: '', message: '' });
    } else {
      setShowResults(true);
    }
  }, [currentQuestion]);

  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  }, [currentQuestion]);

  const handleInputChange = useCallback((value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
    
    if (feedback.show) {
      setFeedback({ show: false, type: '', message: '' });
    }
  }, [userAnswers, currentQuestion, feedback.show]);

  // Get article info
  const getArticleInfo = useCallback(() => {
    try {
      switch (currentView) {
        case 'killer-whale-quiz': return getKillerWhaleArticleInfo();
        case 'octopus-quiz': return getReadingArticleInfo();
        case 'smuggling-quiz': return getArticleInfo();
        case 'air-india-quiz': return getAirIndiaArticleInfo();
        case 'water-treatment-quiz': return getWaterTreatmentArticleInfo();
        default: return null;
      }
    } catch (error) {
      console.error('Error getting article info:', error);
      return null;
    }
  }, [currentView]);

  const articleInfo = getArticleInfo();

  console.log('🎯 Rendering view:', currentView, 'Questions:', questions.length);

  // Real/Fake Words exercise
  if (currentView === 'real-fake-words') {
    return <RealFakeWordsExercise onBack={goBack} onLogoClick={onLogoClick} />;
  }

  // Article Selection
  if (currentView === 'article-selection') {
    return (
      <ArticleSelection 
        onBack={goBack}
        onLogoClick={onLogoClick}
        onSelectArticle={startArticleQuiz}
      />
    );
  }

  // Results page
  if (showResults) {
    const score = userAnswers.slice(0, TOTAL_QUESTIONS).reduce((total, answer, index) => {
      return answer && questions[index] && answer.toLowerCase().trim() === questions[index].answer.toLowerCase() 
        ? total + 1 : total;
    }, 0);

    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎉 Quiz Complete!</h1>
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4c51bf' }}>
              {score}/{TOTAL_QUESTIONS}
            </div>
            <div style={{ fontSize: '1.2em', color: '#666' }}>
              ({Math.round((score / TOTAL_QUESTIONS) * 100)}%)
            </div>
          </div>
          
          <AnswerReview questions={questions} userAnswers={userAnswers} />
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={goBack} style={{ marginRight: '10px' }}>
              Try Another Test
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface for all quiz types
  if (QUIZ_TYPES.includes(currentView)) {
    if (questions.length === 0) {
      return (
        <div className="exercise-page">
          <ClickableLogo onLogoClick={onLogoClick} />
          <div className="quiz-container">
            <h1>📚 Loading Quiz...</h1>
            <p>Loading {currentView.replace('-', ' ')}...</p>
            <button className="btn btn-secondary" onClick={goBack}>← Back</button>
          </div>
        </div>
      );
    }

    const currentQuestionData = questions[currentQuestion];
    if (!currentQuestionData) {
      return (
        <div className="exercise-page">
          <ClickableLogo onLogoClick={onLogoClick} />
          <div className="quiz-container">
            <h1>❌ Question Error</h1>
            <p>Could not load question {currentQuestion + 1}</p>
            <button className="btn btn-secondary" onClick={goBack}>← Back</button>
          </div>
        </div>
      );
    }

    const processedData = processSentence(currentQuestionData.sentence, currentQuestionData.answer);
    const progress = ((currentQuestion + 1) / TOTAL_QUESTIONS) * 100;

    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        
        {articleInfo && (
          <div className="article-link-header">
            <button 
              className="btn btn-article-link"
              onClick={() => window.open(articleInfo.url, '_blank')}
            >
              📖 Read Original Article
            </button>
            <div className="article-title-small">"{articleInfo.title}"</div>
          </div>
        )}

        <div className="quiz-container">
          <div className="quiz-header">
            <div className="quiz-type-badge">
              📖 {articleInfo ? `Article: ${articleInfo.title}` : 'Standard Vocabulary Test'}
            </div>
            
            <div className="progress-section">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="question-counter">
                Question {currentQuestion + 1} of {TOTAL_QUESTIONS}
              </div>
            </div>
          </div>

          <div className="question-section">
            <div className="sentence-container">
              <div className="sentence-display" style={{ fontSize: '1.2em', lineHeight: '1.6', margin: '20px 0' }}>
                {processedData.beforeBlank}
                <LetterInput 
                  value={userAnswers[currentQuestion]}
                  onChange={handleInputChange}
                  disabled={checkedQuestions[currentQuestion]}
                  placeholder="Type your answer..."
                />
                {processedData.afterBlank}
              </div>
            </div>

            <div className="hint-section">
              <div className="hint" style={{ background: '#f0f8ff', padding: '10px', borderRadius: '8px', margin: '15px 0' }}>
                💡 <strong>Hint:</strong> {currentQuestionData.hint}
              </div>
            </div>

            {feedback.show && (
              <div className={`feedback ${feedback.type}`} style={{ 
                padding: '10px', 
                borderRadius: '8px', 
                margin: '15px 0',
                background: feedback.type === 'correct' ? '#e8f5e8' : '#ffebee',
                color: feedback.type === 'correct' ? '#2e7d32' : '#c62828'
              }}>
                {feedback.message}
              </div>
            )}
          </div>

          <div className="controls-section" style={{ textAlign: 'center', margin: '20px 0' }}>
            <button 
              className="btn btn-primary" 
              onClick={checkedQuestions[currentQuestion] ? nextQuestion : checkAnswer}
              disabled={!userAnswers[currentQuestion] && !checkedQuestions[currentQuestion]}
              style={{ fontSize: '1.1em', padding: '12px 24px' }}
            >
              {checkedQuestions[currentQuestion] ? (currentQuestion === TOTAL_QUESTIONS - 1 ? 'Finish' : 'Next') : 'Check Answer'}
            </button>
            
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary btn-small" 
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>
              <button 
                className="btn btn-secondary btn-small" 
                onClick={nextQuestion}
                disabled={!checkedQuestions[currentQuestion]}
              >
                {currentQuestion === TOTAL_QUESTIONS - 1 ? 'Finish' : 'Next'} →
              </button>
            </div>
          </div>

          <div className="quiz-footer" style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <button className="btn btn-secondary btn-small" onClick={goBack}>
              ← Back to {articleInfo ? 'Article Selection' : 'Menu'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main selection view
  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <h1>📖 Reading Exercises</h1>
      
      <div className="welcome-text">
        <p>Choose your reading exercise type:</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', margin: '30px auto' }}>
        <div className="reading-main-card" onClick={startStandardQuiz} style={{ cursor: 'pointer', padding: '20px', border: '2px solid #ddd', borderRadius: '15px' }}>
          <div style={{ fontSize: '2em', marginBottom: '10px' }}>📚</div>
          <h3>Standard Vocabulary</h3>
          <p>Random selection from 100+ exercises across CEFR levels (A2-C1)</p>
        </div>

        <div className="reading-main-card" onClick={goToArticleSelection} style={{ cursor: 'pointer', padding: '20px', border: '2px solid #ddd', borderRadius: '15px' }}>
          <div style={{ fontSize: '2em', marginBottom: '10px' }}>📰</div>
          <h3>Article-Based Vocabulary</h3>
          <p>Vocabulary from current BBC news articles</p>
        </div>
      </div>

      <button className="btn btn-secondary" onClick={goBack} style={{ marginTop: '20px' }}>
        ← Back to Exercise Selection
      </button>
    </div>
  );
}

export default ReadingExercise;
