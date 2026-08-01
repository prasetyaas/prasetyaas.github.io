/* ==================================================
   SAKURA KOI INDONESIA - Animation & Reveal
   IntersectionObserver untuk reveal-on-scroll,
   image reveal (lazy), dan tilt effect.
   ================================================== */

(function() {
    'use strict';

    /* ====== REVEAL ON SCROLL ====== */
    function initReveal() {
        const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
        if (!revealEls.length) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            revealEls.forEach(function(el) { el.classList.add('visible'); });
            return;
        }

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        revealEls.forEach(function(el) { observer.observe(el); });
    }

    /* ====== IMAGE REVEAL (lazy load + fade) ====== */
    function initImageReveal() {
        const images = document.querySelectorAll('.img-reveal img[data-src]');
        if (!images.length) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    img.addEventListener('load', function() {
                        img.classList.add('loaded');
                    });
                    // Fallback jika sudah cached
                    if (img.complete) {
                        img.classList.add('loaded');
                    }
                    observer.unobserve(img);
                }
            });
        }, { threshold: 0.1 });

        images.forEach(function(img) { observer.observe(img); });
    }

    /* ====== TILT EFFECT (3D hover) ====== */
    function initTilt() {
        const tiltEls = document.querySelectorAll('.tilt');
        if (!tiltEls.length) return;
        if (window.matchMedia('(pointer: coarse)').matches) return;

        tiltEls.forEach(function(el) {
            el.addEventListener('mousemove', function(e) {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                el.style.transform = 'perspective(800px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
            });
            el.addEventListener('mouseleave', function() {
                el.style.transform = '';
            });
        });
    }

    /* ====== COUNTER ANIMATION (dipanggil dari counter.js, tapi observer di sini) ====== */
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    animateCounter(el);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function(el) { observer.observe(el); });
    }

    // Fungsi animasi angka (shared dengan counter.js)
    function animateCounter(el) {
        const target = parseFloat(el.getAttribute('data-target')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = parseInt(el.getAttribute('data-duration')) || 2000;
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            el.textContent = current.toLocaleString('id-ID') + suffix;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }
    window.animateCounter = animateCounter;

    /* ====== PAGE TRANSITION (fade in) ====== */
    function initPageTransition() {
        const body = document.body;
        body.classList.add('page-transition');

        // Smooth transition ketika navigasi ke halaman lain
        document.querySelectorAll('a[href$=".html"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = link.getAttribute('href');
                // Skip jika external atau anchor
                if (href.startsWith('http') || href.startsWith('#')) return;
                // Tampilkan loading singkat saat pindah halaman
                // (hanya visual — perpindahan halaman tetap normal)
            });
        });
    }

    /* ====== INIT ALL ====== */
    function init() {
        initReveal();
        initImageReveal();
        initTilt();
        initCounters();
        initPageTransition();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();