/* ==================================================
   SAKURA KOI INDONESIA - Render Data ke Halaman Publik
   Membaca data dari localStorage (SKI) dan merendernya
   ke elemen yang ditandai data-render.
   Memungkinkan perubahan admin langsung tampil di publik.
   ================================================== */

(function() {
    'use strict';

    /* Ambil data dari localStorage */
    function getArticles() {
        return window.SKI ? SKI.getData(SKI.KEYS.ARTICLES, SKI.defaultArticles) : [];
    }
    function getGallery() {
        return window.SKI ? SKI.getData(SKI.KEYS.GALLERY, SKI.defaultGallery) : [];
    }
    function getKoi() {
        return window.SKI ? SKI.getData(SKI.KEYS.KOI, SKI.defaultKoi) : [];
    }
    function getTestimonials() {
        return window.SKI ? SKI.getData(SKI.KEYS.TESTIMONIALS, SKI.defaultTestimonials) : [];
    }
    function getFaq() {
        return window.SKI ? SKI.getData(SKI.KEYS.FAQ, SKI.defaultFaq) : [];
    }
    function getSettings() {
        return window.SKI ? SKI.getData(SKI.KEYS.SETTINGS, SKI.defaultSettings) : {};
    }

    /* ===== RENDER SETTINGS (kontak, footer, dll) ===== */
    function renderSettings() {
        const settings = getSettings();

        // Update elemen dengan data-setting (teks)
        document.querySelectorAll('[data-setting]').forEach(function(el) {
            const key = el.getAttribute('data-setting');
            if (settings[key]) {
                el.textContent = settings[key];
                // Set href untuk email
                if (key === 'email' && el.tagName === 'A') {
                    el.href = 'mailto:' + settings.email;
                }
            }
        });

        // Update semua elemen WhatsApp (data-setting-whatsapp -> href wa.me)
        document.querySelectorAll('[data-setting-whatsapp]').forEach(function(el) {
            if (settings.whatsapp) {
                el.href = 'https://wa.me/' + settings.whatsapp;
            }
        });

        // Update iframe maps
        document.querySelectorAll('iframe[data-maps]').forEach(function(iframe) {
            iframe.src = settings.mapsUrl || iframe.getAttribute('data-maps');
        });

        // Update tahun copyright otomatis
        const yearEl = document.getElementById('year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

    /* ===== RENDER ARTIKEL (blog list) ===== */
    function renderArticles() {
        const container = document.querySelector('[data-render="articles"]');
        if (!container) return;

        const articles = getArticles().filter(function(a) { return a.status !== 'draft'; });

        if (!articles.length) {
            container.innerHTML = '<div class="admin-empty"><i class="fas fa-file-alt"></i><h3>Belum ada artikel</h3><p>Artikel akan segera hadir.</p></div>';
            return;
        }

        container.innerHTML = articles.map(function(article, idx) {
            return `
                <article class="article-card reveal ${idx % 3 === 1 ? 'stagger-delay-2' : ''}">
                    <a href="blog-detail.html?id=${article.id}" class="article-thumb">
                        <img src="${article.image || 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&q=80'}" alt="${article.title}" loading="lazy">
                        <span class="article-cat">${article.category}</span>
                        <span class="article-date"><i class="far fa-calendar-alt"></i> ${article.date}</span>
                    </a>
                    <div class="article-body">
                        <h3><a href="blog-detail.html?id=${article.id}">${article.title}</a></h3>
                        <p>${article.summary}</p>
                        <div class="article-meta">
                            <span><i class="far fa-user"></i> ${article.author}</span>
                            <a href="blog-detail.html?id=${article.id}" class="read-more">Baca Selengkapnya <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    /* ===== RENDER 3 ARTIKEL TERBARU (home) ===== */
    function renderLatestArticles() {
        const container = document.querySelector('[data-render="latest-articles"]');
        if (!container) return;

        const articles = getArticles().filter(function(a) { return a.status !== 'draft'; });
        const latest = articles.slice(0, 3);

        if (!latest.length) return;

        container.innerHTML = latest.map(function(article) {
            return `
                <article class="article-card reveal">
                    <a href="blog-detail.html?id=${article.id}" class="article-thumb">
                        <img src="${article.image || 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&q=80'}" alt="${article.title}" loading="lazy">
                        <span class="article-cat">${article.category}</span>
                        <span class="article-date"><i class="far fa-calendar-alt"></i> ${article.date}</span>
                    </a>
                    <div class="article-body">
                        <h3><a href="blog-detail.html?id=${article.id}">${article.title}</a></h3>
                        <p>${article.summary}</p>
                        <div class="article-meta">
                            <span><i class="far fa-user"></i> ${article.author}</span>
                            <a href="blog-detail.html?id=${article.id}" class="read-more">Baca <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    /* ===== RENDER GALERI ===== */
    function renderGallery() {
        const container = document.querySelector('[data-render="gallery"]');
        if (!container) return;

        const gallery = getGallery();
        if (!gallery.length) {
            container.innerHTML = '<div class="admin-empty"><i class="fas fa-images"></i><h3>Galeri kosong</h3></div>';
            return;
        }

        // Buat array dari data
        const items = gallery.map(function(item, idx) {
            return `
                <div class="gallery-item reveal" data-category="${item.category}" data-title="${item.title}">
                    <img src="${item.img}" alt="${item.title}" loading="lazy">
                    <div class="gallery-item-overlay">
                        <span>${item.category}</span>
                        <h3>${item.title}</h3>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = items;

        // Re-enable gallery filter (karena DOM baru)
        window.dispatchEvent(new CustomEvent('ski:galleryRendered'));
    }

    /* ===== RENDER KOI (collection list) ===== */
    function renderKoi() {
        const container = document.querySelector('[data-render="koi"]');
        if (!container) return;

        const koi = getKoi();
        if (!koi.length) {
            container.innerHTML = '<div class="admin-empty"><i class="fas fa-fish"></i><h3>Belum ada koleksi koi</h3></div>';
            return;
        }

        container.innerHTML = koi.map(function(item, idx) {
            return `
                <a href="detail-kohaku.html?id=${item.id}" class="koi-card reveal ${idx % 4 === 3 ? 'stagger-delay-4' : ''}">
                    <div class="koi-card-image">
                        <img src="${item.image}" alt="${item.name} - ${item.japanese}" loading="lazy">
                        <span class="koi-card-badge">${item.category}</span>
                    </div>
                    <div class="koi-card-body">
                        <h3>${item.name} <span class="jap">${item.japanese}</span></h3>
                        <p>${item.desc}</p>
                        <div class="koi-card-footer">
                            <span class="koi-price">Mulai ${item.price}</span>
                            <span class="koi-link">Detail <i class="fas fa-arrow-right"></i></span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    }

    /* ===== RENDER 4 KOI FEATURED (home) ===== */
    function renderFeaturedKoi() {
        const container = document.querySelector('[data-render="featured-koi"]');
        if (!container) return;

        const koi = getKoi();
        const featured = koi.filter(function(item) { return item.featured; });
        const selected = featured.length >= 4 ? featured.slice(0, 4) : (koi.length >= 4 ? koi.slice(0, 4) : koi);

        if (!selected.length) return;

        container.innerHTML = selected.map(function(item) {
            return `
                <a href="detail-kohaku.html?id=${item.id}" class="koi-card reveal">
                    <div class="koi-card-image">
                        <img src="${item.image}" alt="${item.name} - ${item.japanese}" loading="lazy">
                        <span class="koi-card-badge">${item.category}</span>
                        <span class="koi-card-category">Populer</span>
                    </div>
                    <div class="koi-card-body">
                        <h3>${item.name} <span class="jap">${item.japanese}</span></h3>
                        <p>${item.desc}</p>
                        <div class="koi-card-footer">
                            <span class="koi-price">Mulai ${item.price}</span>
                            <span class="koi-link">Detail <i class="fas fa-arrow-right"></i></span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    }

    /* ===== RENDER TESTIMONI (slider) ===== */
    function renderTestimonials() {
        const container = document.querySelector('[data-render="testimonials"]');
        if (!container) return;

        const testimonials = getTestimonials();
        if (!testimonials.length) return;

        container.innerHTML = testimonials.map(function(t) {
            let stars = '';
            for (let i = 0; i < 5; i++) {
                stars += i < t.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
            }
            return `
                <div class="review-slide">
                    <div class="review-card">
                        <div class="review-quote"><i class="fas fa-quote-left"></i></div>
                        <div class="review-stars">${stars}</div>
                        <p class="review-text">"${t.text}"</p>
                        <div class="review-author">
                            <div class="review-avatar">${t.initial || t.name.charAt(0)}</div>
                            <div style="text-align:left">
                                <h4>${t.name}</h4>
                                <span>${t.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Re-init slider (slider.js sudah berjalan, tapi DOM baru dibuat)
        if (window.SKISlider) window.SKISlider.init();
    }

    /* ===== RENDER FAQ ===== */
    function renderFaq() {
        const container = document.querySelector('[data-render="faq"]');
        if (!container) return;

        const faq = getFaq();
        if (!faq.length) {
            container.innerHTML = '<div class="admin-empty"><i class="fas fa-question-circle"></i><h3>Belum ada FAQ</h3></div>';
            return;
        }

        container.innerHTML = faq.map(function(item, idx) {
            return `
                <div class="faq-item reveal">
                    <button class="faq-question" aria-expanded="false">
                        <span>${item.q}</span>
                        <span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer-inner">${item.a}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /* ===== RENDER DETAIL ARTIKEL ===== */
    function renderArticleDetail() {
        const container = document.querySelector('[data-render="article-detail"]');
        if (!container) return;

        // Ambil id dari URL
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id')) || 1;

        const articles = getArticles();
        const article = articles.find(function(a) { return a.id === id; }) || articles[0];

        if (!article) return;

        container.innerHTML = `
            <div class="blog-detail">
                <div class="blog-detail-hero">
                    <img src="${article.image}" alt="${article.title}">
                    <div class="blog-detail-hero-overlay"></div>
                    <div class="blog-detail-meta">
                        <h1>${article.title}</h1>
                        <div class="blog-meta-line">
                            <span><i class="far fa-user"></i> ${article.author}</span>
                            <span><i class="far fa-calendar-alt"></i> ${article.date}</span>
                            <span><i class="far fa-clock"></i> ${article.readTime}</span>
                        </div>
                    </div>
                </div>
                <div class="blog-detail-content">
                    <p>${article.summary}</p>
                    <p>Koi adalah simbol keberuntungan, ketekunan, dan kesuksesan dalam budaya Jepang. Dalam artikel ini, kami akan membahas secara mendalam tentang keindahan dan perawatan koi Jepang.</p>
                    <h2>Pendahuluan</h2>
                    <p>Sejak berabad-abad lalu, koi atau <em>nishikigoi</em> telah menjadi bagian penting dari kebudayaan Jepang. Ikan cantik ini tidak hanya berfungsi sebagai hiasan kolam, tetapi juga membawa filosofi hidup yang dalam bagi para penggemarnya.</p>
                    <blockquote>"Koi tidak pernah menyerah untuk berenang melawan arus. Mereka terus maju meski menghadapi rintangan — sebuah pelajaran berharga bagi kehidupan."</blockquote>
                    <h2>Mengapa Memilih Koi?</h2>
                    <p>Koi memiliki beragam pola dan warna yang memukau, mulai dari Kohaku yang klasik hingga Ogon yang berkilau emas. Setiap jenis memiliki keunikan tersendiri yang dapat menyesuaikan dengan selera dan tema kolam Anda.</p>
                    <ul>
                        <li>Simbol keberuntungan dan kemakmuran</li>
                        <li>Mudah dipelihara jika kolam dirancang dengan baik</li>
                        <li>Berumur panjang, bisa mencapai 25-30 tahun</li>
                        <li>Nilai investasi yang terus meningkat untuk koi berkualitas</li>
                    </ul>
                    <h2>Perawatan dan Pemeliharaan</h2>
                    <p>Kualitas air adalah kunci utama kesehatan koi. Pastikan sistem filtrasi berjalan optimal, lakukan penggantian air secara berkala, dan berikan pakan berkualitas tinggi untuk mendukung pertumbuhan dan kecerahan warna.</p>
                    <img src="https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&q=80" alt="Kolam koi yang indah">
                    <h2>Kesimpulan</h2>
                    <p>Memelihara koi adalah pengalaman yang menenangkan sekaligus mengasyikkan. Dengan pengetahuan yang tepat dan komitmen untuk memberikan perawatan terbaik, koi Anda akan tumbuh sehat dan indah selama bertahun-tahun.</p>
                </div>
                <div class="blog-tags">
                    <span>#Koi</span>
                    <span>#Jepang</span>
                    <span>#Perawatan</span>
                    <span>#${article.category.replace(/\s/g, '')}</span>
                </div>
            </div>
        `;
    }

    /* ===== RENDER DETAIL KOI (detail-kohaku) ===== */
    function renderKoiDetail() {
        const container = document.querySelector('[data-render="koi-detail"]');
        if (!container) return;

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || 'kohaku';

        const koi = getKoi();
        const item = koi.find(function(k) { return k.id === id; }) || koi[0];

        if (!item) return;

        container.innerHTML = `
            <div class="detail-grid">
                <div class="detail-gallery">
                    <div class="detail-main-img">
                        <img src="${item.image}" alt="${item.name}" id="detailMainImg">
                    </div>
                    <div class="detail-thumbs">
                        <img src="${item.image}" alt="Thumbnail ${item.name}" class="detail-thumb active" onclick="window.changeDetailImg(this)">
                        <img src="https://images.unsplash.com/photo-1559481169-357b65f8d949?w=200&q=80" alt="Alternatif ${item.name}" class="detail-thumb" onclick="window.changeDetailImg(this)">
                        <img src="https://images.unsplash.com/photo-1545468800-85c963d5db48?w=200&q=80" alt="Alternatif 2 ${item.name}" class="detail-thumb" onclick="window.changeDetailImg(this)">
                    </div>
                </div>
                <div class="detail-info">
                    <span class="detail-category">${item.category}</span>
                    <h1>${item.name} <span class="jap">${item.japanese}</span></h1>
                    <p class="detail-desc">${item.desc}</p>
                    <div class="detail-price">Mulai dari <strong>${item.price}</strong></div>
                    <div class="detail-spec-list">
                        <div class="detail-spec"><span>Ukuran</span><strong>25 - 35 cm</strong></div>
                        <div class="detail-spec"><span>Usia</span><strong>3 - 5 Tahun</strong></div>
                        <div class="detail-spec"><span>Asal</span><strong>Niigata, Jepang</strong></div>
                        <div class="detail-spec"><span>Ketersediaan</span><strong class="green">Stok Tersedia</strong></div>
                    </div>
                    <div class="detail-cta">
                        <a href="contact.html" class="btn btn-primary"><i class="fas fa-shopping-cart"></i> Pesan Sekarang</a>
                        <a href="#" class="btn btn-outline-dark" onclick="window.open('https://wa.me/6281234567890?text=Halo, saya tertarik dengan ${item.name}', '_blank')"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    </div>
                </div>
            </div>
            <div class="detail-sections">
                <div class="detail-section">
                    <h2><i class="fas fa-heart"></i> Karakteristik</h2>
                    <p>${item.name} memiliki pola yang indah dan karakter yang tenang. Sangat cocok untuk kolam Anda baik untuk pemula maupun kolektor berpengalaman. Perawatannya mudah dan adaptif terhadap berbagai kondisi air.</p>
                </div>
                <div class="detail-section">
                    <h2><i class="fas fa-water"></i> Perawatan</h2>
                    <p>Disarankan kolam dengan filtrasi yang baik, suhu air optimal 18-24°C, serta pakan berkualitas yang mengandung bahan untuk mempertegas warna. Lakukan penggantian air 10-20% setiap minggu.</p>
                </div>
            </div>
        `;
    }

    /* Ganti gambar utama detail (panggilan dari onclick) */
    window.changeDetailImg = function(el) {
        const mainImg = document.getElementById('detailMainImg');
        if (mainImg) mainImg.src = el.src;
        document.querySelectorAll('.detail-thumb').forEach(function(thumb) {
            thumb.classList.remove('active');
        });
        el.classList.add('active');
    };

    /* ===== SEMUA RENDER ===== */
    function init() {
        renderSettings();
        renderArticles();
        renderLatestArticles();
        renderGallery();
        renderKoi();
        renderFeaturedKoi();
        renderTestimonials();
        renderFaq();
        renderArticleDetail();
        renderKoiDetail();
    }

    /* Expose untuk dipanggil ulang setelah admin update */
    window.SKIRender = {
        init: init,
        renderArticles: renderArticles,
        renderGallery: renderGallery,
        renderKoi: renderKoi,
        renderFaq: renderFaq,
        renderSettings: renderSettings
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();