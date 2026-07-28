// ===== LOADING BAR =====
(function() {
    const bar = document.getElementById('loadBar');
    if (bar) {
        setTimeout(() => bar.classList.add('loading'), 50);
        window.addEventListener('load', () => {
            bar.classList.add('done');
            setTimeout(() => { bar.style.display = 'none'; }, 600);
        });
    }
})();

// ===== INTERCEPT NAVIGATION =====
document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href.endsWith('.html') && !href.startsWith('http')) {
            e.preventDefault();
            const bar = document.getElementById('loadBar') || (() => {
                const b = document.createElement('div');
                b.className = 'load-bar loading';
                b.id = 'loadBar';
                document.body.prepend(b);
                return b;
            })();
            bar.classList.add('loading');
            setTimeout(() => { window.location.href = href; }, 250);
        }
    });
});

// ===== HAMBURGER =====
document.getElementById('hamburger').addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        document.getElementById('navLinks').classList.remove('active');
    });
});

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll('.hl-card, .menu-card, .sv-card, .location-card');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.5s ease';
    revealObserver.observe(el);
});

// ===== CONTACT FORM =====
const cf = document.getElementById('contactForm');
if (cf) {
    cf.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('.btn-primary');
        const orig = btn.innerHTML;
        btn.innerHTML = 'Terkirim! <i class="fas fa-check"></i>';
        btn.style.background = '#6B4F0E';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; this.reset(); }, 2500);
    });
}