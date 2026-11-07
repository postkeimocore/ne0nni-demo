// NE0NNi effects: cursor asterisks + glints.
// The grain is a static background (ds.css). Glints sit behind the content,
// so neither ever covers the illustrations. Spec: ../design-system.md 4-6, 4-7
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const root = getComputedStyle(document.documentElement);
  const token = (n) => root.getPropertyValue(n).trim();
  const AST_D = 'M1151.19,64.9c.52,2.65.14,5.45-1.28,7.74-1.89,3.06-5.13,4.86-9.01,4.83-2.4.2-4.65-.42-6.51-1.64-3.52-2.32-5.11-6.69-4.22-10.82l2.8-12.93-13.43,9.77c-1.18.86-2.52,1.53-3.96,1.82-4.74.97-9.32-1.61-11.25-6.19-2.34-5.82.74-11.99,6.9-13.78l13.03-4.09-13.03-4.87c-2.68-1-4.88-3.05-5.83-5.74-1.06-2.99-.56-6.27,1.56-9.15,2.82-3.94,7.89-5.84,12.41-3.95.69.29,1.32.69,1.93,1.13l12.63,9.19-2.38-11.88c-.17-.85-.28-1.71-.26-2.58.17-5.65,4.48-9.75,10.15-10.18q.37-.03.74-.03c6.79-.1,11.76,6.44,10.27,13.06l-2.74,12.21,11.97-8.21c4.84-3.93,11.18-3.5,14.97,1.24,2.27,2.71,2.99,6.05,2.18,9.1-.84,3.14-3.37,5.54-6.46,6.52l-13.94,4.39,12.98,5.37c5.59,2.31,7.57,9.44,3.69,14.09q-.21.24-.43.48c-3.4,4.17-9.32,5.19-13.66,2.13l-12.34-9.8L1151.19,64.9Z';
  const AST = new Path2D(AST_D);            // logo asterisk, viewBox 1103.5 1.5 75.6 76
  const AST_C = [1141.3, 39.5], AST_S = 76;

  // ---------- cursor asterisks ----------
  if (fine && !reduce) {
    const NS = 'http://www.w3.org/2000/svg';
    const defs = document.createElementNS(NS, 'svg');
    defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
    defs.setAttribute('aria-hidden', 'true');
    defs.style.position = 'absolute';
    defs.innerHTML = `<symbol id="ast-sym" viewBox="1101.5 -0.5 79.6 80"><path vector-effect="non-scaling-stroke" d="${AST_D}"/></symbol>`;
    document.body.appendChild(defs);

    const layer = document.createElement('div');
    layer.className = 'cstars';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const SIZES = [16, 24, 40, 80];          // design-system asterisk sizes
    const SPEED = [0.5, 1.2, 2.4];           // px/ms thresholds between sizes
    let last = null, v = 0, travel = 0, n = 0;

    const spawn = (x, y, size) => {
      const night = !!document.elementFromPoint(x, y)?.closest('.is-night');
      const s = document.createElementNS(NS, 'svg');
      s.setAttribute('class', `cstar ${n++ % 2 ? 'cstar--outline' : 'cstar--solid'}${night ? ' is-night-star' : ''}`);
      s.setAttribute('width', size); s.setAttribute('height', size);
      s.innerHTML = '<use href="#ast-sym"/>';
      layer.appendChild(s);
      if (layer.childElementCount > 48) layer.firstElementChild.remove();
      const r0 = Math.random() * 60;
      const dx = (Math.random() - .5) * size * .8, dy = size * (.3 + Math.random() * .5);
      const at = (tx, ty, sc, rot) => `translate(${tx}px, ${ty}px) translate(-50%, -50%) scale(${sc}) rotate(${rot}deg)`;
      s.animate([
        { transform: at(x, y, 0, r0), opacity: 1 },
        { transform: at(x, y, 1, r0 + 40), opacity: 1, offset: .22 },
        { transform: at(x + dx, y + dy, .5, r0 + 100), opacity: 0 },
      ], { duration: 820 + size * 6, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'forwards' })
        .onfinish = () => s.remove();
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const t = performance.now();
      if (last) {
        const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y);
        const dt = Math.max(1, t - last.t);
        v = v * .75 + (dist / dt) * .25;
        travel += dist;
        const i = v < SPEED[0] ? 0 : v < SPEED[1] ? 1 : v < SPEED[2] ? 2 : 3;
        const size = SIZES[i];
        if (travel >= 32 + size * .9) { travel = 0; spawn(e.clientX, e.clientY, size); }
      }
      last = { x: e.clientX, y: e.clientY, t };
    }, { passive: true });
  }

  // ---------- glints: tiny twinkling asterisks over the static grain ----------
  const palettes = {
    day: [[token('--color-glint-violet'), 1]],
    night: [[token('--color-paper'), 4], [token('--color-glint-cyan'), 3], [token('--color-glint-violet-lt'), 3]],
  };
  const pick = (pal) => { const tot = pal.reduce((a, [, w]) => a + w, 0); let r = Math.random() * tot; for (const [c, w] of pal) { if ((r -= w) < 0) return c; } return pal[0][0]; };

  const field = (cv, mode, sizeOf, density) => {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, parts = [], raf = 0, lastT = 0, visible = true;
    const build = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      [W, H] = sizeOf();
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: Math.round((W * H) / density) }, () => {
        const big = Math.random() < .55;
        return {
          x: Math.random() * W, y: Math.random() * H,
          s: big ? 4 + Math.random() * 4 : 1.2 + Math.random() * 1.4,   // px
          ast: big,
          c: pick(palettes[mode]),
          ph: Math.random() * Math.PI * 2,
          sp: .5 + Math.random() * 1.3,
          rot: Math.random() * Math.PI,
          vx: (Math.random() - .5) * .04, vy: (Math.random() - .5) * .04,
        };
      });
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        const a = reduce ? .8 : Math.max(0, Math.sin(t / 1000 * p.sp + p.ph)) ** 2;
        if (a < .03) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.c;
        if (p.ast) {
          const k = (p.s * (.55 + .45 * a)) / AST_S;
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.rot + t / 4000 * p.sp); ctx.scale(k, k);
          ctx.translate(-AST_C[0], -AST_C[1]);
          ctx.fill(AST);
          ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s / 2, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (t - lastT < 33) return;               // ~30fps
      lastT = t;
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -8) p.x = W + 8; else if (p.x > W + 8) p.x = -8;
        if (p.y < -8) p.y = H + 8; else if (p.y > H + 8) p.y = -8;
      }
      draw(t);
    };
    const start = () => { if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    build();
    if (reduce) draw(0);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (reduce) draw(0); }, 200); });
    return { start, stop, setVisible: (vis) => { visible = vis; vis ? start() : stop(); } };
  };

  // page-wide field: fixed behind all content (shows wherever the page background shows)
  const pageCv = document.createElement('canvas');
  pageCv.className = 'glints glints--page';
  pageCv.setAttribute('aria-hidden', 'true');
  document.body.prepend(pageCv);
  field(pageCv, 'day', () => [window.innerWidth, window.innerHeight], 9000).start();

  // sections with their own background (mist, night) get their own field behind their content
  document.querySelectorAll('[data-glints]').forEach((host) => {
    const mode = host.dataset.glints === 'night' ? 'night' : 'day';
    const cv = document.createElement('canvas');
    cv.className = 'glints';
    cv.setAttribute('aria-hidden', 'true');
    host.prepend(cv);
    const f = field(cv, mode, () => [host.clientWidth, host.clientHeight], mode === 'night' ? 7000 : 9000);
    if (!reduce) new IntersectionObserver(([e]) => f.setVisible(e.isIntersecting)).observe(host);
  });
})();
