# 安全なWebアプリケーションの作り方（第20章）

SPA やリッチな画面では、HTML を組み立てる処理の多くが **ブラウザ上の JavaScript** に移っています。第20章では、クライアント側の JavaScript で起きやすい次の問題を解説します。

| 問題 | 概要 |
|------|------|
| **DOM Based XSS** | JavaScript が外部の値をそのまま DOM に書き込み、スクリプトが実行される |
| **Webストレージの不適切な使用** | localStorage などに秘密情報を置き、XSS で盗まれる・改ざんされる |
| **postMessage呼び出しの不備** | ウィンドウ間のメッセージで、送信先・送信元を確認しない |
| **オープンリダイレクト** | JavaScript で、外部から指定された URL へ遷移させる |

第5・6章の XSS は、主に **サーバーが返す HTML** にスクリプトが混ざる問題でした。本章は、**サーバーを通らずにブラウザの中だけで完結する** 点がポイントです。サーバー側のログやエスケープでは気づけません。

---

## 📜 DOM Based XSS

### 仕組み

外部から来た値（**ソース**）が、HTML やスクリプトとして解釈される場所（**シンク**）に、そのまま渡されると起きます。

```
ソース（外部から来る値）              シンク（解釈される場所）
location.hash / location.search  ─┐
document.referrer                 ├──▶  innerHTML / document.write / eval / location.href
postMessage の data               │
Web ストレージの値                ─┘
```

```javascript
// ❌ https://example.com/#<img src=x onerror=alert(document.cookie)>
const name = decodeURIComponent(location.hash.slice(1));
document.getElementById('greet').innerHTML = `こんにちは、${name}さん`;
```

- `#` 以降（フラグメント）は **サーバーに送られない** ので、サーバー側では検知も対策もできません。
- 反射型 XSS（[[01_XSS基本編（徳丸本5章）]]）と同じく、攻撃者は罠の URL を踏ませるだけです。

### 原因になる機能

| 原因 | 危険なシンク |
|------|------|
| **HTML タグが有効になる DOM 操作** | `innerHTML`・`outerHTML`・`insertAdjacentHTML`・`document.write()`・`document.writeln()`・jQuery の `$(html)` や `.html()` |
| **文字列をスクリプトとして実行する機能** | `eval()`・`setTimeout(文字列)`・`setInterval(文字列)`・`new Function(文字列)` |
| **URL が未検証** | `location.href`・`a` 要素の `href`・`iframe` の `src`（`javascript:` スキームが動く） |
| **XMLHttpRequest / fetch の URL が未検証** | 取ってきた HTML を画面に入れる処理で、取得先を攻撃者のサーバーに変えられる |

### innerHTML・document.write による XSS

```javascript
// ❌ HTML として解釈される
el.innerHTML = name;
document.write('<p>' + name + '</p>');

// ✅ テキストとして入れる（タグは文字のまま表示される）
el.textContent = name;

// ✅ 要素を作ってから値を入れる
const p = document.createElement('p');
p.textContent = name;
el.appendChild(p);
```

どうしても HTML を入れる必要がある（リッチテキストなど）場合は、**DOMPurify などのサニタイザ** を通します。

```javascript
import DOMPurify from 'dompurify';
el.innerHTML = DOMPurify.sanitize(html);
```

### eval・setTimeout・Function による XSS

```javascript
// ❌ 外部の値がスクリプトとして実行される
setTimeout('showMessage("' + msg + '")', 1000);
eval('var config = ' + location.hash.slice(1));

// ✅ 関数を渡す / JSON.parse を使う
setTimeout(() => showMessage(msg), 1000);
const config = JSON.parse(decodeURIComponent(location.hash.slice(1)));
```

- **文字列形式で外部からの値を渡さない** のが原則です。`eval` は使わずに済む設計にします（[[03_構造化データの読み込みにまつわる問題（徳丸本17章）|Eval インジェクション]] と同じ考え方）。

### javascript スキームによる XSS

```javascript
// ❌ ?url=javascript:alert(document.cookie) で実行される
const url = new URLSearchParams(location.search).get('url');
link.href = url;
location.href = url;
```

```javascript
// ✅ スキームを http / https に限る
function isSafeUrl(value) {
  try {
    const url = new URL(value, location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
if (isSafeUrl(url)) link.href = url;
```

- `JavaScript:`（大文字）や前後の空白・改行で、単純な文字列比較は回避されます。**`new URL()` でパースしてから `protocol` を見る** のが確実です。
- React などのフレームワークは `{name}` の埋め込みを自動でエスケープしますが、`href={url}` の **スキームは確認しません**。`dangerouslySetInnerHTML` も同様に危険です。

### XMLHttpRequest の URL 未検証

```javascript
// ❌ #/page/news のようなパスを想定しているが、#//attacker.example/evil.html でも取得してしまう
const path = location.hash.slice(1);
fetch(path)
  .then((r) => r.text())
  .then((html) => { main.innerHTML = html; });
```

- 攻撃者のサーバーが CORS を許可して悪意ある HTML を返すと、そのまま実行されます。
- 認証ヘッダやトークンを付けて送る処理なら、**トークンを攻撃者に送ってしまう** 問題にもなります。

```javascript
// ✅ 許可したページ名だけを受け付け、URL は自分で組み立てる
const PAGES = ['news', 'about', 'faq'];
const page = location.hash.slice(1);
if (PAGES.includes(page)) {
  fetch(`/pages/${page}.json`).then(/* textContent で描画 */);
}
```

### Trusted Types（追加の防御）

CSP に次の指定を加えると、`innerHTML` などに **ただの文字列を渡すとエラー** になります。危険なシンクの使い忘れをブラウザが止めてくれます（対応ブラウザのみ）。

```
Content-Security-Policy: require-trusted-types-for 'script'
```

CSP 全体は [[09_PKCEとCSPとは]]、他のヘッダは [[10_セキュリティヘッダ全般]]。

---

## 💾 Webストレージの不適切な使用

### Webストレージとは

ブラウザにデータを保存する仕組みで、**localStorage**（ずっと残る）と **sessionStorage**（タブを閉じると消える）があります。

### クッキーと Webストレージの特徴

| 項目 | クッキー | localStorage | sessionStorage |
|------|------|------|------|
| **データの区分け** | ドメイン・パス単位 | オリジン単位 | オリジン + タブ単位 |
| **有効期間** | `Expires`/`Max-Age` まで（無ければブラウザ終了まで） | 消すまでずっと | タブを閉じるまで |
| **サーバーへの送信** | リクエストごとに自動で送られる | 送られない | 送られない |
| **JavaScript からのアクセス** | できる（**HttpOnly** なら不可） | できる | できる |
| **アクセス制御** | `HttpOnly`・`Secure`・`SameSite` で制限できる | 制限する仕組みがない | 制限する仕組みがない |
| **利用者から見えるか** | 見える | 見える | 見える |
| **利用者が変更できるか** | できる | できる | できる |

**ポイント:** Webストレージには `HttpOnly` にあたる仕組みがありません。**同じオリジンで XSS が 1 つでもあれば、全部読まれます**。Cookie の属性は [[02_クッキー出力にまつわる脆弱性（徳丸本11章）]]。

### Webストレージには何を保存してよいか

| 保存してよい | 保存しない |
|------|------|
| 表示設定（テーマ・言語）、入力途中の下書き、画面の状態 | セッション ID、アクセストークン・リフレッシュトークン、個人情報、パスワード |

- 判断基準は **「XSS で盗まれても、利用者が改ざんしても困らないか」** です。
- 利用者が自由に書き換えられるので、**権限や価格などの判断に使わない**。サーバー側で必ず確かめます。
- ログイン状態は、`HttpOnly`・`Secure`・`SameSite` を付けた Cookie で持つのが基本です（[[MOC_セッション管理]]）。

### 不適切な利用例

| 例 | 何が起きるか |
|------|------|
| **秘密情報を保存していた** | XSS で `localStorage.getItem('token')` を読まれ、攻撃者のサーバーに送られる |
| **XSS や postMessage で漏えい** | 他のウィンドウから受けたメッセージに応じて、保存値を返してしまう |
| **XSS や postMessage で改ざん** | 保存値を書き換えられ、次回の表示から攻撃が続く（ずっと残る XSS） |
| **Webストレージを経由した DOM Based XSS** | 保存値を `innerHTML` で描画している。一度書き込まれると、URL を踏まなくても毎回発火する |

```javascript
// ❌ 保存値も「外部から来る値」として扱う
el.innerHTML = localStorage.getItem('nickname');

// ✅
el.textContent = localStorage.getItem('nickname');
```

---

## 📮 postMessage 呼び出しの不備

### postMessage とは

**別のオリジンのウィンドウや iframe と、安全にメッセージをやり取りする** ための仕組みです。同一オリジンポリシー（[[01_受動的攻撃と同一オリジンポリシー（徳丸本2章）]]）で直接触れない相手と、決まった窓口だけで会話できます。

```javascript
// 送信側
otherWindow.postMessage(message, targetOrigin);

// 受信側
window.addEventListener('message', (event) => {
  // event.origin … 送信元のオリジン
  // event.data   … 受け取ったデータ
});
```

| 引数・プロパティ | 意味 |
|------|------|
| `message` | 送るデータ（オブジェクトも送れる） |
| `targetOrigin` | **このオリジンのウィンドウにだけ届ける**。`'*'` は誰でも可 |
| `event.origin` | 受け取ったメッセージの送信元 |

### メッセージ送信先の未確認

```javascript
// ❌ iframe の中身が攻撃者のページに差し替えられていても、トークンが届く
iframe.contentWindow.postMessage({ token }, '*');

// ✅ 届けたい相手のオリジンを指定する
iframe.contentWindow.postMessage({ token }, 'https://widget.example.com');
```

- `window.open` で開いたウィンドウや iframe は、途中で別のサイトに遷移していることがあります。
- 秘密の情報を送るときは、**必ず `targetOrigin` を指定** します。

### メッセージ送信元の未確認

```javascript
// ❌ どのサイトから来たメッセージでも処理してしまう
window.addEventListener('message', (event) => {
  document.getElementById('msg').innerHTML = event.data.html;
  localStorage.setItem('theme', event.data.theme);
});

// ✅ 送信元を完全一致で確かめ、データも検証する
const ALLOWED = 'https://parent.example.com';
window.addEventListener('message', (event) => {
  if (event.origin !== ALLOWED) return;
  if (typeof event.data?.text !== 'string') return;
  document.getElementById('msg').textContent = event.data.text;
});
```

- 攻撃者のページは、あなたのページを iframe や `window.open` で開き、**好きな内容のメッセージを送れます**。
- `event.origin.includes('example.com')` や `startsWith` は、`https://example.com.attacker.example` で回避されます。**完全一致** で比べます。
- 送信元が正しくても、`data` は外部からの値です。シンクに渡すときの注意は DOM Based XSS と同じです。

---

## 🔀 オープンリダイレクト（JavaScript 版）

サーバー側のリダイレクト（[[02_リダイレクト処理にまつわる脆弱性（徳丸本10章）]]）と同じ問題が、JavaScript の画面遷移でも起きます。

```javascript
// ❌ ログイン後に ?next=https://phishing.example/ へ飛ばされる
const next = new URLSearchParams(location.search).get('next');
location.href = next;
```

さらに JavaScript 版では、`?next=javascript:...` で **XSS にもなる** 点に注意します。

### 対策

| 対策 | 例 |
|------|------|
| **リダイレクト先の URL を固定にする** | ログイン後は必ず `/mypage` |
| **URL を直接指定せず、番号などで指定する** | `?next=2` → 対応表で `/settings` に変換 |
| **同じオリジンかを確かめる** | 下のコード |

```javascript
// ✅ 自分のオリジン内のパスだけ許可する
function safeRedirect(next) {
  try {
    const url = new URL(next, location.origin);
    if (url.origin === location.origin) {
      location.href = url.pathname + url.search + url.hash;
      return;
    }
  } catch {}
  location.href = '/mypage';
}
```

- `//attacker.example`（スキームなし）や `/\attacker.example` は、文字列の先頭が `/` でも外部に飛びます。**`new URL()` で解決してから `origin` を比べる** のが確実です。

---

## 🧰 共通の対策：ライブラリを最新に保つ

jQuery・Angular・Vue などの古い版には、DOM Based XSS につながる脆弱性が見つかっているものがあります。

- 使っているライブラリを把握し、`npm audit` や Dependabot で更新を追う。
- CDN から読むスクリプトには **SRI**（`integrity` 属性）を付け、改ざんされたファイルを実行しない。

詳しくは [[A06_脆弱で古いコンポーネント]]。

---

## 📋 対策の優先順位

```
1. 外部の値は textContent / createElement で入れる。innerHTML・document.write・eval に渡さない（本質的対策）
2. URL はパースしてスキームを http/https に限り、遷移先は同じオリジンか対応表で決める
3. postMessage は targetOrigin を指定し、受信側で event.origin を完全一致で確かめる
4. Webストレージに秘密情報を置かない。ログイン状態は HttpOnly Cookie で持つ
5. HTML が必要なら DOMPurify、追加の防御に CSP・Trusted Types（保険）
6. ライブラリを最新に保つ
```

本章に共通する考え方は、**「ブラウザの中にも外部入力の入り口がある」** ことです。URL のフラグメント、Webストレージ、他のウィンドウからのメッセージは、どれもサーバーを通らない外部入力です。サーバー側の対策だけで安心せず、**JavaScript で DOM に書き込む・画面を遷移させる・データを保存する** 場所を、サーバー側の出力と同じ目で点検します。

前へ：[[02_WebAPI実装における脆弱性（徳丸本19章）]] ／ 目次：[[MOC_Web脆弱性対策]]
