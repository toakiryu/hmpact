import logger from "@hmpact/logger";
import cacache from "cacache";
import { type ZodSchema } from "zod";

const cachePath = `/tmp/.cache/hmpact`;

type ValidatorFunction<T> = (data: unknown) => data is T;

type ValidationSchema<T> = ZodSchema<T> | ValidatorFunction<T>;

export interface CacheGetJsonOptions<T> {
  schema?: ValidationSchema<T>;
}

const __helperCacheLsFunc = async () => {
  try {
    const result = await cacache.ls(cachePath);
    return result;
  } catch (error) {
    logger.error("Error listing cache:", error);
  }
};

const __helperCacheClearFunc = async () => {
  try {
    await cacache.rm.all(cachePath);
  } catch (error) {
    logger.error("Error clearing cache:", error);
  }
};

const __helperCachePutFunc = async (key: string, data: string | Buffer) => {
  try {
    await cacache.put(cachePath, key, data);
  } catch (error) {
    logger.error("Error writing cache:", error);
    throw error;
  }
};

const __helperCachePutJsonFunc = async (key: string, value: unknown) => {
  try {
    const payload = JSON.stringify(value);
    await __helperCachePutFunc(key, payload);
    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error writing JSON to cache:", error);
    return {
      success: false,
      error: error as Error,
    };
  }
};

const __helperCacheGetFunc = async (key: string) => {
  try {
    const entry = await cacache.get(cachePath, key);
    return entry.data; // Buffer
  } catch (error) {
    // キャッシュが存在しない場合はundefinedを返す
    return undefined;
  }
};

const __helperCacheGetJsonFunc = async <T = unknown>(
  key: string,
  options?: CacheGetJsonOptions<T>,
): Promise<T | undefined> => {
  const buf = await __helperCacheGetFunc(key);
  if (!buf) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(buf.toString("utf8"));

    // スキーマが指定されている場合は検証を実行
    if (options?.schema) {
      const schema = options.schema;

      // Zod スキーマ（parseメソッドを持つ）かカスタム検証関数かを判定
      if (typeof schema === "function") {
        // カスタム型ガード関数
        if (!schema(parsed)) {
          logger.error(
            `Validation failed for cache key: ${key}. Data does not match expected type.`,
          );
          return undefined;
        }
      } else if ("parse" in schema && typeof schema.parse === "function") {
        // Zod スキーマ
        try {
          return schema.parse(parsed) as T;
        } catch (validationError) {
          logger.error(
            `Validation failed for cache key: ${key}. Error:`,
            validationError,
          );
          return undefined;
        }
      }
    }

    return parsed as T;
  } catch (error) {
    logger.error("Error parsing cached JSON:", error);
    return undefined;
  }
};

const _helperCacheFunction = {
  ls: __helperCacheLsFunc,
  clear: __helperCacheClearFunc,
  put: __helperCachePutFunc,
  putJson: __helperCachePutJsonFunc,
  get: __helperCacheGetFunc,
  getJson: __helperCacheGetJsonFunc,
};

export default _helperCacheFunction;
