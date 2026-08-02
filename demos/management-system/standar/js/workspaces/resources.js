/* ============================================
   AutoNexa — Resources (Inventory Magazine)
   ============================================ */

const ResourcesPage = {
  _viewMode: 'rak',
  _subTab: 'parts',

  /* ==================== SPARE PARTS — RAK VIEW ==================== */
  parts() {
    const content = document.getElementById('pageContent');
    this._subTab = 'parts';
    const parts = DB.get('spareParts');

    content.innerHTML = `
      ${App.pageHeader('📦', 'Spare Parts', 'Katalog part & stok di rak bengkel', `
        <div class="view-toggle">
          <button class="${this._viewMode === 'rak' ? 'active' : ''}" onclick="ResourcesPage.toggleView('rak')">Rak View</button>
          <button class="${this._viewMode === 'list' ? 'active' : ''}" onclick="ResourcesPage.toggleView('list')">List View</button>
        </div>
        <button class="btn btn-accent" onclick="ResourcesPage.addPart()">${I.plus} Part Baru</button>
      `)}

      ${this.subTabs()}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.box}</span>
            <h3>${this._viewMode === 'rak' ? 'Rak Penyimpanan' : 'Daftar Part'}</h3>
            <span class="count">${parts.length}</span>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="ResourcesPage.exportCSV()">${I.download} Export</button>
        </div>

        ${this._viewMode === 'rak' ? this.rakView(parts) : this.listView(parts)}
      </div>
    `;
  },

  rakView(parts) {
    return `
      <div class="rak-grid">
        ${parts.map(p => {
          const lvl = stockLevel(p);
          const totalCost = p.stock * p.cost;
          return `
            <div class="rak-card" onclick="ResourcesPage.showPartDetail('${p.id}')">
              <div class="rak-loc ${lvl.locCls}">RAK ${esc(p.location)}</div>
              <div class="rak-name">${esc(p.name)}</div>
              <div class="rak-sku">${esc(p.sku)} · ${esc(p.brand)}</div>
              <div class="rak-stockbar"><div class="${lvl.locCls}" style="width:${lvl.pct}%"></div></div>
              <div class="rak-meta">
                <span>Stok <strong>${p.stock}</strong> / ${p.maxStock}</span>
                <span class="badge ${lvl.cls}">${lvl.label}</span>
              </div>
              <div class="rak-meta" style="margin-top:4px">
                <span>Nilai</span>
                <span><strong>${DB.fmtMoney(totalCost)}</strong></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  listView(parts) {
    return tableHTML(
      [
        { label: 'Part' },
        { label: 'SKU' },
        { label: 'Kategori' },
        { label: 'Rak' },
        { label: 'Stok' },
        { label: 'Min' },
        { label: 'Harga Jual' },
        { label: 'Nilai Stok' },
        { label: 'Status' },
        { label: 'Aksi', right: true }
      ],
      parts.map(p => {
        const lvl = stockLevel(p);
        return `
          <tr>
            <td><span class="td-main">${esc(p.name)}</span></td>
            <td><span class="td-sub">${esc(p.sku)}</span></td>
            <td>${esc(p.category)}</td>
            <td><span class="td-plate">${esc(p.location)}</span></td>
            <td><strong>${p.stock}</strong></td>
            <td>${p.minStock}</td>
            <td class="text-right">${DB.fmtMoney(p.price)}</td>
            <td class="text-right">${DB.fmtMoney(p.stock * p.cost)}</td>
            <td>${statusBadge(lvl.label.toLowerCase())}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" title="Edit" onclick="ResourcesPage.stockIn('${p.id}')">${I.plus}</button>
                <button class="icon-btn" title="Kurangi" onclick="ResourcesPage.stockOut('${p.id}')">${I.minus}</button>
              </div>
            </td>
          </tr>
        `;
      })
    );
  },

  toggleView(mode) {
    this._viewMode = mode;
    this.parts();
  },

  subTabs() {
    const items = [
      { key: 'parts', label: 'Spare Parts' },
      { key: 'inventory', label: 'Inventory' },
      { key: 'suppliers', label: 'Supplier' },
      { key: 'customers', label: 'Customer' },
      { key: 'vehicles', label: 'Vehicle' },
      { key: 'mechanics', label: 'Mechanic' }
    ];
    return `
    `;
  },

  navigateSub(key) {
    this._subTab = key;
    const dispatch = {
      parts: 'parts',
      inventory: 'inventory',
      suppliers: 'suppliers',
      customers: 'customers',
      vehicles: 'vehicles',
      mechanics: 'mechanics'
    };
    this[dispatch[key]]();
  },

  /* ==================== PART DETAIL & STOCK MOVEMENT ==================== */
  showPartDetail(partId) {
    const p = DB.part(partId);
    if (!p) return;
    const movements = DB.get('partMovements').filter(m => m.partId === partId).slice(0, 8);

    Modal.open({
      title: p.name,
      icon: '📦',
      size: 'lg',
      body: `
        <div class="cp-section">
          <strong>Informasi Part</strong>
          <div class="cp-row"><span>SKU</span><strong><span class="td-plate">${esc(p.sku)}</span></strong></div>
          <div class="cp-row"><span>Kategori</span><strong>${esc(p.category)}</strong></div>
          <div class="cp-row"><span>Brand</span><strong>${esc(p.brand)}</strong></div>
          <div class="cp-row"><span>Lokasi Rak</span><strong>${esc(p.location)}</strong></div>
          <div class="cp-row"><span>Stok</span><strong>${p.stock} unit</strong></div>
          <div class="cp-row"><span>Min / Max</span><strong>${p.minStock} / ${p.maxStock}</strong></div>
          <div class="cp-row"><span>Harga Beli</span><strong>${esc(DB.fmtMoney(p.cost))}</strong></div>
          <div class="cp-row"><span>Harga Jual</span><strong>${esc(DB.fmtMoney(p.price))}</strong></div>
        </div>
        <div class="cp-section">
          <strong>Riwayat Perpindahan</strong>
          ${movements.length ? movements.map(m => `
            <div class="cp-part">
              <span class="pp-name">${m.type === 'in' ? '⬇ Masuk' : '⬆ Keluar'} ${m.qty} × ${esc(DB.partName(m.partId))}</span>
              <span style="font-size:10.5px;color:var(--text-3)">${esc(DB.fmtDateShort(m.createdAt))}</span>
            </div>
          `).join('') : '<div style="font-size:11.5px;color:var(--text-3)">Belum ada perpindahan stok</div>'}
        </div>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="ResourcesPage.stockIn('${partId}')">${I.plus} Stok Masuk</button>
        <button class="btn btn-accent" onclick="Modal.close()">Tutup</button>
      `
    });
  },

  stockIn(partId) {
    const p = DB.part(partId);
    if (!p) return;
    Modal.open({
      title: `Stok Masuk — ${p.name}`,
      icon: '📥',
      body: `
        <label class="field">
          <span>Jumlah</span>
          <input id="stockInQty" class="input" type="number" min="1" value="1">
        </label>
        <label class="field">
          <span>Catatan</span>
          <input id="stockInNote" class="input" placeholder="Restok dari supplier…">
        </label>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="stockInSave">Simpan</button>
      `
    });
    document.getElementById('stockInSave').onclick = () => {
      const qty = parseInt(document.getElementById('stockInQty').value) || 1;
      const note = document.getElementById('stockInNote').value.trim();
      DB.partIn(partId, qty, 'Pembelian', DB.genId('PO'), note);
      Modal.close();
      Toast.show(`Stok masuk ${qty} unit`, 'success');
      this.parts();
    };
  },

  stockOut(partId) {
    const p = DB.part(partId);
    if (!p) return;
    Modal.open({
      title: `Stok Keluar — ${p.name}`,
      icon: '📤',
      body: `
        <label class="field">
          <span>Jumlah</span>
          <input id="stockOutQty" class="input" type="number" min="1" value="1">
        </label>
        <label class="field">
          <span>Catatan</span>
          <input id="stockOutNote" class="input" placeholder="Dipakai untuk WO…">
        </label>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-danger" id="stockOutSave">Kurangi</button>
      `
    });
    document.getElementById('stockOutSave').onclick = () => {
      const qty = parseInt(document.getElementById('stockOutQty').value) || 1;
      const note = document.getElementById('stockOutNote').value.trim();
      const ok = DB.partOut(partId, qty, 'Manual', '-', note);
      if (!ok) {
        Toast.show(`Stok tidak cukup (tersisa ${p.stock})`, 'error');
        return;
      }
      Modal.close();
      Toast.show(`Stok keluar ${qty} unit`, 'success');
      this.parts();
    };
  },

  addPart() {
    Modal.open({
      title: 'Tambah Part Baru',
      icon: '📦',
      body: `
        <div class="form-grid">
          <label class="field">
            <span>Nama Part</span>
            <input id="partName" class="input" placeholder="Oli Mesin 10W-40 (4L)">
          </label>
          <label class="field">
            <span>SKU</span>
            <input id="partSku" class="input" placeholder="SP-0013">
          </label>
          <label class="field">
            <span>Kategori</span>
            <select id="partCat" class="input">
              <option>Oli & Filter</option><option>Rem</option><option>Mesin</option>
              <option>Kelistrikan</option><option>Ban</option><option>Suspensi</option><option>AC</option>
            </select>
          </label>
          <label class="field">
            <span>Brand</span>
            <input id="partBrand" class="input" placeholder="Bosch">
          </label>
          <label class="field">
            <span>Lokasi Rak</span>
            <input id="partLoc" class="input" placeholder="F1">
          </label>
          <label class="field">
            <span>Harga Beli (Rp)</span>
            <input id="partCost" class="input" type="number" placeholder="100000">
          </label>
          <label class="field">
            <span>Harga Jual (Rp)</span>
            <input id="partPrice" class="input" type="number" placeholder="150000">
          </label>
          <label class="field">
            <span>Stok Awal</span>
            <input id="partStock" class="input" type="number" value="0">
          </label>
          <label class="field full">
            <span>Min / Max Stok</span>
            <div style="display:flex;gap:10px">
              <input id="partMin" class="input" type="number" placeholder="Min" value="5">
              <input id="partMax" class="input" type="number" placeholder="Max" value="30">
            </div>
          </label>
        </div>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="partAddSave">Simpan Part</button>
      `
    });
    document.getElementById('partAddSave').onclick = () => {
      const name = document.getElementById('partName').value.trim();
      const sku = document.getElementById('partSku').value.trim();
      if (!name) {
        Toast.show('Nama part wajib diisi', 'warning');
        return;
      }
      const newPart = {
        id: DB.genId('PRT'),
        sku: sku || `SP-${String(DB.get('spareParts').length + 1).padStart(4, '0')}`,
        name,
        category: document.getElementById('partCat').value,
        brand: document.getElementById('partBrand').value.trim() || '-',
        location: document.getElementById('partLoc').value.trim() || 'F1',
        stock: parseInt(document.getElementById('partStock').value) || 0,
        minStock: parseInt(document.getElementById('partMin').value) || 5,
        maxStock: parseInt(document.getElementById('partMax').value) || 30,
        cost: parseInt(document.getElementById('partCost').value) || 0,
        price: parseInt(document.getElementById('partPrice').value) || 0
      };
      DB.add('spareParts', newPart);
      DB.log('create', 'part', newPart.id, `Menambahkan part baru — ${name}`);
      Modal.close();
      Toast.show(`Part ${name} ditambahkan`, 'success');
      this.parts();
    };
  },

  exportCSV() {
    const parts = DB.get('spareParts');
    const rows = parts.map(p => [p.sku, p.name, p.category, p.brand, p.location, p.stock, p.minStock, p.maxStock, p.cost, p.price]);
    rows.unshift(['SKU', 'Nama', 'Kategori', 'Brand', 'Rak', 'Stok', 'Min', 'Max', 'Harga Beli', 'Harga Jual']);
    exportCSV('spare-parts.csv', rows);
    Toast.show('Daftar part diekspor', 'success');
  },

  /* ==================== INVENTORY ==================== */
  inventory() {
    const content = document.getElementById('pageContent');
    this._subTab = 'inventory';
    const parts = DB.get('spareParts');
    const moves = [...DB.get('partMovements')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 12);
    const lowParts = DB.lowStockParts();

    content.innerHTML = `
      ${App.pageHeader('📊', 'Inventory', 'Ringkasan stok & perpindahan part', `
        <button class="btn btn-accent" onclick="ResourcesPage.stockInModal()">${I.plus} Stok Masuk</button>
      `)}

      ${this.subTabs()}

      <!-- KPI strip -->
      <div class="kpi-strip">
        <div class="kpi-cell"><span class="kc-label">Total Part</span><span class="kc-value">${parts.length}</span></div>
        <div class="kpi-cell"><span class="kc-label">Total Unit</span><span class="kc-value">${DB.totalPartStock()}</span></div>
        <div class="kpi-cell"><span class="kc-label">Nilai Stok</span><span class="kc-value">${DB.fmtMoney(Math.round(DB.totalPartValue() / 1000))}<small>rb</small></span></div>
        <div class="kpi-cell"><span class="kc-label">Part Menipis</span><span class="kc-value" style="color:${lowParts.length ? 'var(--warning)' : 'var(--text)'}">${lowParts.length}</span></div>
      </div>

      <!-- Low stock alert -->
      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.alert}</span>
            <h3>Peringatan Stok Menipis</h3>
            <span class="count">${lowParts.length}</span>
          </div>
        </div>
        ${lowParts.length ? lowParts.map(p => {
          const lvl = stockLevel(p);
          return `
            <div class="wo-card status-${esc(lvl.locCls)}" onclick="ResourcesPage.showPartDetail('${p.id}')">
              <div class="wo-top">
                <span class="wo-vehicle">${esc(p.name)}</span>
                <span class="wo-plate">RAK ${esc(p.location)}</span>
                <span style="margin-left:auto">${statusBadge(lvl.label.toLowerCase())}</span>
              </div>
              <div class="wo-bottom">
                <div class="wo-progress" style="max-width:100%"><div class="${lvl.locCls}" style="width:${lvl.pct}%"></div></div>
                <strong>${p.stock} unit tersisa</strong>
              </div>
            </div>
          `;
        }).join('') : '<div class="panel"><div class="empty-state"><div class="es-ic">✅</div><p>Semua stok aman</p></div></div>'}
      </div>

      <!-- Part movements -->
      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.activity}</span>
            <h3>Perpindahan Stok</h3>
            <span class="count">${moves.length}</span>
          </div>
        </div>
        ${tableHTML(
          [
            { label: 'Waktu' },
            { label: 'Part' },
            { label: 'Tipe' },
            { label: 'Jumlah' },
            { label: 'Referensi' },
            { label: 'Catatan' }
          ],
          moves.map(m => `
            <tr>
              ${td(esc(DB.fmtDateShort(m.createdAt)))}
              ${td(`<span class="td-main">${esc(DB.partName(m.partId))}</span>`)}
              ${td(m.type === 'in' ? '<span class="badge success">Masuk</span>' : '<span class="badge danger">Keluar</span>')}
              ${td(`<strong style="color:${m.type === 'in' ? 'var(--success)' : 'var(--danger)'}">${m.type === 'in' ? '+' : '-'}${m.qty}</strong>`)}
              ${td(`<span class="td-sub">${esc(m.refType)} ${esc(m.refId)}</span>`)}
              ${td(`<span class="td-sub">${esc(m.note)}</span>`)}
            </tr>
          `)
        )}
      </div>
    `;
  },

  stockInModal() {
    const parts = DB.get('spareParts');
    Modal.open({
      title: 'Stok Masuk (Pembelian)',
      icon: '📥',
      body: `
        <label class="field">
          <span>Part</span>
          <select id="buyPart" class="input">
            ${parts.map(p => `<option value="${p.id}">${esc(p.name)} (stok ${p.stock})</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>Jumlah</span>
          <input id="buyQty" class="input" type="number" min="1" value="1">
        </label>
        <label class="field">
          <span>Catatan</span>
          <input id="buyNote" class="input" placeholder="Restok dari supplier…">
        </label>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="buySave">Simpan</button>
      `
    });
    document.getElementById('buySave').onclick = () => {
      const partId = document.getElementById('buyPart').value;
      const qty = parseInt(document.getElementById('buyQty').value) || 1;
      const note = document.getElementById('buyNote').value.trim();
      if (!partId) return;
      DB.partIn(partId, qty, 'Pembelian', DB.genId('PO'), note);
      Modal.close();
      Toast.show('Stok berhasil ditambahkan', 'success');
      this.inventory();
    };
  },

  /* ==================== SUPPLIERS ==================== */
  suppliers() {
    const content = document.getElementById('pageContent');
    this._subTab = 'suppliers';
    const suppliers = DB.get('suppliers');

    content.innerHTML = `
      ${App.pageHeader('🏭', 'Supplier', 'Daftar pemasok spare part', `
        <button class="btn btn-accent" onclick="ResourcesPage.addSupplier()">${I.plus} Supplier Baru</button>
      `)}

      ${this.subTabs()}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.supplier}</span>
            <h3>Pemasok</h3>
            <span class="count">${suppliers.length}</span>
          </div>
        </div>
        ${tableHTML(
          [
            { label: 'Nama' },
            { label: 'Kota' },
            { label: 'Telepon' },
            { label: 'Item' },
            { label: 'Status' }
          ],
          suppliers.map(s => `
            <tr>
              ${td(`<span class="td-main">${esc(s.name)}</span>`)}
              ${td(esc(s.city))}
              ${td(`<span class="td-sub">${esc(s.phone)}</span>`)}
              ${td(`<span class="text-right"><strong>${s.itemCount}</strong></span>`)}
              ${td(statusBadge(s.status))}
            </tr>
          `)
        )}
      </div>
    `;
  },

  addSupplier() {
    Modal.open({
      title: 'Tambah Supplier',
      icon: '🏭',
      body: `
        <div class="form-grid">
          <label class="field">
            <span>Nama</span>
            <input id="supName" class="input" placeholder="PT Sumber Partindo">
          </label>
          <label class="field">
            <span>Kota</span>
            <input id="supCity" class="input" placeholder="Jakarta">
          </label>
          <label class="field">
            <span>Telepon</span>
            <input id="supPhone" class="input" placeholder="021-0000-0000">
          </label>
        </div>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="supSave">Simpan</button>
      `
    });
    document.getElementById('supSave').onclick = () => {
      const name = document.getElementById('supName').value.trim();
      if (!name) {
        Toast.show('Nama supplier wajib diisi', 'warning');
        return;
      }
      DB.add('suppliers', {
        id: DB.genId('SUP'),
        name,
        city: document.getElementById('supCity').value.trim() || '-',
        phone: document.getElementById('supPhone').value.trim() || '-',
        status: 'active',
        itemCount: 0
      });
      DB.log('create', 'supplier', name, `Menambahkan supplier — ${name}`);
      Modal.close();
      Toast.show(`Supplier ${name} ditambahkan`, 'success');
      this.suppliers();
    };
  },

  /* ==================== CUSTOMERS ==================== */
  customers() {
    const content = document.getElementById('pageContent');
    this._subTab = 'customers';
    const customers = DB.get('customers');

    content.innerHTML = `
      ${App.pageHeader('👥', 'Customer', 'Database pelanggan bengkel', `
        <button class="btn btn-accent" onclick="ResourcesPage.addCustomer()">${I.plus} Customer Baru</button>
      `)}

      ${this.subTabs()}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.users}</span>
            <h3>Pelanggan</h3>
            <span class="count">${customers.length}</span>
          </div>
        </div>
        ${tableHTML(
          [
            { label: 'Nama' },
            { label: 'Telepon' },
            { label: 'Kota' },
            { label: 'Kendaraan' },
            { label: 'Status' }
          ],
          customers.map(c => `
            <tr>
              ${td(`<span class="td-main">${esc(c.name)}</span>`)}
              ${td(`<span class="td-sub">${esc(c.phone)}</span>`)}
              ${td(esc(c.city))}
              ${td(DB.get('vehicles').filter(v => v.customerId === c.id).map(v => `<span class="td-plate" style="margin-right:4px">${esc(v.plate)}</span>`).join('') || '—')}
              ${td(statusBadge(c.status))}
            </tr>
          `)
        )}
      </div>
    `;
  },

  addCustomer() {
    Modal.open({
      title: 'Tambah Customer',
      icon: '👤',
      body: `
        <div class="form-grid">
          <label class="field">
            <span>Nama</span>
            <input id="cusName" class="input" placeholder="Hendra Wijaya">
          </label>
          <label class="field">
            <span>Telepon</span>
            <input id="cusPhone" class="input" placeholder="0812-0000-0000">
          </label>
          <label class="field">
            <span>Kota</span>
            <input id="cusCity" class="input" placeholder="Jakarta">
          </label>
        </div>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="cusSave">Simpan</button>
      `
    });
    document.getElementById('cusSave').onclick = () => {
      const name = document.getElementById('cusName').value.trim();
      if (!name) {
        Toast.show('Nama customer wajib diisi', 'warning');
        return;
      }
      DB.add('customers', {
        id: DB.genId('CUS'),
        name,
        phone: document.getElementById('cusPhone').value.trim() || '-',
        city: document.getElementById('cusCity').value.trim() || '-',
        status: 'active',
        vehicleCount: 0
      });
      DB.log('create', 'customer', name, `Menambahkan pelanggan — ${name}`);
      Modal.close();
      Toast.show(`Customer ${name} ditambahkan`, 'success');
      this.customers();
    };
  },

  /* ==================== VEHICLES ==================== */
  vehicles() {
    const content = document.getElementById('pageContent');
    this._subTab = 'vehicles';
    const vehicles = DB.get('vehicles');

    content.innerHTML = `
      ${App.pageHeader('🚗', 'Vehicle', 'Database kendaraan pelanggan', `
        <button class="btn btn-accent" onclick="ResourcesPage.addVehicle()">${I.plus} Kendaraan Baru</button>
      `)}

      ${this.subTabs()}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.car}</span>
            <h3>Kendaraan</h3>
            <span class="count">${vehicles.length}</span>
          </div>
        </div>
        ${tableHTML(
          [
            { label: 'Plat' },
            { label: 'Model' },
            { label: 'Tahun' },
            { label: 'Warna' },
            { label: 'Bahan Bakar' },
            { label: 'Pemilik' }
          ],
          vehicles.map(v => `
            <tr>
              ${td(`<span class="td-plate">${esc(v.plate)}</span>`)}
              ${td(`<span class="td-main">${esc(v.brand)} ${esc(v.model)}</span>`)}
              ${td(v.year)}
              ${td(esc(v.color))}
              ${td(esc(v.fuel))}
              ${td(esc(DB.customerName(v.customerId)))}
            </tr>
          `)
        )}
      </div>
    `;
  },

  addVehicle() {
    const customers = DB.get('customers');
    Modal.open({
      title: 'Tambah Kendaraan',
      icon: '🚗',
      body: `
        <div class="form-grid">
          <label class="field">
            <span>Pemilik</span>
            <select id="vehOwner" class="input">
              ${customers.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Plat Nomor</span>
            <input id="vehPlate" class="input" placeholder="B 1234 XYZ">
          </label>
          <label class="field">
            <span>Merk</span>
            <input id="vehBrand" class="input" placeholder="Toyota">
          </label>
          <label class="field">
            <span>Model</span>
            <input id="vehModel" class="input" placeholder="Avanza 1.5">
          </label>
          <label class="field">
            <span>Tahun</span>
            <input id="vehYear" class="input" type="number" placeholder="2020">
          </label>
          <label class="field">
            <span>Warna</span>
            <input id="vehColor" class="input" placeholder="Putih">
          </label>
        </div>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="vehSave">Simpan</button>
      `
    });
    document.getElementById('vehSave').onclick = () => {
      const plate = document.getElementById('vehPlate').value.trim();
      const brand = document.getElementById('vehBrand').value.trim();
      if (!plate || !brand) {
        Toast.show('Plat dan merk wajib diisi', 'warning');
        return;
      }
      DB.add('vehicles', {
        id: DB.genId('VEH'),
        customerId: document.getElementById('vehOwner').value,
        plate,
        brand,
        model: document.getElementById('vehModel').value.trim() || '-',
        year: parseInt(document.getElementById('vehYear').value) || 2020,
        color: document.getElementById('vehColor').value.trim() || '-',
        fuel: 'Bensin'
      });
      DB.log('create', 'vehicle', plate, `Menambahkan kendaraan — ${plate}`);
      Modal.close();
      Toast.show(`Kendaraan ${plate} ditambahkan`, 'success');
      this.vehicles();
    };
  },

  /* ==================== MECHANICS ==================== */
  mechanics() {
    const content = document.getElementById('pageContent');
    this._subTab = 'mechanics';
    const mechanics = DB.get('mechanics');

    content.innerHTML = `
      ${App.pageHeader('🔧', 'Mechanic', 'Tim mekanik bengkel', `
        <button class="btn btn-accent" onclick="ResourcesPage.addMechanic()">${I.plus} Mekanik Baru</button>
      `)}

      ${this.subTabs()}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.wrench}</span>
            <h3>Mekanik</h3>
            <span class="count">${mechanics.length}</span>
          </div>
        </div>
        ${tableHTML(
          [
            { label: 'Mekanik' },
            { label: 'Spesialisasi' },
            { label: 'Status' },
            { label: 'Telepon' },
            { label: 'WO Aktif' }
          ],
          mechanics.map(m => {
            const activeWO = DB.get('workOrders').filter(wo => wo.mechanicId === m.id && !['done','cancelled'].includes(wo.status));
            return `
              <tr>
                ${td(`<span class="td-main">${esc(m.name)}</span>`)}
                ${td(esc(m.specialty))}
                ${td(statusBadge(m.status))}
                ${td(`<span class="td-sub">${esc(m.phone)}</span>`)}
                ${td(activeWO.length ? activeWO.map(wo => `<span class="td-plate" style="margin-right:4px">${esc(wo.number)}</span>`).join('') : '—')}
              </tr>
            `;
          })
        )}
      </div>
    `;
  },

  addMechanic() {
    Modal.open({
      title: 'Tambah Mekanik',
      icon: '🔧',
      body: `
        <div class="form-grid">
          <label class="field">
            <span>Nama</span>
            <input id="mecName" class="input" placeholder="Andi Setiawan">
          </label>
          <label class="field">
            <span>Spesialisasi</span>
            <select id="mecSpec" class="input">
              <option>Mesin</option><option>Kelistrikan</option><option>AC & Body</option>
              <option>Suspensi & Rem</option><option>Ban & Balancing</option>
            </select>
          </label>
          <label class="field">
            <span>Telepon</span>
            <input id="mecPhone" class="input" placeholder="0812-0000-0000">
          </label>
        </div>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="mecSave">Simpan</button>
      `
    });
    document.getElementById('mecSave').onclick = () => {
      const name = document.getElementById('mecName').value.trim();
      if (!name) {
        Toast.show('Nama mekanik wajib diisi', 'warning');
        return;
      }
      DB.add('mechanics', {
        id: DB.genId('MEC'),
        name,
        specialty: document.getElementById('mecSpec').value,
        initials: initials(name),
        status: 'available',
        phone: document.getElementById('mecPhone').value.trim() || '-'
      });
      DB.log('create', 'mechanic', name, `Menambahkan mekanik — ${name}`);
      Modal.close();
      Toast.show(`Mekanik ${name} ditambahkan`, 'success');
      this.mechanics();
    };
  }
};