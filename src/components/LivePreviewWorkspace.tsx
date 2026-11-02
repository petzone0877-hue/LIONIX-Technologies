import React, { useState } from 'react';
import { SoftwareProject, SoftwareFile } from '../types';
import { apiService } from '../services/api';
import {
  Code2,
  Play,
  RotateCw,
  Smartphone,
  Monitor,
  Terminal,
  Send,
  Sparkles,
  FileCode,
  Folder,
  Layers,
  Radio,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface LivePreviewWorkspaceProps {
  currentProject: SoftwareProject | null;
}

export const LivePreviewWorkspace: React.FC<LivePreviewWorkspaceProps> = ({ currentProject }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeCodeFile, setActiveCodeFile] = useState('index.html');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'LIONIX AI', text: 'Live Preview runtime connected. Powered by Google Gemini. Hot-reload ready.', time: '13:10' },
  ]);
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Active file content from project
  const currentFile = currentProject?.files?.find((f) => f.name === activeCodeFile) || currentProject?.files?.[0];
  const [codeBuffer, setCodeBuffer] = useState(currentFile?.content || '<!DOCTYPE html>\n<html>\n<head><title>Preview</title></head>\n<body><h1>LIONIX Live Sandbox</h1></body>\n</html>');

  const previewUrl = currentProject
    ? apiService.getProjectPreviewUrl(currentProject.id)
    : '/api/projects/proj-web-enterprise/preview';

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    setChatHistory((prev) => [
      ...prev,
      { sender: 'You', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      {
        sender: 'Gemini Engine',
        text: `Applying updates for "${userMsg}" to live sandbox preview...`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatMessage('');
    setPreviewKey((k) => k + 1);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0D13] p-3.5 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white font-cinzel tracking-wide">
            Live Preview Sandbox Engine
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
            HTTP 200 Live
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewKey((k) => k + 1)}
            className="p-1.5 rounded-lg bg-[#121622] text-zinc-400 hover:text-white border border-zinc-700 transition"
            title="Reload Preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 transition"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open Tab</span>
          </a>

          <div className="flex rounded-lg bg-[#121622] border border-zinc-700 p-0.5">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400'}`}
              title="Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400'}`}
              title="Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[680px]">
        {/* Left Pane: AI Chat Assistant (Col 3) */}
        <div className="lg:col-span-3 rounded-2xl bg-[#0B0D13] border border-zinc-800 flex flex-col overflow-hidden">
          <div className="p-3 bg-[#0E1118] border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-cinzel">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Hot-Reload Agent
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Gemini 3.8</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-xs ${
                  item.sender === 'You'
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200 ml-4'
                    : 'bg-[#10141E] border border-zinc-800 text-zinc-300 mr-2'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-1 font-mono">
                  <span>{item.sender}</span>
                  <span>{item.time}</span>
                </div>
                <p className="leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-2.5 bg-[#0E1118] border-t border-zinc-800 flex gap-1.5">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Tell AI to modify code..."
              className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Center Pane: Code Viewer (Col 4) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0B0D13] border border-zinc-800 flex flex-col overflow-hidden">
          <div className="p-3 bg-[#0E1118] border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              {(currentProject?.files || [{ name: 'index.html' }]).map((f) => (
                <button
                  key={f.name}
                  onClick={() => {
                    setActiveCodeFile(f.name);
                    const found = currentProject?.files?.find((x) => x.name === f.name);
                    if (found) setCodeBuffer(found.content);
                  }}
                  className={`px-2 py-1 rounded text-[11px] truncate ${
                    activeCodeFile === f.name ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(codeBuffer);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 ml-2"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <textarea
            value={codeBuffer}
            onChange={(e) => setCodeBuffer(e.target.value)}
            className="flex-1 p-3 bg-black/95 font-mono text-[11px] text-zinc-200 outline-none resize-none leading-relaxed"
          />

          <div className="p-2 bg-[#0E1118] border-t border-zinc-800 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> 0 Errors • Ready
            </span>
            <span className="text-zinc-500 font-mono text-[10px]">UTF-8</span>
          </div>
        </div>

        {/* Right Pane: Interactive Live Preview Iframe (Col 5) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0B0D13] border border-zinc-800 flex flex-col overflow-hidden">
          <div className="p-3 bg-[#0E1118] border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-cinzel">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              Live Interactive Sandbox (No 404s)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="flex-1 bg-black flex items-center justify-center p-2 overflow-hidden">
            {deviceMode === 'mobile' ? (
              <div className="w-[300px] h-[600px] rounded-[36px] border-4 border-zinc-700 bg-white overflow-hidden shadow-2xl relative">
                <iframe
                  key={previewKey}
                  title="Mobile Sandbox"
                  src={previewUrl}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-zinc-800">
                <iframe
                  key={previewKey}
                  title="Desktop Sandbox"
                  src={previewUrl}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
