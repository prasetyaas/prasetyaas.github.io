/* ============================================
   AutoNexa — Administration (Panel Setting)
   ============================================ */

const AdminPage = {

  /* ==================== PROFILE ==================== */
  profile() {
    const content = document.getElementById('pageContent');
    const users = DB.get('users');
    const me = users[0] || { name: 'Admin', role: 'Owner', email: '-', phone: '-' };
    const settings = DB.all().settings || {};

    content.innerHTML = `
      ${App.pageHeader('👤', 'Profile', 'Informasi akun yang sedang aktif', '')}

      <div class="admin-grid">
        <div class="panel profile-card">
          <div class="p-avatar">${esc(initials(me.name))}</div>
          <h3>${esc(me.name)}</h3>
          <div class="p-role">${esc(me.role)}</div>
          <div class="profile-meta">
            <div class="pm-row"><span>Email</span><strong>${esc(me.email)}</strong></div>
            <div class="pm-row"><span>Telepon</span><strong>${esc(me.phone)}</strong></div>
            <div class="pm-row"><span>Status</span><strong class="badge success">Aktif</strong></div>
          </div>
        </div>

        <div class="panel panel-pad">
          <div class="cp-section">
            <strong>Info Bengkel</strong>
            <div class="cp-row"><span>Nama Bengkel</span><strong>${esc(settings.bengkelName)}</strong></div>
            <div class="cp-row"><span>Alamat</span><strong>${esc(settings.address)}</strong></div>
            <div class="cp-row"><span>Telepon</span><strong>${esc(settings.phone)}</strong></div>
            <div class="cp-row"><span>Email</span><strong>${esc(settings.email)}</strong></div>
          </div>
          <div class="cp-section">
            <strong>Operasional</strong>
            <div class="cp-row"><span>Jam Operasional</span><strong>${settings.startHour}:00 – ${settings.endHour}:00</strong></div>
            <div class="cp-row"><span>Jumlah Bay</span><strong>${settings.bayCount}</strong></div>
            <div class="cp-row"><span>Ambang Stok Minimum</span><strong>${settings.lowStockThreshold}</strong></div>
            <div class="cp-row"><span>Pajak</span><strong>${settings.taxPercent}%</strong></div>
          </div>
        </div>
      </div>
    `;
  },

  /* ==================== USERS ==================== */
  users() {
    const content = document.getElementById('pageContent');
    const users = DB.get('users');

    content.innerHTML = `
      ${App.pageHeader('👥', 'User', 'Manajemen pengguna sistem (3 role tetap: Owner, Mekanik, Kasir)', `
        <button class="btn btn-accent" onclick="AdminPage.addUser()">${I.plus} User Baru</button>
      `)}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.users}</span>
            <h3>Pengguna</h3>
            <span class="count">${users.length}</span>
          </div>
        </div>
        ${tableHTML(
          [
            { label: 'Nama' },
            { label: 'Email' },
            { label: 'Role' },
            { label: 'Telepon' },
            { label: 'Status' }
          ],
          users.map(u => `
            <tr>
              ${td(`<span class="td-main">${esc(u.name)}</span>`)}
              ${td(`<span class="td-sub">${esc(u.email)}</span>`)}
              ${td(`<span class="badge ${u.role === 'Owner' ? 'accent' : u.role === 'Mekanik' ? 'info' : 'neutral'}">${esc(u.role)}</span>`)}
              ${td(`<span class="td-sub">${esc(u.phone)}</span>`)}
              ${td(statusBadge(u.status))}
            </tr>
          `)
        )}
      </div>
    `;
  },

  addUser() {
    Modal.open({
      title: 'Tambah User',
      icon: '👤',
      body: `
        <div class="form-grid">
          <label class="field">
            <span>Nama</span>
            <input id="usrName" class="input" placeholder="Nama lengkap">
          </label>
          <label class="field">
            <span>Email</span>
            <input id="usrEmail" class="input" placeholder="email@bengkel.id">
          </label>
          <label class="field">
            <span>Role</span>
            <select id="usrRole" class="input">
              <option>Owner</option><option>Mekanik</option><option>Kasir</option>
            </select>
          </label>
          <label class="field">
            <span>Telepon</span>
            <input id="usrPhone" class="input" placeholder="0812-0000-0000">
          </label>
        </div>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="usrSave">Simpan</button>
      `
    });
    document.getElementById('usrSave').onclick = () => {
      const name = document.getElementById('usrName').value.trim();
      const email = document.getElementById('usrEmail').value.trim();
      if (!name || !email) {
        Toast.show('Nama dan email wajib diisi', 'warning');
        return;
      }
      DB.add('users', {
        id: DB.genId('USR'),
        name,
        email,
        role: document.getElementById('usrRole').value,
        initials: initials(name),
        status: 'active',
        phone: document.getElementById('usrPhone').value.trim() || '-'
      });
      DB.log('create', 'user', name, `Menambahkan user — ${name}`);
      Modal.close();
      Toast.show(`User ${name} ditambahkan`, 'success');
      this.users();
    };
  },

  /* ==================== SETTINGS ==================== */
  settings() {
    const content = document.getElementById('pageContent');
    const s = DB.all().settings || {};

    content.innerHTML = `
      ${App.pageHeader('⚙️', 'Settings', 'Pengaturan bengkel dan sistem', '')}

      <div class="accordion">
        <div class="acc-item open">
          <button class="acc-head" onclick="this.parentElement.classList.toggle('open')">
            ${I.home} Info Bengkel <span class="acc-chev">${I.chevron}</span>
          </button>
          <div class="acc-body">
            <div class="form-grid">
              <label class="field">
                <span>Nama Bengkel</span>
                <input id="setName" class="input" value="${esc(s.bengkelName)}">
              </label>
              <label class="field">
                <span>Telepon</span>
                <input id="setPhone" class="input" value="${esc(s.phone)}">
              </label>
              <label class="field full">
                <span>Alamat</span>
                <input id="setAddress" class="input" value="${esc(s.address)}">
              </label>
              <label class="field full">
                <span>Email</span>
                <input id="setEmail" class="input" value="${esc(s.email)}">
              </label>
            </div>
          </div>
        </div>

        <div class="acc-item">
          <button class="acc-head" onclick="this.parentElement.classList.toggle('open')">
            ${I.clock} Operasional <span class="acc-chev">${I.chevron}</span>
          </button>
          <div class="acc-body">
            <div class="form-grid">
              <label class="field">
                <span>Jam Mulai</span>
                <input id="setStart" class="input" type="number" value="${s.startHour}" min="0" max="23">
              </label>
              <label class="field">
                <span>Jam Selesai</span>
                <input id="setEnd" class="input" type="number" value="${s.endHour}" min="0" max="23">
              </label>
              <label class="field">
                <span>Jumlah Bay</span>
                <input id="setBay" class="input" type="number" value="${s.bayCount}" min="1" max="10">
              </label>
              <label class="field">
                <span>Ambang Stok Minimum</span>
                <input id="setLow" class="input" type="number" value="${s.lowStockThreshold}" min="0">
              </label>
              <label class="field">
                <span>Pajak (%)</span>
                <input id="setTax" class="input" type="number" value="${s.taxPercent}" min="0">
              </label>
              <label class="field">
                <span>Timezone</span>
                <input id="setTz" class="input" value="${esc(s.timezone)}">
              </label>
            </div>
          </div>
        </div>

        <div class="acc-item">
          <button class="acc-head" onclick="this.parentElement.classList.toggle('open')">
            ${I.bell} Notifikasi <span class="acc-chev">${I.chevron}</span>
          </button>
          <div class="acc-body">
            <label class="chk" style="display:flex;gap:8px;margin-bottom:8px">
              <input type="checkbox" id="setAutoBackup" ${s.autoBackup ? 'checked' : ''}>
              <span>Aktifkan notifikasi stok menipis</span>
            </label>
            <label class="chk" style="display:flex;gap:8px">
              <input type="checkbox" id="setNotif" checked>
              <span>Tampilkan notifikasi WO baru</span>
            </label>
          </div>
        </div>
      </div>

      <div style="margin-top:16px;text-align:right">
        <button class="btn btn-primary" onclick="AdminPage.saveSettings()">${I.check} Simpan Pengaturan</button>
      </div>
    `;
  },

  saveSettings() {
    const db = DB.all();
    const s = db.settings || {};
    const newSettings = {
      ...s,
      bengkelName: document.getElementById('setName').value.trim() || s.bengkelName,
      phone: document.getElementById('setPhone').value.trim() || s.phone,
      address: document.getElementById('setAddress').value.trim() || s.address,
      email: document.getElementById('setEmail').value.trim() || s.email,
      startHour: parseInt(document.getElementById('setStart').value) || s.startHour,
      endHour: parseInt(document.getElementById('setEnd').value) || s.endHour,
      bayCount: parseInt(document.getElementById('setBay').value) || s.bayCount,
      lowStockThreshold: parseInt(document.getElementById('setLow').value) || s.lowStockThreshold,
      taxPercent: parseInt(document.getElementById('setTax').value) || s.taxPercent,
      timezone: document.getElementById('setTz').value.trim() || s.timezone,
      autoBackup: document.getElementById('setAutoBackup').checked
    };
    db.settings = newSettings;
    DB.set(db);
    DB.log('update', 'settings', 'SETTINGS', 'Memperbarui pengaturan bengkel');
    Toast.show('Pengaturan berhasil disimpan', 'success');
    this.settings();
  },

  /* ==================== BACKUP ==================== */
  backup() {
    const content = document.getElementById('pageContent');
    const meta = DB.all().meta || {};
    const stats = {
      wos: DB.get('workOrders').length,
      parts: DB.get('spareParts').length,
      customers: DB.get('customers').length,
      vehicles: DB.get('vehicles').length
    };

    content.innerHTML = `
      ${App.pageHeader('💾', 'Backup', 'Cadangkan atau pulihkan data bengkel', '')}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.archive}</span>
            <h3>Status Data</h3>
          </div>
        </div>
        <div class="panel panel-pad">
          <div class="kpi-strip" style="margin-bottom:0">
            <div class="kpi-cell"><span class="kc-label">Work Order</span><span class="kc-value">${stats.wos}</span></div>
            <div class="kpi-cell"><span class="kc-label">Spare Part</span><span class="kc-value">${stats.parts}</span></div>
            <div class="kpi-cell"><span class="kc-label">Pelanggan</span><span class="kc-value">${stats.customers}</span></div>
            <div class="kpi-cell"><span class="kc-label">Kendaraan</span><span class="kc-value">${stats.vehicles}</span></div>
          </div>
          <div class="cp-row" style="margin-top:12px"><span>Versi Database</span><strong>${esc(meta.version || '-')}</strong></div>
          <div class="cp-row"><span>Terakhir Seed</span><strong>${esc(DB.fmtDateTime(meta.seededAt))}</strong></div>
          <div class="cp-row"><span>Auto Backup</span><strong>${DB.all().settings.autoBackup ? 'Aktif' : 'Nonaktif'}</strong></div>
        </div>
      </div>

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.download}</span>
            <h3>Aksi Backup</h3>
          </div>
        </div>
        <div class="report-item">
          <div class="report-ic">${I.download}</div>
          <div class="report-info">
            <strong>Export Backup JSON</strong>
            <small>Unduh seluruh data bengkel sebagai file JSON</small>
          </div>
          <div class="report-actions">
            <button class="btn btn-sm btn-accent" onclick="AdminPage.exportBackup()">${I.download} Export</button>
          </div>
        </div>
        <div class="report-item">
          <div class="report-ic">${I.upload}</div>
          <div class="report-info">
            <strong>Import Backup JSON</strong>
            <small>Pulihkan data dari file backup yang tersimpan</small>
          </div>
          <div class="report-actions">
            <button class="btn btn-sm btn-ghost" onclick="AdminPage.importBackup()">${I.upload} Import</button>
          </div>
        </div>
        <div class="report-item">
          <div class="report-ic" style="background:var(--danger-soft);color:var(--danger)">${I.alert}</div>
          <div class="report-info">
            <strong>Reset Data Demo</strong>
            <small>Kembalikan semua data ke kondisi awal (seed)</small>
          </div>
          <div class="report-actions">
            <button class="btn btn-sm btn-danger" onclick="AdminPage.resetData()">${I.refresh} Reset</button>
          </div>
        </div>
      </div>
    `;
  },

  exportBackup() {
    const db = DB.all();
    downloadFile(`autonexa-backup-${Date.now()}.json`, JSON.stringify(db, null, 2), 'application/json');
    DB.log('export', 'backup', 'BACKUP', 'Mengexport backup data JSON');
    Toast.show('Backup data berhasil diunduh', 'success');
  },

  importBackup() {
    Modal.open({
      title: 'Import Backup JSON',
      icon: '📥',
      body: `
        <label class="field">
          <span>Tempel isi file JSON backup</span>
          <textarea id="importJson" class="input" style="min-height:160px;font-family:var(--font-mono);font-size:11px" placeholder='{"workOrders": [...], "spareParts": [...]}'></textarea>
        </label>
        <p style="font-size:11px;color:var(--text-3)">Data saat ini akan diganti dengan data backup.</p>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="importSave">Import</button>
      `
    });
    document.getElementById('importSave').onclick = () => {
      try {
        const text = document.getElementById('importJson').value.trim();
        DB.importJSON(text);
        Modal.close();
        Toast.show('Backup berhasil dipulihkan', 'success');
        this.backup();
      } catch (e) {
        Toast.show(e.message, 'error');
      }
    };
  },

  resetData() {
    Modal.confirm({
      title: 'Reset Data Demo',
      message: 'Semua data akan dikembalikan ke kondisi awal. Tindakan ini tidak dapat dibatalkan.',
      icon: '⚠️',
      yesText: 'Ya, Reset',
      danger: true,
      onYes: () => {
        DB.reset();
        Toast.show('Data demo berhasil di-reset', 'success');
        this.backup();
      }
    });
  },

  /* ==================== ACTIVITY LOG ==================== */
  logs() {
    const content = document.getElementById('pageContent');
    const logs = [...DB.get('activityLogs')].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    content.innerHTML = `
      ${App.pageHeader('📜', 'Activity Log', 'Jejak aktivitas pengguna di sistem', `
        <button class="btn btn-ghost" onclick="AdminPage.exportLogs()">${I.download} Export CSV</button>
      `)}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.activity}</span>
            <h3>Timeline Aktivitas</h3>
            <span class="count">${logs.length}</span>
          </div>
        </div>
        <div class="panel">
          <div class="timeline">
            ${logs.map(l => `
              <div class="tl-item">
                <div class="tl-time">${DB.fmtDateTime(l.timestamp)}</div>
                <div class="tl-body">
                  <strong>${esc(l.user)}</strong> — ${esc(l.detail)}
                  <span class="tl-tag" style="color:var(--primary)">${esc(l.entity)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  exportLogs() {
    const logs = DB.get('activityLogs');
    const rows = logs.map(l => [l.timestamp, l.user, l.action, l.entity, l.detail]);
    rows.unshift(['Waktu', 'User', 'Aksi', 'Entitas', 'Detail']);
    exportCSV('activity-log.csv', rows);
    Toast.show('Activity log diekspor', 'success');
  }
};