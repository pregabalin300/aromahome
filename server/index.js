require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getConnection } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API: получить все товары
app.get('/api/products', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Products');
        res.json(result.recordset);
    } catch (err) {
        console.error('ОШИБКА:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});