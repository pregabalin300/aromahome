function showTab(tab, event) {
    if (event) event.preventDefault();

    document.querySelectorAll('.account-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById('tab-' + tab).classList.remove('hidden');

    document.querySelectorAll('.account-sidebar a').forEach(m => {
        m.classList.remove('bg-[#F5F0E8]', 'text-[#3E2C23]', 'font-semibold');
        m.classList.add('text-[#6B5B4F]');
    });
    if (event && event.target) {
        event.target.classList.add('bg-[#F5F0E8]', 'text-[#3E2C23]', 'font-semibold');
        event.target.classList.remove('text-[#6B5B4F]');
    }

    if (tab === 'orders') loadOrders();
    if (tab === 'profile') loadProfile();
    if (tab === 'favorites') loadFavorites();
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const container = document.getElementById('profile-info');

    if (!user) {
        container.innerHTML = '<p class="text-[#9B8B7A]">Вы не авторизованы. <a href="login.html" class="text-[#C97B5A]">Войти</a></p>';
        return;
    }

    container.innerHTML = `
        <div class="bg-[#FAF7F2] p-6 rounded-lg max-w-[400px] border border-[#EFE9E0]">
            <p class="text-[12px] uppercase tracking-widest text-[#9B8B7A] mb-1">Имя</p>
            <p class="text-[15px] text-[#3E2C23] mb-4">${user.user_name}</p>
            <p class="text-[12px] uppercase tracking-widest text-[#9B8B7A] mb-1">Email</p>
            <p class="text-[15px] text-[#3E2C23]">${user.email}</p>
        </div>
    `;
}

async function loadOrders() {
    const container = document.getElementById('orders-list');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        container.innerHTML = '<p class="text-[#9B8B7A]">Войдите в аккаунт, чтобы видеть заказы.</p>';
        return;
    }

    try {
        const response = await fetch('/api/orders/user/' + user.user_id);
        const orders = await response.json();

        if (orders.length === 0) {
            container.innerHTML = '<p class="text-[#9B8B7A]">У вас пока нет заказов.</p>';
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
            row.className = 'grid grid-cols-[100px_150px_1fr_auto] gap-5 items-center p-4 bg-[#FAF7F2] rounded-lg border border-[#EFE9E0] mb-3 text-sm text-[#6B5B4F]';
            row.innerHTML = `
                <div><strong class="text-[#3E2C23]">№ ${order.order_id}</strong></div>
                <div>${date}</div>
                <div>${order.delivery_method || 'Курьер'}</div>
                <div class="text-[#7A8B6F] font-semibold">${status} · ${order.total_price} ₽</div>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-red-500">Не удалось загрузить заказы.</p>';
    }
}

async function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const container = document.getElementById('favorites-list');

    if (favorites.length === 0) {
        container.innerHTML = '<p class="text-[#9B8B7A] col-span-3">Вы ещё ничего не добавили в избранное.</p>';
        return;
    }

    const products = await Promise.all(
        favorites.map(id => fetch('/api/products/' + id).then(r => r.json()))
    );

    container.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-transparent cursor-pointer';
        card.innerHTML = `
            <a href="product.html?id=${product.product_id}" class="block no-underline text-inherit">
                <div class="bg-[#EFE6D9] rounded-lg h-[220px] flex items-center justify-center mb-4 overflow-hidden">
                    ${product.image_url 
                        ? `<img src="images/${product.image_url}" alt="${product.product_name}" class="w-full h-full object-cover">` 
                        : '<span class="text-[#B5A99A] text-xs tracking-widest">ФОТО</span>'}
                </div>
                <h3 class="font-serif text-[17px] text-[#3E2C23] mb-1">${product.product_name}</h3>
                <p class="text-xs text-[#9B8B7A] mb-2.5">${product.aroma}</p>
            </a>
            <div class="flex justify-between items-center">
                <span class="text-[15px] text-[#3E2C23] font-semibold">${product.price} ₽</span>
                <span class="text-[#C97B5A] text-lg">♥</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function logout(event) {
    if (event) event.preventDefault();
    const confirmed = confirm('Вы точно хотите выйти из аккаунта?');
    if (confirmed) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});