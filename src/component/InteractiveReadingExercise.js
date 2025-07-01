// src/components/InteractiveReadingExercise.js
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
  const paragraph1 = "Climate change represents one of the most _____ challenges facing humanity today. Scientists have been _____ the effects of rising global temperatures for decades, and their findings consistently show that human activities are the primary _____ of this phenomenon. The burning of fossil fuels _____ massive amounts of carbon dioxide into the atmosphere, creating a greenhouse effect that _____ the planet's natural temperature regulation. As temperatures continue to _____, we observe more frequent extreme weather events, including devastating hurricanes, prolonged droughts, and unprecedented heatwaves. The _____ of climate change extend beyond environmental concerns, affecting global food security, water resources, and economic stability. Immediate action is _____ to mitigate these effects and prevent catastrophic consequences for future generations.";

  const paragraph2 = "The transition to renewable energy sources has become increasingly urgent as governments and organisations worldwide recognise the need for sustainable solutions. Solar and wind power technologies have advanced significantly, making them more cost-effective and efficient than ever before. [MISSING SENTENCE] Electric vehicles are also gaining popularity as consumers become more environmentally conscious and governments implement incentives for clean transportation. The shift towards renewable energy not only helps combat climate change but also creates new job opportunities and reduces dependence on fossil fuel imports. However, this transition requires substantial investment in infrastructure and technology, as well as coordinated efforts between public and private sectors to ensure a smooth and equitable transformation of the global energy system.";

  // Dropdown options for complete the sentences
  const dropdownOptions = [
    { text: 'Select a word', value: '' },
    { text: 'pressing', value: 'pressing' },
    { text: 'studying', value: 'studying' },
    { text: 'cause', value: 'cause' },
    { text: 'releases', value: 'releases' },
    { text: 'disrupts', value: 'disrupts' },
    { text: 'rise', value: 'rise' },
    { text: 'consequences', value: 'consequences' },
    { text: 'essential', value: 'essential' }
  ];

  // Correct answers for complete the sentences
  const correctSentenceAnswers = ['pressing', 'studying', 'cause', 'releases', 'disrupts', 'rise', 'consequences', 'essential'];

  // Dropdown options for complete the passage
  const passageOptions = [
    { text: 'Select the best sentence to fill in the blank', value: '' },
    { text: 'Many countries are investing heavily in smart grid infrastructure to better integrate renewable energy sources into existing power networks.', value: 'smart_grid' },
    { text: 'The development of energy storage solutions, such as advanced battery systems, is crucial for managing the intermittent nature of renewable power generation.', value: 'energy_storage' },
    { text: 'Traditional energy companies are facing significant challenges as they adapt their business models to compete in the renewable energy market.', value: 'traditional_companies' },
    { text: 'Public awareness campaigns about climate change have been successful in changing consumer behaviour towards more sustainable practices.', value: 'public_awareness' }
  ];

  const correctPassageAnswer = 'energy_storage';

  // Highlight questions and correct answers
  const highlightQuestions = [
    {
      question: "What is the primary cause of climate change according to the passage?",
      correctAnswer: "human activities are the primary cause of this phenomenon"
    },
    {
      question: "What effect does burning fossil fuels have on the atmosphere?",
      correctAnswer: "releases massive amounts of carbon dioxide into the atmosphere, creating a greenhouse effect"
    },
    {
      question: "What benefits does the transition to renewable energy provide besides environmental protection?",
      correctAnswer: "creates new job opportunities and reduces dependence on fossil fuel imports"
    }
  ];

  // Identify the idea options
  const ideaOptions = [
    { text: 'Climate change is primarily caused by natural weather patterns and volcanic activity affecting global temperatures.', value: 'natural_causes' },
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
    const words = paragraph1.split(' ');
    let blankIndex = 0;
    
    return (
      <div className="text-sm leading-relaxed">
        {words.map((word, index) => {
          if (word.includes('_____')) {
            const currentBlankIndex = blankIndex;
            blankIndex++;
            return (
              <span key={index} className="mx-1">
                <select
                  value={answers.completeTheSentences[currentBlankIndex]}
                  onChange={(e) => handleSentenceAnswerChange(currentBlankIndex, e.target.value)}
                  className="inline-block border border-gray-300 rounded px-2 py-1 text-sm bg-white min-w-[80px]"
                >
                  {dropdownOptions.map((option, optIndex) => (
                    <option key={optIndex} value={option.value}>{option.text}</option>
                  ))}
                </select>
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
        <div className="my-4 p-4 border-2 border-dashed border-gray-400 bg-gray-50 text-center text-gray-500">
          [Select sentence to complete the passage]
        </div>
        {parts[1]}
      </div>
    );
  };

  const renderFullPassage = () => {
    const fullText = paragraph1.replace(/_____/g, (match, offset) => {
      const blankIndex = (paragraph1.substring(0, offset).match(/_____/g) || []).length;
      return correctSentenceAnswers[blankIndex] || '[blank]';
    }) + ' ' + paragraph2.replace('[MISSING SENTENCE]', 'The development of energy storage solutions, such as advanced battery systems, is crucial for managing the intermittent nature of renewable power generation.');
    
    return (
      <div 
        className="text-sm leading-relaxed select-text cursor-pointer"
        onMouseUp={handleTextSelection}
      >
        {fullText}
      </div>
    );
  };

  if (currentStage === 6) {
    // Results screen
    const totalCorrect = scores.completeTheSentences + 
                        (scores.completeThePassage ? 1 : 0) + 
                        scores.highlightAnswers.filter(Boolean).length + 
                        (scores.identifyTheIdea ? 1 : 0);
    
    return (
      <div className="exercise-page interactive-reading-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h2 className="text-2xl font-bold text-center mb-6">Exercise Results</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded">
              <span>Complete the Sentences</span>
              <span className="font-bold">{scores.completeTheSentences}/8</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded">
              <span>Complete the Passage</span>
              <span className={`font-bold ${scores.completeThePassage ? 'text-green-600' : 'text-red-600'}`}>
                {scores.completeThePassage ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            {scores.highlightAnswers.map((score, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-100 rounded">
                <span>Highlight the Answer {index + 1}</span>
                <span className={`font-bold ${score ? 'text-green-600' : 'text-red-600'}`}>
                  {score ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded">
              <span>Identify the Idea</span>
              <span className={`font-bold ${scores.identifyTheIdea ? 'text-green-600' : 'text-red-600'}`}>
                {scores.identifyTheIdea ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <div className="text-center pt-4 border-t">
              <span className="text-xl font-bold">Total Score: {totalCorrect}/12</span>
            </div>
          </div>
          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              🔄 Try Again
            </button>
            <button
              onClick={onBack}
              className="btn btn-secondary"
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
                  {renderParagraph1WithBlanks()}
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
                        {dropdownOptions.map((option, optIndex) => (
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

            {currentStage >= 2 && currentStage <= 4 && (
              <>
                <h3 className="text-sm font-medium mb-4">Click and drag to highlight the answer to the question below.</h3>
                <div className="highlight-question">
                  <p className="text-sm font-medium">{highlightQuestions[currentStage - 2].question}</p>
                </div>
                {highlightedText && (
                  <div className="highlighted-answer">
                    <p className="text-xs text-gray-600 mb-1">Highlighted text:</p>
                    <p className="text-sm">{highlightedText}</p>
                  </div>
                )}
              </>
            )}

            {currentStage === 5 && (
              <>
                <h3 className="text-sm font-medium mb-4">Select the idea that is expressed in the passage.</h3>
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
