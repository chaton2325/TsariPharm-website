/* =========================================================
   TsariPharm — animation layer (emerald edition)
   ========================================================= */

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 0a. TECH CONSTELLATION on hero/page-hero/cta-band ---------- */
  function injectTechBackground(target) {
    if (!target || target.querySelector('.tech-bg')) return;
    target.style.position = target.style.position || 'relative';

    const wrap = document.createElement('div');
    wrap.className = 'tech-bg';

    const canvas = document.createElement('canvas');
    wrap.appendChild(canvas);

    // Pulse dots
    ['p1','p2','p3','p4','p5'].forEach(c => {
      const d = document.createElement('span');
      d.className = 'tech-pulse ' + c;
      wrap.appendChild(d);
    });

    // Tech glyphs
    const glyphs = ['{ }', '01101', '< />', '#'];
    glyphs.forEach((g, i) => {
      const el = document.createElement('span');
      el.className = 'tech-glyph g' + (i+1);
      el.textContent = g;
      wrap.appendChild(el);
    });

    target.insertBefore(wrap, target.firstChild);

    // Bring direct children above the bg
    Array.from(target.children).forEach(child => {
      if (child === wrap) return;
      const cs = getComputedStyle(child);
      if (cs.position === 'static') child.style.position = 'relative';
      if (!child.style.zIndex) child.style.zIndex = '2';
    });

    // ---- canvas constellation ----
    const ctx = canvas.getContext('2d');
    let w, h, particles, animId;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = target.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);

      const count = Math.min(70, Math.floor((w * h) / 14000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // move + draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // connections
      const maxDist = 130;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < maxDist) {
            const op = (1 - dist / maxDist) * 0.55;
            ctx.strokeStyle = `rgba(255,255,255,${op})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    // observe size changes (responsive + nav scroll shrink)
    const ro = new ResizeObserver(resize);
    ro.observe(target);

    // pause when off-screen
    const visIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !animId) draw();
        else if (!e.isIntersecting && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      });
    });
    visIo.observe(target);
  }

  // Skip canvas constellation on mobile (CPU/battery), keep CSS layer
  const isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
  if (!prefersReduced && !isMobile) {
    document.querySelectorAll('.hero, .page-hero, .cta-band, .post-hero, .testi-section').forEach(injectTechBackground);
  } else if (!prefersReduced && isMobile) {
    // On mobile, only inject the CSS pseudo + pulse dots, no canvas
    document.querySelectorAll('.hero, .page-hero, .cta-band, .post-hero, .testi-section').forEach(target => {
      if (target.querySelector('.tech-bg')) return;
      target.style.position = target.style.position || 'relative';
      const wrap = document.createElement('div');
      wrap.className = 'tech-bg';
      ['p1','p2','p3'].forEach(c => {
        const d = document.createElement('span');
        d.className = 'tech-pulse ' + c;
        wrap.appendChild(d);
      });
      target.insertBefore(wrap, target.firstChild);
      Array.from(target.children).forEach(child => {
        if (child === wrap) return;
        const cs = getComputedStyle(child);
        if (cs.position === 'static') child.style.position = 'relative';
        if (!child.style.zIndex) child.style.zIndex = '2';
      });
    });
  }

  /* ---------- 0. NAV SHRINK ON SCROLL + MOBILE MENU ---------- */
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }, { passive: true });

    // Inject hamburger toggle if not already present
    const navLinks = nav.querySelector('.nav-links');
    if (navLinks && !nav.querySelector('.menu-toggle')) {
      const btn = document.createElement('button');
      btn.className = 'menu-toggle';
      btn.setAttribute('aria-label', 'Toggle menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span></span><span></span><span></span>';
      nav.appendChild(btn);

      btn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        btn.classList.toggle('is-open', isOpen);
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close menu when clicking a link
      navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          navLinks.classList.remove('is-open');
          btn.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });

      // Close on resize back to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          navLinks.classList.remove('is-open');
          btn.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /* ---------- 1. SCROLL REVEAL ---------- */
  if (!prefersReduced) {
    const revealTargets = document.querySelectorAll(
      'section, .svc-card, .process-step, .stat-item, .tech-cat, .industry-card, .testi-card, .price-card, .portfolio-card, .blog-card, .case-study, .about-image, .about-split > *, .faq-item, .team-card'
    );
    revealTargets.forEach(el => el.classList.add('jc-reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Array.from(entry.target.parentElement?.children || []).indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(idx * 70, 400)}ms`;
          entry.target.classList.add('jc-reveal-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));
  }

  /* ---------- 2. PORTFOLIO FILTER ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.portfolio-card').forEach(card => {
          const cats = (card.dataset.cat || '').split(' ');
          if (f === 'all' || cats.includes(f)) {
            card.style.display = '';
            card.style.animation = 'jcWordIn 0.6s var(--ease)';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---------- 3. CUSTOM CURSOR ---------- */
  if ('ontouchstart' in window || !window.matchMedia('(hover: hover)').matches || prefersReduced) {
    return;
  }

  const cursor = document.createElement('div');
  cursor.className = 'jc-cursor';
  const cursorLabel = document.createElement('span');
  cursorLabel.className = 'jc-cursor-label';
  cursor.appendChild(cursorLabel);

  const cursorDot = document.createElement('div');
  cursorDot.className = 'jc-cursor-dot';

  const trails = [];
  for (let i = 0; i < 5; i++) {
    const t = document.createElement('div');
    t.className = 'jc-cursor-trail';
    t.style.opacity = (0.45 - i * 0.07).toFixed(2);
    t.style.width = (6 - i * 0.6) + 'px';
    t.style.height = (6 - i * 0.6) + 'px';
    document.body.appendChild(t);
    trails.push({ el: t, x: 0, y: 0 });
  }

  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let lastMove = Date.now();
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    lastMove = Date.now();
    if (!isMoving) {
      isMoving = true;
      trails.forEach(t => t.el.style.opacity = '');
    }
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '';
    cursorDot.style.opacity = '';
  });

  function loopCursor() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    let prevX = mx, prevY = my;
    trails.forEach((t, i) => {
      t.x += (prevX - t.x) * (0.4 - i * 0.05);
      t.y += (prevY - t.y) * (0.4 - i * 0.05);
      t.el.style.transform = `translate(${t.x}px, ${t.y}px) translate(-50%, -50%)`;
      prevX = t.x; prevY = t.y;
    });
    if (Date.now() - lastMove > 300 && isMoving) {
      isMoving = false;
      trails.forEach(t => t.el.style.opacity = '0');
    }
    requestAnimationFrame(loopCursor);
  }
  loopCursor();

  function setState(state, label) {
    cursor.className = 'jc-cursor';
    if (state) cursor.classList.add(state);
    cursorLabel.textContent = label || '';
  }

  const cursorStates = [
    { sel: 'input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="search"], input[type="url"], input[type="password"], textarea', state: 'is-text', label: '' },
    { sel: '.btn-primary, .nav-cta, .btn-orange, .btn-dark, .btn-ghost, .btn', state: 'is-button', label: 'Click' },
    { sel: '.svc-card, .industry-card, .portfolio-card, .case-image, .testi-card', state: 'is-card', label: 'View' },
    { sel: '.blog-card', state: 'is-card', label: 'Read' },
    { sel: '.price-card', state: 'is-card', label: 'Choose' },
    { sel: 'a[href^="mailto:"], a[href^="tel:"]', state: 'is-link', label: '' },
    { sel: '.svc-link, .blog-readmore, .filter-btn, .card-link', state: 'is-link', label: '' },
    { sel: '.nav-links a:not(.nav-cta)', state: 'is-nav', label: '' },
    { sel: 'a, button, select', state: 'is-link', label: '' },
  ];

  cursorStates.forEach(({ sel, state, label }) => {
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mouseenter', () => setState(state, label));
      el.addEventListener('mouseleave', () => setState(null));
    });
  });

  /* ---------- 4. MAGNETIC BUTTONS (desktop only) ---------- */
  if (!('ontouchstart' in window) && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- 5. PARALLAX ON IMAGES ---------- */
  const parallaxImgs = document.querySelectorAll(
    '.hero-illustration img, .about-image img, .industry-card img, .portfolio-img img, .blog-img img, .case-image img'
  );
  let ticking = false;
  function updateParallax() {
    const vh = window.innerHeight;
    parallaxImgs.forEach(img => {
      const wrapper = img.parentElement;
      const rect = wrapper.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const shift = progress * -22;
      img.style.transform = `translate3d(0, ${shift}px, 0) scale(1.1)`;
    });
    ticking = false;
  }
  parallaxImgs.forEach(img => {
    img.style.willChange = 'transform';
  });
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });
  updateParallax();

  /* ---------- 6. HERO TEXT REVEAL ---------- */
  const heroH1 = document.querySelector('.hero h1');
  if (heroH1) {
    const html = heroH1.innerHTML;
    const tokens = html.split(/(<[^>]+>[^<]*<\/[^>]+>|\s+)/).filter(Boolean);
    heroH1.innerHTML = tokens.map((w, i) => {
      if (w.trim() === '' || w.startsWith('<')) return w;
      return `<span class="jc-word" style="animation-delay:${i * 70}ms">${w}</span>`;
    }).join('');
  }

  /* ---------- 7. CARD TILT (desktop only) ---------- */
  if (!('ontouchstart' in window) && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.svc-card, .price-card, .testi-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${y * -2.5}deg) rotateY(${x * 3}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

})();
