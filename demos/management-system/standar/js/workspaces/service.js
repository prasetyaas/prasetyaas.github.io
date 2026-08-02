/* ============================================
   AutoNexa — Service Operations (Workflow Line)
   ============================================ */

const ServicePage = {

  /* ---------- PIPELINE STAGES ---------- */
  stages: ['waiting', 'inspection', 'estimate', 'work', 'qc', 'done'],
  _activeStage: null,
  _selectedWoId: null,

  /* ==================== SERVICE ORDER ==================== */
  order() {
    const content = document.getElementById('pageContent');
    this._activeStage = null;
    const wos = DB.get('workOrders').filter(wo => wo.status !== 'cancelled');

    content.innerHTML = `
      ${App.pageHeader('📋', 'Service Order', 'Daftar semua work order di bengkel', `
        <button class="btn btn-accent" onclick="ServicePage.createWO()">${I.plus} WO Baru</button>
      `)}

      ${this.pipelineHTML(wos)}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.clipboard}</span>
            <h3>Semua Work Order</h3>
            <span class="count">${wos.length}</span>
          </div>
        </div>
        ${tableHTML(
          [
            { label: 'Nomor' },
            { label: 'Pelanggan' },
            { label: 'Kendaraan' },
            { label: 'Keluhan' },
            { label: 'Mekanik' },
            { label: 'Estimasi' },
            { label: 'Status' },
            { label: 'Aksi', right: true }
          ],
          wos.map(wo => `
            <tr>
              ${td(`<span class="td-main">${esc(wo.number)}</span>`)}
              ${td(esc(DB.customerName(wo.customerId)))}
              ${td(`<span class="td-plate">${esc(DB.vehicleInfo(wo.vehicleId).plate)}</span> <span class="td-sub">${esc(DB.vehicleInfo(wo.vehicleId).model)}</span>`)}
              ${td(`<span class="td-sub">${esc(wo.complaint)}</span>`)}
              ${td(esc(DB.mechanicName(wo.mechanicId)))}
              ${td(`<span class="text-right">${DB.fmtMoney(wo.estimatedCost)}</span>`)}
              ${td(statusBadge(wo.status))}
              ${td(`<div class="row-actions">
                <button class="icon-btn" title="Detail" onclick="ServicePage.showWODetail('${wo.id}')">${I.eye}</button>
              </div>`)}
            </tr>
          `)
        )}
      </div>
    `;
  },

  createWO() {
    const customers = DB.get('customers');
    const mechanics = DB.get('mechanics');

    Modal.open({
      title: 'Buat Work Order Baru',
      icon: '📋',
      size: 'lg',
      body: `
        <div class="form-grid">
          <label class="field">
            <span>Pelanggan</span>
            <select id="woCustomer" class="input" onchange="ServicePage.loadVehicles(this.value)">
              <option value="">— Pilih Pelanggan —</option>
              ${customers.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Kendaraan</span>
            <select id="woVehicle" class="input">
              <option value="">— Pilih Kendaraan —</option>
            </select>
          </label>
          <label class="field full">
            <span>Keluhan / Pekerjaan</span>
            <textarea id="woComplaint" class="input" placeholder="Deskripsi keluhan atau pekerjaan yang diminta…"></textarea>
          </label>
          <label class="field">
            <span>Mekanik</span>
            <select id="woMechanic" class="input">
              <option value="">— Belum ditugaskan —</option>
              ${mechanics.map(m => `<option value="${m.id}">${esc(m.name)} — ${esc(m.specialty)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Estimasi Biaya (Rp)</span>
            <input id="woEstimate" class="input" type="number" placeholder="500000">
          </label>
        </div>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="woSaveBtn">Simpan WO</button>
      `
    });

    document.getElementById('woSaveBtn').onclick = () => this._saveWO();
  },

  loadVehicles(customerId) {
    const sel = document.getElementById('woVehicle');
    const vehicles = DB.get('vehicles').filter(v => v.customerId === customerId);
    sel.innerHTML = vehicles.length
      ? vehicles.map(v => `<option value="${v.id}">${esc(v.plate)} — ${esc(v.brand)} ${esc(v.model)}</option>`).join('')
      : '<option value="">— Tidak ada kendaraan —</option>';
  },

  _saveWO() {
    const customerId = document.getElementById('woCustomer').value;
    const vehicleId = document.getElementById('woVehicle').value;
    const complaint = document.getElementById('woComplaint').value.trim();
    const mechanicId = document.getElementById('woMechanic').value || null;
    const estimate = parseInt(document.getElementById('woEstimate').value) || 0;

    if (!customerId || !vehicleId || !complaint) {
      Toast.show('Lengkapi pelanggan, kendaraan, dan keluhan', 'warning');
      return;
    }

    const number = DB.genWO();
    DB.add('workOrders', {
      id: number,
      number,
      customerId,
      vehicleId,
      mechanicId,
      status: 'waiting',
      baySlot: null,
      complaint,
      estimatedCost: estimate,
      createdAt: DB.now(),
      estimatedDone: DB.daysAhead(1),
      progress: 0
    });
    DB.log('create', 'workOrder', number, `Membuat WO baru — ${complaint}`);
    DB.notify('WO Baru', `${number} masuk antrean — ${complaint}`, 'info', '📋');
    Modal.close();
    Toast.show(`WO ${number} berhasil dibuat`, 'success');
    this.order();
  },

  /* ==================== VEHICLE INSPECTION ==================== */
  inspection() {
    const content = document.getElementById('pageContent');
    this._activeStage = 'inspection';
    const allWos = DB.get('workOrders');
    const wos = allWos.filter(wo => ['waiting', 'inspection', 'estimate'].includes(wo.status));

    content.innerHTML = `
      ${App.pageHeader('🔍', 'Vehicle Inspection', 'Periksa kondisi kendaraan sebelum pengerjaan', `
        <button class="btn btn-accent" onclick="ServicePage.createWO()">${I.plus} WO Baru</button>
      `)}

      ${this.pipelineHTML(allWos)}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.checklist}</span>
            <h3>Menunggu Inspeksi</h3>
            <span class="count">${wos.length}</span>
          </div>
        </div>
        ${wos.length ? wos.map(wo => {
          const v = DB.vehicleInfo(wo.vehicleId);
          const c = DB.customer(wo.customerId);
          return `
            <div class="wo-card status-${esc(wo.status)}" onclick="ServicePage.showWODetail('${wo.id}')">
              <div class="wo-top">
                <span class="wo-no">${esc(wo.number)}</span>
                <span class="wo-vehicle">${esc(v.model)}</span>
                <span class="wo-plate">${esc(v.plate)}</span>
                <span style="margin-left:auto">${statusBadge(wo.status)}</span>
              </div>
              <div class="wo-mid">
                <span>${I.user} ${esc(c ? c.name : '-')}</span>
                <span>${I.alert} ${esc(wo.complaint)}</span>
              </div>
              <div class="wo-bottom">
                <span class="stamp-code">${DB.fmtDateShort(wo.createdAt)}</span>
                <button class="btn btn-sm btn-accent" onclick="event.stopPropagation();ServicePage.startInspection('${wo.id}')">Mulai Inspeksi</button>
              </div>
            </div>
          `;
        }).join('') : '<div class="panel"><div class="empty-state"><div class="es-ic">✅</div><p>Semua kendaraan sudah diinspeksi</p></div></div>'}
      </div>
    `;
  },

  startInspection(woId) {
    const wo = DB.find('workOrders', woId);
    if (!wo) return;
    DB.update('workOrders', woId, { status: 'inspection', progress: Math.max(wo.progress, 10) });
    DB.log('update', 'workOrder', woId, `Status berubah ke Inspeksi — ${wo.number}`);
    Toast.show(`Inspeksi dimulai — ${wo.number}`, 'success');
    this.inspection();
  },

  /* ==================== WORK QUEUE (MASTER-DETAIL) ==================== */
  workqueue() {
    const content = document.getElementById('pageContent');
    this._activeStage = 'work';
    const wos = DB.get('workOrders').filter(wo => ['waiting', 'inspection', 'estimate', 'work', 'qc'].includes(wo.status));
    const now = new Date();

    content.innerHTML = `
      ${App.pageHeader('🔧', 'Work Queue', 'Antrean pekerjaan aktif — pilih WO untuk lihat detail', `
        <button class="btn btn-accent" onclick="ServicePage.createWO()">${I.plus} WO Baru</button>
      `)}

      ${this.pipelineHTML(DB.get('workOrders'))}

      <div class="work-layout">
        <div>
          <div class="section-head">
            <div class="section-title">
              <span class="st-ic">${I.clock}</span>
              <h3>Antrean Aktif</h3>
              <span class="count">${wos.length}</span>
            </div>
          </div>
          ${wos.length ? wos.map(wo => {
            const v = DB.vehicleInfo(wo.vehicleId);
            const isLate = new Date(wo.estimatedDone) < now;
            const statusCls = isLate ? 'critical' : wo.status === 'work' ? 'work' : wo.status === 'waiting' ? 'waiting' : 'done';
            const progressPct = wo.progress || 0;
            const mech = DB.mechanic(wo.mechanicId);
            return `
              <div class="wo-card status-${statusCls} ${this._selectedWoId === wo.id ? 'selected' : ''}" onclick="ServicePage.selectWO('${wo.id}')">
                <div class="wo-top">
                  <span class="wo-no">${esc(wo.number)}</span>
                  <span class="wo-vehicle">${esc(v.model)}</span>
                  <span class="wo-plate">${esc(v.plate)}</span>
                  <span style="margin-left:auto">${statusBadge(wo.status)}</span>
                </div>
                <div class="wo-mid">
                  <span>${I.alert} ${esc(wo.complaint)}</span>
                  <span>${I.clock} ${isLate ? '<strong style="color:var(--danger)">Terlambat</strong>' : `Selesai ${DB.fmtDateShort(wo.estimatedDone)}`}</span>
                </div>
                <div class="wo-bottom">
                  <div class="wo-progress"><div style="width:${progressPct}%"></div></div>
                  <span class="wo-mechanic">
                    ${mech ? `<span class="m-avatar">${esc(mech.initials)}</span> ${esc(mech.name.split(' ')[0])}` : '<span style="color:var(--text-3);font-style:italic">Belum ditugaskan</span>'}
                  </span>
                </div>
              </div>
            `;
          }).join('') : '<div class="panel"><div class="empty-state"><div class="es-ic">🎉</div><p>Tidak ada antrean aktif</p></div></div>'}
        </div>

        <aside class="context-panel" id="contextPanel"></aside>
      </div>
    `;

    const target = this._selectedWoId ? DB.find('workOrders', this._selectedWoId) : (wos[0] || null);
    if (target && ['waiting','inspection','estimate','work','qc'].includes(target.status)) {
      this.renderContext(target.id);
    } else {
      document.getElementById('contextPanel').innerHTML = '<div class="cp-empty">Pilih work order untuk melihat detail</div>';
    }
  },

  selectWO(woId) {
    this._selectedWoId = woId;
    this.workqueue();
  },

  renderContext(woId) {
    const wo = DB.find('workOrders', woId);
    const panel = document.getElementById('contextPanel');
    if (!wo || !panel) return;

    const v = DB.vehicleInfo(wo.vehicleId);
    const c = DB.customer(wo.customerId);
    const mech = DB.mechanic(wo.mechanicId);
    const parts = DB.get('woParts').filter(p => p.workOrderId === wo.id);
    const mechanics = DB.get('mechanics');
    const now = new Date();
    const isLate = new Date(wo.estimatedDone) < now;
    const stageLabels = { waiting: 'Check-in', inspection: 'Inspeksi', estimate: 'Estimasi', work: 'Pengerjaan', qc: 'Quality Check', done: 'Selesai' };

    panel.innerHTML = `
      <div class="cp-head">
        <div>
          <div class="cp-wo">${esc(wo.number)}</div>
          <div class="cp-title">${esc(v.plate)} · ${esc(v.model)}</div>
        </div>
        ${statusBadge(wo.status)}
      </div>
      <div class="cp-body">
        <div class="cp-section">
          <strong>Informasi</strong>
          <div class="cp-row"><span>Pelanggan</span><strong>${esc(c ? c.name : '-')}</strong></div>
          <div class="cp-row"><span>Keluhan</span><strong>${esc(wo.complaint)}</strong></div>
          <div class="cp-row"><span>Estimasi</span><strong>${esc(DB.fmtMoney(wo.estimatedCost))}</strong></div>
          <div class="cp-row"><span>Deadline</span><strong style="color:${isLate ? 'var(--danger)' : 'inherit'}">${esc(DB.fmtDate(wo.estimatedDone))}${isLate ? ' ⚠️' : ''}</strong></div>
        </div>

        <div class="cp-section">
          <strong>Mekanik</strong>
          <div class="cp-row"><span>Ditugaskan</span><strong>${mech ? esc(mech.name) : 'Belum ada'}</strong></div>
          <select class="input" id="cpMechanic" onchange="ServicePage.assignMechanic('${wo.id}', this.value)" style="margin-top:8px">
            <option value="">— Tugaskan mekanik —</option>
            ${mechanics.map(m => `<option value="${m.id}" ${wo.mechanicId === m.id ? 'selected' : ''}>${esc(m.name)} (${esc(m.specialty)})</option>`).join('')}
          </select>
        </div>

        <div class="cp-section">
          <strong>Part yang Digunakan</strong>
          ${parts.length ? parts.map(p => {
            const part = DB.part(p.partId);
            const ready = part && part.stock >= p.qty;
            return `
              <div class="cp-part">
                <span class="pp-name">${esc(part ? part.name : '?')} ×${p.qty}</span>
                <span class="pp-status ${ready ? 'ready' : 'wait'}">${ready ? '✓ Ready' : '! Stok kurang'}</span>
              </div>
            `;
          }).join('') : '<div class="cp-row" style="color:var(--text-3);font-size:11.5px">Belum ada part terpakai</div>'}
        </div>

        <div class="cp-section">
          <strong>Timeline</strong>
          <div class="cp-timeline">
            ${this.stages.map(stage => {
              const idx = this.stages.indexOf(stage);
              const woIdx = this.stages.indexOf(wo.status);
              const cls = idx < woIdx ? 'done' : idx === woIdx ? 'active' : 'pending';
              return `<div class="cp-tl-item ${cls}"><span class="cp-tl-dot"></span><span>${stageLabels[stage]}</span></div>`;
            }).join('')}
          </div>
        </div>

        <div class="cp-actions">
          <button class="btn btn-sm btn-primary" onclick="ServicePage.nextStage('${wo.id}')">Tahap Selanjutnya →</button>
          ${['work','qc'].includes(wo.status) ? `<button class="btn btn-sm btn-ghost" onclick="ServicePage.showPartsModal('${wo.id}')">${I.plus} Tambah Part</button>` : ''}
        </div>
      </div>
    `;
  },

  assignMechanic(woId, mechanicId) {
    if (!mechanicId) return;
    const wo = DB.find('workOrders', woId);
    if (!wo) return;
    const m = DB.find('mechanics', mechanicId);
    if (!m) return;
    DB.update('workOrders', woId, {
      mechanicId,
      status: wo.status === 'waiting' ? 'work' : wo.status
    });
    DB.update('mechanics', mechanicId, { status: 'busy' });
    DB.log('update', 'workOrder', woId, `Menugaskan ${m.name} — ${wo.number}`);
    Toast.show(`WO ${wo.number} ditugaskan ke ${m.name}`, 'success');
    this.workqueue();
  },

  nextStage(woId) {
    const wo = DB.find('workOrders', woId);
    if (!wo) return;
    const idx = this.stages.indexOf(wo.status);
    if (idx >= this.stages.length - 1) return;

    const next = this.stages[idx + 1];
    const progressMap = { waiting: 0, inspection: 15, estimate: 30, work: 45, qc: 90, done: 100 };
    DB.update('workOrders', woId, {
      status: next,
      progress: progressMap[next]
    });
    if (next === 'done') {
      DB.update('workOrders', woId, { baySlot: null });
      DB.notify('WO Selesai', `${wo.number} telah selesai dikerjakan`, 'success', '✅');
    }
    DB.log('update', 'workOrder', woId, `Status berubah ke ${next.toUpperCase()} — ${wo.number}`);
    Toast.show(`WO ${wo.number} → ${next.toUpperCase()}`, 'success');
    this.workqueue();
  },

  showPartsModal(woId) {
    const parts = DB.get('spareParts');
    Modal.open({
      title: 'Tambah Part ke WO',
      icon: '📦',
      body: `
        <div class="form-grid">
          <label class="field">
            <span>Part</span>
            <select id="partSelect" class="input">
              ${parts.map(p => `<option value="${p.id}">${esc(p.name)} (stok ${p.stock})</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Jumlah</span>
            <input id="partQty" class="input" type="number" min="1" value="1">
          </label>
        </div>
      `,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-accent" id="partSaveBtn">Tambah Part</button>
      `
    });
    document.getElementById('partSaveBtn').onclick = () => {
      const partId = document.getElementById('partSelect').value;
      const qty = parseInt(document.getElementById('partQty').value) || 1;
      const part = DB.part(partId);
      if (!part) return;
      if (part.stock < qty) {
        Toast.show(`Stok ${part.name} tidak cukup (${part.stock})`, 'error');
        return;
      }
      const ok = DB.partOut(partId, qty, 'WO', woId, `Pemakaian part untuk ${woId}`);
      if (!ok) {
        Toast.show('Gagal mengurangi stok', 'error');
        return;
      }
      DB.add('woParts', {
        id: DB.genId('PD'),
        workOrderId: woId,
        partId,
        qty,
        price: part.price
      });
      Modal.close();
      Toast.show(`Part ${part.name} ×${qty} ditambahkan`, 'success');
      this.workqueue();
    };
  },

  /* ==================== MECHANIC ASSIGNMENT ==================== */
  assignment() {
    const content = document.getElementById('pageContent');
    this._activeStage = null;
    const mechanics = DB.get('mechanics');

    content.innerHTML = `
      ${App.pageHeader('👥', 'Mechanic Assignment', 'Distribusi pekerjaan dan kapasitas mekanik', '')}

      ${this.pipelineHTML(DB.get('workOrders'))}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.users}</span>
            <h3>Kapasitas Mekanik</h3>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Mekanik</th><th>Spesialisasi</th><th>Status</th><th>WO Aktif</th><th>Telp</th></tr></thead>
            <tbody>
              ${mechanics.map(m => {
                const activeWO = DB.get('workOrders').filter(wo => wo.mechanicId === m.id && !['done','cancelled'].includes(wo.status));
                return `
                  <tr>
                    <td><span class="td-main">${esc(m.name)}</span></td>
                    <td>${esc(m.specialty)}</td>
                    <td>${statusBadge(m.status)}</td>
                    <td>${activeWO.length ? activeWO.map(wo => `<span class="td-plate" style="margin-right:4px">${esc(wo.number)}</span>`).join('') : '—'}</td>
                    <td>${esc(m.phone)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ==================== SERVICE PROGRESS ==================== */
  progress() {
    const content = document.getElementById('pageContent');
    this._activeStage = 'work';
    const wos = DB.get('workOrders').filter(wo => ['work', 'qc'].includes(wo.status));

    content.innerHTML = `
      ${App.pageHeader('📈', 'Service Progress', 'Pantau progres pengerjaan secara real-time', '')}

      ${this.pipelineHTML(DB.get('workOrders'))}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.activity}</span>
            <h3>Progres Pengerjaan</h3>
            <span class="count">${wos.length}</span>
          </div>
        </div>
        ${wos.length ? wos.map(wo => {
          const v = DB.vehicleInfo(wo.vehicleId);
          return `
            <div class="wo-card status-${esc(wo.status)}" onclick="App.goTo('service/workqueue')">
              <div class="wo-top">
                <span class="wo-no">${esc(wo.number)}</span>
                <span class="wo-vehicle">${esc(v.model)}</span>
                <span class="wo-plate">${esc(v.plate)}</span>
                <span style="margin-left:auto">${statusBadge(wo.status)}</span>
              </div>
              <div class="wo-bottom">
                <div class="wo-progress" style="max-width:calc(100% - 80px)"><div style="width:${wo.progress || 0}%"></div></div>
                <strong style="font-family:var(--font-mono)">${wo.progress || 0}%</strong>
              </div>
            </div>
          `;
        }).join('') : '<div class="panel"><div class="empty-state"><div class="es-ic">📭</div><p>Tidak ada pekerjaan berjalan</p></div></div>'}
      </div>
    `;
  },

  /* ==================== SERVICE HISTORY ==================== */
  history() {
    const content = document.getElementById('pageContent');
    this._activeStage = 'done';
    const wos = DB.get('workOrders').filter(wo => ['done', 'cancelled'].includes(wo.status));

    content.innerHTML = `
      ${App.pageHeader('🗂', 'Service History', 'Riwayat WO yang telah selesai atau dibatalkan', `
        <button class="btn btn-ghost" onclick="ServicePage.exportHistory()">${I.download} Export CSV</button>
      `)}

      ${this.pipelineHTML(DB.get('workOrders'))}

      <div class="section">
        <div class="section-head">
          <div class="section-title">
            <span class="st-ic">${I.file}</span>
            <h3>Riwayat</h3>
            <span class="count">${wos.length}</span>
          </div>
        </div>
        ${tableHTML(
          [
            { label: 'Nomor' },
            { label: 'Kendaraan' },
            { label: 'Pelanggan' },
            { label: 'Keluhan' },
            { label: 'Biaya' },
            { label: 'Selesai' },
            { label: 'Status' }
          ],
          wos.map(wo => `
            <tr>
              ${td(`<span class="td-main">${esc(wo.number)}</span>`)}
              ${td(`<span class="td-plate">${esc(DB.vehicleInfo(wo.vehicleId).plate)}</span> <span class="td-sub">${esc(DB.vehicleInfo(wo.vehicleId).model)}</span>`)}
              ${td(esc(DB.customerName(wo.customerId)))}
              ${td(`<span class="td-sub">${esc(wo.complaint)}</span>`)}
              ${td(`<span class="text-right">${DB.fmtMoney(wo.estimatedCost)}</span>`)}
              ${td(esc(DB.fmtDateShort(wo.estimatedDone)))}
              ${td(statusBadge(wo.status))}
            </tr>
          `)
        )}
      </div>
    `;
  },

  exportHistory() {
    const wos = DB.get('workOrders').filter(wo => wo.status === 'done');
    const rows = wos.map(wo => [
      wo.number,
      DB.vehicleInfo(wo.vehicleId).plate,
      DB.customerName(wo.customerId),
      wo.complaint,
      wo.estimatedCost,
      DB.fmtDate(wo.estimatedDone)
    ]);
    rows.unshift(['Nomor', 'Plat', 'Pelanggan', 'Keluhan', 'Biaya', 'Selesai']);
    exportCSV('riwayat-service.csv', rows);
    Toast.show('Riwayat service diekspor', 'success');
  },

  showWODetail(woId) {
    const wo = DB.find('workOrders', woId);
    if (!wo) return;
    const v = DB.vehicleInfo(wo.vehicleId);
    const c = DB.customer(wo.customerId);
    const parts = DB.get('woParts').filter(p => p.workOrderId === wo.id);

    Modal.open({
      title: `Detail ${wo.number}`,
      icon: '📋',
      body: `
        <div class="cp-section">
          <strong>Kendaraan</strong>
          <div class="cp-row"><span>Plat</span><strong><span class="td-plate">${esc(v.plate)}</span></strong></div>
          <div class="cp-row"><span>Model</span><strong>${esc(v.model)}</strong></div>
          <div class="cp-row"><span>Pelanggan</span><strong>${esc(c ? c.name : '-')}</strong></div>
          <div class="cp-row"><span>Keluhan</span><strong>${esc(wo.complaint)}</strong></div>
          <div class="cp-row"><span>Mekanik</span><strong>${esc(DB.mechanicName(wo.mechanicId))}</strong></div>
        </div>
        <div class="cp-section">
          <strong>Part Terpakai</strong>
          ${parts.length ? parts.map(p => {
            const part = DB.part(p.partId);
            return `<div class="cp-part"><span class="pp-name">${esc(part ? part.name : '?')} ×${p.qty}</span><span>${DB.fmtMoney(p.price * p.qty)}</span></div>`;
          }).join('') : '<div style="font-size:11.5px;color:var(--text-3)">Tidak ada part tercatat</div>'}
          <div class="cp-row" style="margin-top:10px"><span>Total Estimasi</span><strong>${esc(DB.fmtMoney(wo.estimatedCost))}</strong></div>
        </div>
      `,
      foot: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`
    });
  },

  /* ---------- PIPELINE HTML ---------- */
  pipelineHTML(wos) {
    const stageMap = {
      waiting: { label: 'Check-in', icon: '✓' },
      inspection: { label: 'Inspeksi', icon: '⚙' },
      estimate: { label: 'Estimasi', icon: '₨' },
      work: { label: 'Pengerjaan', icon: '🔧' },
      qc: { label: 'QC', icon: '✔' },
      done: { label: 'Selesai', icon: '★' }
    };
    const activeIdx = this._activeStage ? this.stages.indexOf(this._activeStage) : -1;

    return `
      <div class="pipeline">
        ${this.stages.map((stage, i) => {
          const s = stageMap[stage];
          const count = wos.filter(wo => wo.status === stage).length;
          const cls = i === activeIdx ? 'active' : (i < activeIdx ? 'done' : '');
          return `
            <div class="pipe-stage ${cls}">
              <div class="pipe-dot">${s.icon}</div>
              <div class="pipe-label">${s.label}</div>
              <div class="pipe-count">${count}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};