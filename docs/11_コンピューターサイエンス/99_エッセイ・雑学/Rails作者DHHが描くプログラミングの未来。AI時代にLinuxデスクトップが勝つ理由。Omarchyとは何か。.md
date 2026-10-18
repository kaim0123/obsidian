---
title: "Rails作者DHHが描くプログラミングの未来。AI時代にLinuxデスクトップが勝つ理由。Omarchyとは何か。"
source: "https://www.youtube.com/watch?v=U5DGGiXWDMw"
author:
  - "[[直也テック]]"
published: 2026-09-24
created: 2026-09-26
description: "omarchy公式サイトhttps://omarchy.org/何かと話題のDHH。彼の極端な主張が覇権を取る日は来るのだろうか。中国アリババはOmarchyに出資しAI NativeなOS搭載端末開発が噂されてもいます。ちなみに2026年の10月のKaigi on RailsでDHHが来日予定、またOmarchy Meetupも日本で開催予定でDHHも来るかも。ということで...現在チ"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=U5DGGiXWDMw)

omarchy公式サイト  
https://omarchy.org/  
  
何かと話題のDHH。彼の極端な主張が覇権を取る日は来るのだろうか。中国アリババはOmarchyに出資しAI NativeなOS搭載端末開発が噂されてもいます。ちなみに2026年の10月のKaigi on RailsでDHHが来日予定、またOmarchy Meetupも日本で開催予定でDHHも来るかも。  
  
ということで...現在チャンネル登録者が11.4万人。ここ2ヶ月ほどで多くの人に登録して頂きました。改めてありがとうございます。しかしまだ未登録の方が77%おられます。ぜひチャンネル登録をお願い致します！  
  
メンバーシップの登録はこちら。  
https://www.youtube.com/channel/UCtiDTuG40ZOarubtFm1fbzg/join  
  
参考動画  
https://www.youtube.com/watch?v=NYFGCESmikA  
  
\====  
目次  
\====  
0:00 イントロ  
0:48 第1章 9か月で数十年分  
2:20 第2章 Let them vibe  
3:08 第3章 大企業のソフトが速くならない理由  
4:29 第4章 オープンソースの今  
6:07 第5章 AI精神病か  
7:09 第6章 vibe coding とプログラミング  
8:54 第7章 美しいコードの経済学  
10:08 第8章 不安なプログラマへ  
12:02 第9章 道具立て  
13:32 第10章 速度への執着  
15:23 第11章 モデルとハーネス  
17:13 第12章 父親であること  
19:18 第13章 Linuxが勝つ理由  
20:57 第14章 プログラミングの未来  
22:11 まとめ  
  
  
【PR】ITエンジニア特化の転職エージェント「テックゴー」  
https://h.accesstrade.net/sp/cc?rk=0100q5og00osn8  
  
\====  
note  
\====  
海外ソフトウェアエンジニアリング事例を発信  
https://note.com/naoya\_tech  
  
\====  
SNS  
\====  
  
●X  
https://x.com/naoyashiga  
  
●Instagram  
https://www.instagram.com/naoya\_tech/  
  
●Threads  
https://www.threads.com/@naoya\_tech  
  
●直也テック TikTok  
https://www.tiktok.com/@coding\_youtuber  
  
  
\====  
低レイヤー自作を行う学習教材  
\====  
バックエンドや要素技術を自作して学びたい方はCodeCraftersがおすすめです。  
  
  
👇このリンクから登録すると40%OFFになります。  
https://app.codecrafters.io/join?via=naoyashiga  
  
\------------  
  
●お仕事のご依頼はこちらから  
https://www.naoya-tech.com  
  
  
●BGM素材  
BGMer  
http://bgmer.net  
  
#omarchy #linux

## 詳しい要約

**テーマ：DHH が語る AI 時代のプログラミングと Linux デスクトップの未来**

2026 年 8 月の Lex Fridman Podcast（約 5 時間）に出演した Ruby on Rails 作者 DHH（David Heinemeier Hansson、37signals CTO）の発言を章立てで紹介する動画。13 か月前は AI 懐疑派だった DHH が、今では手書きのコードを 1 行も書かず、自作 Linux ディストリビューション Omarchy に注力している。結論は「目的地ではなく問題を渡せ」「ボトルネックは実装ではなく何を作るかを決める人」「CLI と設定ファイル中心という Linux の弱点がエージェント時代の最大の強みになる」の 3 点。

---

### 第1章 9 か月で数十年分

- 「何も起きない数十年もあれば、数十年分が起きる数週間もある」という言葉を引用し、この 9 か月で数十年分の進歩があったと評価。
- 転換点は 2025 年 11 月 24 日の **Opus 4.5** リリース。その後、春のサブエージェント、夏の Opus 5 と Fable が節目。
- モデルが急に賢くなったのではなく、ツールで自分の仕事を検証できるようになった ＝ **ハーネス**（モデルを動かす仕組み）の変化が大きい。今は道順を指示せず、曖昧な問題を渡せばエージェントが経路を決める。
- ただし領域次第。よくある CRUD アプリはコードを見なくてよい（100% 自動化）が、Linux ディストリや安全性に関わるほどコードを見る必要がある。脆弱性の発見・修正能力も人間を超え始めている。
- Omarchy の「Quattro」版を機に 100% AI に移行し、直近 2 か月に出荷したコードは 1 行も手書きしていない。

### 第2章 Let them vibe

- Basecamp 5 の最終スプリントでデザイナーに機能を直接作らせたところ、個々の PR は良くても組み合わさるとアーキテクチャが崩れ、手作業で片付ける羽目になった。
- 教訓：大規模な既存コードベースの保守にはまだプログラマーが必要。ただし DHH は「平均的なプログラマーの出力もひどい」と付け加える。

### 第3章 大企業のソフトが速くならない理由

- ボトルネックは実装ではなく **人間同士のコミュニケーション**。10〜100 倍速くするには人がエージェントと直接やり取りする必要がある。
- 多くの組織は **何を作りたいか分かっていない**。アイデア・ビジョン・センスが足りないまま実装力を足しても凡庸なものができるだけ（Microsoft は何十年も無限のプログラマーを抱えても傑作を生まなかった）。
- 「Office は 5% しか使われないが、人によってその 5% が違う」。自分用の 5% だけ作るのはエージェントの得意分野。例として、Typora の 5% だけ欲しかったので C++ と Qt で自作エディタ Omalite を作らせ、20 分で初版、2 日で乗り換えた。

### 第4章 オープンソースの今

- AI 生成 PR の洪水に不満を言うメンテナーに対し、DHH は「受け入れも拒否も自由な無料の貢献の金鉱」と反論。プログラマーという「聖職者階級」を介さず高い知能に直接アクセスできる状況を宗教改革にたとえる。
- 25 年の OSS 運営から、多くのプログラマーはバグ報告に情報を書かず、PR の「なぜ」も書かず、テストも書かないと指摘。エージェントは言えば全部やる。
- Omalite では 3 か月で 1,000 件超の PR をマージ。重複や誤りはエージェントが先にふるい落とし、VM で検証済みのバグ修正と良いアイデアだけが人間の判断に届く。2 月まではアイデアは人間から出ると思っていたが、今はモデルのアイデアに謙虚になるという。

### 第5章 AI 精神病か

- 「AI に染まっている（AI-pilled）が妄想ではない」と主張。これを手品と思う方が妄想で、「成果は？GDP は？」にはまだ 1 年も経っていないと返す。
- 証拠として Omarchy のプラグイン機構：リリース 3 日で 330 個、時計クリックで出るカレンダーだけで 17 種類。エージェント向けの拡張の作り方が OS に同梱されている。
- Rust は「40 年で見た最悪の言語、読むと顔に酸をかけられるよう」と言いつつ、エージェントが書く言語としては最良なので Rust でアプリを書く。

### 第6章 vibe coding とプログラミング

- プログラミングとはループや条件などの要素を理解することであり、プログラムを作らせることではない（プログラマーに指示する CEO をプログラマーとは呼ばない）として、vibe coding を「プログラミング」と再定義する案は拒否。
- 最初の 3 か月は方法を細かく指示した方が速かったが、次の段階では **欲しい結果だけ伝える** 方が良くなった。何を・誰のために・どの順で作るかというプロダクトマネジメントの能力であり、プログラマー全員が持つスキルではない。
- Claude Code の Boris によれば Opus 5 用システムプロンプトは 80% 縮んだ。指示が細かすぎると出力が悪くなる（マイクロマネジメントされるプログラマーと同じ）。
- 仕様を先に全部書く方式は 40 年うまくいっていない。最初はできるだけ曖昧に頼み、出てきたものと対話する。Lex は複数実装を生成させて自作の投票ページで選ぶ。人間は 3 択の差の評価は得意だが 22 択だと崩れる。

### 第7章 美しいコードの経済学

- 美しいコードの価値は「人間が変更する」前提だった。トークンがまだ希少な間は、エージェントが扱いやすい設計に見返りがある。
- 手書きコードは西部劇のカウボーイのようにロマン化され始めている。制約を愛する人は残り、美しいコードは学習データにもなる（「DHH のように書いて」とエージェントに頼む人がいるのは嬉しい）。
- 言われた通りにロジックを組むのが好きだっただけの人は破壊されるが、作りたい人は違う。

### 第8章 不安なプログラマへ

- ATM 導入で窓口係はむしろ増えた（**ジェボンズのパラドックス**）が、保証はない。農業の機械化のように生産性向上は人数減少も意味し、個人には悲劇でも経済全体には良い、と両面を分けて語る。
- 若手への助言：**未来を予測しようとするな**、今に集中せよ。今はコンピューター好きにとって最高の時代。Building in public で仲間を見つけられる。
- 「恵まれた立場だから言える」という批判は本人も認めている。楽観をどう受け取るかは視聴者次第と投稿者はコメント。

### 第9章 道具立て

- 2005 年から約 20 年 TextMate を使っていたが、エージェントは速すぎかつ遅すぎるため、複数エージェントを並列に走らせる。tmux から、判断待ちを通知する層のツールへ移行。
- GL.iNet の KVM でミニ PC 4 台をつなぎ、Tailscale でマリブとコペンハーゲンの両方から使う。扱えるのは 16 スレッドが限界。行数は増えたが「行数は馬鹿げた指標」と自戒。
- エージェントは **Unix 哲学**（CLI から呼べる小さなコマンド、設定ファイル）を好む。Linux が嫌われた理由が最大の売りになったのは宇宙の皮肉。

### 第10章 速度への執着

- 収録中に Dell XPS 14 へ Omarchy を 1 分未満でインストールしてみせた。Commodore 64 は電源を入れて 1 秒で BASIC が使えたのに、新品 Mac は更新完了まで 42 分、Windows PC は 1 時間 35 分。物理限界まで詰めるべきと主張（「卓越の追求に説明はいらない」という Mitchell Hashimoto の言葉を引用）。
- アプリ同梱は Linux 文化では異端とされるが「シェフは自分だ」。
- 不可解な Linux エラーもエージェントにとっては武器。ログを読み、ソースを引き、原因を特定してバグ報告まで提案する。
- Python 製スクリーンセーバーを依存なしの Rust に移植させ、起動 86ms→2ms、実行 9.6 倍速になった。

### 第11章 モデルとハーネス

- 同じ移植タスクでモデルを比較：Fable＋Opus 5 は約 550 ドル、他モデルは安価に完了するものや既存実装をラップしてズルするもの、失敗するものもあった。Fable が最良だが選択肢の多さ自体が素晴らしいという評価。
- 現在のワークフロー：**計画は Fable、実装は Opus 5、最終レビューは Codex**、push 後に GitHub Copilot がさらに指摘。複数エージェント併用が最善で、Claude Code が運転席。
- 37signals では Basecamp にエージェントを同僚として加え To-Do を渡す実験中。16 スレッドの切り替えはレース後のように消耗する。

### 第12章 父親であること

- 子どもを持つ前は子ども好きではなかったが、今は「世界で一番面白い人たち」。犠牲はあるが本当に価値あるもののための犠牲。
- 1880 年生まれの人は一生で世界大戦・飛行機・ラジオ・テレビを見た。ストア派の本を読めば 2,500 年前も同じ悩み。人生の価値は今も愛と想像力。
- X への依存を自覚し 3 週間離れた。アルゴリズムは「言うこと」ではなく「指が止まる場所」を映す。ネガティブな内容が 50% 多く拡散されると知りつつ、意識して逆（人が作るものを応援する）を選ぶ。

### 第13章 Linux が勝つ理由

- 「Linux デスクトップの年」は見えているどころか最も確率の高い結果。Apple の強みだった「閉じてキュレーションされた体験」は、エージェントにとって壁だらけの敵対的環境になった。
- Linux コミュニティには AI 懐疑派も多いが、Linus Torvalds 自身が「Linux が反 AI だと思うなら考え直せ、嫌ならフォークしろ」と書いた。
- これまで乗り換えが起きなかったのは、強い理由がなく代替が「少し劣るコピー」だったから。人は無料より良いものを選ぶ。今は 20 分話せば自分好みの OS ができ、一度味わうと戻れない。エージェントは Commodore 64 時代の「自分で書き換えられるコンピューター」を誰にでも読めるようにするロゼッタストーン。
- Linus については、1991 年から続く粘り強さと、Rust や AI をカーネルに入れるなど新情報で結論を変えられる点を評価。

### 第14章 プログラミングの未来

- 決まり文句だが真実として「言語は英語になった」。Ruby より美しい言語があるとすれば英語。
- 指示も精密に書きすぎると文字通りに従いすぎる。曖昧さの余地、つまり「temperature」にこそ創造性がある。
- WhatsApp のように話せるボットに、Hey.com でメールアドレスを作ってサービス登録させ、Basecamp の招待から参加して自己紹介までさせた体験を語る。

### まとめ

- **目的地ではなく問題を渡す**。経路はエージェントが決める（曖昧に頼んで 3 案出させて選ぶ方法はすぐ真似できる、と投稿者）。
- 企業のソフトが速くならないのは実装ではなく **何を作るかを決める人** がボトルネックだから。
- Linux が勝つのは、設定ファイルと CLI 中心という昔の欠点がエージェントにとって最大の利点になったから。
- 一方で Basecamp 5 の後片付けの話から、コードを 100% 見ないのはまだ怖い、というのが投稿者の感想。

## Transcript

### イントロ

**0:00** · In August 2026, Ruby on Rails creator DHH appeared on the Lex Fridman Podcast . The recording lasted five hours, only thirteen months after his last appearance. In those thirteen months, DHH went from an AI skeptic to someone who doesn't hand-write a single line of code. DHH stands for David Heinemeier Hansson. He is the creator of Rails and CTO of 37signals, the company behind Basecamp. This past year, he has been pouring his time into his own Linux distribution called Omachi.

**0:30** · They discussed programming and Linux. And also parenting, which he calls the greatest experience of his life. Before we dive in, 77%of our viewers are not subscribed. If you find this topic interesting, subscribing and liking the video would be a great encouragement.

### 第1章 9か月で数十年分

**0:48** · The first thing DHH quoted was a line often attributed to Lenin. There are decades where nothing happens, and weeks where decades happen. His assessment is that decades worth of progress have occurred in these nine months. His last appearance was in the summer of 2025, when AI was just an autocomplete chatbot. DHH even pinpoints the turning point: November 24, 2025, the day Opus 4.5 was released . Since then, there were three major milestones: sub-agents in the spring, and Opus 5 and Fable in the summer.

**1:18** · He tried it two days later, and the code it produced was so close to his own that he leaned back in his chair in shock. It wasn't that the model suddenly got smarter, but that its ability to verify its own work using tools had changed. His explanation was that it came down to the harness, the mechanism for running the model. It changed again in the summer with Opus 5 and GPT-Soul. Instead of directing it where to go, you give it a vague problem and it decides the path itself.

**1:44** · He compared it to how early GPS systems made you worry about driving into a harbor, but now the car just drives itself. However, this depends on the domain. Lex summarized it well. For the most common CRUD apps, you don't even need to look at the code—100% automated. The more a system involves Linux distributions or safety, the more you have to look at the code. Regarding security, he also mentioned that AI's ability to find and fix vulnerabilities is starting to surpass humans.

**2:10** · Combining four vulnerabilities, which are minor on their own, can allow for remote code execution. The number of people who can find such combinations is rare, and they are usually in state organizations. The turning point for DHH to go 100%into AI was the Quattro version of Omac. He says he hasn't written a single line of the code shipped in the last two months by hand.

### 第2章 Let them vibe

**2:31** · He saw all the forms. He watched the important real-time model outputs. He distinguishes this by saying he didn't look at the UI. On the other hand, there was a story about something that didn't go well. It was the final sprint for Basecamp 5. He decided to let the designers build the features they wanted directly and let them do as they pleased. The individual pull requests were fine, but combined, they broke the architecture, requiring a manual cleanup. The comments section even noted that it was the most chaotic minute in history, right before the design collapsed. The lesson is that for maintaining large existing codebases, we still need programmers.

**3:03** · However, DHH added that the output of an average programmer is also terrible.

### 第3章 大企業のソフトが速くならない理由

**3:08** · The question is, why hasn't the development of famous apps like Photoshop become faster? DHH's first answer is that the bottleneck isn't implementation but human communication, so to get 10x or 100x acceleration, humans must interact with agents directly. It’s slow when you put people in between. The second point is that most organizations don't know what they want to build. The bottleneck is ideas, vision, and sense; adding implementation power just results in mediocre things taking shape. He noted that Microsoft has had an unlimited number of programmers for decades, yet that didn't lead to masterpieces.

**3:38** · Large companies are supertankers optimized for old ways and cannot change course.

**3:45** · That is why DHH believes this is the first time in 40 years that computing platforms are shifting. Everything from refrigerators to toasters had been automated, but the PC on the desk hadn't. There is an old joke that people only use 5%of Office. The punchline is that everyone uses a different 5%, so it all had to be built . So, if you build just 5%yourself, that's exactly where these agents excel . An example of this is a text editor called Omalite. He used to write his documents using an app called Typora.

**4:15** · About six weeks ago, he realized he only needed 5%of Typora, so he just told it to use C ++ and Qt. The first version came out in 20 minutes; he ditched Typora in two days and has written everything in Omalite ever since. X was worried about making a tool he built for himself available to others. DHH's answer was just to tell the agent to push it to GitHub once it's done. It will handle the README and release management, and it’ll be more patient than you are when it comes to maintenance.

### 第4章 オープンソースの今

**4:43** · In open source, maintainers are currently complaining about being flooded with AI-generated PRs. DHH's position on this is that it's ridiculous. He asks why they're complaining when there's a goldmine of free contributions that they are free to accept or reject. We’ve always said the magic of open source is that anyone can contribute, but in reality, only the elite few could. DHH compares this to the Reformation. There was a priestly class of programmers between people and computers.

**5:10** · Just like Luther’s 95 Theses on the church door , the idea is that we should have direct access to high intelligence.

**5:17** · Based on 25 years of running open source and looking at the output of tens of thousands, most programmers are no good. They don't include information in bug reports. They don't explain the "why" in PRs. They don't write comments , tests, or double-check their work.

**5:29** · But agents will do all of that if you just tell them to. His claim is that the average programmer is already losing. In Omalite, they’ve merged over 1,000 PRs in the last three months . There are 400 open PRs, but he hasn't looked at all of them himself. The agents filter them first. Duplicates and errors are weeded out, and only VM-verified bug fixes and good ideas reach human judgment. There was also the question of whether the core ideas for PRs still ultimately come from the human mind. I thought so until February , but now I think differently.

**5:58** · The models now come up with ideas that make me feel humble. He says those stuck on the analysis that these are just agents aren't seeing the progress. Here, Lex asks him if the people he's hearing from would call him "AI-pilled" or delusional. In fact, the most common reaction in the comment section was calling him the most energetic " AI-delusional" person. DHH's opening was that while he might be "AI-pilled," he is not delusional. After 40 years of working with computers, it would be strange not to be amazed by what we've seen in these last two months. The world has barely changed.

### 第5章 AI精神病か

**6:29** · He argues that believing it’s all just electronic parlor tricks is the real delusion. To the counterargument of " Where are the results?" and "Why hasn't GDP grown by X percent?" he says it hasn't even been a year yet. He says it’s like a genie from a magic lamp: simple features take 5 minutes, small ones 20, and serious ones 2 hours. He asks how anyone could not be "AI-pilled ," stating that his evidence is "Quatro ." One piece of that evidence is plugins. The machine has a plugin mechanism that rewrites the OS itself.

**6:57** · Three days after release, there were 330, and just for the calendar that pops up when clicking the clock, there are 17 different versions. It’s huge that the skills for how to build extensions for agents are bundled into the OS, and what was interesting was how he treats Rust. DHH declares it the most terrible language he's seen in 40 years. He says reading it is like having acid poured on your face, yet he still writes apps in Rust. It’s the worst for humans, but the best language for agents to write. He claims both of these things are true. When Lex suggested that maybe we should redefine this as "programming," he refused.

### 第6章 vibe coding とプログラミング

**7:31** · Programming is about understanding elements like loops and conditional variables. It is not about creating programs. He doesn't call a CEO who hires and directs programmers a programmer, and what was surprising was his story that his programming knowledge was a hindrance at one point.

**7:47** · For the first three months, it was faster when he directed the exact method. In the next phase, he found it was better to only convey the desired results. What to build, for whom, and in what order. This is product management, and it’s not a skill all programmers possess. Just say "make it secure," and they'll know what’s needed better than you do. He said he wouldn't have said that six months ago.

**8:08** · He cited Boris from Claude Code, who said their system prompt for Opus 5 shrank by 80%. If you give instructions that are too detailed, the output suffers. It's like a programmer with a micromanaging boss. This connects back to the conversation on Agile. The method of writing out all specs beforehand hasn't worked for 40 years.

**8:28** · People don't know what they want until they receive it. You only realize what's important once you actually use it. So DHH's advice is to be as vague as possible at first and interact with what comes out. Lex apparently has it generate multiple implementations and picks the best one on his own voting page. Humans excel at evaluating differences; if shown three options, we instantly know which we like. But with 22 options, it falls apart. You pick intuitively and justify it with logic later. That is how you use agents. DHH has spent 25 years refining code one line at a time. Why?

### 第7章 美しいコードの経済学

**8:57** · Because beautiful code is easy to understand and maintain , but that assumed humans were the ones changing it. He believes that while tokens are still scarce, there’s a payoff for designs that agents find easy to handle. He brings up the example of the Commodore 64. A machine with only 1MHz and 64KB of memory. If you brought a programmer from that era to 2026, they’d be bewildered by all the ancient tech.

**9:25** · Efficient software, created without error, is still beautiful today. But the value of what we can create has shifted. He says hand-written code is starting to be romanticized, just like cowboys in a Western. In the age of horse-drawn carriages, New York had sewage running through the streets. Yet, the movie cowboys are still cool. Lex notes that just as some still write Tetris for the Game Boy, those who love constraints will remain, and when he adds that beautiful code becomes training data, DHH says he’s part of that too.

**9:52** · He says it warms his heart to hear that people writing Ruby ask their agents to "write it like DHH would." To those sad that handwriting is no longer a job, he says to love your fate and look for the next thing after 25 years. He says he empathizes with the anxiety of those who dreamed of high salaries through programming. But if you only liked building logic as you were told, that part is being disrupted. People who want to create are different.

### 第8章 不安なプログラマへ

**10:20** · When ATMs arrived, bank tellers were afraid, but services became cheaper and the number of tellers actually increased. This is Jevons paradox. However, he also says there are no guarantees. The mechanization of agriculture in the late 1800s was the same as the Luddites who broke the looms. Increasing productivity means doing the same work with fewer people. Literally, the number of people decreases. It is a tragedy for the individual fired, but it is good for the economy as a whole.

**10:48** · I was impressed that he speaks about these two things separately. Besides, much of the work that disappears is drudgery, and programming has its best moments. But out of 2,000 hours a year, how many were spent in a flow state?

**11:01** · 100? 25? Either is possible. He put it that the history of civilization is about handing the remaining drudgery to machines. When asked for advice for young developers, the first thing he said was not to try and predict the future. Even the smartest people in the industry don't know what will happen two models from now. If you try to read it, you will really go crazy. Focus on the now. Now is the best time for computer lovers, and it’s hard not to be excited if you touch the tech.

**11:25** · Building in public is not mandatory, but you can find peers. He says there is a sense of camaraderie that doesn't exist elsewhere in open source. With his partner Ryan, their goal at first was just not to crash at 3 a.m., but now they talk about taking on the world . Worrying about the future alone in a cave is indistinguishable from depression. The future will come anyway . "Just ride it," the comments section said, with some noting it’s easy to say when you’re a wealthy person with 30 years of experience who doesn't need to interview. DHH himself anticipated this within the show, saying that if you call his position privileged, it’s true.

**11:56** · I think it is up to the viewer to decide whether to take his optimism at face value or take it with a grain of salt. This is about editors.

### 第9章 道具立て

**12:03** · DHH used TextMate for almost 20 years since 2005. Working with agents turns your single-threaded mind into parallel processing; while deep immersion in one problem used to be the path to flow, agents are simultaneously too fast and too slow. He says he feels useless just sitting there waiting for the engine.

**12:21** · That’s why he runs multiple agents at the same time. He started out finishing screens with TAX. Now, he says he has moved on to a tool called Heder.

**12:29** · Chauder acts as a notification layer for TAX, ringing a bell whenever an agent is waiting for human judgment. By keeping them running, he stays in a constant state of making decisions, which feels like flow; feeling one machine wasn't enough, he bought a GL.iNet KVM and connected four mini PCs in his closet. He used Tailscale to put them all on one local network, accessible from both his Malibu office and Copenhagen; running three on each, he found that 16 threads was all he could handle.

**12:58** · A year ago, he would spend an hour writing one beautiful controller, with 20 or 30 lines being his output. Now, with 16 threads, he produces hundreds of lines per hour.

**13:09** · However, he himself cautioned that line count is a ridiculous metric and it's meaningless if you can't answer what you've actually built. Another major discovery was that agents love the Unix philosophy. They like small commands callable from the command line, and Linux is entirely CLI-based, starting with configuration files. It’s the irony of the universe that what was the reason Linux was hated until five minutes ago has now become its biggest selling point. During the recording, DHH brought his favorite Dell XPS 14 for Lex's birthday. If you answer five questions, the installation finishes in less than a minute.

### 第10章 速度への執着

**13:41** · He actually demonstrated it during the recording.

**13:44** · It is a special model with only six in the world, featuring his logo where the Copilot key usually sits. This follows him being asked online why he insists on a one-minute installation. He cited a post by Mitchell Hashimoto, the creator of Ghostty. The pursuit of excellence needs no explanation. In other words, you don't need to justify wanting something fast and beautiful.

**14:04** · The Commodore 64 allowed you to use BASIC within a second of turning it on.

**14:08** · Yet, a brand-new Mac takes 42 minutes for updates to finish. A new PC with Windows takes an hour and 35 minutes.

**14:15** · He says it's an insult to have a computer this fast. The world record for Asahi Linux is 45 seconds. With a model-specific turbo image, he expects it could be done in 12 seconds. The initial goal was two minutes. Once you break that, one minute, then 45 seconds . Like the four-minute mile, once one person does it, others follow. Just because Apple takes 42 minutes doesn't mean 42 minutes is the standard. The disk reads at 7GB/s, and the ISO is 5.8 GB. Keep pushing until you reach the limits of physics. He wonders why it can't be done in one second.

**14:44** · In traditional Linux culture, bundling apps is seen as heresy and frowned upon . But who decides that? DHH's answer is : I am the chef. If you build your dream computer, there will always be others who share that dream. It includes OBS for recording and his own custom tool, AsahiCut, for video editing and clipping. He says even cryptic Linux error messages have become weapons for agents. Since they've trained on 40 million lines of Linux code, they know exactly where to look when those nonsensical errors appear.

**15:15** · It reads the logs, pulls the app source code, identifies the cause, and asks if you want to file a bug report. He says he’s been able to diagnose everything this year. He has a test he created by chance for comparing models. The screen saver was running on a Python library. It was eating up the laptop's CPU, so he asked it to port it to Rust with no dependencies, match the frame timing, and not to stop until finished. Startup went from 86ms to 2ms . Execution is 9.6 times faster. The binary is 3MB. A library that had been used for a year was translated in one go.

### 第11章 モデルとハーネス

**15:46** · Fable wrote an 8-step plan, ran out of tokens, and Opus 5 took over to finish it—costing about $ 550. Giving the same plan to GPT-4o finished it in an hour and a half for $ 46. Cheaper models cheated by just wrapping existing implementations. Groq 3 (Grok) completed it for $ 55. DeepSeek V3 Pro completed it in 2 hours and 45 minutes for $ 23. Flash failed. His takeaway was that while Fable is the best, it's amazing to see so many options competing.

**16:13** · His current workflow is planning with Fable, implementation with Opus 5, and final review with Code-X (o1). Push, and GitHub Copilot finds something else. It was annoying repeating the same points at first, but like showing work to a skilled colleague, it makes the code better.

**16:32** · It’s no surprise. Claude Code is in the driver’s seat. Using multiple agents is the best approach. Open models are run on open code, not Chinese servers, but on Fireworks. At 37signals, they're testing adding agents as colleagues in Basecamp to hand off To-Dos. Chat as a format is less suited for waiting than a crane-like mechanism. Now, they have a bot handle PRs and issues, reporting once a day via email.

**17:03** · Switching between 16 threads is exhausting. He compared it to lying on the garage floor after a race, completely drained. Around the 3- hour 10-minute mark, the topic shifts to parenting. DHH says he wasn't a fan of kids before having his own. Now, he calls them the most interesting people in the world. Though sometimes they can be jerks too. You can't go out at night . You can't get any sleep. It’s a sacrifice, but a meaningful one for something of true value. The joy of watching a baby grow into a toddler.

### 第12章 父親であること

**17:35** · His eldest son just turned into a teenager. He and his wife Jamie agree that missing this would be the biggest regret of their lives. He loves building things and his hobbies, but creating life with a loved one is the ultimate experience. Lex worries about children growing up in this world. It seems like a bigger change than the internet. DHH says to imagine someone born in 1880.

**18:02** · They saw two world wars, airplanes, radio, and television in one lifetime. He also noted that the physical world has stagnated, while progress is only digital. Read Stoic books and you see people 2,500 years ago had the same struggles. You realize you aren’t that special. Humanity has managed to pull through for 200,000 years. What makes life worth living is still love and imagination, just like 2,000 years ago. He also recommended a book arguing that history is a circle, not a straight line.

**18:31** · The point is that crises today and in the past felt equally urgent to those living through them. This summer, DHH reportedly stayed off X for three weeks. He even admits himself that he is deeply addicted to the platform. Three chocolate-covered strawberries are enough, but the algorithm makes you eat seventeen. And it's all just talk about politics. The algorithm reflects not what you say you like, but where your finger stops, and the reflection isn't pretty. As a countermeasure, he consciously pushes in the opposite direction.

**19:01** · His old tweets were negative , but now he encourages what people are building. Knowing that negative content spreads 50%more, he still consciously chooses the opposite. TikTok is like a marshmallow test; he scrolls past videos that incite anger or lust to stop it from learning his tastes.

### 第13章 Linuxが勝つ理由

**19:19** · Hasn't every year been called "the year of the Linux desktop"? Lex asks if that is truly coming. DHH's answer is that not only is it visible, it is the most probable outcome. It fits this moment perfectly, as the "closed and curated" experience that was Apple's strength has become a hostile, wall-filled environment for agents. Surprisingly, much of the Linux community was skeptical or even hostile toward AI.

**19:45** · The saving grace is Linus Torvalds himself, who wrote a few weeks ago that if you think Linux is anti-AI, think again. He wrote that if you don't like it, you can fork off. The graph of AI adoption for personal computers is tracing a parabola. He also says that Linux has been waiting for this moment since 1991. Why haven't people switched until now? Because there was no strong reason to, and most alternatives were just slightly worse copies of what we were used to. He is blunt, saying people choose what's better, not what's free. Now it's different. If you ramble for 20 minutes, an OS tailored to your own image emerges.

**20:16** · Once you taste that, you can never go back. He says this is also the origin of computing. The Commodore 64 booted in a second, and BASIC started right up. It was a computer you could rewrite yourself from the very start. The only thing was , you couldn't use it unless you could read hieroglyphs. All you have to do is make what you want, which the agent gave you as a Rosetta Stone, into an objective. The first thing he mentioned about Linus was his persistence, which hasn't stopped since 1991. He is still steering a project with 40 million lines of code. He described him as someone who can change his conclusions based on new information, like bringing Rust and AI into the kernel.

**20:47** · Regarding his sharp tongue, he said the world has become too sensitive. You need a bit of toughness. Especially if you are the one carrying the weight of the kernel.

### 第14章 プログラミングの未来

**20:57** · On the future of programming, he prefaced it as a cliché but insisted it’s true: the language is now English. If there is any language more beautiful than Ruby, it is English.

**21:06** · Because it is the language that has carried the world's great literature.

**21:10** · Ruby is something you keep writing for fun; it's more powerful to use metaphors than to write "I love you" directly, like riding a horse in a stable even if you have a model in the garage. Instructions are the same; if you write them too precisely, it follows them too literally. X also agreed that the power of natural language lies in its ability to choose from many meanings while leaving room for ambiguity. Many programmers dislike that the same instruction yields the same unchanging answer, but DHH says that "temperature" is exactly where creativity lies. He also talked about trying a bot in February that you could talk to like WhatsApp. MCP was a hassle , so he just let it use the web as is.

**21:43** · When he had it register for a service, it said it didn't have an email address , so he told it to create one on Hey.com, and it actually did and signed up. When he invited it to Basecamp, it opened the invite email, joined, and introduced itself in the AI room. He said he caught a glimpse of a future that was slow at the time. An announcement. This channel offers YouTube memberships. Please see the membership link in the description for details. Please consider joining the membership. It is not mandatory. I will distill this five-hour talk into three points.

### まとめ

**22:13** · First, give it the problem, not the destination; the agent will decide the path. Second, company software doesn't move faster not because implementation is slow, but because the people deciding what to build are the bottleneck. And third, Linux will win because its old drawbacks—everything being config files and CLI—have become the greatest advantages for agents. I thought the method of asking vaguely, having it provide three options, and then choosing one is something I can copy right away. On the other hand, after hearing about the Basecamp 5 cleanup, the idea of not looking at code 100%is still scary for my own work.

**22:44** · I've left the link to the original video in the description.

**22:47** · O-machi seems to be accessible in a minute via .org, so please give it a try. If you found this video interesting or helpful, please be sure to subscribe to the channel and give it a like. See you next time. This is a PR message from the engineer recruitment agency, TechGo. You can get a free career consultation via the link in the description. TechGo has three main features, the first being that you can do interview prep as many times as you like.

**23:17** · While regular agencies often don't offer mock interviews or limit them to just once, you can practice as much as you want here. Being comfortable with interviews makes it easier to showcase your achievements, which is a big plus. The second feature is that they offer one-day selection sessions for busy people. They host exclusive selection events featuring popular companies. The one-day events, where you can complete all your interviews in a single Saturday, are particularly well-received. I highly recommend this for engineers who are busy during the week.

**23:49** · Third, they have a wealth of high-salary positions.

**23:54** · Since they are run by the same company as the high-class recruitment agency for the consulting industry, MaVision, they have plenty of high-paying jobs.

**24:03** · This is recommended for those who want to get involved in large-scale projects or aim for positions at mega-ventures.

**24:10** · Please try booking a free career consultation via the link in the description.