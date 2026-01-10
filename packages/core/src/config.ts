import type { hmpactrcType } from "@/types/self";
import helper from "@/utils/helper";

// `package.json`を読み込む
const pkgJson = await helper.self.pkg.load();

export const hmpactrc: hmpactrcType = {
  name: pkgJson.name,
  version: pkgJson.version || "0.0.0",
  manifestFile: {
    name: ["hmpact.jsonc"],
  },
};
