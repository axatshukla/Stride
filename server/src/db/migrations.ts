import { getSqliteDatabase, getNeonSql, isPostgres } from './database';

/**
 * Runs DDL migration to ensure tables and indexes exist on either Postgres or SQLite.
 */
export async function runMigrations(): Promise<void> {
  if (isPostgres) {
    const sql = getNeonSql();
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
        due_date TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);`;

    console.log('✅ Neon Postgres database schema migrations executed successfully.');
  } else {
    const db = getSqliteDatabase();
    const migrationSQL = `
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

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK(status IN ('todo', 'in-progress', 'done')),
        priority TEXT NOT NULL CHECK(priority IN ('high', 'medium', 'low')),
        assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        due_date TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    `;

    db.exec(migrationSQL);
    console.log('✅ SQLite database schema migrations executed successfully.');
  }
}
