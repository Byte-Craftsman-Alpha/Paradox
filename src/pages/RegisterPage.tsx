import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { fetchCaptchaChallenge, resendSignupOtp, verifySignupOtp } from '../lib/auth';
import { CheckCircle, Eye, EyeOff, KeyRound, MailCheck, RefreshCw, ShieldCheck, UserPlus, Zap } from 'lucide-react';

export default function RegisterPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaPrompt, setCaptchaPrompt] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    void loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    try {
      const challenge = await fetchCaptchaChallenge();
      setCaptchaPrompt(challenge.prompt);
      setCaptchaImage(challenge.image_data);
      setCaptchaToken(challenge.captcha_token);
      setCaptchaAnswer('');
    } catch (err: any) {
      setError(err.message || 'Failed to load captcha');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const result = await signup(email, password, fullName, captchaToken, captchaAnswer);
      setPendingEmail(result.email);
      setOtpSent(true);
      setInfo(result.message);
    } catch (err: any) {
      setError(err.message);
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const result = await verifySignupOtp(pendingEmail || email, otp);
      setVerified(true);
      setInfo(result.message || 'Email verified.');
      setTimeout(() => navigate('/login?verified=1'), 1800);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setInfo('');
    setResendLoading(true);
    try {
      const result = await resendSignupOtp(pendingEmail || email);
      setInfo(result.message);
      setOtp('');
      await loadCaptcha();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email verified</h2>
          <p className="text-zinc-400 max-w-sm">
            Your account has been created. Redirecting you to sign in.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/[0.04] rounded-full blur-[120px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-[#0a0a0f]" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white">{otpSent ? 'Verify your email' : 'Join the team'}</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {otpSent ? 'Enter the one-time code sent to your inbox.' : 'Create your profile on Nexus.dev'}
          </p>
        </div>

        <form onSubmit={otpSent ? handleVerifyOtp : handleRegister} className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {info && (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
              {info}
            </div>
          )}

          {!otpSent ? (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Anti-bot check
                  </label>
                  <button type="button" onClick={() => void loadCaptcha()} className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>
                </div>
                <p className="text-sm text-zinc-200 mb-3">{captchaPrompt || 'Loading challenge...'}</p>
                {captchaImage && (
                  <div className="mb-3 overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/60">
                    <img src={captchaImage} alt="Captcha challenge" className="block h-[72px] w-full object-cover" />
                  </div>
                )}
                <input
                  type="text"
                  value={captchaAnswer}
                  onChange={e => setCaptchaAnswer(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="Type the characters from the image"
                  autoCapitalize="characters"
                />
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-[#0a0a0f] font-semibold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-all">
                {loading ? 'Sending OTP...' : <><UserPlus className="w-4 h-4" /> Send OTP</>}
              </button>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-start gap-3">
                  <MailCheck className="w-5 h-5 text-cyan-300 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-cyan-100">Verification code sent</p>
                    <p className="text-sm text-cyan-200/80 mt-1">
                      Enter the 6-digit OTP sent to <span className="font-medium text-cyan-100">{pendingEmail}</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">One-Time Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm tracking-[0.35em] placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-[#0a0a0f] font-semibold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-all">
                {loading ? 'Verifying...' : <><CheckCircle className="w-4 h-4" /> Verify OTP</>}
              </button>

              <button
                type="button"
                onClick={() => void handleResendOtp()}
                disabled={resendLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.08] text-zinc-200 font-medium text-sm hover:bg-white/[0.03] disabled:opacity-50 transition-all"
              >
                {resendLoading ? 'Resending...' : <><RefreshCw className="w-4 h-4" /> Resend OTP</>}
              </button>
            </>
          )}

          <div className="text-center pt-2">
            <p className="text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-amber-400/80 text-center">
              Email OTP verification and admin approval are both required before public access.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
