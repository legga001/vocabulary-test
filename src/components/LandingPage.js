// src/components/LandingPage.js - Redesigned with Duolingo-style layout
import React, { useEffect, useState } from 'react';

function LandingPage({ onExercises, onProgress, onSelectExercise, isTransitioning }) {
  const [showExercises, setShowExercises] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showDrawer, setShowDrawer] = useState(false);

  // Trigger exercise animations after component mounts
  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setShowExercises(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const categories = [
    { id: 'ALL', name: 'ALL', icon: '📚' },
    { id: 'READING', name: 'READING', icon: '📖' },
    { id: 'WRITING', name: 'WRITING', icon: '✍️' },
    { id: 'LISTENING', name: 'LISTENING', icon: '🎧' },
    { id: 'SPEAKING', name: 'SPEAKING', icon: '🎤' }
  ];

  const exercises = [
    {
      type: 'reading',
      category: 'READING',
      icon: '📖',
      title: 'Standard Vocabulary',
      subtitle: 'Fill in the gaps',
      progress: '6/10',
      isActive: true
    },
    {
      type: 'reading',
      category: 'READING', 
      icon: '📰',
      title: 'Article-Based Vocab',
      subtitle: 'Real news stories',
      progress: '3/8',
      isActive: true
    },
    {
      type: 'reading',
      category: 'READING',
      icon: '🎯',
      title: 'Real or Fake Words',
      subtitle: 'Quick recognition',
      progress: '2/5',
      isActive: true,
      isNew: true
    },
    {
      type: 'writing',
      category: 'WRITING',
      icon: '✍️',
      title: 'Grammar Practice',
      subtitle: 'Sentence building',
      progress: '0/6',
      isActive: false
    },
    {
      type: 'writing',
      category: 'WRITING',
      icon: '📝',
      title: 'Essay Writing',
      subtitle: 'Structured responses',
      progress: '0/4',
      isActive: false
    },
    {
      type: 'listening',
      category: 'LISTENING',
      icon: '🎧',
      title: 'Audio Comprehension',
      subtitle: 'Listen and answer',
      progress: '0/7',
      isActive: false
    },
    {
      type: 'listening',
      category: 'LISTENING',
      icon: '🔊',
      title: 'Pronunciation',
      subtitle: 'Listen and repeat',
      progress: '0/5',
      isActive: false
    },
    {
      type: 'speaking',
      category: 'SPEAKING',
      icon: '🎤',
      title: 'Conversation Practice',
      subtitle: 'Speaking prompts',
      progress: '0/6',
      isActive: false
    },
    {
      type: 'speaking',
      category: 'SPEAKING',
      icon: '🗣️',
      title: 'Pronunciation Check',
      subtitle: 'Voice analysis',
      progress: '0/4',
      isActive: false
    }
  ];

  const getFilteredExercises = () => {
    if (selectedCategory === 'ALL') return exercises;
    return exercises.filter(ex => ex.category === selectedCategory);
  };

  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const handleExerciseClick = (exercise) => {
    if (exercise.isActive) {
      onSelectExercise(exercise.type);
    }
  };

  return (
    <div className={`landing-duolingo ${isTransitioning === false ? 'fade-in' : ''}`}>
      {/* Header */}
      <div className="duolingo-header">
        <button className="hamburger-btn" onClick={toggleDrawer}>
          <div className="hamburger-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        
        <div className="header-logo">
          <img 
            src="/purple_fox_transparent.png" 
            alt="Mr. Fox English" 
            className="header-logo-img"
          />
          <span className="header-title">mr. fox english</span>
        </div>
        
        <div className="header-right">
          <button className="progress-icon-btn" onClick={onProgress}>
            📊
          </button>
        </div>
      </div>

      {/* Slide-out Drawer */}
      <div className={`drawer-overlay ${showDrawer ? 'open' : ''}`} onClick={closeDrawer}></div>
      <div className={`navigation-drawer ${showDrawer ? 'open' : ''}`}>
        <button className="close-drawer-btn" onClick={closeDrawer}>×</button>
        
        <div className="drawer-content">
          <div className="drawer-item" onClick={() => { closeDrawer(); /* Navigate home */ }}>
            <span className="drawer-icon">🏠</span>
            <span className="drawer-text">HOME</span>
          </div>
          
          <div className="drawer-item active" onClick={closeDrawer}>
            <span className="drawer-icon">🎯</span>
            <span className="drawer-text">PRACTICE</span>
          </div>
          
          <div className="drawer-item" onClick={() => { closeDrawer(); onProgress(); }}>
            <span className="drawer-icon">📊</span>
            <span className="drawer-text">MY PROGRESS</span>
          </div>
          
          <div className="drawer-divider"></div>
          
          <div className="drawer-item">
            <span className="drawer-icon">⚙️</span>
            <span className="drawer-text">SETTINGS</span>
          </div>
          
          <div className="drawer-item">
            <span className="drawer-icon">🌐</span>
            <span className="drawer-text">SITE LANGUAGE</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Practice Full Test Button */}
        <div className="full-test-section">
          <div className="full-test-content">
            <h2>Take a full length practice test</h2>
            <div className="test-illustration">📋</div>
          </div>
          <button className="practice-test-btn" disabled>
            PRACTICE FULL TEST
            <span className="coming-soon-badge">Coming Soon</span>
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="categories-section">
          <h3>Skill practice</h3>
          <div className="categories-tabs">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises List */}
        <div className="exercises-list">
          {showExercises && getFilteredExercises().map((exercise, index) => (
            <div
              key={`${exercise.category}-${index}`}
              className={`exercise-item ${exercise.isActive ? 'active' : 'disabled'} ${exercise.isNew ? 'new-exercise' : ''}`}
              onClick={() => handleExerciseClick(exercise)}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="exercise-icon-container">
                <div className={`exercise-icon ${exercise.isActive ? 'active' : 'disabled'}`}>
                  {exercise.icon}
                </div>
                {exercise.isNew && <div className="new-badge">NEW</div>}
              </div>
              
              <div className="exercise-content">
                <h4 className="exercise-title">{exercise.title}</h4>
                <p className="exercise-subtitle">{exercise.subtitle}</p>
                
                {exercise.isActive && (
                  <div className="exercise-progress">
                    <div className="progress-bar-small">
                      <div 
                        className="progress-fill-small" 
                        style={{ width: `${(parseInt(exercise.progress) / parseInt(exercise.progress.split('/')[1])) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text-small">{exercise.progress}</span>
                  </div>
                )}
                
                {!exercise.isActive && (
                  <div className="coming-soon-small">Coming soon</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;