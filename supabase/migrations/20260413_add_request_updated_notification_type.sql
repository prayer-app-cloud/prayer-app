-- Add 'request_updated' to notification_type_enum
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'request_updated';
