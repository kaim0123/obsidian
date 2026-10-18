---
title: "「3種類」で管理するReactのState戦略"
source: "https://zenn.dev/knowledgework/articles/607ec0c9b0408d?redirected=1"
author:
published: 2021-12-31
created: 2026-05-09
description:
tags:
  - "clippings"
---

## 詳しい要約

**テーマ：アプリの State を「サーバーデータのキャッシュ」「Global State」「Local State」の3種類に分けて管理する**

2020 年に立ち上げた Web フロントエンドの State 設計を紹介した記事。Global State の大半はサーバーデータのキャッシュなので SWR に任せ、残った「ページをまたいで保持する State」だけを Recoil で、それ以外はコンポーネント内の useState で管理する。この構成で手書きのコードをかなり削れた、というのが結論。

---

### 1. サーバーデータのキャッシュ（SWR）

- 「SPA の Global State のほとんどはサーバーデータのキャッシュであり、それを除けば管理すべき Global State はとても小さくなる」という考え方（SWR や React Query が話題になった頃に共感）。
- Usecase 層に `useUserList()` / `useUserItem({ id })` のようなカスタムフックを定義し、中で `useSWR(key, fetcher)` を呼ぶ（key は CacheKeyGenerator、fetcher は Repository）。
- 動き：キャッシュがあればまずそれを返す → サーバーから取得 → キャッシュに書き込み → コンポーネントに返す。
- ユーザー削除などでデータが変わるときは、同じ key で **`mutate`** を呼んでキャッシュを無効化する。これをユーザー操作用の各カスタムフックに入れている。

### 2. Global State（Recoil）

- 定義：**ページをまたいで保持し続ける必要のある State**（認証情報、ページをまたぐ Toast、バックグラウンド処理の進行状況など）。
- React の Context でも実現できるが、以下の使い勝手から採用せず：
  - State を分けるたびに Provider を JSX に差し込む必要がある
  - 更新手段がなく Setter を自前で用意する必要がある
  - `createContext` と Provider の value の2か所で初期値を指定する
- Single State + Selector ではなく用途ごとに個別の State を柔軟に増減させたかったため、API が理想的だった **Recoil** を採用。
- 運用ルール：
  - `/src/globalStates` 以下に 1 State 1 ファイル、ファイル名を key にして衝突を防ぐ
  - State や setState を直接公開せず、読み取り用 `useXxxxState` と書き込み用 `useXxxxMutators`（setState をラップしたメソッド群）の2つのカスタムフックだけを公開
  - `useXxxxState` は任意のコンポーネント・Usecase から、`useXxxxMutators` は Usecase から利用
- ライブラリの知識を隠蔽でき、Mutators で期待する組み合わせの更新だけに制限できる。

### 3. Local State（useState）

- ページをまたいで保持しなくてよい State は、各コンポーネント内の useState で管理。
- 外から操作できない状態が生まれ Storybook のカバレッジが落ちる課題があったが、Storybook の **Interactive Stories** で操作後の状態を記述でき、reg-suit + storycap の Visual Regression Test でスクリーンショットも取れた。コンポーネントのテストにもなると期待。

### まとめ

- サーバーデータはキャッシュ機構（SWR）に任せると、Global State は小さくなる。
- 残る Global State は Recoil で 1 State 1 ファイル、読み書き用のカスタムフックだけを公開する。
- Local State は useState で持ち、テストは Interactive Stories で補う。

[株式会社ナレッジワーク](https://zenn.dev/p/knowledgework)

997

17

こんにちは、よしこです。

この記事は [2020年に立ち上げたWebフロントエンド構成の振り返り](https://zenn.dev/yoshiko/articles/32371c83e68cbe) の「Stateのアーキテクチャ」項の詳細記事です。単体でも読めますが、よければ元記事もあわせてどうぞ！

---

この記事では、今わたしが開発・運用しているアプリケーションのState戦略についてご紹介していきます。

## 全体像

アプリケーションに存在する状態（State）を以下の3種類に分類し、それぞれのやり方で管理しています。

1. サーバーデータのキャッシュ
2. Global State
3. Local State

## 1\. サーバーデータのキャッシュ

「SPAで管理する必要のあるGlobal Stateって、そのうちほとんどがサーバーデータのキャッシュだよね。それを取り除けたら、管理する必要のあるGlobal Stateってすごく小さくなるんじゃない？」という主張を私が認識しはじめたのが2020年の初旬でした。おそらくSWRやReact Queryが日本で話題になり始めたのがその頃で、それを調べて逆引きする形で課題や思想を知ったんだったかな？とにかく、言われてみればその通りという感じで、とても共感できました。  
キャッシュ機構を持つFetch Clientの存在は、以前からGraphQLの世界では馴染み深いものだったと思います。わたしはGraphQLの経験はかなり浅いので、それを試すことができたのは今回のアプリケーションからとなりました。

## SWRを使ったサーバーデータのキャッシュ

[SWR](https://swr.vercel.app/ja) そのものについては他にたくさん良い記事があるのでこの記事では解説はしません。それらをアプリケーションでどのように使っているのかだけ簡単に紹介します。

たとえば、ユーザー一覧・詳細取得でいうとこんな感じです。  
Usecase層に以下を定義し、Componentからこれらを利用しています。

```
// ユーザー一覧取得
type UserGetListResponse = { users: User[] }
export const useUserList = () => {
  const repository = useUserRepository()
  
  return useSWR<UserGetListResponse>(
    userCacheKeyGenerator.generateListKey(), // key
    () => repository.getList(),              // fetcher
  )
}

// 詳細取得
type UserGetItemResponse = { user: User }
export const useUserItem = (query: { id: User['id'] }) => {
  const repository = useUserRepository()

  return useSWR<UserGetItemResponse>(
    userCacheKeyGenerator.generateItemKey(query), // key
    () => repository.getItem(query),              // fetcher
  )
}
```

これで、Component側で `useUserList()` を呼び出すと

- もしSWR内のキャッシュに既にデータが存在すれば、まずはそれがComponentに返る
- fetcherによるサーバーからのデータ取得
- 取得したデータがSWR内のキャッシュに書き込まれる
- 取得したデータがComponentに返る

というふうに動き、サーバーデータの管理をGlobal StateではなくSWRのキャッシュ機構に任せることができます。  
加えて、たとえばユーザー削除などリソースの操作をしたことで一覧のデータに変化があるはずなのでキャッシュを無効にしたい、という場合には同じKeyでmutateを呼び出すことで実現できます。上記のコードに対応するコードだと `mutate(userCacheKeyGenerator.generateListKey())` のような感じですね。なので、それをユーザーを操作する各カスタムフックの中に入れています。

サンプルコードに出てきたUsecase, Repository, CacheKeyGeneratorなどの解説はまた別途、元記事の「Applicationのアーキテクチャ」の深堀り記事で紹介できればと思います。

## 2\. Global State

Global Stateから1の手法によってサーバーデータのキャッシュを取り除いたあとにも、クライアントに必要ないくつかのGlobal Stateが残ります。  
今のプロジェクトでは、「ページをまたいで保持し続ける必要のあるState」をGlobal Stateとして定義しています。  
例えば認証情報や、ページをまたいで表示する必要のあるToast、継続してユーザーに知らせ続ける必要のあるバックグラウンド処理の進行状況などです。

これらのGlobal Stateの管理には [Recoil](https://recoiljs.org/) を使っています。

要件的にはReactに元々入っているContextでも実現できないことはないのですが、それを使わなかった理由は、APIの好みによる部分が大きいです。

- Stateを分割したいときにJSXとしてProviderを差し込む必要がある
- State更新の手段が提供されていないので、Setterも自分で用意して値と同列に生やす必要がある
- createContextとProviderのvalueの2箇所で初期値を指定しないといけない

あたりの使い勝手があまりしっくりきておらず、さらに今回はSingle State + Selector という設計ではなくStateの用途単位で個別にStateを作っていく設計にしたいと思っていたので、使い勝手のよい形でStateを柔軟に増減させられることが理想でした。  
そこで、ちょうどその頃公開されて間もなかったRecoilのAPIがとても理想的だったため、採用を決めて開発を進めてきました。

Recoilの解説についてはuhyoさんの [Facebook製の新しいステート管理ライブラリ「Recoil」を最速で理解する](https://blog.uhy.ooo/entry/2020-05-16/recoil-first-impression/) がおすすめです。

## Recoilを使ったGlobal Stateの管理

以下のルールで運用しています。

- /src/globalStates 以下に 1Stateあたり1ファイルを作成する
- ファイル名をkeyにする（衝突しないことが担保できる）
- StateそのものやsetStateを直接露出させず、ふたつのカスタムフックのみを露出させる
	- State の Read hook は `useXxxxState` として export
		- State の Write hook は `useXxxxMutators` として export
		- 中に setState を wrap した write methods を詰める。setState は直接露出させない
- `useXxxxState` は任意のComponent/Usecaseから利用可能
- `useXxxxMutators` は任意のUsecaseから利用可能

たとえば、夜ご飯のメニューを保持するGlobal Stateでサンプルコードを明示すると、以下のような感じです。

```
type DinnerType = 'Beef' | 'Chicken' | null
type TodaysDinnerState = {
  dinnerType: DinnerType
}

const todaysDinnerRecoilState = atom<TodaysDinnerState>({
  key: 'todaysDinnerState',
  default: { dinnerType: null },
})

export const useTodaysDinnerState = () => {
  return useRecoilValue(todaysDinnerRecoilState)
}

export const useTodaysDinnerMutators = () => {
  const setState = useSetRecoilState(todaysDinnerRecoilState)

  const setDinner = React.useCallback(
    (dinnerType: DinnerType) => setState({ dinnerType }),
    [setState],
  )

  return { setDinner }
}
```

RecoilのAPIを直接露出させずカスタムフックだけを露出させることでライブラリの知識を隠蔽できますし、Mutatorsではニーズごとの関数をexportすることでプロパティが複数ある場合でも期待する組み合わせの更新のみに制限することができます。

## 3\. Local State

ページをまたいで保持する必要のないStateは単純に各Component内でuseStateを使って管理しています。  
単純である代わりに、外側から操作できない状態が生まれてしまうためにstorybookのカバレッジが落ちてしまうという問題もあって、 [ここは少し悩んでいるところでもありました。](https://zenn.dev/yoshiko/articles/99f8047555f700#container%2Fpresenter%E3%81%AE%E5%88%86%E9%9B%A2)

これを解決するにはComponentをContainer/Presenterで分割していくしかないのかなと思っていたのですが、最近出たStorybookの [Interactive Stories機能](https://storybook.js.org/blog/interactive-stories-beta/) がまさにこの問題に対する違った形での解決策になっていました。ComponentのStoryのレンダリング結果に対する任意の操作を記述できるというものです。  
既に一部のComponentではこのInteractive Stories機能を活用してみており、既存のreg-suit + storycapのCI構成のままでばっちり操作後のスクリーンショットがとれました！  
Componentに閉じたStateはそのほとんどがUI操作によって変更するためのものであるため、Interactive Storiesをマメに書いてVisual Regression Testのカバレッジを向上させていくと、それがそのままComponentのテストにもなるため、よりよい解決策になりそうだと期待しています。

---

以上！

深堀り記事を連載しながら紹介している今回のアプリケーション構成の中でも、State設計がアプリケーションに与えた影響は特に大きく、今回のStateの構成を取ることで今までは手で書いていたコードをだいぶ削れた実感があります。

元記事では他にも様々な項目の構成紹介をしています。よければあわせて読んでみてください！

<iframe src="https://embed.zenn.studio/card#zenn-embedded__8e8b6680c4a15" frameborder="0" height="122"></iframe>

997

17

この記事に贈られたバッジ

![参考になった](https://static.zenn.studio/images/badges/paid/badge-frame-3.svg) ![参考になった](https://static.zenn.studio/images/badges/paid/badge-frame-3.svg) ![Thank you](https://static.zenn.studio/images/badges/support-thanks.svg)