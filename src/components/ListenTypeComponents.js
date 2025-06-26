// src/components/ListenTypeComponents.js - Fixed DetailedAnswerReview with word analysis
import React from 'react';

export const getScoreColor = (percentage) => {
  if (percentage >= 80) return '#48bb78';
  if (percentage >= 60) return '#ed8936';
  return '#f56565';
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

// Word comparison component
const WordComparison = ({ userText, correctText, differences }) => {
  if (!differences || differences.length === 0) {
    return (
      <div style={{
        background: '#f7fafc',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '15px',
        border: '1px solid #e2e8f0'
      }}>
        <strong style={{ color: '#4a5568' }}>Word-by-word comparison:</strong>
        <div style={{
          marginTop: '10px',
          fontFamily: 'monospace',
          fontSize: '0.9em'
        }}>
          No detailed comparison available
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#f7fafc',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '15px',
      border: '1px solid #e2e8f0'
    }}>
      <strong style={{ color: '#4a5568' }}>Word-by-word comparison:</strong>
      <div style={{
        marginTop: '10px',
        fontFamily: 'monospace',
        fontSize: '0.9em',
        lineHeight: '1.6'
      }}>
        {differences.map((diff, index) => (
          <span
            key={index}
            style={{
              background: diff.type === 'correct' ? '#c6f6d5' : 
                         diff.type === 'incorrect' ? '#fed7d7' : 
                         diff.type === 'close' ? '#fef2c7' :
                         diff.type === 'missing' ? '#bee3f8' : 
                         diff.type === 'extra' ? '#fbb6ce' : 'transparent',
              padding: '2px 6px',
              borderRadius: '4px',
              margin: '0 2px',
              border: diff.type === 'missing' ? '2px dashed #3182ce' : 
                     diff.type === 'extra' ? '2px dashed #e53e3e' : 'none'
            }}
            title={
              diff.type === 'incorrect' ? `Should be: ${diff.correct}` :
              diff.type === 'close' ? `Close to: ${diff.correct}` :
              diff.type === 'missing' ? 'Missing word' :
              diff.type === 'extra' ? 'Extra word' : ''
            }
          >
            {diff.type === 'missing' ? `[+${diff.text}]` : diff.text}
          </span>
        ))}
      </div>
      
      <div style={{
        marginTop: '10px',
        fontSize: '0.8em',
        color: '#718096'
      }}>
        <div style={{ marginBottom: '5px' }}>
          <span style={{ background: '#c6f6d5', padding: '2px 6px', borderRadius: '3px', marginRight: '8px' }}>
            Green: Correct
          </span>
          <span style={{ background: '#fed7d7', padding: '2px 6px', borderRadius: '3px', marginRight: '8px' }}>
            Red: Incorrect
          </span>
          <span style={{ background: '#fef2c7', padding: '2px 6px', borderRadius: '3px', marginRight: '8px' }}>
            Yellow: Close
          </span>
        </div>
        <div>
          <span style={{ background: '#bee3f8', padding: '2px 6px', borderRadius: '3px', marginRight: '8px', border: '1px dashed #3182ce' }}>
            Blue: Missing word
          </span>
          <span style={{ background: '#fbb6ce', padding: '2px 6px', borderRadius: '3px', border: '1px dashed #e53e3e' }}>
            Pink: Extra word
          </span>
        </div>
      </div>
    </div>
  );
};

// Detailed Answer Review component with proper word analysis
export const DetailedAnswerReview = ({ questionNumber, correctText, userAnswer, result }) => {
  if (!result) return null;

  const { isCorrect, isPartiallyCorrect, differences, score } = result;
  
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

      <div style={{ marginBottom: '15px' }}>
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

      {/* Word-by-word comparison */}
      {userAnswer && differences && (
        <WordComparison 
          userText={userAnswer} 
          correctText={correctText}
          differences={differences}
        />
      )}

      {/* Score information */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #e2e8f0',
        fontSize: '0.9em',
        color: '#666'
      }}>
        <span>
          <strong>Score:</strong> {Math.round((score || 0) * 100)}%
        </span>
        <span>
          <strong>Accuracy:</strong> {isCorrect ? 'Perfect' : isPartiallyCorrect ? 'Partial' : 'Needs work'}
        </span>
      </div>
    </div>
  );
};
