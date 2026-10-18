# Playwright — CI・MCP・自動化（外部リンク集）

Web 上の **公式ドキュメント・ブログ記事・解説** を、CI 連携・MCP（Model Context Protocol）・テスト自動化の観点で整理したリンク集です。リンク先の構成や URL は変更されることがあるため、404 の場合は各サイト内検索や Wayback Machine での確認も検討してください。

調査日の目安: **2026年4月**

---

## 公式ドキュメント（一次情報）

| トピック | URL |
|----------|-----|
| CI（継続的インテグレーション） | [Continuous Integration \| Playwright](https://playwright.dev/docs/ci) |
| CI 入門ガイド | [CI \| Playwright](https://playwright.dev/docs/ci-intro) |
| テストのシャーディング | [Sharding \| Playwright](https://playwright.dev/docs/test-sharding) |
| ベストプラクティス | [Best Practices \| Playwright](https://playwright.dev/docs/best-practices) |
| Playwright MCP（LLM 連携） | [Playwright MCP \| Playwright](https://playwright.dev/docs/getting-started-mcp) |
| Model Context Protocol（仕様・エコシステム） | [Model Context Protocol（公式サイト）](https://modelcontextprotocol.io/) |

### 日本語（コミュニティ翻訳）

| トピック | URL |
|----------|-----|
| CI（日本語版ドキュメント） | [継続的インテグレーション \| Playwright 日本語ドキュメント](https://playwright.dokyumento.jp/docs/ci) |

---

## CI / GitHub Actions

| 概要 | URL |
|------|-----|
| GitHub Actions での Playwright テスト（ブログ） | [Setting Up Playwright Tests in GitHub Actions - Faruk Hasan](https://faruk-hasan.com/blog_post/github_actions_playwright_test.html) |
| GitHub Actions と CI/CD（解説記事） | [Playwright CI/CD Integration with GitHub Actions: The Complete Guide \| Techlistic](https://www.techlistic.com/2026/02/playwright-cicd-integration-with-github.html) |
| Zenn（日本語・CI 構築） | [PlaywrightとGitHubActionsでCI環境構築 \| Zenn](https://zenn.dev/0fuzimaru0/articles/84d9574dbae65d) |
| シャーディングと GitHub Actions Artifact v4 | [Playwright Sharding for GitHub Actions v4 – p11.io](https://p11.io/playwright-sharding-for-github-actions-v4/) |
| ジョブマトリクスとシャードの組み合わせ | [Using Playwright test shards in combination with a job matrix to improve your CI speed \| Tim Deschryver](https://timdeschryver.dev/blog/using-playwright-test-shards-in-combination-with-a-job-matrix-to-improve-your-ci-speed) |

### 動画（参考）

| 概要 | URL |
|------|-----|
| GitHub Actions での Playwright チュートリアル（YouTube） | [CI/CD using GitHub Actions with Playwright \| YouTube](https://www.youtube.com/watch?v=qX_t6F4ne_U) |

---

## MCP（Playwright と AI / エージェント連携）

| 概要 | URL |
|------|-----|
| 公式リポジトリ（ソース・README） | [microsoft/playwright-mcp（GitHub）](https://github.com/microsoft/playwright-mcp) |
| npm パッケージ | [@playwright/mcp \| npm](https://www.npmjs.com/package/@playwright/mcp) |
| Playwright MCP の概念ドキュメント（Mintlify） | [Model Context Protocol Overview - Playwright MCP](https://microsoft-playwright-mcp.mintlify.app/concepts/mcp-overview) |
| コミュニティ実装の一例 | [executeautomation/mcp-playwright（GitHub）](https://github.com/executeautomation/mcp-playwright) |

---

## 自動化・設計・ベストプラクティス（記事）

| 概要 | URL |
|------|-----|
| 公式ベストプラクティス（上記と同一だが CI 文脈でよく参照される） | [Best Practices \| Playwright](https://playwright.dev/docs/best-practices) |
| 実践的なテストの書き方 | [The Pragmatic Guide to Playwright Testing: Best Practices & Patterns \| Kyrre Gjerstad](https://www.kyrre.dev/blog/the-pragmatic-guide-to-playwright-testing) |
| インストール〜構成〜CI/CD までのガイド | [The Ultimate Playwright Guide for 2026 – … CI/CD Setup \| PixelQA](https://www.pixelqa.com/blog/post/playwright-guide-installation-framework-structure-best-practices-ci-cd-setup) |
| ベストプラクティスまとめ | [15 Best Practices for Playwright testing \| BrowserStack](https://www.browserstack.com/guide/playwright-best-practices) |
| スケーラブルなスクリプト | [How to Writing Scalable Playwright Test Scripts \| BrowserStack](https://www.browserstack.com/guide/playwright-scripts) |

---

## 使い分けの目安

- **CI で安定して回したい** → 公式 [CI ドキュメント](https://playwright.dev/docs/ci) と `playwright.config.ts` の `workers` / `retries` / `forbidOnly` 周りを先に押さえるとよいです。
- **ジョブを分割して短縮したい** → 公式 [Sharding](https://playwright.dev/docs/test-sharding) に加え、p11.io や Tim Deschryver の記事が GitHub Actions 向けの具体例になります。
- **Cursor 等の MCP クライアントでブラウザ操作をさせたい** → 公式 [Playwright MCP](https://playwright.dev/docs/getting-started-mcp) と [playwright-mcp リポジトリ](https://github.com/microsoft/playwright-mcp) が起点です。

---

## 関連ノート

- [[06_CIとデバッグ]]
- [[00_Playwright_目次]]
