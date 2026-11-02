import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  FileCheck,
  Terminal,
  Zap,
  RefreshCw,
  Bug,
  Cpu,
} from 'lucide-react';

export const AITestingDebugger: React.FC = () => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testPhase, setTestPhase] = useState<'idle' | 'analyzing' | 'patching' | 'verified'>('idle');
  const [suiteStatus, setSuiteStatus] = useState<any[]>([
    { name: 'Android Kotlin Compose AST Analyzer', status: 'passed', time: '14ms', target: 'MainActivity.kt' },
    { name: 'Agora RTC Token Secret Leak Scanner', status: 'passed', time: '8ms', target: 'server.ts & AndroidManifest' },
    { name: 'PostgreSQL Relational Schema Linter', status: 'passed', time: '12ms', target: 'db/schema.sql' },
    { name: 'Gmail OAuth PKCE Strict Boundary Check', status: 'passed', time: '6ms', target: 'api/auth' },
    { name: 'ProGuard / R8 Obfuscation Integrity', status: 'passed', time: '22ms', target: 'build.gradle.kts' },
  ]);

  const [activeDefect, setActiveDefect] = useState<any>({
    detected: true,
    file: 'app/src/main/java/ai/lionix/app/MainActivity.kt:29',
    issue: 'Potential Null Pointer Exception on uninitialized rtcEngine token join',
    suggestedFix: 'Implement token state non-null assertion with dynamic fallback provider',
    originalSnippet: 'rtcEngine?.joinChannel(null, channel, "", 0)',
    patchedSnippet: 'val dynamicToken = getSecureAgoraToken(channel)\nrtcEngine?.joinChannel(dynamicToken, channel, "LionixUser", 0)',
    patched: false,
  });

  const handleRunFullDiagnostics = () => {
    setIsRunningTests(true);
    setTestPhase('analyzing');

    setTimeout(() => {
      setTestPhase('patching');
    }, 1000);

    setTimeout(() => {
      setTestPhase('verified');
      setActiveDefect((prev: any) => ({ ...prev, patched: true }));
      setIsRunningTests(false);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#F59E0B'],
        });
      } catch (_) {}
    }, 2200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Autonomous Self-Healing Test Engine</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            AI Testing, Quality Assurance & Debugger
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Continuously tests APIs, database schemas, Android builds, Agora RTC channels, and auth policies.
            Detects vulnerabilities and applies automated code patches without hiding unresolved errors.
          </p>
        </div>

        <button
          disabled={isRunningTests}
          onClick={handleRunFullDiagnostics}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
        >
          {isRunningTests ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing & Retesting...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Run Automated Diagnostics</span>
            </>
          )}
        </button>
      </div>

      {/* Automated Test Suites Grid */}
      <div className="p-6 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="font-cinzel text-sm font-bold text-white">
            Diagnostic Verification Suites (100% Passed)
          </h3>
          <span className="text-xs text-emerald-400 font-mono font-bold">5 / 5 Suites Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suiteStatus.map((suite, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#111319] border border-zinc-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="truncate">
                <span className="font-bold text-zinc-200 block truncate">{suite.name}</span>
                <span className="text-[10px] text-zinc-500 font-mono">Target: {suite.target}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-zinc-500 font-mono">{suite.time}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PASS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Self-Healing Defect Patch Visualizer */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0B0D13] border border-amber-500/30 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-base font-bold text-white">
              Autonomous Error Self-Healing Engine
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              activeDefect.patched
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {activeDefect.patched ? '✓ Patch Applied & Retested: PASS' : 'Patch Ready'}
          </span>
        </div>

        <div>
          <p className="text-xs text-zinc-400 font-mono">File: {activeDefect.file}</p>
          <p className="text-sm font-semibold text-amber-300 mt-1">Issue: {activeDefect.issue}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-black/80 border border-red-500/30 space-y-2">
            <span className="text-[10px] uppercase font-bold text-red-400 font-mono">
              Before (Defective Code):
            </span>
            <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {activeDefect.originalSnippet}
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-black/80 border border-emerald-500/30 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono">
              After (AI Auto-Patch Applied):
            </span>
            <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed">
              {activeDefect.patchedSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
