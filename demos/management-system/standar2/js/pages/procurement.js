/* ============================================
   StockPilot — Procurement (Order Board)
   ============================================ */

const ProcurementPage = {
  _active: 'po',

  request() {
    this._active = 'request';
    const content = document.getElementById('pageContent');
    const pos = DB.get('pos').filter(p => p.status === 'draft');
    content.innerHTML = `
      ${App.pageHeader('📝', 'Purchase Request', 'Permintaan pembelian (draft)', `
        <button class="btn btn-primary" onclick="ProcurementPage.createPO()">${I.plus} Buat Request</button>
      `)}
      <div class="board-cols">
        <div class="board-col"><div class="board-col-head">Draft <span class="badge neutral">${pos.length}</span></div>
          ${pos.map(p => `
            <div class="board-item" onclick="ProcurementPage.showPO('${p.id}')">
              <div style="font-weight:700;font-size:12.5px">${esc(p.number)}</div>
              <div style="font-size:11px;color:var(--text-3);margin:4px 0">${esc(p.supplierName)}</div>
              <div style="display:flex;justify-content:space-between;font-size:11px"><span>${p.itemCount} item</span><strong>${DB.fmtMoney(p.total)}</strong></div>
            </div>`).join('') || '<div style="text-align:center;color:var(--text-3);padding:20px;font-size:12px">Tidak ada draft</div>'}
        </div>
        <div class="board-col"><div class="board-col-head">Approved <span class="badge primary">${DB.get('pos').filter(p => p.status === 'approved').length}</span></div>
          ${DB.get('pos').filter(p => p.status === 'approved').slice(0,5).map(p => `
            <div class="board-item" onclick="ProcurementPage.showPO('${p.id}')">
              <div style="font-weight:700;font-size:12.5px">${esc(p.number)}</div>
              <div style="font-size:11px;color:var(--text-3);margin:4px 0">${esc(p.supplierName)}</div>
              <div style="display:flex;justify-content:space-between;font-size:11px"><span>${p.itemCount} item</span><strong>${DB.fmtMoney(p.total)}</strong></div>
            </div>`).join('') || '<div style="text-align:center;color:var(--text-3);padding:20px;font-size:12px">Belum ada</div>'}
        </div>
        <div class="board-col"><div class="board-col-head">Received <span class="badge success">${DB.get('pos').filter(p => p.status === 'received').length}</span></div>
          ${DB.get('pos').filter(p => p.status === 'received').slice(0,5).map(p => `
            <div class="board-item" onclick="ProcurementPage.showPO('${p.id}')">
              <div style="font-weight:700;font-size:12.5px">${esc(p.number)}</div>
              <div style="font-size:11px;color:var(--text-3);margin:4px 0">${esc(p.supplierName)}</div>
              <div style="display:flex;justify-content:space-between;font-size:11px"><span>${p.itemCount} item</span><strong>${DB.fmtMoney(p.total)}</strong></div>
            </div>`).join('') || '<div style="text-align:center;color:var(--text-3);padding:20px;font-size:12px">Belum ada</div>'}
        </div>
      </div>
    `;
  },

  po() {
    this._active = 'po';
    const content = document.getElementById('pageContent');
    const pos = DB.get('pos');
    content.innerHTML = `
      ${App.pageHeader('📦', 'Purchase Order', 'Daftar purchase order', `
        <button class="btn btn-primary" onclick="ProcurementPage.createPO()">${I.plus} Buat PO</button>
      `)}
      <div class="card"><div class="table-wrap"><table>
        <thead><tr><th>Nomor</th><th>Supplier</th><th>Item</th><th>Total</th><th>Status</th><th>Tanggal</th></tr></thead>
        <tbody>${pos.slice(0, 20).map(p => `
          <tr onclick="ProcurementPage.showPO('${p.id}')" style="cursor:pointer">
            <td><span class="td-main">${esc(p.number)}</span></td>
            <td>${esc(p.supplierName)}</td>
            <td>${p.itemCount}</td>
            <td class="text-right">${DB.fmtMoney(p.total)}</td>
            <td>${statusBadge(p.status)}</td>
            <td>${DB.fmtDateShort(p.createdAt)}</td>
          </tr>`).join('')}
        </tbody></table></div></div>
    `;
  },

  createPO() {
    const suppliers = DB.get('suppliers');
    Modal.open({
      title: 'Buat Purchase Order', icon: '📦',
      body: `
        <div class="form-grid">
          <label class="field full"><span>Supplier</span><select id="poSupplier" class="input">${suppliers.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
          <label class="field"><span>Jumlah Item</span><input id="poItems" class="input" type="number" value="1" min="1"></label>
          <label class="field"><span>Total (Rp)</span><input id="poTotal" class="input" type="number" value="1000000"></label>
        </div>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" id="poSave">Simpan</button>`
    });
    document.getElementById('poSave').onclick = () => {
      const sup = DB.supplier(document.getElementById('poSupplier').value);
      const id = 'PO-' + String(DB.get('pos').length + 1).padStart(3, '0');
      DB.add('pos', {
        id, number: id, supplierId: sup.id, supplierName: sup.name,
        itemCount: parseInt(document.getElementById('poItems').value) || 1,
        total: parseInt(document.getElementById('poTotal').value) || 0,
        status: 'draft', createdAt: DB.now(), paid: false
      });
      DB.log('create', 'purchase', id, `Membuat PO ${id}`);
      DB.notify('PO Baru', `${id} dibuat`, 'info', '📦');
      Modal.close(); Toast.show('PO dibuat', 'success');
      this.po();
    };
  },

  showPO(id) {
    const p = DB.find('pos', id);
    if (!p) return;
    SlideOver.open({
      title: p.number, icon: '📦',
      body: `
        <div class="cp-section" style="margin-bottom:16px">
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Supplier</span><strong>${esc(p.supplierName)}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Item</span><strong>${p.itemCount}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Total</span><strong>${DB.fmtMoney(p.total)}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Status</span><strong>${statusBadge(p.status)}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Tanggal</span><strong>${DB.fmtDate(p.createdAt)}</strong></div>
        </div>`,
      foot: `
        ${p.status === 'draft' ? `<button class="btn btn-primary" onclick="ProcurementPage.approvePO('${p.id}')">Approve</button>` : ''}
        ${p.status === 'approved' ? `<button class="btn btn-accent" onclick="ProcurementPage.receivePO('${p.id}')">Terima Barang</button>` : ''}
        <button class="btn btn-ghost" onclick="SlideOver.close()">Tutup</button>`
    });
  },

  approvePO(id) {
    DB.update('pos', id, { status: 'approved' });
    DB.log('approve', 'purchase', id, `Menyetujui PO ${id}`);
    Toast.show('PO disetujui', 'success');
    this.po();
  },

  receivePO(id) {
    DB.update('pos', id, { status: 'received', paid: true });
    DB.log('receive', 'purchase', id, `Menerima barang PO ${id}`);
    DB.notify('Barang Diterima', `PO ${id} diterima`, 'success', '📦');
    Toast.show('Barang diterima', 'success');
    this.po();
  },

  receiving() {
    this._active = 'receiving';
    const content = document.getElementById('pageContent');
    const approved = DB.get('pos').filter(p => p.status === 'approved');
    content.innerHTML = `
      ${App.pageHeader('🚚', 'Goods Receiving', 'PO yang menunggu penerimaan barang', '')}
      ${approved.length ? approved.map(p => `
        <div class="card card-hover card-pad" style="margin-bottom:10px;display:flex;align-items:center;gap:12px">
          <div class="product-thumb green" style="width:40px;height:40px">${I.truck}</div>
          <div style="flex:1"><div style="font-weight:700;font-size:13px">${esc(p.number)}</div><div style="font-size:11px;color:var(--text-3)">${esc(p.supplierName)} · ${p.itemCount} item · ${DB.fmtMoney(p.total)}</div></div>
          <button class="btn btn-sm btn-accent" onclick="ProcurementPage.receivePO('${p.id}')">Terima</button>
        </div>`).join('') : '<div class="card card-pad" style="text-align:center;padding:48px;color:var(--text-3)">Tidak ada PO menunggu penerimaan</div>'}
    `;
  },

  history() {
    this._active = 'history';
    const content = document.getElementById('pageContent');
    const pos = DB.get('pos').filter(p => p.status === 'received' || p.status === 'cancelled');
    content.innerHTML = `
      ${App.pageHeader('🗂️', 'Purchase History', 'Riwayat purchase order', `
        <button class="btn btn-sm btn-ghost" onclick="ExportService.csv('purchase-history.csv',['Nomor','Supplier','Item','Total','Status','Tanggal'],${JSON.stringify(pos.map(p => [p.number, p.supplierName, p.itemCount, p.total, p.status, DB.fmtDate(p.createdAt)]))})">${I.download} CSV</button>
      `)}
      <div class="card"><div class="table-wrap"><table>
        <thead><tr><th>Nomor</th><th>Supplier</th><th>Item</th><th>Total</th><th>Status</th><th>Tanggal</th></tr></thead>
        <tbody>${pos.slice(0, 20).map(p => `
          <tr><td><span class="td-main">${esc(p.number)}</span></td><td>${esc(p.supplierName)}</td><td>${p.itemCount}</td><td class="text-right">${DB.fmtMoney(p.total)}</td><td>${statusBadge(p.status)}</td><td>${DB.fmtDateShort(p.createdAt)}</td></tr>`).join('')}
        </tbody></table></div></div>
    `;
  }
};