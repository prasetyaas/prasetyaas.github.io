/* ============================================
   AutoNexa — App Shell: workspace switcher, tool drawer, router
   ============================================ */

const App = {

  currentWs: 'hub',
  currentTool: null,
  isLoggedIn: false,
  searchTimer: null,

  /* ---------- WORKSPACE DEFINITIONS ---------- */
  workspaces: {
    hub: {
      title: 'Workspace Hub',
      icon: '🏠',
      tools: [
        { id: 'overview',     label: 'Overview',          icon: I.gauge,    fn: () => HubPage.overview() },
        { id: 'schedule',     label: "Today's Schedule",  icon: I.clock,    fn: () => HubPage.schedule() },
        { id: 'queue',        label: 'Vehicle Queue',     icon: I.car,      fn: () => HubPage.queue() },
        { id: 'pending',      label: 'Pending Service',   icon: I.alert,    fn: () => HubPage.pending() },
        { id: 'insight',      label: 'Business Insight',  icon: I.trend,    fn: () => HubPage.insight() },
        { id: 'activity',     label: 'Recent Activity',   icon: I.activity, fn: () => HubPage.activity() },
        { id: 'notifications', label: 'Notification Center', icon: I.bell,  fn: () => HubPage.notifications() },
        { id: 'quick',        label: 'Quick Action',      icon: I.plus,     fn: () => HubPage.quickAction() }
      ]
    },
    service: {
      title: 'Service Ops',
      icon: '🔧',
      tools: [
        { id: 'order', label: 'Service Order', icon: I.clipboard, fn: () => ServicePage.order() },
        { id: 'inspection', label: 'Vehicle Inspection', icon: I.checklist, fn: () => ServicePage.inspection() },
        { id: 'workqueue', label: 'Work Queue', icon: I.wrench, fn: () => ServicePage.workqueue() },
        { id: 'assignment', label: 'Mechanic Assignment', icon: I.users, fn: () => ServicePage.assignment() },
        { id: 'progress', label: 'Service Progress', icon: I.activity, fn: () => ServicePage.progress() },
        { id: 'history', label: 'Service History', icon: I.file, fn: () => ServicePage.history() }
      ]
    },
    resources: {
      title: 'Resources',
      icon: '📦',
      tools: [
        { id: 'parts', label: 'Spare Parts', icon: I.box, fn: () => ResourcesPage.parts() },
        { id: 'inventory', label: 'Inventory', icon: I.package, fn: () => ResourcesPage.inventory() },
        { id: 'suppliers', label: 'Supplier', icon: I.supplier, fn: () => ResourcesPage.suppliers() },
        { id: 'customers', label: 'Customer', icon: I.users, fn: () => ResourcesPage.customers() },
        { id: 'vehicles', label: 'Vehicle', icon: I.car, fn: () => ResourcesPage.vehicles() },
        { id: 'mechanics', label: 'Mechanic', icon: I.wrench, fn: () => ResourcesPage.mechanics() }
      ]
    },
    analytics: {
      title: 'Analytics',
      icon: '📊',
      tools: [
        { id: 'revenue', label: 'Revenue', icon: I.chart, fn: () => AnalyticsPage.revenue() },
        { id: 'trend', label: 'Service Trend', icon: I.trend, fn: () => AnalyticsPage.trend() },
        { id: 'performance', label: 'Mechanic Performance', icon: I.users, fn: () => AnalyticsPage.performance() },
        { id: 'inventory', label: 'Inventory Summary', icon: I.box, fn: () => AnalyticsPage.inventorySummary() },
        { id: 'reports', label: 'Reports', icon: I.file, fn: () => AnalyticsPage.reports() }
      ]
    },
    admin: {
      title: 'Administration',
      icon: '⚙',
      tools: [
        { id: 'profile', label: 'Profile', icon: I.user, fn: () => AdminPage.profile() },
        { id: 'users', label: 'User', icon: I.users, fn: () => AdminPage.users() },
        { id: 'settings', label: 'Settings', icon: I.settings, fn: () => AdminPage.settings() },
        { id: 'backup', label: 'Backup', icon: I.archive, fn: () => AdminPage.backup() },
        { id: 'logs', label: 'Activity Log', icon: I.activity, fn: () => AdminPage.logs() }
      ]
    }
  },

  /* ---------- INIT ---------- */
  init() {
    DB.ensure();
    this.renderWorkspaceTabs();
    this.bindLogin();
    this.updateNotif();

    const saved = sessionStorage.getItem('autonexa_session');
    if (saved === '1') {
      this.login();
    }

    // Global keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('globalSearch').focus();
      }
    });

    // Click outside to close dropdowns
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.notif-wrap') && !e.target.closest('.quick-menu') && !e.target.closest('#quickCreateBtn')) {
        this.closeAll();
      }
    });
  },

  renderWorkspaceTabs() {
    // Active tab based on currentWs
    document.querySelectorAll('.ws-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.ws === this.currentWs);
    });
  },

  /* ---------- LOGIN ---------- */
  bindLogin() {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.login();
    });
  },

  login() {
    this.isLoggedIn = true;
    sessionStorage.setItem('autonexa_session', '1');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    this.switchWorkspace('hub');
    setTimeout(() => Toast.show('Selamat datang di AutoNexa ⚙', 'success'), 400);
  },

  logout() {
    this.isLoggedIn = false;
    sessionStorage.removeItem('autonexa_session');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    Toast.show('Anda telah keluar dari sistem', 'info');
  },

  openProfile() {
    this.switchWorkspace('admin');
    setTimeout(() => AdminPage.profile(), 60);
  },

  /* ---------- WORKSPACE SWITCHER ---------- */
  switchWorkspace(ws) {
    if (!this.workspaces[ws]) ws = 'hub';
    this.currentWs = ws;
    this.renderWorkspaceTabs();
    this.renderToolDrawer();
    const firstTool = this.workspaces[ws].tools[0];
    this.navigateTool(firstTool.id);
  },

  /* ---------- TOOL DRAWER ---------- */
  renderToolDrawer() {
    const drawer = document.getElementById('toolDrawer');
    const ws = this.workspaces[this.currentWs];

    let html = `
      <div class="tool-drawer-header">
        <small>WORKSPACE ${this.currentWs === 'hub' ? '01' : this.currentWs === 'service' ? '02' : this.currentWs === 'resources' ? '03' : this.currentWs === 'analytics' ? '04' : '05'}</small>
        <strong>${esc(ws.title)}</strong>
      </div>
    `;

    ws.tools.forEach(tool => {
      const isActive = this.currentTool === tool.id;
      const count = this.toolCount(this.currentWs, tool.id);
      html += `
        <button class="tool-item ${isActive ? 'active' : ''}" onclick="App.navigateTool('${tool.id}')">
          <span class="ti-ic">${tool.icon}</span>
          <span>${esc(tool.label)}</span>
          ${count !== null ? `<span class="ti-count">${count}</span>` : ''}
        </button>
      `;
    });

    drawer.innerHTML = html;
  },

  toolCount(ws, toolId) {
    if (ws === 'hub') {
      const counts = {
        schedule: DB.get('workOrders').length,
        queue: DB.get('workOrders').filter(wo => ['waiting', 'inspection', 'estimate'].includes(wo.status)).length,
        pending: DB.overdueCount() + DB.waitingCount(),
        insight: DB.get('workOrders').filter(wo => wo.status === 'done').length,
        activity: DB.get('activityLogs').length,
        notifications: this.unreadCount()
      };
      return counts[toolId] ?? null;
    }
    if (ws === 'service') {
      const counts = { workqueue: DB.activeWOs(), order: DB.get('workOrders').length, history: DB.get('workOrders').filter(wo => wo.status === 'done').length };
      return counts[toolId] ?? null;
    }
    if (ws === 'resources') {
      const counts = {
        parts: DB.get('spareParts').length,
        inventory: DB.lowStockParts().length,
        suppliers: DB.get('suppliers').length,
        customers: DB.get('customers').length,
        vehicles: DB.get('vehicles').length,
        mechanics: DB.get('mechanics').length
      };
      return counts[toolId] ?? null;
    }
    return null;
  },

  /* ---------- ROUTER ---------- */
  navigateTool(toolId) {
    const ws = this.workspaces[this.currentWs];
    const tool = ws.tools.find(t => t.id === toolId);
    if (!tool) return;

    this.currentTool = toolId;
    this.renderToolDrawer();

    // Update breadcrumb
    document.getElementById('wsCrumb').textContent = ws.title;
    document.getElementById('toolCrumb').textContent = tool.label;

    // Loading + render
    const content = document.getElementById('pageContent');
    content.innerHTML = '<div class="loading-block"><div class="spinner"></div></div>';
    this.closeAll();

    setTimeout(() => {
      try {
        tool.fn();
      } catch (err) {
        console.error('Tool error:', err);
        content.innerHTML = '<div class="empty-state"><div class="es-ic">⚠️</div>'
          + `<p>Terjadi kesalahan saat memuat</p><small>${esc(err.message)}</small></div>`;
      }
      content.scrollTop = 0;
      window.scrollTo(0, 0);
    }, 60);
  },

  /* ---------- DEEP LINK (workspace/tool) ---------- */
  goTo(path) {
    const [ws, tool] = path.split('/');
    if (!this.workspaces[ws]) return;
    this.switchWorkspace(ws);
    setTimeout(() => {
      const t = this.workspaces[ws].tools.find(x => x.id === tool);
      if (t) this.navigateTool(t.id);
    }, 80);
  },

  /* ---------- PAGE HEADER ---------- */
  pageHeader(icon, title, desc, actions = '') {
    return `
      <div class="page-head">
        <div class="page-title">
          <h2><span class="pt-ic">${icon}</span> ${esc(title)}</h2>
          <p>${esc(desc)}</p>
        </div>
        <div class="page-actions">${actions}</div>
      </div>
    `;
  },

  /* ---------- NOTIFICATIONS ---------- */
  unreadCount() {
    return DB.get('notifications').filter(n => !n.read).length;
  },

  updateNotif() {
    const dot = document.getElementById('notifDot');
    const unread = this.unreadCount();
    dot.textContent = unread;
    dot.style.display = unread > 0 ? 'flex' : 'none';
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
      + '<a href="#" onclick="App.markAllRead();return false;">Tandai dibaca</a>'
      + '</div><div class="notif-list">';

    if (!notifs.length) {
      html += '<div class="empty-state" style="padding:24px"><div class="es-ic">🔔</div><p>Tidak ada notifikasi</p></div>';
    } else {
      notifs.slice(0, 8).forEach(n => {
        const color = { warning: '#d97706', danger: '#dc2626', success: '#16a34a', info: '#2563eb' }[n.type] || '#1f2937';
        html += `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="App.openNotif('${n.id}')">`
          + `<div class="notif-ic" style="background:${color}15;color:${color}">${n.icon}</div>`
          + `<div><p><strong>${esc(n.title)}</strong><br>${esc(n.message)}</p><small>${DB.fmtDateShort(n.createdAt)}</small></div>`
          + `<span class="n-time">${this.timeAgo(n.createdAt)}</span></div>`;
      });
    }
    html += '</div>';
    panel.innerHTML = html;
  },

  toggleNotif() {
    const panel = document.getElementById('notifPanel');
    const isOpen = panel.classList.contains('show');
    this.closeAll();
    if (!isOpen) {
      this.renderNotifPanel();
      panel.classList.add('show');
    }
  },

  openNotif(id) {
    const n = DB.find('notifications', id);
    if (n && !n.read) {
      DB.update('notifications', id, { read: true });
      this.renderNotifPanel();
      this.updateNotif();
    }
  },

  markAllRead() {
    DB.get('notifications').forEach(n => DB.update('notifications', n.id, { read: true }));
    this.renderNotifPanel();
    this.updateNotif();
    Toast.show('Semua notifikasi ditandai dibaca', 'success');
  },

  timeAgo(iso) {
    const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 60) return 'baru saja';
    if (sec < 3600) return Math.floor(sec / 60) + 'm lalu';
    if (sec < 86400) return Math.floor(sec / 3600) + 'j lalu';
    return Math.floor(sec / 86400) + 'h lalu';
  },

  /* ---------- GLOBAL SEARCH ---------- */
  globalSearch(q) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const box = document.getElementById('searchResults');
      if (!q || q.length < 2) { box.classList.remove('show'); return; }

      const ql = q.toLowerCase();
      const results = [];

      DB.get('workOrders').filter(wo => wo.number.toLowerCase().includes(ql)).slice(0, 4)
        .forEach(wo => results.push({ cat: 'WO', label: wo.number, sub: DB.vehicleInfo(wo.vehicleId).plate, action: () => this.goTo('service/workqueue') }));

      DB.get('vehicles').filter(v => v.plate.toLowerCase().includes(ql)).slice(0, 4)
        .forEach(v => results.push({ cat: 'Kendaraan', label: v.plate, sub: `${v.brand} ${v.model}`, action: () => this.goTo('resources/vehicles') }));

      DB.get('customers').filter(c => c.name.toLowerCase().includes(ql)).slice(0, 3)
        .forEach(c => results.push({ cat: 'Pelanggan', label: c.name, sub: c.city, action: () => this.goTo('resources/customers') }));

      DB.get('spareParts').filter(p => p.name.toLowerCase().includes(ql) || p.sku.toLowerCase().includes(ql)).slice(0, 4)
        .forEach(p => results.push({ cat: 'Part', label: p.name, sub: p.sku, action: () => this.goTo('resources/parts') }));

      this.__searchResults = results;

      if (!results.length) {
        box.innerHTML = `<div class="sr-empty">Tidak ditemukan hasil untuk "<strong>${esc(q)}</strong>"</div>`;
      } else {
        box.innerHTML = results.map((r, i) =>
          `<div class="sr-item" onclick="App.searchGo(${i})">`
          + `<span class="sr-cat">${r.cat}</span>`
          + `<span class="sr-label">${esc(r.label)}</span>`
          + `<span class="sr-sub">${esc(r.sub)}</span></div>`
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

  /* ---------- QUICK CREATE ---------- */
  quickCreate() {
    this.closeAll();
    const menu = document.createElement('div');
    menu.className = 'quick-menu';
    menu.id = 'quickCreateBtn';
    menu.innerHTML = ''
      + `<button class="qm-item" onclick="App.quickGo('service','order')"><span class="qm-ic">${I.clipboard}</span> WO Baru</button>`
      + `<button class="qm-item" onclick="App.quickGo('resources','inventory')"><span class="qm-ic">${I.plus}</span> Stok Masuk</button>`
      + `<button class="qm-item" onclick="App.quickGo('resources','parts')"><span class="qm-ic">${I.box}</span> Part Baru</button>`
      + `<button class="qm-item" onclick="App.quickGo('resources','customers')"><span class="qm-ic">${I.user}</span> Customer Baru</button>`;
    document.body.appendChild(menu);
    document.getElementById('overlay').classList.add('show');
  },

  quickGo(ws, tool) {
    this.closeAll();
    this.switchWorkspace(ws);
    setTimeout(() => {
      const t = this.workspaces[ws].tools.find(x => x.id === tool);
      if (t) this.navigateTool(t.id);
    }, 80);
  },

  /* ---------- CLOSE / OVERLAY ---------- */
  closeAll() {
    const panel = document.getElementById('notifPanel');
    if (panel) panel.classList.remove('show');
    const qm = document.getElementById('quickCreateBtn');
    if (qm) qm.remove();
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.remove('show');
  },

  /* ---------- TOAST SHORTCUT ---------- */
  toast(msg, type = 'success') {
    Toast.show(msg, type);
  }
};

/* ---------- BOOT ---------- */
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;