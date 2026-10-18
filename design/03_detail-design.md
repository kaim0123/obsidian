# 03 詳細設計書 — knowledge-app

| 項目 | 内容 |
|---|---|
| 文書バージョン | 0.2（UI を A ワークベンチ案・ダークモードのみに決定） |
| 作成日 | 2026-10-18 |
| 前の文書 | [02_basic-design.md](02_basic-design.md) |
| 対象 | Phase 1（MVP）を中心に、Phase 2 以降は概要のみ |

---

## 0. 実データの調査結果（設計の前提）

2026-10-18 時点で `docs/` を調べた結果。詳細設計はこれに合わせている。

| 観点 | 結果 | 設計への影響 |
|---|---|---|
| ノート数 | `.md` 2,346件 / フォルダ544個 | 全件静的生成で問題ない規模 |
| ファイル名の特殊文字 | `?` `%` `#` 空白を含むものが116件（例：`シェア95%を取ったIEが….md`、`…（かもしれない）【チューリング4】 35.md`） | URL では置き換えが必要（§3.2） |
| 同名ファイル | 拡張子を除いた名前の重複が14組（`00_目次`、`01-basics` など） | ウィキリンク解決に優先順位が必要（§4.2） |
| ウィキリンク | 約13,900か所。うちパス付き `[[a/b]]` 約540、見出し付き `[[a#h]]` 約50、埋め込み `![[...]]` 0件 | |
| 未解決リンク | リンク先の種類4,204のうち約2,660がノートとして存在しない | 未作成表示（F-13）が必須 |
| 表の中のリンク | `[[名前\|表示]]` のように `\|` でエスケープされた書き方がある | `\|` を区切りとして扱う |
| Callout | 約800か所。**`> [!tip]-`（折りたたみ）が387件で最多**。種類は tip / abstract / note / warning / info / important / danger / example / summary / caution | 折りたたみ対応は Phase 1 で必要 |
| frontmatter | 先頭行が `---` のものと、本文中の水平線 `---` が混在。項目は title / tags / created / description / source / published / author が多い。tags は YAML 配列形式が中心 | スキーマは全項目任意 |
| h1 | 約500件は `# ` 見出しが無い | タイトルはファイル名にフォールバック |
| Mermaid / 数式 | 213ファイル / 14ファイル | Phase 2 / Phase 4 |
| 画像ファイル | Vault 内に無い（`![](YouTube URL)` のみ） | 画像の扱いは不要 |
| 除外すべきもの | `docs/.claude/`、`docs/92_基本情報技術者試験/.claude/`、`docs/_解説HTML/` | glob パターンで除外 |

---

## 1. 設定ファイル

### 1.1 `package.json` に追加する依存

| パッケージ | 用途 | Phase |
|---|---|---|
| `unist-util-visit`、`github-slugger` | プラグイン実装（Astro に同梱だが、直接 import するので明示的に追加） | 1 |
| `@types/mdast` | プラグインの型 | 1（dev） |
| `mermaid` | 図の描画（`theme: 'dark'` で初期化） | 2 |
| `pagefind` | 全文検索 | 3（dev） |
| `remark-math`、`rehype-katex`、`katex` | 数式 | 4 |

### 1.2 `astro.config.mjs`

```js
// @ts-check
import { defineConfig } from 'astro/config';
import remarkWikilink from './src/plugins/remark-wikilink.ts';
import remarkCallout from './src/plugins/remark-callout.ts';

export default defineConfig({
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'math'] },
    shikiConfig: { theme: 'github-dark-default' },   // ダークモードのみ（N-07）
    remarkPlugins: [remarkWikilink, remarkCallout],
  },
});
```

- `remarkWikilink` はノート索引を必要とする。索引は `src/lib/notes.ts` が `docs/` を**ファイルシステムから直接**走査して作る（§2.3）。プラグインの実行時点では `getCollection()` が使えないため。

### 1.3 `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const optionalDate = z.coerce.date().optional().catch(undefined);
const optionalText = z.coerce.string().optional().catch(undefined);

const notes = defineCollection({
  loader: glob({
    base: './docs',
    pattern: ['**/*.md', '!**/.*/**', '!_*/**'],
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.md$/i, ''),
  }),
  schema: z.looseObject({
    title: optionalText,
    description: optionalText,
    source: optionalText,
    author: z.union([z.string(), z.array(z.string())]).optional().catch(undefined),
    tags: z
      .union([z.string(), z.array(z.coerce.string())])
      .nullish()
      .transform((v) => (v == null ? [] : Array.isArray(v) ? v : v.split(/[,\s]+/).filter(Boolean)))
      .catch([]),
    created: optionalDate,
    published: optionalDate,
    updated: optionalDate,
  }),
});

export const collections = { notes };
```

- `generateId` を指定して、**元のパスをそのまま id にする**（既定の slug 化だと大文字小文字や記号が変わり、ウィキリンクと一致しなくなる）。
- `.catch()` で、型が合わない項目があってもビルドを止めない（N-03）。

---

## 2. `src/lib/notes.ts`（ノート索引）

### 2.1 型

```ts
export interface NoteRef {
  id: string;        // '10_基礎概念/01_変数とスコープ'
  name: string;      // '01_変数とスコープ'（ファイル名、拡張子なし）
  folder: string;    // '10_基礎概念'（ルート直下なら ''）
  url: string;       // '/notes/10_基礎概念/01_変数とスコープ/'
}

export interface FolderNode {
  path: string;              // '11_コンピューターサイエンス/10_歴史・人物'
  name: string;              // '10_歴史・人物'
  label: string;             // '歴史・人物'（先頭の番号を除いた表示名）
  url: string;
  folders: FolderNode[];     // 名前順
  notes: NoteRef[];          // 名前順
}

export interface NoteIndex {
  byId: Map<string, NoteRef>;
  byName: Map<string, NoteRef[]>;   // key: name.toLowerCase()
  byPath: Map<string, NoteRef>;     // key: id.toLowerCase()
  root: FolderNode;
}
```

### 2.2 公開する関数

| 関数 | 説明 |
|---|---|
| `getNoteIndex(): NoteIndex` | 索引を返す。初回だけ作り、モジュール変数にキャッシュ |
| `resolveWikilink(target: string, fromId: string): NoteRef \| null` | §4.2 の規則でリンク先を決める |
| `idToUrl(id: string): string` | §3.2 の規則で URL を作る |
| `folderOf(id: string): string` | 親フォルダのパス |
| `breadcrumb(id: string): { label: string; url: string }[]` | パンくず用 |
| `compareName(a: string, b: string): number` | 並び順。`localeCompare(b, 'ja', { numeric: true })` で `2_` < `10_` にする |

### 2.3 索引の作り方
1. `fs.readdirSync` で `docs/` を再帰的に走査する（§1.3 と同じ除外規則）。
2. `.md` ごとに `NoteRef` を作り、`byId` `byName` `byPath` に登録する。
3. 親フォルダをたどって `FolderNode` の木を作る。
4. dev サーバーでは、ファイルの追加・削除に追随するため、`docs/` の更新時刻が変わったら作り直す（`fs.statSync` を見るだけの軽い判定）。

> glob loader と同じ除外パターンを使い、**1か所（`notes.ts` の定数）で定義して両方から参照する**。

---

## 3. ルーティング

### 3.1 ページファイル

| ファイル | 生成するページ |
|---|---|
| `src/pages/index.astro` | `/` |
| `src/pages/notes/[...path].astro` | 全ノート（2,346）＋全フォルダ（544）＋ `/notes/`（ルート） |
| `src/pages/404.astro` | 404 |

`[...path].astro` の `getStaticPaths()`：

```ts
export async function getStaticPaths() {
  const notes = await getCollection('notes');
  const index = getNoteIndex();
  const notePaths = notes.map((entry) => ({
    params: { path: urlPathOf(entry.id) },
    props: { kind: 'note' as const, entry },
  }));
  const folderPaths = allFolders(index.root).map((folder) => ({
    params: { path: urlPathOf(folder.path) || undefined },
    props: { kind: 'folder' as const, folder },
  }));
  return [...notePaths, ...folderPaths];
}
```

- ノートとフォルダの URL が同じになる場合（`foo.md` と `foo/` が両方ある）：**フォルダ側を優先**し、ノートは `foo/` ページの上部に本文として表示する（Obsidian の「フォルダノート」と同じ扱い）。ビルド時に該当件数をログに出す。

### 3.2 URL 変換（`idToUrl`）

各パス要素に対して次の置き換えを行う。

| 文字 | 置き換え | 理由 |
|---|---|---|
| `?` `#` `%` | 削除 | URL の区切り文字・エスケープ文字と衝突する |
| 空白（半角・全角） | `-` | |
| `\` | `/` | Windows のパス区切り |
| その他（日本語・括弧・`【】` など） | そのまま | N-08 |

- 置き換えの結果、別々のノートが同じ URL になった場合は、2件目以降の末尾に `-2`、`-3` を付けて重複を避け、警告をログに出す。
- 生成した `NoteRef.url` は末尾 `/` 付き（`build.format: 'directory'` に合わせる）。

---

## 4. remark プラグイン

### 4.1 `remark-wikilink.ts`

**入力**：mdast の `text` ノード（コード・インラインコード内は対象外。mdast では別ノードなので自然に除外される）
**正規表現**：

```ts
const WIKILINK = /(!?)\[\[([^\[\]]+?)\]\]/g;
// グループ2 を分解：  target[#heading][|alias]   ※ '\|' も '|' として扱う
```

**処理**：
1. `file.history[0]`（ファイルの絶対パス）から、`docs/` からの相対 id を得て `fromId` とする。
2. `text` ノードを、マッチ位置で `text` / `link` / `html` ノードに分割する。
3. リンク先ごとに：
   | 状況 | 出力 |
   |---|---|
   | target が空で heading あり（`[[#見出し]]`） | `<a href="#slug">見出し</a>` |
   | 解決できた | `<a class="wikilink" href="{url}#{slug}">{alias ?? target}</a>` |
   | 解決できない | `<span class="wikilink wikilink-unresolved" title="未作成のノート">{alias ?? target}</span>` |
   | `!` 付き（埋め込み） | 解決できたものと同じリンクとして出力（Phase 1） |
4. 見出しの slug は `github-slugger` の `slug()` で作る（Astro が見出しに付ける id と同じ規則）。
5. 未解決の件数をファイルごとに集計し、ビルド終了時に合計をログに出す（`astro:build:done` フックを持つ小さなインテグレーションで出力）。
6. 右パネルの「リンク先」（F-21）とステータスバーの「リンク数」用に、解決結果を `file.data.astro.frontmatter.outLinks` に入れる。ページ側では `render(entry)` が返す `remarkPluginFrontmatter.outLinks` で受け取る。
   ```ts
   type OutLink = { label: string; url: string | null }; // url が null なら未作成
   ```

### 4.2 リンク先の解決規則（`resolveWikilink`）

Obsidian の「最短パス」設定に近い挙動にする。

```text
入力: target（例: '06_シードデータ' または '24_TypeScript/README'）, fromId
1. target を正規化：前後の空白除去、末尾の '.md' 除去、'\' → '/'、小文字化
2. target に '/' を含む
   a. byPath に完全一致 → それ
   b. id が '/' + target で終わるノートが1件 → それ
3. byName で候補を取得
   a. 0件 → 未解決
   b. 1件 → それ
   c. 複数 → 次の順で1件に絞る
      ① fromId と同じフォルダ
      ② fromId のフォルダとの共通の祖先フォルダが最も深いもの
      ③ id が最も短いもの
      ④ それでも同点なら id の辞書順で先頭
```

### 4.3 `remark-callout.ts`

**対象**：子要素の先頭が `[!type]` で始まる `blockquote` ノード。

```ts
const CALLOUT = /^\[!(\w+)\]([+-]?)[ \t]*(.*)$/;
```

| 入力 | 出力 HTML |
|---|---|
| `> [!tip] タイトル` | `<div class="callout callout-tip"><div class="callout-title">タイトル</div><div class="callout-body">…</div></div>` |
| `> [!tip]- タイトル`（閉じた状態） | `<details class="callout callout-tip"><summary class="callout-title">タイトル</summary><div class="callout-body">…</div></details>` |
| `> [!tip]+ タイトル`（開いた状態） | 上と同じで `<details open>` |
| タイトル省略 | 種類名を表示名にする（下表） |

実装は `blockquote` ノードの `data.hName` / `data.hProperties` を書き換える方式にし、HTML 文字列は組み立てない（本文中の Markdown をそのまま変換させるため）。入れ子の Callout も再帰で同じ処理になる。

**種類と表示名・色**（未知の種類は `note` と同じ見た目）：

| type | 別名 | 表示名 | 色（CSS変数） |
|---|---|---|---|
| note | — | メモ | `--accent` |
| abstract | summary, tldr | 要約 | `--teal` |
| info | — | 情報 | `--accent` |
| tip | hint, important | ヒント | `--good` |
| warning | caution, attention | 注意 | `--warn` |
| danger | error | 危険 | `--bad` |
| example | — | 例 | `--purple` |

---

## 5. 画面の詳細

画面は A ワークベンチ案のモック（https://claude.ai/artifact/HJnxFYfy9QDEu71LJ5RR6F）に合わせる。

### 5.1 S-01 トップ（`index.astro`）
- 「ようこそ」欄：一言の案内文。
- 「解説ページ（HTML）」欄：`public/*/00-0_目次.html` を `fs` で列挙し（`src/lib/explainers.ts`）、フォルダ名と一緒にリンク一覧にする。
- 「すべてのフォルダ」表：列は No（フォルダ名の先頭番号）・分類・フォルダ・ノート数（配下すべて）。表は横スクロールできる枠に入れる。
- 分類は番号の十の位で決める：

| 十の位 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| 分類 | 基礎 | 言語 | フレームワーク | 設計 | ツール | インフラ | セキュリティ | テスト | その他 |

- 「最近開いたノート」欄は Phase 4（F-08）。それまでは表示しない。

### 5.2 S-02 フォルダ
- 見出し：フォルダの表示名
- パンくず
- フォルダノートがあれば（§3.1）その本文
- サブフォルダ一覧 → ノート一覧（どちらも `compareName` 順）。ノートは frontmatter の `description` があれば1行表示

### 5.3 S-03 ノート
```astro
---
const { entry } = Astro.props;
const { Content, headings, remarkPluginFrontmatter } = await render(entry);
const title = entry.data.title ?? headings.find((h) => h.depth === 1)?.text ?? nameOf(entry.id);
const hasH1 = headings.some((h) => h.depth === 1);
const outline = headings.filter((h) => h.depth === 2 || h.depth === 3);
const outLinks = remarkPluginFrontmatter.outLinks ?? [];
---
<BaseLayout title={title} currentId={entry.id}
  status={[positionInFolder(entry.id), `見出し ${outline.length}`, `リンク ${outLinks.length}`]}>
  <PathBar id={entry.id} />
  {!hasH1 && <h1>{title}</h1>}
  <Content />
  <NoteAside slot="aside" outline={outline} outLinks={outLinks} id={entry.id} />
</BaseLayout>
```
- 本文に h1 がある場合はそれを使い、二重に出さない。
- `PathBar`：`docs / 10_基礎概念 / 05_シード（乱数シードとDBシード）.md` の形で表示する。フォルダ部分はフォルダページへのリンク（JetBrains Mono、12px）。
- `NoteAside`：
  - アウトライン：h2 は左寄せ、h3 は 14px 字下げ。リンク先は `#slug`。
  - リンク先：`outLinks` を重複を除いて表示。未作成のものは `.wikilink-unresolved` の見た目。
  - プロパティ：path（フォルダ）と tags。tags が空なら「—」。
- `positionInFolder(id)`：`10_基礎概念 › 5 / 6` のような文字列を返す（`notes.ts` に追加）。
- `NoteMeta`（tags・created・source の詳しい表示）は Phase 2。

### 5.4 `BaseLayout.astro`
- `<html lang="ja" style="color-scheme: dark">`、`<meta name="viewport">`、`<title>{title}｜Knowledge</title>`
- props：`title`、`currentId?`（ツリーで開いておく場所）、`status: string[]`（ステータスバーに出す項目）
- 構造：`Header` → 3列（`FolderTree` / `<main><slot /></main>` / `<slot name="aside" />`）→ `StatusBar`
  - 3列は `display:flex; flex-wrap:wrap`。本文は `flex: 999 1 560px; min-width: 0`、ツリーは `flex: 1 1 240px; max-width: 280px`、右パネルは `flex: 1 1 220px; max-width: 260px`。スマホ幅では自然に縦に並ぶ。
- `FolderTree`：`index.root` を再帰で表示。各フォルダは `<details>`、`currentId` の祖先だけ `open`。現在のノートは背景 `#2a3240`・文字白。2,346件を全部 HTML に出すと重いので、**開いているフォルダの中身と、トップレベルのフォルダ名だけ**を出力する。
- `Header` の検索欄：Phase 1 は `<input type="search" disabled>` ではなく通常の入力欄だが、送信しても何もしない（Phase 3 で `CommandPalette` に置き換え）。
- Google Fonts（IBM Plex Sans JP 400/500/700、JetBrains Mono 400/600）を `<link>` で読み込む。

---

## 6. スタイル（`src/styles/global.css`）

- **ダークモードのみ**。色は CSS 変数で `:root` に1セットだけ定義する（メディアクエリや切替は作らない）。トークン名は解説HTMLと同じ名前を使う（値は A 案のダーク配色）。

```css
:root {
  color-scheme: dark;
  --bg: #14161b;        /* 本文の背景 */
  --surface: #1b1e25;   /* ヘッダー・表の見出し・カード */
  --surface-2: #181b21; /* ツリー・タブ列 */
  --border: #2b2f39;
  --border-soft: #262a33; /* 表の行区切り */
  --text: #e4e6eb;
  --text-2: #a3a9b5;
  --text-3: #8d94a1;
  --text-4: #6f7684;    /* 件数・補足 */
  --accent: #7cb7ec;    /* リンク */
  --accent-hover: #a8d0f5;
  --selected: #2a3240;  /* ツリーの現在地 */
  --status-bg: #2a5b86;
  --status-text: #e8f1fa;
  --code-bg: #0f1115;
  --good: #7fd3a2;  --good-soft: #1a2620;  --good-border: #2c4a3a;
  --warn: #e8a34a;  --warn-soft: #2a2216;
  --bad: #ef8a8a;   --bad-soft: #2c1c1e;
  --purple: #c9a0f0; --purple-soft: #241d30;
  --font: "IBM Plex Sans JP", "Yu Gothic UI", "Meiryo", sans-serif;
  --mono: "JetBrains Mono", "Consolas", monospace;
}
```

- 本文：14px・行間 1.8・最大幅 `72ch`。h1 28px、h2 20px（下線 `--border`）、h3 16px。
- 表：横スクロールの枠（`overflow-x:auto`、枠線 `--border`、角丸 6px）に入れる。見出し行は `--surface`。
- コードブロック：Shiki の `github-dark-default` テーマ。背景は `--code-bg` で上書きし、枠線 `--border`。
- Callout：種類ごとに `-soft` の背景と `--*` の文字色・枠線。`<details>` 型は `summary` をクリック可能に（カーソル pointer）。
- `.wikilink-unresolved`：文字色 `--text-4`、点線の下線、カーソルは `help`。
- 色のコントラスト：本文 `--text` / 補足 `--text-2` は背景に対して 4.5:1 以上。`--text-4` は件数などの補助表示にだけ使う。

---

## 7. エラー処理とログ

| 状況 | 動作 |
|---|---|
| frontmatter の YAML が壊れている | glob loader がエラーを出す。**その場合は該当ファイル名を確認し、要件 N-06 の例外としてノート側を直す**（件数が多ければ、frontmatter を自前で読む loader に切り替える。§9） |
| frontmatter の型が合わない | `.catch()` で既定値。警告なし |
| 未解決のウィキリンク | 未作成表示。ビルド終了時に「未解決リンク N 件」を表示 |
| URL の衝突 | 末尾に連番を付けて警告 |
| プラグイン内の予期しない例外 | そのノートのプラグイン処理をスキップし、ファイル名つきで警告 |

---

## 8. テスト・確認

| No | 確認内容 | 方法 |
|---|---|---|
| T-01 | `npm run dev` でトップが表示される | ブラウザで `http://localhost:4321/` |
| T-02 | `npm run build` がエラー0で終わり、生成ページ数がノート数＋フォルダ数＋α と一致 | ビルドログ |
| T-03 | 特殊文字を含むノート（`シェア95%を取ったIEが…`、`…【チューリング4】 35`）が開ける | ブラウザ |
| T-04 | 同名ノート（`00_目次`）へのリンクが、同じフォルダのものに飛ぶ | ブラウザ |
| T-05 | `[[名前\|表示]]`（表の中）と `[[名前#見出し]]` が正しく動く | ブラウザ |
| T-06 | `> [!tip]-` が閉じた状態の折りたたみで表示される | ブラウザ |
| T-07 | 解説HTML（`/41_アーキテクチャ/00-0_目次.html`）が表示され、CSS・JS が効いている | ブラウザ |
| T-08 | `resolveWikilink` と `idToUrl` の単体テスト | Vitest（Phase 2 で導入） |
| T-09 | 深い階層のノートで、ツリーの祖先フォルダが開き現在地が強調される。右パネルのアウトライン・リンク先、ステータスバーの値が正しい | ブラウザ |

---

## 9. 実装の順番（Phase 1）

1. `src/content.config.ts` と最小の `src/pages/notes/[...path].astro` を作り、**プラグイン無しで**全ノートが表示されるところまで（ここで `npm run dev` で見られるようになる）
2. `src/lib/notes.ts`（索引・URL変換）→ 共通レイアウト（ヘッダー・ツリー・ステータスバー）・フォルダページ・トップページ・パス表示
3. `remark-wikilink.ts` → 右パネル（アウトライン・リンク先）
4. `remark-callout.ts`
5. `global.css`（§6 のダーク配色）
6. T-01〜T-09 の確認

## 10. 未決事項（詳細設計レベル）

| No | 内容 | 仮の決定 |
|---|---|---|
| D-1 | 壊れた frontmatter が多数あった場合の対応 | 手順1の時点で件数を確認してから決める |
| D-2 | フォルダノート（同名の `.md` とフォルダ）がどれだけあるか | 手順2でログを見て確認 |
| D-3 | `>` 付きの Callout 内に Mermaid がある場合 | Phase 2 で確認 |
