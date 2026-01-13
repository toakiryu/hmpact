import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import { parse } from "jsonc-parser";

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
  // JSONC としてパース（コメントと末尾カンマに対応）
  return parse(content);
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
    // `import "module"` のような副作用インポートの場合
    const sideEffectMatch = importLine.match(/import\s+["']([^"']+)["']/);
    if (sideEffectMatch) {
      const source = sideEffectMatch[1];
      return {
        raw: importLine,
        source,
        type: source.startsWith(".") ? "relative" : "external",
        priority: source.startsWith(".") ? 2 : 0,
      };
    }
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
    const aliasKeys = Object.keys(paths).map((key) => key.replace(/\/\*$/, ""));
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
 * エイリアスパスを相対パスに変換する
 */
function convertAliasToRelative(
  importLine: string,
  filePath: string,
  paths?: Record<string, string[]>,
  baseUrl?: string,
): string {
  if (!paths || !baseUrl) {
    return importLine;
  }

  const match = importLine.match(/from\s+["']([^"']+)["']/);
  if (!match) {
    return importLine;
  }

  const importPath = match[1];

  // 既に相対パスの場合はスキップ
  if (importPath.startsWith(".")) {
    return importLine;
  }

  // パッケージのルートディレクトリ（tsconfigがある場所）
  const packageRoot = filePath.replace(/[\\/]src[\\/].*$/, "");
  const baseDir = path.resolve(packageRoot, baseUrl);
  const fileDir = path.dirname(filePath);

  // エイリアスに一致するかチェック
  for (const [aliasPattern, aliasPaths] of Object.entries(paths)) {
    const alias = aliasPattern.replace(/\/\*$/, "");
    const aliasTarget = aliasPaths[0].replace(/\/\*$/, "");

    if (importPath.startsWith(alias)) {
      // エイリアス部分を削除して残りのパスを取得
      const restPath = importPath.substring(alias.length + 1); // +1 は "/" の分

      // エイリアスターゲットのパスを解決
      const aliasDir = path.resolve(baseDir, aliasTarget);
      const targetPath = path.join(aliasDir, restPath);

      // ファイルから見た相対パスを計算
      let relativePath = path.relative(fileDir, targetPath).replace(/\\/g, "/");

      // 同じディレクトリまたは上位ディレクトリへの参照でない場合は ./ を追加
      if (!relativePath.startsWith("..")) {
        relativePath = "./" + relativePath;
      }

      return importLine.replace(
        /from\s+["']([^"']+)["']/,
        `from "${relativePath}"`,
      );
    }
  }

  return importLine;
}

/**
 * 相対パスをエイリアスに変換する
 */
function convertRelativeToAlias(
  importLine: string,
  filePath: string,
  paths?: Record<string, string[]>,
  baseUrl?: string,
): string {
  if (!paths || !baseUrl) {
    return importLine;
  }

  const match = importLine.match(/from\s+["']([^"']+)["']/);
  if (!match) {
    return importLine;
  }

  const importPath = match[1];

  // 相対パスでない場合はスキップ
  if (!importPath.startsWith(".")) {
    return importLine;
  }

  // export * from の場合はエイリアスパスへの変換をスキップ
  // (ビルドシステムが正しく解決できない場合があるため)
  if (importLine.trim().startsWith("export *")) {
    return importLine;
  }

  // ファイルの絶対パスを取得
  const fileDir = path.dirname(filePath);
  const absoluteImportPath = path.resolve(fileDir, importPath);

  // パッケージのルートディレクトリ（tsconfigがある場所）
  const packageRoot = filePath.replace(/[\\/]src[\\/].*$/, "");
  const baseDir = path.resolve(packageRoot, baseUrl);

  // デバッグ出力
  const debug = false; // デバッグ時はtrueに設定
  if (debug) {
    console.log("---");
    console.log("filePath:", filePath);
    console.log("importPath:", importPath);
    console.log("packageRoot:", packageRoot);
    console.log("baseDir:", baseDir);
    console.log("absoluteImportPath:", absoluteImportPath);
  }

  // エイリアスに変換できるかチェック（最も具体的なマッチを優先）
  let bestMatch: { alias: string; path: string; depth: number } | null = null;

  for (const [aliasPattern, aliasPaths] of Object.entries(paths)) {
    const alias = aliasPattern.replace(/\/\*$/, "");
    const aliasTarget = aliasPaths[0].replace(/\/\*$/, "");

    // エイリアスターゲットのパスを解決
    const aliasDir = path.resolve(baseDir, aliasTarget);
    const relativeFromAlias = path
      .relative(aliasDir, absoluteImportPath)
      .replace(/\\/g, "/");

    if (debug) {
      console.log(`  Checking alias: ${alias} -> ${aliasTarget}`);
      console.log(`  aliasDir: ${aliasDir}`);
      console.log(`  relativeFromAlias: ${relativeFromAlias}`);
    }

    // エイリアスディレクトリ内のファイルかチェック
    if (!relativeFromAlias.startsWith("..")) {
      // より深いディレクトリのエイリアスを優先（より具体的）
      const depth = aliasTarget.split("/").length;
      if (!bestMatch || depth > bestMatch.depth) {
        bestMatch = {
          alias,
          path: relativeFromAlias,
          depth,
        };
      }
    }
  }

  if (bestMatch) {
    const newImportPath = `${bestMatch.alias}/${bestMatch.path}`;
    if (debug) {
      console.log(`  ✓ Converted to: ${newImportPath}`);
    }
    return importLine.replace(
      /from\s+["']([^"']+)["']/,
      `from "${newImportPath}"`,
    );
  }

  return importLine;
}

/**
 * ファイル内のインポートを整理する
 */
function organizeImports(
  filePath: string,
  paths?: Record<string, string[]>,
  baseUrl?: string,
) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const imports: ImportStatement[] = [];
  const originalLines: string[] = []; // 元の行を保存（空行含む）
  const nonImports: string[] = [];
  let inImportSection = true;

  for (const line of lines) {
    const trimmed = line.trim();
    // インポート/エクスポート文の判定
    if (
      (trimmed.startsWith("import ") || trimmed.startsWith("export ")) &&
      (trimmed.includes(" from ") ||
        (trimmed.startsWith("import ") &&
          trimmed.match(/import\s+["'][^"']+["']/)))
    ) {
      let convertedLine = line;

      // export * from の場合はエイリアスを相対パスに変換
      if (trimmed.startsWith("export *")) {
        convertedLine = convertAliasToRelative(line, filePath, paths, baseUrl);
      } else {
        // 通常のimportの場合は相対パスをエイリアスに変換
        convertedLine = convertRelativeToAlias(line, filePath, paths, baseUrl);
      }

      originalLines.push(convertedLine);
      imports.push(classifyImport(convertedLine, paths));
    } else if (trimmed === "") {
      // インポートセクション内の空行を保持
      if (inImportSection && originalLines.length > 0) {
        originalLines.push(line);
      } else if (!inImportSection) {
        nonImports.push(line);
      }
    } else {
      // インポートセクション終了
      inImportSection = false;
      nonImports.push(line);
    }
  }

  // 変更がない場合はスキップ
  if (imports.length === 0) {
    return;
  }

  // originalLinesから末尾の空行を削除
  while (
    originalLines.length > 0 &&
    originalLines[originalLines.length - 1].trim() === ""
  ) {
    originalLines.pop();
  }

  // インポートを並び替え
  const sortedImports = sortImports(imports);

  // 元のインポートと同じ場合はスキップ
  const originalImportsStr = originalLines.join("\n");
  const newImportsStr = sortedImports.join("\n");

  const debug2 = process.env.DEBUG_ALIASIFY === "1";
  if (debug2) {
    console.log(`\n=== ${path.relative(process.cwd(), filePath)} ===`);
    console.log("Original imports:");
    console.log(originalImportsStr);
    console.log("\nNew imports:");
    console.log(newImportsStr);
    console.log(`\nEqual: ${originalImportsStr === newImportsStr}`);
  }

  if (originalImportsStr === newImportsStr) {
    return;
  }

  // ファイルに書き戻し
  const newContent = [...sortedImports, "", ...nonImports].join("\n");
  fs.writeFileSync(filePath, newContent, "utf-8");
  console.log(`  📝 Updated: ${path.relative(process.cwd(), filePath)}`);
}

/**
 * パッケージ内のすべての TypeScript ファイルを処理
 */
async function processPackage(packageDir: string) {
  console.log(`Processing package: ${packageDir}`);

  // tsconfig.json を読み込み
  const tsconfig = loadTSConfig(packageDir);
  const paths = tsconfig?.compilerOptions?.paths;
  const baseUrl = tsconfig?.compilerOptions?.baseUrl || ".";

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
    organizeImports(file, paths, baseUrl);
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
