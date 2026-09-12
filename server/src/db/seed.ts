import { getDatabase } from './database';

export function seedDatabase(): void {
  const db = getDatabase();

  // Check if users already exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log(`ℹ️ Database ready (${userCount.count} registered users).`);
    return;
  }

  console.log('✅ Database ready for new user registrations (clean production state).');
}

