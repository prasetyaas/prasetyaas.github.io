/* ============================================
   AutoNexa — Operations Hub (Control Room)
   8 tools: Overview, Today's Schedule, Vehicle Queue,
   Pending Service, Business Insight, Recent Activity,
   Notification Center, Quick Action
   ============================================ */

const HubPage = {

  /* ==================== OVERVIEW (Control Room) ==================== */
  overview() {
    const content = document.getElementById('pageContent');
    const now = new Date();

    content.innerHTML = `
      ${App.pageHeader('🏭', 'Operations Hub', `Pusat kendali bengkel — ${DB.fmtDate(now.toISOString())}`, `
        <span class="stamp-code">SHIFT 07.00 – 15.00</span>
      `)}

      ${this._kpiStripHTML()}

      <div class="hub-grid">
        ${this._shiftBoardHTML()}

        <div>
          ${this._hotZoneHTML()}
          ${this._whatsNextHTML()}

          <div class="hub-cols">
            <div class="section">
              <div class="section-head">
                <div class="section-title">
                  <span class="st-ic">${I.clock}</span>
                  <h3>Jadwal Hari Ini</h3>
                </div>
                <div class="section-actions">
                  <button class="btn btn-sm btn-ghost" onclick="App.goTo('hub/schedule')">Semua →</button>
                </div>
              </div>
              <div class="panel">${this._todayTimelineHTML()}</div>
            </div>

            <div class="section">
              <div class="section-head">
                <div class="section-title">
                  <span class="st-ic">${I.activity}</span>
                  <h3>Aktivitas Terakhir</h3>
                </div>
                <div class="section-actions">
                  <button class="btn btn-sm btn-ghost" onclick="App.goTo('hub/activity')">Semua →</button>
                </div>
              </div>
              <div class="panel">${this._activityTimelineHTML()}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* ==================== TODAY'S SCHEDULE ==================== */
  schedule() {
    const content = document.getElementById('pageContent');
    const wos = [...DB.get('workOrders')].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const activeWOs = wos.filter(wo => !['done', 'cancelled'].includes(wo.status));
    const now = new Date();
    const s = (DB.all().settings || {});

    // Group by status for schedule rail
    const groups = [
      { label: 'Menunggu', filter: wo => wo.status === 'waiting', cls: 'waiting' },
      { label: 'Inspeksi / Estimasi', filter: wo => ['inspection', 'estimate'].includes(wo.status), cls: 'inspection' },
      { label: 'Berjalan', filter: wo => wo.status === 'work', cls: 'work' },
      { label: 'QC', filter: wo => wo.status === 'qc', cls: 'qc' },
      { label: 'Selesai', filter: wo => wo.status === 'done', cls: 'done' }
    ];

    // Bay slots
    const baySlots = [];
    const bayCount = s.bayCount || 4;
    for (let i = 1; i <= bayCount; i++) {
      const woInBay = activeWOs.find(wo => wo.baySlot === i);
      baySlots.push(woInBay ? { slot: i, wo: woInBay, empty: false } : { slot: i, wo: null, empty: true });
    }

    content.innerHTML = `
      ${App.pageHeader('📅', "Today's Schedule", 'Jadwal & slot pengerjaan hari ini', `
        <button class="btn btn-accent" onclick="ServicePage.createWO()">${I.plus} WO Baru</button>
      `)}

      <!-- Bay schedule banner -->
      <div class="pipeline" style="margin-bottom:20px">
        ${baySlots.map(b => {
          if (b.empty) {
            return `
              <div class="pipe-stage">
                <div class="pipe-dot" style="border-style:dashed">○</div>
                <div class="pipe-label">BAY ${b.slot}</div>
                <div class="pipe-count">Kosong</div>
              </div>
            `;
          }
          const v = DB.vehicleInfo(b.wo.vehicleId);
          const isLate = new Date(b.wo.estimatedDone) < now;
          return `
            <div class="pipe-stage ${isLate ? 'active' : ''}">
              <div class="pipe-dot" style="background:${isLate ? 'var(--danger)' : 'var(--accent)'};border-color:${isLate ? 'var(--danger)' : 'var(--accent)'};color:${isLate ? '#fff' : 'var(--primary-3)'}">${b.slot}</div>
              <div class="pipe-label">BAY ${b.slot}</div>
              <div class="pipe-count">${esc(v.plate)}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Schedule groups -->
      ${groups.map(g => {
        const items = wos.filter(g.filter);
        if (!items.length) return '';
        return `
          <div class="section">
            <div class="section-head">
              <div class="section-title">
                <span class="st-ic">${I.clock}</span>
                <h3>${g.label}</h3>
                <span class="count">${items.length}</span>
              </div>
            </div>
            ${items.map(wo => {
              const v = DB.vehicleInfo(wo.vehicleId);
              const c = DB.customer(wo.customerId);
              const isLate = !['done','cancelled'].includes(wo.status) && new Date(wo.estimatedDone) < now;
              return `
                <div class="wo-card status-${isLate ? 'critical' : g.cls}" onclick="App.goTo('service/workqueue')">
                  <div class="wo-top">
                    <span class="wo-no">${esc(wo.number)}</span>
                    <span class="wo-vehicle">${esc(v.model)}</span>
                    <span class="wo-plate">${esc(v.plate)}</span>
                    <span style="margin-left:auto">${statusBadge(wo.status)}</span>
                  </div>
                  <div class="wo-mid">
                    <span>${I.user} ${esc(c ? c.name : '-')}</span>
                    <span>${I.alert} ${esc(wo.complaint)}</span>
                    ${wo.baySlot ? `<span>BAY ${wo.baySlot}</span>` : ''}
                  </div>
                  <div class="wo-bottom">
                    <span class="td-sub">Masuk: ${DB.fmtDateShort(wo.createdAt)}${isLate ? ' · <strong style="color:var(--danger)">Terlambat</strong>' : ''}</span>
                    <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();ServicePage.showWODetail('${wo.id}')">Detail</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('') || '<div class="panel"><div class="empty-state"><div class="es-ic">📭</div><p>Tidak ada jadwal hari ini</p></div></div>'}
    `;
  },

  /* ==================== VEHICLE QUEUE ==================== */
  queue() {
    const content = document.getElementById('pageContent');
    const queue = DB.get('workOrders').filter(wo => ['waiting', 'inspection', 'estimate'].includes(wo.status));
    const now = new Date();

    content.innerHTML = `
      ${App.pageHeader('🚗', 'Vehicle Queue', 'Kendaraan yang sedang menunggu giliran', `
        <button class="btn btn-accent" onclick="ServicePage.createWO()">${I.plus} WO Baru</button>
      `)}

      <div class="kpi-strip">
        <div class="kpi-cell"><span class="kc-label">Menunggu</span><span class="kc-value">${queue.filter(wo => wo.status === 'waiting').length}</span></div>
        <div class="kpi-cell"><span class="kc-label">Inspeksi</span><span class="kc-value">${queue.filter(wo => wo.status === 'inspection').length}</span></div>
        <div class="kpi-cell"><span class="kc-label">Estimasi</span><span class="kc-value">${queue.filter(wo => wo.status === 'estimate').length}</span></div>
        <div class="kpi-cell"><span class="kc-label">Total Antrean</span><span class="kc-value">${queue.length}</span></div>
      </div>

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.car}</span>
            <h3>Antrean Kendaraan</h3>
            <span class="count">${queue.length}</span>
          </div>
        </div>

        ${queue.length ? queue.map(wo => {
          const v = DB.vehicleInfo(wo.vehicleId);
          const c = DB.customer(wo.customerId);
          const waitingTime = Math.max(0, Math.floor((now - new Date(wo.createdAt)) / 3600000));
          return `
            <div class="wo-card status-${esc(wo.status)}" onclick="ServicePage.showWODetail('${wo.id}')">
              <div class="wo-top">
                <span class="wo-no">${esc(wo.number)}</span>
                <span class="wo-vehicle">${esc(v.brand)} ${esc(v.model)}</span>
                <span class="wo-plate">${esc(v.plate)}</span>
                <span style="margin-left:auto">${statusBadge(wo.status)}</span>
              </div>
              <div class="wo-mid">
                <span>${I.user} ${esc(c ? c.name : '-')}</span>
                <span>${I.alert} ${esc(wo.complaint)}</span>
              </div>
              <div class="wo-bottom">
                <span class="td-sub">Menunggu ${waitingTime} jam sejak ${DB.fmtTime(wo.createdAt)}</span>
                <button class="btn btn-sm btn-accent" onclick="event.stopPropagation();App.goTo('service/inspection')">Proses</button>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="panel"><div class="empty-state"><div class="es-ic">✓</div><p>Antrean kosong — semua kendaraan diproses</p></div></div>
        `}
      </div>
    `;
  },

  /* ==================== PENDING SERVICE ==================== */
  pending() {
    const content = document.getElementById('pageContent');
    const now = new Date();
    const overdue = DB.get('workOrders').filter(wo =>
      !['done', 'cancelled'].includes(wo.status) && new Date(wo.estimatedDone) < now
    );
    const waiting = DB.get('workOrders').filter(wo => wo.status === 'waiting');
    const qc = DB.get('workOrders').filter(wo => wo.status === 'qc');
    const paymentsPending = DB.get('payments').filter(p => p.status === 'pending');
    const lowParts = DB.lowStockParts();

    const sections = [
      { icon: '⏰', title: 'Terlambat dari Estimasi', items: overdue, count: overdue.length, cls: 'critical', action: 'workqueue' },
      { icon: '🚗', title: 'Menunggu Penugasan', items: waiting, count: waiting.length, cls: 'waiting', action: 'workqueue' },
      { icon: '✔', title: 'Menunggu Quality Check', items: qc, count: qc.length, cls: 'qc', action: 'workqueue' },
      { icon: '💳', title: 'Pembayaran Tertunda', items: paymentsPending, count: paymentsPending.length, cls: 'waiting', action: 'analytics/revenue' },
      { icon: '📦', title: 'Stok Menipis', items: lowParts, count: lowParts.length, cls: 'waiting', action: 'resources/inventory' }
    ];

    content.innerHTML = `
      ${App.pageHeader('⚠️', 'Pending Service', 'Semua pekerjaan yang membutuhkan perhatian', '')}

      ${sections.map(sec => {
        if (!sec.items.length) return '';
        return `
          <div class="section">
            <div class="section-head">
              <div class="section-title">
                <span class="st-ic">${I.alert}</span>
                <h3>${sec.title}</h3>
                <span class="count" style="color:var(--danger)">${sec.count}</span>
              </div>
              <button class="btn btn-sm btn-ghost" onclick="App.goTo('${sec.action}')">Lihat →</button>
            </div>
            <div class="panel">
              ${sec.items.slice(0, 5).map(item => {
                if (item.workOrderId) {
                  const wo = DB.find('workOrders', item.workOrderId) || item;
                  const v = DB.vehicleInfo(wo.vehicleId);
                  return `
                    <div class="tl-item">
                      <div class="tl-time">${DB.fmtDateShort(item.paidAt || wo.createdAt)}</div>
                      <div class="tl-body">
                        <strong>${esc(wo.number)}</strong> — ${esc(v.plate)} · ${DB.fmtMoney(item.amount || wo.estimatedCost)}
                      </div>
                    </div>
                  `;
                }
                if (item.sku) {
                  return `
                    <div class="tl-item">
                      <div class="tl-time">RAK ${esc(item.location)}</div>
                      <div class="tl-body">
                        <strong>${esc(item.name)}</strong> — stok ${item.stock} < ${item.minStock}
                      </div>
                    </div>
                  `;
                }
                const v = DB.vehicleInfo(item.vehicleId);
                return `
                  <div class="tl-item">
                    <div class="tl-time">${DB.fmtDateShort(item.createdAt)}</div>
                    <div class="tl-body">
                      <strong>${esc(item.number)}</strong> — ${esc(v.plate)} · ${esc(item.complaint)}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('') || '<div class="panel"><div class="empty-state"><div class="es-ic">🎉</div><p>Semua pekerjaan lancar — tidak ada yang tertunda</p></div></div>'}
    `;
  },

  /* ==================== BUSINESS INSIGHT ==================== */
  insight() {
    const content = document.getElementById('pageContent');
    const revenue = DB.revenue();
    const wosDone = DB.get('workOrders').filter(wo => wo.status === 'done').length;
    const avgRevenue = wosDone ? Math.round(revenue / wosDone) : 0;
    const todayRevenue = DB.revenueByRange('today');
    const totalUnits = DB.totalPartStock();
    const totalValue = DB.totalPartValue();
    const activeWOs = DB.activeWOs();

    // Mechanic top performers
    const mechStats = DB.get('mechanics').map(m => {
      const done = DB.get('workOrders').filter(wo => wo.mechanicId === m.id && wo.status === 'done');
      const total = done.reduce((s, wo) => s + wo.estimatedCost, 0);
      return { ...m, doneCount: done.length, total };
    }).sort((a, b) => b.total - a.total);

    content.innerHTML = `
      ${App.pageHeader('📊', 'Business Insight', 'Ringkasan performa bisnis bengkel', '')}

      <!-- Gauge Card -->
      <div class="gauge-card">
        <div class="gc-label">TOTAL PENDAPATAN</div>
        <div class="gc-value">${DB.fmtMoney(revenue)}</div>
        <div class="gc-sub">${wosDone} servis selesai · rata-rata ${DB.fmtMoney(avgRevenue)} / servis</div>
        <div class="gc-delta" style="color:#4ade80">▲ 12.4% vs bulan lalu</div>
      </div>

      <div class="kpi-strip">
        <div class="kpi-cell"><span class="kc-label">Revenue Hari Ini</span><span class="kc-value">${DB.fmtMoney(Math.round(todayRevenue / 1000))}<small>rb</small></span></div>
        <div class="kpi-cell"><span class="kc-label">WO Aktif</span><span class="kc-value">${activeWOs}</span></div>
        <div class="kpi-cell"><span class="kc-label">Nilai Stok</span><span class="kc-value">${DB.fmtMoney(Math.round(totalValue / 1000))}<small>rb</small></span></div>
        <div class="kpi-cell"><span class="kc-label">Total Unit Part</span><span class="kc-value">${totalUnits}</span></div>
      </div>

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.trend}</span>
            <h3>Performa Mekanik</h3>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.goTo('analytics/performance')">Analytics →</button>
        </div>
        <div class="panel">
          <div class="rank-list">
            ${mechStats.map((m, i) => `
              <div class="rank-item">
                <span class="rank-no">${String(i + 1).padStart(2, '0')}</span>
                <span class="m-avatar">${esc(m.initials)}</span>
                <div class="rank-info">
                  <strong>${esc(m.name)}</strong>
                  <small>${esc(m.specialty)} · ${m.doneCount} servis selesai</small>
                </div>
                <div class="rank-bar-wrap">
                  <div class="rank-bar"><div style="width:${Math.max((m.total / Math.max(mechStats[0]?.total || 1, 1)) * 100, 4)}%"></div></div>
                </div>
                <span class="rank-val">${DB.fmtMoney(m.total)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* ==================== RECENT ACTIVITY ==================== */
  activity() {
    const content = document.getElementById('pageContent');
    const logs = [...DB.get('activityLogs')].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    content.innerHTML = `
      ${App.pageHeader('📜', 'Recent Activity', 'Semua aktivitas terbaru di sistem', `
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

  /* ==================== NOTIFICATION CENTER ==================== */
  notifications() {
    const content = document.getElementById('pageContent');
    const notifs = [...DB.get('notifications')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unread = notifs.filter(n => !n.read).length;

    content.innerHTML = `
      ${App.pageHeader('🔔', 'Notification Center', 'Semua notifikasi sistem', `
        ${unread ? `<button class="btn btn-accent" onclick="HubPage.markAllRead()">${I.check} Tandai Semua Dibaca</button>` : ''}
      `)}

      <div class="kpi-strip">
        <div class="kpi-cell"><span class="kc-label">Total Notifikasi</span><span class="kc-value">${notifs.length}</span></div>
        <div class="kpi-cell"><span class="kc-label">Belum Dibaca</span><span class="kc-value" style="color:${unread ? 'var(--warning)' : 'var(--text)'}">${unread}</span></div>
        <div class="kpi-cell"><span class="kc-label">Sudah Dibaca</span><span class="kc-value">${notifs.length - unread}</span></div>
      </div>

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.bell}</span>
            <h3>Daftar Notifikasi</h3>
            <span class="count">${notifs.length}</span>
          </div>
        </div>
        <div class="panel">
          ${notifs.length ? notifs.map(n => {
            const color = { warning: '#d97706', danger: '#dc2626', success: '#16a34a', info: '#2563eb' }[n.type] || '#1f2937';
            return `
              <div class="tl-item ${n.read ? '' : ''}" style="${n.read ? 'opacity:.6' : ''}">
                <div class="tl-time">${DB.fmtDateTime(n.createdAt)}</div>
                <div class="notif-ic" style="background:${color}15;color:${color}">${n.icon}</div>
                <div class="tl-body">
                  <strong>${esc(n.title)}</strong> — ${esc(n.message)}
                  <span class="tl-tag" style="background:${n.read ? 'var(--neutral-soft)' : 'var(--primary-soft)'};color:${n.read ? 'var(--text-3)' : 'var(--primary)'}">${n.read ? 'Dibaca' : 'Baru'}</span>
                </div>
                <button class="btn btn-sm btn-ghost" onclick="HubPage.toggleNotif('${n.id}')" style="margin-left:auto">${n.read ? 'Tandai Belum' : 'Tandai Dibaca'}</button>
              </div>
            `;
          }).join('') : '<div class="empty-state"><div class="es-ic">🔔</div><p>Tidak ada notifikasi</p></div>'}
        </div>
      </div>
    `;
  },

  toggleNotif(id) {
    const n = DB.find('notifications', id);
    if (!n) return;
    DB.update('notifications', id, { read: !n.read });
    App.updateNotif();
    this.notifications();
  },

  markAllRead() {
    DB.get('notifications').forEach(n => DB.update('notifications', n.id, { read: true }));
    App.updateNotif();
    Toast.show('Semua notifikasi ditandai dibaca', 'success');
    this.notifications();
  },

  /* ==================== QUICK ACTION ==================== */
  quickAction() {
    const content = document.getElementById('pageContent');

    const actions = [
      { icon: I.clipboard, title: 'Buat Work Order', desc: 'Check-in kendaraan pelanggan baru', cls: 'btn-accent', fn: "ServicePage.createWO()", btn: 'Buat WO' },
      { icon: I.plus, title: 'Stok Masuk', desc: 'Restok spare part / pembelian baru', cls: 'btn-primary', fn: "ResourcesPage.stockInModal()", btn: 'Stok Masuk' },
      { icon: I.box, title: 'Tambah Part Baru', desc: 'Daftarkan spare part baru ke katalog', cls: 'btn-primary', fn: "ResourcesPage.addPart()", btn: 'Part Baru' },
      { icon: I.user, title: 'Tambah Customer', desc: 'Daftarkan pelanggan baru', cls: 'btn-primary', fn: "ResourcesPage.addCustomer()", btn: 'Customer Baru' },
      { icon: I.car, title: 'Tambah Kendaraan', desc: 'Daftarkan kendaraan baru pelanggan', cls: 'btn-primary', fn: "ResourcesPage.addVehicle()", btn: 'Kendaraan' },
      { icon: I.wrench, title: 'Tambah Mekanik', desc: 'Rekrut mekanik baru', cls: 'btn-primary', fn: "ResourcesPage.addMechanic()", btn: 'Mekanik' }
    ];

    content.innerHTML = `
      ${App.pageHeader('⚡', 'Quick Action', 'Aksi cepat untuk tugas sehari-hari', '')}

      <div class="rak-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
        ${actions.map(a => `
          <div class="rak-card" onclick="${a.fn}" style="cursor:pointer;display:flex;flex-direction:column;gap:8px;min-height:150px">
            <div class="report-ic" style="background:var(--primary-soft);color:var(--primary)">${a.icon}</div>
            <div class="rak-name" style="padding-right:0">${esc(a.title)}</div>
            <div class="td-sub" style="flex:1">${esc(a.desc)}</div>
            <button class="btn btn-sm ${a.cls}" onclick="event.stopPropagation();${a.fn}">${esc(a.btn)} →</button>
          </div>
        `).join('')}
      </div>
    `;
  },

  /* ==================== SHARED HELPERS ==================== */
  _kpiStripHTML() {
    const activeWOs = DB.activeWOs();
    const waiting = DB.waitingCount();
    const working = DB.workCount();
    const overdue = DB.overdueCount();
    const lowParts = DB.lowStockParts().length;
    const todayRevenue = DB.revenueByRange('today');

    return `
      <div class="kpi-strip">
        <div class="kpi-cell"><span class="kc-label">WO Aktif</span><span class="kc-value">${activeWOs}</span></div>
        <div class="kpi-cell"><span class="kc-label">Antrean</span><span class="kc-value">${waiting}</span></div>
        <div class="kpi-cell"><span class="kc-label">Dikerjakan</span><span class="kc-value">${working}</span></div>
        <div class="kpi-cell"><span class="kc-label">Terlambat</span><span class="kc-value" style="color:${overdue ? 'var(--danger)' : 'var(--text)'}">${overdue}</span></div>
        <div class="kpi-cell"><span class="kc-label">Part Menipis</span><span class="kc-value" style="color:${lowParts ? 'var(--warning)' : 'var(--text)'}">${lowParts}</span></div>
        <div class="kpi-cell"><span class="kc-label">Revenue Hari Ini</span><span class="kc-value">${DB.fmtMoney(Math.round(todayRevenue / 1000))}<small>rb</small></span></div>
      </div>
    `;
  },

  _shiftBoardHTML() {
    const now = new Date();
    const wos = DB.get('workOrders');
    const activeWOs = wos.filter(wo => !['done', 'cancelled'].includes(wo.status));
    const s = DB.all().settings || {};
    const bayCount = s.bayCount || 4;

    const bays = [];
    for (let i = 1; i <= bayCount; i++) {
      const woInBay = activeWOs.find(wo => wo.baySlot === i);
      bays.push(woInBay
        ? { slot: i, icon: '🔧', cls: 'busy', plate: DB.vehicleInfo(woInBay.vehicleId).plate }
        : { slot: i, icon: '●', cls: 'avail', plate: 'Kosong' }
      );
    }

    return `
      <aside class="shift-board">
        <div class="shift-head">
          <div>
            <div class="shift-clk">${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}</div>
            <div class="shift-sub">${now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
        </div>
        <div class="safety-strip"></div>

        <div class="shift-section">
          <strong>BAY KENDARAAN (${bayCount})</strong>
          ${bays.map(b => `
            <div class="shift-row">
              <span class="slot-ic ${b.cls}">${b.icon}</span>
              <strong>BAY ${b.slot}</strong>
              <span>${esc(b.plate)}</span>
            </div>
          `).join('')}
        </div>

        <div class="shift-section">
          <strong>MEKANIK BERTUGAS</strong>
          ${DB.get('mechanics').map(m => `
            <div class="shift-row">
              <span class="slot-ic ${m.status === 'available' ? 'avail' : m.status === 'busy' ? 'busy' : 'wait'}">${esc(m.initials)}</span>
              <strong style="width:auto">${esc(m.name.split(' ')[0])}</strong>
              <span>${m.status === 'available' ? 'Siap' : m.status === 'busy' ? 'Sibuk' : 'Libur'}</span>
            </div>
          `).join('')}
        </div>
      </aside>
    `;
  },

  _hotZoneHTML() {
    const now = new Date();
    const wos = DB.get('workOrders');
    const activeWOs = wos.filter(wo => !['done', 'cancelled'].includes(wo.status));
    const overdue = DB.overdueCount();
    const waiting = DB.waitingCount();
    const working = DB.workCount();

    const overdueList = activeWOs.filter(wo => new Date(wo.estimatedDone) < now).slice(0, 3);
    const waitingList = wos.filter(wo => wo.status === 'waiting').slice(0, 3);
    const workList = wos.filter(wo => wo.status === 'work').slice(0, 3);

    return `
      <div class="hot-zone">
        <div class="hot-card critical">
          <div class="hot-head">
            <span class="hot-label">Terlambat</span>
            <span class="hot-val">${overdue}</span>
          </div>
          <div class="hot-desc">Melewati estimasi</div>
          <div class="hot-list">
            ${overdueList.length ? overdueList.map(wo => {
              const v = DB.vehicleInfo(wo.vehicleId);
              return `<div class="hot-item"><span class="bubble" style="background:var(--danger)"></span>${esc(wo.number)} · ${esc(v.plate)}</div>`;
            }).join('') : '<div class="hot-item" style="color:var(--text-3)">Tidak ada → semua tepat waktu</div>'}
          </div>
        </div>
        <div class="hot-card waiting">
          <div class="hot-head">
            <span class="hot-label">Menunggu</span>
            <span class="hot-val">${waiting}</span>
          </div>
          <div class="hot-desc">Antrean belum ditugaskan</div>
          <div class="hot-list">
            ${waitingList.length ? waitingList.map(wo => {
              const v = DB.vehicleInfo(wo.vehicleId);
              return `<div class="hot-item"><span class="bubble" style="background:var(--warning)"></span>${esc(wo.number)} · ${esc(v.plate)}</div>`;
            }).join('') : '<div class="hot-item" style="color:var(--text-3)">Antrean kosong</div>'}
          </div>
        </div>
        <div class="hot-card running">
          <div class="hot-head">
            <span class="hot-label">Berjalan</span>
            <span class="hot-val">${working}</span>
          </div>
          <div class="hot-desc">Sedang dikerjakan</div>
          <div class="hot-list">
            ${workList.length ? workList.map(wo => {
              const v = DB.vehicleInfo(wo.vehicleId);
              return `<div class="hot-item"><span class="bubble" style="background:var(--success)"></span>${esc(wo.number)} · ${esc(v.plate)}</div>`;
            }).join('') : '<div class="hot-item" style="color:var(--text-3)">Tidak ada pekerjaan</div>'}
          </div>
        </div>
      </div>
    `;
  },

  _whatsNextHTML() {
    const overdue = DB.overdueCount();
    const waiting = DB.waitingCount();
    const lowParts = DB.lowStockParts();
    const working = DB.workCount();

    const whatsNext = [];
    if (overdue > 0) whatsNext.push({ icon: '⏰', text: `<strong>${overdue} pekerjaan terlambat</strong> — segera cek prioritas`, go: 'service/workqueue', goLabel: 'Review' });
    if (waiting > 0) whatsNext.push({ icon: '🚗', text: `<strong>${waiting} kendaraan menunggu</strong> di antrean — tugaskan mekanik`, go: 'service/workqueue', goLabel: 'Assign' });
    if (lowParts.length > 0) whatsNext.push({ icon: '📦', text: `<strong>${lowParts.length} part menipis</strong> — segera restock`, go: 'resources/inventory', goLabel: 'Restock' });
    if (working > 0) whatsNext.push({ icon: '🔧', text: `<strong>${working} pekerjaan berjalan</strong> — pantau progres di line`, go: 'service/progress', goLabel: 'Monitor' });
    if (!whatsNext.length) whatsNext.push({ icon: '✅', text: `<strong>Semua berjalan lancar.</strong> Tidak ada aksi mendesak.`, go: '', goLabel: '' });

    return `
      <div class="whats-next">
        <div class="wn-label">Yang harus dilakukan selanjutnya</div>
        ${whatsNext.map(w => `
          <div class="wn-item">
            <span class="wn-ic">${w.icon}</span>
            <span>${w.text}</span>
            ${w.go ? `<a href="#" class="wn-go" onclick="App.goTo('${w.go}');return false;">${w.goLabel} →</a>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  _todayTimelineHTML() {
    const now = new Date();
    const wos = [...DB.get('workOrders')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7);

    return `
      <div class="timeline">
        ${wos.map(wo => {
          const v = DB.vehicleInfo(wo.vehicleId);
          const isLate = !['done','cancelled'].includes(wo.status) && new Date(wo.estimatedDone) < now;
          return `
            <div class="tl-item" onclick="App.goTo('service/workqueue')" style="cursor:pointer">
              <div class="tl-time">${DB.fmtTime(wo.createdAt)}</div>
              <div class="tl-body">
                <strong>${esc(wo.number)}</strong> — ${esc(v.plate)} · ${esc(v.model)}
                <span class="tl-tag" style="color:${isLate ? 'var(--danger)' : 'var(--success)'}">${isLate ? 'Terlambat' : esc(wo.status)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  _activityTimelineHTML() {
    const logs = [...DB.get('activityLogs')].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6);

    return `
      <div class="timeline">
        ${logs.map(l => `
          <div class="tl-item">
            <div class="tl-time">${DB.fmtTime(l.timestamp)}</div>
            <div class="tl-body">
              <strong>${esc(l.user)}</strong> — ${esc(l.detail)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};

/* Backward compat: keep render() pointing to overview() */
HubPage.render = HubPage.overview;