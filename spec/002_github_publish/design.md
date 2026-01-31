# 設計定義：GitHub公開とGitHub Pages設定

このドキュメントでは、GitHubでの公開に向けた具体的な構成と設定内容を設計します。

## 1. ドキュメント構成

### 1.1 README.md (一般ユーザー向け)
*   **タイトル**: Googleカレンダー作業実績集計ツール
*   **概要**: GASを活用した実績集計の自動化ツールの紹介。
*   **クイックスタート**: スプレッドシートのコピーリンク、初期設定、実行手順。
*   **スクリーンショット/デモ**: (将来的に追加可能)
*   **ライセンス**: MIT License (推奨)

### 1.2 DEVELOPMENT.md (開発者向け)
*   **環境構築**:
    *   Node.js のインストール
    *   `clasp` (`@google/clasp`) のグローバルインストール
    *   `clasp login` による認証
*   **開発サイクル**:
    *   `git clone`
    *   `clasp push` による反映
*   **プロジェクト構造**:
    *   `code.js`: GASメインロジック
    *   `appsscript.json`: GASマニフェスト
    *   `spec/`: 設計ドキュメント (SDD)
*   **貢献方法**: IssueやPRの出し方。

## 2. GitHub Pages 設定

### 2.1 Jekyll 設定 (`_config.yml`)
*   **テーマ**: `jekyll-theme-merlot` または `jekyll-theme-cayman` (一般ユーザーに親しみやすいもの)
*   **タイトル**: Googleカレンダー作業実績集計ツール
*   **説明**: Googleカレンダーの予定を1クリックでスプレッドシートに集計します。

### 2.2 公開フロー
*   `README.md` を GitHub Pages のトップページとして扱う。
*   GitHub のリポジトリ設定から `Settings > Pages > Build and deployment > Source` を `Deploy from a branch` (main branch) に設定。

## 3. リポジトリ管理
*   **.gitignore**:
    *   `node_modules/`
    *   `.clasp.json` (※もし個人用スクリプトIDが含まれる場合。今回は配布用テンプレートとして扱うなら含めるか、あるいは作成手順を示す)
    *   `credentials.json` などの秘匿情報

## 4. セキュリティ
*   公開リポジトリにするため、スクリプト内にAPIキーや個人のメールアドレスが含まれていないことを確認する。
