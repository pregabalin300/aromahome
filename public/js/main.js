async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        const container = document.getElementById('products');
        if (!container) return;

        const isCatalog = document.querySelector('.catalog-grid') !== null;
        const list = isCatalog ? products : products.slice(0, 4);

        container.innerHTML = '';

        list.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.aroma = product.aroma;
            card.dataset.wax = product.wax_type;
            card.dataset.price = product.price;
            card.dataset.id = product.product_id;

            card.innerHTML = `
                <div class="product-image">ФОТО</div>
                <h3>${product.product_name}</h3>
                <p class="aroma">${product.aroma} · ${product.stock} шт.</p>
                <div class="price-row">
                    <span class="price">${product.price} ₽</span>
                    <span class="icon-btn">♡</span>
                </div>
            `;
            container.appendChild(card);
        });

        const countEl = document.getElementById('product-count');
        if (countEl) {
            countEl.textContent = `${products.length} товаров`;
        }

        if (isCatalog) {
            initFilters();
        }
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

function initFilters() {
    const checkboxes = document.querySelectorAll('.filters input[type="checkbox"]');
    const priceRange = document.querySelector('.price-range');
    const countEl = document.getElementById('product-count');

    function applyFilters() {
        const selectedAromas = [];
        const selectedWaxes = [];

        const aromaGroup = document.querySelectorAll('.filter-group')[0];
        aromaGroup.querySelectorAll('input:checked').forEach(cb => {
            selectedAromas.push(cb.parentElement.textContent.trim());
        });

        const waxGroup = document.querySelectorAll('.filter-group')[1];
        waxGroup.querySelectorAll('input:checked').forEach(cb => {
            selectedWaxes.push(cb.parentElement.textContent.trim());
        });

        const maxPrice = parseInt(priceRange.value);

        // Обновляем отображение текущей цены
        const priceValueEl = document.getElementById('price-value');
        if (priceValueEl) {
            priceValueEl.textContent = `${maxPrice} ₽`;
        }

        const cards = document.querySelectorAll('.catalog-grid .product-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const aroma = card.dataset.aroma;
            const wax = card.dataset.wax;
            const price = parseInt(card.dataset.price);

            const aromaMatch = selectedAromas.length === 0 || selectedAromas.includes(aroma);
            const waxMatch = selectedWaxes.length === 0 || selectedWaxes.includes(wax);
            const priceMatch = price <= maxPrice;

            if (aromaMatch && waxMatch && priceMatch) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (countEl) {
            countEl.textContent = `${visibleCount} товаров`;
        }
    }

    checkboxes.forEach(cb => cb.addEventListener('change', applyFilters));
    if (priceRange) {
        priceRange.addEventListener('input', applyFilters);
    }

    // Сортировка
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const grid = document.querySelector('.catalog-grid');
            const cards = Array.from(grid.querySelectorAll('.product-card'));

            const mode = sortSelect.value;

            cards.sort((a, b) => {
                const priceA = parseInt(a.dataset.price);
                const priceB = parseInt(b.dataset.price);
                const idA = parseInt(a.dataset.id);
                const idB = parseInt(b.dataset.id);

                if (mode === 'cheap') return priceA - priceB;
                if (mode === 'expensive') return priceB - priceA;
                return idA - idB;
            });

            grid.innerHTML = '';
            cards.forEach(card => grid.appendChild(card));

            applyFilters();
        });
    }

    // Применяем фильтры сразу при загрузке
    applyFilters();
}

document.addEventListener('DOMContentLoaded', loadProducts);