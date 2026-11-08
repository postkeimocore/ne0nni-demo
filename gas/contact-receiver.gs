/**
 * Contact form receiver — Google Apps Script Web App
 * (Cloudflare Pages Function /api/contact → this script)
 *
 * 1. Open the spreadsheet that keeps the inquiries → Extensions → Apps Script → paste this file.
 * 2. Project Settings → Script Properties:
 *      SHEET_ID       ID of the spreadsheet (from its URL). Optional when the script was made from that
 *                     spreadsheet as in 1 (it then writes to its own spreadsheet)
 *      SHARED_SECRET  long random string, same as GAS_SECRET on Cloudflare
 *      NOTIFY_TO      address that receives the notification
 *      SITE_NAME      e.g. NE0NNi*                    (optional)
 *      SITE_URL       e.g. https://example.com       (optional)
 * 3. Deploy → New deployment → Web app → Execute as: Me / Who has access: Anyone → copy the URL
 *    → Cloudflare env GAS_WEBHOOK_URL. Re-deploy (Manage deployments → Edit → New version) after edits.
 * Secrets live in Script Properties, never in this file (the repository is public).
 */
var HEADERS = ['受信日時', 'ご用件', 'お名前', '会社名・団体名', 'メールアドレス', '対象の作品', 'お問い合わせ内容', 'IP'];

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) return json_({ error: 'No data' });
    var data = JSON.parse(e.postData.contents);
    var p = props_();
    if (!p.SHARED_SECRET || data.secret !== p.SHARED_SECRET) return json_({ error: 'Unauthorized' });
    if (!data.name || !data.email || !data.message) return json_({ error: 'Missing required fields' });

    writeRow_(p, data);
    notifyOwner_(p, data);
    autoReply_(p, data);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ error: String(err && err.message || err) });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Contact receiver is running.' });
}

function props_() {
  return PropertiesService.getScriptProperties().getProperties();
}

/** Prevent spreadsheet formula injection. */
function safe_(v) {
  v = String(v == null ? '' : v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function writeRow_(p, d) {
  var ss = p.SHEET_ID ? SpreadsheetApp.openById(p.SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('お問い合わせ') || ss.insertSheet('お問い合わせ');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(7, 400);
  }
  var now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, HEADERS.length).setValues([[
    now, safe_(d.kind), safe_(d.name), safe_(d.company), safe_(d.email), safe_(d.work), safe_(d.message), safe_(d.ip),
  ]]);
}

function summary_(d) {
  return [
    '【ご用件】' + (d.kind || '—'),
    '【お名前】' + d.name,
    '【会社名・団体名】' + (d.company || '—'),
    '【メールアドレス】' + d.email,
    '【対象の作品】' + (d.work || '—'),
    '',
    '【お問い合わせ内容】',
    d.message,
  ].join('\n');
}

function notifyOwner_(p, d) {
  var site = p.SITE_NAME || 'NE0NNi*';
  MailApp.sendEmail({
    to: p.NOTIFY_TO,
    replyTo: d.email,
    name: site,
    subject: '【NE0NNi* お問い合わせ】' + (d.kind || '') + '｜' + d.name + ' 様',
    body: 'サイトのフォームからお問い合わせがありました。\n\n' + summary_(d) +
      '\n\n---\nこのメールに返信すると ' + d.email + ' に届きます。\nスプレッドシートにも記録されています。',
  });
}

// Sent from the Google account the script runs as, so a reply to it does arrive; the note says only that it is automatic.
function autoReply_(p, d) {
  var site = p.SITE_NAME || 'NE0NNi*';
  MailApp.sendEmail({
    to: d.email,
    name: site,
    subject: 'お問い合わせを受け付けました — ' + site,
    body: d.name + ' 様\n\n' +
      'このたびはお問い合わせいただき、ありがとうございます。\n以下の内容で受け付けました。内容を確認のうえ、折り返しご連絡します。\n\n' +
      '────────────────────\n' + summary_(d) + '\n────────────────────\n\n' +
      '※このメールは自動送信です。\n\n' +
      site + (p.SITE_URL ? '\n' + p.SITE_URL : ''),
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
