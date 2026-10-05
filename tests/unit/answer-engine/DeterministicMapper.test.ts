import { describe, it, expect } from "vitest";
import { deterministicMap } from "../../../packages/answer-engine/src/DeterministicMapper.js";
import type { CandidateProfile } from "../../../packages/candidate/src/profile/types.js";

const PROFILE: CandidateProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  version: 1,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  identity: { firstName: "Alice", lastName: "Smith", preferredName: "Ali" },
  contact: {
    email: "alice@example.com",
    phone: "+1-555-123-4567",
    address: { city: "San Francisco", state: "CA", zip: "94102", country: "United States" },
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  links: [
    { type: "linkedin", url: "https://linkedin.com/in/alice" },
    { type: "github", url: "https://github.com/alice" },
  ],
  reusableAnswers: [],
};

describe("deterministicMap", () => {
  it("maps 'Email Address' to contact email", () => {
    const r = deterministicMap("Email Address", PROFILE);
    expect(r?.value).toBe("alice@example.com");
    expect(r?.factId).toBe("FACT-005");
  });

  it("maps 'email' (lowercase) to contact email", () => {
    expect(deterministicMap("email", PROFILE)?.value).toBe("alice@example.com");
  });

  it("maps 'First Name' to identity.firstName", () => {
    const r = deterministicMap("First Name", PROFILE);
    expect(r?.value).toBe("Alice");
    expect(r?.factId).toBe("FACT-001");
  });

  it("maps 'firstname' (no space) to identity.firstName", () => {
    expect(deterministicMap("firstname", PROFILE)?.value).toBe("Alice");
  });

  it("maps 'Last Name' to identity.lastName", () => {
    expect(deterministicMap("Last Name", PROFILE)?.value).toBe("Smith");
    expect(deterministicMap("Last Name", PROFILE)?.factId).toBe("FACT-003");
  });

  it("maps 'Phone Number' to contact.phone", () => {
    expect(deterministicMap("Phone Number", PROFILE)?.value).toBe("+1-555-123-4567");
  });

  it("maps 'Mobile' to contact.phone", () => {
    expect(deterministicMap("Mobile", PROFILE)?.value).toBe("+1-555-123-4567");
  });

  it("maps 'City' to address.city", () => {
    expect(deterministicMap("City", PROFILE)?.value).toBe("San Francisco");
  });

  it("maps 'State' to address.state", () => {
    expect(deterministicMap("State", PROFILE)?.value).toBe("CA");
  });

  it("maps 'Full Name' to firstName + lastName", () => {
    expect(deterministicMap("Full Name", PROFILE)?.value).toBe("Alice Smith");
  });

  it("maps 'LinkedIn' URL", () => {
    expect(deterministicMap("LinkedIn", PROFILE)?.value).toBe("https://linkedin.com/in/alice");
  });

  it("maps 'GitHub' URL", () => {
    expect(deterministicMap("GitHub", PROFILE)?.value).toBe("https://github.com/alice");
  });

  it("returns null for unknown field labels", () => {
    expect(deterministicMap("Why do you want this job?", PROFILE)).toBeNull();
  });

  it("returns null for fields not present in profile", () => {
    const profileNoPhone = { ...PROFILE, contact: { email: "a@b.com" } };
    expect(deterministicMap("Phone Number", profileNoPhone)).toBeNull();
  });

  it("strips punctuation from label before matching", () => {
    expect(deterministicMap("Email Address:", PROFILE)?.value).toBe("alice@example.com");
  });
});
