/* ============================================================
   RentFlow — Application Bootstrap
   - Login / Logout
   - RenderRoot (whole app re-render)
   - Skeleton loading simulation
   ============================================================ */

const App = {
  /* ---------- Login ---------- */
  login() {
    State.data.isLoggedIn = true;
    localStorage.setItem('rentflow_logged', '1');
    App.renderRoot();
    Toast.show('Selamat datang di RentFlow 👋', 'success');
  },

  logout() {
    ConfirmDialog({
      title: 'Keluar Aplikasi',
      message: 'Anda yakin ingin keluar dari sesi demo ini?',
      confirmLabel: 'Ya, keluar',
      danger: true,
      onConfirm: () => {
        State.data.isLoggedIn = false;
        localStorage.removeItem('rentflow_logged');
        App.renderRoot();
        Toast.show('Anda telah keluar', 'info');
      }
    });
  },

  /* ---------- Render root ---------- */
  renderRoot() {
    const root = document.getElementById('root');
    root.innerHTML = '';

    if (!State.get('isLoggedIn')) {
      root.appendChild(LoginScreen());
      return;
    }

    root.appendChild(AppShell());
  },

  /* ---------- Simulate page transition (skeleton) ---------- */
  navigateWithLoading(route) {
    State.set({ loading: true });

    const root = document.getElementById('root');
    root.innerHTML = '';
    root.appendChild(h('div', { class: 'page-loading' }, Skeleton({ rows: 6, type: 'list' })));

    setTimeout(() => {
      State.set({ loading: false });
      Router.navigate(route);
    }, 320);
  },

  /* ---------- Init ---------- */
  init() {
    DB.init();

    // Restore sesi login
    try {
      if (localStorage.getItem('rentflow_logged') === '1') {
        State.data.isLoggedIn = true;
      }
    } catch (e) { /* ignore */ }

    // Keyboard shortcut: "/" fokus ke search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !State.get('isLoggedIn')) return;
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        const input = document.querySelector('.search-pill input');
        if (input) input.focus();
      }
      if (e.key === 'Escape') {
        State.set({ notifOpen: false, sidebarOpen: false });
      }
    });

    this.renderRoot();
  }
};

/* ---------- Startup ---------- */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});