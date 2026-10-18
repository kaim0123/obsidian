---
title: "どう動く？ログラムがCPUで動く流れを図解でゼロから｜レジスタ・キャッシュ・スレッド【CPU内部・完全図解】"
source: "https://www.youtube.com/watch?v=MEGbDtu0pYc"
author:
  - "[[ぎゅぎゅっとテック]]"
published: 2026-10-11
created: 2026-10-18
description: "アプリのボタンを押したとき、サーバーの CPU の中では何が起きているのか。コードを書いていても、CPU の中を説明できる人は多くありません。この動画では、CPU のふたを開けて、トランジスタから順に積み上げます。コンパイルした機械語がメモリに置かれ、コアがプログラムカウンタの指す命令を、取り出し・読み解き・実行していく様子を、1 命令ずつ追います。そのうえで、スタックとヒープ、スレッド"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=MEGbDtu0pYc)

アプリのボタンを押したとき、サーバーの CPU の中では何が起きているのか。  
コードを書いていても、CPU の中を説明できる人は多くありません。  
  
この動画では、CPU のふたを開けて、トランジスタから順に積み上げます。  
コンパイルした機械語がメモリに置かれ、コアがプログラムカウンタの指す命令を、取り出し・読み解き・実行していく様子を、1 命令ずつ追います。  
そのうえで、スタックとヒープ、スレッドと割り込み、システムコール、キャッシュのヒットとミス、データの持ち方で速さが変わる理由までつなげます。  
最後は Go で、\[\]Order と \[\]\*Order の合計を go test -bench と pprof で測り、遅さの原因を確かめます。  
  
▼ こんな人に  
・コードは書けるが、CPU・メモリ・キャッシュの関係を説明できない  
・レジスタ、スタック、スレッドという言葉は知っているが、つながっていない  
・同じ処理なのに、データの持ち方で速さが変わる理由を知りたい  
  
▼ チャプター  
0:00 導入  
0:25 第 1 部 プログラムが動くまで  
1:11 第 2 部 CPU のふたの下  
1:40 第 3 部 CPU は何でできているか  
3:06 第 4 部 レジスタ  
4:00 第 5 部 命令が進む  
6:23 第 6 部 スレッド  
7:59 第 7 部 キャッシュ  
9:43 第 8 部 メモリ  
10:13 第 9 部 Go で測って速くする  
11:28 まとめ  
  
▼ 手元の実験について  
機械語は、手元の Mac（Apple M4 Pro）で C の小さな関数を clang -O1 でコンパイルした実物です（Arm 64 ビット）。  
第 9 部の時間は、手元の Mac で Go 1.23 の go test -bench で測った値です。約 100 万件の注文（1 件 64 バイト）を合計しています。結果は CPU やデータの量で変わります。  
CPU の図は一般的な概念図です。部品の配置や段の数は製品によって違います。  
  
▼ 出典  
・Arm Architecture Reference Manual for A-profile architecture（AArch64 の命令とレジスタ）  
・The Go Programming Language: testing パッケージ、runtime/pprof、go tool pprof のドキュメント  
  
#CPU #Go #プログラミング  
#ぎゅぎゅテク  
#ぎゅぎゅっとテック

## 詳しい要約

**テーマ：プログラムが CPU で動く流れを、トランジスタからキャッシュ・メモリまで積み上げて理解する**

コンパイルされた機械語はメモリに置かれ、コアはプログラムカウンタが指す命令を「取り出し・読み解き・実行」して進む。データはレジスタ・キャッシュ・メモリの階層を流れ、同じ合計処理でも**データの持ち方**でキャッシュヒット率が変わり、何倍も速さが違う。最後に Go で `[]Order` と `[]*Order` の合計を測り、遅さの原因がポインタそのものではなく「次のデータまでの距離」だと確かめる。

---

### 第 1〜2 部 プログラムが動くまで／CPU のふたの下

- 書いたコードはコンパイラで**機械語**（CPU が命令として読める数の列）になる。例：足し算命令は `8B 08 01 28` の 4 つの数。
- 機械語は実行ファイルとしてディスクに保存され、起動すると OS がその中身を**メインメモリ**にコピーする。CPU はメモリ上の命令を 1 つずつ読んで実行する。
- メモリは番号付きの箱の長い列で、番号を**アドレス**と呼ぶ。命令もデータも同じメモリのどこかのアドレスに置かれる。
- CPU のふたの下はシリコンのチップで、**コア・キャッシュ・メモリへの出入口**が 1 枚に作り込まれている。主役のコアは命令を読んで実行する部品で、それぞれ独立して動く。手元の Mac は高速コア 10 個と省電力コア 4 個を使い分ける。

### 第 3 部 CPU は何でできているか

- 一番下にあるのは**トランジスタ**という電気で開閉するスイッチ。電気が流れていれば 1、なければ 0。
- トランジスタをつなぐと**論理ゲート**になる（AND・OR・NOT・XOR）。1 ビットの足し算は 1 の位の XOR と繰り上がりで作れ、繰り上がりを受け取れるようにして 64 個つなぐと 64 ビット加算になる。**ALU の正体はゲートの組み合わせ**。
- ゲートの出力を入力に戻すループで 0/1 を覚えられる。これが**フリップフロップ**で、64 個並べるとレジスタ 1 つになる。クロックの合図で一斉に更新される。
- 取り出し・読み解き・計算・保存の部品を組み合わせてコアを作り、コアを並べてキャッシュとメモリインターフェースにつなぐと CPU になる。中には数十億個のトランジスタがある。

### 第 4 部 レジスタ

- コアの中に並ぶ小さな記憶場所。計算に使う値はメモリではなく**レジスタ**に置き、メモリ → レジスタに読み込み → ALU で計算 → レジスタに戻す → 必要ならメモリへ書き戻す。
- この Mac の CPU は自由に使える**汎用レジスタが 31 個**、各 64 ビット（8 バイト）。
- 特別な役割のレジスタ：次の命令のアドレスを持つ**プログラムカウンタ**、スタックの位置を持つ**スタックポインタ**、計算結果がゼロか負かを記録する**フラグ**。CPU がどこまで進んだかはこれらの値で決まる。数は少ないが CPU 内で最速の記憶場所。

### 第 5 部 命令が進む

- コアには、命令を取り出すフェッチユニット、読み解くデコーダ、ALU などの実行ユニット、レジスタがある。
- 配列の合計ループは 4 命令になる：①x0 が指すメモリの値を x8 に読み込む → ②x8 を x9 に足す → ③残り回数 x1 から 1 引き、ゼロかどうかをフラグに記録 → ④条件分岐（まだゼロでなければプログラムカウンタをループの先頭に書き戻す）。1 命令 4 バイトなのでプログラムカウンタは 4 ずつ進む。
- CPU にとっては **if も for も「プログラムカウンタの書き換え」**にすぎない。
- 関数呼び出しでは戻り先アドレスを **X30（リンクレジスタ）**に保存して関数の先頭へ飛び、終わったら X30 のアドレスに戻る。関数の中でさらに関数を呼ぶと X30 が上書きされるので、**スタック**に X30 とローカル変数を積み（push）、出るときに取り出す（pop）。積みすぎて領域をあふれると**スタックオーバーフロー**。
- プログラムのメモリは**命令・データ・ヒープ・スタック**に分かれる。関数内の変数はスタックに置かれ関数を出ると消える。関数を出た後も残したいデータは**ヒープ**に置き、必要なときに確保・不要になったら返す。返し忘れを自動で片付けるのが **GC**。
- コアは命令を流れ作業のように段を重ねて処理する（**パイプライン**）。クロックが刻むたびに 1 段進む。

### 第 6 部 スレッド

- **スレッド**はコアの中の物理部品ではなく、コアが実行している命令の流れ。OS がスレッドをコアに載せると、そのコアがその命令を実行し始める。1 つのコアが同時に処理できるのは 1 スレッドだけ。
- スレッドがデータ読み込みを待つと、OS はそれをコアから外して別のスレッドを載せる。このときプログラムカウンタを含む全レジスタの値を保存し、次のスレッドの値を読み込む（**コンテキストスイッチ**）。**スレッドの正体はレジスタの値の組**。だからコア数より多いスレッドも、少しずつ入れ替えて同時に動いているように見える。
- 動いているスレッドを止めるのは**割り込み**。タイマーが一定間隔で CPU に信号を送ると、CPU は今の命令の流れを止めて OS のプログラムへ飛び、OS がコンテキストスイッチを行う。
- CPU には**ユーザーモードとカーネルモード**がある。通常のプログラムはユーザーモードで動き、ファイルやネットワーク通信には直接触れず、**システムコール**でカーネルモードの OS に頼む。
- API リクエストも同じで、DB の応答を待つ間スレッドはコアを手放し、別のリクエストが使う。だから少ないコアで多くのリクエストをさばける。ただし全リクエストが重い計算なら順番待ちになる。

### 第 7 部 キャッシュ

- コアは非常に速いがメモリは遠く、データの到着を待たされる。そこでよく使うデータをコアのすぐそばに置くのが**キャッシュ**。

| 階層 | 位置・共有 | 特徴 |
|---|---|---|
| L1 | コアのすぐ隣、各コア専用。命令用とデータ用に分かれる | 最小・最速 |
| L2 | その外側、いくつかのコアで共有 | より大きく遅い |
| L3 | さらに外、全コアで共有（多くのサーバー CPU） | 最大・最も遅い |

- コアはまず L1 を探し、見つかれば**キャッシュヒット**。なければ L2・L3・メモリへと探しに行く（**キャッシュミス**）。
- レジスタは命令が名前で直接使う記憶場所、キャッシュは CPU が自動で使う記憶場所。
- キャッシュはデータを 1 つずつではなく**ブロック単位**で運ぶ（この Mac では 128 バイト）。1 つ読むと隣も一緒に来るので、同じデータの再利用や隣接データの順番読みが速い（**局所性**）。
- **配列**はデータがメモリ上に連続しているので、次のデータが既にキャッシュにある。**連結リスト**などポインタでたどる構造はデータがメモリに散らばり、今のデータを読むまで次の場所が分からないためキャッシュミスしやすい。

### 第 8 部 メモリ

- キャッシュにないデータはメモリインターフェースを通ってメモリから取ってくる。メモリは大きいがコアから最も遠い。
- プログラムが使うアドレスは本物のメモリのアドレスではなく、各プログラムは自分専用の**アドレス空間**を見ている。CPU 内の **MMU** が本物のアドレスに変換し、プログラム同士がメモリを壊し合わないようにしている。

### 第 9 部 Go で測って速くする

1. 約 100 万件の注文の金額を合計する。値を持つスライス `[]Order` とポインタを持つスライス `[]*Order` を用意し、両方をユーザー順に並べ替えて `go test -bench` で測る → **ポインタのスライスが何倍も遅い**。
2. **pprof** でボトルネックを探す → ポインタのスライスを回す関数で金額を読む部分にほとんどの時間がかかっていた。ポインタの指す注文を読むたびに待たされている。
3. ポインタが原因か確かめるため、並べ替えずに元の順で測る → 値のスライスとほぼ同じ速さ。
- 遅さの原因は**ポインタそのものではなく、次のデータまでの距離**。並べ替えで動いたのはポインタだけで、注文データは作られた場所に残ったままなので、ユーザー順にたどるとメモリを飛び回りキャッシュミスが起きる。値のスライスなら並べ替えでデータ自体が動き、キャッシュラインに隣り合ってヒットする。
- Go の GC は散らばったデータを詰め直さないので、**よく読むデータは値のスライスに持つ**とよい。

### まとめ

- プログラムはメモリに置かれた命令の列。コアは**プログラムカウンタ**が指す命令を取り出し・読み解き・実行して進む。
- データは**レジスタ → キャッシュ → メモリ**の階層を流れる。
- 練習問題：小さな配列を繰り返し合計するのと、大きなメモリの散らばった場所を読むのはどちらが速いか → **小さな配列の繰り返し**。一度キャッシュに入ったデータを何度も再利用できるから。
- CPU の仕組みが分かると、コードのどこが遅くなるかを予測できる。

## Transcript

### 導入

**0:00** · When you press a button in an app, the process runs on a CPU in some server.

**0:05** · So, what is inside that CPU? This is an overview of the CPU's internal structure. The core, the cache, and the gateway to the memory. Let’s open up this diagram, starting from the outside . Even for the same summation process, how you store the data can make it many times slower. The reason for that is also in this diagram. How does a program actually start running? The code you write is turned into machine language by a compiler. Machine language is a sequence of numbers that the CPU can read as instructions.

### 第 1 部 プログラムが動くまで

**0:34** · For example, this addition instruction is the four numbers 8B 08 01 28. Machine language is saved on the disk as an executable file. When you start a program, the OS copies its contents into main memory. The CPU reads and executes the instructions placed in memory one by one. Main memory is a long row of boxes, each numbered individually. These numbers are called addresses.

**1:02** · Both instructions and data are placed at some address in the same memory. The CPU specifies an address to read from or write to the memory. What is underneath the CPU cover? Remove the cover, and you will find a silicon wafer. The core, cache, and memory gateway are all built into this single piece. The main star is the core. It is the component that reads and executes instructions, with each one operating independently.

### 第 2 部 CPU のふたの下

**1:30** · This Mac has 10 fast cores and 4 low-power cores, switching between prioritizing speed and saving electricity. What is the CPU made of?

### 第 3 部 CPU は何でできているか

**1:44** · Let's zoom into the ALU inside the core that performs calculations. If you go down to the very bottom, what you find are tiny switches called transistors. A transistor is a switch that opens and closes with electricity. If electricity is flowing, it's 1; if not, it's 0. All information inside a CPU is represented by these 0s and 1s. Connecting a few transistors creates a logic gate. An AND gate outputs 1 only when both inputs are 1. OR outputs 1 if either is 1, and NOT flips 0s and 1s.

**2:11** · XOR outputs 1 only when the two inputs are different. By combining these gates, you can perform addition. A 1-bit addition is just an XOR gate for the ones place and a carry-out. By setting it up to accept carries and connecting 64 of them, you get 64-bit addition.

**2:31** · The true nature of an ALU is just a combination of these gates. Feeding a gate's output back into its input creates a loop that can remember a 0 or 1. We call this a flip-flop. Arranging 64 of these makes a single register.

**2:46** · They all update simultaneously at the signal of the clock. A core is built by combining these circuits into components that fetch, decode, compute, and store. A CPU is created by lining up cores and connecting them to caches and memory interfaces. Inside, there are billions of transistors. The smallest storage space inside a CPU.

### 第 4 部 レジスタ

**3:10** · Inside the core, small storage spaces called registers are lined up. Values used for calculations are stored in registers, not in memory. Data is read from memory into registers, the ALU calculates the values, and the result is returned to the registers. If necessary, it is written back to memory . This Mac's CPU has 31 general-purpose registers that can be used freely. Each one is 64 bits, or 8 bytes. There are also registers with special roles.

**3:39** · There is the program counter, which holds the address of the next instruction; the stack pointer, which holds the stack position; and flags that record if a calculation result is zero or negative. How far the CPU has progressed is determined by the values in these registers. Registers are few in number, but they are the fastest storage in the CPU. How do instructions proceed?

### 第 5 部 命令が進む

**4:01** · Inside the core, there is a fetch unit to retrieve instructions, a decoder to interpret them, execution units like the ALU for calculations, and registers. Let's actually run a loop that calculates the sum of an array. When compiled, the loop consists of these four instructions. First, an instruction is fetched from where the program counter points. The decoder interprets this as an instruction to read from memory. When executed, the value pointed to by x0 is loaded into x8.

**4:34** · The program counter advances by 4 to point to the next instruction. This is because each instruction is 4 bytes long. Next is an instruction to add x9 to x8. The one after that is an instruction to subtract 1 from the remaining count x1. Whether the result is zero is recorded in the flags.

**4:51** · Finally, there is conditional branching . If the flag shows it isn't zero yet, the program counter is rewritten back to the start of the loop. For the CPU, both "if" statements and "for" loops just mean rewriting the program counter . The same applies when calling functions. It saves the return address in a register called X30, then jumps to the start of the function. X30 is a register meant for remembering return addresses, known as the link register.

**5:18** · When the function ends, it returns to the address held in X30. If you call another function inside a function, the return address in X30 gets overwritten.

**5:28** · That is where the stack comes in. It uses a portion of memory for stacking data, with a pointer indicating the top position. When entering a function, we push X30 and local variables onto the stack. When exiting a function, we pop those items off to restore them. The deeper the function calls go, the higher the stack piles up. If it piles up too much and overflows the designated area, that is a stack overflow. Program memory is divided into instructions, data, heap, and stack.

**5:57** · Variables inside a function are placed on the stack and vanish when exiting the function. Data you want to keep after exiting a function is placed on the heap. You allocate the heap when needed and return it when it is no longer required. Automatically cleaning up what you forget to return is what GC does. Cores process instructions in overlapping stages, like an assembly line. This is called a pipeline. The assembly line advances one step every time the clock ticks. A thread running on a core is a sequence of instructions the core is executing. This is a thread .

### 第 6 部 スレッド

**6:30** · A thread is not a physical component inside a core. When the OS loads a thread onto a core, that core begins executing its instructions. A single core can only process one thread at a time. When a thread waits for data reads, the OS removes it from the core and loads another thread. When swapping , it saves all register values, including the program counter, and loads the next thread's values. This is called a context switch. The true nature of a thread is just this set of register values.

**7:02** · That is why, even if there are more threads than cores, they appear to run simultaneously by swapping and advancing bit by bit. So, how does the OS stop a running thread?

**7:15** · The CPU has a mechanism called an interrupt. When a timer sends a signal to the CPU at fixed intervals, the CPU stops its current instruction flow and jumps to the OS program. The OS then performs a context switch for the threads. The CPU has two operating modes: user mode and kernel mode.

**7:34** · Regular programs run in user mode and cannot directly access sensitive items like files or network communications.

**7:40** · When access is needed, they use a system call to request it from the OS in kernel mode. API requests work the same way. While waiting for a database response, a thread releases the core, and another request uses it. That is why many requests can be handled even with few cores. If all requests involve heavy computation, they must wait in line. Why is cache necessary? Cores are extremely fast, but memory is far away, forcing them to wait for data to arrive . So, we keep frequently used data right next to the core. This is the cache.

### 第 7 部 キャッシュ

**8:13** · The one right next to the core is the Level 1 cache. It's called L1.

**8:18** · Divided into instruction and data caches, each core has its own. The L2 cache outside of that is shared by several cores. Many server CPUs also have an L3 cache further out, shared by all cores. The higher the number, the larger and slower it becomes. When a core reads data, it searches L1 first.

**8:37** · If found, it can be used immediately.

**8:40** · This is a cache hit. If not, it goes on to search L2, L3, and eventually memory . This is a cache miss. Incidentally, registers are storage spaces used directly by instructions via names. The cache is a storage space that the CPU uses automatically. Cache moves data not one by one, but in blocks. This Mac's block size is 128 bytes. When you read one piece of data, its neighbors arrive along with it. That is why reusing the same data and reading adjacent data sequentially leads to speed. This is called locality.

**9:11** · How data is arranged also affects speed. In an array, data is lined up consecutively in memory. Reading one fetches the whole block, so the next piece of data is already in the cache.

**9:27** · Structures followed by pointers, like linked lists, have data scattered throughout memory. The next location isn't known until the current data is read. This makes them prone to cache misses during reads. Even with the same data, the layout changes the CPU speed.

### 第 8 部 メモリ

**9:44** · Where does data come from? Data not in the cache is fetched from memory through the memory interface. Memory is large but is the storage furthest from the core. Actually, the addresses programs use are not the real memory addresses. Each program sees its own dedicated address space. The MMU inside the CPU translates these to real memory addresses. This prevents programs from accidentally corrupting each other's memory. Measure with Go to truly optimize it.

### 第 9 部 Go で測って速くする

**10:14** · Let's use Go to investigate the mystery from the start.

**10:19** · Sum the totals of about one million orders. We use a slice holding values and a slice holding pointers. We sort both by user and measure them with Go's testing benchmark. The slice of pointers was many times slower. We use pprof to find out where the bottleneck is. Most of the time was spent reading amounts in the function iterating over the pointer slice. It seems it has to wait every time it reads an order the pointer points to. To confirm if pointers are the cause, we measure the pointer slice in its original order.

**10:54** · The result was almost as fast as the value slice. The cause of the slowness wasn't the pointer itself, but the distance to the next data. Only the pointers moved during sorting. The order data remained where it was created, so following the user order causes memory jumps and cache misses.

**11:14** · With a value slice, sorting moves the data itself, keeping it adjacent in the cache line for hits. Go's GC doesn't defragment scattered data, so keep frequently accessed data in value slices. To summarize. A program is a sequence of instructions placed in memory. The core fetches instructions pointed to by the program counter, decodes, executes, and moves on. Data flows through the hierarchy of registers, cache, and memory. Finally, a practice problem.

### まとめ

**11:45** · Which is faster: summing a small array repeatedly, or reading scattered locations in large memory? Which component is involved?

**11:59** · The answer is summing the small array repeatedly. Because data once in the cache can be reused many times. Reading from scattered locations forces you to fetch from memory every single time.

**12:09** · Understanding CPU architecture lets you predict which parts of your code will slow down. Please subscribe and hit the like button. See you next time.