import supabase from '../_supabase.js';
import { getSession, hashPassword, verifyPassword, generateToken, generateCaptchaChallenge, verifyCaptchaChallenge, generateOtpCode, hashOtpCode, verifyOtpCode } from '../_auth.js';
import { sendOtpEmail } from '../../server/mailer.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function slugifyName(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'member';
}

function millisecondsUntilAllowed(lastSentAt) {
  if (!lastSentAt) return 0;
  const elapsed = Date.now() - new Date(lastSentAt).getTime();
  return Math.max(0, OTP_RESEND_COOLDOWN_MS - elapsed);
}

async function createUserFromPendingRegistration(pending) {
  const { data: existingUser } = await supabase
    .from('auth_users')
    .select('id')
    .eq('email', pending.email)
    .single();

  if (existingUser) {
    await supabase.from('pending_registrations').delete().eq('id', pending.id);
    return existingUser;
  }

  const { data: user, error: userError } = await supabase
    .from('auth_users')
    .insert({
      email: pending.email,
      password_hash: pending.password_hash,
      email_verified: true,
      email_verification_token: '',
      email_verification_expires_at: null,
    })
    .select('id, email')
    .single();
  if (userError) throw userError;

  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      user_id: user.id,
      full_name: pending.full_name,
      slug: `${slugifyName(pending.full_name)}-${user.id}`,
      role: 'member',
      is_approved: false,
    });

  if (memberError) {
    await supabase.from('auth_users').delete().eq('id', user.id);
    throw memberError;
  }

  await supabase.from('pending_registrations').delete().eq('id', pending.id);
  return user;
}

async function issueOtpForPendingRegistration({ email, fullName, passwordHash, existingPending }) {
  const otp = generateOtpCode();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS).toISOString();
  const nowIso = new Date().toISOString();
  const verificationToken = generateToken();

  if (existingPending?.id) {
    const { error } = await supabase
      .from('pending_registrations')
      .update({
        password_hash: passwordHash,
        full_name: fullName,
        verification_token: verificationToken,
        expires_at: otpExpiresAt,
        otp_hash: hashOtpCode(otp),
        otp_expires_at: otpExpiresAt,
        otp_attempts: 0,
        otp_last_sent_at: nowIso,
      })
      .eq('id', existingPending.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('pending_registrations')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        verification_token: verificationToken,
        expires_at: otpExpiresAt,
        otp_hash: hashOtpCode(otp),
        otp_expires_at: otpExpiresAt,
        otp_attempts: 0,
        otp_last_sent_at: nowIso,
      });
    if (error) throw error;
  }

  try {
    await sendOtpEmail({
      email,
      fullName,
      otp,
    });
  } catch (error) {
    if (!existingPending?.id) {
      await supabase.from('pending_registrations').delete().eq('email', email);
    }
    throw error;
  }

  return {
    ok: true,
    requires_verification: true,
    email,
    message: 'Verification code sent. Enter the OTP from your email to create your account.',
    expires_in_seconds: Math.floor(OTP_EXPIRY_MS / 1000),
    resend_in_seconds: Math.floor(OTP_RESEND_COOLDOWN_MS / 1000),
  };
}

async function login(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const normalizedEmail = normalizeEmail(email);
  const adminEmail = (process.env.ADMIN_LOGIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_LOGIN_PASSWORD || '';
  const adminName = (process.env.ADMIN_FULL_NAME || 'Administrator').trim() || 'Administrator';

  if (adminEmail && adminPassword && normalizedEmail === adminEmail) {
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let { data: user } = await supabase
      .from('auth_users')
      .select('id, email, email_verified')
      .eq('email', adminEmail)
      .single();

    if (!user) {
      const { data: createdUser, error: userError } = await supabase
        .from('auth_users')
        .insert({ email: adminEmail, password_hash: hashPassword(adminPassword), email_verified: true })
        .select('id, email, email_verified')
        .single();
      if (userError) throw userError;
      user = createdUser;
    }

    let { data: member } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!member) {
      const slugBase = adminName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'admin';
      const { data: createdMember, error: memberError } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          full_name: adminName,
          slug: `${slugBase}-${user.id}`,
          role: 'admin',
          title: 'Administrator',
          is_approved: true,
        })
        .select()
        .single();
      if (memberError) throw memberError;
      member = createdMember;
    } else if (member.role !== 'admin' || !member.is_approved) {
      const { data: updatedMember, error: updateError } = await supabase
        .from('team_members')
        .update({ role: 'admin', is_approved: true })
        .eq('id', member.id)
        .select()
        .single();
      if (updateError) throw updateError;
      member = updatedMember;
    }

    const token = generateToken();
    await supabase.from('auth_sessions').insert({
      id: token,
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return res.status(200).json({
      user: { id: user.id, email: user.email },
      member,
      token,
    });
  }

  const { data: user, error } = await supabase
    .from('auth_users')
    .select('id, email, password_hash, email_verified')
    .eq('email', normalizedEmail)
    .single();
  if (error || !user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (!user.email_verified) {
    return res.status(403).json({ error: 'Please verify your email before signing in.' });
  }

  const { data: member } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const token = generateToken();
  await supabase.from('auth_sessions').insert({
    id: token,
    user_id: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return res.status(200).json({
    user: { id: user.id, email: user.email },
    member,
    token,
  });
}

async function signup(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password, full_name, captcha_token, captcha_answer } = req.body || {};
  if (!email || !password || !full_name || !captcha_token || !captcha_answer) {
    return res.status(400).json({ error: 'Email, password, full name, and captcha are required' });
  }
  const normalizedEmail = normalizeEmail(email);
  const adminEmail = (process.env.ADMIN_LOGIN_EMAIL || '').trim().toLowerCase();
  if (adminEmail && normalizedEmail === adminEmail) {
    return res.status(403).json({ error: 'This email is reserved for admin login' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!verifyCaptchaChallenge(captcha_token, captcha_answer)) {
    return res.status(400).json({ error: 'Captcha verification failed' });
  }

  const { data: existing } = await supabase
    .from('auth_users')
    .select('id')
    .eq('email', normalizedEmail)
    .single();
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const password_hash = hashPassword(password);
  const { data: pending } = await supabase
    .from('pending_registrations')
    .select('id, otp_last_sent_at')
    .eq('email', normalizedEmail)
    .single();

  return res.status(201).json(
    await issueOtpForPendingRegistration({
      email: normalizedEmail,
      fullName: full_name,
      passwordHash: password_hash,
      existingPending: pending,
    }),
  );
}

async function captcha(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  return res.status(200).json(generateCaptchaChallenge());
}

async function verifyOtp(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const normalizedEmail = normalizeEmail(req.body?.email);
  const otp = String(req.body?.otp || '').trim();
  if (!normalizedEmail || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const { data: pending } = await supabase
    .from('pending_registrations')
    .select('id, email, password_hash, full_name, expires_at, otp_hash, otp_expires_at, otp_attempts')
    .eq('email', normalizedEmail)
    .single();

  if (!pending) return res.status(400).json({ error: 'No pending verification found for this email' });
  if (!pending.otp_expires_at || new Date(pending.otp_expires_at).getTime() < Date.now()) {
    await supabase.from('pending_registrations').delete().eq('id', pending.id);
    return res.status(400).json({ error: 'OTP expired. Request a new code.' });
  }
  if ((pending.otp_attempts || 0) >= OTP_MAX_ATTEMPTS) {
    await supabase.from('pending_registrations').delete().eq('id', pending.id);
    return res.status(429).json({ error: 'Too many invalid OTP attempts. Register again to receive a new code.' });
  }

  if (!verifyOtpCode(otp, pending.otp_hash)) {
    await supabase
      .from('pending_registrations')
      .update({ otp_attempts: (pending.otp_attempts || 0) + 1 })
      .eq('id', pending.id);
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  await createUserFromPendingRegistration(pending);

  return res.status(200).json({
    ok: true,
    verified: true,
    message: 'Email verified. You can sign in now.',
  });
}

async function resendOtp(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const normalizedEmail = normalizeEmail(req.body?.email);
  if (!normalizedEmail) return res.status(400).json({ error: 'Email is required' });

  const { data: existingUser } = await supabase
    .from('auth_users')
    .select('id')
    .eq('email', normalizedEmail)
    .single();
  if (existingUser) {
    return res.status(400).json({ error: 'This email is already registered' });
  }

  const { data: pending } = await supabase
    .from('pending_registrations')
    .select('id, email, full_name, password_hash, otp_last_sent_at')
    .eq('email', normalizedEmail)
    .single();
  if (!pending) {
    return res.status(404).json({ error: 'No pending verification found for this email' });
  }

  const waitMs = millisecondsUntilAllowed(pending.otp_last_sent_at);
  if (waitMs > 0) {
    return res.status(429).json({
      error: `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another OTP`,
    });
  }

  return res.status(200).json(
    await issueOtpForPendingRegistration({
      email: pending.email,
      fullName: pending.full_name,
      passwordHash: pending.password_hash,
      existingPending: pending,
    }),
  );
}

async function me(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];

  const { data: session } = await supabase
    .from('auth_sessions')
    .select('user_id')
    .eq('id', token)
    .gt('expires_at', new Date().toISOString())
    .single();
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const { data: user } = await supabase
    .from('auth_users')
    .select('id, email')
    .eq('id', session.user_id)
    .single();
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  const { data: member } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return res.status(200).json({ user, member });
}

async function signout(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    await supabase.from('auth_sessions').delete().eq('id', token);
  }
  return res.status(200).json({ ok: true });
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const action = req.query?.action;
    if (action === 'login') return login(req, res);
    if (action === 'signup') return signup(req, res);
    if (action === 'captcha') return captcha(req, res);
    if (action === 'verify-otp') return verifyOtp(req, res);
    if (action === 'resend-otp') return resendOtp(req, res);
    if (action === 'me') return me(req, res);
    if (action === 'signout') return signout(req, res);
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('Auth API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
