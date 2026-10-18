# GitHub Copilotの設定と使い方

GitHub Copilotは、Visual Studio Code、JetBrains IDE、Neovimなどで使用できるAIコード補完ツールです。この章では、GitHub Copilotの効果的な設定方法と使い方について解説します。

## 📖 GitHub Copilotとは

GitHub Copilotは、OpenAIのCodexモデルをベースにしたAIコード補完ツールです。コードの文脈を理解し、適切なコード補完を提案します。

**主な特徴**:
- リアルタイムのコード補完
- 複数の言語に対応
- コメントからコードを生成
- Copilot Chatによる対話形式のコード生成

## 1. 基本設定

### VS Codeでの設定

1. **GitHub Copilot拡張機能をインストール**
2. **GitHubアカウントでログイン**
3. **設定を調整**

### 推奨設定

```json
{
  // Copilotの設定
  "github.copilot.enable": {
    "*": true,
    "yaml": false,  // 特定の言語を無効化
    "plaintext": false
  },
  
  // 補完の表示設定
  "github.copilot.editor.enableAutoCompletions": true,
  "github.copilot.editor.enableCodeActions": true,
  
  // 提案の設定
  "github.copilot.suggestions": {
    "enabled": true,
    "maxCompletions": 10
  },
  
  // プライバシー設定
  "github.copilot.advanced": {
    "secretKey": ""  // 必要に応じて設定
  },
  
  // 補完の表示方法
  "github.copilot.editor.enableAutoCompletions": true,
  "github.copilot.editor.enableCodeActions": true,
  
  // 補完の受け入れ方法
  "editor.inlineSuggest.enabled": true,
  "editor.suggest.preview": true
}
```

### 設定項目の説明

#### Copilotの有効化

- `github.copilot.enable`: 言語ごとにCopilotを有効/無効化

#### 補完の表示設定

- `github.copilot.editor.enableAutoCompletions`: 自動補完を有効化
- `github.copilot.editor.enableCodeActions`: コードアクションを有効化

#### 提案の設定

- `github.copilot.suggestions.enabled`: 提案を有効化
- `github.copilot.suggestions.maxCompletions`: 最大提案数

## 2. 効果的なコメントの書き方

GitHub Copilotは、コメントやコードの文脈から補完を提案します。効果的なコメントを書くことで、より適切なコード補完を得られます。

### ❌ 悪い例: 曖昧なコメント

```javascript
// ユーザーを取得
async function getUserById(id) {
  // ...
}
```

### ✅ 良い例: 具体的なコメント

```javascript
// データベースからユーザーIDでユーザーを取得し、存在しない場合は404エラーを返す
// SQLインジェクション対策としてプリペアドステートメントを使用
async function getUserById(id) {
  // ...
}
```

### ✅ 良い例: 関数の説明を含める

```javascript
/**
 * 注文の合計金額を計算する
 * @param {Array} items - 注文アイテムの配列（各アイテムは {price: number, quantity: number} の形式）
 * @param {number} discountPercent - 割引率（0-100）
 * @returns {number} 合計金額（割引適用後）
 */
function calculateOrderTotal(items, discountPercent) {
  // Copilotが適切な実装を提案
}
```

### ✅ 良い例: セキュリティ要件を含める

```javascript
// ユーザー認証機能を実装
// 要件:
// - JWTトークンを使用
// - パスワードはbcryptでハッシュ化（ラウンド数: 10）
// - SQLインジェクション対策: プリペアドステートメントを使用
// - エラーハンドリングを含める
async function authenticateUser(email, password) {
  // ...
}
```

### ✅ 良い例: MVCパターンを明示

```javascript
// ユーザーコントローラー: ユーザー関連のHTTPリクエストを処理
// MVCパターンに従い、ビジネスロジックはモデル層に委譲
// エラーハンドリングとバリデーションを含める
class UserController {
  // ...
}
```

## 3. Copilot Chatの使い方

GitHub Copilot Chatを使用すると、対話形式でコードを生成できます。

### 良いプロンプト例

```
「Express.jsでRESTful APIのエンドポイントを作成してください。
GET /api/users/:id でユーザー情報を取得し、
エラーハンドリングとバリデーションを含めてください。
MVCパターンに従い、セキュリティベストプラクティスを適用してください。」
```

```
「このコードをリファクタリングして、DRY原則に従ってください。
重複しているバリデーションロジックを共通化してください。」
```

```
「この関数の単体テストをJestで書いてください。
正常系と異常系の両方をテストしてください。」
```

```
「このコードのセキュリティ脆弱性をチェックしてください。
特にSQLインジェクション、XSS、CSRF対策を確認してください。」
```

## 4. よくあるミスを防ぐコメント

### MVC違反を防ぐ

```javascript
// ユーザーモデル: データとビジネスロジックを担当
// HTMLやCSSなどのプレゼンテーション要素を含めない
class User {
  // ...
}
```

### セキュリティ対策を含める

```javascript
// ユーザー認証: セキュリティベストプラクティスに従う
// - SQLインジェクション対策: プリペアドステートメント
// - XSS対策: エスケープ処理
// - パスワード: bcryptでハッシュ化
async function login(email, password) {
  // ...
}
```

### エラーハンドリングを含める

```javascript
// 注文を作成: エラーハンドリングを含める
// - try-catchブロックで非同期処理を囲む
// - 適切なHTTPステータスコードを返す
// - エラーログを記録
async function createOrder(orderData) {
  // ...
}
```

## 5. コード補完の受け入れ方

### Tabキーで受け入れる

提案されたコードを `Tab` キーで受け入れます。

### 複数の提案を確認

複数の提案がある場合は、`Ctrl + →` で次の提案を確認できます。

### 提案を拒否

提案を拒否する場合は、`Esc` キーを押します。

## 6. セキュリティ設定

### 機密情報の保護

1. **環境変数の使用**: 機密情報は環境変数に保存
2. **`.gitignore`の設定**: 機密情報を含むファイルを除外
3. **コードレビュー**: 生成されたコードに機密情報が含まれていないか確認

### プライバシー設定

```json
{
  "github.copilot.advanced": {
    "secretKey": "[設定したキー]"
  }
}
```

## 7. ベストプラクティス

### 1. 具体的なコメントを書く

曖昧なコメントではなく、具体的で詳細なコメントを書きます。

### 2. 要件を明示する

コメントに要件を明示することで、より適切なコード補完を得られます。

### 3. アーキテクチャパターンを指定

MVCパターンなどのアーキテクチャパターンを指定することで、適切なコード構造を生成できます。

### 4. セキュリティ要件を含める

セキュリティ要件をコメントに含めることで、セキュリティ対策を含んだコードを生成できます。

### 5. エラーハンドリングを指定

エラーハンドリングの要件をコメントに含めることで、適切なエラーハンドリングを含んだコードを生成できます。

## ✅ GitHub Copilot設定チェックリスト

GitHub Copilotを使用する前に、以下の点を確認しましょう：

- [ ] 拡張機能がインストールされているか
- [ ] GitHubアカウントでログインしているか
- [ ] 設定が適切か
- [ ] 効果的なコメントの書き方を理解しているか
- [ ] Copilot Chatの使い方を理解しているか
- [ ] セキュリティ設定が適切か

## 🎯 まとめ

GitHub Copilotを効果的に使用するためには、以下の点が重要です：

1. **適切な設定**: 基本設定を適切に行う
2. **効果的なコメント**: 具体的で詳細なコメントを書く
3. **要件の明示**: コメントに要件を明示する
4. **アーキテクチャパターンの指定**: MVCパターンなどを指定
5. **セキュリティ要件の含める**: セキュリティ要件をコメントに含める

適切に設定し、効果的に使用することで、開発効率を大幅に向上させることができます。

## 📖 関連資料

- [プロンプトエンジニアリングの基本](10_プロンプトエンジニアリングの基本.md)
- [Cursorの設定と使い方](11_Cursorの設定と使い方.md)
- [MVC / MVVM（UI分離のまとめ）](../../../02_Foundations/03_設計/04_アーキテクチャ/02構造パターン/02_MVC_UI分離のまとめ.md)
- [セキュリティ対策の不足](04_セキュリティ対策の不足.md)


