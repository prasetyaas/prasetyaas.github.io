// ===== MOBILE NAV =====
const mnavToggle = document.getElementById('mnavToggle');
const mnavOverlay = document.getElementById('mnavOverlay');
const mnavClose = document.getElementById('mnavClose');

mnavToggle.addEventListener('click', () => mnavOverlay.classList.add('open'));
mnavClose.addEventListener('click', () => mnavOverlay.classList.remove('open'));
document.querySelectorAll('.mnav-link').forEach(link => {
    link.addEventListener('click', () => mnavOverlay.classList.remove('open'));
});
mnavOverlay.addEventListener('click', (e) => {
    if (e.target === mnavOverlay) mnavOverlay.classList.remove('open');
});

// ===== ACTIVE SIDEBAR LINK =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
        const top = s.offsetTop - 100;
        if (window.scrollY >= top) current = s.getAttribute('id');
    });
    document.querySelectorAll('.s-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
});

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll('.work-card, .a-num, .hero-stats-card, .hero-code-block');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });
revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('.btn-primary');
    const orig = btn.innerHTML;
    btn.innerHTML = 'Sent! <i class="fas fa-check"></i>';
    setTimeout(() => { btn.innerHTML = orig; this.reset(); }, 2000);
});