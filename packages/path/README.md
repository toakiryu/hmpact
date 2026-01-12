# @hmpact/path

パス管理ユーティリティパッケージです。ホームディレクトリベースの標準化されたパスを提供します。

## 特徴

- 🏠 ホームディレクトリパスの自動解決
- 📁 Hmpact 関連ディレクトリの標準パス
- 🔒 一貫性のあるディレクトリ構造
- ⚡ 最小限の依存関係
- 🔧 クロスプラットフォーム対応

## インストール

```bash
pnpm add @hmpact/path
```

## 基本的な使い方

```typescript
import { hpath } from "@hmpact/path";

// ユーザーのホームディレクトリ
console.log(hpath.homedir.user);
// Linux/macOS: /home/username
// Windows: C:\Users\username

// Hmpact 設定ディレクトリ
console.log(hpath.homedir.hmpact);
// Linux/macOS: /home/username/.hmpact
// Windows: C:\Users\username\.hmpact

// キャッシュディレクトリ
console.log(hpath.homedir.cache);
// Windows: C:\Users\username\AppData\Local\hmpact\cache
// macOS: /Users/username/Library/Caches/hmpact
// Linux: /home/username/.cache/hmpact
```

## API リファレンス

### `hpath.homedir.user`

ユーザーのホームディレクトリパスを返します。

```typescript
import { hpath } from "@hmpact/path";

const homeDir = hpath.homedir.user;
console.log(homeDir); // /home/username or C:\Users\username
```

**戻り値:**

- **Linux/macOS**: `/home/username`
- **Windows**: `C:\Users\username`

### `hpath.homedir.hmpact`

Hmpact 用の設定ディレクトリパスを返します。

```typescript
import { hpath } from "@hmpact/path";

const hmpactDir = hpath.homedir.hmpact;
console.log(hmpactDir); // /home/username/.hmpact or C:\Users\username\.hmpact
```

**用途:** Hmpact 関連の設定ファイルやプロジェクト情報の保存

**戻り値:**

- **Linux/macOS**: `/home/username/.hmpact`
- **Windows**: `C:\Users\username\.hmpact`

### `hpath.homedir.cache`

キャッシュディレクトリパスを返します。プラットフォームごとに最適な標準キャッシュディレクトリを使用します。

```typescript
import { hpath } from "@hmpact/path";

const cacheDir = hpath.homedir.cache;
console.log(cacheDir);
// Windows: C:\Users\username\AppData\Local\hmpact\cache
// macOS: /Users/username/Library/Caches/hmpact
// Linux: /home/username/.cache/hmpact
```

**用途:** キャッシュファイルやテンポラリデータの保存

**戻り値:**

- **Windows**: `%LOCALAPPDATA%\hmpact\cache` (例: `C:\Users\username\AppData\Local\hmpact\cache`)
- **macOS**: `~/Library/Caches/hmpact` (例: `/Users/username/Library/Caches/hmpact`)
- **Linux/Unix**: `$XDG_CACHE_HOME/hmpact` または `~/.cache/hmpact` (XDG Base Directory 仕様に準拠)

**注意事項:**

- 環境変数 `XDG_CACHE_HOME` (Linux/Unix) または `LOCALAPPDATA` (Windows) が設定されている場合、それらが優先されます
- 各プラットフォームの標準規約に従った場所にキャッシュが保存されます

## 使用例

### ディレクトリパスの構築

```typescript
import { hpath } from "@hmpact/path";
import path from "path";

// 設定ファイルのパス
const configPath = path.join(hpath.homedir.hmpact, "config.json");

// キャッシュファイルのパス
const cachePath = path.join(hpath.homedir.cache, "data.cache");

console.log(configPath);
// /home/username/.hmpact/config.json or C:\Users\username\.hmpact\config.json

console.log(cachePath);
// Windows: C:\Users\username\AppData\Local\hmpact\cache\data.cache
// macOS: /Users/username/Library/Caches/hmpact/data.cache
// Linux: /home/username/.cache/hmpact/data.cache
```

### 他の Hmpact パッケージとの組み合わせ

```typescript
import { hpath } from "@hmpact/path";
import { hfs } from "@hmpact/fs";
import path from "path";

// 設定ファイルを読み込み
const result = await hfs.json.read.byPath(
  path.join(hpath.homedir.hmpact, "config.json"),
);
```

```typescript
import { hpath } from "@hmpact/path";
import { hcache } from "@hmpact/cache";

// キャッシュからデータを取得
const result = await hcache.get({
  key: "my-data",
});
```

### ファイルシステム操作

```typescript
import { hpath } from "@hmpact/path";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

async function saveConfiguration(config: any) {
  const hmpactDir = hpath.homedir.hmpact;

  // ディレクトリが存在しない場合は作成
  await mkdir(hmpactDir, { recursive: true });

  // 設定ファイルを保存
  const configPath = path.join(hmpactDir, "config.json");
  await writeFile(configPath, JSON.stringify(config, null, 2));
}
```

## ディレクトリ構造

**Windows:**

```
C:\Users\username\
├── .hmpact\              (Hmpact 設定ディレクトリ)
│   ├── config.json
│   └── ...
└── AppData\Local\hmpact\ (キャッシュディレクトリ)
    └── cache\
        ├── *.cache
        └── ...
```

**macOS:**

```
/Users/username/
├── .hmpact/                 (Hmpact 設定ディレクトリ)
│   ├── config.json
│   └── ...
└── Library/Caches/hmpact/   (キャッシュディレクトリ)
    ├── *.cache
    └── ...
```

**Linux/Unix:**

```
/home/username/ (ホームディレクトリ)
├── .hmpact/          (Hmpact 設定ディレクトリ)
│   ├── config.json
│   └── ...
└── .cache/hmpact/    (キャッシュディレクトリ)
    ├── *.cache
    └── ...
```

## 依存関係

- なし（Node.js 標準ライブラリのみを使用）

## ライセンス

MIT
