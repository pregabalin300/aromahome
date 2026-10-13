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

// API: получить один товар по id
app.get('/api/products/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', req.params.id)
            .query('SELECT * FROM Products WHERE product_id = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// API: создать заказ
app.post('/api/orders', async (req, res) => {
    try {
        const { user_id, name, phone, email, address, delivery, payment, comment, total, items } = req.body;

        const pool = await getConnection();

        // Создаём заказ (user_id = 1 для примера, пока нет авторизации)
        const orderResult = await pool.request()
            .input('userId', req.body.user_id || 1)
            .input('status', 'new')
            .input('total', total)
            .input('address', address)
            .input('delivery', delivery)
            .input('payment', payment)
            .input('comment', comment)
            .query(`INSERT INTO Orders (user_id, status, total_price, delivery_address, delivery_method, payment_method, comment)
                    OUTPUT INSERTED.order_id
                    VALUES (@userId, @status, @total, @address, @delivery, @payment, @comment)`);

        const orderId = orderResult.recordset[0].order_id;

        // Добавляем позиции заказа
        for (const item of items) {
            const productResult = await pool.request()
                .input('id', item.id)
                .query('SELECT price FROM Products WHERE product_id = @id');

            if (productResult.recordset.length > 0) {
                const price = productResult.recordset[0].price;
                await pool.request()
                    .input('orderId', orderId)
                    .input('productId', item.id)
                    .input('qty', item.qty)
                    .input('price', price)
                    .query(`INSERT INTO OrderItems (order_id, product_id, quantity, price)
                            VALUES (@orderId, @productId, @qty, @price)`);
            }
        }

        res.json({ success: true, order_id: orderId });
    } catch (err) {
        console.error('Ошибка создания заказа:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API: регистрация
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const pool = await getConnection();

        // Проверяем, нет ли уже такого email
        const existing = await pool.request()
            .input('email', email)
            .query('SELECT user_id FROM Users WHERE email = @email');

        if (existing.recordset.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Создаём пользователя (пароль пока без хеширования — для учебного проекта)
        const result = await pool.request()
            .input('name', name)
            .input('email', email)
            .input('password', password)
            .query(`INSERT INTO Users (user_name, email, password_hash, role)
                    OUTPUT INSERTED.user_id, INSERTED.user_name, INSERTED.email
                    VALUES (@name, @email, @password, 'customer')`);

        res.json({ success: true, user: result.recordset[0] });
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API: вход
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const pool = await getConnection();
        const result = await pool.request()
            .input('email', email)
            .input('password', password)
            .query('SELECT user_id, user_name, email, role FROM Users WHERE email = @email AND password_hash = @password');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        res.json({ success: true, user: result.recordset[0] });
    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API: получить заказы пользователя
app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', req.params.userId)
            .query(`SELECT o.order_id, o.status, o.total_price, o.created_at, o.delivery_method
                    FROM Orders o
                    WHERE o.user_id = @userId
                    ORDER BY o.created_at DESC`);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Ошибка получения заказов:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});