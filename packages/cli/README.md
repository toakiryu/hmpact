# hmpact

Hot Matcha Package Act のコマンドラインインターフェイス（CLI）です。プロジェクト管理と自動化ツールを提供します。

## 特徴

- 🚀 高速なプロジェクト初期化
- 📦 パッケージ管理機能
- 🔧 プロジェクト設定の自動化
- 💻 使いやすいコマンドラインインターフェース
- 🎯 開発効率の向上

## インストール

### グローバルインストール

```bash
npm install -g hmpact
# または
pnpm add -g hmpact
```

### ローカルインストール

```bash
pnpm add hmpact
```

## コマンド

### CLI 起動

```bash
hmpact
# または
hmpact-cli
```

デモ実行：

```bash
pnpm demo
```

## コマンドラインオプション

現在のバージョンでは、コマンドラインインターフェースが実装されています。詳細なコマンドについては、実行後のプロンプトを参照してください。

```bash
hmpact --help
```

## 使用例

### CLI の実行

```bash
$ hmpact
```

## 実装の詳細

CLI は `@hmpact/core` パッケージを使用して実装されており、以下の機能を提供します：

- プロジェクト設定の管理
- ビルド情報の生成
- ユーザー設定の取得
- その他の開発ツール機能

## パッケージ構成

```
hmpact/
├── bin/
│   └── hmpact.mjs          # CLI エントリポイント
└── package.json
```

## 依存関係

- `@hmpact/core` - コア機能

## スクリプト

| スクリプト       | 説明                            |
| ---------------- | ------------------------------- |
| `pnpm demo`      | CLI を実行                      |
| `pnpm test`      | テストを実行（未実装）          |
| `pnpm typecheck` | TypeScript の型チェック         |
| `pnpm lint`      | ESLint でコードを検査           |
| `pnpm format`    | Prettier でコードをフォーマット |

## 開発

### セットアップ

```bash
pnpm install
```

### ビルド

```bash
pnpm build
```

### テスト実行

```bash
pnpm demo
```

## トラブルシューティング

### コマンドが見つからない場合

グローバルインストールを再度実行してください：

```bash
npm install -g hmpact
```

### アクセス許可エラー

Linux/macOS でアクセス許可エラーが発生した場合：

```bash
sudo npm install -g hmpact
```

## ライセンス

MIT

## サポート

問題や機能リクエストは [GitHub Issues](https://github.com/toakiryu/hmpact/issues) で報告してください。
