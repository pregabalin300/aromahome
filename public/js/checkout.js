async function loadSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const summary = document.getElementById('checkout-summary');

    if (cart.length === 0) {
        summary.innerHTML = '<p class="text-[#9B8B7A]">Корзина пуста.</p>';
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
            <div class="flex justify-between text-sm text-[#6B5B4F] py-2">
                <span>${product.product_name} × ${cartItem.qty}</span>
                <span>${itemTotal} ₽</span>
            </div>
        `;
    });

    summary.innerHTML = `
        <h3 class="font-serif text-[22px] text-[#3E2C23] mb-5">Ваш заказ</h3>
        ${itemsHtml}
        <div class="flex justify-between text-[18px] font-semibold text-[#3E2C23] pt-4 border-t border-[#EFE9E0] mt-4">
            <span>Итого</span>
            <span>${total} ₽</span>
        </div>
        <button class="w-full py-4 bg-[#4A3728] text-white border-none rounded-md text-[13px] tracking-widest uppercase cursor-pointer mt-5 hover:bg-[#3A2A1E] transition-colors" type="submit" form="checkout-form">Подтвердить заказ</button>
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

        // Прячем форму и показываем успех
        document.querySelector('.grid.grid-cols-\\[1fr_400px\\]').classList.add('hidden');
        document.querySelector('.text-\\[11px\\].tracking-\\[1\\.5px\\].text-\\[\\#C97B5A\\]').classList.add('hidden');
        document.querySelector('h1.font-serif').classList.add('hidden');
        document.querySelector('p.text-sm.text-\\[\\#6B5B4F\\]').classList.add('hidden');

        const success = document.createElement('div');
        success.className = 'text-center py-[60px] px-5 bg-white rounded-[10px] border border-[#EFE9E0] mt-[40px]';
        success.innerHTML = `
            <h2 class="font-serif text-[32px] text-[#3E2C23] mb-4">Заказ успешно оформлен</h2>
            <p class="text-[15px] text-[#6B5B4F] mb-6">Мы свяжемся с вами по телефону ${phone} для подтверждения.</p>
            <a href="catalog.html" class="inline-block px-8 py-3.5 bg-[#4A3728] text-white no-underline rounded-md text-[13px] tracking-[1px] uppercase hover:bg-[#3A2A1E] transition-colors">Вернуться в каталог</a>
        `;
        document.querySelector('section .max-w-\\[1160px\\]').appendChild(success);
    } catch (error) {
        console.error('Ошибка оформления заказа:', error);
        alert('Не удалось оформить заказ. Попробуйте еще раз.');
    }
}

document.addEventListener('DOMContentLoaded', loadSummary);