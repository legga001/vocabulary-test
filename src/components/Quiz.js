// src/components/Quiz.js - Updated with letter input system
import React, { useState, useEffect } from 'react';
import { questions as staticQuestions, correctMessages } from '../questionsData';
import { getArticleQuestions } from '../articleQuestions';
import LetterInput from './LetterInput';
import { processSentence, extractVisibleLetters } from '../utils/quizHelpers';

// Key for localStorage
const QUIZ_STATE_KEY = 'mrFoxEnglishQuizState';

// Function to get alternative spellings (British vs American)
const getAlternativeSpellings = (word) => {
  const spellingMap = {
    // American -> British alternatives
    'analyze': ['analyse'],
    'realize': ['realise'],
    'organize': ['organise'],
    'recognize': ['recognise'],
    'criticize': ['criticise'],
    'apologize': ['apologise'],
    'optimize': ['optimise'],
    'minimize': ['minimise'],
    'maximize': ['maximise'],
    'centralize': ['centralise'],
    'normalize': ['normalise'],
    'categorize': ['categorise'],
    'memorize': ['memorise'],
    'authorize': ['authorise'],
    'modernize': ['modernise'],
    'utilize': ['utilise'],
    'fertilize': ['fertilise'],
    'sterilize': ['sterilise'],
    'stabilize': ['stabilise'],
    'summarize': ['summarise'],
    // British -> American alternatives  
    'analyse': ['analyze'],
    'realise': ['realize'],
    'organise': ['organize'],
    'recognise': ['recognize'],
    'criticise': ['criticize'],
    'apologise': ['apologize'],
    'optimise': ['optimize'],
    'minimise': ['minimize'],
    'maximise': ['maximize'],
    'centralise': ['centralize'],
    'normalise': ['normalize'],
    'categorise': ['categorize'],
    'memorise': ['memorize'],
    'authorise': ['authorize'],
    'modernise': ['modernize'],
    'utilise': ['utilize'],
    'fertilise': ['fertilize'],
    'sterilise': ['sterilize'],
    'stabilise': ['stabilize'],
    'summarise': ['summarize'],
    // Color/colour variations
    'color': ['colour'],
    'colours': ['colors'],
    'colored': ['coloured'],
    'coloring': ['colouring'],
    'colour': ['color'],
    'colors': ['colours'],
    'coloured': ['colored'],
    'colouring': ['coloring'],
    // Honor/honour variations
    'honor': ['honour'],
    'honors': ['honours'],
    'honored': ['honoured'],
    'honoring': ['honouring'],
    'honour': ['honor'],
    'honours': ['honors'],
    'honoured': ['honored'],
    'honouring': ['honoring'],
    // Center/centre variations
    'center': ['centre'],
    'centers': ['centres'],
    'centered': ['centred'],
    'centering': ['centring'],
    'centre': ['center'],
    'centres': ['centers'],
    'centred': ['centered'],
    'centring': ['centering'],
    // Theater/theatre variations
    'theater': ['theatre'],
    'theaters': ['theatres'],
    'theatre': ['theater'],
    'theatres': ['theaters'],
    // Meter/metre variations
    'meter': ['metre'],
    'meters': ['metres'],
    'metre': ['meter'],
    'metres': ['meters']
  };
  
  const normalizedWord = word.toLowerCase();
  return spellingMap[normalizedWord] || [];
};

function Quiz({ onFinish, quizType }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(10).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(10).fill(false));
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });

  // Get questions based on quiz type
  const questions = quizType === 'article' ? getArticleQuestions() : staticQuestions;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / 10) * 100;

  // Process the current sentence
  const processedData = processSentence(question.sentence, question.answer);
  const visibleLetters = extractVisibleLetters(question.sentence);

  // Add Enter key listener for checking answers
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && userAnswers[currentQuestion] && !checkedQuestions[currentQuestion]) {
        checkAnswer();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [userAnswers, currentQuestion, checkedQuestions]); // Dependencies for the effect

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
            (now - parsedState.timestamp) < thirtyMinutes) {
          
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
    const stateToSave = {
      quizType,
      currentQuestion,
      userAnswers,
      checkedQuestions,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving quiz state:', error);
    }
  }, [currentQuestion, userAnswers, checkedQuestions, quizType]);

  const checkAnswer = () => {
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
      setFeedback({ show: true, type: 'incorrect', message: `💡 Hint: ${question.hint}` });
      // Don't disable input for incorrect answers - allow retry
    }
  };

  const updateAnswer = (value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
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
      onFinish(userAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback({ show: false, type: '', message: '' });
      // Small delay to allow component to re-render before focus
      setTimeout(() => {
        // Focus will be handled by LetterInput component's useEffect
      }, 50);
    }
  };

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-type-badge">
          {quizType === 'article' ? '📰 Article-Based' : '📚 Standard'} Test
        </div>
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

      {/* Display sentence with letter input */}
      <div className="question-section">
        <div className="question-text">
          {processedData.beforeGap}
          {visibleLetters && <span className="visible-letters">{visibleLetters}</span>}
          <div className="letter-input-wrapper">
            <LetterInput
              word={question.answer}
              value={userAnswers[currentQuestion]}
              onChange={updateAnswer}
              disabled={checkedQuestions[currentQuestion]}
              className={feedback.show ? feedback.type : ''}
            />
          </div>
          {processedData.afterGap}
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

      {feedback.show && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <button 
        className="btn" 
        onClick={checkAnswer}
        disabled={checkedQuestions[currentQuestion] || !userAnswers[currentQuestion]}
      >
        Check Answer
      </button>

      <div className="navigation">
        <button 
          className="nav-btn" 
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        <button className="nav-btn" onClick={nextQuestion}>
          {currentQuestion === 9 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default Quiz;
