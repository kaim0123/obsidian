# date-fns（デート・エフエヌエス）

## date-fnsとは

**date-fns**は、JavaScriptで日付・時刻を扱うための**軽量なライブラリ**です。関数型のアプローチで、日付の操作、フォーマット、比較などが簡単に行えます。

### 基本情報

- **開発元**: Sasha Koss
- **リリース年**: 2014年
- **ライセンス**: MIT
- **言語**: JavaScript、TypeScript
- **公式サイト**: https://date-fns.org/
- **GitHub**: https://github.com/date-fns/date-fns

## date-fnsの特徴

### ✅ メリット

1. **軽量**
   - 必要な関数だけをインポートできる
   - tree-shakingに対応
   - バンドルサイズが小さい

2. **イミュータブル**
   - 元の日付オブジェクトを変更しない
   - 安全に使用できる

3. **関数型アプローチ**
   - 関数の組み合わせが簡単
   - 読みやすいコード

4. **TypeScript対応**
   - 型定義が標準装備
   - 型安全性が高い

5. **国際化（i18n）サポート**
   - 多言語対応
   - ロケールを指定できる

### ⚠️ デメリット

1. **軽量性のトレードオフ**
   - Moment.jsほど機能が豊富ではない
   - 一部の高度な機能はない

2. **学習コスト**
   - 関数が多いため、覚える必要がある

## date-fnsのインストール

```bash
npm install date-fns
```

## date-fnsの基本例

### 日付のフォーマット

```javascript
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const date = new Date(2024, 0, 15); // 2024年1月15日

// 基本的なフォーマット
format(date, 'yyyy-MM-dd'); // '2024-01-15'
format(date, 'yyyy年MM月dd日'); // '2024年01月15日'

// ロケールを指定
format(date, 'PPPP', { locale: ja }); // '2024年1月15日月曜日'
```

### 日付の操作

```javascript
import { addDays, addMonths, addYears, subDays } from 'date-fns';

const today = new Date();

// 日を追加
const tomorrow = addDays(today, 1);
const nextWeek = addDays(today, 7);

// 月を追加
const nextMonth = addMonths(today, 1);

// 年を追加
const nextYear = addYears(today, 1);

// 日を減算
const yesterday = subDays(today, 1);
```

### 日付の比較

```javascript
import { isAfter, isBefore, isEqual, isSameDay, differenceInDays } from 'date-fns';

const date1 = new Date(2024, 0, 15);
const date2 = new Date(2024, 0, 20);

// 日付の比較
isAfter(date2, date1); // true
isBefore(date1, date2); // true
isEqual(date1, date2); // false
isSameDay(date1, date2); // false

// 日数の差を計算
differenceInDays(date2, date1); // 5
```

### 日付の解析

```javascript
import { parse, parseISO } from 'date-fns';

// 文字列から日付を解析
const date = parse('2024-01-15', 'yyyy-MM-dd', new Date());

// ISO文字列から日付を解析（推奨）
const isoDate = parseISO('2024-01-15T10:30:00Z');
```

### 日付の検証

```javascript
import { isValid, isDate } from 'date-fns';

const validDate = new Date();
const invalidDate = new Date('invalid');

isValid(validDate); // true
isValid(invalidDate); // false
isDate(validDate); // true
```

### 日付の範囲

```javascript
import { eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

const today = new Date();

// 今週のすべての日を取得
const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 月曜日から
const weekEnd = endOfWeek(today);
const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
```

### 相対時間

```javascript
import { formatDistance, formatRelative } from 'date-fns';
import { ja } from 'date-fns/locale';

const now = new Date();
const past = new Date(2024, 0, 1);

// 相対時間を表示
formatDistance(past, now, { locale: ja }); // '約15日'
formatRelative(past, now, { locale: ja }); // '2024年1月1日'
```

## 実用的な例

### カレンダーコンポーネント用のデータ生成

```javascript
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  getDay,
  format
} from 'date-fns';

function getCalendarDays(year, month) {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  const days = eachDayOfInterval({ start, end });
  
  return days.map(day => ({
    date: day,
    dayOfWeek: getDay(day),
    formatted: format(day, 'yyyy-MM-dd')
  }));
}
```

### 日付のバリデーション

```javascript
import { isValid, parse } from 'date-fns';

function validateDate(dateString) {
  const parsed = parse(dateString, 'yyyy-MM-dd', new Date());
  return isValid(parsed);
}

validateDate('2024-01-15'); // true
validateDate('2024-13-45'); // false
```

### 期限の計算

```javascript
import { addDays, isPast, differenceInDays } from 'date-fns';

function getDeadlineInfo(deadline) {
  const now = new Date();
  const isOverdue = isPast(deadline);
  const daysRemaining = differenceInDays(deadline, now);
  
  return {
    isOverdue,
    daysRemaining: isOverdue ? 0 : daysRemaining,
    deadline
  };
}
```

## Moment.jsからの移行

date-fnsはMoment.jsの代替としてよく使われます。

```javascript
// Moment.js
import moment from 'moment';
moment().add(7, 'days').format('YYYY-MM-DD');

// date-fns
import { addDays, format } from 'date-fns';
format(addDays(new Date(), 7), 'yyyy-MM-dd');
```

## まとめ

- date-fnsは軽量で使いやすい日付ライブラリ
- 必要な関数だけをインポートできるため、バンドルサイズが小さい
- 関数型アプローチで、読みやすいコードが書ける
- TypeScript対応で、型安全性が高い
- 国際化（i18n）に対応

**初心者の方へ**: JavaScriptの標準のDateオブジェクトは使いにくい部分があるため、date-fnsのようなライブラリを使うと、日付操作が簡単になります。まずは基本的なフォーマットや操作から始めて、徐々に高度な機能を使っていくことをおすすめします。


## 2026年時点の補足

- v4 からタイムゾーンを第一級で扱える（`@date-fns/tz` の `TZDate`・`tz()`）
- 標準の新しい日時API **Temporal** の実装がブラウザで進んでいる。未対応環境ではポリフィルを使う。考え方は [[02_日付・時刻の扱い]]

## 関連
- [[02_日付・時刻の扱い]]
