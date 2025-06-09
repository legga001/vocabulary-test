// src/components/RealFakeWordsExercise.js - Updated with ClickableLogo
import React, { useState, useEffect, useCallback } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';

// Word bank with 300 words (150 real, 150 fake)
const WORD_BANK = {
  real: [
    // B1 Level real words
    'achieve', 'adventure', 'ancient', 'beneath', 'brilliant', 'capture', 'courage', 'declare',
    'educate', 'fantastic', 'genuine', 'humble', 'imagine', 'journey', 'kindness', 'luxury',
    'monster', 'natural', 'obvious', 'perfect', 'quality', 'respect', 'serious', 'trouble',
    'unique', 'victory', 'wonder', 'examine', 'picture', 'medicine', 'science', 'history',
    'culture', 'society', 'freedom', 'justice', 'beauty', 'wisdom', 'knowledge', 'success',
    'character', 'decision', 'environment', 'generation', 'information', 'opportunity', 'research',
    'strength', 'temperature', 'mountain', 'ocean', 'forest', 'desert', 'island', 'valley',
    'modern', 'popular', 'special', 'private', 'public', 'simple', 'complex', 'similar',
    'financial', 'political', 'physical', 'mental', 'social', 'personal', 'professional', 'international',
    
    // B2 Level real words  
    'accomplish', 'appreciate', 'certificate', 'circumstances', 'colleague', 'concentrate', 'consequence',
    'definitely', 'eliminate', 'environment', 'equipment', 'essential', 'experience', 'familiar',
    'government', 'identity', 'immediately', 'independence', 'influence', 'intelligence', 'management',
    'necessary', 'opportunity', 'particular', 'personality', 'possibility', 'preparation', 'professional',
    'relationship', 'responsibility', 'situation', 'technology', 'temperature', 'tradition', 'university',
    'appearance', 'arrangement', 'atmosphere', 'authority', 'beginning', 'celebration', 'comfortable',
    'competition', 'condition', 'connection', 'consideration', 'construction', 'development', 'difficulty',
    'discussion', 'economic', 'education', 'emergency', 'entertainment', 'establishment', 'examination',
    
    // C1 Level real words
    'abundance', 'bureaucracy', 'catastrophe', 'diminish', 'elaborate', 'facilitate', 'gregarious',
    'hypothesis', 'inevitable', 'juxtapose', 'labyrinth', 'magnificent', 'notorious', 'obsolete',
    'phenomenal', 'quintessential', 'renaissance', 'sophisticated', 'tremendous', 'ubiquitous',
    'vicarious', 'whimsical', 'xenophobia', 'zealous', 'ambiguous', 'benevolent', 'conscientious',
    'diligent', 'eloquent', 'fastidious', 'grandiose', 'haphazard', 'immaculate', 'judicious',
    'meticulous', 'nonchalant', 'ostentatious', 'pragmatic', 'resilient', 'serendipity',
    'accomplish', 'anonymous', 'articulate', 'comprehensive', 'contemporary', 'demonstrate', 'distinguish',
    'entrepreneur', 'fundamental', 'influential', 'prestigious', 'spontaneous', 'substantial', 'versatile'
  ],
  
  fake: [
    // B1 Level fake words (varied phonetic patterns, completely original)
    'blaxter', 'quildon', 'fremic', 'joscal', 'vipthen', 'norgal', 'spendel', 'klytic',
    'wemble', 'throque', 'plidge', 'zogent', 'frimble', 'quelph', 'blantic', 'crivel',
    'dompish', 'flexton', 'gorply', 'hingle', 'jextic', 'krembl', 'lompsy', 'mogrel',
    'plogic', 'queltic', 'rimpel', 'splogm', 'twindle', 'vogric', 'wimble', 'yextic',
    'zogrel', 'bliffin', 'cromble', 'driptic', 'flemble', 'glimp', 'hoctic', 'jemble',
    'klimpsy', 'lomeric', 'moptic', 'neldric', 'pligon', 'quemble', 'rimble', 'slemic',
    'trembl', 'voptic', 'wemble', 'yoptic', 'zemble', 'blurgic', 'cromble', 'dimptic',
    'flemjor', 'gomptic', 'hemble', 'jimptic', 'kremble', 'lomptic', 'nimptic', 'pemble',
    
    // B2 Level fake words (sophisticated but varied patterns)
    'voxicate', 'plethoric', 'quimbular', 'flaxitude', 'nembletic', 'dralphic', 'spendular',
    'blorganic', 'frimtitude', 'quelmatic', 'voplexity', 'kremtonic', 'plangible', 'drofulent',
    'splinquet', 'blomerate', 'quilmatic', 'frambolic', 'nempathy', 'groltude', 'plemtitude',
    'vronique', 'klematic', 'froplent', 'quelitude', 'blomphic', 'sprantec', 'drimitude',
    'flonquer', 'gremtude', 'plinquet', 'voquetic', 'kremtude', 'fleptide', 'quomeric',
    'blomtude', 'splingue', 'fremtude', 'quelphic', 'vromtude', 'kleptude', 'flomeric',
    'grenture', 'plomtude', 'voqueric', 'kremolic', 'fleptude', 'quomtude', 'blomeric',
    'spronque', 'fremolic', 'queltura', 'vromeric', 'klemtude', 'floquent', 'quepture',
    
    // C1 Level fake words (academic-sounding with completely invented roots)
    'voxendral', 'nepholithic', 'axiotropic', 'morphendal', 'cryptalic', 'stelloptic',
    'photendric', 'neurolithic', 'chromatropic', 'helioptric', 'thermendal', 'crystallopic',
    'magnetropic', 'photoendal', 'neuromatic', 'crystallendal', 'thermoendric', 'photolithic',
    'neuroptric', 'crystalloptric', 'magnetendal', 'photomatic', 'neuroendal', 'crystallendric',
    'magnetolithic', 'photomatic', 'neuroptric', 'crystallendal', 'magnetropic', 'photoendric',
    'neuroendic', 'crystallotropic', 'magnetendric', 'photolithc', 'neuromatic', 'crystallendic',
    'magnetropic', 'photoendal', 'neurolithc', 'crystalloptric', 'magnetendric', 'photomatic',
    'neuroendal', 'crystallendic', 'magnetolithic', 'photoendric', 'neuroptric', 'crystalloptric',
    'voxendric', 'blaphetic', 'quornalistic', 'flemtropism', 'grondology', 'spendalism',
    'kromantic', 'fleptology', 'voxendism', 'quormalism', 'bleptitude', 'flemtology'
  ]
};

const TIMER_DURATION = 5; // 5 seconds

function RealFakeWordsExercise({ onBack, onLogoClick }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [words, setWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [exampleAnswered, setExampleAnswered] = useState(false);
  const [exampleFeedback, setExampleFeedback] = useState(null);

  // Example word (always the same)
  const exampleWord = {
    word: 'fantastic',
    isReal: true
  };

  // Generate random test words
  const generateTestWords = useCallback(() => {
    const realWords = [...WORD_BANK.real].sort(() => Math.random() - 0.5).slice(0, 10);
    const fakeWords = [...WORD_BANK.fake].sort(() => Math.random() - 0.5).slice(0, 10);
    
    const testWords = [...realWords, ...fakeWords]
      .map(word => ({
        word,
        isReal: WORD_BANK.real.includes(word),
        answered: false,
        correct: false
      }))
      .sort(() => Math.random() - 0.5);
    
    setWords(testWords);
  }, []);

  // Initialize test only when instructions are complete
  useEffect(() => {
    if (!showInstructions) {
      generateTestWords();
    }
  }, [generateTestWords, showInstructions]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0 && !showFeedback) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showFeedback) {
      // Time's up - mark as incorrect
      handleAnswer(null, true);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, showFeedback]);

  // Start timer only when test has actually started (not during instructions)
  useEffect(() => {
    if (!showInstructions && words.length > 0 && currentQuestion < words.length && !testCompleted) {
      setTimeLeft(TIMER_DURATION);
      setIsActive(true);
      setShowFeedback(false);
    }
  }, [currentQuestion, words, testCompleted, showInstructions]);

  const handleAnswer = (userAnswer, isTimeout = false) => {
    if (showFeedback || testCompleted) return;

    setIsActive(false);
    setShowFeedback(true);

    const currentWord = words[currentQuestion];
    const correct = !isTimeout && userAnswer === currentWord.isReal;
    
    if (correct) {
      setScore(prev => prev + 1);
    }

    const answerData = {
      word: currentWord.word,
      isReal: currentWord.isReal,
      userAnswer: isTimeout ? 'timeout' : userAnswer,
      correct: correct,
      timeUsed: TIMER_DURATION - timeLeft
    };

    setUserAnswers(prev => [...prev, answerData]);
    setLastAnswer(answerData);

    // Auto-proceed to next question after showing feedback
    setTimeout(() => {
      if (currentQuestion + 1 >= words.length) {
        // Test completed
        setTestCompleted(true);
        recordTestResult({
          quizType: 'realFakeWords',
          score: score + (correct ? 1 : 0),
          totalQuestions: 20,
          completedAt: new Date(),
          userAnswers: [...userAnswers, answerData]
        });
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 2000);
  };

  const startTest = () => {
    setShowInstructions(false);
    // Reset everything when starting the actual test
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswers([]);
    setTestCompleted(false);
    setShowFeedback(false);
    setLastAnswer(null);
    setTimeLeft(TIMER_DURATION);
    setIsActive(false); // Will be set to true by useEffect
    generateTestWords();
  };

  const handleExampleAnswer = (userAnswer) => {
    if (exampleAnswered) return;
    
    setExampleAnswered(true);
    const correct = userAnswer === exampleWord.isReal;
    
    setExampleFeedback({
      correct: correct,
      userAnswer: userAnswer,
      correctAnswer: exampleWord.isReal,
      explanation: correct 
        ? "Correct! 'Fantastic' is indeed a real English word meaning 'extremely good' or 'excellent'."
        : `Not quite! 'Fantastic' is actually a real English word meaning 'extremely good' or 'excellent'. You selected ${userAnswer ? 'Real' : 'Fake'}.`
    });
  };

  const resetExample = () => {
    setExampleAnswered(false);
    setExampleFeedback(null);
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswers([]);
    setTestCompleted(false);
    setShowFeedback(false);
    setLastAnswer(null);
    setShowInstructions(true);
    setExampleAnswered(false);
    setExampleFeedback(null);
  };

  const formatTime = (seconds) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 1) return '#e53e3e';
    if (timeLeft <= 2) return '#dd6b20';
    return '#4c51bf';
  };

  // Instructions screen
  if (showInstructions) {
    return (
      <div className="exercise-page real-fake-words">
        <ClickableLogo onLogoClick={onLogoClick} />

        {/* INSTRUCTIONS CONTAINER - RESPONSIVE GREY BOX */}
        <div className="quiz-container">
          <h1>🎯 Real or Fake Words</h1>
          
          <div className="instructions-container">
            <div className="instructions-header">
              <h2>📖 How to Play</h2>
            </div>

            <div className="instructions-content">
              <div className="instruction-item">
                <div className="instruction-icon">👀</div>
                <div className="instruction-text">
                  <strong>Look at the word</strong> displayed on screen
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-icon">⚡</div>
                <div className="instruction-text">
                  <strong>Decide quickly</strong> - you only have <span className="highlight">5 seconds</span> per word!
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-icon">✅</div>
                <div className="instruction-text">
                  <strong>Click "Yes"</strong> if it's a real English word
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-icon">❌</div>
                <div className="instruction-text">
                  <strong>Click "No"</strong> if it's a fake/made-up word
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-icon">🏆</div>
                <div className="instruction-text">
                  <strong>Test yourself</strong> with 20 words of varying difficulty
                </div>
              </div>
            </div>

                          <div className="example-section">
              <h3>🎯 Try This Practice Example</h3>
              <p className="example-description">
                This example is <strong>untimed</strong> so you can get familiar with the interface. 
                Remember: in the real test, you'll only have 5 seconds!
              </p>

              <div className="example-word-container">
                <div className="word-question-title">Is this a real English word?</div>
                
                <div className="word-display example-word">
                  {exampleWord.word}
                </div>

                {!exampleAnswered && (
                  <div className="word-answer-buttons">
                    <button 
                      className="word-answer-btn yes-btn"
                      onClick={() => handleExampleAnswer(true)}
                    >
                      <div className="btn-icon">✓</div>
                      <div className="btn-text">Yes</div>
                    </button>
                    
                    <button 
                      className="word-answer-btn no-btn"
                      onClick={() => handleExampleAnswer(false)}
                    >
                      <div className="btn-icon">✗</div>
                      <div className="btn-text">No</div>
                    </button>
                  </div>
                )}

                {exampleFeedback && (
                  <div className={`example-feedback ${exampleFeedback.correct ? 'correct' : 'incorrect'}`}>
                    <div className="feedback-icon">
                      {exampleFeedback.correct ? '🎉' : '💡'}
                    </div>
                    <div className="feedback-content">
                      <div className="feedback-title">
                        {exampleFeedback.correct ? 'Well Done!' : 'Learning Moment!'}
                      </div>
                      <div className="feedback-explanation">
                        {exampleFeedback.explanation}
                      </div>
                      <button className="btn btn-small" onClick={resetExample}>
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="instructions-footer">
              <div className="ready-section">
                <h3>🚀 Ready to Start?</h3>
                <p>Remember: Be quick! You'll have just <strong>5 seconds</strong> per word in the actual test.</p>
                
                <div className="start-buttons">
                  <button className="btn btn-primary btn-large" onClick={startTest}>
                    🎯 Start Real Test
                  </button>
                  <button className="btn btn-secondary" onClick={onBack}>
                    ← Back to Reading Exercises
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END INSTRUCTIONS CONTAINER */}
      </div>
    );
  }

  if (words.length === 0) {
    return <div className="loading">Loading words...</div>;
  }

  if (testCompleted) {
    const percentage = Math.round((score / 20) * 100);
    
    return (
      <div className="exercise-page scrollable-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        
        {/* RESULTS CONTAINER - RESPONSIVE GREY BOX */}
        <div className="quiz-container">
          <h1>🎯 Real or Fake Words Results</h1>
          
          <div className="results">
            <h2>🎉 Test Complete!</h2>
            <div className="score-display">{score}/20</div>
            <div className="score-percentage">({percentage}%)</div>
            
            <div className="level-estimate">
              <h3>Word Recognition Challenge</h3>
              <p>
                {percentage >= 90 ? "Outstanding! You have excellent word recognition skills!" :
                 percentage >= 75 ? "Great work! You can spot most real and fake words accurately." :
                 percentage >= 60 ? "Good effort! Keep practising to improve your word recognition." :
                 "Keep practising! Word recognition improves with exposure to more vocabulary."}
              </p>
            </div>

            <div className="answer-review">
              <h3>📝 Your Answers:</h3>
              <div className="word-results-grid">
                {userAnswers.map((answer, index) => (
                  <div key={index} className={`word-result-item ${answer.correct ? 'correct' : 'incorrect'}`}>
                    <div className="word-result-header">
                      <span className="word-text">{answer.word}</span>
                      <span className="result-emoji">{answer.correct ? '✅' : '❌'}</span>
                    </div>
                    <div className="word-result-details">
                      <span className="correct-answer">
                        Actually: {answer.isReal ? 'Real' : 'Fake'}
                      </span>
                      {!answer.correct && answer.userAnswer !== 'timeout' && (
                        <span className="user-answer">
                          You said: {answer.userAnswer ? 'Real' : 'Fake'}
                        </span>
                      )}
                      {answer.userAnswer === 'timeout' && (
                        <span className="timeout-indicator">⏰ Time ran out</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
              <button className="btn btn-primary" onClick={restartTest}>
                🔄 Try Again
              </button>
              <button className="btn btn-secondary" onClick={onBack}>
                ← Back to Exercises
              </button>
            </div>
          </div>
        </div>
        {/* END RESULTS CONTAINER */}
      </div>
    );
  }

  const currentWord = words[currentQuestion];
  const progress = ((currentQuestion + 1) / 20) * 100;

  return (
    <div className="exercise-page real-fake-words">
      <ClickableLogo onLogoClick={onLogoClick} />

      {/* QUIZ CONTAINER - RESPONSIVE GREY BOX WRAPS EVERYTHING */}
      <div className="quiz-container">
        {/* Timer at the top */}
        <div className="timer-display" style={{ color: getTimerColor() }}>
          ⏱️ {formatTime(timeLeft)} for this question
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${progress}%`}}></div>
          </div>
          <div className="progress-text">Question {currentQuestion + 1} of 20</div>
        </div>

        {/* Question */}
        <div className="word-question-container">
          <h2 className="word-question-title">Is this a real English word?</h2>
          
          <div className="word-display">
            {currentWord.word}
          </div>

          {/* Answer buttons */}
          {!showFeedback && (
            <div className="word-answer-buttons">
              <button 
                className="word-answer-btn yes-btn"
                onClick={() => handleAnswer(true)}
                disabled={showFeedback}
              >
                <div className="btn-icon">✓</div>
                <div className="btn-text">Yes</div>
              </button>
              
              <button 
                className="word-answer-btn no-btn"
                onClick={() => handleAnswer(false)}
                disabled={showFeedback}
              >
                <div className="btn-icon">✗</div>
                <div className="btn-text">No</div>
              </button>
            </div>
          )}
        </div>

        {/* Feedback card */}
        {showFeedback && lastAnswer && (
          <div className={`feedback-card ${lastAnswer.correct ? 'correct' : 'incorrect'}`}>
            <div className="feedback-icon">
              {lastAnswer.correct ? '🎉' : '❌'}
            </div>
            <div className="feedback-content">
              <div className="feedback-title">
                {lastAnswer.correct ? 'Correct!' : 'Incorrect'}
              </div>
              <div className="feedback-details">
                {lastAnswer.userAnswer === 'timeout' ? (
                  <>
                    <div>⏰ Time ran out!</div>
                    <div>The word "{lastAnswer.word}" is {lastAnswer.isReal ? 'real' : 'fake'}</div>
                  </>
                ) : (
                  <div>
                    The word "{lastAnswer.word}" is {lastAnswer.isReal ? 'real' : 'fake'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Score display */}
        <div className="current-score">
          Score: {score}/{currentQuestion + (showFeedback ? 1 : 0)}
        </div>

        {/* Back button */}
        <div className="exercise-footer">
          <button className="btn btn-secondary btn-small" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
      {/* END QUIZ CONTAINER */}
    </div>
  );
}

export default RealFakeWordsExercise;
