# PATH と `.profile` 入門 — 初心者向け

## この文書のねらい

ターミナルで `command not found` と出たとき、**PATH** や **`.profile`** の話が出てくる。
ここでは専門用語を避けて、

- **PATH とは何か**
- **`.profile` とは何か**
- **なぜ Cursor では動くのに、別のターミナルでは動かないのか**

を、具体例つきで押さえる。

詳しい書き分けや `export` の仕組みは、別ドキュメント（`環境変数とexport.md` / `bashrcとbash_profile.md`）を参照。

---

## 1. PATH とは — 「コマンドを探す場所のリスト」

ターミナルで `claude` や `git` と打つと、Mac / Linux は **実行ファイルを探してから** 動かす。

そのときに見に行くフォルダの一覧が **PATH**（パス）である。

### 1-1. 身近な例え

> **探し物の順番リスト** だと思えばよい。

```
PATH = ~/.local/bin : /usr/bin : /bin : ...
         ↑ 最初にここを探す   ↑ 次にここ...
```

- 左から順にフォルダを見に行く
- 見つかったら実行する
- **どこにもなければ** `command not found`（コマンドが見つからない）

### 1-2. 実際の中身を見る

```bash
echo $PATH
# /Users/alice/.local/bin:/usr/local/bin:/usr/bin:/bin:...
```

- `:`（コロン）で区切られた **フォルダ名の並び**
- `$PATH` と書くと、今の PATH の中身が表示される

### 1-3. なぜ PATH が重要か

CLI ツール（Claude Code、Node、Python など）をインストールすると、実行ファイルは **特定のフォルダ** に置かれる。

例：Claude Code CLI

```
~/.local/bin/claude
```

このフォルダが PATH に **入っていない** と、ファイルは存在するのに `claude: command not found` になる。

---

## 2. `.profile` とは — ターミナル起動時の「自動設定ファイル」

**`.profile`** は、ホームフォルダ（`/Users/あなた/`）にある **隠しファイル** である。

ターミナルを **開いた瞬間** に、シェルが自動で読み込む設定の置き場。

### 2-1. 何を書くのか

よく書く内容：

```bash
export PATH="$HOME/.local/bin:$PATH"
export EDITOR=vim
export LANG=ja_JP.UTF-8
```

| 行 | 意味 |
|----|------|
| `export PATH="..."` | PATH にフォルダを追加する |
| `$HOME/.local/bin` | ホームの `.local/bin`（`~/.local/bin` と同じ） |
| `$PATH` | **今の** PATH（既存の場所も残す） |
| `export` | この設定を **子プロセスにも引き継ぐ** |

**ポイント**：新しい場所を **先頭** に足すと、そのコマンドが優先的に見つかる。

### 2-2. `~` と `$HOME`

| 書き方 | 意味 |
|--------|------|
| `~` | ホームフォルダの省略形 |
| `$HOME` | ホームフォルダのパス（変数） |
| `~/.local/bin` | `/Users/あなた/.local/bin` と同じ |

---

## 3. なぜ「ここでは動くのに、あそこでは動かない」のか

**同じ Mac でも、ターミナルごとに読む設定ファイルが違う** ことがある。

### 3-1. 典型例（macOS）

| 環境 | 使うシェル | 主に読む設定 | PATH に `.local/bin` がある？ |
|------|------------|--------------|-------------------------------|
| Cursor のターミナル | zsh | `~/.zshrc` | ある（ここに書いた場合） |
| Terminal.app / Obsidian など | bash | `~/.profile` | ない（ここに書いていない場合） |

**結果**：

- Cursor → `claude` が使える
- 別のターミナル → `command not found`

インストール自体は成功している。**PATH の設定が、シェルごとに食い違っている** だけ、というケースが多い。

### 3-2. 図で整理

```
ターミナルを開く
    │
    ├─ zsh（Cursor など）
    │     └─ ~/.zshrc を読む → PATH に ~/.local/bin あり ✅
    │
    └─ bash（Terminal.app / Obsidian など）
          └─ ~/.profile を読む → PATH に ~/.local/bin なし ❌
                                    → command not found
```

### 3-3. 関連する設定ファイル

| ファイル | だいたいいつ読まれるか |
|----------|------------------------|
| `~/.profile` | bash など、ログイン時（**複数シェル共通**向け） |
| `~/.zshrc` | zsh（macOS 10.15 以降の既定シェル） |
| `~/.bashrc` | bash の対話シェル |
| `~/.bash_profile` | bash のログインシェル |

**初心者向けの鉄則**：

> **bash も zsh も使うなら、PATH は `~/.profile` に書く。**

zsh だけなら `.zshrc` だけでもよいが、**ターミナルが混在すると `.profile` 不足でハマる**。

---

## 4. 直し方

### 4-1. `.profile` に PATH を追加（推奨）

インストーラーが示す定番：

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.profile
source ~/.profile
```

### 4-2. 反映されないとき

| 原因 | 対処 |
|------|------|
| すでに開いていたターミナル | **一度閉じて開き直す** |
| 今の窓だけ直したい | `source ~/.profile` を実行 |
| どこに書いたか忘れた | `grep local/bin ~/.profile ~/.zshrc ~/.bash_profile` で確認 |

### 4-3. 直ったか確認

```bash
which claude          # パスが表示されれば OK
echo $PATH            # ~/.local/bin が含まれているか
```

---

## 5. よくある疑問

### Q. `.profile` と `.zshrc`、両方に書く？

- **PATH だけ** → `.profile` に **1 回** 書けば bash / zsh 両方で効く（zsh が `.profile` を読む設定の場合が多い）
- **zsh 専用**（エイリアス、プロンプト）→ `.zshrc`
- **bash 専用** → `.bashrc` / `.bash_profile`

PATH を `.zshrc` **だけ** に書くと、bash 側では効かない — §3 のトラブルの原因になる。

### Q. Obsidian の `.claude` フォルダは関係ある？

**ない。** プロジェクト用の設定フォルダであり、ターミナルの `claude` コマンドを有効にするものではない。

### Q. Windows でも同じ？

概念は同じ（**コマンドを探す場所のリスト**）だが、

- 区切り文字は `;`（セミコロン）
- 設定場所は「環境変数」画面や PowerShell プロファイル

→ `../../01_Windows/02_パス/03_環境変数PATH.md` を参照。

---

## 6. 3 行まとめ

1. **PATH** = コマンドを探すフォルダのリスト。左から順に探す。
2. **`.profile`** = ターミナル起動時に自動で読む設定。PATH をここに書ける。
3. **ターミナルごとに読むファイルが違う** と、同じコマンドでも片方だけ `command not found` になる。

---

## 関連ドキュメント

- `../Terminal/00_ターミナルとシェル入門.md` — ターミナルとシェルの違い・一覧
- `環境変数とexport.md` — `export` の意味、PATH の詳細
- `bashrcとbash_profile.md` — どのファイルに何を書くか、定番構成
- `zsh_fishとの比較.md` — macOS 既定 zsh と `.profile` の使い分け
- `../../01_Windows/02_パス/03_環境変数PATH.md` — Windows 版 PATH
- `../../05_Troubleshooting/カテゴリ別事故集/PATH関連/` — トラブルシューティング
