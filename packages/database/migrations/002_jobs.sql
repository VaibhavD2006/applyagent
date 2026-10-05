-- Migration 002: jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  url         TEXT        NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  company     TEXT        NOT NULL,
  description TEXT,
  ats_type    TEXT        NOT NULL DEFAULT 'generic',
  job_json    JSONB       NOT NULL,
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS jobs_url_idx ON jobs (url);
