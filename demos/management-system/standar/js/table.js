/* ============================================
   MANAGEMENT SYSTEM - PREMIUM
   Data Table: Search, Pagination, Sort, Filter, CRUD
   ============================================ */

// ===== TABLE STATE =====
const TableState = {
  currentPage: 1,
  pageSize: 10,
  sortColumn: null,
  sortDirection: 'asc',
  searchQuery: '',
  filters: {},
  selectedItems: []
};

// ===== PAGINATION =====
function changePage(tableId, page) {
  TableState.currentPage = page;
  if (typeof refreshTable === 'function') refreshTable();
}

function sortTable(column) {
  if (TableState.sortColumn === column) {
    TableState.sortDirection = TableState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    TableState.sortColumn = column;
    TableState.sortDirection = 'asc';
  }
  TableState.currentPage = 1;
  if (typeof refreshTable === 'function') refreshTable();
}

function searchTable(query) {
  TableState.searchQuery = query;
  TableState.currentPage = 1;
  if (typeof refreshTable === 'function') refreshTable();
}

function filterTable(key, value) {
  TableState.filters[key] = value;
  TableState.currentPage = 1;
  if (typeof refreshTable === 'function') refreshTable();
}

// ===== RENDER TABLE =====
function renderTable(tableId, data, columns, options = {}) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const {
    searchQuery = TableState.searchQuery,
    sortColumn = TableState.sortColumn,
    sortDirection = TableState.sortDirection,
    pageSize = TableState.pageSize,
    currentPage = TableState.currentPage,
    emptyMessage = 'Tidak ada data',
    rowRenderer = null,
    showCheckbox = false,
    showActions = true,
    actionRenderer = null
  } = options;

  // Filter by search
  let filtered = [...data];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(item => {
      return columns.some(col => {
        const val = getNestedValue(item, col.key);
        return val && String(val).toLowerCase().includes(q);
      });
    });
  }

  // Apply custom filters
  Object.keys(TableState.filters).forEach(key => {
    const val = TableState.filters[key];
    if (val && val !== 'all') {
      filtered = filtered.filter(item => {
        const itemVal = getNestedValue(item, key);
        return String(itemVal) === String(val);
      });
    }
  });

  // Sort
  if (sortColumn) {
    filtered.sort((a, b) => {
      const aVal = getNestedValue(a, sortColumn);
      const bVal = getNestedValue(b, sortColumn);
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(startIdx, startIdx + pageSize);

  // Render rows
  if (pageData.length === 0) {
    const colCount = columns.length + (showCheckbox ? 1 : 0) + (showActions ? 1 : 0);
    table.innerHTML = `<tr><td colspan="${colCount}" class="text-center" style="padding:32px;color:var(--text-3);">${emptyMessage}</td></tr>`;
  } else {
    table.innerHTML = pageData.map((item, idx) => {
      const rowNum = startIdx + idx + 1;
      const checkbox = showCheckbox ? `<td class="table-checkbox"><input type="checkbox" onchange="toggleSelectItem(${item.id})" ${TableState.selectedItems.includes(item.id) ? 'checked' : ''}></td>` : '';
      const cells = columns.map(col => {
        let value = getNestedValue(item, col.key);
        if (col.format) {
          value = col.format(value, item);
        } else if (col.type === 'currency') {
          value = formatCurrency(value);
        } else if (col.type === 'date') {
          value = formatDate(value);
        } else if (col.type === 'badge') {
          value = statusBadge(value);
        }
        return `<td>${value || '-'}</td>`;
      }).join('');

      let actions = '';
      if (showActions) {
        if (actionRenderer) {
          actions = actionRenderer(item);
        } else {
          actions = `<td class="table-actions">
            <button class="action-btn action-btn-view" onclick="viewItem(${item.id})" data-tooltip="Detail"><i class="bi bi-eye"></i></button>
            <button class="action-btn action-btn-edit" onclick="editItem(${item.id})" data-tooltip="Edit"><i class="bi bi-pencil"></i></button>
            <button class="action-btn action-btn-delete" onclick="deleteItem(${item.id})" data-tooltip="Hapus"><i class="bi bi-trash"></i></button>
          </td>`;
        }
      }

      return `<tr class="fade-in">${checkbox}${cells}${actions}</tr>`;
    }).join('');
  }

  // Render pagination
  renderPagination(tableId + 'Pagination', currentPage, totalPages, totalItems, pageSize);
}

function getNestedValue(obj, key) {
  if (!key) return null;
  return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

// ===== PAGINATION UI =====
function renderPagination(containerId, currentPage, totalPages, totalItems, pageSize) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  let html = `<div class="pagination-wrapper">
    <div class="pagination-info">Menampilkan ${startItem}-${endItem} dari ${totalItems}</div>
    <div class="pagination">`;

  html += `<button class="page-btn" onclick="changePage('${containerId.replace('Pagination', '')}', ${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}><i class="bi bi-chevron-left"></i></button>`;

  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage('${containerId.replace('Pagination', '')}', ${i})">${i}</button>`;
  }

  html += `<button class="page-btn" onclick="changePage('${containerId.replace('Pagination', '')}', ${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}><i class="bi bi-chevron-right"></i></button>`;
  html += '</div></div>';
  container.innerHTML = html;
}

// ===== SELECTION =====
function toggleSelectItem(id) {
  const idx = TableState.selectedItems.indexOf(id);
  if (idx === -1) {
    TableState.selectedItems.push(id);
  } else {
    TableState.selectedItems.splice(idx, 1);
  }
  updateBulkActions();
}

function selectAll(selectAll) {
  const checkboxes = document.querySelectorAll('.table-checkbox input');
  checkboxes.forEach(cb => cb.checked = selectAll);
  // This needs to be customized per page
}

function updateBulkActions() {
  const count = TableState.selectedItems.length;
  const el = document.getElementById('bulkActions');
  if (el) {
    if (count > 0) {
      el.classList.add('show');
      el.querySelector('.bulk-count').textContent = count + ' item dipilih';
    } else {
      el.classList.remove('show');
    }
  }
}

function bulkDelete() {
  if (TableState.selectedItems.length === 0) return;
  if (!confirm('Hapus ' + TableState.selectedItems.length + ' item yang dipilih?')) return;
  // Custom delete logic per page
  showToast(TableState.selectedItems.length + ' item berhasil dihapus', 'success');
  TableState.selectedItems = [];
  updateBulkActions();
  if (typeof refreshTable === 'function') refreshTable();
}

// ===== CRUD =====
let currentItemId = null;
let currentDataType = '';

function setDataType(type) {
  currentDataType = type;
}

function getDataArray() {
  switch (currentDataType) {
    case 'products': return AppState.data.products;
    case 'customers': return AppState.data.customers;
    case 'vendors': return AppState.data.vendors;
    case 'transactions': return AppState.data.transactions;
    default: return [];
  }
}

function viewItem(id) {
  currentItemId = id;
  const data = getDataArray();
  const item = data.find(d => d.id === id);
  if (!item) return;

  const modal = document.getElementById('detailModal');
  if (!modal) return;
  const body = modal.querySelector('.modal-body');
  if (!body) return;

  let html = '<div class="table-wrap"><table class="table">';
  Object.keys(item).forEach(key => {
    let val = item[key];
    if (typeof val === 'object') val = JSON.stringify(val);
    html += `<tr><td style="font-weight:600;width:40%;">${key}</td><td>${val}</td></tr>`;
  });
  html += '</table></div>';
  body.innerHTML = html;
  openModal('detailModal');
}

function editItem(id) {
  currentItemId = id;
  const data = getDataArray();
  const item = data.find(d => d.id === id);
  if (!item) return;
  if (typeof populateEditForm === 'function') {
    populateEditForm(item);
  }
}

function deleteItem(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
  const data = getDataArray();
  const idx = data.findIndex(d => d.id === id);
  if (idx === -1) return;
  data.splice(idx, 1);
  if (typeof saveToStorage === 'function') saveToStorage();
  showToast('Data berhasil dihapus', 'success');
  if (typeof refreshTable === 'function') refreshTable();
}
