// src/utils/sentenceGenerator.js - Fixed scoring system
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';

export const generateTestSentences = () => {
  const sentences = [];
  
  TEST_STRUCTURE.forEach(({ level, count }) => {
    const levelSentences = [...(SENTENCE_POOLS[level] || [])]; // Create a copy
    
    for (let i = 0; i < count; i++) {
      if (levelSentences.length > 0) {
        const randomIndex = Math.floor(Math.random() * levelSentences.length);
        const selectedSentence = { ...levelSentences[randomIndex], level };
        sentences.push(selectedSentence);
        
        // Remove selected sentence to avoid duplicates
        levelSentences.splice(randomIndex, 1);
      }
    }
  });
  
  console.log(`✅ Generated ${sentences.length} test sentences`);
  return sentences;
};

// FIXED: Proper scoring where 1 correct = 10% (if 10 questions)
export const calculateTestScore = (answers) => {
  if (!answers || answers.length === 0) {
    return {
      totalScore: 0,
      accuracy: 0,
      correctAnswers: 0,
      partiallyCorrectAnswers: 0,
      incorrectAnswers: 0
    };
  }

  let correctAnswers = 0;
  let partiallyCorrectAnswers = 0;
  let incorrectAnswers = 0;
  let totalScore = 0;

  answers.forEach(answer => {
    if (!answer.result) return;

    if (answer.result.isCorrect) {
      correctAnswers++;
      totalScore += 100; // Each correct answer = 100% of that question
    } else if (answer.result.isPartiallyCorrect) {
      partiallyCorrectAnswers++;
      // Partial credit based on how close they were
      const partialScore = Math.round(answer.result.score * 100);
      totalScore += partialScore;
    } else {
      incorrectAnswers++;
      // No points for incorrect answers
      totalScore += 0;
    }
  });

  // Calculate final percentage based on number of questions
  const finalPercentage = Math.round(totalScore / answers.length);
  
  console.log('📊 Score Calculation:', {
    totalAnswers: answers.length,
    correctAnswers,
    partiallyCorrectAnswers,
    incorrectAnswers,
    totalScore,
    finalPercentage
  });

  return {
    totalScore: finalPercentage,
    accuracy: finalPercentage,
    correctAnswers,
    partiallyCorrectAnswers,
    incorrectAnswers
  };
};
