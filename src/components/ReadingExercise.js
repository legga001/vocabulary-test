// src/components/ReadingExercise.js - Complete file with Real/Fake Words integration
import React, { useState } from 'react';
import { getReadingVocabularyQuestions, getReadingArticleInfo } from '../readingVocabularyData';
import { getArticleQuestions, getArticleInfo } from '../articleQuestions';
import { questions as staticQuestions } from '../questionsData';
import { correctMessages } from '../questionsData';
import AnswerReview from './AnswerReview';
import ArticleSelection from './ArticleSelection';
import RealFakeWordsExercise from './RealFakeWordsExercise';

function ReadingExercise({ onBack }) {
  const [currentView, setCurrentView] = useState('selection'); // 'selection', 'article-selection', 'octopus-quiz', 'smuggling-quiz', 'standard-quiz', 'real-fake-words'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(10).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(10).fill(false));
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [showResults, setShowResults] = useState(false);

  // Get article info for displays
  const octopusArticleInfo = getReadingArticleInfo();
  const smugglingArticleInfo = getArticleInfo();

  // Get questions based on current quiz type
  const getQuestionsForCurrentQuiz = () => {
    if (currentView === 'octopus-quiz') return getReadingVocabularyQuestions();
    if (currentView === 'smuggling-quiz') return getArticleQuestions();
    if (currentView === 'standard-quiz') return staticQuestions;
    return [];
  };

  const questions = getQuestionsForCurrentQuiz();
  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / 10) * 100;

  // Navigation functions
  const goToArticleSelection = () => {
    setCurrentView('article-selection');
  };

  const startStandardQuiz = () => {
    setCurrentView('standard-quiz');
    resetQuizState();
  };

  const startWordRecognition = () => {
    setCurrentView('real-fake-words');
    resetQuizState();
  };

  const startArticleQuiz = (articleType) => {
    setCurrentView(articleType);
    resetQuizState();
  };

  const resetQuizState = () => {
    setCurrentQuestion(0);
    setUserAnswers(new Array(10).fill(''));
    setCheckedQuestions(new Array(10).fill(false));
    setFeedback({ show: false, type: '', message: '' });
    setShowResults(false);
  };

  const backToSelection = () => {
    setCurrentView('selection');
    resetQuizState();
  };

  const backToArticleSelection = () => {
    setCurrentView('article-selection');
    resetQuizState();
  };

  // Show the Real/Fake Words exercise
  if (currentView === 'real-fake-words') {
    return <RealFakeWordsExercise onBack={backToSelection} />;
  }

  // Quiz logic (same as before)
  const processGap = (sentence, answer) => {
    const newFormatMatch = sentence.match(/([a-zA-Z])_+([a-zA-Z])/);
    if (newFormatMatch) {
      const gapLength = answer.length;
      const blanks = '_'.repeat(gapLength);
      return sentence.replace(/([a-zA-Z])_+([a-zA-Z])/, blanks);
    }
    
    const oldFormatMatch = sentence.match(/([a-zA-Z])_([a-zA-Z])/);
    if (oldFormatMatch) {
      return sentence.replace(/([a-zA-Z])_([a-zA-Z])/, '___');
    }
    
    return sentence;
  };

  const getPlaceholder = (sentence, answer) => {
    const newFormatMatch = sentence.match(/([a-zA-Z])_+([a-zA-Z])/);
    if (newFormatMatch) {
      const firstLetter = newFormatMatch[1];
      const lastLetter = newFormatMatch[2];
      const middleLength = answer.length - 2;
      const middleUnderscores = '_'.repeat(middleLength);
      return `${firstLetter}${middleUnderscores}${lastLetter} (${answer.length})`;
    }
    
    const oldFormatMatch = sentence.match(/([a-zA-Z])_([a-zA-Z])/);
    if (oldFormatMatch) {
      return `${oldFormatMatch[1]}_${oldFormatMatch[2]} (${answer.length})`;
    }
    
    return `(${answer.length} letters)`;
  };

  const checkAnswer = () => {
    const userAnswer = userAnswers[currentQuestion].toLowerCase().trim();
    const correctAnswer = question.answer.toLowerCase();

    if (userAnswer === correctAnswer) {
      const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      setFeedback({ show: true, type: 'correct', message: randomMessage });
    } else {
      setFeedback({ show: true, type: 'incorrect', message: `💡 Hint: ${question.hint}` });
    }

    const newChecked = [...checkedQuestions];
    newChecked[currentQuestion] = true;
    setCheckedQuestions(newChecked);
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
      setShowResults(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback({ show: false, type: '', message: '' });
    }
  };
    
  const calculateScore = () => {
    let score = 0;
    for (let i = 0; i < 10; i++) {
      if (userAnswers && userAnswers[i] && 
          userAnswers[i].toLowerCase().trim() === questions[i].answer.toLowerCase()) {
        score++;
      }
    }
    return score;
  };

  // Article Selection View
  if (currentView === 'article-selection') {
    return (
      <ArticleSelection 
        onBack={backToSelection}
        onSelectArticle={startArticleQuiz}
      />
    );
  }

  // Results view
  if (showResults) {
    const score = calculateScore();
    const isArticleTest = currentView === 'octopus-quiz' || currentView === 'smuggling-quiz';
    const currentArticleInfo = currentView === 'octopus-quiz' ? octopusArticleInfo : smugglingArticleInfo;

    return (
      <div className="exercise-page">
        <div className="logo-container">
          <img 
            src="/purple_fox_transparent.png" 
            alt="Mr. Fox English" 
            className="app-logo"
          />
        </div>
        
        <h1>📖 Reading Exercise Results</h1>
        
        <div className="results">
          <h2>🎉 Quiz Complete!</h2>
          <div className="score-display">{score}/10</div>
          
          <div className="level-estimate">
            <h3>{isArticleTest ? '📰 Article-Based' : '📚 Standard'} Vocabulary Test</h3>
            {isArticleTest && <p>Based on: "{currentArticleInfo.title}"</p>}
          </div>

          <AnswerReview 
            questions={questions}
            userAnswers={userAnswers}
            title="Your Answers"
          />
          
          <div className="feedback-message">
            <strong>Well done!</strong> You've practised {isArticleTest ? 'vocabulary from a current BBC article' : 'standard English vocabulary'}. 
            {isArticleTest && ' This helps you learn words in context from real news stories.'}
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={backToSelection}>
              Try Another Test
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz view
  if (currentView !== 'selection') {
    const processedSentence = processGap(question.sentence, question.answer);
    const placeholder = getPlaceholder(question.sentence, question.answer);

    // Get article info for current quiz
    const getCurrentArticleInfo = () => {
      if (currentView === 'octopus-quiz') return octopusArticleInfo;
      if (currentView === 'smuggling-quiz') return smugglingArticleInfo;
      return null;
    };

    const currentArticleInfo = getCurrentArticleInfo();

    return (
 
    {/* Article Link Button - Only show for article-based tests */}
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
          <div className="level-badge">{question.level}</div>
        </div>

        <div className="question-text">{processedSentence}</div>

        {/* Show context for article-based questions */}
        {question.context && (
          <div className="question-context">
            <small>📰 {question.context}</small>
          </div>
        )}

        <div className="input-container">
          <input
            type="text"
            className={`answer-input ${feedback.show ? feedback.type : ''}`}
            value={userAnswers[currentQuestion]}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
          />
          {feedback.show && (
            <div className={`feedback ${feedback.type}`}>
              {feedback.message}
            </div>
          )}
        </div>

        <button className="btn" onClick={checkAnswer}>
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

        {/* Back button */}
        <div className="quiz-footer">
          <button 
            className="btn btn-secondary btn-small" 
            onClick={currentArticleInfo ? backToArticleSelection : backToSelection}
          >
            ← Back to {currentArticleInfo ? 'Article Selection' : 'Reading Options'}
          </button>
        </div>
      </div>
    );
  }

  // Main Selection view (Reading page) - NOW WITH 3 CARDS
  return (
    <div className="exercise-page">
      <div className="logo-container">
        <img 
          src="/purple_fox_transparent.png" 
          alt="Mr. Fox English" 
          className="app-logo"
        />
      </div>
      
      <h1>📖 Reading Exercises</h1>
      
      <div className="welcome-text">
        <p>Choose your reading exercise type:</p>
      </div>

      <div className="reading-main-options">
        {/* Standard Vocabulary Test */}
        <div className="reading-main-card" onClick={startStandardQuiz}>
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

        {/* Article-Based Tests */}
        <div className="reading-main-card" onClick={goToArticleSelection}>
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

        {/* NEW: Real or Fake Words */}
        <div className="reading-main-card featured-card" onClick={startWordRecognition}>
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
