// ==========================================================================
// DuoEcom — shared site behavior
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Theme toggle (dark / light) ---- */
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.theme-toggle, .theme-toggle-mobile');

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    toggles.forEach(t => t.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false'));
  };

  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem('duoecom-theme') || 'light';
  } catch (e) { /* localStorage unavailable, default to light */ }
  applyTheme(savedTheme);

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('duoecom-theme', next); } catch (e) { /* ignore */ }
    });
  });

  /* ---- Mobile toggle label + icon sync with theme ---- */
  const mobileToggleBtn = document.querySelector('.theme-toggle-mobile');
  if (mobileToggleBtn) {
    const sunIcon = mobileToggleBtn.querySelector('.icon-sun');
    const moonIcon = mobileToggleBtn.querySelector('.icon-moon');
    const label = mobileToggleBtn.querySelector('span');
    const syncMobileToggle = () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      if (sunIcon) sunIcon.style.display = isDark ? 'none' : 'block';
      if (moonIcon) moonIcon.style.display = isDark ? 'block' : 'none';
      if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
    };
    syncMobileToggle();
    mobileToggleBtn.addEventListener('click', syncMobileToggle);
  }

  /* ---- Scroll progress bar (top of page, premium touch) ---- */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = (scrolled || 0) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Header shadow on scroll ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 8 ? '0 1px 0 rgba(0,0,0,.04)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Scroll reveal — IntersectionObserver is the single source of truth.
     This is fast, has zero network dependency, and fires consistently
     regardless of whether the GSAP CDN script has finished loading yet.
     (Previously GSAP ScrollTrigger duplicated this logic, which caused
     elements to sometimes appear, then jump/refade once GSAP arrived.) ---- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el, i) => {
      el.style.setProperty('--i', i % 6);
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* (Hero entrance now handled purely by CSS — see .hero-animate in style.css.
     This avoids the flash-then-refade delay that happened when GSAP set
     opacity:0 on already-visible content after the CDN script finished loading.) */

  /* ---- Magnetic buttons (premium hover) — enhance once GSAP is ready.
     Wrapped so it works whether GSAP finished loading before or after
     this script runs; never blocks or delays anything else on the page. ---- */
  const setupMagneticButtons = () => {
    if (typeof window.gsap === 'undefined') return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.btn-accent, .btn-primary').forEach(btn => {
      if (btn.dataset.magnetic) return;
      btn.dataset.magnetic = 'true';
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
        gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
      });
    });
  };
  setupMagneticButtons();
  window.addEventListener('load', setupMagneticButtons);

  /* ---- Smooth anchor scrolling ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---- Skill bars (about page) ---- */
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  if ('IntersectionObserver' in window && skillBars.length) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          sio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    skillBars.forEach(el => sio.observe(el));
  } else {
    skillBars.forEach(el => el.classList.add('in-view'));
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---- Portfolio filter (portfolio page) ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('[data-category]');
  if (filterBtns.length && portfolioItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        portfolioItems.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ---- Contact form (front-end only, no backend) ---- */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const note = form.querySelector('.form-status');
      const original = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Message sent ✓';
        if (note) {
          note.textContent = "Thanks — we'll reply within one business day.";
          note.style.color = 'var(--success)';
        }
        form.reset();
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2600);
      }, 900);
    });
  }

  /* ---- Set active nav link based on current page ---- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

});