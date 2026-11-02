import React, { useState } from 'react';
import { SoftwareProject, SoftwareFile } from '../types';
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
} from 'lucide-react';

interface LivePreviewWorkspaceProps {
  currentProject: SoftwareProject | null;
}

export const LivePreviewWorkspace: React.FC<LivePreviewWorkspaceProps> = ({ currentProject }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeCodeFile, setActiveCodeFile] = useState('App.tsx');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'AI CEO', text: 'LIONIX Studio Live Preview initialized. Edit code or give new instructions to hot-reload.', time: '13:10' },
  ]);
  const [copied, setCopied] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Editable code buffer
  const [codeBuffer, setCodeBuffer] = useState(`import React, { useState } from 'react';
import { Radio, Users, Sparkles, Volume2 } from 'lucide-react';

export default function App() {
  const [inRoom, setInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080B] text-white p-6 font-sans">
      <header className="border-b border-amber-500/20 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-cinzel text-amber-400">
            LIONIX AUDIOVERSE RTC
          </h1>
          <p className="text-xs text-zinc-400">Agora Voice Stream • Powered by LIONIX AI</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
          ● Live Stream Ready
        </span>
      </header>

      <div className="max-w-md mx-auto text-center py-8 space-y-6">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-black border-2 border-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20">
          <Radio className="w-12 h-12 text-amber-400 animate-pulse" />
        </div>

        <div>
          <h2 className="text-lg font-bold">Executive Voice Auditorium</h2>
          <p className="text-xs text-zinc-400 mt-1">Channel: lionix-central-room</p>
        </div>

        <button
          onClick={() => setInRoom(!inRoom)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-black uppercase text-xs tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-110"
        >
          {inRoom ? 'Leave Voice Room' : 'Join Live Voice Channel'}
        </button>
      </div>
    </div>
  );
}`);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    setChatHistory((prev) => [
      ...prev,
      { sender: 'You', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      {
        sender: 'AI Software',
        text: `Applying updates for: "${userMsg}". Hot-reloading live preview...`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatMessage('');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0D13] p-3.5 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-amber-400" />
          <span className="font-cinzel text-xs font-bold text-zinc-200">
            3-Pane AI Development Workspace
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">Hot-Reload Active</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#12151F] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                deviceMode === 'desktop' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px]">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                deviceMode === 'mobile' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
              title="Android Mobile Emulator"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px]">Mobile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Pane Grid: Left (AI Chat), Center (Code Editor), Right (Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[680px]">
        {/* Left Pane: AI Chat & Prompting (Col 3) */}
        <div className="lg:col-span-3 rounded-2xl bg-[#0B0D13] border border-zinc-800 flex flex-col overflow-hidden">
          <div className="p-3 bg-[#0E1118] border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 font-cinzel flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Assistant Chat
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Titan-1</span>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl ${
                  msg.sender === 'You'
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200 ml-3'
                    : 'bg-[#12151F] border border-zinc-800 text-zinc-300 mr-3'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="font-bold text-amber-400">{msg.sender}</span>
                  <span className="text-zinc-500">{msg.time}</span>
                </div>
                <p className="leading-relaxed text-[11px]">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-2 border-t border-zinc-800 bg-[#0E1118] flex gap-1.5">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask AI to modify UI or add logic..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Center Pane: Multi-File Code Editor (Col 5) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0B0D13] border border-zinc-800 flex flex-col overflow-hidden">
          <div className="p-3 bg-[#0E1118] border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-amber-300 font-mono text-xs font-bold">
                App.tsx
              </span>
              <span className="text-[10px] text-zinc-500">React 19 + Tailwind v4</span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(codeBuffer);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <textarea
            value={codeBuffer}
            onChange={(e) => setCodeBuffer(e.target.value)}
            className="flex-1 p-4 bg-black/95 font-mono text-[11px] text-zinc-200 outline-none resize-none leading-relaxed select-text"
          />

          {/* Error / Build Console Bar */}
          <div className="p-2 bg-[#0E1118] border-t border-zinc-800 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> 0 Errors • Compiled in 18ms
            </span>
            <span className="text-zinc-500 font-mono text-[10px]">UTF-8 • TypeScript</span>
          </div>
        </div>

        {/* Right Pane: Interactive Live Preview (Col 4) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0B0D13] border border-zinc-800 flex flex-col overflow-hidden">
          <div className="p-3 bg-[#0E1118] border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-cinzel">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              Live Interactive Preview
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="flex-1 bg-black flex items-center justify-center p-3 overflow-hidden">
            {deviceMode === 'mobile' ? (
              /* Mobile Emulator Frame */
              <div className="w-[280px] h-[580px] rounded-[36px] border-4 border-zinc-700 bg-[#07080B] overflow-hidden shadow-2xl relative flex flex-col">
                <div className="h-5 bg-black flex justify-center items-center">
                  <div className="w-16 h-3 bg-zinc-800 rounded-full"></div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto text-white text-xs">
                  <div className="text-center pt-4 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-400">
                      <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="font-cinzel font-bold text-amber-400">LIONIX AUDIOVERSE</h3>
                    <p className="text-[10px] text-zinc-400">Agora Voice Stream (Live)</p>
                    <button className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold uppercase text-[10px] mt-4 shadow-lg shadow-amber-500/20">
                      Join Voice Channel
                    </button>
                  </div>
                </div>

                <div className="h-4 bg-black flex justify-center items-center">
                  <div className="w-24 h-1 bg-zinc-600 rounded-full"></div>
                </div>
              </div>
            ) : (
              /* Desktop Frame */
              <div className="w-full h-full rounded-xl bg-[#07080B] border border-zinc-800 overflow-y-auto p-4 text-white text-xs">
                <div className="max-w-xs mx-auto text-center pt-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-400">
                    <Radio className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-amber-400">LIONIX AUDIOVERSE RTC</h3>
                    <p className="text-xs text-zinc-400 mt-1">Agora Audio Channels (Live Preview)</p>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold uppercase text-xs shadow-lg shadow-amber-500/20">
                    Join Voice Channel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
