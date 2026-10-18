---
title: 03_制御の反転とComposition Root
created: 2026-10-05
tags:
  - アーキテクチャ
  - DI
  - IoC
---

# 制御の反転（IoC）と Composition Root

## この教材の目的

24_依存性の管理 では、[[01依存性逆転]]・[[02_依存関係逆転の原則]]（DIP）と [[01_依存性注入]]（DI）を学びました。
しかし実際にアプリを組み立てようとすると、次の疑問が出てきます。

- 「IoC（制御の反転）」「DIP（依存性逆転）」「DI（依存性注入）」は、どう違うのか
- コンストラクタで依存を受け取るのはよいが、**最終的に誰が `new` するのか**
- DI コンテナはアプリの **どこで** 使えばよいのか
- 「サービスロケーター」は DI と何が違うのか

この教材では、

- **IoC・DIP・DI** の3つの言葉の関係
- 依存を組み立てる唯一の場所 **Composition Root**
- アンチパターンとしての **サービスロケーター**
- 依存の **ライフタイム**（シングルトン・スコープ・トランジェント）と **捕らわれた依存**

を解説します。

---

## 1. IoC・DIP・DI の違い

この3つは名前が似ていて混同されやすいですが、**レベルの違う概念** です。

| 用語 | 種類 | ひとことで | 問い |
|---|---|---|---|
| **IoC**（Inversion of Control：制御の反転） | 設計の **考え方**（最も広い） | 「**誰が呼び出すか**」を逆にする | 自分のコードがフレームワークを呼ぶのか、フレームワークが自分のコードを呼ぶのか |
| **DIP**（Dependency Inversion Principle：依存性逆転の原則） | 設計の **原則** | 「**依存の矢印の向き**」を逆にする | 上位モジュールが下位モジュールに依存するのか、両方が抽象に依存するのか |
| **DI**（Dependency Injection：依存性注入） | 実装の **テクニック** | 「**依存を誰が用意するか**」を外に出す | 自分で `new` するのか、外から渡してもらうのか |

### 1.1 IoC — 「ハリウッドの原則」

IoC は **「Don't call us, we'll call you.（こちらから連絡するので、電話してこないでください）」** という **ハリウッドの原則** で説明されます。オーディションの後に役者が何度も電話してくるのを断る決まり文句です。

```typescript
// 普通の制御：自分のコードが流れを決め、ライブラリを呼ぶ
const input = readline();
const result = calculate(input);
print(result);

// 制御の反転：フレームワークが流れを決め、自分のコードを呼ぶ
app.get("/users/:id", (req, res) => {   // いつ呼ばれるかは Express が決める
  res.json(findUser(req.params.id));
});
```

- フレームワークとライブラリの違いは、まさにこの IoC です。**ライブラリは自分が呼ぶもの、フレームワークは自分を呼ぶもの**
- React のコンポーネント、テストフレームワークの `test()`、イベントハンドラ、テンプレートメソッドパターンも IoC の例です

### 1.2 DI は IoC の一種

Martin Fowler は 2004 年の論文「Inversion of Control Containers and the Dependency Injection pattern」で、当時 Java で広まっていた「IoC コンテナ」について、

> IoC という言葉は広すぎる。ここで逆転しているのは「**依存の用意（組み立て）**」の制御なので、**Dependency Injection（依存性注入）** と呼ぶことにする。

と整理しました。DI という言葉はここから広まりました。

- 普通は、オブジェクトが **自分で** 依存を `new` する（制御は自分にある）
- DI では、**外の誰か** が依存を作って渡す（制御が外に反転している）

### 1.3 DIP と DI の関係

| | DIP なし | DIP あり |
|---|---|---|
| **DI なし** | `new MySqlRepo()` を内部で直接作る | インターフェースに依存しているが、内部で `new MySqlRepo()` している（逆転が中途半端） |
| **DI あり** | 具体クラス `MySqlRepo` を外から受け取る（テストで差し替えにくい） | **インターフェースを外から受け取る**（目指す形） |

DIP が「**どちらに依存するか**」を決め、DI が「**どうやって渡すか**」を実現します。クリーンアーキテクチャでは両方が必要です（→ [[依存性のルール]]）。

---

## 2. Composition Root — 依存を組み立てる唯一の場所

### 2.1 「最終的に誰が new するのか」問題

DI を徹底すると、どのクラスも依存を **受け取るだけ** になります。では、最初に `new` するのは誰でしょうか。

答えは、Mark Seemann（『Dependency Injection Principles, Practices, and Patterns』の著者）が名付けた **Composition Root** です。

> **Composition Root**：アプリケーションの **エントリーポイントにできるだけ近い場所** に置く、オブジェクトの組み立て（依存の配線）を **一手に引き受ける唯一の場所**。

### 2.2 例（手動 DI）

```typescript
// src/main.ts ← Composition Root（アプリの入口）
import express from "express";
import { PrismaClient } from "@prisma/client";

// ① 最も外側の技術的な部品を作る
const prisma = new PrismaClient();
const mailer = new SendGridMailer(process.env.SENDGRID_API_KEY!);

// ② アダプタ（インターフェースの実装）を作る
const userRepository = new PrismaUserRepository(prisma);
const notifier = new EmailNotifier(mailer);

// ③ ユースケースに注入する
const registerUser = new RegisterUserUseCase(userRepository, notifier);

// ④ 入口（Controller）に注入する
const userController = new UserController(registerUser);

// ⑤ フレームワークにつなぐ
const app = express();
app.post("/users", (req, res) => userController.register(req, res));
app.listen(3000);
```

- **`new` はここに集まる**。ユースケースやドメインのコードには `new PrismaUserRepository()` が一切出てこない
- どの実装を使うかを変えたいとき（テスト用・本番用・別の DB）は、**ここだけを変えればよい**
- クリーンアーキテクチャの図でいえば、**最も外側の「Frameworks & Drivers」** に属する場所です（Robert C. Martin は「Main コンポーネント」と呼んでいます）

### 2.3 Composition Root のルール

| ルール | 理由 |
|---|---|
| **アプリに1つだけ**（エントリーポイントごとに1つ） | 組み立ての知識が散らばらない |
| **エントリーポイントのできるだけ近く** に置く | アプリの他の部分が組み立てを知らずに済む |
| **DI コンテナを使うなら、ここでだけ使う** | ここ以外で使うと、次のサービスロケーターになる |
| 組み立てた後は、**ルートのオブジェクトを1つ取り出して動かすだけ** | 残りは注入された依存が連鎖的に動く |

> Web API・バッチ・CLI のように入口が複数あるアプリでは、**入口ごとに Composition Root** を持ちます（共通部分は関数にまとめてよい）。

---

## 3. アンチパターン：サービスロケーター

### 3.1 サービスロケーターとは

**グローバルな「部品置き場」から、必要なときに依存を取り出す** 方式です。

```typescript
// ✕ サービスロケーター
class RegisterUserUseCase {
  async execute(input: RegisterInput) {
    const repo = ServiceLocator.get<UserRepository>("UserRepository");  // 中で取り出す
    const notifier = ServiceLocator.get<Notifier>("Notifier");
    ...
  }
}

// ○ DI（コンストラクタ注入）
class RegisterUserUseCase {
  constructor(
    private readonly repo: UserRepository,
    private readonly notifier: Notifier,
  ) {}
}
```

一見すると、どちらも「具体クラスを `new` していない」ので同じに見えます。Fowler の 2004 年の論文でも、サービスロケーターは DI の **代替案** として紹介されていました。

### 3.2 なぜアンチパターンなのか

Mark Seemann は 2010 年の記事「Service Locator is an Anti-Pattern」で、次の問題を指摘しました。

| 問題 | 説明 |
|---|---|
| **依存が隠れる** | コンストラクタを見ても、このクラスが何に依存しているか分からない。コードを全部読まないと分からない |
| **コンパイル時ではなく実行時に失敗する** | 必要な部品を登録し忘れても、コンパイルは通る。実行して `get()` した瞬間に初めてエラーになる |
| **テストしにくい** | テストのたびに、グローバルな部品置き場に偽物を登録・解除する必要がある。テスト同士が干渉しやすい |
| **どこからでも何でも取り出せる** | 依存のルール（内側は外側を知らない）を簡単に破れてしまう |

### 3.3 DI コンテナを「サービスロケーターとして」使ってしまう

注意したいのは、**DI コンテナを使っていても、サービスロケーターになりうる** ことです。

```typescript
// ✕ DI コンテナをサービスロケーターとして使っている
import { container } from "tsyringe";

class RegisterUserUseCase {
  async execute() {
    const repo = container.resolve<UserRepository>("UserRepository");  // ← 中で呼んでいる
  }
}
```

**DI コンテナの `resolve()` を呼んでよいのは Composition Root だけ** です。それ以外の場所で呼ぶと、DI コンテナを使っているのにサービスロケーターと同じ問題が起きます（[[01依存性逆転]] の「DIコンテナを使えば自動的にDIP」は誤解、とも同じ話です）。

> 補足：フレームワークがオブジェクトの生成を管理している場合（一部の Web フレームワークなど）、フレームワークの拡張点でコンテナを呼ぶ必要が出ることがあります。これは「Composition Root をフレームワークの入口に置いている」と考え、**使う場所を最小限に保つ** ことが大切です。

---

## 4. 依存のライフタイム

Composition Root（や DI コンテナ）では、**オブジェクトをいつ作り、いつまで使い回すか**（ライフタイム）も決めます。

| ライフタイム | 意味 | 向いているもの |
|---|---|---|
| **シングルトン**（Singleton） | アプリ全体で **1つだけ** 作り、ずっと使い回す | 状態を持たないもの、高価なもの（DB 接続プール、HTTP クライアント、設定） |
| **スコープ**（Scoped） | **1リクエストごとに1つ** 作る | リクエストごとの状態を持つもの（トランザクション、ログインユーザー情報、Unit of Work） |
| **トランジェント**（Transient） | **使うたびに新しく** 作る | 軽量で状態を持つもの |

### 4.1 捕らわれた依存（Captive Dependency）

ライフタイムでよくある失敗が **捕らわれた依存** です（Mark Seemann らの命名）。

> **長生きするオブジェクトが、短命であるべきオブジェクトを抱え込んでしまう** こと。

```text
UserService（シングルトン：アプリ全体で1つ）
   └── RequestContext（本来はスコープ：リクエストごとに1つ）
```

- `UserService` は最初のリクエストのときに1回だけ作られ、そのときの `RequestContext` を抱え込む
- 2回目以降のリクエストでも **最初のリクエストのユーザー情報** が使われてしまう
- 結果：**別のユーザーのデータが見えてしまう**、トランザクションが混ざる、などの深刻なバグになる

**ルール：オブジェクトは、自分より短命な依存を持ってはいけない。**（シングルトン → スコープ → トランジェント の順に、長い方から短い方へは依存しない）

一部の DI コンテナは、この違反を検出して警告してくれます。

---

## 5. 手動 DI か、DI コンテナか

[[01_依存性注入]] でも触れましたが、Composition Root の観点で整理すると次のようになります。

| | 手動 DI（Pure DI） | DI コンテナ |
|---|---|---|
| 組み立て方 | Composition Root で `new` を並べる | Composition Root で登録し、コンテナに組み立てさせる |
| 間違いに気づくタイミング | **コンパイル時**（型チェックが効く） | 多くは **実行時** |
| コードの見通し | 組み立てが目で見える | 規約や設定に隠れる |
| 向いている | 小〜中規模、依存の数がそれほど多くない | 大規模、依存が多い、ライフタイム管理が複雑 |

Mark Seemann も、**まずは手動 DI（Pure DI）で始め、組み立てのコードがつらくなってから DI コンテナを検討する** ことを勧めています。TypeScript では型チェックが強力なので、手動 DI で十分なケースが多いです。

---

## 6. ありがちな誤解

### 6.1 「IoC と DI は同じ意味」

**誤りです。** IoC は「制御を外に任せる」という広い考え方で、DI はその一種（依存の用意を外に任せる）です。

### 6.2 「DI コンテナを使っていれば正しい DI」

**誤りです。** Composition Root 以外でコンテナの `resolve()` を呼ぶと、サービスロケーターになります。

### 6.3 「全部シングルトンにすれば効率が良い」

**危険です。** リクエストごとの状態を持つものをシングルトンにすると、**捕らわれた依存** によってユーザー間でデータが混ざります。

---

## 7. まとめ

- **IoC**（制御の反転）：誰が呼び出すかを逆にする広い考え方。「ハリウッドの原則」
- **DIP**（依存性逆転の原則）：依存の矢印を抽象に向ける原則
- **DI**（依存性注入）：依存を外から渡すテクニック。Fowler が 2004 年に IoC の一種として名付けた
- **Composition Root**：エントリーポイントの近くに置く、依存を組み立てる **唯一の場所**。`new` と DI コンテナはここに集める
- **サービスロケーター** は依存を隠し、実行時エラーを招くアンチパターン。DI コンテナも Composition Root の外で使うとこれになる
- ライフタイムは **シングルトン・スコープ・トランジェント**。**長生きするものが短命なものを抱え込まない**（捕らわれた依存）
- まずは **手動 DI** で始め、必要になってから DI コンテナを検討する

---

## 参考資料

- [Martin Fowler — Inversion of Control Containers and the Dependency Injection pattern（2004）](https://martinfowler.com/articles/injection.html)
- [Martin Fowler — DIP in the Wild](https://martinfowler.com/articles/dipInTheWild.html)
- [Inversion of control（Wikipedia）](https://en.wikipedia.org/wiki/Inversion_of_control)
- [Mark Seemann — Service Locator is an Anti-Pattern（2010）](https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/)
- [Understanding the Composition Root（Manning）](https://freecontent.manning.com/dependency-injection-in-net-2nd-edition-understanding-the-composition-root/)
- [Dependency Injection with Mark Seemann（InfoQ）](https://www.infoq.com/articles/DI-Mark-Seemann/)
- [Service Locator is not an Anti-Pattern（Jimmy Bogard：反対意見）](https://www.jimmybogard.com/service-locator-is-not-an-anti-pattern/)
- Steven van Deursen, Mark Seemann『Dependency Injection Principles, Practices, and Patterns』（Manning）

---

## 関連ノート

- [[01_依存性注入]]
- [[01依存性逆転]] / [[02_依存関係逆転の原則]]
- [[04_インターフェースと抽象化]]
- [[04_疎結合・インターフェース・DIP・DIの整理]] — 4つの概念の関係とモジュールでの実現（43_モジュール設計）
- [[02_依存関係の管理]] — モジュール単位の Composition Root（43_モジュール設計）
