// src/components/LandingPage.js - Updated without notification bubbles
import React, { useEffect, useState, useCallback, useMemo } from 'react';

// Constants for better performance - moved outside component
const CATEGORIES = Object.freeze([
  { id: 'ALL', name: 'ALL', icon: '📚' },
  { id: 'READING', name: 'READING', icon: '📖' },
  { id: 'WRITING', name: 'WRITING', icon: '✍️' },
  { id: 'LISTENING', name: 'LISTENING', icon: '🎧' },
  { id: 'SPEAKING', name: 'SPEAKING', icon: '🎤' }
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
    isActive: true
  },
  {
    type: 'read-and-complete',
    category: 'READING',
    icon: '📝',
    title: 'Read and Complete',
    subtitle: 'Complete missing words in paragraphs',
    dailyTarget: 1, // Comprehensive exercise: 1 time per day
    isActive: true
  },
  
  // LISTENING EXERCISES
  {
    type: 'listen-and-type',
    category: 'LISTENING',
    icon: '🎧',
    title: 'Listen and Type',
    subtitle: 'Type what you hear',
    dailyTarget: 2, // Moderate exercises: 2 times per day
    isActive: true
  },
  
  // SPEAKING EXERCISES
  {
    type: 'speak-and-record',
    category: 'SPEAKING',
    icon: '🎤',
    title: 'Speak and Record',
    subtitle: 'Practice pronunciation',
    dailyTarget: 2, // Speaking exercises: 2 times per day
    isActive: true
  },
  
  // WRITING EXERCISES
  {
    type: 'writing',
    category: 'WRITING',
    icon: '✍️',
    title: 'Photo Description',
    subtitle: 'Describe what you see',
    dailyTarget: 1, // Writing exercises: 1 time per day (longer tasks)
    isActive: true
  },
  
  // INACTIVE EXERCISES (Coming Soon)
  {
    type: 'sentence-completion',
    category: 'READING',
    icon: '📚',
    title: 'Sentence Completion',
    subtitle: 'Complete the sentences',
    dailyTarget: 2,
    isActive: false
  },
  {
    type: 'conversation',
    category: 'SPEAKING',
    icon: '💬',
    title: 'Conversation Practice',
    subtitle: 'Interactive dialogues',
    dailyTarget: 1,
    isActive: false
  },
  {
    type: 'essay-writing',
    category: 'WRITING',
    icon: '📄',
    title: 'Essay Writing',
    subtitle: 'Structured writing tasks',
    dailyTarget: 1,
    isActive: false
  }
]);

// Menu items for sidebar navigation
const MENU_ITEMS = Object.freeze([
  { id: 'exercises', icon: '📚', text: 'Exercises', isActive: true, action: null },
  { id: 'progress', icon: '📊', text: 'Progress', isActive: false, action: 'progress' },
  { id: 'achievements', icon: '🏆', text: 'Achievements', isActive: false, action: 'achievements' },
  { id: 'settings', icon: '⚙️', text: 'Settings', isActive: false, action: 'settings' }
]);

function LandingPage({ onSelectExercise, onProgress, isTransitioning }) {
  // State management
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showExercises, setShowExercises] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [dailyTargets, setDailyTargets] = useState({});

  // Load daily targets on mount and set up listener
  useEffect(() => {
    const loadDailyTargets = () => {
      setDailyTargets(getDailyTargetData());
    };
    
    loadDailyTargets();
    
    // Listen for storage changes to update targets in real-time
    const handleStorageChange = (e) => {
      if (e.key === TARGETS_STORAGE_KEY) {
        loadDailyTargets();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get completion data from localStorage (using daily targets)
  const getCompletionData = useCallback(() => {
    return dailyTargets;
  }, [dailyTargets]);

  // Calculate exercises with targets and progress
  const exercisesWithTargets = useMemo(() => {
    const completionData = getCompletionData();
    
    return EXERCISES
      .filter(exercise => selectedCategory === 'ALL' || exercise.category === selectedCategory)
      .map(exercise => {
        const completed = completionData[exercise.type] || 0;
        const target = exercise.dailyTarget || 1;
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
  }, [selectedCategory, getCompletionData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if mobile layout should be used
  const isMobile = windowWidth < 1025;

  // Show exercises with staggered animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowExercises(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle category changes
  const handleCategoryChange = useCallback((categoryId) => {
    if (categoryId !== selectedCategory) {
      setIsTransitioning(true);
      setShowExercises(false);
      
      setTimeout(() => {
        setSelectedCategory(categoryId);
        setShowExercises(true);
        setIsTransitioning(false);
      }, 200);
    }
  }, [selectedCategory]);

  // Handle exercise clicks
  const handleExerciseClick = useCallback((exercise) => {
    if (!exercise.isActive) return;
    
    console.log(`🎯 Launching exercise: ${exercise.type}`);
    
    // Use the onSelectExercise prop passed from App.js
    if (onSelectExercise) {
      onSelectExercise(exercise.type);
    } else {
      console.warn('onSelectExercise function not provided');
    }
  }, [onSelectExercise]);

  // Handle menu item clicks for sidebar
  const handleMenuItemClick = useCallback((action) => {
    console.log(`Menu action: ${action}`);
    if (action === 'progress' && onProgress) {
      onProgress();
    }
  }, [onProgress]);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Render menu items (shared between desktop sidebar and mobile menu)
  const renderMenuItem = useCallback((item, index) => {
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
  }, [isMobile, handleMenuItemClick]);

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
        className={`exercise-item ${exercise.isActive ? 'active' : 'disabled'} ${exercise.isTargetMet ? 'target-met' : ''}`}
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
      {!isMobile && (
        <aside className="desktop-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-logo">
              <img 
                src="/logo192.png" 
                alt="Mr. Fox English" 
                className="sidebar-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="sidebar-title">Mr. Fox English</div>
            </div>
            <nav className="sidebar-nav">
              {MENU_ITEMS.map((item, index) => renderMenuItem(item, index))}
            </nav>
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <header className="mobile-header">
          <div className="mobile-header-content">
            <button 
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              <span className="hamburger-icon">☰</span>
            </button>
            <div className="mobile-logo">
              <span className="mobile-logo-text">Mr. Fox English</span>
            </div>
            <div className="mobile-header-spacer"></div>
          </div>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-menu-logo">
                <img 
                  src="/logo192.png" 
                  alt="Mr. Fox English" 
                  className="mobile-menu-logo-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="mobile-menu-title">Mr. Fox English</span>
              </div>
              <button 
                className="mobile-menu-close"
                onClick={toggleMobileMenu}
                aria-label="Close navigation menu"
              >
                ✕
              </button>
            </div>
            <div className="mobile-menu-items">
              {MENU_ITEMS.map((item, index) => renderMenuItem(item, index))}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content-area">
        {/* Header */}
        <section className="landing-header">
          <div className="welcome-section">
            <h1 className="main-title">Welcome to Mr. Fox English</h1>
            <p className="main-subtitle">Master English with interactive exercises designed for success</p>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="category-section">
          {renderCategoryTabs}
          {selectedCategory !== 'ALL' && (
            <div className="category-info">
              <span className="category-description">
                Showing {exercisesWithTargets.length} exercise{exercisesWithTargets.length !== 1 ? 's' : ''}
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
