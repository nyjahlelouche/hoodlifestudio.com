/* ══════════════════════════════════════════════════════════════
   HOODLIFE STUDIO — main.js
   Preloader, Clock, Mixed Typography, Wave Scramble,
   Hero reveal, Scroll reveals, Work 2-level hover + CRT,
   Menu GSAP, Custom Cursor
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var CHAR_DELAY = 100;      // ms between each char starting its scramble wave
  var SCRAMBLE_PER = 350;    // ms each char stays scrambled before resolving
  var SCRAMBLE_FLIPS = 3;    // how many random chars each letter cycles through

  // Accessibilité : scramble/scrub/roulette désactivés, reveals en fades courts
  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ── Boot ─────────────────────────────────────────────────── */

  // Always start at the top on load/refresh
  window.scrollTo(0, 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  window.addEventListener('load', function () {
    window.scrollTo(0, 0);
    initClock();

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      fallbackShowAll();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    applyMixedTypography();
    initScramble();
    runPreloader();
  });

  function fallbackShowAll() {
    var preloader = document.querySelector('.preloader');
    if (preloader) preloader.style.display = 'none';
    var srvLoader = document.querySelector('.srv-loader');
    if (srvLoader) srvLoader.style.display = 'none';
    initScrollProgress();
    document.body.classList.remove('overflow-hidden');
    var els = document.querySelectorAll(
      '[data-reveal], [data-reveal-stagger] > *, [data-hero-reveal], ' +
      '.home-hero__sub, .home-hero__scroll, ' +
      '.srv-block__title, .srv-block__desc, ' +
      '.srv-step__num, .srv-step__title, .srv-step__desc'
    );
    // Reset process step clip-paths
    document.querySelectorAll('.srv-step').forEach(function (s) { s.style.clipPath = 'none'; });
    // Reset service block ghost numbers
    document.querySelectorAll('.srv-block__ghost').forEach(function (g) { g.style.opacity = '0.04'; });
    for (var i = 0; i < els.length; i++) {
      els[i].style.opacity = '1';
      els[i].style.transform = 'none';
    }
    applyMixedTypography();
  }


  /* ── Preloader — TV turn-on effect ────────────────────────── */

  function runPreloader() {
    // Services page — CRT TV turn-on loader
    var srvLoader = document.querySelector('.srv-loader');
    if (srvLoader) {
      var srvLine = srvLoader.querySelector('.srv-loader__line');
      var tl = gsap.timeline();
      tl
        // Line appears at center
        .to(srvLine, { opacity: 1, duration: 0.1 }, 0.2)
        // Line extends horizontally
        .to(srvLine, { width: '100%', duration: 0.4, ease: 'power2.out' })
        // Screen opens vertically from the line
        .call(initPageAnimations)
        .to(srvLoader, {
          clipPath: 'inset(0% 0)',
          duration: 0.01,
          onComplete: function () {
            gsap.set(srvLoader, { clipPath: 'inset(50% 0)' });
          }
        })
        .to(srvLoader, {
          clipPath: 'inset(100% 0)',
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: function () {
            srvLoader.style.display = 'none';
            document.body.classList.remove('overflow-hidden');
          }
        });
      initScrollProgress();
      return;
    }

    // Default TV turn-on preloader
    var preloader = document.querySelector('.preloader');
    var line = preloader ? preloader.querySelector('.preloader__line') : null;

    if (!preloader || !line) {
      document.body.classList.remove('overflow-hidden');
      initPageAnimations();
      return;
    }

    // Le clip s'anime sur <main> (nav hors wrapper) : un clip-path sur <body>
    // ferait du body le containing block des position:fixed pendant l'animation
    var clipTarget = document.querySelector('main') || document.body;

    var tl2 = gsap.timeline();

    tl2
      .to({}, { duration: 0.3 })
      .to(line, { opacity: 1, duration: 0.15, ease: 'power1.in' })
      .to({}, { duration: 0.15 })
      .call(function () {
        // Kill preloader, clip main to center line
        preloader.style.display = 'none';
        document.body.classList.remove('overflow-hidden');
        gsap.set(clipTarget, { clipPath: 'inset(50% 0 50% 0)' });
        initPageAnimations();
      })
      .to(clipTarget, {
        clipPath: 'inset(0% 0 0% 0)',
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: function () {
          gsap.set(clipTarget, { clearProps: 'clipPath' });
        }
      });
  }


  /* ── Paris Clock ──────────────────────────────────────────── */

  function initClock() {
    var el = document.getElementById('navClock');
    if (!el) return;
    function tick() {
      el.textContent = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false
      });
    }
    tick();
    // Premier tick aligné sur la prochaine minute pleine, puis toutes les 60s
    setTimeout(function () {
      tick();
      setInterval(tick, 60000);
    }, 60000 - (Date.now() % 60000));
  }


  /* ── Mixed Display Typography ─────────────────────────────── */

  function applyMixedTypography() {
    document.querySelectorAll('[data-display-text]').forEach(function (el) {
      var text = el.textContent.trim();
      if (!text) return;
      el.innerHTML = text.split(/\s+/).map(function (word) {
        if (word.length <= 1) return '<span class="d-word"><span class="d-first">' + word + '</span></span>';
        return '<span class="d-word"><span class="d-first">' + word.charAt(0) +
               '</span><span class="d-rest">' + word.slice(1) + '</span></span>';
      }).join(' ');
    });
  }


  /* ── Wave Scramble — left-to-right, char by char ──────────── */

  function initScramble() {
    if (REDUCED_MOTION) return;

    // Lock menu link widths to prevent layout shift during scramble
    document.querySelectorAll('.menu__link-text').forEach(function (el) {
      var w = el.getBoundingClientRect().width;
      if (w > 0) el.style.width = Math.ceil(w) + 'px';
    });

    var targets = document.querySelectorAll(
      '.nav__cta, .cta, ' +
      '.menu__link, .menu__socials a, .menu__email, ' +
      '.footer__nav a, .footer__socials a, .footer__legal a, ' +
      '.home-work__row-name, .work-list__name, .work-bar__mode'
    );
    targets.forEach(function (el) {
      var busy = false;
      el.addEventListener('mouseenter', function () {
        if (busy) return;
        busy = true;
        scrambleWave(el, function () { busy = false; });
      });
    });
  }

  function scrambleWave(el, callback) {
    // Collect text nodes
    var textNodes = [];
    function walk(node) {
      if (node.nodeType === 3 && node.textContent.trim()) {
        textNodes.push({ node: node, original: node.textContent });
      } else if (node.childNodes) {
        for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
      }
    }
    walk(el);
    if (!textNodes.length) { if (callback) callback(); return; }

    // Count total alphanumeric chars for timing
    var totalAlpha = 0;
    textNodes.forEach(function (t) {
      for (var i = 0; i < t.original.length; i++) {
        if (/[a-zA-Z0-9]/.test(t.original[i])) totalAlpha++;
      }
    });

    var totalDuration = totalAlpha * CHAR_DELAY + SCRAMBLE_PER;
    var startTime = performance.now();

    function animate() {
      var elapsed = performance.now() - startTime;

      if (elapsed >= totalDuration) {
        textNodes.forEach(function (t) { t.node.textContent = t.original; });
        if (callback) callback();
        return;
      }

      var globalIdx = 0;

      textNodes.forEach(function (t) {
        var result = '';
        for (var i = 0; i < t.original.length; i++) {
          var ch = t.original[i];
          if (!/[a-zA-Z0-9]/.test(ch)) {
            result += ch;
          } else {
            var charStart = globalIdx * CHAR_DELAY;
            var charEnd = charStart + SCRAMBLE_PER;

            if (elapsed < charStart || elapsed >= charEnd) {
              result += ch;  // Before wave or already resolved
            } else {
              // Only flip 3-4 times per letter (not every frame)
              var progress = (elapsed - charStart) / SCRAMBLE_PER;
              var flipIndex = Math.floor(progress * SCRAMBLE_FLIPS);
              // Seed from char position + flip index for stable per-flip random
              var seed = (globalIdx * 7 + flipIndex * 13) % SCRAMBLE_CHARS.length;
              result += SCRAMBLE_CHARS[seed];
            }
            globalIdx++;
          }
        }
        t.node.textContent = result;
      });

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }


  /* ── Menu — Burger toggles, GSAP transitions ──────────────── */

  var burger = document.querySelector('.nav__burger');
  var menu = document.querySelector('.menu');
  var menuIsOpen = false;
  var menuTl = null;

  function openMenu() {
    if (!menu) return;
    menuIsOpen = true;
    document.body.style.overflow = 'hidden';
    burger.classList.add('nav__burger--active');
    if (menuTl) menuTl.kill();
    menu.style.visibility = 'visible';
    menu.style.pointerEvents = 'auto';
    var links = menu.querySelectorAll('.menu__link');
    var footer = menu.querySelector('.menu__footer');
    menuTl = gsap.timeline();
    menuTl
      .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'power3.inOut' })
      .fromTo(links, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, '-=0.25')
      .fromTo(footer, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.3');
  }

  function closeMenu() {
    if (!menu) return;
    if (menuTl) menuTl.kill();
    var links = menu.querySelectorAll('.menu__link');
    var footer = menu.querySelector('.menu__footer');
    menuTl = gsap.timeline({
      onComplete: function () {
        menu.style.visibility = 'hidden';
        menu.style.pointerEvents = 'none';
        menuIsOpen = false;
        document.body.style.overflow = '';
        burger.classList.remove('nav__burger--active');
      }
    });
    menuTl
      .to(links, { opacity: 0, y: -15, stagger: 0.04, duration: 0.3, ease: 'power2.in' })
      .to(footer, { opacity: 0, duration: 0.2 }, '-=0.15')
      .to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'power3.inOut' });
  }

  if (burger) {
    burger.addEventListener('click', function () {
      if (menuIsOpen) closeMenu(); else openMenu();
    });
  }
  if (menu) {
    var menuLinks = menu.querySelectorAll('.menu__link');
    for (var i = 0; i < menuLinks.length; i++) {
      menuLinks[i].addEventListener('click', function () { closeMenu(); });
    }

    // A11y : fermeture sur Escape + focus trap basique quand le menu est ouvert
    document.addEventListener('keydown', function (e) {
      if (!menuIsOpen) return;

      if (e.key === 'Escape') {
        closeMenu();
        if (burger) burger.focus();
        return;
      }

      if (e.key === 'Tab') {
        var focusables = Array.prototype.slice.call(menu.querySelectorAll('a[href]'));
        if (burger) focusables.unshift(burger); // le burger reste atteignable pour refermer
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        var current = document.activeElement;

        if (focusables.indexOf(current) === -1) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        } else if (e.shiftKey && current === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }


  /* ── Page Animations ──────────────────────────────────────── */

  function initPageAnimations() {
    initHeroReveal();
    initScrollReveals();
    initServiceBlocksReveal();
    initProcessReveal();
    initWorkHover();
  }


  /* ── Service Blocks — number counter, title mask, desc fade ── */

  function initServiceBlocksReveal() {
    // Separator appears early — at 75% of hero scroll
    var sep = document.querySelector('.srv-sep');
    var hero = document.querySelector('.srv-hero');
    if (sep && hero) {
      gsap.set(sep, { opacity: 0, y: 20 });
      gsap.to(sep, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: hero, start: '75% bottom', once: true }
      });
    }

    var blocks = document.querySelectorAll('.srv-block[data-srv]');
    if (!blocks.length) return;

    blocks.forEach(function (block) {
      var num = block.querySelector('.srv-block__num');
      var title = block.querySelector('.srv-block__title');
      var desc = block.querySelector('.srv-block__desc');
      var ghost = block.querySelector('.srv-block__ghost');
      var target = num ? num.getAttribute('data-target') : '00';

      // Set initial states
      if (title) gsap.set(title, { yPercent: 110 });
      if (desc) gsap.set(desc, { opacity: 0, y: 20 });
      if (ghost) gsap.set(ghost, { opacity: 0 });

      var tl = gsap.timeline({
        scrollTrigger: { trigger: block, start: 'top 75%', once: true }
      });

      // Ghost number fades in
      if (ghost) {
        tl.to(ghost, { opacity: 0.04, duration: 0.6, ease: 'power2.out' }, 0);
      }

      // Number counts from 00 → target
      if (num) {
        var targetNum = parseInt(target, 10);
        var counter = { val: 0 };
        tl.to(counter, {
          val: targetNum,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: function () {
            num.textContent = String(Math.round(counter.val)).padStart(2, '0');
          }
        }, 0);
      }

      // Title reveal from below (mask)
      if (title) {
        tl.to(title, { yPercent: 0, duration: 0.6, ease: 'power3.out' }, 0.15);
      }

      // Description fades in
      if (desc) {
        tl.to(desc, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.35);
      }
    });
  }


  /* ── Scroll Progress Indicator ────────────────────────────── */

  function initScrollProgress() {
    var fill = document.querySelector('.srv-progress__fill');
    var pct = document.querySelector('.srv-progress__pct');
    if (!fill || !pct) return;

    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      fill.style.height = (progress * 100) + '%';
      pct.textContent = Math.round(progress * 100) + '%';
    }, { passive: true });
  }


  /* ── Process Section — scrub-based bidirectional reveal ────── */

  function initProcessReveal() {
    var cols = document.querySelector('.srv-process__cols');
    if (!cols) return;

    var steps = Array.prototype.slice.call(cols.querySelectorAll('.srv-step'));

    // Reduced motion : fade court une fois, pas de scrub lié au scroll
    if (REDUCED_MOTION) {
      gsap.fromTo(steps, { opacity: 0 }, {
        opacity: 1, duration: 0.3, ease: 'power1.out',
        scrollTrigger: { trigger: cols, start: 'top 90%', once: true }
      });
      return;
    }

    // All 5 columns animate together via stagger — no position offsets
    gsap.fromTo(steps,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, ease: 'none', stagger: 0.1,
        scrollTrigger: {
          trigger: cols,
          start: 'top 90%',
          end: 'top 40%',
          scrub: 1
        }
      }
    );
  }


  /* ── Hero — Clip-Path Reveal + Mixed Typography ───────────── */

  function initHeroReveal() {
    var hero = document.querySelector('.home-hero');
    if (!hero) return;

    var tagline = hero.querySelector('[data-hero-reveal]');
    var subtitle = hero.querySelector('.home-hero__sub');
    var scrollInd = hero.querySelector('.home-hero__scroll');

    if (tagline) {
      var rawText = tagline.textContent.trim();
      // Force line break: "The Eye Behind" / "The Culture."
      var lines = rawText.replace(/Behind /i, 'Behind\n').split('\n');
      var html = lines.map(function (line) {
        return line.trim().split(/\s+/).map(function (word) {
          var f = '<span class="d-first">' + word.charAt(0) + '</span>';
          var r = word.length > 1 ? '<span class="d-rest">' + word.slice(1) + '</span>' : '';
          return '<span class="word-wrap"><span class="word">' + f + r + '</span></span>';
        }).join(' ');
      }).join('<br>');
      tagline.innerHTML = html;
      if (REDUCED_MOTION) {
        gsap.fromTo(tagline, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
      } else {
        gsap.fromTo(tagline.querySelectorAll('.word'),
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power3.inOut', stagger: 0.1 }
        );
      }
    }

    if (subtitle) {
      if (REDUCED_MOTION) {
        gsap.fromTo(subtitle, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      } else {
        gsap.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'power2.out' });
      }
    }

    if (scrollInd) {
      gsap.fromTo(scrollInd, { opacity: 0 }, {
        opacity: 1, duration: 0.6, delay: 1.2, ease: 'power2.out',
        onComplete: function () { scrollInd.classList.add('is-visible'); }
      });
    }
  }


  /* ── Scroll Reveals ───────────────────────────────────────── */

  function initScrollReveals() {
    // Reduced motion : fades courts sans déplacement
    var revealDur = REDUCED_MOTION ? 0.3 : 0.9;
    var revealY = REDUCED_MOTION ? 0 : 30;

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: revealY }, {
        opacity: 1, y: 0, duration: revealDur, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    document.querySelectorAll('[data-reveal-stagger]').forEach(function (group) {
      if (group.classList.contains('home-work__track')) {
        // Work rows: initWorkHover handles states, just fade the container in
        gsap.fromTo(group, { opacity: 0 }, {
          opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: group, start: 'top 95%', once: true }
        });
        return;
      } else {
        gsap.fromTo(group.children, { opacity: 0, y: revealY }, {
          opacity: 1, y: 0, duration: revealDur, ease: 'power2.out', stagger: REDUCED_MOTION ? 0 : 0.15,
          scrollTrigger: { trigger: group, start: 'top 88%', once: true }
        });
      }
    });
  }


  /* ── Work — slot-machine roulette (wheel only) + CRT ────── */

  var workRows = [];
  var workTrack = null;
  var workActiveIndex = 0;
  var workCurrentProject = null;
  var workFooterVisible = false;
  var rowHeight = 0;
  var crtTl = null;
  var previewEl = document.querySelector('.home-work__preview');
  var industryEl = document.querySelector('.home-work__preview-industry');
  var servicesEl = document.querySelector('.home-work__preview-services');
  var flashEl = document.querySelector('.home-work__crt-flash');
  var workSection = document.querySelector('.home-work');
  var bgsContainer = document.querySelector('.home-work__bgs');
  var workFooter = document.getElementById('workFooter');

  function initWorkHover() {
    workRows = Array.prototype.slice.call(document.querySelectorAll('.home-work__row'));
    workTrack = document.querySelector('.home-work__track');
    if (!workRows.length || !workTrack) return;

    rowHeight = workRows[0].offsetHeight;

    // Reduced motion : pas de roulette wheel (scroll natif), état statique lisible
    if (REDUCED_MOTION) {
      positionTrack(0, false);
      workRows.forEach(function (row) { gsap.set(row, { opacity: 1, scale: 1 }); });
      showProject(workRows[0], 1);
      if (previewEl) previewEl.classList.add('is-visible');
      if (workFooter) gsap.set(workFooter, { opacity: 1 });
      workFooterVisible = true;
      return;
    }

    // Initial state: first project fully active (BG + preview + rows)
    positionTrack(0, false);
    applyRowStates(0, false);
    showProject(workRows[0], 1);
    if (previewEl) previewEl.classList.add('is-visible');
    if (workFooter) gsap.set(workFooter, { opacity: 0, pointerEvents: 'none' });
    updateWorkFooter();

    // Observer: visual state on enter, cleanup on exit
    if (workSection) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          // Show first project BG as soon as section enters viewport
          if (entry.isIntersecting && !workCurrentProject) {
            showProject(workRows[workActiveIndex], 1);
            if (previewEl) previewEl.classList.add('is-visible');
          }

          // Full cleanup only when section completely exits viewport
          if (!entry.isIntersecting) {
            cleanupWork();
          }
        });
      }, { threshold: [0, 0.5, 1.0] });
      obs.observe(workSection);
    }

    function cleanupWork() {
      // Hide preview
      if (previewEl) previewEl.classList.remove('is-visible');

      // Reset all preview items to off-screen
      document.querySelectorAll('.home-work__preview-item').forEach(function (item) {
        gsap.set(item, { y: '100%' });
      });

      // Hide all BGs
      document.querySelectorAll('.home-work__bg.is-active').forEach(function (bg) {
        bg.classList.remove('is-active');
        var v = bg.querySelector('video'); if (v) v.pause();
      });

      // Clear meta
      if (industryEl) industryEl.textContent = '';
      if (servicesEl) servicesEl.textContent = '';

      workCurrentProject = null;
    }

    // ── WHEEL — the only way to navigate projects
    var wheelDebounce = false;

    // Test géométrique : section pleinement à l'écran (le seuil d'intersectionRatio
    // à 0.98 était fragile — zoom navigateur, arrondis sub-pixel)
    function workSectionFullyVisible() {
      var rect = workSection.getBoundingClientRect();
      return rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    }

    workSection.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) < 3) return;

      // Don't capture if section isn't fully in view
      if (!workSectionFullyVisible()) return;

      // At first project scrolling up → release le scroll natif vers le hero
      // (pas de cleanup ici : il n'a lieu que sur sortie réelle de section, via l'observer)
      if (e.deltaY < 0 && workActiveIndex <= 0) {
        return;
      }

      // At last project scrolling down → do nothing (footer is always visible)
      if (e.deltaY > 0 && workActiveIndex >= workRows.length - 1) return;

      // Block page scroll — we handle the roulette
      e.preventDefault();
      e.stopPropagation();

      if (wheelDebounce) return;
      wheelDebounce = true;
      setTimeout(function () { wheelDebounce = false; }, 400);

      var dir = e.deltaY > 0 ? 1 : -1;
      var next = workActiveIndex + dir;
      next = Math.max(0, Math.min(next, workRows.length - 1));
      goToRow(next, dir);
    }, { passive: false });
  }

  // dir: 1 = scrolling down, -1 = scrolling up
  function goToRow(index, dir) {
    if (index === workActiveIndex && workCurrentProject !== null) return;
    workActiveIndex = index;
    positionTrack(index, true);
    applyRowStates(index, true);
    showProject(workRows[index], dir || 1);
    updateWorkFooter();
  }

  // Footer du Selected Work : fade-in sur le dernier projet, fade-out sinon
  function updateWorkFooter() {
    if (!workFooter || !workRows.length) return;
    var show = workActiveIndex === workRows.length - 1;
    if (show === workFooterVisible) return;
    workFooterVisible = show;
    gsap.to(workFooter, {
      opacity: show ? 1 : 0,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
      onStart: function () { if (show) workFooter.style.pointerEvents = ''; },
      onComplete: function () { if (!show) workFooter.style.pointerEvents = 'none'; }
    });
  }

  function positionTrack(index, animate) {
    if (!workTrack || !workRows[0]) return;
    // Recalc row height
    rowHeight = workRows[0].offsetHeight;
    // Get the container height to center the active row
    var container = workTrack.parentElement;
    var containerH = container ? container.offsetHeight : 0;
    // Offset: move track up so the active row is centered in the container
    var offset = -(index * rowHeight) + (containerH / 2) - (rowHeight / 2);
    gsap.to(workTrack, {
      y: offset,
      duration: animate ? 0.5 : 0,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  function applyRowStates(activeIdx, animate) {
    var dur = animate ? 0.45 : 0;
    workRows.forEach(function (row, i) {
      var dist = Math.abs(i - activeIdx);
      var op, sc;

      if (dist === 0) {
        op = 1; sc = 1;          // Active — full
      } else if (dist === 1) {
        op = 0.3; sc = 0.75;     // Adjacent — dimmed, smaller
      } else {
        op = 0; sc = 0.6;        // All others — invisible
      }

      gsap.to(row, {
        opacity: op,
        scale: sc,
        duration: dur,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  }

  // dir: 1 = down (new enters from bottom), -1 = up (new enters from top)
  function showProject(row, dir) {
    if (!row) return;
    var id = row.getAttribute('data-hover-project');
    if (id === workCurrentProject) return;
    var d = dir || 1;

    // ── Level 1: BG crossfade
    document.querySelectorAll('.home-work__bg').forEach(function (bg) {
      bg.classList.remove('is-active');
      var v = bg.querySelector('video'); if (v) v.pause();
    });
    var activeBg = document.querySelector('.home-work__bg[data-bg="' + id + '"]');
    if (activeBg) {
      activeBg.classList.add('is-active');
      var bgV = activeBg.querySelector('video');
      if (bgV) bgV.play().catch(function () {});
    }

    // ── Meta
    if (industryEl) industryEl.textContent = row.getAttribute('data-industry') || '';
    if (servicesEl) servicesEl.textContent = row.getAttribute('data-services') || '';
    if (previewEl) previewEl.classList.add('is-visible');

    // ── Level 2: Vertical slide transition
    // Kill ALL running tweens on every preview item first
    var allItems = document.querySelectorAll('.home-work__preview-item');
    allItems.forEach(function (item) {
      gsap.killTweensOf(item);
    });
    if (crtTl) { crtTl.kill(); crtTl = null; }

    // Reset every item off-screen except the one we're transitioning
    var prev = workCurrentProject
      ? document.querySelector('.home-work__preview-item[data-preview="' + workCurrentProject + '"]')
      : null;
    var next = document.querySelector('.home-work__preview-item[data-preview="' + id + '"]');

    // Hide all items that aren't prev or next
    allItems.forEach(function (item) {
      if (item !== prev && item !== next) {
        gsap.set(item, { y: '100%' });
      }
    });

    crtTl = gsap.timeline();

    // Previous slides out
    if (prev) {
      crtTl.to(prev, {
        y: d > 0 ? '-100%' : '100%',
        duration: 0.5,
        ease: 'power2.inOut'
      });
    }

    // New slides in
    if (next) {
      gsap.set(next, { y: d > 0 ? '100%' : '-100%' });
      crtTl.to(next, {
        y: '0%',
        duration: 0.5,
        ease: 'power2.inOut'
      }, prev ? '<' : '+=0');
    }

    workCurrentProject = id;
  }


  /* ── Custom Cursor ────────────────────────────────────────── */

  var cursor = document.querySelector('.cursor');
  var cursorLabel = document.querySelector('.cursor__label');

  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    var mouseX = -100, mouseY = -100, cursorX = -100, cursorY = -100;
    var hasMoved = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        cursorX = mouseX;
        cursorY = mouseY;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        hasMoved = true;
      }
    });

    function updateCursor() {
      if (hasMoved) {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
      }
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Délégation document (mouseover/mouseout) : couvre aussi les éléments
    // générés dynamiquement (slides Swiper), contrairement aux listeners par élément
    function cursorTargetFrom(el) {
      return el && el.closest ? el.closest('a, button, [data-cursor]') : null;
    }

    document.addEventListener('mouseover', function (e) {
      var target = cursorTargetFrom(e.target);
      if (!target || target === cursorTargetFrom(e.relatedTarget)) return;
      cursor.classList.add('cursor--hover');
      var label = target.getAttribute('data-cursor') || '';
      if (cursorLabel && label) cursorLabel.textContent = label;
    });

    document.addEventListener('mouseout', function (e) {
      var target = cursorTargetFrom(e.target);
      if (!target || target === cursorTargetFrom(e.relatedTarget)) return;
      cursor.classList.remove('cursor--hover');
      if (cursorLabel) cursorLabel.textContent = '';
    });

    document.addEventListener('mouseleave', function () { cursor.classList.add('cursor--hidden'); });
    document.addEventListener('mouseenter', function () { cursor.classList.remove('cursor--hidden'); });
  } else if (cursor) {
    cursor.remove();
    document.body.style.cursor = 'auto';
  }


  /* ── Smooth Scroll ────────────────────────────────────────── */

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var h = this.getAttribute('href');
      if (h === '#') return;
      var t = document.querySelector(h);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' }); }
    });
  });

})();
