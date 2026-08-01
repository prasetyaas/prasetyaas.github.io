/* ==================================================
   SAKURA KOI INDONESIA - Main Interactions
   Navbar, Mobile Menu, Scroll Progress, Back-to-Top,
   Loading Screen, Cursor, Ripple, Typing, Parallax.
   ================================================== */

(function() {
    'use strict';

    /* ====== LOADING SCREEN ====== */
    function initLoadingScreen() {
        const loader = document.querySelector('.loading-screen');
        if (!loader) return;
        window.addEventListener('load', function() {
            setTimeout(function() {
                loader.classList.add('hidden');
            }, 600);
        });
        // Fallback: sembunyikan setelah 3 detik bila load lambat
        setTimeout(function() {
            loader.classList.add('hidden');
        }, 3500);
    }

    /* ====== NAVBAR SCROLL STATE ====== */
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        function onScroll() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            // Aktifkan nav link sesuai posisi (untuk halaman home dengan anchor)
            updateActiveNavLink();
        }
        window.addEventListener('scroll', onScroll);
        onScroll();
    }

    /* Aktifkan link nav sesuai section yang terlihat */
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        if (!sections.length) return;

        let current = '';
        sections.forEach(function(section) {
            const top = section.getBoundingClientRect().top;
            if (top <= 120) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    /* ====== MOBILE MENU ====== */
    function initMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const overlay = document.querySelector('.nav-menu-overlay');
        if (!navToggle || !navMenu) return;

        function toggleMenu(force) {
            const willOpen = typeof force === 'boolean' ? force : !navMenu.classList.contains('active');
            navMenu.classList.toggle('active', willOpen);
            navToggle.classList.toggle('active', willOpen);
            if (overlay) overlay.classList.toggle('active', willOpen);
            document.body.style.overflow = willOpen ? 'hidden' : '';
        }

        navToggle.addEventListener('click', function() { toggleMenu(); });
        if (overlay) overlay.addEventListener('click', function() { toggleMenu(false); });

        // Tutup menu saat link diklik
        navMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() { toggleMenu(false); });
        });
    }

    /* ====== SCROLL PROGRESS BAR ====== */
    function initScrollProgress() {
        const bar = document.querySelector('.scroll-progress');
        if (!bar) return;

        function onScroll() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
        }
        window.addEventListener('scroll', onScroll);
    }

    /* ====== BACK TO TOP ====== */
    function initBackToTop() {
        const btn = document.querySelector('.back-to-top');
        if (!btn) return;

        function onScroll() {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }
        window.addEventListener('scroll', onScroll);
        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ====== ANIMATED CURSOR ====== */
    function initCursor() {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        if (!dot || !ring) return;
        if (window.matchMedia('(pointer: coarse)').matches) return;

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        // Smooth ring follow
        (function animateRing() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        })();

        // Hover state (membesar pada elemen interaktif)
        const hoverTargets = 'a, button, .koi-card, .service-card, .filter-btn, input, textarea, select';
        document.querySelectorAll(hoverTargets).forEach(function(el) {
            el.addEventListener('mouseenter', function() { ring.classList.add('hover'); });
            el.addEventListener('mouseleave', function() { ring.classList.remove('hover'); });
        });
    }

    /* ====== RIPPLE BUTTON ====== */
    function initRipple() {
        const buttons = document.querySelectorAll('.btn, .nav-cta, .filter-btn');
        buttons.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                const rect = btn.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                ripple.className = 'ripple';
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                btn.appendChild(ripple);
                setTimeout(function() { ripple.remove(); }, 700);
            });
        });
    }

    /* ====== TYPING EFFECT (hero subtitle) ====== */
    function initTyping() {
        const typedEl = document.querySelector('[data-typed]');
        if (!typedEl) return;

        const phrases = JSON.parse(typedEl.getAttribute('data-typed'));
        let phraseIndex = 0;
        let charIndex = 0;
        let deleting = false;

        function type() {
            const current = phrases[phraseIndex];
            if (!deleting) {
                typedEl.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(type, 2200);
                    return;
                }
                setTimeout(type, 70);
            } else {
                typedEl.textContent = current.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    setTimeout(type, 400);
                    return;
                }
                setTimeout(type, 35);
            }
        }
        setTimeout(type, 1200);
    }

    /* ====== PARALLAX BACKGROUND (hero & cta) ====== */
    function initParallax() {
        const parallaxEls = document.querySelectorAll('[data-parallax]');
        if (!parallaxEls.length) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        function onScroll() {
            parallaxEls.forEach(function(el) {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const offset = (window.innerHeight - rect.top) * speed;
                    el.style.transform = 'translateY(' + offset + 'px)';
                }
            });
        }
        window.addEventListener('scroll', onScroll);
    }

    /* ====== BEFORE/AFTER SLIDER ====== */
    function initBeforeAfter() {
        const wrappers = document.querySelectorAll('.before-after');
        if (!wrappers.length) return;

        wrappers.forEach(function(wrapper) {
            const afterImg = wrapper.querySelector('.ba-after');
            const divider = wrapper.querySelector('.ba-divider');
            if (!afterImg || !divider) return;

            let isDragging = false;

            function setPosition(x) {
                const rect = wrapper.getBoundingClientRect();
                let percent = ((x - rect.left) / rect.width) * 100;
                percent = Math.max(5, Math.min(95, percent));
                afterImg.style.clipPath = 'inset(0 0 0 ' + percent + '%)';
                divider.style.left = percent + '%';
            }

            divider.addEventListener('mousedown', function(e) {
                isDragging = true;
                setPosition(e.clientX);
            });
            document.addEventListener('mousemove', function(e) {
                if (isDragging) setPosition(e.clientX);
            });
            document.addEventListener('mouseup', function() { isDragging = false; });

            // Touch support
            divider.addEventListener('touchstart', function(e) {
                isDragging = true;
                setPosition(e.touches[0].clientX);
            });
            document.addEventListener('touchmove', function(e) {
                if (isDragging) setPosition(e.touches[0].clientX);
            });
            document.addEventListener('touchend', function() { isDragging = false; });
        });
    }

    /* ====== VIDEO PLACEHOLDER (click to open) ====== */
    function initVideoPlaceholder() {
        const videos = document.querySelectorAll('.video-placeholder');
        videos.forEach(function(video) {
            video.addEventListener('click', function() {
                const url = video.getAttribute('data-video');
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });
    }

    /* ====== NEWSLETTER FORM ====== */
    function initNewsletter() {
        const forms = document.querySelectorAll('.newsletter-form');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const input = form.querySelector('input[type="email"]');
                const email = input ? input.value.trim() : '';
                if (!email || !email.includes('@')) {
                    showToast('Masukkan email yang valid.', 'error');
                    return;
                }
                input.value = '';
                showToast('Berhasil berlangganan! Terima kasih.', 'success');
            });
        });
    }

    /* ====== TOAST NOTIFICATION ====== */
    function showToast(message, type) {
        // Periksa toast yang sudah ada
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.className = 'toast show ' + (type === 'error' ? 'error' : (type === 'success' ? 'success' : ''));
        toast.innerHTML = (type === 'success' ? '<i class="fas fa-check-circle"></i>' : type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : '<i class="fas fa-info-circle"></i>') + '<span>' + message + '</span>';
        setTimeout(function() { toast.classList.remove('show'); }, 3000);
    }
    window.showToast = showToast;

    /* ====== INIT ALL ====== */
    function init() {
        initLoadingScreen();
        initNavbar();
        initMobileMenu();
        initScrollProgress();
        initBackToTop();
        initCursor();
        initRipple();
        initTyping();
        initParallax();
        initBeforeAfter();
        initVideoPlaceholder();
        initNewsletter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();