/* ==================================================
   SAKURA KOI INDONESIA - Review Slider
   Carousel sederhana untuk testimoni pelanggan.
   ================================================== */

(function() {
    'use strict';

    let currentIndex = 0;
    let slideTimer = null;

    /* Inisialisasi slider */
    function init() {
        const slider = document.querySelector('.review-slider');
        if (!slider) return;

        const track = slider.querySelector('.review-track');
        const slides = track.querySelectorAll('.review-slide');
        const prevBtn = slider.querySelector('.review-prev');
        const nextBtn = slider.querySelector('.review-next');
        const dotsContainer = slider.querySelector('.review-dots');
        if (!slides.length) return;

        // Bangun dots
        if (dotsContainer) {
            slides.forEach(function(_, idx) {
                const dot = document.createElement('button');
                dot.className = 'review-dot' + (idx === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Ke slide ' + (idx + 1));
                dot.addEventListener('click', function() { goTo(idx); });
                dotsContainer.appendChild(dot);
            });
        }

        const dots = dotsContainer ? dotsContainer.querySelectorAll('.review-dot') : [];

        function goTo(index) {
            currentIndex = (index + slides.length) % slides.length;
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
            if (dots.length) {
                dots.forEach(function(dot, i) {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }
            resetAutoPlay();
        }

        function next() { goTo(currentIndex + 1); }
        function prev() { goTo(currentIndex - 1); }

        function startAutoPlay() {
            slideTimer = setInterval(next, 6000);
        }

        function resetAutoPlay() {
            clearInterval(slideTimer);
            startAutoPlay();
        }

        // Events
        prevBtn.addEventListener('click', prev);
        nextBtn.addEventListener('click', next);

        // Swipe support
        let startX = 0;
        slider.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        slider.addEventListener('touchend', function(e) {
            const diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) prev();
                else next();
            }
        });

        startAutoPlay();
    }

    /* Expose untuk re-init setelah render ulang dari localStorage */
    window.SKISlider = { init: init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
