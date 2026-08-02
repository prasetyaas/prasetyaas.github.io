/* ============================================
   StockPilot — Analytics (Gauge & Trend)
   ============================================ */

const AnalyticsPage = {
  _active: 'summary',
  _range: '7d',

  _timeRail() {
    const items = [
      { key: 'today', label: 'Hari Ini' },
      { key: '7d', label: '7 Hari' },
      { key: '30d', label: '30 Hari' }
    ];
    return `<aside class="time-rail">
      <div style="padding:10px 16px 8px"><small style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3)">RENTANG</small></div>
      ${items.map(i => `<button class="time-item ${this._range === i.key ? 'active' : ''}" onclick="AnalyticsPage.setRange('${i.key}')">${i.label}</button>`).join('')}
    </aside>`;
  },

  setRange(r) { this._range = r; const map = { summary:'summary', movement:'movement', fast:'fast', low:'low', purchase:'purchase', export:'export' }; this[map[this._active] || 'summary'](); },

  summary() {
    this._active = 'summary';
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    const totalValue = DB.totalValue();
    const totalUnits = DB.totalUnits();
    const low = DB.lowStock().length;
    const out = DB.outOfStock().length;

    // Category value data
    const cats = {};
    products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + (p.stock * p.cost); });
    const catLabels = Object.keys(cats).slice(0, 8);
    const catValues = Object.values(cats).slice(0, 8);

    content.innerHTML = `
      ${App.pageHeader('📊', 'Inventory Summary', 'Ringkasan nilai & status inventori', '')}
      <div class="analytics-layout">
        ${this._timeRail()}
        <div>
          <div class="stat-strip">
            <div class="stat-cell c-blue" style="position:relative"><span class="sc-label">Nilai Inventori</span><span class="sc-value">${DB.fmtMoney(Math.round(totalValue/1000000))}<small style="font-size:12px;color:var(--text-3)">M</small></span><div class="sc-icon">${I.chart}</div></div>
            <div class="stat-cell c-green" style="position:relative"><span class="sc-label">Total Unit</span><span class="sc-value">${DB.fmtNum(totalUnits)}</span><div class="sc-icon">${I.box}</div></div>
            <div class="stat-cell c-amber" style="position:relative"><span class="sc-label">Menipis</span><span class="sc-value" style="color:var(--warning)">${low}</span><div class="sc-icon">${I.alert}</div></div>
            <div class="stat-cell c-red" style="position:relative"><span class="sc-label">Habis</span><span class="sc-value" style="color:var(--danger)">${out}</span><div class="sc-icon">${I.x}</div></div>
          </div>
          <div class="grid-2">
            <div class="card card-pad" style="height:280px"><h4 style="font-size:12px;font-weight:700;margin-bottom:12px">Nilai per Kategori</h4><div style="height:calc(100% - 30px)"><canvas id="catChart"></canvas></div></div>
            <div class="card card-pad" style="height:280px"><h4 style="font-size:12px;font-weight:700;margin-bottom:12px">Status Stok</h4><div style="height:calc(100% - 30px)"><canvas id="statusChart"></canvas></div></div>
          </div>
        </div>
      </div>
    `;

    Charts.make('catChart', {
      type: 'bar',
      data: { labels: catLabels, datasets: [{ label: 'Nilai (Rp)', data: catValues, backgroundColor: '#2563eb', borderRadius: 8, barThickness: 22 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => (v/1000000) + 'M' } } } }
    });
    Charts.make('statusChart', {
      type: 'doughnut',
      data: { labels: ['Aman', 'Menipis', 'Habis'], datasets: [{ data: [products.length - low - out, low - out, out], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }] },
      options: { cutout: '68%', plugins: { legend: { position: 'bottom' } } }
    });
  },

  movement() {
    this._active = 'movement';
    const content = document.getElementById('pageContent');
    const txs = DB.get('transactions');
    const inCount = txs.filter(t => t.type === 'in').length;
    const outCount = txs.filter(t => t.type === 'out').length;
    const adjCount = txs.filter(t => t.type === 'adjustment').length;
    content.innerHTML = `
      ${App.pageHeader('🔄', 'Stock Movement Report', 'Distribusi pergerakan stok', '')}
      <div class="analytics-layout">
        ${this._timeRail()}
        <div>
          <div class="stat-strip">
            <div class="stat-cell c-green" style="position:relative"><span class="sc-label">Masuk</span><span class="sc-value">${inCount}</span><div class="sc-icon">${I.truck}</div></div>
            <div class="stat-cell c-amber" style="position:relative"><span class="sc-label">Keluar</span><span class="sc-value">${outCount}</span><div class="sc-icon">${I.package}</div></div>
            <div class="stat-cell c-blue" style="position:relative"><span class="sc-label">Penyesuaian</span><span class="sc-value">${adjCount}</span><div class="sc-icon">${I.settings}</div></div>
          </div>
          <div class="card card-pad" style="height:300px"><h4 style="font-size:12px;font-weight:700;margin-bottom:12px">Tren Transaksi</h4><div style="height:calc(100% - 30px)"><canvas id="movChart"></canvas></div></div>
        </div>
      </div>
    `;
    Charts.make('movChart', {
      type: 'line',
      data: { labels: ['Minggu 1','Minggu 2','Minggu 3','Minggu 4'], datasets: [
        { label: 'Masuk', data: [40,55,35,60], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: .35 },
        { label: 'Keluar', data: [30,45,50,40], borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,.1)', fill: true, tension: .35 }
      ]},
      options: { scales: { y: { beginAtZero: true } } }
    });
  },

  fast() {
    this._active = 'fast';
    const content = document.getElementById('pageContent');
    const products = DB.get('products').slice().sort((a,b) => b.stock - a.stock).slice(0, 8);
    content.innerHTML = `
      ${App.pageHeader('⚡', 'Fast Moving Products', 'Produk dengan pergerakan stok tertinggi', '')}
      <div class="analytics-layout">
        ${this._timeRail()}
        <div>
          <div class="card"><div class="rank-list">
            ${products.map((p, i) => {
              const pct = products[0] ? Math.round((p.stock / products[0].stock) * 100) : 0;
              return `<div class="rank-item"><span class="rank-no">${String(i+1).padStart(2,'0')}</span><div class="product-thumb" style="width:32px;height:32px;font-size:12px">${esc(p.name.split(' ')[0][0])}</div><div class="rank-info"><strong>${esc(p.name)}</strong><small>${esc(p.sku)} · stok ${p.stock}</small></div><div class="rank-bar"><div style="width:${Math.max(pct,4)}%"></div></div><span class="rank-val">${p.stock} unit</span></div>`;
            }).join('')}
          </div></div>
        </div>
      </div>
    `;
  },

  low() {
    this._active = 'low';
    const content = document.getElementById('pageContent');
    const low = DB.lowStock();
    content.innerHTML = `
      ${App.pageHeader('⚠️', 'Low Stock Report', 'Produk yang perlu restock', `
        <button class="btn btn-sm btn-ghost" onclick="ExportService.excel('low-stock.xls','LowStock',['SKU','Nama','Rak','Stok','Min'],${JSON.stringify(low.map(p => [p.sku, p.name, p.location, p.stock, p.minStock]))})">${I.download} Excel</button>
      `)}
      <div class="analytics-layout">
        ${this._timeRail()}
        <div>
          <div class="card"><div class="table-wrap"><table>
            <thead><tr><th>Produk</th><th>SKU</th><th>Rak</th><th>Stok</th><th>Min</th><th>Status</th></tr></thead>
            <tbody>${low.map(p => `<tr><td><span class="td-main">${esc(p.name)}</span></td><td>${esc(p.sku)}</td><td><span class="chip">${esc(p.location)}</span></td><td><strong style="color:${p.stock<=0?'var(--danger)':'var(--warning)'}">${p.stock}</strong></td><td>${p.minStock}</td><td>${statusBadge(p.stock<=0?'habis':'menipis')}</td></tr>`).join('')}</tbody>
          </table></div></div>
        </div>
      </div>
    `;
  },

  purchase() {
    this._active = 'purchase';
    const content = document.getElementById('pageContent');
    const pos = DB.get('pos');
    const total = DB.purchaseTotal();
    content.innerHTML = `
      ${App.pageHeader('📦', 'Purchase Report', 'Ringkasan pembelian', '')}
      <div class="analytics-layout">
        ${this._timeRail()}
        <div>
          <div class="stat-strip">
            <div class="stat-cell c-blue" style="position:relative"><span class="sc-label">Total PO</span><span class="sc-value">${pos.length}</span><div class="sc-icon">${I.truck}</div></div>
            <div class="stat-cell c-green" style="position:relative"><span class="sc-label">Nilai Pembelian</span><span class="sc-value">${DB.fmtMoney(Math.round(total/1000000))}<small style="font-size:12px;color:var(--text-3)">M</small></span><div class="sc-icon">${I.chart}</div></div>
          </div>
          <div class="card card-pad" style="height:300px"><h4 style="font-size:12px;font-weight:700;margin-bottom:12px">Nilai PO per Status</h4><div style="height:calc(100% - 30px)"><canvas id="poChart"></canvas></div></div>
        </div>
      </div>
    `;
    const byStatus = {};
    pos.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + p.total; });
    Charts.make('poChart', {
      type: 'bar',
      data: { labels: Object.keys(byStatus), datasets: [{ label: 'Nilai (Rp)', data: Object.values(byStatus), backgroundColor: ['#94a3b8','#2563eb','#10b981','#ef4444'], borderRadius: 8, barThickness: 30 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => (v/1000000) + 'M' } } } }
    });
  },

  export() {
    this._active = 'export';
    const content = document.getElementById('pageContent');
    const reports = [
      { name: 'Inventory Summary', desc: 'Nilai & status stok per kategori', icon: I.chart, fn: () => ExportService.excel('inventory-summary.xls','Summary',['Kategori','Nilai'],JSON.stringify(Object.entries(DB.get('products').reduce((a,p)=>{a[p.category]=(a[p.category]||0)+(p.stock*p.cost);return a;},{})))) },
      { name: 'Stock Movement', desc: 'Riwayat pergerakan stok', icon: I.activity, fn: () => ExportService.csv('stock-movement.csv',['Tanggal','Produk','Tipe','Qty','Alasan'],JSON.stringify(DB.get('transactions').map(t => [DB.fmtDate(t.createdAt), t.productName, t.type, t.qty, t.reason]))) },
      { name: 'Low Stock Report', desc: 'Produk di bawah minimum', icon: I.alert, fn: () => ExportService.excel('low-stock.xls','LowStock',['SKU','Nama','Stok','Min'],JSON.stringify(DB.lowStock().map(p => [p.sku, p.name, p.stock, p.minStock]))) },
      { name: 'Purchase Report', desc: 'Ringkasan purchase order', icon: I.truck, fn: () => ExportService.csv('purchase-report.csv',['Nomor','Supplier','Total','Status'],JSON.stringify(DB.get('pos').map(p => [p.number, p.supplierName, p.total, p.status]))) },
      { name: 'Full Inventory PDF', desc: 'Cetak laporan inventori lengkap', icon: I.print, fn: () => ExportService.pdf('Laporan Inventori', { subtitle: 'StockPilot — ' + new Date().toLocaleDateString('id-ID'), sections: [{ title: 'Produk', headers: ['SKU','Nama','Rak','Stok','Harga'], rows: DB.get('products').slice(0,30).map(p => [p.sku, p.name, p.location, p.stock, p.price]) }] }) }
    ];
    content.innerHTML = `
      ${App.pageHeader('📑', 'Export Reports', 'Pilih laporan untuk diekspor', '')}
      <div class="analytics-layout">
        ${this._timeRail()}
        <div>
          ${reports.map((r, i) => `
            <div class="report-item">
              <div class="report-ic">${r.icon}</div>
              <div class="report-info"><strong>${esc(r.name)}</strong><small>${esc(r.desc)}</small></div>
              <button class="btn btn-sm btn-primary" onclick="AnalyticsPage.runExport(${i})">${I.download} Export</button>
            </div>`).join('')}
        </div>
      </div>
    `;
    this._reports = reports;
  },

  runExport(i) { this._reports[i].fn(); Toast.show('Laporan diekspor', 'success'); }
};