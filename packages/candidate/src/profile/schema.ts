import { z } from "zod";

// Stable fact IDs — prefix FACT- followed by zero-padded number.
// These IDs are referenced in AnswerGeneration to trace which facts were used.
export const FACT_IDS = {
  FIRST_NAME: "FACT-001",
  MIDDLE_NAME: "FACT-002",
  LAST_NAME: "FACT-003",
  PREFERRED_NAME: "FACT-004",
  EMAIL: "FACT-005",
  PHONE: "FACT-006",
  ADDRESS_STREET: "FACT-007",
  ADDRESS_CITY: "FACT-008",
  ADDRESS_STATE: "FACT-009",
  ADDRESS_ZIP: "FACT-010",
  ADDRESS_COUNTRY: "FACT-011",
  WORK_AUTHORIZATION: "FACT-012",
  SPONSORSHIP: "FACT-013",
  VETERAN_STATUS: "FACT-014",
  DISABILITY_STATUS: "FACT-015",
  DEMOGRAPHICS: "FACT-016",
} as const;

export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zip: z.string().optional(),
  country: z.string().default("United States"),
});

export const SensitiveValueSchema = z.object({
  value: z.string(),
  /** Candidate-provided label, e.g. "US Citizen", "Not a veteran" */
  label: z.string().optional(),
  /** Whether this field requires human approval before being used */
  requiresApproval: z.boolean().default(true),
});

export const EducationSchema = z.object({
  factId: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.number().optional(),
  honors: z.string().optional(),
  current: z.boolean().default(false),
});

export const ExperienceSchema = z.object({
  factId: z.string(),
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  responsibilities: z.array(z.string()),
  location: z.string().optional(),
});

export const ProjectSchema = z.object({
  factId: z.string(),
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const SkillSchema = z.object({
  factId: z.string(),
  name: z.string(),
  category: z.string().optional(),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
});

export const CertificationSchema = z.object({
  factId: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
});

export const LinkSchema = z.object({
  type: z.enum(["linkedin", "github", "portfolio", "twitter", "other"]),
  url: z.string().url(),
  label: z.string().optional(),
});

export const ReusableAnswerSchema = z.object({
  factId: z.string(),
  question: z.string(),
  answer: z.string(),
  tags: z.array(z.string()).default([]),
});

export const CandidatePreferencesSchema = z.object({
  targetRoles: z.array(z.string()).default([]),
  targetLocations: z.array(z.string()).default([]),
  remotePreference: z.enum(["remote", "hybrid", "onsite", "flexible"]).optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  noticePeriodDays: z.number().optional(),
});

export const CandidateProfileSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive().default(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  identity: z.object({
    firstName: z.string().min(1),
    middleName: z.string().optional(),
    lastName: z.string().min(1),
    preferredName: z.string().optional(),
  }),

  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    address: AddressSchema.optional(),
  }),

  education: z.array(EducationSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  links: z.array(LinkSchema).default([]),

  workAuthorization: SensitiveValueSchema.optional(),
  sponsorship: SensitiveValueSchema.optional(),
  veteranStatus: SensitiveValueSchema.optional(),
  disabilityStatus: SensitiveValueSchema.optional(),
  demographics: SensitiveValueSchema.optional(),

  preferences: CandidatePreferencesSchema.optional(),
  reusableAnswers: z.array(ReusableAnswerSchema).default([]),

  /** Raw resume text stored for LLM context during answer generation */
  resumeText: z.string().optional(),
});

/** Partial profile draft produced by LLM resume extraction — before human review */
export const CandidateProfileDraftSchema = CandidateProfileSchema.partial().extend({
  identity: z.object({
    firstName: z.string().min(1),
    middleName: z.string().optional(),
    lastName: z.string().min(1),
    preferredName: z.string().optional(),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    address: AddressSchema.optional(),
  }),
});
