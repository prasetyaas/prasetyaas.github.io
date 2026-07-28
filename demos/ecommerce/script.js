const products = [
    { id: 1, name: 'Smartphone Galaxy S24', category: 'Elektronik', price: 12000000, emoji: '📱' },
    { id: 2, name: 'Laptop Pro 15" M3', category: 'Elektronik', price: 18500000, emoji: '💻' },
    { id: 3, name: 'AirPods Pro 2', category: 'Elektronik', price: 3500000, emoji: '🎧' },
    { id: 4, name: 'Smartwatch Ultra', category: 'Elektronik', price: 4500000, emoji: '⌚' },
    { id: 5, name: 'Kaos Premium Cotton', category: 'Fashion', price: 149000, emoji: '👕' },
    { id: 6, name: 'Jaket Hoodie Vintage', category: 'Fashion', price: 299000, emoji: '🧥' },
    { id: 7, name: 'Sepatu Running Air', category: 'Fashion', price: 599000, emoji: '👟' },
    { id: 8, name: 'Tas Ransel Urban', category: 'Fashion', price: 399000, emoji: '🎒' },
    { id: 9, name: 'Kopi Arabika 250gr', category: 'Makanan', price: 65000, emoji: '☕' },
    { id: 10, name: 'Cokelat Belgia Box', category: 'Makanan', price: 125000, emoji: '🍫' },
    { id: 11, name: 'Lampu Meja LED', category: 'Rumah Tangga', price: 189000, emoji: '💡' },
    { id: 12, name: 'Set Piring 6pcs', category: 'Rumah Tangga', price: 245000, emoji: '🍽️' }
];

let cart = JSON.parse(localStorage.getItem('sv_cart')) || [];
let currentCategory = 'all';

function renderProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    let filtered = products;
    if (currentCategory !== 'all') filtered = filtered.filter(p => p.category === currentCategory);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));

    document.getElementById('productsGrid').innerHTML = filtered.map(p => `
        <div class="product-card">
            <div class="product-img">${p.emoji}</div>
            <div class="product-body">
                <h3>${p.name}</h3>
                <div class="product-cat">${p.category}</div>
                <div class="product-price">Rp ${p.price.toLocaleString()}</div>
                <button class="btn" onclick="addToCart(${p.id})">+ Keranjang</button>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const cats = [...new Set(products.map(p => p.category))];
    const container = document.getElementById('categoryFilter');
    container.innerHTML = '<button class="cat-btn active" data-cat="all" onclick="filterCategory(\'all\')">Semua</button>' +
        cats.map(c => `<button class="cat-btn" data-cat="${c}" onclick="filterCategory('${c}')">${c}</button>`).join('');
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.cat-btn[data-cat="${cat}"]`).classList.add('active');
    renderProducts();
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ ...product, qty: 1 });
    updateCart();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        updateCart();
    }
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

function updateCart() {
    localStorage.setItem('sv_cart', JSON.stringify(cart));
    document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
    const itemsDiv = document.getElementById('cartItems');
    if (cart.length === 0) {
        itemsDiv.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Keranjang masih kosong</p></div>';
    } else {
        itemsDiv.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">${item.emoji}</div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Rp ${(item.price * item.qty).toLocaleString()}</p>
                    <div class="cart-item-qty">
                        <button onclick="changeQty(${item.id}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeItem(${item.id})"><i class="fas fa-trash-alt"></i></button>
            </div>
        `).join('');
    }
    const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    document.getElementById('cartSubtotal').textContent = 'Rp ' + subtotal.toLocaleString();
    document.getElementById('cartTotal').textContent = 'Rp ' + subtotal.toLocaleString();
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('show');
}

function checkout() {
    if (cart.length === 0) return;
    alert('✅ Pesanan berhasil diproses! (Demo)\n\nTerima kasih telah berbelanja di ShopVerse.');
    cart = [];
    updateCart();
    toggleCart();
}

renderCategories();
renderProducts();
updateCart();