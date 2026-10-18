# Radix UI Select の `name` と FormData（state の二重管理をやめる）

Radix UI の `<Select>` に **`name` を渡すだけ**で、内部で `type="hidden"` の input が作られ、`<form>` 送信時に **FormData に自動で含まれる**ことがあります（実装は `@radix-ui/react-select` のバージョンに依存します。ドキュメントで `name` の挙動を確認してください）。

そのため、**React の state で値を持ちつつ、さらに hidden input で同じ値を送る**という **二重管理** は避けられます。

---

## 前提：よくある「やりすぎ」パターン

次のように書いていることがあります。

1. **React の state** で選択値を管理する

```tsx
const [employeeCount, setEmployeeCount] = useState('');
const [inquiryType, setInquiryType] = useState('');
```

2. **hidden input** でも同じ値をフォームに載せる

```tsx
<input type="hidden" name="employeeCount" value={employeeCount} />
<input type="hidden" name="inquiryType" value={inquiryType} />
```

3. **Select** は `value` / `onValueChange` で state と同期している

```tsx
<Select value={employeeCount} onValueChange={setEmployeeCount}>
```

つまり **同じデータを複数箇所で管理**しています。これが **二重管理** です。

---

## 二重管理のデメリット

- **値がずれる余地**がある（更新漏れ、非同期タイミングなど）
- **コードが冗長**になり、読み手の負担が増える
- **修正箇所が増え**、バグりやすい

フォーム送信だけが目的で、選択値をほかの UI ロジックで細かく使わないなら、**一本化**した方が安全です。

---

## Radix UI の考え方（`name` を付ける）

`<Select>` に **`name="フィールド名"`** を付けると、ライブラリ側が **hidden input を生成**し、選ばれた値が **フォームの送信データ**として扱われやすくなります。

イメージ：

```tsx
<Select name="employeeCount">
  {/* SelectTrigger / SelectContent / SelectItem ... */}
</Select>

<Select name="inquiryType">
  {/* ... */}
</Select>
```

これだけで、「フォームに載せる値」は **Select まわりに任せる**形にできます。

---

## 具体的にやること（リファクタのチェックリスト）

| やること | 内容 |
|----------|------|
| ① state を削除 | `employeeCount` / `inquiryType` の `useState` を削除 |
| ② hidden を削除 | `name="employeeCount"` などの `<input type="hidden" ... />` を削除 |
| ③ `name` を付与 | 各 `<Select>` に `name="employeeCount"` / `name="inquiryType"` を追加 |
| ④ 制御を外す | `value={...}` と `onValueChange={...}` を削除（不要になった分） |

---

## `value` / `onValueChange` を外してよい理由

**フォーム送信時に、Radix が hidden 経由で値を載せてくれる**からです。

- **送信だけ**なら、コンポーネントを **非制御（uncontrolled）寄り**にして、DOM／ライブラリに値を任せる、という整理になります。

---

## データの流れを図でイメージする

**修正前（ややこしい）**

```text
Select → state を更新 → hidden の value と同期 → form 送信
```

**修正後（シンプル）**

```text
Select（name 付き）→ form 送信時に FormData に含まれる
```

---

## まとめ

- **state + hidden + value/onValueChange** で同じ値を何度も表現するのは、フォーム送信専用なら **やりすぎ**になりがちです。
- Radix の `<Select>` なら **`name` を付けて一本化**する選択肢があります。
- コードを短く保ち、**ズレの元を減らす**のが目的です。

---

## 補足：じゃあ state は一切いらないの？

**常に「いらない」わけではありません。**

次のようなときは、**引き続き state（またはフォームライブラリ）で値を持つ**方が向いています。

- 選択に応じて **すぐ別の UI を変えたい**（連動表示）
- **送信前のバリデーション**で、その値を参照したい
- **React Hook Form** などと **統合**している

その場合も、「hidden を手で二重に書く」のではなく、**ライブラリの推奨パターン（Controller や `setValue` など）に寄せる**と、二重管理を避けやすくなります。

関連：[[状態管理_00_フォーム]]、[[フォーム送信時の状態管理パターン（送信中・成功・失敗）]]
