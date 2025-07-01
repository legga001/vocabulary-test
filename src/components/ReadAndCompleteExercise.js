// src/components/ReadAndCompleteExercise.js - Read and Complete exercise with random paragraph selection
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { getRandomParagraphs } from '../data/readCompleteData';
import '../styles/read-complete-exercise.css';

// Timer duration in seconds
const TIMER_DURATION = 180; // 3 minutes

function ReadAndCompleteExercise({ onBack, onLogoClick }) {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [gameState, setGameState] = useState('instructions'); // instructions, playing, results
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [userAnswers, setUserAnswers] = useState({});
  const [scores, setScores] = useState([]);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentUserInputs, setCurrentUserInputs] = useState([]);
  const [exerciseParagraphs, setExerciseParagraphs] = useState([]);
  
  const timerRef = useRef(null);
  const inputRefs = useRef([]);

  // Initialize random paragraphs when component mounts
  useEffect(() => {
    const randomParagraphs = getRandomParagraphs();
    setExerciseParagraphs(randomParagraphs);
    console.log('🎲 Random paragraphs selected:', randomParagraphs.map(p => `${p.title} (${p.id})`));
  }, []);

  // Get letters to show for each word (using existing logic)
  const getLettersToShow = useCallback((word) => {
    const length = word.length;
    if (length <= 3) return 1;
    if (length <= 5) return 2;
    if (length <= 7) return 3;
    if (length <= 9) return 4;
    if (length <= 11) return 5;
    return Math.floor(length / 2);
  }, []);

  // Process paragraph to create input fields
  const processGappedText = useCallback((gappedText, answers) => {
    const parts = gappedText.split(/\b\w*_+\w*\b/);
    const gaps = gappedText.match(/\b\w*_+\w*\b/g) || [];
    
    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        elements.push({ type: 'text', content: parts[i] });
      }
      if (i < gaps.length) {
        const answer = answers[i];
        const lettersToShow = getLettersToShow(answer);
        const visiblePart = answer.substring(0, lettersToShow);
        const hiddenLength = answer.length - lettersToShow;
        
        elements.push({
          type: 'input',
          index: i,
          visiblePart,
          hiddenLength,
          answer,
          placeholder: '_'.repeat(hiddenLength)
        });
      }
    }
    return elements;
  }, [getLettersToShow]);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      handleTimeUp();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerActive, timeRemaining]);

  // Start paragraph
  const startParagraph = useCallback(() => {
    if (exerciseParagraphs.length === 0) return; // Wait for paragraphs to load
    
    const paragraph = exerciseParagraphs[currentParagraph];
    setCurrentUserInputs(new Array(paragraph.answers.length).fill(''));
    setTimeRemaining(TIMER_DURATION);
    setIsTimerActive(true);
    setGameState('playing');
    
    // Focus first input after a short delay
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100);
  }, [currentParagraph, exerciseParagraphs]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    setIsTimerActive(false);
    const paragraph = exerciseParagraphs[currentParagraph];
    const score = calculateScore(currentUserInputs, paragraph.answers);
    const newScores = [...scores, score];
    setScores(newScores);
    setUserAnswers(prev => ({
      ...prev,
      [currentParagraph]: [...currentUserInputs]
    }));
    
    if (currentParagraph < exerciseParagraphs.length - 1) {
      setCurrentParagraph(prev => prev + 1);
      setGameState('instructions');
    } else {
      setGameState('results');
    }
  }, [currentParagraph, currentUserInputs, scores, exerciseParagraphs]);

  // Calculate score
  const calculateScore = useCallback((userInputs, correctAnswers) => {
    let correct = 0;
    userInputs.forEach((input, index) => {
      if (input.toLowerCase().trim() === correctAnswers[index].toLowerCase()) {
        correct++;
      }
    });
    return { correct, total: correctAnswers.length, percentage: Math.round((correct / correctAnswers.length) * 100) };
  }, []);

  // Handle input change
  const handleInputChange = useCallback((index, value) => {
    const newInputs = [...currentUserInputs];
    newInputs[index] = value;
    setCurrentUserInputs(newInputs);

    // Auto-focus next input if current one is filled and Enter wasn't pressed
    if (value && index < currentUserInputs.length - 1 && inputRefs.current[index + 1]) {
      setTimeout(() => {
        inputRefs.current[index + 1].focus();
      }, 100);
    }
  }, [currentUserInputs]);

  // Handle key press
  const handleKeyPress = useCallback((e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < currentUserInputs.length - 1) {
        inputRefs.current[index + 1].focus();
      } else {
        // Submit current paragraph
        handleTimeUp();
      }
    }
  }, [currentUserInputs.length, handleTimeUp]);

  // Start next paragraph
  const startNextParagraph = useCallback(() => {
    setCurrentParagraph(prev => prev + 1);
    setGameState('instructions');
  }, []);

  // Restart exercise with new random paragraphs
  const restart = useCallback(() => {
    const newRandomParagraphs = getRandomParagraphs();
    setExerciseParagraphs(newRandomParagraphs);
    setCurrentParagraph(0);
    setGameState('instructions');
    setTimeRemaining(TIMER_DURATION);
    setUserAnswers({});
    setScores([]);
    setIsTimerActive(false);
    setCurrentUserInputs([]);
    console.log('🔄 New random paragraphs selected:', newRandomParagraphs.map(p => `${p.title} (${p.id})`));
  }, []);

  // Format time
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Return loading state if paragraphs haven't loaded yet
  if (exerciseParagraphs.length === 0) {
    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="loading-state">
            <h2>📖 Loading Read and Complete Exercise...</h2>
            <p>Selecting random paragraphs for you...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentParagraphData = exerciseParagraphs[currentParagraph];
  const levelLabels = ['A2', 'B2', 'C1'];

  // Instructions screen
  if (gameState === 'instructions') {
    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📖 Read and Complete</h1>
          
          {currentParagraph === 0 ? (
            <div className="instructions-container">
              <h3>📋 How to Play</h3>
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="instruction-icon">📝</span>
                  <span>Complete the missing words in each paragraph</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⏱️</span>
                  <span>You have 3 minutes per paragraph</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">📊</span>
                  <span>3 paragraphs: A2, B2, and C1 levels</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">💡</span>
                  <span>Use context clues to help you complete the words</span>
                </div>
              </div>
              
              <div className="tips-section">
                <h4>💡 Tips:</h4>
                <ul>
                  <li>Read the whole paragraph first to understand the context</li>
                  <li>Some letters are already provided to help you</li>
                  <li>Press Enter to move to the next word</li>
                  <li>Look at the surrounding words for clues</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="paragraph-transition">
              <h3>Well done! 🎉</h3>
              <p>You completed paragraph {currentParagraph} ({levelLabels[currentParagraph - 1]} level)</p>
              <p>Score: {scores[scores.length - 1]?.correct}/{scores[scores.length - 1]?.total} ({scores[scores.length - 1]?.percentage}%)</p>
            </div>
          )}
          
          <div className="paragraph-info">
            <h3>Next: Paragraph {currentParagraph + 1}</h3>
            <div className={`level-badge level-${levelLabels[currentParagraph].toLowerCase()}`}>
              {levelLabels[currentParagraph]} Level
            </div>
            <h4>{currentParagraphData.title}</h4>
          </div>

          <button className="btn btn-primary" onClick={startParagraph}>
            {currentParagraph === 0 ? '🚀 Start Exercise' : '📖 Start Next Paragraph'}
          </button>
          
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Playing screen
  if (gameState === 'playing') {
    const processedElements = processGappedText(currentParagraphData.gappedText, currentParagraphData.answers);

    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="timer-header">
            <h2>📖 Read and Complete - {levelLabels[currentParagraph]} Level</h2>
            <div className={`timer ${timeRemaining <= 30 ? 'timer-warning' : ''}`}>
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="paragraph-header">
            <h3>{currentParagraphData.title}</h3>
            <div className="progress-indicator">
              Paragraph {currentParagraph + 1} of {exerciseParagraphs.length}
            </div>
          </div>

          <div className="paragraph-container">
            <div className="paragraph-text">
              {processedElements.map((element, index) => {
                if (element.type === 'text') {
                  return <span key={index}>{element.content}</span>;
                } else {
                  return (
                    <span key={index} className="input-wrapper">
                      <span className="visible-letters">{element.visiblePart}</span>
                      <input
                        ref={ref => inputRefs.current[element.index] = ref}
                        type="text"
                        className="word-input"
                        value={currentUserInputs[element.index] || ''}
                        onChange={(e) => handleInputChange(element.index, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, element.index)}
                        placeholder={element.placeholder}
                        maxLength={element.hiddenLength}
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </span>
                  );
                }
              })}
            </div>
          </div>

          <div className="progress-section">
            <div className="completion-status">
              Words completed: {currentUserInputs.filter(input => input.trim() !== '').length}/{currentParagraphData.answers.length}
            </div>
            <button className="btn btn-warning" onClick={handleTimeUp}>
              ✅ Finish Early
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState === 'results') {
    const totalCorrect = scores.reduce((sum, score) => sum + score.correct, 0);
    const totalQuestions = scores.reduce((sum, score) => sum + score.total, 0);
    const overallPercentage = Math.round((totalCorrect / totalQuestions) * 100);

    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📊 Exercise Complete!</h1>
          
          <div className="overall-score">
            <div className="score-display">
              <div className="score-number">{totalCorrect}/{totalQuestions}</div>
              <div className="score-percentage">{overallPercentage}%</div>
            </div>
          </div>

          <div className="detailed-results">
            <h3>📋 Paragraph Results:</h3>
            {scores.map((score, index) => (
              <div key={index} className="paragraph-result">
                <div className="paragraph-result-header">
                  <span className="paragraph-title">{exerciseParagraphs[index].title}</span>
                  <span className={`level-badge level-${levelLabels[index].toLowerCase()}`}>
                    {levelLabels[index]}
                  </span>
                </div>
                <div className="paragraph-score">
                  {score.correct}/{score.total} ({score.percentage}%)
                </div>
                
                <div className="answer-review">
                  <h4>Your answers:</h4>
                  <div className="answers-grid">
                    {userAnswers[index]?.map((userAnswer, answerIndex) => {
                      const correct = userAnswer.toLowerCase().trim() === exerciseParagraphs[index].answers[answerIndex].toLowerCase();
                      return (
                        <div key={answerIndex} className={`answer-item ${correct ? 'correct' : 'incorrect'}`}>
                          <span className="answer-number">{answerIndex + 1}.</span>
                          <span className="user-answer">{userAnswer || '(blank)'}</span>
                          {!correct && (
                            <span className="correct-answer">→ {exerciseParagraphs[index].answers[answerIndex]}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="results-actions">
            <button className="btn btn-primary" onClick={restart}>
              🔄 Try Again (New Paragraphs)
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ReadAndCompleteExercise;// src/components/ReadAndCompleteExercise.js - Read and Complete exercise with 3 paragraphs
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import '../styles/read-complete-exercise.css';

// Exercise data with 3 paragraphs at different levels
const EXERCISE_DATA = {
  paragraphs: [
    {
      level: 'A2',
      title: 'A Day at the Market',
      text: `Every Saturday morning, Sarah goes to the local market with her mother. The market is always busy with people buying fresh fruit and vegetables. Sarah's favourite stall sells the most delicious apples and oranges in the whole town. The friendly vendor always gives her a free sample to taste before they buy anything. After shopping, they usually stop at the small café nearby for a cup of tea and a slice of homemade cake. This weekly tradition has become one of Sarah's most cherished memories, and she looks forward to it every week. The market brings the whole community together in a wonderful way.`,
      gappedText: `Every Saturday morning, Sarah goes to the local market with her mother. The market is always b__y with people buying fresh f__t and vegetables. Sarah's favourite s__l sells the most delicious a__s and oranges in the whole town. The friendly v__r always gives her a free s__e to taste before they buy anything. After shopping, they usually s__p at the small café nearby for a cup of tea and a slice of homemade c__e. This weekly t__n has become one of Sarah's most cherished m__s, and she looks forward to it every week. The market brings the whole c__y together in a wonderful way.`,
      answers: ['busy', 'fruit', 'stall', 'apples', 'vendor', 'sample', 'stop', 'cake', 'tradition', 'memories', 'community']
    },
    {
      level: 'B2',
      title: 'The Benefits of Urban Gardens',
      text: `Urban gardening has emerged as a significant movement in modern cities worldwide. These green spaces provide numerous environmental benefits whilst offering communities opportunities for sustainable food production. Research indicates that urban gardens can reduce air pollution by absorbing harmful chemicals and producing oxygen more efficiently than traditional parks. Furthermore, they promote biodiversity by creating habitats for various insects and birds that might otherwise struggle in concrete environments. The psychological benefits are equally impressive, as gardening has been proven to reduce stress levels and improve mental wellbeing. Many participants report feeling more connected to their neighbourhood and developing stronger relationships with fellow gardeners through shared experiences and knowledge exchange.`,
      gappedText: `Urban gardening has emerged as a significant movement in modern cities worldwide. These green spaces provide numerous e__l benefits whilst offering communities opportunities for s__e food production. Research i__s that urban gardens can reduce air p__n by absorbing harmful chemicals and producing oxygen more e__y than traditional parks. Furthermore, they promote b__y by creating habitats for various insects and birds that might otherwise struggle in concrete e__s. The psychological benefits are equally i__e, as gardening has been proven to reduce stress levels and improve mental w__g. Many participants report feeling more c__d to their neighbourhood and developing stronger r__s with fellow gardeners through shared experiences and knowledge exchange.`,
      answers: ['environmental', 'sustainable', 'indicates', 'pollution', 'efficiently', 'biodiversity', 'environments', 'impressive', 'wellbeing', 'connected', 'relationships']
    },
    {
      level: 'C1',
      title: 'The Philosophy of Artificial Intelligence',
      text: `The philosophical implications of artificial intelligence represent one of the most profound intellectual challenges of our contemporary era. As machine learning algorithms become increasingly sophisticated, we must grapple with fundamental questions about consciousness, sentience, and the nature of intelligence itself. The prospect of achieving artificial general intelligence raises complex ethical dilemmas regarding autonomy, responsibility, and the potential displacement of human agency. Critics argue that current AI systems, despite their impressive computational capabilities, lack genuine understanding and operate merely through statistical pattern recognition. Conversely, proponents suggest that consciousness might emerge from sufficiently complex information processing, regardless of its substrate. This ongoing discourse necessitates interdisciplinary collaboration between philosophers, cognitive scientists, and technologists to navigate the unprecedented challenges that lie ahead.`,
      gappedText: `The philosophical implications of artificial intelligence represent one of the most profound intellectual challenges of our contemporary era. As machine learning a__s become increasingly s__d, we must grapple with fundamental questions about c__s, sentience, and the nature of intelligence itself. The prospect of achieving artificial general intelligence raises complex ethical d__s regarding autonomy, responsibility, and the potential d__t of human agency. Critics argue that current AI systems, despite their impressive c__l capabilities, lack genuine u__g and operate merely through statistical pattern r__n. Conversely, proponents suggest that consciousness might e__e from sufficiently complex information processing, regardless of its s__e. This ongoing discourse n__s interdisciplinary collaboration between philosophers, cognitive scientists, and technologists to navigate the unprecedented challenges that lie ahead.`,
      answers: ['algorithms', 'sophisticated', 'consciousness', 'dilemmas', 'displacement', 'computational', 'understanding', 'recognition', 'emerge', 'substrate', 'necessitates']
    }
  ]
};

// Timer duration in seconds
const TIMER_DURATION = 180; // 3 minutes

function ReadAndCompleteExercise({ onBack, onLogoClick }) {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [gameState, setGameState] = useState('instructions'); // instructions, playing, results
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [userAnswers, setUserAnswers] = useState({});
  const [scores, setScores] = useState([]);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentUserInputs, setCurrentUserInputs] = useState([]);
  
  const timerRef = useRef(null);
  const inputRefs = useRef([]);

  // Get letters to show for each word (using existing logic)
  const getLettersToShow = useCallback((word) => {
    const length = word.length;
    if (length <= 3) return 1;
    if (length <= 5) return 2;
    if (length <= 7) return 3;
    if (length <= 9) return 4;
    if (length <= 11) return 5;
    return Math.floor(length / 2);
  }, []);

  // Process paragraph to create input fields
  const processGappedText = useCallback((gappedText, answers) => {
    const parts = gappedText.split(/\b\w*_+\w*\b/);
    const gaps = gappedText.match(/\b\w*_+\w*\b/g) || [];
    
    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        elements.push({ type: 'text', content: parts[i] });
      }
      if (i < gaps.length) {
        const answer = answers[i];
        const lettersToShow = getLettersToShow(answer);
        const visiblePart = answer.substring(0, lettersToShow);
        const hiddenLength = answer.length - lettersToShow;
        
        elements.push({
          type: 'input',
          index: i,
          visiblePart,
          hiddenLength,
          answer,
          placeholder: '_'.repeat(hiddenLength)
        });
      }
    }
    return elements;
  }, [getLettersToShow]);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      handleTimeUp();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerActive, timeRemaining]);

  // Start paragraph
  const startParagraph = useCallback(() => {
    const paragraph = EXERCISE_DATA.paragraphs[currentParagraph];
    setCurrentUserInputs(new Array(paragraph.answers.length).fill(''));
    setTimeRemaining(TIMER_DURATION);
    setIsTimerActive(true);
    setGameState('playing');
    
    // Focus first input after a short delay
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100);
  }, [currentParagraph]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    setIsTimerActive(false);
    const paragraph = EXERCISE_DATA.paragraphs[currentParagraph];
    const score = calculateScore(currentUserInputs, paragraph.answers);
    const newScores = [...scores, score];
    setScores(newScores);
    setUserAnswers(prev => ({
      ...prev,
      [currentParagraph]: [...currentUserInputs]
    }));
    
    if (currentParagraph < EXERCISE_DATA.paragraphs.length - 1) {
      setCurrentParagraph(prev => prev + 1);
      setGameState('instructions');
    } else {
      setGameState('results');
    }
  }, [currentParagraph, currentUserInputs, scores]);

  // Calculate score
  const calculateScore = useCallback((userInputs, correctAnswers) => {
    let correct = 0;
    userInputs.forEach((input, index) => {
      if (input.toLowerCase().trim() === correctAnswers[index].toLowerCase()) {
        correct++;
      }
    });
    return { correct, total: correctAnswers.length, percentage: Math.round((correct / correctAnswers.length) * 100) };
  }, []);

  // Handle input change
  const handleInputChange = useCallback((index, value) => {
    const newInputs = [...currentUserInputs];
    newInputs[index] = value;
    setCurrentUserInputs(newInputs);

    // Auto-focus next input if current one is filled and Enter wasn't pressed
    if (value && index < currentUserInputs.length - 1 && inputRefs.current[index + 1]) {
      setTimeout(() => {
        inputRefs.current[index + 1].focus();
      }, 100);
    }
  }, [currentUserInputs]);

  // Handle key press
  const handleKeyPress = useCallback((e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < currentUserInputs.length - 1) {
        inputRefs.current[index + 1].focus();
      } else {
        // Submit current paragraph
        handleTimeUp();
      }
    }
  }, [currentUserInputs.length, handleTimeUp]);

  // Start next paragraph
  const startNextParagraph = useCallback(() => {
    setCurrentParagraph(prev => prev + 1);
    setGameState('instructions');
  }, []);

  // Restart exercise
  const restart = useCallback(() => {
    setCurrentParagraph(0);
    setGameState('instructions');
    setTimeRemaining(TIMER_DURATION);
    setUserAnswers({});
    setScores([]);
    setIsTimerActive(false);
    setCurrentUserInputs([]);
  }, []);

  // Format time
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const currentParagraphData = EXERCISE_DATA.paragraphs[currentParagraph];

  // Instructions screen
  if (gameState === 'instructions') {
    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📖 Read and Complete</h1>
          
          {currentParagraph === 0 ? (
            <div className="instructions-container">
              <h3>📋 How to Play</h3>
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="instruction-icon">📝</span>
                  <span>Complete the missing words in each paragraph</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⏱️</span>
                  <span>You have 3 minutes per paragraph</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">📊</span>
                  <span>3 paragraphs: A2, B2, and C1 levels</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">💡</span>
                  <span>Use context clues to help you complete the words</span>
                </div>
              </div>
              
              <div className="tips-section">
                <h4>💡 Tips:</h4>
                <ul>
                  <li>Read the whole paragraph first to understand the context</li>
                  <li>Some letters are already provided to help you</li>
                  <li>Press Enter to move to the next word</li>
                  <li>Look at the surrounding words for clues</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="paragraph-transition">
              <h3>Well done! 🎉</h3>
              <p>You completed paragraph {currentParagraph} ({EXERCISE_DATA.paragraphs[currentParagraph - 1].level} level)</p>
              <p>Score: {scores[scores.length - 1]?.correct}/{scores[scores.length - 1]?.total} ({scores[scores.length - 1]?.percentage}%)</p>
            </div>
          )}
          
          <div className="paragraph-info">
            <h3>Next: Paragraph {currentParagraph + 1}</h3>
            <div className="level-badge level-{currentParagraphData.level.toLowerCase()}">{currentParagraphData.level} Level</div>
            <h4>{currentParagraphData.title}</h4>
          </div>

          <button className="btn btn-primary" onClick={startParagraph}>
            {currentParagraph === 0 ? '🚀 Start Exercise' : '📖 Start Next Paragraph'}
          </button>
          
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Playing screen
  if (gameState === 'playing') {
    const processedElements = processGappedText(currentParagraphData.gappedText, currentParagraphData.answers);

    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="timer-header">
            <h2>📖 Read and Complete - {currentParagraphData.level} Level</h2>
            <div className={`timer ${timeRemaining <= 30 ? 'timer-warning' : ''}`}>
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="paragraph-header">
            <h3>{currentParagraphData.title}</h3>
            <div className="progress-indicator">
              Paragraph {currentParagraph + 1} of {EXERCISE_DATA.paragraphs.length}
            </div>
          </div>

          <div className="paragraph-container">
            <div className="paragraph-text">
              {processedElements.map((element, index) => {
                if (element.type === 'text') {
                  return <span key={index}>{element.content}</span>;
                } else {
                  return (
                    <span key={index} className="input-wrapper">
                      <span className="visible-letters">{element.visiblePart}</span>
                      <input
                        ref={ref => inputRefs.current[element.index] = ref}
                        type="text"
                        className="word-input"
                        value={currentUserInputs[element.index] || ''}
                        onChange={(e) => handleInputChange(element.index, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, element.index)}
                        placeholder={element.placeholder}
                        maxLength={element.hiddenLength}
                        autoComplete="off"
                        spellCheck="false"
                      />
                    </span>
                  );
                }
              })}
            </div>
          </div>

          <div className="progress-section">
            <div className="completion-status">
              Words completed: {currentUserInputs.filter(input => input.trim() !== '').length}/{currentParagraphData.answers.length}
            </div>
            <button className="btn btn-warning" onClick={handleTimeUp}>
              ✅ Finish Early
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState === 'results') {
    const totalCorrect = scores.reduce((sum, score) => sum + score.correct, 0);
    const totalQuestions = scores.reduce((sum, score) => sum + score.total, 0);
    const overallPercentage = Math.round((totalCorrect / totalQuestions) * 100);

    return (
      <div className="exercise-page read-complete-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📊 Exercise Complete!</h1>
          
          <div className="overall-score">
            <div className="score-display">
              <div className="score-number">{totalCorrect}/{totalQuestions}</div>
              <div className="score-percentage">{overallPercentage}%</div>
            </div>
          </div>

          <div className="detailed-results">
            <h3>📋 Paragraph Results:</h3>
            {scores.map((score, index) => (
              <div key={index} className="paragraph-result">
                <div className="paragraph-result-header">
                  <span className="paragraph-title">{EXERCISE_DATA.paragraphs[index].title}</span>
                  <span className="level-badge level-{EXERCISE_DATA.paragraphs[index].level.toLowerCase()}">
                    {EXERCISE_DATA.paragraphs[index].level}
                  </span>
                </div>
                <div className="paragraph-score">
                  {score.correct}/{score.total} ({score.percentage}%)
                </div>
                
                <div className="answer-review">
                  <h4>Your answers:</h4>
                  <div className="answers-grid">
                    {userAnswers[index]?.map((userAnswer, answerIndex) => {
                      const correct = userAnswer.toLowerCase().trim() === EXERCISE_DATA.paragraphs[index].answers[answerIndex].toLowerCase();
                      return (
                        <div key={answerIndex} className={`answer-item ${correct ? 'correct' : 'incorrect'}`}>
                          <span className="answer-number">{answerIndex + 1}.</span>
                          <span className="user-answer">{userAnswer || '(blank)'}</span>
                          {!correct && (
                            <span className="correct-answer">→ {EXERCISE_DATA.paragraphs[index].answers[answerIndex]}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="results-actions">
            <button className="btn btn-primary" onClick={restart}>
              🔄 Try Again
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ReadAndCompleteExercise;
