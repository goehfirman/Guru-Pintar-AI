import React, { useState, useEffect } from 'react';
import { getStorageKey } from '../utils/academic';

const initialEntries = [
  { id: 1, date: '2023-10-25', time: '07:30 - 09:00', class: 'X IPA 1', subject: 'Matematika Wajib', topic: 'Persamaan Kuadrat', status: 'Selesai' },
  { id: 2, date: '2023-10-25', time: '09:15 - 10:45', class: 'XI IPA 2', subject: 'Matematika Peminatan', topic: 'Trigonometri Lanjut', status: 'Selesai' },
  { id: 3, date: '2023-10-24', time: '11:00 - 12:30', class: 'X IPS 1', subject: 'Matematika Wajib', topic: 'Sistem Persamaan Linear', status: 'Selesai' },
  { id: 4, date: '2023-10-24', time: '13:00 - 14:30', class: 'XI IPS 2', subject: 'Matematika Wajib', topic: 'Matriks', status: 'Selesai' },
  { id: 5, date: '2023-10-23', time: '07:30 - 09:00', class: 'X IPA 2', subject: 'Matematika Wajib', topic: 'Persamaan Kuadrat', status: 'Selesai' },
];

const JurnalAgendaGuru: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [journalEntries, setJournalEntries] = useState<any[]>([]);

  const [availableClasses, setAvailableClasses] = useState<string[]>(['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XI IPA 2']);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([
    'Pendidikan Agama Islam', 
    'Pendidikan Pancasila', 
    'Bahasa Indonesia', 
    'Matematika', 
    'IPAS', 
    'PJOK', 
    'Seni Budaya', 
    'Bahasa Inggris', 
    'PLBJ', 
    'Koding dan Kecerdasan Artifisial'
  ]);

  const loadData = () => {
    // Load Journal
    const savedJournal = localStorage.getItem(getStorageKey('guru_journal'));
    if (savedJournal) {
      try {
        setJournalEntries(JSON.parse(savedJournal));
      } catch (e) {
        setJournalEntries(initialEntries);
      }
    } else {
      setJournalEntries(initialEntries);
    }

    // Load Classes
    const savedClasses = localStorage.getItem(getStorageKey('guru_classes'));
    if (savedClasses) {
      try {
        const parsedClasses = JSON.parse(savedClasses);
        if (parsedClasses.length > 0) {
          setAvailableClasses(parsedClasses.map((c: any) => c.name));
        }
      } catch (e) {}
    }

    // Load Subjects
    const savedSubjects = localStorage.getItem(getStorageKey('guru_subjects'));
    if (savedSubjects) {
      try {
        const parsedSubjects = JSON.parse(savedSubjects);
        if (parsedSubjects.length > 0) {
          setAvailableSubjects(parsedSubjects.map((s: any) => s.name));
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('academicSettingsUpdated', loadData);
    window.addEventListener('classesUpdated', loadData);
    window.addEventListener('subjectsUpdated', loadData);
    return () => {
      window.removeEventListener('academicSettingsUpdated', loadData);
      window.removeEventListener('classesUpdated', loadData);
      window.removeEventListener('subjectsUpdated', loadData);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    time: '',
    class: '',
    subject: '',
    topic: '',
    status: 'Selesai'
  });

  const filteredEntries = journalEntries.filter(entry => {
    const matchesDate = entry.date === selectedDate;
    const matchesSearch = entry.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          entry.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const handleAddClick = () => {
    setFormData({
      date: selectedDate,
      time: '',
      class: availableClasses[0] || '',
      subject: availableSubjects[0] || '',
      topic: '',
      status: 'Selesai'
    });
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleEditClick = (entry: any) => {
    setFormData(entry);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.time || !formData.class || !formData.subject || !formData.topic) {
      alert('Mohon lengkapi semua data.');
      return;
    }

    let newEntries = [...journalEntries];
    if (modalType === 'add') {
      const newEntry = {
        ...formData,
        id: Date.now()
      };
      newEntries = [newEntry, ...journalEntries];
      alert('Jurnal berhasil ditambahkan!');
    } else {
      newEntries = journalEntries.map(entry => entry.id === formData.id ? formData : entry);
      alert('Jurnal berhasil diperbarui!');
    }
    setJournalEntries(newEntries);
    localStorage.setItem(getStorageKey('guru_journal'), JSON.stringify(newEntries));
    window.dispatchEvent(new Event('journalUpdated'));
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      const newEntries = journalEntries.filter(entry => entry.id !== id);
      setJournalEntries(newEntries);
      localStorage.setItem(getStorageKey('guru_journal'), JSON.stringify(newEntries));
      window.dispatchEvent(new Event('journalUpdated'));
      alert('Jurnal berhasil dihapus!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jurnal Agenda Guru</h1>
          <p className="text-gray-500 dark:text-gray-400">Catatan kegiatan belajar mengajar harian</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-sidebar-dark dark:border-border-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">download</span>
            Export PDF
          </button>
          <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700">
            <span className="material-symbols-outlined">add</span>
            Isi Jurnal Baru
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
                placeholder="Cari materi atau kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-lg sm:w-64 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
              />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-2 px-4 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-900 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Menampilkan {filteredEntries.length} entri</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl dark:border-border-dark">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Waktu</th>
                <th scope="col" className="px-6 py-4 font-medium">Kelas</th>
                <th scope="col" className="px-6 py-4 font-medium">Mata Pelajaran</th>
                <th scope="col" className="px-6 py-4 font-medium">Materi Pokok</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">{entry.time}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{entry.class}</td>
                    <td className="px-6 py-4">{entry.subject}</td>
                    <td className="px-6 py-4">{entry.topic}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${entry.status === 'Selesai' ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(entry)} className="p-1.5 text-orange-600 rounded-lg hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-colors" title="Edit">
                          <span className="text-xl material-symbols-outlined">edit</span>
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors" title="Hapus">
                          <span className="text-xl material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada jurnal untuk tanggal ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalType === 'add' ? 'Isi Jurnal Baru' : 'Edit Jurnal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Waktu (misal: 07:30 - 09:00)</label>
                <input 
                  type="text" 
                  value={formData.time} 
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  placeholder="07:30 - 09:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Kelas</label>
                  <select 
                    value={formData.class} 
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Pilih Kelas</option>
                    {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Mata Pelajaran</label>
                  <select 
                    value={formData.subject} 
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Pilih Mapel</option>
                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Materi Pokok</label>
                <textarea 
                  value={formData.topic} 
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  rows={3}
                  placeholder="Masukkan materi yang diajarkan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Selesai">Selesai</option>
                  <option value="Belum Selesai">Belum Selesai</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                Batal
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-blue-700">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JurnalAgendaGuru;
