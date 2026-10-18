> **Zenn スクラップ用:** **この引用ブロックはコピーしないでください。** 直下の区切り線の**次行**（`# ブラウザAPI入門…`）から、**`## 🔗 参考・あわせて読む` 内の最後のリンク行**までを選択してスクラップに貼り付けてください。`## Obsidian 用` 以降は含めません。

---

# ブラウザAPI入門（初心者向け）

## 📖 このノートで学ぶこと

- ブラウザAPIとは何か、JavaScriptとの関係
- 代表的なAPIの種類と「いつ使うか」
- **よく使うAPI**の早見（実務・学習で通りやすいもの）
- 非同期（Promise / async）とのつながりのイメージ
- 学び方・調べ方のコツ

前提として、[DOM](https://developer.mozilla.org/ja/docs/Web/API/Document_Object_Model) を使って HTML を JavaScript から触った経験があるとスムーズです。

---

## 🌐 ブラウザAPIとは？

**ブラウザが用意している、Webページ用の「便利な機能の入り口」**です。JavaScript から呼び出して使います。

- **JavaScript（言語）** … 変数、関数、if 文など、プログラムの書き方そのもの
- **DOM** … ページの構造（要素の取得・変更など）
- **ブラウザAPI** … ストレージ、通信、位置情報、履歴など、**ブラウザが提供する追加機能**

同じ JavaScript で書きますが、「言語そのもの」と「ブラウザが足してくれた道具」は別物だと考えると整理しやすいです。

---

## 🧰 なぜ API と呼ぶ？

**API（Application Programming Interface）**は、ざっくり言うと **「こう呼び出せば、こういうことができる」という約束された窓口** です。

例：

- `localStorage.setItem("key", "value")` を呼ぶ → ブラウザ内に文字列を保存する
- `fetch("https://example.com/data.json")` を呼ぶ → ネットワーク越しにデータを取りに行く

名前や引数の形はブラウザ（と仕様）が決めています。だから「覚える・調べる」対象が増えますが、一度パターンを掴むと応用しやすくなります。

---

## 📚 初心者がまず知っておくとよい API（カテゴリ別）

### 1. ストレージ・状態

| 名前 | ざっくりした役割 |
|------|------------------|
| **Web Storage**（`localStorage` / `sessionStorage`） | 文字列をブラウザに保存（タブ単位や永続の違いあり） |
| **Cookie** | サーバー連携や有効期限付きの小さなデータ（HTTP と深く関係） |

※ 機密情報をそのまま保存するのは避け、用途に応じた設計が必要です。

### 2. ネットワーク

| 名前 | ざっくりした役割 |
|------|------------------|
| **Fetch API** | URL からデータを取得したり送ったりする（いま主流） |
| **XMLHttpRequest** | 古い方式。新規コードでは `fetch` が多い |

取得したデータは JSON にしたり、HTML やテキストとして受け取ったりします。

### 3. タイマー・スケジュール

| 名前 | ざっくりした役割 |
|------|------------------|
| `setTimeout` / `setInterval` | 指定時間後や繰り返しで処理を動かす |

厳密には「ブラウザ環境のタイマー」として DOM と並んでよく使います。

### 4. URL・履歴・画面遷移

| 名前 | ざっくりした役割 |
|------|------------------|
| **History API** | `history.pushState` などで URL を変えつつページを切り替える（SPA で重要） |
| **Location** | 今の URL の情報を読む・遷移する |

### 5. 位置・端末・メディア

| 名前 | ざっくりした役割 |
|------|------------------|
| **Geolocation API** | ユーザーの許可を得て位置情報を取得 |
| **MediaDevices** | カメラ・マイクへのアクセス（要 HTTPS など条件あり） |

権限ダイアログが出るものが多く、**ユーザー同意**が前提です。

### 6. 非同期・バックグラウンド

| 名前 | ざっくりした役割 |
|------|------------------|
| **Web Workers** | メインの JavaScript と別スレッドで重い処理を回す |
| **Service Worker** | オフラインや通知など（発展的なトピック） |

---

## ⭐ よく使うブラウザAPI（実務・学習で出やすい目安）

案件によって頻度は変わりますが、**フロントエンドのコードを書くと一度は通る**ことが多いものをまとめました。詳細は MDN の各 API ページで確認してください。

| 分野 | 代表（入り口） | よくある用途 |
|------|----------------|--------------|
| **通信** | [`fetch`](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API) | REST / JSON の取得・送信、`GET` 以外は `method` や `body` を指定 |
| **ストレージ** | [`localStorage`](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage) / [`sessionStorage`](https://developer.mozilla.org/ja/docs/Web/API/Window/sessionStorage) | 設定・下書き・タブ単位の一時データ（文字列前提） |
| **DOM・イベント** | [`querySelector`](https://developer.mozilla.org/ja/docs/Web/API/Document/querySelector)、[`addEventListener`](https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener)、[`classList`](https://developer.mozilla.org/ja/docs/Web/API/Element/classList) | 要素の取得、クリック等のイベント、表示の切り替え |
| **URL** | [`URL`](https://developer.mozilla.org/ja/docs/Web/API/URL)、[`URLSearchParams`](https://developer.mozilla.org/ja/docs/Web/API/URLSearchParams) | クエリの読み書き、ベース URL との結合 |
| **履歴・遷移** | [`history.pushState`](https://developer.mozilla.org/ja/docs/Web/API/History/pushState)、[`location`](https://developer.mozilla.org/ja/docs/Web/API/Location) | SPA で URL を書き換え、別ページへ移動 |
| **タイマー** | [`setTimeout`](https://developer.mozilla.org/ja/docs/Web/API/setTimeout) / [`setInterval`](https://developer.mozilla.org/ja/docs/Web/API/setInterval) | 遅延実行、定期処理（多用はパフォーマンスに注意） |
| **通信の中断** | [`AbortController`](https://developer.mozilla.org/ja/docs/Web/API/AbortController) | `fetch` のキャンセル、入力に連動した古いリクエストの破棄など |
| **描画タイミング** | [`requestAnimationFrame`](https://developer.mozilla.org/ja/docs/Web/API/window/requestAnimationFrame) | アニメーションやスクロールに合わせた更新（1フレームに1回など） |
| **メディアクエリ** | [`matchMedia`](https://developer.mozilla.org/ja/docs/Web/API/Window/matchMedia) | 「幅が◯px以下か」を JS で判定（リスナーで変化も追える） |
| **可視領域** | [`IntersectionObserver`](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API) | 無限スクロール、画像の遅延読み込み、広告・計測の「見えたか」 |
| **クリップボード** | [`navigator.clipboard`](https://developer.mozilla.org/ja/docs/Web/API/Clipboard_API) | コピー／ペースト（**HTTPS** や権限、フォールバックに注意） |
| **フォーム・ファイル** | [`FormData`](https://developer.mozilla.org/ja/docs/Web/API/FormData)、[`File`](https://developer.mozilla.org/ja/docs/Web/API/File)、[`FileReader`](https://developer.mozilla.org/ja/docs/Web/API/FileReader) | ファイル送信、入力のまとめ、`fetch` の `body` に渡す |
| **JSON** | [`JSON.parse`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) / [`stringify`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) | ※厳密には**言語組み込み**だが、`fetch` とセットでほぼ必須 |
| **通知** | [`Notification`](https://developer.mozilla.org/ja/docs/Web/API/Notification) | デスクトップ通知（ユーザー許可が必要） |
| **タブの状態** | [Page Visibility](https://developer.mozilla.org/ja/docs/Web/API/Page_Visibility_API)（`document.visibilityState`） | バックグラウンド時は動画停止・ポーリング抑制など |

DOM の基本は MDN の [Document](https://developer.mozilla.org/ja/docs/Web/API/Document) や [イベント](https://developer.mozilla.org/ja/docs/Learn_web_development/Core/Scripting/Events) から辿るとよいです。

---

## ⏱️ 「すぐ結果が返らない」APIが多い

`fetch` や `getCurrentPosition` のように、**終わるまで時間がかかる処理**は、昔ながらの「コールバック」や、いま主流の **Promise**（`then` / `async`・`await`）と組み合わせて書きます。

イメージだけ掴む例：

```javascript
// fetch は Promise を返す（詳細は MDN などで）
fetch("/api/hello")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.error("失敗", err);
  });
```

「ブラウザAPIを使う = 非同期と仲良くする」場面が多い、と覚えておくとよいです。

---

## 🔒 セキュリティ・制限のイメージ（超要点）

- **HTTPS** … 位置情報や一部 API は安全な接続上でのみ動くことが多い
- **同一オリジン・CORS** … 別ドメインのデータを `fetch` するとき、サーバー側の設定が必要なことがある（エラーで初めて出会う人が多い）
- **ユーザーの許可** … カメラ・位置・通知などはダイアログで許可が必要

詳細は個別の API 学習時に MDN で追うとよいです。

---

## 🎯 学び方のコツ

1. **目的から逆算** … 「保存したい」「サーバーと通信したい」など、やりたいことから API 名を調べる
2. **MDN Web Docs** … [MDN の Web API](https://developer.mozilla.org/ja/docs/Web/API) が公式に近い参照先として便利
3. **小さなデモ** … コンソールや最小の HTML ファイルで、`fetch` や `localStorage` を1つずつ試す
4. **DOM とセット** … 取得したデータを `document.querySelector` で得た要素に表示すると理解が進みやすい

---

## 📝 自分用チェックリスト（できたら次へ）

- [ ] ブラウザAPIと JavaScript 言語機能の違いを言葉で説明できる
- [ ] `localStorage` で保存・読み出しができる
- [ ] `fetch` で JSON を取り、`console.log` できる（ローカルまたは許可された URL で）
- [ ] エラーが出たとき、MDN の該当 API ページを開いて読む習慣がついた

---

## 🔗 参考・あわせて読む

- [MDN - Web API 一覧](https://developer.mozilla.org/ja/docs/Web/API)
- [Fetch API（MDN）](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)
- [Web Storage API（MDN）](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API)
- [AbortController（MDN）](https://developer.mozilla.org/ja/docs/Web/API/AbortController)
- [Intersection Observer（MDN）](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API)
- [Clipboard API（MDN）](https://developer.mozilla.org/ja/docs/Web/API/Clipboard_API)
- [JavaScript リファレンス（MDN）](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference)

---

## Obsidian 用（Zenn スクラップには貼らない）

ボールト内の関連ノート：

- [[10-dom|第10章：DOM操作]]
- [[19-common-browser-apis-practical|よく使うブラウザAPI実践ガイド（fetch / Storage / Form中心）]]
- [[18-browser-developer-knowledge|プログラミングに役立つブラウザの知識（入門）]]（ストレージの整理）
- [[12-js-ecosystem|第12章：JavaScriptエコシステム]]
