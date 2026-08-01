/* =========================================================
   AURORA GRAND RESORT - GENERIC CRUD MODULE RENDERER
   Renders list, table, add/edit modal, delete modal, search,
   filter & pagination for every admin module from config.
   ========================================================= */
'use strict';

const ModuleRenderer = (() => {

    /* ================= MODULE CONFIG ================= */
    const modules = {

        about: {
            title: 'About Company',
            subtitle: 'Kelola konten profil perusahaan di halaman Tentang Kami.',
            columns: ['No', 'Bagian', 'Konten', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Bagian': 'Profil Singkat', 'Konten': 'Berdiri sejak 2001, melayani hospitality kelas dunia...', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Bagian': 'Sejarah', 'Konten': 'Dari 120 kamar menjadi 320 kamar mewah...', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Bagian': 'Penghargaan', 'Konten': 'Best Luxury Resort, Top Wedding Venue...', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        },

        vision: {
            title: 'Vision & Mission',
            subtitle: 'Kelola visi, misi dan nilai-nilai perusahaan.',
            columns: ['No', 'Tipe', 'Konten', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Tipe': 'Visi', 'Konten': 'Menjadi resort terkemuka di Asia Tenggara...', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Tipe': 'Misi', 'Konten': 'Memberikan pengalaman tak terlupakan kepada tamu...', 'Status': '<span class="status-badge published">Publish</span>' }
            ]
        },

        facilities: {
            title: 'Facilities',
            subtitle: 'Kelola data fasilitas resort seperti restaurant, pool, spa & ballroom.',
            columns: ['No', 'Fasilitas', 'Deskripsi', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Fasilitas': 'Skyline Restaurant', 'Deskripsi': 'Fine dining lantai 32 dengan panorama kota', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Fasilitas': 'Infinity Pool', 'Deskripsi': 'Kolam renang infinity 50m', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Fasilitas': 'Wellness Spa', 'Deskripsi': 'Spa mewah 12 ruang perawatan', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 4, 'Fasilitas': 'Fitness Center', 'Deskripsi': 'Gym Technogym 800 m²', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        },

        rooms: {
            title: 'Rooms',
            subtitle: 'Kelola kamar, suite dan villa.',
            columns: ['No', 'Tipe Kamar', 'Harga / Malam', 'Kapasitas', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Tipe Kamar': 'Aurora Luxury Suite', 'Harga / Malam': 'Rp 4.500.000', 'Kapasitas': '3 Tamu', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Tipe Kamar': 'Executive Room', 'Harga / Malam': 'Rp 2.800.000', 'Kapasitas': '2 Tamu', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Tipe Kamar': 'Family Suite', 'Harga / Malam': 'Rp 3.500.000', 'Kapasitas': '5 Tamu', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 4, 'Tipe Kamar': 'Grand Villa Aurora', 'Harga / Malam': 'Rp 8.500.000', 'Kapasitas': '6 Tamu', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        },

        gallery: {
            title: 'Gallery',
            subtitle: 'Kelola foto galeri website.',
            columns: ['No', 'Gambar', 'Judul', 'Kategori', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Gambar': '<img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=80&q=80" style="width:70px;height:44px;object-fit:cover;border-radius:8px">', 'Judul': 'Luxury Suite', 'Kategori': 'Rooms', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Gambar': '<img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=80&q=80" style="width:70px;height:44px;object-fit:cover;border-radius:8px">', 'Judul': 'Grand Ballroom', 'Kategori': 'Events', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Gambar': '<img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=80&q=80" style="width:70px;height:44px;object-fit:cover;border-radius:8px">', 'Judul': 'Infinity Pool', 'Kategori': 'Facilities', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        },

        articles: {
            title: 'Articles',
            subtitle: 'Kelola artikel, berita dan blog.',
            columns: ['No', 'Judul Artikel', 'Kategori', 'Penulis', 'Tanggal', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Judul Artikel': '5 Alasan Aurora Grand untuk Wedding Anda', 'Kategori': 'Wedding', 'Penulis': 'Event Team', 'Tanggal': '12 Des 2025', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Judul Artikel': 'Sensasi Kuliner Asia Klasik', 'Kategori': 'Dining', 'Penulis': 'Culinary Team', 'Tanggal': '8 Des 2025', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Judul Artikel': 'Tren MICE 2026', 'Kategori': 'Corporate', 'Penulis': 'Marketing', 'Tanggal': '2 Des 2025', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        },

        testimonials: {
            title: 'Testimonials',
            subtitle: 'Kelola testimonial dan ulasan tamu.',
            columns: ['No', 'Nama', 'Peran', 'Rating', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Nama': 'Alexander Wijaya', 'Peran': 'CEO, Wijaya Group', 'Rating': '★★★★★', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Nama': 'Linda Hartono', 'Peran': 'Ibu dari Mempelai', 'Rating': '★★★★★', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Nama': 'Michael Tanuwijaya', 'Peran': 'Director, PT Nusantara', 'Rating': '★★★★☆', 'Status': '<span class="status-badge pending">Pending</span>' }
            ]
        },

        faq: {
            title: 'FAQ',
            subtitle: 'Kelola pertanyaan yang sering diajukan.',
            columns: ['No', 'Pertanyaan', 'Kategori', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Pertanyaan': 'Jam check-in dan check-out?', 'Kategori': 'Layanan', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Pertanyaan': 'Bagaimana cara reservasi?', 'Kategori': 'Reservasi', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Pertanyaan': 'Kapasitas Grand Ballroom?', 'Kategori': 'Event', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        },

        career: {
            title: 'Career',
            subtitle: 'Kelola lowongan pekerjaan.',
            columns: ['No', 'Posisi', 'Departemen', 'Lokasi', 'Tipe', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Posisi': 'Front Office Supervisor', 'Departemen': 'Front Office', 'Lokasi': 'Jakarta', 'Tipe': 'Full-time', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Posisi': 'Executive Chef', 'Departemen': 'Culinary', 'Lokasi': 'Jakarta', 'Tipe': 'Full-time', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Posisi': 'Spa Therapist', 'Departemen': 'Wellness', 'Lokasi': 'Jakarta', 'Tipe': 'Part-time', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        },

        events: {
            title: 'Events',
            subtitle: 'Kelola jenis dan data event.',
            columns: ['No', 'Jenis Event', 'Deskripsi', 'Kapasitas', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Jenis Event': 'Wedding', 'Deskripsi': 'Pernikahan mewah hingga 1.500 tamu', 'Kapasitas': '1.500', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Jenis Event': 'Corporate', 'Deskripsi': 'Konferensi dan rapat korporat', 'Kapasitas': '1.000', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Jenis Event': 'Seminar', 'Deskripsi': 'Seminar dan workshop', 'Kapasitas': '800', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        },

        packages: {
            title: 'Packages',
            subtitle: 'Kelola paket wedding, meeting dan gathering.',
            columns: ['No', 'Nama Paket', 'Harga', 'Kapasitas', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Nama Paket': 'Wedding Silver', 'Harga': 'Rp 50JT', 'Kapasitas': '200 pax', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Nama Paket': 'Wedding Gold', 'Harga': 'Rp 100JT', 'Kapasitas': '500 pax', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Nama Paket': 'Corporate Day Meeting', 'Harga': 'Rp 450K / pax', 'Kapasitas': '100 pax', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        },

        categories: {
            title: 'Categories',
            subtitle: 'Kelola master data kategori untuk semua modul.',
            columns: ['No', 'Nama Kategori', 'Modul', 'Jumlah Item', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Nama Kategori': 'Wedding', 'Modul': 'Events', 'Jumlah Item': '3', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Nama Kategori': 'Rooms', 'Modul': 'Gallery', 'Jumlah Item': '5', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 3, 'Nama Kategori': 'Dining', 'Modul': 'Articles', 'Jumlah Item': '2', 'Status': '<span class="status-badge published">Publish</span>' }
            ]
        },

        messages: {
            title: 'Inquiry List',
            subtitle: 'Kelola pesan dan inquiry dari pengunjung website.',
            columns: ['No', 'Nama', 'Email', 'Keperluan', 'Tanggal', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Nama': 'Budi Santoso', 'Email': 'budi@gmail.com', 'Keperluan': 'Reservasi Kamar', 'Tanggal': '16 Jan 2026', 'Status': '<span class="status-badge pending">Belum Dibaca</span>' },
                { 'No': 2, 'Nama': 'Sari Wijaya', 'Email': 'sari@yahoo.com', 'Keperluan': 'Wedding Package', 'Tanggal': '15 Jan 2026', 'Status': '<span class="status-badge published">Dibalas</span>' },
                { 'No': 3, 'Nama': 'Andi Pratama', 'Email': 'andi@gmail.com', 'Keperluan': 'Corporate Meeting', 'Tanggal': '14 Jan 2026', 'Status': '<span class="status-badge pending">Belum Dibaca</span>' }
            ]
        },

        newsletter: {
            title: 'Newsletter',
            subtitle: 'Kelola daftar subscriber newsletter.',
            columns: ['No', 'Email', 'Tanggal Daftar', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Email': 'joko@gmail.com', 'Tanggal Daftar': '15 Jan 2026', 'Status': '<span class="status-badge published">Aktif</span>' },
                { 'No': 2, 'Email': 'dewi@yahoo.com', 'Tanggal Daftar': '14 Jan 2026', 'Status': '<span class="status-badge published">Aktif</span>' },
                { 'No': 3, 'Email': 'rudi@outlook.com', 'Tanggal Daftar': '10 Jan 2026', 'Status': '<span class="status-badge rejected">Berhenti</span>' }
            ]
        },

        users: {
            title: 'Users',
            subtitle: 'Kelola akun pengguna admin.',
            columns: ['No', 'Pengguna', 'Email', 'Role', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Pengguna': '<div class="cell-user"><span class="table-avatar">A</span><div><strong>Admin</strong><small>Super Administrator</small></div></div>', 'Email': 'admin@auroragrandresort.co.id', 'Role': 'Administrator', 'Status': '<span class="status-badge published">Aktif</span>' },
                { 'No': 2, 'Pengguna': '<div class="cell-user"><span class="table-avatar">E</span><div><strong>Editor</strong><small>Editor Konten</small></div></div>', 'Email': 'editor@auroragrandresort.co.id', 'Role': 'Editor', 'Status': '<span class="status-badge published">Aktif</span>' },
                { 'No': 3, 'Pengguna': '<div class="cell-user"><span class="table-avatar">P</span><div><strong>Penulis</strong><small>Author Artikel</small></div></div>', 'Email': 'author@auroragrandresort.co.id', 'Role': 'Author', 'Status': '<span class="status-badge rejected">Nonaktif</span>' }
            ]
        },

        roles: {
            title: 'Roles & Permission',
            subtitle: 'Kelola role dan izin akses pengguna.',
            columns: ['No', 'Role', 'Deskripsi', 'Pengguna', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Role': 'Administrator', 'Deskripsi': 'Akses penuh ke semua modul', 'Pengguna': '1', 'Status': '<span class="status-badge published">Aktif</span>' },
                { 'No': 2, 'Role': 'Editor', 'Deskripsi': 'Kelola konten & media', 'Pengguna': '2', 'Status': '<span class="status-badge published">Aktif</span>' },
                { 'No': 3, 'Role': 'Author', 'Deskripsi': 'Buat & kelola artikel', 'Pengguna': '3', 'Status': '<span class="status-badge published">Aktif</span>' }
            ]
        },

        profile: {
            title: 'Company Profile',
            subtitle: 'Kelola dokumen company profile yang dapat diunduh.',
            columns: ['No', 'Nama Dokumen', 'Format', 'Ukuran', 'Status', 'Aksi'],
            rows: [
                { 'No': 1, 'Nama Dokumen': 'Brochure Aurora Grand 2026', 'Format': 'PDF', 'Ukuran': '4.2 MB', 'Status': '<span class="status-badge published">Publish</span>' },
                { 'No': 2, 'Nama Dokumen': 'Company Profile English', 'Format': 'PDF', 'Ukuran': '3.8 MB', 'Status': '<span class="status-badge draft">Draft</span>' }
            ]
        }

    };

    /* ================= RENDER MODULE ================= */
    const init = () => {
        const root = document.getElementById('module-root');
        if (!root) return;

        const moduleKey = document.body.dataset.module;
        const config = modules[moduleKey];
        if (!config) return;

        root.innerHTML = `
            <div class="page-header">
                <div>
                    <nav class="admin-breadcrumb">
                        <a href="dashboard.html">Dashboard</a>
                        <i class="fa-solid fa-chevron-right"></i>
                        <span>${config.title}</span>
                    </nav>
                    <h1>${config.title}</h1>
                    <div class="subtitle">${config.subtitle}</div>
                </div>
                <div class="page-actions">
                    <button class="btn-admin btn-gold-a" data-open-modal="addModal"><i class="fa-solid fa-plus"></i> Tambah Data</button>
                </div>
            </div>

            <div class="admin-card">
                <div class="table-header">
                    <h3>Daftar ${config.title}</h3>
                    <div class="table-actions">
                        <div class="search-input"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="moduleSearch" placeholder="Cari data..."></div>
                        <select class="filter-select" id="moduleFilter"><option>Semua Status</option><option>Publish</option><option>Draft</option></select>
                    </div>
                </div>
                <div class="table-wrap">
                    <table class="data-table">
                        <thead><tr>${
                            config.columns.map((c) => `<th>${c}</th>`).join('')
                        }</tr></thead>
                        <tbody id="moduleBody"></tbody>
                    </table>
                </div>
                <div class="table-pagination">
                    <span id="moduleInfo">Menampilkan ${config.rows.length} data</span>
                    <div class="pagination-a"><button class="page-btn-a active">1</button></div>
                </div>
            </div>

            <div class="modal-overlay" id="addModal">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3><i class="fa-solid fa-plus" style="color:var(--gold); margin-right:8px"></i> Tambah Data Baru</h3>
                        <button class="modal-close"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-grid-a">
                            ${config.columns.slice(1, -1).map((col) => `
                                <div class="form-group-a"><label>${col}</label><input type="text" placeholder="Masukkan ${col.toLowerCase()}"></div>
                            `).join('')}
                            <div class="form-group-a"><label>Status</label><select><option>Publish</option><option>Draft</option></select></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-admin btn-outline-a" data-modal-close="addModal">Batal</button>
                        <button class="btn-admin btn-gold-a" data-save-form="addModal" data-save-message="Data berhasil disimpan."><i class="fa-solid fa-check"></i> Simpan</button>
                    </div>
                </div>
            </div>

            <div class="modal-overlay" id="deleteModal">
                <div class="modal" style="max-width:420px">
                    <div class="modal-header">
                        <h3><i class="fa-solid fa-triangle-exclamation" style="color:var(--danger); margin-right:8px"></i> Konfirmasi Hapus</h3>
                        <button class="modal-close"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="modal-body"><p>Apakah Anda yakin ingin menghapus data ini?</p></div>
                    <div class="modal-footer">
                        <button class="btn-admin btn-outline-a" data-modal-close="deleteModal">Batal</button>
                        <button class="btn-admin btn-danger-a"><i class="fa-solid fa-trash"></i> Hapus</button>
                    </div>
                </div>
            </div>
        `;

        renderTable(config.rows);

        const searchInput = document.getElementById('moduleSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase();
                const filtered = config.rows.filter((row) =>
                    Object.values(row).join(' ').toLowerCase().includes(q)
                );
                renderTable(filtered);
            });
        }
    };

    const renderTable = (rows) => {
        const tbody = document.getElementById('moduleBody');
        if (!tbody) return;

        tbody.innerHTML = rows.map((row) => {
            const cols = Object.values(row);
            return `<tr>
                ${cols.map((val) => `<td>${val}</td>`).join('')}
                <td class="table-actions-cell">
                    <button class="btn-admin btn-icon-a btn-outline-a" title="Edit" onclick="Admin.toast('Membuka data untuk diedit.')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-admin btn-icon-a btn-danger-a" title="Hapus" data-delete-name="${cols[1] || 'Data'}"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('') || `<tr><td colspan="99" style="text-align:center; color:var(--admin-text-muted); padding:40px">Tidak ada data ditemukan.</td></tr>`;

        const info = document.getElementById('moduleInfo');
        if (info) info.textContent = `Menampilkan ${rows.length} data`;
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    ModuleRenderer.init();
});