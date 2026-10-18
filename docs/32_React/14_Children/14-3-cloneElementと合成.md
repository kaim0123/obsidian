# 14-3. cloneElement と合成（props の上書き・追加）

## 🎯 この章で学ぶこと

- `React.cloneElement` が何をするか
- 既存 props とマージされること、子の差し替え
- `React.isValidElement` がいつ有用か（ざっくり）

---

## 📖 cloneElement の役割

子コンポーネントに **`children` として渡された要素を、親が追加の props を付けながら再利用したい**ときに使います。**新しい要素のコピーを返す** API です（元の JSX のオブジェクトは変異しませんが、親子設計によっては読み心地が難しくなりがち）。

```jsx
function Row({ gap, children }) {
  return (
    <div style={{ display: 'flex', gap }}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { 'data-in-row': true });
      })}
    </div>
  );
}
```

### props のマージ

第2引数に渡した props は **子がすでに持っている props と浅くマージ**されます（同名は第2引数側が優先されるイメージで理解するとよい）。`style`/`className` を足すときは浅いので、**両方ともオブジェクトだと後勝ちで一方が消える**点に注意（必要なら子側で `className` を合成するなど、`14-4` の代替設計も検討）。

### 第3引数で子ノードを差し替える

`cloneElement(element, props, …newChildren)` の形で、その要素の **`children` を別のものに置き換え**られます。

---

## 💻 isValidElement

`cloneElement` や、`children` が「本当に React element か」を判定するときに使います。**文字列ノード、`null`、`false` は element ではない**ので、この判定でブランチを分けます。

```jsx
React.Children.map(children, (child) => {
  if (!React.isValidElement(child)) {
    return <span>{child}</span>;
  }
  return React.cloneElement(child, { className: 'enhanced' });
});
```

---

## いつ検討をやめて別パターンにするか

- props の注入ポイントが増え、`cloneElement` があちこちに散らばる
- 型が追いにくくなる（especially TypeScript）
- 「名前付きスロット」や Compound + Context で十分読みやすい

詳しくは **`14-4-落とし穴と代替パターン.md`** と **`10-5-Compound-Components-RenderProps`** を参照してください。
