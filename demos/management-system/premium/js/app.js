/* ============================================
   NexaWMS Pro — App Shell: router, sidebar, topbar
   ============================================ */

const App = {

  currentPage: 'dashboard',
  currentGroup: null,
  isLoggedIn: false,
  searchTimer: null,

  /** ---------- INIT ---------- */
  init() {
    DB.ensure();
    // Ensure sidebar is expanded by default
    const sbEl = document.getElementById('sidebar');
    if (sbEl.classList.contains('collapsed')) sbEl.classList.remove('collapsed');
    const mainEl = document.querySelector('.main');
    if (mainEl) mainEl.classList.remove('shifted');
    this.renderSidebar();
    this.bindLogin();
    this.updateStorageBar();

    const saved = sessionStorage.getItem('nexawms_session');
    if (saved === '1') {
      this.login();
    }

    // global keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('globalSearch').focus();
      }
    });

    // document click to close dropdowns
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.notif-wrap') && !e.target.closest('.quick-menu') && !e.target.closest('#quickCreateBtn')) {
        this.closeAll();
      }
    });
  },

  /** ---------- LOGIN ---------- */
  bindLogin() {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.login();
    });
  },

  login() {
    this.isLoggedIn = true;
    sessionStorage.setItem('nexawms_session', '1');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    this.navigate('dashboard');
    setTimeout(() => Toast.show('Selamat datang di NexaWMS Pro ☺', 'success'), 400);
  },

  logout() {
    this.isLoggedIn = false;
    sessionStorage.removeItem('nexawms_session');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    Toast.show('Anda telah keluar dari sistem', 'info');
  },

  openProfile() {
    AdminPage.profile();
  },

  /* ---------- SIDEBAR ---------- */
  sidebarStructure: [
    {
      id: 'grp-main',
      title: '',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: I.dash }
      ]
    },
    {
      id: 'grp-insights',
      title: 'Insights',
      items: [
        { id: 'analytics', label: 'Analytics', icon: I.chart },
        { id: 'forecast', label: 'Forecast', icon: I.forecast },
        { id: 'report', label: 'Report', icon: I.file },
        { id: 'aging', label: 'Inventory Aging', icon: I.clock },
        { id: 'abc', label: 'ABC Analysis', icon: I.abc },
        { id: 'deadstock', label: 'Dead Stock', icon: I.skull }
      ]
    },
    {
      id: 'grp-operations',
      title: 'Operations',
      items: [
        { id: 'purchase', label: 'Purchase', icon: I.cart },
        { id: 'receiving', label: 'Receiving', icon: I.truck },
        { id: 'transfer', label: 'Transfer', icon: I.swap },
        { id: 'movement', label: 'Stock Movement', icon: I.activity },
        { id: 'adjustment', label: 'Adjustment', icon: I.sliders },
        { id: 'reservation', label: 'Reservation', icon: I.lock },
        { id: 'issue', label: 'Issue', icon: I.rotate },
        { id: 'return', label: 'Return', icon: I.refresh },
        { id: 'cyclecount', label: 'Cycle Count', icon: I.check }
      ]
    },
    {
      id: 'grp-catalog',
      title: 'Catalog',
      items: [
        { id: 'products', label: 'Products', icon: I.package },
        { id: 'categories', label: 'Categories', icon: I.tag },
        { id: 'brand', label: 'Brand', icon: I.medal },
        { id: 'unit', label: 'Unit', icon: I.box },
        { id: 'pricelist', label: 'Price List', icon: I.database },
        { id: 'supplier', label: 'Supplier', icon: I.factory },
        { id: 'customer', label: 'Customer', icon: I.users }
      ]
    },
    {
      id: 'grp-warehouse',
      title: 'Warehouse',
      items: [
        { id: 'warehouse', label: 'Warehouse', icon: I.home },
        { id: 'location', label: 'Location', icon: I.mapPin },
        { id: 'rack', label: 'Rack', icon: I.grid },
        { id: 'zone', label: 'Zone', icon: I.layers },
        { id: 'capacity', label: 'Capacity', icon: I.gauge },
        { id: 'stockmap', label: 'Stock Map', icon: I.map }
      ]
    },
    {
      id: 'grp-admin',
      title: 'Administration',
      items: [
        { id: 'user', label: 'User', icon: I.user },
        { id: 'role', label: 'Role', icon: I.badge },
        { id: 'permission', label: 'Permission', icon: I.shield },
        { id: 'automation', label: 'Automation', icon: I.zap },
        { id: 'notification', label: 'Notification', icon: I.bell },
        { id: 'backup', label: 'Backup', icon: I.archive },
        { id: 'api', label: 'API', icon: I.key },
        { id: 'auditlog', label: 'Audit Log', icon: I.list }
      ]
    }
  ],

  pageToGroup: {
    dashboard: 'grp-main',
    analytics: 'grp-insights', forecast: 'grp-insights', report: 'grp-insights',
    aging: 'grp-insights', abc: 'grp-insights', deadstock: 'grp-insights',
    purchase: 'grp-operations', receiving: 'grp-operations', transfer: 'grp-operations',
    movement: 'grp-operations', adjustment: 'grp-operations', reservation: 'grp-operations',
    issue: 'grp-operations', return: 'grp-operations', cyclecount: 'grp-operations',
    products: 'grp-catalog', categories: 'grp-catalog', brand: 'grp-catalog',
    unit: 'grp-catalog', pricelist: 'grp-catalog', supplier: 'grp-catalog', customer: 'grp-catalog',
    warehouse: 'grp-warehouse', location: 'grp-warehouse', rack: 'grp-warehouse',
    zone: 'grp-warehouse', capacity: 'grp-warehouse', stockmap: 'grp-warehouse',
    user: 'grp-admin', role: 'grp-admin', permission: 'grp-admin', automation: 'grp-admin',
    notification: 'grp-admin', backup: 'grp-admin', api: 'grp-admin', auditlog: 'grp-admin'
  },

  getOpenGroups() {
    try { return JSON.parse(localStorage.getItem('nexawms_open_groups') || '[]'); }
    catch (e) { return []; }
  },

  saveOpenGroups(groups) {
    localStorage.setItem('nexawms_open_groups', JSON.stringify(groups));
  },

  toggleGroup(groupId) {
    const groups = this.getOpenGroups();
    const idx = groups.indexOf(groupId);
    if (idx >= 0) groups.splice(idx, 1);
    else groups.push(groupId);
    this.saveOpenGroups(groups);
    const sub = document.getElementById('navsub-' + groupId);
    if (sub) sub.classList.toggle('open');
    const title = document.getElementById('navtitle-' + groupId);
    if (title) title.classList.toggle('open');
  },

  renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    const isCollapsed = document.getElementById('sidebar').classList.contains('collapsed');
    const openGroups = this.getOpenGroups();
    let html = '';
    this.sidebarStructure.forEach(group => {
      html += '<div class="nav-group ' + (isCollapsed ? 'collapsed' : '') + '" data-group="' + esc(group.title) + '">';
      if (group.title) {
        const isOpen = openGroups.includes(group.id);
        html += '<div class="nav-group-title clickable ' + (isOpen ? 'open' : '') + '" id="navtitle-' + group.id + '" onclick="App.toggleGroup(\'' + group.id + '\')">'
          + '<span class="ng-ic">' + group.title.charAt(0) + '</span>'
          + '<span>' + (isCollapsed ? '' : esc(group.title)) + '</span>'
          + '<span class="ng-line"></span>'
          + (isCollapsed ? '' : '<span class="nav-chevron">' + I.chevron + '</span>')
          + '</div>';
        html += '<div class="nav-sub ' + (isOpen ? 'open' : '') + '" id="navsub-' + group.id + '">';
        group.items.forEach(item => {
          html += '<div class="nav-item">'
            + '<a class="nav-sub-link" data-page="' + item.id + '" onclick="App.navigate(\'' + item.id + '\')" title="' + esc(item.label) + '">'
            + '<span class="nav-label">' + esc(item.label) + '</span></a></div>';
        });
        html += '</div>';
      } else {
        group.items.forEach(item => {
          html += '<div class="nav-item">'
            + '<a class="nav-link" data-page="' + item.id + '" onclick="App.navigate(\'' + item.id + '\')" title="' + esc(item.label) + '">'
            + item.icon + '<span class="nav-label">' + esc(item.label) + '</span></a></div>';
        });
      }
      html += '</div>';
    });
    nav.innerHTML = html;
    this.highlightNav(this.currentPage);
  },

  highlightNav(page) {
    document.querySelectorAll('.nav-link, .nav-sub-link').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
  },

  toggleSidebar(forceOpen = false) {
    const sb = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
      if (forceOpen) sb.classList.add('mobile-open');
      else sb.classList.toggle('mobile-open');
    } else {
      sb.classList.toggle('collapsed');
      document.querySelector('.main').classList.toggle('shifted', sb.classList.contains('collapsed'));
      this.renderSidebar();
    }
  },

  /** ---------- ROUTER ---------- */
  routes: {
    dashboard: { title: 'Dashboard', page: () => DashboardPage.render() },
    analytics: { title: 'Analytics', page: () => InsightsPage.analytics() },
    forecast: { title: 'Forecast', page: () => InsightsPage.forecast() },
    report: { title: 'Report', page: () => InsightsPage.report() },
    aging: { title: 'Inventory Aging', page: () => InsightsPage.aging() },
    abc: { title: 'ABC Analysis', page: () => InsightsPage.abc() },
    deadstock: { title: 'Dead Stock', page: () => InsightsPage.deadStock() },
    purchase: { title: 'Purchase', page: () => OperationsPage.purchase() },
    receiving: { title: 'Receiving', page: () => OperationsPage.receiving() },
    transfer: { title: 'Transfer', page: () => OperationsPage.transfer() },
    movement: { title: 'Stock Movement', page: () => OperationsPage.movement() },
    adjustment: { title: 'Adjustment', page: () => OperationsPage.adjustment() },
    reservation: { title: 'Reservation', page: () => OperationsPage.reservation() },
    issue: { title: 'Issue', page: () => OperationsPage.issue() },
    return: { title: 'Return', page: () => OperationsPage.returnPage() },
    cyclecount: { title: 'Cycle Count', page: () => OperationsPage.cycleCount() },
    products: { title: 'Products', page: () => CatalogPage.products() },
    categories: { title: 'Categories', page: () => CatalogPage.categories() },
    brand: { title: 'Brand', page: () => CatalogPage.brands() },
    unit: { title: 'Unit', page: () => CatalogPage.units() },
    pricelist: { title: 'Price List', page: () => CatalogPage.priceList() },
    supplier: { title: 'Supplier', page: () => CatalogPage.suppliers() },
    customer: { title: 'Customer', page: () => CatalogPage.customers() },
    warehouse: { title: 'Warehouse', page: () => WarehousePage.warehouses() },
    location: { title: 'Location', page: () => WarehousePage.locations() },
    rack: { title: 'Rack', page: () => WarehousePage.racks() },
    zone: { title: 'Zone', page: () => WarehousePage.zones() },
    capacity: { title: 'Capacity', page: () => WarehousePage.capacity() },
    stockmap: { title: 'Stock Map', page: () => WarehousePage.stockMap() },
    user: { title: 'User', page: () => AdminPage.users() },
    role: { title: 'Role', page: () => AdminPage.roles() },
    permission: { title: 'Permission', page: () => AdminPage.permissions() },
    automation: { title: 'Automation', page: () => AdminPage.automation() },
    notification: { title: 'Notification', page: () => AdminPage.notifications() },
    backup: { title: 'Backup', page: () => AdminPage.backup() },
    api: { title: 'API', page: () => AdminPage.api() },
    auditlog: { title: 'Audit Log', page: () => AdminPage.auditLog() },
    profile: { title: 'Profile', page: () => AdminPage.profile() }
  },

  navigate(page) {
    const route = this.routes[page];
    if (!route) { page = 'dashboard'; }
    this.currentPage = page || 'dashboard';
    const r = this.routes[this.currentPage];

    // Auto-open parent group so the active page is visible
    const targetGroup = this.pageToGroup[this.currentPage];
    if (targetGroup && targetGroup !== 'grp-main') {
      const open = this.getOpenGroups();
      if (!open.includes(targetGroup)) {
        open.push(targetGroup);
        this.saveOpenGroups(open);
      }
      const sub = document.getElementById('navsub-' + targetGroup);
      if (sub) sub.classList.add('open');
      const title = document.getElementById('navtitle-' + targetGroup);
      if (title) title.classList.add('open');
    }

    document.getElementById('pageTitle').textContent = r.title;
    this.highlightNav(this.currentPage);

    const content = document.getElementById('pageContent');
    content.innerHTML = '<div class="loading-block"><div class="spinner"></div></div>';

    // close mobile sidebar & dropdowns
    document.getElementById('sidebar').classList.remove('mobile-open');
    this.closeAll();

    setTimeout(() => {
      try {
        r.page();
      } catch (err) {
        console.error('Page error:', err);
        content.innerHTML = '<div class="empty-state"><div class="es-ic">⚠</div>'
          + '<p>Terjadi kesalahan saat memuat halaman</p><small>' + esc(err.message) + '</small></div>';
      }
      content.scrollTop = 0;
      window.scrollTo(0, 0);
    }, 60);
  },

  /** ---------- PAGE HEADER HELPER ---------- */
  pageHeader(icon, title, desc, actions = '') {
    return '<div class="page-head">'
      + '<div class="page-title">'
      + '<h2><span class="pt-ic">' + icon + '</span> ' + esc(title) + '</h2>'
      + '<p>' + esc(desc) + '</p>'
      + '</div>'
      + '<div class="page-actions">' + actions + '</div>'
      + '</div>';
  },

  /** ---------- NOTIFICATIONS ---------- */
  unreadCount() {
    return DB.get('notifications').filter(n => !n.read).length;
  },

  renderNotifPanel() {
    const panel = document.getElementById('notifPanel');
    const notifs = [...DB.get('notifications')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unread = this.unreadCount();
    const dot = document.getElementById('notifDot');
    dot.textContent = unread;
    dot.style.display = unread > 0 ? 'flex' : 'none';

    let html = '<div class="notif-head">'
      + '<strong> Notifikasi</strong>'
      + '<a href="#" onclick="App.markAllRead();return false;">Tandai semua dibaca</a>'
      + '</div><div class="notif-list">';

    if (!notifs.length) {
      html += '<div class="empty-state" style="padding:30px"><div class="es-ic"></div><p>Tidak ada notifikasi</p></div>';
    } else {
      notifs.slice(0, 10).forEach(n => {
        const time = DB.fmtDateTime(n.createdAt);
        const color = { warning: '#f59e0b', danger: '#ef4444', success: '#10b981', info: '#3b82f6' }[n.type] || '#6366f1';
        html += '<div class="notif-item ' + (n.read ? '' : 'unread') + '" onclick="App.openNotif(\'' + n.id + '\')">'
          + '<div class="notif-ic" style="background:' + color + '22;color:' + color + '">' + n.icon + '</div>'
          + '<div><p><strong>' + esc(n.title) + '</strong><br>' + esc(n.message) + '</p><small>' + time + '</small></div>'
          + '<span class="n-time">' + this.timeAgo(n.createdAt) + '</span></div>';
      });
    }
    html += '</div>'
      + '<div style="padding:12px;border-top:1px solid var(--border);text-align:center">'
      + '<a href="#" onclick="App.navigate(\'notification\');return false;" style="font-size:12.5px">Lihat semua notifikasi →</a>'
      + '</div>';
    panel.innerHTML = html;
  },

  toggleNotif() {
    const panel = document.getElementById('notifPanel');
    const isOpen = panel.classList.contains('show');
    this.closeAll();
    if (!isOpen) {
      this.renderNotifPanel();
      panel.classList.add('show');
      // No overlay — overlay would block interaction with the dropdown
    }
  },

  openNotif(id) {
    const n = DB.find('notifications', id);
    if (n && !n.read) {
      DB.update('notifications', id, { read: true });
      this.renderNotifPanel();
      this.updateStorageBar();
    }
    this.navigate('notification');
  },

  markAllRead() {
    DB.get('notifications').forEach(n => DB.update('notifications', n.id, { read: true }));
    this.renderNotifPanel();
    Toast.show('Semua notifikasi ditandai dibaca', 'success');
  },

  timeAgo(iso) {
    const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 60) return 'baru saja';
    if (sec < 3600) return Math.floor(sec / 60) + 'm lalu';
    if (sec < 86400) return Math.floor(sec / 3600) + 'j lalu';
    return Math.floor(sec / 86400) + 'h lalu';
  },

  /** ---------- GLOBAL SEARCH ---------- */
  globalSearch(q) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const box = document.getElementById('searchResults');
      if (!q || q.length < 2) { box.classList.remove('show'); return; }

      const ql = q.toLowerCase();
      const results = [];

      DB.get('products').filter(p => p.name.toLowerCase().includes(ql) || p.sku.toLowerCase().includes(ql)).slice(0, 5)
        .forEach(p => results.push({ cat: 'Produk', label: p.name, sub: p.sku, action: () => this.navigate('products') }));

      DB.get('suppliers').filter(s => s.name.toLowerCase().includes(ql)).slice(0, 3)
        .forEach(s => results.push({ cat: 'Supplier', label: s.name, sub: s.city, action: () => this.navigate('supplier') }));

      DB.get('customers').filter(c => c.name.toLowerCase().includes(ql)).slice(0, 3)
        .forEach(c => results.push({ cat: 'Customer', label: c.name, sub: c.city, action: () => this.navigate('customer') }));

      DB.get('purchases').filter(p => p.number.toLowerCase().includes(ql)).slice(0, 3)
        .forEach(p => results.push({ cat: 'PO', label: p.number, sub: DB.supplierName(p.supplierId), action: () => this.navigate('purchase') }));

      this.__searchResults = results;

      if (!results.length) {
        box.innerHTML = '<div class="sr-empty">Tidak ditemukan hasil untuk "<strong>' + esc(q) + '</strong>"</div>';
      } else {
        box.innerHTML = results.map((r, i) =>
          '<div class="sr-item" onclick="App.searchGo(' + i + ')">'
          + '<span class="sr-cat">' + r.cat + '</span>'
          + '<span class="sr-label">' + esc(r.label) + '</span>'
          + '<span class="sr-sub">' + esc(r.sub) + '</span></div>'
        ).join('');
      }
      box.classList.add('show');
    }, 200);
  },

  searchGo(idx) {
    const box = document.getElementById('searchResults');
    box.classList.remove('show');
    document.getElementById('globalSearch').value = '';
    const results = this.__searchResults || [];
    const r = results[idx];
    if (r && r.action) r.action();
  },

  /** ---------- QUICK CREATE ---------- */
  quickMenuOpen: false,

  quickCreate() {
    if (this.quickMenuOpen) { this.closeAll(); return; }
    this.closeAll();
    const menu = document.createElement('div');
    menu.className = 'quick-menu';
    menu.id = 'quickMenu';
    menu.innerHTML = ''
      + '<button class="qm-item" onclick="App.quickGo(\'products\')"><span class="qm-ic"></span> Produk Baru</button>'
      + '<button class="qm-item" onclick="App.quickGo(\'purchase\')"><span class="qm-ic"></span> Purchase Order</button>'
      + '<button class="qm-item" onclick="App.quickGo(\'issue\')"><span class="qm-ic"></span> Buat Issue</button>'
      + '<button class="qm-item" onclick="App.quickGo(\'transfer\')"><span class="qm-ic"></span> Transfer Stok</button>'
      + '<button class="qm-item" onclick="App.quickGo(\'adjustment\')"><span class="qm-ic"></span> Adjustment Stok</button>'
      + '<button class="qm-item" onclick="App.quickGo(\'supplier\')"><span class="qm-ic"></span> Supplier Baru</button>';
    document.body.appendChild(menu);
    this.quickMenuOpen = true;
    document.getElementById('overlay').classList.add('show');
  },

  quickGo(page) {
    this.closeAll();
    this.navigate(page);
  },

  /** ---------- CLOSE / OVERLAY ---------- */
  closeAll() {
    document.getElementById('notifPanel').classList.remove('show');
    const qm = document.getElementById('quickMenu');
    if (qm) qm.remove();
    this.quickMenuOpen = false;
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.remove('show');
  },

  /** ---------- STORAGE BAR ---------- */
  updateStorageBar() {
    const total = DB.get('products').length || 1;
    const usedPct = Math.min(97, 62 + Math.round((total - 24) * 0.35));
    document.getElementById('storagePct').textContent = usedPct + '%';
    document.getElementById('storageBar').style.width = usedPct + '%';
  },

  /** ---------- TOAST SHORTCUT ---------- */
  toast(msg, type = 'success') {
    Toast.show(msg, type);
  }
};

/* ---------- BOOT ---------- */
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;