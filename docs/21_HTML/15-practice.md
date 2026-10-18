# 第10章：実践練習

## 📖 この章で学ぶこと

- 総合的なHTMLスキルの確認
- 実践的なWebページの作成
- 学習内容の復習

---

## 🎯 練習問題1：個人プロフィールページ

### 課題
自分のプロフィールページを作成してください。

### 必要な要素
- 見出し（h1, h2）
- 段落（p）
- 画像（img）
- リスト（ul, ol）
- リンク（a）
- テーブル（table）

### サンプルコード
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>私のプロフィール</title>
</head>
<body>
    <h1>私のプロフィール</h1>
    
    <h2>基本情報</h2>
    <table border="1" cellpadding="8">
        <tr>
            <th>項目</th>
            <th>内容</th>
        </tr>
        <tr>
            <td>名前</td>
            <td>山田太郎</td>
        </tr>
        <tr>
            <td>年齢</td>
            <td>25歳</td>
        </tr>
        <tr>
            <td>出身地</td>
            <td>東京都</td>
        </tr>
    </table>
    
    <h2>自己紹介</h2>
    <p>こんにちは！私は<strong>プログラミング</strong>が好きな<em>Webデザイナー</em>です。</p>
    
    <h2>趣味</h2>
    <ul>
        <li>プログラミング</li>
        <li>読書</li>
        <li>旅行</li>
    </ul>
    
    <h2>スキル</h2>
    <ol>
        <li>HTML/CSS</li>
        <li>JavaScript</li>
        <li>Photoshop</li>
    </ol>
    
    <h2>リンク</h2>
    <p><a href="https://github.com/example" target="_blank">GitHub</a></p>
    <p><a href="mailto:example@email.com">メールを送る</a></p>
</body>
</html>
```

---

## 🎯 練習問題2：レストランのメニューページ

### 課題
レストランのメニューページを作成してください。

### 必要な要素
- 見出し（h1, h2, h3）
- テーブル（table）
- 画像（img）
- リスト（ul）
- リンク（a）

### サンプルコード
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>レストラン サンプル - メニュー</title>
</head>
<body>
    <h1>レストラン サンプル</h1>
    
    <nav>
        <ul>
            <li><a href="#appetizers">前菜</a></li>
            <li><a href="#main-dishes">メインディッシュ</a></li>
            <li><a href="#desserts">デザート</a></li>
            <li><a href="#drinks">ドリンク</a></li>
        </ul>
    </nav>
    
    <h2 id="appetizers">前菜</h2>
    <table border="1" cellpadding="10" cellspacing="0" width="600">
        <tr>
            <th>料理名</th>
            <th>価格</th>
            <th>説明</th>
        </tr>
        <tr>
            <td>シーザーサラダ</td>
            <td>800円</td>
            <td>新鮮なレタスとパルメザンチーズ</td>
        </tr>
        <tr>
            <td>スープ・ド・ポワソン</td>
            <td>600円</td>
            <td>季節の魚介を使用したスープ</td>
        </tr>
    </table>
    
    <h2 id="main-dishes">メインディッシュ</h2>
    <table border="1" cellpadding="10" cellspacing="0" width="600">
        <tr>
            <th>料理名</th>
            <th>価格</th>
            <th>説明</th>
        </tr>
        <tr>
            <td>ステーキ</td>
            <td>2,500円</td>
            <td>厳選された和牛を使用</td>
        </tr>
        <tr>
            <td>パスタ・カルボナーラ</td>
            <td>1,200円</td>
            <td>生クリームとベーコンの組み合わせ</td>
        </tr>
    </table>
    
    <h2 id="desserts">デザート</h2>
    <ul>
        <li>ティラミス - 600円</li>
        <li>チョコレートケーキ - 500円</li>
        <li>アイスクリーム - 400円</li>
    </ul>
    
    <h2 id="drinks">ドリンク</h2>
    <ul>
        <li>コーヒー - 400円</li>
        <li>紅茶 - 400円</li>
        <li>ジュース - 300円</li>
    </ul>
    
    <footer>
        <p><a href="tel:03-1234-5678">03-1234-5678</a></p>
        <p><a href="mailto:info@restaurant.com">お問い合わせ</a></p>
    </footer>
</body>
</html>
```

---

## 🎯 練習問題3：お問い合わせフォーム

### 課題
完全なお問い合わせフォームを作成してください。

### 必要な要素
- フォーム（form）
- 各種入力フィールド（input）
- ラベル（label）
- テキストエリア（textarea）
- セレクトボックス（select）

### サンプルコード
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>お問い合わせフォーム</title>
</head>
<body>
    <h1>お問い合わせフォーム</h1>
    
    <form action="/contact" method="post" style="max-width: 500px; margin: 0 auto;">
        <div style="margin-bottom: 15px;">
            <label for="name" style="display: block; margin-bottom: 5px;">お名前：</label>
            <input type="text" id="name" name="name" required style="width: 100%; padding: 8px; border: 1px solid #ccc;">
        </div>
        
        <div style="margin-bottom: 15px;">
            <label for="email" style="display: block; margin-bottom: 5px;">メールアドレス：</label>
            <input type="email" id="email" name="email" required style="width: 100%; padding: 8px; border: 1px solid #ccc;">
        </div>
        
        <div style="margin-bottom: 15px;">
            <label for="phone" style="display: block; margin-bottom: 5px;">電話番号：</label>
            <input type="tel" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}" placeholder="000-0000-0000" style="width: 100%; padding: 8px; border: 1px solid #ccc;">
        </div>
        
        <div style="margin-bottom: 15px;">
            <label for="subject" style="display: block; margin-bottom: 5px;">件名：</label>
            <select name="subject" id="subject" required style="width: 100%; padding: 8px; border: 1px solid #ccc;">
                <option value="">選択してください</option>
                <option value="general">一般的なお問い合わせ</option>
                <option value="support">サポート</option>
                <option value="business">ビジネス</option>
                <option value="other">その他</option>
            </select>
        </div>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">お問い合わせの種類：</label>
            <input type="radio" name="type" value="question" id="question">
            <label for="question">質問</label>
            <input type="radio" name="type" value="request" id="request">
            <label for="request">ご要望</label>
            <input type="radio" name="type" value="complaint" id="complaint">
            <label for="complaint">苦情</label>
        </div>
        
        <div style="margin-bottom: 15px;">
            <label for="message" style="display: block; margin-bottom: 5px;">メッセージ：</label>
            <textarea name="message" id="message" rows="5" required style="width: 100%; padding: 8px; border: 1px solid #ccc;" placeholder="お問い合わせ内容を入力してください"></textarea>
        </div>
        
        <div style="margin-bottom: 15px;">
            <input type="checkbox" name="newsletter" id="newsletter">
            <label for="newsletter">ニュースレターの配信を希望する</label>
        </div>
        
        <input type="submit" value="送信" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer;">
    </form>
</body>
</html>
```

---

## 🎯 練習問題4：ブログ記事ページ

### 課題
ブログ記事のページを作成してください。

### 必要な要素
- 見出し（h1, h2, h3）
- 段落（p）
- 画像（img）
- リスト（ul, ol）
- リンク（a）
- コメント（<!-- -->）

### サンプルコード
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML学習記録 - プログラミングブログ</title>
</head>
<body>
    <!-- ヘッダー部分 -->
    <header>
        <h1>プログラミング学習ブログ</h1>
        <nav>
            <ul>
                <li><a href="index.html">ホーム</a></li>
                <li><a href="about.html">自己紹介</a></li>
                <li><a href="contact.html">お問い合わせ</a></li>
            </ul>
        </nav>
    </header>
    
    <!-- メインコンテンツ -->
    <main>
        <article>
            <h1>HTML学習記録 - 第1週目</h1>
            
            <p><strong>投稿日：</strong>2024年1月15日</p>
            
            <h2>今週学んだこと</h2>
            <p>HTMLの基礎を学び始めました。最初は難しく感じましたが、少しずつ理解できるようになってきました。</p>
            
            <h3>学習したタグ</h3>
            <ul>
                <li><code>&lt;h1&gt;</code> - 見出し</li>
                <li><code>&lt;p&gt;</code> - 段落</li>
                <li><code>&lt;a&gt;</code> - リンク</li>
                <li><code>&lt;img&gt;</code> - 画像</li>
            </ul>
            
            <h3>作成したページ</h3>
            <ol>
                <li>自己紹介ページ</li>
                <li>学習記録ページ</li>
                <li>リンク集ページ</li>
            </ol>
            
            <h2>次週の目標</h2>
            <p>CSSの学習を始めて、HTMLページをより美しく装飾できるようになりたいと思います。</p>
            
            <h2>参考リンク</h2>
            <ul>
                <li><a href="https://developer.mozilla.org/ja/docs/Web/HTML" target="_blank">MDN Web Docs - HTML</a></li>
                <li><a href="https://www.w3schools.com/html/" target="_blank">W3Schools HTML Tutorial</a></li>
            </ul>
        </article>
    </main>
    
    <!-- フッター部分 -->
    <footer>
        <p>&copy; 2024 プログラミング学習ブログ. All rights reserved.</p>
        <p><a href="mailto:blog@example.com">お問い合わせ</a></p>
    </footer>
</body>
</html>
```

---

## 🎯 練習問題5：総合問題

### 課題
これまで学んだすべての要素を使用して、完全なWebサイトを作成してください。

### 要件
1. **ホームページ（index.html）**
   - ナビゲーションメニュー
   - メインコンテンツ
   - フッター

2. **会社概要ページ（about.html）**
   - 会社情報のテーブル
   - 従業員一覧
   - 会社の歴史

3. **商品ページ（products.html）**
   - 商品一覧テーブル
   - 商品画像
   - 価格情報

4. **お問い合わせページ（contact.html）**
   - 完全なフォーム
   - 会社情報
   - 地図情報

### 評価ポイント
- HTMLの構造が正しいか
- 適切なタグを使用しているか
- セマンティックなHTMLになっているか
- レスポンシブ対応しているか
- アクセシビリティを考慮しているか

---

## 📝 学習の振り返り

### 学んだことの確認
1. **HTMLの基本構造**
   - DOCTYPE宣言
   - html, head, body要素
   - 文字エンコーディング

2. **テキスト要素**
   - 見出し（h1-h6）
   - 段落（p）
   - テキスト装飾（strong, em, mark等）

3. **リンクと画像**
   - リンク（a）
   - 画像（img）
   - 適切な属性の使用

4. **リストとテーブル**
   - 順序付きリスト（ol）
   - 順序なしリスト（ul）
   - 定義リスト（dl）
   - テーブル（table, tr, td, th）

5. **フォーム**
   - フォーム要素（form）
   - 入力フィールド（input）
   - 検証機能

### 次のステップ
- CSSの学習
- JavaScriptの学習
- レスポンシブデザイン
- アクセシビリティ
- SEO対策

---

## 🎉 お疲れさまでした！

HTMLの基礎を学び終えました。これで基本的なWebページを作成できるようになりました。

次のステップとして、CSSを学んでWebページを美しく装飾したり、JavaScriptを学んで動的な機能を追加したりすることをお勧めします。

継続的な学習と実践を通じて、さらにスキルを向上させていってください！

---

**前の章：** [[09-forms|第9章：フォームの作成]] | **目次に戻る：** [[00-HTML index|HTMLプログラミング入門]] 