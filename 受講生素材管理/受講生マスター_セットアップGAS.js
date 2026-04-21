/**
 * 受講生マスター スプレッドシート 自動セットアップ
 * ---------------------------------------------------
 * 使い方：
 *  1. Googleスプレッドシートを新規作成し「AIワークショップ 受講生マスター」と名前をつける
 *  2. 「拡張機能 > Apps Script」を開く
 *  3. このコードを全部コピペして、保存（フロッピーアイコン or Ctrl+S）
 *  4. 上部の関数選択で setupMasterSheet を選び、「実行」をクリック
 *  5. 権限の許可を求められたら許可する（初回のみ）
 *  6. 元のスプレッドシートに戻ると、色と罫線つきのテンプレが完成している！
 *
 * ※ 次回ワークショップ（第2回）以降は、作ったスプシを「コピーを作成」して使えばOK
 */

function setupMasterSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();

  // ---- 安全チェック：他のタブを誤って初期化しないようガード ----
  const currentName = sheet.getName();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const hasData = lastRow > 0 && lastCol > 0;
  const allowedNames = ['受講生マスター', 'シート1', 'Sheet1'];

  if (hasData && !allowedNames.includes(currentName)) {
    ui.alert(
      '⚠️ 実行を中止しました\n\n' +
      '現在「' + currentName + '」タブが開かれていますが、\n' +
      'このタブにはすでにデータが入っています。\n\n' +
      '「受講生マスター」という名前の空のタブを追加し、\n' +
      'そのタブを開いてから再度実行してください。'
    );
    return;
  }

  // タブ名を「受講生マスター」に確定
  if (currentName !== '受講生マスター') {
    sheet.setName('受講生マスター');
  }

  // いったん中身をクリア
  sheet.clear();
  sheet.clearFormats();

  // ---- カラー定義（あや好みの柔らかい色） ----
  const COLOR = {
    basic:    '#E3F2FD', // 薄いブルー（基本情報）
    image:    '#FCE4EC', // 薄いピンク（画像）
    text:     '#FFF9C4', // 薄いイエロー（感想文）
    manage:   '#E8F5E9', // 薄いグリーン（LP管理）
    header:   '#1E293B', // ヘッダー濃紺
    headerTx: '#FFFFFF', // ヘッダー文字色
    bandOdd:  '#FAFAFA', // 縞々（奇数行）
    bandEven: '#FFFFFF'  // 縞々（偶数行）
  };

  // ---- カテゴリ行（1行目：カテゴリ名） ----
  const categoryRow = [
    '■ 基本情報', '', '', '',
    '■ 画像・URL', '', '', '',
    '■ 感想文', '', '',
    '■ LP管理', '', ''
  ];

  // ---- ヘッダー行（2行目：項目名） ----
  const headers = [
    'ID',           // A
    '回次',         // B
    '名前',         // C
    '肩書き',       // D
    'アイコン画像URL', // E
    'Before画像URL',  // F
    'After画像URL',   // G
    '完成LP URL',     // H
    '感想（短・チップ用）', // I
    '感想（長・LP本文用）', // J
    'メッセージ（受けたい人へ）', // K
    'LP掲載OK',       // L
    'LP反映済み',     // M
    '備考'            // N
  ];

  // ---- サンプル行（あやが見て分かりやすいよう1行だけ例を入れる） ----
  const sample = [
    'WS01-01-yamada',
    '第1回（2026/4/18）',
    'やまださん',
    '30代・ハンドメイド作家',
    'https://drive.google.com/...',
    'https://drive.google.com/...',
    'https://drive.google.com/...',
    'https://...',
    '構成の迷子から抜け出せました',
    'もともと独学でCanvaを触っていましたが、構成のどこから手をつけていいか分からず……（ここに長文）',
    'AIを使える人になりたい＋伝わるデザインも欲しい方におすすめ！',
    '◯',
    false,
    ''
  ];

  // ---- データ書き込み ----
  sheet.getRange(1, 1, 1, categoryRow.length).setValues([categoryRow]);
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(3, 1, 1, sample.length).setValues([sample]);

  // ---- カテゴリ行の結合＋色分け ----
  // 基本情報 A1:D1
  sheet.getRange('A1:D1').merge().setBackground(COLOR.basic).setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center');
  // 画像・URL E1:H1
  sheet.getRange('E1:H1').merge().setBackground(COLOR.image).setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center');
  // 感想文 I1:K1
  sheet.getRange('I1:K1').merge().setBackground(COLOR.text).setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center');
  // LP管理 L1:N1
  sheet.getRange('L1:N1').merge().setBackground(COLOR.manage).setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center');

  // ---- ヘッダー行の装飾 ----
  const headerRange = sheet.getRange(2, 1, 1, headers.length);
  headerRange.setBackground(COLOR.header).setFontColor(COLOR.headerTx).setFontWeight('bold').setFontSize(10).setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
  sheet.setRowHeight(2, 36);

  // ---- データ領域にカテゴリ色をうっすら適用（3行目〜62行目まで準備） ----
  // 第1回14名＋余裕を持って60名分（4〜5回分）の枠を確保
  const DATA_START = 3;
  const DATA_ROWS = 60;

  // 基本情報（薄いブルー）
  sheet.getRange(DATA_START, 1, DATA_ROWS, 4).setBackground(COLOR.basic);
  // 画像・URL（薄いピンク）
  sheet.getRange(DATA_START, 5, DATA_ROWS, 4).setBackground(COLOR.image);
  // 感想文（薄いイエロー）
  sheet.getRange(DATA_START, 9, DATA_ROWS, 3).setBackground(COLOR.text);
  // LP管理（薄いグリーン）
  sheet.getRange(DATA_START, 12, DATA_ROWS, 3).setBackground(COLOR.manage);

  // ---- 全体の罫線（横線で1人ごとに区切る） ----
  const fullRange = sheet.getRange(1, 1, DATA_START + DATA_ROWS - 1, headers.length);
  fullRange.setBorder(true, true, true, true, true, true, '#B0BEC5', SpreadsheetApp.BorderStyle.SOLID);

  // ---- カテゴリの境目は太い縦線 ----
  // 基本情報 と 画像・URL の間（D列 と E列の間）
  sheet.getRange(1, 4, DATA_START + DATA_ROWS - 1, 1)
    .setBorder(null, null, null, true, null, null, '#455A64', SpreadsheetApp.BorderStyle.SOLID_THICK);
  // 画像 と 感想 の間（H/I）
  sheet.getRange(1, 8, DATA_START + DATA_ROWS - 1, 1)
    .setBorder(null, null, null, true, null, null, '#455A64', SpreadsheetApp.BorderStyle.SOLID_THICK);
  // 感想 と LP管理 の間（K/L）
  sheet.getRange(1, 11, DATA_START + DATA_ROWS - 1, 1)
    .setBorder(null, null, null, true, null, null, '#455A64', SpreadsheetApp.BorderStyle.SOLID_THICK);
  // ヘッダー行の下（2行目の下）
  sheet.getRange(2, 1, 1, headers.length)
    .setBorder(null, null, true, null, null, null, '#455A64', SpreadsheetApp.BorderStyle.SOLID_THICK);

  // ---- 列幅の調整 ----
  sheet.setColumnWidth(1, 160);  // ID
  sheet.setColumnWidth(2, 140);  // 回次
  sheet.setColumnWidth(3, 120);  // 名前
  sheet.setColumnWidth(4, 180);  // 肩書き
  sheet.setColumnWidth(5, 180);  // アイコンURL
  sheet.setColumnWidth(6, 180);  // Before URL
  sheet.setColumnWidth(7, 180);  // After URL
  sheet.setColumnWidth(8, 180);  // 完成LP URL
  sheet.setColumnWidth(9, 220);  // 感想短
  sheet.setColumnWidth(10, 360); // 感想長
  sheet.setColumnWidth(11, 300); // メッセージ
  sheet.setColumnWidth(12, 90);  // LP掲載OK
  sheet.setColumnWidth(13, 100); // LP反映済み
  sheet.setColumnWidth(14, 180); // 備考

  // ---- テキストの折り返し＆縦位置 ----
  sheet.getRange(DATA_START, 1, DATA_ROWS, headers.length)
    .setWrap(true)
    .setVerticalAlignment('top')
    .setFontSize(10);

  // ---- LP掲載OK列にプルダウン（◯ / △ / ×） ----
  const rulePublish = SpreadsheetApp.newDataValidation()
    .requireValueInList(['◯', '△', '×'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(DATA_START, 12, DATA_ROWS, 1).setDataValidation(rulePublish).setHorizontalAlignment('center');

  // ---- LP反映済み列にチェックボックス ----
  sheet.getRange(DATA_START, 13, DATA_ROWS, 1).insertCheckboxes();
  sheet.getRange(DATA_START, 13, DATA_ROWS, 1).setHorizontalAlignment('center');

  // ---- 1〜2行目を固定（スクロールしてもヘッダーが常に見える） ----
  sheet.setFrozenRows(2);
  // ※ 列の固定はカテゴリ結合セルとの競合で動作しないため、あえて設定しない

  // ---- シート末尾の余分な列・行を削除（見た目スッキリ） ----
  const maxCols = sheet.getMaxColumns();
  if (maxCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, maxCols - headers.length);
  }
  const maxRows = sheet.getMaxRows();
  const targetRows = DATA_START + DATA_ROWS - 1;
  if (maxRows > targetRows) {
    sheet.deleteRows(targetRows + 1, maxRows - targetRows);
  }

  // ---- サンプル行は薄く補足色（削除OKと分かる色） ----
  sheet.getRange(DATA_START, 1, 1, headers.length).setFontStyle('italic').setFontColor('#546E7A');
  sheet.getRange('A3').setNote('このサンプル行は、1人目を入れるときに上書きor削除してOKです');

  // ---- 完了メッセージ ----
  SpreadsheetApp.getUi().alert(
    '受講生マスターのセットアップが完了しました！\n\n' +
    '・3行目のサンプルは、削除 or 上書きしてください\n' +
    '・2人目以降は4行目・5行目と下に足していくだけでOK\n' +
    '・L列（LP掲載OK）はプルダウンから選べます\n' +
    '・M列（LP反映済み）はチェックボックスです'
  );
}

/**
 * 【おまけ】第2回以降のために「新しい回次」を追加する補助関数
 * カテゴリ色や罫線は維持したまま、空の5行をまとめて挿入します
 */
function addFiveRowsForNextRound() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  sheet.insertRowsAfter(lastRow, 5);
  // 色は上の行がコピーされるので、基本的には何もしなくてOK
  SpreadsheetApp.getUi().alert('5行追加しました！新しい回次の受講生情報を入れてください。');
}
