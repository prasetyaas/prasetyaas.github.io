/* ============================================
   NUSANTARA RICE DISTRIBUTION - COMPANY PROFILE
   admin.js - Login + CRUD Products, Gallery, Pricing, Testimonials
   ============================================ */

const ADMIN_PASSWORD = 'admin123';
const ADMIN_SESSION_KEY = 'nrd_admin_logged_in';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('adminLoginForm')) {
        initAdminLogin();
    }
    if (document.getElementById('adminShell')) {
        initAdminPanel();
    }
});

/* ============================================
   LOGIN
   ============================================ */
function initAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    const errorBox = document.getElementById('adminLoginError');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;

        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
            window.location.href = 'admin.html';
        } else {
            if (errorBox) {
                errorBox.textContent = 'Password salah. Silakan coba lagi.';
                errorBox.classList.add('show');
            }
        }
    });
}

/* ============================================
   SESSION CHECK
   ============================================ */
function isAdminLoggedIn() {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

/* ============================================
   ADMIN PANEL
   ============================================ */
function initAdminPanel() {
    if (!isAdminLoggedIn()) {
        window.location.href = 'admin-login.html';
        return;
    }

    initSidebarToggle();
    initNavTabs();
    initLogout();

    initProductsModule();
    initGalleryModule();
    initPricingModule();
    initTestimonialsModule();
}

/* ---------- Sidebar Toggle ---------- */
function initSidebarToggle() {
    const toggle = document.querySelector('.admin-sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) sidebar.classList.remove('open');
        });
    });
}

/* ---------- Nav Tabs ---------- */
function initNavTabs() {
    const navItems = document.querySelectorAll('.admin-nav-item[data-module]');
    const sections = document.querySelectorAll('.admin-module');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const module = item.getAttribute('data-module');

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => {
                section.style.display = (section.getAttribute('data-module') === module) ? 'block' : 'none';
            });

            if (module === 'products') renderProductsTable();
            if (module === 'gallery') renderGalleryTable();
            if (module === 'pricing') renderPricingTable();
            if (module === 'testimonials') renderTestimonialsTable();
        });
    });
}

/* ---------- Logout ---------- */
function initLogout() {
    const logoutBtn = document.getElementById('adminLogout');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        window.location.href = 'admin-login.html';
    });
}

/* ============================================
   GENERIC HELPERS
   ============================================ */
function generateId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function showAdminToast(message, type) {
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'admin-toast' + (type === 'error' ? ' error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ============================================
   PRODUCTS MODULE
   ============================================ */
let editingProductId = null;

function initProductsModule() {
    const table = document.getElementById('productsTableBody');
    if (!table) return;

    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            editingProductId = null;
            document.getElementById('productModalTitle').textContent = 'Tambah Produk';
            document.getElementById('productForm').reset();
            openModal('productModal');
        });
    }

    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProduct();
        });
    }

    document.querySelectorAll('#productModal .admin-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('productModal'));
    });

    renderProductsTable();
}

function getProductFormData() {
    return {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value.trim(),
        price: document.getElementById('productPrice').value.trim(),
        image: document.getElementById('productImage').value.trim(),
        highlights: document.getElementById('productHighlights').value.split('\n').map(s => s.trim()).filter(Boolean),
        packaging: document.getElementById('productPackaging').value.split(',').map(s => s.trim()).filter(Boolean),
        featured: document.getElementById('productFeatured').checked
    };
}

function saveProduct() {
    const data = getProductFormData();

    if (!data.name || !data.description || !data.price) {
        showAdminToast('Mohon lengkapi nama, deskripsi, dan harga produk', 'error');
        return;
    }

    let products = NRD_STORE.getProducts();

    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...data, id: editingProductId };
            showAdminToast('Produk berhasil diperbarui');
        }
    } else {
        products.push({ ...data, id: generateId('p') });
        showAdminToast('Produk berhasil ditambahkan');
    }

    NRD_STORE.set(NRD_STORE.PRODUCTS_KEY, products);
    closeModal('productModal');
    renderProductsTable();
}

function renderProductsTable() {
    const table = document.getElementById('productsTableBody');
    if (!table) return;

    const products = NRD_STORE.getProducts();

    if (products.length === 0) {
        table.innerHTML = '<tr class="empty-row"><td colspan="6">Belum ada produk. Klik "Tambah Produk".</td></tr>';
        return;
    }

    table.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="td-thumb"><img src="${product.image || 'https://via.placeholder.com/100x100?text=Beras'}" alt="${escapeHtml(product.name)}" /></td>
            <td><strong>${escapeHtml(product.name)}</strong></td>
            <td>${escapeHtml(product.category)}</td>
            <td>${escapeHtml(product.price)}</td>
            <td>${product.featured ? '<span class="status-chip highlight">Unggulan</span>' : '<span class="status-chip normal">Standar</span>'}</td>
            <td class="td-actions">
                <button class="btn-admin btn-admin-warning btn-admin-sm" onclick="editProduct('${product.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        table.appendChild(row);
    });
}

function editProduct(id) {
    const products = NRD_STORE.getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    document.getElementById('productModalTitle').textContent = 'Edit Produk';
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.category || 'Premium Rice';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productHighlights').value = (product.highlights || []).join('\n');
    document.getElementById('productPackaging').value = (product.packaging || []).join(', ');
    document.getElementById('productFeatured').checked = !!product.featured;

    openModal('productModal');
}

function deleteProduct(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    let products = NRD_STORE.getProducts();
    products = products.filter(p => p.id !== id);
    NRD_STORE.set(NRD_STORE.PRODUCTS_KEY, products);
    renderProductsTable();
    showAdminToast('Produk berhasil dihapus');
}

/* ============================================
   GALLERY MODULE
   ============================================ */
let editingGalleryId = null;

function initGalleryModule() {
    const table = document.getElementById('galleryTableBody');
    if (!table) return;

    const addBtn = document.getElementById('addGalleryBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            editingGalleryId = null;
            document.getElementById('galleryModalTitle').textContent = 'Tambah Foto';
            document.getElementById('galleryForm').reset();
            openModal('galleryModal');
        });
    }

    const form = document.getElementById('galleryForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveGalleryItem();
        });
    }

    document.querySelectorAll('#galleryModal .admin-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('galleryModal'));
    });

    renderGalleryTable();
}

function saveGalleryItem() {
    const title = document.getElementById('galleryTitle').value.trim();
    const category = document.getElementById('galleryCategory').value;
    const image = document.getElementById('galleryImage').value.trim();

    if (!title || !image) {
        showAdminToast('Mohon lengkapi judul dan URL gambar', 'error');
        return;
    }

    let items = NRD_STORE.getGallery();

    if (editingGalleryId) {
        const index = items.findIndex(g => g.id === editingGalleryId);
        if (index !== -1) {
            items[index] = { ...items[index], title, category, image, id: editingGalleryId };
            showAdminToast('Foto berhasil diperbarui');
        }
    } else {
        items.push({ id: generateId('g'), title, category, image });
        showAdminToast('Foto berhasil ditambahkan');
    }

    NRD_STORE.set(NRD_STORE.GALLERY_KEY, items);
    closeModal('galleryModal');
    renderGalleryTable();
}

function renderGalleryTable() {
    const table = document.getElementById('galleryTableBody');
    if (!table) return;

    const items = NRD_STORE.getGallery();
    const categoryLabels = { gudang: 'Gudang', distribusi: 'Distribusi', produk: 'Produk', kendaraan: 'Kendaraan', packing: 'Packing' };

    if (items.length === 0) {
        table.innerHTML = '<tr class="empty-row"><td colspan="4">Belum ada foto galeri.</td></tr>';
        return;
    }

    table.innerHTML = '';

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="td-thumb"><img src="${item.image || 'https://via.placeholder.com/100x100?text=Galeri'}" alt="${escapeHtml(item.title)}" /></td>
            <td><strong>${escapeHtml(item.title)}</strong></td>
            <td>${categoryLabels[item.category] || item.category}</td>
            <td class="td-actions">
                <button class="btn-admin btn-admin-warning btn-admin-sm" onclick="editGalleryItem('${item.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteGalleryItem('${item.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        table.appendChild(row);
    });
}

function editGalleryItem(id) {
    const items = NRD_STORE.getGallery();
    const item = items.find(g => g.id === id);
    if (!item) return;

    editingGalleryId = id;
    document.getElementById('galleryModalTitle').textContent = 'Edit Foto';
    document.getElementById('galleryTitle').value = item.title || '';
    document.getElementById('galleryCategory').value = item.category || 'gudang';
    document.getElementById('galleryImage').value = item.image || '';

    openModal('galleryModal');
}

function deleteGalleryItem(id) {
    if (!confirm('Yakin ingin menghapus foto ini?')) return;

    let items = NRD_STORE.getGallery();
    items = items.filter(g => g.id !== id);
    NRD_STORE.set(NRD_STORE.GALLERY_KEY, items);
    renderGalleryTable();
    showAdminToast('Foto berhasil dihapus');
}

/* ============================================
   PRICING MODULE
   ============================================ */
let editingPricingId = null;

function initPricingModule() {
    const table = document.getElementById('pricingTableBody');
    if (!table) return;

    const addBtn = document.getElementById('addPricingBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            editingPricingId = null;
            document.getElementById('pricingModalTitle').textContent = 'Tambah Paket';
            document.getElementById('pricingForm').reset();
            openModal('pricingModal');
        });
    }

    const form = document.getElementById('pricingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            savePricingPackage();
        });
    }

    document.querySelectorAll('#pricingModal .admin-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('pricingModal'));
    });

    renderPricingTable();
}

function savePricingPackage() {
    const name = document.getElementById('pricingName').value.trim();
    const price = document.getElementById('pricingPrice').value.trim();
    const minOrder = document.getElementById('pricingMinOrder').value.trim();
    const featured = document.getElementById('pricingFeatured').checked;

    if (!name || !price || !minOrder) {
        showAdminToast('Mohon lengkapi nama, harga, dan minimal order', 'error');
        return;
    }

    const benefits = document.getElementById('pricingBenefits').value.split('\n')
        .map(line => line.trim()).filter(Boolean)
        .map(line => {
            const parts = line.split('|');
            return { text: parts[0].trim(), desc: parts[1] ? parts[1].trim() : '' };
        });

    let packages = NRD_STORE.getPricing();

    const data = {
        name,
        tagline: document.getElementById('pricingTagline').value.trim(),
        price,
        period: document.getElementById('pricingPeriod').value.trim(),
        minOrder,
        benefits,
        riceTypes: document.getElementById('pricingRiceTypes').value.split(',').map(s => s.trim()).filter(Boolean),
        bonus: document.getElementById('pricingBonus').value.split('\n').map(s => s.trim()).filter(Boolean),
        featured
    };

    if (editingPricingId) {
        const index = packages.findIndex(p => p.id === editingPricingId);
        if (index !== -1) {
            packages[index] = { ...packages[index], ...data, id: editingPricingId };
            showAdminToast('Paket berhasil diperbarui');
        }
    } else {
        packages.push({ ...data, id: generateId('pr') });
        showAdminToast('Paket berhasil ditambahkan');
    }

    NRD_STORE.set(NRD_STORE.PRICING_KEY, packages);
    closeModal('pricingModal');
    renderPricingTable();
}

function renderPricingTable() {
    const table = document.getElementById('pricingTableBody');
    if (!table) return;

    const packages = NRD_STORE.getPricing();

    if (packages.length === 0) {
        table.innerHTML = '<tr class="empty-row"><td colspan="6">Belum ada paket.</td></tr>';
        return;
    }

    table.innerHTML = '';

    packages.forEach(pkg => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(pkg.name)}</strong></td>
            <td>Rp ${escapeHtml(pkg.price)}</td>
            <td>${escapeHtml(pkg.minOrder)}</td>
            <td>${pkg.benefits ? pkg.benefits.length : 0} benefit</td>
            <td>${pkg.featured ? '<span class="status-chip highlight">Highlight</span>' : '<span class="status-chip normal">Normal</span>'}</td>
            <td class="td-actions">
                <button class="btn-admin btn-admin-warning btn-admin-sm" onclick="editPricingPackage('${pkg.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deletePricingPackage('${pkg.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        table.appendChild(row);
    });
}

function editPricingPackage(id) {
    const packages = NRD_STORE.getPricing();
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;

    editingPricingId = id;
    document.getElementById('pricingModalTitle').textContent = 'Edit Paket';
    document.getElementById('pricingName').value = pkg.name || '';
    document.getElementById('pricingTagline').value = pkg.tagline || '';
    document.getElementById('pricingPrice').value = pkg.price || '';
    document.getElementById('pricingPeriod').value = pkg.period || '';
    document.getElementById('pricingMinOrder').value = pkg.minOrder || '';
    document.getElementById('pricingBenefits').value = (pkg.benefits || []).map(b => `${b.text} | ${b.desc || ''}`).join('\n');
    document.getElementById('pricingRiceTypes').value = (pkg.riceTypes || []).join(', ');
    document.getElementById('pricingBonus').value = (pkg.bonus || []).join('\n');
    document.getElementById('pricingFeatured').checked = !!pkg.featured;

    openModal('pricingModal');
}

function deletePricingPackage(id) {
    if (!confirm('Yakin ingin menghapus paket ini?')) return;

    let packages = NRD_STORE.getPricing();
    packages = packages.filter(p => p.id !== id);
    NRD_STORE.set(NRD_STORE.PRICING_KEY, packages);
    renderPricingTable();
    showAdminToast('Paket berhasil dihapus');
}

/* ============================================
   TESTIMONIALS MODULE
   ============================================ */
let editingTestimonialId = null;

function initTestimonialsModule() {
    const table = document.getElementById('testimonialsTableBody');
    if (!table) return;

    const addBtn = document.getElementById('addTestimonialBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            editingTestimonialId = null;
            document.getElementById('testimonialModalTitle').textContent = 'Tambah Testimoni';
            document.getElementById('testimonialForm').reset();
            openModal('testimonialModal');
        });
    }

    const form = document.getElementById('testimonialForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveTestimonial();
        });
    }

    document.querySelectorAll('#testimonialModal .admin-modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal('testimonialModal'));
    });

    renderTestimonialsTable();
}

function saveTestimonial() {
    const name = document.getElementById('testimonialName').value.trim();
    const text = document.getElementById('testimonialText').value.trim();
    const rating = parseInt(document.getElementById('testimonialRating').value) || 5;

    if (!name || !text) {
        showAdminToast('Mohon lengkapi nama dan teks testimoni', 'error');
        return;
    }

    const data = {
        name,
        position: document.getElementById('testimonialPosition').value.trim(),
        avatar: document.getElementById('testimonialAvatar').value.trim(),
        rating,
        text
    };

    let testimonials = NRD_STORE.getTestimonials();

    if (editingTestimonialId) {
        const index = testimonials.findIndex(t => t.id === editingTestimonialId);
        if (index !== -1) {
            testimonials[index] = { ...testimonials[index], ...data, id: editingTestimonialId };
            showAdminToast('Testimoni berhasil diperbarui');
        }
    } else {
        testimonials.push({ ...data, id: generateId('t') });
        showAdminToast('Testimoni berhasil ditambahkan');
    }

    NRD_STORE.set(NRD_STORE.TESTIMONIALS_KEY, testimonials);
    closeModal('testimonialModal');
    renderTestimonialsTable();
}

function renderTestimonialsTable() {
    const table = document.getElementById('testimonialsTableBody');
    if (!table) return;

    const testimonials = NRD_STORE.getTestimonials();

    if (testimonials.length === 0) {
        table.innerHTML = '<tr class="empty-row"><td colspan="5">Belum ada testimoni.</td></tr>';
        return;
    }

    table.innerHTML = '';

    testimonials.forEach(testi => {
        const row = document.createElement('tr');
        const initial = (testi.name || 'U').charAt(0).toUpperCase();
        row.innerHTML = `
            <td class="td-thumb">
                ${testi.avatar
                    ? `<img src="${testi.avatar}" alt="${escapeHtml(testi.name)}" />`
                    : `<div style="width:48px;height:48px;border-radius:50%;background:var(--cream);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--green);">${escapeHtml(initial)}</div>`}
            </td>
            <td><strong>${escapeHtml(testi.name)}</strong><br /><small style="color:var(--gray)">${escapeHtml(testi.position || '')}</small></td>
            <td><span style="color:#FBBF24;">${'&#9733;'.repeat(testi.rating)}</span>${testi.rating < 5 ? `<span style="color:#E5E7EB;">${'&#9733;'.repeat(5 - testi.rating)}</span>` : ''}</td>
            <td style="max-width:250px;"><em>${escapeHtml(testi.text).substring(0, 80)}...</em></td>
            <td class="td-actions">
                <button class="btn-admin btn-admin-warning btn-admin-sm" onclick="editTestimonial('${testi.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteTestimonial('${testi.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        table.appendChild(row);
    });
}

function editTestimonial(id) {
    const testimonials = NRD_STORE.getTestimonials();
    const testi = testimonials.find(t => t.id === id);
    if (!testi) return;

    editingTestimonialId = id;
    document.getElementById('testimonialModalTitle').textContent = 'Edit Testimoni';
    document.getElementById('testimonialName').value = testi.name || '';
    document.getElementById('testimonialPosition').value = testi.position || '';
    document.getElementById('testimonialAvatar').value = testi.avatar || '';
    document.getElementById('testimonialRating').value = testi.rating || 5;
    document.getElementById('testimonialText').value = testi.text || '';

    openModal('testimonialModal');
}

function deleteTestimonial(id) {
    if (!confirm('Yakin ingin menghapus testimoni ini?')) return;

    let testimonials = NRD_STORE.getTestimonials();
    testimonials = testimonials.filter(t => t.id !== id);
    NRD_STORE.set(NRD_STORE.TESTIMONIALS_KEY, testimonials);
    renderTestimonialsTable();
    showAdminToast('Testimoni berhasil dihapus');
}

/* ============================================
   RESET TO DEFAULT
   ============================================ */
function resetAllData() {
    if (!confirm('Yakin ingin mengembalikan semua data ke pengaturan awal (default)?\nPerubahan data yang Anda buat akan hilang.')) return;

    NRD_STORE.remove(NRD_STORE.PRODUCTS_KEY);
    NRD_STORE.remove(NRD_STORE.GALLERY_KEY);
    NRD_STORE.remove(NRD_STORE.PRICING_KEY);
    NRD_STORE.remove(NRD_STORE.TESTIMONIALS_KEY);

    renderProductsTable();
    renderGalleryTable();
    renderPricingTable();
    renderTestimonialsTable();

    showAdminToast('Semua data berhasil di-reset ke default');
}
