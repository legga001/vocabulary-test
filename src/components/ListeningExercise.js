// src/components/ListeningExercise.js
import React from 'react';

function ListeningExercise({ onBack }) {
  return (
    <div className="exercise-page">
      <div className="logo-container">
        <img 
          src="/purple_fox_transparent.png" 
          alt="Mr. Fox English" 
          className="app-logo"
        />
      </div>
      
      <h1>🎧 Listening Exercise</h1>
      
      <div className="coming-soon">
        <div className="coming-soon-icon">🚧</div>
        <h2>Coming Soon!</h2>
        <p>Listening exercises are being developed and will be available soon.</p>
        <p>These will include:</p>
        <ul>
          <li>🎵 Audio comprehension</li>
          <li>🗣️ Conversation practice</li>
          <li>📻 Podcast exercises</li>
          <li>📊 Listening skills assessment</li>
        </ul>
      </div>

      <button className="btn btn-secondary" onClick={onBack}>
        ← Back to Exercise Selection
      </button>
    </div>
  );
}

export default ListeningExercise;