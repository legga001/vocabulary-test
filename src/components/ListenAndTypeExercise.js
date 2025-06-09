import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';

// ==============================================
// SENTENCE DATA - Organised by CEFR levels
// ==============================================
const SENTENCE_POOLS = {
  A2: [
    {
      correctText: "I like to eat pizza on Fridays",
      difficulty: "A2 - Simple present tense with basic vocabulary"
    },
    {
      correctText: "She's going to the supermarket tomorrow",
      difficulty: "A2 - Future with 'going to' and contractions"
    },
    {
      correctText: "My brother works in a big office",
      difficulty: "A2 - Simple present with family and work vocabulary"
    },
    {
      correctText: "We can't find our keys anywhere",
      difficulty: "A2 - Modal verbs with contractions"
    },
    {
      correctText: "The children are playing in the garden",
      difficulty: "A2 - Present continuous with basic vocabulary"
    },
    {
      correctText: "I don't like coffee but I love tea",
      difficulty: "A2 - Preferences with conjunctions"
    },
    {
      correctText: "There's a new restaurant near my house",
      difficulty: "A2 - There is/are with location vocabulary"
    },
    {
      correctText: "He usually gets up at seven o'clock",
      difficulty: "A2 - Adverbs of frequency with time"
    },
    {
      correctText: "We're planning to visit Paris next month",
      difficulty: "A2 - Future plans with 'going to'"
    },
    {
      correctText: "The weather was terrible last weekend",
      difficulty: "A2 - Past simple with weather vocabulary"
    }
  ],
  
  B1: [
    {
      correctText: "I've been working here for three years",
      difficulty: "B1 - Present perfect with time expressions"
    },
    {
      correctText: "If it doesn't rain tomorrow we'll have a picnic",
      difficulty: "B1 - First conditional with contractions"
    },
    {
      correctText: "The meeting was cancelled because the manager wasn't available",
      difficulty: "B1 - Past tense with reason clauses"
    },
    {
      correctText: "I used to live in Manchester when I was younger",
      difficulty: "B1 - Used to with past experiences"
    },
    {
      correctText: "She's been studying English since she moved here",
      difficulty: "B1 - Present perfect continuous with time clauses"
    },
    {
      correctText: "The film we watched last night was really boring",
      difficulty: "B1 - Relative clauses with past tense"
    },
    {
      correctText: "I'd rather stay at home than go to the party",
      difficulty: "B1 - Preferences with 'would rather'"
    },
    {
      correctText: "By the time we arrived the concert had already started",
      difficulty: "B1 - Past perfect with time expressions"
    },
    {
      correctText: "The doctor advised me to take more exercise",
      difficulty: "B1 - Reported speech with advice"
    },
    {
      correctText: "Although it was raining we decided to go for a walk",
      difficulty: "B1 - Concessive clauses with 'although'"
    }
  ],
  
  B2: [
    {
      correctText: "Despite having studied for weeks he couldn't pass the examination",
      difficulty: "B2 - Complex sentence with 'despite' and past perfect"
    },
    {
      correctText: "The research suggests that people who exercise regularly live longer",
      difficulty: "B2 - Relative clauses with academic vocabulary"
    },
    {
      correctText: "I wish I'd taken that job offer instead of staying here",
      difficulty: "B2 - Third conditional with regret"
    },
    {
      correctText: "Had I known about the traffic I would have left earlier",
      difficulty: "B2 - Inverted conditional structures"
    },
    {
      correctText: "The company is trying to reduce the damage it causes to nature",
      difficulty: "B2 - Business vocabulary with relative pronouns"
    },
    {
      correctText: "Not only did she finish early but she also did better than expected",
      difficulty: "B2 - Inverted structures with 'not only'"
    },
    {
      correctText: "The study has been done in many different schools and colleges",
      difficulty: "B2 - Present perfect passive with simple vocabulary"
    },
    {
      correctText: "No sooner had we entered the room than the phone started ringing",
      difficulty: "B2 - Inverted structures with 'no sooner'"
    },
    {
      correctText: "The idea was turned down because it didn't have enough details",
      difficulty: "B2 - Passive voice with phrasal verbs"
    },
    {
      correctText: "If it weren't for the help of friends the project couldn't work",
      difficulty: "B2 - Hypothetical conditionals with simple vocabulary"
    }
  ],
  
  C1: [
    {
      correctText: "The government's refusal to make big changes has been criticised a lot",
      difficulty: "C1 - Complex possessive structures with passive voice"
    },
    {
      correctText: "Despite what the committee said the idea was rejected by everyone",
      difficulty: "C1 - Complex clause structures with simple vocabulary"
    },
    {
      correctText: "The problem shows itself in many different ways that seem unconnected",
      difficulty: "C1 - Complex sentence structure with relative clauses"
    },
    {
      correctText: "So big was the disaster that help from other countries came straight away",
      difficulty: "C1 - Inverted structures for emphasis"
    },
    {
      correctText: "What these results mean goes far beyond what this one study looked at",
      difficulty: "C1 - Complex clause structures with embedded questions"
    },
    {
      correctText: "Strangely the most successful business people often see failure as necessary",
      difficulty: "C1 - Complex ideas with simple vocabulary"
    },
    {
      correctText: "The growth of digital technology has completely changed how we think about talking to people",
      difficulty: "C1 - Complex embedded clauses with simple words"
    },
    {
      correctText: "Although it caused arguments the method used in the research gave new understanding",
      difficulty: "C1 - Complex concessive clauses"
    },
    {
      correctText: "The effects of climate change touch almost every part of modern life",
      difficulty: "C1 - Complex ideas expressed simply"
    },
    {
      correctText: "Whatever someone's political views the evidence shown cannot be argued with",
      difficulty: "C1 - Complex concessive structures with simple vocabulary"
    }
  ]
};

// Test structure: 2 A2, 3 B1, 3 B2, 2 C1 = 10 total
const TEST_STRUCTURE = [
  { level: 'A2', count: 2 },
  { level: 'B1', count: 3 },
  { level: 'B2', count: 3 },
  { level: 'C1', count: 2 }
];

// ==============================================
// HELPER FUNCTIONS
// ==============================================

// Generate random test sentences
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
      
// Generate random test sentences
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
      
      const originalIndex = SENTENCE_POOLS[level].findIndex(s => s.correctText === selectedSentence.correctText) + 1;
      const audioFileName = `audio/listen-and-type/${level}-${originalIndex.toString().padStart(2, '0')}.mp3`;
      
      testSentences.push({
        id: sentenceCounter,
        level: level,
        audioFile: audioFileName,
        correctText: selectedSentence.correctText,
        difficulty: selectedSentence.difficulty
      });
      
      sentenceCounter++;
    }
  });

  return testSentences;
};

// Text normalisation
const normaliseText = (text) => {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Levenshtein distance calculation for fuzzy matching
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

// Check similarity between two strings
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
  
  // Number variations
  const numberMap = {
    'three': '3', 'seven': '7', 'one': '1', 'two': '2', 'four': '4',
    'five': '5', 'six': '6', 'eight': '8', 'nine': '9', 'ten': '10'
  };
  
  Object.entries(numberMap).forEach(([word, digit]) => {
    normalised = normalised.replace(new RegExp(`\\b(${word}|${digit})\\b`, 'g'), word);
  });
  
  // British/American spelling
  const spellingMap = {
    'cancelled': 'canceled', 'criticised': 'criticized',
    'colour': 'color', 'centre': 'center'
  };
  
  Object.entries(spellingMap).forEach(([british, american]) => {
    normalised = normalised.replace(new RegExp(`\\b${british}\\b`, 'g'), american);
  });
  
  // Contractions
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

// Generate word-by-word highlighting
const generateHighlights = (originalUserInput, originalCorrectText, userWords, correctWords) => {
  const userInputWords = originalUserInput.trim().split(/\s+/);
  const correctTextWords = originalCorrectText.trim().split(/\s+/);
  
  const highlighted = [];
  const maxLength = Math.max(userInputWords.length, correctTextWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    const userWord = userInputWords[i] || '';
    const correctWord = correctTextWords[i] || '';
    
    if (!userWord && correctWord) {
      highlighted.push({
        type: 'missing',
        text: `[${correctWord}]`,
        userText: '',
        correctText: correctWord
      });
    } else if (userWord && !correctWord) {
      highlighted.push({
        type: 'extra',
        text: userWord,
        userText: userWord,
        correctText: ''
      });
    } else if (normaliseText(userWord) === normaliseText(correctWord)) {
      highlighted.push({
        type: 'correct',
        text: userWord,
        userText: userWord,
        correctText: correctWord
      });
    } else {
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

// Enhanced answer checking with highlighting
const checkAnswer = (userInput, correctText) => {
  const userNormalised = normaliseForComparison(userInput);
  const correctNormalised = normaliseForComparison(correctText);
  
  if (userNormalised === correctNormalised) {
    return { type: 'perfect', score: 1.0, highlights: null };
  }
  
  const userWords = userNormalised.split(' ');
  const correctWords = correctNormalised.split(' ');
  const highlights = generateHighlights(userInput, correctText, userWords, correctWords);
  
  if (isCloseMatch(userNormalised, correctNormalised, 0.85)) {
    return { type: 'close', score: 0.8, highlights: highlights };
  }
  
  const matchingWords = userWords.filter(word => correctWords.includes(word));
  const partialScore = matchingWords.length / correctWords.length;
  
  if (partialScore >= 0.5) {
    return { type: 'partial', score: partialScore * 0.5, highlights: highlights };
  }
  
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
      setCurrentSentence(prev => prev + 1);
      setUserInput('');
      setTimeLeft(60);
      setPlayCount(0);
      setIsPlaying(false);
    } else {
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
  // RENDER FUNCTIONS
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
            <audio ref={audioRef} preload="auto">
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
          </div>

          <div className="navigation-section">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleNext}
            >
              {currentSentence + 1 === testSentences.length ? 'Finish Test' : 'Next Sentence'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListenAndTypeExercise;
