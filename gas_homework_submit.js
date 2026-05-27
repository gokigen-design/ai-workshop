/**
 * AIワークショップ 宿題提出 GAS（新バージョン）
 * ──────────────────────────────────────────────────────────
 * 貼り付け先: 【3期生】AI_workshop_20260606_osaka スプレッドシート
 * ターゲットシート: 「LPの内容」タブ
 *
 * 使い方:
 * 1. 【3期生】AI_workshop_... スプシを開く
 * 2. メニュー「拡張機能」→「Apps Script」
 * 3. このファイルの内容を全部コピーして貼り付け（既存コードは全消し）
 * 4. 保存（Ctrl+S）
 * 5. 「デプロイ」→「新しいデプロイ」
 *    種類: ウェブアプリ
 *    実行ユーザー: 自分
 *    アクセス: 全員（匿名ユーザーを含む）
 * 6. デプロイ後に表示される URL をあやさんがクロードに渡す
 * ──────────────────────────────────────────────────────────
 */

var SHEET_NAME = 'LPの内容';

// ─── ヘッダー定義 ───────────────────────────────────────
var HEADERS = [
  'タイムスタンプ',
  'お名前',
  '壁打ち結果（全文）',
  '文字数',
  '参考にしたいサイトURL',
  'ステータス',    // 講師が入力: 未確認 / 確認済み / フィードバック済み
  '講師メモ',      // 講師のコメント欄
];

// ─── 列幅（文字数）───────────────────────────────────────
var COL_WIDTHS = [160, 130, 600, 70, 300, 100, 300];

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // シートが存在しない場合は作成
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // ヘッダー行が正しく設定されているか確認・修正
    var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    var needsHeader = firstRow[0] !== HEADERS[0];
    if (needsHeader) {
      sheet.clearContents();
      var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setValues([HEADERS]);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1E40AF');
      headerRange.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
      // 列幅を設定
      for (var i = 0; i < COL_WIDTHS.length; i++) {
        sheet.setColumnWidth(i + 1, COL_WIDTHS[i]);
      }
    }

    // リクエストデータを取得
    var params  = JSON.parse(e.postData.contents);
    var name    = (params.name    || '').trim() || '（名前未入力）';
    var content = (params.content || '').trim() || '（内容未入力）';
    var refUrl  = (params.refUrl  || '').trim();
    var ts      = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
    var charLen = content.length;

    // 1行追加（ステータス・講師メモは空欄でスタート）
    sheet.appendRow([ts, name, content, charLen, refUrl, '', '']);

    // 追加した行にストライプを適用（偶数行にうっすら色）
    var lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, HEADERS.length).setBackground('#F0F6FF');
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'ok',
        name: name,
        charLen: charLen,
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 動作確認用（ブラウザで直接URLを開いたとき）
function doGet(e) {
  return ContentService
    .createTextOutput('AIワークショップ 宿題提出フォーム — 接続OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
