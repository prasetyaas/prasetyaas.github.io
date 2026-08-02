/* ============================================================
   FreshWash — Data Layer
   Seed data: 8 services, 75 customers, 150 orders, 500 transaksi
   Data dibuat programmatically (deterministik) dalam satu store.
   ============================================================ */

const DB = (() => {
  /* ---------- Seed: Layanan (8) ---------- */
  const services = [
    { id: 'svc-1',  name: 'Cuci Reguler',       desc: 'Cuci + setrika kilat',      price: 12000, duration: '± 2 hari', icon: 'washer', bg: '#DBEAFE', color: '#1D4ED8', popular: true },
    { id: 'svc-2',  name: 'Cuci Express',       desc: 'Selesai dalam 6 jam',       price: 25000, duration: '± 6 jam',  icon: 'clock',  bg: '#FEF3C7', color: '#B45309', popular: true },
    { id: 'svc-3',  name: 'Cuci + Setrika',     desc: 'Cuci bersih plus setrika',  price: 18000, duration: '± 3 hari', icon: 'check',  bg: '#DCFCE7', color: '#15803D' },
    { id: 'svc-4',  name: 'Cuci Karpet',        desc: 'Karpet & permadani besar',  price: 45000, duration: '± 4 hari', icon: 'layers', bg: '#EDE9FE', color: '#6D28D9' },
    { id: 'svc-5',  name: 'Setrika Saja',       desc: 'Setrika rapi tanpa cuci',   price: 9000,  duration: '± 1 hari', icon: 'wind',   bg: '#FFE4E6', color: '#BE123C' },
    { id: 'svc-6',  name: 'Laundry Kiloan Premium', desc: 'Perawatan wangi & lembut', price: 15000, duration: '± 2 hari', icon: 'star',   bg: '#FEF9C3', color: '#A16207', popular: true },
    { id: 'svc-7',  name: 'Bedcover & Selimut',  desc: 'Tebal sekalipun tetap bersih', price: 35000, duration: '± 3 hari', icon: 'home',   bg: '#FCE7F3', color: '#BE185D' },
    { id: 'svc-8',  name: 'Cuci Sepatu',        desc: 'Sepatu bersih seperti baru', price: 30000, duration: '± 2 hari', icon: 'truck',  bg: '#DBEAFE', color: '#0369A1' }
  ];

  /* ---------- Seed: Nama pelanggan (75) ---------- */
  const firstNames = ['Budi', 'Siti', 'Agus', 'Dewi', 'Rudi', 'Maya', 'Andi', 'Rina', 'Joko', 'Sri', 'Eko', 'Lina', 'Hendra', 'Fitri', 'Bayu', 'Nina', 'Dedi', 'Putri', 'Yoga', 'Ayu', 'Fajar', 'Rani', 'Dika', 'Sari', 'Rizal', 'Mega', 'Wawan', 'Intan', 'Gita', 'Adit', 'Tika', 'Rama', 'Vina', 'Dimas', 'Salsa', 'Rino', 'Kiki', 'Sinta', 'Bagus', 'Laila'];
  const lastNames = ['Santoso', 'Wijaya', 'Pratama', 'Handayani', 'Saputra', 'Lestari', 'Hidayat', 'Nugroho', 'Anggraini', 'Firmansyah', 'Kusuma', 'Rahayu', 'Setiawan', 'Melati', 'Utami', 'Purnama', 'Hartono', 'Permata', 'Yulianto', 'Maulana', 'Suryani', 'Ramadhan', 'Azzahra', 'Wulandari', 'Rahmawati', 'Putra', 'Cahyani', 'Siregar', 'Nasution', 'Halim'];

  const customers = [];
  for (let i = 1; i <= 75; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    customers.push({
      id: 'cst-' + String(i).padStart(3, '0'),
      name: fn + ' ' + ln,
      phone: '08' + String(1000000000 + Math.floor(Math.random() * 8999999999)),
      address: ['Jl. Melati No.' + i, 'Jl. Anggrek No.' + (i + 5), 'Jl. Kenanga No.' + (i * 2), 'Jl. Flamboyan No.' + (i + 3)][i % 4],
      totalOrders: Math.floor(1 + Math.random() * 12),
      totalSpent: 0,
      joined: `2025-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
      active: i % 9 !== 0
    });
  }

  /* ---------- Helpers ---------- */
  const d = (dayOffset, hour = 10, min = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(hour, min, 0, 0);
    return date.toISOString();
  };

  /* ---------- Seed: Orders (150) ---------- */
  const ORDER_ID_PREFIX = 'FW-';
  const orders = [];

  // Distribusi status (total 150)
  // waiting ~25, washing ~35, drying ~25, ready ~30, delivered ~35
  const statusPool = [
    ...Array.from({ length: 25 }, () => 'waiting'),
    ...Array.from({ length: 35 }, () => 'washing'),
    ...Array.from({ length: 25 }, () => 'drying'),
    ...Array.from({ length: 30 }, () => 'ready'),
    ...Array.from({ length: 35 }, () => 'delivered')
  ];

  const methods = ['cod', 'transfer'];
  const types = ['reguler', 'express', 'eco'];

  // Pastikan customer punya totalSpent terhitung
  for (let i = 1; i <= 150; i++) {
    const svc = services[Math.floor(Math.random() * services.length)];
    const cust = customers[Math.floor(Math.random() * customers.length)];
    const weight = Math.round((1 + Math.random() * 8) * 10) / 10;
    const qty = Math.max(1, Math.round(weight / 2));
    const amount = svc.price * Math.round(weight);
    const status = statusPool[Math.floor(Math.random() * statusPool.length)];
    const tipe = svc.id === 'svc-2' ? 'express' : types[Math.floor(Math.random() * types.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];

    // createdAt: baru-baru ini untuk status aktif, lebih lama untuk delivered
    const dayOffset = status === 'delivered' ? Math.floor(3 + Math.random() * 12) : Math.floor(Math.random() * 3);
    const createdAt = d(dayOffset, 8 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60));

    orders.push({
      id: ORDER_ID_PREFIX + String(1000 + i),
      customerId: cust.id,
      customerName: cust.name,
      serviceId: svc.id,
      serviceName: svc.name,
      weight,
      qty,
      amount,
      status,
      type: tipe,
      payment: method,
      paid: method === 'transfer' || (status === 'delivered' && Math.random() > 0.3),
      items: `Pakaian ${Math.round(qty)} pcs · ${weight} kg`,
      pickupDate: dayOffset === 0 ? d(0, 17, 0).slice(0, 10) : d(dayOffset, 17, 0).slice(0, 10),
      createdAt,
      updatedAt: d(dayOffset, 14 + Math.floor(Math.random() * 6))
    });

    cust.totalSpent += amount;
    cust.totalOrders += 0; // sudah dihitung di atas
  }

  /* ---------- Seed: Transactions (500) ---------- */
  const transactions = [];
  const tDesc = ['Pembayaran order', 'Pembayaran COD', 'Transfer bank', 'Pembayaran langganan', 'Top up saldo'];
  const tMethod = ['cash', 'transfer', 'qris', 'ewallet'];
  const tType = ['in', 'out'];

  for (let i = 1; i <= 500; i++) {
    const day = Math.floor(Math.random() * 60);
    const amount = Math.round((50000 + Math.random() * 450000) / 1000) * 1000;
    const isIn = Math.random() > 0.2;
    transactions.push({
      id: 'TRX-' + String(10000 + i),
      ref: 'FW-' + String(1000 + Math.floor(Math.random() * 150)),
      desc: tDesc[Math.floor(Math.random() * tDesc.length)],
      method: tMethod[Math.floor(Math.random() * tMethod.length)],
      type: isIn ? 'in' : 'out',
      amount,
      createdAt: d(day, 9 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60))
    });
  }

  /* ---------- Persist (localStorage agar state hidup antar reload) ---------- */
  const KEY = 'freshwash_db_v1';
  let store = null;

  function seedPayload() {
    return { services, customers, orders, transactions };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        store = JSON.parse(raw);
        // Pastikan semua kunci ada
        const payload = seedPayload();
        for (const k of Object.keys(payload)) {
          if (!store[k]) store[k] = payload[k];
        }
        return;
      }
    } catch (e) { /* ignore */ }
    store = seedPayload();
    save();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }

  function reset() {
    store = seedPayload();
    save();
  }

  /* ---------- Public API ---------- */
  return {
    init() { load(); },

    get(key) { return store[key]; },

    // ---- Orders ----
    ordersByStatus(status) {
      return store.orders.filter(o => o.status === status);
    },

    todayOrders() {
      const today = todayKey();
      return store.orders.filter(o => (o.createdAt || '').slice(0, 10) === today || (o.pickupDate || '').slice(0, 10) === today);
    },

    recentOrders(n = 6) {
      return [...store.orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, n);
    },

    searchOrders(term) {
      const q = String(term).toLowerCase().trim();
      if (!q) return store.orders;
      return store.orders.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.serviceName.toLowerCase().includes(q)
      );
    },

    nextOrderId() {
      let max = 0;
      for (const o of store.orders) {
        const n = parseInt(o.id.replace(ORDER_ID_PREFIX, ''), 10);
        if (n > max) max = n;
      }
      return ORDER_ID_PREFIX + String(max + 1);
    },

    addOrder(order) {
      store.orders.unshift(order);
      save();
    },

    updateOrderStatus(id, status) {
      const o = store.orders.find(x => x.id === id);
      if (o) {
        o.status = status;
        o.updatedAt = new Date().toISOString();
        if (status === 'delivered') o.paid = true;
        save();
      }
    },

    // ---- Stats ----
    totalOrders() { return store.orders.length; },
    totalCustomers() { return store.customers.length; },
    totalServices() { return store.services.length; },
    totalTransactions() { return store.transactions.length; },

    revenueToday() {
      const today = todayKey();
      return store.orders
        .filter(o => (o.createdAt || '').slice(0, 10) === today)
        .reduce((s, o) => s + o.amount, 0);
    },

    revenueMonth() {
      const month = new Date().toISOString().slice(0, 7);
      return store.orders
        .filter(o => (o.createdAt || '').slice(0, 7) === month)
        .reduce((s, o) => s + o.amount, 0);
    },

    avgOrderValue() {
      return store.orders.length ? Math.round(this.revenueToday() / Math.max(store.orders.length, 1) * 30) : 0;
    },

    popularServices() {
      const counts = {};
      for (const o of store.orders) {
        const name = o.serviceName;
        counts[name] = (counts[name] || 0) + 1;
      }
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },

    // ---- Recent transactions ----
    recentTransactions(n = 6) {
      return [...store.transactions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, n);
    },

    totalRevenue() {
      return store.transactions
        .filter(t => t.type === 'in')
        .reduce((s, t) => s + t.amount, 0);
    },

    totalExpense() {
      return store.transactions
        .filter(t => t.type === 'out')
        .reduce((s, t) => s + t.amount, 0);
    },

    // ---- Notifications ----
    notifications() {
      const waiting = this.ordersByStatus('waiting').length;
      const ready = this.ordersByStatus('ready').length;
      const notifs = [];
      if (waiting > 0) notifs.push({ dot: '#D97706', txt: waiting + ' pesanan menunggu diproses', time: 'Baru saja' });
      if (ready > 0) notifs.push({ dot: '#16A34A', txt: ready + ' pesanan siap diambil / diantar', time: '1 jam lalu' });
      const unpaid = store.orders.filter(o => !o.paid && o.status !== 'waiting').length;
      if (unpaid > 0) notifs.push({ dot: '#EF4444', txt: unpaid + ' pembayaran belum lunas', time: '3 jam lalu' });
      return notifs;
    },

    reset
  };
})();