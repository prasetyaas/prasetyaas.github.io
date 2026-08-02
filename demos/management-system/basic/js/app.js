/* ============================================================
   FreshWash — Application
   ------------------------------------------------------------
   - MENU: definisi navigasi deklaratif (5 grup / 17 halaman)
   - PAGES: tiap halaman = fungsi murni -> vnode tree
   - Layout: LoginScreen, Sidebar, Topbar, AppShell
   - Bootstrap di akhir file
   ============================================================ */

/* ---------- MENU (deklaratif) ---------- */
const MENU = [
  {
    id: 'hub',
    title: 'Laundry Hub',
    icon: 'home',
    items: [
      { route: 'hub/overview', label: 'Overview', icon: 'home' },
      { route: 'hub/today', label: "Today's Orders", icon: 'calendar' },
      { route: 'hub/status', label: 'Laundry Status', icon: 'layers' },
      { route: 'hub/transactions', label: 'Recent Transactions', icon: 'activity' }
    ]
  },
  {
    id: 'ops',
    title: 'Laundry Operations',
    icon: 'washer',
    items: [
      { route: 'ops/new', label: 'New Order', icon: 'plus' },
      { route: 'ops/orders', label: 'Order List', icon: 'clipboard' },
      { route: 'ops/pickup', label: 'Pickup & Delivery', icon: 'truck' },
      { route: 'ops/history', label: 'Transaction History', icon: 'money' }
    ]
  },
  {
    id: 'catalog',
    title: 'Catalog',
    icon: 'tag',
    items: [
      { route: 'catalog/services', label: 'Services', icon: 'tag' },
      { route: 'catalog/customers', label: 'Customers', icon: 'users' },
      { route: 'catalog/prices', label: 'Price List', icon: 'price' }
    ]
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'chart',
    items: [
      { route: 'reports/sales', label: 'Sales Report', icon: 'chart' },
      { route: 'reports/orders', label: 'Order Report', icon: 'file' },
      { route: 'reports/export', label: 'Export Reports', icon: 'download' }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    items: [
      { route: 'settings/profile', label: 'Company Profile', icon: 'building' },
      { route: 'settings/system', label: 'System Settings', icon: 'settings' },
      { route: 'settings/backup', label: 'Backup & Restore', icon: 'archive' }
    ]
  }
];

/* ============================================================
   LAYOUT
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
        h('input', { type: 'text', value: 'admin@freshwash.id' })
      ])
    ]),
    h('label', { class: 'field' }, [
      h('span', null, 'Password'),
      h('div', { class: 'input-wrap' }, [
        I.settings(),
        h('input', { type: 'password', value: 'admin123' })
      ])
    ]),
    h('div', { class: 'login-options' }, [
      h('label', { class: 'chk' }, [h('input', { type: 'checkbox', checked: true }), h('span', null, 'Ingat saya')]),
      h('a', { href: '#', onclick: (e) => { e.preventDefault(); Toast.show('Reset password dikirim ke email Anda', 'info'); } }, 'Lupa password?')
    ]),
    h('button', { type: 'submit', class: 'btn btn-primary btn-block' }, [h('span', null, 'Masuk'), h('span', null, '→')])
  ]);

  return h('div', { class: 'login-screen' }, [
    h('div', { class: 'login-panel' }, [
      h('div', { class: 'login-brand' }, [
        h('div', { class: 'brand-mark' }, I.bubble()),
        h('div', null, [
          h('strong', null, 'FreshWash'),
          h('span', null, 'Laundry Management')
        ])
      ]),
      h('div', { class: 'login-card' }, [
        h('div', { class: 'login-card-head' }, [
          h('div', { class: 'lc-emblem' }, I.bubble()),
          h('h3', null, 'Selamat Datang 👋'),
          h('p', null, 'Masuk untuk mengelola laundry Anda')
        ]),
        loginForm,
        h('div', { class: 'login-demo' }, [
          h('p', null, 'Mode demo — data tersimpan lokal di browser Anda.'),
          h('button', { class: 'btn btn-soft btn-block', onclick: () => App.login() }, '⚡ Masuk cepat sebagai Admin')
        ])
      ]),
      h('div', { class: 'login-points' }, [
        h('div', { class: 'login-point' }, [h('span', { class: 'lp-ic' }, '🧺'), h('span', null, 'Alur cucian real-time')]),
        h('div', { class: 'login-point' }, [h('span', { class: 'lp-ic' }, '⚡'), h('span', null, 'Order kilat 6 jam')]),
        h('div', { class: 'login-point' }, [h('span', { class: 'lp-ic' }, '📊'), h('span', null, 'Laporan pendapatan')]),
        h('div', { class: 'login-point' }, [h('span', { class: 'lp-ic' }, '🚚'), h('span', null, 'Pickup & antar terjadwal')])
      ])
    ])
  ]);
}

/* ---------- Sidebar (accordion: 1 grup terbuka, sisanya collapse) ---------- */
function Sidebar() {
  const currentRoute = State.get('route');
  const currentGroup = Router.groupOf(currentRoute).id;
  const expanded = State.get('expandedGroup');

  const groups = MENU.map(group => {
    const isOpen = expanded === group.id;
    const isActiveGroup = currentGroup === group.id;

    const header = h('button', {
      class: 'nav-group-head' + (isOpen ? ' open' : '') + (isActiveGroup && !isOpen ? ' active' : ''),
      onclick: () => {
        // Auto-collapse: klik grup yang sama → collapse, selainnya → expand grup itu saja
        State.set({ expandedGroup: expanded === group.id ? null : group.id });
      }
    }, [
      icon(group.icon),
      h('span', { class: 'ngh-label' }, group.title),
      h('span', { class: 'ngh-count' }, String(group.items.length)),
      h('span', { class: 'ngh-chev' }, I.chevron())
    ]);

    const items = group.items.map(item => {
      const active = currentRoute === item.route;
      const badge = item.route === 'ops/orders'
        ? (DB.ordersByStatus('waiting').length + DB.ordersByStatus('washing').length + DB.ordersByStatus('drying').length)
        : null;

      return h('button', {
        class: 'nav-item' + (active ? ' active' : ''),
        onclick: () => {
          Router.navigate(item.route);
          State.set({ sidebarOpen: false, expandedGroup: group.id });
        }
      }, [
        h('span', { class: 'nav-dot' }),
        h('span', { class: 'nav-label' }, item.label),
        badge ? h('span', { class: 'nav-badge' }, badge) : null
      ]);
    });

    return h('div', { class: 'nav-group' }, [
      header,
      isOpen ? h('div', { class: 'nav-sub' }, items) : null
    ]);
  });

  return h('aside', { class: 'sidebar' + (State.get('sidebarOpen') ? ' open' : '') }, [
    h('div', { class: 'sidebar-inner' }, [
      h('div', { class: 'sidebar-brand' }, [
        h('div', { class: 'brand-mark' }, I.bubble()),
        h('div', null, [
          h('strong', null, 'FreshWash'),
          h('span', null, 'Laundry System')
        ])
      ]),
      ...groups,
      h('div', { class: 'sidebar-foot' }, [
        h('div', { class: 'sidebar-user', onclick: () => Router.navigate('settings/profile') }, [
          h('div', { class: 'avatar' }, 'AD'),
          h('div', null, [
            h('strong', null, 'Admin'),
            h('span', null, 'Pemilik Laundry')
          ])
        ]),
        h('button', {
          class: 'nav-item',
          style: { color: 'var(--danger)' },
          onclick: () => App.logout()
        }, [
          I.logout(),
          h('span', null, 'Keluar')
        ])
      ])
    ])
  ]);
}

/* ---------- Topbar ---------- */
function Topbar() {
  const roomDisplay = h('span', { style: { color: 'var(--ink-2)' } }, Router.titleOf(State.get('route')));

  const notifItems = DB.notifications();
  const notifCount = notifItems.length;

  const notifPop = State.get('notifOpen')
    ? h('div', { class: 'notif-pop' }, [
        h('div', { class: 'np-head' }, [
          h('span', null, 'Notifikasi'),
          h('button', { onclick: () => Toast.show('Semua notifikasi dibaca', 'info') }, 'Tandai semua')
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

  return h('header', { class: 'topbar' }, [
    h('div', { class: 'topbar-left' }, [
      h('button', { class: 'icon-btn', onclick: () => State.set({ sidebarOpen: !State.get('sidebarOpen') }) }, I.menu()),
      h('div', { class: 'breadcrumb' }, [
        h('span', null, Router.groupOf(State.get('route')).title),
        I.chevron(),
        roomDisplay
      ])
    ]),
    h('div', { class: 'topbar-right' }, [
      h('div', { class: 'search-pill' }, [
        I.search(),
        h('input', {
          type: 'text',
          placeholder: 'Cari order, pelanggan, layanan…',
          value: State.get('search'),
          oninput: (e) => {
            State.set({ search: e.target.value });
            const q = e.target.value.trim().toLowerCase();
            const orders = DB.searchOrders(q);
            const customers = q ? DB.get('customers').filter(c => c.name.toLowerCase().includes(q)) : [];
            const services = q ? DB.get('services').filter(s => s.name.toLowerCase().includes(q)) : [];
            if (q && orders.length === 0 && customers.length === 0 && services.length === 0) {
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
          notifCount > 0 ? h('span', { class: 'dot' }, notifCount) : null
        ]),
        notifPop
      ]),
      h('button', { class: 'btn btn-primary', style: { height: '40px', borderRadius: '12px' }, onclick: () => openNewOrderModal() }, [
        I.plus(),
        h('span', null, 'New Order')
      ])
    ])
  ]);
}

/* ---------- App Shell ---------- */
function AppShell() {
  return h('div', { class: 'app-shell' }, [
    Sidebar(),
    h('div', { class: 'main' }, [
      Topbar(),
      h('div', { class: 'page' }, PAGES[State.get('route')] ? PAGES[State.get('route')]() : PAGES['hub/overview']())
    ])
  ]);
}

/* ============================================================
   BANTUAN MODAL
   ============================================================ */

/* ---------- Order detail modal ---------- */
function openOrderDetail(order) {
  const statusIdx = STATUS_FLOW.indexOf(order.status);
  const timeline = STATUS_FLOW.map((s, i) => {
    const cls = i < statusIdx ? 'done' : i === statusIdx ? 'current' : '';
    const meta = STATUS_META[s];
    const dotContent = i < statusIdx ? I.check() : String(i + 1);
    return h('div', { class: 'st-node ' + cls }, [
      h('div', { class: 'st-dot' }, dotContent),
      h('span', { class: 'st-name' }, meta.label)
    ]);
  });

  const body = h('div', null, [
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } }, [
      h('strong', { style: { fontSize: '14px' } }, order.id),
      StatusPill(order.status)
    ]),
    h('div', { style: { fontSize: '12px', color: 'var(--ink-3)', marginBottom: '16px' } }, order.customerName + ' · ' + order.serviceName),

    h('div', { class: 'status-timeline' }, timeline),

    h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '18px' } }, [
      h('div', { style: { background: 'var(--bg)', borderRadius: '12px', padding: '10px 12px' } }, [
        h('div', { style: { fontSize: '10px', fontWeight: '800', color: 'var(--ink-4)', textTransform: 'uppercase' } }, 'Berat'),
        h('strong', { style: { fontSize: '15px' } }, order.weight + ' kg')
      ]),
      h('div', { style: { background: 'var(--bg)', borderRadius: '12px', padding: '10px 12px' } }, [
        h('div', { style: { fontSize: '10px', fontWeight: '800', color: 'var(--ink-4)', textTransform: 'uppercase' } }, 'Total'),
        h('strong', { style: { fontSize: '15px', color: 'var(--primary-700)' } }, fmtIDR(order.amount))
      ]),
      h('div', { style: { background: 'var(--bg)', borderRadius: '12px', padding: '10px 12px' } }, [
        h('div', { style: { fontSize: '10px', fontWeight: '800', color: 'var(--ink-4)', textTransform: 'uppercase' } }, 'Tipe'),
        h('strong', { style: { fontSize: '13px', textTransform: 'capitalize' } }, order.type)
      ]),
      h('div', { style: { background: 'var(--bg)', borderRadius: '12px', padding: '10px 12px' } }, [
        h('div', { style: { fontSize: '10px', fontWeight: '800', color: 'var(--ink-4)', textTransform: 'uppercase' } }, 'Pembayaran'),
        h('strong', { style: { fontSize: '13px', textTransform: 'uppercase' } }, order.payment)
      ])
    ]),

    h('div', { style: { fontSize: '11px', color: 'var(--ink-4)', marginTop: '14px' } }, 'Dibuat ' + fmtDateTime(order.createdAt))
  ]);

  const nextIdx = statusIdx + 1;
  const canAdvance = nextIdx < STATUS_FLOW.length;

  const footer = [
    h('button', { class: 'btn btn-ghost btn-sm', onclick: () => Modal.close() }, 'Tutup'),
    canAdvance
      ? h('button', {
          class: 'btn btn-primary btn-sm',
          onclick: () => {
            const next = STATUS_FLOW[nextIdx];
            DB.updateOrderStatus(order.id, next);
            Modal.close();
            Toast.show('Order ' + order.id + ' dipindah ke ' + STATUS_META[next].label, 'success');
          }
        }, ['Pindah ke \u2014 ' + STATUS_META[STATUS_FLOW[nextIdx]].label])
      : h('span', { class: 'pill pill-delivered' }, [h('span', { class: 'p-dot' }), 'Selesai'])
  ];

  Modal.open({ title: 'Detail Order', body, footer, size: 'lg' });
}

/* ---------- New Order modal ---------- */
function openNewOrderModal() {
  const draft = {
    customer: DB.get('customers')[0].name,
    service: DB.get('services')[0].id,
    weight: 3,
    type: 'reguler'
  };

  const inputs = {};

  const build = () => {
    const customers = DB.get('customers');
    const services = DB.get('services');
    const svc = services.find(s => s.id === draft.service) || services[0];
    const amount = svc.price * Math.round(draft.weight);

    const body = h('div', null, [
      h('div', { class: 'form-grid' }, [
        h('div', { class: 'full' }, [
          h('label', { class: 'form-label' }, 'Pelanggan'),
          h('select', {
            class: 'form-control',
            onchange: (e) => { draft.customer = e.target.value; Modal.close(); openNewOrderModal(); }
          }, customers.map(c => h('option', { value: c.name, selected: c.name === draft.customer }, c.name)))
        ]),
        h('div', null, [
          h('label', { class: 'form-label' }, 'Layanan'),
          h('select', {
            class: 'form-control',
            onchange: (e) => { draft.service = e.target.value; Modal.close(); openNewOrderModal(); }
          }, services.map(s => h('option', { value: s.id, selected: s.id === draft.service }, s.name)))
        ]),
        h('div', null, [
          h('label', { class: 'form-label' }, 'Berat (kg)'),
          h('input', {
            class: 'form-control',
            type: 'number',
            min: '1',
            value: draft.weight,
            oninput: (e) => { draft.weight = Math.max(1, parseFloat(e.target.value) || 1); }
          })
        ]),
        h('div', { class: 'full' }, [
          h('label', { class: 'form-label' }, 'Tipe Layanan'),
          h('div', { style: { display: 'flex', gap: '8px' } }, [
            ['reguler', 'Reguler', I.clock()], ['express', 'Express', I.wind()], ['eco', 'Eco', I.check()]
          ].map(([val, label, ic]) => h('button', {
            class: 'chip' + (draft.type === val ? ' active' : ''),
            onclick: () => { draft.type = val; Modal.close(); openNewOrderModal(); }
          }, [ic, h('span', null, label)])))
        ])
      ]),
      h('div', {
        style: {
          marginTop: '16px',
          background: 'linear-gradient(135deg, #EFF6FF, #ECFEFF)',
          borderRadius: '14px',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, [
        h('div', null, [
          h('div', { style: { fontSize: '10px', fontWeight: '800', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.5px' } }, 'Estimasi Total'),
          h('div', { style: { fontSize: '22px', fontWeight: '900', color: 'var(--primary-700)' } }, fmtIDR(amount))
        ]),
        h('div', { style: { textAlign: 'right', fontSize: '11px', color: 'var(--ink-3)', fontWeight: '600' } }, [
          h('div', null, svc.name),
          h('div', null, svc.price + ' × ' + Math.round(draft.weight) + ' kg')
        ])
      ])
    ]);

    const footer = [
      h('button', { class: 'btn btn-ghost', onclick: () => Modal.close() }, 'Batal'),
      h('button', {
        class: 'btn btn-primary',
        onclick: () => {
          const id = DB.nextOrderId();
          DB.addOrder({
            id,
            customerId: 'cst-001',
            customerName: draft.customer,
            serviceId: draft.service,
            serviceName: svc.name,
            weight: draft.weight,
            qty: Math.round(draft.weight / 2),
            amount,
            status: 'waiting',
            type: draft.type,
            payment: 'cod',
            paid: false,
            items: 'Pakaian ' + Math.round(draft.weight / 2) + ' pcs · ' + draft.weight + ' kg',
            pickupDate: todayKey(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          Modal.close();
          Toast.show('Order ' + id + ' berhasil dibuat 🎉', 'success');
        }
      }, 'Simpan Order')
    ];

    Modal.open({ title: 'Buat Order Baru', body, footer, size: 'lg' });
  };

  build();
}

/* ---------- Konfirmasi advance status ---------- */
function confirmAdvance(order) {
  const idx = STATUS_FLOW.indexOf(order.status);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
  const next = STATUS_FLOW[idx + 1];

  const body = h('div', null, [
    h('p', { style: { fontSize: '13px', color: 'var(--ink-2)', marginBottom: '14px' } }, [
      'Pindahkan order ', h('strong', null, order.id), ' dari ',
      h('strong', null, STATUS_META[order.status].label), ' ke ',
      h('strong', null, STATUS_META[next].label), '?'
    ]),
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg)', borderRadius: '12px', padding: '12px' } }, [
      Avatar({ name: order.customerName, size: 36 }),
      h('div', null, [
        h('strong', { style: { fontSize: '12.5px', display: 'block' } }, order.customerName),
        h('span', { style: { fontSize: '11px', color: 'var(--ink-4)', fontWeight: '600' } }, order.serviceName + ' · ' + fmtIDR(order.amount))
      ])
    ])
  ]);

  Modal.open({
    title: 'Perbarui Status',
    body,
    footer: [
      h('button', { class: 'btn btn-ghost btn-sm', onclick: () => Modal.close() }, 'Batal'),
      h('button', {
        class: 'btn btn-primary btn-sm',
        onclick: () => {
          DB.updateOrderStatus(order.id, next);
          Modal.close();
          Toast.show(order.id + ' → ' + STATUS_META[next].label, 'success');
        }
      }, 'Ya, pindahkan')
    ]
  });
}

/* ============================================================
   PAGES — setiap halaman adalah komponen murni
   ============================================================ */
const PAGES = {

  /* ---------- Laundry Hub: Overview ---------- */
  'hub/overview': () => {
    const today = todayKey();
    const dateLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const counts = {};
    for (const s of STATUS_FLOW) counts[s] = DB.ordersByStatus(s).length;
    const recent = DB.recentOrders(6);
    const revenue = DB.revenueToday();
    const popular = DB.popularServices();
    const maxPop = popular.length ? popular[0].count : 1;

    return h('div', null, [
      h('div', { class: 'greeting-card' }, [
        h('div', { class: 'gc-emblem' }, I.bubble()),
        h('div', null, [
          h('h2', null, greeting() + ', Admin 👋'),
          h('p', null, 'Ada ' + (counts.waiting + counts.washing + counts.drying) + ' cucian sedang diproses — semangat!')
        ]),
        h('div', { class: 'gc-right' }, [
          h('div', { class: 'gc-date' }, [
            h('strong', null, dateLabel),
            h('span', null, 'Semua sistem berjalan normal ✓')
          ]),
          h('button', { class: 'btn btn-primary', onclick: () => openNewOrderModal() }, [I.plus(), h('span', null, 'New Order')])
        ])
      ]),

      /* Today's Orders pipeline */
      h('div', { class: 'pipeline' }, STATUS_FLOW.map((status, i) =>
        PipeStep({
          status,
          count: counts[status],
          active: State.get('filterStatus') === status,
          onClick: () => {
            State.set({ filterStatus: status });
            State.setRoute('ops/orders');
          }
        })
      )),

      /* KPI strip */
      h('div', { class: 'kpi-strip' }, [
        KpiCard({ label: 'Orders', value: fmtNum(DB.totalOrders()), sub: '+' + DB.todayOrders().length + ' hari ini', icon: I.clipboard(), bg: '#DBEAFE', color: '#1D4ED8' }),
        KpiCard({ label: 'Customers', value: fmtNum(DB.totalCustomers()), sub: DB.get('customers').filter(c => c.active).length + ' pelanggan aktif', icon: I.users(), bg: '#DCFCE7', color: '#15803D' }),
        KpiCard({ label: 'Laundry Services', value: fmtNum(DB.totalServices()), sub: DB.get('services').filter(s => s.popular).length + ' layanan populer', icon: I.tag(), bg: '#FEF3C7', color: '#B45309' }),
        KpiCard({ label: 'Transactions', value: fmtNum(DB.totalTransactions()), sub: 'Total transaksi tercatat', icon: I.money(), bg: '#EDE9FE', color: '#6D28D9' })
      ]),

      h('div', { class: 'grid-main-right' }, [
        /* Kiri: Recent Orders + Quick Action */
        h('div', { class: 'stack' }, [
          Section({
            title: 'Recent Orders',
            icon: I.clipboard(),
            bodyPad: false,
            action: h('button', { class: 'btn btn-sm btn-ghost', onclick: () => Router.navigate('ops/orders') }, 'Lihat Semua →'),
            children: recent.length
              ? recent.map(o => OrderRow(o, () => openOrderDetail(o)))
              : EmptyState({ icon: '🧺', title: 'Belum ada order', desc: 'Buat order baru untuk memulai' })
          }),
          Section({
            title: 'Quick Action',
            icon: I.plus(),
            children: h('div', { class: 'quick-actions' }, [
              h('button', { class: 'qa-btn', onclick: () => openNewOrderModal() }, [
                h('div', { class: 'qa-ic', style: { background: '#DBEAFE', color: '#1D4ED8' } }, I.plus()),
                h('div', null, [h('strong', null, 'New Order'), h('span', null, 'Buat order laundry baru')])
              ]),
              h('button', { class: 'qa-btn', onclick: () => Router.navigate('ops/pickup') }, [
                h('div', { class: 'qa-ic', style: { background: '#DCFCE7', color: '#15803D' } }, I.truck()),
                h('div', null, [h('strong', null, 'Pickup & Delivery'), h('span', null, 'Atur antar jemput')])
              ]),
              h('button', { class: 'qa-btn', onclick: () => Router.navigate('reports/export') }, [
                h('div', { class: 'qa-ic', style: { background: '#FEF3C7', color: '#B45309' } }, I.download()),
                h('div', null, [h('strong', null, 'Export Laporan'), h('span', null, 'Unduh data CSV')])
              ]),
              h('button', { class: 'qa-btn', onclick: () => Router.navigate('settings/profile') }, [
                h('div', { class: 'qa-ic', style: { background: '#EDE9FE', color: '#6D28D9' } }, I.settings()),
                h('div', null, [h('strong', null, 'Pengaturan'), h('span', null, 'Profil & sistem')])
              ])
            ])
          })
        ]),

        /* Kanan: Revenue Today + Popular Service */
        h('div', { class: 'stack' }, [
          h('div', { class: 'revenue-card' }, [
            h('div', { class: 'rc-label' }, 'Revenue Today'),
            h('div', { class: 'rc-value' }, fmtIDR(revenue)),
            h('div', { class: 'rc-sub' }, 'Pendapatan hari ini · ' + DB.todayOrders().length + ' order'),
            h('div', { class: 'rc-stats' }, [
              h('div', { class: 'rc-stat' }, [h('strong', null, fmtIDR(DB.revenueMonth())), h('span', null, 'Bulan ini')]),
              h('div', { class: 'rc-stat' }, [h('strong', null, fmtNum(DB.get('orders').filter(o => o.status === 'ready').length)), h('span', null, 'Siap diambil')])
            ])
          ]),
          Section({
            title: 'Popular Service',
            icon: I.star(),
            children: h('div', { class: 'service-rank' },
              popular.map((p, i) => h('div', { class: 'rank-item' }, [
                h('div', { class: 'rank-num' }, String(i + 1)),
                h('div', { class: 'rank-info' }, [
                  h('strong', null, p.name),
                  h('span', null, p.count + ' order'),
                  h('div', { class: 'rank-bar' }, h('div', { style: { width: Math.max(10, Math.round((p.count / maxPop) * 100)) + '%' } }))
                ])
              ]))
            )
          })
        ])
      ])
    ]);
  },

  /* ---------- Laundry Hub: Today's Orders ---------- */
  'hub/today': () => {
    const todays = DB.todayOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const done = todays.filter(o => o.status === 'delivered').length;

    return h('div', null, [
      PageHead({
        title: "Today's Orders",
        subtitle: 'Semua order yang masuk atau dijadwalkan hari ini',
        icon: I.calendar(),
        action: h('button', { class: 'btn btn-primary', onclick: () => openNewOrderModal() }, [I.plus(), h('span', null, 'Buat Order')])
      }),
      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Hari Ini'), h('div', { class: 'sc-value' }, fmtNum(todays.length)), h('div', { class: 'sc-sub' }, 'order masuk & pickup')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Selesai'), h('div', { class: 'sc-value', style: { color: 'var(--success)' } }, fmtNum(done)), h('div', { class: 'sc-sub' }, 'delivered')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Dalam Proses'), h('div', { class: 'sc-value', style: { color: 'var(--primary)' } }, fmtNum(todays.length - done)), h('div', { class: 'sc-sub' }, 'aktif hari ini')])
      ]),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Daftar Order Hari Ini',
        icon: I.calendar(),
        bodyPad: false,
        children: todays.length
          ? todays.map(o => OrderRow(o, () => openOrderDetail(o)))
          : EmptyState({ icon: '📅', title: 'Tidak ada order hari ini', desc: 'Order baru akan muncul di sini' })
      }))
    ]);
  },

  /* ---------- Laundry Hub: Laundry Status ---------- */
  'hub/status': () => {
    return h('div', null, [
      PageHead({
        title: 'Laundry Status',
        subtitle: 'Pantau posisi cucian pelanggan di setiap tahap proses',
        icon: I.layers()
      }),
      STATUS_FLOW.map(status => {
        const items = DB.ordersByStatus(status);
        const meta = STATUS_META[status];
        return h('div', { style: { marginBottom: '14px' } }, [
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } }, [
            h('div', { class: 'ps-ic st-bg-' + meta.cls, style: { color: meta.color, width: '30px', height: '30px', borderRadius: '10px', marginBottom: '0' } }, icon(meta.icon)),
            h('h3', { style: { fontSize: '14px', fontWeight: '800' } }, meta.label),
            h('span', { class: 'pill pill-' + meta.cls }, items.length + ' order')
          ]),
          Section({
            title: meta.label,
            icon: icon(meta.icon),
            bodyPad: false,
            children: items.length
              ? items.slice(0, 4).map(o => OrderRow(o, () => openOrderDetail(o)))
              : EmptyState({ icon: '✓', title: 'Tidak ada order', desc: 'Status ini sedang kosong' })
          })
        ]);
      })
    ]);
  },

  /* ---------- Laundry Hub: Recent Transactions ---------- */
  'hub/transactions': () => {
    const txs = DB.recentTransactions(10);

    return h('div', null, [
      PageHead({
        title: 'Recent Transactions',
        subtitle: 'Transaksi keuangan terbaru',
        icon: I.activity(),
        action: h('button', { class: 'btn btn-soft', onclick: () => Router.navigate('ops/history') }, 'Lihat Semua →')
      }),
      Section({
        title: '10 Transaksi Terbaru',
        icon: I.money(),
        bodyPad: false,
        children: Table({
          columns: [
            { label: 'ID', type: 'id' },
            { label: 'Deskripsi', type: 'main' },
            { label: 'Metode', type: 'text' },
            { label: 'Tipe', type: 'text' },
            { label: 'Jumlah', type: 'amount', align: 'right' },
            { label: 'Waktu', type: 'text' }
          ],
          rows: txs.map(t => [
            t.id,
            [h('strong', null, t.desc), h('span', null, 'Ref: ' + t.ref)],
            t.method.toUpperCase(),
            t.type === 'in'
              ? h('span', { class: 'pill pill-paid' }, [h('span', { class: 'p-dot' }), 'Masuk'])
              : h('span', { class: 'pill pill-due' }, [h('span', { class: 'p-dot' }), 'Keluar']),
            h('span', { style: { color: t.type === 'in' ? 'var(--success)' : 'var(--danger)', fontWeight: '800' } }, (t.type === 'in' ? '+' : '-') + fmtIDR(t.amount)),
            fmtDateTime(t.createdAt)
          ])
        })
      })
    ]);
  },

  /* ---------- Laundry Operations: New Order ---------- */
  'ops/new': () => {
    return h('div', null, [
      PageHead({
        title: 'New Order',
        subtitle: 'Buat order laundry baru untuk pelanggan',
        icon: I.plus(),
        action: h('button', { class: 'btn btn-primary', onclick: () => openNewOrderModal() }, [I.plus(), h('span', null, 'Mulai Form')])
      }),
      h('div', { class: 'section' }, [
        h('div', { class: 'section-body', style: { textAlign: 'center', padding: '40px' } }, [
          h('div', { class: 'es-ic', style: { margin: '0 auto 12px', background: '#E0F2FE' } }, '🧺'),
          h('strong', { style: { display: 'block', fontSize: '15px', marginBottom: '6px' } }, 'Mulai pesanan baru'),
          h('p', { style: { fontSize: '12.5px', color: 'var(--ink-3)', marginBottom: '18px' } }, 'Isi detail pelanggan, layanan, dan berat cucian untuk membuat order.'),
          h('button', { class: 'btn btn-primary', onclick: () => openNewOrderModal() }, [I.plus(), h('span', null, 'Buat Order Baru')])
        ])
      ])
    ]);
  },

  /* ---------- Laundry Operations: Order List ---------- */
  'ops/orders': () => {
    const filter = State.get('filterStatus');
    const orders = filter ? DB.ordersByStatus(filter) : DB.get('orders');
    const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const chips = [null, ...STATUS_FLOW];
    const chipLabels = { null: 'Semua', ...Object.fromEntries(STATUS_FLOW.map(s => [s, STATUS_META[s].label])) };

    return h('div', null, [
      PageHead({
        title: 'Order List',
        subtitle: 'Kelola semua order laundry',
        icon: I.clipboard(),
        action: h('button', { class: 'btn btn-primary', onclick: () => openNewOrderModal() }, [I.plus(), h('span', null, 'New Order')])
      }),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' } },
        chips.map(s => h('button', {
          class: 'chip' + (filter === s ? ' active' : ''),
          onclick: () => State.set({ filterStatus: s })
        }, chipLabels[s] + ' (' + (s ? DB.ordersByStatus(s).length : DB.get('orders').length) + ')'))
      ),
      Section({
        title: filter ? 'Filter: ' + chipLabels[filter] : 'Semua Order',
        icon: filter ? icon(STATUS_META[filter].icon) : I.clipboard(),
        bodyPad: false,
        children: sorted.length
          ? sorted.map(o => h('div', {
              class: 'order-row',
              onclick: () => openOrderDetail(o)
            }, [
              h('div', { class: 'or-id' }, o.id),
              h('div', { class: 'or-cust' }, [
                h('strong', null, o.customerName),
                h('span', null, o.serviceName + ' · ' + o.weight + ' kg · ' + o.type)
              ]),
              StatusPill(o.status),
              h('div', { class: 'or-amount' }, fmtIDR(o.amount)),
              h('div', {
                class: 'or-time',
                style: { display: 'flex', alignItems: 'center', gap: '8px' }
              }, [
                STATUS_FLOW.indexOf(o.status) < STATUS_FLOW.length - 1
                  ? h('button', {
                      class: 'btn btn-sm btn-soft',
                      onclick: (e) => { e.stopPropagation(); confirmAdvance(o); }
                    }, 'Perbarui')
                  : null,
                timeAgo(o.createdAt)
              ])
            ]))
          : EmptyState({ icon: '🔍', title: 'Tidak ada order', desc: 'Ubah filter status untuk melihat order lain' })
      })
    ]);
  },

  /* ---------- Laundry Operations: Pickup & Delivery ---------- */
  'ops/pickup': () => {
    const ready = DB.ordersByStatus('ready');
    const delivered = DB.ordersByStatus('delivered');

    const readyList = ready.length
      ? ready.map(o => h('div', { class: 'order-row', onclick: () => openOrderDetail(o) }, [
          h('div', { class: 'or-id' }, o.id),
          h('div', { class: 'or-cust' }, [h('strong', null, o.customerName), h('span', null, 'Pickup: ' + fmtDate(o.pickupDate))]),
          StatusPill('ready'),
          h('button', {
            class: 'btn btn-sm btn-success',
            onclick: (e) => {
              e.stopPropagation();
              DB.updateOrderStatus(o.id, 'delivered');
              Toast.show(o.id + ' ditandai terkirim', 'success');
            }
          }, [I.truck(), h('span', null, 'Tandai Terkirim')])
        ]))
      : EmptyState({ icon: '🚚', title: 'Tidak ada yang siap antar', desc: 'Order yang siap diambil akan muncul di sini' });

    return h('div', null, [
      PageHead({
        title: 'Pickup & Delivery',
        subtitle: 'Atur penjemputan dan pengantaran order',
        icon: I.truck()
      }),
      h('div', { class: 'grid-2col' }, [
        Section({
          title: 'Siap Diambil (' + ready.length + ')',
          icon: I.check(),
          bodyPad: false,
          children: readyList
        }),
        Section({
          title: 'Sudah Terkirim (' + delivered.length + ')',
          icon: I.truck(),
          bodyPad: false,
          children: delivered.length
            ? delivered.slice(0, 6).map(o => h('div', { class: 'order-row', onclick: () => openOrderDetail(o) }, [
                h('div', { class: 'or-id' }, o.id),
                h('div', { class: 'or-cust' }, [h('strong', null, o.customerName), h('span', null, 'Diantar ' + timeAgo(o.updatedAt))]),
                StatusPill('delivered'),
                h('div', { class: 'or-amount' }, fmtIDR(o.amount))
              ]))
            : EmptyState({ icon: '📦', title: 'Belum ada kiriman', desc: 'Order yang terkirim tercatat di sini' })
        })
      ])
    ]);
  },

  /* ---------- Laundry Operations: Transaction History ---------- */
  'ops/history': () => {
    const all = [...DB.get('transactions')].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const income = all.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
    const expense = all.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);

    return h('div', null, [
      PageHead({
        title: 'Transaction History',
        subtitle: 'Riwayat seluruh transaksi keuangan',
        icon: I.money()
      }),
      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Transaksi'), h('div', { class: 'sc-value' }, fmtNum(all.length)), h('div', { class: 'sc-sub' }, 'tercatat dalam sistem')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Pemasukan'), h('div', { class: 'sc-value', style: { color: 'var(--success)' } }, fmtIDR(income)), h('div', { class: 'sc-sub' }, 'total masuk')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Pengeluaran'), h('div', { class: 'sc-value', style: { color: 'var(--danger)' } }, fmtIDR(expense)), h('div', { class: 'sc-sub' }, 'total keluar')])
      ]),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Riwayat 60 Hari Terakhir',
        icon: I.money(),
        bodyPad: false,
        children: Table({
          columns: [
            { label: 'ID', type: 'id' },
            { label: 'Deskripsi', type: 'main' },
            { label: 'Metode', type: 'text' },
            { label: 'Tipe', type: 'text' },
            { label: 'Jumlah', type: 'amount', align: 'right' },
            { label: 'Tanggal', type: 'text' }
          ],
          rows: all.slice(0, 50).map(t => [
            t.id,
            [h('strong', null, t.desc), h('span', null, 'Ref: ' + t.ref)],
            t.method.toUpperCase(),
            t.type === 'in'
              ? h('span', { class: 'pill pill-paid' }, [h('span', { class: 'p-dot' }), 'Masuk'])
              : h('span', { class: 'pill pill-due' }, [h('span', { class: 'p-dot' }), 'Keluar']),
            h('span', { style: { color: t.type === 'in' ? 'var(--success)' : 'var(--danger)', fontWeight: '800' } }, (t.type === 'in' ? '+' : '-') + fmtIDR(t.amount)),
            fmtDateTime(t.createdAt)
          ])
        })
      }))
    ]);
  },

  /* ---------- Catalog: Services ---------- */
  'catalog/services': () => {
    const services = DB.get('services');

    return h('div', null, [
      PageHead({
        title: 'Services',
        subtitle: 'Katalog layanan laundry yang tersedia',
        icon: I.tag(),
        action: h('button', { class: 'btn btn-soft', onclick: () => Toast.show('Fitur tambah layanan tersedia di versi premium', 'info') }, [I.plus(), h('span', null, 'Tambah Layanan')])
      }),
      h('div', { class: 'grid-2col' }, services.map(s => h('div', {
        class: 'service-card',
        onclick: () => Router.navigate('catalog/prices')
      }, [
        h('div', { class: 'svc-ic', style: { background: s.bg, color: s.color } }, icon(s.icon)),
        h('h4', null, s.name),
        h('div', { class: 'svc-desc' }, s.desc),
        h('div', { class: 'svc-foot' }, [
          h('div', { class: 'svc-price' }, fmtIDR(s.price) + '/kg'),
          h('div', { class: 'svc-dur' }, s.duration)
        ])
      ])))
    ]);
  },

  /* ---------- Catalog: Customers ---------- */
  'catalog/customers': () => {
    const customers = DB.get('customers');
    const active = customers.filter(c => c.active).length;
    const topCusts = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 6);

    return h('div', null, [
      PageHead({
        title: 'Customers',
        subtitle: active + ' pelanggan aktif dari ' + customers.length + ' total pelanggan',
        icon: I.users()
      }),
      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Pelanggan'), h('div', { class: 'sc-value' }, fmtNum(customers.length)), h('div', { class: 'sc-sub' }, 'terdaftar')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Aktif'), h('div', { class: 'sc-value', style: { color: 'var(--success)' } }, fmtNum(active)), h('div', { class: 'sc-sub' }, 'masih aktif')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Rata-rata Order'), h('div', { class: 'sc-value' }, '6.4'), h('div', { class: 'sc-sub' }, 'order per pelanggan')])
      ]),
      h('div', { style: { marginTop: '16px' } }, h('div', { class: 'grid-2col' },
        topCusts.map(c => h('div', {
          class: 'customer-card',
          onclick: () => Toast.show('Detail ' + c.name, 'info')
        }, [
          Avatar({ name: c.name }),
          h('div', { style: { flex: 1, minWidth: 0 } }, [
            h('strong', null, c.name),
            h('span', null, c.phone + ' · ' + c.totalSpent > 0 ? fmtIDR(c.totalSpent) : 'Baru')
          ]),
          StatusPill(c.active ? 'ready' : 'delivered')
        ]))
      ))
    ]);
  },

  /* ---------- Catalog: Price List ---------- */
  'catalog/prices': () => {
    const services = DB.get('services');

    return h('div', null, [
      PageHead({
        title: 'Price List',
        subtitle: 'Daftar harga layanan laundry',
        icon: I.price(),
        action: h('button', { class: 'btn btn-soft', onclick: () => ExportService.csv('price-list.csv', ['Layanan', 'Harga/kg', 'Durasi'], services.map(s => [s.name, s.price, s.duration])) }, [I.download(), h('span', null, 'Export CSV')])
      }),
      Section({
        title: 'Daftar Harga Layanan',
        icon: I.price(),
        bodyPad: false,
        children: Table({
          columns: [
            { label: 'Layanan', type: 'main' },
            { label: 'Deskripsi', type: 'text' },
            { label: 'Harga / kg', type: 'amount', align: 'right' },
            { label: 'Durasi', type: 'text' },
            { label: 'Status', type: 'text' }
          ],
          rows: services.map(s => [
            [h('strong', null, s.name), h('span', null, s.id.toUpperCase())],
            s.desc,
            fmtIDR(s.price),
            s.duration,
            s.popular
              ? h('span', { class: 'pill pill-express' }, [h('span', { class: 'p-dot' }), 'Populer'])
              : h('span', { class: 'pill pill-normal' }, [h('span', { class: 'p-dot' }), 'Reguler'])
          ])
        })
      })
    ]);
  },

  /* ---------- Reports: Sales Report ---------- */
  'reports/sales': () => {
    const orders = DB.get('orders');
    const revenue = orders.reduce((s, o) => s + o.amount, 0);
    const byService = {};
    for (const o of orders) byService[o.serviceName] = (byService[o.serviceName] || 0) + o.amount;

    const rows = Object.entries(byService)
      .map(([name, amount]) => ({ name, count: orders.filter(o => o.serviceName === name).length, amount }))
      .sort((a, b) => b.amount - a.amount);

    const max = rows.length ? rows[0].amount : 1;

    return h('div', null, [
      PageHead({
        title: 'Sales Report',
        subtitle: 'Ringkasan penjualan berdasarkan layanan',
        icon: I.chart(),
        action: h('button', { class: 'btn btn-soft', onclick: () => ExportService.csv('sales-report.csv', ['Layanan', 'Jumlah Order', 'Pendapatan'], rows.map(r => [r.name, r.count, r.amount])) }, [I.download(), h('span', null, 'Export CSV')])
      }),
      h('div', { class: 'summary-grid' }, [
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Total Revenue'), h('div', { class: 'sc-value', style: { color: 'var(--primary-700)' } }, fmtIDR(revenue)), h('div', { class: 'sc-sub' }, 'dari ' + orders.length + ' order')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Rata-rata / Order'), h('div', { class: 'sc-value' }, fmtIDR(Math.round(revenue / Math.max(orders.length, 1)))), h('div', { class: 'sc-sub' }, 'nilai order rata-rata')]),
        h('div', { class: 'summary-card' }, [h('div', { class: 'sc-label' }, 'Layanan'), h('div', { class: 'sc-value' }, fmtNum(rows.length)), h('div', { class: 'sc-sub' }, 'paling laris: ' + (rows[0] ? rows[0].name : '-'))])
      ]),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Pendapatan per Layanan',
        icon: I.chart(),
        children: h('div', { class: 'service-rank' },
          rows.map((r, i) => h('div', { class: 'rank-item' }, [
            h('div', { class: 'rank-num' }, String(i + 1)),
            h('div', { class: 'rank-info' }, [
              h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, [
                h('strong', null, r.name),
                h('span', null, r.count + ' order · ' + fmtIDR(r.amount))
              ]),
              h('div', { class: 'rank-bar' }, h('div', { style: { width: Math.max(8, Math.round((r.amount / max) * 100)) + '%' } }))
            ])
          ]))
        )
      }))
    ]);
  },

  /* ---------- Reports: Order Report ---------- */
  'reports/orders': () => {
    const filter = State.get('filterStatus');
    const orders = filter ? DB.ordersByStatus(filter) : DB.get('orders');
    const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return h('div', null, [
      PageHead({
        title: 'Order Report',
        subtitle: 'Laporan terperinci seluruh order laundry',
        icon: I.file(),
        action: h('button', {
          class: 'btn btn-soft',
          onclick: () => ExportService.csv('order-report.csv', ['ID', 'Pelanggan', 'Layanan', 'Berat', 'Total', 'Status', 'Tanggal'], sorted.map(o => [o.id, o.customerName, o.serviceName, o.weight + 'kg', o.amount, STATUS_META[o.status].label, fmtDateTime(o.createdAt)]))
        }, [I.download(), h('span', null, 'Export CSV')])
      }),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' } },
        [null, ...STATUS_FLOW].map(s => h('button', {
          class: 'chip' + (filter === s ? ' active' : ''),
          onclick: () => State.set({ filterStatus: s })
        }, (s ? STATUS_META[s].label : 'Semua') + ' (' + (s ? DB.ordersByStatus(s).length : DB.get('orders').length) + ')'))
      ),
      Section({
        title: filter ? 'Laporan: ' + STATUS_META[filter].label : 'Laporan Semua Order',
        icon: I.file(),
        bodyPad: false,
        children: Table({
          columns: [
            { label: 'ID', type: 'id' },
            { label: 'Pelanggan', type: 'main' },
            { label: 'Layanan', type: 'text' },
            { label: 'Berat', type: 'amount', align: 'right' },
            { label: 'Total', type: 'amount', align: 'right' },
            { label: 'Status', type: 'text' },
            { label: 'Dibuat', type: 'text' }
          ],
          rows: sorted.slice(0, 50).map(o => [
            o.id,
            [h('strong', null, o.customerName), h('span', null, o.type)],
            o.serviceName,
            o.weight + ' kg',
            fmtIDR(o.amount),
            StatusPill(o.status),
            fmtDateTime(o.createdAt)
          ])
        })
      })
    ]);
  },

  /* ---------- Reports: Export Reports ---------- */
  'reports/export': () => {
    const orders = DB.get('orders');
    const txs = DB.get('transactions');
    const customers = DB.get('customers');
    const services = DB.get('services');

    const cards = [
      { icon: I.clipboard(), label: 'Export Order CSV', desc: orders.length + ' order', bg: '#DBEAFE', color: '#1D4ED8', fn: () => ExportService.csv('orders.csv', ['ID', 'Pelanggan', 'Layanan', 'Berat', 'Total', 'Status'], orders.map(o => [o.id, o.customerName, o.serviceName, o.weight, o.amount, o.status])) },
      { icon: I.money(), label: 'Export Transaksi CSV', desc: txs.length + ' transaksi', bg: '#DCFCE7', color: '#15803D', fn: () => ExportService.csv('transactions.csv', ['ID', 'Deskripsi', 'Metode', 'Tipe', 'Jumlah'], txs.map(t => [t.id, t.desc, t.method, t.type, t.amount])) },
      { icon: I.users(), label: 'Export Pelanggan CSV', desc: customers.length + ' pelanggan', bg: '#FEF3C7', color: '#B45309', fn: () => ExportService.csv('customers.csv', ['Nama', 'Telepon', 'Alamat', 'Total Order'], customers.map(c => [c.name, c.phone, c.address, c.totalOrders])) },
      { icon: I.tag(), label: 'Export Layanan CSV', desc: services.length + ' layanan', bg: '#EDE9FE', color: '#6D28D9', fn: () => ExportService.csv('services.csv', ['Nama', 'Harga', 'Durasi'], services.map(s => [s.name, s.price, s.duration])) }
    ];

    return h('div', null, [
      PageHead({
        title: 'Export Reports',
        subtitle: 'Unduh data dalam format CSV',
        icon: I.download()
      }),
      h('div', { class: 'export-grid' },
        cards.map(c => h('div', { class: 'export-card', onclick: c.fn }, [
          h('div', { class: 'ex-ic', style: { background: c.bg, color: c.color } }, c.icon),
          h('strong', null, c.label),
          h('span', null, c.desc)
        ]))
      ),
      h('div', { style: { marginTop: '16px', fontSize: '12px', color: 'var(--ink-4)', textAlign: 'center' } }, 'File CSV akan diunduh otomatis ke perangkat Anda · Format UTF-8 BOM')
    ]);
  },

  /* ---------- Settings: Company Profile ---------- */
  'settings/profile': () => {
    return h('div', null, [
      PageHead({
        title: 'Company Profile',
        subtitle: 'Kelola profil usaha laundry Anda',
        icon: I.building()
      }),
      h('div', { class: 'grid-main-left' }, [
        Section({
          title: 'Informasi Usaha',
          icon: I.building(),
          children: h('div', { class: 'form-grid' }, [
            h('div', null, [h('label', { class: 'form-label' }, 'Nama Usaha'), h('input', { class: 'form-control', value: 'FreshWash Laundry' })]),
            h('div', null, [h('label', { class: 'form-label' }, 'Pemilik'), h('input', { class: 'form-control', value: 'Admin' })]),
            h('div', null, [h('label', { class: 'form-label' }, 'Telepon'), h('input', { class: 'form-control', value: '0812-3456-7890' })]),
            h('div', null, [h('label', { class: 'form-label' }, 'Email'), h('input', { class: 'form-control', value: 'admin@freshwash.id' })]),
            h('div', { class: 'full' }, [h('label', { class: 'form-label' }, 'Alamat'), h('textarea', { class: 'form-control' }, 'Jl. Kebersihan No. 12, Jakarta Selatan')]),
            h('div', { class: 'full' }, [
              h('div', { class: 'form-actions' }, [
                h('button', { class: 'btn btn-ghost', onclick: () => Toast.show('Perubahan dibatalkan', 'info') }, 'Batal'),
                h('button', { class: 'btn btn-primary', onclick: () => Toast.show('Profil usaha tersimpan', 'success') }, 'Simpan Perubahan')
              ])
            ])
          ])
        }),
        Section({
          title: 'Info Demo',
          icon: I.info ? I.info() : I.home(),
          children: h('div', { style: { fontSize: '12.5px', color: 'var(--ink-3)' } }, [
            h('p', { style: { marginBottom: '8px' } }, 'Ini adalah mode demo — perubahan hanya tersimpan di browser Anda secara lokal.'),
            h('p', null, 'Untuk mengganti data ke pengaturan awal, gunakan fitur Reset Data pada menu Backup & Restore.')
          ])
        })
      ])
    ]);
  },

  /* ---------- Settings: System Settings ---------- */
  'settings/system': () => {
    const toggles = [
      { label: 'Notifikasi Order Baru', desc: 'Munculkan notifikasi saat ada order masuk', on: true },
      { label: 'Pembayaran Otomatis', desc: 'Tandai lunas otomatis saat status Delivered', on: true },
      { label: 'Mode Gelap (Coming Soon)', desc: 'Tema gelap untuk kenyamanan malam hari', on: false },
      { label: 'Pengingat Pickup', desc: 'Ingatkan jadwal antar jemput pelanggan', on: true },
      { label: 'Laporan Mingguan', desc: 'Kirim ringkasan penjualan tiap akhir pekan', on: false }
    ];

    return h('div', null, [
      PageHead({
        title: 'System Settings',
        subtitle: 'Atur preferensi sistem Anda',
        icon: I.settings()
      }),
      Section({
        title: 'Preferensi Sistem',
        icon: I.settings(),
        children: h('div', null,
          toggles.map(t => h('div', { class: 'setting-row' }, [
            h('div', { class: 'set-ic', style: { background: '#E0F2FE', color: '#1D4ED8' } }, t.on ? I.check() : I.settings()),
            h('div', { class: 'set-info' }, [
              h('strong', null, t.label),
              h('span', null, t.desc)
            ]),
            h('label', { class: 'switch' }, [
              h('input', { type: 'checkbox', checked: t.on, onchange: (e) => Toast.show(t.label + (e.target.checked ? ' diaktifkan' : ' dimatikan'), 'info') }),
              h('span', { class: 'slider' })
            ])
          ]))
        )
      }),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Preferensi Pembayaran',
        icon: I.money(),
        children: h('div', null, [
          h('div', { class: 'setting-row' }, [
            h('div', { class: 'set-ic', style: { background: '#DCFCE7', color: '#15803D' } }, I.money()),
            h('div', { class: 'set-info' }, [h('strong', null, 'Metode Pembayaran'), h('span', null, 'Cash, Transfer, QRIS, E-Wallet')]),
            h('button', { class: 'btn btn-sm btn-ghost', onclick: () => Toast.show('Metode pembayaran sudah lengkap', 'success') }, 'Kelola')
          ]),
          h('div', { class: 'setting-row' }, [
            h('div', { class: 'set-ic', style: { background: '#FEF3C7', color: '#B45309' } }, I.price()),
            h('div', { class: 'set-info' }, [h('strong', null, 'Mata Uang'), h('span', null, 'Rupiah (Rp) — Indonesia')]),
            h('span', { class: 'pill pill-normal' }, 'Rp')
          ])
        ])
      }))
    ]);
  },

  /* ---------- Settings: Backup & Restore ---------- */
  'settings/backup': () => {
    const backups = [
      { name: 'Backup Otomatis', date: 'Hari ini', time: '00.00 WIB', size: '2.4 MB', auto: true },
      { name: 'Backup Manual', date: 'Kemarin', time: '18.30 WIB', size: '2.4 MB', auto: false },
      { name: 'Backup Mingguan', date: 'Senin lalu', time: '00.00 WIB', size: '2.3 MB', auto: true }
    ];

    return h('div', null, [
      PageHead({
        title: 'Backup & Restore',
        subtitle: 'Keamanan data usaha Anda',
        icon: I.archive()
      }),
      h('div', { class: 'backup-card' }, [
        h('div', { class: 'bc-ic' }, I.archive()),
        h('strong', null, 'Data tersimpan aman'),
        h('p', null, 'Semua data tersimpan di localStorage browser. Backup penuh dapat diunduh kapan saja.'),
        h('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' } }, [
          h('button', { class: 'btn btn-primary', onclick: () => ExportService.csv('freshwash-backup.json', ['Data'], [[JSON.stringify(DB.get('orders').length + ' orders, ' + DB.get('customers').length + ' customers, ' + DB.get('transactions').length + ' transactions')]]) }, [I.download(), h('span', null, 'Backup Sekarang')]),
          h('button', {
            class: 'btn btn-danger',
            onclick: () => {
              Modal.open({
                title: 'Reset Data Demo',
                body: h('p', { style: { fontSize: '13px', color: 'var(--ink-2)' } }, 'Semua perubahan yang Anda buat akan dihapus dan data dikembalikan ke kondisi awal. Lanjutkan?'),
                footer: [
                  h('button', { class: 'btn btn-ghost btn-sm', onclick: () => Modal.close() }, 'Batal'),
                  h('button', { class: 'btn btn-danger btn-sm', onclick: () => { DB.reset(); Modal.close(); Toast.show('Data demo berhasil direset', 'success'); } }, 'Ya, Reset')
                ]
              });
            }
          }, 'Reset Data Demo')
        ])
      ]),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Riwayat Backup',
        icon: I.archive(),
        bodyPad: false,
        children: backups.map(b => h('div', { class: 'order-row' }, [
          h('div', { class: 'set-ic', style: { background: '#E0F2FE', color: '#1D4ED8' } }, b.auto ? I.refresh() : I.save ? I.save() : I.archive()),
          h('div', { class: 'or-cust' }, [h('strong', null, b.name), h('span', null, b.date + ' · ' + b.time + ' · ' + b.size)]),
          b.auto ? h('span', { class: 'pill pill-active' }, [h('span', { class: 'p-dot' }), 'Otomatis']) : h('span', { class: 'pill pill-normal' }, [h('span', { class: 'p-dot' }), 'Manual']),
          h('button', { class: 'btn btn-sm btn-ghost', onclick: () => Toast.show('Backup ' + b.name + ' dipulihkan', 'success') }, 'Restore')
        ]))
      }))
    ]);
  }
};

/* ============================================================
   APP — render root & lifecycle
   ============================================================ */
const App = {
  isLoggedIn: false,

  login() {
    this.isLoggedIn = true;
    sessionStorage.setItem('freshwash_session', '1');
    this.renderRoot();
    setTimeout(() => Toast.show('Selamat datang di FreshWash ⚡', 'success'), 350);
  },

  logout() {
    this.isLoggedIn = false;
    sessionStorage.removeItem('freshwash_session');
    this.renderRoot();
    Toast.show('Anda telah keluar dari sistem', 'info');
  },

  renderRoot() {
    const vnode = this.isLoggedIn ? AppShell() : LoginScreen();
    Render.render(vnode);
  }
};

/* ---------- Bootstrap ---------- */
DB.init();
App.isLoggedIn = sessionStorage.getItem('freshwash_session') === '1';
App.renderRoot();

/* Global keyboard: '/' untuk fokus pencarian */
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    const input = document.querySelector('.search-pill input');
    if (input) input.focus();
  }
  if (e.key === 'Escape') {
    Modal.close();
    State.set({ notifOpen: false });
  }
});

/* Klik di luar notif untuk menutup */
document.addEventListener('click', (e) => {
  if (State.get('notifOpen') && !e.target.closest('.notif-pop') && !e.target.closest('.icon-btn')) {
    State.set({ notifOpen: false });
  }
});