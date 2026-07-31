/* ============================================
   MANAGEMENT SYSTEM - CHART
   Chart.js Configurations & Rendering
   ============================================ */

// ===== CHART DEFAULTS =====
Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#94A3B8';
Chart.defaults.borderColor = '#E2E8F0';

// ===== COLOR PALETTE =====
const chartColors = {
  primary: '#2563EB',
  primaryLight: 'rgba(37, 99, 235, 0.1)',
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.1)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  purple: '#8B5CF6',
  purpleLight: 'rgba(139, 92, 246, 0.1)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.1)'
};

const chartPalette = [
  '#2563EB', '#22C55E', '#F59E0B', '#EF4444',
  '#8B5CF6', '#3B82F6', '#EC4899', '#14B8A6'
];

// ===== SALES LINE CHART =====
function renderSalesChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const defaultDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const values = AppState.dashboard?.summary?.weeklySales;

  // FIX: Check length before mapping - empty array is truthy!
  const labels = values && values.length > 0 ? values.map(v => v.day) : defaultDays;
  const chartData = values && values.length > 0 ? values.map(v => v.value) : [0, 0, 0, 0, 0, 0, 0];

  const config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Penjualan (Rp)',
        data: chartData,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primaryLight,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1E293B',
          titleColor: '#fff',
          bodyColor: '#CBD5E1',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return 'Rp ' + context.parsed.y.toLocaleString('id-ID');
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#F1F5F9' },
          ticks: {
            font: { size: 11 },
            callback: function(value) {
              if (value >= 1000000) return 'Rp' + (value / 1000000).toFixed(1) + 'jt';
              if (value >= 1000) return 'Rp' + (value / 1000).toFixed(0) + 'rb';
              return 'Rp' + value;
            }
          }
        }
      }
    }
  };

  new Chart(ctx, config);
}

// ===== BAR CHART - Top Products =====
function renderBarChart(canvasId, labels, data, label) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const hasData = labels && labels.length > 0 && data && data.length > 0;

  const config = {
    type: 'bar',
    data: {
      labels: hasData ? labels : ['Belum ada data'],
      datasets: [{
        label: label || 'Value',
        data: hasData ? data : [0],
        backgroundColor: hasData ? chartPalette.slice(0, labels.length) : ['#E2E8F0'],
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 32
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1E293B',
          titleColor: '#fff',
          bodyColor: '#CBD5E1',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return 'Rp ' + context.parsed.y.toLocaleString('id-ID');
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#F1F5F9' },
          ticks: {
            font: { size: 11 },
            callback: function(value) {
              if (value >= 1000000) return 'Rp' + (value / 1000000).toFixed(1) + 'jt';
              if (value >= 1000) return 'Rp' + (value / 1000).toFixed(0) + 'rb';
              return 'Rp' + value;
            }
          }
        }
      }
    }
  };

  new Chart(ctx, config);
}

// ===== PIE / DOUGHNUT CHART =====
function renderDoughnutChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const hasData = labels && labels.length > 0 && data && data.length > 0;

  const config = {
    type: 'doughnut',
    data: {
      labels: hasData ? labels : ['Belum ada data'],
      datasets: [{
        data: hasData ? data : [1],
        backgroundColor: hasData ? chartPalette.slice(0, labels.length) : ['#E2E8F0'],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            font: { size: 11 }
          }
        },
        tooltip: {
          backgroundColor: '#1E293B',
          titleColor: '#fff',
          bodyColor: '#CBD5E1',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
              return context.label + ': ' + pct + '%';
            }
          }
        }
      }
    }
  };

  new Chart(ctx, config);
}