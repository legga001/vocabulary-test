// src/components/SplashPage.js
import React from 'react';

function SplashPage({ onStartPracticing }) {
  return (
    <div className="splash-page">
      <div className="splash-content">
        <div className="splash-logo-container">
          <img 
            src="/purple_fox_transparent.png" 
            alt="Mr. Fox English" 
            className="splash-logo"
          />
        </div>
        <h1 className="splash-title">Mr. Fox English</h1>
        <button className="start-practicing-btn" onClick={onStartPracticing}>
          Start Practicing
        </button>
      </div>
    </div>
  );
}

export default SplashPage;