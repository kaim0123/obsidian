---
title: "Authorization Explained: When to Use RBAC, ABAC, ACL & More"
source: "https://www.youtube.com/watch?v=DT6Zy1X3ytM"
author:
  - "[[Hayk Simonyan]]"
published: 2025-07-29
created: 2026-05-17
description: "Become a senior software engineer with a job guarantee: https://go.hayksimonyan.com/131-authorizationLearn how real-world systems control what users can do u..."
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=DT6Zy1X3ytM)

## Transcript

## 日本語要約

この動画では、**認証（Authentication）の次の段階**である**認可（Authorization）**を解説する。ログインが成功しシステムが「誰か」を特定したあと、**そのユーザーがどのリソースにアクセスでき、どの操作を実行できるか**を決めるのが認可である。許可される操作と拒否される操作の両方を定義することで、システムのセキュリティとプライバシーを守る。

動画では、実務でよく使われる**3つの認可モデル**（RBAC・ABAC・ACL）と、それらを**実装・強制する仕組み**（OAuth 2、JWT など）を分けて説明している。本番システムでは単一モデルに限定せず、要件に応じて**複数モデルを組み合わせる**ことが一般的である。

---

### 認証と認可の違い

| 段階 | 答える問い | 例（GitHub） |
|------|-----------|--------------|
| **認証** | 誰か？ログインしてよいか？ | ユーザー名・パスワード、SSO で本人確認 |
| **認可** | ログイン後、何ができるか？ | リポジトリへの read / write / admin |

GitHub のリポジトリを例にすると、同じリポジトリでもユーザーごとに権限が異なる。

- **ユーザー A**：write のみ → コードの push は可能だが、設定変更や削除は不可（動画の例では pull request 作成も不可と説明）
- **ユーザー B**：read のみ → 閲覧のみ
- **管理者**：フルコントロール → 設定変更、リポジトリ削除、他ユーザーの権限管理など

この「ユーザーごとに異なるアクセス制御」を体系的に管理するのが、以下の認可モデルである。

---

### 3つの主要な認可モデル（概要）

| モデル | 略称 | 考え方 | 代表例 |
|--------|------|--------|--------|
| **ロールベース** | RBAC | ユーザーに**ロール**を付与し、ロールごとに権限セットを定義 | GitHub、Jira、CMS、チーム管理ツール |
| **属性ベース** | ABAC | ユーザー・リソース・環境の**属性と条件**で許可／拒否を判定 | 部門・機密区分・時間帯・端末種別などの組み合わせ |
| **アクセス制御リスト** | ACL | **リソース単位**に「誰が何をできるか」のリストを持つ | Google ドキュメントの共有設定 |

いずれもトレードオフがあり、システム要件（規模、柔軟性、運用コスト）に応じて選ぶ。大規模な本番では RBAC を土台に ABAC で細かい条件を足す、特定リソースだけ ACL で共有する、といった**ハイブリッド**がよくある。

---

### 1. RBAC（Role-Based Access Control）

**最も普及している**認可モデル。ユーザー → ロール → 権限、という階層で管理する。

#### 典型的なロール例

| ロール | できること（概略） | できないこと（概略） |
|--------|-------------------|---------------------|
| **Admin** | 作成・読取・更新・削除、他ユーザー・ロールの管理 | （ポリシー次第） |
| **Editor** | コンテンツの作成・読取・更新 | 削除、他ユーザーの管理 |
| **Viewer** | 読取のみ | 作成・更新・削除 |

#### 向いている場面

- 組織内の役割が比較的固定している（管理者／編集者／閲覧者など）
- ダッシュボード、CMS、社内ツール、開発プラットフォーム
- 権限の説明・監査が「ロール名」で分かりやすいことが重要

#### 限界

- 「同じ Editor でも、部門が HR のときだけこのファイル」といった**細かい条件**には不向き
- ロールが増えすぎると**ロール爆発（role explosion）**になり、運用が難しくなる

---

### 2. ABAC（Attribute-Based Access Control）

ロールを超え、**属性（attributes）とポリシー**でアクセスを決める。RBAC より柔軟だが、設計・運用は複雑になる。

#### 判定に使う属性の種類

1. **ユーザー属性**：部門（例：HR）、年齢、雇用形態、クレーム上のグループなど
2. **リソース属性**：機密区分（internal / public）、所有者、分類ラベルなど
3. **環境属性**：時刻、地理位置、デバイス種別、IP レンジなど

#### ポリシーの例（動画のイメージ）

> ユーザーの `department` が **HR** **かつ** リソースの分類が **internal** のときだけ、read または write を許可する。

複数条件を AND / OR で組み合わせ、read / write を個別に指定できる。RBAC と**併用**することも多い（ロールで大枠、ABAC で例外や細部）。

#### 向いている場面

- 同じロールでも、データの機密度・部門・時間帯で制限が変わる
- コンプライアンスやゼロトラスト寄りの「常に条件付き」アクセス

#### 注意点

- **ポリシー管理**（誰がどのルールを書けるか、テスト、バージョン管理）が必須
- ルールが増えると**競合・矛盾**（ある条件では許可、別条件では拒否）の検出が難しい
- デバッグ時に「なぜ拒否されたか」を説明しづらいことがある

---

### 3. ACL（Access Control List）

**各リソース**に対して、「どの主体（ユーザー／グループ）がどの権限を持つか」のリストを持つ。RBAC のように「システム全体のロール表」ではなく、**リソース中心**のモデルである。

#### 動作イメージ（ドキュメント1件）

| ユーザー | このドキュメントへの権限 |
|----------|-------------------------|
| Alice | read のみ |
| Bob | read + write |
| その他 | アクセスなし |

管理するのは次の2点である。

1. **誰が**このリソースにアクセスできるか
2. その主体ごとに**どの操作**が許可されるか

#### 代表例：Google ドライブ

1つの Google ドキュメントを、同僚 A には閲覧のみ、同僚 B には編集・コメント可、という**共有リンク／共有設定**が ACL の典型である。リソース単位の細かい制御に優れる。

#### 向いている場面

- ファイル、フォルダ、レコード単位で「この人だけ編集可」が必要
- ユーザー数・オブジェクト数が中規模で、リストの運用が現実的

#### 限界

- ユーザー・オブジェクトが**数百万規模**になると、リストの更新・同期・クエリコストが重くなる（Google ドライブのように大規模でも可能だが、慎重な設計とインフラが必要）
- 組織全体の一貫したポリシーを ACL だけで揃えるのは難しい

---

### モデル選びの目安

| 要件 | 第一候補 | 補足 |
|------|----------|------|
| 社内アプリで役割が明確 | **RBAC** | Admin / Member / Guest など |
| 部門・機密・時間で細かく変える | **ABAC**（または RBAC + ABAC） | ポリシーエンジン（OPA、Cedar 等）の検討 |
| 1ファイル・1レコード単位の共有 | **ACL** | ドキュメント、カレンダー、共有フォルダ |
| 大規模 SaaS | 多くは **RBAC + リソース ACL** の併用 | GitHub もロール＋リポジトリ単位の権限 |

---

### 認可を「強制」する仕組み（モデルではない）

動画では、認可**モデル**（何を許可するかの設計）と、それを運ぶ**メカニズム**（トークン・プロトコル）を明確に分けている。

#### OAuth 2 — 委任された認可（Delegated Authorization）

**第三者アプリ**が、ユーザーの代わりに別サービスのリソースにアクセスするときの**プロトコル**である。認可モデルそのものではなく、**安全に権限を委譲するための枠組み**。

**例：Vercel が GitHub リポジトリにアクセス**

- ❌ GitHub のユーザー名・パスワードを Vercel に渡す → 第三者にフル権限を渡すことになり危険
- ✅ ユーザーが GitHub 上で「どのリポジトリに」「どの操作（read / push 等）まで」を承認 → GitHub が**アクセストークン**を発行 → Vercel はそのトークンの範囲内だけ操作

OAuth 2 は、このトークンを**安全に発行・検証するフロー**を定義する。スコープ（読取のみ、特定リポジトリのみ、削除不可など）をユーザーが承認した内容に限定できる。

#### JWT / Bearer トークン — リクエストごとの認可情報の運搬

認証成功後、多くの API は **JWT**（または Bearer トークン）をクライアントに返す。以降のリクエストでは `Authorization: Bearer <token>` で送り、サーバーが検証する。

トークンに含めがちな情報（クレーム）の例：

- ユーザー ID
- **ロール**（admin / editor など）
- **スコープ**（アクセス可能な API や操作の範囲）
- 有効期限（exp）
- 発行者（iss）

サーバーはトークンを検証したうえで、RBAC / ABAC などの**ポリシーに照らして**最終的に許可／拒否する。

#### 重要な区別（動画の要点）

| 種類 | 役割 |
|------|------|
| **トークン（JWT 等）** | 身元・ロール・スコープなどの**クレームを運ぶメカニズム** |
| **認可モデル（RBAC / ABAC / ACL）** | 「このユーザーは何をしてよいか」を決める**ルールの設計** |

トークンに `role: editor` が入っていても、**そのロールが何を意味するか**は RBAC の定義側で決める。トークンだけでは認可設計は完結しない。

---

### 実装時のチェックリスト

1. **認証のあと**に認可を必ず挟む（「ログインできた＝全部できる」にしない）
2. まず **RBAC** で大枠を設計し、必要なら **ABAC** や **ACL** を足す
3. 外部連携は **OAuth 2** でパスワード共有を避け、スコープを最小限に
4. API では **短命アクセストークン** + サーバー側でのポリシー評価を組み合わせる
5. 拒否時は理由が追えるようログ・監査（誰が・何に・なぜ拒否されたか）を残す

---

### 動画のまとめ（一文）

認可は「入場許可（認証）」の先で「館内で何ができるか」を制御する仕組みであり、**RBAC・ABAC・ACL** の3モデルはそれぞれ役割・属性・リソース単位で得意分野が異なる。本番では **OAuth 2** や **JWT** で権限情報を安全に渡しつつ、モデル側で何を許可するかを定義する。関連する認証の整理は [[04_開発者が知るべき認証の7つの概念（Hayk Simonyan）]]、社内システムでの IdP・トークン運用は [[07_社内システム向け認証方式の選び方]] を参照。

---

### はじめに

**0:00** · Authorization is the step that happens after authentication. Once someone is logging in into our system. So once the login request is approved which means that the system now knows who the user is. The next step is deciding what they can do which is the step of authorization. It needs to check what resources or actions that user has permissions to access and also what are the denied actions for this user. This is how we control security and privacy in the systems.

**0:27** · And in this video, you'll learn how applications and systems manage permissions using the free main authorization models. The first one is role- based access control.

**0:38** · Next, we have attribute-based access control. Also, access control list, which is another way of managing authorization. Plus, you'll learn how technologies like O of 2 and GVts help us to enforce those rules in practice.

### 認可とは

**0:52** · So authentication happens first which tells us who the user is and if they are allowed to access our system. But on the next step we have authorization which determines what you can actually do as a user in this system. If we take a look at GitHub as an example and accessing repositories on GitHub there you have different permissions for different users. For example, user A can have write access only which means they can only push code to this repo.

**1:17** · But on the other hand, we can have user B and here you can grant only read access which means they can only read this repository but they cannot push code to it or they cannot create pull requests and so on.

**1:31** · And on the other side we can have also admin users which have full control. So they can manage all the settings for the repository. They can even decide to delete this repository and so on. So you can see that different users can have different access controls on systems. To manage these access controls, we have common authorization models. So the one that we just looked at is the role based authentication model which assigns roles to users something like admin, editor or readonly access, write only access.

### 認可モデル

**2:00** · And this is the most common approach among these authorization models. But we also have attribute-based access control which is based on the user or resource attributes. So this is more flexible and more complex compared to the role-based authentication. And the other common approach is to have access control lists ACL and each resource here has its own permissions list.

**2:25** · So you can assign permission lists to a resource and this is what will determine what resources you can access. For example, this is a common way of managing Google Docs. And we will look at this in more detail now.

**2:39** · And each of these models has its trade-offs, pros and cons. So this depends on the specific system requirements. But real systems often combine also multiple models together to have more complex and more secure setup.

### RBAC: ロールベースアクセス制御

**2:54** · So first up, we have RO based access control or RBAC as an acronym. Here users are assigned to roles and each role has a defined set of permissions.

**3:04** · For example, as you saw with the GitHub, you can have admins and admins usually have full access to all resources. So they can create, they can read or update resources. They can even delete resources and also manage other users in the roles. And next you have editor which is usually a bit less than admin.

**3:24** · So they can edit content like creating or reading content or updating resources but they cannot delete resources and they cannot also manage other users. And next you can have viewer users which can only read data. So they can read the resources and content but they cannot update anything or they cannot create anything in your system.

**3:44** · This is the most common way in authorization models and this is used in apps that you use daily like you saw with GitHub or stride dashboards or CMS tools, team management tools and so on. The next model is attribute-based access control or ABAC in short. This access control goes beyond the roles. So it uses the user attributes or resource attributes and environment conditions to define the access. Some example policy you can see here.

### ABAC: 属性ベースアクセス制御

**4:16** · So let's say you want to only allow access if some conditions are met.

**4:21** · In this case whenever the user department is set to HR and you can combine this with multiple conditions like whenever the resource attribute equals to internal and so on and only in this case you allow them access and you either allow them read access or write access. So this can also be combined with the role based authorization.

**4:42** · But in this case you are checking the user model or resource model in your database and based on the attributes you either allow or deny the access. So here as you can see we are checking user attributes like the department the age or whatever you want to check here. Next you can also combine it with resource attributes like confidentiality or the owner of the resource or classification.

**5:07** · And this can also be combined with environment like time of the day, location, device type, and so on. Since you're combining these attributes to either grant or restrict access, this is more flexible than the role-based authorization, but it requires good policy management and generally it's more complex and you can encounter conflicts here with the attribute-based access control. The third common type is the access control lists.

### ACL: アクセス制御リスト

**5:32** · Instead of providing role based access or attribute based access, you can have access control list for the specific resource.

**5:42** · Let's say you have a resource like a document or a JSON file. And here you can have a permission list on which users can access this document like user Alice has only read access or user Bob has both read and write access and another user has no access to this document. So as you can see we're managing two things here. First of all, which users are allowed to access this document and second, what are their permissions? So each of the users has different permissions on this document.

**6:14** · ACL's are highly specific and also user centric, which means it's hard to scale them well in systems with millions of users or objects unless you manage them carefully. But for example, Google drive is one example of this where you have documents like a Google doc and then you share this Google doc with your colleagues, right? So you share someone with read access only and then you share this doc with someone else but now they can also edit and add comments to this document.

**6:44** · So this is a example of ACL access control list which is used in Google drive and Google documents. This gives you more control over resources and documents, but it's also harder to scale with millions of users, but it's possible as you can see because Google Drive is using this for their documents, Excel sheets, and so on.

**7:04** · If you'd like to learn how to build this into a real world application and not just hear it in theory, then the first link in the description is my mentorship program where you will learn how to apply these concepts in production level systems and also implement it hands-on and work closely with me. It will be the first link in the description. So these were the access control models. But how do systems enforce those authorizations?

### OAuth2による委任認可

**7:33** · These are where O of 2 and GVt or access tokens come into play. So first we have O of2 which is delegated authorization which is a protocol used when service wants to access another services resources on a behalf of a user. For example, if you want to let a third-party app read your GitHub repositories. Let's say you're deploying your app to Versel. So you need to give Versel control over your repository on GitHub.

**8:01** · Instead of giving your username and password to the third party application which won't be secure at all because you don't know what they can do with your username and password. This way you are giving them full control.

**8:15** · Instead, GitHub gives them the token that represents the permissions which you approved to use. So you as a user send a request with the third party app to request access to your repositories and then GitHub gives you the access token which you should create. So you should also provide what resources what repositories this third party app can access and also what they can do. Can they create, read, update or can they delete or whatever the permissions you set?

**8:44** · And then GitHub sends them the token which contains the permissions which this third party app is allowed to use and OF2 defines the flow for securely issuing and validating those tokens. So you give them the access token and not your password which represents the permissions that you approved personally. So it can be reading specific repos or also creating pushing to those repositories but not deleting those repositories.

**9:10** · And next we have also token based authorization using GVt or bearer tokens and permission logic. Once a user is authenticated, most systems use a token typically a GV token or this can be also bear token that carries this information like user ID, the roles like admin or editor and also scopes which is what scopes they are allowed to access and whenever this token is expiring and who is the issuer of this token.

### トークンベース認可

**9:40** · So whenever a user makes a request, it always carries this token information and reaches to the backend server. This is where the server will check your token and validity and it will apply the appropriate permission logic. So to not confuse this with authorization models, there is a key distinction. The token usually carries the identity and claims of your user as you see it here. But authorization models like role based or attribute based this is what defines what is allowed to access as a user.

**10:11** · So tokens are just mechanisms while these are authorization models. So in summary authorization isn't just letting users in like authentication but it also controls what they can access once they are in.

### まとめ

**10:26** · We learned what authorization is. what are the three most common authorization models which are role based, attribute-based and access control lists and also you saw a couple of real world examples like how GitHub manages your authorization tokens and this should give you an idea on when to use each model based on the system that you're building and you also saw some implementation patterns with O of 2 or GVT tokens.

**10:51** · Each of these models has their own trade-offs, their own pros and cons, and real systems often combine multiple models to stay flexible and secure.