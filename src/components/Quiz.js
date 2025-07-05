// src/components/Quiz.js - COMPLETELY FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import ClickableLogo from './ClickableLogo';
import LetterInput from './LetterInput';

// Correct feedback messages
const correctMessages = [
  '✓ Perfect!',
  '✓ Excellent!',
  '✓ Well done!',
  '✓ Brilliant!',
  '✓ Spot on!',
  '✓ Great work!',
  '✓ Outstanding!'
];

// Alternative spellings dictionary
const SPELLING_VARIATIONS = {
  // Color/colour variations
  'color': ['colour'], 'colors': ['colours'], 'colour': ['color'], 'colours': ['colors'],
  'colored': ['coloured'], 'coloring': ['colouring'], 'coloured': ['colored'], 'colouring': ['coloring'],
  // Realize/realise variations
  'realize': ['realise'], 'realizes': ['realises'], 'realized': ['realised'], 'realizing': ['realising'],
  'realise': ['realize'], 'realises': ['realizes'], 'realised': ['realized'], 'realising': ['realizing'],
  // Organization/organisation variations
  'organization': ['organisation'], 'organizations': ['organisations'],
  'organisation': ['organization'], 'organisations': ['organizations'],
  'organize': ['organise'], 'organized': ['organised'], 'organizes': ['organises'], 'organizing': ['organising'],
  'organise': ['organize'], 'organised': ['organized'], 'organises': ['organizes'], 'organising': ['organizing'],
  // Flavor/flavour variations
  'flavor': ['flavour'], 'flavors': ['flavours'], 'flavour': ['flavor'], 'flavours': ['flavors'],
  // Center/centre variations
  'center': ['centre'], 'centers': ['centres'], 'centre': ['center'], 'centres': ['centers'],
  'centered': ['centred'], 'centering': ['centring'], 'centred': ['centered'], 'centring': ['centering'],
  // Theater/theatre variations
  'theater': ['theatre'], 'theaters': ['theatres'], 'theatre': ['theater'], 'theatres': ['theaters'],
  // Metre/meter variations
  'meter': ['metre'], 'meters': ['metres'], 'metre': ['meter'], 'metres': ['meters']
};

// Helper function to get alternative spellings
const getAlternativeSpellings = (word) => {
  const normalizedWord = word.toLowerCase();
  return SPELLING_VARIATIONS[normalizedWord] || [];
};

// Helper function to determine how many letters to show
const getLettersToShow = (word) => {
  const length = word.length;
  if (length <= 3) return 1;
  if (length <= 5) return 2;
  if (length <= 7) return 3;
  if (length <= 9) return 4;
  if (length <= 11) return 5;
  return 6;
};

function Quiz({ onFinish, quizType = 'standard', articleType, onBack, onLogoClick }) {
  console.log('🏗️ Quiz component rendering with:', { quizType, articleType });
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(10).fill(''));
  const [checkedQuestions, setCheckedQuestions] = useState(new Array(10).fill(false));
  const [questions, setQuestions] = useState([]);
  const [skippedQuestions, setSkippedQuestions] = useState(new Array(10).fill(false));
  const [showHints, setShowHints] = useState(new Array(10).fill(false)); // NEW: Track hint visibility
  
  // Separate state for feedback that won't be affected by other re-renders
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  const QUIZ_STATE_KEY = `quiz_state_${quizType}_${articleType || 'standard'}`;

  // Load questions based on quiz type - FIXED WITH ALL ARTICLE TYPES
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let questionData = [];
        
        if (quizType === 'article') {
          console.log('📚 Loading article questions for type:', articleType);
          
          switch (articleType) {
            case 'zooplankton-quiz':
              console.log('🌊 Loading zooplankton questions...');
              const zooplanktonModule = await import('../zooplanktonVocabularyData');
              questionData = zooplanktonModule.getZooplanktonVocabularyQuestions();
              console.log('✅ Loaded zooplankton questions:', questionData.length);
              break;
              
            case 'nft-quiz':
              console.log('🖼️ Loading NFT questions...');
              const nftModule = await import('../nftVocabularyData');
              questionData = nftModule.getNftVocabularyQuestions();
              console.log('✅ Loaded NFT questions:', questionData.length);
              break;
              
            case 'nuclear-quiz':
              console.log('⚛️ Loading nuclear questions...');
              const nuclearModule = await import('../nuclearVocabularyData');
              questionData = nuclearModule.getNuclearVocabularyQuestions();
              console.log('✅ Loaded nuclear questions:', questionData.length);
              break;
              
            case 'memory-quiz':
              console.log('🧠 Loading memory questions...');
              const memoryModule = await import('../memoryVocabularyData');
              questionData = memoryModule.getMemoryVocabularyQuestions();
              console.log('✅ Loaded memory questions:', questionData.length);
              break;

            case 'sleep-quiz':
              console.log('😴 Loading sleep questions...');
              const sleepModule = await import('../sleepVocabularyData');
              questionData = sleepModule.getSleepVocabularyQuestions();
              console.log('✅ Loaded sleep questions:', questionData.length);
              break;

            case 'ai-quiz':
              console.log('🤖 Loading AI questions...');
              const aiModule = await import('../aiVocabularyData');
              questionData = aiModule.getAiVocabularyQuestions();
              console.log('✅ Loaded AI questions:', questionData.length);
              break;

            case 'evolution-quiz':
              console.log('🧬 Loading evolution questions...');
              const evolutionModule = await import('../evolutionVocabularyData');
              questionData = evolutionModule.getEvolutionVocabularyQuestions();
              console.log('✅ Loaded evolution questions:', questionData.length);
              break;

            case 'volcano-quiz':
              console.log('🌋 Loading volcano questions...');
              const volcanoModule = await import('../volcanoVocabularyData');
              questionData = volcanoModule.getVolcanoVocabularyQuestions();
              console.log('✅ Loaded volcano questions:', questionData.length);
              break;

            case 'ocean-quiz':
              console.log('🌊 Loading ocean questions...');
              const oceanModule = await import('../oceanVocabularyData');
              questionData = oceanModule.getOceanVocabularyQuestions();
              console.log('✅ Loaded ocean questions:', questionData.length);
              break;

            case 'space-quiz':
              console.log('🚀 Loading space questions...');
              const spaceModule = await import('../spaceVocabularyData');
              questionData = spaceModule.getSpaceVocabularyQuestions();
              console.log('✅ Loaded space questions:', questionData.length);
              break;

            case 'climate-quiz':
              console.log('🌍 Loading climate questions...');
              const climateModule = await import('../climateVocabularyData');
              questionData = climateModule.getClimateVocabularyQuestions();
              console.log('✅ Loaded climate questions:', questionData.length);
              break;

            case 'renewable-quiz':
              console.log('⚡ Loading renewable energy questions...');
              const renewableModule = await import('../renewableVocabularyData');
              questionData = renewableModule.getRenewableVocabularyQuestions();
              console.log('✅ Loaded renewable energy questions:', questionData.length);
              break;

            case 'antarctica-quiz':
              console.log('🐧 Loading Antarctica questions...');
              const antarcticaModule = await import('../antarcticaVocabularyData');
              questionData = antarcticaModule.getAntarcticaVocabularyQuestions();
              console.log('✅ Loaded Antarctica questions:', questionData.length);
              break;

            case 'plastic-quiz':
              console.log('♻️ Loading plastic pollution questions...');
              const plasticModule = await import('../plasticVocabularyData');
              questionData = plasticModule.getPlasticVocabularyQuestions();
              console.log('✅ Loaded plastic pollution questions:', questionData.length);
              break;

            case 'deforestation-quiz':
              console.log('🌳 Loading deforestation questions...');
              const deforestationModule = await import('../deforestationVocabularyData');
              questionData = deforestationModule.getDeforestationVocabularyQuestions();
              console.log('✅ Loaded deforestation questions:', questionData.length);
              break;

            case 'default':
            default:
              console.log('📖 Loading default article questions...');
              const defaultModule = await import('../articleQuestions');
              questionData = defaultModule.getArticleQuestions();
              console.log('✅ Loaded default article questions:', questionData.length);
              break;
          }
        } else {
          console.log('📝 Loading standard questions...');
          const { getNewQuestions } = await import('../questionsData');
          questionData = getNewQuestions();
          console.log('✅ Loaded standard questions:', questionData.length);
        }

        console.log('📋 Final questions loaded:', questionData);
        setQuestions(questionData);
      } catch (error) {
        console.error('❌ Error loading questions:', error);
        // Fallback to default questions
        try {
          const { getNewQuestions } = await import('../questionsData');
          setQuestions(getNewQuestions());
        } catch (fallbackError) {
          console.error('❌ Error loading fallback questions:', fallbackError);
        }
      }
    };

    loadQuestions();
  }, [quizType, articleType]);

  // **FIXED**: Helper function to process sentences WITHOUT showing underscores
  const processSentence = (sentence, answer) => {
    if (!sentence || !answer) return { beforeGap: '', afterGap: '' };
    
    // Remove underscores and just split on common gap patterns
    let cleanSentence = sentence;
    
    // Handle various gap patterns: _____, _____s, dev_____, etc.
    const gapPatterns = [
      /_____/g,           // Simple underscores
      /\b\w*_+\w*\b/g,    // Word with underscores
      /\b[A-Za-z]*_+[A-Za-z]*\b/g // Letter-underscore combinations
    ];
    
    for (const pattern of gapPatterns) {
      if (pattern.test(cleanSentence)) {
        const parts = cleanSentence.split(pattern);
        return {
          beforeGap: (parts[0] || '').trim(),
          afterGap: (parts[1] || '').trim()
        };
      }
    }
    
    // Fallback: if no gap pattern found, put gap at end
    return {
      beforeGap: cleanSentence.trim(),
      afterGap: ''
    };
  };

  const getArticleInfo = () => {
    // This would return article information if needed
    return null;
  };

  // Get current question
  const question = questions[currentQuestion];
  const processedData = quizType === 'article' && question ? 
    processSentence(question.sentence, question.answer) : { beforeGap: '', afterGap: '' };
  const articleInfo = getArticleInfo();

  console.log('📰 Article info:', articleInfo);

  // Open article link
  const openArticle = () => {
    if (articleInfo && articleInfo.url) {
      window.open(articleInfo.url, '_blank');
    }
  };

  // **FIXED**: Enhanced answer checking function that properly reconstructs complete answers
  const checkAnswer = useCallback((userInput, correctAnswer) => {
    if (!userInput || !correctAnswer) return false;

    // For article quizzes, reconstruct the complete word from user input
    let completeUserAnswer = userInput;
    
    if (quizType === 'article') {
      const lettersShown = getLettersToShow(correctAnswer);
      const preFilledPart = correctAnswer.substring(0, lettersShown);
      completeUserAnswer = preFilledPart + userInput; // Reconstruct complete word
      
      console.log('🔧 RECONSTRUCTING ANSWER FOR FEEDBACK:', {
        userInput,
        correctAnswer,
        lettersShown,
        preFilledPart,
        completeUserAnswer
      });
    }

    const normalizeText = (text) => text.toLowerCase().trim().replace(/[^a-z]/g, '');
    const normalizedUser = normalizeText(completeUserAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);

    // Check exact match
    if (normalizedUser === normalizedCorrect) return true;

    // Check alternative spellings
    const alternatives = getAlternativeSpellings(correctAnswer);
    return alternatives.some(alt => normalizeText(alt) === normalizedUser);
  }, [quizType]);

  // Update answer function
  const updateAnswer = useCallback((value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
  }, [userAnswers, currentQuestion]);

  // **FIXED**: Check current answer with proper reconstruction AND hint logic
  const checkCurrentAnswer = useCallback(() => {
    if (checkedQuestions[currentQuestion]) return;

    const userAnswer = userAnswers[currentQuestion];
    const correctAnswer = question.answer;
    const isCorrect = checkAnswer(userAnswer, correctAnswer);

    console.log('✅ CHECKING ANSWER:', {
      userInput: userAnswer,
      correctAnswer,
      isCorrect,
      quizType
    });

    // Mark question as checked
    const newCheckedQuestions = [...checkedQuestions];
    newCheckedQuestions[currentQuestion] = true;
    setCheckedQuestions(newCheckedQuestions);

    // **NEW**: Show hint only if answer is incorrect
    if (!isCorrect) {
      const newShowHints = [...showHints];
      newShowHints[currentQuestion] = true;
      setShowHints(newShowHints);
    }

    // Show feedback - PERSISTENT until navigation
    const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
    const message = isCorrect ? randomMessage : `✗ The correct answer is "${correctAnswer}"`;
    
    setFeedbackMessage(message);
    setFeedbackType(isCorrect ? 'correct' : 'incorrect');
    setShowFeedback(true);
    
    // NO auto-hide timeout - feedback stays until next question
  }, [currentQuestion, userAnswers, checkedQuestions, question, checkAnswer, showHints]);

  // **NEW**: Skip question function
  const skipQuestion = useCallback(() => {
    if (checkedQuestions[currentQuestion]) return;

    // Mark as skipped and checked
    const newCheckedQuestions = [...checkedQuestions];
    const newSkippedQuestions = [...skippedQuestions];
    newCheckedQuestions[currentQuestion] = true;
    newSkippedQuestions[currentQuestion] = true;
    setCheckedQuestions(newCheckedQuestions);
    setSkippedQuestions(newSkippedQuestions);

    // Show skip feedback - PERSISTENT until navigation
    setFeedbackMessage(`⏭️ Skipped! The answer was "${question.answer}"`);
    setFeedbackType('skipped');
    setShowFeedback(true);
    
    // NO auto-hide timeout - feedback stays until next question
  }, [currentQuestion, checkedQuestions, skippedQuestions, question]);

  // Navigation functions
  const goToNextQuestion = useCallback(() => {
    // Clear feedback when moving to next question
    setShowFeedback(false);
    setFeedbackMessage('');
    setFeedbackType('');
    
    if (currentQuestion < 9) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Quiz complete - pass complete answers to Results
      const completeAnswers = userAnswers.map((userAnswer, index) => {
        const correctAnswer = questions[index].answer;
        
        if (skippedQuestions[index]) {
          return ''; // Empty for skipped questions
        }
        
        if (quizType === 'article') {
          const lettersShown = getLettersToShow(correctAnswer);
          const preFilledPart = correctAnswer.substring(0, lettersShown);
          return preFilledPart + userAnswer; // Complete word
        } else {
          return userAnswer; // Standard quiz - user types complete word
        }
      });
      
      console.log('🏁 Quiz finished with complete answers:', completeAnswers);
      onFinish(completeAnswers, questions);
    }
  }, [currentQuestion, userAnswers, questions, onFinish, quizType, skippedQuestions]);

  const goToPreviousQuestion = useCallback(() => {
    // Clear feedback when moving to previous question
    setShowFeedback(false);
    setFeedbackMessage('');
    setFeedbackType('');
    
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  // Handle Enter key press
  const handleEnterPress = useCallback(() => {
    const userAnswer = userAnswers[currentQuestion];
    if (!checkedQuestions[currentQuestion] && userAnswer) {
      checkCurrentAnswer();
    } else if (checkedQuestions[currentQuestion]) {
      goToNextQuestion();
    }
  }, [userAnswers, currentQuestion, checkedQuestions, checkCurrentAnswer, goToNextQuestion]);

  // Show loading if questions not loaded
  if (questions.length === 0) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="quiz-header">
            <div className="quiz-type-badge">
              {quizType === 'article' ? '📰 Article-Based' : '📚 Standard'} Vocabulary
            </div>
            <div className="loading-message">Loading questions...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no questions available
  if (!question) {
    return (
      <div className="exercise-page">
        <ClickableLogo onLogoClick={onLogoClick} />
        <div className="quiz-container">
          <div className="quiz-header">
            <div className="quiz-type-badge error">❌ Error</div>
            <div className="error-message">No questions available. Please try again.</div>
          </div>
          <div className="back-button-container">
            <button onClick={onBack} className="btn btn-secondary back-btn">
              ← Back to Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <div className="quiz-container">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-type-badge">
            {quizType === 'article' ? '📰 Article-Based' : '📚 Standard'} Vocabulary
          </div>
          <div className="question-counter">
            Question {currentQuestion + 1} of 10
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Article Link */}
        {quizType === 'article' && articleInfo && (
          <div className="article-link-container">
            <button onClick={openArticle} className="article-link-btn">
              📖 Read the full article
            </button>
          </div>
        )}

        {/* Question Section */}
        <div className="question-section">
          <div className="question-title">Fill in the gap:</div>
          
          {/* Context for article questions */}
          {quizType === 'article' && question.context && (
            <div className="question-context">
              <small>{question.context}</small>
            </div>
          )}
          
          {/* Question Text - NO MORE UNDERSCORES! */}
          <div className="question-text">
            <span>{processedData.beforeGap}</span>
            <LetterInput
              word={question.answer}
              value={userAnswers[currentQuestion]}
              onChange={updateAnswer}
              disabled={checkedQuestions[currentQuestion]}
              className={checkedQuestions[currentQuestion] ? feedbackType : ''}
              onEnterPress={!checkedQuestions[currentQuestion] && userAnswers[currentQuestion] ? handleEnterPress : undefined}
            />
            <span>{processedData.afterGap}</span>
          </div>
        </div>

        {/* **NEW**: Conditional Hint Section - Only show after wrong answer */}
        {showHints[currentQuestion] && (
          <div className="hint-section">
            <div className="hint-icon">💡</div>
            <div className="hint-text">{question.hint}</div>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`feedback-section ${feedbackType}`}>
            <div className="feedback-message">{feedbackMessage}</div>
          </div>
        )}

        {/* **UPDATED**: Action Buttons with Skip Option */}
        <div className="action-buttons">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            ← Previous
          </button>

          {!checkedQuestions[currentQuestion] ? (
            <div className="quiz-action-group">
              <button
                onClick={skipQuestion}
                className="btn btn-skip"
                title="Skip this question"
              >
                ⏭️ Skip
              </button>
              <button
                onClick={checkCurrentAnswer}
                disabled={!userAnswers[currentQuestion]}
                className="btn btn-primary"
              >
                ✓ Check Answer
              </button>
            </div>
          ) : (
            <button
              onClick={goToNextQuestion}
              className="btn btn-primary"
            >
              {currentQuestion === 9 ? '🏁 Finish Quiz' : 'Next →'}
            </button>
          )}
        </div>

        {/* Navigation Help */}
        <div className="navigation-help">
          <p>💡 Press Enter to check your answer or move to the next question</p>
          <p>🔍 Hints will appear if you get an answer wrong</p>
        </div>

        {/* Back Button */}
        <div className="back-button-container">
          <button onClick={onBack} className="btn btn-secondary back-btn">
            ← Back to Selection
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
