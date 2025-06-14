// src/components/LandingPage.js - Fixed daily targets to only increment on completion
import React, { useEffect, useState, useCallback, useMemo } from 'react';

// Constants for better performance - moved outside component
const CATEGORIES = Object.freeze([
  { id: 'ALL', name: 'ALL', icon: '📚' },
  { id: 'READING', name: 'READING', icon: '📖' },
  { id: 'WRITING', name: 'WRITING', icon: '✍️' },
  { id: 'LISTENING', name: 'LISTENING', icon: '🎧' },
  { id: 'SPEAKING', name: 'SPEAKING', icon: '🎤' }
]);

// UPDATED: Exercises with daily targets instead of overall progress
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
  
  // SPEAKING EXERCISES - Right after listen-and-type
  {
    type: 'speak-and-record',
    category: 'SPEAKING',
    icon: '🎤',
    title: 'Speak and Record',
    subtitle: 'Pronunciation practice',
    dailyTarget: 2, // Moderate exercises: 2 times per day
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
    dailyTarget: 2,
    isActive: false
  },
  {
    type: 'listening',
    category: 'LISTENING',
    icon: '🎵',
    title: 'Pronunciation Practice',
    subtitle: 'Listen and repeat',
    dailyTarget: 3,
    isActive: false
  },
  
  // REMAINING SPEAKING EXERCISES (Coming Soon)
  {
    type: 'speaking',
    category: 'SPEAKING',
    icon: '🗣️',
    title: 'Conversation Practice',
    subtitle: 'Speaking prompts',
    dailyTarget: 2,
    isActive: false
  },
  {
    type: 'speaking',
    category: 'SPEAKING',
    icon: '🎙️',
    title: 'Pronunciation Check',
    subtitle: 'Voice analysis',
    dailyTarget: 3,
    isActive: false
  },
  
  // WRITING EXERCISES
  {
    type: 'writing',
    category: 'WRITING',
    icon: '✍️',
    title: 'Grammar Practice',
    subtitle: 'Sentence building',
    dailyTarget: 3,
    isActive: false
  },
  {
    type: 'writing',
    category: 'WRITING',
    icon: '📝',
    title: 'Essay Writing',
    subtitle: 'Structured responses',
    dailyTarget: 1, // Longer exercises: 1 time per day
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

// Daily target tracking functions
const DAILY_TARGETS_KEY = 'mrFoxEnglishDailyTargets';

const getTodayString = () => {
  return new Date().toDateString();
};

const getDailyTargetData = () => {
  try {
    const saved = localStorage.getItem(DAILY_TARGETS_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const today = getTodayString();
      
      // If data is from today, return it, otherwise reset
      if (data.date === today) {
        return data.targets;
      }
    }
  } catch (error) {
    console.error('Error loading daily targets:', error);
  }
  
  // Return empty targets if no data or new day
  return {};
};

const saveDailyTargetData = (targets) => {
  try {
    const dataToSave = {
      date: getTodayString(),
      targets: targets
    };
    localStorage.setItem(DAILY_TARGETS_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving daily targets:', error);
  }
};

// UPDATED: Export function to increment from external modules
export const incrementDailyTarget = (exerciseType) => {
  const currentTargets = getDailyTargetData();
  const newTargets = {
    ...currentTargets,
    [exerciseType]: (currentTargets[exerciseType] || 0) + 1
  };
  saveDailyTargetData(newTargets);
  
  // Trigger a storage event to update the landing page if it's visible
  window.dispatchEvent(new StorageEvent('storage', {
    key: DAILY_TARGETS_KEY,
    newValue: JSON.stringify({
      date: getTodayString(),
      targets: newTargets
    })
  }));
  
  return newTargets;
};

function LandingPage({ onExercises, onProgress, onSelectExercise, isTransitioning }) {
  // State management
  const [showExercises, setShowExercises] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dailyTargets, setDailyTargets] = useState({});

  // Load daily targets on component mount
  useEffect(() => {
    const targets = getDailyTargetData();
    setDailyTargets(targets);
  }, []);

  // Listen for storage changes to update progress in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === DAILY_TARGETS_KEY) {
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
    console.log('Category changed to:', categoryId);
    setSelectedCategory(categoryId);
  }, []);

  // FIXED: Remove increment from click, only start exercise
  const handleExerciseClick = useCallback((exercise) => {
    console.log('Exercise clicked:', exercise.type, 'isActive:', exercise.isActive);
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
          aria-label={item.text}
          onKeyDown={(e) => {
            if (item.action && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleMenuItemClick(item.action);
            }
          }}
        >
          <span className={iconClass}>{item.icon}</span>
          <span className={textClass}>{item.text}</span>
        </div>
        {index < MENU_ITEMS.length - 1 && index === 2 && (
          <div className={dividerClass}></div>
        )}
      </React.Fragment>
    );
  }, [handleMenuItemClick]);

  const renderCategoryTabs = useMemo(() => (
    <div className="category-tabs" role="tablist" aria-label="Exercise categories">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => handleCategoryChange(category.id)}
          role="tab"
          aria-selected={selectedCategory === category.id}
          aria-controls="exercises-list"
          id={`tab-${category.id}`}
        >
          <span className="category-icon">{category.icon}</span>
          <span className="category-name">{category.name}</span>
        </button>
      ))}
    </div>
  ), [selectedCategory, handleCategoryChange]);

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
  }, [handleExerciseClick]);

  // Add debug logging for filtered exercises
  useEffect(() => {
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
    
    // Specifically log speaking exercise position
    const speakingIndex = exercisesWithTargets.findIndex(e => e.type === 'speak-and-record');
    if (speakingIndex !== -1) {
      console.log(`🎤 Speaking exercise is at position ${speakingIndex + 1} out of ${exercisesWithTargets.length}`);
    }
  }, [exercisesWithTargets]);

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
              aria-label="Close menu"
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
          className="mobile-menu-btn" 
          onClick={handleMobileMenuToggle}
          aria-label="Open menu"
        >
          ☰
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
              background: '#fff3cd',
              padding: '10px',
              margin: '10px 0',
              borderRadius: '5px',
              fontSize: '0.8em',
              fontFamily: 'monospace',
              border: '1px solid #ffeaa7'
            }}>
              <strong>🎯 Daily Targets Debug (Resets each day):</strong><br />
              Today: {getTodayString()}<br />
              Category: "{selectedCategory}" | 
              Exercises: {exercisesWithTargets.length} | 
              Speaking position: {exercisesWithTargets.findIndex(e => e.type === 'speak-and-record') + 1}
              <br />
              <strong>Targets met:</strong> {exercisesWithTargets.filter(e => e.isTargetMet && e.isActive).length} of {exercisesWithTargets.filter(e => e.isActive).length} active exercises
              <br />
              <strong>FIXED:</strong> Progress only increments on exercise completion, not on click!
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
