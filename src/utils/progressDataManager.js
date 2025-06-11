// src/utils/progressDataManager.js - Complete rewrite with all functions including missing ones
// Manages long-term user progress data in localStorage

// Constants
const PROGRESS_DATA_KEY = 'mrFoxEnglishProgressData';
const MAX_HISTORY_DAYS = 365; // Keep 1 year of history

// Default data structure
const DEFAULT_PROGRESS_DATA = Object.freeze({
  totalTests: 0,
  streak: 0,
  bestStreak: 0,
  lastTestDate: null,
  testHistory: [],
  dailyStats: {},
  levelProgress: {
    'A1-A2': 0,
    'A2-B1': 0,
    'B1-B2': 0,
    'B2-C1': 0,
    'C1-C2': 0
  },
  startDate: new Date().toISOString()
});

// Quiz type display mappings
const QUIZ_TYPE_MAPPINGS = Object.freeze({
  realFakeWords: { display: 'Word Recognition', icon: '🎯' },
  article: { display: 'Article-Based', icon: '📰' },
  'speak-and-record': { display: 'Speaking Practice', icon: '🎤' },
  'listen-and-type': { display: 'Listen & Type', icon: '🎧' },
  standard: { display: 'Standard Vocabulary', icon: '📚' },
  'octopus-quiz': { display: 'Octopus Article', icon: '📰' },
  'smuggling-quiz': { display: 'Smuggling Article', icon: '📰' },
  'standard-vocabulary': { display: 'Standard Vocabulary', icon: '📚' },
  default: { display: 'Vocabulary Test', icon: '📚' }
});

// ==============================================
// CORE DATA FUNCTIONS
// ==============================================

// Initialize or get existing progress data
export const getProgressData = () => {
  try {
    const saved = localStorage.getItem(PROGRESS_DATA_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      // Merge with defaults to ensure all properties exist
      return {
        ...DEFAULT_PROGRESS_DATA,
        ...data,
        levelProgress: {
          ...DEFAULT_PROGRESS_DATA.levelProgress,
          ...(data.levelProgress || {})
        }
      };
    }
  } catch (error) {
    console.error('Error loading progress data:', error);
  }
  
  // Return default structure if no data or error
  return { ...DEFAULT_PROGRESS_DATA };
};

// Save progress data with error handling
const saveProgressData = (data) => {
  try {
    localStorage.setItem(PROGRESS_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving progress data:', error);
    return false;
  }
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Get user's estimated level based on score and total questions
const getScoreLevel = (score, totalQuestions = 10) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  if (percentage <= 25) return 'A1-A2';
  if (percentage <= 50) return 'A2-B1';
  if (percentage <= 70) return 'B1-B2';
  if (percentage <= 85) return 'B2-C1';
  return 'C1-C2';
};

// Get display information for quiz types
const getQuizTypeInfo = (type) => {
  return QUIZ_TYPE_MAPPINGS[type] || QUIZ_TYPE_MAPPINGS.default;
};

// Calculate streak based on dates
const calculateStreak = (lastTestDate, today) => {
  if (!lastTestDate) return 1; // First test
  
  const lastDate = new Date(lastTestDate).toDateString();
  const todayStr = today.toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  if (lastDate === todayStr) {
    return 0; // Same day, don't increment
  } else if (lastDate === yesterday) {
    return 1; // Consecutive day, increment by 1
  } else {
    return 'reset'; // Streak broken, reset to 1
  }
};

// ==============================================
// MAIN RECORDING FUNCTION
// ==============================================

// Record a completed test
export const recordTestResult = (testData) => {
  const {
    quizType,
    score,
    totalQuestions = 10,
    completedAt = new Date(),
    timeSpent = null,
    userAnswers = []
  } = testData;

  const progressData = getProgressData();
  const today = new Date();
  const todayStr = today.toDateString();
  const level = getScoreLevel(score, totalQuestions);
  const quizTypeInfo = getQuizTypeInfo(quizType);

  // Create test record
  const testRecord = {
    id: Date.now(),
    date: completedAt.toISOString(),
    quizType,
    quizTypeDisplay: quizTypeInfo.display,
    quizTypeIcon: quizTypeInfo.icon,
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    level,
    timeSpent,
    userAnswers: userAnswers.map(answer => ({ 
      answer: answer.answer || answer.word || '', 
      isCorrect: answer.correct || false 
    }))
  };

  // Update test history
  progressData.testHistory.unshift(testRecord);
  
  // Keep only recent history to prevent storage bloat
  if (progressData.testHistory.length > MAX_HISTORY_DAYS) {
    progressData.testHistory = progressData.testHistory.slice(0, MAX_HISTORY_DAYS);
  }

  // Update total tests count
  progressData.totalTests += 1;

  // Update daily stats
  if (!progressData.dailyStats[todayStr]) {
    progressData.dailyStats[todayStr] = {
      testsCompleted: 0,
      totalScore: 0,
      averageScore: 0,
      timeSpent: 0
    };
  }

  const dailyStat = progressData.dailyStats[todayStr];
  dailyStat.testsCompleted += 1;
  
  // Calculate score out of 10 for consistency in daily averages
  const normalizedScore = totalQuestions === 20 ? score / 2 : score;
  dailyStat.totalScore += normalizedScore;
  dailyStat.averageScore = Math.round(dailyStat.totalScore / dailyStat.testsCompleted);
  
  if (timeSpent) dailyStat.timeSpent += timeSpent;

  // Update streak
  const streakChange = calculateStreak(progressData.lastTestDate, today);
  
  if (streakChange === 'reset') {
    progressData.streak = 1;
  } else if (streakChange === 1) {
    progressData.streak += 1;
  }
  // If streakChange === 0, don't change streak (same day)

  // Update best streak
  if (progressData.streak > progressData.bestStreak) {
    progressData.bestStreak = progressData.streak;
  }

  // Update level progress
  progressData.levelProgress[level] = (progressData.levelProgress[level] || 0) + 1;
  progressData.lastTestDate = completedAt.toISOString();

  // Ensure start date is set
  if (!progressData.startDate) {
    progressData.startDate = completedAt.toISOString();
  }

  // Save and return updated data
  saveProgressData(progressData);
  return progressData;
};

// ==============================================
// DATA RETRIEVAL FUNCTIONS
// ==============================================

// Get recent test history (last N tests)
export const getRecentTests = (limit = 10) => {
  const progressData = getProgressData();
  return progressData.testHistory.slice(0, limit);
};

// Get daily stats for chart (last N days)
export const getDailyStatsForChart = (days = 30) => {
  const progressData = getProgressData();
  const chartData = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toDateString();
    const dailyStat = progressData.dailyStats[dateStr];
    
    chartData.push({
      date: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      fullDate: dateStr,
      testsCompleted: dailyStat?.testsCompleted || 0,
      averageScore: dailyStat?.averageScore || 0,
      timeSpent: dailyStat?.timeSpent || 0
    });
  }
  
  return chartData;
};

// Get exercise performance data for analytics
export const getExercisePerformance = () => {
  const progressData = getProgressData();
  const exerciseStats = {};
  
  // Analyse performance by exercise type
  progressData.testHistory.forEach(test => {
    const exerciseType = test.quizTypeDisplay || 'Standard Vocabulary';
    
    if (!exerciseStats[exerciseType]) {
      exerciseStats[exerciseType] = {
        displayName: exerciseType,
        icon: test.quizTypeIcon || '📚',
        attempts: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        totalTime: 0,
        recentScores: [],
        improvement: 'new'
      };
    }
    
    const stat = exerciseStats[exerciseType];
    stat.attempts++;
    
    // Normalise score to 10-point scale for consistency
    const normalizedScore = test.totalQuestions === 20 ? test.score / 2 : test.score;
    const scorePercentage = Math.round((normalizedScore / 10) * 100);
    
    stat.totalScore += scorePercentage;
    stat.averageScore = Math.round(stat.totalScore / stat.attempts);
    
    if (scorePercentage > stat.bestScore) {
      stat.bestScore = scorePercentage;
    }
    
    if (test.timeSpent) {
      stat.totalTime += test.timeSpent;
    }
    
    // Keep track of recent scores for trend analysis
    stat.recentScores.push({
      score: scorePercentage,
      date: test.date,
      normalizedScore: normalizedScore
    });
    
    // Keep only last 10 scores for trend analysis
    if (stat.recentScores.length > 10) {
      stat.recentScores = stat.recentScores.slice(-10);
    }
  });
  
  // Calculate trends for each exercise type
  Object.values(exerciseStats).forEach(stat => {
    if (stat.recentScores.length >= 5) {
      const recent5 = stat.recentScores.slice(-5);
      const older5 = stat.recentScores.slice(-10, -5);
      
      if (older5.length >= 3) {
        const recentAvg = recent5.reduce((sum, s) => sum + s.score, 0) / recent5.length;
        const olderAvg = older5.reduce((sum, s) => sum + s.score, 0) / older5.length;
        
        if (recentAvg > olderAvg + 5) {
          stat.improvement = 'improving';
        } else if (recentAvg < olderAvg - 5) {
          stat.improvement = 'declining';
        } else {
          stat.improvement = 'stable';
        }
      }
    }
  });
  
  return exerciseStats;
};

// Get progress statistics with performance optimizations
export const getProgressStats = () => {
  const progressData = getProgressData();
  const recentTests = progressData.testHistory.slice(0, 10);
  
  // Calculate average score (normalize 20-question tests to 10-point scale)
  const normalizedScores = recentTests.map(test => 
    test.totalQuestions === 20 ? test.score / 2 : test.score
  );
  
  const averageScore = normalizedScores.length > 0 
    ? Math.round(normalizedScores.reduce((sum, score) => sum + score, 0) / normalizedScores.length)
    : 0;

  const averagePercentage = recentTests.length > 0
    ? Math.round(recentTests.reduce((sum, test) => sum + test.percentage, 0) / recentTests.length)
    : 0;

  // Find most common level
  const levelEntries = Object.entries(progressData.levelProgress);
  const mostCommonLevel = levelEntries.length > 0
    ? levelEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : 'A1-A2';

  // Calculate improvement trend (compare first 5 vs last 5 tests)
  let trend = 'stable';
  if (recentTests.length >= 10) {
    const recent5 = recentTests.slice(0, 5);
    const older5 = recentTests.slice(5, 10);
    
    // Normalize scores for comparison
    const recentAvg = recent5.reduce((sum, test) => 
      sum + (test.totalQuestions === 20 ? test.score / 2 : test.score), 0
    ) / 5;
    
    const olderAvg = older5.reduce((sum, test) => 
      sum + (test.totalQuestions === 20 ? test.score / 2 : test.score), 0
    ) / 5;
    
    if (recentAvg > olderAvg + 0.5) trend = 'improving';
    else if (recentAvg < olderAvg - 0.5) trend = 'declining';
  }

  // Count tests this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const testsThisWeek = recentTests.filter(test => {
    const testDate = new Date(test.date);
    return testDate > weekAgo;
  }).length;

  // Calculate total time spent
  const totalTimeSpent = Object.values(progressData.dailyStats).reduce((total, day) => 
    total + (day.timeSpent || 0), 0
  );

  // Find favourite exercise type
  const exercisePerformance = getExercisePerformance();
  const exerciseEntries = Object.entries(exercisePerformance);
  const favouriteExercise = exerciseEntries.length > 0
    ? exerciseEntries.reduce((a, b) => a[1].attempts > b[1].attempts ? a : b)[0]
    : 'None yet';

  return {
    totalTests: progressData.totalTests,
    currentStreak: progressData.streak,
    bestStreak: progressData.bestStreak,
    averageScore,
    averagePercentage,
    mostCommonLevel,
    trend,
    lastTestDate: progressData.lastTestDate,
    testsThisWeek,
    totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
    favouriteExercise,
    startDate: progressData.startDate || new Date().toISOString()
  };
};

// ==============================================
// LEARNING INSIGHTS FUNCTION - MISSING FUNCTION ADDED
// ==============================================

export const getLearningInsights = () => {
  const progressData = getProgressData();
  const exercisePerformance = getExercisePerformance();
  
  // Find strongest skill (highest average score)
  const exerciseEntries = Object.entries(exercisePerformance);
  const strongestSkill = exerciseEntries.length > 0
    ? exerciseEntries.reduce((a, b) => a[1].averageScore > b[1].averageScore ? a : b)
    : null;

  // Find most improved skill
  const improvingSkills = exerciseEntries.filter(([, data]) => data.improvement === 'improving');
  const mostImproved = improvingSkills.length > 0 ? improvingSkills[0] : null;

  // Recommended challenge (lowest performing active skill)
  const challenges = [
    { displayName: 'Speaking Practice', icon: '🎤', reason: 'Improve your pronunciation skills' },
    { displayName: 'Listen & Type', icon: '🎧', reason: 'Enhance listening comprehension' },
    { displayName: 'Word Recognition', icon: '🎯', reason: 'Build vocabulary faster' },
    { displayName: 'Article-Based', icon: '📰', reason: 'Learn from real news stories' }
  ];
  
  const lowestPerforming = exerciseEntries.length > 0
    ? exerciseEntries.reduce((a, b) => a[1].averageScore < b[1].averageScore ? a : b)
    : null;

  const recommendedChallenge = lowestPerforming 
    ? { displayName: lowestPerforming[0], icon: lowestPerforming[1].icon, reason: 'Focus on your weakest area' }
    : challenges[Math.floor(Math.random() * challenges.length)];

  // Words to review (from wrong answers)
  const wordsToReview = [];
  const wrongAnswers = {};

  progressData.testHistory.forEach(test => {
    if (test.userAnswers) {
      test.userAnswers.forEach(answer => {
        if (!answer.isCorrect && answer.answer) {
          const word = answer.answer.toLowerCase().trim();
          if (word && word.length > 2) {
            if (!wrongAnswers[word]) {
              wrongAnswers[word] = {
                word: word,
                count: 0,
                exercises: new Set()
              };
            }
            wrongAnswers[word].count++;
            wrongAnswers[word].exercises.add(test.quizTypeDisplay);
          }
        }
      });
    }
  });

  // Convert to array and get top 5 most missed words
  const sortedWords = Object.values(wrongAnswers)
    .filter(wordData => wordData.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(wordData => ({
      word: wordData.word,
      count: wordData.count,
      exercises: Array.from(wordData.exercises)
    }));

  return {
    strongestSkill: strongestSkill ? {
      displayName: strongestSkill[0],
      icon: strongestSkill[1].icon,
      average: strongestSkill[1].averageScore
    } : null,
    mostImproved: mostImproved ? {
      displayName: mostImproved[0],
      icon: mostImproved[1].icon,
      improvement: mostImproved[1].improvement
    } : null,
    recommendedChallenge,
    wordsToReview: sortedWords
  };
};

// ==============================================
// ACHIEVEMENTS FUNCTION - MISSING FUNCTION ADDED
// ==============================================

export const getAchievements = () => {
  const progressData = getProgressData();
  const achievements = [];

  // First Test Achievement
  if (progressData.totalTests >= 1) {
    achievements.push({
      id: 'first_test',
      title: 'First Steps',
      description: 'Completed your first test',
      icon: '🎯',
      earnedDate: progressData.testHistory[progressData.testHistory.length - 1]?.date || new Date().toISOString()
    });
  }

  // Streak Achievements
  if (progressData.bestStreak >= 3) {
    achievements.push({
      id: 'streak_3',
      title: 'Getting Started',
      description: 'Maintained a 3-day streak',
      icon: '🔥',
      earnedDate: progressData.lastTestDate
    });
  }

  if (progressData.bestStreak >= 7) {
    achievements.push({
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Maintained a 7-day streak',
      icon: '💪',
      earnedDate: progressData.lastTestDate
    });
  }

  if (progressData.bestStreak >= 30) {
    achievements.push({
      id: 'streak_30',
      title: 'Month Master',
      description: 'Maintained a 30-day streak',
      icon: '👑',
      earnedDate: progressData.lastTestDate
    });
  }

  // Test Count Achievements
  if (progressData.totalTests >= 10) {
    achievements.push({
      id: 'tests_10',
      title: 'Dedicated Learner',
      description: 'Completed 10 tests',
      icon: '📚',
      earnedDate: progressData.testHistory[progressData.testHistory.length - 10]?.date || new Date().toISOString()
    });
  }

  if (progressData.totalTests >= 50) {
    achievements.push({
      id: 'tests_50',
      title: 'Study Enthusiast',
      description: 'Completed 50 tests',
      icon: '🌟',
      earnedDate: progressData.testHistory[progressData.testHistory.length - 50]?.date || new Date().toISOString()
    });
  }

  if (progressData.totalTests >= 100) {
    achievements.push({
      id: 'tests_100',
      title: 'Century Club',
      description: 'Completed 100 tests',
      icon: '💯',
      earnedDate: progressData.testHistory[progressData.testHistory.length - 100]?.date || new Date().toISOString()
    });
  }

  // Perfect Score Achievements
  const perfectScores = progressData.testHistory.filter(test => test.percentage === 100);
  if (perfectScores.length >= 1) {
    achievements.push({
      id: 'perfect_1',
      title: 'Perfect Score',
      description: 'Achieved 100% on a test',
      icon: '🎯',
      earnedDate: perfectScores[0].date
    });
  }

  if (perfectScores.length >= 5) {
    achievements.push({
      id: 'perfect_5',
      title: 'Perfectionist',
      description: 'Achieved 100% on 5 tests',
      icon: '⭐',
      earnedDate: perfectScores[4].date
    });
  }

  // Level Achievements
  const levelCounts = progressData.levelProgress;
  if (levelCounts['C1-C2'] >= 5) {
    achievements.push({
      id: 'advanced_level',
      title: 'Advanced Speaker',
      description: 'Scored at C1-C2 level 5 times',
      icon: '🎓',
      earnedDate: progressData.lastTestDate
    });
  }

  // Sort by earned date (most recent first)
  return achievements.sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate));
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Export progress data for backup
export const exportProgressData = () => {
  const progressData = getProgressData();
  const dataStr = JSON.stringify(progressData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `mr-fox-english-progress-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(link.href);
};

// Clear all progress data (with confirmation)
export const clearAllProgress = () => {
  if (window.confirm('Are you sure you want to clear all progress data? This cannot be undone.')) {
    try {
      localStorage.removeItem(PROGRESS_DATA_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing progress data:', error);
      return false;
    }
  }
  return false;
};

// Import progress data from backup
export const importProgressData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate data structure
    if (typeof data !== 'object' || !Array.isArray(data.testHistory)) {
      throw new Error('Invalid data format');
    }
    
    // Merge with defaults to ensure all properties exist
    const validatedData = {
      ...DEFAULT_PROGRESS_DATA,
      ...data,
      levelProgress: {
        ...DEFAULT_PROGRESS_DATA.levelProgress,
        ...(data.levelProgress || {})
      }
    };
    
    return saveProgressData(validatedData);
  } catch (error) {
    console.error('Error importing progress data:', error);
    return false;
  }
};

// Get statistics for admin/debugging
export const getDataStats = () => {
  const progressData = getProgressData();
  const stats = {
    totalTests: progressData.totalTests,
    totalHistory: progressData.testHistory.length,
    streakInfo: {
      current: progressData.streak,
      best: progressData.bestStreak
    },
    levelDistribution: progressData.levelProgress,
    dailyStatsCount: Object.keys(progressData.dailyStats).length,
    storageSize: new Blob([JSON.stringify(progressData)]).size
  };
  
  return stats;
};
