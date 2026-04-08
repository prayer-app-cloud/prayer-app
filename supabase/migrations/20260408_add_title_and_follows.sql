-- Add title column to prayer_requests
ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS title varchar(100);

-- Create prayer_follows table
CREATE TABLE IF NOT EXISTS prayer_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id text NOT NULL,
  prayer_request_id uuid NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_session_id, prayer_request_id)
);

-- RLS for prayer_follows
ALTER TABLE prayer_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own follows"
  ON prayer_follows FOR SELECT
  USING (user_session_id = auth.uid()::text);

CREATE POLICY "Users can insert own follows"
  ON prayer_follows FOR INSERT
  WITH CHECK (user_session_id = auth.uid()::text);

CREATE POLICY "Users can delete own follows"
  ON prayer_follows FOR DELETE
  USING (user_session_id = auth.uid()::text);
