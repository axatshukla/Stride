import { Request, Response, NextFunction } from 'express';
import { dbRepo, TaskDbRecord } from '../db/database';
import { AppError } from '../middleware/errorHandler';

/** Formats database row into client-friendly Task object */
function formatTask(row: TaskDbRecord) {
  let parsedTags: string[] = [];
  try {
    parsedTags = typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (Array.isArray(row.tags) ? row.tags : []);
  } catch {
    parsedTags = [];
  }

  return {
    id: row.id,
    key: row.key,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    assignee: row.assignee_id
      ? {
          id: row.assignee_id,
          name: row.assignee_name || '',
          email: row.assignee_email || '',
          initials: row.assignee_initials || '',
          color: row.assignee_color || '#4F46E5',
        }
      : null,
    createdBy: {
      id: row.created_by,
      name: row.creator_name || 'Admin',
      email: row.creator_email || '',
      initials: row.creator_initials || 'AD',
      color: row.creator_color || '#4F46E5',
    },
    dueDate: row.due_date,
    tags: parsedTags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @route   GET /api/tasks
 * @desc    Fetch tasks with optional search, status/priority filters, and sorting
 * @access  Private (Requires Bearer JWT)
 */
export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, priority, search, sortBy } = req.query;

    const rows = await dbRepo.getTasks({
      status: status as string,
      priority: priority as string,
      search: search as string,
      sortBy: sortBy as string,
    });

    const tasks = rows.map(formatTask);

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/tasks/stats
 * @desc    Compute dashboard task statistics
 * @access  Private (Requires Bearer JWT)
 */
export async function getTaskStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await dbRepo.getTaskStatsSummary();

    const total = rows.length;
    const todo = rows.filter(r => r.status === 'todo').length;
    const inProgress = rows.filter(r => r.status === 'in-progress').length;
    const done = rows.filter(r => r.status === 'done').length;
    const highPriority = rows.filter(r => r.priority === 'high').length;
    const mediumPriority = rows.filter(r => r.priority === 'medium').length;
    const lowPriority = rows.filter(r => r.priority === 'low').length;

    const now = new Date();
    const overdue = rows.filter(r => {
      if (!r.due_date || r.status === 'done') return false;
      return new Date(r.due_date) < now;
    }).length;

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        total,
        todo,
        inProgress,
        done,
        highPriority,
        mediumPriority,
        lowPriority,
        overdue,
        completionRate,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task details by ID or Key
 * @access  Private
 */
export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const row = await dbRepo.getTaskById(id);

    if (!row) {
      throw new AppError(`Task not found with ID or key: ${id}`, 404);
    }

    res.status(200).json({
      success: true,
      task: formatTask(row),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, status, priority, assignee_id, dueDate, tags } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new AppError('Task title is required.', 400);
    }

    const cleanStatus = status && ['todo', 'in-progress', 'done'].includes(status) ? status : 'todo';
    const cleanPriority = priority && ['high', 'medium', 'low'].includes(priority) ? priority : 'medium';
    const cleanTags = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]);
    const cleanDueDate = dueDate ? new Date(dueDate).toISOString() : null;

    // Generate sequence key e.g. TSK-1
    const totalCount = await dbRepo.getTaskCount();
    const nextKeyNum = totalCount + 1;
    const key = `TSK-${nextKeyNum}`;
    const id = `t_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const createdBy = req.user!.id;

    let cleanAssigneeId = null;
    if (assignee_id) {
      const userExists = await dbRepo.findUserById(assignee_id);
      if (userExists) {
        cleanAssigneeId = assignee_id;
      }
    }

    const newRow = await dbRepo.createTask({
      id,
      key,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: cleanStatus,
      priority: cleanPriority,
      assignee_id: cleanAssigneeId,
      created_by: createdBy,
      due_date: cleanDueDate,
      tags: cleanTags,
      created_at: now,
      updated_at: now,
    });

    if (!newRow) {
      throw new AppError('Failed to create task record.', 500);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: formatTask(newRow),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details or status transition
 * @access  Private
 */
export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = await dbRepo.getTaskById(id);
    if (!existing) {
      throw new AppError(`Task with ID ${id} was not found.`, 404);
    }

    const { title, description, status, priority, assignee_id, dueDate, tags } = req.body;

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDesc = description !== undefined ? description.trim() : (existing.description || '');
    const updatedStatus = status && ['todo', 'in-progress', 'done'].includes(status) ? status : existing.status;
    const updatedPriority = priority && ['high', 'medium', 'low'].includes(priority) ? priority : existing.priority;
    const updatedDueDate = dueDate !== undefined ? (dueDate ? new Date(dueDate).toISOString() : null) : existing.due_date;
    const updatedTags = tags !== undefined ? (Array.isArray(tags) ? JSON.stringify(tags) : String(tags)) : existing.tags;
    const updatedAssignee = assignee_id !== undefined ? (assignee_id || null) : existing.assignee_id;
    const now = new Date().toISOString();

    const updatedRow = await dbRepo.updateTask(id, {
      title: updatedTitle,
      description: updatedDesc,
      status: updatedStatus,
      priority: updatedPriority,
      assignee_id: updatedAssignee,
      due_date: updatedDueDate,
      tags: updatedTags,
      updated_at: now,
    });

    if (!updatedRow) {
      throw new AppError('Failed to update task record.', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: formatTask(updatedRow),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete single task
 * @access  Private
 */
export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = await dbRepo.getTaskById(id);
    if (!existing) {
      throw new AppError(`Task with ID ${id} was not found.`, 404);
    }

    await dbRepo.deleteTask(id);

    res.status(200).json({
      success: true,
      message: `Task ${existing.key} deleted successfully.`,
      id,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/tasks/bulk-delete
 * @desc    Batch delete multiple tasks by ID
 * @access  Private
 */
export async function bulkDeleteTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('An array of task IDs is required for bulk deletion.', 400);
    }

    const deletedCount = await dbRepo.bulkDeleteTasks(ids);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} tasks.`,
      count: deletedCount,
    });
  } catch (err) {
    next(err);
  }
}
