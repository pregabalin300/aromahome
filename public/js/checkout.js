async function loadSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const summary = document.getElementById('checkout-summary');

    if (cart.length === 0) {
        summary.innerHTML = '<p>Корзина пуста.</p>';
        return;
    }

    const products = await Promise.all(
        cart.map(item => fetch('/api/products/' + item.id).then(r => r.json()))
    );

    let total = 0;
    let itemsHtml = '';

    products.forEach((product, index) => {
        const cartItem = cart[index];
        const itemTotal = product.price * cartItem.qty;
        total += itemTotal;
        itemsHtml += `
            <div class="checkout-item">
                <span>${product.product_name} × ${cartItem.qty}</span>
                <span>${itemTotal} ₽</span>
            </div>
        `;
    });

    summary.innerHTML = `
        <h3>Ваш заказ</h3>
        ${itemsHtml}
        <div class="checkout-total">
            <span>Итого</span>
            <span>${total} ₽</span>
        </div>
        <button class="btn-confirm" type="submit" form="checkout-form">Подтвердить заказ</button>
    `;
}

async function submitOrder(event) {
    event.preventDefault();

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const delivery = document.querySelector('input[name="delivery"]:checked').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;
    const comment = document.getElementById('comment').value.trim();

    // Считаем сумму
    const products = await Promise.all(
        cart.map(item => fetch('/api/products/' + item.id).then(r => r.json()))
    );

    let total = 0;
    products.forEach((product, index) => {
        total += product.price * cart[index].qty;
    });

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const orderData = {
        user_id: user ? user.user_id : 1,
        name, phone, email, address, delivery, payment, comment,
        total: total,
        items: cart
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Ошибка оформления');

        // Очищаем корзину
        localStorage.removeItem('cart');

        // Показываем сообщение об успехе
        document.querySelector('.checkout-layout').style.display = 'none';
        document.querySelector('.section-label').style.display = 'none';
        document.querySelector('.section-title').style.display = 'none';
        document.querySelector('.section-subtitle').style.display = 'none';

        const success = document.createElement('div');
        success.className = 'order-success';
        success.innerHTML = `
            <h2>Заказ успешно оформлен</h2>
            <p>Мы свяжемся с вами по телефону ${phone} для подтверждения.</p>
            <a href="catalog.html" class="btn-primary">Вернуться в каталог</a>
        `;
        document.querySelector('section .container').appendChild(success);
    } catch (error) {
        console.error('Ошибка оформления заказа:', error);
        alert('Не удалось оформить заказ. Попробуйте еще раз.');
    }
}

document.addEventListener('DOMContentLoaded', loadSummary);