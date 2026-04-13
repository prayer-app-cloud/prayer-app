-- Prayer journal entries
CREATE TABLE IF NOT EXISTS prayer_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id varchar NOT NULL,
  request_id uuid REFERENCES prayer_requests(id) ON DELETE SET NULL,
  text varchar(500) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_session ON prayer_journal_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_created ON prayer_journal_entries(created_at DESC);

-- Prayer reminders
CREATE TABLE IF NOT EXISTS prayer_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id varchar NOT NULL UNIQUE,
  reminder_time varchar NOT NULL DEFAULT '08:00',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_session ON prayer_reminders(session_id);

-- RLS policies
ALTER TABLE prayer_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_reminders ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (session-based auth, not Supabase Auth)
CREATE POLICY "journal_all" ON prayer_journal_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "reminders_all" ON prayer_reminders FOR ALL USING (true) WITH CHECK (true);
