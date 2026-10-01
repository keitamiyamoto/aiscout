/**
 * 市場価値調べるくん: スプレッドシートに追加された行を Chatwork に通知する GAS
 *
 * ■ なぜ「1分ごとのチェック」なのか
 *   アプリは Google Sheets API で行を追記します。API による書き込みでは onEdit / onChange トリガーが
 *   発火しないため、時間主導トリガー (1分ごと) で「前回通知した行より下」を見に行きます。
 *   通知の遅れは最大1分程度です。
 *
 * ■ 設定手順
 *   1. 転記先のスプレッドシートを開き「拡張機能 > Apps Script」にこのファイルの中身を貼り付けて保存
 *   2. 「プロジェクトの設定 > スクリプト プロパティ」に次の2つを追加
 *        CHATWORK_TOKEN   … Chatwork の API トークン (通知用アカウントで発行)
 *        CHATWORK_ROOM_ID … 通知先ルームの ID (ルームURL の #!rid の後ろの数字)
 *   3. 関数 setup を1回だけ実行 (権限の承認ダイアログが出たら許可)
 *      → いまある行は通知済み扱いになり、以後 1分ごとに新しい行だけ通知されます
 *   4. 動作確認したいときは testNotify を実行すると、いちばん下の行をもう一度通知します
 *
 * ■ 1行目 (見出し) はアプリが書き込む列の名前と同じにしてください (README の「スプレッドシートの見出し」)。
 *    列名で値を拾うので、列の並び替えや末尾への列追加をしても動きます。
 */

const CONFIG = {
  /** 通知する区分。面談申込だけにしたいなら ["面談申込"] */
  NOTIFY_KINDS: ["診断完了", "面談申込"],
  /** 監視するシート名。空なら先頭のシート */
  SHEET_NAME: "",
  /** 1回の実行で通知する最大件数 (Chatwork API の上限対策) */
  MAX_PER_RUN: 20,
};

const PROP_LAST_ROW = "LAST_NOTIFIED_ROW";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return CONFIG.SHEET_NAME ? ss.getSheetByName(CONFIG.SHEET_NAME) : ss.getSheets()[0];
}

/** 初回に1回だけ実行: 既存の行を通知済みにして、1分ごとのトリガーを作る */
function setup() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(PROP_LAST_ROW, String(getSheet_().getLastRow()));
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "notifyNewRows")
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("notifyNewRows").timeBased().everyMinutes(1).create();
}

/** トリガーから1分ごとに呼ばれる */
function notifyNewRows() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // 前回の実行がまだ動いていたら今回は見送る
  try {
    const props = PropertiesService.getScriptProperties();
    const sheet = getSheet_();
    const lastRow = sheet.getLastRow();
    const done = Number(props.getProperty(PROP_LAST_ROW) || lastRow);
    if (lastRow <= done) return;

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    const count = Math.min(lastRow - done, CONFIG.MAX_PER_RUN);
    const rows = sheet.getRange(done + 1, 1, count, headers.length).getDisplayValues();

    rows.forEach((row, i) => {
      const r = {};
      headers.forEach((h, j) => (r[h] = row[j]));
      if (CONFIG.NOTIFY_KINDS.indexOf(r["区分"]) !== -1) postToChatwork_(buildMessage_(r));
      // 1件ずつ記録する (途中で失敗しても、送れた分は二重に通知しない。失敗した行は次の実行で再送)
      props.setProperty(PROP_LAST_ROW, String(done + i + 1));
    });
  } finally {
    lock.releaseLock();
  }
}

/** 動作確認用: いちばん下の行をもう一度通知する */
function testNotify() {
  const sheet = getSheet_();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const row = sheet.getRange(sheet.getLastRow(), 1, 1, headers.length).getDisplayValues()[0];
  const r = {};
  headers.forEach((h, j) => (r[h] = row[j]));
  postToChatwork_("[テスト送信]\n" + buildMessage_(r));
}

function buildMessage_(r) {
  const v = (key) => r[key] || "—";
  const isInterview = r["区分"] === "面談申込";
  const title = isInterview ? `【面談申込】${v("氏名")} さん（オンライン面談）` : `【新規診断】${v("氏名")} さん`;
  const lines = [
    `電話：${v("電話番号")}（つながりやすい時間：${v("連絡のつきやすい時間帯")}）`,
    `メール：${v("メールアドレス")}`,
    `年齢・エリア：${v("年齢")}／${v("都道府県")}`,
    `職種・雇用形態：${v("職種")}／${v("雇用形態")}（${v("業界")}）`,
    `年収：現在 ${v("現在年収(万円)")}万 → 市場価値 ${v("市場価値(万円)")}万（希望 ${v("希望年収(万円)")}万）`,
    `ランク：${v("スコア")}　適職：${v("適職1")}`,
    `転職希望時期：${v("転職希望時期")}`,
  ];
  if (isInterview) {
    lines.push(`面談希望日：${v("面談希望日 (オンライン)")}（${v("面談希望時間帯")}）`);
    if (r["相談したいこと"]) lines.push(`相談したいこと：${r["相談したいこと"]}`);
  }
  if (r["流入元"]) lines.push(`流入元：${r["流入元"]}`);
  lines.push(`結果：${v("結果URL")}`);
  return `[info][title]${title}[/title]${lines.join("\n")}[/info]`;
}

function postToChatwork_(body) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("CHATWORK_TOKEN");
  const roomId = props.getProperty("CHATWORK_ROOM_ID");
  if (!token || !roomId) throw new Error("スクリプトプロパティ CHATWORK_TOKEN / CHATWORK_ROOM_ID を設定してください");
  const res = UrlFetchApp.fetch(`https://api.chatwork.com/v2/rooms/${roomId}/messages`, {
    method: "post",
    headers: { "X-ChatWorkToken": token },
    payload: { body: body },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) {
    throw new Error(`Chatwork API ${res.getResponseCode()}: ${res.getContentText().slice(0, 300)}`);
  }
}
