-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Users table
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR NOT NULL UNIQUE,
  auth_method auth_method_enum NOT NULL DEFAULT 'anonymous',
  email VARCHAR,
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  push_token VARCHAR,
  trust_score INTEGER NOT NULL DEFAULT 100,
  strike_count INTEGER NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Prayer Requests table
-- ============================================================
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text VARCHAR(500) NOT NULL,
  category category_enum[] NOT NULL,
  session_id VARCHAR NOT NULL,
  email VARCHAR,
  prayer_points TEXT,
  guided_prayer TEXT,
  prayer_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  status request_status_enum NOT NULL DEFAULT 'active',
  anonymous BOOLEAN NOT NULL DEFAULT true,
  urgency urgency_enum NOT NULL DEFAULT 'normal',
  update_text VARCHAR(280),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  share_slug VARCHAR NOT NULL UNIQUE,
  is_seed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Prayer Taps table
-- ============================================================
CREATE TABLE prayer_taps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  session_id VARCHAR NOT NULL,
  source tap_source_enum NOT NULL DEFAULT 'community',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, session_id)
);

-- ============================================================
-- Updates table
-- ============================================================
CREATE TABLE updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  type update_type_enum NOT NULL,
  text VARCHAR(280) NOT NULL,
  is_seed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Reports table
-- ============================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  reason report_reason_enum NOT NULL,
  reporter_session_id VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Notifications table
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id VARCHAR NOT NULL,
  type notification_type_enum NOT NULL,
  request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
