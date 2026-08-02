/* ============================================
   StockPilot — Router: workspace & tool definitions
   ============================================ */

const Router = {
  workspaces: {
    hub: {
      title: 'Operations Hub',
      tools: [
        { id: 'overview', label: 'Overview', icon: I.gauge, fn: () => HubPage.overview() },
        { id: 'today', label: "Today's Activity", icon: I.activity, fn: () => HubPage.todayActivity() },
        { id: 'snapshot', label: 'Business Snapshot', icon: I.chart, fn: () => HubPage.snapshot() },
        { id: 'lowstock', label: 'Low Stock Alert', icon: I.alert, fn: () => HubPage.lowStock() },
        { id: 'recent', label: 'Recent Transactions', icon: I.trend, fn: () => HubPage.recentTx() }
      ]
    },
    inventory: {
      title: 'Inventory Ops',
      tools: [
        { id: 'stockin', label: 'Stock In', icon: I.truck, fn: () => InventoryPage.stockin() },
        { id: 'stockout', label: 'Stock Out', icon: I.package, fn: () => InventoryPage.stockout() },
        { id: 'adjust', label: 'Stock Adjustment', icon: I.settings, fn: () => InventoryPage.adjust() },
        { id: 'movement', label: 'Stock Movement', icon: I.activity, fn: () => InventoryPage.movement() },
        { id: 'audit', label: 'Inventory Audit', icon: I.check, fn: () => InventoryPage.audit() },
        { id: 'history', label: 'Transaction History', icon: I.file, fn: () => InventoryPage.history() }
      ]
    },
    catalog: {
      title: 'Catalog',
      tools: [
        { id: 'products', label: 'Products', icon: I.box, fn: () => CatalogPage.products() },
        { id: 'categories', label: 'Categories', icon: I.tag, fn: () => CatalogPage.categories() },
        { id: 'brands', label: 'Brands', icon: I.medal, fn: () => CatalogPage.brands() },
        { id: 'units', label: 'Units', icon: I.layering, fn: () => CatalogPage.units() },
        { id: 'suppliers', label: 'Suppliers', icon: I.supplier, fn: () => CatalogPage.suppliers() },
        { id: 'customers', label: 'Customers', icon: I.users, fn: () => CatalogPage.customers() }
      ]
    },
    procurement: {
      title: 'Procurement',
      tools: [
        { id: 'request', label: 'Purchase Request', icon: I.file, fn: () => ProcurementPage.request() },
        { id: 'po', label: 'Purchase Order', icon: I.truck, fn: () => ProcurementPage.po() },
        { id: 'receiving', label: 'Goods Receiving', icon: I.package, fn: () => ProcurementPage.receiving() },
        { id: 'history', label: 'Purchase History', icon: I.archive, fn: () => ProcurementPage.history() }
      ]
    },
    analytics: {
      title: 'Analytics',
      tools: [
        { id: 'summary', label: 'Inventory Summary', icon: I.chart, fn: () => AnalyticsPage.summary() },
        { id: 'movement', label: 'Stock Movement Report', icon: I.activity, fn: () => AnalyticsPage.movement() },
        { id: 'fast', label: 'Fast Moving Products', icon: I.trend, fn: () => AnalyticsPage.fast() },
        { id: 'low', label: 'Low Stock Report', icon: I.alert, fn: () => AnalyticsPage.low() },
        { id: 'purchase', label: 'Purchase Report', icon: I.truck, fn: () => AnalyticsPage.purchase() },
        { id: 'export', label: 'Export Reports', icon: I.download, fn: () => AnalyticsPage.export() }
      ]
    },
    admin: {
      title: 'Administration',
      tools: [
        { id: 'users', label: 'User Management', icon: I.users, fn: () => AdminPage.users() },
        { id: 'roles', label: 'Roles & Permissions', icon: I.shield, fn: () => AdminPage.roles() },
        { id: 'logs', label: 'Activity Log', icon: I.activity, fn: () => AdminPage.logs() },
        { id: 'settings', label: 'System Settings', icon: I.settings, fn: () => AdminPage.settings() },
        { id: 'backup', label: 'Backup & Restore', icon: I.archive, fn: () => AdminPage.backup() }
      ]
    }
  }
};