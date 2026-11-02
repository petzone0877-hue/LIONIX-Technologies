import React, { useState } from 'react';
import {
  UploadCloud,
  File,
  FileText,
  FileArchive,
  Image as ImageIcon,
  Video,
  Music,
  CheckCircle2,
  Trash2,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { apiService } from '../services/api';

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: 'uploaded' | 'uploading';
  progress: number;
  dataBase64?: string;
  analysis?: string;
}

export const FileUploadCenter: React.FC = () => {
  const [files, setFiles] = useState<UploadedFileItem[]>([
    {
      id: 'f-01',
      name: 'lionix_release_bundle.zip',
      size: '28.4 MB',
      type: 'application/zip',
      uploadedAt: '10m ago',
      status: 'uploaded',
      progress: 100,
    },
    {
      id: 'f-02',
      name: 'android_keystore_release.jks',
      size: '4.2 KB',
      type: 'security/keystore',
      uploadedAt: '25m ago',
      status: 'uploaded',
      progress: 100,
    },
    {
      id: 'f-03',
      name: 'lionix_brand_banner_4k.png',
      size: '5.8 MB',
      type: 'image/png',
      uploadedAt: '1h ago',
      status: 'uploaded',
      progress: 100,
    },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<{ name: string; text: string } | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    Array.from(selectedFiles).forEach((file) => {
      const newId = `f-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const reader = new FileReader();

      reader.onload = () => {
        const base64Data = reader.result as string;
        const newFileItem: UploadedFileItem = {
          id: newId,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          type: file.type || 'application/octet-stream',
          uploadedAt: 'Just now',
          status: 'uploaded',
          progress: 100,
          dataBase64: base64Data,
        };

        setFiles((prev) => [newFileItem, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyzeFileWithGemini = async (file: UploadedFileItem) => {
    setAnalyzingId(file.id);
    try {
      const res = await apiService.analyzeFile({
        fileName: file.name,
        mimeType: file.type,
        base64Data: file.dataBase64,
        prompt:
          'Conduct a comprehensive structural and technical inspection of this uploaded file. Identify security posture, technology stack, architecture patterns, and provide actionable recommendations.',
      });

      if (res.analysis) {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, analysis: res.analysis } : f))
        );
        setSelectedAnalysis({ name: file.name, text: res.analysis });
      }
    } catch (err: any) {
      alert('File analysis notice: ' + err.message);
    } finally {
      setAnalyzingId(null);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.zip') || name.endsWith('.aab') || name.endsWith('.apk')) return FileArchive;
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp') || name.endsWith('.svg')) return ImageIcon;
    if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov')) return Video;
    if (name.endsWith('.mp3') || name.endsWith('.wav')) return Music;
    if (name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.txt')) return FileText;
    return File;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Multimodal Ingest & Analysis Hub</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            File Upload & Intelligence Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Upload images, PDFs, ZIP archives, source code files, documents, audio, and videos.
            Equipped with autonomous Google Gemini 3.8 Flash multimodal analysis and inspection.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="p-8 rounded-3xl bg-[#0B0D13] border-2 border-dashed border-zinc-800 hover:border-amber-400/50 transition duration-300 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-cinzel font-bold text-white text-base">
            Drag & Drop Files or Browse Storage
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            PNG, JPG, WEBP, PDF, ZIP, HTML, CSS, JS, JSON, TXT, DOC, DOCX, MP3, WAV, MP4
          </p>
        </div>

        <label className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer">
          <span>Choose Files to Upload</span>
          <input
            type="file"
            onChange={handleUpload}
            multiple
            className="hidden"
            accept="image/*,.pdf,.zip,.html,.css,.js,.ts,.tsx,.json,.txt,.doc,.docx,.mp3,.wav,.mp4"
          />
        </label>
      </div>

      {/* Analysis Modal/Drawer */}
      {selectedAnalysis && (
        <div className="p-5 rounded-3xl bg-[#0E121B] border border-amber-500/40 shadow-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-amber-400 font-mono">
              Gemini Analysis: {selectedAnalysis.name}
            </span>
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close ✕
            </button>
          </div>
          <div className="text-xs text-zinc-200 whitespace-pre-wrap font-sans max-h-96 overflow-y-auto leading-relaxed">
            {selectedAnalysis.text}
          </div>
        </div>
      )}

      {/* Stored Files List */}
      <div className="space-y-4">
        <h3 className="font-cinzel text-sm font-bold text-white">
          Stored Files & Multimodal Packages ({files.length})
        </h3>

        <div className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.name);
            const isAnalyzing = analyzingId === file.id;

            return (
              <div
                key={file.id}
                className="p-4 rounded-2xl bg-[#111319] border border-zinc-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-amber-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-zinc-200 truncate">{file.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {file.size} • {file.uploadedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Gemini Analyze Button */}
                  <button
                    onClick={() => handleAnalyzeFileWithGemini(file)}
                    disabled={isAnalyzing}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzing ? 'Analyzing...' : file.analysis ? 'View Analysis' : 'Analyze with Gemini'}</span>
                  </button>

                  {/* Download button */}
                  <button
                    onClick={() => {
                      const blob = new Blob([file.dataBase64 || `LIONIX ASSET FILE: ${file.name}`], { type: file.type });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = file.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
