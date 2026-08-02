/* ============================================
   StockPilot — Mock Data Generator
   Deterministic generation: 100 products, 20 categories,
   15 brands, 10 units, 30 suppliers, 50 customers,
   300 inventory transactions, 100 purchase orders
   ============================================ */

function mulberry32(seed) {
  let a = seed;
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function buildMockData() {
  const rnd = mulberry32(20260214);
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const ri = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
  const daysAgo = n => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };
  const pad = (n, l = 3) => String(n).padStart(l, '0');

  // Categories (expand to 20)
  const cats = [];
  for (let i = 0; i < 20; i++) {
    cats.push(SEED.categories[i % SEED.categories.length] + (i >= SEED.categories.length ? ' ' + (Math.floor(i / SEED.categories.length) + 1) : ''));
  }
  const categories = cats.map((name, i) => ({
    id: 'CAT-' + pad(i + 1),
    name,
    description: 'Kategori ' + name,
    productCount: 0
  }));

  // Brands (visible 15)
  const brands = SEED.brands.slice(0, 15).map((name, i) => ({
    id: 'BRD-' + pad(i + 1),
    name,
    origin: pick(['Indonesia', 'China', 'Korea Selatan', 'Jepang', 'USA', 'Eropa', 'Swiss', 'Belanda'])
  }));

  // Units (10)
  const units = SEED.units.map((name, i) => ({
    id: 'UNT-' + pad(i + 1),
    name,
    symbol: name.toLowerCase().slice(0, 3)
  }));

  // Suppliers (30)
  const suppliers = [];
  const cityNames = ['Jakarta', 'Bekasi', 'Depok', 'Tangerang', 'Bogor', 'Bandung', 'Semarang', 'Surabaya', 'Medan', 'Makassar'];
  for (let i = 0; i < 30; i++) {
    suppliers.push({
      id: 'SUP-' + pad(i + 1),
      name: pick(['PT', 'CV', 'UD', 'Toko']) + ' ' + pick(SEED.productNouns) + ' ' + pick(SEED.brands),
      city: pick(cityNames),
      phone: '08' + ri(100000000, 999999999),
      status: rnd() > .15 ? 'active' : 'inactive',
      contact: 'Kontak ' + (i + 1)
    });
  }

  // Customers (50)
  const customers = [];
  const firstNames = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hendra', 'Indah', 'Joko', 'Kartika', 'Lukman', 'Maya', 'Nanda', 'Oscar', 'Putri', 'Rizki', 'Sari', 'Tommy', 'Umar'];
  for (let i = 0; i < 50; i++) {
    customers.push({
      id: 'CUS-' + pad(i + 1),
      name: pick(firstNames) + ' ' + pick(firstNames) + ' ' + (i + 1),
      phone: '08' + ri(100000000, 999999999),
      city: pick(cityNames),
      status: rnd() > .15 ? 'active' : 'inactive'
    });
  }

  // Products (100)
  const products = [];
  const locations = ['A1','A2','A3','B1','B2','C1','C2','D1','D2','E1','E2','F1','F2','G1'];
  for (let i = 0; i < 100; i++) {
    const cat = pick(categories);
    const brand = pick(brands);
    const unit = pick(units);
    const cost = ri(15000, 2500000);
    const price = Math.round(cost * (1.2 + rnd() * .4));
    const minStock = ri(5, 20);
    const maxStock = minStock + ri(30, 120);
    let stock;
    const roll = rnd();
    if (roll < .1) stock = 0;
    else if (roll < .35) stock = ri(0, minStock);
    else stock = ri(minStock + 1, maxStock);
    products.push({
      id: 'PRD-' + pad(i + 1, 3),
      sku: 'SKU-' + String(1000 + i),
      name: pick(SEED.productAdjectives) + ' ' + pick(SEED.productNouns) + ' ' + brand.name,
      categoryId: cat.id,
      category: cat.name,
      brandId: brand.id,
      brand: brand.name,
      unitId: unit.id,
      unit: unit.name,
      location: pick(locations),
      stock,
      minStock,
      maxStock,
      cost,
      price,
      status: rnd() > .1 ? 'active' : 'inactive'
    });
  }
  categories.forEach(c => { c.productCount = products.filter(p => p.categoryId === c.id).length; });

  // Inventory transactions (300)
  const transactions = [];
  const txTypes = ['in', 'out', 'adjustment'];
  for (let i = 0; i < 300; i++) {
    const p = pick(products);
    const type = pick(txTypes);
    const qty = type === 'adjustment' ? ri(-10, 10) : ri(1, 30);
    transactions.push({
      id: 'TRX-' + pad(i + 1),
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      type,
      qty,
      reason: type === 'in' ? 'Pembelian' : type === 'out' ? 'Penjualan / Pemakaian' : 'Penyesuaian stok',
      refType: type === 'in' ? 'PO' : type === 'out' ? 'SO' : 'ADJ',
      refId: type === 'in' ? 'PO-' + pad(ri(1, 100)) : type === 'out' ? 'SO-' + pad(ri(1, 200)) : 'ADJ-' + pad(ri(1, 50)),
      createdAt: daysAgo(ri(0, 89)),
      user: pick(['Admin', 'Warehouse Staff', 'Owner', 'Supervisor'])
    });
  }
  transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Purchase Orders (100)
  const pos = [];
  const poStatuses = ['draft', 'approved', 'received', 'cancelled'];
  for (let i = 0; i < 100; i++) {
    const sup = pick(suppliers);
    pos.push({
      id: 'PO-' + pad(i + 1),
      number: 'PO-' + pad(i + 1),
      supplierId: sup.id,
      supplierName: sup.name,
      itemCount: ri(1, 6),
      total: ri(500000, 30000000),
      status: pick(poStatuses),
      createdAt: daysAgo(ri(0, 60)),
      paid: rnd() > .4
    });
  }
  pos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Users & roles
  const users = [
    { id: 'USR-001', name: 'Admin Utama', email: 'admin@stockpilot.id', role: 'Owner', initials: 'AP', status: 'active' },
    { id: 'USR-002', name: 'Warehouse Staff', email: 'warehouse@stockpilot.id', role: 'Warehouse', initials: 'WS', status: 'active' },
    { id: 'USR-003', name: 'Supervisor', email: 'supervisor@stockpilot.id', role: 'Supervisor', initials: 'SV', status: 'active' }
  ];
  const roles = [
    { id: 'ROL-001', name: 'Owner', desc: 'Akses penuh ke seluruh sistem', level: 3 },
    { id: 'ROL-002', name: 'Supervisor', desc: 'Kelola stok, PO, dan laporan', level: 2 },
    { id: 'ROL-003', name: 'Warehouse', desc: 'Kelola stok in/out & audit', level: 1 }
  ];

  // Settings
  const settings = {
    companyName: 'StockPilot Indonesia',
    currency: 'IDR',
    lowStockThreshold: 10,
    autoBackup: true,
    notificationsEnabled: true,
    timezone: 'Asia/Jakarta'
  };

  // Notifications
  const notifications = [
    { id: 'NTF-001', icon: '⚠️', type: 'warning', title: 'Stok Menipis', message: 'Beberapa produk di bawah stok minimum.', read: false, createdAt: daysAgo(0) },
    { id: 'NTF-002', icon: '📥', type: 'info', title: 'PO Baru', message: 'Purchase order baru menunggu approval.', read: false, createdAt: daysAgo(0) },
    { id: 'NTF-003', icon: '📦', type: 'success', title: 'Barang Diterima', message: 'Goods receiving berhasil dicatat.', read: false, createdAt: daysAgo(0) },
    { id: 'NTF-004', icon: '✅', type: 'success', title: 'Audit Selesai', message: 'Inventory audit periodik selesai.', read: true, createdAt: daysAgo(1) }
  ];

  // Activity logs
  const activityLogs = [
    { id: 'LOG-001', user: 'Admin Utama', action: 'create', entity: 'product', detail: 'Menambahkan produk baru', timestamp: daysAgo(0) },
    { id: 'LOG-002', user: 'Warehouse Staff', action: 'stock_in', entity: 'inventory', detail: 'Stok masuk 25 unit', timestamp: daysAgo(0) },
    { id: 'LOG-003', user: 'Supervisor', action: 'approve', entity: 'purchase', detail: 'Menyetujui PO-015', timestamp: daysAgo(1) },
    { id: 'LOG-004', user: 'Admin Utama', action: 'update', entity: 'settings', detail: 'Memperbarui pengaturan sistem', timestamp: daysAgo(2) },
    { id: 'LOG-005', user: 'Warehouse Staff', action: 'stock_out', entity: 'inventory', detail: 'Stok keluar 10 unit', timestamp: daysAgo(2) }
  ];

  return {
    categories, brands, units, suppliers, customers, products,
    transactions, pos,
    users, roles, notifications, activityLogs, settings,
    meta: { version: '1.0.0', dbName: 'stockpilot-standard', seededAt: new Date().toISOString() }
  };
}