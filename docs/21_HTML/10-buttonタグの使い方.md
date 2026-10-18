# HTML/buttonタグの使い方

## 基本構文

```html
<button>ラベル</button>
```

## type属性の種類
- `type="button"` : 通常のボタン（デフォルト動作なし）
- `type="submit"` : フォーム送信ボタン（デフォルト）
- `type="reset"` : フォームリセットボタン

## 注意点
- フォーム内で`type`を省略すると`submit`になる
- フォーム外でもブラウザによっては`submit`扱いになることがある
- 明示的に`type="button"`を指定するのが安全

## 例
```html
<form>
  <button type="submit">送信</button>
  <button type="button">編集</button>
  <button type="reset">リセット</button>
</form>
```

---

- [[フォームとボタンの挙動]]