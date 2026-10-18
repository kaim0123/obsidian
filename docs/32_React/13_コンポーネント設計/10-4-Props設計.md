# 10-4. Props設計（責務・命名・型）

## 🎯 この章で学ぶこと

- 良いprops設計の3原則：責務・命名・型
- ブール props の使いすぎを避ける方法
- 命名のテンプレ（onClick, isOpen, ariaLabel...）

---

## 📖 3原則

### 1. 責務（Responsibility）

「**このpropsは何のために存在する？**」を明確に。

- 🎯 1propsで1つの責任
- 似た意味のpropsを増やさない

### 2. 命名（Naming）

「**読んだだけで意味が分かる**」名前。

- 動詞 vs 名詞、肯定形を使う
- イベントは `on〇〇`、状態は `is〇〇` / `has〇〇`

### 3. 型（Type）

「**間違って渡せない**」ようTypeScriptで縛る。

→ [[11-1-propsの型付け]]

---

## 💻 命名テンプレート

| 種類 | 命名 | 例 |
| --- | --- | --- |
| 真偽値 | `is〇〇` `has〇〇` `should〇〇` | `isOpen`, `hasError`, `shouldShowDialog` |
| イベント | `on〇〇` | `onClick`, `onSubmit`, `onChange` |
| 関数 | 動詞 | `handleClick`, `formatDate` |
| 子要素 | `children` | `<Card>{children}</Card>` |
| データ | 名詞 | `user`, `items`, `count` |
| ARIA | `aria〇〇` | `ariaLabel`, `ariaDescribedby` |

---

## 💻 良くないprops設計

### ❌ ブール地獄

```jsx
<Button
  primary
  large
  outlined
  iconLeft
  loading
  disabled
/>
```

→ 組み合わせの数が爆発、矛盾するブール（primary + outlined）。

### ✅ 列挙型に集約

```jsx
<Button variant="primary" size="large" />
```

→ 矛盾を防げる、型として表現しやすい。

---

## ❌ 似たpropsを並列化

### Bad

```jsx
function User({ user_name, user_email, user_age }) { ... }
```

### Good

```jsx
function User({ user }) {
  return <p>{user.name} ({user.age}) {user.email}</p>;
}
```

→ オブジェクトでまとめる。

---

## 💻 「肯定形」を使う

### ❌ 否定形

```jsx
<Button notDisabled />  // 二重否定で混乱
<Modal notHidden />
```

### ✅ 肯定形

```jsx
<Button enabled />     // または disabled で素直に
<Modal visible />
```

---

## 💻 デフォルト値で簡潔に

```jsx
function Button({ size = 'medium', variant = 'primary', children }) {
  // ...
}

// 使う側はカスタムが必要なときだけ書く
<Button>OK</Button>                          // デフォルト
<Button size="large">大きい</Button>           // sizeだけ変える
```

---

## 💻 children を活用

### ❌ 文字列だけ受け取る

```jsx
<Card title="お知らせ" body="本文" />
```

### ✅ children で柔軟に

```jsx
<Card title="お知らせ">
  <p>本文</p>
  <button>OK</button>
</Card>
```

→ 何でも入れられる。

---

## 💻 spread propsの使い方

```jsx
function CustomInput({ label, ...rest }) {
  return (
    <label>
      {label}
      <input {...rest} /> {/* 他のpropsをそのまま */}
    </label>
  );
}

// 使う側：input標準の属性が全部使える
<CustomInput label="名前" type="text" placeholder="..." maxLength={10} />
```

→ 利点：標準HTML属性をすべて利用できる。

注意：意図しないpropsまで渡る恐れ → TypeScriptで型を絞る。

---

## 💻 props は必要最小限

### ❌ なんでも渡す

```jsx
<UserCard
  user={user}
  onClick={...}
  showAvatar
  showEmail
  showAge
  showJob
  emailFormat="long"
  size="medium"
  highlightOnHover
  cornerRadius={10}
/>
```

→ 使いづらい。

### ✅ 必要なものだけ

```jsx
<UserCard user={user} onClick={...} />
```

variant や theme で全体を切り替える方が読みやすい。

---

## 💻 イベントの引数

### ❌ あいまいな引数

```jsx
onClick={(e) => onSelect()}
```

### ✅ 必要な情報を渡す

```jsx
onClick={() => onSelect(item.id)}
```

または、子から親に **値ベースで通知**：

```jsx
onChange={(value) => onChange(value)}  // value だけ
// イベントオブジェクトをそのまま渡すかは設計判断
```

---

## ❌ よくある間違い

### Boolean を5個以上

```jsx
<Modal isOpen isFullscreen isCentered hasCloseButton hasBackdrop />
```

→ variant や options に集約。

### イベント名のtypo

```jsx
<Button onClik={...} /> // typo
```

→ TypeScriptで防ぐ。

### 子で props を直接書き換え

→ propsは読み取り専用。

### `any` 型で受ける

```ts
function Card(props: any) { ... } // ❌
```

→ ✅ 具体的な型を付ける。

---

## ✅ ベストプラクティス

1. **命名テンプレート**を守る（is/on/has）
2. **ブール3個以上は variant 化**を検討
3. **オブジェクトで関連propsをまとめる**
4. **デフォルト値**でAPIを簡潔に
5. **TypeScript の型** で防御

---

## 🔬 実践演習

`Button` コンポーネントの props を設計：

- variant: 'primary' | 'secondary' | 'danger'
- size: 'small' | 'medium' | 'large'
- loading（送信中表示）
- disabled
- onClick
- icon（アイコン要素）
- children

TypeScript で型定義を書く。

---

## 📝 まとめ

- 命名：is/on/has のテンプレ
- ブール3個以上は variant 化
- オブジェクトでまとめる
- 型で防御
- children で柔軟性を上げる

---

## 🔗 関連ページ

- [[10-3-カスタムフック]]
- [[10-5-Compound-Components-RenderProps]]
- [[11-1-propsの型付け]]
