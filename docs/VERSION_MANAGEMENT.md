# バージョン管理ガイド

hmpactはモノレポ構成を採用しており、Next.jsと同様の**統一バージョン管理**を実装しています。

## 基本方針

- **すべてのパッケージは同じバージョン番号を持つ**
- リリースはhmpact全体で1つ（パッケージごとではない）
- バージョンが不一致の場合、CIでエラーとなりリリースが拒否される

## バージョンの確認

すべてのパッケージのバージョンが統一されているか確認：

```bash
pnpm check:versions
```

成功時の出力例：
```
📦 3個のパッケージを検出しました

   hmpact: 0.0.3-beta.15
   @hmpact/logger: 0.0.3-beta.15
   @hmpact/translationpack: 0.0.3-beta.15

✅ すべてのパッケージのバージョンが統一されています: 0.0.3-beta.15
```

## バージョンの更新

### 一括更新（推奨）

すべてのパッケージのバージョンを一度に更新：

```bash
# 通常リリース
pnpm sync:versions 1.0.0

# プレリリース
pnpm sync:versions 1.0.0-beta.1
```

### 手動更新

各パッケージの `package.json` を手動で編集することもできますが、**すべてのパッケージで同じバージョンにする必要があります**。

更新後は必ず確認：
```bash
pnpm check:versions
```

## リリースフロー

### 1. バージョンを更新

```bash
# 例: 0.0.4-beta.1 にバージョンアップ
pnpm sync:versions 0.0.4-beta.1
```

### 2. バージョンの統一性を確認

```bash
pnpm check:versions
```

### 3. 変更をコミット

```bash
git add .
git commit -m "chore: bump version to 0.0.4-beta.1"
```

### 4. タグを作成してプッシュ

```bash
git tag v0.0.4-beta.1
git push origin main
git push origin v0.0.4-beta.1
```

タグをプッシュすると、GitHub Actionsが自動的にリリースプロセスを開始します。

## プレリリース管理

バージョン形式: `X.Y.Z-<tag>.<number>`

### 公開タグの決定ルール

- `1.0.0` → `latest` タグで公開
- `1.0.0-beta.1` → `beta` タグで公開
- `1.0.0-rc.1` → `rc` タグで公開
- `1.0.0-alpha.2` → `alpha` タグで公開

これにより、ユーザーは安定版とプレリリース版を使い分けられます：

```bash
# 安定版（latest）
npm install hmpact

# ベータ版
npm install hmpact@beta

# 特定バージョン
npm install hmpact@1.0.0-beta.1
```

## CI/CDでの自動チェック

### Pull Request時

package.jsonが変更されたPRでは、自動的にバージョン統一性がチェックされます。
不一致がある場合、CIが失敗します。

### リリース時

タグをプッシュすると、以下の流れで処理されます：

1. **バージョン統一性チェック** - 不一致があればエラーで停止
2. **バージョン情報の抽出** - 統一バージョン、プレリリース情報を取得
3. **ビルド＆パブリッシュ** - すべてのパッケージを同じバージョンで公開

## トラブルシューティング

### バージョン不一致エラー

```
❌ パッケージ間でバージョンが一致していません！

検出されたバージョン:
   hmpact: 0.0.3-beta.15 (packages/core/package.json)
   @hmpact/logger: 0.0.3-beta.14 (packages/logger/package.json)
```

**解決方法：**
```bash
# すべてのパッケージを統一バージョンに更新
pnpm sync:versions 0.0.3-beta.15

# または手動で各package.jsonを編集
```

### リリースが作成されない

以下を確認してください：

1. タグ形式が `vX.Y.Z` になっているか（例: `v1.0.0`）
2. すべてのパッケージのバージョンが統一されているか
3. 前回のバージョンから変更があるか

## 参考

このバージョン管理方式は以下のプロジェクトと同様のアプローチです：

- [Next.js](https://github.com/vercel/next.js) - `next` と `eslint-config-next` が同期
- [Turborepo](https://github.com/vercel/turbo) - モノレポ内のパッケージが統一バージョン
- [Nx](https://github.com/nrwl/nx) - コアパッケージが同一バージョン

統一バージョン管理により、依存関係の互換性が保証され、ユーザーの混乱を防ぎます。
