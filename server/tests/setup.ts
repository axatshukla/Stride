// Isolate tests to local SQLite database so live Neon Cloud Postgres is never polluted
process.env.DATABASE_URL = '';
process.env.NEON_DATABASE_URL = '';
process.env.DB_TYPE = 'sqlite';
process.env.DB_PATH = './server/data/test_suite.db';
