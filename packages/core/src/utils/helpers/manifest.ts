import { hfs } from "@hmpact/fs";
import deepmerge from "deepmerge";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { applyEdits, modify } from "jsonc-parser";
import { extname } from "path";

import { hmpactrc } from "~/src/config";
import { type ManifestSchemaType, manifestSchema } from "@/schema/manifest";
import _helperSchemaFunction from "@/utils/helpers/schema";

export interface ManifestHelperFunction_hasFileFile {
  path: string;
  fullname: string;
  name: string;
  ext: string;
}

export interface ManifestHelperFunction_hasFileResult {
  has: boolean;
  file?: ManifestHelperFunction_hasFileFile;
}

/**
 * マニフェストファイルが存在するか確認する
 */
const __helperManifestFuncHasFile =
  async (): Promise<ManifestHelperFunction_hasFileResult> => {
    try {
      // カレントディレクトリを基準に確認
      const cwd = process.cwd();
      // マニフェストファイル名のリストをループして存在確認
      for (let i = 0; i < hmpactrc.manifestFile.name.length; i++) {
        const fileName = hmpactrc.manifestFile.name[i];
        // フルパスを生成
        const fullPath = `${cwd}/${fileName}`;
        // 存在すればパスを返す
        if (existsSync(fullPath))
          return {
            has: true,
            file: {
              // フルパスを返す
              path: fullPath,
              // フルネームを返す
              fullname: fileName,
              // 拡張子なしのファイル名を返す
              name: fileName.replace(extname(fileName), ""),
              // 拡張子は小文字で統一
              ext: extname(fullPath).toLowerCase(),
            },
          };
      }
      // 見つからなかった場合
      return { has: false };
    } catch {
      // エラー時は例外をスロー
      throw new Error("Error checking for config file.");
    }
  };

export type ManifestHelperFunction_loadFileResult =
  | {
      has: true;
      file?: ManifestHelperFunction_hasFileFile;
      content: ManifestSchemaType.zod;
    }
  | {
      has: false;
    };

/**
 * マニフェストファイルを読み込み、内容を返す
 * @param file - 読み込むファイル情報（省略時は自動検出）
 * @returns マニフェストファイルの内容
 */
const __helperManifestFuncLoadFile = async (
  file?: ManifestHelperFunction_hasFileFile,
): Promise<ManifestHelperFunction_loadFileResult> => {
  let _file = file;
  // ファイルが指定されていない場合は存在確認を行う
  if (!_file) {
    // マニフェストファイルの存在を確認
    const result = await _helperManifestFunction.hasFile();
    // 存在しなければ例外をスロー
    if (result.has && result.file) {
      // ファイル情報を上書き
      _file = result.file;
    }
  }

  // 拡張子に応じてパース方法を変更
  let configData: Record<string, any> | undefined = undefined;
  if (_file) {
    try {
      const { path, ext, name } = _file;
      if (name === "hmpact.json") {
        throw new Error("hmpact.json format not supported yet.");
      }
      // JSONファイルの場合
      if (ext === ".jsonc") {
        const result = await hfs.readFile(path, {
          schema: manifestSchema.zod,
        });
        if (result.status !== "success") {
          throw new Error(
            result.message ?? `Failed to load JSONC file: ${result.status}`,
          );
        }
        configData = result.data;
      }
    } catch (e) {
      throw new Error(`Error loading config file: ${e}`);
    }
  }

  try {
    // デフォルト設定とマージ
    const mergedConfig = deepmerge({}, configData || {});

    // スキーマで検証
    const parsedValue = await _helperSchemaFunction.safeCheck(
      mergedConfig,
      manifestSchema.zod,
    );

    // 検証エラー時は例外をスロー
    if (!parsedValue.success) {
      throw new Error(
        `Config file validation error: ${parsedValue.error.message}`,
      );
    }
    // 検証済みのデータを返す
    return { has: true, file: _file, content: parsedValue.data };
  } catch (e) {
    throw new Error(`Error processing config file: ${e}`);
  }
};

const __helperManifestFuncEdit = async (key: string[], value?: any) => {
  const getContent = await __helperManifestFuncLoadFile();
  if (!getContent.has) {
    throw new Error("No manifest file to edit.");
  }
  try {
    const content = JSON.stringify(getContent.content, null, 2);
    const edits = modify(content, key, value, {
      formattingOptions: { tabSize: 2, insertSpaces: true },
    });
    const newContent = applyEdits(content, edits);
    if (!getContent.file) {
      throw new Error("No manifest file information available.");
    }
    await writeFile(getContent.file.path, newContent);
  } catch (e) {
    throw new Error(`Error modifying manifest content: ${e}`);
  }
};

const __helperManifestFuncDraftCreate = async () => {
  const getContent = await __helperManifestFuncLoadFile();
  if (!getContent.has) {
    throw new Error("No manifest file to edit.");
  }
  return getContent;
};

const __helperManifestFuncDraftEdit = async (
  draft: ManifestSchemaType.zod,
  key: string[],
  value?: any,
) => {
  try {
    const content = JSON.stringify(draft);
    const edits = modify(content, key, value, {
      formattingOptions: { tabSize: 2, insertSpaces: true },
    });
    const newContent = applyEdits(content, edits);
    return newContent;
  } catch (e) {
    throw new Error(`Error modifying manifest content: ${e}`);
  }
};

const __helperManifestFuncDraftSave = async (
  file: ManifestHelperFunction_hasFileFile,
  draft: ManifestSchemaType.zod,
) => {
  try {
    if (!file) {
      throw new Error("No manifest file information available.");
    }
    await writeFile(file.path, JSON.stringify(draft, null, 2));
  } catch (e) {
    throw new Error(`Error saving manifest content: ${e}`);
  }
};

const _helperManifestFunction = {
  hasFile: __helperManifestFuncHasFile,
  loadFile: __helperManifestFuncLoadFile,
  edit: __helperManifestFuncEdit,
  draftCreate: __helperManifestFuncDraftCreate,
  draftEdit: __helperManifestFuncDraftEdit,
  draftSave: __helperManifestFuncDraftSave,
};

export default _helperManifestFunction;
