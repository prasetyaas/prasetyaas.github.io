// ===== MULTI-PAGE SWITCHING =====
function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-links a[data-page="${page}"]`).classList.add('active');
    window.scrollTo(0, 0);
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage(link.dataset.page);
    });
});

// ===== HAMBURGER =====
document.getElementById('hamburger').addEventListener('click', () => {
    const links = document.getElementById('navLinks');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('✅ Pesanan Anda telah diterima! (Demo)');
    this.reset();
});