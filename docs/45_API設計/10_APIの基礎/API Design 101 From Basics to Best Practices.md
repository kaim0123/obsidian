---
title: "API Design 101: From Basics to Best Practices"
source: "https://www.youtube.com/watch?v=pH7ZT9cOL0k"
author:
  - "[[Hayk Simonyan]]"
published: 2025-04-23
created: 2026-05-17
description: "Become a senior software engineer with a job guarantee: https://go.hayksimonyan.com/119-api-designLearn the fundamentals of API design and best practices to build clean, scalable, and secure APIs."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=pH7ZT9cOL0k)

Become a senior software engineer with a job guarantee: https://go.hayksimonyan.com/119-api-design  
  
Learn the fundamentals of API design and best practices to build clean, scalable, and secure APIs.  
  
🔖 Sections  
0:00 What is an API?  
1:38 Core API Styles  
4:30 REST vs GraphQL  
7:32 API Protocols  
8:53 Design Process  
10:45 API Lifecycle Management  
  
#apidesign #systemdesign #api

## 詳しい要約

**テーマ：API 設計の入門（API とは・3 つのスタイル・プロトコル・設計プロセス・ライフサイクル）**

API をソフトウェア同士の連携を定める「契約」と位置づけ、REST・GraphQL・gRPC の 3 スタイルの特徴と使い分け、プロトコル選択の影響、設計の進め方、そして設計から廃止までのライフサイクルを約 12 分で解説する。結論は「API 開発はコードを書くことだけではなく、設計・保守・廃止まで含めて考えるもの」。

---

### API とは何か

- クライアントとサーバーの間で「どんなリクエストを送れるか」「どんなレスポンスが返るか」を定める **契約（contract）**
- 内部実装を隠して機能だけを公開する **抽象化** の仕組み
- ユーザー管理・投稿管理などのサーバー間に **サービス境界** を引き、実装技術が違っても通信できるようにする

### 主要な 3 つの API スタイル

| スタイル | 特徴 | 向いている用途 |
|---|---|---|
| **REST** | リソース指向、HTTP メソッド（GET/POST/PUT・PATCH/DELETE）、**ステートレス** | Web・モバイルで最も一般的 |
| **GraphQL** | クエリ言語、単一エンドポイント、query / mutation / subscription | 複雑な UI、往復回数を減らしたいとき |
| **gRPC** | Protocol Buffers を使う高性能 RPC、ストリーミング・双方向通信 | マイクロサービス間・社内システム間 |

### REST と GraphQL の違い

- REST: リソース単位のエンドポイント、関連データ取得に **複数リクエスト** が必要、レスポンス構造は固定、`/v1/` `/v2/` の **明示的バージョニング**、**HTTP キャッシュ** を活用できる
- GraphQL: `/graphql` などの **単一エンドポイント**、1 リクエストで必要なフィールドだけ取得、クライアントがレスポンス構造を指定、スキーマは **バージョンなしで進化**（`followersV2` のようにフィールド単位で版を分けることも）、**アプリケーションレベルのキャッシュ** が中心

### プロトコルの選択

- **HTTP**: REST・GraphQL の土台。ステータスコードが CRUD と相性がよい
- **WebSocket**: チャットや動画配信などのリアルタイム・双方向通信
- **gRPC**: マイクロサービス間を HTTP より高速にする
- プロトコルの選択が API の構造・性能・機能を左右するので、強みと制約で選ぶ

### 設計プロセス

1. **要件の理解**: コアユースケース・ユーザーストーリー、スコープと境界、性能要件とボトルネック、セキュリティ（認証・認可・レート制限）
2. **設計アプローチ**
   - **トップダウン**: 高レベル要件からエンドポイントを定義（面接で多い）
   - **ボトムアップ**: 既存のデータモデル・機能から設計（企業の既存システムで多い）
   - **コントラクトファースト**: 実装前にリクエスト／レスポンスの契約を決める

### API ライフサイクル

1. 設計 → 2. 開発・ローカルテスト → 3. デプロイ・監視（ステージング／本番） → 4. メンテナンス（**シンプルさ** が保守を楽にする） → 5. **非推奨化・廃止**（v1→v2 移行など）

### まとめ

- API は「契約」であり、抽象化とサービス境界の役割を持つ
- 一般的な Web は REST、複雑な UI は GraphQL、サーバー間の高速通信は gRPC
- 要件理解 → 設計アプローチ選択 → ライフサイクル全体を見据えた保守・廃止計画までが API 設計

## Transcript

### 日本語要約（詳細）

本動画は、API（Application Programming Interface）の基礎から設計・運用のベストプラクティスまでを、REST・GraphQL・gRPCの3スタイルを軸に解説する入門講義である。

#### APIとは何か

APIは、ソフトウェアコンポーネント同士がどうやって連携するかを定める**契約（contract）**である。典型的には、クライアント（ブラウザやモバイルアプリ）とサーバーが向き合い、次のことを規定する。

- **どんなリクエストが送れるか**（エンドポイント、HTTPメソッドなど）
- **どんなレスポンスが返るか**（エンドポイントごとの期待値）

APIは**抽象化の仕組み**でもある。利用者は「ユーザーを保存する」といった機能だけを呼び出し、サーバー内部の実装（DB設計、ビジネスロジックなど）を知る必要がない。

また**サービス境界**を明確にする。ユーザー管理用サーバー、投稿管理用サーバーなど、責務ごとにシステムを分けつつ、クライアント↔サーバー、サーバー↔サーバーの通信を、実装技術が違っても可能にする。

#### 主要な3つのAPIスタイル

| スタイル | 特徴 | 向いている用途 |
|---------|------|----------------|
| **REST** | リソース指向、HTTPメソッド（GET/POST/PUT/PATCH/DELETE）、ステートレス | Web・モバイルで最も一般的 |
| **GraphQL** | クエリ言語、単一エンドポイント、必要なフィールドだけ取得 | 複雑なUI、ネストしたデータ、往復回数の削減 |
| **gRPC** | 高性能RPC、Protocol Buffers、ストリーミング・双方向通信 | マイクロサービス間・社内システム間の高速通信 |

**REST**は各リクエストに処理に必要な情報がすべて含まれる**ステートレス**設計が特徴。HTTPの標準メソッドでCRUDを表現するため、学習コストが低く普及している。

**GraphQL**は操作を **query**（取得）、**mutation**（更新）、**subscription**（リアルタイム）に分ける。RESTで3回必要な取得を1リクエストにまとめられるため、画面ごとに必要なデータが異なる**複雑なフロントエンド**向き。

**gRPC**は3つの中では相対的にニッチだが、サーバー間通信ではHTTPベースより効率が高い。protoファイルでRPCを定義し、ストリーミングにも対応する。

#### RESTとGraphQLの実務的な違い

**REST**

- エンドポイントがリソース単位（`/users`、`/users/{id}/posts`、`/followers` など）
- 関連データ取得で**複数リクエスト**（N+1に近いクライアント側の往復）が発生しやすい
- レスポンス構造は**固定**（同じエンドポイントなら同じ形）
- **明示的バージョニング**（`/v1/`、`/v2/`）が一般的
- **HTTPキャッシュ**（ヘッダー）を活用しやすい

**GraphQL**

- 多くの場合 **`/graphql` など単一エンドポイント**
- クエリ内で必要なフィールドだけ指定（例：ユーザー名、投稿の title/content、フォロワー名のみ）
- クライアントが**レスポンス構造を指定**するため、オーバーフェッチ・不足取得を抑えられる
- スキーマは**バージョン番号なしで進化**することも多い（フィールド単位の `followersV2` なども可）
- 変更がクライアントに波及しうるため、**アプリケーションレベルのキャッシュ**が中心になりがち

選び方の目安：シンプルなCRUDとキャッシュ重視ならREST。1画面で多様な・ネストしたデータが必要ならGraphQL。

#### プロトコル選択が設計を左右する

APIスタイルとセットで考えるべき**トランスポート層**の例：

- **HTTP**：REST・GraphQLの土台。ステータスコードと相性が良く、CRUDの成功・失敗を表現しやすい
- **WebSocket**：双方向・リアルタイム（チャット、配信など）
- **gRPC（HTTP/2上）**：マイクロサービス間で低レイテンシ・高スループットを狙う場合

プロトコルは**パフォーマンス、リアルタイム性、キャッシュ、運用の複雑さ**に直結する。作るAPIの種類と制約に合わせて先に決める。

#### API設計プロセス

1. **要件の理解**
   - コアユースケース・ユーザーストーリーの洗い出し
   - **スコープと境界**（初回リリースに含める／含めない機能）
   - 性能要件と**ボトルネック**の想定
   - **セキュリティ**：認証・認可・レート制限を最低限、必要に応じて追加

2. **設計アプローチ**
   - **トップダウン**：高レベル要件→エンドポイント・操作の定義（面接や新規設計で多い）
   - **ボトムアップ**：既存データモデル・能力からAPIを導く（既存システム拡張で多い）
   - **コントラクトファースト**：実装前にリクエスト／レスポンスの契約を固定（トップダウンに近く、チーム開発・面接でもよく使われる）

#### APIライフサイクル

API開発は「コードを書く」だけではない。

1. **設計** — 要件・期待成果の合意
2. **開発・ローカルテスト**
3. **デプロイ・監視** — ステージング／本番での検証
4. **メンテナンス** — 最初から**シンプル**に保つと、自分・他者の保守が楽になる
5. **非推奨（deprecation）・廃止（retirement）** — v1→v2移行時に旧APIを段階的に止める

長期運用を見据え、設計・保守性・廃止計画まで含めて考えることが、スケーラブルで安全なAPIにつながる。

---

### APIとは？

**0:00** · API stands for application programming interface which defines how software components should interact with each other. Let's say on one side you have the client which is either the mobile phone or the browser of this user and on the other side you have the server which will be responding to the requests. So API here is just a contract that defines these terms which are what requests can be made. So it provides us with an interface on how to make these requests meaning what endpoints do we have what methods can we use and so on.

**0:29** · Also what responses can we expect from this server for a specific endpoint. So first of all it is an abstraction mechanism because it hides the implementation details while exposing the functionality. For example, we can make a request to save a user data in this server, but we don't care at all about how the logic applies behind the scenes inside of this server.

**0:56** · So, we only care about the interface that is provided through this API and we only use that endpoint and we store the user without even knowing about the implementation details. And it also sets the service boundaries because it defines clear interfaces between systems and components. So this allows us to have multiple servers. We can have one server that is responsible for managing the users. We can have another one that is responsible for some other records.

**1:24** · Let's say for managing the posts and so on. So this allows different systems to communicate regardless of their underlying implementation like client browsers with servers or servers with another servers and so on. Now let's focus on the most important API styles you will encounter during the design phase. These are RESTful, GraphQL, and gRPC. The most common one out of these is REST, which stands for representational state transfer.

### コアAPIスタイル

**1:52** · These type of APIs use resource-based approach by using the HTTP methods as a protocol.

**2:01** · One of the advantages of REST APIs is that they are stateless, meaning that each request contains all of the information needed to process it and we don't need any prior requests to be able to process the current request. And it uses the standard methods on HTTP protocol which are get for fetching data, post for storing data, put or patch for updating data and delete for deleting data. So based on its characteristics, the rest is most commonly used in web and mobile applications.

**2:32** · Next we have GraphQL which is the second most common API style after the rest APIs. GraphQL is a query language that allows clients to request exactly what they need. This means that it comes with a single endpoint for all of the operations and we can choose what we are expecting to receive from this API by providing the payload in the request. And the operations here are called query whenever we are retrieving data or mutation whenever we are updating data.

**3:03** · So this is the equivalent in put or patch or post in the restful APIs. And there is also a subscription in operations which is for realtime communication. The advantage of GraphQL APIs is that it allows us to have minimal round trips. Let's say we need some data that in restful APIs we will need to make three requests to get all of this data.

**3:25** · In graphql case we can make a single request and get all of these data avoiding the unnecessary two requests that we will otherwise have to make in restful. And because of that this is the recommended option for complex UIs. So wherever you have some complex UIs where on one page you might need different data on another page you might need some other complex nested data in these cases graphql is the better choice over restful APIs and the last option is gRPC. I would say this is the least common one out of these three.

**4:00** · GRPC is a high performance RPC framework which is using protocol buffers for communication.

**4:07** · The methods in gRPC are defined as RPCs in the protoiles and it supports streaming and birectional communication.

**4:16** · This is an excellent approach for microservices especially and internal system communication as it is more efficient when you're working between servers compared to graphql or compared to restful APIs. So the difference between REST GraphQL and gRPC APIs is kind of clear, but let's also clarify the real difference between REST and GraphQL APIs on examples. So as you saw, REST comes with resource-based endpoints. For example, here if we take a look at these requests, you can see that the resource here is users.

### REST vs GraphQL

**4:47** · So you always expect to see some users endpoint or some followers endpoint or let's say posts endpoint. So it is resource-based.

**4:58** · And sometimes we might need to make multiple requests for getting the related data. As you can see here, we need let's say the user details, but we also need the user posts and followers.

**5:10** · So in this case, we need to make free requests to get all of these data. And it uses HTTP methods to define operations. As you can see, these are HTTP endpoints. And we are using the get method specifically. And the response structures are fixed. Meaning if you got one response for this specific user, next time you can expect to have exactly the same response structure, maybe some data will be modified but the structure always remains the same. And it also provides explicit versioning.

**5:38** · So as you can see it comes with v1 for the v1 API then later if it got a major upgrade then this will become v2 and so on. And you can use the headers on the requests to leverage the http caching on restful APIs. Now if we compare that to GraphQL APIs, it comes with a single endpoint for all operations. So mostly it is slashgraphql or slome API endpoint that is commonly used for all operations.

**6:06** · And in this case we will use a single request to get the precise data that we need and we will use the query language of GraphQL. This is what the query language looks like. As you can see we start with a query and then we define what we need. For example, we need the user with ID 1 2 3. Then we need the name of the user, the posts, and then we define whatever we need from the posts.

**6:32** · Maybe we need only title and content and nothing more. And also the followers and what we need from followers, maybe only names. So this allows us to be more efficient in our requests compared to restful APIs where we will need to make free requests for this same data. This means that client needs to specify the response structure and in this case the schema evolution is without versioning.

**6:57** · So here as you saw it is with v\_sub\_1, v\_sub\_2 and so on. In this case the schema usually evolves without versioning. But there is also a common pattern to start versioning the fields.

**7:09** · For example, you can have followers v2 and that will be the second type of followers schema. But you can also go without versioning. So you can just start modifying the followers or posts if you are sure that there are no other clients using your old API and in this case you can leverage the application level caching instead of the HTTP caching.

### APIプロトコル

**7:32** · Now each of these APIs use different protocols and we will learn more about these in the next lesson but basically your protocol choice will fundamentally shape your API design options. For example, the features of HTTP protocol directly enable restful capabilities. So it makes more sense to use HTTP along with restful APIs because it also provides you with status codes and these are great to be used with crowd operations that you will have in restful APIs.

**8:02** · On the other hand, web sockets which is another type of protocol enable realtime data. So this can be used along with realtime APIs.

**8:13** · Wherever you need some chat application or some video streaming, this is a good use case of websocket APIs. In case of graphql APIs, you again will use the HTTP protocol instead of websockets or gRPC. GRPC on the other hand can be used among with microservices in your architecture to make it faster compared to HTTP. So your protocol choice will affect the API structure and also the performance and capabilities.

**8:42** · Therefore, you should choose it based on its limitations and strengths and the one that makes more sense in the type of API that you'll be developing. Now let's discuss the API design process. It all starts with understanding the requirements which is identifying core use cases and user stories that you will need to develop.

### 設計プロセス

**9:04** · also defining the scope and boundaries because if it's a huge API then you probably won't develop all of the features at once. So you should scope it to some specific features that you'll be developing and also what are out of scope for now. Then you should determine the performance requirements and specifically in your API case what will be the bottlenecks and where you need to make sure that it's performant and you should also not overlook the security constraints.

**9:33** · So you should implement all of the basic features like authentication, authorization, the rate limiting but maybe some more stuff depending on the API that you'll develop. When it comes to design approaches, there are couple of ways to go about it. The first one is top-down approach which is you start with highle requirements and workflows.

**9:52** · This is more common in interviews where they give you the requirements on what the API will be about and then you start defining what the endpoints will be, what the operations will be and so on. But there is also the bottom up approach which is if you have existing data models and capabilities then you should design the API based on this. So this is more common when you're working in a company and they already have their data models and capabilities of their APIs.

**10:21** · So you should take that into account when designing the API. And we also have contract first approach which is you define the API contract before implementation meaning what the requests should look like and what the responses should look like. And this is more similar to top-down approach and this is also commonly used in interviews.

**10:42** · When it comes to life cycle management of APIs, it starts with the design phase where you design the API, discuss the requirements and the expected outcomes of the API and only after that you can start the development and maybe local testing of your API. After that you usually deploy and monitor it. So you do some more testing but now on staging or on production. But then it also comes the maintenance phase.

### APIライフサイクル管理

**11:12** · And this is why it's important to develop it with keeping the simplicity in place. So it will be easier for you to maintain or for other developers to maintain in the future. And lastly, APIs also go through deprecation and retirement phase. So some APIs eventually get deprecated because there might come up with a new version of the API that you should use.

**11:36** · Or let's say you are transitioning from v1 to v2 API. So that's also the deprecation phase of the v1 API. So developing APIs is not only in the development phase as you might assume.

**11:49** · It's not just coding. So the big part of it is designing it and also keeping it maintainable and also eventually you might need to retire it at the