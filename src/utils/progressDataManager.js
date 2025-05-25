// src/utils/progressDataManager.js
// Manages long-term user progress data in localStorage

const PROGRESS_DATA_KEY = 'mrFoxEnglishProgressData';
const MAX_HISTORY_DAYS = 365; // Keep 1 year of history

// Initialize or get existing progress data
export const getProgressData = () => {
  try {
    const saved = localStorage.getItem(PROGRESS_DATA_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        totalTests: data.totalTests || 0,
        streak: data.streak || 0,
        bestStreak: data.bestStreak || 0,
        lastTestDate: data.lastTestDate || null,
        testHistory: data.testHistory || [],
        dailyStats: data.dailyStats || {},
        levelProgress: data.levelProgress || {
          'A1-A2': 0,
          'A2-B1': 0,
          'B1-B2': 0,
          'B2-C1': 0,
          'C1-C2': 0
        }
      };
    }
  } catch (error) {
    console.error('Error loading progress data:', error);
  }
  
  // Return default structure if no data or error
  return {
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
  };
};

// Save progress data
const saveProgressData = (data) => {
  try {
    localStorage.setItem(PROGRESS_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving progress data:', error);
    return false;
  }
};

// Get user's estimated level based on score
const getScoreLevel = (score) => {
  if (score <= 2) return 'A1-A2';
  if (score <= 4) return 'A2-B1';
  if (score <= 6) return 'B1-B2';
  if (score <= 8) return 'B2-C1';
  return 'C1-C2';
};

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
  const today = new Date().toDateString();
  const level = getScoreLevel(score);

  // Create test record
  const testRecord = {
    id: Date.now(),
    date: completedAt.toISOString(),
    quizType,
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    level,
    timeSpent,
    userAnswers: userAnswers.map(answer => ({ answer, isCorrect: true })) // Simplified for storage
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
  if (!progressData.dailyStats[today]) {
    progressData.dailyStats[today] = {
      testsCompleted: 0,
      totalScore: 0,
      averageScore: 0,
      timeSpent: 0
    };
  }

  const dailyStat = progressData.dailyStats[today];
  dailyStat.testsCompleted += 1;
  dailyStat.totalScore += score;
  dailyStat.averageScore = Math.round(dailyStat.totalScore / dailyStat.testsCompleted);
  if (timeSpent) dailyStat.timeSpent += timeSpent;

  // Update streak
  const lastTestDate = progressData.lastTestDate ? new Date(progressData.lastTestDate).toDateString() : null;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  if (lastTestDate === today) {
    // Same day, streak continues
  } else if (lastTestDate === yesterday || !lastTestDate) {
    // Consecutive day or first test
    progressData.streak += 1;
  } else {
    // Streak broken
    progressData.streak = 1;
  }

  // Update best streak
  if (progressData.streak > progressData.bestStreak) {
    progressData.bestStreak = progressData.streak;
  }

  // Update level progress
  progressData.levelProgress[level] += 1;
  progressData.lastTestDate = completedAt.toISOString();

  // Save and return updated data
  saveProgressData(progressData);
  return progressData;
};

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

// Get progress statistics
export const getProgressStats = () => {
  const progressData = getProgressData();
  const recentTests = progressData.testHistory.slice(0, 10);
  
  const averageScore = recentTests.length > 0 
    ? Math.round(recentTests.reduce((sum, test) => sum + test.score, 0) / recentTests.length)
    : 0;

  const averagePercentage = recentTests.length > 0
    ? Math.round(recentTests.reduce((sum, test) => sum + test.percentage, 0) / recentTests.length)
    : 0;

  // Find most common level
  const levelCounts = Object.entries(progressData.levelProgress);
  const mostCommonLevel = levelCounts.reduce((a, b) => a[1] > b[1] ? a : b)[0];

  // Calculate improvement trend (compare first 5 vs last 5 tests)
  let trend = 'stable';
  if (recentTests.length >= 10) {
    const recent5 = recentTests.slice(0, 5);
    const older5 = recentTests.slice(5, 10);
    const recentAvg = recent5.reduce((sum, test) => sum + test.score, 0) / 5;
    const olderAvg = older5.reduce((sum, test) => sum + test.score, 0) / 5;
    
    if (recentAvg > olderAvg + 0.5) trend = 'improving';
    else if (recentAvg < olderAvg - 0.5) trend = 'declining';
  }

  return {
    totalTests: progressData.totalTests,
    currentStreak: progressData.streak,
    bestStreak: progressData.bestStreak,
    averageScore,
    averagePercentage,
    mostCommonLevel,
    trend,
    lastTestDate: progressData.lastTestDate,
    testsThisWeek: recentTests.filter(test => {
      const testDate = new Date(test.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return testDate > weekAgo;
    }).length
  };
};

// Export progress data for backup
export const exportProgressData = () => {
  const progressData = getProgressData();
  const dataStr = JSON.stringify(progressData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `mr-fox-english-progress-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

// Clear all progress data (with confirmation)
export const clearAllProgress = () => {
  if (window.confirm('Are you sure you want to clear all progress data? This cannot be undone.')) {
    localStorage.removeItem(PROGRESS_DATA_KEY);
    return true;
  }
  return false;
};