CREATE TABLE IF NOT EXISTS visits (
  visitor_id TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  country TEXT,
  latitude REAL,
  longitude REAL,
  PRIMARY KEY(visitor_id,bucket)
);
CREATE INDEX IF NOT EXISTS visits_country ON visits(country);
CREATE INDEX IF NOT EXISTS visits_point ON visits(latitude,longitude);
