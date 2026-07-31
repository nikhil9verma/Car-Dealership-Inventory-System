import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

// Auto-initialize SQLite database if missing
try {
  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  const rootDbPath = path.resolve(process.cwd(), 'dev.db');
  if (!fs.existsSync(dbPath) && !fs.existsSync(rootDbPath)) {
    console.log('[AI Studio] Initializing SQLite database schema and seeding sample data...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
  }
} catch (err) {
  console.warn('[AI Studio] SQLite auto-initialization notice:', err);
}

export const prisma = new PrismaClient();
