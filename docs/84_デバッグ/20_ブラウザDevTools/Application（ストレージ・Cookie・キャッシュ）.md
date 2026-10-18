# Application（ストレージ・Cookie・キャッシュ）

「ログインしたはずなのにログアウトされる」「古い画面が表示され続ける」「自分の環境でだけおかしい」——こうした問題の多くは、ブラウザに保存された**状態**が原因です。**Application パネル**では、Cookie・localStorage・IndexedDB・Service Worker・キャッシュなど、ブラウザが持っている状態を確認・編集・削除できます。

---

## 1. パネルの構成

| セクション | 中身 |
|------------|------|
| **Application** | Manifest（PWA の設定）、Service workers、Storage（まとめて削除） |
| **Storage** | Local storage、Session storage、IndexedDB、Cookies、Shared storage など |
| **Background services** | Back/forward cache、プッシュ通知、バックグラウンド同期 |
| **Frames** | ページ内のフレームと、そのセキュリティ情報 |

---

## 2. Cookie

| 列 | 見るポイント |
|----|--------------|
| Name / Value | 値が入っているか、想定どおりか |
| Domain / Path | そのページに送られる範囲か（サブドメイン・パスの違いで送られないことがある） |
| Expires / Max-Age | 期限切れになっていないか。`Session` はブラウザを閉じると消える |
| **HttpOnly** | JavaScript から読めないか（セッション ID は HttpOnly が基本） |
| **Secure** | HTTPS でしか送られないか（http://localhost では例外的に送られる） |
| **SameSite** | `Strict` / `Lax` / `None`。別サイトからのリクエストで送られるか |

### よくある問題

| 症状 | 確認すること |
|------|--------------|
| ログイン後すぐにログアウトされる | Cookie が保存されていない → Network パネルでレスポンスの `Set-Cookie` を見る。警告アイコンに理由が出る |
| API に Cookie が送られない | `SameSite`・`Domain`・`Secure`、fetch の `credentials: 'include'`、CORS の `Access-Control-Allow-Credentials` |
| 別ドメインの Cookie が使えない | サードパーティ Cookie の制限。`SameSite=None; Secure` が必要で、ブラウザの設定によっては送られない |

- Cookie の値をダブルクリックで編集、行を選んで Delete で削除できます。セッション切れの状態を作るときに便利です。
- Cookie とセッションの仕組みは [[01_クッキーとは]]・[[01_セッション管理の不備（徳丸本9章）]]（74_セッション管理）を参照。

---

## 3. localStorage / sessionStorage

| | localStorage | sessionStorage |
|---|--------------|----------------|
| 期限 | 消すまで残る | タブを閉じると消える |
| 範囲 | 同じオリジンの全タブ | そのタブだけ |

- キーと値を直接編集・削除できます。
- 「自分の環境でだけおかしい」ときは、**古いバージョンのアプリが保存したデータ**が残っていないかを確かめる（データ構造を変えたのに、古い形式のデータを読んでいる）。
- 状態管理ライブラリの永続化（persist）を使っている場合も、ここに保存されています（36_状態管理/80_永続化・同期）。

---

## 4. IndexedDB

- データベース → オブジェクトストア → レコードの順に中身を見られます。
- 表示が更新されないときは、更新ボタン（↻）を押す。
- オフライン対応のアプリや、TanStack Query の永続化などで使われます。

---

## 5. Service Worker とキャッシュ

PWA や MSW（[[01_MSWの仕組みとセットアップ]]）は Service Worker を使います。Service Worker は**ページを閉じても残り**、リクエストを横取りするので、古い状態の原因になりやすい部分です。

| 操作 | 場所 | 用途 |
|------|------|------|
| 状態の確認 | Application → Service workers | どのワーカーが動いているか、待機中の新しいワーカーはあるか |
| **Update on reload** | 同上のチェックボックス | リロードのたびに新しいワーカーに切り替える（開発中に便利） |
| **Bypass for network** | 同上 | Service Worker を通さず、ネットワークから直接取る |
| Unregister | 同上 | ワーカーを削除する |
| Cache storage | Storage → Cache storage | Service Worker が保存したレスポンスを見る・消す |

### 「古い画面が表示され続ける」ときの確認順

1. Network パネルで、該当のリクエストが `(from ServiceWorker)` や `(disk cache)` になっていないか。
2. Service Worker が古いバージョンのまま動いていないか（待機中のワーカーがあれば「skipWaiting」）。
3. Cache storage に古いレスポンスが残っていないか。
4. CDN やサーバーのキャッシュヘッダー（`Cache-Control`）。

---

## 6. まとめて消す：Clear site data

Application → Storage → **Clear site data** で、Cookie・ストレージ・キャッシュ・Service Worker をまとめて削除できます。

- 「初めて訪れたユーザー」の状態を再現したいときに使う。
- 消す範囲はチェックボックスで選べます。
- ほかに、**シークレットウィンドウ**で開くのも、状態のない環境を作る手軽な方法です（拡張機能も無効になるので、拡張機能が原因かの切り分けにもなる）。

---

## 7. 関連項目

- [[Network（通信の監視）]]：Set-Cookie・キャッシュの確認
- [[04_クッキーとログイン]]（74_セッション管理）
- [[01_デバッグの基本プロセス]]：環境の違いを疑う

---

**前へ** ← [[Sources（ブレークポイントとステップ実行）]]　｜　**次に読む** → [[Performance・Memory（遅さとメモリリークの調査）]]
