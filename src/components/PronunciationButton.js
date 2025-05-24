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
    if (!isSupported || !voicesLoaded || isPlaying) return;

    setIsPlaying(true);

    try {
      await speakWord(word);
      
      // Reset playing state after a delay
      setTimeout(() => {
        setIsPlaying(false);
      }, 1000);
    } catch (error) {
      console.error('Error playing pronunciation:', error);
      setIsPlaying(false);
    }
  };

  // Don't render if speech synthesis isn't supported
  if (!isSupported) {
    return null;
  }

  const buttonSizes = {
    small: {
      button: 'pronunciation-btn-small',
      icon: '🔊',
      iconSize: '0.8em'
    },
    medium: {
      button: 'pronunciation-btn-medium',
      icon: '🔊',
      iconSize: '1em'
    },
    large: {
      button: 'pronunciation-btn-large',
      icon: '🔊',
      iconSize: '1.2em'
    }
  };

  const sizeConfig = buttonSizes[size] || buttonSizes.medium;

  return (
    <div className="pronunciation-container">
      <button
        className={`pronunciation-btn ${sizeConfig.button} ${isPlaying ? 'playing' : ''}`}
        onClick={handleSpeak}
        disabled={isPlaying}
        title={`Listen to pronunciation of "${word}"`}
        aria-label={`Play pronunciation of ${word}`}
      >
        <span 
          className="pronunciation-icon"
          style={{ fontSize: sizeConfig.iconSize }}
        >
          {isPlaying ? '🎵' : sizeConfig.icon}
        </span>
        {showText && (
          <span className="pronunciation-text">
            {isPlaying ? 'Playing...' : 'Listen'}
          </span>
        )}
      </button>
      
      {pronunciation && (
        <div className="pronunciation-info">
          <span className="pronunciation-ipa" title="International Phonetic Alphabet">
            {pronunciation.ipa}
          </span>
          <span className="pronunciation-phonetic" title="Simplified pronunciation">
            {pronunciation.phonetic}
          </span>
        </div>
      )}
    </div>
  );
}

export default PronunciationButton;