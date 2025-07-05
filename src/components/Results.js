// src/components/Results.js - COMPLETE FIXED VERSION
import React, { useEffect } from 'react';
import AnswerReview from './AnswerReview';
import { recordTestResult } from '../utils/progressDataManager';
import { getNewQuestions } from '../questionsData';

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
  console.log('📊 Results component rendering with:', { userAnswers, questions, quizType, articleType });

  // Enhanced function to check if answer is already complete or needs reconstruction
  const isAnswerComplete = (userAnswer, correctAnswer) => {
    if (!userAnswer || !correctAnswer) return false;
    
    // If the user answer is already the length of the correct answer or close to it,
    // it's likely already complete (from Quiz component)
    const lengthRatio = userAnswer.length / correctAnswer.length;
    return lengthRatio >= 0.8; // If 80% or more of the length, consider it complete
  };

  // Enhanced function to reconstruct complete user answers from partial inputs
  const reconstructCompleteAnswer = (partialUserAnswer, correctAnswer) => {
    if (!partialUserAnswer || !correctAnswer) return '';
    
    // NEW: Check if answer is already complete (from Quiz component fix)
    if (isAnswerComplete(partialUserAnswer, correctAnswer)) {
      console.log('🎯 ANSWER ALREADY COMPLETE:', {
        userAnswer: partialUserAnswer,
        correctAnswer,
        using: partialUserAnswer
      });
      return partialUserAnswer.toLowerCase().trim();
    }
    
    // OLD: Only reconstruct if answer seems partial
    const lettersToShow = getLettersToShow(correctAnswer);
    const preFilledLetters = correctAnswer.substring(0, lettersToShow).toLowerCase();
    const userTypedLetters = partialUserAnswer.toLowerCase().trim();
    
    // Combine pre-filled and user-typed letters to form complete word
    const completeUserAnswer = preFilledLetters + userTypedLetters;
    
    console.log('🔧 RECONSTRUCTING PARTIAL ANSWER:', {
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
          case 'zooplankton-quiz':
            const zooplanktonModule = require('../zooplanktonVocabularyData');
            questions = zooplanktonModule.getZooplanktonVocabularyQuestions();
            articleInfo = zooplanktonModule.getZooplanktonArticleInfo();
            break;
          case 'killer-whale-quiz':
            const killerWhaleModule = require('../killerWhaleVocabularyData');
            questions = killerWhaleModule.getKillerWhaleVocabularyQuestions();
            articleInfo = killerWhaleModule.getKillerWhaleArticleInfo();
            break;
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
          case 'octopus-quiz':
            const octopusModule = require('../readingVocabularyData');
            questions = octopusModule.getReadingVocabularyQuestions();
            articleInfo = octopusModule.getReadingArticleInfo();
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

  // Use testQuestions if provided, otherwise get from data files
  const finalQuestions = testQuestions || getQuestionsAndArticleInfo().questions;
  const articleInfo = getQuestionsAndArticleInfo().articleInfo;

  // Calculate score
  const score = finalQuestions.reduce((total, question, index) => {
    const userAnswer = userAnswers[index];
    if (!userAnswer || !question.answer) return total;

    // Reconstruct complete answer for comparison
    const completeUserAnswer = reconstructCompleteAnswer(userAnswer, question.answer);
    const normalizedUserAnswer = completeUserAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = question.answer.toLowerCase().trim();

    console.log(`📝 Question ${index + 1} comparison:`, {
      userInput: userAnswer,
      reconstructed: completeUserAnswer,
      correct: question.answer,
      match: normalizedUserAnswer === normalizedCorrectAnswer
    });

    return normalizedUserAnswer === normalizedCorrectAnswer ? total + 1 : total;
  }, 0);

  // Record test result
  useEffect(() => {
    try {
      const formattedUserAnswers = userAnswers.map((userAnswer, index) => {
        const question = finalQuestions[index];
        if (!question) return { userAnswer: '', correctAnswer: '', isCorrect: false, level: 'B1' };
        
        const completeUserAnswer = reconstructCompleteAnswer(userAnswer, question.answer);
        const isCorrect = completeUserAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();
        
        return {
          userAnswer: completeUserAnswer,
          correctAnswer: question.answer,
          isCorrect: isCorrect ? 1 : 0,
          level: question.level || 'B1'
        };
      });

      const testResult = {
        type: quizType === 'article' ? 'article-vocabulary' : 'standard-vocabulary',
        score: score,
        totalQuestions: 10,
        userAnswers: formattedUserAnswers,
        completedAt: new Date().toISOString(),
        timeSpent: null,
        articleInfo: articleInfo
      };

      console.log('📊 RECORDING TEST RESULT:', testResult);
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
    <div className="exercise-page">
      <div className="quiz-container results-container">
        {/* Results Header */}
        <div className="results-header">
          <div className="results-icon">🎉</div>
          <h1 className="results-title">Quiz Complete!</h1>
          <div className="score-circle">
            <div className="score-number">{score}</div>
            <div className="score-denominator">/ 10</div>
          </div>
        </div>

        {/* Level Information */}
        <div className="level-section">
          <div className="level-badge-large">{levelInfo.level}</div>
          <div className="level-description">{levelInfo.description}</div>
          <div className="level-feedback">{levelInfo.feedback}</div>
        </div>

        {/* Article Info */}
        {quizType === 'article' && articleInfo && (
          <div className="article-info-section">
            <h3>📰 Article: {articleInfo.title}</h3>
            <p className="article-summary">{articleInfo.summary}</p>
            {articleInfo.url && (
              <button 
                className="btn-article-link"
                onClick={() => window.open(articleInfo.url, '_blank')}
              >
                📖 Read Full Article
              </button>
            )}
          </div>
        )}

        {/* Answer Review */}
        <div className="answer-review-section">
          <h3>📝 Review Your Answers</h3>
          <AnswerReview 
            userAnswers={userAnswers}
            questions={finalQuestions}
            reconstructCompleteAnswer={reconstructCompleteAnswer}
          />
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary results-btn"
          >
            🔄 Try Again
          </button>
          <button
            onClick={onRestart}
            className="btn btn-secondary results-btn"
          >
            ← Back to Menu
          </button>
        </div>

        {/* Encouragement Message */}
        <div className="encouragement-section">
          {percentage >= 80 && <p>🌟 Excellent work! Your vocabulary knowledge is impressive!</p>}
          {percentage >= 60 && percentage < 80 && <p>👍 Great job! Keep practising to reach the next level!</p>}
          {percentage >= 40 && percentage < 60 && <p>📚 Good effort! Regular practice will help you improve!</p>}
          {percentage < 40 && <p>💪 Keep going! Every expert was once a beginner!</p>}
        </div>
      </div>
    </div>
  );
}

export default Results;
