# @hmpact/cache

キャッシュファイルシステム管理パッケージです。ホームディレクトリの`.cache`ディレクトリを使用してデータをキャッシュします。

## 特徴

- 🎯 シンプルなキャッシュAPI
- ✅ Zod スキーマを使用した検証機能
- 🔒 型安全な実装
- 📁 ホームディレクトリベースのキャッシュ管理

## インストール

```bash
pnpm add @hmpact/cache
```

## 基本的な使い方

### キャッシュにデータを保存

```typescript
import { hcache } from "@hmpact/cache";

const result = await hcache.put({
  key: "my-data",
  data: "cached content",
});

if (result.status === "success") {
  console.log("キャッシュを保存しました:", result.row);
}
```

### キャッシュからデータを取得

```typescript
import { hcache } from "@hmpact/cache";

const result = await hcache.get({
  key: "my-data",
});

if (result.status === "success") {
  console.log("キャッシュデータ:", result.row.data);
} else if (result.status === "not_found") {
  console.log("キャッシュが見つかりません");
} else {
  console.log("エラー:", result.error);
}
```

### キャッシュの存在確認

```typescript
import { hcache } from "@hmpact/cache";

const result = await hcache.has({
  key: "my-data",
});

if (result.status === "success") {
  console.log("キャッシュが存在します");
} else if (result.status === "not_found") {
  console.log("キャッシュが見つかりません");
}
```

## 高度な使い方

### スキーマ検証付きで取得

Zod スキーマまたはカスタム型ガード関数を使用してキャッシュデータを検証できます。

#### Zod スキーマでの検証

```typescript
import { hcache } from "@hmpact/cache";
import { z } from "zod";

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof userSchema>;

const result = await hcache.getValidated<User>({
  key: "user-data",
  options: {
    schema: userSchema,
  },
});

if (result.status === "success") {
  console.log("検証済みユーザーデータ:", result.data);
} else if (result.status === "validation_error") {
  console.log("検証エラー:", result.error);
}
```

#### カスタム型ガード関数での検証

```typescript
import { hcache } from "@hmpact/cache";

interface Config {
  debug: boolean;
  timeout: number;
}

function isConfig(data: unknown): data is Config {
  return (
    typeof data === "object" &&
    data !== null &&
    "debug" in data &&
    "timeout" in data &&
    typeof (data as any).debug === "boolean" &&
    typeof (data as any).timeout === "number"
  );
}

const result = await hcache.getValidated<Config>({
  key: "config",
  options: {
    schema: isConfig,
  },
});

if (result.status === "success") {
  console.log("検証済み設定:", result.data);
}
```

## API リファレンス

### `hcache.put(request)`

キャッシュにデータを保存します。

**パラメータ:**

```typescript
interface HCachePutRequest {
  key: string; // キャッシュキー
  data: string | Buffer; // 保存するデータ
}
```

**戻り値:**

```typescript
type HCachePutResponse =
  | {
      status: "success";
      row: string; // 保存されたデータのハッシュ
    }
  | {
      status: "error";
      error: unknown;
    };
```

### `hcache.get(request)`

キャッシュからデータを取得します。

**パラメータ:**

```typescript
interface HCacheGetRequest {
  key: string; // キャッシュキー
}
```

**戻り値:**

```typescript
type HCacheGetResponse =
  | {
      status: "success";
      row: GetCacheObject; // キャッシュオブジェクト
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
      error: unknown;
    };
```

### `hcache.has(request)`

キャッシュの存在確認をします。

**パラメータ:**

```typescript
interface HCacheHasRequest {
  key: string; // キャッシュキー
}
```

**戻り値:**

```typescript
type HCacheHasResponse =
  | {
      status: "success";
      row: get.HasContentObject;
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
      error: unknown;
    };
```

### `hcache.ls()`

すべてのキャッシュエントリをリストアップします。

**戻り値:**

```typescript
type HCacheLsResponse =
  | {
      status: "success";
      row: ls.Cache; // キャッシュオブジェクトマップ
    }
  | {
      status: "error";
      error: unknown;
    };
```

### `hcache.clear()`

すべてのキャッシュをクリアします。

**戻り値:**

```typescript
type HCacheClearResponse = {
  status: "success" | "error";
};
```

### `hcache.getValidated(request)`

スキーマ検証付きでキャッシュからデータを取得します。

**パラメータ:**

```typescript
interface HCacheGetValidatedRequest<T = unknown> {
  key: string;
  options?: {
    schema?: ZodSchema<T> | ((data: unknown) => data is T);
  };
}
```

**戻り値:**

```typescript
type HCacheGetValidatedResponse<T = unknown> =
  | {
      status: "success";
      data: T;
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
      error: unknown;
    }
  | {
      status: "validation_error";
      error: string;
    };
```

## キャッシュディレクトリ

キャッシュはホームディレクトリの`.cache`ディレクトリに保存されます。

- **Linux/macOS**: `~/.cache`
- **Windows**: `%USERPROFILE%\.cache`

## 依存関係

- `@hmpact/path` - パス管理
- `@hmpact/fs` - ファイルシステム操作
- `cacache` - キャッシュの実装
- `zod` - スキーマ検証（オプション）

## ライセンス

MIT
