// src/components/ProgressPage.js - Updated with comprehensive progress tracking
import React, { useState, useEffect } from 'react';
import ClickableLogo from './ClickableLogo';
import {
  getProgressStats,
  getRecentTests,
  getExercisePerformance,
  getLearningInsights,
  getAchievements,
  exportProgressData,
  clearAllProgress
} from '../utils/progressDataManager';

function ProgressPage({ onBack, onLogoClick }) {
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [exercisePerformance, setExercisePerformance] = useState({});
  const [learningInsights, setLearningInsights] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = () => {
    const progressStats = getProgressStats();
    const tests = getRecentTests(15);
    const performance = getExercisePerformance();
    const insights = getLearningInsights();
    const userAchievements = getAchievements();
    
    setStats(progressStats);
    setRecentTests(tests);
    setExercisePerformance(performance);
    setLearningInsights(insights);
    setAchievements(userAchievements);
  };

  const handleExport = () => {
    exportProgressData();
  };

  const handleClearData = () => {
    if (clearAllProgress()) {
      loadProgressData(); // Refresh after clearing
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendText = (trend) => {
    switch (trend) {
      case 'improving': return 'Improving';
      case 'declining': return 'Needs attention';
      default: return 'Stable';
    }
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '💪';
    if (streak >= 3) return '🎯';
    return '🌟';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#48bb78';
    if (percentage >= 60) return '#ed8936';
    return '#f56565';
  };

  const getImprovementIcon = (improvement) => {
    switch (improvement) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getImprovementText = (improvement) => {
    switch (improvement) {
      case 'improving': return 'Improving';
      case 'declining': return 'Declining';
      case 'stable': return 'Stable';
      default: return 'New';
    }
  };

  if (!stats) return <div>Loading progress...</div>;

  return (
    <div className="progress-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      
      <h1>📊 Your Progress</h1>

      {/* 1. OVERALL STATISTICS */}
      <div className="progress-overview">
        <h2>📈 Overall Statistics</h2>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.totalTests}</div>
            <div className="stat-label">Total Exercises</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">{getStreakEmoji(stats.currentStreak)}</div>
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{stats.bestStreak}</div>
            <div className="stat-label">Best Streak</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats.averagePercentage}%</div>
            <div className="stat-label">Average Score</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatTime(stats.totalTimeSpent)}</div>
            <div className="stat-label">Time Spent Learning</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-value">{stats.favouriteExercise}</div>
            <div className="stat-label">Favourite Exercise</div>
          </div>
        </div>

        <div className="progress-insights">
          <div className="insight-card">
            <h3>🎚️ Your Level</h3>
            <p>Most common: <strong>{stats.mostCommonLevel}</strong></p>
          </div>
          
          <div className="insight-card">
            <h3>{getTrendIcon(stats.trend)} Progress Trend</h3>
            <p>{getTrendText(stats.trend)}</p>
          </div>
          
          <div className="insight-card">
            <h3>📅 Member Since</h3>
            <p>{formatDate(stats.startDate)}</p>
          </div>
        </div>
      </div>

      {/* 3. EXERCISE-SPECIFIC PERFORMANCE */}
      <div className="exercise-performance-section">
        <h2>🎯 Exercise Performance</h2>
        {Object.keys(exercisePerformance).length > 0 ? (
          <div className="performance-grid">
            {Object.entries(exercisePerformance).map(([exerciseType, performance]) => (
              <div key={exerciseType} className="performance-card">
                <div className="performance-header">
                  <span className="performance-icon">{performance.icon}</span>
                  <h4>{performance.displayName}</h4>
                  <span className="improvement-indicator">
                    {getImprovementIcon(performance.improvement)}
                  </span>
                </div>
                <div className="performance-stats">
                  <div className="stat-row">
                    <span>Attempts:</span>
                    <strong>{performance.attempts}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Average Score:</span>
                    <strong style={{ color: getScoreColor(performance.averageScore) }}>
                      {performance.averageScore}%
                    </strong>
                  </div>
                  <div className="stat-row">
                    <span>Best Score:</span>
                    <strong style={{ color: getScoreColor(performance.bestScore) }}>
                      {performance.bestScore}%
                    </strong>
                  </div>
                  {performance.totalTime > 0 && (
                    <div className="stat-row">
                      <span>Time Spent:</span>
                      <strong>{formatTime(Math.round(performance.totalTime / 60))}</strong>
                    </div>
                  )}
                  <div className="stat-row">
                    <span>Trend:</span>
                    <strong>{getImprovementText(performance.improvement)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-performance">
            <p>Complete some exercises to see your performance data!</p>
          </div>
        )}
      </div>

      {/* 4. ACHIEVEMENT BADGES/MILESTONES */}
      <div className="achievements-section">
        <h2>🏆 Achievements</h2>
        {achievements.length > 0 ? (
          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div key={achievement.id} className="achievement-badge">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <small>Earned: {formatDate(achievement.earnedDate)}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-achievements">
            <div className="no-achievements-icon">🎯</div>
            <h4>Start Your Achievement Journey!</h4>
            <p>Complete exercises to unlock achievements and track your progress.</p>
          </div>
        )}
      </div>

      {/* 5. LEARNING INSIGHTS */}
      <div className="learning-insights-section">
        <h2>💡 Learning Insights</h2>
        <div className="insights-grid">
          {learningInsights.strongestSkill && (
            <div className="insight-card large">
              <h4>🌟 Strongest Skill Area</h4>
              <div className="insight-content">
                <span className="insight-icon">{learningInsights.strongestSkill.icon}</span>
                <div>
                  <strong>{learningInsights.strongestSkill.displayName}</strong>
                  <p>Average: {learningInsights.strongestSkill.average}%</p>
                </div>
              </div>
            </div>
          )}

          {learningInsights.mostImproved && (
            <div className="insight-card large">
              <h4>📈 Most Improved</h4>
              <div className="insight-content">
                <span className="insight-icon">{learningInsights.mostImproved.icon}</span>
                <div>
                  <strong>{learningInsights.mostImproved.displayName}</strong>
                  <p>Great progress!</p>
                </div>
              </div>
            </div>
          )}

          <div className="insight-card large">
            <h4>🎯 Recommended Challenge</h4>
            <div className="insight-content">
              <span className="insight-icon">{learningInsights.recommendedChallenge.icon}</span>
              <div>
                <strong>{learningInsights.recommendedChallenge.displayName}</strong>
                <p>{learningInsights.recommendedChallenge.reason}</p>
              </div>
            </div>
          </div>

          {learningInsights.wordsToReview.length > 0 && (
            <div className="insight-card words-review">
              <h4>📝 Words to Review</h4>
              <div className="words-list">
                {learningInsights.wordsToReview.map((wordData, index) => (
                  <div key={index} className="word-item">
                    <span className="word-text">"{wordData.word}"</span>
                    <span className="word-count">Missed {wordData.count} times</span>
                    <span className="word-exercises">
                      in {wordData.exercises.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tests History */}
      <div className="recent-tests">
        <div className="recent-tests-header">
          <h2>📝 Recent Test Results</h2>
        </div>
        {recentTests.length > 0 ? (
          <div className="test-list">
            {recentTests.slice(0, 10).map((test) => (
              <div key={test.id} className="test-item">
                <div className="test-info">
                  <div className="test-type">
                    {test.quizTypeIcon} {test.quizTypeDisplay}
                  </div>
                  <div className="test-date">{formatDate(test.date)}</div>
                  <div className="test-details">
                    {test.totalQuestions} questions • {test.percentage}% correct
                    {test.timeSpent && ` • ${formatTime(Math.round(test.timeSpent / 60))}`}
                  </div>
                </div>
                <div className="test-score">
                  <div 
                    className="score-circle"
                    style={{ borderColor: getScoreColor(test.percentage) }}
                  >
                    <span style={{ color: getScoreColor(test.percentage) }}>
                      {test.score}/{test.totalQuestions}
                    </span>
                  </div>
                  <div className="score-level">{test.level}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tests">
            <p>No tests completed yet. Start practising to see your progress!</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="progress-actions">
        <button className="btn btn-secondary" onClick={handleExport}>
          💾 Export Data
        </button>
        <button className="btn btn-danger" onClick={handleClearData}>
          🗑️ Clear All Data
        </button>
      </div>

      <button className="btn btn-secondary back-btn" onClick={onBack}>
        ← Back to Main Menu
      </button>
    </div>
  );
}

export default ProgressPage;
