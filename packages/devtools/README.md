# @hmpact/devtools

開発ツールユーティリティパッケージです。ビルド情報の管理と取得機能を提供します。

## 特徴

- 🔨 ビルド情報の自動生成
- 📦 バージョン、コミット、ブランチ情報の管理
- ✅ Zod スキーマを使用した型安全な実装
- 🔒 自動生成ファイルによる一元管理
- ⚡ 最小限のランタイムフットプリント

## インストール

```bash
pnpm add @hmpact/devtools
```

## 基本的な使い方

### ビルド情報の取得

```typescript
import HmpactBuildInfo from "@hmpact/devtools/build-info";

console.log(HmpactBuildInfo.version);   // "0.0.1-beta.2"
console.log(HmpactBuildInfo.buildId);   // "MK9GKVY6"
console.log(HmpactBuildInfo.timestamp); // "2026-01-11T08:15:00.798Z"
```

## API リファレンス

### `HmpactBuildInfo`

ビルド情報を含むオブジェクト。自動生成されるため、手動で編集すべきではありません。

**型:**

```typescript
type HmpactBuildInfoType = {
  version: string;    // パッケージバージョン
  buildId: string;    // ビルド ID
  commit: string;     // コミットハッシュ
  branch: string;     // ブランチ名
  timestamp: string;  // ビルドタイムスタンプ (ISO 8601)
};
```

**プロパティ:**

| プロパティ | 説明 | 例 |
| --------- | ---- | --- |
| `version` | パッケージのバージョン | `"0.0.1-beta.2"` |
| `buildId` | ビルドを識別するためのユニークな ID | `"MK9GKVY6"` |
| `commit` | Git コミットハッシュ（オプション） | `"abc1234"` |
| `branch` | Git ブランチ名（オプション） | `"main"` |
| `timestamp` | ビルドが実行された時刻（ISO 8601形式） | `"2026-01-11T08:15:00.798Z"` |

### `HmpactBuildInfoSchema`

ビルド情報の Zod スキーマ。検証に使用できます。

```typescript
import { HmpactBuildInfoSchema, type HmpactBuildInfoType } from "@hmpact/devtools/build-info";
import z from "zod";

// スキーマを使用して検証
try {
  const validated = HmpactBuildInfoSchema.parse(someData);
  console.log("検証成功:", validated);
} catch (error) {
  console.error("検証失敗:", error);
}
```

## 使用例

### バージョン表示

```typescript
import HmpactBuildInfo from "@hmpact/devtools/build-info";
import { HmpactBanner } from "@hmpact/logger";

function showVersion() {
  HmpactBanner("My App", HmpactBuildInfo.version);
  console.log(`Build ID: ${HmpactBuildInfo.buildId}`);
  console.log(`Built at: ${HmpactBuildInfo.timestamp}`);
}

showVersion();
```

### ランタイム情報の出力

```typescript
import HmpactBuildInfo from "@hmpact/devtools/build-info";
import { logger } from "@hmpact/logger";

logger.info(`アプリケーション開始 - v${HmpactBuildInfo.version}`);
logger.debug(`Build ID: ${HmpactBuildInfo.buildId}`);
logger.debug(`Timestamp: ${HmpactBuildInfo.timestamp}`);

if (HmpactBuildInfo.commit) {
  logger.debug(`Commit: ${HmpactBuildInfo.commit}`);
}

if (HmpactBuildInfo.branch) {
  logger.debug(`Branch: ${HmpactBuildInfo.branch}`);
}
```

### ビルド情報の検証と使用

```typescript
import HmpactBuildInfo, { HmpactBuildInfoSchema } from "@hmpact/devtools/build-info";

async function initializeApp() {
  // ビルド情報の検証
  try {
    const buildInfo = HmpactBuildInfoSchema.parse(HmpactBuildInfo);
    console.log("ビルド情報:", buildInfo);

    // バージョンチェック
    const requiredVersion = "0.0.1-beta.2";
    if (buildInfo.version !== requiredVersion) {
      console.warn(
        `警告: 想定されるバージョン ${requiredVersion} と異なります`
      );
    }

    return buildInfo;
  } catch (error) {
    console.error("ビルド情報が無効です:", error);
    process.exit(1);
  }
}
```

### API レスポンスのメタデータ

```typescript
import HmpactBuildInfo from "@hmpact/devtools/build-info";

function createAPIResponse<T>(data: T, statusCode: number = 200) {
  return {
    status: statusCode,
    data,
    meta: {
      version: HmpactBuildInfo.version,
      buildId: HmpactBuildInfo.buildId,
      timestamp: new Date().toISOString(),
    },
  };
}

// 使用例
const response = createAPIResponse({
  users: [{ id: 1, name: "John" }],
});

console.log(response);
// {
//   status: 200,
//   data: { users: [...] },
//   meta: {
//     version: "0.0.1-beta.2",
//     buildId: "MK9GKVY6",
//     timestamp: "2026-01-11T..."
//   }
// }
```

## ビルド情報の自動生成

ビルド情報は `.scripts/build-info.js` スクリプトで自動生成されます。

### ビルドプロセス

```bash
pnpm build
```

実行すると以下の順序で処理されます：

1. `build:info` スクリプトが実行される
2. `src/features/build-info/index.gen.ts` が自動生成される
3. その内容で esbuild でバンドルされる

### 自動生成ファイルについて

`src/features/build-info/index.gen.ts` は自動生成されるため、手動で編集しないでください。

```typescript
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
// ...
```

このファイルは `.gitignore` に含めるか、またはビルド前に常に再生成されるため、バージョン管理に含める必要はありません。

## デフォルトエクスポート

このパッケージは複数のエントリポイントを提供します：

### メインエントリポイント

```typescript
import * as devtools from "@hmpact/devtools";
```

現在、メインエントリポイントは空です。

### ビルド情報エントリポイント

```typescript
import HmpactBuildInfo from "@hmpact/devtools/build-info";
import { HmpactBuildInfoSchema, type HmpactBuildInfoType } from "@hmpact/devtools/build-info";
```

## 依存関係

- `zod` - スキーマ検証

## ライセンス

MIT
