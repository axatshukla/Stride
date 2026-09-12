import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../db/database';
import { AppError } from '../middleware/errorHandler';

interface DbTaskRow {
  id: string;
  key: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  tags: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  assignee_name?: string | null;
  assignee_email?: string | null;
  assignee_initials?: string | null;
  assignee_color?: string | null;
  creator_name?: string;
  creator_email?: string;
  creator_initials?: string;
  creator_color?: string;
}

/** Formats database row into client-friendly Task object */
function formatTask(row: DbTaskRow) {
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
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @route   GET /api/tasks
 * @desc    Fetch tasks with optional search, status/priority filters, and sorting
 * @access  Private (Requires Bearer JWT)
 */
export function getTasks(req: Request, res: Response, next: NextFunction): void {
  try {
    const db = getDatabase();
    const { status, priority, search, sortBy } = req.query;

    let sql = `
      SELECT 
        t.*,
        u_assignee.name as assignee_name,
        u_assignee.email as assignee_email,
        u_assignee.initials as assignee_initials,
        u_assignee.color as assignee_color,
        u_creator.name as creator_name,
        u_creator.email as creator_email,
        u_creator.initials as creator_initials,
        u_creator.color as creator_color
      FROM tasks t
      LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
      LEFT JOIN users u_creator ON t.created_by = u_creator.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filter by Status
    if (status && status !== 'all') {
      sql += ` AND t.status = ?`;
      params.push(status);
    }

    // Filter by Priority
    if (priority && priority !== 'all') {
      sql += ` AND t.priority = ?`;
      params.push(priority);
    }

    // Search Query across title, key, description, or assignee name
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(t.title) LIKE ? OR 
        LOWER(t.key) LIKE ? OR 
        LOWER(t.description) LIKE ? OR
        LOWER(u_assignee.name) LIKE ?
      )`;
      params.push(q, q, q, q);
    }

    // Sorting Order
    switch (sortBy) {
      case 'oldest':
        sql += ` ORDER BY datetime(t.created_at) ASC`;
        break;
      case 'priority':
        sql += ` ORDER BY CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ASC`;
        break;
      case 'due-date':
        sql += ` ORDER BY CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, datetime(t.due_date) ASC`;
        break;
      case 'title':
        sql += ` ORDER BY LOWER(t.title) ASC`;
        break;
      case 'newest':
      default:
        sql += ` ORDER BY datetime(t.created_at) DESC`;
        break;
    }

    const rows = db.prepare(sql).all(...params) as DbTaskRow[];
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
export function getTaskStats(_req: Request, res: Response, next: NextFunction): void {
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT status, priority, due_date FROM tasks').all() as {
      status: string;
      priority: string;
      due_date: string | null;
    }[];

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
export function getTaskById(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const row = db.prepare(`
      SELECT 
        t.*,
        u_assignee.name as assignee_name,
        u_assignee.email as assignee_email,
        u_assignee.initials as assignee_initials,
        u_assignee.color as assignee_color,
        u_creator.name as creator_name,
        u_creator.email as creator_email,
        u_creator.initials as creator_initials,
        u_creator.color as creator_color
      FROM tasks t
      LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
      LEFT JOIN users u_creator ON t.created_by = u_creator.id
      WHERE t.id = ? OR t.key = ?
    `).get(id, id) as DbTaskRow | undefined;

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
export function createTask(req: Request, res: Response, next: NextFunction): void {
  try {
    const { title, description, status, priority, assignee_id, dueDate, tags } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new AppError('Task title is required.', 400);
    }

    const cleanStatus = status && ['todo', 'in-progress', 'done'].includes(status) ? status : 'todo';
    const cleanPriority = priority && ['high', 'medium', 'low'].includes(priority) ? priority : 'medium';
    const cleanTags = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]);
    const cleanDueDate = dueDate ? new Date(dueDate).toISOString() : null;

    const db = getDatabase();

    // Generate next sequence key e.g. TSK-16
    const countRow = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
    const nextKeyNum = countRow.count + 1;
    const key = `TSK-${nextKeyNum}`;
    const id = `t_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const createdBy = req.user!.id;

    // Verify assignee exists if provided
    let cleanAssigneeId = null;
    if (assignee_id) {
      const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(assignee_id);
      if (userExists) {
        cleanAssigneeId = assignee_id;
      }
    }

    db.prepare(`
      INSERT INTO tasks (id, key, title, description, status, priority, assignee_id, created_by, due_date, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      key,
      title.trim(),
      description ? description.trim() : '',
      cleanStatus,
      cleanPriority,
      cleanAssigneeId,
      createdBy,
      cleanDueDate,
      cleanTags,
      now,
      now
    );

    // Fetch newly created task with joins
    const newRow = db.prepare(`
      SELECT 
        t.*,
        u_assignee.name as assignee_name,
        u_assignee.email as assignee_email,
        u_assignee.initials as assignee_initials,
        u_assignee.color as assignee_color,
        u_creator.name as creator_name,
        u_creator.email as creator_email,
        u_creator.initials as creator_initials,
        u_creator.color as creator_color
      FROM tasks t
      LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
      LEFT JOIN users u_creator ON t.created_by = u_creator.id
      WHERE t.id = ?
    `).get(id) as DbTaskRow;

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
export function updateTask(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as DbTaskRow | undefined;
    if (!existing) {
      throw new AppError(`Task with ID ${id} was not found.`, 404);
    }

    const { title, description, status, priority, assignee_id, dueDate, tags } = req.body;

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDesc = description !== undefined ? description.trim() : existing.description;
    const updatedStatus = status && ['todo', 'in-progress', 'done'].includes(status) ? status : existing.status;
    const updatedPriority = priority && ['high', 'medium', 'low'].includes(priority) ? priority : existing.priority;
    const updatedDueDate = dueDate !== undefined ? (dueDate ? new Date(dueDate).toISOString() : null) : existing.due_date;
    const updatedTags = tags !== undefined ? JSON.stringify(tags) : existing.tags;
    const updatedAssignee = assignee_id !== undefined ? (assignee_id || null) : existing.assignee_id;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, assignee_id = ?, due_date = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updatedTitle,
      updatedDesc,
      updatedStatus,
      updatedPriority,
      updatedAssignee,
      updatedDueDate,
      updatedTags,
      now,
      id
    );

    const updatedRow = db.prepare(`
      SELECT 
        t.*,
        u_assignee.name as assignee_name,
        u_assignee.email as assignee_email,
        u_assignee.initials as assignee_initials,
        u_assignee.color as assignee_color,
        u_creator.name as creator_name,
        u_creator.email as creator_email,
        u_creator.initials as creator_initials,
        u_creator.color as creator_color
      FROM tasks t
      LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
      LEFT JOIN users u_creator ON t.created_by = u_creator.id
      WHERE t.id = ?
    `).get(id) as DbTaskRow;

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
export function deleteTask(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT id, key FROM tasks WHERE id = ?').get(id) as { id: string; key: string } | undefined;
    if (!existing) {
      throw new AppError(`Task with ID ${id} was not found.`, 404);
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

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
export function bulkDeleteTasks(req: Request, res: Response, next: NextFunction): void {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('An array of task IDs is required for bulk deletion.', 400);
    }

    const db = getDatabase();
    const deleteTx = db.transaction(() => {
      const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
      let count = 0;
      for (const id of ids) {
        const result = stmt.run(id);
        count += result.changes;
      }
      return count;
    });

    const deletedCount = deleteTx();

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} tasks.`,
      count: deletedCount,
    });
  } catch (err) {
    next(err);
  }
}
