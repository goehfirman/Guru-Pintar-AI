import React from 'react';

const BankSoalAI: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page Title & Config */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-2">
            <h3 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Konfigurasi Bank Soal</h3>
            <p className="text-slate-500 dark:text-slate-400">Sesuaikan parameter di bawah ini untuk menghasilkan bank soal berkualitas tinggi menggunakan AI.</p>
          </div>
          
          {/* Form Card */}
          <div className="p-6 bg-white border shadow-sm dark:bg-sidebar-dark rounded-xl border-slate-200 dark:border-border-dark">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mata Pelajaran</label>
                <select className="w-full h-12 text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
                  <option>Pilih Mata Pelajaran</option>
                  <option selected>IPA (Ilmu Pengetahuan Alam)</option>
                  <option>Matematika</option>
                  <option>Bahasa Indonesia</option>
                  <option>Pendidikan Pancasila</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kelas</label>
                <select className="w-full h-12 text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
                  <option>Pilih Kelas</option>
                  <option selected>Kelas 5 SD</option>
                  <option>Kelas 6 SD</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipe Ujian</label>
                <select className="w-full h-12 text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
                  <option>Pilih Tipe</option>
                  <option selected>Sumatif Akhir Materi</option>
                  <option>Formatif Harian</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Topik Materi</label>
                <input className="w-full h-12 text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" placeholder="Contoh: Ekosistem Laut" type="text" defaultValue="Perkembangbiakan Hewan"/>
              </div>
            </div>
            
            {/* Question Count Breakdown */}
            <div className="pt-6 mt-8 border-t border-slate-100 dark:border-border-dark">
              <label className="block mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Jumlah & Komposisi Soal</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 text-center border rounded-lg bg-primary/5 border-primary/20">
                  <p className="text-xs font-bold uppercase text-primary">Pilihan Ganda</p>
                  <p className="text-2xl font-black text-primary">10</p>
                </div>
                <div className="p-3 text-center border rounded-lg bg-primary/5 border-primary/20">
                  <p className="text-xs font-bold uppercase text-primary">Isian Singkat</p>
                  <p className="text-2xl font-black text-primary">5</p>
                </div>
                <div className="p-3 text-center border rounded-lg bg-primary/5 border-primary/20">
                  <p className="text-xs font-bold uppercase text-primary">Uraian HOTS</p>
                  <p className="text-2xl font-black text-primary">2</p>
                </div>
              </div>
            </div>
            <button className="flex items-center justify-center w-full gap-2 h-14 mt-8 font-bold text-white transition-all rounded-xl shadow-lg bg-primary hover:bg-primary/90 shadow-primary/25">
              <span className="material-symbols-outlined">temp_preferences_custom</span>
              Generate Bank Soal dengan Gemini AI
            </button>
          </div>
        </div>
        
        {/* AI Prompt Preview */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold tracking-wider uppercase text-slate-500">AI Prompt Preview</h4>
          <div className="relative p-6 overflow-hidden font-mono text-xs leading-relaxed border rounded-xl bg-slate-900 text-slate-300 border-slate-800 group">
            <div className="absolute top-0 right-0 p-2 transition-opacity opacity-20 group-hover:opacity-100">
              <span className="text-white material-symbols-outlined">content_copy</span>
            </div>
            <p className="mb-2 text-blue-400">// System Prompt</p>
            <p>
              Buatkan bank soal untuk ujian <span className="text-white">Sumatif</span> Kelas <span className="text-white">5</span> SD, Mata Pelajaran <span className="text-white">IPA</span>, Materi <span className="text-white">Perkembangbiakan Hewan</span>.
              <br/><br/>
              Terdiri dari:
              <br/>• 10 soal Pilihan Ganda
              <br/>• 5 soal Isian Singkat
              <br/>• 2 soal Uraian HOTS (High Order Thinking Skills)
              <br/><br/>
              Sertakan Kunci Jawaban dan Pembahasan singkat di bagian akhir.
            </p>
          </div>
          <div className="flex gap-3 p-4 border rounded-xl bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-xs text-blue-800 dark:text-blue-300">Prompt ini dioptimalkan secara otomatis oleh GuruPintar Engine untuk hasil yang akurat sesuai kurikulum Merdeka.</p>
          </div>
        </div>
      </div>
      
      {/* Main Content Area: Hasil Generasi */}
      <div className="overflow-hidden bg-white border shadow-xl dark:bg-sidebar-dark rounded-2xl border-slate-200 dark:border-border-dark">
        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-5 border-b bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-border-dark">
          <div className="flex items-center gap-3">
            <div className="p-2 text-white bg-green-500 rounded-lg">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white">Hasil Generasi Soal</h4>
              <p className="text-xs text-slate-500">Selesai dibuat pada 10:45 WIB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors bg-white border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:text-white">
              <span className="text-sm material-symbols-outlined">edit</span> Edit Manual
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors bg-white border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:text-white">
              <span className="text-sm material-symbols-outlined">picture_as_pdf</span> Cetak PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-primary hover:bg-primary/90">
              <span className="text-sm material-symbols-outlined">save</span> Simpan ke Bank Soal
            </button>
          </div>
        </div>
        
        {/* Question Paper Content */}
        <div className="p-12 mx-auto space-y-10 font-serif max-w-4xl text-gray-900 dark:text-gray-100">
          <div className="pb-6 mb-8 space-y-2 text-center border-b-2 border-slate-900 dark:border-slate-100">
            <h2 className="text-2xl font-bold uppercase">Ujian Sumatif Akhir Materi</h2>
            <p className="text-lg">Tahun Pelajaran 2023/2024</p>
            <div className="flex justify-center gap-8 pt-4 text-sm font-medium italic font-sans text-slate-600 dark:text-slate-400">
              <span>Mata Pelajaran: IPA</span>
              <span>Kelas: V (Lima)</span>
              <span>Materi: Perkembangbiakan Hewan</span>
            </div>
          </div>
          
          {/* Section I */}
          <div className="space-y-6">
            <h3 className="pl-3 text-lg font-black font-sans border-l-4 border-primary">Bagian I: Pilihan Ganda</h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-lg font-medium leading-relaxed">1. Hewan yang berkembang biak dengan cara bertelur disebut dengan istilah...</p>
                <div className="grid grid-cols-1 gap-3 pl-4 text-base font-sans md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold border rounded border-slate-300">A</span>
                    Vivipar
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold border rounded border-slate-300">B</span>
                    Ovipar
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold border rounded border-slate-300">C</span>
                    Ovovivipar
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold border rounded border-slate-300">D</span>
                    Fragmentasi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankSoalAI;
