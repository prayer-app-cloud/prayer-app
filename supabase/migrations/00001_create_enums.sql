-- Prayer request categories
CREATE TYPE category_enum AS ENUM (
  'health',
  'family',
  'grief',
  'finances',
  'inner_struggle',
  'work_school',
  'other'
);

-- Request status lifecycle
CREATE TYPE request_status_enum AS ENUM (
  'active',
  'updated',
  'answered',
  'removed',
  'expired'
);

-- Urgency levels
CREATE TYPE urgency_enum AS ENUM (
  'normal',
  'high'
);

-- Source of prayer taps
CREATE TYPE tap_source_enum AS ENUM (
  'community',
  'screen_lock',
  'seed'
);

-- Update types
CREATE TYPE update_type_enum AS ENUM (
  'update',
  'answered'
);

-- Auth methods
CREATE TYPE auth_method_enum AS ENUM (
  'anonymous',
  'email'
);

-- Report reasons
CREATE TYPE report_reason_enum AS ENUM (
  'spam',
  'inappropriate',
  'harmful',
  'self_harm',
  'other'
);

-- Notification types
CREATE TYPE notification_type_enum AS ENUM (
  'prayer_received',
  'request_answered',
  'expiry_warning',
  'milestone'
);
