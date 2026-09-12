import request from 'supertest';
import { createApp } from '../src/app';
import { initDatabase, closeDatabase } from '../src/db';

const app = createApp();

beforeAll(async () => {
  await initDatabase();
});

afterAll(() => {
  closeDatabase();
});

describe('🔐 Authentication REST API Tests', () => {
  const testUser = {
    name: 'Jest Test Runner',
    email: `jest_auth_${Date.now()}@taskflow.dev`,
    password: 'password123',
  };

  let authToken = '';

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully and return 201 with JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.initials).toBe('JR');
      expect(res.body.token).toBeDefined();

      authToken = res.body.token;
    });

    it('should reject signup with duplicate email and return 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('should reject signup when password is shorter than 6 characters and return 400', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Short Pass User',
          email: `short_${Date.now()}@taskflow.dev`,
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/at least 6 characters/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate valid credentials and return 200 with JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.token).toBeDefined();
    });

    it('should reject incorrect password and return 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'incorrect_password',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/invalid email or password/i);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile when valid Bearer JWT is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    });

    it('should reject requests without token and return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/authentication required/i);
    });
  });
});
