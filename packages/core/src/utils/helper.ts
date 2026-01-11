
import _helperDirFunction from "@/utils/helpers/dir";
import _helperFetcherFunction from "@/utils/helpers/fetcher";
import _helperManifestFunction from "@/utils/helpers/manifest";
import _helperSchemaFunction from "@/utils/helpers/schema";
import _helperSelfFunction from "@/utils/helpers/self";

/**
 * ヘルパー関数群
 */
const helper = {
  schema: _helperSchemaFunction,
  fetcher: _helperFetcherFunction,
  dir: _helperDirFunction,
  self: _helperSelfFunction,
  manifest: _helperManifestFunction,
};

export default helper;
