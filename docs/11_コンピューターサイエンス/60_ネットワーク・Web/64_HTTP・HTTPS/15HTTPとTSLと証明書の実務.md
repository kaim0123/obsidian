# HTTPSとTLSと証明書の実務

## この章の目的
HTTPSやTLSの仕組みを知ったうえで、**実際にサーバーへ証明書を導入・運用する**ための具体的な手順と注意点を学びます。

## HTTPS導入の全体像

```
① ドメイン取得・DNS設定
    ↓
② 証明書を取得（CAから発行）
    ↓
③ Webサーバーに設定
    ↓
④ HTTPS動作を確認
    ↓
⑤ 自動更新を設定
```

## 証明書の取得方法

### Let's Encrypt（無料・自動化）
最も一般的な選択肢。90日有効で自動更新が標準。
```bash
# Nginx + certbot の例
sudo certbot --nginx -d example.com -d www.example.com
```
- 発行は**ACMEプロトコル**により自動
- **90日ごとに更新**（cronで自動化）

### 有料CA（DigiCert, GlobalSign, Sectigo など）
- 企業向け。OV/EV証明書を発行
- 長期有効（ただし業界標準として短期化が進行中）

### クラウドの統合
- **AWS Certificate Manager（ACM）**: ELB/CloudFrontで無料・自動更新
- **Cloudflare**: ドメインを預ければ無料でHTTPS化
- **GCP Managed SSL**: Load BalancerやApp Engineに統合

## NginxでのHTTPS設定例
```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;   # HTTP→HTTPS強制
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # セキュリティヘッダー
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        root /var/www/example.com;
    }
}
```

## ApacheでのHTTPS設定例
```apache
<VirtualHost *:443>
    ServerName example.com
    DocumentRoot /var/www/example.com

    SSLEngine on
    SSLCertificateFile      /etc/letsencrypt/live/example.com/fullchain.pem
    SSLCertificateKeyFile   /etc/letsencrypt/live/example.com/privkey.pem
    SSLProtocol             TLSv1.2 TLSv1.3

    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</VirtualHost>
```

## 証明書の確認コマンド
```bash
# サーバーの証明書を取得して見る
openssl s_client -connect example.com:443 -servername example.com </dev/null

# 証明書の中身をデコード
openssl x509 -in cert.pem -text -noout

# 有効期限だけ
echo | openssl s_client -connect example.com:443 2>/dev/null \
  | openssl x509 -noout -dates
```

## 自動更新（certbot + systemd）
```bash
# 手動テスト
sudo certbot renew --dry-run

# systemd timer が既定で有効になっているディストリが多い
systemctl list-timers | grep certbot
```

## 証明書のよくある問題

| エラー | 原因 | 対処 |
|---|---|---|
| NET::ERR_CERT_DATE_INVALID | 有効期限切れ | 更新する／自動更新設定 |
| NET::ERR_CERT_AUTHORITY_INVALID | 自己署名・ルートCA不明 | 正規CAで発行、中間証明書を結合 |
| NET::ERR_CERT_COMMON_NAME_INVALID | ドメイン名の不一致 | 正しい `SAN` を含む証明書に |
| `unable to get local issuer certificate` | 中間証明書の欠落 | `fullchain.pem` を使う |

## HSTSとHTTPS強制のポイント

### HTTP→HTTPSリダイレクト + HSTS の合わせ技
1. HTTPで来たら301でHTTPSへ
2. HTTPSレスポンスに `Strict-Transport-Security` を付与
3. 以降ブラウザは直接HTTPSで接続

### preloadリスト
chrome://net-internals/#hsts の**プリロード済みリスト**に登録申請すると、初回アクセスからHTTPSが強制されます。要件:
- `max-age>=31536000`
- `includeSubDomains`
- `preload` フラグ
- すべてのサブドメインがHTTPS対応

## TLS設定のベストプラクティス

### プロトコル
- **TLS 1.2 / 1.3** のみ有効化
- SSLv2/v3, TLS1.0/1.1 は無効化

### 暗号スイート
- 前方秘匿性（PFS）のあるもの（ECDHE系）
- AEAD暗号（AES-GCM, ChaCha20-Poly1305）

### 鍵のサイズ
- RSA: 2048ビット以上
- ECDSA: 256ビット以上（より軽量）

### テストツール
- **SSL Labs**（ssllabs.com/ssltest）: 設定とグレードを診断

## 内部通信・開発環境

### 自己署名証明書
開発・イントラ向け。ブラウザは警告を出すが動作確認には十分。
```bash
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
```

### ローカル用の便利ツール
- **mkcert**: 開発マシンのローカルCAで信頼される証明書を発行
```bash
mkcert -install
mkcert localhost 127.0.0.1
```

### 社内PKI
企業内では社内CAを構築してサーバー・クライアント証明書を運用することも。

## クライアント証明書による認証（mTLS）
サーバーだけでなく**クライアント側も証明書を提示**する方式。API間通信やゼロトラスト環境で使われます。

## 証明書運用のチェックリスト
- [ ] 有効期限を監視（切れたら全ユーザーにエラー）
- [ ] 自動更新が動いているか定期テスト
- [ ] 中間証明書を含めて配信しているか
- [ ] TLS 1.0/1.1 を無効化したか
- [ ] HSTSヘッダーを送っているか
- [ ] SSL Labs等でA以上のグレードか

## まとめ
- 実務では **Let's Encrypt / ACM / Cloudflare** で無料HTTPSが標準
- Nginx / Apache / LBに証明書を設定し、自動更新を仕掛ける
- **HSTS + HTTP→HTTPS強制**でHTTPS一本化
- TLS 1.2/1.3のみ、強い暗号スイート、定期的な診断が必須

次章では、通信を支える物理的/論理的な装置である**ルーター・スイッチ・ハブ・NAT**を学びます。
