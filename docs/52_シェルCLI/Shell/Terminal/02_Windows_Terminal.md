# Windows Terminal — 設定・プロファイル・ショートカット

## この文書のねらい

**Windows Terminal** は Microsoft が提供する **モダンなターミナル（窓）アプリ**。
Windows 11 には最初から入っており、Windows 10 でも Microsoft Store から入れられる。

「cmd も PowerShell も WSL も 1 つのアプリで、タブ分割して使う」ための **中央集権ターミナル** で、これを入れるだけで Windows のコマンドライン体験が別物になる。

この文書では、**初回セットアップから自分用にカスタマイズする** までを一気に案内する。

> **ターミナルとシェルの違い** を前提にしている（→ `ターミナルとシェルの違い.md`）。Windows Terminal は **窓**、中身は PowerShell / bash 等の **シェル**。

---

## 1. Windows Terminal とは

- Microsoft 公式のターミナルエミュレータ
- 1 ウィンドウで **複数タブ・ペイン分割**
- 各タブで **別々のシェル**（PowerShell / cmd / WSL / Git Bash / Azure Cloud Shell）を起動できる
- **JSON ベース** で細かくカスタマイズ可能
- フォント、色、透過、背景画像、キーバインド、すべて設定できる

### 旧 conhost との違い

Windows には昔から `conhost.exe` という地味な窓があった。Windows Terminal はその後継ではなく **別枠アプリ**。ただし Windows 11 から **既定の端末（Default Terminal）** を Windows Terminal に変更できる。

---

## 2. インストール

### 2-1. 入れる

次のどれか 1 つ：

- **Microsoft Store** で "Windows Terminal" を検索（推奨：自動更新される）
- **winget** で：
  ```powershell
  winget install --id Microsoft.WindowsTerminal
  ```

### 2-2. 既定の端末にする

Windows 11：
- 設定 → プライバシーとセキュリティ → 開発者向け → ターミナル
- もしくは Windows Terminal の **設定 → 既定のターミナル アプリケーション** を「Windows ターミナル」に

これで `powershell` や `cmd` 起動が **すべて Windows Terminal の窓** で開くようになる。

---

## 3. 基本操作（最初に覚えるショートカット）

| ショートカット         | 動作                                     |
|------------------------|------------------------------------------|
| `Ctrl+Shift+T`         | 新しいタブ（既定プロファイル）           |
| `Ctrl+Shift+数字`      | 特定のプロファイルで新タブ（1, 2, 3...） |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | タブ切替                         |
| `Ctrl+Shift+W`         | タブを閉じる                             |
| `Alt+Shift+D`          | **ペイン分割（自動方向）**               |
| `Alt+Shift+-`          | 水平に分割                               |
| `Alt+Shift+=`          | 垂直に分割                               |
| `Alt+矢印`             | ペイン間の移動                           |
| `Ctrl+Shift+C` / `V`   | コピー / 貼り付け                        |
| `Ctrl+F`               | 検索                                     |
| `Ctrl+Shift+F`         | 全タブ横断検索                           |
| `Ctrl+Shift+Space`     | プロファイル選択                         |
| `Ctrl+,`（カンマ）     | **設定を開く**                           |

**最強の組み合わせ**：`Ctrl+Shift+T` でタブ追加、`Alt+Shift+D` でペイン分割。これだけで複数作業が快適に並列できる。

---

## 4. プロファイルという概念

### 4-1. プロファイル = 「どのシェルを、どの見た目で起動するか」の定義

1 つのプロファイルに：
- 実行するコマンド（`pwsh.exe`, `wsl.exe` など）
- 開始ディレクトリ
- 配色・フォント・アイコン
- タブタイトル
- 背景画像・不透明度

が紐づく。

### 4-2. 既定で入っているプロファイル

- Windows PowerShell 5.1
- PowerShell 7（インストールされていれば）
- コマンド プロンプト
- Azure Cloud Shell
- 各 WSL ディストリ（インストールされていれば自動検出）
- Git Bash（Git for Windows を入れていれば自動検出）

### 4-3. プロファイルの選択

- 画面上部のタブバー右の **`∨` マーク** から選べる
- `Ctrl+Shift+Space` でも選択メニュー

---

## 5. 設定ファイル（settings.json）

Windows Terminal の設定は **すべて JSON ファイル 1 枚** に集約されている。

### 5-1. 開き方

- Windows Terminal → 設定 → `JSON ファイルを開く`
- または `Ctrl+,` → 左下の `JSON ファイルを開く`

### 5-2. 場所

```
%LocalAppData%\Packages\Microsoft.WindowsTerminal_<...>\LocalState\settings.json
```

Store 版の場合。**このファイルを Dotfiles として管理** しておくと、別 PC でも同じ設定をすぐ再現できる（→ `../../Dotfiles/`）。

### 5-3. JSON 構造

```jsonc
{
  "defaultProfile": "{...GUID...}",      // 既定で開くプロファイル
  "theme": "dark",
  "copyOnSelect": true,
  "profiles": {
    "defaults": {                          // 全プロファイル共通
      "fontFace": "Cascadia Mono",
      "fontSize": 11,
      "colorScheme": "Campbell",
      "useAcrylic": true,
      "opacity": 85
    },
    "list": [
      {
        "guid": "{...}",
        "name": "PowerShell 7",
        "commandline": "pwsh.exe",
        "startingDirectory": "%USERPROFILE%",
        "icon": "ms-appx:///ProfileIcons/..."
      },
      // ...
    ]
  },
  "schemes": [ /* カラーテーマ定義 */ ],
  "keybindings": [ /* ショートカット */ ]
}
```

- **`profiles.defaults`** に書けば全プロファイル共通
- 各プロファイルで上書きしたいものだけ `list` 側に書く

---

## 6. 見た目のカスタマイズ（最初にやる 3 つ）

### 6-1. フォントを等幅＋絵文字対応にする

```jsonc
"profiles": {
  "defaults": {
    "fontFace": "Cascadia Code",
    "fontSize": 11
  }
}
```

- **Cascadia Code**（Microsoft 純正、合字対応）か
- **Nerd Fonts** の派生（Powerlevel10k や starship の装飾用アイコン入り）
- **BIZ UDゴシック** など日本語専用混在 — `"fontFace": "Cascadia Code, BIZ UDGothic"`

### 6-2. 配色スキーム

```jsonc
"profiles": {
  "defaults": {
    "colorScheme": "One Half Dark"   // 既定で多数用意されている
  }
}
```

人気：
- One Half Dark / Light
- Solarized Dark
- Tokyo Night
- Dracula（自分で `schemes` に定義）

### 6-3. 半透明（アクリル）

```jsonc
"profiles": {
  "defaults": {
    "useAcrylic": true,
    "opacity": 85
  }
}
```

背景透過で後ろのエディタが透けるのは気分以上に便利（ログ監視と編集を並行するとき）。

---

## 7. 既定シェルを切り替える

`defaultProfile` に **プロファイルの GUID または名前** を指定：

```jsonc
"defaultProfile": "PowerShell 7"
```

- `Ctrl+Shift+T` で常に PowerShell 7 が開く
- 複数プロファイルがあっても使い分けできる

### WSL をデフォルトにしたい場合

```jsonc
"defaultProfile": "Ubuntu"
```

Windows 起動直後に `Ctrl+Shift+T` → いきなり bash で作業できる。

---

## 8. 自作プロファイル例

### 8-1. Ubuntu 特定ディレクトリから始める

```jsonc
{
  "name": "Ubuntu (dev)",
  "commandline": "wsl.exe -d Ubuntu",
  "startingDirectory": "//wsl$/Ubuntu/home/alice/dev",
  "icon": "...",
  "colorScheme": "Tokyo Night"
}
```

### 8-2. PowerShell を Admin で開くプロファイル

```jsonc
{
  "name": "PS7 (Admin)",
  "commandline": "pwsh.exe",
  "elevate": true,                     // 起動時に昇格
  "colorScheme": "Red Sands"
}
```

- 管理者プロファイルは **色やアイコンを変えて**、視覚的に区別するのが事故防止のコツ

---

## 9. キーバインドのカスタマイズ

`keybindings`（または新形式の `actions`）で、すべてのショートカットを書き換えられる。

```jsonc
"actions": [
  { "command": "paste",          "keys": "ctrl+v" },
  { "command": "copy",           "keys": "ctrl+c", "singleLine": false },
  { "command": "find",           "keys": "ctrl+f" },
  { "command": { "action": "splitPane", "split": "auto" }, "keys": "alt+shift+d" },
  { "command": "commandPalette", "keys": "ctrl+shift+p" }
]
```

**コマンドパレット**（`Ctrl+Shift+P`）を開くと、すべてのアクションを検索して実行できる。キーを忘れたらこれ。

---

## 10. よく使う設定項目

| キー                            | 意味                                           |
|---------------------------------|------------------------------------------------|
| `copyOnSelect`                  | 選択しただけでクリップボードにコピー           |
| `wordDelimiters`                | ダブルクリックの単語境界文字                   |
| `scrollbarState`                | スクロールバーの表示（`visible` / `hidden`）    |
| `antialiasingMode`              | フォント描画（`grayscale` / `cleartype`）      |
| `cursorShape`                   | カーソル形（`bar` / `vintage` / `filledBox`）  |
| `bellStyle`                     | ベル音（`none` / `visual` / `audible`）        |
| `tabWidthMode`                  | タブ幅（`equal` / `titleLength`）              |
| `historySize`                   | スクロールバック行数                           |

---

## 11. PowerToys 連携（おまけ）

- **PowerToys Run** で `wt` と打てば Windows Terminal 即起動
- **PowerToys のキーボードリマップ** で `CapsLock` を `Ctrl` にするなどすれば、さらに快適

---

## 12. つまずきやすいポイント

| 症状                                               | 原因・対処                                            |
|----------------------------------------------------|-------------------------------------------------------|
| `Ctrl+C` / `V` が貼り付けにならない               | `copy` / `paste` のキーバインドを変更したか確認      |
| 日本語が化ける                                    | `chcp 65001` をプロファイル起動時に実行／ PS 7 に移行 |
| WSL プロファイルが自動検出されない                | WSL 側を 1 度起動（`wsl -d Ubuntu` など）            |
| フォントに記号が出ない                            | Nerd Font 対応版に差し替え（`Cascadia Code PL` など） |
| 既定シェルが勝手に cmd に戻る                     | `defaultProfile` が GUID 指定。再インストール後は名前指定が安全 |
| 設定 JSON で事故                                  | 構文エラーの箇所は UI 側でエラー表示。バージョン管理が命綱 |

---

## 13. まとめ

- Windows Terminal は **窓の役目**。中身のシェルは自由に選べる
- **`Ctrl+,` で settings.json** が本丸。JSON を読めるようにしておく
- **defaults に共通設定、list に個別プロファイル**
- 最初にやるのは **フォント・配色・透過** の 3 点セット
- 設定ファイルは **Dotfiles として Git 管理** すると複数 PC で即再現

初期設定のまま使うのはもったいない。15 分の投資で **1 日の生産性が目に見えて上がる** 種類のツール。

---

## 関連ドキュメント
- `ターミナルとシェルの違い.md` — 前提知識
- `その他のターミナル.md` — 乗り換え先の選択肢
- `ターミナル設定の要点.md` — 共通のカスタマイズ論点
- `ターミナル比較ガイド - PowerShell・Git Bash・コマンドプロンプトの違いと使い分け.md`
- `../PowerShell/PowerShellプロファイル.md` — 中身（シェル）側の設定
- `../../Dotfiles/`
