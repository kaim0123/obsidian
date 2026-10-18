# 6-5 URLと連動する状態（検索条件・ページ番号・タブ）

## 🎯 この章で学ぶこと

- 「URLに状態を持たせる」考え方を理解できます
- どんな状態をURLに置くべきかの判断ができるようになります
- 検索条件・ページ番号・タブをURLと連動させる方法を学びます
- リロード・シェア・ブラウザバックに強いUIを作れるようになります
- `useSearchParams` を実戦投入できるようになります

## 📖 概念の説明

### URLは「公開できる状態」

普段、`useState` でstateを持つと、それは **そのコンポーネント内の閉じた状態** になります。リロードすると消えますし、URLをコピーしても他人と共有できません。

一方、URLに状態を埋め込むと、

- **リロードしても消えない**（URLにあるから）
- **URLをシェアすれば同じ画面が再現できる**
- **ブラウザバック・進むボタンで履歴をたどれる**
- **ブックマークできる**

例えるなら、`useState` は **その人のメモ帳に書いた走り書き**、URLは **掲示板に貼った張り紙**。後者は誰でも同じものが見られます。

### URLに置くべき状態とは

すべてをURLに置けばいいわけではありません。判断の指針はこんな感じです。

| 状態 | URLに置く？ | 理由 |
|---|---|---|
| 検索キーワード | ✅ | リンクで共有したい |
| ページ番号 | ✅ | リロードで戻りたくない |
| タブ選択 | ✅（よくある） | 直接そのタブを開きたい |
| ソート順 | ✅ | 並び順をシェアしたい |
| フィルタ条件 | ✅ | 同じく共有可能性が高い |
| モーダルの開閉 | ⚠️ | URLに置くこともある |
| フォーム入力中の値 | ❌ | 共有する意味がない、頻繁すぎる |
| マウス位置 | ❌ | 状態でもない |
| ローディング中フラグ | ❌ | 一時的な値 |

ざっくり、「**URLをシェアしたら相手も同じ画面が見えてほしい**」状態は置く、というのが基準です。

### URL ↔ state の二重管理を避ける

URLとstateの両方に同じものを置くと、**どちらが正しいか分からなくなります**。これは典型的なバグの温床。

URLにある値は **URLを「正」とする** のが基本です。`useSearchParams` を直接使えば、別途 `useState` を持たずに済みます。

### 用語の整理

- **URL状態（URL state）**：URLに格納された状態
- **クエリパラメータ（query parameter）**：`?key=value` の形
- **シェアラブル**：URLで共有可能な状態
- **二重管理（dual source of truth）**：同じ情報を2箇所で持ってしまう状態

## 💻 コード例

### 例1：検索キーワードをURLに

```jsx
import { useSearchParams } from 'react-router-dom';

function ProductSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  return (
    <div>
      <input
        type="text"
        value={q}
        onChange={(e) => {
          // URLが ?q=入力 に書き換わる
          setSearchParams({ q: e.target.value });
        }}
        placeholder="検索ワード"
      />

      <ProductList query={q} />
    </div>
  );
}
```

ここでは `useState` を使っていないことに注目してください。`searchParams` を直接読み書きするだけ。

### 例2：ページネーション

```jsx
function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);

  const goToPage = (newPage) => {
    // 既存のクエリを保ちつつページだけ更新
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  };

  return (
    <div>
      <p>ページ {page}</p>
      <button onClick={() => goToPage(page - 1)} disabled={page <= 1}>前へ</button>
      <button onClick={() => goToPage(page + 1)}>次へ</button>
    </div>
  );
}
```

`setSearchParams` には関数も渡せて、既存のパラメータを保ったまま一部だけ更新できます。

### 例3：複数の条件を組み合わせる

```jsx
function FilteredList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'new';

  const updateParam = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key); // 値が空なら削除
      return next;
    });
  };

  return (
    <div>
      <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
        <option value="all">すべて</option>
        <option value="shoes">シューズ</option>
        <option value="bags">バッグ</option>
      </select>

      <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
        <option value="new">新着順</option>
        <option value="price">価格順</option>
      </select>

      <p>条件：q={q}, cat={category}, sort={sort}</p>
    </div>
  );
}
```

URLは `/list?q=シャツ&category=shoes&sort=price` のようになり、URLをシェアすれば同じ条件が再現されます。

### 例4：タブをURLで管理する

```jsx
function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  return (
    <div>
      <nav>
        <button onClick={() => setSearchParams({ tab: 'overview' })}>
          概要
        </button>
        <button onClick={() => setSearchParams({ tab: 'posts' })}>
          投稿
        </button>
        <button onClick={() => setSearchParams({ tab: 'friends' })}>
          友達
        </button>
      </nav>

      {tab === 'overview' && <Overview />}
      {tab === 'posts' && <Posts />}
      {tab === 'friends' && <Friends />}
    </div>
  );
}
```

タブをパスで分ける（`/profile/overview`）か、クエリで分ける（`/profile?tab=overview`）かは設計判断。**SEO重視や独立コンテンツならパス**、**軽い切り替えならクエリ** が目安です。

### 例5：URLと連動するフェッチ

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || 1);

  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!q) return;
    fetch(`/api/search?q=${encodeURIComponent(q)}&page=${page}`)
      .then(r => r.json())
      .then(setResults);
  }, [q, page]); // URLパラメータの変化に追従してfetch

  return (
    <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>
  );
}
```

URLが変わるたびに自動でfetchが走り、表示が連動します。**ブラウザバックでも前の検索結果が再現される** のがミソ。

### 例6：debounce（連続入力でURLを更新しすぎない）

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function SearchInput() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [input, setInput] = useState(initialQ); // ローカルの入力値

  // 500ms入力が止まったらURLを更新
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (input) next.set('q', input);
        else next.delete('q');
        return next;
      });
    }, 500);
    return () => clearTimeout(id);
  }, [input, setSearchParams]);

  return (
    <input value={input} onChange={(e) => setInput(e.target.value)} />
  );
}
```

入力するたびにURLが書き換わると履歴が爆発するので、ある程度待ってから更新する。これは **二重管理に見えますが、入力値を一時的に持っているだけ** なのでOK。

## ❌ よくある間違い

### 1. URLとstateの二重管理

```jsx
// ❌ 同じ値を2箇所で管理
const [searchParams, setSearchParams] = useSearchParams();
const [q, setQ] = useState(searchParams.get('q') || ''); // ← 不要
```

URLを正にするか、stateを正にするか、どちらか1つに決めましょう。

### 2. パラメータを上書きで全削除

```jsx
// ❌ pageだけ更新したいのに、qが消える
setSearchParams({ page: '2' });
```

既存のパラメータを保ちたいなら関数形式で。

```jsx
setSearchParams(prev => {
  const next = new URLSearchParams(prev);
  next.set('page', '2');
  return next;
});
```

### 3. 数値や真偽値の型変換忘れ

URLの値は **すべて文字列** です。`page === 2` は常に false。`Number(page) === 2` で比較しましょう。

### 4. 入力のたびにURLを更新して履歴を汚す

リアルタイム検索でキー入力ごとに `setSearchParams` すると、ブラウザバックで地獄を見ます。debounceを入れるか、`replace: true` で履歴を上書きしましょう。

```jsx
setSearchParams({ q: input }, { replace: true }); // 履歴に積まない
```

### 5. URLに置くべきでないものを置く

ログイン中のトークンや個人情報をURLに入れるのはセキュリティ的にNG。URLは **公開情報** という意識で。

## ✅ ベストプラクティス

1. **「シェアしたい状態」だけURLに置く**：判断軸を持ちましょう。
2. **URLを正とする**：state二重管理を避ける。
3. **debounce + replace で履歴を綺麗に保つ**：入力系の典型パターン。
4. **URLパラメータの型変換を忘れない**：すべて文字列です。
5. **fetchの依存にURLパラメータを入れる**：自動的に再取得が走って便利。

## 🔬 実践演習

### お題：URL連動の商品リスト

- 検索キーワード（`q`）
- カテゴリ（`category`）
- ソート（`sort`）
- ページ番号（`page`）

をすべてURLに連動させる商品リストを作ってみましょう。リロードしても、URLをシェアしても同じ画面が再現できることを確認します。

### 発展課題

- 検索ボックスにdebounceを入れて、ブラウザバックで履歴が残りすぎないようにしましょう
- フィルタ条件を変えるたびにfetchが走り、URLとも連動することを確認しましょう

## 📝 まとめ

- URLは「公開できる状態」、`useState` は「その場限りの状態」
- リロード・シェア・ブラウザバックで再現したい状態はURLに置きます
- `useSearchParams` で直接URLを読み書きすれば、二重管理にならない
- URLの値は文字列なので型変換に注意
- 入力系には debounce + replace で履歴を整理

## 🔗 関連ページ

- [[6-1-React-Routerの導入]]
- [[6-2-パラメータ-クエリ-ネストルート]]
- [[状態管理_05_URLと連動する状態（ルーティング・クエリ）]]
- [[状態管理_04_フィルタ・並び替え・検索（表示条件）]]
- [[絞込み機能の実装方法とベストプラクティス]]
- [[ページネーション機能の実装方法とベストプラクティス]]
