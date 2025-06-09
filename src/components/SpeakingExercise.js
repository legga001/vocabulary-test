// src/components/SpeakingExercise.js - Updated with ClickableLogo
import React from 'react';
import ClickableLogo from './ClickableLogo';

function SpeakingExercise({ onBack, onLogoClick }) {
  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      
      <h1>🎤 Speaking Exercise</h1>
      
      <div className="coming-soon">
        <div className="coming-soon-icon">🚧</div>
        <h2>Coming Soon!</h2>
        <p>Speaking exercises are being developed and will be available soon.</p>
        <p>These will include:</p>
        <ul>
          <li>🗣️ Pronunciation practice</li>
          <li>🎯 Speaking prompts</li>
          <li>🎵 Intonation exercises</li>
          <li>📊 Speech analysis</li>
        </ul>
      </div>

      <button className="btn btn-secondary" onClick={onBack}>
        ← Back to Exercise Selection
      </button>
    </div>
  );
}

export default SpeakingExercise;
