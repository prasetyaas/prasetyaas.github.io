// ===== DATA KEYS (sama dengan admin.js) =====
const KEYS = {
    profile: 'km_profile',
    hero: 'km_hero',
    portfolio: 'km_portfolio',
    testimonials: 'km_testimonials',
    blog: 'km_blog',
    contact: 'km_contact'
};

const defaults = {
    profile: { name: 'Karya Mandiri', tagline: 'Mitra Terpercaya Solusi Digital Anda', desc: 'Kami menghadirkan website profesional yang tidak hanya cantik, tapi juga bekerja keras untuk bisnis Anda.', year: '2015' },
    hero: { title: 'Mitra Terpercaya', highlight: 'Solusi Digital', desc: 'Kami menghadirkan website profesional yang tidak hanya cantik, tapi juga bekerja keras untuk bisnis Anda. Dari company profile hingga sistem kompleks.' },
    portfolio: [
        { name: 'PT Maju Bersama', cat: 'web', desc: 'Website company profile modern dengan desain premium dan animasi halus.' },
        { name: 'Toko Online Bahagia', cat: 'ecommerce', desc: 'Toko online dengan payment gateway dan manajemen produk lengkap.' },
        { name: 'Klinik Sehat Keluarga', cat: 'web', desc: 'Website klinik dengan informasi layanan, jadwal dokter, dan lokasi.' }
    ],
    testimonials: [
        { name: 'Andi Pratama', role: 'CEO, PT Maju Bersama', text: 'Hasilnya melebihi ekspektasi! Website company profile kami jadi jauh lebih profesional. Proses cepat dan komunikasi sangat baik.' },
        { name: 'Siti Rahma', role: 'Owner, Toko Bahagia', text: 'Pelayanan sangat memuaskan! Tim sangat responsif dan hasil desainnya premium.' },
        { name: 'Budi Santoso', role: 'Founder, StartupX', text: 'Professional banget! Website yang dibuat berhasil meningkatkan kepercayaan pelanggan kami.' }
    ],
    blog: [
        { title: 'Pentingnya Website untuk Bisnis UMKM', content: 'Di era digital ini, memiliki website adalah kebutuhan mutlak bagi setiap bisnis. Website membantu meningkatkan kredibilitas dan jangkauan pasar Anda.' },
        { title: 'Tips Memilih Desain Website yang Tepat', content: 'Desain website yang baik tidak hanya cantik, tapi juga harus user-friendly dan sesuai dengan identitas brand Anda.' }
    ],
    contact: { wa: '6281298578909', email: 'hello@karyamandiri.com', address: 'Jl. Merdeka No. 123, Jakarta Pusat', ig: '@karyamandiri.official', fb: 'Karya Mandiri Official' }
};

function getData(key) {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    if (defaults[key]) {
        localStorage.setItem(key, JSON.stringify(defaults[key]));
        return defaults[key];
    }
    return null;
}

// ===== LOAD CONTENT =====
function loadDynamicContent() {
    // Profile
    const profile = getData(KEYS.profile);
    document.querySelectorAll('[data-profile="name"]').forEach(el => el.textContent = profile.name);
    document.querySelectorAll('[data-profile="tagline"]').forEach(el => el.textContent = profile.tagline);
    document.querySelectorAll('[data-profile="desc"]').forEach(el => el.textContent = profile.desc);
    document.querySelectorAll('[data-profile="year"]').forEach(el => el.textContent = profile.year);

    // Hero
    const hero = getData(KEYS.hero);
    document.querySelectorAll('[data-hero="title"]').forEach(el => el.textContent = hero.title);
    document.querySelectorAll('[data-hero="highlight"]').forEach(el => el.textContent = hero.highlight);
    document.querySelectorAll('[data-hero="desc"]').forEach(el => el.textContent = hero.desc);

    // Contact
    const contact = getData(KEYS.contact);
    document.querySelectorAll('[data-contact="wa"]').forEach(el => {
        if (el.tagName === 'A') el.href = `https://wa.me/${contact.wa}`;
        el.textContent = contact.wa;
    });
    document.querySelectorAll('[data-contact="email"]').forEach(el => {
        if (el.tagName === 'A') el.href = `mailto:${contact.email}`;
        el.textContent = contact.email;
    });
    document.querySelectorAll('[data-contact="address"]').forEach(el => el.textContent = contact.address);
    document.querySelectorAll('[data-contact="ig"]').forEach(el => el.textContent = contact.ig);
    document.querySelectorAll('[data-contact="fb"]').forEach(el => el.textContent = contact.fb);

    // Portfolio
    const portfolio = getData(KEYS.portfolio);
    const portfolioGrid = document.getElementById('dynamic-portfolio');
    if (portfolioGrid) {
        portfolioGrid.innerHTML = portfolio.map(item => `
            <div class="portfolio-card" data-cat="${item.cat}">
                <div class="thumb"><i class="fas fa-folder-open"></i></div>
                <div class="info">
                    <span class="cat">${item.cat}</span>
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                </div>
            </div>
        `).join('');
    }

    // Testimonials
    const testimonials = getData(KEYS.testimonials);
    const testimonialGrid = document.getElementById('dynamic-testimonials');
    if (testimonialGrid) {
        testimonialGrid.innerHTML = testimonials.map(item => `
            <div class="testimonial-card reveal">
                <span class="quote">"</span>
                <div class="stars">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </div>
                <p>"${item.text}"</p>
                <div class="author">
                    <div class="avatar"><i class="fas fa-user-circle"></i></div>
                    <div>
                        <h4>${item.name}</h4>
                        <span>${item.role}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Blog
    const blog = getData(KEYS.blog);
    const blogContainer = document.getElementById('dynamic-blog');
    if (blogContainer) {
        blogContainer.innerHTML = blog.map(item => `
            <article style="background: var(--white); padding: 28px; border-radius: var(--radius); border: 1px solid var(--border); margin-bottom: 16px;">
                <h3 style="font-size:18px; margin-bottom:8px;">${item.title}</h3>
                <p style="font-size:14px; color:var(--text-muted); line-height:1.7;">${item.content}</p>
            </article>
        `).join('');
    }

    // Re-initialize observers after dynamic content
    setTimeout(initReveal, 100);
}

// ===== MOBILE NAV =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// ===== SCROLL REVEAL =====
function initReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => observer.observe(el));
}
initReveal();

// ===== PORTFOLIO FILTER =====
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

if (filterBtns.length && portfolioCards.length) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            portfolioCards.forEach(card => {
                if (filter === 'all' || card.dataset.cat === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.4s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ===== LOAD DYNAMIC CONTENT ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', loadDynamicContent);