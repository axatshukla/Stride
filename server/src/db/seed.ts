import { dbRepo, isPostgres } from './database';

export async function seedDatabase(): Promise<void> {
  const userCount = await dbRepo.getUserCount();
  if (userCount > 0) {
    console.log(`ℹ️ ${isPostgres ? 'Neon Postgres' : 'SQLite'} database ready (${userCount} registered users).`);
    return;
  }

  console.log(`✅ ${isPostgres ? 'Neon Postgres' : 'SQLite'} database ready for new user registrations (clean production state).`);
}
