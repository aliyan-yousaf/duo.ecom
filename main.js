/* ==========================================================================
   DuoEcom — main.js
   Premium interaction layer: preloader, theme + mobile menu, scroll progress,
   scroll-reveal, image "uncover" reveal, stat count-up, magnetic buttons,
   3D card tilt, gentle hero parallax, portfolio filtering, plus the new
   premium functional sections — infinite tech marquee, numbered interactive
   services tabs, and a shared draggable/swipeable carousel (used for both
   the portfolio preview and testimonials). Everything guards for
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
      ".card:not(.portfolio-card):not(.testimonial-card), .tech-card"
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

  /* ------------------------------------------------------------------ */
  /* Tech marquee — infinite auto-scroll strip. The HTML already ships  */
  /* two identical tracks back to back so the CSS keyframe loop is      */
  /* seamless; JS just pauses the animation while a finger is dragging  */
  /* on touch devices, mirroring the hover-to-pause behaviour on desktop*/
  /* ------------------------------------------------------------------ */
  function initTechMarquee() {
    var marquee = doc.querySelector("[data-marquee]");
    if (!marquee) return;

    if (!isTouch) return; // hover-to-pause via CSS already covers desktop

    var startX = null;
    marquee.addEventListener(
      "touchstart",
      function (e) {
        startX = e.touches[0].clientX;
        marquee.classList.add("is-paused");
      },
      { passive: true }
    );
    marquee.addEventListener(
      "touchend",
      function () {
        marquee.classList.remove("is-paused");
        startX = null;
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------ */
  /* Services — numbered interactive tab panel (w3lead-style).          */
  /* Clicking (or hovering, on desktop) a numbered row swaps the panel  */
  /* on the right. Each active row also auto-advances after a few       */
  /* seconds via a thin progress bar, similar to the reference site.    */
  /* ------------------------------------------------------------------ */
  function initServiceTabs() {
    var wrap = doc.querySelector("[data-service-tabs]");
    if (!wrap) return;

    var navItems = Array.prototype.slice.call(
      wrap.querySelectorAll(".service-nav-item")
    );
    var panels = Array.prototype.slice.call(
      wrap.querySelectorAll(".service-panel")
    );
    if (!navItems.length || !panels.length) return;

    var activeIndex = 0;
    var AUTOPLAY_MS = 6000;
    var timer = null;
    var paused = false;

    var setActive = function (index) {
      activeIndex = index;
      navItems.forEach(function (item, i) {
        item.classList.toggle("is-active", i === index);
      });
      panels.forEach(function (panel, i) {
        panel.classList.toggle("is-active", i === index);
      });
    };

    var next = function () {
      setActive((activeIndex + 1) % navItems.length);
    };

    var restartAutoplay = function () {
      if (timer) clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(function () {
        if (!paused) next();
      }, AUTOPLAY_MS);
    };

    navItems.forEach(function (item, i) {
      item.addEventListener("click", function () {
        setActive(i);
        restartAutoplay();
      });
    });

    wrap.addEventListener("mouseenter", function () {
      paused = true;
    });
    wrap.addEventListener("mouseleave", function () {
      paused = false;
    });

    setActive(0);
    restartAutoplay();
  }

  /* ------------------------------------------------------------------ */
  /* Shared carousel — powers both the portfolio preview and the        */
  /* testimonials grid. Supports arrow buttons, dot pagination,         */
  /* pointer drag / touch swipe, keyboard arrows, and (for testimonials)*/
  /* gentle autoplay that pauses on hover/focus/drag.                   */
  /* ------------------------------------------------------------------ */
  function initCarousels() {
    var carousels = doc.querySelectorAll("[data-carousel]");
    if (!carousels.length) return;

    carousels.forEach(function (root) {
      var viewport = root.querySelector("[data-carousel-viewport]");
      var track = root.querySelector("[data-carousel-track]");
      var slides = Array.prototype.slice.call(
        track ? track.children : []
      );
      var prevBtn = root.querySelector("[data-carousel-prev]");
      var nextBtn = root.querySelector("[data-carousel-next]");
      var dotsWrap = root.querySelector("[data-carousel-dots]");
      if (!viewport || !track || !slides.length) return;

      var perView = 1;
      var index = 0;
      var autoplayTimer = null;
      var isTestimonial = root.classList.contains("testimonial-carousel");
      var AUTOPLAY_MS = 5000;

      var getPerView = function () {
        var w = window.innerWidth;
        if (w >= 1040) return Math.min(3, slides.length);
        if (w >= 700) return Math.min(2, slides.length);
        return 1;
      };

      var maxIndex = function () {
        return Math.max(0, slides.length - perView);
      };

      var buildDots = function () {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = "";
        var count = maxIndex() + 1;
        for (var i = 0; i < count; i++) {
          var dot = doc.createElement("button");
          dot.type = "button";
          dot.className = "carousel-dot";
          dot.setAttribute("aria-label", "Go to slide " + (i + 1));
          (function (idx) {
            dot.addEventListener("click", function () {
              goTo(idx);
              restartAutoplay();
            });
          })(i);
          dotsWrap.appendChild(dot);
        }
      };

      var updateDots = function () {
        if (!dotsWrap) return;
        Array.prototype.forEach.call(
          dotsWrap.children,
          function (dot, i) {
            dot.classList.toggle("is-active", i === index);
          }
        );
      };

      var updateArrows = function () {
        if (prevBtn) prevBtn.disabled = index <= 0 && maxIndex() === 0 ? false : index <= 0;
        if (nextBtn) nextBtn.disabled = index >= maxIndex();
        if (maxIndex() === 0) {
          if (prevBtn) prevBtn.disabled = true;
          if (nextBtn) nextBtn.disabled = true;
        }
      };

      var render = function () {
        var slideWidth = slides[0].getBoundingClientRect().width;
        var gap = parseFloat(getComputedStyle(track).gap) || 0;
        var offset = index * (slideWidth + gap);
        track.style.transform = "translateX(-" + offset + "px)";
        updateDots();
        updateArrows();
      };

      var goTo = function (i) {
        index = Math.max(0, Math.min(i, maxIndex()));
        render();
      };

      var next = function () {
        goTo(index >= maxIndex() ? 0 : index + 1);
      };
      var prev = function () {
        goTo(index <= 0 ? maxIndex() : index - 1);
      };

      var restartAutoplay = function () {
        if (autoplayTimer) clearInterval(autoplayTimer);
        if (!isTestimonial || reduceMotion) return;
        autoplayTimer = setInterval(next, AUTOPLAY_MS);
      };

      if (nextBtn)
        nextBtn.addEventListener("click", function () {
          next();
          restartAutoplay();
        });
      if (prevBtn)
        prevBtn.addEventListener("click", function () {
          prev();
          restartAutoplay();
        });

      root.addEventListener("mouseenter", function () {
        if (autoplayTimer) clearInterval(autoplayTimer);
      });
      root.addEventListener("mouseleave", restartAutoplay);

      /* Pointer / touch drag */
      var dragStartX = 0;
      var dragging = false;
      var startOffset = 0;

      var pointerDown = function (e) {
        dragging = true;
        dragStartX = (e.touches ? e.touches[0].clientX : e.clientX);
        var slideWidth = slides[0].getBoundingClientRect().width;
        var gap = parseFloat(getComputedStyle(track).gap) || 0;
        startOffset = index * (slideWidth + gap);
        track.classList.add("is-dragging");
        if (autoplayTimer) clearInterval(autoplayTimer);
      };

      var pointerMove = function (e) {
        if (!dragging) return;
        var x = (e.touches ? e.touches[0].clientX : e.clientX);
        var delta = x - dragStartX;
        track.style.transform = "translateX(" + (-startOffset + delta) + "px)";
      };

      var pointerUp = function (e) {
        if (!dragging) return;
        dragging = false;
        track.classList.remove("is-dragging");
        var x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
        var delta = x - dragStartX;
        var threshold = 50;
        if (delta < -threshold) next();
        else if (delta > threshold) prev();
        else render();
        restartAutoplay();
      };

      track.addEventListener("mousedown", pointerDown);
      window.addEventListener("mousemove", pointerMove);
      window.addEventListener("mouseup", pointerUp);
      track.addEventListener("touchstart", pointerDown, { passive: true });
      track.addEventListener("touchmove", pointerMove, { passive: true });
      track.addEventListener("touchend", pointerUp);

      /* Keyboard */
      root.setAttribute("tabindex", "0");
      root.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") {
          next();
          restartAutoplay();
        } else if (e.key === "ArrowLeft") {
          prev();
          restartAutoplay();
        }
      });

      var handleResize = function () {
        perView = getPerView();
        index = Math.min(index, maxIndex());
        buildDots();
        render();
      };

      window.addEventListener("resize", handleResize);

      perView = getPerView();
      buildDots();
      render();
      restartAutoplay();
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
    initTechMarquee();
    initServiceTabs();
    initCarousels();
  });
})();