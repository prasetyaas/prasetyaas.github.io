/* ============================================================
   RentFlow — Export Service
   - Excel: CSV dengan BOM agar terbuka rapi di Excel Indonesia
   - PDF: window print-friendly (theme cetak khusus)
   ============================================================ */

const ExportService = {
  /* ---------- CSV (Excel-compatible) ---------- */
  csv(filename, headers, rows) {
    const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const content = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\r\n');
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    Toast.show('File ' + filename + ' berhasil diunduh', 'success');
  },

  /* ---------- PDF (print-friendly) ---------- */
  pdf(title, subtitle, headers, rows, footerNote) {
    const w = window.open('', '_blank', 'width=960,height=720');
    if (!w) {
      Toast.show('Popup diblokir browser. Izinkan popup lalu coba lagi.', 'error');
      return;
    }

    /* HTML escape — built via string concat agar tidak diubah oleh auto-formatter */
    function escHtml(v) {
      const AMP = '&' + 'amp;';
      const LT = '&' + 'lt;';
      const GT = '&' + 'gt;';
      const QUOT = '&' + 'quot;';
      return String(v ?? '')
        .replace(/&/g, AMP)
        .replace(/</g, LT)
        .replace(/>/g, GT)
        .replace(/"/g, QUOT);
    }

    const thead = headers.map(hd => '<th style="text-align:' + (hd.align || 'left') + '">' + escHtml(hd.label) + '</th>').join('');
    const tbody = rows.map(r =>
      '<tr>' + r.map((cell, i) => {
        const align = (headers[i] || {}).align || 'left';
        return '<td style="text-align:' + align + '">' + (cell instanceof Node ? cell.textContent : escHtml(cell)) + '</td>';
      }).join('') + '</tr>'
    ).join('');

    const now = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    w.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
      <meta charset="UTF-8">
      <title>${escHtml(title)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px 48px; color: #0F172A; font-size: 13px; }
        .pdf-head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563EB; padding-bottom: 16px; margin-bottom: 24px; }
        .pdf-brand { display: flex; align-items: center; gap: 12px; }
        .pdf-brand-mark { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #2563EB, #0EA5E9); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 16px; }
        .pdf-brand h1 { font-size: 18px; font-weight: 800; }
        .pdf-brand p { font-size: 11px; color: #64748B; }
        .pdf-meta { text-align: right; font-size: 11px; color: #64748B; line-height: 1.7; }
        .pdf-meta strong { color: #0F172A; }
        h2 { font-size: 16px; font-weight: 700; margin: 24px 0 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #EFF6FF; color: #1D4ED8; font-weight: 700; padding: 10px 12px; text-align: left; border: 1px solid #E2E8F0; }
        td { padding: 9px 12px; border: 1px solid #E2E8F0; }
        tr:nth-child(even) td { background: #F8FAFC; }
        .pdf-foot { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 11px; color: #94A3B8; }
        @media print {
          .no-print { display: none; }
          body { padding: 12mm; }
        }
      </style>
      </head>
      <body>
        <div class="pdf-head">
          <div class="pdf-brand">
            <div class="pdf-brand-mark">RF</div>
            <div>
              <h1>${escHtml(title)}</h1>
              <p>${escHtml(subtitle || 'RentFlow — Rental Management System')}</p>
            </div>
          </div>
          <div class="pdf-meta">
            <strong>RentFlow</strong><br>
            Rental Management System<br>
            Dicetak: ${now}
          </div>
        </div>
        <h2>Ringkasan Data</h2>
        <table>
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
        ${footerNote ? '<p style="margin-top:20px;font-size:12px;color:#64748B;">' + escHtml(footerNote) + '</p>' : ''}
        <div class="pdf-foot">
          <span>© 2026 RentFlow · Basic Edition</span>
          <span>Dokumen dihasilkan otomatis dari sistem</span>
        </div>
        <div class="no-print" style="margin-top:16px;text-align:center;">
          <button onclick="window.print()" style="padding:10px 28px;background:#2563EB;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">🖨 Cetak / Simpan PDF</button>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    Toast.show('Dokumen PDF siap dicetak', 'success');
  }
};