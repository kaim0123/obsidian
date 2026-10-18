---
title: MOC_CI-CD体系
created: 2026-09-26
tags:
  - CI-CD
  - MOC
---

# MOC_CI-CD体系

62_CI-CD の入口ノート。**変更を自動で検証し、いつでも本番に出せる状態を保つ仕組み**を扱う。Continuous Delivery（Humble & Farley）のデプロイメントパイプラインと、DORA の能力モデル（CI・CD・トランクベース開発など）を軸にしている。62〜69 全体の地図は [[MOC_運用領域マップ]]。

## フォルダ構成

| フォルダ | 役割 |
|---|---|
| 00_全体像 | 本MOC・[[MOC_運用領域マップ]]・[[目次_旧10_Operations]] |
| 10_基礎 | CI / 継続的デリバリー / 継続的デプロイの違い、パイプラインの構成要素、DORAメトリクス |
| 20_パイプライン設計 | ブランチ戦略との関係、必須チェック、monorepo、並列化・高速化 |
| 30_ビルド・アーティファクト | ビルド再現性、アーティファクト管理、イメージタグ戦略、SBOM |
| 40_テスト統合 | テストピラミッドと実行順、flaky 対策、プレビュー環境 |
| 50_セキュリティ統合 | DevSecOps、SAST/DAST/SCA、シークレットスキャン、署名と検証 |
| 60_GitOps | pipeline-as-code、ArgoCD / Flux、ポリシー・アズ・コード |
| 90_ツール別リファレンス | GitHub Actions / GitLab CI / CircleCI / Jenkins とツール選定 |

| テーマ | 本拠地 |
|---|---|
| デプロイ戦略（Blue/Green・Canary など） | 63_リリース・デプロイ |
| GitHub Actions の入門・Git 操作 | 51_Git |
| テストの書き方・テストツール | 81_テスト戦略 / 83_テストツール |
| AWS CodePipeline | 61_AWS |
| ビルドツール（Vite・webpack など） | 54_ビルド |

## 10_基礎
（未作成）CIとCDの違い / CI_CDパイプラインの構成要素 / なぜCI_CDが必要か / DORAメトリクス / パイプラインとしてのコード

## 20_パイプライン設計
（未作成）ブランチ戦略とCI_CDの関係 / PRチェックの必須化 / main保護ブランチ / Trunk_Based_DevelopmentとCD / Monorepo向けパイプライン / 並列化と高速化

## 30_ビルド・アーティファクト
（未作成）ビルド再現性 / アーティファクト管理 / コンテナイメージのタグ戦略 / SBOM生成

## 40_テスト統合
（未作成）テストピラミッドとCI / フレーク対策（詳細は 84_デバッグ/30） / 契約テスト_スモークテストの組み込み / プレビュー環境

## 50_セキュリティ統合
（未作成）DevSecOps入門 / 脆弱性スキャン / シークレットスキャン / 署名と検証

## 60_GitOps
（未作成）GitOpsとは / ArgoCD_FluxCD / ポリシー・アズ・コード

## 90_ツール別リファレンス
（未作成）GitHub_Actions / GitLab_CI / CircleCI / Jenkins / ツール選定の指針
