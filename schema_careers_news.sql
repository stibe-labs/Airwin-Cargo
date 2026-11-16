-- ====================================================================
-- AIRWIN CARGO - CAREERS & NEWS UPDATES DATABASE SCHEMA
-- ====================================================================

-- 1. JOB POSTINGS TABLE
CREATE TABLE IF NOT EXISTS job_postings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'Full-Time',
  salary TEXT DEFAULT 'Negotiable',
  experience TEXT DEFAULT 'Freshers or Experienced',
  requirements TEXT,
  responsibilities TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. JOB APPLICATIONS TABLE (CAREERS PARTICIPANTS & REQUESTS)
CREATE TABLE IF NOT EXISTS job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  place TEXT NOT NULL,
  resume_filename TEXT,
  resume_url TEXT,
  cover_notes TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  hr_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. NEWS & UPDATES ARTICLES TABLE
CREATE TABLE IF NOT EXISTS news_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Logistics Management',
  read_time TEXT DEFAULT '4 min read',
  image_url TEXT,
  summary TEXT NOT NULL,
  content TEXT,
  author TEXT DEFAULT 'Airwin Editorial',
  status TEXT NOT NULL DEFAULT 'PUBLISHED',
  publish_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR INSTANT QUERIES
CREATE INDEX IF NOT EXISTS idx_jobs_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON job_postings(created_at);
CREATE INDEX IF NOT EXISTS idx_apps_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_apps_role ON job_applications(role);
CREATE INDEX IF NOT EXISTS idx_apps_created ON job_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_created ON news_articles(created_at);

-- SEED DATA: 3 CURRENT ACTIVE JOB OPENINGS
INSERT INTO job_postings (title, department, location, job_type, salary, experience, requirements, responsibilities, is_active)
VALUES 
(
  'Customer Care Executive',
  'Customer Support',
  'Calicut Airport Jn.',
  'Full-Time',
  'Negotiable',
  'Freshers or Experienced welcome',
  'Language: Hindi, English' || char(10) || 'Basic Computer Knowledge' || char(10) || 'Customer Service Orientation',
  'Prompt communication with freight clients' || char(10) || 'Coordinate shipment updates with airport hubs' || char(10) || 'Assist with booking queries and tracking reports',
  1
),
(
  'Graphic Designer',
  'Creative & Marketing',
  'Calicut Airport Jn.',
  'Full-Time',
  'Negotiable',
  '1-3 Years Experience',
  'Adobe Illustrator, Photoshop & Premiere Pro' || char(10) || 'Strong layout and digital typography skills' || char(10) || 'Portfolio of commercial or branding designs',
  'Manage company social media' || char(10) || 'Upload Videos & Posters regularly' || char(10) || 'Prepare poster ads & promo content' || char(10) || 'Special Day campaigns & creative visual storytelling',
  1
),
(
  'Logistics Manager',
  'Operations & Supply Chain',
  'Dubai, UAE',
  'Full-Time',
  'Negotiable',
  '3-5 Years in Freight/Logistics',
  'In-depth knowledge of UAE customs & freight operations' || char(10) || 'Multi-modal air and sea forwarding experience' || char(10) || 'Demonstrated vendor negotiation & team leadership',
  'Logistics & Operations Management' || char(10) || 'Supply Chain & Distribution Leadership' || char(10) || 'Warehouse & Transportation Networks' || char(10) || 'Inventory Control & Procurement',
  1
);

-- SEED DATA: INITIAL APPLICANTS (SO THE ADMIN SEES PARTICIPANTS IMMEDIATELY)
INSERT INTO job_applications (job_id, role, name, email, phone, place, resume_filename, cover_notes, status, hr_notes)
VALUES
(
  1,
  'Customer Care Executive',
  'Rahul Krishnan',
  'rahul.krishnan@email.com',
  '+91 98471 23456',
  'Kozhikode, Kerala',
  'Rahul_Krishnan_Resume.pdf',
  'Experienced in customer relations and fluent in English, Hindi, and Malayalam. Eager to join Airwin logistics customer operations.',
  'SHORTLISTED',
  'Strong communication skills. Scheduled for interview call on Friday.'
),
(
  2,
  'Graphic Designer',
  'Amina Fathima',
  'amina.designs@email.com',
  '+91 97455 89012',
  'Malappuram, Kerala',
  'Amina_Portfolio_Resume.pdf',
  '3 years experience creating corporate banners, social media campaigns, and brand collateral in freight and retail.',
  'NEW',
  'Portfolio link verified. Reviewing creative samples.'
);

-- SEED DATA: 3 ARTICLES FOR NEWS & UPDATES
INSERT INTO news_articles (title, slug, category, read_time, image_url, summary, content, author, status, publish_date)
VALUES
(
  'Logistics Management: Precision Freight Forwarding in Global Trade',
  'logistics-management-precision-freight-forwarding',
  'Logistics Management',
  '4 min read',
  '/images/news/news_1.jpg',
  'Optimizing end-to-end multi-modal supply chains across air, sea, and land gateways with real-time tracking, transparent milestone monitoring, and priority customs coordination.',
  'Logistics management serves as the structural backbone of modern global trade. With international commerce demanding increasingly agile responses to supply chain fluctuations, freight forwarders must combine real-time GPS telemetry, proactive customs clearance protocols, and strategic transshipment routing to ensure cargo reaches its destination with zero downtime.',
  'Airwin Editorial',
  'PUBLISHED',
  '15 May, 2025'
),
(
  'Domestic Cargo & Line-Haul Networks: Fast, Dedicated Pan-India Distribution',
  'domestic-cargo-line-haul-networks',
  'Domestic Express',
  '3 min read',
  '/images/news/news_2.jpeg',
  'Connecting Tier-1 economic hubs with rapid industrial corridors through scheduled line-haul fleets, synchronized regional transshipment, and time-critical express handling.',
  'Expanding industrial capacity across India requires reliable line-haul road networks that integrate seamlessly with air transit. Airwin Logistics provides synchronized line-haul schedules connecting New Delhi, Bangalore, Mumbai, and Kerala with high-frequency departures and tamper-evident container locks.',
  'Airwin Editorial',
  'PUBLISHED',
  '26 Dec, 2024'
),
(
  'Airwin Logistics: Over 25 Years of Mission-Critical Global Cargo Excellence',
  'airwin-logistics-25-years-global-excellence',
  'Global Network',
  '6 min read',
  '/images/news/news_3.jpeg',
  'Airwin Cargo Services has established a cross-border distribution network that bridges Indian manufacturing zones with Middle East distribution hubs through continuous innovation.',
  'Founded in 2001, Airwin Cargo Services has grown from regional cargo handling into a premier international logistics provider. Spanning major gateways in New Delhi, Calicut, and Dubai, our global carrier partnerships enable seamless door-to-door freight forwarding, courier dispatch, and specialized cargo handling for businesses of every scale.',
  'Airwin Editorial',
  'PUBLISHED',
  '31 Aug, 2024'
);
