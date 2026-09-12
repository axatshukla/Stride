import { getDatabase, closeDatabase, isPostgres } from './database';
import { runMigrations } from './migrations';
import { seedDatabase } from './seed';

/**
 * Initializes database connection, applies migrations, and prepares database state.
 */
export async function initDatabase(): Promise<void> {
  console.log(`🔄 Initializing ${isPostgres ? 'Neon Cloud Postgres' : 'SQLite'} database connection...`);
  if (!isPostgres) {
    getDatabase();
  }
  await runMigrations();
  await seedDatabase();
}

export { getDatabase, closeDatabase, isPostgres };
