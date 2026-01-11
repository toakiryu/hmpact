import { cacheLs } from "./base/ls";
import { cacheClear } from "./base/clear";
import { cacheHas } from "./base/has";
import { cacheGet } from "./base/get";
import { cachePut } from "./base/put";
import { cacheGetValidated } from "./utils/get.validated";

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
