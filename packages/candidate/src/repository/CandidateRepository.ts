import { randomUUID } from "crypto";
import { getPool } from "@applyagent/database";
import { CandidateProfileSchema } from "../profile/schema.js";
import type { CandidateProfile } from "../profile/types.js";

export class CandidateRepository {
  async create(data: Omit<CandidateProfile, "id" | "version" | "createdAt" | "updatedAt">): Promise<CandidateProfile> {
    const pool = getPool();
    const id = randomUUID();
    const now = new Date();
    const profile: CandidateProfile = CandidateProfileSchema.parse({
      ...data,
      id,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    await pool.query(
      `INSERT INTO candidate_profiles
         (id, version, created_at, updated_at, first_name, middle_name, last_name, preferred_name, email, phone, profile_json, resume_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        profile.id,
        profile.version,
        profile.createdAt,
        profile.updatedAt,
        profile.identity.firstName,
        profile.identity.middleName ?? null,
        profile.identity.lastName,
        profile.identity.preferredName ?? null,
        profile.contact.email,
        profile.contact.phone ?? null,
        JSON.stringify(profile),
        profile.resumeText ?? null,
      ],
    );

    return profile;
  }

  async getLatestVersion(id: string): Promise<CandidateProfile | null> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT profile_json FROM candidate_profiles
       WHERE id = $1 ORDER BY version DESC LIMIT 1`,
      [id],
    );
    if (result.rows.length === 0) return null;
    return CandidateProfileSchema.parse(result.rows[0]!.profile_json);
  }

  async getVersion(id: string, version: number): Promise<CandidateProfile | null> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT profile_json FROM candidate_profiles WHERE id = $1 AND version = $2`,
      [id, version],
    );
    if (result.rows.length === 0) return null;
    return CandidateProfileSchema.parse(result.rows[0]!.profile_json);
  }

  /** Creates a new version row — never mutates existing rows */
  async update(
    id: string,
    updates: Partial<Omit<CandidateProfile, "id" | "version" | "createdAt" | "updatedAt">>,
  ): Promise<CandidateProfile> {
    const existing = await this.getLatestVersion(id);
    if (!existing) throw new Error(`Candidate ${id} not found`);

    const now = new Date();
    const next: CandidateProfile = CandidateProfileSchema.parse({
      ...existing,
      ...updates,
      id,
      version: existing.version + 1,
      createdAt: existing.createdAt,
      updatedAt: now,
    });

    await getPool().query(
      `INSERT INTO candidate_profiles
         (id, version, created_at, updated_at, first_name, middle_name, last_name, preferred_name, email, phone, profile_json, resume_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        next.id,
        next.version,
        next.createdAt,
        next.updatedAt,
        next.identity.firstName,
        next.identity.middleName ?? null,
        next.identity.lastName,
        next.identity.preferredName ?? null,
        next.contact.email,
        next.contact.phone ?? null,
        JSON.stringify(next),
        next.resumeText ?? null,
      ],
    );

    return next;
  }
}
