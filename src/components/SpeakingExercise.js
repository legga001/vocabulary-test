// src/components/SpeakingExercise.js - Backend enhanced, frontend unchanged - FIXED
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
  
  let result = word[0];
  
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
    
    if (code && code !== prev) {
      result += code;
      if (result.length === 4) break;
    }
    prev = code || prev;
  }
  
  return (result + '000').substring(0, 4);
};

// ENHANCED: Phonetic similarity scoring
const getPhoneticSimilarity = (word1, word2) => {
  const soundex1 = advancedSoundex(word1);
  const soundex2 = advancedSoundex(word2);
  
  if (soundex1 === soundex2) return 90;
  
  let matches = 0;
  const minLength = Math.min(soundex1.length, soundex2.length);
  for (let i = 0; i < minLength; i++) {
    if (soundex1[i] === soundex2[i]) matches++;
  }
  
  const similarity = (matches / 4) * 80;
  return similarity >= 40 ? similarity : 0;
};

// ENHANCED: Proper contraction handling
const CONTRACTIONS = {
  // Positive contractions
  'im': ['i am'], 'youre': ['you are'], 'hes': ['he is', 'he has'], 'shes': ['she is', 'she has'],
  'its': ['it is', 'it has'], 'were': ['we are'], 'theyre': ['they are'], 'thats': ['that is'],
  'whats': ['what is'], 'wheres': ['where is'], 'whos': ['who is'], 'hows': ['how is'],
  'ill': ['i will'], 'youll': ['you will'], 'hell': ['he will'], 'shell': ['she will'],
  'well': ['we will'], 'theyll': ['they will'], 'itll': ['it will'],
  
  // Negative contractions - VERY SPECIFIC
  'dont': ['do not'], 'doesnt': ['does not'], 'didnt': ['did not'],
  'wont': ['will not'], 'wouldnt': ['would not'], 'couldnt': ['could not'],
  'shouldnt': ['should not'], 'cant': ['can not', 'cannot'], 'isnt': ['is not'],
  'arent': ['are not'], 'wasnt': ['was not'], 'werent': ['were not'],
  'hasnt': ['has not'], 'havent': ['have not'], 'hadnt': ['had not'],
  
  // Reverse mappings
  'i am': ['im'], 'you are': ['youre'], 'he is': ['hes'], 'she is': ['shes'],
  'it is': ['its'], 'we are': ['were'], 'they are': ['theyre'], 'that is': ['thats'],
  'do not': ['dont'], 'does not': ['doesnt'], 'did not': ['didnt'],
  'will not': ['wont'], 'would not': ['wouldnt'], 'could not': ['couldnt'],
  'should not': ['shouldnt'], 'can not': ['cant'], 'cannot': ['cant'],
  'is not': ['isnt'], 'are not': ['arent'], 'was not': ['wasnt'],
  'were not': ['werent'], 'has not': ['hasnt'], 'have not': ['havent'],
  'had not': ['hadnt']
};

// Function to check if contractions match their expansions
const checkContractionMatch = (spoken, target) => {
  const spokenLower = spoken.toLowerCase().replace(/[']/g, '');
  const targetLower = target.toLowerCase().replace(/[']/g, '');
  
  // Check if spoken contraction matches target expansion or vice versa
  if (CONTRACTIONS[spokenLower] && CONTRACTIONS[spokenLower].includes(targetLower)) {
    return 100; // Perfect match for correct contraction/expansion
  }
  if (CONTRACTIONS[targetLower] && CONTRACTIONS[targetLower].includes(spokenLower)) {
    return 100; // Perfect match for correct expansion/contraction
  }
  
  return 0; // No match
};
// ENHANCED: Check for common speech recognition errors (updated)
const checkCommonErrors = (spoken, target) => {
  const spokenLower = spoken.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // First check contractions specifically
  const contractionMatch = checkContractionMatch(spoken, target);
  if (contractionMatch > 0) return contractionMatch;
  
  // Common substitutions that speech recognition makes (NOT contractions)
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
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  if (maxLen === 0) return 100;
  
  const similarity = ((maxLen - matrix[len1][len2]) / maxLen) * 100;
  return similarity >= 60 ? similarity : 0;
};

function SpeakingExercise({ onBack, onLogoClick }) {
  const [step, setStep] = useState('checking');
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  const [speechAlternatives, setSpeechAlternatives] = useState([]);
  const [confidenceScore, setConfidenceScore] = useState(0);

  const recognitionRef = useRef(null);

  // ENHANCED: Much more sophisticated scoring algorithm - FIXED
  const calculateScore = (spoken, target) => {
    const normalize = text => text.toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();
    const spokenWords = normalize(spoken).split(' ').filter(w => w.length > 0);
    const targetWords = normalize(target).split(' ').filter(w => w.length > 0);
    
    if (spokenWords.length === 0) return { percentage: 0, matched: 0, total: targetWords.length };

    let exactMatches = 0;
    let totalWords = targetWords.length;
    
    // FIXED: More accurate word-by-word comparison
    const targetUsed = new Array(targetWords.length).fill(false);
    const spokenUsed = new Array(spokenWords.length).fill(false);
    
    // First pass: exact matches
    for (let i = 0; i < targetWords.length; i++) {
      for (let j = 0; j < spokenWords.length; j++) {
        if (!targetUsed[i] && !spokenUsed[j] && targetWords[i] === spokenWords[j]) {
          exactMatches++;
          targetUsed[i] = true;
          spokenUsed[j] = true;
          break;
        }
      }
    }
    
    // Second pass: homophones
    let homophoneMatches = 0;
    for (let i = 0; i < targetWords.length; i++) {
      if (!targetUsed[i] && HOMOPHONES[targetWords[i]]) {
        for (let j = 0; j < spokenWords.length; j++) {
          if (!spokenUsed[j] && HOMOPHONES[targetWords[i]].includes(spokenWords[j])) {
            homophoneMatches++;
            targetUsed[i] = true;
            spokenUsed[j] = true;
            break;
          }
        }
      }
    }
    
    // Third pass: contractions and common speech errors
    let contractionMatches = 0;
    for (let i = 0; i < targetWords.length; i++) {
      if (!targetUsed[i]) {
        for (let j = 0; j < spokenWords.length; j++) {
          if (!spokenUsed[j]) {
            const contractionScore = checkContractionMatch(spokenWords[j], targetWords[i]);
            if (contractionScore > 0) {
              contractionMatches++;
              targetUsed[i] = true;
              spokenUsed[j] = true;
              break;
            }
          }
        }
      }
    }
    
    // Fourth pass: other common speech errors (but NOT wrong contractions)
    let commonErrorMatches = 0;
    for (let i = 0; i < targetWords.length; i++) {
      if (!targetUsed[i]) {
        for (let j = 0; j < spokenWords.length; j++) {
          if (!spokenUsed[j]) {
            const errorScore = checkCommonErrors(spokenWords[j], targetWords[i]);
            if (errorScore > 0 && errorScore < 100) { // Exclude contractions (which return 100)
              commonErrorMatches++;
              targetUsed[i] = true;
              spokenUsed[j] = true;
              break;
            }
          }
        }
      }
    }
    
    // Fifth pass: phonetic similarity (only for remaining words)
    let phoneticMatches = 0;
    for (let i = 0; i < targetWords.length; i++) {
      if (!targetUsed[i]) {
        let bestPhoneticScore = 0;
        let bestJ = -1;
        
        for (let j = 0; j < spokenWords.length; j++) {
          if (!spokenUsed[j]) {
            const phoneticScore = getPhoneticSimilarity(targetWords[i], spokenWords[j]);
            if (phoneticScore > bestPhoneticScore && phoneticScore >= 70) {
              bestPhoneticScore = phoneticScore;
              bestJ = j;
            }
          }
        }
        
        if (bestJ >= 0) {
          phoneticMatches++;
          targetUsed[i] = true;
          spokenUsed[bestJ] = true;
        }
      }
    }
    
    // Calculate final score
    const totalMatched = exactMatches + homophoneMatches + contractionMatches + commonErrorMatches + phoneticMatches;
    let percentage = Math.round((totalMatched / totalWords) * 100);
    
    // FIXED: Apply confidence bonus more conservatively
    if (confidenceScore > 0.85) {
      percentage = Math.min(100, Math.round(percentage * 1.02)); // Only 2% bonus for very high confidence
    } else if (confidenceScore < 0.4) {
      percentage = Math.round(percentage * 0.95); // 5% penalty for very low confidence
    }
    
    // Penalty for significantly wrong length
    const lengthRatio = spokenWords.length / targetWords.length;
    if (lengthRatio > 3.0) {
      percentage = Math.max(0, percentage - 20); // Harsh penalty for very long responses
    } else if (lengthRatio > 2.0) {
      percentage = Math.max(0, percentage - 10); // Moderate penalty for long responses
    }
    
    // FIXED: Return actual matched count, not calculated display
    return { 
      percentage: Math.min(100, Math.max(0, percentage)), 
      matched: totalMatched, 
      total: totalWords,
      breakdown: {
        exact: exactMatches,
        homophone: homophoneMatches,
        contraction: contractionMatches,
        common: commonErrorMatches,
        phonetic: phoneticMatches
      }
    };
  };

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

  const createSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // ENHANCED: More patient settings for language learners
    recognition.continuous = true;  // Keep listening continuously
    recognition.interimResults = true;
    recognition.lang = 'en-GB';
    recognition.maxAlternatives = 5;
    
    // ENHANCED: Add longer timeout properties for patient listening
    if (recognition.speechTimeouts) {
      recognition.speechTimeouts.speaking = 10000;  // 10 seconds of speaking allowed
      recognition.speechTimeouts.listening = 15000; // 15 seconds of silence before giving up
    }

    recognition.onstart = () => {
      console.log('🎤 Recording started - taking your time...');
      setIsRecording(true);
      setTranscript('');
      setFeedback('Speak when ready - take your time! The recording will continue until you stop it.');
      setSpeechAlternatives([]);
      setConfidenceScore(0);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      let bestConfidence = 0;
      const alternatives = [];

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          for (let j = 0; j < Math.min(result.length, 5); j++) {
            const alternative = result[j];
            alternatives.push({
              text: alternative.transcript,
              confidence: alternative.confidence || 0.8
            });
            
            if (j === 0) {
              finalText += alternative.transcript + ' ';
            }
          }
          bestConfidence = result[0].confidence || 0.8;
        } else {
          interimText = result[0].transcript;
        }
      }

      // ENHANCED: Accumulate all final results, don't just take the last one
      const currentTranscript = transcript || '';
      const newTranscript = finalText ? (currentTranscript + finalText).trim() : (currentTranscript + ' ' + interimText).trim();
      
      setTranscript(newTranscript);
      setConfidenceScore(bestConfidence);
      setSpeechAlternatives(alternatives);
      
      // ENHANCED: Give encouraging feedback during recording
      if (finalText) {
        setFeedback('Great! Keep going or click "Stop Recording" when finished.');
      } else if (interimText) {
        setFeedback('Listening... take your time!');
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      
      // ENHANCED: Don't stop recording for minor errors, only for serious ones
      if (event.error === 'no-speech') {
        // Don't stop recording, just give helpful feedback
        setFeedback('Take your time - the microphone is still listening. Speak when ready!');
        return; // Don't set isRecording to false
      }
      
      // Only stop for serious errors
      if (['not-allowed', 'service-not-allowed', 'bad-grammar'].includes(event.error)) {
        setIsRecording(false);
      }
      
      const errorMessages = {
        'audio-capture': 'Microphone error. Please check your microphone and try again.',
        'not-allowed': 'Microphone access denied. Please allow access and refresh.',
        'network': 'Network error. Please check your connection.',
        'service-not-allowed': 'Speech service not available. Please try refreshing the page.',
        'bad-grammar': 'Speech not recognised. Click "Stop Recording" and try again.'
      };
      
      const userMessage = errorMessages[event.error] || 'Recording issue - click "Stop Recording" and try again.';
      setFeedback(userMessage);
    };

    recognition.onend = () => {
      console.log('🎤 Recording ended by user or system');
      // ENHANCED: Only set recording to false if the user intended to stop
      // The system should not auto-stop due to pauses
      if (isRecording) {
        console.log('🔄 Recognition ended unexpectedly, restarting...');
        // Automatically restart recognition if it stops unexpectedly (due to pause)
        try {
          setTimeout(() => {
            if (isRecording && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (error) {
          console.log('Could not restart recognition:', error);
          setIsRecording(false);
        }
      }
    };

    return recognition;
  };

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

  const stopRecording = () => {
    console.log('🛑 User manually stopped recording');
    setIsRecording(false); // Set this first to prevent auto-restart
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setFeedback('Recording stopped. Review your speech and click "Submit Recording" when ready.');
  };

  const submitRecording = () => {
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

    const feedbackMessages = [
      { min: 95, message: 'Perfect! Outstanding pronunciation! 🌟', type: 'success' },
      { min: 85, message: 'Excellent work! Great pronunciation! 🎉', type: 'success' },
      { min: 70, message: 'Well done! Good pronunciation! 👍', type: 'success' },
      { min: 50, message: 'Good effort! Keep practising! 📈', type: 'warning' },
      { min: 0, message: 'Keep trying! Practice makes perfect! 💪', type: 'info' }
    ];

    const feedbackObj = feedbackMessages.find(f => scoreData.percentage >= f.min);
    setFeedback(`${feedbackObj.message} (${scoreData.percentage}%)`);

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
    
    // FIXED: Proper time calculation in minutes
    const testDurationSeconds = exerciseStartTime ? Math.round((Date.now() - exerciseStartTime) / 1000) : 0;
    const testDurationMinutes = Math.round(testDurationSeconds / 60);
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
        timeSpent: testDurationSeconds, // Store in seconds for data consistency
        userAnswers: userAnswers
      });

      console.log('✅ Speaking exercise completed and progress recorded');
      console.log(`📊 Average score: ${Math.round(averageScore)}%`);
      console.log(`⏱️ Time taken: ${testDurationMinutes} minutes`);
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
    console.log('🔄 User restarting recording');
    
    // Stop current recording first
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Clear transcript and restart
    setTranscript('');
    setFeedback('Recording restarted - speak when ready!');
    
    // Restart after a brief delay
    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error restarting recording:', error);
          setFeedback('Error restarting. Please try clicking "Start Recording" again.');
        }
      }
    }, 500);
  };

  useEffect(() => {
    checkSpeechSupport();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const currentSentence = sentences[currentIndex];
  const progress = sentences.length > 0 ? ((currentIndex + 1) / sentences.length) * 100 : 0;
  const finalStats = results.length > 0 ? {
    averageScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
    completed: results.filter(r => r.spoken).length,
    total: sentences.length,
    // FIXED: Proper duration calculation in minutes
    duration: exerciseStartTime ? Math.max(1, Math.round((Date.now() - exerciseStartTime) / (1000 * 60))) : 0
  } : null;

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
                  <span className="instruction-icon">✅</span>
                  <span>Click "Submit Recording" to score your pronunciation</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎯</span>
                  <span>Complete 10 sentences across different difficulty levels</span>
                </div>
              </div>
              
              <div className="tips-section">
                <h4>💡 Speaking Tips:</h4>
                <ul>
                  <li>Speak clearly and at a natural pace - don't rush!</li>
                  <li>Take pauses and think between words - the recording won't stop</li>
                  <li>Find a quiet environment for best results</li>
                  <li>Pronounce each word distinctly</li>
                  <li>Both British and American pronunciations are accepted</li>
                  <li>You control when to stop recording - take your time!</li>
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
                      {/* Show breakdown of how words were matched for transparency */}
                      {result.breakdown && (
                        <p><strong>Match details:</strong> {result.breakdown.exact} exact, {result.breakdown.homophone} similar sounds, {result.breakdown.contraction} contractions, {result.breakdown.common} common variants, {result.breakdown.phonetic} close pronunciations</p>
                      )}
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
                  <div className="recording-text">
                    🎤 Recording... Take your time! Click "Stop Recording" when you're finished.
                  </div>
                </div>
              )}

              {transcript && (
                <div className="transcript-display">
                  <div className="transcript-label">You said:</div>
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
