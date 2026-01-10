import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const cwd = process.cwd();
// スクリプトのディレクトリを取得
const __filename = fileURLToPath(import.meta.url);
// スクリプトのディレクトリ名を取得
const __dirname = path.dirname(__filename);

const hmpactPkgRoot = path.join(__dirname, "..", "packages", "core");

// `package.json`の存在を確認して読み込む
const file = fs.existsSync(path.join(hmpactPkgRoot, "package.json"));
let pkg = {};
if (file) {
  // ファイルを読み込んでJSONを返す
  const raw = fs.readFileSync(path.join(hmpactPkgRoot, "package.json"), "utf8");
  pkg = JSON.parse(raw);
} else {
  console.error("package.json not found");
  process.exit(1);
}

if (!pkg.name || !pkg.version) {
  console.error("package.json is missing name or version");
  process.exit(1);
}

const buildId = Date.now().toString(36).toUpperCase();
const commit = process.env.GITHUB_SHA || process.env.COMMIT_SHA || "";
const branch = process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || "";
const timestamp = new Date().toISOString();

const buildInfo = {
  name: pkg.name,
  version: pkg.version,
  buildId,
  commit,
  branch,
  timestamp,
};

const outPath = path.join(hmpactPkgRoot, "build-info.json");
fs.writeFileSync(outPath, JSON.stringify(buildInfo, null, 2), "utf8");
console.log(`[build-info] wrote ${outPath}\n`);
