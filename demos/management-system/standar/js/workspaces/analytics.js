/* ============================================
   AutoNexa — Analytics (Shaft & Gear)
   ============================================ */

const AnalyticsPage = {
  _range: '7d',
  _tool: 'revenue',

  /* ==================== REVENUE ==================== */
  revenue() {
    const content = document.getElementById('pageContent');
    this._tool = 'revenue';
    const range = this._range;
    const days = { 'today': 1, '7d': 7, '30d': 30 }[range] || 7;

    // Data agregation (historis manual, tanpa forecasting)
    const revenue = DB.revenueByRange(range);
    const paidCount = DB.get('payments').filter(p => p.status === 'paid' && (range === 'today' ? new Date(p.paidAt).toDateString() === new Date().toDateString() : true)).length;
    const wosDone = DB.get('workOrders').filter(wo => wo.status === 'done').length;
    const avgService = wosDone ? Math.round(DB.revenue() / wosDone) : 0;

    // Chart data — manual monthly series (bukan forecast)
    const labels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
    const rawRevenue = [1850000, 780000, 420000, 1250000];
    const serviceSeries = [4, 3, 2, 5];

    content.innerHTML = `
      ${App.pageHeader('📊', 'Revenue', 'Ringkasan pendapatan bengkel', '')}

      <div class="analytics-layout">
        ${this.timeRail()}

        <div>
          <!-- GAUGE CARD — dominant -->
          <div class="gauge-card">
            <div class="gc-label">PENDAPATAN &nbsp;·&nbsp; ${range === 'today' ? 'HARI INI' : range === '7d' ? '7 HARI' : '30 HARI'}</div>
            <div class="gc-value">${DB.fmtMoney(revenue)}</div>
            <div class="gc-sub">${paidCount} pembayaran diterima</div>
            <div class="gc-delta" style="color:#4ade80">▲ 12.4% vs periode sebelumnya</div>
          </div>

          <!-- Charts -->
          <div class="chart-grid">
            <div class="panel chart-box">
              <h4>Pendapatan per Minggu</h4>
              <div class="canvas-wrap"><canvas id="revChart"></canvas></div>
            </div>
            <div class="panel chart-box">
              <h4>Jumlah Servis</h4>
              <div class="canvas-wrap"><canvas id="svcChart"></canvas></div>
            </div>
          </div>

          <!-- Mechanics ranked -->
          <div class="section">
            <div class="section-head">
              <div class="section-title">
                <span class="st-ic">${I.users}</span>
                <h3>Performa Mekanik</h3>
              </div>
            </div>
            <div class="panel">
              <div class="rank-list">
                ${this.mechanicRankList()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render charts (sederhana — 1 bar + 1 doughnut)
    makeChart('revChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Pendapatan (Rp)', data: rawRevenue,
          backgroundColor: '#d97706',
          borderRadius: 2,
          barThickness: 26
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => (v / 1000) + 'rb' } }
        }
      }
    });

    makeChart('svcChart', {
      type: 'doughnut',
      data: {
        labels: ['Servis Selesai', 'Masih Aktif'],
        datasets: [{
          data: [wosDone, DB.activeWOs()],
          backgroundColor: ['#1f2937', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '68%',
        plugins: { legend: { position: 'bottom' } }
      }
    });
  },

  mechanicRankList() {
    const mechanics = DB.get('mechanics').map(m => {
      const wos = DB.get('workOrders').filter(wo => wo.mechanicId === m.id && wo.status === 'done');
      const totalRevenue = wos.reduce((s, wo) => s + wo.estimatedCost, 0);
      return { ...m, doneCount: wos.length, totalRevenue };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const max = mechanics.reduce((mx, m) => Math.max(mx, m.totalRevenue), 1);

    return mechanics.map((m, i) => `
      <div class="rank-item">
        <span class="rank-no">${String(i + 1).padStart(2, '0')}</span>
        <span class="m-avatar">${esc(m.initials)}</span>
        <div class="rank-info">
          <strong>${esc(m.name)}</strong>
          <small>${esc(m.specialty)} · ${m.doneCount} servis selesai</small>
        </div>
        <div class="rank-bar-wrap">
          <div class="rank-bar"><div style="width:${Math.max((m.totalRevenue / max) * 100, 4)}%"></div></div>
        </div>
        <span class="rank-val">${DB.fmtMoney(m.totalRevenue)}</span>
      </div>
    `).join('');
  },

  /* ==================== SERVICE TREND ==================== */
  trend() {
    const content = document.getElementById('pageContent');
    this._tool = 'trend';
    const wos = DB.get('workOrders').filter(wo => wo.status === 'done');
    const byMonth = {};
    wos.forEach(wo => {
      const key = DB.fmtDateShort(wo.estimatedDone);
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
    const labels = Object.keys(byMonth);
    const data = Object.values(byMonth);

    content.innerHTML = `
      ${App.pageHeader('📈', 'Service Trend', 'Tren jumlah servis yang diselesaikan', '')}

      <div class="analytics-layout">
        ${this.timeRail()}

        <div>
          <div class="panel chart-box" style="height:340px">
            <h4>Servis Selesai per Periode</h4>
            <div class="canvas-wrap"><canvas id="trendChart"></canvas></div>
          </div>

          <div class="section" style="margin-top:20px">
            <div class="section-head">
              <div class="section-title">
                <span class="st-ic">${I.checklist}</span>
                <h3>Rincian Servis Selesai</h3>
                <span class="count">${wos.length}</span>
              </div>
            </div>
            ${tableHTML(
              [
                { label: 'Nomor' },
                { label: 'Kendaraan' },
                { label: 'Mekanik' },
                { label: 'Biaya' },
                { label: 'Selesai' }
              ],
              wos.map(wo => `
                <tr>
                  ${td(`<span class="td-main">${esc(wo.number)}</span>`)}
                  ${td(`<span class="td-plate">${esc(DB.vehicleInfo(wo.vehicleId).plate)}</span>`)}
                  ${td(esc(DB.mechanicName(wo.mechanicId)))}
                  ${td(`<span class="text-right">${DB.fmtMoney(wo.estimatedCost)}</span>`)}
                  ${td(esc(DB.fmtDateShort(wo.estimatedDone)))}
                </tr>
              `)
            )}
          </div>
        </div>
      </div>
    `;

    makeChart('trendChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Jumlah Servis',
          data,
          borderColor: '#d97706',
          backgroundColor: 'rgba(217,119,6,.1)',
          fill: true,
          tension: .35,
          pointBackgroundColor: '#1f2937',
          pointBorderColor: '#d97706',
          pointRadius: 4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  },

  /* ==================== MECHANIC PERFORMANCE ==================== */
  performance() {
    const content = document.getElementById('pageContent');
    this._tool = 'performance';
    const mechanics = DB.get('mechanics');

    content.innerHTML = `
      ${App.pageHeader('🏅', 'Mechanic Performance', 'Performa dan kapasitas tim mekanik', '')}

      <div class="analytics-layout">
        ${this.timeRail()}

        <div>
          <div class="section">
            <div class="section-head">
              <div class="section-title">
                <span class="st-ic">${I.users}</span>
                <h3>Ranking Mekanik</h3>
              </div>
            </div>
            <div class="panel">
              <div class="rank-list">${this.mechanicRankList()}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-head">
              <div class="section-title">
                <span class="st-ic">${I.wrench}</span>
                <h3>Kapasitas & Beban Kerja</h3>
              </div>
            </div>
            ${tableHTML(
              [
                { label: 'Mekanik' },
                { label: 'Spesialisasi' },
                { label: 'Status' },
                { label: 'Servis Selesai' },
                { label: 'WO Aktif' }
              ],
              mechanics.map(m => {
                const doneCount = DB.get('workOrders').filter(wo => wo.mechanicId === m.id && wo.status === 'done').length;
                const activeCount = DB.get('workOrders').filter(wo => wo.mechanicId === m.id && !['done','cancelled'].includes(wo.status)).length;
                return `
                  <tr>
                    ${td(`<span class="td-main">${esc(m.name)}</span>`)}
                    ${td(esc(m.specialty))}
                    ${td(statusBadge(m.status))}
                    ${td(`<span class="text-right"><strong>${doneCount}</strong></span>`)}
                    ${td(`<span class="text-right"><strong>${activeCount}</strong></span>`)}
                  </tr>
                `;
              })
            )}
          </div>
        </div>
      </div>
    `;
  },

  /* ==================== INVENTORY SUMMARY ==================== */
  inventorySummary() {
    const content = document.getElementById('pageContent');
    this._tool = 'inventory';
    const parts = DB.get('spareParts');
    const lowParts = DB.lowStockParts();
    const totalValue = DB.totalPartValue();
    const totalUnits = DB.totalPartStock();

    content.innerHTML = `
      ${App.pageHeader('📦', 'Inventory Summary', 'Ringkasan stok dan nilai persediaan', '')}

      <div class="analytics-layout">
        ${this.timeRail()}

        <div>
          <div class="kpi-strip">
            <div class="kpi-cell"><span class="kc-label">Total Jenis Part</span><span class="kc-value">${parts.length}</span></div>
            <div class="kpi-cell"><span class="kc-label">Total Unit</span><span class="kc-value">${totalUnits}</span></div>
            <div class="kpi-cell"><span class="kc-label">Nilai Persediaan</span><span class="kc-value">${DB.fmtMoney(Math.round(totalValue / 1000))}<small>rb</small></span></div>
            <div class="kpi-cell"><span class="kc-label">Part Menipis</span><span class="kc-value" style="color:${lowParts.length ? 'var(--warning)' : 'var(--text)'}">${lowParts.length}</span></div>
          </div>

          <div class="chart-grid">
            <div class="panel chart-box">
              <h4>Nilai Stok per Kategori</h4>
              <div class="canvas-wrap"><canvas id="catChart"></canvas></div>
            </div>
            <div class="panel chart-box">
              <h4>Status Stok</h4>
              <div class="canvas-wrap"><canvas id="stockChart"></canvas></div>
            </div>
          </div>

          <div class="section">
            <div class="section-head">
              <div class="section-title">
                <span class="st-ic">${I.alert}</span>
                <h3>Part Perlu Restock</h3>
                <span class="count">${lowParts.length}</span>
              </div>
            </div>
            ${lowParts.length ? tableHTML(
              [
                { label: 'Part' },
                { label: 'SKU' },
                { label: 'Rak' },
                { label: 'Stok' },
                { label: 'Min' },
                { label: 'Nilai' }
              ],
              lowParts.map(p => `
                <tr>
                  ${td(`<span class="td-main">${esc(p.name)}</span>`)}
                  ${td(`<span class="td-sub">${esc(p.sku)}</span>`)}
                  ${td(`<span class="td-plate">${esc(p.location)}</span>`)}
                  ${td(`<strong style="color:var(--warning)">${p.stock}</strong>`)}
                  ${td(p.minStock)}
                  ${td(`<span class="text-right">${DB.fmtMoney(p.stock * p.cost)}</span>`)}
                </tr>
              `)
            ) : '<div class="panel"><div class="empty-state"><div class="es-ic">✅</div><p>Semua stok aman</p></div></div>'}
          </div>
        </div>
      </div>
    `;

    // Category value chart
    const cats = {};
    parts.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + (p.stock * p.cost);
    });
    makeChart('catChart', {
      type: 'bar',
      data: {
        labels: Object.keys(cats),
        datasets: [{
          label: 'Nilai (Rp)', data: Object.values(cats),
          backgroundColor: ['#d97706', '#1f2937', '#16a34a', '#dc2626', '#2563eb'],
          borderRadius: 2,
          barThickness: 22
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => (v / 1000) + 'rb' } } }
      }
    });

    // Stock status doughnut
    const aman = parts.filter(p => { const l = stockLevel(p); return l.cls === 'success'; }).length;
    const menipis = lowParts.filter(p => p.stock > 0).length;
    const habis = lowParts.filter(p => p.stock <= 0).length;
    makeChart('stockChart', {
      type: 'doughnut',
      data: {
        labels: ['Aman', 'Menipis', 'Habis'],
        datasets: [{
          data: [aman, menipis, habis],
          backgroundColor: ['#16a34a', '#d97706', '#dc2626'],
          borderWidth: 0
        }]
      },
      options: { cutout: '68%', plugins: { legend: { position: 'bottom' } } }
    });
  },

  /* ==================== REPORTS ==================== */
  reports() {
    const content = document.getElementById('pageContent');
    this._tool = 'reports';

    const reports = [
      { name: 'Rekap Servis Harian', desc: 'Daftar WO yang selesai / dikerjakan hari ini', icon: I.file },
      { name: 'Laporan Pendapatan Mingguan', desc: 'Total pendapatan + rincian per metode bayar', icon: I.chart },
      { name: 'Rekap Stok & Part Menipis', desc: 'Daftar part dengan stok di bawah minimum', icon: I.box },
      { name: 'Performa Mekanik Bulanan', desc: 'Jumlah servis & pendapatan per mekanik', icon: I.users },
      { name: 'Riwayat Service Pelanggan', desc: 'Full history service per kendaraan', icon: I.checklist }
    ];

    content.innerHTML = `
      ${App.pageHeader('📑', 'Reports', 'Pilih template laporan untuk diekspor (CSV)', '')}

      <div class="analytics-layout">
        ${this.timeRail()}

        <div>
          <div class="section">
            <div class="section-head">
              <div class="section-title">
                <span class="st-ic">${I.file}</span>
                <h3>Template Laporan</h3>
              </div>
            </div>
            ${reports.map((r, i) => `
              <div class="report-item">
                <div class="report-ic">${r.icon}</div>
                <div class="report-info">
                  <strong>${esc(r.name)}</strong>
                  <small>${esc(r.desc)}</small>
                </div>
                <div class="report-actions">
                  <button class="btn btn-sm btn-ghost" onclick="AnalyticsPage.exportReport(${i})">${I.download} Export CSV</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  exportReport(idx) {
    const reports = [
      () => {
        const wos = DB.get('workOrders');
        const rows = wos.map(wo => [wo.number, DB.customerName(wo.customerId), DB.vehicleInfo(wo.vehicleId).plate, wo.complaint, wo.status, DB.fmtDate(wo.createdAt)]);
        rows.unshift(['Nomor', 'Pelanggan', 'Plat', 'Keluhan', 'Status', 'Dibuat']);
        exportCSV('rekap-servis-harian.csv', rows);
      },
      () => {
        const pays = DB.get('payments').filter(p => p.status === 'paid');
        const rows = pays.map(p => [p.workOrderId, DB.fmtDate(p.paidAt), p.method, p.amount]);
        rows.unshift(['WO', 'Tanggal', 'Metode', 'Jumlah']);
        exportCSV('laporan-pendapatan.csv', rows);
      },
      () => {
        const low = DB.lowStockParts();
        const rows = low.map(p => [p.sku, p.name, p.location, p.stock, p.minStock, p.cost * p.stock]);
        rows.unshift(['SKU', 'Part', 'Rak', 'Stok', 'Min', 'Nilai']);
        exportCSV('rekap-stok-menipis.csv', rows);
      },
      () => {
        const mechs = DB.get('mechanics').map(m => {
          const done = DB.get('workOrders').filter(wo => wo.mechanicId === m.id && wo.status === 'done');
          const total = done.reduce((s, wo) => s + wo.estimatedCost, 0);
          return [m.name, m.specialty, done.length, total];
        });
        mechs.unshift(['Mekanik', 'Spesialisasi', 'Servis Selesai', 'Pendapatan']);
        exportCSV('performa-mekanik.csv', mechs);
      },
      () => {
        const wos = DB.get('workOrders').filter(wo => wo.status === 'done');
        const rows = wos.map(wo => [wo.number, DB.vehicleInfo(wo.vehicleId).plate, DB.customerName(wo.customerId), DB.fmtDate(wo.estimatedDone), wo.estimatedCost]);
        rows.unshift(['Nomor', 'Plat', 'Pelanggan', 'Selesai', 'Biaya']);
        exportCSV('riwayat-service-pelanggan.csv', rows);
      }
    ];
    reports[idx]();
    Toast.show('Laporan berhasil diekspor', 'success');
  },

  /* ---------- TIME RAIL ---------- */
  timeRail() {
    const items = [
      { key: 'today', label: 'Hari Ini' },
      { key: '7d', label: '7 Hari' },
      { key: '30d', label: '30 Hari' }
    ];
    return `
      <aside class="time-rail">
        <div style="padding:10px 16px 8px"><small style="font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3)">RENTANG</small></div>
        ${items.map(i => `
          <button class="time-item ${this._range === i.key ? 'active' : ''}" onclick="AnalyticsPage.setRange('${i.key}')">${i.label}</button>
        `).join('')}
      </aside>
    `;
  },

  setRange(range) {
    this._range = range;
    const dispatch = { revenue: 'revenue', trend: 'trend', performance: 'performance', inventory: 'inventorySummary', reports: 'reports' };
    const fn = dispatch[this._tool] || 'revenue';
    this[fn]();
  }
};