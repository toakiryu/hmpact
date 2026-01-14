import { readFile } from "fs/promises";
import path from "path";
import { ZodSchema } from "zod";

import { __helperFileParseJsonc } from "@/utils/readFile/jsonc";

type ValidatorFunction<T> = (data: unknown) => data is T;

type ValidationSchema<T> = ZodSchema<T> | ValidatorFunction<T>;

export interface FuncOptions<T> {
  schema?: ValidationSchema<T>;
}

export type __helperReadFileFuncResponse<T = unknown> = {
  status: "success" | "not_found" | "error" | "validation_failed";
  message?: string;
  data?: T;
  error?: unknown;
};

const _helperReadFileFunction = async <T = unknown>(
  _path: string,
  options?: FuncOptions<T>,
): Promise<__helperReadFileFuncResponse<T>> => {
  try {
    const pathInfo = path.parse(_path);

    const fileExt = pathInfo.ext.toLowerCase();
    // ファイルを読み込み、JSONとしてパースして返す
    const row = await readFile(_path, "utf-8");
    let parsed: unknown;

    switch (fileExt) {
      case ".jsonc":
        parsed = __helperFileParseJsonc(row, { path: _path });
        break;
      case ".json":
        parsed = JSON.parse(row);
        break;
      default:
        return {
          status: "error",
          message: `Unsupported file extension: ${fileExt} at ${_path}.`,
        };
    }

    // スキーマが指定されている場合は検証を実行
    if (options?.schema) {
      const schema = options.schema;

      // Zod スキーマ（parseメソッドを持つ）かカスタム検証関数かを判定
      if (typeof schema === "function") {
        // カスタム型ガード関数
        if (!schema(parsed)) {
          return {
            status: "validation_failed",
            message: `Validation failed for ${_path}. Data does not match expected type.`,
          };
        }
      } else if ("parse" in schema && typeof schema.parse === "function") {
        // Zod スキーマ
        try {
          return {
            status: "success",
            data: schema.parse(parsed) as T,
          };
        } catch (validationError) {
          return {
            status: "validation_failed",
            message: `Validation failed for ${_path}. Error.`,
            error: validationError,
          };
        }
      }
    }

    return {
      status: "success",
      data: parsed as T,
    };
  } catch (e) {
    // Distinguish file-not-found from other errors
    if (e instanceof Error && "code" in e && e.code === "ENOENT") {
      return {
        status: "not_found",
        error: e,
      };
    }
    return {
      status: "error",
      error: e,
    };
  }
};

export default _helperReadFileFunction;
