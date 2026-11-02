import React, { useState } from 'react';
import { UserSession } from '../types';
import { apiService } from '../services/api';
import { Language, t } from '../locales/i18n';
import { Mail, Lock, AlertTriangle, RefreshCw, LogOut, ArrowRight, Shield } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  onLoginSuccess: (user: UserSession) => void;
  onLogout: () => void;
  language: Language;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  language,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      if (!cleanEmail.endsWith('@gmail.com')) {
        throw new Error(language === 'bn' ? 'শুধুমাত্র অফিসিয়াল @gmail.com অ্যাকাউন্ট অনুমোদিত।' : 'Only official Google / Gmail accounts (@gmail.com) are permitted.');
      }
      if (!passwordInput) {
        throw new Error(language === 'bn' ? 'পাসওয়ার্ড প্রদান করুন।' : 'Password is required.');
      }

      const res = await apiService.login(cleanEmail, passwordInput);
      onLoginSuccess(res.user);
      onClose();
      setPasswordInput('');
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0D13] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
        {/* Top Gold Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#12151F] border border-amber-500/40 p-1.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <img
                src="/lionix-gold-lion.svg"
                alt="LIONIX Logo"
                className="w-full h-full object-contain filter drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))"
              />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-amber-500">
                {t('loginTitle', language)}
              </h2>
              <p className="text-[11px] text-zinc-400">{t('loginSubtitle', language)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-lg font-bold p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Active Session View if already authenticated */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#12151F] border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/50"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-100">{currentUser.name}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[9px] uppercase border border-amber-500/30">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{currentUser.email}</p>
                  <p className="text-[10px] font-mono text-amber-500/80 mt-1">Staff ID: {currentUser.staffId}</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout', language)}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider transition"
            >
              {language === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Continue to Dashboard'}
            </button>
          </div>
        ) : (
          /* Production Login Flow */
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Single Step: Registered Gmail Address + Company Portal Password */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  {t('gmailAddress', language)} <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="lionixaitc@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#12151F] border border-zinc-800 focus:border-amber-500 text-xs text-white placeholder-zinc-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  {t('password', language)} <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={t('enterPassword', language)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#12151F] border border-zinc-800 focus:border-amber-500 text-xs text-white placeholder-zinc-600 outline-none transition"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#12151F] border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Production Security Policy</span>
                </div>
                <p>
                  {language === 'bn'
                    ? 'নিবন্ধিত জিমেইল এবং কোম্পানি পোর্টাল পাসওয়ার্ড দিয়ে তাৎক্ষণিক লগইন। কোনো ওটিপি ইমেলের প্রয়োজন নেই।'
                    : 'Direct authentication with registered Gmail and Company Portal password. No OTP email delivery required.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Authenticating...'}</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>{t('loginButton', language)}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
