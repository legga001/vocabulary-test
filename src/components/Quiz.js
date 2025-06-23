// src/components/Quiz.js - Unified Quiz Component for both Standard and Article quizzes
import React, { useState, useEffect } from 'react';
import { getNewQuestions, correctMessages } from '../questionsData';
import { getArticleQuestions, getArticleInfo } from '../articleQuestions';
import LetterInput from './LetterInput';
import { processSentence } from '../utils/quizHelpers';

// Key for localStorage
const QUIZ_STATE_KEY = 'mrFoxEnglishQuizState';

// Function to get alternative spellings (British vs American)
const getAlternativeSpellings = (word) => {
  const spellingMap = {
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
  
  const normalizedWord = word.toLowerCase();
  return spellingMap[normalizedWord] || [];
};

function Quiz({ onFinish, quizType, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(10).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(10).fill(false));
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [questions, setQuestions] = useState([]);

  // Get article info for article-based quizzes
  const articleInfo = quizType === 'article' ? getArticleInfo() : null;

  // Load questions when component mounts or quiz type changes
  useEffect(() => {
    let newQuestions;
    
    if (quizType === 'article') {
      newQuestions = getArticleQuestions();
    } else {
      // Generate fresh random questions for standard vocabulary tests
      newQuestions = getNewQuestions();
    }
    
    setQuestions(newQuestions);
    
    // Reset quiz state for new questions
    setCurrentQuestion(0);
    setUserAnswers(new Array(10).fill(''));
    setCheckedQuestions(new Array(10).fill(false));
    setFeedback({ show: false, type: '', message: '' });
  }, [quizType]);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / 10) * 100;

  // Process the current sentence to find the gap and split the text
  const processedData = question ? processSentence(question.sentence, question.answer) : null;

  // Add Enter key listener for checking answers
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && userAnswers[currentQuestion] && !checkedQuestions[currentQuestion] && question) {
        checkAnswer();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [userAnswers, currentQuestion, checkedQuestions, question]);

  // Load saved quiz state on component mount
  useEffect(() => {
    const savedQuizState = localStorage.getItem(QUIZ_STATE_KEY);
    if (savedQuizState) {
      try {
        const parsedState = JSON.parse(savedQuizState);
        
        // Only restore if it's the same quiz type and recent (within 30 minutes)
        const thirtyMinutes = 30 * 60 * 1000;
        const now = Date.now();
        
        if (parsedState.quizType === quizType && 
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
          // Clear old or different quiz state
          localStorage.removeItem(QUIZ_STATE_KEY);
        }
      } catch (error) {
        console.error('Error loading saved quiz state:', error);
        localStorage.removeItem(QUIZ_STATE_KEY);
      }
    }
  }, [quizType]);

  // Save quiz state whenever it changes
  useEffect(() => {
    if (questions.length === 0) return; // Don't save until questions are loaded

    const stateToSave = {
      quizType,
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
  }, [currentQuestion, userAnswers, checkedQuestions, quizType, questions]);

  const checkAnswer = () => {
    if (!question) return;

    const userAnswer = userAnswers[currentQuestion].toLowerCase().trim();
    const correctAnswer = question.answer.toLowerCase();
    
    // Check for alternative spellings (British vs American)
    const alternativeAnswers = getAlternativeSpellings(question.answer);
    const isCorrect = userAnswer === correctAnswer || alternativeAnswers.includes(userAnswer);

    if (isCorrect) {
      const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      setFeedback({ show: true, type: 'correct', message: randomMessage });
      
      // Only disable input after correct answer
      const newChecked = [...checkedQuestions];
      newChecked[currentQuestion] = true;
      setCheckedQuestions(newChecked);
    } else {
      // Only show hint AFTER checking incorrect answer
      const hintText = question.hint || "Try to think about the context of the sentence.";
      const feedbackMessage = `💡 Hint: ${hintText}`;
      setFeedback({ show: true, type: 'incorrect', message: feedbackMessage });
    }
  };

  const updateAnswer = (value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
    
    // Clear feedback when user starts typing again
    if (feedback.show) {
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion === 9) {
      // Clear quiz state when finishing
      localStorage.removeItem(QUIZ_STATE_KEY);
      onFinish(userAnswers, questions);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  const openArticle = () => {
    if (articleInfo && articleInfo.url) {
      window.open(articleInfo.url, '_blank');
    }
  };

  // Show loading state while questions are being loaded
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
      {/* Article Link Header - Only show for article-based quizzes */}
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

      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{width: `${progress}%`}}></div>
        </div>
        <div className="progress-text">Question {currentQuestion + 1} of 10</div>
      </div>

      <div className="question-header">
        <div className="question-number">Question {currentQuestion + 1}</div>
        <div className="level-badge">{question.level}</div>
      </div>

      {/* Display sentence with letter input boxes integrated inline */}
      <div className="question-section">
        <div className="question-text">
          {/* Text before the gap */}
          <span>{processedData.beforeGap}</span>
          
          {/* Show any visible letters that are part of the gap */}
          {processedData.visibleLetters && (
            <span className="visible-letters">{processedData.visibleLetters}</span>
          )}
          
          {/* The letter input component inline with the sentence */}
          <LetterInput
            word={question.answer}
            value={userAnswers[currentQuestion]}
            onChange={updateAnswer}
            disabled={checkedQuestions[currentQuestion]}
            className={feedback.show ? feedback.type : ''}
            onEnterPress={!checkedQuestions[currentQuestion] && userAnswers[currentQuestion] ? checkAnswer : null}
          />
          
          {/* Text after the gap */}
          <span>{processedData.afterGap}</span>
        </div>

        {/* Show context for article-based questions */}
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

      {/* Only show feedback AFTER answer has been checked */}
      {feedback.show && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

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
            disabled={!checkedQuestions[currentQuestion] && !userAnswers[currentQuestion]}
          >
            {currentQuestion === 9 ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>

      <div className="quiz-footer">
        <p>Press Enter to check your answer, or use the buttons below.</p>
      </div>
    </div>
  );
}

export default Quiz;
