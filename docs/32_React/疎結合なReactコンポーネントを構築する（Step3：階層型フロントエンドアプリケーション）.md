---
title: "疎結合なReactコンポーネントを構築する（Step3：階層型フロントエンドアプリケーション）"
source: "https://qiita.com/koji0705/items/a94ca036facc551ceceb"
author:
  - "[[koji0705]]"
published: 2026-04-26
created: 2026-05-09
description: "はじめに 前回（Step 2.5）までは、Zodを用いたデータバリデーションと、ビジネスロジックをドメインモデルへ集約する手法を解説しました。 本シリーズの最終回となる今回は、Martin Fowler（マーティン・ファウラー）らが提唱する「階層型フロントエンドアプリケー..."
tags:
  - "clippings"
---
## はじめに

[前回](https://qiita.com/koji0705/items/7be0010f33d1fdc8ff15) （Step 2.5）までは、Zodを用いたデータバリデーションと、ビジネスロジックをドメインモデルへ集約する手法を解説しました。

本シリーズの最終回となる今回は、Martin Fowler（マーティン・ファウラー）らが提唱する **「階層型フロントエンドアプリケーション（Presentation Domain Data Layering）」** の設計思想を導入します。これにより、ReactのHooksが抱えがちな「State管理」「API通信」「ビジネスロジック」の混在を解消し、保守性とテスト容易性の高いアーキテクチャを実現します。

---

## これまでの振り返りと現状の課題

本シリーズでは、段階的にReactアプリケーションの責務分離を進めてきました。

- **Step 1（Custom Hooks）**: UIコンポーネントからロジックを抽出し、見通しを改善。
- **Step 2（Domain Model）**: ビジネスルールをクラスに集約し、凝集度を向上。
- **Step 2.5（Zodバリデーション）**: 外部からの入力データの型安全性を実行時に保証。

しかし、現状のアーキテクチャ（特に Custom Hooks）には、まだ以下の課題が残っています。

### 課題：Hooksへの責務集中

現在の `useUserSearch` は、以下の3つの責務を同時に担っています。

1. **Stateの管理** （Application層の責務）
2. **API通信の実行** （Infrastructure層の責務）
3. **データのフィルタリング** （Domain層の責務）

```typescript
// 現状の課題を示すコード例
export const useUserSearch = () => {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    // ❌ Infrastructureの責務（API通信）が混入
    fetchUsers().then(data => setUsers(data));
  }, []);

  // ❌ Domainの責務（ビジネスロジック）が混入
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  return { filteredUsers };
};
```

この状態では、APIの通信方式（RESTからGraphQL、SSEなど）が変更された際にHooksの改修が必要になります。また、ビジネスロジック（フィルタリング処理など）の単体テストを行うために、 `renderHook` のようなReactの実行環境に依存しなければならない点もテストコストを増大させる要因です。

---

## 解決策：4層アーキテクチャの導入

これらの課題を解決するため、アプリケーションを以下の4つのレイヤーに分離します。

1. **Presentation Layer**: UIの描画とユーザー操作の受け付け（React Component）
2. **Application Layer**: ユースケースの進行とState管理（Custom Hooks）
3. **Domain Layer**: フレームワークに依存しない純粋なビジネスロジック（Pure TypeScript）
4. **Infrastructure Layer**: 外部システム（API等）との通信とデータ変換（Pure TypeScript）

### 依存関係とレイヤー構造（全体図）

最も重要な原則は、 **依存の方向を単一に保つこと** です。  
上位層（Presentation / Application）は下位層に依存できますが、下位層（Domain / Infrastructure）は上位層（特にReactなどの特定のUIライブラリ）に依存してはいけません。

ディレクトリ構造とレイヤー間の依存関係をグラフ化すると以下のようになります。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__e319adc38c0fe2c9ab02d5f7a953c1dd" frameborder="0" height="742"></iframe>

---

## 実装の詳細とディレクトリ構成

この設計方針に基づき、以下のようなディレクトリ構成を採用します。

```shell
src
├── application
│   └── hooks
│       └── useUserSearch.ts      # ステート管理とユースケースの実行
├── domain
│   └── models
│       └── User.ts               # 純粋なビジネスロジック
├── infrastructure
│   └── api
│       ├── UserApiClient.ts      # 低レイヤーの通信実装
│       └── UserRepository.ts     # データアクセスの抽象化
└── presentation
    ├── components                # UIコンポーネント群
    └── pages                     # 画面構成とHooksの注入
```

### 1\. Domain Layer（ビジネスロジックの隔離）

外部ライブラリに依存せず、検索条件のマッチングなどのドメインルールをカプセル化します。

```typescript
// src/domain/models/User.ts
export class UserModel {
  constructor(private readonly user: User) {}

  get displayName(): string {
    return this.user.name || this.user.username || "Unknown";
  }

  matchesQuery(query: string): boolean {
    if (!query) return true;
    
    const searchableText = [
      this.user.name,
      this.user.email,
    ].filter(Boolean).join(" ").toLowerCase();

    return searchableText.includes(query.toLowerCase());
  }
}
```

### 2\. Infrastructure Layer（データアクセスの抽象化）

リポジトリパターンを採用し、API通信の詳細を隠蔽します。取得したデータは、この層でドメインモデル（ `UserModel` ）に変換してから上位層へ渡します。

```typescript
// src/infrastructure/api/UserRepository.ts
export interface UserRepository {
  getAll(): Promise<UserModel[]>;
}

export class UserRepositoryImpl implements UserRepository {
  constructor(private apiClient: UserApiClient) {}

  async getAll(): Promise<UserModel[]> {
    const users = await this.apiClient.fetchUsers();
    return users.map(user => new UserModel(user));
  }
}
```

### 3\. Application Layer（ステート管理への専念）

Custom Hooksは「いつデータを取得し、どのようにStateとして保持するか」というオーケストレーションのみを担当します。具体的な通信処理やフィルタリングロジックは、注入されたRepositoryやDomain Modelに委譲します。

```typescript
// src/application/hooks/useUserSearch.ts
export const useUserSearch = (repository: UserRepository) => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    repository.getAll()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [repository]);

  // ロジックはUserModelに委譲
  const filteredUsers = users.filter(user => user.matchesQuery(query));

  return { users: filteredUsers, query, setQuery, loading };
};
```

### 4\. Presentation Layer（純粋なUIの描画）

Reactコンポーネントは、Hooksから受け取ったデータを描画する責務に特化します。

```tsx
// src/presentation/pages/UserSearchPage.tsx
const repository = new UserRepositoryImpl(new UserApiClient());

export const UserSearchPage = () => {
  // 依存オブジェクトをHookへ注入
  const { users, query, setQuery, loading } = useUserSearch(repository);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} />
      <UserList users={users} loading={loading} />
    </div>
  );
};
```

---

## アーキテクチャのオブジェクト関係図（詳細）

実装した各クラス・モジュールの関係性を整理すると、以下のようになります。先ほどの全体図をより詳細なオブジェクト単位に落とし込んだものです。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__22d9a59bf9e59c766bdef9198b9aeb75" frameborder="0" height="722"></iframe>

上位層（Presentation, Application）は下位層（Infrastructure）の具体的な実装を知らず、インターフェースやドメインモデルのみに依存していることがわかります。

---

## 導入によるメリット

この設計を導入することで、以下の具体的なメリットが得られます。

### 1\. テスト実行環境の独立と高速化

ビジネスロジック（ `UserModel.matchesQuery` ）がReactから切り離されたため、Node.js環境における純粋な関数テストが可能になります。 `renderHook` などを伴うテストに比べ、実行時間は大幅に短縮されます。

### 2\. 技術変更への耐性向上

通信プロトコルをRESTからGraphQLやSSEへ変更する場合、修正範囲は `Infrastructure` 層のみに限定されます。 `Application` や `Presentation` のコードには影響を与えずに技術スタックの移行が可能です。

### 3\. 責務の明確化

修正要件が発生した際、「どこに何を書くべきか」という判断基準が明確になります。

- UIの変更 → Presentation
- 状態管理の変更 → Application
- ビジネスルールの変更 → Domain
- データ取得元の変更 → Infrastructure

---

## まとめ

バックエンド開発で培われてきた「関心の分離（Separation of Concerns）」や「依存性逆転（Dependency Inversion）」といった設計原則は、変更頻度が高く複雑化しやすい現代のフロントエンド開発においても有効に機能します。

Reactは本来、Viewを宣言的に記述するための強力なUIライブラリです。通信処理やビジネスロジックを適切なレイヤーに分離し、Reactを「各層を組み合わせるためのインターフェース」として活用することで、長期的な保守に耐えうる堅牢なフロントエンドアプリケーションを構築することができます。

本シリーズを通じて解説した段階的なリファクタリング手法が、プロジェクトの設計改善の参考になれば幸いです。

---

## 参考文献

- [Modularizing React Applications with Established UI Patterns](https://martinfowler.com/articles/modularizing-react-apps.html) - Martin Fowler
- [Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html) - Martin Fowler
- [GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) - Martin Fowler

[0](#comments)

コメント一覧へ移動

X（Twitter）でシェアする

Facebookでシェアする

はてなブックマークに追加する

新規登録して、もっと便利にQiitaを使ってみよう

1. あなたにマッチした記事をお届けします
2. 便利な情報をあとで効率的に読み返せます
3. ダークテーマを利用できます
[ログインすると使える機能について](https://help.qiita.com/ja/articles/qiita-login-user)