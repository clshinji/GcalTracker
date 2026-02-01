# 複数条件によるカレンダー集計機能追加 設計書

## データ構造

### 設定データ (Config)
`getConfig()` は以下の構造を持つオブジェクトの配列を返すように変更する。

```typescript
type Config = {
  projectName: string;     // 案件名（空の場合は "-"）
  startDate: Date;         // 集計開始日
  endDate: Date;           // 集計終了日（時刻を23:59:59に調整済み）
  calendarNames: string[]; // 対象カレンダー名の配列
  keyword: string;         // 集計キーワード
}[];
```

## 関数設計

### 1. `getConfig()`
- 「設定」シートの `A2:E` 範囲を `getValues()` で取得。
- 各行をループし、以下のバリデーションを行う：
    - B列（開始日）、C列（終了日）、E列（キーワード）が入力されているか。
    - 入力されている場合、案件名（A列）が空なら `-` を設定。
    - 開始日・終了日が `Date` オブジェクトであることを確認。
- 条件を満たした行のみを `Config` 配列に格納して返す。

### 2. `getTargetEvents(configList: Config)`
- `configList` をループ処理する。
- 各 `config` に対して、既存の集計ロジック（カレンダー取得 -> イベント取得 -> タイトル一致確認）を実行。
- 取得したイベントデータ（配列）に、その時の `projectName` と `keyword` を追加する。
- すべての `config` の結果を一つの配列に統合する。
- 最後に日付・時刻順でソートする。

### 3. `writeEventsToSheet(events)`
- ヘッダーを更新する：
    `['案件名', '日付', '曜日', 'カレンダー名', '開始', '終了', '作業時間', 'キーワード', '内容', '詳細']`
- 列の追加に伴い、以下の設定値を更新する：
    - `sheet.getRange` の範囲。
    - `sheet.setColumnWidth` の引数と幅。
    - `setHorizontalAlignment` を適用する列。
    - `setNumberFormat` を適用する列（作業時間列が 6列目から 7列目に移動）。
    - 縞々模様（背景色）を設定する範囲。

## UI/UX
- メニュー構成に変更はない。
- ユーザーは「設定」シートに好きなだけ行を追加できる。
