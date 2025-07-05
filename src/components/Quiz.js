// src/components/Quiz.js - COMPLETE FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import ClickableLogo from './ClickableLogo';
import LetterInput from './LetterInput';
import { correctMessages } from '../questionsData';
import { processSentence } from '../utils/quizHelpers';

// British/American spelling variations
const SPELLING_VARIATIONS = {
  'analyze': ['analyse'], 'realize': ['realise'], 'organize': ['organise'],
  'recognize': ['recognise'], 'criticize': ['criticise'], 'apologize': ['apologise'],
  'optimize': ['optimise'], 'minimize': ['minimise'], 'maximize': ['maximise'],
  'centralize': ['centralise'], 'normalize': ['normalise'], 'categorize': ['categorise'],
  'memorize': ['memorise'], 'authorize': ['authorise'], 'modernize': ['modernise'],
  'utilize': ['utilise'], 'fertilize': ['fertilise'], 'sterilize': ['sterilise'],
  'stabilize': ['stabilise'], 'summarize': ['summarise'],
  // Reverse mappings
  'analyse': ['analyze'], 'realise': ['realize'], 'organise': ['organize'],
  'recognise': ['recognize'], 'criticise': ['criticize'], 'apologise': ['apologize'],
  'optimise': ['optimize'], 'minimise': ['minimize'], 'maximise': ['maximize'],
  'centralise': ['centralize'], 'normalise': ['normalize'], 'categorise': ['categorize'],
  'memorise': ['memorize'], 'authorise': ['authorize'], 'modernise': ['modernize'],
  'utilise': ['utilize'], 'fertilise': ['fertilize'], 'sterilise': ['sterilize'],
  'stabilise': ['stabilize'], 'summarise': ['summarize'],
  // Colour/color variations
  'color': ['colour'], 'colours': ['colors'], 'colored': ['coloured'], 'coloring': ['colouring'],
  'colour': ['color'], 'colors': ['colours'], 'coloured': ['colored'], 'colouring': ['coloring'],
  // Honour/honor variations
  'honor': ['honour'], 'honors': ['honours'], 'honored': ['honoured'], 'honoring': ['honouring'],
  'honour': ['honor'], 'honours': ['honors'], 'honoured': ['honored'], 'honouring': ['honoring'],
  // Centre/center variations
  'center': ['centre'], 'centers': ['centres'], 'centered': ['centred'], 'centering': ['centring'],
  'centre': ['center'], 'centres': ['centers'], 'centred': ['centered'], 'centring': ['centering'],
  // Theatre/theater variations
  'theater': ['theatre'], 'theaters': ['theatres'], 'theatre': ['theater'], 'theatres': ['theaters'],
  // Metre/meter variations
  'meter': ['metre'], 'meters': ['metres'], 'metre': ['meter'], 'metres': ['meters']
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

function Quiz({ onFinish, quizType, articleType, onBack, onLogoClick }) {
  console.log('🏗️ Quiz component rendering with:', { quizType, articleType });
  
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

  const QUIZ_STATE_KEY = `quiz_state_${quizType}_${articleType || 'standard'}`;

  // Load questions based on quiz type
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let questionData = [];
        
        if (quizType === 'article') {
          console.log('📚 Loading article questions for type:', articleType);
          
          switch (articleType) {
            case 'zooplankton-quiz':
              const zooplanktonModule = await import('../zooplanktonVocabularyData');
              questionData = zooplanktonModule.getZooplanktonVocabularyQuestions();
              break;
            case 'killer-whale-quiz':
              const killerWhaleModule = await import('../killerWhaleVocabularyData');
              questionData = killerWhaleModule.getKillerWhaleVocabularyQuestions();
              break;
            case 'smuggling-quiz':
              const smugglingModule = await import('../smugglingVocabularyData');
              questionData = smugglingModule.getSmugglingVocabularyQuestions();
              break;
            case 'air-india-quiz':
              const airIndiaModule = await import('../airIndiaVocabularyData');
              questionData = airIndiaModule.getAirIndiaVocabularyQuestions();
              break;
            case 'water-treatment-quiz':
              const waterTreatmentModule = await import('../waterTreatmentVocabularyData');
              questionData = waterTreatmentModule.getWaterTreatmentVocabularyQuestions();
              break;
            case 'octopus-quiz':
              const octopusModule = await import('../readingVocabularyData');
              questionData = octopusModule.getReadingVocabularyQuestions();
              break;
            default:
              const defaultModule = await import('../articleQuestions');
              questionData = defaultModule.getArticleQuestions();
          }
        } else {
          console.log('📚 Loading standard vocabulary questions');
          const standardModule = await import('../questionsData');
          questionData = standardModule.getNewQuestions();
        }
        
        console.log('✅ Questions loaded:', questionData);
        setQuestions(questionData);
      } catch (error) {
        console.error('❌ Error loading questions:', error);
        // Fallback to default questions
        import('../questionsData').then(module => {
          setQuestions(module.getNewQuestions());
        });
      }
    };

    loadQuestions();
  }, [quizType, articleType]);

  // Get article info
  const getArticleInfo = () => {
    try {
      if (quizType === 'article') {
        switch (articleType) {
          case 'zooplankton-quiz':
            const zooplanktonModule = require('../zooplanktonVocabularyData');
            return zooplanktonModule.getZooplanktonArticleInfo();
          case 'killer-whale-quiz':
            const killerWhaleModule = require('../killerWhaleVocabularyData');
            return killerWhaleModule.getKillerWhaleArticleInfo();
          case 'smuggling-quiz':
            const smugglingModule = require('../smugglingVocabularyData');
            return smugglingModule.getArticleInfo();
          case 'air-india-quiz':
            const airIndiaModule = require('../airIndiaVocabularyData');
            return airIndiaModule.getAirIndiaArticleInfo();
          case 'water-treatment-quiz':
            const waterTreatmentModule = require('../waterTreatmentVocabularyData');
            return waterTreatmentModule.getWaterTreatmentArticleInfo();
          case 'octopus-quiz':
            const octopusModule = require('../readingVocabularyData');
            return octopusModule.getReadingArticleInfo();
          default:
            const defaultModule = require('../articleQuestions');
            return defaultModule.getArticleInfo();
        }
      }
    } catch (error) {
      console.error('Error getting article info:', error);
    }
    return null;
  };

  // Current question and progress
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / 10) * 100;
  const processedData = question ? processSentence(question.sentence, question.answer) : { beforeGap: '', afterGap: '' };
  const articleInfo = getArticleInfo();

  // Open article link
  const openArticle = () => {
    if (articleInfo && articleInfo.url) {
      window.open(articleInfo.url, '_blank');
    }
  };

  // Enhanced answer checking function
  const checkAnswer = useCallback((userInput, correctAnswer) => {
    if (!userInput || !correctAnswer) return false;

    const normalizeText = (text) => text.toLowerCase().trim().replace(/[^a-z]/g, '');
    const normalizedUser = normalizeText(userInput);
    const normalizedCorrect = normalizeText(correctAnswer);

    // Check exact match
    if (normalizedUser === normalizedCorrect) return true;

    // Check alternative spellings
    const alternatives = getAlternativeSpellings(correctAnswer);
    return alternatives.some(alt => normalizeText(alt) === normalizedUser);
  }, []);

  // Update answer function
  const updateAnswer = useCallback((value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
  }, [userAnswers, currentQuestion]);

  // Check current answer
  const checkCurrentAnswer = useCallback(() => {
    if (checkedQuestions[currentQuestion]) return;

    const userAnswer = userAnswers[currentQuestion];
    const correctAnswer = question.answer;
    const isCorrect = checkAnswer(userAnswer, correctAnswer);

    // Mark question as checked
    const newCheckedQuestions = [...checkedQuestions];
    newCheckedQuestions[currentQuestion] = true;
    setCheckedQuestions(newCheckedQuestions);

    // Show feedback
    const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
    const message = isCorrect ? randomMessage : `✗ The correct answer is "${correctAnswer}"`;
    
    setFeedbackMessage(message);
    setFeedbackType(isCorrect ? 'correct' : 'incorrect');
    setShowFeedback(true);

    // Auto-hide feedback after delay
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  }, [currentQuestion, userAnswers, checkedQuestions, question, checkAnswer]);

  // Navigation functions
  const goToNextQuestion = useCallback(() => {
    if (currentQuestion < 9) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Quiz complete - pass complete answers to Results
      const completeAnswers = userAnswers.map((userAnswer, index) => {
        const correctAnswer = questions[index].answer;
        const lettersShown = getLettersToShow(correctAnswer);
        const preFilledPart = correctAnswer.substring(0, lettersShown);
        return preFilledPart + userAnswer; // Complete word
      });
      
      console.log('🏁 Quiz finished with complete answers:', completeAnswers);
      onFinish(completeAnswers, questions);
    }
  }, [currentQuestion, userAnswers, questions, onFinish]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  // Handle Enter key press
  const handleEnterPress = useCallback(() => {
    const userAnswer = userAnswers[currentQuestion];
    if (!checkedQuestions[currentQuestion] && userAnswer) {
      checkCurrentAnswer();
    } else if (checkedQuestions[currentQuestion]) {
      goToNextQuestion();
    }
  }, [userAnswers, currentQuestion, checkedQuestions, checkCurrentAnswer, goToNextQuestion]);

  // Show loading if questions not loaded
  if (questions.length === 0) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
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
      </div>
    );
  }

  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
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
              onEnterPress={!checkedQuestions[currentQuestion] && userAnswers[currentQuestion] ? handleEnterPress : undefined}
            />
            <span>{processedData.afterGap}</span>
          </div>
        </div>

        {/* Hint Section */}
        <div className="hint-section">
          <div className="hint-icon">💡</div>
          <div className="hint-text">{question.hint}</div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`feedback-section ${feedbackType}`}>
            <div className="feedback-message">{feedbackMessage}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            ← Previous
          </button>

          {!checkedQuestions[currentQuestion] ? (
            <button
              onClick={checkCurrentAnswer}
              disabled={!userAnswers[currentQuestion]}
              className="btn btn-primary"
            >
              ✓ Check Answer
            </button>
          ) : (
            <button
              onClick={goToNextQuestion}
              className="btn btn-primary"
            >
              {currentQuestion === 9 ? '🏁 Finish Quiz' : 'Next →'}
            </button>
          )}
        </div>

        {/* Navigation Help */}
        <div className="navigation-help">
          <p>💡 Press Enter to check your answer or move to the next question</p>
        </div>

        {/* Back Button */}
        <div className="back-button-container">
          <button onClick={onBack} className="btn btn-secondary back-btn">
            ← Back to Selection
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
