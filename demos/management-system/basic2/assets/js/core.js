/* ============================================================
   RentFlow — Core Engine
   ------------------------------------------------------------
   Arsitektur DECLARATIVE HYPERSCRIPT:
   - h(tag, props, ...children) -> DOM node (bukan innerHTML)
   - State tunggal + set() -> re-render seluruh app
   - Router deklaratif berbasis state.route
   - Semua event via addEventListener (tanpa inline onclick global)
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
    route: 'workspaces',
    search: '',
    notifOpen: false,
    sidebarOpen: false,
    expandedGroup: 'hub',
    filterStatus: null,
    filterCategory: null,
    loading: false,
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

function fmtShortDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
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
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function greeting() {
  const hh = new Date().getHours();
  if (hh < 11) return 'Selamat pagi';
  if (hh < 15) return 'Selamat siang';
  if (hh < 19) return 'Selamat sore';
  return 'Selamat malam';
}

function initials(name) {
  return String(name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.max(0, Math.round(ms / 86400000));
}

const RENTAL_STATUS = ['available', 'reserved', 'rented', 'overdue', 'returned', 'maintenance'];

const STATUS_META = {
  available:   { label: 'Tersedia',   color: '#16A34A', bg: '#DCFCE7', cls: 'available',   icon: 'checkCircle' },
  reserved:    { label: 'Dipesan',    color: '#047857', bg: '#D1FAE5', cls: 'reserved',    icon: 'calendar' },
  rented:      { label: 'Disewa',     color: '#D97706', bg: '#FEF3C7', cls: 'rented',      icon: 'key' },
  overdue:     { label: 'Terlambat',  color: '#DC2626', bg: '#FEE2E2', cls: 'overdue',     icon: 'alert' },
  returned:    { label: 'Dikembalikan', color: '#64748B', bg: '#F1F5F9', cls: 'returned',  icon: 'check' },
  maintenance: { label: 'Perawatan',  color: '#7C3AED', bg: '#EDE9FE', cls: 'maintenance', icon: 'wrench' }
};

/* ---------- Icon helper (didefinisikan di icons.js) ---------- */
function icon(name) {
  const fn = I[name];
  return fn ? fn() : I.box();
}