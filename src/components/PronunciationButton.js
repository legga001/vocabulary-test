// src/components/PronunciationButton.js
import React, { useState, useEffect } from 'react';
import { getPronunciation, hasPronunciation } from '../pronunciationData';
import { speakWord, isSpeechSynthesisSupported, loadVoices } from '../utils/pronunciationUtils';

function PronunciationButton({ word, size = 'medium', showText = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const pronunciation = getPronunciation(word);

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported(isSpeechSynthesisSupported());

    // Load voices
    loadVoices().then(() => {
      setVoicesLoaded(true);
    });
  }, []);

  const handleSpeak = async () => {
    if (!isSupported || isPlaying) return;

    setIsPlaying(true);

    try {
      // Force reload voices if they're not available
      if (!voicesLoaded || window.speechSynthesis.getVoices().length === 0) {
        await loadVoices();
        setVoicesLoaded(true);
      }

      const success = speakWord(word);
      
      if (!success) {
        console.warn('Speech synthesis failed, trying again...');
        // Try again after a short delay
        setTimeout(() => {
          speakWord(word);
        }, 100);
      }
      
      // Reset playing state after a delay
      setTimeout(() => {
        setIsPlaying(false);
      }, 1500);
    } catch (error) {
      console.error('Error playing pronunciation:', error);
      setIsPlaying(false);
    }
  };

  // Don't render if speech synthesis isn't supported
  if (!isSupported) {
    return null;
  }

  // Create tooltip content if pronunciation data exists
  const tooltipContent = pronunciation 
    ? `${pronunciation.ipa} • ${pronunciation.phonetic}`
    : `Listen to pronunciation of "${word}"`;

  return (
    <div className="pronunciation-container">
      <button
        className={`pronunciation-btn pronunciation-btn-compact ${isPlaying ? 'playing' : ''}`}
        onClick={handleSpeak}
        disabled={isPlaying}
        title={tooltipContent}
        aria-label={`Play pronunciation of ${word}`}
      >
        <span className="pronunciation-icon">
          {isPlaying ? '🎵' : '🔊'}
        </span>
        
        {/* Hover/focus tooltip */}
        {pronunciation && (
          <div className="pronunciation-tooltip">
            <div className="pronunciation-ipa">
              {pronunciation.ipa}
            </div>
            <div className="pronunciation-phonetic">
              {pronunciation.phonetic}
            </div>
          </div>
        )}
      </button>
    </div>
  );
}

export default PronunciationButton;