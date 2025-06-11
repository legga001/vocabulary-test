// src/components/LandingPage.js - Reordered exercises with speaking after listening
import React, { useEffect, useState, useCallback, useMemo } from 'react';

// Constants for better performance - moved outside component
const CATEGORIES = Object.freeze([
  { id: 'ALL', name: 'ALL', icon: '📚' },
  { id: 'READING', name: 'READING', icon: '📖' },
  { id: 'WRITING', name: 'WRITING', icon: '✍️' },
  { id: 'LISTENING', name: 'LISTENING', icon: '🎧' },
  { id: 'SPEAKING', name: 'SPEAKING', icon: '🎤' }
]);

// REORDERED: Moved speaking exercise to appear right after listen-and-type
const EXERCISES = Object.freeze([
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
  
  // SPEAKING EXERCISES - MOVED HERE: Right after listen-and-type
  {
    type: 'speak-and-record',
    category: 'SPEAKING',
    icon: '🎤',
    title: 'Speak and Record',
    subtitle: 'Pronunciation practice',
    progress: '0/10',
    isActive: true,
    isNew: true
  },
  
  // REMAINING LISTENING EXERCISES (Coming Soon)
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
  
  // REMAINING SPEAKING EXERCISES (Coming Soon)
  {
    type: 'speaking',
    category: 'SPEAKING',
    icon: '🗣️',
    title: 'Conversation Practice',
    subtitle: 'Speaking prompts',
    progress: '0/6',
    isActive: false
  },
  {
    type: 'speaking',
    category: 'SPEAKING',
    icon: '🎙️',
    title: 'Pronunciation Check',
    subtitle: 'Voice analysis',
    progress: '0/4',
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
  }
]);

const MENU_ITEMS = Object.freeze([
  { id: 'home', icon: '🏠', text: 'HOME', action: null, isActive: true },
  { id: 'practice', icon: '🎯', text: 'PRACTICE', action: null, isActive: false },
  { id: 'progress', icon: '📊', text: 'MY PROGRESS', action: 'progress', isActive: false },
  { id: 'settings', icon: '⚙️', text: 'SETTINGS', action: null, isActive: false },
  { id: 'language', icon: '🌐', text: 'SITE LANGUAGE', action: null, isActive: false },
  { id: 'logout', icon: '↗️', text: 'LOG OUT', action: null, isActive: false }
]);

function LandingPage({ onExercises, onProgress, onSelectExercise, isTransitioning }) {
  // State management
  const [showExercises, setShowExercises] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Trigger exercise animations after component mounts
  useEffect(() => {
    if (isTransitioning) return;
    
    const timer = setTimeout(() => {
      setShowExercises(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isTransitioning]);

  // Improved filtered exercises with better ALL category handling
  const filteredExercises = useMemo(() => {
    console.log('Filtering exercises for category:', selectedCategory);
    console.log('Total exercises available:', EXERCISES.length);
    
    if (selectedCategory === 'ALL') {
      // Show all exercises when ALL is selected
      const allExercises = [...EXERCISES];
      console.log('Showing all exercises:', allExercises.length);
      return allExercises;
    }
    
    // Filter by specific category
    const categoryExercises = EXERCISES.filter(exercise => exercise.category === selectedCategory);
    console.log(`Exercises for ${selectedCategory}:`, categoryExercises.length);
    return categoryExercises;
  }, [selectedCategory]);

  // Memoised progress calculations
  const exerciseProgressData = useMemo(() => {
    return filteredExercises.map(exercise => {
      const [current, total] = exercise.progress.split('/').map(Number);
      return {
        ...exercise,
        progressPercentage: (current / total) * 100
      };
    });
  }, [filteredExercises]);

  // Event handlers with useCallback for performance
  const handleMobileMenuToggle = useCallback(() => {
    setShowMobileMenu(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  const handleMenuItemClick = useCallback((action) => {
    handleMobileMenuClose();
    if (action === 'progress') {
      onProgress();
    }
  }, [onProgress, handleMobileMenuClose]);

  const handleCategoryChange = useCallback((categoryId) => {
    console.log('Category changed to:', categoryId);
    setSelectedCategory(categoryId);
  }, []);

  const handleExerciseClick = useCallback((exercise) => {
    console.log('Exercise clicked:', exercise.type, 'isActive:', exercise.isActive);
    if (exercise.isActive) {
      onSelectExercise(exercise.type);
    }
  }, [onSelectExercise]);

  // Memoised render functions
  const renderMenuItem = useCallback((item, index, isMobile = false) => {
    const baseClass = isMobile ? 'mobile-menu-item' : 'desktop-sidebar-item';
    const iconClass = isMobile ? 'mobile-menu-icon' : 'sidebar-icon';
    const textClass = isMobile ? 'mobile-menu-text' : 'sidebar-text';
    const dividerClass = isMobile ? 'mobile-menu-divider' : 'sidebar-divider';
    
    return (
      <React.Fragment key={item.id}>
        <div 
          className={`${baseClass} ${item.isActive ? 'active' : ''}`}
          onClick={() => item.action && handleMenuItemClick(item.action)}
          style={{ cursor: item.action ? 'pointer' : 'default' }}
          role={item.action ? 'button' : 'text'}
          tabIndex={item.action ? 0 : -1}
          onKeyDown={(e) => {
            if (item.action && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleMenuItemClick(item.action);
            }
          }}
        >
          <span className={iconClass} aria-hidden="true">{item.icon}</span>
          <span className={textClass}>{item.text}</span>
        </div>
        {index === 2 && <div className={dividerClass} role="separator"></div>}
      </React.Fragment>
    );
  }, [handleMenuItemClick]);

  const renderCategoryTabs = useMemo(() => (
    <div className="categories-tabs" role="tablist">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => handleCategoryChange(category.id)}
          role="tab"
          aria-selected={selectedCategory === category.id}
          aria-controls="exercises-list"
        >
          {category.name}
        </button>
      ))}
    </div>
  ), [selectedCategory, handleCategoryChange]);

  const renderExerciseItem = useCallback((exercise, index) => {
    const exerciseData = exerciseProgressData.find(e => e.type === exercise.type) || exercise;
    
    // Add debug logging for speaking exercise
    if (exercise.type === 'speak-and-record') {
      console.log('🎤 RENDERING SPEAKING EXERCISE:', {
        type: exercise.type,
        isActive: exercise.isActive,
        category: exercise.category,
        index: index,
        title: exercise.title,
        position: `Position ${index + 1} in filtered list`
      });
    }
    
    return (
      <div
        key={`${exercise.category}-${exercise.type}-${index}`}
        className={`exercise-item ${exercise.isActive ? 'active' : 'disabled'} ${exercise.isNew ? 'new-exercise' : ''} ${exercise.isDET ? 'det-exercise' : ''}`}
        onClick={() => handleExerciseClick(exercise)}
        style={{ 
          animationDelay: `${index * 0.1}s`
        }}
        role={exercise.isActive ? 'button' : 'text'}
        tabIndex={exercise.isActive ? 0 : -1}
        aria-label={`${exercise.title}: ${exercise.subtitle}${exercise.isActive ? ', clickable' : ', coming soon'}`}
        data-type={exercise.type}
        data-category={exercise.category}
        data-title={exercise.title}
        onKeyDown={(e) => {
          if (exercise.isActive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleExerciseClick(exercise);
          }
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
          
          {exercise.isActive ? (
            <div className="exercise-progress">
              <div className="progress-bar-small">
                <div 
                  className="progress-fill-small" 
                  style={{ width: `${exerciseData.progressPercentage}%` }}
                ></div>
              </div>
              <span className="progress-text-small">{exercise.progress}</span>
            </div>
          ) : (
            <div className="coming-soon-small">Coming soon</div>
          )}
        </div>
      </div>
    );
  }, [exerciseProgressData, handleExerciseClick]);

  // Add debug logging for filtered exercises
  useEffect(() => {
    console.log('📋 Current exercise order:', filteredExercises.map((e, index) => ({
      position: index + 1,
      type: e.type,
      category: e.category,
      isActive: e.isActive,
      title: e.title
    })));
    
    // Specifically log speaking exercise position
    const speakingIndex = filteredExercises.findIndex(e => e.type === 'speak-and-record');
    if (speakingIndex !== -1) {
      console.log(`🎤 Speaking exercise is at position ${speakingIndex + 1} out of ${filteredExercises.length}`);
    }
  }, [filteredExercises]);

  return (
    <div className={`landing-duolingo ${isTransitioning === false ? 'fade-in' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" role="navigation" aria-label="Main navigation">
        <div className="desktop-sidebar-header">
          <div className="sidebar-logo">
            <img 
              src="/purple_fox_transparent.png" 
              alt="Mr. Fox English logo" 
              className="sidebar-logo-img"
            />
            <span className="sidebar-title">Mr. Fox English</span>
          </div>
        </div>
        
        <nav className="desktop-sidebar-content">
          {MENU_ITEMS.map((item, index) => renderMenuItem(item, index, false))}
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" role="dialog" aria-label="Mobile menu">
          <div className="mobile-menu-header">
            <div className="mobile-menu-logo">
              <img 
                src="/purple_fox_transparent.png" 
                alt="Mr. Fox English logo" 
                className="mobile-menu-logo-img"
              />
              <span className="mobile-menu-title">Mr. Fox English</span>
            </div>
            <button 
              className="mobile-menu-close" 
              onClick={handleMobileMenuClose}
              aria-label="Close mobile menu"
            >
              ✕
            </button>
          </div>
          
          <nav className="mobile-menu-content">
            {MENU_ITEMS.map((item, index) => renderMenuItem(item, index, true))}
          </nav>
        </div>
      )}

      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="hamburger-btn" 
          onClick={handleMobileMenuToggle}
          aria-label="Open mobile menu"
          aria-expanded={showMobileMenu}
        >
          <div className="hamburger-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        
        <div className="header-logo">
          <img 
            src="/purple_fox_transparent.png" 
            alt="Mr. Fox English logo" 
            className="header-logo-img"
          />
          <span className="header-title">Mr. Fox English</span>
        </div>
        
        <div className="header-right">
          <button 
            className="progress-icon-btn" 
            onClick={onProgress}
            aria-label="View progress"
          >
            📊
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content-area">
        {/* Practice Full Test Button */}
        <section className="full-test-section">
          <div className="full-test-content">
            <h2>Take a full length practice test</h2>
            <div className="test-illustration">📋</div>
          </div>
          <button className="practice-test-btn" disabled>
            PRACTICE FULL TEST
            <span className="coming-soon-badge">Coming Soon</span>
          </button>
        </section>

        {/* Categories Tabs */}
        <section className="categories-section">
          <h3>Skill practice</h3>
          {renderCategoryTabs}
        </section>

        {/* Exercises List with Debug Info */}
        <section className="exercises-list" id="exercises-list">
          {/* Debug information (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              background: '#e6ffe6',
              padding: '10px',
              margin: '10px 0',
              borderRadius: '5px',
              fontSize: '0.8em',
              fontFamily: 'monospace',
              border: '1px solid #00aa00'
            }}>
              <strong>🎤 Speaking Exercise Debug:</strong><br />
              Category: "{selectedCategory}" | 
              Exercises: {filteredExercises.length} | 
              Speaking position: {filteredExercises.findIndex(e => e.type === 'speak-and-record') + 1} | 
              ShowExercises: {showExercises ? 'true' : 'false'}
              <br />
              <strong>Order:</strong> {filteredExercises.slice(0, 6).map((e, i) => `${i + 1}.${e.type.split('-')[0]}`).join(' → ')}
            </div>
          )}
          
          {showExercises && filteredExercises.map((exercise, index) => 
            renderExerciseItem(exercise, index)
          )}
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
