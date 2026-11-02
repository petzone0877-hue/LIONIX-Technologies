import React, { useState, useEffect } from 'react';
import { UserSession, CompanyInfo, AIDepartment, GmailApiConfig } from '../types';
import { apiService } from '../services/api';
import {
  Crown,
  SlidersHorizontal,
  Play,
  Pause,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Users,
  Server,
  Radio,
  RefreshCw,
  CheckCircle2,
  Lock,
  Mail,
  Send,
  AlertTriangle,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface OwnerControlCenterProps {
  user: UserSession | null;
  company: CompanyInfo;
  departments: AIDepartment[];
  onNavigateTab: (tab: string) => void;
}

export const OwnerControlCenter: React.FC<OwnerControlCenterProps> = ({
  user,
  company,
  departments,
  onNavigateTab,
}) => {
  const isOwner = user?.isOwner || user?.role === 'Company Owner';
  const [automationActive, setAutomationActive] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'appr-01',
      title: 'Production SSL Key Rotation for lionix.ai',
      department: 'AI Security',
      risk: 'Medium',
      time: '12m ago',
    },
    {
      id: 'appr-02',
      title: 'Provision High-Memory GPU Build Worker (AWS Cluster)',
      department: 'AI Server Management',
      risk: 'Low',
      time: '24m ago',
    },
  ]);
  const [actionMessage, setActionMessage] = useState('');

  // Gmail API Configuration State
  const [gmailConfig, setGmailConfig] = useState<GmailApiConfig>({
    configured: false,
    senderEmail: 'lionixaitc@gmail.com',
    authorizedEmail: 'liongroupdv@gmail.com',
    clientId: '',
    hasClientSecret: false,
    hasRefreshToken: false,
    lastTestStatus: 'NOT_TESTED',
  });
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [refreshTokenInput, setRefreshTokenInput] = useState('');
  const [testRecipientInput, setTestRecipientInput] = useState('liongroupdv@gmail.com');
  const [isSavingGmail, setIsSavingGmail] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp?: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    const fetchGmailSettings = async () => {
      try {
        const config = await apiService.getGmailConfig();
        if (config) {
          setGmailConfig(config);
          if (config.clientId) setClientIdInput(config.clientId);
        }
      } catch (_) {}
    };

    if (isOwner) {
      fetchGmailSettings();
    }
  }, [isOwner]);

  const handleApprove = (id: string, title: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
    setActionMessage(`Approved: "${title}" executed with master executive authority.`);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const handleReject = (id: string, title: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
    setActionMessage(`Rejected: "${title}" cancelled by Company Owner.`);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const handleSaveGmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGmail(true);
    setTestResult(null);

    try {
      const res = await apiService.updateGmailConfig({
        clientId: clientIdInput.trim(),
        clientSecret: clientSecretInput.trim() || undefined,
        refreshToken: refreshTokenInput.trim() || undefined,
        authorizedEmail: 'liongroupdv@gmail.com',
      });

      if (res.config) {
        setGmailConfig(res.config);
      }
      setActionMessage('Google Cloud Gmail API configuration updated in persistent database.');
      setClientSecretInput('');
      setRefreshTokenInput('');
    } catch (err: any) {
      setActionMessage(`Configuration update failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSavingGmail(false);
      setTimeout(() => setActionMessage(''), 5000);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await apiService.testSendEmail(testRecipientInput.trim());
      setTestResult({
        success: res.success,
        message: res.message,
        timestamp: new Date().toISOString(),
        details: res.messageId ? `Message ID: ${res.messageId}` : res.error,
      });

      // Refresh config status
      const updated = await apiService.getGmailConfig();
      if (updated) setGmailConfig(updated);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to dispatch test message via Gmail API',
        timestamp: new Date().toISOString(),
        details: err.details || 'Check OAuth credentials or verify token permissions.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#0B0D13] border border-amber-500/30 space-y-4">
        <Lock className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="font-cinzel text-xl font-bold text-white">Owner Control Center Restricted</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          This portal is reserved strictly for the verified Company Owner (
          <span className="text-amber-400 font-mono">liongroupdv@gmail.com</span>). Ordinary staff
          accounts cannot access executive switches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#1C160F] via-[#110E09] to-[#07080B] border-2 border-amber-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl shadow-amber-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0D0F16] border-2 border-amber-400 p-2 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/30">
            <Crown className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-700 text-black font-extrabold text-[10px] uppercase tracking-wider">
                Supreme Administrative Authority
              </span>
              <span className="text-xs font-mono text-zinc-400">liongroupdv@gmail.com</span>
            </div>
            <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white mt-1">
              Owner Control Center
            </h1>
            <p className="text-xs text-zinc-300 mt-0.5">
              Master governance over AI pipelines, Gmail API credentials, 16 AI departments, and
              corporate configurations.
            </p>
          </div>
        </div>

        {/* Master Automation Switch */}
        <div className="flex items-center gap-3 bg-[#0A0C11] p-3 rounded-2xl border border-amber-500/30 shrink-0">
          <div>
            <p className="text-xs font-bold text-zinc-200">Company Automation State</p>
            <p className="text-[10px] text-zinc-400">
              {automationActive ? 'Autonomous pipelines active' : 'All background workers paused'}
            </p>
          </div>
          <button
            onClick={() => setAutomationActive(!automationActive)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition flex items-center gap-1.5 ${
              automationActive
                ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20'
            }`}
          >
            {automationActive ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{automationActive ? 'Active' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* GMAIL API OAUTH INTEGRATION CENTER */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0B0D13] border-2 border-amber-500/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-lg font-bold text-white">
                  Google Cloud Console Gmail API Integration
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    gmailConfig.configured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {gmailConfig.configured ? 'Active & Configured' : 'Requires Configuration'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Authenticates via Google Cloud OAuth 2.0 to deliver real single-use login OTPs and
                official company notifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-[#12141C] px-3 py-1.5 rounded-xl border border-zinc-800">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Scope: https://www.googleapis.com/auth/gmail.send</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Credentials Form */}
          <form onSubmit={handleSaveGmailConfig} className="lg:col-span-7 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Authorized Gmail Address (Master Executive):
              </label>
              <input
                type="text"
                value="liongroupdv@gmail.com"
                readOnly
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090B0F] border border-zinc-800 text-xs text-amber-400 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Google Cloud OAuth 2.0 Client ID:
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="xxxx.apps.googleusercontent.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090B0F] border border-zinc-800 focus:border-amber-400 text-xs text-zinc-200 font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  OAuth Client Secret:
                </label>
                <input
                  type="password"
                  value={clientSecretInput}
                  onChange={(e) => setClientSecretInput(e.target.value)}
                  placeholder={gmailConfig.hasClientSecret ? '•••••••••••••••• (Stored)' : 'GOCSPX-xxxx'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090B0F] border border-zinc-800 focus:border-amber-400 text-xs text-zinc-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  OAuth Refresh Token:
                </label>
                <input
                  type="password"
                  value={refreshTokenInput}
                  onChange={(e) => setRefreshTokenInput(e.target.value)}
                  placeholder={gmailConfig.hasRefreshToken ? '•••••••••••••••• (Stored)' : '1//xxxx'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090B0F] border border-zinc-800 focus:border-amber-400 text-xs text-zinc-200 font-mono focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingGmail}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSavingGmail ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isSavingGmail ? 'Saving Credentials...' : 'Save Gmail API Credentials'}</span>
            </button>
          </form>

          {/* Real Live Test Email Dispatcher */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0F1118] border border-zinc-800 space-y-4">
            <h3 className="font-cinzel text-sm font-bold text-amber-400 flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Real Live Test Email Dispatcher</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Triggers an authentic test message using Google Gmail REST API. Reports actual delivery
              results or specific OAuth failure codes without simulation.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Test Recipient Email:
                </label>
                <input
                  type="email"
                  value={testRecipientInput}
                  onChange={(e) => setTestRecipientInput(e.target.value)}
                  placeholder="liongroupdv@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#07080B] border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition border border-zinc-700 hover:border-amber-500/40 disabled:opacity-50"
              >
                {isSendingTest ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{isSendingTest ? 'Contacting Gmail API...' : 'Send Live Test Email'}</span>
              </button>
            </div>

            {/* Test Results Output */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 font-mono ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Status: {testResult.success ? 'SUCCESS (Delivered)' : 'FAILED (Error)'}</span>
                  {testResult.timestamp && (
                    <span className="text-[10px] text-zinc-400">
                      {new Date(testResult.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                {testResult.details && (
                  <p className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
                    {testResult.details}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sensitive Actions Requiring Executive Approval */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0B0D13] border border-amber-500/30 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-400" />
            <h2 className="font-cinzel text-lg font-bold text-white">
              Pending Sensitive Approvals ({pendingApprovals.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Requires Owner Authorization</span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-mono">
            No sensitive actions pending owner authorization. All systems compliant.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-4 rounded-2xl bg-[#111319] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {appr.department}
                    </span>
                    <span className="text-xs font-bold text-zinc-200">{appr.title}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono mt-1">
                    Risk Assessment: {appr.risk} • Submitted: {appr.time}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(appr.id, appr.title)}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(appr.id, appr.title)}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-extrabold uppercase tracking-wider"
                  >
                    Authorize Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Executive Navigation Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateTab('overview')}
          className="p-5 rounded-2xl bg-[#0B0D13] border border-zinc-800 hover:border-amber-500/40 text-left transition group"
        >
          <span className="text-zinc-500 text-xs block mb-1">Company Identity</span>
          <h4 className="font-cinzel text-sm font-bold text-zinc-100 group-hover:text-amber-400">
            Edit Logo & Banner
          </h4>
        </button>

        <button
          onClick={() => onNavigateTab('staff-management')}
          className="p-5 rounded-2xl bg-[#0B0D13] border border-zinc-800 hover:border-amber-500/40 text-left transition group"
        >
          <span className="text-zinc-500 text-xs block mb-1">Staff Directory</span>
          <h4 className="font-cinzel text-sm font-bold text-zinc-100 group-hover:text-amber-400">
            Manage Personnel
          </h4>
        </button>

        <button
          onClick={() => onNavigateTab('roles-idcards')}
          className="p-5 rounded-2xl bg-[#0B0D13] border border-zinc-800 hover:border-amber-500/40 text-left transition group"
        >
          <span className="text-zinc-500 text-xs block mb-1">Two-Sided ID Cards</span>
          <h4 className="font-cinzel text-sm font-bold text-zinc-100 group-hover:text-amber-400">
            Staff Credentials
          </h4>
        </button>

        <button
          onClick={() => onNavigateTab('security-center')}
          className="p-5 rounded-2xl bg-[#0B0D13] border border-zinc-800 hover:border-amber-500/40 text-left transition group"
        >
          <span className="text-zinc-500 text-xs block mb-1">Audit Stream</span>
          <h4 className="font-cinzel text-sm font-bold text-zinc-100 group-hover:text-amber-400">
            Security Telemetry
          </h4>
        </button>
      </div>
    </div>
  );
};
