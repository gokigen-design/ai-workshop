/**
 * 業務棚卸しセッション ランキング集計スクリプト
 * Google Apps Script (GAS) に貼り付けてデプロイしてください
 *
 * 【設定手順】
 * 1. Googleドライブで新しいスプレッドシートを作成
 * 2. スプレッドシートのURLからIDをコピー
 *    例: https://docs.google.com/spreadsheets/d/【ここがID】/edit
 * 3. 下の SPREADSHEET_ID にそのIDを貼り付ける
 * 4. メニュー「拡張機能」→「Apps Script」で新しいGASプロジェクトを開く
 * 5. このコードをすべて貼り付けて保存（Ctrl+S）
 * 6. メニュー「デプロイ」→「新しいデプロイ」をクリック
 * 7. 種類：「ウェブアプリ」を選択
 * 8. 「次のユーザーとして実行」→「自分」
 * 9. 「アクセスできるユーザー」→「全員」
 * 10. デプロイ → 表示されるURLをコピー
 * 11. gyomu-棚卸しsession.html の GAS_URL にそのURLを貼り付ける
 */

var SPREADSHEET_ID = '1jJwUm80Rs8TyY1UjiTBMa5QFwIDLrpUFXHPQMgvu6dE';
var SHEET_NAME = '棚卸し回答';

// GETパラメーターで受け取る方式（CORS問題を回避するため）
function doGet(e) {
  try {
    var name   = e.parameter.name   || '';
    var result = e.parameter.result || '';

    // パラメーターがない場合は動作確認メッセージを返す
    if (!name && !result) {
      return ContentService
        .createTextOutput('業務棚卸しランキング受付中です')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    // シートがなければ作成してヘッダーを追加
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['受信日時', 'お名前', 'Claudeの回答（ベスト3）']);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
      sheet.setColumnWidth(1, 160);
      sheet.setColumnWidth(2, 100);
      sheet.setColumnWidth(3, 500);
    }

    sheet.appendRow([
      new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
      name || '匿名',
      result
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// doPost は念のため残す
function doPost(e) {
  return doGet(e);
}

/**
 * ─── ランキング集計用プロンプト ──────────────────────────────
 * セッション終了後、スプレッドシートの内容をコピーして
 * Claudeに以下のプロンプトと一緒に渡すと即座にランキングが出ます。
 *
 * 【Claudeへのプロンプト】
 * ─────────────────────────────────────────────────────
 * 以下はAIワークショップ参加者が「自動化したい業務ベスト3」として
 * 提出した回答一覧です。
 *
 * 各回答から「1位に選んだ業務」を抽出して、
 * 全体で最も多く挙げられた業務トップ10をランキング形式で教えてください。
 * 同じ内容でも表現が違う場合は同一としてカウントしてください。
 *
 * 【回答一覧】
 * （ここにスプレッドシートの「Claudeの回答」列の内容を貼り付ける）
 * ─────────────────────────────────────────────────────
 */
