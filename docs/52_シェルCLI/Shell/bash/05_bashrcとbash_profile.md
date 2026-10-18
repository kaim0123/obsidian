# `~/.bashrc` と `~/.bash_profile` — どっちに何を書くか

## この文書のねらい

bash を使い始めて最初に **全員がハマる** 問題がこれ。

- 「`.bashrc` に書いたのに SSH ログインで効かない」
- 「`.bash_profile` に書いたのに新しいターミナルで効かない」
- 「そもそも `.profile` って何？」

この文書で **どちらに何を書けばいいか** の指針と、**両方で使い回す定番構成** を押さえる。
原理は `bash基礎.md` の「起動モード」を読んでおくと理解しやすい。

> **PATH / `.profile` が初めての人** → まず `PATHとprofile入門.md`（探し物リストの比喩、シェルごとの違い、macOS の具体例）を読んでから本編に入る。

---

## 1. 前提：起動モードで読まれるファイルが違う

### 1-1. ログイン・シェル（LOGIN SHELL）

- SSH 直後
- macOS の Terminal.app（標準では各タブがログインシェル）
- `bash --login` 明示起動

読む順序：
1. `/etc/profile`
2. 個人用：最初に見つかった 1 つだけ
   - `~/.bash_profile`
   - `~/.bash_login`
   - `~/.profile`

### 1-2. 対話・非ログイン・シェル

- Linux デスクトップで GUI ターミナルを開いたとき
- すでにログイン済みの状態で `bash` と打って子シェルを起動

読むファイル：
- `/etc/bash.bashrc`（あれば）
- `~/.bashrc`

### 1-3. 非対話・非ログイン（スクリプト実行など）

- どれも **読まれない** のが原則
- `BASH_ENV` 変数で明示すれば別

---

## 2. どうしてこんな仕様なのか

UNIX では **「ログイン時にだけやる設定」** と **「シェル起動のたびにやる設定」** を分ける文化がある。

| 種類                     | 例                                          |
|--------------------------|---------------------------------------------|
| ログイン時にだけ         | `PATH` の設定、`LANG`、ssh-agent 起動、環境変数全般 |
| 対話シェル起動のたびに   | エイリアス、関数、プロンプト、補完          |

PATH を毎回追加すると重複していくので、**ログイン時だけで十分**。
エイリアスは **子シェルにも欲しい** ので毎回読みたい、という設計思想。

---

## 3. 書き分け指針

### 3-1. `~/.bash_profile`（ログイン時に 1 回）

- 環境変数
  - `export PATH="$HOME/bin:$PATH"`
  - `export EDITOR=vim`
  - `export LANG=ja_JP.UTF-8`
- ssh-agent の起動など、セッション単位のもの
- **最後に `.bashrc` を読み込む行** を入れておく（§4）

### 3-2. `~/.bashrc`（対話シェル起動のたび）

- エイリアス：`alias ll='ls -la'`
- 関数：`mkcd() { ... }`
- プロンプト：`PS1='...'`
- 対話補完：`source /etc/bash_completion` など
- ヒストリ設定：`HISTSIZE`, `HISTCONTROL`

### 3-3. `~/.profile`

- 歴史的には **すべての Bourne 系シェル共通** の設定用
- bash 以外のシェルも使うなら **ここに bash 非依存の環境変数** を書く
- bash しか使わないなら `~/.bash_profile` だけでよい

---

## 4. 定番パターン：二重管理しない書き方

bash の世界で **最も一般的** な解決策：

### 4-1. `~/.bash_profile`

```bash
# ログイン時：まず共通の環境設定
if [ -f ~/.profile ]; then
    . ~/.profile        # 環境変数（bash 以外でも使う）
fi

# 対話設定も読み込む
if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi
```

### 4-2. `~/.bashrc`

```bash
# 非対話ならここで終わり（保険）
case $- in
    *i*) ;;
      *) return;;
esac

# --- ここから対話シェル用 ---
alias ll='ls -la'
alias gs='git status'

mkcd() { mkdir -p "$1" && cd "$1"; }

PS1='\u@\h:\w\$ '

# 補完
[ -f /etc/bash_completion ] && . /etc/bash_completion
```

### 4-3. `~/.profile`（bash も sh も共通にしたい場合）

```bash
# PATH
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"

# 基本環境
export EDITOR=vim
export LANG=ja_JP.UTF-8
```

これで **SSH 直後でもターミナル起動後でも同じ環境** が得られる。

---

## 5. 確認の仕方

### 5-1. いま自分はログインシェル？

```bash
echo $0
```

- `-bash` のように **先頭にハイフン** → ログインシェル
- `bash` のようにハイフンなし → 非ログインシェル

または：

```bash
shopt -q login_shell && echo "login" || echo "non-login"
```

### 5-2. 何が読まれたかデバッグ

`~/.bashrc` と `~/.bash_profile` の先頭に次の行を入れてみる：

```bash
echo ">> .bashrc was read"
echo ">> .bash_profile was read"
```

**動かない**、**反映されない** ときは、まずこれで **誰が読まれているのか** を確認する。

### 5-3. 反映する

```bash
source ~/.bashrc        # または . ~/.bashrc
```

新しいターミナルを開き直しても OK。

---

## 6. 環境別の注意

### 6-1. macOS

- Terminal.app / iTerm2 は **タブごとにログインシェル** になるのが既定
- なので `~/.bashrc` を書いても読まれない → **`.bash_profile` に書く or ブリッジ** が必要
- macOS 10.15 以降の既定は `zsh`。bash を使うなら自分で `chsh -s /bin/bash` が必要

### 6-2. Linux

- GUI ターミナルは **非ログイン・対話** が多い → `~/.bashrc` が基本
- SSH 越しだと **ログイン・対話** → `~/.bash_profile` 経由
- §4 のブリッジで統一すれば悩まない

### 6-3. Git Bash (Windows)

- 起動時に読むのは `~/.bash_profile` → 無ければ `~/.bashrc`
- Windows の環境変数も継承する（`PATH` など）
- 詳しくは `Git Bash初心者ガイド.md`

### 6-4. WSL

- 通常の Linux と同じ扱い
- `~/.bashrc` / `~/.bash_profile` は `/home/<user>/` 配下。Windows のユーザーフォルダではない

---

## 7. よくある落とし穴

| 症状                                          | 原因・対処                                         |
|-----------------------------------------------|----------------------------------------------------|
| `alias` が SSH ログイン直後だけ効かない       | `.bashrc` だけに書いている。`.bash_profile` で読み込む |
| `PATH` が二重登録されていく                   | 対話ごとに読まれる `.bashrc` に書いている。`.bash_profile` へ |
| Mac で GUI ターミナルと SSH で挙動が違う      | ログインシェル設定の差。ブリッジ構成で統一         |
| `.bashrc` を間違って壊した                    | **別のシェルで開き直す**、`bash --norc` で最小起動 |
| `source ~/.bashrc` しても反映しない           | 実行ではなく新しいシェルに書き足している可能性。`type -a コマンド` で確認 |
| `bash` と `zsh` を併用している                | `.profile` に共通部分、それぞれの `rc` に固有部分  |

---

## 8. 簡易版：これだけ守ればよい

- **環境変数・PATH** → `~/.bash_profile`（または `~/.profile`）
- **エイリアス・プロンプト** → `~/.bashrc`
- **`.bash_profile` から `.bashrc` を呼び出す** 1 行を入れておく
- **両方壊れないように Git 管理** する（→ `../../Dotfiles/`）

---

## 9. まとめ

- ログイン時のファイルと対話シェルのファイルは **別物**
- 2 つに正しく振り分け、**ブリッジで統一する** のが現実解
- 「どこに書いたか」ではなく **「何のために書いたか」** で置き場を決める
- `echo $0` / `shopt login_shell` でデバッグ

ここを一度整理しておくと、以降 **「設定したのに効かない」系のトラブル** に悩まされなくなる。

---

## 関連ドキュメント
- `PATHとprofile入門.md` — 初心者向け。PATH と `.profile` の全体像
- `bash基礎.md` — 起動モードの詳細
- `環境変数とexport.md`
- `シェルスクリプト入門.md`
- `Git Bash初心者ガイド.md`
- `../../Dotfiles/` — 複数マシンで同じ設定を再現
