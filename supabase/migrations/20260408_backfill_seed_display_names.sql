-- Backfill NULL display_name_snapshot on existing prayer_requests
-- with random generated names so the feed looks inhabited.
-- Each request gets a unique pseudonymous name.

WITH names AS (
  SELECT
    id,
    (
      CASE (floor(random() * 10)::int)
        WHEN 0 THEN 'Quiet'
        WHEN 1 THEN 'Still'
        WHEN 2 THEN 'Gentle'
        WHEN 3 THEN 'Kind'
        WHEN 4 THEN 'Steady'
        WHEN 5 THEN 'Faithful'
        WHEN 6 THEN 'Hopeful'
        WHEN 7 THEN 'Tender'
        WHEN 8 THEN 'Calm'
        ELSE 'Warm'
      END
      ||
      CASE (floor(random() * 10)::int)
        WHEN 0 THEN 'River'
        WHEN 1 THEN 'Light'
        WHEN 2 THEN 'Harbor'
        WHEN 3 THEN 'Meadow'
        WHEN 4 THEN 'Stone'
        WHEN 5 THEN 'Rain'
        WHEN 6 THEN 'Dawn'
        WHEN 7 THEN 'Shore'
        WHEN 8 THEN 'Breeze'
        ELSE 'Garden'
      END
    ) AS generated_name
  FROM prayer_requests
  WHERE display_name_snapshot IS NULL
)
UPDATE prayer_requests
SET display_name_snapshot = names.generated_name
FROM names
WHERE prayer_requests.id = names.id;
