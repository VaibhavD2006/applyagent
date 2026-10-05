import type { FormField, FormFieldSummary, LocatorDescriptor } from "./types.js";

const EMAIL_ALIASES = ["email", "e-mail", "email address", "emailaddress"];
const PHONE_ALIASES = ["phone", "phone number", "phonenumber", "mobile", "cell", "telephone"];
const DATE_ALIASES = ["date", "birth date", "birthdate", "start date", "end date", "dob"];

/** Maps a PageSnapshot's field summaries to strongly-typed FormField objects */
export function mapFields(summaries: FormFieldSummary[]): FormField[] {
  return summaries.map((s, i) => ({
    id: s.key || `field_${i}`,
    label: s.label,
    type: inferFieldType(s),
    required: s.required,
    options: s.options,
    locator: buildLocator(s),
  }));
}

function inferFieldType(s: FormFieldSummary): FormField["type"] {
  const t = s.inputType.toLowerCase();
  const l = s.label.toLowerCase().replace(/[^a-z0-9 ]/g, "");

  if (t === "email" || EMAIL_ALIASES.some((a) => l === a || l.includes(a))) return "email";
  if (t === "tel" || PHONE_ALIASES.some((a) => l === a || l.includes(a))) return "phone";
  if (t === "date" || DATE_ALIASES.some((a) => l === a)) return "date";
  if (t === "number") return "number";
  if (t === "checkbox") return "checkbox";
  if (t === "radio") return "radio";
  if (t === "file") return "file";
  if (t === "textarea") return "textarea";
  if (t === "select") return "select";
  if (t === "text" || t === "search" || t === "url") return "text";
  return "unknown";
}

function buildLocator(s: FormFieldSummary): LocatorDescriptor {
  if (s.label) {
    return { strategy: "label", value: s.label };
  }
  // Fall back to CSS by key (id or name)
  return { strategy: "css", value: `[name="${s.key}"], #${s.key}` };
}
