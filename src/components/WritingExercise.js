// src/components/WritingExercise.js - Complete writing exercise with actual image display
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';
import { incrementDailyTarget } from './LandingPage';
import '../styles/writing-exercise.css';

// Photo prompts for writing exercises - with uploaded images
const PHOTO_PROMPTS = [
  {
    id: 'busy_city_street',
    image: '/images/writing-prompts/busy_city_street.jpg',
    title: 'Busy City Street',
    description: 'Describe this busy urban scene during rush hour',
    level: 'B1-B2',
    minWords: 100,
    maxWords: 180,
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
    minWords: 80,
    maxWords: 150,
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
    minWords: 90,
    maxWords: 160,
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
    minWords: 80,
    maxWords: 140,
    prompt: "Describe what's happening at this playground. What games are children playing? What do you notice about the atmosphere?",
    suggestedPoints: [
      'What equipment and activities can you see?',
      'Describe the children and their emotions',
      'What are the adults doing?',
      'How does the place make you feel?'
    ]
  },
  {
    id: 'farmers_market',
    image: '/images/writing-prompts/farmers_market.jpg',
    title: 'Farmer\'s Market',
    description: 'Describe the vibrant atmosphere of this outdoor market',
    level: 'B1-B2',
    minWords: 100,
    maxWords: 170,
    prompt: "Describe this market scene. What products can you see? How do people interact? Describe the colours, atmosphere, and community feeling.",
    suggestedPoints: [
      'What types of food and products are available?',
      'How do vendors and customers interact?',
      'Describe the colours and visual details',
      'What does this tell us about the community?'
    ]
  },
  {
    id: 'library',
    image: '/images/writing-prompts/library.jpg',
    title: 'Library Study Scene',
    description: 'Describe the academic atmosphere in this library',
    level: 'B1-B2',
    minWords: 90,
    maxWords: 160,
    prompt: "Describe what's happening in this library. What are students doing? Describe the environment and atmosphere for learning.",
    suggestedPoints: [
      'What study activities can you see?',
      'Describe the physical environment',
      'What is the general atmosphere?',
      'How do students behave in this space?'
    ]
  },
  {
    id: 'beach_scene',
    image: '/images/writing-prompts/beach_scene.jpg',
    title: 'Beach Holiday Scene',
    description: 'Describe this relaxing day at the beach',
    level: 'A2-B1',
    minWords: 80,
    maxWords: 150,
    prompt: "Describe this beach scene. What holiday activities are taking place? Describe the weather, people, and atmosphere.",
    suggestedPoints: [
      'What beach activities can you see?',
      'Describe the weather and natural setting',
      'What are different people doing?',
      'How does this scene make you feel?'
    ]
  },
  {
    id: 'train_station',
    image: '/images/writing-prompts/train_station.jpg',
    title: 'Train Station',
    description: 'Describe the busy atmosphere of this transport hub',
    level: 'B1-B2',
    minWords: 100,
    maxWords: 170,
    prompt: "Describe this train station scene. What are people doing? Where might they be going? Describe the atmosphere and energy.",
    suggestedPoints: [
      'What travel activities can you see?',
      'Describe the architecture and environment',
      'What emotions might people be feeling?',
      'What does this tell us about modern travel?'
    ]
  }
];

// Model answers for comparison
const MODEL_ANSWERS = {
  busy_city_street: "This vibrant urban scene captures the essence of city life during rush hour. The streets buzz with activity as people hurry along pavements, their faces focused and determined. Double-decker buses weave through traffic whilst cyclists navigate between cars, creating a symphony of urban movement. The towering buildings create narrow corridors filled with the energy of commerce and daily life. You can sense the urgency in people's body language - some clutching mobile phones, others carrying briefcases or shopping bags. The atmosphere is electric with purpose and ambition, representing the heartbeat of modern metropolitan life where thousands of individual stories intersect briefly before diverging towards their separate destinations.",

  family_picnic: "This charming park scene depicts a perfect family gathering on a sunny afternoon. Parents and children have spread colourful blankets on the grass, creating a cosy outdoor dining space. The children appear delighted, some playing catch whilst others help unpack sandwiches and fruit from wicker baskets. The adults chat leisurely, occasionally calling out encouragement to the playing children. Tall trees provide dappled shade, and the warm sunlight suggests an ideal day for outdoor activities. The atmosphere radiates contentment and togetherness, showing how simple pleasures like sharing food in nature can strengthen family bonds and create lasting memories.",

  coffee_shop: "The bustling coffee shop creates a warm, inviting atmosphere where diverse activities unfold simultaneously. Students hunched over laptops occupy corner tables, occasionally glancing up from their screens to people-watch. Business professionals engage in animated discussions over steaming mugs whilst mothers with pushchairs enjoy brief respites from daily routines. The baristas work efficiently behind the counter, creating a rhythmic soundtrack of grinding, steaming, and friendly conversation. Rich aromas of freshly brewed coffee mingle with the gentle hum of conversation, creating an environment that serves as both workspace and social hub for the local community.",

  playground: "This lively playground buzzes with childhood joy and energy. Children of various ages engage in different activities - some conquering climbing frames with determined concentration whilst others soar high on swings, their laughter carrying across the space. Parents and guardians watch from nearby benches, occasionally offering encouragement or gentle guidance. The colourful equipment contrasts beautifully with the green grass and blue sky, creating an environment designed for both fun and development. The atmosphere is one of pure happiness and freedom, where children can express themselves naturally whilst developing social skills and physical confidence.",

  farmers_market: "This vibrant farmers' market showcases the best of local community life and fresh produce. Colourful stalls display an abundance of seasonal vegetables, fragrant herbs, and artisanal products whilst vendors enthusiastically describe their offerings to interested customers. Families wander between stalls, children marvelling at the variety whilst parents make thoughtful selections. The atmosphere combines the energy of commerce with the warmth of community connection, as regular customers greet familiar farmers by name. Rich colours of red tomatoes, green lettuce, and golden bread create a feast for the eyes, representing the connection between rural producers and urban consumers.",

  library: "The peaceful library environment facilitates deep concentration and learning. Students occupy individual desks and study tables, surrounded by towering bookshelves that reach towards high ceilings. Some work silently through textbooks whilst others collaborate quietly on group projects. The soft lighting and comfortable seating create an atmosphere conducive to extended study sessions. Librarians move discretely amongst the stacks, always ready to assist with research enquiries. The space represents a sanctuary of knowledge where academic pursuits flourish, combining traditional books with modern technology to support diverse learning styles and educational goals.",

  beach_scene: "This idyllic beach scene captures the essence of a perfect holiday day. Families have claimed spots on the golden sand, some building elaborate sandcastles whilst others simply relax under colourful umbrellas. Children splash joyfully in the gentle waves whilst adults alternate between swimming and sunbathing. Beach volleyball players add energy to one corner whilst dog walkers enjoy the vast open space. The brilliant blue sky and warm sunshine create an atmosphere of complete relaxation and escape from daily routines. This scene represents the rejuvenating power of natural coastal environments.",

  train_station: "The bustling train station serves as a fascinating microcosm of modern travel and human connectivity. Commuters check departure boards anxiously whilst families navigate with heavy luggage towards holiday destinations. The impressive Victorian architecture contrasts with modern electronic displays, creating a bridge between historical grandeur and contemporary efficiency. Announcements echo across the vast space as people from diverse backgrounds briefly share this transitional moment in their journeys. The atmosphere combines excitement and routine, representing how transportation hubs facilitate both ordinary commutes and extraordinary adventures across the country and beyond."
};

function WritingExercise({ onBack, onLogoClick }) {
  // Core state
  const [currentStep, setCurrentStep] = useState('selection'); // selection, writing, feedback
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [userText, setUserText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // Refs
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerActive, timeRemaining]);

  // Word count effect
  useEffect(() => {
    const words = userText.trim() ? userText.trim().split(/\s+/) : [];
    setWordCount(words.length);
  }, [userText]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start writing exercise with random prompt
  const startWriting = () => {
    const randomPrompt = PHOTO_PROMPTS[Math.floor(Math.random() * PHOTO_PROMPTS.length)];
    setSelectedPrompt(randomPrompt);
    setCurrentStep('writing');
    setUserText('');
    setTimeRemaining(300);
    setIsTimerActive(true);
    setStartTime(Date.now());
    
    // Focus textarea after a short delay
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  // Handle timer expiry
  const handleTimeUp = () => {
    if (userText.trim()) {
      generateFeedback();
    } else {
      setCurrentStep('selection');
      alert('Time is up! Please write something before the timer expires.');
    }
  };

  // Generate feedback
  const generateFeedback = () => {
    let score = 50; // Base score
    
    // Word count scoring
    if (wordCount >= selectedPrompt.minWords && wordCount <= selectedPrompt.maxWords) {
      score += 20;
    } else if (wordCount >= selectedPrompt.minWords * 0.8) {
      score += 10;
    }
    
    // Length and effort scoring
    if (wordCount >= 100) score += 10;
    if (wordCount >= 150) score += 5;
    
    // Simple quality indicators
    const sentences = userText.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length >= 5) score += 10;
    
    // Descriptive vocabulary bonus
    const descriptiveWords = ['beautiful', 'vibrant', 'peaceful', 'busy', 'colourful', 'atmosphere', 'energy', 'feeling', 'emotion'];
    const foundDescriptive = descriptiveWords.filter(word => 
      userText.toLowerCase().includes(word)
    );
    score += Math.min(foundDescriptive.length * 2, 10);
    
    // Time bonus
    const timeUsed = 300 - timeRemaining;
    if (timeUsed >= 180) score += 5; // Used at least 3 minutes
    
    // Cap at 100
    score = Math.min(score, 100);
    
    setFeedback({
      score: score,
      wordCount: wordCount,
      timeUsed: startTime ? Math.round((Date.now() - startTime) / 1000) : 0,
      suggestions: generateSuggestions(wordCount, selectedPrompt)
    });
    
    setCurrentStep('feedback');
    
    // Record test result and increment daily target
    recordTestResult({
      quizType: 'writing',
      score: Math.round(score / 10), // Convert to 0-10 scale
      totalQuestions: 1,
      completedAt: new Date(),
      timeSpent: startTime ? Math.round((Date.now() - startTime) / 1000) : 0,
      userAnswers: [{
        answer: userText.substring(0, 100) + '...',
        correct: score >= 70,
        score: score
      }]
    });
    
    // Increment daily target for writing
    incrementDailyTarget('writing');
  };

  // Generate basic suggestions
  const generateSuggestions = (wordCount, prompt) => {
    const suggestions = [];
    
    if (wordCount < prompt.minWords) {
      suggestions.push("Try to write more details about what you see in the image");
      suggestions.push("Describe the emotions and atmosphere more fully");
    }
    
    if (wordCount > prompt.maxWords) {
      suggestions.push("Try to be more concise while keeping the essential details");
    }
    
    suggestions.push("Compare your writing with the model answer to see different ways to express ideas");
    suggestions.push("Pay attention to how the model answer uses descriptive vocabulary");
    
    return suggestions;
  };

  // Restart exercise
  const restartExercise = () => {
    setCurrentStep('selection');
    setSelectedPrompt(null);
    setUserText('');
    setTimeRemaining(300);
    setIsTimerActive(false);
    setFeedback(null);
    setStartTime(null);
  };

  // SELECTION SCREEN
  if (currentStep === 'selection') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>✍️ Writing Exercise</h1>
          
          <div className="writing-instructions">
            <h3>📝 Photo Description Task</h3>
            <p>You'll see a photo and write a detailed description.
            You have 5 minutes to write between 80-200 words depending on the difficulty level.</p>
            
            <div className="instruction-list">
              <div className="instruction-item">
                <span className="instruction-icon">📷</span>
                <span>One random photo prompt</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⏰</span>
                <span>5-minute time limit</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📊</span>
                <span>Instant feedback and scoring</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎯</span>
                <span>Compare with model answer</span>
              </div>
            </div>
          </div>

          <div className="exercise-start">
            <button className="btn btn-primary btn-large" onClick={startWriting}>
              🚀 Start Writing Exercise
            </button>
            <p className="start-note">Click to begin with a random photo prompt</p>
          </div>

          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Exercise Selection
          </button>
        </div>
      </div>
    );
  }

  // WRITING SCREEN
  if (currentStep === 'writing') {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="writing-header">
            <h2>✍️ {selectedPrompt.title}</h2>
            <div className="writing-controls">
              <div className={`timer ${timeRemaining <= 60 ? 'urgent' : ''}`}>
                ⏰ {formatTime(timeRemaining)}
              </div>
              <div className="word-counter">
                📝 {wordCount} words
                <small>({selectedPrompt.minWords}-{selectedPrompt.maxWords})</small>
              </div>
            </div>
          </div>

          <div className="writing-prompt">
            <div className="prompt-image-container">
              <img 
                src={selectedPrompt.image} 
                alt={selectedPrompt.title}
                className="prompt-image"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="photo-placeholder" style={{display: 'none'}}>
                <div className="photo-icon">📷</div>
                <small>{selectedPrompt.title}</small>
                <p className="placeholder-note">
                  Image not available - use your imagination!
                </p>
              </div>
            </div>
            <div className="prompt-text">
              <strong>Your task:</strong> {selectedPrompt.prompt}
            </div>
            <div className="level-indicator">
              <span className="level-badge">{selectedPrompt.level}</span>
            </div>
          </div>

          <div className="writing-area">
            <textarea
              ref={textareaRef}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Start writing your description here..."
              className="writing-textarea"
              spellCheck="true"
            />
          </div>

          <div className="writing-footer">
            <button 
              className="btn btn-primary"
              onClick={generateFeedback}
              disabled={wordCount < 20}
            >
              ✅ Submit Writing
            </button>
            <button className="btn btn-secondary" onClick={restartExercise}>
              🔄 Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FEEDBACK SCREEN
  if (currentStep === 'feedback') {
    return (
      <div className="exercise-page scrollable-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <h1>📊 Writing Feedback</h1>
          
          <div className="feedback-score">
            <div className="score-circle">
              <span className="score-number">{feedback.score}</span>
              <span className="score-label">/ 100</span>
            </div>
            <div className="score-message">
              {feedback.score >= 90 ? '🌟 Excellent work!' :
               feedback.score >= 80 ? '🎉 Very good writing!' :
               feedback.score >= 70 ? '👍 Good effort!' :
               feedback.score >= 60 ? '📈 Keep improving!' :
               '💪 Practice makes perfect!'}
            </div>
          </div>

          <div className="feedback-section">
            <h3>📊 Writing Statistics</h3>
            <div className="writing-stats">
              <div className="stat-item">
                <span className="stat-label">Words Written</span>
                <span className="stat-value">{feedback.wordCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Target Range</span>
                <span className="stat-value">{selectedPrompt.minWords}-{selectedPrompt.maxWords}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time Used</span>
                <span className="stat-value">{Math.floor(feedback.timeUsed / 60)}:{(feedback.timeUsed % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="feedback-section">
            <h3>📝 Your Writing</h3>
            <div className="user-writing">
              {userText}
            </div>
          </div>

          <div className="feedback-section">
            <h3>🎯 Model Answer</h3>
            <div className="model-answer">
              {MODEL_ANSWERS[selectedPrompt.id]}
            </div>
            <div className="comparison-tips">
              <h4>💡 Comparison Tips</h4>
              <ul>
                <li>Notice how the model answer uses varied vocabulary</li>
                <li>Look at the sentence structure and transitions</li>
                <li>See how emotions and atmosphere are described</li>
                <li>Compare the level of detail and specific observations</li>
              </ul>
            </div>
          </div>

          <div className="feedback-section">
            <h3>💡 Suggestions for Improvement</h3>
            <div className="suggestions-list">
              {feedback.suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>

          <div className="feedback-actions">
            <button className="btn btn-primary" onClick={startWriting}>
              📝 Try Another Writing
            </button>
            <button className="btn btn-secondary" onClick={restartExercise}>
              🔄 Back to Start
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              ← Exercise Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
