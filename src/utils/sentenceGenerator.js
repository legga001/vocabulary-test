// src/utils/sentenceGenerator.js - Test Generation Logic
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

export const calculateTestScore = (answers) => {
  if (!answers || answers.length === 0) {
    return {
      totalScore: 0,
      maxScore: 0,
      percentage: 0,
      perfect: 0,
      close: 0,
      partial: 0,
      incorrect: 0
    };
  }

  const totalScore = answers.reduce((sum, answer) => sum + answer.result.score, 0);
  const maxScore = answers.length;
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  return { 
    totalScore: Math.round(totalScore * 10) / 10,
    maxScore, 
    percentage,
    perfect: answers.filter(a => a.result.type === 'perfect').length,
    close: answers.filter(a => a.result.type === 'close').length,
    partial: answers.filter(a => a.result.type === 'partial').length,
    incorrect: answers.filter(a => a.result.type === 'incorrect').length
  };
};
