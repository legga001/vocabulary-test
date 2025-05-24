// src/components/WritingExercise.js
import React from 'react';

function WritingExercise({ onBack }) {
  return (
    <div className="exercise-page">
      <div className="logo-container">
        <img 
          src="/purple_fox_transparent.png" 
          alt="Mr. Fox English" 
          className="app-logo"
        />
      </div>
      
      <h1>✍️ Writing Exercise</h1>
      
      <div className="coming-soon">
        <div className="coming-soon-icon">🚧</div>
        <h2>Coming Soon!</h2>
        <p>Writing exercises are being developed and will be available soon.</p>
        <p>These will include:</p>
        <ul>
          <li>✏️ Essay writing prompts</li>
          <li>📝 Grammar exercises</li>
          <li>🔤 Sentence construction</li>
          <li>📊 Writing analysis</li>
        </ul>
      </div>

      <button className="btn btn-secondary" onClick={onBack}>
        ← Back to Exercise Selection
      </button>
    </div>
  );
}

export default WritingExercise;