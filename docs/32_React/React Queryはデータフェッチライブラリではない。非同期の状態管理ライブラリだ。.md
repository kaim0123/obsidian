---
title: "React Queryはデータフェッチライブラリではない。非同期の状態管理ライブラリだ。"
source: "https://qiita.com/taisei-13046/items/05cac3a2b4daeced64aa"
author:
  - "[[taisei-13046]]"
published: 2023-06-19
created: 2026-05-09
description: "はじめに この記事はDominikさんが執筆された「Thinking in React Query」を参考にReact Queryの考え方をまとめたものになります。DominikさんはTanStack Query（以下ではReact Queryと呼ぶ）のコアメンテナーであ..."
tags:
  - "clippings"
---
この記事は最終更新日から1年以上が経過しています。

## はじめに

この記事は [Dominik](https://twitter.com/TkDodo) さんが執筆された「 [Thinking in React Query](https://tkdodo.eu/blog/thinking-in-react-query) 」を参考にReact Queryの考え方をまとめたものになります。DominikさんはTanStack Query（以下ではReact Queryと呼ぶ）のコアメンテナーであり、彼のブログからReact Queryについての知見を吸収することができます。

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__948e35fb7e7cd31bf84cece8d711f90d" frameborder="0" height="112"></iframe>

## 目次

1. React Queryはデータフェッチライブラリではない
	1. ではReact Queryとは何か？
		2. Client StateとServer Stateの違い
		3. React Queryは非同期の状態（Server State）管理ライブラリである
2. キャッシュを有効活用する
	1. React Queryのキャッシュについて
		2. staleTimeでキャッシュをコントロールする
		3. queryKeyを適切に設定する
3. まとめ

## 🎆 React Queryはデータフェッチライブラリではない

React Queryがデータフェッチライブラリでないことは、実際にコードを見ればすぐにわかります。下の画像によると、queryFnではaxiosが使用されています。なぜでしょう。

これがReact Queryがデータフェッチを責務としていないことの証拠です。  
**React Queryはどのようにデータが取得されるかに関心がありません。** 唯一関心があるのは、queryFnに **Promiseが返却されること** だけです。そのため、データフェッチにはaxiosを用いてもfetchを用いても問題はありません。

[![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1071889/abb8736d-69f8-1bb5-7b5e-0657f55aa9a0.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F1071889%2Fabb8736d-69f8-1bb5-7b5e-0657f55aa9a0.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=3365a4a744f1613421a16d1695257174)

一度React Queryがデータフェッチライブラリではないことを理解すれば、以下のような疑問が生まれることはないでしょう。

- React QueryでどのようにbaseURLを設定するのか？
- React Queryでどのようにresponseのheaderにアクセスするのか？
- React QueryでどのようにgraphQLのrequestを作成するのか？

これらに関する答えは一つです。  
**「それはReact Queryの関心事ではない」**

React Queryが唯一期待することは **Promiseを返却されることだけ**

## ではReact Queryとは何か？

React Queryは **非同期の状態管理ライブラリ** である

この説明をするためには、状態管理の概念に **Client State** と **Global State** そして **Server State** という3つの状態が存在することを理解する必要があります。「3種類」で管理するReactのState戦略という記事を参照すると、それぞれ以下の分類がされています。

- Client State
	- 各Component内で管理される状態
- Global State
	- ページをまたいで保持し続ける必要のある状態
- Server State
	- サーバーデータのキャッシュ

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__682f46e296d65d1f7e699304047545d2" frameborder="0" height="112"></iframe>

React QueryやSWRといったライブラリが誕生するまでは、Server Stateという概念が主流ではありませんでした。つまり、 **全ての状態をClient StateかGlobal Stateによって管理する** 必要があり、サーバーデータの管理はGlobal Stateによって行われていました。

それが **Redux** です。

Reduxではサーバーから取得するデータもアプリケーション内で使用されるUIの状態も同様に扱われていました。このような歴史的な背景から紐解くと、なぜReact Queryのようなサーバキャッシュライブラリが必要になったかがわかります。

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__efb37375ce857a953f7daf04fb10eaf3" frameborder="0" height="112"></iframe>

### Client State（Global State）とServer Stateでは状態の種類が異なる

以下よりClient StateとGlobal Stateは共にクライアントに関心のある状態ということから便宜上まとめてClient Stateと呼ぶことにします。

Reduxなどでは全ての状態をClient Stateで管理していましたが、Server Stateの登場でその責務が分割されReact QueryのようなServer Stateを管理するライブラリが生まれました。では、なぜClient Stateのみで管理することに問題があったのでしょうか？それは **Client StateとServer Stateでは状態の特徴・役割が異なる** からです。それぞれの違いを表にまとめました。

## Client StateとServer Stateの違い

| Client State | Server State |
| --- | --- |
| クライアントが完全に所有している | リモートに操作されうる |
| 同期的に使用することができる | 非同期的に使用する必要がある |
| 常に最新の状態である | 状態が古くなる可能性がある |

### 状態の所有がクライアントにあるかサーバにあるか

まず一つ目の違いは、状態の所有元についてです。Client Stateの場合（例えばUIの状態など）はクライアントが完全に所有している状態になります。その一方で、ユーザの情報や記事の一覧などのデータはサーバーによってリモートに管理されています。

**そもそも状態を所有している元がClient StateとServer Stateでは異なる**

### 状態が同期的か、非同期的か

Client Stateの状態は所有元がクライアントで完結していることからも同期的に扱うことができます。その一方で、Server Stateはデータのフェッチや更新が関係してくるため、非同期に管理する必要が出てきます。

**Server Stateは同期的に管理することが難しい**

### 状態が常に最新であるか否か

最後は、状態が常に最新であることが保証できているか否かです。Client Stateは当然外部に依存しない状態のため、常に最新であることが保証されます、それに対して、Server Stateはどうでしょうか？記事一覧サイトに訪れて、その情報が1時間後も最新である保証はできません。おそらく新しい記事が更新されたり、削除されていることが考えられます。

**つまり、私たちがClient Stateによって管理していたサーバーの状態はあくまでもスナップショットにすぎず、常に最新の状態を保証できるものではありませんでした。** その意味でも、Client StateとServer Stateに責務を分けて、Server Stateを適切に更新する必要性があります。

**Server Stateは状態が古くなる可能性がある**

以上のことを踏まえると、Server Stateを扱う際には、上記の3つを意識する必要があることがわかります。この意識を持った上でReact Queryの役割を考えていきましょう。

## React Queryは非同期の状態（Server State）管理ライブラリである

改めて、この結論に戻ります。先ほど、Client StateとServer Stateはそれぞれの特徴と役割が異なるので責務を分けるべきであることを主張しました。それでは、どのようにしてServer Stateの状態を非同期的に最新性を保証しつつ管理するのでしょうか？

ここでReact Queryの出番です！

**React Queryは非同期的な状態を効率的に管理する役割を持つ**

例えば、データフェッチに伴うローディングの状態やエラー処理です。React Queryによって私たちはこのような非同期な状態を効率的に管理することができるようになります。

この恩恵を理解するためにまずはRedux Toolkitを使って `loading` の状態を実装してみます。

### Redux Toolkitを用いたloadingの状態管理

```tsx
const slice = createSlice({
  name: "sample",
  initialState: {
    isLoading: false
  },

  // ⛑️ Promiseがpending・rejected・fulfilledでそれぞれisLoadingの状態を定義する
  extraReducers: (builder) => {
    builder.addCase(getIssue.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getIssue.rejected, (state, action) => {
      state.isLoading = false
    })
    builder.addCase(getIssue.fulfilled, (state, action) => {
      state.isLoading = false
    })
  },
})
```

Promiseがpending, rejected, fulfilledとそれぞれのケースに応じて `isLoading` を更新しています。これを見るだけでも状態管理が大変そうに思えますが、この処理が各エンドポイントごとに必要になることを想像してください。私たちが実装したいのは、データを取得している最中にローディング表示をしたいという要件だけです。そのために、これだけの実装がReduxでは必要になっていました。

ではReact Queryにおける `isLoading` の状態管理方法を見てみましょう。

### React Queryを用いたloadingの状態管理

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["issues"],
  queryFn: () => axios.get("/issues").then(res => res.data)
})
```

比較すると一目瞭然です！ **loadingなどの状態に関する処理がReact Query内に隠蔽されることによって、私たちが非同期なサーバーのデータに対する状態管理を実装する必要がなくなりました。** React QueryはPromiseを受け取ることで、非同期の状態を効率的に管理してくれます。私は以下の画像のようにイメージをしています。

[![React Query.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1071889/e09a178f-d55b-e072-2374-46ad60e34401.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F1071889%2Fe09a178f-d55b-e072-2374-46ad60e34401.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=2b1898addaeef558f852f879d3ad20d7)

**React Queryが期待するのはPromiseのみ**  
**非同期な状態(loadingなど)はReact Queryが効率的に管理してくれる**

## ⛩️ キャッシュを有効活用する

React Queryによって私たちは効率的に非同期な状態を管理することができるようになりました。しかし、Server Stateを扱う上でもう一つの重要なポイントがあります。それが、 **状態をできる限り最新に更新する必要がある** ということです。React Queryのキャッシュ機構は私たちが状態を適切なタイミングで更新するための選択肢を与えてくれます。

## React Queryのキャッシュについて

React Queryは `useQuery` の第一引数に渡す `queryKey` によってキャッシュを管理しています。キャッシュされたデータはJavaScriptのメモリ内に保存されるためブラウザがリロードされたりするとキャッシュはクリアされます。では、実際にuseQueryを用いてAPIがリクエストされた場合のデータ取得（キャッシュ有無）までの流れを整理します。

---

1. useQueryがコンポーネントで呼ばれ、 **データフェッチを開始**
2. queryKeyを参考にキャッシュを確認する
	- キャッシュヒットした場合、 **キャッシュされたデータをコンポーネントに返却**
		- キャッシュヒットしなかった場合、または、キャッシュヒットしたがキャッシュがstale状態の場合は3に進む
3. バックグラウンドで **新しいデータをfetchしてアップデート** する
4. **新しいデータをキャッシュに保存** して再レンダリングする

---

ここからわかる通り、同じデータを取得する場合はキャッシュを活用することで複数回fetch処理が走ることを解消して効率的なデータ取得が可能になります。

## staleTimeでキャッシュをコントロールする

上の流れを聞くと、キャッシュの生存期間を長く持ってなるべくfetch処理が走らないようにすればパフォーマンスが向上するのではないかと考えてしまいます。しかし、それではサーバーの状態をスナップショット的に管理していたRedux時代と変わりません。

Server Stateの役割は、非同期の状態を管理することと共に、 **その状態を最新に保つ** ことにありました。つまり、私たちはキャッシュの生存期間を適切に設定する必要があります。そこで使われるのが `staleTime` です。

`staleTime` とは、 **キャッシュをstale（古くなったとみなす）状態にするまでの期間** です。デフォルトは0で設定されており、Infinityを設定すると常にキャッシュがfreshな状態に設定することができます。そのstaleTimeと混同しやすいのがcacheTimeです。 [^1] `cacheTime` は **キャッシュをガベージコレクション（メモリ領域の開放）するまでの時間** です。デフォルトは5分に設定されています。

これらの説明を踏まえたキャッシュ戦略には以下のようなものが考えられます。

- 頻繁に更新されうるデータ
	- 記事一覧など
		- **staleTime: 0**
		- 常にキャッシュをstale状態にし、バックグラウンドでfetch処理を行い最新のデータを更新する
- 頻繁に更新されることがないデータ
	- 設定内容など
		- **staleTime: Infinity**
		- キャッシュが常にfreshなのでネットワークのリクエストが走らず、キャッシュからデータを取得する

**Server Stateをなるべく最新に保つためにキャッシュの生存戦略を考えることが重要**

## queryKeyを適切に設定する

React Queryのキャッシュを有効に使うためには、適切な `staleTime` の設定とともに `queryKey` の管理も重要になってきます。 `queryKey` はuseQueryの第一引数で配列を受け取ります。例えば以下のようなfilterをクエリパラメータに受け取るAPIを考えてみましょう。

[![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1071889/c71b8356-a194-ff74-63e3-101de8b2fa5c.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F1071889%2Fc71b8356-a194-ff74-63e3-101de8b2fa5c.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=9a87ef728a6ed4ff5e1c546c2cff62cc)

queryKeyには `["issues"]` とともに `filter` も渡しています。React Queryはキーになる文字列と共に、動的に変わるインプット（filterなど）を受け取ることで、キャッシュの保存を区別することができます。これにより、filterごとのキャッシュを管理することができるため、正しく `queryKey` を設定することが重要になってきます。

**正しくqueryKeyを管理することは、キャッシュを正しく管理することにつながる**

非常に重要な観点なので、queryKeyが正確に管理されているかをチェックするeslint pluginも公開してくれています。

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__26304339728e44275620e7dc059196bc" frameborder="0" height="80"></iframe>

## まとめ

以上React Queryがデータフェッチライブラリではなく **非同期の状態管理ライブラリ** であることを説明しました。ReduxのようなライブラリでClient StateとServer Stateを同様に管理していた時代から、サーバデータのキャッシュライブラリの登場によって、Server Stateの責務が分割されました。そして、React Queryによって非同期の管理を効率的に行い、かつ状態を適切に更新することができるようになりました。

参考資料

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__e8fd417073b2db51e2f7e318152558f8" frameborder="0" height="112"></iframe>

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__bdd0839eb1d0de27d8f813519acffe0c" frameborder="0" height="112"></iframe>

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__c169159ffe91b04ce5006cb0800f8ec6" frameborder="0" height="112"></iframe>

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__b0eef9350331baad7b7e80315ac4a509" frameborder="0" height="112"></iframe>

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__a87a57325c543c7557af49e007a69865" frameborder="0" height="112"></iframe>

[2](#comments)

コメント一覧へ移動

X（Twitter）でシェアする

Facebookでシェアする

はてなブックマークに追加する

新規登録して、もっと便利にQiitaを使ってみよう

1. あなたにマッチした記事をお届けします
2. 便利な情報をあとで効率的に読み返せます
3. ダークテーマを利用できます
[ログインすると使える機能について](https://help.qiita.com/ja/articles/qiita-login-user)

[^1]: cacheTimeはその命名と役割が一致しずらいという問題があったため、TansTack Query v5からは `gcTime` と名前を変更する動きも見られています。  
[https://github.com/TanStack/query/discussions/4252](https://github.com/TanStack/query/discussions/4252)