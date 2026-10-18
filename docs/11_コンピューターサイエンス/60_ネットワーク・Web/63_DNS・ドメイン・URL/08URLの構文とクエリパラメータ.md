# URLの構文とクエリパラメータ

## URLとは
**Uniform Resource Locator**の略で、ウェブ上のリソース（ページ・画像・APIなど）の**場所を一意に示す文字列**です。

## URLの全体構造

```
https://user:pass@www.example.com:8080/path/to/page?query=1&lang=ja#section
└──┬─┘ └────┬───┘ └─────┬────────┘└─┬┘└────┬──────┘└────────┬──────┘└──┬──┘
スキーム  認証情報      ホスト      ポート   パス         クエリ     フラグメント
```

## 各パーツの意味

### スキーム (Scheme)
通信プロトコルを指定します。
- `http` : 平文のHTTP
- `https` : 暗号化HTTP
- `ftp` : ファイル転送
- `file` : ローカルファイル
- `mailto` : メールリンク
- `tel` : 電話番号リンク

### 認証情報
`user:password@` の形式でBasic認証情報を渡す（非推奨、漏えいリスクあり）。

### ホスト
ドメイン名（例: `www.example.com`）または IPアドレス（例: `192.168.1.1`）。

### ポート番号
省略時はスキームの既定値。
- http → 80
- https → 443

### パス
サーバー上のリソースの位置。スラッシュ区切り。
```
/blog/2026/04/post-1
```

### クエリ文字列
`?` 以降のパラメータ。`key=value` を `&` でつなぐ。

### フラグメント
`#` 以降。ページ内のアンカー位置を指定。サーバーには送信されない。

## クエリパラメータの詳細

### 基本書式
```
?key1=value1&key2=value2
```

### 例: 検索URL
```
https://example.com/search?q=ネットワーク&page=2&sort=date
```
| キー | 値 | 意味 |
|---|---|---|
| q | ネットワーク | 検索語 |
| page | 2 | 何ページ目か |
| sort | date | 並び順 |

### 同じキーを複数回
```
?tag=js&tag=react&tag=css
→ tag: ["js", "react", "css"]
```

### URLエンコーディング（パーセントエンコード）
`?`, `&`, スペース、日本語などURLで特殊な意味を持つ/非ASCII文字はエンコードが必要です。

| 元の文字 | エンコード後 |
|---|---|
| 空白 | `%20` または `+`（クエリ内） |
| `&` | `%26` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| `あ` | `%E3%81%82` |

### JavaScriptでの変換
```javascript
// エンコード
encodeURIComponent("こんにちは&hello");
// → "%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF%26hello"

// デコード
decodeURIComponent("%E3%81%82");  // → "あ"

// URLSearchParamsで組み立て
const params = new URLSearchParams({ q: "ネット", page: 2 });
params.toString();  // "q=%E3%83%8D%E3%83%83%E3%83%88&page=2"
```

## 絶対URLと相対URL

### 絶対URL
```
https://example.com/blog/post
```
スキームから完全に指定。

### 相対URL
```
../images/cat.png       ← 現在の位置から
/assets/logo.png        ← ドメインルートから
logo.png                ← 同じディレクトリ内
```
HTMLやCSS内でよく使います。

## URLとURIの違い
- **URI**: Uniform Resource Identifier（識別子の総称）
- **URL**: URIの一部で「場所」を示すもの
- **URN**: URIの一部で「名前」を示すもの

実務ではほぼ「URL」で通じます。

## クエリ設計の注意点

### 入れるべきもの
- 検索条件・ページ番号・ソート順
- フィルタ・言語切り替え

### 入れてはいけないもの
- **パスワード**や機密情報（ログに残る）
- **セッションID**（推奨されない）

### Web共有/キャッシュに影響
- 同じページでもクエリが違えば別URL扱い
- CDNやブラウザキャッシュのキー

## 実用パターン

### 分析タグ（UTMパラメータ）
```
?utm_source=twitter&utm_medium=social&utm_campaign=launch
```

### APIエンドポイント
```
GET /api/users?status=active&limit=20&offset=40
```

### ディープリンク
```
myapp://user/123/profile
```

## まとめ
- URLは **スキーム＋ホスト＋パス＋クエリ＋フラグメント** で構成
- クエリは `?key=value&...` 形式で複数指定可能
- 特殊文字や日本語は**URLエンコード**が必要
- 相対/絶対URLを使い分け、機密情報はクエリに含めない

次章では、このURLで通信する**HTTPプロトコル**を学びます。
