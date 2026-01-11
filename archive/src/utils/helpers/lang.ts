import { logger } from "@hmpact/logger";
import fetch from "isomorphic-unfetch";
import ora from "ora";

import { hmpactrc } from "~/src/config";
import { langSchema } from "@/schema/lang";
import { type ManifestSchemaType } from "@/schema/manifest";
import _helperCacheFunction from "@/utils/helpers/cache";
import _helperManifestFunction from "@/utils/helpers/manifest";
import _helperSchemaFunction from "@/utils/helpers/schema";

const __helperLangFuncInit = async () => {
  // マニフェストの読み込み
  const manifest = await _helperManifestFunction.loadFile();
  if (!manifest.has) {
    logger.error("No manifest file found.");
    throw new Error();
  }

  // 言語パックのダウンロード処理を実行
  await __helperLangFuncDownloads(manifest.content);
};

const __helperLangFuncDownloads = async (content: ManifestSchemaType.zod) => {
  // 言語パックのダウンロード
  const packPromises = ora("Downloading language packs...").start();

  // ダウンロード開始
  try {
    const downloadedPacks: { lang: string; version: string }[] = [];
    packPromises.text = "Starting downloads...";

    await Promise.allSettled(
      Object.entries(content.lang?.packs || {}).map(async ([key, packUrl]) => {
        // 実行バージョンに対応したパックのキャッシュが存在する場合はそれを使用
        try {
          const cachedData = await _helperCacheFunction.getJson(
            `${hmpactrc.version}-pack-${key}`,
            { schema: langSchema.zod },
          );
          if (cachedData) {
            downloadedPacks.push({
              lang: key,
              version: cachedData.version,
            });
            return;
          }
        } catch (e) {
          // キャッシュ取得失敗時は無視して続行
        }
        packPromises.text = `Downloading language pack: ${key} from ${packUrl}`;

        try {
          const result = await fetch(packUrl);
          const data = (await result.json()) as any;
          const _packInfo = {
            version: data.version,
            lang: data.lang,
          };

          // 識別できない場合はエラー
          if (!_packInfo.version || !_packInfo.lang) {
            packPromises.fail(`Invalid language pack format from: ${packUrl}`);
            return;
          }

          // ダウンロード成功
          if (hmpactrc.version !== _packInfo.version) {
            packPromises.warn(
              `You are running hmpact v${hmpactrc.version}, but you have specified a language pack for v${_packInfo.version}.`,
            );
          }

          // スキーマで検証
          const parsedValue = await _helperSchemaFunction.safeCheck(
            data,
            langSchema.zod,
          );
          if (!parsedValue.success) {
            packPromises.fail(
              `Language pack validation error from: ${packUrl}\n${parsedValue.error.message}`,
            );
            throw new Error();
          }

          // キャッシュに保存
          if (!parsedValue.data) {
            packPromises.fail(
              `Failed to download language pack from: ${packUrl}`,
            );
            throw new Error();
          }
          const save_result = await _helperCacheFunction.putJson(
            `${parsedValue.data.version}-pack-${parsedValue.data.lang}`,
            parsedValue.data,
          );
          if (!save_result.success) {
            packPromises.fail(
              `Failed to cache language pack from: ${packUrl}\n${save_result.error?.message}`,
            );
            throw new Error();
          }

          downloadedPacks.push({
            lang: _packInfo.lang,
            version: _packInfo.version,
          });
        } catch (e) {
          // ダウンロード失敗
          packPromises.fail(
            `Failed to download language pack from: ${packUrl}`,
          );
          throw new Error();
        }
      }),
    );

    const packs = downloadedPacks
      .map((p) => `${p.lang} (v${p.version})`)
      .join(", ");

    packPromises.succeed(
      `Downloaded language packs: ${downloadedPacks.length > 0 ? packs : "None"}\n`,
    );
    return;
  } catch (e) {
    throw new Error();
  }
};

const _helperLangFunction = {
  init: __helperLangFuncInit,
  downloads: __helperLangFuncDownloads,
};

export default _helperLangFunction;
