import React, { useState, useEffect } from 'react';
import { SoftwareProject, UserSession } from '../types';
import { apiService } from '../services/api';
import {
  FolderCode,
  Smartphone,
  Globe,
  Plus,
  Play,
  Download,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  Layers,
  Activity,
  FileCode,
} from 'lucide-react';

interface ProjectDashboardProps {
  user: UserSession | null;
  onSelectProject: (project: SoftwareProject) => void;
  onNavigateTab: (tab: string) => void;
  activeLanguage: 'en' | 'bn';
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  user,
  onSelectProject,
  onNavigateTab,
  activeLanguage,
}) => {
  const [projects, setProjects] = useState<SoftwareProject[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'android' | 'website' | 'live'>('all');
  const [loading, setLoading] = useState(true);

  // New Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'android' | 'website'>('website');
  const [projectPrompt, setProjectPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const list = await apiService.getProjects();
      if (list) setProjects(list);
    } catch (err) {
      console.warn('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await apiService.createProject({
        name: projectName.trim(),
        type: projectType,
        prompt: projectPrompt.trim() || `Create new ${projectType} project`,
        language: activeLanguage,
      });

      if (res.project) {
        setProjects((prev) => [res.project, ...prev]);
        setShowCreateModal(false);
        setProjectName('');
        setProjectPrompt('');
        onSelectProject(res.project);
        onNavigateTab('ai-studio');
      }
    } catch (err: any) {
      alert('Error creating project: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await apiService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    if (filterType === 'android') return p.type === 'android';
    if (filterType === 'website') return p.type === 'website';
    if (filterType === 'live') return p.deployStatus === 'live';
    return true;
  });

  const androidCount = projects.filter((p) => p.type === 'android').length;
  const webCount = projects.filter((p) => p.type === 'website').length;
  const liveCount = projects.filter((p) => p.deployStatus === 'live').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#121622] via-[#0E1118] to-[#08090C] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Software Factory</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            LIONIX Project Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Central repository for all autonomous Android applications, web platforms, and production deployments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-xl shadow-amber-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0B0E14] border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Projects</span>
            <FolderCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-cinzel text-2xl font-black text-white mt-2">{projects.length}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Autonomous Deliverables</p>
        </div>

        <div className="bg-[#0B0E14] border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Android Apps</span>
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-cinzel text-2xl font-black text-white mt-2">{androidCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Kotlin Compose & APK/AAB</p>
        </div>

        <div className="bg-[#0B0E14] border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Web Platforms</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-cinzel text-2xl font-black text-white mt-2">{webCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Full-stack React & APIs</p>
        </div>

        <div className="bg-[#0B0E14] border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Live Deployed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-cinzel text-2xl font-black text-white mt-2">{liveCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Active Custom Domains</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'android', label: `Android Apps (${androidCount})` },
            { id: 'website', label: `Websites (${webCount})` },
            { id: 'live', label: `Live Deployed (${liveCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterType === tab.id
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white bg-[#0B0E14]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const isAndroid = project.type === 'android';

          return (
            <div
              key={project.id}
              className="bg-[#0B0E14] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#121620] border border-amber-500/30 p-1.5 flex items-center justify-center text-amber-400">
                      {isAndroid ? <Smartphone className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-cinzel text-sm font-bold text-white group-hover:text-amber-400 transition truncate max-w-[180px]">
                        {project.name}
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {project.type.toUpperCase()} • {project.files?.length || 0} Files
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      project.deployStatus === 'live'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    ● {project.deployStatus === 'live' ? 'Live' : project.status}
                  </span>
                </div>

                {/* Prompt Excerpt */}
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {project.prompt || 'Autonomous software created in LIONIX AI Studio.'}
                </p>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap gap-1">
                  {(project.techStack || []).slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-[#121620] border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                  {(project.techStack || []).length > 3 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#121620] text-[9px] text-zinc-500 font-mono">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectProject(project);
                    onNavigateTab('ai-studio');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:brightness-110 font-bold text-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                >
                  <Play className="w-3 h-3 fill-black" />
                  <span>Open Studio</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={apiService.getProjectExportZipUrl(project.id)}
                    download
                    className="p-1.5 rounded-lg bg-[#121620] hover:bg-[#1A202E] text-zinc-400 hover:text-white transition"
                    title="Export Source ZIP"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {project.webLiveUrl && (
                    <a
                      href={project.webLiveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-[#121620] hover:bg-[#1A202E] text-amber-400 transition"
                      title="Open Live Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="p-1.5 rounded-lg bg-[#121620] hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0B0E14] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create Software Project</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Project Name:</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. LIONIX FinTech Portal"
                  className="w-full px-3 py-2 rounded-xl bg-[#121620] border border-zinc-800 text-xs text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Project Category:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectType('website')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      projectType === 'website'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#121620] border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    <span>Website Platform</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectType('android')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      projectType === 'android'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#121620] border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Android Application</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Initial Prompt / Brief:</label>
                <textarea
                  rows={3}
                  value={projectPrompt}
                  onChange={(e) => setProjectPrompt(e.target.value)}
                  placeholder="Describe requirements in English or বাংলা..."
                  className="w-full p-2.5 rounded-xl bg-[#121620] border border-zinc-800 text-xs text-white focus:border-amber-400 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-black text-xs uppercase tracking-wider"
                >
                  {isSubmitting ? 'Creating...' : 'Create & Open Studio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
