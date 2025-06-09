// src/components/LetterInput.js
import React, { useState, useRef, useEffect } from 'react';
import { getLettersToShow } from '../utils/quizHelpers';

function LetterInput({ word, value, onChange, disabled = false, className = '' }) {
  const [letters, setLetters] = useState(Array(word.length).fill(''));
  const inputRefs = useRef([]);
  
  // Calculate how many letters to pre-fill
  const lettersToShow = getLettersToShow(word);
  const preFilledLetters = word.substring(0, lettersToShow).split('');

  // Initialise refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, word.length);
  }, [word.length]);

  // Update letters when value prop changes or component mounts
  useEffect(() => {
    const newLetters = Array(word.length).fill('');
    
    // Pre-fill the visible letters
    preFilledLetters.forEach((letter, index) => {
      newLetters[index] = letter.toLowerCase();
    });
    
    // Add user input for remaining letters
    if (value) {
      const userInput = value.split('');
      userInput.forEach((letter, index) => {
        if (index < word.length) {
          newLetters[index] = letter.toLowerCase();
        }
      });
    }
    
    setLetters(newLetters);
  }, [value, word, lettersToShow]);

  const handleLetterChange = (index, newLetter) => {
    if (disabled) return;
    
    // Don't allow editing pre-filled letters
    if (index < lettersToShow) return;

    // Only allow single letters
    const cleanLetter = newLetter.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    const newLetters = [...letters];
    newLetters[index] = cleanLetter.slice(-1); // Take only the last character
    setLetters(newLetters);
    
    // Update parent component with complete word
    const newValue = newLetters.join('');
    onChange(newValue);

    // Auto-focus next input if letter was entered
    if (cleanLetter && index < word.length - 1) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    // Don't allow editing pre-filled letters
    if (index < lettersToShow && ['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // Handle backspace
    if (e.key === 'Backspace' && !letters[index] && index > lettersToShow) {
      // Find previous editable input
      for (let i = index - 1; i >= lettersToShow; i--) {
        const prevInput = inputRefs.current[i];
        if (prevInput) {
          prevInput.focus();
          break;
        }
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > lettersToShow) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < word.length - 1) {
      inputRefs.current[index + 1].focus();
    }
    
    // Handle Enter key - focus next empty box or submit
    if (e.key === 'Enter') {
      const nextEmptyIndex = letters.findIndex((letter, i) => i > index && i >= lettersToShow && !letter);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex].focus();
      }
    }
  };

  const handlePaste = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toLowerCase().replace(/[^a-zA-Z]/g, '');
    
    if (pastedText) {
      const newLetters = [...letters];
      let pasteIndex = 0;
      
      for (let i = lettersToShow; i < word.length && pasteIndex < pastedText.length; i++) {
        newLetters[i] = pastedText[pasteIndex];
        pasteIndex++;
      }
      
      setLetters(newLetters);
      onChange(newLetters.join(''));
      
      // Focus the next empty box or last editable box
      const nextIndex = Math.min(lettersToShow + pastedText.length, word.length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Focus first editable input when component mounts
  useEffect(() => {
    if (!disabled && lettersToShow < word.length) {
      setTimeout(() => {
        inputRefs.current[lettersToShow]?.focus();
      }, 100);
    }
  }, [lettersToShow, word.length, disabled]);

  return (
    <div className={`letter-input-container ${className}`}>
      {letters.map((letter, index) => {
        const isPreFilled = index < lettersToShow;
        const isEditable = !isPreFilled && !disabled;
        
        return (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            value={letter}
            onChange={e => handleLetterChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled || isPreFilled}
            className={`letter-input-box ${isPreFilled ? 'pre-filled' : ''} ${isEditable ? 'editable' : ''}`}
            maxLength={1}
            autoComplete="off"
            spellCheck="false"
            tabIndex={isEditable ? 0 : -1}
          />
        );
      })}
    </div>
  );
}

export default LetterInput;
