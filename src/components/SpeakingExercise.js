// src/components/SpeakingExercise.js - Complete rewrite from scratch
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { recordTestResult } from '../utils/progressDataManager';

// Enhanced homophones for better matching
const HOMOPHONES = {
  'to': ['too', 'two'], 'too': ['to', 'two'], 'two': ['to', 'too'],
  'there': ['their', 'they\'re'], 'their': ['there', 'they\'re'], 'they\'re': ['there', 'their'],
  'your': ['you\'re'], 'you\'re': ['your'],
  'its': ['it\'s'], 'it\'s': ['its'],
  'where': ['wear', 'ware'], 'wear': ['where', 'ware'],
  'here': ['hear'], 'hear': ['here'],
  'no': ['know'], 'know': ['no'],
  'right': ['write', 'rite'], 'write': ['right', 'rite'],
  'peace': ['piece'], 'piece': ['peace']
};

function SpeakingExercise({ onBack, onLogoClick }) {
  // Core state
  const [currentStep, setCurrentStep] = useState('checking'); // checking, instructions, exercise, results
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Speech recognition ref
  const recognitionRef = useRef(null);

  // Initialize sentences
  const initializeSentences = () => {
    const testSentences = [];
    
    TEST_STRUCTURE.forEach(({ level, count }) => {
      const levelSentences = SENTENCE_POOLS[level];
      if (levelSentences) {
        const shuffled = [...levelSentences].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));
        
        selected.forEach(sentence => {
          testSentences.push({
            text: sentence.correctText,
            level: level,
            audioFile: sentence.audioFile
          });
        });
      }
    });
    
    setSentences(testSentences);
    console.log(`✅ Loaded ${testSentences.length} sentences`);
  };

  // Check speech recognition support
  const checkSpeechRecognition = async () => {
    console.log('🎤 Checking speech recognition support...');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setCurrentStep('error');
      setFeedback('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Microphone access granted');
      setCurrentStep('instructions');
    } catch (error) {
      console.log('❌ Microphone access denied');
      setCurrentStep('error');
      setFeedback('Microphone access required. Please allow microphone access and refresh the page.');
    }
  };

  // Calculate score using word matching
  const calculateScore = (spoken, target) => {
    const normalize = (text) => {
      return text.toLowerCase()
        .replace(/[.,!?;:'"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const spokenWords = normalize(spoken).split(' ').filter(word => word.length > 0);
    const targetWords = normalize(target).split(' ').filter(word => word.length > 0);
    
    if (spokenWords.length === 0) return { percentage: 0, matchedWords: 0, totalWords: targetWords.length };

    // Count matches including homophones
    let matchedWords = 0;
    const targetWordMap = {};
    targetWords.forEach(word => {
      targetWordMap[word] = (targetWordMap[word] || 0) + 1;
    });

    const spokenWordMap = {};
    spokenWords.forEach(word => {
      spokenWordMap[word] = (spokenWordMap[word] || 0) + 1;
    });

    // Match words directly and through homophones
    Object.keys(targetWordMap).forEach(targetWord => {
      const targetCount = targetWordMap[targetWord];
      let foundCount = spokenWordMap[targetWord] || 0;
      
      // Check homophones if no direct match
      if (foundCount === 0 && HOMOPHONES[targetWord]) {
        for (const homophone of HOMOPHONES[targetWord]) {
          if (spokenWordMap[homophone]) {
            foundCount = Math.min(targetCount, spokenWordMap[homophone]);
            break;
          }
        }
      }
      
      matchedWords += Math.min(targetCount, foundCount);
    });

    const percentage = Math.round((matchedWords / targetWords.length) * 100);
    return { percentage, matchedWords, totalWords: targetWords.length };
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    recognition.onstart = () => {
      console.log('🎤 Recording started');
      setIsRecording(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsRecording(false);
      setFeedback(`Recording error: ${event.error}. Please try again.`);
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
      recognitionRef.current = initSpeechRecognition();
    }

    try {
      recognitionRef.current.start();
      setFeedback(null);
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
    const scoreData = calculateScore(transcript.trim(), currentSentence.text);
    
    // Store result
    const result = {
      target: currentSentence.text,
      spoken: transcript.trim(),
      score: scoreData.percentage,
      level: currentSentence.level,
      matchedWords: scoreData.matchedWords,
      totalWords: scoreData.totalWords
    };

    setResults(prev => [...prev, result]);

    // Show feedback
    let message = '';
    if (scoreData.percentage >= 90) message = `Excellent! ${scoreData.percentage}% accuracy 🌟`;
    else if (scoreData.percentage >= 70) message = `Good job! ${scoreData.percentage}% accuracy 👍`;
    else if (scoreData.percentage >= 50) message = `Not bad! ${scoreData.percentage}% accuracy 📈`;
    else message = `Keep practicing! ${scoreData.percentage}% accuracy 💪`;
    
    setFeedback(message);

    // Move to next sentence or finish
    setTimeout(() => {
      if (currentIndex + 1 < sentences.length) {
        setCurrentIndex(prev => prev + 1);
        setTranscript('');
        setFeedback(null);
      } else {
        finishExercise();
      }
    }, 2000);
  };

  // Skip current sentence
  const skipSentence = () => {
    const currentSentence = sentences[currentIndex];
    const result = {
      target: currentSentence.text,
      spoken: '',
      score: 0,
      level: currentSentence.level,
      matchedWords: 0,
      totalWords: currentSentence.text.split(' ').length
    };

    setResults(prev => [...prev, result]);
    setFeedback('Sentence skipped');

    setTimeout(() => {
      if (currentIndex + 1 < sentences.length) {
        setCurrentIndex(prev => prev + 1);
        setTranscript('');
        setFeedback(null);
      } else {
        finishExercise();
      }
    }, 1000);
  };

  // Finish exercise and record results
  const finishExercise = () => {
    console.log('🏁 Finishing speaking exercise');
    
    const testDuration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    const overallScore = results.length > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length 
      : 0;

    // Prepare user answers for progress tracking
    const userAnswers = results.map(result => ({
      answer: result.spoken || '',
      correct: result.score >= 70,
      score: result.score,
      level: result.level
    }));

    try {
      // Record test result - this will increment daily targets
      recordTestResult({
        quizType: 'speak-and-record',
        score: Math.round(overallScore / 10), // Convert percentage to score out of 10
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: testDuration,
        userAnswers: userAnswers
      });

      console.log('✅ Test result recorded successfully');
      console.log('📊 Overall score:', Math.round(overallScore), '%');
    } catch (error) {
      console.error('❌ Error recording test result:', error);
    }

    setCurrentStep('results');
  };

  // Play audio for specific sentence
  const playAudio = (audioFile) => {
    if (!audioFile) return;
    
    const audio = new Audio(`/${audioFile}`);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      setFeedback('Audio playback failed');
    });
  };

  // Start exercise
  const startExercise = () => {
    initializeSentences();
    setCurrentStep('exercise');
    setCurrentIndex(0);
    setResults([]);
    setStartTime(Date.now());
  };

  // Check speech recognition on mount
  useEffect(() => {
    checkSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Current sentence and progress
  const currentSentence = sentences[currentIndex];
  const progress = sentences.length > 0 ? ((currentIndex + 1) / sentences.length) * 100 : 0;

  // Calculate final results
  const finalResults = results.length > 0 ? {
    totalScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
    completedSentences: results.filter(r => r.spoken).length,
    totalSentences: sentences.length,
    testDuration: startTime ? Math.round((Date.now() - startTime) / 1000) : 0
  } : null;

  // Render error state
  if (currentStep === 'error') {
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
            <button className="btn btn-primary" onClick={checkSpeechRecognition}>
              🔄 Try Again
            </button>
            <button className="btn btn-secondary" onClick={onBack} style={{ marginLeft: '10px' }}>
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render instructions
  if (currentStep === 'instructions') {
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
                <span>Click "Start Recording" and speak clearly</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⏹️</span>
                <span>Click "Stop Recording" when finished</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📊</span>
                <span>Get instant feedback on pronunciation accuracy</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎯</span>
                <span>Complete 10 sentences across difficulty levels</span>
              </div>
            </div>
            
            <div className="tips-section">
              <h4>💡 Speaking Tips:</h4>
              <ul>
                <li>Speak clearly and at a normal pace</li>
                <li>Find a quiet environment</li>
                <li>Pronounce each word distinctly</li>
                <li>British and American pronunciations accepted</li>
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

  // Render main exercise
  if (currentStep === 'exercise') {
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
                <div className="target-sentence">
                  "{currentSentence.text}"
                </div>
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
                  <button className="btn btn-danger btn-large" onClick={stopRecording}>
                    ⏹️ Stop Recording
                  </button>
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
                <div className="feedback show">
                  {feedback}
                </div>
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

  // Render results
  if (currentStep === 'results') {
    return (
      <div className="exercise-page scrollable-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise Results</h1>
          
          <div className="results">
            <h2>🎉 Exercise Complete!</h2>
            <div className="score-display">{finalResults?.totalScore || 0}%</div>
            
            <div className="level-estimate">
              <h3>Speaking Practice Complete</h3>
              <p>You completed {finalResults?.completedSentences || 0} of {finalResults?.totalSentences || 0} sentences</p>
            </div>

            <div className="test-stats">
              <p>⏱️ Time taken: {Math.floor((finalResults?.testDuration || 0) / 60)}m {(finalResults?.testDuration || 0) % 60}s</p>
              <p>📊 Overall accuracy: {finalResults?.totalScore || 0}%</p>
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
                    <p><strong>Word accuracy:</strong> {result.matchedWords}/{result.totalWords} words correct</p>
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

  // Loading fallback
  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <div className="quiz-container">
        <h1>🎤 Speaking Exercise</h1>
        <p>Loading...</p>
      </div>
    </div>
  );
}

export default SpeakingExercise;
