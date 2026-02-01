# タスクリスト

- [x] `.gitignore` を更新し、`.clasp.json` およびその関連ファイルを対象外にする
- [x] `.clasp.json.sample` を作成する
- [x] `package.json` が存在するか確認し、なければ `npm init -y` で作成する
- [x] 環境切り替え用の Node.js スクリプト `scripts/switch-env.js` を作成する
- [x] `package.json` に npm スクリプトを追加する
  - `use:dev`
  - `use:prod`
- [x] 柔軟な環境切り替えロジックへの修正
  - [x] デフォルト環境の自動生成（引数なしで実行可能に）
  - [x] フォールバック機能（dev がなければ prod を使用）
  - [x] `.clasp.json` 直接管理のサポート（`.clasp.env.json` なしでも動作）
- [x] SDDドキュメントの更新
- [x] DEVELOPMENT.md の更新
- [x] 動作確認
- [x] 不要になった（旧）`.clasp.json` を git 管理から外す（もし入っていれば）
