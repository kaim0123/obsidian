---
title: 05_es-toolkit
created: 2026-09-25
tags:
  - ユーティリティ
  - es-toolkit
---

# es-toolkit（イーエス・ツールキット）

> **ひとことで言うと**：Lodash の「今どき版」。TypeScript で書かれ、必要な関数だけを読み込め、多くの処理で Lodash より2〜3倍速い。`es-toolkit/compat` を使えば Lodash とほぼ同じ書き方のまま乗り換えられる。

## 基本情報

- 開発元：Toss（韓国の金融サービス企業）
- 特徴：TypeScript 製・依存ゼロ・tree-shaking 前提・関数ごとのサイズが Lodash より最大97%小さい
- 公式：https://es-toolkit.dev/

## 基本の使い方

```ts
import { debounce, chunk, groupBy, pick, omit, isEqual, uniqBy } from "es-toolkit";

chunk([1, 2, 3, 4, 5], 2);                 // [[1, 2], [3, 4], [5]]
pick(user, ["id", "name"]);                // { id, name }（型も絞られる）
omit(user, ["password"]);
isEqual({ a: [1] }, { a: [1] });           // true
uniqBy(users, (u) => u.email);

const onSearch = debounce((q: string) => search(q), 300);
onSearch.cancel(); // 保留中の呼び出しを取り消す
```

### 非同期ユーティリティ

```ts
import { delay, retry } from "es-toolkit";

await delay(500);
await retry(() => fetchSomething(), { retries: 3, delay: 1000 });
```

## Lodash からの移行

```ts
// 1. まずは互換レイヤーに差し替え（書き方はそのまま）
import { get, debounce } from "es-toolkit/compat";

// 2. 余裕があれば本体（es-toolkit）へ。引数の形が少し違う関数があるので型エラーを見ながら直す
```

- `es-toolkit/compat` は Lodash のテストで動作を確かめている互換版。そのぶん本体より少し大きく遅い
- `_.chain` のようなメソッドチェーンは無い。普通の関数呼び出しか、標準の配列メソッドでつなぐ

## Lodash との違い（ざっくり）

| 観点 | Lodash | es-toolkit |
|---|---|---|
| 言語 | JavaScript（型は `@types/lodash`） | TypeScript |
| 読み込み | `lodash-es` なら tree-shaking 可 | 標準で tree-shaking 前提 |
| 速度 | 基準 | 多くの関数で2〜3倍速い |
| 網羅性 | 非常に広い | 主要なものは揃う。無いものは compat で |
| チェーン | `_.chain` | なし |

## 関連
- [[01_ユーティリティライブラリの選び方]]
- [[04_Lodash]]
