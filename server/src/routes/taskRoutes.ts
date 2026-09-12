import { Router } from 'express';
import {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
} from '../controllers/taskController';
import { requireAuth } from '../middleware/authMiddleware';

export const taskRouter = Router();

// All task endpoints are protected by JWT authentication middleware
taskRouter.use(requireAuth);

taskRouter.get('/', getTasks);
taskRouter.get('/stats', getTaskStats);
taskRouter.get('/:id', getTaskById);
taskRouter.post('/', createTask);
taskRouter.put('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
taskRouter.post('/bulk-delete', bulkDeleteTasks);
