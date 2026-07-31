/* ============================================
   NexaWMS Pro — Administration Pages
   User · Role · Permission · Automation · Notification
   Backup · API · Audit Log · Profile
   ============================================ */

const AdminPage = {

  /* ================= USERS ================= */
  users() {
    const content = document.getElementById('pageContent');
    const users = DB.get('users');

    content.innerHTML = `
      ${App.pageHeader('👤', 'User', 'Kelola pengguna sistem', `
        <button class="btn btn-primary" onclick="AdminPage.openUserModal()">${I.plus} Tambah User</button>
      `)}

      <div class="card">
        <div class="card-head"><div><h3><span class="ch-ic">👥</span> Daftar Pengguna</h3><div class="ch-sub">Semua akun dan peran</div></div></div>
        ${tableHTML(
          [
            { label: 'User' }, { label: 'Email' }, { label: 'Role' },
            { label: 'Terakhir Login' }, { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          users.map(u => `
            <tr>
              ${td(`<div class="product-cell"><div class="avatar" style="width:34px;height:34px;font-size:11px">${esc(u.avatar)}</div><div><div class="cell-main">${esc(u.name)}</div><div class="cell-sub">ID: ${esc(u.id)}</div></div></div>`)}
              ${td(`<span style="font-size:12px">${esc(u.email)}</span>`)}
              ${td(customBadge('primary', esc(DB.role(u.roleId)?.name || '-')))}
              ${td(u.lastLogin ? DB.fmtDateTime(u.lastLogin) : '-')}
              ${td(u.status === 'active' ? customBadge('success', 'Aktif') : customBadge('neutral', 'Nonaktif'))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Edit" onclick="AdminPage.editUser('${u.id}')">${I.edit}</button>
                <button class="icon-btn danger" title="Hapus" onclick="AdminPage.deleteUser('${u.id}')">${I.trash}</button>
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada user'
        )}
      </div>
    `;
  },

  openUserModal(user) {
    const isEdit = !!user;
    Modal.open({
      title: isEdit ? 'Edit User' : 'Tambah User', icon: '👤', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field"><span>Nama Lengkap</span><input id="usrName" value="${user ? esc(user.name) : ''}"></label>
          <label class="field"><span>Email</span><input id="usrEmail" type="email" value="${user ? esc(user.email) : ''}"></label>
          <label class="field"><span>Role</span>
            <select id="usrRole">${DB.get('roles').map(r => `<option value="${r.id}" ${user && user.roleId === r.id ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select>
          </label>
          <label class="field"><span>Status</span>
            <select id="usrStatus">
              <option value="active" ${user && user.status === 'active' ? 'selected' : ''}>Aktif</option>
              <option value="inactive" ${user && user.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
            </select>
          </label>
          <label class="field"><span>No. Telepon</span><input id="usrPhone" value="${user ? esc(user.phone) : ''}"></label>
          ${!isEdit ? `<label class="field"><span>Password Awal</span><input id="usrPass" type="password" value="password123"></label>` : ''}
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="AdminPage.saveUser(${isEdit ? `'${user.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editUser(id) {
    const u = DB.find('users', id);
    if (u) this.openUserModal(u);
  },

  saveUser(existingId) {
    const name = document.getElementById('usrName').value.trim();
    if (!name) { Toast.show('Nama user wajib diisi', 'error'); return; }
    const data = {
      name,
      email: document.getElementById('usrEmail').value,
      roleId: document.getElementById('usrRole').value,
      status: document.getElementById('usrStatus').value,
      phone: document.getElementById('usrPhone').value,
      avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    };
    if (existingId) {
      DB.update('users', existingId, data);
      DB.audit('update', 'user', existingId, `Update user ${name}`, 'Admin');
      Toast.show('User berhasil diperbarui', 'success');
    } else {
      DB.add('users', { id: DB.genId('USR'), ...data, lastLogin: null });
      DB.audit('create', 'user', 'NEW', `Membuat user ${name}`, 'Admin');
      Toast.show(`User "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.users();
  },

  deleteUser(id) {
    const u = DB.find('users', id);
    Modal.confirm({
      title: 'Hapus User', icon: '🗑️', danger: true,
      message: `Hapus user "${u.name}"?`,
      onYes: () => {
        DB.remove('users', id);
        Toast.show('User dihapus', 'success');
        this.users();
      }
    });
  },

  /* ================= ROLES ================= */
  roles() {
    const content = document.getElementById('pageContent');
    const roles = DB.get('roles');
    const colorMap = { primary: 'primary', cyan: 'accent', green: 'success', orange: 'warning' };

    content.innerHTML = `
      ${App.pageHeader('🎭', 'Role', 'Kelola peran dan hak akses pengguna', `
        <button class="btn btn-primary" onclick="AdminPage.openRoleModal()">${I.plus} Tambah Role</button>
      `)}

      <div class="grid-2">
        ${roles.map(r => {
          const permCount = Object.values(r.permissions || {}).reduce((s, perms) => s + perms.length, 0);
          return `
          <div class="card hoverable" style="margin:0">
            <div class="card-head" style="margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:12px">
                <div class="kpi-ic" style="background:${r.color === 'primary' ? 'rgba(99,102,241,.15)' : r.color === 'cyan' ? 'rgba(34,211,238,.15)' : r.color === 'green' ? 'rgba(16,185,129,.15)' : 'rgba(245,158,11,.15)'}">${I.users}</div>
                <div>
                  <h3 style="font-size:15px">${esc(r.name)}</h3>
                  <span style="font-size:11px;color:var(--text-3)">${esc(r.description)}</span>
                </div>
              </div>
              <span class="badge ${colorMap[r.color] || 'neutral'} dot">${r.userCount} user</span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
              ${Object.entries(r.permissions || {}).map(([key, perms]) => perms.length ? `<span class="badge neutral dot">${key} · ${perms.length}</span>` : '').join('')}
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" style="flex:1" onclick="AdminPage.editRole('${r.id}')">${I.edit} Edit</button>
              <button class="btn btn-outline btn-sm" onclick="AdminPage.viewRolePermissions('${r.id}')">${I.shield} Permission</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  openRoleModal(role) {
    const isEdit = !!role;
    Modal.open({
      title: isEdit ? 'Edit Role' : 'Tambah Role', icon: '🎭',
      body: `
        <label class="field"><span>Nama Role</span><input id="roleName" value="${role ? esc(role.name) : ''}" placeholder="cth: Procurement"></label>
        <label class="field"><span>Deskripsi</span><textarea id="roleDesc" placeholder="Deskripsi role...">${role ? esc(role.description) : ''}</textarea></label>
        <label class="field"><span>Warna</span>
          <select id="roleColor">
            ${['primary','cyan','green','orange','pink'].map(c => `<option value="${c}" ${role && role.color === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </label>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="AdminPage.saveRole(${isEdit ? `'${role.id}'` : 'null'})">${I.check} Simpan</button>`
    });
  },

  editRole(id) {
    const r = DB.find('roles', id);
    if (r) this.openRoleModal(r);
  },

  saveRole(existingId) {
    const name = document.getElementById('roleName').value.trim();
    if (!name) { Toast.show('Nama role wajib diisi', 'error'); return; }
    const data = {
      name,
      description: document.getElementById('roleDesc').value,
      color: document.getElementById('roleColor').value,
      permissions: {}
    };
    if (existingId) {
      const old = DB.find('roles', existingId);
      data.permissions = old.permissions || {};
      DB.update('roles', existingId, data);
      Toast.show('Role berhasil diperbarui', 'success');
    } else {
      DB.add('roles', { id: DB.genId('ROL'), ...data, userCount: 0 });
      Toast.show(`Role "${name}" berhasil ditambahkan`, 'success');
    }
    Modal.close();
    this.roles();
  },

  viewRolePermissions(id) {
    const r = DB.find('roles', id);
    if (!r) return;
    Modal.open({
      title: `Permission — ${r.name}`, icon: '🛡️', size: 'lg',
      body: `
        <p style="color:var(--text-2);font-size:12.5px;margin-bottom:16px">${esc(r.description)}</p>
        <div class="perm-grid">
          <div class="pg-cell head">Modul</div>
          <div class="pg-cell head">View</div><div class="pg-cell head">Create</div>
          <div class="pg-cell head">Edit</div><div class="pg-cell head">Delete</div><div class="pg-cell head">Export</div>
          ${Object.entries(r.permissions || {}).map(([module, perms]) => `
            <div class="pg-cell">${module.charAt(0).toUpperCase() + module.slice(1)}</div>
            ${['view','create','edit','delete','export'].map(p => `
              <div class="pg-cell">
                <span class="pg-toggle ${perms.includes(p) ? 'on' : ''}">${perms.includes(p) ? '✓' : ''}</span>
              </div>`).join('')}
          `).join('')}
        </div>`,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`
    });
  },

  /* ================= PERMISSIONS ================= */
  permissions() {
    const content = document.getElementById('pageContent');
    const roles = DB.get('roles');
    const modules = ['dashboard', 'products', 'inventory', 'operations', 'warehouse', 'analytics', 'reports', 'customers', 'suppliers', 'users', 'settings', 'backup', 'api'];
    const actions = ['view', 'create', 'edit', 'delete', 'export'];

    content.innerHTML = `
      ${App.pageHeader('🛡️', 'Permission', 'Matriks hak akses per role', `
        <button class="btn btn-primary" onclick="AdminPage.savePermissionMatrix()">${I.check} Simpan Semua</button>
      `)}

      <div class="alert info"><span class="alert-ic">🛡️</span><div><strong>Role-Based Access Control</strong><p>Klik toggle untuk mengubah hak akses setiap role terhadap modul. Perubahan tersimpan otomatis di browser.</p></div></div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Role</th>
              ${actions.map(a => `<th class="text-center">${a.charAt(0).toUpperCase() + a.slice(1)}</th>`).join('')}
            </tr></thead>
            <tbody>
              ${roles.map(r => `
                <tr style="background:rgba(99,102,241,.04)">
                  <td style="border-bottom:1px solid var(--border-strong)"><strong>${esc(r.name)}</strong><div class="cell-sub">${esc(r.description)}</div></td>
                  ${actions.map(a => `<td class="text-center" style="border-bottom:1px solid var(--border-strong)">—</td>`).join('')}
                </tr>
                ${modules.map(m => {
                  const perms = r.permissions?.[m] || [];
                  return `<tr>
                    <td style="font-size:12.5px;color:var(--text-2);padding-left:36px">${m.charAt(0).toUpperCase() + m.slice(1)}</td>
                    ${actions.map(a => {
                      const on = perms.includes(a);
                      return `<td class="text-center">
                        <button class="pg-toggle ${on ? 'on' : ''}" data-role="${r.id}" data-module="${m}" data-action="${a}" onclick="AdminPage.togglePerm(this)">${on ? '✓' : ''}</button>
                      </td>`;
                    }).join('')}
                  </tr>`;
                }).join('')}
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  togglePerm(el) {
    const roleId = el.dataset.role;
    const module = el.dataset.module;
    const action = el.dataset.action;
    const role = DB.find('roles', roleId);
    const perms = role.permissions?.[module] || [];
    const idx = perms.indexOf(action);
    if (idx >= 0) perms.splice(idx, 1);
    else perms.push(action);
    role.permissions[module] = perms;
    DB.update('roles', roleId, { permissions: role.permissions });
    el.classList.toggle('on');
    el.textContent = perms.includes(action) ? '✓' : '';
    Toast.show(`Permission ${module}.${action} untuk ${role.name} diperbarui`, 'info');
  },

  savePermissionMatrix() {
    DB.audit('update', 'permission', 'MATRIX', 'Memperbarui matriks permission', 'Admin');
    Toast.show('Matriks permission berhasil disimpan', 'success');
  },

  /* ================= AUTOMATION ================= */
  automation() {
    const content = document.getElementById('pageContent');
    const automations = DB.get('automations');
    const activeCount = automations.filter(a => a.status === 'active').length;
    const totalRuns = automations.reduce((s, a) => s + a.runCount, 0);

    content.innerHTML = `
      ${App.pageHeader('⚡', 'Automation', 'Atur otomasi workflow & notifikasi otomatis', `
        <button class="btn btn-primary" onclick="AdminPage.openAutomationModal()">${I.plus} Buat Rule</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.zap}</div><span class="badge success dot">Aktif</span></div>
          <div class="kpi-label">Automation Aktif</div>
          <div class="kpi-value">${activeCount}/${automations.length}</div>
          <div class="kpi-sub">Rule yang berjalan</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.activity}</div><span class="badge accent dot">Total</span></div>
          <div class="kpi-label">Total Eksekusi</div>
          <div class="kpi-value">${DB.fmtNum(totalRuns)}</div>
          <div class="kpi-sub">Sepanjang waktu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge info dot">Hari ini</span></div>
          <div class="kpi-label">Eksekusi Hari Ini</div>
          <div class="kpi-value">${automations.filter(a => a.status === 'active').length * 3}</div>
          <div class="kpi-sub">Termasuk low stock & summary</div>
        </div>
      </div>

      <div class="grid-2">
        ${automations.map(a => `
          <div class="card hoverable" style="margin:0">
            <div class="card-head" style="margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:12px">
                <div class="kpi-ic" style="font-size:18px;background:rgba(99,102,241,.1)">${a.icon}</div>
                <div>
                  <h3 style="font-size:14px">${esc(a.name)}</h3>
                  <span class="cell-sub">Terakhir: ${DB.fmtDateTime(a.lastRun)} · ${a.runCount}x dijalankan</span>
                </div>
              </div>
              ${a.status === 'active' ? customBadge('success', 'Aktif') : customBadge('neutral', 'Nonaktif')}
            </div>
            <div style="display:flex;gap:10px;margin-bottom:12px">
              <div style="flex:1;padding:10px;background:rgba(148,163,184,.04);border-radius:8px">
                <div style="font-size:10.5px;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px">Trigger</div>
                <div style="font-size:12px;margin-top:3px">${esc(a.trigger)}</div>
              </div>
              <div style="flex:1;padding:10px;background:rgba(148,163,184,.04);border-radius:8px">
                <div style="font-size:10.5px;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px">Action</div>
                <div style="font-size:12px;margin-top:3px">${esc(a.action)}</div>
              </div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" style="flex:1" onclick="AdminPage.toggleAutomation('${a.id}')">
                ${a.status === 'active' ? '⏸ Nonaktifkan' : '▶ Aktifkan'}
              </button>
              <button class="btn btn-primary btn-sm" onclick="AdminPage.runAutomation('${a.id}')">${I.zap} Jalankan</button>
            </div>
          </div>`).join('')}
      </div>
    `;
  },

  openAutomationModal() {
    Modal.open({
      title: 'Buat Rule Automation', icon: '⚡', size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field full"><span>Nama Rule</span><input id="autName" placeholder="cth: Expiry Alert Produk"></label>
          <label class="field"><span>Trigger</span>
            <select id="autTrigger">
              <option>Stok di bawah reorder point</option>
              <option>Stok mencapai safety stock</option>
              <option>Tidak ada movement 90+ hari</option>
              <option>Reservasi melewati tanggal expire</option>
              <option>Jadwal count H-1</option>
              <option>Setiap hari pukul 20:00</option>
            </select>
          </label>
          <label class="field"><span>Action</span>
            <select id="autAction">
              <option>Buat notifikasi + email</option>
              <option>Generate draft PO</option>
              <option>Kirim ringkasan KPI via email</option>
              <option>Batalkan & release stok</option>
              <option>Notifikasi ke supervisor</option>
            </select>
          </label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="AdminPage.saveAutomation()">${I.check} Simpan Rule</button>`
    });
  },

  saveAutomation() {
    const name = document.getElementById('autName').value.trim();
    if (!name) { Toast.show('Nama rule wajib diisi', 'error'); return; }
    DB.add('automations', {
      id: DB.genId('AUT'),
      name, icon: '⚡',
      trigger: document.getElementById('autTrigger').value,
      action: document.getElementById('autAction').value,
      status: 'inactive',
      lastRun: null, runCount: 0
    });
    DB.notify('Automation Baru', `Rule "${name}" berhasil dibuat`, 'success', '⚡');
    Toast.show(`Rule "${name}" berhasil dibuat`, 'success');
    Modal.close();
    this.automation();
  },

  toggleAutomation(id) {
    const a = DB.find('automations', id);
    if (!a) return;
    const newStatus = a.status === 'active' ? 'inactive' : 'active';
    DB.update('automations', id, { status: newStatus });
    Toast.show(`${a.name} ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
    this.automation();
  },

  runAutomation(id) {
    const a = DB.find('automations', id);
    if (!a) return;
    DB.update('automations', id, {
      runCount: a.runCount + 1,
      lastRun: DB.now()
    });
    DB.notify('Automation Dijalankan', `${a.name} dieksekusi manual — ${a.action}`, 'info', '⚡');
    Toast.show(`${a.name} berhasil dijalankan`, 'success');
    this.automation();
  },

  /* ================= NOTIFICATIONS ================= */
  notifications() {
    const content = document.getElementById('pageContent');
    const notifs = [...DB.get('notifications')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unread = notifs.filter(n => !n.read).length;

    content.innerHTML = `
      ${App.pageHeader('🔔', 'Notification', 'Pusat notifikasi & alert', `
        <button class="btn btn-ghost" onclick="App.markAllRead()">${I.check} Tandai Semua Dibaca</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.bell}</div><span class="badge warning dot">${unread} unread</span></div>
          <div class="kpi-label">Total Notifikasi</div>
          <div class="kpi-value">${notifs.length}</div>
          <div class="kpi-sub">${unread} belum dibaca</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">Hari ini</span></div>
          <div class="kpi-label">Notifikasi Hari Ini</div>
          <div class="kpi-value">${notifs.filter(n => n.createdAt.slice(0, 10) === DB.now().slice(0, 10)).length}</div>
          <div class="kpi-sub">Alert & reminders</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📋</span> Semua Notifikasi</h3><div class="ch-sub">Sistem berjalan real-time</div></div>
          <select style="width:auto" onchange="AdminPage.filterNotif(this.value)">
            <option value="all">Semua</option>
            <option value="unread">Belum Dibaca</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div id="notifList">
          ${notifs.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-type="${n.type}">
              <div class="notif-ic" style="background:${({warning:'#f59e0b',danger:'#ef4444',success:'#10b981',info:'#3b82f6'})[n.type]}22;color:${({warning:'#f59e0b',danger:'#ef4444',success:'#10b981',info:'#3b82f6'})[n.type]}">${n.icon}</div>
              <div>
                <p><strong>${esc(n.title)}</strong><br>${esc(n.message)}</p>
                <small>${DB.fmtDateTime(n.createdAt)}</small>
              </div>
              <span class="n-time">${App.timeAgo(n.createdAt)}</span>
            </div>`).join('')}
        </div>
      </div>
    `;
  },

  filterNotif(type) {
    document.querySelectorAll('[data-notif-type]').forEach(el => {
      const isUnreadFilter = type === 'unread';
      const matchType = isUnreadFilter ? !el.classList.contains('unread') === false ? true : el.classList.contains('unread') : el.dataset.notifType === type || type === 'all';
      el.style.display = (type === 'all') ? '' : (type === 'unread' ? (el.classList.contains('unread') ? '' : 'none') : (el.dataset.notifType === type ? '' : 'none'));
    });
  },

  /* ================= BACKUP ================= */
  backup() {
    const content = document.getElementById('pageContent');
    const totalRecords = Object.entries(DB.all() || {}).filter(([k]) => !['settings','meta'].includes(k)).reduce((s, [k, v]) => s + (Array.isArray(v) ? v.length : 0), 0);

    content.innerHTML = `
      ${App.pageHeader('💾', 'Backup', 'Backup, restore, dan kelola data sistem', `
        <button class="btn btn-danger" onclick="AdminPage.resetData()">${I.refresh} Reset Data</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.database}</div><span class="badge info dot">Total</span></div>
          <div class="kpi-label">Total Record Data</div>
          <div class="kpi-value">${DB.fmtNum(totalRecords)}</div>
          <div class="kpi-sub">${DB.get('products').length} produk · ${DB.get('movements').length} movement</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">Stabil</span></div>
          <div class="kpi-label">Status Sistem</div>
          <div class="kpi-value" style="font-size:18px">Healthy</div>
          <div class="kpi-sub">Semua layanan normal</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.database}</div><span class="badge accent dot">v2.4.0</span></div>
          <div class="kpi-label">Database Version</div>
          <div class="kpi-value" style="font-size:18px">${esc(DB.all()?.meta?.version || '-')}</div>
          <div class="kpi-sub">NexaWMS Pro</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">⬇️</span> Export Backup</h3><div class="ch-sub">Unduh seluruh data ke file JSON</div></div></div>
          <div class="dropzone" onclick="AdminPage.exportBackup()">
            <div class="dz-ic">💾</div>
            <p>Klik untuk mengunduh backup</p>
            <small>nexawms-backup-YYYY-MM-DD.json · ${DB.fmtNum(Math.round(JSON.stringify(DB.all() || {}).length / 1024))} KB</small>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">⬆️</span> Import Backup</h3><div class="ch-sub">Restore data dari file backup</div></div></div>
          <div class="dropzone" id="importDropzone" onclick="document.getElementById('importFile').click()">
            <div class="dz-ic">📥</div>
            <p>Klik untuk memilih file backup</p>
            <small>Format JSON dari NexaWMS Pro</small>
            <input type="file" id="importFile" accept=".json" style="display:none" onchange="AdminPage.importBackup(this.files[0])">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><h3><span class="ch-ic">🕘</span> Riwayat Backup</h3><div class="ch-sub">Backup otomatis & manual</div></div></div>
        ${tableHTML(
          [
            { label: 'Waktu' }, { label: 'Tipe' }, { label: 'Status' }, { label: 'Ukuran', right: true }
          ],
          [
            ['Sekarang', 'Manual', 'Siap', `${Math.round(JSON.stringify(DB.all() || {}).length / 1024)} KB`],
            ['Kemarin', 'Otomatis (Harian)', 'Selesai', '18.4 KB'],
            ['3 hari lalu', 'Otomatis (Harian)', 'Selesai', '18.2 KB'],
            ['1 minggu lalu', 'Otomatis (Mingguan)', 'Selesai', '18.0 KB']
          ].map(r => `
            <tr>
              ${td(DB.fmtDateTime(r[0] === 'Sekarang' ? DB.now() : DB.daysAgo(r[0] === 'Kemarin' ? 1 : r[0] === '3 hari lalu' ? 3 : 7)))}
              ${td(customBadge(r[1].includes('Otomatis') ? 'accent' : 'primary', r[1]))}
              ${td(customBadge('success', r[2]))}
              ${td(r[3], 'text-right num')}
            </tr>`).join('')
        )}
      </div>
    `;
  },

  exportBackup() {
    const date = DB.now().slice(0, 10);
    downloadFile(`nexawms-backup-${date}.json`, DB.exportJSON());
    DB.audit('export', 'backup', 'FULL', 'Export backup database lengkap', 'Admin');
    Toast.show('Backup berhasil diunduh', 'success');
  },

  importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        DB.importJSON(e.target.result);
        DB.audit('import', 'backup', 'RESTORE', 'Import backup database', 'Admin');
        Toast.show('Backup berhasil di-restore', 'success');
        setTimeout(() => location.reload(), 1200);
      } catch (err) {
        Toast.show(err.message, 'error');
      }
    };
    reader.readAsText(file);
  },

  resetData() {
    Modal.confirm({
      title: 'Reset Data Demo', icon: '⚠️', danger: true,
      message: 'Seluruh data akan direset ke kondisi awal demo. Semua perubahan yang Anda buat akan hilang.',
      yesText: 'Ya, Reset',
      onYes: () => {
        DB.reset();
        DB.audit('reset', 'database', 'FULL', 'Reset seluruh data demo', 'Admin');
        Toast.show('Data berhasil direset ke kondisi awal', 'success');
        setTimeout(() => location.reload(), 1200);
      }
    });
  },

  /* ================= API ================= */
  api() {
    const content = document.getElementById('pageContent');
    const keys = DB.get('apiKeys');

    content.innerHTML = `
      ${App.pageHeader('🔑', 'API', 'Kelola API keys & dokumentasi endpoint', `
        <button class="btn btn-primary" onclick="AdminPage.openApiKeyModal()">${I.plus} Buat API Key</button>
      `)}

      <div class="card">
        <div class="card-head"><div><h3><span class="ch-ic">🔑</span> API Keys</h3><div class="ch-sub">Kunci akses untuk integrasi sistem</div></div></div>
        ${tableHTML(
          [
            { label: 'Nama' }, { label: 'API Key' }, { label: 'Scope' },
            { label: 'Requests', right: true }, { label: 'Terakhir Digunakan' }, { label: 'Status' }, { label: 'Aksi', right: true }
          ],
          keys.map(k => `
            <tr>
              ${td(`<strong>${esc(k.name)}</strong>`)}
              ${td(`<span class="scan-badge" style="cursor:pointer" onclick="copyText('${esc(k.key)}')">${esc(k.key.slice(0, 18))}... ${I.copy}</span>`)}
              ${td(`<span style="font-size:11px;color:var(--text-2)">${esc(k.scope)}</span>`)}
              ${td(DB.fmtNum(k.requests), 'text-right num')}
              ${td(DB.fmtDateTime(k.lastUsed))}
              ${td(k.status === 'active' ? customBadge('success', 'Aktif') : customBadge('neutral', 'Revoked'))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                ${k.status === 'active'
                  ? `<button class="btn btn-danger btn-sm" onclick="AdminPage.revokeApiKey('${k.id}')">Revoke</button>`
                  : `<button class="btn btn-success btn-sm" onclick="AdminPage.activateApiKey('${k.id}')">Aktifkan</button>`}
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Belum ada API key'
        )}
      </div>

      <div class="card">
        <div class="card-head"><div><h3><span class="ch-ic">📘</span> Dokumentasi Endpoint</h3><div class="ch-sub">REST API — base URL: <span class="scan-badge">https://api.nexawms.com/v2</span></div></div></div>
        <div class="api-block">
          <div class="api-row"><span class="api-method get">GET</span><span class="api-path">/products</span><strong style="font-size:12.5px">Daftar Produk</strong></div>
          <p class="api-desc">Mengembalikan seluruh produk beserta stok, harga, dan lokasi. Mendukung pagination & filter.</p>
        </div>
        <div class="api-block">
          <div class="api-row"><span class="api-method get">GET</span><span class="api-path">/stock/{sku}</span><strong style="font-size:12.5px">Stok per SKU</strong></div>
          <p class="api-desc">Mengambil informasi stok real-time untuk satu produk berdasarkan SKU.</p>
        </div>
        <div class="api-block">
          <div class="api-row"><span class="api-method post">POST</span><span class="api-path">/receivings</span><strong style="font-size:12.5px">Buat Receiving</strong></div>
          <p class="api-desc">Membuat record receiving baru dan otomatis menambah stok ke inventory.</p>
        </div>
        <div class="api-block">
          <div class="api-row"><span class="api-method post">POST</span><span class="api-path">/issues</span><strong style="font-size:12.5px">Buat Issue</strong></div>
          <p class="api-desc">Membuat issue order fulfillment yang akan masuk ke workflow picking.</p>
        </div>
        <div class="api-block">
          <div class="api-row"><span class="api-method put">PUT</span><span class="api-path">/adjustments/{id}</span><strong style="font-size:12.5px">Approve Adjustment</strong></div>
          <p class="api-desc">Menyetujui penyesuaian stok yang menunggu approval.</p>
        </div>
        <div class="api-block">
          <div class="api-row"><span class="api-method delete">DELETE</span><span class="api-path">/reservations/{id}</span><strong style="font-size:12.5px">Cancel Reservasi</strong></div>
          <p class="api-desc">Membatalkan reservasi dan me-release stok kembali.</p>
        </div>
      </div>
    `;
  },

  openApiKeyModal() {
    Modal.open({
      title: 'Buat API Key', icon: '🔑',
      body: `
        <label class="field"><span>Nama Key</span><input id="apiName" placeholder="cth: ERP Integration"></label>
        <label class="field"><span>Scope</span>
          <select id="apiScope" multiple size="5" style="height:auto">
            <option selected>products.read</option>
            <option selected>stock.read</option>
            <option>operations.create</option>
            <option>reports.read</option>
            <option>issues.create</option>
          </select>
        </label>
        <small style="color:var(--text-3);font-size:11.5px">Tekan Ctrl (Windows) / Cmd (Mac) untuk memilih beberapa scope.</small>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="AdminPage.saveApiKey()">${I.check} Buat Key</button>`
    });
  },

  saveApiKey() {
    const name = document.getElementById('apiName').value.trim();
    if (!name) { Toast.show('Nama key wajib diisi', 'error'); return; }
    const scopes = [...document.getElementById('apiScope').selectedOptions].map(o => o.value).join(', ');
    const key = `nxw_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    DB.add('apiKeys', {
      id: DB.genId('KEY'),
      name,
      key,
      scope: scopes,
      lastUsed: null,
      status: 'active',
      createdAt: DB.now(),
      requests: 0
    });
    DB.notify('API Key Dibuat', `API key "${name}" berhasil dibuat`, 'success', '🔑');
    copyText(key);
    Toast.show('API key berhasil dibuat (disalin ke clipboard)', 'success');
    Modal.close();
    this.api();
  },

  revokeApiKey(id) {
    const k = DB.find('apiKeys', id);
    Modal.confirm({
      title: 'Revoke API Key', icon: '⚠️', danger: true,
      message: `Revoke API key "${k.name}"? Integrasi yang menggunakan key ini akan berhenti berfungsi.`,
      onYes: () => {
        DB.update('apiKeys', id, { status: 'revoked' });
        DB.audit('revoke', 'api', id, `Revoke API key ${k.name}`, 'Admin');
        Toast.show(`API key "${k.name}" di-revoke`, 'success');
        this.api();
      }
    });
  },

  activateApiKey(id) {
    DB.update('apiKeys', id, { status: 'active' });
    Toast.show('API key diaktifkan kembali', 'success');
    this.api();
  },

  /* ================= AUDIT LOG ================= */
  auditLog() {
    const content = document.getElementById('pageContent');
    const logs = [...DB.get('auditLogs')].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const actionMap = {
      login: ['primary', 'Login'], login_failed: ['danger', 'Login Gagal'],
      create: ['success', 'Create'], update: ['info', 'Update'],
      delete: ['danger', 'Delete'], approve: ['accent', 'Approve'],
      receive: ['warning', 'Receive'], export: ['accent', 'Export'],
      import: ['info', 'Import'], close: ['primary', 'Close'],
      generate: ['accent', 'Generate'], reset: ['danger', 'Reset'],
      complete: ['success', 'Complete'], cancel: ['neutral', 'Cancel'],
      revoke: ['danger', 'Revoke']
    };

    content.innerHTML = `
      ${App.pageHeader('📋', 'Audit Log', 'Jejak audit seluruh aktivitas sistem', `
        <button class="btn btn-ghost" onclick="AdminPage.exportAuditLog()">${I.download} Export</button>
      `)}

      <div class="toolbar">
        <div class="toolbar-search">
          ${I.search}
          <input id="auditSearch" placeholder="Cari user, aksi, entity..." oninput="AdminPage.filterAuditLog()">
        </div>
        <select id="auditType" onchange="AdminPage.filterAuditLog()">
          <option value="all">Semua Aksi</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="approve">Approve</option>
          <option value="login">Login</option>
          <option value="export">Export</option>
        </select>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Waktu</th><th>Aksi</th><th>Entity</th><th>ID</th>
              <th>Detail</th><th>User</th><th>IP</th>
            </tr></thead>
            <tbody>
              ${logs.map(l => {
                const [cls, label] = actionMap[l.action] || ['neutral', l.action];
                return `<tr class="audit-row" data-audit-type="${l.action}" data-audit-search="${esc((l.user + ' ' + l.action + ' ' + l.entity + ' ' + l.detail + ' ' + l.entityId).toLowerCase())}">
                  <td style="white-space:nowrap;font-size:12px">${DB.fmtDateTime(l.timestamp)}</td>
                  <td>${customBadge(cls, label)}</td>
                  <td>${esc(l.entity)}</td>
                  <td><span class="scan-badge">${esc(l.entityId)}</span></td>
                  <td style="max-width:320px;font-size:12.5px;color:var(--text-2)">${esc(l.detail)}</td>
                  <td><strong style="font-size:12px">${esc(l.user)}</strong></td>
                  <td><span style="font-family:monospace;font-size:11px;color:var(--text-3)">${esc(l.ip)}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterAuditLog() {
    const q = (document.getElementById('auditSearch').value || '').toLowerCase();
    const type = document.getElementById('auditType').value;
    document.querySelectorAll('.audit-row').forEach(tr => {
      const matchQ = !q || tr.dataset.auditSearch.includes(q);
      const matchT = type === 'all' || tr.dataset.auditType === type;
      tr.style.display = matchQ && matchT ? '' : 'none';
    });
  },

  exportAuditLog() {
    exportExcel('nexawms-audit-log.xls', 'Audit Log',
      ['Waktu', 'Aksi', 'Entitas', 'ID', 'Detail', 'User'],
      DB.get('auditLogs').map(a => [
        a.timestamp ? DB.fmtDateTime(a.timestamp) : (a.createdAt ? DB.fmtDateTime(a.createdAt) : '-'),
        a.action, a.entity, a.entityId, a.detail, a.user || 'Admin'
      ])
    );
    DB.audit('export', 'audit', 'ALL', 'Export audit log (Excel)', 'Admin');
    Toast.show('Audit log berhasil diexport (Excel)', 'success');
  },

  /* ================= PROFILE ================= */
  profile() {
    const content = document.getElementById('pageContent');
    const admin = DB.get('users')[0];
    const role = DB.role(admin.roleId);

    content.innerHTML = `
      ${App.pageHeader('👤', 'Profile', 'Informasi akun & pengaturan pribadi', `
        <button class="btn btn-danger" onclick="App.logout()">${I.x} Logout</button>
      `)}

      <div class="grid-1-2">
        <div class="card" style="margin:0">
          <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px 0;margin-bottom:16px;border-bottom:1px solid var(--border)">
            <div class="avatar" style="width:84px;height:84px;font-size:28px;border-radius:50%;box-shadow:var(--glow-primary)">${esc(admin.avatar)}</div>
            <div style="text-align:center">
              <h3 style="font-size:19px;margin-bottom:4px">${esc(admin.name)}</h3>
              <span class="badge primary dot">${esc(role?.name || 'Administrator')}</span>
            </div>
            <span class="badge success dot">Online</span>
          </div>
          <div class="stat-list">
            ${[
              ['✉️', 'Email', admin.email],
              ['📱', 'Telepon', admin.phone],
              ['🕐', 'Terakhir Login', DB.fmtDateTime(admin.lastLogin || DB.now())],
              ['🏢', 'Perusahaan', DB.all()?.settings?.company || 'PT Nexa Logistics Indonesia']
            ].map(s => `
              <div class="stat-item">
                <div class="si-ic">${s[0]}</div>
                <div class="si-info"><div class="si-label">${s[1]}</div><div class="si-value" style="font-size:13.5px">${s[2]}</div></div>
              </div>`).join('')}
          </div>
          <div style="margin-top:18px;padding-top:18px;border-top:1px solid var(--border)">
            <button class="btn btn-outline btn-block" onclick="AdminPage.editProfile()">${I.edit} Edit Profile</button>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card-head"><div><h3><span class="ch-ic">🛡️</span> Hak Akses Saya</h3><div class="ch-sub">${esc(role?.description || '')}</div></div></div>
            <div class="grid-2" style="gap:8px">
              ${Object.entries(role?.permissions || {}).map(([mod, perms]) => `
                <div style="padding:10px;background:rgba(99,102,241,.05);border-radius:8px;border:1px solid rgba(99,102,241,.1)">
                  <div style="font-size:12.5px;font-weight:700;margin-bottom:5px">${mod.charAt(0).toUpperCase() + mod.slice(1)}</div>
                  <div style="display:flex;gap:5px;flex-wrap:wrap">
                    ${perms.map(p => `<span class="badge ${p === 'view' ? 'info' : p === 'create' ? 'success' : p === 'edit' ? 'primary' : 'danger'} dot" style="font-size:10px;padding:2px 7px">${p}</span>`).join('')}
                  </div>
                </div>`).join('')}
            </div>
          </div>

          <div class="card">
            <div class="card-head"><div><h3><span class="ch-ic">⚙️</span> Preferensi</h3><div class="ch-sub">Pengaturan personal</div></div></div>
            <div class="stat-list">
              <label class="chk" style="justify-content:space-between;display:flex"><span>Notifikasi email</span><input type="checkbox" checked></label>
              <label class="chk" style="justify-content:space-between;display:flex"><span>Ringkasan harian</span><input type="checkbox" checked></label>
              <label class="chk" style="justify-content:space-between;display:flex"><span>Mode kompak</span><input type="checkbox"></label>
            </div>
            <div style="margin-top:18px;padding-top:18px;border-top:1px solid var(--border)">
              <button class="btn btn-primary btn-block" onclick="Toast.show('Preferensi berhasil disimpan','success')">${I.check} Simpan Preferensi</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  editProfile() {
    const admin = DB.get('users')[0];
    Modal.open({
      title: 'Edit Profile', icon: '👤',
      body: `
        <div class="form-grid">
          <label class="field"><span>Nama</span><input id="pfName" value="${esc(admin.name)}"></label>
          <label class="field"><span>Email</span><input id="pfEmail" type="email" value="${esc(admin.email)}"></label>
          <label class="field"><span>Telepon</span><input id="pfPhone" value="${esc(admin.phone)}"></label>
          <label class="field"><span>Password Baru</span><input id="pfPass" type="password" placeholder="••••••••"></label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="AdminPage.saveProfile()">${I.check} Simpan</button>`
    });
  },

  saveProfile() {
    const admin = DB.get('users')[0];
    const name = document.getElementById('pfName').value.trim();
    if (!name) { Toast.show('Nama wajib diisi', 'error'); return; }
    DB.update('users', admin.id, {
      name,
      email: document.getElementById('pfEmail').value,
      phone: document.getElementById('pfPhone').value,
      avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    });
    Toast.show('Profile berhasil diperbarui', 'success');
    Modal.close();
    this.profile();
  }
};