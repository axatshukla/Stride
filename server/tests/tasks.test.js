"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
const app = (0, app_1.createApp)();
beforeAll(() => {
    (0, db_1.initDatabase)();
});
afterAll(() => {
    (0, db_1.closeDatabase)();
});
describe('📋 Task Management CRUD & Filter REST API Tests', () => {
    let authToken = '';
    let createdTaskId = '';
    beforeAll(async () => {
        // Log in as seed admin user to get JWT
        const res = await (0, supertest_1.default)(app)
            .post('/api/auth/login')
            .send({
            email: 'akshat@taskflow.dev',
            password: 'password123',
        });
        authToken = res.body.token;
    });
    describe('GET /api/tasks (Authentication Guard)', () => {
        it('should reject unauthenticated access with 401 Unauthorized', async () => {
            const res = await (0, supertest_1.default)(app).get('/api/tasks');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
        it('should return 200 OK with list of tasks and joined assignee data when authenticated', async () => {
            const res = await (0, supertest_1.default)(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.tasks)).toBe(true);
            expect(res.body.tasks.length).toBeGreaterThan(0);
            expect(res.body.tasks[0]).toHaveProperty('key');
            expect(res.body.tasks[0]).toHaveProperty('title');
            expect(res.body.tasks[0]).toHaveProperty('status');
        });
    });
    describe('GET /api/tasks/stats', () => {
        it('should compute and return sprint statistics and completion rate', async () => {
            const res = await (0, supertest_1.default)(app)
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
                assignee_id: 'u1',
                dueDate: '2026-09-30T00:00:00Z',
                tags: ['testing', 'jest'],
            };
            const res = await (0, supertest_1.default)(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newTaskPayload);
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.task).toBeDefined();
            expect(res.body.task.title).toBe(newTaskPayload.title);
            expect(res.body.task.key).toMatch(/^TSK-\d+$/);
            expect(res.body.task.assignee.name).toBe('Akshat Shukla');
            createdTaskId = res.body.task.id;
        });
        it('should reject creation without a title and return 400 Bad Request', async () => {
            const res = await (0, supertest_1.default)(app)
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
            const res = await (0, supertest_1.default)(app)
                .get(`/api/tasks/${createdTaskId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.task.id).toBe(createdTaskId);
        });
        it('should return 404 Not Found for non-existent task ID', async () => {
            const res = await (0, supertest_1.default)(app)
                .get('/api/tasks/non_existent_id_9999')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
    describe('PUT /api/tasks/:id (Lifecycle Updates)', () => {
        it('should update task status and priority and return 200 OK', async () => {
            const res = await (0, supertest_1.default)(app)
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
            const res = await (0, supertest_1.default)(app)
                .delete(`/api/tasks/${createdTaskId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
        it('should return 404 Not Found on subsequent fetch of deleted task', async () => {
            const res = await (0, supertest_1.default)(app)
                .get(`/api/tasks/${createdTaskId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(404);
        });
    });
});
