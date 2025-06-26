// src/hooks/useAutoPlay.js - Auto-play Logic Hook
import { useEffect } from 'react';

export const useAutoPlay = (hasStarted, currentData, showResults, currentQuestion, playCount, playAudio) => {
  useEffect(() => {
    // Only auto-play when exercise has started, we have data, not showing results
    if (!hasStarted || !currentData || showResults) {
      return;
    }

    // Only auto-play if we haven't played anything yet for this question
    if (playCount === 0) {
      console.log('🎵 Setting up auto-play for Q', currentQuestion + 1);
      
      const autoPlayTimer = setTimeout(() => {
        console.log('🚀 AUTO-PLAYING Q', currentQuestion + 1);
        
        // Double-check we can still auto-play
        if (playCount === 0) {
          playAudio();
        } else {
          console.log('❌ Auto-play cancelled - playCount changed');
        }
      }, 1500);

      return () => {
        console.log('⏰ Clearing auto-play timer for Q', currentQuestion + 1);
        clearTimeout(autoPlayTimer);
      };
    }
  }, [hasStarted, currentData, showResults, currentQuestion]); // Intentionally exclude playCount to avoid circular deps
};
