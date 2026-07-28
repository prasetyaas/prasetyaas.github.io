let products = JSON.parse(localStorage.getItem('ms_products')) || [];

// Seed data
if (products.length === 0) {
    products = [
        { id: 1, name: 'Laptop Asus ROG Zephyrus', category: 'Elektronik', price: 18500000, stock: 15 },
        { id: 2, name: 'Kemeja Oxford Premium', category: 'Fashion', price: 185000, stock: 42 },
        { id: 3, name: 'Kopi Arabika Gayo 250gr', category: 'Makanan & Minuman', price: 55000, stock: 8 },
        { id: 4, name: 'Mouse Wireless Logitech', category: 'Elektronik', price: 275000, stock: 5 },
        { id: 5, name: 'Set Piring Keramik 6pcs', category: 'Rumah Tangga', price: 145000, stock: 22 },
        { id: 6, name: 'Oli Mobil Castrol 1L', category: 'Otomotif', price: 85000, stock: 3 },
        { id: 7, name: 'Smartphone Samsung Galaxy S24', category: 'Elektronik', price: 12000000, stock: 10 },
        { id: 8, name: 'Jaket Hoodie Cotton', category: 'Fashion', price: 210000, stock: 28 }
    ];
    saveData();
}

function saveData() { localStorage.setItem('ms_products', JSON.stringify(products)); }

// Navigation
function switchPage(page) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
    const titles = { dashboard: 'Dashboard', products: 'Produk', categories: 'Kategori', reports: 'Laporan' };
    document.getElementById('pageTitle').textContent = titles[page];
    if (page === 'products') renderProducts();
    if (page === 'categories') renderCategories();
    if (page === 'reports') renderReports();
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage(item.dataset.page);
    });
});

// Sidebar mobile
document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('open');
});
document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
}

// Dashboard
function renderDashboard() {
    const table = document.getElementById('dashboardTable');
    const latest = [...products].sort((a,b) => b.id - a.id).slice(0, 5);
    if (latest.length === 0) {
        table.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:#94a3b8">Belum ada data</td></tr>';
    } else {
        table.innerHTML = latest.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>Rp ${p.price.toLocaleString()}</td>
                <td><span class="${p.stock < 10 ? 'stock-low' : ''}">${p.stock}</span></td>
            </tr>
        `).join('');
    }
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalStock').textContent = products.reduce((s, p) => s + p.stock, 0);
    document.getElementById('lowStock').textContent = products.filter(p => p.stock < 10).length;
    document.getElementById('totalValue').textContent = 'Rp ' + products.reduce((s, p) => s + (p.price * p.stock), 0).toLocaleString();
}

// Products
function renderProducts() {
    const search = document.getElementById('searchProduct').value.toLowerCase();
    const cat = document.getElementById('filterCategory').value;
    let filtered = [...products];
    if (cat !== 'all') filtered = filtered.filter(p => p.category === cat);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));

    const table = document.getElementById('productsTable');
    const empty = document.getElementById('emptyState');
    if (filtered.length === 0) {
        table.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        table.innerHTML = filtered.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>Rp ${p.price.toLocaleString()}</td>
                <td><span class="${p.stock < 10 ? 'stock-low' : ''}">${p.stock}</span></td>
                <td>
                    <button class="btn-edit" onclick="editProduct(${p.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})">Hapus</button>
                </td>
            </tr>
        `).join('');
    }
    renderDashboard();
}

function renderCategories() {
    const cats = {};
    products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
    document.getElementById('categoriesGrid').innerHTML = Object.entries(cats).map(([name, count]) => `
        <div class="category-card">
            <h4>${name}</h4>
            <span>${count} produk</span>
        </div>
    `).join('');
}

function renderReports() {
    const cats = {};
    products.forEach(p => {
        if (!cats[p.category]) cats[p.category] = { count: 0, stock: 0, value: 0 };
        cats[p.category].count++;
        cats[p.category].stock += p.stock;
        cats[p.category].value += p.price * p.stock;
    });
    document.getElementById('reportsTable').innerHTML = Object.entries(cats).map(([name, data]) => `
        <tr>
            <td>${name}</td>
            <td>${data.count}</td>
            <td>${data.stock}</td>
            <td>Rp ${data.value.toLocaleString()}</td>
        </tr>
    `).join('');
}

// Product CRUD
function openProductModal(data = null) {
    document.getElementById('productModal').classList.add('active');
    if (data) {
        document.getElementById('modalTitle').textContent = 'Edit Produk';
        document.getElementById('editId').value = data.id;
        document.getElementById('productName').value = data.name;
        document.getElementById('productCategory').value = data.category;
        document.getElementById('productPrice').value = data.price;
        document.getElementById('productStock').value = data.stock;
    } else {
        document.getElementById('modalTitle').textContent = 'Tambah Produk';
        document.getElementById('editId').value = '';
        document.getElementById('productForm').reset();
    }
}

function closeModal() { document.getElementById('productModal').classList.remove('active'); }

document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const data = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value)
    };
    if (id) {
        const idx = products.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) { products[idx] = { ...products[idx], ...data }; }
    } else {
        data.id = Date.now();
        products.push(data);
    }
    saveData();
    renderProducts();
    renderCategories();
    renderReports();
    closeModal();
});

function editProduct(id) {
    const p = products.find(x => x.id === id);
    if (p) openProductModal(p);
}

function deleteProduct(id) {
    if (confirm('Hapus produk ini?')) {
        products = products.filter(p => p.id !== id);
        saveData();
        renderProducts();
        renderCategories();
        renderReports();
    }
}

// Init
updateCategoryFilter();
renderDashboard();
renderCategories();
renderReports();

function updateCategoryFilter() {
    const sel = document.getElementById('filterCategory');
    const cats = [...new Set(products.map(p => p.category))];
    sel.innerHTML = '<option value="all">Semua</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}