// src/components/ReadingExercise.js
import React, { useState } from 'react';
import { getReadingVocabularyQuestions, getReadingArticleInfo } from '../readingVocabularyData';
import { correctMessages } from '../questionsData';
import AnswerReview from './AnswerReview';

function ReadingExercise({ onBack }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(10).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(10).fill(false));
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [showResults, setShowResults] = useState(false);

  const articleInfo = getReadingArticleInfo();
  const questions = getReadingVocabularyQuestions();
  const question = questions[currentQuestion];
  const progress = ((currentQuestion) / 10) * 100;

  // Handle both old format (h_t) and new format (h__t) gaps
  const processGap = (sentence, answer) => {
    // Check for new format first (multiple underscores between letters)
    const newFormatMatch = sentence.match(/([a-zA-Z])_+([a-zA-Z])/);
    if (newFormatMatch) {
      // Replace the gap with blanks: h__t becomes h___
      const gapLength = answer.length;
      const blanks = '_'.repeat(gapLength);
      return sentence.replace(/([a-zA-Z])_+([a-zA-Z])/, blanks);
    }
    
    // Fall back to old format (h_t)
    const oldFormatMatch = sentence.match(/([a-zA-Z])_([a-zA-Z])/);
    if (oldFormatMatch) {
      return sentence.replace(/([a-zA-Z])_([a-zA-Z])/, '___');
    }
    
    return sentence;
  };

  const getPlaceholder = (sentence, answer) => {
    // For new format, show first letter, underscores, last letter, and length
    const newFormatMatch = sentence.match(/([a-zA-Z])_+([a-zA-Z])/);
    if (newFormatMatch) {
      const firstLetter = newFormatMatch[1];
      const lastLetter = newFormatMatch[2];
      const middleLength = answer.length - 2;
      const middleUnderscores = '_'.repeat(middleLength);
      return `${firstLetter}${middleUnderscores}${lastLetter} (${answer.length})`;
    }
    
    // Fall back to old format
    const oldFormatMatch = sentence.match(/([a-zA-Z])_([a-zA-Z])/);
    if (oldFormatMatch) {
      return `${oldFormatMatch[1]}_${oldFormatMatch[2]} (${answer.length})`;
    }
    
    return `(${answer.length} letters)`;
  };

  const startQuiz = () => {
    setShowQuiz(true);
  };

  const openArticle = () => {
    window.open(articleInfo.url, '_blank');
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

  const restartQuiz = () => {
    setShowQuiz(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setUserAnswers(new Array(10).fill(''));
    setCheckedQuestions(new Array(10).fill(false));
    setFeedback({ show: false, type: '', message: '' });
  };

  // Calculate score for results
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

  if (showResults) {
    const score = calculateScore();
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
            <h3>📰 Article-Based Vocabulary Test</h3>
            <p>Based on: "{articleInfo.title}"</p>
          </div>

          {/* Use the reusable AnswerReview component */}
          <AnswerReview 
            questions={questions}
            userAnswers={userAnswers}
            title="Your Answers"
          />
          
          <div className="feedback-message">
            <strong>Well done!</strong> You've practiced vocabulary from a current BBC article about the octopus invasion affecting Devon fishermen. 
            This helps you learn words in context from real news stories.
            <br /><br />
            <em>Key vocabulary practiced: invasion, ruining, shortage, emergency, juvenile, and more!</em>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={restartQuiz}>
              Try Again
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    const processedSentence = processGap(question.sentence, question.answer);
    const placeholder = getPlaceholder(question.sentence, question.answer);

    return (
      <div className="exercise-page">
        <div className="quiz-header">
          <div className="quiz-type-badge">
            📖 Reading Vocabulary Exercise
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

        <div className="question-context">
          <small>📰 {question.context}</small>
        </div>

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
      </div>
    );
  }

  return (
    <div className="exercise-page">
      <div className="logo-container">
        <img 
          src="/purple_fox_transparent.png" 
          alt="Mr. Fox English" 
          className="app-logo"
        />
      </div>
      
      <h1>📖 Reading Exercise</h1>
      
      <div className="welcome-text">
        <p>Practice vocabulary from current BBC news articles!</p>
      </div>

      {/* Article Information */}
      <div className="article-info" style={{ textAlign: 'left', margin: '30px 0' }}>
        <h3>📰 Featured Article</h3>
        <h4>"{articleInfo.title}"</h4>
        <p className="article-date">Published: {new Date(articleInfo.date).toLocaleDateString()}</p>
        <p className="article-summary">{articleInfo.summary}</p>
        
        <div className="article-excerpt" style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          margin: '15px 0',
          fontStyle: 'italic',
          color: '#555'
        }}>
          <strong>Article excerpt:</strong>
          <br />
          {articleInfo.excerpt}
        </div>
      </div>

      {/* Exercise Options */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={openArticle}>
          📖 Read Full Article
        </button>
        <button className="btn btn-primary" onClick={startQuiz}>
          🎯 Start Vocabulary Quiz
        </button>
      </div>

      <div style={{ margin: '30px 0', padding: '20px', background: '#f0f7ff', borderRadius: '10px' }}>
        <h3 style={{ color: '#2b6cb0', marginBottom: '10px' }}>What you'll practice:</h3>
        <ul style={{ textAlign: 'left', color: '#4a5568' }}>
          <li>📚 10 vocabulary questions based on the article</li>
          <li>🎯 Different CEFR levels (A2 to C1)</li>
          <li>💡 Helpful hints for each question</li>
          <li>📖 Context from the original BBC article</li>
        </ul>
      </div>

      <button className="btn btn-secondary" onClick={onBack}>
        ← Back to Exercise Selection
      </button>
    </div>
  );
}

export default ReadingExercise;