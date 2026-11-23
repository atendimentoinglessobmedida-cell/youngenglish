(() => {
  const main = document.querySelector('main:not([data-ism-prepaint]), [role="main"]');
  const content = main || document.querySelector('#view, #course-view');
  if (!content) return;

  const navigation = document.createElement('nav');
  navigation.className = 'ism-page-navigation';
  navigation.setAttribute('aria-label', 'Navegação desta página');
  const home = document.createElement('a');
  home.href = './index.html';
  home.textContent = 'Início do curso';

  const sections = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Ir para uma seção';
  const list = document.createElement('ul');
  sections.append(summary, list);
  navigation.append(home, sections);
  if (main) main.prepend(navigation);
  else content.before(navigation);

  sections.addEventListener('toggle', () => {
    if (!sections.open) return;
    list.replaceChildren();
    const headings = [...content.querySelectorAll('h2, h3')].filter(heading =>
      heading.getClientRects().length > 0 && heading.textContent.trim() &&
      !heading.closest('dialog, [role="dialog"], [hidden], [inert], [aria-hidden="true"]')
    );
    for (const heading of headings) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = heading.textContent.trim();
      button.addEventListener('click', () => {
        if (!heading.isConnected || !heading.getClientRects().length) return;
        sections.open = false;
        heading.setAttribute('tabindex', '-1');
        heading.classList.add('ism-page-navigation-target');
        heading.focus({ preventScroll: true });
        heading.scrollIntoView({ block: 'start' });
      });
      item.append(button);
      list.append(item);
    }
    if (!headings.length) {
      const item = document.createElement('li');
      item.textContent = 'As seções aparecem aqui quando o conteúdo está disponível.';
      list.append(item);
    }
  });
})();
