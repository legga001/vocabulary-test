// src/hooks/useAudioPlayer.js - Custom Audio Hook
import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioPlayer = (currentData, currentQuestion) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

  // Reset audio state when question changes
  useEffect(() => {
    console.log('🔄 Resetting audio state for question', currentQuestion + 1);
    setIsPlaying(false);
    setPlayCount(0);
    setAudioError(false);
  }, [currentQuestion]);

  // Audio event handlers
  useEffect(() => {
    if (!audioRef.current || !currentData) {
      return;
    }

    const audio = audioRef.current;
    console.log('🎧 Setting up audio listeners for Q', currentQuestion + 1);
    
    const handleEnded = () => {
      console.log('🏁 Audio ended - Q', currentQuestion + 1, '- Resetting isPlaying');
      setIsPlaying(false);
    };

    const handleError = (e) => {
      console.error('🔴 Audio error:', e);
      setAudioError(true);
      setIsPlaying(false);
    };

    const handleLoadedData = () => {
      console.log('📁 Audio loaded - Q', currentQuestion + 1);
      setAudioError(false);
    };

    // Clean existing listeners
    audio.removeEventListener('ended', handleEnded);
    audio.removeEventListener('error', handleError);
    audio.removeEventListener('loadeddata', handleLoadedData);

    // Add fresh listeners
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [currentData, currentQuestion]);

  const playAudio = useCallback(() => {
    console.log('🎵 playAudio - Q', currentQuestion + 1, 'Count:', playCount, 'Playing:', isPlaying);
    
    if (!audioRef.current || !currentData || playCount >= 3 || audioError || isPlaying) {
      console.log('❌ Play blocked');
      return false;
    }

    const audio = audioRef.current;
    setIsPlaying(true);
    audio.currentTime = 0;
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          console.log('✅ Audio playing - Q', currentQuestion + 1);
          setPlayCount(prev => prev + 1);
        })
        .catch(error => {
          console.error('❌ Audio failed:', error);
          setAudioError(true);
          setIsPlaying(false);
        });
    }
    
    return true;
  }, [currentData, playCount, isPlaying, audioError, currentQuestion]);

  return {
    audioRef,
    isPlaying,
    playCount,
    audioError,
    playAudio
  };
};
