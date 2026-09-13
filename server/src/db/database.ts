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

export interface TeamDbRecord {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  role?: string;
  member_count?: number;
}

export interface TeamMemberDbRecord {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  name?: string;
  email?: string;
  initials?: string;
  color?: string;
}

export interface TeamInvitationDbRecord {
  id: string;
  team_id: string;
  email: string;
  role: string;
  token: string;
  status: 'pending' | 'accepted' | 'revoked';
  created_by: string;
  created_at: string;
  expires_at: string;
  team_name?: string;
  inviter_name?: string;
  inviter_email?: string;
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
  team_id?: string | null;
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
  // ============================================================
  // Users
  // ============================================================
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

  // ============================================================
  // Teams & Multi-Tenancy
  // ============================================================
  async createTeam(team: { id: string; name: string; slug: string; created_by: string; created_at: string; updated_at: string }): Promise<TeamDbRecord> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`
        INSERT INTO teams (id, name, slug, created_by, created_at, updated_at)
        VALUES (${team.id}, ${team.name}, ${team.slug}, ${team.created_by}, ${team.created_at}, ${team.updated_at})
      `;
      const memberId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await sql`
        INSERT INTO team_members (id, team_id, user_id, role, joined_at)
        VALUES (${memberId}, ${team.id}, ${team.created_by}, 'owner', ${team.created_at})
      `;
      return team;
    } else {
      const db = getSqliteDatabase();
      db.prepare(`
        INSERT INTO teams (id, name, slug, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(team.id, team.name, team.slug, team.created_by, team.created_at, team.updated_at);

      const memberId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO team_members (id, team_id, user_id, role, joined_at)
        VALUES (?, ?, ?, 'owner', ?)
      `).run(memberId, team.id, team.created_by, team.created_at);

      return team;
    }
  },

  async getUserTeams(userId: string): Promise<TeamDbRecord[]> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`
        SELECT 
          t.id, t.name, t.slug, t.created_by, t.created_at, t.updated_at,
          tm.role,
          (SELECT COUNT(*)::int FROM team_members WHERE team_id = t.id) as member_count
        FROM teams t
        INNER JOIN team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = ${userId}
        ORDER BY tm.joined_at ASC
      `) as TeamDbRecord[];
      return rows;
    } else {
      const db = getSqliteDatabase();
      return db.prepare(`
        SELECT 
          t.id, t.name, t.slug, t.created_by, t.created_at, t.updated_at,
          tm.role,
          (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
        FROM teams t
        INNER JOIN team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = ?
        ORDER BY datetime(tm.joined_at) ASC
      `).all(userId) as TeamDbRecord[];
    }
  },

  async getTeamById(teamId: string): Promise<TeamDbRecord | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`
        SELECT 
          t.*,
          (SELECT COUNT(*)::int FROM team_members WHERE team_id = t.id) as member_count
        FROM teams t
        WHERE t.id = ${teamId}
        LIMIT 1
      `) as TeamDbRecord[];
      return rows[0] || null;
    } else {
      const db = getSqliteDatabase();
      const row = db.prepare(`
        SELECT 
          t.*,
          (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
        FROM teams t
        WHERE t.id = ?
      `).get(teamId) as TeamDbRecord | undefined;
      return row || null;
    }
  },

  async isUserInTeam(teamId: string, userId: string): Promise<boolean> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`SELECT 1 FROM team_members WHERE team_id = ${teamId} AND user_id = ${userId} LIMIT 1`) as any[];
      return rows.length > 0;
    } else {
      const db = getSqliteDatabase();
      const row = db.prepare('SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?').get(teamId, userId);
      return Boolean(row);
    }
  },

  async getUserRoleInTeam(teamId: string, userId: string): Promise<string | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`SELECT role FROM team_members WHERE team_id = ${teamId} AND user_id = ${userId} LIMIT 1`) as { role: string }[];
      return rows[0]?.role || null;
    } else {
      const db = getSqliteDatabase();
      const row = db.prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ?').get(teamId, userId) as { role: string } | undefined;
      return row?.role || null;
    }
  },

  async getTeamMembers(teamId: string): Promise<TeamMemberDbRecord[]> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`
        SELECT 
          tm.id, tm.team_id, tm.user_id, tm.role, tm.joined_at,
          u.name, u.email, u.initials, u.color
        FROM team_members tm
        INNER JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = ${teamId}
        ORDER BY tm.joined_at ASC
      `) as TeamMemberDbRecord[];
      return rows;
    } else {
      const db = getSqliteDatabase();
      return db.prepare(`
        SELECT 
          tm.id, tm.team_id, tm.user_id, tm.role, tm.joined_at,
          u.name, u.email, u.initials, u.color
        FROM team_members tm
        INNER JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = ?
        ORDER BY datetime(tm.joined_at) ASC
      `).all(teamId) as TeamMemberDbRecord[];
    }
  },

  async addTeamMember(member: { id: string; team_id: string; user_id: string; role: 'owner' | 'admin' | 'member'; joined_at: string }): Promise<void> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`
        INSERT INTO team_members (id, team_id, user_id, role, joined_at)
        VALUES (${member.id}, ${member.team_id}, ${member.user_id}, ${member.role}, ${member.joined_at})
        ON CONFLICT (team_id, user_id) DO UPDATE SET role = ${member.role}
      `;
    } else {
      const db = getSqliteDatabase();
      db.prepare(`
        INSERT INTO team_members (id, team_id, user_id, role, joined_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (team_id, user_id) DO UPDATE SET role = excluded.role
      `).run(member.id, member.team_id, member.user_id, member.role, member.joined_at);
    }
  },

  async removeTeamMember(teamId: string, userId: string): Promise<boolean> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`DELETE FROM team_members WHERE team_id = ${teamId} AND user_id = ${userId}`;
      return true;
    } else {
      const db = getSqliteDatabase();
      db.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?').run(teamId, userId);
      return true;
    }
  },

  // ============================================================
  // Team Invitations
  // ============================================================
  async createInvitation(inv: {
    id: string;
    team_id: string;
    email: string;
    role: string;
    token: string;
    status: string;
    created_by: string;
    created_at: string;
    expires_at: string;
  }): Promise<void> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`
        INSERT INTO team_invitations (id, team_id, email, role, token, status, created_by, created_at, expires_at)
        VALUES (${inv.id}, ${inv.team_id}, ${inv.email}, ${inv.role}, ${inv.token}, ${inv.status}, ${inv.created_by}, ${inv.created_at}, ${inv.expires_at})
      `;
    } else {
      const db = getSqliteDatabase();
      db.prepare(`
        INSERT INTO team_invitations (id, team_id, email, role, token, status, created_by, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(inv.id, inv.team_id, inv.email, inv.role, inv.token, inv.status, inv.created_by, inv.created_at, inv.expires_at);
    }
  },

  async getInvitationByToken(token: string): Promise<TeamInvitationDbRecord | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`
        SELECT 
          ti.*,
          t.name as team_name,
          u.name as inviter_name,
          u.email as inviter_email
        FROM team_invitations ti
        INNER JOIN teams t ON ti.team_id = t.id
        INNER JOIN users u ON ti.created_by = u.id
        WHERE ti.token = ${token}
        LIMIT 1
      `) as TeamInvitationDbRecord[];
      return rows[0] || null;
    } else {
      const db = getSqliteDatabase();
      const row = db.prepare(`
        SELECT 
          ti.*,
          t.name as team_name,
          u.name as inviter_name,
          u.email as inviter_email
        FROM team_invitations ti
        INNER JOIN teams t ON ti.team_id = t.id
        INNER JOIN users u ON ti.created_by = u.id
        WHERE ti.token = ?
      `).get(token) as TeamInvitationDbRecord | undefined;
      return row || null;
    }
  },

  async getPendingInvitations(teamId: string): Promise<TeamInvitationDbRecord[]> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`
        SELECT 
          ti.*,
          u.name as inviter_name,
          u.email as inviter_email
        FROM team_invitations ti
        INNER JOIN users u ON ti.created_by = u.id
        WHERE ti.team_id = ${teamId} AND ti.status = 'pending'
        ORDER BY ti.created_at DESC
      `) as TeamInvitationDbRecord[];
      return rows;
    } else {
      const db = getSqliteDatabase();
      return db.prepare(`
        SELECT 
          ti.*,
          u.name as inviter_name,
          u.email as inviter_email
        FROM team_invitations ti
        INNER JOIN users u ON ti.created_by = u.id
        WHERE ti.team_id = ? AND ti.status = 'pending'
        ORDER BY datetime(ti.created_at) DESC
      `).all(teamId) as TeamInvitationDbRecord[];
    }
  },

  async acceptInvitation(token: string, userId: string): Promise<{ team_id: string } | null> {
    const inv = await this.getInvitationByToken(token);
    if (!inv || inv.status !== 'pending') return null;

    const now = new Date().toISOString();
    const memberId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (isPostgres) {
      const sql = getNeonSql();
      await sql`
        UPDATE team_invitations 
        SET status = 'accepted' 
        WHERE token = ${token}
      `;
      await sql`
        INSERT INTO team_members (id, team_id, user_id, role, joined_at)
        VALUES (${memberId}, ${inv.team_id}, ${userId}, ${inv.role as any}, ${now})
        ON CONFLICT (team_id, user_id) DO NOTHING
      `;
    } else {
      const db = getSqliteDatabase();
      db.prepare(`UPDATE team_invitations SET status = 'accepted' WHERE token = ?`).run(token);
      db.prepare(`
        INSERT INTO team_members (id, team_id, user_id, role, joined_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (team_id, user_id) DO NOTHING
      `).run(memberId, inv.team_id, userId, inv.role, now);
    }

    return { team_id: inv.team_id };
  },

  async revokeInvitation(id: string, teamId: string): Promise<boolean> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`DELETE FROM team_invitations WHERE id = ${id} AND team_id = ${teamId}`;
      return true;
    } else {
      const db = getSqliteDatabase();
      db.prepare('DELETE FROM team_invitations WHERE id = ? AND team_id = ?').run(id, teamId);
      return true;
    }
  },

  // ============================================================
  // Tasks (Scoped by Team)
  // ============================================================
  async getTaskCount(teamId?: string): Promise<number> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = teamId
        ? ((await sql`SELECT COUNT(*)::int as count FROM tasks WHERE team_id = ${teamId}`) as { count: number }[])
        : ((await sql`SELECT COUNT(*)::int as count FROM tasks`) as { count: number }[]);
      return Number(rows[0]?.count || 0);
    } else {
      const db = getSqliteDatabase();
      const row = teamId
        ? (db.prepare('SELECT COUNT(*) as count FROM tasks WHERE team_id = ?').get(teamId) as { count: number } | undefined)
        : (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number } | undefined);
      return row?.count || 0;
    }
  },

  async getNextTaskKeyNumber(): Promise<number> {
    if (isPostgres) {
      const sql = getNeonSql();
      const rows = (await sql`
        SELECT COALESCE(MAX(NULLIF(regexp_replace(key, '^TSK-', ''), '')::int), 0) + 1 as next_num
        FROM tasks
      `) as { next_num: number }[];
      return Number(rows[0]?.next_num || 1);
    } else {
      const db = getSqliteDatabase();
      const row = db.prepare(`
        SELECT COALESCE(MAX(CAST(SUBSTR(key, 5) AS INTEGER)), 0) + 1 as next_num
        FROM tasks
        WHERE key LIKE 'TSK-%'
      `).get() as { next_num: number } | undefined;
      return row?.next_num || 1;
    }
  },

  async getTasks(filters: { status?: string; priority?: string; search?: string; sortBy?: string; teamId?: string }): Promise<TaskDbRecord[]> {
    if (isPostgres) {
      const sql = getNeonSql();
      let rows: TaskDbRecord[];

      if (filters.teamId) {
        rows = (await sql`
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
          WHERE t.team_id = ${filters.teamId} OR t.team_id IS NULL
          ORDER BY t.created_at DESC
        `) as TaskDbRecord[];
      } else {
        rows = (await sql`
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
      }

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
      if (filters.teamId) {
        sql += ` AND (t.team_id = ? OR t.team_id IS NULL)`;
        params.push(filters.teamId);
      }
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

  async getTaskStatsSummary(teamId?: string): Promise<{ status: string; priority: string; due_date: string | null }[]> {
    if (isPostgres) {
      const sql = getNeonSql();
      if (teamId) {
        const rows = (await sql`SELECT status, priority, due_date FROM tasks WHERE team_id = ${teamId} OR team_id IS NULL`) as { status: string; priority: string; due_date: string | null }[];
        return rows;
      } else {
        const rows = (await sql`SELECT status, priority, due_date FROM tasks`) as { status: string; priority: string; due_date: string | null }[];
        return rows;
      }
    } else {
      const db = getSqliteDatabase();
      if (teamId) {
        return db.prepare('SELECT status, priority, due_date FROM tasks WHERE team_id = ? OR team_id IS NULL').all(teamId) as { status: string; priority: string; due_date: string | null }[];
      } else {
        return db.prepare('SELECT status, priority, due_date FROM tasks').all() as { status: string; priority: string; due_date: string | null }[];
      }
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
    team_id?: string | null;
    due_date: string | null;
    tags: string;
    created_at: string;
    updated_at: string;
  }): Promise<TaskDbRecord | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      await sql`
        INSERT INTO tasks (id, key, title, description, status, priority, assignee_id, created_by, team_id, due_date, tags, created_at, updated_at)
        VALUES (${task.id}, ${task.key}, ${task.title}, ${task.description}, ${task.status}, ${task.priority}, ${task.assignee_id}, ${task.created_by}, ${task.team_id || null}, ${task.due_date}, ${task.tags}, ${task.created_at}, ${task.updated_at})
      `;
      return this.getTaskById(task.id);
    } else {
      const db = getSqliteDatabase();
      db.prepare(`
        INSERT INTO tasks (id, key, title, description, status, priority, assignee_id, created_by, team_id, due_date, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        task.id,
        task.key,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.assignee_id,
        task.created_by,
        task.team_id || null,
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
      team_id?: string | null;
      due_date: string | null;
      tags: string;
      updated_at: string;
    }
  ): Promise<TaskDbRecord | null> {
    if (isPostgres) {
      const sql = getNeonSql();
      if (data.team_id !== undefined) {
        await sql`
          UPDATE tasks
          SET title = ${data.title}, description = ${data.description}, status = ${data.status}, priority = ${data.priority}, assignee_id = ${data.assignee_id}, team_id = ${data.team_id}, due_date = ${data.due_date}, tags = ${data.tags}, updated_at = ${data.updated_at}
          WHERE id = ${id}
        `;
      } else {
        await sql`
          UPDATE tasks
          SET title = ${data.title}, description = ${data.description}, status = ${data.status}, priority = ${data.priority}, assignee_id = ${data.assignee_id}, due_date = ${data.due_date}, tags = ${data.tags}, updated_at = ${data.updated_at}
          WHERE id = ${id}
        `;
      }
      return this.getTaskById(id);
    } else {
      const db = getSqliteDatabase();
      if (data.team_id !== undefined) {
        db.prepare(`
          UPDATE tasks
          SET title = ?, description = ?, status = ?, priority = ?, assignee_id = ?, team_id = ?, due_date = ?, tags = ?, updated_at = ?
          WHERE id = ?
        `).run(
          data.title,
          data.description,
          data.status,
          data.priority,
          data.assignee_id,
          data.team_id,
          data.due_date,
          data.tags,
          data.updated_at,
          id
        );
      } else {
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
      }
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
