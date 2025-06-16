// src/components/ReadingExercise.js - Updated with random vocabulary pool integration
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getReadingVocabularyQuestions, getReadingArticleInfo } from '../readingVocabularyData';
import { getAirIndiaVocabularyQuestions, getAirIndiaArticleInfo } from '../airIndiaVocabularyData';
import { getWaterTreatmentVocabularyQuestions, getWaterTreatmentArticleInfo } from '../waterTreatmentVocabularyData';
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
  const [questions, setQuestions] = useState([]);

  // Derived state
  const isDirectFromLanding = initialView !== 'selection';

  // Memoised article information
  const { octopusArticleInfo, smugglingArticleInfo, airIndiaArticleInfo, waterTreatmentArticleInfo } = useMemo(() => ({
    octopusArticleInfo: getReadingArticleInfo(),
    smugglingArticleInfo: getArticleInfo(),
    airIndiaArticleInfo: getAirIndiaArticleInfo(),
    waterTreatmentArticleInfo: getWaterTreatmentArticleInfo()
  }), []);

  // Load questions when view changes
  useEffect(() => {
    let newQuestions = [];
    
    switch (currentView) {
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
        // Generate fresh random questions for standard vocabulary tests
        newQuestions = getNewQuestions();
        console.log('📚 Generated new random vocabulary test for reading exercise:', newQuestions.map(q => ({
          level: q.level,
          word: q.answer
        })));
        break;
      default:
        newQuestions = [];
    }
    
    setQuestions(newQuestions);
  }, [currentView]);

  // Current question data
  const currentQuestionData = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion) / 10) * 100 : 0;

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
        currentView !== 'real-fake-words' && !showResults && currentQuestionData) {
      const handleKeyPress = (e) => {
        if (e.key === 'Enter' && userAnswers[currentQuestion] && !checkedQuestions[currentQuestion]) {
          checkAnswer();
        }
      };

      document.addEventListener('keypress', handleKeyPress);
      return () => document.removeEventListener('keypress', handleKeyPress);
    }
  }, [userAnswers, currentQuestion, checkedQuestions, currentView, showResults, currentQuestionData]);

  // Answer checking logic with enhanced British/American spelling support
  const checkAnswer = useCallback(() => {
    if (!currentQuestionData) return;

    console.log('🔍 READING EXERCISE - CHECKING ANSWER:', {
      answer: currentQuestionData.answer,
      level: currentQuestionData.level,
      sentence: currentQuestionData.sentence ? currentQuestionData.sentence.substring(0, 50) + '...' : 'NO SENTENCE',
      hint: currentQuestionData.hint || 'NO HINT PROPERTY',
      hasHint: !!currentQuestionData.hint,
      allProperties: Object.keys(currentQuestionData)
    });

    const userAnswer = userAnswers[currentQuestion].toLowerCase().trim();
    const correctAnswer = currentQuestionData.answer.toLowerCase();
    
    // Get alternative spellings for both the correct answer AND the user's answer
    const correctAnswerAlternatives = getAlternativeSpellings(currentQuestionData.answer);
    const userAnswerAlternatives = getAlternativeSpellings(userAnswer);
    
    // Check if answer is correct in multiple ways:
    // 1. Direct match
    // 2. User's answer matches an alternative spelling of the correct answer
    // 3. Correct answer matches an alternative spelling of the user's answer
    const isCorrect = userAnswer === correctAnswer || 
                     correctAnswerAlternatives.includes(userAnswer) ||
                     userAnswerAlternatives.includes(correctAnswer);

    if (isCorrect) {
      const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      console.log('✅ READING EXERCISE - SETTING CORRECT FEEDBACK:', randomMessage);
      setFeedback({ show: true, type: 'correct', message: randomMessage });
      
      setCheckedQuestions(prev => {
        const newChecked = [...prev];
        newChecked[currentQuestion] = true;
        return newChecked;
      });
    } else {
      const hintText = currentQuestionData.hint || "Try to think about the context of the sentence.";
      const feedbackMessage = `💡 Hint: ${hintText}`;
      console.log('❌ READING EXERCISE - SETTING INCORRECT FEEDBACK:', feedbackMessage);
      
      const newFeedback = { show: true, type: 'incorrect', message: feedbackMessage };
      console.log('❌ READING EXERCISE - NEW FEEDBACK OBJECT:', newFeedback);
      setFeedback(newFeedback);
    }
  }, [userAnswers, currentQuestion, currentQuestionData, getAlternativeSpellings]);

  // Answer update handler
  const updateAnswer = useCallback((value) => {
    console.log('✏️ UPDATING ANSWER - Current feedback state:', { 
      show: feedback.show, 
      type: feedback.type, 
      message: feedback.message ? feedback.message.substring(0, 30) + '...' : 'NO MESSAGE'
    });
    
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = value;
      return newAnswers;
    });
    
    // Don't clear feedback when typing - only clear on navigation
    // setFeedback(INITIAL_FEEDBACK); // REMOVED - this was clearing hints!
  }, [currentQuestion, feedback]);

  // Navigation handlers
  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      console.log('🔄 PREVIOUS QUESTION - Clearing feedback');
      setFeedback(INITIAL_FEEDBACK);
    }
  }, [currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion === 9) {
      // Finish quiz and record results
      finishQuiz();
    } else {
      setCurrentQuestion(prev => prev + 1);
      console.log('🔄 NEXT QUESTION - Clearing feedback');
      setFeedback(INITIAL_FEEDBACK);
    }
  }, [currentQuestion]);

  // Enhanced score calculation with bidirectional spelling support
  const calculateScore = useCallback(() => {
    return userAnswers.slice(0, 10).reduce((score, answer, index) => {
      if (!answer || !questions[index]) return score;
      
      const userAnswer = answer.toLowerCase().trim();
      const correctAnswer = questions[index].answer.toLowerCase();
      
      // Get alternative spellings for both directions
      const correctAnswerAlternatives = getAlternativeSpellings(questions[index].answer);
      const userAnswerAlternatives = getAlternativeSpellings(userAnswer);
      
      // Check if answer is correct in multiple ways
      const isCorrect = userAnswer === correctAnswer || 
                       correctAnswerAlternatives.includes(userAnswer) ||
                       userAnswerAlternatives.includes(correctAnswer);
      
      return isCorrect ? score + 1 : score;
    }, 0);
  }, [userAnswers, questions, getAlternativeSpellings]);

  // Finish quiz and record progress
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
      // Prepare user answers for progress tracking with enhanced spelling support
      const formattedAnswers = userAnswers.slice(0, 10).map((answer, index) => {
        if (!answer || !questions[index]) return { answer: '', correct: false, score: 0, level: 'B1' };
        
        const userAnswer = answer.toLowerCase().trim();
        const correctAnswer = questions[index].answer.toLowerCase();
        
        // Enhanced spelling check - bidirectional
        const correctAnswerAlternatives = getAlternativeSpellings(questions[index].answer);
        const userAnswerAlternatives = getAlternativeSpellings(userAnswer);
        
        const isCorrect = userAnswer === correctAnswer || 
                         correctAnswerAlternatives.includes(userAnswer) ||
                         userAnswerAlternatives.includes(correctAnswer);
        
        return {
          answer: answer,
          correct: isCorrect,
          score: isCorrect ? 100 : 0,
          level: questions[index].level || 'B1'
        };
      });

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
  }, [calculateScore, exerciseStartTime, currentView, userAnswers, questions, getAlternativeSpellings]);

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
              <strong>Well done!</strong> You've practised {isArticleTest ? 'vocabulary from a current BBC article' : 'vocabulary from our extensive question pool'}. 
              {isArticleTest ? ' This helps you learn words in context from real news stories.' : ' Each test uses randomly selected questions from 100 exercises across all CEFR levels.'}
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

  // Show loading state while questions are being loaded
  if ((currentView === 'standard-quiz' || currentView === 'octopus-quiz' || currentView === 'smuggling-quiz' || 
       currentView === 'air-india-quiz' || currentView === 'water-treatment-quiz') && questions.length === 0) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📖 Reading Exercise</h1>
          <div className="loading-state">
            <p>🎲 Generating your vocabulary test...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Quiz Interface
  if (currentView !== 'selection' && questions.length > 0 && currentQuestionData) {
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

          {/* ALWAYS VISIBLE TEST - This should ALWAYS show */}
          <div style={{
            background: 'red',
            color: 'white',
            padding: '20px',
            margin: '20px 0',
            fontSize: '20px',
            fontWeight: 'bold',
            border: '5px solid black',
            textAlign: 'center'
          }}>
            🚨 ALWAYS VISIBLE TEST BOX 🚨<br/>
            If you can see this, you're in ReadingExercise component
          </div>

          {feedback.show && (
            <div 
              className={`feedback ${feedback.type}`}
              style={{
                background: feedback.type === 'correct' ? '#d4edda' : '#f8d7da',
                color: feedback.type === 'correct' ? '#155724' : '#721c24',
                border: feedback.type === 'correct' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                padding: '12px',
                borderRadius: '8px',
                margin: '15px 0',
                fontSize: '16px',
                fontWeight: '500',
                minHeight: '20px'
              }}
            >
              {feedback.message || 'NO MESSAGE FOUND'}
            </div>
          )}

          {/* Debug feedback state - remove this after testing */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ 
              background: '#f0f0f0', 
              padding: '10px', 
              margin: '10px 0', 
              fontSize: '12px',
              border: '1px solid #ccc' 
            }}>
              <strong>🐛 READING EXERCISE Debug Info:</strong><br/>
              Feedback Show: {feedback.show ? 'YES' : 'NO'}<br/>
              Feedback Type: {feedback.type}<br/>
              Feedback Message: {feedback.message}<br/>
              Current Question: {currentQuestion + 1}<br/>
              Question Answer: {currentQuestionData?.answer}<br/>
              Question Hint: {currentQuestionData?.hint || 'NO HINT'}
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

export default ReadingExercise;
