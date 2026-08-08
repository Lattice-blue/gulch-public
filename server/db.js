const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const isVercel = process.env.VERCEL === '1';
const dataDir = path.join(__dirname, '../data');

// On Vercel (read-only filesystem), use in-memory database. Locally, use disk.
const dbPath = isVercel ? ':memory:' : path.join(dataDir, 'gulch_core.db');

if (!isVercel && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
console.log(`Connected to Gulch SQLite Core (${isVercel ? 'Vercel In-Memory' : 'Local Disk'}).`);

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT DEFAULT 'UNIVERSITY',
    status TEXT DEFAULT 'green'
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    subjectId TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'HIGH',
    deadline TEXT NOT NULL,
    status TEXT DEFAULT 'Unassigned',
    scheduledDay INTEGER,
    startTime TEXT,
    endTime TEXT,
    description TEXT DEFAULT '',
    assetPath TEXT DEFAULT '',
    FOREIGN KEY(subjectId) REFERENCES subjects(id)
  );
`);

// Safe Migrations
try { db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'HIGH'"); } catch (e) {}
try { db.exec("ALTER TABLE subjects ADD COLUMN type TEXT DEFAULT 'UNIVERSITY'"); } catch (e) {}
try { db.exec("ALTER TABLE tasks ADD COLUMN scheduledDay INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE tasks ADD COLUMN startTime TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE tasks ADD COLUMN endTime TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE tasks ADD COLUMN description TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE tasks ADD COLUMN assetPath TEXT DEFAULT ''"); } catch (e) {}

try { db.exec("ALTER TABLE tasks ADD COLUMN scheduledDate TEXT"); } catch (e) {}


// Migration: Assign today's date to any old scheduled tasks missing a scheduledDate
const todayStr = new Date().toISOString().split('T')[0];
// Migration: If scheduledDate is empty, set it to the task's deadline date
try { 
  db.exec(`
    UPDATE tasks 
    SET scheduledDate = deadline 
    WHERE status = 'Scheduled' 
      AND (scheduledDate IS NULL OR scheduledDate = '' OR scheduledDate = '${new Date().toISOString().split('T')[0]}') 
      AND deadline != 'NO DEADLINE'
  `); 
} catch (e) {}

// Seed Initial Subjects (If empty)
const countResult = db.prepare("SELECT COUNT(*) AS count FROM subjects").get();

if (countResult.count === 0) {
  const insert = db.prepare("INSERT INTO subjects (id, name, category, type, status) VALUES (?, ?, ?, ?, ?)");
  const initialSubjects = [
    ['bsmath111', 'College Algebra', 'Major', 'UNIVERSITY', 'green'],
    ['bsmath112', 'Fundamentals of Computing 1', 'Major', 'UNIVERSITY', 'green'],
    ['ge4', 'Math in the Modern World', 'GE', 'UNIVERSITY', 'green'],
    ['ge1', 'Understanding the Self', 'GE', 'UNIVERSITY', 'green'],
    ['ge3', 'Contemporary World', 'GE', 'UNIVERSITY', 'green'],
    ['ge2', 'Readings in Phil History', 'GE', 'UNIVERSITY', 'green'],
    ['pathfit1', 'PATHFIT 1', 'GE', 'UNIVERSITY', 'green'],
    ['nstp1', 'ROTC (NSTP 1)', 'GE', 'UNIVERSITY', 'green'],
    ['euclid', "Euclid's Elements", 'Classical', 'SOVEREIGN', 'green'],
    ['gulch_dev', 'Gulch OS Development', 'Systems', 'SOVEREIGN', 'green'],
    ['atrophia', 'Atrophia Substack', 'Writing', 'SOVEREIGN', 'green']
  ];
  initialSubjects.forEach(sub => insert.run(...sub));
}

module.exports = {
  all: (sql, params, callback) => {
    try {
      const cleanParams = (params || []).map(p => p === undefined ? null : p);
      const rows = db.prepare(sql).all(...cleanParams);
      callback(null, rows);
    } catch (err) { callback(err); }
  },
  run: (sql, params, callback) => {
    try {
      const cleanParams = (params || []).map(p => p === undefined ? null : p);
      const stmt = db.prepare(sql);
      const info = stmt.run(...cleanParams);
      callback.call(info, null);
    } catch (err) { callback(err); }
  }
};