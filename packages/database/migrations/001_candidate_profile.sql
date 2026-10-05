-- Migration 001: candidate_profiles table
-- Profiles are versioned and immutable after creation.
-- Updates create a new row with an incremented version number.

CREATE TABLE IF NOT EXISTS candidate_profiles (
  id            UUID        NOT NULL,
  version       INTEGER     NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- identity
  first_name    TEXT        NOT NULL,
  middle_name   TEXT,
  last_name     TEXT        NOT NULL,
  preferred_name TEXT,

  -- contact
  email         TEXT        NOT NULL,
  phone         TEXT,

  -- full structured profile stored as JSONB for flexibility
  -- individual columns above are indexed for fast lookup
  profile_json  JSONB       NOT NULL,

  -- raw resume text for LLM context
  resume_text   TEXT,

  PRIMARY KEY (id, version)
);

CREATE INDEX IF NOT EXISTS candidate_profiles_id_idx ON candidate_profiles (id);
CREATE INDEX IF NOT EXISTS candidate_profiles_email_idx ON candidate_profiles (email);
