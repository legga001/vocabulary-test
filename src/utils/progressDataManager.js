// src/utils/progressDataManager.js - Clean rewrite with daily target integration
const PROGRESS_DATA_KEY = 'mrFoxEnglishProgressData';
const DAILY_TARGETS_KEY = 'mrFoxEnglishDailyTargets';
const MAX_HISTORY_DAYS = 100;

// Quiz type mappings for better UX
const QUIZ_TYPE_MAPPINGS = {
  'standard-vocabulary': { display: 'Standard Vocabulary', icon: '📖' },
  'article-vocabulary': { display: 'Article Vocabulary', icon: '📰' },
  'real-fake-words': { display: 'Real or Fake Words', icon: '🎯' },
  'listen-and-type': { display: 'Listen and Type', icon: '🎧' },
  'speak-and-record': { display: 'Speak and Record', icon: '🎤' },
  'default': { display: 'Vocabulary Practice', icon: '📚' }
};

// Default progress data structure
const DEFAULT_PROGRESS_DATA = {
  totalTests: 0,
  streak: 0,
  bestStreak: 0,
  lastTestDate: null,
  startDate: null,
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

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Get today's date string
const getTodayString = () => new Date().toDateString();

// Get user's estimated level based on score
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
  if (!lastTestDate) return 1;
  
  const lastDate = new Date(lastTestDate).toDateString();
  const todayStr = today.toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  if (lastDate === todayStr) return 0; // Same day
  if (lastDate === yesterday) return 1; // Consecutive day
  return 'reset'; // Streak broken
};

// ==============================================
// DATA LOADING/SAVING FUNCTIONS
// ==============================================

// Load progress data with error handling
const getProgressData = () => {
  try {
    const saved = localStorage.getItem(PROGRESS_DATA_KEY);
    if (saved) {
      const data = JSON.parse(saved);
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
// DAILY TARGET FUNCTIONS
// ==============================================

// Get daily target data
const getDailyTargetData = () => {
  try {
    const saved = localStorage.getItem(DAILY_TARGETS_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const today = getTodayString();
      
      if (data.date === today) {
        return data.targets;
      }
    }
  } catch (error) {
    console.error('Error loading daily targets:', error);
  }
  
  return {};
};

// Save daily target data
const saveDailyTargetData = (targets) => {
  try {
    const dataToSave = {
      date: getTodayString(),
      targets: targets
    };
    localStorage.setItem(DAILY_TARGETS_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error saving daily targets:', error);
    return false;
  }
};

// Increment daily target for specific exercise type
const incrementDailyTarget = (exerciseType) => {
  try {
    const currentTargets = getDailyTargetData();
    const newTargets = {
      ...currentTargets,
      [exerciseType]: (currentTargets[exerciseType] || 0) + 1
    };
    
    if (saveDailyTargetData(newTargets)) {
      // Trigger storage event to update UI immediately
      window.dispatchEvent(new StorageEvent('storage', {
        key: DAILY_TARGETS_KEY,
        newValue: JSON.stringify({
          date: getTodayString(),
          targets: newTargets
        })
      }));
      
      console.log(`✅ Daily target incremented for ${exerciseType}: ${newTargets[exerciseType]}`);
      return newTargets;
    }
  } catch (error) {
    console.error('Error incrementing daily target:', error);
  }
  
  return null;
};

// ==============================================
// MAIN RECORDING FUNCTION
// ==============================================

// Record a completed test and increment daily targets
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

  console.log(`📊 Recording test result: ${quizType}, Score: ${score}/${totalQuestions}`);

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
  
  // Keep only recent history
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
  
  // Normalize score to 10-point scale for consistency
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

  // Update best streak
  if (progressData.streak > progressData.bestStreak) {
    progressData.bestStreak = progressData.streak;
  }

  // Update level progress
  progressData.levelProgress[level] = (progressData.levelProgress[level] || 0) + 1;
  progressData.lastTestDate = completedAt.toISOString();

  // Set start date if not set
  if (!progressData.startDate) {
    progressData.startDate = completedAt.toISOString();
  }

  // Save progress data
  saveProgressData(progressData);

  // Increment daily target - this updates the landing page progress bars
  incrementDailyTarget(quizType);

  console.log(`✅ Test recorded and daily target incremented for: ${quizType}`);
  return progressData;
};

// ==============================================
// DATA RETRIEVAL FUNCTIONS
// ==============================================

// Get recent test history
export const getRecentTests = (limit = 10) => {
  const progressData = getProgressData();
  return progressData.testHistory.slice(0, limit);
};

// Get daily stats for charts
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

// Get exercise performance analytics
export const getExercisePerformance = () => {
  const progressData = getProgressData();
  const exerciseStats = {};
  
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
    
    // Normalize to percentage for consistency
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
    
    // Track recent scores for trend analysis
    stat.recentScores.push({
      score: scorePercentage,
      date: test.date,
      normalizedScore: normalizedScore
    });
    
    // Keep only last 10 scores
    if (stat.recentScores.length > 10) {
      stat.recentScores = stat.recentScores.slice(-10);
    }
  });
  
  // Calculate trends
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

// Get overall progress statistics
export const getProgressStats = () => {
  const progressData = getProgressData();
  const recentTests = progressData.testHistory.slice(0, 10);
  
  // Calculate average score (normalize 20-question tests)
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

  // Calculate improvement trend
  let trend = 'stable';
  if (recentTests.length >= 10) {
    const recent5 = recentTests.slice(0, 5);
    const older5 = recentTests.slice(5, 10);
    
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
// LEARNING INSIGHTS FUNCTION
// ==============================================

export const getLearningInsights = () => {
  const progressData = getProgressData();
  const exercisePerformance = getExercisePerformance();
  
  // Find strongest skill
  const exerciseEntries = Object.entries(exercisePerformance);
  const strongestSkill = exerciseEntries.length > 0
    ? exerciseEntries.reduce((a, b) => a[1].averageScore > b[1].averageScore ? a : b)
    : null;

  // Find most improved skill
  const improvingSkills = exerciseEntries.filter(([, data]) => data.improvement === 'improving');
  const mostImproved = improvingSkills.length > 0 
    ? improvingSkills.reduce((a, b) => a[1].averageScore > b[1].averageScore ? a : b)
    : null;

  // Find area needing work
  const needsWork = exerciseEntries.length > 0
    ? exerciseEntries.reduce((a, b) => a[1].averageScore < b[1].averageScore ? a : b)
    : null;

  // Calculate consistency
  let consistency = 'stable';
  const recentTests = progressData.testHistory.slice(0, 10);
  if (recentTests.length >= 5) {
    const scores = recentTests.map(test => 
      test.totalQuestions === 20 ? (test.score / 2) : test.score
    );
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 1) consistency = 'very consistent';
    else if (stdDev < 2) consistency = 'consistent';
    else if (stdDev < 3) consistency = 'somewhat variable';
    else consistency = 'quite variable';
  }

  return {
    strongestSkill: strongestSkill ? {
      name: strongestSkill[0],
      score: strongestSkill[1].averageScore,
      icon: strongestSkill[1].icon
    } : null,
    mostImproved: mostImproved ? {
      name: mostImproved[0],
      score: mostImproved[1].averageScore,
      icon: mostImproved[1].icon
    } : null,
    needsWork: needsWork ? {
      name: needsWork[0],
      score: needsWork[1].averageScore,
      icon: needsWork[1].icon
    } : null,
    consistency,
    totalExerciseTypes: exerciseEntries.length,
    recentPerformance: recentTests.length > 0 ? recentTests[0].percentage : 0
  };
};

// ==============================================
// ACHIEVEMENTS FUNCTION
// ==============================================

export const getAchievements = () => {
  const progressData = getProgressData();
  const achievements = [];
  
  // First Test Achievement
  if (progressData.totalTests >= 1) {
    achievements.push({
      id: 'first_test',
      title: 'First Steps',
      description: 'Completed your first exercise',
      icon: '🎯',
      earnedAt: progressData.testHistory[progressData.testHistory.length - 1]?.date || null,
      type: 'milestone'
    });
  }
  
  // Streak Achievements
  if (progressData.bestStreak >= 3) {
    achievements.push({
      id: 'streak_3',
      title: '3-Day Streak',
      description: 'Practiced for 3 consecutive days',
      icon: '🔥',
      earnedAt: null,
      type: 'streak'
    });
  }
  
  if (progressData.bestStreak >= 7) {
    achievements.push({
      id: 'streak_7',
      title: 'Weekly Warrior',
      description: 'Practiced for 7 consecutive days',
      icon: '⚡',
      earnedAt: null,
      type: 'streak'
    });
  }
  
  if (progressData.bestStreak >= 30) {
    achievements.push({
      id: 'streak_30',
      title: 'Monthly Master',
      description: 'Practiced for 30 consecutive days',
      icon: '👑',
      earnedAt: null,
      type: 'streak'
    });
  }
  
  // Test Count Achievements
  if (progressData.totalTests >= 10) {
    achievements.push({
      id: 'tests_10',
      title: 'Getting Started',
      description: 'Completed 10 exercises',
      icon: '📚',
      earnedAt: null,
      type: 'milestone'
    });
  }
  
  if (progressData.totalTests >= 50) {
    achievements.push({
      id: 'tests_50',
      title: 'Dedicated Learner',
      description: 'Completed 50 exercises',
      icon: '🎓',
      earnedAt: null,
      type: 'milestone'
    });
  }
  
  if (progressData.totalTests >= 100) {
    achievements.push({
      id: 'tests_100',
      title: 'Century Club',
      description: 'Completed 100 exercises',
      icon: '💯',
      earnedAt: null,
      type: 'milestone'
    });
  }
  
  // Perfect Score Achievement
  const perfectScores = progressData.testHistory.filter(test => test.percentage === 100);
  if (perfectScores.length >= 1) {
    achievements.push({
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Achieved 100% on an exercise',
      icon: '⭐',
      earnedAt: perfectScores[0].date,
      type: 'performance'
    });
  }
  
  // Level Achievements
  const levelCounts = progressData.levelProgress;
  if (levelCounts['C1-C2'] >= 5) {
    achievements.push({
      id: 'advanced_level',
      title: 'Advanced Learner',
      description: 'Scored at C1-C2 level 5 times',
      icon: '🏆',
      earnedAt: null,
      type: 'level'
    });
  }
  
  return achievements;
};

// ==============================================
// DATA MANAGEMENT FUNCTIONS
// ==============================================

// Clear all progress data
export const clearProgressData = () => {
  try {
    localStorage.removeItem(PROGRESS_DATA_KEY);
    localStorage.removeItem(DAILY_TARGETS_KEY);
    console.log('All progress data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing progress data:', error);
    return false;
  }
};

// Alias for backwards compatibility
export const clearAllProgress = clearProgressData;

// Export progress data for backup
export const exportProgressData = () => {
  try {
    const data = getProgressData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mr-fox-english-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting progress data:', error);
    return false;
  }
};

// Import progress data from backup
export const importProgressData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    if (data && typeof data === 'object' && Array.isArray(data.testHistory)) {
      saveProgressData(data);
      console.log('Progress data imported successfully');
      return true;
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    console.error('Error importing progress data:', error);
    return false;
  }
};
