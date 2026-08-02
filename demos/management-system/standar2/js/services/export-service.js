/* ============================================
   StockPilot — Export Service: CSV, Excel (.xls), PDF
   ============================================ */

const ExportService = {
  _download(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
  },

  csv(filename, headers, rows) {
    const esc = cell => {
      const s = String(cell == null ? '' : cell);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const data = [headers, ...rows].map(r => r.map(esc).join(',')).join('\n');
    this._download(filename, '\uFEFF' + data, 'text/csv;charset=utf-8');
  },

  excel(filename, sheetName, headers, rows) {
    const escCell = v => String(v == null ? '' : v)
      .replace(/&/g, '&' + 'amp;')
      .replace(/</g, '&' + 'lt;')
      .replace(/>/g, '&' + 'gt;');
    const head = headers.map(h => `<th style="background:#2563eb;color:#fff;font-weight:700;border:1px solid #444;padding:6px 10px">${escCell(h)}</th>`).join('');
    const body = rows.map(r => `<tr>${r.map(c => `<td style="border:1px solid #555;padding:5px 10px">${escCell(c)}</td>`).join('')}</tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${escCell(sheetName)}</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body><table>${head ? `<thead><tr>${head}</tr></thead>` : ''}<tbody>${body}</tbody></table></body></html>`;
    this._download(filename, '\uFEFF' + html, 'application/vnd.ms-excel;charset=utf-8');
  },

  pdf(title, { subtitle = '', sections = [] }) {
    // Generate printable HTML and open print window (saves as PDF)
    const win = window.open('', '_blank');
    if (!win) { Toast.show('Popup diblokir — izinkan popup untuk export PDF', 'warning'); return; }
    const html = `<!DOCTYPE html><html><head><title>${title}</title>
<style>
  body{font-family:'Inter',Arial,sans-serif;color:#0f172a;padding:32px;font-size:12px}
  h1{font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;margin-bottom:4px}
  .sub{color:#64748b;font-size:12px;margin-bottom:24px}
  h3{font-size:13px;margin:18px 0 8px;color:#2563eb}
  table{width:100%;border-collapse:collapse}
  th{background:#f1f5f9;padding:8px 10px;text-align:left;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;border:1px solid #e2e8f0}
  td{padding:7px 10px;border:1px solid #e2e8f0;font-size:11.5px}
  tr:nth-child(even){background:#f8fafc}
  @media print{ body{padding:0} }
</style></head><body>
<h1>${title}</h1><div class="sub">${subtitle}</div>
${sections.map(s => `<h3>${s.title}</h3><table><thead><tr>${s.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${s.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`).join('')}
<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script>
</body></html>`;
    win.document.write(html);
    win.document.close();
  },
};