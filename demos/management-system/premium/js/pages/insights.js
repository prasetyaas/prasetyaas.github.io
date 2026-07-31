/* ============================================
   NexaWMS Pro — Insights Pages
   Analytics · Forecast · Report · Aging · ABC · Dead Stock
   ============================================ */

const InsightsPage = {

  /* ================= ANALYTICS ================= */
  analytics() {
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    const movements = DB.get('movements');
    const labels = monthLabels(6);
    const invValue = DB.invValue();
    const totalUnits = DB.totalUnits();

    // Receive vs issue volume by month
    const receiveVol = randWalk(320, 6);
    const issueVol = randWalk(280, 6);

    // Turnover rate demo
    const turnover = products.reduce((s, p) => s + (p.onHand > 0 ? 1 : 0), 0);

    // Category distribution
    const catData = DB.get('categories').map(c => {
      const items = products.filter(p => p.categoryId === c.id);
      const val = items.reduce((s, p) => s + p.onHand * p.cost, 0);
      return { name: c.name, icon: c.icon, value: val, count: items.length, units: items.reduce((s,p) => s+p.onHand, 0) };
    }).filter(c => c.count > 0);

    const topCategories = [...catData].sort((a,b) => b.value - a.value);

    // Throughput
    const throughput = movements.reduce((s,m) => s + Math.abs(m.qty), 0);
    const monthlyThroughput = Math.round(throughput * 3.2);

    const holdingCost = Math.round(invValue * 0.018);

    content.innerHTML = `
      ${App.pageHeader('📊', 'Analytics', 'Analisis mendalam performa inventory gudang Anda', `
        <button class="btn btn-ghost" onclick="InsightsPage.exportAnalytics()">${I.download} Export</button>
        <button class="btn btn-primary" onclick="App.navigate('forecast')">Lihat Forecast ${I.arrowUp}</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.activity}</div><span class="badge info dot">Bulan lalu</span></div>
          <div class="kpi-label">Inventory Turnover Ratio</div>
          <div class="kpi-value">4.8<small style="font-size:14px">x</small></div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 0.3</span> dari 4.5 bulan lalu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.truck}</div><span class="badge primary dot">30 hari</span></div>
          <div class="kpi-label">Throughput Bulanan</div>
          <div class="kpi-value">${DB.fmtNum(monthlyThroughput)}</div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 8.2%</span> kontinyu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic orange">${I.clock}</div><span class="badge warning dot">Rata-rata</span></div>
          <div class="kpi-label">Holding Cost / Bulan</div>
          <div class="kpi-value">${DB.fmtMoney(holdingCost)}</div>
          <div class="kpi-sub"><span class="trend-neutral">1.8%</span> dari nilai inventory</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">Akurat</span></div>
          <div class="kpi-label">Inventory Accuracy</div>
          <div class="kpi-value">97.4%</div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 0.6%</span> dari audit terakhir</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-head">
            <div><h3><span class="ch-ic">📈</span> Tren Pergerakan Stok</h3><div class="ch-sub">Unit per bulan</div></div>
          </div>
          <div class="chart-box"><canvas id="anFlowChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-head">
            <div><h3><span class="ch-ic">📦</span> Distribusi Nilai per Kategori</h3><div class="ch-sub">Berdasarkan nilai inventory</div></div>
          </div>
          <div class="chart-box"><canvas id="anCatChart"></canvas></div>
        </div>
      </div>

      <div class="grid-2-1">
        <div class="card">
          <div class="card-head">
            <div><h3><span class="ch-ic">🏆</span> Kategori Teratas</h3><div class="ch-sub">Nilai inventory per kategori</div></div>
          </div>
          <div class="table-wrap"><table>
            <thead><tr><th>Kategori</th><th class="text-right">SKU</th><th class="text-right">Unit</th><th class="text-right">Nilai</th><th style="width:28%">Kontribusi</th></tr></thead>
            <tbody>
              ${topCategories.map(c => {
                const pct = Math.round((c.value / invValue) * 100);
                const color = pct > 30 ? 'var(--primary)' : pct > 15 ? 'var(--accent)' : 'var(--success)';
                return `<tr>
                  <td><strong>${c.icon} ${esc(c.name)}</strong></td>
                  <td class="num text-right">${c.count}</td>
                  <td class="num text-right">${DB.fmtNum(c.units)}</td>
                  <td class="money text-right">${DB.fmtMoney(c.value)}</td>
                  <td><div class="stock-bar"><div class="bar-track"><div class="bar-fill" style="width:${Math.max(4,pct)}%;background:${color}"></div></div><span class="bar-val">${pct}%</span></div></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table></div>
        </div>
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">⚡</span> Metrik Kunci</h3><div class="ch-sub">Overview singkat</div></div></div>
          <div class="stat-list">
            ${[
              ['📦', 'Total SKU Aktif', products.filter(p=>p.status==='active').length, ''],
              ['📉', 'Item Rata-rata per Kategori', Math.round(products.length / Math.max(1, DB.get('categories').length)), ''],
              ['🔄', 'Transfer Antar Gudang', DB.get('transfers').length, ''],
              ['✅', 'Cycle Count Selesai', DB.get('cycleCounts').filter(c=>c.status==='completed').length, ''],
              ['📤', 'Issue Aktif', DB.get('issues').filter(i=>['draft','picking','packed','shipped'].includes(i.status)).length, ''],
              ['🏠', 'Lokasi Penyimpanan', DB.get('locations').length, '']
            ].map(s => `
              <div class="stat-item">
                <div class="si-ic">${s[0]}</div>
                <div class="si-info"><div class="si-label">${s[1]}</div><div class="si-value" style="font-size:15px">${s[2]}</div></div>
                <span class="si-change" style="color:var(--text-3);font-size:11px">${s[3]}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      makeChart('anFlowChart', {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Masuk', data: receiveVol, borderColor: '#10b981', backgroundColor: ChartTheme.gradients.green, fill: true, tension: .4, borderWidth: 2 },
            { label: 'Keluar', data: issueVol, borderColor: '#6366f1', backgroundColor: 'transparent', tension: .4, borderWidth: 2, borderDash: [5,5] }
          ]
        },
        options: { scales: { y: { beginAtZero: true } } }
      });

      makeChart('anCatChart', {
        type: 'doughnut',
        data: {
          labels: topCategories.map(c => c.name),
          datasets: [{
            data: topCategories.map(c => Math.round(c.value / 1000000)),
            backgroundColor: ChartTheme.palette,
            borderWidth: 2,
            borderColor: '#0d1526',
            hoverOffset: 8
          }]
        },
        options: {
          cutout: '62%',
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }, 80);
  },

  exportAnalytics() {
    exportExcel('nexawms-analytics.xls', 'Analytics',
      ['Kategori', 'Jumlah SKU', 'Unit Stok', 'Nilai Inventory'],
      DB.get('categories').map(c => {
        const items = DB.get('products').filter(p => p.categoryId === c.id);
        return [
          c.name,
          items.length,
          items.reduce((s, p) => s + p.onHand, 0),
          items.reduce((s, p) => s + p.onHand * p.cost, 0)
        ];
      })
    );
    DB.audit('export', 'report', 'RPT-ANALYTICS', 'Export Analytics Summary (Excel)', 'Admin');
    Toast.show('Analytics berhasil diexport (Excel)', 'success');
  },

  /* ================= FORECAST ================= */
  forecast() {
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    const labels = monthLabels(6);

    // Historical demand (units) for top mover item PRD-001 and overall
    const histLenovo = [28, 32, 26, 41, 38, 45];
    const histAll = [312, 348, 330, 402, 428, 465];

    // Simple moving average forecast (3-month) + smoothing
    const forecastLenovo = [43, 47, 52];
    const forecastAll = [448, 472, 508];

    const nextLabels = [...labels, 'N+1', 'N+2', 'N+3'];

    const topMovers = products
      .map(p => ({
        ...p,
        monthlyDemand: Math.max(4, Math.round(p.onHand * (0.35 + Math.random() * 0.5)))
      }))
      .sort((a, b) => b.monthlyDemand - a.monthlyDemand)
      .slice(0, 8);

    const recommended = topMovers.slice(0, 5).map(p => ({
      ...p,
      suggestedQty: Math.max(0, p.reorderPoint * 2 - p.onHand)
    })).filter(r => r.suggestedQty > 0);

    content.innerHTML = `
      ${App.pageHeader('🔮', 'Forecast', 'Proyeksi permintaan menggunakan moving average & exponential smoothing', `
        <select style="width:auto" onchange="InsightsPage.forecastMethod(this.value)">
          <option value="ma">Moving Average (3)</option>
          <option value="es">Exponential Smoothing</option>
        </select>
        <button class="btn btn-primary" onclick="InsightsPage.createReorder()">${I.plus} Buat Draft PO</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic indigo">${I.forecast}</div><span class="badge accent dot">N+1</span></div>
          <div class="kpi-label">Forecast Permintaan Bulan Depan</div>
          <div class="kpi-value">${DB.fmtNum(508)} <small style="font-size:13px;color:var(--text-3)">unit</small></div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 9.2%</span> vs rata-rata 6 bulan</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic cyan">${I.cart}</div><span class="badge info dot">Hitungan</span></div>
          <div class="kpi-label">Nilai Rekomendasi Reorder</div>
          <div class="kpi-value">${DB.fmtMoney(recommended.reduce((s,r) => s + r.suggestedQty * r.cost, 0))}</div>
          <div class="kpi-sub"><span class="trend-neutral">${recommended.length} produk perlu reorder</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.trend}</div><span class="badge success dot">Aman</span></div>
          <div class="kpi-label">Akurasi Forecast (MAPE)</div>
          <div class="kpi-value">91.2<small style="font-size:14px">%</small></div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 2.1%</span> dari bulan lalu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic orange">${I.clock}</div><span class="badge warning dot">Produk</span></div>
          <div class="kpi-label">Hari Stok Tersisa (Avg)</div>
          <div class="kpi-value">38 <small style="font-size:13px;color:var(--text-3)">hari</small></div>
          <div class="kpi-sub"><span class="trend-down">${I.arrowDown} 4 hari</span> dari bulan lalu</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📈</span> Proyeksi Permintaan — Semua Produk</h3><div class="ch-sub">Historical & forecast (unit/bulan)</div></div>
        </div>
        <div class="chart-box lg"><canvas id="fcAllChart"></canvas></div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-head">
            <div><h3><span class="ch-ic">💻</span> Proyeksi — Lenovo ThinkPad E14</h3><div class="ch-sub">Top moving item</div></div>
          </div>
          <div class="chart-box sm"><canvas id="fcItemChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-head">
            <div><h3><span class="ch-ic">🛒</span> Rekomendasi Reorder</h3><div class="ch-sub">Berdasarkan forecast & safety stock</div></div>
          </div>
          <div class="stat-list">
            ${recommended.map(r => `
              <div class="stat-item">
                <div class="si-ic" style="color:var(--warning)">🛒</div>
                <div class="si-info">
                  <div class="si-label">${esc(r.name)}</div>
                  <div class="si-value" style="font-size:13.5px">${DB.fmtNum(r.suggestedQty)} ${DB.unitName(r.unitId)} · ${DB.fmtMoney(r.suggestedQty * r.cost)}</div>
                </div>
                <span class="badge warning">${esc(stockLevel(r).label)}</span>
              </div>`).join('')}
          </div>
          <div style="margin-top:16px">
            <button class="btn btn-primary btn-block" onclick="InsightsPage.createReorder()">${I.plus} Buat Draft PO dari Rekomendasi</button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      makeChart('fcAllChart', {
        type: 'line',
        data: {
          labels: nextLabels,
          datasets: [
            {
              label: 'Historical Demand',
              data: [...histAll, null, null, null],
              borderColor: '#6366f1',
              backgroundColor: ChartTheme.gradients.indigo,
              fill: true, tension: .35, borderWidth: 2.5,
              pointRadius: 4, pointBackgroundColor: '#8b5cf6', pointBorderColor: '#fff'
            },
            {
              label: 'Forecast',
              data: [null, null, null, ...forecastAll],
              borderColor: '#22d3ee',
              borderDash: [8, 4], tension: .35, borderWidth: 2.5,
              pointRadius: 5, pointBackgroundColor: '#22d3ee', pointBorderColor: '#fff'
            }
          ]
        },
        options: {
          scales: { y: { beginAtZero: true, title: { display: true, text: 'Unit', color: ChartTheme.ticks, font: { size: 11 } } } }
        }
      });

      makeChart('fcItemChart', {
        type: 'line',
        data: {
          labels: nextLabels,
          datasets: [
            {
              label: 'Historical',
              data: [...histLenovo, null, null, null],
              borderColor: '#10b981',
              backgroundColor: ChartTheme.gradients.green,
              fill: true, tension: .35, borderWidth: 2.5
            },
            {
              label: 'Forecast',
              data: [null, null, null, ...forecastLenovo],
              borderColor: '#f59e0b',
              borderDash: [7,4], tension: .35, borderWidth: 2.5
            }
          ]
        },
        options: { scales: { y: { beginAtZero: false } } }
      });
    }, 80);
  },

  forecastMethod(method) {
    this.forecast();
    Toast.show(`Metode forecast: ${method === 'ma' ? 'Moving Average (3)' : 'Exponential Smoothing (α=0.3)'}`, 'info');
  },

  createReorder() {
    const products = DB.get('products');
    const needy = products.filter(p => p.onHand <= p.reorderPoint);
    if (!needy.length) {
      Toast.show('Tidak ada produk yang perlu reorder', 'info');
      return;
    }
    const suppMap = {};
    needy.forEach(p => {
      const cat = DB.categoryName(p.categoryId);
      const supplier = DB.get('suppliers').find(s => s.categories && s.categories.includes(cat.split(' ')[0])) || DB.get('suppliers')[0];
      if (!suppMap[supplier.id]) suppMap[supplier.id] = [];
      suppMap[supplier.id].push({ productId: p.id, qty: Math.max(p.reorderPoint * 2 - p.onHand, p.minStock), unitPrice: p.cost });
    });

    Object.entries(suppMap).forEach(([supplierId, items]) => {
      const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
      DB.add('purchases', {
        id: DB.genId('PO'),
        number: `PO-2024-${String(DB.get('purchases').length + 1).padStart(4, '0')}`,
        supplierId,
        warehouseId: 'WH-CTG',
        status: 'draft',
        orderDate: DB.now(),
        expectedDate: DB.daysAhead(7),
        receivedDate: null,
        items: items.map(i => ({ ...i, receivedQty: 0 })),
        total,
        notes: 'Auto-generated dari forecast reorder',
        createdBy: 'System'
      });
    });

    DB.audit('create', 'purchase', 'AUTO-PO', `Auto reorder ${needy.length} produk dari rekomendasi forecast`, 'Admin');
    Toast.show(`${needy.length} draft PO berhasil dibuat berdasarkan forecast`, 'success');
  },

  /* ================= REPORT ================= */
  report() {
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    const movements = DB.get('movements');

    const reportTypes = [
      { id: 'inventory', name: 'Laporan Stok', desc: 'Ringkasan stok per produk', icon: '📦' },
      { id: 'movement', name: 'Laporan Movement', desc: 'Rekap pergerakan stok', icon: '🔄' },
      { id: 'purchase', name: 'Laporan Pembelian', desc: 'Rekap PO & penerimaan', icon: '🛒' },
      { id: 'aging', name: 'Laporan Aging', desc: 'Distribusi umur stok', icon: '⏳' },
      { id: 'value', name: 'Laporan Nilai Stok', desc: 'Valuasi inventory', icon: '💰' },
      { id: 'kpi', name: 'Laporan KPI', desc: 'Metrik performa gudang', icon: '📊' }
    ];

    content.innerHTML = `
      ${App.pageHeader('📄', 'Report', 'Buat, jadwalkan, dan export laporan warehouse Anda', `
        <button class="btn btn-primary" onclick="InsightsPage.openReportBuilder()">${I.plus} Buat Laporan</button>
      `)}

      <div class="grid-3">
        ${reportTypes.map((r, i) => `
          <div class="card hoverable" style="cursor:pointer;margin:0" onclick="InsightsPage.generateReport('${r.id}')">
            <div class="card-head" style="margin-bottom:8px">
              <h3><span class="ch-ic">${r.icon}</span> ${r.name}</h3>
              <span class="badge ${['accent','info','primary','warning','success','pink'][i]} dot">${['Live','Live','Live','Live','Live','Live'][i]}</span>
            </div>
            <p style="color:var(--text-2);font-size:12.5px;margin-bottom:14px">${r.desc}</p>
            <div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
              <span style="font-size:11.5px;color:var(--text-3)">Terakhir: ${DB.fmtDate(DB.daysAgo(i))}</span>
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();InsightsPage.generateReport('${r.id}')">Generate ${I.arrowUp}</button>
            </div>
          </div>`).join('')}
      </div>

      <div class="card" style="margin-top:20px">
        <div class="card-head">
          <div><h3><span class="ch-ic">🕘</span> Riwayat Laporan</h3><div class="ch-sub">Laporan yang telah di-generate</div></div>
          <button class="icon-btn" onclick="InsightsPage.generateReport('inventory')" title="Generate baru">${I.refresh}</button>
        </div>
        ${tableHTML(
          [
            { label: 'Nama Laporan' }, { label: 'Tipe' }, { label: 'Generator' }, { label: 'Tanggal' }, { label: '', right: true }
          ],
          [['inventory','movement','purchase','aging','value','kpi'].map((t, i) => `
            <tr>
              ${td(`<strong>${reportTypes.find(r => r.id === t).name}</strong><div class="cell-sub">${reportTypes.find(r => r.id === t).desc}</div>`)}
              ${td(customBadge(['accent','info','primary','warning','success','pink'][i], reportTypes.find(r => r.id === t).name))}
              ${td('Admin')}
              ${td(DB.fmtDateTime(DB.daysAgo(i * 2)))}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="icon-btn" title="Download" onclick="InsightsPage.downloadReport()">${I.download}</button>
                <button class="icon-btn" title="Print" onclick="window.print()">${I.print}</button>
              </div>`, 'text-right')}
            </tr>`).join('')]
        )}
      </div>
    `;
  },

  openReportBuilder() {
    Modal.open({
      title: 'Buat Laporan Baru', icon: '📄', size: 'lg',
      body: `
        <div class="modal-form-section">
          <h4>📋 Informasi Umum</h4>
          <div class="form-grid">
            <label class="field"><span>Nama Laporan</span><input id="rptName" placeholder="cth: Laporan Stok Bulanan"></label>
            <label class="field"><span>Tipe Laporan</span>
              <select id="rptType">
                <option>Inventory Summary</option><option>Stock Movement</option>
                <option>Purchase Analysis</option><option>Inventory Aging</option>
                <option>Dead Stock Report</option><option>KPI Dashboard</option>
              </select>
            </label>
            <label class="field"><span>Periode</span>
              <select id="rptPeriod"><option value="30">30 Hari</option><option value="90">90 Hari</option><option value="365">1 Tahun</option></select>
            </label>
            <label class="field"><span>Format</span>
              <select id="rptFormat"><option>PDF</option><option>Excel</option><option>CSV</option></select>
            </label>
            <label class="field full"><span>Catatan</span><textarea id="rptNote" placeholder="Deskripsi laporan..."></textarea></label>
          </div>
        </div>
        <div class="modal-form-section">
          <h4>🏢 Warehouse</h4>
          <label class="field"><span>Gudang</span>
            <select id="rptWh">
              ${DB.get('warehouses').map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}
            </select>
          </label>
        </div>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn btn-primary" onclick="InsightsPage.submitReport()">${I.plus} Generate Laporan</button>`
    });
  },

  submitReport() {
    const name = document.getElementById('rptName').value || 'Laporan Baru';
    Modal.close();
    Toast.show(`Laporan "${name}" sedang di-generate...`, 'info');
    setTimeout(() => {
      DB.audit('create', 'report', DB.genId('RPT'), `Generate laporan "${name}"`, 'Admin');
      Toast.show(`Laporan "${name}" berhasil di-generate`, 'success');
    }, 1200);
  },

  generateReport(type) {
    Toast.show(`Meng-generate laporan ${type}...`, 'info');
    setTimeout(() => {
      DB.audit('generate', 'report', `RPT-${type.toUpperCase()}`, `Generate Laporan ${type.toUpperCase()}`, 'Admin');
      Toast.show(`Laporan ${type} berhasil di-generate`, 'success');
    }, 800);
  },

  downloadReport() {
    exportExcel('nexawms-inventory-report.xls', 'Inventory Report',
      ['SKU', 'Nama Produk', 'Stok On Hand', 'Harga Beli', 'Nilai'],
      DB.get('products').map(p => [p.sku, p.name, p.onHand, p.cost, p.onHand * p.cost])
    );
    Toast.show('Laporan berhasil di-download (Excel)', 'success');
  },

  /* ================= INVENTORY AGING ================= */
  aging() {
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    const movements = DB.get('movements');
    const now = Date.now();

    // Approximate last movement date per product
    const agingData = products.map(p => {
      const lastMov = movements.filter(m => m.productId === p.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const lastDate = lastMov ? new Date(lastMov.createdAt).getTime() : now - 200 * 86400000;
      const ageDays = Math.max(0, Math.round((now - lastDate) / 86400000));
      const bucket = ageDays <= 30 ? 0 : ageDays <= 60 ? 1 : ageDays <= 90 ? 2 : 3;
      return { ...p, ageDays, bucket, value: p.onHand * p.cost, lastDate };
    });

    const buckets = [
      { name: '0-30 Hari', label: 'Fresh', color: '#10b981', items: [], desc: 'Aman — pergerakan normal' },
      { name: '31-60 Hari', label: 'Watch', color: '#f59e0b', items: [], desc: 'Perlu perhatian' },
      { name: '61-90 Hari', label: 'Warning', color: '#fb923c', items: [], desc: 'Pergerakan melambat' },
      { name: '90+ Hari', label: 'Critical', color: '#ef4444', items: [], desc: 'Risiko dead stock' }
    ];

    agingData.forEach(p => buckets[p.bucket].items.push(p));
    const totalValue = agingData.reduce((s, p) => s + p.value, 0);

    content.innerHTML = `
      ${App.pageHeader('⏳', 'Inventory Aging', 'Analisis distribusi umur stok untuk deteksi dini risiko', `
        <button class="btn btn-ghost" onclick="InsightsPage.exportAging()">${I.download} Export</button>
      `)}

      <div class="kpi-grid">
        ${buckets.map((b, i) => {
          const val = b.items.reduce((s, p) => s + p.value, 0);
          const pct = totalValue ? Math.round((val / totalValue) * 100) : 0;
          return `<div class="kpi-card" style="${i === 3 ? 'border-color:rgba(239,68,68,.3)' : ''}">
            <div class="kpi-top">
              <div class="kpi-ic" style="background:${b.color}22;color:${b.color}">${['✅','👀','⚠️','🚨'][i]}</div>
              <span class="badge" style="color:${b.color};background:${b.color}22;border-color:${b.color}44">${b.label}</span>
            </div>
            <div class="kpi-label">${b.name} · ${b.items.length} SKU</div>
            <div class="kpi-value" style="font-size:19px">${DB.fmtMoney(val)}</div>
            <div class="kpi-sub"><span style="color:${b.color}">${pct}%</span> dari total nilai</div>
          </div>`;
        }).join('')}
      </div>

      <div class="grid-2-1">
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">📊</span> Distribusi Nilai Aging</h3><div class="ch-sub">Berdasarkan nilai inventory</div></div></div>
          <div class="chart-box"><canvas id="agingChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">📌</span> Rekomendasi</h3><div class="ch-sub">Action plan</div></div></div>
          <div class="stat-list">
            ${[
              ['✅', 'Healthy Stock', `${buckets[0].items.length} SKU`, 'green'],
              ['👀', 'Monitor Weekly', `${buckets[1].items.length} SKU`],
              ['⚠️', 'Promo / Bundle', `${buckets[2].items.length} SKU`],
              ['🚨', 'Liquidate / Return', `${buckets[3].items.length} SKU`, 'red']
            ].map(s => `
              <div class="stat-item">
                <div class="si-ic" style="${s[3] === 'green' ? 'color:var(--success)' : s[3] === 'red' ? 'color:var(--danger)' : ''}">${s[0]}</div>
                <div class="si-info"><div class="si-label">${s[1]}</div><div class="si-value" style="font-size:15px">${s[2]}</div></div>
              </div>`).join('')}
          </div>
          <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
            <button class="btn btn-danger btn-block" onclick="Toast.show('Daftar likuidasi sedang disiapkan','info')">📦 Siapkan Likuidasi</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📋</span> Detail Aging per Produk</h3><div class="ch-sub">Sortable berdasarkan umur stok</div></div>
          <select style="width:auto" onchange="InsightsPage.filterAging(this.value)">
            <option value="all">Semua Bucket</option>
            <option value="0">0-30 Hari</option><option value="1">31-60 Hari</option>
            <option value="2">61-90 Hari</option><option value="3">90+ Hari</option>
          </select>
        </div>
        ${tableHTML(
          [
            { label: 'Produk' }, { label: 'SKU' }, { label: 'Kategori' },
            { label: 'Umur', right: true }, { label: 'Bucket' },
            { label: 'Stok', right: true }, { label: 'Nilai', right: true }
          ],
          [...agingData].sort((a, b) => b.ageDays - a.ageDays).map(p => {
            const b = buckets[p.bucket];
            return `<tr data-aging="${p.bucket}">
              ${td(`<div class="product-cell">${productThumb(p.sku, p.name)}<div><div class="cell-main">${esc(p.name)}</div><div class="cell-sub">${esc(p.sku)}</div></div></div>`)}
              ${td(`<span class="scan-badge">${esc(p.sku)}</span>`)}
              ${td(DB.categoryName(p.categoryId))}
              ${td(`<strong class="num" style="color:${b.color}">${p.ageDays} hari</strong>`, 'text-right')}
              ${td(customBadge(p.bucket === 3 ? 'danger' : p.bucket === 2 ? 'warning' : p.bucket === 1 ? 'primary' : 'success', b.label))}
              ${td(DB.fmtNum(p.onHand), 'text-right num')}
              ${td(DB.fmtMoney(p.value), 'text-right num money')}
            </tr>`;
          }).join(''),
          'Tidak ada data aging'
        )}
      </div>
    `;

    setTimeout(() => {
      makeChart('agingChart', {
        type: 'bar',
        data: {
          labels: buckets.map(b => b.name),
          datasets: [{
            label: 'Nilai (juta)',
            data: buckets.map(b => Math.round(b.items.reduce((s, p) => s + p.value, 0) / 1000000)),
            backgroundColor: buckets.map(b => b.color + '88'),
            borderColor: buckets.map(b => b.color),
            borderWidth: 1.5,
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          scales: { y: { beginAtZero: true, ticks: { callback: v => 'Rp ' + v + 'M' } } }
        }
      });
    }, 80);
  },

  filterAging(bucket) {
    document.querySelectorAll('tr[data-aging]').forEach(tr => {
      tr.style.display = (bucket === 'all' || tr.dataset.aging === bucket) ? '' : 'none';
    });
  },

  exportAging() {
    exportExcel('nexawms-aging.xls', 'Inventory Aging',
      ['SKU', 'Nama Produk', 'Stok On Hand', 'Umur (hari)', 'Nilai'],
      DB.get('products').map(p => {
        const lastMov = DB.get('movements').filter(m => m.productId === p.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        const lastDate = lastMov ? new Date(lastMov.createdAt).getTime() : Date.now() - 200 * 86400000;
        const ageDays = Math.max(0, Math.round((Date.now() - lastDate) / 86400000));
        return [p.sku, p.name, p.onHand, ageDays, p.onHand * p.cost];
      })
    );
    Toast.show('Data aging berhasil diexport (Excel)', 'success');
  },

  /* ================= ABC ANALYSIS ================= */
  abc() {
    const content = document.getElementById('pageContent');
    const products = DB.get('products')
      .map(p => ({ ...p, value: p.onHand * p.cost }))
      .sort((a, b) => b.value - a.value);

    const totalValue = products.reduce((s, p) => s + p.value, 0);

    // Classify A/B/C
    let cum = 0;
    products.forEach(p => {
      cum += p.value;
      const pct = totalValue ? (cum / totalValue) * 100 : 0;
      p.cumPct = pct;
      p.abcClass = pct <= 70 ? 'A' : pct <= 90 ? 'B' : 'C';
    });

    const classes = {
      A: { color: '#ef4444', label: 'High Value', items: products.filter(p => p.abcClass === 'A') },
      B: { color: '#f59e0b', label: 'Medium Value', items: products.filter(p => p.abcClass === 'B') },
      C: { color: '#10b981', label: 'Low Value', items: products.filter(p => p.abcClass === 'C') }
    };

    Object.keys(classes).forEach(k => {
      classes[k].value = classes[k].items.reduce((s, p) => s + p.value, 0);
      classes[k].pct = totalValue ? Math.round((classes[k].value / totalValue) * 100) : 0;
    });

    content.innerHTML = `
      ${App.pageHeader('🔤', 'ABC Analysis', 'Klasifikasi nilai inventory dengan prinsip Pareto (80/20)', `
        <button class="btn btn-ghost" onclick="InsightsPage.exportABC()">${I.download} Export</button>
      `)}

      <div class="kpi-grid">
        ${['A', 'B', 'C'].map(k => `
          <div class="kpi-card" style="border-color:${classes[k].color}44">
            <div class="kpi-top">
              <div class="abc-badge ${k.toLowerCase()}" style="font-size:20px;width:44px;height:44px">${k}</div>
              <span class="badge" style="color:${classes[k].color};background:${classes[k].color}22;border-color:${classes[k].color}44">${classes[k].label}</span>
            </div>
            <div class="kpi-label">${classes[k].items.length} Produk · ${classes[k].pct}% nilai</div>
            <div class="kpi-value" style="font-size:20px">${DB.fmtMoney(classes[k].value)}</div>
            <div class="kpi-sub">${k === 'A' ? 'Prioritas kontrol ketat' : k === 'B' ? 'Kontrol normal' : 'Kontrol ringan'}</div>
          </div>`).join('')}
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">📈</span> Pareto Chart</h3><div class="ch-sub">Cumulative nilai (%)</div></div></div>
          <div class="chart-box"><canvas id="abcChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">💡</span> Strategi per Kategori</h3><div class="ch-sub">Rekomendasi manajemen</div></div></div>
          <div class="stat-list">
            <div class="stat-item"><div class="si-ic abc-badge a">A</div>
              <div class="si-info"><div class="si-label">High Value (${classes.A.items.length} SKU)</div>
                <div class="si-value" style="font-size:13px;color:var(--text-2)">Kontrol harian · cek cycle count mingguan · cegah overstock</div></div></div>
            <div class="stat-item"><div class="si-ic abc-badge b">B</div>
              <div class="si-info"><div class="si-label">Medium (${classes.B.items.length} SKU)</div>
                <div class="si-value" style="font-size:13px;color:var(--text-2)">Cycle count bulanan · auto reorder point</div></div></div>
            <div class="stat-item"><div class="si-ic abc-badge c">C</div>
              <div class="si-info"><div class="si-label">Low Value (${classes.C.items.length} SKU)</div>
                <div class="si-value" style="font-size:13px;color:var(--text-2)">Review kuartalan · pertimbangkan bulk order</div></div></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📋</span> Detail Klasifikasi</h3><div class="ch-sub">Diurutkan berdasarkan nilai</div></div>
        </div>
        ${tableHTML(
          [
            { label: 'Kelas' }, { label: 'Produk' }, { label: 'SKU' },
            { label: 'Nilai', right: true }, { label: '% Nilai', right: true }, { label: 'Cumulative', right: true }
          ],
          products.map(p => `
            <tr>
              ${td(`<span class="abc-badge ${p.abcClass.toLowerCase()}">${p.abcClass}</span>`)}
              ${td(`<div class="product-cell">${productThumb(p.sku, p.name)}<div><div class="cell-main">${esc(p.name)}</div><div class="cell-sub">${DB.categoryName(p.categoryId)}</div></div></div>`)}
              ${td(`<span class="scan-badge">${esc(p.sku)}</span>`)}
              ${td(DB.fmtMoney(p.value), 'text-right num money')}
              ${td(`<div class="stock-bar"><div class="bar-track"><div class="bar-fill" style="width:${totalValue ? Math.max(2, (p.value/totalValue)*100) : 0}%;background:${classes[p.abcClass].color}"></div></div><span class="bar-val">${totalValue ? ((p.value/totalValue)*100).toFixed(1) : 0}%</span></div>`)}
              ${td(`<strong class="num" style="color:${classes[p.abcClass].color}">${p.cumPct.toFixed(1)}%</strong>`, 'text-right')}
            </tr>`).join('')
        )}
      </div>
    `;

    setTimeout(() => {
      const cumData = products.map(p => +p.cumPct.toFixed(1));
      const itemLabels = products.slice(0, 10).map(p => `#${p.sku.split('-').pop()}`);
      makeChart('abcChart', {
        type: 'bar',
        data: {
          labels: itemLabels,
          datasets: [
            {
              type: 'bar',
              label: 'Nilai per Produk',
              data: products.slice(0, 10).map(p => Math.round(p.value / 1000000)),
              backgroundColor: products.slice(0, 10).map(p => classes[p.abcClass].color + '88'),
              borderRadius: 4,
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: 'Cumulative %',
              data: cumData.slice(0, 10),
              borderColor: '#22d3ee',
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              pointBackgroundColor: '#22d3ee',
              tension: .3,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          scales: {
            y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Nilai (Juta)', color: ChartTheme.ticks, font: { size: 10 } }, grid: { color: ChartTheme.grid } },
            y1: { beginAtZero: true, position: 'right', max: 100, title: { display: true, text: 'Cumulative %', color: ChartTheme.ticks, font: { size: 10 } }, grid: { drawOnChartArea: false } }
          }
        }
      });
    }, 80);
  },

  exportABC() {
    const products = DB.get('products').map(p => ({ sku: p.sku, name: p.name, value: p.onHand * p.cost })).sort((a, b) => b.value - a.value);
    const total = products.reduce((s, p) => s + p.value, 0);
    let cum = 0;
    exportExcel('nexawms-abc-analysis.xls', 'ABC Analysis',
      ['SKU', 'Nama Produk', 'Nilai', '% Nilai', 'Kelas'],
      products.map(p => {
        cum += p.value;
        const pct = total ? (cum / total) * 100 : 0;
        const cls = pct <= 70 ? 'A' : pct <= 90 ? 'B' : 'C';
        return [p.sku, p.name, p.value, pct.toFixed(1) + '%', cls];
      })
    );
    Toast.show('Data ABC berhasil diexport (Excel)', 'success');
  },

  /* ================= DEAD STOCK ================= */
  deadStock() {
    const content = document.getElementById('pageContent');
    const products = DB.get('products');
    const movements = DB.get('movements');
    const now = Date.now();

    const analyzed = products.map(p => {
      const lastMov = movements.filter(m => m.productId === p.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      let inactiveDays;
      if (lastMov) {
        const lastDate = new Date(lastMov.createdAt).getTime();
        inactiveDays = Math.max(0, Math.round((now - lastDate) / 86400000));
      } else {
        // Deterministic varied inactive days from SKU hash so all 4 risk buckets render
        let hash = 0;
        for (let i = 0; i < p.sku.length; i++) hash = (hash * 31 + p.sku.charCodeAt(i)) % 997;
        inactiveDays = 15 + (hash % 210); // 15..224 → spread across all risk buckets
      }
      const risk = inactiveDays >= 180 ? 'Kritis' : inactiveDays >= 90 ? 'Tinggi' : inactiveDays >= 60 ? 'Sedang' : 'Rendah';
      const riskCls = risk === 'Kritis' ? 'danger' : risk === 'Tinggi' ? 'warning' : risk === 'Sedang' ? 'primary' : 'success';
      return { ...p, inactiveDays, risk, riskCls, value: p.onHand * p.cost };
    }).sort((a, b) => b.inactiveDays - a.inactiveDays);

    const deadItems = analyzed.filter(p => p.inactiveDays >= 60);
    const critical = analyzed.filter(p => p.risk === 'Kritis').length;
    const high = analyzed.filter(p => p.risk === 'Tinggi').length;
    const deadValue = deadItems.reduce((s, p) => s + p.value, 0);

    const recoverable = deadItems.filter(p => p.inactiveDays >= 90 && p.onHand > 0);

    content.innerHTML = `
      ${App.pageHeader('💀', 'Dead Stock', 'Identifikasi produk lambat bergerak dan rencana aksi', `
        <button class="btn btn-ghost" onclick="InsightsPage.exportDeadStock()">${I.download} Export</button>
      `)}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic red">${I.skull}</div><span class="badge danger dot">${critical} kritis</span></div>
          <div class="kpi-label">Produk Dead Stock (60+ hari)</div>
          <div class="kpi-value">${deadItems.length}</div>
          <div class="kpi-sub"><span class="trend-down">${I.arrowDown} 3 item</span> dari bulan lalu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic orange">${I.database}</div><span class="badge warning dot">Terkunci modal</span></div>
          <div class="kpi-label">Nilai Dead Stock</div>
          <div class="kpi-value" style="font-size:20px">${DB.fmtMoney(deadValue)}</div>
          <div class="kpi-sub">${Math.round((deadValue / Math.max(1, DB.invValue())) * 100)}% dari total inventory</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic pink">${I.clock}</div><span class="badge pink dot">Rata-rata</span></div>
          <div class="kpi-label">Rata-rata Hari Nonaktif</div>
          <div class="kpi-value">${deadItems.length ? Math.round(deadItems.reduce((s,p) => s + p.inactiveDays, 0) / deadItems.length) : 0}<small style="font-size:14px">hr</small></div>
          <div class="kpi-sub">Untuk item 60+ hari</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><div class="kpi-ic green">${I.check}</div><span class="badge success dot">Potensi</span></div>
          <div class="kpi-label">Nilai Recoverable (90+)</div>
          <div class="kpi-value" style="font-size:20px">${DB.fmtMoney(recoverable.reduce((s, p) => s + p.value, 0))}</div>
          <div class="kpi-sub">Disarankan likuidasi / promo</div>
        </div>
      </div>

      <div class="grid-2-1">
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">📊</span> Distribusi Risiko Dead Stock</h3><div class="ch-sub">Berbasis hari nonaktif</div></div></div>
          <div class="chart-box"><canvas id="deadChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-head"><div><h3><span class="ch-ic">📌</span> Rencana Aksi</h3><div class="ch-sub">Prioritas penanganan</div></div></div>
          <div class="stat-list">
            ${[
              ['🚨', 'Segera Likuidasi', `${recoverable.length} produk > 90 hari`, 'red'],
              ['📢', 'Promo Diskon 30-50%', `${deadItems.filter(p=>p.inactiveDays>=60&&p.inactiveDays<90).length} produk 60-90 hari`],
              ['🔄', 'Negosiasi Retur', `${DB.get('suppliers').length} supplier potensial`],
              ['📦', 'Bundle dengan Fast Mover', 'Produk slow + fast mover']
            ].map(s => `
              <div class="stat-item">
                <div class="si-ic" style="${s[3] === 'red' ? 'color:var(--danger)' : ''}">${s[0]}</div>
                <div class="si-info"><div class="si-label">${s[1]}</div><div class="si-value" style="font-size:13px;color:var(--text-2)">${s[2]}</div></div>
              </div>`).join('')}
          </div>
          <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
            <button class="btn btn-primary btn-block" onclick="InsightsPage.createDeadStockAction()">📦 Buat Rencana Aksi</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div><h3><span class="ch-ic">📋</span> Detail Dead Stock</h3><div class="ch-sub">Semua produk dengan hari nonaktif</div></div>
          <select style="width:auto" onchange="InsightsPage.filterDead(this.value)">
            <option value="all">Semua Risiko</option>
            <option value="Kritis">Kritis (180+)</option>
            <option value="Tinggi">Tinggi (90+)</option>
            <option value="Sedang">Sedang (60+)</option>
          </select>
        </div>
        ${tableHTML(
          [
            { label: 'Produk' }, { label: 'SKU' },
            { label: 'Hari Nonaktif', right: true }, { label: 'Tingkat Risiko' },
            { label: 'Stok', right: true }, { label: 'Nilai Terkunci', right: true }, { label: 'Aksi', right: true }
          ],
          analyzed.map(p => `
            <tr data-risk="${p.risk}">
              ${td(`<div class="product-cell">${productThumb(p.sku, p.name)}<div><div class="cell-main">${esc(p.name)}</div><div class="cell-sub">${DB.categoryName(p.categoryId)}</div></div></div>`)}
              ${td(`<span class="scan-badge">${esc(p.sku)}</span>`)}
              ${td(`<strong class="num" style="color:${p.inactiveDays >= 90 ? 'var(--danger)' : p.inactiveDays >= 60 ? 'var(--warning)' : 'var(--text-2)'}">${p.inactiveDays} hari</strong>`, 'text-right')}
              ${td(statusBadge(p.risk, { Kritis: ['danger','Kritis'], Tinggi: ['warning','Tinggi'], Sedang: ['primary','Sedang'], Rendah: ['success','Rendah'] }))}
              ${td(DB.fmtNum(p.onHand), 'text-right num')}
              ${td(DB.fmtMoney(p.value), 'text-right num money')}
              ${td(`<div style="display:flex;gap:6px;justify-content:flex-end">
                ${p.onHand > 0 ? `<button class="icon-btn" title="Buat promo" onclick="InsightsPage.promoAction('${p.id}')">📢</button>` : ''}
              </div>`, 'text-right')}
            </tr>`).join(''),
          'Semua produk memiliki pergerakan — tidak ada dead stock 🎉'
        )}
      </div>
    `;

    setTimeout(() => {
      makeChart('deadChart', {
        type: 'polarArea',
        data: {
          labels: ['Kritis (180+)', 'Tinggi (90+)', 'Sedang (60+)', 'Rendah (<60)'],
          datasets: [{
            data: [
              analyzed.filter(p => p.risk === 'Kritis').length,
              analyzed.filter(p => p.risk === 'Tinggi').length,
              analyzed.filter(p => p.risk === 'Sedang').length,
              analyzed.filter(p => p.risk === 'Rendah').length
            ],
            backgroundColor: ['rgba(239,68,68,.6)', 'rgba(245,158,11,.6)', 'rgba(59,130,246,.6)', 'rgba(16,185,129,.6)'],
            borderColor: ChartTheme.palette,
            borderWidth: 1.5
          }]
        },
        options: {
          plugins: { legend: { position: 'bottom' } },
          scales: { r: { ticks: { display: false }, grid: { color: ChartTheme.grid } } }
        }
      });
    }, 80);
  },

  filterDead(risk) {
    document.querySelectorAll('tr[data-risk]').forEach(tr => {
      tr.style.display = (risk === 'all' || tr.dataset.risk === risk) ? '' : 'none';
    });
  },

  promoAction(productId) {
    const p = DB.product(productId);
    if (!p) return;
    Toast.show(`Promo untuk ${p.name} disarankan diskon 30% (aktual: Rp ${DB.fmtMoney(p.price)})`, 'warning');
    DB.audit('create', 'promo', productId, `Rencana promo untuk ${p.name}`, 'Admin');
  },

  createDeadStockAction() {
    Modal.confirm({
      title: 'Buat Rencana Aksi',
      icon: '📋',
      message: 'Rencana aksi dead stock akan dibuat: (1) Buat daftar likuidasi, (2) Kirim proposal promo ke manajemen, (3) Update status produk.',
      onYes: () => {
        Toast.show('Rencana aksi dead stock berhasil dibuat', 'success');
        DB.audit('create', 'action', 'ACT-DEADSTOCK', 'Membuat rencana aksi dead stock', 'Admin');
      }
    });
  },

  exportDeadStock() {
    const movements = DB.get('movements');
    const now = Date.now();
    exportExcel('nexawms-deadstock.xls', 'Dead Stock',
      ['SKU', 'Nama Produk', 'Stok On Hand', 'Hari Nonaktif', 'Tingkat Risiko', 'Nilai Terkunci'],
      DB.get('products').map(p => {
        const lastMov = movements.filter(m => m.productId === p.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        let inactiveDays;
        if (lastMov) {
          const lastDate = new Date(lastMov.createdAt).getTime();
          inactiveDays = Math.max(0, Math.round((now - lastDate) / 86400000));
        } else {
          let hash = 0;
          for (let i = 0; i < p.sku.length; i++) hash = (hash * 31 + p.sku.charCodeAt(i)) % 997;
          inactiveDays = 15 + (hash % 210); // 15..224 → spread across all risk buckets
        }
        const risk = inactiveDays >= 180 ? 'Kritis' : inactiveDays >= 90 ? 'Tinggi' : inactiveDays >= 60 ? 'Sedang' : 'Rendah';
        return [p.sku, p.name, p.onHand, inactiveDays, risk, p.onHand * p.cost];
      })
    );
    Toast.show('Data dead stock berhasil diexport (Excel)', 'success');
  }
};
