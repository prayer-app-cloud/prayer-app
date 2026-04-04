-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_taps ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: get current user's session_id from users table
-- Maps Supabase auth.uid() to our session_id
-- ============================================================
CREATE OR REPLACE FUNCTION get_session_id()
RETURNS VARCHAR AS $$
  SELECT session_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Users policies
-- ============================================================
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- Prayer Requests policies
-- ============================================================
-- Anyone authenticated can read active, non-removed requests
CREATE POLICY "prayer_requests_select_active" ON prayer_requests
  FOR SELECT USING (
    status IN ('active', 'updated', 'answered')
    AND report_count < 3
  );

-- Authenticated users can create requests
CREATE POLICY "prayer_requests_insert" ON prayer_requests
  FOR INSERT WITH CHECK (session_id = get_session_id());

-- Only the original poster can update their request
CREATE POLICY "prayer_requests_update_own" ON prayer_requests
  FOR UPDATE USING (session_id = get_session_id());

-- ============================================================
-- Prayer Taps policies
-- ============================================================
CREATE POLICY "prayer_taps_select_own" ON prayer_taps
  FOR SELECT USING (session_id = get_session_id());

CREATE POLICY "prayer_taps_insert" ON prayer_taps
  FOR INSERT WITH CHECK (session_id = get_session_id());

-- ============================================================
-- Updates policies
-- ============================================================
-- Anyone can read updates on visible requests
CREATE POLICY "updates_select" ON updates
  FOR SELECT USING (true);

-- Only original poster can create updates
CREATE POLICY "updates_insert" ON updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prayer_requests
      WHERE id = request_id
      AND session_id = get_session_id()
    )
  );

-- ============================================================
-- Reports policies
-- ============================================================
CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (reporter_session_id = get_session_id());

CREATE POLICY "reports_select_own" ON reports
  FOR SELECT USING (reporter_session_id = get_session_id());

-- ============================================================
-- Notifications policies
-- ============================================================
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_session_id = get_session_id());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_session_id = get_session_id());
