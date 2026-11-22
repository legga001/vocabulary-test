import React from 'react';

function ThemePicker() {
  const theme = document.documentElement.dataset.theme || 'classic';
  return (
    <details className="theme-control">
      <summary>Theme</summary>
      <div className="theme-options">
        <button type="button" data-theme-choice="classic" aria-pressed={theme === 'classic'}>Classic purple</button>
        <button type="button" data-theme-choice="light" aria-pressed={theme === 'light'}>Light</button>
      </div>
    </details>
  );
}

export default ThemePicker;
