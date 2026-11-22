import React from 'react';

function ThemePicker() {
  return (
    <label className="theme-control">
      Theme
      <select data-theme-picker defaultValue={document.documentElement.dataset.theme || 'classic'}>
        <option value="classic">Classic purple</option>
        <option value="light">Light</option>
      </select>
    </label>
  );
}

export default ThemePicker;
