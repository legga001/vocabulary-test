// src/components/ReadingExercise.js - Updated with proper daily progress tracking
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getReadingVocabularyQuestions, getReadingArticleInfo } from '../readingVocabularyData';
import { getAirIndiaVocabularyQuestions, getAirIndiaArticleInfo } from '../airIndiaVocabularyData';
import { getWaterTreatmentVocabularyQuestions, getWaterTreatmentArticleInfo } from '../waterTreatmentVocabularyData';
import { getArticleQuestions, getArticleInfo } from '../articleQuestions';
import { questions as staticQuestions, correctMessages } from '../questionsData';
import { recordTestResult } from '../utils/progressDataManager';
import AnswerReview from './AnswerReview';
import ArticleSelection from './ArticleSelection';
import RealFakeWordsExercise from './RealFakeWordsExercise';
import LetterInput from './LetterInput';
import ClickableLogo from './ClickableLogo';
import { processSentence, extractVisibleLetters } from '../utils/quizHelpers';

// Constants
const INITIAL_ANSWERS = new Array(10).fill('');
const INITIAL_CHECKED = new Array(10).fill(false);
const INITIAL_FEEDBACK = { show: false, type: '', message: '' };

// British/American spelling variations map
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
  // Color/colour variations
  'color': ['colour'], 'colours': ['colors'], 'colored': ['coloured'], 'coloring': ['colouring'],
  'colour': ['color'], 'colors': ['colours'], 'coloured': ['colored'], 'colouring': ['coloring'],
  // Honor/honour variations
  'honor': ['honour'], 'honors': ['honours'], 'honored': ['honoured'], 'honoring': ['honouring'],
  'honour': ['honor'], 'honours': ['honors'], 'honoured': ['honored'], 'honouring': ['honoring'],
  // Center/centre variations
  'center': ['centre'], 'centers': ['centres'], 'centered': ['centred'], 'centering': ['centring'],
  'centre': ['center'], 'centres': ['centers'], 'centred': ['centered'], 'centring': ['centering'],
  // Theater/theatre variations
  'theater': ['theatre'], 'theaters': ['theatres'], 'theatre': ['theater'], 'theatres': ['theaters'],
  // Meter/metre variations
  'meter': ['metre'], 'meters': ['metres'], 'metre': ['meter'], 'metres': ['meters']
};

function ReadingExercise({ onBack, onLogoClick, initialView = 'selection' }) {
  // State management
  const [currentView, setCurrentView] = useState(initialView);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(INITIAL_ANSWERS);
  const [checkedQuestions, setCheckedQuestions] = useState(INITIAL_CHECKED);
  const [feedback, setFeedback] = useState(INITIAL_FEEDBACK);
  const [showResults, setShowResults] = useState(false);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);

  // Derived state
  const isDirectFromLanding = initialView !== 'selection';

  // Memoised article information
  const { octopusArticleInfo, smugglingArticleInfo, airIndiaArticleInfo, waterTreatmentArticleInfo } = useMemo(() => ({
    octopusArticleInfo: getReadingArticleInfo(),
    smugglingArticleInfo: getArticleInfo(),
    airIndiaArticleInfo: getAirIndiaArticleInfo(),
    waterTreatmentArticleInfo: getWaterTreatmentArticleInfo()
  }), []);

  // Memoised questions based on current quiz type
  const questions = useMemo(() => {
    switch (currentView) {
      case 'octopus-quiz': return getReadingVocabularyQuestions();
      case 'smuggling-quiz': return getArticleQuestions();
      case 'air-india-quiz': return getAirIndiaVocabularyQuestions();
      case 'water-treatment-quiz': return getWaterTreatmentVocabularyQuestions();
      case 'standard-quiz': return staticQuestions;
      default: return [];
    }
  }, [currentView]);

  // Current question data
  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion) / 10) * 100;

  // Get alternative spellings function
  const getAlternativeSpellings = useCallback((word) => {
    const normalizedWord = word.toLowerCase();
    return SPELLING_VARIATIONS[normalizedWord] || [];
  }, []);

  // Reset quiz state function
  const resetQuizState = useCallback(() => {
    setCurrentQuestion(0);
    setUserAnswers(INITIAL_ANSWERS);
    setCheckedQuestions(INITIAL_CHECKED);
    setFeedback(INITIAL_FEEDBACK);
    setShowResults(false);
    setExerciseStartTime(Date.now());
  }, []);

  // Navigation functions
  const navigationHandlers = useMemo(() => ({
    goToArticleSelection: () => setCurrentView('article-selection'),
    startStandardQuiz: () => {
      setCurrentView('standard-quiz');
      resetQuizState();
    },
    startWordRecognition: () => {
      setCurrentView('real-fake-words');
      resetQuizState();
    },
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

  // Enter key handler for checking answers
  useEffect(() => {
    if (currentView !== 'selection' && currentView !== 'article-selection' && 
        currentView !== 'real-fake-words' && !showResults) {
      const handleKeyPress = (e) => {
        if (e.key === 'Enter' && userAnswers[currentQuestion] && !checkedQuestions[currentQuestion]) {
          checkAnswer();
        }
      };

      document.addEventListener('keypress', handleKeyPress);
      return () => document.removeEventListener('keypress', handleKeyPress);
    }
  }, [userAnswers, currentQuestion, checkedQuestions, currentView, showResults]);

  // Answer checking logic
  const checkAnswer = useCallback(() => {
    const userAnswer = userAnswers[currentQuestion].toLowerCase().trim();
    const correctAnswer = currentQuestionData.answer.toLowerCase();
    const alternativeAnswers = getAlternativeSpellings(currentQuestionData.answer);
    const isCorrect = userAnswer === correctAnswer || alternativeAnswers.includes(userAnswer);

    if (isCorrect) {
      const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      setFeedback({ show: true, type: 'correct', message: randomMessage });
      
      setCheckedQuestions(prev => {
        const newChecked = [...prev];
        newChecked[currentQuestion] = true;
        return newChecked;
      });
    } else {
      setFeedback({ 
        show: true, 
        type: 'incorrect', 
        message: `💡 Hint: ${currentQuestionData.hint}` 
      });
    }
  }, [userAnswers, currentQuestion, currentQuestionData, getAlternativeSpellings]);

  // Answer update handler
  const updateAnswer = useCallback((value) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = value;
      return newAnswers;
    });
  }, [currentQuestion]);

  // Navigation handlers
  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setFeedback(INITIAL_FEEDBACK);
    }
  }, [currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion === 9) {
      // Finish quiz and record results
      finishQuiz();
    } else {
      setCurrentQuestion(prev => prev + 1);
      setFeedback(INITIAL_FEEDBACK);
    }
  }, [currentQuestion]);

  // Score calculation
  const calculateScore = useCallback(() => {
    return userAnswers.slice(0, 10).reduce((score, answer, index) => {
      if (!answer) return score;
      
      const userAnswer = answer.toLowerCase().trim();
      const correctAnswer = questions[index].answer.toLowerCase();
      const alternativeAnswers = getAlternativeSpellings(questions[index].answer);
      
      if (userAnswer === correctAnswer || alternativeAnswers.includes(userAnswer)) {
        return score + 1;
      }
      return score;
    }, 0);
  }, [userAnswers, questions, getAlternativeSpellings]);

  // NEW: Finish quiz and record progress
  const finishQuiz = useCallback(() => {
    console.log('🏁 Finishing reading vocabulary exercise');
    
    const score = calculateScore();
    const testDuration = exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 1000) : 0;
    
    // Determine quiz type for progress tracking
    let quizType = 'standard-vocabulary';
    if (['octopus-quiz', 'smuggling-quiz', 'air-india-quiz', 'water-treatment-quiz'].includes(currentView)) {
      quizType = 'article-vocabulary';
    }
    
    try {
      // Prepare user answers for progress tracking
      const formattedAnswers = userAnswers.slice(0, 10).map((answer, index) => ({
        answer: answer || '',
        correct: answer && answer.toLowerCase().trim() === questions[index].answer.toLowerCase(),
        score: answer && answer.toLowerCase().trim() === questions[index].answer.toLowerCase() ? 100 : 0,
        level: questions[index].level || 'B1'
      }));

      // Record test result - this automatically increments daily targets
      recordTestResult({
        quizType: quizType,
        score: score,
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: testDuration,
        userAnswers: formattedAnswers
      });
      
      console.log(`✅ ${quizType} test result recorded: ${score}/10`);
    } catch (error) {
      console.error('Error recording test result:', error);
    }

    setShowResults(true);
  }, [calculateScore, exerciseStartTime, currentView, userAnswers, questions]);

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
    const isArticleTest = ['octopus-quiz', 'smuggling-quiz', 'air-india-quiz', 'water-treatment-quiz'].includes(currentView);
    
    const getCurrentArticleInfo = () => {
      if (currentView === 'octopus-quiz') return octopusArticleInfo;
      if (currentView === 'smuggling-quiz') return smugglingArticleInfo;
      if (currentView === 'air-india-quiz') return airIndiaArticleInfo;
      if (currentView === 'water-treatment-quiz') return waterTreatmentArticleInfo;
      return null;
    };

    const currentArticleInfo = getCurrentArticleInfo();
    const percentage = Math.round((score / 10) * 100);

    // Get level and feedback based on score
    const getLevelInfo = (score) => {
      if (score <= 2) {
        return {
          level: "A1-A2 (Elementary)",
          description: "You're building your foundation!",
          feedback: "Keep practising basic vocabulary and common phrases. Focus on everyday words and simple sentence structures."
        };
      } else if (score <= 4) {
        return {
          level: "A2-B1 (Pre-Intermediate)",
          description: "You're making good progress!",
          feedback: "Continue expanding your vocabulary with more complex words. Practice reading simple texts and engaging in basic conversations."
        };
      } else if (score <= 6) {
        return {
          level: "B1-B2 (Intermediate)",
          description: "You have a solid vocabulary base!",
          feedback: "Focus on advanced vocabulary and expressions. Try reading news articles and academic texts to challenge yourself further."
        };
      } else if (score <= 8) {
        return {
          level: "B2-C1 (Upper-Intermediate)",
          description: "Excellent vocabulary knowledge!",
          feedback: "You demonstrate strong command of English vocabulary. Continue with advanced materials and specialised terminology in your areas of interest."
        };
      } else {
        return {
          level: "C1-C2 (Advanced)",
          description: "Outstanding vocabulary mastery!",
          feedback: "Your vocabulary knowledge is impressive! Keep challenging yourself with complex texts and specialised vocabulary in different fields."
        };
      }
    };

    const levelInfo = getLevelInfo(score);

    return (
      <div className="exercise-page scrollable-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        
        <div className="quiz-container">
          <h1>📖 Reading Exercise Results</h1>
          
          <div className="results">
            <h2>🎉 Quiz Complete!</h2>
            <div className="score-display">{score}/10</div>
            <div className="score-percentage">({percentage}%)</div>
            
            <div className="level-estimate">
              <h3>{isArticleTest ? '📰 Article-Based' : '📚 Standard'} Vocabulary Test</h3>
              <p><strong>{levelInfo.level}</strong></p>
              <p>{levelInfo.description}</p>
              {isArticleTest && currentArticleInfo && (
                <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
                  Based on: "{currentArticleInfo.title}"
                </p>
              )}
            </div>

            <div className="feedback-message">
              <strong>Well done!</strong> You've practised {isArticleTest ? 'vocabulary from a current BBC article' : 'standard English vocabulary'}. 
              {isArticleTest && ' This helps you learn words in context from real news stories.'}
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

  // Render Quiz Interface
  if (currentView !== 'selection') {
    const processedData = processSentence(currentQuestionData.sentence, currentQuestionData.answer);
    
    const getCurrentArticleInfo = () => {
      if (currentView === 'octopus-quiz') return octopusArticleInfo;
      if (currentView === 'smuggling-quiz') return smugglingArticleInfo;
      if (currentView === 'air-india-quiz') return airIndiaArticleInfo;
      if (currentView === 'water-treatment-quiz') return waterTreatmentArticleInfo;
      return null;
    };

    const currentArticleInfo = getCurrentArticleInfo();

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
              📖 {currentArticleInfo ? 'Article-Based' : 'Standard'} Vocabulary Exercise
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
            <div className="level-badge">{currentQuestionData.level}</div>
          </div>

          <div className="question-section">
            <div className="question-text">
              {processedData.beforeGap}
              <div className="letter-input-wrapper">
                <LetterInput
                  word={currentQuestionData.answer}
                  value={userAnswers[currentQuestion]}
                  onChange={updateAnswer}
                  disabled={checkedQuestions[currentQuestion]}
                  className={feedback.show ? feedback.type : ''}
                  onEnterPress={!checkedQuestions[currentQuestion] && userAnswers[currentQuestion] ? checkAnswer : null}
                />
              </div>
              {processedData.afterGap}
            </div>

            {currentQuestionData.context && (
              <div className="question-context">
                <small>📰 {currentQuestionData.context}</small>
              </div>
            )}
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

  // Render Main Selection View
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
          <p>General vocabulary across different CEFR levels (A2-C1)</p>
          <div className="card-details">
            <span>• 10 questions</span>
            <span>• Mixed topics</span>
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
        <h3>💡 Why Practice Reading Vocabulary?</h3>
        <p>Building vocabulary through reading helps you understand context, improve comprehension, and learn how words are used naturally in English. Word recognition exercises train your brain to quickly identify real English words from fake ones.</p>
      </div>

      <button className="btn btn-secondary" onClick={onBack}>
        ← Back to Exercise Selection
      </button>
    </div>
  );
}

export default ReadingExercise;
