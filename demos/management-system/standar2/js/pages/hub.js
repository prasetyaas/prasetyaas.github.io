/* ============================================
   StockPilot — Operations Hub (Command Center)
   ============================================ */

const HubPage = {
  _active: 'overview',

  overview() {
    this._active = 'overview';
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    const low = DB.lowStock();
    const out = DB.outOfStock();
    const txs = DB.recentTransactions(6);
    const logs = [...DB.get('activityLogs')].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0,4);

    content.innerHTML = `
      ${App.pageHeader('🏭', 'Operations Hub', 'Pusat kendali inventori — insight & keputusan', `
        <button class="btn btn-primary" onclick="InventoryPage.stockInForm()">${I.plus} Stok Masuk</button>
      `)}

      <div class="greeting-bar">
        <div class="g-ic">${I.box}</div>
        <div>
          <h3>Selamat datang di StockPilot 👋</h3>
          <p><span class="pulse-dot" style="display:inline-block"></span> Sistem aktif — data inventori real-time.</p>
        </div>
        <div style="margin-left:auto;display:flex;gap:12px">
          <div class="dot-decision" style="border:none;background:transparent;box-shadow:none;padding:0">
            <div><div class="dd-label">Nilai Stok</div><div class="dd-val" style="font-size:20px">${DB.fmtMoney(Math.round(DB.totalValue()/1000000))}<small style="font-size:11px;color:var(--text-3)">M</small></div></div>
          </div>
        </div>
      </div>

      <div class="stat-strip">
        <div class="stat-cell c-blue" style="position:relative">
          <span class="sc-label">Total Produk</span><span class="sc-value">${products.length}</span>
          <span class="sc-sub">${DB.activeProducts().length} aktif</span>
          <div class="sc-icon">${I.package}</div>
        </div>
        <div class="stat-cell c-green" style="position:relative">
          <span class="sc-label">Total Unit Stok</span><span class="sc-value">${DB.fmtNum(DB.totalUnits())}</span>
          <span class="sc-sub">Nilai ${DB.fmtMoney(Math.round(DB.totalValue()/1000000))}M</span>
          <div class="sc-icon">${I.box}</div>
        </div>
        <div class="stat-cell c-amber" style="position:relative">
          <span class="sc-label">Stok Menipis</span><span class="sc-value" style="color:var(--warning)">${low.length}</span>
          <span class="sc-sub">Perlu restock segera</span>
          <div class="sc-icon">${I.alert}</div>
        </div>
        <div class="stat-cell c-red" style="position:relative">
          <span class="sc-label">Stok Habis</span><span class="sc-value" style="color:var(--danger)">${out.length}</span>
          <span class="sc-sub">Out of stock</span>
          <div class="sc-icon">${I.x}</div>
        </div>
      </div>

      <div class="hub-layout">
        <div class="stack">
          <div class="section">
            <div class="section-head"><div class="section-title"><span class="st-ic">${I.alert}</span><h3>Perlu Perhatian</h3><span class="count">${low.length}</span></div>
              <button class="btn btn-sm btn-ghost" onclick="HubPage.lowStock()">Lihat →</button></div>
            ${low.length ? low.slice(0,3).map(p => `
              <div class="card card-hover card-pad" style="margin-bottom:10px;display:flex;align-items:center;gap:12px">
                <div class="product-thumb amber">${esc(p.name.split(' ')[0][0])}${esc(p.name.split(' ')[1]?p.name.split(' ')[1][0]:'')}</div>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:12.5px">${esc(p.name)}</div>
                  <div style="font-size:10.5px;color:var(--text-3)">${esc(p.sku)} · RAK ${esc(p.location)}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:700;font-size:14px;color:var(--warning)">${p.stock} unit</div>
                  <div style="font-size:10px;color:var(--text-3)">min ${p.minStock}</div>
                </div>
              </div>`).join('') : '<div class="card card-pad" style="text-align:center;color:var(--text-3)">Semua stok aman ✓</div>'}
          </div>

          <div class="section">
            <div class="section-head"><div class="section-title"><span class="st-ic">${I.activity}</span><h3>Aktivitas Terakhir</h3></div>
              <button class="btn btn-sm btn-ghost" onclick="HubPage.todayActivity()">Semua →</button></div>
            <div class="card"><div class="timeline">
              ${logs.map(l => `<div class="tl-item"><div class="tl-time">${DB.fmtDateShort(l.timestamp)}</div><div class="tl-body"><strong>${esc(l.user)}</strong> — ${esc(l.detail)}</div></div>`).join('')}
            </div></div>
          </div>
        </div>

        <div class="stack">
          <div class="section">
            <div class="section-head"><div class="section-title"><span class="st-ic">${I.trend}</span><h3>Transaksi Terbaru</h3></div></div>
            <div class="card"><div class="timeline">
              ${txs.map(t => `
                <div class="tl-item">
                  <div class="tl-time">${DB.fmtDateShort(t.createdAt)}</div>
                  <div class="tl-body">
                    <strong>${t.type === 'in' ? '⬇ Masuk' : t.type === 'out' ? '⬆ Keluar' : '⚙ Penyesuaian'}</strong> — ${esc(t.productName)} (${t.qty > 0 ? '+' : ''}${t.qty})
                    <span class="tl-tag" style="color:${t.type === 'in' ? 'var(--accent)' : t.type === 'out' ? 'var(--warning)' : 'var(--info)'}">${esc(t.reason)}</span>
                  </div>
                </div>`).join('')}
            </div></div>
          </div>
        </div>
      </div>
    `;
  },

  todayActivity() {
    this._active = 'todayActivity';
    const content = document.getElementById('pageContent');
    const logs = [...DB.get('activityLogs')].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    content.innerHTML = `
      ${App.pageHeader('📅', "Today's Activity", 'Semua aktivitas sistem terbaru', '')}
      <div class="card"><div class="timeline">
        ${logs.map(l => `<div class="tl-item"><div class="tl-time">${DB.fmtDateTime(l.timestamp)}</div><div class="tl-body"><strong>${esc(l.user)}</strong> — ${esc(l.detail)} <span class="tl-tag" style="color:var(--primary)">${esc(l.entity)}</span></div></div>`).join('')}
      </div></div>
    `;
  },

  snapshot() {
    this._active = 'snapshot';
    const content = document.getElementById('pageContent');
    const cats = DB.get('categories').map(c => ({
      name: c.name,
      total: DB.get('products').filter(p => p.categoryId === c.id).reduce((s,p) => s + (p.stock * p.cost), 0),
      count: DB.get('products').filter(p => p.categoryId === c.id).length
    })).filter(c => c.count > 0).sort((a,b) => b.total - a.total);

    content.innerHTML = `
      ${App.pageHeader('📊', 'Business Snapshot', 'Ringkasan nilai inventori per kategori', '')}
      <div class="stat-strip">
        <div class="stat-cell c-blue" style="position:relative"><span class="sc-label">Nilai Inventori</span><span class="sc-value">${DB.fmtMoney(Math.round(DB.totalValue()/1000000))}<small style="font-size:12px;color:var(--text-3)">M</small></span><div class="sc-icon">${I.chart}</div></div>
        <div class="stat-cell c-green" style="position:relative"><span class="sc-label">Total PO</span><span class="sc-value">${DB.get('pos').length}</span><span class="sc-sub">${DB.fmtMoney(Math.round(DB.purchaseTotal()/1000000))}M nilai</span><div class="sc-icon">${I.truck}</div></div>
      </div>
      <div class="section"><div class="section-head"><div class="section-title"><span class="st-ic">${I.layering}</span><h3>Nilai per Kategori</h3></div></div>
      ${cats.slice(0,10).map((c,i) => {
        const pct = cats[0] ? Math.round((c.total / cats[0].total) * 100) : 0;
        return `<div class="card card-pad" style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="font-weight:600">${esc(c.name)}</span><span>${DB.fmtMoney(c.total)} · ${c.count} produk</span></div>
          <div class="stockbar"><div class="ok" style="width:${Math.max(pct,4)}%"></div></div>
        </div>`;
      }).join('')}
      </div>
    `;
  },

  lowStock() {
    this._active = 'lowStock';
    const content = document.getElementById('pageContent');
    const low = DB.lowStock();
    const out = DB.outOfStock();
    content.innerHTML = `
      ${App.pageHeader('⚠️', 'Low Stock Alert', `Produk dengan stok di bawah minimum (${low.length}) & habis (${out.length})`, `
        <button class="btn btn-sm btn-ghost" onclick="ExportService.csv('low-stock.csv',['SKU','Nama','Rak','Stok','Min','Status'],${JSON.stringify(low.map(p => [p.sku, p.name, p.location, p.stock, p.minStock, p.stock<=0?'Habis':'Menipis']))})">${I.download} CSV</button>
      `)}
      ${low.length ? low.map(p => `
        <div class="card card-hover card-pad" style="margin-bottom:10px;display:flex;align-items:center;gap:12px">
          <div class="product-thumb ${p.stock <= 0 ? '' : 'amber'}">${esc(p.name.split(' ')[0][0])}</div>
          <div style="flex:1"><div style="font-weight:600;font-size:12.5px">${esc(p.name)}</div><div style="font-size:10.5px;color:var(--text-3)">${esc(p.sku)} · RAK ${esc(p.location)} · min ${p.minStock}</div></div>
          <div style="text-align:right"><div style="font-weight:700;font-size:16px;color:${p.stock<=0?'var(--danger)':'var(--warning)'}">${p.stock}</div><div style="font-size:10px;color:var(--text-3)">unit</div></div>
          <button class="btn btn-sm btn-primary" onclick="InventoryPage.stockInForm('${p.id}')">Restock</button>
        </div>`).join('') : '<div class="card card-pad" style="text-align:center;padding:48px;color:var(--text-3)"><div class="es-ic" style="margin:0 auto 12px">🎉</div>Semua stok aman</div>'}
    `;
  },

  recentTx() {
    this._active = 'recentTx';
    const content = document.getElementById('pageContent');
    const txs = [...DB.get('transactions')].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 25);
    content.innerHTML = `${App.pageHeader('🧾', 'Recent Transactions', 'Transaksi inventori terbaru', '')}` +
      `<div class="card"><div class="timeline">` +
      txs.map(t => `<div class="tl-item"><div class="tl-time">${DB.fmtDateShort(t.createdAt)}</div><div class="tl-body"><strong>${t.type==='in'?'⬇ Masuk':t.type==='out'?'⬆ Keluar':'⚙ Penyesuaian'}</strong> — ${esc(t.productName)} (${t.qty>0?'+':''}${t.qty}) <span class="tl-tag" style="color:${t.type==='in'?'var(--accent)':t.type==='out'?'var(--warning)':'var(--info)'}">${esc(t.reason)}</span></div></div>`).join('') +
      `</div></div>`;
  }
};
