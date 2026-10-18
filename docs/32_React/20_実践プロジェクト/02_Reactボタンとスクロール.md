# Reactのbuttonタグとページトップ移動防止の仕組み

## 機能・現象名

**buttonタグのtype属性とpreventDefault/stopPropagationによるスクロール防止**

## 概要

ReactやHTMLでボタンを押したとき、ページの一番上に移動してしまう現象は、
- buttonタグのtype属性がデフォルトで`submit`になること
- クリック時にフォーム送信やページリロードが発生すること
が主な原因です。

## 詳細

- `<button>`タグはフォーム内で使うとデフォルトで`type="submit"`になる
- フォーム外でもブラウザによっては`type="submit"`扱いになることがある
- そのため、クリック時にページがリロードされたり、ページトップにスクロールされることがある

## 対策

- `type="button"`を明示的に指定する
- さらに、onClickで`e.preventDefault()`や`e.stopPropagation()`を呼ぶことで、
  予期せぬスクロールやリロードを防止できる

```jsx
<button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); handleEditClick(); }}>
  編集
</button>
```

## 関連知識

- [[buttonタグの使い方]]
- [[フォームとボタンの挙動]]
- [[イベントとデフォルト動作の防止]]
- [[useStateの使い方]]

---

> Obsidianで関連知識を紐づけておくと、他のプロジェクトや言語でも同じ現象に遭遇したときにすぐ参照できます。