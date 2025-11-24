import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(express.json());

// Άνοιγμα ή δημιουργία βάσης δεδομένων
const dbPromise = open({
  filename: './database.db',
  driver: sqlite3.Database
});

(async () => {
  const db = await dbPromise;

  // Δημιουργία tables αν δεν υπάρχουν
  await db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    text TEXT,
    action TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
})();

// GET /items
app.get("/items", async (req, res) => {
  const db = await dbPromise;
  const items = await db.all("SELECT * FROM items ORDER BY created_at DESC");
  res.json(items);
});

// POST /items
app.post("/items", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const db = await dbPromise;
  const result = await db.run("INSERT INTO items (text) VALUES (?)", text);
  const newItem = await db.get("SELECT * FROM items WHERE id = ?", result.lastID);
  res.json(newItem);
});

// DELETE /items/:id
app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  const db = await dbPromise;

  const item = await db.get("SELECT * FROM items WHERE id = ?", id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  await db.run("DELETE FROM items WHERE id = ?", id);
  await db.run(
    "INSERT INTO history (item_id, text, action) VALUES (?, ?, ?)",
    id, item.text, "deleted"
  );
  res.json({ success: true });
});

// GET /history
app.get("/history", async (req, res) => {
  const db = await dbPromise;
  const history = await db.all("SELECT * FROM history ORDER BY created_at DESC");
  res.json(history);
});

// ⚡ ΣΩΣΤΟ app.listen για Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
