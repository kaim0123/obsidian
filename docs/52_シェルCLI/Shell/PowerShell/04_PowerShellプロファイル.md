# PowerShell プロファイル — `$PROFILE` の置き場と読み込み順

## この文書のねらい

PowerShell で毎回使うエイリアスや関数、プロンプト設定を **起動時に自動で読み込ませたい** — そのための仕組みが「プロファイル」。
bash でいう `.bashrc` / `.bash_profile` に相当する。

ただし PowerShell にはプロファイルが **合計 6 種類** あり、**5.1 と 7 で置き場が別**。
ここで混乱しやすいので、順を追って整理する。

---

## 1. プロファイルとは何か

**PowerShell 起動時に自動的に実行される `.ps1` スクリプト。**

典型的に書くもの：

- エイリアスの追加（`Set-Alias ll Get-ChildItem` など）
- 関数の定義（よく使うコマンドをまとめた関数）
- プロンプト（`prompt` 関数）のカスタマイズ
- モジュールの自動読み込み（`Import-Module posh-git` など）
- 環境変数の設定

---

## 2. `$PROFILE` 変数を確認する

```powershell
$PROFILE
```

これを打つと **現在のユーザー × 現在のホスト** 向けのプロファイルのパスが出る。

例（PowerShell 7 / Windows Terminal）：
```
C:\Users\<ユーザー名>\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
```

例（Windows PowerShell 5.1）：
```
C:\Users\<ユーザー名>\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

**ポイント**：`Documents\PowerShell` は 7 用、`Documents\WindowsPowerShell` は 5.1 用。**フォルダ名が別** なので両立できる。

---

## 3. プロファイルは 4（×ホストで 6）種類ある

`$PROFILE` はオブジェクトで、複数のパスを保持している。

```powershell
$PROFILE | Select-Object *
```

| プロパティ名                  | スコープ                     | 読み込まれる条件                       |
|-------------------------------|-------------------------------|----------------------------------------|
| `AllUsersAllHosts`            | 全ユーザー・全ホスト         | 誰でも、どのホストでも                 |
| `AllUsersCurrentHost`         | 全ユーザー・現ホスト         | 全員、ただしこのホスト（Terminal等）のみ |
| `CurrentUserAllHosts`         | 自分のみ・全ホスト           | **自分**、どのホストでも               |
| `CurrentUserCurrentHost`      | 自分のみ・現ホスト           | **自分・このホストのみ**（既定） |

> **「ホスト」とは**：PowerShell を埋め込んでいるアプリのこと。
> コンソール（`powershell.exe` / `pwsh.exe`）と VS Code 統合ターミナル、ISE などが別ホスト扱い。

### 読み込み順序

起動時は **上から順に** 4 つすべてが読み込まれる：

```
AllUsersAllHosts
  ↓
AllUsersCurrentHost
  ↓
CurrentUserAllHosts
  ↓
CurrentUserCurrentHost   ← $PROFILE が指すのはこれ
```

**あとから読まれるものが前のものを上書きできる**。

---

## 4. 初期状態ではファイルは存在しない

`$PROFILE` を評価してパスを得ても、**ファイル自体はまだない** のが普通。
最初に作るときはこうする：

```powershell
# 無ければ作る（親ディレクトリごと）
if (-not (Test-Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# お好みのエディタで開く
notepad $PROFILE
# または
code $PROFILE
```

---

## 5. よくある中身のテンプレート

```powershell
# ========= PowerShell Profile =========

# --- エイリアス ---
Set-Alias ll  Get-ChildItem
Set-Alias g   git
Set-Alias grep Select-String

# --- 関数 ---
function mkcd {
    param([string]$Path)
    New-Item -ItemType Directory -Path $Path | Out-Null
    Set-Location $Path
}

function which {
    param([string]$Name)
    Get-Command $Name | Select-Object -ExpandProperty Source
}

# --- プロンプト ---
function prompt {
    $here = Split-Path -Leaf -Path (Get-Location)
    "$here > "
}

# --- モジュール ---
# Import-Module posh-git    # Git 情報をプロンプトに出す
# Import-Module PSReadLine  # 入力補助（7には既定で入っている）

# --- 環境変数 ---
$env:EDITOR = "code --wait"
```

---

## 6. 5.1 と 7 の設定を使い分ける

どちらかだけしか使わないなら単純だが、両方を使っている場合は：

### A. 別々の中身にしたい
- 5.1 用： `Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`
- 7 用： `Documents\PowerShell\Microsoft.PowerShell_profile.ps1`
- それぞれ独立して編集

### B. 共通の内容を使い回したい
- 共通ファイルを `~/Documents/ps-common.ps1` などに 1 つだけ置く
- 両方のプロファイルから `. "$HOME\Documents\ps-common.ps1"` で読み込む（ドット・ソーシング）

```powershell
# どちらのプロファイルにも書く 1 行
. "$HOME\Documents\ps-common.ps1"
```

### C. バージョン差を吸収する
```powershell
if ($PSVersionTable.PSVersion.Major -ge 7) {
    # 7 専用の設定
}
```

---

## 7. 読み込まれるまでの流れ（起動時）

```
pwsh を起動
  │
  ├─ AllUsersAllHosts が存在すれば実行
  ├─ AllUsersCurrentHost が存在すれば実行
  ├─ CurrentUserAllHosts が存在すれば実行
  └─ CurrentUserCurrentHost が存在すれば実行
  │
プロンプト表示
```

**実行ポリシー** の影響も受ける。`Restricted` になっていると自分のプロファイルも動かないので、`RemoteSigned` などに変更する（→ `Windows/権限/実行ポリシー.md`）。

---

## 8. プロファイルをデバッグする

### 8-1. どれが読まれたか

```powershell
# 5.1 / 7 それぞれで起動して確認
$PROFILE | Format-List
Test-Path $PROFILE.CurrentUserCurrentHost
Test-Path $PROFILE.CurrentUserAllHosts
# Test-Path が True のやつが読まれているはず
```

### 8-2. プロファイルを無効化して起動する

```powershell
pwsh -NoProfile        # プロファイルを読まずに起動（トラブル時）
```

プロファイル内のスクリプトが原因で起動失敗する場合、これで最小構成に戻れる。

### 8-3. 起動が遅いときの犯人探し

```powershell
Measure-Command { . $PROFILE }
```

重いモジュール（`posh-git` / `oh-my-posh` など）が原因のことが多い。

---

## 9. よくある落とし穴

| 症状                                            | 原因                                            |
|-------------------------------------------------|-------------------------------------------------|
| プロファイルを書いたのに読み込まれない          | ファイルパスが違う（5.1 vs 7 / ホスト違い）     |
| 権限エラーで動かない                            | 実行ポリシー（`Set-ExecutionPolicy -Scope CurrentUser ...`） |
| VS Code の統合ターミナルでだけ効かない          | ホストが違う（VS Code は `Visual Studio Code Host`）。`CurrentUserAllHosts` に書くと解決 |
| 日本語コメントが文字化け                        | ファイルの保存エンコーディング。**UTF-8 (BOM あり)** が無難（特に 5.1） |
| コマンド入力中に古いエイリアスが残る            | 変更後は `. $PROFILE` で再読込、または新しいウィンドウを開く |

---

## 10. まとめ

- `$PROFILE` は **現ユーザー・現ホスト** のプロファイルパス
- 種類は 4 つ、順番に読まれる。**後勝ち**
- 5.1 と 7 は **別フォルダ**。両立できる
- 共通部分は別ファイルに切り出して **ドット・ソーシング** で読み込むと管理が楽
- 壊れたら `pwsh -NoProfile` で最小起動して原因特定

プロファイルは **自分だけのシェル環境** を育てる場所。
Dotfiles として Git 管理しておくと、新しい PC でも同じ環境を 1 分で再現できる（→ `../../Dotfiles/`）。

---

## 関連ドキュメント
- `PowerShell基礎.md`
- `WindowsPowerShellとPowerShell_7.md` — 2 系統の置き場の違い
- `エイリアス.md` — プロファイルに書くエイリアスの例
- `../../Dotfiles/` — プロファイルを資産として管理する
- `../../Windows/権限/実行ポリシー.md`
