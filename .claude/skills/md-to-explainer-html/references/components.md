# 解説HTMLの部品

`public/_解説HTML/style.css` で定義されている部品だけを使う。ここに無い見た目が欲しくなったら、まず既存の部品で表せないか考える。どうしても必要なら style.css に足すことをユーザーに相談する（色は `workbench.css` 側のトークンを使う）。

## 囲み（callout）

| クラス | 用途 | 定番のタイトル |
|---|---|---|
| `callout key` | 結論・要点 | ひとことで言うと |
| `callout tip` | 補足・実務のコツ | 開発者としての方針、覚え方 |
| `callout warn` | 注意・よくある誤解 | よくある誤解、〜は勧めない |
| `callout bad` | 危険・やってはいけない | 〜してはいけない |

```html
<div class="callout warn">
  <p class="callout-title">よくある誤解</p>
  <p>本文</p>
</div>
```

## 手順（番号付きの流れ）

```html
<ol class="steps">
  <li>ログインに成功すると、サーバーがトークンを作る</li>
  <li>ブラウザはこれを保存し、次回から送る</li>
</ol>
```

## 表

横にはみ出さないよう必ず `table-wrap` で包む。

```html
<div class="table-wrap"><table>
  <thead><tr><th>方式</th><th>長所</th><th>短所</th></tr></thead>
  <tbody>
    <tr><td><strong>セッション</strong></td><td>…</td><td>…</td></tr>
  </tbody>
</table></div>
```

## カード（並べて比較）

`grid c2`（2列）/ `grid c3`（3列）。スマホでは1列になる。

```html
<div class="grid c2">
  <div class="card">
    <h4>長所</h4>
    <ul><li>…</li></ul>
  </div>
  <div class="card">
    <h4>短所</h4>
    <ul><li>…</li></ul>
  </div>
</div>
```

## コード（危険な例／安全な例）

ラベルは `code-label` に `bad` / `good` を付ける。ラベルなしの `<pre><code>` も可。

```html
<span class="code-label bad">✕ 危険な例：入力をそのまま埋め込む</span>
<pre><code>element.innerHTML = userInput;</code></pre>
<span class="code-label good">◯ 安全な例：テキストとして入れる</span>
<pre><code>element.textContent = userInput;</code></pre>
```

`<` `>` `&` は `&lt;` `&gt;` `&amp;` にする。

## 理解度チェック

```html
<details>
  <summary>Q1. 問題文</summary>
  <div class="body"><p>答え。理由まで書く。</p></div>
</details>
```

## 図（インラインSVG）

- `viewBox="0 0 720 H"`（幅 720 固定、高さは内容に合わせる）。`width`/`height` 属性は付けない
- 色は書かない。`d-*` クラスだけで塗る（テーマで色が変わるため）
- marker の id はページ内で一意に：`arw<章の下1桁+ページ番号><a,b,c…>`（例：74章 30-2 → `arw302a`）
- `role="img"` と、図の内容を文章で説明した `aria-label` を付ける。下に `figcaption`（「図：」で始める）

| クラス | 用途 |
|---|---|
| `d-box` | 普通の箱 |
| `d-box-accent` | 主役（サーバーなど） |
| `d-box-good` / `d-box-bad` / `d-box-warn` | 成功・安全 / 失敗・攻撃 / 注意 |
| `d-text` / `d-text-bold` / `d-text-sub` | 文字（普通 / 見出し / 補足の小さい文字） |
| `d-line` / `d-line-dash` / `d-line-bad` | 線（普通 / 点線・ライフライン / 攻撃の流れ） |
| `d-arrowhead` / `d-arrowhead-bad` | marker 内の矢じり |

```html
<figure>
<svg viewBox="0 0 720 200" role="img" aria-label="ブラウザがサーバーにリクエストを送り、サーバーが Set-Cookie で番号を返す">
  <defs>
    <marker id="arw101a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="d-arrowhead"/></marker>
  </defs>
  <rect x="20" y="60" width="180" height="80" rx="8" class="d-box"/>
  <text x="110" y="96" text-anchor="middle" class="d-text-bold">ブラウザ</text>
  <text x="110" y="118" text-anchor="middle" class="d-text-sub">Cookie を保存</text>

  <rect x="520" y="60" width="180" height="80" rx="8" class="d-box-accent"/>
  <text x="610" y="106" text-anchor="middle" class="d-text-bold">サーバー</text>

  <path d="M200,85 L520,85" class="d-line" marker-end="url(#arw101a)"/>
  <text x="360" y="75" text-anchor="middle" class="d-text">① リクエスト</text>
  <path d="M520,120 L200,120" class="d-line" marker-end="url(#arw101a)"/>
  <text x="360" y="145" text-anchor="middle" class="d-text">② Set-Cookie: sid=abc123</text>
</svg>
<figcaption>図：サーバーは番号だけを渡し、ブラウザは次から自動で送り返す</figcaption>
</figure>
```

図を描いたら、ブラウザで文字が箱からはみ出していないか必ず見る（日本語は 1 文字 ≒ 14px で見積もる）。

## その他

- 強調は `<strong>`、コード・ヘッダー名・属性名は `<code>`
- 外部 URL は参考資料に文字で書く（本文中にリンクを散らさない）
- 同じ章・他の章のページへのリンクは本文中に `<a>` で張ってよい
