/* ==========================================================================
   DuoEcom — main.js
   Premium interaction layer: preloader, theme + mobile menu, scroll progress,
   scroll-reveal, image "uncover" reveal, stat count-up, magnetic buttons,
   3D card tilt, gentle hero parallax, and portfolio filtering. Everything
   guards for prefers-reduced-motion and touch input, and uses passive/
   rAF-throttled listeners so it stays cheap on scroll.
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
  /* Portfolio filter buttons (portfolio page)                          */
  /* ------------------------------------------------------------------ */
  function initPortfolioFilter() {
    var buttons = doc.querySelectorAll(".filter-btn");
    var cards = doc.querySelectorAll(".portfolio-card");
    if (!buttons.length || !cards.length) return;

    var applyFilter = function (filter) {
      cards.forEach(function (card) {
        var category = card.getAttribute("data-category");
        var show = category === filter;
        card.style.display = show ? "" : "none";
      });
    };

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        applyFilter(btn.getAttribute("data-filter"));
      });
    });

    // Apply whichever button is marked active on page load,
    // so the grid isn't showing every category before the first click.
    var initialBtn = doc.querySelector(".filter-btn.is-active") || buttons[0];
    if (initialBtn) {
      applyFilter(initialBtn.getAttribute("data-filter"));
    }
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
    initPortfolioFilter();
    initAnchorScroll();
  });
})();