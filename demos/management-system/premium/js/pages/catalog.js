/* ============================================
   NexaWMS Pro — Catalog Pages
   Products · Categories · Brand · Unit · Price List · Supplier · Customer
   ============================================ */

const CatalogPage = {

  /* ================= PRODUCTS ================= */
  products() {
    const content = document.getElementById('pageContent');
    const products = DB.get('products');

    content.innerHTML = `
      ${App.pageHeader('📦', 'Products', 'Kelola katalog produk, stok, dan harga', `
        <button class="btn btn-ghost" onclick="CatalogPage.exportProducts()">${I.download} Export</button>
        <button class="btn btn-primary" onclick="CatalogPage.openProductModal()">${I.plus} Tambah Produk</button>
      `)}

      <div class="toolbar">
        <div class="toolbar-search">
          ${I.search}
          <input id="prodSearch" placeholder="Cari nama produk atau SKU..." oninput="CatalogPage.filterProducts()">
        </div>
        <select id="prodCategory" onchange="CatalogPage.filterProducts()">
          <option value="all">Semua Kategori</option>
          ${DB.get('categories').map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
        </select>
        <select id="prodStatus" onchange="CatalogPage.filterProducts()">
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
        <span class="flex-spacer"></span>
        <span style="font-size:12px;color:var(--text-3)">${products.length} produk</span>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Produk</th><th>Kategori</th><th>Brand</th>
              <th class="text-right">Stok</th><th class="text-right">Harga Beli</th><th class="text-right">Harga Jual</th>
              <th>Ketersediaan</th><th>Status</th><th>Lokasi</th><th class="text-right">Aksi</th>
            </tr></thead>
            <tbody>
              ${products.map(p => {
                const sl = stockLevel(p);
                return `<tr class="prod-row" data-prod-category="${p.categoryId}" data-prod-status="${p.status}" data-prod-search="${esc((p.name + ' ' + p.sku + ' ' + DB.brandName(p.brandId)).toLowerCase())}">
                  ${td(`<div class="product-cell">${productThumb(p.sku, p.name)}<div><div class="cell-main">${esc(p.name)}</div><div class="cell-sub">${esc(p.sku)}</div></div></div>`)}
                  ${td(esc(DB.categoryName(p.categoryId)))}
                  ${td(esc(DB.brandName(p.brandId)))}
                  ${td(`<div class="stock-bar" style="min-width:110px"><div class="bar-track"><div class="bar-fill" style="width:${sl.pct}%;background:${sl.color}"></div></div><span class="bar-val">${p.onHand}</span></div>`, 'text-right')}
                  ${td(DB.fmtMoney(p.cost), 'text-right num')}
                  ${td(`<strong class="money">${DB.fmtMoney(p.price)}</strong>`, 'text-right')}
                  ${td(customBadge(sl.cls, sl.label))}
                  ${td(p.status === 'active' ? customBadge('success', 'Aktif') : customBadge('neutral', 'Nonaktif'))}
                  ${td(`<span class="scan-badge">${esc(DB.location(p.locationId)?.code || '-')}</span>`)}
                  ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                    <button class="icon-btn" title="Edit" onclick="CatalogPage.editProduct('${p.id}')">${I.edit}</button>
                    ${p.status === 'active'
                      ? `<button class="icon-btn" title="Nonaktifkan" style="color:var(--warning)" onclick="CatalogPage.toggleProduct('${p.id}')">👁</button>`
                      : `<button class="icon-btn" title="Aktifkan" style="color:var(--success)" onclick="CatalogPage.toggleProduct('${p.id}')">✅</button>`}
                    <button class="icon-btn danger" title="Hapus" onclick="CatalogPage.deleteProduct('${p.id}')">${I.trash}</button>
                  </div>`, 'text-right')}
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterProducts() {
    const q = (document.getElementById('prodSearch').value || '').toLowerCase();
    const cat = document.getElementById('prodCategory').value;
    const status = document.getElementById('prodStatus').value;
    document.querySelectorAll('.prod-row').forEach(tr => {
      const matchQ = !q || tr.dataset.prodSearch.includes(q);
      const matchC = cat === 'all' || tr.dataset.prodCategory === cat;
      const matchS = status === 'all' || tr.dataset.prodStatus === status;
      tr.style.display = matchQ && matchC && matchS ? '' : 'none';
    });
  },

  exportProducts() {
    exportExcel('nexawms-products.xls', 'Products', 
      ['SKU', 'Nama Produk', 'Kategori', 'Brand', 'Unit', 'Stok On Hand', 'Harga Beli', 'Harga Jual', 'Status', 'Lokasi'],
      DB.get('products').map(p => [
        p.sku, p.name, DB.categoryName(p.categoryId), DB.brandName(p.brandId), DB.unitName(p.unitId),
        p.onHand, p.cost, p.price, p.status === 'active' ? 'Aktif' : 'Nonaktif', DB.location(p.locationId)?.code || '-'
      ])
    );
    DB.audit('export', 'product', 'ALL', 'Export data produk (Excel)', 'Admin');
    Toast.show('Data produk berhasil diexport (Excel)', 'success');
  },

  openProductModal(product) {
    const isEdit = !!product;
    Modal.open({
      title: isEdit ? 'Edit Produk' : 'Tambah Produk Baru',
      icon: '📦', size: 'lg',
      body: `
        <div class="modal-form-section">
          <h4>📋 Informasi Dasar</h4>
          <div class="form-grid">
            <label class="field full"><span>Nama Produk</span><input id="prodName" value="${product ? esc(product.name) : ''}" placeholder="cth: Lenovo ThinkPad E14"></label>
            <label class="field"><span>SKU</span><input id="prodSku" value="${product ? esc(product.sku) : ''}" placeholder="cth: ELC-LNV-001"></label>
            <label class="field"><span>Status</span>
              <select id="prodActive">
                <option value="active" ${product && product.status === 'active' ? 'selected' : ''}>Aktif</option>
                <option value="inactive" ${product && product.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
              </select>
            </label>
            <label class="field"><span>Kategori</span>
              <select id="prodCat">${DB.get('categories').map(c => `<option value="${c.id}" ${product && product.categoryId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
            </label>
            <label class="field"><span>Brand</span>
              <select id="prodBrand">${DB.get('brands').map(b => `<option value="${b.id}" ${product && product.brandId === b.id ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>
            </label>
            <label class="field"><span>Unit</span>
              <select id="prodUnit">${DB.get('units').map(u => `<option value="${u.id}" ${product && product.unitId === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>
            </label>
          </div>
        </div>
        <div class="modal-form-section">
          <h4>💰 Harga & Stock</h4>
          <div class="form-grid">
            <label class="field"><span>Harga Beli (Cost)</span><input id="prodCost" type="number" value="${product ? product.cost : ''}" placeholder="0"></label>
            <label class="field"><span>Harga Jual</span><input id="prodPrice" type="number" value="${product ? product.price : ''}" placeholder="0"></label>
            <label class="field"><span>Stok On Hand</span><input id="prodStock" type="number" value="${product ? product.onHand : 0}"></label>
            <label class="field"><span>Reorder Point</span><input id="prodReorder" type="number" value="${product ? product.reorderPoint : 10}"></label>
            <label class="field"><span>Min Stock</span><input id="prodMin" type="number" value="${product ? product.minStock : 5}"></label>
            <label class="field"><span>Max Stock</span><input id="prodMax" type="number" value="${product ? product.maxStock : 100}"></label>
          </div>
        </div>
        <div class="modal-form-section">
          <h4>📍 Lokasi</h4>
          <div class="form-grid">
            <label class="field"><span>Lokasi Penyimpanan</span>
              <select id="prodLoc">${DB.get('locations').map(l => `<option value="${l.id}" ${product && product.locationId === l.id ? 'selected' : ''}>${esc(l.code)} — ${esc(DB.zone(l.zoneId)?.name || '')}</option>`).join('')}</select>
            </label>
            <label class="field"><span>Berat (kg)</span><input id="prodWeight" type="number" step="0.1" value="${product ? product.weight : 0}"></label>
          </div>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="CatalogPage.saveProduct(${isEdit ? `'${product.id}'` : 'null'})">${I.check} Simpan Produk</button>`
    });
  },

  editProduct(id) {
    const p = DB.find('products', id);
    if (p) this.openProductModal(p);
  },

  saveProduct(existingId) {
    const name = document.getElementById('prodName').value.trim();
    const sku = document.getElementById('prodSku').value.trim();
    if (!name || !sku) { Toast.show('Nama dan SKU wajib diisi', 'error'); return; }

    const data = {
      name,
      sku,
      status: document.getElementById('prodActive').value,
      categoryId: document.getElementById('prodCat').value,
      brandId: document.getElementById('prodBrand').value,
      unitId: document.getElementById('prodUnit').value,
      cost: +document.getElementById('prodCost').value || 0,
      price: +document.getElementById('prodPrice').value || 0,
      onHand: +document.getElementById('prodStock').value || 0,
      reorderPoint: +document.getElementById('prodReorder').value || 10,
      minStock: +document.getElementById('prodMin').value || 5,
      maxStock: +document.getElementById('prodMax').value || 100,
      locationId: document.getElementById('prodLoc').value,
      weight: +document.getElementById('prodWeight').value || 0
    };

    if (existingId) {
      DB.update('products', existingId, data);
      DB.audit('update', 'product', existingId, `Update produk ${name}`, 'Admin');
      Toast.show(`Produk "${name}" berhasil diperbarui`, 'success');
    } else {
      const p = { id: DB.genId('PRD'), ...data };
      DB.add('products', p);
      DB.audit('create', 'product', p.id, `Membuat produk ${name} (${sku})`, 'Admin');
      Toast.show(`Produk "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.products();
  },

  toggleProduct(id) {
    const p = DB.find('products', id);
    if (!p) return;
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    DB.update('products', id, { status: newStatus });
    DB.audit('update', 'product', id, `${p.name} ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`, 'Admin');
    Toast.show(`${p.name} ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
    this.products();
  },

  deleteProduct(id) {
    const p = DB.find('products', id);
    if (!p) return;
    Modal.confirm({
      title: 'Hapus Produk', icon: '🗑️', danger: true,
      message: `Yakin ingin menghapus "${p.name}"? Tindakan ini tidak dapat dibatalkan.`,
      onYes: () => {
        DB.remove('products', id);
        DB.audit('delete', 'product', id, `Menghapus produk ${p.name}`, 'Admin');
        Toast.show(`Produk "${p.name}" dihapus`, 'success');
        this.products();
      }
    });
  },

  /* ================= CATEGORIES ================= */
  categories() {
    const content = document.getElementById('pageContent');
    const categories = DB.get('categories');

    content.innerHTML = `
      ${App.pageHeader('🏷️', 'Categories', 'Kelola kategori produk', `
        <button class="btn btn-primary" onclick="CatalogPage.openCategoryModal()">${I.plus} Tambah Kategori</button>
      `)}

      <div class="grid-3">
        ${categories.map(c => {
          const count = DB.get('products').filter(p => p.categoryId === c.id).length;
          const value = DB.get('products').filter(p => p.categoryId === c.id).reduce((s, p) => s + p.onHand * p.cost, 0);
          return `
          <div class="card hoverable" style="margin:0">
            <div class="card-head" style="margin-bottom:10px">
              <h3><span class="ch-ic">${c.icon}</span> ${esc(c.name)}</h3>
              <span class="badge primary dot">${count} SKU</span>
            </div>
            <p style="color:var(--text-2);font-size:12.5px;margin-bottom:14px">${esc(c.description)}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <span style="font-size:11.5px;color:var(--text-3)">Nilai Inventory</span>
              <strong class="money">${DB.fmtMoney(value)}</strong>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm flex-spacer" onclick="CatalogPage.editCategory('${c.id}')" style="flex:1">${I.edit} Edit</button>
              <button class="btn btn-danger btn-sm" onclick="CatalogPage.deleteCategory('${c.id}')">${I.trash}</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  openCategoryModal(cat) {
    const isEdit = !!cat;
    Modal.open({
      title: isEdit ? 'Edit Kategori' : 'Tambah Kategori', icon: '🏷️',
      body: `
        <label class="field"><span>Nama Kategori</span><input id="catName" value="${cat ? esc(cat.name) : ''}" placeholder="cth: Elektronik"></label>
        <label class="field"><span>Ikon (emoji)</span><input id="catIcon" value="${cat ? esc(cat.icon) : '📦'}" placeholder="📦"></label>
        <label class="field"><span>Deskripsi</span><textarea id="catDesc" placeholder="Deskripsi kategori...">${cat ? esc(cat.description) : ''}</textarea></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="CatalogPage.saveCategory(${isEdit ? `'${cat.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editCategory(id) {
    const c = DB.find('categories', id);
    if (c) this.openCategoryModal(c);
  },

  saveCategory(existingId) {
    const name = document.getElementById('catName').value.trim();
    if (!name) { Toast.show('Nama kategori wajib diisi', 'error'); return; }
    const data = {
      name,
      icon: document.getElementById('catIcon').value || '📦',
      description: document.getElementById('catDesc').value
    };
    if (existingId) {
      DB.update('categories', existingId, data);
      DB.audit('update', 'category', existingId, `Update kategori ${name}`, 'Admin');
      Toast.show('Kategori berhasil diperbarui', 'success');
    } else {
      DB.add('categories', { id: DB.genId('CAT'), ...data });
      DB.audit('create', 'category', 'NEW', `Membuat kategori ${name}`, 'Admin');
      Toast.show(`Kategori "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.categories();
  },

  deleteCategory(id) {
    const c = DB.find('categories', id);
    const usage = DB.get('products').filter(p => p.categoryId === id).length;
    Modal.confirm({
      title: 'Hapus Kategori', icon: '🗑️', danger: true,
      message: `Hapus kategori "${c.name}"? ${usage} produk menggunakan kategori ini.`,
      onYes: () => {
        DB.remove('categories', id);
        DB.audit('delete', 'category', id, `Menghapus kategori ${c.name}`, 'Admin');
        Toast.show('Kategori dihapus', 'success');
        this.categories();
      }
    });
  },

  /* ================= BRANDS ================= */
  brands() {
    const content = document.getElementById('pageContent');
    const brands = DB.get('brands');

    content.innerHTML = `
      ${App.pageHeader('🛡️', 'Brand', 'Kelola brand / merek produk', `
        <button class="btn btn-primary" onclick="CatalogPage.openBrandModal()">${I.plus} Tambah Brand</button>
      `)}

      <div class="grid-4">
        ${brands.map(b => {
          const count = DB.get('products').filter(p => p.brandId === b.id).length;
          return `
          <div class="card hoverable" style="margin:0">
            <div class="card-head" style="margin-bottom:8px">
              <h3 style="font-size:14px"><span class="ch-ic">🛡️</span> ${esc(b.name)}</h3>
            </div>
            <p style="color:var(--text-2);font-size:12px;margin-bottom:10px">Asal: ${esc(b.origin)}</p>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="badge info dot">${count} produk</span>
              <div style="display:flex;gap:6px">
                <button class="icon-btn" onclick="CatalogPage.editBrand('${b.id}')">${I.edit}</button>
                <button class="icon-btn danger" onclick="CatalogPage.deleteBrand('${b.id}')">${I.trash}</button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  openBrandModal(brand) {
    const isEdit = !!brand;
    Modal.open({
      title: isEdit ? 'Edit Brand' : 'Tambah Brand', icon: '🛡️',
      body: `
        <label class="field"><span>Nama Brand</span><input id="brandName" value="${brand ? esc(brand.name) : ''}" placeholder="cth: Samsung"></label>
        <label class="field"><span>Negara Asal</span><input id="brandOrigin" value="${brand ? esc(brand.origin) : ''}" placeholder="cth: Korea Selatan"></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="CatalogPage.saveBrand(${isEdit ? `'${brand.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editBrand(id) {
    const b = DB.find('brands', id);
    if (b) this.openBrandModal(b);
  },

  saveBrand(existingId) {
    const name = document.getElementById('brandName').value.trim();
    if (!name) { Toast.show('Nama brand wajib diisi', 'error'); return; }
    const data = { name, origin: document.getElementById('brandOrigin').value };
    if (existingId) {
      DB.update('brands', existingId, data);
      DB.audit('update', 'brand', existingId, `Update brand ${name}`, 'Admin');
      Toast.show('Brand berhasil diperbarui', 'success');
    } else {
      DB.add('brands', { id: DB.genId('BRD'), ...data });
      DB.audit('create', 'brand', 'NEW', `Membuat brand ${name}`, 'Admin');
      Toast.show(`Brand "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.brands();
  },

  deleteBrand(id) {
    const b = DB.find('brands', id);
    Modal.confirm({
      title: 'Hapus Brand', icon: '🗑️', danger: true,
      message: `Hapus brand "${b.name}"?`,
      onYes: () => {
        DB.remove('brands', id);
        Toast.show('Brand dihapus', 'success');
        this.brands();
      }
    });
  },

  /* ================= UNITS ================= */
  units() {
    const content = document.getElementById('pageContent');
    const units = DB.get('units');

    content.innerHTML = `
      ${App.pageHeader('📐', 'Unit', 'Kelola satuan produk', `
        <button class="btn btn-primary" onclick="CatalogPage.openUnitModal()">${I.plus} Tambah Unit</button>
      `)}

      <div class="grid-4">
        ${units.map(u => {
          const count = DB.get('products').filter(p => p.unitId === u.id).length;
          return `
          <div class="card hoverable" style="margin:0">
            <div class="card-head" style="margin-bottom:0">
              <h3 style="font-size:14px"><span class="ch-ic">📐</span> ${esc(u.name)}</h3>
              <span class="badge neutral dot">${esc(u.symbol)}</span>
            </div>
            <p style="color:var(--text-2);font-size:12px;margin:6px 0 12px">${count} produk menggunakan</p>
            <div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm" style="flex:1" onclick="CatalogPage.editUnit('${u.id}')">${I.edit} Edit</button>
              <button class="icon-btn danger" onclick="CatalogPage.deleteUnit('${u.id}')">${I.trash}</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  openUnitModal(unit) {
    const isEdit = !!unit;
    Modal.open({
      title: isEdit ? 'Edit Unit' : 'Tambah Unit', icon: '📐',
      body: `
        <label class="field"><span>Nama Unit</span><input id="unitName" value="${unit ? esc(unit.name) : ''}" placeholder="cth: Pcs"></label>
        <label class="field"><span>Simbol</span><input id="unitSymbol" value="${unit ? esc(unit.symbol) : ''}" placeholder="pcs"></label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="CatalogPage.saveUnit(${isEdit ? `'${unit.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editUnit(id) {
    const u = DB.find('units', id);
    if (u) this.openUnitModal(u);
  },

  saveUnit(existingId) {
    const name = document.getElementById('unitName').value.trim();
    if (!name) { Toast.show('Nama unit wajib diisi', 'error'); return; }
    const data = { name, symbol: document.getElementById('unitSymbol').value };
    if (existingId) {
      DB.update('units', existingId, data);
      Toast.show('Unit berhasil diperbarui', 'success');
    } else {
      DB.add('units', { id: DB.genId('UNT'), ...data });
      Toast.show(`Unit "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.units();
  },

  deleteUnit(id) {
    Modal.confirm({
      title: 'Hapus Unit', icon: '🗑️', danger: true,
      message: 'Hapus unit ini?',
      onYes: () => {
        DB.remove('units', id);
        Toast.show('Unit dihapus', 'success');
        this.units();
      }
    });
  },

  /* ================= PRICE LIST ================= */
  priceList() {
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    const totalValue = DB.invValue();

    content.innerHTML = `
      ${App.pageHeader('💰', 'Price List', 'Matriks harga cost & jual semua produk', `
        <button class="btn btn-ghost" onclick="CatalogPage.exportPriceList()">${I.download} Export CSV</button>
        <button class="btn btn-primary" onclick="CatalogPage.openBulkPriceModal()">${I.sliders} Massal</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.database}</div><span class="badge info dot">Total</span></div>
          <div class="kpi-label">Total Nilai Inventory (Cost)</div>
          <div class="kpi-value" style="font-size:20px">${DB.fmtMoney(totalValue)}</div>
          <div class="kpi-sub">${products.length} produk</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.trend}</div><span class="badge success dot">Rata-rata</span></div>
          <div class="kpi-label">Margin Rata-rata</div>
          <div class="kpi-value">${(() => {
            const valid = products.filter(p => p.cost > 0);
            if (!valid.length) return '0%';
            return Math.round(valid.reduce((s,p) => s + ((p.price - p.cost) / p.cost) * 100, 0) / valid.length) + '%';
          })()}</div>
          <div class="kpi-sub">Harga jual vs cost</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.eye}</div><span class="badge accent dot">Terakhir</span></div>
          <div class="kpi-label">Update Harga Terakhir</div>
          <div class="kpi-value" style="font-size:19px">${DB.fmtDate(DB.daysAgo(1))}</div>
          <div class="kpi-sub">Oleh Admin</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📋</span> Matriks Harga</h3><div class="ch-sub">Cost & retail price per produk</div></div>
          <div class="toolbar-search" style="position:relative;max-width:300px">
            ${I.search}
            <input placeholder="Cari produk..." oninput="CatalogPage.filterPriceList(this.value)">
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Produk</th><th>SKU</th><th class="text-right">Harga Beli</th><th class="text-right">Harga Jual</th>
              <th class="text-right">Margin</th><th>Potensi Nilai</th><th class="text-right">Aksi</th>
            </tr></thead>
            <tbody>
              ${products.map(p => {
                const margin = p.cost > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;
                const marginColor = margin >= 30 ? 'var(--success)' : margin >= 15 ? 'var(--warning)' : 'var(--danger)';
                const potValue = p.onHand * p.price;
                return `<tr class="price-row" data-price-search="${esc((p.name + ' ' + p.sku).toLowerCase())}">
                  ${td(`<div class="product-cell">${productThumb(p.sku, p.name)}<div><div class="cell-main" style="font-size:12.5px">${esc(p.name)}</div><div class="cell-sub">${DB.categoryName(p.categoryId)}</div></div></div>`)}
                  ${td(`<span class="scan-badge">${esc(p.sku)}</span>`)}
                  ${td(`<span class="num">${DB.fmtMoney(p.cost)}</span>`, 'text-right')}
                  ${td(`<strong class="money num">${DB.fmtMoney(p.price)}</strong>`, 'text-right')}
                  ${td(`<strong class="num" style="color:${marginColor}">${margin}%</strong>`, 'text-right')}
                  ${td(`<div class="stock-bar"><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, Math.max(5, (potValue / totalValue) * 100))}%;background:var(--primary)"></div></div><span class="bar-val" style="font-size:11px">${DB.fmtMoney(potValue)}</span></div>`)}
                  ${td(`<button class="icon-btn" title="Edit harga" onclick="CatalogPage.editPrice('${p.id}')">${I.edit}</button>`, 'text-right')}
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterPriceList(q) {
    const ql = q.toLowerCase();
    document.querySelectorAll('.price-row').forEach(tr => {
      tr.style.display = !ql || tr.dataset.priceSearch.includes(ql) ? '' : 'none';
    });
  },

  editPrice(id) {
    const p = DB.find('products', id);
    if (!p) return;
    Modal.open({
      title: `Edit Harga — ${p.name}`, icon: '💰',
      body: `
        <div class="form-grid">
          <label class="field"><span>Harga Beli (Cost)</span><input id="pxCost" type="number" value="${p.cost}"></label>
          <label class="field"><span>Harga Jual</span><input id="pxPrice" type="number" value="${p.price}"></label>
        </div>
        <div id="pxPreview" style="padding:12px;background:rgba(99,102,241,.06);border-radius:8px;font-size:13px"></div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="CatalogPage.savePrice('${id}')">${I.check} Simpan Harga</button>`
    });
    const updatePreview = () => {
      const cost = +document.getElementById('pxCost').value || 0;
      const price = +document.getElementById('pxPrice').value || 0;
      const margin = cost > 0 ? Math.round(((price - cost) / cost) * 100) : 0;
      document.getElementById('pxPreview').innerHTML = `<strong>Margin: ${margin}%</strong> · Harga jual: ${DB.fmtMoney(price)} · Cost: ${DB.fmtMoney(cost)}`;
    };
    document.getElementById('pxCost').oninput = updatePreview;
    document.getElementById('pxPrice').oninput = updatePreview;
    updatePreview();
  },

  savePrice(id) {
    const cost = +document.getElementById('pxCost').value || 0;
    const price = +document.getElementById('pxPrice').value || 0;
    const p = DB.find('products', id);
    DB.update('products', id, { cost, price });
    DB.audit('update', 'product', id, `Update harga ${p.name}: cost ${DB.fmtMoney(cost)}, price ${DB.fmtMoney(price)}`, 'Admin');
    Toast.show(`Harga ${p.name} berhasil diperbarui`, 'success');
    Modal.close();
    this.priceList();
  },

  openBulkPriceModal() {
    Modal.open({
      title: 'Update Harga Massal', icon: '⚡',
      body: `
        <div class="alert info"><span class="alert-ic">⚡</span><div><strong>Update harga massal</strong><p>Terapkan kenaikan/penurunan harga ke semua produk sekaligus.</p></div></div>
        <div class="form-grid">
          <label class="field"><span>Tindakan</span>
            <select id="bulkAction"><option value="increase">Naikkan (%)</option><option value="decrease">Turunkan (%)</option><option value="set">Set Margin (%)</option></select>
          </label>
          <label class="field"><span>Nilai (%)</span><input id="bulkValue" type="number" value="10" placeholder="10"></label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="CatalogPage.applyBulkPrice()">${I.zap} Terapkan</button>`
    });
  },

  applyBulkPrice() {
    const action = document.getElementById('bulkAction').value;
    const value = +document.getElementById('bulkValue').value || 0;
    DB.get('products').forEach(p => {
      if (action === 'increase') {
        DB.update('products', p.id, { price: Math.round(p.price * (1 + value / 100)) });
      } else if (action === 'decrease') {
        DB.update('products', p.id, { price: Math.round(p.price * (1 - value / 100)) });
      } else {
        const newPrice = Math.round(p.cost * (1 + value / 100));
        DB.update('products', p.id, { price: newPrice });
      }
    });
    DB.audit('update', 'price', 'BULK', `Update harga massal (${action} ${value}%)`, 'Admin');
    Toast.show(`Harga ${DB.get('products').length} produk berhasil diperbarui`, 'success');
    Modal.close();
    this.priceList();
  },

  exportPriceList() {
    exportExcel('nexawms-price-list.xls', 'Price List',
      ['SKU', 'Nama Produk', 'Kategori', 'Brand', 'Harga Beli (Cost)', 'Harga Jual', 'Margin'],
      DB.get('products').map(p => {
        const margin = p.cost > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) + '%' : '0%';
        return [p.sku, p.name, DB.categoryName(p.categoryId), DB.brandName(p.brandId), p.cost, p.price, margin];
      })
    );
    DB.audit('export', 'price', 'ALL', 'Export price list (Excel)', 'Admin');
    Toast.show('Price list berhasil diexport (Excel)', 'success');
  },

  /* ================= SUPPLIERS ================= */
  suppliers() {
    const content = document.getElementById('pageContent');
    const suppliers = DB.get('suppliers');

    content.innerHTML = `
      ${App.pageHeader('🚚', 'Supplier', 'Kelola pemasok & vendor', `
        <button class="btn btn-primary" onclick="CatalogPage.openSupplierModal()">${I.plus} Tambah Supplier</button>
      `)}

      <div class="grid-2">
        ${suppliers.map(s => {
          const poCount = DB.get('purchases').filter(p => p.supplierId === s.id).length;
          const poValue = DB.get('purchases').filter(p => p.supplierId === s.id).reduce((sum, p) => sum + p.total, 0);
          return `
          <div class="card hoverable" style="margin:0">
            <div class="card-head" style="margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:12px">
                <div class="product-thumb" style="width:42px;height:42px;font-size:11px">${esc(s.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase())}</div>
                <div>
                  <h3 style="font-size:15px">${esc(s.name)}</h3>
                  <span style="font-size:11.5px;color:var(--text-3)">${esc(s.city)} · ${esc(s.paymentTerms)}</span>
                </div>
              </div>
              ${s.status === 'active' ? customBadge('success', 'Aktif') : customBadge('neutral', 'Nonaktif')}
            </div>
            <div class="grid-2" style="gap:8px;margin-bottom:12px">
              <div style="padding:10px;background:rgba(148,163,184,.05);border-radius:8px">
                <div style="font-size:11px;color:var(--text-3)">PO Total</div>
                <strong>${poCount}</strong>
              </div>
              <div style="padding:10px;background:rgba(148,163,184,.05);border-radius:8px">
                <div style="font-size:11px;color:var(--text-3)">Nilai PO</div>
                <strong class="money" style="font-size:13px">${DB.fmtMoney(poValue)}</strong>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:12px;color:var(--text-2)">
              <span>⭐ ${s.rating}</span><span>⏱ ${s.leadTime} hari</span><span>${esc(s.categories.join(', '))}</span>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" style="flex:1" onclick="CatalogPage.editSupplier('${s.id}')">${I.edit} Edit</button>
              <button class="icon-btn" title="Email" onclick="window.location.href='mailto:${esc(s.email)}'">${I.mail}</button>
              <button class="icon-btn" title="Telepon" onclick="Toast.show('${esc(s.phone)}','info')">${I.phone}</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  openSupplierModal(supplier) {
    const isEdit = !!supplier;
    Modal.open({
      title: isEdit ? 'Edit Supplier' : 'Tambah Supplier', icon: '🚚', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field full"><span>Nama Perusahaan</span><input id="supName" value="${supplier ? esc(supplier.name) : ''}" placeholder="cth: PT Teknologi Maju"></label>
          <label class="field"><span>Kontak Person</span><input id="supContact" value="${supplier ? esc(supplier.contact) : ''}"></label>
          <label class="field"><span>Email</span><input id="supEmail" type="email" value="${supplier ? esc(supplier.email) : ''}"></label>
          <label class="field"><span>Telepon</span><input id="supPhone" value="${supplier ? esc(supplier.phone) : ''}"></label>
          <label class="field"><span>Kota</span><input id="supCity" value="${supplier ? esc(supplier.city) : ''}"></label>
          <label class="field full"><span>Alamat</span><textarea id="supAddress" placeholder="Alamat lengkap...">${supplier ? esc(supplier.address) : ''}</textarea></label>
          <label class="field"><span>Termin Pembayaran</span>
            <select id="supTerms">
              ${['Net 7','Net 14','Net 30','Net 45','COD'].map(t => `<option ${supplier && supplier.paymentTerms === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Lead Time (hari)</span><input id="supLead" type="number" value="${supplier ? supplier.leadTime : 5}"></label>
          <label class="field"><span>Status</span>
            <select id="supStatus">
              <option value="active" ${supplier && supplier.status === 'active' ? 'selected' : ''}>Aktif</option>
              <option value="inactive" ${supplier && supplier.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
            </select>
          </label>
          <label class="field"><span>Rating</span><input id="supRating" type="number" min="1" max="5" step="0.1" value="${supplier ? supplier.rating : 4.5}"></label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="CatalogPage.saveSupplier(${isEdit ? `'${supplier.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editSupplier(id) {
    const s = DB.find('suppliers', id);
    if (s) this.openSupplierModal(s);
  },

  saveSupplier(existingId) {
    const name = document.getElementById('supName').value.trim();
    if (!name) { Toast.show('Nama supplier wajib diisi', 'error'); return; }
    const data = {
      name,
      contact: document.getElementById('supContact').value,
      email: document.getElementById('supEmail').value,
      phone: document.getElementById('supPhone').value,
      city: document.getElementById('supCity').value,
      address: document.getElementById('supAddress').value,
      paymentTerms: document.getElementById('supTerms').value,
      leadTime: +document.getElementById('supLead').value || 5,
      status: document.getElementById('supStatus').value,
      rating: +document.getElementById('supRating').value || 4.5
    };
    if (existingId) {
      DB.update('suppliers', existingId, data);
      DB.audit('update', 'supplier', existingId, `Update supplier ${name}`, 'Admin');
      Toast.show('Supplier berhasil diperbarui', 'success');
    } else {
      DB.add('suppliers', { id: DB.genId('SUP'), code: 'SUP', ...data, categories: [] });
      DB.audit('create', 'supplier', 'NEW', `Membuat supplier ${name}`, 'Admin');
      Toast.show(`Supplier "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.suppliers();
  },

  /* ================= CUSTOMERS ================= */
  customers() {
    const content = document.getElementById('pageContent');
    const customers = DB.get('customers');
    const totalOutstanding = customers.reduce((s, c) => s + c.outstanding, 0);
    const totalCredit = customers.reduce((s, c) => s + c.creditLimit, 0);

    content.innerHTML = `
      ${App.pageHeader('👥', 'Customer', 'Kelola pelanggan & piutang', `
        <button class="btn btn-primary" onclick="CatalogPage.openCustomerModal()">${I.plus} Tambah Customer</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.users}</div><span class="badge info dot">Total</span></div>
          <div class="kpi-label">Total Customer</div>
          <div class="kpi-value">${customers.length}</div>
          <div class="kpi-sub">${customers.filter(c => c.status === 'active').length} aktif</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.database}</div><span class="badge warning dot">Piutang</span></div>
          <div class="kpi-label">Total Piutang</div>
          <div class="kpi-value" style="font-size:20px">${DB.fmtMoney(totalOutstanding)}</div>
          <div class="kpi-sub">${Math.round((totalOutstanding / Math.max(1, totalCredit)) * 100)}% dari limit kredit</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.trend}</div><span class="badge success dot">Terbanyak</span></div>
          <div class="kpi-label">Customer Terbesar</div>
          <div class="kpi-value" style="font-size:17px">${esc(customers.sort((a,b) => b.creditLimit - a.creditLimit)[0]?.name || '-')}</div>
          <div class="kpi-sub">Limit ${DB.fmtMoney(customers[0]?.creditLimit || 0)}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><h3><span class="ch-ic">📋</span> Daftar Customer</h3><div class="ch-sub">Semua pelanggan</div></div></div>
        ${tableHTML(
          [
            { label: 'Customer' }, { label: 'Tipe' }, { label: 'Kontak' },
            { label: 'Kota' }, { label: 'Piutang', right: true }, { label: 'Limit', right: true },
            { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          customers.map(c => `
            <tr>
              ${td(`<div class="product-cell"><div class="product-thumb" style="font-size:11px">${esc(c.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase())}</div><div><div class="cell-main">${esc(c.name)}</div><div class="cell-sub">${esc(c.contact)}</div></div></div>`)}
              ${td(customBadge('accent', esc(c.type)))}
              ${td(`<span style="font-size:12px">${esc(c.email)}</span><div class="cell-sub">${esc(c.phone)}</div>`)}
              ${td(esc(c.city))}
              ${td(`<strong class="num" style="color:${c.outstanding > 0 ? 'var(--warning)' : 'var(--success)'}">${DB.fmtMoney(c.outstanding)}</strong>`, 'text-right')}
              ${td(DB.fmtMoney(c.creditLimit), 'text-right num')}
              ${td(c.status === 'active' ? customBadge('success', 'Aktif') : customBadge('neutral', 'Nonaktif'))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Edit" onclick="CatalogPage.editCustomer('${c.id}')">${I.edit}</button>
                <button class="icon-btn" title="Email" onclick="window.location.href='mailto:${esc(c.email)}'">${I.mail}</button>
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada customer'
        )}
      </div>
    `;
  },

  openCustomerModal(customer) {
    const isEdit = !!customer;
    Modal.open({
      title: isEdit ? 'Edit Customer' : 'Tambah Customer', icon: '👥', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field full"><span>Nama Perusahaan</span><input id="cusName" value="${customer ? esc(customer.name) : ''}" placeholder="cth: PT Retail Modern"></label>
          <label class="field"><span>Kontak Person</span><input id="cusContact" value="${customer ? esc(customer.contact) : ''}"></label>
          <label class="field"><span>Email</span><input id="cusEmail" type="email" value="${customer ? esc(customer.email) : ''}"></label>
          <label class="field"><span>Telepon</span><input id="cusPhone" value="${customer ? esc(customer.phone) : ''}"></label>
          <label class="field"><span>Kota</span><input id="cusCity" value="${customer ? esc(customer.city) : ''}"></label>
          <label class="field full"><span>Alamat</span><textarea id="cusAddress" placeholder="Alamat lengkap...">${customer ? esc(customer.address) : ''}</textarea></label>
          <label class="field"><span>Tipe</span>
            <select id="cusType">
              ${['Retail Chain','Toko','Marketplace','Koperasi','Hospitality','Distributor'].map(t => `<option ${customer && customer.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Limit Kredit</span><input id="cusLimit" type="number" value="${customer ? customer.creditLimit : 50000000}"></label>
          <label class="field"><span>Status</span>
            <select id="cusStatus">
              <option value="active" ${customer && customer.status === 'active' ? 'selected' : ''}>Aktif</option>
              <option value="inactive" ${customer && customer.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
            </select>
          </label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="CatalogPage.saveCustomer(${isEdit ? `'${customer.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editCustomer(id) {
    const c = DB.find('customers', id);
    if (c) this.openCustomerModal(c);
  },

  saveCustomer(existingId) {
    const name = document.getElementById('cusName').value.trim();
    if (!name) { Toast.show('Nama customer wajib diisi', 'error'); return; }
    const data = {
      name,
      contact: document.getElementById('cusContact').value,
      email: document.getElementById('cusEmail').value,
      phone: document.getElementById('cusPhone').value,
      city: document.getElementById('cusCity').value,
      address: document.getElementById('cusAddress').value,
      type: document.getElementById('cusType').value,
      creditLimit: +document.getElementById('cusLimit').value || 0,
      status: document.getElementById('cusStatus').value
    };
    if (existingId) {
      DB.update('customers', existingId, data);
      DB.audit('update', 'customer', existingId, `Update customer ${name}`, 'Admin');
      Toast.show('Customer berhasil diperbarui', 'success');
    } else {
      DB.add('customers', { id: DB.genId('CUS'), code: 'CUS', ...data, outstanding: 0 });
      DB.audit('create', 'customer', 'NEW', `Membuat customer ${name}`, 'Admin');
      Toast.show(`Customer "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.customers();
  }
};