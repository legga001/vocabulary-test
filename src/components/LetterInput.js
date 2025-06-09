// src/components/LetterInput.js
import React, { useState, useRef, useEffect } from 'react';

function LetterInput({ word, value, onChange, disabled = false, className = '' }) {
  const [letters, setLetters] = useState(Array(word.length).fill(''));
  const inputRefs = useRef([]);

  // Initialise refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, word.length);
  }, [word.length]);

  // Update letters when value prop changes
  useEffect(() => {
    if (value) {
      const newLetters = value.split('').concat(Array(word.length - value.length).fill(''));
      setLetters(newLetters.slice(0, word.length));
    } else {
      setLetters(Array(word.length).fill(''));
    }
  }, [value, word.length]);

  const handleLetterChange = (index, newLetter) => {
    if (disabled) return;

    // Only allow single letters
    const cleanLetter = newLetter.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    const newLetters = [...letters];
    newLetters[index] = cleanLetter.slice(-1); // Take only the last character
    setLetters(newLetters);
    
    // Update parent component
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

    // Handle backspace
    if (e.key === 'Backspace' && !letters[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < word.length - 1) {
      inputRefs.current[index + 1].focus();
    }
    
    // Handle Enter key - focus next empty box or submit
    if (e.key === 'Enter') {
      const nextEmptyIndex = letters.findIndex((letter, i) => i > index && !letter);
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
      for (let i = 0; i < Math.min(pastedText.length, word.length); i++) {
        newLetters[i] = pastedText[i];
      }
      setLetters(newLetters);
      onChange(newLetters.join(''));
      
      // Focus the next empty box or last box
      const nextIndex = Math.min(pastedText.length, word.length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={`letter-input-container ${className}`}>
      {letters.map((letter, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          value={letter}
          onChange={e => handleLetterChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="letter-input-box"
          maxLength={1}
          autoComplete="off"
          spellCheck="false"
        />
      ))}
    </div>
  );
}

export default LetterInput;
