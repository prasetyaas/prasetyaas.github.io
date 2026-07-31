/* ============================================
   MANAGEMENT SYSTEM - DASHBOARD
   Dashboard Page: Stats, Activity, Charts
   ============================================ */

// ===== INIT DASHBOARD =====
async function initDashboard() {
  if (!checkAuth()) return;

  showSkeleton('statsGrid', 4);
  showSkeleton('activityFeed', 5);
  showSkeleton('quickMenu', 4);

  await loadAllData();

  renderStats();
  renderActivityFeed();
  renderQuickMenu();
  renderCharts();
  renderRecentProducts();
  renderTopProducts('sell');
}

// ===== RENDER STATS =====
function renderStats() {
  const statsGrid = document.getElementById('statsGrid');
  if (!statsGrid) return;

  const totalRevenue = AppState.orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) +
    AppState.sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalOrders = AppState.orders.length;
  const totalProducts = AppState.products.length;
  const lowStock = AppState.products.filter(p => p.stock < 10).length;
  const totalSales = AppState.sales.length;

  statsGrid.innerHTML = `
    <div class="stat-card fade-in">
      <div class="stat-icon icon-primary"><i class="bi bi-box-seam"></i></div>
      <div class="stat-body">
        <span class="stat-label">Total Produk</span>
        <span class="stat-value">${totalProducts}</span>
        <span class="stat-trend up"><i class="bi bi-arrow-up"></i> 12.5%</span>
      </div>
    </div>
    <div class="stat-card fade-in">
      <div class="stat-icon icon-success"><i class="bi bi-cart-check"></i></div>
      <div class="stat-body">
        <span class="stat-label">Total Pesanan</span>
        <span class="stat-value">${totalOrders + totalSales}</span>
        <span class="stat-trend up"><i class="bi bi-arrow-up"></i> 8.3%</span>
      </div>
    </div>
    <div class="stat-card fade-in">
      <div class="stat-icon icon-warning"><i class="bi bi-exclamation-triangle"></i></div>
      <div class="stat-body">
        <span class="stat-label">Stok Menipis</span>
        <span class="stat-value">${lowStock}</span>
        <span class="stat-trend down"><i class="bi bi-arrow-down"></i> ${lowStock > 0 ? lowStock * 5 : 0}%</span>
      </div>
    </div>
    <div class="stat-card fade-in">
      <div class="stat-icon icon-purple"><i class="bi bi-currency-dollar"></i></div>
      <div class="stat-body">
        <span class="stat-label">Total Pendapatan</span>
        <span class="stat-value">${formatCurrency(totalRevenue)}</span>
        <span class="stat-trend up"><i class="bi bi-arrow-up"></i> 15.7%</span>
      </div>
    </div>
  `;
}

// ===== RENDER ACTIVITY FEED =====
function renderActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;

  // Combine activities from JSON and localStorage transactions
  const activities = [];

  // From dashboard.json
  const jsonActivities = AppState.dashboard?.summary?.recentActivities || [];
  jsonActivities.forEach(a => activities.push(a));

  // From localStorage sales
  AppState.sales.forEach(s => {
    const timeAgo = getTimeAgo(s.date);
    activities.push({
      action: 'Penjualan',
      item: s.productName,
      qty: s.qty,
      total: s.total,
      time: timeAgo
    });
  });

  // From localStorage stocks
  AppState.stocks.forEach(s => {
    const timeAgo = getTimeAgo(s.date);
    activities.push({
      action: 'Restock',
      item: s.productName,
      qty: s.qty,
      total: 0,
      time: timeAgo
    });
  });

  // Sort by time (most recent first)
  activities.sort((a, b) => {
    const timeA = a.time === 'baru saja' ? 0 : parseInt(a.time) || 99;
    const timeB = b.time === 'baru saja' ? 0 : parseInt(b.time) || 99;
    return timeA - timeB;
  });

  const display = activities.slice(0, 8);

  if (display.length === 0) {
    feed.innerHTML = '<div class="empty-state"><i class="bi bi-activity"></i><h3>Belum ada aktivitas</h3></div>';
    return;
  }

  feed.innerHTML = display.map(act => {
    const iconClass = act.action === 'Penjualan' ? 'sell' : 'restock';
    const icon = act.action === 'Penjualan' ? 'bi-cart' : 'bi-box-seam';
    return `
      <div class="activity-item fade-in">
        <div class="activity-icon ${iconClass}"><i class="bi ${icon}"></i></div>
        <div class="activity-content">
          <strong class="activity-title">${act.action}: ${act.item}</strong>
          <span class="activity-desc">${act.qty > 0 ? act.qty + ' pcs' : ''} ${act.total > 0 ? '— ' + formatCurrency(act.total) : ''}</span>
        </div>
        <span class="activity-time">${act.time}</span>
      </div>
    `;
  }).join('');
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '-';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'baru saja';
  if (diffMins < 60) return diffMins + ' menit lalu';
  if (diffHours < 24) return diffHours + ' jam lalu';
  if (diffDays < 7) return diffDays + ' hari lalu';
  return formatDate(dateStr);
}

// ===== RENDER QUICK MENU =====
function renderQuickMenu() {
  const menu = document.getElementById('quickMenu');
  if (!menu) return;

  const items = [
    { icon: 'bi-plus-circle', label: 'Tambah Produk', action: 'window.location.href=\'products.html\'' },
    { icon: 'bi-cart-plus', label: 'Penjualan Baru', action: 'window.location.href=\'sales.html\'' },
    { icon: 'bi-box-seam', label: 'Tambah Stok', action: 'window.location.href=\'stock.html\'' },
    { icon: 'bi-clock-history', label: 'History', action: 'window.location.href=\'history.html\'' }
  ];

  menu.innerHTML = items.map(item => `
    <button class="quick-action-btn fade-in" onclick="${item.action}">
      <i class="bi ${item.icon}"></i> ${item.label}
    </button>
  `).join('');
}

// ===== RENDER CHARTS =====
function renderCharts() {
  renderSalesChart('salesChart');

  const salesByCategory = AppState.dashboard?.summary?.salesByCategory;
  if (salesByCategory && salesByCategory.length > 0) {
    const labels = salesByCategory.map(s => s.category);
    const data = salesByCategory.map(s => s.value);
    renderDoughnutChart('pieChart', labels, data);
  }

  const orders = AppState.orders || [];
  const salesByProduct = {};
  orders.forEach(o => {
    const name = o.productName || 'Unknown';
    if (!salesByProduct[name]) salesByProduct[name] = 0;
    salesByProduct[name] += o.totalPrice || 0;
  });
  AppState.sales.forEach(s => {
    const name = s.productName || 'Unknown';
    if (!salesByProduct[name]) salesByProduct[name] = 0;
    salesByProduct[name] += s.total || 0;
  });

  const sorted = Object.entries(salesByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (sorted.length > 0) {
    const labels = sorted.map(s => s[0].length > 15 ? s[0].substring(0, 15) + '...' : s[0]);
    const data = sorted.map(s => s[1]);
    renderBarChart('barChart', labels, data, 'Total Penjualan (Rp)');
  }
}

// ===== RENDER RECENT PRODUCTS =====
function renderRecentProducts() {
  const table = document.getElementById('recentProductsTable');
  if (!table) return;

  const products = [...AppState.products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  if (products.length === 0) {
    table.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding:24px;">Belum ada produk</td></tr>';
    return;
  }

  table.innerHTML = products.map(p => {
    const stockClass = p.stock < 10 ? 'stock-low' : p.stock < 25 ? 'stock-medium' : 'stock-ok';
    return `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td>${formatCurrency(p.price)}</td>
        <td><span class="${stockClass}">${p.stock}</span></td>
      </tr>
    `;
  }).join('');
}

// ===== RENDER TOP PRODUCTS =====
let topProductsMode = 'sell';

function switchTopProducts(mode) {
  topProductsMode = mode;
  document.querySelectorAll('.tab-switch button').forEach(b => {
    b.classList.toggle('active', b.dataset.top === mode);
  });
  renderTopProducts(mode);
}

function renderTopProducts(mode) {
  const container = document.getElementById('topProductsList');
  if (!container) return;

  mode = mode || topProductsMode;
  const orders = AppState.orders || [];
  const sales = AppState.sales || [];

  const agg = {};
  orders.forEach(o => {
    const name = o.productName || 'Unknown';
    if (!agg[name]) agg[name] = { qty: 0, total: 0 };
    agg[name].qty += o.quantity || 0;
    agg[name].total += o.totalPrice || 0;
  });
  sales.forEach(s => {
    const name = s.productName || 'Unknown';
    if (!agg[name]) agg[name] = { qty: 0, total: 0 };
    agg[name].qty += s.qty || 0;
    agg[name].total += s.total || 0;
  });

  const sorted = Object.entries(agg)
    .sort((a, b) => mode === 'sell' ? b[1].qty - a[1].qty : b[1].total - a[1].total)
    .slice(0, 5);

  const maxVal = sorted.length > 0 ? (mode === 'sell' ? sorted[0][1].qty : sorted[0][1].total) : 1;

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:24px;"><i class="bi bi-box"></i><h3>Belum ada data</h3></div>';
    return;
  }

  container.innerHTML = sorted.map(([name, data], i) => {
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
    const value = mode === 'sell' ? data.qty + ' pcs' : formatCurrency(data.total);
    const pct = (mode === 'sell' ? data.qty / maxVal : data.total / maxVal) * 100;

    return `
      <div class="top-product-item fade-in">
        <span class="top-rank ${rankClass}">${i + 1}</span>
        <div class="top-product-info">
          <strong class="top-product-name">${name}</strong>
          <span class="top-product-meta">${value}</span>
        </div>
        <div class="top-product-bar">
          <div class="top-product-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== INIT ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('statsGrid')) {
    initDashboard();
  }
});