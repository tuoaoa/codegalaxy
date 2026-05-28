const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'codegalaxy.db');

async function getDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  return db;
}

async function initDb() {
  const db = await getDb();

  // Create Repository Scans Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      repo_path TEXT NOT NULL,
      scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'PENDING'
    );
  `);

  // Create Scanned Files Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      scan_id TEXT REFERENCES scans(id) ON DELETE CASCADE,
      path TEXT NOT NULL,
      name TEXT NOT NULL,
      size_bytes INTEGER DEFAULT 0,
      summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_files_path ON files(scan_id, path);`);

  // Create Code Symbols Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS symbols (
      id TEXT PRIMARY KEY,
      file_id TEXT REFERENCES files(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- FUNCTION, CLASS, EXPORT
      line_start INTEGER,
      line_end INTEGER
    );
  `);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name);`);

  // Create Dependency Imports Table (Edges)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS edges (
      id TEXT PRIMARY KEY,
      scan_id TEXT REFERENCES scans(id) ON DELETE CASCADE,
      source_file_id TEXT REFERENCES files(id) ON DELETE CASCADE,
      target_file_path TEXT NOT NULL, 
      target_file_id TEXT REFERENCES files(id) ON DELETE SET NULL, 
      type TEXT DEFAULT 'IMPORT'
    );
  `);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_edges_src ON edges(source_file_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_edges_tgt ON edges(target_file_id);`);

  return db;
}

module.exports = {
  getDb,
  initDb,
  DB_PATH
};
