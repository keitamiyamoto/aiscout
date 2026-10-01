/**
 * 受け口 GAS: アプリから送られた1行をタブに追記し、Chatwork に通知する。
 * 「市場価値調べるくん」と「履歴書作る君」の両方が、同じスプレッドシートのこの GAS に送る (タブで分ける)。
 *
 * ■ 設定手順 (スプレッドシートのオーナーのアカウントで行う)
 *   1. スプレッドシートを開き「拡張機能 > Apps Script」に、このファイルの中身を貼り付けて保存
 *   2. 「プロジェクトの設定 (歯車) > スクリプト プロパティ」に次の3つを追加
 *        WEBHOOK_TOKEN    … アプリと共有する合言葉 (Vercel の SHEETS_WEBHOOK_TOKEN と同じ値)
 *        CHATWORK_TOKEN   … Chatwork の API トークン
 *        CHATWORK_ROOM_ID … 通知先ルームの ID (ルーム URL の #!rid の後ろの数字)
 *   3. エディタ上部の関数選択で testChatwork を選んで実行 → 権限を承認 → Chatwork にテスト通知が届くか確認
 *   4. 右上「デプロイ > 新しいデプロイ」→ 種類「ウェブアプリ」
 *        実行するユーザー: 自分
 *        アクセスできるユーザー: 全員
 *      → 表示される「ウェブアプリの URL」(…/exec) を Vercel の SHEETS_WEBHOOK_URL に設定
 *   ※ 後でこのコードを書き換えたら「デプロイを管理 > 編集 > バージョン: 新バージョン」で更新する (URL は変わらない)
 *
 * ■ タブ
 *   アプリが送ってきたタブ名のタブに書く。無ければ作り、1行目に見出しを書く。
 *   列は見出し名で合わせるので、列を並べ替えたり、右端に自分用の列を足したりしても大丈夫。
 *   アプリ側で新しい列が増えたら、右端に自動で見出しを追加する。
 */

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const props = PropertiesService.getScriptProperties();
    const token = props.getProperty("WEBHOOK_TOKEN");
    if (!token || body.token !== token) return json_({ ok: false, error: "invalid token" });
    if (!body.sheet || !Array.isArray(body.headers) || !Array.isArray(body.values)) {
      return json_({ ok: false, error: "sheet / headers / values が必要です" });
    }

    appendRow_(String(body.sheet), body.headers.map(String), body.values);

    if (body.notify) {
      try {
        postToChatwork_(String(body.notify));
      } catch (err) {
        // 通知に失敗してもシートへの追記は成功扱いにする (アプリ側の再送で行が重複しないように)
        console.error(err);
        return json_({ ok: true, notified: false, error: String(err) });
      }
    }
    return json_({ ok: true, notified: Boolean(body.notify) });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  }
}

/** ブラウザで URL を開いたときの動作確認用 */
function doGet() {
  return json_({ ok: true, message: "sheets-webhook is running" });
}

function appendRow_(sheetName, headers, values) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // 同時に送られてきても行が混ざらないように
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    // 見出し行をそろえる (無ければ書く、足りない列は右端に足す)
    let current = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0] : [];
    if (current.every((h) => h === "")) current = [];
    const missing = headers.filter((h) => current.indexOf(h) === -1);
    if (missing.length) {
      sheet.getRange(1, current.length + 1, 1, missing.length).setValues([missing]).setFontWeight("bold");
      current = current.concat(missing);
      sheet.setFrozenRows(1);
    }

    // 見出し名で値を並べ替えて追記
    const row = current.map((h) => {
      const i = headers.indexOf(h);
      return i === -1 ? "" : values[i];
    });
    // 「090-…」などが数式や数値に化けないよう、文字列として書く
    const range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length);
    range.setNumberFormat("@").setValues([row]);
  } finally {
    lock.releaseLock();
  }
}

function postToChatwork_(body) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("CHATWORK_TOKEN");
  const roomId = props.getProperty("CHATWORK_ROOM_ID");
  if (!token || !roomId) return; // 未設定なら通知しない
  const res = UrlFetchApp.fetch("https://api.chatwork.com/v2/rooms/" + roomId + "/messages", {
    method: "post",
    headers: { "X-ChatWorkToken": token },
    payload: { body: body },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) {
    throw new Error("Chatwork API " + res.getResponseCode() + ": " + res.getContentText().slice(0, 300));
  }
}

/** 設定確認用: Chatwork にテスト通知を送る (エディタから実行) */
function testChatwork() {
  postToChatwork_("[info][title]テスト通知[/title]スプレッドシート連携の設定が完了しました。[/info]");
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
