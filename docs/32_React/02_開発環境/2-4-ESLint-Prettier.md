# 2-4. ESLint / Prettier（最低限）

## 🎯 この章で学ぶこと

- ESLint と Prettier の役割の違い
- 何が嬉しいのか（バグ予防 / 整形）
- VS Code に組み込んで「保存時に自動整形」する設定

---

## 📖 概念の説明

### ESLint（イーエスリント）

**コードに潜むバグや非推奨パターンを警告するツール**。

例えば：

- 「`useState`をimportし忘れてるよ」
- 「未使用の変数があるよ」
- 「`useEffect`の依存配列が抜けてるよ」

→ 見つけてくれると、本番に出る前に直せる。

### Prettier（プリティア）

**コードのスタイル（インデント、改行、クォートなど）を自動で揃えるツール**。

例えば：

```jsx
// 整形前
const x={a:1,b:2,c:3 };

// 整形後
const x = { a: 1, b: 2, c: 3 };
```

### ESLint vs Prettier の役割分担

| | 役割 | 例 |
| --- | --- | --- |
| **ESLint** | コードの**正しさ** | 未使用変数、依存配列もれ |
| **Prettier** | コードの**見た目** | スペース、改行、引用符 |

両方使うのが標準。**ESLintはバグ予防、Prettierは美化**と覚えてください。

---

## 💻 セットアップ

### Vite作成時にすでに入っている

`npm create vite@latest` で作ると、ESLintは最初から入っています。

```bash
npm run lint
```

を実行すると、コード全体をチェックできます。

### Prettierを追加する

```bash
npm install -D prettier
```

プロジェクトのルートに **`.prettierrc.json`** を作る：

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

各設定の意味：

- `semi: true` → セミコロン付ける
- `singleQuote: true` → シングルクォート優先
- `trailingComma: "all"` → 末尾カンマ
- `printWidth: 100` → 1行100文字で改行
- `tabWidth: 2` → スペース2つ分

### ESLintとPrettierの衝突を防ぐ

両方使うときは「整形の責任はPrettierに任せる」設定が必要：

```bash
npm install -D eslint-config-prettier
```

`.eslintrc`（または `eslint.config.js`）に `'prettier'` を追加。

---

## 💻 VS Code との連携（推奨）

### 拡張機能をインストール

VS Code の拡張機能タブで以下を検索 → インストール：

- **ESLint**（dbaeumer.vscode-eslint）
- **Prettier - Code formatter**（esbenp.prettier-vscode）

### 保存時に自動整形する設定

プロジェクトのルートに `.vscode/settings.json` を作る：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

これで：

- ファイルを保存 → Prettierが整形
- 同時にESLintが直せるルールを自動修正

書きながら**スタイルを気にしなくていい**ので、ロジックに集中できます。

---

## 💻 コマンドラインで実行

### ESLintで全ファイルをチェック

```bash
npm run lint
```

問題があれば一覧表示。

### ESLintで自動修正

```bash
npx eslint . --fix
```

### Prettierで全ファイルを整形

```bash
npx prettier --write .
```

### CIで「整形されてるか」だけチェック（書き換えない）

```bash
npx prettier --check .
```

---

## ❌ よくある間違い

### ESLintとPrettierでルールが衝突する

→ `eslint-config-prettier` を必ず入れる。これがないと、両方が「セミコロンつけろ／消せ」と争う。

### Prettierルールを細かく揃えようとする

→ Prettierの哲学は「議論を減らすため、選択肢を最小化」。**設定はほどほど**にする。

### Prettierを使わずにESLintで全部やろうとする

→ できなくはないが、Prettierの方が整形は速くて綺麗。**役割分担**が正解。

### lintを無視してコミットを重ねる

→ あとで一気に直すと地獄。**保存時に自動整形**を最初に設定する。

---

## ✅ ベストプラクティス

1. **保存時に自動整形**を最初に設定する（VS Code）
2. ESLintは**バグ予防**、Prettierは**美化**と分けて理解
3. **`.prettierrc`はチーム共通**、Gitにコミットする
4. **`eslint-config-prettier`**で衝突を防ぐ
5. **CI（GitHub Actionsなど）でチェック**する習慣（チーム開発）

---

## 🔬 実践演習

1. 既存のViteプロジェクトに Prettier をインストール
2. `.prettierrc.json` を作る
3. VS Code で保存時自動整形を有効化
4. わざとインデントを崩したファイルを保存 → 自動で揃うことを確認

---

## 📝 まとめ

- ESLint = バグ予防、Prettier = 見た目の整形
- VS Code拡張 + 保存時整形が最も快適
- 衝突防止に `eslint-config-prettier` を入れる
- `.prettierrc` をチームで共有

---

## 🔗 関連ページ

- [[2-2-ViteでReactアプリ作成]]
- [[2-5-デバッグ]]
- [[14-3-ログ設計]]
