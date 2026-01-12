import { hpath } from "@hmpact/path";
import { rm } from "cacache";

export type HCacheClearResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: unknown;
    };

export const cacheClear = async (): Promise<HCacheClearResponse> => {
  try {
    await rm.all(hpath.homedir.cache);
    return {
      status: "success",
    };
  } catch (error) {
    return {
      status: "error",
      error,
    };
  }
};
