/* ============================================================
   RentFlow — Layout Components (Card Workspace)
   LoginScreen · WorkspaceHome (launchpad) · ToolNav · Topbar · AppShell
   Tanpa sidebar — navigasi via kartu workspace + pills
   ============================================================ */

/* ---------- Login Screen ---------- */
function LoginScreen() {
  const loginForm = h('form', {
    onsubmit: (e) => { e.preventDefault(); App.login(); }
  }, [
    h('label', { class: 'field' }, [
      h('span', null, 'Email / Username'),
      h('div', { class: 'input-wrap' }, [
        I.users(),
        h('input', { type: 'text', value: 'admin@rentflow.id' })
      ])
    ]),
    h('label', { class: 'field' }, [
      h('span', null, 'Password'),
      h('div', { class: 'input-wrap' }, [
        I.key(),
        h('input', { type: 'password', value: 'admin123' })
      ])
    ]),
    h('div', { class: 'login-options' }, [
      h('label', { class: 'chk' }, [h('input', { type: 'checkbox', checked: true }), h('span', null, 'Ingat saya')]),
      h('a', { href: '#', onclick: (e) => { e.preventDefault(); Toast.show('Reset password dikirim ke email Anda', 'info'); } }, 'Lupa password?')
    ]),
    h('button', { type: 'submit', class: 'btn btn-primary btn-block' }, [h('span', null, 'Masuk'), h('span', { class: 'btn-arrow' }, '→')])
  ]);

  return h('div', { class: 'login-screen' }, [
    h('div', { class: 'login-hero' }, [
      h('div', { class: 'lh-grid' }, [h('i'), h('i'), h('i'), h('i')]),
      h('div', { class: 'login-brand' }, [
        h('div', { class: 'brand-mark' }, I.brand()),
        h('div', null, [
          h('strong', null, 'RentFlow'),
          h('span', null, 'Rental Management System')
        ])
      ]),
      h('div', { class: 'login-hero-copy' }, [
        h('h2', null, ['Kelola bisnis rental Anda \u2014 ', h('em', null, 'satu alur, tanpa ribet.')]),
        h('p', null, 'Dari penyewaan hingga pengembalian, pantau semua aset rental Anda dalam workspace yang bersih dan profesional.')
      ]),
      h('div', { class: 'login-hero-points' }, [
        h('div', { class: 'login-point' }, [h('span', { class: 'lp-ic' }, I.car()), h('span', null, 'Kelola 100+ item rental')]),
        h('div', { class: 'login-point' }, [h('span', { class: 'lp-ic' }, I.calendar()), h('span', null, 'Kalender penyewaan real-time')]),
        h('div', { class: 'login-point' }, [h('span', { class: 'lp-ic' }, I.money()), h('span', null, 'Laporan pendapatan otomatis')]),
        h('div', { class: 'login-point' }, [h('span', { class: 'lp-ic' }, I.refresh()), h('span', null, 'Tracking pengembalian & denda')])
      ]),
      h('div', { class: 'login-hero-foot' }, '© 2026 RentFlow · Basic Edition')
    ]),
    h('div', { class: 'login-panel' }, [
      h('div', { class: 'login-card' }, [
        h('div', { class: 'login-card-head' }, [
          h('div', { class: 'lc-emblem' }, I.brand()),
          h('h3', null, 'Selamat Datang 👋'),
          h('p', null, 'Masuk untuk mengelola rental Anda')
        ]),
        loginForm,
        h('div', { class: 'login-demo' }, [
          h('p', null, 'Mode demo — data tersimpan lokal di browser Anda.'),
          h('button', { class: 'btn btn-soft btn-block', onclick: () => App.login() }, '⚡ Masuk cepat sebagai Admin')
        ])
      ])
    ])
  ]);
}

/* ============================================================
   WORKSPACE LAUNCHPAD (Card Workspace)
   ============================================================ */

/* ---------- Workspace Card ---------- */
function WorkspaceCard({ title, desc, icon: ic, bg, color, stats, onClick, arrow }) {
  return h('button', { class: 'ws-card', onclick: onClick }, [
    h('span', { class: 'ws-card-arrow' }, arrow || '→'),
    h('div', { class: 'ws-card-icon', style: { background: bg, color } }, ic),
    h('div', { class: 'ws-card-body' }, [
      h('h3', null, title),
      h('p', null, desc)
    ]),
    h('div', { class: 'ws-card-stats' },
      stats.map(s => h('div', { class: 'ws-stat' }, [
        h('strong', null, s.value),
        h('span', null, s.label)
      ]))
    )
  ]);
}

/* ---------- Workspace Home (Launchpad) ---------- */
function WorkspaceHome() {
  const dateLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const active = DB.activeRentals().length;
  const overdue = DB.overdueRentals().length;
  const available = DB.itemsByStatus('available').length;
  const maintenance = DB.itemsByStatus('maintenance').length;
  const revenue = DB.revenueSummary();

  const cards = [
    {
      title: 'Rental Hub',
      desc: 'Overview, jadwal hari ini, item tersedia & kalender rental.',
      icon: I.home(),
      bg: '#10B981',
      color: '#fff',
      stats: [
        { value: String(active), label: 'Aktif' },
        { value: String(todayKey() ? DB.todayRentals().length : 0), label: 'Hari Ini' }
      ],
      onClick: () => Router.navigate('hub/overview')
    },
    {
      title: 'Rental Operations',
      desc: 'Buat rental baru, kelola rental aktif, return & riwayat.',
      icon: I.key(),
      bg: '#F59E0B',
      color: '#fff',
      stats: [
        { value: String(active), label: 'Berjalan' },
        { value: String(overdue), label: 'Overdue' }
      ],
      onClick: () => Router.navigate('ops/active')
    },
    {
      title: 'Catalog',
      desc: 'Kelola item rental, kategori & data pelanggan.',
      icon: I.box(),
      bg: '#F43F5E',
      color: '#fff',
      stats: [
        { value: String(DB.totalItems()), label: 'Item' },
        { value: String(available), label: 'Tersedia' }
      ],
      onClick: () => Router.navigate('catalog/items')
    },
    {
      title: 'Reports',
      desc: 'Laporan rental, pendapatan & export data.',
      icon: I.chart(),
      bg: '#8B5CF6',
      color: '#fff',
      stats: [
        { value: fmtIDR(revenue.month), label: 'Bulan Ini' },
        { value: String(DB.totalRentals()), label: 'Transaksi' }
      ],
      onClick: () => Router.navigate('reports/rental')
    },
    {
      title: 'Settings',
      desc: 'Profil usaha, pengaturan sistem & backup data.',
      icon: I.settings(),
      bg: '#0EA5E9',
      color: '#fff',
      stats: [
        { value: String(DB.totalCustomers()), label: 'Customers' },
        { value: String(maintenance), label: 'Perawatan' }
      ],
      onClick: () => Router.navigate('settings/profile')
    },
    {
      title: 'Buat Rental Baru',
      desc: 'Langsung buat penyewaan baru untuk pelanggan.',
      icon: I.plus(),
      bg: '#059669',
      color: '#fff',
      stats: [
        { value: 'New', label: 'Rental' },
        { value: '⬆', label: 'Langsung' }
      ],
      onClick: () => openNewRentalModal()
    }
  ];

  return h('div', null, [
    /* Hero */
    h('div', { class: 'ws-hero' }, [
      h('div', { class: 'ws-hero-left' }, [
        h('div', { class: 'ws-hero-emblem' }, I.brand()),
        h('div', null, [
          h('h2', null, greeting() + ', Admin 👋'),
          h('p', null, 'Pilih workspace untuk mulai mengelola bisnis rental Anda.')
        ])
      ]),
      h('div', { class: 'ws-hero-right' }, [
        h('div', { class: 'ws-hero-date' }, [
          h('strong', null, dateLabel),
          h('span', null, 'Semua sistem berjalan normal ✓')
        ]),
        h('button', { class: 'btn btn-primary', onclick: () => openNewRentalModal() }, [I.plus(), h('span', null, 'New Rental')])
      ])
    ]),

    /* Grid kartu workspace */
    h('div', { class: 'ws-grid' }, cards.map(c => WorkspaceCard(c)))
  ]);
}

/* ============================================================
   TOOL NAV (pills horizontal per workspace)
   ============================================================ */
function ToolNav() {
  const route = State.get('route');
  const group = Router.groupOf(route);
  const groupId = group.id;

  function toolBadge(item) {
    if (item.route === 'ops/active') return DB.activeRentals().length;
    if (item.route === 'ops/returns') return DB.rentalsByStatus('overdue').length;
    if (item.route === 'hub/available') return DB.itemsByStatus('available').length;
    return null;
  }

  return h('div', { class: 'tool-nav' },
    group.items.map(item => {
      const badge = toolBadge(item);
      return h('button', {
        class: 'tool-pill' + (route === item.route ? ' active' : ''),
        onclick: () => Router.navigate(item.route)
      }, [
        icon(item.icon),
        h('span', null, item.label),
        badge !== null && badge > 0 ? h('span', { class: 'nav-badge' }, String(badge)) : null
      ]);
    })
  );
}

/* ---------- Back to Workspace Home ---------- */
function BackHome() {
  return h('button', {
    class: 'back-link',
    onclick: () => Router.navigate('workspaces')
  }, [I.grid(), h('span', null, 'Semua Workspace')]);
}

/* ============================================================
   TOPBAR
   ============================================================ */
function Topbar() {
  const notifItems = DB.notifications();
  const notifCount = notifItems.length;
  const route = State.get('route');

  const notifPop = State.get('notifOpen')
    ? h('div', { class: 'notif-pop' }, [
        h('div', { class: 'np-head' }, [
          h('span', null, 'Notifikasi'),
          h('button', { onclick: () => { State.set({ notifOpen: false }); Toast.show('Semua notifikasi dibaca', 'info'); } }, 'Tandai semua')
        ]),
        ...notifItems.map(n => h('div', { class: 'notif-item' }, [
          h('span', { class: 'ni-dot', style: { background: n.dot } }),
          h('div', null, [
            h('div', { class: 'ni-txt' }, n.txt),
            h('div', { class: 'ni-time' }, n.time)
          ])
        ]))
      ])
    : null;

  /* Breadcrumb: hide saat di launchpad */
  const showCrumb = route !== 'workspaces';

  return h('header', { class: 'topbar' }, [
    h('div', { class: 'topbar-left' }, [
      h('div', {
        class: 'topbar-brand',
        onclick: () => Router.navigate('workspaces')
      }, [
        h('div', { class: 'brand-mark' }, I.brand()),
        h('div', null, [
          h('strong', null, 'RentFlow'),
          h('span', null, 'Rental System')
        ])
      ]),
      showCrumb
        ? h('div', { class: 'breadcrumb' }, [
            h('span', { class: 'bc-link', onclick: () => Router.navigate('workspaces') }, 'Semua Workspace'),
            h('span', { class: 'bc-sep' }, '/'),
            h('span', null, Router.groupOf(route).title),
            h('span', { class: 'bc-sep' }, '/'),
            h('strong', null, Router.titleOf(route))
          ])
        : null
    ]),
    h('div', { class: 'topbar-right' }, [
      h('div', { class: 'search-pill' }, [
        I.search(),
        h('input', {
          type: 'text',
          placeholder: 'Cari item, pelanggan, rental…',
          value: State.get('search'),
          oninput: (e) => {
            State.set({ search: e.target.value });
            const q = e.target.value.trim().toLowerCase();
            const items = q ? DB.searchItems(q) : [];
            const rentals = q ? DB.searchRentals(q) : [];
            const customers = q ? DB.searchCustomers(q) : [];
            if (q && items.length === 0 && rentals.length === 0 && customers.length === 0) {
              Toast.show('Tidak ada hasil untuk "' + q + '"', 'warning');
            }
          }
        }),
        h('span', { class: 'kbd' }, '/')
      ]),
      h('div', { style: { position: 'relative' } }, [
        h('button', {
          class: 'icon-btn',
          onclick: () => State.set({ notifOpen: !State.get('notifOpen') })
        }, [
          I.bell(),
          notifCount > 0 ? h('span', { class: 'dot' }, String(notifCount)) : null
        ]),
        notifPop
      ]),
      h('button', { class: 'btn btn-primary', style: { height: '40px', borderRadius: '12px' }, onclick: () => openNewRentalModal() }, [
        I.plus(),
        h('span', null, 'New Rental')
      ]),
      h('button', {
        class: 'icon-btn',
        title: 'Keluar',
        style: { color: 'var(--danger)' },
        onclick: () => App.logout()
      }, I.logout())
    ])
  ]);
}

/* ============================================================
   APP SHELL — tanpa sidebar
   ============================================================ */
function AppShell() {
  const route = State.get('route');
  const isHome = route === 'workspaces';

  return h('div', { class: 'app-shell' }, [
    h('div', { class: 'main' }, [
      Topbar(),
      h('div', { class: 'page', key: route }, [
        isHome
          ? WorkspaceHome()
          : Frag([
              BackHome(),
              ToolNav(),
              Router.resolve(route)
            ])
      ])
    ])
  ]);
}