/* ============================================================
   RentFlow — Settings Pages
   settings/profile · settings/system · settings/backup
   ============================================================ */

const SettingsPage = {

  /* ---------- settings/profile ---------- */
  profile() {
    const fields = [
      { label: 'Nama Usaha', value: 'RentFlow Rental', icon: I.building() },
      { label: 'Alamat', value: 'Jl. Merdeka No. 88, Bandung', icon: I.building() },
      { label: 'Telepon', value: '+62 812-3456-7890', icon: I.users() },
      { label: 'Email', value: 'admin@rentflow.id', icon: I.send() },
      { label: 'Jam Operasional', value: 'Senin–Sabtu, 08.00–20.00', icon: I.clock() }
    ];

    return h('div', null, [
      PageHead({
        title: 'Company Profile',
        subtitle: 'Informasi profil usaha rental Anda',
        icon: I.building()
      }),
      h('div', { class: 'grid-2col' }, [
        Section({
          title: 'Profil Usaha',
          icon: I.building(),
          children: h('div', { class: 'profile-form' },
            fields.map(f => h('label', { class: 'field' }, [
              h('span', null, f.label),
              h('div', { class: 'input-wrap' }, [
                f.icon,
                h('input', { type: 'text', value: f.value })
              ])
            ]))
          )
        }),
        Section({
          title: 'Preview Identitas',
          icon: I.eye ? I.eye() : I.building(),
          children: h('div', { class: 'profile-preview' }, [
            h('div', { class: 'pp-brand' }, [
              h('div', { class: 'brand-mark lg' }, I.brand()),
              h('div', null, [
                h('strong', null, 'RentFlow Rental'),
                h('span', null, 'Rental Management System')
              ])
            ]),
            h('div', { class: 'pp-card' }, [
              h('div', { class: 'pp-row' }, [h('span', null, 'Alamat'), h('strong', null, 'Jl. Merdeka No. 88')]),
              h('div', { class: 'pp-row' }, [h('span', null, 'Telepon'), h('strong', null, '+62 812-3456-7890')]),
              h('div', { class: 'pp-row' }, [h('span', null, 'Email'), h('strong', null, 'admin@rentflow.id')])
            ]),
            h('button', {
              class: 'btn btn-primary btn-block',
              onclick: () => Toast.show('Profil berhasil disimpan', 'success')
            }, 'Simpan Perubahan')
          ])
        })
      ])
    ]);
  },

  /* ---------- settings/system ---------- */
  system() {
    const settings = [
      { label: 'Denda keterlambatan', desc: 'Persentase denda dari harga sewa per hari', value: '10% / hari', icon: I.alert() },
      { label: 'Mata uang', desc: 'Format penampilan harga', value: 'IDR (Rp)', icon: I.money() },
      { label: 'Bahasa aplikasi', desc: 'Bahasa antarmuka', value: 'Indonesia', icon: I.globe ? I.globe() : I.send() },
      { label: 'Notifikasi overdue', desc: 'Peringatan rental melewati batas waktu', value: 'Aktif (H+0)', icon: I.bell() }
    ];

    return h('div', null, [
      PageHead({
        title: 'System Settings',
        subtitle: 'Konfigurasi umum aplikasi',
        icon: I.settings()
      }),
      Section({
        title: 'Preferensi Sistem',
        icon: I.settings(),
        bodyPad: true,
        children: h('div', { class: 'stack' },
          settings.map(s => h('div', { class: 'setting-row' }, [
            h('div', { class: 'set-ic', style: { background: '#EFF6FF', color: '#1D4ED8' } }, s.icon),
            h('div', { class: 'set-info' }, [
              h('strong', null, s.label),
              h('span', null, s.desc)
            ]),
            h('span', { class: 'set-value' }, s.value),
            h('button', { class: 'btn btn-sm btn-ghost', onclick: () => Toast.show(s.label + ' disimpan', 'success') }, 'Ubah')
          ]))
        )
      }),
      h('div', { class: 'grid-2col', style: { marginTop: '16px' } }, [
        Section({
          title: 'Tampilan',
          icon: I.monitor(),
          children: h('div', { class: 'stack' }, [
            h('div', { class: 'setting-row' }, [
              h('div', { class: 'set-ic', style: { background: '#F3E8FF', color: '#7E22CE' } }, I.monitor()),
              h('div', { class: 'set-info' }, [h('strong', null, 'Mode gelap'), h('span', null, 'Ganti tema antarmuka')]),
              h('span', { class: 'pill pill-available' }, 'Demo')
            ])
          ])
        }),
        Section({
          title: 'Danger Zone',
          icon: I.alert(),
          children: h('div', { class: 'stack' }, [
            h('div', { class: 'setting-row' }, [
              h('div', { class: 'set-ic', style: { background: '#FEE2E2', color: '#DC2626' } }, I.refresh()),
              h('div', { class: 'set-info' }, [h('strong', null, 'Reset data demo'), h('span', null, 'Kembalikan ke data awal')]),
              h('button', {
                class: 'btn btn-sm btn-danger',
                onclick: () => {
                  ConfirmDialog({
                    title: 'Reset Data',
                    message: 'Semua data demo akan dikembalikan ke kondisi awal. Lanjutkan?',
                    confirmLabel: 'Ya, Reset',
                    danger: true,
                    onConfirm: () => {
                      DB.reset();
                      App.renderRoot();
                      Toast.show('Data demo berhasil di-reset', 'success');
                    }
                  });
                }
              }, 'Reset')
            ])
          ])
        })
      ])
    ]);
  },

  /* ---------- settings/backup ---------- */
  backup() {
    function doBackup() {
      const payload = {
        rentedAt: new Date().toISOString(),
        kategoris: DB.get('kategoris'),
        items: DB.get('items'),
        customers: DB.get('customers'),
        rentals: DB.get('rentals'),
        returns: DB.get('returns')
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'rentflow-backup-' + todayKey() + '.json';
      link.click();
      URL.revokeObjectURL(link.href);
      Toast.show('Backup berhasil diunduh 📦', 'success');
    }

    const timeline = [
      { action: 'Backup otomatis harian', time: 'Hari ini, 02.00', type: 'auto' },
      { action: 'Reset data demo', time: 'H-3', type: 'manual' },
      { action: 'Backup awal dibuat', time: 'H-7', type: 'auto' }
    ];

    return h('div', null, [
      PageHead({
        title: 'Backup & Restore',
        subtitle: 'Kelola cadangan data demo Anda',
        icon: I.archive()
      }),
      h('div', { class: 'grid-2col' }, [
        Section({
          title: 'Backup Data',
          icon: I.download(),
          children: h('div', { class: 'backup-box' }, [
            h('div', { class: 'bk-ic' }, I.archive()),
            h('strong', null, 'Unduh backup data'),
            h('p', null, 'Simpan seluruh data demo (item, pelanggan, transaksi) sebagai file JSON.'),
            h('button', { class: 'btn btn-primary', onclick: doBackup }, [I.download(), h('span', null, 'Download Backup')]),
            h('small', null, 'Format: rentflow-backup-YYYY-MM-DD.json')
          ])
        }),
        Section({
          title: 'Riwayat Backup',
          icon: I.refresh(),
          bodyPad: false,
          children: h('div', { class: 'stack' },
            timeline.map(t => h('div', { class: 'backup-row' }, [
              h('span', { class: 'bk-dot ' + t.type }),
              h('div', null, [
                h('strong', null, t.action),
                h('span', null, t.time)
              ]),
              Badge(t.type === 'auto' ? 'Otomatis' : 'Manual', t.type === 'auto' ? '#0369A1' : '#B45309', t.type === 'auto' ? '#DBEAFE' : '#FEF3C7')
            ]))
          )
        })
      ]),
      h('div', { style: { marginTop: '16px' } }, Section({
        title: 'Restore',
        icon: I.undo(),
        children: h('div', { class: 'restore-box' }, [
          h('p', null, 'Fitur restore penuh tersedia di versi premium — upload file backup dan pulihkan data.'),
          h('button', { class: 'btn btn-soft', onclick: () => Toast.show('Restore tersedia di versi premium', 'info') }, 'Coba Restore (Demo)')
        ])
      }))
    ]);
  }
};