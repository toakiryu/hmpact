# @hmpact/fs

ファイルシステムのユーティリティパッケージです。JSON と JSONC ファイルの読み込み機能を提供し、スキーマ検証をサポートしています。

## 特徴

- 📄 JSON ファイル読み込み
- 💬 JSONC（JSON with Comments）ファイル読み込み
- ✅ Zod スキーマを使用した検証機能
- 🔒 型安全な実装
- 🛡️ エラーハンドリング

## インストール

```bash
pnpm add @hmpact/fs
```

## 基本的な使い方

### JSON ファイルの読み込み

```typescript
import { hfs } from "@hmpact/fs";

const result = await hfs.json.read.byPath("./config.json");

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

const result = await hfs.jsonc.read.byPath("./config.jsonc");

if (result.status === "success") {
  console.log("JSONC データ:", result.data);
}
```

## 高度な使い方

### スキーマ検証付きで読み込み

Zod スキーマまたはカスタム型ガード関数を使用してファイルデータを検証できます。

#### Zod スキーマでの検証

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

const result = await hfs.json.read.byPath<Config>("./config.json", {
  schema: configSchema,
});

if (result.status === "success") {
  console.log("検証済み設定:", result.data);
  console.log("ポート:", result.data.port);
} else if (result.status === "validation_failed") {
  console.log("検証エラー:", result.message);
}
```

#### カスタム型ガード関数での検証

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

const result = await hfs.json.read.byPath<DatabaseConfig>("./db-config.json", {
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

const result = await hfs.jsonc.read.byPath<ProjectConfig>("./tsconfig.jsonc", {
  schema: projectConfigSchema,
});

if (result.status === "success") {
  console.log("プロジェクト設定:", result.data);
}
```

## API リファレンス

### `hfs.json.read.byPath(path, options?)`

JSON ファイルをパスから読み込みます。

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

| ステータス          | 説明                                 |
| ------------------- | ------------------------------------ |
| `success`           | ファイルが正常に読み込まれました     |
| `not_found`         | ファイルが見つからないか読み込み失敗 |
| `error`             | エラーが発生しました                 |
| `validation_failed` | スキーマ検証に失敗しました           |

### `hfs.jsonc.read.byPath(path, options?)`

JSONC（JSON with Comments）ファイルをパスから読み込みます。

**パラメータ:**

```typescript
path: string;
options?: {
  schema?: ZodSchema<T> | ((data: unknown) => data is T);
}
```

**戻り値:**

`hfs.json.read.byPath` と同様の戻り値形式です。

```typescript
type Response<T = unknown> = {
  status: "success" | "not_found" | "error" | "validation_failed";
  message?: string;
  data?: T;
  error?: unknown;
};
```

## JSONC について

JSONC（JSON with Comments）は、コメント機能を含む JSON の拡張形式です。このパッケージは [jsonc-parser](https://github.com/microsoft/jsonc-parser) を使用して JSONC ファイルを解析しています。

### JSONC の例

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
- `zod` - スキーマ検証（オプション）

## ライセンス

MIT
