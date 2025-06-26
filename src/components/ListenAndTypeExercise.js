// src/components/ListenAndTypeExercise.js - Fixed with Detailed Answer Review
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { recordTestResult } from '../utils/progressDataManager';

// Function to calculate similarity between strings
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

// Levenshtein distance algorithm
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

// Function to check user's answer against correct text
const checkAnswer = (userAnswer, correctText) => {
  if (!userAnswer || !correctText) {
    return { type: 'incorrect', score: 0 };
  }

  const normaliseText = (text) => {
    return text.toLowerCase()
      .replace(/[.,!?;:"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalisedUser = normaliseText(userAnswer);
  const normalisedCorrect = normaliseText(correctText);

  if (normalisedUser === normalisedCorrect) {
    return { type: 'perfect', score: 1 };
  }

  const similarity = calculateSimilarity(normalisedUser, normalisedCorrect);
  
  if (similarity >= 0.85) {
    return { type: 'close', score: 0.8 };
  } else if (similarity >= 0.5) {
    return { type: 'partial', score: similarity * 0.5 };
  } else {
    return { type: 'incorrect', score: 0 };
  }
};

// Traffic Light Score Colour Function
const getScoreColor = (percentage) => {
  if (percentage >= 80) return '#48bb78'; // Green
  if (percentage >= 60) return '#ed8936'; // Orange/Yellow
  return '#f56565'; // Red
};

// Traffic Light Component
const TrafficLight = ({ percentage }) => {
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
      
      {/* Green Light */}
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
      
      {/* Yellow Light */}
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
      
      {/* Red Light */}
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

// Word-by-word comparison component
const WordComparison = ({ userText, correctText }) => {
  const normaliseText = (text) => {
    return text.toLowerCase()
      .replace(/[.,!?;:"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const userWords = normaliseText(userText || '').split(' ').filter(word => word.length > 0);
  const correctWords = normaliseText(correctText || '').split(' ').filter(word => word.length > 0);

  const getWordStatus = (userWord, correctWord, index) => {
    if (!userWord && correctWord) {
      return { status: 'missing', word: correctWord };
    }
    if (userWord && !correctWord) {
      return { status: 'extra', word: userWord };
    }
    if (userWord === correctWord) {
      return { status: 'correct', word: userWord };
    }
    if (userWord && correctWord) {
      // Check if it's a close match (1-2 character difference)
      const distance = levenshteinDistance(userWord, correctWord);
      if (distance <= 2 && userWord.length > 2) {
        return { status: 'close', word: userWord, correct: correctWord };
      }
      return { status: 'wrong', word: userWord, correct: correctWord };
    }
    return { status: 'unknown', word: userWord || correctWord };
  };

  const maxLength = Math.max(userWords.length, correctWords.length);
  const comparison = [];

  for (let i = 0; i < maxLength; i++) {
    const userWord = userWords[i];
    const correctWord = correctWords[i];
    comparison.push(getWordStatus(userWord, correctWord, i));
  }

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

// Detailed Answer Review Component
const DetailedAnswerReview = ({ answers }) => {
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
              <div style={{
                fontSize: '1.5em'
              }}>
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

function ListenAndTypeExercise({ onBack, onLogoClick }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [audioError, setAudioError] = useState(false);
  
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  const currentData = useMemo(() => {
    return testSentences[currentQuestion] || null;
  }, [testSentences, currentQuestion]);

  const playAudio = useCallback(() => {
    if (!audioRef.current || !currentData || playCount >= 3 || audioError) {
      console.log('🚫 Play blocked:', { 
        hasAudio: !!audioRef.current, 
        hasData: !!currentData, 
        playCount, 
        audioError 
      });
      return;
    }

    // Prevent multiple simultaneous play attempts
    if (isPlaying) {
      console.log('🔄 Already playing, ignoring play request');
      return;
    }

    const audio = audioRef.current;
    console.log('🎵 Attempting to play audio:', currentData.audioFile);
    
    // Reset audio to beginning
    audio.currentTime = 0;
    
    // Set playing state immediately to prevent double-clicks
    setIsPlaying(true);
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          console.log('✅ Audio play successful');
          setPlayCount(prev => {
            const newCount = prev + 1;
            console.log(`📊 Play count updated: ${newCount}/3`);
            return newCount;
          });
        })
        .catch(error => {
          console.error('❌ Audio play failed:', error);
          setAudioError(true);
          setIsPlaying(false); // Reset playing state on error
        });
    } else {
      // Fallback if play() doesn't return a promise
      setPlayCount(prev => prev + 1);
    }
  }, [currentData, playCount, isPlaying, audioError]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startExercise = useCallback(() => {
    setHasStarted(true);
    setExerciseStartTime(Date.now());
  }, []);

  const moveToNextQuestion = useCallback(() => {
    if (!currentData) return;

    console.log('➡️ Moving to next question');

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
      
      // CRITICAL: Reset audio states when moving to next question
      setIsPlaying(false);
      setPlayCount(0);
      setAudioError(false);
      
      console.log('🔄 Audio states reset for next question');
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
    const testDuration = exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 1000) : 0;
    const totalScore = finalAnswers.reduce((sum, answer) => sum + answer.result.score, 0);
    const averageScore = finalAnswers.length > 0 ? totalScore / finalAnswers.length : 0;
    const scoreOutOf10 = Math.round(averageScore * 10);
    
    try {
      const formattedAnswers = finalAnswers.map(answer => ({
        answer: answer.userInput || '',
        correct: answer.result.type === 'perfect',
        score: Math.round(answer.result.score * 100),
        level: answer.sentence.level || 'B1'
      }));

      recordTestResult({
        quizType: 'listen-and-type',
        score: scoreOutOf10,
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: testDuration,
        userAnswers: formattedAnswers
      });
    } catch (error) {
      console.error('Error recording test result:', error);
    }

    setShowResults(true);
  }, [exerciseStartTime]);

  const calculateScore = useCallback(() => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.result.score, 0);
    const maxScore = answers.length;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    return { 
      totalScore: Math.round(totalScore * 10) / 10,
      maxScore, 
      percentage,
      perfect: answers.filter(a => a.result.type === 'perfect').length,
      close: answers.filter(a => a.result.type === 'close').length,
      partial: answers.filter(a => a.result.type === 'partial').length,
      incorrect: answers.filter(a => a.result.type === 'incorrect').length
    };
  }, [answers]);

  const restartTest = useCallback(() => {
    setCurrentQuestion(0);
    setUserInput('');
    setTimeLeft(60);
    setShowResults(false);
    setAnswers([]);
    setHasStarted(false);
    setExerciseStartTime(null);
    setIsPlaying(false);
    setPlayCount(0);
    setAudioError(false);
    generateTestSentences();
  }, []);

  const generateTestSentences = useCallback(() => {
    const sentences = [];
    
    TEST_STRUCTURE.forEach(({ level, count }) => {
      const levelSentences = SENTENCE_POOLS[level] || [];
      
      for (let i = 0; i < count; i++) {
        if (levelSentences.length > 0) {
          const randomIndex = Math.floor(Math.random() * levelSentences.length);
          const selectedSentence = { ...levelSentences[randomIndex], level };
          sentences.push(selectedSentence);
          
          levelSentences.splice(randomIndex, 1);
        }
      }
    });
    
    setTestSentences(sentences);
  }, []);

  // Initialize test sentences on component mount
  useEffect(() => {
    generateTestSentences();
  }, [generateTestSentences]);

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

  // Audio event handlers - Fixed to properly reset playing state
  useEffect(() => {
    if (!audioRef.current || !currentData) return;

    const audio = audioRef.current;
    
    const handleEnded = () => {
      console.log('🎵 Audio ended - resetting play state');
      setIsPlaying(false);
    };

    const handleError = (e) => {
      console.error('🔴 Audio error:', e);
      setAudioError(true);
      setIsPlaying(false);
    };

    const handleLoadedData = () => {
      console.log('✅ Audio loaded successfully');
      setAudioError(false);
    };

    const handleCanPlay = () => {
      console.log('🎵 Audio ready to play');
      setAudioError(false);
    };

    const handlePause = () => {
      console.log('⏸️ Audio paused - resetting play state');
      setIsPlaying(false);
    };

    const handlePlay = () => {
      console.log('▶️ Audio started playing');
      setIsPlaying(true);
    };

    // Add all necessary event listeners
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [currentData]);

  // Auto-play first audio
  useEffect(() => {
    if (!hasStarted || showResults || !currentData || playCount > 0) return;

    const autoPlayTimer = setTimeout(() => {
      playAudio();
    }, 1000);

    return () => clearTimeout(autoPlayTimer);
  }, [hasStarted, currentData, playCount, showResults, currentQuestion, playAudio]);

  // Focus input when question changes
  useEffect(() => {
    if (hasStarted && inputRef.current && !showResults) {
      // Small delay to ensure the element is rendered and visible
      const timer = setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.select(); // This will select any existing text if there is any
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hasStarted, currentQuestion, showResults]);

  // Enter key handler
  useEffect(() => {
    if (!hasStarted || showResults) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && userInput.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [hasStarted, showResults, userInput, handleSubmit]);

  if (testSentences.length === 0) {
    return (
      <div className="listen-type-container">
        <div className="listen-type-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          <h1>🎧 Listen and Type</h1>
          <div className="loading-message">
            <p>🎲 Generating your test...</p>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();

    return (
      <div className="listen-type-container">
        <div className="listen-type-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎧 Listen and Type Results</h1>
          
          <div className="results">
            <h2>🎉 Test Complete!</h2>
            <div className="score-display">{score.totalScore}/{score.maxScore}</div>
            <div className="score-percentage">({score.percentage}%)</div>
            
            {/* TRAFFIC LIGHT SYSTEM */}
            <TrafficLight percentage={score.percentage} />
            
            <div className="score-breakdown">
              <div className="breakdown-item perfect">
                <span className="breakdown-icon">💯</span>
                <span className="breakdown-count">{score.perfect}</span>
                <span className="breakdown-label">Perfect</span>
              </div>
              <div className="breakdown-item close">
                <span className="breakdown-icon">✨</span>
                <span className="breakdown-count">{score.close}</span>
                <span className="breakdown-label">Close</span>
              </div>
              <div className="breakdown-item partial">
                <span className="breakdown-icon">👍</span>
                <span className="breakdown-count">{score.partial}</span>
                <span className="breakdown-label">Partial</span>
              </div>
              <div className="breakdown-item incorrect">
                <span className="breakdown-icon">❌</span>
                <span className="breakdown-count">{score.incorrect}</span>
                <span className="breakdown-label">Incorrect</span>
              </div>
            </div>
            
            <div className="level-estimate">
              <h3>Listening and Typing Skills</h3>
              <p>
                {score.percentage >= 90 ? "Outstanding! You have excellent listening and typing accuracy." :
                 score.percentage >= 75 ? "Great work! Your listening comprehension is very strong." :
                 score.percentage >= 60 ? "Good effort! Keep practising to improve your listening skills." :
                 "Keep working on your listening and spelling. Practice will help!"}
              </p>
            </div>
            
            {/* DETAILED ANSWER REVIEW - This was missing! */}
            <DetailedAnswerReview answers={answers} />
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={restartTest}>
                🔄 Try Again
              </button>
              <button className="btn btn-secondary" onClick={onBack}>
                ← Back to Exercises
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="listen-type-container">
        <div className="listen-type-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎧 Listen and Type</h1>
          
          <div className="instructions-container">
            <div className="instruction-content">
              <h3>📋 Instructions</h3>
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="instruction-icon">🎵</span>
                  <span>Listen carefully to the audio sentence</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">✍️</span>
                  <span>Type exactly what you hear</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🔁</span>
                  <span>You can replay each audio up to 3 times</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⏱️</span>
                  <span>You have 1 minute per sentence</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">✅</span>
                  <span>Spelling variations and missing punctuation are accepted</span>
                </div>
              </div>
              
              <div className="difficulty-info">
                <h4>📊 Test Structure</h4>
                <p>Progressive difficulty through levels:</p>
                <ul>
                  <li>2 A2 level sentences (elementary)</li>
                  <li>3 B1 level sentences (intermediate)</li>
                  <li>3 B2 level sentences (upper-intermediate)</li>
                  <li>2 C1 level sentences (advanced)</li>
                </ul>
              </div>
            </div>
            
            <button className="btn btn-primary btn-large" onClick={startExercise}>
              🎧 Start Listening Exercise
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listen-type-container">
      <div className="listen-type-quiz-container">
        <div className="listen-header">
          <div className="timer-section">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text" style={{ color: timeLeft <= 10 ? '#e53e3e' : '#4c51bf' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="progress-section">
            Question {currentQuestion + 1} of {testSentences.length}
          </div>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>

        <div className="listen-main-compact">
          <div className="level-indicator">
            <span className="level-badge">{currentData?.level}</span>
            <span className="level-description">{currentData?.difficulty}</span>
          </div>

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
                className={`play-btn-compact ${isPlaying ? 'playing' : ''}`}
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
                  minWidth: '180px',
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
              
              {!audioError && (
                <div style={{
                  color: '#666',
                  fontSize: '0.9em',
                  fontWeight: '500',
                  textAlign: 'center',
                  marginTop: '10px'
                }}>
                  Plays remaining: {Math.max(0, 3 - playCount)}
                </div>
              )}
              
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

          <div className="input-section-compact">
            <h3>Type what you hear:</h3>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the sentence here..."
              className="typing-input-compact"
              rows="4"
              autoFocus
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '15px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1.1em',
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                resize: 'vertical',
                transition: 'all 0.3s ease',
                backgroundColor: '#ffffff',
                lineHeight: '1.5'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4c51bf';
                e.target.style.boxShadow = '0 0 15px rgba(76, 81, 191, 0.2)';
                e.target.style.backgroundColor = '#f8f9ff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#ffffff';
              }}
            />
            
            <div style={{ 
              margin: '15px 0', 
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
              border: '1px solid #bee3f8'
            }}>
              <p style={{ 
                color: '#2b6cb0', 
                fontSize: '0.95em', 
                margin: '0',
                fontWeight: '500'
              }}>
                💡 <strong>Tip:</strong> Just type what you hear - spelling variations and missing punctuation are fine!
              </p>
            </div>

            <div className="action-buttons-compact">
              <button 
                className="btn-submit" 
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
                onMouseEnter={(e) => {
                  if (userInput.trim()) {
                    e.target.style.background = 'linear-gradient(135deg, #3c41a5, #5a67d8)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(76, 81, 191, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (userInput.trim()) {
                    e.target.style.background = 'linear-gradient(135deg, #4c51bf, #667eea)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                ✅ Submit Answer
              </button>
              
              <button 
                className="btn-skip" 
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
                onMouseEnter={(e) => {
                  e.target.style.background = '#cbd5e0';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#e2e8f0';
                  e.target.style.transform = 'translateY(0)';
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
    </div>
  );
}

export default ListenAndTypeExercise;
