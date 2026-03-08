import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getStorageKey } from '../utils/academic';
import { GoogleGenAI } from "@google/genai";

interface SubjectItem {
  id: string;
  name: string;
  code: string;
}

interface ATPItem {
  id: string;
  subjectId: string;
  kodeTp: string;
  unitTopik: string;
  jejakTurunanCp: string;
  rumusanTp: string;
  asesmen: string;
  jp: string;
}

const initialSubjects: SubjectItem[] = [
  { id: '1', code: 'PAI', name: 'Pendidikan Agama Islam' },
  { id: '2', code: 'PKN', name: 'Pendidikan Pancasila' },
  { id: '3', code: 'IND', name: 'Bahasa Indonesia' },
  { id: '4', code: 'MTK', name: 'Matematika' },
  { id: '5', code: 'IPAS', name: 'IPAS' },
  { id: '6', code: 'PJOK', name: 'PJOK' },
  { id: '7', code: 'SBDP', name: 'Seni Budaya' },
  { id: '8', code: 'ING', name: 'Bahasa Inggris' },
  { id: '9', code: 'PLBJ', name: 'PLBJ' },
  { id: '10', code: 'KKA', name: 'Koding dan Kecerdasan Artifisial' },
];

const AlurTujuanPembelajaran: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    return localStorage.getItem('atp_selected_subject_id') || '';
  });
  const [atpData, setAtpData] = useState<ATPItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSubjectId, setImportSubjectId] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Omit<ATPItem, 'id' | 'subjectId'>>({
    kodeTp: '',
    unitTopik: '',
    jejakTurunanCp: '',
    rumusanTp: '',
    asesmen: '',
    jp: ''
  });

  useEffect(() => {
    // Load subjects
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
  }, []);

  useEffect(() => {
    if (subjects.length > 0) {
      if (!selectedSubjectId) {
        setSelectedSubjectId(subjects[0].id);
      } else {
        const exists = subjects.some(s => s.id === selectedSubjectId);
        if (!exists) {
          setSelectedSubjectId(subjects[0].id);
        }
      }
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (selectedSubjectId) {
      localStorage.setItem('atp_selected_subject_id', selectedSubjectId);
      loadAtpData(selectedSubjectId);
      setSelectedItems(new Set()); // Reset selection when subject changes
    }
  }, [selectedSubjectId]);

  const loadAtpData = (subjectId: string) => {
    const savedAtp = localStorage.getItem(getStorageKey(`guru_atp_${subjectId}`));
    if (savedAtp) {
      try {
        setAtpData(JSON.parse(savedAtp));
      } catch (e) {
        setAtpData([]);
      }
    } else {
      setAtpData([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === atpData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(atpData.map(item => item.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.size} data yang dipilih?`)) return;
    
    const newData = atpData.filter(item => !selectedItems.has(item.id));
    setAtpData(newData);
    localStorage.setItem(getStorageKey(`guru_atp_${selectedSubjectId}`), JSON.stringify(newData));
    setSelectedItems(new Set());
  };

  const handleSave = () => {
    if (!selectedSubjectId) return;
    
    const newItem: ATPItem = {
      id: Date.now().toString(),
      subjectId: selectedSubjectId,
      ...formData
    };

    const newData = [...atpData, newItem];
    setAtpData(newData);
    localStorage.setItem(getStorageKey(`guru_atp_${selectedSubjectId}`), JSON.stringify(newData));
    setIsModalOpen(false);
    setFormData({
      kodeTp: '',
      unitTopik: '',
      jejakTurunanCp: '',
      rumusanTp: '',
      asesmen: '',
      jp: ''
    });
  };

  const handleSmartImport = async () => {
    if (!importSubjectId || !importFile) return;
    
    const subject = subjects.find(s => s.id === importSubjectId);
    if (!subject) return;

    setIsGenerating(true);

    try {
      let newItems: ATPItem[] = [];
      
      const apiKey = localStorage.getItem('gemini_api_key');

      if (!apiKey) {
        alert("Silakan masukkan API Key Gemini terlebih dahulu di menu Dashboard.");
        setIsGenerating(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      let promptContent: any[] = [];

      if (importFile.name.endsWith('.pdf')) {
        // Handle PDF
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(importFile);
        });

        promptContent = [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'application/pdf',
            },
          },
          {
            text: `Ekstrak data Alur Tujuan Pembelajaran (ATP) dari dokumen PDF ini untuk mata pelajaran ${subject.name}. 
            Petakan ke dalam format JSON Array murni tanpa markdown block.
            Setiap objek harus memiliki properti:
            - kodeTp (string, contoh: "1.1")
            - unitTopik (string, materi pokok)
            - jejakTurunanCp (string, alur tujuan pembelajaran / capaian pembelajaran)
            - rumusanTp (string, tujuan pembelajaran)
            - asesmen (string, jenis asesmen)
            - jp (string, alokasi waktu angka saja)
            
            PENTING: Jangan mengubah data, cukup petakan saja sesuai dengan tabel yang ada di dokumen.`,
          },
        ];
      } else if (importFile.name.endsWith('.xls') || importFile.name.endsWith('.xlsx')) {
        // Handle Excel
        const arrayBuffer = await importFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let csvData = '';
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          csvData += `Sheet: ${sheetName}\n`;
          csvData += XLSX.utils.sheet_to_csv(worksheet);
          csvData += '\n\n';
        });

        promptContent = [
          {
            text: `Berikut adalah data Alur Tujuan Pembelajaran (ATP) dalam format CSV untuk mata pelajaran ${subject.name}:\n\n${csvData}\n\n
            Ekstrak data ATP dari teks tersebut. Petakan ke dalam format JSON Array murni tanpa markdown block.
            Setiap objek harus memiliki properti:
            - kodeTp (string, contoh: "1.1")
            - unitTopik (string, materi pokok)
            - jejakTurunanCp (string, alur tujuan pembelajaran / capaian pembelajaran)
            - rumusanTp (string, tujuan pembelajaran)
            - asesmen (string, jenis asesmen)
            - jp (string, alokasi waktu angka saja)
            
            PENTING: Jangan mengubah data, cukup petakan saja sesuai dengan tabel yang ada.`,
          },
        ];
      } else {
        throw new Error('Format file tidak didukung. Gunakan PDF atau Excel (.xls, .xlsx).');
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: promptContent },
      });
      
      const text = response.text;
      
      if (text) {
        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(jsonStr);

        newItems = parsedData.map((item: any, index: number) => ({
          id: (Date.now() + index).toString(),
          subjectId: importSubjectId,
          kodeTp: item.kodeTp || '',
          unitTopik: item.unitTopik || '',
          jejakTurunanCp: item.jejakTurunanCp || '',
          rumusanTp: item.rumusanTp || '',
          asesmen: item.asesmen || '',
          jp: item.jp ? String(item.jp) : ''
        }));
      }

      // Save to storage
      const storageKey = getStorageKey(`guru_atp_${importSubjectId}`);
      const existingDataStr = localStorage.getItem(storageKey);
      let existingData = existingDataStr ? JSON.parse(existingDataStr) : [];
      const newData = [...existingData, ...newItems];
      localStorage.setItem(storageKey, JSON.stringify(newData));

      // If importing to current subject, update state
      if (importSubjectId === selectedSubjectId) {
        setAtpData(newData);
      } else {
        // Ask to switch
        if (confirm(`Data berhasil diimport ke ${subject.name}. Buka mata pelajaran tersebut?`)) {
          setSelectedSubjectId(importSubjectId);
        }
      }

      setIsImportModalOpen(false);
      setImportSubjectId('');
      setImportFile(null);
      alert(`Berhasil mengimport ${newItems.length} data ATP!`);
    } catch (error) {
      console.error("Error generating ATP:", error);
      alert("Gagal mengimport ATP. Pastikan format file sesuai dan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    const newData = atpData.filter(item => item.id !== id);
    setAtpData(newData);
    localStorage.setItem(getStorageKey(`guru_atp_${selectedSubjectId}`), JSON.stringify(newData));
    
    if (selectedItems.has(id)) {
      const newSelected = new Set(selectedItems);
      newSelected.delete(id);
      setSelectedItems(newSelected);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alur Tujuan Pembelajaran (ATP)</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola ATP untuk setiap mata pelajaran</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-sidebar-dark dark:border-border-dark dark:text-white"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkDelete}
            disabled={selectedItems.size === 0}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
              selectedItems.size > 0 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined">delete</span>
            {selectedItems.size > 0 ? `Hapus (${selectedItems.size})` : 'Hapus'}
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            Import Pintar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-700"
          >
            <span className="material-symbols-outlined">add</span>
            Tambah ATP
          </button>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm dark:bg-sidebar-dark dark:border-border-dark">
        <div className="overflow-x-auto border border-gray-200 rounded-xl dark:border-border-dark">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-4 py-4 w-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={atpData.length > 0 && selectedItems.size === atpData.length}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-medium">Kode TP</th>
                <th scope="col" className="px-6 py-4 font-medium">Unit / Topik</th>
                <th scope="col" className="px-6 py-4 font-medium">Jejak Turunan CP</th>
                <th scope="col" className="px-6 py-4 font-medium">Rumusan TP</th>
                <th scope="col" className="px-6 py-4 font-medium">Asesmen</th>
                <th scope="col" className="px-6 py-4 font-medium">JP</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {atpData.length > 0 ? (
                atpData.map((item) => (
                  <tr key={item.id} className={`bg-white border-b dark:bg-sidebar-dark dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedItems.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <td className="px-4 py-4 w-4">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.kodeTp}</td>
                    <td className="px-6 py-4">{item.unitTopik}</td>
                    <td className="px-6 py-4">{item.jejakTurunanCp}</td>
                    <td className="px-6 py-4">{item.rumusanTp}</td>
                    <td className="px-6 py-4">{item.asesmen}</td>
                    <td className="px-6 py-4">{item.jp} JP</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span className="text-xl material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Belum ada data ATP untuk mata pelajaran ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Import Pintar */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 material-symbols-outlined">auto_awesome</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import Pintar ATP</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 mb-4 text-sm text-blue-800 bg-blue-50 rounded-lg dark:bg-blue-900/30 dark:text-blue-300">
                Fitur ini akan mengekstrak data ATP dari file yang Anda upload (PDF/Excel) dan memetakannya secara otomatis ke dalam sistem.
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Mata Pelajaran</label>
                <select
                  value={importSubjectId}
                  onChange={(e) => setImportSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Upload File (Excel/PDF)</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.pdf"
                  onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format yang didukung: .xlsx, .xls, .pdf (Maks. 5MB)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleSmartImport}
                disabled={!importSubjectId || isGenerating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                    Memproses...
                  </>
                ) : (
                  'Proses Import'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah ATP</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Kode TP</label>
                <input
                  type="text"
                  value={formData.kodeTp}
                  onChange={(e) => setFormData({ ...formData, kodeTp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Contoh: 1.1"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Unit / Topik</label>
                <input
                  type="text"
                  value={formData.unitTopik}
                  onChange={(e) => setFormData({ ...formData, unitTopik: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Contoh: Bilangan Bulat"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Jejak Turunan CP</label>
                <textarea
                  value={formData.jejakTurunanCp}
                  onChange={(e) => setFormData({ ...formData, jejakTurunanCp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Deskripsi Jejak Turunan CP"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Rumusan TP</label>
                <textarea
                  value={formData.rumusanTp}
                  onChange={(e) => setFormData({ ...formData, rumusanTp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Deskripsi Rumusan TP"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Asesmen</label>
                  <input
                    type="text"
                    value={formData.asesmen}
                    onChange={(e) => setFormData({ ...formData, asesmen: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Contoh: Tes Tulis"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">JP</label>
                  <input
                    type="number"
                    value={formData.jp}
                    onChange={(e) => setFormData({ ...formData, jp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Contoh: 2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.kodeTp || !formData.rumusanTp}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlurTujuanPembelajaran;
