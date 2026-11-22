// src/components/SplashPage.js
import React from 'react';
import ThemePicker from './ThemePicker';

function SplashPage({ onStartPracticing, isTransitioning }) {
  return (
    <div className={`splash-page ${isTransitioning ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-container">
          <img 
            src="/purple_fox_transparent.png" 
            alt="Mr. Fox English" 
            className="splash-logo"
          />
        </div>
        <h1 className="splash-title">Mr. Fox English</h1>
        <button 
          className="start-practicing-btn" 
          onClick={onStartPracticing}
          disabled={isTransitioning}
        >
          {isTransitioning ? 'Loading...' : 'Start Practicing'}
        </button>
        <div className="splash-theme"><ThemePicker /></div>
      </div>
    </div>
  );
}

export default SplashPage;