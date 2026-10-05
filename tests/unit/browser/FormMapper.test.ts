import { describe, it, expect } from "vitest";
import { mapFields } from "../../../packages/browser/src/FormMapper.js";
import type { FormFieldSummary } from "../../../packages/browser/src/types.js";

function summary(
  overrides: Partial<FormFieldSummary> & { key: string; label: string; inputType: string },
): FormFieldSummary {
  return { required: false, ...overrides };
}

describe("mapFields — type inference", () => {
  it("maps email input to email type", () => {
    const [f] = mapFields([summary({ key: "email", label: "Email Address", inputType: "email" })]);
    expect(f!.type).toBe("email");
  });

  it("maps tel input to phone type", () => {
    const [f] = mapFields([summary({ key: "phone", label: "Phone Number", inputType: "tel" })]);
    expect(f!.type).toBe("phone");
  });

  it("maps textarea to textarea type", () => {
    const [f] = mapFields([
      summary({ key: "cover", label: "Cover Letter", inputType: "textarea" }),
    ]);
    expect(f!.type).toBe("textarea");
  });

  it("maps select to select type with options", () => {
    const [f] = mapFields([
      summary({ key: "country", label: "Country", inputType: "select", options: ["US", "CA"] }),
    ]);
    expect(f!.type).toBe("select");
    expect(f!.options).toEqual(["US", "CA"]);
  });

  it("maps file input to file type", () => {
    const [f] = mapFields([summary({ key: "resume", label: "Resume", inputType: "file" })]);
    expect(f!.type).toBe("file");
  });

  it("maps checkbox to checkbox type", () => {
    const [f] = mapFields([summary({ key: "agree", label: "I agree", inputType: "checkbox" })]);
    expect(f!.type).toBe("checkbox");
  });

  it("maps date input to date type", () => {
    const [f] = mapFields([summary({ key: "dob", label: "Date of Birth", inputType: "date" })]);
    expect(f!.type).toBe("date");
  });

  it("infers phone from label even when inputType is text", () => {
    const [f] = mapFields([summary({ key: "ph", label: "Mobile Phone", inputType: "text" })]);
    expect(f!.type).toBe("phone");
  });

  it("infers email from label even when inputType is text", () => {
    const [f] = mapFields([summary({ key: "em", label: "Email", inputType: "text" })]);
    expect(f!.type).toBe("email");
  });

  it("returns unknown for unrecognized types", () => {
    const [f] = mapFields([summary({ key: "x", label: "Mystery Field", inputType: "color" })]);
    expect(f!.type).toBe("unknown");
  });
});

describe("mapFields — locator strategy", () => {
  it("uses label strategy when label is present", () => {
    const [f] = mapFields([summary({ key: "fn", label: "First Name", inputType: "text" })]);
    expect(f!.locator.strategy).toBe("label");
    expect(f!.locator.value).toBe("First Name");
  });

  it("falls back to css when label is empty", () => {
    const [f] = mapFields([summary({ key: "first_name", label: "", inputType: "text" })]);
    expect(f!.locator.strategy).toBe("css");
  });
});

describe("mapFields — required flag", () => {
  it("preserves required=true", () => {
    const [f] = mapFields([
      summary({ key: "em", label: "Email", inputType: "email", required: true }),
    ]);
    expect(f!.required).toBe(true);
  });

  it("preserves required=false", () => {
    const [f] = mapFields([
      summary({ key: "ph", label: "Phone", inputType: "tel", required: false }),
    ]);
    expect(f!.required).toBe(false);
  });
});
