/* ============================================================
   RentFlow — Catalog Pages
   catalog/items · catalog/categories · catalog/customers
   ============================================================ */

const CatalogPage = {

  /* ---------- catalog/items ---------- */
  items() {
    const items = DB.get('items');
    const kategoris = DB.get('kategoris');

    const totalStock = items.reduce((s, i) => s + i.stock, 0);
    const availCount = items.filter(i => i.status === 'available').length;
    const rentedCount = items.filter(i => i.status === 'rented').length;
    const maintCount = items.filter(i => i.status === 'maintenance').length;

    const chips = [
      { label: 'Semua', count: items.length, filter: null },
      { label: 'Tersedia', count: availCount, filter: 'available' },
      { label: 'Disewa', count: rentedCount, filter: 'rented' },
      { label: 'Perawatan', count: maintCount, filter: 'maintenance' }
    ];

    const statusFilter = State.get('filterStatus');
    const catFilter = State.get('filterCategory');

    const filtered = items.filter(i => {
      if (statusFilter && i.status !== statusFilter) return false;
      if (catFilter && i.categoryId !== catFilter) return false;
      return true;
    });

    return h('div', null, [
      PageHead({
        title: 'Rental Items',
        subtitle: DB.totalItems() + ' item rental dalam ' + kategoris.length + ' kategori',
        icon: I.box(),
        action: h('button', { class: 'btn btn-soft', onclick: () => Toast.show('Tambah item tersedia di versi premium', 'info') }, [I.plus(), h('span', null, 'Tambah Item')])
      }),

      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Item'), h('div', { class: 'sc-value' }, fmtNum(items.length)), h('div', { class: 'sc-sub' }, 'terdaftar')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Stok'), h('div', { class: 'sc-value' }, fmtNum(totalStock)), h('div', { class: 'sc-sub' }, 'unit semua item')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Tersedia'), h('div', { class: 'sc-value', style: { color: 'var(--success)' } }, fmtNum(availCount)), h('div', { class: 'sc-sub' }, 'siap disewa')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Perawatan'), h('div', { class: 'sc-value', style: { color: 'var(--warning)' } }, fmtNum(maintCount)), h('div', { class: 'sc-sub' }, 'perlu service')])
      ]),

      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', marginTop: '16px' } },
        chips.map(c => h('button', {
          class: 'chip' + (statusFilter === c.filter ? ' active' : ''),
          onclick: () => State.set({ filterStatus: statusFilter === c.filter ? null : c.filter })
        }, c.label + ' (' + c.count + ')'))
      ),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' } },
        kategoris.map(cat => h('button', {
          class: 'cat-filter-chip' + (catFilter === cat.id ? ' active' : ''),
          onclick: () => State.set({ filterCategory: catFilter === cat.id ? null : cat.id })
        }, [
          h('span', { class: 'cf-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
          h('span', null, cat.name)
        ]))
      ),

      Section({
        title: 'Daftar Item Rental' + (filtered.length !== items.length ? ' (' + filtered.length + ')' : ''),
        icon: I.box(),
        bodyPad: false,
        children: DataTable({
          columns: [
            { label: 'ID', type: 'id', sortKey: 'id' },
            { label: 'Item', type: 'main', sortKey: 'name' },
            { label: 'Kategori', type: 'text', sortKey: 'categoryId' },
            { label: 'Harga / Hari', type: 'amount', align: 'right', sortKey: 'pricePerDay' },
            { label: 'Deposit', type: 'amount', align: 'right', sortKey: 'deposit' },
            { label: 'Stok', type: 'text', sortKey: 'stock' },
            { label: 'Lokasi', type: 'text', sortKey: 'lokasi' },
            { label: 'Status', type: 'text', sortKey: 'status' }
          ],
          rows: filtered.map(item => {
            const cat = DB.kategoriById(item.categoryId);
            return [
              item.id,
              [h('strong', null, item.name), h('span', null, '⭐ ' + item.rate + ' · ' + item.timesRented + '× disewa')],
              h('span', { class: 'cat-chip' }, [h('span', { class: 'cat-chip-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)), h('span', null, cat.name)]),
              fmtIDR(item.pricePerDay),
              fmtIDR(item.deposit),
              item.stock + ' unit',
              item.lokasi,
              StatusPill(item.status)
            ];
          }),
          initialSort: 'pricePerDay',
          initialSortDir: 'desc'
        })
      })
    ]);
  },

  /* ---------- catalog/categories ---------- */
  categories() {
    const kategoris = DB.get('kategoris');
    const items = DB.get('items');

    return h('div', null, [
      PageHead({
        title: 'Categories',
        subtitle: kategoris.length + ' kategori item rental',
        icon: I.grid(),
        action: h('button', { class: 'btn btn-soft', onclick: () => Toast.show('Tambah kategori tersedia di versi premium', 'info') }, [I.plus(), h('span', null, 'Tambah Kategori')])
      }),
      h('div', { class: 'cat-grid' },
        kategoris.map(cat => {
          const catItems = items.filter(i => i.categoryId === cat.id);
          const avail = catItems.filter(i => i.status === 'available').length;
          const totalValue = catItems.reduce((s, i) => s + i.pricePerDay, 0);
          const avgPrice = catItems.length ? Math.round(totalValue / catItems.length) : 0;

          return h('div', { class: 'cat-card' }, [
            h('div', { class: 'cat-card-head' }, [
              h('div', { class: 'cc-big-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
              h('div', null, [
                h('strong', null, cat.name),
                h('span', null, cat.id.toUpperCase())
              ])
            ]),
            h('div', { class: 'cat-card-stats' }, [
              h('div', { class: 'ccs-cell' }, [h('strong', null, String(catItems.length)), h('span', null, 'Item')]),
              h('div', { class: 'ccs-cell' }, [h('strong', null, String(avail)), h('span', null, 'Tersedia')]),
              h('div', { class: 'ccs-cell' }, [h('strong', null, fmtIDR(avgPrice)), h('span', null, 'Rata-rata')])
            ]),
            h('button', {
              class: 'btn btn-sm btn-ghost btn-block',
              onclick: () => {
                State.set({ filterCategory: cat.id });
                Router.navigate('catalog/items');
              }
            }, 'Lihat Item →')
          ]);
        })
      )
    ]);
  },

  /* ---------- catalog/customers ---------- */
  customers() {
    const customers = DB.get('customers');
    const active = customers.filter(c => c.active).length;
    const topCusts = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 6);

    return h('div', null, [
      PageHead({
        title: 'Customers',
        subtitle: active + ' pelanggan aktif dari ' + customers.length + ' total pelanggan',
        icon: I.users(),
        action: h('button', { class: 'btn btn-soft', onclick: () => Toast.show('Tambah pelanggan tersedia di versi premium', 'info') }, [I.plus(), h('span', null, 'Tambah Customer')])
      }),
      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Pelanggan'), h('div', { class: 'sc-value' }, fmtNum(customers.length)), h('div', { class: 'sc-sub' }, 'terdaftar')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Aktif'), h('div', { class: 'sc-value', style: { color: 'var(--success)' } }, fmtNum(active)), h('div', { class: 'sc-sub' }, 'masih aktif')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Rental'), h('div', { class: 'sc-value' }, fmtNum(customers.reduce((s, c) => s + c.totalRental, 0))), h('div', { class: 'sc-sub' }, 'transaksi terkumpul')])
      ]),

      h('div', { style: { marginTop: '16px' } }, h('div', { class: 'grid-2col' },
        topCusts.map(c => h('div', { class: 'customer-card' }, [
          Avatar({ name: c.name }),
          h('div', { style: { flex: 1, minWidth: 0 } }, [
            h('strong', null, c.name),
            h('span', null, c.jenis + ' · ' + c.phone)
          ]),
          h('div', { class: 'cust-value' }, [
            h('strong', null, fmtIDR(c.totalSpent)),
            h('span', null, c.totalRental + '× rental')
          ]),
          StatusPill(c.active ? 'available' : 'returned')
        ]))
      )),

      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Semua Pelanggan',
        icon: I.users(),
        bodyPad: false,
        children: DataTable({
          columns: [
            { label: 'ID', type: 'id', sortKey: 'id' },
            { label: 'Nama', type: 'main', sortKey: 'name' },
            { label: 'Tipe', type: 'text', sortKey: 'jenis' },
            { label: 'Kontak', type: 'text' },
            { label: 'Total Rental', type: 'text', sortKey: 'totalRental' },
            { label: 'Total Belanja', type: 'amount', align: 'right', sortKey: 'totalSpent' },
            { label: 'Status', type: 'text' }
          ],
          rows: customers.map(c => [
            c.id,
            c.name,
            c.jenis,
            c.phone + ' · ' + c.email,
            c.totalRental + '×',
            fmtIDR(c.totalSpent),
            StatusPill(c.active ? 'available' : 'returned')
          ]),
          initialSort: 'totalSpent',
          initialSortDir: 'desc'
        })
      }))
    ]);
  }
};