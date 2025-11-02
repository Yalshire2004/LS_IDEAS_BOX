const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'ideas.db');
const db = new Database(dbPath);

// Create ideas table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea TEXT NOT NULL,
    status TEXT DEFAULT 'Not Implemented',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migrate existing data: add status column if it doesn't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(ideas)").all();
  const hasStatus = tableInfo.some(col => col.name === 'status');
  
  if (!hasStatus) {
    db.exec(`ALTER TABLE ideas ADD COLUMN status TEXT DEFAULT 'Not Implemented'`);
    // Update existing records to have default status
    db.exec(`UPDATE ideas SET status = 'Not Implemented' WHERE status IS NULL`);
  }
} catch (error) {
  console.error('Migration error:', error);
}

module.exports = db;

