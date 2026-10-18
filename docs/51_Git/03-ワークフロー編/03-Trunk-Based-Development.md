# Trunk Based Development

## 概要

Trunk Based Development（TBD）は、すべての開発者が1つのメインブランチ（trunk）で作業する開発手法です。シンプルで、継続的インテグレーションに最適化されています。

## Trunk Based Developmentの原則

1. **単一のメインブランチ**: すべての開発がメインブランチで行われる
2. **短命なブランチ**: ブランチは数時間から1日程度でマージ
3. **頻繁なマージ**: 1日に複数回マージ
4. **継続的インテグレーション**: すべての変更が即座に統合される

## TBDのブランチ戦略

### メインブランチ（trunk）

- **役割**: すべての開発の統合ポイント
- **特徴**: 常にデプロイ可能な状態
- **保護**: 直接コミットまたは短命なブランチからマージ

### 短命なブランチ

- **役割**: 小さな機能や修正の開発
- **寿命**: 数時間から1日
- **命名**: 機能や修正を表す名前

### リリースブランチ（オプション）

- **役割**: 特定のリリースの準備
- **使用**: リリースサイクルが長い場合のみ
- **特徴**: メインブランチから分岐し、リリース後に削除

## 基本的なワークフロー

### 1. 小さなブランチの作成

```bash
# メインブランチを最新の状態に更新
git checkout main
git pull origin main

# 小さなブランチを作成
git checkout -b add-login-button
```

### 2. 迅速な開発とコミット

```bash
# 小さな変更を実装
# ... コードを編集 ...

# コミット
git add .
git commit -m "Add login button"

# すぐにプッシュ
git push -u origin add-login-button
```

### 3. 迅速なマージ

```bash
# プルリクエストを作成（GitHub上）
# または、直接マージ（チームのポリシーによる）

# マージ後、メインブランチを更新
git checkout main
git pull origin main
git branch -d add-login-button
```

## 機能フラグの使用

### 機能フラグとは

機能フラグは、コード内で機能の有効/無効を切り替える仕組みです。TBDでは、未完成の機能をメインブランチにマージし、フラグで制御します。

### 実装例

```javascript
// feature-flags.js
export const FEATURES = {
  NEW_DASHBOARD: process.env.NEW_DASHBOARD === 'true',
  DARK_MODE: process.env.DARK_MODE === 'true',
};

// dashboard.js
import { FEATURES } from './feature-flags';

if (FEATURES.NEW_DASHBOARD) {
  // 新しいダッシュボードを表示
} else {
  // 既存のダッシュボードを表示
}
```

### 機能フラグの管理

```bash
# 環境変数で制御
export NEW_DASHBOARD=true
npm start

# または、設定ファイルで管理
# config/features.json
{
  "newDashboard": true,
  "darkMode": false
}
```

## 継続的インテグレーション

### CIの設定

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run linter
        run: npm run lint
      - name: Build
        run: npm run build
```

### テストの重要性

TBDでは、すべての変更が即座にメインブランチにマージされるため、包括的なテストが重要です：

1. **ユニットテスト**: 個々のコンポーネントのテスト
2. **統合テスト**: コンポーネント間の連携テスト
3. **E2Eテスト**: エンドツーエンドのテスト

## 実践例

### 例1: 小さな機能の追加

```bash
# 1. ブランチを作成
git checkout main
git pull origin main
git checkout -b add-search-icon

# 2. 実装（1-2時間）
# ... 検索アイコンを追加 ...
git add .
git commit -m "Add search icon"
git push -u origin add-search-icon

# 3. 即座にマージ
# プルリクエストを作成してマージ（または直接マージ）

# 4. メインブランチを更新
git checkout main
git pull origin main
git branch -d add-search-icon
```

### 例2: バグ修正

```bash
# 1. ブランチを作成
git checkout main
git pull origin main
git checkout -b fix-button-styling

# 2. 修正（30分-1時間）
# ... ボタンのスタイルを修正 ...
git add .
git commit -m "Fix button styling"
git push -u origin fix-button-styling

# 3. 即座にマージ
```

### 例3: 大きな機能の段階的実装

```bash
# 機能フラグを使用して段階的に実装

# ステップ1: 基本的な構造
git checkout -b feature/new-dashboard-part1
# ... 基本的な構造を実装 ...
git commit -m "Add basic dashboard structure"
git push -u origin feature/new-dashboard-part1
# マージ（機能フラグで無効）

# ステップ2: データ取得
git checkout -b feature/new-dashboard-part2
# ... データ取得を実装 ...
git commit -m "Add data fetching"
git push -u origin feature/new-dashboard-part2
# マージ（機能フラグで無効）

# ステップ3: UI実装
git checkout -b feature/new-dashboard-part3
# ... UIを実装 ...
git commit -m "Add dashboard UI"
git push -u origin feature/new-dashboard-part3
# マージ（機能フラグで無効）

# ステップ4: 機能フラグを有効化
git checkout -b feature/enable-new-dashboard
# ... 機能フラグを有効化 ...
git commit -m "Enable new dashboard feature"
git push -u origin feature/enable-new-dashboard
# マージ
```

## TBDの利点

1. **シンプル**: ブランチ戦略がシンプル
2. **迅速なフィードバック**: 変更が即座に統合される
3. **マージコンフリクトの減少**: 頻繁にマージするためコンフリクトが少ない
4. **継続的デプロイ**: 自動デプロイに最適

## TBDの欠点

1. **規律が必要**: すべての開発者が規律を守る必要がある
2. **テストの重要性**: 包括的なテストが必要
3. **機能フラグの管理**: 機能フラグの管理が複雑になる可能性
4. **大きな変更**: 大きな変更の実装が困難

## ベストプラクティス

1. **小さな変更**: 1つのブランチは1つの小さな変更に集中
2. **頻繁なマージ**: 1日に複数回マージ
3. **包括的なテスト**: すべての変更をテスト
4. **機能フラグ**: 未完成の機能は機能フラグで制御
5. **コードレビュー**: 可能な限りコードレビューを実施

## 次のステップ

Trunk Based Developmentを理解したら、トラブルシューティング編に進みましょう。

→ [よくある問題と解決方法](01-よくある問題と解決方法.md)

