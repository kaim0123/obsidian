# Date（日時）

## Date オブジェクトとは

**Date** は JavaScript で日付・時刻を扱う標準の組み込みオブジェクトです。作成した時点では「ある瞬間のタイムスタンプ」を表します。

```js
const now = new Date();
console.log(now); // 例: 2026-04-22T08:00:00.000Z
```

日時を扱う際、現実には「タイムゾーン」「うるう年」「夏時間」などの複雑さが付きまとい、標準の `Date` は少し癖があります。もし本格的に日付処理を書くなら、後述の **Temporal API**（ES2025 で登場）や `date-fns`/`dayjs` などのライブラリが有力候補です。

## Date の作り方

```js
new Date();                       // 現在時刻
new Date(0);                      // 1970-01-01 UTC（エポック基準）
new Date(1_700_000_000_000);      // ミリ秒から
new Date("2026-04-22");           // ISO 文字列から
new Date("2026-04-22T12:00:00+09:00"); // JST指定
new Date(2026, 3, 22);            // 年, 月(0-11！), 日
new Date(2026, 3, 22, 10, 30, 0); // 年, 月, 日, 時, 分, 秒
```

**注意**：月は `0 始まり` です（1月=0）。これは最悪の初見殺しです。

## 現在時刻の取得

```js
Date.now();            // 現在の UNIX ミリ秒
new Date().getTime();  // 同じく
```

タイムスタンプでログを取りたい時や、処理時間を計測するときに使います。

```js
const start = Date.now();
// 何か重い処理
console.log(`${Date.now() - start}ms`);
```

## Date の値を取り出す

```js
const d = new Date("2026-04-22T10:30:00");
d.getFullYear();      // 2026
d.getMonth();         // 3（4月！0始まり）
d.getDate();          // 22（月の何日目）
d.getDay();           // 0-6（曜日、0=日）
d.getHours();         // 10
d.getMinutes();       // 30
d.getSeconds();       // 0
d.getMilliseconds();  // 0
d.getTime();          // UNIX ミリ秒
```

UTC 版もあります（`getUTCFullYear` など）。ログをサーバと合わせるときなどに。

## 日時のフォーマット

### 組み込み変換

```js
const d = new Date();
d.toString();          // "Wed Apr 22 2026 10:30:00 GMT+0900 ..."
d.toISOString();       // "2026-04-22T01:30:00.000Z"（UTC）
d.toLocaleDateString(); // "4/22/2026" など（環境依存）
d.toLocaleTimeString(); // "10:30:00 AM"
d.toLocaleString();    // 日付+時刻
```

### Intl.DateTimeFormat（おすすめ）

ロケール別のフォーマットが柔軟にできます。

```js
const fmt = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});
fmt.format(new Date()); // "2026/04/22(水) 10:30"
```

### 自作フォーマット

簡単なものなら自作もアリ。

```js
function format(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
```

詳しくは [[日付フォーマット]]。

## 日時の計算

### 加減

```js
const d = new Date("2026-04-22");
d.setDate(d.getDate() + 7);  // 1週間後
d.setMonth(d.getMonth() - 1); // 1ヶ月前
```

### 差分

```js
const a = new Date("2026-04-22");
const b = new Date("2026-04-01");
const diffMs = a - b;                         // ミリ秒差
const diffDays = diffMs / (1000 * 60 * 60 * 24); // 21日
```

### タイムスタンプで比較

```js
if (a.getTime() > b.getTime()) { ... }
```

`a > b` も動きますが、`===` は参照比較なので等値判定には使えません。必ず `getTime()` で数値化。

## タイムゾーンの扱い

JavaScript の Date は内部的に UTC ミリ秒を持っていて、表示時にユーザのタイムゾーンに合わせて変換します。

```js
const d = new Date();
d.getHours();             // ユーザの時刻
d.getUTCHours();          // UTC の時刻
d.toISOString();          // UTC（末尾 Z）
```

- サーバと通信するときは **ISO 文字列（UTC）** を送り、表示時にローカルへ変換するのが鉄則
- Date はタイムゾーンを持てないので、「このDateはJST」などは表現できない

これを正しく扱うのは意外に難しく、本格用途では **Temporal** または `date-fns-tz`, `luxon` を検討。

## Temporal API（新しい・推奨の方向）

Temporal は次世代の日時 API で、`Temporal.Instant`, `Temporal.PlainDate`, `Temporal.ZonedDateTime` など用途別の型があります。

```js
// ※環境によってはポリフィルが必要
const today = Temporal.Now.plainDateISO();        // 2026-04-22
const next = today.add({ days: 7 });              // 2026-04-29
const zdt = Temporal.Now.zonedDateTimeISO("Asia/Tokyo");
```

型が細かく分かれていて、タイムゾーンのミスを起こしにくい設計です。将来的にはこれが主流になる見込み。

## 人気ライブラリ

- **date-fns** … 関数ベース、ツリーシェイキングが効く
- **dayjs** … モック的な `Date` ラッパー、軽量（約2KB）
- **luxon** … タイムゾーン扱いが強力
- **moment.js** … かつての定番。今はメンテナンスモードなので新規採用は非推奨

```js
// dayjs 例
import dayjs from "dayjs";
dayjs().add(7, "day").format("YYYY-MM-DD");
```

## よくある落とし穴

### 1. 月が0始まり

```js
new Date(2026, 4, 1); // 5月1日（4月ではない）
```

### 2. new Date(文字列) の解釈

```js
new Date("2026-04-22");      // UTC 00:00 として解釈
new Date("2026/04/22");      // ローカルタイムゾーン
new Date("April 22, 2026");  // ローカル
```

同じ日を指しても、時刻がズレて見えることがあります。確実にしたければ `new Date(年, 月, 日)` や ISO 形式に統一。

### 2. setDate の末日

```js
const d = new Date("2026-01-31");
d.setMonth(1);           // 3月3日になる（2月は31日がないので繰り上がる）
```

「月末日を維持」のような処理は自作が必要。

### 3. Date の比較

```js
new Date("2026-04-22") === new Date("2026-04-22"); // false（参照比較）
new Date("2026-04-22").getTime() === new Date("2026-04-22").getTime(); // true
```

## まとめ

- `new Date()` で現在時刻、`Date.now()` でミリ秒
- 月は0始まり、曜日は0=日
- 表示は `Intl.DateTimeFormat` がロケール対応で便利
- 比較は `getTime()` で数値化
- タイムゾーン周りは複雑、本格用途は Temporal or ライブラリ
- サーバ連携は ISO 8601（UTC）でやり取りが鉄板

日時は「分からないので `moment.js` で済ませていた」となりがちですが、Date の癖を知っておくと軽量な案件では自前で十分対応できます。
