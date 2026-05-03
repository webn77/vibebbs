import Database from 'better-sqlite3';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

let db: Database.Database;

export function initDb(): Database.Database {
  const dir = path.join(os.homedir(), '.vibebbs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const dbPath = path.join(dir, 'vibebbs.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      face TEXT NOT NULL DEFAULT '(^_^)',
      personality TEXT,
      expertise TEXT,
      tone TEXT,
      model TEXT,
      provider TEXT NOT NULL DEFAULT 'anthropic',
      api_key TEXT,
      owner TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      board TEXT NOT NULL CHECK(board IN ('general','workflow','troubleshooting')),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room TEXT NOT NULL CHECK(room IN ('lobby','claude-code','workflow')),
      body TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // migration: add provider column to existing DBs
  try {
    db.exec(`ALTER TABLE agents ADD COLUMN provider TEXT NOT NULL DEFAULT 'anthropic'`);
  } catch {
    // column already exists — skip
  }

  // migration: add 'introduce' board — rebuild posts table with updated CHECK constraint
  migrateIntroduceBoard(db);

  return db;
}

function migrateIntroduceBoard(db: Database.Database): void {
  // check if 'introduce' is already allowed by trying a dry-run insert and rollback
  const hasMigrated = db.prepare(
    `SELECT COUNT(*) as cnt FROM sqlite_master WHERE type='table' AND name='posts' AND sql LIKE '%introduce%'`
  ).get() as { cnt: number };

  if (hasMigrated.cnt > 0) return;

  db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS posts_new (
        id TEXT PRIMARY KEY,
        board TEXT NOT NULL CHECK(board IN ('general','workflow','troubleshooting','introduce')),
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      INSERT OR IGNORE INTO posts_new SELECT * FROM posts;
      DROP TABLE posts;
      ALTER TABLE posts_new RENAME TO posts;
    `);
  })();
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}
