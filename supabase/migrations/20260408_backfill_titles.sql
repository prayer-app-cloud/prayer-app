-- Backfill title for existing prayer_requests that have NULL title.
-- Use first sentence (up to first period) or first 80 chars of text.
UPDATE prayer_requests
SET title = CASE
  WHEN position('.' IN text) > 0 AND position('.' IN text) <= 80
    THEN left(text, position('.' IN text) - 1)
  ELSE left(text, 80)
END
WHERE title IS NULL;
