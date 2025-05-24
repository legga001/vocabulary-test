// src/utils/pronunciationUtils.js
// Utilities for handling pronunciation features

export const speakWord = (word, rate = 0.8, pitch = 1) => {
  // Check if speech synthesis is supported
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return false;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Set voice properties
    utterance.rate = rate; // Speed (0.1 to 10)
    utterance.pitch = pitch; // Pitch (0 to 2)
    utterance.volume = 0.9; // Volume (0 to 1)

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      // Try to use a British English voice if available
      const britishVoice = voices.find(voice => 
        voice.lang.includes('en-GB') || 
        voice.name.toLowerCase().includes('british') ||
        voice.name.toLowerCase().includes('uk') ||
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('kate')
      );
      
      if (britishVoice) {
        utterance.voice = britishVoice;
        console.log('Using British voice:', britishVoice.name);
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en-')
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
          console.log('Using English voice:', englishVoice.name);
        }
      }
    }

    // Add event listeners for debugging
    utterance.onstart = () => {
      console.log('Speech started for:', word);
    };

    utterance.onend = () => {
      console.log('Speech ended for:', word);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    // Speak the word
    window.speechSynthesis.speak(utterance);
    return true;

  } catch (error) {
    console.error('Error in text-to-speech:', error);
    return false;
  }
};

// Load voices (some browsers need this to be called after page load)
export const loadVoices = () => {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    }
  });
};

// Check if speech synthesis is available
export const isSpeechSynthesisSupported = () => {
  return 'speechSynthesis' in window;
};

// Get available English voices
export const getEnglishVoices = async () => {
  const voices = await loadVoices();
  return voices.filter(voice => voice.lang.startsWith('en-'));
};