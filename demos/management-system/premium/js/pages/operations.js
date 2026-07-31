/* ============================================
   NexaWMS Pro — Operations Pages
   Purchase · Receiving · Transfer · Movement · Adjustment
   Reservation · Issue · Return · Cycle Count
   ============================================ */

const OperationsPage = {

  /* ================= PURCHASE ================= */
  purchase() {
    const content = document.getElementById('pageContent');
    const purchases = [...DB.get('purchases')].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    const statusMap = {
      draft: ['neutral', 'Draft'], approved: ['info', 'Disetujui'],
      partial: ['warning', 'Parsial'], received: ['success', 'Diterima']
    };
    const poOpen = purchases.filter(p => ['draft','approved','partial'].includes(p.status)).length;

    content.innerHTML = `
      ${App.pageHeader('🛒', 'Purchase', 'Kelola Purchase Order dari semua supplier', `
        <button class="btn btn-ghost" onclick="OperationsPage.exportPO()">${I.download} Export</button>
        <button class="btn btn-primary" onclick="OperationsPage.openPOModal()">${I.plus} Buat PO</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.cart}</div><span class="badge info dot">Total</span></div>
          <div class="kpi-label">Purchase Order</div>
          <div class="kpi-value">${purchases.length}</div>
          <div class="kpi-sub">${poOpen} dalam proses</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.database}</div><span class="badge warning dot">Open</span></div>
          <div class="kpi-label">Nilai PO Open</div>
          <div class="kpi-value" style="font-size:20px">${DB.fmtMoney(purchases.filter(p => ['draft','approved','partial'].includes(p.status)).reduce((s,p) => s + p.total, 0))}</div>
          <div class="kpi-sub">${poOpen} PO belum diterima</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">30 hari</span></div>
          <div class="kpi-label">PO Diterima</div>
          <div class="kpi-value">${purchases.filter(p => p.status === 'received').length}</div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 2 PO</span> bulan ini</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic orange">${I.clock}</div><span class="badge primary dot">Rata-rata</span></div>
          <div class="kpi-label">Lead Time Supplier</div>
          <div class="kpi-value">6.2 <small style="font-size:13px;color:var(--text-3)">hari</small></div>
          <div class="kpi-sub"><span class="trend-down">${I.arrowDown} 0.8 hari</span> lebih cepat</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📋</span> Daftar Purchase Order</h3><div class="ch-sub">Semua transaksi pembelian</div></div>
          <div style="display:flex;gap:8px">
            <select style="width:auto" onchange="OperationsPage.filterPO(this.value)">
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Disetujui</option>
              <option value="partial">Parsial</option>
              <option value="received">Diterima</option>
            </select>
          </div>
        </div>
        ${tableHTML(
          [
            { label: 'No. PO' }, { label: 'Supplier' }, { label: 'Tanggal Order' },
            { label: 'Gudang' }, { label: 'Item' }, { label: 'Total', right: true },
            { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          purchases.map(p => `
            <tr data-po-status="${p.status}">
              ${td(`<span class="scan-badge">${esc(p.number)}</span>`)}
              ${td(`<strong>${esc(DB.supplierName(p.supplierId))}</strong><div class="cell-sub">${DB.fmtDate(p.expectedDate)} est. diterima</div>`)}
              ${td(DB.fmtDate(p.orderDate))}
              ${td(esc(DB.warehouseName(p.warehouseId)))}
              ${td(p.items.length, 'text-center num')}
              ${td(DB.fmtMoney(p.total), 'text-right num money')}
              ${td(statusBadge(p.status, statusMap))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Detail" onclick="OperationsPage.viewPO('${p.id}')">${I.eye}</button>
                <button class="icon-btn" title="Edit" onclick="OperationsPage.editPO('${p.id}')">${I.edit}</button>
                ${p.status === 'approved' ? `<button class="icon-btn" title="Proses receiving" style="color:var(--success)" onclick="OperationsPage.createReceiving('${p.id}')">${I.check}</button>` : ''}
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada purchase order'
        )}
      </div>
    `;
  },

  exportPO() {
    exportExcel('nexawms-purchase-orders.xls', 'Purchase Orders',
      ['Nomor PO', 'Supplier', 'Status', 'Tanggal Order', 'Tanggal Diterima', 'Total', 'Catatan'],
      DB.get('purchases').map(p => [
        p.number, DB.supplierName(p.supplierId),
        p.status || 'draft', DB.fmtDate(p.orderDate), p.receivedDate ? DB.fmtDate(p.receivedDate) : '-',
        p.total, p.notes || ''
      ])
    );
    DB.audit('export', 'purchase', 'ALL', 'Export data PO (Excel)', 'Admin');
    Toast.show('Data PO berhasil diexport (Excel)', 'success');
  },

  filterPO(status) {
    document.querySelectorAll('tr[data-po-status]').forEach(tr => {
      tr.style.display = (status === 'all' || tr.dataset.poStatus === status) ? '' : 'none';
    });
  },

  openPOModal(po) {
    const suppliers = DB.get('suppliers').filter(s => s.status === 'active');
    const isEdit = !!po;
    Modal.open({
      title: isEdit ? 'Edit Purchase Order' : 'Buat Purchase Order Baru',
      icon: '🛒', size: 'lg',
      body: `
        <div class="modal-form-section">
          <h4>📋 Informasi PO</h4>
          <div class="form-grid">
            <label class="field"><span>Supplier</span>
              <select id="poSupplier">${suppliers.map(s => `<option value="${s.id}" ${po && po.supplierId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
            </label>
            <label class="field"><span>Gudang Tujuan</span>
              <select id="poWarehouse">${DB.get('warehouses').map(w => `<option value="${w.id}" ${po && po.warehouseId === w.id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}</select>
            </label>
            <label class="field"><span>Tanggal Estimasi Diterima</span><input id="poExpected" type="date" value="${po ? po.expectedDate.slice(0,10) : ''}"></label>
            <label class="field"><span>Catatan</span><input id="poNotes" placeholder="Catatan internal" value="${po ? esc(po.notes || '') : ''}"></label>
          </div>
        </div>
        <div class="modal-form-section">
          <h4>📦 Item Barang</h4>
          <div id="poItems"></div>
          <button class="btn btn-ghost btn-sm" onclick="OperationsPage.addPOItem()">${I.plus} Tambah Item</button>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="OperationsPage.savePO(${isEdit ? `'${po.id}'` : 'null'})">${I.check} Simpan PO</button>`
    });
    // Add default item rows
    const items = po ? po.items : [{ productId: '', qty: 1, unitPrice: 0 }];
    items.forEach(() => this.addPOItem());
    // Prefill item values
    if (po) {
      po.items.forEach((item, idx) => {
        document.getElementById(`poItemProduct-${idx}`).value = item.productId;
        document.getElementById(`poItemQty-${idx}`).value = item.qty;
        document.getElementById(`poItemPrice-${idx}`).value = item.unitPrice;
      });
    }
  },

  editPO(id) {
    const po = DB.find('purchases', id);
    if (po) this.openPOModal(po);
  },

  addPOItem() {
    const container = document.getElementById('poItems');
    const idx = container.children.length;
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:2fr 90px 130px 30px;gap:8px;margin-bottom:8px;align-items:center';
    row.id = `poRow-${idx}`;
    row.innerHTML = `
      <select id="poItemProduct-${idx}" onchange="OperationsPage.autoPrice(${idx})">
        <option value="">— Pilih Produk —</option>
        ${DB.get('products').map(p => `<option value="${p.id}">${esc(p.name)} (${esc(p.sku)})</option>`).join('')}
      </select>
      <input id="poItemQty-${idx}" type="number" min="1" value="1" placeholder="Qty">
      <input id="poItemPrice-${idx}" type="number" min="0" placeholder="Harga" step="5000">
      <button class="icon-btn danger" style="width:28px;height:28px" onclick="OperationsPage.removePOItem(${idx})">${I.x}</button>`;
    container.appendChild(row);
  },

  removePOItem(idx) {
    const row = document.getElementById(`poRow-${idx}`);
    if (row) row.remove();
  },

  autoPrice(idx) {
    const productId = document.getElementById(`poItemProduct-${idx}`).value;
    const p = DB.product(productId);
    if (p) document.getElementById(`poItemPrice-${idx}`).value = p.cost;
  },

  savePO(existingId) {
    const itemRows = document.querySelectorAll('[id^="poRow-"]');
    const items = [];
    let valid = true;

    itemRows.forEach(row => {
      const idx = row.id.replace('poRow-', '');
      const productId = document.getElementById(`poItemProduct-${idx}`).value;
      const qty = parseInt(document.getElementById(`poItemQty-${idx}`).value) || 0;
      const unitPrice = parseInt(document.getElementById(`poItemPrice-${idx}`).value) || 0;
      if (!productId) return;
      if (qty <= 0) { valid = false; return; }
      items.push({ productId, qty, unitPrice, receivedQty: 0 });
    });

    if (!valid || !items.length) {
      Toast.show('PO harus memiliki minimal 1 item dengan qty valid', 'error');
      return;
    }

    const supplierId = document.getElementById('poSupplier').value;
    const warehouseId = document.getElementById('poWarehouse').value;
    const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

    if (existingId) {
      DB.update('purchases', existingId, { supplierId, warehouseId, items, total });
      DB.audit('update', 'purchase', existingId, `Update PO ${existingId}`, 'Admin');
      Toast.show('PO berhasil diperbarui', 'success');
    } else {
      const number = `PO-2024-${String(DB.get('purchases').length + 1).padStart(4, '0')}`;
      const po = {
        id: DB.genId('PO'),
        number,
        supplierId, warehouseId,
        status: 'draft',
        orderDate: DB.now(),
        expectedDate: document.getElementById('poExpected').value
          ? new Date(document.getElementById('poExpected').value).toISOString()
          : DB.daysAhead(7),
        receivedDate: null,
        items, total,
        notes: document.getElementById('poNotes').value || '',
        createdBy: 'Admin'
      };
      DB.add('purchases', po);
      DB.audit('create', 'purchase', po.id, `Membuat ${number} ke ${DB.supplierName(supplierId)}`, 'Admin');
      Toast.show(`PO ${number} berhasil dibuat (status Draft)`, 'success');
    }
    Modal.close();
    this.purchase();
  },

  viewPO(id) {
    const po = DB.find('purchases', id);
    if (!po) return;
    Modal.open({
      title: `Detail PO — ${po.number}`,
      icon: '🛒',
      size: 'lg',
      body: `
        <div class="form-grid" style="margin-bottom:20px">
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">SUPPLIER</div><strong>${esc(DB.supplierName(po.supplierId))}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">TANGGAL ORDER</div><strong>${DB.fmtDate(po.orderDate)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">EST. DITERIMA</div><strong>${DB.fmtDate(po.expectedDate)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">GUDANG</div><strong>${esc(DB.warehouseName(po.warehouseId))}</strong></div>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Produk</th><th class="text-right">Qty</th><th class="text-right">Harga</th><th class="text-right">Subtotal</th></tr></thead>
          <tbody>${po.items.map(i => `
            <tr>
              <td><strong>${esc(DB.productName(i.productId))}</strong><div class="cell-sub">${esc(DB.productSku(i.productId))}</div></td>
              <td class="text-right num">${i.qty}</td>
              <td class="text-right num">${DB.fmtMoney(i.unitPrice)}</td>
              <td class="text-right num money">${DB.fmtMoney(i.qty * i.unitPrice)}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
        <div style="display:flex;justify-content:flex-end;margin-top:16px">
          <div style="text-align:right">
            <div style="color:var(--text-3);font-size:12px">TOTAL</div>
            <div style="font-size:22px;font-weight:800;color:var(--primary-3)">${DB.fmtMoney(po.total)}</div>
          </div>
        </div>
        ${po.notes ? `<div style="margin-top:14px;padding:12px;background:rgba(99,102,241,.06);border-radius:8px;font-size:12.5px;color:var(--text-2)"><strong>Catatan:</strong> ${esc(po.notes)}</div>` : ''}`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>
        ${po.status === 'draft' ? `<button class="btn btn-primary" onclick="OperationsPage.approvePO('${po.id}')">${I.check} Approve PO</button>` : ''}`
    });
  },

  approvePO(id) {
    DB.update('purchases', id, { status: 'approved' });
    DB.audit('approve', 'purchase', id, `PO disetujui`, 'Admin');
    Modal.close();
    this.purchase();
    Toast.show('PO berhasil disetujui', 'success');
  },

  createReceiving(poId) {
    const po = DB.find('purchases', poId);
    if (!po) return;
    Modal.open({
      title: `Buat Receiving dari ${po.number}`,
      icon: '📦', size: 'lg',
      body: `
        <div class="alert info"><span class="alert-ic">🗒️</span><div><strong>Konfirmasi Penerimaan</strong><p>Pastikan barang sesuai dengan yang dipesan sebelum disimpan.</p></div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Produk</th><th class="text-right">Dipesan</th><th class="text-right">Diterima</th></tr></thead>
          <tbody>${po.items.map((i, idx) => `
            <tr>
              <td><strong>${esc(DB.productName(i.productId))}</strong></td>
              <td class="text-right num">${i.qty}</td>
              <td class="text-right"><input id="rcvQty-${idx}" type="number" min="0" max="${i.qty}" value="${i.qty}" style="width:90px;text-align:right"></td>
            </tr>`).join('')}
          </tbody>
        </table></div>
        <label class="field" style="margin-top:14px"><span>Catatan Penerimaan</span><textarea id="rcvNote" placeholder="cth: kondisi barang baik, kekurangan 2 unit..."></textarea></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-success" onclick="OperationsPage.submitReceiving('${poId}')">${I.check} Terima Barang</button>`
    });
  },

  submitReceiving(poId) {
    const po = DB.find('purchases', poId);
    if (!po) return;
    const updatedItems = po.items.map((i, idx) => {
      const qty = parseInt(document.getElementById(`rcvQty-${idx}`).value) || 0;
      return { ...i, receivedQty: qty };
    });
    const totalReceived = updatedItems.reduce((s, i) => s + i.receivedQty, 0);
    const totalOrdered = po.items.reduce((s, i) => s + i.qty, 0);
    const allReceived = totalReceived === totalOrdered;
    const partialReceived = totalReceived > 0;

    // Update on-hand stock
    updatedItems.forEach(i => {
      if (i.receivedQty > 0) {
        const product = DB.product(i.productId);
        if (product) {
          DB.update('products', product.id, { onHand: product.onHand + i.receivedQty });
          DB.add('movements', {
            id: DB.genId('MOV'),
            type: 'receive',
            productId: product.id,
            qty: i.receivedQty,
            ref: `RCV-${po.number}`,
            warehouseId: po.warehouseId,
            createdAt: DB.now(),
            user: 'Admin',
            note: `Receiving dari ${po.number}`
          });
        }
      }
    });

    // Update PO status
    DB.update('purchases', poId, {
      status: allReceived ? 'received' : partialReceived ? 'partial' : po.status,
      receivedDate: DB.now(),
      items: updatedItems
    });

    // Create receiving record
    DB.add('receivings', {
      id: DB.genId('RCV'),
      number: `RCV-2024-${String(DB.get('receivings').length + 1).padStart(4, '0')}`,
      purchaseId: poId,
      warehouseId: po.warehouseId,
      supplierId: po.supplierId,
      status: 'completed',
      receivedDate: DB.now(),
      items: updatedItems.filter(i => i.receivedQty > 0).map(i => ({ productId: i.productId, qty: i.receivedQty })),
      receivedBy: 'Admin',
      checkedBy: 'Admin',
      notes: document.getElementById('rcvNote')?.value || ''
    });

    DB.audit('receive', 'receiving', poId, `Menerima ${totalReceived}/${totalOrdered} unit dari ${po.number}`, 'Admin');
    Toast.show(`Receiving selesai — ${totalReceived} unit diterima ke inventory`, 'success');
    Modal.close();
    this.receiving();
  },

  /* ================= RECEIVING ================= */
  receiving() {
    const content = document.getElementById('pageContent');
    const receivings = [...DB.get('receivings')].sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));

    content.innerHTML = `
      ${App.pageHeader('📦', 'Receiving', 'Kelola penerimaan barang dari supplier', `
        <button class="btn btn-primary" onclick="OperationsPage.openReceivingModal()">${I.plus} Buat Receiving</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.truck}</div><span class="badge success dot">Selesai</span></div>
          <div class="kpi-label">Receiving Selesai</div>
          <div class="kpi-value">${receivings.filter(r => r.status === 'completed').length}</div>
          <div class="kpi-sub">${receivings.length} total receiving</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.clock}</div><span class="badge info dot">Jadwal</span></div>
          <div class="kpi-label">Terjadwal Hari Ini</div>
          <div class="kpi-value">${receivings.filter(r => r.status === 'scheduled').length}</div>
          <div class="kpi-sub">Menunggu kedatangan</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic orange">${I.database}</div><span class="badge warning dot">Rata-rata</span></div>
          <div class="kpi-label">Waktu Proses Receiving</div>
          <div class="kpi-value">42 <small style="font-size:13px;color:var(--text-3)">menit</small></div>
          <div class="kpi-sub"><span class="trend-down">${I.arrowDown} 5 menit</span> lebih cepat</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">🚚</span> Daftar Receiving</h3><div class="ch-sub">Riwayat penerimaan barang</div></div>
        </div>
        ${tableHTML(
          [
            { label: 'No. Receiving' }, { label: 'Supplier' }, { label: 'No. PO' },
            { label: 'Gudang' }, { label: 'Items' }, { label: 'Tanggal' },
            { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          receivings.map(r => `
            <tr>
              ${td(`<span class="scan-badge">${esc(r.number)}</span>`)}
              ${td(`<strong>${esc(DB.supplierName(r.supplierId))}</strong>`)}
              ${td(`<span class="scan-badge">${esc(DB.find('purchases', r.purchaseId)?.number || '-')}</span>`)}
              ${td(esc(DB.warehouseName(r.warehouseId)))}
              ${td(r.items.reduce((s, i) => s + i.qty, 0), 'text-center num')}
              ${td(DB.fmtDateTime(r.receivedDate))}
              ${td(statusBadge(r.status))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Detail" onclick="OperationsPage.viewReceiving('${r.id}')">${I.eye}</button>
                <button class="icon-btn" title="Print" onclick="window.print()">${I.print}</button>
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada receiving'
        )}
      </div>
    `;
  },

  openReceivingModal() {
    const approvedPOs = DB.get('purchases').filter(p => ['approved', 'partial'].includes(p.status));
    if (!approvedPOs.length) {
      Toast.show('Tidak ada PO disetujui yang menunggu receiving', 'info');
      return;
    }
    Modal.open({
      title: 'Buat Receiving Baru', icon: '📦', size: 'lg',
      body: `
        <div class="alert info"><span class="alert-ic">🚚</span><div><strong>Pilih PO yang akan diterima</strong><p>Hanya PO berstatus Disetujui / Parsial yang tersedia.</p></div></div>
        <label class="field"><span>Purchase Order</span>
          <select id="rcvPO" onchange="OperationsPage.loadPOItems()">
            ${approvedPOs.map(p => `<option value="${p.id}">${esc(p.number)} — ${esc(DB.supplierName(p.supplierId))} (${DB.fmtMoney(p.total)})</option>`).join('')}
          </select>
        </label>
        <div id="rcvPOItems"></div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-success" onclick="OperationsPage.submitReceivingFromModal()">${I.check} Proses Receiving</button>`
    });
    this.loadPOItems(true);
  },

  loadPOItems(initial = false) {
    const sel = document.getElementById('rcvPO');
    const container = document.getElementById('rcvPOItems');
    if (!sel || !container) return;
    const po = DB.find('purchases', sel.value);
    if (!po) return;
    container.innerHTML = `
      <h4 style="font-size:12px;font-weight:700;color:var(--primary-3);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Item Pesanan</h4>
      <div class="table-wrap"><table>
        <thead><tr><th>Produk</th><th class="text-right">Dipesan</th><th class="text-right">Diterima</th></tr></thead>
        <tbody>${po.items.map((i, idx) => `
          <tr>
            <td><strong>${esc(DB.productName(i.productId))}</strong><div class="cell-sub">${esc(DB.productSku(i.productId))}</div></td>
            <td class="text-right num">${i.qty}</td>
            <td class="text-right"><input id="rcvModalQty-${idx}" type="number" min="0" max="${i.qty}" value="${i.receivedQty || i.qty}" style="width:90px;text-align:right"></td>
          </tr>`).join('')}
      </tbody></table></div>`;
  },

  submitReceivingFromModal() {
    const poId = document.getElementById('rcvPO').value;
    const po = DB.find('purchases', poId);
    if (!po) return;
    if (!document.getElementById('rcvModalQty-0')) { Toast.show('Tidak ada item untuk diterima', 'error'); return; }
    // reuse submitReceiving logic with modal fields
    const updatedItems = po.items.map((i, idx) => {
      const qty = parseInt(document.getElementById(`rcvModalQty-${idx}`)?.value) || 0;
      return { ...i, receivedQty: qty };
    });
    const totalReceived = updatedItems.reduce((s, i) => s + i.receivedQty, 0);
    const totalOrdered = po.items.reduce((s, i) => s + i.qty, 0);
    if (totalReceived <= 0) { Toast.show('Minimal 1 item harus diterima', 'error'); return; }
    const allReceived = totalReceived === totalOrdered;
    const partialReceived = totalReceived > 0;

    updatedItems.forEach(i => {
      if (i.receivedQty > 0) {
        const product = DB.product(i.productId);
        if (product) {
          DB.update('products', product.id, { onHand: product.onHand + i.receivedQty });
          DB.add('movements', {
            id: DB.genId('MOV'), type: 'receive', productId: product.id,
            qty: i.receivedQty, ref: `RCV-${po.number}`, warehouseId: po.warehouseId,
            createdAt: DB.now(), user: 'Admin', note: `Receiving dari ${po.number}`
          });
        }
      }
    });

    DB.update('purchases', poId, {
      status: allReceived ? 'received' : 'partial',
      receivedDate: DB.now(), items: updatedItems
    });

    DB.add('receivings', {
      id: DB.genId('RCV'),
      number: `RCV-2024-${String(DB.get('receivings').length + 1).padStart(4, '0')}`,
      purchaseId: poId, warehouseId: po.warehouseId, supplierId: po.supplierId,
      status: 'completed', receivedDate: DB.now(),
      items: updatedItems.filter(i => i.receivedQty > 0).map(i => ({ productId: i.productId, qty: i.receivedQty })),
      receivedBy: 'Admin', checkedBy: 'Admin', notes: ''
    });

    DB.audit('receive', 'receiving', poId, `Menerima ${totalReceived}/${totalOrdered} dari ${po.number}`, 'Admin');
    Toast.show(`Receiving berhasil — ${totalReceived} unit diterima`, 'success');
    Modal.close();
    this.receiving();
  },

  viewReceiving(id) {
    const r = DB.find('receivings', id);
    if (!r) return;
    const po = DB.find('purchases', r.purchaseId);
    Modal.open({
      title: `Detail Receiving — ${r.number}`,
      icon: '📦', size: 'lg',
      body: `
        <div class="form-grid" style="margin-bottom:18px">
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">SUPPLIER</div><strong>${esc(DB.supplierName(r.supplierId))}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">PO REFERENSI</div><strong>${esc(po?.number || '-')}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">WAKTU DITERIMA</div><strong>${DB.fmtDateTime(r.receivedDate)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">DITERIMA OLEH</div><strong>${esc(r.receivedBy)}</strong></div>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Produk</th><th class="text-right">Qty Diterima</th></tr></thead>
          <tbody>${r.items.map(i => `
            <tr><td><strong>${esc(DB.productName(i.productId))}</strong><div class="cell-sub">${esc(DB.productSku(i.productId))}</div></td>
            <td class="text-right num">${i.qty}</td></tr>`).join('')}
          </tbody>
        </table></div>
        ${r.notes ? `<div style="margin-top:14px;padding:12px;background:rgba(245,158,11,.06);border-radius:8px;font-size:12.5px;color:var(--text-2)"><strong>Catatan:</strong> ${esc(r.notes)}</div>` : ''}`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`
    });
  },

  /* ================= TRANSFER ================= */
  transfer() {
    const content = document.getElementById('pageContent');
    const transfers = [...DB.get('transfers')].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    const statusMap = {
      pending: ['neutral', 'Menunggu'], in_transit: ['accent', 'In Transit'],
      completed: ['success', 'Selesai']
    };
    const openTransfers = transfers.filter(t => t.status !== 'completed').length;

    content.innerHTML = `
      ${App.pageHeader('🔄', 'Transfer', 'Transfer stok antar gudang', `
        <button class="btn btn-primary" onclick="OperationsPage.openTransferModal()">${I.plus} Buat Transfer</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.swap}</div><span class="badge info dot">Total</span></div>
          <div class="kpi-label">Total Transfer</div>
          <div class="kpi-value">${transfers.length}</div>
          <div class="kpi-sub">${openTransfers} masih berjalan</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.truck}</div><span class="badge accent dot">Berjalan</span></div>
          <div class="kpi-label">Transfer In Transit</div>
          <div class="kpi-value">${transfers.filter(t => t.status === 'in_transit').length}</div>
          <div class="kpi-sub">Menunggu konfirmasi penerimaan</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">Rata-rata</span></div>
          <div class="kpi-label">Waktu Transit Rata-rata</div>
          <div class="kpi-value">1.4 <small style="font-size:13px;color:var(--text-3)">hari</small></div>
          <div class="kpi-sub"><span class="trend-down">${I.arrowDown} 0.2 hari</span> lebih cepat</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">🚚</span> Daftar Transfer</h3><div class="ch-sub">Pergerakan antar warehouse</div></div>
        </div>
        ${tableHTML(
          [
            { label: 'No. Transfer' }, { label: 'Asal → Tujuan' }, { label: 'Item' },
            { label: 'Dibuat' }, { label: 'Selesai' }, { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          transfers.map(t => `
            <tr>
              ${td(`<span class="scan-badge">${esc(t.number)}</span>`)}
              ${td(`<div class="cell-status" style="display:flex;align-items:center;gap:6px"><strong>${esc(DB.warehouseName(t.fromWarehouseId))}</strong> ${I.arrowUp} <strong>${esc(DB.warehouseName(t.toWarehouseId))}</strong></div>`)}
              ${td(t.items.reduce((s, i) => s + i.qty, 0), 'text-center num')}
              ${td(DB.fmtDate(t.createdDate))}
              ${td(t.completedDate ? DB.fmtDate(t.completedDate) : '-')}
              ${td(statusBadge(t.status, statusMap))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Detail" onclick="OperationsPage.viewTransfer('${t.id}')">${I.eye}</button>
                ${t.status === 'in_transit' ? `<button class="icon-btn" title="Terima" style="color:var(--success)" onclick="OperationsPage.completeTransfer('${t.id}')">${I.check}</button>` : ''}
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada transfer'
        )}
      </div>
    `;
  },

  openTransferModal() {
    const warehouses = DB.get('warehouses');
    Modal.open({
      title: 'Buat Transfer Stok', icon: '🔄', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field"><span>Dari Gudang</span>
            <select id="trFrom" onchange="OperationsPage.toggleTransferWH()">
              ${warehouses.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Ke Gudang</span>
            <select id="trTo">${warehouses.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}</select>
          </label>
        </div>
        <div class="modal-form-section">
          <h4>📦 Item Transfer</h4>
          <div id="trItems"></div>
          <button class="btn btn-ghost btn-sm" onclick="OperationsPage.addTransferItem()">${I.plus} Tambah Item</button>
        </div>
        <label class="field"><span>Catatan</span><textarea id="trNote" placeholder="cth: replenish stok cabang..."></textarea></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="OperationsPage.saveTransfer()">${I.check} Buat Transfer</button>`
    });
    this.addTransferItem();
  },

  toggleTransferWH() {
    const from = document.getElementById('trFrom').value;
    const to = document.getElementById('trTo');
    [...to.options].forEach(opt => {
      opt.disabled = opt.value === from;
    });
    if (to.value === from) to.value = [...to.options].find(o => !o.disabled).value;
  },

  addTransferItem() {
    const container = document.getElementById('trItems');
    const idx = container.children.length;
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:2fr 90px 30px;gap:8px;margin-bottom:8px;align-items:center';
    row.id = `trRow-${idx}`;
    row.innerHTML = `
      <select id="trItemProduct-${idx}">
        <option value="">— Pilih Produk —</option>
        ${DB.get('products').map(p => `<option value="${p.id}">${esc(p.name)} (stok: ${p.onHand})</option>`).join('')}
      </select>
      <input id="trItemQty-${idx}" type="number" min="1" value="1" placeholder="Qty">
      <button class="icon-btn danger" style="width:28px;height:28px" onclick="OperationsPage.removeTransferItem(${idx})">${I.x}</button>`;
    container.appendChild(row);
  },

  removeTransferItem(idx) {
    const row = document.getElementById(`trRow-${idx}`);
    if (row) row.remove();
  },

  saveTransfer() {
    const fromId = document.getElementById('trFrom').value;
    const toId = document.getElementById('trTo').value;
    if (fromId === toId) { Toast.show('Gudang asal dan tujuan harus berbeda', 'error'); return; }

    const rows = document.querySelectorAll('[id^="trRow-"]');
    const items = [];
    rows.forEach(row => {
      const idx = row.id.replace('trRow-', '');
      const productId = document.getElementById(`trItemProduct-${idx}`).value;
      const qty = parseInt(document.getElementById(`trItemQty-${idx}`).value) || 0;
      if (!productId) return;
      const p = DB.product(productId);
      if (qty > p.onHand) {
        Toast.show(`Stok ${p.name} tidak mencukupi (tersedia: ${p.onHand})`, 'error');
        return;
      }
      if (qty > 0) items.push({ productId, qty });
    });

    if (!items.length) { Toast.show('Minimal 1 item transfer', 'error'); return; }

    // Deduct from source
    items.forEach(i => {
      const p = DB.product(i.productId);
      DB.update('products', p.id, { onHand: p.onHand - i.qty });
      DB.add('movements', {
        id: DB.genId('MOV'), type: 'transfer_out', productId: i.productId, qty: -i.qty,
        ref: `TRF-2024-NEW`, warehouseId: fromId, createdAt: DB.now(), user: 'Admin',
        note: `Transfer ke ${DB.warehouseName(toId)}`
      });
    });

    const transfer = {
      id: DB.genId('TRF'),
      number: `TRF-2024-${String(DB.get('transfers').length + 1).padStart(4, '0')}`,
      fromWarehouseId: fromId, toWarehouseId: toId,
      status: 'in_transit',
      createdDate: DB.now(), completedDate: null,
      items,
      createdBy: 'Admin',
      note: document.getElementById('trNote').value || ''
    };
    DB.add('transfers', transfer);

    DB.audit('create', 'transfer', transfer.id, `Transfer ${transfer.number}: ${items.length} item dari ${DB.warehouseName(fromId)} ke ${DB.warehouseName(toId)}`, 'Admin');
    Toast.show(`${transfer.number} berhasil dibuat, stok dikurangi dari gudang asal`, 'success');
    Modal.close();
    this.transfer();
  },

  viewTransfer(id) {
    const t = DB.find('transfers', id);
    if (!t) return;
    Modal.open({
      title: `Detail Transfer — ${t.number}`,
      icon: '🔄', size: 'lg',
      body: `
        <div class="form-grid" style="margin-bottom:18px">
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">DARI</div><strong>${esc(DB.warehouseName(t.fromWarehouseId))}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">KE</div><strong>${esc(DB.warehouseName(t.toWarehouseId))}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">DIBUAT</div><strong>${DB.fmtDateTime(t.createdDate)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">DIBUAT OLEH</div><strong>${esc(t.createdBy)}</strong></div>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Produk</th><th class="text-right">Qty</th></tr></thead>
          <tbody>${t.items.map(i => `
            <tr><td><strong>${esc(DB.productName(i.productId))}</strong><div class="cell-sub">${esc(DB.productSku(i.productId))}</div></td>
            <td class="text-right num">${i.qty}</td></tr>`).join('')}
          </tbody>
        </table></div>
        ${t.note ? `<div style="margin-top:14px;padding:12px;background:rgba(34,211,238,.06);border-radius:8px;font-size:12.5px;color:var(--text-2)"><strong>Catatan:</strong> ${esc(t.note)}</div>` : ''}`,
      foot: t.status === 'in_transit'
        ? `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button><button class="btn btn-success" onclick="OperationsPage.completeTransfer('${t.id}')">${I.check} Konfirmasi Diterima</button>`
        : `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`
    });
  },

  completeTransfer(id) {
    const t = DB.find('transfers', id);
    if (!t) return;
    DB.update('transfers', id, { status: 'completed', completedDate: DB.now() });

    // Add stock to destination
    t.items.forEach(i => {
      const p = DB.product(i.productId);
      if (p) {
        DB.update('products', p.id, { onHand: p.onHand + i.qty });
        DB.add('movements', {
          id: DB.genId('MOV'), type: 'transfer_in', productId: i.productId, qty: i.qty,
          ref: t.number, warehouseId: t.toWarehouseId, createdAt: DB.now(), user: 'Admin',
          note: `Transfer diterima dari ${DB.warehouseName(t.fromWarehouseId)}`
        });
      }
    });

    DB.audit('complete', 'transfer', id, `Transfer ${t.number} diterima di ${DB.warehouseName(t.toWarehouseId)}`, 'Admin');
    Toast.show(`Transfer ${t.number} selesai — stok ditambahkan ke gudang tujuan`, 'success');
    Modal.close();
    this.transfer();
  },

  /* ================= STOCK MOVEMENT ================= */
  movement() {
    const content = document.getElementById('pageContent');
    const movements = [...DB.get('movements')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const typeMap = {
      receive: ['success', 'Receiving', '📥'],
      issue: ['danger', 'Issue', '📤'],
      transfer_out: ['accent', 'Transfer Keluar', '🚚'],
      transfer_in: ['accent', 'Transfer Masuk', '🚚'],
      adjustment: ['warning', 'Adjustment', '⚖️'],
      return: ['info', 'Return', '↩️']
    };

    content.innerHTML = `
      ${App.pageHeader('📊', 'Stock Movement', 'Ledger pergerakan stok lengkap', `
        <button class="btn btn-ghost" onclick="OperationsPage.exportMovements()">${I.download} Export</button>
      `)}

      <div class="toolbar">
        <div class="toolbar-search">
          ${I.search}
          <input id="movSearch" placeholder="Cari produk, ref, user..." oninput="OperationsPage.filterMovements()">
        </div>
        <select id="movType" onchange="OperationsPage.filterMovements()">
          <option value="all">Semua Tipe</option>
          <option value="receive">Receiving</option>
          <option value="issue">Issue</option>
          <option value="transfer_out">Transfer Keluar</option>
          <option value="transfer_in">Transfer Masuk</option>
          <option value="adjustment">Adjustment</option>
          <option value="return">Return</option>
        </select>
        <select id="movWh" onchange="OperationsPage.filterMovements()">
          <option value="all">Semua Gudang</option>
          ${DB.get('warehouses').map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}
        </select>
        <span class="flex-spacer"></span>
        <span style="font-size:12px;color:var(--text-3)">${movements.length} pergerakan</span>
      </div>

      <div class="card">
        <div class="table-wrap" id="movTableWrap">
          <table>
            <thead><tr><th>Waktu</th><th>Tipe</th><th>Produk</th><th class="text-right">Qty</th><th>Referensi</th><th>Gudang</th><th>User</th><th>Catatan</th></tr></thead>
            <tbody>
              ${movements.map(m => {
                const [cls, label, icon] = typeMap[m.type] || ['neutral', m.type, '❓'];
                const isIn = m.qty > 0;
                return `<tr class="mov-row" data-mov-type="${m.type}" data-mov-wh="${m.warehouseId}" data-mov-search="${esc((DB.productName(m.productId) + ' ' + m.ref + ' ' + m.user + ' ' + m.note).toLowerCase())}">
                  <td style="white-space:nowrap">${DB.fmtDateTime(m.createdAt)}</td>
                  <td>${customBadge(cls, `${icon} ${label}`)}</td>
                  <td><strong>${esc(DB.productName(m.productId))}</strong><div class="cell-sub">${esc(DB.productSku(m.productId))}</div></td>
                  <td class="text-right"><strong class="num" style="color:${isIn ? 'var(--success)' : 'var(--danger)'}">${isIn ? '+' : ''}${m.qty}</strong></td>
                  <td><span class="scan-badge">${esc(m.ref)}</span></td>
                  <td>${esc(DB.warehouseName(m.warehouseId))}</td>
                  <td>${esc(m.user)}</td>
                  <td style="max-width:200px;color:var(--text-2);font-size:12.5px">${esc(m.note)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterMovements() {
    const q = (document.getElementById('movSearch').value || '').toLowerCase();
    const type = document.getElementById('movType').value;
    const wh = document.getElementById('movWh').value;
    document.querySelectorAll('.mov-row').forEach(tr => {
      const matchQ = !q || tr.dataset.movSearch.includes(q);
      const matchT = type === 'all' || tr.dataset.movType === type;
      const matchW = wh === 'all' || tr.dataset.movWh === wh;
      tr.style.display = matchQ && matchT && matchW ? '' : 'none';
    });
  },

  exportMovements() {
    exportExcel('nexawms-stock-movements.xls', 'Stock Movements',
      ['Tanggal', 'Tipe', 'Produk', 'SKU', 'Qty', 'Gudang', 'Referensi', 'User', 'Catatan'],
      DB.get('movements').map(m => [
        DB.fmtDateTime(m.createdAt), m.type, DB.productName(m.productId), DB.productSku(m.productId),
        m.qty, DB.warehouseName(m.warehouseId), m.ref || '-', m.user || 'Admin', m.note || ''
      ])
    );
    DB.audit('export', 'movement', 'ALL', 'Export data movement (Excel)', 'Admin');
    Toast.show('Data movement berhasil diexport (Excel)', 'success');
  },

  /* ================= ADJUSTMENT ================= */
  adjustment() {
    const content = document.getElementById('pageContent');
    const adjustments = [...DB.get('adjustments')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const typeMap = {
      shortage: ['danger', 'Kekurangan'],
      surplus: ['success', 'Surplus'],
      damage: ['warning', 'Rusak'],
      recount: ['info', 'Hasil Count']
    };

    content.innerHTML = `
      ${App.pageHeader('⚖️', 'Adjustment', 'Penyesuaian stok dengan approval workflow', `
        <button class="btn btn-primary" onclick="OperationsPage.openAdjustmentModal()">${I.plus} Buat Adjustment</button>
      `)}

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📋</span> Riwayat Adjustment</h3><div class="ch-sub">Semua penyesuaian stok</div></div>
        </div>
        ${tableHTML(
          [
            { label: 'No. Adj' }, { label: 'Produk' }, { label: 'Qty', right: true },
            { label: 'Tipe' }, { label: 'Alasan' }, { label: 'Tanggal' },
            { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          adjustments.map(a => `
            <tr>
              ${td(`<span class="scan-badge">${esc(a.number)}</span>`)}
              ${td(`<strong>${esc(DB.productName(a.productId))}</strong><div class="cell-sub">${esc(DB.productSku(a.productId))}</div>`)}
              ${td(`<strong class="num" style="color:${a.qty > 0 ? 'var(--success)' : 'var(--danger)'}">${a.qty > 0 ? '+' : ''}${a.qty}</strong>`, 'text-right')}
              ${td(statusBadge(a.type, typeMap))}
              ${td(esc(a.reason))}
              ${td(DB.fmtDateTime(a.createdAt))}
              ${td(statusBadge(a.status))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                ${a.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="OperationsPage.approveAdjustment('${a.id}')">${I.check} Approve</button>` : ''}
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada adjustment'
        )}
      </div>
    `;
  },

  openAdjustmentModal() {
    Modal.open({
      title: 'Buat Adjustment Stok', icon: '⚖️', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field"><span>Produk</span>
            <select id="adjProduct">
              <option value="">— Pilih Produk —</option>
              ${DB.get('products').map(p => `<option value="${p.id}">${esc(p.name)} (stok: ${p.onHand})</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Tipe Adjustment</span>
            <select id="adjType">
              <option value="surplus">Surplus (+)</option>
              <option value="shortage">Kekurangan (-)</option>
              <option value="damage">Kerusakan (-)</option>
              <option value="recount">Hasil Count (±)</option>
            </select>
          </label>
          <label class="field"><span>Qty</span><input id="adjQty" type="number" min="1" value="1" placeholder="Jumlah"></label>
          <label class="field"><span>Alasan</span>
            <select id="adjReason">
              <option>Hasil cycle count</option>
              <option>Kerusakan barang</option>
              <option>Kekurangan saat receiving</option>
              <option>Barang hilang</option>
              <option>Koreksi data sistem</option>
            </select>
          </label>
        </div>
        <label class="field"><span>Catatan Detail</span><textarea id="adjNote" placeholder="Penjelasan lengkap..."></textarea></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="OperationsPage.saveAdjustment()">${I.check} Simpan Adjustment</button>`
    });
  },

  saveAdjustment() {
    const productId = document.getElementById('adjProduct').value;
    const type = document.getElementById('adjType').value;
    const qty = parseInt(document.getElementById('adjQty').value) || 0;
    if (!productId || qty <= 0) { Toast.show('Produk dan qty wajib diisi', 'error'); return; }
    const sign = (type === 'surplus') ? 1 : -1;

    const adj = {
      id: DB.genId('ADJ'),
      number: `ADJ-2024-${String(DB.get('adjustments').length + 1).padStart(3, '0')}`,
      productId,
      qty: sign * qty,
      type, reason: document.getElementById('adjReason').value,
      status: 'pending',
      createdAt: DB.now(),
      user: 'Admin',
      note: document.getElementById('adjNote').value || ''
    };
    DB.add('adjustments', adj);
    DB.notify('Adjustment Menunggu Approval', `${adj.number} — ${DB.productName(productId)} (${sign * qty}) menunggu persetujuan`, 'warning', '⚖️');
    DB.audit('create', 'adjustment', adj.id, `Membuat ${adj.number} untuk ${DB.productName(productId)}`, 'Admin');
    Toast.show(`Adjustment ${adj.number} dibuat (menunggu approval)`, 'success');
    Modal.close();
    this.adjustment();
  },

  approveAdjustment(id) {
    const a = DB.find('adjustments', id);
    if (!a) return;
    DB.update('adjustments', id, { status: 'completed' });
    const p = DB.product(a.productId);
    if (p) {
      DB.update('products', p.id, { onHand: p.onHand + a.qty });
      DB.add('movements', {
        id: DB.genId('MOV'), type: 'adjustment', productId: p.id, qty: a.qty,
        ref: a.number, warehouseId: p.locationId ? DB.location(p.locationId)?.warehouseId || 'WH-CTG' : 'WH-CTG',
        createdAt: DB.now(), user: 'Admin', note: a.reason
      });
    }
    DB.audit('approve', 'adjustment', id, `Menyetujui ${a.number} (${a.qty > 0 ? '+' : ''}${a.qty})`, 'Admin');
    Toast.show(`${a.number} disetujui — stok diperbarui`, 'success');
    this.adjustment();
  },

  /* ================= RESERVATION ================= */
  reservation() {
    const content = document.getElementById('pageContent');
    const reservations = [...DB.get('reservations')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const statusMap = { active: ['primary', 'Aktif'], completed: ['success', 'Selesai'], cancelled: ['neutral', 'Dibatalkan'], expired: ['warning', 'Kadaluarsa'] };

    content.innerHTML = `
      ${App.pageHeader('🔒', 'Reservation', 'Reservasi stok untuk pelanggan tertentu', `
        <button class="btn btn-primary" onclick="OperationsPage.openReservationModal()">${I.plus} Buat Reservasi</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.lock}</div><span class="badge primary dot">Aktif</span></div>
          <div class="kpi-label">Reservasi Aktif</div>
          <div class="kpi-value">${reservations.filter(r => r.status === 'active').length}</div>
          <div class="kpi-sub">Stok direservasi sementara</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.box}</div><span class="badge accent dot">Unit</span></div>
          <div class="kpi-label">Unit Direservasi</div>
          <div class="kpi-value">${reservations.filter(r => r.status === 'active').reduce((s, r) => s + r.qty, 0)}</div>
          <div class="kpi-sub">Terkunci dari stok tersedia</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">Selesai</span></div>
          <div class="kpi-label">Reservasi Selesai</div>
          <div class="kpi-value">${reservations.filter(r => r.status === 'completed').length}</div>
          <div class="kpi-sub">Telah dikonversi ke issue</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><h3><span class="ch-ic">📋</span> Daftar Reservasi</h3><div class="ch-sub">Stok yang di-lock untuk kebutuhan tertentu</div></div></div>
        ${tableHTML(
          [
            { label: 'No. Resv' }, { label: 'Produk' }, { label: 'Customer' },
            { label: 'Qty', right: true }, { label: 'Expired' }, { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          reservations.map(r => `
            <tr>
              ${td(`<span class="scan-badge">${esc(r.number)}</span>`)}
              ${td(`<strong>${esc(DB.productName(r.productId))}</strong><div class="cell-sub">${esc(DB.productSku(r.productId))}</div>`)}
              ${td(esc(DB.customerName(r.customerId)))}
              ${td(r.qty, 'text-right num')}
              ${td(DB.fmtDate(r.expiresAt))}
              ${td(statusBadge(r.status, statusMap))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                ${r.status === 'active' ? `<button class="btn btn-success btn-sm" onclick="OperationsPage.completeReservation('${r.id}')">${I.check} Selesai</button>
                <button class="btn btn-ghost btn-sm" onclick="OperationsPage.cancelReservation('${r.id}')">Batal</button>` : ''}
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada reservasi'
        )}
      </div>
    `;
  },

  openReservationModal() {
    Modal.open({
      title: 'Buat Reservasi Stok', icon: '🔒', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field"><span>Produk</span>
            <select id="rsvProduct">
              <option value="">— Pilih Produk —</option>
              ${DB.get('products').map(p => `<option value="${p.id}">${esc(p.name)} (stok: ${p.onHand})</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Qty</span><input id="rsvQty" type="number" min="1" value="1"></label>
          <label class="field full"><span>Customer</span>
            <select id="rsvCustomer">${DB.get('customers').map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
          </label>
          <label class="field"><span>Tanggal Kadaluarsa</span><input id="rsvExpires" type="date" value="${DB.daysAhead(7).slice(0,10)}"></label>
        </div>
        <label class="field"><span>Catatan</span><textarea id="rsvNote" placeholder="Alasan reservasi..."></textarea></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="OperationsPage.saveReservation()">${I.check} Simpan Reservasi</button>`
    });
  },

  saveReservation() {
    const productId = document.getElementById('rsvProduct').value;
    const qty = parseInt(document.getElementById('rsvQty').value) || 0;
    const customerId = document.getElementById('rsvCustomer').value;
    if (!productId || qty <= 0) { Toast.show('Produk dan qty wajib diisi', 'error'); return; }
    const p = DB.product(productId);
    if (qty > p.onHand) {
      Toast.show(`Stok ${p.name} tidak mencukupi (tersedia: ${p.onHand})`, 'error');
      return;
    }
    const rsv = {
      id: DB.genId('RSV'),
      number: `RSV-2024-${String(DB.get('reservations').length + 1).padStart(3, '0')}`,
      productId, qty, customerId,
      status: 'active',
      createdAt: DB.now(),
      expiresAt: new Date(document.getElementById('rsvExpires').value).toISOString(),
      note: document.getElementById('rsvNote').value || ''
    };
    DB.add('reservations', rsv);
    DB.audit('create', 'reservation', rsv.id, `Reservasi ${rsv.number}: ${qty} unit ${p.name} untuk ${DB.customerName(customerId)}`, 'Admin');
    Toast.show(`Reservasi ${rsv.number} berhasil dibuat`, 'success');
    Modal.close();
    this.reservation();
  },

  completeReservation(id) {
    DB.update('reservations', id, { status: 'completed' });
    DB.audit('complete', 'reservation', id, `Reservasi ${id} diselesaikan`, 'Admin');
    Toast.show('Reservasi selesai', 'success');
    this.reservation();
  },

  cancelReservation(id) {
    Modal.confirm({
      title: 'Batalkan Reservasi', icon: '⚠️',
      message: 'Reservasi akan dibatalkan dan stok akan dikembalikan ke stok tersedia.',
      onYes: () => {
        DB.update('reservations', id, { status: 'cancelled' });
        DB.audit('cancel', 'reservation', id, `Reservasi ${id} dibatalkan`, 'Admin');
        Toast.show('Reservasi dibatalkan', 'success');
        this.reservation();
      }
    });
  },

  /* ================= ISSUE ================= */
  issue() {
    const content = document.getElementById('pageContent');
    const issues = [...DB.get('issues')].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    const statusMap = {
      draft: ['neutral', 'Draft'], picking: ['info', 'Picking'],
      packed: ['primary', 'Packed'], shipped: ['accent', 'Dikirim'],
      completed: ['success', 'Selesai']
    };
    const activeIssues = issues.filter(i => ['draft', 'picking', 'packed', 'shipped'].includes(i.status)).length;

    content.innerHTML = `
      ${App.pageHeader('📤', 'Issue', 'Proses pengeluaran barang (order fulfillment)', `
        <button class="btn btn-primary" onclick="OperationsPage.openIssueModal()">${I.plus} Buat Issue</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.rotate}</div><span class="badge info dot">Berjalan</span></div>
          <div class="kpi-label">Issue Aktif</div>
          <div class="kpi-value">${activeIssues}</div>
          <div class="kpi-sub">Dari draft hingga dikirim</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">30 hari</span></div>
          <div class="kpi-label">Issue Selesai</div>
          <div class="kpi-value">${issues.filter(i => i.status === 'completed').length}</div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 12%</span> dari bulan lalu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.truck}</div><span class="badge accent dot">Proses</span></div>
          <div class="kpi-label">Rata-rata Fulfillment Time</div>
          <div class="kpi-value">3.8 <small style="font-size:13px;color:var(--text-3)">jam</small></div>
          <div class="kpi-sub"><span class="trend-down">${I.arrowDown} 0.4 jam</span> lebih cepat</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📦</span> Daftar Issue</h3><div class="ch-sub">Order fulfillment & pengiriman</div></div>
          <select style="width:auto" onchange="OperationsPage.filterIssue(this.value)">
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option><option value="picking">Picking</option>
            <option value="packed">Packed</option><option value="shipped">Dikirim</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
        ${tableHTML(
          [
            { label: 'No. Issue' }, { label: 'Customer' }, { label: 'Items' },
            { label: 'Tanggal' }, { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          issues.map(i => `
            <tr data-issue-status="${i.status}">
              ${td(`<span class="scan-badge">${esc(i.number)}</span>`)}
              ${td(`<strong>${esc(DB.customerName(i.customerId))}</strong><div class="cell-sub">${esc(DB.warehouseName(i.warehouseId))}</div>`)}
              ${td(i.items.reduce((s, it) => s + it.qty, 0), 'text-center num')}
              ${td(DB.fmtDate(i.issueDate))}
              ${td(statusBadge(i.status, statusMap))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Detail" onclick="OperationsPage.viewIssue('${i.id}')">${I.eye}</button>
                ${i.status === 'draft' ? `<button class="icon-btn" title="Mulai picking" style="color:var(--info)" onclick="OperationsPage.advanceIssue('${i.id}','picking')">🔍</button>` : ''}
                ${i.status === 'picking' ? `<button class="icon-btn" title="Packed" style="color:var(--warning)" onclick="OperationsPage.advanceIssue('${i.id}','packed')">📦</button>` : ''}
                ${i.status === 'packed' ? `<button class="icon-btn" title="Kirim" style="color:var(--accent)" onclick="OperationsPage.advanceIssue('${i.id}','shipped')">🚚</button>` : ''}
                ${i.status === 'shipped' ? `<button class="icon-btn" title="Selesai" style="color:var(--success)" onclick="OperationsPage.advanceIssue('${i.id}','completed')">${I.check}</button>` : ''}
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada issue'
        )}
      </div>
    `;
  },

  openIssueModal() {
    Modal.open({
      title: 'Buat Issue (Order Fulfillment)', icon: '📤', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field"><span>Customer</span>
            <select id="issCustomer">${DB.get('customers').map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
          </label>
          <label class="field"><span>Gudang</span>
            <select id="issWarehouse">${DB.get('warehouses').map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}</select>
          </label>
        </div>
        <div class="modal-form-section">
          <h4>📦 Item Pengiriman</h4>
          <div id="issItems"></div>
          <button class="btn btn-ghost btn-sm" onclick="OperationsPage.addIssueItem()">${I.plus} Tambah Item</button>
        </div>
        <label class="field"><span>Catatan</span><textarea id="issNote" placeholder="Instruksi pengiriman..."></textarea></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="OperationsPage.saveIssue()">${I.check} Buat Issue</button>`
    });
    this.addIssueItem();
  },

  addIssueItem() {
    const container = document.getElementById('issItems');
    const idx = container.children.length;
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:2fr 90px 30px;gap:8px;margin-bottom:8px;align-items:center';
    row.id = `issRow-${idx}`;
    row.innerHTML = `
      <select id="issItemProduct-${idx}">
        <option value="">— Pilih Produk —</option>
        ${DB.get('products').filter(p => p.onHand > 0).map(p => `<option value="${p.id}">${esc(p.name)} (stok: ${p.onHand})</option>`).join('')}
      </select>
      <input id="issItemQty-${idx}" type="number" min="1" value="1" placeholder="Qty">
      <button class="icon-btn danger" style="width:28px;height:28px" onclick="OperationsPage.removeIssueItem(${idx})">${I.x}</button>`;
    container.appendChild(row);
  },

  removeIssueItem(idx) {
    const row = document.getElementById(`issRow-${idx}`);
    if (row) row.remove();
  },

  saveIssue() {
    const customerId = document.getElementById('issCustomer').value;
    const warehouseId = document.getElementById('issWarehouse').value;
    const rows = document.querySelectorAll('[id^="issRow-"]');
    const items = [];

    for (const row of rows) {
      const idx = row.id.replace('issRow-', '');
      const productId = document.getElementById(`issItemProduct-${idx}`).value;
      const qty = parseInt(document.getElementById(`issItemQty-${idx}`).value) || 0;
      if (!productId) continue;
      const p = DB.product(productId);
      if (qty > p.onHand) {
        Toast.show(`Stok ${p.name} tidak mencukupi (tersedia: ${p.onHand})`, 'error');
        return;
      }
      items.push({ productId, qty });
    }
    if (!items.length) { Toast.show('Minimal 1 item issue', 'error'); return; }

    const issue = {
      id: DB.genId('ISS'),
      number: `ISS-2024-${String(DB.get('issues').length + 1).padStart(4, '0')}`,
      customerId, warehouseId, status: 'draft',
      issueDate: DB.now(), items, type: 'sales_order',
      createdBy: 'Admin', note: document.getElementById('issNote').value || ''
    };
    DB.add('issues', issue);
    DB.audit('create', 'issue', issue.id, `Membuat ${issue.number} untuk ${DB.customerName(customerId)}`, 'Admin');
    Toast.show(`${issue.number} berhasil dibuat (status Draft)`, 'success');
    Modal.close();
    this.issue();
  },

  viewIssue(id) {
    const i = DB.find('issues', id);
    if (!i) return;
    Modal.open({
      title: `Detail Issue — ${i.number}`,
      icon: '📤', size: 'lg',
      body: `
        <div class="form-grid" style="margin-bottom:18px">
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">CUSTOMER</div><strong>${esc(DB.customerName(i.customerId))}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">GUDANG</div><strong>${esc(DB.warehouseName(i.warehouseId))}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">TANGGAL</div><strong>${DB.fmtDateTime(i.issueDate)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">STATUS</div><strong>${statusBadge(i.status)}</strong></div>
        </div>
        <h4 style="font-size:12px;font-weight:700;color:var(--primary-3);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Item Pengiriman</h4>
        <div class="table-wrap"><table>
          <thead><tr><th>Produk</th><th class="text-right">Qty</th></tr></thead>
          <tbody>${i.items.map(it => `
            <tr><td><strong>${esc(DB.productName(it.productId))}</strong><div class="cell-sub">${esc(DB.productSku(it.productId))}</div></td>
            <td class="text-right num">${it.qty}</td></tr>`).join('')}
          </tbody>
        </table></div>
        ${i.note ? `<div style="margin-top:14px;padding:12px;background:rgba(99,102,241,.06);border-radius:8px;font-size:12.5px;color:var(--text-2)"><strong>Catatan:</strong> ${esc(i.note)}</div>` : ''}`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`
    });
  },

  advanceIssue(id, toStatus) {
    const i = DB.find('issues', id);
    if (!i) return;
    DB.update('issues', id, { status: toStatus });

    // Deduct stock when picking starts
    if (toStatus === 'picking') {
      i.items.forEach(it => {
        const p = DB.product(it.productId);
        if (p) {
          DB.update('products', p.id, { onHand: p.onHand - it.qty });
          DB.add('movements', {
            id: DB.genId('MOV'), type: 'issue', productId: p.id, qty: -it.qty,
            ref: i.number, warehouseId: i.warehouseId, createdAt: DB.now(), user: 'Admin',
            note: `Issue ke ${DB.customerName(i.customerId)}`
          });
        }
      });
    }

    const labels = { picking: 'Picking dimulai', packed: 'Selesai packing', shipped: 'Dikirim', completed: 'Selesai' };
    DB.audit('update', 'issue', id, `${i.number} — ${labels[toStatus]}`, 'Admin');
    Toast.show(`${i.number} — ${labels[toStatus]}`, 'success');
    this.issue();
  },

  filterIssue(status) {
    document.querySelectorAll('tr[data-issue-status]').forEach(tr => {
      tr.style.display = (status === 'all' || tr.dataset.issueStatus === status) ? '' : 'none';
    });
  },

  /* ================= RETURN ================= */
  returnPage() {
    const content = document.getElementById('pageContent');
    const returns = [...DB.get('returns')].sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));
    const statusMap = {
      pending: ['neutral', 'Menunggu'], in_transit: ['accent', 'In Transit'],
      completed: ['success', 'Selesai'], approved: ['info', 'Disetujui']
    };

    content.innerHTML = `
      ${App.pageHeader('↩️', 'Return', 'Kelola retur dari customer / ke supplier', `
        <button class="btn btn-primary" onclick="OperationsPage.openReturnModal()">${I.plus} Buat Return</button>
      `)}

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📦</span> Daftar Return</h3><div class="ch-sub">Transaksi pengembalian barang</div></div>
        </div>
        ${tableHTML(
          [
            { label: 'No. Return' }, { label: 'Tipe' }, { label: 'Mitra' },
            { label: 'Items' }, { label: 'Tanggal' }, { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          returns.map(r => `
            <tr>
              ${td(`<span class="scan-badge">${esc(r.number)}</span>`)}
              ${td(customBadge(r.returnType === 'customer' ? 'warning' : 'accent', r.returnType === 'customer' ? '👥 Customer' : '🏭 Supplier'))}
              ${td(`<strong>${esc(r.customerId ? DB.customerName(r.customerId) : DB.supplierName(r.supplierId))}</strong>`)}
              ${td(r.items.reduce((s, it) => s + it.qty, 0), 'text-center num')}
              ${td(DB.fmtDate(r.returnDate))}
              ${td(statusBadge(r.status, statusMap))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Detail" onclick="OperationsPage.viewReturn('${r.id}')">${I.eye}</button>
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada return'
        )}
      </div>
    `;
  },

  openReturnModal() {
    Modal.open({
      title: 'Buat Return', icon: '↩️', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field"><span>Tipe Return</span>
            <select id="retType" onchange="OperationsPage.toggleReturnParty()">
              <option value="customer">Dari Customer</option>
              <option value="supplier">Ke Supplier</option>
            </select>
          </label>
          <label class="field"><span>Mitra</span>
            <select id="retParty">${DB.get('customers').map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
          </label>
        </div>
        <div class="modal-form-section">
          <h4>📦 Item Return</h4>
          <div id="retItems"></div>
          <button class="btn btn-ghost btn-sm" onclick="OperationsPage.addReturnItem()">${I.plus} Tambah Item</button>
        </div>
        <label class="field"><span>Catatan</span><textarea id="retNote" placeholder="Alasan return..."></textarea></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="OperationsPage.saveReturn()">${I.check} Simpan Return</button>`
    });
    this.addReturnItem();
  },

  toggleReturnParty() {
    const type = document.getElementById('retType').value;
    const party = document.getElementById('retParty');
    party.innerHTML = type === 'customer'
      ? DB.get('customers').map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')
      : DB.get('suppliers').map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  },

  addReturnItem() {
    const container = document.getElementById('retItems');
    const idx = container.children.length;
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:2fr 100px 1fr 30px;gap:8px;margin-bottom:8px;align-items:center';
    row.id = `retRow-${idx}`;
    row.innerHTML = `
      <select id="retItemProduct-${idx}">
        <option value="">— Pilih Produk —</option>
        ${DB.get('products').map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}
      </select>
      <input id="retItemQty-${idx}" type="number" min="1" value="1" placeholder="Qty">
      <input id="retItemReason-${idx}" placeholder="Alasan (cth: rusak)" style="font-size:12.5px">
      <button class="icon-btn danger" style="width:28px;height:28px" onclick="OperationsPage.removeReturnItem(${idx})">${I.x}</button>`;
    container.appendChild(row);
  },

  removeReturnItem(idx) {
    const row = document.getElementById(`retRow-${idx}`);
    if (row) row.remove();
  },

  saveReturn() {
    const type = document.getElementById('retType').value;
    const partyId = document.getElementById('retParty').value;
    const rows = document.querySelectorAll('[id^="retRow-"]');
    const items = [];
    rows.forEach(row => {
      const idx = row.id.replace('retRow-', '');
      const productId = document.getElementById(`retItemProduct-${idx}`).value;
      const qty = parseInt(document.getElementById(`retItemQty-${idx}`).value) || 0;
      const reason = document.getElementById(`retItemReason-${idx}`).value || 'Tidak ada alasan';
      if (productId && qty > 0) items.push({ productId, qty, reason });
    });
    if (!items.length) { Toast.show('Minimal 1 item return', 'error'); return; }

    // For customer returns, add stock back
    if (type === 'customer') {
      items.forEach(it => {
        const p = DB.product(it.productId);
        if (p) {
          DB.update('products', p.id, { onHand: p.onHand + it.qty });
          DB.add('movements', {
            id: DB.genId('MOV'), type: 'return', productId: p.id, qty: it.qty,
            ref: 'RET-NEW', warehouseId: 'WH-CTG', createdAt: DB.now(), user: 'Admin',
            note: `Return dari ${DB.customerName(partyId)}`
          });
        }
      });
    }

    const ret = {
      id: DB.genId('RET'),
      number: `RET-2024-${String(DB.get('returns').length + 1).padStart(3, '0')}`,
      ...(type === 'customer' ? { customerId: partyId } : { supplierId: partyId }),
      warehouseId: 'WH-CTG',
      status: 'pending',
      returnDate: DB.now(),
      items, returnType: type,
      createdBy: 'Admin',
      note: document.getElementById('retNote').value || ''
    };
    DB.add('returns', ret);
    DB.audit('create', 'return', ret.id, `Membuat ${ret.number} (${type})`, 'Admin');
    Toast.show(`${ret.number} berhasil dibuat`, 'success');
    Modal.close();
    this.returnPage();
  },

  viewReturn(id) {
    const r = DB.find('returns', id);
    if (!r) return;
    Modal.open({
      title: `Detail Return — ${r.number}`,
      icon: '↩️', size: 'lg',
      body: `
        <div class="form-grid" style="margin-bottom:18px">
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">MITRA</div><strong>${esc(r.customerId ? DB.customerName(r.customerId) : DB.supplierName(r.supplierId))}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">TYPE</div><strong>${r.returnType === 'customer' ? 'Dari Customer' : 'Ke Supplier'}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">TANGGAL</div><strong>${DB.fmtDateTime(r.returnDate)}</strong></div>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Produk</th><th class="text-right">Qty</th><th>Alasan</th></tr></thead>
          <tbody>${r.items.map(it => `
            <tr><td><strong>${esc(DB.productName(it.productId))}</strong></td>
            <td class="text-right num">${it.qty}</td><td style="color:var(--text-2)">${esc(it.reason)}</td></tr>`).join('')}
          </tbody>
        </table></div>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`
    });
  },

  /* ================= CYCLE COUNT ================= */
  cycleCount() {
    const content = document.getElementById('pageContent');
    const counts = [...DB.get('cycleCounts')].sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
    const statusMap = {
      scheduled: ['info', 'Terjadwal'], in_progress: ['primary', 'Berjalan'],
      completed: ['success', 'Selesai']
    };

    // Accuracy calculation
    const totalDiscrepancy = counts.filter(c => c.status === 'completed').reduce((s, c) => s + Math.abs(c.discrepancy || 0), 0);
    const totalCounted = counts.filter(c => c.status === 'completed').reduce((s, c) => s + c.items.reduce((ss, it) => ss + (it.systemQty || 0), 0), 0);
    const accuracy = totalCounted > 0 ? Math.max(90, Math.round((1 - totalDiscrepancy / totalCounted) * 1000) / 10) : 97.5;

    content.innerHTML = `
      ${App.pageHeader('✅', 'Cycle Count', 'Stock opname berkala untuk menjaga akurasi inventory', `
        <button class="btn btn-primary" onclick="OperationsPage.openCycleCountModal()">${I.plus} Jadwalkan Count</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.check}</div><span class="badge success dot">Akurat</span></div>
          <div class="kpi-label">Inventory Accuracy</div>
          <div class="kpi-value">${accuracy}%</div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 0.3%</span> dari bulan lalu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.clock}</div><span class="badge info dot">Total</span></div>
          <div class="kpi-label">Cycle Count Selesai</div>
          <div class="kpi-value">${counts.filter(c => c.status === 'completed').length}</div>
          <div class="kpi-sub">${counts.length} total jadwal</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic orange">${I.activity}</div><span class="badge warning dot">Discrepancy</span></div>
          <div class="kpi-label">Total Discrepancy</div>
          <div class="kpi-value">${totalDiscrepancy}</div>
          <div class="kpi-sub">${totalDiscrepancy ? 'Perlu adjustment' : 'Tidak ada selisih'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.zap}</div><span class="badge primary dot">Mingguan</span></div>
          <div class="kpi-label">Count Berikutnya</div>
          <div class="kpi-value">${DB.fmtDate(DB.daysAhead(2))}</div>
          <div class="kpi-sub">Zone E — Perkakas</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📋</span> Jadwal Cycle Count</h3><div class="ch-sub">Semua sesi stock opname</div></div>
        </div>
        ${tableHTML(
          [
            { label: 'No. Count' }, { label: 'Zone' }, { label: 'Item' },
            { label: 'Jadwal' }, { label: 'Selesai' }, { label: 'Discrepancy', right: true },
            { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          counts.map(c => `
            <tr data-cc-status="${c.status}">
              ${td(`<span class="scan-badge">${esc(c.number)}</span>`)}
              ${td(esc(DB.zone(c.zoneId)?.name || '-'))}
              ${td(c.items.length, 'text-center num')}
              ${td(DB.fmtDate(c.scheduledDate))}
              ${td(c.completedDate ? DB.fmtDate(c.completedDate) : '-')}
              ${td(c.discrepancy !== null && c.discrepancy !== undefined ? `<strong class="num" style="color:${c.discrepancy === 0 ? 'var(--success)' : 'var(--warning)'}">${c.discrepancy > 0 ? '+' : ''}${c.discrepancy}</strong>` : '-', 'text-right')}
              ${td(statusBadge(c.status, statusMap))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Detail" onclick="OperationsPage.viewCycleCount('${c.id}')">${I.eye}</button>
                ${c.status === 'in_progress' ? `<button class="btn btn-success btn-sm" onclick="OperationsPage.finishCycleCount('${c.id}')">${I.check} Selesai</button>` : ''}
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada cycle count'
        )}
      </div>
    `;
  },

  openCycleCountModal() {
    const zones = DB.get('zones').filter(z => z.warehouseId === 'WH-CTG');
    const products = DB.get('products');
    Modal.open({
      title: 'Jadwalkan Cycle Count', icon: '✅', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field"><span>Zone</span>
            <select id="ccZone" onchange="OperationsPage.loadCCProducts()">
              ${zones.map(z => `<option value="${z.id}">${esc(z.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Tanggal Jadwal</span><input id="ccDate" type="date" value="${DB.daysAhead(2).slice(0,10)}"></label>
          <label class="field"><span>Ditugaskan ke</span>
            <select id="ccAssignee">
              <option>Rudi Hartono</option><option>Lina Marlina</option><option>Bambang Purnomo</option>
            </select>
          </label>
        </div>
        <div class="modal-form-section">
          <h4>📦 Item yang akan dihitung</h4>
          <div id="ccProducts"></div>
        </div>
        <label class="field"><span>Catatan</span><textarea id="ccNote" placeholder="Instruksi khusus..."></textarea></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="OperationsPage.saveCycleCount()">${I.check} Buat Jadwal</button>`
    });
    this.loadCCProducts(true);
  },

  loadCCProducts(initial = false) {
    const zoneId = document.getElementById('ccZone')?.value;
    const container = document.getElementById('ccProducts');
    if (!zoneId || !container) return;
    const zoneProducts = DB.get('products').filter(p => {
      const loc = DB.location(p.locationId);
      return loc && loc.zoneId === zoneId;
    });
    const all = zoneProducts.length ? zoneProducts : DB.get('products').slice(0, 8);
    container.innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr><th></th><th>Produk</th><th class="text-right">Stok Sistem</th></tr></thead>
        <tbody>${all.map(p => `
          <tr>
            <td><input type="checkbox" class="ccSel" data-product-id="${p.id}" checked style="width:auto"></td>
            <td><strong>${esc(p.name)}</strong><div class="cell-sub">${esc(p.sku)}</div></td>
            <td class="text-right num">${p.onHand}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>`;
  },

  saveCycleCount() {
    const zoneId = document.getElementById('ccZone').value;
    const items = [];
    document.querySelectorAll('.ccSel:checked').forEach(el => {
      const p = DB.product(el.dataset.productId);
      if (p) items.push({ productId: p.id, systemQty: p.onHand, countedQty: null });
    });
    if (!items.length) { Toast.show('Pilih minimal 1 item', 'error'); return; }

    const cc = {
      id: DB.genId('CC'),
      number: `CC-2024-${String(DB.get('cycleCounts').length + 1).padStart(3, '0')}`,
      zoneId,
      warehouseId: 'WH-CTG',
      status: 'scheduled',
      scheduledDate: new Date(document.getElementById('ccDate').value).toISOString(),
      completedDate: null,
      items,
      discrepancy: null,
      assignedTo: document.getElementById('ccAssignee').value,
      note: document.getElementById('ccNote').value || ''
    };
    DB.add('cycleCounts', cc);
    DB.audit('create', 'cycleCount', cc.id, `Jadwalkan ${cc.number} untuk ${DB.zone(zoneId)?.name}`, 'Admin');
    Toast.show(`${cc.number} berhasil dijadwalkan`, 'success');
    Modal.close();
    this.cycleCount();
  },

  viewCycleCount(id) {
    const c = DB.find('cycleCounts', id);
    if (!c) return;
    const zone = DB.zone(c.zoneId);
    Modal.open({
      title: `Detail Cycle Count — ${c.number}`,
      icon: '✅', size: 'lg',
      body: `
        <div class="form-grid" style="margin-bottom:18px">
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">ZONE</div><strong>${esc(zone?.name || '-')}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">DITUGASKAN KE</div><strong>${esc(c.assignedTo)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">JADWAL</div><strong>${DB.fmtDate(c.scheduledDate)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">STATUS</div><strong>${statusBadge(c.status)}</strong></div>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Produk</th><th class="text-right">Sistem</th><th class="text-right">Terhitung</th><th class="text-right">Selisih</th></tr></thead>
          <tbody>${c.items.map(it => {
            const diff = it.countedQty !== null && it.countedQty !== undefined ? it.countedQty - it.systemQty : null;
            return `<tr>
              <td><strong>${esc(DB.productName(it.productId))}</strong></td>
              <td class="text-right num">${it.systemQty}</td>
              <td class="text-right num">${it.countedQty !== null && it.countedQty !== undefined ? it.countedQty : '-'}</td>
              <td class="text-right">${diff === null ? '-' : `<strong class="num" style="color:${diff === 0 ? 'var(--success)' : 'var(--warning)'}">${diff > 0 ? '+' : ''}${diff}</strong>`}</td>
            </tr>`;
          }).join('')}
          </tbody>
        </table></div>
        ${c.note ? `<div style="margin-top:14px;padding:12px;background:rgba(99,102,241,.06);border-radius:8px;font-size:12.5px;color:var(--text-2)"><strong>Catatan:</strong> ${esc(c.note)}</div>` : ''}`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`
    });
  },

  finishCycleCount(id) {
    const c = DB.find('cycleCounts', id);
    if (!c) return;
    Modal.open({
      title: `Selesaikan ${c.number}`, icon: '✅', size: 'lg',
      body: `
        <div class="table-wrap"><table>
          <thead><tr><th>Produk</th><th class="text-right">Stok Sistem</th><th class="text-right">Hasil Hitung</th><th class="text-right">Selisih</th></tr></thead>
          <tbody>${c.items.map((it, idx) => `
            <tr>
              <td><strong>${esc(DB.productName(it.productId))}</strong></td>
              <td class="text-right num" id="ccSys-${idx}">${it.systemQty}</td>
              <td class="text-right"><input id="ccCount-${idx}" type="number" value="${it.countedQty !== null && it.countedQty !== undefined ? it.countedQty : it.systemQty}" style="width:90px;text-align:right" onchange="OperationsPage.updateCCDiff(${idx})"></td>
              <td class="text-right"><strong class="num" id="ccDiff-${idx}">0</strong></td>
            </tr>`).join('')}
          </tbody>
        </table></div>
        <label class="field" style="margin-top:14px"><span>Catatan</span><textarea id="ccFinishNote" placeholder="Hasil count..."></textarea></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-success" onclick="OperationsPage.saveCycleCountResult('${id}')">${I.check} Simpan Hasil</button>`
    });
    c.items.forEach((it, idx) => this.updateCCDiff(idx, true));
  },

  updateCCDiff(idx, silent = false) {
    const systemQty = parseInt(document.getElementById(`ccSys-${idx}`).textContent) || 0;
    const countedQty = parseInt(document.getElementById(`ccCount-${idx}`).value) || 0;
    const diff = countedQty - systemQty;
    const el = document.getElementById(`ccDiff-${idx}`);
    if (el) {
      el.textContent = `${diff > 0 ? '+' : ''}${diff}`;
      el.style.color = diff === 0 ? 'var(--success)' : 'var(--warning)';
    }
  },

  saveCycleCountResult(id) {
    const c = DB.find('cycleCounts', id);
    if (!c) return;
    let totalDiff = 0;
    let hasDiff = false;
    c.items.forEach((it, idx) => {
      const countedQty = parseInt(document.getElementById(`ccCount-${idx}`).value) || 0;
      const diff = countedQty - it.systemQty;
      if (diff !== 0) {
        hasDiff = true;
        totalDiff += diff;
        // Apply stock adjustment
        const p = DB.product(it.productId);
        if (p) {
          DB.update('products', p.id, { onHand: p.onHand + diff });
          DB.add('movements', {
            id: DB.genId('MOV'), type: 'adjustment', productId: p.id, qty: diff,
            ref: c.number, warehouseId: 'WH-CTG', createdAt: DB.now(), user: 'Admin',
            note: `Hasil cycle count ${c.number}`
          });
        }
      }
    });

    const updatedItems = c.items.map((it, idx) => ({
      ...it,
      countedQty: parseInt(document.getElementById(`ccCount-${idx}`).value) || 0
    }));
    DB.update('cycleCounts', id, {
      status: 'completed',
      completedDate: DB.now(),
      items: updatedItems,
      discrepancy: totalDiff,
      note: document.getElementById('ccFinishNote').value || c.note
    });

    DB.audit('close', 'cycleCount', id, `${c.number} selesai — discrepancy ${totalDiff > 0 ? '+' : ''}${totalDiff}`, 'Admin');
    Toast.show(hasDiff ? `Count selesai — ${totalDiff > 0 ? '+' : ''}${totalDiff} unit selisih, stok disesuaikan` : 'Count selesai — semua akurat 🎉', hasDiff ? 'warning' : 'success');
    Modal.close();
    this.cycleCount();
  }
};