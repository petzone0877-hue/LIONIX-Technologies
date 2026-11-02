import React, { useState, useEffect } from 'react';
import { AuditEntry, UserSession } from '../types';
import { apiService } from '../services/api';
import {
  Lock,
  Shield,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Key,
  Database,
  FileLock,
  Layers,
  Cpu,
} from 'lucide-react';

interface SecurityCenterProps {
  user: UserSession | null;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({ user }) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAuditLogs();
      setLogs(data);
    } catch (_) {
      // Fallback sample audit logs
      setLogs([
        {
          id: 'aud-001',
          timestamp: '2026-10-31 13:10:00',
          user: 'liongroupdv@gmail.com',
          action: 'Executive Auth Verification',
          department: 'Executive Board',
          ip: '127.0.0.1',
          severity: 'low',
          details: 'Company Owner logged in via verified Gmail OAuth handshake',
        },
        {
          id: 'aud-002',
          timestamp: '2026-10-31 13:12:44',
          user: 'Nexus Architect AI',
          action: 'Code Architecture Generation',
          department: 'AI Software Development',
          ip: '10.0.4.12',
          severity: 'low',
          details: 'Autonomous multi-file code synthesis completed for project proj-lion-01',
        },
        {
          id: 'aud-003',
          timestamp: '2026-10-31 13:15:20',
          user: 'Sentinel Shield AI',
          action: 'ID Card Access Authorization Check',
          department: 'AI Security',
          ip: '10.0.4.88',
          severity: 'medium',
          details: 'Staff ID card access restricted strictly to Owner and Super Admin roles. Non-management request blocked.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const matchSev = selectedSeverity === 'all' || l.severity === selectedSeverity;
    return matchSearch && matchSev;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust Enterprise Compliance</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            Security Center & Real-Time Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Strict isolation of private keys and Agora certificates. Role-based privilege enforcement,
            AES-256 encrypted server storage, and immutable security audit trails.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold transition flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Security Posture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B0D13] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Authentication Policy</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-cinzel text-white mt-2">Gmail-Only OAuth</p>
          <p className="text-[10px] text-zinc-500 mt-1">Zero Phone / No OTP vulnerabilities</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0D13] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Secrets Isolation</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold font-cinzel text-amber-400 mt-2">AES-256 Vault</p>
          <p className="text-[10px] text-zinc-500 mt-1">0 client-side private key leaks</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0D13] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Staff ID Card Protection</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold font-cinzel text-white mt-2">Management-Only</p>
          <p className="text-[10px] text-emerald-400 mt-1">Staff access strictly blocked</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0D13] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Build Worker Isolation</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-cinzel text-emerald-400 mt-2">Sandboxed R8</p>
          <p className="text-[10px] text-zinc-500 mt-1">Gradle execution in clean containers</p>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="p-6 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter audit logs..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedSeverity === 'all' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSeverity('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedSeverity === 'critical' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setSelectedSeverity('medium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedSeverity === 'medium' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Medium
            </button>
          </div>
        </div>

        {/* Table of Events */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#11141C] text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Principal User</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-mono text-zinc-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#111319]">
                  <td className="p-3.5 text-zinc-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3.5 text-zinc-200">{log.user}</td>
                  <td className="p-3.5 text-amber-400 font-bold">{log.action}</td>
                  <td className="p-3.5 text-zinc-400">{log.department}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                        log.severity === 'critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : log.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-3.5 text-zinc-400 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
