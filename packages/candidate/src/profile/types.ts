import { z } from "zod";
import {
  CandidateProfileSchema,
  CandidateProfileDraftSchema,
  EducationSchema,
  ExperienceSchema,
  ProjectSchema,
  SkillSchema,
  CertificationSchema,
  AddressSchema,
  SensitiveValueSchema,
  LinkSchema,
  ReusableAnswerSchema,
  CandidatePreferencesSchema,
} from "./schema.js";

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;
export type CandidateProfileDraft = z.infer<typeof CandidateProfileDraftSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type SensitiveValue = z.infer<typeof SensitiveValueSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type ReusableAnswer = z.infer<typeof ReusableAnswerSchema>;
export type CandidatePreferences = z.infer<typeof CandidatePreferencesSchema>;
