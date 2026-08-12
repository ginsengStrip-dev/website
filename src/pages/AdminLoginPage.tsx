import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Mail, Key } from 'lucide-react';
import { adminLogin } from '../lib/api';
import { AdminUser } from '../types';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  onNavigate: (tab: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await adminLogin(email, password);
      onLoginSuccess(result.user);
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      <div className="bg-[#fbf8f1] border border-[#e5dcd0] rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-amber-950">
            Archival Admin Login
          </h1>
          <p className="text-xs text-amber-900/70 font-medium">
            Authorized portal for managing manuscript preservation collections
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-amber-800/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#e5dcd0] text-sm text-amber-950 focus:outline-none focus:border-amber-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-amber-800/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#e5dcd0] text-sm text-amber-950 focus:outline-none focus:border-amber-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-50 font-serif font-bold text-sm shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>
      </div>
    </div>
  );
};
