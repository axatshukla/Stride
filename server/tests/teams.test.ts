import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('👥 Multi-Tenant Team Workspaces & Email Invitation API Tests', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let createdTeamId: string;
  let generatedInviteToken: string;

  beforeAll(async () => {
    // 1. Register User 1 (Team Creator / Owner)
    const user1Res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Alex Rivera',
        email: `alex_${Date.now()}@example.com`,
        password: 'password123',
      });
    user1Token = user1Res.body.token;
    user1Id = user1Res.body.user.id;

    // 2. Register User 2 (Invitee)
    const user2Res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Jordan Lee',
        email: `jordan_${Date.now()}@example.com`,
        password: 'password123',
      });
    user2Token = user2Res.body.token;
    user2Id = user2Res.body.user.id;
  });

  describe('POST /api/teams (Team Creation)', () => {
    it('should create a new team workspace and assign user as owner', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Acme Mobile App' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.team).toBeDefined();
      expect(res.body.team.name).toBe('Acme Mobile App');
      expect(res.body.team.role).toBe('owner');

      createdTeamId = res.body.team.id;
    });

    it('should reject team creation without a name', async () => {
      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/teams (User Teams Listing)', () => {
    it('should list all teams the user belongs to', async () => {
      const res = await request(app)
        .get('/api/teams')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.teams)).toBe(true);
      expect(res.body.teams.some((t: any) => t.id === createdTeamId)).toBe(true);
    });
  });

  describe('POST /api/teams/:id/invite (Email Invitation)', () => {
    it('should generate an invitation with secure token and dispatch email', async () => {
      const inviteeEmail = `colleague_${Date.now()}@testcompany.com`;
      const res = await request(app)
        .post(`/api/teams/${createdTeamId}/invite`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          email: inviteeEmail,
          role: 'member',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.inviteUrl).toContain('/join?token=');

      // Extract token from inviteUrl
      const tokenMatch = res.body.inviteUrl.match(/token=([a-f0-9]+)/);
      expect(tokenMatch).toBeTruthy();
      generatedInviteToken = tokenMatch[1];
    });

    it('should reject invitation if sender is not a member of the team', async () => {
      const res = await request(app)
        .post(`/api/teams/${createdTeamId}/invite`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          email: 'random@test.com',
          role: 'member',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/teams/invite/:token (Public Invitation Inspection)', () => {
    it('should return team invitation details by token', async () => {
      const res = await request(app)
        .get(`/api/teams/invite/${generatedInviteToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.invitation.team_name).toBe('Acme Mobile App');
      expect(res.body.invitation.inviter_name).toBe('Alex Rivera');
    });
  });

  describe('POST /api/teams/invite/:token/accept (Accepting Invitation)', () => {
    it('should allow authenticated User 2 to accept invitation and join the team', async () => {
      const res = await request(app)
        .post(`/api/teams/invite/${generatedInviteToken}/accept`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify User 2 now sees the team in their teams list
      const teamsRes = await request(app)
        .get('/api/teams')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(teamsRes.body.teams.some((t: any) => t.id === createdTeamId)).toBe(true);
    });

    it('should reject accepting the same token again', async () => {
      const res = await request(app)
        .post(`/api/teams/invite/${generatedInviteToken}/accept`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(400);
    });
  });

  describe('Team Data Isolation', () => {
    it('should create tasks scoped to specific team and filter accordingly', async () => {
      // Create task in Acme Mobile App team
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .set('x-team-id', createdTeamId)
        .send({
          title: 'Build iOS Navigation bar',
          status: 'todo',
          priority: 'high',
        });

      expect(taskRes.status).toBe(201);

      // User 2 (who is in Acme Mobile App) can query tasks in createdTeamId
      const user2TeamTasks = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${user2Token}`)
        .set('x-team-id', createdTeamId);

      expect(user2TeamTasks.body.tasks.some((t: any) => t.title === 'Build iOS Navigation bar')).toBe(true);
    });
  });
});
