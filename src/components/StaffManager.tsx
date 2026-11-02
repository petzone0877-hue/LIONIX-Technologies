import React, { useState, useEffect, useRef } from 'react';
import { StaffMember, RoleDefinition, UserSession, CompanyInfo } from '../types';
import { apiService } from '../services/api';
import {
  Users,
  Plus,
  Search,
  Shield,
  CreditCard,
  Mail,
  Calendar,
  Lock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  RefreshCw,
  KeyRound,
  Heart,
  Phone,
  Upload,
  Image as ImageIcon,
  Edit,
  Trash2,
  Camera,
  Copy,
} from 'lucide-react';

interface StaffManagerProps {
  user: UserSession | null;
  company: CompanyInfo;
  onSelectIdCard: (staff: StaffMember, mode?: 'view' | 'edit') => void;
}

export const StaffManager: React.FC<StaffManagerProps> = ({
  user,
  company,
  onSelectIdCard,
}) => {
  const isOwnerOrSuperAdmin =
    user?.isOwner || user?.role === 'Super Admin' || user?.role === 'Company Owner';
  const [search, setSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDept, setNewDept] = useState('AI Software Development');
  const [newTitle, setNewTitle] = useState('Senior AI Systems Engineer');
  const [newRole, setNewRole] = useState('Developer');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');
  const [newEmergencyContact, setNewEmergencyContact] = useState('+1 800-LIONIX-AI');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Reset Modal State
  const [resetModalStaff, setResetModalStaff] = useState<StaffMember | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessDetails, setResetSuccessDetails] = useState<{ staffId: string; password: string } | null>(null);
  const [copyNotice, setCopyNotice] = useState(false);

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pw = '';
    for (let i = 0; i < 10; i++) {
      pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResetNewPassword(pw);
    setResetConfirmPassword(pw);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStaff) return;
    if (!resetNewPassword || resetNewPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await apiService.resetStaffPassword(resetModalStaff.staffId, resetNewPassword);
      setResetSuccessDetails({
        staffId: resetModalStaff.staffId,
        password: resetNewPassword,
      });
      setFeedback(res.message || `Password for ${resetModalStaff.name} successfully reset!`);
      setTimeout(() => setFeedback(''), 6000);
    } catch (err: any) {
      alert(`Reset failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleStatus = async (member: StaffMember) => {
    if (member.role === 'Company Owner') {
      alert('Security Policy: Company Owner account cannot be suspended.');
      return;
    }
    const newStatus = member.status === 'suspended' ? 'active' : 'suspended';
    const confirmMsg =
      newStatus === 'suspended'
        ? `Are you sure you want to suspend staff member ${member.name} (${member.staffId})? They will immediately lose login access.`
        : `Reactivate staff member ${member.name} (${member.staffId})?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await apiService.toggleStaffStatus(member.id, newStatus);
      setStaff((prev) => prev.map((s) => (s.id === member.id ? { ...s, status: newStatus } : s)));
      setFeedback(`Staff member ${member.name} (${member.staffId}) is now ${newStatus.toUpperCase()}.`);
      setTimeout(() => setFeedback(''), 5000);
    } catch (err: any) {
      alert(`Status update failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (member.role === 'Company Owner') {
      alert('Security Policy: Company Owner account cannot be deleted.');
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to PERMANENTLY delete staff member ${member.name} (${member.staffId}) and their ID card? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await apiService.deleteStaff(member.id);
      setStaff((prev) => prev.filter((s) => s.id !== member.id && s.staffId !== member.staffId));
      setFeedback(`Staff member ${member.name} (${member.staffId}) was removed from company records.`);
      setTimeout(() => setFeedback(''), 5000);
    } catch (err: any) {
      alert(`Deletion failed: ${err.message || 'Unknown error'}`);
    }
  };

  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getStaff();
      if (data && data.length > 0) {
        setStaff(data);
      }
    } catch (err: any) {
      console.error('Failed to load staff list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const filteredStaff = staff.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.staffId.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDeptFilter === 'all' || s.department === selectedDeptFilter;
    return matchSearch && matchDept;
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      alert('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Image exceeds 8MB size limit. Please select an optimized photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setNewPhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setNewPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.endsWith('@gmail.com')) {
      alert('Security Policy: Only verified Gmail / Google accounts can be registered as staff.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      alert('Security Policy: Passwords must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const added = await apiService.addStaff({
        name: newName || 'New Team Member',
        email: newEmail,
        password: newPassword,
        department: newDept,
        jobTitle: newTitle,
        role: newRole,
        bloodGroup: newBloodGroup,
        emergencyContact: newEmergencyContact,
        photoUrl:
          newPhotoUrl.trim() ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newEmail)}`,
      });

      setStaff([added, ...staff]);
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewPhotoUrl('');
      setPhotoPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFeedback(`Staff member ${added.name} successfully registered with encrypted credentials.`);
      setTimeout(() => setFeedback(''), 5000);
    } catch (err: any) {
      alert(`Registration failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#08090C] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Personnel & Staff Directory</span>
          </div>
          <h1 className="font-cinzel text-2xl md:text-3xl font-black text-white">
            Company Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Manage company personnel, assign departments, configure roles, and securely generate company-branded
            Two-Sided Staff ID Cards. ID cards are strictly accessible by authorized management only.
          </p>
        </div>

        {isOwnerOrSuperAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Staff Member</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleAddStaff}
            className="bg-[#0B0D13] border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-cinzel font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Register New Staff Member</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Farhan Chowdhury"
                className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Official Gmail Address (Required for Google OTP Login) *
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. farhan.chowdhury@gmail.com"
                className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Account Password (Encrypted with Salted PBKDF2) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Department *</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none"
                >
                  <option value="AI Software Development">AI Software Development</option>
                  <option value="AI Android Development">AI Android Development</option>
                  <option value="AI Website Development">AI Website Development</option>
                  <option value="AI Backend Development">AI Backend Development</option>
                  <option value="AI Server Management">AI Server Management</option>
                  <option value="AI UI/UX Design">AI UI/UX Design</option>
                  <option value="AI Testing and Quality Assurance">AI Testing & QA</option>
                  <option value="AI Security">AI Security</option>
                  <option value="AI Customer Support">AI Customer Support</option>
                  <option value="AI Finance & Subscription">AI Finance</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Assigned Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none"
                >
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Manager">Manager</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Finance Manager">Finance Manager</option>
                  <option value="Support Team">Support Team</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Job Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Lead Mobile Architect"
                className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Blood Group</label>
                <select
                  value={newBloodGroup}
                  onChange={(e) => setNewBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={newEmergencyContact}
                  onChange={(e) => setNewEmergencyContact(e.target.value)}
                  placeholder="+1 555-010-0000"
                  className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Staff Portrait Photo (Native Gallery / Desktop File)
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {photoPreview ? (
                <div className="p-3 rounded-2xl bg-[#12151F] border border-amber-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Selected preview"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/50"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">Photo Selected</p>
                      <p className="text-[10px] text-emerald-400">Ready for Staff ID Card</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] border border-red-500/30 transition cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-2xl bg-[#12151F] hover:bg-[#161B28] border-2 border-dashed border-amber-500/40 hover:border-amber-500 text-center transition group flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center transition">
                    <Upload className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-400 group-hover:underline">
                      Click to Select Photo from Gallery / Device
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Supports JPG, JPEG, PNG, WEBP on Android & PC (No manual URL needed)
                    </p>
                  </div>
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSubmitting ? 'Registering...' : 'Save & Register Staff'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0B0D13] p-4 rounded-2xl border border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or Staff ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-zinc-500 font-mono">
            {filteredStaff.length} Member{filteredStaff.length === 1 ? '' : 's'} Found
          </span>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-3xl bg-[#0B0D13] border border-zinc-800 hover:border-amber-500/40 transition-all duration-300 space-y-4 shadow-lg group relative"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40"
                  onError={(e) => {
                    (e.currentTarget as any).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      member.email
                    )}`;
                  }}
                />
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition">
                    {member.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400">{member.jobTitle}</p>
                  <p className="text-[10px] font-mono text-amber-500/80 mt-0.5">{member.staffId}</p>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  member.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {member.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Department:</span>
                <span className="text-zinc-300 font-medium">{member.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Assigned Role:</span>
                <span className="text-amber-400 font-semibold">{member.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Official Gmail:</span>
                <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[170px]">
                  {member.email}
                </span>
              </div>
              {member.bloodGroup && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Blood Group:</span>
                  <span className="text-zinc-300 font-mono">{member.bloodGroup}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions: Management Only for ID Card generation & editing */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              {isOwnerOrSuperAdmin ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectIdCard(member, 'view')}
                      className="py-2 px-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 border border-zinc-700/80 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Card</span>
                    </button>
                    <button
                      onClick={() => onSelectIdCard(member, 'edit')}
                      className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-[11px] font-extrabold uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-md shadow-amber-500/15 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit ID Card</span>
                    </button>
                  </div>

                  {/* Owner Controls: Password Reset & Status Toggle */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setResetModalStaff(member);
                        setResetSuccessDetails(null);
                        setResetNewPassword('');
                        setResetConfirmPassword('');
                      }}
                      className="py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 border border-amber-500/30 cursor-pointer"
                      title="Reset Staff Password"
                    >
                      <KeyRound className="w-3 h-3 text-amber-400" />
                      <span>Reset Pass</span>
                    </button>

                    {member.role !== 'Company Owner' ? (
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 border cursor-pointer ${
                          member.status === 'suspended'
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30'
                        }`}
                        title={member.status === 'suspended' ? 'Reactivate Staff Access' : 'Suspend Staff Access'}
                      >
                        {member.status === 'suspended' ? (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            <span>Activate</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 text-red-400" />
                            <span>Suspend</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="py-1.5 px-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 text-center font-bold uppercase">
                        Owner
                      </div>
                    )}
                  </div>

                  {/* Delete button if Owner */}
                  {user?.isOwner && member.role !== 'Company Owner' && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleDeleteStaff(member)}
                        className="w-full py-1 rounded-lg text-zinc-500 hover:text-red-400 text-[10px] transition flex items-center justify-center gap-1 hover:bg-red-500/5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Staff Record</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-500/60" />
                  <span>ID Card Restricted to Management</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Password Reset Modal */}
      {resetModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0B0D13] border border-amber-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h3 className="font-cinzel font-bold text-sm text-white">Reset Staff Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetModalStaff(null);
                  setResetSuccessDetails(null);
                  setResetNewPassword('');
                  setResetConfirmPassword('');
                }}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {resetSuccessDetails ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Password Successfully Reset!</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    The permanent password for staff member <strong className="text-white">{resetModalStaff.name}</strong> has been updated in the database.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#12151F] border border-amber-500/30 space-y-2">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">New Staff Login Credentials</p>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Staff Login URL:</span>
                    <span className="text-amber-400 font-bold">https://lionixai.com/admin</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Staff ID (Login ID):</span>
                    <span className="text-white font-bold">{resetSuccessDetails.staffId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">New Password:</span>
                    <span className="text-emerald-400 font-bold">{resetSuccessDetails.password}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const textToCopy = `LIONIX Staff Login Credentials:\nURL: https://lionixai.com/admin\nStaff ID: ${resetSuccessDetails.staffId}\nPassword: ${resetSuccessDetails.password}`;
                    navigator.clipboard.writeText(textToCopy);
                    setCopyNotice(true);
                    setTimeout(() => setCopyNotice(false), 3000);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copyNotice ? 'Credentials Copied to Clipboard!' : 'Copy Login Details to Clipboard'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetModalStaff(null);
                    setResetSuccessDetails(null);
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Staff Member:</span>
                    <span className="text-white font-semibold">{resetModalStaff.name}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">Staff ID:</span>
                    <span className="text-amber-400 font-bold">{resetModalStaff.staffId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Department:</span>
                    <span className="text-zinc-300">{resetModalStaff.department}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-zinc-300 font-bold">New Password (min 6 characters) *</label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPassword}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Generate Random</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-bold block mb-1">Confirm New Password *</label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3 py-2 rounded-xl bg-[#12151F] border border-zinc-800 text-xs text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90">
                  Note: Resetting this password updates the PBKDF2 hash and revokes any active sessions for this staff member.
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setResetModalStaff(null)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {isResetting ? 'Resetting...' : 'Confirm Reset'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
