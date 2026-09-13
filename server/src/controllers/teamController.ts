// ============================================================
// Team Controller — Multi-Tenant Workspaces, Roles & Email Invites
// ============================================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { dbRepo } from '../db/database';
import { AppError } from '../middleware/errorHandler';
import { sendTeamInviteEmail } from '../services/emailService';

/**
 * @route   GET /api/teams
 * @desc    Get all teams for the authenticated user
 * @access  Private
 */
export async function getUserTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    let teams = await dbRepo.getUserTeams(userId);

    // If user has no teams yet (e.g. legacy account), create a personal default workspace for them
    if (teams.length === 0) {
      const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const teamName = `${req.user!.name.split(' ')[0]}'s Workspace`;
      const slug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const now = new Date().toISOString();

      await dbRepo.createTeam({
        id: teamId,
        name: teamName,
        slug,
        created_by: userId,
        created_at: now,
        updated_at: now,
      });

      teams = await dbRepo.getUserTeams(userId);
    }

    res.status(200).json({
      success: true,
      teams,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/teams
 * @desc    Create a new team workspace
 * @access  Private
 */
export async function createTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new AppError('Team name is required.', 400);
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const team = await dbRepo.createTeam({
      id: teamId,
      name: cleanName,
      slug,
      created_by: userId,
      created_at: now,
      updated_at: now,
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully.',
      team: {
        ...team,
        role: 'owner',
        member_count: 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/teams/:id/members
 * @desc    Get members of a team
 * @access  Private (Must be member of team)
 */
export async function getTeamMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const teamId = req.params.id as string;

    const isMember = await dbRepo.isUserInTeam(teamId, userId);
    if (!isMember) {
      throw new AppError('You do not have access to this workspace team.', 403);
    }

    const members = await dbRepo.getTeamMembers(teamId);

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/teams/:id/invite
 * @desc    Send an email invitation to collaborate on a team
 * @access  Private
 */
export async function inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const teamId = req.params.id as string;
    const { email, role = 'member' } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new AppError('A valid email address is required for invitation.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify inviter is in team
    const isMember = await dbRepo.isUserInTeam(teamId, userId);
    if (!isMember) {
      throw new AppError('You are not authorized to invite members to this workspace.', 403);
    }

    // 2. Fetch team details
    const team = await dbRepo.getTeamById(teamId);
    if (!team) {
      throw new AppError('Workspace team not found.', 404);
    }

    // 3. Check if invitee is already in team
    const members = await dbRepo.getTeamMembers(teamId);
    const existingMember = members.find(m => m.email?.toLowerCase() === cleanEmail);
    if (existingMember) {
      throw new AppError(`User ${cleanEmail} is already a member of this team.`, 409);
    }

    // 4. Generate secure invitation token
    const token = crypto.randomBytes(24).toString('hex');
    const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await dbRepo.createInvitation({
      id: inviteId,
      team_id: teamId,
      email: cleanEmail,
      role: role === 'admin' ? 'admin' : 'member',
      token,
      status: 'pending',
      created_by: userId,
      created_at: now,
      expires_at: expiresAt,
    });

    // 5. Dispatch real email with fixed HTML template
    const emailResult = await sendTeamInviteEmail({
      toEmail: cleanEmail,
      inviterName: req.user!.name,
      inviterEmail: req.user!.email,
      teamName: team.name,
      inviteToken: token,
      role,
    });

    res.status(200).json({
      success: true,
      emailSent: emailResult.success,
      emailError: emailResult.error,
      message: emailResult.success
        ? `Invitation email sent to ${cleanEmail}.`
        : `Invitation created, but email could not be delivered: ${emailResult.error || 'Check email configuration.'}`,
      inviteUrl: emailResult.inviteUrl,
      simulated: emailResult.simulated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/teams/:id/invitations
 * @desc    Get pending invitations for team
 * @access  Private
 */
export async function getPendingInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const teamId = req.params.id as string;

    const isMember = await dbRepo.isUserInTeam(teamId, userId);
    if (!isMember) {
      throw new AppError('Access denied.', 403);
    }

    const invitations = await dbRepo.getPendingInvitations(teamId);

    res.status(200).json({
      success: true,
      invitations,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/teams/invite/:token
 * @desc    View invitation details
 * @access  Public
 */
export async function getInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.params.token as string;
    const inv = await dbRepo.getInvitationByToken(token);

    if (!inv) {
      throw new AppError('Invitation not found or invalid.', 404);
    }

    if (inv.status !== 'pending') {
      throw new AppError(`This invitation has already been ${inv.status}.`, 410);
    }

    if (new Date(inv.expires_at).getTime() < Date.now()) {
      throw new AppError('This invitation link has expired.', 410);
    }

    res.status(200).json({
      success: true,
      invitation: {
        email: inv.email,
        team_id: inv.team_id,
        team_name: inv.team_name,
        inviter_name: inv.inviter_name,
        role: inv.role,
        expires_at: inv.expires_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/teams/invite/:token/accept
 * @desc    Accept invitation and join team
 * @access  Private
 */
export async function acceptInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const token = req.params.token as string;

    const result = await dbRepo.acceptInvitation(token, userId);
    if (!result) {
      throw new AppError('Unable to accept invitation. It may be invalid, expired, or already used.', 400);
    }

    const team = await dbRepo.getTeamById(result.team_id);

    res.status(200).json({
      success: true,
      message: `You have successfully joined ${team?.name || 'the team'}.`,
      team,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   DELETE /api/teams/:id/members/:userId
 * @desc    Remove member from team
 * @access  Private
 */
export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const callerId = req.user!.id;
    const teamId = req.params.id as string;
    const targetUserId = req.params.userId as string;

    const callerRole = await dbRepo.getUserRoleInTeam(teamId, callerId);
    if (!callerRole) {
      throw new AppError('Access denied.', 403);
    }

    // Only owner/admin or self-leaving can remove
    if (callerId !== targetUserId && callerRole !== 'owner' && callerRole !== 'admin') {
      throw new AppError('Only team owners or administrators can remove members.', 403);
    }

    await dbRepo.removeTeamMember(teamId, targetUserId);

    res.status(200).json({
      success: true,
      message: 'Member removed from team.',
    });
  } catch (err) {
    next(err);
  }
}
