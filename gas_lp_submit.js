/**
 * AIワークショップ 1期生 LP内容提出フォーム用 GAS スクリプト
 * スプレッドシートID: 1Z0PjRfKaRT7fBTYzQX9XPZ9KykT0Wt1Y1Y8TwaMSyDc
 *
 * レイアウト：縦並び
 * A列 = 項目名、B列以降 = 受講生ごとのデータ（列が増えていく）
 *
 * 送信タイプ：
 * ・通常送信（type未指定）→ 全データを新しい列に追加
 * ・url_update → 名前で既存列を探してURLだけ上書き（なければ新列）
 */

const SHEET_ID = '1Z0PjRfKaRT7fBTYzQX9XPZ9KykT0Wt1Y1Y8TwaMSyDc';
const SHEET_NAME = 'LPの内容';

const LABELS = [
  '送信日時',
  'お名前',
  'インスタURL',
  'ターゲット',
  'サービス名・内容',
  '価格',
  '申込みURL',
  'お悩み（2-a）',
  'ベネフィット（2-b）',
  'サービス詳細・カリキュラム（3-a）',
  'お客様の声（3-b）',
  'FAQ（3-c）',
  'タイムテーブル（3-d）',
  '講師自己紹介（3-e）',
  'クロージング（4-a）',
  '登録特典（4-b）',
  'ビフォーLP_URL',
  'アフターLP_URL',
];

// 行番号（1始まり）
const ROW = {
  timestamp: 1,
  name:      2,
  beforeUrl: 17,
  afterUrl:  18,
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    let   sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    // A列に項目名を設定（まだ入っていない場合のみ）
    setupLabels(sheet);

    if (data.type === 'url_update') {
      // URLだけ更新
      const col = findColByName(sheet, data.name);
      const targetCol = col > 0 ? col : addNewCol(sheet, data);

      if (data.beforeUrl) sheet.getRange(ROW.beforeUrl, targetCol).setValue(data.beforeUrl);
      if (data.afterUrl)  sheet.getRange(ROW.afterUrl,  targetCol).setValue(data.afterUrl);

    } else {
      // 全データを新しい列に追加
      addNewCol(sheet, data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: '送信完了' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 名前でB列以降を検索し、見つかった列番号を返す（見つからなければ -1）
function findColByName(sheet, name) {
  const lastCol = sheet.getLastColumn();
  for (let col = 2; col <= lastCol; col++) {
    if (sheet.getRange(ROW.name, col).getValue() === name) return col;
  }
  return -1;
}

// 新しい列にデータを書き込んで列番号を返す
function addNewCol(sheet, data) {
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  const VALUES = [
    now,
    data.name        || '',
    data.instagram   || '',
    data.target      || '',
    data.service     || '',
    data.price       || '',
    data.applyUrl    || '',
    data.troubles    || '',
    data.benefits    || '',
    data.curriculum  || '',
    data.voices      || '',
    data.faq         || '',
    data.timetable   || '',
    data.bio         || '',
    data.closing     || '',
    data.bonus       || '',
    data.beforeUrl   || '',
    data.afterUrl    || '',
  ];

  const nextCol = Math.max(sheet.getLastColumn(), 1) + 1;
  for (let i = 0; i < VALUES.length; i++) {
    sheet.getRange(i + 1, nextCol).setValue(VALUES[i]);
  }

  // 送信日時セルを色付け
  const h = sheet.getRange(ROW.timestamp, nextCol);
  h.setBackground('#E8F0FE');
  h.setFontWeight('bold');
  sheet.setColumnWidth(nextCol, 240);

  return nextCol;
}

// A列に項目ラベルを設定（初回のみ）
function setupLabels(sheet) {
  if (sheet.getRange(1, 1).getValue()) return; // すでに設定済み
  for (let i = 0; i < LABELS.length; i++) {
    sheet.getRange(i + 1, 1).setValue(LABELS[i]);
  }
  const r = sheet.getRange(1, 1, LABELS.length, 1);
  r.setFontWeight('bold');
  r.setBackground('#4F7EF7');
  r.setFontColor('#ffffff');
  r.setWrap(false);
  sheet.setColumnWidth(1, 200);
  sheet.setFrozenColumns(1);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'GAS is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
