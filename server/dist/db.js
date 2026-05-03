"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
exports.getDb = getDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let db;
function initDb() {
    const dir = path.join(os.homedir(), '.vibebbs');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const dbPath = path.join(dir, 'vibebbs.db');
    db = new better_sqlite3_1.default(dbPath);
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
    }
    catch {
        // column already exists — skip
    }
    // migration: add 'introduce' board — rebuild posts table with updated CHECK constraint
    migrateIntroduceBoard(db);
    return db;
}
function migrateIntroduceBoard(db) {
    // check if 'introduce' is already allowed by trying a dry-run insert and rollback
    const hasMigrated = db.prepare(`SELECT COUNT(*) as cnt FROM sqlite_master WHERE type='table' AND name='posts' AND sql LIKE '%introduce%'`).get();
    if (hasMigrated.cnt > 0)
        return;
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
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return db;
}
