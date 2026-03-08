import React, { useState } from 'react';

const extracurriculars = [
  { id: 1, name: 'Pramuka', type: 'Wajib', schedule: 'Jumat, 15:00 - 17:00', members: 120, status: 'Aktif' },
  { id: 2, name: 'Paskibra', type: 'Pilihan', schedule: 'Selasa & Kamis, 15:30 - 17:30', members: 45, status: 'Aktif' },
  { id: 3, name: 'PMR', type: 'Pilihan', schedule: 'Rabu, 15:00 - 16:30', members: 30, status: 'Aktif' },
  { id: 4, name: 'Futsal', type: 'Pilihan', schedule: 'Senin & Rabu, 15:30 - 17:30', members: 60, status: 'Aktif' },
  { id: 5, name: 'KIR (Karya Ilmiah Remaja)', type: 'Pilihan', schedule: 'Kamis, 15:00 - 16:30', members: 25, status: 'Aktif' },
  { id: 6, name: 'Paduan Suara', type: 'Pilihan', schedule: 'Selasa, 15:00 - 17:00', members: 40, status: 'Non-Aktif' },
];

const ManajemenEkskul: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Semua Jenis');

  const filteredEkskul = extracurriculars.filter((ekskul) => {
    const matchesSearch = ekskul.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Semua Jenis' || ekskul.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Ekstrakurikuler</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola kegiatan ekstrakurikuler dan anggota</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">download</span>
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700">
            <span className="material-symbols-outlined">add</span>
            Tambah Ekskul
          </button>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Cari ekstrakurikuler..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-lg sm:w-64 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
            >
              <option value="Semua Jenis">Semua Jenis</option>
              <option value="Wajib">Wajib</option>
              <option value="Pilihan">Pilihan</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Menampilkan {filteredEkskul.length} ekstrakurikuler</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl dark:border-border-dark">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">No</th>
                <th scope="col" className="px-6 py-4 font-medium">Nama Ekstrakurikuler</th>
                <th scope="col" className="px-6 py-4 font-medium">Jenis</th>
                <th scope="col" className="px-6 py-4 font-medium">Jadwal Latihan</th>
                <th scope="col" className="px-6 py-4 font-medium">Jml Anggota</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEkskul.length > 0 ? (
                filteredEkskul.map((ekskul, index) => (
                  <tr key={ekskul.id} className="bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ekskul.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        ekskul.type === 'Wajib' 
                          ? 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' 
                          : 'text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}>
                        {ekskul.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{ekskul.schedule}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ekskul.members}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        ekskul.status === 'Aktif' 
                          ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' 
                          : 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {ekskul.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors" title="Kelola Anggota">
                          <span className="text-xl material-symbols-outlined">group</span>
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data ekstrakurikuler yang ditemukan.
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

export default ManajemenEkskul;
