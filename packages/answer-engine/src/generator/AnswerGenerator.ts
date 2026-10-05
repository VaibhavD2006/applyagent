import { z } from "zod";
import type { LLMClient } from "@applyagent/llm";
import type { CandidateProfile } from "@applyagent/candidate";
import type { JobContext } from "@applyagent/job";

export const AnswerSchema = z.object({
  answer: z.string().min(1),
  factsUsed: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
  requiresApproval: z.boolean(),
  reason: z.string(),
});
export type GeneratedAnswer = z.infer<typeof AnswerSchema>;

export interface GenerateOptions {
  maxWords?: number;
}

export class AnswerGenerator {
  constructor(private readonly llm: LLMClient) {}

  async generate(
    question: string,
    profile: CandidateProfile,
    job: JobContext,
    options: GenerateOptions = {},
  ): Promise<GeneratedAnswer> {
    const prompt = buildGeneratePrompt(question, profile, job, options);
    return this.llm.generate(prompt, AnswerSchema, { temperature: 0.3 });
  }
}

function buildGeneratePrompt(
  question: string,
  profile: CandidateProfile,
  job: JobContext,
  options: GenerateOptions,
): string {
  const facts = serializeFacts(profile);
  const { maxWords = 150 } = options;

  return `You are helping a job candidate answer an application question.

CRITICAL RULES:
1. Only use facts from the CANDIDATE FACTS section below. Never invent information.
2. Every claim you make must be traceable to one of the provided facts.
3. If you cannot answer truthfully from the facts, set requiresApproval to true.
4. Do NOT fabricate companies, dates, skills, achievements, or any other information.
5. Keep the answer under ${maxWords} words unless the question clearly requires more.

JOB: ${job.title} at ${job.company}
JOB DESCRIPTION SUMMARY: ${job.description.slice(0, 500)}

CANDIDATE FACTS:
${facts}

QUESTION: "${question}"

Return ONLY valid JSON:
{
  "answer": "the answer text",
  "factsUsed": ["FACT-001", "FACT-002"],
  "confidence": 0.0-1.0,
  "requiresApproval": false,
  "reason": "brief explanation of approach"
}`;
}

function serializeFacts(profile: CandidateProfile): string {
  const lines: string[] = [];

  lines.push(`FACT-001: First Name = ${profile.identity.firstName}`);
  lines.push(`FACT-003: Last Name = ${profile.identity.lastName}`);
  lines.push(`FACT-005: Email = ${profile.contact.email}`);
  if (profile.contact.phone) lines.push(`FACT-006: Phone = ${profile.contact.phone}`);

  profile.education.forEach((e) => {
    lines.push(`${e.factId}: Education — ${e.degree} in ${e.field ?? "unknown"} from ${e.institution} (${e.startDate ?? "?"} – ${e.endDate ?? "present"})`);
  });

  profile.experience.forEach((e) => {
    const resp = e.responsibilities.slice(0, 3).join("; ");
    lines.push(`${e.factId}: Experience — ${e.title} at ${e.company} (${e.startDate} – ${e.endDate ?? "present"}): ${resp}`);
  });

  profile.projects.forEach((p) => {
    lines.push(`${p.factId}: Project — ${p.name}: ${p.description.slice(0, 200)} [${p.technologies.join(", ")}]`);
  });

  profile.skills.forEach((s) => {
    lines.push(`${s.factId}: Skill — ${s.name}${s.proficiency ? ` (${s.proficiency})` : ""}`);
  });

  profile.reusableAnswers.forEach((r) => {
    lines.push(`${r.factId}: Reusable Answer for "${r.question}" = ${r.answer}`);
  });

  return lines.join("\n");
}
