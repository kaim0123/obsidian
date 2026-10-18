# フォーマットとLint — 自動整形・レビュー観点

## はじめに

コードの **見た目** を人間が1つずつ整えていたら、時間がいくらあっても足りません。また、**人によってスタイルが違う** と、レビューで「ここインデントずれてる」「カッコの位置が…」といった **本質でない議論** が発生します。

この問題を解決するのが **フォーマッター** と **Linter** です。

---

## フォーマッターとLinterの違い

### フォーマッター（Formatter）

**見た目（コードのスタイル）** を自動で整える。

- インデント
- セミコロン
- カッコの位置
- 改行の入れ方

**書き方の統一** に使う。設定をいじらず「いつでもこの通り」にするのが基本。

### Linter（リンター）

**コードの品質・バグの予兆** をチェックする。

- 使っていない変数
- 潜在的なバグ（undefined参照など）
- アンチパターン
- プロジェクト独自のルール違反

**品質を保つガードレール** として使う。

### 両者の棲み分け

| | Formatter | Linter |
|---|---|---|
| 目的 | 見た目を揃える | バグを防ぐ |
| 自動修正 | フル自動 | 一部自動 |
| 例 | Prettier, Black, gofmt | ESLint, Ruff, golangci-lint |

**両方を併用する** のが現代の標準です。

---

## 代表的なツール

### JavaScript / TypeScript

| 用途 | ツール |
|------|-------|
| Formatter | Prettier, Biome |
| Linter | ESLint, Biome |

### Python

| 用途 | ツール |
|------|-------|
| Formatter | Black, Ruff Format |
| Linter | Ruff, Flake8, pylint |
| 型チェック | mypy, pyright |

### Go

| 用途 | ツール |
|------|-------|
| Formatter | gofmt（組み込み） |
| Linter | golangci-lint |

### Rust

| 用途 | ツール |
|------|-------|
| Formatter | rustfmt |
| Linter | clippy |

### CSS / HTML

| 用途 | ツール |
|------|-------|
| Formatter | Prettier |
| Linter | Stylelint |

---

## なぜ自動化するのか

### 1. レビューの質が上がる

**見た目の指摘が消える** ので、レビューは **ロジック・設計** に集中できる。

### 2. 人間の脳のリソースを節約

「インデント合ってるかな…」と考えなくてよい。書くことに集中できる。

### 3. 一貫性が常に保たれる

誰が書いても同じスタイル。新メンバーも迷わない。

### 4. バグが減る

Linterが **未使用変数・タイポ・危険なパターン** を事前に弾く。

---

## 導入の基本セット

### 1. 設定ファイルを置く

プロジェクトのルートに設定ファイルを置く。

```
.prettierrc.json     # Prettier の設定
.eslintrc.json       # ESLint の設定
.editorconfig        # エディタ共通の設定
```

### 2. 保存時に自動実行

エディタ（VSCode など）に拡張機能を入れて、**保存時に自動整形** するように設定。

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 3. pre-commit フックで強制

`husky` + `lint-staged` でコミット前にチェック。ルールに合わないコードがコミットできないようにする。

### 4. CIで強制

GitHub Actions などで **PR時に検査**。合格しないとマージできない。

---

## よくある設定項目

### Prettier の基本設定

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**細かい議論より「決める」ことが大事**。Airbnb / Google / Standard などの **既存ルールセット** を採用するのが早い。

### ESLint の基本設定

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

---

## EditorConfig

エディタ横断で **最低限のルール** を揃える方法。

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

これがあれば、**VSCode, IntelliJ, Vim など** どのエディタでも同じ挙動になります。

---

## 人間のレビューで見るべきポイント

フォーマッター/Linterが見てくれるのは **スタイル・予兆** まで。以下は人間が見る必要があります。

### 1. ロジックが正しいか
### 2. エッジケースの考慮
### 3. 命名の適切さ
### 4. 設計的な妥当性
### 5. セキュリティ
### 6. パフォーマンス
### 7. テストの網羅性

ツールで自動化できることは徹底的に自動化し、**人間は人間にしかできないことに集中** するのが理想です。

---

## 導入時のコツ

### 既存プロジェクトへの導入

**一括整形すると diff が爆発** してレビューできなくなる。次の手順で：

1. **新規コードから適用**
2. 既存部分は **1つのPRで一括整形**（別名で区切る）
3. **コミット単位で整形とロジック変更を分ける**

### ルールの決め方

- **細かい宗教戦争（タブ vs スペース）** に時間をかけない
- **既存の有名プリセット** を採用する（Airbnb, Standard, Googleなど）
- **ドキュメントに理由を記録** する

### 例外の扱い

```javascript
// eslint-disable-next-line no-console
console.log('デバッグ用');

// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];
```

やむを得ず無視する場合は、**理由をコメントに書く**。

---

## 「議論すべきでない」こと

以下は **ツールに任せるべき** 項目。人間が議論しても生産的ではない。

- インデント（スペース / タブ）
- セミコロンあり / なし
- シングルクォート / ダブルクォート
- 行末のカンマ
- 1行の最大文字数
- `if` の後の改行

**ツールの設定を決めたら終わり**。

---

## まとめ

1. **Formatter = 見た目、Linter = 品質** の二本立て
2. **保存時・コミット時・CIで多層防御**
3. **既存プリセットを採用し、宗教戦争しない**
4. **ツールに任せて、人間はロジックと設計を見る**

---

## 関連ノート

- [[命名規則]]
- [[コメントとドキュメント]]
- [[略語と用語集]]
- [[04_リファクタリングの考え方]]
