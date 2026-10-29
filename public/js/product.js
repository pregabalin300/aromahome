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
            <div class="bg-[#EFE6D9] rounded-xl h-[480px] flex items-center justify-center overflow-hidden">
                ${product.image_url 
                    ? `<img src="images/${product.image_url}" alt="${product.product_name}" class="w-full h-full object-cover">` 
                    : '<span class="text-[#B5A99A] text-sm tracking-widest">ФОТО ТОВАРА</span>'}
            </div>
            
            <div>
                <h1 class="font-serif text-[36px] text-[#3E2C23] mb-2">${product.product_name}</h1>
                <div class="text-sm text-[#9B8B7A] mb-5">${product.aroma} · ${product.wax_type} воск · ${product.stock} шт.</div>
                <div class="text-[28px] font-semibold text-[#3E2C23] mb-6">${product.price} ₽</div>
                <div class="text-[15px] text-[#6B5B4F] leading-relaxed mb-8">${product.description || 'Описание скоро появится.'}</div>

                <div class="mb-8">
                    <div class="text-xs tracking-widest uppercase text-[#9B8B7A] mb-3">Количество</div>
                    <div class="inline-flex items-center border border-[#E0D5C5] rounded-md overflow-hidden">
                        <button onclick="changeQty(-1)" class="w-10 h-10 bg-white border-none text-[18px] cursor-pointer hover:bg-[#F5F0E8]">−</button>
                        <span id="qty" class="w-[50px] text-center text-[15px]">1</span>
                        <button onclick="changeQty(1)" class="w-10 h-10 bg-white border-none text-[18px] cursor-pointer hover:bg-[#F5F0E8]">+</button>
                    </div>
                </div>

                <div class="flex items-center gap-5">
                    <button class="px-10 py-3.5 bg-[#4A3728] text-white rounded-md text-[13px] tracking-widest uppercase cursor-pointer hover:bg-[#3A2A1E] transition-colors" onclick="addToCart(${product.product_id})">Добавить в корзину</button>
                    <button class="bg-transparent border-none text-sm text-[#6B5B4F] cursor-pointer flex items-center gap-1.5 hover:text-[#C97B5A] transition-colors" id="fav-btn" onclick="toggleFavorite(${product.product_id})">
                        <span id="fav-icon" class="text-[16px]">${heartIcon}</span> В избранное
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