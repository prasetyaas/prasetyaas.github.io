/* ============================================================
   RentFlow — Mock Data (deterministik)
   15 kategori · 100 item · 80 customer · 300 rental · 150 return
   Menggunakan seeded PRNG agar data konsisten setiap reload.
   ============================================================ */

/* ---------- Seeded PRNG (mulberry32) ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Deterministic RNG instance ---------- */
const rng = mulberry32(20260208);

/* ---------- Date helpers ---------- */
function mockDate(dayOffset, hour = 10, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function mockDateKey(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

/* ---------- Pick helper ---------- */
function pick(arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function rint(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/* ============================================================
   KATEGORI (15)
   ============================================================ */
const KATEGORI = [
  { id: 'cat-car',      name: 'Mobil',           icon: 'car',        bg: '#DBEAFE', color: '#1D4ED8' },
  { id: 'cat-bike',     name: 'Motor',           icon: 'bike',       bg: '#DCFCE7', color: '#15803D' },
  { id: 'cat-camera',   name: 'Kamera',          icon: 'camera',     bg: '#FEF3C7', color: '#B45309' },
  { id: 'cat-lens',     name: 'Lensa',           icon: 'lens',       bg: '#EDE9FE', color: '#6D28D9' },
  { id: 'cat-tools',    name: 'Alat Pertukangan', icon: 'tools',     bg: '#FFE4E6', color: '#BE123C' },
  { id: 'cat-garden',   name: 'Alat Kebun',      icon: 'leaf',       bg: '#ECFCCB', color: '#4D7C0F' },
  { id: 'cat-electro',  name: 'Elektronik',      icon: 'monitor',    bg: '#E0E7FF', color: '#4338CA' },
  { id: 'cat-sound',    name: 'Sound System',    icon: 'speaker',    bg: '#FCE7F3', color: '#BE185D' },
  { id: 'cat-outdoor',  name: 'Outdoor Equipment', icon: 'umbrella', bg: '#FEF9C3', color: '#A16207' },
  { id: 'cat-camping',  name: 'Camping',         icon: 'tent',       bg: '#D1FAE5', color: '#047857' },
  { id: 'cat-sport',    name: 'Olahraga',        icon: 'dumbbell',   bg: '#EFF6FF', color: '#2563EB' },
  { id: 'cat-marine',   name: 'Perlengkapan Laut', icon: 'ship',     bg: '#CFFAFE', color: '#0E7490' },
  { id: 'cat-drone',    name: 'Drone',           icon: 'drone',      bg: '#F3E8FF', color: '#7E22CE' },
  { id: 'cat-projector',name: 'Proyektor',       icon: 'projector',  bg: '#FEE2E2', color: '#B91C1C' },
  { id: 'cat-event',    name: 'Event',           icon: 'star',       bg: '#FFF7ED', color: '#C2410C' }
];

/* ============================================================
   ITEM (100)
   ============================================================ */
const ITEM_POOL = {
  'cat-car': [
    ['Toyota Avanza', 750000], ['Honda Brio', 650000], ['Daihatsu Xenia', 700000],
    ['Mitsubishi Xpander', 850000], ['Toyota Innova', 950000], ['Suzuki Ertiga', 700000], ['Honda HR-V', 900000]
  ],
  'cat-bike': [
    ['Honda Vario 160', 150000], ['Yamaha NMAX', 175000], ['Honda PCX', 170000],
    ['Yamaha Aerox', 160000], ['Honda Beat', 120000], ['Yamaha FreeGo', 135000], ['Kawasaki Ninja 250', 350000]
  ],
  'cat-camera': [
    ['Canon EOS R50', 350000], ['Sony A6400', 400000], ['Nikon Z50', 380000],
    ['Fujifilm X-T30', 420000], ['Canon EOS M50 Mark II', 320000], ['Sony ZV-E10', 350000], ['GoPro Hero 12', 250000]
  ],
  'cat-lens': [
    ['Canon RF 50mm f/1.8', 150000], ['Sony FE 35mm f/1.8', 180000], ['Nikon Z 24-70mm', 200000],
    ['Canon EF 70-200mm', 250000], ['Sony 18-105mm F4', 190000], ['Sigma 24mm f/1.4', 170000], ['Tamron 17-28mm', 180000]
  ],
  'cat-tools': [
    ['Bor Impact Makita', 150000], ['Mesin Gerinda Bosch', 120000], ['Jack Hammer Kecil', 250000],
    ['Compressor Mini', 180000], ['Bor Duduk 16mm', 140000], ['Mesin Cut Off', 110000], ['Set Obeng Listrik', 90000]
  ],
  'cat-garden': [
    ['Mesin Pemotong Rumput', 200000], ['Blower Daun', 100000], ['Trimmer Rumput', 120000],
    ['Chainsaw Kecil', 180000], ['Mesin Polisher', 130000], ['Sprayer Listrik', 80000], ['Cultivator Mini', 220000]
  ],
  'cat-electro': [
    ['LCD Monitor 43"', 300000], ['Kulkas Mini Bar', 200000], ['Kipas Angin Industrial', 100000],
    ['Microwave', 120000], ['AC Portable 9000 BTU', 350000], ['Dispenser Premium', 80000], ['Mesin Cuci Portable', 150000]
  ],
  'cat-sound': [
    ['Speaker Aktif 15"', 400000], ['Mikser Yamaha MG12', 250000], ['Wireless Mic UHF', 150000],
    ['Speaker Monitor 10"', 200000], ['Subwoofer 18"', 350000], ['Kabel & Stand Set', 100000], ['Amplifier 1000W', 300000]
  ],
  'cat-outdoor': [
    ['Tas Carrier 60L', 100000], ['Sleeping Bag', 50000], ['Headlamp 500Lm', 40000],
    ['Kursi Lipat Outdoor', 60000], ['Pisau Multifungsi', 30000], ['Kompor Portable', 50000], ['Tongkat Trekking', 40000]
  ],
  'cat-camping': [
    ['Tenda 4 Orang', 150000], ['Tenda Dome 2 Orang', 100000], ['Matras Camping', 40000],
    ['Nesting Cookware', 70000], ['Cooler Box 40L', 80000], ['Lampu Senja', 30000], ['Flysheet 3x3', 60000]
  ],
  'cat-sport': [
    ['Sepeda Gunung', 200000], ['Sepeda Lipat', 150000], ['Papan Seluncur', 70000],
    ['Treadmill Portable', 250000], ['Dumbbell Set 20kg', 50000], ['Sepeda Tandem', 300000], ['Stroller Jogging', 120000]
  ],
  'cat-marine': [
    ['Perahu Karet 2 Orang', 400000], ['Pompa Angin Listrik', 50000], ['Jaket Pelampung', 40000],
    ['Kayak 1 Orang', 300000], ['Snorkeling Set', 80000], ['Paddle Board', 250000], ['GPS Garmin Laut', 200000]
  ],
  'cat-drone': [
    ['DJI Mini 4 Pro', 400000], ['DJI Air 3', 600000], ['DJI Mavic 3', 750000],
    ['DJI Mini 3', 350000], ['DJI Avata FPV', 650000], ['Autel Evo Lite', 550000], ['Folding Drone 4K', 250000]
  ],
  'cat-projector': [
    ['Proyektor Epson EB-X06', 250000], ['Proyektor BenQ MH560', 350000], ['Layar Proyektor 100"', 150000],
    ['Proyektor Oculus Mini', 200000], ['Proyektor 4K NEC', 450000], ['Layar Tripod 80"', 100000], ['Mini Proyektor 3000Lm', 180000]
  ],
  'cat-event': [
    ['Tenda Roder 4x6', 400000], ['Kursi Banquet (10)', 100000], ['Meja Bulat 8 Orang', 120000],
    ['Panggung 4x6', 500000], ['Sound System Event', 600000], ['Carpet Merah 20m', 150000], ['Karpet Indoor', 200000]
  ]
};

/* Generate 100 items deterministically */
const items = [];
let itemIdx = 1;
for (const cat of KATEGORI) {
  const pool = ITEM_POOL[cat.id] || [];
  const count = Math.min(pool.length, Math.ceil(100 / KATEGORI.length) + (cat.id === 'cat-car' ? 2 : cat.id === 'cat-bike' ? 1 : 0));
  const chosen = pool.slice(0, count);
  for (const [name, basePrice] of chosen) {
    const kondisi = pick(['Baik', 'Sangat Baik', 'Baru', 'Baik', 'Prima']);
    items.push({
      id: 'ITM-' + String(itemIdx).padStart(3, '0'),
      name,
      categoryId: cat.id,
      pricePerDay: basePrice,
      deposit: Math.round(basePrice * (2 + rng() * 3)),
      stock: rint(1, 4),
      kondisi,
      lokasi: pick(['Gudang A', 'Gudang B', 'Cabang Utara', 'Cabang Selatan', 'Ruang Display']),
      status: 'available', // akan diset ulang berdasarkan rental aktif di database.js
      rate: Math.round((3 + rng() * 2) * 10) / 10,
      timesRented: rint(5, 120),
      createdAt: mockDate(rint(30, 200), rint(8, 17), rint(0, 59))
    });
    itemIdx++;
  }
}

/* ============================================================
   CUSTOMER (80)
   ============================================================ */
const firstNames = ['Budi', 'Siti', 'Agus', 'Dewi', 'Rudi', 'Maya', 'Andi', 'Rina', 'Joko', 'Sri', 'Eko', 'Lina', 'Hendra', 'Fitri', 'Bayu', 'Nina', 'Dedi', 'Putri', 'Yoga', 'Ayu', 'Fajar', 'Rani', 'Dika', 'Sari', 'Rizal', 'Mega', 'Wawan', 'Intan', 'Gita', 'Adit', 'Tika', 'Rama', 'Vina', 'Dimas', 'Salsa', 'Rino', 'Kiki', 'Sinta', 'Bagus', 'Laila'];
const lastNames = ['Santoso', 'Wijaya', 'Pratama', 'Handayani', 'Saputra', 'Lestari', 'Hidayat', 'Nugroho', 'Anggraini', 'Firmansyah', 'Kusuma', 'Rahayu', 'Setiawan', 'Melati', 'Utami', 'Purnama', 'Hartono', 'Permata', 'Yulianto', 'Maulana', 'Suryani', 'Ramadhan', 'Azzahra', 'Wulandari', 'Rahmawati', 'Putra', 'Cahyani', 'Siregar', 'Nasution', 'Halim'];
const jenisCustomer = ['Perorangan', 'Perusahaan', 'Produksi', 'Komunitas', 'Event Organizer'];

const customers = [];
for (let i = 1; i <= 80; i++) {
  const fn = firstNames[Math.floor(rng() * firstNames.length)];
  const ln = lastNames[Math.floor(rng() * lastNames.length)];
  customers.push({
    id: 'CST-' + String(i).padStart(3, '0'),
    name: fn + ' ' + ln,
    phone: '08' + String(1000000000 + Math.floor(rng() * 8999999999)),
    email: fn.toLowerCase() + '.' + ln.toLowerCase() + '@email.com',
    jenis: pick(jenisCustomer),
    address: pick(['Jl. Melati No.' + i, 'Jl. Anggrek No.' + i, 'Jl. Kenanga No.' + (i * 2), 'Jl. Flamboyan No.' + i, 'Jl. Mawar No.' + (i + 3)]),
    totalRental: 0,
    totalSpent: 0,
    joined: mockDateKey(rint(30, 400)),
    active: rng() > 0.12
  });
}

/* ============================================================
   RENTAL (300) + RETURN (150)
   ============================================================ */
const rentals = [];
const returns = [];
const paymentMethod = ['Transfer', 'QRIS', 'Cash', 'E-Wallet'];
const notes = ['Tepat waktu dan bersih', 'Barang dikembalikan dalam kondisi baik', 'Kecil lecet di body, sudah dinota', 'Telat 1 hari, kena denda', 'Barang seperti baru', 'Perlu perawatan setelah pemakaian'];

for (let i = 1; i <= 300; i++) {
  const item = items[Math.floor(rng() * items.length)];
  const cust = customers[Math.floor(rng() * customers.length)];
  const duration = rint(1, 7);
  const startOffset = rint(0, 45);
  const startDate = mockDateKey(startOffset);
  const endDate = mockDateKey(startOffset - duration);
  const totalDays = daysBetween(startDate, endDate) || duration;
  const pricePerDay = item.pricePerDay;
  const subtotal = pricePerDay * totalDays;
  const deposit = item.deposit;
  const lateDays = rng() < 0.15 ? rint(1, 3) : 0;
  const denda = lateDays * Math.round(pricePerDay * 0.1);
  const total = subtotal + denda;
  const statusRoll = rng();

  let status;
  if (startOffset === 0 && statusRoll < 0.55) status = 'rented';
  else if (statusRoll < 0.70) status = 'rented';
  else if (statusRoll < 0.80) status = 'overdue';
  else if (statusRoll < 0.92) status = 'returned';
  else status = 'rented';

  const rental = {
    id: 'RNT-' + String(1000 + i),
    itemId: item.id,
    itemName: item.name,
    categoryId: item.categoryId,
    customerId: cust.id,
    customerName: cust.name,
    startDate,
    endDate,
    duration: totalDays,
    pricePerDay,
    subtotal,
    deposit,
    lateDays,
    denda,
    total,
    status,
    payment: pick(paymentMethod),
    paid: status !== 'rented' || rng() > 0.3,
    note: 'Rental ' + item.name + ' selama ' + totalDays + ' hari',
    createdAt: mockDate(startOffset, rint(8, 17), rint(0, 59))
  };
  rentals.push(rental);

  cust.totalRental += 1;
  cust.totalSpent += total;

  /* Return record untuk rental yang sudah selesai */
  if (status === 'returned') {
    const returnedOffset = startOffset - duration;
    const damage = rng() < 0.18;
    returns.push({
      id: 'RET-' + String(1000 + returns.length + 1),
      rentalId: rental.id,
      itemId: item.id,
      customerId: cust.id,
      returnedDate: mockDateKey(Math.max(0, returnedOffset)),
      condition: damage ? pick(['Perlu perawatan', 'Ada kerusakan ringan', 'Kotor parah']) : 'Baik',
      lateDays: rental.lateDays,
      denda: rental.denda,
      depositReturned: damage ? Math.round(deposit * (rng() < 0.3 ? 0.5 : 0.8)) : deposit,
      note: damage ? pick(['Ada goresan, dikenakan biaya perbaikan', 'Barang kotor, dikenakan cuci', 'Payung patah, potong deposit']) : pick(notes),
      createdAt: mockDate(Math.max(0, returnedOffset), rint(9, 18), rint(0, 59))
    });
  }
}

/* ============================================================
   Ekspor payload (digunakan database.js sebagai seed)
   ============================================================ */
const SEED_PAYLOAD = {
  kategoris: KATEGORI,
  items,
  customers,
  rentals,
  returns
};