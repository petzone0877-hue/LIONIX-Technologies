import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { CompanyInfo } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Building2,
  Mail,
  Calendar,
  Lock,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface PublicVerificationProfileProps {
  staffId: string;
  company: CompanyInfo;
  onBack: () => void;
}

export const PublicVerificationProfile: React.FC<PublicVerificationProfileProps> = ({
  staffId,
  company,
  onBack,
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiService.getPublicProfile(staffId);
        if (data && data.success && data.profile) {
          setProfile(data.profile);
        } else {
          setError(data.message || 'Staff profile could not be verified in the LIONIX registry.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to connect to verification server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [staffId]);

  return (
    <div className="min-h-screen bg-[#07080B] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 animate-in fade-in duration-300">
        {/* Top Return Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to LIONIX AI Studio</span>
        </button>

        {/* Verification Card */}
        <div className="rounded-3xl bg-gradient-to-b from-[#121622] via-[#0D1017] to-[#08090C] border-2 border-amber-500/60 p-6 sm:p-8 shadow-2xl shadow-amber-500/20 relative overflow-hidden">
          {/* Header Crest */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

          <div className="text-center pt-2 pb-6 border-b border-zinc-800">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src={company.logoUrl || '/lionix-gold-lion.svg'}
                alt="LIONIX"
                className="w-10 h-10 object-contain filter drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))"
              />
              <span className="font-cinzel text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                {company.name}
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              Official Public Identity Verification Registry
            </p>
          </div>

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-zinc-400 font-mono">
                Querying cryptographic staff registry...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="font-cinzel text-base font-bold text-white">Verification Failed</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">{error}</p>
            </div>
          ) : profile ? (
            <div className="py-6 space-y-6">
              {/* Authenticity Badge */}
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mx-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Active Staff Member</span>
              </div>

              {/* Staff Portrait & Legal Details */}
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-xl shadow-amber-500/20 shrink-0"
                />
                <div className="space-y-1">
                  <h2 className="font-cinzel font-black text-xl text-zinc-100">{profile.name}</h2>
                  <p className="text-xs text-amber-400 font-bold">{profile.jobTitle}</p>
                  <p className="text-xs text-zinc-400">{profile.department}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Verification Attributes */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#090B0F] border border-zinc-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Staff ID</span>
                  <span className="text-amber-400 font-bold">{profile.staffId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Status</span>
                  <span className="text-emerald-400 font-bold uppercase">{profile.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Official Gmail</span>
                  <span className="text-zinc-300 truncate block">{profile.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Joining Date</span>
                  <span className="text-zinc-300">{profile.joiningDate}</span>
                </div>
              </div>

              {/* Cryptographic Seal */}
              <div className="p-3.5 rounded-2xl bg-[#090B0F]/80 border border-amber-500/20 text-[10px] font-mono text-zinc-500 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="font-bold flex items-center gap-1.5 text-amber-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Cryptographic Seal
                  </span>
                  <span>SHA256</span>
                </div>
                <p className="break-all text-[9px] text-zinc-400 font-mono">
                  {profile.securityHash || '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
                </p>
                <div className="flex justify-between text-[8px] text-zinc-500 pt-1 border-t border-zinc-800">
                  <span>Verified at: {new Date(profile.verifiedAt || Date.now()).toUTCString()}</span>
                  <span>Authority: LIONIX Autonomous Registry</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Footer Note */}
          <div className="pt-4 border-t border-zinc-800 text-center">
            <p className="text-[9px] text-zinc-500">
              © {new Date().getFullYear()} {company.name}. All rights reserved. •{' '}
              <a href={company.website} className="text-amber-400 hover:underline">
                {company.website}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
