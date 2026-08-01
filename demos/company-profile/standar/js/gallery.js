/* ==================================================
   SAKURA KOI INDONESIA - Gallery Filter & Lightbox
   Filter kategori galeri + lightbox untuk memperbesar gambar.
   ================================================== */

(function() {
    'use strict';

    let currentImageIndex = 0;
    let currentGalleryItems = [];

    /* ====== FILTER GALERI ====== */
    function initFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (!filterBtns.length || !galleryItems.length) return;

        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                // Set active button
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                galleryItems.forEach(function(item) {
                    const category = item.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.remove('hidden');
                        // Tambah animasi muncul
                        item.style.animation = 'fadeIn 0.5s var(--ease)';
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    /* ====== LIGHTBOX ====== */
    function initLightbox() {
        const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        if (!galleryItems.length) return;

        // Bangun lightbox DOM
        let lightbox = document.querySelector('.lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <button class="lightbox-close" aria-label="Tutup"><i class="fas fa-times"></i></button>
                <button class="lightbox-prev" aria-label="Sebelumnya"><i class="fas fa-chevron-left"></i></button>
                <img class="lightbox-img" src="" alt="Galeri Sakura Koi">
                <button class="lightbox-next" aria-label="Berikutnya"><i class="fas fa-chevron-right"></i></button>
                <div class="lightbox-caption"></div>
            `;
            document.body.appendChild(lightbox);
        }

        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        function openLightbox(index) {
            // Filter hanya item yang tampil
            currentGalleryItems = galleryItems.filter(function(item) {
                return !item.classList.contains('hidden');
            });

            currentImageIndex = (index + currentGalleryItems.length) % currentGalleryItems.length;
            const item = currentGalleryItems[currentImageIndex];
            const img = item.querySelector('img');
            const caption = item.getAttribute('data-title') || 'Galeri Sakura Koi';

            lightboxImg.src = img ? img.src : '';
            lightboxCaption.textContent = caption;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function changeImage(dir) {
            currentImageIndex = (currentImageIndex + dir + currentGalleryItems.length) % currentGalleryItems.length;
            const item = currentGalleryItems[currentImageIndex];
            const img = item.querySelector('img');
            const caption = item.getAttribute('data-title') || 'Galeri Sakura Koi';
            lightboxImg.src = img ? img.src : '';
            lightboxCaption.textContent = caption;
        }

        // Buka lightbox saat item diklik
        galleryItems.forEach(function(item) {
            item.addEventListener('click', function() {
                openLightbox(galleryItems.indexOf(item));
            });
        });

        // Controls
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', function() { changeImage(-1); });
        nextBtn.addEventListener('click', function() { changeImage(1); });
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') changeImage(-1);
            if (e.key === 'ArrowRight') changeImage(1);
        });
    }

    /* ====== INIT ====== */
    function init() {
        initFilter();
        initLightbox();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();