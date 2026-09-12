import { getDatabase, closeDatabase } from './database';
import { runMigrations } from './migrations';
import { seedDatabase } from './seed';

/**
 * Initializes database connection, applies migrations, and seeds initial data.
 */
export function initDatabase(): void {
  console.log('🔄 Initializing SQLite database connection...');
  getDatabase();
  runMigrations();
  seedDatabase();
}

export { getDatabase, closeDatabase };
