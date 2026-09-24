const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ===== ПОДКЛЮЧЕНИЕ К БД =====
const db = new sqlite3.Database('./students.db', (err) => {
    if (err) {
        console.error('❌ Ошибка подключения к БД:', err.message);
    } else {
        console.log('✅ База данных подключена!');
    }
});

// Создаём таблицу, если её нет
db.run(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        group_name TEXT NOT NULL
    )
`);

// ===== API =====

// Получить всех студентов
app.get('/api/students', (req, res) => {
    db.all('SELECT * FROM students ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Добавить студента
app.post('/api/students', (req, res) => {
    const { firstname, lastname, group_name } = req.body;

    if (!firstname || !lastname || !group_name) {
        return res.status(400).json({ error: 'Заполни все поля!' });
    }

    db.run(
        'INSERT INTO students (firstname, lastname, group_name) VALUES (?, ?, ?)',
        [firstname, lastname, group_name],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, firstname, lastname, group_name });
        }
    );
});

// Удалить студента по id
app.delete('/api/students/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM students WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Удалён', changes: this.changes });
    });
});

// ===== ЗАПУСК СЕРВЕРА =====
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});