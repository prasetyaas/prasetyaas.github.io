/* ==================================================
   SAKURA KOI INDONESIA - Admin Panel
   Login, Dashboard, CRUD (Artikel, Galeri, Koi,
   Testimoni, FAQ, Pengaturan) via localStorage.
   ================================================== */

(function() {
    'use strict';

    const ADMIN_PASSWORD = 'admin123';
    const ADMIN_SESSION_KEY = 'ski_admin_logged_in';

    /* ====== AUTH HELPERS ====== */
    function isAuthenticated() {
        try {
            return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
        } catch (e) {
            return false;
        }
    }
    function setAuth(val) {
        try {
            sessionStorage.setItem(ADMIN_SESSION_KEY, val ? 'true' : 'false');
        } catch (e) { }
    }

    /* ====== LOGIN ====== */
    function initLogin() {
        const form = document.getElementById('adminLoginForm');
        if (!form) return;
        if (isAuthenticated()) {
            window.location.href = 'admin.html';
            return;
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('adminPassword').value;
            const errorBox = document.getElementById('adminLoginError');

            if (password === ADMIN_PASSWORD) {
                setAuth(true);
                window.location.href = 'admin.html';
            } else {
                if (errorBox) {
                    errorBox.textContent = 'Password salah. Silakan coba lagi.';
                    errorBox.classList.add('show');
                }
            }
        });
    }

    /* ====== LOGOUT ====== */
    function initLogout() {
        document.querySelectorAll('[data-logout]').forEach(function(el) {
            el.addEventListener('click', function() {
                setAuth(false);
                window.location.href = 'admin-login.html';
            });
        });
    }

    /* ====== DELETE CONFIRM ====== */
    function confirmDelete(message) {
        return window.confirm(message || 'Yakin ingin menghapus data ini?');
    }

    /* ====== CRUD: ARTIKEL ====== */
    function initArticles() {
        const body = document.getElementById('adminSectionArticles');
        if (!body) return;

        function render() {
            const articles = SKI.getData(SKI.KEYS.ARTICLES, SKI.defaultArticles);
            let html = '';
            if (!articles.length) {
                html = '<div class="admin-empty"><i class="fas fa-file-alt"></i><h3>Belum ada artikel</h3><p>Klik "Tambah Artikel" untuk membuat.</p></div>';
            } else {
                html = `
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead>
                                <tr><th>Judul</th><th>Kategori</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
                            </thead>
                            <tbody>
                                ${articles.map(function(a) {
                                    return `
                                        <tr>
                                            <td><strong>${a.title}</strong></td>
                                            <td>${a.category}</td>
                                            <td>${a.date}</td>
                                            <td><span class="status-badge ${a.status === 'published' ? 'published' : 'draft'}">${a.status === 'published' ? 'Terbit' : 'Draft'}</span></td>
                                            <td>
                                                <div class="admin-actions">
                                                    <button class="admin-btn-icon view" onclick="window.open('blog-detail.html?id=${a.id}')" title="Lihat"><i class="fas fa-eye"></i></button>
                                                    <button class="admin-btn-icon edit" onclick="window.editArticle(${a.id})" title="Edit"><i class="fas fa-edit"></i></button>
                                                    <button class="admin-btn-icon delete" onclick="window.deleteArticle(${a.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            body.innerHTML = `
                <div class="admin-panel-head">
                    <h2><i class="fas fa-file-alt"></i> Kelola Artikel (${articles.length})</h2>
                    <button class="btn btn-primary btn-sm" onclick="window.openArticleModal()"><i class="fas fa-plus"></i> Tambah Artikel</button>
                </div>
                <div class="admin-panel-body">${html}</div>
            `;
        }

        render();

        window.openArticleModal = function(id) {
            const articles = SKI.getData(SKI.KEYS.ARTICLES, SKI.defaultArticles);
            const article = id ? articles.find(function(a) { return a.id === id; }) : { title: '', category: 'Panduan', date: '', summary: '', author: 'Admin', readTime: '5 menit', image: '', status: 'published' };
            openModal(`
                <h3>${id ? 'Edit' : 'Tambah'} Artikel</h3>
                <form id="articleForm">
                    <div class="form-group"><label>Judul <span class="required">*</span></label><input class="form-control" id="afTitle" value="${article.title || ''}" required></div>
                    <div class="form-group"><label>Kategori</label><input class="form-control" id="afCategory" value="${article.category || ''}"></div>
                    <div class="form-group"><label>Tanggal</label><input class="form-control" id="afDate" value="${article.date || ''}" placeholder="Contoh: 12 Juli 2025"></div>
                    <div class="form-group"><label>Ringkasan</label><textarea class="form-control" id="afSummary" rows="2">${article.summary || ''}</textarea></div>
                    <div class="form-group"><label>Penulis</label><input class="form-control" id="afAuthor" value="${article.author || 'Admin'}"></div>
                    <div class="form-group"><label>Durasi Baca</label><input class="form-control" id="afReadTime" value="${article.readTime || '5 menit'}"></div>
                    <div class="form-group"><label>URL Gambar</label><input class="form-control" id="afImage" value="${article.image || ''}"></div>
                    <div class="form-group"><label>Status</label>
                        <select class="form-control" id="afStatus">
                            <option value="published" ${article.status === 'published' ? 'selected' : ''}>Terbit</option>
                            <option value="draft" ${article.status === 'draft' ? 'selected' : ''}>Draft</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">${id ? 'Simpan Perubahan' : 'Tambah'}</button>
                </form>
            `);

            document.getElementById('articleForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const list = SKI.getData(SKI.KEYS.ARTICLES, SKI.defaultArticles);
                const data = {
                    id: id || (list.length ? Math.max.apply(null, list.map(function(x) { return x.id; })) + 1 : 1),
                    title: document.getElementById('afTitle').value,
                    category: document.getElementById('afCategory').value || 'Umum',
                    date: document.getElementById('afDate').value || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    summary: document.getElementById('afSummary').value || '',
                    author: document.getElementById('afAuthor').value || 'Admin',
                    readTime: document.getElementById('afReadTime').value || '5 menit',
                    image: document.getElementById('afImage').value || 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&q=80',
                    status: document.getElementById('afStatus').value
                };
                if (id) {
                    const idx = list.findIndex(function(a) { return a.id === id; });
                    if (idx !== -1) list[idx] = data;
                } else {
                    list.unshift(data);
                }
                SKI.saveData(SKI.KEYS.ARTICLES, list);
                closeModal();
                render();
                showToast('Artikel berhasil disimpan!', 'success');
            });
        };

        window.deleteArticle = function(id) {
            if (!confirmDelete('Hapus artikel ini?')) return;
            const list = SKI.getData(SKI.KEYS.ARTICLES, SKI.defaultArticles);
            const filtered = list.filter(function(a) { return a.id !== id; });
            SKI.saveData(SKI.KEYS.ARTICLES, filtered);
            render();
            showToast('Artikel dihapus.', 'success');
        };
    }

    /* ====== CRUD: GALERI ====== */
    function initGallery() {
        const body = document.getElementById('adminSectionGallery');
        if (!body) return;

        function render() {
            const gallery = SKI.getData(SKI.KEYS.GALLERY, SKI.defaultGallery);
            let html = '';
            if (!gallery.length) {
                html = '<div class="admin-empty"><i class="fas fa-images"></i><h3>Galeri kosong</h3></div>';
            } else {
                html = `
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead><tr><th>Gambar</th><th>Judul</th><th>Kategori</th><th>Aksi</th></tr></thead>
                            <tbody>
                                ${gallery.map(function(g) {
                                    return `
                                        <tr>
                                            <td><img class="thumb" src="${g.img}" alt="${g.title}"></td>
                                            <td><strong>${g.title}</strong></td>
                                            <td>${g.category}</td>
                                            <td>
                                                <div class="admin-actions">
                                                    <button class="admin-btn-icon edit" onclick="window.editGallery('${g.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                                                    <button class="admin-btn-icon delete" onclick="window.deleteGallery('${g.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            body.innerHTML = `
                <div class="admin-panel-head">
                    <h2><i class="fas fa-images"></i> Kelola Galeri (${gallery.length})</h2>
                    <button class="btn btn-primary btn-sm" onclick="window.openGalleryModal()"><i class="fas fa-plus"></i> Tambah Foto</button>
                </div>
                <div class="admin-panel-body">${html}</div>
            `;
        }

        render();

        window.openGalleryModal = function(id) {
            const gallery = SKI.getData(SKI.KEYS.GALLERY, SKI.defaultGallery);
            const item = id ? gallery.find(function(g) { return g.id === id; }) : { title: '', category: 'fish', img: '', id: '' };
            openModal(`
                <h3>${id ? 'Edit' : 'Tambah'} Foto Galeri</h3>
                <form id="galleryForm">
                    <div class="form-group"><label>Judul <span class="required">*</span></label><input class="form-control" id="gfTitle" value="${item.title || ''}" required></div>
                    <div class="form-group"><label>Kategori</label>
                        <select class="form-control" id="gfCategory">
                            <option value="farm" ${item.category === 'farm' ? 'selected' : ''}>Farm</option>
                            <option value="pond" ${item.category === 'pond' ? 'selected' : ''}>Pond</option>
                            <option value="fish" ${item.category === 'fish' ? 'selected' : ''}>Fish</option>
                            <option value="event" ${item.category === 'event' ? 'selected' : ''}>Event</option>
                        </select>
                    </div>
                    <div class="form-group"><label>URL Gambar</label><input class="form-control" id="gfImg" value="${item.img || ''}"></div>
                    <button type="submit" class="btn btn-primary btn-block">${id ? 'Simpan Perubahan' : 'Tambah'}</button>
                </form>
            `);

            document.getElementById('galleryForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const list = SKI.getData(SKI.KEYS.GALLERY, SKI.defaultGallery);
                const data = {
                    id: id || 'g' + Date.now(),
                    title: document.getElementById('gfTitle').value,
                    category: document.getElementById('gfCategory').value,
                    img: document.getElementById('gfImg').value || 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&q=80'
                };
                if (id) {
                    const idx = list.findIndex(function(g) { return g.id === id; });
                    if (idx !== -1) list[idx] = data;
                } else {
                    list.push(data);
                }
                SKI.saveData(SKI.KEYS.GALLERY, list);
                closeModal();
                render();
                showToast('Galeri berhasil disimpan!', 'success');
            });
        };

        window.deleteGallery = function(id) {
            if (!confirmDelete('Hapus foto ini?')) return;
            const list = SKI.getData(SKI.KEYS.GALLERY, SKI.defaultGallery);
            SKI.saveData(SKI.KEYS.GALLERY, list.filter(function(g) { return g.id !== id; }));
            render();
            showToast('Foto dihapus.', 'success');
        };
    }

    /* ====== CRUD: KOI ====== */
    function initKoi() {
        const body = document.getElementById('adminSectionKoi');
        if (!body) return;

        function render() {
            const koi = SKI.getData(SKI.KEYS.KOI, SKI.defaultKoi);
            let html = '';
            if (!koi.length) {
                html = '<div class="admin-empty"><i class="fas fa-fish"></i><h3>Belum ada koi</h3></div>';
            } else {
                html = `
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead><tr><th>Gambar</th><th>Nama</th><th>Jepang</th><th>Harga</th><th>Kategori</th><th>Aksi</th></tr></thead>
                            <tbody>
                                ${koi.map(function(k) {
                                    return `
                                        <tr>
                                            <td><img class="thumb" src="${k.image}" alt="${k.name}"></td>
                                            <td><strong>${k.name}</strong></td>
                                            <td>${k.japanese}</td>
                                            <td>${k.price}</td>
                                            <td>${k.category}</td>
                                            <td>
                                                <div class="admin-actions">
                                                    <button class="admin-btn-icon view" onclick="window.open('detail-kohaku.html?id=${k.id}')" title="Lihat"><i class="fas fa-eye"></i></button>
                                                    <button class="admin-btn-icon edit" onclick="window.editKoi('${k.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                                                    <button class="admin-btn-icon delete" onclick="window.deleteKoi('${k.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            body.innerHTML = `
                <div class="admin-panel-head">
                    <h2><i class="fas fa-fish"></i> Kelola Koi (${koi.length})</h2>
                    <button class="btn btn-primary btn-sm" onclick="window.openKoiModal()"><i class="fas fa-plus"></i> Tambah Koi</button>
                </div>
                <div class="admin-panel-body">${html}</div>
            `;
        }

        render();

        window.openKoiModal = function(id) {
            const koi = SKI.getData(SKI.KEYS.KOI, SKI.defaultKoi);
            const item = id ? koi.find(function(k) { return k.id === id; }) : { name: '', japanese: '', desc: '', image: '', price: '', category: 'Klasik', featured: false, id: '' };
            openModal(`
                <h3>${id ? 'Edit' : 'Tambah'} Koi</h3>
                <form id="koiForm">
                    <div class="form-group"><label>Nama <span class="required">*</span></label><input class="form-control" id="kfName" value="${item.name || ''}" required></div>
                    <div class="form-group"><label>Kanji Jepang</label><input class="form-control" id="kfJapanese" value="${item.japanese || ''}"></div>
                    <div class="form-group"><label>Deskripsi</label><textarea class="form-control" id="kfDesc" rows="3">${item.desc || ''}</textarea></div>
                    <div class="form-group"><label>Harga Mulai</label><input class="form-control" id="kfPrice" value="${item.price || ''}"></div>
                    <div class="form-group"><label>Kategori</label>
                        <select class="form-control" id="kfCategory">
                            <option value="Klasik" ${item.category === 'Klasik' ? 'selected' : ''}>Klasik</option>
                            <option value="Premium" ${item.category === 'Premium' ? 'selected' : ''}>Premium</option>
                            <option value="Metalik" ${item.category === 'Metalik' ? 'selected' : ''}>Metalik</option>
                            <option value="Spesial" ${item.category === 'Spesial' ? 'selected' : ''}>Spesial</option>
                        </select>
                    </div>
                    <div class="form-group"><label>URL Gambar</label><input class="form-control" id="kfImage" value="${item.image || ''}"></div>
                    <div class="form-group"><label><input type="checkbox" id="kfFeatured" ${item.featured ? 'checked' : ''}> Tampilkan di Halaman Depan</label></div>
                    <button type="submit" class="btn btn-primary btn-block">${id ? 'Simpan Perubahan' : 'Tambah'}</button>
                </form>
            `);

            document.getElementById('koiForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const list = SKI.getData(SKI.KEYS.KOI, SKI.defaultKoi);
                const data = {
                    id: id || (list.length ? 'koi-' + (list.length + 1) : 'koi-1'),
                    name: document.getElementById('kfName').value,
                    japanese: document.getElementById('kfJapanese').value || '',
                    desc: document.getElementById('kfDesc').value || '',
                    price: document.getElementById('kfPrice').value || 'Rp 0',
                    category: document.getElementById('kfCategory').value,
                    image: document.getElementById('kfImage').value || 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&q=80',
                    featured: document.getElementById('kfFeatured').checked,
                    id2: id || ''
                };
                delete data.id2;
                if (id) {
                    const idx = list.findIndex(function(k) { return k.id === id; });
                    if (idx !== -1) list[idx] = data;
                } else {
                    list.push(data);
                }
                SKI.saveData(SKI.KEYS.KOI, list);
                closeModal();
                render();
                showToast('Koi berhasil disimpan!', 'success');
            });
        };

        window.deleteKoi = function(id) {
            if (!confirmDelete('Hapus koi ini?')) return;
            const list = SKI.getData(SKI.KEYS.KOI, SKI.defaultKoi);
            SKI.saveData(SKI.KEYS.KOI, list.filter(function(k) { return k.id !== id; }));
            render();
            showToast('Koi dihapus.', 'success');
        };
    }

    /* ====== CRUD: TESTIMONI ====== */
    function initTestimonials() {
        const body = document.getElementById('adminSectionTestimonials');
        if (!body) return;

        function render() {
            const testimonials = SKI.getData(SKI.KEYS.TESTIMONIALS, SKI.defaultTestimonials);
            let html = '';
            if (!testimonials.length) {
                html = '<div class="admin-empty"><i class="fas fa-comment-dots"></i><h3>Belum ada testimoni</h3></div>';
            } else {
                html = `
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead><tr><th>Nama</th><th>Peran</th><th>Rating</th><th>Aksi</th></tr></thead>
                            <tbody>
                                ${testimonials.map(function(t) {
                                    return `
                                        <tr>
                                            <td><strong>${t.name}</strong></td>
                                            <td>${t.role}</td>
                                            <td>${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</td>
                                            <td>
                                                <div class="admin-actions">
                                                    <button class="admin-btn-icon edit" onclick="window.editTestimonial(${t.id})" title="Edit"><i class="fas fa-edit"></i></button>
                                                    <button class="admin-btn-icon delete" onclick="window.deleteTestimonial(${t.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            body.innerHTML = `
                <div class="admin-panel-head">
                    <h2><i class="fas fa-comment-dots"></i> Kelola Testimoni (${testimonials.length})</h2>
                    <button class="btn btn-primary btn-sm" onclick="window.openTestimonialModal()"><i class="fas fa-plus"></i> Tambah Testimoni</button>
                </div>
                <div class="admin-panel-body">${html}</div>
            `;
        }

        render();

        window.openTestimonialModal = function(id) {
            const testimonials = SKI.getData(SKI.KEYS.TESTIMONIALS, SKI.defaultTestimonials);
            const item = id ? testimonials.find(function(t) { return t.id === id; }) : { name: '', role: '', text: '', rating: 5, initial: '', id: 0 };
            openModal(`
                <h3>${id ? 'Edit' : 'Tambah'} Testimoni</h3>
                <form id="testimonialForm">
                    <div class="form-group"><label>Nama <span class="required">*</span></label><input class="form-control" id="tfName" value="${item.name || ''}" required></div>
                    <div class="form-group"><label>Peran</label><input class="form-control" id="tfRole" value="${item.role || ''}"></div>
                    <div class="form-group"><label>Isi Testimoni</label><textarea class="form-control" id="tfText" rows="3">${item.text || ''}</textarea></div>
                    <div class="form-group"><label>Rating (1-5)</label><input type="number" class="form-control" id="tfRating" min="1" max="5" value="${item.rating || 5}"></div>
                    <div class="form-group"><label>Inisial Avatar</label><input class="form-control" id="tfInitial" maxlength="1" value="${item.initial || item.name.charAt(0) || ''}"></div>
                    <button type="submit" class="btn btn-primary btn-block">${id ? 'Simpan Perubahan' : 'Tambah'}</button>
                </form>
            `);

            document.getElementById('testimonialForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const list = SKI.getData(SKI.KEYS.TESTIMONIALS, SKI.defaultTestimonials);
                const data = {
                    id: id || (list.length ? Math.max.apply(null, list.map(function(x) { return x.id; })) + 1 : 1),
                    name: document.getElementById('tfName').value,
                    role: document.getElementById('tfRole').value || '',
                    text: document.getElementById('tfText').value || '',
                    rating: parseInt(document.getElementById('tfRating').value) || 5,
                    initial: document.getElementById('tfInitial').value || document.getElementById('tfName').value.charAt(0)
                };
                if (id) {
                    const idx = list.findIndex(function(t) { return t.id === id; });
                    if (idx !== -1) list[idx] = data;
                } else {
                    list.push(data);
                }
                SKI.saveData(SKI.KEYS.TESTIMONIALS, list);
                closeModal();
                render();
                showToast('Testimoni berhasil disimpan!', 'success');
            });
        };

        window.deleteTestimonial = function(id) {
            if (!confirmDelete('Hapus testimoni ini?')) return;
            const list = SKI.getData(SKI.KEYS.TESTIMONIALS, SKI.defaultTestimonials);
            SKI.saveData(SKI.KEYS.TESTIMONIALS, list.filter(function(t) { return t.id !== id; }));
            render();
            showToast('Testimoni dihapus.', 'success');
        };
    }

    /* ====== CRUD: FAQ ====== */
    function initFaq() {
        const body = document.getElementById('adminSectionFaq');
        if (!body) return;

        function render() {
            const faq = SKI.getData(SKI.KEYS.FAQ, SKI.defaultFaq);
            let html = '';
            if (!faq.length) {
                html = '<div class="admin-empty"><i class="fas fa-question-circle"></i><h3>Belum ada FAQ</h3></div>';
            } else {
                html = `
                    <div class="admin-table-wrap">
                        <table class="admin-table">
                            <thead><tr><th>Pertanyaan</th><th>Aksi</th></tr></thead>
                            <tbody>
                                ${faq.map(function(f) {
                                    return `
                                        <tr>
                                            <td><strong>${f.q}</strong></td>
                                            <td>
                                                <div class="admin-actions">
                                                    <button class="admin-btn-icon edit" onclick="window.editFaq(${f.id})" title="Edit"><i class="fas fa-edit"></i></button>
                                                    <button class="admin-btn-icon delete" onclick="window.deleteFaq(${f.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            body.innerHTML = `
                <div class="admin-panel-head">
                    <h2><i class="fas fa-question-circle"></i> Kelola FAQ (${faq.length})</h2>
                    <button class="btn btn-primary btn-sm" onclick="window.openFaqModal()"><i class="fas fa-plus"></i> Tambah FAQ</button>
                </div>
                <div class="admin-panel-body">${html}</div>
            `;
        }

        render();

        window.openFaqModal = function(id) {
            const faq = SKI.getData(SKI.KEYS.FAQ, SKI.defaultFaq);
            const item = id ? faq.find(function(f) { return f.id === id; }) : { q: '', a: '', id: 0 };
            openModal(`
                <h3>${id ? 'Edit' : 'Tambah'} FAQ</h3>
                <form id="faqForm">
                    <div class="form-group"><label>Pertanyaan <span class="required">*</span></label><input class="form-control" id="ffQ" value="${item.q || ''}" required></div>
                    <div class="form-group"><label>Jawaban</label><textarea class="form-control" id="ffA" rows="4">${item.a || ''}</textarea></div>
                    <button type="submit" class="btn btn-primary btn-block">${id ? 'Simpan Perubahan' : 'Tambah'}</button>
                </form>
            `);

            document.getElementById('faqForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const list = SKI.getData(SKI.KEYS.FAQ, SKI.defaultFaq);
                const data = {
                    id: id || (list.length ? Math.max.apply(null, list.map(function(x) { return x.id; })) + 1 : 1),
                    q: document.getElementById('ffQ').value,
                    a: document.getElementById('ffA').value || ''
                };
                if (id) {
                    const idx = list.findIndex(function(f) { return f.id === id; });
                    if (idx !== -1) list[idx] = data;
                } else {
                    list.push(data);
                }
                SKI.saveData(SKI.KEYS.FAQ, list);
                closeModal();
                render();
                showToast('FAQ berhasil disimpan!', 'success');
            });
        };

        window.deleteFaq = function(id) {
            if (!confirmDelete('Hapus FAQ ini?')) return;
            const list = SKI.getData(SKI.KEYS.FAQ, SKI.defaultFaq);
            SKI.saveData(SKI.KEYS.FAQ, list.filter(function(f) { return f.id !== id; }));
            render();
            showToast('FAQ dihapus.', 'success');
        };
    }

    /* ====== CRUD: PENGATURAN ====== */
    function initSettings() {
        const body = document.getElementById('adminSectionSettings');
        if (!body) return;

        function render() {
            const settings = SKI.getData(SKI.KEYS.SETTINGS, SKI.defaultSettings);
            body.innerHTML = `
                <div class="admin-panel-head">
                    <h2><i class="fas fa-cog"></i> Pengaturan Kontak & Perusahaan</h2>
                </div>
                <div class="admin-panel-body">
                    <form id="settingsForm">
                        <div class="form-row">
                            <div class="form-group"><label>Nama Perusahaan</label><input class="form-control" id="sCompany" value="${settings.company || ''}"></div>
                            <div class="form-group"><label>Tagline</label><input class="form-control" id="sTagline" value="${settings.tagline || ''}"></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>WhatsApp (format: 628xx)</label><input class="form-control" id="sWhatsapp" value="${settings.whatsapp || ''}"></div>
                            <div class="form-group"><label>Email</label><input class="form-control" id="sEmail" value="${settings.email || ''}"></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>Telepon</label><input class="form-control" id="sPhone" value="${settings.phone || ''}"></div>
                            <div class="form-group"><label>Alamat</label><input class="form-control" id="sAddress" value="${settings.address || ''}"></div>
                        </div>
                        <div class="form-group"><label>URL Google Maps Embed</label><input class="form-control" id="sMapsUrl" value="${settings.mapsUrl || ''}"></div>
                        <div class="form-row">
                            <div class="form-group"><label>Instagram</label><input class="form-control" id="sInstagram" value="${settings.instagram || ''}"></div>
                            <div class="form-group"><label>Facebook</label><input class="form-control" id="sFacebook" value="${settings.facebook || ''}"></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>YouTube</label><input class="form-control" id="sYoutube" value="${settings.youtube || ''}"></div>
                            <div class="form-group"><label>Twitter/X</label><input class="form-control" id="sTwitter" value="${settings.twitter || ''}"></div>
                        </div>
                        <div class="form-group"><label>Jam Operasional</label><input class="form-control" id="sHours" value="${settings.hours || ''}"></div>
                        <div class="form-group"><label>Hari Tutup</label><input class="form-control" id="sClosed" value="${settings.closedDay || ''}"></div>
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan Pengaturan</button>
                    </form>
                </div>
            `;

            document.getElementById('settingsForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const settings = {
                    company: document.getElementById('sCompany').value,
                    tagline: document.getElementById('sTagline').value,
                    whatsapp: document.getElementById('sWhatsapp').value,
                    email: document.getElementById('sEmail').value,
                    phone: document.getElementById('sPhone').value,
                    address: document.getElementById('sAddress').value,
                    mapsUrl: document.getElementById('sMapsUrl').value,
                    instagram: document.getElementById('sInstagram').value,
                    facebook: document.getElementById('sFacebook').value,
                    youtube: document.getElementById('sYoutube').value,
                    twitter: document.getElementById('sTwitter').value,
                    hours: document.getElementById('sHours').value,
                    closedDay: document.getElementById('sClosed').value
                };
                SKI.saveData(SKI.KEYS.SETTINGS, settings);
                showToast('Pengaturan berhasil disimpan!', 'success');
            });
        }

        render();
    }

    /* ====== DASHBOARD STATS ====== */
    function initDashboard() {
        const statsContainer = document.getElementById('adminDashboardStats');
        if (!statsContainer) return;

        const articles = SKI.getData(SKI.KEYS.ARTICLES, SKI.defaultArticles);
        const gallery = SKI.getData(SKI.KEYS.GALLERY, SKI.defaultGallery);
        const koi = SKI.getData(SKI.KEYS.KOI, SKI.defaultKoi);
        const testimonials = SKI.getData(SKI.KEYS.TESTIMONIALS, SKI.defaultTestimonials);
        const faq = SKI.getData(SKI.KEYS.FAQ, SKI.defaultFaq);

        statsContainer.innerHTML = `
            <div class="admin-stat-card">
                <div class="admin-stat-icon blue"><i class="fas fa-file-alt"></i></div>
                <div><div class="admin-stat-value">${articles.length}</div><div class="admin-stat-label">Artikel</div></div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-icon green"><i class="fas fa-images"></i></div>
                <div><div class="admin-stat-value">${gallery.length}</div><div class="admin-stat-label">Galeri</div></div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-icon gold"><i class="fas fa-fish"></i></div>
                <div><div class="admin-stat-value">${koi.length}</div><div class="admin-stat-label">Koleksi Koi</div></div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-icon purple"><i class="fas fa-comment-dots"></i></div>
                <div><div class="admin-stat-value">${testimonials.length}</div><div class="admin-stat-label">Testimoni</div></div>
            </div>
        `;
    }

    /* ====== NAVIGASI (sidebar tabs) ====== */
    function initNavigation() {
        const navItems = document.querySelectorAll('.admin-nav-item');
        const sections = document.querySelectorAll('.admin-section');
        if (!navItems.length || !sections.length) return;

        navItems.forEach(function(item) {
            item.addEventListener('click', function() {
                const target = item.getAttribute('data-section');
                navItems.forEach(function(n) { n.classList.remove('active'); });
                item.classList.add('active');
                sections.forEach(function(s) {
                    s.style.display = s.id === target ? 'block' : 'none';
                });
            });
        });
    }

    /* ====== SIDEBAR TOGGLE (mobile) ====== */
    function initSidebarToggle() {
        const toggle = document.querySelector('.admin-sidebar-toggle');
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.admin-nav-overlay');
        if (!toggle || !sidebar) return;
        if (!overlay) {
            const el = document.createElement('div');
            el.className = 'admin-nav-overlay';
            document.body.appendChild(el);
        }
        const navOverlay = document.querySelector('.admin-nav-overlay');

        toggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            navOverlay.classList.toggle('active');
        });
        navOverlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            navOverlay.classList.remove('active');
        });
    }

    /* ====== MODAL HELPER ====== */
    function openModal(contentHtml, wide) {
        let modal = document.querySelector('.admin-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'admin-modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="admin-modal-box ${wide ? 'wide' : ''}">
                <div class="admin-modal-head">
                    <h3></h3>
                    <button class="admin-modal-close" aria-label="Tutup"><i class="fas fa-times"></i></button>
                </div>
                <div class="admin-modal-body">${contentHtml}</div>
            </div>
        `;
        modal.classList.add('active');
        modal.querySelector('.admin-modal-close').addEventListener('click', function() {
            closeModal();
        });
        modal.querySelector('.admin-modal-box h3').innerHTML = contentHtml.match(/<h3>(.*?)<\/h3>/) ? contentHtml.match(/<h3>(.*?)<\/h3>/)[1] : '';
    }

    function closeModal() {
        const modal = document.querySelector('.admin-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    window.closeModal = closeModal;

    /* ====== TOAST ====== */
    function showToast(message, type) {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }

    /* ====== INIT ADMIN ====== */
    function init() {
        if (isAuthenticated()) {
            initLogout();
            initNavigation();
            initSidebarToggle();
            initDashboard();
            initArticles();
            initGallery();
            initKoi();
            initTestimonials();
            initFaq();
            initSettings();
        } else if (document.getElementById('adminLoginForm')) {
            initLogin();
        } else if (document.querySelector('.admin-layout')) {
            // Akses admin.html tanpa login -> redirect ke login
            window.location.href = 'admin-login.html';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();