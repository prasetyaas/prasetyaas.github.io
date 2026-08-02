/* ============================================
   StockPilot — Administration
   ============================================ */

const AdminPage = {
  _active: 'users',

  users() {
    this._active = 'users';
    const content = document.getElementById('pageContent');
    const users = DB.get('users');
    content.innerHTML = `
      ${App.pageHeader('👥', 'User Management', 'Kelola pengguna sistem', `
        <button class="btn btn-primary" onclick="AdminPage.addUser()">${I.plus} User</button>
      `)}
      <div class="card"><div class="table-wrap"><table>
        <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>${users.map(u => `
          <tr><td><span class="td-main">${esc(u.name)}</span></td><td>${esc(u.email)}</td><td><span class="badge primary">${esc(u.role)}</span></td><td>${statusBadge(u.status)}</td></tr>`).join('')}
        </tbody></table></div></div>
    `;
  },

  addUser() {
    Modal.open({
      title: 'Tambah User', icon: '👤',
      body: `
        <div class="form-grid">
          <label class="field"><span>Nama</span><input id="uName" class="input" placeholder="Nama"></label>
          <label class="field"><span>Email</span><input id="uEmail" class="input" placeholder="email@stockpilot.id"></label>
          <label class="field"><span>Role</span><select id="uRole" class="input"><option>Owner</option><option>Supervisor</option><option>Warehouse</option></select></label>
        </div>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" id="uSave">Simpan</button>`
    });
    document.getElementById('uSave').onclick = () => {
      const name = document.getElementById('uName').value.trim();
      const email = document.getElementById('uEmail').value.trim();
      if (!name || !email) { Toast.show('Nama & email wajib', 'warning'); return; }
      DB.add('users', { id: DB.genId('USR'), name, email, role: document.getElementById('uRole').value, initials: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(), status: 'active' });
      DB.log('create', 'user', name, `Menambahkan user ${name}`);
      Modal.close(); Toast.show('User ditambahkan', 'success');
      this.users();
    };
  },

  roles() {
    this._active = 'roles';
    const content = document.getElementById('pageContent');
    const roles = DB.get('roles');
    content.innerHTML = `
      ${App.pageHeader('🛡️', 'Roles & Permissions', 'Peran dan tingkat akses', '')}
      <div class="grid-3">${roles.map(r => `
        <div class="card card-hover card-pad">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div class="product-thumb" style="width:36px;height:36px">${I.shield}</div>
            <div><div style="font-weight:700;font-size:13px">${esc(r.name)}</div><div style="font-size:10.5px;color:var(--text-3)">Level ${r.level}</div></div>
          </div>
          <div style="font-size:11.5px;color:var(--text-2)">${esc(r.desc)}</div>
        </div>`).join('')}</div>
    `;
  },

  logs() {
    this._active = 'logs';
    const content = document.getElementById('pageContent');
    const logs = [...DB.get('activityLogs')].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    content.innerHTML = `
      ${App.pageHeader('📜', 'Activity Log', 'Jejak aktivitas sistem', `
        <button class="btn btn-sm btn-ghost" onclick="ExportService.csv('activity-log.csv',['Waktu','User','Aksi','Detail'],${JSON.stringify(logs.map(l => [DB.fmtDateTime(l.timestamp), l.user, l.action, l.detail]))})">${I.download} CSV</button>
      `)}
      <div class="card"><div class="timeline">
        ${logs.map(l => `<div class="tl-item"><div class="tl-time">${DB.fmtDateShort(l.timestamp)}</div><div class="tl-body"><strong>${esc(l.user)}</strong> — ${esc(l.detail)} <span class="tl-tag" style="color:var(--primary)">${esc(l.entity)}</span></div></div>`).join('')}
      </div></div>
    `;
  },

  settings() {
    this._active = 'settings';
    const content = document.getElementById('pageContent');
    const s = DB.all().settings || {};
    content.innerHTML = `
      ${App.pageHeader('⚙️', 'System Settings', 'Konfigurasi sistem', '')}
      <div class="accordion">
        <div class="acc-item open">
          <button class="acc-head" onclick="this.parentElement.classList.toggle('open')">${I.settings} Info Perusahaan <span class="acc-chev">${I.chevron}</span></button>
          <div class="acc-body">
            <div class="form-grid">
              <label class="field"><span>Nama Perusahaan</span><input id="sName" class="input" value="${esc(s.companyName)}"></label>
              <label class="field"><span>Mata Uang</span><input id="sCur" class="input" value="${esc(s.currency)}"></label>
              <label class="field"><span>Timezone</span><input id="sTz" class="input" value="${esc(s.timezone)}"></label>
              <label class="field"><span>Ambang Stok Minimum</span><input id="sLow" class="input" type="number" value="${s.lowStockThreshold}"></label>
            </div>
          </div>
        </div>
        <div class="acc-item">
          <button class="acc-head" onclick="this.parentElement.classList.toggle('open')">${I.bell} Notifikasi <span class="acc-chev">${I.chevron}</span></button>
          <div class="acc-body">
            <label class="chk" style="display:flex;gap:8px;margin-bottom:8px"><input type="checkbox" id="sNotif" ${s.notificationsEnabled ? 'checked' : ''}><span>Aktifkan notifikasi</span></label>
            <label class="chk" style="display:flex;gap:8px"><input type="checkbox" id="sBackup" ${s.autoBackup ? 'checked' : ''}><span>Auto backup</span></label>
          </div>
        </div>
      </div>
      <div style="margin-top:16px;text-align:right"><button class="btn btn-primary" onclick="AdminPage.saveSettings()">${I.check} Simpan</button></div>
    `;
  },

  saveSettings() {
    const db = DB.all();
    db.settings = {
      ...db.settings,
      companyName: document.getElementById('sName').value,
      currency: document.getElementById('sCur').value,
      timezone: document.getElementById('sTz').value,
      lowStockThreshold: parseInt(document.getElementById('sLow').value) || 10,
      notificationsEnabled: document.getElementById('sNotif').checked,
      autoBackup: document.getElementById('sBackup').checked
    };
    DB.set(db);
    DB.log('update', 'settings', 'SETTINGS', 'Memperbarui pengaturan sistem');
    Toast.show('Pengaturan disimpan', 'success');
    this.settings();
  },

  backup() {
    this._active = 'backup';
    const content = document.getElementById('pageContent');
    const meta = DB.all().meta || {};
    const stats = { products: DB.get('products').length, txs: DB.get('transactions').length, pos: DB.get('pos').length };
    content.innerHTML = `
      ${App.pageHeader('💾', 'Backup & Restore', 'Cadangkan atau pulihkan data', '')}
      <div class="stat-strip">
        <div class="stat-cell c-blue" style="position:relative"><span class="sc-label">Produk</span><span class="sc-value">${stats.products}</span><div class="sc-icon">${I.box}</div></div>
        <div class="stat-cell c-green" style="position:relative"><span class="sc-label">Transaksi</span><span class="sc-value">${stats.txs}</span><div class="sc-icon">${I.activity}</div></div>
        <div class="stat-cell c-amber" style="position:relative"><span class="sc-label">Purchase Order</span><span class="sc-value">${stats.pos}</span><div class="sc-icon">${I.truck}</div></div>
      </div>
      <div class="report-item">
        <div class="report-ic">${I.download}</div>
        <div class="report-info"><strong>Export Backup JSON</strong><small>Unduh seluruh data sebagai file JSON</small></div>
        <button class="btn btn-sm btn-primary" onclick="AdminPage.exportBackup()">${I.download} Export</button>
      </div>
      <div class="report-item">
        <div class="report-ic">${I.upload}</div>
        <div class="report-info"><strong>Import Backup JSON</strong><small>Pulihkan data dari file backup</small></div>
        <button class="btn btn-sm btn-ghost" onclick="AdminPage.importBackup()">${I.upload} Import</button>
      </div>
      <div class="report-item">
        <div class="report-ic" style="background:var(--danger-soft);color:var(--danger)">${I.refresh}</div>
        <div class="report-info"><strong>Reset Data Demo</strong><small>Kembalikan ke kondisi awal</small></div>
        <button class="btn btn-sm btn-danger" onclick="AdminPage.resetData()">${I.refresh} Reset</button>
      </div>
    `;
  },

  exportBackup() {
    const db = DB.all();
    ExportService._download(`stockpilot-backup-${Date.now()}.json`, JSON.stringify(db, null, 2), 'application/json');
    DB.log('export', 'backup', 'BACKUP', 'Mengexport backup JSON');
    Toast.show('Backup diunduh', 'success');
  },

  importBackup() {
    Modal.open({
      title: 'Import Backup', icon: '📥',
      body: `<label class="field"><span>Tempel isi JSON</span><textarea id="importJson" class="input" style="min-height:140px;font-family:monospace;font-size:11px" placeholder='{"products": [...]}'></textarea></label>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" id="importSave">Import</button>`
    });
    document.getElementById('importSave').onclick = () => {
      try { DB.importJSON(document.getElementById('importJson').value.trim()); Modal.close(); Toast.show('Backup dipulihkan', 'success'); this.backup(); }
      catch (e) { Toast.show(e.message, 'error'); }
    };
  },

  resetData() {
    Modal.confirm({ title: 'Reset Data', message: 'Semua data akan dikembalikan ke kondisi awal. Lanjutkan?', danger: true, yesText: 'Ya, Reset', onYes: () => { DB.reset(); Toast.show('Data di-reset', 'success'); this.backup(); } });
  }
};