/* ============================================
   StockPilot — App Shell: init, login, router, search, notif
   ============================================ */

const App = {
  currentWs: 'hub',
  currentTool: 'overview',
  isLoggedIn: false,
  searchTimer: null,

  init() {
    DB.ensure();
    Layout.init();
    this.bindLogin();
    this.updateNotif();
    Layout.updateStorageBar();

    const saved = sessionStorage.getItem('stockpilot_session');
    if (saved === '1') this.login();

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

    // Table rerender listener
    document.addEventListener('table:rerender', () => {
      const tool = Router.workspaces[this.currentWs].tools.find(t => t.id === this.currentTool);
      if (tool) tool.fn();
    });
  },

  bindLogin() {
    document.getElementById('loginForm').addEventListener('submit', (e) => { e.preventDefault(); this.login(); });
  },

  login() {
    this.isLoggedIn = true;
    sessionStorage.setItem('stockpilot_session', '1');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    this.switchWorkspace('hub');
    setTimeout(() => Toast.show('Selamat datang di StockPilot ⚡', 'success'), 400);
  },

  logout() {
    this.isLoggedIn = false;
    sessionStorage.removeItem('stockpilot_session');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    Toast.show('Anda telah keluar', 'info');
  },

  openProfile() {
    this.switchWorkspace('admin');
    setTimeout(() => AdminPage.users(), 60);
  },

  switchWorkspace(ws) {
    if (!Router.workspaces[ws]) ws = 'hub';
    this.currentWs = ws;
    Layout.renderSidebarMenu(Router.workspaces, ws, this.currentTool);
    const firstTool = Router.workspaces[ws].tools[0];
    this.navigateTool(firstTool.id);
  },

  /* Toggle menu utama (workspace) — auto-collapse yang lain */
  toggleMenu(ws) {
    if (!Router.workspaces[ws]) return;
    if (this.currentWs === ws) {
      // Klik menu yang sama → collapse
      this.currentWs = null;
      Layout.renderSidebarMenu(Router.workspaces, null, this.currentTool);
      return;
    }
    this.currentWs = ws;
    Layout.renderSidebarMenu(Router.workspaces, ws, this.currentTool);
    const firstTool = Router.workspaces[ws].tools[0];
    this.navigateTool(firstTool.id);
  },

  navigateTool(toolId) {
    const ws = Router.workspaces[this.currentWs];
    const tool = ws.tools.find(t => t.id === toolId);
    if (!tool) return;
    this.currentTool = toolId;
    Layout.renderSidebarMenu(Router.workspaces, this.currentWs, toolId);
    document.getElementById('wsCrumb').textContent = ws.title;
    document.getElementById('toolCrumb').textContent = tool.label;
    const content = document.getElementById('pageContent');
    content.innerHTML = '<div class="loading-block"><div class="spinner"></div></div>';
    this.closeAll();
    setTimeout(() => {
      try { tool.fn(); } catch (err) {
        console.error('Tool error:', err);
        content.innerHTML = '<div class="empty-state"><div class="es-ic">⚠️</div><p>Terjadi kesalahan</p><small>' + esc(err.message) + '</small></div>';
      }
      content.scrollTop = 0; window.scrollTo(0, 0);
    }, 60);
  },

  goTo(path) {
    const [ws, tool] = path.split('/');
    if (!Router.workspaces[ws]) return;
    this.switchWorkspace(ws);
    setTimeout(() => {
      const t = Router.workspaces[ws].tools.find(x => x.id === tool);
      if (t) this.navigateTool(t.id);
    }, 80);
  },

  toolCount(ws, toolId) {
    if (ws === 'hub') {
      const counts = { lowstock: DB.lowStock().length, recent: DB.get('transactions').length };
      return counts[toolId] ?? null;
    }
    if (ws === 'inventory') {
      const counts = { stockin: DB.get('transactions').filter(t => t.type === 'in').length, stockout: DB.get('transactions').filter(t => t.type === 'out').length, history: DB.get('transactions').length };
      return counts[toolId] ?? null;
    }
    if (ws === 'catalog') {
      const counts = { products: DB.get('products').length, suppliers: DB.get('suppliers').length, customers: DB.get('customers').length };
      return counts[toolId] ?? null;
    }
    if (ws === 'procurement') {
      const counts = { po: DB.get('pos').length, receiving: DB.get('pos').filter(p => p.status === 'approved').length };
      return counts[toolId] ?? null;
    }
    if (ws === 'analytics') {
      const counts = { low: DB.lowStock().length };
      return counts[toolId] ?? null;
    }
    return null;
  },

  pageHeader(icon, title, desc, actions = '') {
    return `<div class="page-head"><div class="page-title"><h2><span class="pt-ic">${icon}</span> ${esc(title)}</h2><p>${esc(desc)}</p></div><div class="page-actions">${actions}</div></div>`;
  },

  /* Notifications */
  unreadCount() { return DB.get('notifications').filter(n => !n.read).length; },
  updateNotif() {
    const dot = document.getElementById('notifDot');
    const unread = this.unreadCount();
    dot.textContent = unread;
    dot.style.display = unread > 0 ? 'flex' : 'none';
  },
  renderNotifPanel() {
    const panel = document.getElementById('notifPanel');
    const notifs = [...DB.get('notifications')].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    let html = '<div class="notif-head"><strong> Notifikasi</strong><a href="#" onclick="App.markAllRead();return false;">Tandai dibaca</a></div><div class="notif-list">';
    if (!notifs.length) html += '<div class="empty-state" style="padding:24px"><div class="es-ic">🔔</div><p>Tidak ada notifikasi</p></div>';
    else notifs.slice(0,8).forEach(n => {
      const color = { warning:'#f59e0b', danger:'#ef4444', success:'#10b981', info:'#2563eb' }[n.type] || '#64748b';
      html += `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="App.openNotif('${n.id}')"><div class="notif-ic" style="background:${color}15;color:${color}">${n.icon}</div><div><p><strong>${esc(n.title)}</strong><br>${esc(n.message)}</p><small>${DB.fmtDateShort(n.createdAt)}</small></div><span class="n-time">${this.timeAgo(n.createdAt)}</span></div>`;
    });
    html += '</div>';
    panel.innerHTML = html;
  },
  toggleNotif() {
    const panel = document.getElementById('notifPanel');
    const isOpen = panel.classList.contains('show');
    this.closeAll();
    if (!isOpen) { this.renderNotifPanel(); panel.classList.add('show'); }
  },
  openNotif(id) {
    const n = DB.find('notifications', id);
    if (n && !n.read) { DB.update('notifications', id, { read: true }); this.renderNotifPanel(); this.updateNotif(); }
  },
  markAllRead() {
    DB.get('notifications').forEach(n => DB.update('notifications', n.id, { read: true }));
    this.renderNotifPanel(); this.updateNotif();
    Toast.show('Semua notifikasi dibaca', 'success');
  },
  timeAgo(iso) {
    const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 60) return 'baru saja';
    if (sec < 3600) return Math.floor(sec/60) + 'm lalu';
    if (sec < 86400) return Math.floor(sec/3600) + 'j lalu';
    return Math.floor(sec/86400) + 'h lalu';
  },

  /* Global search */
  globalSearch(q) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const box = document.getElementById('searchResults');
      if (!q || q.length < 2) { box.classList.remove('show'); return; }
      const ql = q.toLowerCase();
      const results = [];
      DB.get('products').filter(p => p.name.toLowerCase().includes(ql) || p.sku.toLowerCase().includes(ql)).slice(0,4)
        .forEach(p => results.push({ cat:'Produk', label:p.name, sub:p.sku, action:() => this.goTo('catalog/products') }));
      DB.get('pos').filter(p => p.number.toLowerCase().includes(ql)).slice(0,3)
        .forEach(p => results.push({ cat:'PO', label:p.number, sub:p.supplierName, action:() => this.goTo('procurement/po') }));
      DB.get('suppliers').filter(s => s.name.toLowerCase().includes(ql)).slice(0,3)
        .forEach(s => results.push({ cat:'Supplier', label:s.name, sub:s.city, action:() => this.goTo('catalog/suppliers') }));
      this.__searchResults = results;
      if (!results.length) box.innerHTML = `<div class="sr-empty">Tidak ditemukan hasil untuk "<strong>${esc(q)}</strong>"</div>`;
      else box.innerHTML = results.map((r,i) => `<div class="sr-item" onclick="App.searchGo(${i})"><span class="sr-cat">${r.cat}</span><span class="sr-label">${esc(r.label)}</span><span class="sr-sub">${esc(r.sub)}</span></div>`).join('');
      box.classList.add('show');
    }, 200);
  },
  searchGo(idx) {
    const box = document.getElementById('searchResults');
    box.classList.remove('show');
    document.getElementById('globalSearch').value = '';
    const r = (this.__searchResults || [])[idx];
    if (r && r.action) r.action();
  },

  /* Quick create */
  quickCreate() {
    this.closeAll();
    const menu = document.createElement('div');
    menu.className = 'quick-menu';
    menu.id = 'quickCreateBtn';
    menu.innerHTML = ''
      + `<button class="qm-item" onclick="App.quickGo('inventory','stockin')"><span class="qm-ic">${I.truck}</span> Stok Masuk</button>`
      + `<button class="qm-item" onclick="App.quickGo('catalog','products')"><span class="qm-ic">${I.box}</span> Produk Baru</button>`
      + `<button class="qm-item" onclick="App.quickGo('procurement','po')"><span class="qm-ic">${I.truck}</span> Buat PO</button>`;
    document.body.appendChild(menu);
    document.getElementById('overlay').classList.add('show');
  },
  quickGo(ws, tool) {
    this.closeAll();
    this.switchWorkspace(ws);
    setTimeout(() => {
      const t = Router.workspaces[ws].tools.find(x => x.id === tool);
      if (t) this.navigateTool(t.id);
    }, 80);
  },

  closeAll() {
    const panel = document.getElementById('notifPanel');
    if (panel) panel.classList.remove('show');
    const qm = document.getElementById('quickCreateBtn');
    if (qm) qm.remove();
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.remove('show');
  },

  toast(msg, type = 'success') { Toast.show(msg, type); }
};

/* Boot */
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;