// src/components/WritingExercise.js - Complete writing exercise with actual image display
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';
import { incrementDailyTarget } from './LandingPage';
import '../styles/writing-exercise.css';

// Photo prompts for writing exercises - with uploaded images
const PHOTO_PROMPTS = [
  {
    id: 'busy_city_street',
    image: '/images/writing-prompts/busy_city_street.jpg',
    title: 'Busy City Street',
    description: 'Describe this busy urban scene during rush hour',
    level: 'B1-B2',
    minWords: 50,
    maxWords: 80,
    prompt: "Describe this busy city scene. What are people doing? What can you see? What might people be thinking or feeling? Describe the atmosphere and energy of the street.",
    suggestedPoints: [
      'What types of transport can you see?',
      'Describe the buildings and architecture',
      'What activities are people doing?',
      'What is the mood and atmosphere?'
    ]
  },
  {
    id: 'family_picnic',
    image: '/images/writing-prompts/family_picnic.jpg',
    title: 'Family Picnic in Park',
    description: 'Describe this family gathering in the park',
    level: 'A2-B1',
    minWords: 40,
    maxWords: 60,
    prompt: "Describe this family picnic scene. Who might these people be? What activities are they doing? Describe the setting and atmosphere.",
    suggestedPoints: [
      'Who are the people and what are their relationships?',
      'What food and activities can you see?',
      'Describe the weather and surroundings',
      'What emotions do you notice?'
    ]
  },
  {
    id: 'coffee_shop',
    image: '/images/writing-prompts/coffee_shop.jpg',
    title: 'Busy Coffee Shop',
    description: 'Describe the atmosphere and activities in this coffee shop',
    level: 'B1-B2',
    minWords: 50,
    maxWords: 80,
    prompt: "Describe what's happening in this coffee shop. What are people doing? Describe the atmosphere and the different types of customers.",
    suggestedPoints: [
      'What are different people doing?',
      'Describe the interior and atmosphere',
      'What drinks and food can you see?',
      'What is the general mood?'
    ]
  },
  {
    id: 'playground',
    image: '/images/writing-prompts/playground.jpg',
    title: 'Children\'s Playground',
    description: 'Describe the activities and atmosphere at this playground',
    level: 'A2-B1',
    minWords: 40,
    maxWords: 60,
    prompt: "Describe what's happening at this playground. What games are children playing? What do you notice about the atmosphere?",
    suggestedPoints: [
      'What equipment and activities can you see?',
      'Describe the children and their emotions',
      'What are the adults doing?',
      'How does the place make you feel?'
    ]
  },
  {
    id: 'farmers_market',
    image: '/images/writing-prompts/farmers_market.jpg',
    title: 'Farmer\'s Market',
    description: 'Describe the vibrant atmosphere of this outdoor market',
    level: 'B1-B2',
    minWords: 50,
    maxWords: 80,
    prompt: "Describe this market scene. What products can you see? How do people interact? Describe the colours, atmosphere, and community feeling.",
    suggestedPoints: [
      'What types of food and products are available?',
      'How do vendors and customers interact?',
      'Describe the colours and visual details',
      'What does this tell us about the community?'
    ]
  },
  {
    id: 'library',
    image: '/images/writing-prompts/library.jpg',
    title: 'Library Study Scene',
    description: 'Describe the academic atmosphere in this library',
    level: 'B1-B2',
    minWords: 50,
    maxWords: 80,
    prompt: "Describe what's happening in this library. What are students doing? Describe the environment and atmosphere for learning.",
    suggestedPoints: [
      'What study activities can you see?',
      'Describe the physical environment',
      'What is the general atmosphere?',
      'How do students behave in this space?'
    ]
  },
  {
    id: 'beach_scene',
    image: '/images/writing-prompts/beach_scene.jpg',
    title: 'Beach Holiday Scene',
    description: 'Describe this relaxing day at the beach',
    level: 'A2-B1',
    minWords: 40,
    maxWords: 60,
    prompt: "Describe this beach scene. What holiday activities are taking place? Describe the weather, people, and atmosphere.",
    suggestedPoints: [
      'What beach activities can you see?',
      'Describe the weather and natural setting',
      'What are different people doing?',
      'How does this scene make you feel?'
    ]
  },
  {
    id: 'train_station',
    image: '/images/writing-prompts/train_station.jpg',
    title: 'Train Station',
    description: 'Describe the busy atmosphere of this transport hub',
    level: 'B1-B2',
    minWords: 50,
    maxWords: 80,
    prompt: "Describe this train station scene. What are people doing? Where might they be going? Describe the atmosphere and energy.",
    suggestedPoints: [
      'What travel activities can you see?',
      'Describe the architecture and environment',
      'What emotions might people be feeling?',
      'What does this tell us about modern travel?'
    ]
  }
];

// Model answers focused on grammatical structures for ESL students
const MODEL_ANSWERS = {
  busy_city_street: "This is a busy city street. Many people are walking on the pavement. Cars and buses are driving on the road. Some people are waiting at the bus stop. A woman is carrying a bag. Traffic lights are controlling the traffic. The buildings are tall and modern.",

  family_picnic: "This family is having a picnic in the park. The parents are sitting on a blanket. Children are playing with a ball. They have brought sandwiches and drinks. The weather is sunny and warm. Everyone looks happy and relaxed.",

  coffee_shop: "This coffee shop is very busy. Customers are sitting at tables. Some people are reading newspapers. A barista is making coffee behind the counter. Students are studying with their laptops. The atmosphere is friendly and comfortable.",

  playground: "Children are playing at this playground. Some kids are using the swings. Others are climbing on the equipment. Parents are watching their children. Everyone is having fun. The playground is safe and colourful.",

  farmers_market: "This is a farmers' market. Vendors are selling fresh vegetables and fruits. Customers are walking between the stalls. People are buying organic food. The market is open every weekend. There are many different products available.",

  library: "Students are studying in this library. Some people are reading books at tables. Others are using computers. The librarian is helping visitors. The environment is quiet and peaceful. Many books are arranged on the shelves.",

  beach_scene: "People are enjoying a day at the beach. Families are sitting on the sand. Children are building sandcastles. Some people are swimming in the sea. The sun is shining brightly. Everyone is having a good time.",

  train_station: "This train station is very busy. Passengers are waiting for their trains. Some people are carrying suitcases. The departure board shows train times. Announcements are being made regularly. Travelers are going to different destinations."
};

function WritingExercise({ onBack, onLogoClick }) {
  // Core state
  const [currentStep, setCurrentStep] = useState('selection'); // selection, writing, feedback
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [userText, setUserText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(60); // Changed to 1 minute
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // Refs
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerActive, timeRemaining]);

  // Word count effect
  useEffect(() => {
    const words = userText.trim() ? userText.trim().split(/\s+/) : [];
    setWordCount(words.length);
  }, [userText]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start writing exercise with random prompt
  const startWriting = () => {
    const randomPrompt = PHOTO_PROMPTS[Math.floor(Math.random() * PHOTO_PROMPTS.length)];
    setSelectedPrompt(randomPrompt);
    setCurrentStep('writing');
    setUserText('');
    setTimeRemaining(60); // Changed to 1 minute
    setIsTimerActive(true);
    setStartTime(Date.now());
    
    // Focus textarea after a short delay
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  // Handle timer expiry
  const handleTimeUp = () => {
    if (userText.trim()) {
      generateFeedback();
    } else {
      setCurrentStep('selection');
      alert('Time is up! Please write something before the timer expires.');
    }
  };

  // Vocabulary complexity analysis
  const analyseVocabulary = (tokens) => {
    const vocabulary = {
      basic: { words: [], score: 0 },
      intermediate: { words: [], score: 0 },
      advanced: { words: [], score: 0 },
      total: tokens.length,
      unique: new Set(tokens.map(t => t.word)).size
    };
    
    // Basic vocabulary (A1-A2 level)
    const basicWords = [
      'good', 'bad', 'big', 'small', 'happy', 'sad', 'old', 'new', 'nice', 'beautiful',
      'family', 'house', 'car', 'food', 'work', 'school', 'friend', 'time', 'day', 'year',
      'like', 'love', 'want', 'need', 'go', 'come', 'see', 'know', 'think', 'say'
    ];
    
    // Intermediate vocabulary (B1-B2 level)
    const intermediateWords = [
      'amazing', 'terrible', 'enormous', 'tiny', 'delighted', 'disappointed', 'ancient', 'modern',
      'fantastic', 'awful', 'brilliant', 'dreadful', 'excellent', 'wonderful', 'comfortable',
      'environment', 'opportunity', 'experience', 'situation', 'development', 'improvement',
      'relationship', 'communication', 'information', 'education', 'transportation', 'organization',
      'appreciate', 'recommend', 'suggest', 'consider', 'discuss', 'explain', 'describe', 'compare'
    ];
    
    // Advanced vocabulary (C1+ level)
    const advancedWords = [
      'magnificent', 'devastating', 'colossal', 'minuscule', 'ecstatic', 'distraught', 'archaic', 'contemporary',
      'extraordinary', 'abysmal', 'exceptional', 'appalling', 'outstanding', 'remarkable', 'sophisticated',
      'phenomenon', 'consequence', 'significance', 'perspective', 'methodology', 'implementation',
      'comprehensive', 'substantial', 'considerable', 'fundamental', 'essential', 'crucial',
      'contemplate', 'demonstrate', 'illustrate', 'investigate', 'establish', 'acknowledge', 'emphasize'
    ];
    
    tokens.forEach(token => {
      const word = token.word;
      if (advancedWords.includes(word)) {
        vocabulary.advanced.words.push(word);
        vocabulary.advanced.score += 3;
      } else if (intermediateWords.includes(word)) {
        vocabulary.intermediate.words.push(word);
        vocabulary.intermediate.score += 2;
      } else if (basicWords.includes(word)) {
        vocabulary.basic.words.push(word);
        vocabulary.basic.score += 1;
      }
    });
    
    return vocabulary;
  };
  // Advanced tokenizer and POS tagger
  const tokenize = (text) => {
    return text.toLowerCase()
      .replace(/[^\w\s']/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  };

  const tagPOS = (tokens) => {
    const tagged = [];
    const verbPrefixes = ['be', 'have', 'do', 'will', 'would', 'could', 'should', 'might', 'may', 'can', 'must'];
    const prepositions = ['in', 'on', 'at', 'by', 'for', 'with', 'from', 'to', 'of', 'about', 'under', 'over'];
    const determiners = ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      const prevToken = tokens[i - 1];
      
      let pos = 'UNKNOWN';
      
      // Verb detection
      if (verbPrefixes.includes(token) || token.endsWith('ing') || token.endsWith('ed') || 
          token.endsWith('s') && !token.endsWith('ss')) {
        pos = 'VERB';
      }
      // Modal detection
      else if (['can', 'could', 'should', 'would', 'might', 'may', 'must', 'will', 'shall'].includes(token)) {
        pos = 'MODAL';
      }
      // Auxiliary detection
      else if (['be', 'am', 'is', 'are', 'was', 'were', 'being', 'been', 'have', 'has', 'had', 'having', 'do', 'does', 'did'].includes(token)) {
        pos = 'AUX';
      }
      // Determiner detection
      else if (determiners.includes(token)) {
        pos = 'DET';
      }
      // Preposition detection
      else if (prepositions.includes(token)) {
        pos = 'PREP';
      }
      // Pronoun detection
      else if (['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'].includes(token)) {
        pos = 'PRON';
      }
      // Conjunction detection
      else if (['and', 'but', 'or', 'so', 'because', 'although', 'however', 'therefore', 'moreover'].includes(token)) {
        pos = 'CONJ';
      }
      else {
        pos = 'NOUN'; // Default assumption
      }
      
      tagged.push({ word: token, pos: pos, index: i });
    }
    
    return tagged;
  };

  // Advanced grammar pattern detector
  const detectGrammarPatterns = (tokens, originalText) => {
    const patterns = {
      a1_a2: [],
      b1: [],
      b2_plus: []
    };
    
    // Convert to sentences for better analysis
    const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 3);
    
    sentences.forEach(sentence => {
      const sentenceTokens = tagPOS(tokenize(sentence));
      const sentenceLower = sentence.toLowerCase();
      
      // A1-A2 Pattern Detection
      detectA1A2Patterns(sentenceTokens, sentenceLower, patterns.a1_a2);
      
      // B1 Pattern Detection  
      detectB1Patterns(sentenceTokens, sentenceLower, patterns.b1);
      
      // B2+ Pattern Detection
      detectB2Patterns(sentenceTokens, sentenceLower, patterns.b2_plus);
    });
    
    return patterns;
  };

  const detectA1A2Patterns = (tokens, sentence, patterns) => {
    // TO BE + complement structures
    const bePattern = tokens.find((token, i) => 
      token.pos === 'AUX' && ['am', 'is', 'are', 'was', 'were'].includes(token.word) &&
      i < tokens.length - 1
    );
    if (bePattern) {
      patterns.push({ type: 'TO_BE', example: `"${bePattern.word}"`, score: 3 });
    }
    
    // Present simple with subject-verb agreement
    const presentSimple = tokens.find((token, i) => {
      if (token.pos === 'VERB') {
        const prevToken = tokens[i - 1];
        if (prevToken && ['he', 'she', 'it'].includes(prevToken.word) && token.word.endsWith('s')) {
          return true;
        }
        if (prevToken && ['i', 'you', 'we', 'they'].includes(prevToken.word) && !token.word.endsWith('s')) {
          return true;
        }
      }
      return false;
    });
    if (presentSimple) {
      patterns.push({ type: 'PRESENT_SIMPLE', example: `"${presentSimple.word}"`, score: 3 });
    }
    
    // Article usage
    const articles = tokens.filter(token => token.pos === 'DET' && ['a', 'an', 'the'].includes(token.word));
    if (articles.length >= 2) {
      patterns.push({ type: 'ARTICLES', example: `"${articles.map(a => a.word).join(', ')}"`, score: 2 });
    }
    
    // HAVE GOT construction
    if (/\b(have|has)\s+got\b/.test(sentence)) {
      patterns.push({ type: 'HAVE_GOT', example: '"have/has got"', score: 4 });
    }
    
    // There is/are existential
    if (/\bthere\s+(is|are|was|were)\b/.test(sentence)) {
      patterns.push({ type: 'THERE_BE', example: '"there is/are"', score: 3 });
    }
    
    // Past simple (regular and irregular)
    const pastVerbs = tokens.filter(token => 
      (token.word.endsWith('ed') && token.pos === 'VERB') ||
      ['went', 'came', 'saw', 'did', 'had', 'made', 'got', 'took', 'gave'].includes(token.word)
    );
    if (pastVerbs.length > 0) {
      patterns.push({ type: 'PAST_SIMPLE', example: `"${pastVerbs[0].word}"`, score: 3 });
    }
  };

  const detectB1Patterns = (tokens, sentence, patterns) => {
    // Present perfect detection
    const perfectPattern = tokens.find((token, i) => {
      if (['have', 'has'].includes(token.word) && i < tokens.length - 1) {
        const nextToken = tokens[i + 1];
        const perfectVerbs = ['been', 'done', 'seen', 'gone', 'made', 'taken', 'given', 'written', 'eaten', 'lived', 'worked', 'studied', 'visited'];
        return perfectVerbs.includes(nextToken.word) || nextToken.word.endsWith('ed');
      }
      return false;
    });
    if (perfectPattern) {
      patterns.push({ type: 'PRESENT_PERFECT', example: `"${perfectPattern.word} + past participle"`, score: 5 });
    }
    
    // Present continuous/progressive
    const continuousPattern = tokens.find((token, i) => {
      if (['am', 'is', 'are'].includes(token.word) && i < tokens.length - 1) {
        const nextToken = tokens[i + 1];
        return nextToken.word.endsWith('ing');
      }
      return false;
    });
    if (continuousPattern) {
      patterns.push({ type: 'PRESENT_CONTINUOUS', example: '"am/is/are + -ing"', score: 4 });
    }
    
    // Past continuous
    const pastContinuous = tokens.find((token, i) => {
      if (['was', 'were'].includes(token.word) && i < tokens.length - 1) {
        const nextToken = tokens[i + 1];
        return nextToken.word.endsWith('ing');
      }
      return false;
    });
    if (pastContinuous) {
      patterns.push({ type: 'PAST_CONTINUOUS', example: '"was/were + -ing"', score: 5 });
    }
    
    // Modal + base verb
    const modalPattern = tokens.find((token, i) => {
      if (token.pos === 'MODAL' && i < tokens.length - 1) {
        const nextToken = tokens[i + 1];
        return nextToken.pos === 'VERB' && !nextToken.word.endsWith('ing') && !nextToken.word.endsWith('ed');
      }
      return false;
    });
    if (modalPattern) {
      patterns.push({ type: 'MODAL_VERB', example: `"${modalPattern.word} + verb"`, score: 4 });
    }
    
    // Going to future
    if (/\b(am|is|are)\s+going\s+to\s+\w+/.test(sentence)) {
      patterns.push({ type: 'GOING_TO_FUTURE', example: '"going to + verb"', score: 4 });
    }
    
    // Conditional structures
    if (/\bif\s+\w+.*,.*\w+|\w+.*\bif\s+\w+/.test(sentence)) {
      patterns.push({ type: 'CONDITIONAL', example: '"if + clause"', score: 5 });
    }
  };

  const detectB2Patterns = (tokens, sentence, patterns) => {
    // Passive voice detection
    const passivePattern = tokens.find((token, i) => {
      if (['is', 'are', 'was', 'were', 'been', 'being'].includes(token.word) && i < tokens.length - 1) {
        const nextToken = tokens[i + 1];
        const pastParticiples = ['made', 'done', 'seen', 'built', 'created', 'written', 'taken', 'given', 'opened', 'closed'];
        return pastParticiples.includes(nextToken.word) || (nextToken.word.endsWith('ed') && nextToken.word.length > 3);
      }
      return false;
    });
    if (passivePattern) {
      patterns.push({ type: 'PASSIVE_VOICE', example: '"be + past participle"', score: 5 });
    }
    
    // Relative clauses
    const relativePattern = tokens.find((token, i) => {
      if (['who', 'which', 'that', 'where', 'when'].includes(token.word)) {
        // Check if it's actually starting a relative clause (has subject/verb after)
        const hasSubjectVerb = tokens.slice(i + 1, i + 4).some(t => t.pos === 'VERB');
        return hasSubjectVerb;
      }
      return false;
    });
    if (relativePattern) {
      patterns.push({ type: 'RELATIVE_CLAUSE', example: `"${relativePattern.word} + clause"`, score: 4 });
    }
    
    // Complex connectors
    const complexConnectors = tokens.filter(token => 
      ['although', 'however', 'therefore', 'moreover', 'furthermore', 'nevertheless', 'consequently'].includes(token.word)
    );
    if (complexConnectors.length > 0) {
      patterns.push({ type: 'COMPLEX_CONNECTORS', example: `"${complexConnectors[0].word}"`, score: 4 });
    }
    
    // Present perfect continuous
    const ppcPattern = tokens.find((token, i) => {
      if (['have', 'has'].includes(token.word) && i < tokens.length - 2) {
        const nextToken = tokens[i + 1];
        const thirdToken = tokens[i + 2];
        return nextToken.word === 'been' && thirdToken.word.endsWith('ing');
      }
      return false;
    });
    if (ppcPattern) {
      patterns.push({ type: 'PRESENT_PERFECT_CONTINUOUS', example: '"have/has been + -ing"', score: 6 });
    }
    
    // Reported speech indicators
    if (/\b(said|told|asked|explained|mentioned)\s+(that|to)\b/.test(sentence)) {
      patterns.push({ type: 'REPORTED_SPEECH', example: '"said that/told to"', score: 4 });
    }
  };

  // Enhanced grammar analysis using the advanced system
  const analyseGrammar = (text) => {
    const tokens = tagPOS(tokenize(text));
    const patterns = detectGrammarPatterns(tokens, text);
    const vocabulary = analyseVocabulary(tokens);
    
    const analysis = {
      a1_a2: { score: 0, found: [], total: 15 },
      b1: { score: 0, found: [], total: 15 },
      b2_plus: { score: 0, found: [], total: 10 },
      vocabulary: vocabulary,
      sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 3),
      totalTokens: tokens.length,
      uniqueWords: new Set(tokens.map(t => t.word)).size
    };
    
    // Track unique pattern types to avoid duplicates
    const foundTypes = new Set();
    
    // Calculate scores and create user-friendly messages (no duplicates)
    patterns.a1_a2.forEach(pattern => {
      analysis.a1_a2.score += pattern.score;
      if (!foundTypes.has(pattern.type)) {
        analysis.a1_a2.found.push(createFriendlyMessage(pattern.type, pattern.example));
        foundTypes.add(pattern.type);
      }
    });
    
    patterns.b1.forEach(pattern => {
      analysis.b1.score += pattern.score;
      if (!foundTypes.has(pattern.type)) {
        analysis.b1.found.push(createFriendlyMessage(pattern.type, pattern.example));
        foundTypes.add(pattern.type);
      }
    });
    
    patterns.b2_plus.forEach(pattern => {
      analysis.b2_plus.score += pattern.score;
      if (!foundTypes.has(pattern.type)) {
        analysis.b2_plus.found.push(createFriendlyMessage(pattern.type, pattern.example));
        foundTypes.add(pattern.type);
      }
    });
    
    // Cap scores at maximum
    analysis.a1_a2.score = Math.min(analysis.a1_a2.score, analysis.a1_a2.total);
    analysis.b1.score = Math.min(analysis.b1.score, analysis.b1.total);
    analysis.b2_plus.score = Math.min(analysis.b2_plus.score, analysis.b2_plus.total);
    
    return analysis;
  };

  // Create user-friendly messages for grammar patterns
  const createFriendlyMessage = (type, example) => {
    const messages = {
      'TO_BE': 'Well done! You used "to be" verbs correctly',
      'PRESENT_SIMPLE': 'Great! You used present simple tense',
      'ARTICLES': 'Nice work using articles (a, an, the)',
      'HAVE_GOT': 'Excellent! You used "have got" structure',
      'THERE_BE': 'Good! You used "there is/are" construction',
      'PAST_SIMPLE': 'Well done! You used past simple tense',
      'PRESENT_PERFECT': 'Fantastic! You used present perfect tense',
      'PRESENT_CONTINUOUS': 'Great! You used present continuous',
      'PAST_CONTINUOUS': 'Excellent! You used past continuous',
      'MODAL_VERB': 'Nice! You used modal verbs',
      'GOING_TO_FUTURE': 'Good! You used "going to" future',
      'CONDITIONAL': 'Amazing! You used conditional sentences',
      'PASSIVE_VOICE': 'Outstanding! You used passive voice',
      'RELATIVE_CLAUSE': 'Brilliant! You used relative clauses',
      'COMPLEX_CONNECTORS': 'Superb! You used advanced connectors',
      'PRESENT_PERFECT_CONTINUOUS': 'Exceptional! You used present perfect continuous',
      'REPORTED_SPEECH': 'Excellent! You used reported speech'
    };
    
    return messages[type] || `Great! You used ${type.toLowerCase().replace(/_/g, ' ')}`;
  };

  // Generate feedback based on detailed grammar analysis
  const generateFeedback = () => {
    let score = 50; // Base score
    
    // Perform detailed grammar analysis
    const grammarAnalysis = analyseGrammar(userText);
    
    // Word count scoring (25 points total)
    if (wordCount >= selectedPrompt.minWords && wordCount <= selectedPrompt.maxWords) {
      score += 20;
    } else if (wordCount >= selectedPrompt.minWords * 0.8) {
      score += 15;
    } else if (wordCount >= 20) {
      score += 5;
    }
    
    // Grammar scoring based on analysis (35 points total)
    const a1a2Score = Math.min(grammarAnalysis.a1_a2.score, grammarAnalysis.a1_a2.total);
    const b1Score = Math.min(grammarAnalysis.b1.score, grammarAnalysis.b1.total);
    const b2Score = Math.min(grammarAnalysis.b2_plus.score, grammarAnalysis.b2_plus.total);
    
    score += a1a2Score + b1Score + b2Score;
    
    // Vocabulary complexity scoring (10 points total)
    const vocabScore = Math.min(
      grammarAnalysis.vocabulary.basic.score + 
      grammarAnalysis.vocabulary.intermediate.score + 
      grammarAnalysis.vocabulary.advanced.score, 
      10
    );
    score += vocabScore;
    
    // Sentence variety bonus (5 points)
    if (grammarAnalysis.sentences.length >= 3) score += 3;
    if (grammarAnalysis.sentences.length >= 5) score += 2;
    
    // Cap at 100
    score = Math.min(score, 100);
    
    setFeedback({
      score: score,
      wordCount: wordCount,
      timeUsed: startTime ? Math.round((Date.now() - startTime) / 1000) : 0,
      suggestions: generateDetailedSuggestions(grammarAnalysis, wordCount, selectedPrompt),
      grammarAnalysis: grammarAnalysis
    });
    
    setCurrentStep('feedback');
    
    // Record test result and increment daily target
    recordTestResult({
      quizType: 'writing',
      score: Math.round(score / 10), // Convert to 0-10 scale
      totalQuestions: 1,
      completedAt: new Date(),
      timeSpent: startTime ? Math.round((Date.now() - startTime) / 1000) : 0,
      userAnswers: [{
        answer: userText.substring(0, 100) + '...',
        correct: score >= 70,
        score: score
      }]
    });
    
    // Increment daily target for writing
    incrementDailyTarget('writing');
  };

  // Generate detailed suggestions based on grammar analysis
  const generateDetailedSuggestions = (analysis, wordCount, prompt) => {
    const suggestions = [];
    
    // Word count feedback
    if (wordCount < prompt.minWords) {
      suggestions.push("💡 Try to write more words to reach the target length");
    } else if (wordCount > prompt.maxWords) {
      suggestions.push("💡 Try to write fewer words to stay within the target range");
    } else {
      suggestions.push("✅ Perfect word count!");
    }
    
    // Grammar achievements - show what they did well
    const allGrammar = [
      ...analysis.a1_a2.found,
      ...analysis.b1.found,
      ...analysis.b2_plus.found
    ];
    
    if (allGrammar.length === 0) {
      suggestions.push("📚 Try using basic grammar: present simple (I work, she lives), past simple (I went), articles (a, an, the)");
    } else {
      // Show positive feedback for what they achieved
      allGrammar.slice(0, 3).forEach(achievement => {
        suggestions.push(achievement);
      });
    }
    
    // Vocabulary feedback
    if (analysis.vocabulary.advanced.words.length > 0) {
      suggestions.push(`🌟 Great advanced vocabulary: ${analysis.vocabulary.advanced.words.slice(0, 3).join(', ')}`);
    } else if (analysis.vocabulary.intermediate.words.length > 0) {
      suggestions.push(`🎯 Good intermediate vocabulary: ${analysis.vocabulary.intermediate.words.slice(0, 3).join(', ')}`);
    }
    
    // Next level suggestions
    if (analysis.a1_a2.score >= 10 && analysis.b1.score < 5) {
      suggestions.push("📈 Next challenge: Try present perfect (I have seen) or modal verbs (can, should, must)");
    } else if (analysis.b1.score >= 10 && analysis.b2_plus.score < 5) {
      suggestions.push("🚀 Ready for advanced grammar: Try passive voice (it was made) or relative clauses (the person who...)");
    }
    
    return suggestions;
  };

  // Restart exercise
  const restartExercise = () => {
    setCurrentStep('selection');
    setSelectedPrompt(null);
    setUserText('');
    setTimeRemaining(60); // Changed to 1 minute
    setIsTimerActive(false);
    setFeedback(null);
    setStartTime(null);
  };

  // SELECTION SCREEN
  if (currentStep === 'selection') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>✍️ Writing Exercise</h1>
          
          <div className="writing-instructions">
            <h3>📝 Photo Description Task</h3>
            <p>You'll see a photo and write a detailed description.
            You have 1 minute to write between 40-80 words depending on the difficulty level.</p>
            
            <div className="instruction-list">
              <div className="instruction-item">
                <span className="instruction-icon">📷</span>
                <span>One random photo prompt</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⏰</span>
                <span>1-minute time limit</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📊</span>
                <span>Instant feedback and scoring</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎯</span>
                <span>Compare with model answer</span>
              </div>
            </div>
          </div>

          <div className="exercise-start">
            <button className="btn btn-primary btn-large" onClick={startWriting}>
              🚀 Start Writing Exercise
            </button>
            <p className="start-note">Click to begin with a random photo prompt</p>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercise Selection
          </button>
        </div>
      </div>
    );
  }

  // WRITING SCREEN
  if (currentStep === 'writing') {
    return (
      <div className="exercise-page writing-fullscreen">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="writing-header-minimal">
            <h2>Write a description of the image below for 1 minute</h2>
            <div className="timer-minimal">
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="writing-layout">
            <div className="image-section">
              <img 
                src={selectedPrompt.image} 
                alt={selectedPrompt.title}
                className="prompt-image-minimal"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="photo-placeholder-minimal" style={{display: 'none'}}>
                <div className="photo-icon">📷</div>
                <p>Image not available</p>
              </div>
            </div>

            <div className="text-section">
              <textarea
                ref={textareaRef}
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Your response"
                className="writing-textarea-minimal"
                spellCheck="true"
              />
            </div>
          </div>

          <div className="writing-footer-minimal">
            <button 
              className="btn btn-primary"
              onClick={generateFeedback}
              disabled={userText.trim().length < 10}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FEEDBACK SCREEN
  if (currentStep === 'feedback') {
    return (
      <div className="exercise-page scrollable-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📊 Writing Feedback</h1>
          
          <div className="feedback-score">
            <div className="score-display">
              <span className="score-number">{feedback.score}</span>
              <span className="score-label">/ 100</span>
            </div>
            <div className="score-message">
              {feedback.score >= 90 ? '🌟 Excellent work!' :
               feedback.score >= 80 ? '🎉 Very good writing!' :
               feedback.score >= 70 ? '👍 Good effort!' :
               feedback.score >= 60 ? '📈 Keep improving!' :
               '💪 Practice makes perfect!'}
            </div>
          </div>

          <div className="feedback-section">
            <h3>📊 Writing Statistics</h3>
            <div className="writing-stats">
              <div className="stat-item">
                <span className="stat-label">Words Written</span>
                <span className="stat-value">{feedback.wordCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Target Range</span>
                <span className="stat-value">{selectedPrompt.minWords}-{selectedPrompt.maxWords}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time Used</span>
                <span className="stat-value">{Math.floor(feedback.timeUsed / 60)}:{(feedback.timeUsed % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Vocabulary</span>
                <span className="stat-value">{feedback.grammarAnalysis ? feedback.grammarAnalysis.uniqueWords : 0} unique</span>
              </div>
            </div>
          </div>

          {feedback.grammarAnalysis && (
            <div className="feedback-section">
              <h3>🎯 What You Did Well</h3>
              <div className="achievements-grid">
                {[
                  ...feedback.grammarAnalysis.a1_a2.found,
                  ...feedback.grammarAnalysis.b1.found,
                  ...feedback.grammarAnalysis.b2_plus.found
                ].slice(0, 6).map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    {achievement}
                  </div>
                ))}
                
                {feedback.grammarAnalysis.vocabulary.intermediate.words.length > 0 && (
                  <div className="achievement-item">
                    🎯 Good vocabulary: {feedback.grammarAnalysis.vocabulary.intermediate.words.slice(0, 3).join(', ')}
                  </div>
                )}
                
                {feedback.grammarAnalysis.vocabulary.advanced.words.length > 0 && (
                  <div className="achievement-item">
                    🌟 Advanced vocabulary: {feedback.grammarAnalysis.vocabulary.advanced.words.slice(0, 3).join(', ')}
                  </div>
                )}
                
                {([
                  ...feedback.grammarAnalysis.a1_a2.found,
                  ...feedback.grammarAnalysis.b1.found,
                  ...feedback.grammarAnalysis.b2_plus.found
                ].length === 0 && 
                  feedback.grammarAnalysis.vocabulary.intermediate.words.length === 0 && 
                  feedback.grammarAnalysis.vocabulary.advanced.words.length === 0) && (
                  <div className="achievement-item">
                    👍 Good effort! Keep practising to improve your grammar and vocabulary
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="feedback-section">
            <h3>📊 Writing Statistics</h3>
            <div className="writing-stats">
              <div className="stat-item">
                <span className="stat-label">Words Written</span>
                <span className="stat-value">{feedback.wordCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Target Range</span>
                <span className="stat-value">{selectedPrompt.minWords}-{selectedPrompt.maxWords}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time Used</span>
                <span className="stat-value">{Math.floor(feedback.timeUsed / 60)}:{(feedback.timeUsed % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="feedback-section">
            <h3>📝 Your Writing</h3>
            <div className="user-writing">
              {userText}
            </div>
          </div>

          <div className="feedback-section">
            <h3>🎯 Model Answer</h3>
            <div className="model-answer">
              {MODEL_ANSWERS[selectedPrompt.id]}
            </div>
            <div className="comparison-tips">
              <h4>💡 Comparison Tips</h4>
              <ul>
                <li>Notice how the model answer uses varied vocabulary</li>
                <li>Look at the sentence structure and transitions</li>
                <li>See how emotions and atmosphere are described</li>
                <li>Compare the level of detail and specific observations</li>
              </ul>
            </div>
          </div>

          <div className="feedback-section">
            <h3>💡 Grammar and Improvement Tips</h3>
            <div className="suggestions-list">
              {feedback.suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>

          <div className="feedback-actions">
            <button className="btn btn-primary" onClick={startWriting}>
              📝 Try Another Writing
            </button>
            <button className="btn btn-secondary" onClick={restartExercise}>
              🔄 Back to Start
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              ← Exercise Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default WritingExercise;
