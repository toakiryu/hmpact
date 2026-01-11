# @hmpact/logger

ロギングユーティリティパッケージです。基本的なログ出力機能とバナー表示機能を提供します。

## 特徴

- 📝 基本的なログ出力（info、warn、error、debug）
- 🎨 カラーフルなバナー表示
- 🌈 グラデーション付きテキスト描画
- 🔧 最小限で使いやすい API
- 🐛 デバッグモードのサポート

## インストール

```bash
pnpm add @hmpact/logger
```

## 基本的な使い方

### ログ出力

```typescript
import { logger } from "@hmpact/logger";

// 情報ログ
logger.info("アプリケーションが開始されました");

// 警告ログ
logger.warn("これは警告メッセージです");

// エラーログ
logger.error("エラーが発生しました");

// デバッグログ
logger.debug("これはデバッグメッセージです");
```

### バナー表示

```typescript
import { HmpactBanner } from "@hmpact/logger";

// デフォルトバナー
HmpactBanner();

// カスタムラベルとバージョン付きバナー
HmpactBanner("My App", "1.2.3");
```

## API リファレンス

### `logger.info(message, ...optionalParams)`

情報レベルのログを出力します。

```typescript
logger.info("処理が完了しました");
logger.info("ユーザー情報:", { id: 1, name: "John" });
```

### `logger.warn(message, ...optionalParams)`

警告レベルのログを出力します。

```typescript
logger.warn("非推奨の API を使用しています");
logger.warn("ディスク容量:", "残り 10%");
```

### `logger.error(message, ...optionalParams)`

エラーレベルのログを出力します。

```typescript
logger.error("データベース接続失敗");
logger.error("エラー詳細:", error);
```

### `logger.debug(message, ...optionalParams)`

デバッグレベルのログを出力します。デバッグモードが有効な場合のみ出力されます。

```typescript
logger.debug("変数の値:", myVariable);
logger.debug("実行パス:", __filename);
```

#### デバッグモードの有効化

デバッグログを表示するには、環境変数 `HMPACT_DEBUG` を `"true"` に設定します：

```bash
# Linux/macOS
export HMPACT_DEBUG=true
node app.js

# Windows (PowerShell)
$env:HMPACT_DEBUG = "true"
node app.js

# Windows (CMD)
set HMPACT_DEBUG=true
node app.js
```

### `HmpactBanner(label?, version?)`

カラフルなバナーを表示します。

**パラメータ:**

```typescript
label?: string;    // バナーに表示するラベル（デフォルト: "> Hmpact"）
version?: string;  // バナーの下に表示するバージョン（デフォルト: "0.0.0"）
```

**例:**

```typescript
import { HmpactBanner } from "@hmpact/logger";

// デフォルトバナー
HmpactBanner();
// 出力:
// > Hmpact (グラデーション付き ASCII アート)
// v0.0.0

// カスタマイズバナー
HmpactBanner("My CLI Tool", "2.1.0");
// 出力:
// My CLI Tool (グラデーション付き ASCII アート)
// v2.1.0
```

## 使用例

### CLI アプリケーション

```typescript
import { logger, HmpactBanner } from "@hmpact/logger";

async function main() {
  // バナーを表示
  HmpactBanner("Hmpact CLI", "1.0.0");

  try {
    logger.info("処理を開始します...");

    // 処理...
    await doSomething();

    logger.info("処理が完了しました！");
  } catch (error) {
    logger.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

main();
```

### デバッグ情報の出力

```typescript
import { logger } from "@hmpact/logger";

function processData(data: any) {
  logger.debug("入力データ:", data);

  const result = data.map(item => {
    logger.debug("処理中:", item);
    return transform(item);
  });

  logger.debug("出力データ:", result);
  return result;
}
```

### エラーハンドリング

```typescript
import { logger } from "@hmpact/logger";

async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      logger.warn(`HTTP ${response.status}: ${url}`);
    }
    return response.json();
  } catch (error) {
    logger.error(`データ取得失敗: ${url}`, error);
    throw error;
  }
}
```

## 依存関係

- `chalk` - ターミナルカラー出力
- `figlet` - ASCII アート生成
- `gradient-string` - グラデーションテキスト
- `ora` - ロードインジケータ（オプション）

## ライセンス

MIT
