// ===== LOADING =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1200);
});

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== MOBILE MENU =====
const navToggle = document.getElementById('navToggle');
const navMenuMobile = document.getElementById('navMenuMobile');
const overlay = document.getElementById('mobileOverlay');

function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !navMenuMobile.classList.contains('open');
    navMenuMobile.classList.toggle('open', isOpen);
    overlay.classList.toggle('active', isOpen);
    navToggle.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

if (navToggle) {
    navToggle.addEventListener('click', () => toggleMenu());
}
if (overlay) {
    overlay.addEventListener('click', () => toggleMenu(false));
}

document.querySelectorAll('.nav-menu-mobile a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) toggleMenu(false);
});

// ===== STATS COUNTER =====
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            if (!target) return;
            let current = 0;
            const inc = Math.ceil(target / 40);
            const timer = setInterval(() => {
                current += inc;
                if (current >= target) { el.textContent = target; clearInterval(timer); }
                else el.textContent = current;
            }, 25);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.hs-num').forEach(c => counterObserver.observe(c));

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('.btn-primary');
        const orig = btn.innerHTML;
        btn.innerHTML = 'Terkirim! <i class="fas fa-check"></i>';
        btn.style.background = '#22c55e';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; this.reset(); }, 3000);
    });
}

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
});

