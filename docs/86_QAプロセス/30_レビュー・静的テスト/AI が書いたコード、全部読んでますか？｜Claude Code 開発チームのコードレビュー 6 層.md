---
title: "AI が書いたコード、全部読んでますか？｜Claude Code 開発チームのコードレビュー 6 層"
source: "https://www.youtube.com/watch?v=s5qJqDcjghA"
author:
  - "[[ぎゅぎゅっとテック]]"
published: 2026-10-17
created: 2026-10-18
description: "AI が書いたコード、全部 1 行ずつ読めていますか。この動画では、Claude ブログの記事「How the Claude Code team does code review」（2026-10-15）を、1 枚の図にまとめて紹介し、自分のリポジトリに取り入れる順番まで説明します。Claude Code のコードの約 90% は Claude が書いています。変更が増えると、人が全部の行を"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=s5qJqDcjghA)

AI が書いたコード、全部 1 行ずつ読めていますか。  
この動画では、Claude ブログの記事「How the Claude Code team does code review」（2026-10-15）を、1 枚の図にまとめて紹介し、自分のリポジトリに取り入れる順番まで説明します。  
  
Claude Code のコードの約 90% は Claude が書いています。変更が増えると、人が全部の行を読むレビューは追いつきません。そこでこのチームは、問いを「人が読んだか」から「どの確認が、この問題を捕まえるか」に変えました。  
全体像は、記事の図に沿った 6 層の確認と、その下の戻す仕組みです。PR の前の検証、必須の CI、AI のレビュー、セキュリティのレビュー、危なさに応じた人の承認、マージキューとフィーチャーフラグ。そして、すり抜けたものを見つけて戻す仕組みです。  
見終わると、どこを機械に任せ、どこを人が見るかを図で説明でき、自分のリポジトリにどの順番で入れるかが分かります。  
  
▼ こんな人に  
・Claude Code などの AI でコードを書き始め、PR の数が増えてレビューが追いつかない  
・AI が書いたコードを、読まずにマージするのは怖い  
・AI のレビュー、CI、承認のルールを、チームでどう組み合わせればよいか知りたい  
  
▼ チャプター  
0:00 導入：AI が書いたコード、全部読めてる？  
0:48 第 1 部 PR の前：検証と /code-review  
2:42 第 2 部 PR ごとに：必須の CI・AI のレビュー・セキュリティ  
5:49 第 3 部 人が読む所：危なさに応じた人の承認  
8:02 第 4 部 マージの後：マージキュー・フラグ・戻す仕組み  
10:09 使ってみる：自分のリポジトリに入れる順番  
11:48 まとめ：謎の答えと、これから  
  
▼ 各部の内容  
第 1 部 PR の前  
足りないのは、人の時間と注意です。PR を出す前に、agent 自身にテスト・ビルド・lint を回させ、書いた agent とは別の agent に、新しい文脈で差分を読ませます。確かめ方と決まりを書く CLAUDE.md と、手元で回す /code-review・/security-review を紹介します。  
  
第 2 部 PR ごとに  
必須の CI は、赤ならマージできない関門です。AI のレビューは、複数の agent が並行でバグを探し、確かめる段で誤検知を落としてから書き込みます。agent どうしの終わらない往復を、どう止めたか。セキュリティのレビューと、指摘が開いている間はマージしない決まり。自分のリポジトリで使える道具（Code Review、REVIEW.md、会話の解決を必須にする設定）も整理します。  
  
第 3 部 人が読む所  
全部の PR を同じ強さで見る必要はありません。Claude Code のチームは、変更の危なさで人の承認を 0・1・2 人に分け、agent の承認は人の承認に数えません。人に残るのは、作るべきか・危ない所・設計・証拠を読むこと・責任です。分類器の無い自分のリポジトリで、段をどう作るかも説明します。  
  
第 4 部 マージの後  
マージキューで、最新の main に載せてもう一度確かめます。新しい振る舞いはフィーチャーフラグの後ろで、社員から先に使い、段階的に広げます。それでもすり抜けたら、見張って、フラグで止め、直して進むか戻す。障害を評価用の題材にして、レビューを良くする輪も紹介します。  
  
使ってみる  
明日から 1 人でできること、今週チームで決めること、数週間かけて入れること、の 3 段に並べます。AI のレビューの指摘が多すぎる、agent が承認した PR をマージしていいか、小さいチームで 2 人の承認は無理、という実務の悩みにも答えます。  
  
まとめ  
6〜9 月に、マージした PR は 2 倍以上、戻した変更の割合は 40% 以上減りました。完成した図で、この謎を振り返ります。  
  
▼ ことわり  
この動画は、Claude ブログの記事を紹介する解説です。Anthropic の公式の動画ではありません。図は記事の図をもとにした自作です。  
人数の段や分類器は、記事に書かれた Claude Code のチームの決め方です。GitHub の設定（ブランチ保護・マージキューなど）が使える条件は、プランとリポジトリの種類で違います。  
/code-review は、Claude Code 2.1.300 で、PR の無いブランチの手元の差分に回して確かめました。  
  
▼ 出典  
・Claude ブログ「How the Claude Code team does code review」（2026-10-15）https://claude.dev/blog/solving-code-review-at-anthropic/  
・Claude Code のドキュメント：Code Review、Code review（local）、Commands  
・GitHub Docs：保護されたブランチ（必須の確認・承認・会話の解決）、CODEOWNERS、merge queue、GitHub Actions の設定  
  
#コードレビュー #ClaudeCode #AI駆動開発 #AIエージェント #GitHub #CI #プルリクエスト #ソフトウェア開発 #エンジニア #SoftwareEngineering #DevOps #プログラミング  
#ぎゅぎゅテク  
#ぎゅぎゅっとテック

## 詳しい要約

**テーマ：AI が大量にコードを書く時代のコードレビューを「6 層の確認＋戻す仕組み」で回す**

Claude ブログの記事「How the Claude Code team does code review」を図解で紹介する動画。Claude Code のコードの約 90% を Claude が書き、モノレポへの変更は 1 日約 1,500 件から 30,000 件超に増えたため、人が全行を読むレビューは成り立たない。そこで問いを「人が読んだか」から「**どの確認が、どの問題を捕まえるか**」に変え、6 層の確認とその下の戻す仕組みで品質を保っている。結果、6〜9 月にマージした PR は 2 倍以上、戻した変更の割合は 40% 以上減った。

---

### 第 1 層：PR の前の検証

- 足りないのは**人の時間と注意**。レビューは最後の門番ではなく、スペルチェッカーのように書いている最中に常に回るものと捉える。
- 最も重要なのは **AI に自分の仕事を確かめる手段**（テスト・コマンド・ビルド・lint）を与えること。Boris Cherny 氏は結果が 2〜3 倍良くなると見積もる。
- 書いた agent とは**別の agent に新しい文脈で差分を読ませる**。元の会話を渡さないので書き手の思い込みが入りにくい。
- 確かめ方と決まりは **CLAUDE.md** に書き、手元で `/code-review`・`/security-review` を回す。投稿者が 2 か所を壊したコードで試すと、コミット前に両方見つかった。
- ただし手元の確認はスキップできてしまう。

### 第 2〜4 層：PR ごとに自動で回る確認

- **必須の CI**：lint・型チェック・テスト・ビルドが少しでも赤ならマージ不可。ブランチ保護で強制できる点が PR 前と違う。
- **AI のレビュー**：複数の agent が並行でバグを探し、別のグループが投票で指摘を確かめ、十分に支持されたものだけを重大度順に PR へ書き込む。スタイルだけの指摘は書かない。意味のある指摘を受けた PR は **16% → 54%**。
- **セキュリティのレビュー**は AI レビューと別に行う。どちらかの指摘が 1 つでも開いている間はマージできず、直すか理由を付けて閉じる。
- **agent どうしの終わらない往復**への対策：一晩で 50 回以上往復した PR があり、繰り返し指摘されたコードの約 59% は最初からあったもの。そこで同じ種類のバグはまとめて直させ、3 往復したらやり方の見直しを促し、2 回目以降は新しい差分だけを読み同じ指摘を繰り返さない。一発で通る PR は 65% → 78%、5 往復以上は 8.9% → 1.5%。
- 自分のリポジトリでは、PR 上で動く **Code Review**（承認・ブロックはしない）、マージを止める「**会話の解決を必須にする設定**」、優先して見てほしいこと・指摘しなくてよいことをコードオーナーが書く **REVIEW.md** を使う。
- 指摘への反応を「直した・却下・意図通り・無視」の 4 種で数え、却下や無視が多い種類は REVIEW.md で負担を下げる。

### 第 5 層：危なさに応じた人の承認

| 段 | 例 | 必要な人の承認 |
|---|---|---|
| 低 | ドキュメント修正、フラグの後ろに隠れた機能 | 0 人（自動確認が通れば） |
| 中 | 通常のプロダクト変更 | 1 人 |
| 高 | 最も重要なコード | 2 人 |

- 段は**書いた人ではなく変更の中身**で決め、分類器が振り分ける。低の段を通れるのは信頼された作者の変更だけ。**agent の承認は人の承認に数えない**。
- agent が書いた PR はプロンプトした人がレビュアーに入り、新しいコミットが入れば再承認が必要。
- 人に残るのは、**作るべきか・危ない所・設計・テストなどの証拠を読むこと・責任**。見慣れないコードは Claude に説明を書かせると差分を読むより速い。
- 分類器のないリポジトリでは、まず全 PR に 1 人の承認を必須にし、危ない所は **CODEOWNERS** でオーナー承認を必須に、最後の push 後は push した人以外の承認を求める。0 人承認は証拠がたまってから低の段だけに入れる最後の一歩。

### 第 6 層と戻す仕組み：マージの後

- **マージキュー**：個別には通っても 2 つの PR を合わせると壊れることがある。最新の main に積んで必須の確認を回し直し、通ったものだけ順にマージする。
- **フィーチャーフラグ**：新機能はフラグの後ろで出し、社員 → カナリア → 安定版と段階的に広げる。
- **戻す仕組み**：作者とオンコールが見張り、おかしければフラグで止め、直して進むか壊れたビルドを戻す。マージした人が責任を持つので、変更は小さく戻しやすく保つ。
- 振り返りでは人ではなく仕組みを見る。障害を起こした過去の PR を評価用の題材として集め、レビュー設定を変えるたびに再採点する輪を毎日回す。
- 自分のリポジトリでは、戻した PR にラベルを付けて保存し、修正後にそのコミットへ `/code-review` を回して前回見逃した問題が指摘されるか確かめる。すり抜けの調査では、戻した PR を各層でたどる（確認が回ったか、会話がどう解決されたか、誰がどのコミットを承認したか、PR テンプレートでどう試したか）。

### 自分のリポジトリに入れる順番

1. **明日から 1 人で**：CLAUDE.md に確かめ方と決まりを書き、PR の前に `/code-review` と `/security-review` を回す。
2. **今週チームで決める**：CI を必須にする、PR テンプレートに「どう試したか・どう戻すか」を必須にする、全 PR に 1 人＋危ない所はオーナーの承認、全コメント解決までマージ不可。
3. **数週間かけて**：1 つのリポジトリに AI レビューを入れて REVIEW.md を調整してから広げる。マージキューとフラグを使い、戻した PR をためる。0 人承認は最後。

- agent が書いて agent が承認した PR をマージしてよいか → だめ。人の承認を必須にする。小さいチームで 2 人承認が無理なら、全 PR に 1 人から始め、危ない所はオーナー承認を必須にする。

### まとめ

- 各層は一部の問題を捕まえ一部を通すが、ほとんどはマージ前のどこかで止まり、全層をすり抜けた少数は**戻す仕組み**で拾う。
- 人は全行を読む役から、**危ない所の判断と責任**を持つ役へ移る。
- 段は変更の中身で決め、agent の承認は人の承認の代わりにしない。
- 現状のコードレビューは指摘のみで承認はしない。自動で確かめた変更の自動マージをどこまで広げるかはチームが決める。

## Transcript

### 導入：AI が書いたコード、全部読めてる？

**0:00** · Are you reading every single line of code AI writes? You don't have to read it all. Here is a system that works anyway. The Claude Code team uses this mechanism to manage their reviews. A single change is verified through six layers. Anything that slips through is caught by the fallback mechanism below.

**0:23** · You are still in charge and responsible , but you don't read every line. In this team, the number of merged PRs has more than doubled. Yet, the rate of reverted changes has dropped by over 40 %. What changed? Let's fill in these six layers and the fallback mechanism starting from an empty diagram. Who verifies it before submitting a PR? In this team, Claude writes about 90%of the Claude Code codebase.

### 第 1 部 PR の前：検証と /code-review

**0:55** · Changes to the Anthropic monorepo have grown from about 1,500 to over 30,000 per day. It is impossible for humans to read all of this line by line. What we lack is human time and attention. So, we changed the question. It's not about whether a human read it. It's about which check catches which problem.

**1:23** · Review is no longer the final gatekeeper. It runs constantly while you write, like a spellchecker that highlights errors as you type. This team says the most important thing is giving the AI the means to verify its own work. That includes tests, commands , builds, and linting. Boris Chernyshev , who built Claude Code, estimates the results are 2 to 3 times better. You have a different agent read the diffs than the one that wrote them.

**1:51** · Since you don't pass along the original conversation, it's harder to inject the author's assumptions. As an experiment, I ran/code-review on code where I intentionally broke two spots. It found both issues before I even submitted the PR or committed the changes.

**2:11** · Verification methods and rules are written in the .claudem file. The AI's review points out any code that violates these rules. For security, we use/security-review locally. So far, we have covered the first layer: verification. Before submitting a PR, we have the original agent and a different agent verify the code.

**2:33** · However, since this is local, you can also choose to skip it. What do we check after a PR is opened? And how do we check each PR? First, the essential CI. If lint, type checks, tests, or builds are even slightly red, you can't merge. Unlike checks before the PR, this can be made mandatory with branch protection. Next is AI review. You probably think AI reviews just make pointless suggestions, right?

### 第 2 部 PR ごとに：必須の CI・AI のレビュー・セキュリティ

**3:05** · Our team has a system in place to prevent that.

**3:12** · Multiple agents search for bugs simultaneously. A separate group verifies each suggestion through voting . Only suggestions confirmed by enough agents as valid are ranked by severity and posted to the PR. We don't post suggestions just about coding style.

**3:30** · With AI review, the percentage of PRs receiving meaningful feedback increased from 16%to 54%. Security reviews are conducted separately from AI reviews.

**3:43** · In this team, you cannot merge as long as even one suggestion remains from either review. You must fix them or close them with a reason. However, when AI writes code and AI reviews it, the back-and-forth can sometimes never end.

**3:59** · One PR went back and forth over 50 times in a single night. Upon investigation, about 59%of the repeatedly flagged code had been there from the start. So, we make the authors fix the same type of bugs all at once.

**4:16** · After three rounds, we prompt them to rethink their approach entirely. From the second round, the review only reads the new diffs and does not repeat the same comments. PRs that pass on the first try increased from 65%to 78%. PRs requiring five or more rounds decreased from 8.9%to 1.5%. For your repository, you could use a product like CodeReview , for example.

**4:42** · Separate from your local slash code review, it runs on the PR, finds bugs and security holes, and comments line by line. However, it doesn't approve or block merges on its own. What blocks the merge is the setting that prevents merging until all comments are resolved. We write what we want the review to prioritize in a review.md file. The code owner writes what must be checked and what should not be flagged.

**5:11** · This team counts reactions to suggestions by categorizing them into four types.

**5:19** · Fixed, rejected, followed as intended, and ignored—these are the four. For your repository, verify the architecture of types that are often rejected or ignored, then lower the burden with ReviewMD. We have now covered the second through fourth layers: mandatory CI, AI reviews, and security. Each of these runs automatically for every PR. What should humans read? What should they focus on?

### 第 3 部 人が読む所：危なさに応じた人の承認

**5:51** · In this team, some PRs are merged with zero human approvals. Is it necessary to review all PRs with the same intensity? This team categorizes changes into three levels of risk. The low level includes documentation fixes and features still hidden behind feature flags. If automated checks pass , zero human approvals are required.

**6:16** · Regular product changes fall into the medium level, requiring one person. The most critical code is in the high level , requiring two people. At every level, there are parts that humans must always review. There are two keys. First, the level is determined by the content of the change, not by who wrote it. A classifier handles this sorting. Second , only changes from trusted authors can pass at the low level. Agent approvals do not count as human approvals.

**6:44** · For PRs written by an agent, the person who prompted it is added as a reviewer. If a new commit is added, re-approval is required. What remains for humans is determining if it should be built, assessing risky areas, checking evidence like design tests, and taking responsibility. Instead of reading everything, humans shift to roles of judgment and accountability.

**7:09** · When understanding unfamiliar code, this team also has Claude write explanations . This is faster than reading through the diff line by line. For repositories without a classifier, first make one human approval mandatory for all PRs.

**7:28** · For risky areas, use CODEOWNERS to mandate approval from the owner. Set it up so that after the last push, someone other than the person who pushed must approve. Moving to zero approvals should be the final step. Only do this for the low level after enough evidence has accumulated. We have now covered the fifth layer: human approval. Risk is determined by the content of the change, and humans read the risky parts to make a judgment. What if changes that passed all checks break in production?

**7:59** · Changes that pass individually can sometimes break when two PRs are combined. A merge queue runs required checks again by stacking queued changes on the latest main. Only those that pass are merged in order.

### 第 4 部 マージの後：マージキュー・フラグ・戻す仕組み

**8:23** · Even after merging, we don't deliver to everyone immediately. New features are released hidden behind feature flags.

**8:30** · We roll them out first to employees, then canary tests, and finally to stable. And beneath that, there is a mechanism for rollback. The author and on-call engineer monitor it, and if anything looks wrong, they stop it immediately via the flag. After that, the choice is to either fix it and move forward or roll back the broken build.

**8:51** · The rule in this team is that the person who merges takes responsibility.

**8:56** · That is why we keep changes small and easy to roll back. In retrospectives, we look at the system, not blame people . Past PRs that caused incidents are used as material for evaluation. People familiar with the code verify and collect them. Every time we change review settings, we re-score everything using the collected material. We run this cycle every day. In your repository, you can label and save reverted PRs.

**9:23** · Once you fix the code, you can specify the commits from the reverted PR and run/codereview again.

**9:32** · You then check if the issues that were missed before are flagged this time.

**9:37** · When investigating why something slipped through, trace the reverted PR through each layer. In the checks, look at whether code reviews ran and required checks passed. In the conversation, see how issues were resolved; in the reviews, see who approved which commits. Since local verification leaves no trace, read the PR template to see how it was tested.

**10:01** · So far, we've covered the sixth layer, the merge queue, flags, and the rollback mechanism beneath them. How do you use this in your own repository?

### 使ってみる：自分のリポジトリに入れる順番

**10:11** · But first, let's return to the opening question. What changed, given that the number of merged PRs has more than doubled? Every layer catches some issues and lets others slip through.

**10:23** · Most are stopped at some layer before merging. The few that slip through all layers are handled by the rollback mechanism. This is something you can start doing alone as early as tomorrow.

**10:34** · Write the verification steps and rules in Claude.md. Run/code-review and/ security-review before opening a PR.

**10:43** · This is what the team needs to decide this week. Make the CI checks mandatory . Require how it was tested and how to revert in the PR template. Require one approver for every PR, plus the owner for sensitive areas. And set it to prevent merging until all comments are resolved. Spend a few weeks introducing AI reviews to one repository. Adjust review.md, then roll it out to others.

**11:13** · Use a merge queue and flags to accumulate reverted PRs. Reaching zero-approver status is the final step.

**11:21** · Should you merge a PR written and approved by an agent? No. Require human approval and don't let agent approval replace it. If two approvers are impossible for small teams, decide the process as a team. Start with one approver for every PR. Make owner approval mandatory for sensitive areas.

### まとめ：謎の答えと、これから

**11:48** · Let's look at the big picture one more time. Have the agent verify everything before the PR. CI, AI reviews, and security run automatically, then humans approve sensitive parts. Use a merge queue and roll it out gradually with flags. If something slips through, revert it and improve the review process. PRs merged from June to September more than doubled, while revert rates dropped over 40%.

**12:15** · Current code reviews only suggest changes; they don't provide approval. Teams decide how far to expand auto-merging for changes verified automatically. In your repository, which checks are catching which issues? Please subscribe and like the video. See you next time.