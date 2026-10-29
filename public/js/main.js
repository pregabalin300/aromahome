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
            <a href="product.html?id=${product.product_id}" class="block no-underline text-inherit">
                <div class="bg-[#EFE6D9] rounded-lg h-[220px] flex items-center justify-center mb-4 overflow-hidden">
                    ${product.image_url 
                        ? `<img src="images/${product.image_url}" alt="${product.product_name}" class="w-full h-full object-cover">` 
                        : '<span class="text-[#B5A99A] text-xs tracking-widest">ФОТО</span>'}
                </div>
                <h3 class="font-serif text-[17px] text-[#3E2C23] mb-1">${product.product_name}</h3>
                <p class="text-xs text-[#9B8B7A] mb-2.5">${product.aroma} · ${product.stock} шт.</p>
            </a>
            <div class="flex justify-between items-center">
                <span class="text-[15px] text-[#3E2C23] font-semibold">${product.price} ₽</span>
                <button class="text-[#6B5B4F] hover:text-[#C97B5A] transition-colors" onclick="event.preventDefault(); event.stopPropagation(); toggleFavoriteFromCatalog(${product.product_id}, this);">♡</button>
            </div>
        `;
        container.appendChild(card);
    });
        updateFavoriteIcons();

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

        // Находим все чекбоксы внутри фильтров
        const allCheckboxes = document.querySelectorAll('aside input[type="checkbox"]');

        // Первые 5 — это ароматы, следующие 3 — воск
        allCheckboxes.forEach((cb, index) => {
            if (cb.checked) {
            const label = cb.parentElement.textContent.trim();
                if (index < 5) {
                    selectedAromas.push(label);
                } else {
                selectedWaxes.push(label);
                }
            }
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

function toggleFavoriteFromCatalog(productId, el) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(productId);

    if (index === -1) {
        favorites.push(productId);
        el.textContent = '♥';
    } else {
        favorites.splice(index, 1);
        el.textContent = '♡';
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function updateFavoriteIcons() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    document.querySelectorAll('.product-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        const icon = card.querySelector('.icon-btn');
        if (icon && favorites.includes(id)) {
            icon.textContent = '♥';
        }
    });
}