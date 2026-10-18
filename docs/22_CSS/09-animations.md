# 9. CSSアニメーションとトランジション

## 目次
- [9.1 CSSアニメーションとは](#91-cssアニメーションとは)
- [9.2 トランジション](#92-トランジション)
- [9.3 アニメーション](#93-アニメーション)
- [9.4 キーフレーム](#94-キーフレーム)
- [9.5 Transform](#95-transform)
- [9.6 アニメーションの最適化](#96-アニメーションの最適化)
- [9.7 実践的なアニメーション例](#97-実践的なアニメーション例)
- [9.8 練習問題](#98-練習問題)

## 9.1 CSSアニメーションとは

CSSアニメーションは、HTML要素のスタイルを時間の経過とともに変化させる機能です。

### CSSアニメーションの利点

1. **パフォーマンス** - JavaScriptよりも効率的
2. **簡単な実装** - 複雑なコードが不要
3. **スムーズな動作** - ブラウザが最適化
4. **アクセシビリティ** - ユーザーの設定を尊重

### アニメーションの種類

```css
/* トランジション - 状態変化のアニメーション */
.button {
  background-color: blue;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: red;
}

/* アニメーション - 連続的な動き */
.spinner {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 9.2 トランジション

トランジションは、要素の状態変化をスムーズにアニメーション化します。

### 基本的なトランジション

```css
/* 単一プロパティのトランジション */
.button {
  background-color: #007bff;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #0056b3;
}
```

### トランジションのプロパティ

```css
.element {
  /* トランジションするプロパティ */
  transition-property: background-color, transform;
  
  /* トランジションの時間 */
  transition-duration: 0.3s;
  
  /* トランジションのタイミング関数 */
  transition-timing-function: ease;
  
  /* トランジションの遅延 */
  transition-delay: 0.1s;
}

/* ショートハンド */
.element {
  transition: background-color 0.3s ease 0.1s;
}
```

### トランジション可能なプロパティ

```css
/* 色関連 */
.element {
  transition: color 0.3s ease,
              background-color 0.3s ease,
              border-color 0.3s ease;
}

/* サイズ関連 */
.element {
  transition: width 0.3s ease,
              height 0.3s ease,
              padding 0.3s ease,
              margin 0.3s ease;
}

/* 位置関連 */
.element {
  transition: transform 0.3s ease,
              top 0.3s ease,
              left 0.3s ease;
}

/* 透明度 */
.element {
  transition: opacity 0.3s ease;
}

/* すべてのプロパティ */
.element {
  transition: all 0.3s ease;
}
```

### タイミング関数

```css
.element {
  /* 線形 - 一定の速度 */
  transition-timing-function: linear;
  
  /* イージング - 開始と終了が遅い */
  transition-timing-function: ease;
  
  /* イーズイン - 開始が遅い */
  transition-timing-function: ease-in;
  
  /* イーズアウト - 終了が遅い */
  transition-timing-function: ease-out;
  
  /* イーズインアウト - 開始と終了が遅い */
  transition-timing-function: ease-in-out;
  
  /* カスタムベジェ曲線 */
  transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### 実践例：カードホバーエフェクト

```css
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* ボタンのトランジション */
.button {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.button:active {
  transform: scale(0.95);
}
```

## 9.3 アニメーション

アニメーションは、キーフレームを使用して複雑な動きを作成します。

### 基本的なアニメーション

```css
.element {
  animation-name: slideIn;
  animation-duration: 1s;
  animation-timing-function: ease;
  animation-delay: 0s;
  animation-iteration-count: 1;
  animation-direction: normal;
  animation-fill-mode: none;
  animation-play-state: running;
}

/* ショートハンド */
.element {
  animation: slideIn 1s ease 0s 1 normal none running;
}
```

### アニメーションプロパティの詳細

```css
.element {
  /* アニメーション名 */
  animation-name: bounce;
  
  /* アニメーション時間 */
  animation-duration: 2s;
  
  /* タイミング関数 */
  animation-timing-function: ease-in-out;
  
  /* 遅延時間 */
  animation-delay: 0.5s;
  
  /* 繰り返し回数 */
  animation-iteration-count: 3;
  animation-iteration-count: infinite; /* 無限ループ */
  
  /* アニメーション方向 */
  animation-direction: normal; /* 通常 */
  animation-direction: reverse; /* 逆再生 */
  animation-direction: alternate; /* 往復 */
  animation-direction: alternate-reverse; /* 逆往復 */
  
  /* アニメーション終了後の状態 */
  animation-fill-mode: none; /* 初期状態に戻る */
  animation-fill-mode: forwards; /* 最終状態を保持 */
  animation-fill-mode: backwards; /* 開始状態を保持 */
  animation-fill-mode: both; /* 両方保持 */
  
  /* アニメーションの再生/停止 */
  animation-play-state: running; /* 再生中 */
  animation-play-state: paused; /* 停止中 */
}
```

### 複数のアニメーション

```css
.element {
  animation: 
    slideIn 1s ease,
    fadeIn 2s ease 1s,
    bounce 0.5s ease 3s infinite;
}
```

## 9.4 キーフレーム

キーフレームは、アニメーションの各段階でのスタイルを定義します。

### 基本的なキーフレーム

```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* パーセンテージでの指定 */
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  
  50% {
    transform: translateX(-50%);
    opacity: 0.5;
  }
  
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### 実践的なキーフレーム例

```css
/* フェードイン */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* スライドイン（上から） */
@keyframes slideInFromTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* バウンス */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-30px);
  }
  70% {
    transform: translateY(-15px);
  }
  90% {
    transform: translateY(-4px);
  }
}

/* パルス */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* ローテーション */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 色の変化 */
@keyframes colorChange {
  0% {
    background-color: red;
  }
  25% {
    background-color: yellow;
  }
  50% {
    background-color: blue;
  }
  75% {
    background-color: green;
  }
  100% {
    background-color: red;
  }
}
```

### 複雑なアニメーション

```css
/* 複数のプロパティを同時にアニメーション */
@keyframes complexAnimation {
  0% {
    transform: translateX(-100%) rotate(0deg);
    opacity: 0;
    background-color: red;
  }
  
  25% {
    transform: translateX(-50%) rotate(90deg);
    opacity: 0.5;
    background-color: yellow;
  }
  
  50% {
    transform: translateX(0) rotate(180deg);
    opacity: 1;
    background-color: blue;
  }
  
  75% {
    transform: translateX(50%) rotate(270deg);
    opacity: 0.5;
    background-color: green;
  }
  
  100% {
    transform: translateX(100%) rotate(360deg);
    opacity: 0;
    background-color: red;
  }
}
```

## 9.5 Transform

Transformは、要素の形状、サイズ、位置を変更するプロパティです。

### 基本的なTransform

```css
.element {
  /* 移動 */
  transform: translateX(50px);
  transform: translateY(-20px);
  transform: translate(50px, -20px);
  
  /* 回転 */
  transform: rotate(45deg);
  
  /* スケール */
  transform: scale(1.5);
  transform: scaleX(2);
  transform: scaleY(0.5);
  
  /* 傾斜 */
  transform: skewX(10deg);
  transform: skewY(5deg);
  transform: skew(10deg, 5deg);
}
```

### 複数のTransform

```css
.element {
  /* 複数のtransformを組み合わせ */
  transform: translateX(50px) rotate(45deg) scale(1.2);
  
  /* 3D変換 */
  transform: translateZ(100px) rotateX(45deg) rotateY(30deg);
}
```

### 3D Transform

```css
/* 3D空間の設定 */
.container {
  perspective: 1000px;
  perspective-origin: center;
}

.element {
  /* 3D移動 */
  transform: translateZ(100px);
  transform: translate3d(50px, 20px, 100px);
  
  /* 3D回転 */
  transform: rotateX(45deg);
  transform: rotateY(30deg);
  transform: rotateZ(60deg);
  transform: rotate3d(1, 1, 0, 45deg);
  
  /* 3Dスケール */
  transform: scaleZ(2);
  transform: scale3d(1.5, 1.5, 2);
}

/* 3Dスタイルの保持 */
.element {
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
```

### Transformの実践例

```css
/* ホバーエフェクト */
.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-10px) scale(1.05);
}

/* ローディングスピナー */
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* フリップカード */
.flip-card {
  width: 300px;
  height: 200px;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

## 9.6 アニメーションの最適化

### パフォーマンスの良いプロパティ

```css
/* 推奨されるプロパティ（GPU加速） */
.element {
  transform: translateX(100px);
  transform: scale(1.5);
  transform: rotate(45deg);
  opacity: 0.5;
}

/* 避けるべきプロパティ（CPU負荷が高い） */
.element {
  width: 100px; /* レイアウト再計算 */
  height: 100px;
  padding: 20px;
  margin: 10px;
  left: 100px; /* レイアウト再計算 */
  top: 100px;
}
```

### will-changeプロパティ

```css
/* ブラウザに変更を事前通知 */
.element {
  will-change: transform;
  will-change: opacity;
  will-change: transform, opacity;
}

/* 使用後はリセット */
.element {
  will-change: auto;
}
```

### アニメーションの制御

```css
/* ユーザーの設定を尊重 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* アニメーションの一時停止 */
.pause-animations {
  animation-play-state: paused;
}

/* 特定の要素のアニメーション無効化 */
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

## 9.7 実践的なアニメーション例

### ローディングアニメーション

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ローディングアニメーション</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="loading-container">
        <div class="spinner"></div>
        <div class="loading-text">読み込み中...</div>
    </div>
    
    <div class="content" style="display: none;">
        <h1>コンテンツが読み込まれました</h1>
        <p>アニメーションが完了しました。</p>
    </div>
</body>
</html>
```

```css
/* ローディングスピナー */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: white;
  margin-top: 20px;
  font-size: 18px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* コンテンツのフェードイン */
.content {
  padding: 40px;
  text-align: center;
  animation: fadeInUp 1s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### インタラクティブなカード

```html
<div class="card-container">
  <div class="card">
    <div class="card-image">
      <img src="image.jpg" alt="カード画像">
    </div>
    <div class="card-content">
      <h3>カードタイトル</h3>
      <p>カードの説明文がここに表示されます。</p>
      <button class="card-button">詳細を見る</button>
    </div>
  </div>
</div>
```

```css
.card-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.card {
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.card-image {
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .card-image img {
  transform: scale(1.1);
}

.card-content {
  padding: 20px;
}

.card-content h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
}

.card-content p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.5;
}

.card-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.card-button:active {
  transform: translateY(0);
}
```

### ナビゲーションメニュー

```html
<nav class="nav">
  <div class="nav-brand">Logo</div>
  <ul class="nav-menu">
    <li class="nav-item">
      <a href="#" class="nav-link">ホーム</a>
    </li>
    <li class="nav-item">
      <a href="#" class="nav-link">サービス</a>
    </li>
    <li class="nav-item">
      <a href="#" class="nav-link">会社概要</a>
    </li>
    <li class="nav-item">
      <a href="#" class="nav-link">お問い合わせ</a>
    </li>
  </ul>
</nav>
```

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-item {
  position: relative;
}

.nav-link {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.nav-link:hover::after {
  width: 100%;
}

/* アニメーション付きのドロップダウン */
.nav-item {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 1rem 0;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.nav-item:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}
```

## 9.8 練習問題

### 問題1: フェードインアニメーション
要素が下から上にフェードインするアニメーションを作成してください。

### 問題2: バウンスボール
重力を考慮したバウンスボールのアニメーションを作成してください。

### 問題3: ローディングドット
3つのドットが順番に点滅するローディングアニメーションを作成してください。

### 問題4: ホバーエフェクト
カードにマウスを乗せた時に3D回転するエフェクトを作成してください。

### 問題5: パララックス効果
スクロールに応じて背景が異なる速度で移動するパララックス効果を作成してください。

---

**次の章**: [10. CSS変数とカスタムプロパティ](10-variables.md)

**前の章**: [8. レスポンシブデザイン](08-responsive.md)

**目次に戻る**: [CSS教科書目次](00-CSS%20index.md) 