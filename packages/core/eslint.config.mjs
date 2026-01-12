import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  importPlugin.flatConfigs.recommended,
  globalIgnores(["node_modules/**", "dist/**", "build/**", ".turbo/**"]),
  {
    ignores: ["eslint.config.mjs"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "import/no-duplicates": "error",
      "import/newline-after-import": ["error", { count: 1 }],
      "import/no-relative-parent-imports": "off",
      "import/no-useless-path-segments": ["error", { commonjs: true }],
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
]);

export default eslintConfig;
