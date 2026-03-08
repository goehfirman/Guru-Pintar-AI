import React from 'react';

const CetakLaporan: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Cetak Laporan Administrasi</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Unduh dan cetak seluruh dokumen administrasi pembelajaran Anda dalam format PDF standar nasional.</p>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 p-6 mb-8 bg-white border shadow-sm md:grid-cols-4 dark:bg-sidebar-dark rounded-xl border-slate-200 dark:border-border-dark">
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Tahun Ajaran</label>
          <select className="w-full text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
            <option>2023/2024</option>
            <option>2024/2025</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Semester</label>
          <select className="w-full text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
            <option>Ganjil</option>
            <option>Genap</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Kelas</label>
          <select className="w-full text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
            <option>Kelas X - Merdeka 1</option>
            <option>Kelas X - Merdeka 2</option>
            <option>Kelas XI - IPA 1</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Mata Pelajaran</label>
          <select className="w-full text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
            <option>Informatika</option>
            <option>Matematika</option>
            <option>Fisika</option>
          </select>
        </div>
      </div>
      
      {/* Batch Print Section */}
      <div className="relative overflow-hidden mb-8 group rounded-xl">
        <div className="absolute inset-0 opacity-90 bg-gradient-to-r from-primary to-blue-600 rounded-xl"></div>
        <div className="relative flex flex-col justify-between gap-6 p-8 text-white lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded bg-white/20">Fitur Unggulan</span>
            </div>
            <h3 className="mb-3 text-2xl font-bold">Cetak Batch (Satu Semester)</h3>
            <p className="mb-4 text-sm text-blue-100">Unduh seluruh dokumen perangkat ajar dan administrasi dalam satu file arsip terkompresi (.zip). Sangat efisien untuk keperluan akreditasi atau pemeriksaan rutin.</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs border rounded-full bg-white/10 border-white/20">Prota & Promes</span>
              <span className="px-3 py-1 text-xs border rounded-full bg-white/10 border-white/20">ATP & Modul Ajar</span>
              <span className="px-3 py-1 text-xs border rounded-full bg-white/10 border-white/20">Jurnal & Absensi</span>
              <span className="px-3 py-1 text-xs border rounded-full bg-white/10 border-white/20">Asesmen</span>
            </div>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 font-bold transition-transform bg-white rounded-xl text-primary hover:bg-blue-50 active:scale-95 whitespace-nowrap">
            <span className="material-symbols-outlined">folder_zip</span>
            Unduh Semua Dokumen
          </button>
        </div>
      </div>
      
      {/* Document List Section */}
      <div className="overflow-hidden bg-white border shadow-sm dark:bg-sidebar-dark rounded-xl border-slate-200 dark:border-border-dark">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-border-dark">
          <h4 className="font-bold text-slate-800 dark:text-white">Daftar Dokumen Individu</h4>
          <div className="relative">
            <span className="absolute text-lg -translate-y-1/2 material-symbols-outlined left-3 top-1/2 text-slate-400">search</span>
            <input className="w-64 py-1.5 pl-10 pr-4 text-sm transition-colors border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" placeholder="Cari dokumen..." type="text"/>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-gray-400">Nama Dokumen</th>
              <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-gray-400">Terakhir Diperbarui</th>
              <th className="px-6 py-4 text-xs font-bold tracking-wider text-right uppercase text-slate-500 dark:text-gray-400">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
            <tr className="transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/40">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-orange-600 bg-orange-100 rounded-lg dark:bg-orange-900/20 dark:text-orange-400">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Jurnal Mengajar Guru</p>
                    <p className="text-xs text-slate-400">Jurnal harian KBM</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-gray-400">22 Okt 2023, 14:20</td>
              <td className="px-6 py-4 text-right">
                <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border rounded-lg text-primary hover:bg-primary/5 border-primary/20">
                  <span className="text-sm material-symbols-outlined">picture_as_pdf</span>
                  Cetak PDF
                </button>
              </td>
            </tr>
            <tr className="transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/40">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-blue-600 bg-blue-100 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                    <span className="material-symbols-outlined">assignment_ind</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Rekap Absensi Siswa</p>
                    <p className="text-xs text-slate-400">Kehadiran semester ganjil</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-gray-400">20 Okt 2023, 09:15</td>
              <td className="px-6 py-4 text-right">
                <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border rounded-lg text-primary hover:bg-primary/5 border-primary/20">
                  <span className="text-sm material-symbols-outlined">picture_as_pdf</span>
                  Cetak PDF
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CetakLaporan;
