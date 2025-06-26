// src/utils/answerAnalysis.js - Fixed to include word differences
// Levenshtein distance for similarity calculation
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Calculate similarity percentage
const calculateSimilarity = (str1, str2) => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return (maxLength - distance) / maxLength;
};

// Normalise text for comparison
const normaliseText = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Analyse word-by-word differences
export const analyseWordDifferences = (userText, correctText) => {
  const userWords = normaliseText(userText || '').split(' ').filter(word => word.length > 0);
  const correctWords = normaliseText(correctText || '').split(' ').filter(word => word.length > 0);

  const getWordStatus = (userWord, correctWord) => {
    if (!userWord && correctWord) {
      return { type: 'missing', text: correctWord };
    }
    if (userWord && !correctWord) {
      return { type: 'extra', text: userWord };
    }
    if (userWord === correctWord) {
      return { type: 'correct', text: userWord };
    }
    if (userWord && correctWord) {
      const distance = levenshteinDistance(userWord, correctWord);
      if (distance <= 2 && userWord.length > 2) {
        return { type: 'close', text: userWord, correct: correctWord };
      }
      return { type: 'incorrect', text: userWord, correct: correctWord };
    }
    return { type: 'unknown', text: userWord || correctWord };
  };

  const maxLength = Math.max(userWords.length, correctWords.length);
  const differences = [];

  for (let i = 0; i < maxLength; i++) {
    const userWord = userWords[i];
    const correctWord = correctWords[i];
    differences.push(getWordStatus(userWord, correctWord));
  }

  return differences;
};

// Main answer checking function with word differences
export const checkAnswer = (userAnswer, correctText) => {
  if (!userAnswer || !correctText) {
    return { 
      isCorrect: false,
      isPartiallyCorrect: false,
      type: 'incorrect', 
      score: 0,
      differences: []
    };
  }

  const normalisedUser = normaliseText(userAnswer);
  const normalisedCorrect = normaliseText(correctText);

  // Get word-by-word differences
  const differences = analyseWordDifferences(userAnswer, correctText);

  if (normalisedUser === normalisedCorrect) {
    return { 
      isCorrect: true,
      isPartiallyCorrect: false,
      type: 'perfect', 
      score: 1,
      differences: differences
    };
  }

  const similarity = calculateSimilarity(normalisedUser, normalisedCorrect);
  
  if (similarity >= 0.85) {
    return { 
      isCorrect: false,
      isPartiallyCorrect: true,
      type: 'close', 
      score: 0.8,
      differences: differences
    };
  } else if (similarity >= 0.5) {
    return { 
      isCorrect: false,
      isPartiallyCorrect: true,
      type: 'partial', 
      score: similarity * 0.5,
      differences: differences
    };
  } else {
    return { 
      isCorrect: false,
      isPartiallyCorrect: false,
      type: 'incorrect', 
      score: 0,
      differences: differences
    };
  }
};
