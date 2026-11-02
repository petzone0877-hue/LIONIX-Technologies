import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { StaffMember, RoleDefinition, UserSession, CompanyInfo, IDCardConfig } from '../types';
import { apiService } from '../services/api';
import {
  CreditCard,
  Shield,
  Plus,
  Lock,
  Printer,
  Download,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Crown,
  Eye,
  Sliders,
  ExternalLink,
  Layers,
  Save,
  Search,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit,
  Phone,
  Mail,
  Calendar,
  Building,
  Heart,
  UserCheck,
  Check,
  X,
  Palette,
  RefreshCw,
} from 'lucide-react';

interface RoleIdCardsProps {
  user: UserSession | null;
  company: CompanyInfo;
  selectedStaff: StaffMember | null;
  onNavigateTab?: (tab: string) => void;
  initialMode?: 'view' | 'edit';
}

export const RoleIdCards: React.FC<RoleIdCardsProps> = ({
  user,
  company,
  selectedStaff,
  onNavigateTab,
  initialMode = 'view',
}) => {
  const isOwner = user?.isOwner || user?.role === 'Company Owner';
  const isSuperAdmin = user?.role === 'Super Admin';
  const isAuthorizedManagement = isOwner || isSuperAdmin;

  const [activeTab, setActiveTab] = useState<'id-cards' | 'edit-card' | 'config' | 'roles'>(
    initialMode === 'edit' ? 'edit-card' : 'id-cards'
  );
  const [cardSide, setCardSide] = useState<'front' | 'back' | 'both'>('both');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [targetStaff, setTargetStaff] = useState<StaffMember>(
    selectedStaff || {
      id: 'stf-owner-001',
      name: 'LIONIX Technologies Owner',
      email: 'lionixaitc@gmail.com',
      staffId: 'LNX-EXEC-001',
      photoUrl: '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png',
      department: 'Executive Board',
      jobTitle: 'Founder & Chief Executive Officer',
      joiningDate: '2026-01-01',
      role: 'Company Owner',
      status: 'active',
      phone: '+1 (800) LIONIX-AI',
      bloodGroup: 'O+',
      emergencyContact: '+1 800-LIONIX-AI',
      customNote: 'Supreme Executive Clearance - Autonomous Sovereign Authority',
      companyName: 'LIONIX AI Technologies',
      cardTheme: 'gold_obsidian',
      customQrUrl: '',
    }
  );

  // Edit Mode State (Independent clone of targetStaff for safe editing and cancel)
  const [editingStaff, setEditingStaff] = useState<StaffMember>({ ...targetStaff });
  const [isSaving, setIsSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Native image picker file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');

  // ID Card Configuration state
  const [config, setConfig] = useState<IDCardConfig>({
    frontFields: {
      showLogo: true,
      showCompanyName: true,
      showStaffPhoto: true,
      showFullName: true,
      showStaffId: true,
      showDepartment: true,
      showRole: true,
      showJobTitle: true,
      showEmail: true,
      showJoiningDate: true,
      showContact: true,
      showBloodGroup: true,
      customNote: 'Authorized Personnel • LIONIX Autonomous Systems Access Only',
    },
    backFields: {
      showLogo: true,
      showCompanyName: true,
      showTagline: true,
      showDescription: true,
      showAddress: true,
      showOfficialEmail: true,
      showWebsite: true,
      showContactPhone: true,
      showServices: true,
      showPublicQr: true,
      emergencyInstructions:
        'This credential is the property of LIONIX AI Technologies. If found, please return to LIONIX AI Tower, Cyber Valley or mail to lionixaitc@gmail.com. Misuse or counterfeiting is strictly prohibited.',
    },
  });

  // Custom Roles State
  const [roles, setRoles] = useState<RoleDefinition[]>([
    {
      id: 'role-owner',
      name: 'Company Owner',
      description: 'Supreme executive authority with master governance over all company operations.',
      isSystem: true,
      permissions: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canDownload: true,
        canApprove: true,
        canManage: true,
        canAccessIdCards: true,
        canDeploy: true,
        canAccessAgora: true,
      },
    },
    {
      id: 'role-super-admin',
      name: 'Super Admin',
      description: 'Oversees AI department pipelines, staff operations, and infrastructure.',
      isSystem: true,
      permissions: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canDownload: true,
        canApprove: true,
        canManage: true,
        canAccessIdCards: true,
        canDeploy: true,
        canAccessAgora: true,
      },
    },
    {
      id: 'role-developer',
      name: 'Developer',
      description: 'Access to software code generation, testing, and deployment repositories.',
      isSystem: true,
      permissions: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canDownload: true,
        canApprove: false,
        canManage: false,
        canAccessIdCards: false, // Strictly Forbidden
        canDeploy: false,
        canAccessAgora: true,
      },
    },
  ]);

  // Load staff and config from server
  const fetchStaffAndConfig = async () => {
    try {
      const staff = await apiService.getStaff();
      if (staff && staff.length > 0) {
        setStaffList(staff);
        if (selectedStaff) {
          const match = staff.find((s) => s.id === selectedStaff.id || s.staffId === selectedStaff.staffId);
          if (match) {
            setTargetStaff(match);
            setEditingStaff({ ...match });
          }
        } else if (!targetStaff.id) {
          setTargetStaff(staff[0]);
          setEditingStaff({ ...staff[0] });
        }
      }
    } catch (_) {}

    try {
      const serverConfig = await apiService.getIdCardConfig();
      if (serverConfig) {
        setConfig(serverConfig);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchStaffAndConfig();
  }, [selectedStaff]);

  // Generate QR Code dynamically
  useEffect(() => {
    const generateQr = async () => {
      try {
        const staffToEncode = activeTab === 'edit-card' ? editingStaff : targetStaff;
        const verificationUrl =
          staffToEncode.customQrUrl?.trim() ||
          `${window.location.origin}/?publicProfile=${encodeURIComponent(staffToEncode.staffId)}`;

        const qrData = await QRCode.toDataURL(verificationUrl, {
          width: 256,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(qrData);
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    };

    generateQr();
  }, [targetStaff, editingStaff, activeTab]);

  // Filter staff by search query (Name or Staff ID)
  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.staffId.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  // Switch Target Staff
  const handleSelectStaff = (staff: StaffMember) => {
    setTargetStaff(staff);
    setEditingStaff({ ...staff });
  };

  // Switch to Edit Mode
  const handleStartEdit = (staff?: StaffMember) => {
    if (!isOwner) {
      alert('Security Policy: Only the Company Owner has permission to edit Staff ID Cards.');
      return;
    }
    const staffToEdit = staff || targetStaff;
    setTargetStaff(staffToEdit);
    setEditingStaff({ ...staffToEdit });
    setActiveTab('edit-card');
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingStaff({ ...targetStaff });
    setActiveTab('id-cards');
  };

  // Native Image Picker for Staff Photo (supports phone gallery & desktop file explorer)
  const handleNativeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please select a JPG, JPEG, PNG, or WEBP image.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        setEditingStaff((prev) => ({
          ...prev,
          photoUrl: base64Data,
        }));
        setActionNotice('Photo loaded from device gallery. Click "Save Changes" to apply.');
        setTimeout(() => setActionNotice(''), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Staff ID Card Edits (In-Place Update, No Duplicates!)
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      alert('Security Policy: Only the Company Owner has permission to save Staff ID Card modifications.');
      return;
    }

    if (!editingStaff.name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!editingStaff.staffId.trim()) {
      setErrorMessage('Staff ID is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      const res = await apiService.updateStaff(editingStaff.id, {
        name: editingStaff.name.trim(),
        staffId: editingStaff.staffId.trim(),
        photoUrl: editingStaff.photoUrl,
        department: editingStaff.department.trim(),
        jobTitle: editingStaff.jobTitle.trim(),
        joiningDate: editingStaff.joiningDate,
        role: editingStaff.role,
        status: editingStaff.status,
        phone: editingStaff.phone?.trim() || '',
        bloodGroup: editingStaff.bloodGroup?.trim() || 'O+',
        emergencyContact: editingStaff.emergencyContact?.trim() || '+1 800-LIONIX-AI',
        customNote: editingStaff.customNote?.trim() || '',
        companyName: editingStaff.companyName?.trim() || company.name,
        cardTheme: editingStaff.cardTheme || 'gold_obsidian',
        customQrUrl: editingStaff.customQrUrl?.trim() || '',
      });

      if (res.success && res.staff) {
        // Update in-memory lists without duplication
        setTargetStaff(res.staff);
        setEditingStaff(res.staff);
        setStaffList((prev) =>
          prev.map((s) => (s.id === res.staff.id || s.staffId === res.staff.staffId ? res.staff : s))
        );

        setActionNotice(`Staff ID Card for ${res.staff.name} (${res.staff.staffId}) updated successfully.`);
        setActiveTab('id-cards');
        setTimeout(() => setActionNotice(''), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save staff ID card updates.');
    } finally {
      setIsSaving(false);
    }
  };

  // Print Card
  const handlePrint = () => {
    window.print();
  };

  // Download Printable HTML & Visual representation
  const handleDownload = () => {
    const frontEl = document.getElementById('card-front');
    const backEl = document.getElementById('card-back');
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>LIONIX AI Technologies - Staff ID Card - ${targetStaff.staffId}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #07080B; color: #fff; padding: 24px; display: flex; gap: 24px; justify-content: center; }
          .card-container { display: flex; gap: 28px; flex-wrap: wrap; }
          @media print { body { background: #fff; color: #000; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="card-container">
          ${frontEl ? frontEl.outerHTML : ''}
          ${backEl ? backEl.outerHTML : ''}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lionix_staff_id_${targetStaff.staffId}.html`;
    a.click();
    URL.revokeObjectURL(url);

    setActionNotice(`Downloaded ID Card package for ${targetStaff.staffId}`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  // Card theme helper
  const getThemeClasses = (theme?: string) => {
    switch (theme) {
      case 'midnight_royal':
        return 'bg-gradient-to-b from-[#0c1427] via-[#070b16] to-[#03060d] border-amber-400 shadow-amber-500/20';
      case 'carbon_fiber':
        return 'bg-gradient-to-b from-[#18181f] via-[#101015] to-[#070709] border-amber-600 shadow-amber-600/20';
      case 'velvet_amber':
        return 'bg-gradient-to-b from-[#241a0e] via-[#140e06] to-[#070503] border-amber-500 shadow-amber-500/30';
      case 'gold_border_glow':
        return 'bg-gradient-to-b from-[#000000] via-[#09090b] to-[#030304] border-2 border-amber-300 shadow-2xl shadow-amber-500/50';
      case 'gold_obsidian':
      default:
        return 'bg-gradient-to-b from-[#131724] via-[#0A0D15] to-[#040507] border-amber-500/80 shadow-amber-500/25';
    }
  };

  const displayStaff = activeTab === 'edit-card' ? editingStaff : targetStaff;

  if (!isAuthorizedManagement) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#0B0D13] border-2 border-red-500/30 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-cinzel text-xl font-bold text-white">
          Access Denied: Strict Security Policy Enforced
        </h2>
        <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
          In strict compliance with LIONIX corporate identity protocols, standard staff members are{' '}
          <strong className="text-red-400">strictly forbidden</strong> from viewing, customizing, or
          downloading Staff ID Cards. Only authorized Company Management possesses credential generation authority.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hidden Native File Inputs for Gallery/Desktop Photo Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleNativeImageUpload}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={editFileInputRef}
        onChange={handleNativeImageUpload}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      {/* Top Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Corporate Dual-Sided ID Card System</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            Staff ID Cards & Role Governance
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            CR80-compliant, dual-sided corporate identification with real-time QR cryptographic public
            verification and complete owner editing authority.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 bg-[#090B0F] p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('id-cards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'id-cards'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View ID Cards</span>
          </button>

          {isOwner && (
            <button
              onClick={() => handleStartEdit()}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'edit-card'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Staff ID Card</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Field Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Roles</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: ID CARDS PREVIEW & MANAGEMENT */}
      {activeTab === 'id-cards' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Select, Edit & Print Actions */}
          <div className="p-4 md:p-6 rounded-3xl bg-[#0B0D13] border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            {/* Search by Name or ID */}
            <div className="flex-1 min-w-[260px] max-w-md relative">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by Name or Staff ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none font-medium"
              />
            </div>

            {/* Target Staff Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-zinc-400">Selected:</span>
              <select
                value={targetStaff.id}
                onChange={(e) => {
                  const found = staffList.find((s) => s.id === e.target.value);
                  if (found) handleSelectStaff(found);
                }}
                className="px-3 py-2 rounded-xl bg-[#12141C] border border-amber-500/30 text-xs font-semibold text-zinc-200 outline-none cursor-pointer"
              >
                {filteredStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.staffId})
                  </option>
                ))}
              </select>
            </div>

            {/* View Side Selector */}
            <div className="flex items-center gap-1.5 bg-[#12141C] p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setCardSide('front')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cardSide === 'front' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Front Side
              </button>
              <button
                onClick={() => setCardSide('back')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cardSide === 'back' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Back Side
              </button>
              <button
                onClick={() => setCardSide('both')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cardSide === 'both' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Both Sides
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={() => handleStartEdit(targetStaff)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit This ID Card</span>
                </button>
              )}
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                <span>Download Package</span>
              </button>
            </div>
          </div>

          {/* Cards Display Canvas */}
          <div className="flex flex-wrap items-start justify-center gap-8 p-8 md:p-12 rounded-3xl bg-[#08090D] border border-amber-500/20 shadow-2xl">
            {/* FRONT SIDE */}
            {(cardSide === 'front' || cardSide === 'both') && (
              <div className="flex flex-col items-center space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Front Side (Official Credential)
                </span>

                <div
                  id="card-front"
                  className={`w-[330px] h-[520px] rounded-3xl border-2 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center text-white select-none ${getThemeClasses(
                    targetStaff.cardTheme
                  )}`}
                  style={{ minWidth: '330px' }}
                >
                  {/* Gold Foil Accent Top Bar */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-md"></div>

                  {/* Header Area */}
                  <div className="pt-2">
                    {config.frontFields.showLogo && (
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <img
                          src={company.logoUrl || '/lionix-gold-lion.svg'}
                          alt="LIONIX"
                          className="w-9 h-9 object-contain filter drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))"
                        />
                        {config.frontFields.showCompanyName && (
                          <span className="font-cinzel text-base font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                            {targetStaff.companyName || company.brandName || 'LIONIX'}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[9px] uppercase font-bold tracking-widest text-zinc-400">
                      AI TECHNOLOGIES • OFFICIAL STAFF CREDENTIAL
                    </p>
                  </div>

                  {/* Photo & Identity Details */}
                  <div className="my-auto space-y-3">
                    {config.frontFields.showStaffPhoto && (
                      <div className="relative inline-block group">
                        <img
                          src={targetStaff.photoUrl}
                          alt={targetStaff.name}
                          className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-400 mx-auto shadow-xl shadow-amber-500/30"
                        />
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300 text-[10px] font-bold cursor-pointer"
                            title="Click to select photo from device gallery"
                          >
                            <Upload className="w-5 h-5 mb-1 text-amber-400" />
                            <span>Replace Photo</span>
                          </button>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black p-1.5 rounded-full shadow-md">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      {config.frontFields.showFullName && (
                        <h3 className="font-cinzel font-black text-lg text-zinc-100 tracking-wide">
                          {targetStaff.name}
                        </h3>
                      )}
                      {config.frontFields.showJobTitle && (
                        <p className="text-xs text-amber-400 font-bold">{targetStaff.jobTitle}</p>
                      )}
                      {config.frontFields.showDepartment && (
                        <p className="text-[11px] text-zinc-400">{targetStaff.department}</p>
                      )}
                      {config.frontFields.showRole && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {targetStaff.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Field Specs */}
                  <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                    <div className="grid grid-cols-3 text-left text-[10px] px-1 gap-1">
                      {config.frontFields.showStaffId && (
                        <div>
                          <span className="text-zinc-500 uppercase font-semibold text-[8px] block">
                            Staff ID
                          </span>
                          <p className="font-mono font-bold text-amber-400 truncate">
                            {targetStaff.staffId}
                          </p>
                        </div>
                      )}

                      {config.frontFields.showBloodGroup && (
                        <div>
                          <span className="text-zinc-500 uppercase font-semibold text-[8px] block">
                            Blood Group
                          </span>
                          <p className="font-mono font-bold text-zinc-300">
                            {targetStaff.bloodGroup || 'O+'}
                          </p>
                        </div>
                      )}

                      {config.frontFields.showJoiningDate && (
                        <div>
                          <span className="text-zinc-500 uppercase font-semibold text-[8px] block">
                            Joined
                          </span>
                          <p className="font-mono text-zinc-300 truncate">
                            {targetStaff.joiningDate || '2026-01-01'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Hologram Ribbon Bar */}
                    <div className="h-6 rounded-lg bg-gradient-to-r from-amber-500/10 via-amber-400/25 to-amber-500/10 border border-amber-400/30 flex items-center justify-between px-3 text-[9px] font-mono text-amber-300">
                      <span>LIONIX SECURE CHIP</span>
                      <span className="font-bold">VERIFIED GENUINE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BACK SIDE */}
            {(cardSide === 'back' || cardSide === 'both') && (
              <div className="flex flex-col items-center space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Back Side (Verification & QR)
                </span>

                <div
                  id="card-back"
                  className={`w-[330px] h-[520px] rounded-3xl border-2 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center text-white select-none ${getThemeClasses(
                    targetStaff.cardTheme
                  )}`}
                  style={{ minWidth: '330px' }}
                >
                  {/* Top Bar */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

                  <div className="pt-2 space-y-1">
                    <span className="font-cinzel text-sm font-bold tracking-wider text-amber-400 block">
                      {targetStaff.companyName || company.name}
                    </span>
                    <p className="text-[9px] text-zinc-400 font-mono">
                      {company.headquarters || 'LIONIX AI Tower, Cyber Valley'}
                    </p>
                  </div>

                  {/* Scannable Public QR Code */}
                  <div className="my-auto space-y-2">
                    <div className="w-32 h-32 rounded-2xl bg-white p-2 mx-auto shadow-2xl shadow-amber-500/30 border-2 border-amber-400">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Verification QR"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black text-[9px]">
                          Generating...
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">
                      Scan for Public Verification
                    </span>
                    <p className="text-[9px] text-zinc-400 max-w-[220px] mx-auto leading-relaxed">
                      Scan with any smartphone camera to inspect genuine sovereign employee credentials.
                    </p>
                  </div>

                  {/* Emergency Instructions & Signature */}
                  <div className="pt-3 border-t border-zinc-800/80 space-y-2 text-[9px] text-zinc-400">
                    <div className="text-left space-y-1">
                      <p>
                        <strong className="text-zinc-300">Official Support:</strong>{' '}
                        {company.supportEmail || 'lionixaitc@gmail.com'}
                      </p>
                      <p>
                        <strong className="text-zinc-300">Emergency Phone:</strong>{' '}
                        {targetStaff.emergencyContact || company.phone || '+1 800-LIONIX-AI'}
                      </p>
                    </div>

                    <p className="text-[8px] text-zinc-500 leading-tight italic">
                      {config.backFields.emergencyInstructions ||
                        'This credential remains the sovereign property of LIONIX AI Technologies. If found, please return to headquarters.'}
                    </p>

                    <div className="pt-1 flex items-center justify-between border-t border-zinc-800 text-[8px] text-zinc-400">
                      <span>ISSUED: {targetStaff.joiningDate || '2026-01-01'}</span>
                      <span className="font-mono text-amber-400">ID: {targetStaff.staffId}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FULL EDIT ID CARD SUITE (REQUIREMENT 4) */}
      {activeTab === 'edit-card' && (
        <form onSubmit={handleSaveChanges} className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-[#0D1017] border border-amber-500/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                  Full ID Card Editing Suite
                </span>
                <h2 className="font-cinzel text-xl md:text-2xl font-black text-white">
                  Editing ID Card: {editingStaff.name} ({editingStaff.staffId})
                </h2>
                <p className="text-xs text-zinc-400">
                  Modifications directly update the existing staff record in the persistent database. No duplicate records are created.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition cursor-pointer"
                >
                  Cancel Editing
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-black" />
                  )}
                  <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Split Grid: Editor Inputs (Left) and Live Preview Before Saving (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Photo Selection via Native Device Picker */}
                <div className="p-4 rounded-2xl bg-[#07080B] border border-zinc-800 space-y-3">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Staff Photo (Native Device Gallery / File Picker)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-zinc-900 shrink-0">
                      <img
                        src={editingStaff.photoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Photo from Device Gallery</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingStaff((prev) => ({
                              ...prev,
                              photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                editingStaff.email
                              )}`,
                            }))
                          }
                          className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition cursor-pointer"
                        >
                          Reset to Avatar
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Supports direct photo upload from Android phone gallery or desktop folder (JPG, JPEG, PNG, WEBP).
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Core Identity Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStaff.name}
                      onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Staff ID Number
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStaff.staffId}
                      onChange={(e) => setEditingStaff({ ...editingStaff, staffId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Designation / Job Title
                    </label>
                    <input
                      type="text"
                      value={editingStaff.jobTitle}
                      onChange={(e) => setEditingStaff({ ...editingStaff, jobTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Department
                    </label>
                    <select
                      value={editingStaff.department}
                      onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Executive Board">Executive Board</option>
                      <option value="AI Software Development">AI Software Development</option>
                      <option value="AI Android Development">AI Android Development</option>
                      <option value="AI Website Development">AI Website Development</option>
                      <option value="AI Backend Development">AI Backend Development</option>
                      <option value="AI Security">AI Security</option>
                      <option value="AI Server Management">AI Server Management</option>
                      <option value="AI Customer Support">AI Customer Support</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editingStaff.email}
                      onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Phone Number / Contact
                    </label>
                    <input
                      type="text"
                      value={editingStaff.phone || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                      placeholder="+1 (800) LIONIX-AI"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={editingStaff.joiningDate}
                      onChange={(e) => setEditingStaff({ ...editingStaff, joiningDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editingStaff.companyName || company.name}
                      onChange={(e) => setEditingStaff({ ...editingStaff, companyName: e.target.value })}
                      placeholder="LIONIX AI Technologies"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* 3. Card Background & Design Theme */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>Card Background & Design Theme</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'gold_obsidian', label: 'Gold on Obsidian' },
                      { id: 'midnight_royal', label: 'Midnight Royal' },
                      { id: 'carbon_fiber', label: 'Carbon Fiber' },
                      { id: 'velvet_amber', label: 'Velvet Amber' },
                      { id: 'gold_border_glow', label: 'Gold Neon Glow' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          setEditingStaff({ ...editingStaff, cardTheme: theme.id as any })
                        }
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          editingStaff.cardTheme === theme.id
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                            : 'bg-[#07080B] border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. QR Code & Security Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Custom QR Code Target URL
                    </label>
                    <input
                      type="text"
                      value={editingStaff.customQrUrl || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, customQrUrl: e.target.value })}
                      placeholder="Auto: https://lionixai.com/verify?..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 focus:border-amber-400 text-xs text-white outline-none font-mono"
                    />
                    <span className="text-[9px] text-zinc-500 block">
                      Leave empty to use the official auto-generated public verification profile URL.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Blood Group & Clearance Note
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editingStaff.bloodGroup || 'O+'}
                        onChange={(e) => setEditingStaff({ ...editingStaff, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 text-xs text-white outline-none"
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                      <input
                        type="text"
                        value={editingStaff.emergencyContact || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, emergencyContact: e.target.value })}
                        placeholder="Emergency contact"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#07080B] border border-zinc-800 text-xs text-white outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
                    <span>Save Changes to ID Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Right Column: Live Interactive Preview Before Saving */}
              <div className="lg:col-span-5 space-y-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Live Preview Before Saving
                  </span>
                  <div className="flex items-center gap-1 bg-[#12141C] p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setCardSide('front')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        cardSide === 'front' ? 'bg-amber-500 text-black' : 'text-zinc-400'
                      }`}
                    >
                      Front
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardSide('back')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        cardSide === 'back' ? 'bg-amber-500 text-black' : 'text-zinc-400'
                      }`}
                    >
                      Back
                    </button>
                  </div>
                </div>

                {/* Live Card Render in Edit Tab */}
                <div
                  className={`w-[310px] h-[490px] rounded-3xl border-2 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center text-white select-none transition-all duration-300 ${getThemeClasses(
                    editingStaff.cardTheme
                  )}`}
                >
                  <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

                  {cardSide === 'front' ? (
                    <>
                      <div className="pt-2">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <img
                            src={company.logoUrl || '/lionix-gold-lion.svg'}
                            alt="LIONIX"
                            className="w-8 h-8 object-contain"
                          />
                          <span className="font-cinzel text-sm font-black text-amber-300">
                            {editingStaff.companyName || company.brandName || 'LIONIX'}
                          </span>
                        </div>
                        <p className="text-[8px] uppercase font-bold tracking-widest text-zinc-400">
                          OFFICIAL STAFF CREDENTIAL
                        </p>
                      </div>

                      <div className="my-auto space-y-2">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 mx-auto shadow-lg shadow-amber-500/20">
                          <img
                            src={editingStaff.photoUrl}
                            alt={editingStaff.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-cinzel font-bold text-base text-zinc-100 truncate">
                            {editingStaff.name}
                          </h3>
                          <p className="text-[11px] text-amber-400 font-bold">{editingStaff.jobTitle}</p>
                          <p className="text-[10px] text-zinc-400">{editingStaff.department}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800 text-[9px] grid grid-cols-2 text-left">
                        <div>
                          <span className="text-zinc-500 text-[8px] uppercase block">Staff ID</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {editingStaff.staffId}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[8px] uppercase block">Phone</span>
                          <span className="font-mono text-zinc-300">
                            {editingStaff.phone || '+1 800-LIONIX-AI'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="pt-2">
                        <span className="font-cinzel text-xs font-bold text-amber-400 block">
                          {editingStaff.companyName || company.name}
                        </span>
                        <p className="text-[8px] text-zinc-400">Autonomous Sovereign Verification</p>
                      </div>

                      <div className="my-auto space-y-2">
                        <div className="w-28 h-28 rounded-xl bg-white p-2 mx-auto border-2 border-amber-400">
                          {qrCodeDataUrl ? (
                            <img src={qrCodeDataUrl} alt="QR" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-black text-[9px]">
                              Generating...
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-amber-400 uppercase block">
                          Public QR Verification
                        </span>
                      </div>

                      <div className="text-[8px] text-zinc-500 border-t border-zinc-800 pt-2">
                        <span>Staff ID: {editingStaff.staffId}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: OWNER FIELD CONTROLS */}
      {activeTab === 'config' && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#0D1017] border border-zinc-800 space-y-6 shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="font-cinzel text-xl font-bold text-white">ID Card Field Governance</h2>
            <p className="text-xs text-zinc-400">
              Toggle visibility of individual fields rendered on front and back ID card faces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Front Fields */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Front Face Fields</span>
              </h3>
              <div className="space-y-2 text-xs">
                {Object.keys(config.frontFields).map((fieldKey) => {
                  if (typeof (config.frontFields as any)[fieldKey] === 'boolean') {
                    return (
                      <label key={fieldKey} className="flex items-center justify-between p-3 rounded-xl bg-[#07080B] border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                        <span className="text-zinc-300 capitalize">{fieldKey.replace('show', '')}</span>
                        <input
                          type="checkbox"
                          checked={(config.frontFields as any)[fieldKey]}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              frontFields: {
                                ...config.frontFields,
                                [fieldKey]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </label>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Back Fields */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                <span>Back Face Fields</span>
              </h3>
              <div className="space-y-2 text-xs">
                {Object.keys(config.backFields).map((fieldKey) => {
                  if (typeof (config.backFields as any)[fieldKey] === 'boolean') {
                    return (
                      <label key={fieldKey} className="flex items-center justify-between p-3 rounded-xl bg-[#07080B] border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                        <span className="text-zinc-300 capitalize">{fieldKey.replace('show', '')}</span>
                        <input
                          type="checkbox"
                          checked={(config.backFields as any)[fieldKey]}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              backFields: {
                                ...config.backFields,
                                [fieldKey]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </label>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROLES */}
      {activeTab === 'roles' && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#0D1017] border border-zinc-800 space-y-6 shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="font-cinzel text-xl font-bold text-white">System Roles & RBAC Governance</h2>
            <p className="text-xs text-zinc-400">
              Defined access control tiers. Non-owners are prohibited from editing Staff ID cards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="p-5 rounded-2xl bg-[#07080B] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{role.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                    System Tier
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{role.description}</p>
                <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">ID Cards Management:</span>
                    <span className={role.permissions.canAccessIdCards ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {role.permissions.canAccessIdCards ? 'Authorized' : 'Restricted'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Deploy & Infrastructure:</span>
                    <span className={role.permissions.canDeploy ? 'text-emerald-400' : 'text-zinc-500'}>
                      {role.permissions.canDeploy ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
