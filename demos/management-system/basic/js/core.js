/* ============================================================
   FreshWash — Core Engine
   ------------------------------------------------------------
   Arsitektur DECLARATIVE HYPERSCRIPT:
   - h(tag, props, ...children) -> DOM node (bukan innerHTML)
   - State tunggal + setState() -> re-render seluruh app
   - Router deklaratif berbasis state.route
   - Tanpa inline onclick global, semua event via addEventListener
   ============================================================ */

/* ---------- Hyperscript: create DOM element ---------- */
function h(tag, props, ...children) {
  const el = document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined) continue;

      if (key === 'class') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key === 'dataset' && typeof value === 'object') {
        Object.assign(el.dataset, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'checked' || key === 'disabled' || key === 'selected') {
        if (value) el.setAttribute(key, '');
      } else if (key === 'value') {
        el.value = value;
      } else if (key === 'html') {
        el.innerHTML = value;
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  const flat = children.flat(Infinity);

  for (const child of flat) {
    if (child === null || child === undefined || child === false) continue;

    if (child instanceof Node) {
      el.appendChild(child);
    } else if (Array.isArray(child)) {
      appendChildren(el, child);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  }
}

/* ---------- Fragment ---------- */
function Frag(...children) {
  const frag = document.createDocumentFragment();
  appendChildren(frag, children);
  return frag;
}

/* ---------- Global State ---------- */
const State = {
  data: {
    route: 'hub/overview',
    search: '',
    notifOpen: false,
    sidebarOpen: false,
    expandedGroup: 'hub',
    filterStatus: null,
    filterDate: null,
    isLoggedIn: false
  },

  get(key) {
    return this.data[key];
  },

  set(patch) {
    Object.assign(this.data, patch);
    App.renderRoot();
  },

  setRoute(route) {
    // Auto-expand grup yang berisi halaman tujuan (accordion konsisten)
    const group = MENU.find(g => g.items.some(i => i.route === route));
    if (group) {
      this.data.expandedGroup = group.id;
    }
    this.data.route = route;
    App.renderRoot();
  }
};

/* ---------- Render Root ---------- */
const Render = {
  render(vnode) {
    const root = document.getElementById('root');
    root.innerHTML = '';
    root.appendChild(vnode);
  }
};

/* ---------- Helpers ---------- */
function esc(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}

function fmtIDR(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('id-ID');
}

function fmtDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' +
         d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
  if (!iso) return '-';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return mins + ' mnt lalu';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + ' jam lalu';
  const days = Math.floor(hours / 24);
  return days + ' hari lalu';
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 19) return 'Selamat sore';
  return 'Selamat malam';
}

function initials(name) {
  return String(name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const STATUS_FLOW = ['waiting', 'washing', 'drying', 'ready', 'delivered'];

const STATUS_META = {
  waiting:   { label: 'Waiting',   color: '#D97706', bg: '#FEF3C7', cls: 'waiting',   icon: 'clock' },
  washing:   { label: 'Washing',   color: '#0284C7', bg: '#DBEAFE', cls: 'washing',   icon: 'washer' },
  drying:    { label: 'Drying',    color: '#7C3AED', bg: '#EDE9FE', cls: 'drying',    icon: 'wind' },
  ready:     { label: 'Ready',     color: '#16A34A', bg: '#DCFCE7', cls: 'ready',     icon: 'check' },
  delivered: { label: 'Delivered', color: '#64748B', bg: '#F1F5F9', cls: 'delivered', icon: 'truck' }
};

/* ---------- Router: route -> page renderer ---------- */
const Router = {
  current() {
    return State.get('route');
  },

  groupOf(route) {
    for (const g of MENU) {
      if (g.items.some(i => i.route === route)) return g;
    }
    return MENU[0];
  },

  titleOf(route) {
    const [group, key] = route.split('/');
    const g = MENU.find(gg => gg.id === group);
    if (!g) return 'Overview';
    const item = g.items.find(i => i.route === route);
    return item ? item.label : 'Overview';
  },

  navigate(route) {
    if (!MENU.some(g => g.items.some(i => i.route === route))) {
      route = 'hub/overview';
    }
    // Auto-expand grup yang berisi halaman tujuan (accordion konsisten)
    const group = MENU.find(g => g.items.some(i => i.route === route));
    if (group) {
      State.data.expandedGroup = group.id;
    }
    State.setRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};