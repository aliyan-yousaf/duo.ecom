// // ==========================================================================
// // DuoEcom — shared site behavior
// // ==========================================================================

// document.addEventListener('DOMContentLoaded', () => {

//   /* ---- Preloader ---- */
//   const preloader = document.getElementById('preloader');
//   if (preloader) {
//     const hidePreloader = () => {
//       if (preloader.classList.contains('is-hidden')) return;
//       preloader.classList.add('is-hidden');
//       setTimeout(() => preloader.remove(), 600);
//     };
//     if (document.readyState === 'complete') {
//       hidePreloader();
//     } else {
//       window.addEventListener('load', hidePreloader);
//     }
//     // Safety fallback in case some asset never fires load
//     setTimeout(hidePreloader, 3500);
//   }

//   /* ---- Theme toggle (dark / light) ---- */
//   const root = document.documentElement;
//   const toggles = document.querySelectorAll('.theme-toggle, .theme-toggle-mobile');

//   const applyTheme = (theme) => {
//     if (theme === 'dark') {
//       root.setAttribute('data-theme', 'dark');
//     } else {
//       root.removeAttribute('data-theme');
//     }
//     toggles.forEach(t => t.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false'));
//   };

//   let savedTheme = 'light';
//   try {
//     savedTheme = localStorage.getItem('duoecom-theme') || 'light';
//   } catch (e) { /* localStorage unavailable, default to light */ }
//   applyTheme(savedTheme);

//   toggles.forEach(toggle => {
//     toggle.addEventListener('click', () => {
//       const isDark = root.getAttribute('data-theme') === 'dark';
//       const next = isDark ? 'light' : 'dark';
//       applyTheme(next);
//       try { localStorage.setItem('duoecom-theme', next); } catch (e) { /* ignore */ }
//     });
//   });

//   /* ---- Mobile toggle label + icon sync with theme ---- */
//   const mobileToggleBtn = document.querySelector('.theme-toggle-mobile');
//   if (mobileToggleBtn) {
//     const sunIcon = mobileToggleBtn.querySelector('.icon-sun');
//     const moonIcon = mobileToggleBtn.querySelector('.icon-moon');
//     const label = mobileToggleBtn.querySelector('span');
//     const syncMobileToggle = () => {
//       const isDark = root.getAttribute('data-theme') === 'dark';
//       if (sunIcon) sunIcon.style.display = isDark ? 'none' : 'block';
//       if (moonIcon) moonIcon.style.display = isDark ? 'block' : 'none';
//       if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
//     };
//     syncMobileToggle();
//     mobileToggleBtn.addEventListener('click', syncMobileToggle);
//   }

//   /* ---- Scroll progress bar (top of page, premium touch) ---- */
//   const progressBar = document.createElement('div');
//   progressBar.className = 'scroll-progress';
//   document.body.appendChild(progressBar);
//   const updateProgress = () => {
//     const h = document.documentElement;
//     const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
//     progressBar.style.width = (scrolled || 0) + '%';
//   };
//   window.addEventListener('scroll', updateProgress, { passive: true });
//   updateProgress();

//   /* ---- Mobile nav toggle ---- */
//   const toggle = document.querySelector('.nav-toggle');
//   const mobileMenu = document.querySelector('.mobile-menu');

//   if (toggle && mobileMenu) {
//     toggle.addEventListener('click', () => {
//       const isOpen = toggle.classList.toggle('open');
//       mobileMenu.classList.toggle('open', isOpen);
//       document.body.style.overflow = isOpen ? 'hidden' : '';
//       toggle.setAttribute('aria-expanded', String(isOpen));
//     });

//     mobileMenu.querySelectorAll('a').forEach(link => {
//       link.addEventListener('click', () => {
//         toggle.classList.remove('open');
//         mobileMenu.classList.remove('open');
//         document.body.style.overflow = '';
//       });
//     });
//   }

//   /* ---- Header shadow on scroll ---- */
//   const header = document.querySelector('.site-header');
//   if (header) {
//     const onScroll = () => {
//       header.style.boxShadow = window.scrollY > 8 ? '0 1px 0 rgba(0,0,0,.04)' : 'none';
//     };
//     window.addEventListener('scroll', onScroll, { passive: true });
//     onScroll();
//   }

//   /* ---- Scroll reveal — IntersectionObserver is the single source of truth.
//      This is fast, has zero network dependency, and fires consistently
//      regardless of whether the GSAP CDN script has finished loading yet.
//      (Previously GSAP ScrollTrigger duplicated this logic, which caused
//      elements to sometimes appear, then jump/refade once GSAP arrived.) ---- */
//   const revealEls = document.querySelectorAll('.reveal');

//   if ('IntersectionObserver' in window && revealEls.length) {
//     const io = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add('in-view');
//           io.unobserve(entry.target);
//         }
//       });
//     }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

//     revealEls.forEach((el, i) => {
//       el.style.setProperty('--i', i % 6);
//       io.observe(el);
//     });
//   } else {
//     revealEls.forEach(el => el.classList.add('in-view'));
//   }

//   /* (Hero entrance now handled purely by CSS — see .hero-animate in style.css.
//      This avoids the flash-then-refade delay that happened when GSAP set
//      opacity:0 on already-visible content after the CDN script finished loading.) */

//   /* ---- Magnetic buttons (premium hover) — enhance once GSAP is ready.
//      Wrapped so it works whether GSAP finished loading before or after
//      this script runs; never blocks or delays anything else on the page. ---- */
//   const setupMagneticButtons = () => {
//     if (typeof window.gsap === 'undefined') return;
//     if (!window.matchMedia('(hover: hover)').matches) return;
//     document.querySelectorAll('.btn-accent, .btn-primary').forEach(btn => {
//       if (btn.dataset.magnetic) return;
//       btn.dataset.magnetic = 'true';
//       btn.addEventListener('mousemove', (e) => {
//         const rect = btn.getBoundingClientRect();
//         const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
//         const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
//         gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' });
//       });
//       btn.addEventListener('mouseleave', () => {
//         gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
//       });
//     });
//   };
//   setupMagneticButtons();
//   window.addEventListener('load', setupMagneticButtons);

//   /* ---- Smooth anchor scrolling ---- */
//   document.querySelectorAll('a[href^="#"]').forEach(a => {
//     a.addEventListener('click', (e) => {
//       const id = a.getAttribute('href');
//       if (id.length > 1) {
//         const target = document.querySelector(id);
//         if (target) {
//           e.preventDefault();
//           target.scrollIntoView({ behavior: 'smooth', block: 'start' });
//         }
//       }
//     });
//   });

//   /* ---- Skill bars (about page) ---- */
//   const skillBars = document.querySelectorAll('.skill-bar-fill');
//   if ('IntersectionObserver' in window && skillBars.length) {
//     const sio = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add('in-view');
//           sio.unobserve(entry.target);
//         }
//       });
//     }, { threshold: 0.4 });
//     skillBars.forEach(el => sio.observe(el));
//   } else {
//     skillBars.forEach(el => el.classList.add('in-view'));
//   }

//   /* ---- Hero stats: count-up animation once they scroll into view ---- */
//   const heroStats = document.querySelectorAll('.hero-stat .num');
//   if (heroStats.length) {
//     const animateCount = (el) => {
//       const raw = el.dataset.value || el.textContent;
//       const match = raw.match(/^([\d.]+)(.*)$/);
//       if (!match) { el.textContent = raw; return; }
//       const end = parseFloat(match[1]);
//       const suffix = match[2] || '';
//       const isDecimal = match[1].includes('.');
//       const duration = 1100;
//       const start = performance.now();

//       const step = (now) => {
//         const progress = Math.min((now - start) / duration, 1);
//         const eased = 1 - Math.pow(1 - progress, 3);
//         const current = end * eased;
//         el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
//         if (progress < 1) requestAnimationFrame(step);
//       };
//       requestAnimationFrame(step);
//     };

//     heroStats.forEach(el => { el.dataset.value = el.textContent.trim(); });

//     const statEls = document.querySelectorAll('.hero-stat');
//     if ('IntersectionObserver' in window) {
//       const statIo = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//           if (entry.isIntersecting) {
//             entry.target.classList.add('in-view');
//             animateCount(entry.target.querySelector('.num'));
//             statIo.unobserve(entry.target);
//           }
//         });
//       }, { threshold: 0.4 });
//       statEls.forEach(el => statIo.observe(el));
//     } else {
//       statEls.forEach(el => {
//         el.classList.add('in-view');
//         animateCount(el.querySelector('.num'));
//       });
//     }
//   }

//   /* ---- FAQ accordion ---- */
//   document.querySelectorAll('.faq-item').forEach(item => {
//     const btn = item.querySelector('.faq-q');
//     if (!btn) return;
//     btn.addEventListener('click', () => {
//       const wasOpen = item.classList.contains('open');
//       item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
//       if (!wasOpen) item.classList.add('open');
//     });
//   });

//   /* ---- Portfolio filter (portfolio page) ---- */
//   const filterBtns = document.querySelectorAll('.filter-btn');
//   const portfolioItems = document.querySelectorAll('[data-category]');
//   if (filterBtns.length && portfolioItems.length) {
//     filterBtns.forEach(btn => {
//       btn.addEventListener('click', () => {
//         filterBtns.forEach(b => b.classList.remove('is-active'));
//         btn.classList.add('is-active');
//         const filter = btn.dataset.filter;
//         portfolioItems.forEach(item => {
//           const match = filter === 'all' || item.dataset.category === filter;
//           item.style.display = match ? '' : 'none';
//         });
//       });
//     });
//   }

//   /* ---- Contact form (front-end only, no backend) ---- */
//   const form = document.querySelector('.contact-form');
//   if (form) {
//     form.addEventListener('submit', (e) => {
//       e.preventDefault();
//       const btn = form.querySelector('button[type="submit"]');
//       const note = form.querySelector('.form-status');
//       const original = btn.textContent;
//       btn.textContent = 'Sending...';
//       btn.disabled = true;
//       setTimeout(() => {
//         btn.textContent = 'Message sent ✓';
//         if (note) {
//           note.textContent = "Thanks — we'll reply within one business day.";
//           note.style.color = 'var(--success)';
//         }
//         form.reset();
//         setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2600);
//       }, 900);
//     });
//   }

//   /* ---- Set active nav link based on current page ---- */
//   const path = window.location.pathname.split('/').pop() || 'index.html';
//   document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
//     const href = a.getAttribute('href');
//     if (href === path) a.classList.add('active');
//   });

// });

/* ==========================================================================
   DuoEcom — main.js
   Premium interaction layer: preloader, theme + mobile menu, scroll progress,
   scroll-reveal, image "uncover" reveal, stat count-up, magnetic buttons,
   3D card tilt, and a gentle hero parallax. Everything guards for
   prefers-reduced-motion and touch input, and uses passive/rAF-throttled
   listeners so it stays cheap on scroll.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  var onReady = function (fn) {
    if (doc.readyState === "loading") {
      doc.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  /* ------------------------------------------------------------------ */
  /* Preloader                                                          */
  /* ------------------------------------------------------------------ */
  function initPreloader() {
    var preloader = doc.getElementById("preloader");
    if (!preloader) return;
    var hide = function () {
      preloader.classList.add("is-hidden");
    };
    // Hide as soon as everything (fonts/images) is ready, with a tiny
    // minimum so the entrance doesn't flash on fast connections.
    var minTimer = setTimeout(hide, 450);
    window.addEventListener(
      "load",
      function () {
        clearTimeout(minTimer);
        setTimeout(hide, 150);
      },
      { once: true }
    );
  }

  /* ------------------------------------------------------------------ */
  /* Theme toggle (persisted in localStorage, syncs header + mobile)    */
  /* ------------------------------------------------------------------ */
  function initTheme() {
    var STORAGE_KEY = "duoecom-theme";
    var toggles = doc.querySelectorAll(".theme-toggle, .theme-toggle-mobile");
    if (!toggles.length) return;

    var isDark = function () {
      return root.getAttribute("data-theme") === "dark";
    };

    var setPressed = function () {
      var dark = isDark();
      toggles.forEach(function (btn) {
        btn.setAttribute("aria-pressed", dark ? "true" : "false");
      });
    };
    setPressed();

    var apply = function (dark) {
      if (dark) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
      try {
        localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
      } catch (e) {
        /* storage unavailable — theme just won't persist */
      }
      setPressed();
    };

    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(!isDark());
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Mobile menu                                                        */
  /* ------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = doc.querySelector(".nav-toggle");
    var menu = doc.querySelector(".mobile-menu");
    if (!toggle || !menu) return;

    var open = false;

    var setOpen = function (next) {
      open = next;
      toggle.classList.toggle("open", open);
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      doc.body.style.overflow = open ? "hidden" : "";
    };

    toggle.addEventListener("click", function () {
      setOpen(!open);
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Sticky header — glass state after a small scroll                   */
  /* ------------------------------------------------------------------ */
  function initHeaderScrollState() {
    var header = doc.querySelector(".site-header");
    if (!header) return;
    var ticking = false;

    var update = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ------------------------------------------------------------------ */
  /* Scroll progress bar                                                */
  /* ------------------------------------------------------------------ */
  function initScrollProgress() {
    var bar = doc.querySelector(".scroll-progress");
    if (!bar) return;
    var ticking = false;

    var update = function () {
      var scrollTop = window.scrollY;
      var docHeight = doc.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal — .reveal, .reveal-img, .hero-stat, .skill-bar-fill  */
  /* ------------------------------------------------------------------ */
  function initScrollReveal() {
    var targets = doc.querySelectorAll(
      ".reveal, .reveal-img, .hero-stat, .skill-bar-fill"
    );
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("in-view");
      });
      runStatCounters(doc.querySelectorAll(".hero-stat"));
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          if (entry.target.classList.contains("hero-stat")) {
            runStatCounters([entry.target]);
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero stat count-up — parses "60+", "4.9/5", "100%" etc. and         */
  /* animates the numeric part while keeping the original suffix.       */
  /* ------------------------------------------------------------------ */
  function runStatCounters(nodes) {
    nodes.forEach(function (stat) {
      var numEl = stat.querySelector(".num");
      if (!numEl || numEl.dataset.counted) return;
      numEl.dataset.counted = "true";

      var raw = numEl.textContent.trim();
      var match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
      if (!match) return;

      var target = parseFloat(match[1]);
      var suffix = match[2];
      var decimals = (match[1].split(".")[1] || "").length;
      var duration = 1100;
      var start = null;

      var step = function (ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
        var value = target * eased;
        numEl.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          numEl.textContent = raw;
        }
      };

      requestAnimationFrame(step);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Magnetic buttons                                                   */
  /* ------------------------------------------------------------------ */
  function initMagneticButtons() {
    if (reduceMotion || isTouch) return;
    var buttons = doc.querySelectorAll(".btn-accent, .btn-ghost, .btn-primary");
    var strength = 0.28;
    var maxPull = 10;

    buttons.forEach(function (btn) {
      var raf = null;

      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - (rect.left + rect.width / 2);
        var relY = e.clientY - (rect.top + rect.height / 2);
        var mx = Math.max(-maxPull, Math.min(maxPull, relX * strength));
        var my = Math.max(-maxPull, Math.min(maxPull, relY * strength));

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          btn.style.setProperty("--mx", mx.toFixed(1) + "px");
          btn.style.setProperty("--my", my.toFixed(1) + "px");
        });
      });

      btn.addEventListener("mouseleave", function () {
        if (raf) cancelAnimationFrame(raf);
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3D card tilt                                                       */
  /* ------------------------------------------------------------------ */
  function initCardTilt() {
    if (reduceMotion || isTouch) return;
    var cards = doc.querySelectorAll(
      ".card:not(.portfolio-card), .tech-card"
    );
    var maxTilt = 6;

    cards.forEach(function (card) {
      card.setAttribute("data-tilt", "");
      var raf = null;

      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width; /* 0..1 */
        var py = (e.clientY - rect.top) / rect.height;
        var ry = (px - 0.5) * (maxTilt * 2);
        var rx = (0.5 - py) * (maxTilt * 2);

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.setProperty("--rx", rx.toFixed(2) + "deg");
          card.style.setProperty("--ry", ry.toFixed(2) + "deg");
        });
      });

      card.addEventListener("mouseleave", function () {
        if (raf) cancelAnimationFrame(raf);
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero network — gentle scroll parallax                              */
  /* ------------------------------------------------------------------ */
  function initHeroParallax() {
    if (reduceMotion) return;
    var net = doc.querySelector(".hero-network");
    if (!net) return;
    var ticking = false;

    var update = function () {
      var offset = Math.min(window.scrollY * 0.08, 40);
      net.style.transform = "translateY(" + offset.toFixed(1) + "px)";
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------ */
  /* FAQ accordion (present on other pages of the site; safe no-op here) */
  /* ------------------------------------------------------------------ */
  function initFaq() {
    var items = doc.querySelectorAll(".faq-item");
    if (!items.length) return;

    items.forEach(function (item) {
      var q = item.querySelector(".faq-q");
      if (!q) return;
      q.addEventListener("click", function () {
        var wasOpen = item.classList.contains("open");
        items.forEach(function (other) {
          other.classList.remove("open");
        });
        if (!wasOpen) item.classList.add("open");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Smooth in-page anchor scrolling (nav mostly links between pages,    */
  /* but this covers any #anchor links safely without a heavy library). */
  /* ------------------------------------------------------------------ */
  function initAnchorScroll() {
    doc.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = doc.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    });
  }

  onReady(function () {
    initPreloader();
    initTheme();
    initMobileMenu();
    initHeaderScrollState();
    initScrollProgress();
    initScrollReveal();
    initMagneticButtons();
    initCardTilt();
    initHeroParallax();
    initFaq();
    initAnchorScroll();
  });
})();