/* ============================================================
   RentFlow — DataTable Component
   - Sorting (klik kolom)
   - Filter status
   - Pagination 10/halaman
   - State lokal per instance
   ============================================================ */

function DataTable({ columns, rows, pageSize = 10, initialSort = null, initialSortDir = 'desc' }) {
  const state = {
    sortKey: initialSort,
    sortDir: initialSortDir,
    page: 1,
    filter: null
  };

  const totalPages = () => Math.max(1, Math.ceil(rows.length / pageSize));

  /* ---------- Sorting ---------- */
  function sortedRows() {
    let out = [...rows];
    if (state.filter) {
      out = out.filter(r => (r._status || '') === state.filter);
    }
    if (state.sortKey) {
      const key = state.sortKey;
      out.sort((a, b) => {
        let av = a[key];
        let bv = b[key];
        if (typeof av === 'number' && typeof bv === 'number') {
          return state.sortDir === 'asc' ? av - bv : bv - av;
        }
        av = String(av || '').toLowerCase();
        bv = String(bv || '').toLowerCase();
        if (av < bv) return state.sortDir === 'asc' ? -1 : 1;
        if (av > bv) return state.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return out;
  }

  /* ---------- Paginate ---------- */
  function pageRows(sorted) {
    const start = (state.page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }

  /* ---------- Column header with sort ---------- */
  function th(col, i) {
    const sortable = !!col.sortKey;
    const active = state.sortKey === col.sortKey;
    const arrow = active
      ? (state.sortDir === 'asc' ? ' ↑' : ' ↓')
      : '';

    return h('th', {
      class: sortable ? 'sortable' : '',
      style: col.align === 'right' ? { textAlign: 'right' } : null,
      onclick: sortable ? () => {
        if (state.sortKey === col.sortKey) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortKey = col.sortKey;
          state.sortDir = 'desc';
        }
        state.page = 1;
        rerender();
      } : null
    }, [col.label, arrow ? h('span', { class: 'sort-arrow' }, arrow) : null]);
  }

  /* ---------- Render body ---------- */
  function body() {
    if (!rows.length) {
      return h('div', { class: 'table-empty' }, 'Tidak ada data');
    }
    const sorted = sortedRows();
    if (!sorted.length) {
      return h('div', { class: 'table-empty' }, 'Tidak ada data sesuai filter');
    }
    const paged = pageRows(sorted);

    return h('div', null, [
      h('div', { class: 'table-wrap' }, [
        h('table', { class: 'tbl' }, [
          h('thead', null, h('tr', null, columns.map((c, i) => th(c, i)))),
          h('tbody', null, paged.map((row, ri) =>
            h('tr', row._onClick ? { class: 'clickable', onclick: () => row._onClick(row, ri) } : null, row.map((cell, ci) => {
              const col = columns[ci] || {};
              return h('td', {
                class: 'cell-' + (col.type || 'text'),
                style: col.align === 'right' ? { textAlign: 'right' } : null
              }, cell);
            }))
          ))
        ])
      ]),
      pagination(sorted.length)
    ]);
  }

  /* ---------- Pagination ---------- */
  function pagination(total) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (pages <= 1 && total <= pageSize) return null;

    const nums = [];
    for (let i = 1; i <= pages; i++) {
      nums.push(h('button', {
        class: 'pg-btn' + (i === state.page ? ' active' : ''),
        onclick: () => { state.page = i; rerender(); }
      }, String(i)));
    }

    return h('div', { class: 'pagination' }, [
      h('span', { class: 'pg-info' }, 'Menampilkan ' + ((state.page - 1) * pageSize + 1) + '-' + Math.min(state.page * pageSize, total) + ' dari ' + total),
      h('div', { class: 'pg-btns' }, [
        h('button', {
          class: 'pg-btn',
          disabled: state.page <= 1,
          onclick: () => { state.page--; rerender(); }
        }, '‹'),
        ...nums,
        h('button', {
          class: 'pg-btn',
          disabled: state.page >= pages,
          onclick: () => { state.page++; rerender(); }
        }, '›')
      ])
    ]);
  }

  /* ---------- Rerender ---------- */
  let container = null;
  function rerender() {
    if (container) {
      container.innerHTML = '';
      container.appendChild(body());
    }
  }

  container = h('div', { class: 'data-table' }, body());
  return container;
}