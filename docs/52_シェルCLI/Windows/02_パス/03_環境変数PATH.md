# 環境変数 PATH — ユーザー/システム変数、優先順位

## はじめに

**環境変数 PATH** は、「コマンドを入力したとき、OS がどのフォルダを探すか」を決めるリストです。

```powershell
python --version
```

と入力したら、PATH に登録されたフォルダを **順番に** 探して、最初に見つかった `python.exe` を実行します。

この仕組みを理解すると:

- 「コマンドが見つからない」エラーの原因が分かる
- 「違うバージョンが呼ばれる」事故を防げる
- 自作スクリプトをどこからでも呼べるようにできる

---

## 基本の仕組み

### コマンド解決の流れ

1. ユーザーが `python --version` と入力
2. シェルが `python` の場所を探す:
   - まずビルトインコマンドか確認
   - 次に **PATH に登録されたフォルダ** を先頭から順に探す
   - 最初に見つかった実行ファイルを起動
3. 見つからなければ「'python' は認識されていません」エラー

### 確認コマンド

**PowerShell**:
```powershell
# PATH の中身を見る
$env:PATH -split ';'

# コマンドの実際の場所を確認
Get-Command python
(Get-Command python).Source
```

**cmd**:
```cmd
echo %PATH%
where python
```

**bash (WSL / Git Bash)**:
```bash
echo $PATH
which python
type -a python  # 複数あれば全部表示
```

---

## Windows の PATH には2種類ある

### ユーザー環境変数（User）

- **ログインユーザー専用**
- `HKEY_CURRENT_USER\Environment` に保存
- ユーザー権限で設定可能

### システム環境変数（System）

- **全ユーザー共通**
- `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment` に保存
- 変更には **管理者権限** が必要

### 結合されて使われる

実行時、Windows は:

```
[システム PATH] + [ユーザー PATH]
```

を結合した文字列を PATH として扱います。だから、ユーザー変数を変えても、システム側の内容が先頭に残ります。

### どっちに書くか

| 用途 | 書く場所 |
|------|---------|
| 自分だけが使うツール（Node.js の nvm、Python の venv等） | **ユーザー** |
| 全ユーザー共通のツール（Git、VSCode、Node.js のグローバル） | **システム** |
| プロジェクト固有 | **PATH に入れずに** `./node_modules/.bin` 等で対応 |

個人PCなら **ユーザー側だけ** で事足りる。会社PCやサーバーなら用途に応じて。

---

## GUI で編集

### システムプロパティから

1. Windowsキー → 「環境変数」と入力 → 「システム環境変数の編集」
2. 「環境変数」ボタン
3. 上段（ユーザー）または下段（システム）の `Path` を選択 → 編集
4. エントリごとに追加・削除・並び替え（上が優先）

### 注意点

- PATH エントリは **セミコロン区切り**（`C:\a\bin;C:\b\bin`）
- **末尾に `\` を付けても動くが、不要**
- **存在しないパスを書いてもエラーにならない**（静かに無視）

---

## コマンドラインでの変更

### PowerShell（永続的）

```powershell
# ユーザーの PATH に追加
[Environment]::SetEnvironmentVariable(
  "Path",
  [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\MyTool\bin",
  "User"
)

# システムの PATH に追加（管理者権限必要）
[Environment]::SetEnvironmentVariable(
  "Path",
  [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\MyTool\bin",
  "Machine"
)
```

### PowerShell（セッション限定）

```powershell
$env:PATH += ";C:\MyTool\bin"
# 現在のシェルだけで有効、ウィンドウを閉じると消える
```

### cmd（セッション限定）

```cmd
set PATH=%PATH%;C:\MyTool\bin
```

### setx（永続、旧来のコマンド）

```cmd
setx PATH "%PATH%;C:\MyTool\bin"
```

⚠ **`setx` には罠があります**:
- PATH 全体を上書きで渡すと、**1024文字で切り詰められる**
- 動作の境目で予期しない切り捨てが発生することがある

永続化には **PowerShell の `[Environment]::SetEnvironmentVariable`** が安全。

---

## 優先順位の罠

### 「違うバージョンが呼ばれる」問題

PATH に登録された順序で、**最初に見つかった** 実行ファイルが採用されます。

```
System PATH:  C:\Python39;C:\Program Files\Python311
User PATH:    %LOCALAPPDATA%\Microsoft\WindowsApps
```

この設定だと `python` は **Python 3.9** が呼ばれる（先頭にあるから）。

### どれが呼ばれているか確認

```powershell
Get-Command python
# CommandType Name    Version   Source
# ----------- ----    -------   ------
# Application python  3.9.x.x   C:\Python39\python.exe

Get-Command python -All   # 全候補を表示
```

### 意図したバージョンを呼ぶコツ

1. PATH の **優先順位を変える**（GUI で並び替え）
2. **完全パス** で呼ぶ（`C:\Python311\python.exe`）
3. **バージョンマネージャ** を使う（pyenv, nvm, asdf）
4. プロジェクトごとに `.venv`、`.nvmrc` を使う

---

## Windows 特有のエイリアス: 「実行エイリアス」

Windows 10/11 には「アプリ実行エイリアス」機能があります。

**設定 → アプリ → アプリ実行エイリアス**

- `python.exe`: Microsoft Store 版 Python へのエイリアス
- `python3.exe`: 同上
- `node.exe` / `winget.exe` 等

**罠**: ここが ON になっていると、Python 未インストールでも `python` と打つと Microsoft Store が開く。ちゃんとインストールしたのに Store が開く場合、このエイリアスを OFF にする。

場所: `%LOCALAPPDATA%\Microsoft\WindowsApps`

---

## PATHEXT — 「拡張子を省略できる仕組み」

もう一つ重要な環境変数:

```
PATHEXT = .COM;.EXE;.BAT;.CMD;.VBS;.JS;.WSF;.PY;.PS1
```

これは「コマンド名に拡張子が無かったとき、どんな拡張子で補完するか」のリスト。

```cmd
python script   ← .py があれば python script.py として実行される場合あり
```

通常は触らないが、`.py` や `.pl` をパス実行可能にしたいときに追加する。

---

## WSL 側の PATH

WSL（Linux側）の PATH は完全に別物。

```bash
echo $PATH
# /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:...:/mnt/c/Windows:...
```

WSL は **Windows 側の PATH も読み込んで自分の PATH に追加** します。だから WSL から `notepad.exe` や `code.exe` が呼べる。

### Windows 側 PATH を読み込まない方法

`/etc/wsl.conf`:

```ini
[interop]
appendWindowsPath = false
```

後 `wsl --shutdown` で反映。WSL を完全に Linux 環境として使いたい場合に。

### bashrc で PATH を足す

```bash
# ~/.bashrc
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/bin:$PATH"
```

---

## よくあるトラブルと対処

### 1. 「'xxx' は、内部コマンドまたは外部コマンドとして認識されていません」

PATH に含まれていない。インストーラが PATH を追加しなかった可能性。

対処:
- `where xxx.exe` や `Get-Command xxx` で所在を探す
- インストール先を PATH に追加
- インストーラを再実行し、「Add to PATH」オプションを確認

### 2. 「バージョンが古い」「複数インストールされて混乱」

```powershell
Get-Command python -All
```

で全候補を見て、PATH の順序を調整 or 不要なものをアンインストール。

### 3. PATH が長すぎる（Windows のサイズ制限）

システム PATH の長さ制限は **2047文字**（ユーザー側も同様）。超えると末尾が切れる。

- 不要なエントリを削除
- 「ジャンクション」でまとめる（複数の bin をシンボリックリンクで束ねる）

### 4. 設定変更が反映されない

GUI や `setx` で変えても、**既に開いているウィンドウには反映されない**。新しいシェルを開き直す必要あり。

### 5. `setx` で PATH が壊れた

`setx PATH "..."` を元の PATH 付きで実行すると、**ユーザーとシステムが結合された文字列** を書き戻してしまい、ユーザー PATH にシステム PATH が混入する事故が起きる。

**対処**: 必ず PowerShell の `[Environment]::GetEnvironmentVariable("Path", "User")` でユーザー側だけ取得してから編集。

---

## 確認・デバッグ用スニペット

```powershell
# ユーザー PATH
[Environment]::GetEnvironmentVariable("Path", "User") -split ';'

# システム PATH
[Environment]::GetEnvironmentVariable("Path", "Machine") -split ';'

# 結合された現在のプロセスの PATH
$env:PATH -split ';'

# 存在しないパスを検出
$env:PATH -split ';' | Where-Object { -not (Test-Path $_) }

# 重複を検出
$env:PATH -split ';' | Group-Object | Where-Object Count -gt 1
```

---

## まとめ

- PATH は **コマンド解決の検索パス**。先頭から順に探す
- Windows には **ユーザー** と **システム** の2階層があり、**結合して使われる**
- 永続化は GUI または PowerShell の `[Environment]::SetEnvironmentVariable` が安全（`setx` は罠あり）
- 「違うバージョンが呼ばれる」は PATH の **優先順位** を疑う
- 「実行エイリアス」「PATHEXT」「WSL の interop」等、Windows 特有の要素も知っておく
- `Get-Command -All` で候補を可視化する癖をつけると事故が減る
