# VSCode と WSL 連携 — Remote-WSL の基本

## はじめに

**Remote - WSL**（現在は **WSL** 拡張）は、VSCode の神機能です。Windows 側の見た目のまま、**ファイルや拡張機能の実行は WSL 側** で行える仕組みで、

> **「Windows で開発しているように見えて、中身は Linux で動いている」**

を実現します。

これがないと、WSL を使う意味が半減するレベルで重要です。

---

## 仕組み

```
[Windows 側]                    [WSL 側]
 VSCode UI  ←──────────────────→ VSCode Server
  (レンダリング・入力)            (ファイル I/O、拡張実行、ターミナル)
```

- **UI** は Windows 側で動く（ウィンドウ、テーマ、キー入力）
- **本体処理**（ファイル読み書き、コード解析、デバッガ、ターミナル）は WSL 側で動く
- 両者が **JSON-RPC 的な通信** で連携

つまり、Linux 前提の開発体験を、Windows 用 VSCode の画面で受け取れる、というわけです。

---

## セットアップ

### 前提

- WSL2 が動作している
- VSCode がインストールされている（Windows 側）

### 拡張のインストール

1. VSCode を Windows で開く
2. 拡張機能タブで **WSL**（Microsoft公式、旧名 Remote - WSL）を検索・インストール
3. 左下に青色の **><** マーク（リモートステータスバー）が表示される

### 初回接続

**方法A: WSL 内から**

```bash
cd ~/projects/myapp
code .
```

自動で必要なコンポーネントがダウンロードされ、Remote-WSL モードで VSCode が起動。

**方法B: Windows の VSCode から**

- コマンドパレット（`Ctrl+Shift+P`）→「WSL: Connect to WSL」
- または左下 **><** → 「Connect to WSL」

接続が成功すると、左下表示が `WSL: Ubuntu` 等に変わります。

---

## 接続状態の見方

VSCode ウィンドウ左下:

| 表示 | 意味 |
|------|------|
| `><`（アイコンのみ） | 接続なし（ローカル Windows で開いている） |
| `WSL: Ubuntu` | Ubuntu に接続中 |
| `SSH: myserver` | SSH 経由のリモート |
| `Container` | Dev Container 経由 |

**表示がすべて**。拡張機能の適用先も、この「接続先」に基づいて決まります。

---

## 拡張機能が2種類に分かれる

Remote-WSL を使い始めると、拡張機能が以下に分類されます:

### UI Extensions（Windows 側で動く）

- テーマ
- アイコンパック
- キーバインディング系
- Git History 等の UI 系

### Workspace Extensions（WSL 側で動く）

- 言語サーバー（Pylance、TypeScript Language Server 等）
- Linter / Formatter
- デバッガ
- ターミナル連動系

### インストール方法

Remote-WSL 接続後に拡張ビューを開くと、「ローカル」と「WSL: Ubuntu」のセクションに分かれて表示されます。**ワークスペース側（WSL）に必要な拡張を入れる** のがコツ。

「Install in WSL: Ubuntu」ボタンを押す、または拡張の歯車から「Install in WSL」。

---

## よく使う基本操作

### WSL のフォルダを開く

```bash
cd ~/projects/myapp && code .
```

または Windows の VSCode から:
- `File` → `Open Folder...` で `\\wsl$\Ubuntu\home\kai\projects\myapp`
- これで Remote-WSL 接続状態になります

### 統合ターミナルが bash で開く

Remote-WSL 接続中は、統合ターミナル（Ctrl+ ` ）を開くと自動的に **WSL の bash** が起動。Windows の PowerShell ではなく Linux のターミナル。

### Windows 側に戻る

- `File` → `Close Remote Connection`
- または新しいウィンドウで Windows 側を開く

---

## 活用パターン

### 1. Node.js / Python プロジェクト

WSL 内にクローン → `code .` → 必要な言語拡張を WSL 側に入れる。

```bash
git clone https://github.com/xxx/myapp.git ~/projects/myapp
cd ~/projects/myapp
code .
```

拡張機能（例: Python）を「Install in WSL: Ubuntu」。Python 本体は `sudo apt install python3` 等で WSL 側に入れる。

### 2. Docker コンテナも WSL 側から操作

`Remote - Containers`（Dev Containers）拡張と組み合わせると、Docker コンテナ内で VSCode を動かせる。WSL2 上の Docker エンジンとシームレス。

### 3. Git 操作も WSL で完結

Git の改行コード・権限問題を避けるため、Git 操作は WSL 内で。VSCode の Source Control パネルもそのまま使える。

---

## パフォーマンスの注意点

### ファイルの場所は WSL 側に

詳しくは `WSLでのファイル性能.md` 参照。**プロジェクトファイルは `~/` 配下に置く**。

`\\wsl$\` 経由で Windows 側 VSCode から開くと、Remote-WSL 接続なしでも動くが、**遅いし言語サーバーが Windows 側から動く** ので非推奨。

### 初回接続でダウンロードがある

Remote-WSL は、接続時に WSL 側にサーバーコンポーネントをダウンロード（約50MB）。初回は少し時間がかかるが、以降はキャッシュされる。

---

## トラブルシューティング

### 接続できない / タイムアウト

```bash
# WSL 側で VSCode サーバーを綺麗に再起動
rm -rf ~/.vscode-server
# Windows 側 VSCode を開き直して再接続
```

### 拡張が「ローカル側」で動いてしまう

拡張ビューで WSL: Ubuntu セクションを開き、「Install in WSL: Ubuntu」ボタンを押す。

### ファイルウォッチャーの制限エラー

```
ENOSPC: System limit for number of file watchers reached
```

WSL 内で:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### `code .` が効かない

WSL 内で `which code` して無ければ、Windows 側 VSCode から「WSL: Connect to WSL」経由で一度開くと、WSL に `code` ラッパーが入る。

---

## GitHub Codespaces / Dev Containers との関係

Remote-WSL の考え方は、他のリモート開発にも応用されています。

- **Remote - SSH**: リモートサーバーに同じ仕組みで接続
- **Dev Containers**: Docker コンテナ内で実行
- **GitHub Codespaces**: クラウド VM 上で実行

いずれも「UI は手元、実行は別環境」というアーキテクチャ。Remote-WSL を理解すれば他も応用しやすい。

---

## まとめ

- **WSL 拡張 + `code .`** が開発の基本動線
- Windows のUI + Linux の本体処理で、両方のいいとこ取り
- 拡張機能は **WSL 側（Workspace）に入れる** のが重要
- プロジェクトは **WSL 側に置いて** パフォーマンスを確保
- 左下ステータスバーで接続状態を常に把握
- Remote-SSH、Dev Containers も同じ発想で応用可能
