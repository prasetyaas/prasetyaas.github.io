/* ============================================
   MANAGEMENT SYSTEM - STANDAR
   Dashboard Page Logic
   ============================================ */

// ===== INIT DASHBOARD =====
function initDashboard() {
  if (!checkAuth()) return;
  setActiveNav('dashboard');

  renderStats();
  renderActivityFeed();
  renderQuickMenu();
  renderCharts();
  renderRecentProducts();
  renderTopProducts();
  renderLatestTransactions();
  renderCalendar();
}

// ===== RENDER STATS =====
function renderStats() {
  var grid = document.getElementById('statsGrid');
  if (!grid) return;

  var d = AppState.data.dashboard;
  var totalRevenue = (d && d.summary && d.summary.totalRevenue) || 0;
  var totalOrders = (d && d.summary && d.summary.totalOrders) || 0;
  var totalProducts = AppState.data.products.length || 0;
  var totalCustomers = (d && d.summary && d.summary.totalCustomers) || 0;
  var lowStock = 0;
  for (var i = 0; i < AppState.data.products.length; i++) {
    if (AppState.data.products[i].stock < 10) lowStock++;
  }

  grid.innerHTML = '<div class="stat-card fade-in">' +
    '<div class="stat-icon stat-icon-primary"><i class="bi bi-currency-dollar" style="font-size:22px;color:#fff;"></i></div>' +
    '<div class="stat-body"><span class="stat-label">Total Pendapatan</span><span class="stat-value">' + formatCurrency(totalRevenue) + '</span>' +
    '<span class="stat-trend stat-trend-up"><i class="bi bi-arrow-up"></i> 12.5%</span></div></div>' +
    '<div class="stat-card fade-in">' +
    '<div class="stat-icon stat-icon-success"><i class="bi bi-cart-check" style="font-size:22px;color:#fff;"></i></div>' +
    '<div class="stat-body"><span class="stat-label">Total Pesanan</span><span class="stat-value">' + totalOrders + '</span>' +
    '<span class="stat-trend stat-trend-up"><i class="bi bi-arrow-up"></i> 8.3%</span></div></div>' +
    '<div class="stat-card fade-in">' +
    '<div class="stat-icon stat-icon-warning"><i class="bi bi-exclamation-triangle" style="font-size:22px;color:#fff;"></i></div>' +
    '<div class="stat-body"><span class="stat-label">Stok Menipis</span><span class="stat-value">' + lowStock + '</span>' +
    '<span class="stat-trend stat-trend-down"><i class="bi bi-arrow-down"></i> ' + (lowStock * 5) + '%</span></div></div>' +
    '<div class="stat-card fade-in">' +
    '<div class="stat-icon stat-icon-purple"><i class="bi bi-people" style="font-size:22px;color:#fff;"></i></div>' +
    '<div class="stat-body"><span class="stat-label">Total Pelanggan</span><span class="stat-value">' + totalCustomers + '</span>' +
    '<span class="stat-trend stat-trend-up"><i class="bi bi-arrow-up"></i> 15.7%</span></div></div>';
}

// ===== RENDER ACTIVITY FEED =====
function renderActivityFeed() {
  var feed = document.getElementById('activityFeed');
  if (!feed) return;

  var activities = (AppState.data.dashboard && AppState.data.dashboard.recentActivities) || [];
  if (activities.length === 0) {
    feed.innerHTML = '<div class="empty-state"><i class="bi bi-activity" style="font-size:48px;color:var(--text-3);opacity:0.4;"></i><h3>Belum ada aktivitas</h3></div>';
    return;
  }

  var html = '';
  for (var i = 0; i < Math.min(activities.length, 6); i++) {
    var act = activities[i];
    var iconClass = act.action === 'Penjualan' ? 'activity-icon-danger' : 'activity-icon-success';
    var iconName = act.action === 'Penjualan' ? 'bi-cart' : 'bi-box-seam';
    html += '<div class="activity-item fade-in">' +
      '<div class="activity-icon ' + iconClass + '"><i class="bi ' + iconName + '"></i></div>' +
      '<div class="activity-content"><strong class="activity-title">' + act.action + ': ' + act.item + '</strong>' +
      '<span class="activity-desc">' + (act.qty > 0 ? act.qty + ' pcs' : '') + ' ' + (act.total > 0 ? '— ' + formatCurrency(act.total) : '') + '</span></div>' +
      '<span class="activity-time">' + act.time + '</span></div>';
  }
  feed.innerHTML = html;
}

// ===== RENDER QUICK MENU =====
function renderQuickMenu() {
  var menu = document.getElementById('quickMenu');
  if (!menu) return;

  menu.innerHTML = '<button class="quick-action-btn fade-in" onclick="window.location.href=\'products.html\'"><i class="bi bi-plus-lg"></i> Tambah Produk</button>' +
    '<button class="quick-action-btn fade-in" onclick="window.location.href=\'transactions.html\'"><i class="bi bi-cart-plus"></i> Transaksi Baru</button>' +
    '<button class="quick-action-btn fade-in" onclick="window.location.href=\'reports.html\'"><i class="bi bi-download"></i> Export Laporan</button>' +
    '<button class="quick-action-btn fade-in" onclick="window.location.href=\'customers.html\'"><i class="bi bi-people"></i> Kelola Customer</button>';
}

// ===== RENDER CHARTS =====
function renderCharts() {
  renderSalesChart();
  renderPieChart();
  renderBarChart();
  renderMonthlyChart();
}

function renderSalesChart() {
  var ctx = document.getElementById('salesChart');
  if (!ctx || typeof Chart === 'undefined') return;

  var weeklySales = (AppState.data.dashboard && AppState.data.dashboard.weeklySales) || [];
  var labels = weeklySales.length > 0 ? weeklySales.map(function(v) { return v.day; }) : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  var data = weeklySales.length > 0 ? weeklySales.map(function(v) { return v.value; }) : [0, 0, 0, 0, 0, 0, 0];

  new Chart(ctx, {
    type: 'line',
    data: { labels: labels, datasets: [{ label: 'Penjualan (Rp)', data: data, borderColor: '#2563EB', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#2563EB', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1E293B', padding: 12, cornerRadius: 8, callbacks: { label: function(context) { return 'Rp ' + context.parsed.y.toLocaleString('id-ID'); } } } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, callback: function(value) { if (value >= 1000000) return 'Rp' + (value / 1000000).toFixed(1) + 'jt'; if (value >= 1000) return 'Rp' + (value / 1000).toFixed(0) + 'rb'; return 'Rp' + value; } } } } }
  });
}

function renderPieChart() {
  var ctx = document.getElementById('pieChart');
  if (!ctx || typeof Chart === 'undefined') return;

  var salesByCategory = (AppState.data.dashboard && AppState.data.dashboard.salesByCategory) || [];
  var hasData = salesByCategory.length > 0;
  var palette = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

  new Chart(ctx, {
    type: 'doughnut',
    data: { labels: hasData ? salesByCategory.map(function(s) { return s.category; }) : ['Belum ada data'], datasets: [{ data: hasData ? salesByCategory.map(function(s) { return s.value; }) : [1], backgroundColor: hasData ? palette.slice(0, salesByCategory.length) : ['#E2E8F0'], borderWidth: 2, borderColor: '#fff', hoverOffset: 8 }] },
    options: { responsive: true, maintainAspectRatio: true, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 11 } } }, tooltip: { backgroundColor: '#1E293B', padding: 12, cornerRadius: 8, callbacks: { label: function(context) { var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0); var pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0; return context.label + ': ' + pct + '%'; } } } } }
  });
}

function renderBarChart() {
  var ctx = document.getElementById('barChart');
  if (!ctx || typeof Chart === 'undefined') return;

  var topProducts = (AppState.data.dashboard && AppState.data.dashboard.topProducts) || [];
  var hasData = topProducts.length > 0;
  var palette = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

  new Chart(ctx, {
    type: 'bar',
    data: { labels: hasData ? topProducts.map(function(p) { return p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name; }) : ['Belum ada data'], datasets: [{ label: 'Penjualan (Rp)', data: hasData ? topProducts.map(function(p) { return p.total; }) : [0], backgroundColor: hasData ? palette.slice(0, topProducts.length) : ['#E2E8F0'], borderRadius: 6, borderSkipped: false, barThickness: 32 }] },
    options: { responsive: true, maintainAspectRatio: true, indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1E293B', padding: 12, cornerRadius: 8, callbacks: { label: function(context) { return 'Rp ' + context.parsed.x.toLocaleString('id-ID'); } } } }, scales: { x: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, callback: function(value) { if (value >= 1000000) return 'Rp' + (value / 1000000).toFixed(1) + 'jt'; if (value >= 1000) return 'Rp' + (value / 1000).toFixed(0) + 'rb'; return 'Rp' + value; } } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } } }
  });
}

function renderMonthlyChart() {
  var ctx = document.getElementById('monthlyChart');
  if (!ctx || typeof Chart === 'undefined') return;

  var monthlyRevenue = (AppState.data.dashboard && AppState.data.dashboard.monthlyRevenue) || [];
  var hasData = monthlyRevenue.length > 0;

  new Chart(ctx, {
    type: 'bar',
    data: { labels: hasData ? monthlyRevenue.map(function(m) { return m.month; }) : ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'], datasets: [{ label: 'Pendapatan', data: hasData ? monthlyRevenue.map(function(m) { return m.value; }) : [0, 0, 0, 0, 0, 0, 0], backgroundColor: hasData ? monthlyRevenue.map(function() { return '#2563EB'; }) : ['#E2E8F0'], borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1E293B', padding: 12, cornerRadius: 8, callbacks: { label: function(context) { return 'Rp ' + context.parsed.y.toLocaleString('id-ID'); } } } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, callback: function(value) { if (value >= 1000000) return 'Rp' + (value / 1000000).toFixed(1) + 'jt'; if (value >= 1000) return 'Rp' + (value / 1000).toFixed(0) + 'rb'; return 'Rp' + value; } } } } }
  });
}

// ===== RENDER RECENT PRODUCTS =====
function renderRecentProducts() {
  var table = document.getElementById('recentProductsTable');
  if (!table) return;

  var products = AppState.data.products.slice().sort(function(a, b) { return b.id - a.id; }).slice(0, 5);

  if (products.length === 0) {
    table.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding:24px;">Belum ada produk</td></tr>';
    return;
  }

  var html = '';
  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    var stockClass = p.stock < 10 ? 'text-danger' : p.stock < 25 ? 'text-warning' : 'text-success';
    html += '<tr><td><strong>' + p.name + '</strong></td><td>' + p.category + '</td><td>' + formatCurrency(p.price) + '</td><td class="' + stockClass + ' fw-600">' + p.stock + '</td></tr>';
  }
  table.innerHTML = html;
}

// ===== RENDER TOP PRODUCTS =====
var topProductsMode = 'sell';

function switchTopProducts(mode) {
  topProductsMode = mode;
  var btns = document.querySelectorAll('.tab-switch button');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle('active', btns[i].dataset.top === mode);
  }
  renderTopProducts();
}

function renderTopProducts() {
  var container = document.getElementById('topProductsList');
  if (!container) return;

  var topProducts = (AppState.data.dashboard && AppState.data.dashboard.topProducts) || [];
  if (topProducts.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:24px;"><i class="bi bi-box" style="font-size:40px;color:var(--text-3);opacity:0.4;"></i><h3>Belum ada data</h3></div>';
    return;
  }

  var maxVal = topProducts[0].total;
  var html = '';
  for (var i = 0; i < topProducts.length; i++) {
    var p = topProducts[i];
    var rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
    var pct = (p.total / maxVal) * 100;
    html += '<div class="top-product-item fade-in"><span class="top-rank ' + rankClass + '">' + (i + 1) + '</span><div class="top-product-info"><strong class="top-product-name">' + p.name + '</strong><span class="top-product-meta">' + p.qty + ' pcs — ' + formatCurrency(p.total) + '</span></div><div class="top-product-bar"><div class="top-product-bar-fill" style="width:' + pct + '%"></div></div></div>';
  }
  container.innerHTML = html;
}

// ===== RENDER LATEST TRANSACTIONS =====
function renderLatestTransactions() {
  var table = document.getElementById('recentTransactions');
  if (!table) return;

  var transactions = (AppState.data.dashboard && AppState.data.dashboard.latestTransactions) || [];
  if (transactions.length === 0) {
    table.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:24px;">Belum ada transaksi</td></tr>';
    return;
  }

  var html = '';
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    html += '<tr><td><strong>' + t.id + '</strong></td><td>' + t.customer + '</td><td>' + t.product + '</td><td>' + formatCurrency(t.amount) + '</td><td>' + statusBadge(t.status) + '</td></tr>';
  }
  table.innerHTML = html;
}

// ===== RENDER CALENDAR =====
function renderCalendar() {
  var container = document.getElementById('calendarWidget');
  if (!container) return;

  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var today = now.getDate();

  var monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();

  var html = '<div class="calendar-header"><h4>' + monthNames[month] + ' ' + year + '</h4><div class="calendar-nav"><button><i class="bi bi-chevron-left"></i></button><button><i class="bi bi-chevron-right"></i></button></div></div><div class="calendar-grid">';

  for (var d = 0; d < dayNames.length; d++) {
    html += '<div class="calendar-day-header">' + dayNames[d] + '</div>';
  }

  for (var i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day other-month"></div>';
  }

  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = d === today ? ' today' : '';
    html += '<div class="calendar-day' + isToday + '">' + d + '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}