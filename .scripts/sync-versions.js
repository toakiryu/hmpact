#!/usr/bin/env node

/**
 * モノレポ内のすべてのパッケージのバージョンを一括更新
 * Next.jsスタイルの統一バージョン管理をサポート
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findPackageJsonFiles(baseDir) {
  const packagesDir = path.join(baseDir, "packages");

  if (!fs.existsSync(packagesDir)) {
    return [];
  }

  const results = [];
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true });

  for (const pkg of packages) {
    if (pkg.isDirectory()) {
      const pkgJsonPath = path.join(packagesDir, pkg.name, "package.json");
      if (fs.existsSync(pkgJsonPath)) {
        results.push(pkgJsonPath);
      }
    }
  }

  return results;
}

async function main() {
  const newVersion = process.argv[2];

  if (!newVersion) {
    console.error("❌ 使用方法: node sync-versions.js <version>");
    console.error("   例: node sync-versions.js 1.0.0");
    console.error("   例: node sync-versions.js 1.0.0-beta.1");
    process.exit(1);
  }

  // バージョン形式の簡易検証
  const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
  if (!versionRegex.test(newVersion)) {
    console.error(`❌ 無効なバージョン形式: ${newVersion}`);
    console.error("   形式: X.Y.Z または X.Y.Z-prerelease");
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, "..");

  // すべてのパッケージのpackage.jsonを検索
  const packageJsonPaths = findPackageJsonFiles(rootDir);

  if (packageJsonPaths.length === 0) {
    console.warn("⚠️  packages/*/package.jsonが見つかりません");
    process.exit(0);
  }

  console.log(`📦 ${packageJsonPaths.length}個のパッケージを更新します\n`);
  console.log(`🎯 新しいバージョン: ${newVersion}\n`);

  let updatedCount = 0;

  for (const pkgPath of packageJsonPaths) {
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const pkgName = pkgJson.name || path.basename(path.dirname(pkgPath));
      const oldVersion = pkgJson.version;

      if (!oldVersion) {
        console.error(
          `⚠️  ${pkgName}: バージョンが定義されていません（スキップ）`,
        );
        continue;
      }

      if (oldVersion === newVersion) {
        console.log(`   ⏭️  ${pkgName}: すでに ${newVersion} です`);
        continue;
      }

      // バージョンを更新
      pkgJson.version = newVersion;

      // 整形して書き込み
      fs.writeFileSync(
        pkgPath,
        JSON.stringify(pkgJson, null, 2) + "\n",
        "utf-8",
      );

      console.log(`   ✅ ${pkgName}: ${oldVersion} → ${newVersion}`);
      updatedCount++;
    } catch (error) {
      console.error(`❌ ${pkgPath}の更新に失敗: ${error.message}`);
      process.exit(1);
    }
  }

  console.log("");

  if (updatedCount === 0) {
    console.log("ℹ️  更新されたパッケージはありません");
  } else {
    console.log(
      `✨ ${updatedCount}個のパッケージを ${newVersion} に更新しました`,
    );
    console.log("");
    console.log("📝 次のステップ:");
    console.log("   1. pnpm check:versions でバージョンが統一されているか確認");
    console.log(
      `   2. 変更をコミット: git add . && git commit -m "chore: bump version to ${newVersion}"`,
    );
    console.log(`   3. タグを作成: git tag v${newVersion}`);
    console.log("   4. プッシュ: git push && git push --tags");
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ エラーが発生しました:", error);
  process.exit(1);
});
