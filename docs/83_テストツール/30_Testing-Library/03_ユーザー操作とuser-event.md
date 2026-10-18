# ユーザー操作と user-event

コンポーネントを描画して要素を探したら、次は操作です。Testing Library には、低レベルの `fireEvent` と、実際のユーザー操作に近い `user-event` の2つの方法があります。この章では、`user-event`（v14）の使い方と、`fireEvent` との違い、よく使う操作の書き方をまとめます。

---

## 1. fireEvent と user-event の違い

実際にユーザーが入力欄をクリックして文字を打つと、ブラウザでは多くのイベントが順番に起きます。

```
pointerdown → mousedown → focus → pointerup → mouseup → click
→ keydown → keypress → beforeinput → input → keyup（1文字ごと）
```

| | `fireEvent` | `user-event` |
|---|-------------|--------------|
| 発生するイベント | 指定した1つだけ（`click` だけ、`change` だけ） | 上のような一連のイベント |
| フォーカスの移動 | しない | する |
| 無効な要素 | 無効でもイベントが発生する | `disabled` や `pointer-events: none` の要素は操作できない |
| 非同期 | 同期 | `await` が必要 |
| 使いどころ | user-event で表せない特殊なイベント（`scroll` など） | **基本はこちら** |

```ts
// ✗ fireEvent：change だけが起きる。keydown で動く処理はテストされない
fireEvent.change(input, { target: { value: 'hello' } });

// ○ user-event：キー入力を1文字ずつ再現する
await user.type(input, 'hello');
```

---

## 2. セットアップ

```ts
import userEvent from '@testing-library/user-event';

test('…', async () => {
  const user = userEvent.setup();  // 描画の前に作る
  render(<Form />);
  await user.click(screen.getByRole('button', { name: '送信' }));
});
```

- v14 からは `userEvent.setup()` でインスタンスを作ってから使うのが推奨です（`userEvent.click(...)` を直接呼ぶ書き方は互換のために残っているだけ）。
- **すべての操作は Promise を返すので `await` を忘れない**。忘れると、操作が終わる前に `expect` が実行されます。

---

## 3. よく使う操作

### クリック・ホバー

```ts
await user.click(button);
await user.dblClick(button);
await user.tripleClick(input);        // テキストの全選択
await user.hover(menuItem);
await user.unhover(menuItem);
```

### 文字入力

```ts
await user.type(input, 'yamada@example.com');
await user.clear(input);                       // 空にする
await user.type(input, '新しい値');

await user.type(input, '検索語{Enter}');       // 特殊キー
await user.keyboard('{Shift>}A{/Shift}');     // Shift を押しながら A
await user.keyboard('{Control>}a{/Control}'); // Ctrl+A
```

| 記法 | 意味 |
|------|------|
| `{Enter}` `{Escape}` `{Tab}` `{Backspace}` | 特殊キーを押して離す |
| `{Shift>}` … `{/Shift}` | 押したまま … 離す |
| `{{` / `[[` | 文字としての `{` / `[` |

### フォーカス移動

```ts
await user.tab();                 // 次の要素へ
await user.tab({ shift: true });  // 前の要素へ
expect(screen.getByRole('button', { name: '送信' })).toHaveFocus();
```

キーボードだけで操作できるか（アクセシビリティ）を確かめるときに使います。

### 選択系

```ts
await user.selectOptions(screen.getByRole('combobox'), '東京都');
await user.click(screen.getByRole('checkbox', { name: '利用規約に同意する' }));
await user.click(screen.getByRole('radio', { name: '銀行振込' }));
```

### ファイルアップロード

```ts
const file = new File(['hello'], 'hello.png', { type: 'image/png' });
await user.upload(screen.getByLabelText('画像を選択'), file);
expect(screen.getByText('hello.png')).toBeInTheDocument();
```

- `accept` 属性に合わないファイルは、デフォルトで無視されます（`applyAccept` オプション）。

### クリップボード

```ts
const user = userEvent.setup();
await user.copy();
await user.paste('貼り付ける文字列');
```

---

## 4. フェイクタイマーと組み合わせる

デバウンス付きの検索欄など、タイマーを使う UI では、user-event の内部の待ち時間もフェイクタイマーで進める必要があります。

```ts
vi.useFakeTimers();
const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

render(<SearchBox />);
await user.type(screen.getByRole('searchbox'), 'react');
await vi.advanceTimersByTimeAsync(300); // デバウンスの 300ms を進める

expect(await screen.findByRole('list')).toBeInTheDocument();
vi.useRealTimers();
```

- `advanceTimers` を渡さないと、user-event がタイマーの完了を待ち続けてテストが止まります。
- タイマーの扱い全般は [[05_非同期処理とタイマーのテスト]]（Vitest）を参照。

---

## 5. 操作できないことを確かめる

```ts
const button = screen.getByRole('button', { name: '送信' });
expect(button).toBeDisabled();

await user.click(button);          // disabled なのでクリックは起きない
expect(onSubmit).not.toHaveBeenCalled();
```

- `pointer-events: none` の要素をクリックすると、user-event はエラーを投げます。わざと確かめたいときは `userEvent.setup({ pointerEventsCheck: 0 })`。

---

## 6. 関連項目

- [[02_クエリの選び方]]
- [[04_非同期UIとよくある間違い]]
- [[13-4-フォーム-非同期のテスト]]（32_React）：フォームの実例

---

**前へ** ← [[02_クエリの選び方]]　｜　**次に読む** → [[04_非同期UIとよくある間違い]]
