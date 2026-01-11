import _helperBuildInfoFunction from "@/utils/helpers/build-info";
import _helperCacheFunction from "@/utils/helpers/cache";
import _helperDirFunction from "@/utils/helpers/dir";
import _helperFetcherFunction from "@/utils/helpers/fetcher";
import _helperLangFunction from "@/utils/helpers/lang";
import _helperManifestFunction from "@/utils/helpers/manifest";
import _helperRegistryFunction from "@/utils/helpers/registry";
import _helperSchemaFunction from "@/utils/helpers/schema";
import _helperSelfFunction from "@/utils/helpers/self";
import _helperUserConfigFunction from "@/utils/helpers/user-config";

/**
 * ヘルパー関数群
 */
const helper = {
  schema: _helperSchemaFunction,
  fetcher: _helperFetcherFunction,
  dir: _helperDirFunction,
  lang: _helperLangFunction,
  userConfig: _helperUserConfigFunction,
  cache: _helperCacheFunction,
  self: _helperSelfFunction,
  buildInfo: _helperBuildInfoFunction,
  manifest: _helperManifestFunction,
  registry: _helperRegistryFunction,
};

export default helper;
