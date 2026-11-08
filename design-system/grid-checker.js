// Grid checker: press G (or the button) to overlay columns + 8px rows.
// Reads --grid-cols / --grid-margin / --grid-gutter / --row from tokens.css.
(() => {
  const css = `
  .gc-overlay { position: absolute; left: 0; top: 0; width: 100%; height: var(--gc-h, 100%); z-index: 9999; pointer-events: none; display: none; }
  .gc-on .gc-overlay { display: block; }
  .gc-cols { position: absolute; inset: 0; padding-inline: var(--grid-margin); display: grid;
    grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr)); column-gap: var(--grid-gutter); }
  .gc-cols span { background: var(--checker-col); box-shadow: inset 1px 0 0 var(--checker-col-edge), inset -1px 0 0 var(--checker-col-edge); }
  .gc-rows { position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--checker-row-strong) 1px, transparent 1px),
      linear-gradient(var(--checker-row) 1px, transparent 1px);
    background-size: 100% var(--row), 100% 8px; }
  .gc-btn { position: fixed; left: 16px; bottom: 16px; z-index: 10000; height: 32px; padding: 0 12px;
    border: 0; border-radius: 16px; background: var(--checker-ui-bg); color: var(--checker-ui-fg);
    font: 600 12px/32px var(--font-grotesk); letter-spacing: .08em; cursor: pointer; opacity: .8; }
  .gc-btn:hover { opacity: 1; }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'gc-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<div class="gc-rows"></div><div class="gc-cols"></div>';
  const btn = document.createElement('button');
  btn.className = 'gc-btn';
  btn.type = 'button';
  document.body.append(overlay, btn);

  const cols = overlay.querySelector('.gc-cols');
  const render = () => {
    const cs = getComputedStyle(document.documentElement);
    const n = parseInt(cs.getPropertyValue('--grid-cols'), 10) || 12;
    if (cols.children.length !== n) cols.innerHTML = '<span></span>'.repeat(n);
    overlay.style.setProperty('--gc-h', `${document.documentElement.scrollHeight}px`);
    const w = window.innerWidth;
    const bp = w >= 1200 ? 'PC' : w >= 768 ? 'TB' : 'SP';
    btn.textContent = `GRID ${document.documentElement.classList.contains('gc-on') ? 'ON' : 'OFF'} · ${bp} ${w}px · ${n}col`;
  };
  const toggle = () => {
    document.documentElement.classList.toggle('gc-on');
    try { localStorage.setItem('gc-on', document.documentElement.classList.contains('gc-on') ? '1' : '0'); } catch (e) {}
    render();
  };
  try { if (localStorage.getItem('gc-on') === '1') document.documentElement.classList.add('gc-on'); } catch (e) {}
  if (new URLSearchParams(location.search).has('grid')) document.documentElement.classList.add('gc-on');
  btn.addEventListener('click', toggle);
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g' && !/input|textarea|select/i.test(e.target.tagName) && !e.metaKey && !e.ctrlKey) toggle();
  });
  window.addEventListener('resize', render);
  window.addEventListener('load', render);
  render();
})();
