/* ============================================
   NUSANTARA RICE DISTRIBUTION - COMPANY PROFILE
   main.js - Navbar, Loading, Mobile Menu, Counter, Scroll Top
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initNavbar();
    initMobileMenu();
    initActivePage();
    initScrollTop();
    initCounters();
    initRippleButtons();
    initScrollReveal();
    initFloatingActions();
    initContactForm();
});

/* ---------- Loading Screen ---------- */
function initLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (!loadingScreen) return;

    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        document.body.classList.add('page-loaded');
    }, 800);
}

/* ---------- Navbar Blur On Scroll ---------- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.querySelector('.nav-menu-overlay');
    if (!navToggle || !navMenu) return;

    const closeMenu = () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('open');
        if (isOpen) {
            closeMenu();
        } else {
            navToggle.classList.add('active');
            navMenu.classList.add('open');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    if (overlay) overlay.addEventListener('click', closeMenu);

    // Close on nav link click (mobile)
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on resize > 768
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
}

/* ---------- Active Page Indicator (based on current filename) ---------- */
function initActivePage() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    const dataPage = document.body.getAttribute('data-page');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkFile = href.split('/').pop();
        if (dataPage) {
            // Prioritize data-page attribute if present
            if (link.getAttribute('data-nav') === dataPage) {
                link.classList.add('active');
            }
        } else if (linkFile === currentFile || (linkFile === '' && currentFile === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/* ---------- Scroll To Top ---------- */
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (!scrollTopBtn) return;

    const toggleBtn = () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    };

    window.addEventListener('scroll', toggleBtn, { passive: true });
    toggleBtn();

    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ---------- Counter Animation (on scroll into view) ---------- */
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (counters.length === 0) return;

    const animateCounter = (el) => {
        const target = parseFloat(el.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();
        const suffix = el.getAttribute('data-suffix') || '';

        const updateNumber = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current.toLocaleString('id-ID') + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

/* ---------- Ripple Button Effect ---------- */
function initRippleButtons() {
    const buttons = document.querySelectorAll('.btn');
    if (buttons.length === 0) return;

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);

            ripple.className = 'ripple-element';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/* ---------- Scroll Reveal (global, dapat dipanggil ulang) ---------- */
let revealObserver = null;

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
    if (revealElements.length === 0) return;

    // Fallback: jika IntersectionObserver tidak tersedia, langsung tampilkan semua
    if (typeof IntersectionObserver === 'undefined') {
        revealElements.forEach(el => el.classList.add('reveal-active'));
        return;
    }

    // Buat observer sekali saja, lalu observe elemen baru
    if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    }

    revealElements.forEach(el => {
        // Hanya observe elemen yang belum aktif
        if (!el.classList.contains('reveal-active')) {
            revealObserver.observe(el);
        }
    });
}

// Ekspos ke global agar bisa dipanggil dari file lain setelah render dinamis
window.initReveal = initScrollReveal;

/* ---------- Floating Actions (Admin / WhatsApp placeholder) ---------- */
function initFloatingActions() {
    const floatingBtns = document.querySelectorAll('.float-action');
    if (floatingBtns.length === 0) return;

    const toggleBtns = () => {
        if (window.scrollY > 400) {
            floatingBtns.forEach(btn => btn.classList.add('show'));
        } else {
            floatingBtns.forEach(btn => btn.classList.remove('show'));
        }
    };

    window.addEventListener('scroll', toggleBtns, { passive: true });
    toggleBtns();
}

/* ---------- Contact Form Validation (Contact Page) ---------- */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        const name = form.querySelector('#contactName');
        const email = form.querySelector('#contactEmail');
        const phone = form.querySelector('#contactPhone');
        const message = form.querySelector('#contactMessage');

        // Reset errors
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Validate name
        if (!name.value.trim() || name.value.trim().length < 3) {
            name.classList.add('error');
            isValid = false;
        }

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) {
            email.classList.add('error');
            isValid = false;
        }

        // Validate phone (optional but if filled must be valid)
        if (phone.value.trim()) {
            const phonePattern = /^[0-9+\-\s()]{8,}$/;
            if (!phonePattern.test(phone.value.trim())) {
                phone.classList.add('error');
                isValid = false;
            }
        }

        // Validate message
        if (message.value.trim().length < 10) {
            message.classList.add('error');
            isValid = false;
        }

        if (!isValid) {
            showToast('Mohon periksa kembali form Anda', 'error');
            return;
        }

        // Build WhatsApp message
        const waNumber = '6281298578909';
        const text = encodeURIComponent(
            `Halo Nusantara Rice Distribution,\n\n` +
            `Nama: ${name.value.trim()}\n` +
            `Email: ${email.value.trim()}\n` +
            `No. HP: ${phone.value.trim() || '-'}\n\n` +
            `Pesan:\n${message.value.trim()}`
        );

        window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
        showToast('Pesan berhasil disiapkan! Mengarahkan ke WhatsApp...');
        form.reset();
    });
}

/* ---------- Global Toast (used across pages) ---------- */
function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'admin-toast' + (type === 'error' ? ' error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);

    // Force reflow for transition
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}