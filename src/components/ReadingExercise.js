import React, { useState, useEffect, useCallback } from 'react';
import ClickableLogo from './ClickableLogo';

function ReadingExercise({ onBack, onLogoClick, initialView = 'selection' }) {
  // Basic state
  const [currentView, setCurrentView] = useState(initialView);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [checkedQuestions, setCheckedQuestions] = useState([]);
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [showResults, setShowResults] = useState(false);

  // Initialize arrays
  useEffect(() => {
    setUserAnswers(new Array(10).fill(''));
    setCheckedQuestions(new Array(10).fill(false));
  }, []);

  // Safe question loading
  const loadQuestions = useCallback((viewType) => {
    console.log('Loading questions for:', viewType);
    
    try {
      let newQuestions = [];
      
      if (viewType === 'standard-quiz') {
        // Try to load standard questions
        try {
          const { getNewQuestions } = require('../questionsData');
          newQuestions = getNewQuestions();
        } catch (error) {
          console.error('Failed to load standard questions:', error);
          newQuestions = createFallbackQuestions('Standard Quiz');
        }
      } else if (viewType === 'killer-whale-quiz') {
        // Try to load killer whale questions
        try {
          const { getKillerWhaleVocabularyQuestions } = require('../killerWhaleVocabularyData');
          newQuestions = getKillerWhaleVocabularyQuestions();
        } catch (error) {
          console.error('Failed to load killer whale questions:', error);
          newQuestions = createFallbackQuestions('Killer Whale Quiz');
        }
      } else if (viewType === 'octopus-quiz') {
        // Try to load octopus questions
        try {
          const { getReadingVocabularyQuestions } = require('../readingVocabularyData');
          newQuestions = getReadingVocabularyQuestions();
        } catch (error) {
          console.error('Failed to load octopus questions:', error);
          newQuestions = createFallbackQuestions('Octopus Quiz');
        }
      } else if (viewType === 'smuggling-quiz') {
        // Try to load smuggling questions
        try {
          const { getArticleQuestions } = require('../articleQuestions');
          newQuestions = getArticleQuestions();
        } catch (error) {
          console.error('Failed to load smuggling questions:', error);
          newQuestions = createFallbackQuestions('Smuggling Quiz');
        }
      } else if (viewType === 'air-india-quiz') {
        // Try to load air india questions
        try {
          const { getAirIndiaVocabularyQuestions } = require('../airIndiaVocabularyData');
          newQuestions = getAirIndiaVocabularyQuestions();
        } catch (error) {
          console.error('Failed to load air india questions:', error);
          newQuestions = createFallbackQuestions('Air India Quiz');
        }
      } else if (viewType === 'water-treatment-quiz') {
        // Try to load water treatment questions
        try {
          const { getWaterTreatmentVocabularyQuestions } = require('../waterTreatmentVocabularyData');
          newQuestions = getWaterTreatmentVocabularyQuestions();
        } catch (error) {
          console.error('Failed to load water treatment questions:', error);
          newQuestions = createFallbackQuestions('Water Treatment Quiz');
        }
      }
      
      console.log(`Loaded ${newQuestions.length} questions for ${viewType}`);
      return newQuestions;
    } catch (error) {
      console.error('Error in loadQuestions:', error);
      return createFallbackQuestions('Error Quiz');
    }
  }, []);

  // Create fallback questions if data files fail
  const createFallbackQuestions = (quizType) => {
    return [
      {
        id: 1,
        sentence: `This is a test question for ${quizType}. Please type the word "_______" in the blank.`,
        answer: 'test',
        hint: 'A simple four-letter word meaning trial or examination',
        level: 'A2'
      }
    ];
  };

  // Load questions when view changes
  useEffect(() => {
    const quizTypes = ['standard-quiz', 'killer-whale-quiz', 'octopus-quiz', 'smuggling-quiz', 'air-india-quiz', 'water-treatment-quiz'];
    
    if (quizTypes.includes(currentView)) {
      const newQuestions = loadQuestions(currentView);
      setQuestions(newQuestions);
      setCurrentQuestion(0);
      setUserAnswers(new Array(10).fill(''));
      setCheckedQuestions(new Array(10).fill(false));
      setFeedback({ show: false, type: '', message: '' });
      setShowResults(false);
    }
  }, [currentView, loadQuestions]);

  // Navigation functions
  const goBack = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentView('selection');
    }
  };

  const goToArticleSelection = () => {
    setCurrentView('article-selection');
  };

  const startStandardQuiz = () => {
    setCurrentView('standard-quiz');
  };

  const startArticleQuiz = (articleType) => {
    setCurrentView(articleType);
  };

  // Quiz functions
  const handleInputChange = (value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
    
    if (feedback.show) {
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  const checkAnswer = () => {
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
  };

  const nextQuestion = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback({ show: false, type: '', message: '' });
    } else {
      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  };

  // Simple ArticleSelection component
  const renderArticleSelection = () => {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📰 Article-Based Vocabulary</h1>
          <p>Choose an article to practice vocabulary from current BBC news:</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '20px auto' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => startArticleQuiz('killer-whale-quiz')}
              style={{ padding: '15px', fontSize: '1.1em' }}
            >
              🐋 Killer whales 'massage' each other using kelp
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={() => startArticleQuiz('octopus-quiz')}
              style={{ padding: '15px', fontSize: '1.1em' }}
            >
              🐙 Octopus Article
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={() => startArticleQuiz('smuggling-quiz')}
              style={{ padding: '15px', fontSize: '1.1em' }}
            >
              🚢 Smuggling Article
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={() => startArticleQuiz('air-india-quiz')}
              style={{ padding: '15px', fontSize: '1.1em' }}
            >
              ✈️ Air India Article
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={() => startArticleQuiz('water-treatment-quiz')}
              style={{ padding: '15px', fontSize: '1.1em' }}
            >
              💧 Water Treatment Article
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={goBack}
              style={{ padding: '15px', fontSize: '1.1em' }}
            >
              ← Back to Reading Options
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Simple Results component
  const renderResults = () => {
    const score = userAnswers.slice(0, 10).reduce((total, answer, index) => {
      if (answer && questions[index] && answer.toLowerCase().trim() === questions[index].answer.toLowerCase()) {
        return total + 1;
      }
      return total;
    }, 0);

    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎉 Quiz Complete!</h1>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <div style={{ fontSize: '3em', fontWeight: 'bold', color: '#4c51bf' }}>
              {score}/10
            </div>
            <div style={{ fontSize: '1.5em', color: '#666' }}>
              ({Math.round((score / 10) * 100)}%)
            </div>
          </div>
          
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
            <h3>Your Answers:</h3>
            {questions.slice(0, 10).map((q, i) => (
              <div key={i} style={{ marginBottom: '10px', padding: '8px', background: 'white', borderRadius: '5px' }}>
                <strong>Q{i + 1}:</strong> {userAnswers[i] || '(no answer)'} 
                {userAnswers[i] && userAnswers[i].toLowerCase().trim() === q.answer.toLowerCase() ? 
                  <span style={{ color: 'green', marginLeft: '10px' }}>✅ Correct</span> : 
                  <span style={{ color: 'red', marginLeft: '10px' }}>❌ Correct answer: {q.answer}</span>
                }
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn btn-primary" 
              onClick={goBack}
              style={{ marginRight: '10px', padding: '12px 24px' }}
            >
              Try Another Test
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.reload()}
              style={{ padding: '12px 24px' }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Simple Quiz Interface
  const renderQuiz = () => {
    if (questions.length === 0) {
      return (
        <div className="exercise-page">
          <ClickableLogo onLogoClick={onLogoClick} />
          <div className="quiz-container">
            <h1>📚 Loading Quiz...</h1>
            <p>Loading questions for {currentView.replace('-', ' ')}...</p>
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

    // Simple sentence processing
    const sentence = currentQuestionData.sentence || '';
    const parts = sentence.split('_______');
    const beforeBlank = parts[0] || sentence;
    const afterBlank = parts[1] || '';

    const progress = ((currentQuestion + 1) / 10) * 100;

    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        
        <div className="quiz-container">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ background: '#4c51bf', color: 'white', padding: '10px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px' }}>
              📖 {currentView.replace('-quiz', '').replace('-', ' ').toUpperCase()} QUIZ
            </div>
            
            <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '8px', marginBottom: '10px' }}>
              <div style={{ 
                background: '#4c51bf', 
                height: '100%', 
                borderRadius: '10px', 
                width: `${progress}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            
            <div style={{ textAlign: 'center', fontSize: '0.9em', color: '#666' }}>
              Question {currentQuestion + 1} of 10
            </div>
          </div>

          <div style={{ margin: '30px 0' }}>
            <div style={{ 
              fontSize: '1.3em', 
              lineHeight: '1.6', 
              padding: '20px', 
              background: '#f8f9fa', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <span>{beforeBlank}</span>
              <input 
                type="text" 
                value={userAnswers[currentQuestion] || ''} 
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={checkedQuestions[currentQuestion]}
                placeholder="Type your answer..."
                style={{ 
                  padding: '8px 12px', 
                  border: '2px solid #4c51bf', 
                  borderRadius: '6px',
                  fontSize: '1.1em',
                  minWidth: '150px',
                  background: checkedQuestions[currentQuestion] ? '#f0f0f0' : 'white'
                }}
              />
              <span>{afterBlank}</span>
            </div>
          </div>

          <div style={{ 
            background: '#f0f8ff', 
            padding: '15px', 
            borderRadius: '8px', 
            margin: '20px 0',
            borderLeft: '4px solid #4c51bf'
          }}>
            💡 <strong>Hint:</strong> {currentQuestionData.hint}
          </div>

          {feedback.show && (
            <div style={{ 
              padding: '15px', 
              borderRadius: '8px', 
              margin: '20px 0',
              background: feedback.type === 'correct' ? '#e8f5e8' : '#ffebee',
              color: feedback.type === 'correct' ? '#2e7d32' : '#c62828',
              border: `2px solid ${feedback.type === 'correct' ? '#4caf50' : '#f44336'}`
            }}>
              <strong>{feedback.message}</strong>
            </div>
          )}

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <button 
              className="btn btn-primary" 
              onClick={checkedQuestions[currentQuestion] ? nextQuestion : checkAnswer}
              disabled={!userAnswers[currentQuestion] && !checkedQuestions[currentQuestion]}
              style={{ fontSize: '1.2em', padding: '12px 30px', marginBottom: '15px' }}
            >
              {checkedQuestions[currentQuestion] ? 
                (currentQuestion === 9 ? 'Finish Quiz' : 'Next Question') : 
                'Check Answer'
              }
            </button>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
                {currentQuestion === 9 ? 'Finish' : 'Next'} →
              </button>
            </div>
          </div>

          <div style={{ 
            textAlign: 'center', 
            paddingTop: '20px', 
            borderTop: '1px solid #eee' 
          }}>
            <button className="btn btn-secondary btn-small" onClick={goBack}>
              ← Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  console.log('Rendering ReadingExercise, view:', currentView);

  // Handle different views
  if (currentView === 'article-selection') {
    return renderArticleSelection();
  }

  if (showResults) {
    return renderResults();
  }

  const quizTypes = ['standard-quiz', 'killer-whale-quiz', 'octopus-quiz', 'smuggling-quiz', 'air-india-quiz', 'water-treatment-quiz'];
  if (quizTypes.includes(currentView)) {
    return renderQuiz();
  }

  // Default selection view
  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <h1>📖 Reading Exercises</h1>
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <p>Choose your reading exercise type:</p>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px', 
        maxWidth: '500px', 
        margin: '30px auto' 
      }}>
        <div 
          onClick={startStandardQuiz} 
          style={{ 
            cursor: 'pointer', 
            padding: '25px', 
            border: '2px solid #ddd', 
            borderRadius: '15px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            background: 'white'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#4c51bf';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#ddd';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>📚</div>
          <h3>Standard Vocabulary</h3>
          <p>Random selection from 100+ exercises across CEFR levels (A2-C1)</p>
        </div>

        <div 
          onClick={goToArticleSelection} 
          style={{ 
            cursor: 'pointer', 
            padding: '25px', 
            border: '2px solid #ddd', 
            borderRadius: '15px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            background: 'white'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#4c51bf';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#ddd';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>📰</div>
          <h3>Article-Based Vocabulary</h3>
          <p>Vocabulary from current BBC news articles</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="btn btn-secondary" onClick={goBack}>
          ← Back to Exercise Selection
        </button>
      </div>
    </div>
  );
}

export default ReadingExercise;
