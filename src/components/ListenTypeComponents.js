// src/components/ListenTypeComponents.js - Fixed DetailedAnswerReview with word analysis
import React from 'react';

export const getScoreColor = (percentage) => {
  if (percentage >= 80) return '#48bb78';
  if (percentage >= 60) return '#ed8936';
  return '#f56565';
};

// Simple Performance Level component for final results only
export const PerformanceLevel = ({ percentage }) => {
  const getPerformanceData = () => {
    if (percentage >= 80) return { emoji: '🌟', text: 'Excellent!', color: '#48bb78' };
    if (percentage >= 60) return { emoji: '👍', text: 'Good Progress', color: '#ed8936' };
    return { emoji: '📈', text: 'Keep Practising', color: '#f56565' };
  };

  const performance = getPerformanceData();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '15px 25px',
      background: 'white',
      borderRadius: '12px',
      border: `2px solid ${performance.color}`,
      margin: '20px auto',
      width: 'fit-content'
    }}>
      <div style={{ fontSize: '1.5em' }}>
        {performance.emoji}
      </div>
      <div>
        <div style={{ 
          fontWeight: '600',
          color: performance.color,
          fontSize: '1.1em'
        }}>
          {performance.text}
        </div>
        <div style={{ 
          fontSize: '0.9em',
          color: '#718096'
        }}>
          Performance Level
        </div>
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
