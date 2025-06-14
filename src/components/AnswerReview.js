// src/components/AnswerReview.js - Updated with British/American spelling support
import React from 'react';
import PronunciationButton from './PronunciationButton';
import { hasPronunciation } from '../pronunciationData';

// British/American spelling variations map - same as in ReadingExercise
const SPELLING_VARIATIONS = {
  'analyze': ['analyse'], 'realize': ['realise'], 'organize': ['organise'],
  'recognize': ['recognise'], 'criticize': ['criticise'], 'apologize': ['apologise'],
  'optimize': ['optimise'], 'minimize': ['minimise'], 'maximize': ['maximise'],
  'centralize': ['centralise'], 'normalize': ['normalise'], 'categorize': ['categorise'],
  'memorize': ['memorise'], 'authorize': ['authorise'], 'modernize': ['modernise'],
  'utilize': ['utilise'], 'fertilize': ['fertilise'], 'sterilize': ['sterilise'],
  'stabilize': ['stabilise'], 'summarize': ['summarise'],
  // Reverse mappings
  'analyse': ['analyze'], 'realise': ['realize'], 'organise': ['organize'],
  'recognise': ['recognize'], 'criticise': ['criticize'], 'apologise': ['apologize'],
  'optimise': ['optimize'], 'minimise': ['minimize'], 'maximise': ['maximize'],
  'centralise': ['centralize'], 'normalise': ['normalize'], 'categorise': ['categorize'],
  'memorise': ['memorize'], 'authorise': ['authorize'], 'modernise': ['modernize'],
  'utilise': ['utilize'], 'fertilise': ['fertilize'], 'sterilise': ['sterilize'],
  'stabilise': ['stabilize'], 'summarise': ['summarize'],
  // Color/colour variations
  'color': ['colour'], 'colours': ['colors'], 'colored': ['coloured'], 'coloring': ['colouring'],
  'colour': ['color'], 'colors': ['colours'], 'coloured': ['colored'], 'colouring': ['coloring'],
  // Honor/honour variations
  'honor': ['honour'], 'honors': ['honours'], 'honored': ['honoured'], 'honoring': ['honouring'],
  'honour': ['honor'], 'honours': ['honors'], 'honoured': ['honored'], 'honouring': ['honoring'],
  // Center/centre variations
  'center': ['centre'], 'centers': ['centres'], 'centered': ['centred'], 'centering': ['centring'],
  'centre': ['center'], 'centres': ['centers'], 'centred': ['centered'], 'centring': ['centering'],
  // Theater/theatre variations
  'theater': ['theatre'], 'theaters': ['theatres'], 'theatre': ['theater'], 'theatres': ['theaters'],
  // Meter/metre variations
  'meter': ['metre'], 'meters': ['metres'], 'metre': ['meter'], 'metres': ['meters']
};

// Get alternative spellings function
const getAlternativeSpellings = (word) => {
  const normalizedWord = word.toLowerCase();
  return SPELLING_VARIATIONS[normalizedWord] || [];
};

// Enhanced function to check if answer is correct (accounting for spelling variations)
const isAnswerCorrect = (userAnswer, correctAnswer) => {
  if (!userAnswer) return false;
  
  const userAnswerNormalized = userAnswer.toLowerCase().trim();
  const correctAnswerNormalized = correctAnswer.toLowerCase();
  
  // Get alternative spellings for both directions
  const correctAnswerAlternatives = getAlternativeSpellings(correctAnswer);
  const userAnswerAlternatives = getAlternativeSpellings(userAnswerNormalized);
  
  // Check if answer is correct in multiple ways:
  // 1. Direct match
  // 2. User's answer matches an alternative spelling of the correct answer
  // 3. Correct answer matches an alternative spelling of the user's answer
  return userAnswerNormalized === correctAnswerNormalized || 
         correctAnswerAlternatives.includes(userAnswerNormalized) ||
         userAnswerAlternatives.includes(correctAnswerNormalized);
};

function AnswerReview({ questions, userAnswers, title = "Your Answers" }) {
  return (
    <div className="answer-review">
      <h3>📝 {title}:</h3>
      <div className="answers-list">
        {questions.map((q, index) => {
          const userAnswer = userAnswers[index] || '';
          const isCorrect = isAnswerCorrect(userAnswer, q.answer);
          
          return (
            <div key={index} className={`answer-item ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="answer-header">
                <span className="answer-emoji">
                  {isCorrect ? '✅' : '❌'}
                </span>
                <span className="question-number">Q{index + 1}</span>
                <span className="level-badge">{q.level}</span>
              </div>
              <div className="answer-details">
                <div className="correct-answer">
                  <div>
                    <strong>Correct answer:</strong> {q.answer}
                  </div>
                  {hasPronunciation(q.answer) && (
                    <PronunciationButton 
                      word={q.answer}
                    />
                  )}
                </div>
                {!isCorrect && userAnswer && (
                  <div className="user-answer">
                    <strong>Your answer:</strong> {userAnswer}
                  </div>
                )}
                {!isCorrect && q.hint && (
                  <div className="answer-hint">
                    <em>💡 {q.hint}</em>
                  </div>
                )}
                {isCorrect && userAnswer.toLowerCase().trim() !== q.answer.toLowerCase() && (
                  <div className="spelling-variation">
                    <em>✨ Your spelling: "{userAnswer}" (British/American variant accepted)</em>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AnswerReview;
