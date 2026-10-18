---
title: "REST API Basics & Best Practices Explained"
source: "https://www.youtube.com/watch?v=DkSeXHS0kAQ"
author:
  - "[[Hayk Simonyan]]"
published: 2025-06-09
created: 2026-05-17
description: "Become a senior software engineer with a job guarantee: https://go.hayksimonyan.com/124-rest-apiLearn what REST APIs are, how they work, and the essential best practices you need to follow to design"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=DkSeXHS0kAQ)

Become a senior software engineer with a job guarantee: https://go.hayksimonyan.com/124-rest-api  
  
Learn what REST APIs are, how they work, and the essential best practices you need to follow to design clean, scalable APIs.  
  
🔖 Sections  
0:00 What are RESTful APIs  
0:46 Resource Modeling  
2:33 Filtering, Sorting and Pagination  
6:10 HTTP Methods  
9:25 Status Codes and Error Handling  
12:04 Best Practices

## Transcript

## 日本語要約

この動画では、**RESTful API**の設計原則と実務で使う**ベストプラクティス**を解説する。REST APIはシステムの各部分が**標準のHTTPメソッド**で通信するための方式であり、今日の開発で最も一般的なAPIスタイルである。一貫性のないURLや動詞ベースの設計は、利用・保守を難しくするため、動画では**リソース指向のモデリング**から**フィルタ・ソート・ページネーション**、**HTTPメソッド**、**ステータスコードとエラー処理**、**バージョニング**までを順に扱う。

---

### RESTful APIとは

- クライアントとサーバーが**HTTP**上でやり取りし、**リソース**をURLで表現する。
- 「RESTful」とは、リソースの識別、HTTPメソッドの適切な利用、ステートレスな通信など、RESTの制約に沿った設計を指す（動画では実装寄りのベストプラクティスに焦点）。
- 目的は、**予測可能で一貫したAPI**を作り、フロントエンド・他サービス・外部開発者が迷わず使えるようにすること。

---

### リソースモデリングとURL設計

ビジネスドメイン（例：商品・注文・レビュー）をAPIに落とすとき、**動詞ではなく名詞**でリソースを表す。

| 概念 | 悪い例 | 良い例 |
|------|--------|--------|
| 商品一覧 | `GET /getProducts` | `GET /products` |
| 特定商品 | — | `GET /products/{id}` |
| 注文 | `GET /getOrders` | `GET /orders`（メソッドで取得・作成を区別） |

**コレクションと個体**

- `/products` → 商品の**コレクション**（複数件）
- `/products/{id}` → **単一リソース**

**ネストしたリソース**

- 特定商品のレビュー: `GET /products/{productId}/reviews`
- 親子関係がURLから読み取れるようにする。

**HTTPメソッドと役割の対応**

- 同じパス `/orders` でも、`GET`なら一覧取得、`POST`なら新規作成、と**メソッドが操作の意味**を担う。URLに `getOrders` のような動詞を入れない。

---

### フィルタリング・ソート・ページネーション

実APIでは全件を一度に返さない。クエリパラメータ（`?` 以降）で必要なデータだけ取得する。

#### フィルタリング

例: `GET /products?category=electronics&inStock=true`

- カテゴリや在庫などで絞り込み、UIに必要な行だけ返す。
- 帯域・レスポンスサイズ・フロントの処理負荷を抑える。

#### ソート

例: `GET /products?sort=price`（昇順／降順はAPIの規約で定義）

- DBに数千件あっても、**サーバー側でソート**してから返す。
- 全件取得してクライアントで並べ替えるのは非効率。

#### ページネーション

| 方式 | 例 | 説明 |
|------|-----|------|
| **page + limit** | `?page=2&limit=10` | 2ページ目から最大10件。`limit`がないと「2ページ目以降すべて」になり得るので注意。 |
| **offset + limit** | `?offset=20&limit=10` | 先頭から何件スキップするか（offset）と件数上限。 |
| **cursor** | `?cursor=...` | カーソル（例：ページ位置のハッシュ）で次ページを取得。大量データやリアルタイム更新向き。 |

**メリット**: 帯域節約、サーバー・クライアント双方のパフォーマンス向上、フロントが「必要な分だけ」取得できる柔軟性。

---

### HTTPメソッド（CRUD）

REST APIはHTTPのメソッドで**CRUD**を表現する。

| メソッド | 用途 | 例 | 安全性・冪等性（動画の要点） |
|----------|------|-----|------------------------------|
| **GET** | 読み取り | `GET /api/v1/products` | **Safe**（状態を変えない）、**冪等**（同じリクエストで同じ結果。DB更新がなければ） |
| **POST** | 作成 | `POST /api/v1/products` | サーバー状態を**変更**、**非冪等**（呼ぶたびに新リソース・新ID） |
| **PUT** | 全体置換 | `PUT /api/v1/products/{id}` | リソースを**丸ごと**置き換え |
| **PATCH** | 部分更新 | `PATCH /api/v1/products/{id}` | 送ったフィールドだけ更新（例：タイトルのみ） |
| **DELETE** | 削除 | `DELETE /api/v1/products/{id}` | ボディなしで対象リソースを削除 |

URLの形は ` /api/{version}/{resource}` や `.../{id}` が典型。PUTとPATCHは同じパスでも、**全体更新か部分更新か**で使い分ける。

---

### ステータスコードとエラー処理

成功・失敗・リダイレクトを、**意味のあるHTTPステータス**で返す。

#### 2xx（成功）

| コード | 意味 | 使い分けの例 |
|--------|------|----------------|
| **200 OK** | 成功（一般的） | `GET /products/{id}` で商品を取得できたとき |
| **201 Created** | リソース作成成功 | `POST /products` で新規商品を作ったとき（200ではなく201） |
| **204 No Content** | 成功だがボディなし | 削除や更新で返す本文がない場合など |

#### 3xx（リダイレクト）

- URLが移動したときなど、新しい場所へ誘導する。

#### 4xx（クライアントエラー）

| コード | 意味 | 例 |
|--------|------|-----|
| **400 Bad Request** | リクエストが不正 | 不正なクエリ、壊れたJSON |
| **401 Unauthorized** | 未認証 | ログイン・トークンが必要な操作 |
| **404 Not Found** | リソース不存在 | 存在しない `productId` を指定したとき（400ではなく404） |

パラメータ形式の誤りは **400**、正しい形式だが該当IDがDBにないのは **404** と区別する。

#### 5xx（サーバーエラー）

- クライアントは正しいが、サーバー内部で予期しない障害が起きたとき（例：**500**）。原因の詳細はログに残し、レスポンスは過度に内部情報を漏らさない設計が望ましい。

---

### ベストプラクティス（まとめ）

1. **複数形の名詞** — `/product` ではなく `/products` でコレクションを表す。
2. **HTTPメソッドを正しく使う** — 削除は `DELETE /users/{id}` とし、`POST /users/{id}/delete` のような擬似アクションURLを避ける。
3. **フィルタ・ソート・ページネーションを揃える** — ページ番号だけでなく `limit`、ソート条件も指定できるAPIにする（例：`page=3&limit=10&sort=price`）。
4. **APIバージョニング** — パスに `/api/v1`、`/api/v2` などを付ける。後方互換を壊す変更をしても、既存クライアントは旧バージョンを使い続けられる。
5. **一貫したURLとステータス** — リソース名・ネスト・エラーコードのルールをドキュメント化し、チーム全体で守る。

動画の締めくくりでは、REST以外のAPIスタイル（GraphQL、gRPC など）について別動画で学ぶよう案内している。

---

### RESTful APIとは

**0:00** · Restful APIs let different parts of a system talk to each other using the standard HTTP methods. They are the most common way developers build and consume APIs today. And in this video, you'll learn how to design clean REST APIs by following the proven best practices so that you avoid creating messy and inconsistent patterns that make the APIs hard to use and maintain.

**0:22** · We'll start by learning about the architectural principles and constraints of restful APIs about the resource modeling and URL design. Also the status codes and the error handling as well as filtering, sorting and so on. And we learn the best practices when using and developing restful APIs. Let's start from the resource modeling. Resources are the core concepts in REST. Let's say you have the business domain which consists of the products, orders and reviews.

### リソースモデリング

**0:57** · When modeling this to a restful API, you usually convert these into nouns and not verbs. Meaning that the product becomes products, order becomes orders. And same for the reviews. These can be collections or individual items. For example, this first request which is to / API/ products will return you the collection of products, not a single product. But on the other hand, you could have slash products and slashsp specific ID of a product which will return you the individual item.

**1:27** · And notice that we are using slash products when retrieving the collection of products. And we are not using something like get products which will be not a best practice in restful APIs. As I mentioned, we are using nouns here and not verbs. So to fetch orders for example, you don't define the URL as get orders. You just define it as slash orders. And depending on the method that we'll use, let's say it's a get method, then you will retrieve the orders.

**1:57** · If it's a post method then you will create an order and so on. So all the resources should be clearly identifiable through the URLs. For instance, this is an example of getting a collection. This is an example of getting a specific item and also nested resources should be clear defined.

**2:17** · For example, if you want to retrieve reviews for some specific product, then we would assume that if you make a request to / products/ ID of that product and then / reviews, you would get the reviews for that specific product. But in real world APIs, you rarely want to return all the results at once. That's why we usually incorporate filtering, sorting, and pagination in APIs. So let's start from the filtering.

### フィルタリング、ソート、ページネーション

**2:45** · For example, if you make a request to get all the products, you usually add some query parameter which in this case you can see it's category. So you're first of all filtering them by category.

**2:56** · And then also with the end sign you add that they should be in stock. So the in stock should be true. And this way you are only returning the items that you're going to display on the UI. and you're not making some requests that will waste the bandwidth of this API and also it will be a huge response for you in the front end side. Next, you also have sorting. In this case, again, it's controlled through the query parameters and query parameters are anything that start after the question mark in the URL.

**3:27** · So in this case you usually pass the sort attribute and this can be for example ascending by price or ascending by reviews or it can be also the descending order. So based on this you will get the response from the API in a sorted order because if you for example have thousand items in the back end in the database you don't want to retrieve all of these in unsorted order to the front end because let's say the front end now needs to sort them by the price ascending.

**3:59** · This means that it needs to make request to get all of the products which are these thousand items that you have in the database. So that will be very inefficient. That's why we do the sorting in the back end instead. So your back end should support sorting functionality. This way the front end can just make a request to your back end and pass this sort query parameter and then that way it will get the sorted products to be displayed on the screen.

**4:28** · And next we also have pagination. Again with the query parameter you usually pass the page which you want to retrieve and also the limit because if you don't pass the limit then again it will give you all of the products starting from the page two till the end which can be a lot of items. So you also pass some sort of limit and that limit is whatever you're going to display on the front end and then based on that you will get the response and here let's say you fetched 10 items.

**4:55** · So you're going to display those 10 on the UI and then once they click on the next page you will make another request to the page three this time and you will get the next items from the server. Now usually we use page for pagination but there is another common attribute that is offset. So some APIs use offset instead of the page and they use this in combination with limit which basically means if you have thousand items.

**5:22** · So offset will tell the API from where to start counting this thousand items and then limit is the same as you have it here. So it's basically limiting the number of items that you are getting from this offset to retrieve to the front end. And the last option you can also have this cursor based. So instead of page and limit you would pass a cursor which will be the hash of the page you want to retrieve.

**5:49** · So this approach of adding filtering sorting and pagination comes with benefits. So first of all it saves the bandwidth of your server. It also improves the performance both in the server side and on the front end side and it also gives the front end more flexibility because now you can fetch only the things that you need and not some unnecessary data from the database.

### HTTPメソッド

**6:11** · Now let's come to the HTTP methods that rest APIs use because they rely on HTTP protocol and hence they are using the HTTP methods especially for crowd operations. So these are the most common types of crowd operations you would see in REST APIs. First of all we have the get method which is used for reading data from the API. So this is for retrieving resources as you saw like retrieving the products, retrieving the reviews and so on. And the URL usually looks like this.

**6:42** · You you make a get request to the / API/ version of the API slash the resource name. And these type of requests are both safe and item ponent. Which basically means if you make a request to slash products two or three times, you expect to receive the exact same output every time unless some new products obviously have been added to the database. Next, we have the post method. This is usually when you're creating a resource in your server.

**7:11** · The common example is again you will make the request to exact same endpoint as you have it for the get to create a collection but in this case instead of get you are using post method and this tells the API that you need to create a resource in the products and not retrieve them. These type of requests change the state of the server. They are adding a new item and also they are not item ponent which means that they are creating a resource.

**7:40** · So the first time you create a resource you will get the ID of the first item that you created.

**7:47** · The second time you create it you will get the ID of the second one and so on.

**7:51** · Next we have the put and patch methods which are very similar but they are updating resources in your API but they do it a bit differently. The put method replaces the whole resource whereas the patch method partially updates the resource in your API. Now you can see that the request URL is exactly the same in both of their cases. So it's to slash products/ ID of a product you want to modify.

**8:17** · Just in case of the put request, it will take this whole product with the ID of 1 2 3 and it will basically replace it with the new one that is coming from the front end. Whereas in case of the patch, it will again take this item from the database with ID 1 2 3 but it will update it partially. Let's say you just updated the title from the front end and you made the request patch method.

**8:43** · So this will only update the title of this product and it will leave the other parts other properties unchanged. And the last crowd operation is delete and we use delete method in this case and obviously as the name tells it deletes the resource from the database. So again the URL is exactly the same as you have for modifying items. it's to /roucts/ id of the resource and in this case you are not passing anything in the request body.

**9:10** · So you are just making a delete request to this item and you are removing this from the database and each of these operations return you different status codes depending on how the request went whether it was successful or not. For that we have status codes and error handling in restful APIs. So you should use the appropriate status codes when working with REST APIs. For example, the 200 series are for successful requests.

### ステータスコードとエラー処理

**9:40** · For example, 200 is okay. 200 is resource has been created. 204 is there is no content here. Let's say you made a request the previous request we were talking about to /roucts/ some ID of a product and you successfully retrieved this item. This means that you also need to set the status code to 200 because the request has been successful.

**10:02** · In the other case where you're creating a product and you're making a post request to / products, this time you shouldn't response with the same 200 code because 200 generally means that the status was okay. But in 2011 case, it means that the resource has been created. And in this case, since you're creating a new product, you should obviously response with the 2011 status code, meaning resource has been created. We also have 300 series which are for redirection.

**10:33** · Let's say you make a request to a URL and now this URL has been moved to somewhere else. So it will respond with a 300 series and it will redirect you to the new URL. In 400 series, we have the client errors. So this is whenever your front end made a bad request or the user made a bad request. For example, 400 is a generic bad request. In 401 we have unauthorized requests meaning the user is not authenticated to make this request. For 404 we have not found.

**11:02** · So generally when you visit some URL or you make a request for some specific resource that doesn't exist, you would get this 404 status code. So for 400 case, let's say you made a request with invalid parameters or some wrong JSON format. In this case, you would get a generic 400 repair request.

**11:22** · But if a user makes a request to some to get some product which is let's say the product with this ID and it doesn't exist in the database after querying it, then you should respond with the 404 status code, meaning that the resource has not been found. And lastly, we have 500 series.

**11:43** · These are things when error happens in your server. So you don't know the exact reason and it's also not a client error meaning client requested everything properly and in this case we throw unexpected server side errors. You generally respond with a server error message and you return the 500 status code along with it. When it comes to best practices of restful APIs, first of all notice that we are using plural nouns for all of the resources.

### ベストプラクティス

**12:10** · So instead of slashroduct we are using / products for retrieving the products collection. So you should always use the plural in this case. Also in the crowd operations we use the proper HTTP methods. For example when making a request to delete users we expect to make a request to users/ ID of a user and not some post request to/ users/ ID.

**12:38** · So first of all the HTTP methods needs to be properly set up and also the URL.

**12:43** · We don't expect some random things like /delete to delete a resource from the database. As you saw we also support filtering, sorting and pagination in good rest APIs. Not only pagination for example in this case we only have the page free but we cannot limit the amount of products that we want to retrieve.

**13:04** · Whereas in this case we can fully control what we want to get from the API. We want to get the items from page three. We want these number of limit to be applied on the products. And we also want to apply some sort like sorting to sort the price or sort by ratings and so on. And also versionings in the restful APIs. As you noticed in all of these requests, they all come with a prefix which is / API and then slash the ID of the API which is either v\_sub\_1, v2, v3 and so on.

**13:36** · Because let's say in the future you migrate your API and you start using bunch of new features but you also break something in the previous version one then if you use the versioning you won't break it on the front end because they can use the old version of your API and still use the old features and functionalities while you continue to develop the new version let's say version three and you support new features here and you might have broken something here but they are still using the old API so this doesn't impact the end users.

**14:07** · If you found this video helpful, then be sure to check out this video next where you'll learn about the other types of APIs as well.