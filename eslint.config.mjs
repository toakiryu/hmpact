import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores(["node_modules/**", ".scripts/**"]),
  {
    ignores: ["eslint.config.mjs"],
  },
]);

export default eslintConfig;
