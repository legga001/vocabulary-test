// src/questionsData.js - Updated with vocabulary pool integration
import { generateRandomTest, getPoolStatistics } from './data/vocabularyPool';

// Generate a random test each time this module is imported
// This ensures fresh questions for each new test session
export const questions = generateRandomTest();

// Function to get a fresh set of questions (for retaking tests)
export const getNewQuestions = () => {
  return generateRandomTest();
};

// Function to get pool statistics for debugging
export const getVocabularyStats = () => {
  return getPoolStatistics();
};

// Feedback messages for correct answers
export const correctMessages = [
  "✓ Correct! Well done! 🎉",
  "✓ Excellent! Keep it up! 🌟", 
  "✓ Perfect! Great job! 👏",
  "✓ That's right! Nice work! 💪",
  "✓ Correct! You're doing great! 🎯",
  "✓ Brilliant! Excellent work! ⭐",
  "✓ Spot on! Well done! 🎊",
  "✓ Outstanding! Keep going! 🔥",
  "✓ Fantastic! Great progress! 🚀",
  "✓ Perfect answer! Well done! 💯"
];
