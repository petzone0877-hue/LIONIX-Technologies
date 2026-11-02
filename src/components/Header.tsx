import React from 'react';
import { UserSession, CompanyInfo } from '../types';
import { Shield, Sparkles, LogOut, Crown, Activity, Globe, ExternalLink } from 'lucide-react';

interface HeaderProps {
  user: UserSession | null;
  company: CompanyInfo;
  onSelectTab: (tab: string) => void;
  activeLanguage: 'en' | 'bn';
  onToggleLanguage: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  company,
  onSelectTab,
  activeLanguage,
  onToggleLanguage,
  onLogout,
}) => {
  const uploadedLogo =
    company.logoUrl ||
    '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png';

  return (
    <header className="border-b border-amber-500/20 bg-[#07080B]/95 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div
          className="flex items-center gap-3 md:gap-4 cursor-pointer"
          onClick={() => onSelectTab('overview')}
        >
          <div className="relative group">
            <div className="w-12 h-12 rounded-full bg-[#0F1117] border-2 border-amber-500/60 p-1 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:border-amber-400 transition-all duration-300">
              <img
                src={uploadedLogo}
                alt="LIONIX"
                className="w-full h-full object-contain rounded-full filter drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))"
                onError={(e) => {
                  (e.currentTarget as any).src =
                    '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png';
                }}
              />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-lg md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-amber-600">
                {company.name || 'LIONIX AI TECHNOLOGIES'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md">
                PRIVATE PORTAL
              </span>
            </div>
            <p className="text-xs font-semibold tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">
                {company.tagline || 'BUILD ANYTHING. CREATE EVERYTHING.'}
              </span>
              <span className="hidden md:inline text-zinc-600">•</span>
              <span className="hidden md:inline text-zinc-400">{company.description}</span>
            </p>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* External Separate Public Website Link */}
          <a
            href={company.website || 'https://lionix.ai'}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1118] hover:bg-[#161922] border border-zinc-800 hover:border-amber-500/30 text-xs text-zinc-400 hover:text-zinc-200 transition"
            title="Separate Public Website for Ordinary Visitors"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>

          {/* Bengali / English Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111319] hover:bg-[#1A1D27] border border-amber-500/20 text-xs font-semibold text-amber-300 transition"
            title="Toggle Language (English / বাংলা)"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeLanguage === 'en' ? 'EN' : 'বাংলা'}</span>
          </button>

          {/* Authenticated Staff / Owner Profile */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[#0F1118] border border-zinc-800 text-left">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-amber-500/40"
                  />
                  {user.isOwner && (
                    <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full p-0.5 text-black">
                      <Crown className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-200 truncate max-w-[120px]">
                      {user.name}
                    </span>
                    {user.isOwner ? (
                      <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-amber-700 text-black font-extrabold text-[9px] rounded uppercase tracking-wider">
                        Owner
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 font-medium text-[9px] rounded">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 block truncate max-w-[130px]">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Secure Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold transition cursor-pointer"
                title="Sign out of Private Company Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
