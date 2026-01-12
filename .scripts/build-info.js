import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, "..", "packages", "cli");
const outputDir = path.join(
  __dirname,
  "..",
  "packages",
  "devtools",
  "src",
  "features",
  "build-info",
);

try {
  // `package.json`を読み込む
  const pkgPath = path.join(inputDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found at ${pkgPath}`);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  if (!pkg.name || !pkg.version) {
    throw new Error("package.json is missing name or version");
  }

  // ビルド情報を生成
  const buildId = Date.now().toString(36).toUpperCase();
  const commit = process.env.GITHUB_SHA || process.env.COMMIT_SHA || "";
  const branch = process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || "";
  const timestamp = new Date().toISOString();

  // 出力ディレクトリを作成
  fs.mkdirSync(outputDir, { recursive: true });

  // ファイルを出力
  const outPath = path.join(outputDir, "index.gen.ts");
  const content = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
import type { HmpactBuildInfoType } from "./types";

const HmpactBuildInfo: HmpactBuildInfoType = {
  version: ${JSON.stringify(pkg.version)},
  buildId: ${JSON.stringify(buildId)},
  commit: ${JSON.stringify(commit)},
  branch: ${JSON.stringify(branch)},
  timestamp: ${JSON.stringify(timestamp)},
};

export default HmpactBuildInfo;
`;
  fs.writeFileSync(outPath, content, "utf8");
  console.log(`[build-info] wrote ${outPath}`);
} catch (error) {
  console.error(
    `[build-info] Error: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exit(1);
}
