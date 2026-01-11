import { homedir } from "os";
import path from "path";

const _homedir = homedir();

export const hpath = {
  homedir: {
    user: _homedir,
    hmpact: path.join(_homedir, ".hmpact"),
    cache: path.join(_homedir, ".cache/hmpact/"),
  },
};
