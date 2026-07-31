/* ============================================
   NexaWMS Pro — Utils: icons, modal, toast, charts
   ============================================ */

/* ---------- Lucide-style inline SVG icons ---------- */
const I = {
  dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16v-5"/><path d="M11 16V8"/><path d="M15 16v-7"/><path d="M19 16V5"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  forecast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v4"/><path d="M19 3v4"/><path d="M3 5h18"/><path d="M7 5v16"/><path d="M17 5v16"/><rect width="10" height="12" x="7" y="8" rx="1"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  abc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8 5 12l2-4"/><path d="M14 8v8"/><path d="M11 8h3a2 2 0 0 1 0 4h-3a2 2 0 0 1 0 4h3"/><path d="M6.5 16h2.5"/></svg>',
  skull: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35a1 1 0 0 0-.78-.38H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14 12-8 0"/><path d="M22 12 14 12"/><path d="M10 20H4a2 2 0 0 1 0-4"/><path d="M10 4H4a2 2 0 0 0 0 4"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M21 12h-6"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>',
  arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
  factory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>',
  badge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>',
  medal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'
};

/* ---------- Escape HTML ---------- */
function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&','<':'<','>':'>','"':'"',"'":'&#39;'
  })[c]);
}

/* ---------- Toast ---------- */
const Toast = {
  show(msg, type = 'success', icon = null) {
    const root = document.getElementById('toastRoot');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="t-ic">${icon || icons[type] || 'ℹ️'}</span><span class="t-msg">${esc(msg)}</span>`;
    root.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }
};

/* ---------- Modal ---------- */
const Modal = {
  open({ title, icon, body, foot = '', size = '' }) {
    const root = document.getElementById('modalRoot');
    root.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)Modal.close()">
        <div class="modal ${size}">
          <div class="modal-head">
            <h3>${icon ? `<span class="mh-ic">${icon}</span>` : ''}${esc(title)}</h3>
            <button class="icon-btn" onclick="Modal.close()" title="Tutup">${I.x}</button>
          </div>
          <div class="modal-body">${body}</div>
          ${foot ? `<div class="modal-foot">${foot}</div>` : ''}
        </div>
      </div>`;
  },

  close() {
    document.getElementById('modalRoot').innerHTML = '';
  },

  confirm({ title = 'Konfirmasi', message = 'Yakin ingin melanjutkan?', icon = '⚠️', onYes, yesText = 'Ya, Lanjutkan', danger = false }) {
    this.open({
      title, icon, size: 'sm',
      body: `<p style="color:var(--text-2);font-size:13.5px;line-height:1.6">${esc(message)}</p>`,
      foot: `
        <button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirmYesBtn">${esc(yesText)}</button>`
    });
    document.getElementById('confirmYesBtn').onclick = () => { Modal.close(); onYes && onYes(); };
  }
};

/* ---------- Badge helper ---------- */
function statusBadge(status, map) {
  const m = map || {
    active: ['success', 'Aktif'], inactive: ['neutral', 'Nonaktif'],
    completed: ['success', 'Selesai'], pending: ['warning', 'Pending'],
    draft: ['neutral', 'Draft'], approved: ['info', 'Disetujui'],
    received: ['success', 'Diterima'], partial: ['warning', 'Parsial'],
    shipped: ['accent', 'Dikirim'], picking: ['info', 'Picking'],
    packed: ['primary', 'Packed'], in_transit: ['accent', 'In Transit'],
    scheduled: ['info', 'Terjadwal'], in_progress: ['primary', 'Berjalan']
  };
  const [cls, label] = m[status] || ['neutral', status.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())];
  return `<span class="badge ${cls} dot">${label}</span>`;
}

function customBadge(cls, label) {
  return `<span class="badge ${cls}">${label}</span>`;
}

/* ---------- Table helper ---------- */
function tableHTML(headers, rows, emptyMsg = 'Tidak ada data') {
  let rowArray = Array.isArray(rows) ? rows : [];
  if (!rowArray.length && typeof rows === 'string' && rows.trim()) rowArray = [rows];
  if (!rowArray.length) {
    return `<div class="empty-state">
      <div class="es-ic">📭</div><p>${esc(emptyMsg)}</p><small>Silakan buat data baru atau ubah filter.</small>
    </div>`;
  }
  return `<div class="table-wrap"><table>
    <thead><tr>${headers.map(h => `<th class="${h.right ? 'text-right' : ''}">${h.label}</th>`).join('')}</tr></thead>
    <tbody>${rowArray.join('')}</tbody>
  </table></div>`;
}

function td(content, cls = '') {
  return `<td class="${cls}">${content}</td>`;
}

/* ---------- Mini bars sparkline ---------- */
function sparkline(values, color = 'var(--primary)') {
  const max = Math.max(...values, 1);
  return `<span class="mini-bars">${values.map(v =>
    `<i style="height:${Math.max(15, Math.round((v/max)*100))}%;background:${color}"></i>`).join('')}</span>`;
}

/* ---------- Chart defaults ---------- */
const ChartTheme = {
  grid: 'rgba(148,163,184,.08)',
  ticks: '#64748b',
  tooltipBg: '#111a2e',
  tooltipBorder: 'rgba(148,163,184,.25)',
  tooltipText: '#e6edf7',
  palette: ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ec4899', '#a78bfa', '#f87171', '#38bdf8'],
  gradients: {
    // Chart.js v4 calls scriptable option functions with a ScriptableContext,
    // NOT a CanvasRenderingContext2D. Use ctx.chart.ctx + chartArea, with
    // fallback to solid color if chartArea is not yet available.
    indigo: (c) => {
      if (!c || !c.chart) return 'rgba(99,102,241,.25)';
      const { ctx, chartArea } = c.chart;
      if (!ctx || !chartArea) return 'rgba(99,102,241,.25)';
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0,'rgba(99,102,241,.35)'); g.addColorStop(1,'rgba(99,102,241,0)');
      return g;
    },
    cyan: (c) => {
      if (!c || !c.chart) return 'rgba(34,211,238,.2)';
      const { ctx, chartArea } = c.chart;
      if (!ctx || !chartArea) return 'rgba(34,211,238,.2)';
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0,'rgba(34,211,238,.3)'); g.addColorStop(1,'rgba(34,211,238,0)');
      return g;
    },
    green: (c) => {
      if (!c || !c.chart) return 'rgba(16,185,129,.25)';
      const { ctx, chartArea } = c.chart;
      if (!ctx || !chartArea) return 'rgba(16,185,129,.25)';
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0,'rgba(16,185,129,.3)'); g.addColorStop(1,'rgba(16,185,129,0)');
      return g;
    },
    orange: (c) => {
      if (!c || !c.chart) return 'rgba(245,158,11,.25)';
      const { ctx, chartArea } = c.chart;
      if (!ctx || !chartArea) return 'rgba(245,158,11,.25)';
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0,'rgba(245,158,11,.3)'); g.addColorStop(1,'rgba(245,158,11,0)');
      return g;
    },
    pink: (c) => {
      if (!c || !c.chart) return 'rgba(236,72,153,.25)';
      const { ctx, chartArea } = c.chart;
      if (!ctx || !chartArea) return 'rgba(236,72,153,.25)';
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0,'rgba(236,72,153,.3)'); g.addColorStop(1,'rgba(236,72,153,0)');
      return g;
    }
  }
};

function deepMerge(target, source) {
  const out = { ...target };
  Object.entries(source || {}).forEach(([k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  });
  return out;
}

function makeChart(canvasId, config) {
  const el = document.getElementById(canvasId);
  if (!el) return null;
  if (typeof Chart === 'undefined') return null; // Chart.js CDN not loaded — fail silently
  if (window.__charts && window.__charts[canvasId]) {
    window.__charts[canvasId].destroy();
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        labels: { color: ChartTheme.ticks, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { family: 'Inter, sans-serif', size: 11.5 } }
      },
      tooltip: {
        backgroundColor: ChartTheme.tooltipBg,
        borderColor: ChartTheme.tooltipBorder,
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: ChartTheme.tooltipText,
        padding: 12,
        cornerRadius: 10,
        titleFont: { family: 'Inter', size: 12.5, weight: '700' },
        bodyFont: { family: 'Inter', size: 12 },
        displayColors: true,
        boxPadding: 4
      }
    },
    scales: {}
  };

  const merged = {
    ...config,
    options: deepMerge(defaultOptions, config.options || {})
  };

  // Fill missing scales with defaults
  merged.options.scales = merged.options.scales || {};
  Object.values(merged.options.scales).forEach(s => {
    if (!s.ticks) s.ticks = {};
    s.ticks.color = s.ticks.color || ChartTheme.ticks;
    s.ticks.font = s.ticks.font || { family: 'Inter', size: 11 };
    if (!s.grid) s.grid = {};
    s.grid.color = s.grid.color || ChartTheme.grid;
  });

  window.__charts = window.__charts || {};
  const chart = new Chart(el, merged);
  window.__charts[canvasId] = chart;
  // Force re-apply size so charts render even if layout just settled
  setTimeout(() => chart.resize(), 250);
  return chart;
}

/* ---------- Misc ---------- */
function downloadFile(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

function exportCSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => {
    const s = String(cell == null ? '' : cell);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
  downloadFile(filename, '\uFEFF' + csv, 'text/csv;charset=utf-8');
}

/* ---------- Excel export (HTML table .xls, opens in Excel) ---------- */
function exportExcel(filename, sheetName, headers, rows) {
  const escCell = (v) => String(v == null ? '' : v).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
  const head = headers.map(h => `<th style="background:#6366f1;color:#fff;font-weight:700;border:1px solid #444;padding:6px 10px">${escCell(h)}</th>`).join('');
  const body = rows.map(r => `<tr>${r.map(cell => `<td style="border:1px solid #555;padding:5px 10px;mso-number-format:'\\@'">${escCell(cell)}</td>`).join('')}</tr>`).join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${escCell(sheetName)}</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body><table>${head ? `<thead><tr>${head}</tr></thead>` : ''}<tbody>${body}</tbody></table></body></html>`;
  downloadFile(filename, '\uFEFF' + html, 'application/vnd.ms-excel;charset=utf-8');
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => Toast.show('Berhasil disalin ke clipboard', 'success'),
    () => Toast.show('Gagal menyalin', 'error')
  );
}

function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function daysBetween(iso1, iso2) {
  return Math.round((new Date(iso2) - new Date(iso1)) / 86400000);
}

function stockLevel(p) {
  const pct = p.maxStock > 0 ? (p.onHand / p.maxStock) * 100 : 0;
  if (p.onHand <= 0) return { label: 'Out of Stock', cls: 'danger', pct: 0, color: 'var(--danger)' };
  if (p.onHand <= p.reorderPoint) return { label: 'Low', cls: 'warning', pct: Math.max(pct, 8), color: 'var(--warning)' };
  if (pct >= 85) return { label: 'Full', cls: 'primary', pct: 100, color: 'var(--primary)' };
  return { label: 'Healthy', cls: 'success', pct: Math.max(pct, 20), color: 'var(--success)' };
}

function thumbClass(sku) {
  const styles = ['', 'green', 'pink', 'orange', 'cyan'];
  let hash = 0;
  for (let i = 0; i < sku.length; i++) hash = (hash * 31 + sku.charCodeAt(i)) % 997;
  return styles[hash % styles.length];
}

function productThumb(sku, name) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return `<div class="product-thumb ${thumbClass(sku)}">${esc(initials)}</div>`;
}

/* Month labels helper */
function monthLabels(monthsBack = 6) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = monthsBack - 1; i >= 0; i--) {
    const t = new Date(d);
    t.setMonth(d.getMonth() - i);
    out.push(t.toLocaleDateString('id-ID', { month: 'short' }));
  }
  return out;
}

/* Random walk for demo data */
function randWalk(start, n, minPct = 0.75, maxPct = 1.3, volatility = 0.18) {
  const out = [start];
  let cur = start;
  for (let i = 1; i < n; i++) {
    cur = Math.max(start * minPct, cur * (0.75 + Math.random() * (1.3 - 0.75 + volatility)));
    out.push(Math.round(cur));
  }
  return out;
}