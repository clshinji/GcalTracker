# 開発者ガイド

## 環境セットアップ

1.  **リポジトリのクローン**
    ```bash
    git clone https://github.com/clshinji/GcalTracker.git
    cd GcalTracker
    ```

2.  **依存関係のインストール**
    ```bash
    npm install
    ```

3.  **機密情報の作成（推奨）**
    本プロジェクトでは、GASのスクリプトIDを Git 管理外のファイルで管理することを推奨しています。
    `.clasp.env.json.sample` をコピーして `.clasp.env.json` を作成し、適切なスクリプトIDを記入してください。
    ```bash
    cp .clasp.env.json.sample .clasp.env.json
    ```
    ※ `.clasp.env.json` を作らずに、直接 `.clasp.json` を作成して管理することも可能です。

4.  **環境の切り替え・生成**
    以下のコマンドを実行して `.clasp.json` を生成します。引数なしの場合はデフォルトで `dev` 環境（なければ `prod`）がセットされます。
    ```bash
    npm run use:dev
    ```

## 開発フロー

-   **コードの修正**: `code.js` や `appsscript.json` を編集します。
-   **GASへの反映**:
    ```bash
    # 開発環境にプッシュ
    npm run push:dev

    # 本番環境にプッシュ（慎重に！）
    npm run push:prod
    ```

## 環境切り替えの仕様
-   **自動フォールバック**: `.clasp.env.json` に `dev` 設定がない場合、自動的に `prod` 設定を使用して `.clasp.json` を生成します。
-   **直接管理のサポート**: `.clasp.env.json` がなくても、既に `.clasp.json` が存在する場合はそれが優先的に使用されます。

## 注意事項
-   `.clasp.json` や `.clasp.env.json` は Git にコミットしないでください（`.gitignore` で設定済み）。
-   本番環境への `push` は、必ず動作確認を行ってから実施してください。
