/**
 * LIONIX AI TECHNOLOGIES — DIRECTADMIN HOSTING RUNNER
 * Platform: LIONIX AI Studio
 * Domain: https://lionixai.com & https://www.lionixai.com
 * Tagline: BUILD ANYTHING. CREATE EVERYTHING.
 * 
 * DirectAdmin CloudLinux Node.js Selector / Phusion Passenger startup entry point.
 */

import dotenv from 'dotenv';
dotenv.config();

// Enforce production mode
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Launch compiled server
import('./dist-server/server.prod.js').catch((err) => {
  console.error('[LIONIX FATAL] Failed to launch production server on DirectAdmin:', err);
  process.exit(1);
});
