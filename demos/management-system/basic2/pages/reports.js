/* ============================================================
   RentFlow — Reports Pages
   reports/rental · reports/revenue · reports/export
   ============================================================ */

const ReportsPage = {

  /* ---------- reports/rental ---------- */
  rental() {
    const all = [...DB.get('rentals')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const returned = all.filter(r => r.status === 'returned');
    const pending = all.filter(r => r.status !== 'returned');
    const totalDenda = all.reduce((s, r) => s + r.denda, 0);
    const avgDuration = all.length ? Math.round(all.reduce((s, r) => s + r.duration, 0) / all.length) : 0;

    /* Per-kategori breakdown */
    const byCat = {};
    for (const r of all) {
      const name = DB.kategoriById(r.categoryId).name;
      if (!byCat[name]) byCat[name] = { count: 0, revenue: 0 };
      byCat[name].count++;
      byCat[name].revenue += r.total;
    }

    return h('div', null, [
      PageHead({
        title: 'Rental Report',
        subtitle: 'Rekapitulasi seluruh transaksi penyewaan',
        icon: I.file(),
        action: h('button', {
          class: 'btn btn-soft',
          onclick: () => ExportService.csv('rental-report.csv',
            ['ID', 'Item', 'Pelanggan', 'Mulai', 'Selesai', 'Durasi', 'Total', 'Denda', 'Status'],
            all.map(r => [r.id, r.itemName, r.customerName, r.startDate, r.endDate, r.duration, r.total, r.denda, r.status]))
        }, [I.download(), h('span', null, 'Export Excel')])
      }),
      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Rental'), h('div', { class: 'sc-value' }, fmtNum(all.length)), h('div', { class: 'sc-sub' }, 'seluruh transaksi')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Selesai'), h('div', { class: 'sc-value', style: { color: 'var(--success)' } }, fmtNum(returned.length)), h('div', { class: 'sc-sub' }, 'telah dikembalikan')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Berjalan'), h('div', { class: 'sc-value', style: { color: 'var(--warning)' } }, fmtNum(pending.length)), h('div', { class: 'sc-sub' }, 'belum dikembalikan')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Rata-rata Durasi'), h('div', { class: 'sc-value' }, avgDuration + ' hari'), h('div', { class: 'sc-sub' }, 'per penyewaan')])
      ]),

      h('div', { class: 'grid-2col', style: { marginTop: '16px' } }, [
        Section({
          title: 'Rekap per Kategori',
          icon: I.grid(),
          bodyPad: false,
          children: DataTable({
            columns: [
              { label: 'Kategori', type: 'main', sortKey: 'name' },
              { label: 'Jumlah Rental', type: 'text', sortKey: 'count' },
              { label: 'Total Pendapatan', type: 'amount', align: 'right', sortKey: 'revenue' }
            ],
            rows: Object.entries(byCat).map(([name, v]) => [
              name,
              v.count + '×',
              fmtIDR(v.revenue)
            ]),
            initialSort: 'revenue',
            initialSortDir: 'desc'
          })
        }),
        Section({
          title: 'Ringkasan',
          icon: I.chart(),
          children: h('div', { class: 'stack' }, [
            h('div', { class: 'report-line' }, [h('span', null, 'Total pendapatan (lunas)'), h('strong', null, fmtIDR(all.filter(r => r.paid).reduce((s, r) => s + r.total, 0)))]),
            h('div', { class: 'report-line' }, [h('span', null, 'Total denda keterlambatan'), h('strong', { style: { color: 'var(--danger)' } }, fmtIDR(totalDenda))]),
            h('div', { class: 'report-line' }, [h('span', null, 'Total deposit terkumpul'), h('strong', null, fmtIDR(all.reduce((s, r) => s + r.deposit, 0)))]),
            h('div', { class: 'report-line' }, [h('span', null, 'Transaksi lunas'), h('strong', null, fmtNum(all.filter(r => r.paid).length) + ' dari ' + fmtNum(all.length))])
          ])
        })
      ]),

      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Detail Transaksi',
        icon: I.file(),
        bodyPad: false,
        children: DataTable({
          columns: [
            { label: 'ID', type: 'id', sortKey: 'id' },
            { label: 'Item', type: 'main', sortKey: 'itemName' },
            { label: 'Pelanggan', type: 'main', sortKey: 'customerName' },
            { label: 'Periode', type: 'text' },
            { label: 'Durasi', type: 'text', sortKey: 'duration' },
            { label: 'Subtotal', type: 'amount', align: 'right', sortKey: 'subtotal' },
            { label: 'Denda', type: 'amount', align: 'right', sortKey: 'denda' },
            { label: 'Total', type: 'amount', align: 'right', sortKey: 'total' },
            { label: 'Status', type: 'text', sortKey: 'status' }
          ],
          rows: all.map(r => [
            r.id,
            r.itemName,
            r.customerName,
            fmtShortDate(r.startDate) + ' → ' + fmtShortDate(r.endDate),
            r.duration + ' hari',
            fmtIDR(r.subtotal),
            fmtIDR(r.denda),
            fmtIDR(r.total),
            StatusPill(r.status)
          ]),
          initialSort: 'total',
          initialSortDir: 'desc'
        })
      }))
    ]);
  },

  /* ---------- reports/revenue ---------- */
  revenue() {
    const monthRevenue = DB.revenueByDay(30);
    const summary = DB.revenueSummary();
    const all = DB.get('rentals');
    const monthlyData = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      const key = d.toISOString().slice(0, 7);
      const total = all.filter(r => r.paid && r.createdAt.slice(0, 7) === key).reduce((s, r) => s + r.total, 0);
      monthlyData.push({
        label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
        total
      });
    }

    return h('div', null, [
      PageHead({
        title: 'Revenue Report',
        subtitle: 'Analisis pendapatan rental',
        icon: I.money(),
        action: h('button', {
          class: 'btn btn-soft',
          onclick: () => ExportService.pdf('Revenue Report', 'RentFlow — Rental Management System',
            [
              { label: 'Periode' },
              { label: 'Tanggal' },
              { label: 'Revenue', align: 'right' }
            ],
            monthRevenue.map(d => [d.label, d.label, fmtIDR(d.total)]),
            'Total pendapatan bulan ini: ' + fmtIDR(summary.month)
          )
        }, [I.file(), h('span', null, 'Export PDF')])
      }),

      h('div', { class: 'revenue-big-card' }, [
        h('div', { class: 'rbc-main' }, [
          h('div', { class: 'rbc-label' }, 'Pendapatan Bulan Ini'),
          h('div', { class: 'rbc-value' }, fmtIDR(summary.month)),
          h('div', { class: 'rbc-sub' }, summary.rentalCountMonth + ' rental · rata-rata ' + fmtIDR(summary.avgPerRental) + '/rental')
        ]),
        MiniBarChart({ data: monthRevenue })
      ]),

      h('div', { class: 'grid-2col', style: { marginTop: '16px' } }, [
        Section({
          title: 'Trend 6 Bulan',
          icon: I.trend(),
          children: h('div', { class: 'stack' }, [
            MiniBarChart({ data: monthlyData, color: '#0EA5E9' }),
            h('div', { class: 'report-line' }, [h('span', null, 'Total pendapatan (semua waktu)'), h('strong', null, fmtIDR(summary.total))]),
            h('div', { class: 'report-line' }, [h('span', null, 'Pendapatan hari ini'), h('strong', null, fmtIDR(summary.today))])
          ])
        }),
        Section({
          title: 'Metode Pembayaran',
          icon: I.money(),
          children: h('div', { class: 'stack' },
            ['Transfer', 'QRIS', 'Cash', 'E-Wallet'].map(method => {
              const list = all.filter(r => r.payment === method && r.paid);
              const total = list.reduce((s, r) => s + r.total, 0);
              const pct = Math.max(2, Math.round((list.length / Math.max(all.length, 1)) * 100));
              return h('div', { class: 'pay-row' }, [
                h('div', { class: 'pay-top' }, [h('strong', null, method), h('span', null, list.length + '× · ' + fmtIDR(total))]),
                h('div', { class: 'pay-bar' }, h('div', { style: { width: pct + '%' } }))
              ]);
            })
          )
        })
      ])
    ]);
  },

  /* ---------- reports/export ---------- */
  exportReport() {
    const all = DB.get('rentals');

    function exportRentals() {
      ExportService.csv('rental-all.csv',
        ['ID', 'Item', 'Kategori', 'Pelanggan', 'Mulai', 'Selesai', 'Durasi', 'Harga/Hari', 'Subtotal', 'Denda', 'Total', 'Status', 'Pembayaran'],
        all.map(r => [r.id, r.itemName, DB.kategoriById(r.categoryId).name, r.customerName, r.startDate, r.endDate, r.duration, r.pricePerDay, r.subtotal, r.denda, r.total, r.status, r.payment])
      );
    }

    function exportReturns() {
      ExportService.csv('returns-all.csv',
        ['ID', 'Rental ID', 'Item', 'Pelanggan', 'Tanggal Kembali', 'Kondisi', 'Telat', 'Denda', 'Deposit Dikembalikan', 'Catatan'],
        DB.get('returns').map(ret => {
          const rental = DB.rentalById(ret.rentalId);
          return [ret.id, ret.rentalId, rental ? rental.itemName : ret.itemId, rental ? rental.customerName : '', ret.returnedDate, ret.condition, ret.lateDays + ' hari', ret.denda, ret.depositReturned, ret.note];
        })
      );
    }

    function exportItems() {
      ExportService.csv('items-all.csv',
        ['ID', 'Nama Item', 'Kategori', 'Harga/Hari', 'Deposit', 'Stok', 'Lokasi', 'Status', 'Rating'],
        DB.get('items').map(i => [i.id, i.name, DB.kategoriById(i.categoryId).name, i.pricePerDay, i.deposit, i.stock, i.lokasi, i.status, i.rate])
      );
    }

    function exportRevenuePdf() {
      const summary = DB.revenueSummary();
      ExportService.pdf('Revenue Report', 'RentFlow — Rental Management System',
        [
          { label: 'Metrik' },
          { label: 'Nilai', align: 'right' }
        ],
        [
          ['Pendapatan hari ini', fmtIDR(summary.today)],
          ['Pendapatan bulan ini', fmtIDR(summary.month)],
          ['Total pendapatan', fmtIDR(summary.total)],
          ['Rata-rata per rental', fmtIDR(summary.avgPerRental)],
          ['Jumlah rental bulan ini', String(summary.rentalCountMonth)]
        ],
        'Data dihasilkan otomatis oleh RentFlow Basic Edition'
      );
    }

    const exports = [
      { label: 'Export Semua Rental', desc: 'Excel (CSV) — 300 transaksi', icon: I.history(), bg: '#DBEAFE', color: '#1D4ED8', onClick: exportRentals },
      { label: 'Export Riwayat Return', desc: 'Excel (CSV) — semua pengembalian', icon: I.undo(), bg: '#DCFCE7', color: '#15803D', onClick: exportReturns },
      { label: 'Export Daftar Item', desc: 'Excel (CSV) — 100 item rental', icon: I.box(), bg: '#FEF3C7', color: '#B45309', onClick: exportItems },
      { label: 'Export Revenue PDF', desc: 'Printer-friendly — siap cetak', icon: I.file(), bg: '#EDE9FE', color: '#6D28D9', onClick: exportRevenuePdf }
    ];

    return h('div', null, [
      PageHead({
        title: 'Export Report',
        subtitle: 'Unduh data dalam format Excel atau PDF',
        icon: I.download()
      }),
      h('div', { class: 'export-grid' },
        exports.map(ex => h('div', { class: 'export-card' }, [
          h('div', { class: 'ex-ic', style: { background: ex.bg, color: ex.color } }, ex.icon),
          h('div', { class: 'ex-info' }, [
            h('strong', null, ex.label),
            h('span', null, ex.desc)
          ]),
          h('button', { class: 'btn btn-sm btn-soft', onclick: ex.onClick }, 'Unduh')
        ]))
      ),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Info Export',
        icon: I.info ? I.info() : I.bell(),
        children: h('div', { class: 'export-note' }, [
          h('p', null, '• Export Excel menggunakan format CSV dengan BOM agar terbuka rapi di Microsoft Excel Indonesia.'),
          h('p', null, '• Export PDF membuka dokumen print-friendly — gunakan "Save as PDF" pada dialog print.'),
          h('p', null, '• Semua data berasal dari mode demo (LocalStorage) dan hanya untuk presentasi.'),
          h('p', null, '• Fitur export penuh tersedia di versi premium dengan format XLSX & PDF otomatis.')
        ])
      }))
    ]);
  }
};