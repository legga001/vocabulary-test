// src/components/SpeakingExercise.js - Clean rewrite with daily progress tracking
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { recordTestResult } from '../utils/progressDataManager';

// Homophones for British English pronunciation matching
const HOMOPHONES = {
  'to': ['too', 'two'], 'too': ['to', 'two'], 'two': ['to', 'too'],
  'there': ['their', 'they\'re'], 'their': ['there', 'they\'re'], 'they\'re': ['there', 'their'],
  'your': ['you\'re'], 'you\'re': ['your'],
  'its': ['it\'s'], 'it\'s': ['its'],
  'where': ['wear', 'ware'], 'wear': ['where', 'ware'],
  'here': ['hear'], 'hear': ['here'],
  'no': ['know'], 'know': ['no'],
  'right': ['write', 'rite'], 'write': ['right', 'rite'],
  'peace': ['piece'], 'piece': ['peace'],
  'break': ['brake'], 'brake': ['break'],
  'would': ['wood'], 'wood': ['would'],
  'weather': ['whether'], 'whether': ['weather'],
  'for': ['four', 'fore'], 'four': ['for', 'fore'], 'fore': ['for', 'four'],
  'been': ['bean'], 'bean': ['been'],
  'by': ['buy', 'bye'], 'buy': ['by', 'bye'], 'bye': ['by', 'buy'],
  'hour': ['our'], 'our': ['hour'],
  'week': ['weak'], 'weak': ['week'],
  'allowed': ['aloud'], 'aloud': ['allowed'],
  'threw': ['through'], 'through': ['threw'],
  'mail': ['male'], 'male': ['mail'],
  'principal': ['principle'], 'principle': ['principal']
};

function SpeakingExercise({ onBack, onLogoClick }) {
  // Core state - minimal and efficient
  const [step, setStep] = useState('checking'); // checking, instructions, exercise, results, error
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [exerciseStartTime, setExerciseStartTime] = useState(null);

  // Speech recognition reference
  const recognitionRef = useRef(null);

  // Calculate forgiving score based on word content, not order
  const calculateScore = (spoken, target) => {
    const normalize = text => text.toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();
    const spokenWords = normalize(spoken).split(' ').filter(w => w.length > 0);
    const targetWords = normalize(target).split(' ').filter(w => w.length > 0);
    
    if (spokenWords.length === 0) return { percentage: 0, matched: 0, total: targetWords.length };

    // Count target word occurrences
    const targetMap = {};
    targetWords.forEach(word => targetMap[word] = (targetMap[word] || 0) + 1);

    // Count spoken word occurrences
    const spokenMap = {};
    spokenWords.forEach(word => spokenMap[word] = (spokenMap[word] || 0) + 1);

    // Calculate matches including homophones
    let matched = 0;
    Object.entries(targetMap).forEach(([targetWord, targetCount]) => {
      let foundCount = spokenMap[targetWord] || 0;
      
      // Check homophones if no direct match
      if (foundCount === 0 && HOMOPHONES[targetWord]) {
        for (const homophone of HOMOPHONES[targetWord]) {
          if (spokenMap[homophone]) {
            foundCount = Math.min(targetCount, spokenMap[homophone]);
            break;
          }
        }
      }
      
      matched += Math.min(targetCount, foundCount);
    });

    // Apply small penalty for excessive length (>2x target length)
    const lengthPenalty = spokenWords.length > (targetWords.length * 2) ? 10 : 0;
    const percentage = Math.max(0, Math.round((matched / targetWords.length) * 100) - lengthPenalty);
    
    return { percentage, matched, total: targetWords.length };
  };

  // Initialize sentences for exercise
  const initializeSentences = () => {
    const exerciseSentences = [];
    
    TEST_STRUCTURE.forEach(({ level, count }) => {
      const levelSentences = SENTENCE_POOLS[level];
      if (levelSentences && levelSentences.length > 0) {
        const shuffled = [...levelSentences].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));
        
        selected.forEach(sentence => {
          exerciseSentences.push({
            text: sentence.correctText,
            level: level,
            audioFile: sentence.audioFile
          });
        });
      }
    });
    
    setSentences(exerciseSentences);
    console.log(`✅ Loaded ${exerciseSentences.length} sentences for speaking exercise`);
    return exerciseSentences.length > 0;
  };

  // Check browser support and permissions
  const checkSpeechSupport = async () => {
    console.log('🎤 Checking speech recognition support...');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStep('error');
      setFeedback('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Microphone access granted');
      setStep('instructions');
    } catch (error) {
      console.log('❌ Microphone access denied:', error);
      setStep('error');
      setFeedback('Microphone access required. Please allow microphone access and refresh the page.');
    }
  };

  // Initialize speech recognition
  const createSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    recognition.onstart = () => {
      console.log('🎤 Recording started');
      setIsRecording(true);
      setTranscript('');
      setFeedback('');
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += resultText;
        } else {
          interimText += resultText;
        }
      }

      setTranscript(finalText + interimText);
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsRecording(false);
      
      const errorMessages = {
        'no-speech': 'No speech detected. Please speak louder.',
        'audio-capture': 'Microphone error. Please check your microphone.',
        'not-allowed': 'Microphone access denied. Please allow access and refresh.',
        'network': 'Network error. Please check your connection.'
      };
      
      setFeedback(errorMessages[event.error] || `Recording error: ${event.error}`);
    };

    recognition.onend = () => {
      console.log('🎤 Recording ended');
      setIsRecording(false);
    };

    return recognition;
  };

  // Start recording
  const startRecording = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = createSpeechRecognition();
    }

    try {
      recognitionRef.current.start();
      setFeedback('');
    } catch (error) {
      console.error('Error starting recording:', error);
      setFeedback('Failed to start recording. Please try again.');
    }
  };

  // Stop recording and process result
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const currentSentence = sentences[currentIndex];
    if (!currentSentence) return;

    const scoreData = calculateScore(transcript.trim(), currentSentence.text);
    
    const result = {
      target: currentSentence.text,
      spoken: transcript.trim(),
      score: scoreData.percentage,
      level: currentSentence.level,
      matched: scoreData.matched,
      total: scoreData.total
    };

    setResults(prev => [...prev, result]);

    // Provide encouraging feedback
    const feedbackMessages = [
      { min: 95, message: 'Perfect! Outstanding pronunciation! 🌟', type: 'success' },
      { min: 85, message: 'Excellent work! Great pronunciation! 🎉', type: 'success' },
      { min: 70, message: 'Well done! Good pronunciation! 👍', type: 'success' },
      { min: 50, message: 'Good effort! Keep practising! 📈', type: 'warning' },
      { min: 0, message: 'Keep trying! Practice makes perfect! 💪', type: 'info' }
    ];

    const feedbackObj = feedbackMessages.find(f => scoreData.percentage >= f.min);
    setFeedback(`${feedbackObj.message} (${scoreData.percentage}%)`);

    // Auto-advance to next sentence
    setTimeout(() => {
      if (currentIndex + 1 < sentences.length) {
        setCurrentIndex(prev => prev + 1);
        setTranscript('');
        setFeedback('');
      } else {
        finishExercise();
      }
    }, 2500);
  };

  // Skip current sentence
  const skipSentence = () => {
    const currentSentence = sentences[currentIndex];
    if (!currentSentence) return;

    const result = {
      target: currentSentence.text,
      spoken: '',
      score: 0,
      level: currentSentence.level,
      matched: 0,
      total: currentSentence.text.split(' ').length
    };

    setResults(prev => [...prev, result]);
    setFeedback('Sentence skipped');

    setTimeout(() => {
      if (currentIndex + 1 < sentences.length) {
        setCurrentIndex(prev => prev + 1);
        setTranscript('');
        setFeedback('');
      } else {
        finishExercise();
      }
    }, 1000);
  };

  // Complete exercise and record progress
  const finishExercise = () => {
    console.log('🏁 Completing speaking exercise');
    
    const testDuration = exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 1000) : 0;
    const averageScore = results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0;

    const userAnswers = results.map(result => ({
      answer: result.spoken || '',
      correct: result.score >= 70,
      score: result.score,
      level: result.level
    }));

    try {
      // Record test result - this automatically increments daily targets
      recordTestResult({
        quizType: 'speak-and-record',
        score: Math.round(averageScore / 10), // Convert percentage to 0-10 scale
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: testDuration,
        userAnswers: userAnswers
      });

      console.log('✅ Speaking exercise completed and progress recorded');
      console.log(`📊 Average score: ${Math.round(averageScore)}%`);
    } catch (error) {
      console.error('❌ Error recording progress:', error);
    }

    setStep('results');
  };

  // Play audio for sentence (used in results)
  const playAudio = (audioFile) => {
    if (!audioFile) return;
    
    const audio = new Audio(`/${audioFile}`);
    audio.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  };

  // Start the exercise
  const startExercise = () => {
    if (initializeSentences()) {
      setStep('exercise');
      setCurrentIndex(0);
      setResults([]);
      setExerciseStartTime(Date.now());
      setFeedback('');
    } else {
      setStep('error');
      setFeedback('No sentences available for this exercise.');
    }
  };

  // Restart recording for current sentence
  const restartRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setTranscript('');
    setFeedback('Recording restarted - try again!');
    setTimeout(() => setFeedback(''), 2000);
  };

  // Component mount effect
  useEffect(() => {
    checkSpeechSupport();
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Computed values
  const currentSentence = sentences[currentIndex];
  const progress = sentences.length > 0 ? ((currentIndex + 1) / sentences.length) * 100 : 0;
  const finalStats = results.length > 0 ? {
    averageScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
    completed: results.filter(r => r.spoken).length,
    total: sentences.length,
    duration: exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 1000) : 0
  } : null;

  // Error state
  if (step === 'error') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise</h1>
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Setup Required</h2>
            <p>{feedback}</p>
            <div className="browser-support">
              <h3>Supported Browsers:</h3>
              <ul>
                <li>✅ Google Chrome (recommended)</li>
                <li>✅ Microsoft Edge</li>
                <li>✅ Safari (Mac/iOS)</li>
                <li>❌ Firefox (limited support)</li>
              </ul>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={checkSpeechSupport}>
                🔄 Try Again
              </button>
              <button className="btn btn-secondary" onClick={onBack} style={{ marginLeft: '10px' }}>
                ← Back to Exercises
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Instructions state
  if (step === 'instructions') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise</h1>
          <div className="instructions-container">
            <h3>📋 How it Works</h3>
            <div className="instruction-list">
              <div className="instruction-item">
                <span className="instruction-icon">👀</span>
                <span>Read the sentence displayed on screen</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎤</span>
                <span>Click "Start Recording" and speak the sentence clearly</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⏹️</span>
                <span>Click "Stop Recording" when you've finished speaking</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📊</span>
                <span>Get instant feedback on your pronunciation accuracy</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎯</span>
                <span>Complete 10 sentences across different difficulty levels</span>
              </div>
            </div>
            
            <div className="tips-section">
              <h4>💡 Speaking Tips:</h4>
              <ul>
                <li>Speak clearly and at a normal pace</li>
                <li>Find a quiet environment for best results</li>
                <li>Pronounce each word distinctly</li>
                <li>Both British and American pronunciations are accepted</li>
                <li>Don't worry about hesitations - the scoring is forgiving</li>
              </ul>
            </div>
            
            <button className="btn btn-primary btn-large" onClick={startExercise}>
              🎤 Start Speaking Exercise
            </button>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Main exercise state
  if (step === 'exercise') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise</h1>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-text">
              Sentence {currentIndex + 1} of {sentences.length}
              {currentSentence && ` (${currentSentence.level})`}
            </div>
          </div>

          {currentSentence && (
            <>
              <div className="sentence-display">
                <h3>Read this sentence aloud:</h3>
                <div className="target-sentence">"{currentSentence.text}"</div>
              </div>

              {isRecording && (
                <div className="recording-indicator">
                  <div className="recording-pulse"></div>
                  <div className="recording-text">Recording... Click "Stop Recording" when finished!</div>
                </div>
              )}

              {transcript && (
                <div className="transcript-display">
                  <div className="transcript-label">You're saying:</div>
                  <div className="transcript-text">"{transcript}"</div>
                </div>
              )}

              <div className="recording-controls">
                {!isRecording ? (
                  <button className="btn btn-primary btn-large" onClick={startRecording}>
                    🎤 Start Recording
                  </button>
                ) : (
                  <>
                    <button className="btn btn-danger btn-large" onClick={stopRecording}>
                      ⏹️ Stop Recording
                    </button>
                    <button className="btn btn-warning" onClick={restartRecording}>
                      🔄 Restart Recording
                    </button>
                  </>
                )}
                
                <button 
                  className="btn btn-secondary" 
                  onClick={skipSentence}
                  disabled={isRecording}
                >
                  ⏭️ Skip Sentence
                </button>
              </div>

              {feedback && (
                <div className="feedback show">{feedback}</div>
              )}
            </>
          )}

          <div className="exercise-footer">
            <button className="btn btn-secondary btn-small" onClick={onBack}>
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results state
  if (step === 'results') {
    return (
      <div className="exercise-page scrollable-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise Results</h1>
          
          <div className="results">
            <h2>🎉 Exercise Complete!</h2>
            <div className="score-display">{finalStats?.averageScore || 0}%</div>
            
            <div className="level-estimate">
              <h3>Speaking Practice Complete</h3>
              <p>You completed {finalStats?.completed || 0} of {finalStats?.total || 0} sentences</p>
            </div>

            <div className="test-stats">
              <p>⏱️ Time taken: {Math.floor((finalStats?.duration || 0) / 60)}m {(finalStats?.duration || 0) % 60}s</p>
              <p>📊 Overall accuracy: {finalStats?.averageScore || 0}%</p>
            </div>

            <div className="detailed-results">
              <h3>📝 Detailed Results:</h3>
              <div className="results-list">
                {results.map((result, index) => (
                  <div key={index} className={`result-item ${result.score >= 70 ? 'success' : result.score >= 50 ? 'warning' : 'error'}`}>
                    <div className="result-header">
                      <h4>Sentence {index + 1} ({result.level}): {result.score}%</h4>
                      <div className="result-actions">
                        {sentences[index]?.audioFile && (
                          <button 
                            className="btn btn-small btn-secondary audio-play-btn"
                            onClick={() => playAudio(sentences[index].audioFile)}
                            title="Play sample pronunciation"
                          >
                            🔊 Play
                          </button>
                        )}
                      </div>
                    </div>
                    <p><strong>Target:</strong> "{result.target}"</p>
                    <p><strong>You said:</strong> "{result.spoken || '(Skipped)'}"</p>
                    <p><strong>Word accuracy:</strong> {result.matched}/{result.total} words correct</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={startExercise}>
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

  // Loading/checking state
  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <div className="quiz-container">
        <h1>🎤 Speaking Exercise</h1>
        <div className="loading-state">
          <p>Checking speech recognition support...</p>
        </div>
      </div>
    </div>
  );
}

export default SpeakingExercise;
