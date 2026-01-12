import { cacheClear } from "@/base/clear";
import { cacheGet } from "@/base/get";
import { cacheHas } from "@/base/has";
import { cacheLs } from "@/base/ls";
import { cachePut } from "@/base/put";
import { cacheGetValidated } from "@/utils/get.validated";

export const hcache = {
  // base functions
  ls: cacheLs,
  clear: cacheClear,
  has: cacheHas,
  get: cacheGet,
  put: cachePut,
  // other functions
  getValidated: cacheGetValidated,
};
