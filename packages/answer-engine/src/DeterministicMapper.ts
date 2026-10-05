import type { CandidateProfile } from "@applyagent/candidate";
import { normalizeLabel } from "./fieldNormalizer.js";

export interface MappedAnswer {
  value: string;
  factId: string;
}

type Resolver = (profile: CandidateProfile) => string | undefined;

/** Maps a normalized field label to a CandidateProfile fact resolver + factId */
const FIELD_MAP: Array<{ aliases: string[]; factId: string; resolve: Resolver }> = [
  {
    aliases: ["first name", "firstname", "given name", "givenname"],
    factId: "FACT-001",
    resolve: (p) => p.identity.firstName,
  },
  {
    aliases: ["middle name", "middlename"],
    factId: "FACT-002",
    resolve: (p) => p.identity.middleName,
  },
  {
    aliases: ["last name", "lastname", "surname", "family name"],
    factId: "FACT-003",
    resolve: (p) => p.identity.lastName,
  },
  {
    aliases: ["preferred name", "preferredname", "name you go by"],
    factId: "FACT-004",
    resolve: (p) => p.identity.preferredName ?? p.identity.firstName,
  },
  {
    aliases: ["email", "email address", "emailaddress", "e mail", "work email", "personal email"],
    factId: "FACT-005",
    resolve: (p) => p.contact.email,
  },
  {
    aliases: ["phone", "phone number", "phonenumber", "mobile", "cell", "telephone", "mobile number", "cell phone"],
    factId: "FACT-006",
    resolve: (p) => p.contact.phone,
  },
  {
    aliases: ["city", "current city", "location city"],
    factId: "FACT-008",
    resolve: (p) => p.contact.address?.city,
  },
  {
    aliases: ["state", "province", "region", "current state"],
    factId: "FACT-009",
    resolve: (p) => p.contact.address?.state,
  },
  {
    aliases: ["zip", "zip code", "postal code", "postalcode"],
    factId: "FACT-010",
    resolve: (p) => p.contact.address?.zip,
  },
  {
    aliases: ["country", "country of residence"],
    factId: "FACT-011",
    resolve: (p) => p.contact.address?.country,
  },
  {
    aliases: ["full name", "fullname", "legal name", "name"],
    factId: "FACT-001",
    resolve: (p) => `${p.identity.firstName} ${p.identity.lastName}`.trim(),
  },
  {
    aliases: ["linkedin", "linkedin url", "linkedin profile"],
    factId: "FACT-005",
    resolve: (p) => p.links.find((l) => l.type === "linkedin")?.url,
  },
  {
    aliases: ["github", "github url", "github profile"],
    factId: "FACT-005",
    resolve: (p) => p.links.find((l) => l.type === "github")?.url,
  },
  {
    aliases: ["portfolio", "portfolio url", "website", "personal website"],
    factId: "FACT-005",
    resolve: (p) => p.links.find((l) => l.type === "portfolio")?.url,
  },
];

/**
 * Attempts to map a field label directly to a candidate fact without calling the LLM.
 * Returns the answer + factId if a match is found, or null if no deterministic mapping exists.
 */
export function deterministicMap(
  label: string,
  profile: CandidateProfile,
): MappedAnswer | null {
  const normalized = normalizeLabel(label);

  for (const entry of FIELD_MAP) {
    if (entry.aliases.includes(normalized)) {
      const value = entry.resolve(profile);
      if (value !== undefined && value !== "") {
        return { value, factId: entry.factId };
      }
    }
  }

  return null;
}
