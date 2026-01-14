# @hmpact/fs

ファイルシステムのユーティリティパッケージです。JSON と JSONC ファイルの読み込み機能を提供し、Zod スキーマやカスタム検証関数を使用したスキーマ検証をサポートしています。

## 特徴

- 📄 JSON と JSONC ファイルの統合読み込み
- ✅ Zod スキーマまたはカスタム型ガード関数による検証
- 🔒 型安全な実装
- 🛡️ エラーハンドリング（ファイル不在、解析エラー、検証エラー）
- 🎯 統一された API インターフェース

## インストール

```bash
pnpm add @hmpact/fs
```

## 基本的な使い方

### JSON ファイルの読み込み

```typescript
import { hfs } from "@hmpact/fs";

const result = await hfs.readFile("./config.json");

if (result.status === "success") {
  console.log("JSON データ:", result.data);
} else if (result.status === "not_found") {
  console.log("ファイルが見つかりません");
} else if (result.status === "validation_failed") {
  console.log("検証エラー:", result.message);
} else {
  console.log("エラー:", result.error);
}
```

### JSONC ファイルの読み込み

```typescript
import { hfs } from "@hmpact/fs";

const result = await hfs.readFile("./config.jsonc");

if (result.status === "success") {
  console.log("JSONC データ:", result.data);
}
```

## スキーマ検証

### Zod スキーマでの検証

```typescript
import { hfs } from "@hmpact/fs";
import { z } from "zod";

const configSchema = z.object({
  debug: z.boolean(),
  port: z.number(),
  host: z.string(),
  apiKey: z.string().optional(),
});

type Config = z.infer<typeof configSchema>;

const result = await hfs.readFile<Config>("./config.json", {
  schema: configSchema,
});

if (result.status === "success") {
  console.log("検証済み設定:", result.data);
  console.log("ポート:", result.data.port);
} else if (result.status === "validation_failed") {
  console.log("検証エラー:", result.message);
  console.log("詳細:", result.error);
}
```

### カスタム型ガード関数での検証

```typescript
import { hfs } from "@hmpact/fs";

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

function isDatabaseConfig(data: unknown): data is DatabaseConfig {
  return (
    typeof data === "object" &&
    data !== null &&
    "host" in data &&
    "port" in data &&
    "database" in data &&
    "user" in data &&
    "password" in data &&
    typeof (data as any).host === "string" &&
    typeof (data as any).port === "number" &&
    typeof (data as any).database === "string" &&
    typeof (data as any).user === "string" &&
    typeof (data as any).password === "string"
  );
}

const result = await hfs.readFile<DatabaseConfig>("./db-config.json", {
  schema: isDatabaseConfig,
});

if (result.status === "success") {
  console.log("検証済みデータベース設定:", result.data);
}
```

### JSONC ファイルの検証付き読み込み

```typescript
import { hfs } from "@hmpact/fs";
import { z } from "zod";

const projectConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  scripts: z.record(z.string()),
});

type ProjectConfig = z.infer<typeof projectConfigSchema>;

const result = await hfs.readFile<ProjectConfig>("./tsconfig.jsonc", {
  schema: projectConfigSchema,
});

if (result.status === "success") {
  console.log("プロジェクト設定:", result.data);
}
```

## API リファレンス

### `hfs.readFile<T>(path, options?)`

JSON または JSONC ファイルをパスから読み込みます。ファイル拡張子（`.json` または `.jsonc`）に基づいて自動的に適切なパーサーが選択されます。

**パラメータ:**

```typescript
path: string;
options?: {
  schema?: ZodSchema<T> | ((data: unknown) => data is T);
}
```

**戻り値:**

```typescript
type Response<T = unknown> = {
  status: "success" | "not_found" | "error" | "validation_failed";
  message?: string;
  data?: T;
  error?: unknown;
};
```

**ステータスの説明:**

| ステータス          | 説明                                             |
| ------------------- | ------------------------------------------------ |
| `success`           | ファイルが正常に読み込まれました                 |
| `not_found`         | ファイルが見つかりません（ENOENT）               |
| `error`             | ファイル読み込みまたはパースエラーが発生しました |
| `validation_failed` | スキーマ検証に失敗しました                       |

**使用例:**

```typescript
// 型検証なし
const result = await hfs.readFile("./data.json");

// Zod スキーマでの型検証
const result = await hfs.readFile<MyType>("./config.jsonc", {
  schema: myZodSchema,
});

// 型ガード関数での型検証
const result = await hfs.readFile<MyType>("./config.json", {
  schema: isMyType,
});
```

## 対応ファイル形式

### JSON（`.json`）

標準的な JSON ファイル形式です。JavaScript の `JSON.parse()` を使用してパースされます。

### JSONC（`.jsonc`）

JSON with Comments の形式です。コメント機能を含む JSON の拡張形式で、[jsonc-parser](https://github.com/microsoft/jsonc-parser) を使用してパースされます。

**JSONC の例:**

```jsonc
{
  // これはコメントです
  "name": "my-project",
  /* ブロックコメントも使用可能 */
  "version": "1.0.0",
  "scripts": {
    "build": "tsc", // ビルド用スクリプト
    "test": "jest",
  },
}
```

## 依存関係

- `jsonc-parser` - JSONC ファイルの解析
- `zod` - スキーマ検証

## ライセンス

MIT
