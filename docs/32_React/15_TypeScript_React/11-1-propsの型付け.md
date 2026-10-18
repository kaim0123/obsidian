# 11-1. propsの型付け（interface/type）

## 🎯 この章で学ぶこと

- propsに型を付けるメリット
- `interface` と `type` の違いと使い分け
- よく使う型パターン（オプショナル、Union、children）

---

## 📖 概念の説明

### 型を付けると何が嬉しい？

- **間違えて渡せない**（typoや型違いをコンパイル時に発見）
- **自動補完**が効く
- **ドキュメント代わり**になる
- **リファクタが安全**

### 基本：型を1つ作って渡す

```tsx
type ButtonProps = {
  label: string;
  onClick: () => void;
};

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// 使う側
<Button label="OK" onClick={() => alert('hi')} />
<Button label="OK" />              // ❌ onClick がない（コンパイルエラー）
<Button label={123} onClick={...} /> // ❌ labelは string
```

---

## 💻 interface vs type

両方ほぼ同じことができる。プロジェクトで統一すればOK。

### interface

```ts
interface User {
  id: number;
  name: string;
}

interface User { // 同名で拡張可能
  email: string;
}
```

### type

```ts
type User = {
  id: number;
  name: string;
};

type User2 = User & { email: string }; // 交差型で拡張
```

### 使い分けの目安

| | interface | type |
| --- | --- | --- |
| オブジェクト型 | ◎ | ◎ |
| Union型 | ✗ | ◎ |
| 拡張（同名で再宣言） | ◎ | ✗ |
| ライブラリの型を拡張 | ◎ | △ |

→ **propsには type** がよく使われる（Union が書きやすい）。

---

## 💻 オプショナルprops

```tsx
type ButtonProps = {
  label: string;
  onClick?: () => void;     // オプショナル（? 付き）
  disabled?: boolean;
};

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}
```

`onClick` が任意。`disabled` はデフォルト値で false。

---

## 💻 Union 型でvariant

```tsx
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
};
```

→ 文字列リテラル以外を渡すとエラー。

---

## 💻 children の型

```tsx
type CardProps = {
  title: string;
  children: React.ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

`React.ReactNode` は「JSX、文字列、数字、null、配列など、レンダリング可能なもの全部」。

詳しくは [[11-4-childrenの型]]。

---

## 💻 PropsWithChildren

`PropsWithChildren` でchildren を自動追加：

```tsx
import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{
  title: string;
}>;
// = { title: string; children?: React.ReactNode }
```

---

## 💻 ジェネリックpropsで再利用

```tsx
type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}

// 使う
<List items={users} renderItem={(u) => u.name} />
<List items={products} renderItem={(p) => p.title} />
```

---

## 💻 HTML属性をマージ

inputなどの拡張で、標準HTML属性を全部引き継ぎたい：

```tsx
import type { InputHTMLAttributes } from 'react';

type CustomInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function CustomInput({ label, ...rest }: CustomInputProps) {
  return (
    <label>
      {label}
      <input {...rest} />
    </label>
  );
}
```

→ `placeholder`、`maxLength`、`type` などすべて型安全に渡せる。

---

## 💻 関数 prop の型

```tsx
type FormProps = {
  onSubmit: (data: { name: string; email: string }) => void;
  onCancel?: () => void;
};
```

引数も戻り値も明示。

### React のイベント型

```tsx
import type { ChangeEvent, MouseEvent } from 'react';

type Props = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
};
```

→ 詳しくは [[11-3-イベント型]]。

---

## ❌ よくある間違い

### `any` で逃げる

```ts
function Component(props: any) { ... }
```

→ ✅ 具体的な型を付ける。

### typeof で複雑化

```ts
type Props = typeof someComponent['props']; // 過剰
```

→ ✅ 素直に type/interface を書く。

### Union を `|` 単独で書く（type必須）

```ts
interface X { ... } | { ... } // ❌ NG
```

→ ✅ `type X = ... | ...`。

### children を必須にしてないのに必須扱い

```tsx
type Props = { children: React.ReactNode };
<Component /> // ❌ children がない
```

→ ✅ 任意なら `children?: React.ReactNode`。

---

## ✅ ベストプラクティス

1. **propsには type で十分**（プロジェクトで統一）
2. **オプショナルは `?` 付き**
3. **variant は Union 型**
4. **HTML属性継承**で拡張系コンポーネント
5. **`any` は最後の手段**

---

## 🔬 実践演習

`Card` コンポーネントの props を型定義：

- title（必須）
- subtitle（任意）
- variant: 'default' | 'primary' | 'success'
- onClick（任意）
- children（必須）

実装と使用例を書く。

---

## 📝 まとめ

- type/interface のどちらでもOK、propsには type
- オプショナルは `?`
- Union 型で variant
- ReactNode で children
- 標準HTML属性を継承して拡張

---

## 🔗 関連ページ

- [[10-4-Props設計]]
- [[11-2-useState-useReducerの型]]
- [[11-3-イベント型]]
- [[11-4-childrenの型]]
