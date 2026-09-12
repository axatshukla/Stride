import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database';
import { AppError } from '../middleware/errorHandler';
import { hashPassword, comparePassword, generateToken, extractInitials } from '../utils/auth';

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user account
 * @access  Public
 */
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('Full name is required.', 400);
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new AppError('A valid email address is required.', 400);
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new AppError('Password must be at least 6 characters in length.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const db = getDatabase();

    // 2. Check for duplicate email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    // 3. Hash password and generate user details
    const passwordHash = await hashPassword(password);
    const id = `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const initials = extractInitials(cleanName);
    const colorPalette = ['#4F46E5', '#D97706', '#059669', '#DC2626', '#2563EB', '#7C3AED'];
    const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    const now = new Date().toISOString();

    // 4. Insert user record
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, initials, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, cleanName, cleanEmail, passwordHash, initials, randomColor, now, now);

    // 5. Generate JWT token
    const token = generateToken({ userId: id, email: cleanEmail });

    const userPayload = {
      id,
      name: cleanName,
      email: cleanEmail,
      initials,
      color: randomColor,
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: userPayload,
      token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and issue JWT
 * @access  Public
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide both email and password.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDatabase();

    // 1. Fetch user by email
    const user = db
      .prepare('SELECT id, name, email, password_hash, initials, color FROM users WHERE email = ?')
      .get(cleanEmail) as
      | { id: string; name: string; email: string; password_hash: string; initials: string; color: string }
      | undefined;

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 2. Compare bcrypt password hash
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 3. Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials,
      color: user.color,
    };

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      user: userPayload,
      token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Fetch authenticated user's profile
 * @access  Private (Requires Bearer JWT)
 */
export function getMe(req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}

/**
 * @route   GET /api/auth/users
 * @desc    Get all workspace collaborators
 * @access  Private (Requires Bearer JWT)
 */
export function getAllUsers(_req: Request, res: Response): void {
  const db = getDatabase();
  const users = db
    .prepare('SELECT id, name, email, initials, color FROM users ORDER BY name ASC')
    .all();

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
}
