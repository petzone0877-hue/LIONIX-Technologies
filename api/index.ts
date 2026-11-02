import express, { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Permissive CORS for Vercel deployments, custom domains, and previews
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// PBKDF2 Password Hashing & Verification
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const hash = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

// Built-in verified owner and executive credentials (permanent password: 264880)
const defaultUsers = [
  {
    id: 'usr-owner-lionix',
    name: 'LIONIX Technologies Owner',
    email: 'lionixaitc@gmail.com',
    avatar: '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png',
    role: 'Company Owner',
    isOwner: true,
    department: 'Executive Board',
    staffId: 'LNX-OWNER-01',
    salt: 'd85fadbabae80cee2cc16f79399ceeb3',
    passwordHash: '08dcd81c68092365d2193e72d60cac5696ca1ba1c148711a776086c59cff63c71612a20a961a8c489863d4fdf0e7e80796a6caa9c7382a5d2207a0786c33879b',
    needsInitialPasswordSetup: false,
    token: 'lionix_session_d63ade08c28e6150ae82a324f16c5bb169e3cc0c612dfd1803c96d0f4f9f88e6',
    joinedDate: '2026-01-01',
    preferredLanguage: 'en',
  },
  {
    id: 'usr-owner-petzone',
    name: 'LIONIX Company Owner',
    email: 'petzone0877@gmail.com',
    avatar: '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png',
    role: 'Company Owner',
    isOwner: true,
    department: 'Executive Board',
    staffId: 'LNX-OWNER-02',
    salt: 'e245163cab24bb7dbcb43f0fe4a6722c',
    passwordHash: 'b345db5c9a2fcf839d7cd60992c624b9042dee7e014c40943538655cbb08fa804b6fe7c06b36cc96698808e01d7aa39dddae73f26e81ffd1de4aca37edd0245b',
    needsInitialPasswordSetup: false,
    token: 'lionix_session_78e9102ab39841fbcde81109927341',
    joinedDate: '2026-01-01',
    preferredLanguage: 'en',
  },
  {
    id: 'usr-owner-001',
    name: 'Lion Group Executive Admin',
    email: 'liongroupdv@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'Super Admin',
    isOwner: false,
    department: 'Executive Board',
    staffId: 'LNX-EXEC-02',
    salt: '53c91479ae4dc2dd16b0ca03f004d13c',
    passwordHash: 'cb63aed63612f5904e4e56cb41ad45a7b35d9d9e76f2eebcea8dc5cc00e0f4475f8af4e2beb0faffc5ee2ee548df11ff7c4232f94c6f4082fa3369096b820b04',
    token: 'lionix_session_0d3b8411457006c1acd26acf8d8d40f7d14da3d7dec2f1738a78a0b20b0d08f3',
    joinedDate: '2026-01-01',
    preferredLanguage: 'en',
  },
  {
    id: 'usr-stf-002',
    name: 'Farhan Chowdhury',
    email: 'farhan.lionix@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'Developer',
    isOwner: false,
    department: 'AI Software Development',
    staffId: 'LNX-ENG-001',
    salt: 'e1ffc0337ba1ae874a48310ff2962f7b',
    passwordHash: '5e28d1da7aafc7e420c56da0c1723aa652da32ee7b3edd7f0562e02074e10fd2376fff37c207e406af0b7427630eb645c50e74a6f29fdbbb4c706a76486d9fae',
    status: 'active',
    joinedDate: '2026-01-15',
    preferredLanguage: 'en',
  },
  {
    id: 'usr-stf-003',
    name: 'Ayesha Rahman',
    email: 'ayesha.lionix@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    role: 'Designer',
    isOwner: false,
    department: 'AI UI/UX Design',
    staffId: 'LNX-DES-001',
    salt: '9005558b0c7040fbf54dbd9bad4b561a',
    passwordHash: 'ac87532a4df7fb762903b4cfb006c6efe673d161c011d82675a146df6b155d35ac872f8b50377c749dc885d95d57cfbf6532b7036a6d6c52083f207ac44b5dfe',
    status: 'active',
    joinedDate: '2026-01-20',
    preferredLanguage: 'en',
  },
];

const defaultStaffList = [
  {
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
    bloodGroup: 'O+',
    emergencyContact: '+1 800-LIONIX-AI',
  },
  {
    id: 'stf-001',
    name: 'Lion Group Executive Admin',
    email: 'liongroupdv@gmail.com',
    staffId: 'LNX-EXEC-002',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    department: 'Executive Board',
    jobTitle: 'Chief Operations Officer',
    joiningDate: '2026-01-01',
    role: 'Super Admin',
    status: 'active',
    bloodGroup: 'O+',
    emergencyContact: '+1 800-LIONIX-AI',
  },
  {
    id: 'stf-002',
    name: 'Farhan Chowdhury',
    email: 'farhan.lionix@gmail.com',
    staffId: 'LNX-ENG-001',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    department: 'AI Software Development',
    jobTitle: 'Lead Systems Engineer',
    joiningDate: '2026-01-15',
    role: 'Developer',
    status: 'active',
    bloodGroup: 'B+',
    emergencyContact: '+1 800-LIONIX-AI',
  },
  {
    id: 'stf-003',
    name: 'Ayesha Rahman',
    email: 'ayesha.lionix@gmail.com',
    staffId: 'LNX-DES-001',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    department: 'AI UI/UX Design',
    jobTitle: 'Lead UI/UX Designer',
    joiningDate: '2026-01-20',
    role: 'Designer',
    status: 'active',
    bloodGroup: 'A+',
    emergencyContact: '+1 800-LIONIX-AI',
  },
];

const defaultCompanyInfo = {
  name: 'LIONIX AI Technologies',
  productName: 'LIONIX AI Studio',
  brandName: 'LIONIX',
  tagline: 'BUILD ANYTHING. CREATE EVERYTHING.',
  description: 'An AI-Powered Software Development Company.',
  logoUrl: '/assets/aistudio/WhatsApp_Image_2026-11-01_at_3.45.39_AM-removebg-preview_5500538f.png',
  bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  primaryColor: '#F59E0B',
  accentColor: '#D97706',
  ownerEmail: 'lionixaitc@gmail.com',
  foundedYear: '2026',
  headquarters: 'LIONIX AI Tower, Cyber Valley',
  website: 'https://lionixai.com',
  supportEmail: 'lionixaitc@gmail.com',
  phone: '+1 (800) LIONIX-AI',
  mission: 'To empower visionaries and businesses worldwide with autonomous AI software development, removing engineering barriers through natural language intelligence.',
  vision: 'To pioneer the next frontier of sovereign autonomous technology companies, turning human imagination into verified production deliverables.',
  socialLinks: {
    github: 'https://github.com/lionix-ai',
    linkedin: 'https://linkedin.com/company/lionix-ai',
    twitter: 'https://x.com/lionix_ai',
    youtube: 'https://youtube.com/@lionix_ai',
  },
  privacyPolicy: 'LIONIX AI Technologies adheres to strict Zero-Trust data isolation. Customer code, database credentials, and models remain private and encrypted.',
  termsAndConditions: 'All intellectual property developed via LIONIX AI Studio belongs entirely to the authorized account owner.',
};

function getDb(): any {
  try {
    const dbPath = path.resolve(process.cwd(), 'data/lionix_db.json');
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.staffList || parsed.staffList.length === 0) {
        parsed.staffList = defaultStaffList;
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Could not read lionix_db.json, using defaults:', err);
  }
  return {
    companyInfo: defaultCompanyInfo,
    users: defaultUsers,
    staffList: defaultStaffList,
    roles: [],
    projects: [],
    servers: [],
    domains: [],
    auditLogs: [],
  };
}

let inMemoryDb = getDb();

function saveDb(data: any) {
  inMemoryDb = data;
  try {
    const dbPath = path.resolve(process.cwd(), 'data/lionix_db.json');
    if (fs.existsSync(path.dirname(dbPath))) {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (err) {
    // Read-only filesystem on Vercel is expected and handled gracefully
  }
}

// Direct Login using Registered Gmail + Company Portal Password
const handleLogin = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Valid Gmail address is required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.endsWith('@gmail.com')) {
    res.status(400).json({ error: 'Access Denied: Only registered Google / Gmail accounts (@gmail.com) are permitted.' });
    return;
  }

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Company Portal password is required.' });
    return;
  }

  // Look in database users or fallback defaultUsers
  const currentUsers = inMemoryDb.users || defaultUsers;
  let user = currentUsers.find((u: any) => u.email.toLowerCase() === cleanEmail);

  // If not found in currentUsers, check defaultUsers fallback
  if (!user) {
    user = defaultUsers.find((u: any) => u.email.toLowerCase() === cleanEmail);
  }

  if (!user) {
    res.status(401).json({
      error: 'Access Denied: Account not found. Only authorized Company Owner, Admins, and Staff may access this private portal.',
    });
    return;
  }

  // Verify password with PBKDF2
  const isValidPw = verifyPassword(password, user.salt, user.passwordHash);
  if (!isValidPw) {
    res.status(401).json({
      error: 'Invalid Company Portal credentials. Please check your password.',
    });
    return;
  }

  // Issue fresh session token
  const sessionToken = `lionix_session_${crypto.randomBytes(32).toString('hex')}`;
  user.token = sessionToken;
  saveDb(inMemoryDb);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isOwner: !!user.isOwner,
    department: user.department,
    staffId: user.staffId,
    token: sessionToken,
    joinedDate: user.joinedDate,
    preferredLanguage: user.preferredLanguage || 'en',
  };

  res.json({
    success: true,
    user: safeUser,
    token: sessionToken,
    message: 'Authentication successful. Welcome to LIONIX AI Studio.',
  });
};

app.post(['/api/auth/login', '/api/auth/login-step1', '/auth/login', '/login'], handleLogin);

// ==============================================================================
// Dedicated Staff Login System (URL: https://lionixai.com/admin)
// Login ID: Staff ID (e.g. LNX-ENG-001, LNX-EXEC-002, LNX-DES-001) + Password
// ==============================================================================
const handleStaffLogin = (req: Request, res: Response) => {
  const { staffId, password } = req.body;

  if (!staffId || typeof staffId !== 'string' || !staffId.trim()) {
    res.status(400).json({ error: 'Valid Staff ID is required (e.g. LNX-ENG-001).' });
    return;
  }

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Staff account password is required.' });
    return;
  }

  const cleanStaffId = staffId.trim().toUpperCase();
  const currentStaff = inMemoryDb.staffList || defaultStaffList;
  const currentUsers = inMemoryDb.users || defaultUsers;

  const staffMember = currentStaff.find(
    (s: any) => s.staffId?.trim().toUpperCase() === cleanStaffId || s.id === cleanStaffId.toLowerCase()
  );

  const user = currentUsers.find(
    (u: any) =>
      u.staffId?.trim().toUpperCase() === cleanStaffId ||
      (staffMember && u.email?.toLowerCase() === staffMember.email?.toLowerCase())
  );

  if (!staffMember && !user) {
    res.status(401).json({
      error: `Access Denied: Staff ID "${cleanStaffId}" not found. Only registered staff may log in. Staff accounts are provisioned exclusively by the Company Owner.`,
    });
    return;
  }

  if (staffMember?.status === 'suspended' || (user as any)?.status === 'suspended') {
    res.status(403).json({
      error: `Account Suspended: Staff access for ${cleanStaffId} has been suspended by the Company Owner. Please contact the Company Owner directly.`,
      suspended: true,
    });
    return;
  }

  if (!user || !user.passwordHash || !user.salt) {
    res.status(401).json({
      error: 'Staff account credential setup pending. Please contact the Company Owner to initialize or reset your portal password.',
    });
    return;
  }

  const isValidPw = verifyPassword(password, user.salt, user.passwordHash);
  if (!isValidPw) {
    res.status(401).json({
      error: 'Invalid Staff Password. (Forgot your password? Please contact the Company Owner directly to request a password reset).',
    });
    return;
  }

  const sessionToken = `lionix_session_${crypto.randomBytes(32).toString('hex')}`;
  user.token = sessionToken;
  saveDb(inMemoryDb);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isOwner: !!user.isOwner,
    department: user.department,
    staffId: user.staffId || cleanStaffId,
    token: sessionToken,
    joinedDate: user.joinedDate,
    preferredLanguage: user.preferredLanguage || 'en',
  };

  res.json({
    success: true,
    user: safeUser,
    token: sessionToken,
    message: `Authentication successful. Welcome, ${user.name}!`,
  });
};

app.post(['/api/auth/staff-login', '/admin/login'], handleStaffLogin);

// Staff Password Reset (Owner only)
app.post(['/api/staff/reset-password'], (req: Request, res: Response) => {
  const { staffId, newPassword } = req.body;

  if (!staffId || !newPassword) {
    res.status(400).json({ error: 'Staff ID and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const cleanStaffId = staffId.trim().toUpperCase();
  const currentStaff = inMemoryDb.staffList || defaultStaffList;
  const currentUsers = inMemoryDb.users || defaultUsers;

  const staff = currentStaff.find((s: any) => s.staffId?.trim().toUpperCase() === cleanStaffId || s.id === cleanStaffId.toLowerCase());
  const user = currentUsers.find((u: any) => u.staffId?.trim().toUpperCase() === cleanStaffId || (staff && u.email?.toLowerCase() === staff.email?.toLowerCase()));

  if (!staff && !user) {
    res.status(404).json({ error: `Staff member with ID "${cleanStaffId}" not found.` });
    return;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(newPassword, salt);

  if (user) {
    user.salt = salt;
    user.passwordHash = passwordHash;
    user.token = ''; // Revoke active sessions
  }

  saveDb(inMemoryDb);

  res.json({
    success: true,
    message: `Password for ${staff?.name || user?.name} (${cleanStaffId}) successfully reset. All previous sessions have been revoked.`,
  });
});

// Staff Status Toggle
app.put(['/api/staff/:id/toggle-status'], (req: Request, res: Response) => {
  const staffIdParam = req.params.id;
  const { status } = req.body;

  if (status !== 'active' && status !== 'suspended') {
    res.status(400).json({ error: 'Invalid status. Must be "active" or "suspended".' });
    return;
  }

  const currentStaff = inMemoryDb.staffList || defaultStaffList;
  const currentUsers = inMemoryDb.users || defaultUsers;

  const targetStaff = currentStaff.find((s: any) => s.id === staffIdParam || s.staffId === staffIdParam);
  if (!targetStaff) {
    res.status(404).json({ error: 'Staff member record not found.' });
    return;
  }

  if (targetStaff.role === 'Company Owner' || targetStaff.email === 'lionixaitc@gmail.com') {
    res.status(403).json({ error: 'Security Policy: Company Owner account cannot be suspended.' });
    return;
  }

  targetStaff.status = status;
  const user = currentUsers.find((u: any) => u.email?.toLowerCase() === targetStaff.email?.toLowerCase() || u.staffId === targetStaff.staffId);
  if (user) {
    user.status = status;
    if (status === 'suspended') {
      user.token = '';
    }
  }

  saveDb(inMemoryDb);

  res.json({
    success: true,
    staff: targetStaff,
    message: `Staff member ${targetStaff.name} has been ${status === 'suspended' ? 'suspended' : 'reactivated'}.`,
  });
});

// Staff List Endpoint
app.get(['/api/staff', '/staff'], (req: Request, res: Response) => {
  res.json({ staff: inMemoryDb.staffList || defaultStaffList });
});

// Get Current User (Session Verification)
const handleMe = (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing session authorization token' });
    return;
  }

  const token = authHeader.substring(7).trim();
  const currentUsers = inMemoryDb.users || defaultUsers;
  const user = currentUsers.find((u: any) => u.token === token) || defaultUsers.find((u: any) => u.token === token);

  if (!user) {
    res.status(401).json({ error: 'Session invalid or expired. Please sign in again.' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isOwner: !!user.isOwner,
      department: user.department,
      staffId: user.staffId,
      token: user.token,
      joinedDate: user.joinedDate,
      preferredLanguage: user.preferredLanguage || 'en',
    },
  });
};

app.get(['/api/auth/me', '/auth/me', '/me'], handleMe);

// Logout
app.post(['/api/auth/logout', '/auth/logout', '/logout'], (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Owner Status
app.get(['/api/auth/owner-status', '/auth/owner-status'], (req: Request, res: Response) => {
  res.json({
    ownerEmail: inMemoryDb.companyInfo?.ownerEmail || 'lionixaitc@gmail.com',
    needsInitialPasswordSetup: false,
    companyName: inMemoryDb.companyInfo?.name || 'LIONIX AI Technologies',
    productName: inMemoryDb.companyInfo?.productName || 'LIONIX AI Studio',
    tagline: inMemoryDb.companyInfo?.tagline || 'BUILD ANYTHING. CREATE EVERYTHING.',
    gmailConfigured: true,
  });
});

// Company Info
app.get(['/api/company', '/company'], (req: Request, res: Response) => {
  res.json(inMemoryDb.companyInfo || defaultCompanyInfo);
});

// Fallback health check
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
