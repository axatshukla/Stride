import { getSqliteDatabase, getNeonSql, isPostgres } from './database';

/**
 * Runs DDL migration to ensure tables and indexes exist on either Postgres or SQLite.
 */
export async function runMigrations(): Promise<void> {
  if (isPostgres) {
    const sql = getNeonSql();

    // 1. Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        initials TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#4F46E5',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    // 2. Teams Table
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    // 3. Team Members Table
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'member')),
        joined_at TEXT NOT NULL,
        UNIQUE(team_id, user_id)
      );
    `;

    // 4. Team Invitations Table
    await sql`
      CREATE TABLE IF NOT EXISTS team_invitations (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
        token TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'revoked')),
        created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
    `;

    // 5. Tasks Table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK(status IN ('todo', 'in-progress', 'done')),
        priority TEXT NOT NULL CHECK(priority IN ('high', 'medium', 'low')),
        assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
        due_date TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    // Safe column addition if tasks table already existed without team_id
    try {
      await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS team_id TEXT REFERENCES teams(id) ON DELETE CASCADE;`;
    } catch {
      // Column may already exist
    }

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_team ON tasks(team_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);`;

    console.log('✅ Neon Postgres database schema migrations executed successfully.');
  } else {
    const db = getSqliteDatabase();
    
    // 1. Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        initials TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#4F46E5',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'member')),
        joined_at TEXT NOT NULL,
        UNIQUE(team_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS team_invitations (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
        token TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'revoked')),
        created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK(status IN ('todo', 'in-progress', 'done')),
        priority TEXT NOT NULL CHECK(priority IN ('high', 'medium', 'low')),
        assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
        due_date TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 2. Check if team_id exists on tasks in SQLite, add if missing
    try {
      const tableInfo = db.prepare(`PRAGMA table_info(tasks)`).all() as { name: string }[];
      const hasTeamId = tableInfo.some(col => col.name === 'team_id');
      if (!hasTeamId) {
        db.exec(`ALTER TABLE tasks ADD COLUMN team_id TEXT REFERENCES teams(id) ON DELETE CASCADE`);
      }
    } catch {
      // Ignored if already present
    }

    // 3. Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
      CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
      CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
      CREATE INDEX IF NOT EXISTS idx_tasks_team ON tasks(team_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    `);

    console.log('✅ SQLite database schema migrations executed successfully.');
  }
}
