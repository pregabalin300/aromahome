function showTab(tab, event) {
    if (event) event.preventDefault();

    document.querySelectorAll('.account-tab').forEach(t => t.style.display = 'none');
    document.getElementById('tab-' + tab).style.display = 'block';

    document.querySelectorAll('.account-menu-item').forEach(m => m.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    if (tab === 'orders') loadOrders();
    if (tab === 'profile') loadProfile();
    if (tab === 'favorites') loadFavorites();
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const container = document.getElementById('profile-info');

    if (!user) {
        container.innerHTML = '<p>Вы не авторизованы. <a href="login.html">Войти</a></p>';
        return;
    }

    container.innerHTML = `
        <div class="profile-block">
            <p class="profile-label">Имя</p>
            <p>${user.user_name}</p>
            <p class="profile-label">Email</p>
            <p>${user.email}</p>
        </div>
    `;
}

async function loadOrders() {
    const container = document.getElementById('orders-list');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        container.innerHTML = '<p style="color:#9B8B7A;">Войдите в аккаунт, чтобы видеть заказы.</p>';
        return;
    }

    try {
        const response = await fetch('/api/orders/user/' + user.user_id);
        const orders = await response.json();

        if (orders.length === 0) {
            container.innerHTML = '<p style="color:#9B8B7A;">У вас пока нет заказов.</p>';
            return;
        }

        container.innerHTML = '';
        orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('ru-RU');
            const statusMap = {
                'new': 'Новый',
                'paid': 'Оплачен',
                'shipped': 'Отправлен',
                'done': 'Доставлен'
            };
            const status = statusMap[order.status] || order.status;

            const row = document.createElement('div');
            row.className = 'order-row';
            row.innerHTML = `
                <div><strong>№ ${order.order_id}</strong></div>
                <div>${date}</div>
                <div>${order.delivery_method || 'Курьер'}</div>
                <div class="order-status">${status} · ${order.total_price} ₽</div>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Не удалось загрузить заказы.</p>';
    }
}

async function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const container = document.getElementById('favorites-list');

    if (favorites.length === 0) {
        container.innerHTML = '<p style="color:#9B8B7A;">Вы ещё ничего не добавили в избранное.</p>';
        return;
    }

    const products = await Promise.all(
        favorites.map(id => fetch('/api/products/' + id).then(r => r.json()))
    );

    container.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <a href="product.html?id=${product.product_id}" style="text-decoration:none; color:inherit;">
                <div class="product-image">
                    ${product.image_url 
                        ? `<img src="images/${product.image_url}" alt="${product.product_name}">` 
                        : 'ФОТО'}
                </div>
                <h3>${product.product_name}</h3>
                <p class="aroma">${product.aroma}</p>
            </a>
            <div class="price-row">
                <span class="price">${product.price} ₽</span>
                <span class="icon-btn">♥</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function logout(event) {
    if (event) event.preventDefault();

    // Создаём окно подтверждения
    const confirmed = confirm('Вы точно хотите выйти из аккаунта?');

    if (confirmed) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});