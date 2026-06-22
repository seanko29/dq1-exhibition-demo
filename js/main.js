/* ============================================================
   DQ1 AI Vision Engine — Exhibition Demo Scripts
   Synabro Technology
   Pure JS — No dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  initNavbar();
  initSmoothScroll();
  initScrollAnimations();
  initComparisonSliders();
  initCounters();
  initPowerBars();
  initActiveNav();
  initQRCodes();

});

/* ============================================================
   1. NAVBAR — opaque background on scroll
   ============================================================ */
function initNavbar() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   2. SMOOTH SCROLL — all anchor links
   ============================================================ */
function initSmoothScroll() {
  var NAVBAR_HEIGHT = 70;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   3. SCROLL-TRIGGERED FADE-IN — IntersectionObserver
   ============================================================ */
function initScrollAnimations() {
  var elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(function (el) { observer.observe(el); });
}

/* ============================================================
   4. BEFORE / AFTER COMPARISON SLIDER
   Uses CSS custom property --pos (percentage string e.g. "50%")
   ============================================================ */
function initComparisonSliders() {
  document.querySelectorAll('.comparison-slider').forEach(function (slider) {
    var handle = slider.querySelector('.comparison-handle');
    var isDragging = false;

    // Initialize at center
    slider.style.setProperty('--pos', '50%');

    function updatePosition(clientX) {
      var rect = slider.getBoundingClientRect();
      var pos = ((clientX - rect.left) / rect.width) * 100;
      pos = Math.max(2, Math.min(98, pos));
      slider.style.setProperty('--pos', pos + '%');
    }

    // --- Mouse events ---
    handle.addEventListener('mousedown', function (e) {
      isDragging = true;
      e.preventDefault();
      e.stopPropagation();
    });

    slider.addEventListener('mousedown', function (e) {
      isDragging = true;
      updatePosition(e.clientX);
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      updatePosition(e.clientX);
    });

    document.addEventListener('mouseup', function () {
      isDragging = false;
    });

    // --- Touch events ---
    handle.addEventListener('touchstart', function (e) {
      isDragging = true;
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });

    slider.addEventListener('touchstart', function (e) {
      isDragging = true;
      updatePosition(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      updatePosition(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchend', function () {
      isDragging = false;
    });
  });
}

/* ============================================================
   5. NUMBER COUNTER ANIMATION
   Triggered by IntersectionObserver; reads data-target and data-decimals
   ============================================================ */
function initCounters() {
  var counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(function (el) {
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var target = parseFloat(el.getAttribute('data-target'));
      el.textContent = target.toFixed(decimals);
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(function (el) { observer.observe(el); });
}

function animateCounter(el) {
  var target = parseFloat(el.getAttribute('data-target'));
  var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
  var duration = 2000;
  var startTime = null;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = easeOutCubic(progress);
    var current = eased * target;

    el.textContent = current.toFixed(decimals);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toFixed(decimals);
    }
  }

  requestAnimationFrame(step);
}

/* ============================================================
   6. POWER BAR ANIMATION
   Reads data-width and data-max; animates width from 0 to percentage
   Bars are staggered by 200ms each
   ============================================================ */
function initPowerBars() {
  var powerSection = document.querySelector('.power-section');
  if (!powerSection) return;

  var bars = powerSection.querySelectorAll('.power-bar');
  if (!bars.length) return;

  // Set initial width to 0 before any animation
  bars.forEach(function (bar) {
    bar.style.width = '0%';
    bar.style.transition = 'none';
  });

  if (!('IntersectionObserver' in window)) {
    bars.forEach(function (bar) {
      var w = parseFloat(bar.getAttribute('data-width'));
      var max = parseFloat(bar.getAttribute('data-max'));
      bar.style.width = ((w / max) * 100) + '%';
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      bars.forEach(function (bar, index) {
        var w = parseFloat(bar.getAttribute('data-width'));
        var max = parseFloat(bar.getAttribute('data-max'));
        var pct = (w / max) * 100;

        setTimeout(function () {
          bar.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
          bar.style.width = pct + '%';
        }, index * 200);
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  observer.observe(powerSection);
}

/* ============================================================
   7. ACTIVE NAV LINK HIGHLIGHT
   Highlights the nav link for the section currently in view
   ============================================================ */
function initActiveNav() {
  var NAVBAR_HEIGHT = 70;
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href').slice(1);
      if (href === id) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, {
    rootMargin: '-' + NAVBAR_HEIGHT + 'px 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(function (section) { observer.observe(section); });
}

/* ============================================================
   8. QR CODES — generated client-side (offline, no network)
   Resolves absolute URLs from window.location so the codes work
   wherever the site is deployed. data-qr="page" encodes the demo
   page itself; data-qr="asset" encodes the file in data-asset.
   ============================================================ */
function initQRCodes() {
  var canvases = document.querySelectorAll('.qr-canvas');
  if (!canvases.length || typeof qrcode === 'undefined') return;

  // Strip query/hash so the demo-page code points at a clean URL.
  var pageUrl = window.location.origin + window.location.pathname;

  canvases.forEach(function (el) {
    var url;
    if (el.getAttribute('data-qr') === 'asset') {
      // Resolve the asset path against the current page to an absolute URL.
      url = new URL(el.getAttribute('data-asset'), pageUrl).href;
    } else {
      url = pageUrl;
    }

    var qr = qrcode(0, 'M');          // type 0 = auto-size, ECC level M
    qr.addData(url);
    qr.make();
    el.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
    el.setAttribute('title', url);
  });
}
