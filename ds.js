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

  // post play button — controls the video in the same post (kept outside the player)
  document.querySelectorAll('.post').forEach((post) => {
    const btn = post.querySelector('.post__play');
    const video = post.querySelector('video');
    if (!btn || !video) return;
    btn.addEventListener('click', () => {
      if (video.paused) { video.play(); btn.setAttribute('aria-label', '動画を一時停止'); btn.classList.add('is-playing'); }
      else { video.pause(); btn.setAttribute('aria-label', '動画を再生'); btn.classList.remove('is-playing'); }
    });
  });

  // masthead — hide the header logo while the large hero logo is on screen
  const masthead = document.querySelector('[data-masthead]');
  const header = document.querySelector('.site-header');
  if (masthead && header) {
    new IntersectionObserver(([e]) => {
      header.classList.toggle('is-masthead', e.isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(masthead);
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
