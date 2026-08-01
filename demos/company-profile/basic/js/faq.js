/* ============================================
   NUSANTARA RICE DISTRIBUTION - COMPANY PROFILE
   faq.js - Accordion FAQ Animation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initFAQ();
});

function initFAQ() {
    const faqItems = document.querySelectorAll('.accordion-item');
    if (faqItems.length === 0) return;

    faqItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');

        if (!header || !content) return;

        // Set content height dynamically for smooth animation
        const setContentHeight = () => {
            const inner = content.querySelector('.accordion-content-inner');
            if (inner) content.style.maxHeight = inner.scrollHeight + 'px';
        };

        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(other => {
                other.classList.remove('active');
                const otherContent = other.querySelector('.accordion-content');
                if (otherContent) otherContent.style.maxHeight = '0px';
            });

            // If was not active, open this one
            if (!isActive) {
                item.classList.add('active');
                setContentHeight();
            }
        });

        // Recalculate on resize
        window.addEventListener('resize', () => {
            if (item.classList.contains('active')) {
                setContentHeight();
            }
        });
    });
}

/* ---------- Render FAQ from data (optional, for dynamic FAQ page) ---------- */
function renderFAQFromData() {
    const faqContainer = document.getElementById('faqList');
    if (!faqContainer) return;

    const faqs = (typeof NRD_DEFAULT_DATA !== 'undefined') ? NRD_DEFAULT_DATA.faqs : [];
    if (faqs.length === 0) return;

    faqContainer.innerHTML = '';

    faqs.forEach(faq => {
        const item = document.createElement('div');
        item.className = 'accordion-item reveal';
        item.innerHTML = `
            <button class="accordion-header" aria-expanded="false" aria-label="${faq.question}">
                <span>${faq.question}</span>
                <span class="accordion-icon"><i class="fas fa-chevron-down"></i></span>
            </button>
            <div class="accordion-content">
                <div class="accordion-content-inner">${faq.answer}</div>
            </div>
        `;
        faqContainer.appendChild(item);
    });

    // Re-init accordion after rendering
    initFAQ();

    // Panggil reveal ulang agar elemen FAQ yang baru dirender tampil
    if (typeof window.initReveal === 'function') {
        window.initReveal();
    }
}
