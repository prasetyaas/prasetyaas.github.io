/* ============================================
   StockPilot — Catalog (Library Grid)
   ============================================ */

const CatalogPage = {
  _active: 'products',
  _view: 'grid',

  products() {
    this._active = 'products';
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    const low = DB.lowStock();

    content.innerHTML = `
      ${App.pageHeader('📚', 'Products', 'Katalog produk & stok', `
        <div class="view-toggle" style="display:flex;border:1px solid var(--border-strong);border-radius:10px;overflow:hidden">
          <button class="btn btn-sm ${this._view === 'grid' ? 'btn-primary' : 'btn-ghost'}" onclick="CatalogPage.toggleView('grid')">Grid</button>
          <button class="btn btn-sm ${this._view === 'list' ? 'btn-primary' : 'btn-ghost'}" onclick="CatalogPage.toggleView('list')">List</button>
        </div>
        <button class="btn btn-primary" onclick="CatalogPage.addProduct()">${I.plus} Produk</button>
      `)}
      <div class="section"><div class="section-head"><div class="section-title"><span class="st-ic">${I.box}</span><h3>${this._view === 'grid' ? 'Rak Produk' : 'Daftar Produk'}</h3><span class="count">${products.length}</span></div></div>
      ${this._view === 'grid' ? this._grid(products) : this._list(products)}
      </div>
    `;
  },

  toggleView(v) { this._view = v; this.products(); },

  _grid(products) {
    return `<div class="grid-4">${products.slice(0, 24).map(p => {
      const lvl = p.stock <= 0 ? 'out' : p.stock <= p.minStock ? 'low' : 'ok';
      const pct = p.maxStock ? Math.min(100, Math.round((p.stock / p.maxStock) * 100)) : 0;
      return `
        <div class="card card-hover product-card" onclick="CatalogPage.showProduct('${p.id}')">
          <div class="product-thumb ${lvl === 'ok' ? '' : lvl === 'low' ? 'amber' : ''}">${esc(p.name.split(' ')[0][0])}${esc(p.name.split(' ')[1]?p.name.split(' ')[1][0]:'')}</div>
          <div style="font-weight:600;font-size:12.5px">${esc(p.name)}</div>
          <div style="font-size:10.5px;color:var(--text-3)">${esc(p.sku)} · RAK ${esc(p.location)}</div>
          <div class="stockbar"><div class="${lvl}" style="width:${Math.max(pct,4)}%"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:11px"><span>Stok <strong>${p.stock}</strong></span><span class="badge ${lvl === 'ok' ? 'success' : lvl === 'low' ? 'warning' : 'danger'}">${lvl === 'ok' ? 'Aman' : lvl === 'low' ? 'Menipis' : 'Habis'}</span></div>
        </div>`;
    }).join('')}</div>`;
  },

  _list(products) {
    return `<div class="card"><div class="table-wrap"><table>
      <thead><tr><th>Produk</th><th>SKU</th><th>Kategori</th><th>Rak</th><th>Stok</th><th>Harga</th><th>Status</th></tr></thead>
      <tbody>${products.slice(0, 30).map(p => `
        <tr onclick="CatalogPage.showProduct('${p.id}')" style="cursor:pointer">
          <td><span class="td-main">${esc(p.name)}</span></td>
          <td><span class="td-sub">${esc(p.sku)}</span></td>
          <td>${esc(p.category)}</td>
          <td><span class="chip">${esc(p.location)}</span></td>
          <td><strong>${p.stock}</strong></td>
          <td class="text-right">${DB.fmtMoney(p.price)}</td>
          <td>${statusBadge(p.stock <= 0 ? 'habis' : p.stock <= p.minStock ? 'menipis' : 'aman')}</td>
        </tr>`).join('')}
      </tbody></table></div></div>`;
  },

  showProduct(id) {
    const p = DB.product(id);
    if (!p) return;
    SlideOver.open({
      title: p.name, icon: '📦',
      body: `
        <div class="cp-section" style="margin-bottom:16px">
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
            <div class="product-thumb" style="width:52px;height:52px;font-size:18px">${esc(p.name.split(' ')[0][0])}</div>
            <div><div style="font-weight:700;font-size:15px">${esc(p.name)}</div><div style="font-size:11px;color:var(--text-3)">${esc(p.sku)}</div></div>
          </div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Kategori</span><strong>${esc(p.category)}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Brand</span><strong>${esc(p.brand)}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Lokasi Rak</span><strong>${esc(p.location)}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Stok</span><strong>${p.stock} ${esc(p.unit)}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Min / Max</span><strong>${p.minStock} / ${p.maxStock}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Harga Beli</span><strong>${DB.fmtMoney(p.cost)}</strong></div>
          <div class="cp-row" style="display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px"><span style="color:var(--text-3)">Harga Jual</span><strong>${DB.fmtMoney(p.price)}</strong></div>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="InventoryPage.stockInForm('${p.id}')">${I.plus} Stok Masuk</button>
        <button class="btn btn-primary" onclick="SlideOver.close()">Tutup</button>`
    });
  },

  addProduct() {
    const cats = DB.get('categories');
    const brands = DB.get('brands');
    const units = DB.get('units');
    Modal.open({
      title: 'Tambah Produk', icon: '📦',
      body: `
        <div class="form-grid">
          <label class="field full"><span>Nama Produk</span><input id="pName" class="input" placeholder="Nama produk"></label>
          <label class="field"><span>Kategori</span><select id="pCat" class="input">${cats.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>
          <label class="field"><span>Brand</span><select id="pBrand" class="input">${brands.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('')}</select></label>
          <label class="field"><span>Unit</span><select id="pUnit" class="input">${units.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select></label>
          <label class="field"><span>Lokasi Rak</span><input id="pLoc" class="input" placeholder="A1"></label>
          <label class="field"><span>Harga Beli</span><input id="pCost" class="input" type="number" placeholder="100000"></label>
          <label class="field"><span>Harga Jual</span><input id="pPrice" class="input" type="number" placeholder="150000"></label>
          <label class="field"><span>Stok Awal</span><input id="pStock" class="input" type="number" value="0"></label>
          <label class="field"><span>Min Stok</span><input id="pMin" class="input" type="number" value="5"></label>
          <label class="field"><span>Max Stok</span><input id="pMax" class="input" type="number" value="50"></label>
        </div>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" id="pSave">Simpan</button>`
    });
    document.getElementById('pSave').onclick = () => {
      const name = document.getElementById('pName').value.trim();
      if (!name) { Toast.show('Nama produk wajib', 'warning'); return; }
      const cat = DB.category(document.getElementById('pCat').value);
      const brand = DB.brand(document.getElementById('pBrand').value);
      const unit = DB.unit(document.getElementById('pUnit').value);
      const id = 'PRD-' + String(DB.get('products').length + 1).padStart(3, '0');
      DB.add('products', {
        id, sku: 'SKU-' + (1000 + DB.get('products').length),
        name, categoryId: cat.id, category: cat.name, brandId: brand.id, brand: brand.name,
        unitId: unit.id, unit: unit.name,
        location: document.getElementById('pLoc').value || 'A1',
        stock: parseInt(document.getElementById('pStock').value) || 0,
        minStock: parseInt(document.getElementById('pMin').value) || 5,
        maxStock: parseInt(document.getElementById('pMax').value) || 50,
        cost: parseInt(document.getElementById('pCost').value) || 0,
        price: parseInt(document.getElementById('pPrice').value) || 0,
        status: 'active'
      });
      DB.log('create', 'product', id, `Menambahkan produk ${name}`);
      Modal.close(); Toast.show('Produk ditambahkan', 'success');
      this.products();
    };
  },

  categories() {
    this._active = 'categories';
    const content = document.getElementById('pageContent');
    const cats = DB.get('categories');
    content.innerHTML = `
      ${App.pageHeader('🏷️', 'Categories', 'Kategori produk', '')}
      <div class="grid-4">${cats.map(c => `
        <div class="card card-hover card-pad">
          <div style="font-weight:700;font-size:13px">${esc(c.name)}</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:4px">${c.productCount} produk</div>
        </div>`).join('')}</div>
    `;
  },

  brands() {
    this._active = 'brands';
    const content = document.getElementById('pageContent');
    const brands = DB.get('brands');
    content.innerHTML = `
      ${App.pageHeader('🏅', 'Brands', 'Merek produk', '')}
      <div class="grid-4">${brands.map(b => `
        <div class="card card-hover card-pad">
          <div style="font-weight:700;font-size:13px">${esc(b.name)}</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:4px">${esc(b.origin)}</div>
        </div>`).join('')}</div>
    `;
  },

  units() {
    this._active = 'units';
    const content = document.getElementById('pageContent');
    const units = DB.get('units');
    content.innerHTML = `
      ${App.pageHeader('📏', 'Units', 'Satuan produk', '')}
      <div class="grid-4">${units.map(u => `
        <div class="card card-hover card-pad">
          <div style="font-weight:700;font-size:13px">${esc(u.name)}</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:4px">${esc(u.symbol)}</div>
        </div>`).join('')}</div>
    `;
  },

  suppliers() {
    this._active = 'suppliers';
    const content = document.getElementById('pageContent');
    const suppliers = DB.get('suppliers');
    content.innerHTML = `
      ${App.pageHeader('🏭', 'Suppliers', 'Pemasok barang', '')}
      <div class="card"><div class="table-wrap"><table>
        <thead><tr><th>Nama</th><th>Kota</th><th>Kontak</th><th>Telepon</th><th>Status</th></tr></thead>
        <tbody>${suppliers.map(s => `
          <tr><td><span class="td-main">${esc(s.name)}</span></td><td>${esc(s.city)}</td><td>${esc(s.contact)}</td><td>${esc(s.phone)}</td><td>${statusBadge(s.status)}</td></tr>`).join('')}
        </tbody></table></div></div>
    `;
  },

  customers() {
    this._active = 'customers';
    const content = document.getElementById('pageContent');
    const customers = DB.get('customers');
    content.innerHTML = `
      ${App.pageHeader('👥', 'Customers', 'Pelanggan', '')}
      <div class="card"><div class="table-wrap"><table>
        <thead><tr><th>Nama</th><th>Kota</th><th>Telepon</th><th>Status</th></tr></thead>
        <tbody>${customers.map(c => `
          <tr><td><span class="td-main">${esc(c.name)}</span></td><td>${esc(c.city)}</td><td>${esc(c.phone)}</td><td>${statusBadge(c.status)}</td></tr>`).join('')}
        </tbody></table></div></div>
    `;
  }
};