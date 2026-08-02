/* ============================================================
   RentFlow — Database Service
   - Persist ke LocalStorage (key: rentflow_db_v1)
   - Query helpers: items, customers, rentals, returns, stats
   - Sinkronisasi status item berdasarkan rental aktif
   ============================================================ */

const DB = (() => {
  const KEY = 'rentflow_db_v1';
  let store = null;

  /* ---------- Rebuild item status dari rental aktif ---------- */
  function syncItemStatus() {
    const activeRentals = store.rentals.filter(r => r.status === 'rented' || r.status === 'overdue' || r.status === 'reserved');
    const activeCounts = {};
    for (const r of activeRentals) {
      activeCounts[r.itemId] = (activeCounts[r.itemId] || 0) + 1;
    }

    // Reset semua jadi available / maintenance random kecil
    for (const item of store.items) {
      const active = activeCounts[item.id] || 0;
      const stock = item.stock || 1;
      if (active >= stock) {
        item.status = 'rented';
      } else if (rng() < 0.06) {
        item.status = 'maintenance';
      } else {
        item.status = 'available';
      }
    }
  }

  /* ---------- Seed payload clone ---------- */
  function seedPayload() {
    return {
      kategoris: SEED_PAYLOAD.kategoris.map(k => ({ ...k })),
      items: SEED_PAYLOAD.items.map(i => ({ ...i })),
      customers: SEED_PAYLOAD.customers.map(c => ({ ...c })),
      rentals: SEED_PAYLOAD.rentals.map(r => ({ ...r })),
      returns: SEED_PAYLOAD.returns.map(r => ({ ...r }))
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        store = JSON.parse(raw);
        const payload = seedPayload();
        for (const k of Object.keys(payload)) {
          if (!store[k]) store[k] = payload[k];
        }
        syncItemStatus();
        return;
      }
    } catch (e) { /* ignore */ }
    store = seedPayload();
    syncItemStatus();
    save();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
  }

  function reset() {
    store = seedPayload();
    syncItemStatus();
    save();
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */
  return {
    init() { load(); },

    get(key) { return store[key]; },

    /* ---------- Kategori ---------- */
    kategoriById(id) {
      return store.kategoris.find(k => k.id === id) || store.kategoris[0];
    },

    /* ---------- Items ---------- */
    itemsByStatus(status) {
      return store.items.filter(i => i.status === status);
    },

    itemsByCategory(catId) {
      return store.items.filter(i => i.categoryId === catId);
    },

    availableItems() {
      return store.items.filter(i => i.status === 'available' || i.status === 'maintenance');
    },

    itemById(id) {
      return store.items.find(i => i.id === id);
    },

    searchItems(term) {
      const q = String(term || '').toLowerCase().trim();
      if (!q) return store.items;
      return store.items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
      );
    },

    updateItemStock(id, delta) {
      const it = this.itemById(id);
      if (it) {
        it.stock = Math.max(0, (it.stock || 1) + delta);
        save();
      }
    },

    /* ---------- Customers ---------- */
    customerById(id) {
      return store.customers.find(c => c.id === id);
    },

    searchCustomers(term) {
      const q = String(term || '').toLowerCase().trim();
      if (!q) return store.customers;
      return store.customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.phone.includes(term)
      );
    },

    /* ---------- Rentals ---------- */
    rentalsByStatus(status) {
      return store.rentals.filter(r => r.status === status);
    },

    todayRentals() {
      const today = todayKey();
      return store.rentals.filter(r => r.startDate === today || r.endDate === today);
    },

    activeRentals() {
      return store.rentals.filter(r => r.status === 'rented' || r.status === 'overdue');
    },

    overdueRentals() {
      return store.rentals.filter(r => r.status === 'overdue' || (r.status === 'rented' && r.endDate < todayKey()));
    },

    rentalById(id) {
      return store.rentals.find(r => r.id === id);
    },

    searchRentals(term) {
      const q = String(term || '').toLowerCase().trim();
      if (!q) return store.rentals;
      return store.rentals.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q)
      );
    },

    recentRentals(n = 8) {
      return [...store.rentals]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, n);
    },

    nextRentalId() {
      let max = 0;
      for (const r of store.rentals) {
        const n = parseInt(r.id.replace('RNT-', ''), 10);
        if (n > max) max = n;
      }
      return 'RNT-' + String(max + 1);
    },

    addRental(rental) {
      store.rentals.unshift(rental);
      const item = this.itemById(rental.itemId);
      if (item) {
        item.timesRented = (item.timesRented || 0) + 1;
        item.status = 'rented';
      }
      const cust = this.customerById(rental.customerId);
      if (cust) {
        cust.totalRental = (cust.totalRental || 0) + 1;
        cust.totalSpent = (cust.totalSpent || 0) + rental.total;
      }
      save();
    },

    updateRentalStatus(id, status) {
      const r = store.rentals.find(x => x.id === id);
      if (!r) return;
      r.status = status;
      if (status === 'returned') {
        r.paid = true;
        const item = this.itemById(r.itemId);
        if (item) item.status = 'available';
        // Auto-masuk ke returns
        store.returns.unshift({
          id: 'RET-' + String(1000 + store.returns.length + 1),
          rentalId: r.id,
          itemId: r.itemId,
          customerId: r.customerId,
          returnedDate: todayKey(),
          condition: 'Baik',
          lateDays: r.lateDays,
          denda: r.denda,
          depositReturned: r.deposit,
          note: 'Dikembalikan on-time',
          createdAt: new Date().toISOString()
        });
      }
      save();
    },

    /* ---------- Returns ---------- */
    recentReturns(n = 8) {
      return [...store.returns]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, n);
    },

    /* ---------- Stats ---------- */
    totalItems() { return store.items.length; },
    totalCustomers() { return store.customers.length; },
    totalRentals() { return store.rentals.length; },
    totalReturns() { return store.returns.length; },

    totalRevenue() {
      return store.rentals
        .filter(r => r.paid && r.status === 'returned')
        .reduce((s, r) => s + r.total, 0);
    },

    revenueToday() {
      const today = todayKey();
      return store.rentals
        .filter(r => r.paid && (r.startDate === today || r.createdAt.slice(0, 10) === today))
        .reduce((s, r) => s + r.subtotal, 0);
    },

    revenueMonth() {
      const month = new Date().toISOString().slice(0, 7);
      return store.rentals
        .filter(r => r.paid && r.createdAt.slice(0, 7) === month)
        .reduce((s, r) => s + r.total, 0);
    },

    revenueByDay(days = 7) {
      const out = [];
      for (let i = days - 1; i >= 0; i--) {
        const key = mockDateKey(i);
        const total = store.rentals
          .filter(r => r.createdAt.slice(0, 10) === key && r.paid)
          .reduce((s, r) => s + r.total, 0);
        const d = new Date(key);
        out.push({
          label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          total
        });
      }
      return out;
    },

    popularItems(n = 5) {
      const counts = {};
      for (const r of store.rentals) {
        if (r.status === 'returned') {
          counts[r.itemName] = (counts[r.itemName] || 0) + 1;
        }
      }
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, n);
    },

    /* ---------- Notifications ---------- */
    notifications() {
      const list = [];
      const overdue = this.overdueRentals().length;
      if (overdue > 0) list.push({ dot: '#DC2626', txt: overdue + ' rental terlambat dikembalikan', time: 'Perlu tindakan' });
      const rented = this.rentalsByStatus('rented').length;
      if (rented > 0) list.push({ dot: '#D97706', txt: rented + ' rental sedang berjalan', time: 'Aktif' });
      const avail = this.itemsByStatus('available').length;
      list.push({ dot: '#16A34A', txt: avail + ' item tersedia untuk disewa', time: 'Siap rental' });
      return list;
    },

    /* ---------- Revenue summary for dashboard ---------- */
    revenueSummary() {
      const today = this.revenueToday();
      const month = this.revenueMonth();
      const total = this.totalRevenue();
      const monthRentals = store.rentals.filter(r => r.createdAt.slice(0, 7) === new Date().toISOString().slice(0, 7)).length;
      return {
        today,
        month,
        total,
        avgPerRental: monthRentals ? Math.round(month / monthRentals) : 0,
        rentalCountMonth: monthRentals
      };
    },

    reset
  };
})();