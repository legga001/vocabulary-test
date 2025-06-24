// src/components/WritingExercise.js - Complete writing exercise with photo description
import React, { useState, useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';
import { recordTestResult } from '../utils/progressDataManager';
import { incrementDailyTarget } from './LandingPage';
import '../styles/writing-exercise.css';

// Photo prompts for writing exercises - ready for DALL-E images
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
  },
  {
    id: 'restaurant_kitchen',
    image: '/images/writing-prompts/restaurant_kitchen.jpg',
    title: 'Restaurant Kitchen',
    description: 'Describe the professional atmosphere in this busy kitchen',
    level: 'B2-C1',
    minWords: 120,
    maxWords: 200,
    prompt: "Describe what's happening in this professional kitchen. How do the chefs work together? Describe the pace, atmosphere, and teamwork.",
    suggestedPoints: [
      'What cooking activities are taking place?',
      'How do the chefs work as a team?',
      'Describe the pace and energy',
      'What challenges might they face?'
    ]
  },
  {
    id: 'hospital_waiting',
    image: '/images/writing-prompts/hospital_waiting.jpg',
    title: 'Hospital Waiting Room',
    description: 'Describe the atmosphere and emotions in this healthcare setting',
    level: 'B1-B2',
    minWords: 90,
    maxWords: 160,
    prompt: "Describe this hospital waiting room. What are people doing? What emotions can you sense? Describe the atmosphere.",
    suggestedPoints: [
      'What activities are people doing while waiting?',
      'What emotions might people be feeling?',
      'Describe the physical environment',
      'How do people interact in this setting?'
    ]
  }
];

// Model answers for comparison
const MODEL_ANSWERS = {
  busy_city_street: "This bustling city street captures the energy of modern urban life during rush hour. People hurry along crowded pavements, their faces focused and determined as they navigate their daily commutes. Red buses and black taxis weave through heavy traffic whilst pedestrians wait at crossings. The tall glass buildings reflect the afternoon sunlight, creating interesting patterns of light and shadow. Street vendors add colour to the scene, and the overall atmosphere feels purposeful and dynamic, representing the fast pace of city living.",
  
  family_picnic: "This heartwarming family picnic shows multiple generations enjoying quality time together in a beautiful park setting. Children play happily on the grass whilst adults chat and prepare food on a colourful picnic blanket. The sunny weather creates a perfect backdrop for outdoor family bonding. Everyone appears relaxed and content, with genuine smiles and laughter filling the air. The scene represents the simple pleasures of family life and the importance of spending time together away from daily routines.",
  
  coffee_shop: "This vibrant coffee shop buzzes with activity as diverse customers enjoy their beverages and social time. Some people work quietly on laptops whilst others engage in animated conversations with friends. The barista moves skillfully behind the counter, creating steaming drinks with practiced efficiency. The warm lighting and comfortable seating create an inviting atmosphere that encourages people to linger and relax. This scene perfectly captures how coffee shops serve as modern community gathering spaces.",
  
  playground: "This delightful playground scene shows children experiencing pure joy through play and physical activity. Kids swing high into the air with expressions of excitement whilst others navigate colourful climbing equipment with determination. Parents watch carefully from nearby benches, ensuring safety whilst allowing independence. The bright playground equipment contrasts beautifully with the green grass and blue sky, creating a perfect environment for childhood development and fun.",
  
  farmers_market: "This vibrant farmer's market showcases the beauty of local community commerce and fresh, healthy food. Colourful displays of seasonal fruits and vegetables create an attractive rainbow of natural produce. Vendors interact warmly with customers, sharing knowledge about their products and creating personal connections. The outdoor setting adds to the authentic, traditional atmosphere whilst supporting local agriculture and sustainable shopping practices.",
  
  library: "This peaceful library environment demonstrates the importance of quiet study spaces in academic life. Students work diligently at individual desks, surrounded by towering bookshelves filled with knowledge. The natural light streaming through windows creates an ideal atmosphere for concentration and learning. The respectful silence and focused energy show how libraries continue to serve as essential havens for education and personal development in our digital age.",
  
  beach_scene: "This idyllic beach scene captures the essence of relaxation and holiday enjoyment. Families spread across golden sand, engaging in various leisure activities from swimming in crystal-clear water to building elaborate sandcastles. The warm sunshine and gentle waves create perfect conditions for unwinding from everyday stress. Beach umbrellas provide colourful focal points whilst people of all ages embrace the freedom and joy that comes with seaside holidays.",
  
  train_station: "This busy train station embodies the constant movement and energy of modern transportation hubs. Passengers move purposefully through the concourse, dragging wheeled luggage and checking departure information. The architectural design efficiently manages large crowds whilst the mixture of artificial and natural lighting creates a functional yet welcoming environment. This scene represents how public transport connects communities and enables countless daily journeys.",
  
  restaurant_kitchen: "This professional kitchen demonstrates the intense coordination and skill required in commercial food preparation. Chefs work with precision and speed, each focused on their specific tasks whilst contributing to the collective goal of creating exceptional meals. The stainless steel equipment and organised workspace reflect the high standards of cleanliness and efficiency essential in professional catering. The atmosphere combines pressure with passion, showing the dedication required in culinary careers.",
  
  hospital_waiting: "This hospital waiting room captures the complex emotions and experiences of healthcare environments. Patients and family members sit quietly, some reading magazines whilst others engage in hushed conversations or simply wait in contemplative silence. The clean, modern surroundings aim to provide comfort during potentially stressful times. The atmosphere reflects a mixture of hope, concern, and patience as people navigate important healthcare experiences together."
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

  // Submit writing early
  const submitWriting = () => {
    if (userText.trim().split(/\s+/).length < 20) {
      alert('Please write at least 20 words before submitting.');
      return;
    }
    
    setIsTimerActive(false);
    generateFeedback();
  };

  // Basic feedback generation
  const generateFeedback = () => {
    // Simple scoring for now
    let score = 70; // Base score
    
    // Length bonus/penalty
    if (wordCount >= selectedPrompt.minWords && wordCount <= selectedPrompt.maxWords) {
      score += 15;
    } else if (wordCount < selectedPrompt.minWords) {
      score -= Math.min(20, (selectedPrompt.minWords - wordCount) * 0.5);
    } else if (wordCount > selectedPrompt.maxWords) {
      score -= Math.min(10, (wordCount - selectedPrompt.maxWords) * 0.2);
    }
    
    // Basic vocabulary bonus
    const sentences = userText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 3) score += 5;
    
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    setFeedback({
      score,
      wordCount,
      modelAnswer: MODEL_ANSWERS[selectedPrompt.id],
      timeSpent: startTime ? Math.round((Date.now() - startTime) / 1000) : 0,
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
            <p>You'll see a photo and write a detailed description. You have 5 minutes to write between 80-200 words depending on the difficulty level.</p>
            
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
            <div className="photo-placeholder">
              <div className="photo-icon">📷</div>
              <small>{selectedPrompt.title}</small>
              <p className="placeholder-note">
                [Image placeholder - Upload: {selectedPrompt.image}]
              </p>
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
              onClick={submitWriting}
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

          {/* WRITING STATISTICS */}
          <div className="feedback-section">
            <h3>📊 Writing Statistics</h3>
            <div className="writing-stats">
              <div className="stat-item">
                <span className="stat-label">Words written:</span>
                <span className="stat-value">{feedback.wordCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Target range:</span>
                <span className="stat-value">{selectedPrompt.minWords}-{selectedPrompt.maxWords}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time used:</span>
                <span className="stat-value">{Math.round(feedback.timeSpent / 60)} minutes</span>
              </div>
            </div>
          </div>

          {/* SUGGESTIONS */}
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

          {/* YOUR WRITING */}
          <div className="feedback-section">
            <h3>✍️ Your Writing</h3>
            <div className="user-writing">
              {userText}
            </div>
          </div>

          {/* MODEL ANSWER */}
          <div className="feedback-section">
            <h3>🎯 Model Answer</h3>
            <div className="model-answer">
              {feedback.modelAnswer}
            </div>
            <div className="comparison-tips">
              <h4>💡 Comparison Tips:</h4>
              <ul>
                <li>Notice the variety of vocabulary used</li>
                <li>Observe how sentences are structured</li>
                <li>Look at descriptive techniques and imagery</li>
                <li>See how ideas flow logically</li>
                <li>Compare sentence length and complexity</li>
              </ul>
            </div>
          </div>

          <div className="feedback-actions">
            <button className="btn btn-primary" onClick={restartExercise}>
              ✍️ Try Another Exercise
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
