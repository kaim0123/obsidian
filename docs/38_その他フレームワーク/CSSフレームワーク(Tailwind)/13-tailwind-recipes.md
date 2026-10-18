# 13. Tailwind 実務レシピ集（UIパターン）

実務でよく出るUIを「まずはこれで成立する」形（素体）からまとめます。  
細部のデザインはプロダクトごとに違うので、ここでは **壊れにくい骨組み** を優先します。

---

## 目次

- [13.1 カード（だいたいこれ）](#131-カードだいたいこれ)
- [13.2 ボタン（だいたいこれ）](#132-ボタンだいたいこれ)
- [13.3 モーダル（だいたいこれ）](#133-モーダルだいたいこれ)
- [13.4 ドロップダウン（だいたいこれ）](#134-ドロップダウンだいたいこれ)
- [13.5 トースト/通知（だいたいこれ）](#135-トースト通知だいたいこれ)
- [13.6 タブ（だいたいこれ）](#136-タブだいたいこれ)
- [13.7 アコーディオン（だいたいこれ）](#137-アコーディオンだいたいこれ)
- [13.8 ツールチップ（だいたいこれ）](#138-ツールチップだいたいこれ)
- [13.9 ナビゲーション（ヘッダ/サイドバー）](#139-ナビゲーションヘッダサイドバー)
- [13.10 フォーム（入力/エラー/ヘルプ）](#1310-フォーム入力エラーヘルプ)
- [13.11 テーブル（一覧）](#1311-テーブル一覧)

---

## 13.1 カード（だいたいこれ）

### 外枠（素体）

- **基本**: `rounded-*` + `border` + `shadow-*` + `bg-white` + `p-*`
- **よくある追加**: `hover:shadow-*`（一覧のカード感）/ `transition`（自然な反応）

```html
<article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
  <header class="mb-2 flex items-start justify-between gap-3">
    <h3 class="text-base font-semibold text-slate-900">タイトル</h3>
    <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">ラベル</span>
  </header>

  <p class="text-sm text-slate-600">
    本文。テキストは長くなるので、まずは読みやすさ（サイズ/色/行間）を揃える。
  </p>

  <footer class="mt-4 flex items-center justify-end gap-2">
    <button class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
      キャンセル
    </button>
    <button class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
      確定
    </button>
  </footer>
</article>
```

### 一覧（カードグリッド）の素体

```html
<section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <!-- card ... -->
</section>
```

---

## 13.2 ボタン（だいたいこれ）

```html
<button
  class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
>
  送信
</button>
```

---

## 13.3 モーダル（だいたいこれ）

- **構成**: 背景オーバーレイ + ダイアログ本体
- **素体**: 中央寄せ / 最大幅 / スクロール / クリック遮断

```html
<!-- overlay -->
<div class="fixed inset-0 z-50 bg-black/40"></div>

<!-- dialog wrapper -->
<div class="fixed inset-0 z-50 grid place-items-center p-4">
  <div class="w-full max-w-lg rounded-xl bg-white p-4 shadow-lg">
    <div class="flex items-start justify-between gap-3">
      <h2 class="text-base font-semibold text-slate-900">モーダルタイトル</h2>
      <button class="rounded-md p-2 text-slate-500 hover:bg-slate-100">×</button>
    </div>

    <div class="mt-3 max-h-[70vh] overflow-auto text-sm text-slate-700">
      本文（長い場合はここだけスクロール）
    </div>

    <div class="mt-4 flex justify-end gap-2">
      <button class="rounded-lg px-3 py-2 text-sm hover:bg-slate-50">閉じる</button>
      <button class="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">保存</button>
    </div>
  </div>
</div>
```

---

## 13.4 ドロップダウン（だいたいこれ）

```html
<div class="relative inline-block">
  <button class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50">
    メニュー
  </button>

  <div class="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
    <a class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50" href="#">項目1</a>
    <a class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50" href="#">項目2</a>
    <button class="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">項目3</button>
  </div>
</div>
```

---

## 13.5 トースト/通知（だいたいこれ）

```html
<div class="fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] space-y-2">
  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
    <div class="text-sm font-medium text-slate-900">保存しました</div>
    <div class="mt-1 text-sm text-slate-600">設定が更新されました。</div>
  </div>
</div>
```

---

## 13.6 タブ（だいたいこれ）

```html
<div class="border-b border-slate-200">
  <nav class="-mb-px flex gap-6">
    <button class="border-b-2 border-slate-900 px-1 py-3 text-sm font-medium text-slate-900">タブ1</button>
    <button class="border-b-2 border-transparent px-1 py-3 text-sm font-medium text-slate-600 hover:text-slate-900">タブ2</button>
  </nav>
</div>
```

---

## 13.7 アコーディオン（だいたいこれ）

```html
<div class="rounded-xl border border-slate-200 bg-white">
  <button class="flex w-full items-center justify-between gap-3 p-4 text-left">
    <span class="text-sm font-medium text-slate-900">見出し</span>
    <span class="text-slate-500">▾</span>
  </button>
  <div class="px-4 pb-4 text-sm text-slate-600">
    中身
  </div>
</div>
```

---

## 13.8 ツールチップ（だいたいこれ）

```html
<span class="relative inline-flex">
  <button class="rounded-md px-2 py-1 text-sm hover:bg-slate-100">?</button>
  <span class="absolute left-1/2 top-full mt-2 w-max -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg">
    ヒント
  </span>
</span>
```

---

## 13.9 ナビゲーション（ヘッダ/サイドバー）

- **ヘッダ**: `sticky top-0` + `backdrop-blur` + `border-b`
- **サイドバー**: `hidden md:block` + `w-64` + `overflow-auto`

---

## 13.10 フォーム（入力/エラー/ヘルプ）

- **入力**: `border` + `rounded` + `px/py` + `focus:ring`
- **エラー**: `border-red-*` + `text-red-*`
- **ヘルプ**: `text-xs text-slate-500`

---

## 13.11 テーブル（一覧）

- **一覧の素体**: `overflow-auto` + `min-w-full` + `divide-y` + `text-sm`

---

**Tailwindの目次に戻る**: [[010Programming/05_Languages/Tailwind/目次|Tailwind目次]]
