/* ============================================
   MANAGEMENT SYSTEM - MAIN
   Core: Auth, Sidebar, Navigation, Toast, Utils
   ============================================ */

// ===== GLOBAL STATE =====
const AppState = {
  currentUser: null,
  isLoggedIn: false,
  products: [],
  users: [],
  orders: [],
  dashboard: null,
  sales: [],
  stocks: []
};

// ===== SEED DATA (localStorage) =====
function seedInitialData() {
  // Seed products
  if (!localStorage.getItem('ms_products')) {
    seedProducts();
  }
  // Seed dashboard
  if (!localStorage.getItem('ms_dashboard')) {
    seedDashboard();
  }
  // Seed sales
  if (!localStorage.getItem('ms_sales')) {
    seedSales();
  }
  // Seed stocks
  if (!localStorage.getItem('ms_stocks')) {
    seedStocks();
  }
  // Load from localStorage
  reloadFromStorage();
}

function seedDashboard() {
  const dashboard = {
    summary: {
      totalProducts: 20, totalOrders: 20, totalRevenue: 89165000, totalCustomers: 12,
      activeUsers: 6, lowStockItems: 4, monthlyGrowth: 12.5,
      weeklySales: [
        {day:"Senin",value:4500000},{day:"Selasa",value:6200000},{day:"Rabu",value:3800000},
        {day:"Kamis",value:7100000},{day:"Jumat",value:8900000},{day:"Sabtu",value:5400000},{day:"Minggu",value:3200000}
      ],
      salesByCategory: [
        {category:"Elektronik",value:42},{category:"Fashion",value:20},
        {category:"Makanan & Minuman",value:18},{category:"Rumah Tangga",value:12},{category:"Otomotif",value:8}
      ],
      recentActivities: [
        {action:"Penjualan",item:"Laptop Asus ROG Zephyrus G14",qty:2,total:37000000,time:"2 jam lalu"},
        {action:"Penjualan",item:"Mouse Wireless Logitech",qty:3,total:825000,time:"5 jam lalu"},
        {action:"Restock",item:"Kopi Arabika Gayo 250gr",qty:10,total:0,time:"1 hari lalu"},
        {action:"Penjualan",item:"Kemeja Oxford Premium",qty:10,total:1850000,time:"1 hari lalu"},
        {action:"Penjualan",item:"Snack Keripik Singkong",qty:25,total:625000,time:"2 hari lalu"},
        {action:"Restock",item:"Jaket Hoodie Cotton Premium",qty:15,total:0,time:"2 hari lalu"},
        {action:"Penjualan",item:"Set Piring Keramik 6pcs",qty:4,total:580000,time:"3 hari lalu"},
        {action:"Penjualan",item:"Headset Gaming SteelSeries",qty:3,total:2250000,time:"4 hari lalu"},
        {action:"Restock",item:"Teh Hijau Premium 50gr",qty:20,total:0,time:"4 hari lalu"},
        {action:"Penjualan",item:"Monitor Dell 27\" 4K",qty:2,total:9000000,time:"5 hari lalu"}
      ]
    }
  };
  localStorage.setItem('ms_dashboard', JSON.stringify(dashboard));
}

function seedSales() {
  const sales = [
    { id: 1, productId: 1, productName: 'Laptop Asus ROG Zephyrus G14', qty: 2, price: 18500000, total: 37000000, note: 'Pesanan corporate', date: '2026-07-25T10:30:00' },
    { id: 2, productId: 4, productName: 'Mouse Wireless Logitech MX Master 3S', qty: 3, price: 275000, total: 825000, note: 'Butuh cepat', date: '2026-07-24T14:15:00' },
    { id: 3, productId: 2, productName: 'Kemeja Oxford Premium Slim Fit', qty: 10, price: 185000, total: 1850000, note: 'Restock bulanan', date: '2026-07-24T09:00:00' },
    { id: 4, productId: 10, productName: 'Snack Keripik Singkong 500gr', qty: 25, price: 25000, total: 625000, note: 'Restock mingguan', date: '2026-07-23T16:45:00' },
    { id: 5, productId: 5, productName: 'Set Piring Keramik 6pcs', qty: 4, price: 145000, total: 580000, note: '', date: '2026-07-22T11:20:00' },
    { id: 6, productId: 13, productName: 'Headset Gaming SteelSeries', qty: 3, price: 750000, total: 2250000, note: 'Pesanan online', date: '2026-07-21T13:30:00' },
    { id: 7, productId: 18, productName: 'Monitor Dell 27" 4K', qty: 2, price: 4500000, total: 9000000, note: 'Butuh cepat', date: '2026-07-20T08:00:00' },
    { id: 8, productId: 8, productName: 'Jaket Hoodie Cotton Premium', qty: 6, price: 210000, total: 1260000, note: '', date: '2026-07-19T15:10:00' }
  ];
  localStorage.setItem('ms_sales', JSON.stringify(sales));
}

function seedStocks() {
  const stocks = [
    { id: 1, productId: 3, productName: 'Kopi Arabika Gayo 250gr', qty: 10, supplier: 'UD Sembako Sejahtera', note: 'Restok rutin', date: '2026-07-24T10:00:00' },
    { id: 2, productId: 8, productName: 'Jaket Hoodie Cotton Premium', qty: 15, supplier: 'CV Fashion Indah', note: 'Stok baru', date: '2026-07-23T14:30:00' },
    { id: 3, productId: 15, productName: 'Teh Hijau Premium 50gr', qty: 20, supplier: 'UD Sembako Sejahtera', note: 'Restok', date: '2026-07-22T09:15:00' },
    { id: 4, productId: 13, productName: 'Headset Gaming SteelSeries', qty: 10, supplier: 'PT Teknologi Maju', note: 'Produk baru', date: '2026-07-20T11:00:00' },
    { id: 5, productId: 20, productName: 'Beras Premium 5kg', qty: 30, supplier: 'UD Sembako Sejahtera', note: 'Stok gudang', date: '2026-07-19T08:30:00' }
  ];
  localStorage.setItem('ms_stocks', JSON.stringify(stocks));
}

function reloadFromStorage() {
  AppState.products = JSON.parse(localStorage.getItem('ms_products') || '[]');
  AppState.sales = JSON.parse(localStorage.getItem('ms_sales') || '[]');
  AppState.stocks = JSON.parse(localStorage.getItem('ms_stocks') || '[]');
  AppState.dashboard = JSON.parse(localStorage.getItem('ms_dashboard') || 'null');
}

function seedProducts() {
  const products = [
    {"id":1,"name":"Laptop Asus ROG Zephyrus G14","category":"Elektronik","supplier":"PT Teknologi Maju","price":18500000,"stock":15,"unit":"pcs","status":"Active","createdAt":"2026-01-15","description":"Laptop gaming dengan Ryzen 9, RTX 4060, RAM 16GB"},
    {"id":2,"name":"Kemeja Oxford Premium Slim Fit","category":"Fashion","supplier":"CV Fashion Indah","price":185000,"stock":42,"unit":"pcs","status":"Active","createdAt":"2026-02-10","description":"Kemeja formal bahan oxford premium"},
    {"id":3,"name":"Kopi Arabika Gayo 250gr","category":"Makanan & Minuman","supplier":"UD Sembako Sejahtera","price":55000,"stock":8,"unit":"pack","status":"Active","createdAt":"2026-03-05","description":"Kopi arabika asli Gayo Aceh"},
    {"id":4,"name":"Mouse Wireless Logitech MX Master 3S","category":"Elektronik","supplier":"PT Teknologi Maju","price":275000,"stock":5,"unit":"pcs","status":"Active","createdAt":"2026-01-20","description":"Mouse wireless premium 8K DPI"},
    {"id":5,"name":"Set Piring Keramik 6pcs","category":"Rumah Tangga","supplier":"CV Rumah Indah","price":145000,"stock":22,"unit":"set","status":"Active","createdAt":"2026-04-01","description":"Piring keramik putih polos 6 pcs"},
    {"id":6,"name":"Oli Mobil Castrol GTX 1L","category":"Otomotif","supplier":"PT Sparepart Motor","price":85000,"stock":3,"unit":"botol","status":"Active","createdAt":"2026-02-28","description":"Oli mesin mobil 10W-40"},
    {"id":7,"name":"Smartphone Samsung Galaxy S24","category":"Elektronik","supplier":"PT Teknologi Maju","price":12000000,"stock":10,"unit":"pcs","status":"Active","createdAt":"2026-05-10","description":"Smartphone flagship Samsung"},
    {"id":8,"name":"Jaket Hoodie Cotton Premium","category":"Fashion","supplier":"CV Fashion Indah","price":210000,"stock":28,"unit":"pcs","status":"Active","createdAt":"2026-03-15","description":"Jaket hoodie bahan cotton fleece"},
    {"id":9,"name":"Air Purifier Xiaomi Mi 4","category":"Elektronik","supplier":"PT Teknologi Maju","price":1850000,"stock":7,"unit":"pcs","status":"Active","createdAt":"2026-04-20","description":"Air purifier dengan filter HEPA"},
    {"id":10,"name":"Snack Keripik Singkong 500gr","category":"Makanan & Minuman","supplier":"UD Sembako Sejahtera","price":25000,"stock":60,"unit":"pack","status":"Active","createdAt":"2026-06-01","description":"Keripik singkong original renyah"},
    {"id":11,"name":"Meja Kantor Minimalis 120cm","category":"Rumah Tangga","supplier":"CV Rumah Indah","price":850000,"stock":12,"unit":"pcs","status":"Active","createdAt":"2026-05-25","description":"Meja kantor minimalis warna putih"},
    {"id":12,"name":"Ban Motor Michelin City Grip","category":"Otomotif","supplier":"PT Sparepart Motor","price":350000,"stock":1,"unit":"pcs","status":"Active","createdAt":"2026-06-15","description":"Ban motor tubeless ukuran 80/90-17"},
    {"id":13,"name":"Headset Gaming SteelSeries","category":"Elektronik","supplier":"PT Teknologi Maju","price":750000,"stock":18,"unit":"pcs","status":"Active","createdAt":"2026-06-20","description":"Headset gaming dengan surround sound 7.1"},
    {"id":14,"name":"Celana Chino Slim Fit","category":"Fashion","supplier":"CV Fashion Indah","price":165000,"stock":35,"unit":"pcs","status":"Active","createdAt":"2026-05-05","description":"Celana chino bahan katun stretch"},
    {"id":15,"name":"Teh Hijau Premium 50gr","category":"Makanan & Minuman","supplier":"UD Sembako Sejahtera","price":35000,"stock":25,"unit":"pack","status":"Active","createdAt":"2026-07-01","description":"Teh hijau premium dari perkebunan lokal"},
    {"id":16,"name":"Lampu Meja LED","category":"Rumah Tangga","supplier":"CV Rumah Indah","price":125000,"stock":30,"unit":"pcs","status":"Active","createdAt":"2026-06-10","description":"Lampu meja LED dengan pengaturan kecerahan"},
    {"id":17,"name":"Aki Mobil GS Astra 12V","category":"Otomotif","supplier":"PT Sparepart Motor","price":650000,"stock":4,"unit":"pcs","status":"Active","createdAt":"2026-05-15","description":"Aki mobil kering 12V 45Ah"},
    {"id":18,"name":"Monitor Dell 27\" 4K","category":"Elektronik","supplier":"PT Teknologi Maju","price":4500000,"stock":6,"unit":"pcs","status":"Active","createdAt":"2026-07-05","description":"Monitor Dell U2723QE 4K IPS"},
    {"id":19,"name":"Sandal Gunung Eiger","category":"Fashion","supplier":"CV Fashion Indah","price":185000,"stock":20,"unit":"pcs","status":"Active","createdAt":"2026-06-25","description":"Sandal gunung premium sol karet"},
    {"id":20,"name":"Beras Premium 5kg","category":"Makanan & Minuman","supplier":"UD Sembako Sejahtera","price":75000,"stock":45,"unit":"karung","status":"Active","createdAt":"2026-07-10","description":"Beras premium kualitas terbaik"}
  ];
  localStorage.setItem('ms_products', JSON.stringify(products));
}

function saveProducts() {
  localStorage.setItem('ms_products', JSON.stringify(AppState.products));
}

function saveSales() {
  localStorage.setItem('ms_sales', JSON.stringify(AppState.sales));
}

function saveStocks() {
  localStorage.setItem('ms_stocks', JSON.stringify(AppState.stocks));
}

// ===== AUTHENTICATION =====
function checkAuth() {
  const loggedIn = sessionStorage.getItem('ms_basic_logged_in') === 'true';
  if (!loggedIn) {
    window.location.href = 'index.html';
    return false;
  }
  const userData = sessionStorage.getItem('ms_basic_user');
  if (userData) {
    AppState.currentUser = JSON.parse(userData);
    AppState.isLoggedIn = true;
    updateUI();
  }
  return true;
}

function updateUI() {
  if (!AppState.currentUser) return;
  const user = AppState.currentUser;
  const avatarEl = document.getElementById('userAvatar');
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');

  if (avatarEl) {
    avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
    avatarEl.style.background = user.avatarColor || 'var(--primary-gradient)';
  }
  if (nameEl) nameEl.textContent = user.name || 'User';
  if (roleEl) roleEl.textContent = user.role || 'Staff';
}

function doLogout() {
  sessionStorage.removeItem('ms_basic_logged_in');
  sessionStorage.removeItem('ms_basic_user');
  AppState.currentUser = null;
  AppState.isLoggedIn = false;
  window.location.href = 'index.html';
}

// ===== SIDEBAR =====
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// ===== TOAST =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<i class="bi ' + (icons[type] || icons.info) + '"></i> ' + message +
    '<button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

// ===== MODAL =====
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

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

async function loadAllData() {
  // Load non-localStorage data from JSON
  const [users, orders, dashboard] = await Promise.all([
    loadJSON('json/users.json'),
    loadJSON('json/orders.json'),
    loadJSON('json/dashboard.json')
  ]);

  if (users) AppState.users = users;
  if (orders) AppState.orders = orders;
  if (dashboard) AppState.dashboard = dashboard;

  // Seed & load localStorage data (products, sales, stocks)
  seedInitialData();

  return { products: AppState.products, users, orders, dashboard };
}

// ===== FORMATTERS =====
function formatCurrency(amount) {
  return 'Rp ' + (amount || 0).toLocaleString('id-ID');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ===== BADGE HELPER =====
function statusBadge(status) {
  const map = {
    'Active': 'badge-success',
    'Inactive': 'badge-secondary',
    'Completed': 'badge-success',
    'Processing': 'badge-warning',
    'Shipped': 'badge-info',
    'Pending': 'badge-warning',
    'Cancelled': 'badge-danger',
    'Administrator': 'badge-primary',
    'Manager': 'badge-warning',
    'Staff': 'badge-success'
  };
  const cls = map[status] || 'badge-secondary';
  return '<span class="badge ' + cls + '">' + status + '</span>';
}

// ===== SKELETON LOADING =====
function showSkeleton(containerId, count = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="skeleton skeleton-card" style="margin-bottom:12px;">
        <div class="skeleton skeleton-text" style="width:80%;"></div>
        <div class="skeleton skeleton-text-sm"></div>
      </div>
    `;
  }
}

function hideSkeleton(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.skeleton').forEach(el => el.remove());
}

// ===== SIDEBAR ACTIVE LINK =====
function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);

  const closeBtn = document.getElementById('sidebarClose');
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      doLogout();
    });
  }

  document.querySelectorAll('.alert-dismissible').forEach(el => {
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 4000);
  });
});