import { hpath } from "@hmpact/path";
import { get } from "cacache";

export interface HCacheHasRequest {
  key: string;
}

export type HCacheHasResponse =
  | {
      status: "success";
      row: get.HasContentObject;
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
      error: unknown;
    };

export const cacheHas = async (
  req: HCacheHasRequest,
): Promise<HCacheHasResponse> => {
  try {
    const result = await get.hasContent(hpath.homedir.cache, req.key);
    if (!result) {
      return {
        status: "not_found",
      };
    }
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
