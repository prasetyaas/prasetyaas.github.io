/* ============================================
   StockPilot — Modern Data Table Component
   Features: search, sort, pagination
   ============================================ */

const DataTable = {
  _state: {},

  render({ id = 'dataTable', columns, rows, searchable = true, pageSize = 10, onSort, emptyText = 'Tidak ada data' }) {
    const state = this._state[id] = this._state[id] || { page: 1, sortKey: null, sortDir: 'asc', q: '' };
    let filtered = [...rows];

    // Search
    if (state.q) {
      const ql = state.q.toLowerCase();
      filtered = filtered.filter(row => columns.some(c => String(row[c.key] ?? '').toLowerCase().includes(ql)));
    }

    // Sort
    if (state.sortKey) {
      const col = columns.find(c => c.key === state.sortKey);
      filtered.sort((a, b) => {
        const av = a[state.sortKey] ?? '';
        const bv = b[state.sortKey] ?? '';
        let cmp = 0;
        if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
        else cmp = String(av).localeCompare(String(bv));
        return state.sortDir === 'asc' ? cmp : -cmp;
      });
    }

    // Pagination
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (state.page > pages) state.page = pages;
    const start = (state.page - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    const ths = columns.map(c => `
      <th class="${c.sortable ? 'sortable' : ''}" onclick="${c.sortable ? `DataTable.sort('${id}', '${c.key}')` : ''}">
        ${esc(c.label)}${state.sortKey === c.key ? (state.sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
      </th>`).join('');

    const trs = pageRows.map((row, i) => `
      <tr>${columns.map(c => `<td class="${c.right ? 'text-right' : ''}">${c.render ? c.render(row, i) : esc(row[c.key] ?? '')}</td>`).join('')}</tr>
    `).join('');

    const pageBtns = [];
    for (let p = 1; p <= pages && p <= 7; p++) {
      pageBtns.push(`<button class="page-btn ${p === state.page ? 'active' : ''}" onclick="DataTable.go('${id}', ${p})">${p}</button>`);
    }

    return `
      <div class="table-card" id="${id}">
        ${searchable ? `
          <div class="table-toolbar">
            <div class="search-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder="Cari…" value="${esc(state.q)}" oninput="DataTable.search('${id}', this.value)">
            </div>
            <span style="font-size:11px;color:var(--text-3)">${total} data</span>
          </div>` : ''}
        <div class="table-wrap"><table>
          <thead><tr>${ths}</tr></thead>
          <tbody>${trs || `<tr><td colspan="${columns.length}" style="text-align:center;padding:40px;color:var(--text-3)">${esc(emptyText)}</td></tr>`}</tbody>
        </table></div>
        <div class="table-foot">
          <span>Menampilkan ${pageRows.length} dari ${total}</span>
          <div class="pagination">${pageBtns.join('')}</div>
        </div>
      </div>
    `;
  },

  search(id, q) {
    if (!this._state[id]) this._state[id] = { page: 1, sortKey: null, sortDir: 'asc', q: '' };
    this._state[id].q = q;
    this._state[id].page = 1;
    // Caller (page render function) must subscribe to 'table:rerender' to re-render the whole page.
    document.dispatchEvent(new CustomEvent('table:rerender', { detail: { id } }));
  },

  sort(id, key) {
    const st = this._state[id];
    if (st.sortKey === key) st.sortDir = st.sortDir === 'asc' ? 'desc' : 'asc';
    else { st.sortKey = key; st.sortDir = 'asc'; }
    document.dispatchEvent(new CustomEvent('table:rerender', { detail: { id } }));
  },

  go(id, page) {
    if (this._state[id]) { this._state[id].page = page; }
    document.dispatchEvent(new CustomEvent('table:rerender', { detail: { id } }));
  },

  getState(id) { return this._state[id] || { page: 1, sortKey: null, sortDir: 'asc', q: '' }; },
  reset(id) { if (this._state[id]) this._state[id] = { page: 1, sortKey: null, sortDir: 'asc', q: '' }; }
};