# 名前付きインポート（`import { base } ...`）解説

例えば次のようなコードは、別ファイル（別モジュール）から `base` という値だけを取り出して使うための書き方です。

```js
import { base } from '../lib/utils';
```

## これは何をしている？

大きく2つの意味があります。

1. `../lib/utils` から「何か（モジュール）を読み込む」
2. そのモジュールの中から `base` という「名前付きの書き出し（named export）」を取り出す

## `../lib/utils` の意味（相対パス）

`..` は「今いる場所の1つ上の階層」を表します。

- 例：この import が `src/features/foo.js` に書かれているなら
  - `../lib/utils` は `src/lib/utils.js`（または `src/lib/utils.ts` など）を指す、というイメージです

つまり `base` の定義は、基本的に `lib/utils` 側のファイルにあります。

## `base` 側はどう書かれている必要がある？

`import { base } ...` を成立させるには、`lib/utils` が `base` を「名前付きで export」している必要があります。

### 例：名前付き export（この場合は `{}` で import する）

```js
// lib/utils.js
export const base = 'https://example.com';
```

```js
// src/features/foo.js
import { base } from '../lib/utils';
```

### もし `export default` だったら？（`{}` は不要）

`lib/utils` が `default` を export している場合は、書き方が変わります。

正しくは例えばこうです。

```js
// lib/utils.js
const base = 'https://example.com';
export default base;
```

この場合の import は：

```js
import base from '../lib/utils';
```

## この `base` は「何のため」の値？

ファイル名や import されている名前だけでは断定できませんが、`base` はよく次のような「共通で使う設定値・ユーティリティ」を意味することが多いです。

- ルートURL/ベースパス
- APIのベース設定
- 共通の定数（文字列・パラメータ）
- 共通処理をまとめたオブジェクト

実際の意図は、`lib/utils` 内で `base` がどう定義・加工されているかを見れば判断できます。

## 使うときのチェックポイント

- `lib/utils` に `export const base ...` / `export { base } ...` があるか（なければ import できない）
- `base` は `export default` なのか、named export なのか（`{}` が要る/要らないが変わる）
- 相対パス `../lib/utils` が、読みたいファイルを指しているか（ファイルの場所を確認）

---

## 関連

- [[12-js-ecosystem|ES Modules（`import`/`export`）]]

