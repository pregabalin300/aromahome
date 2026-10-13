async function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemsContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    const emptyBlock = document.getElementById('cart-empty');

    if (cart.length === 0) {
        itemsContainer.style.display = 'none';
        summaryContainer.style.display = 'none';
        emptyBlock.style.display = 'block';
        return;
    }

    // Загружаем данные каждого товара
    const products = await Promise.all(
        cart.map(item => fetch('/api/products/' + item.id).then(r => r.json()))
    );

    itemsContainer.innerHTML = '';
    let total = 0;

    products.forEach((product, index) => {
        const cartItem = cart[index];
        const itemTotal = product.price * cartItem.qty;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-image">
                ${product.image_url 
                    ? `<img src="images/${product.image_url}" alt="${product.product_name}">` 
                    : 'ФОТО'}
            </div>
            <div class="cart-item-info">
                <h3>${product.product_name}</h3>
                <p class="aroma">${product.aroma}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button onclick="changeQty(${product.product_id}, -1)">−</button>
                    <span>${cartItem.qty}</span>
                    <button onclick="changeQty(${product.product_id}, 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeItem(${product.product_id})">Удалить</button>
            </div>
            <div class="cart-item-price">${itemTotal} ₽</div>
        `;
        itemsContainer.appendChild(div);
    });

    summaryContainer.innerHTML = `
        <div class="cart-summary-label">Итого</div>
        <div class="cart-summary-total">${total} ₽</div>
        <div class="cart-summary-note">Доставка рассчитывается на следующем шаге.</div>
        <div class="cart-summary-row">
            <span>Товары</span>
            <span>${total} ₽</span>
        </div>
        <div class="cart-summary-row">
            <span>Доставка</span>
            <span>от 0 ₽</span>
        </div>
        <button class="btn-checkout" onclick="goToCheckout()">Оформить заказ</button>
    `;
}

function changeQty(productId, delta) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function goToCheckout() {
    window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', loadCart);