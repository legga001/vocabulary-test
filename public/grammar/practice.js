'use strict';

(() => {
  const key = 'mrfox-theme';
  const root = document.documentElement;

  function readTheme() {
    try {
      return localStorage.getItem(key);
    } catch {
      return root.dataset.theme;
    }
  }

  function applyTheme(value) {
    const theme = value === 'light' ? 'light' : 'classic';
    root.dataset.theme = theme;
    document.querySelectorAll('select[data-theme-picker]').forEach(select => { select.value = theme; });
  }

  applyTheme(readTheme());
  document.addEventListener('change', event => {
    if (!event.target.matches('select[data-theme-picker]')) return;
    applyTheme(event.target.value);
    try {
      localStorage.setItem(key, root.dataset.theme);
    } catch {
      // The theme still works for this page when storage is unavailable.
    }
  });

  window.addEventListener('pageshow', () => applyTheme(readTheme()));
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) applyTheme(readTheme());
  });

  function initialisePage() {
    const header = document.querySelector('.site-header');
    if (header) {
      const label = document.createElement('label');
      label.className = 'theme-control';
      label.append('Theme');
      const select = document.createElement('select');
      select.dataset.themePicker = '';
      select.add(new Option('Classic purple', 'classic'));
      select.add(new Option('Light', 'light'));
      select.value = root.dataset.theme;
      label.append(select);
      header.append(label);
    }

    for (const form of document.querySelectorAll('.grammar-check')) {
      const feedback = form.querySelector('.grammar-feedback');
      const more = form.querySelector('.grammar-more');
    
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const selected = new FormData(form).values().next().value;
        if (selected == null) return;
    
        const correct = selected === form.dataset.correct;
        feedback.classList.toggle('is-correct', correct);
        feedback.textContent = correct
          ? 'Well done! ' + form.dataset.reason
          : 'Good try. The answer is “' + form.dataset.answer + '”. ' + form.dataset.reason;
        if (more) more.hidden = false;
      });
    
      form.addEventListener('change', () => {
        feedback.textContent = '';
        feedback.classList.remove('is-correct');
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialisePage);
  else initialisePage();
})();
