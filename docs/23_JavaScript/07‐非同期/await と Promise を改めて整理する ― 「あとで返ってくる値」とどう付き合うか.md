---
title: "await と Promise を改めて整理する ― 「あとで返ってくる値」とどう付き合うか"
source: "https://zenn.dev/shutingstar/articles/28ef61efbff16d"
author:
published: 2026-04-27
created: 2026-05-09
description:
tags:
  - "clippings"
---

## 詳しい要約

**テーマ：Promise は「あとで値が入る箱」、async / await は「箱の中身を待って取り出す書き方」**

`fetch` などで出会う `async / await` と `Promise` を、型の変化（`Promise<T>` → `T`）に注目して整理した記事。`Promise<T>` を「あとで T になる箱」と捉えると、TypeScript の型エラーや非同期処理の流れが読みやすくなる、というのが結論。

---

### 非同期処理と Promise

- 非同期処理は **待ち時間が発生する処理**（API 取得、DB 保存、ファイル読み込み、AI API、画像アップロードなど）。毎回処理を止めると画面が固まるため、「投げておいて終わったら続きをする」形を取る。
- `Promise` はまだ結果が出ていない処理を表すオブジェクト。`Promise<Response>` は `Response` そのものではなく「成功したら `Response` になる予定の箱」。
- 状態は3つ：**pending**（未完了）/ **fulfilled**（成功）/ **rejected**（失敗）。
- `new Promise<T>((resolve, reject) => ...)` で自作もできるが、実務では `fetch`・DB クライアント・SDK が返してくれることが多い。

### await と async

- `await` は **`Promise<T>` の完了を待って `T` を取り出す**（`const res: Response = await promise`）。
- `async` 関数は **戻り値を自動で Promise に包む**。`return "YS"` でも呼び出し側は `Promise<string>` を受け取るので `await` が必要。
- 実例：`fetchCompanies(): Promise<Company[]>` を定義し、`res.ok` でなければ `throw`。使う側は `await fetchCompanies()` で `Company[]` を得る。
- 失敗は `try / catch` で扱える。React コンポーネントで `loading` / `error` 状態を切り替える例を掲載。

### よくある詰まりどころ

1. **await し忘れ**：`fetchCompanies().length` のように Promise を中身と混同する（TypeScript が怒ってくれる）。
2. **async map は Promise の配列になる**：`ids.map(async ...)` は `Promise<Company>[]`。まとめて待つには **`Promise.all`**（`Promise<Company>[]` → `Promise<Company[]>` → `Company[]`）。
3. **async 関数の戻り値型に Promise を書き忘れる**：戻り値型は基本 `Promise<T>` とセットで覚える。

### then との比較

- `.then().catch()` でも同じことが書けるが、処理が増えるほど上から順に読める `async / await` の方が読みやすい。本質はどちらも Promise の完了を待って次につなげること。

### まとめ

- `Promise<T>` は「あとで T が返る処理」、`await` は「`Promise<T>` から T を取り出す」。
- `async` 関数は戻り値を Promise で包み、`Promise.all` は Promise の配列をまとめて待つ。
- コードを読むときは「今は Promise の箱か、await した後の中身か」を意識する。

2

## はじめに

こんにちは、YSです。  
今回は `async / await` と `Promise` について整理します。

TypeScript や Next.js を書いていると、かなり早い段階でこういうコードに出会います。

```
const res = await fetch("/api/companies");
const data = await res.json();
```

最初は「APIを叩くときに付けるおまじない」くらいの理解でも動きます。  
ただ、少し複雑な処理を書き始めると、

- `Promise<string>` って何？
- `async` を付けた関数の戻り値はどうなる？
- `await` し忘れると何が起きる？
- `Promise.all` はいつ使う？

あたりで一気に混乱します。

この記事では、 `Promise` を **「あとで返ってくる値の箱」** 、 `async / await` を **「その箱の中身を待って取り出す書き方」** として整理してみます。

---

## そもそも非同期処理とは

非同期処理は、ざっくり言うと **待ち時間が発生する処理** です。

たとえば Web アプリなら、以下はだいたい非同期です。

- API からデータを取ってくる
- データベースに保存する
- ファイルを読み込む
- AI API にリクエストを送る
- 画像をアップロードする

どれも「実行した瞬間に結果が手元にある」とは限りません。  
サーバーに聞きに行ったり、ネットワークを挟んだり、外部サービスの返答を待ったりします。

ここで JavaScript が毎回処理を止めてしまうと、画面が固まります。  
ユーザーからすると、ボタンを押した瞬間にアプリ全体が止まる感じになる。

そこで JavaScript は、

> 時間がかかる処理はいったん投げておいて、終わったら続きの処理をする

という形を取ります。  
この「あとで終わる処理」を扱うための代表が `Promise` です。

---

## Promise は「あとで値が入る箱」

`Promise` は、まだ結果が出ていない処理を表すオブジェクトです。  
僕の中では **「あとで値が入る箱」** というイメージです。

```
const promise = fetch("/api/companies");
```

この時点の `promise` には、まだ会社一覧のデータそのものは入っていません。  
入っているのは **「いつかレスポンスが返ってくる予定」** です。

TypeScript で見ると、だいたいこういう型になります。

```
const promise: Promise<Response> = fetch("/api/companies");
```

`Promise<Response>` は、

> 今すぐ `Response` があるわけではないけど、成功したら最終的に `Response` が返ってくる

という意味です。

ここが最初に詰まりやすいところで、 `Promise<Response>` は `Response` そのものではありません。  
「あとで `Response` になる予定の箱」です。

---

## Promise の状態

`Promise` には大きく3つの状態があります。

| 状態 | 意味 |
| --- | --- |
| `pending` | まだ終わっていない |
| `fulfilled` | 成功して値が返った |
| `rejected` | 失敗してエラーになった |

API 通信で言うと、

- リクエスト送信中 → `pending`
- レスポンス取得成功 → `fulfilled`
- ネットワークエラーなどで失敗 → `rejected`

という感じです。

`Promise` は、成功するか失敗するかが未来に決まる処理を、1つの値として扱えるようにしてくれます。

---

## new Promise<T> で「何が返る予定か」を書く

`Promise` は自分で作ることもできます。

```
const waitOneSecond = new Promise<string>((resolve) => {
  setTimeout(() => {
    resolve("1秒待ちました");
  }, 1000);
});
```

ここでの `Promise<string>` は、

> この Promise は、成功したら最終的に `string` を返す

という意味です。

`resolve("1秒待ちました")` しているので、成功時の値は文字列です。  
だから `Promise<string>` になります。

失敗させたいときは `reject` を使います。

```
const loadUser = new Promise<{ id: string; name: string }>((resolve, reject) => {
  const user = null;

  if (!user) {
    reject(new Error("ユーザーが見つかりません"));
    return;
  }

  resolve({ id: "u_1", name: "YS" });
});
```

ただ、実務では `new Promise` を自分で書く場面はそこまで多くありません。  
`fetch` や DB クライアント、SDK の関数がすでに `Promise` を返してくれることが多いからです。

なので最初は、

> Promise は自分で毎回作るものというより、非同期処理からよく返ってくるもの

くらいで理解しておくとよさそうです。

---

## await は Promise の中身を待つ

`Promise<Response>` のままだと、中身の `Response` を直接使えません。  
そこで `await` を使います。

```
const res = await fetch("/api/companies");
```

これは、

> `fetch` が返す `Promise<Response>` の完了を待って、中身の `Response` を取り出す

という意味です。

TypeScript 的にはこういう変化です。

```
const promise: Promise<Response> = fetch("/api/companies");

const res: Response = await promise;
```

`await` すると、 `Promise<T>` から `T` を取り出せる。  
この感覚がかなり大事です。

---

## async を付けた関数は必ず Promise を返す

`await` は基本的に `async` 関数の中で使います。

```
async function fetchCompanies() {
  const res = await fetch("/api/companies");
  const data = await res.json();
  return data;
}
```

ここで注意したいのは、 `return data` と書いていても、関数全体の戻り値は `Promise` になることです。

```
async function getName() {
  return "YS";
}

const name = getName();
// name は string ではなく Promise<string>
```

`async` を付けた関数は、戻り値を自動的に `Promise` で包みます。  
なので、取り出す側では `await` が必要です。

```
const name = await getName(); // string
```

この仕様を忘れると、「文字列だと思っていたら Promise だった」というミスが起きます。

---

## 実例: 企業一覧を取得する関数

就活支援アプリで企業一覧を取ってくる、という想定で書いてみます。

```
type Company = {
  id: string;
  name: string;
  status: "interested" | "applied" | "interview" | "offer";
};

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch("/api/companies");

  if (!res.ok) {
    throw new Error("企業一覧の取得に失敗しました");
  }

  const companies: Company[] = await res.json();
  return companies;
}
```

ポイントは戻り値の型です。

```
Promise<Company[]>
```

これは「今すぐ `Company[]` が返る」ではなく、

> 非同期処理が成功したら、最終的に `Company[]` が返る

という意味です。

使う側はこうなります。

```
const companies = await fetchCompanies();
// companies は Company[]
```

`await` した瞬間に、 `Promise<Company[]>` から `Company[]` に変わる。  
この変換を頭の中で追えるようになると、非同期処理の型がかなり読みやすくなります。

---

## try / catch で失敗も扱う

非同期処理は失敗します。  
API は落ちるし、ネットワークは切れるし、サーバーは 500 を返します。

なので、ユーザー操作から呼ぶ場合は `try / catch` で扱うことが多いです。

```
"use client";

import { useState } from "react";

type Company = {
  id: string;
  name: string;
};

export function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleLoad = async () => {
    setStatus("loading");

    try {
      const res = await fetch("/api/companies");

      if (!res.ok) {
        throw new Error("failed to fetch companies");
      }

      const data: Company[] = await res.json();
      setCompanies(data);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <button onClick={handleLoad}>企業一覧を読み込む</button>
      {status === "loading" && <p>読み込み中...</p>}
      {status === "error" && <p>読み込みに失敗しました</p>}
      <ul>
        {companies.map((company) => (
          <li key={company.id}>{company.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

`await` している途中でエラーが起きると、そこで `catch` に飛びます。  
同期処理の `try / catch` と似た感覚で書けるのが、 `async / await` のありがたいところです。

---

## よくある詰まりどころ

## 1\. await し忘れる

```
const companies = fetchCompanies();

console.log(companies.length); // ❌ companies は Promise なので length はない
```

正しくはこうです。

```
const companies = await fetchCompanies();
console.log(companies.length);
```

`Promise<Company[]>` と `Company[]` は別物。  
ここを混ぜると TypeScript がちゃんと怒ってくれます。

## 2\. async map は Promise の配列になる

これもかなり詰まりやすいです。

```
const ids = ["1", "2", "3"];

const companies = ids.map(async (id) => {
  const res = await fetch(\`/api/companies/${id}\`);
  const company: Company = await res.json();
  return company;
});
```

この `companies` は `Company[]` ではなく、 `Promise<Company>[]` です。  
`map` の中に `async` 関数を入れると、それぞれが Promise を返すからです。

全部待ちたい場合は `Promise.all` を使います。

```
const companies = await Promise.all(
  ids.map(async (id) => {
    const res = await fetch(\`/api/companies/${id}\`);
    const company: Company = await res.json();
    return company;
  }),
);
```

`Promise.all` は、

> Promise の配列をまとめて待って、成功した値の配列にする

ための関数です。

```
Promise<Company>[] -> Promise<Company[]> -> Company[]
```

という変換が起きている、と見ると分かりやすいです。

## 3\. async 関数の戻り値に Promise を書き忘れる

```
// ❌ async なので Company[] ではない
async function fetchCompanies(): Company[] {
  const res = await fetch("/api/companies");
  return res.json();
}
```

正しくはこうです。

```
async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch("/api/companies");
  const companies: Company[] = await res.json();
  return companies;
}
```

`async` 関数の戻り値型は基本的に `Promise<T>` 。  
これはもうセットで覚えてよさそうです。

---

## then と async / await

`Promise` は `then` でも書けます。

```
fetch("/api/companies")
  .then((res) => res.json())
  .then((companies) => {
    console.log(companies);
  })
  .catch(() => {
    console.log("失敗しました");
  });
```

同じことを `async / await` で書くとこうです。

```
try {
  const res = await fetch("/api/companies");
  const companies = await res.json();
  console.log(companies);
} catch {
  console.log("失敗しました");
}
```

個人的には、処理が増えてくるほど `async / await` の方が読みやすいです。  
上から順番に読めるので、「データを取る → JSON にする → 画面に反映する」という流れを追いやすい。

ただ、どちらも本質は同じで、 `Promise` の完了を待って次の処理につなげています。

---

## 自分なりの理解

ここまでを一言でまとめると、

- `Promise<T>` は **あとで T が返る処理**
- `await` は **Promise<T> から T を取り出す**
- `async` 関数は **戻り値を Promise で包む**
- `Promise.all` は **Promise の配列をまとめて待つ**

という感じです。

最初は `async / await` だけを見ていましたが、実際にはその下に `Promise` があります。  
`Promise` の型を読めるようになると、API通信、DB操作、AI API 呼び出しなどがかなり見通しよくなります。

---

## おわりに

`async / await` は、非同期処理をかなり自然に書ける便利な仕組みです。  
ただ、その裏では必ず `Promise` が動いています。

なので、

> `Promise<T>` は「あとで T になる箱」

と捉えておくと、TypeScript の型エラーにもだいぶ向き合いやすくなる気がします。

次に `fetch` や Supabase、Firebase、AI API のコードを読んだときは、  
「今これは `Promise` の箱なのか、それとも `await` して中身を取り出した後なのか」を意識して読んでいきたいです。

2