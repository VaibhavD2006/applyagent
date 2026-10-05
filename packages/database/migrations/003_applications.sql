-- Migration 003: applications table
-- Tracks state machine transitions for every job application.
-- State is always persisted BEFORE execution — crash recovery reads from DB.

CREATE TYPE application_state AS ENUM (
  'CREATED',
  'JOB_LOADED',
  'APPLICATION_OPEN',
  'FORM_DISCOVERED',
  'FORM_MAPPED',
  'FILLING',
  'NEEDS_HUMAN_REVIEW',
  'READY_TO_SUBMIT',
  'SUBMITTED',
  'VERIFIED',
  'BLOCKED_CAPTCHA',
  'BLOCKED_UNSUPPORTED',
  'FAILED',
  'CANCELLED'
);

CREATE TABLE IF NOT EXISTS applications (
  id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id        UUID              NOT NULL,
  candidate_version   INTEGER           NOT NULL,
  job_url             TEXT              NOT NULL,
  job_context         JSONB,
  state               application_state NOT NULL DEFAULT 'CREATED',
  approval_token      TEXT,
  error_message       TEXT,
  created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_events (
  id              BIGSERIAL     PRIMARY KEY,
  application_id  UUID          NOT NULL REFERENCES applications(id),
  from_state      TEXT,
  to_state        TEXT          NOT NULL,
  event           TEXT          NOT NULL,
  metadata        JSONB,
  occurred_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS applications_candidate_idx ON applications (candidate_id);
CREATE INDEX IF NOT EXISTS application_events_app_idx ON application_events (application_id);
