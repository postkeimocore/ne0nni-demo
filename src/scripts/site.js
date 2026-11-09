// NE0NNi site behaviour: menu, reveals, stacked images, cable line, works filter, post players, contact form.
// Spec: design-system.md 5, 6
export default function site() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- SP menu ----------
  const menuBtn = document.querySelector('[data-menu-open]');
  const menu = document.getElementById('menu');
  if (menuBtn && menu) {
    const close = menu.querySelector('[data-menu-close]');
    const setOpen = (open) => {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('is-menu-open', open);
      (open ? close : menuBtn).focus();
    };
    menuBtn.addEventListener('click', () => setOpen(true));
    close.addEventListener('click', () => setOpen(false));
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key !== 'Tab') return;
      const f = [...menu.querySelectorAll('a, button')];
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    window.matchMedia('(min-width: 768px)').addEventListener('change', (m) => { if (m.matches && !menu.hidden) setOpen(false); });
  }

  // ---------- char reveal: letters appear one by one in random order ----------
  document.querySelectorAll('[data-reveal="chars"]').forEach((el) => {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach((word, wi) => {
      if (wi) el.appendChild(document.createTextNode(' '));
      const w = document.createElement('span');
      w.className = 'word';
      w.setAttribute('aria-hidden', 'true');
      [...word].forEach((c) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        s.style.setProperty('--d', `${Math.round(Math.random() * 600)}ms`);
        w.appendChild(s);
      });
      el.appendChild(w);
    });
  });

  // ---------- stacked reveal: two tilted copies behind the image ----------
  document.querySelectorAll('[data-stack]').forEach((el) => {
    const img = el.querySelector('img');
    for (let i = 0; i < 2; i++) {
      const layer = document.createElement('div');
      layer.className = 'stack__layer';
      layer.setAttribute('aria-hidden', 'true');
      const copy = img.cloneNode();
      copy.alt = '';
      copy.removeAttribute('fetchpriority');
      layer.appendChild(copy);
      el.insertBefore(layer, el.firstChild);
    }
  });

  // ---------- fade-up for blocks ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.25 });
  document.querySelectorAll('[data-reveal], [data-stack]').forEach((el) => {
    if (reduce) el.classList.add('is-in'); else io.observe(el);
  });

  // ---------- masthead: hide the header logo while the large hero logo is on screen ----------
  const masthead = document.querySelector('[data-masthead]');
  const header = document.querySelector('.site-header');
  if (masthead && header) {
    new IntersectionObserver(([e]) => header.classList.toggle('is-masthead', e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' }).observe(masthead);
  }

  // ---------- header veil: shown once the page scrolls, in the color of the ground under the header (4-10) ----------
  const hdr = document.querySelector('.site-header');
  if (hdr) {
    const grounds = [...document.querySelectorAll('.is-night, .l-mist')];
    let queued = false;
    const ground = () => {
      queued = false;
      const y = hdr.offsetHeight / 2;
      const g = grounds.find((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom > y && r.width >= window.innerWidth * 0.9; });
      hdr.dataset.ground = g ? (g.classList.contains('is-night') ? 'night' : 'mist') : 'paper';
      hdr.classList.toggle('is-scrolled', window.scrollY > 0);
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(ground); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    ground();
  }

  // ---------- cable line: one line threads behind the works, drawn with scroll ----------
  document.querySelectorAll('[data-cable]').forEach((host) => {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'cable');
    svg.setAttribute('aria-hidden', 'true');
    const out = document.createElementNS(NS, 'path'); out.setAttribute('class', 'c-out');
    const inn = document.createElementNS(NS, 'path'); inn.setAttribute('class', 'c-in');
    svg.append(out, inn);
    const traveler = document.createElement('span');
    traveler.className = 'ast cable__traveler';
    traveler.setAttribute('aria-hidden', 'true');
    host.prepend(svg, traveler);
    let len = 0;
    const build = () => {
      const hr = host.getBoundingClientRect();
      const pts = [...host.querySelectorAll('[data-cable-point]')].map((el) => {
        const r = el.getBoundingClientRect();
        const at = el.dataset.cablePoint;           // "center" | "top" | "bottom"
        const y = at === 'top' ? r.top : at === 'bottom' ? r.bottom : r.top + r.height / 2;
        return { x: r.left + r.width / 2 - hr.left, y: y - hr.top };
      });
      if (pts.length < 2) return;
      // on narrow screens every picture sits in the middle: sway the points so the line swings between them
      const sway = window.innerWidth < 768 ? hr.width * 0.2 : 0;
      if (sway) pts.forEach((p, i) => { if (i > 0 && i < pts.length - 1) p.x += i % 2 ? -sway : sway; });
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dy = (b.y - a.y) * 0.55;
        d += ` C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
      }
      svg.setAttribute('viewBox', `0 0 ${hr.width} ${hr.height}`);
      svg.setAttribute('width', hr.width); svg.setAttribute('height', hr.height);
      out.setAttribute('d', d); inn.setAttribute('d', d);
      len = out.getTotalLength();
      [out, inn].forEach((p) => { p.style.strokeDasharray = `${len}`; });
      update();
    };
    const update = () => {
      if (!len) return;
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      let t = (vh * 0.7 - r.top) / r.height;
      t = reduce ? 1 : Math.min(1, Math.max(0, t));
      [out, inn].forEach((p) => { p.style.strokeDashoffset = `${len * (1 - t)}`; });
      const pt = out.getPointAtLength(len * t);
      traveler.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%) rotate(${t * 480}deg)`;
      traveler.style.opacity = t > 0.005 && t < 0.995 ? '1' : '0';
    };
    window.addEventListener('scroll', update, { passive: true });
    let rt = 0;
    const rebuild = () => { clearTimeout(rt); rt = setTimeout(build, 120); };
    window.addEventListener('resize', rebuild);
    window.addEventListener('load', build);
    new ResizeObserver(rebuild).observe(host);
    build();
  });

  // ---------- works filter: one pressed button; the layout rhythm follows the visible works ----------
  const list = document.querySelector('[data-works]');
  const filter = document.querySelector('[data-filter]');
  if (list && filter) {
    const items = [...list.querySelectorAll('[data-keys]')];
    const RHYTHM = ['w-center', 'w-pair-a', 'w-pair-b', 'w-bleed-right', 'w-center', 'w-pair-a', 'w-pair-b', 'w-bleed-left'];
    const ALL = RHYTHM.concat('w-solo');
    const count = document.querySelector('[data-count]');
    const apply = (key, push) => {
      filter.querySelectorAll('[data-key]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
      const shown = items.filter((el) => key === 'all' || el.dataset.keys.split(' ').includes(key));
      items.forEach((el) => { el.hidden = !shown.includes(el); el.classList.remove(...ALL); });
      shown.forEach((el, i) => {
        let cls = shown.length === 2 ? ['w-pair-a', 'w-pair-b'][i] : RHYTHM[i % RHYTHM.length];
        if (cls === 'w-pair-a' && i === shown.length - 1) cls = 'w-solo';    // a pair needs a partner
        el.classList.add(cls);
      });
      if (count) count.textContent = String(shown.length);
      if (push) {
        const url = new URL(location.href);
        if (key === 'all') url.searchParams.delete('f'); else url.searchParams.set('f', key);
        history.replaceState(null, '', url);
      }
    };
    filter.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-key]');
      if (btn) apply(btn.dataset.key, true);
    });
    const start = new URLSearchParams(location.search).get('f');
    apply(start && filter.querySelector(`[data-key="${CSS.escape(start)}"]`) ? start : 'all', false);
  }

  // ---------- posts: the player (YouTube Shorts / TikTok) loads only when the phone's screen is pressed ----------
  document.querySelectorAll('[data-embed]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.className = 'phone__player';
      f.src = btn.dataset.embed;
      f.title = btn.dataset.title;
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      btn.after(f);
      btn.hidden = true;
      f.focus();
    }, { once: true });
  });

  // ---------- contact form ----------
  const form = document.querySelector('[data-contact]');
  if (form) {
    const status = form.querySelector('[data-status]');
    const submit = form.querySelector('[type="submit"]');
    const fields = [...form.querySelectorAll('[data-required]')];
    const showError = (el, msg) => {
      const box = form.querySelector(`#${el.dataset.errorId}`);
      const target = el.matches('fieldset') ? el.querySelectorAll('input') : [el];
      target.forEach((t) => { t.setAttribute('aria-invalid', msg ? 'true' : 'false'); t.classList.toggle('is-error', Boolean(msg) && !t.matches('[type="radio"], [type="checkbox"]')); });
      if (box) { box.textContent = msg || ''; box.hidden = !msg; }
    };
    const check = (el) => {
      let msg = '';
      if (el.matches('fieldset')) msg = el.querySelector('input:checked') ? '' : el.dataset.required;
      else if (el.type === 'checkbox') msg = el.checked ? '' : el.dataset.required;
      else if (!el.value.trim()) msg = el.dataset.required;
      else if (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim())) msg = 'メールアドレスの形式を確認してください';
      showError(el, msg);
      return !msg;
    };
    // Errors clear while typing (input), not on blur (change): hiding a message on blur moves the layout
    // between mousedown and mouseup, and the click the user was making (e.g. on the checkbox) gets lost.
    fields.forEach((el) => {
      if (el.matches('fieldset') || el.type === 'checkbox') el.addEventListener('change', () => check(el));
      else el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(el); });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bad = fields.filter((el) => !check(el));
      if (bad.length) {
        const f = bad[0].matches('fieldset') ? bad[0].querySelector('input') : bad[0];
        f.focus();
        status.textContent = '入力内容を確認してください';
        status.hidden = false;
        return;
      }
      const label = submit.textContent;
      submit.disabled = true;
      submit.textContent = '送信中';
      status.hidden = true;
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) throw new Error(out.error || '送信できませんでした。時間をおいてもう一度お試しください。');
        location.href = '/contact/thanks/';
      } catch (err) {
        status.textContent = err.message;
        status.hidden = false;
        submit.disabled = false;
        submit.textContent = label;
        window.turnstile?.reset();
      }
    });
  }
}
