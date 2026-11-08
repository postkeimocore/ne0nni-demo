/**
 * POST /api/contact  (Cloudflare Pages Function)
 * Form → Turnstile check → Google Apps Script (sheet + notification + auto-reply).
 *
 * Env (Pages → Settings → Variables and Secrets):
 *   GAS_WEBHOOK_URL   GAS web-app URL (gas/contact-receiver.gs)
 *   GAS_SECRET        shared secret, same value as the GAS Script Property SHARED_SECRET
 *   TURNSTILE_SECRET  Turnstile secret key (set together with PUBLIC_TURNSTILE_SITE_KEY at build)
 *   CONTACT_DEMO      "true" = accept but do not send. Also implied on *.pages.dev and localhost while
 *                     GAS is not set up, so the form can be tried before launch.
 * Accepts JSON (fetch) and form posts (no JavaScript → 303 to /contact/thanks/).
 */
const KINDS = ['制作のご依頼', 'PR', 'コラボレーション', '作品の利用', 'その他'];
const LIMITS = { company: 100, name: 100, email: 200, work: 40, message: 5000 };

export async function onRequestPost({ request, env }) {
  const isJson = (request.headers.get('Content-Type') || '').includes('application/json');
  let data;
  try {
    data = isJson ? await request.json() : Object.fromEntries((await request.formData()).entries());
  } catch {
    return reply(isJson, 400, '送信内容を読み取れませんでした。');
  }

  // honeypot: bots fill the hidden field. Pretend success, send nothing
  if (String(data.website || '').trim()) return reply(isJson, 200);

  const f = Object.fromEntries(Object.keys(LIMITS).map((k) => [k, String(data[k] ?? '').trim().slice(0, LIMITS[k])]));
  f.kind = String(data.kind ?? '').trim();
  if (!f.name || !f.email || !f.message || !KINDS.includes(f.kind)) {
    return reply(isJson, 400, '必須項目（ご用件・お名前・メールアドレス・お問い合わせ内容）を入力してください。');
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return reply(isJson, 400, 'メールアドレスの形式を確認してください。');
  if (!data.privacy || data.privacy === 'false') return reply(isJson, 400, '個人情報の取り扱いへの同意が必要です。');
  if ((f.message.match(/https?:\/\//g) || []).length > 3) return reply(isJson, 400, 'お問い合わせ内容のURLを3つまでにしてください。');

  if (env.TURNSTILE_SECRET) {
    const token = data['cf-turnstile-response'];
    if (!token) return reply(isJson, 400, '送信の確認ができませんでした。ページを再読み込みして、もう一度お試しください。');
    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET);
    body.append('response', token);
    body.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
    const ts = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body }).then((r) => r.json());
    if (!ts.success) return reply(isJson, 403, '送信の確認ができませんでした。ページを再読み込みして、もう一度お試しください。');
  }

  if (!env.GAS_WEBHOOK_URL || !env.GAS_SECRET) {
    const host = new URL(request.url).hostname;
    const demo = env.CONTACT_DEMO === 'true' || /\.pages\.dev$/.test(host) || /^(localhost|127\.0\.0\.1)$/.test(host);
    if (demo) return reply(isJson, 200, undefined, { demo: true });
    console.error('Contact: GAS_WEBHOOK_URL / GAS_SECRET are not set');
    return reply(isJson, 503, '現在フォームから送信できません。時間をおいてもう一度お試しください。');
  }

  try {
    const res = await fetch(env.GAS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.GAS_SECRET, ...f, ip: request.headers.get('CF-Connecting-IP') || '' }),
      redirect: 'follow',
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || out.error) {
      console.error('GAS error', res.status, out.error);
      return reply(isJson, 502, '送信に失敗しました。時間をおいてもう一度お試しください。');
    }
    return reply(isJson, 200);
  } catch (err) {
    console.error('Contact error', err);
    return reply(isJson, 500, '送信に失敗しました。時間をおいてもう一度お試しください。');
  }
}

function reply(isJson, status, error, extra = {}) {
  if (!isJson) {
    const to = status === 200 ? '/contact/thanks/' : `/contact/?error=${encodeURIComponent(error || '')}`;
    return new Response(null, { status: 303, headers: { Location: to } });
  }
  const body = status === 200 ? { ok: true, ...extra } : { ok: false, error };
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
