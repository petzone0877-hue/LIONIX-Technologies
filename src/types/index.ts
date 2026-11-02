export interface CompanyInfo {
  name: string;
  productName: string;
  brandName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  accentColor: string;
  ownerEmail: string;
  foundedYear: string;
  headquarters: string;
  website: string;
  supportEmail: string;
  phone: string;
  mission: string;
  vision: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  privacyPolicy: string;
  termsAndConditions: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  isOwner: boolean;
  department: string;
  staffId: string;
  token: string;
  joinedDate: string;
  preferredLanguage?: 'en' | 'bn';
  mustChangePassword?: boolean;
}

export interface AIDepartment {
  id: string;
  name: string;
  nameBn: string;
  lead: string;
  avatar: string;
  role: string;
  status: 'active' | 'processing' | 'idle' | 'requires_configuration';
  capabilities: string[];
  currentTask?: string;
  completedTasks: number;
  activityHistory: Array<{ timestamp: string; action: string; status: 'success' | 'warning' | 'info' | 'failed' }>;
}

export interface SoftwareFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export interface SoftwareProject {
  id: string;
  name: string;
  type: 'android' | 'website' | 'admin-panel' | 'backend' | 'api' | 'fullstack';
  prompt: string;
  language: 'en' | 'bn';
  status: 'planning' | 'generating' | 'building' | 'testing' | 'completed' | 'failed' | 'requires_configuration' | 'deployed';
  techStack: string[];
  agoraEnabled: boolean;
  agoraMode?: 'audio' | 'video' | 'live-stream' | 'none';
  apkReady: boolean;
  apkDownloadUrl?: string;
  aabDownloadUrl?: string;
  webLiveUrl?: string;
  createdAt: string;
  files: SoftwareFile[];
  logs: string[];
  departmentAssignments: Array<{ departmentId: string; task: string; status: string }>;
  // Domain & Deployment Integration
  customDomain?: string;
  connectedServerId?: string;
  dnsConfigured?: boolean;
  sslEnabled?: boolean;
  deployStatus?: 'not_deployed' | 'deploying' | 'live' | 'failed' | 'dns_pending';
  deployLogs?: string[];
  lastDeployedAt?: string;
  // Android Specific Properties
  packageName?: string;
  versionName?: string;
  versionCode?: number;
  minSdk?: number;
  targetSdk?: number;
  signingConfigured?: boolean;
  signingAlias?: string;
  // Testing & Quality Assurance
  testResults?: Array<{ name: string; status: 'passed' | 'failed'; durationMs: number; details?: string }>;
  // Iterative History
  history?: Array<{ timestamp: string; prompt: string; action: string; filesChanged: number }>;
}

export interface ServerNode {
  id: string;
  name: string;
  type: 'cpanel' | 'plesk' | 'directadmin' | 'vps' | 'dedicated' | 'aws' | 'gcp' | 'azure' | 'digitalocean' | 'hostinger' | 'docker';
  ip: string;
  port: number;
  os: string;
  status: 'online' | 'offline' | 'checking' | 'requires_configuration';
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  authType: 'ssh-key' | 'password' | 'api-token';
  capabilities: string[];
  activeDeployments: number;
  lastChecked: string;
}

export interface DomainRecord {
  id: string;
  domain: string;
  provider: string;
  sslStatus: 'active' | 'pending' | 'expired' | 'requires_configuration';
  targetServer: string;
  dnsRecords: Array<{ type: string; name: string; value: string; ttl: number }>;
  healthStatus: 'healthy' | 'warning' | 'down' | 'requires_configuration';
  autoDeploy: boolean;
  sslExpires: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  staffId: string;
  photoUrl: string;
  department: string;
  jobTitle: string;
  joiningDate: string;
  role: string;
  status: 'active' | 'suspended' | 'on-leave';
  phone?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  customNote?: string;
  companyName?: string;
  cardTheme?: 'gold_obsidian' | 'midnight_royal' | 'carbon_fiber' | 'velvet_amber' | 'gold_border_glow';
  customQrUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SavedQRCode {
  id: string;
  title: string;
  content: string;
  type: 'website' | 'text' | 'company' | 'staff' | 'other';
  size: number;
  fgColor: string;
  bgColor: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canDownload: boolean;
    canApprove: boolean;
    canManage: boolean;
    canAccessIdCards: boolean;
    canDeploy: boolean;
    canAccessAgora: boolean;
  };
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  department: string;
  ip: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

export interface AndroidBuildArtifact {
  buildId: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  sha256?: string;
  status: 'completed' | 'in_progress' | 'failed' | 'requires_infrastructure';
  message: string;
  downloadUrls?: {
    gradleZip?: string;
    debugApk?: string;
    releaseApk?: string;
    signedAab?: string;
  };
  logs: string[];
}

export interface IDCardConfig {
  frontFields: {
    showLogo: boolean;
    showCompanyName: boolean;
    showStaffPhoto: boolean;
    showFullName: boolean;
    showStaffId: boolean;
    showDepartment: boolean;
    showRole: boolean;
    showJobTitle: boolean;
    showEmail: boolean;
    showJoiningDate: boolean;
    showContact: boolean;
    showBloodGroup: boolean;
    customNote: string;
  };
  backFields: {
    showLogo: boolean;
    showCompanyName: boolean;
    showTagline: boolean;
    showDescription: boolean;
    showAddress: boolean;
    showOfficialEmail: boolean;
    showWebsite: boolean;
    showContactPhone: boolean;
    showServices: boolean;
    showPublicQr: boolean;
    emergencyInstructions: string;
  };
}

export interface GmailApiConfig {
  configured: boolean;
  senderEmail: string;
  authorizedEmail?: string;
  clientId?: string;
  hasClientSecret?: boolean;
  hasRefreshToken?: boolean;
  lastTestStatus?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'NOT_TESTED';
  lastTestedAt?: string;
  errorMessage?: string;
}

export interface DatabaseIntegration {
  id: string;
  name: string;
  type: 'mysql' | 'postgres' | 'firebase' | 'supabase' | 'mongodb';
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  hasPassword?: boolean;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastPingMs?: number;
  lastTested?: string;
  errorMessage?: string;
  tablesCount?: number;
  schemaTables?: Array<{ name: string; columns: string[]; rowCount?: number }>;
  ssl?: boolean;
}

export interface BillingGateway {
  id: string;
  gateway: 'stripe' | 'paypal' | 'sslcommerz' | 'bkash';
  name: string;
  enabled: boolean;
  mode: 'sandbox' | 'live';
  currency: 'USD' | 'BDT' | 'EUR';
  status: 'ready' | 'missing_credentials' | 'error';
  merchantId?: string;
  publicKey?: string;
  hasSecretKey?: boolean;
  webhookUrl: string;
  lastTestedAt?: string;
  testStatus?: 'VERIFIED' | 'FAILED' | 'PENDING';
  features: string[];
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'paid' | 'pending' | 'cancelled';
  gateway: 'stripe' | 'paypal' | 'sslcommerz' | 'bkash' | 'manual';
  paymentDate?: string;
  dueDate: string;
}

export interface ServerCapabilityDetection {
  serverId: string;
  serverName: string;
  hostingProvider: 'APNCLOUD' | 'DirectAdmin' | 'cPanel' | 'VPS' | 'AWS' | 'Other';
  detectedAt: string;
  rawBanner?: string;
  portsTested: Array<{ port: number; service: string; open: boolean; latencyMs?: number }>;
  capabilities: {
    nodejs: { supported: boolean; version?: string; mode: 'passenger' | 'standalone' | 'unsupported' };
    php: { supported: boolean; version?: string };
    webServer: 'LiteSpeed' | 'Apache' | 'Nginx' | 'Unknown';
    passenger: boolean;
    mysql: boolean;
    postgres: boolean;
    docker: boolean;
    ssh: boolean;
    staticOnly: boolean;
    sslAuto: boolean;
  };
  recommendedDeployment: 'apncloud_node' | 'apncloud_static_spa' | 'directadmin_node' | 'vps_docker' | 'static_zip';
  summary: string;
}

export interface ApiVaultRecord {
  id: string;
  name: string;
  provider: string;
  category: 'ai' | 'payments' | 'storage' | 'communications' | 'hosting' | 'database';
  baseUrl: string;
  authType: 'bearer' | 'api-key' | 'basic' | 'oauth2';
  keyName: string;
  hasSecret: boolean;
  lastTestStatus?: 'SUCCESS' | 'FAILED' | 'NOT_TESTED';
  lastPingMs?: number;
  lastTestedAt?: string;
  notes?: string;
}

export interface AutoIntegrationStep {
  stepNumber: number;
  title: string;
  category: 'code' | 'backend' | 'database' | 'billing' | 'server' | 'api' | 'testing';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_auth';
  details: string;
  agent: string;
  executionTimeMs?: number;
}

export interface AutoIntegrationTask {
  id: string;
  projectId: string;
  prompt: string;
  overallStatus: 'analyzing' | 'building' | 'testing' | 'deployed' | 'completed' | 'action_required';
  steps: AutoIntegrationStep[];
  missingCredentials?: Array<{ service: string; field: string; hint: string }>;
  deliverables?: {
    filesGenerated: number;
    backendConnected: boolean;
    databaseConnected: boolean;
    billingConfigured: boolean;
    apncloudPackageReady: boolean;
    exportZipUrl?: string;
  };
  createdAt: string;
  completedAt?: string;
}


