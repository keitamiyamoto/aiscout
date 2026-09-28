/**
 * トップに載せるキャリアアドバイザー。空のあいだはセクションごと非表示になります。
 * photo は public/images/ に置いたファイル名 (拡張子なし)。例: "advisor-miyamoto" → public/images/advisor-miyamoto.jpg
 */
export type Advisor = { name: string; role: string; comment: string; photo: string };

export const ADVISORS: Advisor[] = [
  // { name: "宮本 慶太", role: "キャリアアドバイザー", comment: "未経験からの転職も、年収アップの交渉もお任せください。", photo: "advisor-miyamoto" },
];
