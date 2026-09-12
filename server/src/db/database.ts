import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

let dbInstance: DatabaseType | null = null;

/**
 * Returns the singleton SQLite database instance.
 * Automatically creates the storage directory if needed and enables Foreign Key constraints.
 */
export function getDatabase(): DatabaseType {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure target folder exists
  const dbDir = path.dirname(path.resolve(process.cwd(), env.DB_PATH));
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbFilePath = path.resolve(process.cwd(), env.DB_PATH);
  dbInstance = new Database(dbFilePath);

  // Enable WAL (Write-Ahead Logging) for superior concurrency and Foreign Keys for referential integrity
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  return dbInstance;
}

/** Close active database connection cleanly */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
