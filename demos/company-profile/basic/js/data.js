/* ============================================
   NUSANTARA RICE DISTRIBUTION - COMPANY PROFILE
   data.js - Data Default (fallback untuk localStorage)
   ============================================ */

const NRD_DEFAULT_DATA = {
    products: [
        {
            id: 'p1',
            name: 'Beras Premium Cap Nusantara',
            category: 'Premium Rice',
            description: 'Beras premium kualitas terbaik dengan butiran panjang, pulen, dan aroma harum khas. Diproses dengan teknologi modern untuk menjaga kualitas gizi.',
            highlights: ['Butiran panjang & utuh', 'Aroma harum alami', 'Kadar air rendah', 'Hasil tanak sempurna'],
            price: 'Rp 15.000',
            packaging: ['5 Kg', '10 Kg', '25 Kg', '50 Kg'],
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
            featured: true
        },
        {
            id: 'p2',
            name: 'Beras Medium Cap Mas',
            category: 'Medium Rice',
            description: 'Beras medium berkualitas baik dengan harga terjangkau. Cocok untuk kebutuhan rumah tangga maupun usaha kuliner dengan hasil tanak yang empuk.',
            highlights: ['Harga ekonomis', 'Butiran padat', 'Mudah dimasak', 'Cocok untuk usaha'],
            price: 'Rp 12.000',
            packaging: ['5 Kg', '10 Kg', '25 Kg', '50 Kg'],
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
            featured: true
        },
        {
            id: 'p3',
            name: 'Beras Organik Alami',
            category: 'Beras Organik',
            description: 'Beras organik murni dari petani binaan tanpa pestisida kimia. Ditanam dengan metode pertanian berkelanjutan yang ramah lingkungan.',
            highlights: ['100% organik', 'Tanpa pestisida', 'Kaya nutrisi', 'Sertifikat organik'],
            price: 'Rp 19.000',
            packaging: ['5 Kg', '10 Kg', '25 Kg'],
            image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80',
            featured: true
        },
        {
            id: 'p4',
            name: 'Beras Pulen Wangi',
            category: 'Beras Pulen',
            description: 'Beras pulen dengan tekstur lembut dan wangi alami. Menghasilkan nasi yang tidak lengket dan tetap enak meskipun didinginkan.',
            highlights: ['Tekstur lembut', 'Wanginya alami', 'Tidak mudah basi', 'Hasil nasi sempurna'],
            price: 'Rp 14.500',
            packaging: ['5 Kg', '10 Kg', '25 Kg', '50 Kg'],
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
            featured: false
        },
        {
            id: 'p5',
            name: 'Beras IR 64',
            category: 'Beras IR',
            description: 'Varietas beras IR 64 yang populer dengan produktivitas tinggi dan rasa enak. Pilihan utama untuk kebutuhan komersial dan industri pangan.',
            highlights: ['Varietas unggul', 'Produktivitas tinggi', 'Harga bersaing', 'Stok besar'],
            price: 'Rp 11.500',
            packaging: ['10 Kg', '25 Kg', '50 Kg'],
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
            featured: false
        },
        {
            id: 'p6',
            name: 'Beras Kemasan Retail',
            category: 'Beras Kemasan Retail',
            description: 'Kemasan retail 1kg hingga 5kg dengan desain menarik. Cocok untuk kebutuhan toko, minimarket, dan bisnis e-commerce beras.',
            highlights: ['Kemasan premium', 'Higienis', 'Cocok drop-shipping', 'Desain menarik'],
            price: 'Rp 13.000',
            packaging: ['1 Kg', '5 Kg', '10 Kg'],
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
            featured: false
        }
    ],

    gallery: [
        {
            id: 'g1',
            title: 'Gudang Penyimpanan Utama',
            category: 'gudang',
            image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80'
        },
        {
            id: 'g2',
            title: 'Karung Beras Siap Kirim',
            category: 'distribusi',
            image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80'
        },
        {
            id: 'g3',
            title: 'Beras Premium Grade A',
            category: 'produk',
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80'
        },
        {
            id: 'g4',
            title: 'Armada Truk Distribusi',
            category: 'kendaraan',
            image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80'
        },
        {
            id: 'g5',
            title: 'Proses Packing Modern',
            category: 'packing',
            image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80'
        },
        {
            id: 'g6',
            title: 'Sawah Petani Mitra',
            category: 'produk',
            image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80'
        },
        {
            id: 'g7',
            title: 'Loading Barang Pengiriman',
            category: 'distribusi',
            image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80'
        },
        {
            id: 'g8',
            title: 'Mesin Penggiling Modern',
            category: 'gudang',
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80'
        },
        {
            id: 'g9',
            title: 'Kemasan Retail Premium',
            category: 'packing',
            image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=600&q=80'
        },
        {
            id: 'g10',
            title: 'Pickup Delivery',
            category: 'kendaraan',
            image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80'
        },
        {
            id: 'g11',
            title: 'Beras Curah Kualitas Baik',
            category: 'produk',
            image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80'
        },
        {
            id: 'g12',
            title: 'Tim Quality Control',
            category: 'gudang',
            image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80'
        }
    ],

    pricing: [
        {
            id: 'pr1',
            name: 'Retail',
            tagline: 'Untuk kebutuhan rumah tangga & pembelian eceran',
            price: '57.000',
            period: 'per 5 kg',
            minOrder: 'Min. 1 karung (5 kg)',
            benefits: [
                { text: 'Harga kompetitif', desc: 'Langsung dari distributor' },
                { text: 'Pengiriman H+1', desc: 'Wilayah Jabodetabek' },
                { text: 'Kemasan bersih', desc: 'Segel & kualitas terjamin' }
            ],
            riceTypes: ['Beras Medium', 'Beras IR 64'],
            bonus: ['Tanpa bonus khusus'],
            featured: false
        },
        {
            id: 'pr2',
            name: 'Reseller',
            tagline: 'Untuk toko kelontong, warung, dan agen kecil',
            price: '110.000',
            period: 'per 10 kg',
            minOrder: 'Min. 10 karung (10 kg)',
            benefits: [
                { text: 'Harga grosir', desc: 'Diskon hingga 10%' },
                { text: 'Margin keuntungan besar', desc: 'Cocok dijual kembali' },
                { text: 'Prioritas pengiriman', desc: '1-2 hari kerja' },
                { text: 'Katalog produk', desc: 'Brosur & materi promosi' }
            ],
            riceTypes: ['Semua jenis beras'],
            bonus: ['Bonus 1 karung setiap pembelian 50 karung'],
            featured: false
        },
        {
            id: 'pr3',
            name: 'Distributor',
            tagline: 'Untuk perusahaan, restoran, catering, dan mitra besar',
            price: '4.900.000',
            period: 'per 1 ton (40 karung)',
            minOrder: 'Min. 1 ton / bulan',
            benefits: [
                { text: 'Harga paling murah', desc: 'Diskon hingga 20%' },
                { text: 'Supply kontinyu', desc: 'Stok terjamin tiap bulan' },
                { text: 'Kredit pembayaran', desc: 'Maks. 30 hari' },
                { text: 'Armada khusus', desc: 'Pengiriman dengan truk' },
                { text: 'Dukungan penuh', desc: 'Account manager khusus' },
                { text: 'Produk eksklusif', desc: 'Akses varian premium' }
            ],
            riceTypes: ['Semua jenis beras + premium'],
            bonus: ['Bonus 2 karung + free ongkir setiap bulan'],
            featured: true
        }
    ],

    testimonials: [
        {
            id: 't1',
            name: 'Budi Santoso',
            position: 'Pemilik RM Sederhana',
            avatar: 'https://i.pravatar.cc/100?img=12',
            rating: 5,
            text: 'Kualitas beras dari Nusantara Rice selalu konsisten. Nasi tidak mudah basi dan pelanggan warung saya puas. Pengiriman juga selalu tepat waktu!'
        },
        {
            id: 't2',
            name: 'Siti Rahmawati',
            position: 'Ibu Rumah Tangga',
            avatar: 'https://i.pravatar.cc/100?img=47',
            rating: 5,
            text: 'Berasnya bersih, tidak ada kerikil, dan pulen banget. Keluarga saya paling suka. Harganya juga lebih murah dari pasar!'
        },
        {
            id: 't3',
            name: 'Andi Wijaya',
            position: 'Pemilik Toko Sembako',
            avatar: 'https://i.pravatar.cc/100?img=68',
            rating: 4,
            text: 'Sudah 2 tahun jadi reseller. Marginnya bagus, stok selalu ada, dan timnya responsif. Sangat direkomendasikan untuk toko sembako.'
        },
        {
            id: 't4',
            name: 'Dewi Lestari',
            position: 'Owner Catering Prima',
            avatar: 'https://i.pravatar.cc/100?img=45',
            rating: 5,
            text: 'Kebutuhan catering saya rata-rata 2 ton per bulan. Nusantara Rice tidak pernah mengecewakan. Harga grosirnya sangat bersaing!'
        },
        {
            id: 't5',
            name: 'Hendra Gunawan',
            position: 'Manajer Restoran Nusantara',
            avatar: 'https://i.pravatar.cc/100?img=15',
            rating: 5,
            text: 'Beras premium mereka sangat cocok untuk restoran kami. Aroma dan teksturnya kelas hotel. Pelayanan distributor sangat profesional.'
        },
        {
            id: 't6',
            name: 'Rina Marlina',
            position: 'Pengusaha Katering',
            avatar: 'https://i.pravatar.cc/100?img=33',
            rating: 4,
            text: 'Pengiriman selalu tepat dan stok tidak pernah kosong saat peak season. Tim sales juga cepat merespons kebutuhan tambahan.'
        }
    ],

    faqs: [
        {
            id: 'f1',
            question: 'Apa saja jenis beras yang didistribusikan oleh Nusantara Rice?',
            answer: 'Kami mendistribusikan berbagai jenis beras berkualitas, antara lain Beras Premium, Beras Medium, Beras Organik, Beras Pulen, Beras IR 64, dan Beras Kemasan Retail. Semua jenis beras kami diproses dengan standar quality control yang ketat.'
        },
        {
            id: 'f2',
            question: 'Berapa minimal pemesanan untuk pembelian retail?',
            answer: 'Untuk pembelian retail, minimal pemesanan adalah 1 karung beras ukuran 5 kg. Namun untuk kebutuhan rumah tangga, kami juga menyediakan kemasan retail 1 kg hingga 5 kg di toko mitra kami.'
        },
        {
            id: 'f3',
            question: 'Apakah bisa memesan dalam jumlah besar (grosir) untuk usaha?',
            answer: 'Tentu bisa. Kami menyediakan paket Reseller dengan minimal pesanan 10 karung (10 kg) dan paket Distributor dengan minimal pesanan 1 ton per bulan. Semakin besar pesanan, semakin besar diskon yang Anda dapatkan.'
        },
        {
            id: 'f4',
            question: 'Bagaimana sistem pengiriman dan biaya kirimnya?',
            answer: 'Kami memiliki armada sendiri untuk area Jabodetabek dan sekitarnya dengan biaya pengiriman yang terjangkau. Untuk pengiriman ke luar pulau, kami bekerja sama dengan ekspedisi terpercaya. Biaya pengiriman menyesuaikan jarak dan volume pesanan.'
        },
        {
            id: 'f5',
            question: 'Apakah tersedia pembayaran cicilan atau kredit untuk distributor?',
            answer: 'Ya, untuk mitra distributor dengan kerja sama yang sudah berjalan baik, kami menyediakan fasilitas kredit pembayaran maksimal 30 hari. Ketentuan ini akan disepakati dalam perjanjian kerja sama.'
        },
        {
            id: 'f6',
            question: 'Bagaimana kualitas dan keamanan beras yang didistribusikan?',
            answer: 'Kami menerapkan standar kualitas ketat mulai dari pemilihan petani mitra, proses penggilingan, penyimpanan gudang, hingga pengemasan. Beras kami bebas dari pemutih, pewarna, dan pengawet berbahaya. Dilengkapi sertifikat SNI.'
        },
        {
            id: 'f7',
            question: 'Apakah bisa mendapatkan sampel produk sebelum order?',
            answer: 'Bisa! Kami menyediakan sampel produk untuk calon pelanggan, terutama untuk pemesanan grosir. Anda bisa menghubungi tim kami melalui halaman kontak untuk memesan sampel.'
        },
        {
            id: 'f8',
            question: 'Berapa lama waktu pengiriman setelah pemesanan?',
            answer: 'Untuk area Jabodetabek, pengiriman dilakukan dalam 1-2 hari kerja setelah pembayaran dikonfirmasi. Untuk area luar jabodetabek dan luar pulau, estimasi 3-7 hari kerja tergantung lokasi.'
        },
        {
            id: 'f9',
            question: 'Apakah ada jumlah stok maksimal yang bisa dipesan?',
            answer: 'Tidak ada batasan maksimal. Dengan kapasitas gudang yang besar dan kerjasama dengan banyak petani, kami mampu memenuhi kebutuhan stok dalam jumlah besar untuk mitra distributor maupun perusahaan.'
        },
        {
            id: 'f10',
            question: 'Bagaimana cara kerja sama menjadi mitra distributor?',
            answer: 'Hubungi tim kami melalui form kontak atau WhatsApp, lalu tim sales kami akan menghubungi Anda untuk diskusi kebutuhan. Setelah menyetujui syarat dan ketentuan, Anda akan mendapatkan account manager khusus dan akses ke harga distributor.'
        },
        {
            id: 'f11',
            question: 'Apakah tersedia garansi jika produk tidak sesuai?',
            answer: 'Ya, kami memberikan garansi penggantian jika produk yang diterima tidak sesuai dengan pesanan atau mengalami kerusakan. Laporkan dalam 3x24 jam setelah barang diterima beserta dokumentasi.'
        },
        {
            id: 'f12',
            question: 'Metode pembayaran apa saja yang bisa digunakan?',
            answer: 'Kami menerima pembayaran melalui transfer bank (BCA, Mandiri, BNI, BRI), e-wallet (GoPay, OVO, Dana, ShopeePay), dan pembayaran langsung di kantor kami.'
        }
    ]
};

/* ---------- Helper untuk akses data public (dengan fallback localStorage) ---------- */
const NRD_STORE = {
    PRODUCTS_KEY: 'nrd_products',
    GALLERY_KEY: 'nrd_gallery',
    PRICING_KEY: 'nrd_pricing',
    TESTIMONIALS_KEY: 'nrd_testimonials',

    get(key, defaultValue) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return defaultValue;
            return JSON.parse(raw);
        } catch (e) {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    getProducts() {
        return this.get(this.PRODUCTS_KEY, NRD_DEFAULT_DATA.products);
    },
    getGallery() {
        return this.get(this.GALLERY_KEY, NRD_DEFAULT_DATA.gallery);
    },
    getPricing() {
        return this.get(this.PRICING_KEY, NRD_DEFAULT_DATA.pricing);
    },
    getTestimonials() {
        return this.get(this.TESTIMONIALS_KEY, NRD_DEFAULT_DATA.testimonials);
    }
};