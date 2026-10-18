# WSL でのファイル性能 — Windows 側ファイルを WSL から触ると遅い話

## はじめに

WSL2 を使い始めた初心者が必ずハマる罠が、**「Windows 側のファイルを WSL から操作すると極端に遅い」** ことです。

`/mnt/c/` 配下にプロジェクトを置いて `npm install` したら **10分以上** かかる、といった症状。正しい場所にファイルを置けば **10秒** で終わるのに。

---

## なぜ遅いのか

### WSL2 の仕組み

WSL2 は **軽量な Linux VM** として動いています。Windows のファイルシステムにアクセスするには:

```
[Linux VM] ─ 9P プロトコル ─ [Windows の NTFS]
```

の経路を通ります。9P はネットワーク越しのファイル共有プロトコルの一種で、**大量の小さなファイル操作には向いていません**。

特に以下の操作が遅い:

- 大量のファイル作成・削除
- 1ファイルあたりの小さな read/write を繰り返す
- `stat`（ファイルの属性取得）
- 再帰的な走査（`find`、`grep -r` 等）

### WSL1 では逆

WSL1 は「翻訳レイヤー」のため、Windows 側ファイルへのアクセスは **ネイティブ近く速い**。代わりに WSL1 の Linux 側ファイル操作が遅かった。

WSL2 は **アーキテクチャが変わった代わりに、クロスOSアクセスのペナルティが生じた** わけです。

---

## 実測の目安

同じ `npm install`（依存50個前後）を測ると:

| 配置場所 | 所要時間 | 備考 |
|---------|---------|------|
| `~/projects/` (WSL 側 ext4) | 5〜15秒 | ネイティブ速度 |
| `/mnt/c/Users/.../projects/` | 3〜10分 | 数十倍遅い |

プロジェクトが大きくなるほど差は広がります。`node_modules` が5万ファイル超えると、クロスOS経由では実用不能レベルに。

---

## 鉄則: 「ビルドするファイルは WSL 側に置く」

以下のような **大量の小ファイル＋頻繁な I/O** を伴う操作は、必ず WSL 内に置きます。

- `node_modules`（npm / yarn / pnpm）
- `venv` / `.venv`（Python）
- `vendor/`（PHP Composer、Ruby Bundler）
- `target/`（Rust、Java Maven/Gradle）
- `.git/`（大規模リポジトリ）
- Docker のビルドコンテキスト

### 推奨ディレクトリ構造

```
WSL 側 (ext4, 高速)
  ~/projects/
    ├── webapp/
    ├── backend/
    └── scripts/

Windows 側 (NTFS, 自然な場所)
  C:\Users\xxx\Documents\
    └── 配布物・ドキュメント類
```

---

## Windows 側ファイルも使いたいケース

「ソースは Windows 側の Dropbox/OneDrive で同期させたい」という要望もあるかもしれません。この場合の選択肢:

### A. 開発用プロジェクトのみ WSL 側に移す

素直な方法。同期したいなら Git で管理（これが本命）。

### B. VSCode Remote-WSL を使う

Windows 側のエディタで、ファイル本体は WSL 側に置いたまま編集。見た目は Windows アプリ、実体は Linux。

### C. Dev Drive（Windows 11 22H2 以降）

Windows 11 の新機能で、開発向けに **ReFS ベースの高速ドライブ** を作れる。NTFS よりファイル性能が向上するが、WSL2 からのクロスOS遅さを根本解決するものではない。

### D. 同期先フォルダをシンボリックリンクで繋ぐ

```bash
# Windows 側のフォルダから WSL 側プロジェクトへのリンク
ln -s ~/projects/myapp /mnt/c/Users/xxx/Projects/myapp-link
```

ただしシンボリックリンクを越えた操作は遅いまま。

---

## その他の高速化Tips

### 1. Windows Defender の除外設定

Windows Defender が WSL 内ファイルをスキャンすると遅くなります。

**除外対象に追加**:

- プロセス: `C:\Windows\System32\wsl.exe`, `vmmem.exe`
- フォルダ: `\\wsl$\Ubuntu\home`、あるいは `%USERPROFILE%\AppData\Local\Packages\CanonicalGroupLimited.*\LocalState\`

設定: Windows セキュリティ → ウイルスと脅威の防止 → 設定 → 除外

**注意**: 除外はセキュリティ的なトレードオフ。信頼できるフォルダだけに。

### 2. `.wslconfig` でリソース設定

Windows 側の `%USERPROFILE%\.wslconfig`（`C:\Users\xxx\.wslconfig`）:

```ini
[wsl2]
memory=8GB           # メモリ上限
processors=4         # 仮想CPU数
swap=4GB
localhostForwarding=true
```

メモリ不足でスワップしているなら、メモリを増やすと改善する場合あり。

### 3. Docker は WSL2 バックエンドで

Docker Desktop の WSL2 統合を有効にすると、ビルドキャッシュも WSL2 の高速ディスク上に置かれ、性能が向上します。

### 4. `git` は WSL 内のリポジトリで

`/mnt/c/` 上で git 操作すると激遅 + 改行コード問題。WSL 側にクローンしましょう。

### 5. 必要なら WSL1 を併用

どうしても Windows 側ファイルに WSL 経由でアクセスしたい（Windows 側の共有フォルダを主とする）場合、そのディストロだけ WSL1 にする選択肢もあります。

```powershell
wsl --set-version Ubuntu 1
```

現代ではほぼ非推奨（Docker が使えない等）。

---

## ベンチマークしてみる

簡単な測定:

```bash
# WSL 内で
time (mkdir -p /tmp/testdir && cd /tmp/testdir && for i in {1..10000}; do echo $i > file_$i; done)
# → 1秒前後

time (mkdir -p /mnt/c/Users/xxx/testdir && cd /mnt/c/Users/xxx/testdir && for i in {1..10000}; do echo $i > file_$i; done)
# → 数分
```

**10倍〜100倍** の差が出るのが普通。

---

## トラブルシューティング

### 「`npm install` が全然終わらない」

→ プロジェクトを `/mnt/c/` から `~/projects/` に移動。

### 「VSCode 起動は速いが、拡張が動くと重い」

→ VSCode を Remote-WSL 経由で起動。拡張も「WSL 側に入れる」と明示する。

### 「メモリを大量に食う（vmmem が数 GB）」

→ `.wslconfig` で `memory=` を設定。

### 「Windows 再起動後、最初のビルドが遅い」

→ Windows Defender の初回スキャンが走っている可能性。除外設定を確認。

---

## まとめ

- WSL2 は **Linux 側ファイル（ext4）は速い、Windows 側ファイル（/mnt/c/）は遅い**
- ビルド・依存関係・.git 等は **必ず WSL 側に配置**
- Windows との橋渡しは VSCode Remote-WSL、`explorer.exe .`、`wslpath` で
- Windows Defender 除外、`.wslconfig` のメモリ割当で更に改善
- 「遅い」と感じたら、まず **ファイル配置** を疑う
