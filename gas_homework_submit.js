/**
 * AIワークショップ 宿題提出 GAS（縦並びバージョン）
 * ──────────────────────────────────────────────────────────
 * スプシのレイアウト:
 *   A列 = ラベル（確認済み / 提出日時 / お名前 / 参考URL① / 参考URL② / 参考URL③ / 壁打ち結果 / 講師メモ）
 *   B列以降 = 受講生1人ずつ横に追加されていく
 *
 *       A列         B列(さーやん)  C列(はなちゃん)  ...
 *   1   確認済み    ☐              ☐
 *   2   提出日時    6/3 14:22      6/3 15:01
 *   3   お名前      さーやん       はなちゃん
 *   4   参考URL①   https://...    （なし）
 *   5   参考URL②   https://...    （なし）
 *   6   参考URL③   （なし）        （なし）
 *   7   壁打ち結果  ## 1.FV...     ## 1.FV...
 *   8   講師メモ    （空欄）        （空欄）
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
  '参考URL①',    // 行4: 受講生入力（任意）
  '参考URL②',    // 行5: 受講生入力（任意）
  '参考URL③',    // 行6: 受講生入力（任意）
  '壁打ち結果',   // 行7: 受講生入力（長文）
  '講師メモ',     // 行8: 空欄（講師が入力）
];

// ── マークダウン記号を除去して読みやすいプレーンテキストにする ──
function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s*/gm, '')           // ## 見出し記号を除去
    .replace(/\*\*(.+?)\*\*/g, '$1')       // **太字** → テキストのみ
    .replace(/\*(.+?)\*/g, '$1')           // *斜体* → テキストのみ
    .replace(/^[-*+]\s+/gm, '・')          // - 箇条書き → ・
    .replace(/^\d+\.\s+/gm, '')            // 1. 番号リスト記号を除去
    .replace(/^---+$/gm, '──────────────') // --- 区切り線
    .replace(/`(.+?)`/g, '$1')             // `code` → テキストのみ
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')    // [リンクテキスト](URL) → テキストのみ
    .replace(/\n{3,}/g, '\n\n')            // 3行以上の空行 → 2行に
    .trim();
}

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
    var rawContent = (params.content || '').trim() || '（内容未入力）';
    var refUrl1 = (params.refUrl1 || '').trim() || '（なし）';
    var refUrl2 = (params.refUrl2 || '').trim() || '（なし）';
    var refUrl3 = (params.refUrl3 || '').trim() || '（なし）';
    var ts      = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

    // マークダウン記号を除去して読みやすいテキストに変換
    var content = stripMarkdown(rawContent);

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

    // 行4: 参考URL①
    sheet.getRange(4, newCol).setValue(refUrl1);

    // 行5: 参考URL②
    sheet.getRange(5, newCol).setValue(refUrl2);

    // 行6: 参考URL③
    sheet.getRange(6, newCol).setValue(refUrl3);

    // 行7: 壁打ち結果（折り返し表示・読みやすいプレーンテキスト）
    var contentCell = sheet.getRange(7, newCol);
    contentCell.setValue(content);
    contentCell.setWrap(true);
    contentCell.setVerticalAlignment('top');
    contentCell.setFontSize(11);

    // 行8: 講師メモ（空欄・背景色で強調）
    var memoCell = sheet.getRange(8, newCol);
    memoCell.setValue('');
    memoCell.setBackground('#FFF9E6');
    memoCell.setWrap(true);

    // 列幅を設定（長文が入るので広めに）
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
  sheet.setRowHeight(1, 36);    // 確認済み（チェックボックス）
  sheet.setRowHeight(2, 36);    // 提出日時
  sheet.setRowHeight(3, 36);    // お名前
  sheet.setRowHeight(4, 50);    // 参考URL①
  sheet.setRowHeight(5, 50);    // 参考URL②
  sheet.setRowHeight(6, 50);    // 参考URL③
  sheet.setRowHeight(7, 1200);  // 壁打ち結果（長文対応・大きめに設定）
  sheet.setRowHeight(8, 120);   // 講師メモ

  // 先頭列を固定（スクロールしてもA列が見える）
  sheet.setFrozenColumns(1);
}

// 動作確認用
function doGet(e) {
  return ContentService
    .createTextOutput('AIワークショップ 宿題提出フォーム — 接続OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
