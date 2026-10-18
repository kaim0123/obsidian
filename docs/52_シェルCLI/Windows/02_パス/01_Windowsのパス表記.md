# Windows のパス表記 — `C:\` / `/c/` / `/mnt/c/` の3系統

## はじめに

Windows で開発していると、**同じ場所を指す3種類のパス表記** に出会います。

| 表記 | どこで使う | 例 |
|------|-----------|-----|
| `C:\Users\kai` | Windows ネイティブ（cmd、PowerShell、エクスプローラー） | `C:\Program Files` |
| `/c/Users/kai` | Git Bash、MSYS2、Cygwin | `/c/Program Files` |
| `/mnt/c/Users/kai` | WSL（WSL1, WSL2） | `/mnt/c/Program Files` |

同じファイルでも、**どの環境から触るかで書き方が違う**。これが初心者を混乱させる最大の罠です。

---

## なぜ3種類あるのか

### Windows ネイティブ: `C:\`

Windows 標準の表記。

- **ドライブレター**（`C:`、`D:` 等）+ バックスラッシュ区切り
- 歴史的に DOS から引き継がれている（DOS は CP/M から、CP/M は VMS から）

### POSIX 風（Git Bash等）: `/c/`

Unix 系ツールを Windows に移植する際に、POSIX 風のパス表現に変換。

- ドライブレターを **先頭の `/c/`** として表現
- Unix ツールはスラッシュ区切り前提なので自然

### WSL: `/mnt/c/`

WSL 側からは Windows ドライブを **マウントしたファイルシステム** として見る。

- 「Windows のドライブをマウントしている場所が `/mnt/`」
- デフォルトが `/mnt/c/` だが、`/etc/wsl.conf` で変更可能

---

## 3表記の対応表

```
Windows ネイティブ          Git Bash / Cygwin       WSL
-----------------------------------------------------------------
C:\Users\kai                /c/Users/kai             /mnt/c/Users/kai
C:\Program Files            /c/Program Files         /mnt/c/Program Files
D:\work\myapp               /d/work/myapp            /mnt/d/work/myapp
C:\                         /c/                      /mnt/c/
```

ポイント:

- ドライブ名は **小文字**（Linux 側）
- 区切りは **スラッシュ**（Linux 側）
- スペースはそのまま（Windows 側の Program Files は Linux 側でも「Program Files」）

---

## シェル別の使い分け

### cmd.exe

```cmd
cd C:\Users\kai
dir C:\Users\kai\Downloads
```

- バックスラッシュ
- スペースを含む場合は `"C:\Program Files"` のようにダブルクォート

### PowerShell

```powershell
cd C:\Users\kai
Set-Location 'C:\Program Files'
```

- バックスラッシュまたはスラッシュ両対応（`/` も内部で受ける）
- 変数展開は `$env:USERPROFILE`

### Git Bash / MSYS2

```bash
cd /c/Users/kai
ls "/c/Program Files"
```

- `/c/` 形式
- `cd C:\...` は解釈されない（バックスラッシュはエスケープ扱い）

### WSL（Ubuntu 等）

```bash
cd /mnt/c/Users/kai
ls "/mnt/c/Program Files"
```

- `/mnt/c/` 形式
- Windows の `C:\...` はそのままでは使えない

---

## パスを相互変換する

### WSL: `wslpath`

WSL が提供する変換ユーティリティ。

```bash
# Windows → WSL
wslpath 'C:\Users\kai'
# → /mnt/c/Users/kai

wslpath -u 'C:\Users\kai'
# → /mnt/c/Users/kai

# WSL → Windows
wslpath -w /mnt/c/Users/kai
# → C:\Users\kai

# Mixed（スラッシュ区切りの Windows）
wslpath -m /mnt/c/Users/kai
# → C:/Users/kai
```

### Git Bash: `cygpath`

Cygwin 互換の変換コマンド。

```bash
# Windows → Unix
cygpath 'C:\Users\kai'
# → /c/Users/kai

# Unix → Windows
cygpath -w /c/Users/kai
# → C:\Users\kai

# Mixed（スラッシュ区切り）
cygpath -m /c/Users/kai
# → C:/Users/kai
```

### 用途

- 外部コマンドに渡す前に変換が必要
- スクリプトで環境を判別して変換を挟む

---

## ホームディレクトリの表現

| 環境 | ホーム | 例 |
|------|-------|-----|
| cmd | `%USERPROFILE%` | `C:\Users\kai` |
| PowerShell | `$HOME` または `$env:USERPROFILE` | `C:\Users\kai` |
| Git Bash | `~` | `/c/Users/kai` |
| WSL | `~` | `/home/kai`（Windows とは別！） |

### WSL のホームは Windows と別

**重要**: WSL の `~` は `/home/kai` であって、Windows の `C:\Users\kai` ではありません。別物です。

```bash
# WSL内
echo $HOME
# → /home/kai

# Windows 側のホームを見たいなら
echo $(wslpath "$(powershell.exe -Command 'echo $env:USERPROFILE' | tr -d '\r')")
# 長い…素直に /mnt/c/Users/kai/ で書くのが簡単
```

---

## UNC パス（ネットワークパス）

```
\\server\share\folder
\\wsl$\Ubuntu\home\kai
\\wsl.localhost\Ubuntu\home\kai
```

- バックスラッシュ2つで始まる
- ネットワーク共有や WSL へのアクセスに使う
- シェルによってエスケープが必要な場合あり

---

## PowerShell でのパス処理

### 便利なコマンド

```powershell
# 現在地
Get-Location  # pwd

# 絶対パス化
Resolve-Path ".\myfile.txt"

# パスの結合（区切り文字を意識しなくていい）
Join-Path C:\Users\kai "Downloads"
# → C:\Users\kai\Downloads

# パスの分解
Split-Path "C:\Users\kai\file.txt"           # → C:\Users\kai
Split-Path "C:\Users\kai\file.txt" -Leaf     # → file.txt
Split-Path "C:\Users\kai\file.txt" -Extension # → .txt
```

### PowerShell は `/` も受け入れる

```powershell
# どちらも動く
cd C:\Users\kai
cd C:/Users/kai
```

Windows API が内部で `\` に変換してくれる。スクリプト可搬性のため、**PowerShell では `/` で書くのもあり**。

---

## よくあるエラーと対処

### 1. 「ファイルが見つかりません」

```bash
# WSL で
cat C:\Users\kai\file.txt
# → bash: command not found、もしくは未定義
```

→ `/mnt/c/Users/kai/file.txt` と書く。WSL に Windows パスを渡してはいけない。

### 2. エスケープの取り違え

```bash
# bash で
cd C:\Users\kai
# → : などがエスケープされて意図通り動かない
```

→ 必ず `/` 形式に変換。

### 3. スペースを含むパス

```bash
# ダブルクォートで囲む
cd "/mnt/c/Program Files"

# または \でエスケープ（Linux流）
cd /mnt/c/Program\ Files
```

### 4. 日本語パス

```bash
# WSL で日本語ファイル名
ls "/mnt/c/Users/甲斐/Desktop/"
```

基本は動くが、ターミナルのエンコーディングによっては化ける（詳細は `文字コードと改行/` 参照）。

---

## スクリプトで OS 依存を減らすコツ

### Node.js

```javascript
const path = require('path');

// OS に応じた区切り文字で結合
const p = path.join('users', 'kai', 'file.txt');
// Windows: users\kai\file.txt
// Linux:   users/kai/file.txt

// posix に統一したい場合
path.posix.join('users', 'kai', 'file.txt');
// → users/kai/file.txt（常にスラッシュ）
```

### Python

```python
from pathlib import Path

p = Path('users') / 'kai' / 'file.txt'
str(p)  # OSに応じた区切り文字
p.as_posix()  # 常にスラッシュ
```

### シェルスクリプト

WSL + PowerShell の両方から呼ばれるなら、`wslpath` / `cygpath` で変換するラッパーを噛ます。

---

## まとめ

- Windows のパスは **`C:\` / `/c/` / `/mnt/c/`** の3系統
- **どのシェルで動いているか** で正しい表記が決まる
- **WSL のホーム** は Windows のホームと別物（`/home/kai` vs `C:\Users\kai`）
- 変換は `wslpath`（WSL）、`cygpath`（Git Bash）
- PowerShell は `\` も `/` も受ける柔軟さがある
- スクリプトでは `path.join`（言語標準ライブラリ）で OS 差を吸収
