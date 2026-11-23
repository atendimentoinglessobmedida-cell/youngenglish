(() => {
  const header = document.querySelector('[data-ism-navigation-root] > header');
  if (!header) return;

  const normalize = value => String(value ?? '').normalize('NFD')
    .replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const search = document.createElement('details');
  search.className = 'ism-lesson-search';
  search.innerHTML = '<summary>Buscar lições</summary><form role="search" aria-label="Buscar lições"><label for="ism-lesson-query">Título ou tema da lição</label><div><input id="ism-lesson-query" type="search" placeholder="Digite em português ou inglês" required><button type="submit">Buscar</button></div></form><p role="status"></p><ul aria-label="Lições encontradas"></ul>';
  header.after(search);
  const form = search.querySelector('form');
  const input = search.querySelector('input');
  const status = search.querySelector('[role="status"]');
  const list = search.querySelector('ul');
  let searchVersion = 0;

  search.addEventListener('toggle', () => { if (search.open) input.focus(); });
  input.addEventListener('input', () => {
    searchVersion++;
    list.replaceChildren();
    status.textContent = '';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const version = ++searchVersion;
    const query = normalize(input.value);
    list.replaceChildren();
    if (query.length < 2) {
      status.textContent = 'Digite pelo menos duas letras.';
      return;
    }
    status.textContent = 'Buscando lições…';
    try {
      const { entries, incomplete } = await lessonCatalog();
      if (version !== searchVersion) return;
      const words = query.split(' ');
      const matches = entries.flatMap(entry => {
        const title = normalize(entry.title);
        const haystack = normalize([entry.title, entry.context, entry.keywords].filter(Boolean).join(' '));
        if (!words.every(word => haystack.includes(word))) return [];
        const score = title === query ? 3 : title.includes(query) ? 2 : words.every(word => title.includes(word)) ? 1 : 0;
        return [{ entry, score }];
      }).sort((left, right) => right.score - left.score).map(match => match.entry);
      const visible = matches.slice(0, 40);
      for (const entry of visible) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = entry.href;
        link.textContent = entry.title;
        link.addEventListener('click', () => { search.open = false; });
        if (entry.context) {
          const context = document.createElement('small');
          context.textContent = entry.context;
          link.append(context);
        }
        item.append(link);
        list.append(item);
      }
      const message = matches.length > 40
        ? `Mostrando 40 de ${matches.length} lições. Refine a busca para ver outras.`
        : matches.length ? `${matches.length} ${matches.length === 1 ? 'lição encontrada' : 'lições encontradas'}.`
          : 'Nenhuma lição encontrada.';
      status.textContent = incomplete ? message + ' Alguns módulos estão indisponíveis. Tente novamente.' : message;
    } catch {
      if (version === searchVersion) status.textContent = 'Não foi possível carregar as lições. Tente novamente.';
    }
  });

  async function lessonCatalog() {
    const entries = lessons.flatMap(lesson => {
      if (lesson.premium) return [];
      const level = pageCatalog.find(page => page.id === lesson.level);
      if (!level) return [];
      return [{
        title: lesson.t,
        context: level.label || level.id,
        keywords: [lesson.theme, lesson.o, lesson.grammarTopic].filter(Boolean).join(' '),
        href: './' + level.slug + '.html#' + encodeURIComponent(lesson.id)
      }];
    });
    return { entries };
  }
})();
