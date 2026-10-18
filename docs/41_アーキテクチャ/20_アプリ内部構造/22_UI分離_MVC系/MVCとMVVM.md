# MVCとMVVM — MVVM中心の比較

（MVC 系ノートの戸口: [[02_MVC_UI分離のまとめ]]）

## はじめに

画面を伴うアプリでは、**「表示」「操作」「データ」** をどう分けるかが大きな課題です。これを整理する定番が **MVC**（Model-View-Controller）と **MVVM**（Model-View-ViewModel）です。どちらも「画面まわりの関心を分離する」のが目的ですが、**分け方とデータの流れ** が違います。

**MVC の定義・各要素の詳細・実装例の長い解説**は [[33_MVCアーキテクチャとは]] にあります。このノートでは **MVC を短くおさえたうえで、MVVM との対比とコードのイメージ** を扱います。

---

## MVC（要点のみ）

- **Model**: データと業務ルール  
- **View**: 画面の見た目  
- **Controller**: 入力を受け、Model を操作し、View へ結果を渡す仲介  

典型的には **リクエスト → Controller → Model → View（テンプレート）** の一方向の流れが多いです（フレームワークによって View と Model の参照関係は変わります）。

詳細・図・例: [[33_MVCアーキテクチャとは]]。よくある層の混在: [[01_MVC違反とは]]。

---

## MVVM（Model-View-ViewModel）

### 構成

```
┌─────────┐ データバインディング ┌────────────┐
│  View   │ ←──────────→ │ ViewModel  │
│(画面)    │                │(画面用の状態)│
└─────────┘                └──────┬─────┘
                                   │
                                   ▼
                             ┌────────┐
                             │ Model  │
                             └────────┘
```

### 各要素

- **Model（モデル）**: データ・業務ルール（MVCと同じ）
- **View（ビュー）**: 画面の見た目（MVCと同じ）
- **ViewModel（ビューモデル）**: **Viewのための状態と、Viewが呼ぶ操作** を提供する

### 特徴: データバインディング

ViewとViewModelが **双方向にバインディング** されているのが最大の特徴。

- ViewModelの値が変わる → View が自動更新
- Viewで入力される → ViewModel の値が自動更新

これにより、Controllerに相当する **「橋渡しコード」をほぼ書かなくて済みます**。

### 得意なこと

- GUI・デスクトップアプリ（WPF, .NET MAUI）
- モバイル（SwiftUI, Jetpack Compose）
- SPA（Vue, Angular, 現代的な React + 状態管理）

---

## MVC vs MVVM

| 項目 | MVC | MVVM |
|------|-----|------|
| 間に挟むもの | Controller | ViewModel |
| データの流れ | 主に一方向 | 双方向バインディング |
| Viewの知識 | View が Model を知る（古典的） | View は ViewModel だけ知る |
| テスト容易性 | Controllerが重くなりがち | ViewModel はUI抜きでテスト可能 |
| 向く場面 | サーバサイドWeb | GUI / SPA |

---

## 派生パターン

### MVP（Model-View-Presenter）

- Presenter が View を「直接操作」する
- View は **受け身**（ダンプビュー）
- テストしやすい

### Flux / Redux

- Reactと一緒に使われる **一方向データフロー**
- 「Action → Reducer → Store → View」の流れ
- MVC/MVVMとは違う発想だが、**関心の分離** は同じ

### Clean Architecture

MVC/MVVMより広い範囲を扱う。詳しくは [[クリーンアーキテクチャの概要]]。

---

## コード例: 同じ要件を3通りで書く

### 要件

「カウンターの数を +1 するボタン」

### MVC風（Webサーバ）

```javascript
// Model
class Counter { constructor() { this.count = 0; } }

// View（HTML）
// <button action="/increment">+</button><span>{{count}}</span>

// Controller
app.post('/increment', (req, res) => {
  model.count += 1;
  res.render('view', model);
});
```

### MVVM風（Vue）

```javascript
// ViewModel
const vm = reactive({
  count: 0,
  increment() { vm.count += 1; }
});

// View（Vueテンプレート）
// <button @click="increment">+</button><span>{{ count }}</span>
// → countの変更が自動で画面に反映
```

### Redux風

```javascript
// Reducer
function reducer(state = { count: 0 }, action) {
  if (action.type === 'INCREMENT') return { count: state.count + 1 };
  return state;
}

// View
<button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
<span>{state.count}</span>
```

---

## よくある誤解

### 誤解1: MVCは「Webアプリ全体の構造」である

MVCは **画面まわり** のパターン。DBアクセスやドメインロジックは **Modelの中か、別レイヤー** に置きます。「M」を単なるDBモデルと混同すると責務が崩れます。

### 誤解2: MVVMの ViewModel は View のロジック

ViewModel は **View に必要な状態・操作を提供する場所** です。ビジネスルールは Model 側に持たせます。

### 誤解3: どちらかが常に優れている

- サーバサイドでHTMLを返すなら MVC
- 動的GUI / SPA なら MVVM
というように **用途で選ぶ** のが正解。

---

## 関連ノート

- [[02_MVC_UI分離のまとめ]]
- [[33_MVCアーキテクチャとは]]
- [[01_MVC違反とは]]
- [[三層アーキテクチャ]]
- [[レイヤードアーキテクチャ]]
- [[クリーンアーキテクチャの概要]]
- [[01_関心の分離]]
