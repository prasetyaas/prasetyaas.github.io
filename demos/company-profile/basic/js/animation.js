/* ============================================
   NUSANTARA RICE DISTRIBUTION - COMPANY PROFILE
   animation.js - Animasi Tambahan (Hover Lift, Image Zoom, Reveal)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initHoverLift();
    initImageZoom();
    initParallaxShapes();
});

/* ---------- Hover Lift (konfigurasi via CSS class .hover-lift) ---------- */
function initHoverLift() {
    // CSS handles the hover transform; this is a JS enhancer if needed
    // Optionally add pointer tracking for advanced effects
    const liftCards = document.querySelectorAll('.hover-lift');
    if (liftCards.length === 0) return;

    liftCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            // Subtle tilt effect
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* ---------- Image Hover Zoom (with lazy loading awareness) ---------- */
function initImageZoom() {
    const zoomWraps = document.querySelectorAll('.image-zoom-wrap');
    if (zoomWraps.length === 0) return;

    // CSS handles zoom; we just ensure images are properly loaded
    zoomWraps.forEach(wrap => {
        const img = wrap.querySelector('img');
        if (img && img.complete) {
            wrap.classList.add('img-ready');
        } else if (img) {
            img.addEventListener('load', () => wrap.classList.add('img-ready'));
        }
    });
}

/* ---------- Parallax Floating Shapes ---------- */
function initParallaxShapes() {
    const shapes = document.querySelectorAll('.floating-shape');
    if (shapes.length === 0) return;

    let ticking = false;

    const updateShapes = () => {
        const scrollY = window.scrollY;
        shapes.forEach((shape, index) => {
            const speed = 0.05 + (index * 0.02);
            const offset = scrollY * speed;
            shape.style.transform = `translateY(${offset}px)`;
        });
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateShapes);
            ticking = true;
        }
    }, { passive: true });
}

/* ---------- Smooth transition between pages (click handler) ---------- */
function initPageTransitions() {
    // Optional: intercept internal links to add fade-out transition
    const internalLinks = document.querySelectorAll('a[href$=".html"]');
    if (internalLinks.length === 0) return;

    internalLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Skip if target="_blank" or has no href or external
        if (link.target === '_blank' || !href || href.startsWith('http') || href.startsWith('#')) return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const destination = href;

            document.body.classList.add('page-leaving');
            // Simple fade-out effect
            const overlay = document.querySelector('.page-transition');
            if (overlay) {
                overlay.style.opacity = '1';
            }

            setTimeout(() => {
                window.location.href = destination;
            }, 300);
        });
    });
}

// Initialize page transitions after load
window.addEventListener('load', () => {
    initPageTransitions();
});