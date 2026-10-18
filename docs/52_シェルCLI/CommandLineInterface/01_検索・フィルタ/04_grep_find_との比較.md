# grep / find とモダンツールの比較

## 概要

Unix/Linuxには古くから**grep**（テキスト検索）と**find**（ファイル検索）という2つの基本コマンドがあります。これらはほぼすべてのシステムにプリインストールされており、現在でも広く使われています。

一方で、近年は**ripgrep（rg）**、**fd**、**fzf**といったモダンな代替ツールが登場し、速度・使いやすさの面で大きな進化を遂げています。

このページでは、従来ツールの基本を押さえつつ、モダンツールとの違いと使い分けを解説します。

---

## grep - テキスト検索の基本

### grepとは

**grep**（Global Regular Expression Print）は、ファイル内のテキストを正規表現で検索するコマンドです。1973年にKen Thompsonによって作成された、Unix哲学を体現するツールの一つです。

### 基本的な使い方

```bash
# ファイル内を検索
grep "pattern" file.txt

# 再帰的に検索（ディレクトリ以下すべて）
grep -r "pattern" .

# パイプで使用
cat file.txt | grep "pattern"
```

### よく使うオプション

```bash
# 大文字小文字を無視
grep -i "error" log.txt

# 行番号を表示
grep -n "TODO" main.py

# マッチしたファイル名のみ表示
grep -rl "import" src/

# マッチしない行を表示
grep -v "debug" log.txt

# 単語単位でマッチ
grep -w "log" main.py

# 拡張正規表現を使用
grep -E "error|warning" log.txt

# マッチ数をカウント
grep -c "error" log.txt

# 前後のコンテキストを表示
grep -C 3 "ERROR" log.txt    # 前後3行
grep -B 2 "ERROR" log.txt    # 前2行
grep -A 5 "ERROR" log.txt    # 後5行

# バイナリファイルをスキップ
grep -rI "pattern" .

# 特定のファイルだけを対象
grep -r --include="*.py" "import" .

# 特定のファイルを除外
grep -r --exclude-dir="node_modules" "pattern" .
```

### grepの派生コマンド

| コマンド | 説明 |
|---------|------|
| `grep` | 基本正規表現（BRE） |
| `egrep` | 拡張正規表現（`grep -E`と同じ） |
| `fgrep` | 固定文字列検索（`grep -F`と同じ） |
| `zgrep` | gzip圧縮ファイルを検索 |

---

## find - ファイル検索の基本

### findとは

**find**は、ディレクトリツリーを走査してファイルやディレクトリを検索するコマンドです。名前、タイプ、サイズ、更新日時など、多彩な条件で検索できます。

### 基本的な使い方

```bash
# 基本構文
find [検索開始パス] [条件] [アクション]

# カレントディレクトリ以下の全ファイルを表示
find .

# 名前で検索
find . -name "*.py"

# 大文字小文字を無視して検索
find . -iname "readme*"
```

### よく使うオプション

```bash
# ファイルタイプの指定
find . -type f              # ファイルのみ
find . -type d              # ディレクトリのみ
find . -type l              # シンボリックリンクのみ

# 深さの制限
find . -maxdepth 2 -name "*.js"
find . -mindepth 1 -maxdepth 3

# サイズで検索
find . -size +10M           # 10MB以上
find . -size -1k            # 1KB未満
find . -empty               # 空のファイル

# 時間で検索
find . -mtime -1            # 1日以内に変更
find . -mtime +30           # 30日以上前に変更
find . -newer reference.txt # reference.txtより新しいファイル

# 権限で検索
find . -perm 755            # パーミッションが755
find . -executable          # 実行可能ファイル

# 所有者で検索
find . -user root

# 複合条件
find . -name "*.log" -size +1M
find . \( -name "*.js" -o -name "*.ts" \)  # OR条件
find . -name "*.py" ! -name "test_*"        # NOT条件

# 除外
find . -path "./node_modules" -prune -o -name "*.js" -print
```

### コマンドの実行

```bash
# 見つかったファイルに対してコマンドを実行
find . -name "*.tmp" -exec rm {} \;      # 個別実行
find . -name "*.tmp" -exec rm {} +       # 一括実行

# 確認付き削除
find . -name "*.tmp" -ok rm {} \;

# 結果をxargsに渡す
find . -name "*.py" | xargs grep "import"
find . -name "*.py" -print0 | xargs -0 grep "import"  # スペース対策
```

---

## モダンツールとの比較

### テキスト検索: grep vs ripgrep（rg）

| 特徴 | grep | ripgrep (rg) |
|------|------|-------------|
| **速度** | 普通 | 非常に高速（2〜10倍以上） |
| **再帰検索** | `-r` が必要 | デフォルト |
| **行番号** | `-n` が必要 | デフォルト |
| **カラー出力** | `--color=auto` が必要 | デフォルト |
| **.gitignore** | 非対応 | 自動的に尊重 |
| **バイナリスキップ** | `-I` が必要 | デフォルト |
| **Unicode** | 限定的 | 完全対応 |
| **ファイルタイプ指定** | `--include` | `-t` でタイプ名指定 |
| **可搬性** | どこでもある | インストール必要 |

### ファイル検索: find vs fd

| 特徴 | find | fd |
|------|------|----|
| **速度** | 普通 | 高速（並列処理） |
| **構文** | 複雑（`-name`, `-type`等） | シンプル（`fd パターン`） |
| **正規表現** | `-regex` が必要 | デフォルト |
| **カラー出力** | なし | デフォルト |
| **.gitignore** | 非対応 | 自動的に尊重 |
| **隠しファイル** | デフォルトで含む | デフォルトでスキップ |
| **コマンド実行** | `-exec` | `-x` / `-X` |
| **可搬性** | どこでもある | インストール必要 |

### 総合比較表

| 用途 | 従来ツール | モダンツール | 改善点 |
|------|-----------|------------|--------|
| テキスト検索 | grep | **ripgrep (rg)** | 速度、デフォルト設定、UX |
| ファイル検索 | find | **fd** | 構文のシンプルさ、速度 |
| インタラクティブ選択 | なし | **fzf** | 全く新しいカテゴリ |
| テキスト置換 | sed | **sd** | 構文のシンプルさ |
| ファイル表示 | cat | **bat** | シンタックスハイライト |
| ディレクトリ一覧 | ls | **exa/eza** | 見やすさ、Git統合 |

---

## 速度比較

大規模なプロジェクト（Linuxカーネルソースなど）での検索速度の目安:

### テキスト検索

```
grep -r "EXPORT_SYMBOL" .     → 約 10秒
rg "EXPORT_SYMBOL"            → 約 0.5秒  （約20倍高速）
```

### ファイル検索

```
find . -name "*.c"            → 約 5秒
fd -e c                       → 約 0.3秒  （約15倍高速）
```

> 速度差はプロジェクトの規模やディスクの種類、.gitignoreの有無によって変動します。モダンツールは .gitignore を尊重するため、検索対象ファイル数自体が少なくなることも速度に寄与します。

---

## どのツールをどの場面で使うべきか

### grep / find を使うべき場面

- **サーバーにSSHしてすぐ使いたい**: どのシステムにもインストール済み
- **シェルスクリプトの可搬性**が必要: 他の環境でも動く必要がある
- **CI/CDパイプライン**: 最小限のDockerイメージではモダンツールが入っていない場合がある
- **findの高度な機能**: 権限、所有者、inodeなどの条件検索

### rg / fd / fzf を使うべき場面

- **日常的な開発作業**: 速度とUXの差が生産性に直結
- **大規模プロジェクト**: 検索速度の差が顕著に出る
- **ローカル開発環境**: 自由にツールをインストールできる
- **インタラクティブな作業**: fzfによる対話的選択

### 推奨: 両方覚える

```
「ローカルではモダンツール、サーバーでは従来ツール」
という使い分けが最も実践的です。
```

---

## 移行ガイド

### grep → ripgrep（rg）

```bash
# そのまま置き換えられるケース
grep -r "pattern" .              →  rg "pattern"
grep -ri "pattern" .             →  rg -i "pattern"
grep -rn "pattern" .             →  rg "pattern"          # デフォルトで行番号
grep -rl "pattern" .             →  rg -l "pattern"
grep -r --include="*.py" "pat"   →  rg -t py "pat"
grep -rw "pattern" .             →  rg -w "pattern"
grep -rv "pattern" .             →  rg -v "pattern"
grep -rC 3 "pattern" .           →  rg -C 3 "pattern"
grep -r "p1\|p2" .               →  rg "p1|p2"
grep -rF "literal" .             →  rg -F "literal"

# 注意が必要なケース
grep -P "(?<=prefix)pat"         →  rg -P "(?<=prefix)pat"  # PCREモード
grep --exclude-dir=node_modules  →  不要（自動で.gitignoreを尊重）
```

### find → fd

```bash
# そのまま置き換えられるケース
find . -name "*.py"              →  fd -e py
find . -iname "*test*"           →  fd -i test
find . -type d                   →  fd -t d
find . -type f -name "*.js"      →  fd -e js
find . -maxdepth 2               →  fd -d 2
find . -empty                    →  fd -t e
find . -mtime -1                 →  fd --changed-within 1d
find . -name "*.py" -exec cmd {} \;  →  fd -e py -x cmd
find . -name "*.py" -exec cmd {} +   →  fd -e py -X cmd

# 注意が必要なケース
find . -perm 755                 →  fd では直接対応なし
find . -user root                →  fd では直接対応なし（--owner オプション）
find . -newer ref.txt            →  fd では直接対応なし
```

---

## 共存させる方法

モダンツールと従来ツールは**競合しない**ため、両方インストールして使い分けることが推奨されます:

### エイリアスの設定

```bash
# ~/.bashrc または ~/.zshrc

# rgが使えるならrgを、なければgrepを使う
if command -v rg &> /dev/null; then
    alias search='rg'
else
    alias search='grep -rn'
fi

# fdが使えるならfdを使う
if command -v fd &> /dev/null; then
    alias ff='fd'
else
    alias ff='find . -name'
fi
```

### スクリプトでの使い分け

```bash
#!/bin/bash
# 可搬性のあるスクリプトでは従来ツールを使用
grep -r "pattern" src/

# ローカル専用のスクリプトではモダンツールを使用
if command -v rg &> /dev/null; then
    rg "pattern" src/
else
    grep -rn "pattern" src/
fi
```

---

## まとめ

- **grep / find** は Unix の基本コマンドであり、どこでも使える普遍的なツール
- **rg / fd / fzf** は速度とUXを大幅に改善したモダンな代替ツール
- **ローカル開発ではモダンツール**、**スクリプトやサーバーでは従来ツール**という使い分けが実践的
- 両方の基本を覚えておくことで、どのような環境でも効率的に作業できる
- モダンツール同士の組み合わせ（fd + fzf + rg + bat）で、検索ワークフローが劇的に改善される

### 関連ページ

- [[01_ripgrep_rg]] - ripgrepの詳細解説
- [[02_fd]] - fdの詳細解説
- [[03_fzf]] - fzfの詳細解説
