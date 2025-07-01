// src/components/LandingPage.js - Updated with Read and Complete exercise
import React, { useEffect, useState, useCallback, useMemo } from 'react';

// Constants for better performance - moved outside component
const CATEGORIES = Object.freeze([
  { id: 'ALL', name: 'ALL', icon: '📚' },
  { id: 'READING', name: 'READING', icon: '📖' },
  { id: 'WRITING', name: 'WRITING', icon: '✍️' },
  { id: 'LISTENING', name: 'LISTENING', icon: '🎧' },
  { id: 'SPEAKING', name: 'SPEAKING', icon: '🎤' }
]);

// UPDATED: Exercises with daily targets including new Read and Complete exercise
const EXERCISES = Object.freeze([
  // READING EXERCISES
  {
    type: 'standard-vocabulary',
    category: 'READING',
    icon: '📖',
    title: 'Standard Vocabulary',
    subtitle: 'Fill in the gaps',
    dailyTarget: 3, // Quick exercises: 3 times per day
    isActive: true
  },
  {
    type: 'article-vocabulary', 
    category: 'READING', 
    icon: '📰',
    title: 'Article-Based Vocab',
    subtitle: 'Real news stories',
    dailyTarget: 1, // Article exercises: 1 time per day
    isActive: true
  },
  {
    type: 'real-fake-words',
    category: 'READING',
    icon: '🎯',
    title: 'Real or Fake Words',
    subtitle: 'Quick recognition',
    dailyTarget: 2, // Quick exercises: 2 times per day
    isActive: true,
    isNew: true
  },
  {
    type: 'read-and-complete',
    category: 'READING',
    icon: '📝',
    title: 'Read and Complete',
    subtitle: 'Complete missing words in paragraphs',
    dailyTarget: 1, // Comprehensive exercise: 1 time per day
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
    dailyTarget: 2, // Moderate exercises: 2 times per day
    isActive: true,
    isNew: true,
    isDET: true
  },
  
  // SPEAKING EXERCISES
  {
    type: 'speak-and-record',
    category: 'SPEAKING',
    icon: '🎤',
    title: 'Speak and Record',
    subtitle: 'Practice pronunciation',
    dailyTarget: 2, // Speaking exercises: 2 times per day
    isActive: true,
    isNew: true,
    isDET: true
  },
  
  // WRITING EXERCISES
  {
    type: 'writing',
    category: 'WRITING',
    icon: '✍️',
    title: 'Photo Description',
    subtitle: 'Describe what you see',
    dailyTarget: 1, // Writing exercises: 1 time per day (longer tasks)
    isActive: true,
    isDET: true
  },
  
  // INACTIVE EXERCISES (Coming Soon)
  {
    type: 'speaking',
    category: 'SPEAKING',
    icon: '🗣️',
    title: 'Conversation Practice',
    subtitle: 'Interactive dialogue',
    dailyTarget: 2,
    isActive: false
  },
  {
    type: 'listening',
    category: 'LISTENING',
    icon: '🎵',
    title: 'Audio Comprehension',
    subtitle: 'Understand spoken English',
    dailyTarget: 2,
    isActive: false
  }
]);

// Menu items for sidebar navigation
const MENU_ITEMS = Object.freeze([
  { id: 'exercises', text: 'Exercises', icon: '📚', isActive: true },
  { id: 'progress', text: 'Progress', icon: '📊', isActive: true, action: 'progress' },
  { id: 'settings', text: 'Settings', icon: '⚙️', isActive: false },
  { id: 'help', text: 'Help & Support', icon: '❓', isActive: false }
]);

// Daily targets storage utilities
const TARGETS_STORAGE_KEY = 'mr-fox-daily-targets';

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

const getDailyTargetData = () => {
  try {
    const stored = localStorage.getItem(TARGETS_STORAGE_KEY);
    if (!stored) return {};
    
    const data = JSON.parse(stored);
    const today = getTodayString();
    
    // Return today's data or empty object if it's a different day
    return data.date === today ? data.targets : {};
  } catch (error) {
    console.error('Error reading daily targets:', error);
    return {};
  }
};

const setDailyTargetData = (targets) => {
  try {
    const data = {
      date: getTodayString(),
      targets
    };
    localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving daily targets:', error);
  }
};

// Export function to increment daily target from other components
export const incrementDailyTarget = (exerciseType) => {
  const current = getDailyTargetData();
  const updated = {
    ...current,
    [exerciseType]: (current[exerciseType] || 0) + 1
  };
  setDailyTargetData(updated);
  
  // Trigger storage event for other components to update
  window.dispatchEvent(new StorageEvent('storage', {
    key: TARGETS_STORAGE_KEY,
    newValue: JSON.stringify({ date: getTodayString(), targets: updated })
  }));
  
  return updated;
};

function LandingPage({ onSelectExercise, onProgress, isTransitioning }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [dailyTargets, setDailyTargets] = useState({});

  // Load daily targets on mount
  useEffect(() => {
    const targets = getDailyTargetData();
    setDailyTargets(targets);
    console.log('📊 Daily targets loaded:', targets);
  }, []);

  // Listen for daily target updates from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === TARGETS_STORAGE_KEY) {
        const targets = getDailyTargetData();
        setDailyTargets(targets);
        console.log('📊 Daily targets updated from storage:', targets);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Trigger exercise animations after component mounts
  useEffect(() => {
    if (isTransitioning) return;
    
    const timer = setTimeout(() => {
      setShowExercises(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isTransitioning]);

  // True category filtering - only show exercises from selected category
  const filteredExercises = useMemo(() => {
    console.log('🔍 Filtering exercises for category:', selectedCategory);
    console.log('📚 Total exercises available:', EXERCISES.length);
    
    let exercisesToShow = [];
    
    if (selectedCategory === 'ALL') {
      // Show all exercises when ALL is selected
      exercisesToShow = [...EXERCISES];
      console.log('📋 Showing all exercises:', exercisesToShow.length);
    } else {
      // Show ONLY exercises from the selected category
      exercisesToShow = EXERCISES.filter(exercise => exercise.category === selectedCategory);
      console.log(`📋 Showing only ${selectedCategory} exercises:`, exercisesToShow.length);
    }
    
    // Verify no duplicates by checking for unique exercise types
    const exerciseTypes = exercisesToShow.map(ex => ex.type);
    const uniqueTypes = new Set(exerciseTypes);
    
    if (exerciseTypes.length !== uniqueTypes.size) {
      console.error('🚨 DUPLICATE EXERCISES DETECTED!', {
        totalCount: exerciseTypes.length,
        uniqueCount: uniqueTypes.size,
        duplicates: exerciseTypes.filter((type, index) => exerciseTypes.indexOf(type) !== index)
      });
    } else {
      console.log('✅ No duplicate exercises detected');
    }
    
    return exercisesToShow;
  }, [selectedCategory]);

  // Memoised exercises with daily target progress
  const exercisesWithTargets = useMemo(() => {
    return filteredExercises.map(exercise => {
      const completed = dailyTargets[exercise.type] || 0;
      const target = exercise.dailyTarget;
      const progressPercentage = Math.min((completed / target) * 100, 100);
      const isTargetMet = completed >= target;
      
      return {
        ...exercise,
        completed,
        target,
        progressPercentage,
        isTargetMet
      };
    });
  }, [filteredExercises, dailyTargets]);

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
    console.log('🔄 Category changed to:', categoryId);
    setSelectedCategory(categoryId);
    
    // Add a small delay to allow for smooth visual transition
    setShowExercises(false);
    setTimeout(() => {
      setShowExercises(true);
    }, 150);
  }, []);

  // Remove increment from click, only start exercise
  const handleExerciseClick = useCallback((exercise) => {
    console.log('🎯 Exercise clicked:', exercise.type, 'isActive:', exercise.isActive);
    if (exercise.isActive) {
      // Don't increment here - this will be handled when exercise is completed
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
        >
          <span className={iconClass}>{item.icon}</span>
          <span className={textClass}>{item.text}</span>
        </div>
        {index < MENU_ITEMS.length - 1 && <div className={dividerClass}></div>}
      </React.Fragment>
    );
  }, [handleMenuItemClick]);

  const renderCategoryTabs = useMemo(() => {
    return (
      <div className="category-tabs">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>
    );
  }, [selectedCategory, handleCategoryChange]);

  const renderExerciseItem = useCallback((exercise, index) => {
    return (
      <div
        key={exercise.type}
        className={`exercise-item ${exercise.isActive ? 'active' : 'disabled'} ${exercise.isNew ? 'new-exercise' : ''} ${exercise.isDET ? 'det-exercise' : ''} ${exercise.isTargetMet ? 'target-met' : ''}`}
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
          {exercise.isTargetMet && <div className="target-met-badge">✓</div>}
        </div>
        
        <div className="exercise-content">
          <h4 className="exercise-title">{exercise.title}</h4>
          <p className="exercise-subtitle">{exercise.subtitle}</p>
          
          {exercise.isActive ? (
            <div className="exercise-daily-target">
              <div className="daily-target-bar">
                <div 
                  className="daily-target-fill" 
                  style={{ width: `${exercise.progressPercentage}%` }}
                ></div>
              </div>
              <span className="daily-target-text">
                {exercise.isTargetMet ? (
                  <span className="target-completed">
                    🎯 Daily target met! ({exercise.completed}/{exercise.target})
                  </span>
                ) : (
                  <>Daily target: {exercise.completed}/{exercise.target}</>
                )}
              </span>
            </div>
          ) : (
            <div className="coming-soon-small">Coming soon</div>
          )}
        </div>
      </div>
    );
  }, [handleExerciseClick, selectedCategory]);

  // Add debug logging for filtered exercises
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Current exercise order with targets:', exercisesWithTargets.map((e, index) => ({
        position: index + 1,
        type: e.type,
        category: e.category,
        isActive: e.isActive,
        title: e.title,
        dailyTarget: e.target,
        completed: e.completed,
        targetMet: e.isTargetMet
      })));
      
      // Check for any duplicate types
      const types = exercisesWithTargets.map(e => e.type);
      const duplicateTypes = types.filter((type, index) => types.indexOf(type) !== index);
      if (duplicateTypes.length > 0) {
        console.error('🚨 DUPLICATE EXERCISE TYPES FOUND:', duplicateTypes);
      }
    }
  }, [exercisesWithTargets]);

  return (
    <div className={`landing-duolingo ${isTransitioning === false ? 'show' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-logo">
            <img 
              src="/purple_fox_transparent.png" 
              alt="Mr. Fox English logo" 
              className="sidebar-logo-img"
            />
            <span className="sidebar-title">Mr. Fox English</span>
          </div>
          
          <nav className="sidebar-nav" role="navigation" aria-label="Main menu">
            {MENU_ITEMS.map((item, index) => renderMenuItem(item, index, false))}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={handleMobileMenuClose}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <img 
                src="/purple_fox_transparent.png" 
                alt="Mr. Fox English logo" 
                className="mobile-menu-logo"
              />
              <span className="mobile-menu-title">Mr. Fox English</span>
              <button 
                className="mobile-menu-close"
                onClick={handleMobileMenuClose}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <nav className="mobile-menu-nav" role="navigation" aria-label="Mobile menu">
              {MENU_ITEMS.map((item, index) => renderMenuItem(item, index, true))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="main-header">
        <div className="header-left">
          <button 
            className="mobile-menu-toggle"
            onClick={handleMobileMenuToggle}
            aria-label="Open menu"
          >
            ☰
          </button>
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
          
          {/* Category indicator - show count of exercises */}
          {selectedCategory !== 'ALL' && (
            <div className="category-indicator">
              <span className="category-indicator-text">
                Showing {exercisesWithTargets.length} {selectedCategory.toLowerCase()} exercise{exercisesWithTargets.length !== 1 ? 's' : ''}
              </span>
              <button 
                className="show-all-btn"
                onClick={() => handleCategoryChange('ALL')}
              >
                Show all exercises
              </button>
            </div>
          )}
        </section>

        {/* Exercises List */}
        <section className="exercises-list" id="exercises-list">
          {/* Debug information (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              background: '#fff3cd',
              padding: '10px',
              margin: '10px 0',
              borderRadius: '5px',
              fontSize: '0.8em',
              fontFamily: 'monospace',
              border: '1px solid #ffeaa7'
            }}>
              <strong>🎯 Exercise Display Debug:</strong><br />
              Today: {getTodayString()}<br />
              Category: "{selectedCategory}" | 
              Total exercises shown: {exercisesWithTargets.length} | 
              Active exercises: {exercisesWithTargets.filter(e => e.isActive).length}
              <br />
              <strong>Exercise types shown:</strong> {exercisesWithTargets.map(e => `${e.type}(${e.category})`).join(', ')}
              <br />
              <strong>Targets met:</strong> {exercisesWithTargets.filter(e => e.isTargetMet && e.isActive).length} of {exercisesWithTargets.filter(e => e.isActive).length} active exercises
            </div>
          )}
          
          {showExercises && exercisesWithTargets.map((exercise, index) => 
            renderExerciseItem(exercise, index)
          )}
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
