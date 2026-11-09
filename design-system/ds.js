// NE0NNi motion: char reveal, stacked reveal, cable line.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // char reveal — letters appear one by one in random order
  document.querySelectorAll('[data-reveal="chars"]').forEach((el) => {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((c) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? ' ' : c;
      s.style.setProperty('--d', `${Math.round(Math.random() * 600)}ms`);
      el.appendChild(s);
    });
  });

  // stacked reveal — two tilted copies behind the image
  document.querySelectorAll('[data-stack]').forEach((el) => {
    const img = el.querySelector('img');
    for (let i = 0; i < 2; i++) {
      const layer = document.createElement('div');
      layer.className = 'stack__layer';
      layer.setAttribute('aria-hidden', 'true');
      const copy = img.cloneNode();
      copy.alt = '';
      layer.appendChild(copy);
      el.insertBefore(layer, img);
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('[data-reveal="chars"], [data-stack]').forEach((el) => {
    if (reduce) el.classList.add('is-in'); else io.observe(el);
  });

  // filter — one pressed button per group
  document.querySelectorAll('.filter').forEach((group) => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter__btn');
      if (!btn) return;
      group.querySelectorAll('.filter__btn').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    });
  });

  // posts: the player loads only when the phone's screen is pressed (same as the site)
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

  // masthead — hide the header logo while the large hero logo is on screen
  const masthead = document.querySelector('[data-masthead]');
  const header = document.querySelector('.site-header');
  if (masthead && header) {
    new IntersectionObserver(([e]) => {
      header.classList.toggle('is-masthead', e.isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(masthead);
  }

  // header letters: black over light things, white over dark ones (4-10)
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
    new MutationObserver(() => layers.forEach((l) => l.classList.toggle('is-masthead', hdr.classList.contains('is-masthead'))))
      .observe(hdr, { attributes: true, attributeFilter: ['class'] });
    // the hover underline is drawn in the copies too
    hdr.querySelectorAll('.site-nav a').forEach((a, i) => {
      const mirror = (on) => layers.forEach((l) => l.querySelectorAll('.site-nav a')[i].classList.toggle('is-hover', on));
      a.addEventListener('pointerenter', () => mirror(true));
      a.addEventListener('pointerleave', () => mirror(false));
    });
  }

  // cable line — drawn with scroll, an asterisk travels along it
  document.querySelectorAll('[data-cable]').forEach((wrap) => {
    const paths = wrap.querySelectorAll('.cable path');
    const traveler = wrap.querySelector('.cable__traveler');
    const svg = wrap.querySelector('svg');
    const main = paths[0];
    const len = main.getTotalLength();
    paths.forEach((p) => { p.style.strokeDasharray = len; });
    const update = () => {
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      let t = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      t = reduce ? 1 : Math.min(1, Math.max(0, t));
      paths.forEach((p) => { p.style.strokeDashoffset = len * (1 - t); });
      if (traveler) {
        const pt = main.getPointAtLength(len * t);
        const m = svg.getScreenCTM();
        const sr = svg.getBoundingClientRect();
        const x = pt.x * m.a + m.e - sr.left;
        const y = pt.y * m.d + m.f - sr.top;
        traveler.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${t * 240}deg)`;
        traveler.style.opacity = t > 0.01 ? 1 : 0;
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  });
})();
