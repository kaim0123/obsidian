---
title: Zen of Python
created: 2026-10-18
tags:
  - 原則
  - 思想
---

# Zen of Python（Python の禅）

## はじめに

Python の対話モードで `import this` と打つと、短い詩のような英文が表示されます。これが **Zen of Python（Python の禅）** です。

Python のための心得として書かれたものですが、内容は「読みやすく、シンプルで、はっきりしたコードを書こう」という、言語を問わず通用する話です。

---

## 一言でいうと

**「美しく、明示的で、シンプルで、読みやすいコードを書け」**

---

## 出典・背景

- 作者は Python の初期からのコア開発者 **Tim Peters**。1999年に Python のメーリングリストへ投稿したものが元になっている
- 2004年に **PEP 20**（Python の改善提案の1つ）として正式に記録された
- 「20 の格言」とされているが、書かれているのは **19 行**。残りの 1 つは Python の生みの親 Guido van Rossum が埋めるために空けてある、と Tim Peters は説明している
- `import this` で表示されるのは、Python に仕込まれたイースターエッグ（隠し機能）。ちなみに `this` モジュールのソースコード自体は、わざと読みにくく暗号化（ROT13）されている

---

## 中身の解説: 19 行を読む

| # | 原文 | 訳 | ひとこと解説 |
|---|---|---|---|
| 1 | Beautiful is better than ugly. | 美しいほうが醜いよりよい | 見た目の整ったコードは読みやすく、間違いも見つけやすい |
| 2 | Explicit is better than implicit. | 明示的なほうが暗黙的よりよい | 何が起きるかをコードに書く。「裏で勝手に」を避ける |
| 3 | Simple is better than complex. | 単純なほうが複雑よりよい | KISS と同じ主張 |
| 4 | Complex is better than complicated. | 複雑なほうが込み入っているよりよい | 本質的に複雑なのは仕方ない。でも、ぐちゃぐちゃに絡ませてはいけない |
| 5 | Flat is better than nested. | 平らなほうが入れ子よりよい | ネストの深い if やパッケージ階層を避ける |
| 6 | Sparse is better than dense. | まばらなほうが密集しているよりよい | 1 行に詰め込まない |
| 7 | Readability counts. | 読みやすさは大切 | コードは書くより読まれる回数のほうが多い |
| 8 | Special cases aren't special enough to break the rules. | 特別な場合でも、ルールを破るほど特別ではない | 例外を作るとルールが覚えにくくなる |
| 9 | Although practicality beats purity. | とはいえ、実用性は純粋さに勝る | 8 とセット。ルールに固執しすぎない |
| 10 | Errors should never pass silently. | エラーを黙って見過ごしてはいけない | 例外を握りつぶさない |
| 11 | Unless explicitly silenced. | 明示的に黙らせた場合は別 | 意図して無視するなら、それがわかるように書く |
| 12 | In the face of ambiguity, refuse the temptation to guess. | 曖昧なときは、推測したくなる誘惑を断れ | 「たぶんこうだろう」で処理を進めない |
| 13 | There should be one-- and preferably only one --obvious way to do it. | やり方は 1 つ、できれば 1 つだけ、明らかなものがあるべきだ | 書き方がバラバラにならないようにする（Perl の「やり方はいくつもある」への対比） |
| 14 | Although that way may not be obvious at first unless you're Dutch. | ただし、オランダ人でなければ最初はわかりにくいかもしれない | Guido van Rossum がオランダ人であることにかけた冗談 |
| 15 | Now is better than never. | やらないより、今やるほうがよい | 先延ばしにせず手を動かす |
| 16 | Although never is often better than *right* now. | とはいえ、「今すぐ」よりやらないほうがよいことも多い | よく考えずに急いで作るくらいなら、やらないほうがまし |
| 17 | If the implementation is hard to explain, it's a bad idea. | 実装を説明するのが難しいなら、それは悪いアイデアだ | 説明できない設計は、たいてい複雑すぎる |
| 18 | If the implementation is easy to explain, it may be a good idea. | 実装を説明するのが簡単なら、良いアイデアかもしれない | 「かもしれない」に注意。説明しやすいだけで正しいとは限らない |
| 19 | Namespaces are one honking great idea -- let's do more of those! | 名前空間はすばらしいアイデアだ。もっと使おう！ | 名前の衝突を防ぎ、どこから来たかを明確にする |

### いくつかをコードで見る

**2. 明示的なほうが暗黙的よりよい**

```python
# 暗黙的: どの名前が入ってきたかわからない
from os.path import *

# 明示的: 何を使っているか一目でわかる
from os.path import join, exists
```

**5. 平らなほうが入れ子よりよい**

```python
# 入れ子: 読むのに頭のスタックを積む必要がある
def can_order(user, item):
    if user is not None:
        if user.is_active:
            if item.in_stock:
                return True
    return False

# 平ら: 早期リターン（ガード節）で条件を並べる
def can_order(user, item):
    if user is None:
        return False
    if not user.is_active:
        return False
    return item.in_stock
```

**10・11. エラーを黙って見過ごさない／明示的に黙らせた場合は別**

```python
# 悪い例: 何が起きても黙って続行
try:
    config = load_config()
except Exception:
    pass

# 良い例: 想定しているエラーだけを、意図がわかる形で扱う
try:
    config = load_config()
except FileNotFoundError:
    config = DEFAULT_CONFIG  # 設定ファイルがなければ既定値を使う
```

---

## 他の原則との対応

| Zen of Python | 対応する原則・考え方 |
|---|---|
| Simple is better than complex | **KISS** |
| Explicit is better than implicit | **驚き最小の原則**（読み手が予想しない動きをさせない） |
| There should be one obvious way to do it | **DRY**（同じことを別々のやり方で書かない）、コーディング規約 |
| Errors should never pass silently | **フェイルファスト**（問題はすぐに表に出す） |
| Although practicality beats purity | **Worse is Better**、原則に固執しすぎない姿勢 |
| Now is better than never / Although never is often better than *right* now | **YAGNI** と、その行き過ぎへの歯止め |
| If the implementation is hard to explain, it's a bad idea | **KISS**、[[04_UNIX哲学]] の「小さく作る」 |
| Namespaces are one honking great idea | **関心の分離**、**情報隠蔽**（名前の届く範囲を区切る） |
| Flat is better than nested | 早期リターン、ネストを浅くするリファクタリング |

---

## 現代の開発での活かし方

- **コードレビューの共通言語**: 「ここは Explicit is better than implicit では？」のように、指摘の根拠として使える
- **言語を問わない指針**: JavaScript や TypeScript でも、ワイルドカード import を避ける、ネストを浅くする、例外を握りつぶさない、はそのまま当てはまる
- **リンターとの関係**: Python の PEP 8（スタイルガイド）や各種リンターは、Zen の精神を具体的なルールに落としたものと考えられる
- **AI 生成コードのチェック**: AI が書いたコードは、ネストが深い・例外を握りつぶす・暗黙の挙動に頼る、といった Zen に反する形になることがある。レビューの観点として使える

---

## よくある誤解

### 「絶対に守るべき規則」

Zen of Python は **互いに矛盾する行を含む** 心得です（8 と 9、15 と 16 など）。わざと対になっていて、「状況を見て判断しよう」というメッセージでもあります。

### 「Python では本当にやり方が 1 つしかない」

実際の Python には、文字列整形だけでも `%` 書式・`str.format()`・f-string など複数の書き方があります。13 行目は「理想として目指す方向」です。

### 「Python 専用の話」

例こそ Python ですが、読みやすさ・明示性・単純さは、どの言語にも通じる考え方です。

---

## まとめ

- Tim Peters が 1999年に書き、2004年に **PEP 20** として記録された、Python の設計の心得
- `import this` で表示される 19 行
- 美しさ・明示性・単純さ・読みやすさ・エラーを隠さないことを重視する
- 行同士がわざと対になっていて、**原則と実用のバランス** を取るよう促している
- KISS・DRY・YAGNI・驚き最小の原則などと多くの点で重なる

---

## 関連ノート

- [[01_DRY_KISS_YAGNI]] — KISS / DRY / YAGNI との対応
- [[01_関心の分離]] — 名前空間・分け方
- [[04_UNIX哲学]] — 小さく単純に作る、という共通の姿勢
- [[05_Worse_is_Better]] — 「実用性は純粋さに勝る」とのつながり
- [[02感情がない人はAPIとして優れているし、情報隠ぺいは正義【プリンシプルオブライフ2】27]] — 情報隠蔽

→ 入口: [[MOC_原則体系]]
