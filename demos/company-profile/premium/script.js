// ===========================================
// LaptopPro Distributor — Premium Script
// ===========================================

// ===== PRELOADER =====
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => preloader.classList.add('hidden'), 800);
    }
});

// ===== CLEAN URL ROUTER =====
(function() {
    // Map of clean routes to actual HTML files
    const routes = {
        '': 'index.html',
        'index': 'index.html',
        'about': 'about.html',
        'products': 'products.html',
        'product-detail': 'product-detail.html',
        'portfolio': 'portfolio.html',
        'blog': 'blog.html',
        'blog-post': 'blog-post.html',
        'testimonials': 'testimonials.html',
        'contact': 'contact.html',
        'faq': 'faq.html',
        'admin': 'admin/index.html'
    };

    // Get current page name from URL
    function getCurrentPage() {
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);
        let last = parts[parts.length - 1] || 'index';
        // Remove .html if present
        if (last.endsWith('.html')) last = last.slice(0, -5);
        return last;
    }

    // Navigate to a page with clean URL
    function navigateTo(page, pushState = true) {
        const file = routes[page] || page + '.html';
        const cleanUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + page;
        
        // Fetch the page content
        fetch(file)
            .then(res => {
                if (!res.ok) throw new Error('Page not found');
                return res.text();
            })
            .then(html => {
                // Extract body content
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.body.innerHTML;
                const newTitle = doc.title;
                const newHead = doc.head.innerHTML;
                
                // Update head (scripts, styles, etc)
                document.head.innerHTML = newHead;
                
                // Update body content
                document.body.innerHTML = newContent;
                
                // Update title
                document.title = newTitle;
                
                // Push state if needed
                if (pushState) {
                    window.history.pushState({ page: page }, newTitle, cleanUrl);
                }
                
                // Re-initialize all functions after content load
                reinitializeApp();
            })
            .catch(err => {
                console.error('Route error:', err);
                // Fallback: direct navigation (will show .html but works)
                if (pushState) {
                    window.location.href = file;
                }
            });
    }

    // Handle popstate (back/forward buttons)
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            navigateTo(e.state.page, false);
        } else {
            const page = getCurrentPage();
            navigateTo(page, false);
        }
    });

    // Intercept all internal navigation links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Skip external links, anchors, and javascript:
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('//')) return;
        if (link.target === '_blank') return;
        
        // Skip links containing /admin/ or going to admin
        if (href.includes('admin') || href.startsWith('admin')) return;
        
        // Get the page name (remove .html if present)
        let page = href;
        if (page.endsWith('.html')) page = page.slice(0, -5);
        
        // Check if it's a known route
        if (routes[page] || page.endsWith('.html') === false) {
            e.preventDefault();
            navigateTo(page);
        }
    });

    // Initialize: if current URL has clean route, handle it
    const currentPage = getCurrentPage();
    if (currentPage && currentPage !== 'index' && routes[currentPage]) {
        // If URL is clean (no .html), load via router
        if (!window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('/')) {
            navigateTo(currentPage, false);
        }
    }

    // Re-initialize function - called after each page load
    window.reinitializeApp = function() {
        initNav();
        initScroll();
        initAnimations();
        initFaq();
        initFilters();
        initCart();
        initContactForm();
        initLanguageSwitcher();
        initProductDetail();
        initBlogPost();
        initPreloader();
    };

    // ===== INITIALIZATION FUNCTIONS =====
    
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => preloader.classList.add('hidden'), 800);
        }
    }

    function initNav() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    function initScroll() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            });
        }
    }

    function initAnimations() {
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        if (animateElements.length) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
            animateElements.forEach(el => observer.observe(el));
        }
    }

    function initFaq() {
        document.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('open');
            });
        });
    }

    function initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const filterCards = document.querySelectorAll('.portfolio-card, .product-card');
        if (filterBtns.length && filterCards.length) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => {
                        b.classList.remove('active');
                        if (b.classList.contains('btn-primary')) {
                            b.classList.remove('btn-primary');
                            b.classList.add('btn-outline');
                        }
                    });
                    btn.classList.add('active');
                    btn.classList.remove('btn-outline');
                    btn.classList.add('btn-primary');
                    const filter = btn.dataset.filter;
                    filterCards.forEach(card => {
                        if (filter === 'all' || card.dataset.cat === filter) {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
        }
    }

    // ===== SHOPPING CART =====
    let cart = JSON.parse(localStorage.getItem('laptopProCart')) || [];

    function formatPrice(price) {
        return 'Rp ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function updateCartUI() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        if (!cartItems || !cartTotal) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--text-muted)"><i class="fas fa-shopping-bag" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.2"></i><p>Keranjang masih kosong</p></div>';
            cartTotal.textContent = 'Rp 0';
            return;
        }

        let html = '';
        let total = 0;
        cart.forEach((item, index) => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            html += `
                <div class="cart-item">
                    <div class="cart-item-img"><i class="fas fa-laptop"></i></div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="price">${formatPrice(item.price)}</div>
                        <div class="cart-item-qty">
                            <button onclick="changeQty(${index}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
        });
        cartItems.innerHTML = html;
        cartTotal.textContent = formatPrice(total);
        localStorage.setItem('laptopProCart', JSON.stringify(cart));
    }

    window.changeQty = function(index, delta) {
        if (cart[index]) {
            cart[index].qty = Math.max(1, cart[index].qty + delta);
            updateCartUI();
        }
    };

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    function initCart() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.dataset.id;
                const name = this.dataset.name;
                const price = parseInt(this.dataset.price);
                const existing = cart.find(item => item.id === id);
                if (existing) {
                    existing.qty += 1;
                } else {
                    cart.push({ id, name, price, qty: 1 });
                }
                updateCartUI();
                openCart();
                this.innerHTML = '<i class="fas fa-check"></i> Ditambahkan';
                this.style.background = '#10b981';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-shopping-cart"></i> Keranjang';
                    this.style.background = '';
                }, 1500);
            });
        });

        // Cart toggle
        const cartToggle = document.getElementById('cartToggle');
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        const cartClose = document.getElementById('cartClose');

        window.openCart = function() {
            if (cartSidebar) cartSidebar.classList.add('open');
            if (cartOverlay) cartOverlay.classList.add('open');
        };
        window.closeCart = function() {
            if (cartSidebar) cartSidebar.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('open');
        };

        if (cartToggle) cartToggle.addEventListener('click', openCart);
        if (cartClose) cartClose.addEventListener('click', closeCart);
        if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

        // Checkout via WhatsApp
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function(e) {
                if (cart.length === 0) {
                    e.preventDefault();
                    alert('Keranjang masih kosong!');
                    return;
                }
                let message = 'Halo LaptopPro, saya ingin memesan:\n\n';
                let total = 0;
                cart.forEach(item => {
                    const subtotal = item.price * item.qty;
                    total += subtotal;
                    message += `- ${item.name} x${item.qty} = ${formatPrice(subtotal)}\n`;
                });
                message += `\nTotal: ${formatPrice(total)}\n\nMohon info ketersediaan dan konfirmasi.`;
                this.href = `https://wa.me/6281298578909?text=${encodeURIComponent(message)}`;
            });
        }

        updateCartUI();
    }

    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('formName')?.value || '';
                const email = document.getElementById('formEmail')?.value || '';
                const subject = document.getElementById('formSubject')?.value || '';
                const message = document.getElementById('formMessage')?.value || '';
                const waMessage = `Halo LaptopPro,\n\nNama: ${name}\nEmail: ${email}\nSubjek: ${subject}\nPesan: ${message}\n\nMohon direspon.`;
                window.open(`https://wa.me/6281298578909?text=${encodeURIComponent(waMessage)}`, '_blank');
            });
        }
    }

    function initLanguageSwitcher() {
        document.querySelectorAll('.lang-switcher button').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.lang-switcher button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const lang = this.dataset.lang;
                if (lang === 'en') {
                    document.querySelectorAll('[data-lang-id]').forEach(el => {
                        el.textContent = el.dataset.langEn || el.textContent;
                    });
                } else {
                    document.querySelectorAll('[data-lang-id]').forEach(el => {
                        el.textContent = el.dataset.langId || el.textContent;
                    });
                }
            });
        });
    }

    function initProductDetail() {
        if (window.location.pathname.includes('product-detail')) {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            if (productId) {
                const products = {
                    1: { name: 'ThinkPad X1 Carbon Gen 11', brand: 'Lenovo', price: 18999000, oldPrice: 22500000, specs: ['i7-1365U', '16GB DDR5', '512GB SSD', '14" FHD IPS'], desc: 'Laptop bisnis premium dengan performa tinggi dan portabilitas maksimal. Dilengkapi prosesor Intel Core i7 generasi 13, RAM 16GB, dan desain ultra-ringan hanya 1.12kg.' },
                    2: { name: 'MacBook Pro M3 Pro', brand: 'Apple', price: 29999000, oldPrice: 33999000, specs: ['M3 Pro Chip', '18GB Unified', '512GB SSD', '16.2" Liquid Retina XDR'], desc: 'Laptop profesional dengan chip Apple M3 Pro yang powerful. Layar Liquid Retina XDR stunning, baterai tahan seharian, ideal untuk kreator profesional.' },
                    3: { name: 'ROG Zephyrus G14', brand: 'Asus', price: 24999000, oldPrice: 28999000, specs: ['R9 7940HS', '32GB DDR5', '1TB SSD', '14" QHD 165Hz'], desc: 'Laptop gaming ultra-portabel dengan performa desktop. AMD Ryzen 9 dan NVIDIA GeForce RTX 4060, layar QHD 165Hz, cocok untuk gaming dan produktivitas.' }
                };
                const product = products[productId] || products[1];
                document.title = `${product.name} — LaptopPro Distributor`;
                const titleEl = document.getElementById('productTitle');
                const brandEl = document.getElementById('productBrand');
                const priceEl = document.getElementById('productPrice');
                const oldPriceEl = document.getElementById('productOldPrice');
                const descEl = document.getElementById('productDesc');
                const specsEl = document.getElementById('productSpecs');
                if (titleEl) titleEl.textContent = product.name;
                if (brandEl) brandEl.textContent = product.brand;
                if (priceEl) priceEl.textContent = formatPrice(product.price);
                if (oldPriceEl) oldPriceEl.textContent = formatPrice(product.oldPrice);
                if (descEl) descEl.textContent = product.desc;
                if (specsEl) {
                    specsEl.innerHTML = product.specs.map(s => `<span style="padding:6px 14px;background:#f1f5f9;border-radius:6px;font-size:12px;color:var(--text-muted)">${s}</span>`).join('');
                }
                const addBtn = document.getElementById('productAddToCart');
                if (addBtn) {
                    addBtn.dataset.id = productId;
                    addBtn.dataset.name = product.name;
                    addBtn.dataset.price = product.price;
                }
            }
        }
    }

    function initBlogPost() {
        if (window.location.pathname.includes('blog-post')) {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            if (postId) {
                const posts = {
                    1: { title: 'Panduan Memilih Laptop untuk Programmer 2026', cat: 'Tips & Tutorial', date: '15 Juli 2026', content: '<p>Memilih laptop untuk programming membutuhkan pertimbangan khusus. Berikut panduan lengkapnya:</p><h3>1. Prosesor (CPU)</h3><p>Untuk programming, minimal gunakan Intel Core i5 generasi 12 atau AMD Ryzen 5. Untuk pengembangan yang lebih berat seperti machine learning atau kompilasi besar, pilih i7/i9 atau Ryzen 7/9.</p><h3>2. RAM</h3><p>8GB adalah minimum, 16GB sangat direkomendasikan. Untuk virtualisasi dan container, 32GB ideal.</p><h3>3. Penyimpanan</h3><p>SSD NVMe minimal 512GB. Kecepatan baca/tulis tinggi sangat mempengaruhi produktivitas.</p><h3>4. Layar</h3><p>Resolusi minimal Full HD, lebih baik QHD atau 4K. Ukuran 14-15.6 inci ideal untuk keseimbangan portabilitas dan kenyamanan.</p><h3>5. Sistem Operasi</h3><p>Pilih sesuai kebutuhan: Windows untuk fleksibilitas, macOS untuk pengembangan iOS, Linux untuk pengembangan server.</p>' },
                    2: { title: 'Tren Laptop AI: Masa Depan Komputasi Personal', cat: 'Berita Industri', date: '10 Juli 2026', content: '<p>Teknologi AI semakin terintegrasi dalam laptop modern. Berikut tren terbaru yang perlu Anda ketahui:</p><h3>NPU (Neural Processing Unit)</h3><p>Chip khusus untuk mempercepat tugas AI langsung di perangkat, tanpa perlu cloud. Intel Core Ultra dan AMD Ryzen 7000 series sudah dilengkapi NPU.</p><h3>AI-Assisted Productivity</h3><p>Fitur seperti Windows Copilot, real-time translation, dan smart scheduling semakin umum di laptop modern.</p><h3>AI untuk Gaming</h3><p>DLSS 3 dan FSR 3 menggunakan AI untuk meningkatkan performa gaming secara signifikan.</p>' },
                    3: { title: 'Rekomendasi Laptop Gaming 2026: Dari Entry ke High-End', cat: 'Gaming', date: '5 Juli 2026', content: '<p>Bingung memilih laptop gaming? Berikut rekomendasi untuk berbagai budget:</p><h3>Entry Level (Rp 10-15 Juta)</h3><p>Lenovo LOQ 15, Acer Nitro 5, Asus TUF Gaming A15. Cukup untuk game e-sports dan AAA di setting medium.</p><h3>Mid Range (Rp 15-25 Juta)</h3><p>MSI Katana 15, HP Victus 16, Lenovo Legion 5. Mampu menjalankan game AAA di setting high.</p><h3>High-End (Rp 25-40 Juta)</h3><p>Asus ROG Zephyrus, Acer Predator Helios, MSI Stealth. Performa maksimal untuk gaming dan kreator.</p>' }
                };
                const post = posts[postId] || posts[1];
                document.title = `${post.title} — LaptopPro Blog`;
                const titleEl = document.getElementById('postTitle');
                const catEl = document.getElementById('postCat');
                const dateEl = document.getElementById('postDate');
                const contentEl = document.getElementById('postContent');
                if (titleEl) titleEl.textContent = post.title;
                if (catEl) catEl.textContent = post.cat;
                if (dateEl) dateEl.textContent = post.date;
                if (contentEl) contentEl.innerHTML = post.content;
            }
        }
    }

    // ===== RUN INITIALIZATION =====
    reinitializeApp();
})();

console.log('LaptopPro Distributor — Premium Website Loaded with Clean URL Router');