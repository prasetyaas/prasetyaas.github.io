/* ============================================
   StockPilot — Inventory Operations (Workflow)
   ============================================ */

const InventoryPage = {
  _active: 'stockin',

  /* ---------- Stepper ---------- */
  _stepper() {
    const steps = [
      { label: 'Stok Masuk', icon: '⬇', key: 'stockin' },
      { label: 'Stok Keluar', icon: '⬆', key: 'stockout' },
      { label: 'Penyesuaian', icon: '⚙', key: 'adjust' },
      { label: 'Audit', icon: '🔍', key: 'audit' }
    ];
    const activeIdx = steps.findIndex(s => s.key === this._active);
    return `<div class="stepper">${steps.map((s, i) => `
      <div class="step ${i === activeIdx ? 'active' : i < activeIdx ? 'done' : ''}">
        <div class="step-dot">${s.icon}</div>
        <div class="step-label">${s.label}</div>
      </div>`).join('')}</div>`;
  },

  /* ---------- Stock In ---------- */
  stockin() {
    this._active = 'stockin';
    const content = document.getElementById('pageContent');
    const txs = DB.get('transactions').filter(t => t.type === 'in').slice(0, 10);
    content.innerHTML = `
      ${App.pageHeader('📥', 'Stock In', 'Pencatatan stok masuk dari pembelian', `
        <button class="btn btn-primary" onclick="InventoryPage.stockInForm()">${I.plus} Stok Masuk</button>
      `)}
      ${this._stepper()}
      <div class="section"><div class="section-head"><div class="section-title"><span class="st-ic">${I.truck}</span><h3>Riwayat Stok Masuk</h3></div></div>
      <div class="card"><div class="timeline">
        ${txs.map(t => `<div class="tl-item"><div class="tl-time">${DB.fmtDateShort(t.createdAt)}</div><div class="tl-body"><strong>⬇ ${esc(t.productName)}</strong> +${t.qty} unit <span class="tl-tag" style="color:var(--accent)">${esc(t.reason)}</span></div></div>`).join('')}
      </div></div></div>
    `;
  },

  stockInForm(productId = '') {
    const products = DB.get('products');
    Modal.open({
      title: 'Stok Masuk', icon: '📥',
      body: `
        <div class="form-grid">
          <label class="field full"><span>Produk</span><select id="siProduct" class="input">${products.map(p => `<option value="${p.id}" ${p.id === productId ? 'selected' : ''}>${esc(p.name)} (stok ${p.stock})</option>`).join('')}</select></label>
          <label class="field"><span>Jumlah</span><input id="siQty" class="input" type="number" min="1" value="1"></label>
          <label class="field"><span>Referensi</span><input id="siRef" class="input" placeholder="PO-001"></label>
          <label class="field full"><span>Catatan</span><input id="siNote" class="input" placeholder="Pembelian dari supplier"></label>
        </div>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" id="siSave">Simpan</button>`
    });
    document.getElementById('siSave').onclick = () => {
      const pid = document.getElementById('siProduct').value;
      const qty = parseInt(document.getElementById('siQty').value) || 1;
      const ref = document.getElementById('siRef').value;
      const note = document.getElementById('siNote').value || 'Pembelian';
      if (!pid) return;
      DB.stockIn(pid, qty, 'PO', ref, note);
      DB.notify('Stok Masuk', `+${qty} unit dicatat`, 'success', '📥');
      Modal.close(); Toast.show('Stok masuk berhasil', 'success');
      this.stockin();
    };
  },

  /* ---------- Stock Out ---------- */
  stockout() {
    this._active = 'stockout';
    const content = document.getElementById('pageContent');
    const txs = DB.get('transactions').filter(t => t.type === 'out').slice(0, 10);
    content.innerHTML = `
      ${App.pageHeader('📤', 'Stock Out', 'Pencatatan stok keluar (penjualan/pemakaian)', `
        <button class="btn btn-primary" onclick="InventoryPage.stockOutForm()">${I.plus} Stok Keluar</button>
      `)}
      ${this._stepper()}
      <div class="section"><div class="section-head"><div class="section-title"><span class="st-ic">${I.package}</span><h3>Riwayat Stok Keluar</h3></div></div>
      <div class="card"><div class="timeline">
        ${txs.map(t => `<div class="tl-item"><div class="tl-time">${DB.fmtDateShort(t.createdAt)}</div><div class="tl-body"><strong>⬆ ${esc(t.productName)}</strong> -${t.qty} unit <span class="tl-tag" style="color:var(--warning)">${esc(t.reason)}</span></div></div>`).join('')}
      </div></div></div>
    `;
  },

  stockOutForm(productId = '') {
    const products = DB.get('products');
    Modal.open({
      title: 'Stok Keluar', icon: '📤',
      body: `
        <div class="form-grid">
          <label class="field full"><span>Produk</span><select id="soProduct" class="input">${products.map(p => `<option value="${p.id}" ${p.id === productId ? 'selected' : ''}>${esc(p.name)} (stok ${p.stock})</option>`).join('')}</select></label>
          <label class="field"><span>Jumlah</span><input id="soQty" class="input" type="number" min="1" value="1"></label>
          <label class="field"><span>Referensi</span><input id="soRef" class="input" placeholder="SO-001"></label>
          <label class="field full"><span>Catatan</span><input id="soNote" class="input" placeholder="Penjualan / pemakaian"></label>
        </div>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" id="soSave">Simpan</button>`
    });
    document.getElementById('soSave').onclick = () => {
      const pid = document.getElementById('soProduct').value;
      const qty = parseInt(document.getElementById('soQty').value) || 1;
      const ref = document.getElementById('soRef').value;
      const note = document.getElementById('soNote').value || 'Penjualan / Pemakaian';
      if (!pid) return;
      const ok = DB.stockOut(pid, qty, 'SO', ref, note);
      if (!ok) { Toast.show('Stok tidak cukup', 'error'); return; }
      DB.notify('Stok Keluar', `-${qty} unit dicatat`, 'warning', '📤');
      Modal.close(); Toast.show('Stok keluar berhasil', 'success');
      this.stockout();
    };
  },

  /* ---------- Adjustment ---------- */
  adjust() {
    this._active = 'adjust';
    const content = document.getElementById('pageContent');
    const txs = DB.get('transactions').filter(t => t.type === 'adjustment').slice(0, 10);
    content.innerHTML = `
      ${App.pageHeader('⚙️', 'Stock Adjustment', 'Penyesuaian stok (koreksi selisih)', `
        <button class="btn btn-primary" onclick="InventoryPage.adjustForm()">${I.plus} Penyesuaian</button>
      `)}
      ${this._stepper()}
      <div class="section"><div class="section-head"><div class="section-title"><span class="st-ic">${I.settings}</span><h3>Riwayat Penyesuaian</h3></div></div>
      <div class="card"><div class="timeline">
        ${txs.map(t => `<div class="tl-item"><div class="tl-time">${DB.fmtDateShort(t.createdAt)}</div><div class="tl-body"><strong>⚙ ${esc(t.productName)}</strong> ${t.qty > 0 ? '+' : ''}${t.qty} <span class="tl-tag" style="color:var(--info)">${esc(t.reason)}</span></div></div>`).join('')}
      </div></div></div>
    `;
  },

  adjustForm(productId = '') {
    const products = DB.get('products');
    Modal.open({
      title: 'Stock Adjustment', icon: '⚙️',
      body: `
        <div class="form-grid">
          <label class="field full"><span>Produk</span><select id="adProduct" class="input">${products.map(p => `<option value="${p.id}" ${p.id === productId ? 'selected' : ''}>${esc(p.name)} (stok ${p.stock})</option>`).join('')}</select></label>
          <label class="field"><span>Selisih (+/-)</span><input id="adQty" class="input" type="number" value="0"></label>
          <label class="field full"><span>Alasan</span><input id="adNote" class="input" placeholder="Koreksi selisih fisik"></label>
        </div>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" id="adSave">Simpan</button>`
    });
    document.getElementById('adSave').onclick = () => {
      const pid = document.getElementById('adProduct').value;
      const qty = parseInt(document.getElementById('adQty').value) || 0;
      const note = document.getElementById('adNote').value || 'Penyesuaian stok';
      if (!pid || qty === 0) return;
      DB.adjust(pid, qty, note);
      Modal.close(); Toast.show('Penyesuaian berhasil', 'success');
      this.adjust();
    };
  },

  /* ---------- Movement ---------- */
  movement() {
    this._active = 'movement';
    const content = document.getElementById('pageContent');
    const txs = [...DB.get('transactions')].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);
    content.innerHTML = `
      ${App.pageHeader('🔄', 'Stock Movement', 'Riwayat pergerakan stok terbaru', '')}
      ${this._stepper()}
      <div class="card"><div class="timeline">
        ${txs.map(t => `<div class="tl-item"><div class="tl-time">${DB.fmtDateShort(t.createdAt)}</div><div class="tl-body"><strong>${t.type==='in'?'⬇':t.type==='out'?'⬆':'⚙'} ${esc(t.productName)}</strong> ${t.qty>0?'+':''}${t.qty} <span class="tl-tag" style="color:${t.type==='in'?'var(--accent)':t.type==='out'?'var(--warning)':'var(--info)'}">${esc(t.reason)}</span></div></div>`).join('')}
      </div></div>
    `;
  },

  /* ---------- Audit ---------- */
  audit() {
    this._active = 'audit';
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    content.innerHTML = `
      ${App.pageHeader('🔍', 'Inventory Audit', 'Periksa kondisi stok saat ini', `
        <button class="btn btn-sm btn-ghost" onclick="ExportService.excel('inventory-audit.xls','Audit',['SKU','Nama','Rak','Stok','Min','Max','Nilai'],${JSON.stringify(products.map(p => [p.sku, p.name, p.location, p.stock, p.minStock, p.maxStock, p.stock*p.cost]))})">${I.download} Excel</button>
      `)}
      ${this._stepper()}
      <div class="section"><div class="section-head"><div class="section-title"><span class="st-ic">${I.check}</span><h3>Status Stok</h3></div></div>
      <div class="grid-3">
        <div class="card card-pad" style="text-align:center"><div style="font-size:28px;font-weight:800;color:var(--accent)">${DB.get('products').filter(p => p.stock > p.minStock).length}</div><div style="font-size:11px;color:var(--text-3)">Aman</div></div>
        <div class="card card-pad" style="text-align:center"><div style="font-size:28px;font-weight:800;color:var(--warning)">${DB.lowStock().filter(p => p.stock > 0).length}</div><div style="font-size:11px;color:var(--text-3)">Menipis</div></div>
        <div class="card card-pad" style="text-align:center"><div style="font-size:28px;font-weight:800;color:var(--danger)">${DB.outOfStock().length}</div><div style="font-size:11px;color:var(--text-3)">Habis</div></div>
      </div></div>
    `;
  },

  /* ---------- Transaction History ---------- */
  history() {
    this._active = 'history';
    const content = document.getElementById('pageContent');
    const txs = [...DB.get('transactions')].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    content.innerHTML = `
      ${App.pageHeader('🧾', 'Transaction History', 'Semua transaksi inventori', `
        <button class="btn btn-sm btn-ghost" onclick="ExportService.csv('transactions.csv',['Tanggal','Produk','SKU','Tipe','Qty','Alasan','Ref'],${JSON.stringify(txs.map(t => [DB.fmtDate(t.createdAt), t.productName, t.sku, t.type, t.qty, t.reason, t.refId]))})">${I.download} CSV</button>
      `)}
      ${this._stepper()}
      <div class="card"><div class="timeline">
        ${txs.slice(0,30).map(t => `<div class="tl-item"><div class="tl-time">${DB.fmtDateShort(t.createdAt)}</div><div class="tl-body"><strong>${t.type==='in'?'⬇':t.type==='out'?'⬆':'⚙'} ${esc(t.productName)}</strong> ${t.qty>0?'+':''}${t.qty} <span class="tl-tag" style="color:${t.type==='in'?'var(--accent)':t.type==='out'?'var(--warning)':'var(--info)'}">${esc(t.reason)}</span></div></div>`).join('')}
      </div></div>
    `;
  }
};