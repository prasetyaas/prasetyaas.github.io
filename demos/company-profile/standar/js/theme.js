/* ==================================================
   SAKURA KOI INDONESIA - Theme (Dark Mode Toggle)
   Mengelola tema terang/gelap dengan localStorage.
   ================================================== */

(function() {
    'use strict';

    /* Theme key localStorage */
    const THEME_KEY = 'ski_theme';

    /* Terapkan tema berdasarkan preferensi tersimpan */
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
    }

    /* Ambil tema dari localStorage (default: light) */
    function getSavedTheme() {
        try {
            return localStorage.getItem(THEME_KEY) || 'light';
        } catch (e) {
            return 'light';
        }
    }

    /* Simpan tema ke localStorage */
    function saveTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            console.error('Error saving theme:', e);
        }
    }

    /* Inisialisasi & pasang event listener */
    function initTheme() {
        applyTheme(getSavedTheme());

        const toggle = document.querySelector('.theme-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            saveTheme(next);
        });
    }

    /* Jalankan setelah DOM siap */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

    /* Expose ke global untuk halaman admin */
    window.SKITheme = {
        applyTheme,
        getSavedTheme
    };

})();