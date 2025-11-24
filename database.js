import sqlite3 from 'sqlite3';
sqlite3.verbose();

const db = new sqlite3.Database('./app.db');

// Δημιουργία πινάκων
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER,
      text TEXT,
      deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export default db;
