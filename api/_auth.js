import crypto from 'crypto';

export function hashPassword(password) {
  const salt = crypto.randomBytes(32);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  return salt.toString('hex') + ':' + key.toString('hex');
}

export function verifyPassword(password, storedHash) {
  const [saltHex, keyHex] = storedHash.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  return key.toString('hex') === keyHex;
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function generateOtpCode(length = 6) {
  let otp = '';
  for (let index = 0; index < length; index += 1) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
}

export function hashOtpCode(code) {
  const secret = process.env.CAPTCHA_SECRET || process.env.TURSO_AUTH_TOKEN || 'dev-captcha-secret';
  return crypto.createHmac('sha256', secret).update(String(code).trim()).digest('hex');
}

export function verifyOtpCode(code, storedHash) {
  if (!code || !storedHash) return false;
  return hashOtpCode(code) === storedHash;
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function captchaSecret() {
  return process.env.CAPTCHA_SECRET || process.env.TURSO_AUTH_TOKEN || 'dev-captcha-secret';
}

function escapeSvgText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateCaptchaText(length = 5) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join('');
}

function generateCaptchaSvg(text) {
  const width = 220;
  const height = 72;
  const chars = text.split('');
  const charNodes = chars
    .map((char, index) => {
      const x = 24 + index * 36 + crypto.randomInt(-4, 5);
      const y = 42 + crypto.randomInt(-8, 9);
      const rotate = crypto.randomInt(-20, 21);
      const size = crypto.randomInt(26, 33);
      const color = ['#e2e8f0', '#67e8f9', '#86efac', '#f9a8d4'][index % 4];
      return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" transform="rotate(${rotate} ${x} ${y})" font-family="monospace" font-weight="700">${escapeSvgText(char)}</text>`;
    })
    .join('');

  const noise = Array.from({ length: 8 }, () => {
    const x1 = crypto.randomInt(0, width);
    const y1 = crypto.randomInt(0, height);
    const x2 = crypto.randomInt(0, width);
    const y2 = crypto.randomInt(0, height);
    const stroke = ['#155e75', '#166534', '#1d4ed8', '#9f1239'][crypto.randomInt(0, 4)];
    const opacity = (crypto.randomInt(18, 50) / 100).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2" opacity="${opacity}" />`;
  }).join('');

  const dots = Array.from({ length: 24 }, () => {
    const cx = crypto.randomInt(0, width);
    const cy = crypto.randomInt(0, height);
    const r = crypto.randomInt(1, 3);
    const fill = ['#ffffff', '#22d3ee', '#4ade80'][crypto.randomInt(0, 3)];
    const opacity = (crypto.randomInt(20, 55) / 100).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}" />`;
  }).join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Captcha image">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="14" fill="url(#bg)" />
      ${noise}
      ${dots}
      ${charNodes}
    </svg>
  `.replace(/\s{2,}/g, ' ').trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function generateCaptchaChallenge() {
  const answer = generateCaptchaText();
  const payload = {
    answer,
    exp: Date.now() + 10 * 60 * 1000,
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', captchaSecret()).update(encoded).digest('base64url');
  return {
    prompt: 'Enter the characters shown in the image.',
    image_data: generateCaptchaSvg(answer),
    captcha_token: `${encoded}.${signature}`,
  };
}

export function verifyCaptchaChallenge(token, answer) {
  if (!token || !answer || typeof token !== 'string') return false;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;
  const expected = crypto.createHmac('sha256', captchaSecret()).update(encoded).digest('base64url');
  if (expected !== signature) return false;
  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encoded));
  } catch {
    return false;
  }
  if (!payload?.exp || payload.exp < Date.now()) return false;
  return String(answer).trim().toUpperCase() === String(payload.answer).trim().toUpperCase();
}

export async function getSession(supabase, req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: session } = await supabase
    .from('auth_sessions')
    .select('user_id')
    .eq('id', token)
    .gt('expires_at', new Date().toISOString())
    .single();
  return session;
}
