import React, { useState } from 'react';
import { CompanyInfo, UserSession } from '../types';
import { Language, t } from '../locales/i18n';
import {
  Sparkles,
  Shield,
  Layers,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Crown,
  Edit3,
  CheckCircle2,
  FileText,
  Lock,
} from 'lucide-react';

interface CompanyWebsiteProps {
  company: CompanyInfo;
  user: UserSession | null;
  language: Language;
  onOpenLogin: () => void;
  onNavigateTab: (tab: string) => void;
}

export const CompanyWebsite: React.FC<CompanyWebsiteProps> = ({
  company,
  user,
  language,
  onOpenLogin,
  onNavigateTab,
}) => {
  const isOwner = user?.isOwner || user?.role === 'Company Owner';
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const services = [
    {
      title: language === 'bn' ? 'অটোনোমাস এআই সফটওয়্যার ডেভেলপমেন্ট' : 'Autonomous AI Software Development',
      desc: language === 'bn' ? 'ইংরেজি বা বাংলায় নির্দেশ দিন, আমাদের এআই আর্কিটেকচার তৈরি করে, কোড লেখে এবং ফুল-স্ট্যাক অ্যাপ বানায়।' : 'Describe in English or Bengali; our AI designs architectures, writes code, and packages full-stack software.',
      icon: '⚡',
    },
    {
      title: language === 'bn' ? 'নেটিভ অ্যান্ড্রয়েড অ্যাপ ও এপিকে পরিকাঠামো' : 'Native Android & Mobile Infrastructure',
      desc: language === 'bn' ? 'কটলিন ও জেটপ্যাক কম্পোজ দিয়ে হাই-পারফরম্যান্স মোবাইল অ্যাপ্লিকেশন এবং গ্রেডল বিল্ড।' : 'High-performance Kotlin & Jetpack Compose mobile applications, Gradle KTS, and Android SDK 35.',
      icon: '📱',
    },
    {
      title: language === 'bn' ? 'আগোরা রিয়েল-টাইম অডিও ও ভিডিও আরটিসি' : 'Agora Real-Time Voice & Video RTC',
      desc: language === 'bn' ? 'গ্রুপ ভয়েস কল, ভিডিও কনফারেন্সিং এবং ইন্টারঅ্যাক্টিভ লাইভ স্ট্রিমিং ও সিকিউর টোকেন।' : 'Audio rooms, group video calls, and interactive live broadcasting with server-side HMAC-SHA256 tokens.',
      icon: '🎙️',
    },
    {
      title: language === 'bn' ? 'এন্টারপ্রাইজ অ্যাডমিন প্যানেল ও ড্যাশবোর্ড' : 'Enterprise Admin Suites & Dashboards',
      desc: language === 'bn' ? 'রিয়েলটাইম টেলিমেট্রি, রোল-বেসড অ্যাক্সেস কন্ট্রোল (RBAC), এবং অডিট লগ ট্র্যাকিং।' : 'Real-time metrics telemetry, Role-Based Access Control (RBAC), and immutable audit streams.',
      icon: '📊',
    },
    {
      title: language === 'bn' ? 'ক্লাউড ব্যাকএন্ড ও রিলেশনাল ডেটাবেস' : 'Cloud Backend & Relational Databases',
      desc: language === 'bn' ? 'নোডজেএস, পাইথন, পোস্টগ্রেসকিউএল স্কিমা, মাইগ্রেশন স্ক্রিপ্টিং ও রেস্ট এপিআই।' : 'Node.js Express, Python, PostgreSQL schema generation, migrations, and authenticated REST APIs.',
      icon: '🗄️',
    },
    {
      title: language === 'bn' ? 'জিরো-ডাউনটাইম সার্ভার ও ডোমেইন ডিপ্লয়মেন্ট' : 'Zero-Downtime Server & Deployment',
      desc: language === 'bn' ? 'ভিপিএস, ক্লাউড ও সিপ্যানেল কানেক্টিভিটি, ডিএনএস রেকর্ডস এবং এসএসএল হ্যান্ডশেক।' : 'VPS, Cloud and cPanel connectivity, DNS management, and Let’s Encrypt SSL orchestration.',
      icon: '🚀',
    },
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-[#0A0C11] p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{company.name}</span>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500 tracking-tight leading-tight">
            {company.tagline}
          </h1>

          <p className="text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {company.description}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <button
                onClick={() => onNavigateTab('ai-manager')}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                <span>{language === 'bn' ? 'এআই স্টুডিও শুরু করুন' : 'Launch AI Studio'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{language === 'bn' ? 'কর্পোরেট লগইন করুন' : 'Sign In to LIONIX'}</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => onNavigateTab('overview')}
                className="px-6 py-3.5 rounded-2xl bg-[#141824] hover:bg-[#1C2234] border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>{language === 'bn' ? 'ব্র্যান্ডিং সম্পাদনা' : 'Edit Company Info'}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* About & Mission / Vision Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg font-cinzel">
              M
            </div>
            <h2 className="font-cinzel text-xl font-bold text-white">
              {language === 'bn' ? 'আমাদের লক্ষ্য (Mission)' : 'Our Mission'}
            </h2>
          </div>
          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
            {company.mission}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg font-cinzel">
              V
            </div>
            <h2 className="font-cinzel text-xl font-bold text-white">
              {language === 'bn' ? 'আমাদের দর্শন (Vision)' : 'Our Vision'}
            </h2>
          </div>
          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
            {company.vision}
          </p>
        </div>
      </section>

      {/* Services & Capabilities Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white">
            {language === 'bn' ? 'সেবা ও বিশেষায়িত বিভাগ' : 'Services & Capabilities'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            {language === 'bn'
              ? 'লায়নিক্স এআই স্টুডিও ১৬টি বিশেষায়িত অটোনোমাস ডিপার্টমেন্টের মাধ্যমে সফটওয়্যার প্রস্তুত করে।'
              : 'LIONIX AI Studio operates across 16 specialized autonomous departments.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0B0D13] border border-zinc-800 hover:border-amber-500/40 transition-all duration-300 space-y-3 group"
            >
              <span className="text-3xl p-2.5 rounded-2xl bg-[#12151F] border border-zinc-800 inline-block">
                {srv.icon}
              </span>
              <h3 className="font-cinzel font-bold text-base text-zinc-100 group-hover:text-amber-400 transition">
                {srv.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{srv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Contact & Public Identity */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#0B0D13] border border-amber-500/20 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
          <div>
            <h3 className="font-cinzel text-2xl font-bold text-white">
              {language === 'bn' ? 'যোগাযোগ ও কর্পোরেট বিবরণ' : 'Corporate Contact & Office'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {language === 'bn' ? 'অফিসিয়াল যোগাযোগ ও প্রযুক্তিগত সহায়তা' : 'Official correspondence and technical oversight'}
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            Founded: {company.foundedYear}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-zinc-500 font-semibold uppercase">{language === 'bn' ? 'অফিসিয়াল জিমেইল' : 'Official Gmail'}</span>
            <p className="font-mono text-amber-400 font-bold">{company.supportEmail}</p>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-500 font-semibold uppercase">{language === 'bn' ? 'কোম্পানি মালিক' : 'Company Owner'}</span>
            <p className="font-mono text-zinc-200">{company.ownerEmail}</p>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-500 font-semibold uppercase">{language === 'bn' ? 'হেডকোয়ার্টার্স' : 'Headquarters'}</span>
            <p className="text-zinc-200">{company.headquarters}</p>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-500 font-semibold uppercase">{language === 'bn' ? 'ফোন' : 'Telephone'}</span>
            <p className="font-mono text-zinc-200">{company.phone}</p>
          </div>
        </div>

        {/* Legal Links (Privacy Policy & Terms modal trigger) */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6 text-zinc-400">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-amber-400 transition underline font-medium"
            >
              {language === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-amber-400 transition underline font-medium"
            >
              {language === 'bn' ? 'শর্তাবলী ও নিয়মাবলী' : 'Terms and Conditions'}
            </button>
            <button
              onClick={() => onNavigateTab('public-profile')}
              className="hover:text-amber-400 transition flex items-center gap-1 font-medium text-amber-500"
            >
              <span>{language === 'bn' ? 'পাবলিক ভেরিফিকেশন প্রোফাইল' : 'Public Company Verification Profile'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <p className="text-zinc-500 text-[11px]">
            © {company.foundedYear} {company.name}. All Rights Reserved.
          </p>
        </div>
      </section>

      {/* Legal Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0B0D13] border border-amber-500/30 rounded-3xl w-full max-w-xl p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-cinzel font-bold text-base text-white">
                {activeModal === 'privacy'
                  ? (language === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy')
                  : (language === 'bn' ? 'শর্তাবলী ও নিয়মাবলী' : 'Terms and Conditions')}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-zinc-500 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {activeModal === 'privacy' ? company.privacyPolicy : company.termsAndConditions}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
