/**
 * AIワークショップ 宿題提出 GAS（縦並びバージョン）
 * ──────────────────────────────────────────────────────────
 * スプシのレイアウト:
 *   A列 = ラベル
 *   B列以降 = 受講生1人ずつ横に追加されていく
 *
 *    行  ラベル
 *    1   確認済み
 *    2   提出日時
 *    3   お名前
 *    4   デザイン参考①
 *    5   デザイン参考②
 *    6   デザイン参考③
 *    7   内容参考①
 *    8   内容参考②
 *    9   内容参考③
 *   10   壁打ち結果
 *   11   講師メモ
 * ──────────────────────────────────────────────────────────
 */

var SHEET_NAME = 'LPの内容';

var ROW_LABELS = [
  '確認済み',      // 行1
  '提出日時',      // 行2
  'お名前',        // 行3
  'デザイン参考①', // 行4
  'デザイン参考②', // 行5
  'デザイン参考③', // 行6
  '内容参考①',    // 行7
  '内容参考②',    // 行8
  '内容参考③',    // 行9
  '壁打ち結果',    // 行10
  '講師メモ',      // 行11
];

// ── マークダウン記号を除去して読みやすいプレーンテキストにする ──
function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-*+]\s+/gm, '・')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^---+$/gm, '──────────────')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // A列にラベルがなければ初期設定
    var labelCheck = sheet.getRange(1, 1).getValue();
    if (labelCheck !== ROW_LABELS[0]) {
      initSheet(sheet);
    }

    // 次の空き列を探す（B列以降）
    var lastCol = sheet.getLastColumn();
    var newCol  = (lastCol < 2) ? 2 : lastCol + 1;

    // リクエストデータを取得
    var params       = JSON.parse(e.postData.contents);
    var name         = (params.name         || '').trim() || '（名前未入力）';
    var rawContent   = (params.content      || '').trim() || '（内容未入力）';
    var refUrl1      = (params.refUrl1      || '').trim() || '（なし）';
    var refUrl2      = (params.refUrl2      || '').trim() || '（なし）';
    var refUrl3      = (params.refUrl3      || '').trim() || '（なし）';
    var contentUrl1  = (params.refContent1  || '').trim() || '（なし）';
    var contentUrl2  = (params.refContent2  || '').trim() || '（なし）';
    var contentUrl3  = (params.refContent3  || '').trim() || '（なし）';
    var ts           = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

    var content = stripMarkdown(rawContent);

    // 行1: チェックボックス
    var checkCell = sheet.getRange(1, newCol);
    checkCell.insertCheckboxes();
    checkCell.setValue(false);
    checkCell.setHorizontalAlignment('center');

    // 行2: 提出日時
    sheet.getRange(2, newCol).setValue(ts);

    // 行3: お名前
    var nameCell = sheet.getRange(3, newCol);
    nameCell.setValue(name);
    nameCell.setFontWeight('bold');
    nameCell.setFontColor('#1E40AF');

    // 行4〜6: デザイン参考URL
    sheet.getRange(4, newCol).setValue(refUrl1);
    sheet.getRange(5, newCol).setValue(refUrl2);
    sheet.getRange(6, newCol).setValue(refUrl3);

    // 行7〜9: 内容参考URL
    sheet.getRange(7, newCol).setValue(contentUrl1);
    sheet.getRange(8, newCol).setValue(contentUrl2);
    sheet.getRange(9, newCol).setValue(contentUrl3);

    // 行10: 壁打ち結果
    var contentCell = sheet.getRange(10, newCol);
    contentCell.setValue(content);
    contentCell.setWrap(true);
    contentCell.setVerticalAlignment('top');
    contentCell.setFontSize(11);

    // 行11: 講師メモ
    var memoCell = sheet.getRange(11, newCol);
    memoCell.setValue('');
    memoCell.setBackground('#FFF9E6');
    memoCell.setWrap(true);

    // 列幅
    sheet.setColumnWidth(newCol, 320);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'ok',
        name:    name,
        charLen: content.length,
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function initSheet(sheet) {
  sheet.clearContents();
  sheet.clearFormats();

  for (var i = 0; i < ROW_LABELS.length; i++) {
    var cell = sheet.getRange(i + 1, 1);
    cell.setValue(ROW_LABELS[i]);
    cell.setFontWeight('bold');
    cell.setBackground('#1E40AF');
    cell.setFontColor('#FFFFFF');
    cell.setHorizontalAlignment('center');
    cell.setVerticalAlignment('middle');
  }

  sheet.setColumnWidth(1, 130);

  sheet.setRowHeight(1,  36);   // 確認済み
  sheet.setRowHeight(2,  36);   // 提出日時
  sheet.setRowHeight(3,  36);   // お名前
  sheet.setRowHeight(4,  50);   // デザイン参考①
  sheet.setRowHeight(5,  50);   // デザイン参考②
  sheet.setRowHeight(6,  50);   // デザイン参考③
  sheet.setRowHeight(7,  50);   // 内容参考①
  sheet.setRowHeight(8,  50);   // 内容参考②
  sheet.setRowHeight(9,  50);   // 内容参考③
  sheet.setRowHeight(10, 1200); // 壁打ち結果
  sheet.setRowHeight(11, 120);  // 講師メモ

  sheet.setFrozenColumns(1);
}

function doGet(e) {
  return ContentService
    .createTextOutput('AIワークショップ 宿題提出フォーム — 接続OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
