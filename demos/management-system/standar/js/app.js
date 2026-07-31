/* ============================================
   MANAGEMENT SYSTEM - STANDAR
   Core Application: Auth, State, Utilities, Seed Data
   ============================================ */

// ===== GLOBAL STATE =====
const AppState = {
  currentUser: null,
  isLoggedIn: false,
  theme: 'light',
  data: {
    dashboard: null,
    products: [],
    customers: [],
    vendors: [],
    transactions: [],
    notifications: [],
    users: [],
    activities: []
  }
};

// ===== DATA LOADING =====
async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.json();
  } catch (error) {
    console.error('Error loading ' + url + ':', error);
    return null;
  }
}

async function seedAndLoadData() {
  // Clear old/invalid data
  var stored = localStorage.getItem('ms_standar_products');
  if (stored) {
    try {
      var parsed = JSON.parse(stored);
      if (parsed && parsed.length > 0) {
        // Valid data exists, load from localStorage
        loadFromStorage();
        // Check if dashboard data is valid
        if (AppState.data.dashboard && AppState.data.products.length > 0) {
          return; // Data is valid, use it
        }
      }
    } catch(e) {
      // Invalid JSON, will reload from files
    }
  }

  // Load from JSON files
  console.log('Loading data from JSON files...');
  var dashboard = await loadJSON('json/dashboard.json');
  var products = await loadJSON('json/products.json');
  var customers = await loadJSON('json/customers.json');
  var vendors = await loadJSON('json/vendors.json');
  var transactions = await loadJSON('json/transactions.json');
  var notifications = await loadJSON('json/notifications.json');
  var users = await loadJSON('json/users.json');

  if (dashboard) AppState.data.dashboard = dashboard;
  if (products) AppState.data.products = products;
  if (customers) AppState.data.customers = customers;
  if (vendors) AppState.data.vendors = vendors;
  if (transactions) AppState.data.transactions = transactions;
  if (notifications) AppState.data.notifications = notifications;
  if (users) AppState.data.users = users;

  console.log('Data loaded:', AppState.data.products.length, 'products,', AppState.data.customers.length, 'customers');

  // Save to localStorage for future loads
  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem('ms_standar_dashboard', JSON.stringify(AppState.data.dashboard));
  localStorage.setItem('ms_standar_products', JSON.stringify(AppState.data.products));
  localStorage.setItem('ms_standar_customers', JSON.stringify(AppState.data.customers));
  localStorage.setItem('ms_standar_vendors', JSON.stringify(AppState.data.vendors));
  localStorage.setItem('ms_standar_transactions', JSON.stringify(AppState.data.transactions));
  localStorage.setItem('ms_standar_notifications', JSON.stringify(AppState.data.notifications));
  localStorage.setItem('ms_standar_users', JSON.stringify(AppState.data.users));
  localStorage.setItem('ms_standar_seeded', 'true');
}

function loadFromStorage() {
  AppState.data.dashboard = JSON.parse(localStorage.getItem('ms_standar_dashboard') || 'null');
  AppState.data.products = JSON.parse(localStorage.getItem('ms_standar_products') || '[]');
  AppState.data.customers = JSON.parse(localStorage.getItem('ms_standar_customers') || '[]');
  AppState.data.vendors = JSON.parse(localStorage.getItem('ms_standar_vendors') || '[]');
  AppState.data.transactions = JSON.parse(localStorage.getItem('ms_standar_transactions') || '[]');
  AppState.data.notifications = JSON.parse(localStorage.getItem('ms_standar_notifications') || '[]');
  AppState.data.users = JSON.parse(localStorage.getItem('ms_standar_users') || '[]');
  updateNotificationBadge();
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
  const isLoginPage = document.getElementById('loginForm') !== null;
  if (!isLoginPage) {
    if (!checkAuth()) return;
  }

  loadTheme();

  // Sidebar toggle
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
  const closeBtn = document.getElementById('sidebarClose');
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) { e.preventDefault(); doLogout(); });
  }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  // Load data
  await seedAndLoadData();

  // Page-specific init
  try {
    if (document.getElementById('statsGrid')) initDashboard();
    if (document.getElementById('productsTable')) initProducts();
    if (document.getElementById('customersTable')) initCustomers();
    if (document.getElementById('vendorsTable')) initVendors();
    if (document.getElementById('transactionsTable')) initTransactions();
    if (document.getElementById('notificationList')) initNotifications();
  } catch(e) {
    console.error('Page init error:', e);
  }
});

// ===== AUTH =====
function checkAuth() {
  const loggedIn = sessionStorage.getItem('ms_standar_logged_in') === 'true';
  if (!loggedIn) { window.location.href = 'index.html'; return false; }
  const userData = sessionStorage.getItem('ms_standar_user');
  if (userData) { AppState.currentUser = JSON.parse(userData); AppState.isLoggedIn = true; updateUI(); }
  return true;
}

function updateUI() {
  if (!AppState.currentUser) return;
  const user = AppState.currentUser;
  const avatarEl = document.getElementById('userAvatar');
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  if (avatarEl) { avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase(); avatarEl.style.background = user.avatarColor || 'var(--primary-gradient)'; }
  if (nameEl) nameEl.textContent = user.name || 'User';
  if (roleEl) roleEl.textContent = user.role || 'Staff';
}

function doLogout() {
  sessionStorage.removeItem('ms_standar_logged_in');
  sessionStorage.removeItem('ms_standar_user');
  AppState.currentUser = null; AppState.isLoggedIn = false;
  window.location.href = 'index.html';
}

// ===== THEME =====
function loadTheme() {
  const saved = localStorage.getItem('ms_standar_theme') || 'light';
  AppState.theme = saved;
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', AppState.theme);
  localStorage.setItem('ms_standar_theme', AppState.theme);
  showToast(AppState.theme === 'dark' ? 'Mode Gelap Aktif' : 'Mode Terang Aktif', 'info');
}

// ===== SIDEBAR =====
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) { sidebar.classList.toggle('open'); if (overlay) overlay.classList.toggle('open'); }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// ===== TOAST =====
function showToast(message, type, duration) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  type = type || 'success';
  duration = duration || 3500;
  const icons = { success:'bi-check-circle-fill', error:'bi-x-circle-fill', warning:'bi-exclamation-triangle-fill', info:'bi-info-circle-fill' };
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<i class="bi ' + (icons[type] || icons.info) + '"></i> <span>' + message + '</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button><div class="toast-progress"></div>';
  container.appendChild(toast);
  setTimeout(function() {
    if (toast.parentElement) { toast.style.opacity = '0'; toast.style.transform = 'translateX(100px)'; setTimeout(function() { toast.remove(); }, 300); }
  }, duration);
}

// ===== MODAL =====
function openModal(id) { const el = document.getElementById(id); if (el) el.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('active'); document.body.style.overflow = ''; }
document.addEventListener('click', function(e) { if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id); });

// ===== NOTIFICATION BADGE =====
function updateNotificationBadge() {
  const unread = AppState.data.notifications.filter(function(n) { return !n.read; }).length;
  const badge = document.getElementById('notifBadge');
  if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'inline' : 'none'; }
}

// ===== FORMATTERS =====
function formatCurrency(amount) { return 'Rp ' + (amount || 0).toLocaleString('id-ID'); }
function formatDate(dateStr) { if (!dateStr) return '-'; const d = new Date(dateStr + 'T00:00:00'); return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
function formatDateTime(dateStr) { if (!dateStr) return '-'; const d = new Date(dateStr); return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

// ===== BADGE HELPER =====
function statusBadge(status) {
  const map = {
    'Active': 'badge-success','Inactive': 'badge-secondary','Completed': 'badge-success','Approved': 'badge-info',
    'Processing': 'badge-warning','Pending': 'badge-warning','Cancelled': 'badge-danger','Draft': 'badge-secondary',
    'Administrator': 'badge-primary','Manager': 'badge-warning','Staff': 'badge-success',
    'Perusahaan': 'badge-primary','Toko': 'badge-info','Individu': 'badge-secondary',
    'Penjualan': 'badge-success','Pembelian': 'badge-info'
  };
  return '<span class="badge ' + (map[status] || 'badge-secondary') + '">' + status + '</span>';
}

// ===== SKELETON =====
function showSkeleton(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < (count || 3); i++) { container.innerHTML += '<div class="skeleton skeleton-card" style="margin-bottom:12px;"></div>'; }
}

// ===== SET ACTIVE NAV =====
function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(function(item) { item.classList.remove('active'); if (item.dataset.page === page) item.classList.add('active'); });
}

// ===== EXPORT =====
function exportToCSV(data, filename) {
  if (!data || data.length === 0) { showToast('Tidak ada data untuk diexport', 'warning'); return; }
  const headers = Object.keys(data[0]);
  const csvContent = [headers.join(','), ...data.map(function(row) { return headers.map(function(h) { var val = row[h] || ''; if (typeof val === 'string' && val.includes(',')) val = '"' + val + '"'; return val; }).join(','); })].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename + '.csv'; link.click();
  URL.revokeObjectURL(link.href);
  showToast('Data berhasil diexport', 'success');
}

function printPage() { window.print(); showToast('Print dialog dibuka', 'info'); }