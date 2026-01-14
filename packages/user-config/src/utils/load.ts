import path from "path";

import { userConfigSchema } from "@/schema/config";
import { hfs } from "@hmpact/fs";
import { hpath } from "@hmpact/path";

const configPath = path.join(hpath.homedir.hmpact, "configs.jsonc");

export const loadConfig = async () => {
  try {
    const content = await hfs.readFile(configPath, {
      schema: userConfigSchema.zod,
    });
    return content;
  } catch (error) {
    console.error("Failed to load user config:", error);
  }
};
