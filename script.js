/* Vision Web — script.js
   Nessun handler blocca il comportamento nativo di <a href="wa.me/…">,
   <a href="tel:…">, <a href="mailto:…">. */

(function () {
  'use strict';

  /* -------------------------------------------------------------
     1) Sticky header on scroll
     If a video hero is present, keep header transparent while the video
     is still revealing; otherwise switch to opaque immediately.
     ------------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const videoHeroEl = document.getElementById('videoHero');

  const getHeaderThreshold = () => {
    if (!videoHeroEl) return 8;
    // Header stays transparent while the video reveal is happening;
    // switches to opaque near the end of the container. We use the sticky
    // child's height (set by CSS to 100dvh) rather than window.innerHeight
    // so we stay in sync with CSS on mobile / preview viewports.
    const inner = videoHeroEl.firstElementChild;
    const stickyH = inner ? inner.offsetHeight : window.innerHeight;
    return Math.max(8, videoHeroEl.offsetHeight - stickyH - 100);
  };

  let headerThreshold = getHeaderThreshold();
  window.addEventListener('resize', () => { headerThreshold = getHeaderThreshold(); }, { passive: true });

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > headerThreshold);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* -------------------------------------------------------------
     2) Mobile menu toggle
     ------------------------------------------------------------- */
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');

  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
      if (open) menu.removeAttribute('hidden');
      else menu.setAttribute('hidden', '');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    /* Close menu after clicking any internal link */
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setOpen(false));
    });

    /* Close on outside click */
    document.addEventListener('click', (e) => {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    /* Close on Esc */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* -------------------------------------------------------------
     3) Reveal on scroll — respects prefers-reduced-motion
     ------------------------------------------------------------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce && 'IntersectionObserver' in window) {
    const grouped = new Set();

    /* Stagger groups: children of a [data-stagger] container cascade in
       together with a small incremental delay (crafted, not one-by-one). */
    const groupIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const kids = entry.target.querySelectorAll(':scope > .reveal');
        kids.forEach((k, i) => {
          k.style.transitionDelay = Math.min(i, 8) * 70 + 'ms';
          k.classList.add('is-visible');
        });
        groupIO.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    document.querySelectorAll('[data-stagger]').forEach(group => {
      group.querySelectorAll(':scope > .reveal').forEach(k => grouped.add(k));
      groupIO.observe(group);
    });

    /* Standalone reveals (not part of a stagger group) */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    document.querySelectorAll('.reveal').forEach(el => {
      if (!grouped.has(el)) io.observe(el);
    });
  } else {
    /* No IO support or reduced motion → show everything immediately */
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    document.querySelectorAll('.section-head').forEach(el => el.classList.add('is-visible'));
  }

  /* -------------------------------------------------------------
     4) FAQ — close others when opening one (accordion behaviour)
     ------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* -------------------------------------------------------------
     5) Hero — scroll-driven image sequence (canvas)
     40 pre-decoded JPG frames are preloaded, then painted onto a canvas
     according to scroll position. The video decoder is NEVER touched
     during scroll — each frame is just a texture upload + drawImage,
     the cheapest thing a browser can do → perfectly fluid everywhere.
     (This is the airpods.com / iphone.com technique.)
     ------------------------------------------------------------- */
  const videoHero   = document.getElementById('videoHero');
  const videoWindow = document.getElementById('videoHeroWindow');
  const canvasEl    = document.getElementById('videoHeroCanvas');
  const fallbackImg = document.getElementById('videoHeroMedia');

  if (videoHero && videoWindow && canvasEl) {
    const videoHeroInner = videoHero.firstElementChild;
    const ctx = canvasEl.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const FRAME_COUNT = 30;
    const frames = new Array(FRAME_COUNT);
    const loaded = new Array(FRAME_COUNT).fill(false);
    let loadedCount = 0;
    let firstDrawn = false;

    // Clip-path + scale reveal parameters
    const clipStartX = 12;
    const clipStartY = 20;
    const scaleStart = 1.08;
    const scaleEnd   = 1.0;

    const computeScrollHeight = () => Math.max(
      1,
      videoHero.offsetHeight - (videoHeroInner ? videoHeroInner.offsetHeight : window.innerHeight)
    );
    let scrollHeight = computeScrollHeight();

    // Draw the nearest loaded frame to a requested index
    const drawFrame = (idx) => {
      if (loaded[idx]) {
        ctx.drawImage(frames[idx], 0, 0, canvasEl.width, canvasEl.height);
        if (!firstDrawn && fallbackImg) {
          firstDrawn = true;
          fallbackImg.classList.add('is-hidden');
        }
        return;
      }
      // Requested frame not ready → find nearest loaded neighbour
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (idx - d >= 0 && loaded[idx - d]) { ctx.drawImage(frames[idx - d], 0, 0, canvasEl.width, canvasEl.height); return; }
        if (idx + d < FRAME_COUNT && loaded[idx + d]) { ctx.drawImage(frames[idx + d], 0, 0, canvasEl.width, canvasEl.height); return; }
      }
    };

    let ticking = false;
    let lastIdx = -1;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const p = reduce ? 1 : Math.min(1, Math.max(0, y / scrollHeight));
      const inv = 1 - p;

      // Clip-path reveal (skip on reduced motion → fully open)
      const cx1 = reduce ? 0   : clipStartX * inv;
      const cy1 = reduce ? 0   : clipStartY * inv;
      const cx2 = reduce ? 100 : 100 - clipStartX * inv;
      const cy2 = reduce ? 100 : 100 - clipStartY * inv;
      videoWindow.style.setProperty('--clip-x1', cx1 + '%');
      videoWindow.style.setProperty('--clip-y1', cy1 + '%');
      videoWindow.style.setProperty('--clip-x2', cx2 + '%');
      videoWindow.style.setProperty('--clip-y2', cy2 + '%');
      canvasEl.style.setProperty('--media-scale', (scaleStart + (scaleEnd - scaleStart) * p).toFixed(4));

      // Draw the frame for this scroll position
      const idx = Math.round(p * (FRAME_COUNT - 1));
      if (idx !== lastIdx) {
        drawFrame(idx);
        lastIdx = idx;
      }
    };

    const onScrollHero = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    // Preload all frames. First frame is prioritised so the canvas paints ASAP.
    const pad = (n) => String(n).padStart(3, '0');
    const loadFrame = (i) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = 'assets/frames/frame-' + pad(i) + '.jpg';
      const onDone = () => {
        frames[i] = img;
        loaded[i] = true;
        loadedCount++;
        // Redraw if this frame is the one we currently need
        const p = reduce ? 1 : Math.min(1, Math.max(0, window.scrollY / scrollHeight));
        const want = Math.round(p * (FRAME_COUNT - 1));
        if (i === want || !firstDrawn) { drawFrame(want); }
      };
      if (img.complete && img.naturalWidth) { onDone(); }
      else {
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', () => { loadedCount++; }, { once: true });
      }
    };

    // Mobile: load every 2nd frame (~850KB instead of 1.7MB). The nearest-
    // frame fallback in drawFrame() makes the reduced set look seamless.
    const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 700;
    const stride = isSmallScreen ? 2 : 1;

    // Load frame 0 immediately, rest on next idle tick (don't block first paint)
    loadFrame(0);
    const loadRest = () => {
      for (let i = stride; i < FRAME_COUNT; i += stride) loadFrame(i);
      // Always ensure the very last frame is present so the end state is crisp
      if ((FRAME_COUNT - 1) % stride !== 0) loadFrame(FRAME_COUNT - 1);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(loadRest, { timeout: 800 });
    else setTimeout(loadRest, 100);

    // Scroll + resize
    if (!reduce) {
      window.addEventListener('scroll', onScrollHero, { passive: true });
    }
    window.addEventListener('resize', () => {
      scrollHeight = computeScrollHeight();
      lastIdx = -1;
      onScrollHero();
    }, { passive: true });

    // Initial paint
    update();
  }

})();
