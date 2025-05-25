// src/components/ProgressPage.js
import React, { useState, useEffect } from 'react';
import {
  getProgressStats,
  getRecentTests,
  getDailyStatsForChart,
  exportProgressData,
  clearAllProgress
} from '../utils/progressDataManager';

function ProgressPage({ onBack }) {
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState(30);

  useEffect(() => {
    loadProgressData();
  }, [chartPeriod]);

  const loadProgressData = () => {
    setStats(getProgressStats());
    setRecentTests(getRecentTests(15));
    setChartData(getDailyStatsForChart(chartPeriod));
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

  if (!stats) return <div>Loading progress...</div>;

  return (
    <div className="progress-page">
      <div className="logo-container">
        <img 
          src="/purple_fox_transparent.png" 
          alt="Mr. Fox English" 
          className="app-logo"
        />
      </div>
      
      <h1>📊 Your Progress</h1>

      {/* Overview Stats */}
      <div className="progress-overview">
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.totalTests}</div>
            <div className="stat-label">Total Tests</div>
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
            <h3>📅 This Week</h3>
            <p><strong>{stats.testsThisWeek}</strong> tests completed</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h3>📊 Daily Performance</h3>
          <div className="chart-controls">
            <button 
              className={`chart-period-btn ${chartPeriod === 7 ? 'active' : ''}`}
              onClick={() => setChartPeriod(7)}
            >
              7 Days
            </button>
            <button 
              className={`chart-period-btn ${chartPeriod === 30 ? 'active' : ''}`}
              onClick={() => setChartPeriod(30)}
            >
              30 Days
            </button>
          </div>
        </div>
        
        <div className="simple-chart">
          {chartData.map((day, index) => (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar"
                style={{
                  height: `${Math.max(day.averageScore * 10, 2)}px`,
                  backgroundColor: day.testsCompleted > 0 ? '#4c51bf' : '#e2e8f0'
                }}
                title={`${day.date}: ${day.testsCompleted} tests, ${day.averageScore}/10 avg`}
              />
              <div className="chart-label">{day.date}</div>
            </div>
          ))}
        </div>
        
        <div className="chart-legend">
          <span>📊 Average daily score (height) • 📅 Test frequency (color)</span>
        </div>
      </div>

      {/* Recent Tests */}
      <div className="recent-tests">
        <h3>📝 Recent Test Results</h3>
        {recentTests.length > 0 ? (
          <div className="test-list">
            {recentTests.map((test) => (
              <div key={test.id} className="test-item">
                <div className="test-info">
                  <div className="test-type">
                    {test.quizType === 'article' ? '📰' : '📚'} 
                    {test.quizType === 'article' ? 'Article' : 'Standard'} Test
                  </div>
                  <div className="test-date">{formatDate(test.date)}</div>
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
            <p>No tests completed yet. Start practicing to see your progress!</p>
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