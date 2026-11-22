import React, { useEffect, useRef } from 'react';
import ClickableLogo from './ClickableLogo';

const grammarUrl = `${process.env.PUBLIC_URL}/grammar/index.html`;

function StudyMenu({ tests, onHome, onBack, onExercises, onTests, onProgress, onSelectTest }) {
  const heading = useRef(null);

  useEffect(() => {
    heading.current.focus();
  }, [tests]);

  const choices = tests ? [
    { icon: '📖', label: 'Standard Vocabulary', description: 'Take a ten-word test that adapts as you answer.', action: () => onSelectTest('standard-vocabulary') },
    { icon: '📰', label: 'Article-Based Vocabulary', description: 'Pick a story and test the words you learnt from it.', action: () => onSelectTest('article-vocabulary') }
  ] : [
    { icon: '📘', label: 'Learn grammar', description: 'Explore step-by-step lessons from A1 to C1.', href: grammarUrl },
    { icon: '✏️', label: 'Practise exercises', description: 'Build your reading, listening, speaking and writing skills.', action: onExercises },
    { icon: '🎯', label: 'Practise tests', description: 'See how you do in a vocabulary test.', action: onTests },
    { icon: '📊', label: 'Progress', description: 'See your scores, recent work and achievements.', action: onProgress }
  ];

  return (
    <main className="study-menu">
      <ClickableLogo onLogoClick={onHome} />
      <h1 ref={heading} tabIndex={-1}>{tests ? 'Practise tests' : 'What would you like to do?'}</h1>
      <ul className="study-options">
        {choices.map(({ label, description, icon, href, action }) => {
          const contents = (
            <>
              <span className="study-icon" aria-hidden="true">{icon}</span>
              <span><strong>{label}</strong><span className="study-description">{description}</span></span>
            </>
          );
          return (
            <li key={label}>
              {href
                ? <a className="study-option" href={href}>{contents}</a>
                : <button type="button" className="study-option" onClick={action}>{contents}</button>}
            </li>
          );
        })}
      </ul>
      {tests && <button type="button" className="btn btn-secondary" onClick={onBack}>← Study menu</button>}
    </main>
  );
}

export default StudyMenu;
