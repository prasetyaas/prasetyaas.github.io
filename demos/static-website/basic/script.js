document.getElementById('hamburger').addEventListener('click', function() {
    const links = document.getElementById('navLinks');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    if (window.innerWidth > 768) links.style.display = 'flex';
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        if (window.innerWidth <= 768) {
            document.getElementById('navLinks').style.display = 'none';
        }
    });
});

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('.btn-primary');
    const orig = btn.textContent;
    btn.textContent = 'Pesanan Diterima! ✅';
    btn.style.background = '#16a34a';
    setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        this.reset();
    }, 2500);
});