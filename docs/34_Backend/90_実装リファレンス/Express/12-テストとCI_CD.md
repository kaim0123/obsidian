# 12-テストとCI/CD

---

## この章で学ぶこと
- ユニットテストの基礎と実践
- APIテストの方法
- CI/CD（継続的インテグレーション/デリバリー）自動化の概要
- Express.jsでのテスト自動化の流れ

---

## ユニットテストの基礎

- ユニットテストは「関数やモジュール単位での動作検証」
- 代表的なツール：Jest、Mocha、Chai

### 例：Jestでのテスト
```js
// sum.js
function sum(a, b) { return a + b; }
module.exports = sum;

// sum.test.js
const sum = require('./sum');
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

---

## APIテストの方法

- SupertestやJestを使ってExpress APIのエンドポイントを自動テスト

```js
const request = require('supertest');
const app = require('./app');

describe('GET /api/users', () => {
  it('should return user list', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

---

## CI/CD自動化の概要

- CI（継続的インテグレーション）：テスト・ビルドを自動化し品質を保つ
- CD（継続的デリバリー/デプロイ）：本番環境への自動デプロイ
- 代表的なサービス：GitHub Actions, CircleCI, TravisCI

### 例：GitHub ActionsでNode.jsプロジェクトを自動テスト
```yaml
name: Node.js CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

---

## 参考・関連ページ
- [[11-最適化とデプロイ]]
- [[13-パフォーマンス・最適化]]
- [[14-よくある質問・トラブルシューティング]]
- [[00-Express.js index]] 