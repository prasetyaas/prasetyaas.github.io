/* ============================================
   NexaWMS Pro — Warehouse Pages
   Warehouse · Location · Rack · Zone · Capacity · Stock Map
   ============================================ */

const WarehousePage = {

  /* ================= WAREHOUSES ================= */
  warehouses() {
    const content = document.getElementById('pageContent');
    const warehouses = DB.get('warehouses');

    content.innerHTML = `
      ${App.pageHeader('🏢', 'Warehouse', 'Kelola gudang dan fasilitas penyimpanan', `
        <button class="btn btn-primary" onclick="WarehousePage.openWarehouseModal()">${I.plus} Tambah Gudang</button>
      `)}

      <div class="grid-3">
        ${warehouses.map(w => {
          const pct = Math.round((w.used / w.capacity) * 100);
          const color = pct >= 85 ? 'var(--danger)' : pct >= 60 ? 'var(--warning)' : 'var(--success)';
          const zonesCount = DB.get('zones').filter(z => z.warehouseId === w.id).length;
          return `
          <div class="card hoverable" style="margin:0">
            <div class="card-head" style="margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:12px">
                <div class="kpi-ic indigo" style="font-size:18px">🏢</div>
                <div>
                  <h3 style="font-size:15px">${esc(w.name)}</h3>
                  <span style="font-size:11px;color:var(--text-3)">${esc(w.code)} · ${esc(w.type)}</span>
                </div>
              </div>
              ${w.status === 'active' ? customBadge('success', 'Aktif') : customBadge('neutral', 'Nonaktif')}
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;color:var(--text-2)">
              <span>📍 ${esc(w.city)}</span><span>· ${esc(w.capacity)} m²</span>
            </div>
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-3);margin-bottom:5px">
                <span>Utilisasi Kapasitas</span><strong style="color:${color}">${pct}%</strong>
              </div>
              <div class="progress"><div class="progress-bar" style="width:${pct}%;background:${color}"></div></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <span class="badge info dot">${zonesCount} zona</span>
              <span style="font-size:11px;color:var(--text-3)">👤 ${esc(w.manager)}</span>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" style="flex:1" onclick="WarehousePage.editWarehouse('${w.id}')">${I.edit} Edit</button>
              <button class="btn btn-outline btn-sm" onclick="WarehousePage.viewWarehouse('${w.id}')">${I.eye} Detail</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  openWarehouseModal(w) {
    const isEdit = !!w;
    Modal.open({
      title: isEdit ? 'Edit Gudang' : 'Tambah Gudang', icon: '🏢', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field"><span>Nama Gudang</span><input id="whName" value="${w ? esc(w.name) : ''}" placeholder="cth: Gudang Pusat"></label>
          <label class="field"><span>Kode</span><input id="whCode" value="${w ? esc(w.code) : ''}" placeholder="WH-01"></label>
          <label class="field"><span>Kota</span><input id="whCity" value="${w ? esc(w.city) : ''}" placeholder="Cikarang"></label>
          <label class="field"><span>Tipe</span>
            <select id="whType">
              ${['Distribution Center','Transit Hub','Regional DC','Cross-dock','Cold Storage'].map(t => `<option ${w && w.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </label>
          <label class="field full"><span>Alamat</span><textarea id="whAddress" placeholder="Alamat lengkap...">${w ? esc(w.address) : ''}</textarea></label>
          <label class="field"><span>Luas Area (m²)</span><input id="whArea" type="number" value="${w ? w.area : 5000}"></label>
          <label class="field"><span>Kapasitas (m²)</span><input id="whCapacity" type="number" value="${w ? w.capacity : 2000}"></label>
          <label class="field"><span>Suhu</span><input id="whTemp" value="${w ? esc(w.temperature) : 'Ambient 25°C'}"></label>
          <label class="field"><span>Manager</span>
            <select id="whManager">
              ${DB.get('users').filter(u => u.status === 'active').map(u => `<option ${w && w.manager === u.name ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}
            </select>
          </label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="WarehousePage.saveWarehouse(${isEdit ? `'${w.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editWarehouse(id) {
    const w = DB.find('warehouses', id);
    if (w) this.openWarehouseModal(w);
  },

  saveWarehouse(existingId) {
    const name = document.getElementById('whName').value.trim();
    if (!name) { Toast.show('Nama gudang wajib diisi', 'error'); return; }
    const data = {
      name,
      code: document.getElementById('whCode').value || 'WH-NEW',
      city: document.getElementById('whCity').value,
      type: document.getElementById('whType').value,
      address: document.getElementById('whAddress').value,
      area: +document.getElementById('whArea').value || 5000,
      capacity: +document.getElementById('whCapacity').value || 2000,
      temperature: document.getElementById('whTemp').value,
      manager: document.getElementById('whManager').value,
      status: 'active'
    };
    if (existingId) {
      DB.update('warehouses', existingId, data);
      Toast.show('Gudang berhasil diperbarui', 'success');
    } else {
      DB.add('warehouses', { id: DB.genId('WH'), ...data, used: 0, phone: '-', zoning: [] });
      Toast.show(`Gudang "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.warehouses();
  },

  viewWarehouse(id) {
    const w = DB.find('warehouses', id);
    if (!w) return;
    const zones = DB.get('zones').filter(z => z.warehouseId === id);
    const locations = DB.get('locations').filter(l => l.warehouseId === id);
    const pct = Math.round((w.used / w.capacity) * 100);
    Modal.open({
      title: `Detail — ${w.name}`, icon: '🏢', size: 'lg',
      body: `
        <div class="form-grid" style="margin-bottom:16px">
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">KODE</div><strong>${esc(w.code)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">TIPE</div><strong>${esc(w.type)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">MANAGER</div><strong>${esc(w.manager)}</strong></div>
          <div><div class="ch-sub" style="font-size:11px;color:var(--text-3)">SUHU</div><strong>${esc(w.temperature)}</strong></div>
        </div>
        <div style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-2);margin-bottom:6px">
            <span>Utilitas ${w.used} / ${w.capacity} m²</span>
            <strong style="color:${pct >= 85 ? 'var(--danger)' : 'var(--success)'}">${pct}%</strong>
          </div>
          <div class="progress" style="height:8px"><div class="progress-bar" style="width:${pct}%"></div></div>
        </div>
        <h4 style="font-size:12px;font-weight:700;color:var(--primary-3);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Zones (${zones.length})</h4>
        <div class="grid-2" style="gap:8px;margin-bottom:16px">
          ${zones.map(z => `
            <div style="padding:10px;background:rgba(148,163,184,.05);border-radius:8px;display:flex;justify-content:space-between">
              <span style="font-size:12.5px"><strong>${esc(z.name)}</strong></span>
              <span style="font-size:11px;color:var(--text-3)">${Math.round((z.used / z.capacity) * 100)}%</span>
            </div>`).join('')}
        </div>
        <h4 style="font-size:12px;font-weight:700;color:var(--primary-3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Lokasi (${locations.length})</h4>
        <p style="color:var(--text-3);font-size:12.5px">${locations.map(l => `<span class="scan-badge" style="margin-right:4px">${esc(l.code)}</span>`).join('')}</p>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`
    });
  },

  /* ================= LOCATIONS ================= */
  locations() {
    const content = document.getElementById('pageContent');
    const locations = DB.get('locations');

    content.innerHTML = `
      ${App.pageHeader('📍', 'Location', 'Kelola lokasi penyimpanan di gudang', `
        <button class="btn btn-primary" onclick="WarehousePage.openLocationModal()">${I.plus} Tambah Lokasi</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.mapPin}</div><span class="badge info dot">Total</span></div>
          <div class="kpi-label">Total Lokasi</div>
          <div class="kpi-value">${locations.length}</div>
          <div class="kpi-sub">${DB.get('warehouses').length} gudang</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">Aktif</span></div>
          <div class="kpi-label">Lokasi Aktif</div>
          <div class="kpi-value">${locations.filter(l => l.status === 'active').length}</div>
          <div class="kpi-sub">${locations.filter(l => l.status !== 'active').length} nonaktif</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.box}</div><span class="badge accent dot">Utilisasi</span></div>
          <div class="kpi-label">Rata-rata Utilisasi</div>
          <div class="kpi-value">${Math.round((locations.reduce((s,l) => s + (l.used / l.capacity), 0) / locations.length) * 100)}%</div>
          <div class="kpi-sub">Tingkat kepadatan</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📋</span> Daftar Lokasi</h3><div class="ch-sub">Semua bin/slot penyimpanan</div></div>
          <select style="width:auto" onchange="WarehousePage.filterLocations(this.value)">
            <option value="all">Semua Warehouse</option>
            ${DB.get('warehouses').map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}
          </select>
        </div>
        ${tableHTML(
          [
            { label: 'Kode' }, { label: 'Warehouse' }, { label: 'Zone' },
            { label: 'Tipe' }, { label: 'Kapasitas', right: true }, { label: 'Terpakai', right: true },
            { label: 'Utilisasi' }, { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          locations.map(l => {
            const pct = Math.round((l.used / l.capacity) * 100);
            const color = pct >= 90 ? 'var(--danger)' : pct >= 60 ? 'var(--warning)' : 'var(--success)';
            return `<tr class="loc-row" data-loc-wh="${l.warehouseId}">
              ${td(`<span class="scan-badge">${esc(l.code)}</span>`)}
              ${td(esc(DB.warehouseName(l.warehouseId)))}
              ${td(esc(DB.zone(l.zoneId)?.name || '-'))}
              ${td(customBadge('neutral', l.type.charAt(0).toUpperCase() + l.type.slice(1)))}
              ${td(l.capacity, 'text-right num')}
              ${td(l.used, 'text-right num')}
              ${td(`<div class="stock-bar"><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="bar-val">${pct}%</span></div>`)}
              ${td(l.status === 'active' ? customBadge('success', 'Aktif') : customBadge('neutral', 'Nonaktif'))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Edit" onclick="WarehousePage.editLocation('${l.id}')">${I.edit}</button>
              </div>`, 'text-right')}
            </tr>`;
          }).join(''),
          'Belum ada lokasi'
        )}
      </div>
    `;
  },

  filterLocations(wh) {
    document.querySelectorAll('.loc-row').forEach(tr => {
      tr.style.display = (wh === 'all' || tr.dataset.locWh === wh) ? '' : 'none';
    });
  },

  openLocationModal(loc) {
    const isEdit = !!loc;
    Modal.open({
      title: isEdit ? 'Edit Lokasi' : 'Tambah Lokasi', icon: '📍',
      body: `
        <div class="form-grid">
          <label class="field"><span>Kode Lokasi</span><input id="locCode" value="${loc ? esc(loc.code) : ''}" placeholder="cth: A-08"></label>
          <label class="field"><span>Warehouse</span>
            <select id="locWh" onchange="WarehousePage.loadLocZones()">
              ${DB.get('warehouses').map(w => `<option value="${w.id}" ${loc && loc.warehouseId === w.id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Zone</span>
            <select id="locZone"></select>
          </label>
          <label class="field"><span>Tipe</span>
            <select id="locType">
              ${['rack','pallet','bulk','bin','shelf'].map(t => `<option value="${t}" ${loc && loc.type === t ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Kapasitas</span><input id="locCap" type="number" value="${loc ? loc.capacity : 100}"></label>
          <label class="field"><span>Terpakai</span><input id="locUsed" type="number" value="${loc ? loc.used : 0}"></label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="WarehousePage.saveLocation(${isEdit ? `'${loc.id}'` : 'null'})">${I.check} Simpan</button>`
    });
    this.loadLocZones(loc);
  },

  loadLocZones(loc) {
    const sel = document.getElementById('locZone');
    if (!sel) return;
    const wh = document.getElementById('locWh').value;
    const zones = DB.get('zones').filter(z => z.warehouseId === wh);
    sel.innerHTML = zones.map(z => `<option value="${z.id}" ${loc && loc.zoneId === z.id ? 'selected' : ''}>${esc(z.name)}</option>`).join('');
  },

  editLocation(id) {
    const l = DB.find('locations', id);
    if (l) this.openLocationModal(l);
  },

  saveLocation(existingId) {
    const code = document.getElementById('locCode').value.trim();
    if (!code) { Toast.show('Kode lokasi wajib diisi', 'error'); return; }
    const data = {
      code,
      warehouseId: document.getElementById('locWh').value,
      zoneId: document.getElementById('locZone').value,
      type: document.getElementById('locType').value,
      capacity: +document.getElementById('locCap').value || 100,
      used: +document.getElementById('locUsed').value || 0,
      status: 'active'
    };
    if (existingId) {
      DB.update('locations', existingId, data);
      Toast.show('Lokasi berhasil diperbarui', 'success');
    } else {
      DB.add('locations', { id: DB.genId('LOC'), ...data });
      Toast.show(`Lokasi "${code}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.locations();
  },

  /* ================= RACKS ================= */
  racks() {
    const content = document.getElementById('pageContent');
    const racks = DB.get('racks');

    content.innerHTML = `
      ${App.pageHeader('🗄️', 'Rack', 'Kelola rack penyimpanan', `
        <button class="btn btn-primary" onclick="WarehousePage.openRackModal()">${I.plus} Tambah Rack</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.grid}</div><span class="badge info dot">Total</span></div>
          <div class="kpi-label">Total Rack</div>
          <div class="kpi-value">${racks.length}</div>
          <div class="kpi-sub">Tersebar di semua lokasi</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">Aktif</span></div>
          <div class="kpi-label">Rack Aktif</div>
          <div class="kpi-value">${racks.filter(r => r.status === 'active').length}</div>
          <div class="kpi-sub">${racks.filter(r => r.status !== 'active').length} penuh/nonaktif</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.box}</div><span class="badge accent dot">Tipe</span></div>
          <div class="kpi-label">Tipe Dominan</div>
          <div class="kpi-value" style="font-size:17px">Selective</div>
          <div class="kpi-sub">${racks.filter(r => r.type === 'selective').length} rack</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><h3><span class="ch-ic">🗄️</span> Daftar Rack</h3><div class="ch-sub">Semua rack di semua lokasi</div></div></div>
        ${tableHTML(
          [
            { label: 'Kode Rack' }, { label: 'Lokasi' }, { label: 'Level' },
            { label: 'Tipe' }, { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          racks.map(r => `
            <tr>
              ${td(`<span class="scan-badge">${esc(r.code)}</span>`)}
              ${td(esc(DB.location(r.locationId)?.code || '-'))}
              ${td('L' + r.level, 'text-center')}
              ${td(customBadge('neutral', r.type.charAt(0).toUpperCase() + r.type.slice(1)))}
              ${td(statusBadge(r.status === 'full' ? 'full' : r.status, { active: ['success','Aktif'], full: ['warning','Penuh'], inactive: ['neutral','Nonaktif'] }))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Edit" onclick="WarehousePage.editRack('${r.id}')">${I.edit}</button>
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada rack'
        )}
      </div>
    `;
  },

  openRackModal(rack) {
    const isEdit = !!rack;
    Modal.open({
      title: isEdit ? 'Edit Rack' : 'Tambah Rack', icon: '🗄️',
      body: `
        <div class="form-grid">
          <label class="field"><span>Kode Rack</span><input id="rackCode" value="${rack ? esc(rack.code) : ''}" placeholder="cth: A1-02"></label>
          <label class="field"><span>Lokasi</span>
            <select id="rackLoc">${DB.get('locations').map(l => `<option value="${l.id}" ${rack && rack.locationId === l.id ? 'selected' : ''}>${esc(l.code)}</option>`).join('')}</select>
          </label>
          <label class="field"><span>Level</span><input id="rackLevel" type="number" min="1" value="${rack ? rack.level : 1}"></label>
          <label class="field"><span>Tipe</span>
            <select id="rackType">
              ${['selective','drive-in','bulk','pallet','pallet rack'].map(t => `<option ${rack && rack.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="WarehousePage.saveRack(${isEdit ? `'${rack.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editRack(id) {
    const r = DB.find('racks', id);
    if (r) this.openRackModal(r);
  },

  saveRack(existingId) {
    const code = document.getElementById('rackCode').value.trim();
    if (!code) { Toast.show('Kode rack wajib diisi', 'error'); return; }
    const data = {
      code,
      locationId: document.getElementById('rackLoc').value,
      level: +document.getElementById('rackLevel').value || 1,
      type: document.getElementById('rackType').value,
      status: 'active'
    };
    if (existingId) {
      DB.update('racks', existingId, data);
      Toast.show('Rack berhasil diperbarui', 'success');
    } else {
      DB.add('racks', { id: DB.genId('RCK'), ...data });
      Toast.show(`Rack "${code}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.racks();
  },

  /* ================= ZONES ================= */
  zones() {
    const content = document.getElementById('pageContent');
    const zones = DB.get('zones');

    content.innerHTML = `
      ${App.pageHeader('🔲', 'Zone', 'Kelola zona penyimpanan dalam gudang', `
        <button class="btn btn-primary" onclick="WarehousePage.openZoneModal()">${I.plus} Tambah Zone</button>
      `)}

      <div class="grid-3">
        ${zones.map(z => {
          const pct = Math.round((z.used / z.capacity) * 100);
          const color = pct >= 85 ? 'var(--danger)' : pct >= 60 ? 'var(--warning)' : 'var(--success)';
          const productCount = DB.get('products').filter(p => {
            const loc = DB.location(p.locationId);
            return loc && loc.zoneId === z.id;
          }).length;
          return `
          <div class="card hoverable" style="margin:0">
            <div class="card-head" style="margin-bottom:8px">
              <h3 style="font-size:14px"><span class="ch-ic">🔲</span> ${esc(z.name)}</h3>
              <span class="badge neutral dot">${esc(z.code)}</span>
            </div>
            <p style="color:var(--text-3);font-size:11.5px;margin-bottom:12px">${esc(DB.warehouseName(z.warehouseId))} · ${z.type.charAt(0).toUpperCase() + z.type.slice(1)}</p>
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-3);margin-bottom:5px">
                <span>Utilisasi ${z.used} / ${z.capacity}</span><strong style="color:${color}">${pct}%</strong>
              </div>
              <div class="progress"><div class="progress-bar" style="width:${pct}%;background:${color}"></div></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <span class="badge ${pct >= 85 ? 'danger' : pct >= 60 ? 'warning' : 'success'} dot">${productCount} produk</span>
              <span style="font-size:11px;color:var(--text-3)">${DB.get('locations').filter(l => l.zoneId === z.id).length} lokasi</span>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" style="flex:1" onclick="WarehousePage.editZone('${z.id}')">${I.edit} Edit</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  openZoneModal(zone) {
    const isEdit = !!zone;
    Modal.open({
      title: isEdit ? 'Edit Zone' : 'Tambah Zone', icon: '🔲',
      body: `
        <div class="form-grid">
          <label class="field"><span>Nama Zone</span><input id="zoneName" value="${zone ? esc(zone.name) : ''}" placeholder="cth: Zone G — Cold Storage"></label>
          <label class="field"><span>Kode</span><input id="zoneCode" value="${zone ? esc(zone.code) : ''}" placeholder="G"></label>
          <label class="field"><span>Warehouse</span>
            <select id="zoneWh">${DB.get('warehouses').map(w => `<option value="${w.id}" ${zone && zone.warehouseId === w.id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}</select>
          </label>
          <label class="field"><span>Tipe</span>
            <select id="zoneType">
              ${['storage','transit','staging','return','cold'].map(t => `<option value="${t}" ${zone && zone.type === t ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Kapasitas</span><input id="zoneCap" type="number" value="${zone ? zone.capacity : 500}"></label>
          <label class="field"><span>Terpakai</span><input id="zoneUsed" type="number" value="${zone ? zone.used : 0}"></label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="WarehousePage.saveZone(${isEdit ? `'${zone.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editZone(id) {
    const z = DB.find('zones', id);
    if (z) this.openZoneModal(z);
  },

  saveZone(existingId) {
    const name = document.getElementById('zoneName').value.trim();
    if (!name) { Toast.show('Nama zone wajib diisi', 'error'); return; }
    const data = {
      name,
      code: document.getElementById('zoneCode').value || 'Z',
      warehouseId: document.getElementById('zoneWh').value,
      type: document.getElementById('zoneType').value,
      capacity: +document.getElementById('zoneCap').value || 500,
      used: +document.getElementById('zoneUsed').value || 0
    };
    if (existingId) {
      DB.update('zones', existingId, data);
      Toast.show('Zone berhasil diperbarui', 'success');
    } else {
      DB.add('zones', { id: DB.genId('ZNE'), ...data });
      Toast.show(`Zone "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.zones();
  },

  /* ================= CAPACITY ================= */
  capacity() {
    const content = document.getElementById('pageContent');
    const warehouses = DB.get('warehouses');
    const zones = DB.get('zones');

    content.innerHTML = `
      ${App.pageHeader('📊', 'Capacity', 'Monitoring kapasitas & utilisasi gudang', `
        <button class="btn btn-ghost" onclick="WarehousePage.exportCapacity()">${I.download} Export</button>
      `)}

      <div class="grid-3">
        ${warehouses.map(w => {
          const pct = Math.round((w.used / w.capacity) * 100);
          const color = pct >= 85 ? 'var(--danger)' : pct >= 60 ? 'var(--warning)' : 'var(--success)';
          const whZones = zones.filter(z => z.warehouseId === w.id);
          return `
          <div class="card" style="margin:0">
            <div class="card-head" style="margin-bottom:14px">
              <h3 style="font-size:15px">🏢 ${esc(w.name)}</h3>
              <span class="badge" style="color:${color};background:${color}22">${pct}%</span>
            </div>
            <div class="progress" style="height:10px;margin-bottom:8px">
              <div class="progress-bar" style="width:${pct}%;background:${color}"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-3);margin-bottom:16px">
              <span>${DB.fmtNum(w.used)} m² / ${DB.fmtNum(w.capacity)} m²</span>
              <span>${DB.fmtNum(w.capacity - w.used)} m² tersedia</span>
            </div>
            <h4 style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Zona Detail</h4>
            <div class="stat-list" style="gap:10px">
              ${whZones.map(z => {
                const zp = Math.round((z.used / z.capacity) * 100);
                return `<div class="stat-item">
                  <div class="si-ic" style="width:30px;height:30px;font-size:12px">${esc(z.code)}</div>
                  <div class="si-info" style="display:flex;align-items:center;gap:10px">
                    <div style="font-size:12px;color:var(--text-2);min-width:90px">${esc(z.type)}
                    </div>
                    <div class="stock-bar" style="flex:1"><div class="bar-track"><div class="bar-fill" style="width:${zp}%;background:${zp >= 85 ? 'var(--danger)' : zp >= 60 ? 'var(--warning)' : 'var(--success)'}"></div></div></div>
                  </div>
                  <span style="font-size:11px;color:var(--text-3);width:34px;text-align:right">${zp}%</span>
                </div>`;
              }).join('')}
              ${whZones.length === 0 ? '<div class="empty-state" style="padding:15px"><p style="font-size:12px">Tidak ada zona</p></div>' : ''}
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="card" style="margin-top:20px">
        <div class="card-head">
          <div><h3><span class="ch-ic">📈</span> Tren Utilisasi Gudang</h3><div class="ch-sub">Kepadatan storage — 6 bulan terakhir</div></div>
        </div>
        <div class="chart-box"><canvas id="capTrendChart"></canvas></div>
      </div>
    `;

    setTimeout(() => {
      const labels = monthLabels(6);
      const w1 = randWalk(62, 6);
      const w2 = randWalk(48, 6);
      const w3 = randWalk(35, 6);
      const warehouses = DB.get('warehouses');
      makeChart('capTrendChart', {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: warehouses[0]?.name || 'WH-CTG', data: w1, borderColor: '#6366f1', backgroundColor: 'transparent', tension: .4, borderWidth: 2.5 },
            { label: warehouses[1]?.name || 'WH-JKT', data: w2, borderColor: '#22d3ee', backgroundColor: 'transparent', tension: .4, borderWidth: 2.5 },
            { label: warehouses[2]?.name || 'WH-SBY', data: w3, borderColor: '#10b981', backgroundColor: 'transparent', tension: .4, borderWidth: 2.5 }
          ]
        },
        options: {
          scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } }
        }
      });
    }, 80);
  },

  exportCapacity() {
    exportExcel('nexawms-capacity.xls', 'Capacity',
      ['Nama Gudang', 'Kode', 'Kapasitas (m²)', 'Terpakai (m²)', 'Utilisasi'],
      DB.get('warehouses').map(w => [
        w.name, w.code, w.capacity, w.used,
        w.capacity > 0 ? Math.round((w.used / w.capacity) * 100) + '%' : '0%'
      ])
    );
    DB.audit('export', 'capacity', 'ALL', 'Export data kapasitas (Excel)', 'Admin');
    Toast.show('Data kapasitas berhasil diexport (Excel)', 'success');
  },

  /* ================= STOCK MAP ================= */
  stockMap() {
    const content = document.getElementById('pageContent');
    const warehouses = DB.get('warehouses');

    content.innerHTML = `
      ${App.pageHeader('🗺️', 'Stock Map', 'Visualisasi heatmap tata letak stok di gudang', `
        <select id="smWarehouse" style="width:auto" onchange="WarehousePage.renderStockMap()">
          ${warehouses.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}
        </select>
      `)}

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">🗺️</span> Peta Kepadatan Stok</h3><div class="ch-sub">Hover setiap sel untuk detail · warna = tingkat kepadatan</div></div>
        </div>
        <div id="smMapContainer"></div>
        <div class="hm-legend">
          <span><i style="background:rgba(148,163,184,.12)"></i> Kosong</span>
          <span><i style="background:rgba(16,185,129,.6)"></i> Rendah (<30%)</span>
          <span><i style="background:rgba(245,158,11,.65)"></i> Sedang (30-70%)</span>
          <span><i style="background:rgba(239,68,68,.7)"></i> Tinggi (70-90%)</span>
          <span><i style="background:#dc2626"></i> Penuh (90%+)</span>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">📊</span> Distribusi Kepadatan</h3><div class="ch-sub">Per zone</div></div></div>
          <div class="chart-box sm"><canvas id="smChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">📋</span> Zona Terpadat</h3><div class="ch-sub">Perlu perhatian</div></div></div>
          <div id="smBusyList"></div>
        </div>
      </div>
    `;

    this.renderStockMap();
  },

  renderStockMap() {
    const selector = document.getElementById('smWarehouse');
    const whId = selector ? selector.value : DB.get('warehouses')[0].id;
    const container = document.getElementById('smMapContainer');
    if (!container) return;

    const zones = DB.get('zones').filter(z => z.warehouseId === whId);
    const locations = DB.get('locations').filter(l => l.warehouseId === whId);

    let html = '<div class="heatmap">';
    zones.forEach((zone, zi) => {
      html += `<div class="hm-zone-label ${zi === 0 ? '' : ''}">${esc(zone.code)} — ${esc(zone.name)}</div>`;
      const zoneLocs = locations.filter(l => l.zoneId === zone.id);
      const cells = zoneLocs.length ? zoneLocs : [null, null, null, null, null, null, null, null];
      cells.forEach(loc => {
        if (!loc) {
          html += `<div class="hm-cell empty">—</div>`;
          return;
        }
        const pct = Math.round((loc.used / Math.max(1, loc.capacity)) * 100);
        let cls = 'empty';
        if (pct === 0) cls = 'empty';
        else if (pct < 30) cls = 'low';
        else if (pct < 70) cls = 'med';
        else if (pct < 90) cls = 'high';
        else cls = 'full';
        html += `<div class="hm-cell ${cls}" title="${esc(loc.code)} — ${pct}% terisi (${loc.used}/${loc.capacity})" onclick="WarehousePage.cellInfo('${loc.id}')">${loc.used > 0 ? pct + '%' : ''}</div>`;
      });
    });
    html += '</div>';
    container.innerHTML = html;

    // Chart
    setTimeout(() => {
      const zoneNames = zones.map(z => z.code);
      const zonePcts = zones.map(z => Math.round((z.used / Math.max(1, z.capacity)) * 100));
      makeChart('smChart', {
        type: 'bar',
        data: {
          labels: zoneNames,
          datasets: [{
            label: 'Utilisasi',
            data: zonePcts,
            backgroundColor: zones.map(z => {
              const pct = Math.round((z.used / Math.max(1, z.capacity)) * 100);
              return pct >= 90 ? 'rgba(239,68,68,.7)' : pct >= 70 ? 'rgba(245,158,11,.7)' : pct >= 30 ? 'rgba(34,211,238,.6)' : 'rgba(16,185,129,.6)';
            }),
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } }
        }
      });
    }, 80);

    // Busy list
    const busyList = document.getElementById('smBusyList');
    if (busyList) {
      const sorted = [...zones].sort((a, b) => (b.used / b.capacity) - (a.used / a.capacity));
      busyList.innerHTML = `
        <div class="stat-list">
          ${sorted.map((z, i) => {
            const pct = Math.round((z.used / z.capacity) * 100);
            const icon = pct >= 85 ? '🚨' : pct >= 60 ? '⚠️' : '✅';
            return `<div class="stat-item">
              <div class="si-ic">${icon}</div>
              <div class="si-info"><div class="si-label">${esc(z.name)}</div>
                <div class="si-value" style="font-size:13.5px">${pct}% terisi · ${DB.fmtNum(z.capacity - z.used)} m² tersisa</div></div>
              <span class="badge ${pct >= 85 ? 'danger' : pct >= 60 ? 'warning' : 'success'} dot">${pct}%</span>
            </div>`;
          }).join('')}
        </div>`;
    }
  },

  cellInfo(locId) {
    const loc = DB.find('locations', locId);
    if (!loc) return;
    const product = DB.get('products').find(p => p.locationId === locId);
    const pct = Math.round((loc.used / loc.capacity) * 100);
    const content = `
      <div class="form-grid">
        <div><div class="ch-sub">KODE</div><strong class="scan-badge">${esc(loc.code)}</strong></div>
        <div><div class="ch-sub">UTILISASI</div><strong>${pct}%</strong></div>
        <div><div class="ch-sub">KAPASITAS</div><strong>${loc.capacity} unit</strong></div>
        <div><div class="ch-sub">TERPAKAI</div><strong>${loc.used} unit</strong></div>
        <div class="full"><div class="ch-sub">PRODUK UTAMA</div><strong>${product ? esc(product.name) : '—'}</strong></div>
      </div>`;
    Modal.open({
      title: `Lokasi ${loc.code}`,
      icon: '📍',
      size: 'sm',
      body: content,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`
    });
  }
};