// src/components/SpeakingExercise.js
import React from 'react';

function SpeakingExercise({ onBack }) {
  return (
    <div className="exercise-page">
      <div className="logo-container">
        <img 
          src="/purple_fox_transparent.png" 
          alt="Mr. Fox English" 
          className="app-logo"
        />
      </div>
      
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