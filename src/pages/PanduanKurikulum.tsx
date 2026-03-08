import React from 'react';

const guides = [
  {
    id: 1,
    title: 'Capaian Pembelajaran (CP)',
    description: 'Dokumen resmi Capaian Pembelajaran untuk semua fase dan mata pelajaran.',
    icon: 'description',
    color: 'blue',
    files: [
      { name: 'CP Matematika Fase E.pdf', size: '2.4 MB' },
      { name: 'CP Matematika Fase F.pdf', size: '3.1 MB' },
    ]
  },
  {
    id: 2,
    title: 'Alur Tujuan Pembelajaran (ATP)',
    description: 'Panduan penyusunan dan contoh ATP untuk berbagai mata pelajaran.',
    icon: 'account_tree',
    color: 'green',
    files: [
      { name: 'Panduan Penyusunan ATP.pdf', size: '1.8 MB' },
      { name: 'Contoh ATP Matematika Kelas X.docx', size: '540 KB' },
    ]
  },
  {
    id: 3,
    title: 'Modul Ajar',
    description: 'Kumpulan modul ajar referensi dan template penyusunan modul.',
    icon: 'library_books',
    color: 'purple',
    files: [
      { name: 'Template Modul Ajar Standar.docx', size: '120 KB' },
      { name: 'Modul Ajar Eksponen & Logaritma.pdf', size: '4.5 MB' },
      { name: 'Modul Ajar Trigonometri Dasar.pdf', size: '3.8 MB' },
    ]
  },
  {
    id: 4,
    title: 'Panduan Penilaian',
    description: 'Pedoman asesmen formatif dan sumatif dalam Kurikulum Merdeka.',
    icon: 'fact_check',
    color: 'orange',
    files: [
      { name: 'Panduan Asesmen Kurikulum Merdeka.pdf', size: '5.2 MB' },
      { name: 'Rubrik Penilaian Proyek.xlsx', size: '85 KB' },
    ]
  }
];

const PanduanKurikulum: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panduan Kurikulum</h1>
          <p className="text-gray-500 dark:text-gray-400">Pusat sumber daya dan dokumen implementasi kurikulum</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Cari dokumen..."
              className="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-lg sm:w-64 bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-sidebar-dark dark:border-border-dark dark:text-white dark:focus:bg-gray-900 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700">
            <span className="material-symbols-outlined">upload</span>
            Unggah Dokumen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {guides.map((guide) => {
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
            green: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
            purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
            orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
          }[guide.color];

          return (
            <div key={guide.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl ${colorClasses}`}>
                  <span className="material-symbols-outlined text-2xl">{guide.icon}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{guide.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{guide.description}</p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-border-dark space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dokumen Tersedia</h3>
                {guide.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-500 transition-colors">
                        {file.name.endsWith('.pdf') ? 'picture_as_pdf' : 
                         file.name.endsWith('.docx') ? 'description' : 
                         file.name.endsWith('.xlsx') ? 'table_view' : 'insert_drive_file'}
                      </span>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{file.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20">
                        <span className="material-symbols-outlined text-sm">download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PanduanKurikulum;
