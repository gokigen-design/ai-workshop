/**
 * AIワークショップ 宿題提出 GAS（縦並びバージョン）
 * ──────────────────────────────────────────────────────────
 * スプシのレイアウト:
 *   A列 = ラベル（確認済み / 提出日時 / お名前 / 参考URL / 壁打ち結果 / 講師メモ）
 *   B列以降 = 受講生1人ずつ横に追加されていく
 *
 *       A列         B列(さーやん)  C列(はなちゃん)  ...
 *   1   確認済み    ☐              ☐
 *   2   提出日時    6/3 14:22      6/3 15:01
 *   3   お名前      さーやん       はなちゃん
 *   4   参考URL     https://...    （なし）
 *   5   壁打ち結果  ## 1.FV...     ## 1.FV...
 *   6   講師メモ    （空欄）        （空欄）
 *
 * 使い方:
 * 1. 【3期生】AI_workshop スプシを開く
 * 2. 「拡張機能」→「Apps Script」
 * 3. このコードを全部貼り付け → 保存
 * 4. 「デプロイ」→「新しいデプロイ」
 *    種類: ウェブアプリ / 実行: 自分 / アクセス: 全員
 * 5. URLをあやさんがクロードに渡す
 * ──────────────────────────────────────────────────────────
 */

var SHEET_NAME = 'LPの内容';

// A列のラベル（行番号と対応）
var ROW_LABELS = [
  '確認済み',     // 行1: チェックボックス（講師が入力）
  '提出日時',     // 行2: 自動
  'お名前',       // 行3: 受講生入力
  '参考サイトURL',// 行4: 受講生入力（任意）
  '壁打ち結果',   // 行5: 受講生入力（長文）
  '講師メモ',     // 行6: 空欄（講師が入力）
];

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // ── A列にラベルがなければ初期設定 ──────────────────────
    var labelCheck = sheet.getRange(1, 1).getValue();
    if (labelCheck !== ROW_LABELS[0]) {
      initSheet(sheet);
    }

    // ── 次の空き列を探す（B列以降） ──────────────────────────
    var lastCol = sheet.getLastColumn();
    var newCol  = (lastCol < 2) ? 2 : lastCol + 1;

    // ── リクエストデータを取得 ───────────────────────────────
    var params  = JSON.parse(e.postData.contents);
    var name    = (params.name    || '').trim() || '（名前未入力）';
    var content = (params.content || '').trim() || '（内容未入力）';
    var refUrl  = (params.refUrl  || '').trim() || '（なし）';
    var ts      = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

    // ── データを列に書き込む ─────────────────────────────────
    // 行1: チェックボックス（初期値: 未チェック）
    var checkCell = sheet.getRange(1, newCol);
    checkCell.insertCheckboxes();
    checkCell.setValue(false);
    checkCell.setHorizontalAlignment('center');

    // 行2: 提出日時
    sheet.getRange(2, newCol).setValue(ts);

    // 行3: お名前（太字・色付き）
    var nameCell = sheet.getRange(3, newCol);
    nameCell.setValue(name);
    nameCell.setFontWeight('bold');
    nameCell.setFontColor('#1E40AF');

    // 行4: 参考サイトURL
    sheet.getRange(4, newCol).setValue(refUrl);

    // 行5: 壁打ち結果（折り返し表示・高さ拡張）
    var contentCell = sheet.getRange(5, newCol);
    contentCell.setValue(content);
    contentCell.setWrap(true);
    contentCell.setVerticalAlignment('top');

    // 行6: 講師メモ（空欄・背景色で強調）
    var memoCell = sheet.getRange(6, newCol);
    memoCell.setValue('');
    memoCell.setBackground('#FFF9E6');
    memoCell.setWrap(true);

    // 列幅を設定（長文が入るので広めに）
    sheet.setColumnWidth(newCol, 320);

    // 行5の高さを広げる（壁打ち結果が長いので）
    sheet.setRowHeight(5, 400);

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

// ── シートの初期設定（ラベル列を作る） ────────────────────────
function initSheet(sheet) {
  sheet.clearContents();
  sheet.clearFormats();

  // A列にラベルを縦に設定
  for (var i = 0; i < ROW_LABELS.length; i++) {
    var cell = sheet.getRange(i + 1, 1);
    cell.setValue(ROW_LABELS[i]);
    cell.setFontWeight('bold');
    cell.setBackground('#1E40AF');
    cell.setFontColor('#FFFFFF');
    cell.setHorizontalAlignment('center');
    cell.setVerticalAlignment('middle');
  }

  // A列の幅
  sheet.setColumnWidth(1, 130);

  // 各行の高さ
  sheet.setRowHeight(1, 36);  // 確認済み（チェックボックス）
  sheet.setRowHeight(2, 36);  // 提出日時
  sheet.setRowHeight(3, 36);  // お名前
  sheet.setRowHeight(4, 60);  // 参考URL
  sheet.setRowHeight(5, 400); // 壁打ち結果（長文）
  sheet.setRowHeight(6, 100); // 講師メモ

  // 先頭行・列を固定（スクロールしてもA列・1行目が見える）
  sheet.setFrozenColumns(1);
}

// 動作確認用
function doGet(e) {
  return ContentService
    .createTextOutput('AIワークショップ 宿題提出フォーム — 接続OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
