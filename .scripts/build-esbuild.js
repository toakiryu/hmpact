import { build } from "esbuild";
import { globSync } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * esbuild を使用してパッケージをビルドする
 * @param {Object} options - ビルドオプション
 * @param {string} options.packageDir - パッケージディレクトリの絶対パス
 * @param {string[]} options.entries - エントリーポイント（packageDir からの相対パス）
 * @param {string} options.outDir - 出力ディレクトリ（packageDir からの相対パス）
 * @param {boolean} [options.minify=true] - ミニファイするかどうか
 * @param {boolean} [options.declaration=true] - 型定義を生成するかどうか
 */
export async function buildPackage({
  packageDir,
  entries = ["./src/index.ts"],
  outDir = "dist",
  minify = true,
  declaration = true,
}) {
  const entryPoints = entries.map((entry) => {
    // glob パターンの場合
    if (entry.includes("*")) {
      return globSync(entry, { cwd: packageDir, absolute: true });
    }
    // 単一ファイルの場合
    return path.resolve(packageDir, entry);
  }).flat();

  console.log(`Building ${path.basename(packageDir)}...`);
  console.log(`Entry points: ${entryPoints.join(", ")}`);

  try {
    // JavaScript のビルド
    await build({
      entryPoints,
      bundle: true,
      outdir: path.resolve(packageDir, outDir),
      outExtension: { ".js": ".mjs" },
      format: "esm",
      platform: "node",
      target: "node18",
      minify,
      sourcemap: true,
      external: [
        // workspace パッケージ
        "@hmpact/*",
        // 標準的な外部依存関係
        "chalk",
        "commander",
        "deepmerge",
        "figlet",
        "gradient-string",
        "isomorphic-unfetch",
        "jsonc-parser",
        "ora",
        "zod",
        "cacache",
      ],
      logLevel: "info",
    });

    // 型定義の生成
    if (declaration) {
      console.log("Generating type definitions...");
      try {
        execSync("pnpm tsc --build", {
          cwd: packageDir,
          stdio: "inherit",
        });
      } catch (error) {
        console.error("Failed to generate type definitions:", error.message);
        throw error;
      }
    }

    console.log(`✓ Built ${path.basename(packageDir)} successfully`);
  } catch (error) {
    console.error(`✗ Failed to build ${path.basename(packageDir)}:`, error);
    throw error;
  }
}

// スクリプトとして直接実行された場合
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url);
  const scriptPath = process.argv[1];
  
  if (modulePath === scriptPath) {
    const packageDir = process.cwd();
    buildPackage({ packageDir }).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  }
}
