// src/components/ListenTypeComponents.js - Fixed components
import React from 'react';
import { analyseWordDifferences } from '../utils/answerAnalysis';

export const getScoreColor = (percentage) => {
  if (percentage >= 80) return '#48bb78';
  if (percentage >= 60) return '#ed8936';
  return '#f56565';
};

// Traffic Light component for showing play count status (3 lights for 3 plays)
export const TrafficLight = ({ playCount }) => {
  const lightStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '15px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e2e8f0',
    margin: '0 auto',
    width: 'fit-content'
  };

  const lightCircleBase = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={lightStyle}>
      <div style={{ fontSize: '0.8em', fontWeight: '600', color: '#4c51bf', marginBottom: '5px' }}>
        Audio Plays
      </div>
      
      {/* First play */}
      <div style={{
        ...lightCircleBase,
        backgroundColor: playCount >= 1 ? '#48bb78' : '#f7fafc',
        borderColor: playCount >= 1 ? '#48bb78' : '#e2e8f0',
        boxShadow: playCount >= 1 ? '0 0 8px rgba(72, 187, 120, 0.4)' : 'none'
      }} />
      
      {/* Second play */}
      <div style={{
        ...lightCircleBase,
        backgroundColor: playCount >= 2 ? '#ed8936' : '#f7fafc',
        borderColor: playCount >= 2 ? '#ed8936' : '#e2e8f0',
        boxShadow: playCount >= 2 ? '0 0 8px rgba(237, 137, 54, 0.4)' : 'none'
      }} />
      
      {/* Third play */}
      <div style={{
        ...lightCircleBase,
        backgroundColor: playCount >= 3 ? '#f56565' : '#f7fafc',
        borderColor: playCount >= 3 ? '#f56565' : '#e2e8f0',
        boxShadow: playCount >= 3 ? '0 0 8px rgba(245, 101, 101, 0.4)' : 'none'
      }} />
      
      <div style={{ 
        fontSize: '0.7em', 
        color: '#718096',
        textAlign: 'center',
        marginTop: '5px'
      }}>
        {playCount}/3
      </div>
    </div>
  );
};

// Performance Level component for final results only
export const PerformanceLevel = ({ percentage }) => {
  const lightStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '20px',
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e2e8f0',
    margin: '20px auto',
    width: 'fit-content'
  };

  const lightCircleBase = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2em',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  };

  const getActiveLight = () => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  };

  const activeLight = getActiveLight();

  return (
    <div style={lightStyle}>
      <h4 style={{ margin: '0 0 15px 0', color: '#4c51bf', fontSize: '1.1em' }}>Performance Level</h4>
      
      <div style={{
        ...lightCircleBase,
        backgroundColor: activeLight === 'green' ? '#48bb78' : '#f7fafc',
        color: activeLight === 'green' ? 'white' : '#a0aec0',
        borderColor: activeLight === 'green' ? '#48bb78' : '#e2e8f0',
        transform: activeLight === 'green' ? 'scale(1.1)' : 'scale(1)',
        boxShadow: activeLight === 'green' ? '0 0 15px rgba(72, 187, 120, 0.5)' : 'none'
      }}>
        ✓
      </div>
      
      <div style={{
        ...lightCircleBase,
        backgroundColor: activeLight === 'yellow' ? '#ed8936' : '#f7fafc',
        color: activeLight === 'yellow' ? 'white' : '#a0aec0',
        borderColor: activeLight === 'yellow' ? '#ed8936' : '#e2e8f0',
        transform: activeLight === 'yellow' ? 'scale(1.1)' : 'scale(1)',
        boxShadow: activeLight === 'yellow' ? '0 0 15px rgba(237, 137, 54, 0.5)' : 'none'
      }}>
        ~
      </div>
      
      <div style={{
        ...lightCircleBase,
        backgroundColor: activeLight === 'red' ? '#f56565' : '#f7fafc',
        color: activeLight === 'red' ? 'white' : '#a0aec0',
        borderColor: activeLight === 'red' ? '#f56565' : '#e2e8f0',
        transform: activeLight === 'red' ? 'scale(1.1)' : 'scale(1)',
        boxShadow: activeLight === 'red' ? '0 0 15px rgba(245, 101, 101, 0.5)' : 'none'
      }}>
        ✗
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        fontSize: '0.9em', 
        fontWeight: '600',
        color: getScoreColor(percentage),
        textAlign: 'center'
      }}>
        {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good Progress' : 'Keep Practising'}
      </div>
    </div>
  );
};

// Audio Controls component - cleaned up without debug info
export const AudioControls = ({ onPlay, isPlaying, disabled, playCount = 0 }) => {
  const maxPlays = 3;
  const playsRemaining = Math.max(0, maxPlays - playCount);

  return (
    <div style={{ textAlign: 'center' }}>
      <button 
        onClick={onPlay}
        disabled={disabled || playCount >= maxPlays}
        style={{
          background: isPlaying 
            ? 'linear-gradient(135deg, #ed8936, #dd6b20)' 
            : (playCount >= maxPlays || disabled)
              ? '#a0aec0'
              : 'linear-gradient(135deg, #48bb78, #38a169)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '15px 30px',
          fontSize: '1.1em',
          fontWeight: '600',
          cursor: (playCount >= maxPlays || disabled) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: '200px',
          justifyContent: 'center',
          opacity: (playCount >= maxPlays || disabled) ? 0.6 : 1
        }}
      >
        {isPlaying ? '🔊' : '▶️'} 
        {isPlaying ? 'Playing...' : 
         disabled ? 'Audio Error' : 
         playCount >= maxPlays ? 'No plays left' :
         `Play Audio ${playCount > 0 ? `(${playCount}/${maxPlays})` : ''}`}
      </button>
      
      {!disabled && (
        <div style={{
          color: '#718096',
          fontSize: '0.9em',
          fontWeight: '500',
          textAlign: 'center',
          marginTop: '10px'
        }}>
          Plays remaining: {playsRemaining}
        </div>
      )}
    </div>
  );
};

// Detailed Answer Review component
export const DetailedAnswerReview = ({ questionNumber, correctText, userAnswer, result }) => {
  if (!result) return null;

  const { isCorrect, isPartiallyCorrect, differences } = result;
  
  const getResultIcon = () => {
    if (isCorrect) return '✅';
    if (isPartiallyCorrect) return '🔶';
    return '❌';
  };

  const getResultColor = () => {
    if (isCorrect) return '#48bb78';
    if (isPartiallyCorrect) return '#ed8936';
    return '#f56565';
  };

  const getResultText = () => {
    if (isCorrect) return 'Perfect!';
    if (isPartiallyCorrect) return 'Partially Correct';
    return 'Incorrect';
  };

  return (
    <div style={{
      background: '#f7fafc',
      border: `2px solid ${getResultColor()}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '15px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '15px'
      }}>
        <h4 style={{
          margin: 0,
          color: '#2d3748',
          fontSize: '1.1em'
        }}>
          Question {questionNumber}
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: getResultColor(),
          fontWeight: '600'
        }}>
          {getResultIcon()} {getResultText()}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#4a5568' }}>Correct:</strong>
        <div style={{
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          marginTop: '5px',
          fontFamily: 'monospace',
          border: '1px solid #e2e8f0'
        }}>
          {correctText}
        </div>
      </div>

      <div>
        <strong style={{ color: '#4a5568' }}>Your answer:</strong>
        <div style={{
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          marginTop: '5px',
          fontFamily: 'monospace',
          border: '1px solid #e2e8f0'
        }}>
          {userAnswer || <em style={{ color: '#a0aec0' }}>No answer provided</em>}
        </div>
      </div>

      {differences && differences.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong style={{ color: '#4a5568' }}>Detailed comparison:</strong>
          <div style={{
            background: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginTop: '5px',
            border: '1px solid #e2e8f0',
            fontSize: '0.9em'
          }}>
            {differences.map((diff, index) => (
              <span
                key={index}
                style={{
                  background: diff.type === 'correct' ? '#c6f6d5' : 
                             diff.type === 'incorrect' ? '#fed7d7' : 
                             diff.type === 'missing' ? '#bee3f8' : 'transparent',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  margin: '0 1px'
                }}
              >
                {diff.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
