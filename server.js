import express from 'express';
import db from './database.js';
const app = express();

app.use(express.json());

// ➕ Προσθήκη item
app.post('/items', (req, res) => {
  const { text } = req.body;

  db.run(
    `INSERT INTO items (text) VALUES (?)`,
    [text],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ id: this.lastID, text });
    }
  );
});

// 📄 Λίστα όλων των items
app.get('/items', (req, res) => {
  db.all(`SELECT * FROM items ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ❌ Διαγραφή item + καταγραφή στο ιστορικό
app.delete('/items/:id', (req, res) => {
  const id = req.params.id;

  // Πρώτα βρίσκουμε το αντικείμενο
  db.get(`SELECT * FROM items WHERE id = ?`, [id], (err, item) => {
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Αποθήκευση στο history
    db.run(
      `INSERT INTO history (item_id, text) VALUES (?, ?)`,
      [item.id, item.text]
    );

    // Διαγραφή από items
    db.run(`DELETE FROM items WHERE id = ?`, [id], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({ message: 'Item deleted', deleted: item });
    });
  });
});

// 📜 Προβολή ιστορικού
app.get('/history', (req, res) => {
  db.all(`SELECT * FROM history ORDER BY deleted_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
