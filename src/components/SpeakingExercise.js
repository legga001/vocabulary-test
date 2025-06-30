// src/components/SpeakingExercise.js - Backend enhanced, frontend unchanged
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { recordTestResult } from '../utils/progressDataManager';

// ENHANCED: Expanded homophones for British English pronunciation matching
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
  'principal': ['principle'], 'principle': ['principal'],
  // ENHANCED: Additional homophones
  'whole': ['hole'], 'hole': ['whole'],
  'one': ['won'], 'won': ['one'],
  'son': ['sun'], 'sun': ['son'],
  'sea': ['see'], 'see': ['sea'],
  'meet': ['meat'], 'meat': ['meet'],
  'read': ['red'], 'red': ['read'],
  'blue': ['blew'], 'blew': ['blue'],
  'knew': ['new'], 'new': ['knew'],
  'night': ['knight'], 'knight': ['night'],
  'sight': ['site'], 'site': ['sight'],
  'right': ['write', 'rite'], 'write': ['right', 'rite'], 'rite': ['right', 'write'],
  'sail': ['sale'], 'sale': ['sail'],
  'tale': ['tail'], 'tail': ['tale'],
  'wait': ['weight'], 'weight': ['wait'],
  'made': ['maid'], 'maid': ['made'],
  'pain': ['pane'], 'pane': ['pain'],
  'plain': ['plane'], 'plane': ['plain'],
  'rain': ['reign'], 'reign': ['rain'],
  'bear': ['bare'], 'bare': ['bear'],
  'pair': ['pear'], 'pear': ['pair'],
  'fair': ['fare'], 'fare': ['fair'],
  'hair': ['hare'], 'hare': ['hair']
};

// ENHANCED: Phonetic similarity using improved Soundex algorithm
const advancedSoundex = (word) => {
  if (!word) return '';
  word = word.toUpperCase().replace(/[^A-Z]/g, '');
  if (word.length === 0) return '';
  
  // Keep first letter
  let result = word[0];
  
  // Enhanced replacement map
  const replacements = {
    'B': '1', 'F': '1', 'P': '1', 'V': '1',
    'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
    'D': '3', 'T': '3',
    'L': '4',
    'M': '5', 'N': '5',
    'R': '6'
  };
  
  let prev = replacements[word[0]] || '';
  
  for (let i = 1; i < word.length; i++) {
    const char = word[i];
    const code = replacements[char];
    
    // Skip vowels and similar consonants, avoid duplicates
    if (code && code !== prev) {
      result += code;
      if (result.length === 4) break;
    }
    prev = code || prev;
  }
  
  // Pad with zeros or truncate to 4 characters
  return (result + '000').substring(0, 4);
};

// ENHANCED: Phonetic similarity scoring
const getPhoneticSimilarity = (word1, word2) => {
  const soundex1 = advancedSoundex(word1);
  const soundex2 = advancedSoundex(word2);
  
  if (soundex1 === soundex2) return 90; // High score for phonetic match
  
  // Check for partial phonetic similarity
  let matches = 0;
  const minLength = Math.min(soundex1.length, soundex2.length);
  for (let i = 0; i < minLength; i++) {
    if (soundex1[i] === soundex2[i]) matches++;
  }
  
  const similarity = (matches / 4) * 80; // Max 80% for partial phonetic similarity
  return similarity >= 40 ? similarity : 0; // Only return if reasonably similar
};

// ENHANCED: Check for common speech recognition errors
const checkCommonErrors = (spoken, target) => {
  const spokenLower = spoken.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Common substitutions that speech recognition makes
  const commonSubs = {
    'a': ['ah', 'uh'], 'the': ['thee', 'thuh'], 'of': ['ov'], 'and': ['an'],
    'to': ['tuh'], 'in': ['een'], 'is': ['iz'], 'it': ['et'], 'that': ['dat'],
    'have': ['hav'], 'are': ['ar'], 'was': ['wuz'], 'for': ['fer'],
    'with': ['wid'], 'his': ['hiz'], 'they': ['dey'], 'this': ['dis']
  };
  
  if (commonSubs[targetLower] && commonSubs[targetLower].includes(spokenLower)) {
    return 85; // Good score for common pronunciation variants
  }
  
  return 0;
};

// ENHANCED: Edit distance for close matches
const getEditDistance = (word1, word2) => {
  const len1 = word1.length;
  const len2 = word2.length;
  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = word1[i - 1] === word2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  if (maxLen === 0) return 100;
  
  const similarity = ((maxLen - matrix[len1][len2]) / maxLen) * 100;
  return similarity >= 60 ? similarity : 0; // Only return if reasonably similar
};

function SpeakingExercise({ onBack, onLogoClick }) {
  // Core state - keeping exactly the same as original
  const [step, setStep] = useState('checking');
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [exerciseStartTime, setExerciseStartTime] = useState(null);

  // ENHANCED: Hidden state for better recognition (not displayed)
  const [speechAlternatives, setSpeechAlternatives] = useState([]);
  const [confidenceScore, setConfidenceScore] = useState(0);

  const recognitionRef = useRef(null);

  // ENHANCED: Much more sophisticated scoring algorithm
  const calculateScore = (spoken, target) => {
    const normalize = text => text.toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();
    const spokenWords = normalize(spoken).split(' ').filter(w => w.length > 0);
    const targetWords = normalize(target).split(' ').filter(w => w.length > 0);
    
    if (spokenWords.length === 0) return { percentage: 0, matched: 0, total: targetWords.length };

    // Create word frequency maps
    const targetMap = {};
    targetWords.forEach(word => targetMap[word] = (targetMap[word] || 0) + 1);

    const spokenMap = {};
    spokenWords.forEach(word => spokenMap[word] = (spokenMap[word] || 0) + 1);

    let totalScore = 0;
    let maxPossibleScore = 0;

    // Score each target word with multiple matching strategies
    Object.entries(targetMap).forEach(([targetWord, targetCount]) => {
      maxPossibleScore += targetCount * 100; // Max score per word
      let bestWordScore = 0;

      // Strategy 1: Exact match (100 points)
      const exactCount = spokenMap[targetWord] || 0;
      if (exactCount > 0) {
        bestWordScore = Math.min(targetCount, exactCount) * 100;
      }

      // Strategy 2: Homophone match (95 points)
      if (bestWordScore < targetCount * 100 && HOMOPHONES[targetWord]) {
        for (const homophone of HOMOPHONES[targetWord]) {
          const homophoneCount = spokenMap[homophone] || 0;
          if (homophoneCount > 0) {
            const homophoneScore = Math.min(targetCount, homophoneCount) * 95;
            bestWordScore = Math.max(bestWordScore, homophoneScore);
          }
        }
      }

      // Strategy 3: Common pronunciation errors (85 points)
      if (bestWordScore < targetCount * 85) {
        Object.keys(spokenMap).forEach(spokenWord => {
          const errorScore = checkCommonErrors(spokenWord, targetWord);
          if (errorScore > 0) {
            const adjustedScore = Math.min(targetCount, spokenMap[spokenWord]) * errorScore;
            bestWordScore = Math.max(bestWordScore, adjustedScore);
          }
        });
      }

      // Strategy 4: Phonetic similarity (60-90 points)
      if (bestWordScore < targetCount * 80) {
        Object.keys(spokenMap).forEach(spokenWord => {
          const phoneticScore = getPhoneticSimilarity(targetWord, spokenWord);
          if (phoneticScore > 0) {
            const adjustedScore = Math.min(targetCount, spokenMap[spokenWord]) * phoneticScore;
            bestWordScore = Math.max(bestWordScore, adjustedScore);
          }
        });
      }

      // Strategy 5: Edit distance similarity (50-80 points)
      if (bestWordScore < targetCount * 70) {
        Object.keys(spokenMap).forEach(spokenWord => {
          const editScore = getEditDistance(targetWord, spokenWord);
          if (editScore > 0) {
            const adjustedScore = Math.min(targetCount, spokenMap[spokenWord]) * (editScore * 0.8);
            bestWordScore = Math.max(bestWordScore, adjustedScore);
          }
        });
      }

      totalScore += bestWordScore;
    });

    // Calculate percentage
    let percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // ENHANCED: Apply confidence bonus (hidden from user)
    if (confidenceScore > 0.8) {
      percentage = Math.min(100, Math.round(percentage * 1.05)); // 5% bonus for high confidence
    } else if (confidenceScore < 0.5) {
      percentage = Math.round(percentage * 0.95); // 5% penalty for low confidence
    }

    // Apply length penalty for excessively long responses
    const lengthRatio = spokenWords.length / targetWords.length;
    if (lengthRatio > 2.5) {
      percentage = Math.max(0, percentage - 15);
    } else if (lengthRatio > 2.0) {
      percentage = Math.max(0, percentage - 10);
    }

    // Calculate matched words for display (simplified for user)
    const matchedDisplay = Math.round((percentage / 100) * targetWords.length);

    return { 
      percentage: Math.min(100, Math.max(0, percentage)), 
      matched: matchedDisplay, 
      total: targetWords.length 
    };
  };

  // Initialize sentences - keeping exactly the same
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

  // Check browser support - keeping exactly the same
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

  // ENHANCED: Create speech recognition with better configuration
  const createSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // ENHANCED: Better configuration for accuracy
    recognition.continuous = false; // Changed to false for better word-level analysis
    recognition.interimResults = true;
    recognition.lang = 'en-GB';
    recognition.maxAlternatives = 5; // ENHANCED: Get multiple alternatives

    recognition.onstart = () => {
      console.log('🎤 Recording started');
      setIsRecording(true);
      setTranscript('');
      setFeedback('');
      // ENHANCED: Reset hidden state
      setSpeechAlternatives([]);
      setConfidenceScore(0);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      let bestConfidence = 0;

      // ENHANCED: Capture alternatives and confidence (hidden from user)
      const alternatives = [];

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          // ENHANCED: Process all alternatives
          for (let j = 0; j < Math.min(result.length, 5); j++) {
            const alternative = result[j];
            alternatives.push({
              text: alternative.transcript,
              confidence: alternative.confidence || 0.8
            });
            
            if (j === 0) {
              finalText = alternative.transcript;
              bestConfidence = alternative.confidence || 0.8;
            }
          }
        } else {
          interimText = result[0].transcript;
        }
      }

      setTranscript(finalText || interimText);
      // ENHANCED: Store confidence and alternatives (hidden)
      setConfidenceScore(bestConfidence);
      setSpeechAlternatives(alternatives);
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

  // Start recording - keeping exactly the same
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

 analysis (same display)
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const currentSentence = sentences[currentIndex];
    if (!currentSentence) return;

    // ENHANCED: Use improved scoring but keep same result structure
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

    // Keep exactly the same feedback messages
    const feedbackMessages = [
      { min: 95, message: 'Perfect! Outstanding pronunciation! 🌟', type: 'success' },
      { min: 85, message: 'Excellent work! Great pronunciation! 🎉', type: 'success' },
      { min: 70, message: 'Well done! Good pronunciation! 👍', type: 'success' },
      { min: 50, message: 'Good effort! Keep practising! 📈', type: 'warning' },
      { min: 0, message: 'Keep trying! Practice makes perfect! 💪', type: 'info' }
    ];

    const feedbackObj = feedbackMessages.find(f => scoreData.percentage >= f.min);
    setFeedback(`${feedbackObj.message} (${scoreData.percentage}%)`);

    // Keep exactly the same timing
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

  // All remaining functions stay exactly the same...
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
      recordTestResult({
        quizType: 'speak-and-record',
        score: Math.round(averageScore / 10),
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

  const playAudio = (audioFile) => {
    if (!audioFile) return;
    
    const audio = new Audio(`/${audioFile}`);
    audio.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  };

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

  const restartRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setTranscript('');
    setFeedback('Recording restarted - try again!');
    setTimeout(() => setFeedback(''), 2000);
  };

  useEffect(() => {
    checkSpeechSupport();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // All computed values stay exactly the same
  const currentSentence = sentences[currentIndex];
  const progress = sentences.length > 0 ? ((currentIndex + 1) / sentences.length) * 100 : 0;
  const finalStats = results.length > 0 ? {
    averageScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
    completed: results.filter(r => r.spoken).length,
    total: sentences.length,
    duration: exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 60) : 0
  } : null;

  // ALL RENDER METHODS STAY EXACTLY THE SAME - NO VISUAL CHANGES

  if (step === 'error') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise</h1>
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Setup Required</h2>
            <p>{feedback}</p>
            <div className="browser-support">
              <h3>💡 Troubleshooting:</h3>
              <ul>
                <li>🌐 Ensure you're using Chrome, Edge, or Safari</li>
                <li>🎤 Check your microphone is connected and working</li>
                <li>✅ Allow microphone access when prompted</li>
                <li>🔄 Try refreshing the page</li>
              </ul>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  if (step === 'instructions') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Speaking Exercise</h1>
          
          <div className="instructions-container">
            <div className="instruction-content">
              <h3>📋 How It Works:</h3>
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
          </div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📊 Speaking Results</h1>
          
          {finalStats && (
            <div className="test-results">
              <div className="test-stats">
                <div className="stat-item">
                  <div className="stat-value">{finalStats.averageScore}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{finalStats.completed}/{finalStats.total}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{finalStats.duration}</div>
                  <div className="stat-label">Minutes</div>
                </div>
              </div>
              
              <div className="results-list">
                {results.map((result, index) => (
                  <div key={index} className={`result-item ${result.score >= 80 ? 'success' : result.score >= 50 ? 'warning' : 'error'}`}>
                    <div className="result-content">
                      <div className="result-header">
                        <h4>Sentence {index + 1} ({result.level})</h4>
                        <div className={`result-score ${result.score >= 80 ? 'success' : result.score >= 50 ? 'warning' : 'error'}`}>
                          {result.score}%
                        </div>
                      </div>
                      <p><strong>Target:</strong> "{result.target}"</p>
                      <p><strong>You said:</strong> "{result.spoken || '(Skipped)'}"</p>
                      <p><strong>Word accuracy:</strong> {result.matched}/{result.total} words correct</p>
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
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
    );
  }

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

              {feedback && (
                <div className={`feedback ${feedback.includes('Perfect') || feedback.includes('Excellent') ? 'success' : 
                                         feedback.includes('Good') || feedback.includes('Well done') ? 'warning' : 'info'}`}>
                  {feedback}
                </div>
              )}

              <div className="recording-controls">
                {!isRecording ? (
                  <>
                    <button className="btn btn-primary btn-large" onClick={startRecording}>
                      🎤 Start Recording
                    </button>
                    <button className="btn btn-secondary" onClick={skipSentence}>
                      ⏭️ Skip This Sentence
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-danger btn-large" onClick={stopRecording}>
                      ⏹️ Stop Recording
                    </button>
                    <button className="btn btn-secondary" onClick={restartRecording}>
                      🔄 Restart
                    </button>
                  </>
                )}
                
                {/* Submit button appears when recording is stopped and transcript exists */}
                {!isRecording && transcript && (
                  <button className="btn btn-success btn-large" onClick={submitRecording}>
                    ✅ Submit Recording
                  </button>
                )}
              </div>

            </>
          )}

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
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
