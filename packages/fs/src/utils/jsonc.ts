import { readFile } from "fs/promises";
import { parse, ParseError, printParseErrorCode } from "jsonc-parser";
import { ZodSchema } from "zod";

type ValidatorFunction<T> = (data: unknown) => data is T;

type ValidationSchema<T> = ZodSchema<T> | ValidatorFunction<T>;

export interface JsoncFuncOptions<T> {
  schema?: ValidationSchema<T>;
}

export type __helperJsoncFuncResponse<T = unknown> = {
  status: "success" | "not_found" | "error" | "validation_failed";
  message?: string;
  data?: T;
  error?: unknown;
};

const __helperReadJsoncByPathFunc = async <T = unknown>(
  path: string,
  options?: JsoncFuncOptions<T>,
): Promise<__helperJsoncFuncResponse<T>> => {
  try {
    // ファイルを読み込み、JSONとしてパースして返す
    const row = await readFile(path, "utf-8");
    const errors: ParseError[] = [];
    const parsed = parse(row, errors);

    if (errors.length > 0) {
      errors.forEach((error) => {
        console.error(
          `エラー: ${printParseErrorCode(error.error)} at ${error.offset}`,
        );
      });
      return {
        status: "error",
        message: `Failed to parse JSONC file at ${path}.`,
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
            message: `Validation failed for ${path}. Data does not match expected type.`,
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
            message: `Validation failed for ${path}. Error.`,
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

const _helperJsoncFunction = {
  read: {
    byPath: __helperReadJsoncByPathFunc,
  },
};

export default _helperJsoncFunction;
