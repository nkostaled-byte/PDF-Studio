import React, { useState } from 'react';
import { Mail, Lock, Sparkles, X, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { signUpUser, loginUser, loginWithGoogleDemo } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  intentToSubscribe?: boolean;
  onAuthSuccess: (user: UserProfile, shouldTriggerPaystack: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  intentToSubscribe = false,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>(intentToSubscribe ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let user: UserProfile;
      if (mode === 'signup') {
        user = await signUpUser(email, password);
      } else {
        user = await loginUser(email, password);
      }
      setLoading(false);
      onAuthSuccess(user, intentToSubscribe);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    }
  };

  const handleGoogleDemo = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await loginWithGoogleDemo();
      setLoading(false);
      onAuthSuccess(user, intentToSubscribe);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Google Auth failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Subscribe banner badge if upgrading */}
        {intentToSubscribe && (
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3.5 mb-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-amber-900 dark:text-amber-200">Step 1 of 2: Create Account</div>
              <div className="text-[11px] text-amber-700 dark:text-amber-300">Paystack checkout will launch immediately after sign up!</div>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {mode === 'signup' ? 'Create your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'signup'
              ? 'Join PDF Studio to manage your workspace and active subscriptions'
              : 'Sign in to access your Pro subscription and saved history'}
          </p>
        </div>

        {/* Toggle Pills */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl p-3 mb-4 text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none transition-colors shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none transition-colors shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              intentToSubscribe
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{intentToSubscribe ? 'Continue to Paystack Checkout' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
          <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Or continue with</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleDemo}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.28v3.13C3.26 21.28 7.34 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.63H1.28C.46 8.26 0 10.08 0 12s.46 3.74 1.28 5.37l4-3.13z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.72 1.28 6.63l4 3.13c.95-2.85 3.6-4.96 6.72-4.96z"/>
          </svg>
          <span>Google Account</span>
        </button>
      </div>
    </div>
  );
};
