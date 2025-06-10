// src/components/LandingPage.js - Rewritten with efficiency improvements and title fix
import React, { useEffect, useState, useCallback, useMemo } from 'react';

// Constants moved outside component for better performance
const CATEGORIES = [
  { id: 'ALL', name: 'ALL', icon: '📚' },
  { id: 'READING', name: 'READING', icon: '📖' },
  { id: 'WRITING', name: 'WRITING', icon: '✍️' },
  { id: 'LISTENING', name: 'LISTENING', icon: '🎧' },
  { id: 'SPEAKING', name: 'SPEAKING', icon: '🎤' }
];

const EXERCISES = [
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

const MENU_ITEMS = [
  { id: 'home', icon: '🏠', text: 'HOME', action: null, isActive: true },
  { id: 'practice', icon: '🎯', text: 'PRACTICE', action: null, isActive: true },
  { id: 'progress', icon: '📊', text: 'MY PROGRESS', action: 'progress', isActive: true }, // Fixed: made active
  { id: 'settings', icon: '⚙️', text: 'SETTINGS', action: null, isActive: false },
  { id: 'language', icon: '🌐', text: 'SITE LANGUAGE', action: null, isActive: false },
  { id: 'logout', icon: '↗️', text: 'LOG OUT', action: null, isActive: false }
];

function LandingPage({ onExercises, onProgress, onSelectExercise, isTransitioning }) {
  // State management
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

  // Memoized filtered exercises for performance
  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'ALL') return EXERCISES;
    return EXERCISES.filter(ex => ex.category === selectedCategory);
  }, [selectedCategory]);

  // Event handlers with useCallback for performance
  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  const handleMenuItemClick = useCallback((action) => {
    closeMobileMenu();
    if (action === 'progress') onProgress();
  }, [onProgress, closeMobileMenu]);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleExerciseClick = useCallback((exercise) => {
    if (exercise.isActive) {
      onSelectExercise(exercise.type);
    }
  }, [onSelectExercise]);

  // Calculate progress percentage for exercises
  const calculateProgress = useCallback((progressStr) => {
    const [current, total] = progressStr.split('/').map(Number);
    return (current / total) * 100;
  }, []);

  // Render menu items
  const renderMenuItem = useCallback((item, index, isMobile = false) => {
    const className = isMobile ? 'mobile-menu-item' : 'desktop-sidebar-item';
    const iconClassName = isMobile ? 'mobile-menu-icon' : 'sidebar-icon';
    const textClassName = isMobile ? 'mobile-menu-text' : 'sidebar-text';
    
    return (
      <div key={item.id}>
        <div 
          className={`${className} ${item.isActive ? 'active' : ''}`}
          onClick={() => item.action && handleMenuItemClick(item.action)}
          style={{ cursor: item.action ? 'pointer' : 'default' }}
        >
          <span className={iconClassName}>{item.icon}</span>
          <span className={textClassName}>{item.text}</span>
        </div>
        {index === 2 && <div className={isMobile ? 'mobile-menu-divider' : 'sidebar-divider'}></div>}
      </div>
    );
  }, [handleMenuItemClick]);

  // Render category tabs
  const renderCategoryTabs = () => (
    <div className="categories-tabs">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => handleCategoryChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );

  // Render exercise item
  const renderExerciseItem = useCallback((exercise, index) => {
    const progressPercentage = calculateProgress(exercise.progress);
    
    return (
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
                  style={{ width: `${progressPercentage}%` }}
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
    );
  }, [calculateProgress, handleExerciseClick]);

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
          {MENU_ITEMS.map((item, index) => renderMenuItem(item, index, false))}
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
              {/* FIXED: Proper capitalization */}
              <span className="mobile-menu-title">Mr. Fox English</span>
            </div>
            <button className="mobile-menu-close" onClick={closeMobileMenu}>
              ✕
            </button>
          </div>
          
          <div className="mobile-menu-content">
            {MENU_ITEMS.map((item, index) => renderMenuItem(item, index, true))}
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
          {/* FIXED: Proper capitalization */}
          <span className="header-title">Mr. Fox English</span>
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
          {renderCategoryTabs()}
        </div>

        {/* Exercises List */}
        <div className="exercises-list">
          {showExercises && filteredExercises.map((exercise, index) => 
            renderExerciseItem(exercise, index)
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
