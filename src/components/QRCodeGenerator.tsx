import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { UserSession, CompanyInfo, SavedQRCode } from '../types';
import { apiService } from '../services/api';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Save,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Link2,
  FileText,
  User,
  Shield,
  Palette,
  Maximize2,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface QRCodeGeneratorProps {
  user: UserSession | null;
  company: CompanyInfo;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ user, company }) => {
  const isOwner = user?.isOwner || user?.role === 'Company Owner';

  // Input states
  const [contentType, setContentType] = useState<'website' | 'text' | 'company' | 'staff' | 'other'>('website');
  const [titleInput, setTitleInput] = useState('Official Company Website');
  const [contentInput, setContentInput] = useState('https://lionixai.com');
  const [qrSize, setQrSize] = useState<number>(256);
  const [fgColor, setFgColor] = useState<string>('#F59E0B');
  const [bgColor, setBgColor] = useState<string>('#07080B');

  // Preview & Export states
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string>('');
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // Saved QR Codes repository
  const [savedQrs, setSavedQrs] = useState<SavedQRCode[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Quick Preset Templates
  const handleSelectTemplate = (type: 'website' | 'text' | 'company' | 'staff' | 'other') => {
    setContentType(type);
    if (type === 'website') {
      setTitleInput('Official Company Website');
      setContentInput('https://lionixai.com');
    } else if (type === 'company') {
      setTitleInput('LIONIX AI Technologies Verification');
      setContentInput(`${window.location.origin}/public-profile`);
    } else if (type === 'text') {
      setTitleInput('LIONIX Sovereign Motto');
      setContentInput('LIONIX AI TECHNOLOGIES - BUILD ANYTHING. CREATE EVERYTHING.');
    } else if (type === 'staff') {
      setTitleInput('CEO & Founder Executive Credential');
      setContentInput(`${window.location.origin}/public-profile?staffId=LNX-EXEC-001`);
    } else {
      setTitleInput('Custom Secure Payload');
      setContentInput('https://lionixai.com/secure-portal');
    }
  };

  // Generate QR Code using real qrcode library
  useEffect(() => {
    let isCancelled = false;

    const generateQR = async () => {
      if (!contentInput.trim()) {
        setQrPngUrl('');
        setQrSvgString('');
        return;
      }

      setIsGenerating(true);
      try {
        // 1. Generate PNG Data URL for display & PNG download
        const png = await QRCode.toDataURL(contentInput.trim(), {
          width: qrSize,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: 'H',
        });

        // 2. Generate SVG String for crisp vector export
        const svg = await QRCode.toString(contentInput.trim(), {
          type: 'svg',
          width: qrSize,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: 'H',
        });

        if (!isCancelled) {
          setQrPngUrl(png);
          setQrSvgString(svg);
        }
      } catch (err: any) {
        console.error('QR generation error:', err);
      } finally {
        if (!isCancelled) setIsGenerating(false);
      }
    };

    generateQR();

    return () => {
      isCancelled = true;
    };
  }, [contentInput, qrSize, fgColor, bgColor]);

  // Load Saved QR codes for Owner
  const fetchSavedQrs = async () => {
    if (!isOwner) return;
    setIsLoadingSaved(true);
    try {
      const qrs = await apiService.getSavedQrs();
      setSavedQrs(qrs);
    } catch (_) {
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchSavedQrs();
  }, [isOwner]);

  // Download QR Code as PNG
  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    const cleanTitle = (titleInput || 'lionix_qrcode').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const link = document.createElement('a');
    link.href = qrPngUrl;
    link.download = `${cleanTitle}_${qrSize}x${qrSize}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionNotice('Downloaded high-resolution PNG image.');
    setTimeout(() => setActionNotice(''), 3500);
  };

  // Download QR Code as SVG
  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const cleanTitle = (titleInput || 'lionix_qrcode').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanTitle}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setActionNotice('Downloaded scalable vector SVG.');
    setTimeout(() => setActionNotice(''), 3500);
  };

  // Copy QR text/URL to clipboard
  const handleCopyContent = () => {
    navigator.clipboard.writeText(contentInput);
    setCopied(true);
    setActionNotice('Copied QR content to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setActionNotice('');
    }, 2500);
  };

  // Save QR Code to Database
  const handleSaveQr = async () => {
    if (!isOwner) {
      alert('Security Policy: Only the Company Owner can save custom QR codes.');
      return;
    }
    if (!contentInput.trim()) {
      alert('Please enter QR code content.');
      return;
    }

    try {
      const res = await apiService.saveQr({
        id: activeEditingId || undefined,
        title: titleInput.trim() || 'Custom QR Code',
        content: contentInput.trim(),
        type: contentType,
        size: qrSize,
        fgColor,
        bgColor,
      });

      if (res.success) {
        setActionNotice(activeEditingId ? 'QR Code updated successfully!' : 'QR Code saved to Owner Library!');
        setActiveEditingId(null);
        fetchSavedQrs();
        setTimeout(() => setActionNotice(''), 3500);
      }
    } catch (err: any) {
      alert('Failed to save QR Code: ' + err.message);
    }
  };

  // Edit existing saved QR Code
  const handleEditSavedQr = (qr: SavedQRCode) => {
    setActiveEditingId(qr.id);
    setTitleInput(qr.title);
    setContentInput(qr.content);
    setContentType(qr.type);
    setQrSize(qr.size || 256);
    setFgColor(qr.fgColor || '#F59E0B');
    setBgColor(qr.bgColor || '#07080B');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActionNotice(`Loaded "${qr.title}" for editing. Modify content and click Save Changes.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  // Delete saved QR Code
  const handleDeleteSavedQr = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await apiService.deleteQr(id);
      if (res.success) {
        setSavedQrs((prev) => prev.filter((q) => q.id !== id));
        if (activeEditingId === id) setActiveEditingId(null);
        setActionNotice(`Deleted "${title}" from saved library.`);
        setTimeout(() => setActionNotice(''), 3500);
      }
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  if (!isOwner) {
    return (
      <div className="p-8 rounded-3xl bg-[#0D1017] border border-red-500/30 text-center space-y-4">
        <Shield className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="font-cinzel text-xl font-bold text-white">ACCESS RESTRICTED: OWNER-ONLY FEATURE</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          The Custom QR Code Generator and Repository is exclusively reserved for the authorized Company Owner.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" />
            <span>Executive Owner Tool</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            Custom QR Code Generator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Create, customize, and save scannable QR codes for websites, company profiles, staff credentials, or custom text.
            Generated using high-resolution SVG and PNG vector engines.
          </p>
        </div>

        {actionNotice && (
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      {/* Main Split Grid: Generator Controls (Left) & Real-Time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-[#0D1017] border border-zinc-800 space-y-6 shadow-xl">
            {/* Quick Content Type Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                QR Code Type & Quick Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('website')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    contentType === 'website'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  <span>Website URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('company')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    contentType === 'company'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Company Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('staff')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    contentType === 'staff'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Staff Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('text')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    contentType === 'text'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Plain Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('other')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    contentType === 'other'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Custom Data</span>
                </button>
              </div>
            </div>

            {/* Label / Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                QR Code Label / Title
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g., LIONIX Official Website"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none transition font-medium"
              />
            </div>

            {/* Content Input (URL or Custom Text) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  QR Content (URL or Text to Encode)
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {contentInput.length} characters
                </span>
              </div>
              <textarea
                rows={3}
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder="https://lionixai.com or any text..."
                className="w-full p-3.5 rounded-2xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none transition font-mono leading-relaxed"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 pt-1 font-mono">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {contentInput.startsWith('http://') || contentInput.startsWith('https://')
                    ? 'Scanning this QR code will open this website URL.'
                    : 'Scanning this QR code will display this exact text message.'}
                </span>
              </div>
            </div>

            {/* Size & Color Styling Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
              {/* Size Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  QR Size (Resolution)
                </label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 text-xs text-white outline-none cursor-pointer"
                >
                  <option value={128}>128 x 128 px (Compact)</option>
                  <option value={256}>256 x 256 px (Standard)</option>
                  <option value={512}>512 x 512 px (High-Res HD)</option>
                  <option value={1024}>1024 x 1024 px (Ultra HD)</option>
                </select>
              </div>

              {/* Foreground Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border border-zinc-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 px-2.5 py-2 rounded-xl bg-[#07080B] border border-zinc-800 text-xs font-mono text-white uppercase outline-none"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border border-zinc-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-2.5 py-2 rounded-xl bg-[#07080B] border border-zinc-800 text-xs font-mono text-white uppercase outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-zinc-400 font-medium mr-1">Themes:</span>
              <button
                type="button"
                onClick={() => {
                  setFgColor('#F59E0B');
                  setBgColor('#07080B');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#07080B] border border-amber-500/50 text-[11px] text-amber-400 font-mono"
              >
                Gold on Obsidian (Default)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFgColor('#FFFFFF');
                  setBgColor('#07080B');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#07080B] border border-zinc-700 text-[11px] text-white font-mono"
              >
                White on Obsidian
              </button>
              <button
                type="button"
                onClick={() => {
                  setFgColor('#07080B');
                  setBgColor('#FFFFFF');
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-zinc-300 text-[11px] text-black font-mono font-bold"
              >
                Black on White
              </button>
              <button
                type="button"
                onClick={() => {
                  setFgColor('#10B981');
                  setBgColor('#07080B');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#07080B] border border-emerald-500/40 text-[11px] text-emerald-400 font-mono"
              >
                Cyber Emerald
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleSaveQr}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-black" />
                <span>{activeEditingId ? 'Save Changes' : 'Save QR to Owner Panel'}</span>
              </button>

              {activeEditingId && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveEditingId(null);
                    handleSelectTemplate('website');
                  }}
                  className="px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition cursor-pointer"
                >
                  Cancel Editing
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyContent}
                className="px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 transition flex items-center gap-2 cursor-pointer ml-auto"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copied ? 'Copied Content' : 'Copy Content'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Preview & Downloads (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#11141D] to-[#0A0D14] border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="space-y-1">
              <span className="font-cinzel text-xs font-bold tracking-widest text-amber-400 uppercase">
                Interactive Live Preview
              </span>
              <h3 className="font-bold text-white text-base">
                {titleInput || 'Generated QR Code'}
              </h3>
            </div>

            {/* QR Visual Canvas */}
            <div
              className="p-4 rounded-3xl border-2 border-amber-400/60 shadow-2xl shadow-amber-500/30 transition-transform duration-300 hover:scale-105 inline-block"
              style={{ backgroundColor: bgColor }}
            >
              {qrPngUrl ? (
                <img
                  src={qrPngUrl}
                  alt={titleInput}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-zinc-500 font-mono text-xs">
                  {isGenerating ? 'Synthesizing...' : 'Enter content to generate'}
                </div>
              )}
            </div>

            {/* Scannable Content Preview */}
            <div className="w-full p-3 rounded-2xl bg-[#07080B] border border-zinc-800 text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Target Decoded Content
              </span>
              <p className="text-xs font-mono text-amber-300 break-all line-clamp-2">
                {contentInput}
              </p>
            </div>

            {/* Download Buttons: PNG & SVG */}
            <div className="w-full grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!qrPngUrl}
                className="py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                disabled={!qrSvgString}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-black" />
                <span>Download SVG</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Scan this QR code with any iPhone or Android camera to verify instant redirection.
            </p>
          </div>
        </div>
      </div>

      {/* Saved QR Codes Library inside Owner Panel */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0D1017] border border-zinc-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="font-cinzel text-xl font-bold text-white flex items-center gap-2.5">
              <span>Saved QR Code Repository</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
                {savedQrs.length} Saved
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Access, regenerate, modify, or download previously configured company QR codes.
            </p>
          </div>

          <button
            onClick={() => handleSelectTemplate('website')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Create New QR Code</span>
          </button>
        </div>

        {savedQrs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-2">
            <QrCode className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm">No saved QR codes in your repository yet.</p>
            <p className="text-xs text-zinc-600">
              Configure a QR code above and click "Save QR to Owner Panel" to store it here permanently.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedQrs.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#0A0D14] border border-zinc-800 hover:border-amber-500/40 transition-all duration-300 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm truncate">{item.title}</h4>
                    <span className="text-[10px] text-amber-400 uppercase font-mono font-semibold">
                      {item.type} • {item.size}px
                    </span>
                  </div>
                  <span
                    className="w-5 h-5 rounded-full shrink-0 border border-zinc-700"
                    style={{ backgroundColor: item.fgColor }}
                    title={`Color: ${item.fgColor}`}
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#07080B] border border-zinc-900 text-xs font-mono text-zinc-300 break-all line-clamp-2">
                  {item.content}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditSavedQr(item)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 transition cursor-pointer"
                      title="Edit QR Code"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSavedQr(item.id, item.title)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                      title="Delete QR Code"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
