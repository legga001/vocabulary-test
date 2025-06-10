// src/utils/contentFilter.js - Content filtering system
// Protects against inappropriate language in user input

// Common inappropriate words that need to be blocked
const BLOCKED_WORDS = [
  // Common profanity
  'damn', 'hell', 'crap', 'shit', 'fuck', 'fucking', 'fucked', 'fucker', 'bitch', 'bastard',
  'asshole', 'ass', 'piss', 'cock', 'dick', 'pussy', 'whore', 'slut', 'cunt',
  
  // Racial slurs and discriminatory terms
  'nigger', 'nigga', 'chink', 'gook', 'spic', 'wetback', 'kike', 'faggot', 'fag', 'dyke',
  'retard', 'retarded', 'spastic', 'cripple', 'midget', 'tranny', 'shemale',
  
  // Religious/cultural slurs
  'raghead', 'towelhead', 'curry', 'paki', 'jap', 'kraut', 'frog', 'limey',
  
  // Body-related inappropriate terms
  'tits', 'boobs', 'boob', 'penis', 'vagina', 'anus', 'testicles', 'scrotum',
  
  // Sexual content
  'sex', 'porn', 'porno', 'masturbate', 'orgasm', 'horny', 'sexy', 'nude', 'naked',
  
  // Variations and common misspellings
  'f*ck', 'f**k', 'sh*t', 'b*tch', 'a**hole', 'n*gger', 'f*g', 'sh1t', 'fuk', 'fuc',
  'shyt', 'biatch', 'azz', 'phuck', 'phuk', 'shiit', 'motherfucker', 'motherf*cker',
  
  // Internet slang versions
  'wtf', 'stfu', 'milf', 'dilf', 'thot', 'simp', 'incel',
  
  // Violence-related inappropriate terms
  'kill', 'murder', 'suicide', 'die', 'death', 'shoot', 'bomb', 'terrorist', 'nazi',
  
  // Drug-related terms
  'weed', 'marijuana', 'cocaine', 'heroin', 'meth', 'drugs', 'crack', 'pot', 'dope',
  
  // Additional offensive terms
  'stupid', 'idiot', 'moron', 'dumb', 'loser', 'ugly', 'fat', 'gay', 'lesbian'
];

// Common letter substitutions used to bypass filters
const LEETSPEAK_MAP = {
  '4': 'a', '3': 'e', '1': 'i', '0': 'o', '5': 's', '7': 't', '@': 'a',
  '!': 'i', '$': 's', '+': 't', 'ph': 'f', 'ck': 'ck', '©': 'c', '®': 'r'
};

// Convert leetspeak and common substitutions back to normal letters
const normaliseLeetSpeak = (text) => {
  let normalised = text.toLowerCase();
  
  // Replace common substitutions
  Object.entries(LEETSPEAK_MAP).forEach(([leet, normal]) => {
    const regex = new RegExp(leet, 'gi');
    normalised = normalised.replace(regex, normal);
  });
  
  // Remove common separators used to bypass filters
  normalised = normalised.replace(/[.\-_*+\s]/g, '');
  
  return normalised;
};

// Check if text contains blocked words
const containsBlockedContent = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  const originalText = text.toLowerCase().trim();
  const normalisedText = normaliseLeetSpeak(originalText);
  
  // Check both original and normalised versions
  const textsToCheck = [originalText, normalisedText];
  
  return textsToCheck.some(textToCheck => {
    return BLOCKED_WORDS.some(blockedWord => {
      // Exact word match (with word boundaries)
      const wordBoundaryRegex = new RegExp(`\\b${blockedWord}\\b`, 'i');
      if (wordBoundaryRegex.test(textToCheck)) return true;
      
      // Check for the word with common padding characters
      const paddedRegex = new RegExp(`[^a-z]${blockedWord}[^a-z]`, 'i');
      if (paddedRegex.test(` ${textToCheck} `)) return true;
      
      // For very short words, check if they make up most of the input
      if (blockedWord.length <= 4 && textToCheck.includes(blockedWord)) {
        return textToCheck.replace(/[^a-z]/gi, '').length <= blockedWord.length + 2;
      }
      
      return false;
    });
  });
};

// Get appropriate error message based on content type
const getFilterErrorMessage = (text) => {
  const normalisedText = normaliseLeetSpeak(text.toLowerCase());
  
  // Check what type of inappropriate content was detected
  const violenceWords = ['kill', 'murder', 'suicide', 'die', 'death', 'shoot', 'bomb', 'terrorist'];
  const profanityWords = ['damn', 'hell', 'shit', 'fuck', 'bitch', 'bastard', 'asshole'];
  const discriminatoryWords = ['nigger', 'nigga', 'chink', 'gook', 'spic', 'faggot', 'retard'];
  
  if (violenceWords.some(word => normalisedText.includes(word))) {
    return {
      title: 'Inappropriate Content Detected',
      message: 'Please keep your responses appropriate for a learning environment. Violence-related content is not allowed.',
      severity: 'high'
    };
  }
  
  if (discriminatoryWords.some(word => normalisedText.includes(word))) {
    return {
      title: 'Offensive Content Blocked',
      message: 'Discriminatory language and slurs are strictly prohibited. Please use respectful language.',
      severity: 'high'
    };
  }
  
  if (profanityWords.some(word => normalisedText.includes(word))) {
    return {
      title: 'Language Filter Active',
      message: 'Please use appropriate language for this educational exercise.',
      severity: 'medium'
    };
  }
  
  // Generic message for other blocked content
  return {
    title: 'Content Not Allowed',
    message: 'Please keep your responses appropriate and educational.',
    severity: 'medium'
  };
};

// Main filter function to be used in components
export const filterUserInput = (text) => {
  if (!text || typeof text !== 'string') {
    return { isAllowed: true, error: null };
  }
  
  // Basic length check
  if (text.trim().length === 0) {
    return { isAllowed: false, error: { title: 'Empty Input', message: 'Please enter some text.', severity: 'low' } };
  }
  
  // Check for blocked content
  if (containsBlockedContent(text)) {
    return {
      isAllowed: false,
      error: getFilterErrorMessage(text)
    };
  }
  
  return { isAllowed: true, error: null };
};

// Export for testing purposes (admin/debug use only)
export const getBlockedWordsCount = () => BLOCKED_WORDS.length;

// Check if filter is working (for testing)
export const testFilter = (testCases = []) => {
  const defaultTests = [
    { text: 'hello world', shouldPass: true },
    { text: 'fuck this', shouldPass: false },
    { text: 'what a beautiful day', shouldPass: true },
    { text: 'f*ck you', shouldPass: false },
    { text: '', shouldPass: false },
    { text: 'I love learning English', shouldPass: true }
  ];
  
  const tests = testCases.length > 0 ? testCases : defaultTests;
  
  return tests.map(test => {
    const result = filterUserInput(test.text);
    const passed = result.isAllowed === test.shouldPass;
    
    return {
      text: test.text,
      expected: test.shouldPass,
      actual: result.isAllowed,
      passed,
      error: result.error
    };
  });
};

// Utility to clean text while preserving educational content
export const sanitiseEducationalText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Remove only clearly inappropriate content while preserving educational words
  // This is more lenient than the input filter for displaying educational content
  const educationalExceptions = [
    'analysis', 'classic', 'assassin', 'grass', 'class', 'mass', 'pass',
    'glass', 'assessment', 'assignment', 'assistance', 'associate'
  ];
  
  let cleanText = text;
  
  // Only block the most severe terms when displaying educational content
  const severeTerms = BLOCKED_WORDS.filter(word => 
    word.length <= 4 || // Short offensive words
    ['nigger', 'faggot', 'cunt', 'fuck', 'shit'].includes(word) // Most offensive
  );
  
  severeTerms.forEach(term => {
    // Only replace if it's not part of an educational word
    const isEducational = educationalExceptions.some(exception => 
      exception.toLowerCase().includes(term.toLowerCase())
    );
    
    if (!isEducational) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      cleanText = cleanText.replace(regex, '*'.repeat(term.length));
    }
  });
  
  return cleanText;
};
