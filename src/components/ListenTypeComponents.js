// src/components/ListenTypeComponents.js - Reusable UI Components
import React from 'react';
import { analyseWordDifferences } from '../utils/answerAnalysis';

export const getScoreColor = (percentage) => {
  if (percentage >= 80) return '#48bb78';
  if (percentage >= 60) return '#ed8936';
  return '#f56565';
};

export const TrafficLight = ({ percentage }) => {
  const lightStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '15px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '2px solid #e2e8f0',
    margin: '20px auto',
    width: 'fit-content'
  };

  const lightCircleBase = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8em',
    fontWeight: 'bold'
  };

  const getActiveLight = () => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  };

  const activeLight = getActiveLight();

  return (
    <div style={lightStyle}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4c51bf', fontSize: '1em' }}>Performance Level</h4>
      
      <div style={{
        ...lightCircleBase,
        backgroundColor: activeLight === 'green' ? '#48bb78' : '#f7fafc',
        color: activeLight === 'green' ? 'white' : '#a0aec0',
        borderColor: activeLight === 'green' ? '#48bb78' : '#e2e8f0',
        transform: activeLight === 'green' ? 'scale(1.1)' : 'scale(1)',
        boxShadow: activeLight === 'green' ? '0 0 15px rgba(72, 187, 120, 0.5)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        ✓
      </div>
      
      <div style={{
        ...lightCircleBase,
        backgroundColor: activeLight === 'yellow' ? '#ed8936' : '#f7fafc',
        color: activeLight === 'yellow' ? 'white' : '#a0aec0',
        borderColor: activeLight === 'yellow' ? '#ed8936' : '#e2e8f0',
        transform: activeLight === 'yellow' ? 'scale(1.1)' : 'scale(1)',
        boxShadow: activeLight === 'yellow' ? '0 0 15px rgba(237, 137, 54, 0.5)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        ~
      </div>
      
      <div style={{
        ...lightCircleBase,
        backgroundColor: activeLight === 'red' ? '#f56565' : '#f7fafc',
        color: activeLight === 'red' ? 'white' : '#a0aec0',
        borderColor: activeLight === 'red' ? '#f56565' : '#e2e8f0',
        transform: activeLight === 'red' ? 'scale(1.1)' : 'scale(1)',
        boxShadow: activeLight === 'red' ? '0 0 15px rgba(245, 101, 101, 0.5)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        ✗
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '0.85em', 
        fontWeight: '600',
        color: getScoreColor(percentage)
      }}>
        {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Keep Practising'}
      </div>
    </div>
  );
};

export const WordComparison = ({ userText, correctText }) => {
  const comparison = analyseWordDifferences(userText, correctText);

  const getWordStyle = (status) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '4px',
      margin: '2px',
      display: 'inline-block',
      fontSize: '0.95em',
      fontWeight: '500'
    };

    switch (status) {
      case 'correct':
        return { ...baseStyle, backgroundColor: '#c6f6d5', color: '#2d6930', border: '1px solid #68d391' };
      case 'wrong':
        return { ...baseStyle, backgroundColor: '#fed7d7', color: '#c53030', border: '1px solid #fc8181' };
      case 'close':
        return { ...baseStyle, backgroundColor: '#feebc8', color: '#dd6b20', border: '1px solid #f6ad55' };
      case 'missing':
        return { ...baseStyle, backgroundColor: '#e6fffa', color: '#319795', border: '1px dashed #81e6d9' };
      case 'extra':
        return { ...baseStyle, backgroundColor: '#faf5ff', color: '#805ad5', border: '1px dashed #b794f6' };
      default:
        return { ...baseStyle, backgroundColor: '#f7fafc', color: '#4a5568', border: '1px solid #e2e8f0' };
    }
  };

  return (
    <div style={{ marginTop: '15px' }}>
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#4c51bf' }}>Word-by-word Comparison:</strong>
      </div>
      <div style={{ lineHeight: '2', marginBottom: '15px' }}>
        {comparison.map((item, index) => (
          <span key={index} style={getWordStyle(item.status)}>
            {item.status === 'missing' && '+ '}
            {item.status === 'extra' && '- '}
            {item.word}
            {(item.status === 'wrong' || item.status === 'close') && item.correct && 
              <span style={{ fontSize: '0.8em', opacity: '0.8' }}> → {item.correct}</span>
            }
          </span>
        ))}
      </div>
      <div style={{ fontSize: '0.85em', color: '#666', marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <span><span style={{ color: '#2d6930', fontWeight: 'bold' }}>Green:</span> Correct</span>
          <span><span style={{ color: '#dd6b20', fontWeight: 'bold' }}>Orange:</span> Close match</span>
          <span><span style={{ color: '#c53030', fontWeight: 'bold' }}>Red:</span> Incorrect</span>
          <span><span style={{ color: '#319795', fontWeight: 'bold' }}>+:</span> Missing word</span>
          <span><span style={{ color: '#805ad5', fontWeight: 'bold' }}>-:</span> Extra word</span>
        </div>
      </div>
    </div>
  );
};

export const DetailedAnswerReview = ({ answers }) => {
  if (!answers || answers.length === 0) return null;

  return (
    <div style={{ 
      margin: '30px 0', 
      textAlign: 'left',
      background: '#f8f9fa',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0'
    }}>
      <h3 style={{ 
        textAlign: 'center', 
        color: '#4c51bf', 
        marginBottom: '25px',
        fontSize: '1.3em'
      }}>
        📝 Detailed Answer Review
      </h3>
      
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {answers.map((answer, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '15px',
            border: `2px solid ${
              answer.result.type === 'perfect' ? '#48bb78' :
              answer.result.type === 'close' ? '#ed8936' :
              answer.result.type === 'partial' ? '#4299e1' : '#f56565'
            }`
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <div>
                <strong style={{ color: '#4c51bf' }}>Question {index + 1}</strong>
                <span style={{ 
                  marginLeft: '10px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8em',
                  fontWeight: 'bold',
                  backgroundColor: '#e2e8f0',
                  color: '#4a5568'
                }}>
                  {answer.sentence.level}
                </span>
              </div>
              <div style={{ fontSize: '1.5em' }}>
                {answer.result.type === 'perfect' ? '💯' :
                 answer.result.type === 'close' ? '✨' :
                 answer.result.type === 'partial' ? '👍' : '❌'}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#2d6930' }}>Correct text:</strong>
              </div>
              <div style={{
                padding: '10px',
                backgroundColor: '#f0fff4',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '1.05em',
                border: '1px solid #c6f6d5'
              }}>
                "{answer.sentence.correctText}"
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#c53030' }}>Your answer:</strong>
              </div>
              <div style={{
                padding: '10px',
                backgroundColor: answer.userInput.trim() ? '#fff5f5' : '#faf5ff',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '1.05em',
                border: `1px solid ${answer.userInput.trim() ? '#fed7d7' : '#e9d8fd'}`,
                fontStyle: answer.userInput.trim() ? 'normal' : 'italic',
                color: answer.userInput.trim() ? '#2d3748' : '#805ad5'
              }}>
                {answer.userInput.trim() || '(No answer provided)'}
              </div>
            </div>

            {answer.userInput.trim() && (
              <WordComparison 
                userText={answer.userInput} 
                correctText={answer.sentence.correctText} 
              />
            )}

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
                <strong>Score:</strong> {Math.round(answer.result.score * 100)}%
              </span>
              <span>
                <strong>Time taken:</strong> {answer.timeTaken}s
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AudioControls = ({ 
  audioRef, 
  currentData, 
  isPlaying, 
  playCount, 
  audioError, 
  playAudio, 
  currentQuestion 
}) => {
  return (
    <div className="audio-section-compact">
      <audio 
        ref={audioRef} 
        preload="auto"
        src={currentData ? `/${currentData.audioFile}` : ''}
      >
        Your browser does not support the audio element.
      </audio>

      <div className="audio-controls-compact">
        <button 
          onClick={playAudio}
          disabled={playCount >= 3 || audioError}
          style={{
            background: isPlaying 
              ? 'linear-gradient(135deg, #ed8936, #dd6b20)' 
              : (playCount >= 3 || audioError)
                ? '#a0aec0'
                : 'linear-gradient(135deg, #48bb78, #38a169)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '15px 30px',
            fontSize: '1.1em',
            fontWeight: '600',
            cursor: (playCount >= 3 || audioError) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '200px',
            justifyContent: 'center',
            opacity: (playCount >= 3 || audioError) ? 0.6 : 1
          }}
        >
          {isPlaying ? '🔊' : '▶️'} 
          {isPlaying ? 'Playing...' : 
           audioError ? 'Audio Error' : 
           playCount >= 3 ? 'No plays left' :
           `Play Audio ${playCount > 0 ? `(${playCount}/3)` : ''}`}
        </button>
        
        <div style={{
          color: '#666',
          fontSize: '0.9em',
          fontWeight: '500',
          textAlign: 'center',
          marginTop: '10px'
        }}>
          Plays remaining: {Math.max(0, 3 - playCount)}
          <div style={{ fontSize: '0.7em', color: '#999', marginTop: '5px' }}>
            Q{currentQuestion + 1} | Playing: {isPlaying ? 'YES' : 'NO'} | Count: {playCount} | Error: {audioError ? 'YES' : 'NO'}
          </div>
        </div>
        
        {audioError && (
          <div style={{
            background: '#fff5f5',
            color: '#e53e3e',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '15px',
            textAlign: 'center',
            border: '1px solid #feb2b2'
          }}>
            ⚠️ Audio playback error. Please try again or skip this question.
          </div>
        )}
      </div>
    </div>
  );
};
