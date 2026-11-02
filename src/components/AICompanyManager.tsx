import React, { useState } from 'react';
import { SoftwareProject, AIDepartment, UserSession } from '../types';
import { apiService } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Crown,
  Sparkles,
  Bot,
  ArrowRight,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Cpu,
  RefreshCw,
  FolderCode,
  Radio,
  FileCheck,
  Send,
  Zap,
} from 'lucide-react';

interface AICompanyManagerProps {
  departments: AIDepartment[];
  user: UserSession | null;
  onProjectCreated: (project: SoftwareProject) => void;
  onNavigateToBuilder: (projectId: string) => void;
}

export const AICompanyManager: React.FC<AICompanyManagerProps> = ({
  departments,
  user,
  onProjectCreated,
  onNavigateToBuilder,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProject, setCurrentProject] = useState<SoftwareProject | null>(null);
  const [activePlanTasks, setActivePlanTasks] = useState<any[]>([]);
  const [stepPhase, setStepPhase] = useState<'idle' | 'analyzing' | 'decomposing' | 'orchestrating' | 'completed'>('idle');
  const [logFeed, setLogFeed] = useState<string[]>([]);

  // Sample quick prompt presets (Bilingual)
  const presets = [
    {
      label: 'Android Voice Call & Audio Rooms (Agora RTC)',
      text: 'Create a full Android voice streaming and audio rooms app using Kotlin, Jetpack Compose, and Agora RTC with dark gold theme',
      lang: 'en',
    },
    {
      label: 'বাংলা: এন্টারপ্রাইজ ই-কমার্স ও অ্যাডমিন প্যানেল',
      text: 'একটি আধুনিক বাংলা ও ইংরেজি দ্বিভাষিক ই-কমার্স প্ল্যাটফর্ম তৈরি কর, যার সাথে সুপার অ্যাডমিন ড্যাশবোর্ড, রিয়েলটাইম ইনভেন্টরি ও পেমেন্ট গেটওয়ে থাকবে',
      lang: 'bn',
    },
    {
      label: 'Live Video Broadcasting & Chat Suite',
      text: 'Build a universal live video broadcasting platform with Agora interactive live streaming, real-time chat, and PostgreSQL backend',
      lang: 'en',
    },
    {
      label: 'বাংলা: ট্যাক্সি ও ডেলিভারি অ্যাপ (কটলিন ও ওয়েব)',
      text: 'একটি সম্পূর্ণ রাইড শেয়ারিং এবং ডেলিভারি সফটওয়্যার তৈরি কর যেখানে অ্যান্ড্রয়েড অ্যাপ, ড্রাইভার ও প্যাসেঞ্জার ভয়েস কলিং (Agora) এবং সেন্ট্রাল অ্যাডমিন প্যানেল থাকবে',
      lang: 'bn',
    },
  ];

  const handleExecuteAutonomousTask = async (customPrompt?: string) => {
    const promptText = (customPrompt || instruction).trim();
    if (!promptText) return;

    setIsProcessing(true);
    setStepPhase('analyzing');
    setLogFeed([
      `[00:00] Central AI CEO initialized analysis for instruction...`,
      `[00:01] Parsing natural language semantic graph (${/[\u0980-\u09FF]/.test(promptText) ? 'Bengali NLP Engine' : 'English NLP Engine'})...`,
    ]);

    try {
      // Simulate real step updates for visual feedback
      setTimeout(() => {
        setStepPhase('decomposing');
        setLogFeed((prev) => [
          ...prev,
          `[00:03] Requirement decomposition active across 16 AI departments...`,
          `[00:04] AI Security: Enforcing Zero-Trust credential isolation and token safety...`,
          `[00:05] AI Software & Android: Synthesizing architecture and Gradle/KTS configurations...`,
        ]);
      }, 900);

      const res = await apiService.planProject(promptText);

      setTimeout(() => {
        setStepPhase('orchestrating');
        setLogFeed((prev) => [
          ...prev,
          `[00:07] Agora Integration Engine: ${res.project.agoraEnabled ? 'Auto-Provisioned RTC Audio/Video channels' : 'Standard Web/REST Pipeline'}`,
          `[00:09] AI Database: Automated PostgreSQL schema design & migrations formulated`,
          `[00:11] AI QA: Generating automated test specifications and syntax verification gates`,
        ]);
      }, 1800);

      setTimeout(() => {
        setStepPhase('completed');
        setCurrentProject(res.project);
        setActivePlanTasks(res.departments);
        onProjectCreated(res.project);
        setIsProcessing(false);

        // Confetti celebration for successful autonomous planning
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#F59E0B', '#FBBF24', '#FFFFFF', '#D97706'],
          });
        } catch (_) {}
      }, 2800);
    } catch (err: any) {
      setIsProcessing(false);
      setStepPhase('idle');
      setLogFeed((prev) => [...prev, `[ERROR] Autonomous planner error: ${err.message}`]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Crown className="w-3.5 h-3.5" />
              <span>Central Autonomous AI Company Manager</span>
            </div>
            <h1 className="font-cinzel text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500">
              Autonomous Software Orchestration
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Describe any application in <span className="text-amber-400 font-semibold">English</span> or{' '}
              <span className="text-amber-400 font-semibold">বাংলা (Bengali)</span>.
              The AI CEO automatically coordinates all 16 departments, formulates the project plan, configures Gradle,
              provisions Agora RTC, sets up database schemas, and prepares downloadable deliverables.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#090B0F]/90 p-3 rounded-2xl border border-zinc-800 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xl font-cinzel">
              AI
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-200">Titan-1 AI CEO Lead</p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Ready for Natural Language Command
              </p>
            </div>
          </div>
        </div>

        {/* Natural Language Instruction Input Box */}
        <div className="mt-8 space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Describe your desired software in English or বাংলা... e.g. 'Build an Android voice chat room with Agora RTC and an admin panel to monitor active audio channels.'"
              className="w-full p-4 pr-32 rounded-2xl bg-[#090B0F] border border-amber-500/30 focus:border-amber-400 text-sm text-zinc-100 placeholder-zinc-500 outline-none shadow-inner resize-none transition-all"
            />
            <div className="absolute right-3 bottom-4 flex items-center gap-2">
              <button
                type="button"
                disabled={isProcessing || !instruction.trim()}
                onClick={() => handleExecuteAutonomousTask()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition disabled:opacity-40 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Orchestrate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              Quick Autonomous Instruction Presets (Bilingual):
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInstruction(p.text);
                    handleExecuteAutonomousTask(p.text);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0F1219] hover:bg-amber-500/10 border border-zinc-800 hover:border-amber-500/40 text-[11px] text-zinc-300 hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <Globe className="w-3 h-3 text-amber-400" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Live Terminal Feed During Orchestration */}
      {isProcessing && (
        <div className="p-6 rounded-2xl bg-[#0B0D13] border border-amber-500/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <h3 className="font-cinzel font-bold text-sm text-amber-300">
                Autonomous AI Company Manager in Action
              </h3>
            </div>
            <span className="text-xs font-mono uppercase text-amber-400 tracking-wider">
              Phase: {stepPhase}
            </span>
          </div>

          {/* Stepper Visualizer */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border text-center ${stepPhase !== 'idle' ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
              1. NLP Semantic Analysis
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${['decomposing', 'orchestrating', 'completed'].includes(stepPhase) ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
              2. 16-Dept Task Partitioning
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${['orchestrating', 'completed'].includes(stepPhase) ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
              3. Tech Stack & Agora Provision
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${stepPhase === 'completed' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
              4. Code Generation Ready
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="p-4 rounded-xl bg-black/90 font-mono text-[11px] text-zinc-300 space-y-1 max-h-40 overflow-y-auto border border-zinc-800">
            {logFeed.map((log, index) => (
              <p key={index} className="leading-relaxed">
                <span className="text-amber-500">❯</span> {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Generated Project Plan Output */}
      {currentProject && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#0B0D13] border border-amber-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider">
                  Plan Approved by AI CEO
                </span>
                <span className="text-zinc-500 text-xs font-mono">{currentProject.id}</span>
              </div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white mt-1">
                {currentProject.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Input Instruction: &quot;{currentProject.prompt}&quot;
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateToBuilder(currentProject.id)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                <FolderCode className="w-4 h-4" />
                <span>Open in Universal Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tech Stack & Auto Configuration Badges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              Autonomous Technology Selection:
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentProject.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-[#141824] border border-amber-500/30 text-amber-300 text-xs font-semibold font-mono"
                >
                  {tech}
                </span>
              ))}
              {currentProject.agoraEnabled && (
                <span className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" />
                  Agora RTC Engine Integrated
                </span>
              )}
            </div>
          </div>

          {/* 16-Department Task Assignment Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                16 AI Departments Task Queue:
              </h4>
              <span className="text-[11px] text-zinc-500">All 16 Departments Autonomous</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {activePlanTasks.map((t, index) => {
                const deptMeta = departments.find((d) => d.id === t.departmentId);
                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-[#111319] border border-zinc-800 hover:border-amber-500/30 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base">{deptMeta?.avatar || '🤖'}</span>
                        <span className="text-xs font-bold text-zinc-200 truncate">
                          {deptMeta?.name || t.departmentName}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {t.task}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-amber-400 font-mono font-semibold">
                        {deptMeta?.lead?.split(' ')[0] || 'AI Agent'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Assigned
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
