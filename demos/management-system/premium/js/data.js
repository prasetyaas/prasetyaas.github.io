/* ============================================
   NexaWMS Pro — Data Layer & Seed Data
   localStorage-backed demo database
   ============================================ */

const DB_KEY = 'nexawms_data_v2';

const DB = {

  /* ---------- Core ---------- */
  all() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
  },

  get(collection) {
    const db = this.all();
    return db ? (db[collection] || []) : [];
  },

  set(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  save(collection, items) {
    const db = this.all() || {};
    db[collection] = items;
    this.set(db);
  },

  add(collection, item) {
    const items = this.get(collection);
    items.push(item);
    this.save(collection, items);
    return item;
  },

  update(collection, id, patch) {
    const items = this.get(collection);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...patch };
    this.save(collection, items);
    return items[idx];
  },

  remove(collection, id) {
    const items = this.get(collection).filter(i => i.id !== id);
    this.save(collection, items);
  },

  find(collection, id) {
    return this.get(collection).find(i => i.id === id) || null;
  },

  /* ---------- Helpers ---------- */
  genId(prefix) {
    const n = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}${n}`;
  },

  genSeq(prefix) {
    const n = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${String(n)}`;
  },

  now() {
    return new Date().toISOString();
  },

  daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  },

  daysAhead(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString();
  },

  fmtDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  fmtDateTime(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' +
           d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  },

  fmtMoney(n) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
  },

  fmtNum(n) {
    return new Intl.NumberFormat('id-ID').format(n || 0);
  },

  /* ---------- Lookups ---------- */
  product(id) { return this.find('products', id); },
  supplier(id) { return this.find('suppliers', id); },
  customer(id) { return this.find('customers', id); },
  category(id) { return this.find('categories', id); },
  brand(id) { return this.find('brands', id); },
  unit(id) { return this.find('units', id); },
  warehouse(id) { return this.find('warehouses', id); },
  location(id) { return this.find('locations', id); },
  rack(id) { return this.find('racks', id); },
  zone(id) { return this.find('zones', id); },
  user(id) { return this.find('users', id); },
  role(id) { return this.find('roles', id); },

  productName(id) { const p = this.product(id); return p ? p.name : '-'; },
  productSku(id) { const p = this.product(id); return p ? p.sku : '-'; },

  categoryName(id) { const c = this.category(id); return c ? c.name : '-'; },
  brandName(id) { const b = this.brand(id); return b ? b.name : '-'; },
  unitName(id) { const u = this.unit(id); return u ? u.name : '-'; },
  supplierName(id) { const s = this.supplier(id); return s ? s.name : '-'; },
  customerName(id) { const c = this.customer(id); return c ? c.name : '-'; },
  warehouseName(id) { const w = this.warehouse(id); return w ? w.name : '-'; },
  userName(id) { const u = this.user(id); return u ? u.name : '-'; },

  invValue() {
    return this.get('products').reduce((sum, p) => sum + (p.onHand * p.cost), 0);
  },

  totalUnits() {
    return this.get('products').reduce((sum, p) => sum + p.onHand, 0);
  },

  lowStockCount() {
    return this.get('products').filter(p => p.onHand <= p.reorderPoint).length;
  },

  outOfStockCount() {
    return this.get('products').filter(p => p.onHand === 0).length;
  },

  /* ---------- Audit helper ---------- */
  audit(action, entity, entityId, detail, user = 'Admin') {
    this.add('auditLogs', {
      id: this.genId('AUD'),
      action, entity, entityId,
      detail: detail || '',
      user, userName: this.userName(user) || user,
      timestamp: this.now(),
      ip: `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
    });
  },

  /* ---------- Notification helper ---------- */
  notify(title, message, type = 'info', icon = '📢') {
    this.add('notifications', {
      id: this.genId('NTF'),
      title, message, type, icon,
      read: false,
      createdAt: this.now()
    });
  },

  /* ---------- Init / Reset ---------- */
  reset() {
    localStorage.removeItem(DB_KEY);
    this.seed();
    return true;
  },

  isSeeded() {
    return !!this.all();
  },

  seed() {
    const db = buildSeed();
    this.set(db);
  },

  ensure() {
    if (!this.isSeeded()) this.seed();
  },

  exportJSON() {
    return JSON.stringify(this.all(), null, 2);
  },

  importJSON(text) {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') throw new Error('Format tidak valid');
    if (!Array.isArray(data.products)) throw new Error('Data bukan backup NexaWMS');
    this.set(data);
    return true;
  }
};

/* ============================================
   SEED DATA
   ============================================ */
function buildSeed() {

  // ---------- Categories ----------
  const categories = [
    { id: 'CAT-ELC', name: 'Elektronik', icon: '💻', description: 'Perangkat elektronik & gadget' },
    { id: 'CAT-FBT', name: 'Perabotan', icon: '🛋️', description: 'Furniture & perabotan rumah' },
    { id: 'CAT-FNB', name: 'F&B', icon: '🍫', description: 'Makanan & minuman kemasan' },
    { id: 'CAT-HNG', name: 'Home & Garden', icon: '🏡', description: 'Perlengkapan rumah & taman' },
    { id: 'CAT-BPR', name: 'Perkakas', icon: '🔧', description: 'Tools & perkakas kerja' },
    { id: 'CAT-ATK', name: 'ATK', icon: '📎', description: 'Alat tulis & kantor' }
  ];

  // ---------- Brands ----------
  const brands = [
    { id: 'BRD-LEN', name: 'Lenovo', origin: 'China' },
    { id: 'BRD-SSS', name: 'Samsung', origin: 'Korea Selatan' },
    { id: 'BRD-LGZ', name: 'Logitech', origin: 'Swiss' },
    { id: 'BRD-PHM', name: 'Philips', origin: 'Belanda' },
    { id: 'BRD-AQU', name: 'Aqua', origin: 'Indonesia' },
    { id: 'BRD-MLY', name: 'Miyako', origin: 'Indonesia' },
    { id: 'BRD-ION', name: 'IKEA', origin: 'Swedia' },
    { id: 'BRD-KRH', name: 'Krisbow', origin: 'Indonesia' },
    { id: 'BRD-STB', name: 'Stanley', origin: 'USA' },
    { id: 'BRD-SND', name: 'Sinar Dunia', origin: 'Indonesia' },
    { id: 'BRD-KRN', name: 'Kirin', origin: 'Jepang' },
    { id: 'BRD-IND', name: 'Indofood', origin: 'Indonesia' },
    { id: 'BRD-HPP', name: 'Happy', origin: 'Indonesia' },
    { id: 'BRD-MTL', name: 'Mitra 10', origin: 'Indonesia' }
  ];

  // ---------- Units ----------
  const units = [
    { id: 'UNT-PCS', name: 'Pcs', symbol: 'pcs' },
    { id: 'UNT-BOX', name: 'Box', symbol: 'box' },
    { id: 'UNT-CRT', name: 'Carton', symbol: 'ctn' },
    { id: 'UNT-PAK', name: 'Pak', symbol: 'pak' },
    { id: 'UNT-SET', name: 'Set', symbol: 'set' },
    { id: 'UNT-DUS', name: 'Dus', symbol: 'dus' },
    { id: 'UNT-BTL', name: 'Botol', symbol: 'btl' },
    { id: 'UNT-ROLL', name: 'Roll', symbol: 'roll' },
    { id: 'UNT-RIM', name: 'Rim', symbol: 'rim' },
    { id: 'UNT-LT', name: 'Liter', symbol: 'L' }
  ];

  // ---------- Products (24) ----------
  const products = [
    { id: 'PRD-001', sku: 'ELC-LNV-001', name: 'Lenovo ThinkPad E14 Gen 5', categoryId: 'CAT-ELC', brandId: 'BRD-LEN', unitId: 'UNT-PCS', cost: 12500000, price: 14999000, onHand: 36, reorderPoint: 15, locationId: 'LOC-A01', rackId: 'RCK-A1', status: 'active', weight: 1.7, minStock: 15, maxStock: 120 },
    { id: 'PRD-002', sku: 'ELC-SAM-002', name: 'Samsung 27" Monitor M7', categoryId: 'CAT-ELC', brandId: 'BRD-SSS', unitId: 'UNT-PCS', cost: 3800000, price: 4599000, onHand: 42, reorderPoint: 20, locationId: 'LOC-A02', rackId: 'RCK-A2', status: 'active', weight: 5.2, minStock: 20, maxStock: 80 },
    { id: 'PRD-003', sku: 'ELC-SAM-003', name: 'Samsung Wireless Charger Duo', categoryId: 'CAT-ELC', brandId: 'BRD-SSS', unitId: 'UNT-PCS', cost: 520000, price: 749000, onHand: 210, reorderPoint: 50, locationId: 'LOC-A03', rackId: 'RCK-A3', status: 'active', weight: 0.2, minStock: 50, maxStock: 600 },
    { id: 'PRD-004', sku: 'ELC-LGZ-004', name: 'Logitech MX Master 3S', categoryId: 'CAT-ELC', brandId: 'BRD-LGZ', unitId: 'UNT-PCS', cost: 1150000, price: 1599000, onHand: 8, reorderPoint: 25, locationId: 'LOC-A04', rackId: 'RCK-A4', status: 'active', weight: 0.14, minStock: 25, maxStock: 150 },
    { id: 'PRD-005', sku: 'ELC-PHM-005', name: 'Philips Air Fryer HD9252', categoryId: 'CAT-ELC', brandId: 'BRD-PHM', unitId: 'UNT-PCS', cost: 1250000, price: 1799000, onHand: 64, reorderPoint: 20, locationId: 'LOC-A05', rackId: 'RCK-A5', status: 'active', weight: 4.8, minStock: 20, maxStock: 100 },
    { id: 'PRD-006', sku: 'FNB-KRN-006', name: 'Kirin Lemon Tea 350ml', categoryId: 'CAT-FNB', brandId: 'BRD-KRN', unitId: 'UNT-DUS', cost: 72000, price: 96000, onHand: 480, reorderPoint: 120, locationId: 'LOC-B01', rackId: 'RCK-B1', status: 'active', weight: 8.4, minStock: 120, maxStock: 1500 },
    { id: 'PRD-007', sku: 'FNB-IND-007', name: 'Indomie Goreng 40x68g', categoryId: 'CAT-FNB', brandId: 'BRD-IND', unitId: 'UNT-DUS', cost: 112000, price: 145000, onHand: 320, reorderPoint: 90, locationId: 'LOC-B02', rackId: 'RCK-B2', status: 'active', weight: 10.2, minStock: 90, maxStock: 1200 },
    { id: 'PRD-008', sku: 'FNB-HPP-008', name: 'Happy Tos 24x180g', categoryId: 'CAT-FNB', brandId: 'BRD-HPP', unitId: 'UNT-DUS', cost: 198000, price: 248000, onHand: 0, reorderPoint: 40, locationId: 'LOC-B03', rackId: 'RCK-B3', status: 'active', weight: 9.6, minStock: 40, maxStock: 400 },
    { id: 'PRD-009', sku: 'FNB-IND-009', name: 'Indofood Kecap 60x135ml', categoryId: 'CAT-FNB', brandId: 'BRD-IND', unitId: 'UNT-DUS', cost: 246000, price: 320000, onHand: 95, reorderPoint: 30, locationId: 'LOC-B04', rackId: 'RCK-B4', status: 'active', weight: 11.4, minStock: 30, maxStock: 500 },
    { id: 'PRD-010', sku: 'FBT-ION-010', name: 'IKEA LACK Meja Kopi', categoryId: 'CAT-FBT', brandId: 'BRD-ION', unitId: 'UNT-PCS', cost: 320000, price: 499000, onHand: 28, reorderPoint: 10, locationId: 'LOC-C01', rackId: 'RCK-C1', status: 'active', weight: 6.1, minStock: 10, maxStock: 60 },
    { id: 'PRD-011', sku: 'FBT-ION-011', name: 'IKEA KALLAX Rak 4x2', categoryId: 'CAT-FBT', brandId: 'BRD-ION', unitId: 'UNT-PCS', cost: 780000, price: 1099000, onHand: 16, reorderPoint: 8, locationId: 'LOC-C02', rackId: 'RCK-C2', status: 'active', weight: 14.5, minStock: 8, maxStock: 40 },
    { id: 'PRD-012', sku: 'FBT-MTL-012', name: 'Mitra10 Meja Makan 4 Kursi', categoryId: 'CAT-FBT', brandId: 'BRD-MTL', unitId: 'UNT-SET', cost: 2100000, price: 2799000, onHand: 5, reorderPoint: 8, locationId: 'LOC-C03', rackId: 'RCK-C3', status: 'active', weight: 42, minStock: 8, maxStock: 20 },
    { id: 'PRD-013', sku: 'HNG-AQU-013', name: 'Aqua Galon 19L', categoryId: 'CAT-HNG', brandId: 'BRD-AQU', unitId: 'UNT-PCS', cost: 45000, price: 62000, onHand: 154, reorderPoint: 50, locationId: 'LOC-D01', rackId: 'RCK-D1', status: 'active', weight: 19, minStock: 50, maxStock: 400 },
    { id: 'PRD-014', sku: 'HNG-MLY-014', name: 'Miyako Blender BL-151', categoryId: 'CAT-HNG', brandId: 'BRD-MLY', unitId: 'UNT-PCS', cost: 265000, price: 389000, onHand: 72, reorderPoint: 20, locationId: 'LOC-D02', rackId: 'RCK-D2', status: 'active', weight: 2.2, minStock: 20, maxStock: 150 },
    { id: 'PRD-015', sku: 'HNG-PHM-015', name: 'Philips Lampu RGB 9W', categoryId: 'CAT-HNG', brandId: 'BRD-PHM', unitId: 'UNT-BOX', cost: 96000, price: 149000, onHand: 0, reorderPoint: 40, locationId: 'LOC-D03', rackId: 'RCK-D3', status: 'inactive', weight: 0.9, minStock: 40, maxStock: 400 },
    { id: 'PRD-016', sku: 'BPR-KRH-016', name: 'Krisbow Mesin Bor 13mm', categoryId: 'CAT-BPR', brandId: 'BRD-KRH', unitId: 'UNT-PCS', cost: 480000, price: 649000, onHand: 44, reorderPoint: 15, locationId: 'LOC-E01', rackId: 'RCK-E1', status: 'active', weight: 3.1, minStock: 15, maxStock: 80 },
    { id: 'PRD-017', sku: 'BPR-STB-017', name: 'Stanley Tool Set 46pcs', categoryId: 'CAT-BPR', brandId: 'BRD-STB', unitId: 'UNT-SET', cost: 690000, price: 899000, onHand: 22, reorderPoint: 10, locationId: 'LOC-E02', rackId: 'RCK-E2', status: 'active', weight: 5.8, minStock: 10, maxStock: 60 },
    { id: 'PRD-018', sku: 'BPR-SND-018', name: 'Sinar Dunia Kabel 100m', categoryId: 'CAT-BPR', brandId: 'BRD-SND', unitId: 'UNT-ROLL', cost: 165000, price: 225000, onHand: 38, reorderPoint: 15, locationId: 'LOC-E03', rackId: 'RCK-E3', status: 'active', weight: 4.2, minStock: 15, maxStock: 120 },
    { id: 'PRD-019', sku: 'ATK-SND-019', name: 'Sinar Dunia HVS A4 80gsm', categoryId: 'CAT-ATK', brandId: 'BRD-SND', unitId: 'UNT-RIM', cost: 48000, price: 65000, onHand: 640, reorderPoint: 150, locationId: 'LOC-F01', rackId: 'RCK-F1', status: 'active', weight: 2.5, minStock: 150, maxStock: 2000 },
    { id: 'PRD-020', sku: 'ATK-SND-020', name: 'Sinar Dunia Pulpen 50pcs', categoryId: 'CAT-ATK', brandId: 'BRD-SND', unitId: 'UNT-PAK', cost: 145000, price: 199000, onHand: 120, reorderPoint: 40, locationId: 'LOC-F02', rackId: 'RCK-F2', status: 'active', weight: 1.2, minStock: 40, maxStock: 500 },
    { id: 'PRD-021', sku: 'ATK-KRH-021', name: 'Krisbow Binder Clip 200pcs', categoryId: 'CAT-ATK', brandId: 'BRD-KRH', unitId: 'UNT-BOX', cost: 38000, price: 55000, onHand: 265, reorderPoint: 80, locationId: 'LOC-F03', rackId: 'RCK-F3', status: 'active', weight: 0.8, minStock: 80, maxStock: 800 },
    { id: 'PRD-022', sku: 'ELC-LGZ-022', name: 'Logitech K380 Keyboard', categoryId: 'CAT-ELC', brandId: 'BRD-LGZ', unitId: 'UNT-PCS', cost: 480000, price: 645000, onHand: 58, reorderPoint: 20, locationId: 'LOC-A06', rackId: 'RCK-A6', status: 'active', weight: 0.42, minStock: 20, maxStock: 120 },
    { id: 'PRD-023', sku: 'ELC-PHM-023', name: 'Philips Kettle 1.5L', categoryId: 'CAT-ELC', brandId: 'BRD-PHM', unitId: 'UNT-PCS', cost: 320000, price: 449000, onHand: 88, reorderPoint: 25, locationId: 'LOC-A07', rackId: 'RCK-A7', status: 'active', weight: 1.1, minStock: 25, maxStock: 200 },
    { id: 'PRD-024', sku: 'HNG-MLY-024', name: 'Miyako Rice Cooker 1.8L', categoryId: 'CAT-HNG', brandId: 'BRD-MLY', unitId: 'UNT-PCS', cost: 380000, price: 525000, onHand: 20, reorderPoint: 35, locationId: 'LOC-D04', rackId: 'RCK-D4', status: 'active', weight: 2.8, minStock: 35, maxStock: 150 }
  ];

  // ---------- Suppliers (8) ----------
  const suppliers = [
    { id: 'SUP-001', code: 'SUP', name: 'PT Teknologi Maju Bersama', contact: 'Budi Santoso', email: 'sales@tmb.co.id', phone: '021-5550-121', address: 'Jl. Gatot Subroto Kav 21, Jakarta Selatan', city: 'Jakarta', status: 'active', paymentTerms: 'Net 30', leadTime: 7, rating: 4.8, categories: ['Elektronik'] },
    { id: 'SUP-002', code: 'SUP', name: 'CV Sumber Pangan Sejahtera', contact: 'Siti Rahayu', email: 'order@spsejahtera.com', phone: '031-5550-098', address: 'Jl. HR Muhammad 44, Surabaya', city: 'Surabaya', status: 'active', paymentTerms: 'Net 14', leadTime: 4, rating: 4.6, categories: ['F&B'] },
    { id: 'SUP-003', code: 'SUP', name: 'PT Furnitur Cipta Kreasi', contact: 'Agus Wijaya', email: 'cs@fckreasi.co.id', phone: '022-5550-777', address: 'Jl. Soekarno Hatta 102, Bandung', city: 'Bandung', status: 'active', paymentTerms: 'Net 30', leadTime: 10, rating: 4.4, categories: ['Perabotan'] },
    { id: 'SUP-004', code: 'SUP', name: 'PT Mitra Alat Teknik', contact: 'Dewi Lestari', email: 'sales@mitraalat.com', phone: '021-5550-456', address: 'Jl. Raya Cakung Cilincing, Jakarta Timur', city: 'Jakarta', status: 'active', paymentTerms: 'Net 30', leadTime: 5, rating: 4.9, categories: ['Perkakas'] },
    { id: 'SUP-005', code: 'SUP', name: 'CV Kertas Prima Nusantara', contact: 'Rina Marlina', email: 'pesan@kertasprima.id', phone: '0271-5550-333', address: 'Jl. Rajawali 21, Solo', city: 'Solo', status: 'active', paymentTerms: 'Net 7', leadTime: 3, rating: 4.7, categories: ['ATK'] },
    { id: 'SUP-006', code: 'SUP', name: 'PT Distribusi Utama Elektronik', contact: 'Hendra Gunawan', email: 'sales@dielektronik.com', phone: '021-5550-999', address: 'Jl. Pangeran Jayakarta 88, Jakarta Utara', city: 'Jakarta', status: 'active', paymentTerms: 'Net 45', leadTime: 9, rating: 4.3, categories: ['Elektronik', 'Home & Garden'] },
    { id: 'SUP-007', code: 'SUP', name: 'PT Air Tirta Berkah', contact: 'Yuni Astuti', email: 'kontak@airtirta.co.id', phone: '024-5550-211', address: 'Jl. Pandanaran 55, Semarang', city: 'Semarang', status: 'active', paymentTerms: 'COD', leadTime: 2, rating: 4.5, categories: ['Home & Garden'] },
    { id: 'SUP-008', code: 'SUP', name: 'CV Inovasi Rumah Tangga', contact: 'Fajar Nugroho', email: 'halo@inovasiirt.com', phone: '021-5550-654', address: 'Jl. Kelapa Gading Boulevard, Jakarta Utara', city: 'Jakarta', status: 'inactive', paymentTerms: 'Net 30', leadTime: 6, rating: 4.2, categories: ['Home & Garden', 'Elektronik'] }
  ];

  // ---------- Customers (6) ----------
  const customers = [
    { id: 'CUS-001', code: 'CUS', name: 'PT Retail Modern Indonesia', contact: 'Andi Pratama', email: 'procurement@rmi.co.id', phone: '021-5550-101', address: 'Jl. MH Thamrin 9, Jakarta Pusat', city: 'Jakarta', status: 'active', type: 'Retail Chain', creditLimit: 250000000, outstanding: 78400000 },
    { id: 'CUS-002', code: 'CUS', name: 'CV Toko Bangunan Berkah', contact: 'Slamet Riyadi', email: 'tokoberkah@gmail.com', phone: '024-5550-222', address: 'Jl. Pemuda 17, Semarang', city: 'Semarang', status: 'active', type: 'Toko', creditLimit: 50000000, outstanding: 12300000 },
    { id: 'CUS-003', code: 'CUS', name: 'PT E-Commerce Cepat', contact: 'Maya Dewi', email: 'supplier@ecepat.id', phone: '021-5550-303', address: 'Jl. TB Simatupang 5, Jakarta Selatan', city: 'Jakarta', status: 'active', type: 'Marketplace', creditLimit: 500000000, outstanding: 0 },
    { id: 'CUS-004', code: 'CUS', name: 'Koperasi Karyawan Sejahtera', contact: 'Joko Susilo', email: 'koperasi.sejahtera@kks.co.id', phone: '031-5550-404', address: 'Jl. Darmo 12, Surabaya', city: 'Surabaya', status: 'active', type: 'Koperasi', creditLimit: 75000000, outstanding: 25000000 },
    { id: 'CUS-005', code: 'CUS', name: 'PT Hotel Grand Nusantara', contact: 'Ratna Sari', email: 'purchasing@grandnusa.com', phone: '0361-5550-505', address: 'Jl. Raya Kuta 88, Bali', city: 'Denpasar', status: 'active', type: 'Hospitality', creditLimit: 120000000, outstanding: 43500000 },
    { id: 'CUS-006', code: 'CUS', name: 'Toko Sumber Jaya', contact: 'Hasan Basri', email: 'sumberjaya@yahoo.com', phone: '061-5550-606', address: 'Jl. Veteran 31, Medan', city: 'Medan', status: 'inactive', type: 'Toko', creditLimit: 30000000, outstanding: 8000000 }
  ];

  // ---------- Warehouses (3) ----------
  const warehouses = [
    { id: 'WH-CTG', code: 'WH-01', name: 'Gudang Pusat Cikarang', address: 'Kawasan EJIP Lot 8, Cikarang Selatan', city: 'Cikarang', area: 12500, capacity: 4800, used: 3265, temperature: 'Ambient 25°C', manager: 'Rudi Hartono', phone: '021-5551-001', status: 'active', type: 'Distribution Center', zoning: ['A', 'B', 'C', 'D', 'E', 'F'] },
    { id: 'WH-JKT', code: 'WH-02', name: 'Gudang Transit Jakarta', address: 'Jl. Raya Cakung Cilincing Km 2', city: 'Jakarta Timur', area: 4200, capacity: 1600, used: 1180, temperature: 'Ambient 26°C', manager: 'Lina Marlina', phone: '021-5551-002', status: 'active', type: 'Transit Hub', zoning: ['T1', 'T2'] },
    { id: 'WH-SBY', code: 'WH-03', name: 'Gudang Cabang Surabaya', address: 'Jl. Raya Margomulyo Indah 15', city: 'Surabaya', area: 6800, capacity: 2500, used: 940, temperature: 'Ambient 27°C', manager: 'Bambang Purnomo', phone: '031-5551-003', status: 'active', type: 'Regional DC', zoning: ['S1', 'S2'] }
  ];

  // ---------- Zones ----------
  const zones = [
    { id: 'ZNE-A', warehouseId: 'WH-CTG', name: 'Zone A — Elektronik', code: 'A', type: 'storage', capacity: 800, used: 612 },
    { id: 'ZNE-B', warehouseId: 'WH-CTG', name: 'Zone B — F&B & Konsumsi', code: 'B', type: 'storage', capacity: 950, used: 762 },
    { id: 'ZNE-C', warehouseId: 'WH-CTG', name: 'Zone C — Perabotan', code: 'C', type: 'storage', capacity: 700, used: 488 },
    { id: 'ZNE-D', warehouseId: 'WH-CTG', name: 'Zone D — Houseware', code: 'D', type: 'storage', capacity: 850, used: 652 },
    { id: 'ZNE-E', warehouseId: 'WH-CTG', name: 'Zone E — Perkakas', code: 'E', type: 'storage', capacity: 650, used: 391 },
    { id: 'ZNE-F', warehouseId: 'WH-CTG', name: 'Zone F — Stationery', code: 'F', type: 'storage', capacity: 850, used: 360 },
    { id: 'ZNE-T1', warehouseId: 'WH-JKT', name: 'Zone T1 — Transit Area', code: 'T1', type: 'transit', capacity: 800, used: 504 },
    { id: 'ZNE-T2', warehouseId: 'WH-JKT', name: 'Zone T2 — Staging', code: 'T2', type: 'staging', capacity: 800, used: 676 },
    { id: 'ZNE-S1', warehouseId: 'WH-SBY', name: 'Zone S1 — Storage A', code: 'S1', type: 'storage', capacity: 1400, used: 501 },
    { id: 'ZNE-S2', warehouseId: 'WH-SBY', name: 'Zone S2 — Storage B', code: 'S2', type: 'storage', capacity: 1100, used: 439 }
  ];

  // ---------- Locations ----------
  const locations = [
    { id: 'LOC-A01', warehouseId: 'WH-CTG', zoneId: 'ZNE-A', code: 'A-01', type: 'rack', capacity: 120, used: 36, status: 'active' },
    { id: 'LOC-A02', warehouseId: 'WH-CTG', zoneId: 'ZNE-A', code: 'A-02', type: 'rack', capacity: 120, used: 42, status: 'active' },
    { id: 'LOC-A03', warehouseId: 'WH-CTG', zoneId: 'ZNE-A', code: 'A-03', type: 'rack', capacity: 300, used: 210, status: 'active' },
    { id: 'LOC-A04', warehouseId: 'WH-CTG', zoneId: 'ZNE-A', code: 'A-04', type: 'rack', capacity: 120, used: 120, status: 'active' },
    { id: 'LOC-A05', warehouseId: 'WH-CTG', zoneId: 'ZNE-A', code: 'A-05', type: 'rack', capacity: 120, used: 64, status: 'active' },
    { id: 'LOC-A06', warehouseId: 'WH-CTG', zoneId: 'ZNE-A', code: 'A-06', type: 'rack', capacity: 120, used: 58, status: 'active' },
    { id: 'LOC-A07', warehouseId: 'WH-CTG', zoneId: 'ZNE-A', code: 'A-07', type: 'rack', capacity: 120, used: 88, status: 'active' },
    { id: 'LOC-B01', warehouseId: 'WH-CTG', zoneId: 'ZNE-B', code: 'B-01', type: 'pallet', capacity: 500, used: 480, status: 'active' },
    { id: 'LOC-B02', warehouseId: 'WH-CTG', zoneId: 'ZNE-B', code: 'B-02', type: 'pallet', capacity: 400, used: 320, status: 'active' },
    { id: 'LOC-B03', warehouseId: 'WH-CTG', zoneId: 'ZNE-B', code: 'B-03', type: 'pallet', capacity: 300, used: 0, status: 'active' },
    { id: 'LOC-B04', warehouseId: 'WH-CTG', zoneId: 'ZNE-B', code: 'B-04', type: 'pallet', capacity: 300, used: 95, status: 'active' },
    { id: 'LOC-C01', warehouseId: 'WH-CTG', zoneId: 'ZNE-C', code: 'C-01', type: 'bulk', capacity: 80, used: 28, status: 'active' },
    { id: 'LOC-C02', warehouseId: 'WH-CTG', zoneId: 'ZNE-C', code: 'C-02', type: 'bulk', capacity: 60, used: 40, status: 'active' },
    { id: 'LOC-C03', warehouseId: 'WH-CTG', zoneId: 'ZNE-C', code: 'C-03', type: 'bulk', capacity: 40, used: 20, status: 'active' },
    { id: 'LOC-D01', warehouseId: 'WH-CTG', zoneId: 'ZNE-D', code: 'D-01', type: 'bulk', capacity: 300, used: 154, status: 'active' },
    { id: 'LOC-D02', warehouseId: 'WH-CTG', zoneId: 'ZNE-D', code: 'D-02', type: 'rack', capacity: 180, used: 72, status: 'active' },
    { id: 'LOC-D03', warehouseId: 'WH-CTG', zoneId: 'ZNE-D', code: 'D-03', type: 'rack', capacity: 250, used: 0, status: 'active' },
    { id: 'LOC-D04', warehouseId: 'WH-CTG', zoneId: 'ZNE-D', code: 'D-04', type: 'rack', capacity: 180, used: 20, status: 'active' },
    { id: 'LOC-E01', warehouseId: 'WH-CTG', zoneId: 'ZNE-E', code: 'E-01', type: 'rack', capacity: 120, used: 44, status: 'active' },
    { id: 'LOC-E02', warehouseId: 'WH-CTG', zoneId: 'ZNE-E', code: 'E-02', type: 'rack', capacity: 100, used: 22, status: 'active' },
    { id: 'LOC-E03', warehouseId: 'WH-CTG', zoneId: 'ZNE-E', code: 'E-03', type: 'rack', capacity: 120, used: 38, status: 'active' },
    { id: 'LOC-F01', warehouseId: 'WH-CTG', zoneId: 'ZNE-F', code: 'F-01', type: 'pallet', capacity: 800, used: 640, status: 'active' },
    { id: 'LOC-F02', warehouseId: 'WH-CTG', zoneId: 'ZNE-F', code: 'F-02', type: 'pallet', capacity: 500, used: 120, status: 'active' },
    { id: 'LOC-F03', warehouseId: 'WH-CTG', zoneId: 'ZNE-F', code: 'F-03', type: 'pallet', capacity: 500, used: 265, status: 'active' }
  ];

  // ---------- Racks ----------
  const racks = [
    { id: 'RCK-A1', locationId: 'LOC-A01', code: 'A1-01', level: 1, type: 'selective', status: 'active' },
    { id: 'RCK-A2', locationId: 'LOC-A02', code: 'A2-01', level: 2, type: 'selective', status: 'active' },
    { id: 'RCK-A3', locationId: 'LOC-A03', code: 'A3-01', level: 1, type: 'selective', status: 'active' },
    { id: 'RCK-A4', locationId: 'LOC-A04', code: 'A4-01', level: 2, type: 'selective', status: 'full' },
    { id: 'RCK-A5', locationId: 'LOC-A05', code: 'A5-01', level: 1, type: 'selective', status: 'active' },
    { id: 'RCK-A6', locationId: 'LOC-A06', code: 'A6-01', level: 3, type: 'selective', status: 'active' },
    { id: 'RCK-A7', locationId: 'LOC-A07', code: 'A7-01', level: 2, type: 'selective', status: 'active' },
    { id: 'RCK-B1', locationId: 'LOC-B01', code: 'B1-01', level: 1, type: 'drive-in', status: 'active' },
    { id: 'RCK-B2', locationId: 'LOC-B02', code: 'B2-01', level: 2, type: 'drive-in', status: 'active' },
    { id: 'RCK-B3', locationId: 'LOC-B03', code: 'B3-01', level: 1, type: 'drive-in', status: 'active' },
    { id: 'RCK-B4', locationId: 'LOC-B04', code: 'B4-01', level: 3, type: 'drive-in', status: 'active' },
    { id: 'RCK-C1', locationId: 'LOC-C01', code: 'C1-01', level: 1, type: 'bulk', status: 'active' },
    { id: 'RCK-C2', locationId: 'LOC-C02', code: 'C2-01', level: 1, type: 'bulk', status: 'active' },
    { id: 'RCK-C3', locationId: 'LOC-C03', code: 'C3-01', level: 1, type: 'bulk', status: 'active' },
    { id: 'RCK-D1', locationId: 'LOC-D01', code: 'D1-01', level: 1, type: 'pallet', status: 'active' },
    { id: 'RCK-D2', locationId: 'LOC-D02', code: 'D2-01', level: 2, type: 'selective', status: 'active' },
    { id: 'RCK-D3', locationId: 'LOC-D03', code: 'D3-01', level: 1, type: 'selective', status: 'active' },
    { id: 'RCK-D4', locationId: 'LOC-D04', code: 'D4-01', level: 2, type: 'selective', status: 'active' },
    { id: 'RCK-E1', locationId: 'LOC-E01', code: 'E1-01', level: 1, type: 'selective', status: 'active' },
    { id: 'RCK-E2', locationId: 'LOC-E02', code: 'E2-01', level: 2, type: 'selective', status: 'active' },
    { id: 'RCK-E3', locationId: 'LOC-E03', code: 'E3-01', level: 1, type: 'selective', status: 'active' },
    { id: 'RCK-F1', locationId: 'LOC-F01', code: 'F1-01', level: 1, type: 'pallet rack', status: 'active' },
    { id: 'RCK-F2', locationId: 'LOC-F02', code: 'F2-01', level: 2, type: 'pallet rack', status: 'active' },
    { id: 'RCK-F3', locationId: 'LOC-F03', code: 'F3-01', level: 1, type: 'pallet rack', status: 'active' }
  ];

  // ---------- Purchase Orders (6) ----------
  const purchases = [
    {
      id: 'PO-0001', number: 'PO-2024-0001', supplierId: 'SUP-001', warehouseId: 'WH-CTG',
      status: 'received', orderDate: DB.daysAgo(18), expectedDate: DB.daysAgo(9), receivedDate: DB.daysAgo(9),
      items: [
        { productId: 'PRD-001', qty: 24, unitPrice: 12500000, receivedQty: 24 },
        { productId: 'PRD-004', qty: 50, unitPrice: 1150000, receivedQty: 48 }
      ],
      total: 357200000, notes: 'Termin pembayaran net 30 hari', createdBy: 'Rudi Hartono'
    },
    {
      id: 'PO-0002', number: 'PO-2024-0002', supplierId: 'SUP-002', warehouseId: 'WH-CTG',
      status: 'received', orderDate: DB.daysAgo(15), expectedDate: DB.daysAgo(8), receivedDate: DB.daysAgo(8),
      items: [
        { productId: 'PRD-006', qty: 100, unitPrice: 72000, receivedQty: 100 },
        { productId: 'PRD-007', qty: 80, unitPrice: 112000, receivedQty: 80 },
        { productId: 'PRD-009', qty: 30, unitPrice: 246000, receivedQty: 30 }
      ],
      total: 25400000, notes: '', createdBy: 'Lina Marlina'
    },
    {
      id: 'PO-0003', number: 'PO-2024-0003', supplierId: 'SUP-004', warehouseId: 'WH-CTG',
      status: 'approved', orderDate: DB.daysAgo(4), expectedDate: DB.daysAhead(3), receivedDate: null,
      items: [
        { productId: 'PRD-016', qty: 20, unitPrice: 480000, receivedQty: 0 },
        { productId: 'PRD-017', qty: 15, unitPrice: 690000, receivedQty: 0 }
      ],
      total: 19950000, notes: 'Prioritas: pembukaan cabang baru', createdBy: 'Rudi Hartono'
    },
    {
      id: 'PO-0004', number: 'PO-2024-0004', supplierId: 'SUP-005', warehouseId: 'WH-CTG',
      status: 'draft', orderDate: DB.daysAgo(1), expectedDate: DB.daysAhead(6), receivedDate: null,
      items: [
        { productId: 'PRD-019', qty: 200, unitPrice: 48000, receivedQty: 0 },
        { productId: 'PRD-020', qty: 60, unitPrice: 145000, receivedQty: 0 }
      ],
      total: 18300000, notes: 'Menunggu approval finance', createdBy: 'Lina Marlina'
    },
    {
      id: 'PO-0005', number: 'PO-2024-0005', supplierId: 'SUP-006', warehouseId: 'WH-JKT',
      status: 'partial', orderDate: DB.daysAgo(7), expectedDate: DB.daysAgo(1), receivedDate: DB.daysAgo(1),
      items: [
        { productId: 'PRD-023', qty: 60, unitPrice: 320000, receivedQty: 40 },
        { productId: 'PRD-024', qty: 40, unitPrice: 380000, receivedQty: 0 }
      ],
      total: 26500000, notes: 'Sisa menunggu stok supplier', createdBy: 'Bambang Purnomo'
    },
    {
      id: 'PO-0006', number: 'PO-2024-0006', supplierId: 'SUP-003', warehouseId: 'WH-CTG',
      status: 'draft', orderDate: DB.daysAgo(0), expectedDate: DB.daysAhead(10), receivedDate: null,
      items: [
        { productId: 'PRD-012', qty: 8, unitPrice: 2100000, receivedQty: 0 }
      ],
      total: 16800000, notes: 'Rencana promosi bulan depan', createdBy: 'Rudi Hartono'
    }
  ];

  // ---------- Receivings ----------
  const receivings = [
    { id: 'RCV-0001', number: 'RCV-2024-0001', purchaseId: 'PO-0001', warehouseId: 'WH-CTG', supplierId: 'SUP-001', status: 'completed', receivedDate: DB.daysAgo(9), items: [{ productId: 'PRD-001', qty: 24 }, { productId: 'PRD-004', qty: 48 }], receivedBy: 'Rudi Hartono', checkedBy: 'Warehouse Team', notes: 'Kekurangan 2 unit PRD-004 (claim ke supplier)' },
    { id: 'RCV-0002', number: 'RCV-2024-0002', purchaseId: 'PO-0002', warehouseId: 'WH-CTG', supplierId: 'SUP-002', status: 'completed', receivedDate: DB.daysAgo(8), items: [{ productId: 'PRD-006', qty: 100 }, { productId: 'PRD-007', qty: 80 }, { productId: 'PRD-009', qty: 30 }], receivedBy: 'Lina Marlina', checkedBy: 'Warehouse Team', notes: 'Semua sesuai' },
    { id: 'RCV-0003', number: 'RCV-2024-0003', purchaseId: 'PO-0005', warehouseId: 'WH-JKT', supplierId: 'SUP-006', status: 'completed', receivedDate: DB.daysAgo(1), items: [{ productId: 'PRD-023', qty: 40 }], receivedBy: 'Bambang Purnomo', checkedBy: 'Warehouse Team', notes: 'Partial receiving, sisa 20 unit menyusul' },
    { id: 'RCV-0004', number: 'RCV-2024-0004', purchaseId: 'PO-0003', warehouseId: 'WH-CTG', supplierId: 'SUP-004', status: 'scheduled', receivedDate: DB.daysAhead(3), items: [{ productId: 'PRD-016', qty: 20 }, { productId: 'PRD-017', qty: 15 }], receivedBy: 'Rudi Hartono', checkedBy: '', notes: 'Jadwal kedatangan truk pukul 09:00' },
    { id: 'RCV-0005', number: 'RCV-2024-0005', purchaseId: 'PO-0004', warehouseId: 'WH-CTG', supplierId: 'SUP-005', status: 'draft', receivedDate: DB.daysAhead(6), items: [{ productId: 'PRD-019', qty: 200 }, { productId: 'PRD-020', qty: 60 }], receivedBy: 'Lina Marlina', checkedBy: '', notes: 'Pre-ticket receiving' }
  ];

  // ---------- Transfers ----------
  const transfers = [
    { id: 'TRF-0001', number: 'TRF-2024-0001', fromWarehouseId: 'WH-CTG', toWarehouseId: 'WH-JKT', status: 'completed', createdDate: DB.daysAgo(6), completedDate: DB.daysAgo(5), items: [{ productId: 'PRD-006', qty: 80 }, { productId: 'PRD-007', qty: 40 }], createdBy: 'Rudi Hartono', note: 'Replenish gudang transit' },
    { id: 'TRF-0002', number: 'TRF-2024-0002', fromWarehouseId: 'WH-CTG', toWarehouseId: 'WH-SBY', status: 'in_transit', createdDate: DB.daysAgo(2), completedDate: null, items: [{ productId: 'PRD-019', qty: 150 }, { productId: 'PRD-021', qty: 50 }], createdBy: 'Lina Marlina', note: 'Kiriman via armada sendiri' },
    { id: 'TRF-0003', number: 'TRF-2024-0003', fromWarehouseId: 'WH-JKT', toWarehouseId: 'WH-CTG', status: 'in_transit', createdDate: DB.daysAgo(1), completedDate: null, items: [{ productId: 'PRD-023', qty: 15 }], createdBy: 'Bambang Purnomo', note: 'Balik stock berlebih' },
    { id: 'TRF-0004', number: 'TRF-2024-0004', fromWarehouseId: 'WH-CTG', toWarehouseId: 'WH-SBY', status: 'pending', createdDate: DB.daysAgo(0), completedDate: null, items: [{ productId: 'PRD-016', qty: 12 }, { productId: 'PRD-017', qty: 6 }], createdBy: 'Rudi Hartono', note: 'Menunggu jadwal pickup' }
  ];

  // ---------- Stock Movements (ledger) ----------
  const movements = [
    { id: 'MOV-0001', type: 'receive', productId: 'PRD-001', qty: 24, ref: 'RCV-2024-0001', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(9), user: 'Rudi Hartono', note: 'Receiving PO-2024-0001' },
    { id: 'MOV-0002', type: 'receive', productId: 'PRD-004', qty: 48, ref: 'RCV-2024-0001', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(9), user: 'Rudi Hartono', note: 'Receiving PO-2024-0001 (short 2)' },
    { id: 'MOV-0003', type: 'receive', productId: 'PRD-006', qty: 100, ref: 'RCV-2024-0002', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(8), user: 'Lina Marlina', note: 'Receiving PO-2024-0002' },
    { id: 'MOV-0004', type: 'receive', productId: 'PRD-007', qty: 80, ref: 'RCV-2024-0002', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(8), user: 'Lina Marlina', note: 'Receiving PO-2024-0002' },
    { id: 'MOV-0005', type: 'receive', productId: 'PRD-009', qty: 30, ref: 'RCV-2024-0002', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(8), user: 'Lina Marlina', note: 'Receiving PO-2024-0002' },
    { id: 'MOV-0006', type: 'issue', productId: 'PRD-001', qty: -12, ref: 'ISS-2024-0012', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(5), user: 'Andi Pratama', note: 'Issue ke PT Retail Modern Indonesia' },
    { id: 'MOV-0007', type: 'transfer_out', productId: 'PRD-006', qty: -80, ref: 'TRF-2024-0001', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(5), user: 'Rudi Hartono', note: 'Transfer ke WH-JKT' },
    { id: 'MOV-0008', type: 'transfer_in', productId: 'PRD-006', qty: 80, ref: 'TRF-2024-0001', warehouseId: 'WH-JKT', createdAt: DB.daysAgo(5), user: 'Bambang Purnomo', note: 'Diterima di WH-JKT' },
    { id: 'MOV-0009', type: 'transfer_out', productId: 'PRD-007', qty: -40, ref: 'TRF-2024-0001', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(5), user: 'Rudi Hartono', note: 'Transfer ke WH-JKT' },
    { id: 'MOV-0010', type: 'transfer_in', productId: 'PRD-007', qty: 40, ref: 'TRF-2024-0001', warehouseId: 'WH-JKT', createdAt: DB.daysAgo(5), user: 'Bambang Purnomo', note: 'Diterima di WH-JKT' },
    { id: 'MOV-0011', type: 'adjustment', productId: 'PRD-004', qty: -2, ref: 'ADJ-2024-001', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(9), user: 'Lina Marlina', note: 'Shortage saat receiving — penyesuaian' },
    { id: 'MOV-0012', type: 'issue', productId: 'PRD-002', qty: -15, ref: 'ISS-2024-0013', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(4), user: 'Maya Dewi', note: 'Issue untuk marketplace' },
    { id: 'MOV-0013', type: 'issue', productId: 'PRD-014', qty: -20, ref: 'ISS-2024-0014', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(3), user: 'Slamet Riyadi', note: 'Issue ke Toko Berkah' },
    { id: 'MOV-0014', type: 'issue', productId: 'PRD-023', qty: -10, ref: 'ISS-2024-0015', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(2), user: 'Andi Pratama', note: 'Issue ke RMI' },
    { id: 'MOV-0015', type: 'return', productId: 'PRD-014', qty: 3, ref: 'RET-2024-001', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(2), user: 'Slamet Riyadi', note: 'Retur rusak kemasan' },
    { id: 'MOV-0016', type: 'issue', productId: 'PRD-001', qty: -8, ref: 'ISS-2024-0016', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(1), user: 'Joko Susilo', note: 'Issue ke Koperasi Sejahtera' },
    { id: 'MOV-0017', type: 'adjustment', productId: 'PRD-019', qty: 5, ref: 'ADJ-2024-002', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(1), user: 'Lina Marlina', note: 'Hasil cycle count — surplus 5 rim' },
    { id: 'MOV-0018', type: 'transfer_out', productId: 'PRD-019', qty: -150, ref: 'TRF-2024-0002', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(2), user: 'Lina Marlina', note: 'Transfer ke WH-SBY' },
    { id: 'MOV-0019', type: 'receive', productId: 'PRD-023', qty: 40, ref: 'RCV-2024-0003', warehouseId: 'WH-JKT', createdAt: DB.daysAgo(1), user: 'Bambang Purnomo', note: 'Partial receiving PO-2024-0005' },
    { id: 'MOV-0020', type: 'issue', productId: 'PRD-005', qty: -22, ref: 'ISS-2024-0017', warehouseId: 'WH-CTG', createdAt: DB.daysAgo(0), user: 'Maya Dewi', note: 'Issue marketplace — fast moving' }
  ];

  // ---------- Adjustments ----------
  const adjustments = [
    { id: 'ADJ-0001', number: 'ADJ-2024-001', productId: 'PRD-004', qty: -2, type: 'shortage', reason: 'Kekurangan saat receiving', status: 'completed', createdAt: DB.daysAgo(9), user: 'Lina Marlina', note: 'Disetujui supervisor' },
    { id: 'ADJ-0002', number: 'ADJ-2024-002', productId: 'PRD-019', qty: 5, type: 'surplus', reason: 'Hasil cycle count', status: 'completed', createdAt: DB.daysAgo(1), user: 'Lina Marlina', note: 'Surplus 5 rim HVS' },
    { id: 'ADJ-0003', number: 'ADJ-2024-003', productId: 'PRD-012', qty: -1, type: 'damage', reason: 'Meja rusak saat penataan', status: 'pending', createdAt: DB.daysAgo(0), user: 'Rudi Hartono', note: 'Menunggu approval manager' }
  ];

  // ---------- Reservations ----------
  const reservations = [
    { id: 'RSV-0001', number: 'RSV-2024-001', productId: 'PRD-001', qty: 10, customerId: 'CUS-001', status: 'active', createdAt: DB.daysAgo(1), expiresAt: DB.daysAhead(7), note: 'Reservasi untuk kontrak RMI' },
    { id: 'RSV-0002', number: 'RSV-2024-002', productId: 'PRD-023', qty: 20, customerId: 'CUS-003', status: 'active', createdAt: DB.daysAgo(2), expiresAt: DB.daysAhead(5), note: 'Untuk flash sale marketplace' },
    { id: 'RSV-0003', number: 'RSV-2024-003', productId: 'PRD-006', qty: 50, customerId: 'CUS-002', status: 'completed', createdAt: DB.daysAgo(6), expiresAt: DB.daysAgo(0), note: 'Telah diissue ke Toko Berkah' },
    { id: 'RSV-0004', number: 'RSV-2024-004', productId: 'PRD-016', qty: 8, customerId: 'CUS-005', status: 'active', createdAt: DB.daysAgo(0), expiresAt: DB.daysAhead(14), note: 'Untuk proyek hotel' }
  ];

  // ---------- Issues ----------
  const issues = [
    { id: 'ISS-0012', number: 'ISS-2024-0012', customerId: 'CUS-001', warehouseId: 'WH-CTG', status: 'shipped', issueDate: DB.daysAgo(5), items: [{ productId: 'PRD-001', qty: 12 }], type: 'sales_order', createdBy: 'Andi Pratama', note: '' },
    { id: 'ISS-0013', number: 'ISS-2024-0013', customerId: 'CUS-003', warehouseId: 'WH-CTG', status: 'completed', issueDate: DB.daysAgo(4), items: [{ productId: 'PRD-002', qty: 15 }], type: 'sales_order', createdBy: 'Maya Dewi', note: 'Dikirim via ekspedisi' },
    { id: 'ISS-0014', number: 'ISS-2024-0014', customerId: 'CUS-002', warehouseId: 'WH-CTG', status: 'completed', issueDate: DB.daysAgo(3), items: [{ productId: 'PRD-014', qty: 20 }], type: 'sales_order', createdBy: 'Slamet Riyadi', note: '' },
    { id: 'ISS-0015', number: 'ISS-2024-0015', customerId: 'CUS-001', warehouseId: 'WH-CTG', status: 'picking', issueDate: DB.daysAgo(2), items: [{ productId: 'PRD-023', qty: 10 }], type: 'sales_order', createdBy: 'Andi Pratama', note: 'Sedang dalam proses picking' },
    { id: 'ISS-0016', number: 'ISS-2024-0016', customerId: 'CUS-004', warehouseId: 'WH-CTG', status: 'packed', issueDate: DB.daysAgo(1), items: [{ productId: 'PRD-001', qty: 8 }], type: 'sales_order', createdBy: 'Joko Susilo', note: 'Siap kirim besok' },
    { id: 'ISS-0017', number: 'ISS-2024-0017', customerId: 'CUS-003', warehouseId: 'WH-CTG', status: 'draft', issueDate: DB.daysAgo(0), items: [{ productId: 'PRD-005', qty: 22 }], type: 'sales_order', createdBy: 'Maya Dewi', note: 'Draft issue - menunggu konfirmasi' }
  ];

  // ---------- Returns ----------
  const returns = [
    { id: 'RET-0001', number: 'RET-2024-001', customerId: 'CUS-002', warehouseId: 'WH-CTG', status: 'completed', returnDate: DB.daysAgo(2), items: [{ productId: 'PRD-014', qty: 3, reason: 'Kemasan rusak' }], returnType: 'customer', createdBy: 'Slamet Riyadi', note: 'Barang diterima kembali, di-refund' },
    { id: 'RET-0002', number: 'RET-2024-002', supplierId: 'SUP-001', warehouseId: 'WH-CTG', status: 'in_transit', returnDate: DB.daysAgo(0), items: [{ productId: 'PRD-004', qty: 2, reason: 'Barang cacat' }], returnType: 'supplier', createdBy: 'Lina Marlina', note: 'Dikirim balik ke supplier' }
  ];

  // ---------- Cycle Counts ----------
  const cycleCounts = [
    { id: 'CC-0001', number: 'CC-2024-001', zoneId: 'ZNE-A', warehouseId: 'WH-CTG', status: 'completed', scheduledDate: DB.daysAgo(3), completedDate: DB.daysAgo(3), items: [{ productId: 'PRD-001', systemQty: 36, countedQty: 36 }, { productId: 'PRD-002', systemQty: 42, countedQty: 42 }, { productId: 'PRD-004', systemQty: 10, countedQty: 10 }], discrepancy: 0, assignedTo: 'Lina Marlina', note: 'Semua akurat' },
    { id: 'CC-0002', number: 'CC-2024-002', zoneId: 'ZNE-F', warehouseId: 'WH-CTG', status: 'completed', scheduledDate: DB.daysAgo(1), completedDate: DB.daysAgo(1), items: [{ productId: 'PRD-019', systemQty: 640, countedQty: 645 }, { productId: 'PRD-021', systemQty: 265, countedQty: 265 }], discrepancy: 5, assignedTo: 'Rudi Hartono', note: 'Surplus 5 rim HVS — adjustment ADJ-2024-002' },
    { id: 'CC-0003', number: 'CC-2024-003', zoneId: 'ZNE-B', warehouseId: 'WH-CTG', status: 'in_progress', scheduledDate: DB.daysAgo(0), completedDate: null, items: [{ productId: 'PRD-006', systemQty: 480, countedQty: 477 }, { productId: 'PRD-007', systemQty: 320, countedQty: null }], discrepancy: null, assignedTo: 'Lina Marlina', note: 'Sedang berlangsung' },
    { id: 'CC-0004', number: 'CC-2024-004', zoneId: 'ZNE-E', warehouseId: 'WH-CTG', status: 'scheduled', scheduledDate: DB.daysAhead(2), completedDate: null, items: [{ productId: 'PRD-016', systemQty: 44, countedQty: null }], discrepancy: null, assignedTo: 'Rudi Hartono', note: 'Jadwal mingguan' }
  ];

  // ---------- Users ----------
  const users = [
    { id: 'USR-001', name: 'Admin', email: 'admin@nexawms.com', roleId: 'ROL-ADM', status: 'active', lastLogin: DB.daysAgo(0), avatar: 'AD', phone: '0812-3456-7890' },
    { id: 'USR-002', name: 'Rudi Hartono', email: 'rudi@nexawms.com', roleId: 'ROL-WHM', status: 'active', lastLogin: DB.daysAgo(0), avatar: 'RH', phone: '0813-2233-4455' },
    { id: 'USR-003', name: 'Lina Marlina', email: 'lina@nexawms.com', roleId: 'ROL-WHS', status: 'active', lastLogin: DB.daysAgo(1), avatar: 'LM', phone: '0812-9988-7766' },
    { id: 'USR-004', name: 'Bambang Purnomo', email: 'bambang@nexawms.com', roleId: 'ROL-WHS', status: 'active', lastLogin: DB.daysAgo(1), avatar: 'BP', phone: '0821-1111-2222' },
    { id: 'USR-005', name: 'Siti Aminah', email: 'siti@nexawms.com', roleId: 'ROL-FIN', status: 'inactive', lastLogin: DB.daysAgo(30), avatar: 'SA', phone: '0857-7777-8888' }
  ];

  // ---------- Roles ----------
  const roles = [
    {
      id: 'ROL-ADM', name: 'Super Administrator', description: 'Akses penuh ke seluruh sistem',
      permissions: {
        dashboard: ['view'], products: ['view','create','edit','delete'], inventory: ['view','create','edit','delete'],
        operations: ['view','create','edit','delete'], warehouse: ['view','create','edit','delete'],
        analytics: ['view'], reports: ['view','export'], customers: ['view','create','edit','delete'],
        suppliers: ['view','create','edit','delete'], users: ['view','create','edit','delete'],
        settings: ['view','edit'], backup: ['view','export','import'], api: ['view','create','revoke']
      },
      userCount: 1, color: 'primary'
    },
    {
      id: 'ROL-WHM', name: 'Warehouse Manager', description: 'Kelola operasional gudang',
      permissions: {
        dashboard: ['view'], products: ['view','edit'], inventory: ['view','create','edit'],
        operations: ['view','create','edit'], warehouse: ['view','create','edit'],
        analytics: ['view'], reports: ['view','export'], customers: ['view'],
        suppliers: ['view'], users: ['view'], settings: ['view'], backup: [], api: []
      },
      userCount: 1, color: 'cyan'
    },
    {
      id: 'ROL-WHS', name: 'Warehouse Staff', description: 'Operator harian gudang',
      permissions: {
        dashboard: ['view'], products: ['view'], inventory: ['view','create'],
        operations: ['view','create'], warehouse: ['view'], analytics: [],
        reports: [], customers: [], suppliers: [], users: [], settings: [], backup: [], api: []
      },
      userCount: 2, color: 'green'
    },
    {
      id: 'ROL-FIN', name: 'Finance', description: 'Akses laporan & approval',
      permissions: {
        dashboard: ['view'], products: ['view'], inventory: ['view'],
        operations: ['view'], warehouse: ['view'], analytics: ['view'],
        reports: ['view','export'], customers: ['view'], suppliers: ['view'],
        users: [], settings: [], backup: [], api: []
      },
      userCount: 1, color: 'orange'
    }
  ];

  // ---------- Automations ----------
  const automations = [
    { id: 'AUT-001', name: 'Low Stock Alert', icon: '📉', trigger: 'Stok di bawah reorder point', action: 'Buat notifikasi + email ke purchasing', status: 'active', lastRun: DB.daysAgo(0), runCount: 128 },
    { id: 'AUT-002', name: 'Auto Reorder Suggestion', icon: '🔄', trigger: 'Stok mencapai safety stock', action: 'Generate draft PO ke supplier utama', status: 'active', lastRun: DB.daysAgo(1), runCount: 64 },
    { id: 'AUT-003', name: 'Dead Stock Notification', icon: '⚠️', trigger: 'Tidak ada movement 90+ hari', action: 'Notifikasi ke manajemen untuk promo', status: 'active', lastRun: DB.daysAgo(0), runCount: 431 },
    { id: 'AUT-004', name: 'Daily Summary Report', icon: '📊', trigger: 'Setiap hari pukul 20:00', action: 'Kirim ringkasan KPI via email', status: 'active', lastRun: DB.daysAgo(0), runCount: 365 },
    { id: 'AUT-005', name: 'Cycle Count Reminder', icon: '✅', trigger: 'Jadwal count H-1', action: 'Notifikasi ke warehouse supervisor', status: 'inactive', lastRun: DB.daysAgo(12), runCount: 22 },
    { id: 'AUT-006', name: 'Reservation Expiry Cleanup', icon: '⏳', trigger: 'Reservasi melewati tanggal expire', action: 'Otomatis batalkan & release stok', status: 'active', lastRun: DB.daysAgo(0), runCount: 87 }
  ];

  // ---------- Notifications ----------
  const notifications = [
    { id: 'NTF-0001', icon: '📉', type: 'warning', title: 'Stok Menipis', message: 'Logitech MX Master 3S (PRD-004) hanya tersisa 8 unit — di bawah reorder point 25.', read: false, createdAt: DB.daysAgo(0) },
    { id: 'NTF-0002', icon: '🚚', type: 'info', title: 'Transfer Tiba', message: 'Transfer TRF-2024-0002 sedang dalam perjalanan menuju WH-SBY.', read: false, createdAt: DB.daysAgo(1) },
    { id: 'NTF-0003', icon: '⏳', type: 'warning', title: 'PO Menunggu Approval', message: 'PO-2024-0006 senilai Rp 16.800.000 menunggu persetujuan Anda.', read: false, createdAt: DB.daysAgo(0) },
    { id: 'NTF-0004', icon: '📦', type: 'success', title: 'Receiving Selesai', message: 'RCV-2024-0003 selesai diterima di WH-JKT (40 unit).', read: true, createdAt: DB.daysAgo(1) },
    { id: 'NTF-0005', icon: '⚠️', type: 'danger', title: 'Barang Rusak', message: 'PRD-012 dilaporkan rusak — menunggu audit adjustment.', read: true, createdAt: DB.daysAgo(0) },
    { id: 'NTF-0006', icon: '📊', type: 'info', title: 'Laporan Mingguan Siap', message: 'Weekly Inventory Report minggu terakhir telah dibuat.', read: true, createdAt: DB.daysAgo(2) }
  ];

  // ---------- API Keys ----------
  const apiKeys = [
    { id: 'KEY-0001', name: 'Integration Marketplace', key: 'nxw_live_7F3kD9xQ2mZpL8wR', scope: 'products.read, stock.read, issues.create', lastUsed: DB.daysAgo(0), status: 'active', createdAt: DB.daysAgo(120), requests: 24801 },
    { id: 'KEY-0002', name: 'Mobile Warehouse App', key: 'nxw_live_4aB6cE1tY9uI4oP', scope: 'stock.read, operations.create', lastUsed: DB.daysAgo(0), status: 'active', createdAt: DB.daysAgo(85), requests: 9122 },
    { id: 'KEY-0003', name: 'Accounting System', key: 'nxw_live_2nR8kS5vW3xJ7qA', scope: 'products.read, reports.read', lastUsed: DB.daysAgo(3), status: 'active', createdAt: DB.daysAgo(200), requests: 4480 },
    { id: 'KEY-0004', name: 'Legacy Portal', key: 'nxw_live_9hT0mG6cV1bF5dE', scope: 'products.read', lastUsed: DB.daysAgo(45), status: 'revoked', createdAt: DB.daysAgo(360), requests: 1240 }
  ];

  // ---------- Audit Logs ----------
  const auditLogs = [
    { id: 'AUD-0001', action: 'login', entity: 'user', entityId: 'USR-001', detail: 'Login berhasil melalui web app', user: 'Admin', timestamp: DB.daysAgo(0), ip: '192.168.1.45' },
    { id: 'AUD-0002', action: 'update', entity: 'product', entityId: 'PRD-004', detail: 'Update harga dari Rp 1.499.000 → Rp 1.599.000', user: 'Rudi Hartono', timestamp: DB.daysAgo(1), ip: '192.168.1.21' },
    { id: 'AUD-0003', action: 'create', entity: 'purchase', entityId: 'PO-0006', detail: 'Membuat PO baru ke PT Furnitur Cipta Kreasi', user: 'Rudi Hartono', timestamp: DB.daysAgo(0), ip: '192.168.1.21' },
    { id: 'AUD-0004', action: 'create', entity: 'adjustment', entityId: 'ADJ-0003', detail: 'Adjustment damage -1 PRD-012', user: 'Rudi Hartono', timestamp: DB.daysAgo(0), ip: '192.168.1.21' },
    { id: 'AUD-0005', action: 'receive', entity: 'receiving', entityId: 'RCV-0003', detail: 'Menerima 40 unit PRD-023', user: 'Bambang Purnomo', timestamp: DB.daysAgo(1), ip: '192.168.3.10' },
    { id: 'AUD-0006', action: 'close', entity: 'cycleCount', entityId: 'CC-0002', detail: 'Cycle count selesai — discrepancy 5', user: 'Rudi Hartono', timestamp: DB.daysAgo(1), ip: '192.168.1.21' },
    { id: 'AUD-0007', action: 'export', entity: 'report', entityId: 'RPT-MONTHLY', detail: 'Export Monthly Inventory Report (PDF)', user: 'Admin', timestamp: DB.daysAgo(0), ip: '192.168.1.45' },
    { id: 'AUD-0008', action: 'create', entity: 'issue', entityId: 'ISS-0017', detail: 'Draft issue untuk marketplace', user: 'Maya Dewi', timestamp: DB.daysAgo(0), ip: '192.168.2.32' },
    { id: 'AUD-0009', action: 'update', entity: 'role', entityId: 'ROL-WHS', detail: 'Tambah permission operations.create', user: 'Admin', timestamp: DB.daysAgo(2), ip: '192.168.1.45' },
    { id: 'AUD-0010', action: 'login_failed', entity: 'user', entityId: 'USR-005', detail: 'Percobaan login gagal (3x) — akun nonaktif', user: 'system', timestamp: DB.daysAgo(3), ip: '10.0.0.77' }
  ];

  return {
    categories, brands, units, products, suppliers, customers,
    warehouses, zones, locations, racks,
    purchases, receivings, transfers, movements, adjustments,
    reservations, issues, returns, cycleCounts,
    users, roles, automations, notifications, apiKeys, auditLogs,
    settings: {
      company: 'PT Nexa Logistics Indonesia',
      warehouseName: 'Gudang Pusat Cikarang',
      currency: 'IDR',
      timezone: 'Asia/Jakarta',
      autoBackup: true,
      lowStockThreshold: 10,
      notificationsEnabled: true
    },
    meta: { version: '2.4.0', seededAt: DB.now(), dbName: 'nexawms-pro' }
  };
}

DB.ensure();