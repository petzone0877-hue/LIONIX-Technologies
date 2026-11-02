import React, { useState } from 'react';
import { apiService } from '../services/api';
import { UserSession } from '../types';
import {
  Radio,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  Users,
  Shield,
  Key,
  Play,
  Square,
  Activity,
  Sparkles,
  Signal,
  CheckCircle2,
  RefreshCw,
  Copy,
} from 'lucide-react';

interface AgoraManagerProps {
  user: UserSession | null;
}

export const AgoraManager: React.FC<AgoraManagerProps> = ({ user }) => {
  const isOwner = user?.isOwner || user?.role === 'Company Owner';
  const [channelName, setChannelName] = useState('lionix-central-room');
  const [selectedRole, setSelectedRole] = useState<'publisher' | 'subscriber'>('publisher');
  const [activeMode, setActiveMode] = useState<'audio-room' | 'video-call' | 'live-broadcast'>('audio-room');
  const [generatedToken, setGeneratedToken] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);

  // In-room interactive state
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(85);
  const [latencyMs, setLatencyMs] = useState(28);
  const [copiedToken, setCopiedToken] = useState(false);

  // App credential configuration modal / accordion
  const [showConfig, setShowConfig] = useState(false);
  const [appIdInput, setAppIdInput] = useState('e24a87b3c4f94084bd8933b82199ae01');
  const [appCertInput, setAppCertInput] = useState('••••••••••••••••••••••••••••••••');
  const [configMsg, setConfigMsg] = useState('');

  const participants = [
    { name: 'Lionix Master Host (You)', role: 'Host / Broadcaster', speaking: !isMicMuted, ping: '24ms' },
    { name: 'Tariq Rahman (VP Engineering)', role: 'Speaker', speaking: true, ping: '31ms' },
    { name: 'Sarah Chen (Mobile Lead)', role: 'Speaker', speaking: false, ping: '42ms' },
    { name: 'Audience Member #819', role: 'Audience Listener', speaking: false, ping: '65ms' },
  ];

  const handleGenerateToken = async () => {
    setIsGenerating(true);
    try {
      const data = await apiService.generateAgoraToken(channelName, selectedRole);
      setGeneratedToken(data);
    } catch (err: any) {
      alert('Error generating Agora token: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinLeaveRoom = async () => {
    if (!isInRoom) {
      if (!generatedToken) {
        await handleGenerateToken();
      }
      setIsInRoom(true);
    } else {
      setIsInRoom(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    try {
      await apiService.updateAgoraConfig({
        appId: appIdInput,
        appCertificate: appCertInput,
        defaultChannel: channelName,
      });
      setConfigMsg('Agora App credentials securely updated on server. Keys encrypted.');
      setTimeout(() => setConfigMsg(''), 3000);
    } catch (err: any) {
      setConfigMsg('Failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#1A1215] via-[#100D12] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Autonomous RTC Communication Infrastructure</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            Agora Automatic RTC Integration Manager
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Real-time audio rooms, video conferencing, and interactive broadcasting.
            Tokens are generated securely on the server via HMAC-SHA256. App Certificates are never exposed to clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isOwner && (
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-4 py-2 rounded-xl bg-[#141620] hover:bg-[#1A1E2B] border border-zinc-800 text-xs text-zinc-300 font-semibold transition flex items-center gap-2"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{showConfig ? 'Hide Secret Config' : 'Configure Agora Keys'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Owner Secure Credentials Config Form */}
      {showConfig && isOwner && (
        <form
          onSubmit={handleSaveCredentials}
          className="p-6 rounded-2xl bg-[#0D0F16] border border-amber-500/40 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h3 className="font-cinzel font-bold text-sm text-amber-300">
                Server-Side Agora Credentials Vault (Owner Only)
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Encrypted with AES-256</span>
          </div>

          {configMsg && <p className="text-xs text-emerald-400">{configMsg}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1 font-semibold">Agora App ID</label>
              <input
                type="text"
                value={appIdInput}
                onChange={(e) => setAppIdInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 font-mono text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1 font-semibold">Agora App Certificate (Private Secret)</label>
              <input
                type="password"
                value={appCertInput}
                onChange={(e) => setAppCertInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 font-mono text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider transition"
            >
              Save & Encrypt Keys
            </button>
          </div>
        </form>
      )}

      {/* Mode Selector & Token Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room Channel Config */}
        <div className="p-6 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-5">
          <h3 className="font-cinzel font-bold text-base text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Channel & RTC Role</span>
          </h3>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Communication Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveMode('audio-room')}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition ${
                  activeMode === 'audio-room'
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-[#12151F] text-zinc-400 border-zinc-800'
                }`}
              >
                Audio Room
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('video-call')}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition ${
                  activeMode === 'video-call'
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-[#12151F] text-zinc-400 border-zinc-800'
                }`}
              >
                Video Call
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('live-broadcast')}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition ${
                  activeMode === 'live-broadcast'
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-[#12151F] text-zinc-400 border-zinc-800'
                }`}
              >
                Live Stream
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Channel Name</label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white font-mono outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Participant Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('publisher')}
                className={`py-2 text-xs font-bold rounded-xl border text-center transition ${
                  selectedRole === 'publisher'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-[#12151F] text-zinc-400 border-zinc-800'
                }`}
              >
                Host / Speaker
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('subscriber')}
                className={`py-2 text-xs font-bold rounded-xl border text-center transition ${
                  selectedRole === 'subscriber'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-[#12151F] text-zinc-400 border-zinc-800'
                }`}
              >
                Audience (Listen Only)
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerateToken}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-[#141824] hover:bg-[#1A2030] border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              <span>Generate Dynamic RTC Token</span>
            </button>
          </div>

          {generatedToken && (
            <div className="p-3.5 rounded-xl bg-black/80 border border-zinc-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Verified Dynamic Token</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedToken.token);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-[10px] text-zinc-400 break-all">{generatedToken.token}</p>
              <p className="text-[10px] text-zinc-500">Expires: {new Date(generatedToken.expiresAt).toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Live Interactive Stage & Audio Room Console */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-[#0B0D13] border border-amber-500/30 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isInRoom ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`}></span>
                <h3 className="font-cinzel font-bold text-base text-white">
                  {channelName}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Mode: {activeMode.toUpperCase()} • Protocol: WebRTC / Agora Native Engine
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                <Signal className="w-3.5 h-3.5 text-emerald-400" />
                {latencyMs}ms (Excellent)
              </span>
              <button
                onClick={handleJoinLeaveRoom}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
                  isInRoom
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black shadow-lg shadow-amber-500/20'
                }`}
              >
                {isInRoom ? 'Leave Channel' : 'Join Live Channel'}
              </button>
            </div>
          </div>

          {/* Center Stage: Audio Visualizer or Video Screen */}
          <div className="h-64 rounded-2xl bg-[#07080B] border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
            {activeMode === 'video-call' ? (
              <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-500">
                {isCameraOff || !isInRoom ? (
                  <div className="text-center">
                    <VideoOff className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs">Camera Feed Inactive or Paused</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-br from-zinc-900 to-[#12151F] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-400 font-bold text-2xl font-cinzel">
                        LX
                      </div>
                      <p className="text-xs font-bold text-white mt-3">Lionix HD Broadcast Stream</p>
                      <p className="text-[10px] text-emerald-400">1080p @ 60fps • VP8 / H.264</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Audio Room Visualizer */
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isInRoom && !isMicMuted
                        ? 'bg-amber-500/20 border-2 border-amber-400 scale-105 shadow-xl shadow-amber-500/30 animate-pulse'
                        : 'bg-zinc-800/60 border border-zinc-700'
                    }`}
                  >
                    <Radio className={`w-10 h-10 ${isInRoom ? 'text-amber-400' : 'text-zinc-600'}`} />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-zinc-200">
                    {isInRoom ? (isMicMuted ? 'Muted (Microphone Off)' : 'Broadcasting Live Audio') : 'Room Standby'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Opus 48kHz Stereo • Dynamic Jitter Buffer 20ms
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive In-Room Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#111319] border border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                disabled={!isInRoom}
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3 rounded-xl border transition ${
                  isMicMuted
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-white'
                } disabled:opacity-30`}
                title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                disabled={!isInRoom}
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-3 rounded-xl border transition ${
                  isCameraOff
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-white'
                } disabled:opacity-30`}
                title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs text-zinc-400">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevel}
                  onChange={(e) => setVolumeLevel(parseInt(e.target.value))}
                  className="w-24 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-[10px] w-6">{volumeLevel}%</span>
              </div>
            </div>

            {/* Participants Count */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{participants.length} Active Participants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
