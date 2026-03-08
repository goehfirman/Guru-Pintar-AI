import React from 'react';

const KirimKepalaSekolah: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Welcome & Action Section */}
      <div className="relative flex flex-col justify-between gap-6 p-8 overflow-hidden text-white md:flex-row md:items-center bg-primary rounded-2xl">
        <div className="relative z-10 flex-1">
          <h3 className="mb-2 text-2xl font-bold">Kelola Persetujuan Digital</h3>
          <p className="max-w-xl text-primary-100/80 text-blue-100">
            Pantau proses pengajuan berkas administrasi dan dapatkan stempel persetujuan digital secara otomatis dari Kepala Sekolah.
          </p>
        </div>
        <button className="relative z-10 flex items-center gap-2 px-6 py-3 font-bold transition-all bg-white shadow-lg text-primary rounded-xl hover:bg-slate-50 active:scale-95">
          <span className="material-symbols-outlined">add_circle</span>
          Buat Pengajuan Baru
        </button>
        {/* Abstract Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-48 h-48 -mb-24 -ml-24 rounded-full bg-white/5 blur-2xl"></div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border shadow-sm dark:bg-sidebar-dark rounded-2xl border-slate-200 dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-100 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
              <span className="material-symbols-outlined">file_present</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Dikirim</p>
          <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">24</h4>
        </div>
        <div className="p-6 bg-white border shadow-sm dark:bg-sidebar-dark rounded-2xl border-slate-200 dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-10 h-10 text-amber-600 bg-amber-100 rounded-lg dark:bg-amber-900/30 dark:text-amber-400">
              <span className="material-symbols-outlined">pending</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Menunggu</p>
          <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">5</h4>
        </div>
        <div className="p-6 bg-white border shadow-sm dark:bg-sidebar-dark rounded-2xl border-slate-200 dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-10 h-10 text-emerald-600 bg-emerald-100 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Disetujui</p>
          <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">12</h4>
        </div>
        <div className="p-6 bg-white border shadow-sm dark:bg-sidebar-dark rounded-2xl border-slate-200 dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-10 h-10 text-rose-600 bg-rose-100 rounded-lg dark:bg-rose-900/30 dark:text-rose-400">
              <span className="material-symbols-outlined">history_edu</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Perlu Revisi</p>
          <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">7</h4>
        </div>
      </div>
      
      {/* Submission History Table */}
      <div className="overflow-hidden bg-white border shadow-sm dark:bg-sidebar-dark rounded-2xl border-slate-200 dark:border-border-dark">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-border-dark">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Pengajuan</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-all">
              <span className="text-sm material-symbols-outlined">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-all">
              <span className="text-sm material-symbols-outlined">download</span>
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold tracking-wider uppercase bg-slate-50/50 dark:bg-gray-800/50 text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4">ID Pengajuan</th>
                <th className="px-6 py-4">Judul Bundel</th>
                <th className="px-6 py-4">Tanggal Kirim</th>
                <th className="px-6 py-4">Kepala Sekolah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
              <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 font-mono text-sm font-bold text-primary">#GP-2023-089</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Administrasi Ganjil 2023/2024</p>
                  <p className="text-xs text-slate-500">12 Berkas Dokumen</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">15 Sep 2023</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Drs. H. Mulyadi, M.Pd</p>
                  <p className="text-xs text-slate-500">NIP. 196805121992031005</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    <span className="w-1 h-1 mr-2 rounded-full bg-amber-500"></span>
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 transition-all rounded-lg text-primary hover:bg-primary/10" title="Lihat Detail">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 font-mono text-sm font-bold text-primary">#GP-2023-084</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">RPP Tematik Kelas 5 - Pekan 4</p>
                  <p className="text-xs text-slate-500">2 Berkas Dokumen</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">10 Sep 2023</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Drs. H. Mulyadi, M.Pd</p>
                  <p className="text-xs text-slate-500">NIP. 196805121992031005</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <span className="w-1 h-1 mr-2 rounded-full bg-emerald-500"></span>
                    Approved
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 transition-all rounded-lg text-primary hover:bg-primary/10" title="Lihat Detail">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KirimKepalaSekolah;
