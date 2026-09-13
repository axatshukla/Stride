// ============================================================
// Team Routes
// ============================================================

import { Router } from 'express';
import {
  getUserTeams,
  createTeam,
  getTeamMembers,
  inviteMember,
  getPendingInvitations,
  getInvitation,
  acceptInvitation,
  removeMember,
} from '../controllers/teamController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Public invitation check
router.get('/invite/:token', getInvitation);

// Authenticated team operations
router.use(requireAuth);

router.get('/', getUserTeams);
router.post('/', createTeam);
router.get('/:id/members', getTeamMembers);
router.post('/:id/invite', inviteMember);
router.get('/:id/invitations', getPendingInvitations);
router.post('/invite/:token/accept', acceptInvitation);
router.delete('/:id/members/:userId', removeMember);

export default router;
