// src/components/ExerciseSelection.js
import React from 'react';

function ExerciseSelection({ onSelectExercise, onBack }) {
  const exercises = [
    {
      type: 'reading',
      title: '📖 Reading',
      description: 'Improve your reading comprehension with articles, stories, and exercises.',
      color: '#4c51bf',
      hoverColor: '#434190'
    },
    {
      type: 'writing',
      title: '✍️ Writing',
      description: 'Practice your writing skills with guided exercises and prompts.',
      color: '#48bb78',
      hoverColor: '#38a169'
    },
    {
      type: 'speaking',
      title: '🎤 Speaking',
      description: 'Develop your speaking confidence with pronunciation and conversation practice.',
      color: '#ed8936',
      hoverColor: '#dd7724'
    },
    {
      type: 'listening',
      title: '🎧 Listening',
      description: 'Enhance your listening skills with audio exercises and comprehension tasks.',
      color: '#9f7aea',
      hoverColor: '#805ad5'
    }
  ];

  return (
    <div className="exercise-selection">
      <div className="logo-container">
        <img 
          src="/purple_fox_transparent.png" 
          alt="Mr. Fox English" 
          className="app-logo"
        />
      </div>
      
      <h1>🎯 Choose Your Exercise Type</h1>
      
      <div className="welcome-text">
        <p>Select the type of English exercise you'd like to practice:</p>
      </div>

      <div className="exercise-grid">
        {exercises.map((exercise) => (
          <div 
            key={exercise.type}
            className="exercise-card"
            onClick={() => onSelectExercise(exercise.type)}
            style={{
              '--exercise-color': exercise.color,
              '--exercise-hover-color': exercise.hoverColor
            }}
          >
            <h3>{exercise.title}</h3>
            <p>{exercise.description}</p>
            <div className="exercise-arrow">→</div>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary back-btn" onClick={onBack}>
        ← Back to Main Menu
      </button>
    </div>
  );
}

export default ExerciseSelection;