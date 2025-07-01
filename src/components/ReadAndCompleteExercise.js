import { useState, useCallback, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import LetterInput from './LetterInput';
import { getRandomParagraphs } from '../data/readCompleteData';
import '../styles/read-complete-exercise.css';

const TIMER_DURATION = 180;

function ReadAndCompleteExercise({ onBack, onLogoClick }) {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [gameState, setGameState] = useState('instructions');
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [userAnswers, setUserAnswers] = useState({});
  const [scores, setScores] = useState([]);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentUserInputs, setCurrentUserInputs] = useState([]);
  const [exerciseParagraphs, setExerciseParagraphs] = useState([]);
  
  const timerRef = useRef(null);

  useEffect(() => {
    const randomParagraphs = getRandomParagraphs();
    setExerciseParagraphs(randomParagraphs);
    console.log('🎲 Random paragraphs selected:', randomParagraphs.map(p => `${p.title} (${p.id})`));
  }, []);

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
        elements.push({
          type: 'input',
          index: i,
          answer
        });
      }
    }
    return elements;
  }, []);

  const calculateScore = useCallback((userInputs, correctAnswers) => {
    let correct = 0;
    userInputs.forEach((input, index) => {
      const correctAnswer = correctAnswers[index].toLowerCase();
      const userAnswer = input.toLowerCase().trim();
      
      // LetterInput only returns the letters the user typed (after the pre-filled ones)
      // We need to reconstruct the full word to compare
      const getLettersToShow = (word) => {
        const length = word.length;
        if (length <= 3) return 1;
        if (length <= 5) return 2;
        if (length <= 7) return 3;
        if (length <= 9) return 4;
        if (length <= 11) return 5;
        return 6;
      };
      
      const lettersToShow = getLettersToShow(correctAnswer);
      const preFilledPart = correctAnswer.substring(0, lettersToShow);
      const expectedUserPart = correctAnswer.substring(lettersToShow);
      
      // Check if user typed the correct remaining letters
      if (userAnswer === expectedUserPart) {
        correct++;
      }
      
      console.log(`Word ${index + 1}: "${correctAnswer}" - Pre-filled: "${preFilledPart}" - Expected: "${expectedUserPart}" - User typed: "${userAnswer}" - Correct: ${userAnswer === expectedUserPart}`);
    });
    
    return { correct, total: correctAnswers.length, percentage: Math.round((correct / correctAnswers.length) * 100) };
  }, []);

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
  }, [currentParagraph, currentUserInputs, scores, exerciseParagraphs, calculateScore]);

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
  }, [isTimerActive, timeRemaining, handleTimeUp]);

  const startParagraph = useCallback(() => {
    if (exerciseParagraphs.length === 0) return;
    
    const paragraph = exerciseParagraphs[currentParagraph];
    setCurrentUserInputs(new Array(paragraph.answers.length).fill(''));
    setTimeRemaining(TIMER_DURATION);
    setIsTimerActive(true);
    setGameState('playing');
  }, [currentParagraph, exerciseParagraphs]);

  const handleInputChange = useCallback((index, value) => {
    const newInputs = [...currentUserInputs];
    newInputs[index] = value;
    setCurrentUserInputs(newInputs);
  }, [currentUserInputs]);

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

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

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
                  <li>Type letters in the empty boxes</li>
                  <li>Look at the surrounding words for clues</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="paragraph-transition">
              <h3>Well done! 🎉</h3>
              <p>You completed paragraph {currentParagraph} ({levelLabels[currentParagraph - 1]} level)</p>
              {scores.length > 0 && (
                <p>Score: {scores[scores.length - 1]?.correct}/{scores[scores.length - 1]?.total} ({scores[scores.length - 1]?.percentage}%)</p>
              )}
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
                  return <span key={index} className="text-segment">{element.content}</span>;
                } else {
                  return (
                    <span key={index} className="letter-input-wrapper">
                      <LetterInput
                        word={element.answer}
                        value={currentUserInputs[element.index] || ''}
                        onChange={(value) => handleInputChange(element.index, value)}
                        disabled={false}
                        className="read-complete-input"
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

export default ReadAndCompleteExercise;
