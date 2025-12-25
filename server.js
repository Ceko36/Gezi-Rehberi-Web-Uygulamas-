const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const db = new sqlite3.Database('./places.db', (err) => {
    if (err) {
        console.error('Veritabanı hatası:', err.message);
    } else {
        console.log('Veritabanı bağlantısı başarılı');
        db.run(`CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            city TEXT NOT NULL,
            country TEXT NOT NULL,
            description TEXT,
            image TEXT
        )`, (err) => {
            if (!err) {
                db.get("SELECT COUNT(*) as count FROM places", (err, row) => {
                    if (row.count === 0) {
                        const stmt = db.prepare("INSERT INTO places (name, city, country, description, image) VALUES (?, ?, ?, ?, ?)");
                        stmt.run('Ayasofya', 'İstanbul', 'Türkiye', 'Bizans İmparatorluğu döneminde inşa edilmiş, tarihi öneme sahip bir müze ve camidir.', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800');
                        stmt.run('Big Ben', 'Londra', 'İngiltere', 'Londra\'nın simgesi olan ünlü saat kulesi ve parlamento binası.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800');
                        stmt.run('Eyfel Kulesi', 'Paris', 'Fransa', 'Paris\'in en ünlü simgesi, dünyanın en çok ziyaret edilen turistik yerlerinden biri.', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800');
                        stmt.finalize();
                        console.log('Başlangıç verileri eklendi');
                    }
                });
            }
        });
    }
});

app.get('/api/places', (req, res) => {
    db.all("SELECT * FROM places ORDER BY id DESC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/places/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM places WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Yer bulunamadı' });
            return;
        }
        res.json(row);
    });
});

app.post('/api/places', (req, res) => {
    const { name, city, country, description, image } = req.body;
    if (!name || !city || !country) {
        res.status(400).json({ error: 'Name, city ve country zorunludur' });
        return;
    }
    db.run("INSERT INTO places (name, city, country, description, image) VALUES (?, ?, ?, ?, ?)",
        [name, city, country, description || '', image || ''], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, name, city, country, description, image });
        });
});

app.put('/api/places/:id', (req, res) => {
    const id = req.params.id;
    const { name, city, country, description, image } = req.body;
    if (!name || !city || !country) {
        res.status(400).json({ error: 'Name, city ve country zorunludur' });
        return;
    }
    db.run("UPDATE places SET name = ?, city = ?, country = ?, description = ?, image = ? WHERE id = ?",
        [name, city, country, description || '', image || '', id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Yer bulunamadı' });
                return;
            }
            res.json({ id: parseInt(id), name, city, country, description, image });
        });
});

app.delete('/api/places/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM places WHERE id = ?", [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Yer bulunamadı' });
            return;
        }
        res.json({ message: 'Yer başarıyla silindi' });
    });
});

app.listen(PORT, () => {
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
});

