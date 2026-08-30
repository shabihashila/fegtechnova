/* ============================================================
   FEG TechNova - Scroll Animations & Interactions
   ============================================================ */

(function () {
  'use strict';

  // Flag to the stylesheet that JS is active. CSS keeps content
  // visible by default and only hides .feg-fade-in when this class
  // exists, so nothing can ever be stuck hidden.
  document.body.classList.add('feg-js');

  function initScrollAnimations() {
    var elements = document.querySelectorAll('.feg-fade-in');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initMobileNav() {
    var hamburger = document.querySelector('.feg-hamburger');
    var nav = document.querySelector('.feg-nav');
    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', function () {
      nav.classList.toggle('active');
      var spans = hamburger.querySelectorAll('span');
      if (nav.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  function initStickyHeader() {
    var header = document.querySelector('.feg-header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      var isLight = document.body.classList.contains('feg-light-theme');
      if (window.scrollY > 50) {
        header.style.background = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(5, 8, 16, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
      } else {
        header.style.background = isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(5, 8, 16, 0.72)';
        header.style.boxShadow = 'none';
      }
    });
  }

  function initActiveNav() {
    var links = document.querySelectorAll('.feg-nav-link');
    if (!links.length) return;
    var path = window.location.pathname.replace(/\/+$/, '');
    var pathSegs = path.split('/').filter(Boolean);

    links.forEach(function (link) {
      var hrefPath = (link.getAttribute('href') || '/').replace(/\/+$/, '');
      var hrefSegs = hrefPath.split('/').filter(Boolean);

      var isSubPath = hrefSegs.length > 0 &&
        pathSegs.length >= hrefSegs.length &&
        hrefSegs.every(function (seg, i) { return pathSegs[i] === seg; });

      var isExact = isSubPath && hrefSegs.length === pathSegs.length;
      var isSection = isSubPath && hrefSegs.length > 1 && hrefSegs.length < pathSegs.length;

      if (isExact || isSection) {
        link.classList.add('active');
      }
    });
  }

  function initThemeToggle() {
    var toggle = document.getElementById('feg-theme-toggle');
    if (!toggle) return;

    var saved = null;
    try { saved = localStorage.getItem('feg-theme'); } catch (e) {}

    if (saved === 'light') {
      document.body.classList.add('feg-light-theme');
    }

    toggle.addEventListener('click', function () {
      var isLight = document.body.classList.toggle('feg-light-theme');
      try { localStorage.setItem('feg-theme', isLight ? 'light' : 'dark'); } catch (e) {}
    });
  }

  function initParticles() {
    var canvas = document.getElementById('feg-particles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var count = 40;
    var isHero = canvas.classList.contains('feg-particles--hero');

    function resize() {
      if (isHero) {
        var parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.3 + 0.1
      });
    }

    function animate() {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 210, 255, ' + p.alpha + ')';
        ctx.fill();
      });

      // Draw connections
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(0, 210, 255, ' + (0.06 * (1 - dist / 150)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
    animate();
  }

  function initMegaMenu() {
    var items = document.querySelectorAll('.feg-nav-item.feg-has-mega, .feg-nav-item.feg-has-dropdown');
    if (!items.length) return;

    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var hamburger = document.querySelector('.feg-hamburger');

    function setOpen(item, open) {
      var trigger = item.querySelector(':scope > .feg-nav-link');
      item.classList.toggle('open', open);
      if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    items.forEach(function (item) {
      var trigger = item.querySelector(':scope > .feg-nav-link');
      if (!trigger) return;

      // Hover devices: CSS handles reveal, JS keeps aria state synced.
      item.addEventListener('mouseenter', function () {
        if (canHover) setOpen(item, true);
      });

      item.addEventListener('mouseleave', function () {
        if (canHover) setOpen(item, false);
      });

      // Touch / no-hover devices: first tap opens, second navigates.
      trigger.addEventListener('click', function (e) {
        if (canHover || item.classList.contains('open')) return;
        e.preventDefault();
        items.forEach(function (other) {
          if (other !== item) setOpen(other, false);
        });
        setOpen(item, true);
      });

      // Close when focus leaves the item entirely (keyboard nav).
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) setOpen(item, false);
      });

      // Close on outside click.
      document.addEventListener('click', function (e) {
        if (!item.contains(e.target)) setOpen(item, false);
      });

      // Close on Escape and restore focus to the trigger.
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && item.classList.contains('open')) {
          setOpen(item, false);
          trigger.focus();
        }
      });
    });

    // Closing the mobile drawer also closes any expanded mega menu.
    if (hamburger) {
      hamburger.addEventListener('click', function () {
        items.forEach(function (item) { setOpen(item, false); });
      });
    }

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && !canHover) {
        items.forEach(function (item) { setOpen(item, false); });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initScrollAnimations();
      initMobileNav();
      initStickyHeader();
      initParticles();
      initThemeToggle();
      initActiveNav();
      initMegaMenu();
    });
  } else {
    initScrollAnimations();
    initMobileNav();
    initStickyHeader();
    initParticles();
    initThemeToggle();
    initActiveNav();
    initMegaMenu();
  }

  /* Safety net: force all .feg-fade-in visible after 1s
     in case IntersectionObserver never fires. */
  setTimeout(function () {
    document.querySelectorAll('.feg-fade-in:not(.visible)').forEach(function (el) {
      el.classList.add('visible');
    });
  }, 1000);
})();