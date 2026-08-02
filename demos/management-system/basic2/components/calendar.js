/* ============================================================
   RentFlow — Calendar Widget
   Kalender bulan berjalan dengan badge jumlah rental per tanggal.
   Navigasi bulan (prev / next) dengan rerender lokal.
   ============================================================ */

function CalendarWidget({ year, month, onSelectDate }) {
  const calState = {
    year: year || new Date().getFullYear(),
    month: month === undefined ? new Date().getMonth() : month
  };

  /* Build rental map: tanggal -> jumlah rental yang start/end */
  function rentalMap() {
    const map = {};
    const rentals = DB.get('rentals');
    for (const r of rentals) {
      const start = r.startDate;
      const end = r.endDate;
      if (start) map[start] = (map[start] || 0) + 1;
      if (end && end !== start) map[end] = (map[end] || 0) + 1;
    }
    return map;
  }

  function renderGrid() {
    const firstDay = new Date(calState.year, calState.month, 1);
    const startWeekday = firstDay.getDay(); // 0=Sunday
    const daysInMonth = new Date(calState.year, calState.month + 1, 0).getDate();
    const today = todayKey();
    const map = rentalMap();

    const lead = Array.from({ length: startWeekday }, (_, i) => h('div', { class: 'cal-cell cal-empty' }));
    const cells = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const y = calState.year;
      const m = String(calState.month + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const key = y + '-' + m + '-' + day;
      const count = map[key] || 0;
      const isToday = key === today;

      cells.push(h('div', {
        class: 'cal-cell' + (isToday ? ' today' : '') + (count ? ' has-rental' : ''),
        onclick: onSelectDate ? () => onSelectDate(key) : null
      }, [
        h('span', { class: 'cal-day' }, String(d)),
        count ? h('span', { class: 'cal-badge' }, String(count)) : null
      ]));
    }

    const total = cells.length + lead.length;
    const remainder = total % 7;
    const trail = remainder ? Array.from({ length: 7 - remainder }, (_, i) => h('div', { class: 'cal-cell cal-empty' })) : [];

    return [
      h('div', { class: 'cal-weekdays' }, ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(w => h('div', { class: 'cal-wd' }, w))),
      h('div', { class: 'cal-grid' }, [...lead, ...cells, ...trail])
    ];
  }

  /* Container tetap: isi di-refresh saat navigasi bulan */
  const container = h('div', { class: 'calendar-widget' });

  function render() {
    const monthName = new Date(calState.year, calState.month, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const head = h('div', { class: 'cal-head' }, [
      h('button', {
        class: 'icon-btn',
        onclick: () => {
          calState.month--;
          if (calState.month < 0) { calState.month = 11; calState.year--; }
          render();
        }
      }, '‹'),
      h('strong', null, monthName),
      h('button', {
        class: 'icon-btn',
        onclick: () => {
          calState.month++;
          if (calState.month > 11) { calState.month = 0; calState.year++; }
          render();
        }
      }, '›')
    ]);

    container.innerHTML = '';
    container.appendChild(head);
    for (const child of renderGrid()) {
      container.appendChild(child);
    }
  }

  render();
  return container;
}