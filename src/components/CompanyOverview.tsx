import React, { useState } from 'react';
import { CompanyInfo, UserSession } from '../types';
import { apiService } from '../services/api';
import {
  Building2,
  Crown,
  Sparkles,
  Edit3,
  Check,
  Globe,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface CompanyOverviewProps {
  company: CompanyInfo;
  user: UserSession | null;
  onCompanyUpdated: (updated: CompanyInfo) => void;
  onNavigateTab: (tab: string) => void;
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({
  company,
  user,
  onCompanyUpdated,
  onNavigateTab,
}) => {
  const isOwner = user?.isOwner || user?.role === 'Company Owner';
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<CompanyInfo>({ ...company });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      setSaveErr('Only the Company Owner can update corporate branding.');
      return;
    }
    setSaving(true);
    setSaveMsg('');
    setSaveErr('');
    try {
      const updated = await apiService.updateCompanyInfo(formData);
      onCompanyUpdated(updated);
      setSaveMsg('Company identity and branding updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setSaveErr(err.message || 'Failed to update company branding.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner with Black & Gold Luxury Aesthetic */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-[#0B0D13] shadow-2xl shadow-amber-500/10">
        <div className="h-64 sm:h-72 w-full relative">
          <img
            src={company.bannerUrl}
            alt="LIONIX Banner"
            className="w-full h-full object-cover filter brightness-[0.35] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13] via-[#0B0D13]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/15 via-transparent to-amber-900/15"></div>

          {/* Banner Floating Highlights */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-black/60 border border-amber-500/30 text-amber-400 font-bold text-xs tracking-wider uppercase backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Autonomous AI Enterprise
            </span>
            {isOwner && (
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editing ? 'Cancel Editing' : 'Edit Company Branding'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Brand Information Header Overlay */}
        <div className="px-6 sm:px-10 pb-8 -mt-20 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Lion Emblem Logo */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#090B0F] border-2 border-amber-500 p-2 shadow-2xl shadow-amber-500/30 shrink-0 relative group">
              <img
                src={company.logoUrl}
                alt="LIONIX Logo"
                className="w-full h-full object-contain filter drop-shadow(0 0 10px rgba(245, 158, 11, 0.6))"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black p-1 rounded-full shadow-lg">
                <Crown className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-cinzel text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-amber-500 tracking-wide">
                  {company.name}
                </h1>
              </div>
              <p className="font-cinzel font-bold text-base sm:text-lg text-amber-400 mt-1 tracking-wider">
                {company.tagline}
              </p>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                {company.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('ai-manager')}
              className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Company Manager</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Owner Edit Form Modal / Accordion */}
      {editing && isOwner && (
        <form
          onSubmit={handleSave}
          className="p-6 md:p-8 rounded-2xl bg-[#0F1219] border border-amber-500/40 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="font-cinzel font-bold text-lg text-amber-300">
                Company Owner Brand & Identity Editor
              </h2>
            </div>
            <span className="text-xs text-zinc-400">Authorized: liongroupdv@gmail.com</span>
          </div>

          {saveMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
              {saveMsg}
            </div>
          )}
          {saveErr && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {saveErr}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Official Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Main Software Platform Name</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Company Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Brand Name</label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Company Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Logo URL / Vector Path</label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Banner Image URL</label>
              <input
                type="text"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Headquarters Location</label>
              <input
                type="text"
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Support Email</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
            >
              {saving ? 'Updating Branding...' : 'Save Corporate Branding'}
            </button>
          </div>
        </form>
      )}

      {/* Corporate Metadata & High-Level Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D0F15] border border-zinc-800 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Specialized AI Depts</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold font-cinzel text-white mt-2">16</p>
          <p className="text-[11px] text-amber-400/80 mt-1">Autonomous Coordination</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0F15] border border-zinc-800 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Natural Language Support</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">বাংলা & English</p>
          <p className="text-[11px] text-emerald-400 mt-1">Native Multi-Lingual NLP</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0F15] border border-zinc-800 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>RTC Communication</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">Agora.io</p>
          <p className="text-[11px] text-zinc-400 mt-1">Voice & Video Auto-Engine</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0F15] border border-zinc-800 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Server Compatibility</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold font-cinzel text-white mt-2">Universal</p>
          <p className="text-[11px] text-zinc-400 mt-1">VPS, cPanel, Cloud & Docker</p>
        </div>
      </div>

      {/* Corporate Identity Manifesto */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0F121A] to-[#090B0F] border border-amber-500/20 space-y-4">
        <h3 className="font-cinzel text-xl font-bold text-amber-400 flex items-center gap-2.5">
          <Crown className="w-5 h-5 text-amber-400" />
          <span>The LIONIX Autonomous Technology Vision</span>
        </h3>
        <p className="text-zinc-300 text-sm leading-relaxed">
          LIONIX AI Technologies operates as a sovereign, autonomous AI software enterprise. Under the central guidance
          of the AI Company Manager, users simply describe what they need in English or Bengali. Sixteen specialized
          AI departments orchestrate requirements analysis, architecture design, multi-file code synthesis, Gradle
          compilation, Agora RTC integration, database configuration, security audits, zero-downtime server deployments,
          and production deliverables without requiring manual technical barriers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Headquarters: {company.headquarters}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Support: {company.supportEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Founded: {company.foundedYear} • Sovereign Identity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
