# WSL と Windows 間のファイル共有 — `/mnt/c/` と `\\wsl$` の使い分け

## はじめに

WSL の強みは、**Windows と Linux の両方からファイルを触れる** ことです。しかし、ファイル共有には2つの方向があり、それぞれパフォーマンス・文字コード・権限で特徴が違います。

| 方向 | パス | 用途 |
|------|------|------|
| WSL から Windows のファイルを見る | `/mnt/c/` | Windows 側にあるファイルを参照 |
| Windows から WSL のファイルを見る | `\\wsl$\Ubuntu\` または `\\wsl.localhost\Ubuntu\` | WSL 内のファイルを参照 |

---

## WSL → Windows: `/mnt/c/`

### 仕組み

WSL2 は起動時に、Windows のドライブを **9P プロトコル** を使ってマウントします。

```
C:\  →  /mnt/c/
D:\  →  /mnt/d/
```

### 使い方

```bash
# Windows 側の Downloads を覗く
ls /mnt/c/Users/yourname/Downloads/

# Windows 側にファイルをコピー
cp ~/project.zip /mnt/c/Users/yourname/Desktop/
```

### 特徴

- **どの Windows パスも自由にアクセス可能**（権限がある限り）
- ただし **非常に遅い**（詳細は `WSLでのファイル性能.md`）
- 実行ビット（+x）が自動で付く等、Linux の権限モデルと相性が悪い

---

## Windows → WSL: `\\wsl$\`

### 仕組み

WSL2 内のファイルシステムを、SMB 的なネットワークパスとして公開。

### 使い方

エクスプローラーのアドレスバーに入力:

```
\\wsl$\Ubuntu\home\kai\
```

または新しい書き方（Windows 11 推奨）:

```
\\wsl.localhost\Ubuntu\home\kai\
```

### 特徴

- **ネットワーク越しのように扱われる**（実際はローカル）
- エクスプローラーで見る、VSCode（Win側）から編集する等には便利
- ただし **Windows 側からの重い読み書きは遅い**
- Linux 側で生成した大量ファイルの処理はこの経由ではなく WSL 内で完結させる

---

## 鉄則: 「自分のOS側で作業」

両方から触れるからといって、**混ぜると事故を招きます**。基本は:

> **Linux 前提のプロジェクトは WSL 内（`~/`）に置き、Linux で作業する**
> **Windows 前提のプロジェクトは Windows 側（`C:\`）に置き、Windows で作業する**

### なぜ

- **性能**: クロスOS アクセスは激遅（WSL2 は特に）
- **権限**: Linux の chmod が Windows 側では意味を持たない
- **改行コード**: Git の autocrlf 等との相性問題
- **ファイル名**: 大文字小文字、日本語、禁止文字の違い
- **シンボリックリンク**: 互換性に癖あり

### 配置の目安

| プロジェクトの性質 | 置き場所 |
|-------------------|---------|
| Node.js / Python / Docker で開発 | `~/projects/` (WSL 側) |
| Visual Studio の .NET 開発 | `C:\Users\...\source\repos\` (Windows 側) |
| Office のマクロ・PowerShell スクリプト | `C:\` 側 |
| 学習用スクリプト（単発） | どちらでも OK |

---

## 具体例で見るパフォーマンス差

```bash
# ① WSL 内 → WSL 内（速い）
cd ~/projects/myapp
npm install
# → 数十秒

# ② /mnt/c/ の Windows 側 → WSL で npm install（激遅）
cd /mnt/c/Users/xxx/projects/myapp
npm install
# → 数分〜数十分、I/O 待ちで CPU も上がる
```

`node_modules` のような **小さいファイルが数万個** になるプロジェクトで、差が最も顕著です。

---

## 相互アクセスの小技

### WSL から Windows のエクスプローラーを開く

```bash
# カレントディレクトリをエクスプローラーで開く
explorer.exe .

# WSL 内のパスを Windows で開く
explorer.exe $(wslpath -w ~/project)
```

### Windows から WSL でコマンド実行

```powershell
# ディストロ指定
wsl -d Ubuntu ls /home

# カレントディレクトリを WSL 側に渡して実行
wsl ls
```

### パス変換

```bash
# WSL から見た Windows パス → Windows 形式
wslpath -w /mnt/c/Users/kai
# → C:\Users\kai

# Windows 形式 → WSL 形式
wslpath -u 'C:\Users\kai'
# → /mnt/c/Users/kai
```

---

## WSL 側ファイルを Windows から直接編集するときの注意

### エクスプローラーで `\\wsl$` 配下を編集

- 可能だが、**Windows 側のアプリが作る一時ファイル**（`~$file.docx` 等）が残ることがある
- エクスプローラーから Windows アプリのドラッグ＆ドロップは OK
- 重いビルド・大量ファイル操作は、必ず WSL 内のターミナルで

### VSCode から編集

- **Remote - WSL 拡張** を使って「WSL 内に接続」する形が最もスムーズ
- Windows 側 VSCode から `\\wsl$` 経由で直接開くのは非推奨（Remote-WSL 経由の方が速い・安定）

---

## `/mnt/c/` のマウント設定

### `/etc/wsl.conf` でカスタマイズ

```ini
[automount]
enabled = true
root = /mnt/
options = "metadata,umask=22,fmask=11"
```

- `metadata`: chmod 等の Linux メタデータを扱えるようにする
- `umask`, `fmask`: デフォルト権限

変更後は `wsl --shutdown` で再起動。

### マウント先を変える

`root = /windows/` にすれば `/windows/c/` としてマウントされる（好みで）。

---

## よくあるつまずき

### 1. Windows パスを `cd` できない（そもそも 9P 経由）

```bash
cd C:\Users\kai  # エラー
cd /mnt/c/Users/kai  # OK
```

Linux は `\` をエスケープ文字として解釈する。使うのは **必ず `/mnt/c/` 形式**。

### 2. `chmod` が効かない / 毎回 777

`/mnt/c/` 上のファイルは、デフォルトで Windows の ACL に基づいて表示される。Linux 的な chmod を効かせるには `metadata` オプションが必要（上記）。

### 3. シンボリックリンクが作れない

Windows 側の NTFS ではシンボリックリンクに特別な権限が必要。WSL 内（`~/`）で作るのが無難。

### 4. Git の改行コード・大文字小文字

WSL 内 と Windows 側 で **別々の Git リポジトリ** を持つと、改行コード・大文字小文字の扱いで差異が出やすい。**リポジトリの場所を片方に統一** すること。

### 5. 「保存したのに見つからない」

```
\\wsl$\Ubuntu\home\kai\...   （正）
\\wsl$\Ubuntu\~\...           （誤、~ は展開されない）
```

ホームディレクトリは `/home/kai/` の形で書く。

---

## まとめ

- WSL ↔ Windows の相互アクセスは **可能だが、クロスOSは遅い**
- **Linux 前提のプロジェクトは WSL 側**、**Windows 前提は Windows 側** が原則
- `explorer.exe .`、`wslpath`、VSCode Remote-WSL で橋渡し
- Windows パスは必ず `/mnt/c/` 形式で指定
- 性能問題は別途 `WSLでのファイル性能.md` で詳しく
