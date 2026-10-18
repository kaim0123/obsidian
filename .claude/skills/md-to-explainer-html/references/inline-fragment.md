# 41章形式（CSS 埋め込み）で作るとき

41章・42章と同じ見た目にするときの手順。各ページは **本文の断片** だけを書き、`scripts/assemble-inline.mjs` が外枠（41章の埋め込みCSS・topbar・ページ内目次・pager・JS・footer）を付けて `public/<章>/` に書き出す。

- 使えるクラス：`public/41_アーキテクチャ/00-1_アーキテクチャ全体像.html` の最初の `<style>`。共通CSS版とは少し違う（`d-box-purple`・`d-line-accent`・`d-text-accent`・`badge`・`card accent/good/warn/bad/purple`・`stars` などがある。`d-line-bad`・`d-arrowhead-bad` は無い）
- 見本：`public/42_ソフトウェア設計/10-3_関心の分離.html`、`public/41_アーキテクチャ/23-4_CQRS.html`、目次は `public/42_ソフトウェア設計/00-0_目次.html`

## 断片の形式

断片は scratchpad の `fragments/<ファイル名>.html` に置く。

```html
<!--meta
title: 関心の分離 — 何を一緒にし、何を分けるか
short: 関心の分離
crumb: 10 設計の基礎 › 関心の分離
-->
    <div class="hero">
      <span class="eyebrow">10 設計の基礎</span>
      <h1>関心の分離 — 何を一緒にし、何を分けるか</h1>
      <p class="lead">リード文</p>
      <p class="meta">もとにしたノート：04_関心の分離</p>
    </div>

    <!-- ===== 本文ここから ===== -->
    <h2 id="sec-1"><span class="num">1.</span>このページで扱うこと</h2>
    …
    <h2 id="sec-N"><span class="num">N.</span>よくある誤解</h2>
    <details open><summary>誤解1：「…」</summary><div class="body"><p>…</p></div></details>
    <h2 id="sec-M"><span class="num">M.</span>まとめ</h2>
    <!-- ===== 本文ここまで ===== -->

    <h2 id="sources">参考資料</h2>
    <ul class="sources"><li>ノート：…</li><li><a href="https://…">資料名</a>（https://…）</li></ul>
```

- `title` = h1、`short` = ページ送りに出る短い名前、`crumb` = eyebrow と同じ階層 + short（サブフォルダがあれば `20 パラダイム › 22 オブジェクト指向 › 継承と合成`、eyebrow は `20 パラダイム ／ 22 オブジェクト指向`）
- pager・footer・topbar・`<script>` は書かない
- 断片の先頭に `<style>…</style>` を置くと、そのページだけの CSS として `<head>` に入る（目次ページの `.idx-card` など）
- 構成は 41章にならう：「このページで扱うこと」→ 本題 →「よくある誤解」（`details open`）→「まとめ」→「参考資料」。理解度チェックは付けない
- 目次ページは `grid c2` に `<a class="card idx-card">` を並べる（`<span class="badge accent">10-1</span><h4>…</h4><p class="small muted">1行説明</p>`）

## 組み立て

```
node .claude/skills/md-to-explainer-html/scripts/assemble-inline.mjs <fragments フォルダ> <章フォルダ名> <サイト名>
node scripts/apply-explainer-theme.mjs
node .claude/skills/md-to-explainer-html/scripts/check.mjs public/<章>
```

**注意**：組み立ては断片から `public/<章>/` の同名ファイルを丸ごと書き直す。公開後に HTML を直接直した（または別の人が直した）ページがあるときは、組み立て直す前に差分を確認する。公開後の小さな修正は HTML を直接 Edit する方が安全。

## 章まるごと作るとき

ページ数が多いときはサブエージェントに分担する。ガイド（この断片形式・内容のルール・ページ一覧と short・41章のページ一覧）を scratchpad に書き、各エージェントに担当ページと「書いたら組み立て＋check を実行し、自分のページのエラーを直す（pager・目次・未作成ページへのリンク切れは無視）」を渡す。目次ページは全員の報告（1行説明）がそろってから親が書く。
