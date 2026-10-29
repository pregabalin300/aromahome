async function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemsContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    const emptyBlock = document.getElementById('cart-empty');

    if (cart.length === 0) {
        itemsContainer.classList.add('hidden');
        summaryContainer.classList.add('hidden');
        emptyBlock.classList.remove('hidden');
        return;
    }

    itemsContainer.classList.remove('hidden');
    summaryContainer.classList.remove('hidden');
    emptyBlock.classList.add('hidden');

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
        div.className = 'grid grid-cols-[100px_1fr_auto_auto] gap-5 items-center p-5 bg-white rounded-[10px] border border-[#EFE9E0]';
        div.innerHTML = `
            <div class="w-[100px] h-[100px] bg-[#EFE6D9] rounded-lg flex items-center justify-center overflow-hidden">
                ${product.image_url 
                    ? `<img src="images/${product.image_url}" alt="${product.product_name}" class="w-full h-full object-cover">` 
                    : '<span class="text-[#B5A99A] text-[11px]">ФОТО</span>'}
            </div>
            <div>
                <h3 class="font-serif text-[18px] text-[#3E2C23] mb-1">${product.product_name}</h3>
                <p class="text-[13px] text-[#9B8B7A]">${product.aroma}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
                <div class="inline-flex items-center border border-[#E0D5C5] rounded-md overflow-hidden">
                    <button onclick="changeQty(${product.product_id}, -1)" class="w-8 h-8 bg-white border-none text-[16px] cursor-pointer hover:bg-[#F5F0E8]">−</button>
                    <span class="w-10 text-center text-[14px]">${cartItem.qty}</span>
                    <button onclick="changeQty(${product.product_id}, 1)" class="w-8 h-8 bg-white border-none text-[16px] cursor-pointer hover:bg-[#F5F0E8]">+</button>
                </div>
                <button class="text-xs text-[#C97B5A] underline cursor-pointer bg-transparent border-none" onclick="removeItem(${product.product_id})">Удалить</button>
            </div>
            <div class="text-[16px] font-semibold text-[#3E2C23] min-w-[100px] text-right">
                ${itemTotal} ₽
            </div>
        `;
        itemsContainer.appendChild(div);
    });

    summaryContainer.innerHTML = `
        <div class="text-[12px] tracking-widest uppercase text-[#9B8B7A] mb-3">Итого</div>
        <div class="font-serif text-[32px] text-[#3E2C23] mb-5">${total} ₽</div>
        <div class="text-[13px] text-[#9B8B7A] mb-5">Доставка рассчитывается на следующем шаге.</div>
        
        <div class="flex justify-between text-sm text-[#6B5B4F] py-2.5 border-t border-[#EFE9E0]">
            <span>Товары</span>
            <span>${total} ₽</span>
        </div>
        <div class="flex justify-between text-sm text-[#6B5B4F] py-2.5 border-t border-[#EFE9E0]">
            <span>Доставка</span>
            <span>от 0 ₽</span>
        </div>
        
        <button class="w-full py-4 bg-[#4A3728] text-white border-none rounded-md text-[13px] tracking-widest uppercase cursor-pointer mt-5 hover:bg-[#3A2A1E] transition-colors" onclick="goToCheckout()">Оформить заказ</button>
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