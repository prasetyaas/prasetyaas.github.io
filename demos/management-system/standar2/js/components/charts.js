/* ============================================
   StockPilot — Charts Component (Chart.js wrapper)
   ============================================ */

const Charts = {
  _charts: {},

  make(canvasId, config) {
    const el = document.getElementById(canvasId);
    if (!el) return null;
    if (typeof Chart === 'undefined') return null;
    if (this._charts[canvasId]) this._charts[canvasId].destroy();

    const css = getComputedStyle(document.documentElement);
    const defaults = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          labels: { color: '#64748b', usePointStyle: true, pointStyle: 'circle', padding: 14, boxWidth: 8, font: { family: "'Inter', sans-serif", size: 11 } }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          borderColor: 'rgba(255,255,255,.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: "'Inter', sans-serif", size: 12, weight: '700' },
          bodyFont: { family: "'Inter', sans-serif", size: 11.5 }
        }
      },
      scales: {}
    };

    const merged = { ...config, options: deepMerge(defaults, config.options || {}) };
    merged.options.scales = merged.options.scales || {};
    Object.values(merged.options.scales).forEach(s => {
      if (!s.ticks) s.ticks = {};
      s.ticks.color = '#94a3b8';
      s.ticks.font = { family: "'Inter', sans-serif", size: 11 };
      if (!s.grid) s.grid = {};
      s.grid.color = 'rgba(148,163,184,.15)';
    });

    const chart = new Chart(el, merged);
    this._charts[canvasId] = chart;
    setTimeout(() => chart.resize(), 200);
    return chart;
  },

  destroyAll() {
    Object.values(this._charts).forEach(c => c.destroy());
    this._charts = {};
  }
};

function deepMerge(target, source) {
  const out = { ...target };
  Object.entries(source || {}).forEach(([k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  });
  return out;
}