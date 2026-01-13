import { HmpactBuildInfo } from "@hmpact/devtools/build-info";

import type { hmpactrcType } from "@/types/self";

export const hmpactrc: hmpactrcType = {
  name: "hmpact",
  version: HmpactBuildInfo.version,
  manifestFile: {
    name: ["hmpact.jsonc"],
  },
};
