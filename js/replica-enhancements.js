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

    function updateSpeedometer() {
      if (!serviceSection) return;
      const rect = serviceSection.getBoundingClientRect();
      const inService = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2;

      if (inService) {
        speedInner.classList.add('active', 'on-start');
        
        // Easing interpolation
        currentSpeed += (targetSpeed - currentSpeed) * 0.12;
        if (currentSpeed < 0.5 && targetSpeed === 0) currentSpeed = 0;
        
        const displaySpeed = Math.round(currentSpeed);
        const formatted = displaySpeed.toString().padStart(2, '0');
        if (speedText.textContent !== formatted) {
          speedText.textContent = formatted;
        }
      } else {
        if (rect.bottom < window.innerHeight * 0.2 || rect.top > window.innerHeight) {
          speedInner.classList.remove('active', 'on-start');
          currentSpeed = 0;
          targetSpeed = 0;
        }
      }
      requestAnimationFrame(updateSpeedometer);
    }

    window.addEventListener('scroll', () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastScrollTime);
      const dy = Math.abs(window.scrollY - lastScrollY);
      const velocity = (dy / dt) * 1000; // px/sec

      lastScrollY = window.scrollY;
      lastScrollTime = now;

      if (!serviceSection) return;
      const rect = serviceSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
        // Calculate realistic highway speed based on scroll velocity (45 - 88 km/h)
        const computed = Math.min(88, Math.max(42, Math.round(velocity * 0.045 + 40)));
        targetSpeed = computed;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          // Decelerate smoothly to idle cruise
          targetSpeed = 0;
        }, 180);
      }
    }, { passive: true });

    requestAnimationFrame(updateSpeedometer);
  }

  // 4. SCROLL & ANIMATION RESILIENCE ON HARD REFRESH / SLOW ASSETS
  function initScrollResilience() {
    function enforceVisibilityAndRefresh() {
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

      // 8. Refresh GSAP ScrollTrigger if available (safely without destructive window.resize)
      if (window.ScrollTrigger) {
        try { window.ScrollTrigger.refresh(); } catch (e) {}
      }

      // 9. Refresh Lenis smooth scroll if available
      if (window.lenis) {
        try { window.lenis.resize(); } catch (e) {}
      }
    }

    // Schedule resilience sweeps on initial load
    [100, 300, 700, 1500, 3000].forEach(delay => {
      setTimeout(enforceVisibilityAndRefresh, delay);
    });

    window.addEventListener('load', enforceVisibilityAndRefresh);

    // Watch for Barba.js PJAX / SPA transitions and mutations
    try {
      const barbaWrapper = document.querySelector('[data-barba="wrapper"]') || document.body;
      const observer = new MutationObserver((mutations) => {
        let hasContainerChange = false;
        for (const m of mutations) {
          if (m.type === 'childList' && m.addedNodes.length > 0) {
            hasContainerChange = true;
            break;
          }
        }
        if (hasContainerChange) {
          enforceVisibilityAndRefresh();
          setTimeout(enforceVisibilityAndRefresh, 150);
          setTimeout(enforceVisibilityAndRefresh, 500);
          setTimeout(enforceVisibilityAndRefresh, 1200);
        }
      });
      observer.observe(barbaWrapper, { childList: true, subtree: true });
    } catch (e) {}

    // Back / Forward browser navigation
    window.addEventListener('popstate', () => {
      setTimeout(enforceVisibilityAndRefresh, 50);
      setTimeout(enforceVisibilityAndRefresh, 300);
      setTimeout(enforceVisibilityAndRefresh, 800);
    });

    // Internal navigation links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        setTimeout(enforceVisibilityAndRefresh, 350);
        setTimeout(enforceVisibilityAndRefresh, 850);
        setTimeout(enforceVisibilityAndRefresh, 1600);
      }
    }, { passive: true });
  }

  
  // =========================================================
  // HERO VIDEO SCROLL ANIMATION (CONTAINER LOADING ONTO TRUCK)
  // Non-blocking, frame-by-frame scrub without layout thrashing
  // =========================================================
  window.initHeroVideoScrollAnimation = function initHeroVideoScrollAnimation() {
    const canvas = document.getElementById('airwin-hero-canvas');
    if (!canvas) return;
    if (canvas.dataset.heroVidInit === 'true') {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }
      return;
    }
    canvas.dataset.heroVidInit = 'true';

    const ctx = canvas.getContext('2d');
    const totalFrames = 118;
    const framePaths = [];
    for (let i = 0; i < totalFrames; i++) {
      const num = String(i).padStart(4, '0');
      framePaths.push('/assets/hero-video-frames/frame_' + num + '.webp');
    }

    const images = [];
    let currentFrame = 0;
    let targetFrame = 0;
    let lastRenderedFrame = -1;

    function resizeCanvas() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        lastRenderedFrame = -1;
        drawFrame(Math.round(currentFrame));
      }
    }

    function drawFrame(idx) {
      const frameIdx = Math.max(0, Math.min(totalFrames - 1, idx));
      let img = images[frameIdx];
      if (!img || !img.complete || img.naturalWidth === 0) {
        img = images[0];
      }
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const w = canvas.width || window.innerWidth;
      const h = canvas.height || window.innerHeight;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      const scale = Math.max(w / imgW, h / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const drawX = (w - drawW) / 2;
      const drawY = (h - drawH) / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    // Load first frame immediately
    const firstImg = new Image();
    firstImg.src = framePaths[0];
    images[0] = firstImg;
    firstImg.onload = function() {
      resizeCanvas();
      drawFrame(0);
    };

    // Preload remaining frames in background
    for (let i = 1; i < totalFrames; i++) {
      const img = new Image();
      img.src = framePaths[i];
      images[i] = img;
    }

    function updateProgress() {
      const heroWrap = document.querySelector('.service-hero-wrap') || document.querySelector('.service-hero');
      const maxScroll = heroWrap ? (heroWrap.offsetHeight || window.innerHeight * 1.2) : (window.innerHeight * 1.2);
      const sy = (window.lenis && typeof window.lenis.scroll === 'number')
        ? window.lenis.scroll
        : (window.scrollY || window.pageYOffset || 0);
      const progress = Math.min(1, Math.max(0, sy / maxScroll));
      targetFrame = progress * (totalFrames - 1);
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', () => { resizeCanvas(); updateProgress(); }, { passive: true });

    // Smooth render loop
    function renderLoop() {
      if (!document.getElementById('airwin-hero-canvas')) return;
      if (canvas.width <= 300 || canvas.height <= 150) {
        resizeCanvas();
      }
      updateProgress();
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
      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);

    resizeCanvas();
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', unlockScroll);
})();


  // =========================================================
  // Hero Containers WebGL Shader Reveal (Dropbox McLaren F1)
  // Re-initializable for Barba.js transitions & fresh canvases
  // =========================================================
  window.initContainersShader = function initContainersShader() {
    const canvas = document.getElementById('hero-containers-canvas');
    if (!canvas) return;
    const wrap = document.getElementById('hero-containers-interactive') || canvas.parentElement;
    if (!wrap) return;

    // Guarantee wrapper is visible and clickable
    wrap.style.display = 'block';
    wrap.style.visibility = 'visible';
    wrap.style.opacity = '1';
    wrap.style.pointerEvents = 'auto';

    // If already active on THIS exact canvas element and rendering, return
    if (canvas._containersActive && canvas._containersGL) {
      return;
    }

    // Cancel old RAF if running
    if (window._containersShaderRaf) {
      cancelAnimationFrame(window._containersShaderRaf);
      window._containersShaderRaf = null;
    }

    const gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false
    });
    if (!gl) {
      console.warn('WebGL not supported for containers');
      return;
    }

    canvas._containersActive = true;
    canvas._containersGL = gl;

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
      #else
        precision mediump float;
      #endif

      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_hover;
      uniform sampler2D u_texture1; // Idle: Grayscale
      uniform sampler2D u_texture2; // Active: Blue color

      float random(vec3 pos) {
        pos = fract(pos * vec3(0.1031, 0.1030, 0.0973));
        pos += dot(pos, pos.yxz + 33.33);
        return fract((pos.x + pos.y) * pos.z);
      }

      float noise(in vec3 st) {
        vec3 i = floor(st);
        vec3 f = fract(st);

        float a = random(i);
        float b = random(i + vec3(1.0, 0.0, 0.0));
        float c = random(i + vec3(0.0, 1.0, 0.0));
        float d = random(i + vec3(1.0, 1.0, 0.0));
        float e = random(i + vec3(0.0, 0.0, 1.0));
        float f1 = random(i + vec3(1.0, 0.0, 1.0));
        float g = random(i + vec3(0.0, 1.0, 1.0));
        float h = random(i + vec3(1.0, 1.0, 1.0));

        vec3 u = f * f * (3.0 - 2.0 * f);

        return mix(
          mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
          mix(mix(e, f1, u.x), mix(g, h, u.x), u.y),
          u.z
        );
      }

      float noiseTexture(in vec3 st, float scale, float roughness) {
        float value = 0.0;
        float amplitude = 1.0;
        float normalization = 0.0;
        for (int i = 0; i < 3; i++) {
          value += amplitude * (noise(st * scale) - 0.5);
          normalization += amplitude;
          st *= 2.0;
          amplitude *= roughness;
        }
        return value / normalization;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 texCoord = vec2(uv.x, 1.0 - uv.y);

        vec4 idleColor = texture2D(u_texture1, texCoord);
        vec4 activeColor = texture2D(u_texture2, texCoord);

        if (idleColor.a < 0.01 && activeColor.a < 0.01) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }

        vec2 cursor = u_mouse / u_resolution;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 aspectUV = vec2(uv.x * aspect, uv.y);
        vec2 aspectCursor = vec2(cursor.x * aspect, cursor.y);

        float dist = distance(aspectUV, aspectCursor);

        float spotlightSize = 0.18 * u_hover;
        float spotlightBlurRadius = 0.20;

        vec3 st = vec3(uv * 18.0, u_time * 0.12);
        float n = noiseTexture(st, 4.0, 0.65);

        float spotlight = 1.0 - ((dist - spotlightSize) / spotlightBlurRadius);
        spotlight = clamp(spotlight, 0.0, 1.0);

        float mask = spotlight;
        mask *= (activeColor.b * 0.8 + 0.6);
        mask += spotlight / 2.5;
        mask *= max(0.0, (n + 0.4) * 3.0);
        mask += max(0.0, (spotlight - 0.3) * 0.8);

        float threshold = 0.45;
        float activeArea = smoothstep(threshold - 0.08, threshold + 0.08, mask);
        activeArea *= activeColor.a * u_hover;

        gl_FragColor = mix(idleColor, activeColor, activeArea);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getShaderInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uHover = gl.getUniformLocation(program, 'u_hover');

    let texturesReady = 0;
    let hasStartedRender = false;
    const textures = [null, null];

    function loadTexture(url, unit) {
      const tex = gl.createTexture();
      textures[unit] = tex;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));

      const img = new Image();
      let loaded = false;

      function onLoaded() {
        if (loaded) return;
        loaded = true;
        try {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          texturesReady++;
          if (texturesReady >= 2 && !hasStartedRender) {
            hasStartedRender = true;
            if (wrap) wrap.style.backgroundImage = 'none';
            render();
          }
        } catch(e) {
          console.warn('WebGL texImage2D error:', e);
        }
      }

      img.onload = onLoaded;
      img.onerror = () => {
        if (loaded) return;
        loaded = true;
        console.warn('Fallback: container texture error', url);
        texturesReady++;
        if (texturesReady >= 2 && !hasStartedRender) {
          hasStartedRender = true;
          render();
        }
      };
      img.src = url;
      if (img.complete && img.naturalWidth > 0) {
        onLoaded();
      }
    }

    loadTexture('/images/containers-gray.png', 0);
    loadTexture('/images/containers-blue.png', 1);

    gl.uniform1i(gl.getUniformLocation(program, 'u_texture1'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture2'), 1);

    let targetMouse = [0, 0];
    let currentMouse = [0, 0];
    let isHovering = false;
    let hoverValue = 0.0;
    const startTime = performance.now();
    let isVisible = true;

    function resize() {
      if (!canvas.isConnected) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    if (window._containersShaderResize) {
      window.removeEventListener('resize', window._containersShaderResize);
    }
    window._containersShaderResize = resize;
    window.addEventListener('resize', resize, { passive: true });
    resize();

    function onPointerMove(clientX, clientY) {
      if (!canvas.isConnected) return;
      const rect = canvas.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        targetMouse[0] = (clientX - rect.left) * dpr;
        targetMouse[1] = (rect.height - (clientY - rect.top)) * dpr;
        isHovering = true;
      } else {
        isHovering = false;
      }
    }

    if (window._containersShaderMouseMove) {
      window.removeEventListener('mousemove', window._containersShaderMouseMove);
    }
    window._containersShaderMouseMove = (e) => {
      onPointerMove(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', window._containersShaderMouseMove, { passive: true });

    wrap.onmouseleave = () => {
      isHovering = false;
    };

    wrap.ontouchstart = (e) => {
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        onPointerMove(t.clientX, t.clientY);
        currentMouse[0] = targetMouse[0];
        currentMouse[1] = targetMouse[1];
      }
    };
    wrap.ontouchmove = (e) => {
      if (e.touches && e.touches[0]) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    wrap.ontouchend = () => {
      isHovering = false;
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(canvas);

    function updateContainersScrollFade() {
      if (!canvas.isConnected) return;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || (window.lenis ? window.lenis.scroll : 0);
      const fadeStart = 40;
      const fadeEnd = 350;
      let opacity = 1.0;
      if (scrollY > fadeStart) {
        opacity = Math.max(0.0, 1.0 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
      }
      wrap.style.opacity = opacity.toFixed(3);
      wrap.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none';
    }

    if (window._containersShaderScroll) {
      window.removeEventListener('scroll', window._containersShaderScroll);
    }
    window._containersShaderScroll = updateContainersScrollFade;
    window.addEventListener('scroll', updateContainersScrollFade, { passive: true });

    updateContainersScrollFade();

    function render() {
      if (!canvas.isConnected) {
        canvas._containersActive = false;
        return;
      }
      if (isVisible && texturesReady >= 2) {
        currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.14;
        currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.14;

        const targetHover = isHovering ? 1.0 : 0.0;
        hoverValue += (targetHover - hoverValue) * 0.08;

        if (textures[0]) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        }
        if (textures[1]) {
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, textures[1]);
        }

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uMouse, currentMouse[0], currentMouse[1]);
        gl.uniform1f(uTime, (performance.now() - startTime) / 1000);
        gl.uniform1f(uHover, hoverValue);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      window._containersShaderRaf = requestAnimationFrame(render);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initContainersShader);
  } else {
    window.initContainersShader();
  }



  /* =========================================================
     AIRWIN NAVIGATION ACTIVE LINK SYNCHRONIZER
     ========================================================= */
  function updateAirwinActiveNavLinks() {
    const currentPath = window.location.pathname.toLowerCase();
    document.querySelectorAll('.nav-link-item').forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const isHome = (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '' || currentPath.endsWith('/index'));
      if (isHome) {
        if (href.includes('index.html') || href === '/' || href === './') {
          link.classList.add('w--current');
        } else {
          link.classList.remove('w--current');
        }
      } else {
        if (href.includes('about') && currentPath.includes('about')) {
          link.classList.add('w--current');
        } else if (href.includes('services') && currentPath.includes('services')) {
          link.classList.add('w--current');
        } else if (href.includes('insights') && (currentPath.includes('insights') || currentPath.includes('news'))) {
          link.classList.add('w--current');
        } else if (href.includes('careers') && currentPath.includes('career')) {
          link.classList.add('w--current');
        } else if (href.includes('contact') && currentPath.includes('contact')) {
          link.classList.add('w--current');
        } else {
          link.classList.remove('w--current');
        }
      }
    });
  }

  window.updateAirwinActiveNavLinks = updateAirwinActiveNavLinks;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAirwinActiveNavLinks);
  } else {
    updateAirwinActiveNavLinks();
  }

  window.addEventListener('popstate', updateAirwinActiveNavLinks);
  if (window.barba) {
    try {
      window.barba.hooks.after(updateAirwinActiveNavLinks);
      window.barba.hooks.afterEnter(() => {
        updateAirwinActiveNavLinks();
        if (typeof window.initAboutHeroCardsAnimation === 'function') {
          window.initAboutHeroCardsAnimation();
        }
        if (typeof window.initHeroVideoScrollAnimation === 'function') {
          window.initHeroVideoScrollAnimation();
        }
      });
    } catch(e) {}
  }
