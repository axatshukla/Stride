import { getDatabase, closeDatabase } from './database';

function verifyDb(): void {
  const db = getDatabase();

  const userRows = db.prepare('SELECT id, name, email, initials, color FROM users').all();
  console.log(`\n👥 Users Table (${userRows.length} rows):`);
  console.table(userRows);

  const taskRows = db.prepare(`
    SELECT t.key, t.title, t.status, t.priority, u.name as assignee, t.due_date
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LIMIT 5
  `).all();
  console.log(`\n📋 Tasks Table with Assignee JOIN (First 5 rows):`);
  console.table(taskRows);

  closeDatabase();
}

verifyDb();
