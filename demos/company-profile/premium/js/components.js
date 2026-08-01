/* =========================================================
   AURORA GRAND RESORT - SHARED COMPONENTS
   Inject navbar, footer, loader, cursor etc. on each page
   ========================================================= */
'use strict';

const SiteComponents = (() => {

    /* ---------- NAVBAR HTML ---------- */
    const navbarHTML = (activePage) => `
    <nav class="navbar" aria-label="Navigasi utama">
        <div class="container nav-container">
            <a href="index.html" class="nav-logo" aria-label="Beranda Aurora Grand Resort">
                <span class="nav-logo-icon"><i class="fa-solid fa-crown"></i></span>
                <span class="nav-logo-text">
                    <strong>Aurora Grand</strong>
                </span>
            </a>
            <ul class="nav-menu" id="navMenu">
                <li><a href="index.html" class="nav-link${activePage === 'index' ? ' active' : ''}" data-page-link>Home</a></li>
                <li><a href="about.html" class="nav-link${activePage === 'about' ? ' active' : ''}" data-page-link>About</a></li>
                <li class="has-mega">
                    <a href="rooms.html" class="nav-link mega-trigger${activePage === 'rooms' || activePage === 'room-detail' ? ' active' : ''}" data-page-link>Rooms <i class="fa-solid fa-chevron-down chevron"></i></a>
                    <div class="mega-menu">
                        <a href="rooms.html#luxury-suite" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-gem"></i></span>
                            <span><strong>Luxury Suite</strong><small>Suite paling mewah</small></span>
                        </a>
                        <a href="rooms.html#executive" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-briefcase"></i></span>
                            <span><strong>Executive</strong><small>Untuk tamu bisnis</small></span>
                        </a>
                        <a href="rooms.html#family" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-children"></i></span>
                            <span><strong>Family Suite</strong><small>Liburan keluarga</small></span>
                        </a>
                        <a href="room-detail.html?id=villa" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-house-chimney"></i></span>
                            <span><strong>Grand Villa</strong><small>Villa pribadi eksklusif</small></span>
                        </a>
                        <a href="rooms.html" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-bed"></i></span>
                            <span><strong>Semua Kamar</strong><small>Lihat koleksi lengkap</small></span>
                        </a>
                        <a href="gallery.html" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-images"></i></span>
                            <span><strong>Galeri Kamar</strong><small>Foto interior & view</small></span>
                        </a>
                    </div>
                </li>
                <li class="has-mega">
                    <a href="facilities.html" class="nav-link mega-trigger${activePage === 'facilities' ? ' active' : ''}" data-page-link>Facilities <i class="fa-solid fa-chevron-down chevron"></i></a>
                    <div class="mega-menu">
                        <a href="facilities.html#restaurant" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-utensils"></i></span>
                            <span><strong>Restaurant</strong><small>Skyline Fine Dining</small></span>
                        </a>
                        <a href="facilities.html#pool" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-water-ladder"></i></span>
                            <span><strong>Infinity Pool</strong><small>Panorama laut</small></span>
                        </a>
                        <a href="facilities.html#spa" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-spa"></i></span>
                            <span><strong>Wellness Spa</strong><small>Relaksasi mewah</small></span>
                        </a>
                        <a href="facilities.html#fitness" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-dumbbell"></i></span>
                            <span><strong>Fitness Center</strong><small>Technogym equipment</small></span>
                        </a>
                        <a href="facilities.html#meeting" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-user-group"></i></span>
                            <span><strong>Meeting Room</strong><small>Kapasitas 10-100</small></span>
                        </a>
                        <a href="facilities.html#ballroom" class="mega-item" data-page-link>
                            <span class="mega-icon"><i class="fa-solid fa-champagne-glasses"></i></span>
                            <span><strong>Grand Ballroom</strong><small>Kapasitas 1.500 tamu</small></span>
                        </a>
                    </div>
                </li>
                <li><a href="gallery.html" class="nav-link${activePage === 'gallery' ? ' active' : ''}" data-page-link>Gallery</a></li>
                <li><a href="events.html" class="nav-link${activePage === 'events' ? ' active' : ''}" data-page-link>Events</a></li>
                <li><a href="packages.html" class="nav-link${activePage === 'packages' ? ' active' : ''}" data-page-link>Packages</a></li>
                <li><a href="articles.html" class="nav-link${activePage === 'articles' || activePage === 'article-detail' ? ' active' : ''}" data-page-link>Articles</a></li>
                <li><a href="career.html" class="nav-link${activePage === 'career' ? ' active' : ''}" data-page-link>Career</a></li>
                <li><a href="faq.html" class="nav-link${activePage === 'faq' ? ' active' : ''}" data-page-link>FAQ</a></li>
                <li><a href="contact.html" class="nav-link${activePage === 'contact' ? ' active' : ''}" data-page-link>Contact</a></li>
                <li><a href="contact.html" class="btn btn-gold btn-sm nav-cta magnetic" data-page-link><i class="fa-solid fa-calendar-check"></i> Book Now</a></li>
            </ul>
            <div class="nav-right">
                <button class="theme-toggle" aria-label="Ganti tema terang/gelap"><i class="fa-solid fa-moon"></i></button>
                <button class="nav-toggle" id="navToggle" aria-label="Buka menu" aria-expanded="false"><span></span><span></span><span></span></button>
            </div>
        </div>
    </nav>
    <div class="nav-overlay" aria-hidden="true"></div>`;

    /* ---------- FOOTER HTML ---------- */
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <a href="index.html" class="nav-logo" data-page-link>
                        <span class="nav-logo-icon"><i class="fa-solid fa-crown"></i></span>
                        <span class="nav-logo-text">
                            <strong>Aurora Grand</strong>
                            <span>Resort & Convention</span>
                        </span>
                    </a>
                    <p>Luxury resort, convention hall, wedding venue dan fine dining restaurant di jantung kota Jakarta.</p>
                    <div class="footer-social">
                        <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                        <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
                    </div>
                </div>
                <div class="footer-links">
                    <h4>Explore</h4>
                    <ul>
                        <li><a href="about.html" data-page-link>About Us</a></li>
                        <li><a href="rooms.html" data-page-link>Rooms</a></li>
                        <li><a href="facilities.html" data-page-link>Facilities</a></li>
                        <li><a href="gallery.html" data-page-link>Gallery</a></li>
                        <li><a href="events.html" data-page-link>Events</a></li>
                        <li><a href="packages.html" data-page-link>Packages</a></li>
                    </ul>
                </div>
                <div class="footer-links">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="career.html" data-page-link>Career</a></li>
                        <li><a href="articles.html" data-page-link>Articles</a></li>
                        <li><a href="faq.html" data-page-link>FAQ</a></li>
                        <li><a href="contact.html" data-page-link>Contact</a></li>
                        <li><a href="admin/login.html" target="_blank" rel="noopener">Admin Panel</a></li>
                    </ul>
                </div>
                <div class="footer-newsletter">
                    <h4>Newsletter</h4>
                    <p>Dapatkan penawaran eksklusif dan info terbaru dari kami.</p>
                    <form class="newsletter-form" id="footerNewsletter">
                        <input type="email" id="newsletterEmail" placeholder="Email Anda" aria-label="Email untuk newsletter" required>
                        <button type="submit" aria-label="Berlangganan"><i class="fa-solid fa-paper-plane"></i></button>
                    </form>
                    <ul class="footer-contact" style="margin-top:24px">
                        <li><i class="fa-solid fa-location-dot"></i> Jl. Grand Boulevard No. 88, Jakarta Selatan</li>
                        <li><i class="fa-solid fa-phone"></i> +62 21 1234 5678</li>
                        <li><i class="fa-solid fa-envelope"></i> info@auroragrandresort.co.id</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2026 Aurora Grand Resort. All rights reserved.</p>
                <div class="footer-bottom-links">
                    <a href="https://prasetyaas.github.io" target="_blank" rel="noopener">Demo by Prasetya Adhytiatama Saputra</a>
                    <a href="admin/login.html" target="_blank" rel="noopener">Admin Login</a>
                </div>
            </div>
        </div>
    </footer>

    <div class="floating-contact">
        <a href="https://wa.me/6281212345678" class="fc-btn fc-whatsapp" target="_blank" rel="noopener" aria-label="Chat WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
            <span class="fc-tooltip">Chat WhatsApp</span>
        </a>
        <a href="contact.html" class="fc-btn fc-booking" aria-label="Booking sekarang" data-page-link>
            <i class="fa-solid fa-calendar-check"></i>
            <span class="fc-tooltip">Booking Sekarang</span>
        </a>
    </div>`;

    /* ---------- GLOBAL OVERLAY HTML ---------- */
    const overlayHTML = `
    <div class="loading-screen" role="status" aria-label="Memuat halaman">
        <div class="loading-logo">Aurora <span>Grand</span></div>
        <div class="loading-line"></div>
        <div style="font-size:0.75rem; letter-spacing:3px; text-transform:uppercase; color:var(--gray-500)">Experience the Extraordinary</div>
    </div>
    <div class="cursor-dot" aria-hidden="true"></div>
    <div class="cursor-ring" aria-hidden="true"></div>
    <div class="scroll-progress" aria-hidden="true"></div>
    <div class="page-transition" aria-hidden="true"></div>`;

    /* ---------- LIGHTBOX HTML ---------- */
    const lightboxHTML = `
    <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Pratinjau gambar">
        <button class="lb-close" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
        <button class="lb-prev" aria-label="Sebelumnya"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="lb-next" aria-label="Berikutnya"><i class="fa-solid fa-chevron-right"></i></button>
        <img src="" alt="Pratinjau gambar" id="lightboxImg">
        <div class="lb-caption"></div>
    </div>`;

    /* ---------- INJECT ---------- */
    const inject = (activePage = '') => {
        // Inject overlays at start of body
        const overlayDiv = document.createElement('div');
        overlayDiv.innerHTML = overlayHTML;
        document.body.prepend(overlayDiv);

        // Inject navbar after overlays
        const navHolder = document.querySelector('#site-header');
        if (navHolder) {
            navHolder.innerHTML = navbarHTML(activePage);
        } else {
            const navDiv = document.createElement('div');
            navDiv.innerHTML = navbarHTML(activePage);
            document.body.insertBefore(navDiv, document.body.firstChild);
        }

        // Inject footer + floating contact
        const footHolder = document.querySelector('#site-footer');
        if (footHolder) {
            footHolder.innerHTML = footerHTML;
        } else {
            const footDiv = document.createElement('div');
            footDiv.innerHTML = footerHTML;
            document.body.appendChild(footDiv);
        }

        // Inject lightbox
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);

        // Bind footer newsletter
        const form = document.getElementById('footerNewsletter');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('newsletterEmail');
                if (email && email.value) {
                    showToast('Terima kasih! Berhasil berlangganan newsletter.');
                    email.value = '';
                }
            });
        }
    };

    /* ---------- TOAST ---------- */
    const showToast = (message) => {
        let toast = document.querySelector('.agr-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'agr-toast';
            toast.style.cssText = 'position:fixed;bottom:100px;right:30px;background:var(--navy-800);border:1px solid rgba(201,168,106,0.4);color:var(--cream);padding:14px 24px;border-radius:12px;box-shadow:var(--shadow-lg);z-index:9999;font-size:0.88rem;opacity:0;transform:translateY(20px);transition:all 0.4s cubic-bezier(0.16,1,0.3,1);max-width:340px';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
        }, 3500);
    };

    return { inject, showToast };
})();

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const active = body.dataset.page || window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    SiteComponents.inject(active);
});