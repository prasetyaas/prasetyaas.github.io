/* ============================================================
   FreshWash — Reusable Components
   ============================================================ */

/* ---------- Toast ---------- */
const Toast = {
  show(msg, type = 'success', timeout = 3200) {
    const host = document.getElementById('toastHost');
    const toasts = host.querySelectorAll('.toast');
    if (toasts.length > 3) toasts[0].remove();

    const icons = {
      success: I.checkCircle(),
      info: I.bell(),
      warning: I.clock()
    };

    const el = h('div', { class: 'toast ' + type }, [
      h('div', { class: 't-ic', style: { background: type === 'success' ? '#DCFCE7' : type === 'warning' ? '#FEF3C7' : '#DBEAFE', color: type === 'success' ? '#15803D' : type === 'warning' ? '#B45309' : '#0369A1' } }, icons[type] || icons.info),
      h('span', null, msg)
    ]);

    host.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(30px)';
      el.style.transition = 'all .3s ease';
      setTimeout(() => el.remove(), 320);
    }, timeout);
  }
};

/* ---------- Modal ---------- */
const Modal = {
  open({ title, body, footer, size }) {
    const host = document.getElementById('modalHost');
    host.innerHTML = '';

    const closeBtn = h('button', {
      class: 'modal-close',
      onclick: () => this.close()
    }, I.x());

    const head = h('div', { class: 'modal-head' }, [
      h('h3', null, title || ''),
      closeBtn
    ]);

    const card = h('div', { class: 'modal-card' + (size === 'lg' ? ' modal-lg' : '') }, [
      head,
      h('div', { class: 'modal-body' }, body),
      footer ? h('div', { class: 'modal-foot' }, footer) : null
    ]);

    const backdrop = h('div', {
      class: 'modal-backdrop',
      onclick: (e) => { if (e.target === backdrop) this.close(); }
    }, card);

    host.appendChild(backdrop);
  },

  close() {
    const host = document.getElementById('modalHost');
    host.innerHTML = '';
  }
};

/* ---------- Status pill ---------- */
function StatusPill(status) {
  const meta = STATUS_META[status] || STATUS_META.waiting;
  return h('span', { class: 'pill pill-' + meta.cls }, [
    h('span', { class: 'p-dot' }),
    meta.label
  ]);
}

/* ---------- Section card with head ---------- */
function Section({ title, icon: ic, action, children, bodyPad = true }) {
  return h('div', { class: 'section' }, [
    h('div', { class: 'section-head' }, [
      h('div', { class: 'section-title' }, [
        ic ? h('span', { class: 'st-ic' }, ic) : null,
        h('h3', null, title)
      ]),
      action || null
    ]),
    h('div', { class: 'section-body' + (bodyPad ? '' : ' no-pad') }, children)
  ]);
}

/* ---------- Page header ---------- */
function PageHead({ title, subtitle, icon: ic, action }) {
  return h('div', { class: 'page-head' }, [
    h('div', { class: 'ph-left' }, [
      h('div', { class: 'ph-emblem' }, ic || I.home()),
      h('div', null, [
        h('h1', null, title),
        h('p', null, subtitle || '')
      ])
    ]),
    action || null
  ]);
}

/* ---------- KPI card ---------- */
function KpiCard({ label, value, sub, icon: ic, bg, color }) {
  return h('div', { class: 'kpi-card' }, [
    h('div', { class: 'kpi-ic', style: { background: bg, color } }, ic),
    h('div', null, [
      h('div', { class: 'kpi-label' }, label),
      h('div', { class: 'kpi-value' }, value),
      sub ? h('div', { class: 'kpi-sub' }, sub) : null
    ])
  ]);
}

/* ---------- Status pipeline step ---------- */
function PipeStep({ status, count, active, onClick }) {
  const meta = STATUS_META[status];
  return h('div', {
    class: 'pipe-step' + (active ? ' active' : ''),
    onclick: onClick
  }, [
    h('div', { class: 'ps-ic st-bg-' + meta.cls, style: { color: meta.color } }, icon(meta.icon)),
    h('div', { class: 'ps-label' }, meta.label),
    h('div', { class: 'ps-value' }, String(count)),
    h('div', { class: 'ps-sub' }, count > 0 ? 'order aktif' : 'tidak ada')
  ]);
}

/* ---------- Order row (compact) ---------- */
function OrderRow(order, onClick) {
  return h('div', { class: 'order-row', onclick: onClick }, [
    h('div', { class: 'or-id' }, order.id),
    h('div', { class: 'or-cust' }, [
      h('strong', null, order.customerName),
      h('span', null, order.serviceName + ' · ' + order.weight + ' kg')
    ]),
    StatusPill(order.status),
    h('div', { class: 'or-amount' }, fmtIDR(order.amount)),
    h('div', { class: 'or-time' }, timeAgo(order.createdAt))
  ]);
}

/* ---------- Table (declarative) ---------- */
function Table({ columns, rows }) {
  return h('div', { class: 'table-wrap' }, [
    h('table', { class: 'tbl' }, [
      h('thead', null, h('tr', null, columns.map(c => h('th', { style: c.align === 'right' ? { textAlign: 'right' } : null }, c.label)))),
      h('tbody', null, rows.map(row => h('tr', null, row.map((cell, i) => {
        const col = columns[i] || {};
        const cls = 'cell-' + (col.type || 'text');
        return h('td', { class: cls, style: col.align === 'right' ? { textAlign: 'right' } : null }, cell);
      }))))
    ])
  ]);
}

/* ---------- Empty state ---------- */
function EmptyState({ icon: emoji, title, desc }) {
  return h('div', { class: 'empty-state' }, [
    h('div', { class: 'es-ic' }, emoji || '✨'),
    h('strong', null, title || 'Tidak ada data'),
    h('p', null, desc || '')
  ]);
}

/* ---------- Avatar with initials ---------- */
function Avatar({ name, size = 42, bg, color }) {
  return h('div', {
    class: 'cu-av',
    style: { width: size + 'px', height: size + 'px', background: bg || '#E0F2FE', color: color || '#1D4ED8' }
  }, initials(name));
}

/* ---------- Export CSV helper ---------- */
const ExportService = {
  csv(filename, headers, rows) {
    const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const content = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    Toast.show('Laporan ' + filename + ' berhasil diexport', 'success');
  }
};