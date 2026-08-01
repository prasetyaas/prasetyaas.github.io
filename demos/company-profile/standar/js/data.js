/* ==================================================
   SAKURA KOI INDONESIA - Data Layer (Default/Seed)
   Semua data default untuk website & admin panel.
   Disimpan di localStorage untuk kebutuhan demo tanpa backend.
   ================================================== */

/* Namespace global SKI */
window.SKI = window.SKI || {};

/* Keys localStorage */
SKI.KEYS = {
    ARTICLES: 'ski_articles',
    GALLERY: 'ski_gallery',
    KOI: 'ski_koi',
    TESTIMONIALS: 'ski_testimonials',
    FAQ: 'ski_faq',
    SETTINGS: 'ski_settings',
    AUTH: 'ski_auth'
};

/* Data default kontak / pengaturan */
SKI.defaultSettings = {
    company: 'Sakura Koi Indonesia',
    tagline: 'Premium Japanese Koi for Every Pond',
    whatsapp: '6281234567890',
    email: 'info@sakurakoi.co.id',
    phone: '+62 812-3456-7890',
    address: 'Jl. Koi Indah No. 88, Kawasan Puncak, Bogor, Jawa Barat 16750',
    mapsUrl: 'https://maps.google.com/maps?q=Bogor&t=&z=13&ie=UTF8&iwloc=&output=embed',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    twitter: 'https://twitter.com',
    hours: 'Senin - Sabtu: 08.00 - 17.00 WIB',
    closedDay: 'Minggu & Hari Libur Nasional: Tutup'
};

/* Data default Koi Collection */
SKI.defaultKoi = [
    {
        id: 'kohaku',
        name: 'Kohaku',
        japanese: '紅白',
        desc: 'Ikon klasik koi Jepang dengan pola putih dan merah. Simbol kemurnian dan keanggunan, sangat diminati kolektor.',
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&q=80',
        price: 'Rp 1.500.000',
        category: 'Klasik',
        featured: true
    },
    {
        id: 'sanke',
        name: 'Sanke',
        japanese: '三色',
        desc: 'Koi tri-warna putih, merah, dan hitam. Kombinasi sempurna yang melambangkan keberuntungan dan kemakmuran.',
        image: 'https://images.unsplash.com/photo-1559481169-357b65f8d949?w=600&q=80',
        price: 'Rp 2.000.000',
        category: 'Klasik',
        featured: true
    },
    {
        id: 'showa',
        name: 'Showa',
        japanese: '昭和',
        desc: 'Koi hitam dengan aksen merah dan putih. Karakter kuat dan tegas, pilihan favorit para penggemar.',
        image: 'https://images.unsplash.com/photo-1545468800-85c963d5db48?w=600&q=80',
        price: 'Rp 2.500.000',
        category: 'Klasik',
        featured: false
    },
    {
        id: 'tancho',
        name: 'Tancho',
        japanese: '丹頂',
        desc: 'Koi putih dengan satu bercak merah di kepala, menyerupai bendera Jepang. Sangat langka dan bernilai tinggi.',
        image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&q=80',
        price: 'Rp 5.000.000',
        category: 'Premium',
        featured: true
    },
    {
        id: 'asagi',
        name: 'Asagi',
        japanese: '浅黄',
        desc: 'Koi biru keabu-abuan dengan pola sisik reticulated. Warna lembut dan tenang, melambangkan ketenangan.',
        image: 'https://images.unsplash.com/photo-1559839914-17aae6fbf8b7?w=600&q=80',
        price: 'Rp 3.000.000',
        category: 'Premium',
        featured: false
    },
    {
        id: 'shiro-utsuri',
        name: 'Shiro Utsuri',
        japanese: '白写',
        desc: 'Koi hitam pekat dengan pola putih kontras. Kombinasi dramatis yang elegan dan penuh wibawa.',
        image: 'https://images.unsplash.com/photo-1511608573492-5ef5f0af1256?w=600&q=80',
        price: 'Rp 3.500.000',
        category: 'Premium',
        featured: false
    },
    {
        id: 'ogon',
        name: 'Ogon',
        japanese: '黄金',
        desc: 'Koi emas metalik yang berkilau. Simbol kemakmuran dan kemewahan, sangat disukai pebisnis.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
        price: 'Rp 2.200.000',
        category: 'Metalik',
        featured: true
    },
    {
        id: 'butterfly',
        name: 'Butterfly Koi',
        japanese: '蝶鯉',
        desc: 'Koi bersirip panjang memanjang seperti sayap kupu-kupu. Gerakan anggun dan menawan.',
        image: 'https://images.unsplash.com/photo-1536623417169-9bc4576a9a8b?w=600&q=80',
        price: 'Rp 1.800.000',
        category: 'Spesial',
        featured: false
    }
];

/* Data default Galeri */
SKI.defaultGallery = [
    // Farm
    { id: 'g1', category: 'farm', title: 'Kolam Budidaya Utama', img: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80' },
    { id: 'g2', category: 'farm', title: 'Fasilitas Karantina', img: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80' },
    // Pond
    { id: 'g3', category: 'pond', title: 'Kolam Jepang Premium', img: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=600&q=80' },
    { id: 'g4', category: 'pond', title: 'Kolam Natural Garden', img: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&q=80' },
    // Fish
    { id: 'g5', category: 'fish', title: 'Kohaku Juara', img: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&q=80' },
    { id: 'g6', category: 'fish', title: 'Sanke Premium', img: 'https://images.unsplash.com/photo-1559481169-357b65f8d949?w=600&q=80' },
    // Event
    { id: 'g7', category: 'event', title: 'Koi Show 2024', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80' },
    { id: 'g8', category: 'event', title: 'Customers Gathering', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80' },
    { id: 'g9', category: 'farm', title: 'Area Pembibitan', img: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80' },
    { id: 'g10', category: 'pond', title: 'Kolam Minimalis', img: 'https://images.unsplash.com/photo-1430216848742-fa3e1986cf65?w=600&q=80' },
    { id: 'g11', category: 'fish', title: 'Tancho Premium', img: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&q=80' },
    { id: 'g12', category: 'event', title: 'Open House Farm', img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80' }
];

/* Data default Artikel / Blog */
SKI.defaultArticles = [
    {
        id: 1,
        title: 'Memahami 8 Jenis Koi Paling Populer untuk Koleksi Anda',
        category: 'Panduan',
        date: '12 Juli 2025',
        summary: 'Pelajari karakteristik unik dari Kohaku, Sanke, hingga Butterfly Koi untuk menentukan pilihan terbaik bagi kolam Anda.',
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&q=80',
        author: 'Tim Sakura Koi',
        readTime: '5 menit',
        status: 'published'
    },
    {
        id: 2,
        title: 'Cara Membuat Kolam Koi yang Ideal: Panduan Lengkap untuk Pemula',
        category: 'Tips',
        date: '5 Juli 2025',
        summary: 'Dari pemilihan lokasi, sistem filtrasi, hingga kedalaman kolam — panduan menyeluruh untuk kolam koi impian Anda.',
        image: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=600&q=80',
        author: 'Tim Sakura Koi',
        readTime: '8 menit',
        status: 'published'
    },
    {
        id: 3,
        title: 'Rahasia Air Jernih untuk Koi: Sistem Filtrasi Jepang',
        category: 'Perawatan',
        date: '28 Juni 2025',
        summary: 'Teknik filtrasi ala Japan Koi Farm untuk menjaga kualitas air tetap sempurna sepanjang tahun.',
        image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80',
        author: 'Tim Sakura Koi',
        readTime: '6 menit',
        status: 'published'
    },
    {
        id: 4,
        title: 'Apa itu Koi Tancho? Ikon Langka dari Negeri Sakura',
        category: 'Edukasi',
        date: '20 Juni 2025',
        summary: 'Mengenal koi Tancho — ikan dengan bercak merah simbol bendera Jepang yang sangat bernilai tinggi.',
        image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&q=80',
        author: 'Tim Sakura Koi',
        readTime: '4 menit',
        status: 'published'
    },
    {
        id: 5,
        title: 'Panduan Pemberian Pakan Koi: Frekuensi dan Jenis Terbaik',
        category: 'Perawatan',
        date: '14 Juni 2025',
        summary: 'Pakan berkualitas menentukan kesehatan dan warna koi. Simak rekomendasi pakan dan jadwal pemberian yang tepat.',
        image: 'https://images.unsplash.com/photo-1536623417169-9bc4576a9a8b?w=600&q=80',
        author: 'Tim Sakura Koi',
        readTime: '5 menit',
        status: 'published'
    },
    {
        id: 6,
        title: 'Proses Import Koi Jepang: Dari Niigata hingga Kedatangan di Indonesia',
        category: 'Berita',
        date: '7 Juni 2025',
        summary: 'Perjalanan koi premium dari farm terkenal di Niigata, Jepang hingga tiba dengan selamat di tangan kolektor Indonesia.',
        image: 'https://images.unsplash.com/photo-1511608573492-5ef5f0af1256?w=600&q=80',
        author: 'Tim Sakura Koi',
        readTime: '7 menit',
        status: 'published'
    },
    {
        id: 7,
        title: 'Cara Mengenali Koi Berkualitas Tinggi Sebelum Membeli',
        category: 'Tips',
        date: '1 Juni 2025',
        summary: '5 indikator penting: bentuk tubuh, kualitas kulit, pola, gerakan sirip, dan kesehatan mata koi.',
        image: 'https://images.unsplash.com/photo-1559481169-357b65f8d949?w=600&q=80',
        author: 'Tim Sakura Koi',
        readTime: '6 menit',
        status: 'published'
    },
    {
        id: 8,
        title: 'Musim Terbaik Membeli Koi: Strategi Musiman dalam Koleksi',
        category: 'Panduan',
        date: '25 Mei 2025',
        summary: 'Kapan waktu paling tepat membeli koi? Pelajari pola musiman dan tips memilih koi di setiap musim.',
        image: 'https://images.unsplash.com/photo-1545468800-85c963d5db48?w=600&q=80',
        author: 'Tim Sakura Koi',
        readTime: '4 menit',
        status: 'published'
    },
    {
        id: 9,
        title: 'Menjaga Kesehatan Koi: Pencegahan Penyakit Musiman',
        category: 'Berita',
        date: '18 Mei 2025',
        summary: 'Tips pencegahan penyakit umum pada koi, pentingnya karantina, dan tanda-tanda koi dalam kondisi optimal.',
        image: 'https://images.unsplash.com/photo-1559839914-17aae6fbf8b7?w=600&q=80',
        author: 'Tim Sakura Koi',
        readTime: '5 menit',
        status: 'published'
    }
];

/* Data default Testimoni */
SKI.defaultTestimonials = [
    {
        id: 1,
        name: 'Budi Hartono',
        role: 'Kolektor Koi - Jakarta',
        text: 'Kualitas koi dari Sakura Koi luar biasa. Saya sudah membeli 3 ekor Kohaku dan semuanya sehat dengan pola sempurna.',
        rating: 5,
        initial: 'B'
    },
    {
        id: 2,
        name: 'Siti Rahma',
        role: 'Pemilik Taman & Kolam - Bandung',
        text: 'Layanan pembuatan kolam koi mereka sangat profesional. Hasilnya indah dan sistem filtrasinya berjalan sempurna.',
        rating: 5,
        initial: 'S'
    },
    {
        id: 3,
        name: 'Andi Wijaya',
        role: 'Hobiis Koi - Surabaya',
        text: 'Proses import koi dari Jepang sangat lancar dan transparan. Ikan tiba dalam kondisi sehat, dokumen lengkap.',
        rating: 5,
        initial: 'A'
    },
    {
        id: 4,
        name: 'Rina Marlina',
        role: 'Pengusaha - Semarang',
        text: 'Konsultasi dari tim Sakura Koi sangat membantu. Kolam saya kini menjadi tempat favorit untuk bersantai keluarga.',
        rating: 4,
        initial: 'R'
    }
];

/* Data default FAQ */
SKI.defaultFaq = [
    {
        id: 1,
        q: 'Apakah Sakura Koi Indonesia melayani pengiriman ke seluruh Indonesia?',
        a: 'Ya, kami melayani pengiriman koi ke seluruh Indonesia dengan metode pengiriman khusus yang aman dan terjamin. Kami menggunakan kemasan ekspor dengan oksigen murni dan thermal box untuk menjaga suhu stabil selama perjalanan.'
    },
    {
        id: 2,
        q: 'Berapa lama waktu pengiriman koi ke luar pulau?',
        a: 'Untuk area Jawa umumnya 1-2 hari. Untuk luar Jawa berkisar 2-4 hari tergantung lokasi. Kami selalu berkoordinasi dengan maskapai/logistik terpercaya dan memberikan update status pengiriman secara berkala.'
    },
    {
        id: 3,
        q: 'Apakah koi yang dikirim dijamin hidup?',
        a: 'Kami memberikan garansi koi hidup sampai di tangan Anda selama mengikuti prosedur adaptasi yang kami berikan. Jika koi tiba dalam kondisi tidak sesuai, kami akan melakukan penggantian.'
    },
    {
        id: 4,
        q: 'Dari mana asal koi yang dijual?',
        a: 'Sebagian besar koi kami diimpor langsung dari farm premium di Niigata, Jepang — daerah penghasil koi terbaik dunia. Kami juga memiliki kolam budidaya sendiri dengan indukan berkualitas dari Jepang.'
    },
    {
        id: 5,
        q: 'Apakah ada dokumen resmi untuk koi import?',
        a: 'Ya, setiap koi import dilengkapi dokumen lengkap seperti Certificate of Origin dari Japan Koi Farm, Surat Keterangan Kesehatan, dan dokumen karantina sesuai regulasi yang berlaku.'
    },
    {
        id: 6,
        q: 'Berapa ukuran koi yang tersedia?',
        a: 'Kami menyediakan koi dalam berbagai ukuran mulai dari 10-15 cm (baby) hingga 70 cm ke atas (grand champion class). Ukuran menentukan harga, semakin besar dan bagus kualitasnya semakin tinggi harganya.'
    },
    {
        id: 7,
        q: 'Bagaimana cara memilih koi yang berkualitas baik?',
        a: 'Perhatikan bentuk tubuh yang proporsional, kulit yang bersih tanpa kusam, pola yang tegas, gerakan sirip yang lincah, dan mata yang jernih. Tim kami juga siap membantu Anda memilih koi terbaik sesuai budget.'
    },
    {
        id: 8,
        q: 'Apakah menyediakan jasa perawatan kolam berkala?',
        a: 'Ya, kami menawarkan paket perawatan kolam koi bulanan termasuk pembersihan filter, pergantian air, cek kesehatan koi, dan pemberian vitamin. Tersedia jadwal fleksibel.'
    },
    {
        id: 9,
        q: 'Berapa biaya pembuatan kolam koi?',
        a: 'Biaya tergantung ukuran, desain, dan sistem filtrasi yang dipilih. Kami memberikan konsultasi gratis untuk menghitung estimasi biaya sesuai kebutuhan dan budget Anda.'
    },
    {
        id: 10,
        q: 'Apakah koi bisa hidup di kolam tanpa filter?',
        a: 'Tidak disarankan. Koi membutuhkan filtrasi yang baik untuk menjaga kualitas air. Tanpa filter, kualitas air cepat menurun dan berdampak buruk pada kesehatan koi. Konsultasikan desain filtrasi dengan tim kami.'
    },
    {
        id: 11,
        q: 'Apa saja jenis pakan yang direkomendasikan?',
        a: 'Kami merekomendasikan pakan berkualitas tinggi yang mengandung spirulina untuk mempertegas warna, protein tinggi untuk pertumbuhan, dan formula khusus untuk imunitas koi.'
    },
    {
        id: 12,
        q: 'Bagaimana cara adaptasi koi setelah pengiriman?',
        a: 'Cara terbaik adalah dengan metode float dan dripping. Terima koi beserta kantong, apungkan kantong di kolam selama 15-20 menit, lalu masukkan air kolam sedikit demi sedikit sebelum koi dilepaskan. Panduan lengkap kami sertakan.'
    },
    {
        id: 13,
        q: 'Apakah ada garansi untuk layanan kolam?',
        a: 'Ya, kami memberikan garansi 1 tahun untuk pekerjaan konstruksi kolam dan 6 bulan untuk sistem filtrasi, termasuk service gratis follow-up setelah pembangunan.'
    },
    {
        id: 14,
        q: 'Apakah bisa berkunjung langsung ke farm?',
        a: 'Tentu! Kami sangat senang menerima kunjungan. Anda bisa melihat koleksi secara langsung. Disarankan melakukan janji temu terlebih dahulu melalui WhatsApp untuk memastikan tim kami siap menyambut Anda.'
    },
    {
        id: 15,
        q: 'Bagaimana cara melakukan pembayaran?',
        a: 'Kami menerima transfer bank (BCA, Mandiri, BNI), e-wallet (GoPay, OVO, DANA), dan DP 50% untuk pesanan custom/import dengan pelunasan sebelum pengiriman.'
    }
];

/* Data default Admin (username/password demo) */
SKI.defaultAdmin = {
    username: 'admin',
    password: 'sakura2025'
};

/* ===== UTILITY localStorage Helpers ===== */

/* Ambil data dari localStorage, jika kosong gunakan default */
SKI.getData = function(key, defaultData) {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading localStorage:', e);
    }
    return JSON.parse(JSON.stringify(defaultData));
};

/* Simpan data ke localStorage */
SKI.saveData = function(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
};

/* Inisialisasi semua data default di localStorage (jika belum ada) */
SKI.initData = function() {
    if (!localStorage.getItem(SKI.KEYS.ARTICLES)) {
        SKI.saveData(SKI.KEYS.ARTICLES, SKI.defaultArticles);
    }
    if (!localStorage.getItem(SKI.KEYS.GALLERY)) {
        SKI.saveData(SKI.KEYS.GALLERY, SKI.defaultGallery);
    }
    if (!localStorage.getItem(SKI.KEYS.KOI)) {
        SKI.saveData(SKI.KEYS.KOI, SKI.defaultKoi);
    }
    if (!localStorage.getItem(SKI.KEYS.TESTIMONIALS)) {
        SKI.saveData(SKI.KEYS.TESTIMONIALS, SKI.defaultTestimonials);
    }
    if (!localStorage.getItem(SKI.KEYS.FAQ)) {
        SKI.saveData(SKI.KEYS.FAQ, SKI.defaultFaq);
    }
    if (!localStorage.getItem(SKI.KEYS.SETTINGS)) {
        SKI.saveData(SKI.KEYS.SETTINGS, SKI.defaultSettings);
    }
};

/* Jalankan inisialisasi saat file dimuat */
SKI.initData();