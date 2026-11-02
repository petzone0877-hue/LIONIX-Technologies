import React, { useState } from 'react';
import { AIDepartment, UserSession } from '../types';
import {
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  ArrowUpRight,
  Shield,
  Search,
  Filter,
} from 'lucide-react';

interface AIAgentCenterProps {
  departments: AIDepartment[];
  user: UserSession | null;
}

export const AIAgentCenter: React.FC<AIAgentCenterProps> = ({ departments, user }) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'dept-ceo');
  const [searchQuery, setSearchQuery] = useState('');
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [deptList, setDeptList] = useState<AIDepartment[]>(departments);
  const [assignSuccess, setAssignSuccess] = useState('');

  const selectedDept = deptList.find((d) => d.id === selectedDeptId) || deptList[0];

  const filteredDepts = deptList.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.nameBn.includes(searchQuery) ||
      d.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskInput.trim()) return;

    const taskText = customTaskInput.trim();
    setDeptList((prev) =>
      prev.map((d) => {
        if (d.id === selectedDeptId) {
          return {
            ...d,
            currentTask: taskText,
            completedTasks: d.completedTasks + 1,
            activityHistory: [
              {
                timestamp: 'Just now',
                action: `Owner / Management task dispatched: ${taskText}`,
                status: 'success',
              },
              ...d.activityHistory,
            ],
          };
        }
        return d;
      })
    );
    setCustomTaskInput('');
    setAssignSuccess(`Dispatched task to ${selectedDept.name} successfully.`);
    setTimeout(() => setAssignSuccess(''), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence Hub</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            16 Specialized AI Departments
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Every department possesses autonomous agentic responsibilities, domain-specific NLP models,
            isolated task queues, and persistent audit histories.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3 bg-[#0A0C11] p-3 rounded-2xl border border-zinc-800 shrink-0">
          <div className="text-center px-4 border-r border-zinc-800">
            <p className="text-xl font-bold font-cinzel text-amber-400">16 / 16</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Active Depts</p>
          </div>
          <div className="text-center px-4">
            <p className="text-xl font-bold font-cinzel text-emerald-400">42,890+</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Tasks Completed</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Department List & Right Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 16 Departments Selector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments or capabilities..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0D13] border border-zinc-800 focus:border-amber-500 text-xs text-white placeholder-zinc-500 outline-none transition"
            />
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredDepts.map((dept) => {
              const isSelected = dept.id === selectedDeptId;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/15 via-[#131722] to-[#0E1017] border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-[#0B0D13] border-zinc-800/80 hover:bg-[#11141C] hover:border-zinc-700'
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-[#08090C] border border-zinc-800 shrink-0">
                    {dept.avatar}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-amber-300' : 'text-zinc-200'
                        }`}
                      >
                        {dept.name}
                      </h4>
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 shrink-0 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Active
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{dept.nameBn}</p>
                    <p className="text-[10px] text-zinc-500 line-clamp-1 mt-1">{dept.role}</p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/60 text-[10px] text-zinc-400">
                      <span className="text-amber-500/80 font-mono font-medium">{dept.lead}</span>
                      <span className="font-mono">{dept.completedTasks.toLocaleString()} tasks</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Department Detailed Workbench */}
        {selectedDept && (
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 md:p-8 rounded-3xl bg-[#0B0D13] border border-amber-500/30 space-y-6 shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#12151F] border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
                    {selectedDept.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-cinzel text-xl md:text-2xl font-bold text-white">
                        {selectedDept.name}
                      </h2>
                    </div>
                    <p className="text-xs text-amber-400 font-medium mt-0.5">{selectedDept.nameBn}</p>
                    <p className="text-xs text-zinc-400 mt-1">{selectedDept.role}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                    Lead: {selectedDept.lead}
                  </span>
                </div>
              </div>

              {/* Current Active Task Card */}
              <div className="p-4 rounded-2xl bg-[#111319] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    Current Autonomous Task
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">Real-time processing</span>
                </div>
                <p className="text-sm text-zinc-200 font-medium leading-relaxed">
                  {selectedDept.currentTask || 'Monitoring studio telemetry and optimizing throughput'}
                </p>
              </div>

              {/* Capabilities Chips */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                  Core AI Capabilities & Algorithms:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDept.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-[#141824] border border-amber-500/20 text-amber-300 text-xs font-semibold"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dispatch Custom Task Form */}
              <form onSubmit={handleAssignTask} className="space-y-3 pt-3 border-t border-zinc-800">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Assign Task to {selectedDept.name}:
                </label>
                {assignSuccess && (
                  <p className="text-xs text-emerald-400 font-medium">{assignSuccess}</p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTaskInput}
                    onChange={(e) => setCustomTaskInput(e.target.value)}
                    placeholder={`e.g. "Execute security audit on Agora RTC token endpoint" or "বাংলায় নির্দেশ লিখুন"`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#12151F] border border-zinc-800 focus:border-amber-500 text-xs text-white placeholder-zinc-500 outline-none transition"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch</span>
                  </button>
                </div>
              </form>

              {/* Activity History & Audit */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Department Activity History:
                </h4>
                <div className="space-y-2">
                  {selectedDept.activityHistory.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#090B0F] border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-300 leading-relaxed">{act.action}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">{act.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
