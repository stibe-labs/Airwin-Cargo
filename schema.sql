-- ====================================================================
-- AIRWIN CARGO & LOGISTICS - DATABASE SCHEMA (CLOUDFLARE D1)
-- ====================================================================

-- 1. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'superadmin',
  name TEXT NOT NULL,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS shipments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  awb_number TEXT UNIQUE NOT NULL,
  reference_no TEXT,
  cargo_type TEXT NOT NULL DEFAULT 'Air Freight',
  service_level TEXT NOT NULL DEFAULT 'Standard',
  origin_hub TEXT NOT NULL,
  origin_country TEXT NOT NULL DEFAULT 'UAE',
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL DEFAULT 'India',
  sender_name TEXT,
  sender_company TEXT,
  sender_phone TEXT,
  receiver_name TEXT,
  receiver_company TEXT,
  receiver_phone TEXT,
  pieces INTEGER DEFAULT 1,
  weight_kg REAL DEFAULT 0.0,
  dimensions TEXT,
  current_status TEXT NOT NULL DEFAULT 'BOOKED',
  estimated_delivery TEXT,
  delivered_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. SHIPMENT CHECKPOINTS (MILESTONE TIMELINE)
CREATE TABLE IF NOT EXISTS shipment_checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  service_of_interest TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. FREIGHT QUOTE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  service_type TEXT NOT NULL DEFAULT 'Air Freight',
  origin TEXT,
  destination TEXT,
  cargo_weight TEXT,
  cargo_dimensions TEXT,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  quoted_amount REAL,
  currency TEXT DEFAULT 'USD',
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON shipments(awb_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(current_status);
CREATE INDEX IF NOT EXISTS idx_shipments_created ON shipments(created_at);
CREATE INDEX IF NOT EXISTS idx_checkpoints_shipment ON shipment_checkpoints(shipment_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON contact_inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quote_requests(created_at);

-- ====================================================================
-- SEED INITIAL SUPERADMIN USER
-- Default login: admin@airwincargo.com / Airwin@Admin2026!
-- ====================================================================
INSERT OR IGNORE INTO admin_users (
  id, username, email, password_hash, salt, role, name
) VALUES (
  1,
  'admin@airwincargo.com',
  'admin@airwincargo.com',
  'de4c272ae7e319e4ad75ed906145438077e3e40884aae9f3cd8436913af26679',
  'e8a8508871ba04763f21e2531589c571',
  'superadmin',
  'Airwin Operations Manager'
);

-- ====================================================================
-- SEED INITIAL SAMPLE SHIPMENT (Matches the placeholder on /tracking.html)
-- ====================================================================
INSERT OR IGNORE INTO shipments (
  id, awb_number, reference_no, cargo_type, service_level,
  origin_hub, origin_country, destination_city, destination_country,
  sender_name, sender_company, sender_phone,
  receiver_name, receiver_company, receiver_phone,
  pieces, weight_kg, dimensions, current_status, estimated_delivery
) VALUES (
  1,
  'AWB-92847102',
  'REF-DXB-2026-089',
  'Air Freight',
  'Priority Express',
  'Dubai Hub (Al Quoz / DXB)',
  'United Arab Emirates',
  'Calicut (CCJ)',
  'India',
  'Rashid Al-Maktoum',
  'Gulf Logistics Trading LLC',
  '+971 55 319 4717',
  'Abdul Rahman',
  'Malabar Imports & Distribution',
  '+91 8714 507 770',
  12,
  450.5,
  '120 x 80 x 110 cm (x2 pallets)',
  'IN_FLIGHT',
  'Nov 18, 2026 - 16:30 IST'
);

-- Checkpoints for sample shipment
INSERT OR IGNORE INTO shipment_checkpoints (
  id, shipment_id, status, location, description, timestamp
) VALUES
  (1, 1, 'BOOKED', 'Dubai Hub (DXB)', 'Electronic shipment booking created & confirmed with carrier allocation.', datetime('now', '-2 days', '+4 hours')),
  (2, 1, 'PICKED_UP', 'Al Quoz Industrial, Dubai', 'Cargo picked up from shipper warehouse by Airwin ground fleet.', datetime('now', '-1 day', '+8 hours')),
  (3, 1, 'RECEIVED_AT_ORIGIN', 'Airwin Cargo Terminal, DXB', 'Consignment received at sorting facility, weighed and security screened.', datetime('now', '-1 day', '+14 hours')),
  (4, 1, 'CUSTOMS_CLEARED_ORIGIN', 'Dubai Airport Customs', 'Export customs declaration passed and export manifest released.', datetime('now', '-12 hours')),
  (5, 1, 'IN_FLIGHT', 'En Route (DXB -> CCJ)', 'Cargo loaded into Boeing 777F cargo hold; flight en route to destination hub.', datetime('now', '-3 hours'));
