/* ============================================
   StockPilot — Slide Over Panel & Drawer
   ============================================ */

const SlideOver = {
  open({ title, icon = '📄', body, foot = '' }) {
    this.close();
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="slideover-overlay show" id="soOverlay" onclick="SlideOver.close()"></div>
      <aside class="slideover show" id="soPanel">
        <div class="slideover-head">
          <h3>${icon} ${esc(title)}</h3>
          <button class="icon-btn" onclick="SlideOver.close()" title="Tutup">${I.x}</button>
        </div>
        <div class="slideover-body">${body}</div>
        ${foot ? `<div class="slideover-foot">${foot}</div>` : ''}
      </aside>
    `;
    document.body.appendChild(root);
  },
  close() {
    const ov = document.getElementById('soOverlay');
    const p = document.getElementById('soPanel');
    if (ov) ov.classList.remove('show');
    if (p) p.classList.remove('show');
    setTimeout(() => {
      const remove = [document.getElementById('soOverlay'), document.getElementById('soPanel')];
      remove.forEach(el => el && el.remove());
    }, 300);
  }
};