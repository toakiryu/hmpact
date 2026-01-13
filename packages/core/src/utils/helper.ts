
import _helperFetcherFunction from "@/utils/helpers/fetcher";
import _helperManifestFunction from "@/utils/helpers/manifest";
import _helperSchemaFunction from "@/utils/helpers/schema";

/**
 * ヘルパー関数群
 */
const helper = {
  schema: _helperSchemaFunction,
  fetcher: _helperFetcherFunction,
  manifest: _helperManifestFunction,
};

export default helper;
