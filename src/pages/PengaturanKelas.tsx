import React, { useState, useEffect } from 'react';
import { getStorageKey } from '../utils/academic';

const initialClasses = [
  { id: '1', name: 'X IPA 1', grade: 'X', major: 'IPA', academicYear: '2023/2024', status: 'Aktif' },
  { id: '2', name: 'X IPA 2', grade: 'X', major: 'IPA', academicYear: '2023/2024', status: 'Aktif' },
  { id: '3', name: 'X IPS 1', grade: 'X', major: 'IPS', academicYear: '2023/2024', status: 'Aktif' },
];

const PengaturanKelas: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);

  const loadData = () => {
    const saved = localStorage.getItem(getStorageKey('guru_classes'));
    if (saved) {
      try {
        setClasses(JSON.parse(saved));
      } catch (e) {
        setClasses(initialClasses);
      }
    } else {
      setClasses(initialClasses);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('academicSettingsUpdated', loadData);
    return () => window.removeEventListener('academicSettingsUpdated', loadData);
  }, []);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'add' | 'edit' | 'delete';
    classItem?: any;
  }>({ isOpen: false, type: 'add' });

  const [formData, setFormData] = useState({
    name: '',
    grade: 'X',
    major: 'IPA',
    academicYear: '2023/2024',
    status: 'Aktif'
  });

  const handleCloseModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleAddClick = () => {
    setFormData({ name: '', grade: 'X', major: 'IPA', academicYear: '2023/2024', status: 'Aktif' });
    setModalState({ isOpen: true, type: 'add' });
  };

  const handleEditClick = (classItem: any) => {
    setFormData(classItem);
    setModalState({ isOpen: true, type: 'edit', classItem });
  };

  const handleDeleteClick = (classItem: any) => {
    setModalState({ isOpen: true, type: 'delete', classItem });
  };

  const handleSaveClass = () => {
    if (!formData.name) return;
    
    let newClasses = [...classes];
    if (modalState.type === 'add') {
      const newClass = {
        ...formData,
        id: Date.now().toString(),
      };
      newClasses = [...classes, newClass];
      alert('Kelas berhasil ditambahkan!');
    } else if (modalState.type === 'edit' && modalState.classItem) {
      newClasses = classes.map(c => c.id === modalState.classItem.id ? { ...c, ...formData } : c);
      alert('Kelas berhasil diperbarui!');
    }
    setClasses(newClasses);
    localStorage.setItem(getStorageKey('guru_classes'), JSON.stringify(newClasses));
    window.dispatchEvent(new Event('classesUpdated'));
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (modalState.classItem) {
      const newClasses = classes.filter(c => c.id !== modalState.classItem.id);
      setClasses(newClasses);
      localStorage.setItem(getStorageKey('guru_classes'), JSON.stringify(newClasses));
      window.dispatchEvent(new Event('classesUpdated'));
      alert('Kelas berhasil dihapus!');
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Kelas</h1>
          <p className="text-gray-500 dark:text-gray-400">Atur kelas-kelas yang Anda ajar pada tahun ajaran ini</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah Kelas
          </button>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <div className="overflow-x-auto border border-gray-200 rounded-xl dark:border-border-dark">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">No</th>
                <th scope="col" className="px-6 py-4 font-medium">Nama Kelas</th>
                <th scope="col" className="px-6 py-4 font-medium">Tingkat</th>
                <th scope="col" className="px-6 py-4 font-medium">Jurusan</th>
                <th scope="col" className="px-6 py-4 font-medium">Tahun Ajaran</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {classes.length > 0 ? (
                classes.map((classItem, index) => (
                  <tr key={classItem.id} className="bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{classItem.name}</td>
                    <td className="px-6 py-4">{classItem.grade}</td>
                    <td className="px-6 py-4">{classItem.major}</td>
                    <td className="px-6 py-4">{classItem.academicYear}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        classItem.status === 'Aktif' 
                          ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' 
                          : 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {classItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(classItem)} className="p-1.5 text-orange-600 rounded-lg hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-colors" title="Edit">
                          <span className="text-xl material-symbols-outlined">edit</span>
                        </button>
                        <button onClick={() => handleDeleteClick(classItem)} className="p-1.5 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors" title="Hapus">
                          <span className="text-xl material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Belum ada kelas yang ditambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalState.type === 'add' && 'Tambah Kelas Baru'}
                {modalState.type === 'edit' && 'Edit Data Kelas'}
                {modalState.type === 'delete' && 'Konfirmasi Hapus'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-6">
              {(modalState.type === 'add' || modalState.type === 'edit') && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kelas</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Contoh: X IPA 1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tingkat</label>
                      <select 
                        value={formData.grade} 
                        onChange={(e) => setFormData({...formData, grade: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="I">I (SD)</option>
                        <option value="II">II (SD)</option>
                        <option value="III">III (SD)</option>
                        <option value="IV">IV (SD)</option>
                        <option value="V">V (SD)</option>
                        <option value="VI">VI (SD)</option>
                        <option value="VII">VII (SMP)</option>
                        <option value="VIII">VIII (SMP)</option>
                        <option value="IX">IX (SMP)</option>
                        <option value="X">X (SMA/SMK)</option>
                        <option value="XI">XI (SMA/SMK)</option>
                        <option value="XII">XII (SMA/SMK)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Jurusan</label>
                      <select 
                        value={formData.major} 
                        onChange={(e) => setFormData({...formData, major: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="IPA">IPA</option>
                        <option value="IPS">IPS</option>
                        <option value="Bahasa">Bahasa</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tahun Ajaran</label>
                      <input 
                        type="text" 
                        list="academic-years"
                        value={formData.academicYear} 
                        onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Pilih atau ketik manual..."
                      />
                      <datalist id="academic-years">
                        <option value="2023/2024" />
                        <option value="2024/2025" />
                        <option value="2025/2026" />
                        <option value="2026/2027" />
                        <option value="2027/2028" />
                        <option value="2028/2029" />
                        <option value="2029/2030" />
                        <option value="2030/2031" />
                      </datalist>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {modalState.type === 'delete' && modalState.classItem && (
                <p className="text-gray-600 dark:text-gray-300">
                  Apakah Anda yakin ingin menghapus kelas <span className="font-bold text-gray-900 dark:text-white">{modalState.classItem.name}</span>?
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              {(modalState.type === 'add' || modalState.type === 'edit') && (
                <>
                  <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                    Batal
                  </button>
                  <button onClick={handleSaveClass} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-blue-700">
                    Simpan
                  </button>
                </>
              )}
              {modalState.type === 'delete' && (
                <>
                  <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                    Batal
                  </button>
                  <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                    Hapus
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengaturanKelas;
