/* ============================================
   NUSANTARA RICE DISTRIBUTION - COMPANY PROFILE
   testimonials.js - Render Testimonial dari data/localStorage
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    renderTestimonialsPage();
});

function renderTestimonialsPage() {
    const container = document.getElementById('testimonialsGrid');
    if (!container) return;

    const testimonials = (typeof NRD_STORE !== 'undefined') ? NRD_STORE.getTestimonials() : [];

    if (testimonials.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--gray);padding:40px 0;">Belum ada testimoni.</p>';
        return;
    }

    container.innerHTML = '';

    testimonials.forEach((testi, index) => {
        const card = document.createElement('div');
        card.className = 'testimonial-card-page reveal';
        card.style.transitionDelay = `${(index % 3) * 0.1}s`;

        const stars = Array.from({ length: 5 }, (_, i) =>
            `<i class="fas ${i < testi.rating ? 'fa-star' : 'fa-star'}" style="${i >= testi.rating ? 'opacity:0.2' : ''}"></i>`
        ).join('');

        const initial = (testi.name || 'U').charAt(0).toUpperCase();

        card.innerHTML = `
            <div class="testimonial-stars">${stars}</div>
            <p class="testimonial-text-page">"${testi.text}"</p>
            <div class="testimonial-author-page">
                <div class="testimonial-avatar">
                    ${testi.avatar
                        ? `<img src="${testi.avatar}" alt="Foto ${testi.name}" loading="lazy" />`
                        : `<span>${initial}</span>`
                    }
                </div>
                <div>
                    <h4>${testi.name}</h4>
                    <span>${testi.position || 'Pelanggan'}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Panggil reveal ulang agar elemen yang baru dirender tampil
    if (typeof window.initReveal === 'function') {
        window.initReveal();
    }
}
