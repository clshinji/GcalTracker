/**
 * スプレッドシートを開いた時に実行される関数です。
 * カスタムメニューを追加します。
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('実績集計')
    .addItem('集計を実行する', 'main')
    .addToUi();
}

/**
 * 集計処理のメイン関数です。
 * ボタンが押された時に実行されます。
 */
function main() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // 1. 設定値を読み取る
    const config = getConfig();
    
    // 2. カレンダーから予定を取得する
    const events = getTargetEvents(config);
    
    if (events.length === 0) {
      ui.alert('該当する予定が見つかりませんでした。');
      return;
    }
    
    // 3. 結果をスプレッドシートに書き出す
    writeEventsToSheet(events);
    
    ui.alert(`集計が完了しました！\n「集計結果」シートを確認してください。\n（合計：${events.length}件）`);
    
  } catch (e) {
    ui.alert('エラーが発生しました：\n' + e.message);
  }
}

/**
 * 「設定」シートから集計条件を取得します。
 */
function getConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('設定');
  
  if (!sheet) {
    throw new Error('「設定」シートが見つかりません。');
  }
  
  const startDate = sheet.getRange('B2').getValue();
  const endDate = sheet.getRange('B3').getValue();
  const calendarName = sheet.getRange('B4').getValue();
  const keyword = sheet.getRange('B5').getValue();
  
  if (!startDate || !endDate) {
    throw new Error('開始日と終了日を入力してください。');
  }
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw new Error('日付の形式が正しくありません。');
  }
  if (!keyword) {
    throw new Error('集計キーワードを入力してください。');
  }
  
  // 終了日の時刻を23:59:59に設定して、その日の最後まで含めるようにする
  const endDateTime = new Date(endDate);
  endDateTime.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate,
    endDate: endDateTime,
    calendarName: calendarName,
    keyword: keyword
  };
}

/**
 * 指定された条件に合うカレンダーの予定を取得します。
 */
function getTargetEvents(config) {
  let calendar;
  
  if (config.calendarName) {
    const calendars = CalendarApp.getCalendarsByName(config.calendarName);
    if (calendars.length === 0) {
      throw new Error(`カレンダー「${config.calendarName}」が見つかりませんでした。`);
    }
    calendar = calendars[0];
  } else {
    calendar = CalendarApp.getDefaultCalendar();
  }
  
  const allEvents = calendar.getEvents(config.startDate, config.endDate);
  const results = [];
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  
  allEvents.forEach(event => {
    const title = event.getTitle();
    if (title.indexOf(config.keyword) !== -1) {
      const start = event.getStartTime();
      const end = event.getEndTime();
      const diffMs = end.getTime() - start.getTime();
      const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      
      results.push([
        Utilities.formatDate(start, 'JST', 'yyyy/MM/dd'),
        days[start.getDay()],
        Utilities.formatDate(start, 'JST', 'HH:mm'),
        Utilities.formatDate(end, 'JST', 'HH:mm'),
        hours,
        title,
        event.getDescription()
      ]);
    }
  });
  
  return results;
}

/**
 * 取得したデータを「集計結果」シートに書き出し、デザインを整えます。
 */
function writeEventsToSheet(events) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('集計結果');
  
  if (!sheet) {
    throw new Error('「集計結果」シートが見つかりません。');
  }
  
  // シートを一旦クリアし、枠線などもリセット
  sheet.clear();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setBorder(false, false, false, false, false, false);
  
  // ヘッダー（見出し）
  const header = [['日付', '曜日', '開始', '終了', '作業時間', '内容', '詳細']];
  const outputData = header.concat(events);
  
  // データの書き込み範囲
  const range = sheet.getRange(1, 1, outputData.length, outputData[0].length);
  range.setValues(outputData);
  
  // --- デザインの調整 ---
  
  // 1. ヘッダーのデザイン（濃い青背景に白文字、太字）
  const headerRange = sheet.getRange(1, 1, 1, outputData[0].length);
  headerRange.setBackground('#4a86e8')
             .setFontColor('#ffffff')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');
  
  // 2. データ行の配置とフォーマット
  const dataRange = sheet.getRange(2, 1, events.length, outputData[0].length);
  
  // 列ごとの調整
  sheet.getRange(2, 1, events.length, 4).setHorizontalAlignment('center'); // 日付〜終了
  sheet.getRange(2, 5, events.length, 1).setHorizontalAlignment('center')  // 作業時間
                                       .setNumberFormat('0.00" h"');      // 単位を表示
  
  // 3. 縞々（しましま）のデザイン
  dataRange.setBackground(null);
  for (let i = 0; i < events.length; i++) {
    if (i % 2 === 1) {
      sheet.getRange(i + 2, 1, 1, outputData[0].length).setBackground('#f3f3f3');
    }
  }
  
  // 4. 全体に細い枠線を引く
  range.setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  
  // 5. その他（固定、列幅調整）
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, outputData[0].length);
  
  // 列幅の微調整（autoResizeの後に固定値で上書きしてゆとりを持たせる）
  sheet.setColumnWidth(1, 100); // 日付
  sheet.setColumnWidth(2, 60);  // 曜日（少し広げた）
  sheet.setColumnWidth(3, 80);  // 開始
  sheet.setColumnWidth(4, 80);  // 終了
  sheet.setColumnWidth(5, 100); // 作業時間
  sheet.setColumnWidth(6, 300); // 内容
  sheet.setColumnWidth(7, 400); // 詳細
}
