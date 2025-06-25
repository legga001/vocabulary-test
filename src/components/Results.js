// src/components/Results.js - FRESH REWRITE to force build system update
import React, { useEffect } from 'react';
import AnswerReview from './AnswerReview';
import { recordTestResult } from '../utils/progressDataManager';
import { getNewQuestions } from '../questionsData';
import { getArticleQuestions, getArticleInfo as getGenericArticleInfo } from '../articleQuestions';
import { isSpeechSupported } from '../pronunciationData';

// Helper function to determine how many letters to show based on word length
const getLettersToShow = (word) => {
  const length = word.length;
  if (length <= 3) return 1;
  if (length <= 5) return 2;
  if (length <= 7) return 3;
  if (length <= 9) return 4;
  if (length <= 11) return 5;
  return 6;
};

function Results({ userAnswers, questions, testQuestions, quizType, articleType, onRestart }) {
  console.log('📊 Results component - FRESH VERSION rendering with:', { userAnswers, questions, quizType });

  // Enhanced function to reconstruct complete user answers from partial inputs
  const reconstructCompleteAnswer = (partialUserAnswer, correctAnswer) => {
    if (!partialUserAnswer || !correctAnswer) return '';
    
    const lettersToShow = getLettersToShow(correctAnswer);
    const preFilledLetters = correctAnswer.substring(0, lettersToShow).toLowerCase();
    const userTypedLetters = partialUserAnswer.toLowerCase().trim();
    
    // Combine pre-filled and user-typed letters to form complete word
    const completeUserAnswer = preFilledLetters + userTypedLetters;
    
    console.log('🔧 RECONSTRUCTING ANSWER (FRESH VERSION):', {
      correctAnswer,
      partialUserAnswer,
      lettersToShow,
      preFilledLetters,
      userTypedLetters,
      completeUserAnswer
    });
    
    return completeUserAnswer;
  };

  // Get questions and article info
  const getQuestionsAndArticleInfo = () => {
    let questions = [];
    let articleInfo = null;

    if (quizType === 'article') {
      try {
        switch (articleType) {
          case 'smuggling-quiz':
            const smugglingModule = require('../smugglingVocabularyData');
            questions = smugglingModule.getSmugglingVocabularyQuestions();
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

  // Use testQuestions if provided, otherwise fall back to questions prop or generate new ones
  const finalQuestions = testQuestions || questions || getQuestionsAndArticleInfo().questions;
  
  // Get article info separately
  const { articleInfo } = getQuestionsAndArticleInfo();

  // FIXED: Calculate score using complete words, not just user-typed letters
  const calculateScore = () => {
    let score = 0;
    
    for (let i = 0; i < Math.min(10, finalQuestions.length); i++) {
      if (userAnswers && userAnswers[i] && finalQuestions[i]) {
        // Reconstruct the complete word from partial user input
        const completeUserAnswer = reconstructCompleteAnswer(userAnswers[i], finalQuestions[i].answer);
        const correctAnswer = finalQuestions[i].answer.toLowerCase();
        
        // Check for British/American spelling variations using complete words
        const isCorrect = checkSpellingVariations(completeUserAnswer, correctAnswer);
        
        console.log(`💯 SCORING Q${i + 1} (FRESH VERSION):`, {
          partialUserInput: userAnswers[i],
          completeUserAnswer,
          correctAnswer,
          isCorrect
        });
        
        if (isCorrect) score++;
      }
    }
    
    console.log(`🎯 FINAL SCORE (FRESH VERSION): ${score}/${Math.min(10, finalQuestions.length)}`);
    return score;
  };

  // Enhanced spelling check function for complete words
  const checkSpellingVariations = (userAnswer, correctAnswer) => {
    if (!userAnswer || !correctAnswer) return false;
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
      // Colour/color variations
      'color': ['colour'], 'colour': ['color'], 'colors': ['colours'], 'colours': ['colors'],
      'colored': ['coloured'], 'coloured': ['colored'], 'coloring': ['colouring'], 'colouring': ['coloring'],
      // Honour/honor variations
      'honor': ['honour'], 'honour': ['honor'], 'honors': ['honours'], 'honours': ['honors'],
      'honored': ['honoured'], 'honoured': ['honored'], 'honoring': ['honouring'], 'honouring': ['honoring'],
      // Centre/center variations
      'center': ['centre'], 'centre': ['center'], 'centers': ['centres'], 'centres': ['centers'],
      'centered': ['centred'], 'centred': ['centered'], 'centering': ['centring'], 'centring': ['centering'],
      // Theatre/theater variations
      'theater': ['theatre'], 'theatre': ['theater'], 'theaters': ['theatres'], 'theatres': ['theaters'],
      // Metre/meter variations
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
        if (!answer || !finalQuestions[index]) return { answer: '', correct: false, score: 0, level: 'B1' };
        
        // FIXED: Use complete reconstructed answer for recording results
        const completeUserAnswer = reconstructCompleteAnswer(answer, finalQuestions[index].answer);
        const correctAnswer = finalQuestions[index].answer.toLowerCase();
        const isCorrect = checkSpellingVariations(completeUserAnswer, correctAnswer);
        
        return {
          answer: completeUserAnswer || '', // Store the complete answer
          correct: isCorrect,
          score: isCorrect ? 1 : 0,
          level: finalQuestions[index].level || 'B1'
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

      console.log('📊 RECORDING TEST RESULT (FRESH VERSION):', testResult);
      recordTestResult(testResult);
    } catch (error) {
      console.error('Error recording test result:', error);
    }
  }, [score, userAnswers, finalQuestions, quizType, articleInfo]);

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
        questions={finalQuestions}
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
