# Atomic Design — 使いどころと限界

## この章の目的

Brad Frost が 2013 年に提唱した **Atomic Design** の 5 段階を理解し、**どこで役立ち、どこで破綻しやすいか** を判断できるようになる章です。ディレクトリ構成としての扱いは [[01_ディレクトリ構成の方式比較]] で比較します。

---

## 1. Atomic Design とは

化学のたとえで、UI を小さい部品から組み上げる **設計の考え方（メンタルモデル）** です。

```text
  Atoms ─▶ Molecules ─▶ Organisms ─▶ Templates ─▶ Pages
  原子       分子          有機体        テンプレート    ページ
  Button    SearchForm     Header        レイアウト      実データ入り
  Input     (Input+Button) (Logo+Nav     の骨組み       の画面
  Label                     +SearchForm)
```

| 段階 | 内容 | 例 |
|------|------|-----|
| **Atoms** | これ以上分けられない最小の UI | Button, Input, Label, Icon |
| **Molecules** | Atoms を組み合わせた小さな機能単位 | ラベル付き入力、検索フォーム |
| **Organisms** | 画面の独立した区画 | ヘッダー、商品一覧、コメント欄 |
| **Templates** | 部品の配置（レイアウト）。中身はダミー | 記事ページの骨組み |
| **Pages** | Templates に実データを入れた完成形 | 実際のトップページ |

もともとはデザインと実装の断絶（デザインは「ページ」、実装は「部品」で考える）を埋めるための方法論として提案されました（『Atomic Design』2016 年）。

---

## 2. Atomic Design が役立つ場面

| 場面 | 理由 |
|------|------|
| デザインシステムを作る | 小さい部品から揃えると、全画面の一貫性が出る |
| デザイナーと会話する | 「これは Molecule」と粒度の共通語ができる |
| UI カタログ（Storybook）を整える | 階層ごとに部品を並べられる |
| 部品を段階的に作る | Atoms → Molecules の順に作ると重複が減る |

特に **Atoms と Molecules** は、デザインシステムの汎用部品とほぼ一致するため、多くのチームで今も有効です。

---

## 3. よくある破綻

一方、**アプリ全体のフォルダ構成** として Atomic Design をそのまま使うと、次の問題が起きやすいことが知られています。

| 問題 | 症状 |
|------|------|
| **分類で迷う** | 「これは Molecule か Organism か」の議論に時間を取られる |
| **ドメインが見えない** | `organisms/` に注文・ユーザー・商品の部品が混在する |
| **ロジックの置き場がない** | データ取得や状態を持つ部品をどこに置くか決まっていない |
| **機能を消しにくい** | 1 つの機能の部品が 5 階層に散らばる |

```text
  components/
    atoms/        Button, Input ...
    molecules/    SearchForm, PriceTag, UserBadge ...
    organisms/    Header, OrderTable, UserProfile, CartSummary ...  ← 肥大化
    templates/
    pages/
```

「見た目の粒度」で分類しているため、**「どの機能に属するか」という軸が失われる** のが根本的な原因です。

---

## 4. 現実的な使い方

多くのチームは、Atomic Design を **汎用 UI 部品の中だけ** に限定して使っています。

```text
  src/
    shared/ui/          ← 汎用部品。ここで Atoms / Molecules の考え方を使う
      Button/ Input/ Modal/
    features/           ← 機能ごとに縦に切る（ドメインの軸）
      order/ components/ hooks/ api/
      user/  components/ hooks/ api/
    pages/              ← 画面（Templates + Pages に相当）
```

| 使い方 | 向く場面 | 向かない場面 |
|--------|---------|-------------|
| 5 階層をそのままフォルダに | 小〜中規模、UI 中心のサイト | ドメインが多い業務アプリ |
| 汎用部品の中だけで使う | ほとんどのアプリ | — |
| 考え方（語彙）としてだけ使う | デザイナーとの会話 | — |

Templates と Pages の区別は、フレームワークのルーティング（Next.js の `layout` と `page` など）で自然に表現されることも多くなっています。

---

## 5. 判断のポイント

- **分類に迷ったら、その部品はドメインに属している** 可能性が高い → features 側へ
- 汎用部品かどうかは「別のアプリでもそのまま使えるか」で判断する
- 階層の名前にこだわらず、`ui/`（汎用）と `features/`（機能）の 2 分割から始めても十分

---

## まとめ

- Atomic Design は Atoms → Molecules → Organisms → Templates → Pages の 5 段階
- デザインシステム・UI カタログ・デザイナーとの共通語として有効
- アプリ全体のフォルダ構成にすると、ドメインの軸が失われて破綻しやすい
- 現実的には汎用 UI 部品の中だけで使い、機能は Feature 単位で切る

## 関連

- [[00_フロントエンド設計の変遷]] — Atomic Design の登場背景
- [[01_ディレクトリ構成の方式比較]] — Layer型 / Feature型 / Atomic / FSD の比較
- [[01_デザインシステムの構成要素]] — 部品とトークン
- [[10-6-ディレクトリ設計]] — React でのディレクトリ設計（32_React）

→ 次の章: [[01_状態の分類と置き場所]]
