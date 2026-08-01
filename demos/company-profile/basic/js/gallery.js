/* ============================================
   NUSANTARA RICE DISTRIBUTION - COMPANY PROFILE
   gallery.js - Masonry, Filter, Lightbox
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initGallery();
});

const GALLERY_CATEGORIES = {
    all: 'Semua',
    gudang: 'Gudang',
    distribusi: 'Distribusi',
    produk: 'Produk',
    kendaraan: 'Kendaraan',
    packing: 'Packing'
};

function initGallery() {
    const masonry = document.getElementById('galleryMasonry');
    if (!masonry) return;

    // Get gallery data from NRD_STORE (localStorage fallback)
    const items = (typeof NRD_STORE !== 'undefined') ? NRD_STORE.getGallery() : [];

    if (items.length === 0) {
        masonry.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--gray);padding:40px 0;">Belum ada foto galeri.</p>';
        return;
    }

    // Build masonry items
    items.forEach(item => {
        const isVideo = !item.image.startsWith('http') && !item.image.startsWith('images/');
        const el = document.createElement('div');
        el.className = 'gallery-item show';
        el.setAttribute('data-category', item.category);
        el.innerHTML = `
            <img src="${item.image}" alt="${item.title || 'Foto galeri Nusantara Rice'}" loading="lazy" />
            <div class="gallery-overlay">
                <span><i class="fas fa-folder"></i> ${GALLERY_CATEGORIES[item.category] || item.category}</span>
                <h4>${item.title || 'Foto Galeri'}</h4>
                <div class="gallery-view-btn" title="Perbesar"><i class="fas fa-search-plus"></i></div>
            </div>
        `;
        masonry.appendChild(el);
    });

    const galleryItems = masonry.querySelectorAll('.gallery-item');
    let currentIndex = 0;

    /* ---------- Filter ---------- */
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter') || 'all';
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.classList.add('show');
                } else {
                    item.classList.remove('show');
                }
            });
        });
    });

    /* ---------- Lightbox ---------- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    if (!lightbox) return;

    const getVisibleItems = () => {
        return Array.from(galleryItems).filter(item => item.classList.contains('show'));
    };

    const updateLightbox = () => {
        const visible = getVisibleItems();
        if (visible.length === 0) return;

        const img = visible[currentIndex].querySelector('img');
        const title = visible[currentIndex].querySelector('h4').textContent;
        lightboxImg.src = img.src;
        lightboxImg.alt = title;
        lightboxCaption.textContent = title;
        lightboxCounter.textContent = `${currentIndex + 1} / ${visible.length}`;
    };

    const openLightbox = (index) => {
        const visible = getVisibleItems();
        if (visible.length === 0) return;
        currentIndex = index;
        updateLightbox();
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    };

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const visible = getVisibleItems();
            const visibleIndex = visible.indexOf(item);
            if (visibleIndex !== -1) {
                openLightbox(visibleIndex);
            }
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);

    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        const visible = getVisibleItems();
        currentIndex = (currentIndex - 1 + visible.length) % visible.length;
        updateLightbox();
    });

    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        const visible = getVisibleItems();
        currentIndex = (currentIndex + 1) % visible.length;
        updateLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
    });

    // Click outside image to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}