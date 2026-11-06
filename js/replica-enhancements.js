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

    // Trigger ScrollTrigger update / resize event
    window.dispatchEvent(new Event('resize'));
  }

  // 2. LOADER DISMISS & SMOOTH REVEAL
  function initLoader() {
    const loader = document.querySelector('.loader');
    const hiddenElements = document.querySelectorAll('[data-init-hidden]');

    function revealPage() {
      if (loader) {
        loader.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 600);
      }
      hiddenElements.forEach((el) => {
        el.style.transition = 'opacity 0.8s ease';
        el.style.opacity = '1';
        el.style.display = '';
      });
      unlockScroll();
    }

    if (loader) {
      setTimeout(revealPage, 500);
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
    const header = document.querySelector('.header') || document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('on-scroll');
      } else {
        header.classList.remove('on-scroll');
      }
    }, { passive: true });

    const menuButtons = document.querySelectorAll('.header-menu-btn, .header-menu, [data-menu-toggle]');
    menuButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        header.classList.toggle('show-menu');
        const isExpanded = header.classList.contains('show-menu');
        btn.setAttribute('aria-expanded', isExpanded);
      });
    });

    const menuLinks = header.querySelectorAll('.header-menu-nav a, .header-slot a');
    menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        header.classList.remove('show-menu');
      });
    });
  }

  // 5. FAQ ACCORDION
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

  function init() {
    initDynamicSpeedometer();
    unlockScroll();
    initLoader();
    initLiveClocks();
    initNavigation();
    initFAQ();
    initModals();
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
