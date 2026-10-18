# 12-1. CSS Modules / styled-components / Tailwind 概観

## 🎯 この章で学ぶこと

- 主要な3つのスタイリング手法の違い
- それぞれの長所・短所
- 同じコンポーネントを3手法で書き比べ

---

## 📖 主要選択肢

| 手法 | 書き方 | 特徴 |
| --- | --- | --- |
| **CSS Modules** | 別の.cssファイル + import | スコープ局所化、シンプル |
| **styled-components / Emotion** | JSの中にCSS | propsで動的、CSS-in-JS |
| **Tailwind CSS** | classで直接 | 速い、規約強制 |

他に：

- **Vanilla CSS / SCSS**（基本）
- **CSS-in-JS（Linaria, vanilla-extract）**（ランタイム0）
- **UIライブラリ**（MUI, Chakra UI）

---

## 💻 CSS Modules

```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 4px;
  background: #007bff;
  color: white;
}

.primary { background: #007bff; }
.secondary { background: #6c757d; }
```

```jsx
import styles from './Button.module.css';

function Button({ variant = 'primary', children }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

利点：

- 普通のCSSが書ける
- スコープが**そのファイル内に閉じる**（同じclass名がぶつからない）
- ビルド設定不要（Vite/Next.js標準）

---

## 💻 styled-components

```bash
npm install styled-components
```

```jsx
import styled from 'styled-components';

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  background: ${(props) => props.$primary ? '#007bff' : '#6c757d'};
  color: white;

  &:hover { opacity: 0.9; }
`;

function App() {
  return <Button $primary>クリック</Button>;
}
```

利点：

- propsで動的に変えられる
- JSとCSSが同じファイル
- TypeScript と相性良し

短所：

- ランタイムコスト（バンドルサイズ +）
- React 19+では制限あり（Server Componentsで不利）

---

## 💻 Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```jsx
function Button({ variant = 'primary', children }) {
  const styles = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600',
  };
  return (
    <button className={`px-4 py-2 rounded text-white ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

利点：

- **書くのが速い**（class指定だけ）
- 統一感（規約強制）
- 不要なCSSが自動削除（PurgeCSS）
- レスポンシブ・ダークモードが楽

短所：

- 最初は class が呪文に見える
- 長くなりがち（`clsx`、`tailwind-merge` で軽減）

---

## 💻 同じコンポーネントを3手法で

### CSS Modules

```jsx
<div className={styles.card}>
  <h2 className={styles.title}>{title}</h2>
</div>
```

### styled-components

```jsx
const Card = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: white;
`;
const Title = styled.h2`
  font-size: 20px;
`;

<Card>
  <Title>{title}</Title>
</Card>
```

### Tailwind

```jsx
<div className="p-4 rounded-lg bg-white">
  <h2 className="text-xl">{title}</h2>
</div>
```

---

## 💡 選び方の指針

| 状況 | 推奨 |
| --- | --- |
| 初学者・標準的に | **CSS Modules** |
| 速度重視・大規模 | **Tailwind** |
| デザインシステム自作 | styled-components / Emotion |
| Server Components 使う | Tailwind / vanilla-extract |
| UIライブラリ使う | **MUI / Chakra / Mantine** |

---

## 💻 UIライブラリ（補足）

```bash
npm install @mui/material @emotion/react @emotion/styled
```

```jsx
import { Button } from '@mui/material';

<Button variant="contained">送信</Button>
```

→ デザインシステムが用意されている。**Radix UI（headless） + Tailwind** の組み合わせも人気。

---

## ❌ よくある間違い

### 複数の手法を混ぜる

→ Tailwind + styled-components + CSS Modules を全部使うと混乱。**1つに統一**。

### グローバルCSSを多用

→ どこから影響か分からなくなる。**スコープ管理**手段を使う。

### Tailwindのclass名を `dark:` `md:` などで爆発

→ 共通classは Tailwind の **`@apply`** か `clsx` ヘルパで整理。

### styled-componentsのpropsで再描画爆発

→ 動的style はほどほどに。

---

## ✅ ベストプラクティス

1. **プロジェクトで1つに統一**
2. **新規プロジェクトは Tailwind が人気**
3. **CSS Modules は手堅い選択**
4. **デザインシステムには UIライブラリ**
5. **グローバルCSSは最小限**

---

## 🔬 実践演習

同じ「Card」コンポーネントを3手法で実装：

- CSS Modules版
- styled-components版
- Tailwind版

書きやすさを体験する。

---

## 📝 まとめ

- 主要3手法：CSS Modules / styled-components / Tailwind
- 1つに統一が原則
- Tailwindは現在最も人気
- UIライブラリで時短も選択肢

---

## 🔗 関連ページ

- [[12-2-コンポーネントとスタイルの境界]]
- [[12-3-レスポンシブ-ダークモード]]
- [[12-5-テーマ設計]]
