// src/hooks/useAutoPlay.js - Fixed Auto-play Logic Hook
import { useEffect } from 'react';

export const useAutoPlay = (hasStarted, currentData, showResults, currentQuestion, playCount, playAudio) => {
  useEffect(() => {
    // Only auto-play when exercise has started, we have data, not showing results
    if (!hasStarted || !currentData || showResults) {
      console.log('❌ Auto-play blocked:', { hasStarted, hasData: !!currentData, showResults });
      return;
    }

    // Only auto-play if we haven't played anything yet for this question
    if (playCount === 0) {
      console.log('🎵 Setting up auto-play for Q', currentQuestion + 1, 'playCount:', playCount);
      
      const autoPlayTimer = setTimeout(() => {
        console.log('🚀 AUTO-PLAYING Q', currentQuestion + 1, 'current playCount:', playCount);
        
        // Double-check we can still auto-play (playCount might have changed)
        playAudio();
      }, 1500);

      return () => {
        console.log('⏰ Clearing auto-play timer for Q', currentQuestion + 1);
        clearTimeout(autoPlayTimer);
      };
    } else {
      console.log('⏭️ Skipping auto-play for Q', currentQuestion + 1, '- already played', playCount, 'times');
    }
  }, [hasStarted, currentData, showResults, currentQuestion, playCount, playAudio]); // Include playCount to detect resets
};
