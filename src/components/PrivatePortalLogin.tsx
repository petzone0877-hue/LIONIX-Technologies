import React, { useState, useEffect } from 'react';
import { UserSession, CompanyInfo } from '../types';
import { apiService } from '../services/api';
import { Language, t } from '../locales/i18n';
import {
  Mail,
  Lock,
  Shield,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Globe,
  CheckCircle2,
  KeyRound,
  Info,
  Eye,
  EyeOff,
  HelpCircle,
  RotateCcw,
  IdCard,
} from 'lucide-react';

interface PrivatePortalLoginProps {
  company: CompanyInfo;
  onLoginSuccess: (user: UserSession) => void;
  language: Language;
  onToggleLanguage: () => void;
  onSwitchToStaff?: () => void;
}

export const PrivatePortalLogin: React.FC<PrivatePortalLoginProps> = ({
  company,
  onLoginSuccess,
  language,
  onToggleLanguage,
  onSwitchToStaff,
}) => {
  const [step, setStep] = useState<'login' | 'forgot_password' | 'owner_setup'>('login');
  
  // Persistent Remember Me state
  const savedRememberEmail = localStorage.getItem('lionix_remember_email') || 'lionixaitc@gmail.com';
  const savedRememberPref = localStorage.getItem('lionix_remember_me') === 'true';

  const [emailInput, setEmailInput] = useState(savedRememberEmail);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(savedRememberPref);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusNotice, setStatusNotice] = useState('');

  // Forgot Password / Secure Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState('lionixaitc@gmail.com');
  const [recoveryKey, setRecoveryKey] = useState('LIONIX-MASTER-2026-KEY');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Initial Owner Setup form state (only if database is completely blank)
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');

  // Primary official logo asset
  const logoSrc =
    company.logoUrl ||
    '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png';

  // 1. Check Owner status on mount
  useEffect(() => {
    const checkOwnerStatus = async () => {
      try {
        const status = await apiService.getOwnerStatus();
        if (status.needsInitialPasswordSetup) {
          setStep('owner_setup');
        }
      } catch (_) {}
    };
    checkOwnerStatus();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusNotice('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail.endsWith('@gmail.com')) {
      setErrorMsg(
        language === 'bn'
          ? 'নিরাপত্তা নীতি: শুধুমাত্র অনুমোদিত Gmail / Google একাউন্ট (@gmail.com) গ্রহণযোগ্য।'
          : 'Security Policy: Only registered Gmail / Google accounts (@gmail.com) are permitted.'
      );
      return;
    }

    if (!passwordInput) {
      setErrorMsg(
        language === 'bn' ? 'অনুগ্রহ করে কোম্পানি পোর্টাল পাসওয়ার্ড দিন।' : 'Please enter your Company Portal password.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.login(cleanEmail, passwordInput);
      if (res.success && res.user) {
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('lionix_remember_email', cleanEmail);
          localStorage.setItem('lionix_remember_me', 'true');
        } else {
          localStorage.removeItem('lionix_remember_email');
          localStorage.setItem('lionix_remember_me', 'false');
        }
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      if (err.requiresOwnerSetup) {
        setStep('owner_setup');
        setStatusNotice(
          language === 'bn'
            ? 'মালিক অ্যাকাউন্ট প্রাথমিক সেটআপ: কোম্পানি পোর্টাল পাসওয়ার্ড কনফিগার করুন।'
            : 'Initial Owner Setup: Please configure your Company Portal password.'
        );
      } else {
        setErrorMsg(
          err.message ||
            (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।' : 'Authentication failed. Please verify credentials.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusNotice('');

    if (recoveryEmail.trim().toLowerCase() !== 'lionixaitc@gmail.com') {
      setErrorMsg(
        language === 'bn'
          ? 'শুধুমাত্র অনুমোদিত কোম্পানির মালিক (lionixaitc@gmail.com) পাসওয়ার্ড রিসেট করতে পারেন।'
          : 'Access Restricted: Only the authorized Company Owner (lionixaitc@gmail.com) can reset credentials.'
      );
      return;
    }

    if (newResetPassword.length < 8) {
      setErrorMsg(
        language === 'bn'
          ? 'নিরাপত্তা নীতি: নতুন পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে।'
          : 'Security Policy: New password must be at least 8 characters long.'
      );
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setErrorMsg(
        language === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.resetOwnerPassword(
        recoveryEmail.trim().toLowerCase(),
        recoveryKey.trim(),
        newResetPassword,
        confirmResetPassword
      );

      setStatusNotice(
        language === 'bn'
          ? 'মালিক পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! এটি আপনার স্থায়ী পাসওয়ার্ড।'
          : res.message || 'Owner password successfully reset! This is now your permanent login password.'
      );

      setPasswordInput(newResetPassword);
      setStep('login');
      setNewResetPassword('');
      setConfirmResetPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusNotice('');

    if (setupPassword.length < 8) {
      setErrorMsg(
        language === 'bn'
          ? 'নিরাপত্তা নীতি: পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে।'
          : 'Security Policy: Password must be at least 8 characters long.'
      );
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setErrorMsg(language === 'bn' ? 'উভয় পাসওয়ার্ড এক নয়।' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.setupOwnerPassword(setupPassword, setupConfirmPassword);
      setStatusNotice(
        language === 'bn'
          ? 'কোম্পানি পোর্টাল পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে! এখন লগইন করুন।'
          : res.message || 'Company Portal password initialized! You can now log in.'
      );
      setPasswordInput(setupPassword);
      setStep('login');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to setup owner password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black relative overflow-hidden font-sans">
      {/* Ambient luxury lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/15 via-amber-600/5 to-transparent blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] pointer-events-none"></div>

      {/* Top Header Bar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-amber-500/15 bg-[#07080B]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/40 p-1 flex items-center justify-center shadow-lg shadow-amber-500/15">
            <img
              src={logoSrc}
              alt="LIONIX"
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                (e.currentTarget as any).src =
                  '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png';
              }}
            />
          </div>
          <div>
            <span className="font-cinzel text-sm font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              LIONIX AI TECHNOLOGIES
            </span>
            <span className="block text-[10px] text-zinc-400 tracking-wider">
              {company.productName || 'LIONIX AI Studio'} • Internal Security Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch to Dedicated Staff Login URL (/admin) */}
          <button
            onClick={() => {
              if (onSwitchToStaff) {
                onSwitchToStaff();
              } else {
                window.history.pushState({}, '', '/admin');
                window.location.href = '/admin';
              }
            }}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] text-amber-300 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Go to dedicated Staff Portal (lionixai.com/admin)"
          >
            <IdCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff Portal (/admin)</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-amber-400 transition flex items-center gap-1.5 cursor-pointer font-medium"
            title="Switch Language / ভাষা পরিবর্তন করুন"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          {/* External Public Website Link */}
          <a
            href={company.website || 'https://lionixai.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-400 hover:text-zinc-200 transition"
            title="Open separate public website for ordinary visitors"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[460px] space-y-6 animate-in fade-in zoom-in-95 duration-500">
          {/* Official Emblem & Branding */}
          <div className="text-center space-y-4">
            <div className="relative inline-block group">
              <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-full bg-[#0A0D14] border-2 border-amber-400/80 p-1.5 shadow-2xl shadow-amber-500/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <img
                  src={logoSrc}
                  alt="LIONIX AI Technologies Official Emblem"
                  className="w-full h-full object-contain rounded-full filter drop-shadow(0 0 12px rgba(245, 158, 11, 0.7))"
                  onError={(e) => {
                    (e.currentTarget as any).src =
                      '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png';
                  }}
                />
              </div>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 opacity-20 blur-md pointer-events-none"></div>
            </div>

            <div className="space-y-1.5">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-amber-600">
                LIONIX AI TECHNOLOGIES
              </h1>
              <p className="text-xs sm:text-sm font-bold tracking-widest text-amber-300">
                BUILD ANYTHING. CREATE EVERYTHING.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Private Company Portal • Permanent Owner Login</span>
            </div>
          </div>

          {/* Secure Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#11141D] via-[#0B0D13] to-[#07080B] border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 backdrop-blur-xl space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {statusNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{statusNotice}</span>
              </div>
            )}

            {step === 'login' ? (
              /* PERMANENT LOGIN: GMAIL + COMPANY PORTAL PASSWORD */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                    {language === 'bn' ? 'রেজিস্টার্ড জিমেইল অ্যাড্রেস' : 'Registered Gmail Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="lionixaitc@gmail.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none font-mono transition"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 block">
                    {language === 'bn'
                      ? 'অফিসিয়াল জিমেইল একাউন্ট (@gmail.com) দিয়ে সরাসরি লগইন করুন।'
                      : 'Company Owner & Authorized Staff accounts only (@gmail.com).'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                      {language === 'bn' ? 'কোম্পানি পোর্টাল পাসওয়ার্ড' : 'Company Portal Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('forgot_password');
                        setErrorMsg('');
                        setStatusNotice('');
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 transition cursor-pointer font-medium"
                    >
                      {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none font-mono transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#07080B] border-zinc-700 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-xs text-zinc-300 font-medium">
                      {language === 'bn' ? 'আমাকে মনে রাখুন' : 'Remember Me'}
                    </span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    PBKDF2 Salted Hash Active
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-black" />
                  )}
                  <span>
                    {loading
                      ? language === 'bn'
                        ? 'যাচাই করা হচ্ছে...'
                        : 'Authenticating...'
                      : language === 'bn'
                      ? 'পোর্টাল লগইন করুন'
                      : 'AUTHENTICATE & ENTER PORTAL'}
                  </span>
                </button>

                {/* Direct Link to Official Staff Portal (/admin) */}
                <div className="pt-3 border-t border-zinc-800/80 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchToStaff) {
                        onSwitchToStaff();
                      } else {
                        window.history.pushState({}, '', '/admin');
                        window.location.href = '/admin';
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition cursor-pointer group"
                  >
                    <IdCard className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition" />
                    <span>
                      {language === 'bn'
                        ? 'স্টাফ মেম্বার? অফিসিয়াল স্টাফ পোর্টালে যান (lionixai.com/admin)'
                        : 'Company Staff? Access Staff Portal at lionixai.com/admin'}
                    </span>
                    <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </form>
            ) : step === 'forgot_password' ? (
              /* EXCLUSIVE OWNER FORGOT PASSWORD & RECOVERY SYSTEM */
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-in fade-in">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h3 className="font-cinzel text-sm font-bold text-white">
                    {language === 'bn' ? 'কোম্পানি মালিক পাসওয়ার্ড রিসেট' : 'Owner Password Recovery'}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-mono font-bold">lionixaitc@gmail.com</p>
                  <p className="text-[10px] text-zinc-400">
                    {language === 'bn'
                      ? 'অনুমোদিত কোম্পানির মালিকের জন্য নিবেদিত পাসওয়ার্ড রিসেট সিস্টেম।'
                      : 'Exclusively for the authorized Company Owner to reset their permanent password.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                    {language === 'bn' ? 'মালিক রিকভারি সিকিউরিটি কি' : 'Owner Master Recovery Key'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={recoveryKey}
                      onChange={(e) => setRecoveryKey(e.target.value)}
                      placeholder="LIONIX-MASTER-2026-KEY"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none font-mono transition"
                    />
                  </div>
                  <span className="text-[10px] text-amber-400/80 block font-mono">
                    Owner Sovereign Executive Key: LIONIX-MASTER-2026-KEY
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                    {language === 'bn' ? 'নতুন স্থায়ী পাসওয়ার্ড' : 'New Permanent Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="•••••••••••• (min 8 chars)"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none font-mono transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmResetPassword}
                      onChange={(e) => setConfirmResetPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none font-mono transition"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-200/90 leading-relaxed">
                  <strong>Permanent Security:</strong> Upon reset, old sessions are automatically revoked and the new salted hash will become your permanent login credential.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('login');
                      setErrorMsg('');
                      setStatusNotice('');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 transition cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল করুন' : 'Back to Login'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin text-black" />}
                    <span>{language === 'bn' ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset & Save Password'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* OWNER INITIAL ONE-TIME SETUP (Shown ONLY if database has no initial password) */
              <form onSubmit={handleOwnerSetupSubmit} className="space-y-4 animate-in fade-in">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="font-cinzel text-sm font-bold text-white">
                    {language === 'bn' ? 'মালিক অ্যাকাউন্ট পাসওয়ার্ড কনফিগারেশন' : 'Owner Portal Password Setup'}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-mono font-bold">lionixaitc@gmail.com</p>
                  <p className="text-[10px] text-zinc-400">
                    {language === 'bn'
                      ? 'পোর্টাল পরিচালনার জন্য আপনার স্থায়ী কোম্পানি পাসওয়ার্ড তৈরি করুন।'
                      : 'Create a permanent password to access the internal management portal.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                    {language === 'bn' ? 'কোম্পানি পোর্টাল পাসওয়ার্ড' : 'Company Portal Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      placeholder="•••••••••••• (min 8 chars)"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none font-mono transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                    {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={setupConfirmPassword}
                      onChange={(e) => setSetupConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none font-mono transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin text-black" />}
                  <span>{language === 'bn' ? 'পাসওয়ার্ড সেট করুন' : 'Save Permanent Password'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Security Assurance Footer */}
          <div className="text-center space-y-1 text-zinc-500 text-[11px]">
            <p className="flex items-center justify-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Trust Architecture • PBKDF2 10,000 Iteration Hash</span>
            </p>
            <p>© 2026 LIONIX AI Technologies. All sovereign rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
