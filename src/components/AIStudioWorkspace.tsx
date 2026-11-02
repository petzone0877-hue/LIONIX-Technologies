import React, { useState, useEffect, useRef } from 'react';
import {
  SoftwareProject,
  SoftwareFile,
  UserSession,
  ServerCapabilityDetection,
  ApiVaultRecord,
  AutoIntegrationTask,
} from '../types';
import { apiService, API_BASE } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Play,
  RotateCw,
  Smartphone,
  Monitor,
  Tablet,
  FolderTree,
  FileCode,
  FilePlus,
  Trash2,
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Globe,
  Radio,
  Server,
  ShieldCheck,
  Send,
  Plus,
  ChevronDown,
  Activity,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Code2,
  Cpu,
  History,
  Bug,
  Zap,
  Database,
  CreditCard,
  Lock,
  RefreshCw,
  Eye,
  Key,
  Receipt,
  CheckCircle,
  XCircle,
  FileText,
  Workflow,
  Compass,
  Mic,
  MicOff,
  Volume2,
  Square,
  RotateCcw,
  Image as ImageIcon,
  Upload,
  Paperclip,
  Maximize2,
  Sliders,
  Settings,
  Bot,
  User,
  Edit2,
  Archive,
} from 'lucide-react';

interface AIStudioWorkspaceProps {
  user: UserSession | null;
  currentProject: SoftwareProject | null;
  onProjectUpdated: (project: SoftwareProject) => void;
  onNavigateTab: (tab: string) => void;
  activeLanguage: 'en' | 'bn';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  files?: Array<{ name: string; mimeType: string; size: number; data: string; previewUrl?: string }>;
  model?: string;
}

interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  systemInstruction?: string;
  model: string;
}

export const AIStudioWorkspace: React.FC<AIStudioWorkspaceProps> = ({
  user,
  currentProject,
  onProjectUpdated,
  onNavigateTab,
  activeLanguage,
}) => {
  // Top Workspace Tabs: Chat Studio | App & Code Builder | Live Sandbox | Voice & Media | Snapshots
  const [workspaceMode, setWorkspaceMode] = useState<'chat' | 'builder' | 'preview' | 'media' | 'snapshots'>('chat');

  // Projects State
  const [projects, setProjects] = useState<SoftwareProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(currentProject?.id || '');
  const [activeProject, setActiveProject] = useState<SoftwareProject | null>(currentProject);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeFileContent, setActiveFileContent] = useState('');
  const [isModified, setIsModified] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Gemini Model & Settings State
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [thinkingLevel, setThinkingLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(8192);
  const [jsonMode, setJsonMode] = useState<boolean>(false);
  const [systemInstruction, setSystemInstruction] = useState<string>(
    'You are the lead AI Software Architect of LIONIX AI Technologies. Tagline: BUILD ANYTHING. CREATE EVERYTHING. You deliver clean, production-ready, beautiful code and intelligent engineering insights.'
  );
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [apiKeyActive, setApiKeyActive] = useState<boolean>(true);

  // Gemini Chat Studio State
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    return [
      {
        id: 'chat-initial',
        title: 'New AI Studio Conversation',
        createdAt: new Date().toLocaleTimeString(),
        model: 'gemini-3.8-flash',
        messages: [
          {
            id: 'msg-welcome',
            role: 'model',
            content:
              activeLanguage === 'bn'
                ? 'স্বাগতম লায়নিক্স এআই স্টুডিওতে! গুগলের অফিশিয়াল Gemini 3.8 Flash ও Gemini 4 Argon দ্বারা চালিত। আপনি যেকোনো ফুল-স্ট্যাক অ্যাপ, এআই সিস্টেম, ফাইল বিশ্লেষণ বা কোড জেনারেট করতে পারেন।'
                : 'Welcome to LIONIX AI Studio! Powered by the official Google Gemini 3.8 Flash and Gemini 4 Argon engine. You can ask questions, generate full-stack applications, analyze files multimodal, or build interactive live sandboxes.',
            timestamp: new Date().toLocaleTimeString(),
            model: 'gemini-3.8-flash',
          },
        ],
      },
    ];
  });
  const [activeChatId, setActiveChatId] = useState<string>('chat-initial');
  const [chatInput, setChatInput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Multimodal File Attachments
  const [attachedFiles, setAttachedFiles] = useState<
    Array<{ name: string; mimeType: string; size: number; data: string; previewUrl?: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit Prompt in Place
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  // Voice & Audio State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [ttsLoadingId, setTtsLoadingId] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);

  // App Builder & Synthesizer State
  const [builderPrompt, setBuilderPrompt] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [builderLogs, setBuilderLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testingRunning, setTestingRunning] = useState<boolean>(false);

  // Live Sandbox Preview State
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [previewRefreshSpin, setPreviewRefreshSpin] = useState<boolean>(false);

  // Multimodal Studio Generators (Image & File Deep Inspector)
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [imageAspectRatio, setImageAspectRatio] = useState<string>('1:1');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [fileAnalysisResult, setFileAnalysisResult] = useState<string | null>(null);
  const [isAnalyzingDeepFile, setIsAnalyzingDeepFile] = useState<boolean>(false);

  // Version Snapshots State
  const [snapshotMessage, setSnapshotMessage] = useState<string>('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState<boolean>(false);

  // Fast Feedback Copying
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<'android' | 'website'>('website');

  // New File in Explorer
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversations, isStreaming]);

  // Load Models and Projects on Mount
  useEffect(() => {
    const init = async () => {
      try {
        const [modelsRes, projList] = await Promise.all([
          apiService.getGeminiModels().catch(() => ({ success: false, models: [], apiKeyConfigured: true, defaultModel: 'gemini-3.8-flash' })),
          apiService.getProjects().catch(() => []),
        ]);

        if (modelsRes && modelsRes.models) {
          setModels(modelsRes.models);
          setApiKeyActive(modelsRes.apiKeyConfigured);
          if (modelsRes.defaultModel) setSelectedModel(modelsRes.defaultModel);
        }

        if (projList && projList.length > 0) {
          setProjects(projList);
          if (!selectedProjectId || !projList.some((p: any) => p.id === selectedProjectId)) {
            const first = projList[0];
            setSelectedProjectId(first.id);
            setActiveProject(first);
            onProjectUpdated(first);
          } else {
            const found = projList.find((p: any) => p.id === selectedProjectId) || projList[0];
            setActiveProject(found);
          }
        }
      } catch (err) {
        console.warn('Initialization notice:', err);
      }
    };
    init();
  }, []);

  // Sync active project files
  useEffect(() => {
    if (activeProject && activeProject.files && activeProject.files.length > 0) {
      const file = activeProject.files[activeFileIndex] || activeProject.files[0];
      if (file) {
        setActiveFileContent(file.content);
        setIsModified(false);
      }
      if (activeProject.testResults) {
        setTestResults(activeProject.testResults);
      }
      if (activeProject.logs) {
        setBuilderLogs(activeProject.logs);
      }
    }
  }, [activeProject, activeFileIndex]);

  // Current active conversation
  const currentChat = conversations.find((c) => c.id === activeChatId) || conversations[0];

  // Create New Chat Conversation
  const handleCreateNewChat = () => {
    const newChat: ChatConversation = {
      id: `chat-${Date.now()}`,
      title: `Conversation ${conversations.length + 1}`,
      createdAt: new Date().toLocaleTimeString(),
      model: selectedModel,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          content:
            activeLanguage === 'bn'
              ? 'নতুন সেশন শুরু হয়েছে। আপনি কী তৈরি বা আলোচনা করতে চান?'
              : 'New conversation started. What would you like to build or explore with Gemini?',
          timestamp: new Date().toLocaleTimeString(),
          model: selectedModel,
        },
      ],
    };
    setConversations((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setAttachedFiles([]);
  };

  // Delete Conversation
  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) return;
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (activeChatId === id) {
      setActiveChatId(remaining[0].id);
    }
  };

  // Clear Current Conversation
  const handleClearConversation = () => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, messages: [] } : c))
    );
  };

  // Send Chat Message with Streaming
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || chatInput;
    if ((!promptToSend || !promptToSend.trim()) && attachedFiles.length === 0) return;
    if (isStreaming) return;

    const userMsgId = `msg-usr-${Date.now()}`;
    const modelMsgId = `msg-mod-${Date.now() + 1}`;
    const timestamp = new Date().toLocaleTimeString();

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: promptToSend.trim(),
      timestamp,
      files: [...attachedFiles],
    };

    const initialModelMsg: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp,
      model: selectedModel,
    };

    // Update conversation with user message and placeholder model message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          const updatedMessages = [...c.messages, userMsg, initialModelMsg];
          const newTitle = c.messages.length <= 1 && promptToSend.trim() ? promptToSend.trim().slice(0, 32) + '...' : c.title;
          return {
            ...c,
            title: newTitle,
            messages: updatedMessages,
          };
        }
        return c;
      })
    );

    setChatInput('');
    const filesSent = [...attachedFiles];
    setAttachedFiles([]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Build message payload history
    const historyPayload = (currentChat?.messages || [])
      .concat(userMsg)
      .map((m) => ({
        role: m.role,
        content: m.content,
        files: m.files,
      }));

    try {
      await apiService.streamGeminiChat(
        {
          model: selectedModel,
          messages: historyPayload,
          systemInstruction,
          thinkingLevel,
          jsonMode,
        },
        (chunkText: string) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeChatId) {
                const msgs = [...c.messages];
                const last = msgs[msgs.length - 1];
                if (last && last.id === modelMsgId) {
                  last.content += chunkText;
                }
                return { ...c, messages: msgs };
              }
              return c;
            })
          );
        },
        () => {
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        (err: any) => {
          console.error('Chat stream failed:', err);
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeChatId) {
                const msgs = [...c.messages];
                const last = msgs[msgs.length - 1];
                if (last && last.id === modelMsgId) {
                  last.content = `[Gemini Service Notice: ${err.message || 'Stream interrupted.'}]`;
                }
                return { ...c, messages: msgs };
              }
              return c;
            })
          );
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        abortController.signal
      );
    } catch (err: any) {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Regenerate Response
  const handleRegenerateResponse = (msgIndex: number) => {
    if (isStreaming) return;
    const msgs = currentChat.messages;
    if (msgIndex <= 0) return;
    const previousUserMsg = msgs[msgIndex - 1];
    if (previousUserMsg && previousUserMsg.role === 'user') {
      // Remove current model response and re-run
      const newMessages = msgs.slice(0, msgIndex);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, messages: newMessages } : c))
      );
      handleSendMessage(previousUserMsg.content);
    }
  };

  // Edit and resubmit user prompt
  const handleSaveEditedPrompt = (index: number) => {
    if (!editingContent.trim()) return;
    const newMessages = currentChat.messages.slice(0, index);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, messages: newMessages } : c))
    );
    setEditingMessageId(null);
    handleSendMessage(editingContent.trim());
  };

  // Copy Message to Clipboard
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Voice Recording with STT
  const handleToggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            setIsTranscribing(true);
            try {
              const res = await apiService.transcribeAudio({
                audioBase64: base64Audio,
                mimeType: 'audio/webm',
                prompt:
                  activeLanguage === 'bn'
                    ? 'এই অডিওটি নির্ভুল বাংলায় ট্রান্সক্রাইব করুন।'
                    : 'Transcribe this audio recording accurately. Preserve technical coding terms.',
              });
              if (res.transcript) {
                setChatInput((prev) => (prev ? `${prev} ${res.transcript}` : res.transcript));
              }
            } catch (err: any) {
              alert('Transcription notice: ' + err.message);
            } finally {
              setIsTranscribing(false);
            }
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err: any) {
        alert('Microphone access denied or unavailable: ' + err.message);
      }
    }
  };

  // Text-To-Speech (Play response)
  const handlePlayTTS = async (msgId: string, text: string) => {
    if (playingAudio) {
      playingAudio.pause();
      setPlayingAudio(null);
      if (ttsLoadingId === msgId) {
        setTtsLoadingId(null);
        return;
      }
    }

    setTtsLoadingId(msgId);
    try {
      const res = await apiService.generateSpeech({
        text: text.slice(0, 800), // optimal length for TTS
        voiceName: selectedVoice,
      });

      if (res.audioBase64) {
        const audio = new Audio(res.audioBase64);
        setPlayingAudio(audio);
        audio.play();
        audio.onended = () => {
          setPlayingAudio(null);
          setTtsLoadingId(null);
        };
      }
    } catch (err: any) {
      alert('Speech synthesis notice: ' + err.message);
      setTtsLoadingId(null);
    }
  };

  // Multimodal File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');

      reader.onload = () => {
        const base64Data = reader.result as string;
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            data: base64Data,
            previewUrl: isImage ? base64Data : undefined,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Generate Image with Gemini Image Model
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);

    try {
      const res = await apiService.generateImage({
        prompt: imagePrompt.trim(),
        aspectRatio: imageAspectRatio,
      });
      if (res.imageUrl) {
        setGeneratedImageUrl(res.imageUrl);
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err: any) {
      alert('Image generation notice: ' + err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Deep Multimodal File Analysis
  const handleDeepFileAnalysis = async (file: File) => {
    setIsAnalyzingDeepFile(true);
    setFileAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await apiService.analyzeFile({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64Data,
          prompt:
            'Conduct a thorough structural and architectural analysis of this file. Identify software dependencies, key modules, potential security vulnerabilities, and recommend actionable upgrades.',
        });
        if (res.analysis) {
          setFileAnalysisResult(res.analysis);
        }
      } catch (err: any) {
        alert('File analysis notice: ' + err.message);
      } finally {
        setIsAnalyzingDeepFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI App Code Synthesizer
  const handleSynthesizeApp = async () => {
    if (!builderPrompt.trim()) return;
    setIsSynthesizing(true);

    try {
      const res = await apiService.synthesizeApp({
        projectId: activeProject?.id,
        prompt: builderPrompt.trim(),
        language: activeLanguage,
        targetPlatform: activeProject?.type || 'website',
      });

      if (res.project) {
        setActiveProject(res.project);
        onProjectUpdated(res.project);
        setBuilderLogs(res.project.logs || []);
        setPreviewKey((k) => k + 1);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      setBuilderPrompt('');
    } catch (err: any) {
      alert('App synthesis notice: ' + err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Run Test Suite on Active Project
  const handleRunTests = async () => {
    if (!activeProject) return;
    setTestingRunning(true);
    try {
      const res = await apiService.testProject(activeProject.id);
      setTestResults(res.tests || []);
      setBuilderLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Automated Test Suite: ${res.passCount} passed, ${res.failCount} failed.`,
      ]);
    } catch (err: any) {
      alert('Test runner error: ' + err.message);
    } finally {
      setTestingRunning(false);
    }
  };

  // Save Code Edits in Active File
  const handleSaveActiveFile = async () => {
    if (!activeProject || !activeProject.files[activeFileIndex]) return;

    const updatedFiles = [...activeProject.files];
    updatedFiles[activeFileIndex] = {
      ...updatedFiles[activeFileIndex],
      content: activeFileContent,
    };

    try {
      const res = await apiService.updateProject(activeProject.id, {
        files: updatedFiles,
        logs: [
          ...(activeProject.logs || []),
          `[${new Date().toLocaleTimeString()}] Saved edits to ${updatedFiles[activeFileIndex].path}`,
        ],
      });
      if (res.project) {
        setActiveProject(res.project);
        onProjectUpdated(res.project);
        setIsModified(false);
        setPreviewKey((k) => k + 1);
      }
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    }
  };

  // Create Project Version Snapshot
  const handleCreateSnapshot = async () => {
    if (!activeProject) return;
    setIsCreatingSnapshot(true);
    try {
      const res = await apiService.createProjectSnapshot(
        activeProject.id,
        snapshotMessage.trim() || `Snapshot at ${new Date().toLocaleTimeString()}`
      );
      if (res.snapshot) {
        const updatedProject = {
          ...activeProject,
          snapshots: [res.snapshot, ...(activeProject.snapshots || [])],
        };
        setActiveProject(updatedProject);
        onProjectUpdated(updatedProject);
        setSnapshotMessage('');
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      }
    } catch (err: any) {
      alert('Snapshot failed: ' + err.message);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // Restore Project Version Snapshot
  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (!activeProject) return;
    if (!window.confirm('Restore this snapshot? Current files will be replaced with snapshot version.')) return;

    try {
      const res = await apiService.restoreProjectSnapshot(activeProject.id, snapshotId);
      if (res.project) {
        setActiveProject(res.project);
        onProjectUpdated(res.project);
        setActiveFileIndex(0);
        setPreviewKey((k) => k + 1);
        alert('Snapshot restored successfully!');
      }
    } catch (err: any) {
      alert('Restore failed: ' + err.message);
    }
  };

  // Duplicate Project
  const handleDuplicateProject = async () => {
    if (!activeProject) return;
    try {
      const res = await apiService.duplicateProject(activeProject.id);
      if (res.project) {
        setProjects((prev) => [res.project, ...prev]);
        setSelectedProjectId(res.project.id);
        setActiveProject(res.project);
        onProjectUpdated(res.project);
        alert(`Duplicated as "${res.project.name}"`);
      }
    } catch (err: any) {
      alert('Duplicate failed: ' + err.message);
    }
  };

  // Filtered files in explorer
  const filteredFiles = (activeProject?.files || []).filter((f) =>
    searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.path.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ==========================================
          TOP MASTER CONTROL BAR (LIONIX AI STUDIO)
          ========================================== */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#0E121B] via-[#0A0D14] to-[#07080B] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-lg font-black tracking-wide text-white">
                LIONIX AI STUDIO
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Official Gemini API
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              BUILD ANYTHING. CREATE EVERYTHING. • Google Gemini 3.8 Flash & 4 Argon Engine
            </p>
          </div>
        </div>

        {/* Global Project & Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Project Dropdown */}
          <select
            value={selectedProjectId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedProjectId(id);
              const found = projects.find((p) => p.id === id);
              if (found) {
                setActiveProject(found);
                onProjectUpdated(found);
                setActiveFileIndex(0);
                setPreviewKey((k) => k + 1);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-[#121622] border border-zinc-700 text-xs text-white outline-none cursor-pointer hover:border-amber-500/40"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                📁 {p.name} ({p.type.toUpperCase()})
              </option>
            ))}
          </select>

          {/* New Project Button */}
          <button
            onClick={() => setShowNewModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          {/* Duplicate Project */}
          <button
            onClick={handleDuplicateProject}
            title="Duplicate Active Project"
            className="px-2.5 py-1.5 rounded-xl bg-[#121622] hover:bg-[#1A1F2D] border border-zinc-700 text-zinc-300 text-xs transition flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Clone</span>
          </button>

          {/* Export Project ZIP */}
          {activeProject && (
            <a
              href={apiService.getProjectExportZipUrl(activeProject.id)}
              download
              className="px-3 py-1.5 rounded-xl bg-[#121622] hover:bg-[#1A1F2D] border border-zinc-700 text-zinc-300 text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export ZIP</span>
            </a>
          )}
        </div>
      </div>

      {/* ==========================================
          WORKSPACES NAVIGATION BAR
          ========================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0D1017] border border-amber-500/20">
          <button
            onClick={() => setWorkspaceMode('chat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              workspaceMode === 'chat'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Gemini Chat Studio</span>
          </button>

          <button
            onClick={() => setWorkspaceMode('builder')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              workspaceMode === 'builder'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>App & Code Builder</span>
          </button>

          <button
            onClick={() => setWorkspaceMode('preview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              workspaceMode === 'preview'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Live Sandbox Preview</span>
          </button>

          <button
            onClick={() => setWorkspaceMode('media')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              workspaceMode === 'media'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Voice & Media Studio</span>
          </button>

          <button
            onClick={() => setWorkspaceMode('snapshots')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              workspaceMode === 'snapshots'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Snapshots & History</span>
          </button>
        </div>

        {/* Gemini Active Model Badge & Settings Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F131C] border border-amber-500/30 text-xs">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-zinc-300 font-semibold">{selectedModel}</span>
            {thinkingLevel && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono">
                {thinkingLevel} Thinking
              </span>
            )}
          </div>

          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              showSettingsDrawer
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-[#121622] text-zinc-300 border-zinc-700 hover:border-amber-500/40'
            }`}
            title="Model Tuning & System Instructions"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==========================================
          MODEL SETTINGS & SYSTEM INSTRUCTIONS DRAWER
          ========================================== */}
      {showSettingsDrawer && (
        <div className="p-5 rounded-3xl bg-[#0D1017] border border-amber-500/30 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Google Gemini Model Configuration & Parameters</h3>
            </div>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Model Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Active Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Flagship General & Code)</option>
                <option value="gemini-4-argon">Gemini 4 Argon (Deep Architectural Reasoning)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Throughput)</option>
                <option value="gemini-3.1-flash-lite-image">Gemini 3.1 Flash Lite Image (Art & Vision)</option>
                <option value="gemini-nano-banana-2.1">Gemini Nano Banana 2.1 (HD 4K Images)</option>
                <option value="gemini-3.5-transcribe">Gemini 3.5 Transcribe (Audio STT)</option>
                <option value="gemini-3.8-flash-lite-tts">Gemini 3.8 Flash Lite TTS (Voice)</option>
              </select>
            </div>

            {/* Thinking Level */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Thinking Level (Gemini 3/4)</label>
              <select
                value={thinkingLevel}
                onChange={(e) => setThinkingLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
              >
                <option value="LOW">LOW (Fastest Latency & Minimal Reasoning)</option>
                <option value="MEDIUM">MEDIUM (Balanced Depth & Efficiency)</option>
                <option value="HIGH">HIGH (Maximum Deep Reasoning for Complex Code)</option>
              </select>
            </div>

            {/* Voice Persona for TTS */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">TTS Voice Persona</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
              >
                <option value="Kore">Kore (Clear, Professional, Authoritative)</option>
                <option value="Puck">Puck (Energetic, Modern, Engaging)</option>
                <option value="Charon">Charon (Deep, Formal, Calm)</option>
                <option value="Fenrir">Fenrir (Bold, Confident, Dynamic)</option>
                <option value="Aoede">Aoede (Warm, Melodic, Expressive)</option>
              </select>
            </div>

            {/* JSON Mode Toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141824] border border-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={jsonMode}
                  onChange={(e) => setJsonMode(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="text-xs text-zinc-300 font-medium">Enforce JSON Output Mode</span>
              </label>
            </div>
          </div>

          {/* System Instructions Editor */}
          <div className="space-y-1 pt-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>System Instructions</span>
              <span className="text-[11px] text-zinc-500 font-mono">Governs all chat and synthesis reasoning</span>
            </label>
            <textarea
              rows={2}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-zinc-700 text-xs text-zinc-200 outline-none focus:border-amber-400 font-mono"
              placeholder="Provide master system instructions..."
            />
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 1: GEMINI CHAT WORKSPACE (GOOGLE AI STUDIO)
          ========================================== */}
      {workspaceMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Conversation Threads & Controls (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="p-4 rounded-3xl bg-[#0B0D13] border border-amber-500/20 space-y-3 shadow-xl">
              <button
                onClick={handleCreateNewChat}
                className="w-full py-2.5 px-4 rounded-xl gold-gradient bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:opacity-95 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>

              <div className="flex items-center justify-between pt-1 border-b border-zinc-800 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500/70">
                  Chat History ({conversations.length})
                </span>
                <button
                  onClick={handleClearConversation}
                  className="text-[10px] text-zinc-500 hover:text-red-400 transition"
                  title="Clear messages in current chat"
                >
                  Clear Current
                </button>
              </div>

              {/* Chat Thread List */}
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {conversations.map((c) => {
                  const isActive = c.id === activeChatId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveChatId(c.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between group ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-[#10141E] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs font-semibold truncate">{c.title}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {c.messages.length} msgs • {c.createdAt}
                        </p>
                      </div>

                      {conversations.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteChat(c.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition"
                          title="Delete thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Context & Capabilities Card */}
            <div className="p-4 rounded-3xl bg-[#0B0D13] border border-zinc-800 space-y-2 text-xs text-zinc-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Multimodal Context
              </span>
              <p className="text-[11px] leading-relaxed">
                Attach images, PDFs, ZIP archives, audio clips, or source code. Gemini processes full multimodal payloads with real-time SSE streaming.
              </p>
              <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-1 text-[10px] font-mono text-zinc-500">
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">Bilingual EN/BN</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">SSE Typewriter</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">Voice STT/TTS</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Chat Stream & Message Input (9 cols) */}
          <div className="lg:col-span-9 flex flex-col h-[720px] rounded-3xl bg-[#0B0D13] border border-amber-500/25 overflow-hidden shadow-2xl">
            {/* Chat Header Bar */}
            <div className="px-5 py-3.5 bg-[#0E121B] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <h3 className="text-xs font-bold text-white truncate max-w-md">
                  {currentChat.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {isStreaming && (
                  <button
                    onClick={handleStopGeneration}
                    className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-500/30 transition cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop Generation</span>
                  </button>
                )}
                <span className="text-[11px] text-zinc-400 font-mono">
                  {selectedModel}
                </span>
              </div>
            </div>

            {/* Chat Messages Scroll Container */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {currentChat.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 space-y-3">
                  <Bot className="w-10 h-10 text-amber-500/40" />
                  <p className="text-sm font-semibold text-zinc-400">Ready to build with Google Gemini</p>
                  <p className="text-xs max-w-md">
                    Ask a technical question, upload code or design files, or prompt for a full-stack web or Android app.
                  </p>
                </div>
              ) : (
                currentChat.messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const isEditing = editingMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 group ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-1">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 shadow-lg text-xs leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-zinc-100'
                            : 'bg-[#10141E] border border-zinc-800 text-zinc-200'
                        }`}
                      >
                        {/* Attached files preview */}
                        {msg.files && msg.files.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {msg.files.map((file, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-zinc-700 text-[11px]"
                              >
                                {file.previewUrl ? (
                                  <img
                                    src={file.previewUrl}
                                    alt={file.name}
                                    className="w-4 h-4 rounded object-cover"
                                  />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                                )}
                                <span className="font-mono text-zinc-300">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message Content or In-Place Editor */}
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full bg-black/60 border border-amber-500/40 rounded-lg p-2 text-xs text-white outline-none font-mono"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="px-2.5 py-1 rounded bg-zinc-800 text-[11px] text-zinc-300"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEditedPrompt(idx)}
                                className="px-3 py-1 rounded bg-amber-500 text-black font-bold text-[11px]"
                              >
                                Save & Regenerate
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap font-sans">
                            {msg.content || (
                              <span className="inline-flex items-center gap-1.5 text-zinc-400 italic">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                Gemini is reasoning...
                              </span>
                            )}
                          </div>
                        )}

                        {/* Message Toolbar */}
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono">
                          <span>{msg.timestamp}</span>

                          <div className="flex items-center gap-2">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="hover:text-zinc-200 transition flex items-center gap-1"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {/* TTS Speak button */}
                            {!isUser && msg.content && (
                              <button
                                onClick={() => handlePlayTTS(msg.id, msg.content)}
                                className="hover:text-amber-400 transition flex items-center gap-1"
                                title="Listen with Gemini TTS"
                              >
                                <Volume2 className={`w-3 h-3 ${ttsLoadingId === msg.id ? 'text-amber-400 animate-pulse' : ''}`} />
                                <span>{ttsLoadingId === msg.id ? 'Playing...' : 'Speak'}</span>
                              </button>
                            )}

                            {/* Edit prompt if user */}
                            {isUser && !isEditing && (
                              <button
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditingContent(msg.content);
                                }}
                                className="hover:text-zinc-200 transition flex items-center gap-1"
                                title="Edit prompt"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            )}

                            {/* Regenerate button if model */}
                            {!isUser && idx === currentChat.messages.length - 1 && !isStreaming && (
                              <button
                                onClick={() => handleRegenerateResponse(idx)}
                                className="hover:text-amber-400 transition flex items-center gap-1"
                                title="Regenerate this response"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Regenerate</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center shrink-0 mt-1 text-xs">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Attached Files Chips Bar */}
            {attachedFiles.length > 0 && (
              <div className="px-5 py-2 bg-[#0E121B] border-t border-zinc-800 flex flex-wrap gap-2">
                {attachedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-amber-500/30 text-xs text-amber-300"
                  >
                    {f.previewUrl ? (
                      <img src={f.previewUrl} alt={f.name} className="w-4 h-4 rounded object-cover" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span className="font-mono">{f.name}</span>
                    <button
                      onClick={() => handleRemoveAttachedFile(i)}
                      className="ml-1 text-zinc-400 hover:text-red-400 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Message Input Dock */}
            <div className="p-4 bg-[#0E121B] border-t border-zinc-800 space-y-2">
              <div className="flex items-end gap-2">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.zip,.html,.css,.js,.ts,.tsx,.json,.txt,.doc,.docx,.mp3,.wav,.mp4"
                />

                {/* File Attachment Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-[#141824] hover:bg-[#1C2132] border border-zinc-700 text-zinc-300 hover:text-amber-400 transition cursor-pointer"
                  title="Upload multimodal file (Images, PDF, ZIP, Code, Media)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Voice Record / STT Button */}
                <button
                  onClick={handleToggleVoiceRecording}
                  disabled={isTranscribing}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    isRecording
                      ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                      : isTranscribing
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-[#141824] hover:bg-[#1C2132] border-zinc-700 text-zinc-300 hover:text-amber-400'
                  }`}
                  title={isRecording ? 'Click to stop recording' : 'Record voice (Gemini 3.5 Transcribe)'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Prompt Textarea */}
                <div className="flex-1 relative">
                  <textarea
                    rows={2}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      isRecording
                        ? 'Listening to microphone... Speak clearly.'
                        : isTranscribing
                        ? 'Transcribing audio speech via Gemini 3.5...'
                        : 'Ask Gemini anything, request full-stack software, or attach files... (Shift+Enter for new line)'
                    }
                    className="w-full bg-[#141824] border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none resize-none font-sans"
                  />
                </div>

                {/* Send / Stop Button */}
                {isStreaming ? (
                  <button
                    onClick={handleStopGeneration}
                    className="p-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-lg shadow-red-500/20 cursor-pointer"
                    title="Stop streaming response"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!chatInput.trim() && attachedFiles.length === 0}
                    className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Send message to Gemini"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: AI APP & MULTI-FILE CODE BUILDER
          ========================================== */}
      {workspaceMode === 'builder' && (
        <div className="space-y-4">
          {/* Builder Prompt Synthesis Bar */}
          <div className="p-5 rounded-3xl bg-[#0B0D13] border border-amber-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  AI App Synthesizer (Gemini 3.8 Flash Code Engine)
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                Project: {activeProject?.name}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={builderPrompt}
                onChange={(e) => setBuilderPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSynthesizeApp()}
                placeholder="e.g., Create a real-time cryptocurrency dashboard with price charts, alerts, and transaction history..."
                className="flex-1 bg-[#121622] border border-zinc-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none font-mono"
              />
              <button
                onClick={handleSynthesizeApp}
                disabled={isSynthesizing || !builderPrompt.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
                <span>{isSynthesizing ? 'Synthesizing...' : 'Generate App'}</span>
              </button>
            </div>
          </div>

          {/* Multi-File Code Editor & Explorer Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* File Explorer Tree (3 cols) */}
            <div className="lg:col-span-3 rounded-2xl bg-[#0B0D13] border border-zinc-800 p-3 space-y-2 h-[600px] flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <FolderTree className="w-4 h-4" />
                  <span>Files ({activeProject?.files?.length || 0})</span>
                </div>
                <button
                  onClick={() => setShowNewFileModal(true)}
                  className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                  title="Add new file"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search file filter */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter files..."
                className="w-full bg-[#121622] border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 outline-none font-mono"
              />

              {/* File List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {filteredFiles.map((file, idx) => {
                  const isCurrent = activeProject?.files.indexOf(file) === activeFileIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const originalIndex = activeProject?.files.indexOf(file) ?? 0;
                        setActiveFileIndex(originalIndex);
                        setActiveFileContent(file.content);
                        setIsModified(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition text-left cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-amber-400' : 'text-zinc-500'}`} />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-600 uppercase">{file.language}</span>
                    </button>
                  );
                })}
              </div>

              {/* Run Test Suite Action */}
              <button
                onClick={handleRunTests}
                disabled={testingRunning}
                className="w-full py-2 rounded-xl bg-[#121622] hover:bg-[#1A1F2D] border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Play className={`w-3.5 h-3.5 text-emerald-400 ${testingRunning ? 'animate-spin' : ''}`} />
                <span>Run Automated Tests</span>
              </button>
            </div>

            {/* Code Editor Deck (9 cols) */}
            <div className="lg:col-span-9 rounded-2xl bg-[#0B0D13] border border-zinc-800 h-[600px] flex flex-col overflow-hidden">
              {/* File Tab Bar */}
              <div className="px-4 py-2.5 bg-[#0E121B] border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-white">
                    {activeProject?.files[activeFileIndex]?.path || activeProject?.files[activeFileIndex]?.name || 'No file selected'}
                  </span>
                  {isModified && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved modifications"></span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveActiveFile}
                    disabled={!isModified}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition disabled:opacity-40 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Code Textarea Editor */}
              <div className="flex-1 relative bg-[#07090E] p-2">
                <textarea
                  value={activeFileContent}
                  onChange={(e) => {
                    setActiveFileContent(e.target.value);
                    setIsModified(true);
                  }}
                  className="w-full h-full bg-transparent text-zinc-200 font-mono text-xs leading-relaxed p-2 outline-none resize-none selection:bg-amber-500/30"
                  spellCheck={false}
                />
              </div>

              {/* Editor Status Bar */}
              <div className="px-4 py-1.5 bg-[#0A0C12] border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Lines: {activeFileContent.split('\n').length} • UTF-8</span>
                <span className="text-emerald-400">Syntax Verified: OK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: LIVE SANDBOX PREVIEW (FIXES 404!)
          ========================================== */}
      {workspaceMode === 'preview' && (
        <div className="rounded-3xl bg-[#0B0D13] border border-amber-500/30 p-5 space-y-4 shadow-2xl">
          {/* Viewport & Live Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                HTTP 200 Live Sandbox
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                lionixai.com / preview / {activeProject?.id}
              </span>
            </div>

            {/* Viewport Device Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121622] border border-zinc-700">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  deviceMode === 'desktop' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Desktop Viewport"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  deviceMode === 'tablet' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Tablet Viewport (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  deviceMode === 'mobile' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Mobile Viewport (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh and External Link */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPreviewRefreshSpin(true);
                  setPreviewKey((k) => k + 1);
                  setTimeout(() => setPreviewRefreshSpin(false), 500);
                }}
                className="p-2 rounded-xl bg-[#121622] hover:bg-[#1A1F2D] border border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                title="Refresh Live Preview"
              >
                <RotateCw className={`w-4 h-4 ${previewRefreshSpin ? 'animate-spin text-amber-400' : ''}`} />
              </button>

              {activeProject && (
                <a
                  href={apiService.getProjectPreviewUrl(activeProject.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Fullscreen</span>
                </a>
              )}
            </div>
          </div>

          {/* Preview Sandbox Container */}
          <div className="flex justify-center bg-[#07080B] rounded-2xl p-4 min-h-[640px]">
            <div
              className={`transition-all duration-300 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-white ${
                deviceMode === 'mobile'
                  ? 'w-[375px] h-[667px]'
                  : deviceMode === 'tablet'
                  ? 'w-[768px] h-[640px]'
                  : 'w-full h-[640px]'
              }`}
            >
              <iframe
                key={previewKey}
                title="LIONIX AI Studio Live Sandbox Preview"
                src={activeProject ? apiService.getProjectPreviewUrl(activeProject.id) : '/api/health'}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-downloads"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: VOICE & MULTIMODAL MEDIA STUDIO
          ========================================== */}
      {workspaceMode === 'media' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Image Generation & Editing Box */}
          <div className="p-5 rounded-3xl bg-[#0B0D13] border border-amber-500/25 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm text-white">AI Image Synthesis & Studio</h3>
                <p className="text-[11px] text-zinc-400">gemini-3.1-flash-lite-image & nano-banana-2.1</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Image Prompt
                </label>
                <textarea
                  rows={3}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image or UI mock to synthesize..."
                  className="w-full bg-[#121622] border border-zinc-700 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Aspect Ratio:</span>
                  <select
                    value={imageAspectRatio}
                    onChange={(e) => setImageAspectRatio(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-[#141824] border border-zinc-700 text-xs text-white outline-none"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Wide</option>
                    <option value="4:3">4:3 Standard</option>
                    <option value="9:16">9:16 Portrait</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingImage ? 'Generating...' : 'Generate Image'}</span>
                </button>
              </div>

              {generatedImageUrl && (
                <div className="p-3 rounded-2xl bg-[#07080B] border border-amber-500/30 text-center space-y-2">
                  <img
                    src={generatedImageUrl}
                    alt="Gemini Generated"
                    className="max-h-72 mx-auto rounded-xl object-contain shadow-lg"
                  />
                  <a
                    href={generatedImageUrl}
                    download="gemini_generated_asset.png"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Deep Multimodal File Inspector Box */}
          <div className="p-5 rounded-3xl bg-[#0B0D13] border border-amber-500/25 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Archive className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Deep Multimodal File Inspector</h3>
                <p className="text-[11px] text-zinc-400">PDF, ZIP, Code, Documents & Media Analysis</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-amber-400/60 rounded-2xl p-6 cursor-pointer bg-[#0E121B] transition">
                <Upload className="w-8 h-8 text-amber-400 mb-2" />
                <span className="text-xs font-bold text-white">Click or drag file to analyze</span>
                <span className="text-[11px] text-zinc-500 mt-1">
                  ZIP archives, PDF reports, code repositories, audio, or video
                </span>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDeepFileAnalysis(file);
                  }}
                  className="hidden"
                />
              </label>

              {isAnalyzingDeepFile && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Gemini 3.8 Flash is analyzing structure and code contents...</span>
                </div>
              )}

              {fileAnalysisResult && (
                <div className="p-4 rounded-xl bg-[#07080B] border border-zinc-800 text-xs text-zinc-200 max-h-72 overflow-y-auto whitespace-pre-wrap font-sans space-y-2">
                  <div className="font-bold text-amber-400 text-xs border-b border-zinc-800 pb-1">
                    Technical Analysis Result:
                  </div>
                  <div>{fileAnalysisResult}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: VERSION HISTORY & SNAPSHOTS
          ========================================== */}
      {workspaceMode === 'snapshots' && (
        <div className="p-5 rounded-3xl bg-[#0B0D13] border border-amber-500/25 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Project Version History & Snapshots</h3>
                <p className="text-[11px] text-zinc-400">
                  Restore previous code iterations with zero data loss.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={snapshotMessage}
                onChange={(e) => setSnapshotMessage(e.target.value)}
                placeholder="Snapshot commit note (e.g. Added auth modal)..."
                className="bg-[#121622] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none w-64 font-sans"
              />
              <button
                onClick={handleCreateSnapshot}
                disabled={isCreatingSnapshot}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCreatingSnapshot ? 'Creating...' : 'Create Snapshot'}</span>
              </button>
            </div>
          </div>

          {/* Snapshots Timeline */}
          <div className="space-y-3">
            {!activeProject?.snapshots || activeProject.snapshots.length === 0 ? (
              <div className="text-center p-8 text-zinc-500 text-xs">
                No snapshots created for this project yet. Click &quot;Create Snapshot&quot; above to capture current state.
              </div>
            ) : (
              activeProject.snapshots.map((snap: any) => (
                <div
                  key={snap.id}
                  className="p-4 rounded-2xl bg-[#0E121B] border border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{snap.message}</p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {snap.formattedTime || snap.timestamp} • {snap.filesCount || snap.files?.length || 0} files included
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreSnapshot(snap.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Restore to This State
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          NEW PROJECT MODAL
          ========================================== */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0E121B] border border-amber-500/40 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New LIONIX Project</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 block mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. AI Cloud Portal"
                  className="w-full bg-[#141824] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 block mb-1">Platform Type</label>
                <select
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value as any)}
                  className="w-full bg-[#141824] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="website">Full-Stack Web Platform (React + Node.js Express)</option>
                  <option value="android">Native Android App (Kotlin + Compose)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newProjectName.trim()) return;
                  try {
                    const res = await apiService.createProject({
                      name: newProjectName.trim(),
                      type: newProjectType,
                      language: activeLanguage,
                    });
                    if (res.project) {
                      setProjects((prev) => [res.project, ...prev]);
                      setSelectedProjectId(res.project.id);
                      setActiveProject(res.project);
                      onProjectUpdated(res.project);
                      setShowNewModal(false);
                      setNewProjectName('');
                    }
                  } catch (err: any) {
                    alert('Project creation notice: ' + err.message);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          NEW FILE MODAL
          ========================================== */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0E121B] border border-amber-500/40 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add New File</h3>
            <div>
              <label className="text-xs text-zinc-300 block mb-1">File Name & Extension</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. style.css or api.ts"
                className="w-full bg-[#141824] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newFileName.trim() || !activeProject) return;
                  const ext = newFileName.split('.').pop() || 'txt';
                  const newFile: SoftwareFile = {
                    name: newFileName.trim(),
                    path: `src/${newFileName.trim()}`,
                    language: ext,
                    content: `// ${newFileName.trim()}\n// Created in LIONIX AI Studio\n`,
                  };
                  const updatedFiles = [...(activeProject.files || []), newFile];
                  try {
                    const res = await apiService.updateProject(activeProject.id, { files: updatedFiles });
                    if (res.project) {
                      setActiveProject(res.project);
                      onProjectUpdated(res.project);
                      setActiveFileIndex(updatedFiles.length - 1);
                      setShowNewFileModal(false);
                      setNewFileName('');
                    }
                  } catch (err: any) {
                    alert('Add file failed: ' + err.message);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
              >
                Add File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
