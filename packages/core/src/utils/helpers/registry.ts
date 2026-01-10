import logger from "@hmpact/logger";

import { manifestSchema } from "@/schema/manifest";
import { regsSchema } from "@/schema/regs";
import helper from "@/utils/helper";

const __helperRegistryFuncAdd = async (
  domain: string,
  id: string,
  _format?: string,
) => {
  const format = _format || `//${domain}/@{org}/{pkg}/-/{pkg}-{ver}.tgz`;

  await helper.manifest
    .edit(["registries", id || domain, "rule", "format"], format || "")
    .catch((e) => {
      throw new Error(
        `Failed to add registry: ${e instanceof Error ? e.message : String(e)}`,
      );
    });
};

const __helperRegistryFuncRemove = async (id: string) => {
  await helper.manifest.edit(["registries", id]).catch((e) => {
    throw new Error(
      `Failed to remove registry: ${e instanceof Error ? e.message : String(e)}`,
    );
  });
};

const __helperRegistryFuncImport = async (url: string) => {
  try {
    logger.info(`Fetching registries from: ${url}`);
    const result = await helper.fetcher(url);

    // スキーマで検証
    const parsedValue = regsSchema.zod.safeParse(result);

    // 検証エラー時は例外をスロー
    if (!parsedValue.success) {
      throw new Error(
        `Config file validation error: ${parsedValue.error.message}`,
      );
    }

    const registries = parsedValue.data.registries;
    const totalCount = registries.length;

    if (totalCount === 0) {
      logger.info("No registries found to import.");
      return;
    }

    logger.info(`Found ${totalCount} registries to import.`);

    // 重複IDの検証
    const registryIds = registries.map((r) => r.id);
    const duplicateIds = registryIds.filter(
      (id, index) => registryIds.indexOf(id) !== index,
    );

    if (duplicateIds.length > 0) {
      throw new Error(
        `Duplicate registry IDs found in import data: ${[...new Set(duplicateIds)].join(", ")}`,
      );
    }

    // 既存のマニフェストを取得
    const draft = await helper.manifest.draftCreate();
    let draftContent = draft.content;

    // 既存のレジストリIDと競合チェック
    const existingRegistries = draftContent.registries || {};
    const conflictingIds = registryIds.filter((id) => id in existingRegistries);

    if (conflictingIds.length > 0) {
      logger.warn(
        `Warning: The following registries will be overwritten: ${conflictingIds.join(", ")}`,
      );
    }

    // 各レジストリをドラフトに追加（バッチ処理）
    let successCount = 0;
    let failedCount = 0;
    const failedRegistries: { id: string; error: string }[] = [];

    for (let i = 0; i < totalCount; i++) {
      const registry = registries[i];
      const { id, rule } = registry;

      try {
        logger.info(`[${i + 1}/${totalCount}] Importing registry: ${id}...`);

        const editedJson = await helper.manifest.draftEdit(
          draftContent,
          ["registries", id],
          { rule },
        );

        // 型安全性の向上: JSON.parse の結果を検証
        const parsedDraft = JSON.parse(editedJson);
        const validatedDraft = manifestSchema.zod.safeParse(parsedDraft);

        if (!validatedDraft.success) {
          throw new Error(
            `Draft validation failed: ${validatedDraft.error.message}`,
          );
        }

        draftContent = validatedDraft.data;
        successCount++;
        logger.info(`[${i + 1}/${totalCount}] ✓ ${id} imported successfully`);
      } catch (e) {
        failedCount++;
        const errorMessage = e instanceof Error ? e.message : String(e);
        failedRegistries.push({ id, error: errorMessage });
        logger.error(
          `[${i + 1}/${totalCount}] ✗ Failed to import ${id}: ${errorMessage}`,
        );
      }
    }

    // 結果のサマリー表示
    logger.info("\n=== Import Summary ===");
    logger.info(`Total: ${totalCount}`);
    logger.info(`Success: ${successCount}`);
    logger.info(`Failed: ${failedCount}`);

    if (failedCount > 0) {
      logger.info("\nFailed registries:");
      failedRegistries.forEach(({ id, error }) => {
        logger.info(`  - ${id}: ${error}`);
      });

      // 一部失敗した場合でも成功したものは保存
      if (successCount > 0) {
        logger.info("\nSaving successfully imported registries...");
        await helper.manifest.draftSave(draft.file!, draftContent);
        logger.info("Partial import completed.");
      } else {
        throw new Error("All registry imports failed.");
      }
    } else {
      // すべて成功した場合
      await helper.manifest.draftSave(draft.file!, draftContent);
      logger.info("\n✓ All registries imported successfully!");
    }
  } catch (e) {
    throw new Error(
      `Failed to import registries: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
};

const _helperRegistryFunction = {
  add: __helperRegistryFuncAdd,
  remove: __helperRegistryFuncRemove,
  import: __helperRegistryFuncImport,
};

export default _helperRegistryFunction;
