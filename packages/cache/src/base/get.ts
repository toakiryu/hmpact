import { hpath } from "@hmpact/path";
import { get, GetCacheObject } from "cacache";
import { cacheHas } from "./has";

export interface HCacheGetRequest {
  key: string;
}

export type HCacheGetResponse =
  | {
      status: "success";
      row: GetCacheObject;
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
      error: unknown;
    };

export const cacheGet = async (
  req: HCacheGetRequest,
): Promise<HCacheGetResponse> => {
  try {
    const has = await cacheHas({ key: req.key });

    if (has.status === "not_found") {
      return {
        status: "not_found",
      };
    }

    const result = await get(hpath.homedir.cache, req.key);
    return {
      status: "success",
      row: result,
    };
  } catch (error) {
    return {
      status: "error",
      error,
    };
  }
};
