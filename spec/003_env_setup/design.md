# 環境切り替え設定の設計

## 構成案
機密情報を保護しつつ、利便性を確保するために以下の構成をとる。

### 1. `.gitignore` の更新
以下のファイルを Git 管理対象外とする。
- `.clasp.json`
- `.clasp.dev.json`
- `.clasp.prod.json`

### 2. 環境変数/スクリプトによる `.clasp.json` の生成
`package.json` に npm スクリプトを定義し、外部設定ファイルからスクリプトIDを読み込んで `.clasp.json` を動的に生成する。

#### 使用するコマンド案
- `npm run use:dev`: 開発用の設定を `.clasp.json` に書き込む。
- `npm run use:prod`: 本番用の設定を `.clasp.json` に書き込む。

### 3. 設定ファイルのテンプレート
スクリプトIDを含まない以下のテンプレートをリポジトリに含める。
- `.clasp.json.sample`: `.clasp.json` の構造を示す。
- `.clasp.env.json.sample`: 各環境のスクリプトIDを定義するためのテンプレート。

## ファイル構成
- `.gitignore`: 更新
- `package.json`: 新規作成（または更新）
- `.clasp.json.sample`: 新規作成
- `scripts/switch-env.js`: 環境切り替え用の補助スクリプト（必要に応じて）

## 切り替えロジック
Node.js のスクリプト (`scripts/switch-env.js`) を使用して、以下の優先順位で `.clasp.json` を管理・生成する。

1.  **`.clasp.env.json` が存在する場合**:
    *   指定された環境（デフォルト `dev`）の設定を読み込む。
    *   `dev` 設定がない場合は `prod` 設定をフォールバックとして使用する。
    *   読み込んだ設定で `.clasp.json` を生成/上書きする。
2.  **`.clasp.env.json` が存在せず、`.clasp.json` が既に存在する場合**:
    *   既存の `.clasp.json` をそのまま使用する。
3.  **いずれも存在しない場合**:
    *   エラーを表示し、セットアップを促す。

## 生成される `.clasp.json` の内容

```json
{
  "scriptId": "対象のスクリプトID",
  "rootDir": "",
  "scriptExtensions": [".js", ".gs"],
  "htmlExtensions": [".html"],
  "jsonExtensions": [".json"]
}
```
