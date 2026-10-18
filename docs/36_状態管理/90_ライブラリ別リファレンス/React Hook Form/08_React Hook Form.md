---
title: 08_React Hook Form
created: 2026-09-25
tags:
  - 状態管理
  - ライブラリ別リファレンス
---

# React Hook Form（リアクト・フック・フォーム）

> **ひとことで言うと**：入力値・エラー・送信中などの「フォーム状態」をまとめて管理し、入力のたびに画面全体を再レンダーしない（uncontrolled 中心の）仕組みで、速くて書きやすいフォームを作るライブラリです。

**扱う状態の種類**：**フォーム状態**（入力値・触ったかどうか・変更されたか・バリデーションエラー・送信中）。送信後にサーバーのデータを更新する部分は [[05_TanStack Query]] などと組み合わせます。
→ 考え方は [[01_フォーム状態とは]] / [[02_controlledとuncontrolled]] / [[03_バリデーション]] / [[04_送信フローの状態]]

## たとえ話で理解する

**役所の書類受付係** です。
記入者（ユーザー）が1文字書くたびに係の人が覗き込む（再レンダー）のではなく、書類は記入者に任せておき、「提出」のときにまとめてチェックしてくれます。
不備があれば「ここが空欄です」と該当欄だけに付箋（エラー）を貼って返してくれます。

## なぜ必要？（困りごと）

`useState` で1項目ずつ管理すると……

```tsx
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
// 項目が10個になると state と onChange が10組、エラー判定も手書き
```

- 項目ごとに `value` / `onChange` / エラーを書くので **コードが長くなる**
- 1文字入力するたびにフォーム全体が再レンダーされ、大きなフォームで重くなる
- 「触った後だけエラーを出す」「送信中は二重送信を防ぐ」などを毎回自作する
- 画面のチェックとサーバーのチェックでルールがずれる

## 基本の仕組み

### 基本情報

- **開発元**: react-hook-form（Bill Luo ほかのコミュニティ）
- **ライセンス**: MIT
- **言語**: TypeScript
- **公式サイト**: https://react-hook-form.com
- **バージョン**: v7 系（2026年時点）

### インストール

```bash
npm install react-hook-form
# スキーマ（入力ルール）でバリデーションする場合
npm install zod @hookform/resolvers
```

### 仕組みのイメージ

```
<input {...register('email')} />   ← ref で DOM に直接つながる（uncontrolled）
        │ 入力しても React の state は更新しない → 再レンダーなし
        ▼
   useForm が内部で値を保持
        │ 送信 / blur などのタイミング
        ▼
   バリデーション（register のルール or zodResolver）
        ├─ NG → formState.errors に入る → 該当欄だけ再レンダー
        └─ OK → handleSubmit の関数に値が渡る
```

### コアAPI

| API | 役割 |
|---|---|
| `useForm<型>({ defaultValues, resolver, mode })` | フォームを作る |
| `register('名前', ルール?)` | input をフォームにつなぐ（`{...register('name')}` で展開） |
| `handleSubmit(onValid)` | バリデーション通過時だけ `onValid(値)` を呼ぶ送信ハンドラを作る |
| `formState` | `errors`, `isSubmitting`, `isDirty`, `isValid`, `touchedFields` など |
| `reset(値?)` | フォームを初期化（送信後・データ読み込み後） |
| `watch` / `useWatch` | 値の変化を購読（表示の切り替えに使う） |
| `setValue` / `setError` | 値やエラーをプログラムから設定 |
| `Controller` | UI ライブラリの controlled 部品をつなぐ |
| `useFieldArray` | 行を追加・削除できる繰り返し項目 |

`mode` はバリデーションのタイミング：`'onSubmit'`（初期値）/ `'onBlur'` / `'onChange'` / `'onTouched'` / `'all'`。

## コード例

### 基本：register とルール

```tsx
import { useForm } from 'react-hook-form';

type FormValues = { name: string; age: number };

function SimpleForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', age: 20 },
  });

  const onSubmit = (data: FormValues) => console.log(data); // 検証済みの値

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: '名前は必須です' })} />
      {errors.name && <p>{errors.name.message}</p>}

      {/* valueAsNumber で文字列ではなく数値として受け取る */}
      <input type="number" {...register('age', { valueAsNumber: true, min: { value: 0, message: '0以上' } })} />
      {errors.age && <p>{errors.age.message}</p>}

      <button type="submit">送信</button>
    </form>
  );
}
```

### Zod スキーマ＋zodResolver（おすすめ）

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ルールを1か所に（サーバー側でも同じスキーマを再利用できる）
const schema = z.object({
  email: z.email('メールアドレスの形式が正しくありません'), // Zod v4 の書き方
  password: z.string().min(8, '8文字以上で入力してください'),
});
type SignUp = z.infer<typeof schema>;

function SignUpForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUp>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched', // 一度触った欄から検証を始める
  });

  const onSubmit = async (data: SignUp) => {
    await fetch('/api/signup', { method: 'POST', body: JSON.stringify(data) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="メール" />
      {errors.email && <p>{errors.email.message}</p>}
      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}
      {/* async の onSubmit 実行中は isSubmitting が true → 二重送信防止 */}
      <button disabled={isSubmitting}>{isSubmitting ? '送信中...' : '登録'}</button>
    </form>
  );
}
```

### サーバーから返ったエラーを表示する

```tsx
const { setError, formState: { errors } } = useForm<SignUp>({ resolver: zodResolver(schema) });

const onSubmit = async (data: SignUp) => {
  const res = await fetch('/api/signup', { method: 'POST', body: JSON.stringify(data) });
  if (res.status === 409) {
    setError('email', { message: 'このメールは登録済みです' }); // 項目のエラー
  } else if (!res.ok) {
    setError('root.server', { message: '時間をおいて再度お試しください' }); // フォーム全体のエラー
  }
};
// 表示: {errors.root?.server && <p>{errors.root.server.message}</p>}
```

### controlled な UI 部品をつなぐ（Controller）

```tsx
import { Controller, useForm } from 'react-hook-form';

type Values = { agree: boolean };

function AgreeForm() {
  const { control, handleSubmit } = useForm<Values>({ defaultValues: { agree: false } });
  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Controller
        name="agree"
        control={control}
        render={({ field }) => (
          // value / onChange 形式の部品（UIライブラリのスイッチ等）もこの形でつなげる
          <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
        )}
      />
      <button>送信</button>
    </form>
  );
}
```

## よくある失敗

- ❌ `register` した input に `value` / `onChange` を自分でも付ける → 二重管理で入力できない・値がずれる → ⭕ `{...register('x')}` に任せる。controlled 部品は `Controller` を使う（[[02_controlledとuncontrolled]]）
- ❌ `defaultValues` を渡さない → 初期値が `undefined` になり、`reset` や `isDirty` が期待どおり動かない → ⭕ すべての項目の初期値を `defaultValues` に書く
- ❌ API から取ったデータを後から `defaultValues` に渡しても反映されない → ⭕ 取得後に `reset(取得データ)` を呼ぶ（または `values` オプションを使う）
- ❌ フォーム全体で `watch()` を呼び、結局毎回全体が再レンダー → ⭕ 必要な項目だけ `useWatch({ control, name: 'x' })` で購読する
- ❌ `type="number"` の値が文字列のまま → ⭕ `register('age', { valueAsNumber: true })` を付ける

## まとめ

- React Hook Form はフォーム状態（値・エラー・送信中など）を `useForm` 1つで管理する
- `register` による uncontrolled 方式で再レンダーが少なく、大きなフォームでも軽い
- バリデーションは `zodResolver` でスキーマに集約し、送信後のデータ更新はサーバー状態ライブラリと役割分担する

## 関連ノート

- [[01_フォーム状態とは]] — React Hook Form が扱う状態の種類
- [[02_controlledとuncontrolled]] — register と Controller の違いの背景
- [[03_バリデーション]] — スキーマによる検証の考え方
- [[04_送信フローの状態]] — isSubmitting とサーバーエラー
- [[02_ウィザード（多段階フォーム）]] — 複数ページのフォーム
- [[01_状態の永続化]] — 入力途中の下書き保存
- [[05_TanStack Query]] — 送信後のサーバー状態の更新
- [[ライブラリ比較]] — 一覧で比較
- 上位: [[MOC_状態管理体系]]
