import React, { useState, useEffect, useRef } from 'react';

// Complete sentence pools for each level
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
      correctText: "The company is committed to reducing its environmental impact",
      difficulty: "B2 - Business vocabulary with passive structures"
    },
    {
      correctText: "Not only did she finish the project early but she also exceeded expectations",
      difficulty: "B2 - Inverted structures with 'not only'"
    },
    {
      correctText: "The phenomenon has been observed in various scientific studies",
      difficulty: "B2 - Academic vocabulary with present perfect passive"
    },
    {
      correctText: "Scarcely had we entered the building when the alarm went off",
      difficulty: "B2 - Inverted structures with 'scarcely'"
    },
    {
      correctText: "The proposal was rejected on the grounds that it lacked sufficient detail",
      difficulty: "B2 - Formal language with reason clauses"
    },
    {
      correctText: "Were it not for the support of volunteers the charity couldn't function",
      difficulty: "B2 - Hypothetical conditionals with inversion"
    }
  ],
  
  C1: [
    {
      correctText: "The government's reluctance to implement comprehensive reforms has been criticised extensively",
      difficulty: "C1 - Complex academic vocabulary with passive voice"
    },
    {
      correctText: "Notwithstanding the committee's recommendations the proposal was unanimously rejected",
      difficulty: "C1 - Formal language with complex conjunctions"
    },
    {
      correctText: "The phenomenon manifests itself in a variety of seemingly unrelated contexts",
      difficulty: "C1 - Advanced academic vocabulary with reflexive pronouns"
    },
    {
      correctText: "Such was the magnitude of the disaster that international aid was immediately mobilised",
      difficulty: "C1 - Inverted structures with formal vocabulary"
    },
    {
      correctText: "The implications of these findings extend far beyond the scope of this particular study",
      difficulty: "C1 - Academic discourse with complex sentence structures"
    },
    {
      correctText: "Paradoxically the most successful entrepreneurs often embrace failure as a prerequisite for innovation",
      difficulty: "C1 - Advanced linking words with business terminology"
    },
    {
      correctText: "The proliferation of digital technologies has fundamentally transformed how we conceptualise communication",
      difficulty: "C1 - Academic vocabulary with complex verb structures"
    },
    {
      correctText: "Albeit controversial the methodology employed in the research yielded unprecedented insights",
      difficulty: "C1 - Formal conjunctions with academic vocabulary"
    },
    {
      correctText: "The ramifications of climate change permeate virtually every aspect of contemporary society",
      difficulty: "C1 - Advanced vocabulary with complex sentence structure"
    },
    {
      correctText: "Irrespective of one's political affiliations the evidence presented is incontrovertible",
      difficulty: "C1 - Formal language with complex noun phrases"
    }
  ]
};

// Test structure: 2 A2, 3 B1, 3 B2, 2 C1
const TEST_STRUCTURE = [
  { level: 'A2', count: 2 },
  { level: 'B1', count: 3 },
  { level: 'B2', count: 3 },
  { level: 'C1', count: 2 }
];

// Function to generate random test sentences
const generateTestSentences = () => {
  const testSentences = [];
  let audioFileCounter = 1;

  TEST_STRUCTURE.forEach(({ level, count }) => {
    const availableSentences = [...SENTENCE_POOLS[level]];
    
    for (let i = 0; i < count; i++) {
      if (availableSentences.length === 0) {
        console.warn(`Not enough ${level} sentences available`);
        break;
      }
      
      // Select random sentence from available pool
      const randomIndex = Math.floor(Math.random() * availableSentences.length);
      const selectedSentence = availableSentences.splice(randomIndex, 1)[0];
      
      testSentences.push({
        id: audioFileCounter,
        level: level,
        audioFile: `LandT${audioFileCounter}.mp3`,
        correctText: selectedSentence.correctText,
        difficulty: selectedSentence.difficulty
      });
      
      audioFileCounter++;
    }
  });

  return testSentences;
};

function ListenAndTypeExercise({ onBack }) {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute per sentence
  const [playCount, setPlayCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // Generate test sentences when component mounts
  useEffect(() => {
    const sentences = generateTestSentences();
    setTestSentences(sentences);
    console.log('Generated test sentences:', sentences.map(s => ({ level: s.level, text: s.correctText })));
  }, []);

  const currentData = testSentences[currentSentence];

  // Timer effect
  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasStarted) {
      handleNext();
    }
  }, [timeLeft, hasStarted, showResults]);

  // Audio setup
  useEffect(() => {
    if (audioRef.current && currentData) {
      const audio = audioRef.current;
      
      const handleLoadError = () => {
        setAudioError(true);
        console.warn(`Audio file ${currentData.audioFile} not found. Please ensure it exists in the public folder.`);
      };

      const handleCanPlay = () => {
        setAudioError(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('error', handleLoadError);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('error', handleLoadError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentData]);

  // Focus input when starting or moving to next sentence
  useEffect(() => {
    if (hasStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasStarted, currentSentence]);

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const normaliseText = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,!?;:]/g, '') // Remove punctuation except apostrophes
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const playAudio = () => {
    if (playCount >= 3) return;
    
    if (audioRef.current && !audioError) {
      setIsPlaying(true);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('Audio play error:', error);
        setAudioError(true);
        setIsPlaying(false);
      });
      setPlayCount(playCount + 1);
    }
  };

  const startExercise = () => {
    setHasStarted(true);
    setTimeLeft(60);
    playAudio(); // Auto-play first time
  };

  const handleNext = () => {
    // Save current answer
    const isCorrect = normaliseText(userInput) === normaliseText(currentData.correctText);
    setAnswers(prev => [...prev, {
      sentence: currentData,
      userInput: userInput.trim(),
      correct: isCorrect,
      timeTaken: 60 - timeLeft
    }]);

    // Move to next or finish
    if (currentSentence + 1 < testSentences.length) {
      setCurrentSentence(currentSentence + 1);
      setUserInput('');
      setTimeLeft(60);
      setPlayCount(0);
      setIsPlaying(false);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    const correct = answers.filter(answer => answer.correct).length;
    const total = answers.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  if (showResults) {
    const score = calculateScore();

    return (
      <div className="exercise-page">
        <div className="logo-container">
          <img 
            src="/purple_fox_transparent.png" 
            alt="Mr. Fox English" 
            className="app-logo"
          />
        </div>
        
        <h1>🎧 Listen and Type Results</h1>
        
        <div className="results">
          <h2>🎉 Test Complete!</h2>
          <div className="score-display">{score.correct}/{score.total}</div>
          <div className="score-percentage">({score.percentage}%)</div>
          
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
              {answers.map((answer, index) => (
                <div key={index} className={`result-item ${answer.correct ? 'correct' : 'incorrect'}`}>
                  <div className="result-header">
                    <span className="result-emoji">{answer.correct ? '✅' : '❌'}</span>
                    <span className="result-level">{answer.sentence.level}</span>
                    <span className="result-number">#{index + 1}</span>
                  </div>
                  <div className="result-content">
                    <div className="correct-text">
                      <strong>Correct:</strong> "{answer.sentence.correctText}"
                    </div>
                    {!answer.correct && (
                      <div className="user-text">
                        <strong>You typed:</strong> "{answer.userInput || '(no answer)'}"
                      </div>
                    )}
                    <div className="time-taken">
                      Time taken: {answer.timeTaken} seconds
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
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

        return (
        <div className="exercise-page">
          <div className="logo-container">
            <img 
              src="/purple_fox_transparent.png" 
              alt="Mr. Fox English" 
              className="app-logo"
            />
          </div>
          
          <h1>🎧 Listen and Type</h1>
          
          <div className="loading-message">
            <p>🎲 Generating your random test...</p>
            <p><small>Selecting sentences from different difficulty levels</small></p>
          </div>

          <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '20px' }}>
            ← Back to Exercises
          </button>
        </div>
      );
    }

    if (!hasStarted) {
    return (
      <div className="exercise-page">
        <div className="logo-container">
          <img 
            src="/purple_fox_transparent.png" 
            alt="Mr. Fox English" 
            className="app-logo"
          />
        </div>
        
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
                <span>Spelling and apostrophes must be correct</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">❌</span>
                <span>Punctuation (. , ! ?) is not required</span>
              </div>
            </div>
            
            <div className="difficulty-info">
              <h4>📊 Test Structure</h4>
              <p>Random selection from pools of sentences:</p>
              <ul style={{ textAlign: 'left', marginTop: '10px' }}>
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

        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '20px' }}>
          ← Back to Exercises
        </button>
      </div>
    );
  }

  return (
    <div className="listen-type-container">
      {/* Header */}
      <div className="listen-header">
        <div className="timer-section">
          <span className="timer-icon">⏱️</span>
          <span className="timer-text" style={{ color: timeLeft <= 10 ? '#e53e3e' : '#4c51bf' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="progress-section">
          <span className="progress-text">
            Question {currentSentence + 1} of {LISTENING_SENTENCES.length}
          </span>
        </div>
        <button className="close-btn" onClick={onBack}>✕</button>
      </div>

      {/* Main Content */}
      <div className="listen-main">
        <div className="level-indicator">
          <span className="level-badge">{currentData.level}</span>
          <span className="level-description">{currentData.difficulty}</span>
        </div>

        {/* Audio Controls */}
        <div className="audio-section">
          <audio ref={audioRef} preload="auto">
            <source src={`/${currentData.audioFile}`} type="audio/mpeg" />
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
              ⚠️ Audio file not found: {currentData.audioFile}
              <br />
              <small>Please ensure the file exists in the public folder</small>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="input-section">
          <h3>Type what you hear:</h3>
          <textarea
            ref={inputRef}
            className="typing-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the sentence here..."
            rows={3}
            disabled={showResults}
          />
          
          <div className="input-info">
            <p>💡 <strong>Remember:</strong> Spelling and apostrophes must be correct, but punctuation is optional</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="navigation-section">
          <button 
            className="btn btn-primary btn-large"
            onClick={handleNext}
          >
            {currentSentence + 1 === LISTENING_SENTENCES.length ? 'Finish Test' : 'Next Sentence'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .listen-type-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #f7f7f7;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .listen-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .timer-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .timer-icon {
          font-size: 1.2em;
        }

        .timer-text {
          font-weight: 700;
          font-size: 1.2em;
        }

        .progress-section {
          font-weight: 600;
          color: #4a5568;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5em;
          color: #666;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: background 0.3s ease;
        }

        .close-btn:hover {
          background: #f0f0f0;
        }

        .listen-main {
          flex: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .level-indicator {
          text-align: center;
          margin-bottom: 30px;
        }

        .level-badge {
          background: #4c51bf;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          margin-right: 15px;
        }

        .level-description {
          color: #666;
          font-style: italic;
        }

        .audio-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .audio-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .play-btn {
          background: linear-gradient(135deg, #4c51bf, #667eea);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 20px 40px;
          font-size: 1.1em;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 180px;
          justify-content: center;
        }

        .play-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(76, 81, 191, 0.3);
        }

        .play-btn:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
          transform: none;
        }

        .play-btn.playing {
          background: linear-gradient(135deg, #48bb78, #38a169);
        }

        .play-icon {
          font-size: 1.2em;
        }

        .play-counter {
          font-weight: 600;
          color: #4c51bf;
          background: #f0f2ff;
          padding: 8px 16px;
          border-radius: 20px;
        }

        .audio-error {
          background: #fff5f5;
          border: 2px solid #f56565;
          border-radius: 8px;
          padding: 15px;
          color: #e53e3e;
          margin-top: 15px;
        }

        .input-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .input-section h3 {
          color: #4c51bf;
          margin-bottom: 15px;
          text-align: center;
        }

        .typing-input {
          width: 100%;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 15px;
          font-size: 1.1em;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
          transition: border-color 0.3s ease;
        }

        .typing-input:focus {
          outline: none;
          border-color: #4c51bf;
          box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.1);
        }

        .input-info {
          margin-top: 15px;
          padding: 12px;
          background: #fffbeb;
          border-radius: 8px;
          border-left: 4px solid #f6e05e;
        }

        .input-info p {
          margin: 0;
          color: #d69e2e;
          font-size: 0.95em;
        }

        .navigation-section {
          text-align: center;
        }

        .instructions-container {
          background: white;
          border-radius: 15px;
          padding: 40px;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 20px auto;
        }

        .instruction-content h3 {
          color: #4c51bf;
          margin-bottom: 20px;
          text-align: center;
        }

        .instruction-list {
          margin-bottom: 30px;
        }

        .instruction-item {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .instruction-icon {
          font-size: 1.3em;
          width: 30px;
          text-align: center;
        }

        .difficulty-info {
          background: #f0f2ff;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          margin-bottom: 20px;
        }

        .difficulty-info h4 {
          color: #4c51bf;
          margin-bottom: 10px;
        }

        .difficulty-info p {
          color: #666;
          margin: 0;
        }

        .detailed-results {
          margin: 30px 0;
        }

        .detailed-results h3 {
          color: #4c51bf;
          text-align: center;
          margin-bottom: 20px;
        }

        .results-list {
          max-width: 700px;
          margin: 0 auto;
        }

        .result-item {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        }

        .result-item.correct {
          border-color: #48bb78;
          background: #f0fff4;
        }

        .result-item.incorrect {
          border-color: #f56565;
          background: #fff5f5;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .result-emoji {
          font-size: 1.2em;
        }

        .result-level {
          background: #4c51bf;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 700;
        }

        .result-number {
          color: #666;
          font-weight: 600;
        }

        .result-content {
          text-align: left;
        }

        .correct-text {
          margin-bottom: 8px;
          color: #2d3748;
        }

        .user-text {
          margin-bottom: 8px;
          color: #e53e3e;
        }

        .time-taken {
          font-size: 0.9em;
          color: #666;
          font-style: italic;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .listen-main {
            padding: 20px;
          }

          .audio-section,
          .input-section {
            padding: 20px;
          }

          .play-btn {
            padding: 15px 30px;
            font-size: 1em;
          }

          .typing-input {
            font-size: 1em;
          }

          .instructions-container {
            padding: 25px;
            margin: 15px;
          }

          .instruction-item {
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .listen-header {
            padding: 10px 15px;
            flex-wrap: wrap;
            gap: 10px;
          }

          .timer-text {
            font-size: 1em;
          }

          .level-indicator {
            margin-bottom: 20px;
          }

          .level-badge {
            display: block;
            margin-bottom: 10px;
            margin-right: 0;
          }

          .play-btn {
            padding: 12px 25px;
            min-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}

export default ListenAndTypeExercise;
