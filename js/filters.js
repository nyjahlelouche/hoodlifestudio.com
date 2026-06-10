/* ══════════════════════════════════════════════════════════════
   HOODLIFE STUDIO — filters.js
   Work page: Swiper slider, List hover, Filters, Toggle
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var sliderSection = document.querySelector('.work-slider');
  var listSection = document.querySelector('.work-list');
  if (!sliderSection || !listSection) return;


  /* ═══════════════════════════════════════════════════════════
     PROJECT DATA
     ═══════════════════════════════════════════════════════════ */

  /* posterSrc = frame extraite de la vid\u00E9o (attribut poster + fond par d\u00E9faut)
     bgSrc = visuel du fond plein \u00E9cran (blurr\u00E9 en CSS), si diff\u00E9rent du poster */
  var PROJECTS = [
    { slug: 'warner-music', titleL: 'Skefre', titleR: 'Warner Music', industry: 'Music', service: 'Photo', client: 'Warner Music', services: 'Photo', link: 'work/warner-music.html', thumb: 'assets/images/portfolio/behind-the-scene/behind-the-scene-01.jpg', mediaSrc: 'assets/videos/hero/hero.mp4', mediaType: 'video', posterSrc: 'assets/images/posters/hero.jpg' },
    { slug: 'true-religion', titleL: '63OG & Talk', titleR: 'True Religion', industry: 'Clothing Brand', service: 'Photo', client: 'True Religion', services: 'Photo,Events', link: 'work/true-religion.html', thumb: 'assets/images/portfolio/true-religion/true-religion-02.jpg', mediaSrc: 'assets/images/portfolio/true-religion/true-religion-01.jpg', mediaType: 'image' },
    { slug: 'wanderlust', titleL: 'Jolagreen x LaMano', titleR: 'Wanderlust', industry: 'Lifestyle', service: 'Video', client: 'Wanderlust', services: 'Video,Events', link: 'work/wanderlust.html', thumb: 'assets/images/portfolio/wanderlust/crowd/wanderlust-crowd-01.jpg', mediaSrc: 'assets/videos/projects/wanderlust/jolagreen-wanderlust-teaser.mp4', mediaType: 'video', posterSrc: 'assets/images/posters/jolagreen-wanderlust-teaser.jpg', bgSrc: 'assets/images/portfolio/wanderlust/crowd/wanderlust-crowd-01.jpg' },
    { slug: 'les-ardentes', titleL: 'Playboi Carti', titleR: 'Les Ardentes', industry: 'Events', service: 'Events', client: 'Les Ardentes', services: 'Video,Photo,Events', link: 'work/les-ardentes.html', thumb: 'assets/images/portfolio/ardentes/ard25-vendredi-gazo-rafaeldeprost-8692.jpg', mediaSrc: 'assets/images/portfolio/ardentes/lesardentes-pack-promo-01.jpeg', mediaType: 'image' },
    { slug: 'deflower', titleL: 'Stepcorrect', titleR: 'Deflower', industry: 'Fashion', service: 'Video', client: 'Deflower', services: 'Video,Photo,Events', link: 'work/deflower.html', thumb: 'assets/images/portfolio/deflower/deflower-01.jpg', mediaSrc: 'assets/videos/projects/deflower/deflower-afterparty-fashionweek.mp4', mediaType: 'video', posterSrc: 'assets/images/posters/deflower-afterparty-fashionweek.jpg' },
    { slug: 'truth-records', titleL: 'Nosky & Princ\u20AC', titleR: 'Truth Records', industry: 'Music', service: 'Video', client: 'Truth Records', services: 'Video', link: 'work/truth-records.html', thumb: 'assets/images/portfolio/behind-the-scene/behind-the-scene-02.jpg', mediaSrc: 'assets/videos/hero/hero.mp4', mediaType: 'video', posterSrc: 'assets/images/posters/hero.jpg' },
    { slug: 'ysl-records', titleL: 'Young Thug', titleR: 'YSL Records', industry: 'Music', service: 'Video', client: 'YSL Records', services: 'Video', link: 'work/ysl-records.html', thumb: 'assets/images/portfolio/behind-the-scene/behind-the-scene-03.jpg', mediaSrc: 'assets/videos/hero/hero.mp4', mediaType: 'video', posterSrc: 'assets/images/posters/hero.jpg' },
    { slug: 'winterfell', titleL: 'Leto', titleR: 'Winterfell', industry: 'Music', service: 'Photo', client: 'Winterfell', services: 'Photo', link: 'work/winterfell.html', thumb: 'assets/images/portfolio/behind-the-scene/behind-the-scene-04.jpg', mediaSrc: 'assets/videos/hero/hero.mp4', mediaType: 'video', posterSrc: 'assets/images/posters/hero.jpg' },
    { slug: 'maison-guava', titleL: 'UnknowUK', titleR: 'Maison Guava', industry: 'Fashion', service: 'Photo', client: 'Maison Guava', services: 'Photo', link: 'work/maison-guava.html', thumb: 'assets/images/portfolio/henny/henny-01.jpg', mediaSrc: 'assets/images/portfolio/henny/henny-01.jpg', mediaType: 'image' },
    { slug: 'hoodlife-media', titleL: '275K+ Community', titleR: 'Hoodlife Media', industry: 'Music', service: 'Video', client: 'Hoodlife Media', services: 'Video,Photo,Events', link: 'work/hoodlife-media.html', thumb: 'assets/images/portfolio/henny/henny-05.jpg', mediaSrc: 'assets/images/portfolio/henny/henny-05.jpg', mediaType: 'image' }
  ];


  /* ═══════════════════════════════════════════════════════════
     STATE
     ═══════════════════════════════════════════════════════════ */

  var mode = 'slider';
  var filtered = PROJECTS.slice();
  var activeFilter = 'all';
  var swiper = null;
  var currentTl = null;
  var lastPrevSlide = null;
  var lastNewSlide = null;
  var lastScrollDir = 1;       // 1 = down (next), -1 = up (prev)
  var prevRealIndex = 0;


  /* ═══════════════════════════════════════════════════════════
     DOM REFS
     ═══════════════════════════════════════════════════════════ */

  var swiperWrapper = sliderSection.querySelector('.swiper-wrapper');
  var countCurrent = document.querySelector('.work-bar__current');
  var countTotal = document.querySelector('.work-bar__total');
  var filterBtns = document.querySelectorAll('.work-bar__filter');
  var modeBtns = document.querySelectorAll('.work-bar__mode');
  var allRows = Array.prototype.slice.call(listSection.querySelectorAll('.work-list__row'));
  var bgLayers = Array.prototype.slice.call(listSection.querySelectorAll('.work-list__bg-layer'));
  var bgOverlay = listSection.querySelector('.work-list__bg-overlay');
  var activeBgLayer = 0;
  var currentBgSlug = null;
  var shutterTop = sliderSection.querySelector('.ws-shutter--top');
  var shutterBottom = sliderSection.querySelector('.ws-shutter--bottom');

  document.body.classList.add('mode-slider');


  /* ═══════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════ */

  window.addEventListener('load', function () {
    buildSlides(filtered);
    initSwiper();
    bindFilters();
    bindToggle();
    bindListHover();
    bindTitleRefit();
  });

  // Re-fit des titres au resize (debounce 200ms) — fitTitle ne tournait qu'au load
  var fitResizeTimer = null;
  function bindTitleRefit() {
    window.addEventListener('resize', function () {
      clearTimeout(fitResizeTimer);
      fitResizeTimer = setTimeout(function () {
        swiperWrapper.querySelectorAll('.swiper-slide').forEach(function (s) {
          fitTitle(s.querySelector('.ws-title-l'));
          fitTitle(s.querySelector('.ws-title-r'));
        });
      }, 200);
    });
  }


  /* ═══════════════════════════════════════════════════════════
     BUILD SLIDES — generate Swiper slides from project data
     ═══════════════════════════════════════════════════════════ */

  function buildSlides(projects) {
    swiperWrapper.innerHTML = '';
    var total = projects.length;

    projects.forEach(function (proj, i) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';

      // Une seule balise video par slide (dans le viewer) — le fond est une
      // image fixe (frame extraite, blur CSS), jamais une seconde video
      var viewerHTML, bgHTML;
      if (proj.mediaType === 'video') {
        viewerHTML = '<video muted loop playsinline preload="none" poster="' + proj.posterSrc + '"><source src="' + proj.mediaSrc + '" type="video/mp4"></video>';
        bgHTML = '<img class="ws-bg__poster" src="' + (proj.bgSrc || proj.posterSrc) + '" alt="">';
      } else {
        viewerHTML = '<img src="' + proj.mediaSrc + '" alt="">';
        bgHTML = '<img src="' + proj.mediaSrc + '" alt="">';
      }

      var num = String(i + 1).padStart(2, '0');

      slide.innerHTML =
        '<div class="ws-slide">' +
          '<div class="ws-bg">' + bgHTML + '</div>' +
          '<div class="ws-overlay"></div>' +
          '<div class="ws-frame">' +
            '<div class="ws-above">' +
              '<span class="ws-type">' + proj.industry + '</span>' +
              '<span class="ws-cat">' + proj.service + '</span>' +
            '</div>' +
            '<div class="ws-center">' +
              '<div class="ws-title-l"><div class="ws-title__mask"><span class="ws-title__text">' + buildMixed(proj.titleL) + '</span></div></div>' +
              '<div class="ws-viewer has-grain" data-cursor="Soon">' +
                '<div class="ws-viewer__media">' + viewerHTML + '</div>' +
                '<span class="ws-door ws-door--top"></span><span class="ws-door ws-door--bottom"></span>' +
                '<span class="ws-vf ws-vf--tl"></span><span class="ws-vf ws-vf--tr"></span>' +
                '<span class="ws-vf ws-vf--bl"></span><span class="ws-vf ws-vf--br"></span>' +
              '</div>' +
              '<div class="ws-title-r"><div class="ws-title__mask"><span class="ws-title__text">' + buildMixed(proj.titleR) + '</span></div></div>' +
            '</div>' +
            '<div class="ws-below">' +
              '<span class="ws-num">' + num + '.</span>' +
              '<span class="ws-client">' + proj.client + '</span>' +
              '<span class="ws-of">.' + String(total).padStart(2, '0') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';

      swiperWrapper.appendChild(slide);
    });

    // Auto-size titles after DOM insertion
    requestAnimationFrame(function () {
      var slides = swiperWrapper.querySelectorAll('.swiper-slide');
      slides.forEach(function (s) {
        fitTitle(s.querySelector('.ws-title-l'));
        fitTitle(s.querySelector('.ws-title-r'));
      });
    });
  }

  function buildMixed(text) {
    if (!text) return '';
    return '<span class="d-first">' + text.charAt(0) + '</span><span class="d-rest">' + text.substring(1) + '</span>';
  }

  function fitTitle(titleEl) {
    if (!titleEl) return;
    var textEl = titleEl.querySelector('.ws-title__text');
    if (!textEl) return;
    var containerW = titleEl.getBoundingClientRect().width;
    if (containerW <= 0) return;
    textEl.style.fontSize = '';
    var textW = textEl.scrollWidth;
    if (textW <= containerW) return;
    var baseFontSize = parseFloat(window.getComputedStyle(titleEl).fontSize) || 110;
    var newSize = Math.max(Math.floor(baseFontSize * (containerW / textW)), 36);
    textEl.style.fontSize = newSize + 'px';
  }


  /* ═══════════════════════════════════════════════════════════
     SWIPER INIT
     ═══════════════════════════════════════════════════════════ */

  function initSwiper() {
    abortTransition();
    if (swiper) { swiper.destroy(true, true); swiper = null; }
    if (filtered.length === 0) return;

    swiper = new Swiper('.work-swiper', {
      direction: 'vertical',
      effect: 'fade',
      fadeEffect: { crossFade: false },
      speed: 800,
      allowTouchMove: true,
      loop: filtered.length > 1,
      loopAdditionalSlides: 2,
      mousewheel: {
        sensitivity: 1,
        forceToAxis: true,
        thresholdDelta: 6
      },
      keyboard: { enabled: true },
      on: {
        init: function () {
          prevRealIndex = this.realIndex;
          updateCounter(this);
          animateSlideIn(this.slides[this.activeIndex]);
          playSlideVideo(this.slides[this.activeIndex]);
          updatePreloads(this);
        },
        slideChangeTransitionStart: function () {
          updateCounter(this);

          // Detect scroll direction from realIndex change
          var newReal = this.realIndex;
          var total = filtered.length;
          if (total > 1 && newReal !== prevRealIndex) {
            if (newReal > prevRealIndex) {
              lastScrollDir = (prevRealIndex === 0 && newReal === total - 1) ? -1 : 1;
            } else {
              lastScrollDir = (newReal === 0 && prevRealIndex === total - 1) ? 1 : -1;
            }
          }
          prevRealIndex = newReal;

          var prevSlide = this.slides[this.previousIndex];
          var newSlide = this.slides[this.activeIndex];

          // CSS class overrides Swiper's inline opacity with !important
          if (prevSlide) {
            prevSlide.classList.add('ws-transitioning');
            prevSlide.style.zIndex = '2';
          }
          if (newSlide) {
            newSlide.classList.add('ws-transitioning');
            newSlide.style.zIndex = '1';
          }

          animateTransition(prevSlide, newSlide);
          playSlideVideo(newSlide);
          updatePreloads(this);
        },
        slideChangeTransitionEnd: function () {
          // Only hide slides that are NOT in our GSAP animation
          var self = this;
          this.slides.forEach(function (s, i) {
            if (i !== self.activeIndex && !s.classList.contains('ws-transitioning')) {
              s.style.opacity = '0';
              s.style.zIndex = '';
            }
          });
          pauseAllVideosExcept(this);
        }
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════
     SLIDE ANIMATIONS — entrance effects via GSAP
     ═══════════════════════════════════════════════════════════ */

  function animateSlideIn(slideEl) {
    if (!slideEl) return;
    var tl = gsap.timeline();

    // Viewer — porte d'ascenseur en transform (2 volets translateY, GPU)
    var doorTop = slideEl.querySelector('.ws-door--top');
    var doorBottom = slideEl.querySelector('.ws-door--bottom');
    if (doorTop && doorBottom) {
      gsap.set([doorTop, doorBottom], { yPercent: 0 });
      tl.to(doorTop, { yPercent: -102, duration: 0.8, ease: 'power2.inOut', force3D: true }, 0);
      tl.to(doorBottom, { yPercent: 102, duration: 0.8, ease: 'power2.inOut', force3D: true }, 0);
    }

    // Left title — slide up from below within mask
    var titleLText = slideEl.querySelector('.ws-title-l .ws-title__text');
    if (titleLText) {
      gsap.set(titleLText, { yPercent: 100 });
      tl.to(titleLText, { yPercent: 0, duration: 0.7, ease: 'power3.out', force3D: true }, 0.15);
    }

    // Right title — slide down from above within mask
    var titleRText = slideEl.querySelector('.ws-title-r .ws-title__text');
    if (titleRText) {
      gsap.set(titleRText, { yPercent: -100 });
      tl.to(titleRText, { yPercent: 0, duration: 0.7, ease: 'power3.out', force3D: true }, 0.15);
    }

    // Info above + below — fade in
    var above = slideEl.querySelector('.ws-above');
    var below = slideEl.querySelector('.ws-below');
    if (above) { gsap.set(above, { opacity: 0 }); tl.to(above, { opacity: 1, duration: 0.5 }, 0.3); }
    if (below) { gsap.set(below, { opacity: 0 }); tl.to(below, { opacity: 1, duration: 0.5 }, 0.3); }
  }


  /* ═══════════════════════════════════════════════════════════
     SLIDE TRANSITION — volets plein écran en transform (GPU),
     plus aucun clip-path animé sur grande surface
     ═══════════════════════════════════════════════════════════ */

  function setShuttersOpen() {
    if (!shutterTop || !shutterBottom) return;
    gsap.set(shutterTop, { yPercent: -101 });
    gsap.set(shutterBottom, { yPercent: 101 });
  }

  function animateTransition(prevSlide, newSlide) {
    abortTransition();
    if (!prevSlide || !newSlide || prevSlide === newSlide) return;

    lastPrevSlide = prevSlide;
    lastNewSlide = newSlide;

    var dir = lastScrollDir;
    var closeDur = 0.3;
    var openDur = 0.3;
    var ease = 'power2.inOut';

    // Refs nouvelle slide (la sortante est juste recouverte par les volets)
    var newTitleL = newSlide.querySelector('.ws-title-l .ws-title__text');
    var newTitleR = newSlide.querySelector('.ws-title-r .ws-title__text');
    var newAbove = newSlide.querySelector('.ws-above');
    var newBelow = newSlide.querySelector('.ws-below');

    // Préparer la nouvelle slide : titres décalés, infos masquées, volets viewer ouverts
    if (newTitleL) gsap.set(newTitleL, { yPercent: dir > 0 ? 100 : -100 });
    if (newTitleR) gsap.set(newTitleR, { yPercent: dir > 0 ? -100 : 100 });
    if (newAbove) gsap.set(newAbove, { opacity: 0 });
    if (newBelow) gsap.set(newBelow, { opacity: 0 });
    resetSlideDoors(newSlide);

    var tl = gsap.timeline({
      onComplete: function () {
        resetSlideState(prevSlide);
        prevSlide.classList.remove('ws-transitioning');
        prevSlide.style.opacity = '0';
        prevSlide.style.zIndex = '';
        newSlide.classList.remove('ws-transitioning');
        newSlide.style.zIndex = '';
        lastPrevSlide = null;
        lastNewSlide = null;
        currentTl = null;
      }
    });
    currentTl = tl;

    /* ── PHASE 1 : fermeture des volets sur la slide sortante ── */
    if (shutterTop && shutterBottom) {
      tl.to([shutterTop, shutterBottom], { yPercent: 0, duration: closeDur, ease: ease, force3D: true }, 0);
    }

    /* ── MIDPOINT : swap derrière les volets fermés ── */
    tl.call(function () {
      prevSlide.style.opacity = '0';
      prevSlide.style.zIndex = '';
      newSlide.style.zIndex = '2';
      pauseSlideVideo(prevSlide);
    }, null, closeDur);

    /* ── PHASE 2 : ouverture des volets sur la nouvelle slide ── */
    if (shutterTop && shutterBottom) {
      tl.to(shutterTop, { yPercent: -101, duration: openDur, ease: ease, force3D: true }, closeDur);
      tl.to(shutterBottom, { yPercent: 101, duration: openDur, ease: ease, force3D: true }, closeDur);
    }
    if (newTitleL) tl.to(newTitleL, { yPercent: 0, duration: openDur + 0.1, ease: 'power3.out' }, closeDur);
    if (newTitleR) tl.to(newTitleR, { yPercent: 0, duration: openDur + 0.1, ease: 'power3.out' }, closeDur);
    if (newAbove) tl.to(newAbove, { opacity: 1, duration: openDur * 0.7 }, closeDur + 0.05);
    if (newBelow) tl.to(newBelow, { opacity: 1, duration: openDur * 0.7 }, closeDur + 0.05);
  }

  // Volets du viewer en position ouverte (état neutre d'une slide visible)
  function resetSlideDoors(slideEl) {
    if (!slideEl) return;
    var doorTop = slideEl.querySelector('.ws-door--top');
    var doorBottom = slideEl.querySelector('.ws-door--bottom');
    if (doorTop) gsap.set(doorTop, { yPercent: -102 });
    if (doorBottom) gsap.set(doorBottom, { yPercent: 102 });
  }

  function resetSlideState(slideEl) {
    if (!slideEl) return;
    var titleL = slideEl.querySelector('.ws-title-l .ws-title__text');
    var titleR = slideEl.querySelector('.ws-title-r .ws-title__text');
    var above = slideEl.querySelector('.ws-above');
    var below = slideEl.querySelector('.ws-below');
    if (titleL) gsap.set(titleL, { yPercent: 0 });
    if (titleR) gsap.set(titleR, { yPercent: 0 });
    if (above) gsap.set(above, { opacity: 1 });
    if (below) gsap.set(below, { opacity: 1 });
    resetSlideDoors(slideEl);
  }

  function abortTransition() {
    if (!currentTl) return;
    currentTl.kill();
    setShuttersOpen();
    if (lastPrevSlide) {
      lastPrevSlide.classList.remove('ws-transitioning');
      lastPrevSlide.style.opacity = '0';
      lastPrevSlide.style.zIndex = '';
      resetSlideState(lastPrevSlide);
      pauseSlideVideo(lastPrevSlide);
    }
    if (lastNewSlide) {
      lastNewSlide.classList.remove('ws-transitioning');
      lastNewSlide.style.zIndex = '';
      resetSlideState(lastNewSlide);
    }
    lastPrevSlide = null;
    lastNewSlide = null;
    currentTl = null;
  }


  /* ═══════════════════════════════════════════════════════════
     VIDEO MANAGEMENT
     ═══════════════════════════════════════════════════════════ */

  function playSlideVideo(slideEl) {
    if (!slideEl) return;
    var videos = slideEl.querySelectorAll('video');
    videos.forEach(function (v) { v.play().catch(function () {}); });
  }

  function pauseSlideVideo(slideEl) {
    if (!slideEl) return;
    var videos = slideEl.querySelectorAll('video');
    videos.forEach(function (v) {
      v.pause();
      // Rembobiner pour libérer le décodage et repartir du début
      if (v.readyState > 0) { try { v.currentTime = 0; } catch (e) {} }
    });
  }

  // preload="metadata" uniquement sur les slides adjacentes (clones loop inclus)
  function updatePreloads(sw) {
    if (!sw || !sw.slides) return;
    sw.slides.forEach(function (s, i) {
      if (Math.abs(i - sw.activeIndex) !== 1) return;
      var v = s.querySelector('video');
      if (v && v.preload === 'none') v.preload = 'metadata';
    });
  }

  // Coupe toute vidéo hors slide active (sécurité clones loop)
  function pauseAllVideosExcept(sw) {
    if (!sw || !sw.slides) return;
    sw.slides.forEach(function (s, i) {
      if (i !== sw.activeIndex) pauseSlideVideo(s);
    });
  }


  /* ═══════════════════════════════════════════════════════════
     COUNTER
     ═══════════════════════════════════════════════════════════ */

  function updateCounter(swiperInstance) {
    var real = swiperInstance.realIndex + 1;
    var total = filtered.length;
    if (countCurrent) countCurrent.textContent = String(real).padStart(2, '0');
    if (countTotal) countTotal.textContent = String(total).padStart(2, '0');
  }


  /* ═══════════════════════════════════════════════════════════
     FILTERS
     ═══════════════════════════════════════════════════════════ */

  function bindFilters() {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = btn.getAttribute('data-filter');
        if (val === activeFilter) return;
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        activeFilter = val;
        applyFilter();
      });
    });
  }

  function matchesFilter(proj) {
    if (activeFilter === 'all') return true;
    var parts = activeFilter.split(':');
    if (parts.length !== 2) return true;
    var type = parts[0], value = parts[1];
    if (type === 'service') return proj.services.split(',').indexOf(value) !== -1;
    if (type === 'industry') return proj.industry === value;
    return true;
  }

  function applyFilter() {
    filtered = PROJECTS.filter(matchesFilter);

    // Rebuild slider
    abortTransition();
    if (swiper) { swiper.destroy(true, true); swiper = null; }
    buildSlides(filtered);
    if (mode === 'slider') initSwiper();

    // Update list rows
    allRows.forEach(function (row) {
      var slug = row.getAttribute('data-slug');
      var proj = null;
      for (var i = 0; i < PROJECTS.length; i++) {
        if (PROJECTS[i].slug === slug) { proj = PROJECTS[i]; break; }
      }
      var visible = proj && matchesFilter(proj);
      if (visible) {
        row.classList.remove('is-hidden');
        gsap.to(row, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.to(row, { opacity: 0, duration: 0.2, ease: 'power2.out', onComplete: function () { row.classList.add('is-hidden'); } });
      }
    });

    renumber();
  }

  function renumber() {
    var visibleRows = allRows.filter(function (r) { return !r.classList.contains('is-hidden'); });
    visibleRows.forEach(function (r, i) {
      var num = r.querySelector('.work-list__num');
      if (num) num.textContent = String(i + 1).padStart(2, '0') + '.';
    });
  }


  /* ═══════════════════════════════════════════════════════════
     TOGGLE — Slider / List
     ═══════════════════════════════════════════════════════════ */

  function bindToggle() {
    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var newMode = btn.getAttribute('data-mode');
        if (newMode === mode) return;
        switchMode(newMode);
      });
    });
  }

  function switchMode(newMode) {
    modeBtns.forEach(function (b) { b.classList.remove('is-active'); });
    var activeBtn = document.querySelector('.work-bar__mode[data-mode="' + newMode + '"]');
    if (activeBtn) activeBtn.classList.add('is-active');

    if (newMode === 'list') {
      mode = 'list';
      document.body.classList.remove('mode-slider');
      document.body.classList.add('mode-list');

      abortTransition();
      if (swiper) { swiper.destroy(true, true); swiper = null; }

      gsap.to(sliderSection, {
        opacity: 0, duration: 0.4, ease: 'power2.out',
        onComplete: function () {
          sliderSection.classList.remove('is-active');
          listSection.classList.add('is-active');
          gsap.fromTo(listSection, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
          var visibleRows = allRows.filter(function (r) { return !r.classList.contains('is-hidden'); });
          gsap.fromTo(visibleRows, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: 'power2.out', delay: 0.15 });
        }
      });

    } else {
      mode = 'slider';
      document.body.classList.remove('mode-list');
      document.body.classList.add('mode-slider');
      cleanupListBG();

      gsap.to(listSection, {
        opacity: 0, duration: 0.4, ease: 'power2.out',
        onComplete: function () {
          listSection.classList.remove('is-active');
          sliderSection.classList.add('is-active');
          sliderSection.style.opacity = '';
          gsap.fromTo(sliderSection, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
          buildSlides(filtered);
          initSwiper();
        }
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════
     LIST — BG crossfade + thumbnail video on hover
     ═══════════════════════════════════════════════════════════ */

  function findProject(slug) {
    for (var i = 0; i < PROJECTS.length; i++) {
      if (PROJECTS[i].slug === slug) return PROJECTS[i];
    }
    return null;
  }

  function cleanupListBG() {
    currentBgSlug = null;
    bgLayers.forEach(function (l) {
      gsap.set(l, { opacity: 0 });
      l.innerHTML = '';
    });
    if (bgOverlay) gsap.set(bgOverlay, { opacity: 0 });
  }

  function bindListHover() {
    if (!bgLayers.length) return;
    var rowsContainer = listSection.querySelector('.work-list__rows');

    allRows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var slug = row.getAttribute('data-slug');
        var proj = findProject(slug);
        if (!proj) return;

        // Thumbnail video — play on hover
        var thumbVideo = row.querySelector('.work-list__thumb video');
        if (thumbVideo) thumbVideo.play().catch(function () {});

        // BG crossfade — skip if same project
        if (slug === currentBgSlug) return;
        currentBgSlug = slug;

        var nextLayer = activeBgLayer === 0 ? 1 : 0;
        var layerEl = bgLayers[nextLayer];

        // Load media into inactive layer
        if (proj.mediaType === 'video') {
          layerEl.innerHTML = '<video muted loop playsinline autoplay preload="none"><source src="' + proj.mediaSrc + '" type="video/mp4"></video>';
          var v = layerEl.querySelector('video');
          if (v) v.play().catch(function () {});
        } else {
          layerEl.innerHTML = '<img src="' + proj.mediaSrc + '" alt="">';
        }

        // Crossfade layers
        gsap.to(bgLayers[activeBgLayer], { opacity: 0, duration: 0.4, ease: 'power2.out' });
        gsap.to(layerEl, { opacity: 1, duration: 0.4, ease: 'power2.out' });
        gsap.to(bgOverlay, { opacity: 1, duration: 0.4, ease: 'power2.out' });

        // Pause old layer video
        var oldVideo = bgLayers[activeBgLayer].querySelector('video');
        if (oldVideo) oldVideo.pause();

        activeBgLayer = nextLayer;
      });

      row.addEventListener('mouseleave', function () {
        // Pause thumbnail video
        var thumbVideo = row.querySelector('.work-list__thumb video');
        if (thumbVideo) { thumbVideo.pause(); thumbVideo.currentTime = 0; }
      });
    });

    // Leave rows container — fade out BG
    if (rowsContainer) {
      rowsContainer.addEventListener('mouseleave', function () {
        currentBgSlug = null;
        gsap.to(bgLayers, { opacity: 0, duration: 0.4, ease: 'power2.out' });
        gsap.to(bgOverlay, { opacity: 0, duration: 0.4, ease: 'power2.out' });
        bgLayers.forEach(function (l) {
          var v = l.querySelector('video');
          if (v) v.pause();
        });
      });
    }
  }


})();
