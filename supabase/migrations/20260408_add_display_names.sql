-- Add display_name to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name varchar(50);

-- Add display_name_snapshot to prayer_requests table
ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS display_name_snapshot varchar(50);
