// ===== AUTH =====
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

function handleLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        localStorage.setItem('km_admin', 'true');
        showDashboard();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function handleLogout() {
    localStorage.removeItem('km_admin');
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    loadAllData();
}

// ===== TOAST =====
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    if (toastMsg) toastMsg.innerHTML = message;
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 6000);
    }
}

// Show login info toast on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        showToast('🔐 Demo Mode — Login: <strong>admin</strong> / <strong>admin123</strong>');
    }, 500);
});

// Check session on load
if (localStorage.getItem('km_admin') === 'true') {
    showDashboard();
}

// ===== NAVIGATION =====
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById('sec-' + link.dataset.section).classList.add('active');
        document.getElementById('sectionTitle').textContent = link.textContent.trim();
    });
});

// ===== DATA KEYS =====
const KEYS = {
    profile: 'km_profile',
    hero: 'km_hero',
    portfolio: 'km_portfolio',
    testimonials: 'km_testimonials',
    blog: 'km_blog',
    contact: 'km_contact'
};

// ===== DEFAULTS =====
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

// ===== HELPERS =====
function getData(key) {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    // Set defaults
    if (defaults[key]) {
        localStorage.setItem(key, JSON.stringify(defaults[key]));
        return defaults[key];
    }
    return null;
}

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ===== LOAD ALL =====
function loadAllData() {
    // Profile
    const profile = getData(KEYS.profile);
    document.getElementById('edCompanyName').value = profile.name;
    document.getElementById('edTagline').value = profile.tagline;
    document.getElementById('edCompanyDesc').value = profile.desc;
    document.getElementById('edYear').value = profile.year;

    // Hero
    const hero = getData(KEYS.hero);
    document.getElementById('edHeroTitle').value = hero.title;
    document.getElementById('edHeroHighlight').value = hero.highlight;
    document.getElementById('edHeroDesc').value = hero.desc;

    // Contact
    const contact = getData(KEYS.contact);
    document.getElementById('edWA').value = contact.wa;
    document.getElementById('edEmail').value = contact.email;
    document.getElementById('edAddress').value = contact.address;
    document.getElementById('edIG').value = contact.ig;
    document.getElementById('edFB').value = contact.fb;

    // Lists
    renderPortfolio();
    renderTestimonials();
    renderBlog();
}

// ===== SAVE FUNCTIONS =====
function saveProfile() {
    const data = {
        name: document.getElementById('edCompanyName').value,
        tagline: document.getElementById('edTagline').value,
        desc: document.getElementById('edCompanyDesc').value,
        year: document.getElementById('edYear').value
    };
    setData(KEYS.profile, data);
    alert('Profil berhasil disimpan!');
}

function saveHero() {
    const data = {
        title: document.getElementById('edHeroTitle').value,
        highlight: document.getElementById('edHeroHighlight').value,
        desc: document.getElementById('edHeroDesc').value
    };
    setData(KEYS.hero, data);
    alert('Hero berhasil disimpan!');
}

function saveContact() {
    const data = {
        wa: document.getElementById('edWA').value,
        email: document.getElementById('edEmail').value,
        address: document.getElementById('edAddress').value,
        ig: document.getElementById('edIG').value,
        fb: document.getElementById('edFB').value
    };
    setData(KEYS.contact, data);
    alert('Kontak berhasil disimpan!');
}

// ===== PORTFOLIO =====
function addPortfolio() {
    const name = document.getElementById('edPortName').value.trim();
    const cat = document.getElementById('edPortCat').value;
    const desc = document.getElementById('edPortDesc').value.trim();
    if (!name) return alert('Nama project harus diisi!');

    const items = getData(KEYS.portfolio);
    items.push({ name, cat, desc });
    setData(KEYS.portfolio, items);
    document.getElementById('edPortName').value = '';
    document.getElementById('edPortDesc').value = '';
    renderPortfolio();
}

function deletePortfolio(index) {
    const items = getData(KEYS.portfolio);
    items.splice(index, 1);
    setData(KEYS.portfolio, items);
    renderPortfolio();
}

function renderPortfolio() {
    const items = getData(KEYS.portfolio);
    const list = document.getElementById('portfolioList');
    list.innerHTML = items.map((item, i) => `
        <div class="item-card">
            <div class="info">
                <h4>${item.name}</h4>
                <p>${item.cat} — ${item.desc}</p>
            </div>
            <div class="actions">
                <button class="btn-danger" onclick="deletePortfolio(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// ===== TESTIMONIALS =====
function addTestimonial() {
    const name = document.getElementById('edTestName').value.trim();
    const role = document.getElementById('edTestRole').value.trim();
    const text = document.getElementById('edTestText').value.trim();
    if (!name || !text) return alert('Nama dan testimonial harus diisi!');

    const items = getData(KEYS.testimonials);
    items.push({ name, role, text });
    setData(KEYS.testimonials, items);
    document.getElementById('edTestName').value = '';
    document.getElementById('edTestRole').value = '';
    document.getElementById('edTestText').value = '';
    renderTestimonials();
}

function deleteTestimonial(index) {
    const items = getData(KEYS.testimonials);
    items.splice(index, 1);
    setData(KEYS.testimonials, items);
    renderTestimonials();
}

function renderTestimonials() {
    const items = getData(KEYS.testimonials);
    const list = document.getElementById('testimonialList');
    list.innerHTML = items.map((item, i) => `
        <div class="item-card">
            <div class="info">
                <h4>${item.name}</h4>
                <p>${item.role} — "${item.text.substring(0, 60)}..."</p>
            </div>
            <div class="actions">
                <button class="btn-danger" onclick="deleteTestimonial(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// ===== BLOG =====
function addBlog() {
    const title = document.getElementById('edBlogTitle').value.trim();
    const content = document.getElementById('edBlogContent').value.trim();
    if (!title || !content) return alert('Judul dan konten harus diisi!');

    const items = getData(KEYS.blog);
    items.push({ title, content });
    setData(KEYS.blog, items);
    document.getElementById('edBlogTitle').value = '';
    document.getElementById('edBlogContent').value = '';
    renderBlog();
}

function deleteBlog(index) {
    const items = getData(KEYS.blog);
    items.splice(index, 1);
    setData(KEYS.blog, items);
    renderBlog();
}

function renderBlog() {
    const items = getData(KEYS.blog);
    const list = document.getElementById('blogList');
    list.innerHTML = items.map((item, i) => `
        <div class="item-card">
            <div class="info">
                <h4>${item.title}</h4>
                <p>${item.content.substring(0, 80)}...</p>
            </div>
            <div class="actions">
                <button class="btn-danger" onclick="deleteBlog(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}