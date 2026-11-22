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
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });
  }

  applyTheme(readTheme());
  function closeMenu(menu, restoreFocus) {
    menu.open = false;
    if (restoreFocus) menu.querySelector('summary').focus();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-theme-choice]');
    if (button) {
      applyTheme(button.dataset.themeChoice);
      try {
        localStorage.setItem(key, root.dataset.theme);
      } catch {
        // The theme still works for this page when storage is unavailable.
      }
      closeMenu(button.closest('.theme-control'), true);
    }
    for (const menu of document.querySelectorAll('.theme-control[open]')) {
      if (!menu.contains(event.target)) closeMenu(menu, false);
    }
  });

  document.addEventListener('keydown', event => {
    const menu = event.target.closest('.theme-control[open]');
    if (event.key === 'Escape' && menu) {
      event.preventDefault();
      closeMenu(menu, true);
    }
  });

  window.addEventListener('pageshow', () => applyTheme(readTheme()));
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) applyTheme(readTheme());
  });

  function initialisePage() {
    const header = document.querySelector('.site-header');
    if (header) {
      const menu = document.createElement('details');
      menu.className = 'theme-control';
      const summary = document.createElement('summary');
      summary.textContent = 'Theme';
      const options = document.createElement('div');
      options.className = 'theme-options';
      for (const [value, label] of [['classic', 'Classic purple'], ['light', 'Light']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.themeChoice = value;
        button.textContent = label;
        options.append(button);
      }
      menu.append(summary, options);
      header.append(menu);
      applyTheme(root.dataset.theme);
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
