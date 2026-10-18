# 7-8 キャッシュ戦略・Service Worker・CDN（深掘り）

## 🎯 この章で学ぶこと

- ブラウザ / Service Worker / CDN のキャッシュの役割分担が分かる
- 「どこでキャッシュすべきか」を判断する観点（鮮度・整合性・コスト）を持てる
- 実装例を読みつつ、要件に合わせて取捨選択できる

## 位置づけ

この章は `7-6-キャッシュ-再検証-楽観更新.md` の補助です。

- `7-6`：React（TanStack Query）での *サーバー状態* キャッシュの基本
- `7-8`：HTTP / Service Worker / CDN / エッジ最適化を含む *配信・プラットフォーム* 寄りの深掘り

## 1. キャッシュ戦略の全体像（レイヤー別）

- **ブラウザ（HTTPキャッシュ）**
  - `Cache-Control`, `ETag`, `Last-Modified` で再利用や条件付きリクエストを制御
  - 静的アセット（JS/CSS/画像）と、GET APIのキャッシュは性格が違う
- **Service Worker**
  - オフライン対応・キャッシュ戦略の自前実装が可能
  - 更新戦略（stale-while-revalidate など）を柔軟に選べる
- **CDN**
  - エッジで配信し、TTFB・オリジン負荷を下げる
  - キャッシュ無効化（purge）とバージョニング設計が重要

## 2. キャッシュ戦略の詳細実装（参考実装）

以下は「キャッシュ戦略とCDNの詳細実装」から統合した参考コードです。実プロダクトへそのまま貼るのではなく、**要件に合わせて最小限に** してください。

### 2.1 ブラウザキャッシュ（アプリ内Mapキャッシュ例）

```javascript
// 高度なブラウザキャッシュ管理
class AdvancedBrowserCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5分
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // 1分
    this.startCleanupTimer();
  }

  set(key, value, ttl = this.defaultTTL) {
    // キャッシュサイズチェック
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // TTLチェック
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // アクセス統計を更新
    item.accessCount++;
    item.lastAccessed = Date.now();

    return item.value;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // 最も古いアイテムを削除
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // 定期的なクリーンアップ
  startCleanupTimer() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          this.cache.delete(key);
        }
      }
    }, this.cleanupInterval);
  }
}
```

### 2.2 API呼び出しのキャッシュ（重複リクエスト抑制つき）

```javascript
// APIキャッシュマネージャー
class APICacheManager {
  constructor() {
    this.cache = new AdvancedBrowserCache({
      maxSize: 50,
      defaultTTL: 5 * 60 * 1000 // 5分
    });
    this.pendingRequests = new Map(); // 重複リクエストの防止
  }

  async fetchWithCache(url, options = {}) {
    const cacheKey = this.generateCacheKey(url, options);

    // キャッシュから取得
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // 重複リクエストのチェック
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // API呼び出し
    const requestPromise = this.makeRequest(url, options);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const data = await requestPromise;

      // キャッシュに保存
      this.cache.set(cacheKey, data, options.ttl);

      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async makeRequest(url, options) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  generateCacheKey(url, options) {
    const { method = 'GET', body, headers } = options;
    const keyData = {
      url,
      method,
      body: body ? JSON.stringify(body) : null,
      headers: headers ? JSON.stringify(headers) : null
    };

    return btoa(JSON.stringify(keyData));
  }
}
```

### 2.3 Service Worker：キャッシュ戦略（例）

```javascript
// service-worker.js
const CACHE_VERSION = 'v1';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
const API_CACHE_NAME = `api-cache-${CACHE_VERSION}`;

// キャッシュ戦略の定義
const CACHE_STRATEGIES = {
  // キャッシュファースト（静的リソース）
  CACHE_FIRST: 'cache-first',
  // ネットワークファースト（API）
  NETWORK_FIRST: 'network-first',
  // ストール・リバリデート（バックグラウンド更新）
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // ネットワークオンリー
  NETWORK_ONLY: 'network-only',
  // キャッシュオンリー
  CACHE_ONLY: 'cache-only'
};

// キャッシュ戦略の実装
class CacheStrategy {
  static async cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  }

  static async networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  }

  static async staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // バックグラウンドで更新
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });

    // キャッシュがあれば即座に返す
    return cachedResponse || fetchPromise;
  }
}
```

## 3. CDNの詳細実装（参考実装）

### 3.1 CDN設定と最適化URL生成

```javascript
// CDN設定管理
class CDNManager {
  constructor(config) {
    this.config = {
      baseUrl: config.baseUrl,
      fallbackUrl: config.fallbackUrl,
      defaultOptions: {
        quality: 80,
        format: 'webp',
        fit: 'cover'
      },
      ...config
    };
  }

  // 最適化されたURLを生成
  generateUrl(path, options = {}) {
    const { width, height, quality, format, fit } = {
      ...this.config.defaultOptions,
      ...options
    };

    const params = new URLSearchParams();

    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (quality) params.append('q', quality);
    if (format) params.append('f', format);
    if (fit) params.append('fit', fit);

    const queryString = params.toString();
    return `${this.config.baseUrl}${path}${queryString ? `?${queryString}` : ''}`;
  }

  // フォールバックURLを生成
  generateFallbackUrl(path) {
    return `${this.config.fallbackUrl}${path}`;
  }
}
```

### 3.2 CDNキャッシュ無効化（例：Cloudflare API）

```javascript
// CDNキャッシュ無効化管理
class CDNCacheInvalidation {
  constructor(apiKey, zoneId) {
    this.apiKey = apiKey;
    this.zoneId = zoneId;
    this.baseUrl = 'https://api.cloudflare.com/client/v4';
  }

  // 特定のファイルのキャッシュを無効化
  async invalidateFile(filePath) {
    try {
      const response = await fetch(`${this.baseUrl}/zones/${this.zoneId}/purge_cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: [filePath]
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('CDNキャッシュ無効化エラー:', error);
      return false;
    }
  }
}
```

## 📝 まとめ

- `7-6`（React Query等）と `7-8`（SW/CDN）は、目的も失敗パターンも違うので章を分けて考える
- CDNは **無効化戦略（purge/バージョニング）** を先に決めないと運用が破綻しやすい
- Service Workerは強力だが、デバッグ/更新の難易度が上がるため、必要十分から始める

## 🔗 関連ページ

- [[7-6-キャッシュ-再検証-楽観更新]]
