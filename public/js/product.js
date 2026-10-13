async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        document.getElementById('product-detail').innerHTML = '<p>Товар не найден.</p>';
        return;
    }

    try {
        const response = await fetch('/api/products/' + productId);
        const product = await response.json();

        document.getElementById('breadcrumb-name').textContent = product.product_name;

        // Проверяем, есть ли товар в избранном
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isFavorite = favorites.includes(product.product_id);
        const heartIcon = isFavorite ? '♥' : '♡';

        document.getElementById('product-detail').innerHTML = `
            <div class="product-detail-image">
                ${product.image_url 
                    ? `<img src="images/${product.image_url}" alt="${product.product_name}">` 
                    : 'ФОТО ТОВАРА'}
            </div>
            <div class="product-detail-info">
                <h1>${product.product_name}</h1>
                <div class="product-detail-aroma">${product.aroma} · ${product.wax_type} воск · ${product.stock} шт.</div>
                <div class="product-detail-price">${product.price} ₽</div>
                <div class="product-detail-desc">${product.description || 'Описание скоро появится.'}</div>

                <div class="quantity-block">
                    <div class="quantity-label">Количество</div>
                    <div class="quantity-control">
                        <button onclick="changeQty(-1)">−</button>
                        <span id="qty">1</span>
                        <button onclick="changeQty(1)">+</button>
                    </div>
                </div>

                <div class="product-actions">
                    <button class="btn-cart" onclick="addToCart(${product.product_id})">Добавить в корзину</button>
                    <button class="btn-favorite" id="fav-btn" onclick="toggleFavorite(${product.product_id})">
                        <span id="fav-icon">${heartIcon}</span> В избранное
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        document.getElementById('product-detail').innerHTML = '<p>Не удалось загрузить товар.</p>';
    }
}

function changeQty(delta) {
    const qtyEl = document.getElementById('qty');
    let qty = parseInt(qtyEl.textContent);
    qty = Math.max(1, qty + delta);
    qtyEl.textContent = qty;
}

function addToCart(productId) {
    const qty = parseInt(document.getElementById('qty').textContent);
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ id: productId, qty: qty });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Товар добавлен в корзину!');
}

function toggleFavorite(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(productId);

    if (index === -1) {
        favorites.push(productId);
        document.getElementById('fav-icon').textContent = '♥';
    } else {
        favorites.splice(index, 1);
        document.getElementById('fav-icon').textContent = '♡';
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

document.addEventListener('DOMContentLoaded', loadProduct);