document.addEventListener('DOMContentLoaded', () => {
  const start = document.querySelector('.ux-start');
  start?.addEventListener('click', () => document.getElementById('learn')?.click());
});
