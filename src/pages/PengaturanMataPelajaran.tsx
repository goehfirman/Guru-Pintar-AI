import React, { useState, useEffect } from 'react';
import { getStorageKey } from '../utils/academic';

interface ClassItem {
  id: string;
  name: string;
  grade: string;
  major: string;
  academicYear: string;
  status: string;
}

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  mappedClasses: string[]; // Array of class IDs
}

const initialSubjects: SubjectItem[] = [
  { id: '1', code: 'PAI', name: 'Pendidikan Agama Islam', mappedClasses: ['1', '2', '3'] },
  { id: '2', code: 'PKN', name: 'Pendidikan Pancasila', mappedClasses: ['1', '2', '3'] },
  { id: '3', code: 'IND', name: 'Bahasa Indonesia', mappedClasses: ['1', '2', '3'] },
  { id: '4', code: 'MTK', name: 'Matematika', mappedClasses: ['1', '2', '3'] },
  { id: '5', code: 'IPAS', name: 'IPAS', mappedClasses: ['1', '2', '3'] },
  { id: '6', code: 'PJOK', name: 'PJOK', mappedClasses: ['1', '2', '3'] },
  { id: '7', code: 'SBDP', name: 'Seni Budaya', mappedClasses: ['1', '2', '3'] },
  { id: '8', code: 'ING', name: 'Bahasa Inggris', mappedClasses: ['1', '2', '3'] },
  { id: '9', code: 'PLBJ', name: 'PLBJ', mappedClasses: ['1', '2', '3'] },
  { id: '10', code: 'KKA', name: 'Koding dan Kecerdasan Artifisial', mappedClasses: ['1', '2', '3'] },
];

const PengaturanMataPelajaran: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassItem[]>([]);

  const loadData = () => {
    const savedSubjects = localStorage.getItem(getStorageKey('guru_subjects'));
    if (savedSubjects) {
      try {
        setSubjects(JSON.parse(savedSubjects));
      } catch (e) {
        setSubjects(initialSubjects);
      }
    } else {
      setSubjects(initialSubjects);
    }

    const savedClasses = localStorage.getItem(getStorageKey('guru_classes'));
    if (savedClasses) {
      try {
        setAvailableClasses(JSON.parse(savedClasses));
      } catch (e) {}
    } else {
      setAvailableClasses([
        { id: '1', name: 'X IPA 1', grade: 'X', major: 'IPA', academicYear: '2023/2024', status: 'Aktif' },
        { id: '2', name: 'X IPA 2', grade: 'X', major: 'IPA', academicYear: '2023/2024', status: 'Aktif' },
        { id: '3', name: 'X IPS 1', grade: 'X', major: 'IPS', academicYear: '2023/2024', status: 'Aktif' },
      ]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('academicSettingsUpdated', loadData);
    window.addEventListener('classesUpdated', loadData);
    return () => {
      window.removeEventListener('academicSettingsUpdated', loadData);
      window.removeEventListener('classesUpdated', loadData);
    };
  }, []);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'add' | 'edit' | 'delete';
    subjectItem?: SubjectItem;
  }>({ isOpen: false, type: 'add' });

  const [formData, setFormData] = useState<SubjectItem>({
    id: '',
    name: '',
    code: '',
    mappedClasses: []
  });

  const handleCloseModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleAddClick = () => {
    setFormData({ id: '', name: '', code: '', mappedClasses: [] });
    setModalState({ isOpen: true, type: 'add' });
  };

  const handleEditClick = (subjectItem: SubjectItem) => {
    setFormData(subjectItem);
    setModalState({ isOpen: true, type: 'edit', subjectItem });
  };

  const handleDeleteClick = (subjectItem: SubjectItem) => {
    setModalState({ isOpen: true, type: 'delete', subjectItem });
  };

  const handleSaveSubject = () => {
    if (!formData.name || !formData.code) return;
    
    let newSubjects = [...subjects];
    if (modalState.type === 'add') {
      const newSubject = {
        ...formData,
        id: Date.now().toString(),
      };
      newSubjects = [...subjects, newSubject];
      alert('Mata pelajaran berhasil ditambahkan!');
    } else if (modalState.type === 'edit' && modalState.subjectItem) {
      newSubjects = subjects.map(s => s.id === modalState.subjectItem?.id ? { ...s, ...formData } : s);
      alert('Mata pelajaran berhasil diperbarui!');
    }
    setSubjects(newSubjects);
    localStorage.setItem(getStorageKey('guru_subjects'), JSON.stringify(newSubjects));
    window.dispatchEvent(new Event('subjectsUpdated'));
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (modalState.subjectItem) {
      const newSubjects = subjects.filter(s => s.id !== modalState.subjectItem?.id);
      setSubjects(newSubjects);
      localStorage.setItem(getStorageKey('guru_subjects'), JSON.stringify(newSubjects));
      window.dispatchEvent(new Event('subjectsUpdated'));
      alert('Mata pelajaran berhasil dihapus!');
    }
    handleCloseModal();
  };

  const toggleClassMapping = (classId: string) => {
    setFormData(prev => {
      const isMapped = prev.mappedClasses.includes(classId);
      if (isMapped) {
        return { ...prev, mappedClasses: prev.mappedClasses.filter(id => id !== classId) };
      } else {
        return { ...prev, mappedClasses: [...prev.mappedClasses, classId] };
      }
    });
  };

  const getMappedClassNames = (mappedClassIds: string[]) => {
    if (!mappedClassIds || mappedClassIds.length === 0) return '-';
    const names = mappedClassIds.map(id => {
      const cls = availableClasses.find(c => c.id === id);
      return cls ? cls.name : 'Unknown';
    });
    return names.join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Mata Pelajaran</h1>
          <p className="text-gray-500 dark:text-gray-400">Atur mata pelajaran dan pemetaannya untuk setiap kelas</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah Mapel
          </button>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <div className="overflow-x-auto border border-gray-200 rounded-xl dark:border-border-dark">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">No</th>
                <th scope="col" className="px-6 py-4 font-medium">Kode</th>
                <th scope="col" className="px-6 py-4 font-medium">Mata Pelajaran</th>
                <th scope="col" className="px-6 py-4 font-medium">Kelas yang Diajar</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length > 0 ? (
                subjects.map((subjectItem, index) => (
                  <tr key={subjectItem.id} className="bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{subjectItem.code}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{subjectItem.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {subjectItem.mappedClasses && subjectItem.mappedClasses.length > 0 ? (
                          subjectItem.mappedClasses.map(classId => {
                            const cls = availableClasses.find(c => c.id === classId);
                            if (!cls) return null;
                            return (
                              <span key={classId} className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md dark:bg-blue-900/20 dark:text-blue-400">
                                {cls.name}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 italic">Belum ada kelas</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(subjectItem)} className="p-1.5 text-orange-600 rounded-lg hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-colors" title="Edit">
                          <span className="text-xl material-symbols-outlined">edit</span>
                        </button>
                        <button onClick={() => handleDeleteClick(subjectItem)} className="p-1.5 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors" title="Hapus">
                          <span className="text-xl material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Belum ada mata pelajaran yang ditambahkan.
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
          <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalState.type === 'add' && 'Tambah Mata Pelajaran'}
                {modalState.type === 'edit' && 'Edit Mata Pelajaran'}
                {modalState.type === 'delete' && 'Konfirmasi Hapus'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-6">
              {(modalState.type === 'add' || modalState.type === 'edit') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Kode</label>
                      <input 
                        type="text" 
                        value={formData.code} 
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Contoh: MAT"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nama Mata Pelajaran</label>
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Contoh: Matematika Wajib"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Pemetaan Kelas</label>
                    <p className="text-xs text-gray-500 mb-3 dark:text-gray-400">Pilih kelas mana saja yang diajarkan untuk mata pelajaran ini.</p>
                    
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-48 overflow-y-auto p-1">
                      {availableClasses.length > 0 ? (
                        availableClasses.map(cls => (
                          <label 
                            key={cls.id} 
                            className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                              formData.mappedClasses.includes(cls.id) 
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              checked={formData.mappedClasses.includes(cls.id)}
                              onChange={() => toggleClassMapping(cls.id)}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                              {cls.name}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div className="col-span-full text-sm text-gray-500 dark:text-gray-400 italic">
                          Belum ada kelas yang tersedia. Silakan tambahkan kelas di menu Pengaturan Kelas terlebih dahulu.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalState.type === 'delete' && modalState.subjectItem && (
                <p className="text-gray-600 dark:text-gray-300">
                  Apakah Anda yakin ingin menghapus mata pelajaran <span className="font-bold text-gray-900 dark:text-white">{modalState.subjectItem.name}</span>?
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              {(modalState.type === 'add' || modalState.type === 'edit') && (
                <>
                  <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                    Batal
                  </button>
                  <button 
                    onClick={handleSaveSubject} 
                    disabled={!formData.name || !formData.code}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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

export default PengaturanMataPelajaran;
