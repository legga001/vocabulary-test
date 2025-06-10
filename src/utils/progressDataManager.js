// src/utils/progressDataManager.js - Complete rewrite with all functions
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
  }
});

// Quiz type display mappings
const QUIZ_TYPE_MAPPINGS = Object.freeze({
  realFakeWords: { display: 'Word Recognition', icon: '🎯' },
  article: { display: 'Article-Based', icon: '📰' },
  'speak-and-record': { display: 'Speaking Practice', icon: '🎤' },
  'listen-and-type': { display: 'Listen & Type', icon: '🎧' },
  standard: { display: 'Standard Vocabulary', icon: '📚' },
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
        totalTests: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        recentScores: [],
        icon: test.quizTypeIcon || '📚',
        trend: 'stable'
      };
    }
    
    const stat = exerciseStats[exerciseType];
    stat.totalTests++;
    
    // Normalise score to 10-point scale for consistency
    const normalizedScore = test.totalQuestions === 20 ? test.score / 2 : test.score;
    stat.totalScore += normalizedScore;
    stat.averageScore = Math.round(stat.totalScore / stat.totalTests);
    
    if (normalizedScore > stat.bestScore) {
      stat.bestScore = normalizedScore;
    }
    
    // Keep track of recent scores for trend analysis
    stat.recentScores.push({
      score: normalizedScore,
      date: test.date,
      percentage: test.percentage
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
        
        if (recentAvg > olderAvg + 0.5) {
          stat.trend = 'improving';
        } else if (recentAvg < olderAvg - 0.5) {
          stat.trend = 'declining';
        } else {
          stat.trend = 'stable';
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

  return {
    totalTests: progressData.totalTests,
    currentStreak: progressData.streak,
    bestStreak: progressData.bestStreak,
    averageScore,
    averagePercentage,
    mostCommonLevel,
    trend,
    lastTestDate: progressData.lastTestDate,
    testsThisWeek
  };
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
