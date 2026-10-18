# 4-2. state設計のコツ（最小・正規化・派生は計算）

## 🎯 この章で学ぶこと

- 「stateを最小限にする」とはどういうことか
- 派生する値（合計・件数など）はstateにしない理由
- データの「正規化」（同じ情報を二重に持たない）

---

## 📖 概念の説明

### 大原則：stateは少ないほど良い

stateが多いと：

- 同期が大変（あっちを変えたら、こっちも更新…）
- バグが増える
- 画面が遅くなる

なので、**「本当にstateにする必要があるか？」**を毎回考えます。

### 3つのコツ

1. **最小限**にする
2. **派生する値**はstateにしない（計算で出す）
3. **正規化**する（同じ情報を二重に持たない）

---

## 💻 コツ1：最小限のstate

### ❌ 不要なstateの例

```jsx
// 入力した名前と、その大文字版をstateで持つ
const [name, setName] = useState('');
const [upperName, setUpperName] = useState('');

function handleChange(e) {
  setName(e.target.value);
  setUpperName(e.target.value.toUpperCase()); // 同期が必要
}
```

### ✅ 大文字版は計算で

```jsx
const [name, setName] = useState('');
const upperName = name.toUpperCase(); // 毎レンダー計算

return (
  <input value={name} onChange={(e) => setName(e.target.value)} />
);
```

`name` だけstateで持ち、`upperName` は派生値（計算結果）に。

---

## 💻 コツ2：派生する値はstateにしない

### ❌ 合計をstateで持つ

```jsx
const [items, setItems] = useState([{ price: 100 }, { price: 200 }]);
const [total, setTotal] = useState(300);

function addItem(item) {
  setItems([...items, item]);
  setTotal(total + item.price); // 同期が必要！
}
```

### ✅ 合計は計算で

```jsx
const [items, setItems] = useState([{ price: 100 }, { price: 200 }]);
const total = items.reduce((sum, i) => sum + i.price, 0);

function addItem(item) {
  setItems([...items, item]);
  // total は自動で再計算される
}
```

合計が変わるかどうかはitemsだけ気にすればいい。同期忘れがなくなる。

### 重い計算は useMemo で

```jsx
const total = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items]);
```

`items` が変わったときだけ再計算する。詳しくは [[9-2-React-memo-useMemo-useCallback]]。

---

## 💻 コツ3：正規化（同じ情報を二重に持たない）

### ❌ 同じ情報をあちこちに

```jsx
const [users, setUsers] = useState([
  { id: 1, name: '太郎' },
  { id: 2, name: '花子' },
]);
const [selectedUser, setSelectedUser] = useState({ id: 1, name: '太郎' });
// 太郎の名前を変えたいとき、両方更新が必要
```

### ✅ idだけ持つ

```jsx
const [users, setUsers] = useState([
  { id: 1, name: '太郎' },
  { id: 2, name: '花子' },
]);
const [selectedId, setSelectedId] = useState(1);

const selectedUser = users.find((u) => u.id === selectedId);
```

`users` を更新すれば、`selectedUser` も自動で正しい値に。

### データベース風の正規化

リスト（配列）と詳細（オブジェクト）を分離するパターンも有効：

```jsx
// 配列とマップを両方持つ
const [usersById, setUsersById] = useState({
  1: { id: 1, name: '太郎' },
  2: { id: 2, name: '花子' },
});
const [userIds, setUserIds] = useState([1, 2]);

// 一覧 = userIds.map((id) => usersById[id])
// 個別取得は usersById[id] で速い
```

大規模アプリで便利（小規模では普通の配列で十分）。

---

## 📎 実務メモ：state を減らす判断（旧 `03-stateと画面の整理`）

レビューでよく出る「**不要な `useState` をやめる**」「**制御とブラウザバリデーションの二重管理をやめる**」を整理したメモです（フォーム全般は [[02-FormDataと入力の扱い]] と併読）。

### 制御から非制御寄りへ（Select と `name`）

送信時に必要なのは **最終的に選ばれた値**であり、**入力のたびに React が全部把握している必要はない**場合が多いです。項目専用の state をやめ、**`name` を付けた Select に値の保持を任せ**、送信時に `FormData` で読むと、二重管理を避けられます。

| 用語 | 意味 |
|------|------|
| **制御コンポーネント** | `value={state}` と `onChange` で表示と更新が React の state に結びついている状態 |
| **非制御（ここでの意図）** | その項目専用の state をやめ、`name` を付けて DOM／フォームに任せ、送信時にまとめて読む考え方 |

```tsx
// 修正前（イメージ）
<Select value={employeeCount} onValueChange={setEmployeeCount} required />

// 修正後（イメージ）
<Select name="employee_count" required />
```

### 送信ボタン `disabled` の単純化

「必須かどうか」を **state で見る**のと **`required` で見る**のを両方書くとルールがずれやすいです。`employeeCount` / `inquiryType` の state をやめたなら、`disabled` からもその条件を外し、**未入力は `required` のブラウザバリデーションに任せる**のが筋がよいです。

```tsx
// 例：同意チェックと送信中だけボタン側で抑止
disabled={!agreed || isSubmitting}
```

### 遷移で消える成功メッセージ用 state は持たない

成功時に **`window.location.assign` で別ページへ遷移**するなら、コンポーネントは **アンマウント**されます。`submitSuccess` のように **画面上に表示する余地がない state** は削除し、成功時は遷移だけに寄せます。state を消したら、**その state だけを参照している JSX**（条件付きレンダリングのブロック）も一緒に削除します。

---

## 💡 stateにすべきか、計算にすべきか？

### 判定フロー

```text
このデータは...
  - 他のstateから計算できる？
    → ✅ 計算する（useMemo）
  - ユーザーが直接変える？
    → ✅ stateにする
  - 親から渡される？
    → ✅ propsで受け取る（stateにしない）
  - URLに含まれる？
    → ✅ URLから取る（searchParams）
  - 永続化が必要？（リロード後も残す）
    → ✅ localStorage or サーバ
```

---

## 💻 例：フィルタ可能なリスト

### ❌ よくない設計

```jsx
const [items, setItems] = useState([...]);
const [filter, setFilter] = useState('');
const [filteredItems, setFilteredItems] = useState([...]); // ← 不要！

function handleFilter(e) {
  setFilter(e.target.value);
  setFilteredItems(items.filter((item) => item.name.includes(e.target.value)));
}
```

### ✅ よい設計

```jsx
const [items, setItems] = useState([...]);
const [filter, setFilter] = useState('');

const filteredItems = items.filter((item) => item.name.includes(filter));
// → filterかitemsが変わるたびに自動で再計算
```

---

## ❌ よくある間違い

### propsを useState の初期値に入れる（同期されない）

```jsx
function Child({ initialName }) {
  const [name, setName] = useState(initialName);
  // initialName が変わっても name は更新されない
}
```

→ propsで直接表示するか、必要なら useEffect で同期。詳しくは [[5-2-依存配列の読み方]]。

### 計算可能な値をstateにする

→ 同期忘れの温床。**派生は計算**で。

### 全部正規化にする（過剰設計）

→ 規模が小さければ普通の配列でOK。複雑度を増やしすぎない。

---

## ✅ ベストプラクティス

1. **「これは計算で出せないか？」**を毎回考える
2. **state = ユーザーが直接変える / サーバから来る もの**
3. **同じ情報は1箇所**に（正規化）
4. 重い計算は **useMemo**
5. 大規模なら ID参照スタイル も検討

---

## 🔬 実践演習

「ショッピングカート」を最小設計で作る：

- 商品リスト（state）
- 数量（state）
- 各商品の小計（→ 計算）
- カート全体の合計（→ 計算）
- 割引適用後の合計（→ 計算）

stateは2つだけ、残りは計算で出せるはず。

---

## 📝 まとめ

- stateは最小限に
- 派生する値はstateにせず計算で
- 同じ情報を二重に持たない（正規化）
- 重い計算は useMemo

---

## 🔗 関連ページ

- [[4-1-useStateの基本]]
- [[4-3-setStateの落とし穴]]
- [[4-4-Immutable更新]]
- [[9-2-React-memo-useMemo-useCallback]]
- [[02-FormDataと入力の扱い]]
