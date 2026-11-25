/**
 * Airwin Cargo Replica — Interactive Enhancement & Smooth Scroll Engine
 * Unlocks body scrolling while PRESERVING CSS position:sticky,
 * dismisses loader, powers live clocks, modals & FAQ accordions.
 */

(function () {
  'use strict';

  // Mark session as loaded so main.js loader finishes swiftly
  try {
    sessionStorage.setItem('isLoaded', 'true');
  } catch (e) {}

  // === MOBILE SCROLL SNAP PREVENTION GUARD ===
  // Prevents unwanted programmatic scrollTo(0,0) resets on mobile (<= 991px)
  // during user scrolling, touch momentum, or resize observer triggers.
  // Desktop view (> 991px) remains 100% UNTOUCHED.
  let lastUserTapTime = 0;
  let isNavigatingNewPage = false;

  window.addEventListener('click', function (e) {
    const target = e.target;
    if (target && target.closest && (
      target.closest('.header-logo-link') ||
      target.closest('.logo') ||
      target.closest('[data-scroll-to-top]') ||
      target.closest('.back-to-top')
    )) {
      lastUserTapTime = Date.now();
    }
  }, { capture: true, passive: true });

  if (window.barba) {
    try {
      window.barba.hooks.beforeEnter(() => {
        isNavigatingNewPage = true;
        setTimeout(() => { isNavigatingNewPage = false; }, 800);
      });
    } catch (e) {}
  }

  const origWindowScrollTo = window.scrollTo;
  window.scrollTo = function (...args) {
    const isMobile = (window.innerWidth <= 991);
    if (isMobile) {
      let targetY = 0;
      if (typeof args[0] === 'object' && args[0] !== null) {
        targetY = (typeof args[0].top === 'number') ? args[0].top : 0;
      } else if (typeof args[1] === 'number') {
        targetY = args[1];
      }
      const currentY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
      const isRecentUserTap = (Date.now() - lastUserTapTime < 1000);

      // Block unintended programmatic reset to top on mobile while user is scrolled down
      if (currentY > 60 && (targetY === 0 || targetY < 50) && !isRecentUserTap && !isNavigatingNewPage) {
        return;
      }
    }
    return origWindowScrollTo.apply(this, args);
  };

  if (window.innerWidth <= 991 && 'scrollRestoration' in history) {
    try {
      history.scrollRestoration = 'auto';
    } catch (e) {}
  }

  // 1. SCROLL UNLOCK & RESTORATION (PRESERVING STICKY POSITIONING)
  function unlockScroll() {
    // CRITICAL: Use overflow-x: clip (NOT hidden!) so position:sticky works on child elements
    document.documentElement.style.setProperty('overflow-x', 'clip', 'important');
    document.documentElement.style.setProperty('overflow-y', 'auto', 'important');
    
    document.body.style.setProperty('overflow-x', 'clip', 'important');
    document.body.style.setProperty('overflow-y', 'visible', 'important');
    document.body.style.setProperty('position', 'static', 'important');
    document.body.style.setProperty('height', 'auto', 'important');
    document.body.style.setProperty('max-height', 'none', 'important');
    document.body.style.setProperty('inset', 'auto', 'important');

    const bodyInner = document.querySelector('.body-inner');
    if (bodyInner) {
      bodyInner.style.setProperty('position', 'static', 'important');
      bodyInner.style.setProperty('height', 'auto', 'important');
      bodyInner.style.setProperty('overflow', 'visible', 'important');
    }

    // Trigger ScrollTrigger update / Lenis resize without tearing down section animations
    if (window.ScrollTrigger) {
      try { window.ScrollTrigger.refresh(); } catch (e) {}
    }
    if (window.lenis) {
      try { window.lenis.resize(); } catch (e) {}
    }
  }

  // 2. LOADER DISMISS & SMOOTH REVEAL
  function initLoader() {
    const loader = document.querySelector('.loader');
    const hiddenElements = document.querySelectorAll('[data-init-hidden]');

    if (loader) {
      if (!loader.querySelector('.airwin-loader-screen')) {
        const screen = document.createElement('div');
        screen.className = 'airwin-loader-screen';
        screen.innerHTML = '<div class="airwin-loader-brand">AIRWIN LOGISTICS</div>';
        loader.prepend(screen);
      }
    }

    function revealPage() {
      if (loader) {
        loader.classList.add('is-dismissed');
        setTimeout(() => {
          loader.classList.add('is-hidden');
          loader.style.setProperty('display', 'none', 'important');
        }, 550);
      }
      hiddenElements.forEach((el) => {
        el.style.setProperty('transition', 'opacity 0.8s ease');
        el.style.setProperty('opacity', '1', 'important');
        el.style.display = '';
      });
      unlockScroll();
    }

    if (loader) {
      setTimeout(revealPage, 600);
    } else {
      revealPage();
    }
  }

  // 3. LIVE APAC TIMEZONE CLOCKS
  function initLiveClocks() {
    function updateTimes() {
      const now = new Date();

      const timezones = {
        delhi: 'Asia/Kolkata',
        dubai: 'Asia/Dubai',
        bangalore: 'Asia/Kolkata',
        cochin: 'Asia/Kolkata',
        singapore: 'Asia/Singapore',
        london: 'Europe/London',
        sydney: 'Australia/Sydney',
        melbourne: 'Australia/Melbourne',
      };

      document.querySelectorAll('[data-timezone]').forEach((el) => {
        const tzKey = el.getAttribute('data-timezone');
        const tz = timezones[tzKey] || 'UTC';
        try {
          const formatted = new Intl.DateTimeFormat('en-GB', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(now);
          el.textContent = formatted;
        } catch (e) {}
      });
    }

    updateTimes();
    setInterval(updateTimes, 1000);
  }

  // 4. HEADER SCROLL & MOBILE MENU
  function initNavigation() {
    const header = document.getElementById('airwin-main-header') || document.querySelector('header.header') || document.querySelector('.header');
    if (!header) return;

    // Ensure initial visibility and reset hidden state
    header.classList.remove('nav-hidden');
    header.classList.add('nav-visible');

    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let ticking = false;

    function handleScroll() {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const diff = currentScrollY - lastScrollY;

      if (currentScrollY <= 40) {
        // At the very top: always visible and transparent
        header.classList.remove('nav-hidden');
        header.classList.add('nav-visible');
      } else if (diff > 6 && currentScrollY > 80) {
        // Scrolling DOWN: smoothly hide navbar
        header.classList.add('nav-hidden');
        header.classList.remove('nav-visible');
      } else if (diff < -6) {
        // Scrolling UP: smoothly reveal navbar
        header.classList.remove('nav-hidden');
        header.classList.add('nav-visible');
      }

      lastScrollY = Math.max(0, currentScrollY);
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });

    // Handle clicks smoothly: if clicking link to current page, smooth scroll to top
    header.querySelectorAll('.nav-link-item').forEach(link => {
      link.addEventListener('click', () => {
        document.querySelectorAll('.nav-link-item').forEach(l => l.classList.remove('w--current', 'active'));
        link.classList.add('w--current', 'active');
      });
    });

    header.querySelectorAll('.header-row-nav a, .nav-link-item, .header-tracking-btn, .header-logo-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:')) return;

        const currentPath = window.location.pathname.toLowerCase();
        const targetHref = href.toLowerCase();
        const isCurrentPage = (
          (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '') && (targetHref.includes('index.html') || targetHref === '/' || targetHref === './')
        ) || (
          currentPath.includes('about') && targetHref.includes('about')
        ) || (
          currentPath.includes('services') && targetHref.includes('services')
        ) || (
          (currentPath.includes('insights') || currentPath.includes('news')) && targetHref.includes('insights')
        ) || (
          (currentPath.includes('career') || currentPath.includes('careers')) && targetHref.includes('career')
        ) || (
          currentPath.includes('contact') && targetHref.includes('contact')
        );

        if (isCurrentPage) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // For other pages: allow standard browser / Barba navigation without interference
      });
    });

    if (window.barba) {
      try {
        window.barba.hooks.afterEnter(() => {
          header.classList.remove('nav-hidden');
          header.classList.add('nav-visible');
        });
      } catch (e) {}
    }

    // === MOBILE NAVBAR HAMBURGER & NAVIGATION DRAWER ===
    // In mobile view (<= 991px), places hamburger icon directly beside the Tracking button.
    // Desktop view (> 991px) remains 100% untouched with hamburger completely hidden.
    (function setupMobileNavbar() {
      // 1. Inject responsive CSS if not already present
      if (!document.getElementById('airwin-mobile-nav-style')) {
        const style = document.createElement('style');
        style.id = 'airwin-mobile-nav-style';
        style.textContent = `
          /* Desktop: hide mobile hamburger and mobile drawer */
          @media (min-width: 992px) {
            .header-hamburger-btn,
            #airwin-nav-toggle,
            .airwin-mobile-drawer,
            #airwin-mobile-drawer {
              display: none !important;
            }
          }

          @media (max-width: 991px) {
            .header-inner {
              position: relative !important;
              z-index: 1005 !important;
            }
            .header-nav-actions {
              display: flex !important;
              align-items: center !important;
              gap: 0.8rem !important;
              margin-left: auto !important;
            }
            .header-tracking-btn {
              display: inline-flex !important;
              padding: 0.7rem 1.6rem !important;
              font-size: 1.1rem !important;
              font-weight: 600 !important;
              letter-spacing: 0.05em !important;
              border-radius: 9999px !important;
            }
            .header-hamburger-btn,
            #airwin-nav-toggle {
              display: inline-flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
              gap: 4.5px !important;
              width: 38px !important;
              height: 38px !important;
              padding: 0 !important;
              background: rgba(0, 0, 0, 0.04) !important;
              border: 1px solid rgba(0, 0, 0, 0.09) !important;
              border-radius: 8px !important;
              cursor: pointer !important;
              outline: none !important;
              flex-shrink: 0 !important;
              z-index: 1005 !important;
              position: relative !important;
              transition: background-color 0.2s ease, border-color 0.2s ease !important;
              -webkit-tap-highlight-color: transparent !important;
            }
            .header-hamburger-btn:hover,
            .header-hamburger-btn:active,
            .header-hamburger-btn.is-active {
              background: rgba(0, 119, 238, 0.08) !important;
              border-color: rgba(0, 119, 238, 0.3) !important;
            }
            .header-hamburger-btn .hamburger-line {
              display: block !important;
              width: 18px !important;
              height: 2px !important;
              background-color: #111111 !important;
              border-radius: 2px !important;
              transform-origin: center !important;
              transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, background-color 0.2s ease !important;
            }
            .header-hamburger-btn.is-active .hamburger-line {
              background-color: #0077ee !important;
            }
            .header-hamburger-btn.is-active .line-1 {
              transform: translateY(6.5px) rotate(45deg) !important;
            }
            .header-hamburger-btn.is-active .line-2 {
              opacity: 0 !important;
              transform: scaleX(0) !important;
            }
            .header-hamburger-btn.is-active .line-3 {
              transform: translateY(-6.5px) rotate(-45deg) !important;
            }

            /* Full Mobile Navigation Drawer */
            .airwin-mobile-drawer {
              display: block !important;
              position: fixed !important;
              inset: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              z-index: 1000 !important;
              pointer-events: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
              transition: opacity 0.28s ease, visibility 0.28s ease !important;
            }
            .airwin-mobile-drawer.is-open {
              pointer-events: auto !important;
              opacity: 1 !important;
              visibility: visible !important;
            }
            .airwin-mobile-drawer-backdrop {
              position: absolute !important;
              inset: 0 !important;
              background: rgba(0, 0, 0, 0.45) !important;
              backdrop-filter: blur(5px) !important;
              -webkit-backdrop-filter: blur(5px) !important;
            }
            .airwin-mobile-drawer-content {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              background: #ffffff !important;
              padding: 68px 22px 28px 22px !important;
              box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16) !important;
              border-bottom-left-radius: 20px !important;
              border-bottom-right-radius: 20px !important;
              transform: translateY(-100%) !important;
              transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1) !important;
              max-height: 85vh !important;
              overflow-y: auto !important;
            }
            .airwin-mobile-drawer.is-open .airwin-mobile-drawer-content {
              transform: translateY(0) !important;
            }
            .airwin-mobile-nav-menu {
              display: flex !important;
              flex-direction: column !important;
              gap: 2px !important;
              margin-top: 10px !important;
            }
            .mobile-nav-item {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              padding: 13px 14px !important;
              font-size: 1.25rem !important;
              font-weight: 600 !important;
              letter-spacing: 0.02em !important;
              color: #1a1a1a !important;
              text-decoration: none !important;
              border-radius: 10px !important;
              border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
              transition: background-color 0.2s ease, color 0.2s ease, padding-left 0.2s ease !important;
            }
            .mobile-nav-item:hover,
            .mobile-nav-item.active,
            .mobile-nav-item.w--current {
              background-color: rgba(0, 119, 238, 0.08) !important;
              color: #0077ee !important;
              padding-left: 18px !important;
            }
            .mobile-nav-item::after {
              content: '→' !important;
              font-size: 1.2rem !important;
              opacity: 0.35 !important;
              transition: opacity 0.2s ease, transform 0.2s ease !important;
            }
            .mobile-nav-item:hover::after,
            .mobile-nav-item.active::after,
            .mobile-nav-item.w--current::after {
              opacity: 1 !important;
              color: #0077ee !important;
              transform: translateX(3px) !important;
            }
            .mobile-drawer-footer {
              margin-top: 18px !important;
              padding-top: 14px !important;
              border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 10px !important;
            }
            .mobile-drawer-track-btn {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              width: 100% !important;
              padding: 12px !important;
              border-radius: 10px !important;
              background: #0077ee !important;
              color: #ffffff !important;
              font-weight: 600 !important;
              font-size: 1.15rem !important;
              text-transform: uppercase !important;
              letter-spacing: 0.06em !important;
              text-decoration: none !important;
              box-shadow: 0 4px 14px rgba(0, 119, 238, 0.35) !important;
            }
          }

          @media (max-width: 767px) {
            .header-tracking-btn {
              padding: 0.65rem 1.4rem !important;
              font-size: 1.05rem !important;
            }
          }
        `;
        document.head.appendChild(style);
      }

      // 2. Ensure hamburger button sits inside .header-nav-actions right beside tracking button
      const navActions = header.querySelector('.header-nav-actions');
      if (navActions) {
        let hamburgerBtn = navActions.querySelector('.header-hamburger-btn');
        if (!hamburgerBtn) {
          hamburgerBtn = document.createElement('button');
          hamburgerBtn.className = 'header-hamburger-btn';
          hamburgerBtn.id = 'airwin-nav-toggle';
          hamburgerBtn.setAttribute('aria-label', 'Toggle navigation menu');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          hamburgerBtn.setAttribute('type', 'button');
          hamburgerBtn.innerHTML = `
            <span class="hamburger-line line-1"></span>
            <span class="hamburger-line line-2"></span>
            <span class="hamburger-line line-3"></span>
          `;
          navActions.appendChild(hamburgerBtn);
        }

        // 3. Ensure mobile drawer exists in header
        let drawer = header.querySelector('.airwin-mobile-drawer') || document.getElementById('airwin-mobile-drawer');
        if (!drawer) {
          drawer = document.createElement('div');
          drawer.className = 'airwin-mobile-drawer';
          drawer.id = 'airwin-mobile-drawer';
          drawer.setAttribute('aria-hidden', 'true');
          drawer.innerHTML = `
            <div class="airwin-mobile-drawer-backdrop" id="airwin-drawer-backdrop"></div>
            <div class="airwin-mobile-drawer-content">
              <nav class="airwin-mobile-nav-menu">
                <a href="/index.html" class="mobile-nav-item">Home</a>
                <a href="/about.html" class="mobile-nav-item">About</a>
                <a href="/services.html" class="mobile-nav-item">Services</a>
                <a href="/insights.html" class="mobile-nav-item">News &amp; Updates</a>
                <a href="/careers.html" class="mobile-nav-item">Career</a>
                <a href="/contact.html" class="mobile-nav-item">Contact</a>
              </nav>
              <div class="mobile-drawer-footer">
                <a href="/tracking.html" class="mobile-drawer-track-btn">Track Shipment</a>
              </div>
            </div>
          `;
          header.appendChild(drawer);
        }

        // 4. Open / Close controllers
        function openDrawer() {
          if (!drawer || !hamburgerBtn) return;
          drawer.classList.add('is-open');
          drawer.setAttribute('aria-hidden', 'false');
          hamburgerBtn.classList.add('is-active');
          hamburgerBtn.setAttribute('aria-expanded', 'true');
          header.classList.remove('nav-hidden');
          header.classList.add('nav-visible');
          document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
          if (!drawer || !hamburgerBtn) return;
          drawer.classList.remove('is-open');
          drawer.setAttribute('aria-hidden', 'true');
          hamburgerBtn.classList.remove('is-active');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }

        if (!hamburgerBtn._airwinBound) {
          hamburgerBtn._airwinBound = true;
          hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (drawer.classList.contains('is-open')) {
              closeDrawer();
            } else {
              openDrawer();
            }
          });
        }

        const backdrop = drawer.querySelector('.airwin-mobile-drawer-backdrop');
        if (backdrop && !backdrop._airwinBound) {
          backdrop._airwinBound = true;
          backdrop.addEventListener('click', closeDrawer);
        }

        // Close on escape
        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
            closeDrawer();
          }
        });

        // Close when clicking any nav item in drawer
        drawer.querySelectorAll('.mobile-nav-item, .mobile-drawer-track-btn').forEach(link => {
          if (!link._airwinBound) {
            link._airwinBound = true;
            link.addEventListener('click', () => {
              closeDrawer();
            });
          }
        });

        // Active link highlighting
        function updateMobileActiveLinks() {
          if (!drawer) return;
          const path = window.location.pathname.toLowerCase();
          drawer.querySelectorAll('.mobile-nav-item').forEach(link => {
            const href = (link.getAttribute('href') || '').toLowerCase();
            let isMatch = false;
            if ((path === '/' || path.endsWith('/index.html') || path === '') && (href.includes('index.html') || href === '/')) {
              isMatch = true;
            } else if (path.includes('about') && href.includes('about')) {
              isMatch = true;
            } else if (path.includes('service') && href.includes('service')) {
              isMatch = true;
            } else if ((path.includes('insight') || path.includes('news')) && href.includes('insight')) {
              isMatch = true;
            } else if (path.includes('career') && href.includes('career')) {
              isMatch = true;
            } else if (path.includes('contact') && href.includes('contact')) {
              isMatch = true;
            }
            if (isMatch) {
              link.classList.add('w--current', 'active');
            } else {
              link.classList.remove('w--current', 'active');
            }
          });
        }
        updateMobileActiveLinks();

        if (window.barba) {
          try {
            window.barba.hooks.afterEnter(() => {
              closeDrawer();
              updateMobileActiveLinks();
            });
          } catch (e) {}
        }
      }
    })();
  }

  function initFAQ() {
    const faqItems = document.querySelectorAll('.home-faq-item, .faq-item');
    faqItems.forEach((item) => {
      const question = item.querySelector('.home-faq-question, .faq-question, h3, h4');
      const answer = item.querySelector('.home-faq-answer, .faq-answer, .home-faq-content');

      if (question && answer) {
        question.style.cursor = 'pointer';
        question.addEventListener('click', () => {
          const isOpen = item.classList.contains('active') || item.classList.contains('is-open');

          faqItems.forEach((other) => {
            if (other !== item) {
              other.classList.remove('active', 'is-open');
              const otherAns = other.querySelector('.home-faq-answer, .faq-answer, .home-faq-content');
              if (otherAns) otherAns.style.maxHeight = null;
            }
          });

          if (!isOpen) {
            item.classList.add('active', 'is-open');
            answer.style.maxHeight = answer.scrollHeight + 'px';
          } else {
            item.classList.remove('active', 'is-open');
            answer.style.maxHeight = null;
          }
        });
      }
    });
  }

  // 6. INTERACTIVE MODALS (TRACKING & CARBON CALCULATOR)
  function initModals() {
    const style = document.createElement('style');
    style.textContent = `
      .uc-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(17, 17, 17, 0.85);
        backdrop-filter: blur(8px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        padding: 1.5rem;
      }
      .uc-modal-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
      .uc-modal-box {
        background: #111;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        width: 100%;
        max-width: 650px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2.5rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        position: relative;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .uc-modal-close {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        background: transparent;
        border: 1px solid rgba(255,255,255,0.2);
        color: #fff;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .uc-modal-close:hover {
        background: #f50;
        border-color: #f50;
      }
      .uc-tag-badge {
        font-family: monospace;
        font-size: 0.75rem;
        color: #f50;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.75rem;
        display: inline-block;
      }
      .uc-modal-title {
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        letter-spacing: -0.02em;
        color: #fff;
      }
      .uc-form-group {
        margin-bottom: 1.25rem;
      }
      .uc-form-group label {
        display: block;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: rgba(255,255,255,0.6);
        margin-bottom: 0.5rem;
      }
      .uc-input {
        width: 100%;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.15);
        color: #fff;
        padding: 0.85rem 1rem;
        font-size: 0.95rem;
        outline: none;
        transition: border 0.2s;
      }
      .uc-input:focus {
        border-color: #0016cb;
      }
      .uc-btn-action {
        width: 100%;
        background: #0016cb;
        color: #fff;
        border: none;
        padding: 1rem;
        font-size: 0.9rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
        transition: background 0.2s;
        margin-top: 1rem;
      }
      .uc-btn-action:hover {
        background: #f50;
      }
      .uc-timeline {
        margin-top: 2rem;
        border-left: 2px solid rgba(255,255,255,0.15);
        padding-left: 1.5rem;
      }
      .uc-timeline-step {
        position: relative;
        margin-bottom: 1.5rem;
      }
      .uc-timeline-step::before {
        content: '';
        position: absolute;
        left: -1.95rem;
        top: 0.2rem;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
      }
      .uc-timeline-step.done::before {
        background: #0016cb;
        box-shadow: 0 0 8px #0016cb;
      }
      .uc-timeline-step.active::before {
        background: #f50;
        box-shadow: 0 0 10px #f50;
      }
    `;
    document.head.appendChild(style);

    const trackingModal = document.createElement('div');
    trackingModal.className = 'uc-modal-overlay';
    trackingModal.id = 'uc-tracking-modal';
    trackingModal.innerHTML = `
      <div class="uc-modal-box">
        <button class="uc-modal-close" aria-label="Close">&times;</button>
        <span class="uc-tag-badge">WebTracker // Real-Time Visibility</span>
        <h3 class="uc-modal-title">Airwin AWB Consignment Tracking</h3>
        <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 1.5rem;">
          Enter your Master Air Waybill (MAWB), Ocean Bill of Lading (B/L), or Container ID to access live vessel/flight milestone telemetry.
        </p>
        <div class="uc-form-group">
          <label>Tracking Number / AWB / B/L</label>
          <input type="text" class="uc-input" id="uc-tracking-input" placeholder="e.g. UC-78942-APAC or MSKU9281720" value="UC-892410-APAC">
        </div>
        <button class="uc-btn-action" id="uc-tracking-submit">Search Telemetry</button>
        
        <div id="uc-tracking-result" style="margin-top: 2rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 1.25rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <strong style="color: #fff; font-size: 1rem;">STATUS: IN TRANSIT</strong>
              <span style="color: #f50; font-family: monospace; font-size: 0.85rem;">ETA: 2 DAYS</span>
            </div>
            <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">
              Routing: <strong>SHANGHAI (PVG)</strong> &rarr; <strong>SYDNEY (SYD)</strong> | 40ft HQ Container
            </div>
          </div>
          
          <div class="uc-timeline">
            <div class="uc-timeline-step done">
              <strong style="color: #fff; font-size: 0.9rem;">Booking Confirmed & Allocation Secured</strong>
              <div style="font-size: 0.78rem; color: rgba(255,255,255,0.5);">Shanghai Operations Centre &bull; Oct 28, 08:30 CST</div>
            </div>
            <div class="uc-timeline-step done">
              <strong style="color: #fff; font-size: 0.9rem;">Export Customs Cleared & Loaded On Vessel</strong>
              <div style="font-size: 0.78rem; color: rgba(255,255,255,0.5);">Yangshan Deepwater Port, China &bull; Oct 30, 14:15 CST</div>
            </div>
            <div class="uc-timeline-step active">
              <strong style="color: #f50; font-size: 0.9rem;">Ocean Transit &mdash; Coral Sea En Route to Port Botany</strong>
              <div style="font-size: 0.78rem; color: rgba(255,255,255,0.7);">Current Coordinates: 18.24°S, 154.12°E &bull; Speed: 19.4 knots</div>
            </div>
            <div class="uc-timeline-step">
              <strong style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">Import Customs Clearance & Quarantine Inspection</strong>
              <div style="font-size: 0.78rem; color: rgba(255,255,255,0.4);">Sydney Wharf, Australia &bull; Scheduled Nov 07</div>
            </div>
            <div class="uc-timeline-step">
              <strong style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">Final-Mile Land Transport & Warehouse Handover</strong>
              <div style="font-size: 0.78rem; color: rgba(255,255,255,0.4);">Scheduled Delivery to Client Logistics Facility</div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(trackingModal);

    const carbonModal = document.createElement('div');
    carbonModal.className = 'uc-modal-overlay';
    carbonModal.id = 'uc-carbon-modal';
    carbonModal.innerHTML = `
      <div class="uc-modal-box">
        <button class="uc-modal-close" aria-label="Close">&times;</button>
        <span class="uc-tag-badge">Green Logistics // CarbonCare Standard</span>
        <h3 class="uc-modal-title">CO₂e Emissions Calculator</h3>
        <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 1.5rem;">
          Estimate greenhouse gas emissions across your freight movements and access carbon-offset pathways.
        </p>
        <div class="uc-form-group">
          <label>Transport Mode</label>
          <select class="uc-input" id="uc-carbon-mode" style="background:#222; cursor:pointer;">
            <option value="air">Air Freight (0.500 kg CO₂e / ton-km)</option>
            <option value="ocean" selected>Ocean Freight (0.015 kg CO₂e / ton-km)</option>
            <option value="road">Interstate Road Transport (0.080 kg CO₂e / ton-km)</option>
            <option value="rail">Domestic Rail Freight (0.025 kg CO₂e / ton-km)</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="uc-form-group">
            <label>Distance (km)</label>
            <input type="number" class="uc-input" id="uc-carbon-dist" value="8500">
          </div>
          <div class="uc-form-group">
            <label>Cargo Weight (Metric Tons)</label>
            <input type="number" class="uc-input" id="uc-carbon-weight" value="12">
          </div>
        </div>
        <button class="uc-btn-action" id="uc-carbon-calc-btn">Compute Emissions</button>
        
        <div id="uc-carbon-result" style="margin-top: 1.5rem; background: rgba(0, 22, 203, 0.15); border: 1px solid #0016cb; padding: 1.25rem;">
          <div style="font-size: 0.8rem; text-transform: uppercase; color: rgba(255,255,255,0.7);">Estimated Footprint:</div>
          <div style="font-size: 2.2rem; font-weight: 700; color: #fff; margin: 0.5rem 0;" id="uc-carbon-value">1.530 t CO₂e</div>
          <div style="font-size: 0.85rem; color: #f50;">Offset equivalent: ~76 mature trees planted for 100% net-zero neutrality.</div>
        </div>
      </div>
    `;
    document.body.appendChild(carbonModal);

    function bindTriggers() {
      document.querySelectorAll('a[href*="webtracker"], a[href*="Login.aspx"], [data-tracking-trigger]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          trackingModal.classList.add('active');
        });
      });

      document.querySelectorAll('a[href*="carboncare"], [data-carbon-trigger]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          carbonModal.classList.add('active');
        });
      });

      document.querySelectorAll('.uc-modal-close').forEach((btn) => {
        btn.addEventListener('click', () => {
          trackingModal.classList.remove('active');
          carbonModal.classList.remove('active');
        });
      });

      [trackingModal, carbonModal].forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            overlay.classList.remove('active');
          }
        });
      });

      const calcBtn = document.getElementById('uc-carbon-calc-btn');
      if (calcBtn) {
        calcBtn.addEventListener('click', () => {
          const mode = document.getElementById('uc-carbon-mode').value;
          const dist = parseFloat(document.getElementById('uc-carbon-dist').value) || 0;
          const weight = parseFloat(document.getElementById('uc-carbon-weight').value) || 0;
          const factors = { air: 0.5, ocean: 0.015, road: 0.08, rail: 0.025 };
          const factor = factors[mode] || 0.015;
          const emissionsTons = (dist * weight * factor) / 1000;
          const trees = Math.ceil(emissionsTons * 50);

          document.getElementById('uc-carbon-value').textContent = emissionsTons.toFixed(3) + ' t CO₂e';
          document.querySelector('#uc-carbon-result div:last-child').textContent =
            `Offset equivalent: ~${trees} mature trees planted for 100% net-zero neutrality.`;
        });
      }

      const trackBtn = document.getElementById('uc-tracking-submit');
      if (trackBtn) {
        trackBtn.addEventListener('click', () => {
          const code = (document.getElementById('uc-tracking-input').value || 'SHIPMENT').toUpperCase();
          const resultDiv = document.getElementById('uc-tracking-result');
          trackBtn.textContent = 'Querying Satellite Telemetry...';
          trackBtn.style.opacity = '0.7';

          setTimeout(() => {
            trackBtn.textContent = 'Search Telemetry';
            trackBtn.style.opacity = '1';
            resultDiv.querySelector('strong').textContent = `STATUS: IN TRANSIT [${code}]`;
          }, 600);
        });
      }
    }

    bindTriggers();
  }

  // 7. INITIALIZE ON DOM READY & WINDOW LOAD
  
  // 8. DYNAMIC SPEEDOMETER CONTROLLER (CRUISING VELOCITY TELEMETRY)
  function initDynamicSpeedometer() {
    const speedInner = document.querySelector('.home-service-speed-inner');
    const speedText = document.querySelector('.home-service-speed-inner [data-speed]');
    const serviceSection = document.querySelector('.home-service');
    const secondScreen = document.querySelector('.home-service-second-screen');
    const thirdScreen = document.querySelector('.home-service-third-screen');

    if (!speedInner || !speedText) return;

    let currentSpeed = 0;
    let targetSpeed = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let scrollTimeout = null;

    let inService = false;
    let isSpeedometerRafRunning = false;

    // Use IntersectionObserver instead of calling getBoundingClientRect 60fps
    const serviceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        inService = entry.isIntersecting;
        if (!inService) {
          speedInner.classList.remove('active', 'on-start');
          currentSpeed = 0;
          targetSpeed = 0;
          if (speedText.textContent !== '00') speedText.textContent = '00';
          isSpeedometerRafRunning = false;
        }
      });
    }, { rootMargin: '0px 0px -20% 0px' });
    serviceObserver.observe(serviceSection);

    function updateSpeedometer() {
      if (!inService) {
        isSpeedometerRafRunning = false;
        return;
      }

      currentSpeed += (targetSpeed - currentSpeed) * 0.12;
      if (currentSpeed < 0.5 && targetSpeed === 0) {
        currentSpeed = 0;
        if (speedText.textContent !== '00') speedText.textContent = '00';
        isSpeedometerRafRunning = false;
        return;
      }

      const displaySpeed = Math.round(currentSpeed);
      const formatted = displaySpeed.toString().padStart(2, '0');
      if (speedText.textContent !== formatted) {
        speedText.textContent = formatted;
      }

      requestAnimationFrame(updateSpeedometer);
    }

    window.addEventListener('scroll', () => {
      if (!inService) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastScrollTime);
      const dy = Math.abs(window.scrollY - lastScrollY);
      const velocity = (dy / dt) * 1000; // px/sec

      lastScrollY = window.scrollY;
      lastScrollTime = now;

      // Calculate realistic highway speed based on scroll velocity (45 - 88 km/h)
      const computed = Math.min(88, Math.max(42, Math.round(velocity * 0.045 + 40)));
      targetSpeed = computed;
      speedInner.classList.add('active', 'on-start');

      if (!isSpeedometerRafRunning) {
        isSpeedometerRafRunning = true;
        requestAnimationFrame(updateSpeedometer);
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetSpeed = 0;
      }, 180);
    }, { passive: true });
  }

  // 4. SCROLL & ANIMATION RESILIENCE ON HARD REFRESH / SLOW ASSETS
  function initScrollResilience() {
    function enforceVisibilityAndRefresh() {
      // 0. Clean up any orphan blog or footer elements outside the main Barba wrapper
      try {
        const barbaWrapper = document.querySelector('[data-barba="wrapper"]') || document.querySelector('.main');
        const activeContainer = document.querySelector('[data-barba="container"]');
        const namespace = activeContainer ? activeContainer.getAttribute('data-barba-namespace') : '';

        // If not on the homepage, the home blog section should never be displayed
        if (namespace && namespace !== 'home') {
          document.querySelectorAll('#our-blog, .airwin-blog-section').forEach(b => b.remove());
        }

        // Any footer outside the barbaWrapper is an orphan leftover
        if (barbaWrapper) {
          document.querySelectorAll('body > .footer-wrap, body > footer.footer').forEach(fw => {
            fw.remove();
          });
          document.querySelectorAll('.footer-wrap').forEach(fw => {
            if (!barbaWrapper.contains(fw)) {
              fw.remove();
            }
          });
        }
      } catch (e) {}

      // 1. Remove all data-init-hidden markers across document
      document.querySelectorAll('[data-init-hidden]').forEach(el => {
        el.removeAttribute('data-init-hidden');
      });

      // 2. Guarantee hero section text, title, and buttons are visible
      const heroTitle = document.querySelector('.home-hero-title .heading');
      if (heroTitle) {
        heroTitle.style.setProperty('opacity', '1', 'important');
        heroTitle.style.setProperty('visibility', 'visible', 'important');
        heroTitle.querySelectorAll('*').forEach(child => {
          child.style.setProperty('opacity', '1', 'important');
          child.style.setProperty('visibility', 'visible', 'important');
          child.style.setProperty('transform', 'none', 'important');
        });
      }
      const heroDesc = document.querySelector('.home-hero-desc');
      if (heroDesc) {
        heroDesc.style.setProperty('opacity', '1', 'important');
        heroDesc.style.setProperty('visibility', 'visible', 'important');
        heroDesc.querySelectorAll('*').forEach(child => {
          child.style.setProperty('opacity', '1', 'important');
          child.style.setProperty('visibility', 'visible', 'important');
          child.style.setProperty('transform', 'none', 'important');
        });
      }


      // 3. Force all partner logos to be visible unconditionally
      const partners = document.querySelectorAll('.home-partners-item');
      partners.forEach(item => {
        item.style.setProperty('opacity', '1', 'important');
        item.style.setProperty('visibility', 'visible', 'important');
        item.style.setProperty('transform', 'none', 'important');
      });

      // 4. Guarantee intro section text, numbers, and mosaic cards are visible
      const introDesc = document.querySelector('.home-intro-desc');
      if (introDesc) {
        introDesc.style.setProperty('opacity', '1', 'important');
        introDesc.style.setProperty('visibility', 'visible', 'important');
      }
      const introBtn = document.querySelector('.home-intro-btn');
      if (introBtn) {
        introBtn.style.setProperty('opacity', '1', 'important');
        introBtn.style.setProperty('visibility', 'visible', 'important');
      }
      const introLabel = document.querySelector('.home-intro-label');
      if (introLabel) {
        introLabel.style.setProperty('opacity', '1', 'important');
        introLabel.style.setProperty('visibility', 'visible', 'important');
      }
      document.querySelectorAll('.home-intro-stats-item').forEach(item => {
        item.style.setProperty('opacity', '1', 'important');
        item.style.setProperty('visibility', 'visible', 'important');
      });
      // Guarantee home service items and inner track visibility
      const serviceMain = document.querySelector('.home-service-main');
      if (serviceMain) {
        serviceMain.style.setProperty('opacity', '1', 'important');
        serviceMain.style.setProperty('visibility', 'visible', 'important');
      }
      const serviceInner = document.querySelector('.home-service-main-inner');
      if (serviceInner) {
        serviceInner.style.setProperty('opacity', '1', 'important');
        serviceInner.style.setProperty('visibility', 'visible', 'important');
      }
      document.querySelectorAll('.home-service-item').forEach(item => {
        item.style.setProperty('opacity', '1', 'important');
        item.style.setProperty('visibility', 'visible', 'important');
      });
      // Ensure all split-line-p text in intro and service are fully visible
      document.querySelectorAll('.home-intro .split-line-p, .home-service .split-line-p').forEach(line => {
        line.style.setProperty('--bg-progress', '100');
        line.style.setProperty('color', 'var(--color-final, inherit)');
      });

      // 5. Re-initialize mosaic cards layout & swing physics if elements exist
      if (typeof window.initServicesMosaic === 'function' && document.getElementById('services-mosaic-canvas')) {
        try { window.initServicesMosaic(); } catch (e) {}
      }
      // 5b. Re-initialize Hero Containers WebGL Shader (hover color-changing behavior)
      if (document.getElementById('hero-containers-canvas')) {
        if (typeof window.initContainersShader === 'function') {
          try { window.initContainersShader(); } catch (e) {}
        }
      }
      // 5c. Re-initialize Hero Video Scroll Animation (services page container loading)
      if (document.getElementById('airwin-hero-canvas')) {
        if (typeof window.initHeroVideoScrollAnimation === 'function') {
          try { window.initHeroVideoScrollAnimation(); } catch (e) {}
        }
      }
      // Guarantee home service icons are visible
      document.querySelectorAll('.home-service-item-ic').forEach(el => {
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('display', 'flex', 'important');
      });
      document.querySelectorAll('.home-service-item-ic img').forEach(el => {
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('display', 'block', 'important');
      });
      if (typeof window.initWhyChooseSwing === 'function' && document.getElementById('why-choose-swing-el')) {
        try { window.initWhyChooseSwing(); } catch (e) {}
      }

      // 6. Guarantee footer and wrapper are visible
      const footer = document.querySelector('.footer');
      if (footer) {
        footer.style.setProperty('display', 'block', 'important');
        footer.style.setProperty('visibility', 'visible', 'important');
        footer.style.setProperty('opacity', '1', 'important');
      }
      const footerWrap = document.querySelector('.footer-wrap');
      if (footerWrap) {
        footerWrap.style.setProperty('display', 'block', 'important');
        footerWrap.style.setProperty('visibility', 'visible', 'important');
        footerWrap.style.setProperty('opacity', '1', 'important');
      }

      // 7. Re-initialize wordmark interactive hover if present
      if (typeof window.initAirwinFooterWordmark === 'function') {
        try { window.initAirwinFooterWordmark(); } catch (e) {}
      }

      // 7b. Self-healing watchdog for home service truck & wheel animations
      const truckInner = document.querySelector('.home-service-truck-inner');
      if (truckInner && window.ScrollTrigger) {
        try {
          const triggers = window.ScrollTrigger.getAll();
          const hasServiceTrigger = triggers.some(st => {
            const el = st.trigger;
            return el && (
              (el.classList && (el.classList.contains('home-service-wrap') || el.classList.contains('home-service-second-screen'))) ||
              el.closest?.('.home-service-wrap')
            );
          });
          if (!hasServiceTrigger) {
            const container = document.querySelector('[data-barba="container"]') || document.querySelector('.main-inner') || document.body;
            if (container) {
              const detail = { next: { container: container, namespace: 'home' } };
              container.dispatchEvent(new CustomEvent('onceSetup', { detail: detail }));
              container.dispatchEvent(new CustomEvent('oncePlay', { detail: detail }));
            }
          }
        } catch (e) {}
      }

      // 8. Refresh GSAP ScrollTrigger if available (throttled to avoid layout thrashing)
      if (window.ScrollTrigger) {
        if (!window._lastSTRefresh || performance.now() - window._lastSTRefresh > 300) {
          window._lastSTRefresh = performance.now();
          try { window.ScrollTrigger.refresh(); } catch (e) {}
        }
      }

      // 9. Refresh Lenis smooth scroll if available
      if (window.lenis) {
        try { window.lenis.resize(); } catch (e) {}
      }
    }

    // Schedule single resilience sweep on initial load
    [150, 600].forEach(delay => {
      setTimeout(enforceVisibilityAndRefresh, delay);
    });

    window.addEventListener('load', enforceVisibilityAndRefresh);

    // Watch for Barba.js PJAX / SPA container mount without subtree thrashing
    try {
      const barbaWrapper = document.querySelector('[data-barba="wrapper"]') || document.querySelector('.main');
      if (barbaWrapper) {
        let refreshDebounce = null;
        const observer = new MutationObserver((mutations) => {
          let hasContainerChange = false;
          for (const m of mutations) {
            for (let i = 0; i < m.addedNodes.length; i++) {
              const node = m.addedNodes[i];
              if (node.nodeType === 1 && (
                node.getAttribute('data-barba') === 'container' ||
                (node.classList && node.classList.contains('main-inner'))
              )) {
                hasContainerChange = true;
                break;
              }
            }
            if (hasContainerChange) break;
          }
          if (hasContainerChange) {
            clearTimeout(refreshDebounce);
            refreshDebounce = setTimeout(() => {
              enforceVisibilityAndRefresh();
            }, 100);
          }
        });
        observer.observe(barbaWrapper, { childList: true, subtree: false });
      }
    } catch (e) {}

    // Back / Forward browser navigation
    window.addEventListener('popstate', () => {
      setTimeout(enforceVisibilityAndRefresh, 80);
    });
  }

  
  // =========================================================
  // HERO VIDEO SCROLL ANIMATION (CONTAINER LOADING ONTO TRUCK)
  // Non-blocking, frame-by-frame scrub with persistent frame cache
  // =========================================================
  const globalHeroVideoFrames = window.__airwinHeroVideoFrames || [];
  window.__airwinHeroVideoFrames = globalHeroVideoFrames;
  let hasStartedFramePreload = false;

  function preloadHeroVideoFrames() {
    if (hasStartedFramePreload) return;
    hasStartedFramePreload = true;

    const total = 118;
    for (let i = 0; i < total; i++) {
      if (!globalHeroVideoFrames[i]) {
        const img = new Image();
        const num = String(i).padStart(4, '0');
        img.src = '/assets/hero-video-frames/frame_' + num + '.webp';
        globalHeroVideoFrames[i] = img;
      }
    }
  }

  window.initHeroVideoScrollAnimation = function initHeroVideoScrollAnimation() {
    const canvas = document.getElementById('airwin-hero-canvas');
    if (!canvas) return;

    // Start background preloading of all frames once
    preloadHeroVideoFrames();

    const ctx = canvas.getContext('2d');
    const totalFrames = 118;
    let currentFrame = 0;
    let targetFrame = 0;
    let lastRenderedFrame = -1;
    let isVideoRafRunning = false;

    function resizeCanvas() {
      let w = window.innerWidth;
      let h = window.innerHeight;
      if (window.innerWidth <= 991) {
        // MOBILE: size canvas to its actual container bounds (or 16:9 natural ratio)
        const rect = canvas.getBoundingClientRect();
        w = Math.round(rect.width) || window.innerWidth;
        h = Math.round(rect.height) || Math.round(w * (720 / 1280));
      }
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        lastRenderedFrame = -1;
        drawFrame(Math.round(currentFrame));
      }
    }

    function drawFrame(idx) {
      const frameIdx = Math.max(0, Math.min(totalFrames - 1, idx));
      let img = globalHeroVideoFrames[frameIdx];
      if (!img || !img.complete || img.naturalWidth === 0) {
        img = globalHeroVideoFrames[0];
      }
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const w = canvas.width || window.innerWidth;
      const h = canvas.height || window.innerHeight;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      if (window.innerWidth <= 991) {
        // === MOBILE VIEW OPTIMIZATION (Mobile/Tablet <= 991px) ===
        // On mobile, canvas is compact 16:9 directly under navbar.
        // Scale video cleanly across width with pure white studio fill.
        const scale = w / imgW;
        const drawW = w;
        const drawH = Math.round(imgH * scale);
        const drawX = 0;
        const drawY = Math.round((h - drawH) / 2);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        // === DESKTOP VIEW (EXACT ORIGINAL LOGIC - 100% UNTOUCHED) ===
        const scale = Math.max(w / imgW, h / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = (w - drawW) / 2;
        const drawY = (h - drawH) / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
    }

    // Force immediate sizing
    resizeCanvas();

    // Ensure frame 0 is drawn immediately
    if (globalHeroVideoFrames[0] && globalHeroVideoFrames[0].complete && globalHeroVideoFrames[0].naturalWidth > 0) {
      drawFrame(0);
    } else {
      const first = new Image();
      first.onload = function() {
        globalHeroVideoFrames[0] = first;
        resizeCanvas();
        drawFrame(0);
      };
      first.src = '/assets/hero-video-frames/frame_0000.webp';
      if (first.complete && first.naturalWidth > 0) {
        globalHeroVideoFrames[0] = first;
        resizeCanvas();
        drawFrame(0);
      }
    }

    let cachedHeroHeight = 0;
    function updateHeroHeight() {
      const heroWrap = document.querySelector('.service-hero-wrap') || document.querySelector('.service-hero');
      cachedHeroHeight = heroWrap ? (heroWrap.offsetHeight || window.innerHeight * 1.2) : (window.innerHeight * 1.2);
    }
    updateHeroHeight();

    function updateProgress() {
      // MOBILE VIEW: No scrolling animation! The video continuously plays smoothly.
      if (window.innerWidth <= 991) return;

      // DESKTOP: EXACT ORIGINAL BEHAVIOR - 100% UNTOUCHED
      if (cachedHeroHeight <= 0) updateHeroHeight();
      const scrollRunway = cachedHeroHeight;
      const sy = (window.lenis && typeof window.lenis.scroll === 'number')
        ? window.lenis.scroll
        : (window.scrollY || window.pageYOffset || 0);

      const progress = Math.min(1, Math.max(0, sy / (scrollRunway || 1)));
      targetFrame = progress * (totalFrames - 1);

      if (!isVideoRafRunning) {
        isVideoRafRunning = true;
        requestAnimationFrame(renderLoop);
      }
    }

    // Continuous smooth playback variables for mobile
    let lastMobileTimestamp = 0;
    let mobilePlayFrame = 0;
    const MOBILE_FPS = 24; // 24 fps cinematic smooth playback
    const MOBILE_FRAME_INTERVAL = 1000 / MOBILE_FPS;

    // Render loop: continuous playback on mobile, scroll-driven easing on desktop
    function renderLoop(timestamp) {
      if (!document.getElementById('airwin-hero-canvas')) {
        isVideoRafRunning = false;
        return;
      }
      if (canvas.width <= 100 || canvas.height <= 50) {
        resizeCanvas();
      }

      const isMobile = window.innerWidth <= 991;

      if (isMobile) {
        // === MOBILE VIEW: CONTINUOUS SMOOTH PLAYBACK LOOP (NO SCROLL JITTER) ===
        const now = timestamp || performance.now();
        if (!lastMobileTimestamp) lastMobileTimestamp = now;
        const delta = now - lastMobileTimestamp;

        if (delta >= MOBILE_FRAME_INTERVAL) {
          const framesToAdvance = Math.floor(delta / MOBILE_FRAME_INTERVAL);
          mobilePlayFrame = (mobilePlayFrame + framesToAdvance) % totalFrames;
          lastMobileTimestamp = now - (delta % MOBILE_FRAME_INTERVAL);

          const rounded = Math.floor(mobilePlayFrame);
          if (rounded !== lastRenderedFrame) {
            lastRenderedFrame = rounded;
            drawFrame(rounded);
          }
        }

        // Keep continuous loop running on mobile
        requestAnimationFrame(renderLoop);
        return;
      }

      // === DESKTOP VIEW: EXACT ORIGINAL SCROLL-DRIVEN EASING LOOP ===
      if (Math.abs(targetFrame - currentFrame) > 0.01) {
        currentFrame += (targetFrame - currentFrame) * 0.28;
      } else {
        currentFrame = targetFrame;
      }
      const rounded = Math.round(currentFrame);
      if (rounded !== lastRenderedFrame) {
        lastRenderedFrame = rounded;
        drawFrame(rounded);
      }
      if (Math.abs(targetFrame - currentFrame) > 0.01) {
        requestAnimationFrame(renderLoop);
      } else {
        isVideoRafRunning = false;
      }
    }

    // Always start render loop initially
    isVideoRafRunning = true;
    requestAnimationFrame(renderLoop);

    if (canvas.dataset.heroVidEventsBound !== 'true') {
      canvas.dataset.heroVidEventsBound = 'true';
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', () => { updateHeroHeight(); resizeCanvas(); updateProgress(); }, { passive: true });
    }

    updateProgress();
  };

  function init() {
    initDynamicSpeedometer();
    unlockScroll();
    initLoader();
    initLiveClocks();
    initNavigation();
    initFAQ();
    initModals();
    initScrollResilience();
    window.initHeroVideoScrollAnimation();
    setTimeout(unlockScroll, 200);
    setTimeout(unlockScroll, 800);
  }


  // Mobile Sticky Scroll & Zoom Controller for About Page Mission/Management Feature Section
  function initMobileAboutScrollZoom() {
    const wrap = document.querySelector('.about-fea-wrap');
    const fea = document.querySelector('.about-fea');
    if (!wrap || !fea) return;

    const items = fea.querySelectorAll('.about-fea-content-item');
    const bgItems = fea.querySelectorAll('.about-fea-bg-item');
    if (items.length < 2 || bgItems.length < 2) return;

    const img1 = bgItems[0].querySelector('img');
    const img2 = bgItems[1].querySelector('img');

    let ticking = false;

    function update() {
      ticking = false;
      if (window.innerWidth > 991) {
        if (img1) img1.style.transform = '';
        if (img2) img2.style.transform = '';
        const isMgmtActive = items[1] && items[1].classList.contains('active');
        bgItems[0].style.opacity = '1';
        bgItems[1].style.opacity = isMgmtActive ? '1' : '0';
        return;
      }

      const rect = wrap.getBoundingClientRect();
      const scrollDist = wrap.offsetHeight - window.innerHeight;
      if (scrollDist <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollDist));

      if (progress < 0.48) {
        const p1 = progress / 0.48;
        const scale1 = (1.04 + p1 * 0.18).toFixed(4);
        if (img1) img1.style.transform = `scale(${scale1})`;

        bgItems[0].style.opacity = '1';
        bgItems[1].style.opacity = '0';

        items[0].classList.add('active');
        items[1].classList.remove('active');
        fea.setAttribute('data-active-index', '0');

      } else if (progress < 0.54) {
        const pt = (progress - 0.48) / 0.06;
        bgItems[0].style.opacity = (1 - pt).toFixed(3);
        bgItems[1].style.opacity = pt.toFixed(3);

        if (pt >= 0.5) {
          items[0].classList.remove('active');
          items[1].classList.add('active');
          fea.setAttribute('data-active-index', '1');
        } else {
          items[0].classList.add('active');
          items[1].classList.remove('active');
          fea.setAttribute('data-active-index', '0');
        }

      } else {
        const p2 = (progress - 0.54) / 0.46;
        const scale2 = (1.04 + p2 * 0.20).toFixed(4);
        if (img2) img2.style.transform = `scale(${scale2})`;

        bgItems[0].style.opacity = '0';
        bgItems[1].style.opacity = '1';

        items[0].classList.remove('active');
        items[1].classList.add('active');
        fea.setAttribute('data-active-index', '1');
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  window.initMobileAboutScrollZoom = initMobileAboutScrollZoom;
  window.initMobileAboutFea = initMobileAboutScrollZoom;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', unlockScroll);

  // =========================================================
  // AIRWIN CARGO - LIVE FORM EVENT LISTENERS (PHASE 3 CONNECT)
  // =========================================================

  // A. LIVE FOOTER QUOTE SUBMISSION
  document.addEventListener('submit', async function(e) {
    var form = e.target ? e.target.closest('.footer-quote-form') : null;
    if (!form) return;
    e.preventDefault();
    e.stopPropagation();

    var nameInput = form.querySelector('input[name="name"]');
    var mobileInput = form.querySelector('input[name="mobile"]');
    var emailInput = form.querySelector('input[name="email"]');
    var commentsInput = form.querySelector('textarea[name="comments"]');
    var btnWrap = form.querySelector('.footer-quote-btn-wrap');
    var submitBtn = form.querySelector('.footer-quote-submit');
    var successEl = form.querySelector('.footer-quote-success');

    var name = nameInput ? nameInput.value.trim() : '';
    var mobile = mobileInput ? mobileInput.value.trim() : '';
    var email = emailInput ? emailInput.value.trim() : '';
    var comments = commentsInput ? commentsInput.value.trim() : '';

    if (!name || !mobile || !email) {
      alert('Please fill in your name, mobile, and email address.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Submitting...';
    }

    try {
      var res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          mobile: mobile,
          email: email,
          comments: comments,
          service_type: 'General Air/Sea Freight'
        })
      });
      var data = await res.json();
      if (data.success) {
        if (btnWrap) btnWrap.style.display = 'none';
        if (nameInput) nameInput.style.display = 'none';
        if (mobileInput) mobileInput.style.display = 'none';
        if (emailInput) emailInput.style.display = 'none';
        if (commentsInput) commentsInput.style.display = 'none';
        if (successEl) {
          successEl.style.display = 'block';
          successEl.innerHTML = '&#10003; Thank you, <strong>' + name + '</strong>! Your quote request has been received by Airwin Operations. We will get back to you shortly.';
        }
      } else {
        alert(data.error || 'Failed to submit quote request. Please try again.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Submit';
        }
      }
    } catch(err) {
      alert('Network error connecting to Airwin Quote API. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Submit';
      }
    }
  }, true);

  // B. LIVE CAREERS APPLICATION FORM SUBMISSION
  document.addEventListener('submit', async function(e) {
    var form = e.target ? e.target.closest('#airwinJobApplyForm') : null;
    if (!form) return;
    e.preventDefault();
    e.stopPropagation();

    var nameInput = form.querySelector('#applicantName');
    var emailInput = form.querySelector('#applicantEmail');
    var phoneInput = form.querySelector('#applicantPhone');
    var cityInput = form.querySelector('#applicantCity');
    var roleInput = form.querySelector('#applicantRole');
    var btn = form.querySelector('#submitAppBtn');
    var msg = form.querySelector('#formFeedbackMessage');

    var name = nameInput ? nameInput.value.trim() : '';
    var email = emailInput ? emailInput.value.trim() : '';
    var phone = phoneInput ? phoneInput.value.trim() : '';
    var city = cityInput ? cityInput.value.trim() : '';
    var role = roleInput ? roleInput.value.trim() : 'General Application';

    if (!name || !email || !phone) return;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Submitting Application...</span>';
    }

    try {
      var res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          subject: 'Job Application: ' + role + ' (' + (city || 'Candidate') + ')',
          service_of_interest: 'Careers / ' + role,
          message: 'Candidate ' + name + ' applied for ' + role + ' from ' + city + '. Phone: ' + phone + ', Email: ' + email
        })
      });
      var data = await res.json();
      if (data.success) {
        if (btn) {
          btn.innerHTML = '<span>Application Sent Successfully!</span> &#10003;';
          btn.style.background = '#059669';
        }
        if (msg) {
          msg.style.display = 'block';
          msg.style.background = 'rgba(16, 185, 129, 0.12)';
          msg.style.color = '#047857';
          msg.style.border = '1px solid rgba(16, 185, 129, 0.3)';
          msg.innerHTML = 'Thank you, ' + name + '! Your application for <strong>' + role + '</strong> has been submitted. Our HR recruitment team will review it promptly.';
        }
        form.reset();
      } else {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<span>Send Application</span> &rarr;';
        }
        alert(data.error || 'Failed to submit application.');
      }
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Send Application</span> &rarr;';
      }
      alert('Network error submitting application. Please try again.');
    }
  }, true);

  // C. LIVE CONTACT FORM HANDLER (FALLBACK & DIRECT)
  window.handleAirwinContactSubmit = async function(form) {
    if (!form) form = document.getElementById('contact_form');
    if (!form) return;

    var fname = (form.querySelector('#fname') || form.querySelector('[name="fname"]')).value.trim();
    var email = (form.querySelector('#email') || form.querySelector('[name="email"]')).value.trim();
    var phone = (form.querySelector('#phone') || form.querySelector('[name="phone"]')).value.trim();
    var subject = (form.querySelector('#subject_text') || form.querySelector('[name="subject_text"]')).value.trim();
    var comment = (form.querySelector('#comment') || form.querySelector('[name="comment"]')).value.trim();
    var selectedRadio = form.querySelector('input[name="subject"]:checked') || form.querySelector('input[name="service"]:checked');
    var service = selectedRadio ? selectedRadio.value : 'General Freight';

    var submitBtn = document.getElementById('contact-submit-btn') || form.querySelector('button[type="submit"]');
    var msgEl = document.getElementById('contact-status-msg');
    var successEl = document.getElementById('contact-form-success');

    if (!fname || !email || !phone || !comment) {
      if (msgEl) {
        msgEl.style.display = 'block';
        msgEl.style.background = '#fef2f2';
        msgEl.style.color = '#b91c1c';
        msgEl.style.border = '1px solid #fecaca';
        msgEl.innerText = 'Please fill in all required fields marked with *';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      var textSpan = submitBtn.querySelector('.btn-text');
      if (textSpan) textSpan.innerText = 'SENDING...';
    }

    try {
      var res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fname,
          email: email,
          phone: phone,
          subject: subject || 'General Inquiry',
          service: service,
          message: comment
        })
      });
      var data = await res.json();
      if (data.success) {
        form.style.display = 'none';
        if (successEl) {
          successEl.style.display = 'block';
        }
      } else {
        if (msgEl) {
          msgEl.style.display = 'block';
          msgEl.style.background = '#fef2f2';
          msgEl.style.color = '#b91c1c';
          msgEl.style.border = '1px solid #fecaca';
          msgEl.innerText = data.error || 'Failed to submit inquiry. Please try again.';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          var textSpan = submitBtn.querySelector('.btn-text');
          if (textSpan) textSpan.innerText = 'SEND YOUR MESSAGE';
        }
      }
    } catch (err) {
      if (msgEl) {
        msgEl.style.display = 'block';
        msgEl.style.background = '#fef2f2';
        msgEl.style.color = '#b91c1c';
        msgEl.style.border = '1px solid #fecaca';
        msgEl.innerText = 'Network error sending message. Please try again.';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        var textSpan = submitBtn.querySelector('.btn-text');
        if (textSpan) textSpan.innerText = 'SEND YOUR MESSAGE';
      }
    }
  };

})();


  // Note: Hero Containers WebGL Shader Reveal is maintained on the home page.


  /* =========================================================
     AIRWIN NAVIGATION ACTIVE LINK SYNCHRONIZER
     ========================================================= */
  function updateAirwinActiveNavLinks(customPath) {
    const rawPath = typeof customPath === 'string' ? customPath : window.location.pathname;
    let path = (rawPath || '').toLowerCase().replace(/\/+$/, '') || '/';
    if (path.endsWith('.html')) {
      path = path.slice(0, -5);
    }
    if (path === '' || path === '/index') {
      path = '/';
    }

    let activeKey = 'home';
    if (path === '/') {
      activeKey = 'home';
    } else if (path.includes('about')) {
      activeKey = 'about';
    } else if (path.includes('service')) {
      activeKey = 'services';
    } else if (path.includes('insight') || path.includes('news')) {
      activeKey = 'news';
    } else if (path.includes('career')) {
      activeKey = 'career';
    } else if (path.includes('contact')) {
      activeKey = 'contact';
    }

    document.querySelectorAll('.nav-link-item').forEach(link => {
      // First ALWAYS remove both classes cleanly
      link.classList.remove('w--current', 'active');

      const href = (link.getAttribute('href') || '').toLowerCase();
      let match = false;
      if (activeKey === 'home') {
        match = (href.includes('index') || href === '/' || href === './');
      } else if (activeKey === 'about') {
        match = href.includes('about');
      } else if (activeKey === 'services') {
        match = href.includes('service');
      } else if (activeKey === 'news') {
        match = (href.includes('insight') || href.includes('news'));
      } else if (activeKey === 'career') {
        match = href.includes('career');
      } else if (activeKey === 'contact') {
        match = href.includes('contact');
      }

      if (match) {
        link.classList.add('w--current', 'active');
      }
    });
  }

  window.updateAirwinActiveNavLinks = updateAirwinActiveNavLinks;

  // Mobile Sticky Scroll & Zoom Controller for About Page Mission/Management Feature Section
  function initMobileAboutScrollZoom() {
    const wrap = document.querySelector('.about-fea-wrap');
    const fea = document.querySelector('.about-fea');
    if (!wrap || !fea) return;

    const items = fea.querySelectorAll('.about-fea-content-item');
    const bgItems = fea.querySelectorAll('.about-fea-bg-item');
    if (items.length < 2 || bgItems.length < 2) return;

    const img1 = bgItems[0].querySelector('img');
    const img2 = bgItems[1].querySelector('img');

    let ticking = false;

    function update() {
      ticking = false;
      if (window.innerWidth > 991) {
        if (img1) img1.style.transform = '';
        if (img2) img2.style.transform = '';
        const isMgmtActive = items[1] && items[1].classList.contains('active');
        bgItems[0].style.opacity = '1';
        bgItems[1].style.opacity = isMgmtActive ? '1' : '0';
        return;
      }

      const rect = wrap.getBoundingClientRect();
      const scrollDist = wrap.offsetHeight - window.innerHeight;
      if (scrollDist <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollDist));

      if (progress < 0.48) {
        const p1 = progress / 0.48;
        const scale1 = (1.04 + p1 * 0.18).toFixed(4);
        if (img1) img1.style.transform = `scale(${scale1})`;

        bgItems[0].style.opacity = '1';
        bgItems[1].style.opacity = '0';

        items[0].classList.add('active');
        items[1].classList.remove('active');
        fea.setAttribute('data-active-index', '0');

      } else if (progress < 0.54) {
        const pt = (progress - 0.48) / 0.06;
        bgItems[0].style.opacity = (1 - pt).toFixed(3);
        bgItems[1].style.opacity = pt.toFixed(3);

        if (pt >= 0.5) {
          items[0].classList.remove('active');
          items[1].classList.add('active');
          fea.setAttribute('data-active-index', '1');
        } else {
          items[0].classList.add('active');
          items[1].classList.remove('active');
          fea.setAttribute('data-active-index', '0');
        }

      } else {
        const p2 = (progress - 0.54) / 0.46;
        const scale2 = (1.04 + p2 * 0.20).toFixed(4);
        if (img2) img2.style.transform = `scale(${scale2})`;

        bgItems[0].style.opacity = '0';
        bgItems[1].style.opacity = '1';

        items[0].classList.remove('active');
        items[1].classList.add('active');
        fea.setAttribute('data-active-index', '1');
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  window.initMobileAboutScrollZoom = initMobileAboutScrollZoom;
  window.initMobileAboutFea = initMobileAboutScrollZoom;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAirwinActiveNavLinks);
  } else {
    updateAirwinActiveNavLinks();
    initMobileAboutFea();
  }

  window.addEventListener('popstate', () => updateAirwinActiveNavLinks());

  function getBarbaUrlPath(data) {
    if (!data || !data.next) return window.location.pathname;
    const u = data.next.url;
    if (!u) return window.location.pathname;
    if (typeof u === 'string') return u;
    if (u.path) return u.path;
    if (u.pathname) return u.pathname;
    if (u.href) {
      try { return new URL(u.href, window.location.origin).pathname; } catch(e) { return u.href; }
    }
    return window.location.pathname;
  }

  if (window.barba) {
    try {
      window.barba.hooks.beforeEnter((data) => {
        updateAirwinActiveNavLinks(getBarbaUrlPath(data));
      });
      window.barba.hooks.afterEnter((data) => {
        updateAirwinActiveNavLinks(getBarbaUrlPath(data));
        initMobileAboutFea();
        if (typeof window.initAboutHeroCardsAnimation === 'function') {
          try { window.initAboutHeroCardsAnimation(); } catch(e) {}
        }
        if (typeof window.initHeroVideoScrollAnimation === 'function') {
          try { window.initHeroVideoScrollAnimation(); } catch(e) {}
        }
      });
      window.barba.hooks.after((data) => {
        updateAirwinActiveNavLinks(getBarbaUrlPath(data));
        if (typeof window.initHeroVideoScrollAnimation === 'function') {
          try { window.initHeroVideoScrollAnimation(); } catch(e) {}
        }
      });
    } catch(e) {}
  }
