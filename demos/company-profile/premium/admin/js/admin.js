/* =========================================================
   AURORA GRAND RESORT - ADMIN SHARED LAYOUT + CRUD DEMO
   ========================================================= */
'use strict';

const Admin = (() => {

    /* ---------- SIDEBAR MENU ---------- */
    const menuGroups = [
        {
            title: 'Menu Utama',
            items: [
                { label: 'Dashboard', icon: 'fa-solid fa-gauge-high', href: 'dashboard.html' },
                { label: 'Hero Banner', icon: 'fa-solid fa-image', href: 'hero.html' }
            ]
        },
        {
            title: 'Content Management',
            items: [
                { label: 'About Company', icon: 'fa-solid fa-building', href: 'about.html' },
                { label: 'Vision Mission', icon: 'fa-solid fa-eye', href: 'vision-mission.html' },
                { label: 'Facilities', icon: 'fa-solid fa-utensils', href: 'facilities.html' },
                { label: 'Rooms', icon: 'fa-solid fa-bed', href: 'rooms.html' },
                { label: 'Gallery', icon: 'fa-solid fa-images', href: 'gallery.html' },
                { label: 'Articles', icon: 'fa-solid fa-newspaper', href: 'articles.html' },
                { label: 'Testimonials', icon: 'fa-solid fa-comment-dots', href: 'testimonials.html' },
                { label: 'FAQ', icon: 'fa-solid fa-circle-question', href: 'faq.html' },
                { label: 'Career', icon: 'fa-solid fa-briefcase', href: 'career.html' },
                { label: 'Events', icon: 'fa-solid fa-champagne-glasses', href: 'events.html' },
                { label: 'Packages', icon: 'fa-solid fa-box-open', href: 'packages.html' },
                { label: 'Company Profile', icon: 'fa-solid fa-file-lines', href: 'profile.html' }
            ]
        },
        {
            title: 'Master Data',
            items: [
                { label: 'Categories', icon: 'fa-solid fa-tags', href: 'categories.html' }
            ]
        },
        {
            title: 'Media',
            items: [
                { label: 'Media Manager', icon: 'fa-solid fa-photo-film', href: 'media.html' }
            ]
        },
        {
            title: 'Contact Management',
            items: [
                { label: 'Inquiry List', icon: 'fa-solid fa-inbox', href: 'messages.html' },
                { label: 'Newsletter', icon: 'fa-solid fa-envelope-open-text', href: 'newsletter.html' },
                { label: 'Contact Info', icon: 'fa-solid fa-address-book', href: 'contact.html' }
            ]
        },
        {
            title: 'User Management',
            items: [
                { label: 'Users', icon: 'fa-solid fa-users-gear', href: 'users.html' },
                { label: 'Roles & Permission', icon: 'fa-solid fa-shield-halved', href: 'roles.html' }
            ]
        },
        {
            title: 'Lainnya',
            items: [
                { label: 'Reports', icon: 'fa-solid fa-chart-pie', href: 'reports.html' },
                { label: 'Settings', icon: 'fa-solid fa-gear', href: 'settings.html' }
            ]
        }
    ];

    /* ---------- BUILD SIDEBAR ---------- */
    const sidebarHTML = (activePage) => {
        let groupsHTML = menuGroups.map((group) => {
            const items = group.items.map((item) => {
                const isActive = item.href.replace('.html', '') === activePage;
                return `<a href="${item.href}" class="sidebar-link${isActive ? ' active' : ''}">
                    <i class="${item.icon}"></i><span>${item.label}</span>
                </a>`;
            }).join('');
            return `<div class="sidebar-group">
                <div class="sidebar-group-title">${group.title}</div>
                ${items}
            </div>`;
        }).join('');

        return `
        <aside class="admin-sidebar" id="adminSidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo-icon"><i class="fa-solid fa-crown"></i></div>
                <div class="sidebar-logo-text">
                    <strong>Aurora Grand</strong>
                    <span>Admin Panel</span>
                </div>
            </div>
            <nav class="sidebar-nav">
                ${groupsHTML}
            </nav>
            <div class="sidebar-footer">
                <a href="login.html" class="sidebar-user" style="color:inherit">
                    <div class="su-avatar">A</div>
                    <div class="su-info">
                        <strong>Admin</strong>
                        <small>Super Administrator</small>
                    </div>
                </a>
            </div>
        </aside>`;
    };

    /* ---------- TOPBAR HTML ---------- */
    const topbarHTML = `
    <header class="admin-topbar">
        <div class="topbar-left">
            <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
                <i class="fa-solid fa-bars-staggered"></i>
            </button>
            <div class="topbar-search">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Cari data, menu, atau modul..." aria-label="Pencarian global">
            </div>
        </div>
        <div class="topbar-right">
            <div class="notif-wrap">
                <button class="topbar-btn" id="notifToggle" aria-label="Pemberitahuan">
                    <i class="fa-solid fa-bell"></i>
                    <span class="badge">5</span>
                </button>
                <div class="notif-panel" id="notifPanel">
                    <div class="notif-header">
                        <h4>Notifikasi</h4>
                        <button id="notifMarkAll">Tandai semua dibaca</button>
                    </div>
                    <div class="notif-list">
                        <div class="notif-item unread">
                            <div class="notif-icon gold"><i class="fa-solid fa-envelope"></i></div>
                            <div class="notif-body">
                                <p><strong>Inquiry baru</strong> dari Budi Santoso (Reservasi Kamar)</p>
                                <small>2 menit lalu</small>
                            </div>
                        </div>
                        <div class="notif-item unread">
                            <div class="notif-icon green"><i class="fa-solid fa-check"></i></div>
                            <div class="notif-body">
                                <p>Konten <strong>Luxury Suite</strong> berhasil diperbarui</p>
                                <small>1 jam lalu</small>
                            </div>
                        </div>
                        <div class="notif-item unread">
                            <div class="notif-icon blue"><i class="fa-solid fa-upload"></i></div>
                            <div class="notif-body">
                                <p><strong>Media baru</strong> diunggah ke galeri</p>
                                <small>3 jam lalu</small>
                            </div>
                        </div>
                        <div class="notif-item">
                            <div class="notif-icon red"><i class="fa-solid fa-user-plus"></i></div>
                            <div class="notif-body">
                                <p>Pengguna baru <strong>Editor</strong> ditambahkan</p>
                                <small>1 hari lalu</small>
                            </div>
                        </div>
                        <div class="notif-item">
                            <div class="notif-icon warning"><i class="fa-solid fa-box"></i></div>
                            <div class="notif-body">
                                <p>Paket <strong>Wedding Gold</strong> diperbarui</p>
                                <small>2 hari lalu</small>
                            </div>
                        </div>
                    </div>
                    <div class="notif-footer">
                        <button id="notifViewAll">Lihat Semua Notifikasi</button>
                    </div>
                </div>
            </div>
            <button class="topbar-btn" aria-label="Buka website" onclick="window.open('../index.html','_blank')">
                <i class="fa-solid fa-globe"></i>
            </button>
            <button class="topbar-btn" id="adminThemeToggle" aria-label="Ganti tema">
                <i class="fa-solid fa-moon"></i>
            </button>
            <div class="topbar-profile">
                <div class="tp-avatar">A</div>
                <div>
                    <strong>Admin</strong>
                    <small>Super Administrator</small>
                </div>
            </div>
        </div>
    </header>`;

    /* ---------- INJECT LAYOUT ---------- */
    const injectLayout = (activePage) => {
        const wrapper = document.querySelector('.admin-wrapper');
        if (!wrapper) return;

        const aside = document.createElement('div');
        aside.innerHTML = sidebarHTML(activePage);
        wrapper.prepend(aside.firstElementChild);

        const main = wrapper.querySelector('.admin-main');
        if (main) {
            main.prepend(document.createRange().createContextualFragment(topbarHTML));
        }

        // Toast container
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    };

    /* ---------- THEME TOGGLE (ADMIN) ---------- */
    const initTheme = () => {
        const toggle = document.getElementById('adminThemeToggle');
        if (!toggle) return;
        const saved = localStorage.getItem('agr-admin-theme');
        if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            if (current === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('agr-admin-theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('agr-admin-theme', 'dark');
            }
        });
    };

    /* ---------- SIDEBAR COLLAPSE ---------- */
    const initSidebar = () => {
        const toggle = document.getElementById('sidebarToggle');
        const wrapper = document.querySelector('.admin-wrapper');
        if (!toggle || !wrapper) return;

        toggle.addEventListener('click', () => {
            wrapper.classList.toggle('sidebar-collapsed');
        });
    };

    /* ---------- NOTIFICATION PANEL ---------- */
    const initNotification = () => {
        const toggle = document.getElementById('notifToggle');
        const panel = document.getElementById('notifPanel');
        if (!toggle || !panel) return;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notif-wrap')) {
                panel.classList.remove('open');
            }
        });

        // Mark all as read
        const markAll = document.getElementById('notifMarkAll');
        if (markAll) {
            markAll.addEventListener('click', () => {
                panel.querySelectorAll('.notif-item.unread').forEach((item) => item.classList.remove('unread'));
                const badge = toggle.querySelector('.badge');
                if (badge) badge.style.display = 'none';
                toast('Semua notifikasi telah dibaca.');
            });
        }

        // View all
        const viewAll = document.getElementById('notifViewAll');
        if (viewAll) {
            viewAll.addEventListener('click', () => {
                toast('Membuka halaman semua notifikasi...');
                panel.classList.remove('open');
            });
        }
    };

    /* ---------- TOAST ---------- */
    const toast = (message, type = 'success') => {
        const container = document.querySelector('.toast-container');
        if (!container) return;
        const el = document.createElement('div');
        el.className = 'toast' + (type === 'error' ? ' error' : '');
        el.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}" style="color:${type === 'error' ? 'var(--danger)' : 'var(--success)'}"></i>
            <span>${message}</span>`;
        container.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.4s';
            setTimeout(() => el.remove(), 400);
        }, 3000);
    };

    /* ---------- MODAL HELPERS ---------- */
    const openModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('open');
    };

    const closeModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('open');
    };

    /* ---------- CONFIRM DELETE ---------- */
    const confirmDelete = (name, cb) => {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.querySelector('.modal-body p').textContent = `Apakah Anda yakin ingin menghapus "${name}"? Tindakan ini tidak dapat dibatalkan.`;
            modal.querySelector('.btn-danger-a').onclick = () => {
                closeModal('deleteModal');
                if (cb) cb();
                toast(`"${name}" berhasil dihapus.`);
            };
            openModal('deleteModal');
        }
    };

    /* ---------- GLOBAL CLICK HANDLERS ---------- */
    const initGlobalHandlers = () => {
        // Close modal on overlay click or close button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('open');
            }
            if (e.target.closest('.modal-close')) {
                e.target.closest('.modal-overlay').classList.remove('open');
            }
            if (e.target.closest('[data-modal-close]')) {
                document.getElementById(e.target.closest('[data-modal-close]').dataset.modalClose)?.classList.remove('open');
            }
            // Open modal buttons: data-open-modal
            if (e.target.closest('[data-open-modal]')) {
                const id = e.target.closest('[data-open-modal]').dataset.openModal;
                openModal(id);
            }
            // Edit / View buttons: data-edit-id
            if (e.target.closest('[data-edit-id]')) {
                const id = e.target.closest('[data-edit-id]').dataset.editId;
                toast(`Membuka data #${id} untuk diedit.`);
                const modalId = e.target.closest('[data-edit-id]').dataset.editModal || 'editModal';
                openModal(modalId);
            }
            // Delete buttons
            if (e.target.closest('[data-delete-name]')) {
                confirmDelete(e.target.closest('[data-delete-name]').dataset.deleteName);
            }
            // Save buttons
            if (e.target.closest('[data-save-form]')) {
                e.preventDefault();
                const target = e.target.closest('[data-save-form]');
                closeModal(target.dataset.saveForm);
                toast(target.dataset.saveMessage || 'Data berhasil disimpan.');
            }
        });

        // Escape closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.open').forEach((m) => m.classList.remove('open'));
            }
        });
    };

    /* ---------- INIT ---------- */
    const init = (activePage) => {
        injectLayout(activePage);
        initTheme();
        initSidebar();
        initNotification();
        initGlobalHandlers();

        // Animate bars after load
        setTimeout(() => {
            document.querySelectorAll('.bar-fill').forEach((bar) => {
                bar.style.height = bar.dataset.height + '%';
            });
        }, 300);
    };

    return { init, toast, openModal, closeModal, confirmDelete };
})();

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const active = body.dataset.page || window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    Admin.init(active);
});