-- Delete old seed prayers that don't have proper titles
-- (backfilled titles are extracted from body text, so they match the body opening)
DELETE FROM prayer_requests
WHERE is_seed = true
  AND created_at < now() - interval '1 day'
  AND (title IS NULL OR text LIKE title || '%');
