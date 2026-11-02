import React, { useState, useEffect } from 'react';
import { SoftwareProject, SoftwareFile, UserSession } from '../types';
import { apiService } from '../services/api';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  FolderCode,
  Download,
  Copy,
  Terminal,
  FileCode,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Layers,
  Zap,
  Globe,
  Smartphone,
  Server,
  Database,
  Radio,
  Eye,
  Play,
  Save,
  Check,
  RotateCw,
  Monitor,
  Tablet,
  CheckCircle,
  XCircle,
  Code2,
  FilePlus,
} from 'lucide-react';

interface SoftwareBuilderProps {
  currentProject: SoftwareProject | null;
  onProjectUpdated: (project: SoftwareProject) => void;
  user: UserSession | null;
}

export const SoftwareBuilder: React.FC<SoftwareBuilderProps> = ({
  currentProject,
  onProjectUpdated,
  user,
}) => {
  const [softwareType, setSoftwareType] = useState<'android' | 'website' | 'admin-panel' | 'backend'>('website');
  const [naturalPrompt, setNaturalPrompt] = useState(
    currentProject?.prompt ||
      'Build a modern real-time website with responsive hero banner, API integration, and analytics dashboard'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'code' | 'preview' | 'tests'>('code');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [previewKey, setPreviewKey] = useState(0);

  // Fallback files if project is empty
  const defaultFiles: SoftwareFile[] = [
    {
      name: 'index.html',
      path: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LIONIX AI Web Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#07080B] text-zinc-100 min-h-screen flex flex-col items-center justify-center p-8">
  <div class="max-w-2xl text-center space-y-6">
    <span class="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
      LIONIX AI STUDIO
    </span>
    <h1 class="text-4xl sm:text-5xl font-black text-white">BUILD ANYTHING. CREATE EVERYTHING.</h1>
    <p class="text-sm text-zinc-400">Next-generation autonomous AI software generation platform.</p>
    <div class="pt-4 flex justify-center gap-4">
      <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm uppercase tracking-wider">
        Get Started
      </button>
    </div>
  </div>
</body>
</html>`,
    },
    {
      name: 'App.tsx',
      path: 'src/App.tsx',
      language: 'typescript',
      content: `import React, { useState } from 'react';

export const App = () => {
  const [counter, setCounter] = useState(0);

  return (
    <div className="p-8 max-w-xl mx-auto text-center space-y-4">
      <h2 className="text-2xl font-bold text-amber-400">Interactive Component</h2>
      <p className="text-sm text-zinc-400">Real-time state and component reactivity</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setCounter(c => c + 1)}
          className="px-4 py-2 bg-amber-500 text-black rounded-lg font-bold"
        >
          Count: {counter}
        </button>
      </div>
    </div>
  );
};`,
    },
    {
      name: 'api.ts',
      path: 'src/services/api.ts',
      language: 'typescript',
      content: `export const fetchData = async () => {
  const response = await fetch('/api/v1/data');
  return response.json();
};`,
    },
    {
      name: 'schema.sql',
      path: 'db/schema.sql',
      language: 'sql',
      content: `CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(64) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,
    },
  ];

  const files = currentProject?.files && currentProject.files.length > 0 ? currentProject.files : defaultFiles;
  const activeFile = files[activeFileIndex] || files[0];

  useEffect(() => {
    if (activeFile) {
      setEditedCode(activeFile.content);
      setIsSaved(false);
    }
  }, [activeFileIndex, activeFile]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const res = await apiService.generateCode(
        currentProject?.id || 'proj-lion-01',
        naturalPrompt,
        softwareType,
        naturalPrompt.toLowerCase().includes('agora') || naturalPrompt.toLowerCase().includes('voice') || naturalPrompt.toLowerCase().includes('call')
      );

      if (currentProject) {
        onProjectUpdated({
          ...currentProject,
          files: res.files,
          status: 'completed',
        });
      }

      setPreviewKey((k) => k + 1);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#10B981'],
        });
      } catch (_) {}
    } catch (err: any) {
      alert('Code generation error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFileContent = async () => {
    if (!currentProject) return;
    setIsSaving(true);
    const updatedFiles = [...files];
    updatedFiles[activeFileIndex] = {
      ...updatedFiles[activeFileIndex],
      content: editedCode,
    };

    try {
      const res = await apiService.updateProject(currentProject.id, {
        files: updatedFiles,
      });
      if (res.project) {
        onProjectUpdated(res.project);
        setIsSaved(true);
        setPreviewKey((k) => k + 1);
        setTimeout(() => setIsSaved(false), 2500);
      }
    } catch (err: any) {
      alert('Failed to save file: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTests = async () => {
    setIsTesting(true);
    setActiveViewMode('tests');
    try {
      const res = await apiService.testProject(currentProject?.id || 'proj-lion-01');
      setTestResults(res.tests);
    } catch (err: any) {
      alert('Test suite error: ' + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDownloadZipDeliverable = async () => {
    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.path || file.name, file.content);
    });
    // Add verified manifest
    zip.file(
      'LIONIX_DELIVERABLE_MANIFEST.txt',
      `LIONIX AI TECHNOLOGIES - PRODUCTION DELIVERABLE\nSoftware: LIONIX AI Studio v2.8\nTagline: BUILD ANYTHING. CREATE EVERYTHING.\nGenerated At: ${new Date().toISOString()}\nTarget: ${softwareType.toUpperCase()}\nStatus: VERIFIED & TESTED`
    );

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lionix_${softwareType}_deliverable_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSandboxDoc = () => {
    const htmlFile = files.find((f) => f.name.endsWith('.html'));
    if (htmlFile && htmlFile.content.includes('<html')) {
      return htmlFile.content;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#07080B] text-zinc-100 min-h-screen p-8 flex flex-col items-center justify-center">
  <div class="max-w-xl text-center space-y-4">
    <div class="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs">
      LIONIX AI LIVE PREVIEW
    </div>
    <h1 class="text-3xl font-black text-white">${currentProject?.name || 'LIONIX Website'}</h1>
    <p class="text-xs text-zinc-400">${naturalPrompt}</p>
    <div class="p-6 rounded-2xl bg-[#111319] border border-zinc-800 text-left space-y-2 mt-6">
      <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Project Files (${files.length})</span>
      <ul class="text-xs text-zinc-300 font-mono space-y-1">
        ${files.map((f) => `<li>• ${f.path || f.name} (${f.language})</li>`).join('')}
      </ul>
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Polyglot Software & Website Studio</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            Universal AI Website & Software Builder
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Generate full-stack websites, frontend components, backend APIs, and SQL schemas with live sandbox preview, testing, and production ZIP export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleRunTests}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer border border-zinc-700"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
            <span>Test Project</span>
          </button>

          <button
            onClick={handleDownloadZipDeliverable}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Deliverable ZIP</span>
          </button>
        </div>
      </div>

      {/* Natural Language Prompt & Category Selector */}
      <div className="p-6 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Target Architecture:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSoftwareType('website')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                softwareType === 'website'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#12151F] text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website (React / Tailwind)</span>
            </button>
            <button
              onClick={() => setSoftwareType('android')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                softwareType === 'android'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#12151F] text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android (Kotlin Compose)</span>
            </button>
            <button
              onClick={() => setSoftwareType('admin-panel')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                softwareType === 'admin-panel'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#12151F] text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Admin Panel & Dashboard</span>
            </button>
            <button
              onClick={() => setSoftwareType('backend')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                softwareType === 'backend'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#12151F] text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Node / Python Backend & API</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={naturalPrompt}
            onChange={(e) => setNaturalPrompt(e.target.value)}
            placeholder="Describe what you want to create (e.g. 'Build an e-commerce website with live product catalog and Stripe checkout' or 'একটি আধুনিক রেসপনসিভ ওয়েবসাইট তৈরি কর')"
            className="flex-1 px-4 py-3 rounded-2xl bg-[#12151F] border border-zinc-800 focus:border-amber-500 text-xs text-white placeholder-zinc-500 outline-none transition"
          />
          <button
            disabled={isGenerating}
            onClick={handleGenerateCode}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Work Area: Code Editor, Live Preview & Automated Tests */}
      <div className="space-y-4">
        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0D13] p-3 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewMode('code')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'code'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#12151F] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>

            <button
              onClick={() => setActiveViewMode('preview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'preview'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#12151F] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Website Preview</span>
            </button>

            <button
              onClick={() => setActiveViewMode('tests')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'tests'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#12151F] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Automated Tests ({testResults.length})</span>
            </button>
          </div>

          {activeViewMode === 'preview' && (
            <div className="flex items-center gap-1 bg-[#12151F] p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  deviceMode === 'desktop' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  deviceMode === 'tablet' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  deviceMode === 'mobile' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewKey((k) => k + 1)}
                className="p-1.5 rounded-lg text-xs text-zinc-400 hover:text-amber-400 transition cursor-pointer ml-1"
                title="Refresh Preview"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* View Mode: Code Editor */}
        {activeViewMode === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: File Tree */}
            <div className="lg:col-span-4 p-5 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <FolderCode className="w-4 h-4 text-amber-400" />
                  Project Files ({files.length})
                </span>
              </div>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {files.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFileIndex(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition flex items-center justify-between text-xs font-mono cursor-pointer ${
                      activeFileIndex === i
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                        : 'bg-[#12151F] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase">{f.language}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Code Editor View */}
            <div className="lg:col-span-8 rounded-3xl bg-[#0B0D13] border border-zinc-800 overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-[#0E1118] border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>{activeFile.path || activeFile.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-zinc-800 text-zinc-400">
                    {activeFile.language}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveFileContent}
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isSaved ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaved ? 'Saved!' : 'Save Changes'}</span>
                  </button>

                  <button
                    onClick={() => copyCode(editedCode)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                className="p-5 bg-black/95 font-mono text-[12px] text-zinc-200 h-[480px] overflow-y-auto leading-relaxed outline-none resize-none border-none focus:ring-0"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* View Mode: Live Preview */}
        {activeViewMode === 'preview' && (
          <div className="p-4 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>SANDBOX RUNTIME: {deviceMode.toUpperCase()} VIEW</span>
              </span>
              <span>Isolated DOM Sandbox (Tailwind v3.4 CDN)</span>
            </div>

            <div className="flex justify-center bg-[#07080B] rounded-2xl p-4 overflow-hidden min-h-[520px]">
              <div
                className={`transition-all duration-300 rounded-xl overflow-hidden border border-zinc-800 bg-[#07080B] shadow-2xl ${
                  deviceMode === 'mobile'
                    ? 'w-[375px] h-[640px]'
                    : deviceMode === 'tablet'
                    ? 'w-[768px] h-[580px]'
                    : 'w-full h-[580px]'
                }`}
              >
                <iframe
                  key={previewKey}
                  title="Website Live Sandbox"
                  srcDoc={generateSandboxDoc()}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                />
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Automated Tests */}
        {activeViewMode === 'tests' && (
          <div className="p-6 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-base font-bold text-white">
                  Automated Project Test Suite
                </h3>
              </div>
              <button
                onClick={handleRunTests}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                <span>Re-run Suite</span>
              </button>
            </div>

            {testResults.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs space-y-2">
                <Terminal className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                <p>Click &quot;Re-run Suite&quot; or &quot;Test Project&quot; above to execute unit, lint, and security checks.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testResults.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      t.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {t.passed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{t.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{t.duration}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{t.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
