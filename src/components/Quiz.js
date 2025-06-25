// src/components/Quiz.js - FIXED: Now passes complete words to Results component
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

  const QUIZ_STATE_KEY = `quiz_state_${quizType}_${articleType || 'standard'}`;

  // Load questions based on quiz type
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let questionData = [];
        
        if (quizType === 'article') {
          console.log('📚 Loading article questions for type:', articleType);
          
          switch (articleType) {
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
          case 'smuggling-quiz':
            const smugglingModule = require('../smugglingVocabularyData');
            return smugglingModule.getArticleInfo();
          case 'air-india-quiz':
            const airIndiaModule = require('../airIndiaVocabularyData');
            return airIndiaModule.getAirIndiaArticleInfo();
          case 'water-treatment-quiz':
            const waterTreatmentModule = require('../waterTreatmentVocabularyData');
            return waterTreatmentModule.getWaterTreatmentArticleInfo();
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
  const processedData = question ? processSentence(question.sentence, question.answer) : null;
  const articleInfo = getArticleInfo();

  // CRITICAL FUNCTION: Reconstruct complete word from partial user input
  const reconstructCompleteWord = (partialUserInput, correctAnswer) => {
    if (!partialUserInput || !correctAnswer) return '';
    
    const lettersToShow = getLettersToShow(correctAnswer);
    const preFilledLetters = correctAnswer.substring(0, lettersToShow).toLowerCase();
    const userTypedLetters = partialUserInput.toLowerCase().trim();
    
    return preFilledLetters + userTypedLetters;
  };

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

  // FIXED: Modified nextQuestion to pass complete words to Results
  const nextQuestion = () => {
    if (currentQuestion === 9) {
      // CRITICAL FIX: Convert partial answers to complete words before passing to Results
      const completeUserAnswers = userAnswers.map((partialAnswer, index) => {
        if (!partialAnswer || !questions[index]) return '';
        return reconstructCompleteWord(partialAnswer, questions[index].answer);
      });
      
      console.log('🎯 QUIZ COMPLETE - SENDING TO RESULTS:', {
        originalAnswers: userAnswers,
        completeAnswers: completeUserAnswers,
        questions: questions.map(q => q.answer)
      });
      
      // Clear quiz state and finish with complete words
      localStorage.removeItem(QUIZ_STATE_KEY);
      onFinish(completeUserAnswers, questions);
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
          <strong>🐛 Quiz Debug:</strong><br />
          Show Feedback: {showFeedback ? 'YES' : 'NO'}<br />
          Feedback Type: "{feedbackType}"<br />
          Feedback Message: "{feedbackMessage}"<br />
          Current Answer: "{userAnswers[currentQuestion]}"<br />
          Complete Word: "{question ? reconstructCompleteWord(userAnswers[currentQuestion], question.answer) : 'N/A'}"<br />
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
    </div>
  );
}

export default Quiz;
