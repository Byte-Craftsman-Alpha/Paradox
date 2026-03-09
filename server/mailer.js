import nodemailer from 'nodemailer';

function createTransport() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = process.env.SMTP_PASS || '';
  const from = (process.env.SMTP_FROM || '').trim();

  if (!host || !user || !pass || !from) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.');
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: { user, pass },
  });
}

function resolveFromAddress() {
  const configuredFrom = (process.env.SMTP_FROM || '').trim();
  const smtpUser = (process.env.SMTP_USER || '').trim();

  if (!configuredFrom) return smtpUser;
  if (!smtpUser) return configuredFrom;

  const configuredEmailMatch = configuredFrom.match(/<([^>]+)>/) || configuredFrom.match(/([^\s]+@[^\s]+)/);
  const configuredEmail = (configuredEmailMatch?.[1] || configuredEmailMatch?.[0] || '').trim().toLowerCase();
  if (configuredEmail && configuredEmail === smtpUser.toLowerCase()) {
    return configuredFrom;
  }

  return `Team Paradox <${smtpUser}>`;
}

export async function sendOtpEmail({ email, fullName, otp }) {
  const transporter = createTransport();
  const from = resolveFromAddress();
  const replyTo = (process.env.SMTP_FROM || '').trim() || undefined;

  await transporter.sendMail({
    from,
    to: email,
    replyTo,
    subject: 'Your Team Paradox verification code',
    text: `Hi ${fullName}, your Team Paradox verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Verify your account</h2>
        <p>Hi ${fullName},</p>
        <p>Use this one-time code to verify your email and complete registration.</p>
        <div style="display:inline-block;padding:12px 18px;background:#10b981;color:#081018;border-radius:8px;font-weight:700;font-size:24px;letter-spacing:6px">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}
