const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

// Require the native SQLite database connection
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve local EndeavourOS Documents directory for task attachments
const documentsDir = '/home/zmarttrc/Documents';
if (fs.existsSync(documentsDir)) {
  app.use('/api/assets', express.static(documentsDir));
}

// Helper to get local YYYY-MM-DD date string without UTC shifting
const getLocalDateString = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ status: 'online', time: new Date() });
});

// =========================================
// SUBJECTS & TASKS API (SQLite Persistence)
// =========================================

// 1. Get all subjects
app.get('/api/subjects', (req, res) => {
  db.all("SELECT * FROM subjects", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Add a new Subject (For Sovereign Stack)
app.post('/api/subjects', (req, res) => {
  const { id, name, category, type } = req.body;
  const sql = `INSERT INTO subjects (id, name, category, type, status) VALUES (?, ?, ?, ?, 'green')`;
  const params = [id, name, category || 'Systems', type || 'SOVEREIGN'];

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Subject created successfully', id });
  });
});

// 3. Delete a Subject and all associated tasks
app.delete('/api/subjects/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM tasks WHERE subjectId = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run(`DELETE FROM subjects WHERE id = ?`, [id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Subject and associated tasks deleted successfully' });
    });
  });
});

// 4. Get all tasks (Includes auto-sweep for overdue deadlines)
app.get('/api/tasks', (req, res) => {
  const today = getLocalDateString(new Date());

  // Automatically transition uncompleted tasks past deadline to 'Failed'
  const autoFailSql = `
    UPDATE tasks 
    SET status = 'Failed' 
    WHERE deadline != 'NO DEADLINE' 
      AND deadline < ? 
      AND status NOT IN ('Completed', 'Failed')
  `;

  db.run(autoFailSql, [today], function(err) {
    if (err) console.error('Auto-fail sweep error:', err);

    // Return updated task list
    db.all("SELECT * FROM tasks", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

// 5. Add a new task (Includes Priority & Fallbacks)
app.post('/api/tasks', (req, res) => {
  const { id, subjectId, title, category, priority, deadline, status } = req.body;
  const sql = `INSERT INTO tasks (id, subjectId, title, category, priority, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    id, 
    subjectId, 
    title, 
    category || 'ASSIGNMENT', 
    priority || 'HIGH', 
    deadline || 'NO DEADLINE', 
    status || 'Unassigned'
  ];

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task created successfully', id });
  });
});

// 6. Update task details/status/schedule/assets
app.put('/api/tasks/:id', (req, res) => {
  const { status, scheduledDay, scheduledDate, startTime, endTime, description, assetPath } = req.body;

  const sql = `
    UPDATE tasks 
    SET status = COALESCE(?, status),
        scheduledDay = COALESCE(?, scheduledDay),
        scheduledDate = COALESCE(?, scheduledDate),
        startTime = COALESCE(?, startTime),
        endTime = COALESCE(?, endTime),
        description = COALESCE(?, description),
        assetPath = COALESCE(?, assetPath)
    WHERE id = ?
  `;

  db.run(sql, [status, scheduledDay, scheduledDate, startTime, endTime, description, assetPath, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task updated successfully' });
  });
});
// 7. Delete a single task from SQLite
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM tasks WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task deleted successfully' });
  });
});

// =========================================
// LEGACY MARKDOWN READERS
// =========================================

// Directory Scanner
app.get('/api/docs/:folder', (req, res) => {
  const { folder } = req.params;
  const targetDir = path.join(__dirname, '../data', folder.toLowerCase());

  if (!fs.existsSync(targetDir)) return res.json([]);

  try {
    const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.md'));
    const docs = files.map(file => {
      const slug = path.basename(file, '.md');
      const content = fs.readFileSync(path.join(targetDir, file), 'utf-8');
      
      const match = content.match(/^#\s+(.+)$/m);
      let title = match ? match[1].trim() : slug.replace(/[-_]/g, ' ').toUpperCase();
      title = title.replace(/^\d+[-_ ]*/, '');

      return { slug, title };
    });

    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to scan files' });
  }
});

// Dynamic Document Reader
app.get('/api/data/:folder/:slug', (req, res) => {
  const { folder, slug } = req.params;
  const safeFolder = path.basename(folder);
  const safeFilename = path.basename(`${slug}.md`);
  const filePath = path.join(__dirname, '../data', safeFolder, safeFilename);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: `File not found.` });

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const html = marked(raw); 
    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// Serve Production React Build (For Cloud Deployment)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}
// Export app for Vercel serverless invocation
module.exports = app;

// Only start independent server listener if NOT on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Gulch server running on http://localhost:${PORT}`);
  });
}