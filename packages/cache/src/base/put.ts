import { hpath } from "@hmpact/path";
import { put } from "cacache";

export interface HCachePutRequest {
  key: string;
  data: string | Buffer;
}

export type HCachePutResponse =
  | {
      status: "success";
      row: string;
    }
  | {
      status: "error";
      error: unknown;
    };

export const cachePut = async (
  req: HCachePutRequest,
): Promise<HCachePutResponse> => {
  try {
    const result = await put(hpath.homedir.cache, req.key, req.data);
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
