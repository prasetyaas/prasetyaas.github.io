/* ==================================================
   SAKURA KOI INDONESIA - Animated Counter
   Spesifik untuk angka statistik.
   ================================================== */

(function() {
    'use strict';

    /* Inisialisasi observer untuk elemen .counter */
    function init() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function(el) { observer.observe(el); });
    }

    /* Fungsi animasi — dipanggil juga dari animation.js */
    function animateCounter(el) {
        const target = parseFloat(el.getAttribute('data-target')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = parseInt(el.getAttribute('data-duration')) || 2000;
        const startTime = performance.now();

        // Simpan target sebagai atribut data untuk render ulang
        el.setAttribute('data-target', target);

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            el.textContent = current.toLocaleString('id-ID') + suffix;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    window.SKICounter = { animateCounter };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();