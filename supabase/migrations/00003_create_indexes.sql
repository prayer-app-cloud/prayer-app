-- Prayer requests: query active requests ordered by creation
CREATE INDEX idx_prayer_requests_status_created
  ON prayer_requests (status, created_at DESC);

-- Prayer requests: lookup by share slug (for share links)
CREATE INDEX idx_prayer_requests_share_slug
  ON prayer_requests (share_slug);

-- Prayer requests: lookup by session (for "my prayers")
CREATE INDEX idx_prayer_requests_session_id
  ON prayer_requests (session_id);

-- Prayer requests: find expired requests
CREATE INDEX idx_prayer_requests_expires_at
  ON prayer_requests (expires_at)
  WHERE status = 'active';

-- Prayer taps: lookup taps for a request
CREATE INDEX idx_prayer_taps_request_id
  ON prayer_taps (request_id);

-- Prayer taps: check if session already prayed
CREATE INDEX idx_prayer_taps_session_request
  ON prayer_taps (session_id, request_id);

-- Updates: lookup updates for a request
CREATE INDEX idx_updates_request_id
  ON updates (request_id);

-- Reports: lookup reports for a request
CREATE INDEX idx_reports_request_id
  ON reports (request_id);

-- Notifications: lookup unread notifications for a user
CREATE INDEX idx_notifications_user_unread
  ON notifications (user_session_id, read, created_at DESC);

-- Users: lookup by session_id
CREATE INDEX idx_users_session_id
  ON users (session_id);
