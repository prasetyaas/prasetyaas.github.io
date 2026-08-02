/* ============================================
   StockPilot — App Layout: sidebar accordion, theme
   ============================================ */

const Layout = {
  _collapsed: false,

  init() {
    const savedTheme = localStorage.getItem('stockpilot_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', current);
    localStorage.setItem('stockpilot_theme', current);
  },

  toggleSidebar() {
    const sb = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
      sb.classList.toggle('mobile-open');
    } else {
      this._collapsed = !this._collapsed;
      sb.classList.toggle('collapsed', this._collapsed);
    }
  },

  /* Render sidebar accordion: menu utama (workspace) + submenu (tools) */
  renderSidebarMenu(workspaces, currentWs, currentTool) {
    const container = document.getElementById('sidebarTools');
    const nums = { hub: '01', inventory: '02', catalog: '03', procurement: '04', analytics: '05', admin: '06' };
    const icons = { hub: I.home, inventory: I.box, catalog: I.tag, procurement: I.truck, analytics: I.chart, admin: I.settings };

    container.innerHTML = Object.entries(workspaces).map(([key, ws]) => {
      const isOpen = key === currentWs;
      const subItems = ws.tools.map(tool => {
        const count = App.toolCount(key, tool.id);
        return `
          <button class="side-sub ${tool.id === currentTool && key === currentWs ? 'active' : ''}" onclick="App.navigateTool('${tool.id}')">
            <span class="ss-ic">${tool.icon}</span>
            <span>${esc(tool.label)}</span>
            ${count !== null ? `<span class="st-count">${count}</span>` : ''}
          </button>`;
      }).join('');

      return `
        <div class="side-menu ${isOpen ? 'open' : ''}" data-ws="${key}">
          <button class="side-menu-head" onclick="App.toggleMenu('${key}')">
            <span class="sm-ic">${icons[key] || I.box}</span>
            <span class="sm-label">${esc(ws.title)}</span>
            <span class="sm-num">${nums[key]}</span>
            <span class="sm-chev">${I.chevron}</span>
          </button>
          <div class="side-sub-wrap">${subItems}</div>
        </div>`;
    }).join('');
  },

  updateStorageBar() {
    const products = DB.get('products').length;
    const pct = Math.min(97, 40 + Math.round(products * 0.5));
    document.getElementById('storagePct').textContent = pct + '%';
    document.getElementById('storageBar').style.width = pct + '%';
    document.getElementById('storageText').textContent = `${products} produk · ${DB.get('transactions').length} transaksi`;
  }
};