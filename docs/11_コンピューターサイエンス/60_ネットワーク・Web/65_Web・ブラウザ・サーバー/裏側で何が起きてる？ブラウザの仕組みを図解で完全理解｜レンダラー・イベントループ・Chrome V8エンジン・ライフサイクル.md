---
title: "裏側で何が起きてる？ブラウザの仕組みを図解で完全理解｜レンダラー・イベントループ・Chrome V8エンジン・ライフサイクル"
source: "https://www.youtube.com/watch?v=lqR0cVAOSGM"
author:
  - "[[ぎゅぎゅっとテック]]"
published: 2026-10-15
created: 2026-10-18
description: "ブラウザの仕組み、知りたいのに後回しになっていませんか。この動画では、ページを開いてから、画面が出て、JavaScript が動くまでを、1 枚の図にまとめて説明します。大きく分けると 3 つです。ページを閉じ込める部屋（ブラウザのプロセスとレンダラー、サンドボックス）。文字を画面にする流れ（パーサー、DOM と CSSOM、レイアウトとペイント）。そして JavaScript を動かす仕組"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=lqR0cVAOSGM)

ブラウザの仕組み、知りたいのに後回しになっていませんか。  
この動画では、ページを開いてから、画面が出て、JavaScript が動くまでを、1 枚の図にまとめて説明します。  
  
大きく分けると 3 つです。ページを閉じ込める部屋（ブラウザのプロセスとレンダラー、サンドボックス）。文字を画面にする流れ（パーサー、DOM と CSSOM、レイアウトとペイント）。そして JavaScript を動かす仕組み（イベントループと V8）です。  
script タグがパーサーを止める理由、defer・async・module の違い、タスクとマイクロタスクの順番、bfcache で戻ったときに何が動くか、V8 がバイトコードと JIT で JavaScript を実行するしくみまで、1 つの図の上でつなげます。  
見終わると、0 秒の setTimeout が、あとから書いた Promise の then に追い抜かれる理由を、図で説明できるようになります。  
  
▼ こんな人に  
・フロントエンドが本業ではないが、ブラウザの中で何が起きているかを知りたい  
・DOM、イベントループ、V8 という言葉は知っているが、つながっていない  
・script の defer と async、setTimeout と Promise の順番を、理由から説明したい  
  
▼ チャプター  
0:00 導入：ブラウザの全体像を 1 枚の図で  
0:45 第 1 部 ブラウザの部屋分け：レンダラーとサンドボックス  
1:57 第 2 部 文字から画面へ：DOM・CSSOM・レイアウト・ペイント  
3:42 第 3 部 script とパーサー：defer・async の違い  
5:31 第 4 部 イベントループ：タスクとマイクロタスク  
8:24 第 5 部 V8：バイトコードと JIT コンパイル  
10:50 まとめ：0 秒の setTimeout が後回しになる理由  
  
▼ 各部の内容  
第 1 部 ブラウザの部屋分け  
Chrome は、ネットやファイルに触れる権限の強いブラウザのプロセスと、ページを動かす権限の弱いレンダラーのプロセスに分かれています。レンダラーはサンドボックスの中で動き、ファイルやネットが要るときはブラウザのプロセスに頼みます。Chromium がレンダラーの乗っ取りまで考えて守りを重ねている理由も紹介します。  
  
第 2 部 文字から画面へ  
URL を入れてから文書が届くまでのナビゲーション、HTML をパーサーが読んで DOM を作り、CSS から CSSOM を作る流れ、レイアウトとペイントで画面に描くまでのレンダリングの流れを追います。この作業の多くと JavaScript が、メインスレッドという 1 本の流れで動くことが、あとの話のカギになります。  
  
第 3 部 script とパーサー  
ふつうの script タグに出会うと、パーサーは読むのを止めます。理由は document.write です。head のスクリプトから body が見えないことを Chromium で確かめ、defer・async・type="module" の違いと、DOMContentLoaded と load の合図の順番を、実験の結果で見ます。  
  
第 4 部 イベントループ  
クリックやタイマーの合図で、関数がタスクキューに並び、イベントループが 1 つずつ実行します。タスクが 1 つ終わるたびに Promise の then などのマイクロタスクを片付け、その合間に画面を描き直します。重い処理の間のクリックが待たされる理由、タブが裏に回ったときのタイマー、pagehide・visibilitychange・pageshow と bfcache で戻ったときに何が動くかまで説明します。  
  
第 5 部 V8  
Chrome の JavaScript エンジン V8 は、コードを構文の木にしてバイトコードを作り、インタープリターの Ignition で動かします。よく呼ばれる関数は JIT コンパイルで機械語になり、Sparkplug・Maglev・TurboFan と段が上がります。形の決め打ちが外れたときの脱最適化を Node.js で確かめ、V8 の穴に備えてレンダラーごとサンドボックスに閉じ込める理由につなげます。  
  
まとめ  
0 秒の setTimeout が、あとから書いた Promise の then に追い抜かれる理由を、完成した図で説明します。  
  
▼ 手元の実験について  
スクリプトの実行順とイベントループの順番の実験は、Chromium 141（headless）で動かした結果です。  
V8 のバイトコードと脱最適化は、Node.js 22（V8 12.4）で確かめました。  
図は一般的な概念図です。プロセスの分け方や JIT の段は、ブラウザや版によって違います。  
  
▼ 出典  
・HTML Standard（イベントループの処理モデル、script の実行）  
・MDN Web Docs：How browsers work、script 要素、JavaScript execution model、bfcache、pagehide / pageshow  
・Chromium のドキュメント：Process Model and Site Isolation、Sandbox、Life of a Navigation、Compromised Renderers  
・V8 ブログ：Ignition、Sparkplug、Maglev、The V8 Sandbox  
  
#ブラウザ #JavaScript #イベントループ #computerscience #Web開発 #プログラミング #Chrome #V8 #Webアーキテクチャ #低レイヤー #SoftwareEngineering #エンジニア #frontend  
#ぎゅぎゅテク #ぎゅぎゅっとテック  
#ぎゅぎゅっとテック

## 詳しい要約

**テーマ：ページを開いてから閉じるまで、ブラウザの中で何が起きているか**

URL 入力からページ表示・JavaScript の実行・バックグラウンド化・終了までを 1 枚の全体像にまとめる解説。プロセスの部屋分け（レンダラーとサンドボックス）、ナビゲーションとキャッシュ、パーサーによる DOM・CSSOM の構築、script の defer・async、イベントループ、描画の 4 段階、ページのライフサイクルと bfcache、V8 のバイトコードと JIT を順に積み上げる。最後に、0 秒の setTimeout が後から書いた Promise の then に追い抜かれる理由を図で説明する。

---

### ブラウザの部屋分け：レンダラーとサンドボックス

- ブラウザは他人が書いたプログラム（ページの JavaScript）を毎日実行するので、パスワードやファイルと同じ部屋に置くと危険。
- Chrome は処理を**プロセス**に分ける：ネットやファイルに触れる権限の強い**ブラウザのプロセス**、Network・GPU のプロセス、ページを動かす権限の弱い**レンダラーのプロセス**。
- レンダラーは外に触れられない箱＝**サンドボックス**の中で動き、ファイルやネットが要るときはブラウザのプロセスに頼む。ブラウザは複雑で脆弱性があり得るため、Chromium はレンダラーが乗っ取られる場合まで考えて防御を重ねている。
- レンダラーはサイトごとに分かれ、1 つが落ちても他は動き続ける。あるサイトが別サイトのメモリを読めないようにする＝**サイト分離（site isolation）**。Chrome のタスクマネージャーで重い部屋がわかる。

### ナビゲーションとキャッシュ：ページはどこから来るか

- URL を入れると、まず **Service Worker** があればその JS が応答を決め、次に **HTTP キャッシュ**を確認。有効ならサーバーには何も来ない。期限切れなら確認に来て、変わっていなければ **304** を返すだけ。
- サーバーへ行く場合は DNS と接続を経て、応答のヘッダーをブラウザのプロセスが確認し、サイトを見てどのレンダラーを使うか決め、新しいページを作る（前のページは片付けるか保持）。この一連が**ナビゲーション**。
- Cache-Control の 4 戦略：

| 指定 | 意味 | 使いどころ |
|---|---|---|
| max-age | その秒数は確認せず使う | ファイル名にハッシュを含む JS・CSS は長く |
| no-cache | 使う前に毎回サーバーに確認 | HTML（常に新しいファイル名を指すため） |
| no-store | 一切保存しない | 機微な情報を含む応答 |
| immutable | リロードしても確認しない | — |

- 調査は DevTools の Network タブ（Size 列が disk cache ならキャッシュから、Timing で最初の 1 バイトまでの時間）。

### 文字から画面へ：パーサー・DOM・CSSOM

- レンダラーに届くのはただの文字列。全部を待たずに読み始め、タグを見つけるたびに部品を作ってつなぐ（**パーサー**）。部品の木構造が **DOM** で、JavaScript はこの木を操作する。
- 読みながらリンク・画像・スクリプトを見つけると追加で取りに行く（ログで HTML の後に CSS・JS・画像が並ぶ理由。これらも Service Worker と HTTP キャッシュを通る）。CSS も別の木 **CSSOM** になる。
- head の CSS が全部そろうまで画面は描かない（一瞬でも崩れたレイアウトを見せないため）。CSS が遅いと初期表示が遅れる。
- 2 つの木を合わせて見える部分だけ選び、**レイアウト**（大きさと位置）、**ペイント**（描画命令）へ。これらの多くと JavaScript は**メインスレッド**という 1 本の流れで動く — これが後の話のカギ。Elements タブで DOM を確認できる。

### script とパーサー：defer・async の違い

- script は **document.write** で読んでいる最中の HTML に文字を足せるので、普通の script タグに出会うとパーサーは**読むのを止め**、実行してから続きを読む。
- Chromium で確認：head のスクリプトからは body がまだない。body 途中のスクリプトからは上の段落は見えるが下は見えない（その時点の未完成の DOM を見る）。
- 止めない書き方：
  - **defer**：取得しながら読み続け、HTML の解析後に**書いた順**に実行 → 自分の JS でページを組み立てるとき
  - **async**：届いたらすぐ実行 → 解析タグなど順序に依存しないもの
  - **type="module"**：既定で defer のように解析後に実行 → 他ファイルを import する JS
- **DOMContentLoaded** は HTML 解析と defer・module の完了で発火（async は待たない）。画像まで全部そろうと **load**。実験順：defer → module → DOMContentLoaded → async（到着を意図的に遅らせた）→ load。DOM を触る初期化は DOMContentLoaded、画像サイズを使う処理は load で。
- load の後もクリック・タイマー・通信応答でスクリプトは動き続ける。読み込みはページの一生の始まりにすぎない。

### イベントループ：タスクとマイクロタスク

- 1 ページのメインスレッドでは 2 つの JS を同時に動かせないが、通信待ちで画面が固まらないのは**待つ仕事をブラウザに任せる**から。実行中の JS は**コールスタック**に積まれ、fetch やタイマーはブラウザが JS の外で扱う。
- クリックなどの合図（**イベント**）やタイマー・通信応答で、登録した関数が**タスクキュー**に並ぶ。ブラウザは先頭から 1 つ取り出して**最後まで実行**し、次を取る＝**イベントループ**。
- タスクが 1 つ終わるたびに、Promise などの後続処理が並ぶ**マイクロタスク**のキューを空になるまで処理。その合間に**画面を描き直す機会**がある（読み込み中のパーサーのタスクの間も同様）。
- fetch の応答到着はタスクとして並び、その中で Promise が解決し、await の続きはマイクロタスクとして動く。
- **setInterval** で 5 秒ごとに API を呼ぶと前の呼び出しが終わっていなくても次が始まり、遅い API だと積み上がる → 応答を受けてから **setTimeout** で次を予約するのが定石。
- 重い処理中のクリックは終わるまで待たされる（1 つのタスクは中断されずに完了するため。描画も止まる）。重い計算は **Web Worker** へ。
- クリックイベントは外側の要素から押された要素へ下り、また上る → 長いリストは親に 1 つハンドラーを付けて子を判別できる。wheel・touch のハンドラーはスクロールを遅らせることがあるので、止める気がなければ **passive** を付ける。Performance タブで長いタスクを探せる。

### 画面の描き方：4 段階

- **Style**（見た目を決める）→ **Layout**（位置と大きさ）→ **Paint**（描画命令のリスト）→ **Composite**（層を重ねて表示）。
- 何を変えるかでやり直す段が違う：width や top/left は Layout 以降すべて、色は Paint から、**transform と opacity** は多くの場合 Composite だけ。
- 60Hz の画面では 1 回の更新が約 **16ms**。間に合わないとカクつくので、メニューの開閉などの動きは transform と opacity で行う。
- 高さの読み書きを交互にしない（変更直後に読むとその場でレイアウトを再計算する）。DevTools の paint flashing で描き直し箇所が緑に光る。

### ページのライフサイクルと bfcache

- タブを切り替えるとページはバックグラウンドへ。タイマーは**間引き（throttle）**され（止まるのではなく設定より遅れて動く）、描画の合図は止まる。長く裏にいると一時停止やメモリ解放のための破棄もある。
- 離れるときは **pagehide**、タブ切り替えなどでは **visibilitychange** が hidden に。
- 戻るボタンでは、JS の状態ごと凍結して保存したスナップショットから再開することがある＝**bfcache**。head のスクリプトは再実行されず、止まったところから再開し、**pageshow** が **persisted** 付きで届く。保存できなかった場合は再読み込みして最初から動く。bfcache から戻るとページの再取得リクエストは送られず、**HTML のアクセスログに残らない**。
- ページが閉じる瞬間に最後のログを確実に送る方法はない → バックグラウンドに回った時点で **sendBeacon** や **keepalive 付き fetch** で送り、受け手は届かない・重複する前提にする。Application タブで bfcache に入るか試せる。

### V8：バイトコードと JIT コンパイル

- Chrome のエンジンは **V8**（サーバーの Node.js も同じ）。コードを**抽象構文木**にし、V8 用の小さな命令列＝**バイトコード**を作る。a と b を足すだけの関数は「b を読む・a を足す・返す」の 3 命令。
- バイトコードはインタープリター **Ignition** が 1 つずつ実行（すぐ動くが速さはそこそこ）。よく呼ばれる関数は実行中に機械語へ再コンパイル＝**JIT**。段は **Sparkplug → Maglev → TurboFan** で、上ほど作るのに時間がかかるが速い。
- Maglev・TurboFan が速い主因は**推測**（いつも同じ構造のオブジェクトが来たので次も同じと決め打ちして機械語を作る）。外れると機械語を捨ててバイトコードに戻る＝**脱最適化**。Node.js で x だけのオブジェクトで何度も呼んだ後に y が先頭のオブジェクトを渡すと、構造が違うとログに出た。
- JavaScript はインタープリターかコンパイラーか → **両方**。どの段で動いても結果は同じ。
- V8 ブログによれば 2021〜2023 年に見つかった Chrome への実際の攻撃はすべてレンダラーの穴から始まり、多くは V8 の穴。だからエンジンに穴があっても被害が外に広がらないよう、**レンダラーごと外側のサンドボックス**に閉じ込める。

### まとめ：0 秒の setTimeout が後回しになる理由と実務での使い方

- 流れは 1 本なので、今のスクリプトが終わるまで A（setTimeout 0）も B（Promise）も動けない。終わるとまず**マイクロタスクのキュー**を空にし、Promise はここに並ぶ。setTimeout は**タイマーが切れてから**タスクキューに並ぶ別のタスクなので、0 秒でも後回しになる。
- 実務での当てはめ：
  - API は速いのに画面が遅い → CSS やスクリプトによるブロック、長いタスクを疑い、ネットワークのウォーターフォールとパフォーマンスプロファイラーで確認
  - 裏のタブでポーリングが遅い → タイマーの間引き。裏に回ったら止め、戻ったら再開
  - 戻るボタンでアクセスログがない → bfcache（Network タブに bfcache）か HTTP キャッシュ（disk cache）
- ページの JavaScript は終始、権限を絞った**サンドボックス内のレンダラー**で動いている。

## Transcript

### 導入：ブラウザの全体像を 1 枚の図で

**0:00** · Do you want to understand how browsers work but keep putting it off? Let's break it down with this diagram. It's okay if you're not a frontend developer . I've summarized the process from entering a URL to page display and closing in this one chart. It can be divided into eight major parts. By the end, you will be able to explain this chart in your own words. You'll even understand why a zero-second setTimeout gets overtaken by a Promise written later. Or why your access history isn't saved when you use the back button.

**0:32** · We will build the diagram step by step from scratch. First, let's start with how the browser organizes its "rooms."

**0:42** · Is the browser just one single program?

### 第 1 部 ブラウザの部屋分け：レンダラーとサンドボックス

**0:45** · Browsers execute programs written by strangers every single day. That's the JavaScript of the pages you open. If that program went rogue, having passwords and files in the same room would put everything at risk. Chrome separates its tasks into individual processes. There's the main Browser process with high privileges for network and files, the Network and GPU processes, and the low-privilege Renderer processes that run the pages.

**1:17** · The renderer operates inside a box where it can't touch the outside. When it needs files or the internet, it asks the Browser process. This box is called a sandbox. Chromium adds layers of defense even for cases where the renderer might be hijacked through a browser vulnerability. This is because browsers are complex and can have vulnerabilities somewhere. Renderers are separated by site. If one crashes, the Browser process and other site tabs keep running. There is one more reason for this separation.

**1:49** · It prevents one site from reading the memory of another . Separating and protecting data by site is called site isolation. So far, we've learned that the browser is divided into rooms with different privilege levels. You can see which room is heavy in Chrome's Task Manager.

### 第 2 部 文字から画面へ：DOM・CSSOM・レイアウト・ペイント

**2:06** · The zero-second timer topic we'll cover later also happens inside this renderer . Where does the page arrive from into that room? Where do pages come from?

**2:19** · What happens first after you enter a URL? It doesn't always go straight to your server. First, if there is a Service Worker, its JS decides how to return the response. Next, it checks the HTTP cache. If it's still valid, it returns the page from the cache.

**2:37** · Nothing comes to your server. If it has expired, it comes to the server to check. If it hasn't changed, you only need to return a 304. When going to the server, you proceed with DNS and connection requests. When the response arrives, the browser process first checks the header to see what it contains. Since renderers are separated by site, it looks at the site of the received page to decide which renderer to use. The chosen renderer creates a new page. The previous page is either cleaned up or kept.

**3:10** · This whole process is called navigation. You are here. You return HTML and JS, and decide how to cache them with Cache-Control. There are four common strategies used.

**3:25** · max-age is used without checking for that number of seconds. no-cache checks with the server every time before use.

**3:32** · no-store does not save it at all.

**3:34** · immutable is not checked even if reloaded. Here is how to use them. JS and CSS with hashes in their filenames get a long max-age; HTML gets no-cache to always point to new filenames.

### 第 3 部 script とパーサー：defer・async の違い

**3:50** · Responses containing sensitive info use no-store. When investigating, open the Network tab in DevTools. If the size column says disk cache, it's returning from the cache. Opening Timing lets you see the time from sending the request to receiving the first byte. So far, we've learned that a page is searched in the order of Service Worker, HTTP cache, and then the server. How do the characters that reach the chosen renderer turn into a screen? How do the received characters become a screen?

**4:23** · What reaches the chosen renderer is just a string of text. HTML and CSS are just text at first. The renderer starts reading as soon as it arrives without waiting for it all to finish. Whenever it finds a tag while reading, it creates a part and attaches it. This reading process is called the parser.

**4:43** · Head and body under HTML, paragraphs under body. The parts are connected in a tree structure. This tree is called the DOM. JavaScript interacts with this tree. If it finds links, images, or scripts while reading, it goes to fetch them additionally. This is why CSS, JS, and images appear after the HTML in your logs. These fetches also go through the Service Worker and HTTP cache mentioned earlier. CSS is also read in the same way and turned into a separate tree. We call this the CSSOM.

**5:18** · The DOM is an independent tree. Will text appear on the screen before the CSS arrives? No, it won't. The browser won't render the screen until all CSS in the head is ready. This is to prevent showing a broken layout, even for a split second. That is why if the CSS is slow, the initial screen is delayed. It combines both trees and selects only the visible parts.

### 第 4 部 イベントループ：タスクとマイクロタスク

**5:43** · Calculating their size and position is called layout. Creating the instructions for painting is the paint phase. We will look at the details later. The important thing is that most of this work proceeds on a single flow called the main thread. JavaScript also runs on this same single thread. The 0- second timer from earlier also waits in line on this single thread. So far, we understand the flow of how text becomes the DOM and CSSOM, and eventually the screen. The resulting DOM can be viewed in the Elements tab of DevTools.

**6:13** · What happens if there is a script tag in the middle of the HTML? When the parser encounters a script, the script can use document.write to add text to the HTML currently being read. Therefore, when it encounters a normal script tag, the parser stops reading. It executes the script before continuing to read the rest. I verified this in Chromium. From a script in the head, the body does not exist yet.

**6:43** · From a script in the middle of the body, it can see the paragraphs above but not the ones below. In other words, the script sees the incomplete DOM that the parser has built up to that point. There are ways to write it so that it doesn't stop. "Defer" continues reading while fetching, and executes in the order written after HTML parsing is finished. "Async" executes as soon as it arrives. Scripts with type = "module" act like "defer" by default, running only after parsing is finished.

**7:14** · Use "defer" if you are building the page with your own JS.

**7:19** · This is because it runs in the order written after the HTML is finished loading. Use "async" for things like analytics tags that don't depend on the order of other scripts. Write JS that imports other files using type = " module". Once the HTML is parsed and the deferred and module scripts have finished, the DOMContentLoaded event fires. DOMContentLoaded does not wait for async scripts. When everything, including images, is fully loaded, the load event fires. Here is the order of the experiment.

**7:50** · After loading, we had defer, module, DOMContentLoaded, then async, and finally load. Async was placed here because we intentionally delayed its arrival. Initialization that touches the DOM is run on DOMContentLoaded. When defer scripts run, the DOM is already built.

**8:13** · Processes that use image dimensions wait until load. Do scripts stop running once the load signal is triggered? They keep running. Scripts run repeatedly for clicks, timers, and communication responses. Loading is merely the beginning of the page's life . So far, we've covered how scripts block the parser, ways to avoid that, and loading signals. You can see which files were fetched, when, and why in the network waterfall. After loading, in what order do scripts run?

### 第 5 部 V8：バイトコードと JIT コンパイル

**8:46** · What triggers JavaScript after loading? Two JavaScript tasks cannot run simultaneously on a single page's main thread. Yet, the screen doesn't freeze while waiting for communication responses. Why is that? Because we delegate the waiting task to the browser. The currently running JS is placed on the call stack. The browser handles fetches and timers outside of JS. JavaScript registers a function in advance to run when a click occurs.

**9:22** · Signals like a click are called events.

**9:25** · When a signal fires, the registered function joins a queue. The same applies to timers and communication responses. This queue is called the task queue. The browser pulls one item from the front of the queue and executes it to completion. Once finished, it takes the next one. This cycle is called the event loop. Every time a task finishes, another queue is processed until it is empty. This queue holds follow-up processes, like promises, scheduled to run immediately after the current task.

**9:56** · Processes in this queue are called microtasks. These are also processed when the currently running script finishes. In between, there is an opportunity to redraw the screen. This also happens during loading, between parser tasks. The layout and paint processes mentioned earlier usually run at this time. It is time for the experiment. There are two lines left in the current script, two microtasks, and even if you set a timeout at the end, the task will run after the current process.

**10:27** · It's the same when your SPA's JS calls your API via fetch. When the response arrives, the notification is queued as a task.

**10:40** · The promise resolves within that task, and the rest of the await runs as a microtask. Is setInterval okay for calling an API every 5 seconds? It starts the next call even if the previous one hasn't finished. If the API is slow, the calls will pile up.

### まとめ：0 秒の setTimeout が後回しになる理由

**10:57** · The standard approach is to schedule the next one with setTimeout after receiving the response. What happens if you click a button during a heavy process? The click is forced to wait until the heavy process finishes. In the experiment, the click also ran after the completion. That's because a single task runs to completion without being interrupted. Meanwhile, main thread rendering is also paused. Heavy calculations can be offloaded to a separate thread called a Web Worker.

**11:27** · Click events travel from the outer elements down to the clicked element and back up. That's why for long lists, you can just attach one handler to the parent to identify the child that was clicked. Wheel and touch handlers can sometimes delay scrolling until they finish. If you don't intend to stop scrolling in the handler, add 'passive' to tell the browser it doesn't need to wait. So far, we've learned that the event loop cycles through tasks, microtasks, and rendering.

**11:56** · Long tasks can be found by recording with the DevTools performance tab. How is the screen redrawn during that rendering opportunity? How is the screen painted?

**12:10** · Even if the DOM is ready, it doesn't appear on screen immediately. It goes through four stages. Style determines the look of each element. Layout calculates the position and size. Paint creates a list of commands for drawing.

**12:25** · Composite layers these elements together to show them on screen. Is changing the color of a button the same weight as moving its position? No, it's different. Which stages need to be rerun depends on what you change.

**12:40** · Changing width or using top/left for position triggers everything from layout onwards, color only triggers from paint, while transforms and opacity can often be handled by composition alone. If the main thread can't finish processing within one screen refresh, it stutters. On a 60Hz screen, that's about 16 milliseconds.

**13:03** · That's why movements like opening menus are done with transform and opacity.

**13:07** · You should also avoid alternating between reading and writing heights.

**13:11** · Because if you read the height right after changing it, the browser recalculates the layout on the spot.

**13:18** · We've learned that the screen is rendered in four stages: style, layout, paint, and composite. Repainted areas light up in green when using DevTools ' paint flashing. What happens to a page that's no longer visible? What happens when it's hidden? Pages aren't always in the foreground. They move to the background, get paused, return, and are closed. When you switch tabs, the page moves to the background.

**13:47** · In the background, timers are throttled and draw signals stop. Throttled doesn't mean stopped; it means running later than the set time. If it stays in the background long enough, it may be paused or discarded to free up memory.

**14:03** · When navigating away, a pagehide signal is fired. When moving or switching tabs , visibilitychange triggers a hidden state. When using the back button, the browser may use a cached snapshot of the page. It freezes the JavaScript state, saves it, and resumes from where it left off. This is called the BF cache. Does the head script run again when returning from the BF cache? It does not. It simply resumes from where it was paused.

**14:35** · In this case, the pageshow signal arrives with a " persisted" flag. If it couldn't be saved, the page reloads and runs from the beginning. When returning from the BF cache, no request is sent to re-fetch the page. Nothing is left in the HTML access logs. Can you reliably send a final log the moment the page closes? You cannot. There is no way to send it reliably.

**15:03** · So, send it using sendBeacon or fetch with keepalive as soon as it goes to the background. The receiving server must assume the data might not arrive or might arrive as a duplicate. We've now learned how a page moves to the background, is paused, cached, and closed. You can test whether a page enters the BFcache in the Application tab of DevTools. How does the JavaScript on that page become something a machine can execute?

**15:31** · How does JavaScript become machine instructions? JavaScript arrives as raw source code. And we want it to run as soon as it arrives. The engine inside the browser converts it on the fly into a format the machine can execute.

**15:52** · Chrome's engine is V8. Node.js on your server also runs on the same V8. V8 first reads the code and turns it into an abstract syntax tree. From there, it creates a sequence of small instructions for V8. This is called bytecode. I looked at a function that just adds A and B inside V8 in Node.

**16:14** · There are three instructions. Read B, add A, and return. An interpreter executes this bytecode one by one. In V8, this is called Ignition. It can start running immediately, but the speed is just okay. Functions that are called often are recompiled into machine code while running. Because it compiles while running, it is called JIT. V 8's JIT is tiered.

**16:38** · Sparkplug, Maglev, and TurboFan; the higher tiers take longer to build but result in faster machine code. The main reason the top two tiers, Maglev and TurboFan, are fast is speculation. This function has always received objects with the same structure. So, it speculates that the next one will be the same and creates machine code. If the speculation fails, it discards that machine code and returns to bytecode.

**17:08** · After calling it many times with an object containing only X, I passed an object with Y first once. The log showed that the structure was different . Is JavaScript interpreted or compiled ? It is both. It starts by running bytecode in the interpreter, and only the frequently used parts are turned into machine code. The result remains the same regardless of which tier it runs in. This engine is extremely complex.

**17:36** · According to the V8 blog, every real-world attack on Chrome found between 2021 and 2023 started from a hole in the renderer, and most of them were holes in V8. To prevent damage from spreading outward even if there is a hole in the engine, the entire renderer is kept inside an outer sandbox. So far, we've learned that V8 turns code into bytecode and machines the parts used most often. You can see which functions take time in the Performance tab of DevTools. With this, the big picture is complete.

**18:08** · Task A with setTimeout 0 is overtaken by Promise B, even though B was written later. Why is that? Pause the video and try explaining it using this diagram.

**18:32** · Since the flow is single-threaded, neither A nor B can run until the current script finishes. When it finishes, it first clears the microtask queue. Promises line up here.

**18:43** · setTimeout is a different task that joins the queue only after the timer expires. That is why even 0 seconds gets pushed back. You can also use this diagram to investigate real-world issues. Like when the API is fast but the screen is slow. You should suspect CSS or scripts blocking the flow, or long-running tasks. Verify this with the network waterfall and the performance profiler. Polling slows down when the tab is in the background.

**19:10** · This is because timers are throttled.

**19:12** · Stop polling when it moves to the background, and restart when it returns to the foreground. Why are there no access logs when using the back button?

**19:21** · The cause is usually that it returned from the cache or the HTTP cache responded. If the network tab says " bfcache" after returning, it's the BF Cache; if "disk cache," it's the HTTP cache. Pages reach you from the server via Service Workers and the HTTP cache.

**19:39** · HTML is read by the parser and turned into the DOM. When it encounters a regular script, the parser stops reading. JavaScript runs on a single main thread in the event loop order, with screen rendering in between. V8 turns that JavaScript into bytecode and machines the parts used most often.

**19:59** · Pages moved to the background have their timers throttled and eventually stopped. When you navigate to another page, it might be kept in the BF Cache.

**20:08** · All the while, the page's JavaScript runs inside a sandboxed renderer with limited privileges. The once-empty big picture is now completely filled in.

**20:18** · This is the big picture of a browser.

**20:21** · Next time, we’ll map out when external text mixed into the page actually becomes a program. Please subscribe and hit the like button. See you next time.