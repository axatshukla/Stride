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

describe('📋 Task Management CRUD & Filter REST API Tests', () => {
  let authToken = '';
  let userId = '';
  let createdTaskId = '';

  beforeAll(async () => {
    // Register test user dynamically
    const testEmail = `test_runner_${Date.now()}@taskflow.dev`;
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test Engineer',
        email: testEmail,
        password: 'password123',
      });
    authToken = res.body.token;
    userId = res.body.user.id;
  });

  describe('GET /api/tasks (Authentication Guard)', () => {
    it('should reject unauthenticated access with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 OK with list of tasks when authenticated', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.tasks)).toBe(true);
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('should compute and return sprint statistics and completion rate', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toHaveProperty('total');
      expect(res.body.stats).toHaveProperty('completionRate');
      expect(res.body.stats).toHaveProperty('inProgress');
      expect(res.body.stats).toHaveProperty('done');
    });
  });

  describe('POST /api/tasks (Creation & Validation)', () => {
    it('should create a new task, assign auto-incremented key, and return 201 Created', async () => {
      const newTaskPayload = {
        title: 'Jest Automated Unit Test Task',
        description: 'Verify end-to-end task creation via Supertest',
        status: 'todo',
        priority: 'high',
        assignee_id: userId,
        dueDate: '2026-09-30T00:00:00Z',
        tags: ['testing', 'jest'],
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTaskPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.task).toBeDefined();
      expect(res.body.task.title).toBe(newTaskPayload.title);
      expect(res.body.task.key).toMatch(/^TSK-\d+$/);
      expect(res.body.task.assignee.name).toBe('Test Engineer');

      createdTaskId = res.body.task.id;
    });

    it('should reject creation without a title and return 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Task without title',
          status: 'todo',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/title is required/i);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should retrieve a task by its ID', async () => {
      const res = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.task.id).toBe(createdTaskId);
    });

    it('should return 404 Not Found for non-existent task ID', async () => {
      const res = await request(app)
        .get('/api/tasks/non_existent_id_9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id (Lifecycle Updates)', () => {
    it('should update task status and priority and return 200 OK', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'in-progress',
          priority: 'medium',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.task.status).toBe('in-progress');
      expect(res.body.task.priority).toBe('medium');
    });
  });

  describe('DELETE /api/tasks/:id (Deletion & Persistence)', () => {
    it('should delete a task by ID and return 200 OK', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 Not Found on subsequent fetch of deleted task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
