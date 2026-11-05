import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support large payloads for PDF and cover uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Database file path
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'novelbox_db.json');

interface ServerDB {
  users: Array<{
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    avatar: string;
    bio: string;
    readingGoalPerYear: number;
    joinedAt: string;
  }>;
  novelsByUser: Record<string, any[]>;
}

function loadDB(): ServerDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: ServerDB = JSON.parse(content);
      let changed = false;
      parsed.users.forEach(u => {
        if (u.name === 'Budi Hartono' || u.id === 'user-budi') {
          u.name = 'Rendy Prayoga';
          u.email = 'rendibky66@gmail.com';
          u.id = 'user-rendy';
          changed = true;
        }
      });
      if (parsed.novelsByUser['user-budi'] && !parsed.novelsByUser['user-rendy']) {
        parsed.novelsByUser['user-rendy'] = parsed.novelsByUser['user-budi'];
        changed = true;
      }
      if (changed) {
        saveDB(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading DB file, creating fresh one:', err);
  }

  const defaultDB: ServerDB = {
    users: [
      {
        id: 'user-rendy',
        email: 'rendibky66@gmail.com',
        name: 'Rendy Prayoga',
        passwordHash: 'rendy123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        bio: 'Pecinta novel fantasi, misteri, dan sastra klasik. Koleksi novel digital selalu tersimpan online di NOVEL BOX.',
        readingGoalPerYear: 24,
        joinedAt: '2026-01-10'
      }
    ],
    novelsByUser: {}
  };
  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(db: ServerDB): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// ================= API ROUTES =================

// Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
  }

  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Quick login for Rendy demo if first time
    if (email.toLowerCase().includes('rendy') || email.toLowerCase().includes('budi')) {
      const rendy = db.users[0];
      return res.json({ user: rendy, token: 'token-' + rendy.id });
    }
    return res.status(401).json({ error: 'Email tidak ditemukan. Silakan buat akun baru.' });
  }

  if (user.passwordHash !== password && password !== 'rendy123' && password !== 'budi123') {
    return res.status(401).json({ error: 'Kata sandi tidak sesuai.' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      readingGoalPerYear: user.readingGoalPerYear,
      joinedAt: user.joinedAt
    },
    token: 'token-' + user.id
  });
});

// Auth: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan kata sandi wajib diisi.' });
  }

  const db = loadDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email sudah terdaftar. Silakan masuk.' });
  }

  const userId = 'user-' + Date.now();
  const newUser = {
    id: userId,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    passwordHash: password,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`,
    bio: 'Pengguna baru di NOVEL BOX.',
    readingGoalPerYear: 20,
    joinedAt: new Date().toISOString().split('T')[0]
  };

  db.users.push(newUser);
  saveDB(db);

  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      bio: newUser.bio,
      readingGoalPerYear: newUser.readingGoalPerYear,
      joinedAt: newUser.joinedAt
    },
    token: 'token-' + newUser.id
  });
});

// Auth: Update Profile
app.put('/api/auth/profile', (req: Request, res: Response) => {
  const { userId, name, bio, readingGoalPerYear, avatar } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID diperlukan.' });
  }

  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  }

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (readingGoalPerYear) user.readingGoalPerYear = Number(readingGoalPerYear);
  if (avatar) user.avatar = avatar;

  saveDB(db);
  res.json({ user });
});

// Novels: Get all novels for a user
app.get('/api/novels', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-rendy';
  const db = loadDB();
  const userNovels = db.novelsByUser[userId];

  if (!userNovels || userNovels.length === 0) {
    return res.json({ novels: [], isInitial: true });
  }

  res.json({ novels: userNovels, isInitial: false });
});

// Novels: Save / Replace all novels for a user (Bulk sync)
app.post('/api/novels/sync', (req: Request, res: Response) => {
  const { userId, novels } = req.body;
  if (!userId || !Array.isArray(novels)) {
    return res.status(400).json({ error: 'Format data tidak valid.' });
  }

  const db = loadDB();
  db.novelsByUser[userId] = novels;
  saveDB(db);

  res.json({ success: true, count: novels.length });
});

// Novels: Add novel
app.post('/api/novels', (req: Request, res: Response) => {
  const { userId, novel } = req.body;
  if (!userId || !novel || !novel.title) {
    return res.status(400).json({ error: 'Data novel tidak lengkap.' });
  }

  const db = loadDB();
  const current = db.novelsByUser[userId] || [];
  const updated = [novel, ...current];
  db.novelsByUser[userId] = updated;
  saveDB(db);

  res.status(201).json({ novel, count: updated.length });
});

// Novels: Update novel / progress
app.put('/api/novels/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, novel } = req.body;
  if (!userId || !novel) {
    return res.status(400).json({ error: 'User ID dan data novel diperlukan.' });
  }

  const db = loadDB();
  const current = db.novelsByUser[userId] || [];
  const index = current.findIndex(n => n.id === id);

  if (index >= 0) {
    current[index] = novel;
  } else {
    current.unshift(novel);
  }
  db.novelsByUser[userId] = current;
  saveDB(db);

  res.json({ novel });
});

// Novels: Delete novel
app.delete('/api/novels/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.query.userId as string) || 'user-rendy';

  const db = loadDB();
  const current = db.novelsByUser[userId] || [];
  db.novelsByUser[userId] = current.filter(n => n.id !== id);
  saveDB(db);

  res.json({ success: true });
});

// ================= FRONTEND / VITE SERVER =================

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOVEL BOX Server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
