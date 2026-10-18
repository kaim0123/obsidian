---
title: "GraphQL API Basics & Best Practices (Explained Simply)"
source: "https://www.youtube.com/watch?v=QHS1AUlBMzY"
author:
  - "[[Hayk Simonyan]]"
published: 2025-06-24
created: 2026-05-17
description: "Become a senior software engineer with a job guarantee: https://go.hayksimonyan.com/125-graphqlLearn how to design clean, flexible, and powerful GraphQL APIs that solve over-fetching, under-fetching"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=QHS1AUlBMzY)

Become a senior software engineer with a job guarantee: https://go.hayksimonyan.com/125-graphql  
  
Learn how to design clean, flexible, and powerful GraphQL APIs that solve over-fetching, under-fetching, and give clients full control over data.  
  
🔖 Sections  
0:00 Problems of REST APIs  
0:34 Why GraphQL Exists (RESTful vs GraphQL APIs)  
1:53 GraphQL Schema Design  
3:22 Queries and Mutations  
4:17 Error Handling  
5:02 Best Practices

## 詳しい要約

**テーマ：GraphQL API の基本（誕生理由・スキーマ・クエリ／ミューテーション・エラー処理・ベストプラクティス）**

REST API はデータを返しすぎたり足りなかったりして 1 画面に複数リクエストが必要になりがちだが、GraphQL はクライアントが要求したものだけを返すことでこれを解決する。ただし設計の考え方は REST と異なるため、スキーマと型システム、クエリとミューテーション、エラー処理、設計のベストプラクティスを約 6 分で解説する。GraphQL が常に REST より優れているわけではない、とも付け加えている。

---

### REST の問題点と GraphQL が生まれた理由

- REST は **返しすぎ（オーバーフェッチ）・足りない（アンダーフェッチ）** が起きやすい
- GraphQL は **Facebook** が作った。user・posts・comments・likes の API を別々に叩いても必要なデータが揃わず、同じ API に何度もリクエストすることになり、全取得が終わるまでページが表示されず **レイテンシ** が積み上がる、という問題を解決するため
- GraphQL は **単一エンドポイント**。通信は HTTP のままだが、クライアントが **レスポンスの形を指定** する（例: ID 123 のユーザーの name と、posts の title だけ。画像は不要）

### スキーマ設計と型システム

- **スキーマ** はクライアントとサーバーの **契約**
- **型（type）**: 例えば `User` 型に id・name・posts などのフィールドを定義。posts のようにプリミティブでないものは `[Post]` として別に `Post` 型を定義する
- **Query**: データの読み取り（REST の GET 相当）。例: ID を受け取り `User` 型を返す `user` クエリ
- **Mutation**: データの変更（REST の POST・PUT・PATCH・DELETE 相当）。例: name を受け取り `User` を返す `createUser`
- 良いスキーマは **ドメインモデルを反映** し、直感的で柔軟

### クエリとミューテーションの使い方

- Query: スキーマで定義した `user` を呼び、name・posts の title など欲しい属性だけを指定すると、その通りのデータが返る
- Mutation: `createPost` で title と body を設定し、作成後に受け取りたいデータ（id・title）も同時に指定できる

### エラー処理

- GraphQL は **エラーでも常に 200 OK** を返す
- そのためレスポンスに **`errors` フィールド** を含めてエラーを示す
- **部分的なデータ** とエラーを同時に返せる（例: `user` が null、`errors` にステータス 404・message「not found」・path「user」）
- ステータスコードは `errors` の中に明記して、何のエラーかわかるようにする

### ベストプラクティス

- スキーマは **小さくモジュール化** する
- **深いネストを避ける**（user → posts → comments … と無限にネストできてしまう）ため、**クエリ深度制限** を設ける（6〜7 階層程度）
- 型とフィールドには **意味のある名前** を付ける（クライアントも同じスキーマを使うため）
- ミューテーションには **input 型** を使う

### まとめ

- GraphQL は単一エンドポイントで、クライアントが必要なデータの形を指定できる
- スキーマ（型・Query・Mutation）が契約になり、ドメインモデルを映すように設計する
- エラーは HTTP ステータスではなく `errors` フィールドで判断する
- GraphQL が常に正解ではなく、REST との使い分けが必要

## Transcript

### 日本語要約（詳細）

本動画は、GraphQL API の**設計思想・スキーマ・クエリ／ミューテーション・エラー処理・ベストプラクティス**を、REST との対比を交えながら解説する入門講義である。GraphQL は「常に REST より優れている」わけではなく、クライアントが必要なデータの形を指定できる場面で威力を発揮する。

#### REST API の問題点（オーバーフェッチ／アンダーフェッチ）

従来の RESTful API では、次のような不整合が起きやすい。

- **オーバーフェッチ**：1 つのエンドポイントが、画面に不要なフィールドまでまとめて返す
- **アンダーフェッチ**：1 画面を描画するのに、複数エンドポイントへの**複数リクエスト**が必要

その結果、クライアントは同じ API に何度も問い合わせたり、レスポンスの不要部分を捨てたりする。GraphQL はクライアントが**要求したフィールドだけ**を返すことで、この問題を緩和する。ただし GraphQL の設計は REST とは考え方が異なるため、スキーマ設計やエラー表現などを別途学ぶ必要がある。

#### GraphQL が存在する理由（Facebook 発の動機）

GraphQL は Facebook が、次のペインを解消するために作った。

- クライアントが **user / posts / comments / likes** など複数 API を個別に叩いても、画面に必要なデータが揃わない
- 同じ API への**繰り返しリクエスト**が増え、ページ全体の**レイテンシ**が悪化する（すべての取得が終わるまで画面が完成しない）

GraphQL では**単一の GraphQL エンドポイント**に対し、クライアントが**レスポンスの形（フィールドのツリー）**を指定する。通信は依然として HTTP だが、例えば「ID 123 のユーザー」の「name のみ」「posts の title のみ」のように、ビュー単位で必要なデータだけを取れる。コメントなどネストしたオブジェクトでも、取得フィールドを細かく指定できるため、オーバーフェッチを抑えられる。

#### スキーマ設計と型システム

GraphQL の**スキーマ**はクライアントとサーバー間の**契約（contract）**である。REST の「エンドポイントごとの暗黙の形」ではなく、スキーマに型と操作が明示される。

| 概念 | 役割 | REST との対応（ざっくり） |
|------|------|---------------------------|
| **型（Type）** | `User` などドメインオブジェクトとそのフィールド（`id`, `name`, `posts` など）を定義 | レスポンス DTO の構造 |
| **ネストした型** | `posts` がプリミティブでなければ `Post` 型を別定義し、`[Post]` のように参照 | 関連リソースの埋め込み |
| **Query** | データの**読み取り**（例：`user(id: …)` → 戻り値 `User`） | GET |
| **Mutation** | データの**変更**（例：`createUser(name: …)` → 戻り値 `User`） | POST / PUT / PATCH / DELETE |

良いスキーマは**ドメインモデルを反映**し、直感的で拡張しやすいことが目標である。型と Query／Mutation の名前・戻り値が一貫していると、クライアントもサーバーも同じスキーマを「共通言語」として使える。

#### クエリとミューテーション（クライアント側の使い方）

スキーマ定義後、クライアントは GraphQL のクエリ文字列で操作する。

**Query（取得）**

- スキーマで定義した `user` などを呼び出し、必要なフィールドだけ列挙する（例：`name`, `posts { title }`）
- 1 リクエストで、指定した形の JSON が返る

**Mutation（更新）**

- 例：`createPost` に `title`, `body` を渡して投稿を作成
- 作成後に欲しいフィールド（例：`id`, `title`）も**同じミューテーションのレスポンスで指定**できる（REST では別 GET が要ることも多い）

#### エラー処理（REST との大きな違い）

GraphQL では、**エラーがあっても HTTP ステータスは多くの場合 200 OK** のまま返る。成功／失敗の判定はレスポンスボディの **`errors` 配列**を見る。

- **部分的成功**：一部のフィールドは取得でき、`user` が `null` の一方で `errors` に詳細が載る、といった形もありうる
- `errors` には、REST で使っていたような情報を載せる慣習がある
  - **`message`**（例：Not found）
  - **`path`**（スキーマ上のどのフィールドで失敗したか、例：`user`）
  - **`extensions` などに HTTP 相当のステータス**（例：404）を含める

クライアント実装では「HTTP 200 だから成功」とは見なさず、**`errors` の有無と内容**を必ずチェックする必要がある。

#### ベストプラクティス

| プラクティス | 内容 |
|-------------|------|
| **スキーマを小さくモジュール化** | 巨大な単一スキーマより、ドメインごとに分割・合成しやすい形にする |
| **深いネストを避ける** | `user → posts → comments → …` の無限ネストは N+1 や負荷の温床になりやすい |
| **クエリ深度制限（depth limiting）** | 例：6〜7 レイヤーまでなど、サーバー側でネストの深さに上限を設ける |
| **型・フィールド名を意味のある名前に** | クライアントも同じスキーマを読むため、命名が API の UX になる |
| **Mutation には Input 型を使う** | 引数をまとめた `CreateUserInput` のような入力型で、変更操作の引数を構造化する |

#### まとめ：GraphQL を選ぶとき

GraphQL は**クライアント主導でレスポンス形を決めたい**、**往復回数とオーバーフェッチを減らしたい**複雑な UI向き。一方でキャッシュの単純さ、ファイルアップロード、既存 REST インフラとの親和性などでは REST が有利なことも多い。動画末尾では、**REST と GraphQL の pros/cons と選定基準**を別動画で扱うよう促している。

---

### REST APIの問題点

**0:00** · Traditional restful APIs often return too much or too little data which requires us to do multiple requests for a single view to get all the data that we need. GraphQL solves this issue by giving clients exactly what they requested for. But designing GraphQL APIs is different from designing restful APIs. That's why in this video we'll cover the core concepts of GraphQL and why it exists. the schema design and type system of GraphQL, queries and mutations, error handling, and also best practices for designing GraphQL APIs.

### GraphQLが存在する理由 (RESTful API vs GraphQL API)

**0:34** · Let's start by understanding why GraphQL exists in the first place. It was created by Facebook to solve a very specific pain, which is clients needing to make multiple API calls and still not getting the exact data that they needed.

**0:48** · For example, if you imagine we have the Facebook APIs like user API, posts API, comments and likes for the Facebook page. Most of the times client can make requests to all of these APIs separately and still not get all the data that it needs which will require it to do multiple requests to the same API. This of course adds up to the overall latency of the page because the page is still not loaded until all of these requests are made and the data is fetched.

**1:15** · But in case of GraphQL APIs, you have a single GraphQL endpoint. So the client specifies the shape of the response and this one endpoint handles all of the data interactions. It is still an HTTP request, but as you can see, we can specify the exact data that we need. For example, we need the user with ID 1 2 3 and we need only the name of the user also posts and from the posts we can specify only title. So we don't need the images for this view.

**1:44** · And again with the comments you can specify the exact data that you need within the object so that you are not doing overfetching of the data. Now let's see the schema design and type system of GraphQL and how it's different from restful APIs. The schema in this case is a contract between the client and server. In schema, first of all, you have types which can be for example user type that you specify and you specify all the fields that exist on this user type which are id, name, posts and so on.

### GraphQLスキーマ設計

**2:14** · And as you can see if the type is not a primitive type like posts then you can specify another type of post array and then this post type can be defined separately. Next we have queries to read data. So this is the equivalent of doing get requests in restful API. You specify the query and the function of this query. This can be the user query which fetches the user with specific ID and also the return type of this query which in this case is the user type that we defined above.

**2:44** · And GraphQL also come with mutations. You can think of this as the equivalent to post, put, patch and delete methods in restful APIs. So anytime you are mutating a data in the database you are making a mutation query here as you can see we have an example of create user method which accepts name and of course many things in real world and then it returns the user type that we have defined above.

**3:10** · So if you have good schema design in graphql it should mirror your domain model and it should be intuitive and flexible. Next, once you defined the schema design and type system, you can start querying and mutating data with this GraphQL API. For that, we have queries for fetching data.

### クエリとミューテーション

**3:30** · Again, this is like the get requests in restful APIs. And here you can specify exactly what you need from the user.

**3:36** · This is the same user method that we defined there in the schema. So here you can also specify the exact attributes like the name posts and from posts you need the title only and this will make a request to your graphql API and return the exact data that you requested.

**3:53** · Similarly you can also use the mutations that you defined. For example, if you have a create post method defined as a mutation, you can use this to mutate the post. for example, setting the title and body of the post. And then you also specify what data you need to retrieve after this post is created, which is ID and title. When it comes to error handling in GraphQL APIs, this is a bit different than in restful APIs since GraphQL always returns 200 okay status for all responses even if there was an error.

### エラー処理

**4:24** · In this case, we have to return errors field in the response which will indicate that there was an error. So partial data can still be returned with errors like in this case we have the user which is null and then we have the errors field which indicates that you have the status code 404 message not found and path which is the user in your schema. As you can see in this case you can specify the status code in the errors array.

**4:49** · Since we are returning 200 status codes for all GraphQL requests, that's why we have the status codes specifically mentioned in the errors so that we know what kind of error this is, which is user not found. There are also best practices that we normally follow when designing GraphQL APIs. First of all, the schemas that we saw, it's a good practice to keep them small and modular. Also, we should avoid deeply nested queries. For example, you can have a user and then nested post and then within the post you can have a comment.

### ベストプラクティス

**5:20** · So this can be infinitely nested. And to avoid that, we usually implement query limit depths which is how dep you can go like how many layers nested you can have in your data. So you specify something like six or seven layers deep. We also use meaningful naming for types and fields so that it also makes from the client side because they both are going to use the same schema. And when mutating data, we always use the input types for mutations.

**5:48** · And looking at this, you might think that GraphQLs are always the better solution over restful APIs, which is not the case at all. So, I'd recommend you watch this video next where I talk about the pros and cons of each and when to go with REST APIs and when to go with GraphQL APIs.