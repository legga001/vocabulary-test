// src/components/Results.js - Fixed Results component with proper responsive layout
import React, { useEffect } from 'react';
import { getNewQuestions } from '../questionsData';
import AnswerReview from './AnswerReview';
import PronunciationButton from './PronunciationButton';
import { isSpeechSynthesisSupported } from '../utils/pronunciationUtils';
import { recordTestResult } from '../utils/progressDataManager';

function Results({ onRestart, userAnswers, quizType, testQuestions = null, articleType = null }) {
  const isSpeechSupported = isSpeechSynthesisSupported();

  // Get the correct questions and article info
  const getQuestionsAndArticleInfo = () => {
    let questions, articleInfo = null;
    
    if (testQuestions) {
      questions = testQuestions;
    } else if (quizType === 'article') {
      // Load questions and info based on article type
      try {
        switch (articleType) {
          case 'killer-whale-quiz':
            const killerWhaleModule = require('../killerWhaleVocabularyData');
            questions = killerWhaleModule.getKillerWhaleVocabularyQuestions();
            articleInfo = killerWhaleModule.getKillerWhaleArticleInfo();
            break;
          case 'octopus-quiz':
            const octopusModule = require('../readingVocabularyData');
            questions = octopusModule.getReadingVocabularyQuestions();
            articleInfo = octopusModule.getReadingArticleInfo();
            break;
          case 'smuggling-quiz':
            const smugglingModule = require('../articleQuestions');
            questions = smugglingModule.getArticleQuestions();
            articleInfo = smugglingModule.getArticleInfo();
            break;
          case 'air-india-quiz':
            const airIndiaModule = require('../airIndiaVocabularyData');
            questions = airIndiaModule.getAirIndiaVocabularyQuestions();
            articleInfo = airIndiaModule.getAirIndiaArticleInfo();
            break;
          case 'water-treatment-quiz':
            const waterTreatmentModule = require('../waterTreatmentVocabularyData');
            questions = waterTreatmentModule.getWaterTreatmentVocabularyQuestions();
            articleInfo = waterTreatmentModule.getWaterTreatmentArticleInfo();
            break;
          default:
            const defaultModule = require('../articleQuestions');
            questions = defaultModule.getArticleQuestions();
            articleInfo = defaultModule.getArticleInfo();
        }
      } catch (error) {
        console.error('Error loading article questions:', error);
        const fallbackModule = require('../articleQuestions');
        questions = fallbackModule.getArticleQuestions();
        articleInfo = fallbackModule.getArticleInfo();
      }
    } else {
      questions = getNewQuestions();
    }
    
    return { questions, articleInfo };
  };

  const { questions, articleInfo } = getQuestionsAndArticleInfo();

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

  // Record the test result when component mounts
  useEffect(() => {
    try {
      const formattedUserAnswers = userAnswers ? userAnswers.slice(0, 10).map((answer, index) => {
        if (!answer || !questions[index]) return { answer: '', correct: false, score: 0, level: 'B1' };
        
        const userAnswer = answer.toLowerCase().trim();
        const correctAnswer = questions[index].answer.toLowerCase();
        const isCorrect = checkSpellingVariations(userAnswer, correctAnswer);
        
        return {
          answer: answer || '',
          correct: isCorrect,
          score: isCorrect ? 1 : 0,
          level: questions[index].level || 'B1'
        };
      }) : [];

      const testResult = {
        type: quizType === 'article' ? 'article-vocabulary' : 'standard-vocabulary',
        score: score,
        totalQuestions: 10,
        userAnswers: formattedUserAnswers,
        completedAt: new Date().toISOString(),
        timeSpent: null,
        articleInfo: articleInfo
      };

      recordTestResult(testResult);
    } catch (error) {
      console.error('Error recording test result:', error);
    }
  }, [score, userAnswers, questions, quizType, articleInfo]);

  // Get level information based on score
  const getLevelInfo = (score) => {
    if (score <= 3) {
      return {
        level: "A2-B1 (Elementary)",
        description: "Keep practising!",
        feedback: "Focus on building your core vocabulary with everyday words and common expressions. Try reading simple texts and using vocabulary learning apps."
      };
    } else if (score <= 5) {
      return {
        level: "B1-B2 (Intermediate)",
        description: "Good progress!",
        feedback: "You're developing a solid vocabulary foundation. Continue reading intermediate texts and try to learn vocabulary in context rather than isolated words."
      };
    } else if (score <= 7) {
      return {
        level: "B2-C1 (Upper-Intermediate)",
        description: "Well done!",
        feedback: "Your vocabulary knowledge is quite good. Focus on more complex texts, idiomatic expressions, and specialised vocabulary in areas that interest you."
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
    <div className="quiz-container">
      <div className="results-header">
        <h1>📊 Quiz Results</h1>
        {articleInfo && (
          <div className="article-result-info">
            <h2>📰 Article-Based Quiz</h2>
            <p>Based on: "{articleInfo.title}"</p>
          </div>
        )}
        {quizType !== 'article' && (
          <div className="standard-result-info">
            <h2>📚 Standard Vocabulary Quiz</h2>
            <p>Random selection from our comprehensive question pool</p>
          </div>
        )}
      </div>

      <div className="score-section">
        <div className="score-display">
          {score}/10
        </div>
        <div className="score-percentage">
          {percentage}%
        </div>
        
        <div className="level-estimate">
          <h3>{levelInfo.level}</h3>
          <p className="level-description">{levelInfo.description}</p>
          <p className="level-feedback">{levelInfo.feedback}</p>
        </div>
      </div>

      {quizType !== 'article' && (
        <div className="test-info-section">
          <h3>💡 About This Test</h3>
          <p>This vocabulary test uses questions from different CEFR levels (A2-C1) to assess your English vocabulary knowledge across various contexts and topics.</p>
        </div>
      )}

      {articleInfo && (
        <div className="article-link-section">
          <button 
            className="btn-article-link"
            onClick={() => window.open(articleInfo.url, '_blank')}
          >
            📖 Read the Full Article
          </button>
        </div>
      )}

      {isSpeechSupported && (
        <div className="pronunciation-feature-highlight">
          <div className="feature-icon">🎤</div>
          <h4>Try Pronunciation Practice</h4>
          <p>Click the speaker icons in your answer review to hear correct pronunciations</p>
        </div>
      )}

      <AnswerReview 
        userAnswers={userAnswers}
        questions={questions}
        quizType={quizType}
      />

      <div className="results-actions">
        <button className="btn btn-primary" onClick={onRestart}>
          Take Another Test
        </button>
      </div>
    </div>
  );
}

export default Results;
