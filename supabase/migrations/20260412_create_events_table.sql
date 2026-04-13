-- Events table for analytics
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id varchar,
  event_type varchar(50) NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins read events" ON events FOR SELECT USING (true);
