import React from 'react';

const ModulAjarAI: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <nav className="flex text-xs text-slate-500 space-x-2">
          <span>Beranda</span>
          <span>/</span>
          <span>Perangkat Ajar</span>
          <span>/</span>
          <span className="font-medium text-primary">Modul Ajar Generator</span>
        </nav>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Modul Ajar / RPM AI</h1>
        <p className="text-slate-500 dark:text-slate-400">Generate lesson plans automatically using Gemini AI models based on Kurikulum Merdeka standards.</p>
      </div>
      
      <div className="grid items-start grid-cols-12 gap-8">
        {/* Left Panel: Configuration */}
        <div className="col-span-12 space-y-6 lg:col-span-4">
          <div className="p-6 bg-white border shadow-sm dark:bg-sidebar-dark rounded-xl border-slate-200 dark:border-border-dark">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900 dark:text-white">
              <span className="material-symbols-outlined text-primary">tune</span>
              Konfigurasi Modul
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Mata Pelajaran</label>
                <select className="w-full text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
                  <option>Informatika</option>
                  <option>Bahasa Indonesia</option>
                  <option>Matematika</option>
                  <option>Fisika</option>
                  <option>Ekonomi</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Fase / Kelas</label>
                <select className="w-full text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
                  <option>Fase E / Kelas 10</option>
                  <option>Fase F / Kelas 11</option>
                  <option>Fase F / Kelas 12</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Topik Materi</label>
                <input className="w-full text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900" placeholder="Contoh: Berpikir Komputasional" type="text"/>
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Model Pembelajaran</label>
                <select className="w-full text-sm transition-colors border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900">
                  <option>Problem Based Learning (PBL)</option>
                  <option>Discovery Learning</option>
                  <option>Project Based Learning (PjBL)</option>
                  <option>Inquiry Learning</option>
                </select>
              </div>
              <button className="flex items-center justify-center w-full gap-2 py-3 font-bold text-white transition-transform rounded-lg shadow-lg bg-primary shadow-primary/20 hover:scale-[1.02]">
                <span className="material-symbols-outlined">auto_awesome</span>
                Generate with Gemini AI
              </button>
            </div>
          </div>
          
          {/* AI Prompt Preview Box */}
          <div className="p-6 border rounded-xl bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm material-symbols-outlined text-primary">terminal</span>
              <h4 className="text-sm font-bold text-primary">AI Prompt Preview</h4>
            </div>
            <div className="p-4 font-mono text-[11px] leading-relaxed rounded-lg bg-slate-900 text-slate-300">
              <p className="mb-2">"Buatlah modul ajar kurikulum merdeka untuk mata pelajaran Informatka, Fase E Kelas 10 dengan topik Berpikir Komputasional."</p>
              <p className="mb-2">"Model pembelajaran: Problem Based Learning (PBL). Gunakan struktur standar: Informasi Umum, Komponen Inti, dan Skenario Pembelajaran (Pendahuluan, Inti, Penutup)."</p>
              <p>"Sertakan profil pelajar pancasila dan asesmen formatif."</p>
            </div>
          </div>
        </div>
        
        {/* Right Panel: Generated Content Preview */}
        <div className="col-span-12 lg:col-span-8">
          <div className="overflow-hidden bg-white border shadow-sm dark:bg-sidebar-dark rounded-xl border-slate-200 dark:border-border-dark">
            {/* Preview Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-border-dark">
              <button className="px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 border-primary text-primary">Informasi Umum</button>
              <button className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Komponen Inti</button>
              <button className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Skenario</button>
              <button className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Asesmen</button>
            </div>
            <div className="p-8 space-y-8 max-h-[700px] overflow-y-auto scroll-smooth">
              {/* Section 1: Informasi Umum */}
              <section>
                <h4 className="flex items-center gap-2 mb-6 text-xl font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full bg-primary/10 text-primary">1</span>
                  Informasi Umum
                </h4>
                <div className="grid grid-cols-2 gap-6 p-6 border rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-border-dark">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Penyusun</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Dian Sastrowardoyo</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Instansi</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">SMA Negeri 1 Jakarta</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tahun</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">2023/2024</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jenjang / Kelas</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">SMA / Kelas X</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alokasi Waktu</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">2 x 45 Menit (1 Pertemuan)</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="p-4 border-l-4 rounded-lg bg-primary/5 border-primary">
                    <p className="mb-2 text-xs font-bold uppercase text-primary">Profil Pelajar Pancasila</p>
                    <ul className="space-y-1 text-sm list-disc list-inside text-slate-600 dark:text-slate-400">
                      <li>Mandiri: Siswa mampu mengerjakan tugas secara individu.</li>
                      <li>Bernalar Kritis: Siswa mampu menganalisis masalah algoritma sederhana.</li>
                      <li>Kreatif: Siswa mampu menciptakan solusi alternatif untuk masalah pemrograman.</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
            {/* Preview Footer Actions */}
            <div className="flex items-center justify-between p-4 border-t bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-border-dark">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-xs material-symbols-outlined">history</span>
                Terakhir diupdate: 15 menit yang lalu oleh Gemini AI
              </div>
              <div className="flex gap-2">
                <button className="p-2 transition-colors text-slate-500 hover:text-primary">
                  <span className="material-symbols-outlined">zoom_in</span>
                </button>
                <button className="p-2 transition-colors text-slate-500 hover:text-primary">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulAjarAI;
