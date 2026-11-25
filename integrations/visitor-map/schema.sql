-- New aggregate schema. A short-lived per-bucket fingerprint prevents duplicate
-- submissions; no permanent browser identity or raw IP is stored.
CREATE TABLE IF NOT EXISTS visit_dedupe (
  fingerprint TEXT PRIMARY KEY,
  bucket INTEGER NOT NULL,
  country TEXT NOT NULL,
  latitude INTEGER NOT NULL,
  longitude INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS visit_dedupe_bucket ON visit_dedupe(bucket);
CREATE TABLE IF NOT EXISTS visit_regions (
  country TEXT NOT NULL,
  latitude INTEGER NOT NULL,
  longitude INTEGER NOT NULL,
  visits INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(country, latitude, longitude)
);
CREATE TRIGGER IF NOT EXISTS accumulate_visit AFTER INSERT ON visit_dedupe
BEGIN
  INSERT INTO visit_regions(country, latitude, longitude, visits)
    VALUES(NEW.country, NEW.latitude, NEW.longitude, 1)
    ON CONFLICT(country,latitude,longitude) DO UPDATE SET visits=visits+1;
END;
