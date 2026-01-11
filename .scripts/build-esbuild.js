import { build } from "esbuild";
import { globSync } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [key, val] = arg.replace(/^--/, "").split("=");
    args[key] = val ?? true;
  }
  return args;
}

export async function buildPackage({
  packageDir,
  entries = ["./src/index.ts"],
  outDir = "dist",
  minify = true,
  declaration = true,
}) {
  const resolvedEntries = entries
    .map((entry) =>
      entry.includes("*")
        ? globSync(entry, { cwd: packageDir, absolute: true })
        : path.resolve(packageDir, entry)
    )
    .flat();

  if (resolvedEntries.length === 0) {
    console.error("No entry points resolved. Check --entries pattern.");
    process.exit(1);
  }

  console.log(`Building ${path.basename(packageDir)}...`);
  console.log(`Entry points: ${resolvedEntries.join(", ")}`);

  try {
    await build({
      entryPoints: resolvedEntries,
      bundle: true,
      outdir: path.resolve(packageDir, outDir),
      outExtension: { ".js": ".mjs" },
      format: "esm",
      platform: "node",
      target: "node18",
      minify,
      sourcemap: true,
      // src配下の相対フォルダ構造を維持して出力する
      outbase: path.resolve(packageDir, "src"),
      entryNames: "[dir]/[name]",
      external: [
        "@hmpact/*",
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

    if (declaration) {
      console.log("Generating type definitions...");
      execSync("pnpm tsc --build", { cwd: packageDir, stdio: "inherit" });
    }

    console.log(`✓ Built ${path.basename(packageDir)} successfully`);
  } catch (error) {
    console.error(`✗ Failed to build ${path.basename(packageDir)}:`, error);
    throw error;
  }
}

// スクリプトとして直接実行された場合（CLI引数対応）
if (import.meta.url.startsWith("file:")) {
  const args = parseArgs(process.argv.slice(2));
  // デフォルトはカレントディレクトリ
  const packageDir = args.packageDir
    ? path.resolve(process.cwd(), args.packageDir)
    : process.cwd();

  // --entries="a,b,c" または --entries="./src/**/index.ts"
  let entries = ["./src/index.ts"];
  if (args.entries) {
    entries = String(args.entries)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (args.auto) {
    entries = ["./src/index.ts", "./src/**/index.ts"];
  }

  const outDir = args.outDir ? String(args.outDir) : "dist";
  const minify = args.minify === undefined ? true : args.minify !== "false";
  const declaration =
    args.declaration === undefined ? true : args.declaration !== "false";

  buildPackage({ packageDir, entries, outDir, minify, declaration }).catch(
    (error) => {
      console.error(error);
      process.exit(1);
    }
  );
}
