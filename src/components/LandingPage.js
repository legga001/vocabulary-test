// src/components/LandingPage.js
import React, { useEffect, useState } from 'react';

function LandingPage({ onExercises, onProgress, onSelectExercise, isTransitioning }) {
  const [showCards, setShowCards] = useState(false);

  // Trigger card animations after component mounts and transition is complete
  useEffect(() => {
    if (!isTransitioning) {
      // Small delay to ensure page is ready
      const timer = setTimeout(() => {
        setShowCards(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const exercises = [
    {
      type: 'reading',
      icon: '📖',
      title: 'Reading',
      description: 'Vocabulary tests based on current BBC articles and standard CEFR levels'
    },
    {
      type: 'writing',
      icon: '✍️',
      title: 'Writing',
      description: 'Grammar exercises and sentence construction practice'
    },
    {
      type: 'speaking',
      icon: '🎤',
      title: 'Speaking',
      description: 'Pronunciation practice with audio feedback'
    },
    {
      type: 'listening',
      icon: '🎧',
      title: 'Listening',
      description: 'Audio comprehension and conversation exercises'
    }
  ];

  return (
    <div className={`landing ${isTransitioning === false ? 'fade-in' : ''}`}>
      <div className="logo-container">
        <img 
          src="/purple_fox_transparent.png" 
          alt="Mr. Fox English" 
          className="app-logo"
        />
      </div>
      
      <h1 className="landing-title">🎯 Mr. Fox English</h1>
      
      <div className="welcome-text">
        <p>Choose your English exercise type:</p>
      </div>

      {/* Exercise Grid with Staggered Animation */}
      <div className={`exercise-grid ${showCards ? 'cards-visible' : ''}`}>
        {exercises.map((exercise, index) => (
          <div 
            key={exercise.type}
            className={`exercise-card clickable-card card-${index}`}
            onClick={() => onSelectExercise(exercise.type)}
            style={{
              '--card-delay': `${index * 0.15}s`
            }}
          >
            <div className="exercise-icon">{exercise.icon}</div>
            <h3>{exercise.title}</h3>
            <p>{exercise.description}</p>
            <div className="exercise-arrow">→</div>
          </div>
        ))}
      </div>

      {/* Progress Section - Appears after cards */}
      <div className={`progress-section ${showCards ? 'progress-visible' : ''}`}>
        <button 
          className="btn progress-btn" 
          onClick={onProgress}
        >
          📊 See My Progress
        </button>
        <p className="progress-description">
          Track your learning journey, view daily stats, and monitor improvement!
        </p>
      </div>

      <div className={`getting-started ${showCards ? 'info-visible' : ''}`}>
        <h3>🚀 Getting Started</h3>
        <p>Click any exercise type above to start practicing, or check your progress to see how you're improving!</p>
      </div>
    </div>
  );
}

export default LandingPage;