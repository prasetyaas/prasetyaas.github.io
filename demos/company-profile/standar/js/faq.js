/* ==================================================
   SAKURA KOI INDONESIA - FAQ Accordion
   Accordion premium untuk halaman FAQ.
   ================================================== */

(function() {
    'use strict';

    function init() {
        const faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(function(item) {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (!question || !answer) return;

            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');

                // Tutup semua
                faqItems.forEach(function(other) {
                    other.classList.remove('active');
                    const otherAnswer = other.querySelector('.faq-answer');
                    if (otherAnswer) otherAnswer.style.maxHeight = null;
                });

                // Jika tidak active sebelumnya, buka yang diklik
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();