> **Zenn スクラップ用:** **この引用ブロックはコピーしないでください。** 直下の区切り線の**次行**（`# よく使うブラウザAPI実践ガイド…`）から、**`## 🔗 参考・あわせて読む` 内の最後のリンク行**までを選択してスクラップに貼り付けてください。`## Obsidian 用` 以降は含めません。

---

# よく使うブラウザAPI実践ガイド（fetch / Storage / Form中心）

## 📖 このノートで学ぶこと

- 現場でよく使うブラウザAPIの「いつ使うか」
- 最低限覚えるべき書き方（コピペして試せる形）
- `fetch`・`localStorage`・`sessionStorage`・フォーム送信の実践パターン
- あわせて押さえたい重要API（`URLSearchParams` など）

---

## 🗺️ 先に全体像（何をいつ使う？）

| API | どんな時に使う？ | ひとこと |
|---|---|---|
| `fetch` | サーバーからデータ取得/送信 | 非同期処理の中心 |
| `localStorage` | 設定値や下書きを端末に保持 | タブを閉じても残る |
| `sessionStorage` | タブ内だけの一時状態を保持 | タブを閉じると消える |
| `FormData` + `fetch` | フォーム入力を送信（ファイル含む） | API送信と相性が良い |
| `URLSearchParams` | クエリ文字列の読み書き | 検索条件の同期に便利 |
| `AbortController` | 古い通信を中断 | 検索入力の連打対策 |
| `addEventListener` | UI操作の起点を作る | ほぼ全画面で使う |

---

## 1) `fetch`（データ取得・送信）

### いつ使う？

- 一覧データを表示する（例: TODOリスト、商品一覧）
- フォーム送信結果をAPIに保存する
- ボタン押下で再読み込みや更新を行う

### 基本（GET）

```javascript
async function loadUsers() {
  try {
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }
    const users = await response.json();
    console.log(users);
  } catch (error) {
    console.error("ユーザー取得に失敗:", error);
  }
}
```

### 基本（POST: JSON送信）

```javascript
async function createUser(name) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("ユーザー作成に失敗");
  }

  return response.json();
}
```

### 実務メモ

- `response.ok` チェックを省かない（4xx/5xx対策）
- 通信失敗用の `try...catch` を必ず置く
- 連打されるUIでは `AbortController` で古い通信を中断する

---

## 2) `localStorage`（永続保存）

### いつ使う？

- テーマ（ライト/ダーク）設定を保持したい
- 入力途中の下書きを残したい
- 「前回開いたタブ」など軽いUI状態を覚えたい

### 基本

```javascript
const KEY = "theme";

function saveTheme(theme) {
  localStorage.setItem(KEY, theme); // 文字列で保存
}

function loadTheme() {
  return localStorage.getItem(KEY) ?? "light";
}
```

### オブジェクト保存（JSON化）

```javascript
const DRAFT_KEY = "profileDraft";

function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}
```

### 実務メモ

- `localStorage` は**文字列のみ**保存できる
- 機密情報（アクセストークン等）を安易に保存しない
- 保存容量は大きくないため、巨大データには不向き

---

## 3) `sessionStorage`（タブ単位の一時保存）

### いつ使う？

- タブをまたがない一時入力値を保持したい
- 画面遷移で「戻る」時だけ状態を復元したい
- 複数タブで状態を分離したい

### 基本

```javascript
const FILTER_KEY = "searchFilter";

function saveFilter(filter) {
  sessionStorage.setItem(FILTER_KEY, JSON.stringify(filter));
}

function loadFilter() {
  const raw = sessionStorage.getItem(FILTER_KEY);
  return raw ? JSON.parse(raw) : { keyword: "", sort: "new" };
}
```

### `localStorage` との使い分け

- 再起動後も残したい -> `localStorage`
- タブを閉じたら消えてよい -> `sessionStorage`

---

## 4) フォーム（`FormData` + バリデーション + `fetch`）

### いつ使う？

- 登録/ログイン/問い合わせなどの送信
- ファイルアップロードを含む送信
- ページ遷移せず非同期で保存したい

### 実践パターン

```html
<form id="profileForm">
  <input name="displayName" required />
  <input name="avatar" type="file" />
  <button type="submit">保存</button>
</form>
```

```javascript
const form = document.querySelector("#profileForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // ブラウザ標準の再読み込み送信を止める

  if (!form.reportValidity()) return; // HTMLのrequired等を使った検証

  const formData = new FormData(form);

  try {
    const response = await fetch("/api/profile", {
      method: "POST",
      body: formData, // multipart/form-data で送信される
    });

    if (!response.ok) throw new Error("保存に失敗");
    alert("保存しました");
  } catch (error) {
    console.error(error);
    alert("通信エラーが発生しました");
  }
});
```

### 実務メモ

- `FormData` を使う時は通常 `Content-Type` を手動指定しない
- 送信中はボタンを無効化して二重送信を防ぐ
- クライアント検証 + サーバー検証の両方が必要

---

## 5) 重要API（追加で覚えると強い）

### `URL` / `URLSearchParams`

検索条件をURLに反映すると「再読み込みしても同じ状態」にしやすいです。

```javascript
const url = new URL(location.href);
url.searchParams.set("keyword", "cursor");
history.replaceState({}, "", url);
```

### `AbortController`

検索入力のたびにAPIを叩くUIで、古い通信を中断できます。

```javascript
let controller;

async function search(keyword) {
  controller?.abort();
  controller = new AbortController();

  const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`, {
    signal: controller.signal,
  });
  return response.json();
}
```

### `addEventListener`

クリックや入力を処理する基本です。DOM操作はここから始まることが多いです。

```javascript
document.querySelector("#saveBtn").addEventListener("click", () => {
  console.log("保存ボタンが押されました");
});
```

---

## ⚠️ よくあるハマりどころ

- `fetch` でエラーが出ないのに失敗している -> `response.ok` 未確認
- `localStorage` にオブジェクトをそのまま保存 -> `"[object Object]"` になる
- フォーム送信でページがリロード -> `event.preventDefault()` 忘れ
- API通信で `CORS` エラー -> サーバー側設定が必要な場合がある

---

## 🧪 学習用ミニ課題

1. フォーム入力を `localStorage` に下書き保存し、再読込で復元する
2. 検索フォームの値を `URLSearchParams` に同期する
3. 一覧取得を `fetch` で実装し、失敗時のメッセージ表示を作る
4. 入力中検索で `AbortController` による中断を入れる

---

## 🔗 参考・あわせて読む

- [MDN - Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)
- [MDN - Web Storage API](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API)
- [MDN - FormData](https://developer.mozilla.org/ja/docs/Web/API/FormData)
- [MDN - URLSearchParams](https://developer.mozilla.org/ja/docs/Web/API/URLSearchParams)
- [MDN - AbortController](https://developer.mozilla.org/ja/docs/Web/API/AbortController)
- [MDN - Constraint Validation API](https://developer.mozilla.org/ja/docs/Web/API/Constraint_validation)

---

## Obsidian 用（Zenn スクラップには貼らない）

ボールト内の関連ノート：

- [[17-browser-apis|ブラウザAPI入門（初心者向け）]]
- [[18-browser-developer-knowledge|プログラミングに役立つブラウザの知識（入門）]]
