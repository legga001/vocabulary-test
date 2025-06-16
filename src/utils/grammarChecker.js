// src/utils/grammarChecker.js - Comprehensive free grammar checking system
// This provides detailed feedback without relying on external APIs

// ==============================================
// SPELLING CHECKER
// ==============================================

// Common British spellings that might be flagged incorrectly
const BRITISH_SPELLINGS = {
  'colour': true, 'colours': true, 'coloured': true, 'colouring': true,
  'honour': true, 'honours': true, 'honoured': true, 'honouring': true,
  'favour': true, 'favours': true, 'favoured': true, 'favouring': true,
  'centre': true, 'centres': true, 'centred': true, 'centring': true,
  'theatre': true, 'theatres': true, 'metre': true, 'metres': true,
  'realise': true, 'realised': true, 'realising': true, 'realisation': true,
  'organise': true, 'organised': true, 'organising': true, 'organisation': true,
  'recognise': true, 'recognised': true, 'recognising': true, 'recognition': true,
  'analyse': true, 'analysed': true, 'analysing': true, 'analysis': true,
  'defence': true, 'licence': true, 'practice': true, 'advice': true,
  'grey': true, 'travelling': true, 'modelling': true, 'cancelled': true
};

// Common misspellings with corrections
const COMMON_MISSPELLINGS = {
  'recieve': 'receive', 'seperate': 'separate', 'definately': 'definitely',
  'occured': 'occurred', 'begining': 'beginning', 'writting': 'writing',
  'enviroment': 'environment', 'goverment': 'government', 'tommorow': 'tomorrow',
  'accomodate': 'accommodate', 'embarass': 'embarrass', 'neccessary': 'necessary',
  'acheive': 'achieve', 'beleive': 'believe', 'calender': 'calendar',
  'commitee': 'committee', 'concious': 'conscious', 'decison': 'decision',
  'existance': 'existence', 'fourty': 'forty', 'freind': 'friend',
  'grammer': 'grammar', 'harrass': 'harass', 'independant': 'independent',
  'jewellry': 'jewellery', 'knowlege': 'knowledge', 'libary': 'library',
  'maintnance': 'maintenance', 'occassion': 'occasion', 'posession': 'possession',
  'priveledge': 'privilege', 'recomend': 'recommend', 'succesful': 'successful',
  'temprary': 'temporary', 'untill': 'until', 'wether': 'whether',
  'wich': 'which', 'youre': 'you\'re', 'its': 'it\'s', 'thier': 'their',
  'alot': 'a lot', 'aswell': 'as well', 'infront': 'in front',
  'atleast': 'at least', 'eachother': 'each other', 'alright': 'all right'
};

// Commonly confused words
const CONFUSED_WORDS = {
  'affect': { correct: 'affect', confused: 'effect', rule: 'Use "affect" as a verb (to influence)' },
  'effect': { correct: 'effect', confused: 'affect', rule: 'Use "effect" as a noun (a result)' },
  'there': { correct: 'there', confused: ['their', 'they\'re'], rule: 'Use "there" for location' },
  'their': { correct: 'their', confused: ['there', 'they\'re'], rule: 'Use "their" for possession' },
  'they\'re': { correct: 'they\'re', confused: ['there', 'their'], rule: 'Use "they\'re" for "they are"' },
  'your': { correct: 'your', confused: 'you\'re', rule: 'Use "your" for possession' },
  'you\'re': { correct: 'you\'re', confused: 'your', rule: 'Use "you\'re" for "you are"' },
  'its': { correct: 'its', confused: 'it\'s', rule: 'Use "its" for possession (no apostrophe)' },
  'it\'s': { correct: 'it\'s', confused: 'its', rule: 'Use "it\'s" for "it is" or "it has"' },
  'lose': { correct: 'lose', confused: 'loose', rule: 'Use "lose" as a verb (to misplace)' },
  'loose': { correct: 'loose', confused: 'lose', rule: 'Use "loose" as an adjective (not tight)' },
  'then': { correct: 'then', confused: 'than', rule: 'Use "then" for time sequences' },
  'than': { correct: 'than', confused: 'then', rule: 'Use "than" for comparisons' }
};

// ==============================================
// GRAMMAR RULES ENGINE
// ==============================================

const GRAMMAR_RULES = [
  // Subject-verb agreement
  {
    pattern: /\b(he|she|it)\s+(don't|doesn't)\b/gi,
    check: (match) => match[2].toLowerCase() === "don't",
    message: "Use 'doesn't' with he/she/it (third person singular)",
    type: 'subject_verb_agreement',
    suggestion: (match) => match[0].replace(/don't/gi, "doesn't")
  },
  {
    pattern: /\b(I|you|we|they)\s+doesn't\b/gi,
    check: () => true,
    message: "Use 'don't' with I/you/we/they",
    type: 'subject_verb_agreement',
    suggestion: (match) => match[0].replace(/doesn't/gi, "don't")
  },
  
  // Articles (a/an)
  {
    pattern: /\ba\s+([aeiouAEIOU])/g,
    check: () => true,
    message: "Use 'an' before words starting with vowel sounds",
    type: 'article_usage',
    suggestion: (match) => match[0].replace(/\ba\s+/, 'an ')
  },
  {
    pattern: /\ban\s+([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ])/g,
    check: () => true,
    message: "Use 'a' before words starting with consonant sounds",
    type: 'article_usage',
    suggestion: (match) => match[0].replace(/\ban\s+/, 'a ')
  },
  
  // Common verb form errors
  {
    pattern: /\b(am|is|are)\s+go\b/gi,
    check: () => true,
    message: "Use 'going' with am/is/are (present continuous)",
    type: 'verb_form',
    suggestion: (match) => match[0].replace(/go/, 'going')
  },
  {
    pattern: /\bI\s+are\b/gi,
    check: () => true,
    message: "Use 'I am' not 'I are'",
    type: 'verb_form',
    suggestion: (match) => match[0].replace(/are/, 'am')
  },
  
  // Quantifiers
  {
    pattern: /\bmuch\s+(people|children|books|cars|houses|students|friends)\b/gi,
    check: () => true,
    message: "Use 'many' with countable nouns",
    type: 'quantifier',
    suggestion: (match) => match[0].replace(/much/, 'many')
  },
  {
    pattern: /\bmany\s+(water|money|information|advice|furniture|luggage)\b/gi,
    check: () => true,
    message: "Use 'much' with uncountable nouns",
    type: 'quantifier',
    suggestion: (match) => match[0].replace(/many/, 'much')
  },
  
  // Preposition errors
  {
    pattern: /\bin\s+the\s+morning\b/gi,
    check: () => false, // This is actually correct
    message: "",
    type: 'preposition'
  },
  {
    pattern: /\bat\s+the\s+morning\b/gi,
    check: () => true,
    message: "Use 'in the morning' not 'at the morning'",
    type: 'preposition',
    suggestion: (match) => match[0].replace(/at/, 'in')
  },
  
  // Double negatives
  {
    pattern: /\b(don't|doesn't|didn't|won't|wouldn't|can't|couldn't)\s+\w*\s+(no|nothing|nobody|nowhere|never)\b/gi,
    check: () => true,
    message: "Avoid double negatives in formal English",
    type: 'double_negative',
    suggestion: (match) => "Consider: " + match[0].replace(/(don't|doesn't|didn't|won't|wouldn't|can't|couldn't)/, 'do/does/did/will/would/can/could')
  },
  
  // Punctuation
  {
    pattern: /[a-z]\.[A-Z]/g,
    check: () => true,
    message: "Add space after full stop",
    type: 'punctuation',
    suggestion: (match) => match[0].replace('.', '. ')
  },
  {
    pattern: /,[a-zA-Z]/g,
    check: () => true,
    message: "Add space after comma",
    type: 'punctuation',
    suggestion: (match) => match[0].replace(',', ', ')
  },
  
  // Capitalization
  {
    pattern: /\bi\s+/g,
    check: () => true,
    message: "Capitalize the pronoun 'I'",
    type: 'capitalization',
    suggestion: (match) => match[0].replace(/i/, 'I')
  },
  
  // Word order
  {
    pattern: /\balways\s+(am|is|are)\b/gi,
    check: () => true,
    message: "Adverbs of frequency go after 'be' verbs: 'am/is/are always'",
    type: 'word_order',
    suggestion: (match) => match[0].split(' ').reverse().join(' ')
  }
];

// ==============================================
// VOCABULARY ANALYSIS
// ==============================================

// Word lists by CEFR level
const VOCABULARY_LEVELS = {
  A1: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'],
  
  A2: ['should', 'say', 'each', 'which', 'their', 'time', 'if', 'will', 'up', 'other', 'how', 'its', 'our', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more', 'very', 'what', 'know', 'just', 'first', 'get', 'over', 'think', 'where', 'much', 'your', 'way', 'down', 'should', 'because', 'each', 'those', 'people', 'mr', 'here', 'take', 'why', 'things', 'help', 'put', 'years', 'different', 'number', 'right', 'move', 'thing', 'world', 'still', 'tell', 'try', 'kind', 'hand', 'high', 'every', 'own', 'under', 'last', 'red', 'read', 'never', 'am', 'us', 'left', 'end', 'along', 'while', 'might', 'next', 'sound', 'below', 'saw', 'something', 'thought', 'both', 'few', 'those', 'always', 'looked', 'show', 'large', 'often', 'together', 'asked', 'house', 'turn', 'move', 'live'],
  
  B1: ['important', 'children', 'side', 'feet', 'car', 'mile', 'night', 'walk', 'white', 'sea', 'began', 'grow', 'took', 'river', 'four', 'carry', 'state', 'once', 'book', 'hear', 'stop', 'without', 'second', 'later', 'miss', 'idea', 'enough', 'eat', 'face', 'watch', 'far', 'indian', 'really', 'almost', 'let', 'above', 'girl', 'sometimes', 'mountain', 'cut', 'young', 'talk', 'soon', 'list', 'song', 'leave', 'family', 'it\'s', 'body', 'music', 'color', 'stand', 'sun', 'questions', 'fish', 'area', 'mark', 'dog', 'horse', 'birds', 'problem', 'complete', 'room', 'knew', 'since', 'ever', 'piece', 'told', 'usually', 'didn\'t', 'friends', 'easy', 'heard', 'order', 'red', 'door', 'sure', 'become', 'top', 'ship', 'across', 'today', 'during', 'short', 'better', 'best', 'however', 'low', 'hours', 'black', 'products', 'happened', 'whole', 'measure', 'remember', 'early', 'waves', 'reached'],
  
  B2: ['although', 'appropriate', 'circumstances', 'colleagues', 'concentrate', 'consequences', 'definitely', 'eliminate', 'equipment', 'essential', 'familiar', 'immediately', 'independence', 'influence', 'intelligence', 'necessary', 'particular', 'personality', 'possibility', 'preparation', 'relationship', 'responsibility', 'situation', 'technology', 'tradition', 'university', 'appearance', 'arrangement', 'atmosphere', 'authority', 'beginning', 'celebration', 'comfortable', 'competition', 'condition', 'connection', 'consideration', 'construction', 'development', 'difficulty', 'discussion', 'economic', 'education', 'emergency', 'entertainment', 'establishment', 'examination', 'experience', 'explanation', 'government', 'independent', 'information', 'international', 'management', 'opportunity', 'organisation', 'performance', 'population', 'professional', 'recognition', 'requirement', 'significant', 'temperature', 'traditional', 'transportation'],
  
  C1: ['abundant', 'accommodate', 'acknowledge', 'controversial', 'demonstrate', 'distinguish', 'entrepreneur', 'fundamental', 'hypothesis', 'inevitable', 'magnificent', 'notorious', 'phenomenal', 'quintessential', 'sophisticated', 'tremendous', 'ubiquitous', 'unprecedented', 'ambiguous', 'benevolent', 'conscientious', 'diligent', 'eloquent', 'fastidious', 'grandiose', 'immaculate', 'judicious', 'meticulous', 'nonchalant', 'ostentatious', 'pragmatic', 'resilient', 'serendipity', 'articulate', 'comprehensive', 'contemporary', 'influential', 'prestigious', 'spontaneous', 'substantial', 'versatile', 'transcendent', 'anticipation', 'proclamation', 'reconciliation', 'revolutionary', 'indispensable', 'charismatic', 'peripheral', 'theoretical', 'apparatus', 'bureaucracy', 'catastrophe', 'elaboration', 'facilitation', 'implementation', 'juxtaposition', 'manifestation', 'optimization', 'rehabilitation']
};

// Advanced vocabulary indicators
const ADVANCED_STRUCTURES = [
  { pattern: /\b(although|however|nevertheless|furthermore|consequently|moreover|therefore)\b/gi, type: 'connectives', level: 'B2+' },
  { pattern: /\b(having\s+\w+ed|being\s+\w+ed|despite\s+\w+ing)\b/gi, type: 'complex_participles', level: 'C1+' },
  { pattern: /\b(not\s+only.*but\s+also|no\s+sooner.*than|hardly.*when)\b/gi, type: 'correlative_conjunctions', level: 'C1+' },
  { pattern: /\b(were\s+it\s+not\s+for|had\s+\w+\s+been|should\s+\w+\s+have)\b/gi, type: 'conditional_inversions', level: 'C1+' },
  { pattern: /\b(it\s+is\s+\w+\s+that|what\s+\w+\s+is)\b/gi, type: 'cleft_sentences', level: 'B2+' },
  { pattern: /\b(the\s+more.*the\s+more|the\s+\w+er.*the\s+\w+er)\b/gi, type: 'comparative_structures', level: 'B2+' }
];

// ==============================================
// MAIN ANALYSIS FUNCTIONS
// ==============================================

// Comprehensive spelling check
export const checkSpelling = (text) => {
  const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
  const errors = [];
  
  words.forEach((word, index) => {
    // Skip if it's a correct British spelling
    if (BRITISH_SPELLINGS[word]) {
      return;
    }
    
    // Check for common misspellings
    if (COMMON_MISSPELLINGS[word]) {
      errors.push({
        word: word,
        suggestion: COMMON_MISSPELLINGS[word],
        position: index,
        type: 'misspelling',
        severity: 'error'
      });
    }
    
    // Check for confused words (contextual analysis needed)
    if (CONFUSED_WORDS[word]) {
      const confusedWord = CONFUSED_WORDS[word];
      errors.push({
        word: word,
        suggestion: confusedWord.confused,
        rule: confusedWord.rule,
        position: index,
        type: 'word_confusion',
        severity: 'warning'
      });
    }
  });
  
  return errors;
};

// Advanced grammar checking
export const checkGrammar = (text) => {
  const errors = [];
  
  GRAMMAR_RULES.forEach(rule => {
    const matches = [...text.matchAll(rule.pattern)];
    
    matches.forEach(match => {
      if (rule.check(match)) {
        errors.push({
          text: match[0],
          message: rule.message,
          type: rule.type,
          position: match.index,
          suggestion: rule.suggestion ? rule.suggestion(match) : null,
          severity: rule.type === 'punctuation' ? 'warning' : 'error'
        });
      }
    });
  });
  
  return errors;
};

// Vocabulary analysis with CEFR levels
export const analyseVocabulary = (text) => {
  const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
  const uniqueWords = [...new Set(words)];
  
  const levelCounts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, other: 0 };
  const advancedFeatures = [];
  
  // Count words by level
  uniqueWords.forEach(word => {
    let found = false;
    for (const [level, wordList] of Object.entries(VOCABULARY_LEVELS)) {
      if (wordList.includes(word)) {
        levelCounts[level]++;
        found = true;
        break;
      }
    }
    if (!found) {
      levelCounts.other++;
    }
  });
  
  // Check for advanced structures
  ADVANCED_STRUCTURES.forEach(structure => {
    const matches = [...text.matchAll(structure.pattern)];
    if (matches.length > 0) {
      advancedFeatures.push({
        type: structure.type,
        level: structure.level,
        count: matches.length,
        examples: matches.slice(0, 3).map(m => m[0]) // Show first 3 examples
      });
    }
  });
  
  // Calculate lexical diversity
  const lexicalDiversity = words.length > 0 ? (uniqueWords.length / words.length * 100) : 0;
  
  // Estimate overall vocabulary level
  const totalLevelWords = Object.values(levelCounts).reduce((sum, count) => sum + count, 0);
  let estimatedLevel = 'A1';
  
  if (levelCounts.C1 > 2 || advancedFeatures.length > 2) estimatedLevel = 'C1';
  else if (levelCounts.B2 > 5 || advancedFeatures.length > 1) estimatedLevel = 'B2';
  else if (levelCounts.B1 > 10) estimatedLevel = 'B1';
  else if (levelCounts.A2 > 15) estimatedLevel = 'A2';
  
  return {
    totalWords: words.length,
    uniqueWords: uniqueWords.length,
    lexicalDiversity: Math.round(lexicalDiversity * 10) / 10,
    levelCounts,
    estimatedLevel,
    advancedFeatures,
    vocabularyRichness: levelCounts.C1 + levelCounts.B2 + levelCounts.other,
    basicWordRatio: Math.round((levelCounts.A1 / totalLevelWords) * 100) || 0
  };
};

// Sentence structure analysis
export const analyseStructure = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return {
      sentenceCount: 0,
      averageWordsPerSentence: 0,
      complexSentences: 0,
      complexity: 0,
      structureAnalysis: []
    };
  }
  
  const sentenceAnalysis = sentences.map(sentence => {
    const words = sentence.trim().split(/\s+/);
    const wordCount = words.length;
    
    // Complexity indicators
    const hasCoordination = /\b(and|but|or|yet|so)\b/i.test(sentence);
    const hasSubordination = /\b(because|although|since|while|if|when|where|that|which|who)\b/i.test(sentence);
    const hasParticiples = /\b\w+ing\b|\b\w+ed\b/g.test(sentence);
    const hasPassive = /\b(is|are|was|were|being|been)\s+\w+ed\b/i.test(sentence);
    
    let complexityScore = 0;
    if (wordCount > 15) complexityScore += 1;
    if (hasCoordination) complexityScore += 1;
    if (hasSubordination) complexityScore += 2;
    if (hasParticiples) complexityScore += 1;
    if (hasPassive) complexityScore += 1;
    
    return {
      sentence: sentence.trim(),
      wordCount,
      complexityScore,
      isComplex: complexityScore >= 2,
      features: {
        coordination: hasCoordination,
        subordination: hasSubordination,
        participles: hasParticiples,
        passive: hasPassive
      }
    };
  });
  
  const averageLength = sentenceAnalysis.reduce((sum, s) => sum + s.wordCount, 0) / sentences.length;
  const complexSentences = sentenceAnalysis.filter(s => s.isComplex).length;
  const complexityRatio = complexSentences / sentences.length;
  
  // Provide structure feedback
  const structureFeedback = [];
  
  if (averageLength < 8) {
    structureFeedback.push({
      type: 'sentence_length',
      message: 'Consider combining some short sentences to improve flow',
      severity: 'suggestion'
    });
  } else if (averageLength > 20) {
    structureFeedback.push({
      type: 'sentence_length',
      message: 'Some sentences are quite long - consider breaking them up',
      severity: 'warning'
    });
  }
  
  if (complexityRatio < 0.3) {
    structureFeedback.push({
      type: 'complexity',
      message: 'Try using more complex sentence structures (subordinate clauses, conjunctions)',
      severity: 'suggestion'
    });
  } else if (complexityRatio > 0.8) {
    structureFeedback.push({
      type: 'complexity',
      message: 'Good use of complex structures! Consider varying with some simple sentences',
      severity: 'positive'
    });
  }
  
  return {
    sentenceCount: sentences.length,
    averageWordsPerSentence: Math.round(averageLength * 10) / 10,
    complexSentences,
    complexity: Math.round(complexityRatio * 100),
    structureAnalysis: sentenceAnalysis,
    structureFeedback
  };
};

// Overall writing assessment
export const assessWriting = (text, minWords = 80, maxWords = 180) => {
  const spelling = checkSpelling(text);
  const grammar = checkGrammar(text);
  const vocabulary = analyseVocabulary(text);
  const structure = analyseStructure(text);
  
  // Calculate scores
  let spellingScore = Math.max(0, 100 - (spelling.length * 5));
  let grammarScore = Math.max(0, 100 - (grammar.length * 3));
  let vocabularyScore = 50 + (vocabulary.vocabularyRichness * 2) + (vocabulary.advancedFeatures.length * 10);
  let structureScore = 50 + (structure.complexity * 0.5) + (structure.complexSentences * 5);
  
  vocabularyScore = Math.min(100, vocabularyScore);
  structureScore = Math.min(100, structureScore);
  
  // Word count penalties/bonuses
  const wordCount = vocabulary.totalWords;
  let lengthScore = 100;
  if (wordCount < minWords) lengthScore = Math.max(0, 100 - ((minWords - wordCount) * 2));
  if (wordCount > maxWords) lengthScore = Math.max(80, 100 - ((wordCount - maxWords) * 1));
  
  // Overall score
  const overallScore = Math.round((spellingScore * 0.2 + grammarScore * 0.3 + vocabularyScore * 0.25 + structureScore * 0.25) * (lengthScore / 100));
  
  // Generate feedback level
  let feedbackLevel = 'A1';
  if (overallScore >= 90 && vocabulary.estimatedLevel === 'C1') feedbackLevel = 'C1';
  else if (overallScore >= 80 && vocabulary.estimatedLevel >= 'B2') feedbackLevel = 'B2';
  else if (overallScore >= 70 && vocabulary.estimatedLevel >= 'B1') feedbackLevel = 'B1';
  else if (overallScore >= 60) feedbackLevel = 'A2';
  
  return {
    overallScore,
    feedbackLevel,
    scores: {
      spelling: Math.round(spellingScore),
      grammar: Math.round(grammarScore),
      vocabulary: Math.round(vocabularyScore),
      structure: Math.round(structureScore),
      length: Math.round(lengthScore)
    },
    spelling,
    grammar,
    vocabulary,
    structure,
    wordCount,
    analysis: {
      strengths: generateStrengths(spelling, grammar, vocabulary, structure),
      improvements: generateImprovements(spelling, grammar, vocabulary, structure),
      nextSteps: generateNextSteps(feedbackLevel, vocabulary, structure)
    }
  };
};

// Helper functions for feedback generation
const generateStrengths = (spelling, grammar, vocabulary, structure) => {
  const strengths = [];
  
  if (spelling.length === 0) strengths.push("✅ Excellent spelling accuracy");
  if (grammar.length <= 2) strengths.push("✅ Good grammatical control");
  if (vocabulary.vocabularyRichness > 10) strengths.push("✅ Rich vocabulary usage");
  if (vocabulary.advancedFeatures.length > 0) strengths.push("✅ Use of advanced language structures");
  if (structure.complexity > 40) strengths.push("✅ Good sentence variety and complexity");
  if (structure.complexSentences > structure.sentenceCount * 0.3) strengths.push("✅ Effective use of complex sentences");
  
  return strengths.length > 0 ? strengths : ["✅ Keep practicing - improvement takes time!"];
};

const generateImprovements = (spelling, grammar, vocabulary, structure) => {
  const improvements = [];
  
  if (spelling.length > 3) improvements.push("📝 Focus on spelling accuracy - use spell-check tools");
  if (grammar.length > 3) improvements.push("📝 Review basic grammar rules, especially verb forms");
  if (vocabulary.basicWordRatio > 60) improvements.push("📝 Try using more varied and advanced vocabulary");
  if (structure.averageWordsPerSentence < 8) improvements.push("📝 Combine simple sentences for better flow");
  if (structure.complexity < 20) improvements.push("📝 Use more connecting words (because, although, however)");
  
  return improvements.length > 0 ? improvements : ["📝 Great work! Keep practicing to maintain your level"];
};

const generateNextSteps = (level, vocabulary, structure) => {
  const nextSteps = [];
  
  switch (level) {
    case 'A1':
    case 'A2':
      nextSteps.push("🎯 Focus on basic sentence structures and common vocabulary");
      nextSteps.push("🎯 Practice using simple connecting words (and, but, because)");
      break;
    case 'B1':
      nextSteps.push("🎯 Work on using more complex vocabulary and expressions");
      nextSteps.push("🎯 Practice subordinate clauses (which, that, where, when)");
      break;
    case 'B2':
      nextSteps.push("🎯 Focus on advanced connectives (however, furthermore, nevertheless)");
      nextSteps.push("🎯 Practice passive voice and participle constructions");
      break;
    case 'C1':
      nextSteps.push("🎯 Refine your use of sophisticated vocabulary and structures");
      nextSteps.push("🎯 Work on stylistic variety and advanced discourse markers");
      break;
  }
  
  return nextSteps;
};

// Export all functions
export {
  checkSpelling,
  checkGrammar,
  analyseVocabulary,
  analyseStructure,
  assessWriting,
  VOCABULARY_LEVELS,
  ADVANCED_STRUCTURES
};
