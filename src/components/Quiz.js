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
  console.log('🏗️ Quiz component rendering/re-rendering');
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(10).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(10).fill(false));
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '', persistent: false });
  const [questions, setQuestions] = useState([]);
  
  // Separate state for feedback that won't be affected by other re-renders
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  console.log('🎯 Current feedback state in render:', { showFeedback, feedbackMessage, feedbackType });

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
    
    // ALWAYS start fresh - clear any saved state
    localStorage.removeItem(QUIZ_STATE_KEY);
    
    // Reset quiz state
    setCurrentQuestion(0);
    setUserAnswers(new Array(10).fill(''));
    setCheckedQuestions(new Array(10).fill(false));
    setFeedback({ show: false, type: '', message: '', persistent: false });
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

  // DON'T load saved quiz state - always start fresh
  // useEffect(() => {
  //   // Removed localStorage restoration to always start fresh
  // }, [quizType, articleType]);

  // DON'T save quiz state - always start fresh
  // useEffect(() => {
  //   // Removed state saving to always start fresh
  // }, [currentQuestion, userAnswers, checkedQuestions, quizType, articleType, questions]);

  // Check answer function with persistent feedback
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
      
      // Use separate feedback state that won't disappear
      setShowFeedback(true);
      setFeedbackMessage(randomMessage);
      setFeedbackType('correct');
      
      // Mark question as checked
      const newChecked = [...checkedQuestions];
      newChecked[currentQuestion] = true;
      setCheckedQuestions(newChecked);
    } else {
      const hintText = question.hint || "Try to think about the context of the sentence.";
      const feedbackMessageText = `💡 Hint: ${hintText}`;
      
      // Use separate feedback state that won't disappear
      setShowFeedback(true);
      setFeedbackMessage(feedbackMessageText);
      setFeedbackType('incorrect');
    }
  };

  // Update user answer - optimized to prevent unnecessary re-renders
  const updateAnswer = useCallback((value) => {
    console.log('🔄 updateAnswer called with:', value);
    console.log('🔄 Current feedback state before update:', { showFeedback, feedbackMessage, feedbackType });
    
    setUserAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[currentQuestion] = value;
      return newAnswers;
    });
    
    console.log('🔄 Feedback state after update (should be unchanged):', { showFeedback, feedbackMessage, feedbackType });
  }, [currentQuestion, showFeedback, feedbackMessage, feedbackType]);

  // Navigation functions
  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Clear feedback when moving between questions
      setShowFeedback(false);
      setFeedbackMessage('');
      setFeedbackType('');
    }
  };

  const nextQuestion = () => {
    if (currentQuestion === 9) {
      // Clear quiz state and finish
      localStorage.removeItem(QUIZ_STATE_KEY);
      onFinish(userAnswers, questions);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      // Clear feedback when moving between questions
      setShowFeedback(false);
      setFeedbackMessage('');
      setFeedbackType('');
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
            className={showFeedback ? feedbackType : ''}
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

      {/* Feedback - Nuclear option with inline styles */}
      {showFeedback && (
        <div 
          className={`feedback ${feedbackType}`}
          style={{
            display: 'block',
            visibility: 'visible',
            opacity: '1',
            position: 'relative',
            zIndex: '1000',
            margin: '20px 0',
            padding: '20px',
            borderRadius: '12px',
            fontWeight: '600',
            textAlign: 'center',
            border: '2px solid',
            fontSize: '1.1em',
            wordWrap: 'break-word',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            fontFamily: "'Nunito', sans-serif",
            backgroundColor: feedbackType === 'correct' ? '#d4edda' : '#f8d7da',
            color: feedbackType === 'correct' ? '#155724' : '#721c24',
            borderColor: feedbackType === 'correct' ? '#48bb78' : '#f56565',
            clear: 'both',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {feedbackMessage}
        </div>
      )}

      {/* DEBUG: Enhanced feedback debugging */}
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
          Show Feedback: {showFeedback ? 'YES' : 'NO'}<br />
          Feedback Type: "{feedbackType}"<br />
          Feedback Message: "{feedbackMessage}"<br />
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
