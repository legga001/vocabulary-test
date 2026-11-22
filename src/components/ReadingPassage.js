import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function ReadingPassage({ passage, format, glossary }) {
  const id = useId();
  const tooltip = useRef(null);
  const closeTimer = useRef(null);
  const [active, setActive] = useState(null);
  const used = new Set();
  const entries = Object.fromEntries(Object.entries(glossary).map(([word, meaning]) => [word.toLowerCase(), meaning]));
  const pattern = new RegExp('\\b(?:' + Object.keys(entries).sort((a, b) => b.length - a.length).join('|') + ')\\b', 'gi');

  function cancelClose() {
    window.clearTimeout(closeTimer.current);
  }

  function close() {
    cancelClose();
    setActive(null);
  }

  function open(anchor, word, meaning, mode) {
    cancelClose();
    setActive(current => {
      if (mode === 'tap' && current?.anchor === anchor && current.mode === 'tap') return null;
      if (mode === 'hover' && current?.mode === 'tap') return current;
      return { anchor, word, meaning, mode };
    });
  }

  function closeHover() {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setActive(current => current?.mode === 'hover' ? null : current);
    }, 150);
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useLayoutEffect(() => {
    if (!active) return;
    const element = tooltip.current;

    function position() {
      const rect = [...active.anchor.getClientRects()].find(line => line.bottom >= 0 && line.top <= window.innerHeight);
      const box = element.getBoundingClientRect();
      if (!rect) {
        element.style.visibility = 'hidden';
        return;
      }
      const left = Math.max(12, Math.min(rect.left + (rect.width - box.width) / 2, window.innerWidth - box.width - 12));
      const top = rect.top - box.height - 8 >= 8
        ? rect.top - box.height - 8
        : rect.bottom + 8;
      element.style.left = left + 'px';
      element.style.top = Math.max(8, Math.min(top, window.innerHeight - box.height - 8)) + 'px';
      element.style.visibility = 'visible';
    }

    function dismissOutside(event) {
      if (!active.anchor.contains(event.target) && !element.contains(event.target)) {
        window.clearTimeout(closeTimer.current);
        setActive(null);
      }
    }

    function dismissOnEscape(event) {
      if (event.key === 'Escape') {
        window.clearTimeout(closeTimer.current);
        setActive(null);
      }
    }

    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [active]);

  return (
    <>
      <p className="reading-glossary-help">Words with a dotted underline have a definition. Hover over or tap one to see it.</p>
      {passage.split('\n').map((paragraph, index) => {
        const speaker = format === 'Conversation' ? paragraph.match(/^([^:]+):\s*(.*)$/) : null;
        const text = speaker ? speaker[2] : paragraph;
        let start = 0;
        const parts = [];
        for (const match of text.matchAll(pattern)) {
          const word = match[0];
          const key = word.toLowerCase();
          if (used.has(key)) continue;
          used.add(key);
          const meaning = entries[key];
          const descriptionId = id + '-' + used.size;
          parts.push(text.slice(start, match.index));
          parts.push(
            <React.Fragment key={descriptionId}>
              <span role="button" tabIndex={0} className="reading-glossary-word" aria-describedby={descriptionId}
                onPointerEnter={event => {
                  if (event.pointerType === 'mouse') open(event.currentTarget, word, meaning, 'hover');
                }}
                onPointerLeave={closeHover}
                onFocus={event => {
                  if (event.currentTarget.matches(':focus-visible')) open(event.currentTarget, word, meaning, 'focus');
                }}
                onBlur={() => { if (active?.mode === 'focus') close(); }}
                onClick={event => open(event.currentTarget, word, meaning, 'tap')}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open(event.currentTarget, word, meaning, 'tap');
                  }
                }}>
                {word}
              </span>
              <span id={descriptionId} hidden>{meaning}</span>
            </React.Fragment>
          );
          start = match.index + word.length;
        }
        parts.push(text.slice(start));
        return <p key={index}>{speaker && <><strong>{speaker[1]}:</strong> </>}{parts}</p>;
      })}
      {active && createPortal(
        <div ref={tooltip} className="reading-glossary-tooltip" aria-hidden="true"
          onPointerEnter={cancelClose} onPointerLeave={closeHover}>
          <strong>{active.word}</strong>
          <div>{active.meaning}</div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ReadingPassage;
