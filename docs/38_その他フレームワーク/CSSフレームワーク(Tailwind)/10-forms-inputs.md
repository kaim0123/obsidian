# 9. フォーム（Tailwind・TSX）

- **iOS Safari の自動ズーム**を避けるには、入力のフォントが小さすぎないようにするのが定番です。`text-base`（16px 相当）を付けます。
- ラベルは `block text-sm font-medium`、エラーは `text-sm text-red-600` のように、画面サイズをまたいで階層が分かるようにします。

```tsx
type FieldProps = {
  id: string;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function TextField({ id, label, error, className, ...rest }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-base ${className ?? ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
