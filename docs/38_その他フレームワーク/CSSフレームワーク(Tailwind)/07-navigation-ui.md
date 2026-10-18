# 6. ナビゲーション・UIパターン（TypeScript / React）

- **狭い画面**: `hidden md:flex` でリンク群を隠し、ボタンで `md:hidden` のパネルを開く、など。**同じメニュー DOM を表示切替**する方が保守しやすいことが多いです。
- **開閉**: フォーカストラップや `focus:` リング（`focus:outline-none focus:ring-2` など）は HTML/JS とセットで設計します（Tailwind は見た目の補助）。

## 状態を TypeScript で持つ例

```tsx
import { useCallback, useId, useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <header className="border-b px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="/" className="font-semibold">
          Logo
        </a>

        <nav className="hidden gap-6 md:flex" aria-label="メイン">
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
        </nav>

        <button
          type="button"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md md:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          メニュー
        </button>
      </div>

      <div
        id={panelId}
        className={`border-t px-4 py-3 md:hidden ${open ? "block" : "hidden"}`}
      >
        <nav className="flex flex-col gap-3" aria-label="モバイルメニュー">
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
        </nav>
      </div>
    </header>
  );
}
```

実装では `useEffect` でフォーカストラップ、`Escape` で閉じる、などを足してください。

← [[03_Web基礎（フロントエンド入門）/03_レスポンシブ/00-design-implementation|レスポンシブ実装インデックス]]
