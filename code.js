/**
 * スプレッドシートを開いた時に実行される関数です。
 * カスタムメニューを追加します。
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('実績集計')
    .addItem('集計を実行する', 'main')
    .addSeparator()
    .addItem('カレンダー一覧を更新する', 'updateCalendarList')
    .addSeparator()
    .addSubMenu(ui.createMenu('【開発者用】')
      .addItem('使い方シートを更新する', 'updateHelpSheet'))
    .addToUi();
}

/**
 * 集計処理のメイン関数です。
 */
function main() {
  const ui = SpreadsheetApp.getUi();
  try {
    const config = getConfig();
    const events = getTargetEvents(config);
    if (events.length === 0) {
      ui.alert('該当する予定が見つかりませんでした。');
      return;
    }
    writeEventsToSheet(events);
    ui.alert(`集計が完了しました！\n「集計結果」シートを確認してください。\n（合計：${events.length}件）`);
  } catch (e) {
    ui.alert('エラーが発生しました：\n' + e.message);
  }
}

/**
 * 「使い方」シートにガイドを書き出します。
 */
function updateHelpSheet() {
  const ui = SpreadsheetApp.getUi();
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('使い方');
    if (!sheet) {
      throw new Error('「使い方」シートが見つかりません。シートを作成してから実行してください。');
    }
    
    sheet.clear();
    
    const data = [
      ['★ Googleカレンダー実績集計ツール 使い方ガイド ★'],
      [''],
      ['【STEP 1】自分のスプレッドシートとして保存する'],
      ['まずは配布されたリンクをクリックし、「コピーを作成」ボタンを押して保存してください。'],
      [''],
      ['【STEP 2】カレンダーに予定を入れる'],
      ['集計したい予定のタイトルに [実績] などのキーワードを入れてください。'],
      ['例： [実績] ○○様向けデザイン作業'],
      [''],
      ['【STEP 3】設定をする'],
      ['「設定」シートを開き、以下の項目を入力してください（A2〜D2セル）。'],
      ['・集計開始日 / 終了日'],
      ['・カレンダー名（右側の「利用可能なカレンダー一覧」からコピーして貼り付けるのがオススメです）'],
      ['・集計キーワード（[実績] など）'],
      [''],
      ['【STEP 4】集計を実行する'],
      ['メニューの「実績集計」→「集計を実行する」をクリックします。'],
      ['結果は「集計結果」シートに自動的に書き出されます。'],
      [''],
      ['【重要】初めて実行する時の注意'],
      ['「承認が必要です」という画面が出たら、以下の順に進めてください。'],
      ['1. 自分のアカウントを選択'],
      ['2. 「詳細」をクリック'],
      ['3. 「実績集計ツール（安全ではないページ）に移動」をクリック'],
      ['4. 「許可」をクリック'],
      [''],
      ['※一度許可すれば、次からは表示されません。']
    ];
    
    sheet.getRange(1, 1, data.length, 1).setValues(data);
    
    // デザイン調整
    sheet.getRange(1, 1).setFontSize(14).setFontWeight('bold').setFontColor('#ff6d01');
    sheet.getRange(3, 1).setFontWeight('bold').setBackground('#fff2e6');
    sheet.getRange(6, 1).setFontWeight('bold').setBackground('#fff2e6');
    sheet.getRange(10, 1).setFontWeight('bold').setBackground('#fff2e6');
    sheet.getRange(16, 1).setFontWeight('bold').setBackground('#fff2e6');
    sheet.getRange(20, 1).setFontWeight('bold').setBackground('#fdf2f2').setFontColor('#d93025');
    
    sheet.autoResizeColumn(1);
    ui.alert('使い方シートを更新しました。');
    
  } catch (e) {
    ui.alert('エラーが発生しました：\n' + e.message);
  }
}

/**
 * 取得可能なカレンダーの一覧を「設定」シートのF列に書き出します。
 */
function updateCalendarList() {
  const ui = SpreadsheetApp.getUi();
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('設定');
    if (!sheet) throw new Error('「設定」シートが見つかりません。');
    
    const calendars = CalendarApp.getAllCalendars();
    const calendarNames = calendars.map(cal => [cal.getName()]);
    
    const headerRange = sheet.getRange('F1');
    headerRange.setValue('利用可能なカレンダー一覧')
               .setBackground('#ff6d01')
               .setFontColor('#ffffff')
               .setFontWeight('bold')
               .setHorizontalAlignment('center');
               
    sheet.getRange('F2:F' + sheet.getMaxRows()).clearContent().setBackground(null).setBorder(false, false, false, false, false, false);
    
    if (calendarNames.length > 0) {
      const dataRange = sheet.getRange(2, 6, calendarNames.length, 1);
      dataRange.setValues(calendarNames);
      const range = sheet.getRange(1, 6, calendarNames.length + 1, 1);
      range.setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
      for (let i = 0; i < calendarNames.length; i++) {
        if (i % 2 === 1) sheet.getRange(i + 2, 6).setBackground('#fff2e6');
      }
    }
    sheet.setColumnWidth(6, 250);
    ui.alert('カレンダー一覧を更新しました。F列を確認してください。');
  } catch (e) {
    ui.alert('エラーが発生しました：\n' + e.message);
  }
}

/**
 * 「設定」シートから集計条件を読み取ります。
 */
function getConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('設定');
  if (!sheet) throw new Error('「設定」シートが見つかりません。');
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  const configList = [];

  values.forEach((row, index) => {
    const projectName = row[0] || '-';
    const startDate = row[1];
    const endDate = row[2];
    const calendarNameInput = row[3];
    const keyword = row[4];

    // 必須項目のチェック（開始日、終了日、キーワード）
    if (!startDate || !endDate || !keyword) return;
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) return;

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    let calendarNames = [];
    if (calendarNameInput) {
      calendarNames = calendarNameInput.split(',').map(name => name.trim());
    }

    configList.push({
      projectName: projectName,
      startDate: startDate,
      endDate: endDateTime,
      calendarNames: calendarNames,
      keyword: keyword
    });
  });

  if (configList.length === 0) {
    throw new Error('有効な集計条件（開始日、終了日、キーワード）が入力されている行が見つかりませんでした。');
  }

  console.log('取得した設定:', configList);
  return configList;
}

/**
 * 指定された条件に合うカレンダーの予定を取得します。
 * @param {Array} configList 設定データの配列
 */
function getTargetEvents(configList) {
  const allCalendars = CalendarApp.getAllCalendars();
  const results = [];
  const days = ['日', '月', '火', '水', '木', '金', '土'];

  configList.forEach(config => {
    const targetCalendars = [];
    
    if (config.calendarNames && config.calendarNames.length > 0) {
      config.calendarNames.forEach(name => {
        const found = allCalendars.find(cal => cal.getName() === name);
        if (found) targetCalendars.push(found);
      });
    } else {
      targetCalendars.push(CalendarApp.getDefaultCalendar());
    }

    targetCalendars.forEach(calendar => {
      const calendarName = calendar.getName();
      const events = calendar.getEvents(config.startDate, config.endDate);
      
      events.forEach(event => {
        const title = event.getTitle();
        if (title.indexOf(config.keyword) !== -1) {
          const start = event.getStartTime();
          const end = event.getEndTime();
          const diffMs = end.getTime() - start.getTime();
          const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
          
          results.push([
            config.projectName, // 案件名
            Utilities.formatDate(start, 'JST', 'yyyy/MM/dd'),
            days[start.getDay()],
            calendarName,
            Utilities.formatDate(start, 'JST', 'HH:mm'),
            Utilities.formatDate(end, 'JST', 'HH:mm'),
            hours,
            config.keyword, // キーワード
            title,
            event.getDescription()
          ]);
        }
      });
    });
  });
  
  // 日付（1列目）と開始時間（4列目）でソート
  results.sort((a, b) => {
    const dateA = new Date(a[1] + ' ' + a[4]);
    const dateB = new Date(b[1] + ' ' + b[4]);
    return dateA - dateB;
  });
  
  return results;
}

/**
 * 取得したデータを「集計結果」シートに書き出し、デザインを整えます。
 */
function writeEventsToSheet(events) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('集計結果');
  if (!sheet) throw new Error('「集計結果」シートが見つかりません。');
  
  sheet.clear();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setBorder(false, false, false, false, false, false);
  
  // 新しいヘッダー（10列）
  const header = [['案件名', '日付', '曜日', 'カレンダー名', '開始', '終了', '作業時間', 'キーワード', '内容', '詳細']];
  const outputData = header.concat(events);
  
  const numRows = outputData.length;
  const numCols = outputData[0].length;
  
  const range = sheet.getRange(1, 1, numRows, numCols);
  range.setValues(outputData);
  
  const headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground('#ff6d01')
             .setFontColor('#ffffff')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');
  
  // データ部分のスタイル設定
  const dataRows = events.length;
  if (dataRows > 0) {
    const dataRange = sheet.getRange(2, 1, dataRows, numCols);
    dataRange.setBackground(null);
    
    // アライメント：案件名〜キーワード（1〜8列目）までを中央揃え、内容・詳細は左揃え
    sheet.getRange(2, 1, dataRows, 8).setHorizontalAlignment('center');
    
    // 作業時間（7列目）のフォーマット
    sheet.getRange(2, 7, dataRows, 1).setNumberFormat('0.00" h"');
    
    // 縞々模様
    for (let i = 0; i < dataRows; i++) {
      if (i % 2 === 1) sheet.getRange(i + 2, 1, 1, numCols).setBackground('#fff2e6');
    }
  }
  
  range.setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setFrozenRows(1);
  
  // 列幅の設定
  sheet.setColumnWidth(1, 150); // 案件名
  sheet.setColumnWidth(2, 110); // 日付
  sheet.setColumnWidth(3, 50);  // 曜日
  sheet.setColumnWidth(4, 180); // カレンダー名
  sheet.setColumnWidth(5, 70);  // 開始
  sheet.setColumnWidth(6, 70);  // 終了
  sheet.setColumnWidth(7, 100); // 作業時間
  sheet.setColumnWidth(8, 150); // キーワード
  sheet.setColumnWidth(9, 350); // 内容
  sheet.setColumnWidth(10, 450); // 詳細
}
