import { describe, it, expect } from "vitest";
import {
  CandidateProfileSchema,
  FACT_IDS,
} from "../../../packages/candidate/src/profile/schema.js";

const BASE_PROFILE = {
  id: "00000000-0000-0000-0000-000000000001",
  version: 1,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  identity: { firstName: "Alice", lastName: "Smith" },
  contact: { email: "alice@example.com" },
};

describe("CandidateProfileSchema", () => {
  it("parses a minimal valid profile", () => {
    const result = CandidateProfileSchema.safeParse(BASE_PROFILE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identity.firstName).toBe("Alice");
      expect(result.data.contact.email).toBe("alice@example.com");
      expect(result.data.version).toBe(1);
    }
  });

  it("parses a full profile with all optional fields", () => {
    const full = {
      ...BASE_PROFILE,
      identity: {
        firstName: "Alice",
        middleName: "M",
        lastName: "Smith",
        preferredName: "Ali",
      },
      contact: {
        email: "alice@example.com",
        phone: "+1-555-555-5555",
        address: { city: "San Francisco", state: "CA", country: "United States" },
      },
      education: [
        {
          factId: "FACT-E001",
          institution: "MIT",
          degree: "BS",
          field: "Computer Science",
          startDate: "2018-09",
          endDate: "2022-05",
          current: false,
        },
      ],
      experience: [
        {
          factId: "FACT-X001",
          company: "Acme Corp",
          title: "Software Engineer",
          startDate: "2022-06",
          current: true,
          responsibilities: ["Built features", "Reviewed PRs"],
        },
      ],
      skills: [{ factId: "FACT-S001", name: "TypeScript", proficiency: "expert" as const }],
      links: [{ type: "linkedin" as const, url: "https://linkedin.com/in/alice" }],
      workAuthorization: { value: "us_citizen", label: "US Citizen", requiresApproval: true },
      reusableAnswers: [
        {
          factId: "FACT-R001",
          question: "Why do you want to work here?",
          answer: "I love the mission.",
          tags: ["motivation"],
        },
      ],
    };
    const result = CandidateProfileSchema.safeParse(full);
    expect(result.success).toBe(true);
  });

  it("rejects profile with invalid email", () => {
    const result = CandidateProfileSchema.safeParse({
      ...BASE_PROFILE,
      contact: { email: "not-an-email" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects profile missing firstName", () => {
    const result = CandidateProfileSchema.safeParse({
      ...BASE_PROFILE,
      identity: { lastName: "Smith" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects profile with invalid UUID", () => {
    const result = CandidateProfileSchema.safeParse({
      ...BASE_PROFILE,
      id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("defaults education/experience/skills arrays to empty", () => {
    const result = CandidateProfileSchema.safeParse(BASE_PROFILE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.education).toEqual([]);
      expect(result.data.experience).toEqual([]);
      expect(result.data.skills).toEqual([]);
      expect(result.data.reusableAnswers).toEqual([]);
    }
  });

  it("rejects experience with invalid proficiency", () => {
    const result = CandidateProfileSchema.safeParse({
      ...BASE_PROFILE,
      skills: [{ factId: "FACT-S001", name: "TypeScript", proficiency: "wizard" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("FACT_IDS", () => {
  it("contains stable IDs with FACT- prefix", () => {
    for (const id of Object.values(FACT_IDS)) {
      expect(id).toMatch(/^FACT-\d{3}$/);
    }
  });

  it("has no duplicate IDs", () => {
    const ids = Object.values(FACT_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
