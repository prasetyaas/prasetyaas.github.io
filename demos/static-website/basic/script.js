document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('✅ Pesanan Anda telah diterima! (Demo)');
    this.reset();
});
document.getElementById('hamburger').addEventListener('click', function() {
    const links = document.querySelector('.nav-links');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    if (window.innerWidth > 768) links.style.display = 'flex';
});