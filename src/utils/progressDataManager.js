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

// Get user's estimated level based on score and total questions
const getScoreLevel = (score, totalQuestions = 10) => {
  const percentage = (score / totalQuestions) * 100;
  if (percentage <= 25) return 'A1-A2';
  if (percentage <= 50) return 'A2-B1';
  if (percentage <= 70) return 'B1-B2';
  if (percentage <= 85) return 'B2-C1';
  return 'C1-C2';
};

// Get display name for quiz types
const getQuizTypeDisplay = (type) => {
  switch(type) {
    case 'realFakeWords': return 'Word Recognition';
    case 'article': return 'Article-Based';
    case 'standard': return 'Standard Vocabulary';
    default: return 'Vocabulary Test';
  }
};

// Get icon for quiz types
const getQuizTypeIcon = (type) => {
  switch(type) {
    case 'realFakeWords': return '🎯';
    case 'article': return '📰';
    case 'standard': return '📚';
    default: return '📚';
  }
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
  const level = getScoreLevel(score, totalQuestions);

  // Create test record
  const testRecord = {
    id: Date.now(),
    date: completedAt.toISOString(),
    quizType,
    quizTypeDisplay: getQuizTypeDisplay(quizType),
    quizTypeIcon: getQuizTypeIcon(quizType),
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
  
  // Calculate score out of 10 for consistency in daily averages
  const normalizedScore = totalQuestions === 20 ? score / 2 : score;
  dailyStat.totalScore += normalizedScore;
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
  const levelCounts = Object.entries(progressData.levelProgress);
  const mostCommonLevel = levelCounts.reduce((a, b) => a[1] > b[1] ? a : b)[0];

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