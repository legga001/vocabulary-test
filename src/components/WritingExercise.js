// src/components/WritingExercise.js - Updated with ClickableLogo
import React from 'react';
import ClickableLogo from './ClickableLogo';

function WritingExercise({ onBack, onLogoClick }) {
  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      
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
