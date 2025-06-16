// src/components/Results.js - Updated with random vocabulary pool integration
import React, { useEffect } from 'react';
import { getNewQuestions } from '../questionsData';
import { getArticleQuestions, getArticleInfo } from '../articleQuestions';
import AnswerReview from './AnswerReview';
import PronunciationButton from './PronunciationButton';
import { isSpeechSynthesisSupported } from '../utils/pronunciationUtils';
import { recordTestResult } from '../utils/progressDataManager';

function Results({ onRestart, userAnswers, quizType, testQuestions = null }) {
  // Get the correct questions - use passed questions if available, otherwise generate/fetch
  const questions = testQuestions || (quizType === 'article' ? getArticleQuestions() : getNewQuestions());
  const articleInfo = quizType === 'article' ? getArticleInfo() : null;
  const isSpeechSupported = isSpeechSynthesisSupported();

  // Calculate score with enhanced spelling support
  const calculateScore = () => {
    let score = 0;
    for (let i = 0; i < Math.min(10, questions.length); i++) {
      if (userAnswers && userAnswers[i] && questions[i]) {
        const userAnswer = userAnswers[i].toLowerCase().trim();
        const correctAnswer = questions[i].answer.toLowerCase();
        
        // Check for British/American spelling variations
        const isCorrect = checkSpellingVariations(userAnswer, correctAnswer);
        if (isCorrect) score++;
      }
    }
    return score;
  };

  // Enhanced spelling check function
  const checkSpellingVariations = (userAnswer, correctAnswer) => {
    if (userAnswer === correctAnswer) return true;

    // British/American spelling variations
    const spellingMap = {
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

    // Check if user's answer matches any alternative spelling of the correct answer
    const correctAlternatives = spellingMap[correctAnswer] || [];
    if (correctAlternatives.includes(userAnswer)) return true;

    // Check if correct answer matches any alternative spelling of the user's answer
    const userAlternatives = spellingMap[userAnswer] || [];
    if (userAlternatives.includes(correctAnswer)) return true;

    return false;
  };

  const score = calculateScore();

  // Record the test result when component mounts - this increments daily targets
  useEffect(() => {
    try {
      // Prepare user answers for progress tracking
      const formattedUserAnswers = userAnswers ? userAnswers.slice(0, 10).map((answer, index) => {
        if (!answer || !questions[index]) return { answer: '', correct: false, score: 0, level: 'B1' };
        
        const userAnswer = answer.toLowerCase().trim();
        const correctAnswer = questions[index].answer.toLowerCase();
        const isCorrect = checkSpellingVariations(userAnswer, correctAnswer);
        
        return {
          answer: answer || '',
          correct: isCorrect,
          score: isCorrect ? 100 : 0,
          level: questions[index].level || 'B1'
        };
      }) : [];

      // Record test result - this automatically increments daily targets
      recordTestResult({
        quizType: quizType === 'article' ? 'article-vocabulary' : 'standard-vocabulary',
        score: score,
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: null, // Could add timer tracking in the future
        userAnswers: formattedUserAnswers
      });
      
      console.log(`✅ ${quizType === 'article' ? 'Article' : 'Standard'} vocabulary test result recorded: ${score}/10`);
    } catch (error) {
      console.error('Error recording test result:', error);
    }
  }, [quizType, score, userAnswers, questions]);

  // Determine level and feedback
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
  const percentage = Math.round((score / 10) * 100);

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <h1>📊 Quiz Results</h1>
          {articleInfo && (
            <div className="article-info">
              <h2>📰 Article-Based Quiz</h2>
              <p>Based on: "{articleInfo.title}"</p>
            </div>
          )}
          {quizType !== 'article' && (
            <div className="standard-test-info">
              <h2>📚 Standard Vocabulary Quiz</h2>
              <p>Random selection from our comprehensive question pool</p>
            </div>
          )}
        </div>

        <div className="score-section">
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/10</span>
            </div>
            <div className="percentage">{percentage}%</div>
          </div>
          
          <div className="level-info">
            <h3>{levelInfo.level}</h3>
            <p className="level-description">{levelInfo.description}</p>
            <p className="level-feedback">{levelInfo.feedback}</p>
          </div>
        </div>

        {quizType !== 'article' && (
          <div className="test-info-section">
            <h3>🎯 About This Test</h3>
            <div className="test-breakdown">
              <p>This test was randomly generated from our pool of 100 vocabulary exercises:</p>
              <div className="level-breakdown">
                <div className="level-stat">
                  <span className="level-badge-small a2">A2</span>
                  <span>2 Elementary questions</span>
                </div>
                <div className="level-stat">
                  <span className="level-badge-small b1">B1</span>
                  <span>3 Intermediate questions</span>
                </div>
                <div className="level-stat">
                  <span className="level-badge-small b2">B2</span>
                  <span>3 Upper-Intermediate questions</span>
                </div>
                <div className="level-stat">
                  <span className="level-badge-small c1">C1</span>
                  <span>2 Advanced questions</span>
                </div>
              </div>
              <p><em>Each time you take the test, you'll get a fresh selection of questions!</em></p>
            </div>
          </div>
        )}

        <div className="detailed-results">
          <AnswerReview 
            questions={questions}
            userAnswers={userAnswers}
            title="Your Answers"
          />
        </div>

        {articleInfo && (
          <div className="article-context">
            <h3>📖 About the Article</h3>
            <p><strong>Source:</strong> BBC News</p>
            <p><strong>Date:</strong> {articleInfo.date}</p>
            <div className="article-summary">
              <p>{articleInfo.summary}</p>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => window.open(articleInfo.url, '_blank')}
            >
              📖 Read Full Article
            </button>
          </div>
        )}

        <div className="pronunciation-section">
          <h3>🔊 Practice Pronunciation</h3>
          <div className="pronunciation-grid">
            {questions.slice(0, 10).map((question, index) => (
              <div key={index} className="pronunciation-item">
                <span className="word">{question.answer}</span>
                <span className="word-level">{question.level}</span>
                {isSpeechSupported && (
                  <PronunciationButton 
                    word={question.answer} 
                    size="small"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="results-actions">
          <button 
            className="btn btn-primary"
            onClick={onRestart}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
