import { hpath } from "@hmpact/path";
import { ls } from "cacache";

export type HCacheLsResponse =
  | {
      status: "success";
      row: ls.Cache;
    }
  | {
      status: "error";
      error: unknown;
    };

export const cacheLs = async (): Promise<HCacheLsResponse> => {
  try {
    const result = await ls(hpath.homedir.cache);
    return {
      status: "success",
      row: result,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
