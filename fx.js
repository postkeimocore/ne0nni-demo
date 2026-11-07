// NE0NNi effects: cursor asterisks, glints, hero sound wave.
// Glints and the wave sit behind the content, so they never cover the illustrations.
// Spec: ../design-system.md 4-6, 4-7, 4-8
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const root = getComputedStyle(document.documentElement);
  const token = (n) => root.getPropertyValue(n).trim();
  const AST_D = 'M1151.19,64.9c.52,2.65.14,5.45-1.28,7.74-1.89,3.06-5.13,4.86-9.01,4.83-2.4.2-4.65-.42-6.51-1.64-3.52-2.32-5.11-6.69-4.22-10.82l2.8-12.93-13.43,9.77c-1.18.86-2.52,1.53-3.96,1.82-4.74.97-9.32-1.61-11.25-6.19-2.34-5.82.74-11.99,6.9-13.78l13.03-4.09-13.03-4.87c-2.68-1-4.88-3.05-5.83-5.74-1.06-2.99-.56-6.27,1.56-9.15,2.82-3.94,7.89-5.84,12.41-3.95.69.29,1.32.69,1.93,1.13l12.63,9.19-2.38-11.88c-.17-.85-.28-1.71-.26-2.58.17-5.65,4.48-9.75,10.15-10.18q.37-.03.74-.03c6.79-.1,11.76,6.44,10.27,13.06l-2.74,12.21,11.97-8.21c4.84-3.93,11.18-3.5,14.97,1.24,2.27,2.71,2.99,6.05,2.18,9.1-.84,3.14-3.37,5.54-6.46,6.52l-13.94,4.39,12.98,5.37c5.59,2.31,7.57,9.44,3.69,14.09q-.21.24-.43.48c-3.4,4.17-9.32,5.19-13.66,2.13l-12.34-9.8L1151.19,64.9Z';

  // ---------- cursor asterisks (logo asterisk) ----------
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

    const SIZES = [16, 24, 40, 80];
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

  // ---------- glint shapes: sparkle (4-point star), spark (rays), gothic asterisk ----------
  const SHAPES = {
    sparkle(ctx, s) {                        // キラン
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * .12, -s * .12, s, 0);
      ctx.quadraticCurveTo(s * .12, s * .12, 0, s);
      ctx.quadraticCurveTo(-s * .12, s * .12, -s, 0);
      ctx.quadraticCurveTo(-s * .12, -s * .12, 0, -s);
      ctx.fill();
    },
    spark(ctx, s) {                          // スパーク
      ctx.lineWidth = 1; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4, long = k % 2 === 0;
        const r0 = s * .28, r1 = long ? s : s * .55;
        ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      }
      ctx.stroke();
    },
    gothic(ctx, s) {                         // ゴシック体のアスタリスク
      ctx.lineWidth = Math.max(1, s * .24); ctx.lineCap = 'butt';
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        const a = Math.PI / 2 + k * Math.PI / 3;
        ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s);
        ctx.lineTo(-Math.cos(a) * s, -Math.sin(a) * s);
      }
      ctx.stroke();
    },
  };
  const KINDS = [['sparkle', 4], ['spark', 3], ['gothic', 3]];
  const pickW = (list) => { const tot = list.reduce((a, [, w]) => a + w, 0); let r = Math.random() * tot; for (const [v, w] of list) { if ((r -= w) < 0) return v; } return list[0][0]; };
  const palettes = {
    day: [[token('--color-ink-sub'), 1]],
    night: [[token('--color-paper'), 4], [token('--color-glint-cyan'), 3], [token('--color-glint-violet-lt'), 3]],
  };

  const field = (cv, mode, sizeOf, density) => {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, parts = [], raf = 0, lastT = 0, visible = true;
    const build = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      [W, H] = sizeOf();
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: Math.round((W * H) / density) }, () => {
        const kind = pickW(KINDS);
        return {
          x: Math.random() * W, y: Math.random() * H,
          kind,
          s: kind === 'sparkle' ? 3 + Math.random() * 3 : 2.5 + Math.random() * 1.5,   // radius px
          c: pickW(palettes[mode]),
          ph: Math.random() * Math.PI * 2,
          sp: .45 + Math.random() * 1.1,
          rot: kind === 'gothic' ? Math.random() * Math.PI : 0,
          vx: (Math.random() - .5) * .03, vy: (Math.random() - .5) * .03,
        };
      });
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        const a = (reduce ? .8 : Math.max(0, Math.sin(t / 1000 * p.sp + p.ph)) ** 2) * .75;
        if (a < .04) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.c; ctx.strokeStyle = p.c;
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.rot) ctx.rotate(p.rot);
        SHAPES[p.kind](ctx, p.s * (.5 + .5 * a));
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };
    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (t - lastT < 33) return;               // ~30fps
      lastT = t;
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
        if (p.y < -12) p.y = H + 12; else if (p.y > H + 12) p.y = -12;
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

  // page-wide field: fixed behind all content
  const pageCv = document.createElement('canvas');
  pageCv.className = 'glints glints--page';
  pageCv.setAttribute('aria-hidden', 'true');
  document.body.prepend(pageCv);
  field(pageCv, 'day', () => [window.innerWidth, window.innerHeight], 42000).start();

  // sections with their own background (mist, night) get their own field
  document.querySelectorAll('[data-glints]').forEach((host) => {
    const mode = host.dataset.glints === 'night' ? 'night' : 'day';
    const cv = document.createElement('canvas');
    cv.className = 'glints';
    cv.setAttribute('aria-hidden', 'true');
    host.prepend(cv);
    const f = field(cv, mode, () => [host.clientWidth, host.clientHeight], mode === 'night' ? 24000 : 42000);
    if (!reduce) new IntersectionObserver(([e]) => f.setVisible(e.isIntersecting)).observe(host);
  });

  // ---------- hero sound wave: flat from the left edge, a live voice signal starts
  //            at the middle of the logo's first "N" and flows to the right ----------
  document.querySelectorAll('[data-wave]').forEach((host) => {
    const cv = document.createElement('canvas');
    cv.className = 'wave';
    cv.setAttribute('aria-hidden', 'true');
    host.prepend(cv);
    const ctx = cv.getContext('2d');
    const color = token('--color-ink-sub');
    const HEAD = .13;                          // middle of the first "N" (share of the logo width)
    const STEP = 2;                            // px per sample
    const SPEED = 60;                          // px per second, left -> right
    const RATE = SPEED / STEP;                 // samples per second
    let W = 0, H = 0, x0 = 0, y0 = 0, amp = 56, hist = [], raf = 0, lastT = 0, acc = 0, visible = true;
    // voice state: talking / pausing, syllable envelope
    let mode = 'pause', left = RATE * .8, level = 0, env = 0, syl = 0, sylRate = 4.5, sign = 1;

    const next = () => {
      if (--left <= 0) {
        if (mode === 'pause') { mode = 'talk'; left = RATE * (.6 + Math.random() * 1.6); level = .35 + Math.random() * .65; sylRate = 3.5 + Math.random() * 2.5; }
        else { mode = 'pause'; left = RATE * (.35 + Math.random() * 1.2); }
      }
      let target = 0;
      if (mode === 'talk') {
        syl += (2 * Math.PI * sylRate) / RATE * (.8 + Math.random() * .4);
        target = level * Math.abs(Math.sin(syl)) ** .7;
      }
      env += (target - env) * .35;
      sign = -sign;
      const v = env * amp * sign * (.45 + Math.random() * .55);
      return v + (Math.random() - .5) * .6;    // the line is never perfectly still
    };

    const build = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const header = document.querySelector('.site-header');
      const first = Math.min(host.clientHeight, window.innerHeight - (header ? header.offsetHeight : 0));
      // stacked (SP / TB portrait): the wave runs in the empty row right under the illustration
      const stacked = host.clientHeight - first > 120;
      W = host.clientWidth; H = stacked ? first + 48 : first;
      cv.style.height = `${H}px`;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      y0 = Math.round(stacked ? first + 24 : H * .84) + .5;
      amp = stacked ? 22 : 56;
      const logo = host.querySelector('.cover__logo');
      const lr = logo.getBoundingClientRect(), hr = host.getBoundingClientRect();
      x0 = Math.round(lr.left - hr.left + lr.width * HEAD);
      hist = Array.from({ length: Math.ceil((W - x0) / STEP) + 2 }, () => 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(x0, y0);                      // no input yet: a straight line
      for (let i = 0; i < hist.length; i++) ctx.lineTo(x0 + i * STEP + acc, y0 - hist[i]);
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.lineJoin = 'round';
      ctx.globalAlpha = .9;
      ctx.stroke();
      // fade the right end only
      ctx.globalCompositeOperation = 'destination-in';
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, '#000'); g.addColorStop(.86, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      const dt = lastT ? Math.min(64, t - lastT) : 16;
      lastT = t;
      acc += SPEED * dt / 1000;
      while (acc >= STEP) { acc -= STEP; hist.pop(); hist.unshift(next()); }
      draw();
    };
    const start = () => { if (!raf && visible && !document.hidden && !reduce) { lastT = 0; raf = requestAnimationFrame(loop); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    build();
    if (reduce) {                             // a still phrase just after the input point
      for (let i = 0; i < hist.length; i++) hist[i] = next();
      draw();
    } else {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(host);
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    }
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (reduce) draw(); }, 200); });
  });
})();
