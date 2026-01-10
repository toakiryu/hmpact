import logger from "@hmpact/logger";

import { userConfigSchema } from "@/schema/user-config";
import _helperDirFunction from "@/utils/helpers/dir";
import _helperJsoncFunction from "@/utils/helpers/jsonc";

const __userConfigPath = _helperDirFunction.userhmpactRoot + "/config.jsonc";

const __helperUserConfigFuncGet = async () => {
  const result = await _helperJsoncFunction
    .getJsoncByPath(__userConfigPath, { schema: userConfigSchema.zod })
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
  return result;
};

const _helperUserConfigFunction = {
  get: __helperUserConfigFuncGet,
};

export default _helperUserConfigFunction;
