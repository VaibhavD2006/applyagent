import type { AtsType } from "@applyagent/job";
import type { ATSAdapter } from "./adapters/ATSAdapter.js";
import { GenericAdapter } from "./adapters/GenericAdapter.js";
import { GreenhouseAdapter } from "./adapters/GreenhouseAdapter.js";

/** Returns the appropriate ATS adapter for a given ATS type */
export function selectAdapter(atsType: AtsType): ATSAdapter {
  switch (atsType) {
    case "greenhouse":
      return new GreenhouseAdapter();
    case "lever":
    case "workday":
    case "ashby":
    case "generic":
    default:
      // ponytail: lever/workday/ashby fall back to generic until dedicated adapters built
      return new GenericAdapter();
  }
}
