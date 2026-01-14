import path from "path";
import { hpath } from "@hmpact/path";
import { hfs } from "@hmpact/fs";

const configPath = path.join(hpath.homedir.hmpact, "config.jsonc");

const loadConfig = async () => {
  try {
    const content = await hfs.readFile(configPath, "utf-8");
  }
}