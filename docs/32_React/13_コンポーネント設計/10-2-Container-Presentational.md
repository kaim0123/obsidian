# 10-2. Container/Presentational（考え方）

## 🎯 この章で学ぶこと

- Container / Presentational パターンとは
- いつ使うか / 使わないか
- カスタムフック時代の現代的な考え方

---

## 📖 概念の説明

### 古典的なパターン（2015年頃）

| 種類 | 役割 | 中身 |
| --- | --- | --- |
| **Container** | データを取って来る | useEffect, fetch, state |
| **Presentational** | 見た目を作る | props を JSX に |

```text
[Container] → propsで渡す → [Presentational]
   (データ)                    (表示)
```

### 例

```jsx
// Container
function UserListContainer() {
  const { users } = useUsers();
  return <UserListView users={users} />;
}

// Presentational
function UserListView({ users }) {
  return (
    <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
  );
}
```

---

## 💡 現代の見方：カスタムフックで十分

実は**カスタムフックが出てきた今**、コンポーネントを2つに分ける必要はなくなりました。

```jsx
function UserList() {
  const { users } = useUsers(); // ロジックはフックに
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

→ 1つのコンポーネントで「**フック呼び出し + 表示**」できる。

ただし、**見た目だけを再利用したい**場合は分離が有効。

---

## 💻 分離が有効なケース

### ① Storybookで見た目だけプレビュー

```jsx
// UserListView.stories.jsx
export const WithUsers = () => (
  <UserListView users={[{ id: 1, name: '太郎' }]} />
);

export const Empty = () => <UserListView users={[]} />;
export const Loading = () => <UserListView loading />;
```

→ propsで状態を切り替えられる。

### ② 違うデータソースで同じ見た目

```jsx
// API取得版
function ApiUserList() {
  const { users } = useApiUsers();
  return <UserListView users={users} />;
}

// localStorage版
function LocalUserList() {
  const users = useLocalUsers();
  return <UserListView users={users} />;
}
```

### ③ デザイナーが UI だけ確認

`Presentational` だけ見せて、機能は後で繋げる。

---

## 💻 例：完全分離

```jsx
// presentation/UserCard.jsx
export function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onEdit(user.id)}>編集</button>
      <button onClick={() => onDelete(user.id)}>削除</button>
    </div>
  );
}

// container/UserCardContainer.jsx
import { UserCard } from '../presentation/UserCard';
import { useUsers } from '../hooks/useUsers';

export function UserCardContainer({ userId }) {
  const { user, deleteUser, editUser } = useUsers();
  if (!user) return null;
  return <UserCard user={user} onEdit={editUser} onDelete={deleteUser} />;
}
```

`UserCard` は再利用可能、`Container` は1か所のロジック専用。

---

## 💻 違うアプローチ：features 単位

```text
src/
├─ features/
│  ├─ users/
│  │  ├─ UserList.jsx      # フックを使う
│  │  ├─ UserCard.jsx      # 見た目
│  │  ├─ useUsers.js       # ロジック
│  │  └─ usersApi.js       # API
│  └─ posts/
└─ components/
   ├─ Button.jsx           # 共通の見た目
   └─ Modal.jsx
```

機能（feature）単位で **コンポーネント・フック・APIをまとめる**。これが現代的なアプローチ。

→ 詳しくは [[10-6-ディレクトリ設計]]

---

## ❌ よくある間違い

### 何でも Container / Presentational に分ける

→ 小さなコンポーネントには過剰。

### Container にも見た目を書く

```jsx
function UserListContainer() {
  const { users } = useUsers();
  return (
    <div>{/* 見た目を書いてしまう */}
      <h1>ユーザー一覧</h1>
      <ul>...</ul>
    </div>
  );
}
```

→ ✅ Containerは UserListView を呼ぶだけにする、または分けない。

### Presentationalで useState を使う

```jsx
function UserListView({ users }) {
  const [search, setSearch] = useState(''); // ❌ 状態を持ってしまう
}
```

→ ✅ 完全な Presentational は state なし、props だけで動く。

---

## ✅ ベストプラクティス

1. **シンプルなアプリは分けない**
2. **再利用 / Storybook 用途**で分ける
3. **カスタムフック で十分**なら分離不要
4. **features フォルダ**でまとめる方が現代的
5. **強制的なルールにしない**

---

## 🔬 実践演習

`TodoList` を以下に分ける：

- `useTodos` カスタムフック
- `TodoListView`（propsだけで動く見た目）
- `TodoList`（フックを呼び、Viewに渡す）

各ファイルを別々に作成。

---

## 📝 まとめ

- 古典的な Container / Presentational
- カスタムフックがあれば必須ではない
- 再利用・Storybookで有効
- features単位の整理も現代的

---

## 🔗 関連ページ

- [[10-1-UIコンポーネントとロジックの分離]]
- [[10-3-カスタムフック]]
- [[10-6-ディレクトリ設計]]
