// src/components/WritingExercise.js - Complete writing exercise with proper structure
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';
import '../styles/writing-exercise.css';

// Photo prompts for writing exercises
const PHOTO_PROMPTS = [
  {
    id: 'busy_city_street',
    image: '/images/writing-prompts/busy_city_street.jpg',
    title: 'Busy City Street',
    description: 'Describe this busy urban scene during rush hour',
    level: 'B1-B2',
    minWords: 50,
    maxWords: 80,
    prompt: "Describe this busy city scene. What are people doing? What can you see? What might people be thinking or feeling? Describe the atmosphere and energy of the street.",
    suggestedPoints: [
      'What types of transport can you see?',
      'Describe the buildings and architecture',
      'What activities are people doing?',
      'What is the mood and atmosphere?'
    ]
  },
  {
    id: 'family_picnic',
    image: '/images/writing-prompts/family_picnic.jpg',
    title: 'Family Picnic in Park',
    description: 'Describe this family gathering in the park',
    level: 'A2-B1',
    minWords: 40,
    maxWords: 60,
    prompt: "Describe this family picnic scene. Who might these people be? What activities are they doing? Describe the setting and atmosphere.",
    suggestedPoints: [
      'Who are the people and what are their relationships?',
      'What food and activities can you see?',
      'Describe the weather and surroundings',
      'What emotions do you notice?'
    ]
  },
  {
    id: 'coffee_shop',
    image: '/images/writing-prompts/coffee_shop.jpg',
    title: 'Busy Coffee Shop',
    description: 'Describe the atmosphere and activities in this coffee shop',
    level: 'B1-B2',
    minWords: 50,
    maxWords: 80,
    prompt: "Describe what's happening in this coffee shop. What are people doing? Describe the atmosphere and the different types of customers.",
    suggestedPoints: [
      'What are different people doing?',
      'Describe the interior and atmosphere',
      'What drinks and food can you see?',
      'What is the general mood?'
    ]
  },
  {
    id: 'playground',
    image: '/images/writing-prompts/playground.jpg',
    title: 'Children\'s Playground',
    description: 'Describe the activities and atmosphere at this playground',
    level: 'A2-B1',
    minWords: 40,
    maxWords: 60,
    prompt: "Describe what's happening at this playground. What games are children playing? What do you notice about the atmosphere?",
    suggestedPoints: [
      'What equipment and activities can you see?',
      'Describe the children and their emotions',
      'What are the adults doing?',
      'How does the place make you feel?'
    ]
  },
  {
    id: 'market_scene',
    image: '/images/writing-prompts/market_scene.jpg',
    title: 'Farmers Market',
    description: 'Describe this vibrant market scene',
    level: 'B1-B2',
    minWords: 50,
    maxWords: 80,
    prompt: "Describe this farmers market scene. What products can you see? Describe the interactions between people and the general atmosphere.",
    suggestedPoints: [
      'What fruits and vegetables can you see?',
      'How are people interacting?',
      'Describe the colours and smells you imagine',
      'What is the general mood of the market?'
    ]
  },
  {
    id: 'beach_day',
    image: '/images/writing-prompts/beach_day.jpg',
    title: 'Beach Day',
    description: 'Describe this sunny beach scene',
    level: 'A2-B1',
    minWords: 40,
    maxWords: 60,
    prompt: "Describe what's happening at this beach. What activities are people doing? Describe the weather and atmosphere.",
    suggestedPoints: [
      'What beach activities can you see?',
      'Describe the weather and environment',
      'What are people wearing and doing?',
      'How does the scene make you feel?'
    ]
  }
];

function WritingExercise({ onBack, onLogoClick }) {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [userText, setUserText] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [gameState, setGameState] = useState('selection'); // 'selection', 'writing', 'results'
  const [startTime, setStartTime] = useState(null);
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (gameState === 'writing' && startTime) {
      timerRef.current = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, startTime]);

  // Auto-focus textarea when writing starts
  useEffect(() => {
    if (gameState === 'writing' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [gameState]);

  const selectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setUserText('');
    setTimeSpent(0);
    setStartTime(Date.now());
    setGameState('writing');
  };

  const getWordCount = () => {
    if (!userText.trim()) return 0;
    return userText.trim().split(/\s+/).length;
  };

  const getWordCountStatus = () => {
    const wordCount = getWordCount();
    const { minWords, maxWords } = selectedPrompt;
    
    if (wordCount < minWords) {
      return { status: 'too-few', message: `${wordCount}/${minWords} words (need ${minWords - wordCount} more)` };
    } else if (wordCount > maxWords) {
      return { status: 'too-many', message: `${wordCount}/${maxWords} words (${wordCount - maxWords} too many)` };
    } else {
      return { status: 'good', message: `${wordCount} words (perfect!)` };
    }
  };

  const canSubmit = () => {
    const wordCount = getWordCount();
    return wordCount >= selectedPrompt.minWords && wordCount <= selectedPrompt.maxWords;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const submitWriting = () => {
    const wordCount = getWordCount();
    const timeInMinutes = Math.floor(timeSpent / 60);
    
    // Calculate a score based on word count relative to target
    const targetWords = (selectedPrompt.minWords + selectedPrompt.maxWords) / 2;
    const wordCountScore = Math.max(0, 100 - Math.abs(wordCount - targetWords) * 2);
    
    // Record the test result
    recordTestResult({
      quizType: 'writing',
      score: Math.round(wordCountScore),
      totalQuestions: 100, // Writing is scored out of 100
      completedAt: new Date(),
      timeSpent: timeInMinutes
    });

    // Note: incrementDailyTarget is temporarily disabled to fix build errors
    // incrementDailyTarget('writing');
    
    setGameState('results');
  };

  const restart = () => {
    setSelectedPrompt(null);
    setUserText('');
    setTimeSpent(0);
    setStartTime(null);
    setGameState('selection');
  };

  // Photo selection screen
  if (gameState === 'selection') {
    return (
      <div className="exercise-page writing-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="writing-header">
            <h1>✍️ Photo Description Exercise</h1>
            <p className="writing-subtitle">Choose a photo and describe what you see</p>
          </div>

          <div className="photo-grid">
            {PHOTO_PROMPTS.map((prompt) => (
              <div
                key={prompt.id}
                className="photo-card"
                onClick={() => selectPrompt(prompt)}
              >
                <div className="photo-container">
                  <img
                    src={prompt.image}
                    alt={prompt.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="photo-placeholder" style={{ display: 'none' }}>
                    <span className="photo-icon">🖼️</span>
                    <span>Image not available</span>
                  </div>
                </div>
                <div className="photo-info">
                  <h3 className="photo-title">{prompt.title}</h3>
                  <p className="photo-description">{prompt.description}</p>
                  <div className="photo-meta">
                    <span className="level-badge">{prompt.level}</span>
                    <span className="word-count">{prompt.minWords}-{prompt.maxWords} words</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="back-button-container">
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Writing screen
  if (gameState === 'writing') {
    const wordCountStatus = getWordCountStatus();

    return (
      <div className="exercise-page writing-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="writing-header">
            <h2>✍️ {selectedPrompt.title}</h2>
            <div className="writing-stats">
              <div className="timer">
                <span className="timer-icon">⏱️</span>
                <span>{formatTime(timeSpent)}</span>
              </div>
              <div className={`word-counter ${wordCountStatus.status}`}>
                <span className="word-icon">📝</span>
                <span>{wordCountStatus.message}</span>
              </div>
            </div>
          </div>

          <div className="writing-content">
            <div className="photo-section">
              <div className="selected-photo">
                <img
                  src={selectedPrompt.image}
                  alt={selectedPrompt.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="photo-placeholder" style={{ display: 'none' }}>
                  <span className="photo-icon">🖼️</span>
                  <span>Image not available</span>
                </div>
              </div>
              
              <div className="prompt-section">
                <h3>Writing Prompt:</h3>
                <p className="prompt-text">{selectedPrompt.prompt}</p>
                
                <div className="suggested-points">
                  <h4>💡 Things to consider:</h4>
                  <ul>
                    {selectedPrompt.suggestedPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="writing-section">
              <div className="textarea-container">
                <textarea
                  ref={textareaRef}
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Start writing your description here..."
                  className="writing-textarea"
                  rows={15}
                />
                
                <div className="writing-actions">
                  <button
                    className={`btn btn-primary ${canSubmit() ? '' : 'disabled'}`}
                    onClick={submitWriting}
                    disabled={!canSubmit()}
                  >
                    ✅ Submit Writing
                  </button>
                  
                  <button className="btn btn-secondary" onClick={restart}>
                    🔄 Choose Different Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState === 'results') {
    const wordCount = getWordCount();
    const timeInMinutes = Math.floor(timeSpent / 60);
    const timeInSeconds = timeSpent % 60;

    return (
      <div className="exercise-page writing-exercise">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="results-header">
            <h1>📊 Writing Complete!</h1>
            <div className="completion-message">
              <span className="completion-icon">🎉</span>
              <span>Great job on your writing!</span>
            </div>
          </div>

          <div className="results-stats">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <div className="stat-value">{wordCount}</div>
                <div className="stat-label">Words Written</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-value">{timeInMinutes}:{timeInSeconds.toString().padStart(2, '0')}</div>
                <div className="stat-label">Time Spent</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <div className="stat-value">{selectedPrompt.level}</div>
                <div className="stat-label">Level</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📏</div>
              <div className="stat-info">
                <div className="stat-value">{selectedPrompt.minWords}-{selectedPrompt.maxWords}</div>
                <div className="stat-label">Target Range</div>
              </div>
            </div>
          </div>

          <div className="writing-review">
            <h3>📖 Your Writing:</h3>
            <div className="user-writing-display">
              <div className="writing-meta">
                <span className="writing-topic">Topic: {selectedPrompt.title}</span>
              </div>
              <div className="writing-text">
                {userText}
              </div>
            </div>
          </div>

          <div className="results-actions">
            <button className="btn btn-primary" onClick={restart}>
              ✍️ Write About Another Photo
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              ← Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default WritingExercise;
