import { logger } from "@hmpact/logger";

import { userConfigSchema } from "@/schema/user-config";
import _helperDirFunction from "@/utils/helpers/dir";
import { hfs } from "@hmpact/fs";

const __userConfigPath = _helperDirFunction.userhmpactRoot + "/config.jsonc";

const __helperUserConfigFuncGet = async () => {
  const result = await hfs.jsonc.read
    .byPath(__userConfigPath, { schema: userConfigSchema.zod })
    .then((data) => {
      logger.debug("User config loaded:", data);
      return data;
    });

  if (result.status !== "success") {
    if (result.status === "not_found") {
      logger.warn("User config file not found. Using default configuration.");
    } else if (result.status === "validation_failed") {
      logger.error("User config validation failed:", result.message);
    }
    return null;
  }
  return result.data;
};

const __helperUserConfigFuncInit = async () => {};

const _helperUserConfigFunction = {
  get: __helperUserConfigFuncGet,
  init: __helperUserConfigFuncInit,
};

export default _helperUserConfigFunction;
