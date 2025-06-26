// src/hooks/useAudioPlayer.js - Fixed Audio Hook with proper state reset
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

    const handlePlay = () => {
      console.log('▶️ Audio started playing - Q', currentQuestion + 1);
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️ Audio paused - Q', currentQuestion + 1);
      setIsPlaying(false);
    };

    // Clean existing listeners
    audio.removeEventListener('ended', handleEnded);
    audio.removeEventListener('error', handleError);
    audio.removeEventListener('loadeddata', handleLoadedData);
    audio.removeEventListener('play', handlePlay);
    audio.removeEventListener('pause', handlePause);

    // Add fresh listeners
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentData, currentQuestion]);

  const playAudio = useCallback(() => {
    console.log('🎵 playAudio called - Q', currentQuestion + 1, 'Count:', playCount, 'Playing:', isPlaying);
    
    if (!audioRef.current || !currentData || playCount >= 3 || audioError) {
      console.log('❌ Play blocked - no audio/data, max plays reached, or error');
      return false;
    }

    // If already playing, don't start again
    if (isPlaying) {
      console.log('❌ Play blocked - already playing');
      return false;
    }

    const audio = audioRef.current;
    
    // Reset to beginning
    audio.currentTime = 0;
    
    // Increment play count immediately
    setPlayCount(prev => {
      const newCount = prev + 1;
      console.log('📊 Play count updated to:', newCount);
      return newCount;
    });
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          console.log('✅ Audio successfully started - Q', currentQuestion + 1);
        })
        .catch(error => {
          console.error('❌ Audio failed to play:', error);
          setAudioError(true);
          setIsPlaying(false);
          // Revert play count on error
          setPlayCount(prev => Math.max(0, prev - 1));
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
