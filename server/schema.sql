CREATE TABLE IF NOT EXISTS scans (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('human', 'synthetic', 'uncertain')),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  duration_sec INTEGER,
  accent JSONB,
  evidence JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at DESC);
