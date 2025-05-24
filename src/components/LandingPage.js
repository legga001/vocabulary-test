import React from 'react';

function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <h1>🎯 English Vocabulary Test</h1>
      <div className="welcome-text">
        <p>Test your English vocabulary skills with our interactive quiz!</p>
        <p>Complete 10 fill-in-the-blank questions across different difficulty levels.</p>
        <p><strong>Duration:</strong> About 5-10 minutes</p>
      </div>
      <button className="btn" onClick={onStart}>Start Test</button>
    </div>
  );
}

export default LandingPage;