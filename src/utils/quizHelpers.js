// src/utils/quizHelpers.js - Fixed to remove erroneous highlighted letters
// Helper functions for processing quiz questions

/**
 * Determines how many letters to show based on word length
 * @param {string} word - The complete word
 * @returns {number} - Number of letters to show
 */
export const getLettersToShow = (word) => {
  const length = word.length;
  
  if (length <= 3) return 1;      // 3 letters: show 1
  if (length <= 5) return 2;      // 4-5 letters: show 2
  if (length <= 7) return 3;      // 6-7 letters: show 3
  if (length <= 9) return 4;      // 8-9 letters: show 4
  if (length <= 11) return 5;     // 10-11 letters: show 5
  if (length <= 13) return 6;     // 12-13 letters: show 6
  return Math.floor(length / 2);  // For very long words, show half
};

/**
 * Processes a sentence to find the gap and extract the word - FIXED VERSION
 * @param {string} sentence - The sentence with gap
 * @param {string} answer - The correct answer
 * @returns {object} - Processed sentence data
 */
export const processSentence = (sentence, answer) => {
  // Find the gap pattern in the sentence (underscores with optional letters)
  const gapMatch = sentence.match(/\b\w*_+\w*\b/);
  
  if (!gapMatch) {
    // If no gap found, return original sentence
    return {
      beforeGap: sentence,
      afterGap: '',
      visibleLetters: '', // No visible letters to avoid confusion
      word: answer
    };
  }

  const gapWord = gapMatch[0];
  const gapIndex = sentence.indexOf(gapWord);
  
  // Split the sentence around the gap
  const beforeGap = sentence.substring(0, gapIndex);
  const afterGap = sentence.substring(gapIndex + gapWord.length);
  
  // FIXED: Don't extract visible letters - this was causing the erroneous highlights
  // We want clean sentence flow without pre-shown letters
  const visibleLetters = ''; // Always empty to avoid confusion
  
  return {
    beforeGap: beforeGap.trim(),
    afterGap: afterGap.trim(),
    visibleLetters, // Always empty
    word: answer
  };
};

/**
 * Extracts the visible letters from a sentence gap - FIXED TO RETURN EMPTY
 * @param {string} sentence - The sentence with gap
 * @returns {string} - Always empty to avoid erroneous highlights
 */
export const extractVisibleLetters = (sentence) => {
  // FIXED: Always return empty string to prevent erroneous highlighted letters
  return '';
};
