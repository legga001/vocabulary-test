// src/components/AnswerReview.js - FIXED: Now displays complete words correctly
import React from 'react';
import PronunciationButton from './PronunciationButton';
import { hasPronunciation } from '../pronunciationData';

// Helper function to determine how many letters to show based on word length
const getLettersToShow = (word) => {
  const length = word.length;
  if (length <= 3) return 1;
  if (length <= 5) return 2;
  if (length <= 7) return 3;
  if (length <= 9) return 4;
  if (length <= 11) return 5;
  return 6;
};

// British/American spelling variations map
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
  // Colour/color variations
  'color': ['colour'], 'colors': ['colours'], 'colored': ['coloured'], 'coloring': ['colouring'],
  'colour': ['color'], 'colours': ['colors'], 'coloured': ['colored'], 'colouring': ['coloring'],
  // Honour/honor variations
  'honor': ['honour'], 'honors': ['honours'], 'honored': ['honoured'], 'honoring': ['honouring'],
  'honour': ['honor'], 'honours': ['honors'], 'honoured': ['honored'], 'honouring': ['honoring'],
  // Centre/center variations
  'center': ['centre'], 'centers': ['centres'], 'centered': ['centred'], 'centering': ['centring'],
  'centre': ['center'], 'centres': ['centers'], 'centred': ['centered'], 'centring': ['centering'],
  // Theatre/theater variations
  'theater': ['theatre'], 'theaters': ['theatres'], 'theatre': ['theater'], 'theatres': ['theaters'],
  // Metre/meter variations
  'meter': ['metre'], 'meters': ['metres'], 'metre': ['meter'], 'metres': ['meters']
};

// Get alternative spellings function
const getAlternativeSpellings = (word) => {
  const normalizedWord = word.toLowerCase();
  return SPELLING_VARIATIONS[normalizedWord] || [];
};

// FIXED: Function to reconstruct complete user answer from partial input
const reconstructCompleteAnswer = (partialUserAnswer, correctAnswer) => {
  if (!partialUserAnswer || !correctAnswer) return '';
  
  const lettersToShow = getLettersToShow(correctAnswer);
  const preFilledLetters = correctAnswer.substring(0, lettersToShow).toLowerCase();
  const userTypedLetters = partialUserAnswer.toLowerCase().trim();
  
  // Combine pre-filled and user-typed letters to form complete word
  return preFilledLetters + userTypedLetters;
};

// FIXED: Enhanced function to check if answer is correct (accounting for spelling variations)
const isAnswerCorrect = (partialUserAnswer, correctAnswer) => {
  if (!partialUserAnswer || !correctAnswer) return false;
  
  // Reconstruct the complete user answer
  const completeUserAnswer = reconstructCompleteAnswer(partialUserAnswer, correctAnswer);
  const correctAnswerNormalized = correctAnswer.toLowerCase();
  
  // Get alternative spellings for both directions
  const correctAnswerAlternatives = getAlternativeSpellings(correctAnswer);
  const userAnswerAlternatives = getAlternativeSpellings(completeUserAnswer);
  
  // Check if answer is correct in multiple ways:
  // 1. Direct match
  // 2. User's complete answer matches an alternative spelling of the correct answer
  // 3. Correct answer matches an alternative spelling of the user's complete answer
  return completeUserAnswer === correctAnswerNormalized || 
         correctAnswerAlternatives.includes(completeUserAnswer) ||
         userAnswerAlternatives.includes(correctAnswerNormalized);
};

function AnswerReview({ questions, userAnswers, title = "Your Answers" }) {
  if (!questions || !userAnswers) {
    return (
      <div className="answer-review">
        <h3>📝 {title}:</h3>
        <p>No answers to review.</p>
      </div>
    );
  }

  return (
    <div className="answer-review">
      <h3>📝 {title}:</h3>
      <div className="answers-list">
        {questions.map((q, index) => {
          const partialUserAnswer = userAnswers[index] || '';
          const completeUserAnswer = reconstructCompleteAnswer(partialUserAnswer, q.answer);
          const isCorrect = isAnswerCorrect(partialUserAnswer, q.answer);
          
          console.log(`📝 REVIEW Q${index + 1}:`, {
            partialUserAnswer,
            completeUserAnswer,
            correctAnswer: q.answer,
            isCorrect
          });
          
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
                {!isCorrect && completeUserAnswer && (
                  <div className="user-answer">
                    <strong>Your answer:</strong> {completeUserAnswer}
                  </div>
                )}
                {!isCorrect && q.hint && (
                  <div className="answer-hint">
                    <em>💡 {q.hint}</em>
                  </div>
                )}
                {isCorrect && completeUserAnswer.toLowerCase() !== q.answer.toLowerCase() && (
                  <div className="spelling-variation">
                    <em>✨ Your spelling: "{completeUserAnswer}" (British/American variant accepted)</em>
                  </div>
                )}
                {!partialUserAnswer && (
                  <div className="no-answer">
                    <em>No answer provided</em>
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
