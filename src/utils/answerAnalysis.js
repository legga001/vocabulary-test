// src/utils/answerAnalysis.js - Answer Checking and Analysis Logic

export const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

export const levenshteinDistance = (str1, str2) => {
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

export const normaliseText = (text) => {
  return text.toLowerCase()
    .replace(/[.,!?;:"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const checkAnswer = (userAnswer, correctText) => {
  if (!userAnswer || !correctText) {
    return { type: 'incorrect', score: 0 };
  }

  const normalisedUser = normaliseText(userAnswer);
  const normalisedCorrect = normaliseText(correctText);

  if (normalisedUser === normalisedCorrect) {
    return { type: 'perfect', score: 1 };
  }

  const similarity = calculateSimilarity(normalisedUser, normalisedCorrect);
  
  if (similarity >= 0.85) {
    return { type: 'close', score: 0.8 };
  } else if (similarity >= 0.5) {
    return { type: 'partial', score: similarity * 0.5 };
  } else {
    return { type: 'incorrect', score: 0 };
  }
};

export const analyseWordDifferences = (userText, correctText) => {
  const userWords = normaliseText(userText || '').split(' ').filter(word => word.length > 0);
  const correctWords = normaliseText(correctText || '').split(' ').filter(word => word.length > 0);

  const getWordStatus = (userWord, correctWord) => {
    if (!userWord && correctWord) {
      return { status: 'missing', word: correctWord };
    }
    if (userWord && !correctWord) {
      return { status: 'extra', word: userWord };
    }
    if (userWord === correctWord) {
      return { status: 'correct', word: userWord };
    }
    if (userWord && correctWord) {
      const distance = levenshteinDistance(userWord, correctWord);
      if (distance <= 2 && userWord.length > 2) {
        return { status: 'close', word: userWord, correct: correctWord };
      }
      return { status: 'wrong', word: userWord, correct: correctWord };
    }
    return { status: 'unknown', word: userWord || correctWord };
  };

  const maxLength = Math.max(userWords.length, correctWords.length);
  const comparison = [];

  for (let i = 0; i < maxLength; i++) {
    const userWord = userWords[i];
    const correctWord = correctWords[i];
    comparison.push(getWordStatus(userWord, correctWord));
  }

  return comparison;
};
