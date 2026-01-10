import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";

interface TSConfig {
  compilerOptions?: {
    baseUrl?: string;
    paths?: Record<string, string[]>;
  };
}

interface ImportStatement {
  raw: string;
  source: string;
  type: "external" | "alias" | "relative";
  priority: number;
}

/**
 * tsconfig.json を読み込む
 */
function loadTSConfig(packageDir: string): TSConfig | null {
  const tsconfigPath = path.join(packageDir, "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) {
    return null;
  }
  const content = fs.readFileSync(tsconfigPath, "utf-8");
  // JSONC のコメントを削除
  const jsonContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
  return JSON.parse(jsonContent);
}

/**
 * インポート文を分類する
 */
function classifyImport(
  importLine: string,
  paths: Record<string, string[]> | undefined,
): ImportStatement {
  const match = importLine.match(/from\s+["']([^"']+)["']/);
  if (!match) {
    return {
      raw: importLine,
      source: "",
      type: "external",
      priority: 0,
    };
  }

  const source = match[1];

  // 相対パス
  if (source.startsWith(".")) {
    return {
      raw: importLine,
      source,
      type: "relative",
      priority: 2,
    };
  }

  // パスエイリアス
  if (paths) {
    const aliasKeys = Object.keys(paths).map((key) =>
      key.replace(/\/\*$/, ""),
    );
    for (const alias of aliasKeys) {
      if (source.startsWith(alias)) {
        // エイリアスの優先度を決定（記号順）
        let priority = 1;
        if (alias.startsWith(":")) priority = 10;
        else if (alias.startsWith("~")) priority = 11;
        else if (alias.startsWith("@")) priority = 12;
        return {
          raw: importLine,
          source,
          type: "alias",
          priority,
        };
      }
    }
  }

  // 外部パッケージ
  return {
    raw: importLine,
    source,
    type: "external",
    priority: 0,
  };
}

/**
 * インポートをグループ化して並び替える
 */
function sortImports(imports: ImportStatement[]): string[] {
  // タイプと優先度でソート
  const sorted = imports.sort((a, b) => {
    const typeOrder = { external: 0, alias: 1, relative: 2 };
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }
    // 同じタイプ内では優先度でソート
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // 最後にソース名でアルファベット順
    return a.source.localeCompare(b.source);
  });

  // グループ化（空行を挿入）
  const result: string[] = [];
  let lastType: string | null = null;

  for (const imp of sorted) {
    if (lastType !== null && lastType !== imp.type) {
      result.push(""); // 空行を挿入
    }
    result.push(imp.raw);
    lastType = imp.type;
  }

  return result;
}

/**
 * ファイル内のインポートを整理する
 */
function organizeImports(filePath: string, paths?: Record<string, string[]>) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const imports: ImportStatement[] = [];
  const nonImports: string[] = [];
  let inImportSection = true;

  for (const line of lines) {
    const trimmed = line.trim();
    // インポート文の判定
    if (
      trimmed.startsWith("import ") &&
      (trimmed.includes(" from ") || trimmed.endsWith(";"))
    ) {
      imports.push(classifyImport(line, paths));
    } else if (trimmed === "") {
      // 空行はインポートセクションの間は無視
      if (!inImportSection) {
        nonImports.push(line);
      }
    } else {
      // インポートセクション終了
      inImportSection = false;
      nonImports.push(line);
    }
  }

  // インポートを並び替え
  const sortedImports = sortImports(imports);

  // ファイルに書き戻し
  const newContent = [...sortedImports, "", ...nonImports].join("\n");
  fs.writeFileSync(filePath, newContent, "utf-8");
}

/**
 * パッケージ内のすべての TypeScript ファイルを処理
 */
async function processPackage(packageDir: string) {
  console.log(`Processing package: ${packageDir}`);

  // tsconfig.json を読み込み
  const tsconfig = loadTSConfig(packageDir);
  const paths = tsconfig?.compilerOptions?.paths;

  // src ディレクトリ内の .ts ファイルを検索
  const srcDir = path.join(packageDir, "src");
  if (!fs.existsSync(srcDir)) {
    console.log(`  Skipping (no src directory)`);
    return;
  }

  const files = await glob("**/*.ts", {
    cwd: srcDir,
    absolute: true,
    ignore: ["**/*.d.ts", "**/node_modules/**"],
  });

  console.log(`  Found ${files.length} TypeScript files`);

  for (const file of files) {
    organizeImports(file, paths);
  }

  console.log(`  ✓ Completed\n`);
}

/**
 * メイン処理
 */
async function main() {
  const rootDir = process.cwd();
  const packagesDir = path.join(rootDir, "packages");

  // packages ディレクトリ内のパッケージを取得
  const packages = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(packagesDir, dirent.name));

  console.log(`Found ${packages.length} packages\n`);

  for (const pkg of packages) {
    await processPackage(pkg);
  }

  console.log("All packages processed!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
