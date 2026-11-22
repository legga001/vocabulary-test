'use strict';

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
