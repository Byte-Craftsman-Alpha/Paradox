import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, type Member, type SignupOtpResponse, fetchMe, login as apiLogin, signupWithVerification as apiSignup, signout as apiSignout } from './auth';

interface AuthContextType {
  user: User | null;
  member: Member | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, captchaToken: string, captchaAnswer: string) => Promise<SignupOtpResponse>;
  signout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const data = await fetchMe();
      if (data) {
        setUser(data.user);
        setMember(data.member);
      } else {
        setUser(null);
        setMember(null);
      }
    } catch {
      setUser(null);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshAuth(); }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    setMember(data.member);
  };

  const signup = async (email: string, password: string, fullName: string, captchaToken: string, captchaAnswer: string) => {
    return apiSignup(email, password, fullName, captchaToken, captchaAnswer);
  };

  const signout = async () => {
    await apiSignout();
    setUser(null);
    setMember(null);
  };

  const isAdmin = member?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, member, loading, isAdmin, login, signup, signout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
