// src/components/LandingPage.js - Complete with Listen and Type only
import React, { useEffect, useState } from 'react';

function LandingPage({ onExercises, onProgress, onSelectExercise, isTransitioning }) {
  const [showExercises, setShowExercises] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    // READING EXERCISES
    {
      type: 'standard-vocabulary',
      category: 'READING',
      icon: '📖',
      title: 'Standard Vocabulary',
      subtitle: 'Fill in the gaps',
      progress: '6/10',
      isActive: true
    },
    {
      type: 'article-vocabulary', 
      category: 'READING', 
      icon: '📰',
      title: 'Article-Based Vocab',
      subtitle: 'Real news stories',
      progress: '3/8',
      isActive: true
    },
    {
      type: 'real-fake-words',
      category: 'READING',
      icon: '🎯',
      title: 'Real or Fake Words',
      subtitle: 'Quick recognition',
      progress: '2/5',
      isActive: true,
      isNew: true
    },
    
    // LISTENING EXERCISES
    {
      type: 'listen-and-type',
      category: 'LISTENING',
      icon: '🎧',
      title: 'Listen and Type',
      subtitle: 'Type what you hear',
      progress: '0/10',
      isActive: true,
      isNew: true,
      isDET: true
    },
    {
      type: 'listening',
      category: 'LISTENING',
      icon: '🔊',
      title: 'Audio Comprehension',
      subtitle: 'Listen and answer',
      progress: '0/7',
      isActive: false
    },
    {
      type: 'listening',
      category: 'LISTENING',
      icon: '🎵',
      title: 'Pronunciation Practice',
      subtitle: 'Listen and repeat',
      progress: '0/5',
      isActive: false
    },
    
    // WRITING EXERCISES
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
    
    // SPEAKING EXERCISES
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

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const handleMenuItemClick = (action) => {
    closeMobileMenu();
    if (action === 'progress') onProgress();
  };

  const handleExerciseClick = (exercise) => {
    if (exercise.isActive) {
      onSelectExercise(exercise.type);
    }
  };

  const menuItems = [
    { id: 'home', icon: '🏠', text: 'HOME', action: null, isActive: true },
    { id: 'practice', icon: '🎯', text: 'PRACTICE', action: null, isActive: true },
    { id: 'progress', icon: '📊', text: 'MY PROGRESS', action: 'progress', isActive: false },
    { id: 'settings', icon: '⚙️', text: 'SETTINGS', action: null, isActive: false },
    { id: 'language', icon: '🌐', text: 'SITE LANGUAGE', action: null, isActive: false },
    { id: 'logout', icon: '↗️', text: 'LOG OUT', action: null, isActive: false }
  ];

  return (
    <div className={`landing-duolingo ${isTransitioning === false ? 'fade-in' : ''}`}>
      {/* Desktop Sidebar - Always Visible */}
      <div className="desktop-sidebar">
        <div className="desktop-sidebar-header">
          <div className="sidebar-logo">
            <img 
              src="/purple_fox_transparent.png" 
              alt="Mr. Fox English" 
              className="sidebar-logo-img"
            />
            <span className="sidebar-title">Mr. Fox English</span>
          </div>
        </div>
        
        <div className="desktop-sidebar-content">
          {menuItems.map((item, index) => (
            <div key={item.id}>
              <div 
                className={`desktop-sidebar-item ${item.isActive ? 'active' : ''}`}
                onClick={() => item.action && handleMenuItemClick(item.action)}
                style={{ cursor: item.action ? 'pointer' : 'default' }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.text}</span>
              </div>
              {index === 2 && <div className="sidebar-divider"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Full-Screen Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-header">
            <div className="mobile-menu-logo">
              <img 
                src="/purple_fox_transparent.png" 
                alt="Mr. Fox English" 
                className="mobile-menu-logo-img"
              />
              <span className="mobile-menu-title">Mr. Fox English</span>
            </div>
            <button className="mobile-menu-close" onClick={closeMobileMenu}>
              ✕
            </button>
          </div>
          
          <div className="mobile-menu-content">
            {menuItems.map((item, index) => (
              <div key={item.id}>
                <div 
                  className={`mobile-menu-item ${item.isActive ? 'active' : ''}`}
                  onClick={() => item.action && handleMenuItemClick(item.action)}
                >
                  <span className="mobile-menu-icon">{item.icon}</span>
                  <span className="mobile-menu-text">{item.text}</span>
                </div>
                {index === 2 && <div className="mobile-menu-divider"></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={toggleMobileMenu}>
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

      {/* Main Content Area */}
      <div className="main-content-area">
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
              className={`exercise-item ${exercise.isActive ? 'active' : 'disabled'} ${exercise.isNew ? 'new-exercise' : ''} ${exercise.isDET ? 'det-exercise' : ''}`}
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
                {exercise.isDET && <div className="det-badge">DET</div>}
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
