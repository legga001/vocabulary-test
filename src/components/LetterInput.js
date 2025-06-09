// src/components/LetterInput.js - Simple test version
import React, { useState, useRef, useEffect } from 'react';

function LetterInput({ word, value, onChange, disabled = false, className = '' }) {
  const [letters, setLetters] = useState([]);
  const inputRefs = useRef([]);
  
  // Simple function to determine letters to show
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

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, word.length);
  }, [word.length]);

  useEffect(() => {
    const newLetters = Array(word.length).fill('');
    
    // Pre-fill the visible letters
    for (let i = 0; i < lettersToShow; i++) {
      newLetters[i] = word[i].toLowerCase();
    }
    
    // Add user input
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
    if (disabled || index < lettersToShow) return;

    const cleanLetter = newLetter.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    const newLetters = [...letters];
    newLetters[index] = cleanLetter.slice(-1);
    setLetters(newLetters);
    
    onChange(newLetters.join(''));

    if (cleanLetter && index < word.length - 1) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    if (index < lettersToShow && ['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace' && !letters[index] && index > lettersToShow) {
      for (let i = index - 1; i >= lettersToShow; i--) {
        const prevInput = inputRefs.current[i];
        if (prevInput) {
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
  }, [lettersToShow, word.length, disabled, word]); // Added 'word' dependency

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
