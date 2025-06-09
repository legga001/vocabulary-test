import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';

// ==============================================
// HELPER FUNCTIONS
// ==============================================

// Generate random test sentences according to test structure
const generateTestSentences = () => {
  const testSentences = [];
  let sentenceCounter = 1;

  TEST_STRUCTURE.forEach(({ level, count }) => {
    const availableSentences = [...SENTENCE_POOLS[level]];
    
    for (let i = 0; i < count; i++) {
      if (availableSentences.length === 0) {
        console.warn(`Not enough ${level} sentences available`);
        break;
      }
      
      const randomIndex = Math.floor(Math.random() * availableSentences.length);
      const selectedSentence = availableSentences.splice(randomIndex, 1)[0];
      
      testSentences.push({
        id: sentenceCounter,
        level: level,
        audioFile: selectedSentence.audioFile,
        correctText: selectedSentence.correctText,
        difficulty: selectedSentence.difficulty
      });
      
      sentenceCounter++;
    }
  });

  return testSentences;
};

// Normalise text for comparison (remove punctuation, extra spaces, convert to lowercase)
const normaliseText = (text) => {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Calculate Levenshtein distance for fuzzy matching
const getLevenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Check if two strings are similar within a threshold
const isCloseMatch = (userText, correctText, threshold = 0.85) => {
  const distance = getLevenshteinDistance(userText, correctText);
  const maxLength = Math.max(userText.length, correctText.length);
  if (maxLength === 0) return true;
  const similarity = 1 - (distance / maxLength);
  return similarity >= threshold;
};

// Advanced text normalisation for comparison
const normaliseForComparison = (text) => {
  let normalised = normaliseText(text);
  
  // Handle number variations
  const numberMap = {
    'three': '3', 'seven': '7', 'one': '1', 'two': '2', 'four': '4',
    'five': '5', 'six': '6', 'eight': '8', 'nine': '9', 'ten': '10'
  };
  
  Object.entries(numberMap).forEach(([word, digit]) => {
    normalised = normalised.replace(new RegExp(`\\b(${word}|${digit})\\b`, 'g'), word);
  });
  
  // Handle British/American spelling differences
  const spellingMap = {
    'cancelled': 'canceled', 'criticised': 'criticized',
    'colour': 'color', 'centre': 'center'
  };
  
  Object.entries(spellingMap).forEach(([british, american]) => {
    normalised = normalised.replace(new RegExp(`\\b${british}\\b`, 'g'), american);
  });
  
  // Handle contractions
  const contractionMap = {
    'shes|she s': 'she is', 'cant|can t': 'can not', 'dont|do nt': 'do not',
    'theres|there s': 'there is', 'ive|i ve': 'i have', 'doesnt|does nt': 'does not',
    'well|we ll': 'we will', 'wasnt|was nt': 'was not', 'id|i d': 'i would',
    'werent|were nt': 'were not', 'couldnt|could nt': 'could not',
    'didnt|did nt': 'did not'
  };
  
  Object.entries(contractionMap).forEach(([contractions, expanded]) => {
    normalised = normalised.replace(new RegExp(`\\b(${contractions})\\b`, 'g'), expanded);
  });
  
  return normalised;
};

// Generate word-by-word highlighting for mistakes
const generateHighlights = (originalUserInput, originalCorrectText) => {
  const userInputWords = originalUserInput.trim().split(/\s+/);
  const correctTextWords = originalCorrectText.trim().split(/\s+/);
  
  const highlighted = [];
  const maxLength = Math.max(userInputWords.length, correctTextWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    const userWord = userInputWords[i] || '';
    const correctWord = correctTextWords[i] || '';
    
    if (!userWord && correctWord) {
      // Missing word
      highlighted.push({
        type: 'missing',
        text: `[${correctWord}]`,
        userText: '',
        correctText: correctWord
      });
    } else if (userWord && !correctWord) {
      // Extra word
      highlighted.push({
        type: 'extra',
        text: userWord,
        userText: userWord,
        correctText: ''
      });
    } else if (normaliseText(userWord) === normaliseText(correctWord)) {
      // Correct word
      highlighted.push({
        type: 'correct',
        text: userWord,
        userText: userWord,
        correctText: correctWord
      });
    } else {
      // Wrong or close word
      const similarity = isCloseMatch(normaliseText(userWord), normaliseText(correctWord), 0.7);
      highlighted.push({
        type: similarity ? 'close' : 'wrong',
        text: userWord,
        userText: userWord,
        correctText: correctWord
      });
    }
  }
  
  return highlighted;
};

// Main answer checking function
const checkAnswer = (userInput, correctText) => {
  const userNormalised = normaliseForComparison(userInput);
  const correctNormalised = normaliseForComparison(correctText);
  
  // Perfect match
  if (userNormalised === correctNormalised) {
    return { type: 'perfect', score: 1.0, highlights: null };
  }
  
  // Generate highlights for imperfect answers
  const highlights = generateHighlights(userInput, correctText);
  
  // Close match (minor spelling errors)
  if (isCloseMatch(userNormalised, correctNormalised, 0.85)) {
    return { type: 'close', score: 0.8, highlights: highlights };
  }
  
  // Partial match (some words correct)
  const userWords = userNormalised.split(' ');
  const correctWords = correctNormalised.split(' ');
  const matchingWords = userWords.filter(word => correctWords.includes(word));
  const partialScore = matchingWords.length / correctWords.length;
  
  if (partialScore >= 0.5) {
    return { type: 'partial', score: partialScore * 0.5, highlights: highlights };
  }
  
  // Incorrect
  return { type: 'incorrect', score: 0, highlights: highlights };
};

// ==============================================
// MAIN COMPONENT
// ==============================================
function ListenAndTypeExercise({ onBack, onLogoClick }) {
  // State management
  const [currentSentence, setCurrentSentence] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [playCount, setPlayCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  
  // Refs
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // Get current sentence data
  const currentData = testSentences[currentSentence] || null;

  // ==============================================
  // EFFECTS
  // ==============================================
  
  // Generate test sentences on mount
  useEffect(() => {
    const sentences = generateTestSentences();
    setTestSentences(sentences);
    console.log('Generated test sentences:', sentences);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasStarted && !showResults) {
      handleNext();
    }
  }, [timeLeft, hasStarted, showResults]);

  // Audio event listeners
  useEffect(() => {
    if (!audioRef.current || !currentData) return;

    const audio = audioRef.current;
    
    const handleLoadError = () => {
      setAudioError(true);
      console.warn(`Audio file ${currentData.audioFile} not found`);
    };

    const handleCanPlay = () => setAudioError(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('error', handleLoadError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('error', handleLoadError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentData]);

  // Focus input when appropriate
  useEffect(() => {
    if (hasStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasStarted, currentSentence]);

  // Auto-play audio with delay
  useEffect(() => {
    if (hasStarted && currentData && !audioError && playCount === 0) {
      const autoPlayTimer = setTimeout(playAudio, 1000);
      return () => clearTimeout(autoPlayTimer);
    }
  }, [currentSentence, hasStarted, audioError, playCount]);

  // Handle Enter key press to submit answer
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && hasStarted && !showResults && userInput.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    };

    if (hasStarted && !showResults) {
      document.addEventListener('keypress', handleKeyPress);
      return () => {
        document.removeEventListener('keypress', handleKeyPress);
      };
    }
  }, [hasStarted, showResults, userInput]);

  // ==============================================
  // HANDLERS
  // ==============================================
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playAudio = () => {
    if (playCount >= 3 || !audioRef.current || audioError) return;
    
    setIsPlaying(true);
    audioRef.current.currentTime = 0;
    
    audioRef.current.play()
      .then(() => setPlayCount(prev => prev + 1))
      .catch(error => {
        console.error('Audio play error:', error);
        setAudioError(true);
        setIsPlaying(false);
      });
  };

  const startExercise = () => {
    setHasStarted(true);
    setTimeLeft(60);
  };

  const handleSubmit = () => {
    if (!currentData || !userInput.trim()) return;
    handleNext();
  };

  const handleNext = () => {
    if (!currentData) return;

    const result = checkAnswer(userInput, currentData.correctText);
    
    setAnswers(prev => [...prev, {
      sentence: currentData,
      userInput: userInput.trim(),
      result: result,
      correct: result.type === 'perfect',
      close: result.type === 'close',
      partial: result.type === 'partial',
      timeTaken: 60 - timeLeft
    }]);

    if (currentSentence + 1 < testSentences.length) {
      // Move to next sentence
      setCurrentSentence(prev => prev + 1);
      setUserInput('');
      setTimeLeft(60);
      setPlayCount(0);
      setIsPlaying(false);
    } else {
      // Test completed
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.result.score, 0);
    const maxScore = answers.length;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    const perfect = answers.filter(a => a.result.type === 'perfect').length;
    const close = answers.filter(a => a.result.type === 'close').length;
    const partial = answers.filter(a => a.result.type === 'partial').length;
    const incorrect = answers.filter(a => a.result.type === 'incorrect').length;
    
    return { 
      totalScore: Math.round(totalScore * 10) / 10,
      maxScore, 
      percentage,
      perfect,
      close,
      partial,
      incorrect
    };
  };

  const restartTest = () => {
    setCurrentSentence(0);
    setUserInput('');
    setTimeLeft(60);
    setPlayCount(0);
    setShowResults(false);
    setAnswers([]);
    setIsPlaying(false);
    setHasStarted(false);
    setAudioError(false);
    
    const newSentences = generateTestSentences();
    setTestSentences(newSentences);
  };

  // ==============================================
  // RENDER HELPER FUNCTIONS
  // ==============================================
  
  const getResultDisplay = (result) => {
    switch(result.type) {
      case 'perfect':
        return { emoji: '💯', label: 'Perfect!', className: 'perfect' };
      case 'close':
        return { emoji: '✨', label: 'Very Close!', className: 'close' };
      case 'partial':
        return { emoji: '👍', label: 'Partial Credit', className: 'partial' };
      default:
        return { emoji: '❌', label: 'Incorrect', className: 'incorrect' };
    }
  };

  // ==============================================
  // RENDER CONDITIONS
  // ==============================================

  // Loading state
  if (testSentences.length === 0) {
    return (
      <div className="listen-type-container">
        <div className="listen-type-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎧 Listen and Type</h1>
          
          <div className="loading-message">
            <p>🎲 Generating your random test...</p>
            <p><small>Selecting sentences from different difficulty levels</small></p>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Results state
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

            <div className="detailed-results">
              <h3>📝 Detailed Results:</h3>
              <div className="results-list">
                {answers.map((answer, index) => {
                  const display = getResultDisplay(answer.result);
                  
                  return (
                    <div key={index} className={`result-item ${display.className}`}>
                      <div className="result-header">
                        <span className="result-emoji">{display.emoji}</span>
                        <span className="result-level">{answer.sentence.level}</span>
                        <span className="result-number">#{index + 1}</span>
                        <span className="result-score">+{answer.result.score}</span>
                      </div>
                      <div className="result-content">
                        <div className="result-status">
                          <strong>{display.label}</strong>
                          {answer.result.type === 'close' && (
                            <small> (Minor spelling errors - still great job!)</small>
                          )}
                          {answer.result.type === 'partial' && (
                            <small> (Got some words right - keep going!)</small>
                          )}
                        </div>
                        <div className="correct-text">
                          <strong>Correct:</strong> "{answer.sentence.correctText}"
                        </div>
                        {(answer.result.type !== 'perfect') && (
                          <div className="user-answer-analysis">
                            <strong>Your answer:</strong>
                            <div className="highlighted-answer">
                              {answer.result.highlights?.map((highlight, idx) => (
                                <span
                                  key={idx}
                                  className={`highlight-word ${highlight.type}`}
                                  title={
                                    highlight.type === 'missing' ? `Missing: "${highlight.correctText}"` :
                                    highlight.type === 'extra' ? `Extra word: "${highlight.userText}"` :
                                    highlight.type === 'wrong' ? `Should be: "${highlight.correctText}"` :
                                    highlight.type === 'close' ? `Close! Should be: "${highlight.correctText}"` :
                                    'Correct'
                                  }
                                >
                                  {highlight.text}
                                </span>
                              )) || (
                                <span className="highlight-word wrong">
                                  {answer.userInput || '(no answer)'}
                                </span>
                              )}
                            </div>
                            <div className="highlight-legend">
                              <small>
                                <span className="legend-item">
                                  <span className="legend-color correct"></span> Correct
                                </span>
                                <span className="legend-item">
                                  <span className="legend-color close"></span> Close
                                </span>
                                <span className="legend-item">
                                  <span className="legend-color wrong"></span> Wrong
                                </span>
                                <span className="legend-item">
                                  <span className="legend-color missing"></span> Missing
                                </span>
                                <span className="legend-item">
                                  <span className="legend-color extra"></span> Extra
                                </span>
                              </small>
                            </div>
                          </div>
                        )}
                        <div className="time-taken">
                          Time taken: {answer.timeTaken} seconds
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
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

  // Instructions state
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
                  <span>Type what you hear - spelling variations accepted</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🔢</span>
                  <span>Numbers can be written as words (three) or digits (3)</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🌍</span>
                  <span>Both British and American spellings accepted</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">❌</span>
                  <span>Punctuation (including apostrophes) not required</span>
                </div>
              </div>
              
              <div className="difficulty-info">
                <h4>📊 Test Structure</h4>
                <p>Random selection from pools of sentences:</p>
                <ul>
                  <li>2 A2 level sentences (elementary)</li>
                  <li>3 B1 level sentences (intermediate)</li>
                  <li>3 B2 level sentences (upper-intermediate)</li>
                  <li>2 C1 level sentences (advanced)</li>
                </ul>
                <p style={{ fontSize: '0.9em', fontStyle: 'italic', marginTop: '10px' }}>
                  Sentences are randomly selected each time - no two tests are the same!
                </p>
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

  // Main test interface
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
            Question {currentSentence + 1} of {testSentences.length}
          </div>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>

        <div className="listen-main">
          <div className="level-indicator">
            <span className="level-badge">{currentData?.level}</span>
            <span className="level-description">{currentData?.difficulty}</span>
          </div>

          <div className="audio-section">
            <audio ref={audioRef} preload="auto" key={currentData?.audioFile}>
              <source src={`/${currentData?.audioFile}`} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            
            <div className="audio-controls">
              <button 
                className={`play-btn ${isPlaying ? 'playing' : ''}`}
                onClick={playAudio}
                disabled={playCount >= 3 || isPlaying}
              >
                <span className="play-icon">
                  {isPlaying ? '🔊' : '▶️'}
                </span>
                <span className="play-text">
                  {isPlaying ? 'Playing...' : 'Play Audio'}
                </span>
              </button>
              
              <div className="play-counter">
                Plays remaining: {3 - playCount}
              </div>
            </div>

            {audioError && (
              <div className="audio-error">
                ⚠️ Audio file not found: {currentData?.audioFile}
                <br />
                <small>Please ensure the file exists in the public/audio/listen-and-type/ folder</small>
              </div>
            )}
          </div>

          <div className="input-section">
            <h3>Type what you hear:</h3>
            <textarea
              ref={inputRef}
              className="typing-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the sentence here..."
              rows={3}
            />
            
            <div className="input-info">
              <p>💡 <strong>Remember:</strong> Just type what you hear - spelling variations, numbers as words/digits, and missing punctuation are all fine!</p>
            </div>

            <div className="submit-section">
              <button 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!userInput.trim()}
              >
                Submit Answer
              </button>
              <p className="keyboard-hint">
                <small>💻 Press <strong>Enter</strong> to submit on desktop</small>
              </p>
            </div>
          </div>

          <div className="navigation-section">
            <button 
              className="btn btn-secondary"
              onClick={handleNext}
            >
              {currentSentence + 1 === testSentences.length ? 'Finish Test' : 'Skip Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListenAndTypeExercise;
