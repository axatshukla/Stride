// ============================================================
// Dual Database Driver — Neon Serverless Postgres & Local SQLite
// ============================================================

import Database, { Database as SqliteDatabaseType } from 'better-sqlite3';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

export interface UserDbRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  initials: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface TaskDbRecord {
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
  assignee_name?: string | null;
  assignee_email?: string | null;
  assignee_initials?: string | null;
  assignee_color?: string | null;
  creator_name?: string;
  creator_email?: string;
  creator_initials?: string;
  creator_color?: string;
}

let sqliteInstance: SqliteDatabaseType | null = null;
let neonSqlInstance: NeonQueryFunction<false, false> | null = null;

export const isPostgres = Boolean(env.DATABASE_URL);

/** Get SQLite instance for local fallback */
export function getSqliteDatabase(): SqliteDatabaseType {
  if (sqliteInstance) return sqliteInstance;

  const dbDir = path.dirname(path.resolve(process.cwd(), env.DB_PATH));
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbFilePath = path.resolve(process.cwd(), env.DB_PATH);
  sqliteInstance = new Database(dbFilePath);
  sqliteInstance.pragma('journal_mode = WAL');
  sqliteInstance.pragma('foreign_keys = ON');
  return sqliteInstance;
}

/** Get Neon Postgres instance for production/cloud */
export function getNeonSql(): NeonQueryFunction<false, false> {
  if (!neonSqlInstance) {
    neonSqlInstance = neon(env.DATABASE_URL);
  }
  return neonSqlInstance;
}

/** General getDatabase for SQLite backwards compatibility */
export function getDatabase(): SqliteDatabaseType {
  return getSqliteDatabase();
}

/** Close active database connection cleanly */
export function closeDatabase(): void {
  if (sqliteInstance) {
    sqliteInstance.close();
    sqliteInstance = null;
  }
}

/**
 * Unified Database Repository — seamless async API for both Postgres & SQLite
 */
export const dbRepo = {
  async findUserByEmail(email: string): Promise<UserDbRecord | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`) as UserDbRecord[];
      return rows[0] || null;
    } else {
      const db = getSqliteDatabase();
      const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserDbRecord | undefined;
      return row || null;
    }
  },

  async findUserById(id: string): Promise<UserDbRecord | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`) as UserDbRecord[];
      return rows[0] || null;
    } else {
      const db = getSqliteDatabase();
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserDbRecord | undefined;
      return row || null;
    }
  },

  async createUser(user: UserDbRecord): Promise<void> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`
        INSERT INTO users (id, name, email, password_hash, initials, color, created_at, updated_at)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password_hash}, ${user.initials}, ${user.color}, ${user.created_at}, ${user.updated_at})
      `;
    } else {
      const db = getSqliteDatabase();
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, initials, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(user.id, user.name, user.email, user.password_hash, user.initials, user.color, user.created_at, user.updated_at);
    }
  },

  async getAllUsers(): Promise<UserDbRecord[]> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`SELECT id, name, email, initials, color, created_at, updated_at FROM users ORDER BY name ASC`) as UserDbRecord[];
      return rows;
    } else {
      const db = getSqliteDatabase();
      return db.prepare('SELECT id, name, email, initials, color, created_at, updated_at FROM users ORDER BY name ASC').all() as UserDbRecord[];
    }
  },

  async getUserCount(): Promise<number> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`SELECT COUNT(*)::int as count FROM users`) as { count: number }[];
      return Number(rows[0]?.count || 0);
    } else {
      const db = getSqliteDatabase();
      const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      return row?.count || 0;
    }
  },

  async getTaskCount(): Promise<number> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`SELECT COUNT(*)::int as count FROM tasks`) as { count: number }[];
      return Number(rows[0]?.count || 0);
    } else {
      const db = getSqliteDatabase();
      const row = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
      return row?.count || 0;
    }
  },

  async getTasks(filters: { status?: string; priority?: string; search?: string; sortBy?: string }): Promise<TaskDbRecord[]> {
    if (isPostgres) {
      const sql = getNeonSql();
      // Using standard query for dynamic filtering
      const rows = (await sql`
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
        ORDER BY t.created_at DESC
      `) as TaskDbRecord[];

      let filtered = rows;
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(t => t.status === filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        filtered = filtered.filter(t => t.priority === filters.priority);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.assignee_name || '').toLowerCase().includes(q)
        );
      }

      if (filters.sortBy === 'oldest') {
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else if (filters.sortBy === 'priority') {
        const p: Record<string, number> = { high: 1, medium: 2, low: 3 };
        filtered.sort((a, b) => (p[a.priority] || 2) - (p[b.priority] || 2));
      } else if (filters.sortBy === 'due-date') {
        filtered.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
      } else if (filters.sortBy === 'title') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      return filtered;
    } else {
      const db = getSqliteDatabase();
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
      if (filters.status && filters.status !== 'all') {
        sql += ` AND t.status = ?`;
        params.push(filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        sql += ` AND t.priority = ?`;
        params.push(filters.priority);
      }
      if (filters.search) {
        const q = `%${filters.search.trim().toLowerCase()}%`;
        sql += ` AND (LOWER(t.title) LIKE ? OR LOWER(t.key) LIKE ? OR LOWER(t.description) LIKE ? OR LOWER(u_assignee.name) LIKE ?)`;
        params.push(q, q, q, q);
      }

      switch (filters.sortBy) {
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
      return db.prepare(sql).all(...params) as TaskDbRecord[];
    }
  },

  async getTaskStatsSummary(): Promise<{ status: string; priority: string; due_date: string | null }[]> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`SELECT status, priority, due_date FROM tasks`) as { status: string; priority: string; due_date: string | null }[];
      return rows;
    } else {
      const db = getSqliteDatabase();
      return db.prepare('SELECT status, priority, due_date FROM tasks').all() as { status: string; priority: string; due_date: string | null }[];
    }
  },

  async getTaskById(id: string): Promise<TaskDbRecord | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`
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
        WHERE t.id = ${id} OR t.key = ${id}
        LIMIT 1
      `) as TaskDbRecord[];
      return rows[0] || null;
    } else {
      const db = getSqliteDatabase();
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
      `).get(id, id) as TaskDbRecord | undefined;
      return row || null;
    }
  },

  async createTask(task: {
    id: string;
    key: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee_id: string | null;
    created_by: string;
    due_date: string | null;
    tags: string;
    created_at: string;
    updated_at: string;
  }): Promise<TaskDbRecord | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`
        INSERT INTO tasks (id, key, title, description, status, priority, assignee_id, created_by, due_date, tags, created_at, updated_at)
        VALUES (${task.id}, ${task.key}, ${task.title}, ${task.description}, ${task.status}, ${task.priority}, ${task.assignee_id}, ${task.created_by}, ${task.due_date}, ${task.tags}, ${task.created_at}, ${task.updated_at})
      `;
      return this.getTaskById(task.id);
    } else {
      const db = getSqliteDatabase();
      db.prepare(`
        INSERT INTO tasks (id, key, title, description, status, priority, assignee_id, created_by, due_date, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        task.id,
        task.key,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.assignee_id,
        task.created_by,
        task.due_date,
        task.tags,
        task.created_at,
        task.updated_at
      );
      return this.getTaskById(task.id);
    }
  },

  async updateTask(
    id: string,
    data: {
      title: string;
      description: string;
      status: string;
      priority: string;
      assignee_id: string | null;
      due_date: string | null;
      tags: string;
      updated_at: string;
    }
  ): Promise<TaskDbRecord | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`
        UPDATE tasks
        SET title = ${data.title}, description = ${data.description}, status = ${data.status}, priority = ${data.priority}, assignee_id = ${data.assignee_id}, due_date = ${data.due_date}, tags = ${data.tags}, updated_at = ${data.updated_at}
        WHERE id = ${id}
      `;
      return this.getTaskById(id);
    } else {
      const db = getSqliteDatabase();
      db.prepare(`
        UPDATE tasks
        SET title = ?, description = ?, status = ?, priority = ?, assignee_id = ?, due_date = ?, tags = ?, updated_at = ?
        WHERE id = ?
      `).run(
        data.title,
        data.description,
        data.status,
        data.priority,
        data.assignee_id,
        data.due_date,
        data.tags,
        data.updated_at,
        id
      );
      return this.getTaskById(id);
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`DELETE FROM tasks WHERE id = ${id}`;
      return true;
    } else {
      const db = getSqliteDatabase();
      db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
      return true;
    }
  },

  async bulkDeleteTasks(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    if (isPostgres) {
      const sql = getNeonSql();
      let count = 0;
      for (const id of ids) {
        await sql`DELETE FROM tasks WHERE id = ${id}`;
        count++;
      }
      return count;
    } else {
      const db = getSqliteDatabase();
      const deleteTx = db.transaction(() => {
        const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
        let count = 0;
        for (const id of ids) {
          const result = stmt.run(id);
          count += result.changes;
        }
        return count;
      });
      return deleteTx();
    }
  },
};
