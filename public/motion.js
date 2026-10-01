/* Efeitos decorativos finitos; não alteram respostas, foco ou recompensas. */
(() => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  const running = new Set();
  const enabled = () => !paused && !media.matches;
  function animate(element, frames, options) {
    if (!enabled() || !element || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, options);
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }
  const control = document.createElement('button');
  control.type = 'button';
  control.className = 'motion-toggle';
  function sync() {
    document.documentElement.classList.toggle('motion-paused', !enabled());
    control.textContent = enabled() ? 'Animações: ativadas' : 'Animações: pausadas';
    control.setAttribute('aria-pressed', String(!enabled()));
    control.disabled = media.matches;
    control.title = media.matches ? 'Movimento reduzido definido no seu aparelho' : 'Pausar ou ativar os efeitos visuais';
    if (!enabled()) {
      running.forEach(animation => animation.cancel());
      document.querySelectorAll('.reward-confetti').forEach(element => element.remove());
    }
  }
  control.addEventListener('click', () => { paused = !paused; sync(); });
  document.querySelector('footer')?.prepend(control);
  media.addEventListener('change', sync);
  sync();
  function celebrate() {
    if (!enabled()) return;
    document.querySelectorAll('.reward-confetti').forEach(element => element.remove());
    const layer = document.createElement('div');
    layer.className = 'reward-confetti';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
    for (let i = 0; i < 18; i++) {
      const piece = document.createElement('i');
      piece.style.background = ['#087c7c', '#ffcf3a', '#ef746b'][i % 3];
      layer.append(piece);
      const angle = i / 18 * Math.PI * 2;
      animate(piece, [{transform: 'translate(0,0) rotate(0deg)', opacity: 1},
        {transform: `translate(${Math.cos(angle) * 160}px,${Math.sin(angle) * 110 + 80}px) rotate(${i * 45}deg)`, opacity: 0}],
        {duration: 900, easing: 'cubic-bezier(.15,.65,.4,1)', fill: 'forwards'});
    }
    setTimeout(() => layer.remove(), 1000);
  }
  if (typeof rewardGame === 'function') {
    const original = rewardGame;
    rewardGame = function (...args) {
      const awarded = original.apply(this, args);
      if (awarded) celebrate();
      return awarded;
    };
  }
  const seen = new WeakSet();
  function reveal(root) {
    if (!(root instanceof Element)) return;
    const cards = root.matches('.level-card,.game-card,.premium-card,.site-card,.game-board,.complete') ? [root] :
      [...root.querySelectorAll('.level-card,.game-card,.premium-card,.site-card,.game-board,.complete')];
    cards.slice(0, 18).forEach((card, index) => {
      if (seen.has(card)) return;
      seen.add(card);
      animate(card, [{opacity: .55, transform: 'translateY(10px)'}, {opacity: 1, transform: 'translateY(0)'}],
        {duration: 300, delay: Math.min(index * 25, 150), easing: 'ease-out'});
    });
  }
  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'childList') record.addedNodes.forEach(reveal);
      else if (record.target.matches('.memory-card') && record.target.classList.contains('flipped') &&
        !(record.oldValue || '').split(/\s+/).includes('flipped')) {
        animate(record.target, [{transform: 'scaleX(.15)'}, {transform: 'scaleX(1)'}], {duration: 220, easing: 'ease-out'});
      }
    });
  });
  observer.observe(document.querySelector('main') || document.body,
    {childList: true, subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true});
  reveal(document.querySelector('main') || document.body);
})();
