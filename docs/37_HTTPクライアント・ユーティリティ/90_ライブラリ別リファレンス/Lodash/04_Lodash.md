# Lodash（ローダッシュ）

## Lodashとは

**Lodash**は、JavaScriptの配列、オブジェクト、文字列、関数などの操作を簡単にするための**ユーティリティライブラリ**です。よく使う処理を関数として提供します。

### 基本情報

- **開発元**: John-David Dalton
- **リリース年**: 2012年
- **ライセンス**: MIT
- **言語**: JavaScript
- **公式サイト**: https://lodash.com/
- **GitHub**: https://github.com/lodash/lodash

## Lodashの特徴

### ✅ メリット

1. **豊富な関数**
   - 配列、オブジェクト、文字列、数値、関数など、多くの操作に対応
   - 200以上の関数を提供

2. **パフォーマンス**
   - 最適化された実装
   - 大量のデータを扱う場合に有効

3. **クロスブラウザ対応**
   - 古いブラウザでも動作する

4. **関数型プログラミング**
   - 関数のチェーンが可能
   - コードが読みやすい

5. **モジュール対応**
   - 必要な関数だけをインポートできる（tree-shaking対応）

### ⚠️ デメリット

1. **バンドルサイズ**
   - すべてをインポートすると大きくなる
   - 必要な関数だけをインポートする必要がある

2. **モダンJavaScriptとの競合**
   - ES6以降の標準機能と重複する場合がある
   - ネイティブの機能で十分な場合がある

## Lodashのインストール

```bash
# フルバージョン
npm install lodash

# 個別の関数のみ（推奨）
npm install lodash-es
```

## Lodashの基本例

### 配列操作

```javascript
import _ from 'lodash';
// または個別にインポート
import { map, filter, find, sortBy } from 'lodash-es';

const numbers = [1, 2, 3, 4, 5];

// map - 配列の各要素を変換
const doubled = _.map(numbers, n => n * 2);
// または
const doubled = map(numbers, n => n * 2);
// 結果: [2, 4, 6, 8, 10]

// filter - 条件に合う要素を抽出
const evens = _.filter(numbers, n => n % 2 === 0);
// 結果: [2, 4]

// find - 条件に合う最初の要素を取得
const found = _.find(numbers, n => n > 3);
// 結果: 4

// sortBy - ソート
const users = [
  { name: '太郎', age: 25 },
  { name: '花子', age: 30 },
  { name: '次郎', age: 20 }
];
const sorted = _.sortBy(users, 'age');
// 結果: [{name: '次郎', age: 20}, {name: '太郎', age: 25}, {name: '花子', age: 30}]
```

### オブジェクト操作

```javascript
import { clone, merge, pick, omit, get, set } from 'lodash-es';

const user = { name: '太郎', age: 25, email: 'taro@example.com' };

// clone - オブジェクトを複製
const cloned = _.clone(user);

// deep clone（ネストされたオブジェクトも複製）
const deepCloned = _.cloneDeep(user);

// merge - オブジェクトをマージ
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
const merged = _.merge(obj1, obj2);
// 結果: { a: 1, b: 3, c: 4 }

// pick - 指定したプロパティのみを取得
const picked = _.pick(user, ['name', 'age']);
// 結果: { name: '太郎', age: 25 }

// omit - 指定したプロパティを除外
const omitted = _.omit(user, ['email']);
// 結果: { name: '太郎', age: 25 }

// get - ネストされたプロパティを安全に取得
const data = { user: { profile: { name: '太郎' } } };
const name = _.get(data, 'user.profile.name', 'デフォルト値');
// 結果: '太郎'

// set - ネストされたプロパティを設定
_.set(data, 'user.profile.age', 25);
```

### 文字列操作

```javascript
import { camelCase, kebabCase, snakeCase, upperCase, lowerCase } from 'lodash-es';

// camelCase - キャメルケースに変換
_.camelCase('hello world'); // 'helloWorld'

// kebabCase - ケバブケースに変換
_.kebabCase('hello world'); // 'hello-world'

// snakeCase - スネークケースに変換
_.snakeCase('hello world'); // 'hello_world'

// upperCase - 大文字に変換
_.upperCase('hello world'); // 'HELLO WORLD'

// lowerCase - 小文字に変換
_.lowerCase('HELLO WORLD'); // 'hello world'
```

### 関数のチェーン

```javascript
import { chain } from 'lodash-es';

const users = [
  { name: '太郎', age: 25, active: true },
  { name: '花子', age: 30, active: false },
  { name: '次郎', age: 20, active: true }
];

const result = _.chain(users)
  .filter(user => user.active)
  .sortBy('age')
  .map(user => user.name)
  .value();
// 結果: ['次郎', '太郎']
```

### その他の便利な関数

```javascript
import { debounce, throttle, isEmpty, isEqual, uniqueId } from 'lodash-es';

// debounce - 関数の実行を遅延
const debouncedFn = _.debounce(() => {
  console.log('実行されました');
}, 300);

// throttle - 関数の実行頻度を制限
const throttledFn = _.throttle(() => {
  console.log('実行されました');
}, 300);

// isEmpty - 空かどうかを判定
_.isEmpty([]); // true
_.isEmpty({}); // true
_.isEmpty(null); // true

// isEqual - 深い比較
_.isEqual({ a: 1 }, { a: 1 }); // true

// uniqueId - ユニークなIDを生成
_.uniqueId('user_'); // 'user_1'
_.uniqueId('user_'); // 'user_2'
```

## モダンJavaScriptとの比較

### 配列操作

```javascript
// Lodash
const doubled = _.map(numbers, n => n * 2);
const evens = _.filter(numbers, n => n % 2 === 0);

// モダンJavaScript（ES6+）
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
```

### オブジェクト操作

```javascript
// Lodash
const cloned = _.cloneDeep(obj);

// モダンJavaScript（ES2021+）
const cloned = structuredClone(obj); // または JSON.parse(JSON.stringify(obj))
```

## パフォーマンス最適化

### 必要な関数だけをインポート

```javascript
// ❌ すべてをインポート（バンドルサイズが大きい）
import _ from 'lodash';

// ✅ 必要な関数だけをインポート（推奨）
import { map, filter, find } from 'lodash-es';
```

### babel-plugin-lodash を使う

自動的に必要な関数だけをインポートするように変換できます。

## まとめ

- Lodashは豊富なユーティリティ関数を提供するライブラリ
- 配列、オブジェクト、文字列などの操作を簡単にする
- モダンJavaScriptで代替できる場合もあるが、複雑な操作には便利
- 必要な関数だけをインポートして、バンドルサイズを抑えることが重要

**初心者の方へ**: 基本的な操作はモダンJavaScriptで十分な場合が多いですが、複雑な操作やクロスブラウザ対応が必要な場合は、Lodashが便利です。まずは標準のJavaScriptで書けるか確認してから、必要に応じてLodashを使うことをおすすめします。


## 2026年時点の補足

- 新規プロジェクトでは、まず標準機能（`Object.groupBy`・`structuredClone`・`toSorted` など）で書けないか確認し、足りない分は **es-toolkit** を第一候補にする（[[01_ユーティリティライブラリの選び方]]）
- 既存の Lodash コードは `es-toolkit/compat` に差し替えるだけで移行を始められる（[[05_es-toolkit]]）
- `babel-plugin-lodash` は Babel 前提の古い手法。ESM なら `lodash-es` の名前付き import で tree-shaking できる

## 関連
- [[05_es-toolkit]]
