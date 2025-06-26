// src/components/ListenAndTypeExercise.js - Fixed version with working audio
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { checkAnswer } from '../utils/answerAnalysis';
import { generateTestSentences, calculateTestScore } from '../utils/sentenceGenerator';
import { 
  TrafficLight, 
  PerformanceLevel,
  DetailedAnswerReview, 
  AudioControls 
} from './ListenTypeComponents';

function ListenAndTypeExercise({ onBack, onLogoClick }) {
  // Core state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  
  const inputRef = useRef(null);

  const currentData = useMemo(() => {
    return testSentences[currentQuestion] || null;
  }, [testSentences, currentQuestion]);

  // Use custom hooks for audio and auto-play logic
  const { audioRef, isPlaying, playCount, audioError, playAudio } = useAudioPlayer(currentData, currentQuestion);
  useAutoPlay(hasStarted, currentData, showResults, currentQuestion, playCount, playAudio);

  // Utility functions
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startExercise = useCallback(() => {
    console.log('🚀 Starting exercise');
    setHasStarted(true);
    setExerciseStartTime(Date.now());
  }, []);

  const moveToNextQuestion = useCallback(() => {
    if (!currentData) return;

    console.log('➡️ Moving to next question from', currentQuestion);

    const result = checkAnswer(userInput, currentData.correctText);
    
    setAnswers(prev => [...prev, {
      sentence: currentData,
      userInput: userInput.trim(),
      result: result,
      timeTaken: 60 - timeLeft
    }]);

    if (currentQuestion + 1 < testSentences.length) {
      setCurrentQuestion(prev => prev + 1);
      setUserInput('');
      setTimeLeft(60);
    } else {
      finishExercise([...answers, {
        sentence: currentData,
        userInput: userInput.trim(),
        result: result,
        timeTaken: 60 - timeLeft
      }]);
    }
  }, [currentData, userInput, timeLeft, currentQuestion, testSentences.length, answers]);

  const handleSubmit = useCallback(() => {
    if (!currentData || !userInput.trim()) return;
    moveToNextQuestion();
  }, [currentData, userInput, moveToNextQuestion]);

  const finishExercise = useCallback((finalAnswers) => {
    const testDuration = exerciseStartTime ? 
      Math.round((Date.now() - exerciseStartTime) / 1000) : 0;

    const scoreData = calculateTestScore(finalAnswers);
    
    recordTestResult({
      exerciseType: 'listen-and-type',
      score: scoreData.totalScore,
      accuracy: scoreData.accuracy,
      duration: testDuration,
      totalQuestions: finalAnswers.length,
      correctAnswers: scoreData.correctAnswers,
      partiallyCorrectAnswers: scoreData.partiallyCorrectAnswers,
      incorrectAnswers: scoreData.incorrectAnswers,
      answers: finalAnswers
    });

    setShowResults(true);
  }, [exerciseStartTime]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !showResults && hasStarted && userInput.trim()) {
      handleSubmit();
    }
  }, [handleSubmit, showResults, hasStarted, userInput]);

  // Initialize test sentences on mount
  useEffect(() => {
    const sentences = generateTestSentences();
    setTestSentences(sentences);
    console.log('Generated test sentences:', sentences.length);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!hasStarted || showResults || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          moveToNextQuestion();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, showResults, timeLeft, moveToNextQuestion]);

  // Focus input when question changes
  useEffect(() => {
    if (hasStarted && !showResults && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion, hasStarted, showResults]);

  // Show results screen
  if (showResults) {
    const scoreData = calculateTestScore(answers);
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '800px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1 style={{
            color: '#2d3748',
            marginBottom: '30px',
            fontSize: '2.5em'
          }}>
            🎧 Listen & Type Results
          </h1>

          {/* Performance Level indicator - only shown in results */}
          <PerformanceLevel percentage={scoreData.totalScore} />

          <div style={{
            background: 'linear-gradient(135deg, #4c51bf, #667eea)',
            color: 'white',
            padding: '30px',
            borderRadius: '15px',
            marginBottom: '30px'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '2em' }}>
              📊 {scoreData.totalScore}%
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              <div>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                  {scoreData.correctAnswers}
                </div>
                <div style={{ opacity: 0.9 }}>Perfect ✅</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                  {scoreData.partiallyCorrectAnswers}
                </div>
                <div style={{ opacity: 0.9 }}>Partial 🔶</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                  {scoreData.incorrectAnswers}
                </div>
                <div style={{ opacity: 0.9 }}>Incorrect ❌</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#4a5568', marginBottom: '20px' }}>
              📝 Detailed Review
            </h3>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              background: '#f7fafc',
              borderRadius: '10px',
              padding: '20px'
            }}>
              {answers.map((answer, index) => (
                <DetailedAnswerReview
                  key={index}
                  questionNumber={index + 1}
                  correctText={answer.sentence.correctText}
                  userAnswer={answer.userInput}
                  result={answer.result}
                />
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #4c51bf, #667eea)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '1.1em',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🔄 Try Again
            </button>
            
            <button
              onClick={onBack}
              style={{
                padding: '15px 30px',
                background: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '25px',
                fontSize: '1.1em',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (testSentences.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '20px' }}>🎧</div>
          <h2>Loading Exercise...</h2>
          <p>Preparing your listening exercise</p>
        </div>
      </div>
    );
  }

  // Instructions screen
  if (!hasStarted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1 style={{
            color: '#2d3748',
            marginBottom: '30px',
            fontSize: '2.5em'
          }}>
            🎧 Listen & Type Exercise
          </h1>

          <div style={{
            background: '#f7fafc',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#4a5568', marginBottom: '20px', textAlign: 'center' }}>
              📋 Instructions
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              lineHeight: '1.8'
            }}>
              <li style={{ marginBottom: '10px' }}>
                🎵 <strong>Listen</strong> to each sentence carefully
              </li>
              <li style={{ marginBottom: '10px' }}>
                ⌨️ <strong>Type</strong> exactly what you hear
              </li>
              <li style={{ marginBottom: '10px' }}>
                🔄 <strong>Audio plays</strong> automatically when each question loads
              </li>
              <li style={{ marginBottom: '10px' }}>
                ⏰ You have <strong>60 seconds</strong> per question
              </li>
              <li style={{ marginBottom: '10px' }}>
                ✅ Press <strong>Enter</strong> or click Submit when ready
              </li>
              <li>
                ⏭️ You can skip questions if needed
              </li>
            </ul>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4c51bf, #667eea)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '30px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>
              📊 Ready to Test Your Listening Skills?
            </h4>
            <p style={{ margin: 0, opacity: 0.9 }}>
              You'll hear {testSentences.length} sentences to type out accurately
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={startExercise}
              style={{
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #4c51bf, #667eea)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '1.2em',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Start Exercise
            </button>
            
            <button
              onClick={onBack}
              style={{
                padding: '15px 30px',
                background: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '25px',
                fontSize: '1.1em',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main exercise screen
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <ClickableLogo onLogoClick={onLogoClick} />
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h1 style={{
            color: '#2d3748',
            margin: 0,
            fontSize: '2em'
          }}>
            🎧 Question {currentQuestion + 1} of {testSentences.length}
          </h1>
          
          <div style={{
            background: timeLeft <= 10 ? '#fed7d7' : '#e2e8f0',
            color: timeLeft <= 10 ? '#c53030' : '#4a5568',
            padding: '10px 20px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '1.1em'
          }}>
            ⏰ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          background: '#e2e8f0',
          borderRadius: '10px',
          height: '8px',
          marginBottom: '30px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #4c51bf, #667eea)',
            height: '100%',
            width: `${((currentQuestion + 1) / testSentences.length) * 100}%`,
            transition: 'width 0.3s ease',
            borderRadius: '10px'
          }} />
        </div>

        {/* Audio section */}
        {currentData && (
          <div style={{
            background: '#f7fafc',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <TrafficLight playCount={playCount} />
              <AudioControls 
                onPlay={playAudio}
                isPlaying={isPlaying}
                disabled={audioError}
                playCount={playCount}
              />
            </div>
            
            <audio 
              ref={audioRef}
              preload="auto"
              style={{ display: 'none' }}
              src={currentData?.audioFile ? `/${currentData.audioFile}` : ''}
            >
              Your browser does not support the audio element.
            </audio>
            
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
        )}

        {/* Input section */}
        <div style={{
          background: '#f7fafc',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            color: '#4a5568',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⌨️ Type what you hear:
          </h3>
          
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type the sentence you heard..."
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '1.1em',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box'
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            color: '#718096',
            fontSize: '0.9em'
          }}>
            <p style={{ margin: '10px 0' }}>
              💡 <strong>Tip:</strong> Listen carefully for punctuation and exact wording
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            margin: '20px 0',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={handleSubmit}
              disabled={!userInput.trim()}
              style={{
                padding: '14px 28px',
                border: 'none',
                borderRadius: '25px',
                fontWeight: '600',
                cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                fontSize: '1em',
                minWidth: '160px',
                background: userInput.trim() 
                  ? 'linear-gradient(135deg, #4c51bf, #667eea)' 
                  : '#a0aec0',
                color: 'white'
              }}
            >
              ✅ Submit Answer
            </button>
            
            <button 
              onClick={moveToNextQuestion}
              style={{
                padding: '14px 28px',
                border: 'none',
                borderRadius: '25px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1em',
                minWidth: '160px',
                background: '#e2e8f0',
                color: '#4a5568'
              }}
            >
              ⏭️ {currentQuestion + 1 === testSentences.length ? 'Finish Test' : 'Skip'}
            </button>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '15px' 
          }}>
            <small style={{ 
              color: '#718096', 
              fontSize: '0.85em' 
            }}>
              💻 Press <strong>Enter</strong> to submit your answer
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListenAndTypeExercise;
