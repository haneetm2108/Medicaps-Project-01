import React, { useState } from 'react';
import { Building2, Lock, Mail, Shield, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { api, setToken, UserProfile } from '../api/client';

interface LoginModalProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('hr@staffsync.io');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      setToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight">StaffSync Enterprise HRMS</h2>
          <p className="text-xs text-slate-300 mt-1">
            Node.js &middot; Express &middot; MongoDB &middot; JWT &middot; bcryptjs
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@staffsync.io"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Authenticating with JWT...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick 1-Click Role Login Shortcuts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>1-Click Demo Accounts</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('hr@staffsync.io')}
                className={`p-2 rounded-xl text-left border transition-all ${
                  email === 'hr@staffsync.io'
                    ? 'border-purple-300 bg-purple-50 text-purple-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-purple-700">HR Admin</div>
                <div className="text-[11px] truncate">Sarah Connor</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('manager@staffsync.io')}
                className={`p-2 rounded-xl text-left border transition-all ${
                  email === 'manager@staffsync.io'
                    ? 'border-blue-300 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-blue-700">Manager</div>
                <div className="text-[11px] truncate">Marcus Vance</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('david@staffsync.io')}
                className={`p-2 rounded-xl text-left border transition-all ${
                  email === 'david@staffsync.io'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-emerald-700">Employee</div>
                <div className="text-[11px] truncate">David Kim</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
