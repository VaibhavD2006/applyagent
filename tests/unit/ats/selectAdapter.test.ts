import { describe, it, expect } from "vitest";
import { selectAdapter, GenericAdapter, GreenhouseAdapter } from "@applyagent/ats";

describe("selectAdapter", () => {
  it("returns GreenhouseAdapter for greenhouse", () => {
    const adapter = selectAdapter("greenhouse");
    expect(adapter).toBeInstanceOf(GreenhouseAdapter);
    expect(adapter.atsType).toBe("greenhouse");
  });

  it("returns GenericAdapter for generic", () => {
    const adapter = selectAdapter("generic");
    expect(adapter).toBeInstanceOf(GenericAdapter);
    expect(adapter.atsType).toBe("generic");
  });

  it("returns GenericAdapter for lever (not yet implemented)", () => {
    const adapter = selectAdapter("lever");
    expect(adapter).toBeInstanceOf(GenericAdapter);
  });

  it("returns GenericAdapter for workday (not yet implemented)", () => {
    const adapter = selectAdapter("workday");
    expect(adapter).toBeInstanceOf(GenericAdapter);
  });

  it("returns GenericAdapter for ashby (not yet implemented)", () => {
    const adapter = selectAdapter("ashby");
    expect(adapter).toBeInstanceOf(GenericAdapter);
  });
});
