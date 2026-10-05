import { z } from "zod";
import type { LLMClient } from "@applyagent/llm";
import {
  CandidateProfileDraftSchema,
  EducationSchema,
  ExperienceSchema,
  ProjectSchema,
  SkillSchema,
  CertificationSchema,
  LinkSchema,
} from "../profile/schema.js";
import type { CandidateProfileDraft } from "../profile/types.js";

// Subset schema for what the LLM can safely extract from a resume
const ExtractedResumeSchema = z.object({
  identity: z
    .object({
      firstName: z.string(),
      middleName: z.string().optional(),
      lastName: z.string(),
      preferredName: z.string().optional(),
    })
    .optional(),
  contact: z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  education: z.array(EducationSchema.omit({ factId: true })).optional(),
  experience: z.array(ExperienceSchema.omit({ factId: true })).optional(),
  projects: z.array(ProjectSchema.omit({ factId: true })).optional(),
  skills: z.array(SkillSchema.omit({ factId: true })).optional(),
  certifications: z.array(CertificationSchema.omit({ factId: true })).optional(),
  links: z.array(LinkSchema).optional(),
});

type ExtractedResume = z.infer<typeof ExtractedResumeSchema>;

export class LLMExtractor {
  constructor(private readonly llm: LLMClient) {}

  /**
   * Extracts structured candidate facts from resume text.
   * Returns a draft — must be reviewed and approved by the candidate before use.
   * Never fabricates: only extracts what is present in the text.
   */
  async extract(resumeText: string): Promise<CandidateProfileDraft> {
    const prompt = buildExtractionPrompt(resumeText);
    const extracted = await this.llm.generate(prompt, ExtractedResumeSchema);
    return assembleDraft(extracted, resumeText);
  }
}

function buildExtractionPrompt(resumeText: string): string {
  return `You are a resume parser. Extract structured information from the resume below.

RULES:
- Only extract information that is explicitly present in the resume text.
- Do NOT invent, infer, or fill in any missing information.
- If a field is not present, omit it entirely.
- Return ONLY valid JSON matching the schema. No explanation, no markdown, just JSON.
- For education/experience/projects/skills/certifications, generate a factId like "FACT-E001", "FACT-X001", "FACT-P001", "FACT-S001", "FACT-C001" etc.

SCHEMA (return JSON matching this shape):
{
  "identity": { "firstName": string, "middleName"?: string, "lastName": string, "preferredName"?: string },
  "contact": { "email"?: string, "phone"?: string },
  "education": [{ "factId": string, "institution": string, "degree": string, "field"?: string, "startDate"?: string, "endDate"?: string, "current": boolean }],
  "experience": [{ "factId": string, "company": string, "title": string, "startDate": string, "endDate"?: string, "current": boolean, "responsibilities": string[], "location"?: string }],
  "projects": [{ "factId": string, "name": string, "description": string, "technologies": string[], "url"?: string }],
  "skills": [{ "factId": string, "name": string, "category"?: string, "proficiency"?: "beginner"|"intermediate"|"advanced"|"expert" }],
  "certifications": [{ "factId": string, "name": string, "issuer": string, "date"?: string }],
  "links": [{ "type": "linkedin"|"github"|"portfolio"|"twitter"|"other", "url": string }]
}

RESUME TEXT:
${resumeText}`;
}

function assembleDraft(extracted: ExtractedResume, resumeText: string): CandidateProfileDraft {
  const now = new Date();
  // Assign factIds to items that came back without them (LLM should have added them, but be safe)
  const education = (extracted.education ?? []).map((e, i) => ({
    ...e,
    factId: (e as { factId?: string }).factId ?? `FACT-E${String(i + 1).padStart(3, "0")}`,
    current: e.current ?? false,
    responsibilities: [],
  }));

  const experience = (extracted.experience ?? []).map((e, i) => ({
    ...e,
    factId: (e as { factId?: string }).factId ?? `FACT-X${String(i + 1).padStart(3, "0")}`,
    current: e.current ?? false,
    responsibilities: e.responsibilities ?? [],
  }));

  const projects = (extracted.projects ?? []).map((p, i) => ({
    ...p,
    factId: (p as { factId?: string }).factId ?? `FACT-P${String(i + 1).padStart(3, "0")}`,
    technologies: p.technologies ?? [],
  }));

  const skills = (extracted.skills ?? []).map((s, i) => ({
    ...s,
    factId: (s as { factId?: string }).factId ?? `FACT-S${String(i + 1).padStart(3, "0")}`,
  }));

  const certifications = (extracted.certifications ?? []).map((c, i) => ({
    ...c,
    factId: (c as { factId?: string }).factId ?? `FACT-C${String(i + 1).padStart(3, "0")}`,
  }));

  return {
    identity: extracted.identity ?? { firstName: "", lastName: "" },
    contact: {
      email: extracted.contact?.email ?? "",
      phone: extracted.contact?.phone,
    },
    education,
    experience,
    projects,
    skills,
    certifications,
    links: extracted.links ?? [],
    reusableAnswers: [],
    resumeText,
    createdAt: now,
    updatedAt: now,
  };
}
