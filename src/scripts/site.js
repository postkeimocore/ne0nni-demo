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

  // ---------- stacked reveal: two pictures land, then the shown one (base.css) ----------
  // The pages put in other pictures of the work (stackPictures); a stack without them gets two copies of its picture.
  document.querySelectorAll('[data-stack]').forEach((el) => {
    if (el.querySelector(':scope > .stack__layer')) return;
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
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (reduce) el.classList.add('is-in'); else io.observe(el);
  });
  // stacked pictures start later, once their top is 20% up the screen, so the landing is seen (2026-11-13)
  const ioStack = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); ioStack.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -20% 0px' });
  document.querySelectorAll('[data-stack]').forEach((el) => {
    if (reduce) el.classList.add('is-in'); else ioStack.observe(el);
  });

  // ---------- masthead: hide the header logo while the large hero logo is on screen ----------
  const masthead = document.querySelector('[data-masthead]');
  const header = document.querySelector('.site-header');
  if (masthead && header) {
    new IntersectionObserver(([e]) => header.classList.toggle('is-masthead', e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' }).observe(masthead);
  }

  // ---------- header letters: black over light things, white over dark ones (4-10) ----------
  // Three copies of the header under it turn what is behind each letter into black or white; the header flips that.
  const hdr = document.querySelector('.site-header');
  if (hdr) {
    const layers = ['grey', 'burn', 'dodge'].map((k) => {
      const l = hdr.cloneNode(true);
      l.classList.add('site-header--layer', `is-${k}`);
      l.setAttribute('aria-hidden', 'true');
      l.inert = true;
      l.querySelectorAll('[id], [data-menu-open], [role], [aria-label], [aria-controls], [aria-expanded]').forEach((el) => {
        ['id', 'data-menu-open', 'role', 'aria-label', 'aria-controls', 'aria-expanded'].forEach((a) => el.removeAttribute(a));
      });
      return l;
    });
    hdr.after(...layers);
    new MutationObserver(() => layers.forEach((l) => ['is-masthead', 'is-foot'].forEach((c) => l.classList.toggle(c, hdr.classList.contains(c)))))
      .observe(hdr, { attributes: true, attributeFilter: ['class'] });
    // the hover underline (nav) and the hover disc (SNS column) are drawn in the copies too
    const HOVER = '.site-nav a, .site-header__sns a';
    hdr.querySelectorAll(HOVER).forEach((a, i) => {
      const mirror = (on) => layers.forEach((l) => l.querySelectorAll(HOVER)[i].classList.toggle('is-hover', on));
      a.addEventListener('pointerenter', () => mirror(true));
      a.addEventListener('pointerleave', () => mirror(false));
    });
  }

  // ---------- HOME, PC: the SNS column in the header goes when the footer (same icons) comes up to it ----------
  const footer = document.querySelector('.site-footer');
  if (hdr && footer && hdr.querySelector('.site-header__sns')) {
    new IntersectionObserver(([e]) => hdr.classList.toggle('is-foot', e.isIntersecting), { rootMargin: '0px 0px -38% 0px' }).observe(footer);
  }

  // ---------- cable line: one line threads behind the works, drawn with scroll ----------
  const HEAD_SP = 0.35;
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
      // the line's head sits 70% down the screen; on phones the words run over the line, so it sits higher and
      // the part you read next is still clear (2026-11-09)
      let t = (vh * (window.innerWidth < 768 ? HEAD_SP : 0.7) - r.top) / r.height;
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

  // ---------- works list (WORKS): filter with checkboxes and sort, like a shop's list ----------
  // The options sit in the left column on PC (it stays while the list scrolls) and in the panel on phones and
  // tablets: one set of checkboxes, moved between the two.
  // A work is shown when, in every group that has a picked option, it has one of them (any inside a group, all
  // across groups). Each option shows how many works it would show with the other groups as they are.
  const list = document.querySelector('[data-works]');
  const shop = document.querySelector('[data-shop]');
  const panel = document.querySelector('[data-facets]');
  const options = document.querySelector('[data-facet-list]');
  if (list && shop && panel && options) {
    const side = document.querySelector('[data-side]');
    const slot = panel.querySelector('[data-facet-slot]');
    const pc = window.matchMedia('(min-width: 1200px)');
    const place = () => {
      if (pc.matches) { if (panel.open) panel.close(); side.append(options); } else slot.append(options);
    };
    place();
    pc.addEventListener('change', place);
    // the bar marks itself once it sticks under the header (the ground under the header shows then)
    const bar = shop.querySelector('[data-bar]');
    const stuck = () => bar.classList.toggle('is-stuck', bar.getBoundingClientRect().top <= parseFloat(getComputedStyle(bar).top) + 0.5 && window.scrollY > 0);
    window.addEventListener('scroll', stuck, { passive: true });
    stuck();
    const items = [...list.querySelectorAll('[data-keys]')];
    const boxes = [...options.querySelectorAll('input[type="checkbox"]')];
    const sort = shop.querySelector('[data-sort]');
    const sortLabel = shop.querySelector('[data-sort-label]');
    const chipBoxes = [...shop.querySelectorAll('[data-chips]')];
    const badge = shop.querySelector('[data-active-n]');
    const empty = document.querySelector('[data-works-empty]');
    const keys = new Map(items.map((el) => [el, el.dataset.keys.split(' ')]));
    const picked = () => {
      const by = {};
      boxes.forEach((b) => { if (b.checked) (by[b.name] = by[b.name] || []).push(b.value); });
      return by;
    };
    const fits = (el, by, skip) => Object.entries(by).every(([g, ks]) => g === skip || ks.some((k) => keys.get(el).includes(k)));
    const chip = (b) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'fchip t-label' + (b.hasAttribute('data-name') ? ' is-name' : '');
      el.setAttribute('aria-label', `${b.dataset.label} を外す`);
      el.append(b.dataset.label, Object.assign(document.createElement('span'), { className: 'fchip__x' }));
      el.addEventListener('click', () => { b.checked = false; apply(true); });
      return el;
    };
    const apply = (push) => {
      const by = picked();
      const shown = items.filter((el) => fits(el, by));
      const dir = sort.value === 'old' ? 1 : -1;
      items.slice().sort((a, b) => dir * (a.dataset.no - b.dataset.no)).forEach((el) => list.append(el));
      items.forEach((el) => { el.hidden = !shown.includes(el); });
      boxes.forEach((b) => {
        const n = items.filter((el) => fits(el, by, b.name) && keys.get(el).includes(b.value)).length;
        b.closest('label').querySelector('[data-n]').textContent = String(n);
      });
      document.querySelectorAll('[data-count]').forEach((c) => { c.textContent = String(shown.length); });
      const on = boxes.filter((b) => b.checked);
      badge.textContent = String(on.length);
      badge.hidden = on.length === 0;
      chipBoxes.forEach((c) => {
        const clear = on.length ? [Object.assign(document.createElement('button'), { type: 'button', className: 'fchip fchip--clear t-label', textContent: 'すべて解除', onclick: clearAll })] : [];
        c.replaceChildren(...on.map(chip), ...clear);
      });
      if (empty) empty.hidden = shown.length > 0;
      sortLabel.textContent = sort.selectedOptions[0].textContent;
      if (push) {
        const url = new URL(location.href);
        if (on.length) url.searchParams.set('f', on.map((b) => b.value).join(',')); else url.searchParams.delete('f');
        if (sort.value === 'old') url.searchParams.set('sort', 'old'); else url.searchParams.delete('sort');
        history.replaceState(null, '', url);
      }
    };
    function clearAll() { boxes.forEach((b) => { b.checked = false; }); apply(true); }
    boxes.forEach((b) => b.addEventListener('change', () => apply(true)));
    sort.addEventListener('change', () => apply(true));
    document.querySelectorAll('[data-clear]').forEach((b) => b.addEventListener('click', clearAll));
    shop.querySelector('[data-facets-open]').addEventListener('click', () => panel.showModal());
    panel.querySelectorAll('[data-facets-close]').forEach((b) => b.addEventListener('click', () => panel.close()));
    panel.addEventListener('click', (e) => { if (e.target === panel) panel.close(); });   // a press on the dark side
    const q = new URLSearchParams(location.search);
    (q.get('f') || '').split(',').forEach((k) => { const b = boxes.find((x) => x.value === k); if (b) b.checked = true; });
    if (q.get('sort') === 'old') sort.value = 'old';
    apply(false);
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
