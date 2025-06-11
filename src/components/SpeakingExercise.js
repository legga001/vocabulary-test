// src/components/SpeakingExercise.js - Fixed with proper word-based accuracy calculation
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ClickableLogo from './ClickableLogo';
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences';

// ==============================================
// HELPER FUNCTIONS - COMPLETELY REWRITTEN ACCURACY SYSTEM
// ==============================================

// Generate test sentences in proper order: A2 → B1 → B2 → C1
const generateSpeakingTest = () => {
  console.log('🎲 Starting sentence generation...');
  
  const testSentences = [];
  let sentenceCounter = 1;

  // Process each level in the correct order
  TEST_STRUCTURE.forEach(({ level, count }) => {
    console.log(`📚 Processing level ${level}, need ${count} sentences`);
    
    const availableSentences = SENTENCE_POOLS[level];
    if (!availableSentences || availableSentences.length === 0) {
      console.error(`❌ No sentences available for level ${level}`);
      return;
    }
    
    // Create a copy and shuffle
    const shuffled = [...availableSentences];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Take required sentences
    for (let i = 0; i < count && i < shuffled.length; i++) {
      const selectedSentence = shuffled[i];
      
      testSentences.push({
        id: sentenceCounter,
        level: level,
        audioFile: selectedSentence.audioFile,
        correctText: selectedSentence.correctText,
        difficulty: selectedSentence.difficulty || `${level} level sentence`
      });
      
      sentenceCounter++;
    }
  });

  console.log(`🎯 Generated ${testSentences.length} total sentences`);
  return testSentences;
};

// Enhanced text normalisation for better comparison
const normaliseText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    // Remove all punctuation but keep apostrophes for contractions
    .replace(/[.,!?;:"""''()[\]{}\-]/g, '')
    // Normalize contractions - expand them for better comparison
    .replace(/\b(can't|cannot)\b/g, 'can not')
    .replace(/\b(won't)\b/g, 'will not')
    .replace(/\b(n't)\b/g, ' not')
    .replace(/\b('ll)\b/g, ' will')
    .replace(/\b('ve)\b/g, ' have')
    .replace(/\b('re)\b/g, ' are')
    .replace(/\b('m)\b/g, ' am')
    .replace(/\b('d)\b/g, ' would')
    .replace(/\b('s)\b/g, ' is')
    // Handle common speech recognition errors
    .replace(/\bthree\b/g, '3')
    .replace(/\bseven\b/g, '7')
    .replace(/\bto\b/g, 'two') // Handle "to" vs "two" confusion
    .replace(/\btwo\b/g, 'to')   // Then swap back - this handles both directions
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ')
    .trim();
};

// Get word arrays for comparison
const getWordsArray = (text) => {
  const normalised = normaliseText(text);
  return normalised.split(' ').filter(word => word.length > 0);
};

// Check if two words are equivalent (handles speech-to-text errors, not user errors)
const areWordsEquivalent = (word1, word2) => {
  if (!word1 || !word2) return false;
  
  // Exact match - perfect
  if (word1 === word2) return true;
  
  // HOMOPHONES: These are speech-to-text errors, NOT user pronunciation errors
  // User said it correctly, but speech recognition wrote the wrong homophone
  const homophones = {
    // to/two/too family
    'to': ['two', 'too'],
    'two': ['to', 'too'], 
    'too': ['to', 'two'],
    
    // for/four family  
    'for': ['four', 'fore'],
    'four': ['for', 'fore'],
    'fore': ['for', 'four'],
    
    // there/their/they're family
    'there': ['their', 'theyre', 'they\'re'],
    'their': ['there', 'theyre', 'they\'re'],
    'theyre': ['there', 'their', 'they\'re'],
    'they\'re': ['there', 'their', 'theyre'],
    
    // your/you're family
    'your': ['youre', 'you\'re'],
    'youre': ['your', 'you\'re'],
    'you\'re': ['your', 'youre'],
    
    // its/it's family
    'its': ['it\'s'],
    'it\'s': ['its'],
    
    // no/know family
    'no': ['know'],
    'know': ['no'],
    
    // one/won family
    'one': ['won'],
    'won': ['one'],
    
    // right/write family
    'right': ['write'],
    'write': ['right'],
    
    // here/hear family
    'here': ['hear'],
    'hear': ['here'],
    
    // see/sea family
    'see': ['sea', 'c'],
    'sea': ['see'],
    'c': ['see', 'sea'],
    
    // be/bee family
    'be': ['bee', 'b'],
    'bee': ['be'],
    'b': ['be', 'bee'],
    
    // eight/ate family
    'eight': ['ate'],
    'ate': ['eight'],
    
    // break/brake family
    'break': ['brake'],
    'brake': ['break'],
    
    // buy/by/bye family
    'buy': ['by', 'bye'],
    'by': ['buy', 'bye'],
    'bye': ['buy', 'by'],
    
    // new/knew family
    'new': ['knew'],
    'knew': ['new'],
    
    // blue/blew family
    'blue': ['blew'],
    'blew': ['blue'],
    
    // Common single letter speech recognition errors
    'a': ['ay', 'eh'],
    'i': ['eye'],
    'you': ['u'],
    'are': ['r'],
    'why': ['y'],
    'oh': ['o'],
    'tea': ['t'],
    'and': ['n'], // sometimes recognised as just 'n'
    'at': ['@'], // sometimes recognised as symbol
    
    // Common contractions and expansions
    'okay': ['ok', 'k'],
    'cannot': ['can\'t', 'cant'],
    'can\'t': ['cannot', 'cant'],
    'cant': ['cannot', 'can\'t'],
    'will not': ['won\'t', 'wont'],
    'won\'t': ['will not', 'wont'],
    'wont': ['will not', 'won\'t']
  };
  
  // Check if words are homophones (speech-to-text error, user said it right)
  if (homophones[word1] && homophones[word1].includes(word2)) return true;
  if (homophones[word2] && homophones[word2].includes(word1)) return true;
  
  // Minor pronunciation variations (these are actual user pronunciation issues)
  // Only give partial credit for these, not full credit like homophones
  if (word1.length > 2 && word2.length > 2) {
    if (word1[0] === word2[0] && Math.abs(word1.length - word2.length) <= 1) {
      // Check if 80% of characters match (stricter than before)
      let matches = 0;
      const minLength = Math.min(word1.length, word2.length);
      for (let i = 0; i < minLength; i++) {
        if (word1[i] === word2[i]) matches++;
      }
      // This returns true for close pronunciation matches (not perfect like homophones)
      return (matches / minLength) >= 0.8;
    }
  }
  
  return false;
};

// NEW: Word-based accuracy calculation focused on correct words in correct order
const calculateWordAccuracy = (spokenText, correctText) => {
  console.log('🎯 Calculating word-based accuracy:');
  console.log('Spoken:', spokenText);
  console.log('Correct:', correctText);
  
  if (!spokenText || !correctText) {
    console.log('❌ Missing text, returning 0%');
    return 0;
  }
  
  const spokenWords = getWordsArray(spokenText);
  const correctWords = getWordsArray(correctText);
  
  console.log('Spoken words:', spokenWords);
  console.log('Correct words:', correctWords);
  
  if (correctWords.length === 0) {
    console.log('❌ No correct words, returning 0%');
    return 0;
  }
  
  // Perfect match check
  if (spokenWords.length === correctWords.length) {
    let perfectMatches = 0;
    for (let i = 0; i < correctWords.length; i++) {
      if (areWordsSimilar(spokenWords[i], correctWords[i])) {
        perfectMatches++;
      }
    }
    if (perfectMatches === correctWords.length) {
      console.log('✅ Perfect match! 100%');
      return 100;
    }
  }
  
  // Score based on correct words in correct positions
  let positionMatches = 0;
  let anyPositionMatches = 0;
  
  // First pass: count words in correct positions
  const maxLength = Math.max(spokenWords.length, correctWords.length);
  for (let i = 0; i < correctWords.length; i++) {
    if (i < spokenWords.length && areWordsEquivalent(spokenWords[i], correctWords[i])) {
      positionMatches++;
    }
  }
  
  // Second pass: count any correct words (even in wrong positions)
  const spokenWordsCopy = [...spokenWords];
  const correctWordsCopy = [...correctWords];
  
  // Remove position matches first
  for (let i = correctWordsCopy.length - 1; i >= 0; i--) {
    if (i < spokenWordsCopy.length && areWordsEquivalent(spokenWordsCopy[i], correctWordsCopy[i])) {
      spokenWordsCopy.splice(i, 1);
      correctWordsCopy.splice(i, 1);
    }
  }
  
  // Count remaining matches in any position
  let additionalMatches = 0;
  for (let correctWord of correctWordsCopy) {
    for (let j = 0; j < spokenWordsCopy.length; j++) {
      if (areWordsEquivalent(spokenWordsCopy[j], correctWord)) {
        additionalMatches++;
        spokenWordsCopy.splice(j, 1);
        break;
      }
    }
  }
  
  anyPositionMatches = positionMatches + additionalMatches;
  
  // Calculate score with heavy weighting towards correct order
  // 80% weight for position matches, 20% weight for any position matches
  const positionScore = (positionMatches / correctWords.length) * 80;
  const anyPositionScore = (anyPositionMatches / correctWords.length) * 20;
  
  // Penalty for extra words (speaking too much)
  let lengthPenalty = 0;
  if (spokenWords.length > correctWords.length) {
    const extraWords = spokenWords.length - correctWords.length;
    lengthPenalty = Math.min(extraWords * 5, 20); // Max 20% penalty
  }
  
  // Penalty for too few words
  if (spokenWords.length < correctWords.length * 0.5) {
    lengthPenalty += 30; // Major penalty for saying way too little
  }
  
  const finalScore = Math.max(0, Math.round(positionScore + anyPositionScore - lengthPenalty));
  
  console.log(`📊 Accuracy breakdown:
    - Position matches: ${positionMatches}/${correctWords.length} (${positionScore.toFixed(1)}%)
    - Any position matches: ${anyPositionMatches}/${correctWords.length} (${anyPositionScore.toFixed(1)}%)
    - Length penalty: ${lengthPenalty}%
    - Final score: ${finalScore}%`);
  
  return finalScore;
};

// Main accuracy calculation function - now simplified to just use word accuracy
const calculateAccuracy = (spokenText, correctText) => {
  return calculateWordAccuracy(spokenText, correctText);
};

// Get accuracy level description
const getAccuracyLevel = (accuracy) => {
  if (accuracy >= 90) return { level: 'Excellent', emoji: '🌟', color: '#48bb78' };
  if (accuracy >= 75) return { level: 'Very Good', emoji: '👍', color: '#38a169' };
  if (accuracy >= 60) return { level: 'Good', emoji: '✅', color: '#ed8936' };
  if (accuracy >= 40) return { level: 'Needs Practice', emoji: '📚', color: '#d69e2e' };
  return { level: 'Try Again', emoji: '🔄', color: '#e53e3e' };
};

// Detect iOS
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// ==============================================
// MAIN COMPONENT
// ==============================================
function SpeakingExercise({ onBack, onLogoClick }) {
  // State management
  const [currentSentence, setCurrentSentence] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [testSentences, setTestSentences] = useState([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitialised, setIsInitialised] = useState(false);
  const [microphoneStatus, setMicrophoneStatus] = useState('unknown'); // 'granted', 'denied', 'unknown'
  const [isIOS, setIsIOS] = useState(false);
  const [speechRecognitionReady, setSpeechRecognitionReady] = useState(false);
  const [interimText, setInterimText] = useState(''); // Show real-time speech

  // Refs
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const microphoneStreamRef = useRef(null);

  // Get current sentence data
  const currentData = testSentences && testSentences.length > 0 && currentSentence >= 0 && currentSentence < testSentences.length 
    ? testSentences[currentSentence] 
    : null;

  // ==============================================
  // MICROPHONE AND SPEECH RECOGNITION SETUP
  // ==============================================
  
  // Test microphone access
  const testMicrophoneAccess = useCallback(async () => {
    console.log('🎤 Testing microphone access...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      console.log('✅ Microphone access granted');
      microphoneStreamRef.current = stream;
      setMicrophoneStatus('granted');
      
      // Test audio levels
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      console.log('🔊 Audio context created successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Microphone access error:', error);
      setMicrophoneStatus('denied');
      setErrorMessage(`Microphone access denied: ${error.message}`);
      return false;
    }
  }, []);

  // Setup speech recognition with enhanced error handling
  const setupSpeechRecognition = useCallback(() => {
    console.log('🎙️ Setting up speech recognition...');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('❌ Speech recognition not supported');
      setErrorMessage('Speech recognition is not supported in this browser');
      return false;
    }

    try {
      // Clean up any existing recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        } catch (e) {
          console.log('Cleaned up previous recognition');
        }
      }

      recognitionRef.current = new SpeechRecognition();
      
      // Enhanced configuration
      recognitionRef.current.continuous = true; // Keep listening
      recognitionRef.current.interimResults = true; // Show real-time results
      recognitionRef.current.lang = 'en-GB'; // British English
      recognitionRef.current.maxAlternatives = 1;
      
      // Event handlers with better logging
      recognitionRef.current.onstart = () => {
        console.log('▶️ Speech recognition STARTED');
        setIsRecording(true);
        setInterimText('');
        setSpokenText('');
        setErrorMessage('');
      };
      
      recognitionRef.current.onresult = (event) => {
        console.log('🎙️ Speech recognition result received');
        console.log('Event results:', event.results);
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
            console.log('📝 Final transcript:', transcript);
          } else {
            interimTranscript += transcript;
            console.log('📝 Interim transcript:', transcript);
          }
        }
        
        // Update interim text for real-time display
        if (interimTranscript) {
          setInterimText(interimTranscript);
        }
        
        // If we have a final result, process it
        if (finalTranscript) {
          console.log('✅ Processing final transcript:', finalTranscript);
          setSpokenText(finalTranscript);
          setInterimText('');
          
          // Stop recording and process result
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          
          // Calculate accuracy with current sentence
          if (currentData && currentData.correctText) {
            console.log('🎯 Calculating accuracy with:', currentData.correctText);
            const accuracy = calculateAccuracy(finalTranscript, currentData.correctText);
            setCurrentAccuracy(accuracy);
            setShowFeedback(true);
          } else {
            console.error('❌ No current data for accuracy calculation');
            setErrorMessage('No sentence data available for comparison');
          }
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsRecording(false);
        setInterimText('');
        
        let errorMsg = '';
        switch (event.error) {
          case 'no-speech':
            errorMsg = 'No speech detected. Please try speaking louder and clearer.';
            break;
          case 'audio-capture':
            errorMsg = 'Microphone not accessible. Please check your microphone connection.';
            break;
          case 'not-allowed':
            errorMsg = isIOS 
              ? 'Microphone access denied. Please go to Settings > Safari > Microphone and allow access.'
              : 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'network':
            errorMsg = 'Network error. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMsg = 'Speech recognition service not available.';
            break;
          case 'bad-grammar':
            errorMsg = 'Speech recognition grammar error.';
            break;
          case 'language-not-supported':
            errorMsg = 'Language not supported by speech recognition.';
            break;
          default:
            errorMsg = `Speech recognition error: ${event.error}`;
        }
        
        setErrorMessage(errorMsg);
        setSpokenText(`Error: ${event.error}`);
      };
      
      recognitionRef.current.onend = () => {
        console.log('🛑 Speech recognition ENDED');
        setIsRecording(false);
        setInterimText('');
      };
      
      recognitionRef.current.onspeechstart = () => {
        console.log('🗣️ Speech detected!');
      };
      
      recognitionRef.current.onspeechend = () => {
        console.log('🤐 Speech ended');
      };
      
      recognitionRef.current.onsoundstart = () => {
        console.log('🔊 Sound detected');
      };
      
      recognitionRef.current.onsoundend = () => {
        console.log('🔇 Sound ended');
      };
      
      setSpeechRecognitionReady(true);
      console.log('✅ Speech recognition setup complete');
      return true;
      
    } catch (error) {
      console.error('❌ Error setting up speech recognition:', error);
      setErrorMessage(`Failed to setup speech recognition: ${error.message}`);
      return false;
    }
  }, [currentData, isIOS]);

  // ==============================================
  // EFFECTS
  // ==============================================
  
  // Initial setup
  useEffect(() => {
    console.log('🚀 Initialising speaking exercise...');
    
    // Detect device
    const iosDetected = isIOSDevice();
    setIsIOS(iosDetected);
    console.log('Device:', iosDetected ? 'iOS' : 'Other');
    
    // Generate test sentences
    if (!SENTENCE_POOLS || !TEST_STRUCTURE) {
      setErrorMessage('Missing sentence data imports');
      return;
    }
    
    try {
      const sentences = generateSpeakingTest();
      if (!sentences || sentences.length === 0) {
        setErrorMessage('Failed to generate test sentences');
        return;
      }
      
      setTestSentences(sentences);
      setIsInitialised(true);
      console.log('✅ Test sentences ready');
      
    } catch (error) {
      console.error('❌ Error in initial setup:', error);
      setErrorMessage(`Setup error: ${error.message}`);
    }
    
    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      console.log('✅ Speech recognition supported');
    } else {
      setSpeechSupported(false);
      console.log('❌ Speech recognition not supported');
    }
    
  }, []);

  // Timer countdown
  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !showResults && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasStarted && !showResults && !showFeedback) {
      handleTimeUp();
    }
  }, [timeLeft, hasStarted, showResults, showFeedback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Cleanup: recognition already stopped');
        }
      }
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // ==============================================
  // HANDLERS
  // ==============================================
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startExercise = useCallback(async () => {
    console.log('🚀 Starting exercise...');
    
    if (testSentences.length === 0) {
      setErrorMessage('No sentences available');
      return;
    }
    
    // Test microphone first
    console.log('🎤 Testing microphone access...');
    const micWorking = await testMicrophoneAccess();
    if (!micWorking) {
      console.error('❌ Microphone test failed');
      return;
    }
    
    // Setup speech recognition
    console.log('🎙️ Setting up speech recognition...');
    const speechSetup = setupSpeechRecognition();
    if (!speechSetup) {
      console.error('❌ Speech recognition setup failed');
      return;
    }
    
    setHasStarted(true);
    setTimeLeft(45);
    setErrorMessage('');
    console.log('✅ Exercise started successfully');
    
  }, [testSentences.length, testMicrophoneAccess, setupSpeechRecognition]);

  const startRecording = useCallback(() => {
    console.log('🎙️ Start recording button clicked');
    console.log('Current data:', currentData);
    console.log('Speech recognition ready:', speechRecognitionReady);
    console.log('Recognition ref:', !!recognitionRef.current);
    
    if (!speechSupported || !recognitionRef.current) {
      setErrorMessage('Speech recognition not available');
      return;
    }
    
    if (!currentData) {
      setErrorMessage('No sentence data available');
      return;
    }
    
    if (microphoneStatus !== 'granted') {
      setErrorMessage('Microphone access required. Please grant permission.');
      return;
    }
    
    setErrorMessage('');
    setSpokenText('');
    setInterimText('');
    setShowFeedback(false);
    
    try {
      console.log('🎯 Starting speech recognition...');
      recognitionRef.current.start();
      console.log('✅ Speech recognition start command sent');
    } catch (error) {
      console.error('❌ Error starting recognition:', error);
      setErrorMessage(`Failed to start recording: ${error.message}`);
      setIsRecording(false);
    }
  }, [speechSupported, currentData, microphoneStatus, speechRecognitionReady]);

  const stopRecording = useCallback(() => {
    console.log('🛑 Stop recording button clicked');
    
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        console.log('✅ Speech recognition stop command sent');
      } catch (error) {
        console.error('❌ Error stopping recognition:', error);
      }
    }
  }, [isRecording]);

  const playCorrectAudio = useCallback(() => {
    if (!audioRef.current || !currentData) return;
    
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('❌ Error playing audio:', error);
      });
    } catch (error) {
      console.error('❌ Error in playCorrectAudio:', error);
    }
  }, [currentData]);

  const handleTimeUp = useCallback(() => {
    console.log('⏰ Time is up!');
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setSpokenText('Time is up!');
    setCurrentAccuracy(0);
    setShowFeedback(true);
  }, [isRecording]);

  const handleNext = useCallback(() => {
    console.log('➡️ Moving to next question...');
    
    if (!currentData) {
      setErrorMessage('No current data for next question');
      return;
    }

    const answerData = {
      sentence: currentData,
      spokenText: spokenText || 'No speech detected',
      accuracy: currentAccuracy,
      timeTaken: 45 - timeLeft
    };
    
    setAnswers(prev => [...prev, answerData]);

    if (currentSentence + 1 < testSentences.length) {
      setCurrentSentence(prev => prev + 1);
      setSpokenText('');
      setInterimText('');
      setTimeLeft(45);
      setIsRecording(false);
      setShowFeedback(false);
      setCurrentAccuracy(0);
      setErrorMessage('');
    } else {
      setShowResults(true);
    }
  }, [currentData, spokenText, currentAccuracy, timeLeft, currentSentence, testSentences.length]);

  const calculateOverallScore = useCallback(() => {
    if (answers.length === 0) return { average: 0, total: 0 };
    
    const totalAccuracy = answers.reduce((sum, answer) => sum + (answer.accuracy || 0), 0);
    const average = Math.round(totalAccuracy / answers.length);
    
    const excellent = answers.filter(a => a.accuracy >= 90).length;
    const veryGood = answers.filter(a => a.accuracy >= 75 && a.accuracy < 90).length;
    const good = answers.filter(a => a.accuracy >= 60 && a.accuracy < 75).length;
    const needsPractice = answers.filter(a => a.accuracy >= 40 && a.accuracy < 60).length;
    const tryAgain = answers.filter(a => a.accuracy < 40).length;
    
    return { 
      average,
      total: answers.length,
      breakdown: { excellent, veryGood, good, needsPractice, tryAgain }
    };
  }, [answers]);

  const restartTest = useCallback(() => {
    console.log('🔄 Restarting test...');
    
    // Stop any ongoing recording
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    
    setCurrentSentence(0);
    setSpokenText('');
    setInterimText('');
    setTimeLeft(45);
    setShowResults(false);
    setAnswers([]);
    setIsRecording(false);
    setHasStarted(false);
    setShowFeedback(false);
    setCurrentAccuracy(0);
    setErrorMessage('');
    setSpeechRecognitionReady(false);
    
    // Generate new sentences
    try {
      const newSentences = generateSpeakingTest();
      setTestSentences(newSentences);
      setIsInitialised(true);
    } catch (error) {
      setErrorMessage(`Error restarting: ${error.message}`);
    }
  }, [isRecording]);

  // ==============================================
  // RENDER CONDITIONS
  // ==============================================

  // Loading state
  if (!isInitialised || (testSentences.length === 0 && !errorMessage)) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice</h1>
          
          <div className="loading-message">
            <p>🎲 Preparing your speaking test...</p>
            <p><small>Setting up microphone and speech recognition...</small></p>
            
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                background: '#f0f0f0',
                padding: '10px',
                margin: '10px 0',
                borderRadius: '5px',
                fontSize: '0.8em',
                textAlign: 'left'
              }}>
                <strong>🔧 Debug Info:</strong><br />
                Device: {isIOS ? 'iOS' : 'Other'}<br />
                Initialised: {isInitialised ? 'Yes' : 'No'}<br />
                Sentences: {testSentences.length}<br />
                Speech Supported: {speechSupported ? 'Yes' : 'No'}<br />
                Microphone Status: {microphoneStatus}<br />
                Recognition Ready: {speechRecognitionReady ? 'Yes' : 'No'}
              </div>
            )}
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (errorMessage && testSentences.length === 0) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice</h1>
          
          <div className="error-message">
            <h3>⚠️ Setup Error</h3>
            <p>{errorMessage}</p>
            
            {isIOS && microphoneStatus === 'denied' && (
              <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
                <strong>📱 iPad/iPhone Help:</strong>
                <ol style={{ textAlign: 'left', marginTop: '10px' }}>
                  <li>Go to Settings → Safari → Microphone</li>
                  <li>Select "Allow"</li>
                  <li>Refresh this page</li>
                  <li>Grant permission when prompted</li>
                </ol>
              </div>
            )}
            
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              🔄 Refresh Page
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Speech not supported
  if (!speechSupported) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice</h1>
          
          <div className="error-message">
            <h3>⚠️ Speech Recognition Not Available</h3>
            <p>Your browser doesn't support speech recognition.</p>
            <p><strong>Supported browsers:</strong></p>
            <ul style={{ textAlign: 'left' }}>
              <li>✅ Google Chrome (recommended)</li>
              <li>✅ Microsoft Edge</li>
              <li>✅ Safari (newer versions)</li>
              <li>❌ Firefox (limited support)</li>
            </ul>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Results state
  if (showResults) {
    const score = calculateOverallScore();
    
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice Results</h1>
          
          <div className="results">
            <h2>🎉 Test Complete!</h2>
            <div className="score-display">{score.average}%</div>
            <div className="score-subtitle">Average Accuracy</div>
            
            <div className="speaking-breakdown">
              <div className="breakdown-item excellent">
                <span className="breakdown-icon">🌟</span>
                <span className="breakdown-count">{score.breakdown.excellent}</span>
                <span className="breakdown-label">Excellent</span>
              </div>
              <div className="breakdown-item very-good">
                <span className="breakdown-icon">👍</span>
                <span className="breakdown-count">{score.breakdown.veryGood}</span>
                <span className="breakdown-label">Very Good</span>
              </div>
              <div className="breakdown-item good">
                <span className="breakdown-icon">✅</span>
                <span className="breakdown-count">{score.breakdown.good}</span>
                <span className="breakdown-label">Good</span>
              </div>
              <div className="breakdown-item needs-practice">
                <span className="breakdown-icon">📚</span>
                <span className="breakdown-count">{score.breakdown.needsPractice}</span>
                <span className="breakdown-label">Needs Practice</span>
              </div>
              <div className="breakdown-item try-again">
                <span className="breakdown-icon">🔄</span>
                <span className="breakdown-count">{score.breakdown.tryAgain}</span>
                <span className="breakdown-label">Try Again</span>
              </div>
            </div>
            
            <div className="level-estimate">
              <h3>Speaking Assessment</h3>
              <p>
                {score.average >= 85 ? "Outstanding pronunciation! Your speech clarity is excellent." :
                 score.average >= 70 ? "Great speaking skills! Keep practising for even better clarity." :
                 score.average >= 55 ? "Good effort! Focus on clear pronunciation and pacing." :
                 "Keep practising! Speak slowly and clearly for better recognition."}
              </p>
            </div>

            <div className="detailed-results">
              <h3>📝 Detailed Results:</h3>
              <div className="results-list">
                {answers.map((answer, index) => {
                  const accuracyInfo = getAccuracyLevel(answer.accuracy);
                  
                  return (
                    <div key={index} className="result-item">
                      <div className="result-header">
                        <span className="result-emoji">{accuracyInfo.emoji}</span>
                        <span className="result-level">{answer.sentence.level}</span>
                        <span className="result-number">#{index + 1}</span>
                        <span className="result-accuracy" style={{ color: accuracyInfo.color }}>
                          {answer.accuracy}%
                        </span>
                      </div>
                      <div className="result-content">
                        <div className="result-status">
                          <strong>{accuracyInfo.level}</strong>
                        </div>
                        <div className="correct-text">
                          <strong>Target:</strong> "{answer.sentence.correctText}"
                        </div>
                        <div className="spoken-text">
                          <strong>You said:</strong> "{answer.spokenText}"
                        </div>
                        <div className="time-taken">
                          Time taken: {answer.timeTaken} seconds
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={restartTest}>
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

  // Instructions state
  if (!hasStarted) {
    return (
      <div className="speaking-container">
        <div className="speaking-quiz-container">
          <ClickableLogo onLogoClick={onLogoClick} />
          
          <h1>🎤 Speaking Practice</h1>
          
          <div className="instructions-container">
            <div className="instruction-content">
              <h3>📋 Instructions</h3>
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="instruction-icon">👀</span>
                  <span>Read the sentence displayed on screen</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎤</span>
                  <span>Click record and speak clearly into your microphone</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⏱️</span>
                  <span>You have 45 seconds per sentence</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎯</span>
                  <span>Aim for clear pronunciation and natural pacing</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🔊</span>
                  <span>Listen to the sample audio after each attempt</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">📊</span>
                  <span>Get instant feedback on your pronunciation accuracy</span>
                </div>
              </div>
              
              <div className="difficulty-info">
                <h4>📊 Test Structure</h4>
                <p>Structured progression through difficulty levels:</p>
                <ul>
                  <li>2 A2 level sentences (elementary)</li>
                  <li>3 B1 level sentences (intermediate)</li>
                  <li>3 B2 level sentences (upper-intermediate)</li>
                  <li>2 C1 level sentences (advanced)</li>
                </ul>
                <p style={{ fontSize: '0.9em', fontStyle: 'italic', marginTop: '10px' }}>
                  Sentences get progressively more complex!
                </p>
              </div>
              
              <div className="microphone-info">
                <h4>🎤 New Improved Accuracy</h4>
                <p>This exercise now uses word-based accuracy scoring for more realistic results.</p>
                <ul style={{ textAlign: 'left', fontSize: '0.9em', marginTop: '10px' }}>
                  <li>✅ Words in correct order get highest marks</li>
                  <li>⚡ Handles speech recognition variations</li>
                  <li>📊 Realistic percentage scores</li>
                  <li>🎯 Rewards accuracy over speed</li>
                </ul>
                {isIOS && (
                  <p style={{ fontSize: '0.9em', color: '#d69e2e', fontWeight: '600', marginTop: '10px' }}>
                    📱 iPad/iPhone: Grant microphone permission when prompted by Safari.
                  </p>
                )}
              </div>
              
              {/* Enhanced debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{
                  background: microphoneStatus === 'granted' ? '#e6ffe6' : '#ffe6e6',
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '5px',
                  fontSize: '0.8em',
                  textAlign: 'left'
                }}>
                  <strong>🔧 System Check:</strong><br />
                  Device: {isIOS ? 'iOS' : 'Other'}<br />
                  Sentences: {testSentences.length} ready<br />
                  Speech Recognition: {speechSupported ? '✅ Supported' : '❌ Not supported'}<br />
                  Microphone: {microphoneStatus === 'granted' ? '✅ Granted' : microphoneStatus === 'denied' ? '❌ Denied' : '⏳ Not tested'}<br />
                  Recognition Ready: {speechRecognitionReady ? '✅ Ready' : '⏳ Not setup'}<br />
                  Current Data: {currentData ? '✅ Available' : '❌ Missing'}
                </div>
              )}
            </div>
            
            <button className="btn btn-primary btn-large" onClick={startExercise}>
              🎤 Start Speaking Practice
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Main test interface
  return (
    <div className="speaking-container">
      <div className="speaking-quiz-container">
        {/* Header with timer */}
        <div className="speaking-header">
          <div className="timer-section">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text" style={{ color: timeLeft <= 10 ? '#e53e3e' : '#4c51bf' }}>
              {formatTime(timeLeft)} for this question
            </span>
          </div>
          <div className="progress-section">
            Question {currentSentence + 1} of {testSentences.length}
          </div>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>

        {/* Real-time status display */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: isRecording ? '#e6ffe6' : '#f0f0f0',
            padding: '8px',
            margin: '8px 0',
            borderRadius: '4px',
            fontSize: '0.75em',
            textAlign: 'center'
          }}>
            🔧 <strong>Live Status:</strong> Recording: {isRecording ? '🔴 ON' : '⚫ OFF'} | 
            Mic: {microphoneStatus} | 
            Speech Ready: {speechRecognitionReady ? '✅' : '❌'} | 
            Current Data: {currentData ? '✅' : '❌'}
          </div>
        )}

        {/* Main content */}
        <div className="speaking-main">
          <div className="level-indicator">
            <span className="level-badge">{currentData?.level || 'Loading'}</span>
            <span className="level-description">{currentData?.difficulty || 'Preparing...'}</span>
          </div>

          <div className="speaking-instruction">
            <h2>Record yourself saying the statement below</h2>
          </div>

          {/* Character with speech bubble */}
          <div className="character-section">
            <div className="character">🎭</div>
            <div className="speech-bubble">
              "{currentData?.correctText || 'Loading sentence...'}"
            </div>
          </div>

          {/* Real-time speech display */}
          {(isRecording || interimText || spokenText) && (
            <div style={{
              background: '#f0f2ff',
              border: '2px solid #4c51bf',
              borderRadius: '10px',
              padding: '15px',
              margin: '20px 0',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#4c51bf' }}>
                {isRecording ? '🎤 Listening...' : '📝 You said:'}
              </h4>
              <div style={{
                fontSize: '1.1em',
                fontWeight: '600',
                color: '#2d3748',
                minHeight: '1.5em'
              }}>
                {isRecording && interimText ? (
                  <span style={{ color: '#666', fontStyle: 'italic' }}>"{interimText}"</span>
                ) : spokenText ? (
                  <span>"{spokenText}"</span>
                ) : isRecording ? (
                  <span style={{ color: '#999' }}>Speak now...</span>
                ) : (
                  <span style={{ color: '#999' }}>Click record to start</span>
                )}
              </div>
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="error-message" style={{ margin: '20px 0', padding: '15px' }}>
              <h4>⚠️ Error</h4>
              <p>{errorMessage}</p>
              <button className="btn btn-secondary btn-small" onClick={() => setErrorMessage('')}>
                Clear Error
              </button>
            </div>
          )}

          {/* Recording controls */}
          <div className="recording-section">
            {!showFeedback ? (
              <button 
                className={`record-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={timeLeft === 0 || !currentData || microphoneStatus !== 'granted'}
              >
                <span className="record-icon">
                  {isRecording ? '⏹️' : '🎤'}
                </span>
                <span className="record-text">
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </span>
              </button>
            ) : (
              <div className="feedback-section">
                <div className="accuracy-display">
                  <div className="accuracy-score" style={{ color: getAccuracyLevel(currentAccuracy).color }}>
                    {currentAccuracy}%
                  </div>
                  <div className="accuracy-level">
                    {getAccuracyLevel(currentAccuracy).emoji} {getAccuracyLevel(currentAccuracy).level}
                  </div>
                </div>
                
                <div className="feedback-text">
                  <div className="recognition-result">
                    <strong>You said:</strong> "{spokenText}"
                  </div>
                  
                  {/* Show word-by-word comparison in development */}
                  {process.env.NODE_ENV === 'development' && currentData && (
                    <div style={{
                      background: '#f8f9fa',
                      padding: '10px',
                      margin: '10px 0',
                      borderRadius: '5px',
                      fontSize: '0.8em',
                      textAlign: 'left'
                    }}>
                      <strong>🔧 Word Analysis:</strong><br />
                      Target: {getWordsArray(currentData.correctText).join(' | ')}<br />
                      Spoken: {getWordsArray(spokenText).join(' | ')}<br />
                      Score: {currentAccuracy}% (Word-based accuracy)
                    </div>
                  )}
                </div>
                
                <div className="sample-section">
                  <div className="sample-header">Nice! Review the sample:</div>
                  <div className="sample-controls">
                    <audio ref={audioRef} preload="auto">
                      <source src={`/${currentData?.audioFile}`} type="audio/mpeg" />
                    </audio>
                    
                    <button className="sample-btn" onClick={playCorrectAudio}>
                      <span className="sample-icon">🔊</span>
                      <span className="sample-text">SAMPLE</span>
                    </button>
                    
                    <button className="continue-btn" onClick={handleNext}>
                      CONTINUE
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status messages */}
          {isRecording && (
            <div className="recording-indicator">
              🔴 Recording... Speak clearly!
            </div>
          )}
          
          {microphoneStatus !== 'granted' && (
            <div style={{
              background: '#fff3cd',
              padding: '10px',
              borderRadius: '5px',
              margin: '10px 0',
              fontSize: '0.9em'
            }}>
              🎤 Microphone access required to record your voice
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpeakingExercise;
