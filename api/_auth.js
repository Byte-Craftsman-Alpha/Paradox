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
