export type Language = 'en' | 'bn';

export interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export const i18n = {
  // Brand & Tagline
  companyName: {
    en: 'LIONIX AI Technologies',
    bn: 'লায়নিক্স এআই টেকনোলজিস',
  },
  platformName: {
    en: 'LIONIX AI Studio',
    bn: 'লায়নিক্স এআই স্টুডিও',
  },
  tagline: {
    en: 'BUILD ANYTHING. CREATE EVERYTHING.',
    bn: 'যেকোনো কিছু তৈরি করুন। সবকিছু সৃষ্টি করুন।',
  },
  companyDescription: {
    en: 'An AI-Powered Software Development Company.',
    bn: 'একটি এআই-চালিত সফটওয়্যার ডেভেলপমেন্ট কোম্পানি।',
  },

  // Navigation
  navDashboard: {
    en: 'Dashboard',
    bn: 'ড্যাশবোর্ড',
  },
  navCompanyWebsite: {
    en: 'Company Website',
    bn: 'কোম্পানি ওয়েবসাইট',
  },
  navOverview: {
    en: 'Company Overview',
    bn: 'কোম্পানি বিবরণ',
  },
  navAIManager: {
    en: 'AI Company Manager',
    bn: 'এআই কোম্পানি ম্যানেজার',
  },
  navAIAgents: {
    en: 'AI Agent Center',
    bn: 'এআই এজেন্ট সেন্টার',
  },
  navSoftwareBuilder: {
    en: 'Universal Software Builder',
    bn: 'সার্বজনীন সফটওয়্যার বিল্ডার',
  },
  navAndroidBuilder: {
    en: 'Android Build Center',
    bn: 'অ্যান্ড্রয়েড বিল্ড সেন্টার',
  },
  navWebBuilder: {
    en: 'Website & Panels',
    bn: 'ওয়েবসাইট ও প্যানেল',
  },
  navBackendDb: {
    en: 'Backend & Database',
    bn: 'ব্যাকএন্ড ও ডেটাবেস',
  },
  navAgora: {
    en: 'Agora RTC Integration',
    bn: 'আগোরা আরটিসি ইন্টিগ্রেশন',
  },
  navServerManager: {
    en: 'Server Manager',
    bn: 'সার্ভার ম্যানেজার',
  },
  navDomainDeploy: {
    en: 'Domain & Deployment',
    bn: 'ডোমেইন ও ডিপ্লয়মেন্ট',
  },
  navStaff: {
    en: 'Staff Management',
    bn: 'স্টাফ ব্যবস্থাপনা',
  },
  navRoles: {
    en: 'Roles & Permissions',
    bn: 'রোল ও পারমিশন',
  },
  navIdCards: {
    en: 'Staff ID Cards',
    bn: 'স্টাফ আইডি কার্ড',
  },
  navAIModels: {
    en: 'AI Model Manager',
    bn: 'এআই মডেল ম্যানেজার',
  },
  navSecurity: {
    en: 'Security Center',
    bn: 'সিকিউরিটি সেন্টার',
  },
  navOwnerControls: {
    en: 'Owner Controls & Settings',
    bn: 'মালিক নিয়ন্ত্রণ ও সেটিংস',
  },
  navGmailSettings: {
    en: 'Gmail API Settings',
    bn: 'জিমেইল এপিআই সেটিংস',
  },
  navPublicProfile: {
    en: 'Public Verification Profile',
    bn: 'পাবলিক ভেরিফিকেশন প্রোফাইল',
  },

  // Auth / Login
  loginTitle: {
    en: 'Secure Corporate Login',
    bn: 'নিরাপদ কর্পোরেট লগইন',
  },
  loginSubtitle: {
    en: 'Gmail Address & Password with Cryptographic Email OTP',
    bn: 'জিমেইল ঠিকানা ও পাসওয়ার্ড সাথে ক্রিপ্টোগ্রাফিক ওটিপি',
  },
  gmailAddress: {
    en: 'Gmail Address',
    bn: 'জিমেইল ঠিকানা',
  },
  password: {
    en: 'Password',
    bn: 'পাসওয়ার্ড',
  },
  enterPassword: {
    en: 'Enter your password',
    bn: 'আপনার পাসওয়ার্ড লিখুন',
  },
  loginButton: {
    en: 'Verify & Send OTP',
    bn: 'যাচাই করুন ও ওটিপি পাঠান',
  },
  enterOtp: {
    en: 'Enter 6-Digit Email OTP',
    bn: '৬-সংখ্যার ইমেইল ওটিপি লিখুন',
  },
  otpSentMessage: {
    en: 'A single-use OTP has been dispatched to your official Gmail.',
    bn: 'আপনার অফিসিয়াল জিমেইলে একটি ওয়ান-টাইম ওটিপি পাঠানো হয়েছে।',
  },
  verifyOtpButton: {
    en: 'Verify OTP & Open Dashboard',
    bn: 'ওটিপি যাচাই করে ড্যাশবোর্ড খুলুন',
  },
  logout: {
    en: 'Logout',
    bn: 'লগআউট',
  },
  resendOtp: {
    en: 'Resend OTP',
    bn: 'পুনরায় ওটিপি পাঠান',
  },

  // Status Labels (Honest Production-Only)
  statusCompleted: {
    en: 'Completed',
    bn: 'সম্পন্ন হয়েছে',
  },
  statusInProgress: {
    en: 'In Progress',
    bn: 'প্রক্রিয়াদীন',
  },
  statusPending: {
    en: 'Pending',
    bn: 'অপেক্ষমাণ',
  },
  statusFailed: {
    en: 'Failed',
    bn: 'ব্যর্থ হয়েছে',
  },
  statusRequiresAuth: {
    en: 'Requires Authorization',
    bn: 'অনুমোদন প্রয়োজন',
  },
  statusRequiresConfig: {
    en: 'Requires Configuration',
    bn: 'কনফিগারেশন প্রয়োজন',
  },
  statusRequiresInfra: {
    en: 'Requires Build Infrastructure',
    bn: 'বিল্ড পরিকাঠামো প্রয়োজন',
  },

  // Owner Dashboard
  totalStaff: {
    en: 'Total Staff',
    bn: 'মোট স্টাফ',
  },
  activeStaff: {
    en: 'Active Staff',
    bn: 'সক্রিয় স্টাফ',
  },
  departmentsCount: {
    en: 'AI Departments',
    bn: 'এআই ডিপার্টমেন্ট',
  },
  activeProjects: {
    en: 'Active Projects',
    bn: 'সক্রিয় প্রজেক্ট',
  },
  completedProjects: {
    en: 'Completed Projects',
    bn: 'সম্পন্ন প্রজেক্ট',
  },
  recentActivity: {
    en: 'Recent Company Activities',
    bn: 'সাম্প্রতিক কোম্পানি কার্যক্রম',
  },
  noRecentActivity: {
    en: 'No recent activity recorded yet.',
    bn: 'এখনও কোনো সাম্প্রতিক কার্যক্রম রেকর্ড করা হয়নি।',
  },

  // Staff ID Cards
  idCardStudio: {
    en: 'Two-Sided Staff ID Card Studio',
    bn: 'দ্বিমুখী স্টাফ আইডি কার্ড স্টুডিও',
  },
  frontSide: {
    en: 'Front Side (Personal & Role)',
    bn: 'সামনের দিক (ব্যক্তিগত ও পদবি)',
  },
  backSide: {
    en: 'Back Side (Company & Permanent QR)',
    bn: 'পেছনের দিক (কোম্পানি ও পার্মানেন্ট কিউআর)',
  },
  printIdCard: {
    en: 'Print ID Card (PDF Ready)',
    bn: 'আইডি কার্ড প্রিন্ট করুন (পিডিএফ)',
  },
  downloadIdCard: {
    en: 'Download ID Card',
    bn: 'আইডি কার্ড ডাউনলোড করুন',
  },
  idCardSecurityWarning: {
    en: 'STRICT SECURITY RULE: Only the Company Owner and authorized administrators can view, edit, print, or download ID cards. Staff members cannot access ID cards.',
    bn: 'কঠোর নিরাপত্তা নীতি: শুধুমাত্র কোম্পানির মালিক এবং অনুমোদিত প্রশাসকরা আইডি কার্ড দেখতে, সম্পাদনা করতে, প্রিন্ট বা ডাউনলোড করতে পারবেন। সাধারণ কর্মীরা আইডি কার্ড অ্যাক্সেস করতে পারবেন না।',
  },

  // AI Agent Center
  agentWorkspaceTitle: {
    en: 'AI Agent Center — Universal Software Factory',
    bn: 'এআই এজেন্ট সেন্টার — সার্বজনীন সফটওয়্যার কারখানা',
  },
  softwarePromptPlaceholder: {
    en: 'Describe your desired software in English or বাংলা... The AI automatically analyzes, plans, writes code, configures database schemas, and prepares verified deliverables.',
    bn: 'ইংরেজি অথবা বাংলায় আপনার সফটওয়্যারের বর্ণনা দিন... এআই স্বয়ংক্রিয়ভাবে প্রয়োজনীয়তা বিশ্লেষণ করবে, পরিকল্পনা সাজাবে, কোড লিখবে, ডেটাবেস স্কিমা কনফিগার করবে এবং ডেলিভারেবল প্রস্তুত করবে।',
  },
  synthesizeCode: {
    en: 'Autonomous Develop & Build',
    bn: 'স্বয়ংক্রিয় ডেভেলপমেন্ট ও বিল্ড',
  },
  downloadDeliverableZip: {
    en: 'Download Complete Source Project (ZIP)',
    bn: 'সম্পূর্ণ প্রজেক্ট ডাউনলোড করুন (জিপ)',
  },
  noProjectsYet: {
    en: 'No projects created yet. Enter an instruction above to create your first real application.',
    bn: 'এখনও কোনো প্রজেক্ট তৈরি করা হয়নি। আপনার প্রথম অ্যাপ্লিকেশন তৈরি করতে ওপরে একটি নির্দেশ লিখুন।',
  },

  // Android
  androidBuildNotice: {
    en: 'Android Build Environment: Standalone Gradle KTS Project Package Ready. For physical APK compilation on this cloud server, a headless Android SDK command-line toolchain is required. You can download the complete signed Gradle project to build in Android Studio or standard terminal.',
    bn: 'অ্যান্ড্রয়েড বিল্ড পরিবেশ: সম্পূর্ণ গ্রেডল কেটিএস প্রজেক্ট প্রস্তুত। ক্লাউড সার্ভারে সরাসরি এপিকে কম্পাইল করার জন্য হেডলেস অ্যান্ড্রয়েড এসডিকে কমান্ড-লাইন টুলচেইন প্রয়োজন। আপনি অ্যান্ড্রয়েড স্টুডিও বা টার্মিনালে চালানোর জন্য সম্পূর্ণ প্রজেক্ট ডাউনলোড করতে পারেন।',
  },

  // Common UI
  saveChanges: {
    en: 'Save Changes',
    bn: 'পরিবর্তন সংরক্ষণ করুন',
  },
  cancel: {
    en: 'Cancel',
    bn: 'বাতিল',
  },
  edit: {
    en: 'Edit',
    bn: 'সম্পাদনা',
  },
  delete: {
    en: 'Delete',
    bn: 'মুছে ফেলুন',
  },
  emptyState: {
    en: 'No records found.',
    bn: 'কোনো রেকর্ড পাওয়া যায়নি।',
  },
};

export function t(key: keyof typeof i18n, lang: Language): string {
  const item = i18n[key];
  if (!item) return String(key);
  return item[lang] || item.en;
}
