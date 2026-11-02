import React from 'react';
import {
  Building2,
  Crown,
  Bot,
  Sparkles,
  Smartphone,
  Layout,
  Radio,
  Server,
  Globe2,
  Database,
  Code2,
  UploadCloud,
  CheckCircle2,
  Users2,
  ShieldCheck,
  CreditCard,
  Cpu,
  Lock,
  PlaySquare,
  SlidersHorizontal,
  ExternalLink,
  FolderCode,
  QrCode,
  Edit,
} from 'lucide-react';
import { UserSession } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: UserSession | null;
}

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
  restricted?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, user }) => {
  const isOwner = user?.isOwner || user?.role === 'Company Owner';
  const isSuperAdmin = user?.role === 'Super Admin';

  const menuSections: Array<{ title: string; items: SidebarMenuItem[] }> = [
    {
      title: 'LIONIX AI Studio',
      items: [
        { id: 'ai-studio', label: 'AI Studio Workspace', icon: Sparkles, badge: 'Flagship', highlight: true },
        { id: 'project-dashboard', label: 'Project Dashboard', icon: FolderCode, badge: 'Projects' },
        { id: 'android-builder', label: 'Android Build Center', icon: Smartphone, badge: 'APK / AAB' },
        { id: 'web-builder', label: 'Website & Full-Stack', icon: Layout, badge: 'Web/API' },
        { id: 'domain-deployment', label: 'Custom Domain & DNS', icon: Globe2, badge: 'Zero-Down' },
        { id: 'server-manager', label: 'Universal Server Fleet', icon: Server, badge: 'DirectAdmin' },
      ],
    },
    {
      title: 'Company & Intelligence',
      items: [
        { id: 'overview', label: 'Company Overview', icon: Building2, badge: 'Portal' },
        { id: 'ai-manager', label: 'AI Company Manager', icon: Crown, badge: 'CEO Core' },
        { id: 'ai-agents', label: 'AI Agent Center', icon: Bot, badge: '16 Depts' },
        { id: 'owner-center', label: 'Owner Account & Security', icon: SlidersHorizontal, badge: 'Executive', restricted: true },
        { id: 'qr-generator', label: 'QR Code Generator', icon: QrCode, badge: 'Owner Tool', restricted: true },
        { id: 'agora-manager', label: 'Agora RTC Streams', icon: Radio, badge: 'Voice/Video' },
      ],
    },
    {
      title: 'Enterprise & Security',
      items: [
        { id: 'staff-management', label: 'Staff Management', icon: Users2, badge: 'Personnel', restricted: !isOwner && !isSuperAdmin },
        { id: 'roles-idcards', label: 'Staff ID Card Management', icon: CreditCard, badge: 'Cards', restricted: true },
        { id: 'edit-idcard', label: 'Edit Staff ID Card', icon: Edit, badge: 'Editor', restricted: true },
        { id: 'file-upload', label: 'File Upload Center', icon: UploadCloud, badge: 'Multi-Format' },
        { id: 'ai-testing', label: 'AI Testing & Debugger', icon: CheckCircle2, badge: 'Auto-Fix' },
        { id: 'ai-models', label: 'AI Model Manager', icon: Cpu, badge: 'Gemini' },
        { id: 'security-center', label: 'Security & Audit Logs', icon: Lock, badge: 'Zero-Trust', restricted: true },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0A0C10] border-r border-amber-500/15 flex flex-col shrink-0 h-[calc(100vh-65px)] overflow-y-auto">
      <div className="p-4 space-y-6">
        {menuSections.map((section, idx) => {
          const visibleItems = section.items.filter((item) => {
            if (item.restricted && !isOwner && !isSuperAdmin) {
              return false;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-500/70 px-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border-l-2 border-amber-400 pl-2.5 shadow-sm shadow-amber-500/10'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#11141C]'
                      } ${item.highlight && !isActive ? 'hover:border-amber-500/30' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-amber-400'
                              : item.highlight
                              ? 'text-amber-400/80 group-hover:text-amber-400'
                              : 'text-zinc-500 group-hover:text-zinc-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium tracking-tight shrink-0 ${
                            isActive
                              ? 'bg-amber-400 text-black font-bold'
                              : 'bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Branding Note */}
      <div className="mt-auto p-4 border-t border-zinc-900 bg-[#07080B]/80 text-[11px] text-zinc-500 flex items-center justify-between">
        <div>
          <p className="font-cinzel font-bold text-amber-500/90 text-xs">LIONIX AI</p>
          <p className="text-[10px] text-zinc-600">Private Company Portal</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Secure Portal Encrypted"></div>
      </div>
    </aside>
  );
};
