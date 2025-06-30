// src/components/SpeakingExercise.js - Enhanced with Phase 1 speech recognition improvements
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';
import { recordTestResult } from '../utils/progressDataManager';

// Enhanced homophones with phonetic alternatives
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
  // Core state
  const [step, setStep] = useState('checking');
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  
  // NEW: Enhanced speech recognition state
  const [speechAlternatives, setSpeechAlternatives] = useState([]);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detailedAnalysis, setDetailedAnalysis] = useState(null);

  const recognitionRef = useRef(null);

  // ENHANCED: Phonetic similarity using simple Soundex algorithm
  const soundex = (word) => {
    if (!word) return '';
    word = word.toUpperCase();
    
    // Keep first letter
    let result = word[0];
    
    // Replace letters with numbers according to Soundex rules
    const replacements = {
      'B': '1', 'F': '1', 'P': '1', 'V': '1',
      'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
      'D': '3', 'T': '3',
      'L': '4',
      'M': '5', 'N': '5',
      'R': '6'
    };
    
    for (let i = 1; i < word.length; i++) {
      const char = word[i];
      if (replacements[char] && replacements[char] !== result[result.length - 1]) {
        result += replacements[char];
      }
    }
    
    // Pad with zeros or truncate to 4 characters
    return (result + '000').substring(0, 4);
  };

  // ENHANCED: Phonetic similarity scoring
  const getPhoneticSimilarity = (word1, word2) => {
    const soundex1 = soundex(word1);
    const soundex2 = soundex(word2);
    
    if (soundex1 === soundex2) return 100;
    
    // Partial similarity based on matching characters
    let matches = 0;
    for (let i = 0; i < Math.min(soundex1.length, soundex2.length); i++) {
      if (soundex1[i] === soundex2[i]) matches++;
    }
    
    return Math.round((matches / 4) * 80); // Max 80% for phonetic similarity
  };

  // ENHANCED: Advanced scoring with confidence and alternatives
  const calculateAdvancedScore = (spokenText, targetText, confidence, alternatives) => {
    const normalize = text => text.toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();
    const spokenWords = normalize(spokenText).split(' ').filter(w => w.length > 0);
    const targetWords = normalize(targetText).split(' ').filter(w => w.length > 0);
    
    if (spokenWords.length === 0) {
      return { 
        percentage: 0, 
        matched: 0, 
        total: targetWords.length,
        confidence: 0,
        analysis: { exact: 0, phonetic: 0, homophone: 0 }
      };
    }

    let exactMatches = 0;
    let phoneticMatches = 0;
    let homophoneMatches = 0;
    let alternativeMatches = 0;

    // Create word frequency maps
    const targetMap = {};
    targetWords.forEach(word => targetMap[word] = (targetMap[word] || 0) + 1);

    const spokenMap = {};
    spokenWords.forEach(word => spokenMap[word] = (spokenMap[word] || 0) + 1);

    // Score each target word
    Object.entries(targetMap).forEach(([targetWord, targetCount]) => {
      let bestScore = 0;
      let matchType = 'none';

      // 1. Check exact matches (including case variations)
      const exactCount = spokenMap[targetWord] || 0;
      if (exactCount > 0) {
        exactMatches += Math.min(targetCount, exactCount);
        bestScore = 100;
        matchType = 'exact';
      }

      // 2. Check homophones
      if (bestScore < 100 && HOMOPHONES[targetWord]) {
        for (const homophone of HOMOPHONES[targetWord]) {
          const homophoneCount = spokenMap[homophone] || 0;
          if (homophoneCount > 0) {
            homophoneMatches += Math.min(targetCount, homophoneCount);
            bestScore = Math.max(bestScore, 95);
            matchType = 'homophone';
            break;
          }
        }
      }

      // 3. Check phonetic similarity
      if (bestScore < 90) {
        let bestPhoneticScore = 0;
        Object.keys(spokenMap).forEach(spokenWord => {
          const phoneticScore = getPhoneticSimilarity(targetWord, spokenWord);
          if (phoneticScore > bestPhoneticScore && phoneticScore >= 70) {
            bestPhoneticScore = phoneticScore;
          }
        });
        
        if (bestPhoneticScore >= 70) {
          phoneticMatches += 1;
          bestScore = Math.max(bestScore, bestPhoneticScore * 0.9); // Slight penalty for phonetic
          matchType = 'phonetic';
        }
      }

      // 4. Check alternatives from speech recognition
      if (bestScore < 80 && alternatives && alternatives.length > 0) {
        for (const alt of alternatives) {
          const altWords = normalize(alt.text).split(' ');
          if (altWords.includes(targetWord)) {
            alternativeMatches += 1;
            bestScore = Math.max(bestScore, 85 * alt.confidence);
            matchType = 'alternative';
            break;
          }
        }
      }
    });

    // Calculate final score
    const totalMatches = exactMatches + (homophoneMatches * 0.95) + (phoneticMatches * 0.8) + (alternativeMatches * 0.75);
    let percentage = Math.round((totalMatches / targetWords.length) * 100);

    // Apply confidence bonus/penalty
    const confidenceMultiplier = Math.max(0.7, Math.min(1.2, confidence + 0.3));
    percentage = Math.round(percentage * confidenceMultiplier);

    // Length penalty for very long responses
    const lengthPenalty = spokenWords.length > (targetWords.length * 2.5) ? 15 : 0;
    percentage = Math.max(0, percentage - lengthPenalty);

    return { 
      percentage: Math.min(100, percentage), 
      matched: Math.round(totalMatches), 
      total: targetWords.length,
      confidence: Math.round(confidence * 100),
      analysis: { exact: exactMatches, phonetic: phoneticMatches, homophone: homophoneMatches, alternative: alternativeMatches },
      confidenceBonus: Math.round((confidenceMultiplier - 1) * 100)
    };
  };

  // Initialize sentences
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
    console.log(`✅ Loaded ${exerciseSentences.length} sentences for enhanced speaking exercise`);
    return exerciseSentences.length > 0;
  };

  // Check browser support
  const checkSpeechSupport = async () => {
    console.log('🎤 Checking enhanced speech recognition support...');
    
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

  // ENHANCED: Create speech recognition with advanced features
  const createEnhancedSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Enhanced configuration
    recognition.continuous = false; // Changed to false for better word-level analysis
    recognition.interimResults = true;
    recognition.lang = 'en-GB';
    recognition.maxAlternatives = 5; // NEW: Get multiple pronunciation attempts
    
    recognition.onstart = () => {
      console.log('🎤 Enhanced recording started');
      setIsRecording(true);
      setTranscript('');
      setSpeechAlternatives([]);
      setConfidence(0);
      setFeedback('Listening... speak clearly into your microphone');
      setIsProcessing(false);
    };

    recognition.onresult = (event) => {
      setIsProcessing(true);
      let finalText = '';
      let interimText = '';
      let bestConfidence = 0;
      const alternatives = [];

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          // Process all alternatives for final result
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
      setConfidence(bestConfidence);
      setSpeechAlternatives(alternatives);
      
      // Show real-time confidence
      if (bestConfidence > 0) {
        const confidencePercent = Math.round(bestConfidence * 100);
        setFeedback(`Recognition confidence: ${confidencePercent}% - ${finalText ? 'Processing...' : 'Keep speaking...'}`);
      }
      
      setIsProcessing(false);
    };

    recognition.onerror = (event) => {
      console.error('❌ Enhanced speech recognition error:', event.error);
      setIsRecording(false);
      setIsProcessing(false);
      
      const errorMessages = {
        'no-speech': 'No speech detected. Please speak louder and try again.',
        'audio-capture': 'Microphone error. Please check your microphone connection.',
        'not-allowed': 'Microphone access denied. Please allow access and refresh the page.',
        'network': 'Network error. Please check your internet connection.',
        'service-not-allowed': 'Speech service not allowed. Please try refreshing the page.',
        'bad-grammar': 'Speech not recognised. Please speak more clearly.'
      };
      
      setFeedback(errorMessages[event.error] || `Recognition error: ${event.error}. Please try again.`);
    };

    recognition.onend = () => {
      console.log('🎤 Enhanced recording ended');
      setIsRecording(false);
      setIsProcessing(false);
    };

    return recognition;
  };

  // Start enhanced recording
  const startRecording = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = createEnhancedSpeechRecognition();
    }

    try {
      recognitionRef.current.start();
      setFeedback('Starting microphone... Please wait');
    } catch (error) {
      console.error('Error starting enhanced recording:', error);
      setFeedback('Failed to start recording. Please try again.');
    }
  };

  // ENHANCED: Stop recording with advanced analysis
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const currentSentence = sentences[currentIndex];
    if (!currentSentence) return;

    setIsProcessing(true);

    // Use enhanced scoring
    const scoreData = calculateAdvancedScore(
      transcript.trim(), 
      currentSentence.text, 
      confidence, 
      speechAlternatives
    );

    const result = {
      target: currentSentence.text,
      spoken: transcript.trim(),
      score: scoreData.percentage,
      level: currentSentence.level,
      matched: scoreData.matched,
      total: scoreData.total,
      confidence: scoreData.confidence,
      analysis: scoreData.analysis,
      alternatives: speechAlternatives.slice(0, 3), // Keep top 3 alternatives
      confidenceBonus: scoreData.confidenceBonus
    };

    setResults(prev => [...prev, result]);
    setDetailedAnalysis(scoreData);

    // Enhanced feedback with detailed analysis
    const getDetailedFeedback = (score, analysis, confidence) => {
      let feedback = '';
      let emoji = '';
      
      if (score >= 95) {
        emoji = '🌟';
        feedback = 'Outstanding! Perfect pronunciation!';
      } else if (score >= 85) {
        emoji = '🎉';
        feedback = 'Excellent work! Very clear pronunciation!';
      } else if (score >= 70) {
        emoji = '👍';
        feedback = 'Well done! Good pronunciation!';
      } else if (score >= 50) {
        emoji = '📈';
        feedback = 'Good effort! Getting better!';
      } else {
        emoji = '💪';
        feedback = 'Keep practising! You can do this!';
      }

      // Add analysis details
      const details = [];
      if (analysis.exact > 0) details.push(`${analysis.exact} perfect matches`);
      if (analysis.homophone > 0) details.push(`${analysis.homophone} similar sounds`);
      if (analysis.phonetic > 0) details.push(`${analysis.phonetic} close pronunciations`);
      
      if (confidence > 0) {
        const confidenceText = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';
        details.push(`${confidenceText} confidence (${confidence}%)`);
      }

      return `${emoji} ${feedback} (${score}%)${details.length > 0 ? ' - ' + details.join(', ') : ''}`;
    };

    const detailedFeedback = getDetailedFeedback(scoreData.percentage, scoreData.analysis, scoreData.confidence);
    setFeedback(detailedFeedback);
    setIsProcessing(false);

    // Auto-advance with longer delay for complex feedback
    setTimeout(() => {
      if (currentIndex + 1 < sentences.length) {
        setCurrentIndex(prev => prev + 1);
        setTranscript('');
        setFeedback('');
        setSpeechAlternatives([]);
        setConfidence(0);
        setDetailedAnalysis(null);
      } else {
        finishExercise();
      }
    }, 4000); // Longer delay to read detailed feedback
  };

  // Skip sentence (unchanged)
  const skipSentence = () => {
    const currentSentence = sentences[currentIndex];
    if (!currentSentence) return;

    const result = {
      target: currentSentence.text,
      spoken: '',
      score: 0,
      level: currentSentence.level,
      matched: 0,
      total: currentSentence.text.split(' ').length,
      confidence: 0,
      analysis: { exact: 0, phonetic: 0, homophone: 0, alternative: 0 },
      alternatives: []
    };

    setResults(prev => [...prev, result]);
    setFeedback('Sentence skipped');

    setTimeout(() => {
      if (currentIndex + 1 < sentences.length) {
        setCurrentIndex(prev => prev + 1);
        setTranscript('');
        setFeedback('');
        setSpeechAlternatives([]);
        setConfidence(0);
        setDetailedAnalysis(null);
      } else {
        finishExercise();
      }
    }, 1000);
  };

  // Complete exercise (enhanced with new data)
  const finishExercise = () => {
    console.log('🏁 Completing enhanced speaking exercise');
    
    const testDuration = exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 1000) : 0;
    const averageScore = results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0;
    const averageConfidence = results.length > 0 ? results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length : 0;

    const userAnswers = results.map(result => ({
      answer: result.spoken || '',
      correct: result.score >= 70,
      score: result.score,
      level: result.level,
      confidence: result.confidence || 0,
      analysis: result.analysis || {}
    }));

    try {
      recordTestResult({
        quizType: 'speak-and-record',
        score: Math.round(averageScore / 10),
        totalQuestions: 10,
        completedAt: new Date(),
        timeSpent: testDuration,
        userAnswers: userAnswers,
        // NEW: Enhanced metrics
        averageConfidence: Math.round(averageConfidence),
        enhancedFeatures: true
      });

      console.log('✅ Enhanced speaking exercise completed');
      console.log(`📊 Average score: ${Math.round(averageScore)}%`);
      console.log(`🎯 Average confidence: ${Math.round(averageConfidence)}%`);
    } catch (error) {
      console.error('❌ Error recording progress:', error);
    }

    setStep('results');
  };

  // Play audio
  const playAudio = (audioFile) => {
    if (!audioFile) return;
    
    const audio = new Audio(`/${audioFile}`);
    audio.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  };

  // Start exercise
  const startExercise = () => {
    if (initializeSentences()) {
      setStep('exercise');
      setCurrentIndex(0);
      setResults([]);
      setExerciseStartTime(Date.now());
      setFeedback('');
      setSpeechAlternatives([]);
      setConfidence(0);
      setDetailedAnalysis(null);
    } else {
      setStep('error');
      setFeedback('No sentences available for this exercise.');
    }
  };

  // Restart recording
  const restartRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setTranscript('');
    setFeedback('Recording restarted - try again!');
    setSpeechAlternatives([]);
    setConfidence(0);
    setTimeout(() => setFeedback(''), 2000);
  };

  // Component mount effect
  useEffect(() => {
    checkSpeechSupport();
    
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
    averageConfidence: Math.round(results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length),
    completed: results.filter(r => r.spoken).length,
    total: sentences.length,
    totalExactMatches: results.reduce((sum, r) => sum + (r.analysis?.exact || 0), 0),
    totalPhoneticMatches: results.reduce((sum, r) => sum + (r.analysis?.phonetic || 0), 0),
    duration: exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 60) : 0
  } : null;

  // Error state
  if (step === 'error') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Enhanced Speaking Exercise</h1>
          <div className="error-message">
            <h3>❌ Setup Required</h3>
            <p>{feedback}</p>
            <div className="error-help">
              <h4>💡 Troubleshooting:</h4>
              <ul>
                <li>Ensure you're using Chrome, Edge, or Safari</li>
                <li>Check your microphone is connected and working</li>
                <li>Allow microphone access when prompted</li>
                <li>Try refreshing the page</li>
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

  // Instructions state
  if (step === 'instructions') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Enhanced Speaking Exercise</h1>
          
          <div className="speaking-instructions">
            <div className="feature-highlight">
              <h3>🆕 New Enhanced Features!</h3>
              <div className="feature-grid">
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span className="feature-text">Advanced pronunciation analysis</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span className="feature-text">Real-time confidence scoring</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔀</span>
                  <span className="feature-text">Multiple pronunciation alternatives</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎵</span>
                  <span className="feature-text">Phonetic similarity matching</span>
                </div>
              </div>
            </div>
            
            <h3>📋 How It Works:</h3>
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
                <span className="instruction-icon">📈</span>
                <span>Watch your confidence score in real-time</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⏹️</span>
                <span>Click "Stop Recording" when finished</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🧠</span>
                <span>Get detailed pronunciation analysis</span>
              </div>
            </div>
            
            <div className="tips-section">
              <h4>💡 Tips for Best Results:</h4>
              <ul>
                <li>Speak at a normal, steady pace</li>
                <li>Pronounce each word clearly and distinctly</li>
                <li>Use a quiet environment for best recognition</li>
                <li>The system now recognises similar-sounding words!</li>
                <li>Both British and American pronunciations are accepted</li>
              </ul>
            </div>
            
            <button className="btn btn-primary btn-large" onClick={startExercise}>
              🚀 Start Enhanced Speaking Exercise
            </button>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Results state
  if (step === 'results') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📊 Enhanced Speaking Results</h1>
          
          {finalStats && (
            <div className="enhanced-results-summary">
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-value">{finalStats.averageScore}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{finalStats.averageConfidence}%</div>
                  <div className="stat-label">Avg Confidence</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{finalStats.totalExactMatches}</div>
                  <div className="stat-label">Perfect Matches</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎵</div>
                  <div className="stat-value">{finalStats.totalPhoneticMatches}</div>
                  <div className="stat-label">Phonetic Matches</div>
                </div>
              </div>
              
              <div className="level-assessment">
                <h3>🎓 Performance Assessment</h3>
                <p>
                  {finalStats.averageScore >= 90 ? 'Outstanding pronunciation! You speak with excellent clarity and accuracy.' :
                   finalStats.averageScore >= 75 ? 'Very good pronunciation! Your speech is clear and easily understood.' :
                   finalStats.averageScore >= 60 ? 'Good pronunciation! With more practice, you\'ll improve further.' :
                   'Keep practising! Focus on speaking slowly and clearly.'}
                </p>
              </div>
            </div>
          )}

          <div className="detailed-results">
            <h3>📝 Detailed Analysis</h3>
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className={`result-item ${result.score >= 80 ? 'success' : result.score >= 50 ? 'warning' : 'error'}`}>
                  <div className="result-header">
                    <h4>Sentence {index + 1} ({result.level}): {result.score}%</h4>
                    <div className="result-confidence">
                      Confidence: {result.confidence || 0}%
                    </div>
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
                  <div className="result-content">
                    <p><strong>Target:</strong> "{result.target}"</p>
                    <p><strong>You said:</strong> "{result.spoken || '(Skipped)'}"</p>
                    <div className="match-analysis">
                      <strong>Analysis:</strong>
                      {result.analysis?.exact > 0 && <span className="match-badge exact">✅ {result.analysis.exact} perfect</span>}
                      {result.analysis?.homophone > 0 && <span className="match-badge homophone">🔄 {result.analysis.homophone} similar sound</span>}
                      {result.analysis?.phonetic > 0 && <span className="match-badge phonetic">🎵 {result.analysis.phonetic} close pronunciation</span>}
                      {result.analysis?.alternative > 0 && <span className="match-badge alternative">🎯 {result.analysis.alternative} alternative match</span>}
                    </div>
                    {result.alternatives && result.alternatives.length > 1 && (
                      <div className="alternatives">
                        <strong>Other possibilities heard:</strong>
                        <ul>
                          {result.alternatives.slice(1, 3).map((alt, altIndex) => (
                            <li key={altIndex}>"{alt.text}" ({Math.round(alt.confidence * 100)}% confidence)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
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
    );
  }

  // Exercise state
  if (step === 'exercise') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>🎤 Enhanced Speaking Exercise</h1>
          
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

              {/* Enhanced recording indicators */}
              {isRecording && (
                <div className="recording-indicator enhanced">
                  <div className="recording-pulse"></div>
                  <div className="recording-text">
                    🎤 Recording... Speak clearly!
                    {confidence > 0 && (
                      <div className="live-confidence">
                        Confidence: {Math.round(confidence * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="processing-indicator">
                  <div className="processing-spinner"></div>
                  <div className="processing-text">🧠 Analysing your pronunciation...</div>
                </div>
              )}

              {transcript && (
                <div className="transcript-display enhanced">
                  <div className="transcript-label">You said:</div>
                  <div className="transcript-text">"{transcript}"</div>
                  {confidence > 0 && (
                    <div className="confidence-indicator">
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill" 
                          style={{ 
                            width: `${confidence * 100}%`,
                            backgroundColor: confidence > 0.8 ? '#48bb78' : confidence > 0.6 ? '#ed8936' : '#f56565'
                          }}
                        ></div>
                      </div>
                      <span className="confidence-text">
                        {Math.round(confidence * 100)}% confidence
                      </span>
                    </div>
                  )}
                  {speechAlternatives.length > 1 && (
                    <div className="alternatives-preview">
                      <small>Also heard: {speechAlternatives.slice(1, 3).map(alt => `"${alt.text}"`).join(', ')}</small>
                    </div>
                  )}
                </div>
              )}

              {feedback && (
                <div className={`feedback-display ${feedback.includes('Outstanding') || feedback.includes('Excellent') ? 'success' : 
                                                   feedback.includes('Good') || feedback.includes('Well done') ? 'good' : 
                                                   feedback.includes('confidence') ? 'info' : 'neutral'}`}>
                  {feedback}
                </div>
              )}

              <div className="recording-controls enhanced">
                {!isRecording && !isProcessing ? (
                  <>
                    <button className="btn btn-primary btn-large" onClick={startRecording}>
                      🎤 Start Recording
                    </button>
                    <button className="btn btn-secondary" onClick={skipSentence}>
                      ⏭️ Skip This Sentence
                    </button>
                  </>
                ) : isRecording ? (
                  <>
                    <button className="btn btn-danger btn-large" onClick={stopRecording}>
                      ⏹️ Stop Recording
                    </button>
                    <button className="btn btn-secondary" onClick={restartRecording}>
                      🔄 Restart
                    </button>
                  </>
                ) : (
                  <div className="processing-message">
                    <span>🧠 Processing your speech with enhanced analysis...</span>
                  </div>
                )}
              </div>

              {currentSentence.audioFile && (
                <div className="sample-audio">
                  <button 
                    className="btn btn-small btn-outline"
                    onClick={() => playAudio(currentSentence.audioFile)}
                    title="Play sample pronunciation"
                  >
                    🔊 Play Sample Pronunciation
                  </button>
                </div>
              )}
            </>
          )}

          <button className="btn btn-secondary back-btn" onClick={onBack}>
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
        <h1>🎤 Enhanced Speaking Exercise</h1>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Checking enhanced speech recognition support...</p>
          <small>This may take a moment while we set up advanced features</small>
        </div>
      </div>
    </div>
  );
}

export default SpeakingExercise;
