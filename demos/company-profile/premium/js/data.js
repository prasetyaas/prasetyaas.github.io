/* =========================================================
   AURORA GRAND RESORT - FRONTEND DUMMY DATA
   ========================================================= */

const AGR_DATA = {

    /* ---------- NAVIGATION ---------- */
    nav: {
        logo: {
            icon: 'fa-solid fa-crown',
            name: 'Aurora Grand',
            tag: 'Resort & Convention'
        },
        links: [
            { label: 'Home', href: 'index.html', active: false },
            { label: 'About', href: 'about.html', active: false },
            { label: 'Rooms', href: 'rooms.html', active: false, mega: true },
            { label: 'Facilities', href: 'facilities.html', active: false, mega: true },
            { label: 'Gallery', href: 'gallery.html', active: false },
            { label: 'Events', href: 'events.html', active: false },
            { label: 'Packages', href: 'packages.html', active: false },
            { label: 'Articles', href: 'articles.html', active: false },
            { label: 'Career', href: 'career.html', active: false },
            { label: 'FAQ', href: 'faq.html', active: false },
            { label: 'Contact', href: 'contact.html', active: false }
        ],
        cta: { label: 'Book Now', href: 'contact.html' }
    },

    /* ---------- TESTIMONIALS ---------- */
    testimonials: [
        {
            quote: 'Pengalaman menginap di Aurora Grand Resort benar-benar luar biasa. Pelayanan kelas dunia, kamar yang mewah, dan pemandangan yang menakjubkan. Ini adalah standar baru untuk luxury resort di Indonesia.',
            name: 'Alexander Wijaya',
            role: 'CEO, Wijaya Group',
            initials: 'AW'
        },
        {
            quote: 'Kami mengadakan wedding reception anak kami di Aurora Grand Ballroom. Tim event mereka sangat profesional, setiap detail ditangani dengan sempurna. Tamu undangan kami semua terkesan!',
            name: 'Linda Hartono',
            role: 'Ibu dari Mempelai',
            initials: 'LH'
        },
        {
            quote: 'Sebagai corporate partner, Aurora Grand menjadi venue pilihan utama untuk setiap acara perusahaan kami. Fasilitas MICE-nya lengkap dan support team-nya sangat responsif.',
            name: 'Michael Tanuwijaya',
            role: 'Director, PT Nusantara Maju',
            initials: 'MT'
        },
        {
            quote: 'Spa dan restaurant-nya luar biasa! Private dining experience yang kami rasakan benar-benar private dan mewah. Chef mereka sangat berbakat dalam memadukan cita rasa lokal dan internasional.',
            name: 'Sarah Kusuma',
            role: 'Travel Blogger',
            initials: 'SK'
        }
    ],

    /* ---------- ROOMS ---------- */
    rooms: [
        {
            id: 'luxury-suite',
            name: 'Aurora Luxury Suite',
            price: 4500000,
            desc: 'Suite paling mewah dengan pemandangan laut tak terbatas, ruang tamu terpisah, dan butler service 24 jam.',
            size: '120 m²',
            capacity: '3 Tamu',
            bed: 'King Size',
            features: ['Butler Service', 'Sea View', 'Jacuzzi', 'Mini Bar', 'Smart TV'],
            img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'
        },
        {
            id: 'executive',
            name: 'Executive Room',
            price: 2800000,
            desc: 'Kamar eksekutif modern dengan akses ke executive lounge, cocok untuk tamu bisnis.',
            size: '52 m²',
            capacity: '2 Tamu',
            bed: 'Queen Size',
            features: ['Executive Lounge', 'City View', 'Work Desk', 'Espresso Machine'],
            img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'
        },
        {
            id: 'family',
            name: 'Family Suite',
            price: 3500000,
            desc: 'Suite keluarga dengan 2 kamar tidur, ruang keluarga, dan akses langsung ke kolam renang anak.',
            size: '85 m²',
            capacity: '5 Tamu',
            bed: 'King + Twin',
            features: ['2 Bedrooms', 'Pool Access', 'Kitchenette', 'Kids Amenities'],
            img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80'
        },
        {
            id: 'villa',
            name: 'Grand Villa Aurora',
            price: 8500000,
            desc: 'Villa pribadi dengan kolam renang eksklusif, 3 kamar tidur, dan area taman privat.',
            size: '320 m²',
            capacity: '6 Tamu',
            bed: '3 King Beds',
            features: ['Private Pool', 'Garden', '3 Bedrooms', 'Private Chef', 'Beach Access'],
            img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'
        }
    ],

    /* ---------- FACILITIES ---------- */
    facilities: [
        {
            id: 'restaurant',
            name: 'Skyline Restaurant',
            icon: 'fa-solid fa-utensils',
            desc: 'Fine dining dengan menu internasional dan pemandangan kota dari lantai 32.',
            img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'
        },
        {
            id: 'pool',
            name: 'Infinity Pool',
            icon: 'fa-solid fa-water-ladder',
            desc: 'Kolam renang infinity dengan panorama laut, lengkap dengan poolside bar.',
            img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'
        },
        {
            id: 'spa',
            name: 'Aurora Wellness Spa',
            icon: 'fa-solid fa-spa',
            desc: 'Spa mewah dengan terapi khas, sauna, dan ruang perawatan privat.',
            img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80'
        },
        {
            id: 'fitness',
            name: 'Executive Fitness Center',
            icon: 'fa-solid fa-dumbbell',
            desc: 'Gym lengkap dengan peralatan Technogym dan personal trainer.',
            img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'
        },
        {
            id: 'meeting',
            name: 'Grand Meeting Room',
            icon: 'fa-solid fa-user-group',
            desc: 'Ruang meeting standar internasional untuk 10-100 peserta dengan peralatan lengkap.',
            img: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80'
        },
        {
            id: 'ballroom',
            name: 'Aurora Grand Ballroom',
            icon: 'fa-solid fa-champagne-glasses',
            desc: 'Ballroom mewah berkapasitas 1.500 tamu untuk wedding & corporate event.',
            img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'
        }
    ],

    /* ---------- ARTICLES ---------- */
    articles: [
        {
            id: '1',
            title: '5 Alasan Aurora Grand Resort Menjadi Pilihan Utama untuk Wedding Anda',
            category: 'Wedding',
            date: '12 Desember 2025',
            author: 'Event Team',
            img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
            excerpt: 'Mencari venue wedding yang sempurna? Ini alasan mengapa pasangan memilih Aurora Grand Resort untuk hari bahagia mereka.'
        },
        {
            id: '2',
            title: 'Sensasi Kuliner Asia Klasik di Skyline Restaurant',
            category: 'Dining',
            date: '8 Desember 2025',
            author: 'Culinary Team',
            img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
            excerpt: 'Chef kami menghadirkan pengalaman fine dining dengan sentuhan kuliner Asia klasik yang otentik dan elegan.'
        },
        {
            id: '3',
            title: 'Tren MICE 2026: Menyelenggarakan Corporate Event yang Berkesan',
            category: 'Corporate',
            date: '2 Desember 2025',
            author: 'Sales & Marketing',
            img: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80',
            excerpt: 'Dari hybrid event hingga gamifikasi, ini tren terbaru dalam menyelenggarakan acara korporat yang memorable.'
        },
        {
            id: '4',
            title: 'Perawatan Spa Terbaik untuk Relaksasi Setelah Bekerja',
            category: 'Wellness',
            date: '28 November 2025',
            author: 'Spa Team',
            img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
            excerpt: 'Temukan ritual perawatan spa yang sempurna untuk melepas penat dan memulihkan energi Anda.'
        },
        {
            id: '5',
            title: 'Menikmati Sunset dari Private Beach Aurora',
            category: 'Experience',
            date: '20 November 2025',
            author: 'Guest Relations',
            img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
            excerpt: 'Pantai privat kami adalah destinasi terbaik untuk menikmati golden hour dengan ketenangan yang tak terganggu.'
        },
        {
            id: '6',
            title: 'Paket Staycation Keluarga Terbaik di Akhir Tahun',
            category: 'Family',
            date: '15 November 2025',
            author: 'Reservations',
            img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
            excerpt: 'Habisi tahun ini dengan liburan keluarga tak terlupakan bersama paket staycation spesial kami.'
        }
    ],

    /* ---------- FAQ ---------- */
    faqs: [
        {
            q: 'Apa saja jam check-in dan check-out di Aurora Grand Resort?',
            a: 'Check-in dimulai pukul 14.00 WIB dan check-out pada pukul 12.00 WIB. Untuk tipe Villa dan Luxury Suite, kami menyediakan early check-in dan late check-out secara gratis (berdasarkan ketersediaan).'
        },
        {
            q: 'Bagaimana cara melakukan reservasi kamar atau paket event?',
            a: 'Anda dapat melakukan reservasi melalui halaman kontak, WhatsApp resmi kami di +62 21 1234 5678, atau email ke reservation@auroragrandresort.co.id. Tim kami siap membantu 24/7.'
        },
        {
            q: 'Apakah tersedia transportasi dari bandara?',
            a: 'Ya, kami menyediakan layanan airport transfer dengan mobil mewah (Mercedes / Alphard). Anda dapat memesan layanan ini saat melakukan reservasi dengan biaya yang terjangkau.'
        },
        {
            q: 'Apakah anak-anak diperbolehkan untuk menginap?',
            a: 'Tentu! Kami ramah keluarga. Tersedia Family Suite dengan fasilitas lengkap untuk anak-anak, termasuk kids club, kolam renang anak, dan menu khusus.'
        },
        {
            q: 'Berapa kapasitas maksimal Aurora Grand Ballroom?',
            a: 'Aurora Grand Ballroom dapat menampung hingga 1.500 tamu untuk gaya banquet dan 2.000 tamu untuk cocktail party. Kami juga memiliki berbagai ukuran ruang pertemuan lainnya.'
        },
        {
            q: 'Apakah ada kebijakan pembatalan?',
            a: 'Pembatalan gratis hingga 7 hari sebelum tanggal check-in. Untuk pembatalan kurang dari 7 hari, akan dikenakan biaya 50% dari total reservasi. Seluruh pembayaran tidak dapat dikembalikan jika pembatalan dilakukan kurang dari 48 jam.'
        }
    ],

    /* ---------- EVENTS ---------- */
    events: [
        {
            id: 'wedding',
            name: 'Wedding',
            icon: 'fa-solid fa-ring',
            desc: 'Pernikahan impian dengan tema mewah dan layanan wedding planner profesional.',
            img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
            capacity: '1500'
        },
        {
            id: 'corporate',
            name: 'Corporate',
            icon: 'fa-solid fa-briefcase',
            desc: 'Rapat, konferensi, dan acara korporat dengan fasilitas MICE lengkap.',
            img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
            capacity: '1000'
        },
        {
            id: 'birthday',
            name: 'Birthday',
            icon: 'fa-solid fa-cake-candles',
            desc: 'Rayakan ulang tahun dengan tema eksklusif dan katering istimewa.',
            img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80',
            capacity: '300'
        },
        {
            id: 'gathering',
            name: 'Gathering',
            icon: 'fa-solid fa-people-group',
            desc: 'Kumpul keluarga atau reuni dengan suasana hangat dan layanan personal.',
            img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
            capacity: '500'
        },
        {
            id: 'seminar',
            name: 'Seminar',
            icon: 'fa-solid fa-chalkboard-user',
            desc: 'Seminar dan workshop dengan teknologi presentasi mutakhir.',
            img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
            capacity: '800'
        }
    ],

    /* ---------- PACKAGES ---------- */
    packages: [
        {
            id: 'wedding-silver',
            name: 'Wedding Silver',
            price: 50000000,
            desc: 'Paket pernikahan lengkap untuk 200 tamu',
            features: ['Ballroom 200 pax', 'Wedding Organizer', 'Dekorasi Premium', 'Menu 5 Course', 'Bridal Suite', 'Foto & Video'],
            featured: false
        },
        {
            id: 'wedding-gold',
            name: 'Wedding Gold',
            price: 100000000,
            desc: 'Paket pernikahan mewah untuk 500 tamu',
            features: ['Grand Ballroom 500 pax', 'Wedding Organizer Pro', 'Dekorasi Import', 'Menu 7 Course', 'Honeymoon Villa 2 Malam', 'Cinematic Video', 'Live Music'],
            featured: true
        },
        {
            id: 'corporate-day',
            name: 'Corporate Day Meeting',
            price: 450000,
            desc: 'Paket meeting harian per peserta',
            features: ['Meeting Room 6 Jam', 'Coffee Break 2x', 'Business Lunch', 'LCD & Sound System', 'Flipchart', 'Mineral Water'],
            featured: false
        },
        {
            id: 'gathering-family',
            name: 'Family Gathering',
            price: 750000,
            desc: 'Paket gathering keluarga per orang',
            features: ['Private Area', 'Lunch Buffet', 'Kids Club', 'Foto Dokumentasi', 'Fruit Platter', 'Welcome Drink'],
            featured: false
        }
    ],

    /* ---------- CAREERS ---------- */
    careers: [
        { title: 'Front Office Supervisor', dept: 'Front Office', loc: 'Jakarta', type: 'Full-time', tag: 'fulltime' },
        { title: 'Executive Chef', dept: 'Culinary', loc: 'Jakarta', type: 'Full-time', tag: 'fulltime' },
        { title: 'Event Sales Manager', dept: 'Sales & Marketing', loc: 'Jakarta', type: 'Full-time', tag: 'fulltime' },
        { title: 'Spa Therapist', dept: 'Wellness', loc: 'Jakarta', type: 'Part-time', tag: 'parttime' },
        { title: 'Guest Relation Officer', dept: 'Guest Services', loc: 'Jakarta', type: 'Full-time', tag: 'fulltime' },
        { title: 'Banquet Service Captain', dept: 'F&B Service', loc: 'Jakarta', type: 'Full-time', tag: 'fulltime' }
    ],

    /* ---------- STAFF / MANAGEMENT ---------- */
    management: [
        { name: 'Rudi Hartono', role: 'President Director', initials: 'RH', desc: '20 tahun pengalaman di industri hospitality internasional.' },
        { name: 'Dewi Lestari', role: 'General Manager', initials: 'DL', desc: 'Memimpin operasional resort dengan standar bintang lima.' },
        { name: 'Andi Pratama', role: 'Director of Sales', initials: 'AP', desc: 'Pakar strategi penjualan untuk segmen MICE dan corporate.' },
        { name: 'Maya Anggraini', role: 'Executive Chef', initials: 'MA', desc: 'Menciptakan menu fine dining dengan sentuhan Nusantara.' }
    ],

    /* ---------- AWARDS ---------- */
    awards: [
        { icon: 'fa-solid fa-award', name: 'Best Luxury Resort', org: 'Indonesia Hospitality Awards 2025' },
        { icon: 'fa-solid fa-trophy', name: 'Top Wedding Venue', org: 'Asia Wedding Guide 2024' },
        { icon: 'fa-solid fa-medal', name: 'Excellent Service', org: 'TripAdvisor Travelers Choice' },
        { icon: 'fa-solid fa-star', name: '5-Star Rating', org: 'Google Reviews 4.9/5' }
    ],

    /* ---------- PARTNERS ---------- */
    partners: ['PT Garuda Indonesia', 'Traveloka', 'Booking.com', 'Bank Mandiri', 'Pertamina', 'Toyota Astra', 'Grab', 'Jakarta Convention']

};