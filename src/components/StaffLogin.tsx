import React, { useState } from 'react';
import { CompanyInfo, UserSession } from '../types';
import { apiService } from '../services/api';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowRight,
  Globe,
  UserCheck,
  IdCard,
  Crown,
  Info,
  HelpCircle,
} from 'lucide-react';

interface StaffLoginProps {
  company: CompanyInfo;
  onLoginSuccess: (user: UserSession) => void;
  language: 'en' | 'bn';
  onToggleLanguage: () => void;
  onSwitchToOwner?: () => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({
  company,
  onLoginSuccess,
  language,
  onToggleLanguage,
  onSwitchToOwner,
}) => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showContactOwnerModal, setShowContactOwnerModal] = useState(false);

  const isBn = language === 'bn';

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanStaffId = staffId.trim().toUpperCase();
    if (!cleanStaffId) {
      setErrorMsg(
        isBn
          ? 'অনুগ্রহ করে আপনার সঠিক Staff ID লিখুন (যেমন: LNX-ENG-001)।'
          : 'Please enter your valid Staff ID (e.g. LNX-ENG-001).'
      );
      return;
    }

    if (!password) {
      setErrorMsg(
        isBn
          ? 'অনুগ্রহ করে আপনার অ্যাকাউন্টের পাসওয়ার্ড লিখুন।'
          : 'Please enter your staff account password.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.staffLogin(cleanStaffId, password);
      if (result && result.success && result.user) {
        setSuccessMsg(
          isBn
            ? `স্বাগতম, ${result.user.name}! স্টাফ পোর্টালে সফলভাবে লগইন হয়েছে।`
            : `Welcome, ${result.user.name}! Authentication verified for LIONIX Staff Portal.`
        );
        setTimeout(() => {
          onLoginSuccess(result.user);
        }, 500);
      }
    } catch (err: any) {
      console.error('Staff Login Error:', err);
      setErrorMsg(
        err.message ||
          (isBn
            ? 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আপনার Staff ID ও পাসওয়ার্ড যাচাই করুন।'
            : 'Authentication failed. Please verify your Staff ID and password.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070A] text-zinc-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Background ambient gold gradient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-amber-500/10 via-transparent to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-amber-500/20 bg-[#0A0D14]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1.5px] shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#090B10] rounded-[14px] flex items-center justify-center overflow-hidden">
              <img
                src={company.logoUrl}
                alt="LIONIX"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  (e.currentTarget as any).src =
                    '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png';
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-sm sm:text-base font-black tracking-wider text-white">
                {company.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                STAFF PORTAL
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block tracking-wide">
              {company.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Switch to Owner Portal */}
          <button
            onClick={() => {
              if (onSwitchToOwner) {
                onSwitchToOwner();
              } else {
                window.history.pushState({}, '', '/');
                window.location.href = '/';
              }
            }}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {isBn ? 'কোম্পানি ওনার লগইন' : 'Owner Executive Portal'}
            </span>
            <span className="sm:hidden">Owner</span>
          </button>
        </div>
      </header>

      {/* Main Staff Login Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-[#0D1017]/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Top Brand Banner inside card */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <IdCard className="w-3.5 h-3.5" />
              <span>{isBn ? 'স্টাফ লগইন গেটওয়ে' : 'Staff Login Gateway'}</span>
            </div>

            <h1 className="font-cinzel text-xl sm:text-2xl font-black text-white tracking-wide">
              {isBn ? 'স্টাফ ও পার্সোনেল পোর্টাল' : 'Staff & Personnel Portal'}
            </h1>

            {/* Official Dedicated URL Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
              <span className="text-zinc-500">{isBn ? 'অফিসিয়াল URL:' : 'Dedicated URL:'}</span>
              <span className="text-amber-400 font-bold">https://lionixai.com/admin</span>
            </div>

            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed pt-1">
              {isBn
                ? 'আপনার অনুমোদিত Staff ID এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন।'
                : 'Enter your assigned Staff ID and secure portal password to access assigned tools.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed font-semibold">{successMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleStaffLogin} className="space-y-4">
            {/* Staff ID */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>{isBn ? 'স্টাফ আইডি (Login ID) *' : 'Staff ID (Login ID) *'}</span>
                <span className="text-[10px] font-mono text-amber-500/80 lowercase">e.g. LNX-ENG-001</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Shield className="w-4 h-4 text-amber-500/70" />
                </div>
                <input
                  type="text"
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  placeholder="LNX-ENG-001"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121622] border border-zinc-800 focus:border-amber-500 text-white placeholder-zinc-600 text-xs sm:text-sm font-mono tracking-wider outline-none transition uppercase shadow-inner"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>{isBn ? 'অ্যাকাউন্ট পাসওয়ার্ড *' : 'Staff Password *'}</span>
                <span className="text-[10px] text-zinc-500 font-mono">PBKDF2 Encrypted</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4 text-amber-500/70" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#121622] border border-zinc-800 focus:border-amber-500 text-white placeholder-zinc-600 text-xs sm:text-sm font-mono outline-none transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs text-zinc-400">
                  {isBn ? 'লগইন মনে রাখুন' : 'Remember Session'}
                </span>
              </label>

              {/* Informative Link for Contact Owner */}
              <button
                type="button"
                onClick={() => setShowContactOwnerModal(true)}
                className="text-xs text-amber-400/90 hover:text-amber-300 hover:underline transition flex items-center gap-1 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Authenticating Staff...'}</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>{isBn ? 'স্টাফ পোর্টালে প্রবেশ করুন' : 'Log In to Staff Portal'}</span>
                </>
              )}
            </button>
          </form>

          {/* Strict Security Policy Notices */}
          <div className="mt-6 pt-5 border-t border-zinc-800/90 space-y-3">
            {/* Registration Policy */}
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-zinc-300">
                  {isBn ? 'নিরাপত্তা নীতিমালা:' : 'Security Policy:'}
                </span>{' '}
                {isBn
                  ? 'পাবলিক স্টাফ রেজিস্ট্রেশন সম্পূর্ণ বন্ধ। শুধুমাত্র কোম্পানি ওনার স্টাফ অ্যাকাউন্ট তৈরি ও অনুমোদন করতে পারেন।'
                  : 'Public staff registration is strictly disabled. Staff accounts are provisioned exclusively by the Company Owner.'}
              </div>
            </div>

            {/* Switch to Owner Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onSwitchToOwner) {
                    onSwitchToOwner();
                  } else {
                    window.history.pushState({}, '', '/');
                    window.location.href = '/';
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition cursor-pointer group"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition" />
                <span>
                  {isBn
                    ? 'আপনি কি কোম্পানি ওনার? ওনার পোর্টালে যান'
                    : 'Are you the Company Owner? Switch to Owner Portal'}
                </span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal (Explains policy to contact Owner directly) */}
      {showContactOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0B0D13] border border-amber-500/40 rounded-3xl w-full max-w-md p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-cinzel font-bold text-sm text-white">
                  {isBn ? 'পাসওয়ার্ড উদ্ধার সংক্রান্ত নোটিশ' : 'Staff Password Recovery Policy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowContactOwnerModal(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isBn
                      ? 'স্বয়ংক্রিয় পাসওয়ার্ড রিসেট বন্ধ'
                      : 'Self-Service Password Reset Is Disabled'}
                  </span>
                </p>
                <p className="text-[11px] text-amber-200/90">
                  {isBn
                    ? 'জিরো-ট্রাস্ট সিকিউরিটির স্বার্থে স্টাফ পোর্টালে সরাসরি পাসওয়ার্ড রিসেটের সুবিধা নেই।'
                    : 'To enforce Zero-Trust enterprise integrity, staff members cannot reset credentials independently.'}
                </p>
              </div>

              <div className="space-y-2 text-zinc-400 text-xs">
                <p>
                  <strong className="text-zinc-200">
                    {isBn ? 'কীভাবে পাসওয়ার্ড রিসেট করবেন?' : 'How to Reset Your Password:'}
                  </strong>
                </p>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px]">
                  <li>
                    {isBn
                      ? 'কোম্পানি ওনারের (Company Owner) সঙ্গে সরাসরি যোগাযোগ করুন।'
                      : 'Contact the Company Owner directly via official channels.'}
                  </li>
                  <li>
                    {isBn
                      ? 'আপনার Staff ID এবং পূর্ণ নাম উল্লেখ করুন।'
                      : 'Provide your assigned Staff ID and full official name.'}
                  </li>
                  <li>
                    {isBn
                      ? 'ওনার তাঁর Staff Management ড্যাশবোর্ড থেকে তাৎক্ষণিক পাসওয়ার্ড রিসেট করে আপনাকে নতুন পাসওয়ার্ড প্রদান করবেন।'
                      : 'The Owner will securely generate a new password for your account directly from the Staff Management interface.'}
                  </li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
                <span className="text-zinc-500">Owner Contact:</span>
                <span className="text-amber-400 font-bold">{company.supportEmail || 'lionixaitc@gmail.com'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowContactOwnerModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              {isBn ? 'বুঝেছি, বন্ধ করুন' : 'Understood, Close'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <footer className="relative z-10 w-full border-t border-zinc-800/80 bg-[#07090E]/80 backdrop-blur-md px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 font-mono">
        <div>
          © {company.foundedYear || '2026'} {company.name}. All Rights Reserved.
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-500/80">BUILD ANYTHING. CREATE EVERYTHING.</span>
        </div>
      </footer>
    </div>
  );
};
