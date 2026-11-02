import React, { useState } from 'react';
import {
  UploadCloud,
  File,
  FileText,
  FileArchive,
  Image,
  Video,
  Music,
  CheckCircle2,
  Trash2,
  Download,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: 'uploaded' | 'uploading';
  progress: number;
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const newId = `f-${Date.now()}`;
    const newFileItem: UploadedFileItem = {
      id: newId,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type || 'file',
      uploadedAt: 'Just now',
      status: 'uploading',
      progress: 15,
    };

    setFiles([newFileItem, ...files]);
    setIsUploading(true);

    // Chunked progress simulation
    let currentProg = 15;
    const interval = setInterval(() => {
      currentProg += 25;
      if (currentProg >= 100) {
        currentProg = 100;
        clearInterval(interval);
        setIsUploading(false);
        setFiles((prev) =>
          prev.map((f) => (f.id === newId ? { ...f, status: 'uploaded', progress: 100 } : f))
        );
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === newId ? { ...f, progress: currentProg } : f))
        );
      }
    }, 300);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.zip') || name.endsWith('.aab') || name.endsWith('.apk')) return FileArchive;
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) return Image;
    if (name.endsWith('.mp4') || name.endsWith('.mov')) return Video;
    if (name.endsWith('.mp3') || name.endsWith('.wav')) return Music;
    return FileText;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Chunked Multi-Format Asset Storage</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            File Upload & Asset Storage Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Upload images, videos, audio, PDF, ZIP, APK/AAB packages, spreadsheets, and source code.
            Includes automated integrity verification and chunked transfer.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Dropzone */}
      <div className="p-8 rounded-3xl bg-[#0B0D13] border-2 border-dashed border-amber-500/40 hover:border-amber-400 transition flex flex-col items-center justify-center text-center space-y-3 relative group">
        <input
          type="file"
          onChange={handleSimulateUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-cinzel text-sm font-bold text-white">
            Click to Browse or Drag & Drop Files Here
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Supports APK, AAB, ZIP, PNG, MP4, MP3, PDF, DOCX, XLSX, and Source Code archives
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#12151F] text-zinc-400 text-[10px] font-mono">
          Maximum file size: 500 MB per chunk
        </span>
      </div>

      {/* Uploaded Files Table */}
      <div className="p-6 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-4">
        <h3 className="font-cinzel text-sm font-bold text-white">
          Stored Files & Deliverable Packages ({files.length})
        </h3>

        <div className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.name);
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

                <div className="flex items-center gap-3 shrink-0">
                  {file.status === 'uploading' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono">{file.progress}%</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Stored
                    </span>
                  )}

                  <button
                    onClick={() => {
                      // Trigger download of mock asset
                      const blob = new Buffer(`LIONIX ASSET FILE: ${file.name}`);
                      const url = URL.createObjectURL(new Blob([blob]));
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = file.name;
                      a.click();
                    }}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
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
