/* ============================================================
   RentFlow — Rental Operations Pages
   ops/new · ops/active · ops/returns · ops/history
   ============================================================ */

const OperationsPage = {

  /* ---------- ops/new ---------- */
  newRental() {
    return h('div', null, [
      PageHead({
        title: 'New Rental',
        subtitle: 'Buat penyewaan baru untuk pelanggan',
        icon: I.plus(),
        action: h('button', { class: 'btn btn-primary', onclick: () => openNewRentalModal() }, [I.plus(), h('span', null, 'Mulai Form')])
      }),
      h('div', { class: 'section' }, [
        h('div', { class: 'section-body', style: { textAlign: 'center', padding: '40px' } }, [
          h('div', { class: 'es-ic', style: { margin: '0 auto 12px', background: '#DBEAFE', color: '#1D4ED8' } }, I.plus()),
          h('strong', { style: { display: 'block', fontSize: '15px', marginBottom: '6px' } }, 'Mulai penyewaan baru'),
          h('p', { style: { fontSize: '12.5px', color: 'var(--ink-3)', marginBottom: '18px' } }, 'Pilih item, pelanggan, dan durasi sewa untuk membuat rental.'),
          h('button', { class: 'btn btn-primary', onclick: () => openNewRentalModal() }, [I.plus(), h('span', null, 'Buat Rental Baru')])
        ])
      ])
    ]);
  },

  /* ---------- ops/active ---------- */
  active() {
    const active = DB.activeRentals().sort((a, b) => b.endDate.localeCompare(a.endDate));
    const rented = active.filter(r => r.status === 'rented');
    const overdue = active.filter(r => r.status === 'overdue');

    const chips = [
      { label: 'Semua', count: active.length, filter: null },
      { label: 'Rented', count: rented.length, filter: 'rented' },
      { label: 'Overdue', count: overdue.length, filter: 'overdue' }
    ];

    const filter = State.get('filterStatus');
    const shown = filter ? active.filter(r => r.status === filter) : active;

    return h('div', null, [
      PageHead({
        title: 'Active Rentals',
        subtitle: 'Rental yang sedang berjalan & perlu pengembalian',
        icon: I.key(),
        action: h('button', { class: 'btn btn-primary', onclick: () => openNewRentalModal() }, [I.plus(), h('span', null, 'New Rental')])
      }),
      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Aktif'), h('div', { class: 'sc-value', style: { color: 'var(--primary)' } }, fmtNum(rented.length)), h('div', { class: 'sc-sub' }, 'berjalan normal')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Overdue'), h('div', { class: 'sc-value', style: { color: 'var(--danger)' } }, fmtNum(overdue.length)), h('div', { class: 'sc-sub' }, 'perlu tindakan segera')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Aktif'), h('div', { class: 'sc-value' }, fmtNum(active.length)), h('div', { class: 'sc-sub' }, 'semua rental berjalan')])
      ]),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', marginTop: '16px' } },
        chips.map(c => h('button', {
          class: 'chip' + (filter === c.filter ? ' active' : ''),
          onclick: () => State.set({ filterStatus: c.filter })
        }, c.label + ' (' + c.count + ')'))
      ),
      h('div', { style: { marginTop: '4px' } }, Section({
        title: 'Rental Berjalan',
        icon: I.key(),
        bodyPad: false,
        children: shown.length
          ? shown.map(r => h('div', { class: 'rental-row', onclick: () => openRentalDetail(r) }, [
              h('div', { class: 'rr-ic', style: { background: DB.kategoriById(r.categoryId).bg, color: DB.kategoriById(r.categoryId).color } }, icon(DB.kategoriById(r.categoryId).icon)),
              h('div', { class: 'rr-info' }, [
                h('strong', null, r.itemName),
                h('span', null, r.customerName + ' · sampai ' + fmtShortDate(r.endDate))
              ]),
              StatusPill(r.status),
              h('div', { class: 'rr-amount' }, fmtIDR(r.total)),
              h('button', {
                class: 'btn btn-sm btn-soft',
                onclick: (e) => {
                  e.stopPropagation();
                  ConfirmDialog({
                    title: 'Proses Pengembalian',
                    message: 'Tandai ' + r.itemName + ' telah dikembalikan?',
                    confirmLabel: 'Ya, Kembalikan',
                    onConfirm: () => {
                      DB.updateRentalStatus(r.id, 'returned');
                      Toast.show(r.id + ' berhasil dikembalikan 🎉', 'success');
                    }
                  });
                }
              }, 'Return')
            ]))
          : EmptyState({ icon: I.key(), title: 'Tidak ada rental aktif', desc: 'Semua item tersedia untuk disewa' })
      }))
    ]);
  },

  /* ---------- ops/returns ---------- */
  returns() {
    const overdueRentals = DB.overdueRentals();
    const recent = DB.recentReturns(10);

    return h('div', null, [
      PageHead({
        title: 'Item Returns',
        subtitle: 'Proses pengembalian & riwayat return terbaru',
        icon: I.undo()
      }),
      h('div', { class: 'grid-2col' }, [
        Section({
          title: 'Menunggu Pengembalian (' + overdueRentals.length + ')',
          icon: I.alert(),
          bodyPad: false,
          children: overdueRentals.length
            ? overdueRentals.map(r => h('div', { class: 'rental-row', onclick: () => openRentalDetail(r) }, [
                h('div', { class: 'rr-ic', style: { background: '#FEE2E2', color: '#DC2626' } }, I.alert()),
                h('div', { class: 'rr-info' }, [
                  h('strong', null, r.itemName),
                  h('span', null, r.customerName + ' · telat dari ' + fmtShortDate(r.endDate))
                ]),
                StatusPill('overdue'),
                h('button', {
                  class: 'btn btn-sm btn-success',
                  onclick: (e) => {
                    e.stopPropagation();
                    ConfirmDialog({
                      title: 'Proses Pengembalian',
                      message: 'Tandai ' + r.itemName + ' telah dikembalikan? Denda ' + fmtIDR(r.denda) + ' akan dikenakan.',
                      confirmLabel: 'Ya, Kembalikan',
                      onConfirm: () => {
                        DB.updateRentalStatus(r.id, 'returned');
                        Toast.show(r.id + ' dikembalikan dengan denda ' + fmtIDR(r.denda), 'success');
                      }
                    });
                  }
                }, 'Return')
              ]))
            : EmptyState({ icon: I.checkCircle(), title: 'Tidak ada yang overdue', desc: 'Semua rental berjalan sesuai jadwal' })
        }),
        Section({
          title: 'Return Terbaru',
          icon: I.check(),
          bodyPad: false,
          children: recent.length
            ? recent.slice(0, 8).map(ret => {
                const rental = DB.rentalById(ret.rentalId);
                return h('div', { class: 'rental-row', onclick: () => rental && openRentalDetail(rental) }, [
                  h('div', { class: 'rr-ic', style: { background: '#DCFCE7', color: '#15803D' } }, I.check()),
                  h('div', { class: 'rr-info' }, [
                    h('strong', null, rental ? rental.itemName : ret.itemId),
                    h('span', null, (rental ? rental.customerName : '') + ' · ' + fmtShortDate(ret.returnedDate))
                  ]),
                  Badge(ret.condition, '#15803D', '#DCFCE7'),
                  h('div', { class: 'rr-amount' }, 'Denda ' + fmtIDR(ret.denda))
                ]);
              })
            : EmptyState({ icon: I.undo(), title: 'Belum ada return', desc: 'Pengembalian akan tercatat di sini' })
        })
      ])
    ]);
  },

  /* ---------- ops/history ---------- */
  history() {
    const all = [...DB.get('rentals')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const returned = all.filter(r => r.status === 'returned');
    const totalIncome = all.filter(r => r.paid).reduce((s, r) => s + r.total, 0);
    const totalDenda = all.reduce((s, r) => s + r.denda, 0);

    return h('div', null, [
      PageHead({
        title: 'Rental History',
        subtitle: 'Riwayat seluruh transaksi penyewaan',
        icon: I.history()
      }),
      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Transaksi'), h('div', { class: 'sc-value' }, fmtNum(all.length)), h('div', { class: 'sc-sub' }, 'tercatat dalam sistem')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Selesai'), h('div', { class: 'sc-value', style: { color: 'var(--success)' } }, fmtNum(returned.length)), h('div', { class: 'sc-sub' }, 'telah dikembalikan')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Pendapatan'), h('div', { class: 'sc-value', style: { color: 'var(--primary)' } }, fmtIDR(totalIncome)), h('div', { class: 'sc-sub' }, 'termasuk denda ' + fmtIDR(totalDenda))])
      ]),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Riwayat Rental',
        icon: I.history(),
        bodyPad: false,
        children: DataTable({
          columns: [
            { label: 'ID', type: 'id', sortKey: 'id' },
            { label: 'Item', type: 'main', sortKey: 'itemName' },
            { label: 'Pelanggan', type: 'main', sortKey: 'customerName' },
            { label: 'Tanggal', type: 'text', sortKey: 'startDate' },
            { label: 'Durasi', type: 'text', sortKey: 'duration' },
            { label: 'Total', type: 'amount', align: 'right', sortKey: 'total' },
            { label: 'Status', type: 'text', sortKey: 'status' }
          ],
          rows: all.map(r => [
            r.id,
            [h('strong', null, r.itemName), h('span', null, DB.kategoriById(r.categoryId).name)],
            r.customerName,
            fmtShortDate(r.startDate) + ' → ' + fmtShortDate(r.endDate),
            r.duration + ' hari',
            fmtIDR(r.total),
            StatusPill(r.status)
          ]),
          initialSort: 'startDate',
          initialSortDir: 'desc'
        })
      }))
    ]);
  }
};