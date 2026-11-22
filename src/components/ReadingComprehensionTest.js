import React, { useEffect, useRef, useState } from 'react';
import ClickableLogo from './ClickableLogo';
import { READING_LEVELS, READING_TESTS } from '../data/readingComprehensionTests';
import { recordTestResult } from '../utils/progressDataManager';

const lengths = ['All lengths', 'Short', 'Longer'];

function shuffledOptions(options) {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

function ReadingComprehensionTest({ onBack, onLogoClick, onProgress, backLabel }) {
  const [level, setLevel] = useState('A1');
  const [length, setLength] = useState(lengths[0]);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const heading = useRef(null);
  const passageHeading = useRef(null);
  const startedAt = useRef(0);
  const submitted = useRef(false);

  useEffect(() => {
    heading.current.focus();
  }, [test, score]);

  function startTest(selected) {
    setAnswers(selected.questions.map(() => ''));
    setScore(null);
    submitted.current = false;
    startedAt.current = Date.now();
    setTest({
      ...selected,
      questions: selected.questions.map(question => ({ ...question, options: shuffledOptions(question.options) }))
    });
  }

  function selectAnswer(index, choice) {
    setAnswers(previous => previous.map((answer, position) => position === index ? choice : answer));
  }

  function submit(event) {
    event.preventDefault();
    if (submitted.current || answers.some(answer => !answer)) return;
    submitted.current = true;

    const checked = test.questions.map((question, index) => ({
      answer: answers[index],
      correct: answers[index] === question.answer
    }));
    const total = checked.filter(answer => answer.correct).length;
    recordTestResult({
      quizType: 'reading-comprehension',
      title: test.title,
      contentLevel: test.level,
      score: total,
      totalQuestions: test.questions.length,
      timeSpent: Math.round((Date.now() - startedAt.current) / 1000),
      userAnswers: checked
    });
    setScore(total);
  }

  function chooseAnother() {
    setTest(null);
    setScore(null);
  }

  const showPassage = () => {
    passageHeading.current.focus();
  };

  return (
    <main className="exercise-page scrollable-page reading-page">
      <ClickableLogo onLogoClick={onLogoClick} />
      <div className="quiz-container reading-container">
        <h1 ref={heading} tabIndex={-1}>{score === null ? 'A1–C1 Reading Comprehension' : 'Reading test results'}</h1>

        {!test && (
          <>
            <p>Choose your level, then pick a text that interests you. Each test has eight questions.</p>
            <div className="reading-filters">
              <div>
                <label htmlFor="reading-level">Level</label>
                <select id="reading-level" value={level} onChange={event => setLevel(event.target.value)}>
                  {READING_LEVELS.map(option => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="reading-length">Length</label>
                <select id="reading-length" value={length} onChange={event => setLength(event.target.value)}>
                  {lengths.map(option => <option key={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <ul className="reading-test-list">
              {READING_TESTS.filter(item => item.level === level && (length === lengths[0] || item.length === length)).map(item => (
                <li key={item.id}>
                  <button type="button" className="study-option" onClick={() => startTest(item)}>
                    <span>
                      <strong>{item.title}</strong>
                      <span className="study-description">
                        {item.topic} · {item.format} · {item.length} · {item.passage.trim().split(/\s+/).length} words
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-secondary" onClick={onBack}>← Back to {backLabel}</button>
          </>
        )}

        {test && score === null && (
          <>
            <section className="reading-passage" aria-labelledby="reading-passage-title">
              <p className="reading-meta">{test.level} · {test.format}</p>
              <h2 ref={passageHeading} id="reading-passage-title" tabIndex={-1}>{test.title}</h2>
              {test.passage.split('\n').map((paragraph, index) => {
                const speaker = test.format === 'Conversation' ? paragraph.match(/^([^:]+):\s*(.*)$/) : null;
                return <p key={index}>{speaker ? <><strong>{speaker[1]}:</strong> {speaker[2]}</> : paragraph}</p>;
              })}
            </section>
            <form className="reading-questions" onSubmit={submit}>
              <h2>Answer all eight questions</h2>
              <p>You can look back at the text any time before you submit.</p>
              {test.questions.map((question, index) => (
                <fieldset key={question.prompt}>
                  <legend>{index + 1}. {question.prompt}</legend>
                  {question.options.map(option => (
                    <label className="reading-choice" key={option}>
                      <input type="radio" name={'reading-answer-' + index} value={option} required
                        checked={answers[index] === option} onChange={() => selectAnswer(index, option)} />
                      <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
              ))}
              <div className="reading-actions">
                <button type="submit" className="btn btn-primary">Check my answers</button>
                <button type="button" className="btn btn-secondary" onClick={showPassage}>↑ Back to the text</button>
                <button type="button" className="btn btn-secondary" onClick={chooseAnother}>Choose another text</button>
              </div>
            </form>
          </>
        )}

        {test && score !== null && (
          <>
            <p className="reading-meta">{test.level} · {test.title}</p>
            <p className="reading-score"><strong>{score} / {test.questions.length} correct</strong></p>
            <p>{score === test.questions.length ? 'Well done! You picked up every detail this time.' : 'Nice work finishing the test. Let’s see where the text gives us each answer.'}</p>
            <ol className="reading-review">
              {test.questions.map((question, index) => {
                const correct = answers[index] === question.answer;
                return (
                  <li key={question.prompt} className={correct ? 'reading-correct' : 'reading-incorrect'}>
                    <h2>{index + 1}. {question.prompt}</h2>
                    <p><strong>{correct ? 'Correct' : 'Needs another look'}</strong></p>
                    <p><strong>Your answer</strong> {answers[index]}</p>
                    {!correct && <p><strong>Correct answer</strong> {question.answer}</p>}
                    <p><strong>Why it fits</strong> {question.explanation}</p>
                  </li>
                );
              })}
            </ol>
            <details className="reading-review-text">
              <summary>Read the passage again</summary>
              {test.passage.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </details>
            <div className="reading-actions">
              <button type="button" className="btn btn-primary" onClick={chooseAnother}>Try another reading test</button>
              <button type="button" className="btn btn-secondary" onClick={onProgress}>View Progress</button>
              <button type="button" className="btn btn-secondary" onClick={onBack}>← Back to {backLabel}</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default ReadingComprehensionTest;
