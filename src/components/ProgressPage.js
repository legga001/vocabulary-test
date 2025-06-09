// src/components/ProgressPage.js - Updated with weaknesses analysis
import React, { useState, useEffect } from 'react';
import {
  getProgressStats,
  getRecentTests,
  exportProgressData,
  clearAllProgress
} from '../utils/progressDataManager';

function ProgressPage({ onBack }) {
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [weaknesses, setWeaknesses] = useState({ levels: [], words: [], exercises: [] });

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = () => {
    const progressStats = getProgressStats();
    const tests = getRecentTests(20); // Get more tests for better analysis
    
    setStats(progressStats);
    setRecentTests(tests.slice(0, 15)); // Still show only 15 in recent tests
    
    // Analyse weaknesses from recent tests
    analyseWeaknesses(tests);
  };

  const analyseWeaknesses = (tests) => {
    if (tests.length === 0) {
      setWeaknesses({ levels: [], words: [], exercises: [] });
      return;
    }

    // 1. Analyse level performance
    const levelPerformance = {};
    const exercisePerformance = {};
    const incorrectWords = [];

    tests.forEach(test => {
      // Track level performance
      const level = test.level;
      if (!levelPerformance[level]) {
        levelPerformance[level] = { correct: 0, total: 0 };
      }
      
      // For tests with 10 questions, each answer represents 10% of the score
      const normalizedScore = test.totalQuestions === 20 ? test.score / 2 : test.score;
      levelPerformance[level].total += 10;
      levelPerformance[level].correct += normalizedScore;

      // Track exercise type performance
      const exerciseType = test.quizTypeDisplay || 'Standard Vocabulary';
      if (!exercisePerformance[exerciseType]) {
        exercisePerformance[exerciseType] = { scores: [], icon: test.quizTypeIcon || '📚' };
      }
      exercisePerformance[exerciseType].scores.push(test.percentage);

      // Collect incorrect words (if available in userAnswers)
      if (test.userAnswers && Array.isArray(test.userAnswers)) {
        test.userAnswers.forEach(answer => {
          if (!answer.isCorrect && answer.answer) {
            incorrectWords.push({
              word: answer.answer,
              testDate: test.date,
              exerciseType: exerciseType
            });
          }
        });
      }
    });

    // Find weak levels (below 70% success rate)
    const weakLevels = Object.entries(levelPerformance)
      .map(([level, data]) => ({
        level,
        percentage: Math.round((data.correct / data.total) * 100),
        total: data.total
      }))
      .filter(item => item.percentage < 70 && item.total >= 10) // Only show if enough attempts
      .sort((a, b) => a.percentage - b.percentage);

    // Find weak exercise types (below average performance)
    const weakExercises = Object.entries(exercisePerformance)
      .map(([type, data]) => ({
        type,
        icon: data.icon,
        averageScore: Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length),
        attempts: data.scores.length
      }))
      .filter(item => item.averageScore < 75 && item.attempts >= 3)
      .sort((a, b) => a.averageScore - b.averageScore);

    // Find most commonly missed words
    const wordCounts = {};
    incorrectWords.forEach(item => {
      if (!wordCounts[item.word]) {
        wordCounts[item.word] = { count: 0, exercises: new Set() };
      }
      wordCounts[item.word].count++;
      wordCounts[item.word].exercises.add(item.exerciseType);
    });

    const problemWords = Object.entries(wordCounts)
      .map(([word, data]) => ({
        word,
        count: data.count,
        exercises: Array.from(data.exercises)
      }))
      .filter(item => item.count >= 2) // Missed at least twice
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 problem words

    setWeaknesses({
      levels: weakLevels,
      words: problemWords,
      exercises: weakExercises
    });
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

  // Get quiz type display with icon
  const getQuizTypeDisplay = (test) => {
    const icon = test.quizTypeIcon || '📚';
    const display = test.quizTypeDisplay || 'Vocabulary Test';
    return `${icon} ${display}`;
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

      {/* Weaknesses Analysis Section */}
      <div className="weaknesses-section">
        <div className="weaknesses-header">
          <h3>🎯 Areas for Improvement</h3>
          <p>Based on your recent test performance</p>
        </div>

        {(weaknesses.levels.length > 0 || weaknesses.words.length > 0 || weaknesses.exercises.length > 0) ? (
          <div className="weaknesses-grid">
            {/* Weak Levels */}
            {weaknesses.levels.length > 0 && (
              <div className="weakness-card">
                <h4>📚 Challenging Levels</h4>
                <div className="weakness-items">
                  {weaknesses.levels.map((level, index) => (
                    <div key={index} className="weakness-item level-weakness">
                      <div className="weakness-info">
                        <span className="weakness-title">{level.level}</span>
                        <span className="weakness-detail">{level.percentage}% success rate</span>
                      </div>
                      <div className="weakness-suggestion">
                        Practice more {level.level} level vocabulary
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Problem Words */}
            {weaknesses.words.length > 0 && (
              <div className="weakness-card">
                <h4>🔤 Tricky Words</h4>
                <div className="weakness-items">
                  {weaknesses.words.map((word, index) => (
                    <div key={index} className="weakness-item word-weakness">
                      <div className="weakness-info">
                        <span className="weakness-title">"{word.word}"</span>
                        <span className="weakness-detail">Missed {word.count} times</span>
                      </div>
                      <div className="weakness-suggestion">
                        Review this word's meaning and usage
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Exercise Types */}
            {weaknesses.exercises.length > 0 && (
              <div className="weakness-card">
                <h4>💪 Exercise Focus</h4>
                <div className="weakness-items">
                  {weaknesses.exercises.map((exercise, index) => (
                    <div key={index} className="weakness-item exercise-weakness">
                      <div className="weakness-info">
                        <span className="weakness-title">{exercise.icon} {exercise.type}</span>
                        <span className="weakness-detail">{exercise.averageScore}% average</span>
                      </div>
                      <div className="weakness-suggestion">
                        Focus more practice on this exercise type
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-weaknesses">
            <div className="no-weaknesses-icon">🌟</div>
            <h4>Excellent Work!</h4>
            <p>You're performing well across all areas. Keep up the great work!</p>
            {stats.totalTests < 5 && (
              <p><small>Complete more tests to get detailed weakness analysis.</small></p>
            )}
          </div>
        )}
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
                    {getQuizTypeDisplay(test)}
                  </div>
                  <div className="test-date">{formatDate(test.date)}</div>
                  <div className="test-details">
                    {test.totalQuestions} questions • {test.percentage}% correct
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
