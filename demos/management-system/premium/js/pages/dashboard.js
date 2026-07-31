/* ============================================
   NexaWMS Pro — Dashboard Page
   ============================================ */

const DashboardPage = {

  render() {
    const content = document.getElementById('pageContent');
    const invValue = DB.invValue();
    const totalUnits = DB.totalUnits();
    const lowStock = DB.lowStockCount();
    const outOfStock = DB.outOfStockCount();
    const products = DB.get('products');
    const movements = [...DB.get('movements')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const today = new Date().toISOString().slice(0, 10);
    const todayMovements = movements.filter(m => m.createdAt.slice(0, 10) === today);
    const inbound = todayMovements.filter(m => m.qty > 0).reduce((s, m) => s + m.qty, 0);
    const outbound = todayMovements.filter(m => m.qty < 0).reduce((s, m) => s + Math.abs(m.qty), 0);
    const fillRate = Math.min(98, 88 + Math.floor(Math.random() * 8));

    // Month labels & trends
    const labels = monthLabels(6);
    const invTrend = randWalk(Math.round(invValue * 0.82), 6).map(v => v / 1000);
    const receiveTrend = [24, 18, 30, 42, 35, 48, 40].map(v => v * 12).slice(0, 6);
    const issueTrend = [18, 22, 16, 28, 25, 33, 30].map(v => v * 8).slice(0, 6);

    const urgent = [
      ...products.filter(p => p.onHand <= 0).map(p => ({ p, level: 'Kritis', cls: 'danger', icon: '🔴' })),
      ...products.filter(p => p.onHand > 0 && p.onHand <= p.reorderPoint).map(p => ({ p, level: 'Menipis', cls: 'warning', icon: '🟡' }))
    ].sort((a, b) => a.p.onHand - b.p.onHand).slice(0, 5);

    const recentMovements = movements.slice(0, 6);

    content.innerHTML = `
      ${App.pageHeader('🏠', 'Dashboard', `Ringkasan operasional gudang — ${DB.fmtDate(DB.now())}`, `
        <button class="btn btn-ghost" onclick="App.navigate('report')">${I.print} Laporan</button>
        <button class="btn btn-primary" onclick="App.quickCreate()">${I.plus} Aksi Cepat</button>
      `)}

      <!-- KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-ic indigo">${I.package}</div>
            <span class="badge success dot">+${Math.round((invTrend[invTrend.length-1] - invTrend[0]) / invTrend[0] * 100)}%</span>
          </div>
          <div class="kpi-label">Nilai Inventory</div>
          <div class="kpi-value">${DB.fmtMoney(Math.round(invValue/1000000))}<small style="font-size:13px;color:var(--text-3)">M</small></div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 2.4%</span> dari bulan lalu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-ic green">${I.box}</div>
            <span class="badge info dot">${products.length} SKU</span>
          </div>
          <div class="kpi-label">Total Stok (units)</div>
          <div class="kpi-value">${DB.fmtNum(totalUnits)}</div>
          <div class="kpi-sub"><span class="trend-neutral">± 0</span> dibanding kemarin</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-ic orange">${I.trend}</div>
            <span class="badge warning dot">${lowStock} perlu perhatian</span>
          </div>
          <div class="kpi-label">Low Stock Items</div>
          <div class="kpi-value">${lowStock}</div>
          <div class="kpi-sub"><span class="trend-down">${I.arrowDown} ${outOfStock} out of stock</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-ic cyan">${I.truck}</div>
            <span class="badge primary dot">Hari ini</span>
          </div>
          <div class="kpi-label">Inbound / Outbound</div>
          <div class="kpi-value">${DB.fmtNum(inbound)} / ${DB.fmtNum(outbound)}</div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} ${Math.max(12, Math.round((inbound/(inbound+outbound||1))*100))}% inbound</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-ic pink">${I.check}</div>
            <span class="badge accent dot">Target 98%</span>
          </div>
          <div class="kpi-label">Order Fill Rate</div>
          <div class="kpi-value">${fillRate}%</div>
          <div class="kpi-sub"><span class="trend-up">${I.arrowUp} 1.2%</span> dari minggu lalu</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid-2-1">
        <div class="card">
          <div class="card-head">
            <div>
              <h3><span class="ch-ic">📈</span> Tren Nilai Inventory</h3>
              <div class="ch-sub">6 bulan terakhir · dalam miliar IDR</div>
            </div>
            <div class="card-head-actions">
              <select onchange="DashboardPage.refreshTrend(this.value)">
                <option value="6">6 Bulan</option>
                <option value="12">12 Bulan</option>
              </select>
            </div>
          </div>
          <div class="chart-box lg"><canvas id="invTrendChart"></canvas></div>
        </div>

        <div class="card">
          <div class="card-head">
            <div>
              <h3><span class="ch-ic">⚠️</span> Stok Kritis</h3>
              <div class="ch-sub">Item di bawah reorder point</div>
            </div>
            <button class="icon-btn" onclick="App.navigate('products')" title="Lihat semua">${I.eye}</button>
          </div>
          <div class="stat-list">
          ${urgent.length ? urgent.map(u => `
            <div class="stat-item">
              <div class="si-ic" style="color:${u.cls === 'danger' ? 'var(--danger)' : 'var(--warning)'}">${u.icon}</div>
              <div class="si-info">
                <div class="si-label">${esc(u.p.name)}</div>
                <div class="si-value" style="font-size:13.5px;color:${u.cls === 'danger' ? 'var(--danger)' : 'var(--warning)'}">
                  ${u.p.onHand} ${DB.unitName(u.p.unitId)} tersisa
                </div>
              </div>
              <div class="stock-bar" style="width:110px">
                <div class="bar-track"><div class="bar-fill" style="width:${stockLevel(u.p).pct}%;background:${stockLevel(u.p).color}"></div></div>
                <span class="bar-val" style="font-size:10.5px">${stockLevel(u.p).label}</span>
              </div>
            </div>
          `).join('') : '<div class="empty-state"><div class="es-ic">🎉</div><p>Semua stok sehat!</p></div>'}
          </div>
          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">
            <button class="btn btn-outline btn-block btn-sm" onclick="App.navigate('products')">Kelola Stok →</button>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-head">
            <div>
              <h3><span class="ch-ic">🚚</span> Inbound vs Outbound</h3>
              <div class="ch-sub">Unit per bulan</div>
            </div>
          </div>
          <div class="chart-box"><canvas id="flowChart"></canvas></div>
        </div>

        <div class="card">
          <div class="card-head">
            <div>
              <h3><span class="ch-ic">🔄</span> Aktivitas Terakhir</h3>
              <div class="ch-sub">Stock movement terbaru</div>
            </div>
            <button class="icon-btn" onclick="App.navigate('movement')" title="Stock Movement">${I.eye}</button>
          </div>
          <div class="timeline">
            ${recentMovements.map(m => {
              const isIn = m.qty > 0;
              const color = isIn ? 'success' : (m.type === 'adjustment' ? 'warning' : 'danger');
              return `<div class="tl-item">
                <div class="tl-dot ${color}"></div>
                <div class="tl-time">${DB.fmtDateTime(m.createdAt)} · ${esc(m.user)}</div>
                <p><strong>${isIn ? 'Masuk' : 'Keluar'} ${Math.abs(m.qty)}</strong>
                  <span style="color:var(--text-2)">${esc(DB.productName(m.productId))}</span><br>
                  <small style="color:var(--text-3)">${esc(m.note)}</small>
                </p>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Charts
    setTimeout(() => {
      makeChart('invTrendChart', {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Nilai Inventory',
            data: invTrend,
            borderColor: '#6366f1',
            backgroundColor: ChartTheme.gradients.indigo,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#fff',
            pointRadius: 3.5,
            pointHoverRadius: 5
          }]
        },
        options: {
          scales: { y: { beginAtZero: false, ticks: { callback: v => 'Rp ' + v + ' M' } } }
        }
      });

      makeChart('flowChart', {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Inbound',
              data: receiveTrend,
              backgroundColor: 'rgba(16,185,129,.65)',
              borderRadius: 6,
              borderSkipped: false
            },
            {
              label: 'Outbound',
              data: issueTrend,
              backgroundColor: 'rgba(99,102,241,.65)',
              borderRadius: 6,
              borderSkipped: false
            }
          ]
        },
        options: {
          scales: { y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString('id-ID') } } }
        }
      });
    }, 80);
  },

  refreshTrend(range) {
    // re-render with wider range (approximation)
    this.render();
    Toast.show(`Tren diperbarui untuk ${range} bulan`, 'info');
  }
};