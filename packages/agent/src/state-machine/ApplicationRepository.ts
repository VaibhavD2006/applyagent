import { randomUUID } from "crypto";
import { getPool } from "@applyagent/database";
import type { ApplicationState } from "./ApplicationStateMachine.js";

export interface ApplicationRecord {
  id: string;
  candidateId: string;
  candidateVersion: number;
  jobUrl: string;
  jobContext?: unknown;
  state: ApplicationState;
  approvalToken?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ApplicationRepository {
  async create(candidateId: string, candidateVersion: number, jobUrl: string): Promise<ApplicationRecord> {
    const pool = getPool();
    const id = randomUUID();
    const now = new Date();
    await pool.query(
      `INSERT INTO applications (id, candidate_id, candidate_version, job_url, state, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'CREATED', $5, $6)`,
      [id, candidateId, candidateVersion, jobUrl, now, now],
    );
    return { id, candidateId, candidateVersion, jobUrl, state: "CREATED", createdAt: now, updatedAt: now };
  }

  async updateState(
    id: string,
    state: ApplicationState,
    extra: { approvalToken?: string; errorMessage?: string; jobContext?: unknown } = {},
  ): Promise<void> {
    const pool = getPool();
    await pool.query(
      `UPDATE applications SET state=$1, approval_token=COALESCE($2, approval_token),
       error_message=COALESCE($3, error_message),
       job_context=COALESCE($4::jsonb, job_context), updated_at=NOW()
       WHERE id=$5`,
      [state, extra.approvalToken ?? null, extra.errorMessage ?? null,
       extra.jobContext ? JSON.stringify(extra.jobContext) : null, id],
    );
    await pool.query(
      `INSERT INTO application_events (application_id, to_state, event) VALUES ($1, $2, $3)`,
      [id, state, `transition_to_${state}`],
    );
  }

  async getById(id: string): Promise<ApplicationRecord | null> {
    const pool = getPool();
    const r = await pool.query(`SELECT * FROM applications WHERE id=$1`, [id]);
    if (r.rows.length === 0) return null;
    const row = r.rows[0]!;
    return {
      id: row.id,
      candidateId: row.candidate_id,
      candidateVersion: row.candidate_version,
      jobUrl: row.job_url,
      jobContext: row.job_context,
      state: row.state,
      approvalToken: row.approval_token,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
