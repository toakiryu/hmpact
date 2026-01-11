import { ls } from "cacache";
import { hpath } from "@hmpact/path";

export type HCacheLsResuponse =
  | {
      status: "success";
      row: ls.Cache;
    }
  | {
      status: "error";
      error: unknown;
    };

export const cacheLs = async (): Promise<HCacheLsResuponse> => {
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
