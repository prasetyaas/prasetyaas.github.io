document.getElementById('hamburger').addEventListener('click', function() {
    const links = document.getElementById('navLinks');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    if (window.innerWidth > 768) links.style.display = 'flex';
});

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Pesan Anda telah dikirim! Tim kami akan menghubungi Anda. (Demo)');
    this.reset();
});

// Animated counters
const counters = document.querySelectorAll('.hs-num');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            let current = 0;
            const inc = Math.ceil(target / 50);
            const timer = setInterval(() => {
                current += inc;
                if (current >= target) { el.textContent = target; clearInterval(timer); }
                else el.textContent = current;
            }, 30);
            observer.unobserve(el);
        }
    });
}, { threshold: 0.5 });
counters.forEach(c => observer.observe(c));