import { hpath } from "@hmpact/path";
import { get, GetCacheObject } from "cacache";
import { ZodSchema } from "zod";
import { cacheGet } from "../base/get";

type ValidatorFunction<T> = (data: unknown) => data is T;

type ValidationSchema<T> = ZodSchema<T> | ValidatorFunction<T>;

export interface HCacheGetValidatedOptions<T> {
  schema?: ValidationSchema<T>;
}

export interface HCacheGetValidatedRequest<T = unknown> {
  key: string;
  options?: HCacheGetValidatedOptions<T>;
}

export type HCacheGetValidatedResponse<T = unknown> =
  | {
      status: "success";
      data: T;
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
      error: unknown;
    }
  | {
      status: "validation_error";
      error: string;
    };

export const cacheGetValidated = async <T = unknown>(
  req: HCacheGetValidatedRequest<T>,
): Promise<HCacheGetValidatedResponse<T>> => {
  const buf = await cacheGet({ key: req.key });
  if (buf.status === "not_found") {
    return {
      status: "not_found",
    };
  }
  if (buf.status === "error") {
    return {
      status: "error",
      error: buf.error,
    };
  }

  try {
    const parsed = JSON.parse(buf.row.data.toString("utf8"));

    // スキーマが指定されている場合は検証を実行
    if (req.options?.schema) {
      const schema = req.options.schema;

      // Zod スキーマ（parseメソッドを持つ）かカスタム検証関数かを判定
      if (typeof schema === "function") {
        // カスタム型ガード関数
        if (!schema(parsed)) {
          return {
            status: "validation_error",
            error: `Validation failed for cache key: ${req.key}. Data does not match expected type.`,
          };
        }
      } else if ("parse" in schema && typeof schema.parse === "function") {
        // Zod スキーマ
        try {
          const validatedData = schema.parse(parsed) as T;
          return {
            status: "success",
            data: validatedData,
          };
        } catch (error) {
          return {
            status: "validation_error",
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }
    }

    return {
      status: "success",
      data: parsed as T,
    };
  } catch (error) {
    return {
      status: "error",
      error,
    };
  }
};
