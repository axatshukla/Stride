import bcrypt from 'bcryptjs';
import { getDatabase } from './database';

export function seedDatabase(): void {
  const db = getDatabase();

  // Check if users already exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log(`ℹ️ Database already initialized (${userCount.count} users found).`);
    return;
  }

  console.log('🌱 Initializing workspace admin account...');

  const defaultPasswordHash = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  const users = [
    {
      id: 'u1',
      name: 'Akshat Shukla',
      email: 'akshat@taskflow.dev',
      password_hash: defaultPasswordHash,
      initials: 'AS',
      color: '#4F46E5',
      created_at: now,
      updated_at: now,
    },
  ];

  const insertUserStmt = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, initials, color, created_at, updated_at)
    VALUES (@id, @name, @email, @password_hash, @initials, @color, @created_at, @updated_at)
  `);

  const insertManyUsers = db.transaction((userList: typeof users) => {
    for (const u of userList) {
      insertUserStmt.run(u);
    }
  });

  insertManyUsers(users);

  console.log('✅ Workspace initialized with clean production state (0 tasks).');
}
