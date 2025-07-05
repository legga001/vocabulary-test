// src/components/InteractiveReadingExercise.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import ClickableLogo from './ClickableLogo';

const InteractiveReadingExercise = ({ onBack, onLogoClick }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(420); // 7 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState({
    completeTheSentences: Array(8).fill(''),
    completeThePassage: '',
    highlightAnswers: ['', '', ''],
    identifyTheIdea: ''
  });
  const [scores, setScores] = useState({
    completeTheSentences: 0,
    completeThePassage: false,
    highlightAnswers: [false, false, false],
    identifyTheIdea: false
  });
  const [highlightedText, setHighlightedText] = useState('');
  const [currentHighlightQuestion, setCurrentHighlightQuestion] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
  };

  // Article content
  const paragraph1WithBlanks = "Climate change represents one of the most _____ challenges facing humanity today. Scientists have been _____ the effects of rising global temperatures for decades, and their findings consistently show that human activities are the primary _____ of this phenomenon. The burning of fossil fuels _____ massive amounts of carbon dioxide into the atmosphere, creating a greenhouse effect that _____ the planet's natural temperature regulation. As temperatures continue to _____, we observe more frequent extreme weather events, including devastating hurricanes, prolonged droughts, and unprecedented heatwaves. The _____ of climate change extend beyond environmental concerns, affecting global food security, water resources, and economic stability. Immediate action is _____ to mitigate these effects and prevent catastrophic consequences for future generations.";

  const paragraph1Complete = "Climate change represents one of the most pressing challenges facing humanity today. Scientists have been studying the effects of rising global temperatures for decades, and their findings consistently show that human activities are the primary cause of this phenomenon. The burning of fossil fuels releases massive amounts of carbon dioxide into the atmosphere, creating a greenhouse effect that disrupts the planet's natural temperature regulation. As temperatures continue to rise, we observe more frequent extreme weather events, including devastating hurricanes, prolonged droughts, and unprecedented heatwaves. The consequences of climate change extend beyond environmental concerns, affecting global food security, water resources, and economic stability. Immediate action is essential to mitigate these effects and prevent catastrophic consequences for future generations.";

  const paragraph2 = "The transition to renewable energy sources has become increasingly urgent. Solar and wind power technologies have advanced significantly, making them more cost-effective than ever before. [MISSING SENTENCE] Electric vehicles are also gaining popularity as consumers become more environmentally conscious. However, this transition requires substantial investment in infrastructure and coordinated efforts between public and private sectors.";

  // Answer data
  const correctSentenceAnswers = ['pressing', 'studying', 'cause', 'releases', 'disrupts', 'rise', 'consequences', 'essential'];
  
  const dropdownSets = [
    [
      { text: 'Select...', value: '' },
      { text: 'urgent', value: 'urgent' },
      { text: 'pressing', value: 'pressing' },
      { text: 'simple', value: 'simple' }
    ],
    [
      { text: 'Select...', value: '' },
      { text: 'ignoring', value: 'ignoring' },
      { text: 'studying', value: 'studying' },
      { text: 'avoiding', value: 'avoiding' }
    ],
    [
      { text: 'Select...', value: '' },
      { text: 'solution', value: 'solution' },
      { text: 'benefit', value: 'benefit' },
      { text: 'cause', value: 'cause' }
    ],
    [
      { text: 'Select...', value: '' },
      { text: 'absorbs', value: 'absorbs' },
      { text: 'releases', value: 'releases' },
      { text: 'reduces', value: 'reduces' }
    ],
    [
      { text: 'Select...', value: '' },
      { text: 'improves', value: 'improves' },
      { text: 'disrupts', value: 'disrupts' },
      { text: 'maintains', value: 'maintains' }
    ],
    [
      { text: 'Select...', value: '' },
      { text: 'fall', value: 'fall' },
      { text: 'stabilise', value: 'stabilise' },
      { text: 'rise', value: 'rise' }
    ],
    [
      { text: 'Select...', value: '' },
      { text: 'benefits', value: 'benefits' },
      { text: 'consequences', value: 'consequences' },
      { text: 'advantages', value: 'advantages' }
    ],
    [
      { text: 'Select...', value: '' },
      { text: 'optional', value: 'optional' },
      { text: 'essential', value: 'essential' },
      { text: 'impossible', value: 'impossible' }
    ]
  ];

  const passageOptions = [
    { text: 'Select best sentence...', value: '' },
    { text: 'These technologies require significant government subsidies to remain competitive in the market.', value: 'subsidies' },
    { text: 'The development of energy storage solutions, such as advanced battery systems, is crucial for managing renewable power.', value: 'storage' },
    { text: 'Many consumers remain skeptical about the reliability of renewable energy sources during peak demand periods.', value: 'skeptical' },
    { text: 'Traditional energy companies continue to resist the transition to renewable sources due to profit concerns.', value: 'resistance' }
  ];

  const correctPassageAnswer = 'storage';

  const highlightQuestions = [
    {
      question: "What are two specific types of extreme weather events mentioned in the passage?",
      correctAnswer: "devastating hurricanes, prolonged droughts"
    },
    {
      question: "What three areas beyond environment are affected by climate change according to the text?",
      correctAnswer: "global food security, water resources, and economic stability"
    },
    {
      question: "What two renewable energy technologies are specifically mentioned as having advanced significantly?",
      correctAnswer: "Solar and wind power technologies"
    }
  ];

  const ideaOptions = [
    { text: 'Select the main idea...', value: '' },
    { text: 'Climate change is primarily caused by natural factors and will resolve itself over time without human intervention.', value: 'natural_causes' },
    { text: 'Human activities, particularly fossil fuel consumption, are driving climate change, but renewable energy transitions offer hope for mitigation.', value: 'human_renewable' },
    { text: 'Renewable energy technologies are becoming more popular among consumers who want to reduce their electricity bills.', value: 'cost_savings' },
    { text: 'The economic benefits of renewable energy outweigh environmental concerns when considering long-term investment strategies.', value: 'economic_focus' }
  ];

  const correctIdeaAnswer = 'human_renewable';

  const handleSentenceAnswerChange = (index, value) => {
    startTimer();
    const newAnswers = [...answers.completeTheSentences];
    newAnswers[index] = value;
    setAnswers(prev => ({
      ...prev,
      completeTheSentences: newAnswers
    }));
  };

  const handlePassageAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      completeThePassage: value
    }));
  };

  const handleIdeaAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      identifyTheIdea: value
    }));
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString().trim()) {
      setHighlightedText(selection.toString().trim());
      const newHighlightAnswers = [...answers.highlightAnswers];
      newHighlightAnswers[currentHighlightQuestion] = selection.toString().trim();
      setAnswers(prev => ({
        ...prev,
        highlightAnswers: newHighlightAnswers
      }));
    }
  };

  const calculateSentenceScore = () => {
    let score = 0;
    answers.completeTheSentences.forEach((answer, index) => {
      if (answer === correctSentenceAnswers[index]) {
        score++;
      }
    });
    return score;
  };

  const showFeedbackModal = (stage) => {
    let feedbackText = '';
    let isCorrect = false;
    
    switch(stage) {
      case 0:
        const score = calculateSentenceScore();
        setScores(prev => ({ ...prev, completeTheSentences: score }));
        feedbackText = `Complete the Sentences: ${score}/8 correct`;
        break;
      case 1:
        isCorrect = answers.completeThePassage === correctPassageAnswer;
        setScores(prev => ({ ...prev, completeThePassage: isCorrect }));
        feedbackText = `Complete the Passage: ${isCorrect ? 'Correct' : 'Incorrect'}`;
        break;
      case 2:
      case 3:
      case 4:
        const questionIndex = stage - 2;
        const userAnswer = answers.highlightAnswers[questionIndex].toLowerCase();
        const correctAnswer = highlightQuestions[questionIndex].correctAnswer.toLowerCase();
        isCorrect = userAnswer.includes(correctAnswer.split(' ').slice(0, 3).join(' ')) || 
                   correctAnswer.includes(userAnswer.split(' ').slice(0, 3).join(' '));
        const newHighlightScores = [...scores.highlightAnswers];
        newHighlightScores[questionIndex] = isCorrect;
        setScores(prev => ({ ...prev, highlightAnswers: newHighlightScores }));
        feedbackText = `Highlight the Answer ${questionIndex + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}`;
        break;
      case 5:
        isCorrect = answers.identifyTheIdea === correctIdeaAnswer;
        setScores(prev => ({ ...prev, identifyTheIdea: isCorrect }));
        feedbackText = `Identify the Idea: ${isCorrect ? 'Correct' : 'Incorrect'}`;
        break;
      default:
        break;
    }
    
    setShowFeedback({ show: true, text: feedbackText });
  };

  const handleNext = () => {
    if (currentStage < 5) {
      showFeedbackModal(currentStage);
    } else {
      // Final results
      setCurrentStage(6);
      setIsTimerRunning(false);
    }
  };

  const closeFeedback = () => {
    setShowFeedback(false);
    if (currentStage >= 2 && currentStage <= 4) {
      setCurrentHighlightQuestion(currentStage - 1);
    }
    setCurrentStage(prev => prev + 1);
    setHighlightedText('');
  };

  const canProceed = () => {
    switch(currentStage) {
      case 0:
        return answers.completeTheSentences.every(answer => answer !== '');
      case 1:
        return answers.completeThePassage !== '';
      case 2:
      case 3:
      case 4:
        return answers.highlightAnswers[currentStage - 2] !== '';
      case 5:
        return answers.identifyTheIdea !== '';
      default:
        return false;
    }
  };

  const renderParagraph1WithBlanks = () => {
    const words = paragraph1WithBlanks.split(' ');
    let blankIndex = 0;
    
    return (
      <div className="text-sm leading-relaxed">
        {words.map((word, index) => {
          if (word.includes('_____')) {
            const currentBlankIndex = blankIndex;
            const selectedWord = answers.completeTheSentences[currentBlankIndex];
            blankIndex++;
            return (
              <span key={index} className="mx-1">
                <span className="word-blank-box">
                  {selectedWord || ''}
                </span>
              </span>
            );
          }
          return <span key={index}>{word} </span>;
        })}
      </div>
    );
  };

  const renderParagraph2WithBlank = () => {
    const parts = paragraph2.split('[MISSING SENTENCE]');
    return (
      <div className="text-sm leading-relaxed">
        {parts[0]}
        <div className="sentence-blank-box"></div>
        {parts[1]}
      </div>
    );
  };

  const renderFullPassage = () => {
    const fullText = paragraph1Complete + ' ' + paragraph2.replace('[MISSING SENTENCE]', 'The development of energy storage solutions, such as advanced battery systems, is crucial for managing renewable power. The shift towards renewable energy not only helps combat climate change but also creates new job opportunities and reduces dependence on fossil fuel imports.');
    
    return (
      <div 
        className="text-sm leading-relaxed select-text cursor-pointer"
        onMouseUp={handleTextSelection}
      >
        {fullText}
      </div>
    );
  };

  // Results screen
  if (currentStage === 6) {
    const totalCorrect = scores.completeTheSentences + 
                        (scores.completeThePassage ? 1 : 0) + 
                        scores.highlightAnswers.filter(Boolean).length + 
                        (scores.identifyTheIdea ? 1 : 0);
    
    const percentage = Math.round((totalCorrect / 12) * 100);
    
    return (
      <div className="exercise-page interactive-reading-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container results-container">
          <div className="results-header">
            <div className="results-icon">📚</div>
            <h1 className="results-title">Reading Exercise Complete!</h1>
            <div className="overall-score-circle">
              <div className="score-number">{percentage}%</div>
              <div className="score-label">Overall Score</div>
            </div>
          </div>

          <div className="results-breakdown">
            <div className="result-item">
              <div className="result-icon">📝</div>
              <div className="result-content">
                <div className="result-title">Complete the Sentences</div>
                <div className="result-score">{scores.completeTheSentences}/8</div>
                {scores.completeTheSentences < 8 && (
                  <div className="incorrect-answers">
                    {answers.completeTheSentences.map((answer, index) => {
                      if (answer !== correctSentenceAnswers[index]) {
                        return (
                          <div key={index} className="wrong-answer-detail">
                            <span className="question-num">#{index + 1}:</span>
                            <span className="user-answer">Your answer: "{answer || 'No answer'}"</span>
                            <span className="correct-answer">Correct: "{correctSentenceAnswers[index]}"</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
              <div className={`result-status ${scores.completeTheSentences >= 6 ? 'excellent' : scores.completeTheSentences >= 4 ? 'good' : 'needs-work'}`}>
                {scores.completeTheSentences >= 6 ? '🌟 Excellent' : scores.completeTheSentences >= 4 ? '👍 Good' : '📚 Keep practising'}
              </div>
            </div>

            <div className="result-item">
              <div className="result-icon">📖</div>
              <div className="result-content">
                <div className="result-title">Complete the Passage</div>
                <div className="result-score">{scores.completeThePassage ? 'Correct' : 'Incorrect'}</div>
                {!scores.completeThePassage && (
                  <div className="incorrect-answers">
                    <div className="wrong-answer-detail">
                      <span className="user-answer">Your choice: {passageOptions.find(opt => opt.value === answers.completeThePassage)?.text.substring(0, 50) || 'No answer'}...</span>
                      <span className="correct-answer">Correct: "{passageOptions.find(opt => opt.value === correctPassageAnswer)?.text}"</span>
                    </div>
                  </div>
                )}
              </div>
              <div className={`result-status ${scores.completeThePassage ? 'excellent' : 'needs-work'}`}>
                {scores.completeThePassage ? '✅ Perfect' : '❌ Try again'}
              </div>
            </div>

            {scores.highlightAnswers.map((score, index) => (
              <div key={index} className="result-item">
                <div className="result-icon">🔍</div>
                <div className="result-content">
                  <div className="result-title">Highlight Answer {index + 1}</div>
                  <div className="result-score">{score ? 'Correct' : 'Incorrect'}</div>
                  {!score && (
                    <div className="incorrect-answers">
                      <div className="wrong-answer-detail">
                        <span className="question-text">Question: "{highlightQuestions[index].question}"</span>
                        <span className="user-answer">Your highlight: "{answers.highlightAnswers[index] || 'No text selected'}"</span>
                        <span className="correct-answer">Correct answer: "{highlightQuestions[index].correctAnswer}"</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`result-status ${score ? 'excellent' : 'needs-work'}`}>
                  {score ? '✅ Perfect' : '❌ Try again'}
                </div>
              </div>
            ))}

            <div className="result-item">
              <div className="result-icon">💡</div>
              <div className="result-content">
                <div className="result-title">Identify the Idea</div>
                <div className="result-score">{scores.identifyTheIdea ? 'Correct' : 'Incorrect'}</div>
                {!scores.identifyTheIdea && (
                  <div className="incorrect-answers">
                    <div className="wrong-answer-detail">
                      <span className="user-answer">Your choice: "{ideaOptions.find(opt => opt.value === answers.identifyTheIdea)?.text.substring(0, 50) || 'No answer'}..."</span>
                      <span className="correct-answer">Correct: "{ideaOptions.find(opt => opt.value === correctIdeaAnswer)?.text}"</span>
                    </div>
                  </div>
                )}
              </div>
              <div className={`result-status ${scores.identifyTheIdea ? 'excellent' : 'needs-work'}`}>
                {scores.identifyTheIdea ? '✅ Perfect' : '❌ Try again'}
              </div>
            </div>
          </div>

          <div className="performance-feedback">
            <h3>📊 Performance Summary</h3>
            <div className="feedback-text">
              {percentage >= 85 && <p>🌟 Outstanding performance! You have excellent reading comprehension skills.</p>}
              {percentage >= 70 && percentage < 85 && <p>👍 Good work! You have strong reading comprehension with room for improvement.</p>}
              {percentage >= 50 && percentage < 70 && <p>📚 Fair performance. Focus on vocabulary and context clues to improve.</p>}
              {percentage < 50 && <p>💪 Keep practising! Regular reading will help improve your comprehension skills.</p>}
            </div>
          </div>

          <div className="results-actions">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary results-btn"
            >
              🔄 Try Again
            </button>
            <button
              onClick={onBack}
              className="btn btn-secondary results-btn"
            >
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-page interactive-reading-exercise">
      <ClickableLogo onLogoClick={onLogoClick} />
      
      {/* Header with timer */}
      <div className="quiz-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">📖 Interactive Reading Exercise</h1>
          {isTimerRunning && (
            <div className="flex items-center gap-2 text-orange-500 font-bold">
              <span className="timer-icon">⏱️</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <div className="reading-exercise-layout">
          {/* Left side - Passage */}
          <div className="passage-container">
            <h3 className="text-sm font-medium text-gray-600 mb-4">PASSAGE</h3>
            <div className="passage-content">
              {currentStage === 0 && renderParagraph1WithBlanks()}
              {currentStage === 1 && (
                <div className="space-y-4">
                  <div className="text-sm leading-relaxed">{paragraph1Complete}</div>
                  {renderParagraph2WithBlank()}
                </div>
              )}
              {currentStage >= 2 && renderFullPassage()}
            </div>
          </div>

          {/* Right side - Questions */}
          <div className="questions-container">
            {currentStage === 0 && (
              <>
                <h3 className="text-sm font-medium mb-4">Select the best option for each missing word.</h3>
                <div className="space-y-3">
                  {Array.from({length: 8}, (_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="question-number">
                        {i + 1}
                      </span>
                      <select
                        value={answers.completeTheSentences[i]}
                        onChange={(e) => handleSentenceAnswerChange(i, e.target.value)}
                        className="dropdown-select"
                      >
                        {dropdownSets[i].map((option, optIndex) => (
                          <option key={optIndex} value={option.value}>{option.text}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </>
            )}

            {currentStage === 1 && (
              <>
                <h3 className="text-sm font-medium mb-4">Select the best sentence to fill in the blank in the passage.</h3>
                <div className="space-y-3">
                  {passageOptions.map((option, index) => (
                    <label key={index} className="option-label">
                      <input
                        type="radio"
                        name="passage"
                        value={option.value}
                        checked={answers.completeThePassage === option.value}
                        onChange={(e) => handlePassageAnswerChange(e.target.value)}
                        className="option-radio"
                      />
                      <span className="option-text">{option.text}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {(currentStage >= 2 && currentStage <= 4) && (
              <>
                <h3 className="text-sm font-medium mb-4">
                  {highlightQuestions[currentStage - 2].question}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Click and drag to highlight text in the passage that answers this question.
                </p>
                {answers.highlightAnswers[currentStage - 2] && (
                  <div className="selected-text-preview">
                    <strong>Selected:</strong> "{answers.highlightAnswers[currentStage - 2]}"
                  </div>
                )}
              </>
            )}

            {currentStage === 5 && (
              <>
                <h3 className="text-sm font-medium mb-4">What is the main idea of the passage?</h3>
                <div className="space-y-3">
                  {ideaOptions.map((option, index) => (
                    <label key={index} className="option-label">
                      <input
                        type="radio"
                        name="idea"
                        value={option.value}
                        checked={answers.identifyTheIdea === option.value}
                        onChange={(e) => handleIdeaAnswerChange(e.target.value)}
                        className="option-radio"
                      />
                      <span className="option-text">{option.text}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            <div className="next-button-container">
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn btn-primary"
              >
                NEXT
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedback.show && (
          <div className="feedback-modal-overlay">
            <div className="feedback-modal">
              <h3 className="text-lg font-bold mb-4">Feedback</h3>
              <p className="text-gray-700 mb-6">{showFeedback.text}</p>
              <button
                onClick={closeFeedback}
                className="btn btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveReadingExercise;
