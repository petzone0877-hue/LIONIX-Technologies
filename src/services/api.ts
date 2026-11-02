import {
  CompanyInfo,
  UserSession,
  AIDepartment,
  SoftwareProject,
  ServerNode,
  DomainRecord,
  StaffMember,
  RoleDefinition,
  AuditEntry,
  AndroidBuildArtifact,
  IDCardConfig,
  GmailApiConfig,
  DatabaseIntegration,
  BillingGateway,
  InvoiceRecord,
  ServerCapabilityDetection,
  ApiVaultRecord,
  AutoIntegrationTask,
  SavedQRCode,
} from '../types';

const TOKEN_KEY = 'lionix_auth_token';

export const apiService = {
  getToken(): string {
    return localStorage.getItem(TOKEN_KEY) || '';
  },

  hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
      ...(options.headers || {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Auth: Step 1 (Gmail + Password -> OTP)
  // Check Owner Account status
  async getOwnerStatus(): Promise<{
    ownerEmail: string;
    needsInitialPasswordSetup: boolean;
    companyName: string;
    productName: string;
    tagline: string;
    gmailConfigured: boolean;
  }> {
    const res = await fetch('/api/auth/owner-status');
    if (!res.ok) throw new Error('Failed to fetch owner status');
    return res.json();
  },

  // Owner Initial Password Setup
  async setupOwnerPassword(password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/setup-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'lionixaitc@gmail.com', password, confirmPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Setup failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Authorized Company Owner Password Reset (Forgot Password)
  async resetOwnerPassword(email: string, recoveryKey: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/owner-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, recoveryKey, newPassword, confirmPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Password reset failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Mandatory / voluntary password change
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  },

  // DirectAdmin deployment package metadata
  async getDirectAdminInfo(): Promise<any> {
    const res = await fetch('/api/deployment/directadmin-info');
    if (!res.ok) throw new Error('Failed to fetch deployment info');
    return res.json();
  },

  // Direct Authentication: Registered Gmail + Company Portal Password
  async login(email: string, password: string): Promise<{ success: boolean; user: UserSession; token: string; message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Authentication failed' }));
      const errorObj: any = new Error(err.error || `HTTP ${res.status}`);
      errorObj.requiresOwnerSetup = err.requiresOwnerSetup;
      throw errorObj;
    }
    const data = await res.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  // Backward compatibility alias for login
  async loginStep1(email: string, password: string) {
    return this.login(email, password);
  },

  // Terminate session
  async logout(): Promise<void> {
    try {
      await this.fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    this.removeToken();
  },

  async getCurrentUser(): Promise<UserSession | null> {
    try {
      const data = await this.fetchWithAuth('/api/auth/me');
      return data.user;
    } catch {
      return null;
    }
  },

  async updateLanguage(language: 'en' | 'bn'): Promise<void> {
    try {
      await this.fetchWithAuth('/api/auth/language', {
        method: 'PUT',
        body: JSON.stringify({ language }),
      });
    } catch (_) {}
  },

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo> {
    return this.fetchWithAuth('/api/company');
  },

  async updateCompanyInfo(updates: Partial<CompanyInfo>): Promise<CompanyInfo> {
    const data = await this.fetchWithAuth('/api/company', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.company;
  },

  // Departments
  async getDepartments(): Promise<AIDepartment[]> {
    const data = await this.fetchWithAuth('/api/departments');
    return data.departments;
  },

  // Projects
  async getProjects(): Promise<SoftwareProject[]> {
    const data = await this.fetchWithAuth('/api/projects');
    return data.projects || [];
  },

  // Autonomous AI Planner
  async planProject(prompt: string, language: 'en' | 'bn' = 'en'): Promise<{ project: SoftwareProject; departments: any[] }> {
    return this.fetchWithAuth('/api/ai/company-manager/plan', {
      method: 'POST',
      body: JSON.stringify({ prompt, language }),
    });
  },

  // Universal AI Studio Prompt Engine (Multi-Turn Natural Language Development)
  async promptStudio(
    projectId: string | null,
    prompt: string,
    action: 'new' | 'add_feature' | 'fix_bug' | 'optimize' | 'test_run' = 'new',
    type: 'android' | 'website' | 'admin-panel' | 'backend' | 'api' | 'fullstack' = 'website'
  ): Promise<{
    success: boolean;
    project: SoftwareProject;
    summary: string;
    logs: string[];
    tests: any[];
    instantHtml?: string;
    backgroundTasks?: any[];
  }> {
    return this.fetchWithAuth('/api/ai/studio/prompt', {
      method: 'POST',
      body: JSON.stringify({ projectId, prompt, action, type }),
    });
  },

  // Project CRUD
  async createProject(data: Partial<SoftwareProject>): Promise<{ success: boolean; project: SoftwareProject }> {
    return this.fetchWithAuth('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProject(id: string): Promise<{ success: boolean; project: SoftwareProject }> {
    return this.fetchWithAuth(`/api/projects/${id}`);
  },

  async updateProject(id: string, updates: Partial<SoftwareProject>): Promise<{ success: boolean; project: SoftwareProject }> {
    return this.fetchWithAuth(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProject(id: string): Promise<{ success: boolean; deletedId: string }> {
    return this.fetchWithAuth(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async testProject(id: string): Promise<{ success: boolean; tests: any[]; passCount: number; failCount: number }> {
    return this.fetchWithAuth(`/api/projects/${id}/test`, {
      method: 'POST',
    });
  },

  getProjectExportZipUrl(id: string): string {
    return `/api/projects/${id}/export-zip`;
  },

  // Genuine Android APK & AAB Builders
  async buildAndroidApk(data: {
    projectId: string;
    packageName?: string;
    versionName?: string;
    versionCode?: number;
    buildType?: 'debug' | 'release';
  }): Promise<{ success: boolean; artifactId: string; filename: string; sha256: string; downloadUrl: string; logs: string[] }> {
    return this.fetchWithAuth('/api/build/android-apk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async buildAndroidAab(data: {
    projectId: string;
    packageName?: string;
    versionName?: string;
    versionCode?: number;
  }): Promise<{ success: boolean; artifactId: string; filename: string; sha256: string; downloadUrl: string; logs: string[] }> {
    return this.fetchWithAuth('/api/build/android-aab', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Legacy builder method
  async generateCode(projectId: string, prompt: string, type: string, agoraRequired: boolean): Promise<any> {
    return this.fetchWithAuth('/api/ai/builder/generate', {
      method: 'POST',
      body: JSON.stringify({ projectId, prompt, type, agoraRequired }),
    });
  },

  // Legacy Android build worker
  async triggerAndroidBuild(projectId: string, packageName: string, buildType: 'debug' | 'release' | 'signed-aab'): Promise<AndroidBuildArtifact> {
    const data = await this.fetchWithAuth('/api/build/android', {
      method: 'POST',
      body: JSON.stringify({ projectId, packageName, buildType }),
    });
    return data.artifact;
  },

  // Server Connection Real Testing
  async testServerConnection(data: string | { ip?: string; host?: string; port?: number; type?: string }): Promise<any> {
    const payload = typeof data === 'string' ? { serverId: data } : data;
    return this.fetchWithAuth('/api/servers/test-connection', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async addServer(server: Partial<ServerNode>): Promise<{ success: boolean; server: ServerNode }> {
    return this.fetchWithAuth('/api/servers', {
      method: 'POST',
      body: JSON.stringify(server),
    });
  },

  async deleteServer(id: string): Promise<{ success: boolean; deletedId: string }> {
    return this.fetchWithAuth(`/api/servers/${id}`, {
      method: 'DELETE',
    });
  },

  // Real SSL Check
  async checkDomainSsl(domain: string): Promise<any> {
    return this.fetchWithAuth('/api/domains/check-ssl', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  },

  // Automated Project Deployment Pipeline
  async deployProject(id: string, data?: { serverId?: string; customDomain?: string }): Promise<any> {
    return this.fetchWithAuth(`/api/projects/${id}/deploy`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  // Agora Integration
  async generateAgoraToken(channelName: string, role: string): Promise<any> {
    return this.fetchWithAuth('/api/agora/token', {
      method: 'POST',
      body: JSON.stringify({ channelName, role }),
    });
  },

  async updateAgoraConfig(config: { appId: string; appCertificate: string; defaultChannel: string }): Promise<any> {
    return this.fetchWithAuth('/api/agora/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  // Gmail API Settings & Test
  async getGmailConfig(): Promise<GmailApiConfig> {
    const data = await this.fetchWithAuth('/api/gmail/config');
    return data.config;
  },

  async updateGmailConfig(config: Partial<GmailApiConfig & { clientSecret?: string; refreshToken?: string }>): Promise<any> {
    return this.fetchWithAuth('/api/gmail/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  async testSendEmail(recipientEmail?: string): Promise<any> {
    return this.fetchWithAuth('/api/gmail/test-send', {
      method: 'POST',
      body: JSON.stringify({ recipientEmail }),
    });
  },

  // Staff & Roles
  async getStaff(): Promise<StaffMember[]> {
    const data = await this.fetchWithAuth('/api/staff');
    return data.staff || [];
  },

  async addStaff(staff: Partial<StaffMember & { password?: string }>): Promise<StaffMember> {
    const data = await this.fetchWithAuth('/api/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    });
    return data.staff;
  },

  // Full Staff Record & ID Card Editing
  async updateStaff(id: string, updates: Partial<StaffMember>): Promise<{ success: boolean; staff: StaffMember; message?: string }> {
    return this.fetchWithAuth(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete Staff Record & ID Card (Owner only)
  async deleteStaff(id: string): Promise<{ success: boolean; deletedStaffId: string }> {
    return this.fetchWithAuth(`/api/staff/${id}`, {
      method: 'DELETE',
    });
  },

  // Native Photo Upload (JPG, PNG, WEBP)
  async uploadStaffPhoto(imageBase64: string, filename?: string): Promise<{ success: boolean; photoUrl: string }> {
    return this.fetchWithAuth('/api/staff/upload-photo', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, filename }),
    });
  },

  // Custom QR Code Generator & Repository
  async getSavedQrs(): Promise<SavedQRCode[]> {
    const data = await this.fetchWithAuth('/api/qr/saved');
    return data.qrCodes || [];
  },

  async saveQr(qr: Partial<SavedQRCode>): Promise<{ success: boolean; qr: SavedQRCode }> {
    return this.fetchWithAuth('/api/qr/save', {
      method: 'POST',
      body: JSON.stringify(qr),
    });
  },

  async deleteQr(id: string): Promise<{ success: boolean; deletedId: string }> {
    return this.fetchWithAuth(`/api/qr/${id}`, {
      method: 'DELETE',
    });
  },

  // Instant Live Preview Engine (Target: < 60s working preview render)
  async generateInstantPreview(projectId: string | null, prompt: string, action = 'new', type = 'website'): Promise<{
    success: boolean;
    instantHtml: string;
    backgroundTasks: Array<{ id: string; name: string; status: 'completed' | 'running' | 'pending' | 'ready'; badge: string }>;
    project?: SoftwareProject;
    summary: string;
    executionTimeMs: number;
  }> {
    return this.fetchWithAuth('/api/ai/instant-preview', {
      method: 'POST',
      body: JSON.stringify({ projectId, prompt, action, type }),
    });
  },

  async getStaffIdCard(id: string): Promise<any> {
    return this.fetchWithAuth(`/api/staff/id-card/${id}`);
  },

  async getIdCardConfig(): Promise<IDCardConfig> {
    const data = await this.fetchWithAuth('/api/staff/id-card-config');
    return data.config;
  },

  async updateIdCardConfig(config: IDCardConfig): Promise<IDCardConfig> {
    const data = await this.fetchWithAuth('/api/staff/id-card-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return data.config;
  },

  async getPublicProfile(staffId?: string): Promise<any> {
    const url = staffId ? `/api/public-profile?staffId=${encodeURIComponent(staffId)}` : '/api/public-profile';
    const res = await fetch(url);
    return res.json();
  },

  // Servers & Domains
  async getServers(): Promise<ServerNode[]> {
    const data = await this.fetchWithAuth('/api/servers');
    return data.servers || [];
  },

  async testServerNode(serverId: string): Promise<any> {
    return this.fetchWithAuth('/api/servers/test', {
      method: 'POST',
      body: JSON.stringify({ serverId }),
    });
  },

  async getDomains(): Promise<DomainRecord[]> {
    const data = await this.fetchWithAuth('/api/domains');
    return data.domains || [];
  },

  async addDomain(data: {
    domain: string;
    targetServer?: string;
    provider?: string;
    projectId?: string;
  }): Promise<{ success: boolean; domain: DomainRecord }> {
    return this.fetchWithAuth('/api/domains', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteDomain(id: string): Promise<{ success: boolean; deletedId: string }> {
    return this.fetchWithAuth(`/api/domains/${id}`, {
      method: 'DELETE',
    });
  },

  async deployToDomain(domainId: string, projectId: string): Promise<any> {
    return this.fetchWithAuth('/api/domains/deploy', {
      method: 'POST',
      body: JSON.stringify({ domainId, projectId }),
    });
  },

  async checkDomainDns(domain: string, targetServerIp?: string): Promise<any> {
    return this.fetchWithAuth('/api/domains/check-dns', {
      method: 'POST',
      body: JSON.stringify({ domain, targetServerIp }),
    });
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditEntry[]> {
    const data = await this.fetchWithAuth('/api/security/audit');
    return data.logs || [];
  },

  // Database Management & Real Connectivity Test
  async getDatabases(): Promise<DatabaseIntegration[]> {
    const data = await this.fetchWithAuth('/api/databases');
    return data.databases || [];
  },

  async addDatabase(db: Partial<DatabaseIntegration> & { password?: string }): Promise<{ success: boolean; database: DatabaseIntegration }> {
    return this.fetchWithAuth('/api/databases', {
      method: 'POST',
      body: JSON.stringify(db),
    });
  },

  async deleteDatabase(id: string): Promise<{ success: boolean; deletedId: string }> {
    return this.fetchWithAuth(`/api/databases/${id}`, {
      method: 'DELETE',
    });
  },

  async testDatabaseConnection(data: { id?: string; host?: string; port?: number; type?: string }): Promise<any> {
    return this.fetchWithAuth('/api/databases/test-connection', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async generateDatabaseSchema(type: string, prompt?: string): Promise<{ success: boolean; type: string; schema: string }> {
    return this.fetchWithAuth('/api/databases/generate-schema', {
      method: 'POST',
      body: JSON.stringify({ type, prompt }),
    });
  },

  // Billing & Payment Integration
  async getBillingGateways(): Promise<BillingGateway[]> {
    const data = await this.fetchWithAuth('/api/billing/gateways');
    return data.gateways || [];
  },

  async updateBillingGateway(data: Partial<BillingGateway> & { secretKey?: string }): Promise<{ success: boolean; gateway: BillingGateway }> {
    return this.fetchWithAuth('/api/billing/gateways', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async testBillingGateway(gateway: string): Promise<any> {
    return this.fetchWithAuth('/api/billing/test-gateway', {
      method: 'POST',
      body: JSON.stringify({ gateway }),
    });
  },

  async getInvoices(): Promise<InvoiceRecord[]> {
    const data = await this.fetchWithAuth('/api/billing/invoices');
    return data.invoices || [];
  },

  async createInvoice(data: any): Promise<{ success: boolean; invoice: InvoiceRecord; checkoutUrl: string }> {
    return this.fetchWithAuth('/api/billing/create-invoice', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Server Capabilities & APNCLOUD Hosting
  async detectServerCapabilities(serverId: string = 'srv-apncloud-01', ip: string = '194.163.142.88'): Promise<{ success: boolean; capabilities: ServerCapabilityDetection }> {
    return this.fetchWithAuth('/api/servers/detect-capabilities', {
      method: 'POST',
      body: JSON.stringify({ serverId, ip }),
    });
  },

  async getApnCloudInfo(): Promise<any> {
    return this.fetchWithAuth('/api/deployment/apncloud-info');
  },

  async generateApnCloudPackage(): Promise<{ success: boolean; message: string; sizeFormatted: string; downloadUrl: string }> {
    return this.fetchWithAuth('/api/deployment/generate-apncloud-package', {
      method: 'POST',
    });
  },

  // Central API Vault
  async getApiVault(): Promise<ApiVaultRecord[]> {
    const data = await this.fetchWithAuth('/api/vault/apis');
    return data.apis || [];
  },

  async addApiVault(item: Partial<ApiVaultRecord> & { secretValue?: string }): Promise<{ success: boolean; api: ApiVaultRecord }> {
    return this.fetchWithAuth('/api/vault/apis', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async deleteApiVault(id: string): Promise<{ success: boolean; deletedId: string }> {
    return this.fetchWithAuth(`/api/vault/apis/${id}`, {
      method: 'DELETE',
    });
  },

  async testApiVault(id: string): Promise<any> {
    return this.fetchWithAuth('/api/vault/apis/test', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },

  // Full-Auto Integration Engine (10-Step Workflow)
  async executeAutoIntegration(data: {
    projectId?: string;
    prompt: string;
    language?: 'en' | 'bn';
    targetServerId?: string;
  }): Promise<{ success: boolean; task: AutoIntegrationTask; project: SoftwareProject }> {
    return this.fetchWithAuth('/api/auto-integrate/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAutoIntegrationHistory(): Promise<AutoIntegrationTask[]> {
    const data = await this.fetchWithAuth('/api/auto-integrate/history');
    return data.history || [];
  },

  // Direct APNCLOUD Hosting API Deployment
  async deployApnCloudDirect(data: {
    username?: string;
    apiToken?: string;
    password?: string;
    targetPath?: string;
    backupFirst?: boolean;
  }): Promise<any> {
    return this.fetchWithAuth('/api/deploy/apncloud-direct', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Live Domain Verification (DNS, SSL, HTTP)
  async verifyLiveDomain(domain = 'lionixai.com'): Promise<any> {
    return this.fetchWithAuth('/api/deploy/verify-live-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  },
};
