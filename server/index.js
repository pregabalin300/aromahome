require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API: получить все товары
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.error('ОШИБКА:', err);
        res.status(500).json({ error: err.message });
    }
});

// API: получить один товар по id
app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// API: создать заказ
app.post('/api/orders', async (req, res) => {
    const client = await pool.connect();
    try {
        const { user_id, name, phone, email, address, delivery, payment, comment, total, items } = req.body;

        await client.query('BEGIN');

        // Создаём заказ
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, status, total_price, delivery_address, delivery_method, payment_method, comment)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING order_id`,
            [user_id || 1, 'new', total, address, delivery, payment, comment]
        );

        const orderId = orderResult.rows[0].order_id;

        // Добавляем позиции
        for (const item of items) {
            const productResult = await client.query('SELECT price FROM products WHERE product_id = $1', [item.id]);
            if (productResult.rows.length > 0) {
                const price = productResult.rows[0].price;
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price)
                     VALUES ($1, $2, $3, $4)`,
                    [orderId, item.id, item.qty, price]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, order_id: orderId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Ошибка создания заказа:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        client.release();
    }
});

// API: регистрация
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const result = await pool.query(
            `INSERT INTO users (user_name, email, password_hash, role) 
             VALUES ($1, $2, $3, 'customer') RETURNING user_id, user_name, email`,
            [name, email, password]
        );

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API: вход
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query(
            'SELECT user_id, user_name, email, role FROM users WHERE email = $1 AND password_hash = $2',
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API: получить заказы пользователя
app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT order_id, status, total_price, created_at, delivery_method
             FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения заказов:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Запрет индексации API
app.use('/api', (req, res, next) => {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    next();
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});