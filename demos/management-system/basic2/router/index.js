/* ============================================================
   RentFlow — Router & Navigation Definition
   6 grup (workspaces + 5 workspace) · 19 halaman
   ============================================================ */

const MENU = [
  {
    id: 'workspaces',
    title: 'Semua Workspace',
    icon: 'grid',
    items: [
      { route: 'workspaces', label: 'Workspace Home', icon: 'grid' }
    ]
  },
  {
    id: 'hub',
    title: 'Rental Hub',
    icon: 'home',
    items: [
      { route: 'hub/overview', label: 'Overview', icon: 'home' },
      { route: 'hub/today', label: "Today's Rentals", icon: 'calendar' },
      { route: 'hub/available', label: 'Available Items', icon: 'box' },
      { route: 'hub/calendar', label: 'Rental Calendar', icon: 'calendar' }
    ]
  },
  {
    id: 'ops',
    title: 'Rental Operations',
    icon: 'key',
    items: [
      { route: 'ops/new', label: 'New Rental', icon: 'plus' },
      { route: 'ops/active', label: 'Active Rentals', icon: 'key' },
      { route: 'ops/returns', label: 'Item Returns', icon: 'undo' },
      { route: 'ops/history', label: 'Rental History', icon: 'history' }
    ]
  },
  {
    id: 'catalog',
    title: 'Catalog',
    icon: 'tag',
    items: [
      { route: 'catalog/items', label: 'Rental Items', icon: 'box' },
      { route: 'catalog/categories', label: 'Categories', icon: 'grid' },
      { route: 'catalog/customers', label: 'Customers', icon: 'users' }
    ]
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'chart',
    items: [
      { route: 'reports/rental', label: 'Rental Report', icon: 'file' },
      { route: 'reports/revenue', label: 'Revenue Report', icon: 'money' },
      { route: 'reports/export', label: 'Export Report', icon: 'download' }
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

/* ---------- Router ---------- */
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
      route = 'workspaces';
    }
    State.setRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  resolve(route) {
    const pages = {
      'workspaces': () => null, // ditangani langsung oleh AppShell (WorkspaceHome)
      'hub/overview': () => HubPage.overview(),
      'hub/today': () => HubPage.today(),
      'hub/available': () => HubPage.available(),
      'hub/calendar': () => HubPage.calendar(),
      'ops/new': () => OperationsPage.newRental(),
      'ops/active': () => OperationsPage.active(),
      'ops/returns': () => OperationsPage.returns(),
      'ops/history': () => OperationsPage.history(),
      'catalog/items': () => CatalogPage.items(),
      'catalog/categories': () => CatalogPage.categories(),
      'catalog/customers': () => CatalogPage.customers(),
      'reports/rental': () => ReportsPage.rental(),
      'reports/revenue': () => ReportsPage.revenue(),
      'reports/export': () => ReportsPage.exportReport(),
      'settings/profile': () => SettingsPage.profile(),
      'settings/system': () => SettingsPage.system(),
      'settings/backup': () => SettingsPage.backup()
    };
    return (pages[route] || pages['hub/overview'])();
  }
};