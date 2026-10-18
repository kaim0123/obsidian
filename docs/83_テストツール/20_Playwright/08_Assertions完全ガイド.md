## 第8章 Playwright Assertions 完全ガイド

この章では、公式ドキュメントの `Test assertions` / `GenericAssertions` をベースに、  
**「どの `expect` を、どんな場面で、どう書けばよいか」** を体系的にまとめます。

07 章（基本編）の内容を前提に、よりリファレンス寄り・実務寄りの解説になっています。

---

## 1. Assertions の全体像

### 1-1. 3 つの視点で整理する

Playwright のアサーションは、次の 3 つの観点で整理すると覚えやすいです。

- **対象**: 何に対して検証するか
  - 一般値（number, string, object, array など）
  - Locator（DOM 要素・コンポーネント）
  - ページ全体（`page` のタイトルや URL など）
- **タイミング**: いつ値を取得して検証するか
  - すぐに値を取得して即検証（一般値が多い）
  - 条件を満たすまで一定時間リトライ（Locator / page アサーション）
- **目的**: 何を保証したいか
  - 値の一致 / 配列・オブジェクトの形
  - 表示・非表示 / テキスト内容
  - アクセシビリティ情報

この章では、

- **2 章: 一般値用の `GenericAssertions`**
- **3 章: 要素・ページ用の `LocatorAssertions` / `PageAssertions`**
- **4 章: よくあるパターン**
- **5 章: よくある失敗パターンと対策**

という流れで整理します。

---

## 2. GenericAssertions — 一般値へのアサーション

`expect(value)` に対して使う matcher 群です。  
Jest にかなり近いですが、Playwright 公式が示しているよく使うものを中心に解説します。

### 2-1. 基本の一致系

- **`toBe(expected)`**
  - プリミティブ値（number, string, boolean など）の「厳密一致」
  - 例:
    ```ts
    expect(1 + 1).toBe(2);
    expect(result.ok).toBe(true);
    ```

- **`toEqual(expected)`**
  - オブジェクトや配列の「構造・値の一致」
  - 例:
    ```ts
    expect({ id: 1, name: 'Taro' }).toEqual({ id: 1, name: 'Taro' });
    expect([1, 2, 3]).toEqual([1, 2, 3]);
    ```

- **`toStrictEqual(expected)`**
  - `toEqual` よりも厳密（プロトタイプや undefined の有無まで）
  - 一般的な E2E では `toEqual` で十分なことが多いです。

### 2-2. 数値系

- **`toBeGreaterThan(number)` / `toBeGreaterThanOrEqual(number)`**
- **`toBeLessThan(number)` / `toBeLessThanOrEqual(number)`**

例:

```ts
const count = await rows.count();
expect(count).toBeGreaterThan(0);
expect(count).toBeLessThanOrEqual(100);
```

- **`toBeCloseTo(number, numDigits?)`**
  - 浮動小数点の誤差を許容して比較
  - 例:
    ```ts
    expect(0.1 + 0.2).toBeCloseTo(0.3, 5);
    ```

### 2-3. 文字列・配列・コレクション系

- **`toContain(item)`**
  - 文字列に部分文字列が含まれているか、配列に要素が含まれているか
  - 例:
    ```ts
    expect('Playwright E2E').toContain('E2E');
    expect(['E2E', 'Unit']).toContain('E2E');
    ```

- **`toHaveLength(number)`**
  - 文字列・配列・`length` を持つオブジェクトの長さ
  - 例:
    ```ts
    expect('abc').toHaveLength(3);
    expect([1, 2, 3]).toHaveLength(3);
    ```

### 2-4. 真偽値系

- **`toBeTruthy()` / `toBeFalsy()`**
  - truthy / falsy 判定（`if (value)` と同じノリ）
  - 例:
    ```ts
    expect(response.ok).toBeTruthy();
    expect(errors.length === 0).toBeTruthy();
    ```

- **`toBeNull()` / `toBeUndefined()` / `toBeDefined()`**
  - 例:
    ```ts
    expect(value).toBeNull();
    expect(result.data).toBeDefined();
    ```

### 2-5. オブジェクト・配列の部分一致（パターンマッチング）

複雑な JSON レスポンスの一部だけ検証したい場合は、  
**`expect.objectContaining` / `expect.arrayContaining`** を使うと便利です。

- **`expect.objectContaining(shape)`**
  - 指定したキー・値が含まれていれば OK（他のキーがあってもよい）
  - 例:
    ```ts
    const user = { id: 1, name: 'Taro', role: 'admin' };
    expect(user).toEqual(
      expect.objectContaining({
        id: 1,
        name: 'Taro',
      }),
    );
    ```

- **`expect.arrayContaining(items)`**
  - 配列に、指定した要素群がすべて含まれていれば OK（順番や他の要素は自由）
  - 例:
    ```ts
    const roles = ['admin', 'editor', 'viewer'];
    expect(roles).toEqual(expect.arrayContaining(['admin', 'viewer']));
    ```

### 2-6. `expect.any` / `expect.anything`

- **`expect.any(constructor)`**
  - 型だけをチェックしたいときに使う
  - 例:
    ```ts
    expect(result).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
    });
    ```

- **`expect.anything()`**
  - `null` / `undefined` 以外なら何でも OK
  - 例:
    ```ts
    expect(result).toEqual({
      id: expect.anything(),
      createdAt: expect.anything(),
    });
    ```

これらは API レスポンスの「形」を検証したいときに特に有用です。

---

## 3. LocatorAssertions / PageAssertions — UI 要素・ページへのアサーション

`await expect(locator)` や `await expect(page)` に対して使う matcher 群です。  
**自動待機（auto-waiting）とセットで動く**点が大きな特徴です。

### 3-1. 表示状態系

- **`toBeVisible()`**
  - 要素が DOM 上に存在し、ユーザーから見えていること
  - 例:
    ```ts
    await expect(page.getByRole('button', { name: '保存' })).toBeVisible();
    ```

- **`toBeHidden()` / `toBeVisible({ visible: false })` 相当**
  - 要素が非表示であること（`display: none` / `visibility: hidden` / DOM から消えている など）

- **`toBeInViewport()`**
  - 要素がビューポート内に収まっていること
  - スクロールが必要な画面での検証に使える。

### 3-2. 状態系（フォーム要素など）

- **`toBeChecked()` / `toBeUnchecked()`**
  - チェックボックスやラジオボタン

- **`toBeDisabled()` / `toBeEnabled()`**
  - ボタンや入力欄が押せるかどうか

- **`toBeEditable()`**
  - 入力可能かどうか（`readonly` / `disabled` でない）

- **`toBeFocused()`**
  - キーボードフォーカスが乗っているか
  - キーボード操作のテストに有用。

### 3-3. テキスト系

- **`toHaveText(expected)`**
  - 要素のテキストが「完全一致」もしくは配列との一致
  - 例:
    ```ts
    await expect(page.getByRole('heading')).toHaveText('ダッシュボード');
    await expect(page.locator('.item')).toHaveText(['A', 'B', 'C']);
    ```

- **`toContainText(textOrArray)`**
  - 部分一致。配列を渡すと各要素が含まれているかをチェック。
  - 例:
    ```ts
    await expect(page.getByRole('alert')).toContainText('保存しました');
    ```

- **`toHaveValue(value)`**
  - input / textarea の値
  - 例:
    ```ts
    await expect(page.getByLabel('ユーザー名')).toHaveValue('taro');
    ```

### 3-4. 属性・クラス・CSS 系

- **`toHaveAttribute(name, value)`**
  - 例:
    ```ts
    await expect(page.getByRole('link', { name: '詳細' })).toHaveAttribute('href', '/detail/1');
    ```

- **`toHaveClass(classNameOrRegexOrArray)`**
  - クラス名の完全一致・部分一致
  - 例:
    ```ts
    await expect(button).toHaveClass(/primary/);
    ```

- **`toHaveCSS(property, value)`**
  - 計算済み CSS の値を検証
  - デザイン崩れの検出などに使えるが、テストが brittle になりやすいので慎重に。

### 3-5. アクセシビリティ系

アクセシビリティ（A11y）属性は、Playwright が強く推奨する検証ポイントです。

- **`toHaveAccessibleName(nameOrRegex)`**
- **`toHaveAccessibleDescription(textOrRegex)`**
- **`toHaveRole(role)`**

例:

```ts
const alert = page.getByRole('alert');
await expect(alert).toHaveAccessibleName('エラー');
await expect(alert).toHaveAccessibleDescription('入力内容を確認してください');
```

UI ライブラリを使っていると、自動で ARIA 属性が付くことも多く、  
これらを前提にしたテストは **ユーザー視点 + アクセシビリティ品質** を同時に担保できます。

### 3-6. カウント・プロパティ系

- **`toHaveCount(number)`**
  - Locator が一致する要素数
  - 例:
    ```ts
    await expect(page.locator('table tbody tr')).toHaveCount(10);
    ```

- **`toHaveJSProperty(name, value)`**
  - DOM 要素の JS プロパティ値を検証
  - 例:
    ```ts
    await expect(videoElement).toHaveJSProperty('paused', true);
    ```

---

## 4. 実務パターン集

### 4-1. テーブルデータの検証

```ts
const rows = page.locator('table tbody tr');
await expect(rows).toHaveCount(3);
await expect(rows.nth(0)).toContainText(['山田 太郎', 'taro@example.com']);
await expect(rows.nth(1)).toContainText(['佐藤 花子', 'hanako@example.com']);
```

ポイント:

- 行数は `toHaveCount`
- 各行の内容は `toContainText` でざっくり確認（完全一致にしすぎない）

### 4-2. フォームエラーメッセージの検証

```ts
await page.getByRole('button', { name: '送信' }).click();

const error = page.getByRole('alert');
await expect(error).toBeVisible();
await expect(error).toContainText('必須項目です');
```

ポイント:

- エラー要素は `role='alert'` で取れると理想的
- メッセージ文言が多少変わる可能性がある場合は、  
  固定のプレフィックス部分だけを `toContainText` で確認するなど工夫する。

### 4-3. SPA の画面遷移の検証

```ts
await page.getByRole('link', { name: '設定' }).click();
await expect(page).toHaveURL(/.*\/settings$/);
await expect(page.getByRole('heading', { name: '設定' })).toBeVisible();
```

ポイント:

- ページ全体には `toHaveURL` / `toHaveTitle`
- 見出しの表示で「画面が切り替わった」ことをダブルチェック

---

## 5. よくある失敗パターンと対策

### 5-1. `await` を付け忘れる

```ts
// ❌ await を忘れている
expect(page.getByRole('alert')).toContainText('保存しました');
```

この場合、Playwright の自動待機が働かず、**意図しないタイミング**で検証してしまいます。  
必ず `await` を付けます。

```ts
// ✅ 正しい
await expect(page.getByRole('alert')).toContainText('保存しました');
```

### 5-2. 存在しない matcher を使う

例:

```ts
// ❌ Playwright には存在しない
await expect(locator).toHaveCountGreaterThan(0);
```

対策は 01_よくあるE2Eテストエラー集.md でも説明した通り、

- 一度値として取り出す
- 数値用 matcher を使う

という 2 段階に分けます。

```ts
const count = await locator.count();
expect(count).toBeGreaterThan(0);
```

### 5-3. 固定の `waitForTimeout` に頼りすぎる

```ts
// ❌ とりあえず 1 秒待つ
await page.waitForTimeout(1000);
await expect(page.getByRole('alert')).toBeVisible();
```

対策:

- まずは **アサーションの自動待機**に任せる
- どうしても必要な場合だけ、公式ドキュメントの「待機戦略」に従って  
  `waitForResponse` / `waitForLoadState` などを使う

### 5-4. テキスト完全一致でテストが brittle になる

```ts
// ❌ 文言の微修正で壊れやすい
await expect(alert).toHaveText('保存に成功しました。');
```

対策:

- 変更されにくい部分だけを `toContainText` で見る
- 別途「メッセージコード」などが取れる場合は、そちらを検証する

```ts
// ✅ より堅牢な例
await expect(alert).toContainText('保存');
```

---

## 6. まとめと次章へのつながり

- この章では、公式ドキュメントにあるアサーション API を
  - 一般値用 (`GenericAssertions`)
  - ロケーター / ページ用 (`LocatorAssertions` / `PageAssertions`)
  に分けて整理しました。
- 実務では、**「何を保証したいのか」→「どの matcher を使うか」** の順に考えると選びやすくなります。

次の **第9章「Advanced Topics_実務テクニック」** では、

- タイムアウト・リトライ戦略
- `expect.soft` / `expect.poll`
- テスト設計全体との関係（フック・フィクスチャ・並列実行）

など、より高度なアサーション活用パターンを扱います。

