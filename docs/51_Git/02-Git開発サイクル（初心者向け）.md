# Git開発サイクル（初心者向け）

チーム開発でよく使う、Git / GitHub の基本サイクルを 5 ステップで解説します。

1. Issue を作成  
2. ブランチを作成  
3. コードを書く  
4. 変更をコミット・プッシュ  
5. Pull Request を作成

---

## 全体の流れ（まずここだけ覚える）

- **Issue** で「何をやるか」を明確にする
- **ブランチ** で main から作業を分ける
- **実装** して、動作確認する
- **commit / push** で変更履歴を共有する
- **PR** でレビューを依頼し、main に取り込む

---

## 0. 事前準備（最初に一度だけ）

まずはリポジトリを取得し、最新状態にします。  
すでにクローン済みの人は `git clone` と `cd` は不要です。

```bash
git clone <リポジトリURL>
cd <リポジトリ名>
git switch main
git pull origin main
```

`main` の部分は、プロジェクトによっては `master` など別名の場合があります。

---

## 1. Issue を作成

### 何のためにやる？

- 作業内容（目的・完了条件）をチケットとして残すため
- 「なぜこの変更をしたか」を後から追えるようにするため

すでに既存 Issue がある場合は、新規作成ではなくその Issue を使って作業を開始します。

### 最低限書くとよい項目

- 背景（なぜ必要か）
- やること（箇条書き）
- 完了条件（Done の定義）

### タイトル例

- `ログイン画面のバリデーションエラー文言を改善する`

---

## 2. ブランチを作成

Issue 単位でブランチを作ると、変更の管理がしやすくなります。

```bash
git switch main
git pull origin main
git switch -c feature/123-update-login-validation
```

- `123` は Issue 番号の例
- 命名は `feature/`, `fix/`, `chore/` などを使うのが一般的

---

## 3. コードを書く

実装後は、こまめに状態を確認します。

```bash
git status
git diff
```

必要に応じてテストやビルドを実行します（プロジェクトごとにコマンドは異なります）。

```bash
# 例（Node.js プロジェクトの場合）
npm test
npm run build
```

---

## 4. 変更をコミット・プッシュ

### 4-1. 変更をステージング

```bash
git add .
```

特定ファイルだけ追加したい場合:

```bash
git add src/login.ts
```

### 4-2. コミット

```bash
git commit -m "fix: ログインバリデーション文言を改善"
```

### 4-3. リモートにプッシュ

初回 push（上流ブランチを設定）:

```bash
git push -u origin feature/123-update-login-validation
```

ブランチ名を毎回入力したくない場合は、次のように `HEAD` でも push できます。

```bash
git push -u origin HEAD
```

2回目以降:

```bash
git push
```

---

## 5. Pull Request を作成

GitHub で `feature/123-update-login-validation` から `main` に向けて PR を作成します。

### PR に書くとよい内容

- 何を変更したか
- なぜ変更したか
- 確認手順（レビュアーが検証しやすい手順）
- 関連 Issue（例: `Closes #123`）

`Closes #123` と書いておくと、PR マージ時に Issue を自動クローズできます。

レビューで修正依頼が来たら、同じブランチで修正して `git add` → `git commit` → `git push` すると、PR に差分が自動で追加されます。

---

## 実務でよく使う最小コマンドまとめ

```bash
# 最新化
git switch main
git pull origin main

# ブランチ作成
git switch -c feature/123-something

# 差分確認
git status
git diff

# コミット
git add .
git commit -m "feat: 〇〇を追加"

# プッシュ
git push -u origin feature/123-something
```

---

## 初心者がつまずきやすいポイント

- **main に直接コミットしない**  
  必ず作業ブランチを切る
- **コミットメッセージは短く具体的に**  
  「何を変えたか」が分かる文にする
- **大きすぎる PR を避ける**  
  変更を小さく分けるとレビューが通りやすい
- **push 前に `git status` を確認**  
  不要ファイルの混入を防ぐ

---

## 1サイクルのイメージ

Issue を作る → ブランチを切る → 実装する → commit/push する → PR を出す → レビュー後にマージ、で 1 サイクルです。  
このサイクルを繰り返すことで、変更履歴が分かりやすく安全な開発ができます。
