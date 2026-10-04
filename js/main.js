/* =========================================================
   Osama Mohamed Rizk — Portfolio interactions & motion
   Content is fully visible without JS; GSAP/Lenis only add motion.
   ========================================================= */
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const html = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animate = hasGsap && !reduceMotion;
  let lenis = null;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Cairo clock ---------- */
  const clockFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' });
  const tickClock = () => {
    const t = clockFmt.format(new Date());
    $$('.js-clock').forEach((el) => { el.textContent = t; });
  };
  tickClock();
  setInterval(tickClock, 10000);

  /* ---------- Nav: scrolled state + hide on scroll down ---------- */
  const nav = $('#nav');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    const menuOpen = $('#menu').classList.contains('is-open');
    if (!menuOpen) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menu = $('#menu');
  const toggle = $('#menuToggle');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.remove('is-hidden');
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Anchor links (Lenis-aware) ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : document.querySelector(id);
    if (!target) return;
    if (menu.classList.contains('is-open')) setMenu(false);
    if (lenis) {
      e.preventDefault();
      lenis.scrollTo(id === '#top' ? 0 : target, { duration: 1.4 });
    }
  });

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.nav__links a[href^="#"]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'about', 'capabilities', 'toolbox', 'experience', 'contact'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  /* ---------- Toast + copy email ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $('#copyEmail').addEventListener('click', async (e) => {
    const email = e.currentTarget.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard ✓');
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  /* ---------- Hide CV button if the PDF isn't uploaded yet ---------- */
  const cvBtn = $('#cvBtn');
  if (location.protocol.startsWith('http')) {
    fetch(cvBtn.getAttribute('href'), { method: 'HEAD' })
      .then((res) => { if (!res.ok) cvBtn.hidden = true; })
      .catch(() => {});
  }

  /* ---------- Case-study drawer ---------- */
  const drawer = $('#drawer');
  const drawerContent = $('#drawerContent');
  const openDrawer = (key) => {
    const tpl = document.getElementById(`tpl-${key}`);
    if (!tpl || typeof drawer.showModal !== 'function') return;
    drawerContent.replaceChildren(tpl.content.cloneNode(true));
    $('.drawer__scroll', drawer).scrollTop = 0;
    if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    drawer.showModal();
    if (animate) {
      gsap.from($$('.drawer__body > *', drawer), {
        y: 24, opacity: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out', delay: 0.2,
      });
    }
  };
  $$('[data-open]').forEach((card) => {
    card.addEventListener('click', () => openDrawer(card.dataset.open));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(card.dataset.open); }
    });
  });
  $('#drawerClose').addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.close(); });
  drawer.addEventListener('close', () => {
    if (lenis) lenis.start(); else document.body.style.overflow = '';
  });

  if (!animate) {
    html.classList.remove('is-loading');
    return;
  }

  /* =========================================================
     Motion (GSAP + ScrollTrigger + Lenis)
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  html.classList.add('has-gsap');

  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Split text ---------- */
  $$('.split').forEach((el) => splitWords(el));
  const statement = $('#statement');
  splitWords(statement, 'hw');

  /* ---------- Hero intro ---------- */
  const heroFade = ['.hero__status', '.hero__hi', '.hero__role', '.hero__summary', '.hero__chips li', '.hero__ctas .btn', '.badge', '.hero__meta > div'];
  gsap.set(heroFade, { opacity: 0, y: 24 });
  gsap.set('.hero__name', { yPercent: 35, clipPath: 'inset(0% 0% 100% 0%)' });

  const heroIn = () => gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: startTyping })
    .from('.nav', { yPercent: -100, duration: 1, clearProps: 'transform' }, 0)
    .to('.hero__status', { opacity: 1, y: 0, duration: 0.9 }, 0.05)
    .to('.hero__hi', { opacity: 1, y: 0, duration: 0.9 }, 0.15)
    .to('.hero__name', { yPercent: 0, clipPath: 'inset(0% 0% -15% 0%)', duration: 1.4 }, 0.25)
    .to('.hero__role', { opacity: 1, y: 0, duration: 0.9 }, 0.6)
    .to('.hero__summary', { opacity: 1, y: 0, duration: 0.9 }, 0.7)
    .to('.hero__chips li', { opacity: 1, y: 0, duration: 0.7, stagger: 0.05 }, 0.8)
    .to(['.hero__ctas .btn', '.badge'], { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.95)
    .to('.hero__meta > div', { opacity: 1, y: 0, duration: 0.9, stagger: 0.06 }, 1.05);

  /* ---------- Loader (once per session) ---------- */
  if (html.classList.contains('is-loading')) {
    if (lenis) lenis.stop();
    const name = $('#loaderName');
    splitChars(name);
    const count = $('#loaderCount');
    const counter = { v: 0 };

    gsap.timeline({
      onComplete: () => {
        html.classList.remove('is-loading');
        try { sessionStorage.setItem('or-intro', '1'); } catch (e) {}
        if (lenis) lenis.start();
      },
    })
      .from($$('.ch', name), { yPercent: 110, duration: 0.9, stagger: 0.025, ease: 'power4.out' }, 0)
      .to(counter, {
        v: 100, duration: 1.7, ease: 'power2.inOut',
        onUpdate: () => { count.textContent = Math.round(counter.v); },
      }, 0)
      .to(['.loader__name', '.loader__bottom'], { y: -40, opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.15')
      .to('.loader__panel', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' })
      .to('.loader__coral', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.72')
      .add(heroIn(), '-=0.55');
  } else {
    heroIn();
  }

  // Name drifts up as you scroll away
  gsap.to('.hero__name', {
    yPercent: -25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  /* ---------- Generic reveals ---------- */
  gsap.set('.reveal', { y: 40, opacity: 0 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'power3.out', overwrite: true }),
  });

  /* ---------- Section titles: words rise ---------- */
  $$('.split').forEach((title) => {
    gsap.from($$('.w > span', title), {
      yPercent: 110, duration: 1.1, stagger: 0.06, ease: 'power4.out',
      scrollTrigger: { trigger: title, start: 'top 88%', once: true },
    });
  });

  /* ---------- About statement: words light up while reading ---------- */
  gsap.fromTo($$('.hw', statement), { opacity: 0.16 }, {
    opacity: 1, stagger: 0.05, ease: 'none',
    scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });

  /* ---------- Counters ---------- */
  $$('.stat__num').forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    el.textContent = `0${suffix}`;
    gsap.to(obj, {
      v: target, duration: 1.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = `${Math.round(obj.v)}${suffix}`; },
    });
  });

  /* ---------- Marquee + badge react to scroll velocity ---------- */
  const marqueeTweens = $$('.marquee__row').map((row) => {
    const track = $('.marquee__track', row);
    return Number(row.dataset.dir) > 0
      ? gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: 40, ease: 'none', repeat: -1 })
      : gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
  });
  const badgeTween = gsap.to('.badge__ring', { rotation: 360, duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
  const skewTracks = $$('.marquee__track').map((t) => gsap.quickTo(t, 'skewX', { duration: 0.4, ease: 'power3' }));
  let velocity = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { velocity = self.getVelocity(); } });
  gsap.ticker.add(() => {
    velocity *= 0.9;
    const boost = 1 + Math.min(Math.abs(velocity) / 220, 6);
    marqueeTweens.forEach((t) => t.timeScale(boost));
    badgeTween.timeScale(boost);
    const skew = gsap.utils.clamp(-8, 8, -velocity / 300);
    skewTracks.forEach((set) => set(skew));
  });

  /* ---------- Work cards ---------- */
  const cards = $$('.work-card');
  cards.forEach((card) => {
    gsap.from($('.work-card__inner', card), {
      y: 120, opacity: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 92%', once: true },
    });
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    // Stacking: as the next card slides over, the previous one shrinks and dims.
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const st = { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true };
      gsap.to($('.work-card__inner', card), { scale: 0.9, ease: 'none', scrollTrigger: st });
      gsap.to($('.work-card__shade', card), { opacity: 0.6, ease: 'none', scrollTrigger: { ...st } });
    });
  });

  /* ---------- Experience rules draw in ---------- */
  $$('.exp__rule').forEach((rule) => {
    gsap.from(rule, {
      scaleX: 0, duration: 1.4, ease: 'power3.inOut',
      scrollTrigger: { trigger: rule, start: 'top 90%', once: true },
    });
  });

  /* ---------- Pointer-only effects ---------- */
  if (!finePointer) return;

  // Hero gradient mesh leans toward the cursor
  const meshes = $$('.mesh').map((el, i) => ({
    x: gsap.quickTo(el, 'x', { duration: 1.6, ease: 'power3' }),
    y: gsap.quickTo(el, 'y', { duration: 1.6, ease: 'power3' }),
    k: i === 0 ? 60 : -40,
  }));

  // Custom cursor
  html.classList.add('has-cursor');
  const cursor = $('.cursor');
  const cursorLabel = $('.cursor__label');
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    cursor.classList.remove('is-hidden');
    cx(e.clientX); cy(e.clientY);
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    meshes.forEach((m) => { m.x(nx * m.k); m.y(ny * m.k); });
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
  $$('[data-cursor]').forEach((el) => {
    el.addEventListener('pointerenter', () => {
      cursorLabel.textContent = el.dataset.cursor;
      cursor.classList.add('is-active');
    });
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
  });

  // Magnetic elements
  $$('.magnetic').forEach((el) => {
    const strength = el.classList.contains('contact__circle') ? 0.35 : 0.25;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * strength,
        y: (e.clientY - r.top - r.height / 2) * strength,
        duration: 0.5, ease: 'power3.out',
      });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    });
  });

  /* ---------- helpers ---------- */
  // Types through the roles in the hero, like a terminal prompt.
  function startTyping() {
    const el = $('#typed');
    const roles = ['Flutter Developer @ InTheKloud', 'Fintech & E-Commerce Apps', 'Shipped to App Store & Google Play', '.NET Backend Developer'];
    let r = 0, i = roles[0].length, deleting = true;
    const tick = () => {
      if (deleting) {
        i--;
        if (i === 0) { deleting = false; r = (r + 1) % roles.length; }
      } else {
        i++;
      }
      el.textContent = roles[r].slice(0, i) || '\u200b';
      let delay = deleting ? 32 : 70;
      if (!deleting && i === roles[r].length) { deleting = true; delay = 2400; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }


  // Wraps each word in a mask so it can slide up; keeps nested elements like <em>.
  // With a class name (e.g. "hw") words are wrapped in a single plain span instead.
  function splitWords(el, plainClass) {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            if (plainClass) {
              const span = document.createElement('span');
              span.className = plainClass;
              span.textContent = part;
              frag.appendChild(span);
              return;
            }
            const outer = document.createElement('span');
            outer.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
  }

  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(span);
    });
  }
})();
