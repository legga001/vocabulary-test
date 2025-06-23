// src/components/Quiz.js - Complete rewrite with fixed answer checking logic
import React, { useState, useEffect, useCallback } from 'react';
import { getNewQuestions, correctMessages } from '../questionsData';
import LetterInput from './LetterInput';
import { processSentence } from '../utils/quizHelpers';

// Key for localStorage
const QUIZ_STATE_KEY = 'mrFoxEnglishQuizState';

// British vs American spelling variations
const SPELLING_VARIATIONS = {
  // American to British
  'analyze': ['analyse'], 'realize': ['realise'], 'organize': ['organise'],
  'recognize': ['recognise'], 'criticize': ['criticise'], 'apologize': ['apologise'],
  'optimize': ['optimise'], 'minimize': ['minimise'], 'maximize': ['maximise'],
  'centralize': ['centralise'], 'normalize': ['normalise'], 'categorize': ['categorise'],
  'memorize': ['memorise'], 'authorize': ['authorise'], 'modernize': ['modernise'],
  'utilize': ['utilise'], 'fertilize': ['fertilise'], 'sterilize': ['sterilise'],
  'stabilize': ['stabilise'], 'summarize': ['summarise'],
  // British to American
  'analyse': ['analyze'], 'realise': ['realize'], 'organise': ['organize'],
  'recognise': ['recognize'], 'criticise': ['criticize'], 'apologise': ['apologize'],
  'optimise': ['optimize'], 'minimise': ['minimize'], 'maximise': ['maximize'],
  'centralise': ['centralize'], 'normalise': ['normalize'], 'categorise': ['categorize'],
  'memorise': ['memorize'], 'authorise': ['authorize'], 'modernise': ['modernize'],
  'utilise': ['utilize'], 'fertilise': ['fertilize'], 'sterilise': ['sterilize'],
  'stabilise': ['stabilize'], 'summarise': ['summarize'],
  // Color/colour variations
  'color': ['colour'], 'colour': ['color'], 'colors': ['colours'], 'colours': ['colors'],
  'colored': ['coloured'], 'coloured': ['colored'], 'coloring': ['colouring'], 'colouring': ['coloring'],
  // Honor/honour variations
  'honor': ['honour'], 'honour': ['honor'], 'honors': ['honours'], 'honours': ['honors'],
  'honored': ['honoured'], 'honoured': ['honored'], 'honoring': ['honouring'], 'honouring': ['honoring'],
  // Center/centre variations
  'center': ['centre'], 'centre': ['center'], 'centers': ['centres'], 'centres': ['centers'],
  'centered': ['centred'], 'centred': ['centered'], 'centering': ['centring'], 'centring': ['centering'],
  // Theater/theatre variations
  'theater': ['theatre'], 'theatre': ['theater'], 'theaters': ['theatres'], 'theatres': ['theaters'],
  // Meter/metre variations
  'meter': ['metre'], 'metre': ['meter'], 'meters': ['metres'], 'metres': ['meters']
};

// Helper function to get alternative spellings
const getAlternativeSpellings = (word) => {
  const normalizedWord = word.toLowerCase();
  return SPELLING_VARIATIONS[normalizedWord] || [];
};

// Helper function to determine how many letters to show
const getLettersToShow = (word) => {
  const length = word.length;
  if (length <= 3) return 1;
  if (length <= 5) return 2;
  if (length <= 7) return 3;
  if (length <= 9) return 4;
  if (length <= 11) return 5;
  return 6;
};

function Quiz({ onFinish, quizType, articleType, onBack }) {
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(10).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(10).fill(false));
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [questions, setQuestions] = useState([]);

  // Memoized function to get article info
  const getArticleInfo = useCallback(() => {
    if (quizType !== 'article' || !articleType) return null;
    
    try {
      switch (articleType) {
        case 'killer-whale-quiz': {
          const module = require('../killerWhaleVocabularyData');
          return module.getKillerWhaleArticleInfo();
        }
        case 'octopus-quiz': {
          const module = require('../readingVocabularyData');
          return module.getReadingArticleInfo();
        }
        case 'smuggling-quiz': {
          const module = require('../articleQuestions');
          return module.getArticleInfo();
        }
        case 'air-india-quiz': {
          const module = require('../airIndiaVocabularyData');
          return module.getAirIndiaArticleInfo();
        }
        case 'water-treatment-quiz': {
          const module = require('../waterTreatmentVocabularyData');
          return module.getWaterTreatmentArticleInfo();
        }
        default:
          console.warn('Unknown article type:', articleType);
          return null;
      }
    } catch (error) {
      console.error('Error loading article info for', articleType, ':', error);
      return null;
    }
  }, [quizType, articleType]);

  // Memoized function to load questions
  const loadQuestions = useCallback(() => {
    if (quizType === 'article' && articleType) {
      try {
        switch (articleType) {
          case 'killer-whale-quiz': {
            const module = require('../killerWhaleVocabularyData');
            return module.getKillerWhaleVocabularyQuestions();
          }
          case 'octopus-quiz': {
            const module = require('../readingVocabularyData');
            return module.getReadingVocabularyQuestions();
          }
          case 'smuggling-quiz': {
            const module = require('../articleQuestions');
            return module.getArticleQuestions();
          }
          case 'air-india-quiz': {
            const module = require('../airIndiaVocabularyData');
            return module.getAirIndiaVocabularyQuestions();
          }
          case 'water-treatment-quiz': {
            const module = require('../waterTreatmentVocabularyData');
            return module.getWaterTreatmentVocabularyQuestions();
          }
          default:
            console.warn('Unknown article type, using smuggling questions:', articleType);
            const fallback = require('../articleQuestions');
            return fallback.getArticleQuestions();
        }
      } catch (error) {
        console.error('Error loading article questions for', articleType, ':', error);
        // Fallback to smuggling questions
        const fallback = require('../articleQuestions');
        return fallback.getArticleQuestions();
      }
    } else {
      // Standard vocabulary quiz
      return getNewQuestions();
    }
  }, [quizType, articleType]);

  // Load questions when component mounts or quiz type changes
  useEffect(() => {
    const newQuestions = loadQuestions();
    setQuestions(newQuestions);
    
    // Reset quiz state
    setCurrentQuestion(0);
    setUserAnswers(new Array(10).fill(''));
    setCheckedQuestions(new Array(10).fill(false));
    setFeedback({ show: false, type: '', message: '' });
  }, [loadQuestions]);

  // Current question and progress
  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / 10) * 100;
  const processedData = question ? processSentence(question.sentence, question.answer) : null;
  const articleInfo = getArticleInfo();

  // Enter key listener for checking answers
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && 
          userAnswers[currentQuestion] && 
          !checkedQuestions[currentQuestion] && 
          question) {
        checkAnswer();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [userAnswers, currentQuestion, checkedQuestions, question]);

  // Load saved quiz state
  useEffect(() => {
    const savedQuizState = localStorage.getItem(QUIZ_STATE_KEY);
    if (!savedQuizState) return;

    try {
      const parsedState = JSON.parse(savedQuizState);
      const thirtyMinutes = 30 * 60 * 1000;
      const now = Date.now();
      
      // Only restore recent state for same quiz type
      if (parsedState.quizType === quizType && 
          parsedState.articleType === articleType &&
          parsedState.timestamp && 
          (now - parsedState.timestamp) < thirtyMinutes &&
          parsedState.questions && 
          parsedState.questions.length === 10) {
        
        setQuestions(parsedState.questions);
        setCurrentQuestion(parsedState.currentQuestion || 0);
        setUserAnswers(parsedState.userAnswers || new Array(10).fill(''));
        setCheckedQuestions(parsedState.checkedQuestions || new Array(10).fill(false));
        console.log('Restored quiz progress from localStorage');
      } else {
        // Clear old state
        localStorage.removeItem(QUIZ_STATE_KEY);
      }
    } catch (error) {
      console.error('Error loading saved quiz state:', error);
      localStorage.removeItem(QUIZ_STATE_KEY);
    }
  }, [quizType, articleType]);

  // Save quiz state
  useEffect(() => {
    if (questions.length === 0) return;

    const stateToSave = {
      quizType,
      articleType,
      currentQuestion,
      userAnswers,
      checkedQuestions,
      questions,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving quiz state:', error);
    }
  }, [currentQuestion, userAnswers, checkedQuestions, quizType, articleType, questions]);

  // Check answer function with fixed logic
  const checkAnswer = () => {
    if (!question) return;

    const lettersToShow = getLettersToShow(question.answer);
    const preFilledLetters = question.answer.substring(0, lettersToShow).toLowerCase();
    const userTypedLetters = userAnswers[currentQuestion].toLowerCase().trim();
    
    // Combine pre-filled and user letters to form complete word
    const completeUserAnswer = preFilledLetters + userTypedLetters;
    const correctAnswer = question.answer.toLowerCase();
    
    console.log('🔍 CHECKING COMPLETE ANSWER:', {
      correctAnswer,
      preFilledLetters,
      userTypedLetters,
      completeUserAnswer,
      isMatch: completeUserAnswer === correctAnswer
    });
    
    // Check for exact match or spelling variations
    const alternativeAnswers = getAlternativeSpellings(question.answer);
    const isCorrect = completeUserAnswer === correctAnswer || 
                     alternativeAnswers.includes(completeUserAnswer);

    if (isCorrect) {
      const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      setFeedback({ show: true, type: 'correct', message: randomMessage });
      
      // Mark question as checked
      const newChecked = [...checkedQuestions];
      newChecked[currentQuestion] = true;
      setCheckedQuestions(newChecked);
    } else {
      const hintText = question.hint || "Try to think about the context of the sentence.";
      const feedbackMessage = `💡 Hint: ${hintText}`;
      setFeedback({ show: true, type: 'incorrect', message: feedbackMessage });
    }
  };

  // Update user answer
  const updateAnswer = (value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
    
    // Clear feedback when user starts typing
    if (feedback.show) {
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  // Navigation functions
  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion === 9) {
      // Clear quiz state and finish
      localStorage.removeItem(QUIZ_STATE_KEY);
      onFinish(userAnswers, questions);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  // Handle article link click
  const openArticle = () => {
    if (articleInfo && articleInfo.url) {
      window.open(articleInfo.url, '_blank');
    }
  };

  // Loading state
  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="quiz-type-badge">
            {quizType === 'article' ? '📰 Article-Based' : '📚 Standard'} Test
          </div>
        </div>
        <div className="loading-state">
          <p>🎲 Generating your vocabulary test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* Article Link Header */}
      {quizType === 'article' && articleInfo && (
        <div className="article-link-header">
          <button 
            className="btn-article-link"
            onClick={openArticle}
            title="Read the original article"
          >
            📖 Read Original Article
          </button>
          <div className="article-title-small">
            {articleInfo.title}
          </div>
        </div>
      )}

      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="quiz-type-badge">
          {quizType === 'article' ? '📰 Article-Based' : '📚 Standard'} Test
        </div>
        {onBack && (
          <button 
            className="btn btn-secondary close-btn"
            onClick={onBack}
            title="Back to menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{width: `${progress}%`}}></div>
        </div>
        <div className="progress-text">Question {currentQuestion + 1} of 10</div>
      </div>

      {/* Question Header */}
      <div className="question-header">
        <div className="question-number">Question {currentQuestion + 1}</div>
        <div className="level-badge">{question.level}</div>
      </div>

      {/* Question Section */}
      <div className="question-section">
        <div className="question-text">
          <span>{processedData.beforeGap}</span>
          <LetterInput
            word={question.answer}
            value={userAnswers[currentQuestion]}
            onChange={updateAnswer}
            disabled={checkedQuestions[currentQuestion]}
            className={feedback.show ? feedback.type : ''}
            onEnterPress={!checkedQuestions[currentQuestion] && userAnswers[currentQuestion] ? checkAnswer : null}
          />
          <span>{processedData.afterGap}</span>
        </div>

        {/* Context for article-based questions */}
        {quizType === 'article' && question.context && (
          <div className="question-context">
            <small>📖 {question.context}</small>
          </div>
        )}

        {/* Word length hint */}
        <div className="word-hint">
          Complete the word ({question.answer.length} letters total)
        </div>
      </div>

      {/* Feedback - Enhanced with debugging */}
      {feedback.show && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* DEBUG: Always show feedback state for testing */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          background: '#fff3cd',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '5px',
          fontSize: '0.8em',
          fontFamily: 'monospace'
        }}>
          <strong>🐛 Feedback Debug:</strong><br />
          Show: {feedback.show ? 'YES' : 'NO'}<br />
          Type: "{feedback.type}"<br />
          Message: "{feedback.message}"<br />
          Current Answer: "{userAnswers[currentQuestion]}"<br />
          Question Checked: {checkedQuestions[currentQuestion] ? 'YES' : 'NO'}
        </div>
      )}

      {/* Navigation */}
      <div className="navigation">
        <button 
          className="nav-btn" 
          onClick={previousQuestion} 
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {!checkedQuestions[currentQuestion] && userAnswers[currentQuestion] && (
            <button className="nav-btn" onClick={checkAnswer}>
              Check Answer
            </button>
          )}
          
          <button 
            className="nav-btn" 
            onClick={nextQuestion}
          >
            {currentQuestion === 9 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="quiz-footer">
        <p>Press Enter to check your answer, or use the buttons below.</p>
      </div>
    </div>
  );
}

export default Quiz;
