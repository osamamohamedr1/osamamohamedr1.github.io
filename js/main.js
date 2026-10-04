/* =========================================================
   Osama Mohamed Rizk — Portfolio interactions & animations
   Content is fully visible without JS; GSAP only adds motion.
   ========================================================= */
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animate = hasGsap && !reduceMotion;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state, progress bar ---------- */
  const nav = $('#nav');
  const progress = $('.scroll-progress');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 20);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) setMenu(false);
  });

  /* ---------- Active nav link ---------- */
  const navMap = new Map($$('a[href^="#"]', links).map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$('a', links).forEach((a) => a.classList.remove('active'));
      navMap.get(entry.target.id)?.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['about', 'skills', 'work', 'experience', 'contact'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  /* ---------- Typed role ---------- */
  const typed = $('#typed');
  const roles = ['Flutter Developer', 'Mobile Engineer', 'Fintech App Builder', '.NET Backend Developer'];
  if (!reduceMotion) {
    let r = 0, i = roles[0].length, deleting = true;
    const tick = () => {
      if (deleting) {
        i--;
        if (i === 0) { deleting = false; r = (r + 1) % roles.length; }
      } else {
        i++;
      }
      typed.textContent = roles[r].slice(0, i) || '​';
      let delay = deleting ? 40 : 85;
      if (!deleting && i === roles[r].length) { deleting = true; delay = 2200; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2600);
  }

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

  /* ---------- Case-study modal ---------- */
  const modal = $('#modal');
  const modalContent = $('#modalContent');
  const openModal = (key) => {
    const tpl = document.getElementById(`tpl-${key}`);
    if (!tpl || typeof modal.showModal !== 'function') return;
    modalContent.replaceChildren(tpl.content.cloneNode(true));
    $('.modal__inner', modal).scrollTop = 0;
    document.documentElement.style.overflow = 'hidden';
    modal.showModal();
    if (animate) {
      gsap.from($$('.feature-grid li, .modal__facts div', modal), {
        y: 16, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out', delay: 0.15,
      });
    }
  };
  $$('[data-open]').forEach((btn) => btn.addEventListener('click', () => openModal(btn.dataset.open)));
  $('#modalClose').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
  modal.addEventListener('close', () => { document.documentElement.style.overflow = ''; });

  if (!animate) return;

  /* =========================================================
     GSAP animations
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Hero intro ---------- */
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.nav', { y: -30, opacity: 0, duration: 0.8, clearProps: 'transform,opacity' })
    .from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
    .from('.hero__word', { yPercent: 110, duration: 1.1, stagger: 0.12 }, '-=0.5')
    .from('.hero__role', { y: 20, opacity: 0, duration: 0.7 }, '-=0.6')
    .from('.hero__lead', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
    .from('.hero__ctas .btn', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.45')
    .from('.hero__chips .chip', { y: 16, opacity: 0, scale: 0.9, duration: 0.5, stagger: 0.06 }, '-=0.35')
    .from('.scroll-hint', { opacity: 0, duration: 0.6 }, '-=0.2');

  // Hero content drifts up & fades as you scroll away
  gsap.to('.hero__inner', {
    yPercent: -12, opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  /* ---------- Generic reveal ---------- */
  gsap.set('.reveal', { y: 40, opacity: 0 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out', overwrite: true,
    }),
  });

  /* ---------- Section titles: words rise in ---------- */
  $$('.section__title, .contact__title').forEach((title) => {
    splitWords(title);
    gsap.from($$('.w > span', title), {
      yPercent: 105, duration: 0.9, stagger: 0.05, ease: 'power4.out',
      scrollTrigger: { trigger: title, start: 'top 85%', once: true },
    });
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

  /* ---------- Skill tags stagger ---------- */
  $$('.skill-card').forEach((card) => {
    gsap.from($$('.tags li', card), {
      y: 12, opacity: 0, scale: 0.92, duration: 0.45, stagger: 0.035, ease: 'back.out(2)',
      scrollTrigger: { trigger: card, start: 'top 85%', once: true },
    });
  });

  /* ---------- Projects: clip reveal + parallax ---------- */
  $$('.project').forEach((project) => {
    const wrap = $('.project__img-wrap', project);
    const img = $('img', wrap);
    gsap.fromTo(wrap,
      { clipPath: 'inset(12% 12% 12% 12% round 20px)', opacity: 0.4 },
      {
        clipPath: 'inset(0% 0% 0% 0% round 20px)', opacity: 1, duration: 1.3, ease: 'power3.out',
        scrollTrigger: { trigger: project, start: 'top 80%', once: true },
      });
    gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, {
      yPercent: 5, scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: project, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from($$('.project__bullets li, .tags--sm li', project), {
      x: -14, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out',
      scrollTrigger: { trigger: $('.project__body', project), start: 'top 75%', once: true },
    });
  });

  /* ---------- Timeline line draws as you scroll ---------- */
  gsap.fromTo('.timeline__fill', { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
  });
  $$('.timeline__dot').forEach((dot) => {
    gsap.from(dot, {
      scale: 0, duration: 0.6, ease: 'back.out(3)',
      scrollTrigger: { trigger: dot, start: 'top 80%', once: true },
    });
  });

  /* ---------- Marquee speeds up with scroll velocity ---------- */
  const track = $('.marquee__track');
  ScrollTrigger.create({
    trigger: '.marquee',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const boost = Math.min(Math.abs(self.getVelocity()) / 400, 4);
      track.style.animationDuration = `${40 / (1 + boost)}s`;
    },
  });

  /* ---------- Pointer-only effects ---------- */
  if (!finePointer) return;

  // Cursor glow
  const glow = $('.cursor-glow');
  const gx = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3' });
  const gy = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    document.body.classList.add('has-cursor');
    gx(e.clientX); gy(e.clientY);
  }, { passive: true });
  document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));

  // Magnetic buttons
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * 0.25,
        y: (e.clientY - r.top - r.height / 2) * 0.35,
        duration: 0.4, ease: 'power3.out',
      });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    });
  });

  // Tilt + spotlight on skill cards
  $$('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      gsap.to(card, {
        rotateY: (px - 0.5) * 6, rotateX: (0.5 - py) * 6, transformPerspective: 900,
        duration: 0.5, ease: 'power2.out',
      });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
    });
  });

  /* ---------- helpers ---------- */
  // Wraps each word in .w > span so words can slide up from a clipped line.
  // Keeps nested elements (e.g. <span class="accent">) intact.
  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
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
})();
