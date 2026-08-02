/* ============================================
   StockPilot — Data Layer (localStorage)
   ============================================ */

const DB_KEY = 'stockpilot_data_v1';

const DB = {
  all() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)); } catch(e) { return null; }
  },
  get(collection) {
    const db = this.all();
    return db ? (db[collection] || []) : [];
  },
  set(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); },
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
    this.save(collection, this.get(collection).filter(i => i.id !== id));
  },
  find(collection, id) {
    return this.get(collection).find(i => i.id === id) || null;
  },
  filter(collection, fn) { return this.get(collection).filter(fn); },

  /* Helpers */
  genId(prefix) { return `${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`; },
  now() { return new Date().toISOString(); },
  daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); },
  daysAhead(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString(); },

  fmtDate(iso) { if (!iso) return '-'; return new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }); },
  fmtDateShort(iso) { if (!iso) return '-'; return new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short' }); },
  fmtDateTime(iso) { if (!iso) return '-'; const d = new Date(iso); return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }); },
  fmtMoney(n) { return new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(n || 0); },
  fmtNum(n) { return new Intl.NumberFormat('id-ID').format(n || 0); },

  /* Lookups */
  product(id) { return this.find('products', id); },
  supplier(id) { return this.find('suppliers', id); },
  category(id) { return this.find('categories', id); },
  brand(id) { return this.find('brands', id); },
  unit(id) { return this.find('units', id); },
  customer(id) { return this.find('customers', id); },
  productName(id) { const p = this.product(id); return p ? p.name : '-'; },
  supplierName(id) { const s = this.supplier(id); return s ? s.name : '-'; },

  /* Aggregates */
  totalValue() { return this.get('products').reduce((s,p) => s + (p.stock * p.cost), 0); },
  totalUnits() { return this.get('products').reduce((s,p) => s + p.stock, 0); },
  lowStock() { return this.get('products').filter(p => p.stock <= p.minStock); },
  outOfStock() { return this.get('products').filter(p => p.stock <= 0); },
  activeProducts() { return this.get('products').filter(p => p.status === 'active'); },
  recentTransactions(n = 8) { return [...this.get('transactions')].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, n); },
  purchaseTotal() { return this.get('pos').filter(p => p.status !== 'cancelled').reduce((s, p) => s + p.total, 0); },

  /* Log & notify */
  log(action, entity, entityId, detail, user = 'Admin Utama') {
    this.add('activityLogs', { id: this.genId('LOG'), user, action, entity, entityId, detail, timestamp: this.now() });
  },
  notify(title, message, type = 'info', icon = '🔔') {
    this.add('notifications', { id: this.genId('NTF'), title, message, type, icon, read: false, createdAt: this.now() });
  },

  /* Stock movement */
  stockIn(productId, qty, refType = 'PO', refId = '-', reason = 'Pembelian') {
    const p = this.product(productId);
    if (!p) return null;
    this.update('products', productId, { stock: p.stock + qty });
    this.add('transactions', {
      id: this.genId('TRX'), productId, productName: p.name, sku: p.sku,
      type: 'in', qty: Math.abs(qty), reason, refType, refId: refId || '-', createdAt: this.now(), user: 'Admin Utama'
    });
    this.log('stock_in', 'inventory', productId, `Stok masuk +${qty} ${p.name}`);
    return true;
  },
  stockOut(productId, qty, refType = 'SO', refId = '-', reason = 'Penjualan / Pemakaian') {
    const p = this.product(productId);
    if (!p) return null;
    if (p.stock < qty) return false;
    this.update('products', productId, { stock: p.stock - qty });
    this.add('transactions', {
      id: this.genId('TRX'), productId, productName: p.name, sku: p.sku,
      type: 'out', qty: Math.abs(qty), reason, refType, refId: refId || '-', createdAt: this.now(), user: 'Admin Utama'
    });
    this.log('stock_out', 'inventory', productId, `Stok keluar -${qty} ${p.name}`);
    return true;
  },
  adjust(productId, qty, reason = 'Penyesuaian stok') {
    const p = this.product(productId);
    if (!p) return null;
    const newQty = Math.max(0, p.stock + qty);
    this.update('products', productId, { stock: newQty });
    this.add('transactions', {
      id: this.genId('TRX'), productId, productName: p.name, sku: p.sku,
      type: 'adjustment', qty, reason, refType: 'ADJ', refId: this.genId('ADJ').slice(0, 9), createdAt: this.now(), user: 'Admin Utama'
    });
    this.log('adjust', 'inventory', productId, `Penyesuaian ${qty > 0 ? '+' : ''}${qty} ${p.name}`);
    return true;
  },

  /* Init / Reset / Seed */
  reset() { localStorage.removeItem(DB_KEY); this.seed(); return true; },
  isSeeded() { return !!this.all(); },
  seed() { const db = buildMockData(); this.set(db); },
  ensure() { if (!this.isSeeded()) this.seed(); },
  exportJSON() { return JSON.stringify(this.all(), null, 2); },
  importJSON(text) {
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.products)) throw new Error('Data bukan backup StockPilot');
    this.set(data);
    return true;
  }
};