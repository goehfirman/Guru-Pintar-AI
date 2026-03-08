import React, { useState } from 'react';

const achievements = [
  { id: 1, student: 'Ahmad Fauzi', class: 'X IPA 1', title: 'Juara 1 Olimpiade Matematika Nasional', level: 'Nasional', date: '15 Okt 2023', category: 'Akademik' },
  { id: 2, student: 'Citra Lestari', class: 'X IPA 1', title: 'Medali Emas Pencak Silat O2SN', level: 'Provinsi', date: '20 Sep 2023', category: 'Non-Akademik' },
  { id: 3, student: 'Budi Santoso', class: 'X IPA 1', title: 'Juara Harapan 1 Lomba Debat Bahasa Inggris', level: 'Kabupaten/Kota', date: '05 Agu 2023', category: 'Akademik' },
  { id: 4, student: 'Fina Melati', class: 'X IPA 2', title: 'Juara 2 Lomba Cipta Puisi', level: 'Sekolah', date: '17 Agu 2023', category: 'Non-Akademik' },
];

const PortfolioPrestasi: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch = achievement.student.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          achievement.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua Kategori' || achievement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Prestasi</h1>
          <p className="text-gray-500 dark:text-gray-400">Pencatatan dan dokumentasi prestasi siswa</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">download</span>
            Export Laporan
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700">
            <span className="material-symbols-outlined">add</span>
            Tambah Prestasi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-blue-600 bg-blue-50 rounded-xl dark:bg-blue-900/20 dark:text-blue-400">
              <span className="material-symbols-outlined">emoji_events</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">24</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Prestasi Tahun Ini</p>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-green-600 bg-green-50 rounded-xl dark:bg-green-900/20 dark:text-green-400">
              <span className="material-symbols-outlined">public</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">5</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tingkat Nasional/Internasional</p>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-purple-600 bg-purple-50 rounded-xl dark:bg-purple-900/20 dark:text-purple-400">
              <span className="material-symbols-outlined">school</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">14</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Prestasi Akademik</p>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 text-orange-600 bg-orange-50 rounded-xl dark:bg-orange-900/20 dark:text-orange-400">
              <span className="material-symbols-outlined">sports_basketball</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">10</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Prestasi Non-Akademik</p>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Cari siswa atau nama lomba..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-lg sm:w-64 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
            >
              <option value="Semua Kategori">Semua Kategori</option>
              <option value="Akademik">Akademik</option>
              <option value="Non-Akademik">Non-Akademik</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Menampilkan {filteredAchievements.length} data prestasi</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl dark:border-border-dark">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">No</th>
                <th scope="col" className="px-6 py-4 font-medium">Nama Siswa</th>
                <th scope="col" className="px-6 py-4 font-medium">Kelas</th>
                <th scope="col" className="px-6 py-4 font-medium">Prestasi / Lomba</th>
                <th scope="col" className="px-6 py-4 font-medium">Tingkat</th>
                <th scope="col" className="px-6 py-4 font-medium">Kategori</th>
                <th scope="col" className="px-6 py-4 font-medium">Tanggal</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAchievements.length > 0 ? (
                filteredAchievements.map((achievement, index) => (
                  <tr key={achievement.id} className="bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{achievement.student}</td>
                    <td className="px-6 py-4">{achievement.class}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{achievement.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        achievement.level === 'Nasional' || achievement.level === 'Internasional'
                          ? 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400' 
                          : achievement.level === 'Provinsi'
                          ? 'text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {achievement.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        achievement.category === 'Akademik' 
                          ? 'text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' 
                          : 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {achievement.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{achievement.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors" title="Lihat Sertifikat">
                          <span className="text-xl material-symbols-outlined">workspace_premium</span>
                        </button>
                        <button className="p-1.5 text-orange-600 rounded-lg hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-colors" title="Edit">
                          <span className="text-xl material-symbols-outlined">edit</span>
                        </button>
                        <button className="p-1.5 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors" title="Hapus">
                          <span className="text-xl material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data prestasi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPrestasi;
