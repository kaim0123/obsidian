---
title: "if と switchの使い分け：可読性・挙動・TypeScriptでの優先順位"
emoji: "🔀"
type: "tech"
topics: ["JavaScript", "TypeScript", "初心者向け", "プログラミング"]
published: false
---

## はじめに

`if` と `switch` は、どちらも **条件に応じて処理を分ける** ための構文です。**どちらを選ぶか** は、可読性だけでなく **正しさ・型による保証・言語の挙動** とも関係します。

この記事では **TypeScript でコーディングする前提** で、次の順に整理します。

1. **何を最優先に考えるか**（優先順位）
2. **`if` / `switch` の使い分け**（可読性・表現しやすさ）
3. **可読性以外の違い**（比較のしかた、フォールスルー、パフォーマンス）
4. **TypeScript 特有の観点**（判別ユニオンと網羅チェック）

文法の基礎（`if` / `else if`、`switch` の書き方）は、条件分岐の教材とあわせて読むと理解が深まります。

---

## 1. 優先順位（TypeScript 前提）

| 順位 | 軸 | 内容 |
| --- | --- | --- |
| **1** | **正しさ** | 意図どおり動くか。`switch` の **`break` 忘れによるフォールスルー** など、バグになる差は可読性より先に潰す。 |
| **2** | **型で守れること** | 判別ユニオンに **`switch` + `default` で `never` による網羅チェック** を載せると、ケース追加漏れをコンパイルで止められる。**長期的な正しさ・保守** では可読性より上に置くことが多い。 |
| **3** | **可読性** | 正しく型も通るうえで、レビューや変更時に意図が伝わる書き方を選ぶ。型で意図が補強されれば、可読性も上がりやすい。 |
| **4** | **パフォーマンス** | `if` と `switch` の速度差は、通常は **最優先にしなくてよい**。ボトルネックがここになることは稀。 |

---

## 2. 使い分けの目安（可読性・表現力）

| 状況 | おすすめ |
| --- | --- |
| 条件が **大小や範囲**（`>=`、`<`、`&&` など） | **`if` / `else if`** |
| 条件が **複数の変数** をまたぐ | **`if`** |
| **1つの値** が、**決まったいくつかの候補** のどれか | **`switch` が読みやすく、型とも相性がよいことが多い** |
| 候補が **2〜3個** でシンプル | **`if` でも `switch` でも可**（チームの流儀・網羅チェックの方針に合わせる） |

「同じ変数を `===` で何度も比較している `else if` の列」は、`switch` にまとめると **対応表のように読める** ことがあります。

### 2.1 初心者向け：まず押さえること

- **`if`** … 「もし〜なら」「そうでなければ、もし〜なら」と、**いろいろな形の条件**（大きい・小さい、A かつ B など）をそのまま書ける。
- **`switch`** … だいたい **「1つの値が、あらかじめ決めた候補のどれか」** かどうかを、**一覧表のように** 並べるのに向く。

どちらも「条件で処理を分ける」ことは同じで、**書きやすさ・読みやすさ** の話です。

### 2.2 大小や範囲（`>=`、`<`、`&&` など）→ `if`

**意味:** 「80点以上」「18歳未満」のように、**数の区切り** や **範囲** で分けるときは `if` が自然、ということです。`switch` は基本「この値と一致するか」なので、**「80以上90未満」** のような範囲を無理に `switch` だけで書くと読みにくくなりがちです（後述の「`switch (true)`」の話ともつながります）。

```typescript
const score = 85;
if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("C以下");
}
```

### 2.3 複数の変数をまたぐ → `if`

**意味:** 判断に **`age` と `hasTicket` の両方** のように **2つ以上の変数** が絡むときは、`switch` は「1つの式だけ」を見る形にしやすいので **`if` のほうが素直**、ということです。

```typescript
const age = 20;
const hasTicket = true;

if (age >= 18 && hasTicket) {
  console.log("入場OK");
} else {
  console.log("入場NG");
}
```

### 2.4 1つの値が「決まった候補のどれか」→ `switch` が読みやすいことが多い

**意味:** 例えば **`status` が `"pending"` / `"done"` / `"error"` のどれか** だけ、のように **1つの変数の値が、名前のついた数個のパターン** に分かれるときは、`switch` で **ケース一覧** にすると読みやすい、ということです。TypeScript では、この「候補が決まっている」形は **型（判別ユニオン）** と組み合わせやすく、**ケース漏れをコンパイルで検知** しやすい、というのが「型とも相性がよい」のニュアンスです（この記事の「4. TypeScript 特有の観点」参照）。

```typescript
const status = "done";

switch (status) {
  case "pending":
    console.log("待機中");
    break;
  case "done":
    console.log("完了");
    break;
  case "error":
    console.log("エラー");
    break;
  default:
    console.log("不明");
}
```

### 2.5 候補が 2〜3 個でシンプル → `if` でも `switch` でも可

**意味:** パターンが少なくて短いなら、**どちらで書いても大差ない** ことが多い、ということです。**チームで「こう書く」という決まり** や、**TypeScript で網羅チェックしたいか** で揃える、と表に書いてあるのはそのためです。

```typescript
const lang = "ja";

// if 版
if (lang === "ja") {
  console.log("こんにちは");
} else if (lang === "en") {
  console.log("Hello");
} else {
  console.log("???");
}

// switch 版（同じ意味）
switch (lang) {
  case "ja":
    console.log("こんにちは");
    break;
  case "en":
    console.log("Hello");
    break;
  default:
    console.log("???");
}
```

### 2.6 「`else if` の列」を `switch` にまとめると対応表になる

次のように **同じ変数** を **`===` で何度も比較している `else if` の列** は、`switch` にまとめると「この値のときはこの処理」が **縦に一覧** され、**対応表を読む感じ** になりやすい、というのが表の直後の一文の意味です。

```typescript
const role = "editor";

// else if の列（全部 role と比較している）
if (role === "admin") {
  /* ... */
} else if (role === "editor") {
  /* ... */
} else if (role === "viewer") {
  /* ... */
}

// switch にまとめたイメージ
switch (role) {
  case "admin":
    /* ... */
    break;
  case "editor":
    /* ... */
    break;
  case "viewer":
    /* ... */
    break;
}
```

### 2.7 覚え方のまとめ

| こんな条件なら | 覚え方 |
| --- | --- |
| 数の大小・範囲 | `if` |
| 変数が2つ以上絡む | `if` |
| 1つの変数が、決まった文字列などのどれか | `switch` も強い |
| パターンが2〜3個だけ | 好み・チーム・型の方針でどちらでも |

**ひとこと:** まずは **「範囲や複数変数 → `if`」「1変数・決まった値の列 → `switch` も検討」** と覚えておくと、上の表と対応しやすいです。

---

## 3. `if` が向いている場面

### 3.1 数値の範囲や比較

しきい値で区切るときは `if` が自然です。

```typescript
function grade(score: number) {
  if (score < 0 || score > 100) return "不正な値";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "D";
}
```

無理に `switch (true)` にすると、**なぜ `true` なのか** が読み手の負担になりがちです。

### 3.2 複雑な条件（論理演算）

「A かつ B」「X または Y」は `if` のほうが素直です。

```typescript
function canEnter(age: number, hasTicket: boolean, isVip: boolean) {
  if (isVip) return true;
  if (age >= 18 && hasTicket) return true;
  return false;
}
```

### 3.3 比較する式が毎回違う

`user.role` と `plan.type` のように **1つの式に集約できない** 場合は `switch` の形に合いません。

---

## 4. `switch` が向いている場面

### 4.1 1つの値が列挙された候補のどれか

離散した値の一覧に処理を対応させるとき、`switch` は **分岐の軸が一目で分かる** ことがあります。

```typescript
function describeHttpMethod(method: string) {
  switch (method) {
    case "GET":
      return "取得";
    case "POST":
      return "新規作成";
    case "PUT":
    case "PATCH":
      return "更新";
    case "DELETE":
      return "削除";
    default:
      return "その他";
  }
}
```

### 4.2 同じ変数への厳密等価が `else if` で長い

```typescript
function label(status: string) {
  switch (status) {
    case "pending":
      return "待機中";
    case "running":
      return "実行中";
    case "done":
      return "完了";
    case "error":
      return "エラー";
    default:
      return "不明";
  }
}
```

---

## 5. 可読性以外の違い（挙動・仕様）

### 5.1 比較のしかた

- **`switch`**: 1つの式を評価し、各 `case` と **厳密等価（`===`）** で比較します。
- **`if`**: 任意の真偽式を都度評価できます。

型が違うと `switch` ではマッチしない（例: `case 1` と値が文字列 `"1"`）ので、**データの型を揃える** のが前提になります。

### 5.2 フォールスルー（正しさに直結）

**`break`（または `return`）を書かないと、次の `case` の処理も実行される** のが `switch` の仕様です。`if` のチェーンにはこの性質はありません。

意図的なフォールスルー（複数 `case` で同じ処理）はありますが、**コメントで意図を書く** か、**まとめて書ける `case` を並べる** などして、誤読とバグを防ぎます。

### 5.3 パフォーマンス

エンジンによっては特定のパターンで最適化されることがありますが、**通常のアプリでは `if` と `switch` の選択理由にしない** でよいレベルです。上記の **優先順位 4** に相当します。

---

## 6. TypeScript での観点（優先順位 2 とセットで）

### 6.1 判別ユニオンと `switch`

**判別プロパティ**（例: `kind`）で形が変わる値は、`switch (value.kind)` とすると **各 `case` で型が絞り込まれる** ので、`if` より型情報が付きやすいです。

```typescript
type Result =
  | { kind: "ok"; data: string }
  | { kind: "err"; message: string };

function describe(r: Result): string {
  switch (r.kind) {
    case "ok":
      return r.data;
    case "err":
      return r.message;
  }
}
```

### 6.2 網羅チェック（`default` + `never`）

ユニオンに **新しいバリアントを足したときにコンパイルエラーにしたい** 場合、`switch` の **`default` で `never` に代入** するパターンがよく使われます。これは **ケース漏れの防止**（優先順位 2）に効きます。

```typescript
function assertNever(x: never): never {
  throw new Error(`Unexpected: ${x}`);
}

function describe(r: Result): string {
  switch (r.kind) {
    case "ok":
      return r.data;
    case "err":
      return r.message;
    default:
      return assertNever(r);
  }
}
```

`Result` に `kind: "loading"` を追加すると、`switch` が網羅でなくなり **型エラー** になります（実装の詳細はプロジェクトの `tsconfig` や ESLint 設定に依存します）。

### 6.3 `if` でもよい場面

範囲・複合条件・複数変数は **`if` のまま** が自然です。型の絞り込みは `if (r.kind === "ok")` でも問題ありません。**網羅を型で強制したいか**、**分岐が「1 式の列挙」か** で `switch` を選ぶとよいです。

---

## 7. まとめ

- **選び方の軸:** まず **正しさ**、次に **型（網羅・絞り込み）**、そのうえで **可読性**。**速度差** は通常は後回し。
- **表現力:** 範囲・複合条件・複数変数 → **`if`**。1 つの式の離散値 → **`switch` が読みやすく、TS とも相性がよいことが多い**。
- **挙動:** `switch` は **`===` のみ**、**`break` 忘れに注意**。
- **学習の進め方:** 最初は `if` だけでも十分。同じ変数の `===` が並んだら `switch` と **判別ユニオン + 網羅チェック** を検討する段階でよい。

---

## Zenn へ投稿するとき

- 先頭の `published: ` を `true` にするか、Zenn のエディタで公開設定を行ってください。
- Zenn CLI を使う場合は、リポジトリの `articles/` に置き、ファイル名をスラッグ（例: `if-switch-typescript.md`）にすると管理しやすいです。Obsidian の番号付きファイル名のままでも、frontmatter と本文はそのまま利用できます。
