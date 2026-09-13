import { Request, Response, NextFunction } from 'express';
import { dbRepo } from '../db/database';
import { AppError } from '../middleware/errorHandler';
import { hashPassword, comparePassword, generateToken, extractInitials } from '../utils/auth';

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user account
 * @access  Public
 */
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, inviteToken } = req.body;

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

    // 2. Check for duplicate email
    const existing = await dbRepo.findUserByEmail(cleanEmail);
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
    await dbRepo.createUser({
      id,
      name: cleanName,
      email: cleanEmail,
      password_hash: passwordHash,
      initials,
      color: randomColor,
      created_at: now,
      updated_at: now,
    });

    // 5. Create default workspace team for user
    const defaultTeamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const defaultTeamName = `${cleanName.split(' ')[0]}'s Workspace`;
    const defaultSlug = defaultTeamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await dbRepo.createTeam({
      id: defaultTeamId,
      name: defaultTeamName,
      slug: defaultSlug,
      created_by: id,
      created_at: now,
      updated_at: now,
    });

    // 6. If signing up via invite link, auto-accept invitation
    if (inviteToken && typeof inviteToken === 'string') {
      try {
        await dbRepo.acceptInvitation(inviteToken, id);
      } catch (e) {
        console.error('Failed to auto-accept invite token on signup:', e);
      }
    }

    const teams = await dbRepo.getUserTeams(id);

    // 7. Generate JWT token
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
      teams,
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

    // 1. Fetch user by email
    const user = await dbRepo.findUserByEmail(cleanEmail);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 2. Compare bcrypt password hash
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 3. Ensure user has at least one team
    let teams = await dbRepo.getUserTeams(user.id);
    if (teams.length === 0) {
      const defaultTeamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const defaultTeamName = `${user.name.split(' ')[0]}'s Workspace`;
      const defaultSlug = defaultTeamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const now = new Date().toISOString();

      await dbRepo.createTeam({
        id: defaultTeamId,
        name: defaultTeamName,
        slug: defaultSlug,
        created_by: user.id,
        created_at: now,
        updated_at: now,
      });

      teams = await dbRepo.getUserTeams(user.id);
    }

    // 4. Generate JWT token
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
      teams,
      token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Fetch authenticated user's profile and active teams
 * @access  Private (Requires Bearer JWT)
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teams = await dbRepo.getUserTeams(req.user!.id);
    res.status(200).json({
      success: true,
      user: req.user,
      teams,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/auth/users
 * @desc    Get all workspace collaborators
 * @access  Private (Requires Bearer JWT)
 */
export async function getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await dbRepo.getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        initials: u.initials,
        color: u.color,
      })),
    });
  } catch (err) {
    next(err);
  }
}
