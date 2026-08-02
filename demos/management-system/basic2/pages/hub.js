/* ============================================================
   RentFlow — Rental Hub Pages
   hub/overview · hub/today · hub/available · hub/calendar
   + RentalDetail modal & NewRental modal (shared)
   ============================================================ */

/* ============================================================
   SHARED MODALS
   ============================================================ */

/* ---------- Rental Detail Modal ---------- */
function openRentalDetail(rental) {
  const cat = DB.kategoriById(rental.categoryId);
  const cust = DB.customerById(rental.customerId);

  const timeline = h('div', { class: 'rental-timeline' }, [
    h('div', { class: 'rt-node done' }, [h('span', { class: 'rt-dot' }, '✓'), h('span', null, 'Pemesanan')]),
    h('div', { class: 'rt-node ' + (rental.status === 'returned' ? 'done' : rental.status === 'overdue' ? 'danger' : 'current') }, [h('span', { class: 'rt-dot' }, rental.status === 'returned' ? '✓' : '●'), h('span', null, rental.status === 'returned' ? 'Selesai' : 'Berjalan')]),
    h('div', { class: 'rt-node ' + (rental.status === 'returned' ? 'done' : '') }, [h('span', { class: 'rt-dot' }, rental.status === 'returned' ? '✓' : '○'), h('span', null, 'Pengembalian')])
  ]);

  const body = h('div', null, [
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' } }, [
      h('strong', { style: { fontSize: '14px' } }, rental.id),
      StatusPill(rental.status)
    ]),
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' } }, [
      h('div', { class: 'rt-item-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
      h('div', null, [
        h('strong', { style: { fontSize: '14px', display: 'block' } }, rental.itemName),
        h('span', { style: { fontSize: '12px', color: 'var(--ink-3)' } }, cat.name + ' · ' + rental.id)
      ])
    ]),
    timeline,
    h('div', { class: 'rt-grid' }, [
      h('div', { class: 'rt-cell' }, [h('span', null, 'Pelanggan'), h('strong', null, rental.customerName)]),
      h('div', { class: 'rt-cell' }, [h('span', null, 'Durasi'), h('strong', null, rental.duration + ' hari')]),
      h('div', { class: 'rt-cell' }, [h('span', null, 'Mulai'), h('strong', null, fmtDate(rental.startDate))]),
      h('div', { class: 'rt-cell' }, [h('span', null, 'Kembali'), h('strong', null, fmtDate(rental.endDate))]),
      h('div', { class: 'rt-cell' }, [h('span', null, 'Pembayaran'), h('strong', null, rental.payment)]),
      h('div', { class: 'rt-cell' }, [h('span', null, 'Status Bayar'), h('strong', null, rental.paid ? 'Lunas' : 'Belum')])
    ]),
    h('div', { class: 'rt-cost' }, [
      h('div', { class: 'rt-cost-row' }, [h('span', null, 'Subtotal (' + rental.duration + ' hari × ' + fmtIDR(rental.pricePerDay) + ')'), h('strong', null, fmtIDR(rental.subtotal))]),
      h('div', { class: 'rt-cost-row' }, [h('span', null, 'Denda keterlambatan'), h('strong', { style: { color: 'var(--danger)' } }, fmtIDR(rental.denda))]),
      h('div', { class: 'rt-cost-row total' }, [h('span', null, 'Total'), h('strong', null, fmtIDR(rental.total))]),
      h('div', { class: 'rt-cost-row' }, [h('span', null, 'Deposit'), h('strong', null, fmtIDR(rental.deposit))])
    ])
  ]);

  const footer = [
    h('button', { class: 'btn btn-ghost', onclick: () => Modal.close() }, 'Tutup'),
    (rental.status === 'rented' || rental.status === 'overdue')
      ? h('button', {
          class: 'btn btn-success',
          onclick: () => {
            ConfirmDialog({
              title: 'Proses Pengembalian',
              message: 'Tandai ' + rental.itemName + ' telah dikembalikan? Deposit ' + fmtIDR(rental.deposit) + ' akan dikembalikan ke pelanggan.',
              confirmLabel: 'Ya, Kembalikan',
              onConfirm: () => {
                DB.updateRentalStatus(rental.id, 'returned');
                Modal.close();
                Toast.show(rental.id + ' berhasil dikembalikan 🎉', 'success');
              }
            });
          }
        }, [I.check(), h('span', null, 'Proses Return')])
      : null
  ];

  Modal.open({ title: 'Detail Rental', body, footer, size: 'lg' });
}

/* ---------- New Rental Modal ---------- */
function openNewRentalModal() {
  const draft = {
    itemId: null,
    customerId: DB.get('customers')[0].id,
    days: 2,
    startOffset: 0
  };

  const items = DB.get('items');
  const customers = DB.get('customers');
  const defaultItem = items.find(i => i.status === 'available') || items[0];
  draft.itemId = defaultItem.id;

  function compute() {
    const item = DB.itemById(draft.itemId) || items[0];
    const cust = DB.customerById(draft.customerId) || customers[0];
    const startDate = addDays(todayKey(), draft.startOffset);
    const endDate = addDays(startDate, draft.days);
    const subtotal = item.pricePerDay * draft.days;
    return { item, cust, startDate, endDate, subtotal };
  }

  /* ---------- Refresh modal body & footer ---------- */
  function refresh() {
    const bodyEl = document.querySelector('.modal-body');
    const footEl = document.querySelector('.modal-foot');
    if (!bodyEl || !footEl) return;

    const { item, cust, startDate, endDate, subtotal } = compute();
    const cat = DB.kategoriById(item.categoryId);

    const body = h('div', null, [
      h('div', { class: 'form-grid' }, [
        h('div', { class: 'full' }, [
          h('label', { class: 'form-label' }, 'Item Rental'),
          h('select', { class: 'form-control', onchange: (e) => { draft.itemId = e.target.value; refresh(); } },
            items.map(i => h('option', { value: i.id, selected: i.id === draft.itemId }, i.name + ' — ' + fmtIDR(i.pricePerDay) + '/hari')))
        ]),
        h('div', { class: 'full' }, [
          h('label', { class: 'form-label' }, 'Pelanggan'),
          h('select', { class: 'form-control', onchange: (e) => { draft.customerId = e.target.value; refresh(); } },
            customers.map(c => h('option', { value: c.id, selected: c.id === draft.customerId }, c.name)))
        ]),
        h('div', null, [
          h('label', { class: 'form-label' }, 'Durasi (hari)'),
          h('input', { class: 'form-control', type: 'number', min: '1', max: '30', value: draft.days,
            oninput: (e) => { draft.days = Math.max(1, parseInt(e.target.value) || 1); refresh(); } })
        ]),
        h('div', null, [
          h('label', { class: 'form-label' }, 'Mulai'),
          h('select', { class: 'form-control', onchange: (e) => { draft.startOffset = parseInt(e.target.value, 10); refresh(); } },
            [h('option', { value: '0', selected: draft.startOffset === 0 }, 'Hari ini'),
             h('option', { value: '1', selected: draft.startOffset === 1 }, 'Besok'),
             h('option', { value: '2', selected: draft.startOffset === 2 }, '2 hari lagi')])
        ])
      ]),
      h('div', { class: 'rental-summary' }, [
        h('div', { class: 'rs-item' }, [
          h('div', { class: 'rs-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
          h('div', null, [
            h('strong', null, item.name),
            h('span', null, cat.name + ' · Deposit ' + fmtIDR(item.deposit))
          ])
        ]),
        h('div', { class: 'rs-cost' }, [
          h('div', null, [h('span', null, fmtIDR(item.pricePerDay) + ' × ' + draft.days + ' hari'), h('strong', null, fmtIDR(subtotal))]),
          h('div', { class: 'rs-total' }, [h('span', null, 'Total Sewa'), h('strong', null, fmtIDR(subtotal))])
        ])
      ])
    ]);

    const footer = [
      h('button', { class: 'btn btn-ghost', onclick: () => Modal.close() }, 'Batal'),
      h('button', {
        class: 'btn btn-primary',
        onclick: () => {
          const id = DB.nextRentalId();
          DB.addRental({
            id,
            itemId: item.id,
            itemName: item.name,
            categoryId: item.categoryId,
            customerId: cust.id,
            customerName: cust.name,
            startDate,
            endDate,
            duration: draft.days,
            pricePerDay: item.pricePerDay,
            subtotal,
            deposit: item.deposit,
            lateDays: 0,
            denda: 0,
            total: subtotal,
            status: 'rented',
            payment: 'Transfer',
            paid: false,
            note: 'Rental ' + item.name + ' oleh ' + cust.name,
            createdAt: new Date().toISOString()
          });
          Modal.close();
          Toast.show(id + ' berhasil dibuat 🎉', 'success');
        }
      }, 'Simpan Rental')
    ];

    bodyEl.innerHTML = '';
    bodyEl.appendChild(body);
    footEl.innerHTML = '';
    footEl.appendChild(Frag(...footer));
  }

  /* ---------- Initial render ---------- */
  const { item, cust, startDate, endDate, subtotal } = compute();
  const cat = DB.kategoriById(item.categoryId);

  const body = h('div', null, [
    h('div', { class: 'form-grid' }, [
      h('div', { class: 'full' }, [
        h('label', { class: 'form-label' }, 'Item Rental'),
        h('select', { class: 'form-control', onchange: (e) => { draft.itemId = e.target.value; refresh(); } },
          items.map(i => h('option', { value: i.id, selected: i.id === draft.itemId }, i.name + ' — ' + fmtIDR(i.pricePerDay) + '/hari')))
      ]),
      h('div', { class: 'full' }, [
        h('label', { class: 'form-label' }, 'Pelanggan'),
        h('select', { class: 'form-control', onchange: (e) => { draft.customerId = e.target.value; refresh(); } },
          customers.map(c => h('option', { value: c.id, selected: c.id === draft.customerId }, c.name)))
      ]),
      h('div', null, [
        h('label', { class: 'form-label' }, 'Durasi (hari)'),
        h('input', { class: 'form-control', type: 'number', min: '1', max: '30', value: draft.days,
          oninput: (e) => { draft.days = Math.max(1, parseInt(e.target.value) || 1); refresh(); } })
      ]),
      h('div', null, [
        h('label', { class: 'form-label' }, 'Mulai'),
        h('select', { class: 'form-control', onchange: (e) => { draft.startOffset = parseInt(e.target.value, 10); refresh(); } },
          [h('option', { value: '0', selected: draft.startOffset === 0 }, 'Hari ini'),
           h('option', { value: '1', selected: draft.startOffset === 1 }, 'Besok'),
           h('option', { value: '2', selected: draft.startOffset === 2 }, '2 hari lagi')])
      ])
    ]),
    h('div', { class: 'rental-summary' }, [
      h('div', { class: 'rs-item' }, [
        h('div', { class: 'rs-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
        h('div', null, [
          h('strong', null, item.name),
          h('span', null, cat.name + ' · Deposit ' + fmtIDR(item.deposit))
        ])
      ]),
      h('div', { class: 'rs-cost' }, [
        h('div', null, [h('span', null, fmtIDR(item.pricePerDay) + ' × ' + draft.days + ' hari'), h('strong', null, fmtIDR(subtotal))]),
        h('div', { class: 'rs-total' }, [h('span', null, 'Total Sewa'), h('strong', null, fmtIDR(subtotal))])
      ])
    ])
  ]);

  const footer = [
    h('button', { class: 'btn btn-ghost', onclick: () => Modal.close() }, 'Batal'),
    h('button', {
      class: 'btn btn-primary',
      onclick: () => {
        const id = DB.nextRentalId();
        DB.addRental({
          id,
          itemId: item.id,
          itemName: item.name,
          categoryId: item.categoryId,
          customerId: cust.id,
          customerName: cust.name,
          startDate,
          endDate,
          duration: draft.days,
          pricePerDay: item.pricePerDay,
          subtotal,
          deposit: item.deposit,
          lateDays: 0,
          denda: 0,
          total: subtotal,
          status: 'rented',
          payment: 'Transfer',
          paid: false,
          note: 'Rental ' + item.name + ' oleh ' + cust.name,
          createdAt: new Date().toISOString()
        });
        Modal.close();
        Toast.show(id + ' berhasil dibuat 🎉', 'success');
      }
    }, 'Simpan Rental')
  ];

  Modal.open({ title: 'Buat Rental Baru', body, footer, size: 'lg' });
}

/* ============================================================
   HUB PAGES
   ============================================================ */
const HubPage = {

  /* ---------- hub/overview — dashboard 7 blok ---------- */
  overview() {
    const dateLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const active = DB.activeRentals();
    const overdue = DB.overdueRentals();
    const todayList = DB.todayRentals();
    const available = DB.itemsByStatus('available');
    const recent = DB.recentRentals(6);
    const revenue = DB.revenueSummary();
    const revenueChart = DB.revenueByDay(7);
    const popular = DB.popularItems(5);
    const maxPop = popular.length ? popular[0].count : 1;

    return h('div', { class: 'hub-dashboard' }, [

      /* ---- Blok 1: Greeting + Today's Rentals ---- */
      h('div', { class: 'hero-strip' }, [
        h('div', { class: 'hero-left' }, [
          h('div', { class: 'hero-emblem' }, I.brand()),
          h('div', null, [
            h('h2', null, greeting() + ', Admin 👋'),
            h('p', null, 'Ada ' + active.length + ' rental aktif dan ' + overdue.length + ' menunggu pengembalian hari ini.')
          ])
        ]),
        h('div', { class: 'hero-right' }, [
          h('div', { class: 'hero-date' }, [
            h('strong', null, dateLabel),
            h('span', null, 'Semua sistem berjalan normal ✓')
          ]),
          h('button', { class: 'btn btn-primary', onclick: () => openNewRentalModal() }, [I.plus(), h('span', null, 'New Rental')])
        ])
      ]),

      /* ---- Blok 2: Statistik Today's Rentals ---- */
      h('div', { class: 'hero-stats' }, [
        h('div', { class: 'hero-stat' }, [
          h('span', { class: 'hs-ic', style: { background: '#D1FAE5', color: '#047857' } }, I.key()),
          h('div', null, [h('strong', null, fmtNum(active.length)), h('span', null, 'Rental Aktif')])
        ]),
        h('div', { class: 'hero-stat' }, [
          h('span', { class: 'hs-ic', style: { background: '#DCFCE7', color: '#15803D' } }, I.checkCircle()),
          h('div', null, [h('strong', null, fmtNum(todayList.length)), h('span', null, 'Jadwal Hari Ini')])
        ]),
        h('div', { class: 'hero-stat' }, [
          h('span', { class: 'hs-ic', style: { background: '#FEE2E2', color: '#DC2626' } }, I.alert()),
          h('div', null, [h('strong', null, fmtNum(overdue.length)), h('span', null, 'Overdue')])
        ]),
        h('div', { class: 'hero-stat' }, [
          h('span', { class: 'hs-ic', style: { background: '#FEF3C7', color: '#B45309' } }, I.box()),
          h('div', null, [h('strong', null, fmtNum(available.length)), h('span', null, 'Item Tersedia')])
        ])
      ]),

      /* ---- Blok 3: Quick Action ---- */
      h('div', { class: 'section' }, [
        h('div', { class: 'section-head' }, [
          h('div', { class: 'section-title' }, [
            h('span', { class: 'st-ic' }, I.plus()),
            h('h3', null, 'Quick Action')
          ])
        ]),
        h('div', { class: 'section-body' }, [
          h('div', { class: 'quick-actions' }, [
            QuickAction({ label: 'New Rental', desc: 'Buat penyewaan baru', icon: I.plus(), bg: '#D1FAE5', color: '#047857', onClick: () => openNewRentalModal() }),
            QuickAction({ label: 'Process Return', desc: 'Terima pengembalian', icon: I.undo(), bg: '#DCFCE7', color: '#15803D', onClick: () => Router.navigate('ops/returns') }),
            QuickAction({ label: 'Cek Availability', desc: 'Lihat item tersedia', icon: I.box(), bg: '#FEF3C7', color: '#B45309', onClick: () => Router.navigate('hub/available') }),
            QuickAction({ label: 'Export Laporan', desc: 'Unduh data rental', icon: I.download(), bg: '#EDE9FE', color: '#6D28D9', onClick: () => Router.navigate('reports/export') })
          ])
        ])
      ]),

      h('div', { class: 'grid-main-right' }, [

        /* ---- Kolom kiri ---- */
        h('div', { class: 'stack' }, [

          /* Blok 4: Rental Calendar */
          Section({
            title: 'Rental Calendar',
            icon: I.calendar(),
            action: h('button', { class: 'btn btn-sm btn-ghost', onclick: () => Router.navigate('hub/calendar') }, 'Buka Kalender →'),
            children: CalendarWidget({
              onSelectDate: (key) => {
                const dayRentals = DB.get('rentals').filter(r => r.startDate === key || r.endDate === key);
                if (!dayRentals.length) { Toast.show('Tidak ada rental pada ' + fmtDate(key), 'info'); return; }
                const body = h('div', { class: 'stack' },
                  dayRentals.slice(0, 6).map(r => RentalRow(r, () => { Modal.close(); openRentalDetail(r); }))
                );
                Modal.open({ title: 'Rental: ' + fmtDate(key), body, footer: [h('button', { class: 'btn btn-ghost', onclick: () => Modal.close() }, 'Tutup')], size: 'lg' });
              }
            })
          }),

          /* Blok 5: Available Items */
          Section({
            title: 'Available Items',
            icon: I.box(),
            bodyPad: false,
            action: h('button', { class: 'btn btn-sm btn-ghost', onclick: () => Router.navigate('hub/available') }, 'Lihat Semua →'),
            children: available.length
              ? h('div', { class: 'avail-grid' },
                  available.slice(0, 6).map(item => {
                    const cat = DB.kategoriById(item.categoryId);
                    return h('div', { class: 'avail-card', onclick: () => Router.navigate('catalog/items') }, [
                      h('div', { class: 'av-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
                      h('div', { class: 'av-info' }, [
                        h('strong', null, item.name),
                        h('span', null, cat.name + ' · ' + item.stock + ' unit')
                      ]),
                      h('div', { class: 'av-price' }, fmtIDR(item.pricePerDay) + '/hari')
                    ]);
                  })
                )
              : EmptyState({ icon: I.box(), title: 'Tidak ada item tersedia', desc: 'Semua item sedang disewa' })
          })
        ]),

        /* ---- Kolom kanan ---- */
        h('div', { class: 'stack' }, [

          /* Blok 6: Revenue Summary */
          h('div', { class: 'revenue-card' }, [
            h('div', { class: 'rc-head' }, [
              h('div', null, [
                h('div', { class: 'rc-label' }, 'Revenue Summary'),
                h('div', { class: 'rc-value' }, fmtIDR(revenue.month)),
                h('div', { class: 'rc-sub' }, 'Pendapatan bulan ini · ' + revenue.rentalCountMonth + ' rental')
              ]),
              h('div', { class: 'rc-badge' }, I.trend())
            ]),
            MiniBarChart({ data: revenueChart }),
            h('div', { class: 'rc-stats' }, [
              h('div', { class: 'rc-stat' }, [h('strong', null, fmtIDR(revenue.today)), h('span', null, 'Hari ini')]),
              h('div', { class: 'rc-stat' }, [h('strong', null, fmtIDR(revenue.total)), h('span', null, 'Total pendapatan')]),
              h('div', { class: 'rc-stat' }, [h('strong', null, fmtIDR(revenue.avgPerRental)), h('span', null, 'Rata-rata / rental')])
            ])
          ]),

          /* Blok 7: Recent Transactions */
          Section({
            title: 'Recent Transactions',
            icon: I.activity(),
            bodyPad: false,
            action: h('button', { class: 'btn btn-sm btn-ghost', onclick: () => Router.navigate('ops/history') }, 'Semua →'),
            children: recent.length
              ? recent.slice(0, 5).map(r => RentalRow(r, () => openRentalDetail(r)))
              : EmptyState({ icon: I.activity(), title: 'Belum ada transaksi', desc: 'Rental baru akan muncul di sini' })
          }),

          /* Bonus: Popular Items */
          Section({
            title: 'Popular Rental Items',
            icon: I.star(),
            children: h('div', { class: 'item-rank' },
              popular.map((p, i) => h('div', { class: 'rank-item' }, [
                h('div', { class: 'rank-num' }, String(i + 1)),
                h('div', { class: 'rank-info' }, [
                  h('strong', null, p.name),
                  h('span', null, p.count + '× disewa'),
                  h('div', { class: 'rank-bar' }, h('div', { style: { width: Math.max(10, Math.round((p.count / maxPop) * 100)) + '%' } }))
                ])
              ]))
            )
          })
        ])
      ])
    ]);
  },

  /* ---------- hub/today ---------- */
  today() {
    const todays = DB.todayRentals().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const done = todays.filter(r => r.status === 'returned').length;

    return h('div', null, [
      PageHead({
        title: "Today's Rentals",
        subtitle: 'Semua penyewaan yang mulai atau berakhir hari ini',
        icon: I.calendar(),
        action: h('button', { class: 'btn btn-primary', onclick: () => openNewRentalModal() }, [I.plus(), h('span', null, 'Buat Rental')])
      }),
      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Hari Ini'), h('div', { class: 'sc-value' }, fmtNum(todays.length)), h('div', { class: 'sc-sub' }, 'mulai / berakhir hari ini')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Selesai'), h('div', { class: 'sc-value', style: { color: 'var(--success)' } }, fmtNum(done)), h('div', { class: 'sc-sub' }, 'dikembalikan hari ini')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Aktif'), h('div', { class: 'sc-value', style: { color: 'var(--primary)' } }, fmtNum(todays.filter(r => r.status === 'rented' || r.status === 'overdue').length)), h('div', { class: 'sc-sub' }, 'sedang berjalan')])
      ]),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Daftar Rental Hari Ini',
        icon: I.calendar(),
        bodyPad: false,
        children: todays.length
          ? todays.map(r => RentalRow(r, () => openRentalDetail(r)))
          : EmptyState({ icon: I.calendar(), title: 'Tidak ada rental hari ini', desc: 'Rental baru akan muncul di sini' })
      }))
    ]);
  },

  /* ---------- hub/available ---------- */
  available() {
    const avail = DB.itemsByStatus('available');
    const maint = DB.itemsByStatus('maintenance');
    const byCat = {};
    for (const it of avail) {
      byCat[it.categoryId] = (byCat[it.categoryId] || 0) + 1;
    }

    return h('div', null, [
      PageHead({
        title: 'Available Items',
        subtitle: avail.length + ' item siap disewa · ' + maint.length + ' dalam perawatan',
        icon: I.box(),
        action: h('button', { class: 'btn btn-soft', onclick: () => openNewRentalModal() }, [I.plus(), h('span', null, 'Rental Sekarang')])
      }),
      h('div', { class: 'cat-counts' },
        DB.get('kategoris').map(cat => h('button', {
          class: 'cat-count' + (State.get('filterCategory') === cat.id ? ' active' : ''),
          onclick: () => State.set({ filterCategory: State.get('filterCategory') === cat.id ? null : cat.id })
        }, [
          h('span', { class: 'cc-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
          h('span', null, cat.name),
          h('strong', null, String(byCat[cat.id] || 0))
        ]))
      ),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Item Tersedia',
        icon: I.box(),
        bodyPad: true,
        children: h('div', { class: 'avail-grid wide' },
          avail
            .filter(it => !State.get('filterCategory') || it.categoryId === State.get('filterCategory'))
            .map(item => {
              const cat = DB.kategoriById(item.categoryId);
              return h('div', { class: 'avail-card', onclick: () => {
                const body = h('div', { class: 'stack' }, [
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
                    h('div', { class: 'rt-item-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
                    h('div', null, [h('strong', { style: { display: 'block' } }, item.name), h('span', { style: { fontSize: '12px', color: 'var(--ink-3)' } }, cat.name)])
                  ]),
                  h('div', { class: 'rt-grid' }, [
                    h('div', { class: 'rt-cell' }, [h('span', null, 'Harga / hari'), h('strong', null, fmtIDR(item.pricePerDay))]),
                    h('div', { class: 'rt-cell' }, [h('span', null, 'Deposit'), h('strong', null, fmtIDR(item.deposit))]),
                    h('div', { class: 'rt-cell' }, [h('span', null, 'Stok'), h('strong', null, item.stock + ' unit')]),
                    h('div', { class: 'rt-cell' }, [h('span', null, 'Lokasi'), h('strong', null, item.lokasi)])
                  ]),
                  h('button', { class: 'btn btn-primary btn-block', onclick: () => { Modal.close(); openNewRentalModal(); } }, 'Rental Item Ini')
                ]);
                Modal.open({ title: 'Detail Item', body, size: 'lg' });
              } }, [
                h('div', { class: 'av-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
                h('div', { class: 'av-info' }, [
                  h('strong', null, item.name),
                  h('span', null, cat.name + ' · ' + item.stock + ' unit')
                ]),
                h('div', { class: 'av-price' }, fmtIDR(item.pricePerDay) + '/hari')
              ]);
            })
        )
      }))
    ]);
  },

  /* ---------- hub/calendar ---------- */
  calendar() {
    const month = new Date().toISOString().slice(0, 7);
    const monthRentals = DB.get('rentals').filter(r =>
      r.startDate.slice(0, 7) === month || r.endDate.slice(0, 7) === month
    );

    return h('div', null, [
      PageHead({
        title: 'Rental Calendar',
        subtitle: 'Kalender penyewaan — klik tanggal untuk melihat detail',
        icon: I.calendar(),
        action: h('button', { class: 'btn btn-primary', onclick: () => openNewRentalModal() }, [I.plus(), h('span', null, 'New Rental')])
      }),
      h('div', { class: 'grid-2col' }, [
        Section({
          title: 'Kalender Bulanan',
          icon: I.calendar(),
          children: CalendarWidget({
            onSelectDate: (key) => {
              const dayRentals = DB.get('rentals').filter(r => r.startDate === key || r.endDate === key);
              if (!dayRentals.length) { Toast.show('Tidak ada rental pada ' + fmtDate(key), 'info'); return; }
              const body = h('div', { class: 'stack' },
                dayRentals.slice(0, 8).map(r => RentalRow(r, () => { Modal.close(); openRentalDetail(r); }))
              );
              Modal.open({ title: 'Rental: ' + fmtDate(key), body, footer: [h('button', { class: 'btn btn-ghost', onclick: () => Modal.close() }, 'Tutup')], size: 'lg' });
            }
          })
        }),
        Section({
          title: 'Jadwal Bulan Ini (' + monthRentals.length + ')',
          icon: I.activity(),
          bodyPad: false,
          children: monthRentals.length
            ? h('div', { class: 'stack' },
                [...monthRentals].sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 12).map(r =>
                  h('div', { class: 'cal-event-row', onclick: () => openRentalDetail(r) }, [
                    h('div', { class: 'cer-date' }, [h('strong', null, fmtShortDate(r.startDate)), h('span', null, '→ ' + fmtShortDate(r.endDate))]),
                    h('div', { class: 'cer-info' }, [h('strong', null, r.itemName), h('span', null, r.customerName)]),
                    StatusPill(r.status)
                  ])
                )
              )
            : EmptyState({ icon: I.calendar(), title: 'Tidak ada jadwal', desc: 'Rental bulan ini akan tampil di sini' })
        })
      ])
    ]);
  }
};