/* ============================================
   AutoNexa — Data Layer & Seed Data
   localStorage-backed demo database
   ============================================ */

const DB_KEY = 'autonexa_data_v1';

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

  filter(collection, fn) {
    return this.get(collection).filter(fn);
  },

  /* ---------- Helpers ---------- */
  genId(prefix) {
    const n = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}${n}`;
  },

  genWO() {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const count = this.get('workOrders').length + 1;
    return `WO-${yy}${mm}-${String(count).padStart(3, '0')}`;
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

  fmtDateShort(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  },

  fmtDateTime(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' +
           d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  },

  fmtTime(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  },

  fmtMoney(n) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
  },

  fmtNum(n) {
    return new Intl.NumberFormat('id-ID').format(n || 0);
  },

  /* ---------- Lookups ---------- */
  customer(id) { return this.find('customers', id); },
  vehicle(id) { return this.find('vehicles', id); },
  mechanic(id) { return this.find('mechanics', id); },
  part(id) { return this.find('spareParts', id); },
  supplier(id) { return this.find('suppliers', id); },
  user(id) { return this.find('users', id); },

  customerName(id) { const c = this.customer(id); return c ? c.name : '-'; },
  vehicleInfo(id) {
    const v = this.vehicle(id);
    if (!v) return { plate: '-', model: '' };
    return { plate: v.plate, model: `${v.brand} ${v.model}`, brand: v.brand, modelName: v.model };
  },
  mechanicName(id) { const m = this.mechanic(id); return m ? m.name : 'Belum ditugaskan'; },
  partName(id) { const p = this.part(id); return p ? p.name : '-'; },
  supplierName(id) { const s = this.supplier(id); return s ? s.name : '-'; },

  /* ---------- Aggregates ---------- */
  revenue() {
    return this.get('payments').filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  },

  revenueByRange(range) {
    const days = { 'today': 1, '7d': 7, '30d': 30 }[range] || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.get('payments')
      .filter(p => p.status === 'paid' && new Date(p.paidAt) >= cutoff)
      .reduce((s, p) => s + p.amount, 0);
  },

  activeWOs() {
    return this.get('workOrders').filter(wo => !['done', 'cancelled'].includes(wo.status)).length;
  },

  waitingCount() {
    return this.get('workOrders').filter(wo => wo.status === 'waiting').length;
  },

  workCount() {
    return this.get('workOrders').filter(wo => wo.status === 'work').length;
  },

  overdueCount() {
    const now = new Date();
    return this.get('workOrders').filter(wo => {
      return !['done', 'cancelled'].includes(wo.status) && new Date(wo.estimatedDone) < now;
    }).length;
  },

  lowStockParts() {
    return this.get('spareParts').filter(p => p.stock <= p.minStock);
  },

  totalPartStock() {
    return this.get('spareParts').reduce((s, p) => s + p.stock, 0);
  },

  totalPartValue() {
    return this.get('spareParts').reduce((s, p) => s + (p.stock * p.cost), 0);
  },

  /* ---------- Audit & notification ---------- */
  log(action, entity, entityId, detail, user = 'Admin') {
    this.add('activityLogs', {
      id: this.genId('LOG'),
      action, entity, entityId,
      detail: detail || '',
      user,
      timestamp: this.now()
    });
  },

  notify(title, message, type = 'info', icon = '🔔') {
    this.add('notifications', {
      id: this.genId('NTF'),
      title, message, type, icon,
      read: false,
      createdAt: this.now()
    });
  },

  /* ---------- Part stock movement ---------- */
  partIn(partId, qty, refType, refId, note = '') {
    const part = this.find('spareParts', partId);
    if (!part) return null;
    this.update('spareParts', partId, { stock: part.stock + qty });
    this.add('partMovements', {
      id: this.genId('MOV'),
      partId, qty: Math.abs(qty), type: 'in',
      refType, refId, note,
      createdAt: this.now()
    });
    this.log('stock_in', 'part', partId, `Stok masuk +${qty} ${part.name} (${refType})`);
    return true;
  },

  partOut(partId, qty, refType, refId, note = '') {
    const part = this.find('spareParts', partId);
    if (!part) return null;
    if (part.stock < qty) return false;
    this.update('spareParts', partId, { stock: part.stock - qty });
    this.add('partMovements', {
      id: this.genId('MOV'),
      partId, qty: Math.abs(qty), type: 'out',
      refType, refId, note,
      createdAt: this.now()
    });
    this.log('stock_out', 'part', partId, `Stok keluar -${qty} ${part.name} (${refType})`);
    return true;
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
    if (!Array.isArray(data.workOrders)) throw new Error('Data bukan backup AutoNexa');
    this.set(data);
    return true;
  }
};

/* ============================================
   SEED DATA
   ============================================ */
function buildSeed() {

  // ---------- Settings ----------
  const settings = {
    bengkelName: 'AutoNexa Motor & Mobil',
    address: 'Jl. Raya Industri No. 88, Jakarta',
    phone: '021-5550-123',
    email: 'halo@autonexa.id',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
    startHour: 8,
    endHour: 18,
    bayCount: 4,
    lowStockThreshold: 5,
    taxPercent: 11,
    autoBackup: true
  };

  // ---------- Users (3 role tetap — tanpa permission matrix) ----------
  const users = [
    { id: 'USR-001', name: 'Andi Pratama', email: 'admin@autonexa.id', role: 'Owner', initials: 'AP', status: 'active', phone: '0812-3456-7890' },
    { id: 'USR-002', name: 'Budi Santoso', email: 'mekanik@autonexa.id', role: 'Mekanik', initials: 'BS', status: 'active', phone: '0813-9876-5432' },
    { id: 'USR-003', name: 'Citra Dewi', email: 'kasir@autonexa.id', role: 'Kasir', initials: 'CD', status: 'active', phone: '0821-1122-3344' }
  ];

  // ---------- Mechanics ----------
  const mechanics = [
    { id: 'MEC-001', name: 'Budi Santoso', specialty: 'Mesin', initials: 'BS', status: 'available', phone: '0813-9876-5432' },
    { id: 'MEC-002', name: 'Rudi Hermawan', specialty: 'Kelistrikan', initials: 'RH', status: 'busy', phone: '0812-2233-4455' },
    { id: 'MEC-003', name: 'Joko Susilo', specialty: 'AC & Body', initials: 'JS', status: 'available', phone: '0857-5566-7788' },
    { id: 'MEC-004', name: 'Agus Salim', specialty: 'Suspensi & Rem', initials: 'AS', status: 'busy', phone: '0888-1122-3344' },
    { id: 'MEC-005', name: 'Dedi Kurniawan', specialty: 'Ban & Balancing', initials: 'DK', status: 'available', phone: '0899-5566-7788' }
  ];

  // ---------- Suppliers ----------
  const suppliers = [
    { id: 'SUP-001', name: 'PT Sumber Partindo', city: 'Jakarta Utara', phone: '021-5533-2211', status: 'active', itemCount: 4 },
    { id: 'SUP-002', name: 'CV Oli Prima Jaya', city: 'Bekasi', phone: '021-8899-0011', status: 'active', itemCount: 2 },
    { id: 'SUP-003', name: 'PT Ban Nusantara', city: 'Karawang', phone: '0267-4400-5500', status: 'active', itemCount: 3 },
    { id: 'SUP-004', name: 'UD Aki Sejahtera', city: 'Tangerang', phone: '021-5566-7788', status: 'inactive', itemCount: 2 }
  ];

  // ---------- Customers ----------
  const customers = [
    { id: 'CUS-001', name: 'Hendra Wijaya', phone: '0811-2233-4455', city: 'Jakarta Selatan', vehicleCount: 2, status: 'active' },
    { id: 'CUS-002', name: 'Siti Rahayu', phone: '0812-9988-7766', city: 'Depok', vehicleCount: 1, status: 'active' },
    { id: 'CUS-003', name: 'Tommy Gunawan', phone: '0813-5566-7788', city: 'Jakarta Timur', vehicleCount: 3, status: 'active' },
    { id: 'CUS-004', name: 'Maya Anggraini', phone: '0857-2211-3344', city: 'Bekasi', vehicleCount: 1, status: 'active' },
    { id: 'CUS-005', name: 'Rizki Fadillah', phone: '0899-7766-5544', city: 'Bogor', vehicleCount: 2, status: 'inactive' }
  ];

  // ---------- Vehicles ----------
  const vehicles = [
    { id: 'VEH-001', customerId: 'CUS-001', plate: 'B 1234 XYZ', brand: 'Toyota', model: 'Avanza 1.5', year: 2020, color: 'Putih', fuel: 'Bensin' },
    { id: 'VEH-002', customerId: 'CUS-001', plate: 'B 5678 ABC', brand: 'Honda', model: 'Vario 125', year: 2021, color: 'Merah', fuel: 'Bensin' },
    { id: 'VEH-003', customerId: 'CUS-002', plate: 'D 9012 EFG', brand: 'Daihatsu', model: 'Xenia 1.3', year: 2019, color: 'Hitam', fuel: 'Bensin' },
    { id: 'VEH-004', customerId: 'CUS-003', plate: 'B 3456 HIJ', brand: 'Mitsubishi', model: 'Pajero Sport', year: 2022, color: 'Abu', fuel: 'Diesel' },
    { id: 'VEH-005', customerId: 'CUS-003', plate: 'B 7890 KLM', brand: 'Yamaha', model: 'NMAX 155', year: 2021, color: 'Biru', fuel: 'Bensin' },
    { id: 'VEH-006', customerId: 'CUS-004', plate: 'B 1122 NOP', brand: 'Toyota', model: 'Innova Reborn', year: 2018, color: 'Silver', fuel: 'Diesel' },
    { id: 'VEH-007', customerId: 'CUS-005', plate: 'F 3344 QRS', brand: 'Suzuki', model: 'Ertiga', year: 2017, color: 'Putih', fuel: 'Bensin' }
  ];

  // ---------- Spare Parts (12) ----------
  const spareParts = [
    { id: 'PRT-001', sku: 'SP-0001', name: 'Oli Mesin 10W-40 (4L)', category: 'Oli & Filter', brand: 'Pertamina', location: 'A1', stock: 24, minStock: 10, maxStock: 60, cost: 320000, price: 450000 },
    { id: 'PRT-002', sku: 'SP-0002', name: 'Filter Oli Universal', category: 'Oli & Filter', brand: 'Denso', location: 'A2', stock: 15, minStock: 8, maxStock: 40, cost: 35000, price: 60000 },
    { id: 'PRT-003', sku: 'SP-0003', name: 'Filter Udara Avanza/Xenia', category: 'Oli & Filter', brand: 'Sakura', location: 'A3', stock: 8, minStock: 6, maxStock: 30, cost: 45000, price: 80000 },
    { id: 'PRT-004', sku: 'SP-0004', name: 'Kampas Rem Depan', category: 'Rem', brand: 'Bosch', location: 'B1', stock: 6, minStock: 8, maxStock: 25, cost: 120000, price: 200000 },
    { id: 'PRT-005', sku: 'SP-0005', name: 'Kampas Rem Belakang', category: 'Rem', brand: 'Bosch', location: 'B2', stock: 12, minStock: 8, maxStock: 25, cost: 110000, price: 185000 },
    { id: 'PRT-006', sku: 'SP-0006', name: 'Busi Iridium', category: 'Mesin', brand: 'NGK', location: 'C1', stock: 4, minStock: 10, maxStock: 30, cost: 65000, price: 120000 },
    { id: 'PRT-007', sku: 'SP-0007', name: 'Aki GS Astra 35Ah', category: 'Kelistrikan', brand: 'GS', location: 'C2', stock: 5, minStock: 4, maxStock: 15, cost: 480000, price: 750000 },
    { id: 'PRT-008', sku: 'SP-0008', name: 'Ban Bridgestone 185/65 R15', category: 'Ban', brand: 'Bridgestone', location: 'D1', stock: 8, minStock: 6, maxStock: 20, cost: 820000, price: 1150000 },
    { id: 'PRT-009', sku: 'SP-0009', name: 'Shockbreaker Belakang', category: 'Suspensi', brand: 'KYB', location: 'D2', stock: 3, minStock: 4, maxStock: 12, cost: 350000, price: 550000 },
    { id: 'PRT-010', sku: 'SP-0010', name: 'V-Belt Vario', category: 'Mesin', brand: 'Honda', location: 'E1', stock: 10, minStock: 5, maxStock: 20, cost: 85000, price: 150000 },
    { id: 'PRT-011', sku: 'SP-0011', name: 'Filter AC Kabin', category: 'AC', brand: 'Bosch', location: 'E2', stock: 0, minStock: 5, maxStock: 20, cost: 60000, price: 110000 },
    { id: 'PRT-012', sku: 'SP-0012', name: 'Oli Gardan 80W-90 (1L)', category: 'Oli & Filter', brand: 'Shell', location: 'A4', stock: 14, minStock: 6, maxStock: 25, cost: 55000, price: 95000 }
  ];

  // ---------- Work Orders (10) ----------
  const woStatus = ['work', 'work', 'waiting', 'inspection', 'estimate', 'waiting', 'work', 'qc', 'done', 'done'];
  const workOrders = [
    { id: 'WO-2601-001', number: 'WO-2601-001', customerId: 'CUS-001', vehicleId: 'VEH-001', mechanicId: 'MEC-001', status: 'work', baySlot: 1, complaint: 'Ganti oli & filter rutin 10.000 km', estimatedCost: 620000, createdAt: DB.daysAgo(0), estimatedDone: DB.daysAhead(0), progress: 45 },
    { id: 'WO-2601-002', number: 'WO-2601-002', customerId: 'CUS-003', vehicleId: 'VEH-004', mechanicId: 'MEC-004', status: 'work', baySlot: 2, complaint: 'Rem depan bunyi & getar, perlu ganti kampas', estimatedCost: 1450000, createdAt: DB.daysAgo(0), estimatedDone: DB.daysAhead(0), progress: 60 },
    { id: 'WO-2601-003', number: 'WO-2601-003', customerId: 'CUS-002', vehicleId: 'VEH-003', mechanicId: null, status: 'waiting', baySlot: null, complaint: 'AC tidak dingin, kemungkinan filter kotor', estimatedCost: 350000, createdAt: DB.daysAgo(0), estimatedDone: DB.daysAhead(1), progress: 0 },
    { id: 'WO-2601-004', number: 'WO-2601-004', customerId: 'CUS-004', vehicleId: 'VEH-006', mechanicId: 'MEC-002', status: 'inspection', baySlot: 3, complaint: 'Aki soak, perlu cek kelistrikan', estimatedCost: 850000, createdAt: DB.daysAgo(1), estimatedDone: DB.daysAhead(1), progress: 15 },
    { id: 'WO-2601-005', number: 'WO-2601-005', customerId: 'CUS-001', vehicleId: 'VEH-002', mechanicId: null, status: 'estimate', baySlot: null, complaint: 'Ganti V-Belt & servis CVT', estimatedCost: 280000, createdAt: DB.daysAgo(1), estimatedDone: DB.daysAhead(1), progress: 10 },
    { id: 'WO-2601-006', number: 'WO-2601-006', customerId: 'CUS-003', vehicleId: 'VEH-005', mechanicId: 'MEC-005', status: 'waiting', baySlot: null, complaint: 'Ganti ban depan-belakang + balancing', estimatedCost: 2600000, createdAt: DB.daysAgo(1), estimatedDone: DB.daysAhead(2), progress: 0 },
    { id: 'WO-2601-007', number: 'WO-2601-007', customerId: 'CUS-005', vehicleId: 'VEH-007', mechanicId: 'MEC-003', status: 'work', baySlot: 4, complaint: 'Ganti shockbreaker belakang & spooring', estimatedCost: 1250000, createdAt: DB.daysAgo(1), estimatedDone: DB.daysAhead(0), progress: 70 },
    { id: 'WO-2601-008', number: 'WO-2601-008', customerId: 'CUS-002', vehicleId: 'VEH-003', mechanicId: null, status: 'qc', baySlot: 1, complaint: 'Servis rutin + ganti busi', estimatedCost: 420000, createdAt: DB.daysAgo(2), estimatedDone: DB.daysAgo(0), progress: 90 },
    { id: 'WO-2601-009', number: 'WO-2601-009', customerId: 'CUS-004', vehicleId: 'VEH-006', mechanicId: 'MEC-001', status: 'done', baySlot: null, complaint: 'Servis 20.000 km lengkap', estimatedCost: 1850000, createdAt: DB.daysAgo(4), estimatedDone: DB.daysAgo(1), progress: 100 },
    { id: 'WO-2601-010', number: 'WO-2601-010', customerId: 'CUS-001', vehicleId: 'VEH-001', mechanicId: 'MEC-004', status: 'done', baySlot: null, complaint: 'Ganti oli gardan & rem belakang', estimatedCost: 780000, createdAt: DB.daysAgo(6), estimatedDone: DB.daysAgo(4), progress: 100 }
  ];

  // ---------- Parts used per WO ----------
  const woParts = [
    { id: 'PD-001', workOrderId: 'WO-2601-001', partId: 'PRT-001', qty: 1, price: 450000 },
    { id: 'PD-002', workOrderId: 'WO-2601-001', partId: 'PRT-002', qty: 1, price: 60000 },
    { id: 'PD-003', workOrderId: 'WO-2601-002', partId: 'PRT-004', qty: 1, price: 200000 },
    { id: 'PD-004', workOrderId: 'WO-2601-002', partId: 'PRT-005', qty: 1, price: 185000 },
    { id: 'PD-005', workOrderId: 'WO-2601-007', partId: 'PRT-009', qty: 2, price: 550000 },
    { id: 'PD-006', workOrderId: 'WO-2601-008', partId: 'PRT-006', qty: 4, price: 120000 },
    { id: 'PD-007', workOrderId: 'WO-2601-009', partId: 'PRT-001', qty: 1, price: 450000 },
    { id: 'PD-008', workOrderId: 'WO-2601-009', partId: 'PRT-003', qty: 1, price: 80000 },
    { id: 'PD-009', workOrderId: 'WO-2601-010', partId: 'PRT-012', qty: 2, price: 95000 },
    { id: 'PD-010', workOrderId: 'WO-2601-010', partId: 'PRT-005', qty: 1, price: 185000 }
  ];

  // ---------- Payments ----------
  const payments = [
    { id: 'PAY-001', workOrderId: 'WO-2601-009', amount: 1850000, method: 'Transfer', status: 'paid', paidAt: DB.daysAgo(1) },
    { id: 'PAY-002', workOrderId: 'WO-2601-010', amount: 780000, method: 'Tunai', status: 'paid', paidAt: DB.daysAgo(4) },
    { id: 'PAY-003', workOrderId: 'WO-2601-008', amount: 420000, method: 'QRIS', status: 'paid', paidAt: DB.daysAgo(0) },
    { id: 'PAY-004', workOrderId: 'WO-2601-007', amount: 1250000, method: 'Transfer', status: 'pending', paidAt: null },
    { id: 'PAY-005', workOrderId: 'WO-2601-002', amount: 1450000, method: 'Tunai', status: 'pending', paidAt: null }
  ];

  // ---------- Part movements (in/out sederhana) ----------
  const partMovements = [
    { id: 'MOV-001', partId: 'PRT-001', qty: 5, type: 'in', refType: 'Pembelian', refId: 'PO-010', note: 'Restok oli dari CV Oli Prima Jaya', createdAt: DB.daysAgo(1) },
    { id: 'MOV-002', partId: 'PRT-004', qty: 1, type: 'out', refType: 'WO', refId: 'WO-2601-002', note: 'Kampas rem depan', createdAt: DB.daysAgo(0) },
    { id: 'MOV-003', partId: 'PRT-006', qty: 4, type: 'out', refType: 'WO', refId: 'WO-2601-008', note: 'Ganti busi', createdAt: DB.daysAgo(1) },
    { id: 'MOV-004', partId: 'PRT-008', qty: 4, type: 'in', refType: 'Pembelian', refId: 'PO-011', note: 'Restok ban dari PT Ban Nusantara', createdAt: DB.daysAgo(2) },
    { id: 'MOV-005', partId: 'PRT-011', qty: 2, type: 'out', refType: 'WO', refId: 'WO-2601-003', note: 'Filter AC kabin', createdAt: DB.daysAgo(0) },
    { id: 'MOV-006', partId: 'PRT-009', qty: 2, type: 'out', refType: 'WO', refId: 'WO-2601-007', note: 'Shockbreaker belakang', createdAt: DB.daysAgo(0) }
  ];

  // ---------- Notifications ----------
  const notifications = [
    { id: 'NTF-001', icon: '📦', type: 'warning', title: 'Stok Menipis', message: 'Busi Iridium (SP-0006) tersisa 4 unit — di bawah ambang minimum.', read: false, createdAt: DB.daysAgo(0) },
    { id: 'NTF-002', icon: '🔧', type: 'info', title: 'WO Baru Check-in', message: 'WO-2601-003 masuk antrean — AC tidak dingin.', read: false, createdAt: DB.daysAgo(0) },
    { id: 'NTF-003', icon: '⏰', type: 'danger', title: 'Pekerjaan Terlambat', message: 'WO-2601-008 melewati estimasi, status QC.', read: false, createdAt: DB.daysAgo(0) },
    { id: 'NTF-004', icon: '✅', type: 'success', title: 'WO Selesai', message: 'WO-2601-009 telah selesai dan dibayar.', read: true, createdAt: DB.daysAgo(1) }
  ];

  // ---------- Activity logs (timeline sederhana) ----------
  const activityLogs = [
    { id: 'LOG-001', action: 'create', entity: 'workOrder', entityId: 'WO-2601-001', detail: 'Membuat WO baru — ganti oli & filter', user: 'Andi Pratama', timestamp: DB.daysAgo(0) },
    { id: 'LOG-002', action: 'update', entity: 'workOrder', entityId: 'WO-2601-002', detail: 'Menugaskan ke Budi Santoso', user: 'Andi Pratama', timestamp: DB.daysAgo(0) },
    { id: 'LOG-003', action: 'stock_in', entity: 'part', entityId: 'PRT-001', detail: 'Restok oli mesin +5 (PO-010)', user: 'Citra Dewi', timestamp: DB.daysAgo(1) },
    { id: 'LOG-004', action: 'pay', entity: 'payment', entityId: 'PAY-001', detail: 'Pembayaran WO-2601-009 Rp 1.850.000', user: 'Citra Dewi', timestamp: DB.daysAgo(1) },
    { id: 'LOG-005', action: 'update', entity: 'workOrder', entityId: 'WO-2601-008', detail: 'Status berubah ke QC', user: 'Budi Santoso', timestamp: DB.daysAgo(2) },
    { id: 'LOG-006', action: 'create', entity: 'customer', entityId: 'CUS-004', detail: 'Menambahkan pelanggan baru', user: 'Andi Pratama', timestamp: DB.daysAgo(3) }
  ];

  return {
    settings, users, mechanics, suppliers, customers, vehicles,
    spareParts, workOrders, woParts, payments, partMovements,
    notifications, activityLogs,
    meta: { version: '1.0.0', seededAt: DB.now(), dbName: 'autonexa-standard' }
  };
}

DB.ensure();