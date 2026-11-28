/**
 * AIRWIN CARGO - ARTICLE READER POPUP MODAL
 * Provides a responsive modal reader for news & updates cards across the website.
 */

(function () {
  'use strict';

  // 1. COMPREHENSIVE ARTICLES DATASET
  const AIRWIN_ARTICLES = {
    "logistics-management": {
      id: "logistics-management",
      slug: "logistics-management",
      aliases: ["logistics-management-precision-freight-forwarding", "precision-freight-forwarding"],
      title: "Logistics Management: Precision Freight Forwarding in Global Trade",
      category: "Logistics Management",
      accent: "LOGISTICS MANAGEMENT",
      readTime: "4 MIN READ",
      date: "15 May, 2025",
      author: "Airwin Editorial Team",
      image: "/images/news/news_1.jpg",
      summary: "Optimizing end-to-end multi-modal supply chains across air, sea, and land gateways with real-time tracking, transparent milestone monitoring, and priority customs coordination.",
      content: `
        <p class="airwin-article-lead">Logistics management serves as the structural backbone of modern global trade. In an era where international commerce demands rapid, agile, and transparent responses to supply chain fluctuations, professional freight forwarders must combine real-time GPS telemetry, proactive customs clearance protocols, and strategic transshipment routing to ensure cargo reaches its destination with zero downtime.</p>

        <h3>1. The Evolution of Multi-Modal Synchronization</h3>
        <p>Modern supply chains can no longer rely on single-mode transit models. Shippers need fluid transitions between air cargo, ocean shipping, and regional line-haul trucking. At Airwin Cargo, our multi-modal corridors connect inland manufacturing zones directly with major international airport hubs and deep-sea maritime ports, reducing double-handling and transshipment dwell times by up to 35%.</p>

        <div class="article-quote-box">
          <blockquote>"Precision in freight forwarding is not simply about moving boxes—it is about orchestrating data, customs compliance, and physical handling with absolute predictability."</blockquote>
          <div class="article-quote-author">— Operations Directorate, Airwin Cargo Services</div>
        </div>

        <h3>2. Real-Time Telemetry and Milestone Visibility</h3>
        <p>Cargo security and operational transparency begin with continuous shipment monitoring. Every milestone—from warehouse acceptance, export customs filing, airway bill issuance, ramp loading, in-transit telemetry, to port arrival and final delivery—is recorded with precise timestamps. This level of granular visibility empowers supply chain managers to anticipate potential customs holds, manage inventory buffers, and communicate confidently with their end customers.</p>

        <h3>3. Priority Customs Coordination & In-House Compliance</h3>
        <p>Regulatory delays remain the number-one cause of supply chain friction worldwide. Airwin's licensed in-house customs brokerage team ensures exhaustive tariff classification, pre-arrival filing, duty assessment, and regulatory document validation before the consignment even departs its origin. By managing compliance in-house rather than outsourcing to third parties, we eliminate communication bottlenecks and ensure full regulatory compliance across India, the GCC, and European destinations.</p>

        <h3>4. Strategic Port Routing & Contingency Protocols</h3>
        <p>When weather disruptions or geopolitical airspace closures impact standard lanes, our operations team activates pre-negotiated Block Space Agreements (BSAs) and alternative feeder corridors. Whether diverting sensitive air shipments through regional transshipment hubs or arranging expedited bonded trucking to clear backlogged maritime terminals, Airwin provides clients with resilient, contingency-proof shipping solutions.</p>

        <div class="article-key-takeaways">
          <h4>Key Takeaways for Supply Chain Leaders</h4>
          <ul>
            <li><strong>Integrated Multi-Modal Transit:</strong> Smooth handoffs between air, ocean, and ground minimize idle transit hours.</li>
            <li><strong>In-House Brokerage:</strong> Eliminating third-party brokers accelerates customs clearance by up to 24 hours.</li>
            <li><strong>Proactive Telemetry:</strong> Automated event alerts notify teams of milestone completions and status updates in real time.</li>
          </ul>
        </div>
      `
    },

    "domestic-cargo": {
      id: "domestic-cargo",
      slug: "domestic-cargo-line-haul-networks",
      aliases: ["domestic-676d45a79051a", "domestic-cargo", "pan-india-distribution"],
      title: "Domestic Cargo & Line-Haul Networks: Fast, Dedicated Pan-India Distribution",
      category: "Domestic Cargo",
      accent: "DOMESTIC EXPRESS",
      readTime: "3 MIN READ",
      date: "26 Dec, 2024",
      author: "Airwin Express Fleet Operations",
      image: "/images/news/news_2.jpeg",
      summary: "Connecting Tier-1 economic hubs with rapid industrial corridors through scheduled line-haul fleets, synchronized regional transshipment, and time-critical express handling.",
      content: `
        <p class="airwin-article-lead">India's domestic commerce is expanding at an unprecedented pace. Manufacturing corridors stretching from the northern industrial belts to the southern ports require scheduled line-haul road networks that integrate seamlessly with air cargo hubs for rapid, reliable fulfillment.</p>

        <h3>1. High-Frequency Scheduled Line-Haul Departures</h3>
        <p>Unlike ad-hoc trucking services that wait for full loads before departure, Airwin's dedicated line-haul network runs on strict, timetable-driven departures. Connecting key industrial epicenters—New Delhi, Bangalore, Mumbai, Chennai, and Kerala—our scheduled line-haul fleet ensures guaranteed transit windows and predictable delivery dates for B2B consignments and high-value industrial freight.</p>

        <div class="article-quote-box">
          <blockquote>"Timetable-driven line-haul operations convert unpredictable road transport into an exact, synchronized schedule that manufacturers can build their production shifts around."</blockquote>
          <div class="article-quote-author">— Fleet Operations Lead, Airwin Domestic Division</div>
        </div>

        <h3>2. Secure Container Fleets & GPS Telematics</h3>
        <p>High-value industrial goods, electronics, and pharmaceuticals require specialized security. Every vehicle in Airwin's domestic line-haul fleet is equipped with tamper-evident digital e-locks, dual-driver shifts for long-haul security, and real-time GPS sensors that report temperature, vehicle speed, and route deviations directly to our central monitoring center.</p>

        <h3>3. Regional Hubs & Express Cross-Docking</h3>
        <p>Strategically situated sorting hubs in Delhi, Bangalore, and Calicut function as express cross-dock facilities. Incoming line-haul shipments are unloaded, sorted by regional PIN codes, and transferred onto last-mile delivery vehicles within 90 minutes of arrival, dramatically cutting intermediate transit delay.</p>

        <div class="article-key-takeaways">
          <h4>Domestic Network Highlights</h4>
          <ul>
            <li><strong>Daily Scheduled Departures:</strong> Fixed departure times independent of truckload volume ensure adherence to strict delivery windows.</li>
            <li><strong>Tamper-Proof Transit:</strong> Digital e-locks and 24/7 telemetry secure valuable consignments throughout the route.</li>
            <li><strong>Seamless Air-to-Ground Link:</strong> Immediate road transfer for domestic cargo arriving at Delhi, Cochin, or Bangalore airports.</li>
          </ul>
        </div>
      `
    },

    "airwin-25-years": {
      id: "airwin-25-years",
      slug: "airwin",
      aliases: ["airwin-logistics-25-years-global-excellence", "25-years-excellence"],
      title: "Airwin Logistics: Over 25 Years of Mission-Critical Global Cargo Excellence",
      category: "Global Network",
      accent: "GLOBAL NETWORK",
      readTime: "6 MIN READ",
      date: "31 Aug, 2024",
      author: "Corporate Communications, Airwin Group",
      image: "/images/news/news_3.jpeg",
      summary: "Strengthening global cargo connectivity across 200+ partner airlines, ocean carriers, and dedicated freight hubs to guarantee seamless trans-continental delivery.",
      content: `
        <p class="airwin-article-lead">Founded with a steadfast commitment to integrity, punctuality, and personalized cargo care, Airwin Cargo Services has spent over two decades evolving from a regional forwarding house into a trusted international logistics partner handling mission-critical shipments worldwide.</p>

        <h3>1. A Heritage Built on Reliability</h3>
        <p>Over the last 25 years, global trade has encountered seismic shifts—from economic cycles and technological revolutions to unprecedented pandemic disruptions. Throughout every challenge, Airwin's fundamental operating philosophy has remained unchanged: provide shippers with transparent communication, zero hidden costs, and personal accountability for every single consignment entrusted to our care.</p>

        <h3>2. Strategic Tri-Hub Presence: Delhi, South India & Dubai</h3>
        <p>Airwin operates specialized branch offices and bonded gateway facilities across India's premier commercial corridors—including our corporate headquarters in New Delhi, southern hubs in Calicut, Cochin, and Bangalore, and our international gateway hub in Dubai, UAE. This geographic triangle enables rapid transit between Indian manufacturing centers, Gulf trading terminals, and beyond to Europe, the Americas, and Southeast Asia.</p>

        <div class="article-quote-box">
          <blockquote>"Over 25 years, the secret to our longevity has been simple: treat every client's cargo as if our own company's future depended on its safe and punctual arrival."</blockquote>
          <div class="article-quote-author">— Executive Management, Airwin Cargo Services Pvt. Ltd.</div>
        </div>

        <h3>3. 200+ Global Carrier Partnerships</h3>
        <p>Through decades of high-volume cooperation, Airwin has forged long-term relationships with premier international airlines, major maritime shipping alliances, and certified ground networks. These deep industry partnerships guarantee our clients secured cargo space allocations, competitive freight rates, and priority container release even during peak fourth-quarter shipping seasons.</p>

        <div class="article-key-takeaways">
          <h4>Milestones of Excellence</h4>
          <ul>
            <li><strong>25+ Years of Service:</strong> Decades of continuous operation with an unblemished safety and reliability record.</li>
            <li><strong>Over 25,000+ Shipments:</strong> Handled with precision across air, ocean, and ground freight channels.</li>
            <li><strong>Dedicated 150+ Team Members:</strong> Logistics professionals, licensed customs agents, and operations specialists at your service.</li>
          </ul>
        </div>
      `
    },

    "blood-donor-day": {
      id: "blood-donor-day",
      slug: "14th-june-world-blood-donor-day",
      aliases: ["world-blood-donor-day", "blood-donor"],
      title: "14th June World Blood Donor Day: Supporting Healthcare Across Communities",
      category: "Community & CSR",
      accent: "COMMUNITY & CSR",
      readTime: "2 MIN READ",
      date: "14 Jun, 2024",
      author: "Airwin CSR Committee",
      image: "/images/news/news_4.jpg",
      summary: "Airwin Logistics honors voluntary blood donors and reinforces its commitment to community health and corporate social responsibility across all our operational branches.",
      content: `
        <p class="airwin-article-lead">Logistics connects markets, but community commitment connects people. On World Blood Donor Day, Airwin Logistics reaffirmed its social responsibility pledge by organizing voluntary blood donation drives and recognizing the vital role blood donors play in saving lives.</p>

        <h3>1. Mobilizing Employee Volunteers</h3>
        <p>Teams across our New Delhi, Calicut, and Bangalore branches partnered with certified regional blood banks and public health organizations to host community donation camps. Over 120 employees and local logistics community members stepped forward to contribute, demonstrating that true corporate excellence begins with community care.</p>

        <h3>2. Healthcare Logistics in Action</h3>
        <p>Beyond donation drives, Airwin operates specialized priority cold-chain lanes for temperature-sensitive pharmaceutical shipments, diagnostic samples, and emergency medical cargo. Our dedicated teams ensure that medical consignments receive expedited customs clearance and temperature-controlled transit across all regional airports.</p>

        <div class="article-key-takeaways">
          <h4>Community Commitments</h4>
          <ul>
            <li><strong>Annual Donation Drives:</strong> Scheduled company-wide participation across all regional offices.</li>
            <li><strong>Healthcare Freight Priority:</strong> Expedited handling and active temperature monitoring for life-saving medical goods.</li>
          </ul>
        </div>
      `
    },

    "evolution-20-years": {
      id: "evolution-20-years",
      slug: "the-evolution-of-airwin-logistics-20-years-of-excellence-in-global-cargo-forwarding",
      aliases: ["the-evolution-of-airwin-logistics", "evolution-20-years"],
      title: "The Evolution of Airwin Logistics: 20 Years of Excellence in Global Cargo Forwarding",
      category: "Company Milestone",
      accent: "COMPANY MILESTONE",
      readTime: "5 MIN READ",
      date: "31 May, 2024",
      author: "Airwin Historical Archive",
      image: "/images/news/news_5.jpg",
      summary: "From foundational regional freight forwarding to an international multi-modal logistics power, discover the key milestones that shaped Airwin's industry leadership.",
      content: `
        <p class="airwin-article-lead">Two decades of growth in the fast-paced freight industry require continuous adaptation, technological modernization, and unwavering client loyalty. Here is a look back at the defining chapters of Airwin Cargo's development.</p>

        <h3>1. The Early Years: Mastering Airport Logistics</h3>
        <p>Starting with regional airport handling and cargo consolidation in New Delhi and Kerala, Airwin carved out a reputation for delivering when others could not. Fast customs filing, transparent handling charges, and personal relationships with airline cargo managers laid the groundwork for rapid expansion.</p>

        <h3>2. Expanding into Cross-Border Trade & UAE Hub</h3>
        <p>Recognizing the tremendous economic synergy between India and the Middle East, Airwin established direct distribution operations in Dubai. This allowed exporters to access Gulf distribution networks with end-to-end single-carrier accountability, avoiding costly third-party freight handoffs.</p>

        <h3>3. Digital Transformation & Modern Fleet Expansion</h3>
        <p>In recent years, Airwin has integrated digital shipment tracking, automated invoicing, customer self-service portals, and expanded line-haul trucking networks. Today, Airwin manages multi-modal freight spanning five continents while maintaining the boutique, responsive service that defined our earliest days.</p>

        <div class="article-key-takeaways">
          <h4>Key Evolution Pillars</h4>
          <ul>
            <li><strong>Ground-Up Industry Knowledge:</strong> Deep roots in air freight and customs regulations.</li>
            <li><strong>International Footprint:</strong> Direct presence in crucial trade nodes between India and the GCC.</li>
            <li><strong>Modern Technology Stack:</strong> Digital tracking and operations management built for scale.</li>
          </ul>
        </div>
      `
    },

    "future-of-logistics": {
      id: "future-of-logistics",
      slug: "the-future-of-logistics-embracing-innovation-with-airwin-logistics",
      aliases: ["the-future-of-logistics", "future-innovation"],
      title: "The Future of Logistics: Embracing Innovation with Airwin Logistics",
      category: "Innovation & Tech",
      accent: "INNOVATION & TECH",
      readTime: "4 MIN READ",
      date: "31 May, 2024",
      author: "Airwin Technology Directorate",
      image: "/images/news/news_6.jpg",
      summary: "Exploring how predictive analytics, digital freight visibility, and intelligent route optimization are revolutionizing supply chain agility for international traders.",
      content: `
        <p class="airwin-article-lead">The logistics sector is undergoing its most profound transformation in decades. Digital freight matching, predictive disruption modeling, and IoT-enabled sensory tracking are converting traditional transport into smart, autonomous supply chain networks.</p>

        <h3>1. Predictive Analytics & Dynamic Routing</h3>
        <p>Machine learning models analyzing historical port congestion, weather patterns, and seasonal carrier capacities now assist our dispatchers in selecting the fastest, most cost-effective routing before freight even leaves the warehouse floor.</p>

        <h3>2. IoT Telemetry in Cold-Chain & High-Value Cargo</h3>
        <p>For perishable commodities, pharmaceuticals, and sensitive electronics, standard track-and-trace is no longer sufficient. Airwin utilizes IoT-enabled sensor pods that report real-time temperature, humidity, shock, and tilt data, giving cargo owners absolute confidence during multi-modal handoffs.</p>

        <h3>3. The Human-Centric Tech Advantage</h3>
        <p>While technology drives speed, logistics remains a people business. At Airwin, digital tools do not replace customer relationships—they empower our operational coordinators to solve issues before they impact transit timelines.</p>

        <div class="article-key-takeaways">
          <h4>Future-Ready Capabilities</h4>
          <ul>
            <li><strong>Predictive Lane Modeling:</strong> Anticipating delays before consignments encounter bottlenecks.</li>
            <li><strong>Active Condition Monitoring:</strong> Real-time environmental tracking for sensitive cargo.</li>
            <li><strong>Customer Portal Integration:</strong> Real-time document retrieval and status tracking.</li>
          </ul>
        </div>
      `
    },

    "power-of-collaboration": {
      id: "power-of-collaboration",
      slug: "the-power-of-collaboration-airwin-logistics-approach-to-partnership",
      aliases: ["the-power-of-collaboration", "power-of-collaboration"],
      title: "The Power of Collaboration: Airwin Logistics' Approach to Partnership",
      category: "Strategic Alliances",
      accent: "STRATEGIC ALLIANCES",
      readTime: "4 MIN READ",
      date: "31 May, 2024",
      author: "Airwin Partner Relations",
      image: "/images/news/news_7.jpg",
      summary: "Building enduring, high-trust alliances with airline carriers, shipping lines, and ground infrastructure partners to ensure capacity access even in peak freight seasons.",
      content: `
        <p class="airwin-article-lead">In a globalized economy characterized by sudden market shifts and volatile freight rates, no logistics company can succeed in isolation. Lasting success depends on the depth and mutual trust of strategic industry alliances.</p>

        <h3>1. Block Space Agreements & Capacity Guarantees</h3>
        <p>Airwin's long-standing agreements with commercial and cargo airline operators ensure dedicated hold capacity during peak holiday and harvest shipping rushes. Our clients enjoy guaranteed allocations when spot-market shippers face cancellations or steep surcharges.</p>

        <h3>2. Symbiotic Maritime Alliances</h3>
        <p>By coordinating container volume commitments with primary ocean shipping consortia, Airwin secures favorable demurrage terms, priority container yard release, and reliable feeder vessel connections across major Asian and Middle Eastern transshipment ports.</p>

        <h3>3. Collaborative Customer Relationships</h3>
        <p>We treat our clients as long-term strategic partners rather than one-off transactional accounts. Dedicated account managers work side-by-side with your procurement and supply chain teams to optimize packaging, tariff classifications, and route selection.</p>

        <div class="article-key-takeaways">
          <h4>The Partnership Benefit</h4>
          <ul>
            <li><strong>Guaranteed Capacity:</strong> Priority cargo hold access even in high-demand seasons.</li>
            <li><strong>Favorable Terms:</strong> Reduced demurrage risks and volume-leveraged freight rates.</li>
            <li><strong>Dedicated Account Management:</strong> Direct access to experienced logistics specialists.</li>
          </ul>
        </div>
      `
    }
  };

  // 2. HELPER TO FIND ARTICLE BY KEY, SLUG, TITLE, OR HREF
  function findArticle(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();

    // Check direct key
    if (AIRWIN_ARTICLES[q]) return AIRWIN_ARTICLES[q];

    // Check slug or aliases
    for (const key in AIRWIN_ARTICLES) {
      const art = AIRWIN_ARTICLES[key];
      if (art.slug.toLowerCase() === q) return art;
      if (art.aliases && art.aliases.some(a => a.toLowerCase() === q)) return art;
      if (q.includes(art.slug.toLowerCase())) return art;
      if (art.title.toLowerCase().includes(q) || q.includes(art.title.toLowerCase())) return art;
    }

    // Fuzzy matching against href fragments
    for (const key in AIRWIN_ARTICLES) {
      const art = AIRWIN_ARTICLES[key];
      if (q.includes(art.id.replace(/-/g, ' '))) return art;
      if (q.includes(art.category.toLowerCase())) return art;
    }

    return null;
  }

  // 3. CREATE MODAL DOM ELEMENTS IF NOT IN PAGE
  let modalBackdrop = null;

  function ensureModal() {
    if (!document.querySelector('link[href*="airwin-article-modal.css"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = '/css/airwin-article-modal.css';
      document.head.appendChild(l);
    }

    if (modalBackdrop) return modalBackdrop;

    modalBackdrop = document.querySelector('.airwin-article-modal-backdrop');
    if (modalBackdrop) return modalBackdrop;

    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'airwin-article-modal-backdrop';
    modalBackdrop.setAttribute('role', 'dialog');
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('aria-hidden', 'true');

    modalBackdrop.innerHTML = `
      <div class="airwin-article-modal-dialog">
        <div class="airwin-article-modal-topbar">
          <div class="airwin-article-modal-badge">
            <span class="modal-badge-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0016CB;"></span>
            <span class="modal-badge-text">ARTICLE</span>
          </div>
          <button type="button" class="airwin-article-modal-close-btn" aria-label="Close article">✕</button>
        </div>
        <div class="airwin-article-modal-content">
          <div class="airwin-article-hero-wrap">
            <img src="" alt="" class="airwin-article-hero-img" loading="eager" />
          </div>
          <div class="airwin-article-meta-row">
            <span class="airwin-article-meta-date"></span>
            <span class="airwin-article-meta-dot">•</span>
            <span class="airwin-article-meta-readtime"></span>
            <span class="airwin-article-meta-dot">•</span>
            <span class="airwin-article-meta-author"></span>
          </div>
          <h1 class="airwin-article-title"></h1>
          <div class="airwin-article-lead"></div>
          <div class="airwin-article-body"></div>
        </div>
        <div class="airwin-article-modal-footer">
          <a href="/contact.html" class="airwin-article-modal-cta-btn">
            <span>Consult Our Freight Experts</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <button type="button" class="airwin-article-modal-dismiss-btn">Close Article</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    // Close on backdrop click (outside dialog)
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) {
        closeArticleModal();
      }
    });

    // Close button clicks
    const closeBtn = modalBackdrop.querySelector('.airwin-article-modal-close-btn');
    const dismissBtn = modalBackdrop.querySelector('.airwin-article-modal-dismiss-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeArticleModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeArticleModal);

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
        closeArticleModal();
      }
    });

    // Wheel isolation: Modal content scrolls independently; page background NEVER scrolls
    modalBackdrop.addEventListener('wheel', function (e) {
      const scrollable = modalBackdrop.querySelector('.airwin-article-modal-content');
      if (!scrollable) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (e.target.closest('.airwin-article-modal-content')) {
        const delta = e.deltaY;
        const atTop = scrollable.scrollTop <= 0 && delta < 0;
        const atBottom = (scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1) && delta > 0;

        if (atTop || atBottom) {
          e.preventDefault();
        }
        e.stopPropagation();
      } else {
        // Outside the scrollable article content (e.g. topbar, backdrop, footer)
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });

    // Touch event isolation for mobile devices
    let touchStartY = 0;
    modalBackdrop.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    modalBackdrop.addEventListener('touchmove', function (e) {
      const scrollable = modalBackdrop.querySelector('.airwin-article-modal-content');
      if (!scrollable || !e.target.closest('.airwin-article-modal-content')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const currentY = e.touches && e.touches[0] ? e.touches[0].clientY : 0;
      const deltaY = touchStartY - currentY;
      const atTop = scrollable.scrollTop <= 0 && deltaY < 0;
      const atBottom = (scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1) && deltaY > 0;

      if (atTop || atBottom) {
        e.preventDefault();
      }
      e.stopPropagation();
    }, { passive: false });

    return modalBackdrop;
  }

  // SCROLL LOCKING HELPERS
  function lockBodyScroll() {
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    document.body.dataset.modalScrollY = scrollY;
    document.documentElement.classList.add('airwin-modal-open');
    document.body.classList.add('airwin-modal-open');
    document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    document.documentElement.style.setProperty('overflow-y', 'hidden', 'important');
    document.body.style.setProperty('overflow', 'hidden', 'important');
    document.body.style.setProperty('overflow-y', 'hidden', 'important');
  }

  function unlockBodyScroll() {
    document.documentElement.classList.remove('airwin-modal-open');
    document.body.classList.remove('airwin-modal-open');
    document.documentElement.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('overflow-y');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow-y');

    const savedY = parseInt(document.body.dataset.modalScrollY || '0', 10);
    if (!isNaN(savedY) && savedY > 0) {
      window.scrollTo(0, savedY);
    }
  }

  // 4. OPEN ARTICLE MODAL
  function openArticleModal(articleOrQuery) {
    const modal = ensureModal();
    let article = null;

    if (typeof articleOrQuery === 'object' && articleOrQuery !== null) {
      article = articleOrQuery;
    } else {
      article = findArticle(articleOrQuery);
    }

    if (!article) {
      console.warn('Airwin Article Modal: Article not found for query:', articleOrQuery);
      return;
    }

    const badgeText = modal.querySelector('.modal-badge-text');
    const heroImg = modal.querySelector('.airwin-article-hero-img');
    const metaDate = modal.querySelector('.airwin-article-meta-date');
    const metaRead = modal.querySelector('.airwin-article-meta-readtime');
    const metaAuthor = modal.querySelector('.airwin-article-meta-author');
    const titleEl = modal.querySelector('.airwin-article-title');
    const leadEl = modal.querySelector('.airwin-article-lead');
    const bodyEl = modal.querySelector('.airwin-article-body');
    const contentScroll = modal.querySelector('.airwin-article-modal-content');

    if (badgeText) badgeText.textContent = (article.category || 'NEWS & UPDATES').toUpperCase();
    if (heroImg) {
      heroImg.src = article.image || '/images/news/news_1.jpg';
      heroImg.alt = article.title || 'Airwin Cargo Article';
    }
    if (metaDate) metaDate.textContent = article.date || '';
    if (metaRead) metaRead.textContent = article.readTime || '4 MIN READ';
    if (metaAuthor) metaAuthor.textContent = article.author || 'Airwin Editorial';
    if (titleEl) titleEl.textContent = article.title || '';
    if (leadEl) {
      if (article.summary) {
        leadEl.textContent = article.summary;
        leadEl.style.display = 'block';
      } else {
        leadEl.style.display = 'none';
      }
    }
    if (bodyEl) {
      bodyEl.innerHTML = article.content || '<p>' + (article.summary || '') + '</p>';
    }

    // Reset scroll to top
    if (contentScroll) contentScroll.scrollTop = 0;

    // Show modal & firmly lock background scroll
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockBodyScroll();

    // Update URL hash cleanly without jumping
    try {
      history.replaceState(null, null, '#article-' + (article.id || article.slug || 'view'));
    } catch (e) {}
  }

  // 5. CLOSE ARTICLE MODAL
  function closeArticleModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    unlockBodyScroll();

    // Clear hash cleanly
    try {
      if (window.location.hash.startsWith('#article-')) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      }
    } catch (e) {}
  }

  // 6. EVENT DELEGATION: ATTACH CLICK HANDLERS
  function setupCardListeners() {
    // Intercept clicks on news cards, blog cards, and news links
    document.addEventListener('click', function (e) {
      // Find closest link or card
      const card = e.target.closest('.airwin-news-card, .airwin-blog-card, [data-article-id]');
      const link = e.target.closest('a.airwin-news-card-link, a.airwin-blog-card-link, a[href*="/news/"], a[href*="#article-"]');

      if (!card && !link) return;

      const targetEl = card || link;
      const href = link ? (link.getAttribute('href') || '') : '';

      // Check if it has data-article-id
      let articleId = targetEl.getAttribute('data-article-id');

      // If not, infer from href
      if (!articleId && href) {
        if (href.includes('#article-')) {
          articleId = href.split('#article-')[1];
        } else if (href.includes('/news/')) {
          const match = href.match(/\/news\/([^\/\?#]+)/);
          if (match && match[1]) articleId = match[1];
        }
      }

      // If still not found, infer from title inside the card
      if (!articleId) {
        const titleEl = targetEl.querySelector('h2, h3, .airwin-news-card-title, .airwin-card-title');
        if (titleEl) articleId = titleEl.textContent.trim();
      }

      if (articleId) {
        const article = findArticle(articleId);
        if (article) {
          e.preventDefault();
          e.stopPropagation();
          openArticleModal(article);
        }
      }
    }, true);
  }

  // 7. HANDLE INITIAL HASH ON LOAD
  function checkInitialHash() {
    const hash = window.location.hash || '';
    if (hash.startsWith('#article-')) {
      const id = hash.replace('#article-', '');
      setTimeout(function () {
        openArticleModal(id);
      }, 150);
    }
  }

  // 8. UNLOCK ANY ACCIDENTAL PAGE LOADERS ON NEWS PAGES
  function unlockStuckLoaders() {
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.add('is-dismissed', 'is-loaded', 'is-hidden');
      loader.style.setProperty('display', 'none', 'important');
      loader.style.setProperty('opacity', '0', 'important');
      loader.style.setProperty('visibility', 'hidden', 'important');
      loader.style.setProperty('pointer-events', 'none', 'important');
    }
    // Only restore scroll if modal is not active
    if (!modalBackdrop || !modalBackdrop.classList.contains('is-open')) {
      document.documentElement.style.setProperty('overflow-y', 'auto', 'important');
      document.body.style.setProperty('overflow-y', 'visible', 'important');
      document.body.style.setProperty('position', 'static', 'important');
    }
  }

  // 9. EXPOSE PUBLIC API
  window.AirwinArticleModal = {
    open: openArticleModal,
    close: closeArticleModal,
    articles: AIRWIN_ARTICLES,
    findArticle: findArticle,
    register: function(art) {
      if (!art || (!art.slug && !art.id)) return;
      const key = (art.slug || art.id).toLowerCase();
      AIRWIN_ARTICLES[key] = {
        id: key,
        slug: art.slug || key,
        title: art.title || '',
        category: art.category || 'Logistics Management',
        accent: (art.category || 'Logistics Management').toUpperCase(),
        readTime: art.read_time || '4 MIN READ',
        date: art.publish_date || '15 May, 2025',
        author: art.author || 'Airwin Editorial',
        image: art.image_url || '/images/news/news_1.jpg',
        summary: art.summary || '',
        content: art.content || '<p>' + (art.summary || '') + '</p>'
      };
    }
  };

  // 10. INITIALIZE ON DOM READY
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ensureModal();
      setupCardListeners();
      checkInitialHash();
      unlockStuckLoaders();
    });
  } else {
    ensureModal();
    setupCardListeners();
    checkInitialHash();
    unlockStuckLoaders();
  }

  window.addEventListener('hashchange', checkInitialHash);
})();
