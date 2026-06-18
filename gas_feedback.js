/**
 * AIワークショップ 1期生 当日感想フォーム用 GAS スクリプト
 * スプレッドシートID: 1Z0PjRfKaRT7fBTYzQX9XPZ9KykT0Wt1Y1Y8TwaMSyDc
 * シート名: 当日の感想
 *
 * レイアウト：横並び（1行目 = ヘッダー、2行目以降 = 受講生の回答）
 * 動的ヘッダー対応：初回は自動で列を作成、後から列が増えても対応可
 *
 * 受け取るフィールド:
 *   name, lp_url, satisfaction, free_comment, memorable,
 *   confidence_before, confidence_after, nps, nps_reason,
 *   change, first_action, improvement, testimonial, testimonial_ok, timestamp
 */

const FEEDBACK_SHEET_ID   = '1Z0PjRfKaRT7fBTYzQX9XPZ9KykT0Wt1Y1Y8TwaMSyDc';
const FEEDBACK_SHEET_NAME = '当日の感想';

// 列の定義（順番＋表示ラベル）
const FEEDBACK_COLUMNS = [
  { key: 'timestamp',         label: '送信日時' },
  { key: 'name',              label: 'お名前' },
  { key: 'lp_url',            label: '当日のLP URL' },
  { key: 'satisfaction',      label: '満足度（1-5）' },
  { key: 'confidence_before', label: '受講前の自信（1-5）' },
  { key: 'confidence_after',  label: '受講後の自信（1-5）' },
  { key: 'nps',               label: '紹介したい度（1-5）' },
  { key: 'nps_reason',        label: '紹介したい理由' },
  { key: 'memorable',         label: '一番印象に残ったこと' },
  { key: 'change',            label: 'これから変えたいこと' },
  { key: 'first_action',      label: '明日やること（最初の一手）' },
  { key: 'improvement',       label: '改善してほしいこと' },
  { key: 'free_comment',      label: '自由コメント' },
  { key: 'testimonial',       label: 'お客様の声（掲載用）' },
  { key: 'testimonial_ok',    label: '掲載許可' },
];

function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.openById(FEEDBACK_SHEET_ID);
    let   sheet = ss.getSheetByName(FEEDBACK_SHEET_NAME);

    // シートがなければ新規作成
    if (!sheet) {
      sheet = ss.insertSheet(FEEDBACK_SHEET_NAME);
    }

    // ヘッダー行のセットアップ（初回のみ）
    setupFeedbackHeaders(sheet);

    // データを追記
    appendFeedbackRow(sheet, data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: '感想を受け取りました' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 1行目にヘッダーを設定（まだ空の場合のみ）
function setupFeedbackHeaders(sheet) {
  if (sheet.getRange(1, 1).getValue()) return; // すでに設定済み

  for (let i = 0; i < FEEDBACK_COLUMNS.length; i++) {
    sheet.getRange(1, i + 1).setValue(FEEDBACK_COLUMNS[i].label);
  }

  // ヘッダー行を見やすくスタイリング
  const headerRange = sheet.getRange(1, 1, 1, FEEDBACK_COLUMNS.length);
  headerRange.setBackground('#C96A3A');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setWrap(false);

  // 列幅を調整
  sheet.setColumnWidth(1, 160);  // 送信日時
  sheet.setColumnWidth(2, 120);  // お名前
  sheet.setColumnWidth(3, 280);  // LP URL
  for (let i = 4; i <= FEEDBACK_COLUMNS.length; i++) {
    sheet.setColumnWidth(i, 200);
  }

  sheet.setFrozenRows(1);
}

// 新しい行にデータを追記
function appendFeedbackRow(sheet, data) {
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

  const row = FEEDBACK_COLUMNS.map(col => {
    if (col.key === 'timestamp') return now;
    const v = data[col.key];
    return v !== undefined && v !== null ? v : '';
  });

  const nextRow = Math.max(sheet.getLastRow(), 1) + 1;
  sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

  // 偶数行に薄い背景色（見やすくする）
  if (nextRow % 2 === 0) {
    sheet.getRange(nextRow, 1, 1, row.length).setBackground('#FDF8F4');
  }
}

// 動作確認用（ブラウザからURLを開いたときに返答する）
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status:  'ok',
      message: 'フィードバックGAS は正常に動いています',
      sheet:   FEEDBACK_SHEET_NAME
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
