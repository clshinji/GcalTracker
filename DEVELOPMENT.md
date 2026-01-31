# 開発者ガイド

このドキュメントでは、本ツールの開発環境の構築方法および開発フローについて説明します。

## 🛠 開発環境の構築

本プロジェクトでは、Google Apps Script (GAS) のローカル開発のために [clasp](https://github.com/google/clasp) を使用しています。

### 前提条件
- [Node.js](https://nodejs.org/) がインストールされていること。

### 手順
1.  **clasp をインストールする**
    ```bash
    npm install -g @google/clasp
    ```

2.  **Google アカウントにログインする**
    ```bash
    clasp login
    ```

3.  **リポジトリをクローンする**
    ```bash
    git clone https://github.com/clshinji/GcalTracker.git
    cd GcalTracker
    ```

4.  **GAS プロジェクトを紐付ける**
    `.clasp.json` はセキュリティのためリポジトリに含まれていません。以下のいずれかの方法で自分用の GAS プロジェクトを作成してください。

    **A. 新しく GAS プロジェクトを作る場合**
    ```bash
    clasp create --title "GcalTracker" --type sheet
    ```
    ※スプレッドシートが新しく作成されます。

    **B. 既存の GAS プロジェクト（コピーしたスプレッドシートなど）を使う場合**
    ```bash
    clasp setting scriptId "あなたのスクリプトID"
    ```
    ※スクリプトIDは、GAS エディタの「プロジェクトの設定」から確認できます。

## 🔄 開発フロー

1.  **コードを修正する**
    ローカルの `code.js` や `appsscript.json` を編集します。

2.  **GAS に反映する**
    以下のコマンドを実行して、オンラインの GAS エディタにコードをアップロードします。
    ```bash
    clasp push
    ```

3.  **GAS 上で動作確認する**
    スプレッドシートを開き、メニューから機能を実行して動作を確認します。

## 📁 ディレクトリ構造

- `code.js`: GAS のメインロジック。
- `appsscript.json`: GAS の設定（マニフェストファイル）。
- `.clasp.json`: clasp の設定ファイル（git 管理外）。
- `spec/`: 仕様書（SDD）を格納するディレクトリ。
- `README.md`: 一般ユーザー向けマニュアル。
- `DEVELOPMENT.md`: 開発者向けガイド（本書）。

## 🤝 貢献について

不具合の報告や機能改善の提案は、GitHub の Issue または Pull Request で受け付けています。
仕様の変更を伴う場合は、`spec/` ディレクトリ内のドキュメントも合わせて更新してください。
