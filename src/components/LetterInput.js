// src/components/LetterInput.js - Fixed letter input component with proper individual boxes
import React, { useState, useRef, useEffect } from 'react';

function LetterInput({ word, value, onChange, disabled = false, className = '', onEnterPress }) {
  const [letters, setLetters] = useState([]);
  const inputRefs = useRef([]);
  
  // Function to determine how many letters to show at the start
  const getLettersToShow = (word) => {
    const length = word.length;
    if (length <= 3) return 1;
    if (length <= 5) return 2;
    if (length <= 7) return 3;
    if (length <= 9) return 4;
    if (length <= 11) return 5;
    return 6;
  };

  const lettersToShow = getLettersToShow(word);

  // Ensure we have the right number of input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, word.length);
  }, [word.length]);

  // Update letters array when word or value changes
  useEffect(() => {
    const newLetters = Array(word.length).fill('');
    
    // Pre-fill the visible letters (letters that are shown to the user)
    for (let i = 0; i < lettersToShow; i++) {
      newLetters[i] = word[i].toLowerCase();
    }
    
    // Add user input for the remaining letters
    if (value) {
      const userInput = value.split('');
      userInput.forEach((letter, index) => {
        const actualIndex = lettersToShow + index;
        if (actualIndex < word.length) {
          newLetters[actualIndex] = letter.toLowerCase();
        }
      });
    }
    
    setLetters(newLetters);
  }, [value, word, lettersToShow]);

  const handleLetterChange = (index, newLetter) => {
    // Don't allow changes to pre-filled letters or when disabled
    if (disabled || index < lettersToShow) return;

    // Only allow letters, clean the input
    const cleanLetter = newLetter.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    const newLetters = [...letters];
    newLetters[index] = cleanLetter.slice(-1); // Only take the last character if multiple typed
    setLetters(newLetters);
    
    // Build the user's answer (only the letters they've typed, not the pre-filled ones)
    const userTypedLetters = newLetters.slice(lettersToShow);
    onChange(userTypedLetters.join(''));

    // Auto-advance to next input if a letter was entered
    if (cleanLetter && index < word.length - 1) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput && !nextInput.disabled) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    // Prevent changes to pre-filled letters
    if (index < lettersToShow && ['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // Handle Enter key - check if we have a complete answer
    if (e.key === 'Enter' && onEnterPress) {
      const userTypedLetters = letters.slice(lettersToShow).join('');
      if (userTypedLetters.length >= 1) { // At least one user letter
        e.preventDefault();
        e.stopPropagation();
        onEnterPress();
        return;
      }
    }

    // Handle backspace navigation
    if (e.key === 'Backspace' && !letters[index] && index > lettersToShow) {
      // Find the previous editable input
      for (let i = index - 1; i >= lettersToShow; i--) {
        const prevInput = inputRefs.current[i];
        if (prevInput && !prevInput.disabled) {
          prevInput.focus();
          break;
        }
      }
    }
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > lettersToShow) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < word.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Auto-focus first editable input when component mounts or question changes
  useEffect(() => {
    if (!disabled && lettersToShow < word.length) {
      setTimeout(() => {
        if (inputRefs.current[lettersToShow]) {
          inputRefs.current[lettersToShow].focus();
        }
      }, 100);
    }
  }, [lettersToShow, word.length, disabled, word]);

  return (
    <div className={`letter-input-container ${className}`}>
      {letters.map((letter, index) => {
        const isPreFilled = index < lettersToShow;
        const isEditable = !isPreFilled && !disabled;
        
        return (
          <input
            key={`${word}-${index}`} // Unique key that includes word to force re-render
            ref={el => inputRefs.current[index] = el}
            type="text"
            value={letter}
            onChange={e => handleLetterChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            disabled={disabled || isPreFilled}
            className={`letter-input-box ${isPreFilled ? 'pre-filled' : ''} ${isEditable ? 'editable' : ''}`}
            maxLength={1}
            autoComplete="off"
            spellCheck="false"
            tabIndex={isEditable ? 0 : -1}
            aria-label={`Letter ${index + 1} of ${word.length}`}
          />
        );
      })}
    </div>
  );
}

export default LetterInput;
