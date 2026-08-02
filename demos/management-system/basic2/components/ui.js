/* ============================================================
   RentFlow — Reusable UI Components
   Toast · Modal · ConfirmDialog · StatusPill · Badge
   Section · PageHead · EmptyState · Skeleton · Avatar
   ============================================================ */

/* ---------- Toast ---------- */
const Toast = {
  show(msg, type = 'success', timeout = 3200) {
    const host = document.getElementById('toastHost');
    const toasts = host.querySelectorAll('.toast');
    if (toasts.length > 3) toasts[0].remove();

    const iconMap = {
      success: I.checkCircle(),
      info: I.bell(),
      warning: I.alert(),
      error: I.alert()
    };

    const el = h('div', { class: 'toast toast-' + type }, [
      h('div', { class: 't-ic' }, iconMap[type] || iconMap.info),
      h('span', null, msg)
    ]);

    host.appendChild(el);
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 320);
    }, timeout);
  }
};

/* ---------- Modal ---------- */
const Modal = {
  open({ title, body, footer, size }) {
    const host = document.getElementById('modalHost');
    host.innerHTML = '';

    const card = h('div', { class: 'modal-card' + (size === 'lg' ? ' modal-lg' : '') }, [
      h('div', { class: 'modal-head' }, [
        h('div', { class: 'modal-head-left' }, [
          h('span', { class: 'modal-dots' }, [h('i'), h('i'), h('i')]),
          h('h3', null, title || '')
        ]),
        h('button', { class: 'modal-close', onclick: () => Modal.close() }, I.x())
      ]),
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

/* ---------- Confirm Dialog ---------- */
function ConfirmDialog({ title, message, confirmLabel = 'Ya, Lanjutkan', cancelLabel = 'Batal', danger = false, onConfirm }) {
  const body = h('div', null, [
    h('div', { class: 'confirm-icon' + (danger ? ' danger' : '') }, danger ? I.alert() : I.checkCircle()),
    h('p', { class: 'confirm-msg' }, message)
  ]);

  const footer = [
    h('button', { class: 'btn btn-ghost', onclick: () => Modal.close() }, cancelLabel),
    h('button', {
      class: 'btn ' + (danger ? 'btn-danger' : 'btn-primary'),
      onclick: () => { Modal.close(); onConfirm(); }
    }, confirmLabel)
  ];

  Modal.open({ title, body, footer, size: 'sm' });
}

/* ---------- Status Pill ---------- */
function StatusPill(status) {
  const meta = STATUS_META[status] || STATUS_META.available;
  return h('span', { class: 'pill pill-' + meta.cls }, [
    h('span', { class: 'p-dot', style: { background: meta.color } }),
    meta.label
  ]);
}

/* ---------- Badge ---------- */
function Badge(label, color, bg) {
  return h('span', { class: 'badge', style: { color, background: bg } }, label);
}

/* ---------- Category Chip ---------- */
function CategoryChip(cat) {
  return h('span', { class: 'cat-chip' }, [
    h('span', { class: 'cat-chip-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
    h('span', null, cat.name)
  ]);
}

/* ---------- Section card ---------- */
function Section({ title, icon: ic, action, children, bodyPad = true, className = '' }) {
  return h('div', { class: 'section ' + className }, [
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

/* ---------- Empty state ---------- */
function EmptyState({ icon: ic, title, desc }) {
  return h('div', { class: 'empty-state' }, [
    h('div', { class: 'es-ic' }, ic || I.box()),
    h('strong', null, title || 'Tidak ada data'),
    h('p', null, desc || '')
  ]);
}

/* ---------- Skeleton loading ---------- */
function Skeleton({ rows = 4, type = 'list' }) {
  return h('div', { class: 'skeleton-wrap' },
    Array.from({ length: rows }, (_, i) =>
      h('div', { class: 'skeleton skeleton-' + type, style: { animationDelay: (i * 0.12) + 's' } })
    )
  );
}

/* ---------- Avatar ---------- */
function Avatar({ name, size = 42, bg, color }) {
  return h('div', {
    class: 'avatar',
    style: { width: size + 'px', height: size + 'px', background: bg || '#DBEAFE', color: color || '#1D4ED8' }
  }, initials(name));
}

/* ---------- Mini Bar Chart (CSS murni) ---------- */
function MiniBarChart({ data, color = 'var(--primary)' }) {
  const max = Math.max(...data.map(d => d.total), 1);
  return h('div', { class: 'mini-chart' },
    data.map((d, i) =>
      h('div', { class: 'mc-col', title: d.label + ': ' + fmtIDR(d.total) }, [
        h('div', { class: 'mc-bar', style: { height: Math.max(6, Math.round((d.total / max) * 100)) + '%', background: color } }),
        h('span', { class: 'mc-label' }, d.label)
      ])
    )
  );
}

/* ---------- Statistic Card ---------- */
function StatCard({ label, value, sub, icon: ic, bg, color }) {
  return h('div', { class: 'stat-card' }, [
    h('div', { class: 'stat-ic', style: { background: bg, color } }, ic),
    h('div', { class: 'stat-info' }, [
      h('div', { class: 'stat-label' }, label),
      h('div', { class: 'stat-value' }, value),
      sub ? h('div', { class: 'stat-sub' }, sub) : null
    ])
  ]);
}

/* ---------- Quick Action Button ---------- */
function QuickAction({ label, desc, icon: ic, bg, color, onClick }) {
  return h('button', { class: 'qa-btn', onclick: onClick }, [
    h('div', { class: 'qa-ic', style: { background: bg, color } }, ic),
    h('div', { class: 'qa-txt' }, [
      h('strong', null, label),
      h('span', null, desc || '')
    ]),
    h('span', { class: 'qa-arrow' }, '→')
  ]);
}

/* ---------- Rental Row (compact) ---------- */
function RentalRow(rental, onClick) {
  const cat = DB.kategoriById(rental.categoryId);
  return h('div', { class: 'rental-row', onclick: onClick }, [
    h('div', { class: 'rr-ic', style: { background: cat.bg, color: cat.color } }, icon(cat.icon)),
    h('div', { class: 'rr-info' }, [
      h('strong', null, rental.itemName),
      h('span', null, rental.customerName + ' · ' + fmtShortDate(rental.startDate) + ' → ' + fmtShortDate(rental.endDate))
    ]),
    StatusPill(rental.status),
    h('div', { class: 'rr-amount' }, fmtIDR(rental.total))
  ]);
}