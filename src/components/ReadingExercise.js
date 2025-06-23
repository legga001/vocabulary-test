// src/components/ReadingExercise.js - Rewritten for efficiency and debugging
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getReadingVocabularyQuestions, getReadingArticleInfo } from '../readingVocabularyData';
import { getAirIndiaVocabularyQuestions, getAirIndiaArticleInfo } from '../airIndiaVocabularyData';
import { getWaterTreatmentVocabularyQuestions, getWaterTreatmentArticleInfo } from '../waterTreatmentVocabularyData';
import { getKillerWhaleVocabularyQuestions, getKillerWhaleArticleInfo } from '../killerWhaleVocabularyData';
import { getArticleQuestions, getArticleInfo } from '../articleQuestions';
import { getNewQuestions, correctMessages } from '../questionsData';
import { recordTestResult } from '../utils/progressDataManager';
import AnswerReview from './AnswerReview';
import ArticleSelection from './ArticleSelection';
import RealFakeWordsExercise from './RealFakeWordsExercise';
import LetterInput from './LetterInput';
import ClickableLogo from './ClickableLogo';
import { processSentence, extractVisibleLetters } from '../utils/quizHelpers';

// Constants
const TOTAL_QUESTIONS = 10;
const INITIAL_ANSWERS = new Array(TOTAL_QUESTIONS).fill('');
const INITIAL_CHECKED = new Array(TOTAL_QUESTIONS).fill(false);
const INITIAL_FEEDBACK = { show: false, type: '', message: '' };

// Spelling variations for British/American English
const SPELLING_VARIATIONS = {
  'analyze': ['analyse'], 'realize': ['realise'], 'organize': ['organise'],
  'recognize': ['recognise'], 'criticize': ['criticise'], 'apologize': ['apologise'],
  'optimize': ['optimise'], 'minimize': ['minimise'], 'maximize': ['maximise'],
  'centralize': ['centralise'], 'normalize': ['normalise'], 'categorize': ['categorise'],
  'memorize': ['memorise'], 'authorize': ['authorise'], 'modernize': ['modernise'],
  'utilize': ['utilise'], 'fertilize': ['fertilise'], 'sterilize': ['sterilise'],
  'stabilize': ['stabilise'], 'summarize': ['summarise'],
  'analyse': ['analyze'], 'realise': ['realize'], 'organise': ['organize'],
  'recognise': ['recognize'], 'criticise': ['criticize'], 'apologise': ['apologize'],
  'optimise': ['optimize'], 'minimise': ['minimize'], 'maximise': ['maximize'],
  'centralise': ['centralize'], 'normalise': ['normalize'], 'categorise': ['categorize'],
  'memorise': ['memorize'], 'authorise': ['authorize'], 'modernise': ['modernize'],
  'utilise': ['utilize'], 'fertilise': ['fertilize'], 'sterilise': ['sterilize'],
  'stabilise': ['stabilize'], 'summarise': ['summarize'],
  'color': ['colour'], 'colours': ['colors'], 'colored': ['coloured'], 'coloring': ['colouring'],
  'colour': ['color'], 'colors': ['colours'], 'coloured': ['colored'], 'colouring': ['coloring'],
  'honor': ['honour'], 'honors': ['honours'], 'honored': ['honoured'], 'honoring': ['honouring'],
  'honour': ['honor'], 'honours': ['honors'], 'honoured': ['honored'], 'honouring': ['honoring'],
  'center': ['centre'], 'centers': ['centres'], 'centered': ['centred'], 'centering': ['centring'],
  'centre': ['center'], 'centres': ['centers'], 'centred': ['centered'], 'centring': ['centering'],
  'theater': ['theatre'], 'theaters': ['theatres'], 'theatre': ['theater'], 'theatres': ['theaters'],
  'meter': ['metre'], 'meters': ['metres'], 'metre': ['meter'], 'metres': ['meters']
};

// Quiz types that require article data
const ARTICLE_QUIZ_TYPES = ['killer-whale-quiz', 'octopus-quiz', 'smuggling-quiz', 'air-india-quiz', 'water-treatment-quiz'];
const ALL_QUIZ_TYPES = [...ARTICLE_QUIZ_TYPES, 'standard-quiz'];

function ReadingExercise({ onBack, onLogoClick, initialView = 'selection' }) {
  // Core state
  const [currentView, setCurrentView] = useState(initialView);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(INITIAL_ANSWERS);
  const [checkedQuestions, setCheckedQuestions] = useState(INITIAL_CHECKED);
  const [feedback, setFeedback] = useState(INITIAL_FEEDBACK);
  const [showResults, setShowResults] = useState(false);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Derived state
  const isDirectFromLanding = initialView !== 'selection';
  const isQuizView = ALL_QUIZ_TYPES.includes(currentView);
  const isArticleQuiz = ARTICLE_QUIZ_TYPES.includes(currentView);
  const currentQuestionData = questions[currentQuestion];
  const progress = questions.length > 0 ? (currentQuestion / TOTAL_QUESTIONS) * 100 : 0;

  // Article information - memoized for performance
  const articleInfo = useMemo(() => ({
    'killer-whale-quiz': getKillerWhaleArticleInfo(),
    'octopus-quiz': getReadingArticleInfo(),
    'smuggling-quiz': getArticleInfo(),
    'air-india-quiz': getAirIndiaArticleInfo(),
    'water-treatment-quiz': getWaterTreatmentArticleInfo()
  }), []);

  const currentArticleInfo = articleInfo[currentView] || null;

  // Question loading logic
  const loadQuestions = useCallback(() => {
    console.log('🔄 Loading questions for:', currentView);
    
    try {
      let newQuestions = [];
      
      switch (currentView) {
        case 'killer-whale-quiz':
          newQuestions = getKillerWhaleVocabularyQuestions();
          console.log('🐋 Loaded killer whale questions:', newQuestions.length);
          break;
        case 'octopus-quiz':
          newQuestions = getReadingVocabularyQuestions();
          console.log('🐙 Loaded octopus questions:', newQuestions.length);
          break;
        case 'smuggling-quiz':
          newQuestions = getArticleQuestions();
          console.log('🚢 Loaded smuggling questions:', newQuestions.length);
          break;
        case 'air-india-quiz':
          newQuestions = getAirIndiaVocabularyQuestions();
          console.log('✈️ Loaded air india questions:', newQuestions.length);
          break;
        case 'water-treatment-quiz':
          newQuestions = getWaterTreatmentVocabularyQuestions();
          console.log('💧 Loaded water treatment questions:', newQuestions.length);
          break;
        case 'standard-quiz':
          newQuestions = getNewQuestions();
          console.log('📚 Loaded standard questions:', newQuestions.length);
          break;
        default:
          console.log('❌ No questions for view:', currentView);
          return [];
      }
      
      if (newQuestions.length === 0) {
        console.error('⚠️ No questions loaded for', currentView);
      }
      
      return newQuestions;
    } catch (error) {
      console.error('💥 Error loading questions for', currentView, ':', error);
      return [];
    }
  }, [currentView]);

  // Load questions when view changes
  useEffect(() => {
    if (isQuizView) {
      const newQuestions = loadQuestions();
      setQuestions(newQuestions);
    }
  }, [currentView, isQuizView, loadQuestions]);

  // Spelling check helper
  const getAlternativeSpellings = useCallback((word) => {
    const normalizedWord = word.toLowerCase();
    return SPELLING_VARIATIONS[normalizedWord] || [];
  }, []);

  // Check if answer is correct (with spelling variations)
  const isAnswerCorrect = useCallback((userAnswer, correctAnswer) => {
    const userLower = userAnswer.toLowerCase().trim();
    const correctLower = correctAnswer.toLowerCase();
    
    if (userLower === correctLower) return true;
    
    const correctAlternatives = getAlternativeSpellings(correctAnswer);
    const userAlternatives = getAlternativeSpellings(userAnswer);
    
    return correctAlternatives.includes(userLower) || userAlternatives.includes(correctLower);
  }, [getAlternativeSpellings]);

  // Calculate score
  const calculateScore = useCallback(() => {
    return userAnswers.slice(0, TOTAL_QUESTIONS).reduce((score, answer, index) => {
      if (!answer || !questions[index]) return score;
      return isAnswerCorrect(answer, questions[index].answer) ? score + 1 : score;
    }, 0);
  }, [userAnswers, questions, isAnswerCorrect]);

  // Reset quiz state
  const resetQuizState = useCallback(() => {
    setCurrentQuestion(0);
    setUserAnswers(INITIAL_ANSWERS);
    setCheckedQuestions(INITIAL_CHECKED);
    setFeedback(INITIAL_FEEDBACK);
    setShowResults(false);
    setExerciseStartTime(Date.now());
  }, []);

  // Navigation handlers
  const navigationHandlers = useMemo(() => ({
    goToArticleSelection: () => setCurrentView('article-selection'),
    startStandardQuiz: () => {
      setCurrentView('standard-quiz');
      resetQuizState();
    },
    startWordRecognition: () => setCurrentView('real-fake-words'),
    startArticleQuiz: (articleType) => {
      setCurrentView(articleType);
      resetQuizState();
    },
    backToSelection: () => {
      if (isDirectFromLanding) {
        onBack();
      } else {
        setCurrentView('selection');
        resetQuizState();
      }
    },
    backToArticleSelection: () => {
      setCurrentView('article-selection');
      resetQuizState();
    }
  }), [isDirectFromLanding, onBack, resetQuizState]);

  // Answer checking
  const checkAnswer = useCallback(() => {
    if (!currentQuestionData) return;

    const userAnswer = userAnswers[currentQuestion];
    const correct = isAnswerCorrect(userAnswer, currentQuestionData.answer);

    const newCheckedQuestions = [...checkedQuestions];
    newCheckedQuestions[currentQuestion] = true;
    setCheckedQuestions(newCheckedQuestions);

    if (correct) {
      const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      setFeedback({ show: true, type: 'correct', message: randomMessage });
    } else {
      setFeedback({ 
        show: true, 
        type: 'incorrect', 
        message: `The correct answer is "${currentQuestionData.answer}".` 
      });
    }
  }, [currentQuestionData, userAnswers, currentQuestion, checkedQuestions, isAnswerCorrect]);

  // Navigation between questions
  const nextQuestion = useCallback(() => {
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback(INITIAL_FEEDBACK);
    } else {
      finishQuiz();
    }
  }, [currentQuestion]);

  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setFeedback(INITIAL_FEEDBACK);
    }
  }, [currentQuestion]);

  // Handle user input
  const handleInputChange = useCallback((value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
    
    if (feedback.show) {
      setFeedback(INITIAL_FEEDBACK);
    }
  }, [userAnswers, currentQuestion, feedback.show]);

  // Finish quiz and record progress
  const finishQuiz = useCallback(() => {
    console.log('🏁 Finishing quiz:', currentView);
    
    const score = calculateScore();
    const testDuration = exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 1000) : 0;
    const quizType = isArticleQuiz ? 'article-vocabulary' : 'standard-vocabulary';
    
    try {
      const formattedAnswers = userAnswers.slice(0, TOTAL_QUESTIONS).map((answer, index) => {
        if (!answer || !questions[index]) {
          return { answer: '', correct: false, score: 0, level: 'B1' };
        }
        
        const correct = isAnswerCorrect(answer, questions[index].answer);
        return {
          answer: answer,
          correct: correct,
          score: correct ? 100 : 0,
          level: questions[index].level || 'B1'
        };
      });

      recordTestResult({
        quizType: quizType,
        score: score,
        totalQuestions: TOTAL_QUESTIONS,
        completedAt: new Date(),
        timeSpent: testDuration,
        userAnswers: formattedAnswers
      });
      
      console.log(`✅ ${quizType} result recorded: ${score}/${TOTAL_QUESTIONS}`);
    } catch (error) {
      console.error('Error recording test result:', error);
    }

    setShowResults(true);
  }, [calculateScore, exerciseStartTime, currentView, userAnswers, questions, isAnswerCorrect, isArticleQuiz]);

  // Keyboard handler for Enter key
  useEffect(() => {
    if (isQuizView && !showResults && currentQuestionData) {
      const handleKeyPress = (e) => {
        if (e.key === 'Enter' && userAnswers[currentQuestion] && !checkedQuestions[currentQuestion]) {
          checkAnswer();
        }
      };

      document.addEventListener('keypress', handleKeyPress);
      return () => document.removeEventListener('keypress', handleKeyPress);
    }
  }, [userAnswers, currentQuestion, checkedQuestions, isQuizView, showResults, currentQuestionData, checkAnswer]);

  // Render Real/Fake Words exercise
  if (currentView === 'real-fake-words') {
    return <RealFakeWordsExercise onBack={navigationHandlers.backToSelection} onLogoClick={onLogoClick} />;
  }

  // Render Article Selection
  if (currentView === 'article-selection') {
    return (
      <ArticleSelection 
        onBack={navigationHandlers.backToSelection}
        onLogoClick={onLogoClick}
        onSelectArticle={navigationHandlers.startArticleQuiz}
      />
    );
  }

  // Render Results
  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);

    const getLevelInfo = (score) => {
      if (score <= 2) return {
        level: "A1-A2 (Elementary)",
        description: "You're building your foundation!",
        feedback: "Keep practising basic vocabulary and common phrases. Focus on everyday words and simple sentence structures."
      };
      if (score <= 4) return {
        level: "A2-B1 (Pre-Intermediate)",
        description: "You're making good progress!",
        feedback: "Continue expanding your vocabulary with more complex words. Practice reading simple texts and engaging in basic conversations."
      };
      if (score <= 6) return {
        level: "B1-B2 (Intermediate)",
        description: "You have a solid vocabulary base!",
        feedback: "Focus on advanced vocabulary and expressions. Try reading news articles and academic texts to challenge yourself further."
      };
      if (score <= 8) return {
        level: "B2-C1 (Upper-Intermediate)",
        description: "Excellent vocabulary knowledge!",
        feedback: "You demonstrate strong command of English vocabulary. Continue with advanced materials and specialised terminology in your areas of interest."
      };
      return {
        level: "C1-C2 (Advanced)",
        description: "Outstanding vocabulary mastery!",
        feedback: "Your vocabulary knowledge is impressive! Keep challenging yourself with complex texts and specialised vocabulary in different fields."
      };
    };

    const levelInfo = getLevelInfo(score);

    return (
      <div className="exercise-page scrollable-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        
        <div className="quiz-container">
          <h1>📖 Reading Exercise Results</h1>
          
          <div className="results">
            <h2>🎉 Quiz Complete!</h2>
            <div className="score-display">{score}/{TOTAL_QUESTIONS}</div>
            <div className="score-percentage">({percentage}%)</div>
            
            <div className="level-estimate">
              <h3>{isArticleQuiz ? '📰 Article-Based' : '📚 Standard'} Vocabulary Test</h3>
              <p><strong>{levelInfo.level}</strong></p>
              <p>{levelInfo.description}</p>
              {isArticleQuiz && currentArticleInfo && (
                <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
                  Based on: "{currentArticleInfo.title}"
                </p>
              )}
            </div>

            <div className="feedback-message">
              <strong>Well done!</strong> You've practised {isArticleQuiz ? 'vocabulary from a current BBC article' : 'vocabulary from our extensive question pool'}. 
              {isArticleQuiz ? ' This helps you learn words in context from real news stories.' : ' Each test uses randomly selected questions from 100 exercises across all CEFR levels.'}
              <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'left' }}>
                <strong>💡 Learning Tip:</strong> {levelInfo.feedback}
              </div>
            </div>

            <AnswerReview 
              questions={questions}
              userAnswers={userAnswers}
              title="Your Answers"
            />
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={navigationHandlers.backToSelection}>
                {isDirectFromLanding ? 'Back to Main Menu' : 'Try Another Test'}
              </button>
              {!isDirectFromLanding && (
                <button className="btn btn-secondary" onClick={onBack}>
                  ← Back to Exercises
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for quiz views
  if (isQuizView && questions.length === 0) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📖 Reading Exercise</h1>
          <div className="loading-state">
            <p>🎲 Loading your vocabulary test...</p>
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
              Preparing {currentView.replace('-', ' ')}...
            </p>
            <div style={{ marginTop: '20px' }}>
              <button 
                className="btn btn-secondary btn-small" 
                onClick={() => {
                  console.log('Back button clicked from loading');
                  if (currentView === 'standard-quiz') {
                    navigationHandlers.backToSelection();
                  } else {
                    navigationHandlers.backToArticleSelection();
                  }
                }}
              >
                ← Back
              </button>
              <button 
                className="btn btn-primary btn-small" 
                onClick={() => window.location.reload()}
                style={{ marginLeft: '10px' }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface
  if (isQuizView && questions.length > 0 && currentQuestionData) {
    console.log('🎯 Rendering quiz interface for:', currentView);
    
    const processedData = processSentence(currentQuestionData.sentence, currentQuestionData.answer);

    return (
      <div className="exercise-page">
        {currentArticleInfo && (
          <div className="article-link-header">
            <button 
              className="btn btn-article-link"
              onClick={() => window.open(currentArticleInfo.url, '_blank')}
              title={`Read the original article: ${currentArticleInfo.title}`}
            >
              📖 Read Original Article
            </button>
            <div className="article-title-small">
              "{currentArticleInfo.title}"
            </div>
          </div>
        )}

        <div className="quiz-container">
          <div className="quiz-header">
            <div className="quiz-type-badge">
              📖 {currentArticleInfo ? `Article: ${currentArticleInfo.title}` : 'Standard Vocabulary Test'}
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
              <div className="sentence-display">
                {processedData.beforeBlank}
                <LetterInput 
                  value={userAnswers[currentQuestion]}
                  onChange={handleInputChange}
                  disabled={checkedQuestions[currentQuestion]}
                  targetLength={extractVisibleLetters(currentQuestionData.answer).length}
                  placeholder="Type your answer..."
                />
                {processedData.afterBlank}
              </div>
            </div>

            <div className="hint-section">
              <div className="hint">
                💡 <strong>Hint:</strong> {currentQuestionData.hint}
              </div>
            </div>

            {feedback.show && (
              <div className={`feedback ${feedback.type}`}>
                {feedback.message}
              </div>
            )}
          </div>

          <div className="controls-section">
            <button 
              className="btn btn-primary" 
              onClick={checkedQuestions[currentQuestion] ? nextQuestion : checkAnswer}
              disabled={!userAnswers[currentQuestion] && !checkedQuestions[currentQuestion]}
            >
              {checkedQuestions[currentQuestion] ? (currentQuestion === TOTAL_QUESTIONS - 1 ? 'Finish' : 'Next') : 'Check Answer'}
            </button>
            
            <div className="navigation-controls">
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

          <div className="quiz-footer">
            <button 
              className="btn btn-secondary btn-small" 
              onClick={currentArticleInfo ? navigationHandlers.backToArticleSelection : navigationHandlers.backToSelection}
            >
              ← Back to {isDirectFromLanding ? 'Main Menu' : (currentArticleInfo ? 'Article Selection' : 'Reading Options')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main selection view
  if (currentView === 'selection') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        
        <h1>📖 Reading Exercises</h1>
        
        <div className="welcome-text">
          <p>Choose your reading exercise type:</p>
        </div>

        <div className="reading-main-options">
          <div className="reading-main-card" onClick={navigationHandlers.startStandardQuiz}>
            <div className="card-icon">📚</div>
            <h3>Standard Vocabulary</h3>
            <p>Random selection from 100+ exercises across CEFR levels (A2-C1)</p>
            <div className="card-details">
              <span>• 2 A2 + 3 B1 + 3 B2 + 2 C1</span>
              <span>• Fresh questions each time</span>
              <span>• 5-10 mins</span>
            </div>
            <div className="card-arrow">→</div>
          </div>

          <div className="reading-main-card" onClick={navigationHandlers.goToArticleSelection}>
            <div className="card-icon">📰</div>
            <h3>Article-Based Vocabulary</h3>
            <p>Vocabulary from current BBC news articles</p>
            <div className="card-details">
              <span>• Multiple articles</span>
              <span>• Real context</span>
              <span>• 5-10 mins each</span>
            </div>
            <div className="card-arrow">→</div>
          </div>

          <div className="reading-main-card featured-card" onClick={navigationHandlers.startWordRecognition}>
            <div className="new-badge">✨ NEW</div>
            <div className="card-icon">🎯</div>
            <h3>Real or Fake Words</h3>
            <p>Quick-fire word recognition challenge with timer</p>
            <div className="card-details">
              <span>• 20 questions</span>
              <span>• 5-second timer</span>
              <span>• 3-5 mins</span>
            </div>
            <div className="card-arrow">→</div>
          </div>
        </div>

        <div className="reading-info">
          <h3>💡 About Standard Vocabulary Tests</h3>
          <p>Our enhanced standard vocabulary test now features a comprehensive pool of 100 exercises distributed across CEFR levels:</p>
          <ul>
            <li>🎯 <strong>Smart Selection:</strong> Each test randomly selects 2 A2, 3 B1, 3 B2, and 2 C1 questions</li>
            <li>🔄 <strong>Fresh Content:</strong> Different questions every time you take the test</li>
            <li>📈 <strong>Progressive Difficulty:</strong> From elementary to advanced level vocabulary</li>
            <li>🇬🇧 <strong>British English:</strong> Accepts both British and American spelling variations</li>
            <li>💡 <strong>Helpful Hints:</strong> Each question includes contextual hints to aid learning</li>
          </ul>
        </div>

        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Exercise Selection
        </button>
      </div>
    );
  }

  // Debug fallback - should never reach here
  console.error('⚠️ ReadingExercise fallback reached!');
  console.error('⚠️ State:', { currentView, questionsLength: questions.length, isQuizView, currentQuestionData: !!currentQuestionData });
  
  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <div className="quiz-container">
        <h1>⚠️ Debug Information</h1>
        <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <p><strong>Current View:</strong> {currentView}</p>
          <p><strong>Questions Length:</strong> {questions.length}</p>
          <p><strong>Is Quiz View:</strong> {isQuizView ? 'Yes' : 'No'}</p>
          <p><strong>Current Question Index:</strong> {currentQuestion}</p>
          <p><strong>Has Current Question Data:</strong> {currentQuestionData ? 'Yes' : 'No'}</p>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setCurrentView('selection')}
          >
            🏠 Back to Menu
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.reload()}
            style={{ marginLeft: '10px' }}
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReadingExercise;
